<?php
/* CRM API: sign-in, leads, pipeline, follow-ups, clients, testimonials. Every call except status/login/setup needs a signed-in session. */
declare(strict_types=1);
require __DIR__ . '/../api/lib.php';

session_set_cookie_params(['lifetime' => 0, 'path' => '/', 'httponly' => true, 'samesite' => 'Strict', 'secure' => !empty($_SERVER['HTTPS'])]);
session_name('sa_admin');
session_start();

$action = $_GET['a'] ?? '';
$admin  = sa_read('admin.json', []);
$in     = sa_body();
$authed = !empty($_SESSION['ok']);
$STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost', 'archived'];
// fields the dashboard may edit => max length
$EDITABLE = ['name' => 120, 'phone' => 20, 'email' => 160, 'business' => 160, 'city' => 80, 'type' => 120, 'service' => 120, 'link' => 300, 'msg' => 1500, 'value' => 12, 'followup' => 10, 'plan' => 120];

function need_auth(bool $authed, array $in): void {
    if (!$authed) sa_json_out(['ok' => false, 'error' => 'Please sign in.'], 401);
    if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && !hash_equals($_SESSION['csrf'] ?? '', (string)($in['csrf'] ?? ''))) sa_json_out(['ok' => false, 'error' => 'Session expired. Reload the page.'], 403);
}

switch ($action) {
case 'status':
    sa_json_out(['ok' => true, 'setup' => empty($admin['hash']), 'authed' => $authed, 'csrf' => $_SESSION['csrf'] ?? null]);

case 'setup':   // first visit only: choose the dashboard password
    if (!empty($admin['hash'])) sa_json_out(['ok' => false, 'error' => 'Already set up.'], 403);
    $pw = (string)($in['password'] ?? '');
    if (strlen($pw) < 10) sa_json_out(['ok' => false, 'error' => 'Use at least 10 characters.'], 422);
    sa_update('admin.json', function (&$d) use ($pw) { $d = ['hash' => password_hash($pw, PASSWORD_DEFAULT), 'created' => date('c')]; return true; });
    session_regenerate_id(true); $_SESSION['ok'] = true; $_SESSION['csrf'] = bin2hex(random_bytes(16));
    sa_json_out(['ok' => true, 'csrf' => $_SESSION['csrf']]);

case 'login':
    if (!sa_rate_ok('login', 8, 900)) sa_json_out(['ok' => false, 'error' => 'Too many attempts. Wait 15 minutes.'], 429);
    if (empty($admin['hash']) || !password_verify((string)($in['password'] ?? ''), $admin['hash'])) sa_json_out(['ok' => false, 'error' => 'Wrong password.'], 401);
    session_regenerate_id(true); $_SESSION['ok'] = true; $_SESSION['csrf'] = bin2hex(random_bytes(16));
    sa_json_out(['ok' => true, 'csrf' => $_SESSION['csrf']]);

case 'logout':
    $_SESSION = []; session_destroy(); sa_json_out(['ok' => true]);

case 'password':
    need_auth($authed, $in);
    if (!password_verify((string)($in['current'] ?? ''), $admin['hash'] ?? '')) sa_json_out(['ok' => false, 'error' => 'Current password is wrong.'], 401);
    $pw = (string)($in['password'] ?? '');
    if (strlen($pw) < 10) sa_json_out(['ok' => false, 'error' => 'Use at least 10 characters.'], 422);
    sa_update('admin.json', function (&$d) use ($pw) { $d['hash'] = password_hash($pw, PASSWORD_DEFAULT); return true; });
    sa_json_out(['ok' => true]);

case 'leads':
    need_auth($authed, $in);
    sa_json_out(['ok' => true, 'leads' => array_reverse(sa_read('leads.json')), 'testimonials' => sa_read('testimonials.json')]);

case 'lead_create':   // add a lead by hand: phone call, walk-in, referral
    need_auth($authed, $in);
    $lead = ['id' => bin2hex(random_bytes(6)), 'time' => date('c'), 'status' => 'new', 'source' => sa_clean($in['source'] ?? 'manual', 40) ?: 'manual', 'page' => '', 'lang' => '', 'notes' => '', 'when' => ''];
    foreach ($EDITABLE as $k => $max) $lead[$k] = sa_clean($in[$k] ?? '', $max);
    $lead['value'] = (int)preg_replace('/\D/', '', $lead['value']);
    if ($lead['name'] === '' && $lead['phone'] === '') sa_json_out(['ok' => false, 'error' => 'Add a name or a phone number.'], 422);
    $lead['activity'] = [['t' => date('c'), 'kind' => 'created', 'text' => 'Added by hand']];
    sa_update('leads.json', function (&$all) use ($lead) { $all[] = $lead; return true; });
    sa_json_out(['ok' => true, 'lead' => $lead]);

case 'lead_update':   // edit details, move stage, set a follow-up, log a call. Leads are never deleted; use Archived.
    need_auth($authed, $in);
    $id = sa_clean($in['id'] ?? '', 20);
    $saved = sa_update('leads.json', function (&$all) use ($id, $in, $STATUSES, $EDITABLE) {
        foreach ($all as &$l) if (($l['id'] ?? '') === $id) {
            $l['activity'] = $l['activity'] ?? [];
            $now = date('c');
            $status = sa_clean($in['status'] ?? '', 20);
            if (in_array($status, $STATUSES, true) && $status !== ($l['status'] ?? '')) {
                $l['activity'][] = ['t' => $now, 'kind' => 'stage', 'text' => ($l['status'] ?? 'new') . ' → ' . $status];
                $l['status'] = $status;
                if ($status === 'won' && empty($l['won_at'])) $l['won_at'] = $now;
            }
            foreach ($EDITABLE as $k => $max) if (array_key_exists($k, $in)) {
                $v = sa_clean($in[$k], $max);
                if ($k === 'value') $v = (int)preg_replace('/\D/', '', $v);
                if ($k === 'followup') { if ($v !== '' && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $v)) continue; if ($v !== ($l['followup'] ?? '') && $v !== '') $l['activity'][] = ['t' => $now, 'kind' => 'followup', 'text' => 'Follow-up set for ' . $v]; }
                $l[$k] = $v;
            }
            if (array_key_exists('notes', $in)) $l['notes'] = sa_clean($in['notes'], 2000);
            if (!empty($in['log']) && is_array($in['log'])) {
                $kind = sa_clean($in['log']['kind'] ?? 'note', 12); $text = sa_clean($in['log']['text'] ?? '', 800);
                if (in_array($kind, ['call', 'whatsapp', 'meeting', 'email', 'note'], true) && $text !== '') $l['activity'][] = ['t' => $now, 'kind' => $kind, 'text' => $text];
            }
            if (count($l['activity']) > 200) $l['activity'] = array_slice($l['activity'], -200);
            $l['updated'] = $now;
            return $l;
        }
        return null;
    });
    sa_json_out($saved ? ['ok' => true, 'lead' => $saved] : ['ok' => false, 'error' => 'Lead not found'], $saved ? 200 : 404);

