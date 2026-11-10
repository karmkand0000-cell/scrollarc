# ScrollArc Digital — Hostinger par lagane ka tareeka (v3)

Is zip me poori website hai: purane 34 pages + naye pages (Free tools, Resources, Book a call, Process, policies) + PHP backend + CRM dashboard.

## 1. Upload (10 minute)

1. Hostinger hPanel → **Websites → Add website** → apna domain chuno → "Empty PHP/HTML website".
2. **File Manager → public_html** kholo. Is zip ki **saari files** (folder ke andar ki, folder nahi) wahan upload karke extract karo. `.htaccess` bhi aani chahiye (hidden file hai).
3. hPanel → **SSL** on karo. PHP version 8.1 ya upar rakho.

## 2. CRM ka password

`https://aapka-domain/admin/` kholo. Pehli baar wo password banane ko kahega (10+ characters). Uske baad wahi login hai.
Leads `data/leads.json` me save hoti hain; ye folder browser se band hai. Har hafte dashboard se **Download CSV** karke backup rakho.

## 3. Settings (do files)

- `api/config.php` → `notify_email` (nayi lead ka email kahan aaye) aur `from_email` (apne domain ka address, jaise `no-reply@aapka-domain.com`).
- `assets/js/main.js` ki pehli lines → `ga4` (Google Analytics ID) aur `sheet` (Google Sheet copy, optional). GA4 ID daalne par cookie banner apne aap dikhega.

## 4. Domain badalna

Pages ke SEO tags me abhi GitHub ka pata hai (`https://karmkand0000-cell.github.io/scrollarc/`). Domain tay hone par sabhi `.html`, `sitemap.xml` aur `robots.txt` me ise apne domain se **find & replace** karo (ya Claude se kehna, wo kar dega).

## 5. Live karne se pehle padh lo

- `privacy.html`, `terms.html`, `refund.html` aur `process.html` par **"Draft for the owner to review"** ka label hai. Ye drafts hain: refund ki sharten, 14-din ki timeline, 24-mahine data rakhna, New Delhi jurisdiction — sab aapke business ke faisle hain. Padhkar badlo, ho sake to kisi vakil ko dikhao, phir har page se `<p><span class="draft-flag">…</span></p>` wali line hata do.
- Testimonials: site par koi nakli review nahi hai. Dashboard → Testimonials me asli client ka quote (unki ijazat se) daaloge tabhi home page par section dikhega.
- `education/` folder (Education For Everyone portal) jaisa tha waisa hi rakha gaya hai.

## Naya kya hai

| Cheez | Kahan |
|---|---|
| 5 free tools (ad calculator, scorecard, plan finder, WhatsApp link, UTM builder) | `tools/` |
| Call booking (din + samay chuno) | `book.html` |
| 4 guides, Hindi + English | `resources/` |
| Process, Privacy, Terms, Refund pages | root |
| Lead save + email alert + spam guard | `api/` |
| CRM: overview with charts, pipeline board (drag karke stage badlo), leads list, follow-up reminders, clients aur monthly billing, har lead ki history, hath se lead jodna, CSV, testimonials | `admin/` |
| Mobile par neeche Call / WhatsApp / Book / Tools bar | `assets/js/extras.js` |
