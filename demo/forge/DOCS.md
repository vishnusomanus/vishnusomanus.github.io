# Forge documentation

## Overview

Forge is a marketing and developer website for an API product, built for **Forge**, a fictional webhooks API made
by Forge Systems, Inc. (Erie and Bellingham). Developers send each event once; Forge signs it, fans it out to
every subscribed endpoint, retries and keeps a replayable log. The site has a home page with a self-typing code
sample and an interactive API explorer, a quickstart, an SDK directory, usage-based pricing with a calculator, a
changelog, a status page, a company page, a sales form and an API key sign-up. It is plain HTML with Tailwind
CSS v4 and one vanilla JavaScript file, with no build step needed to use it. The design is terminal-inspired:
near-black surfaces inside a framed hairline grid, IBM Plex Mono labels and a single amber accent. This guide
covers version 1.0.6. See it live at [freeframe.dev/templates/forge](https://freeframe.dev/templates/forge).

## Quick start

1. Unzip the download and open `index.html` in a browser. Every page works from the file system.
2. Or serve the folder, which is closer to how it runs on a host (and lets the clipboard work everywhere):

   ```sh
   npx serve .
   ```

3. You only need Node.js 24 or newer if you change CSS classes (see
   [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Typed code sample (`#hero-code`), headline numbers, customer wordmarks, feature grid (`#features`), how-it-works diagram, API explorer (`#inspector`), reliability stats with latency chart (`#reliability`), testimonials, call to action |
| `docs.html` | Quickstart | Six steps with tabbed, copyable code (`#install`, `#auth`, `#endpoint`, `#send`, `#verify`, `#test`), "On this page" navigation, next steps |
| `sdks.html` | SDKs and tools | 16 library cards with install commands, type filter (`sdks.html?type=tool`), search, versioning policy (`#versioning`) |
| `pricing.html` | Pricing | Monthly / annual switch, four plans, volume calculator (`#calculator`), comparison table (`#compare`), FAQ accordion (`#faq`) |
| `changelog.html` | Changelog | Entries grouped by month with type tags, filter (`changelog.html?type=breaking`) |
| `status.html` | Status | Overall status, scheduled maintenance, component-by-region grid, 90-day uptime bars with a region switch, incident history |
| `company.html` | Company & careers | Story, figures, principles, team, offices, open roles (`#careers`) |
| `contact.html` | Talk to sales | What happens next, direct contacts, sales form (`contact.html?volume=250m` preselects the volume) |
| `signup.html` | Get an API key | Sign-up form that generates a demo key (`signup.html?plan=scale` shows the plan) |
| `404.html` | Not found | Terminal-style 404 response and links back into the site |

## Project structure

```text
forge/
  index.html … signup.html, 404.html   the pages (header and footer repeated in each)
  assets/css/style.css                 compiled Tailwind CSS (generated, do not edit)
  assets/js/main.js                    all JavaScript: code samples, explorer, pricing, status, filters, forms
  assets/img/favicon.svg               browser icon (the amber F mark)
  assets/img/og-image.svg              social image source (1200×630)
  assets/img/og-image.png              social image used by the pages
  src/input.css                        Tailwind source: design tokens and component classes
  package.json                         scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

The design tokens live in the `@theme` block of `src/input.css`. Every utility such as `bg-ink-900`,
`border-line`, `text-muted` or `text-brand-400` comes from them.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-ink-950` | `#09090a` | Page background |
| `--color-ink-900`, `--color-ink-850`, `--color-ink-800` | `#0f0f10`, `#141415`, `#1a1a1c` | Panels, inputs and code, tab bars |
| `--color-line`, `--color-line-strong` | `#222224`, `#333336` | Hairlines of the frame and grid; input and button borders |
| `--color-fg` | `#ecebe7` | Headings and body text |
| `--color-muted`, `--color-subtle` | `#a8a7a1`, `#8c8b85` | Secondary text, captions (AA on every surface) |
| `--color-brand-200` … `--color-brand-700` | amber scale | Primary buttons, links, focus rings, accents |
| `--color-ok`, `--color-warn`, `--color-down`, `--color-info` | green, yellow, red, blue | Status dots, uptime bars, HTTP status codes |

To change the accent, edit the brand scale and rebuild:

```css
@theme {
  --color-brand-300: #7ee0ff;
  --color-brand-400: #3cc8ff;
  --color-brand-500: #12b3f0;
}
```

A few SVGs use the accent as a literal color (`#ffbe3d`): the logo in the header, footer and favicon, the feature
illustrations and diagram on `index.html`, the team avatars on `company.html` and the latency chart in `main.js`
(section 7). Search for `ffbe3d` to change them too. The code token colors are the `.t-k`, `.t-s`, `.t-n`, `.t-c`,
`.t-f`, `.t-p` and `.t-d` classes in `src/input.css`.

Forge is a dark-only design (`color-scheme: dark` in `src/input.css` and a `color-scheme` meta tag on every page).
There is no light theme or toggle.

### Layout grid

Each page's content sits in `.frame`, a centered 1240px column with hairlines left and right. Sections are separated
by `.rule`, a top border with a small cross where it meets the frame. Card grids use `.cells` (1px gaps that show
the line color) or `.cells-open` (lines drawn per card, so a short last row stays blank; used for the filtered SDK
list). `.pad-x` gives the standard horizontal padding. `.bg-plus` is the faint field of plus marks behind heroes and
`.glow` the amber light; both are decorative and `aria-hidden`.

### Typography

Two Google Fonts are loaded by a `<link>` in the `<head>` of every page: **Host Grotesk** (text and headings) and
**IBM Plex Mono** (navigation, labels, buttons, numbers and code). The stacks are `--font-sans` and `--font-mono` in
`@theme`, each with system fallbacks. Heading sizes are the `.h-display`, `.h-section` and `.h-card` classes. To
swap a font, change the Google Fonts URL on every page and the matching token, then rebuild.

### Content

All text is in the HTML files. The data behind the interactive parts is at the top of `assets/js/main.js`
(section 1):

| Constant | What it holds |
|----------|---------------|
| `LANGS`, `LANG_KEY` | The code languages (`curl`, `node`, `python`, `go`) and the storage key for the chosen one |
| `HERO_SAMPLES` | The hero code per language, with the file name shown in the window bar |
| `HERO_RESPONSE` | The hero's status line, latency range, JSON body and delivery lines |
| `API_BASE`, `INSPECTOR` | The API explorer's base URL and endpoints (method, path, parameters, status, latency range) |
| `DELIVERIES` | Sample delivery log returned by `GET /v1/deliveries` in the explorer |
| `LATENCY` | 24 hourly p50 and p99 values for the home page chart, and the top of its axis |
| `PRICING` | Plans, included events, overage tiers, annual discount, Enterprise threshold and slider steps |
| `STATUS` | Status page window end date, components, regions and incidents, and `maintenance`: the date of the scheduled maintenance in the status page notice (`'YYYY-MM-DD'`, 02:00–02:30 UTC). `null` (the default) is a rolling demo date, the next Thursday at least three days away, so the notice never announces maintenance that has passed |
| `FREE_EMAIL` | Email domains the sales form rejects as non-work addresses (section 14) |
| `KEY_PREFIX` | Prefix of the demo API key (`fk_test_`) |

For example, to add an explorer endpoint, add an object to `INSPECTOR` and a branch for its `id` in `respond()`
inside `initInspector()`:

```js
{
  id: 'rotate', method: 'POST', path: '/v1/endpoints/{id}/rotate', status: 200, latency: [30, 60],
  desc: 'Rotate an endpoint’s signing secret.',
  params: [{ name: 'id', in: 'path', kind: 'text', value: 'ep_7Hc2Qm' }]
}
```

Parameters have a `kind` of `text`, `number` (with `min` and `max`) or `select` (with `options`), and an optional
`pattern` with an `error` message and a `hint`. The endpoint list and form are generated from the array.

Changelog entries are `<li data-filter-item="changelog" data-tags="feature fix">` items inside a month
`<section data-filter-group="changelog">` in `changelog.html`; copy one, change the date, version and text, and list
its types in `data-tags` (`feature`, `improvement`, `fix`, `breaking`). SDK cards are
`<li data-filter-item="sdks" data-tags="sdk">` items in `sdks.html` (`sdk`, `framework` or `tool`). Plan prices are in
the HTML of `pricing.html` and in `PRICING` (see [Pricing calculator](#pricing-calculator)). Incidents shown in the
history list on `status.html` are HTML; keep them in step with `STATUS.incidents`.

### Images and artwork

There are no photos. Everything is SVG or CSS:

- **Logo** — the amber square with an F in the header and footer is inline SVG on every page; the same mark is
  `assets/img/favicon.svg`. The `forge_` wordmark is text, and its underscore blinks on hover.
- **Customer wordmarks** — inline SVG on `index.html`, each with `role="img"` and an `aria-label`.
- **Feature illustrations and the how-it-works diagram** — inline SVG and HTML mock-ups on `index.html`, marked
  `aria-hidden="true"`. The diagram is hidden below 768px, where the four numbered steps tell the same story.
- **Avatars** — monogram squares in inline SVG (testimonials and team). To use photos, replace each `<svg>` with an
  `<img>` of the same size class (square, at least 160×160 px) and a real `alt`.
- **Office skylines** — small inline SVGs on `company.html`.
- **Social image** — `assets/img/og-image.png` (1200×630) is what the pages reference. Edit
  `assets/img/og-image.svg` and export it to PNG at 1200×630; most social sites don't display SVG.

### Navigation, header and footer

The header and footer are repeated in every page. To add a page, copy an existing page, change its `<title>`,
description and Open Graph tags, and add a link to the `<nav aria-label="Main">` list and the
`<nav aria-label="Mobile">` list in every page's header (and the footer columns if you like). The current page gets
`aria-current="page"` on its links, which also draws the amber underline. The header becomes frosted after
scrolling (class `is-scrolled`, set in section 3 of `main.js`).

## Features

### Code language tabs

Every `[data-lang-tabs]` tablist on a page shows the same language: the hero sample on `index.html` and every code
group plus the language picker on `docs.html`. A code group is a `[data-code-group]` element with panels marked
`data-lang-panel="node"` (and so on); groups without the chosen language keep their current panel. The choice is
saved (see [Saved data](#saved-data-localstorage)), so picking Go on the home page also opens the quickstart in Go.

- **Code:** `selectLang()` and `initLangTabs()` in section 4 of `assets/js/main.js`.
- **Highlighting:** `<code data-highlight="python">` blocks are colored on load by `highlight()` (section 2), a
  small tokenizer for `curl` (shell), `node`, `python`, `go` and `json`. The HTML stays plain text, so you can paste
  new samples without adding spans.
- **Accessibility:** tabs use `role="tab"` with `aria-selected` and a roving `tabindex`; arrow keys, Home and End
  move between them. Code blocks are focusable so keyboard users can scroll them.

### Typed hero sample

`initHero()` (section 5) types `HERO_SAMPLES[lang].code` with live highlighting, shows "sending…", then prints the
`HERO_RESPONSE` JSON line by line and the three delivery results. It starts when the sample is on screen, restarts
when the language changes, and "Run again" (`#hero-replay`) replays it. The latency is a random number in
`HERO_RESPONSE.latency`. With reduced motion, everything appears at once and nothing animates. The response area is
an `aria-live="polite"` region.

### API explorer

`#inspector` on the home page lets visitors pick one of the `INSPECTOR` endpoints, edit its parameters and send. It
shows the full URL, an equivalent `curl` command (updated as you type), the status, latency, size, a JSON body and a
Headers tab (`forge-request-id`, `forge-version`, and `ratelimit-remaining` counting down from 5000). A first
request is sent on load so the panel is never empty.

- **Errors:** empty values, numbers outside `min`/`max` and failed `pattern` checks return `422` with an
  `invalid_request_error`; event ids that don't match `evt_…` and endpoint ids that don't match `ep_…` return `404`.
- **Responses:** built by `respond()` in `initInspector()` (section 6). `GET /v1/deliveries` filters `DELIVERIES` by
  `status` and returns up to `limit` items with `has_more`.
- **Keyboard:** Ctrl/Cmd + Enter sends from any field. Endpoints are a radio group; Body and Headers are tabs.
- **Connecting a real API:** replace `respond()` with a `fetch()` to your own backend proxy. Never put a secret API
  key in browser code.

### Latency chart

`initLatency()` (section 7) draws `LATENCY.p50` (solid amber with a fill) and `LATENCY.p99` (dashed) into
`#lat-chart` as an inline SVG with gridlines at 0, 100, 200 and 300 ms. It redraws on resize so labels stay the
same size. The SVG has `role="img"` and an `aria-label` with the ranges.

### Pricing calculator

On `pricing.html`, `initPricing()` (section 8) wires up:

- **Billing switch** `#billing-toggle` (`role="switch"`, `aria-checked`). Elements with `data-price-monthly` and
  `data-price-annual` show one or the other; `data-billing-note` elements switch between their `data-monthly` and
  `data-annual` text. Monthly is the default.
- **Volume slider** `#calc-volume`, whose positions are `PRICING.steps` (10k to 500M events, default step
  `PRICING.defaultStep`). For each volume, `planCost()` prices every plan: the base fee (minus
  `PRICING.annualDiscount` when annual), plus overage per million across the plan's `tiers`. The cheapest plan that
  can carry the volume wins (Free has no overage, so it stops at 100k). Its card gets the `is-recommended` outline and
  a "Fits your volume" badge, and the breakdown lists each tier. From `PRICING.enterpriseFrom` (250M) the result is
  Enterprise and the button links to `contact.html?volume=250m`.

Default prices: Free $0 (100k events), Build $29 (1M included, $20 per extra million), Scale $249 (15M included,
$12 per million up to 100M, then $8). To change prices, edit `PRICING` and the matching text in the plan cards and
comparison table. The slider has `aria-valuetext`, and the result is announced politely after changes stop.

### Status page

`initStatus()` (section 12) renders one row of 90 daily bars per component into `#uptime`, ending on `STATUS.end`
(UTC). A day's color is the worst incident that touched it (`warn`, `down` or `info`); uptime per day subtracts
outage minutes in full and degraded minutes at half, weighted by how many of the selected regions were affected.
Maintenance doesn't count as downtime.

- **Region switch:** the `[data-region]` buttons (`all`, `us-east`, `eu-central`, `ap-southeast`) recalculate the bars
  and averages for one region.
- **Tooltips:** `#uptime-tip` shows the date, state, uptime and incident on hover and on focus. Bars use a roving
  `tabindex`: Tab enters a row on today's bar, arrow keys, Home and End move between days, Escape hides the tooltip.
  Each bar also has a full `aria-label`.
- **Phones:** below 640px only the last 30 days are shown.
- **Current status grid:** the cells in `#status-grid` have `data-cell="ok"`; set `warn`, `down` or `info` to change
  one. Update the banner text at the top of the page to match.

### Filters and search

`initFilters()` (section 11) powers the changelog and SDK directory. A container `[data-filter="name"]` holds
buttons with `data-filter-value` (`all` plus one per tag); items are `[data-filter-item="name"]` with space-separated
`data-tags`. Counts are filled into `.seg-count`. An input with `data-filter-search="name"` (SDKs) also matches item
text. `data-filter-param="type"` keeps the choice in the URL, `[data-filter-group]` hides month headings with no
visible entries, and `[data-filter-empty]` shows when nothing matches. Buttons use `aria-pressed`, and "Showing 3
entries" is announced (`data-filter-noun` sets the word).

### Copy buttons

Buttons with `data-copy` copy text to the clipboard (section 10). With a value (`data-copy="npm install
@forgehq/node"`) they copy that; empty, they copy the visible panel of their `[data-code-group]` or the code in their
`[data-copy-scope]`. The label changes to "Copied" and a live region announces it.

### Quickstart navigation

`initToc()` (section 13) marks the step you're reading in the `[data-toc]` sidebar with `aria-current="true"`. The
sidebar shows from 1024px; a help column with the base URL appears from 1280px.

### FAQ accordion, menu, reveals and back to top

`[data-accordion]` on `pricing.html` keeps one answer open at a time (`aria-expanded`, `aria-controls`); without
JavaScript every answer is visible. The mobile menu (`#menu-toggle`, `#mobile-menu`) uses `aria-expanded`, closes on
Escape and when the window grows to desktop width. Elements with `.reveal` fade up as they enter the viewport
(`reveal-d1` to `reveal-d3` add a delay); nothing is hidden for reduced motion or without JavaScript. A back-to-top
button appears after one screen of scrolling; delete the last block of `main.js` and the `.back-to-top` styles to
remove it.

## Forms

There are three forms, validated by section 14 of `assets/js/main.js` with inline messages, `aria-invalid`,
`aria-describedby` and focus on the first problem:

| Form | Where | Checks |
|------|-------|--------|
| `data-form="newsletter"` | Footer of every page | Email required and well-formed |
| `data-form="contact"` | `contact.html` | First and last name, work email (`data-validate="work-email"` rejects `FREE_EMAIL` domains), company, volume, topic, message of 20 to 1000 characters (with a counter), consent box |
| `data-form="signup"` | `signup.html` | Email, password of at least 12 characters, project name (`pattern`, 3–32 lowercase letters, digits or dashes), region (radio group), terms box |

Messages come from the field's `data-label` ("Company is required."), `data-required` (checkboxes and radio groups)
and `data-pattern-message`.

On a valid sign-up, the form is replaced by `#key-panel`: a demo key made of `KEY_PREFIX` and 32 random characters
from `crypto.getRandomValues`, shown masked (`fk_test_••••…` plus the last four), with a Reveal button
(`aria-pressed`), Copy, a ready-made `curl` snippet and "Start over". The key is never stored or sent, and it works
against no API. The panel tells the visitor to keep the key on their server and where live keys are; change that
text if your dashboard differs.

The success messages read as if the form had been sent. The newsletter one asks the subscriber to look out for a
confirmation email. The sales one promises a reply from a solutions engineer within one business day (like "What
happens next" on `contact.html`: change both if yours differs) and shows a short reference (`FG-` and four
characters, made by `makeRef()` in section 14; use your form service's own reference instead if it returns one).

**The forms don't send anything until you connect them.** To connect a form service such as
[Formspree](https://formspree.io), replace the `successSwap(...)` call for that form in `initForms()` with a
request:

```js
setupValidation(contact, () => {
  fetch('https://formspree.io/f/your-id', {
    method: 'POST',
    body: new FormData(contact),
    headers: { Accept: 'application/json' }
  }).then((r) => {
    if (r.ok) successSwap(contact, '<p class="text-xl">Thanks, we’ll be in touch.</p>');
    else alert('Something went wrong. Please try again.');
  });
});
```

Every input has a `name`, so `FormData` sends all fields. For a real sign-up, post the form to your own backend and
show the key it returns; never generate real keys in the browser.

## Saved data (localStorage)

| Key | Value | Validation |
|-----|-------|------------|
| `forge-code-lang` | `curl`, `node`, `python` or `go` | Ignored unless it is one of `LANGS` |

It stores the preferred code language for the hero sample on `index.html` and the code groups on `docs.html`. Reading and
writing are wrapped in `try`/`catch`, so blocked storage only means the choice isn't remembered. To reset it, run
`localStorage.removeItem('forge-code-lang')` in the console; to stop saving, remove the `store(LANG_KEY, lang)` call
in `selectLang()`.

## SEO and sharing

Every page has its own `<title>`, meta description, `og:title`, `og:description`, `og:image`, `theme-color` and
`twitter:card` in its `<head>`; `404.html` also has `noindex`. Social sites need an absolute URL for the image, so
after deploying change

```html
<meta property="og:image" content="assets/img/og-image.png">
```

to `https://your-domain.com/assets/img/og-image.png` on every page, and add
`<meta property="og:url" content="https://your-domain.com/pricing.html">` per page. Add a `sitemap.xml` listing the
pages and a `robots.txt` pointing to it, and configure `404.html` as your host's not-found page (it then shows the
requested path in its terminal). There is no structured data; `Organization` and `SoftwareApplication` JSON-LD are
good additions.

## Accessibility

Built in:

- Skip link to `#main`, landmarks (`header`, labeled `nav`s, `main`, `footer`) and one `<h1>` per page with ordered
  headings.
- Visible amber focus rings and color contrast that passes WCAG AA on every surface.
- ARIA patterns: menu button with `aria-expanded`, tabs with roving `tabindex`, a switch (`role="switch"`), accordion
  buttons, `aria-pressed` filters and region buttons, a radio group for explorer endpoints, keyboard-navigable uptime
  bars with tooltips, live regions for the hero response, explorer, calculator, filters and copy buttons, and
  labeled scrollable tables (`role="region"`, `tabindex="0"`).
- `prefers-reduced-motion`: no typing, no flowing diagram lines, no blinking cursors, no reveals, instant back to top.
- Decorative SVG and mock-ups are `aria-hidden`; meaningful graphics (wordmarks, the latency chart) have labels.

When editing, keep one `<h1>` per page, give every new input a `<label>`, and check contrast if you change the
`ink`, `line`, `muted` or `subtle` tokens.

## Building and deploying

`assets/css/style.css` is generated from `src/input.css` and the classes used in the HTML and `main.js`. Rebuild it
whenever you use a Tailwind class that isn't already in the site, or change `src/input.css`:

```sh
npm install
npm run build     # one-off, minified
npm run watch     # rebuild while you edit
```

Classes that only appear inside JavaScript strings must be written out in full in `main.js` so Tailwind sees them.
Then upload the whole folder to any static host: Netlify Drop, Cloudflare Pages, GitHub Pages, Vercel or an S3
bucket. There is no server code. `src/`, `package.json` and the Markdown files aren't needed on the host.

## Troubleshooting

- **A new Tailwind class has no effect.** Run `npm run build`; the shipped CSS only contains classes that were used
  when it was built.
- **The hero code appears all at once.** Your system has "reduce motion" turned on; typing is intentionally skipped.
- **Copy buttons say "Press Ctrl+C".** The browser blocked clipboard access (some do for `file://` pages). Serve the
  folder with `npx serve .` or deploy it.
- **The quickstart always opens in curl.** Your browser blocks `localStorage` (private mode or strict settings);
  the tabs still sync within the page.
- **Calculator totals don't match new prices.** Prices are in two places: `PRICING` in `main.js` and the text in
  `pricing.html`. Update both.
- **Uptime bars and the incident list disagree.** The bars come from `STATUS.incidents`; the history list is HTML.
  Edit both, and move `STATUS.end` to the last day you want to show.
- **Social previews show no image.** `og:image` must be an absolute `https://` URL to the PNG.
- **A form shows its success message but nothing arrives.** It sends nothing until you connect it; see
  [Forms](#forms).
- **Fonts look different.** The pages load Host Grotesk and IBM Plex Mono from Google Fonts; offline or blocked, the
  system fallbacks are used.

## License

MIT, as in the repository's license (included as `LICENSE.txt` in the download). Free for personal and commercial
use. All artwork (logo, wordmarks, avatars, diagrams and social image) is original SVG and covered by the same
license.
