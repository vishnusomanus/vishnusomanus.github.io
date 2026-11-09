# Handy documentation

## Overview

Handy is a ten-page website for a home services company: plumbing, electrical, heating and cooling, carpentry,
painting and remodels. The demo brand is Brightline Home Services, a fictional company in Denver, Colorado. It's
built with plain HTML5, Tailwind CSS v4 and a single vanilla JavaScript file with no dependencies. Highlights are an
instant quote calculator that turns into a booking request, a ZIP code service-area checker with a coverage map, a
before/after slider, a filterable project gallery with a lightbox, a reviews page with filters and sorting, and a
sticky mobile call bar. This guide covers version 1.0.7. Live demo:
[freeframe.dev/templates/handy](https://freeframe.dev/templates/handy).

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Everything works from the file system, including the quote calculator and the
   saved quote.
3. For a local server instead (closer to production), run one from the folder:

```sh
npx serve .
```

You only need Node.js 24 if you change the styles and rebuild the CSS (see
[Building and deploying](#building-and-deploying)). The compiled `assets/css/style.css` is included.

## Pages

| File | Page | Notable sections and features |
|------|------|-------------------------------|
| `index.html` | Home | Hero with ZIP checker, trust badges, services, process, reviews, projects, FAQ (`<details>`) |
| `services.html` | Services and prices | Price tables for every service, the Brightline Care membership |
| `service.html` | Water heaters | One service in depth: what's included, pricing, before/after slider, FAQ |
| `quote.html` | Instant quote | Quote calculator with live estimate and breakdown, booking request form |
| `areas.html` | Service areas | SVG coverage map, ZIP checker that highlights the matching area, cities and ZIP codes list |
| `projects.html` | Projects | Category filters, project cards, lightbox with previous/next |
| `reviews.html` | Reviews | Rating breakdown, service and star filters, sort |
| `about.html` | About | Story, values, team and licenses |
| `contact.html` | Contact | Contact form, emergency line, hours |
| `404.html` | Not found | Links back into the site |

Every page shares the 24/7 emergency bar, sticky header, footer, mobile call bar and back-to-top button.

## Project structure

```text
handy/
├── index.html … 404.html      The ten pages (header, footer and call bar are repeated in each)
├── assets/
│   ├── css/style.css          Compiled Tailwind CSS (generated from src/input.css)
│   ├── js/main.js             All interactivity, plus the service areas and quote price data
│   └── img/                   SVG artwork, favicon.svg, og-image.svg and og-image.png
├── src/input.css              Tailwind source: @theme tokens and component styles
├── package.json               Tailwind CLI scripts (build, watch)
├── template.json              Template metadata (name, version, pages, features)
├── README.md                  Short introduction
├── CHANGELOG.md               Version history
└── DOCS.md                    This guide
```

## Customizing

### Brand and colors

The design tokens are in the `@theme` block at the top of `src/input.css`. Tailwind turns each `--color-*` token into
utilities such as `bg-navy-900`, `text-sun-400` and `border-navy-100`.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-navy-50` to `--color-navy-950` | `#eef4fa` to `#0a1d31` | Brand navy: header, footer, headings, buttons |
| `--color-sun-100` to `--color-sun-600` | `#fff4cc` to `#c98a00` | Safety yellow: call-to-action buttons, highlights, map match |
| `--color-ink-600`, `--color-ink-700` | `#4a5a6b`, `#33414f` | Body text |
| `--color-paper` | `#f7f5f0` | Warm section backgrounds |

The yellow is meant for fills behind navy text or for text on navy. It doesn't have enough contrast as text on white,
so keep it off white backgrounds.

To change the brand navy, replace the scale and rebuild:

```css
@theme {
  --color-navy-700: #14532d;
  --color-navy-800: #0f3f22;
  --color-navy-900: #0b2e19;
  --color-navy-950: #071f11;
}
```

Change the whole scale (50 to 950) so tints and hover states stay in step. A few colors are written directly in the
markup and need a search and replace: the logo mark (`fill="#0f2a44"` in each page header and `favicon.svg`), the
`accent` in `template.json`, and the SVG artwork.

### Typography

Two Google Fonts are loaded by a `<link>` in the `<head>` of every page:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@500;600;700;800;900&amp;family=Public+Sans:wght@400;500;600;700&amp;display=swap">
```

- `--font-display` is Archivo (headings, prices, the logo wordmark), used through the `font-display` class.
- `--font-sans` is Public Sans (body text).

To swap a font, change the `<link>` on every page and the family name in `@theme`, then rebuild the CSS:

```css
@theme {
  --font-display: "Barlow Condensed", "Arial Narrow", ui-sans-serif, system-ui, sans-serif;
}
```

### Content

Most text is plain HTML in the page files. The data the scripts use lives at the top of `assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `AREAS` | Service areas: `name`, `zips` (array of 5-digit strings), `tier` (`"core"` or `"extended"`), `eta` |
| `PRICES` | `[low, high]` starting range per service key |
| `SERVICE_NAMES` | Display name per service key |
| `SIZE`, `SIZE_NAMES` | Home size multipliers and labels (`small`, `medium`, `large`, `xl`) |
| `SIZE_SCALED` | Services whose price scales fully with home size |
| `OPTIONS` | Add-ons with a fixed `add: [low, high]` or a multiplier `mult: [low, high]` |
| `URGENCY` | `standard`, `nextday` (`add`) and `emergency` (`mult`) |
| `WINDOW_NAMES` | Arrival window labels used in the booking summary |

To add a service area, add an entry to `AREAS`:

```js
{"name": "Parker", "zips": ["80134", "80138"], "tier": "extended", "eta": "Next day"}
```

Then add the matching row to the "Cities and ZIP codes" list in `areas.html` and, if you want it on the map, a
`<polygon>` with `class="area-shape area-extended"` (or `area-core`) and `data-area="Parker"` in the map SVG. The
`data-area` value must equal the `name` exactly. The `eta` field isn't shown anywhere yet; the checker message comes
from `tier` (core is "same-day", extended is "next-day").

Contact details are repeated across all pages. Search and replace `(303) 555-0148`, `+13035550148` (used in `tel:`
links), `hello@brightline.example` and `2150 Larimer Street, Denver, CO 80205`.

Other content that is plain HTML and must be edited by hand:

- The price tables on `services.html` and `service.html` (they are not read from `PRICES`).
- The service cards on `quote.html`: each `<input type="radio" name="service" value="…">` must match a key in
  `PRICES` (see [Quote calculator](#quote-calculator)).
- Project cards and the lightbox data on `projects.html` (see [Project gallery](#project-gallery)).
- Review cards and the rating breakdown on `reviews.html` (see [Reviews](#reviews)).

### Images and artwork

All artwork is SVG in `assets/img/`. Replace any file with a photo (JPG or WebP) and update the `src`, keeping the
same aspect ratio and the `width` and `height` attributes:

| Files | Size | Ratio |
|-------|------|-------|
| `hero.svg` | 1200×900 | 4:3 |
| `project-*.svg` (8 files) | 800×600 | 4:3 |
| `before.svg`, `after.svg` | 900×560 | Both must be the same size |
| `team-*.svg` (4 files) | 240×240 | 1:1 |
| `van.svg` | 320×160 | 2:1 |
| `favicon.svg` | 32×32 | 1:1 |

`og-image.png` (1200×630) is the social sharing image. Its editable source is `og-image.svg`: change the SVG, then
export it again as a 1200×630 PNG with any image editor.

Decorative images use `alt=""`. When you add a meaningful photo, write alt text that describes it.

### Navigation, header and footer

The header, the 24/7 bar, the mobile menu, the footer and the mobile call bar are repeated in every HTML file. To add a
page or menu item, edit all ten files:

- Desktop menu: the `<nav aria-label="Main">` list inside `#site-header`.
- Mobile menu: the `<nav id="mobile-menu">` list.
- Footer: the link columns at the end of each page.

Mark the current page with `aria-current="page"` on its links in both menus; the styles highlight it from that
attribute. The mobile menu closes on Escape, on link click and when the window grows to the desktop breakpoint.

## Features

### Quote calculator

On `quote.html`, the `[data-quote]` section holds the calculator form (`[data-quote-calculator]`) and the estimate
panel (`[data-estimate]`, `[data-estimate-note]`, `[data-breakdown]`). Every change recalculates the range with
`estimate(state)` in `main.js` and saves the choices (see [Saved data](#saved-data-localstorage)).

How the range is worked out:

1. Start from `PRICES[service]`, for example plumbing is `[129, 420]`.
2. Apply the home size factor from `SIZE`. Services in `SIZE_SCALED` (`painting`, `remodel`, `hvac`) use the full
   factor. Repairs use only 30% of the difference: `1 + (factor - 1) * 0.3`, so a large home adds 7.5% to a plumbing
   job instead of 25%.
3. Add every fixed add-on: the checked options with an `add` value, in the order they're listed in `OPTIONS`, then
   the urgency's `add` (`nextday` adds `[75, 75]`).
4. Multiply by every percentage: the checked options with a `mult` value, in `OPTIONS` order, then the urgency's
   `mult` (`emergency` multiplies by `[1.5, 1.5]`). Multipliers apply to the whole running total, add-ons included.
5. Round the low figure down and the high figure up to the nearest $10.

The result doesn't depend on the order the visitor checks the options in, and the HTML and Next.js versions give the
same figures for the same choices.

Examples from the default data:

| Choices | Estimate |
|---------|----------|
| Plumbing, 1,000–2,000 sq ft, standard | $120 – $420 |
| Plumbing, 2,000–3,000 sq ft, emergency | $200 – $680 |
| Painting, 2,000–3,000 sq ft, premium materials, haul-away, next day | $830 – $4,350 |

To change prices, edit the data block:

```js
var PRICES = { plumbing: [149, 450], electrical: [119, 380], hvac: [99, 650], carpentry: [180, 900], painting: [450, 2400], remodel: [9800, 32000] };
var URGENCY = { standard: { label: 'Standard (within 3 days)' }, nextday: { label: 'Next-day visit', add: [95, 95] }, emergency: { label: 'Emergency, within 2 hours', mult: [1.5, 1.5] } };
```

To add a service, add the key to `PRICES` and `SERVICE_NAMES` (and to `SIZE_SCALED` if it's whole-home work), then add
a matching radio card to the calculator in `quote.html`:

```html
<label class="option-card"><input type="radio" name="service" value="roofing" class="sr-only"> …</label>
```

To add an option, add it to `OPTIONS` and a `<input type="checkbox" name="options" value="…">` to the form.

Things to know:

- The breakdown lines are built from the data: `addText()` shows "+$75" or "+$90–140" and `pctText()` shows "+50%"
  or "+15–35%", so changing a number in `OPTIONS` or `URGENCY` updates the breakdown too.
- The urgency cards in `quote.html` also show "+$75" and "+50%" as text. Update them with the data.
- Linking to `quote.html?service=hvac` preselects a service. Unknown values are ignored.
- The calculator radios and checkboxes are real form controls, so it works with the keyboard. The estimate has
  `aria-live="polite"`, so screen readers hear the new range after each change.
- The estimate panel (the sticky `<aside>`) has `data-back-to-top-hide`, so the back-to-top button hides rather than
  covering it.

### Booking request

Below the calculator, `[data-request-form]` collects name, phone, email, ZIP code, preferred date, arrival windows and a
description. On a valid submit it hides the form and shows `[data-request-success]` with:

- a reference, `BL-` plus four characters made in the browser by `makeRef()` (`[data-request-ref]`),
- a summary (`[data-request-summary]`) with the service, date, chosen windows, the current estimate, whether the ZIP is
  in a service area (via `findArea()`), and the phone number we'll call,
- what happens next: a call within 15 minutes (8 a.m.–7 p.m.) to confirm the arrival window, as the page promises.

The success panel receives focus so screen readers announce it. "Start another request" (`[data-request-reset]`)
resets the form and shows it again. The request is not sent anywhere until you connect the form, although the
confirmation reads as if it had been; see [Forms](#forms).

The arrival windows are checkboxes inside `<fieldset data-group="windows">`, and at least one must be checked. Their
labels in the summary come from `WINDOW_NAMES`; keep the keys in step with the checkbox `value`s.

### ZIP code checker

Any `<form data-zip-checker>` with an `<input>` and a `.zip-result` element becomes a checker. It's on `index.html` and
`areas.html`. On submit it checks for five digits, then looks the ZIP up in `AREAS`:

- core area: "Yes! We serve Denver (80205) with same-day service."
- extended area: "Yes, we serve Golden (80401) with next-day service."
- not found: a message asking the visitor to call.

The result element has `role="status"` and `aria-live="polite"`. An invalid ZIP sets `aria-invalid` and returns focus
to the input.

### Coverage map

On `areas.html`, the SVG with class `area-map` contains one `<polygon class="area-shape …" data-area="Name">` per area.
When a ZIP matches, the script adds `is-match` to that polygon and `has-match` to the map, which fades the others and
outlines the match (styles in `src/input.css` under `.area-shape`). The map is `role="img"` with a title and
description; the text list below it is the accessible equivalent, so keep both up to date.

### Before/after slider

On `service.html`, a `[data-before-after]` box contains the after image, the before image inside `.before-after-clip`,
a handle and a transparent `<input type="range">` covering the box. Moving the range sets the `--pos` custom property,
which clips the before image. Because it's a native range input, it works with mouse, touch and the arrow keys, and it
gets a visible focus ring. The script sets `aria-valuetext` such as "60% before, 40% after".

To reuse it, copy the whole `[data-before-after]` block, give the input a unique `id` and update its `<label for>`.

### Project gallery

On `projects.html`, the `[data-gallery]` section holds:

- filter buttons with `data-filter` (`all`, `kitchen-bath`, `heating-plumbing`, `electrical`, `outdoor`) and
  `aria-pressed`,
- project cards, `<li data-project data-category="…">`, each with a `<button data-lightbox-open="N">`,
- a count (`[data-gallery-count]`, `aria-live="polite"`),
- a `<dialog data-lightbox>` and a JSON list in `<script type="application/json" data-lightbox-data>`.

`data-lightbox-open="N"` is the index into that JSON list, so card 0 opens the first entry. To add a project:

1. Add a card `<li>` with the next index and a `data-category` that matches a filter button.
2. Add an entry to the JSON list in the same position:

```json
{"src": "assets/img/project-roof.jpg", "title": "Cedar roof repair", "meta": "Arvada · 80003 · 4 days · $6,800"}
```

The lightbox is a native `<dialog>`: Escape closes it, focus moves to the close button on open and back to the card on
close, the left and right arrow keys step through the projects that are visible under the current filter, and
clicking the backdrop closes it.

### Reviews

On `reviews.html`, `[data-reviews]` filters and sorts the cards in `[data-review-list]`. Each card is an
`<article data-review>` with three attributes:

```html
<article class="card reveal flex flex-col p-6 " data-review data-service="plumbing" data-stars="5" data-date="2026-09-28">
```

- `data-service` matches an `<option>` in the service select (`[data-review-service]`).
- `data-stars` is 1 to 5. The star buttons (`data-stars-filter` `all`, `5`, `4`, `3`) filter exactly 5 or 4 stars, and
  "3" means 3 stars or fewer.
- `data-date` is `YYYY-MM-DD`; "Newest" sorts on it, and "Highest" and "Lowest" break ties with it.

The count (`[data-review-count]`) is a live region; `[data-review-empty]` shows when nothing matches, and
`[data-review-clear]` resets all filters. The rating breakdown bars and the average at the top are static HTML, so
update them when you change the reviews.

### Header, mobile menu and scroll reveals

The header gets an `is-scrolled` shadow after 8px of scrolling. The menu button toggles `aria-expanded` and its label.
Elements with the `reveal` class fade in as they scroll into view; when one is revealed, all earlier ones are too, so a
fast jump never leaves gaps. Reveals are skipped with reduced motion or without `IntersectionObserver`, and the
content is only hidden after the inline script in the `<head>` adds the `js` class, so it stays visible without
JavaScript. Elements with `data-year` show the current year.

### Mobile call bar

Below 1024px, `.mobile-call-bar` is fixed to the bottom of the screen with "Call now" and "Free quote" buttons. It has
`data-back-to-top-avoid`, so the back-to-top button sits above it. To remove it, delete the
`<div class="mobile-call-bar …">` block from each page. It's hidden when printing.

### Back to top

The last block in `main.js` adds a round button after about one screen of scrolling. It scrolls to the top (instantly
with reduced motion), then moves focus to `<main id="main">`. It lifts above toasts and anything marked
`data-back-to-top-avoid`, hides while it would cover a fixed or sticky element marked `data-back-to-top-hide`, and steps
aside while any link whose text contains "Back to top" (the footer link) is on screen. Restyle it with the
`.back-to-top` rules in `src/input.css`; to remove it, delete the block and those rules.

## Forms

There are three kinds of form. All validate in the browser and none send anything until you connect them. The booking
request and contact confirmations read as if they had been sent: they show a reference and promise a confirming call
within 15 minutes (8 a.m.–7 p.m.) and a reply within one business day, as the pages already say. Change them if you
work differently.

| Form | Where | Validation |
|------|-------|------------|
| ZIP checker (`data-zip-checker`) | `index.html`, `areas.html` | 5 digits; looks up `AREAS` only, nothing to send |
| Booking request (`data-request-form`) | `quote.html` | Name, phone (10 digits), email, ZIP (5 digits), date (today or later), at least one window, details (20+ characters) |
| Contact (`data-contact-form`) | `contact.html` | Name, email, optional phone (10 digits if filled), topic, message (10+ characters) |

Validation is in `wireForm()` and `check()` in `main.js`. It reads standard attributes (`required`, `type="email"`,
`minlength`) and a `data-validate` attribute:

| `data-validate` | Rule |
|-----------------|------|
| `phone` | At least 10 digits |
| `phone-optional` | At least 10 digits if anything is typed |
| `zip` | Exactly 5 digits |
| `future-date` | Today or later; the script also sets the input's `min` to today |

A `<fieldset data-group="name">` requires at least one checked box. Errors appear under each field as `.field-error`,
linked with `aria-describedby`, and the field gets `aria-invalid="true"`. On a failed submit, focus moves to the first
invalid field. Fields are rechecked on blur and while you correct them.

### Connecting to Formspree

`wireForm(form, onValid)` calls `onValid(form)` only after validation passes. The comment "To send for real, POST new
FormData(form) to your form service here." marks the place. For the contact form, give the form an `action` and post
it in the `onValid` callback of the `[data-contact-form]` block:

```html
<form class="mt-6 grid gap-5 sm:grid-cols-2" data-contact-form novalidate action="https://formspree.io/f/your-form-id" method="POST">
```

```js
document.querySelectorAll('[data-contact-form]').forEach(function (form) {
  wireForm(form, function () {
    var ok = form.querySelector('[data-success]');
    fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('Send failed');
        ok.querySelector('[data-contact-ref]').textContent = makeRef('BL');
        form.querySelectorAll('input, select, textarea').forEach(function (f) { f.value = f.tagName === 'SELECT' ? f.options[0].value : ''; });
        ok.classList.remove('hidden');
        ok.focus();
      })
      .catch(function () { alert('Sorry, your message could not be sent. Please call us.'); });
  });
});
```

Read the form data before resetting the fields, as above. For the booking request, do the same in the `wireForm(reqForm,
…)` callback. The calculator choices are in a separate form, so add them to the data you send:

```js
var data = new FormData(form);
data.append('service', state.service);
data.append('size', state.size);
data.append('options', state.options.join(', '));
data.append('urgency', state.urgency);
data.append('estimate', money(r.low) + ' – ' + money(r.high));
fetch('https://formspree.io/f/your-form-id', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
```

The reference (`BL-` and four characters, from `makeRef()` in `main.js`, with no 0/O or 1/I to misread over the
phone) is made in the browser for both forms. Replace it with the ID your booking system or form service returns, or
remove it.

## Saved data (localStorage)

| Key | Shape | Written |
|-----|-------|---------|
| `handy-quote-v1` | `{"service": "plumbing", "size": "medium", "options": [], "urgency": "standard"}` | On every calculator change |

`readQuote()` validates the saved value on load: `service`, `size` and `urgency` must be keys of `PRICES`, `SIZE` and
`URGENCY`, and `options` keeps only known, unique keys of `OPTIONS`. Anything else falls back to `DEFAULT_QUOTE`.
Storage errors (private browsing, blocked storage) are ignored. A `?service=` in the URL overrides the saved service.

To reset it, delete the key in your browser's developer tools (Application, Local Storage). If you rename services or
change the shape, change `QUOTE_KEY` (for example to `handy-quote-v2`) so old values are ignored. To stop saving, remove
the `saveQuote(state);` call in `readForm`.

## SEO and sharing

Each page has its own `<title>`, `<meta name="description">`, `og:title`, `og:description`, `og:type`, `og:site_name`
and `og:image` in the `<head>`. Edit them per page when you rebrand.

Social networks need an absolute image URL. When you deploy, change `og:image` on every page from
`assets/img/og-image.png` to your full domain:

```html
<meta property="og:image" content="https://example.com/assets/img/og-image.png">
```

There is no structured data, sitemap or `robots.txt`. For a local business, consider adding a `LocalBusiness` (or
`HomeAndConstructionBusiness`) JSON-LD block to `index.html` with your name, phone, address, opening hours and service
area, a `sitemap.xml` listing the ten pages, and a `robots.txt` that points to it.

## Accessibility

Built in:

- A "Skip to content" link targeting `<main id="main">` on every page, and one `<h1>` per page.
- Landmarks: `header`, labeled `nav` elements ("Main", "Mobile"), `main` and `footer`.
- Visible focus styles (`:focus-visible` outline in `src/input.css`).
- A menu button with `aria-expanded`, `aria-controls` and a changing label; Escape closes the menu.
- Live regions for ZIP results, the estimate, the gallery count and the review count.
- Form errors linked with `aria-describedby` and `aria-invalid`, focus on the first error, focus on success messages.
- Toggle buttons with `aria-pressed` for the gallery and star filters.
- A native `<dialog>` lightbox with focus return, and a native range input for the before/after slider.
- Reduced motion: no reveal animations, no pulsing dot in the emergency bar, instant scrolling.

When editing, keep one `<h1>` per page, give every new input a `<label>`, keep yellow text off white, and write alt
text for meaningful photos.

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` is compiled and included. Rebuild it after editing `src/input.css` or using Tailwind classes that
aren't in the files yet (Node.js 24):

```sh
npm install
npm run build    # or: npm run watch while you edit
```

Tailwind scans the HTML and `main.js` for class names, so classes written in JavaScript strings (such as
`text-emerald-700` in the ZIP checker) are included.

### Deploying

The folder is a static site. Upload it as it is:

- **Netlify Drop:** drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **GitHub Pages:** push the files to a repository and enable Pages for the branch.
- **Cloudflare Pages / any static host:** upload the folder; no build command is needed.

Configure your host to serve `404.html` for missing pages (Netlify and GitHub Pages do this automatically). You can
leave out `src/`, `package.json` and the Markdown files when uploading.

## Troubleshooting

- **A ZIP code says it's outside the area.** It must be listed in `AREAS[].zips` as a five-character string, for
  example `"80205"`, not `80205`.
- **The map doesn't highlight a matching area.** The polygon's `data-area` must equal the area `name` exactly,
  including spaces and capitals.
- **The calculator breaks after adding a service.** Each `value` on the service radios must be a key in `PRICES` and
  `SERVICE_NAMES`. Clear `handy-quote-v1` if an old saved value is in the way.
- **The lightbox shows the wrong project.** The `data-lightbox-open` index must match the entry's position in the
  `data-lightbox-data` JSON list. Check the JSON is still valid after editing.
- **The quote page shows $129 before the script runs and $120 after.** The static text in `[data-estimate]` is only a
  placeholder; the script rounds to $10. Update the placeholder to match if you change prices.
- **New Tailwind classes have no effect.** The compiled CSS only has classes that were in use when it was built. Run
  `npm run build`.
- **Social previews show no image.** Make `og:image` an absolute URL on your domain.

## License

MIT: the full text is in `LICENSE.txt`, included in the download. You can use, change and sell sites built with this
template, including the SVG artwork. Brightline Home Services, its team and its customers are fictional.
