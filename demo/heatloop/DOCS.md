# Heatloop documentation

## Overview

Heatloop is a complete website for a technology startup, especially a hardware or climate-tech company with a
physical product, shown as **Heatloop**, a fictional company in Bangor, Maine, that makes a thermal battery: a cabinet that
charges from cheap off-peak electricity, stores the energy as heat in phase-change cells and feeds radiators and
hot faucets later. The look is editorial deep-tech: off-white paper, forest green and copper, a large serif for
headlines, numbered sections with hairline rules, technical line drawings and charts drawn in SVG, and a deep
green-black dark mode. This is the **HTML + Tailwind CSS v4** version (1.0.3): plain HTML files, one stylesheet
and one vanilla JavaScript file, with no build step needed to run it.

Live demo: [freeframe.dev/templates/heatloop](https://freeframe.dev/templates/heatloop)

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Every page and feature works straight from the file system.

To preview it the way a host serves it, run any static server in the folder:

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

You only need Node.js 24 (for `npm`) if you change `src/input.css` or add Tailwind classes that aren't used yet
(see [Building and deploying](#building-and-deploying)).

## Pages

| File | Page | Notable sections and features |
|------|------|-------------------------------|
| `index.html` | Home | Hero with the product cutaway (Fig. 1) and a numbered key, key figures, how it works in three steps, the "how much could you shift" teaser, press quotes, milestones, latest news, reservation call to action |
| `technology.html` | Technology | Exploded view (Fig. 2), the interactive 24-hour charge and electric rate diagram, three charts about the store (melting curve, heat loss, controls), specification table (`#specs`), questions in `<details>` |
| `estimator.html` | Savings and carbon estimator | Home size, heating, rate plan and region inputs; yearly cost and CO2e with bars; suggested model; copy-link button; the formula with your numbers; assumptions table |
| `reserve.html` | Reserve | Coverage map (Fig. 3), the three-step reservation, saved reservation for returning visitors, list of covered ZIP codes |
| `careers.html` | Careers | Workshop drawing, roles with team, location and remote filters, saved roles, role details dialog, benefits, hiring steps |
| `company.html` | Company | Story and key figures, principles, team with drawn portraits, backers with their marks, timeline, press kit downloads (`#press`) |
| `news.html` | News | Nine dated posts that expand in place (`#post-<id>`), topic filter, coming-up events, press contact |
| `contact.html` | Contact | Inquiry form with type and role from the URL, office and workshop addresses, phone numbers, sketch map |
| `404.html` | Not found | Friendly 404 page with a cooling chart, for your host to serve |

## Project structure

```text
heatloop/
  index.html, technology.html, estimator.html, reserve.html,
  careers.html, company.html, news.html, contact.html, 404.html
  assets/
    css/style.css                 compiled Tailwind CSS (generated, don't edit by hand)
    js/main.js                    all interactions; settings and data at the top
    img/
      favicon.svg                 loop mark on green
      og-image.svg                social image source
      og-image.png                social image (1200x630) used by og:image
    press/
      heatloop-logo.svg           press kit: logo, green on paper
      heatloop-logo-reversed.svg  press kit: logo, cream on green
      heatloop-28-cutaway.svg     press kit: product cutaway drawing
      heatloop-fact-sheet.txt     press kit: fact sheet
  src/input.css                   Tailwind source: color tokens, fonts and components
  package.json                    npm scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
  LICENSE.txt                     MIT license (in the download)
```

Most artwork is inline SVG inside the pages, so it follows the light and dark themes.

## Customizing

### Brand and colors

Colors are CSS variables at the top of `src/input.css`: `:root` holds the light theme and `.dark` the dark
theme. Tailwind reads them through `@theme inline`, so `bg-paper`, `text-copper`, `border-rule` and so on switch
with the theme automatically.

| Variable | Light | Dark | Used for |
|----------|-------|------|----------|
| `--paper` | `#f5f2ea` | `#0c1511` | Page background |
| `--paper-2`, `--paper-3` | `#ece7da`, `#e1dac8` | `#122019`, `#1a2c23` | Panels, chart fills |
| `--ink` | `#14251d` | `#e8e5da` | Text and line drawings |
| `--muted` | `#4d5a52` | `#a8b3aa` | Secondary text |
| `--rule` | `#c9c1ad` | `#2c4035` | Hairline rules and borders |
| `--forest`, `--forest-2` | `#1f4a37`, `#2b6149` | `#7cc29d`, `#9bd3b4` | Buttons, state of charge, pressed toggles |
| `--copper` | `#8c4f17` | `#e3a663` | Labels, section numbers, links, focus outline |
| `--ochre`, `--ember` | `#c98a3a`, `#d4682a` | `#e0a052`, `#ee8a4c` | Rate line and heat in drawings (decorative) |
| `--field`, `--danger` | `#fbf9f4`, `#a3301c` | `#0f1b15`, `#ff9a85` | Form inputs, error messages |

Three fixed colors in `@theme` don't change with the theme: `--color-pine` and `--color-pine-deep` (the green
band and footer), `--color-cream` (text on it) and `--color-wheat` (labels on it). To change the brand green:

```css
:root { --forest: #1d3f5c; }
.dark { --forest: #8fc0e6; }
```

Then rebuild the CSS. SVG drawings use the same variables (`fill="var(--ochre)"`), so they follow along.

### Typography

Three Google Fonts are loaded with a `<link>` in each page's `<head>`:

- **Hedvig Letters Serif** (`--font-serif`, `font-serif`): headlines, big numbers and quotes.
- **Hedvig Letters Sans** (`--font-sans`, `font-sans`): body text.
- **Source Code Pro** (`--font-mono`, `font-mono`): labels, section numbers, buttons and chart ticks.

Both Hedvig families come in a single weight, so `body` sets `font-synthesis: none` to stop the browser faking
bold; hierarchy comes from size, the serif and the mono labels. To swap fonts, change the `<link>` in every page
and the three `--font-*` tokens in `src/input.css`, then rebuild.

### Content

Page text lives in the HTML files. Data that drives the interactions is at the top of `assets/js/main.js`
(section 1):

| Constant | What it holds |
|----------|---------------|
| `MODELS`, `MODEL_ORDER` | The three models: `capacity` (kWh of heat), `power` (kW element), indicative `price`, `fits` |
| `NIGHT_SHARE` | Home teaser: share of a day's heat used in the cheap hours anyway (0.12) |
| `TARIFF_BANDS` | The illustrative time-of-use rate plan for the technology diagram, cents per kWh by time band (the `p` key holds cents) |
| `CHARGE_BELOW`, `TOPUP_BELOW`, `TOPUP_TARGET` | When the simulated store charges (at or below 13¢), tops up (at or below 20¢, to 85%) |
| `DEMAND_WEIGHTS`, `DAY_HEAT` | Hourly shape of a cold day's heat use and its total (90 kWh) |
| `HOMES`, `HEATING`, `TARIFFS`, `REGIONS` | Estimator inputs: heat use, sample fuel prices with their units, efficiencies, carbon factors, rate plans, climate factors |
| `HEATLOOP_EFF`, `GRID_CO2`, `ESTIMATE_DEFAULTS` | Estimator: overall efficiency (0.95), grid carbon in pounds per kWh at night and by day, default inputs |
| `COVERAGE`, `COMING_NEXT` | ZIP codes installed now, and next |
| `RESERVATIONS_AT_ANCHOR`, `RESERVATIONS_PER_WEEK`, `SURVEY_LEAD_MONTHS` | Reservation count and queue place, home assessment month |
| `TEAMS`, `LOCATIONS`, `MODES`, `ROLES` | Careers: filters and the eleven roles |
| `EVENT_RULES`, `EVENTS_SHOWN` | Coming-up events on the news page |
| `CONTACT_TYPES`, `CONTACT_REPLY` | Contact inquiry types and which team replies |

Adding a role is one object in `ROLES` (the `team` and `location` keys must exist in `TEAMS` and `LOCATIONS`):

```js
{ id: 'electrical-engineer', title: 'Electrical Design Engineer', team: 'engineering', location: 'bangor', mode: 'hybrid', salary: '$90,000–$110,000',
  summary: 'Design the power electronics and protection for the charging element.',
  do: ['Design and test power boards', 'Own electrical safety documentation'],
  bring: ['Power electronics experience', 'Knowledge of the National Electrical Code'] }
```

News posts are written in `news.html`, one `<details id="post-<id>" data-topic="...">` each, with a
`<time data-news-date="YYYY-MM-DD">`. The three on the home page are separate links in `index.html` (`#post-<id>`).
If you change a model's capacity or price, update `MODELS` and the specification table and model cards in
`technology.html`, `reserve.html` and `index.html`.

### Images and artwork

All artwork is SVG drawn for this template: the cutaway in `index.html` (also `assets/press/heatloop-28-cutaway.svg`),
the exploded view and three charts in `technology.html`, the home-type icons in `estimator.html`, the coverage map
and model drawings in `reserve.html`, the workshop drawing in `careers.html`, backer marks in `company.html`, a
small drawing per news topic, the contact sketch map and the 404 chart. Team portraits are drawn by
`initPortraits()` from `data-portrait="hair,glasses,beard,tone"` (hair: `short`, `long`, `bun`, `curly`, `crop`,
`side`; `g` for glasses, `b` for a beard; tone `0`, `1` or `2`). To use photos instead, put an `<img>` inside the
`aspect-square` box and remove its `data-portrait` attribute.

The social image is `assets/img/og-image.png` (1200 x 630), made from `og-image.svg`. The favicon is
`assets/img/favicon.svg`. Press kit files in `assets/press/` are linked from `company.html#press` with `download`.

### Navigation, header and footer

The header and footer are repeated in every page. To add a page, copy an existing page, change its `<title>`, meta
description, Open Graph tags and `data-page`, then add a link to the desktop `<nav aria-label="Main">`, the mobile
menu (`#mobile-menu`) and the footer of every page. Mark the current page's links with `aria-current="page"`.

### Dark mode

The moon/sun button (`[data-theme-toggle]`) switches the `.dark` class on `<html>` and saves the choice as
`heatloop:theme`. A small script in each page's `<head>` applies the saved choice, or the visitor's system
setting, before the page paints. To launch in light mode only, delete the `matchMedia(...)` part of that script;
to remove dark mode, delete the button, the script's `classList.add('dark')` and the `.dark { ... }` block.

## Features

### How much could you shift (home)

`initShift()` reads the model toggles (`[data-shift-model]`) and the heat slider (`#shift-need`, 40 to 160 kWh).
Cheap-rate heat is `min(need, need × NIGHT_SHARE + capacity)`. Expected values for 90 kWh: Heatloop 18, 32%
(28.8 kWh cheap); Heatloop 28, 43% (38.8 kWh); Heatloop 40, 56% (50.8 kWh). The bar is an SVG `rect` whose width
is set from the share. Toggles use `aria-pressed`; the slider has a visible label with the current value.

### A day of charge and release (technology)

`initDayChart()` runs `simulateDay(model, DAY_HEAT)` in 48 half-hour slots: at or below `CHARGE_BELOW` the element
charges flat out (half the model's kW per slot) and the home is heated directly; once full it holds; at or below
`TOPUP_BELOW` it tops up to `TOPUP_TARGET`; otherwise heat comes from the store, and from the grid ("Backup") if
the store is empty. The day runs twice so it starts as it ended. It then draws an SVG with the rate plan (ochre step
line), the state of charge (green area), shaded cheap hours and a cursor for the time slider (`#day-time`, 0 to
47; default 35 = 5:30 PM). On narrow screens it redraws with a narrower viewBox and larger labels.

Expected values for the Heatloop 28 at 5:30 PM: 40¢ / kWh, Releasing, 36% · 10.0 kWh, 3.78 kWh heat to the home;
at 4:00 AM it is full (Holding, 100%); at 1:00 PM it is Topping up. Over the day: Heatloop 18 buys 90.0 kWh, 38% at
the cheap rate, about $20; Heatloop 28, 49%, about $17; Heatloop 40, 63%, about $15. "Play the day" steps through
the slots (slower with reduced motion) and stops at 11:30 PM; the slider has an `aria-valuetext` and the readouts are
in a polite live region.

### Savings and carbon estimator

`initEstimator()` reads the radios and selects in `[data-estimator]` and calls `estimate()`:

1. Heat = `HOMES[size].heat × REGIONS[region].climate`.
2. Now: heat ÷ `eff` = fuel kWh; ÷ `kwhPerUnit` = therms, gallons or kWh; × `price` (dollars) = cost; fuel kWh × `co2` = lb CO2e.
3. Blended Heatloop price in cents = `shift × off + (1 − shift) × peak`.
4. Heatloop: heat ÷ `HEATLOOP_EFF` = electricity; × blended price = cost; carbon uses `GRID_CO2.off` and `.peak`.

Expected results: mid-size home, oil, time-of-use, Bangor and eastern Maine (the defaults): $3,666 now, $3,532 with
a Heatloop, "$134 less a year", 7.1 tons to 6.5 tons (10% less), Heatloop 28. Mid-size with natural gas: "$1,986 more a
year", 5.2 tons to 6.5 tons. Apartment, electric baseboard, off-peak heating rate, Southern Maine and coastal New
Hampshire: "$669 less a year", Heatloop 18. All prices are samples, not quotes: heating oil $5.75 a gallon, propane
$3.50 a gallon, natural gas $1.75 a therm, and electricity from 13¢ to 40¢ a kWh. Update `HEATING` and `TARIFFS` with
your own. Grid carbon is illustrative, near New England's published average. The estimate is labeled as an
estimate, says when a Heatloop would cost more to run, and the formula section shows every step with the
visitor's numbers. Inputs are kept in the URL (see [URL parameters](#url-parameters)); "Copy link to this
estimate" copies it, with the link shown as text if the clipboard isn't available.

### Reservation

`initReserve()` runs three `<fieldset data-step>` steps with a step indicator (`aria-current="step"`):

1. **Model**: radio cards for `hl18`, `hl28`, `hl40` (preselected from `?model=`).
2. **ZIP code**: 5 digits with an optional +4; the 5-digit ZIP (e.g. `04401`) is looked up in `COVERAGE`
   ("Good news: we install in 04401", with first home assessments from the month `SURVEY_LEAD_MONTHS` ahead), then
   `COMING_NEXT` ("next on our list") or neither ("We don't install in … yet"; you can still reserve).
3. **Contact**: name, email, optional US phone, optional newsletter.

On submit it saves the reservation (see [Saved data](#saved-data-localstorage)) and shows the success panel with a
reference like `HL-04401-7K2Q`, the place in the queue (`RESERVATIONS_AT_ANCHOR + 1`, plus growth while
`KEEP_DEMO_CURRENT` is on; 2,141 on Oct 27, 2026) and what happens next. Returning visitors see the saved
panel ("Welcome back, …"), and the home page and header buttons change to "View your reservation" / "Your place".
"Change details" reopens the form filled in (keeping the reference and place); "Cancel reservation" deletes it.

### Careers: filters, saved roles and role dialog

`initCareers()` renders `ROLES` into `[data-roles]`, filtered by team (`#filter-team`), location
(`#filter-location`) and "Remote only" (`#filter-remote`, roles with `mode: 'remote'`); the count reads "11 open
roles" (or "1 open role"). Filters are kept in the URL. Each role has a Save toggle (`[data-save-role]`,
`aria-pressed`) and Details, which opens the native `<dialog id="role-dialog">` with what you'll do, what you'll
bring, salary, a save toggle and "Apply for this role" (to `contact.html?type=careers&role=<id>`). Saved roles are
listed in the sidebar (`[data-saved-list]`, count in `[data-saved-count]`). `?role=<id>` opens a role directly.
Esc and the close buttons close the dialog and focus returns to the button that opened it.

### News, rolling dates and events

`initNewsFilter()` filters posts by `data-topic` with `[data-topic-filter]` toggles, kept in `?topic=`; the count
reads "9 posts". A link to `news.html#post-<id>` opens that post. `initEvents()` builds the coming-up list from
`EVENT_RULES` (first Saturday open house, second Wednesday webinar, last Thursday installer evening): the next
date of each rule after now, in Eastern time, so the list is never empty or in the past.

### Demo dates

Demos stay online for years, so dated content rolls forward. With `KEEP_DEMO_CURRENT = true` (top of `main.js`),
everything written for `DEMO_ANCHOR` (`'2026-10-27'`) moves forward by the **whole weeks** since that day
(weekdays stay right):

- News dates (`time[data-news-date]`, in `news.html` and on the home page).
- Milestone and timeline years (`[data-shift-year]`), by the whole years in that shift.
- The reservation count (`[data-reservations]`) and new queue places, by `RESERVATIONS_PER_WEEK`.

On Oct 27, 2026 nothing moves, so the page shows exactly the text it was written with. Always computed from
today, regardless of the switch: the copyright year (`[data-year]`), the coming-up events and the home assessment month
(`[data-survey-month]`). For a real site with fixed dates, set `KEEP_DEMO_CURRENT = false`.

### Contact type and role

`contact.html?type=press` preselects the inquiry type (own keys of `CONTACT_TYPES`); `?role=<id>` (an id in
`ROLES`) selects Careers and starts the message with "Application: <role title>".

### Header, mobile menu, scroll reveals and back to top

The menu button toggles `#mobile-menu` with `aria-expanded`; Esc closes it and returns focus. Elements with
`reveal` fade in as they scroll into view (and everything above them); with reduced motion they show at once.
`initBackToTop()` adds a back-to-top button after scrolling, which moves focus to `#main`.

## Forms

| Form | Page | Validates |
|------|------|-----------|
| `[data-reserve]` | `reserve.html` | Model chosen; ZIP code format; name; email; optional US phone |
| `#contact-form` | `contact.html` | Inquiry type, name, email, optional US phone, message of at least 20 characters |
| `#newsletter` | every page | Email |

Errors appear under each field (linked with `aria-describedby`) and set `aria-invalid`; focus moves to the first
problem. The contact and newsletter forms use `data-validate` and `data-success` (the id of the success panel),
handled by `initForms()`. The contact panel thanks the sender by first name, names the team that will reply
(`CONTACT_REPLY`) and shows a reference like `HL-E-7K2Q`.

The forms don't send anything until you connect them. To use a form service such as Formspree, replace the
comment marked "To connect a real endpoint" in `initForms()` (and "To connect a real backend" in `initReserve()`)
with a request, and show the success state only when it answers OK:

```js
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (!res.ok) throw new Error('Send failed');
  panel.hidden = false;
  form.hidden = true;
  panel.focus();
}).catch(function () {
  announce('Sorry, that didn’t send. Please call us at (207) 555-0176.');
});
```

The reservation form takes no payment; the page says so.

## Saved data (localStorage)

| Key | Shape | Validated on read |
|-----|-------|-------------------|
| `heatloop:theme` | `"dark"` or `"light"` | Anything else is ignored and the system setting is used |
| `heatloop:reservation` | `{ ref, model, postcode, name, email, phone, updates, place, created }` | `ref` matches `HL-XXXX-XXXX`; `model` an own key of `MODELS`; `postcode` a valid US ZIP code; `name` non-empty; `email` a string; `place` a positive number; `created` a `YYYY-MM-DD` date. Otherwise the reservation is ignored |
| `heatloop:saved-roles` | `["firmware-engineer", "surveyor"]` | Only ids in `ROLES`, without duplicates |

All storage goes through one `safeStorage` object: `localStorage`, or an in-memory stand-in when the browser blocks
storage (a sandboxed iframe, strict privacy settings), so features keep working for the page view. To reset, cancel
the reservation, unsave roles, or run `localStorage.removeItem('heatloop:reservation')` in the console.

### URL parameters

| Page | Parameters |
|------|------------|
| `estimator.html` | `size` (`apartment`, `small`, `midsize`, `large`), `heat` (`gas`, `oil`, `propane`, `storage`, `electric`), `tariff` (`tou`, `offpeak`, `single`), `region` (`eastern`, `northern`, `central`, `western`, `midcoast`, `southern`) |
| `reserve.html` | `model` (`hl18`, `hl28`, `hl40`) |
| `careers.html` | `team`, `location`, `remote=1`, `role=<id>` |
| `news.html` | `topic` (`product`, `installs`, `research`, `company`) |
| `contact.html` | `type` (a `CONTACT_TYPES` key), `role=<id>` |

Every value is checked with an own-key lookup (`Object.prototype.hasOwnProperty.call`), so unknown values fall back
to the defaults.

### Time zone

All dates use `TIME_ZONE = 'America/New_York'` (Eastern time), not the visitor's clock.

## SEO and sharing

Every page has its own `<title>`, meta description, `theme-color` (light and dark), Open Graph tags (`og:locale`
`en_US`) and a Twitter card. `og:image` is the relative path `assets/img/og-image.png`; social sites need an
absolute URL, so after deploying change it to e.g. `https://www.example.com/assets/img/og-image.png` on every
page. To regenerate the PNG after editing the SVG, open `og-image.svg` in a browser at 1200 x 630 and take a
screenshot, or use any SVG-to-PNG converter.

Add a `sitemap.xml` listing the eight pages and a `robots.txt` that points to it. You could add `Organization` and
`Product` structured data (JSON-LD) to `index.html` and `technology.html`.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page and logical headings.
- Visible copper focus outlines, AA contrast in both themes; ochre and ember are used only for decoration.
- Toggle buttons with `aria-pressed` (filters, models, saves, theme), `aria-expanded` on the menu button,
  `aria-current="page"` in the navigation and `aria-current="step"` in the reservation steps.
- Native `<dialog>` for role details, `<details>` for questions and news posts, radio buttons inside the model and
  home cards.
- Informative SVGs have `role="img"` and a `<title>`; decorative ones are `aria-hidden`. The day chart's readouts
  repeat its values as text.
- Polite live regions for results and announcements (`#live-region`).
- `prefers-reduced-motion` turns off reveals, the chart pulse and flow animation, and smooth scrolling.

When editing, keep one `<h1>`, label every new input, and make sure every `aria-controls`, `aria-labelledby` and
`aria-describedby` points at an id on the page.

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` is compiled from `src/input.css` by Tailwind CSS v4, which scans the HTML files and
`assets/js/` for class names. With Node.js 24:

```sh
npm install
npm run build    # once
npm run watch    # rebuild on every change
```

Classes that only appear inside JavaScript strings must be written out in full in `assets/js/main.js`.

### Deploying

The folder is a static site. Upload it as-is to any static host: Netlify Drop, GitHub Pages, Cloudflare Pages or
plain web hosting. Configure your host to serve `404.html` for missing pages. You don't need to upload `src/`,
`package.json` or the Markdown files.

## Troubleshooting

- **The estimator says a Heatloop costs more than gas.** That's the honest result with the illustrative prices
  in `HEATING` and `TARIFFS`. Natural gas is cheap next to resistance heat in much of the US. Update them to current prices for your market.
- **A ZIP code I cover shows as not covered.** Add its 5 digits to `COVERAGE`,
  and to the list on `reserve.html`.
- **News dates look a year later than I wrote them.** `KEEP_DEMO_CURRENT` is on. Set it to `false` once the posts
  are real.
- **The day chart labels are tiny.** It redraws with larger labels below 560 px wide; if you put it in a narrower
  column, lower that breakpoint in `initDayChart()`.
- **New Tailwind classes have no effect.** Rebuild the CSS (`npm run build`), and write class names in full.
- **The saved reservation disappears after closing the tab.** The browser is blocking storage (private mode, a
  sandboxed iframe); the site keeps it in memory for that page view.
- **The page flashes light before turning dark.** Keep the small theme script in each page's `<head>`, before the
  stylesheet loads the body.

## License

MIT. The code and all included artwork are free for personal and commercial use; the full text is in
`LICENSE.txt`, included in the download. Hedvig Letters Serif, Hedvig Letters Sans and Source Code Pro are
licensed under the SIL Open Font License. Heatloop, its people, backers, press quotes, products and figures are
fictional.
