# Sprocket documentation

## Overview

Sprocket is a multi-page product launch and preorder website template for a hardware startup. The demo business
is Bonfield Bikes, a fictional e-bike maker in Duluth, Minnesota, taking reservations for the Portage, a compact
cargo e-bike built for hills and winter. It is built with plain HTML, Tailwind CSS v4 and vanilla JavaScript (no
frameworks, no libraries). This is version 1.0.4 of the HTML stack. See the template page at
[freeframe.dev/templates/sprocket](https://freeframe.dev/templates/sprocket), which links to the live demo.

The template has a product configurator with an SVG bike that recolors and shows each accessory as you choose,
shareable build links and a saved build, a range estimator, production batches whose ship month and spots left
roll forward on their own, a reservation flow with a refundable deposit and a saved reservation, a car vs e-bike
cost calculator, a build log with articles, a team and careers page, and a support page with FAQ search, delivery
zones and a contact form. Every date is worked out in `America/Chicago` (Central time), whatever the visitor's own
time zone is.

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Everything works from the file system: no install, no build, no server.
3. To serve it locally instead (recommended when you edit), run any static server in the folder, for example
   `npx serve .` or `python3 -m http.server`, and open the URL it prints.

Requirements: a modern browser. Rebuilding the CSS needs Node.js 24 (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with the Portage drawing and color swatches (shows your saved build), "Reserve yours" and "Build yours" links carrying the build, the open batch with spots left and a meter, owner numbers, feature highlights, press quotes, FAQ teaser, call to action |
| `bike.html` | Configurator | Frame color, battery and accessories rendered from `BUILD`, live drawing, price breakdown, "Reserve this build", "Save this build", "Copy link", saved build panel; what every Portage includes |
| `range.html` | Range estimator | Presets, battery, rider and cargo weight, terrain, temperature, assist level, studded tires and round trip; result with a band, bars for both batteries, the working and a battery suggestion |
| `reserve.html` | Reserve | Build summary from the URL or saved build, delivery zone from the ZIP code, details form with validation, success state with a reference, saved reservation with a two-step cancel |
| `specs.html` | Specs | Key figures, full specifications, footprint drawing, comparison table, car vs Portage cost calculator |
| `journal.html` | Build log | Category filter (`?cat=`), the latest post featured, the rest in a grid, each with a drawn cover |
| `article.html` | One post (`?a=<slug>`) | Title, category, date, cover, body, author with portrait, batch call to action, three more posts; unknown slugs show the latest post with a notice |
| `about.html` | About | Story with a hill map, timeline, seven illustrated team portraits, backers, open roles with a team filter (`?team=`, `#careers`) |
| `support.html` | Support | FAQ with search, warranty, delivery zones with a ZIP checker, contact form with success state (`?topic=`) |
| `404.html` | Not found | A wheel rolling down the hill and links to the main pages |

## Project structure

```text
sprocket/
  index.html … support.html, 404.html   the pages (header and footer repeated in each)
  assets/
    css/style.css        compiled Tailwind CSS (generated, do not edit by hand)
    js/data.js           all content and settings: COMPANY, BUILD, BATCHES, ZONES, RANGE, COST, DEMO, POSTS, PEOPLE, ROLES
    js/main.js           all behavior (reads window.SPROCKET from data.js), plus the article covers and portraits
    img/favicon.svg      the sprocket mark
    img/og-image.svg     social image source
    img/og-image.png     social image used in og:image (1200×630)
  src/input.css          Tailwind source: @theme tokens, a few utilities and components
  package.json           npm scripts to rebuild the CSS
  README.md              short introduction
  DOCS.md                this guide
  CHANGELOG.md           version history
```

## Customizing

### Brand and colors

The design tokens are in the `@theme` block of `src/input.css`. Tailwind turns each `--color-*` token into
utilities (`bg-ore`, `text-lake`, `border-ink`…).

| Token | Value | Used for |
|-------|-------|----------|
| `--color-snow`, `--color-snow-2` | `#f3f2ed`, `#e8e6de` | page background, sunken bands |
| `--color-card` | `#ffffff` | cards and forms |
| `--color-ink`, `--color-ink-2`, `--color-ink-3` | `#14171a`, `#1e2327`, `#30373c` | text, dark bands, borders on dark |
| `--color-muted`, `--color-frost` | `#575c5f`, `#c9d3d6` | secondary text on light and on dark |
| `--color-ore`, `--color-ore-deep`, `--color-ore-soft` | `#c63d1f`, `#a8301a`, `#f7dbd2` | Taconite red: buttons, links, highlights |
| `--color-ember` | `#ff8a66` | the red on dark backgrounds |
| `--color-lake`, `--color-lake-deep`, `--color-lake-soft`, `--color-ice` | `#0f6672`, `#0b4e57`, `#d4e8ea`, `#9fd9e3` | Harbor teal accents |
| `--color-ok`, `--color-bad` | `#2d6a3e`, `#a8301a` | success and error text |

To change the brand red, edit `--color-ore` and its partners, rebuild the CSS, and update the few hex values
written into SVG art (the logo mark in each page header and footer, `favicon.svg`, the hero backdrop in
`index.html`):

```css
@theme {
  --color-ore: #1d5fbf;
  --color-ore-deep: #164a96;
  --color-ore-soft: #d8e5f7;
}
```

The bike's frame color is not a token: it comes from the chosen color in `BUILD.colors` (see
[Configurator](#configurator)). The repeated pieces (`.btn-ore`, `.card`, `.chip`, `.option`, `.swatch`, `.tread`
dividers and so on) are in `@layer components` in the same file.

### Typography

Headlines use **Kanit** (heavy italic uppercase, via the `headline` utility) and body text uses **Encode Sans**.
Both are loaded from Google Fonts with a `<link>` in the `<head>` of every page:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Encode+Sans:wght@400..700&amp;family=Kanit:ital,wght@0,500;0,600;0,700;0,800;1,700;1,800&amp;display=swap">
```

To swap them, change that link in every page and the `--font-sans` and `--font-display` tokens in
`src/input.css`, then rebuild the CSS. `og-image.svg` names the fonts too.

### Content

Page copy lives in the HTML files. Everything that is listed, priced or calculated lives in `assets/js/data.js`:

| Constant | What it holds |
|----------|---------------|
| `COMPANY` | name, phone, email, address, `timeZone` (`America/Chicago`), reference prefixes (`BB`, `BS`) |
| `BUILD` | `basePrice` (3895), `deposit` (150), `defaults`, `colors`, `batteries`, `accessories` |
| `BATCHES` | `firstShip: '2026-03'`, `every: 2`, `lead: 3`, `size: 120`, `minLeft: 9` |
| `ZONES` | delivery zones by ZIP prefix, with fees |
| `RANGE` | the range formula, defaults, assist levels, terrain and presets |
| `COST` | the cost calculator's electricity, upkeep and years |
| `DEMO` | `KEEP_DEMO_CURRENT` and `DEMO_ANCHOR` for journal dates |
| `CATEGORIES`, `POSTS` | the build log |
| `PEOPLE` | the team, with portrait values |
| `TEAMS`, `ROLES` | open roles |

Adding an accessory is one entry; it appears in the configurator, the price, the reserve summary and saved
builds. The key is what goes into the URL (`?acc=lock`):

```js
lock: { name: 'Frame lock & chain', price: 95, detail: 'A keyed-alike chain that plugs into the frame lock.' }
```

To draw it on the bike, add a `<g data-part="lock" hidden>…</g>` group inside the bike SVG in `index.html`,
`bike.html` and `reserve.html` (the three copies are the same drawing).

Adding a post: add an object at the top of `POSTS` (newest first) with a unique `slug`, a `cat` from
`CATEGORIES`, an `author` from `PEOPLE`, a `date` (`YYYY-MM-DD`), `minutes`, an `art` key from `ART` in
`main.js` and a `body` made of `['p', text]`, `['h2', text]`, `['ul', [items]]` and `['quote', text, who]` blocks.

### Images and artwork

All artwork is SVG drawn for this template, no photos:

- **The Portage** is inline SVG in `index.html`, `bike.html` and `reserve.html` (viewBox 800×500). The frame
  strokes have the class `frame` and take their color from the `--frame` custom property on the `<svg>`; each
  optional part is a group with `data-part` (`rack`, `kidseat`, `panniers`, `basket`, `studs`, `pogies`,
  `battery-dual`). To use photos instead, replace the SVG with one image per color and swap its `src` in
  `paintBike()` in `main.js`; keep a 16:10 frame.
- **Article covers** are drawn by the `ART` functions in `main.js` (640×400); `cover(p)` picks `ART[p.art]`.
  Replace them with images of the same ratio if you like.
- **Team portraits** are drawn by `portrait(p)` from the `skin`, `hair`, `style` (`short`, `long`, `bun`, `bald`,
  `curly`), `shirt`, `glasses` and `beard` values in `PEOPLE` (square).
- The hill map (about), zone rings (support), footprint chart (specs), feature art (home) and the 404 drawing are
  inline in their pages.
- The social image is `assets/img/og-image.svg`, exported to `og-image.png` (1200×630). The favicon is
  `assets/img/favicon.svg`.

### Navigation, header and footer

The header and footer are repeated in every page. To add a page, copy an existing one, change its `<title>`,
description, Open Graph tags, `data-page` attribute on `<body>` and its content, then add a link to the
`<nav aria-label="Main">`, the `<nav aria-label="Mobile">` and the footer in every page. Mark the current page's
links with `aria-current="page"`.

The thin bar above the header (`data-batch-line`) shows the open batch on every page; delete that `<div>` to
remove it.

## Features

### Production batches

`batchFor(dateKey)` in `main.js` works out the batch open on a date from `BATCHES` in `data.js`:

- Batch 1 ships in `firstShip` (March 2026) and a batch ships every `every` (2) months.
- The open batch is the first one shipping at least `lead` (3) months after the current month, so each batch
  takes reservations for two calendar months and closes on the last day of the second.
- Spots left fall in a straight line from `size` (120) on the first day of that window to about `minLeft` (9) on
  the last: `max(minLeft, round(size − (size − minLeft) × elapsedDays ÷ windowDays))`.

On October 31, 2026 (Central time) that gives **Batch 6, ships January 2027, 11 of 120 spots left (109 reserved),
closes Saturday, October 31**; Batch 7 opens November 1 and ships March 2027. On November 1, 2026 it is Batch 7
with 120 left. A year later (October 31, 2027) it is Batch 12, shipping January 2028, 11 left.

Any element with one of these attributes is filled in: `data-batch-name` ("Batch 6"), `data-batch-ship`
("January 2027"), `data-batch-left`, `data-batch-size`, `data-batch-taken`, `data-batch-close` ("Saturday,
October 31"), `data-batch-next` and the width of `data-batch-meter`. For a real launch with fixed dates, replace
`batchFor()` with your own table of batches.

### Configurator

`bike.html`: the options are rendered from `BUILD` in `data.js` into `[data-colors]` (an ARIA radio group of
swatches: arrow keys move and select), `[data-batteries]` (radios) and `[data-accessories]` (checkboxes).

- **Price:** `basePrice` $3,895 + battery (standard included, dual +$520) + accessories (rear rack $180, kid seat
  $240, panniers $160, front basket $135, studded tires $170, pogies $65). Example: Harbor Teal, dual battery and
  kid seat = $3,895 + $520 + $180 (rack, added automatically) + $240 = **$4,835**.
- **Dependencies:** accessories with `requires: ['rack']` (kid seat, panniers) add the rear rack, with the note
  "Rear rack & running boards added: the kid seat mounts on it."; removing the rack removes them ("Kid seat
  removed too: it mounts on the rear rack.").
- **Drawing:** `paintBike(svg, build)` sets `--frame` and shows the matching `data-part` groups (the dual battery
  shows `battery-dual`), and updates the SVG's `aria-label`.
- **URL:** every change updates the address with `history.replaceState`:
  `bike.html?color=harbor&battery=dual&acc=rack,kidseat`. "Reserve this build" links to `reserve.html` with the
  same parameters. "Copy link" copies the address, or shows it in a field to copy when the clipboard isn't
  available.
- **Saved build:** "Save this build" stores it under `sprocket:build`; the panel below then shows "Your saved
  build: Harbor Teal · Dual battery · 2 accessories · $4,835" with "Load it" and "Forget it". On a later visit
  without parameters the saved build is loaded. The home page hero shows the saved build too.

Values from the URL and storage go through `normalizeBuild()`: unknown colors and batteries fall back to the
defaults, unknown accessories are dropped, and every key is checked with `Object.prototype.hasOwnProperty`.

### Home hero

The swatches under the hero bike (`[data-hero-swatches]`) recolor it and update the "Reserve yours" and "Build
yours" links (`data-hero-reserve`, `data-hero-build`) so the chosen color carries over.

### Range estimator

`range.html`, formula in `RANGE` in `data.js`:

```text
miles = battery Wh × 0.9 × temperature factor ÷ (assist Wh/mi × terrain factor × weight factor × studs)
temperature factor = 1 at 60°F and above, else max(0.55, 1 − (60 − °F) × 0.0065)
weight factor      = 1 + (rider and cargo lb − 200) ÷ 500
assist Wh/mi       = Eco 9, Tour 13, Sport 18, Turbo 24
terrain factor     = Mostly flat 1, Rolling 1.18, Steep hills 1.42;  studded tires × 1.08
```

The result shows the miles for the chosen battery (rounded), a band of ±12%, bars for both batteries with a
dashed line at the round trip × 1.25, the working, and a suggestion: the standard battery if it covers the round
trip × 1.25, else the dual battery, else "Dual battery, and a charge at work". The suggestion links to
`bike.html?battery=<key>`. `?battery=dual` on `range.html` preselects a battery.

| Inputs | Standard | Band | Dual | Suggestion |
|--------|----------|------|------|------------|
| Defaults: 220 lb, Rolling, 50°F, Tour, no studs, 12 mi | 33 mi | 29–37 | 47 mi | standard (36% of a charge) |
| January commute: 230 lb, hills, 5°F, Sport, studs, 14 mi | 12 mi | 11–14 | 18 mi | dual (113% / 79%) |
| School run: 290 lb, Rolling, 45°F, Tour, 6 mi | 28 mi | 25–31 | 40 mi | standard |
| Summer grocery run: 260 lb, flat, 75°F, Eco, 8 mi | 56 mi | 49–62 | 80 mi | standard |

The round trip must be 1–80 miles; otherwise an inline error shows and the last valid value is kept.

### Reservation

`reserve.html`:

- **Build:** from the URL parameters, else the saved build, else the default; the line under the drawing says
  which ("Your build from the configurator.", "Your saved build.", "The standard Portage. Build your own to
  change it."). "Change" links back to the configurator with the build.
- **Delivery zone:** typing a ZIP code looks up `ZONES` by its first three digits: `556`–`558` and `548` are
  Duluth–Superior hand delivery (free), most of Minnesota, Wisconsin, Iowa, the Dakotas and the Upper Peninsula
  are Upper Midwest freight ($149), the rest of `010`–`994` is crated freight ($249), and Alaska, Hawaii and the
  territories (`995`–`999`, `967`–`968`, `000`–`009`) can't be reserved yet. The fee is added to the summary.
- **Validation:** first and last name, email, an optional 10-digit US phone number and a deliverable ZIP code.
- **Success:** "You’re in Batch 6, Sam." with a reference `BB-<batch>-<4 characters>` (from a hash of the email
  and the date: `sam@example.com` on October 31, 2026 gives `BB-06-26CD`), the ship month, the $150 refundable deposit and what happens next for the
  delivery zone. The reservation is saved under `sprocket:reservation`.
- **Return visit:** the saved reservation is shown instead of the form, with "Change my build" and "Cancel
  reservation" (a second "Yes, cancel it" step). Cancelling removes it and shows the form again with "Reservation
  BB-06-26CD canceled. Your $150 deposit will be refunded in full."

No payment is taken: see [Forms](#forms) to connect a real backend or payment provider.

### Cost calculator

`specs.html`, settings in `COST`: car = miles a week × 52 × cost a mile + parking × 12; Portage = miles × 52 ×
15 Wh ÷ 1000 × $0.16 + $240 upkeep, plus the $3,895 base price over 6 years. Payback = base price ÷ ((car −
Portage running costs) ÷ 12), shown as months, "Over 10 years" when longer or when riding costs more. Defaults
(40 mi, $0.70, $0 parking): car **$1,456**, Portage **$894** ($245 running), you keep **$562** a year, payback
**39 months**.

### Build log and articles

`journal.html` renders `POSTS` with a category filter (chips with `aria-pressed`; the choice is kept in
`?cat=`). `article.html?a=<slug>` renders one post; a missing slug shows the latest post, an unknown one shows
the latest post with a notice. The page title and meta description follow the post.

### Demo dates

Demo sites stay online for years, so nothing dated goes stale:

- **Batches** are worked out from today (see [Production batches](#production-batches)).
- **Journal dates:** with `DEMO.KEEP_DEMO_CURRENT` on, every post date moves forward by the whole weeks elapsed
  since `DEMO.DEMO_ANCHOR` (`2026-10-31`), so weekdays stay right and the newest post stays recent. On the anchor
  date nothing moves. For a real site, set `KEEP_DEMO_CURRENT: false` and write real dates.
- **Copyright year:** `<span data-year>` in the footer is filled in from today.
- **Previewing:** add `?now=YYYY-MM-DDTHH:MM` to any page (Central time) to see it on another date, for example
  `index.html?now=2027-03-02T09:00`. The configurator keeps the parameter in its URL.

### Team and roles

`about.html` renders `PEOPLE` as cards with portraits and `ROLES` as a list filtered by `TEAMS` (chips; the
filter is kept in `?team=`). Each role's "Apply" links to `support.html?topic=careers#contact`, which preselects
the topic.

### Support page

The FAQ search (`[data-faq-search]`) hides questions that don't contain the text and shows "3 questions match"
or a "No questions match" message. The ZIP checker uses the same `zoneFor()` as the reservation. The contact form
reads `?topic=` (one of the select's values) to preselect a topic.

### Header, menu, reveal and back to top

The header turns sticky with a shadow after scrolling. Below 1024px a menu button opens the mobile menu
(`aria-expanded`, Escape closes it and returns focus). Elements with `.reveal` fade in when scrolled into view,
off under reduced motion. The back-to-top button at the end of `main.js` appears after a screen of scrolling.

## Forms

The demo forms validate in the browser and show a success state, but send nothing until you connect them.

| Form | Fields | Validation |
|------|--------|------------|
| Reservation (`[data-reserve-form]`) | first, last, email, phone (optional), zip, updates | names required, email format, 10-digit phone if given, deliverable ZIP |
| Contact (`[data-contact-form]`) | name, email, topic, ref (optional), message | name, email format, reference like `BB-06-K7QD` if given, message 10+ characters |
| ZIP checker (`[data-zip-check]`) | zip | 5 digits |

To connect the contact form to a service such as Formspree, find the comment "To receive messages" in
`main.js` and post the fields before showing the success state:

```js
const res = await fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  headers: { Accept: 'application/json' },
  body: new FormData(contactForm)
});
if (!res.ok) { /* show an error and keep the form */ return; }
```

(Make the submit handler `async`.) For real reservations, replace the code after the comment "To take real
reservations" with a call to your backend or a payment provider's checkout for the $150 deposit, and show the
success state only when it confirms. Keep the line about the deposit being refundable accurate to your terms.

## Saved data (localStorage)

| Key | Shape | Validation on read |
|-----|-------|--------------------|
| `sprocket:build` | `{ "color": "harbor", "battery": "dual", "acc": ["rack", "kidseat"] }` | color must be a key of `BUILD.colors`, then `normalizeBuild()` |
| `sprocket:reservation` | `{ ref, first, last, email, phone, zip, updates, build, total, batch, shipNo, created }` | reference pattern, strings, integer batch and month number, valid `created` date, build normalized |

All access goes through `safeStorage` in `main.js`: localStorage when available, otherwise an in-memory stand-in,
so saving and reserving still work for the page view in a sandboxed iframe or with storage blocked. To reset,
use "Forget it" and "Cancel reservation", or clear the site's storage in the browser's developer tools.

## SEO and sharing

Every page has its own `<title>`, meta description, Open Graph tags (`og:title`, `og:description`,
`og:image`) and `theme-color`. `article.html` updates its title and description for the post shown. `og:image`
points at `assets/img/og-image.png`; on a live site, use an absolute URL
(`https://yourdomain.example/assets/img/og-image.png`). Add a `sitemap.xml` listing the pages and a `robots.txt`
when you deploy. If you add Product structured data, use your real prices and availability.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page and a logical heading order.
- Visible focus styles; the color swatches are a radio group with arrow-key support; filters are buttons with
  `aria-pressed`; options are real radios and checkboxes.
- Live regions announce the hero color, accessory notes, build status, range result, ZIP results and counts.
- Form errors are linked with `aria-describedby` and fields get `aria-invalid`; the first invalid field is
  focused; success states receive focus.
- The bike drawing has an `aria-label` describing the current build; decorative SVG is `aria-hidden`.
- Reveals, transitions and the back-to-top scroll respect `prefers-reduced-motion`. Text colors meet WCAG AA.

When editing, keep one `<h1>` per page, label every new input and keep `aria-controls`/`aria-describedby` ids in
step with the markup.

## Building and deploying

The compiled CSS is committed, so the site works without a build. After changing `src/input.css` or adding
Tailwind classes to the HTML or `main.js`, rebuild it (Node.js 24):

```sh
npm install
npm run build     # once
npm run watch     # rebuild on every change
```

Classes written inside JavaScript strings in `main.js` are picked up as long as they are whole class names.

To deploy, upload the whole folder to any static host: Netlify Drop, GitHub Pages, Cloudflare Pages, Vercel or
your own server. All links are relative, so it also works in a subfolder.

## Troubleshooting

- **The batch, spots left or dates look wrong.** They are worked out in Central time from today; use
  `?now=2027-01-15T09:00` to check another date, and edit `BATCHES` in `data.js`.
- **A shared configurator link opens the default bike.** Check the parameter values: they must be keys from
  `BUILD` (`?color=birch`, not `?color=Birch White`).
- **The saved build or reservation disappears on reload.** The browser is blocking storage (private mode, a
  sandboxed iframe); it then only lasts for the page view.
- **New Tailwind classes have no effect.** Rebuild the CSS with `npm run build`.
- **An accessory doesn't appear on the bike.** It needs a `<g data-part="<key>">` group in each of the three
  bike SVGs.
- **Copy link does nothing.** Clipboard access needs `https://` or `localhost`; on other origins the page shows
  the link in a field to copy instead.

## License

MIT. The code and all included artwork are free for personal and commercial use. See `LICENSE.txt` in the download.

Fonts: Kanit and Encode Sans are licensed under the SIL Open Font License and served by Google Fonts.

Bonfield Bikes, the Portage, its people, press quotes, backers, phone number and email address are fictional placeholders.
