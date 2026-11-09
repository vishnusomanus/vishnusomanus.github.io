# Orbit documentation

## Overview

Orbit is a bright, product-led SaaS marketing website for **Orbit**, a fictional shift-scheduling app made by
Orbit Works, Inc. (Overland Park and Lenexa, Kansas) for restaurants, cafés, hotels and shops. The home page opens on a live
schedule demo that visitors can click, drag and auto-fill, and the site continues with feature deep-dives,
pricing with a calculator, an integrations directory, customer stories, a changelog, a company and careers
page, a sales form and a three-step trial sign-up. It is plain HTML with Tailwind CSS v4 and one vanilla
JavaScript file, with no build step needed to use it. The design is light and friendly: warm paper
backgrounds, pastel panels, a coral accent, rounded UI and the Gabarito display face. This guide covers
version 1.0.6. See it live at [freeframe.dev/templates/orbit](https://freeframe.dev/templates/orbit).

## Quick start

1. Unzip the download and open `index.html` in a browser. Every page works from the file system.
2. Or serve the folder, which is closer to how it runs on a host:

   ```sh
   npx serve .
   ```

3. You only need Node.js 24 or newer if you change CSS classes (see
   [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with the interactive schedule demo (`#schedule-demo`), logo strip, before/after panels, feature bento, product tour tabs (`#tour`), testimonials with metrics, integrations orbit, call to action with stats |
| `features.html` | Features | Six deep-dives with mock-ups (`#builder`, `#availability`, `#swaps`, `#labor`, `#time`, `#messages`), comparison with spreadsheets and group chats (`#compare`) |
| `pricing.html` | Pricing | Monthly / annual switch, four plans, price calculator (`#calculator`), comparison table with sticky header (`#compare`), FAQ accordion (`#faq`) |
| `integrations.html` | Integrations | Search, category filter (`integrations.html?category=payroll`), 20 integration cards, detail drawer (`integrations.html?integration=paywell`), API teaser |
| `customers.html` | Customers | Headline stats, featured story with an SVG chart, nine stories filterable by industry (`customers.html?industry=hotels`) |
| `changelog.html` | Changelog | Dated updates on a timeline, topic filter (`changelog.html?tag=mobile`), email subscription form |
| `about.html` | About and careers | Story, figures, values, team, open roles (`#careers`), offices |
| `contact.html` | Talk to sales | Routing panel, demo request form (`contact.html?size=500&topic=careers` preselects fields) |
| `signup.html` | Start free trial | Three-step sign-up form (`signup.html?plan=team` shows the chosen plan) |
| `404.html` | Not found | Orbit illustration and links back to the site |

## Project structure

```text
orbit/
  index.html … signup.html, 404.html   the pages (header and footer repeated in each)
  assets/css/style.css                 compiled Tailwind CSS (generated, do not edit)
  assets/js/main.js                    all JavaScript: schedule demo, tabs, pricing, filters, drawer, forms
  assets/img/favicon.svg               browser icon (the Orbit planet mark)
  assets/img/og-image.svg              social image source (1200×630)
  assets/img/og-image.png              social image used by the pages
  src/input.css                        Tailwind source: design tokens and component classes
  package.json                         scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

The design tokens live in the `@theme` block of `src/input.css`. Every utility such as `bg-cream`,
`text-ink-soft` or `bg-coral-500` comes from them.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-paper` | `#fdfaf5` | Page background |
| `--color-cream`, `--color-sand`, `--color-line` | `#f7f1e7`, `#efe6d8`, `#e7dece` | Alternate panels, slider tracks, borders |
| `--color-ink` | `#1f1d3d` | Headings, body text, primary buttons |
| `--color-ink-soft`, `--color-ink-faint` | `#4a4766`, `#64617e` | Secondary text and captions (AA on every light surface) |
| `--color-coral-100` … `--color-coral-700` | coral scale | Brand accent: logo, highlights, CTA panel; `coral-700` for links |
| `--color-peach`, `-mint`, `-lilac`, `-butter`, `-sky`, `-blush` | pastels | Panels, shift blocks, chips |
| `--color-peach-ink`, `-mint-ink`, … | deep partners | Text placed on the matching pastel |

To change the brand color, edit the coral scale and rebuild:

```css
@theme {
  --color-coral-300: #93c5fd;
  --color-coral-500: #3b82f6;
  --color-coral-700: #1d4ed8;
}
```

The hero background blobs are the `.bg-mesh` class, the highlighter effect behind headline words is `.marker`
(with `.marker-peach`, `.marker-mint` and `.marker-lilac` variants), and dashed rings are `.orbit-ring`, all in
`src/input.css`. Orbit is light-only (`color-scheme: light`); there is no dark theme.

### Typography

Two Google Fonts are loaded by a `<link>` in the `<head>` of every page: **Gabarito** for headings
(`--font-display`, applied to `h1`–`h4` in the base layer and the `font-display` utility) and **Rethink Sans**
for text (`--font-sans`). Both stacks have system fallbacks. To swap a font, change the Google Fonts URL on
every page and the matching token, then rebuild. The customer wordmarks are inline SVG `<text>` and also use
these fonts.

### Content

All text is in the HTML files. The settings behind the interactive parts are at the top of
`assets/js/main.js` (section 1):

| Constant | What it holds |
|----------|---------------|
| `DEMO` | Schedule demo rules: hours per shift, the overtime limit, how many people each AM/PM shift needs per day, labels and spoken descriptions |
| `PRICING` | Team and Business prices per location and per employee (monthly and annual), Starter limits, the Enterprise threshold |
| `CONTACT_ROUTES` | Who answers each team size on the sales form, with their reply time |
| `PLAN_LABELS`, `TRIAL_DAYS` | Plan names on the sign-up page and the trial length |
| `FREE_EMAIL` | Email domains the sales form rejects as non-work addresses (section 10) |

Lists of things are written directly in the HTML so they work without JavaScript:

- **Integrations**: each card in `integrations.html` is an `<li data-filter-item="integrations" data-tags="payroll" data-search="...">`. The drawer content is the `<template data-detail>` inside the card. To add one, copy a card, change the logo color, name, category (`data-tags`), the `data-drawer-open` id, the lowercase `data-search` words and the template text.
- **Customer stories**: `<li data-filter-item="customers" data-tags="hotels">` in `customers.html`. Industries are `restaurants`, `cafes`, `hotels`, `retail` and `leisure`.
- **Changelog entries**: `<li data-filter-item="changelog" data-tags="new mobile">` in `changelog.html`, each with an `id` for deep links.
- **Plans**: the cards and the comparison table in `pricing.html`.

For example, a new changelog entry:

```html
<li id="tips-report" data-filter-item="changelog" data-tags="new" class="relative pb-12 last:pb-0">
  <span class="absolute top-1.5 -left-[2.05rem] h-4 w-4 rounded-full border-[3px] border-paper bg-coral-500 ring-2 ring-coral-200 sm:-left-[3.05rem]" aria-hidden="true"></span>
  <article class="reveal">
    <p class="flex flex-wrap items-center gap-2 text-sm"><time datetime="2026-11-02" class="font-semibold text-ink-soft">November 2, 2026</time><span class="chip bg-mint text-mint-ink">New</span></p>
    <h2 class="mt-3 font-display text-2xl font-bold tracking-[-0.02em]"><a href="#tips-report" class="hover:underline">Tips report by shift</a></h2>
    <div class="mt-3 grid max-w-2xl gap-3 text-[16px] leading-relaxed text-ink-soft"><p>What changed and why it matters.</p></div>
  </article>
</li>
```

Filter counts update themselves; no JavaScript change is needed.

### Images and artwork

There are no photos. Everything is SVG or CSS:

- **Logo**: the planet-with-ring mark is inline SVG in the header and footer of every page; the same mark is
  `assets/img/favicon.svg`.
- **Customer wordmarks** (Lantern Coffee, Fernhill Hotels and others) are inline SVG with `role="img"` and an
  `aria-label`. Keep those when you replace them with real logos.
- **Integration logos** are colored rounded squares with a white glyph, inline SVG and `aria-hidden` (the name
  is next to them).
- **Avatars** are illustrated SVG portraits. To use photos, replace an `<svg>` with an `<img>` of the same size
  classes (square; at least 640×640 px for the team grid, 96×96 px elsewhere) and a real `alt`.
- **Product mock-ups** (schedule grids, phone screens, timesheets, charts) are HTML and inline SVG. Decorative
  ones are `aria-hidden="true"`; the Fernhill chart on `customers.html` has a text label.
- **Social image**: `assets/img/og-image.png` (1200×630) is what the pages reference. Edit
  `assets/img/og-image.svg` and export it to PNG at 1200×630; most social sites don't display SVG.

### Navigation, header and footer

The header and footer are repeated in every page. The header is a floating pill: `<nav aria-label="Main">` for
desktop and `<nav aria-label="Mobile">` inside `#mobile-menu` for small screens (which also lists Changelog and
Talk to sales). To add a page, copy an existing one, change its `<title>`, description and Open Graph tags, and
add the link to both navs on every page (and a footer column if you like). The current page gets
`aria-current="page"` on its links, which also styles them. The header gains a white background and shadow
after scrolling (class `is-scrolled`, set in section 3 of `main.js`).

## Features

### Schedule demo

The hero of `index.html` has a week schedule (`#schedule-demo`) for five people. Each cell is a button with a
`data-shift` of `am`, `pm`, `off` (approved time off, locked) or empty.

- **Click or Enter/Space** cycles a cell: empty → AM → PM → empty. **A** and **P** set AM or PM, **Delete** or
  **Backspace** clears. **Arrow keys**, **Home** and **End** move between cells (one tab stop for the grid).
- **Drag** an AM or PM shift onto another cell to move it; if that cell has a shift, the two swap. Time-off
  cells can't be changed or dropped on.
- The **Needs** row shows a check mark or the number of missing people per day; the ring and percentage show total
  coverage; under each name are scheduled hours, with "over" when someone goes past `DEMO.maxHours`.
- **Auto-fill** gives each open shift to the free person with the fewest hours without going over the limit.
  **Reset** restores the starting schedule, and **Publish** shows a toast (it sends nothing).
- **Code:** `initScheduleDemo()` in section 4 of `assets/js/main.js`. The starting schedule is read from the HTML
  (`data-shift` on each cell), so edit the table to change it; change `DEMO.needs` to change what counts as
  covered.
- **Accessibility:** cells have labels such as "Maya, Friday: evening shift, 2 pm to 10 pm"; the table has a
  caption with the keyboard instructions; the coverage note is a polite live region, and drag moves are
  announced. Drag is an extra, everything also works by click or keyboard.

### Product tour

`#tour` on the home page is a vertical `role="tablist"` with four tabs that swap HTML mock-ups. `initTabs()`
(section 5) handles click, Arrow keys, Home and End with a roving `tabindex`. Any `role="tablist"` on any page
gets the same behavior; panels are linked with `aria-controls`.

### Pricing and calculator

On `pricing.html`, `initPricing()` (section 6) wires up:

- **Billing switch** `#billing`, a `role="radiogroup"` of two buttons with `aria-checked` (annual by default).
  Elements with `data-price-monthly` and `data-price-annual` show one or the other; `[data-billing-note]` swaps
  between its `data-monthly` and `data-annual` text.
- **Calculator** `#calc` with `#calc-locations` (1–30), `#calc-employees` (5–600) and the `plan` radios. The
  total is locations × location fee + employees × employee fee from `PRICING`, following the billing switch.
  It shows the yearly saving, suggests Starter for one location with up to 15 people, and suggests sales from
  500 people (changing the button link too).
- **Comparison table** `#compare`: the header row is `position: sticky` below the floating header. Its wrapper
  uses `overflow-clip` (not `overflow-hidden`) so sticky keeps working; on phones "Unlimited" shows as ∞ with
  the word kept for screen readers.

To change prices, edit `PRICING` and the matching text in the plan cards and table. Sliders announce readable
values (`aria-valuetext`), and the total is announced politely after changes stop.

### Filters and search

`initFilters()` (section 8) powers the integrations directory, customer stories and changelog. A container
`[data-filter="name"]` holds buttons with `data-filter-value` (`all` plus one per tag); items are
`[data-filter-item="name"]` with space-separated `data-tags`. Counts fill `.pill-count`, and the
`[data-filter-status="name"]` line says "Showing 3 integrations" (the noun comes from `data-filter-noun` and
`data-filter-plural`).

- `data-filter-param` keeps the choice in the URL (`category`, `industry`, `tag`), so filtered views can be
  linked to and shared.
- On `integrations.html`, `#int-search` (`data-search-input="integrations"`) matches every word against each
  item's `data-search` text and is kept in the URL as `?q=`. `[data-filter-empty]` shows when nothing matches,
  with a `[data-filter-reset]` button that clears the search.
- Buttons use `aria-pressed`; status lines are polite live regions.

### Integration drawer

Each integration card's name is a button with `data-drawer-open`. `initDrawer()` (section 9) copies the card's
`<template data-detail>` into the native `<dialog id="int-drawer">` and opens it with `showModal()`, so focus is
trapped and Escape closes it. Clicking the dimmed backdrop or the close button also closes it, and focus returns
to the card. The open integration is kept in the URL (`?integration=paywell`) and opens on load. The slide-in
animation is the `.drawer` class in `src/input.css`.

### FAQ accordion

`[data-accordion]` on `pricing.html` contains `.acc-item` rows; each button has `aria-expanded` and
`aria-controls`. One answer is open at a time; remove the loop over `items` in `initAccordions()` to allow
several. Without JavaScript every answer is visible. Customer stories use native `<details>` for "How they did
it".

### Header, menu, reveals and back to top

The mobile menu (`#menu-toggle`, `#mobile-menu`) uses `aria-expanded`, closes on Escape and when the window grows
to desktop width. Elements with `.reveal` fade up as they scroll into view (`reveal-d1` to `reveal-d3` add a
delay), and everything above a revealed element is revealed too. Numbers with `data-count` count up once. The
integrations orbit on the home page turns slowly (`.spin-slow`). A back-to-top button appears after one screen
of scrolling; delete the last block of `main.js` and the `.back-to-top` styles to remove it. All motion is off
for visitors who prefer reduced motion.

## Forms

All forms are validated by section 10 of `assets/js/main.js` with inline messages, `aria-invalid`,
`aria-describedby` and focus on the first problem. Rules come from `required`, `type`, `minlength` and
`data-validate` (`work-email`, `phone`, `count`, `password`, `email-list`). Fields inside a `hidden` container are
skipped.

| Form | Where | Checks |
|------|-------|--------|
| `data-form="newsletter"` | Footer of every page | Email required and well-formed |
| `data-form="updates"` | `changelog.html` sidebar | Email, plus a frequency choice |
| `data-form="contact"` | `contact.html` | Names, work email (rejects `FREE_EMAIL`), optional phone, business, industry, team size, locations (whole number), rollout timing (only for 100+ people), at least one interest, optional message of 10+ characters, consent |
| `data-form="signup"` | `signup.html` | Step 1: name, email, password (8+ characters with a number or symbol). Step 2: business, industry, locations, team size. Step 3: optional invite emails (each checked), terms |

**Sales routing.** Choosing a team size on `contact.html` updates the "Who you'll talk to" panel from
`CONTACT_ROUTES` (avatar, name, text, reply time) and shows the rollout question for 100 people or more.
`?size=` accepts a number or `small`, `mid`, `large`, `enterprise`; `?topic=` preselects the topic.

**Sign-up steps.** Continue validates only the current step. The stepper marks steps as done, current
(`aria-current="step"`) or upcoming, and focus moves to each step's heading. The final step shows a summary with
the trial end date (`TRIAL_DAYS` from today).

**Success messages.** The newsletter and updates forms ask the visitor to look out for a confirmation email. The
sales form says who has the request (from `CONTACT_ROUTES`), repeats their reply time and shows a short reference
(`OR-` and four characters, made in the browser by `makeRef()`; use your form service's own reference instead if
it returns one). The sign-up summary says a link to confirm the email address has been sent. Change any of these
if your service works differently.

**The forms don't send anything** until you connect them, although their success messages read as if they had.
To connect a form service such as [Formspree](https://formspree.io), replace the `successSwap(...)` call in
`initForms()` with a request:

```js
setupValidation(form, () => {
  fetch('https://formspree.io/f/your-id', {
    method: 'POST',
    body: new FormData(form),
    headers: { Accept: 'application/json' }
  }).then((r) => {
    if (r.ok) successSwap(form, '<p class="font-semibold">Thanks, we’ll be in touch.</p>');
    else $('[data-form-status]', form).textContent = 'Something went wrong. Please try again.';
  });
});
```

For the sign-up form, send `new FormData(form)` to your own backend in the last-step branch of `initSignup()`
(marked with a comment) instead of building the summary. Never create accounts or store passwords from
client-side code alone. Every input has a `name`, so `FormData` sends all fields.

## SEO and sharing

Every page has its own `<title>`, meta description, `og:title`, `og:description`, `og:image`, `theme-color` and
`twitter:card` in its `<head>`. Social sites need an absolute URL for the image, so after deploying change

```html
<meta property="og:image" content="assets/img/og-image.png">
```

to `https://your-domain.com/assets/img/og-image.png` on every page, and add
`<meta property="og:url" content="https://your-domain.com/pricing.html">` per page. Add a `sitemap.xml` listing
the pages and a `robots.txt` pointing to it; configure `404.html` as your host's not-found page and leave it out
of the sitemap. There is no structured data; `Organization`, `SoftwareApplication` (with offers from the pricing
page) and `FAQPage` JSON-LD are good additions.

## Accessibility

Built in:

- Skip link to `#main`, landmarks (`header`, labeled `nav`s, `main`, `footer`) and one `<h1>` per page with
  ordered headings.
- Visible coral focus rings and color contrast that passes WCAG AA; pastel chips always use their deep `-ink`
  partner for text.
- ARIA patterns: menu button with `aria-expanded`, tabs with roving `tabindex`, a radiogroup billing switch,
  accordion buttons, `aria-pressed` filters, a modal `<dialog>`, a step indicator with `aria-current`, and live
  regions for the demo, calculator, filters and toasts.
- The schedule demo works fully by keyboard, with a caption that explains the keys.
- `prefers-reduced-motion`: no reveals, orbit spin, floating badges, count-ups or drawer slide.

When editing, keep one `<h1>` per page, give every new input a `<label>`, keep decorative SVG `aria-hidden`, and
check contrast if you change the `ink`, pastel or coral tokens.

## Building and deploying

`assets/css/style.css` is generated from `src/input.css` and the classes used in the HTML and `main.js`. Rebuild
it whenever you use a Tailwind class that isn't already in the site, or change `src/input.css`:

```sh
npm install
npm run build     # one-off, minified
npm run watch     # rebuild while you edit
```

Classes that only appear inside JavaScript strings must be written out in full in `main.js` so Tailwind sees
them. Then upload the whole folder to any static host: Netlify Drop, Cloudflare Pages, GitHub Pages, Vercel or
an S3 bucket. There is no server code. `src/`, `package.json` and the Markdown files aren't needed on the host.

## Troubleshooting

- **A new Tailwind class has no effect.** Run `npm run build`; the shipped CSS only contains classes that were
  used when it was built.
- **Calculator totals don't match the plan cards.** Prices live in `PRICING` in `main.js` and in the text of
  `pricing.html`. Update both.
- **Dragging shifts doesn't work on my phone.** Drags start after a small movement; vertical swipes over the
  grid still scroll the page. Tapping cells always works.
- **The comparison table header stops sticking.** A parent with `overflow: hidden` breaks `position: sticky`.
  Use `overflow-clip` instead, as the table wrapper does.
- **The URL doesn't update when filtering from disk.** Some browsers block `history.replaceState` on `file://`
  pages; filtering still works and the URL updates once the site is served.
- **The drawer doesn't open in an old browser.** It needs `<dialog>` support (all current browsers). Without it
  the cards still show their summary.
- **A form shows its success message but nothing arrives.** The forms send nothing until you connect them; see
  [Forms](#forms).
- **Social previews show no image.** `og:image` must be an absolute `https://` URL to the PNG.

## License

MIT, as in the repository's license (included as `LICENSE.txt` in the download). Free for personal and
commercial use. All artwork (logo, customer wordmarks, integration logos, avatars, mock-ups and social image) is
original SVG and covered by the same license.
