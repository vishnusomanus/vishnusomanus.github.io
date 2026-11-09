# Nonprofit documentation

## Overview

Nonprofit is a warm, trustworthy website for a charity, with a working donate page. The demo
organization is **Clearwater Trust**, a fictional clean-water charity working in nine countries. The site
tells its story with impact counters, an appeal progress bar and long-form field stories, shows where
money goes with a spending chart, and includes volunteering, events and a full donation flow. It is
built with HTML5, Tailwind CSS v4 and vanilla JavaScript, and needs no build step. This guide covers
version 1.1.9.

Live demo: [freeframe.dev/templates/nonprofit](https://freeframe.dev/templates/nonprofit)

## Quick start

1. Unzip the download and open `index.html` in a browser.
2. Or serve the folder with any static server:

   ```sh
   cd nonprofit
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

Node.js 24 is only needed to rebuild the CSS (see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections |
|------|---------|------------------|
| `index.html` | Home | Hero, mission, count-up impact numbers, programs, story spotlight, appeal progress bar, partners, newsletter |
| `about.html` | About and finances | Mission and vision, history timeline, leadership and board, donut chart of spending |
| `programs.html` | Programs | Region filter, dot-matrix world map that highlights regions, six program cards |
| `stories.html` | Stories | Featured story and a grid of story cards |
| `story.html` | One long-form story | Pull quote, figure, copy-link sharing |
| `get-involved.html` | Get involved | Volunteer roles with "Apply for this role", application form, fundraising ideas, corporate partnerships |
| `events.html` | Events | Upcoming events with RSVP buttons, RSVP form with a guest stepper |
| `donate.html` | Donate | One-time or monthly, preset and custom amounts, impact message, cover the fees, dedication, demo card checkout, donor FAQ |
| `404.html` | Not found | Error page with links back |

## Project structure

```text
nonprofit/
├── index.html, about.html, programs.html, stories.html, story.html,
│   get-involved.html, events.html, donate.html, 404.html
├── assets/
│   ├── css/style.css      compiled Tailwind CSS (generated)
│   ├── js/main.js         menu, counters, programs map, forms, donate flow, back to top
│   └── img/               SVG illustrations, favicon, social image
├── src/input.css          Tailwind source: design tokens (@theme) and component classes
├── package.json           scripts to rebuild the CSS
├── template.json          template metadata used by freeframe.dev
├── README.md
├── CHANGELOG.md
└── DOCS.md                this guide
```

## Customizing

### Brand and colors

The palette and fonts are tokens in the `@theme` block at the top of `src/input.css`:

| Token | Used for |
|-------|----------|
| `--color-cream`, `--color-sand` | Page background and soft panels |
| `--color-ink`, `--color-muted`, `--color-line` | Text, secondary text and borders |
| `--color-sea-50` ... `--color-sea-900` | The main teal brand scale (headings, buttons, footer) |
| `--color-sun-100` ... `--color-sun-600` | Donate buttons, highlights and focus rings |
| `--color-clay-400` ... `--color-clay-600` | Warm accents (map pins, hearts) |

To re-brand, change the `sea` scale, then rebuild the CSS:

```css
@theme {
  --color-sea-500: #2563eb;
  --color-sea-600: #1d4ed8;
  --color-sea-700: #1e40af;
}
```

The donut chart on `about.html` uses literal colors (`stroke="#1a8a81"` and so on) and the `theme-color`
meta tag is `#0d5955` on every page; update those by hand.

### Typography

Headings use **Fraunces** (`--font-display`) and text uses **DM Sans** (`--font-sans`), loaded from
Google Fonts in each page's `<head>`. Replace that `<link>` on every page and the two tokens to change
them.

### Content

All words are in the HTML. Things driven by attributes or scripts:

- **Impact numbers** on `index.html`: `<span data-count="1240000">1,240,000</span>` counts up to the
  value of `data-count`. Keep the text the same as the attribute, since it's what shows without
  JavaScript.
- **Appeal progress** on `index.html`: the block with
  `data-campaign data-raised="528400" data-goal="750000"` is the only place to change: the script
  writes the raised amount (`[data-raised-text]`) and goal (`[data-goal-text]`), fills the bar
  (`[data-progress]`) and sets the progress bar's `aria-valuenow`. Keep the printed numbers in the HTML
  roughly right, since they show without JavaScript.
- **Donation amounts and impact messages**: `AMOUNTS` and `IMPACT` in the "Donate form" section of
  `assets/js/main.js` (see [Donate page](#donate-page)).
- **Programs and regions**: see [Programs map and region filter](#programs-map-and-region-filter).
- **Spending chart** on `about.html`: each slice is a `<circle>` with
  `stroke-dasharray="<length> <rest>"` on a circle of circumference 439.82 (radius 70). A slice's
  length is `percent × 439.82 − 2` (the 2 leaves a gap), its rest is `439.82 − length`, and its
  `stroke-dashoffset` is minus the total of the previous slices' `percent × 439.82`. Update the
  `<title>` texts and the "84¢" label with it.
- **Volunteer roles** and **events**: see [Volunteer roles and event RSVPs](#volunteer-roles-and-event-rsvps).
- **Stories**: every card on `stories.html` links to the one example `story.html`. Copy `story.html` for
  each new story and point the cards at the new files.

### Images and artwork

All artwork is SVG in `assets/img/`: page illustrations (`hero.svg`, `about.svg`, `donate.svg`,
`events.svg`, `involved.svg`, `cta.svg`, `lost.svg`) and story images (`story-*.svg`). Replace them
with photos of the same proportions and keep the `alt` text meaningful. Leadership portraits on
`about.html` are inline SVG. The favicon is `assets/img/favicon.svg`; the social image is
`assets/img/og-image.png` (1200×630), exported from `assets/img/og-image.svg`.

### Navigation, header and footer

The header (with its Donate button), mobile menu (`#mobile-menu`) and footer (with a newsletter form)
are repeated in every page. To add a page, copy one, replace the content inside `<main>`, and add the
link to the desktop and mobile menus and the footer on every page.

## Features

### Count-up numbers and appeal progress

Elements with `data-count` count up (1.6 s, eased) and appeal bars with `data-campaign` fill when they
scroll into view. With reduced motion the final number is shown immediately.

### Programs map and region filter

On `programs.html`, the chips with `data-filter` (`all`, `east-africa`, `southern-africa`, `south-asia`,
`latin-america`) show matching program cards (`<article data-region="...">` inside `[data-programs]`),
highlight that region's dots and pin on the map (`[data-map]`), and update `[data-region-title]`,
`[data-region-text]` and `[data-program-count]`. Clicking a map pin filters too. The region is kept in
the URL hash, so `programs.html#east-africa` links straight to it.

The region names and summaries are in `REGIONS` in `assets/js/main.js`:

```js
var REGIONS = {
  all: ['All regions', '1.24 million people across 9 countries'],
  'east-africa': ['East Africa', 'Kenya, Uganda and Ethiopia · 612,000 people'],
  // ...
};
```

To add a region, add an entry, a chip, `data-region` on the cards, and on the map give the country dots
`class="region" data-region="<id>"` and add a `<g class="pin" data-region="<id>">`.

### Donate page

The donate form (`[data-donate]` on `donate.html`) keeps a small state of frequency and amount:

- **Give once / Monthly** buttons (`data-frequency`) swap the preset amounts and set a default ($50
  once, $25 monthly).
- **Preset amounts** come from `AMOUNTS`; the **Other amount** field (`#d-custom`) has a $5 minimum.
- **Impact message**: `IMPACT` is checked from the largest amount down, and the first row the amount
  reaches is shown. Monthly gifts also show the yearly total.
- **Cover the fees** (`#d-fees`) adds 3% to the total. The summary and the submit button
  (`[data-submit-label]`) update live.
- **Dedication** (`#d-dedicate`) reveals "In honor of / In memory of", a name (then required) and an
  optional email.
- `donate.html?appeal=<id>` (used by the appeal's "Double my gift" button) shows the matched-giving note
  (`[data-appeal-note]`) when `<id>` is listed in `MATCHED_APPEALS` in `assets/js/main.js` (default
  `['dry-season']`); other values are ignored.

```js
var AMOUNTS = { once: [25, 50, 100, 250, 500], monthly: [10, 25, 50, 100, 200] };
var IMPACT = [
  [500, 'repairs a broken well serving 300 people.', 'Parts, a trained mechanic and a water test...'],
  // ... down to
  [0, 'helps bring water closer to home.', 'Every gift, of any size, is pooled...']
];
```

Keep the `[0, ...]` row last so every amount has a message. The demo card fields format themselves and
check the number (Luhn; try `4242 4242 4242 4242`), a future MM / YY expiry and a 3–4 digit CVC.

### Volunteer roles and event RSVPs

On `get-involved.html`, each "Apply for this role" button (`data-apply="Event volunteer"`) selects that
role in the application form (`#v-role`) and scrolls to it. The value must match an `<option>` in
`#v-role`. On `events.html`, each RSVP button (`data-rsvp="run"`) selects the event in `#r-event` (by
option `value`) and focuses the name field. The guests field is a stepper (`[data-stepper]` with
`data-step="-1"` / `"1"` buttons) limited by the input's `min` and `max` (1–10).

### Copy link

On `story.html`, the **Copy link** button (`data-copy-link`) copies the page address and reports the
result in `[data-copy-status]`.

### Scroll reveals

Elements with `reveal` fade up as they scroll into view (stagger with `style="--d:90ms"`). Jumping down
the page reveals everything above too. Content is visible without JavaScript (the `no-js` class) and
with reduced motion.

### Mobile menu

The menu button (`data-menu-toggle`) opens `#mobile-menu`, updates `aria-expanded` and its label, closes
with **Esc** (returning focus to the button) and closes itself on wide screens.

### Back to top button

Every page gets a "Back to top" button in the bottom-right corner, created by the "Back to top" block at
the end of `assets/js/main.js` and styled by the `.back-to-top` rules at the end of `src/input.css`. It
appears after about one screen of scrolling, scrolls to the top (instantly with reduced motion), moves
focus to the main content and steps aside while an in-page "Back to top" link is on screen. Add
`data-back-to-top-avoid` to anything you pin to the bottom of the screen (a cookie bar, chat launcher),
or `data-back-to-top-hide` to a sticky element it must never cover. To remove it, delete that JavaScript
block and the CSS rules, then rebuild the CSS.

## Forms

| Form | Page | Fields |
|------|------|--------|
| Newsletter | `index.html` | `name`, `email` |
| Footer newsletter | every page | `email` |
| Volunteer application (`#apply`) | `get-involved.html` | `name`, `email`, `role`, `availability` (checkboxes), `message` (20+ characters), `consent` |
| RSVP (`#rsvp`) | `events.html` | `event`, `name`, `email`, `guests` |
| Donation (`#donate-form`) | `donate.html` | `custom`, `fees`, `dedicate`, `dedication_type`, `dedication_name`, `dedication_email`, `first_name`, `last_name`, `email`, demo `card`, `exp`, `cvc` |

Forms with `data-validate` check required fields, email format, minimum lengths and ranges. Errors appear
under each field with `aria-invalid` and `aria-describedby`, and the first problem is focused. On
success the form's `[data-success]` message shows the text from `data-success-text` (for example
`data-success-text="Thanks for subscribing!"`) and the form resets. `{ref}` in that text is replaced with a
short reference made in the browser by `makeRef()` (`CT-` and four characters, no 0/O or 1/I); the volunteer
application and RSVP messages use it. If your form service returns its own reference, show that instead. The
messages say what happens next (Sam replies to applications within a week, as the page says; RSVPs get a
confirmation email): change them to match how you actually handle requests.

**Nothing is sent.** To connect a form to Formspree, add the endpoint as the form's `action`:

```html
<form action="https://formspree.io/f/your-id" method="POST" novalidate data-validate data-success-text="Thanks!">
```

then, in the "Generic form validation" section of `assets/js/main.js`, replace the demo success code
under the comment "To send for real" with:

```js
fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  .then(function (res) {
    if (!res.ok) throw new Error('Request failed');
    var ok = $('[data-success]', form);
    ok.textContent = (form.dataset.successText || 'Thank you!').replace('{ref}', makeRef());
    ok.classList.remove('hidden');
    form.reset();
  });
```

**Donations: never collect card numbers on your own page.** The card fields are a demo. Replace that
section with your payment provider's hosted checkout (Stripe Checkout, PayPal Giving, Donorbox...): at
the comment "Demo only: replace this with a call to your payment provider" in the "Donate form" section,
send the amount (`state.amount`), frequency (`state.freq`) and fee choice to the provider and redirect
there. The donation thank-you shows a gift reference (`CT-` and four characters) and says no payment is
taken on this site; once a provider takes the payment, show its reference and replace that sentence with
what happens next (for example, that the receipt is on its way by email).

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `twitter:card`. When you deploy,
change `og:image` on every page to an absolute URL:

```html
<meta property="og:image" content="https://example.com/assets/img/og-image.png">
```

Consider adding [NGO structured data](https://schema.org/NGO) as JSON-LD on `index.html`, a
`sitemap.xml`, and per-story titles and descriptions when you copy `story.html`. Replace the placeholder
registration line in the footer ("EIN 00-0000000") with your real details.

## Accessibility

- Skip link, landmarks, one `<h1>` per page and visible focus rings.
- Text colors meet WCAG AA contrast.
- Filter chips, frequency and amount buttons use `aria-pressed`; the map has a text title and summary.
- The donut chart has a full text `<title>` with every percentage.
- Form errors are linked to their fields; success messages use `role="status"`; the donation thank-you
  receives focus.
- Reveals and counters respect `prefers-reduced-motion`.

When editing, keep `alt` text meaningful, label new form fields, and keep the region filter's summary
text in `REGIONS` in sync with the cards.

## Building and deploying

`assets/css/style.css` is pre-built. Rebuild it after editing `src/input.css` or using Tailwind classes
that aren't in the CSS yet, including classes inside the HTML strings in `assets/js/main.js`. With
Node.js 24:

```sh
npm install
npm run build     # or: npm run watch
```

Nonprofit is a static site: upload the folder (without `node_modules/`) to Netlify, GitHub Pages,
Cloudflare Pages or any web host. No build command is needed on the host.

## Troubleshooting

- **The appeal amount or bar is wrong.** Check `data-raised` and `data-goal` on the `[data-campaign]` block;
  they drive both the printed figures and the bar.
- **"Apply for this role" leaves the role empty.** The button's `data-apply` must match an `<option>` in
  `#v-role` exactly.
- **An RSVP button doesn't select the event.** `data-rsvp` must match an option `value` in `#r-event`.
- **A program never shows for a region.** Its card's `data-region` must match a filter id in `REGIONS`.
- **New Tailwind classes have no effect.** Rebuild the CSS.
- **A form shows its thank-you message but nothing arrives.** It sends nothing until you connect it, as
  described in [Forms](#forms).

## License

Nonprofit is released under the MIT License (see `LICENSE.txt` in the download), for personal and
commercial use. The included SVG artwork is covered by the same license. Fraunces and DM Sans are
licensed under the SIL Open Font License. Clearwater Trust, its people and figures are fictional.
