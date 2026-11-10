<?php
/* Public list of client testimonials that were approved in the dashboard. Empty until you add real ones. */
declare(strict_types=1);
require __DIR__ . '/lib.php';
$out = [];
foreach (sa_read('testimonials.json') as $t) {
    if (!empty($t['approved'])) $out[] = ['quote' => $t['quote'] ?? '', 'name' => $t['name'] ?? '', 'role' => $t['role'] ?? ''];
}
sa_json_out($out);
