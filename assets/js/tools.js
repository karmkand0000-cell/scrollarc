/* ScrollArc Digital — free tools: ad calculator, presence scorecard, UTM builder, WhatsApp link, plan finder, call booking */
(function(){
  var L = window.SA_L || function(en){ return en; };
  var BASE = window.SA_BASE || '';
  function $(id){ return document.getElementById(id); }
  function inr(n){ if (!isFinite(n)) return '—'; return '₹' + Math.round(n).toLocaleString('en-IN'); }
  function num(id){ var v = parseFloat($(id).value); return isFinite(v) && v >= 0 ? v : 0; }
  // keep a slider and its number box in step
  document.querySelectorAll('.inrow').forEach(function(row){
    var r = row.querySelector('input[type=range]'), n = row.querySelector('input[type=number]'); if (!r || !n) return;
    r.addEventListener('input', function(){ n.value = r.value; n.dispatchEvent(new Event('input', {bubbles:true})); });
    n.addEventListener('input', function(){ r.value = n.value; });
  });

  /* ---------- 1. Ad budget calculator ---------- */
  var roi = $('roiForm');
  if (roi) {
    var calc = function(){
      var budget = num('r_budget'), cpl = num('r_cpl'), conv = num('r_conv') / 100, value = num('r_value'), fee = num('r_fee');
      var leads = cpl > 0 ? budget / cpl : 0, cust = leads * conv, rev = cust * value, cost = budget + fee, profit = rev - cost;
      var roas = budget > 0 ? rev / budget : 0, beCpl = cost > 0 && conv > 0 ? (value * conv * budget) / cost : 0;
      $('o_leads').textContent = Math.round(leads).toLocaleString('en-IN');
      $('o_cust').textContent = (Math.round(cust * 10) / 10).toLocaleString('en-IN');
      $('o_rev').textContent = inr(rev);
      $('o_cost').textContent = inr(cost);
      $('o_roas').textContent = (Math.round(roas * 10) / 10) + 'x';
      $('o_be').textContent = beCpl > 0 ? inr(beCpl) : '—';
      var p = $('o_profit'); p.textContent = (profit < 0 ? '−' : '') + inr(Math.abs(profit));
      p.className = 'big ' + (profit >= 0 ? 'good-t' : 'bad-t');
      $('o_verdict').innerHTML = profit >= 0
        ? L('On these numbers the ads pay for themselves. The number to protect is your cost per lead.', 'इन आँकड़ों पर ऐड्स अपना ख़र्च निकाल रहे हैं। जिस आँकड़े पर नज़र रखनी है, वह है कॉस्ट-पर-लीड।')
        : L('On these numbers you lose money. Lower the cost per lead, raise the conversion rate, or sell a higher-value product first.', 'इन आँकड़ों पर घाटा है। पहले कॉस्ट-पर-लीड घटाएँ, कन्वर्ज़न बढ़ाएँ या ज़्यादा वैल्यू वाला प्रोडक्ट बेचें।');
      var a = $('o_wa'); if (a) a.href = window.SA_waUrl('Hi ScrollArc Digital, I used your ad calculator.\nMonthly ad budget: ' + inr(budget) + '\nExpected cost per lead: ' + inr(cpl) + '\nLead to customer: ' + (conv * 100) + '%\nValue per customer: ' + inr(value) + '\nResult: ' + Math.round(leads) + ' leads, ' + inr(rev) + ' revenue.\nPlease check if these numbers are realistic for my business.');
    };
    roi.addEventListener('input', calc); calc();
  }

  /* ---------- 2. Digital presence scorecard ---------- */
  var sc = $('scoreForm');
  if (sc) {
    var groups = [].slice.call(sc.querySelectorAll('.qgroup'));
    var score = function(){
      var total = 0, max = 0, fixes = [], bars = '';
      groups.forEach(function(g){
        var qs = g.querySelectorAll('.q'), got = 0;
        qs.forEach(function(q){
          var yes = q.querySelector('input[value="1"]').checked; max++;
          if (yes) { got++; total++; } else if (fixes.length < 3) fixes.push(q.getAttribute('data-fix-en') + '|' + q.getAttribute('data-fix-hi'));
        });
        g.querySelector('h3 small').textContent = got + ' / ' + qs.length;
        bars += '<div class="b"><span><span>' + g.querySelector('h3 .gl').innerHTML + '</span><b>' + got + '/' + qs.length + '</b></span><i style="--w:' + Math.round(got / qs.length * 100) + '%"></i></div>';
      });
      $('s_total').textContent = total + ' / ' + max;
      $('s_bars').innerHTML = bars;
      var pct = total / max;
      $('s_verdict').innerHTML = pct >= .8 ? L('Strong base. Your next gains come from ads and follow-up speed.', 'मज़बूत आधार। अगला फ़ायदा ऐड्स और तेज़ फ़ॉलो-अप से मिलेगा।')
        : pct >= .5 ? L('Decent, with clear gaps. Fix the three points below first.', 'ठीक-ठाक, पर साफ़ कमियाँ हैं। पहले नीचे के तीन पॉइंट ठीक करें।')
        : L('Customers are probably struggling to find or trust you online. Start with the basics below.', 'शायद ग्राहक आपको ऑनलाइन ढूँढ या भरोसा नहीं कर पा रहे। नीचे की बुनियादी चीज़ों से शुरू करें।');
      $('s_fixes').innerHTML = fixes.length ? fixes.map(function(f){ var p = f.split('|'); return '<li>' + L(p[0], p[1]) + '</li>'; }).join('') : '<li>' + L('Nothing urgent. Ask us for an advanced audit.', 'कुछ ज़रूरी नहीं। हमसे एडवांस ऑडिट माँगें।') + '</li>';
      var a = $('s_wa'); if (a) a.href = window.SA_waUrl('Hi ScrollArc Digital, my digital presence score is ' + total + '/' + max + '. Please help me fix the gaps.');
    };
    sc.addEventListener('change', score); score();
  }

  /* ---------- 3. UTM link builder ---------- */
  var utm = $('utmForm');
  if (utm) {
    var build = function(){
      var url = $('u_url').value.trim(), out = $('u_out');
      if (!url) { out.textContent = '—'; return; }
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
      var parts = [];
      [['u_source','utm_source'],['u_medium','utm_medium'],['u_campaign','utm_campaign'],['u_content','utm_content']].forEach(function(p){
        var v = $(p[0]).value.trim().toLowerCase().replace(/\s+/g, '_'); if (v) parts.push(p[1] + '=' + encodeURIComponent(v));
      });
      var hash = '', hi = url.indexOf('#'); if (hi > -1) { hash = url.slice(hi); url = url.slice(0, hi); }
      out.textContent = parts.length ? url + (url.indexOf('?') > -1 ? '&' : '?') + parts.join('&') + hash : url + hash;
    };
    utm.addEventListener('input', build); build();
  }

  /* ---------- 4. WhatsApp click-to-chat link ---------- */
  var wl = $('waForm');
  if (wl) {
    var mk = function(){
      var ph = $('w_phone').value.replace(/\D/g, ''), msg = $('w_msg').value.trim(), out = $('w_out'), test = $('w_test');
      if (ph.length === 10) ph = '91' + ph;
      if (ph.length < 11) { out.textContent = '—'; test.hidden = true; return; }
      var link = 'https://wa.me/' + ph + (msg ? '?text=' + encodeURIComponent(msg) : '');
      out.textContent = link; test.href = link; test.hidden = false;
    };
    wl.addEventListener('input', mk); mk();
  }

  /* ---------- 5. Plan finder ---------- */
  var pf = $('planForm');
  if (pf) {
    var S = {
      maps:  ['services/maps.html',  'Google Maps & Local Ranking', 'Google Maps और लोकल रैंकिंग', '₹7,999', '/mo', '/माह'],
      smm:   ['services/smm.html',   'Social Media Management', 'सोशल मीडिया मैनेजमेंट', '₹9,999', '/mo', '/माह'],
      meta:  ['services/meta.html',  'Meta Ads (Facebook & Instagram)', 'Meta Ads (Facebook और Instagram)', '₹9,999', '/mo', '/माह'],
      gads:  ['services/gads.html',  'Google Ads', 'Google Ads', '₹12,999', '/mo', '/माह'],
      seo:   ['services/seo.html',   'SEO & AI Search Visibility', 'SEO और AI सर्च विज़िबिलिटी', '₹11,999', '/mo', '/माह'],
      web:   ['services/web.html',   'Website or Online Store', 'वेबसाइट या ऑनलाइन स्टोर', '₹9,999', ' one-time', ' वन-टाइम'],
      leads: ['services/leads.html', 'Lead Generation & Conversion System', 'लीड जनरेशन और कन्वर्ज़न सिस्टम', '₹9,999', ' one-time', ' वन-टाइम'],
      orm:   ['services/orm.html',   'Online Reputation Management', 'ऑनलाइन रेप्युटेशन मैनेजमेंट', '₹6,999', '/mo', '/माह'],
      yt:    ['services/yt.html',    'YouTube Channel Growth', 'YouTube चैनल ग्रोथ', '₹14,999', '/mo', '/माह'],
      brand: ['services/brand.html', 'Branding & Identity', 'ब्रांडिंग और आइडेंटिटी', '₹4,999', ' one-time', ' वन-टाइम']
    };
    var pickPlan = function(){
      var v = function(n){ var el = pf.querySelector('input[name="' + n + '"]:checked'); return el ? el.value : ''; };
      var goal = v('goal'), reach = v('reach'), have = v('have'), budget = v('budget'), list = [];
      if (have === 'nothing') list.push('brand');
      if (have === 'nothing' || have === 'social') { if (goal === 'sales' || goal === 'leads') list.push('web'); }
      if (goal === 'walkins') { list.push('maps'); list.push(reach === 'local' ? 'smm' : 'meta'); }
      else if (goal === 'leads') { list.push('meta'); list.push('leads'); if (reach !== 'local') list.push('gads'); }
      else if (goal === 'sales') { list.push('meta'); list.push('gads'); }
      else if (goal === 'brand') { list.push('smm'); list.push('yt'); }
      else if (goal === 'trust') { list.push('orm'); list.push('maps'); list.push('seo'); }
      if (reach === 'local' && list.indexOf('maps') < 0) list.push('maps');
      var seen = {}; list = list.filter(function(k){ if (seen[k]) return false; seen[k] = 1; return true; });
      var cap = budget === 'low' ? 2 : budget === 'mid' ? 3 : 4; list = list.slice(0, cap);
      var out = $('p_out');
      if (!goal || !reach || !have || !budget) { out.innerHTML = '<p class="fine">' + L('Answer all four questions to see your starting plan.', 'अपना शुरुआती प्लान देखने के लिए चारों सवालों के जवाब दें।') + '</p>'; return; }
      out.innerHTML = list.map(function(k, i){ var s = S[k];
        return '<a class="rec" href="' + BASE + s[0] + '"><span>' + L(s[1], s[2]) + '<small>' + (i === 0 ? L('Start here', 'यहाँ से शुरू करें') : L('Add next', 'इसके बाद जोड़ें')) + '</small></span><b>' + L('from ' + s[3] + s[4], s[3] + s[5] + ' से') + '</b></a>';
      }).join('');
      var a = $('p_wa'); if (a) a.href = window.SA_waUrl('Hi ScrollArc Digital, your plan finder suggested: ' + list.map(function(k){ return S[k][1]; }).join(', ') + '. Please tell me the right plan and price for my business.');
    };
    pf.addEventListener('change', pickPlan); pickPlan();
  }

  /* ---------- 6. Book a call: day + time picker ---------- */
  var bk = $('bookForm');
  if (bk) {
    var dayBox = $('b_days'), slotBox = $('b_slots'), hidden = $('b_when'), sel = {d:null, t:null};
    var dn = {en:['Sun','Mon','Tue','Wed','Thu','Fri','Sat'], hi:['रवि','सोम','मंगल','बुध','गुरु','शुक्र','शनि']};
    var mn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var d = new Date(), days = [];
    while (days.length < 10) { d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1); if (d.getDay() !== 0) days.push(new Date(d)); }  // Mon–Sat only
    dayBox.innerHTML = days.map(function(x, i){
      return '<button type="button" class="pick" aria-pressed="false" data-d="' + i + '"><small>' + L(dn.en[x.getDay()], dn.hi[x.getDay()]) + '</small>' + x.getDate() + ' ' + mn[x.getMonth()] + '</button>';
    }).join('');
    var slots = []; for (var h = 10; h < 19; h++) { slots.push(h + ':00'); slots.push(h + ':30'); }   // 10 AM – 7 PM
    function label(t){ var p = t.split(':'), hh = +p[0]; return (hh > 12 ? hh - 12 : hh) + ':' + p[1] + (hh >= 12 ? ' PM' : ' AM'); }
    slotBox.innerHTML = slots.map(function(t){ return '<button type="button" class="pick" aria-pressed="false" data-t="' + t + '">' + label(t) + '</button>'; }).join('');
    function sync(){
      if (sel.d === null || !sel.t) { hidden.value = ''; return; }
      var x = days[sel.d]; hidden.value = dn.en[x.getDay()] + ' ' + x.getDate() + ' ' + mn[x.getMonth()] + ' ' + x.getFullYear() + ', ' + label(sel.t) + ' IST';
      $('b_pick').textContent = hidden.value;
    }
    bk.addEventListener('click', function(e){
      var b = e.target.closest('.pick'); if (!b) return;
      var box = b.parentNode; box.querySelectorAll('.pick').forEach(function(p){ p.setAttribute('aria-pressed', 'false'); });
      b.setAttribute('aria-pressed', 'true');
      if (b.hasAttribute('data-d')) sel.d = +b.getAttribute('data-d'); else sel.t = b.getAttribute('data-t');
      sync();
    });
    bk.addEventListener('submit', function(e){
      if (!hidden.value) { e.preventDefault(); e.stopImmediatePropagation(); $('b_need').hidden = false; }
      else $('b_need').hidden = true;
    }, true);
  }
})();
