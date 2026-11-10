/* ScrollArc Digital — v3 site extras: lead saving, forms, mobile bar, consent, testimonials, copy buttons */
(function(){
  var html = document.documentElement;
  var SITE = window.SA_SITE || {};
  var CFG = window.SA_CONFIG || {};
  // site root, worked out from this script's own address (so it works in sub-folders too)
  var me = document.currentScript || document.querySelector('script[src*="extras.js"]');
  var BASE = me ? me.src.replace(/assets\/js\/extras\.js.*$/, '') : '';
  window.SA_BASE = BASE;
  function lang(){ return html.getAttribute('data-lang') === 'hi' ? 'hi' : 'en'; }
  function L(en, hi){ return '<span data-l="en">' + en + '</span><span data-l="hi">' + hi + '</span>'; }
  window.SA_L = L;
  function track(n, p){ if (window.gtag) gtag('event', n, p || {}); }

  /* ---- save a lead to the site's own dashboard (api/lead.php). Never blocks the visitor. ---- */
  window.SA_saveLead = function(payload){
    payload = payload || {};
    payload.page = location.pathname;
    payload.lang = lang();
    if (CFG.sheet) { try { fetch(CFG.sheet, {method:'POST', mode:'no-cors', headers:{'Content-Type':'text/plain'}, body: JSON.stringify(payload)}); } catch(e){} }
    try {
      return fetch(BASE + 'api/lead.php', {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload), keepalive:true})
        .then(function(r){ return r.ok ? r.json() : {ok:false}; })
        .then(function(j){ return !!(j && j.ok); })
        .catch(function(){ return false; });
    } catch(e){ return Promise.resolve(false); }
  };
  function waUrl(text){ return 'https://wa.me/' + (SITE.wa || '919625004090') + '?text=' + encodeURIComponent(text); }
  window.SA_waUrl = waUrl;

  /* ---- generic lead forms: <form data-lead="source" data-wa-intro="..."> ---- */
  document.querySelectorAll('form[data-lead]').forEach(function(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      if (!form.reportValidity()) return;
      var d = new FormData(form), payload = {source: form.getAttribute('data-lead')}, lines = [form.getAttribute('data-wa-intro') || 'Hi ScrollArc Digital,'];
      d.forEach(function(v, k){
        v = v.toString().trim(); payload[k] = v;
        if (v && k !== 'hp') { var lab = form.querySelector('[name="' + k + '"]'); lines.push(((lab && lab.getAttribute('data-label')) || k) + ': ' + v); }
      });
      var btn = form.querySelector('[type=submit]'); if (btn) btn.disabled = true;
      var done = form.querySelector('.done-panel'), url = waUrl(lines.join('\n'));
      function show(saved){
        if (btn) btn.disabled = false;
        if (!done) return;
        done.hidden = false;
        var st = done.querySelector('[data-save-state]');
        if (st) st.innerHTML = saved ? L('Your request is saved with us.', 'आपकी रिक्वेस्ट हमारे पास सेव हो गई है।') : L('To make sure it reaches us, send it on WhatsApp too.', 'पक्का पहुँचे, इसके लिए इसे WhatsApp पर भी भेज दें।');
        var a = done.querySelector('a[data-wa-send]'); if (a) a.href = url;
        done.scrollIntoView({block:'nearest', behavior:'smooth'});
      }
      track('generate_lead', {form: payload.source});
      window.SA_saveLead(payload).then(show);
    });
  });

  /* ---- copy buttons: <button data-copy="#id"> ---- */
  document.addEventListener('click', function(e){
    var b = e.target.closest && e.target.closest('[data-copy]'); if (!b) return;
    var el = document.querySelector(b.getAttribute('data-copy')); if (!el) return;
    var text = el.textContent.trim(), note = b.parentNode.querySelector('.copied');
    function ok(){ if (note) { note.hidden = false; setTimeout(function(){ note.hidden = true; }, 1800); } }
    function fallback(){ var r = document.createRange(); r.selectNodeContents(el); var s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(ok).catch(fallback); else fallback();
  });

  /* ---- mobile action bar ---- */
  if (!document.querySelector('.mbar') && !/\/admin\//.test(location.pathname)) {
    var ic = {
      call: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3h4l2 5-2.5 1.5a11 11 0 0 0 6 6L16 13l5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z"/></svg>',
      wa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 20.5l1.3-4.2A8.8 8.8 0 1 1 8 19.4z"/><path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.6-2-1-1 1c-1.2-.5-2.4-1.7-2.9-2.9l1-1-1-2z"/></svg>',
      cal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>',
      tool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M8 7h8M8 12h2M12 12h2M16 12h0M8 16h2M12 16h2M16 16h0"/></svg>'
    };
    var bar = document.createElement('nav'); bar.className = 'mbar'; bar.setAttribute('aria-label', 'Quick contact');
    bar.innerHTML =
      '<a href="tel:+' + (SITE.wa || '919625004090') + '">' + ic.call + '<span>' + L('Call', 'कॉल') + '</span></a>' +
      '<a class="hot" data-wa="audit" target="_blank" rel="noopener" href="' + waUrl(lang() === 'hi' ? (SITE.waHi || '') : (SITE.waEn || '')) + '">' + ic.wa + '<span>WhatsApp</span></a>' +
      '<a href="' + BASE + 'book.html">' + ic.cal + '<span>' + L('Book a call', 'कॉल बुक करें') + '</span></a>' +
      '<a href="' + BASE + 'tools/index.html">' + ic.tool + '<span>' + L('Free tools', 'फ़्री टूल') + '</span></a>';
    document.body.appendChild(bar); document.body.classList.add('has-mbar');
  }

  /* ---- cookie consent: only appears when Google Analytics is switched on in main.js ---- */
  (function(){
    if (!CFG.ga4) return;
    var c = null; try { c = localStorage.getItem('sa_consent'); } catch(e){}
    if (c === 'yes' || c === 'no') return;
    var box = document.createElement('div'); box.className = 'consent'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-label', 'Cookies');
    box.innerHTML = '<p>' + L('We use Google Analytics to see which pages help visitors. No ad tracking. OK to count your visit?', 'हम Google Analytics से देखते हैं कि कौन-से पेज काम के हैं। कोई ऐड ट्रैकिंग नहीं। क्या आपकी विज़िट गिन सकते हैं?') +
      ' <a href="' + BASE + 'privacy.html" style="color:inherit">' + L('Privacy policy', 'प्राइवेसी पॉलिसी') + '</a></p>' +
      '<div class="row-btns"><button class="btn btn-amber btn-sm" data-c="yes" type="button">' + L('Yes, that’s fine', 'हाँ, ठीक है') + '</button><button class="btn btn-line btn-sm" data-c="no" type="button">' + L('No thanks', 'नहीं') + '</button></div>';
    box.addEventListener('click', function(e){
      var b = e.target.closest('[data-c]'); if (!b) return;
      try { localStorage.setItem('sa_consent', b.getAttribute('data-c')); } catch(err){}
      box.remove(); if (b.getAttribute('data-c') === 'yes') location.reload();
    });
    document.body.appendChild(box);
  })();

  /* ---- testimonials on the home page: real ones only, added and approved in the dashboard ---- */
  (function(){
    var slot = document.getElementById('saTestimonials'); if (!slot) return;
    function esc(s){ return String(s == null ? '' : s).replace(/[&<>"]/g, function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); }
    fetch(BASE + 'api/testimonials.php').then(function(r){ return r.ok ? r.json() : []; }).then(function(list){
      if (!Array.isArray(list) || !list.length) return;
      slot.querySelector('.tgrid').innerHTML = list.slice(0, 6).map(function(t){
        return '<figure class="tcard" style="margin:0"><blockquote>“' + esc(t.quote) + '”</blockquote><figcaption><cite><b>' + esc(t.name) + '</b>' + esc(t.role) + '</cite></figcaption></figure>';
      }).join('');
      slot.hidden = false;
    }).catch(function(){});
  })();
})();
