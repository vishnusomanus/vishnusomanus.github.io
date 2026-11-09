# Drift documentation

## Overview

Drift is a launch website for a mobile app, written for **Nightjar**, a fictional sleep and wind-down app made
by a small team in Sacramento, California. It is dark first: a night-sky design with SVG star fields, a glowing moon, soft
aurora gradients and glassy phone mockups built in HTML, plus a light ("dawn") theme. It has a tabbed feature
tour, a bedtime calculator, a sound library with generated previews and saved favorites, a wind-down routine
builder, pricing with a monthly/annual switch, filterable reviews, sleep guides and a support page with a
searchable help center, contact form and press kit. This is the **HTML + Tailwind CSS v4** version, **1.0.5**:
static pages and one vanilla JavaScript file, no build step needed to run it.

Live demo: [freeframe.dev/templates/drift](https://freeframe.dev/templates/drift)

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Every page and link works from your computer.

To preview it the way a host serves it:

```sh
cd drift
python3 -m http.server 8000   # then open http://localhost:8000
```

**Node.js 24** is only needed to rebuild the CSS after changing styles (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable features |
|------|---------|------------------|
| `index.html` | Home | Night-sky hero with moon, phone mockup and floating cards, store buttons, press strip, tabbed feature tour (`#tour`), "a night with Nightjar" timeline, calculator and sounds teasers, reviews, download block (`#download`) |
| `features.html` | Features | Four feature sections (`#sounds`, `#alarm`, `#routine`, `#diary`) with app screens, the routine builder (`#builder`), smaller features and a health note |
| `sounds.html` | Sound library | Category filters, search, favorites, preview play/pause with a "now playing" bar |
| `calculator.html` | Bedtime calculator | Wake-up and bedtime modes, fall-asleep allowance, results with suggested options, cycle illustration, FAQ |
| `pricing.html` | Pricing | Free, Premium and Family plans, monthly/annual switch, comparison table, FAQ (`#faq`) |
| `reviews.html` | Reviews | Rating summary, rating and topic filters, sorting |
| `guides.html` | Sleep guides | Featured guide, topic filter, guides that expand in place |
| `support.html` | Support and press | Help center search (`#faq`), contact form (`#contact`), press kit (`#press`), privacy summary (`#privacy`) |
| `404.html` | Not found | Moon artwork and links back into the site |

## Project structure

```text
drift/
├── index.html … support.html, 404.html
├── assets/
│   ├── css/style.css            compiled Tailwind CSS (generated)
│   ├── js/main.js               all interactions, one numbered section per feature
│   └── img/
│       ├── favicon.svg          app icon, also the favicon and press kit icon
│       ├── nightjar-logo.svg    logo for dark backgrounds (press kit download)
│       ├── og-image.svg         editable source of the social image
│       └── og-image.png         1200×630 social image
├── src/input.css                Tailwind source: @theme tokens, light theme and component classes
├── package.json                 scripts to rebuild the CSS
├── README.md  DOCS.md  CHANGELOG.md
```

## Customizing

### Brand and colors

All colors are tokens in the `@theme` block of `src/input.css`. The night theme is the default; the dawn
theme overrides the same tokens under `html.light`, so every utility (`bg-card`, `text-muted`, `border-line`…)
follows the theme automatically.

| Token | Used for |
|-------|----------|
| `--color-bg`, `--color-bg-alt` | Page background and alternate sections |
| `--color-card`, `--color-raised`, `--color-line` | Cards, inputs and chips, borders |
| `--color-fg`, `--color-muted`, `--color-subtle` | Headings and body, secondary text, captions |
| `--color-accent` | Links, eyebrows, icons and selected states |
| `--color-cta`, `--color-cta-hover`, `--color-cta-fg` | The filled "moonlight" button and its text |
| `--color-moon`, `--color-aurora`, `--color-iris`, `--color-dusk` | Fixed brand colors for artwork (same in both themes) |

To change the main button color in the night theme:

```css
@theme {
  --color-cta: #b8f0e4;
  --color-cta-hover: #d2f7ef;
}
```

Change the matching values in the `html.light` block too, and check contrast in both themes. The phone screens
use fixed inline colors (the app itself is always dark); edit them in the HTML if your app looks different.

### Typography

Two Google Fonts are loaded in the `<head>` of every page: **Spectral** (light serif for headings, `font-serif`)
and **Mulish** (body text, `font-sans`). To swap them, change the Google Fonts `<link>` on each page and the
`--font-serif` / `--font-sans` tokens in `src/input.css`, then rebuild the CSS.

### Content

Text lives in the HTML pages. Data that drives the interactions is at the top of `assets/js/main.js`
(section 1):

| Constant | What it holds |
|----------|---------------|
| `STORAGE` | The localStorage keys (see [Saved data](#saved-data-localstorage)) |
| `CYCLE_MINUTES`, `CYCLE_COUNTS`, `SUGGESTED_CYCLES` | Calculator math: 90-minute cycles, the options shown (6, 5, 4, 3) and which are highlighted (5 and 6) |
| `CALC_MODES`, `LATENCY_OPTIONS`, `CALC_DEFAULTS` | Calculator modes (`wake`, `bed`) and labels, allowed fall-asleep minutes (5, 10, 15, 20, 30), defaults (`wake`, `07:00`, 15) |
| `ROUTINE_STEPS`, `ROUTINE_DEFAULTS` | Routine builder steps (`id: { label, minutes }`, in running order) and the suggested routine (`dim`, `screens`, `breathe`, `read`, lights out `22:45`) |
| `SOUND_RECIPES`, `PREVIEW_SECONDS`, `SOUND_CATEGORIES` | How each sound preview is generated, preview length (30 s), allowed filters |
| `PLANS`, `BILLING` | Monthly and annual prices in US dollars, before any sales tax (Premium $6.99 / $55.99, Family $11.99 / $95.99) |
| `REVIEW_STARS`, `REVIEW_TOPICS`, `REVIEW_SORTS` | Allowed review filter and sort values |
| `GUIDE_TOPICS`, `CONTACT_TOPICS` | Allowed guide topics and contact form topics |

To add a routine step, add an entry to `ROUTINE_STEPS`; the builder renders its checkboxes from this object:

```js
var ROUTINE_STEPS = {
  dim: { label: 'Dim the lights', minutes: 5 },
  tea: { label: 'Make a caffeine-free tea', minutes: 6 },
  // …
};
```

To add a sound, copy an `<li data-sound="…">` card in `sounds.html`, give it a new `data-sound` id,
`data-category` (`rain`, `nature`, `noise` or `ambient`) and `data-name`, update the filter counts, and add a
recipe with the same id to `SOUND_RECIPES`:

```js
'night-bus': { noise: 'brown', filter: 500, pulse: 0.8, gain: 0.7 },
```

Reviews (`<li data-review data-stars data-topic data-date>` in `reviews.html`) and guides (`<article data-guide
data-topic>` in `guides.html`) are plain HTML: copy one and edit it. `data-date` is an ISO date used for sorting.
Prices in the pricing cards are filled in by `main.js` from `PLANS`; keep the HTML values in step for visitors
without JavaScript.

### Images and artwork

There are no photos. The star fields, moon, hills, sound tile art and guide covers are inline SVG; the phone
screens are HTML with inline styles. If you replace the guide covers or sound art with photos, keep the aspect
ratios (16:10 for cards). The social image is `assets/img/og-image.png` (1200×630), generated from
`og-image.svg`. The favicon and app icon is `assets/img/favicon.svg`.

### Navigation, header and footer

The header and footer are repeated on every page. To add a page, copy an existing one, change its `<title>`,
description, Open Graph tags and `data-page`, then add a link to the main `<nav>`, the mobile menu
(`#mobile-menu`) and the footer of every page. The current page's links carry `aria-current="page"`. The main
navigation shows from 1280px wide (`xl:`); below that the menu button opens `#mobile-menu`.

### Dark mode

Drift is dark by default. The theme button (`[data-theme-toggle]`) toggles the `light` class on `<html>` and
saves `drift-theme` (`light` or `dark`). A small inline script in each page's `<head>` applies a saved `light`
choice before the page paints, so there is no flash. Use the `light:` variant for light-only styles
(`light:text-[#b7791f]`). To make the site dark only, delete the theme button from every header.

## Features

### Feature tour (home)

Four tabs (`role="tab"`, `data-tour-tab`) show their panels (`data-tour-panel`) and swap the phone screen
(`data-tour-screen` inside `[data-tour-phone]`). Code: `initTour()` (section 6). Arrow keys, Home and End move
between tabs; the phone's `aria-label` names the selected feature. Screens cross-fade, instantly with reduced
motion.

### Routine builder (features)

Checkbox steps from `ROUTINE_STEPS` plus a lights-out time. It shows the start time (lights out minus the total
minutes), a count ("4 steps · 26 minutes") and a timed plan. Code: `initRoutine()` (section 7). Saved under
`drift-routine`. Results are in a polite live region.

### Bedtime calculator

Two modes: **When to sleep** (`wake`: bedtime = wake time − cycles × 90 − fall-asleep minutes) and **When to
wake** (`bed`: wake time = bedtime + fall-asleep minutes + cycles × 90). It shows 6, 5, 4 and 3 cycles in time
order and highlights 5 and 6 as "Suggested". Example: wake at 7:00 AM with 15 minutes gives 9:45 PM, 11:15 PM,
12:45 AM and 2:15 AM; bed at 10:30 PM gives 3:15 AM, 4:45 AM, 6:15 AM and 7:45 AM. Times are local clock times, with no
time zone conversion. They are kept and passed in URLs as 24-hour `HH:MM`, and `clock12()` (section 2) shows them on a
12-hour clock; "Now" (bedtime mode) uses the visitor's device clock.

URL parameters: `?mode=wake|bed&time=HH:MM&latency=5|10|15|20|30`. Each is validated (own-key lookups and a
time pattern); invalid values fall back to saved settings, then defaults. Changing an input updates the URL and
saves `drift-calculator`. "Copy link" copies the shareable URL. Code: `calcTimes()` and `initCalculator()`
(section 8). The wording keeps it a general guide; keep it that way if you edit it.

### Sound library

Filter buttons (`data-filter`, `aria-pressed`), a search box and a Favorites filter with a live count. The
heart buttons (`data-fav`, `aria-pressed`) save ids to `drift-favourites`. Preview buttons (`data-play`,
`aria-pressed`) play one sound at a time, generated with the Web Audio API from `SOUND_RECIPES` (filtered
noise, sine tones and slow volume waves; no audio files), fading in and stopping after `PREVIEW_SECONDS`. The
fixed "now playing" bar (`data-now-playing`) has a Stop button; Escape also stops. Without Web Audio the
buttons still change state and a toast explains. URL parameter: `?cat=rain|nature|noise|ambient|favourites`.
Code: section 9. The equalizer animation is static with reduced motion.

### Pricing switch

A `role="switch"` button (`data-billing-switch`) toggles monthly and annual billing. Annual shows the monthly
equivalent (`$55.99 / 12 = $4.67`) and the saving against twelve monthly payments (`$27.89, 33%`). URL
parameter: `?billing=monthly|annual`. Code: `initPricing()` (section 10).

### Reviews filter

Rating buttons (`all`, `5`, `4`, `low` = 3 stars and below), a topic select and a sort select (newest, highest,
lowest), with a live "Showing 12 reviews" count. URL parameters: `?stars=` and `?topic=`. Code: section 11.

### Guides filter

Topic buttons (`data-topic-filter`) filter the guides; each guide expands in place with `<details>`. URL
parameter: `?topic=routines|bedroom|sounds|mornings`. Code: section 12.

### Help center search

Typing in `#faq-search` filters the questions and answers (every word must match), hides empty groups and
updates the count ("1 answer found"). Code: `initFaqSearch()` (section 13).

### Copy buttons and toast

`data-copy-target="id"` copies an element's text (press boilerplate) and `data-copy-text="…"` copies the value
(color swatches). Messages appear in the `#toast` live region. Code: section 15.

## Forms

The contact form on `support.html` (`#contact-form`) checks name, email format, phone choice and a message of
at least 20 characters, with inline errors linked by `aria-describedby`. `?topic=help|billing|bug|feedback|press`
preselects the topic. On success it shows `#contact-success`, which thanks the sender by first name, says the
support team will reply within one business day (as the page promises; change both if yours differs) and shows a
short reference (`NJ-` and four characters, made in the browser by `makeRef()`; use your help desk's own ticket
number instead if it returns one). **It doesn't send anything** until you connect it. To use Formspree, replace
the success block in `initForms()` (section 14) with:

```js
fetch('https://formspree.io/f/YOUR_ID', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (r) {
  if (r.ok) {
    $('[data-success-ref]', success).textContent = makeRef('NJ');
    form.hidden = true; success.hidden = false; success.focus();
  }
});
```

## Saved data (localStorage)

All access goes through one `safeStorage` object. When storage is blocked (sandboxed iframes, strict privacy
settings) it falls back to memory, so features keep working for the page view.

| Key | Shape | Validation on read |
|-----|-------|--------------------|
| `drift-theme` | `"light"` or `"dark"` | Only `"light"` switches the theme |
| `drift-favourites` | `["tide", "brown"]` | Must be an array; unknown ids and duplicates are dropped |
| `drift-calculator` | `{ "mode": "wake", "time": "07:00", "latency": 15 }` | Own-key checks on `CALC_MODES` and `LATENCY_OPTIONS`, `HH:MM` pattern |
| `drift-routine` | `{ "steps": ["dim", "read"], "lightsOut": "22:45" }` | Step ids must be own keys of `ROUTINE_STEPS`; time must match `HH:MM` |

To reset, use "Reset to the suggested routine", un-heart sounds, or clear site data in the browser. To remove a
feature's storage, delete its `writeJSON` call.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `theme-color` in the `<head>`. Social
sites need an absolute image URL, so after deploying change `og:image` on every page to
`https://your-domain.com/assets/img/og-image.png`. Add a `sitemap.xml` listing the pages and a `robots.txt` if
your host doesn't create them. The calculator page title targets "when should I go to sleep" searches.

## Accessibility

- Skip link, landmarks, one `<h1>` per page and a logical heading order.
- Visible focus rings in both themes; AA contrast checked in night and dawn themes.
- Tabs follow the ARIA tabs pattern; filters and favorites use `aria-pressed`; the billing control is a
  `role="switch"`; counts and results use polite live regions.
- The mobile menu sets `aria-expanded` and closes with Escape.
- Decorative SVGs are `aria-hidden`; phone mockups have descriptive `aria-label`s.
- Reduced motion turns off twinkling stars, drifting auroras, floating cards, the equalizer and reveals.

When editing, keep one `h1`, label every new input and check that `aria-controls`/`aria-labelledby` ids exist.

## Building and deploying

The compiled CSS is included. After changing classes or `src/input.css`:

```sh
npm install
npm run build    # or: npm run watch
```

Upload the folder to any static host: Netlify Drop, GitHub Pages, Cloudflare Pages, or your own server. There is
no server code.

## Troubleshooting

- **New classes have no effect.** Rebuild the CSS (`npm run build`); Tailwind only generates classes it finds
  in the HTML and `assets/js/main.js`.
- **No sound on the previews.** Browsers only allow audio after a click, and some phones mute web audio when the
  silent switch is on. Check the device volume.
- **The time input shows a 24-hour clock.** Time inputs follow the browser's locale; the calculator still works
  in 24-hour `HH:MM` internally and shows its results on a 12-hour clock.
- **Favorites or settings don't persist.** Storage is blocked (private mode or a sandboxed preview), so they
  last only for the page view.
- **The theme flashes on load.** Keep the inline script in the `<head>` above the closing `</head>` on every page.
- **The social image doesn't show.** Use an absolute `og:image` URL to the PNG.

## License

MIT. The code and all included artwork are free for personal and commercial use. See `LICENSE.txt` in the download.

Spectral and Mulish are licensed under the SIL Open Font License.

Nightjar, Nightjar Labs, the reviewers and the publications named on the site are fictional. The health wording
is general placeholder text: have it reviewed for your product and region.
