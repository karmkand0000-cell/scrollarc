/* ScrollArc Digital — site script */
(function(){
  var SITE = window.SA_SITE || {};
  var html = document.documentElement;
  // language toggle
  function setLang(l){
    html.setAttribute('data-lang', l); html.setAttribute('lang', l === 'hi' ? 'hi' : 'en');
    try{ localStorage.setItem('sa_lang', l); }catch(e){}
    document.querySelectorAll('.lang').forEach(function(b){ b.textContent = l === 'hi' ? 'English' : 'हिंदी'; b.setAttribute('aria-label', l === 'hi' ? 'Switch to English' : 'हिंदी में देखें'); });
    document.querySelectorAll('[data-wa]').forEach(function(a){ a.href = waLink(a.getAttribute('data-wa') === 'audit' ? null : a.getAttribute('data-wa')); });
  }
  function waLink(msg){
    var l = html.getAttribute('data-lang');
    var text = msg || (l === 'hi' ? SITE.waHi : SITE.waEn);
    return 'https://wa.me/' + SITE.wa + '?text=' + encodeURIComponent(text);
  }
  window.SA_waLink = waLink;
  document.addEventListener('click', function(e){
    var b = e.target.closest('.lang'); if(b){ setLang(html.getAttribute('data-lang') === 'hi' ? 'en' : 'hi'); return; }
    var m = e.target.closest('.menu-btn'); if(m){ var n = document.querySelector('.nav'); var o = n.classList.toggle('open'); m.setAttribute('aria-expanded', o); return; }
  });
  setLang(html.getAttribute('data-lang') || 'en');

  // combo calculator (pricing page)
  var pick = document.getElementById('comboPick');
  if(pick){
    var render = function(){
      var vals = [];
      pick.querySelectorAll('.cb').forEach(function(row){
        var cb = row.querySelector('input'), sel = row.querySelector('select');
        row.classList.toggle('on', cb.checked); sel.disabled = !cb.checked;
        if(cb.checked) vals.push(parseInt(sel.value, 10));
      });
      vals.sort(function(a,b){return b-a;});
      var full = vals.reduce(function(a,b){return a+b;},0);
      var net = vals.reduce(function(a,b,i){return a + (i===0 ? b : Math.round(b*0.9));},0);
      var f = function(n){ return '₹' + n.toLocaleString('en-IN'); };
      document.getElementById('cTotal').textContent = vals.length ? f(net) : '₹0';
      document.getElementById('cSave').textContent = full > net ? f(full - net) : '₹0';
      document.getElementById('cFull').textContent = f(full);
    };
    pick.addEventListener('change', render); render();
  }

  // contact form -> WhatsApp message
  var form = document.getElementById('leadForm');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      var d = new FormData(form), lines = [];
      lines.push('Hi ScrollArc Digital, I want a free audit.');
      [['name','Name'],['business','Business'],['city','City'],['type','Business type'],['service','Interested in'],['link','Page / website'],['msg','Message']].forEach(function(p){
        var v = (d.get(p[0]) || '').toString().trim(); if(v) lines.push(p[1] + ': ' + v);
      });
      var url = 'https://wa.me/' + SITE.wa + '?text=' + encodeURIComponent(lines.join('\n'));
      var out = document.getElementById('formOut');
      out.hidden = false;
      out.querySelector('a').href = url;
      window.open(url, '_blank', 'noopener');
    });
  }
  var y = document.getElementById('yr'); if(y) y.textContent = new Date().getFullYear();

  /* ---------- v2 motion layer ---------- */
  html.classList.add('js');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hover = window.matchMedia && window.matchMedia('(hover: hover)').matches;

  // active nav link
  var here = location.pathname.replace(/index\.html$/, '');
  document.querySelectorAll('.nav a').forEach(function(a){
    var p = new URL(a.href, location.href).pathname.replace(/index\.html$/, '');
    if(here === p || (/\/(services|solutions)\/$/.test(p) && here.indexOf(p) === 0)) a.classList.add('active');
  });

  // progress bar + header state
  var bar = document.createElement('div'); bar.className = 'progress'; document.body.appendChild(bar);
  var hdr = document.querySelector('.hdr'), lastY = 0, ticking = false;
  function onScroll(){
    var sy = window.scrollY, h = document.documentElement.scrollHeight - innerHeight;
    bar.style.setProperty('--p', h > 0 ? (sy / h).toFixed(4) : 0);
    if(hdr){
      hdr.classList.toggle('scrolled', sy > 30);
      var navOpen = document.querySelector('.nav.open');
      hdr.classList.toggle('hide', !navOpen && sy > 400 && sy > lastY + 4);
      if(sy < lastY - 4) hdr.classList.remove('hide');
    }
    lastY = sy; ticking = false;
  }
  window.addEventListener('scroll', function(){ if(!ticking){ requestAnimationFrame(onScroll); ticking = true; } }, {passive:true});
  onScroll();

  // close mobile nav on link click
  document.querySelectorAll('.nav a').forEach(function(a){ a.addEventListener('click', function(){ var n=document.querySelector('.nav'); n.classList.remove('open'); var m=document.querySelector('.menu-btn'); if(m) m.setAttribute('aria-expanded', false); }); });

  // marquee strip
  document.querySelectorAll('.strip .wrap').forEach(function(w){
    if(reduce || w.querySelector('.marquee')) return;
    var inner = w.innerHTML;
    w.innerHTML = '<div class="marquee"><div>' + inner + '</div><div aria-hidden="true">' + inner + '</div></div>';
    w.querySelectorAll('.marquee > div[aria-hidden] a').forEach(function(a){ a.tabIndex = -1; });
    w.parentNode.classList.add('is-marquee');
  });

  // scroll reveal — auto-tag common blocks
  if(!reduce && 'IntersectionObserver' in window){
    var sel = '.sec-h, .grid > *, .tiers > *, .steps > li, .method > li, .work, .show > a, .stats > div, .cta-band, .prom > div, details.faq, .tbl-wrap, .note, .rule, .combo > *, .form, .clist > *, .split2 > *, .checks > li, [data-reveal]';
    var groups = new Map();
    document.querySelectorAll('main ' + sel.split(', ').join(', main ')).forEach(function(el){
      if(el.closest('.hero') || el.closest('.page-hero')) return;
      var parent = el.parentNode, i = groups.get(parent) || 0; groups.set(parent, i + 1);
      el.setAttribute('data-rv', ''); el.style.setProperty('--rd', Math.min(i, 8));
    });
    var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); }, {rootMargin:'0px 0px -8% 0px', threshold:0.08});
    document.querySelectorAll('[data-rv]').forEach(function(el){ io.observe(el); });
  }

  // count-up numbers
  var counters = document.querySelectorAll('[data-count]');
  if(counters.length && 'IntersectionObserver' in window){
    var co = new IntersectionObserver(function(es){ es.forEach(function(e){
      if(!e.isIntersecting) return; co.unobserve(e.target);
      var el = e.target, to = parseFloat(el.getAttribute('data-count')), t0 = null;
      if(reduce){ el.textContent = to; return; }
      function step(t){ if(!t0) t0 = t; var k = Math.min((t - t0) / 1400, 1); k = 1 - Math.pow(1 - k, 4); el.textContent = Math.round(to * k); if(k < 1) requestAnimationFrame(step); }
      requestAnimationFrame(step);
    }); }, {threshold:.5});
    counters.forEach(function(c){ c.textContent = '0'; co.observe(c); });
  }

  if(hover && !reduce){
    // spotlight on cards
    document.addEventListener('pointermove', function(e){
      var c = e.target.closest && e.target.closest('.card');
      if(c){ var r = c.getBoundingClientRect(); c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px'); }
    }, {passive:true});
    // magnetic primary buttons
    document.querySelectorAll('.btn-amber').forEach(function(b){
      b.addEventListener('pointermove', function(e){ var r = b.getBoundingClientRect(); b.style.setProperty('--bx', ((e.clientX - r.left - r.width/2) * .18) + 'px'); b.style.setProperty('--by', ((e.clientY - r.top - r.height/2) * .25) + 'px'); });
      b.addEventListener('pointerleave', function(){ b.style.setProperty('--bx', '0px'); b.style.setProperty('--by', '0px'); });
    });
    // cursor glow inside dark heroes
    var hero = document.querySelector('.hero, .page-hero');
    if(hero){
      var g = document.createElement('div'); g.className = 'cursor-glow'; g.style.opacity = 0; document.body.appendChild(g);
      hero.addEventListener('pointermove', function(e){ g.style.opacity = 1; g.style.setProperty('--cx', e.clientX + 'px'); g.style.setProperty('--cy', e.clientY + 'px'); });
      hero.addEventListener('pointerleave', function(){ g.style.opacity = 0; });
    }
    // phone tilt parallax
    var stage = document.querySelector('.stage'), phone = stage && stage.querySelector('.phone');
    if(stage && phone){
      stage.addEventListener('pointermove', function(e){ var r = stage.getBoundingClientRect(); var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5; phone.style.transform = 'rotateY(' + (-10 + x * 16) + 'deg) rotateX(' + (4 - y * 12) + 'deg)'; });
      stage.addEventListener('pointerleave', function(){ phone.style.transform = ''; });
    }
  }
})();
