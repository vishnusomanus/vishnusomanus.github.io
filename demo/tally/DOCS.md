# Tally documentation

## Overview

Tally is a marketing website template for a SaaS or fintech product: invoicing, expenses and simple
bookkeeping software for freelancers and small studios. The fictional company is Tally Software, Inc., based
on Ionia Avenue in Grand Rapids, Michigan, so prices are in US dollars, exclude sales tax, and the copy uses
American spelling. Times are Eastern (`America/Detroit`). It is plain HTML, Tailwind CSS v4 and one vanilla JavaScript file. This guide covers version 1.0.6.
See the live demo at [freeframe.dev/templates/tally](https://freeframe.dev/templates/tally).

Money and tax copy in the template is deliberately general ("not tax advice", no guaranteed savings). If you
use it for a real product, have your own figures and claims checked.

The 6% sales tax in the hero invoice and the pricing toggle is a sample: it is Michigan’s state rate, but what is
taxable varies by state and by item, and many services and hosted software aren’t taxed in Michigan. Set `VAT_RATE`
and the wording to what applies to you. Some internal names (`VAT_RATE`, `data-vat`, `data-vat-toggle`, the saved
`vat` value, `#gdpr-title`) keep their original spelling so existing customizations keep working.

## Quick start

1. Unzip the download and open `index.html` in a browser. Everything works from the file system.
2. Or serve the folder so URLs look like a real site:

   ```sh
   npx serve .
   ```

3. To change styles you need Node.js 24 or newer:

   ```sh
   npm install
   npm run watch
   ```

You only need Node if you add Tailwind classes that aren't already in `assets/css/style.css`.

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Live invoice hero (edit quantities, simulate payment), customer wordmarks, three product cards, dark dashboard band with an SVG cash flow chart, set-up steps, testimonials, calculator and pricing teasers, call to action |
| `features.html` | Features | Product tour in ARIA tabs (invoicing, expenses, bookkeeping, reports), reminder email writer, grid of smaller features |
| `pricing.html` | Pricing | Monthly / annual switch, sales tax toggle, three plan cards, comparison table with a sticky header, billing and sales tax FAQ |
| `calculator.html` | Late-payment calculator | Late-charge calculator (interest from your terms plus a flat late fee) with an SVG chart, time-saved estimate |
| `integrations.html` | Integrations | Category filters, search, result count, empty state, bank feed notes, API code sample |
| `customers.html` | Customers | Featured story with before/after bars, six stories filterable by business type |
| `security.html` | Security and trust | Key facts, six security practices, privacy notes, sub-processor table, responsible disclosure FAQ |
| `changelog.html` | Changelog | Updates filterable by type (new, improved, fixed) |
| `contact.html` | Book a demo | Validated demo request form, live office hours in Eastern time, next steps, address |
| `404.html` | Not found | A "reconciliation" card and links to the main pages |

## Project structure

```text
tally/
  index.html ... 404.html   the ten pages (header and footer are repeated in each)
  assets/css/style.css      compiled Tailwind CSS (generated, do not edit by hand)
  assets/js/main.js         all JavaScript: data, demos, pricing, calculators, filters, forms
  assets/img/favicon.svg    tally-mark logo used as the favicon
  assets/img/og-image.svg   source of the social sharing image
  assets/img/og-image.png   1200×630 social image used by og:image
  src/input.css             Tailwind source: design tokens (@theme) and components
  package.json              build and watch scripts for the CSS
  README.md                 short introduction
  DOCS.md                   this guide
  CHANGELOG.md              version history
  LICENSE.txt               MIT license
```

## Customizing

### Brand and colors

All design tokens are in the `@theme` block at the top of `src/input.css`. The ones that matter most:

| Token | Default | Used for |
|-------|---------|----------|
| `--color-paper` | `#f7f6f1` | Page background |
| `--color-paper-2` | `#efede5` | Alternate sections and table group rows |
| `--color-line` / `--color-line-strong` | `#dcd9ce` / `#c4c0b2` | Hairlines, card and input borders |
| `--color-ink` | `#0d1f1b` | Text, primary buttons, dark bands and footer |
| `--color-ink-soft` / `--color-ink-faint` | `#3c4a45` / `#59655f` | Secondary text and captions (AA on paper and white) |
| `--color-fog` | `#a9bab3` | Secondary text on ink backgrounds |
| `--color-mint-400` / `--color-mint-500` | `#45d99b` / `#1fc786` | The accent: fills with ink text on top, chart bars |
| `--color-mint-700` / `--color-mint-800` | `#0a6e4c` / `#08573d` | Accent text and links on light backgrounds |
| `--color-amber-*`, `--color-rose-*`, `--color-sky-*` | | Invoice status chips (due, late, sent) |

To change the accent, edit the mint scale and rebuild:

```css
--color-mint-400: #7cc4ff;  /* fills */
--color-mint-700: #1d5f99;  /* text on paper */
```

Keep the 700/800 shades dark enough for AA contrast on `--color-paper`. A few SVGs (logo, charts, OG image)
use hex colors directly; search for `#45d99b` and `#0d1f1b` to update them too.

### Typography

Two Google Fonts are loaded in the `<head>` of every page:

- **Mona Sans** (variable weight and width) for everything. Headings use `font-stretch: 112%` (set in
  `src/input.css` for `h1`–`h3`), and the whole body uses `font-variant-numeric: tabular-nums` so figures line
  up in invoices and tables.
- **Azeret Mono** for small labels (`.eyebrow`, invoice numbers, chart axes).

To swap fonts, change the `<link>` URL in every page and the `--font-sans` and `--font-mono` tokens. If the new
family has no width axis, remove the `font-stretch` rules or they are simply ignored.

### Content

Text lives in the HTML pages. Data that the JavaScript uses sits at the top of `assets/js/main.js`
(section 1):

| Constant | What it holds |
|----------|---------------|
| `LOCALE`, `CURRENCY` | `'en-US'` and `'USD'`, used by `money()` to format every amount |
| `VAT_RATE` | `0.06`, the sample sales tax rate used by the hero invoice and the pricing tax toggle |
| `PLANS` | `solo`, `studio`, `practice`: `name`, `monthly` (per month) and `annual` (per year) prices in US dollars, excluding sales tax |
| `BILLING_PERIODS`, `DEFAULT_BILLING` | Accepted billing values and the default (`'annual'`) |
| `STORAGE_KEYS` | localStorage key names (see [Saved data](#saved-data-localstorage)) |
| `INVOICE_DEMO` | Quantity limits (1–9), stage names and the notes under the hero invoice |
| `INVOICE_DUE` | Due date of the sample invoice INV-0142 (`'YYYY-MM-DD'`). `null` (the default) is a rolling demo date: the Friday 7 to 13 days from today, so the demo invoice is never overdue |
| `REMINDER_SAMPLE`, `REMINDER_TONES` | Sample values and the reminder emails per tone (`friendly`, `neutral`, `firm`) and stage (`before`, `due`, `late`) |
| `LATE_PAYMENT` | Points added to the rate entered (`margin: 0`, so it is used as written), days in a year and the flat late-fee tiers (`compensation`) |
| `TIME_ASSUMPTIONS` | Minutes per invoice with Tally (4) and the reduction in chasing (0.8) |
| `CALC_FIELDS` | Default, minimum and maximum for every calculator input |
| `CALC_URL_PARAMS` | Calculator fields read from and written to the URL (`amount`, `days`) |
| `INTEGRATION_CATEGORIES` | Category keys accepted from `integrations.html?category=` |
| `OFFICE` | Office hours on the contact page: `timeZone: 'America/Detroit'`, weekdays 1–5, 9 a.m. to 5:30 p.m. |

**Changing a price.** Edit `PLANS` and the starting values in the plan cards on `pricing.html` (the HTML shows
the annual prices before JavaScript runs). Annual is ten months for twelve, so keep `annual = monthly × 10` if
you want the "2 months free" label and the FAQ to stay true:

```js
const PLANS = {
  solo: { name: 'Solo', monthly: 12, annual: 120 },
  studio: { name: 'Studio', monthly: 30, annual: 300 },
  practice: { name: 'Practice', monthly: 60, annual: 600 }
};
```

**Adding an integration.** Copy one `<li data-integration ...>` in `integrations.html`, set `data-category`
to one of the `INTEGRATION_CATEGORIES` keys and update the counts in the filter pills:

```html
<li data-integration data-category="payments" data-name="kittiwake pay">
  <article class="card card-hover flex h-full flex-col p-5"> ... </article>
</li>
```

A new category needs a pill (`<button class="pill" data-filter="your-key">`) and a key in
`INTEGRATION_CATEGORIES`. Customer stories and changelog entries use the same markup (`data-integration` and
`data-category`) with their own pills.

**Hero invoice lines.** Each row in `#invoice-demo` has `data-line` and `data-price` (unit price excluding sales tax).
Edit the name, price and starting quantity in the HTML; totals are recalculated on load.

### Images and artwork

There are no photos. The logo, customer wordmarks, integration tiles, avatars and charts are inline SVG, and
the invoice, dashboard and receipts are HTML. If you replace an avatar with a photo, keep it square (40×40 on
the home page, 56×56 on the contact page). The social image is `assets/img/og-image.png` (1200×630),
generated from `og-image.svg`; edit the SVG and export a new PNG with any SVG editor. The favicon is
`assets/img/favicon.svg`.

### Navigation, header and footer

The header and footer are repeated in every page. To add a page, copy an existing one, change its `<title>`,
description and Open Graph tags, add a link to the `<nav aria-label="Main">` list (desktop), the
`<nav aria-label="Mobile">` list and the footer in **every** page, and set `aria-current="page"` on the link
in the page's own header. The desktop menu shows six links; Changelog is only in the mobile menu and the
footer.

## Features

### Hero invoice demo

`index.html`, `#invoice-demo`; code in `initInvoiceDemo()` (section 4). The minus and plus buttons change a
line's quantity between `INVOICE_DEMO.minQty` and `maxQty`; the subtotal, sales tax (`VAT_RATE`, rounded to the
cent) and total update and the total briefly flashes. **Simulate payment** moves the invoice from Viewed to
Paid: the chip turns green, the progress track completes, a "Payment received" card appears and the
quantities lock. The button then reads **Reset demo**. With the starting quantities the total is $5,766.40
($5,440.00 + $326.40 sales tax). Changes are announced in a polite live region; the progress list marks the current
stage with `aria-current="step"`.

### Product tour tabs

`features.html`; `initTabs()` (section 5). Standard ARIA tabs: arrow keys, Home and End move between tabs.
The panel ids are `invoicing`, `expenses`, `books` and `reports`, so `features.html#expenses` opens that tab
(only ids of the tab panels are accepted). The pill links at the top of the page (`data-tab-link`) select a tab
and scroll to it. Without JavaScript every panel is visible.

### Reminder writer

`features.html#reminders`; `initReminders()` (section 6). Tone buttons (`data-tone`, `aria-pressed`) and stage
radios (`name="reminder-stage"`) choose one of the nine emails in `REMINDER_TONES`; `{invoice}`, `{amount}`,
`{due}`, `{dueDay}` and `{client}` are filled from `REMINDER_SAMPLE`; `{due}` ("Friday, October 30") and
`{dueDay}` ("Friday") come from `INVOICE_DUE`, like the "Due" date on the hero invoice (`time[data-invoice-due]`).
The preview card is a polite live region.

### Pricing switch and sales tax toggle

`pricing.html`; `initPricing()` (section 7). The billing buttons (`data-billing`) show either the monthly
price or the annual price divided by twelve, with "Billed $300 yearly" or "Billed monthly" underneath. The
saving is `monthly × 12 − annual` per plan: $24, $60 and $120 a year. The checkbox `data-vat-toggle`
multiplies everything by `1 + VAT_RATE` (Studio monthly becomes $31.80) and changes the tax note. Whole dollar
amounts drop the cents (`money(n, true)`). The choice is saved (see below) and `?billing=monthly` or
`?billing=annual` in the URL overrides it; clicking a billing button updates the URL. A status line announces
the change to screen readers. The comparison table header is sticky below the site header.

### Late-payment calculator

`calculator.html`; `initCalculators()` and `lateClaim()` (section 8). Inputs: amount ($1 to $1,000,000),
days overdue (1 to 365, a slider) and the annual interest rate in your terms (0 to 36%). The US has no single
late-payment rate for businesses, so the calculator uses what the visitor’s own terms say. The rules:

- annual rate = rate entered + `LATE_PAYMENT.margin` (0 points);
- interest = amount × annual rate ÷ 100 × days ÷ 365, rounded to the cent;
- flat late fee (an example; set your own in `LATE_PAYMENT.compensation`) = $25 under $1,000, $50 from $1,000 to under $10,000, $100 from $10,000.

With the defaults ($2,400, 45 days, 12%) the result is $85.51: 12.00%, $35.51 interest, $0.79 a day, $50
late fee. `calculator.html?amount=12000&days=1` gives $103.95. The chart is drawn in `drawChart()` as inline
SVG: the late fee as a flat band, interest on top, a marker at the chosen day, over 90 days or the next multiple
of 30. Its text description (`data-chart-desc`) is rewritten each time. Out-of-range numbers mark the input
`aria-invalid` and leave the last valid result. **Reset to the example** restores the defaults, clears the
saved values and removes the URL parameters. Change the default rate in `CALC_FIELDS.rate.def` and the HTML to
match your own terms; state limits vary, so check them first.

### Time-saved estimate

`calculator.html#time-saved`; `renderTime()` in section 8. Minutes today = invoices × minutes per invoice +
late invoices × chasing minutes. With Tally = invoices × `TIME_ASSUMPTIONS.minutesPerInvoice` + late invoices
× chasing × (1 − `chaseReduction`). The defaults give 6.7 hours today, 1.3 hours with Tally and 5.4 hours
saved, worth $322 at $60 an hour. Hours read "1 hour" or "2.5 hours".

### Filters and search

`integrations.html`, `customers.html` and `changelog.html`; `initFilters()` (section 9). Each
`[data-directory]` has pills (`data-filter`, `aria-pressed`), items (`data-integration` with `data-category`),
an optional search box (`data-search`, matches the item's text), a live count (`data-result-count`, with
`data-noun`/`data-nouns` for "1 story" / "6 stories") and an empty state (`data-empty`) with a clear button.
On the integrations page `data-url-param="category"` reads `?category=banking` (checked against
`INTEGRATION_CATEGORIES` with an own-key check) and keeps the URL in step with the pills.

### Office hours

`contact.html`; `officeState()` and `initOfficeHours()` (section 10). The time is worked out in
`OFFICE.timeZone` (`America/Detroit`) whatever the visitor's time zone, and refreshed every minute. Inside
Monday–Friday, 9 a.m. to 5:30 p.m., it reads "It’s 10:42 a.m. in Grand Rapids and we’re in the office"; outside, it says
when the team replies ("after 9 a.m. this morning", "tomorrow" or "on Monday").

### Header, menu, reveals and back to top

The header gains a shadow once you scroll. Below 1024px a menu button (`aria-expanded`, `aria-controls`)
opens the mobile menu; Esc closes it. Elements with `.reveal` fade in when scrolled into view (off with reduced
motion). `data-count` numbers count up once. The back-to-top button is a separate block at the end of
`main.js`; delete it and the `.back-to-top` styles to remove it.

## Forms

Two forms, validated in section 10 of `main.js` (`validate()`, `setFieldError()`), with errors shown under
each field, linked with `aria-describedby` and `aria-invalid`, and focus moved to the first problem. After the
first submit, fields re-validate as they are fixed.

| Form | Where | Validates |
|------|-------|-----------|
| Newsletter (`data-form="newsletter"`) | Footer of every page | Email required and well formed |
| Demo request (`data-form="demo"`) | `contact.html` | Name, work email, team size (radio group) and consent required; message up to 500 characters with a counter |

`contact.html?plan=studio` (or `solo`, `practice`) preselects the plan; the plan buttons on the pricing page
link there. On success each form is replaced by an in-world confirmation: the newsletter asks the visitor to look
out for a confirmation email, and the demo request thanks them by first name, says Noelle will email times for a
call (within two business hours, as the office-hours note promises) and shows a short reference (`TA-` and four
characters, made in the browser by `makeRef()`; use your form service's own reference instead if it returns one).
The forms send nothing until you connect them; if your reply times differ, change the message and the
office-hours note together.

To connect a form service such as Formspree, replace the `successSwap(...)` call in `initForms()`:

```js
onValidSubmit(form, () => {
  fetch('https://formspree.io/f/your-id', {
    method: 'POST',
    body: new FormData(form),
    headers: { Accept: 'application/json' }
  }).then((r) => {
    if (r.ok) successSwap(form, '<p class="font-semibold">Thanks, we’ll be in touch.</p>');
    else form.querySelector('[data-form-status]').textContent = 'Something went wrong. Please try again.';
  });
});
```

Also set `action="https://formspree.io/f/your-id"` and `method="post"` on the `<form>` so it still works
without JavaScript.

## Saved data (localStorage)

All access goes through one `safeStorage` object: localStorage when available, an in-memory stand-in when
the browser blocks it (sandboxed iframes, strict privacy settings), so features keep working for the page view.

| Key | Shape | Validation on read |
|-----|-------|--------------------|
| `tally:pricing` | `{ "billing": "annual", "vat": false }` | `billing` must be an own key of `BILLING_PERIODS`, `vat` a boolean; anything else falls back to annual without sales tax |
| `tally:calculator` | `{ "amount": 2400, "days": 45, "rate": 12, "invoices": 12, "minutes": 20, "late": 30, "chase": 45, "hourly": 60 }` | Each field must be an own key of `CALC_FIELDS` and a number within its range; invalid fields keep their defaults |

URL parameters win over saved values: `pricing.html?billing=`, `calculator.html?amount=&days=`. Other URL
parameters are `integrations.html?category=` and `contact.html?plan=`; every one is checked with
`Object.prototype.hasOwnProperty.call(...)` or a range check, so values like `?plan=constructor` are ignored.

To reset, use **Reset to the example** on the calculator, or run
`localStorage.removeItem('tally:pricing')` in the browser console. To stop saving, remove the `store.set(...)`
calls in sections 7 and 8.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags, `theme-color` and `lang="en-US"`.
`og:image` points at `assets/img/og-image.png` with a relative URL; social sites need an absolute URL, so
change it to your domain when you deploy:

```html
<meta property="og:image" content="https://www.tally.example/assets/img/og-image.png">
```

Add a `sitemap.xml` listing the nine pages and a `robots.txt` pointing to it. There is no structured data;
`SoftwareApplication` with `offers` is a good fit for a product like this.

## Accessibility

- Skip link, landmarks (`header`, `nav` with labels, `main`, `footer`), one `<h1>` per page and a logical
  heading order.
- Visible focus outlines in the accent color, AA contrast on every surface, `prefers-reduced-motion`
  respected (reveals, chart animation, count-up and smooth scrolling are off).
- ARIA patterns: tabs, pressed buttons for filters and billing, `aria-current` for navigation and invoice
  stage, live regions for totals, counts, calculator results and the pricing status.
- Charts have text alternatives (`aria-label` or a `<desc>` that is updated with the numbers); tables have
  captions and header scopes.

When editing, keep one `<h1>` per page, give new inputs a `<label>`, and make sure every `aria-controls`,
`aria-labelledby` and `aria-describedby` points at an id that exists.

## Building and deploying

Rebuild the CSS after adding Tailwind classes:

```sh
npm install
npm run build    # or: npm run watch
```

Classes used only inside JavaScript strings must also appear somewhere Tailwind scans (`main.js` is scanned).
Then upload the whole folder to any static host: Netlify Drop, GitHub Pages, Cloudflare Pages or your own
server. There is no build step for the HTML.

## Troubleshooting

- **New Tailwind classes have no effect.** Run `npm run build`; the compiled `assets/css/style.css` only
  contains classes that existed when it was built.
- **Prices or the calculator don't remember choices.** The browser is blocking storage (private mode or a
  sandboxed preview), so choices last only for the page view. That's expected.
- **A shared pricing link opens on the wrong period.** `?billing=` overrides the saved choice; remove it from
  the link.
- **Prices on the cards are wrong before the page finishes loading.** The HTML shows annual prices; update them
  in `pricing.html` as well as in `PLANS`.
- **The office hours text looks wrong.** It uses Eastern time (`OFFICE.timeZone`); change the time zone and hours
  in `OFFICE` for another location.
- **Fonts look different.** Google Fonts is blocked or offline; the system sans-serif fallback is used. Host the
  fonts yourself if you need them offline.
- **The social image doesn't show.** `og:image` must be an absolute URL on your live domain.

## License

MIT. The code and all included artwork (logo, wordmarks, integration tiles, avatars, charts, mock-ups and social image) are free for personal and commercial use; see `LICENSE.txt` in the download.

Mona Sans and Azeret Mono are licensed under the SIL Open Font License.

Tally, Tally Software, Inc. and every business, person and integration named in the template are fictional placeholders.