case 'testimonial_save':
    need_auth($authed, $in);
    $t = ['id' => sa_clean($in['id'] ?? '', 20) ?: bin2hex(random_bytes(5)), 'quote' => sa_clean($in['quote'] ?? '', 500), 'name' => sa_clean($in['name'] ?? '', 120), 'role' => sa_clean($in['role'] ?? '', 160), 'approved' => !empty($in['approved'])];
    if ($t['quote'] === '' || $t['name'] === '') sa_json_out(['ok' => false, 'error' => 'Add the quote and the client name.'], 422);
    sa_update('testimonials.json', function (&$all) use ($t) {
        foreach ($all as &$x) if (($x['id'] ?? '') === $t['id']) { $x = $t; return true; }
        $all[] = $t; return true;
    });
    sa_json_out(['ok' => true, 'id' => $t['id']]);

case 'export':
    if (!$authed) { http_response_code(401); exit('Please sign in.'); }
    header('Content-Type: text/csv; charset=utf-8');
    header('Content-Disposition: attachment; filename="scrollarc-leads-' . date('Y-m-d') . '.csv"');
    $cols = ['time','status','source','name','phone','email','business','city','type','service','plan','value','followup','when','link','msg','notes','page'];
    $out = fopen('php://output', 'w'); fwrite($out, "\xEF\xBB\xBF"); fputcsv($out, $cols);
    foreach (sa_read('leads.json') as $l) {
        $row = [];
        foreach ($cols as $c) { $v = (string)($l[$c] ?? ''); if ($c !== 'phone' && $v !== '' && strpbrk($v[0], '=+-@') !== false) $v = "'" . $v; $row[] = $v; }   // stop spreadsheet formula injection
        fputcsv($out, $row);
    }
    exit;

default:
    sa_json_out(['ok' => false, 'error' => 'Unknown action'], 404);
}
