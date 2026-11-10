<?php
/* Shared helpers for the lead API and the dashboard. Flat-file storage: no database to set up. */
declare(strict_types=1);

function sa_cfg(): array {
    static $c = null;
    if ($c === null) { $c = require __DIR__ . '/config.php'; date_default_timezone_set($c['timezone'] ?? 'Asia/Kolkata'); }
    return $c;
}
function sa_dir(): string {
    $d = sa_cfg()['data_dir'];
    if (!is_dir($d)) { @mkdir($d, 0750, true); }
    return rtrim($d, '/');
}
function sa_file(string $name): string { return sa_dir() . '/' . basename($name); }

function sa_json_out($data, int $code = 200): void {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function sa_body(): array {
    $raw = file_get_contents('php://input', false, null, 0, 20000);
    $j = json_decode($raw ?: '', true);
    return is_array($j) ? $j : [];
}
function sa_clean($v, int $max = 300): string {
    $v = is_scalar($v) ? (string)$v : '';
    $v = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $v) ?? '';
    return mb_substr(trim($v), 0, $max);
}
function sa_ip(): string { return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0'; }

/* Read a JSON file under a shared lock. */
function sa_read(string $name, $default = []) {
    $f = sa_file($name);
    if (!is_file($f)) return $default;
    $h = fopen($f, 'r'); if (!$h) return $default;
    flock($h, LOCK_SH); $raw = stream_get_contents($h); flock($h, LOCK_UN); fclose($h);
    $j = json_decode($raw ?: '', true);
    return is_array($j) ? $j : $default;
}
/* Read-modify-write a JSON file under an exclusive lock, so two visitors never overwrite each other. */
function sa_update(string $name, callable $fn, $default = []) {
    $f = sa_file($name);
    $h = fopen($f, 'c+'); if (!$h) return null;
    flock($h, LOCK_EX);
    $raw = stream_get_contents($h);
    $data = json_decode($raw ?: '', true); if (!is_array($data)) $data = $default;
    $result = $fn($data);
    ftruncate($h, 0); rewind($h);
    fwrite($h, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT));
    fflush($h); flock($h, LOCK_UN); fclose($h);
    return $result;
}
/* Allow at most $max hits per $window seconds for one key. */
function sa_rate_ok(string $bucket, int $max, int $window = 600): bool {
    $key = hash('sha256', $bucket . '|' . sa_ip());
    return (bool) sa_update('ratelimit.json', function (&$d) use ($key, $max, $window) {
        $now = time();
        foreach ($d as $k => $hits) { $d[$k] = array_values(array_filter($hits, fn($t) => $t > $now - $window)); if (!$d[$k]) unset($d[$k]); }
        $hits = $d[$key] ?? [];
        if (count($hits) >= $max) return false;
        $hits[] = $now; $d[$key] = $hits; return true;
    });
}
