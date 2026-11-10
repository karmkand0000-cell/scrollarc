<?php
/* ScrollArc Digital — site settings. Edit the values on the right; nothing else needs changing. */
return [
    // Every new lead is emailed here. Leave '' to switch email off (leads are still saved in the dashboard).
    'notify_email' => 'scrollarcdigital@gmail.com',
    // The "from" address for those emails. Use an address on your own domain, e.g. no-reply@yourdomain.com
    'from_email'   => 'no-reply@scrollarcdigital.in',
    'site_name'    => 'ScrollArc Digital',
    'timezone'     => 'Asia/Kolkata',
    // Where leads are stored. This folder is blocked from the web by data/.htaccess.
    'data_dir'     => __DIR__ . '/../data',
    // Spam guard: how many form submissions one visitor may send in 10 minutes.
    'rate_limit'   => 6,
];
