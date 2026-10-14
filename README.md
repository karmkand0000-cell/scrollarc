# ScrollArc Digital — Website

Live at **https://www.scrollarcdigital.in** (GitHub Pages, custom domain from Hostinger).

Static, bilingual (English / हिंदी) agency website. No build step — GitHub Pages serves these files directly.

**34 pages:** Home · Services (12 service pages + Content Studio) · Solutions (12 client types) · Pricing (with combo calculator) · Our work · About · FAQ · Contact (form that opens WhatsApp) · 404.

Email: scrollarcdigital@gmail.com · Phone and WhatsApp: +91 96250 04090

## Settings (one file)

Open `assets/js/main.js` — at the top:

```js
var SA_CONFIG = { ga4: '', sheet: '' };
```

- `ga4` — your Google Analytics 4 Measurement ID (`G-XXXXXXX`). Turns on visitor tracking plus
  events for WhatsApp clicks, call clicks, email clicks and form leads.
- `sheet` — a Google Apps Script web-app URL. Every contact-form submission is saved to a Google
  Sheet *before* WhatsApp opens, so no lead is lost.

### Free Google Sheet lead capture (5 min)

1. Create a Google Sheet → **Extensions → Apps Script** → paste:

```js
function doPost(e) {
  var sh = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
  var d = JSON.parse(e.postData.contents);
  var cols = ['time','name','business','city','type','service','link','msg','page'];
  if (sh.getLastRow() === 0) sh.appendRow(cols);
  sh.appendRow(cols.map(function(c){ return d[c] || ''; }));
  return ContentService.createTextOutput('ok');
}
```

2. **Deploy → New deployment → Web app** → Execute as: *Me* · Who has access: *Anyone* → Deploy.
3. Copy the web-app URL into `sheet: '...'` in `main.js`.

## After the domain resolves

- Settings → Pages → tick **Enforce HTTPS**.
- Google Search Console → add `https://www.scrollarcdigital.in` → verify → submit `sitemap.xml`.
- Put the link in Instagram bio, WhatsApp Business profile and Google Business Profile.

## Still to confirm

- City in footer/Contact. Add social media links once the handles are created.
- Working hours: Mon–Sat, 10 AM – 7 PM.
