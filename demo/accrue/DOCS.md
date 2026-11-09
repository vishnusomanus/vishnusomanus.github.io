# Accrue documentation

## Overview

Accrue is a multi-page website template for an accounting firm, CPA practice or tax preparer. The demo business is
Fernley Whitcomb CPAs, a fictional seven-person firm on Cherry Street in Chattanooga, Tennessee, serving households
and businesses on both sides of the Georgia and Alabama state lines. It is built with plain HTML, Tailwind CSS v4
and vanilla JavaScript (no frameworks, no libraries). This is version 1.0.3 of the HTML stack. See the template
page at [freeframe.dev/templates/accrue](https://freeframe.dev/templates/accrue), which links to the live demo.

The template has a tax deadline calendar worked out from rules (it never goes stale), a live countdown to the next
deadline, a tax-season document checklist that remembers checks, a fee estimator, consultation booking with a
rolling availability grid, and data-driven service and article pages. Every date and time is worked out in
`America/New_York` (Eastern time), whatever the visitor's own time zone is.

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
| `index.html` | Home | Hero with a next-deadline card and countdown, firm figures, numbered list of services, who we serve (six industries), Tennessee tax note, testimonials, three getting-started steps with the first open consultation time, call to action |
| `services.html` | All services | Service cards rendered from `SERVICES`, "start from what's bothering you" guide, how every engagement works |
| `service.html` | One service (`?s=<slug>`) | Name, intro, price line, art, what's included, who it's for, timeline, FAQ, related services; unknown slugs fall back to `DEFAULT_SERVICE` with a notice |
| `pricing.html` | Pricing | Four bookkeeping packages from `ESTIMATOR.tiers`, the fee estimator, individual return prices, other services, billing note |
| `deadlines.html` | Deadline calendar and checklist | Next-deadline countdown, taxpayer-type filter, year switch, month-by-month list with "moved from" notes, holiday list, tax-season document checklist (saved) |
| `team.html` | Team | Two partners and five staff with illustrated portraits, credentials explained |
| `insights.html` | Articles | Category filter (`?cat=`), featured latest article, article grid rendered from `ARTICLES` |
| `article.html` | One article (`?a=<slug>`) | Title, dek, author, date, cover art, body, sidebar with call to action and three more articles; unknown slugs show the latest article with a notice |
| `contact.html` | Book a consultation | Service and meeting type, ten-day slot grid, details form with validation, success state with reference, office hours and live open/closed status, map, directions, client portal section (`#portal`) |
| `404.html` | Not found | "Misfiled" drawing and links to the most-used pages |

## Project structure

```text
accrue/
  index.html … contact.html, 404.html   the pages (header and footer repeated in each)
  assets/
    css/style.css        compiled Tailwind CSS (generated, do not edit by hand)
    js/data.js           all content and settings: FIRM, SERVICES, DEADLINE_RULES, CHECKLISTS, ESTIMATOR, BOOKING, ARTICLES
    js/main.js           all behavior (reads window.ACCRUE from data.js)
    img/favicon.svg      the logo mark
    img/og-image.svg     social image source
    img/og-image.png     social image used in og:image (1200×630)
    img/services/*.svg   one illustration per service (480×300)
    img/articles/*.svg   one cover per article (640×400)
  src/input.css          Tailwind source: @theme tokens, a few utilities and components
  package.json           npm scripts to rebuild the CSS
  README.md              short introduction
  DOCS.md                this guide
  CHANGELOG.md           version history
```

Every page loads `assets/js/data.js` and then `assets/js/main.js` at the end of `<body>`. Each page's
`<body data-page="…">` names the page.

## Customizing

### Brand and colors

Design tokens live in the `@theme` block at the top of `src/input.css`. The ones that matter:

| Token | Value | Used for |
|-------|-------|----------|
| `--color-paper` | `#f5f1e6` | page background (oat linen) |
| `--color-paper-2` | `#ebe5d3` | alternate bands, past deadlines |
| `--color-card` | `#fffcf4` | cards and forms |
| `--color-ink` | `#1f2316` | text and dark bands (olive black) |
| `--color-muted` | `#575a48` | secondary text on light backgrounds |
| `--color-sage` | `#c9ceb1` | secondary text on ink |
| `--color-olive` | `#4f5b1c` | buttons, links, logo |
| `--color-olive-soft` | `#e1e5c8` | tints, highlighted cards |
| `--color-marigold` | `#e8b13a` | highlighter strokes, accent buttons (always with ink text) |
| `--color-due` | `#9a3b1e` | errors, "due soon" tags, moved-date notes |

To change the brand color, edit `--color-olive` (and `--color-olive-deep` for hover), then rebuild the CSS:

```css
@theme {
  --color-olive: #24506b;
  --color-olive-deep: #1a3b4f;
}
```

The SVG files in `assets/img/` use the same hex values directly; search and replace them if you change the palette.
`theme-color` in each page's `<head>` is `#1f2316`.

Components worth knowing in `src/input.css`: `.folder` (the file-folder card with a tab, the template's motif;
`.folder-ink` and `.folder-olive` variants), `.mark` (the marigold highlighter under a word in a headline),
`.display` and `.section-title` (headline sizes), `.chip` (filter buttons, styled by `aria-pressed`), `.day-btn` and
`.slot-btn` (booking grid), `.receipt` (zigzag edge under the estimator total), `.check-row` (checklist rows).

### Typography

Two Google Fonts, loaded with one `<link>` in every page's `<head>`:

- **Hahmlet** (weights 500–700) for headlines, numbers in cards and the team initials: `font-serif`.
- **Geologica** (weights 300–700) for everything else: `font-sans`.

Figures use tabular, lining numerals through the `num` utility (`font-variant-numeric: tabular-nums lining-nums`).
To swap fonts, change the `<link>` URL in every page and the `--font-sans` / `--font-serif` stacks in `@theme`.

### Content

Page text is in the HTML files. Everything data-driven is in `assets/js/data.js`, inside `window.ACCRUE`:

| Constant | What it holds |
|----------|---------------|
| `FIRM` | `name`, `phone` (`(423) 555-0138`), `phoneHref`, `email` (`hello@fernleywhitcomb.example`), `timeZone` (`America/New_York`), `refPrefix` (`FW`) |
| `SERVICES` | seven services keyed by slug: `name`, `short`, `from` (price line), `art`, `intro`, `included[]`, `forWho[]`, `timeline[{ when, step }]`, `faq[{ q, a }]`, `related[]` (slugs) |
| `SERVICE_ORDER` | display order: `individual-tax`, `business-tax`, `bookkeeping`, `payroll`, `advisory`, `nonprofit`, `irs-notices` |
| `DEFAULT_SERVICE` | `individual-tax`, shown when `?s=` is missing or unknown |
| `TAXPAYER_TYPES` | calendar filters: `all`, `individual`, `employer`, `passthrough`, `ccorp`, `nonprofit` |
| `DEADLINE_RULES` | 24 deadline rules (see [Deadline calendar](#deadline-calendar)) |
| `CHECKLISTS`, `CHECKLIST_ORDER` | four lists: `individual` (11 items), `selfemployed` (11), `business` (11), `nonprofit` (9); item ids are unique |
| `ESTIMATOR` | the fee estimator's prices and limits (see [Fee estimator](#fee-estimator)) |
| `BOOKING` | consultation slots, days shown, closures, meeting types (see [Consultation booking](#consultation-booking)) |
| `CATEGORIES` | article categories: `all`, `tennessee`, `individuals`, `self-employed`, `small-business`, `nonprofits`, `irs-notices` |
| `ARTICLES` | seven articles, newest first: `slug`, `title`, `date` (`YYYY-MM-DD`), `cat`, `author`, `mins`, `art`, `dek`, `body[]` |

The home page's numbered service list, the pricing packages and the footer service links are written into the HTML
from the same data; when you rename a service, update those too.

Adding a service:

```js
// assets/js/data.js, inside SERVICES
'estate-tax': {
  name: 'Trusts & estates',
  short: 'Fiduciary returns and estate tax filings for executors and trustees.',
  from: 'From $1,200 a return',
  art: 'assets/img/services/estate-tax.svg',
  intro: '…',
  included: ['…'], forWho: ['…'],
  timeline: [{ when: 'Month 1', step: '…' }],
  faq: [{ q: '…', a: '…' }],
  related: ['individual-tax', 'advisory']
}
```

Then add `'estate-tax'` to `SERVICE_ORDER`. It appears on `services.html`, in the booking form's service menu and
at `service.html?s=estate-tax`. Article bodies are arrays of blocks: `{ p: '…' }`, `{ h2: '…' }`,
`{ ul: ['…', '…'] }` or `{ quote: '…' }`. Keep `ARTICLES` newest first: the first one is the featured article and the
fallback.

### Images and artwork

All art is SVG drawn for this template; there are no photos.

- `assets/img/services/<slug>.svg`: 480×300 (8:5). Replace with photos at the same ratio; cards crop with `object-cover`.
- `assets/img/articles/<name>.svg`: 640×400 (8:5); the article page shows it cropped to 16:7.
- Team portraits are inline SVG in `team.html` (each has `role="img"` and an `aria-label`). To use photos, replace
  each `<svg>` with an `<img>` at 6:7 (staff) or filling the 13rem column (partners), with real alt text.
- The industry icons, hero rings, map and 404 drawing are inline SVG in their pages.
- `assets/img/og-image.svg` is the social image source; regenerate `og-image.png` after editing it (see
  [SEO and sharing](#seo-and-sharing)). `assets/img/favicon.svg` is the logo mark, also inlined in the header and footer.

### Navigation, header and footer

The header and footer are repeated in every page. The header has a dark top bar (next deadline, client portal link,
phone), the logo, the main menu (`Services`, `Pricing`, `Deadlines`, `Team`, `Insights`, `Contact`), the
"Book a consultation" button and the mobile menu (`#mobile-menu`, toggled by `#menu-toggle`). The current page's link
has `aria-current="page"` (`services.html` and `service.html` both mark Services; `insights.html` and `article.html`
both mark Insights). To add a page, copy an existing page, change its `<title>`, meta tags, `data-page` and content,
and add a link in the `<nav aria-label="Main">` and `<nav aria-label="Mobile">` of every page.

The footer copyright year is filled in by `main.js` (`<span data-year>`); the hard-coded `2026` is only a fallback.

## Features

### Deadline calendar

`deadlines.html`, code in section 4 and 7 of `main.js` (`deadlines(y)`, `businessDay()`, `paintDeadlines()`).

Each entry in `DEADLINE_RULES` is a rule, not a date:

```js
{ id: 'individual', short: 'Individual returns', month: 4, day: 15, rule: 'federal',
  who: ['individual'], title: 'Individual returns for {prev}, or an extension; …', forms: 'Form 1040, Form 4868' }
```

For every calendar year the page builds the date from `month` and `day`, then moves it to the next business day:

- `rule: 'federal'`: past Saturdays, Sundays, federal holidays and DC Emancipation Day (April 16, observed on the
  Friday before or Monday after when it falls on a weekend). That is why, for example, April 15, 2028 (a Saturday)
  moves to Tuesday, April 18, 2028: Monday April 17 is the observed Emancipation Day.
- `rule: 'tn'`: past Saturdays, Sundays, federal holidays (not Columbus Day or Emancipation Day) and Good Friday,
  for Tennessee franchise & excise deadlines.

`{prev}` and `{year}` in titles become the previous year and the calendar year. `short` is the label used in the top
bar and teaser. `who` lists the `TAXPAYER_TYPES` it applies to. Moved deadlines show a note such as
"Moved from Sat, Oct 31: weekend." or "Moved from Sat, Apr 15: weekend, then DC Emancipation Day on Mon, Apr 17."

Holidays are computed by `holidays(y)`, with fixed-date holidays observed on the Friday before a Saturday and the
Monday after a Sunday: New Year's Day, Martin Luther King Jr. Day (third Monday of January), Washington's Birthday
(third Monday of February), Good Friday (from Easter, anonymous Gregorian computus), DC Emancipation Day, Memorial
Day (last Monday of May), Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving (fourth
Thursday of November), the day after Thanksgiving, Christmas Eve and Christmas Day. Which ones move deadlines is set
by `HOLIDAY_SETS` in `main.js`. (Inauguration Day, a DC holiday every four years on January 20, never lands on a
deadline in these rules, so it isn't included.)

The calendar opens on the year of the next deadline (the current Eastern year, or the next one once December 15 has
passed); the year switch shows the current and the next year. Each entry is marked
Passed, Next (the first one still ahead for the chosen filter), "in N days" (red within 30 days) or "in N days".
A deadline counts as ahead until midnight Eastern on its due date. The side panel lists that year's holidays.

The filter chips (`data-type-filter`) and year buttons (`data-year-offset="0"` / `"1"`) are buttons with
`aria-pressed`; the count line (`data-dl-count`) is a polite live region. Choices are written to the URL
(`?type=`, `?year=`) with `history.replaceState`.

Expected values at `2026-10-30T14:00Z` (10:00 AM Eastern, Friday, October 30, 2026):

- Count line: "24 deadlines in 2026 · 4 still ahead".
- Next deadline (everyone): Monday, November 2, 2026, "Third-quarter payroll return", Form 941 · IRS, moved from
  Sat, Oct 31; countdown 3 days, 14 hours, 0 minutes.
- Then Mon, Nov 16 (extended nonprofit returns, moved from Sun, Nov 15), Tue, Dec 15 (Q4 corporate estimate and
  Tennessee F&E estimate).
- With `?type=individual`: "6 deadlines in 2026 · 0 still ahead"; next is Friday, January 15, 2027, "Fourth-quarter
  estimated tax for 2026".
- In 2026, Jan 31 (Saturday) moves to Mon, Feb 2 and Mar 15 (Sunday) to Mon, Mar 16.

To turn a deadline off, delete its rule. To add a fiscal-year deadline, add a rule with its own month and day.

### Countdown and next-deadline line

Every page's top bar has `[data-next-deadline]`, filled with the next deadline for everyone, for example
"Next deadline **Mon, Nov 2** · Form 941 (Q3) in 3 days". The home page card (`[data-deadline-teaser]`) shows the
next deadline's date, label, detail, days and hours left, and the three after it. `deadlines.html` has the full
countdown (`[data-dl-next]`: days, hours, minutes until 11:59 PM Eastern on the due date, plus an `sr-only` sentence
for screen readers; the big numbers are `aria-hidden`). All of them refresh every 30 seconds, except when `?now=` is
set.

### Document checklist

`deadlines.html#checklist`, section 8 of `main.js`. Four lists from `CHECKLISTS`, switched with the buttons
`[data-checklist-tab="individual|selfemployed|business|nonprofit"]` (or `?list=<id>` on load). Each item is a real
checkbox (visually hidden, with a drawn box) inside a `<label>`. The progress text (`[data-check-progress]`, for
example "1 of 11 ready") is a polite live region; the bar is decorative. "Clear this list" (`[data-check-reset]`)
unchecks the current list only. When every item is checked, `[data-check-done]` appears.

Checks are saved through `safeStorage` (see [Saved data](#saved-data-localstorage)), so they survive reloads; when the
browser blocks storage they last for the page view.

### Fee estimator

`pricing.html#estimator`, section 10 of `main.js` (`estimate(inp)`). Settings in `ESTIMATOR`:

| Setting | Value |
|---------|-------|
| `entities` | `sole` (return fee $0, extra $0), `partnership` ($1,440 a year), `scorp` ($1,560 a year + $40/month shareholder basis and reasonable-salary tracking), `ccorp` ($1,800 a year), `nonprofit` ($1,680 a year + $100/month restricted fund and grant tracking) |
| `tiers` | Foundation up to 100 transactions $350, Standard up to 250 $525, Expanded up to 500 $775, Full-charge up to 1,000 $1,150 |
| `overBlock`, `overBlockFee` | above 1,000: $95 for each further 250 transactions or part of 250 |
| `payrollBase`, `payrollPerEmployee` | $65 + $9 per employee, when there is at least one employee |
| `extraStateFee` | $45 a month for each state after Tennessee |
| `cleanupPerMonth` | $175 per month behind, a one-time fee shown separately |
| `limits` | transactions 0–2,000 in steps of 25, employees 0–60, states 1–6, cleanup 0–24 months |
| `defaults` | `scorp`, 200 transactions, 4 employees, 1 state, 0 months |

Monthly estimate = bookkeeping tier + payroll + extra states + entity extra + annual return fee ÷ 12, rounded to the
dollar. The annual line is the monthly figure × 12.

Expected values:

- Defaults: **$796/month** (Standard $525, payroll for 4 employees $101, tracking $40, annual returns $130), "$9,552 a
  year", one-time cleanup "None: your books are current".
- `?entity=nonprofit&tx=1300&emp=12&states=3&cleanup=6`: **$1,843/month** (Full-charge over 1,000 transactions
  $1,340, payroll for 12 employees $173, 2 additional states $90, restricted fund tracking $100, annual returns $140),
  cleanup "$1,050 once, for 6 months of catch-up".
- Invalid parameters (`?entity=toString&tx=abc`) fall back to the defaults: $796.

Every change rewrites the URL (`?entity=&tx=&emp=&states=&cleanup=`), so an estimate can be shared. The result panel is
a polite live region. Reset restores `defaults`.

### Consultation booking

`contact.html`, section 12 of `main.js`. Settings in `BOOKING`:

| Setting | Value |
|---------|-------|
| `slots` | Monday–Thursday 9, 10, 11 AM, 1, 2, 3, 4 PM; Friday 9, 10, 11 AM, 1, 2 PM; Saturday 9, 10, 11 AM (tax season only). No noon slot: lunch is 12–1 and the grid shows a "Lunch, 12–1" divider |
| `taxSeason` | `02-01` to `04-15` (Saturdays are offered in this window) |
| `minutes` | 30 |
| `days` | 10 open days, starting tomorrow (Eastern) |
| `demoTaken` | 45: the share of slots shown as already booked, stable for each date and time (hash of the date and time) |
| `closures` | `newYear`, `memorial`, `juneteenth`, `independence`, `labor`, `thanksgiving`, `dayAfterThanksgiving`, `christmasEve`, `christmas` (observed dates) |
| `meetings` | `office`, `video`, `phone` |

Sundays, Saturdays outside tax season and closure days are skipped, so the grid always shows the next ten open days
and never goes stale. A day whose slots are all taken is disabled ("fully booked" for screen readers).
`?service=<slug>` preselects a service (own-key check; `?service=not-sure` selects "Not sure yet"; anything else leaves "Choose a service").

The `[data-first-slot]` spans on the home and contact pages show the earliest free slot. At `2026-10-30T14:00Z` the
days are Nov 2–6 and Nov 9–13, 2026; the first open time is **Mon, Nov 2 at 9:00 AM**, and Nov 2 has two free times
(9:00 AM and 4:00 PM).

Validation (inline errors with `aria-invalid`): service required; a time required ("Choose a day and a time.");
name at least two characters; email must look like an address; phone optional but, if given, 10 digits (or 11
starting with 1). On success the form is replaced by `[data-booking-success]`: "Thank you, <first name>. Your
consultation request is in.", a reference `FW-` + five characters (a hash of name, email, date and time; for
"Junie Example", "junie@example.com", Nov 2 at 9:00 AM it is `FW-BJRFB`), the time, service and meeting type, and
what happens next. Focus moves to the success heading.

Hours shown on the contact page (and `[data-office-status]`, "Open now" / "Closed now" / "Closed today for …"):
Monday–Thursday 8:30 AM–5:30 PM, Friday 8:30 AM–3:00 PM, Saturdays 9 AM–1 PM from February 1 to April 15. The
status hours are in `main.js` (section 13); the table is in `contact.html`.

### Service pages

`service.html?s=<slug>`, section 9 of `main.js`. Valid slugs: `individual-tax`, `business-tax`, `bookkeeping`,
`payroll`, `advisory`, `nonprofit`, `irs-notices`. The slug is checked with
`Object.prototype.hasOwnProperty.call(SERVICES, slug)`. Missing → `DEFAULT_SERVICE` silently; unknown (for example
`?s=constructor`) → `DEFAULT_SERVICE` with the notice "We couldn't find a service called "constructor", so here is
our most-booked one." The page title, breadcrumb, booking links (`contact.html?service=<slug>`) and related cards are
updated too. `services.html` renders the grid into `[data-services-grid]`, followed by a dark "Not sure which?" tile
that links to `contact.html?service=not-sure` and the estimator.

### Insights and articles

`insights.html`: the category chips (`[data-cat-filter]`) filter `ARTICLES`; with "All", the newest article is the
large featured card and the other six are in the grid; with a category, all its articles are in the grid. The count
reads "7 articles" or, for example, "2 articles in Small business". `?cat=<key>` sets it on load and is kept in the URL.

`article.html?a=<slug>`: unknown or missing slugs show the newest article (with a notice when a slug was given).
"Keep reading" lists up to three other articles, same category first. Articles keep their real publication dates
(Feb 9 to Oct 19, 2026); they are past content and never move.

### Header, menu, reveal and back to top

The header is sticky and gains a shadow after scrolling. The mobile menu (below 1024px) is opened by
`#menu-toggle` (`aria-expanded`, `aria-controls="mobile-menu"`), closes with Escape (focus returns to the button), on a
link click or when the window grows. Elements with `.reveal` fade in as they scroll into view (off with reduced
motion; everything above the viewport edge is revealed too). The back-to-top button is created by the last block in
`main.js`; delete that block and the `.back-to-top` styles to remove it.

### Previewing a date

Add `?now=YYYY-MM-DDTHH:MM` (Eastern wall-clock time) to any page to see the site at that moment: the top bar,
countdowns, calendar, office status, first open time and booking grid all use it, and live refresh stops. Examples:
`deadlines.html?now=2028-04-01T10:00&year=2028` (April 18, 2028 shift), `contact.html?now=2027-02-25T09:00`
(tax-season Saturdays in the grid).

## Forms

The only form that collects details is the consultation request on `contact.html` (`form[data-booking]`). The fee
estimator is a form for layout only; it never submits. The demo form doesn't send anything until you connect it.

To connect it, for example to Formspree, add the endpoint and replace the success branch in the `submit` handler in
`main.js` (look for "To connect a real backend"):

```js
const res = await fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(bookForm),
  headers: { Accept: 'application/json' }
});
if (!res.ok) { /* show an error message and keep the form */ return; }
// then show [data-booking-success] as the demo does
```

Make the listener `async`. The form fields are `service`, `meeting`, `slot_date` (`YYYY-MM-DD`), `slot_time`
(`HH:MM`, Eastern), `name`, `email`, `phone`, `client` (`new` or `existing`) and `notes`. Show the success state only
when the service answers OK. A practice-management or scheduling system can take the same fields; if it has real
availability, replace `slotTaken()` with its data.

## Saved data (localStorage)

| Key | Shape | Used by |
|-----|-------|---------|
| `accrue:checklist` | `{ "list": "individual", "ticks": { "individual": ["i-w2"], "selfemployed": [], "business": [], "nonprofit": [] } }` | the document checklist |

On read (`readChecklist()`), `list` must be an own key of `CHECKLISTS`, `ticks` lists that aren't arrays are ignored,
and only item ids that exist in that list are kept, so stale or tampered data can't break the page. Before each
change the saved value is re-read, so two open tabs don't overwrite each other's lists.

All storage goes through one `safeStorage` object: `localStorage`, or an in-memory stand-in when the browser blocks
storage (sandboxed iframes, strict privacy settings), in which case checks last for the page view. To reset, use
"Clear this list", or remove the key in the browser's developer tools (Application → Local Storage). Nothing else is
stored; the estimator keeps its state in the URL.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags (`og:title`, `og:description`, `og:image`,
`og:site_name`, `og:locale` `en_US`), a Twitter card and `theme-color`, all in the page's `<head>`. `service.html`
and `article.html` also update `document.title` for the chosen service or article.

`og:image` is the relative `assets/img/og-image.png`. Social sites need an absolute URL: replace it in every page with
your domain, for example `https://www.yourfirm.com/assets/img/og-image.png`. After editing `og-image.svg`, regenerate
the PNG (1200×630) with any SVG-to-PNG tool, keeping the Hahmlet and Geologica fonts available so the text renders.

Suggestions: add a `sitemap.xml` and `robots.txt` at the site root; give each service and article its own static page
if search traffic to them matters (the `?s=` and `?a=` pages share one HTML file); add `AccountingService`
structured data (JSON-LD) with your real address and hours.

## Accessibility

- Skip link, landmarks (`header`, `nav` with labels, `main`, `footer`), one `<h1>` per page and a logical heading order.
- Visible focus outlines (olive on light, marigold on dark).
- Filter chips, year switch, checklist tabs and booking days and times are buttons with `aria-pressed`; booked times
  are disabled and announced as "booked".
- Live regions: deadline count, checklist progress, estimator result and the chosen booking time.
- The countdown digits are `aria-hidden` with an `sr-only` sentence instead, so screen readers aren't flooded.
- Form fields have labels, `aria-describedby` error messages and `aria-invalid`; focus moves to the first problem.
- Reveal animations, smooth scrolling and back-to-top scrolling respect `prefers-reduced-motion`.
- Text colors meet WCAG AA: use `text-muted` (not lighter) for secondary text on paper, and never put marigold text on
  a light background.

When editing: keep one `h1` per page, label every new input, and keep `aria-controls`/`aria-labelledby` ids in step.

## Building and deploying

The CSS is compiled from `src/input.css`. After adding Tailwind classes or changing tokens (Node.js 24):

```sh
npm install
npm run build    # one-off, minified
npm run watch    # rebuild on every change
```

Tailwind scans the HTML and JavaScript files for class names, so classes written in `main.js` strings are generated
too; keep each class name whole (not built from pieces).

To deploy, upload the folder (without `node_modules/` and `src/` if you like) to any static host: Netlify Drop,
GitHub Pages, Cloudflare Pages, an S3 bucket or your existing web server. No server-side code is needed.

## Troubleshooting

- **The calendar shows the wrong year or "Passed" everywhere.** The page uses the visitor's clock in Eastern time.
  Check for a leftover `?now=` in the URL; it freezes the date.
- **A deadline is on a different date than the IRS announced.** Disaster relief and one-off IRS notices can postpone
  deadlines for some areas. Those aren't rules; add a note to the page or temporarily change the rule's `month` and
  `day`.
- **New styles don't show up.** Rebuild the CSS (`npm run build`) and hard-refresh. A class assembled from pieces in
  JavaScript (`'bg-' + color`) isn't generated; write the full class name.
- **Checklist checks disappear after a reload.** The browser is blocking storage (private mode, a sandboxed preview,
  strict privacy settings); checks then last for the page view only.
- **The booking grid always starts tomorrow.** That is intentional (`bookingDays()` starts at tomorrow). To allow
  same-day bookings, start the loop at `now.key` and skip times already past.
- **The office closes on a day the grid still offers.** Add the holiday id to `BOOKING.closures`, or for a one-off
  closure add a check for that date in `slotsFor()`.
- **A link like `service.html?s=Payroll` shows the fallback.** Slugs are lowercase and exact: `?s=payroll`.

## License

MIT. The code and all included artwork are free for personal and commercial use. See `LICENSE.txt` in the download.

Fonts: Hahmlet and Geologica are licensed under the SIL Open Font License and served by Google Fonts.

Fernley Whitcomb CPAs, its people, clients, testimonials, phone number and email address are fictional placeholders.
The tax content is general information, not tax, legal or accounting advice, and rates and rules change: review it
before you publish.
