# Wardline documentation

## Overview

Wardline is a corporate B2B SaaS website template for a compliance automation product: a platform that helps
startups and mid-size companies prepare for SOC 2, ISO 27001, HIPAA, GDPR, PCI DSS and NIST CSF with continuous
control monitoring, evidence collection, policies, vendor risk, access reviews and a public trust center. The
fictional company, Wardline, Inc., is based in Richmond, Virginia, and works in Eastern time
(`America/New_York`). The site is plain HTML5 with Tailwind CSS v4 and one vanilla JavaScript file, version
1.0.1. See the template page at <https://freeframe.dev/templates/wardline>, which links to the live demo.

The copy is careful about what a compliance tool can claim: Wardline helps customers prepare, and independent
auditors (a licensed CPA firm for SOC 2, an accredited certification body for ISO 27001) issue reports and
certificates. Keep that distinction if you adapt the template for a real product.

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser, or serve the folder so every page works the same as on a host:

   ```sh
   python3 -m http.server 8080
   ```

   then visit `http://localhost:8080`.

Fonts load from Google Fonts, so you need an internet connection to see the right typefaces. Nothing needs to be
installed to view or edit the pages. Rebuilding the CSS after adding Tailwind classes needs Node 24 (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with a control dashboard that switches between SOC 2, ISO 27001 and HIPAA, drawn customer marks, connect/monitor/fix/audit steps with isometric art, framework cards built from data, numbers band, "who does what" comparison, Kelvara story teaser, assessment CTA |
| `platform.html` | Platform tour | Six keyboard tabs (controls, evidence, policies, vendor risk, access reviews, trust center), each with its own HTML/SVG mockup; roles; access table |
| `frameworks.html` | Framework explorer | Framework chips, control families as bars, cross-mapping with a Venn diagram and a control table, a pairwise overlap matrix, "who issues what" table |
| `assessment.html` | Readiness assessment | Eight-question quiz, score ring, ranked gaps, preparation range, deadline verdict, method notes |
| `pricing.html` | Pricing | Three plan cards, calculator with an itemized estimate, comparison table, FAQ |
| `integrations.html` | Integrations directory | Search, category chips with counts, sorting, 24 cards with drawn monograms, empty state |
| `trust.html` | Trust center | Control status by category, rolling report dates, documents, subprocessors, document request form with NDA |
| `customers.html` | Customer stories | Framework filter, three stories with generated before-and-after charts |
| `contact.html` | Book a demo | Three-step form with validation, saved draft, slot picker in the visitor's time zone, success state |
| `404.html` | Not found | "Control not found" illustration and links |

## Project structure

```text
wardline/
  index.html … contact.html, 404.html   the ten pages
  assets/css/style.css                  compiled Tailwind CSS (generated, committed)
  assets/js/data.js                     all content data: frameworks, controls, integrations, pricing, quiz, trust center, demo
  assets/js/main.js                     menus, reveals, dates and every interactive feature
  assets/img/favicon.svg                logo mark used as the favicon
  assets/img/og-image.svg               social image source
  assets/img/og-image.png               social image (1200×630) the pages point to
  src/input.css                         Tailwind source: brand tokens and a few components
  package.json                          scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

Colors and fonts are Tailwind theme tokens in `src/input.css`, so every utility (`bg-ink`, `text-teal`,
`border-line`) follows them.

| Token | Value | Used for |
|-------|-------|----------|
| `--color-ink` | `#0b1a2c` | Headings, body text, dark bands and footer |
| `--color-paper` / `--color-card` / `--color-cloud` | `#f6f8fa` / `#ffffff` / `#edf1f5` | Page background, panels, alternate bands |
| `--color-line` / `--color-line-strong` | `#dbe2ea` / `#93a1b3` | Hairlines and input borders |
| `--color-slate` / `--color-slate-2` | `#3f4d61` / `#566376` | Secondary text and captions (AA on light backgrounds) |
| `--color-frost` | `#a9b8ca` | Secondary text on ink |
| `--color-teal`, `-deep`, `-soft`, `-bright` | `#0b6f80` … | The accent: buttons, links, focus rings, charts |
| `--color-pass`, `--color-attn`, `--color-fail` (+ `-soft`) | green, amber, red | Status pills, always with a symbol and a word |

To change the accent, edit the teal tokens and rebuild:

```css
--color-teal: #1d4ed8;
--color-teal-deep: #1e3a8a;
--color-teal-soft: #dbeafe;
```

Some SVG art in `main.js` (seals, Venn diagram, charts, monograms) and the inline SVGs in the pages use hex
values directly; search for `#0b6f80` to update them too.

### Typography

Three Google Fonts families load in the `<head>` of every page:

- **Anek Latin** (500–700) for headings (`--font-display`)
- **Source Sans 3** (400, 600, 700, italic 400) for body text (`--font-sans`)
- **Roboto Mono** (400, 500) for control IDs, labels and figures (`--font-mono`)

To swap a family, change the `<link>` in each page and the matching variable in `@theme`. In SVG, quote
"Source Sans 3" (`font-family="'Source Sans 3'"`), because a family name ending in a number must be quoted.

### Content

Everything data-driven lives in `assets/js/data.js` on `window.WARDLINE`:

| Constant | What it holds |
|----------|---------------|
| `FRAMEWORKS` | Six frameworks with a one-letter `code`, `seal` shape, `issuer`, `summary` and `prep` |
| `FAMILIES` | Fifteen control families by two-letter prefix |
| `CONTROLS` | The 81-control library as `[id, title, frameworkLetters]` |
| `INTEGRATION_CATEGORIES`, `INTEGRATIONS` | Six categories and 24 integrations with checks, setup minutes and access |
| `ANNUAL_DISCOUNT`, `PLANS`, `ADDONS` | Pricing rules |
| `ASSESSMENT` | Sizes, five scored questions, targets, deadlines and score bands |
| `TRUST_CATEGORIES`, `SUBPROCESSORS`, `DOCUMENTS`, `PERSONAL_DOMAINS` | Trust center content and email checks |
| `DEMO`, `SPECIALISTS` | Demo form options, slot times and routing |
| `STORIES` | Customer stories and their before-and-after metrics |

Adding a control mapped to SOC 2, ISO 27001 and NIST CSF updates every count, bar, Venn diagram and matrix cell:

```js
["AC-10", "Break-glass accounts sealed and alerted", "SIN"],
```

Adding an integration:

```js
{ id: "shiftledger", name: "Shiftledger", category: "hr", checks: 7, summary: "…", access: "Read-only report token", minutes: 5 },
```

Page copy (headings, story text, FAQ) is plain HTML in each page.

### Images and artwork

All art is SVG drawn for this template: the logo, the four step illustrations, the six platform mockups (HTML
with inline SVG), the integrations hub, the 404 shield and the customer marks are inline in the pages. Framework
seals (`seal()`), integration monograms (`monogram()`), the Venn diagram and the story charts are generated in
`main.js`. The seals are original generic badges, not any standards body's mark; keep it that way unless you
have permission to use an official logo.

The social image is `assets/img/og-image.svg`; after editing it, render the PNG (1200×630) with a headless
browser or any SVG-to-PNG tool, and keep `og:image` pointing at the PNG. The favicon is
`assets/img/favicon.svg`.

### Navigation, header and footer

The header (status strip, logo, main navigation, "Book a demo" button, mobile menu) and the footer are repeated
in every page. To add a page, copy an existing page, then add a link in the `<nav aria-label="Main">` list, the
`#mobile-menu` list and the footer of every page. Mark the current page with `aria-current="page"`.

## Features

### Hero control dashboard

`initHeroDashboard()` switches the dashboard on `index.html` between three frameworks with the
`[data-dash-fw]` buttons (`aria-pressed`). Each framework's passing, attention and failing counts, readiness
percentage and audit-window offset are in the `states` object inside that function. The audit window date is
today plus the offset (46 days for SOC 2, 73 for ISO 27001, 29 for HIPAA), so it never goes stale.

### Platform tabs

`initTabs()` drives any `[data-tabs]` block with the ARIA tabs pattern: arrow keys, Home and End move between
tabs, and the URL hash (`#controls`, `#evidence`, `#policies`, `#vendors`, `#access`, `#trust`) opens a tab
directly. Dates inside the mockups use `data-day-offset` (see [Keeping the demo current](#keeping-the-demo-current)).

### Framework explorer and cross-mapping

`initFrameworks()` on `frameworks.html` renders the selected framework's issuer, preparation note, control count
and families from `FRAMEWORKS` and `CONTROLS`, then compares it with a second framework. A control counts toward
a framework when its letters include the framework's `code`. Counts with the shipped data:

| Framework | Controls |
|-----------|----------|
| SOC 2 | 61 |
| ISO 27001 | 63 |
| HIPAA | 36 |
| GDPR | 17 |
| PCI DSS | 49 |
| NIST CSF | 46 |

| Pair | Shared | Only first | Only second |
|------|--------|------------|-------------|
| SOC 2 + ISO 27001 | 57 | 4 | 6 |
| SOC 2 + HIPAA | 32 | 29 | 4 |
| SOC 2 + PCI DSS | 42 | 19 | 7 |
| ISO 27001 + GDPR | 9 | 54 | 8 |

The view chips switch the table between shared and unique controls. `renderMatrix()` draws the pairwise matrix;
each number links to that pair. URL parameters: `?fw=<id>&vs=<id|none>` (ids: `soc2`, `iso27001`, `hipaa`,
`gdpr`, `pci`, `nist`); unknown values fall back to SOC 2 compared with ISO 27001. The page keeps the URL in step
with `history.replaceState`.

### Readiness assessment

`initAssessment()` steps through eight questions (`size`, `cloud`, `policies`, `identity`, `logging`,
`vendors`, `target`, `deadline`); options come from `ASSESSMENT`. The rules, in `assess()`:

- Score: the five scored answers add up their `points` (20 each at best, 100 in all).
- Band: 80+ "Well prepared", 55+ "Solid foundation", 30+ "Early stage", below that "Starting out".
- Gaps: every scored answer below 20 points, ranked by points missing (ties keep question order); 10 or more
  missing is "High priority", otherwise "Medium priority".
- Range: `low = round((targetLow + gapWeeks) × sizeFactor)`, `high = round((targetHigh + gapWeeks × 1.5) × sizeFactor)`,
  with size factors 1, 1.15, 1.35 and 1.6.
- Deadline verdict: "Realistic" when `high` fits the deadline weeks (13, 26 or 52), "Tight" when only `low`
  fits, "At risk" otherwise; "No date" with no deadline.

Example: 51–200 people, one cloud set up by hand, draft policies, MFA without SSO, some logs, no vendor reviews,
SOC 2 Type II, 3–6 months gives a score of **47** ("Early stage"), **16–24 weeks** and "Realistic", with gaps in
the order vendor risk reviews, security policies, logging and alerting, identity, cloud configuration.

Answers are saved as they are chosen, so a returning visitor sees their results. The results link to
`contact.html?fw=<framework>&size=<size>`. The copy says plainly that the result is an estimate, not an audit.

### Pricing calculator

`initPricing()` and `quote()` on `pricing.html`. The plan follows the employee count (5–2,000): Essentials up to
100, Growth up to 500, Scale up to 2,000.

```text
monthly = base + extra employees × perEmployee + extra frameworks × extraFramework + add-ons
annual per month = round(monthly × (100 − ANNUAL_DISCOUNT) / 100)
```

| Plan | Base | Included employees / frameworks | Per extra employee | Per extra framework | Included add-ons |
|------|------|-------------------------------|--------------------|---------------------|------------------|
| Essentials | $690 | 25 / 1 | $8 | $240 | none |
| Growth | $1,450 | 100 / 2 | $6 | $200 | Trust center |
| Scale | $3,200 | 500 / 3 | $4 | $160 | Trust center, vendor risk |

Add-ons: vendor risk $260/month, penetration test coordination $350/month, security awareness training $2 per
employee per month, trust center $120/month. `ANNUAL_DISCOUNT` is 20.

Examples: the default (60 employees, 1 framework, annual) is $970 a month, or **$776** a month billed annually
($9,312 a year). 120 employees, 2 frameworks, vendor risk and training is Growth at $2,070 a month, or
**$1,656** a month billed annually ($19,872 a year, saving $4,968). Plan cards show "from" prices: $552, $1,160
and $2,560 billed annually.

### Integrations directory

`initIntegrations()` filters `INTEGRATIONS` by category chip and a search over name, summary and category, and
sorts by name or by number of checks. Chip counts follow the search. The filters are saved; `?category=<id>`
(`cloud`, `identity`, `hr`, `ticketing`, `code`, `endpoint`) opens a category. Example: Identity and SSO plus
"mfa" shows 2 integrations with 33 automated checks.

### Trust center

`initTrust()` renders the control categories (`TRUST_CATEGORIES`, 20 of 21 passing), the subprocessor table and
the report dates (see [Keeping the demo current](#keeping-the-demo-current)). Status pills always pair color with
a symbol and a word ("Passing", "Monitoring").

### Customer stories

`initStories()` draws two bars per metric from `STORIES[].metrics` (before in gray, after in teal, each with a
text label and an `aria-label`), and the chips filter stories by framework (`data-frameworks` on each article).

### Demo booking and time zones

`initDemo()` on `contact.html` runs three steps: team (role, size, at least one framework, timeline), details
(name, work email, company, note) and a time. Slots are `DEMO.times` in Eastern time (10:00, 11:30, 13:00, 14:30,
16:00) on the next five business days after today, skipping weekends and US federal holidays computed by rule in
`holidaysFor(year)` (New Year's Day, Martin Luther King Jr. Day, Washington's Birthday, Memorial Day,
Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving Day, Christmas Day; Saturday
holidays move to Friday, Sunday holidays to Monday). Some slots show as booked by a fixed hash of date and time
(`slotTaken()`).

Times show in the visitor's own zone (from the browser) with the Richmond time underneath; the "Show times in"
select switches between the visitor's zone and six others. `?tz=America/Los_Angeles` (one of the listed zones)
preselects a zone.

The call is routed by `SPECIALISTS`, first match wins: HIPAA to Soledad Ilunga, PCI DSS to Evander Lachance,
201+ employees to Ravindra Satterwhite, everyone else to Leontyne Fairbairn. `?fw=<id>`, `?size=<s1–s4>` and
`?plan=<essentials|growth|scale>` prefill the first step (links from the assessment and pricing pages use them).

### Menu and motion

`initMenu()` toggles the mobile menu (`aria-expanded`, Esc closes and returns focus). Elements with `.reveal`
fade in as they scroll into view; everything above a revealed element is revealed too, and reduced motion
shows everything at once. The pulse dot in the status strip stops under reduced motion.

### Keeping the demo current

Nothing dated goes stale:

- `KEEP_DEMO_CURRENT = true` in `main.js` rolls the trust center dates: the SOC 2 Type II period ends on the
  latest September 30 whose report has been issued (issued on the fourth Wednesday of October), the ISO 27001
  certificate runs in three-year cycles from March 14, 2025, and the latest penetration test is the most recent
  August. On Nov 3, 2026 that is Oct 1, 2025 – Sep 30, 2026, issued Oct 28, 2026; certified Mar 14, 2025, valid
  through Mar 13, 2028; August 2026. Set it to `false` to show the fixed dates in `FIXED_REPORTS`.
- `data-day-offset="-3"` (with `data-format="short|medium|weekday"`) fills a date relative to today; `data-today`
  fills today's date; `data-year` fills the copyright year.
- The hero audit window, the document review day and the demo slots are worked out from today.
- `?now=YYYY-MM-DDTHH:MM` previews the whole site at another Eastern time, for reviews and screenshots.

For a real site with fixed dates, set `KEEP_DEMO_CURRENT` to `false`, edit `FIXED_REPORTS`, and replace
`data-day-offset` elements with real dates.

## Forms

| Form | Page | Validation | Success |
|------|------|------------|---------|
| Readiness assessment | `assessment.html` | One answer per question | Results panel |
| Document request | `trust.html` | At least one document, full name, company, a valid work email (not a personal domain from `PERSONAL_DOMAINS`), the NDA box when any chosen document needs it | Reference `TR-` + 6 characters, the next business day for review, next steps |
| Book a demo | `contact.html` | Step 1: role, size, a framework, timeline. Step 2: first and last name, valid work email, company. Step 3: a slot | Reference `DM-MMDD-XXXX` (slot month and day plus 4 characters), time in Eastern and the visitor's zone, specialist, next steps |

Reference characters avoid 0, O, 1 and I. Errors appear inline next to each field, with `aria-invalid` on the
input, and focus moves to the first problem.

The demo forms don't send anything until you connect them. Each submit handler in `main.js` has a comment at
the spot to add a request; for example with Formspree:

```js
const response = await fetch("https://formspree.io/f/your-id", {
  method: "POST",
  body: new FormData(form),
  headers: { Accept: "application/json" },
});
if (!response.ok) {
  // show an error message and stop
}
```

Make the handler `async`, and show the success panel only when the response is OK. For bookings you would
usually call your scheduling tool's API instead and use its confirmed time.

## Saved data (localStorage)

| Key | Shape | Validation on read |
|-----|-------|--------------------|
| `wardline:assessment:v1` | `{ "size": "s2", "cloud": "single", …, "target": "soc2t2", "deadline": "d6" }` | Each answer must be a known option key; unknown ones are dropped |
| `wardline:pricing:v1` | `{ "employees": 120, "frameworks": 2, "addons": ["vendor"], "billing": "annual" }` | Whole numbers in range, known add-on ids, `monthly` or `annual`; otherwise defaults |
| `wardline:integrations:v1` | `{ "category": "identity", "q": "mfa", "sort": "name" }` | Known category or `all`, a string of up to 60 characters, `name` or `checks` |
| `wardline:demo-draft:v1` | `{ "role", "size", "frameworks", "timeline", "first", "last", "email", "company", "note" }` | Known keys only, strings trimmed to length; removed after booking |

Every read and write goes through `safeStorage`, which falls back to memory when the browser blocks
localStorage (private modes, sandboxed iframes). Keys from storage and the URL are checked with
`Object.prototype.hasOwnProperty`, so values like `?fw=constructor` are ignored. To reset, clear the site's data
or run `localStorage.removeItem("wardline:pricing:v1")` in the console. Bump the `:v1` suffix if you change a shape.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `theme-color` in its `<head>`.
`og:image` is the relative path `assets/img/og-image.png`; on a live site change it to the absolute URL (for
example `https://www.example.com/assets/img/og-image.png`), since social networks need absolute URLs. Add a
`sitemap.xml` listing the nine content pages and a `robots.txt` pointing to it. A `SoftwareApplication` or
`Organization` JSON-LD block is a good addition once you have real details.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page and ordered headings.
- Visible focus rings in teal (bright teal on dark bands).
- Tabs follow the ARIA tabs pattern; toggle buttons use `aria-pressed`; the menu uses `aria-expanded`.
- Status is never shown by color alone: each pill has a symbol and a word, and charts have text labels and
  `aria-label` summaries.
- Live regions announce result counts, overlap text and estimates; errors are inline and linked with
  `aria-describedby`.
- Scrollable tables are keyboard-focusable; reduced motion turns off reveals, the pulse and transitions.

When editing, keep one `h1` per page, label every new input and keep body text at the `slate` tokens or darker.

## Building and deploying

`assets/css/style.css` is compiled and committed. After changing classes in HTML or `main.js`, rebuild it:

```sh
npm install
npm run build    # or npm run watch while editing
```

Classes built inside JavaScript strings are picked up because Tailwind scans `assets/js`. Upload the folder to
any static host (Netlify Drop, GitHub Pages, Cloudflare Pages, an S3 bucket). All links are relative, so it also
works from a subfolder.

## Troubleshooting

- **Fonts look like the system font.** Google Fonts needs a connection; check the `<link>` in the page `<head>`.
- **A new class has no effect.** Rebuild the CSS with `npm run build`; class names must appear as whole strings.
- **The assessment opens on the results.** Answers are saved; use "Start over", or remove
  `wardline:assessment:v1`.
- **Demo slots are on the wrong days.** Dates come from the visitor's clock in Eastern time; check `?now=` isn't
  in the URL, and edit `holidaysFor()` for your own office closures.
- **Counts on the frameworks page changed.** They come from `CONTROLS`; check the letters on any control you
  edited.
- **Report dates don't match your real report.** Set `KEEP_DEMO_CURRENT` to `false` and fill `FIXED_REPORTS`.

## License

MIT. The code and all included artwork are free for personal and commercial use; see `LICENSE.txt` in the
download.

Anek Latin, Source Sans 3 and Roboto Mono are provided by Google Fonts under the SIL Open Font License.

Wardline, its customers, integrations, subprocessors and people are fictional; the framework seals are generic
drawings, not official marks.
