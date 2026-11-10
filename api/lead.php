<?php
/* Saves one enquiry from any form on the site, then emails a short notice. */
declare(strict_types=1);
require __DIR__ . '/lib.php';

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') sa_json_out(['ok' => false, 'error' => 'POST only'], 405);
$in = sa_body();
if (sa_clean($in['hp'] ?? '') !== '') sa_json_out(['ok' => true]);            // honeypot: bots fill it, people never see it
if (!sa_rate_ok('lead', (int)(sa_cfg()['rate_limit'] ?? 6))) sa_json_out(['ok' => false, 'error' => 'Too many requests. Please try again in a few minutes.'], 429);

$lead = [
    'id'       => bin2hex(random_bytes(6)),
    'time'     => date('c'),
    'status'   => 'new',
    'source'   => sa_clean($in['source'] ?? 'contact', 40),
    'name'     => sa_clean($in['name'] ?? '', 120),
    'phone'    => preg_replace('/[^0-9+ ]/', '', sa_clean($in['phone'] ?? '', 20)),
    'email'    => sa_clean($in['email'] ?? '', 160),
    'business' => sa_clean($in['business'] ?? '', 160),
    'city'     => sa_clean($in['city'] ?? '', 80),
    'type'     => sa_clean($in['type'] ?? '', 120),
    'service'  => sa_clean($in['service'] ?? '', 120),
    'link'     => sa_clean($in['link'] ?? '', 300),
    'when'     => sa_clean($in['when'] ?? '', 80),
    'msg'      => sa_clean($in['msg'] ?? '', 1500),
    'page'     => sa_clean($in['page'] ?? '', 200),
    'lang'     => sa_clean($in['lang'] ?? '', 5),
    'notes'    => '',
    'value'    => 0,
    'followup' => '',
    'plan'     => '',
];
$lead['activity'] = [['t' => $lead['time'], 'kind' => 'created', 'text' => 'Came in from the website (' . $lead['source'] . ')']];
if ($lead['name'] === '' && $lead['phone'] === '' && $lead['email'] === '') sa_json_out(['ok' => false, 'error' => 'Please add your name and a phone number or email.'], 422);
if ($lead['email'] !== '' && !filter_var($lead['email'], FILTER_VALIDATE_EMAIL)) $lead['email'] = '';

sa_update('leads.json', function (&$all) use ($lead) { $all[] = $lead; return true; });

$cfg = sa_cfg();
if (!empty($cfg['notify_email'])) {
    $lines = [];
    foreach (['name','phone','email','business','city','type','service','when','link','msg','source','page'] as $k) if ($lead[$k] !== '') $lines[] = ucfirst($k) . ': ' . $lead[$k];
    $from = $cfg['from_email'] ?: ('no-reply@' . preg_replace('/^www\./', '', $_SERVER['HTTP_HOST'] ?? 'localhost'));
    $subject = 'New enquiry: ' . ($lead['name'] ?: $lead['phone'] ?: 'website');
    $headers = 'From: ' . $cfg['site_name'] . ' <' . $from . ">\r\nContent-Type: text/plain; charset=utf-8";
    if ($lead['email'] !== '') $headers .= "\r\nReply-To: " . $lead['email'];
    @mail($cfg['notify_email'], '=?UTF-8?B?' . base64_encode($subject) . '?=', implode("\n", $lines), $headers);
}
sa_json_out(['ok' => true]);
