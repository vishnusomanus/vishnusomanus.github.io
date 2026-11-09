# Latchline documentation

## Overview

Latchline is a nine-page marketing website for a B2B software company: a customer onboarding platform based in
Reno, Nevada. It is built with plain HTML5, Tailwind CSS v4 and vanilla JavaScript, with no runtime dependencies.
The site explains the product with a six-stage board explorer, dates a plan from any of fifteen illustrated
playbooks, compares customer stories with generated before-and-after charts, builds an itemized pricing quote,
lists a filterable resource library and finishes with a qualified sales inquiry and a demo time picker. This is
version 1.0.4 (see `template.json` and [CHANGELOG.md](CHANGELOG.md)). The template page with a link to the live demo
is at [freeframe.dev/templates/latchline](https://freeframe.dev/templates/latchline).

The copy is written in US English, prices are in US dollars and every date and time is worked out in the
`America/Los_Angeles` time zone (Pacific time), where the Reno office is.

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Everything works from the file system: links are relative and there is no
   build step to view the site.
3. For a closer match to a real host, serve the folder instead:

   ```sh
   python3 -m http.server 8080
   ```

   Then open `http://localhost:8080`.

Fonts load from Google Fonts, so the first visit needs an internet connection. You only need Node.js (version
24) if you change Tailwind classes and want to rebuild `assets/css/style.css`; see
[Building and deploying](#building-and-deploying).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with a live-looking onboarding board, customer wordmarks, the "gap after yes" timeline diagram, four pillars, three featured playbooks, benchmark numbers, a quote and a demo call to action |
| `product.html` | Product | Six-stage explorer (tabs, customer and team views, status lanes, risk signal), plan preview with real dates, six platform features |
| `playbooks.html` | Playbook library | Fifteen playbooks with segment chips and live counts, motion, length and sort filters, search, saved shortlist panel |
| `customers.html` | Customer stories | Six stories filtered by industry, a detail panel with a before-and-after SVG chart, change figures and a quote |
| `pricing.html` | Pricing | Active-onboarding quote calculator: volume, billing, three plans with a lowest-price recommendation, add-ons, itemized quote, FAQ |
| `resources.html` | Resources | Rolling monthly onboarding clinic dates and a sixteen-item library with format chips, topic, search and sort |
| `company.html` | Company | Story, values, eight team members with drawn portraits, history, Reno office map, live open or closed status and upcoming closures |
| `contact.html` | Contact sales | Qualified inquiry with routing, a demo day and time picker, context from pricing, playbooks and the clinic, a success state with a reference |
| `404.html` | Page not found | Friendly error with links to the main pages |

## Project structure

```text
latchline/
  index.html, product.html, playbooks.html, customers.html,
  pricing.html, resources.html, company.html, contact.html, 404.html
  assets/
    css/style.css        compiled Tailwind CSS (generated, do not edit by hand)
    js/data.js           all content data: playbooks, stages, stories, resources, team, plans, hours
    js/main.js           menu, reveals, dates, and every interactive feature
    img/favicon.svg      the latch mark
    img/og-image.svg     social image source (1200 x 630)
    img/og-image.png     social image used by og:image
    img/playbook-*.svg   one diagram per playbook (fifteen files, 480 x 270)
    img/hero-*.svg       page artwork for product, playbooks, customers, pricing, resources, company and 404
    img/reno-map.svg     office map on the company page
  src/input.css          Tailwind source: @theme tokens and a small @layer components
  package.json           scripts to rebuild the CSS
  README.md              short introduction
  DOCS.md                this guide
  CHANGELOG.md           version history
```

## Customizing

### Brand and colors

Design tokens live in the `@theme` block of `src/input.css`. Each `--color-*` token becomes a set of Tailwind
utilities (`bg-cobalt`, `text-ink-soft`, `border-line` and so on).

| Token | Value | Used for |
|-------|-------|----------|
| `--color-paper` | `#f2f4f7` | Page background |
| `--color-card` | `#ffffff` | Panels, boards and inputs |
| `--color-ink` | `#0c1427` | Text, dark bands, footer |
| `--color-ink-soft` / `--color-ink-faint` | `#3b4660` / `#56607a` | Secondary text and captions |
| `--color-cobalt` | `#1f45d6` | Buttons, links, selected states |
| `--color-sun` | `#ffcf3f` | Highlight marker and badges (never used for text) |
| `--color-moss` / `--color-flare` | `#186b48` / `#b83218` | On track and blocked states, errors |

To change the brand color, edit the token and rebuild the CSS:

```css
@theme {
  --color-cobalt: #0b6e69;
  --color-cobalt-deep: #08524e;
  --color-cobalt-soft: #d6f2ef;
}
```

A few colors are written directly inside SVG files and in the SVG strings in `main.js` (story charts, resource
glyphs, portraits). Search for the hex value, for example `#1f45d6`, to update those as well.

### Typography

The site uses three Google Fonts, loaded with a `<link>` in the `<head>` of every page:

- **Funnel Display** (500, 600, 700) for headings, `font-display`.
- **Funnel Sans** (400, 500, 600 and italic 400) for body text, `font-sans`.
- **Spline Sans Mono** (500) for small diagram labels, the `.tick` class and `font-mono`.

To swap a font, change the `family=` parameter in the Google Fonts link on each page and the matching
`--font-display`, `--font-sans` or `--font-mono` token in `src/input.css`, then rebuild the CSS. Keep a system
fallback at the end of each stack.

### Content

Page copy is in the HTML files. Lists that the scripts render are in `assets/js/data.js`, which defines
`window.LATCHLINE`:

| Constant | What it holds | Shown on |
|----------|---------------|----------|
| `PLAYBOOKS` | 15 playbooks: `id`, `title`, `segment`, `motion`, `days`, `tasks`, `roles`, `summary`, `firstValue`, `milestones`, `art` | Home, playbooks, product plan preview, contact |
| `SEGMENTS`, `MOTIONS` | Labels for the playbook filters | Playbooks |
| `STAGES` | The six board stages with customer and team text, automations, a risk signal and lane tasks | Product |
| `STORIES`, `INDUSTRIES` | Six customer stories with three before-and-after metrics each | Customers |
| `RESOURCES`, `RESOURCE_TYPES`, `TOPICS` | Sixteen library items with past publication dates | Resources |
| `TEAM` | Eight people with role, bio and portrait settings | Company, resource authors, contact routing |
| `PLANS`, `ADDONS`, `ANNUAL_DISCOUNT` | Pricing tiers, add-ons and the annual discount | Pricing, contact |
| `HOURS`, `CLOSED_DATES`, `DEMO_SLOTS` | Office hours, one-off closures and demo start times | Company, contact |

Example: add a playbook. Copy an entry in `PLAYBOOKS`, give it a new lowercase `id`, and add an SVG at
`assets/img/playbook-<id>.svg` (480 x 270):

```js
{
  id: "reseller-launch",
  title: "Reseller launch",
  segment: "services",
  motion: "assisted",
  days: 25,
  tasks: 28,
  roles: ["Channel manager", "Reseller admin"],
  summary: "Price lists, co-branded assets and the first joint deal, in one plan both sides can see.",
  firstValue: "First reseller deal registered",
  milestones: ["Agreement signed", "Portal access", "Training complete", "First deal registered"],
  art: "playbook-reseller-launch.svg",
},
```

Every playbook needs at least two `milestones`; the plan preview spreads them evenly across `days`. Counts,
filters and the "fifteen" wording in the page copy (home, playbooks and pricing) are plain text, so update that
text if you change the number.

Customer stories use `better: "lower"` or `"higher"` on each metric so the chart and change label read the right
way. Metrics with `unit: "%"` show a change in percentage points (`+17 pts`); others show a percentage change.

### Images and artwork

All artwork is SVG drawn for this template: fifteen playbook diagrams, seven page illustrations, the office map,
the favicon and the social image. Team portraits, resource glyphs, customer wordmarks and story charts are drawn
by `main.js` from data. The home page timeline and the hero board are inline in `index.html`.

To use photos instead, keep these proportions: playbook images 16:9 (480 x 270), page illustrations about 3:2
(560 x 380, product 640 x 440), portraits square. The social image is `assets/img/og-image.png` (1200 x 630); edit
`og-image.svg` and export it again as a PNG at the same size.

### Navigation, header and footer

The header and footer are repeated in each HTML file. To add a page, copy an existing page, change its
`<title>`, description and `og:` tags and `data-page` on `<body>`, then add a link to the desktop menu
(`<nav aria-label="Main">`) and the mobile menu (`#mobile-menu`) on every page. Mark the current page's link with
`aria-current="page"`.

## Features

### Onboarding board explorer

`initStages()` in `main.js` renders a tab for each entry in `STAGES` and fills the panel with the stage's text,
automations, risk signal and two lanes of tasks. Task `status` is `done`, `doing`, `blocked` or `next`, each with
its own color (see `STATUS`). The "Customer view" and "Team view" buttons switch the text between the stage's
`customer` and `team` fields. Selecting a stage writes `#stage-<id>` to the address, and a link such as
`product.html#stage-access` opens that stage.

Accessibility: the stages use the ARIA tabs pattern (`role="tablist"`, `tab`, `tabpanel`) with roving
`tabindex`; Left, Right, Up, Down, Home and End move between stages. The view buttons use `aria-pressed`.

### Plan preview

`initPlanPreview()` dates a playbook from a kickoff date. `planDates(playbook, kickoff)` places milestone `i` on
day `round(days × i / (milestones − 1))` after kickoff and moves any milestone that lands on a weekend or office
closure to the next business day. A kickoff on a closed day starts on the next business day, with a note.

The default kickoff comes from `defaultKickoff()`: the first Monday at least three days after today that is a
business day. On October 24, 2026 (Pacific time) the B2B software kickoff plan reads Monday, November 2, then
November 9, 13, 18 and "First value by Monday, November 23, 2026". `product.html?playbook=<id>#plan` preselects a
playbook; unknown ids fall back to `saas-kickoff`.

### Playbook library and shortlist

`initPlaybooks()` filters `PLAYBOOKS` by segment (chips), motion, target length and a search over titles,
summaries, roles and milestones, then sorts by the chosen order. Each segment chip shows how many playbooks it
would show with the other filters applied, and the result count is announced in a live region ("15 playbooks",
"1 playbook of 15"). The filters are mirrored in the address so a filtered view can be shared:

| Parameter | Values |
|-----------|--------|
| `segment` | `software`, `operations`, `services`, `health`, `finance` |
| `motion` | `self-serve`, `assisted`, `enterprise` |
| `duration` | `14`, `30`, `60` (maximum target days) |
| `sort` | `recommended`, `fastest`, `lightest`, `az` |
| `q` | Search text, up to 60 characters |

Expected counts: all 15; Software 5, Operations 3, Services 3, Healthcare 2, Finance 2; Self-serve 3, Assisted 6,
Enterprise 6; up to 14 days 5; up to 30 days 10.

The "Shortlist" button on every card (also on the home page) toggles `aria-pressed` and saves the playbook id.
The dark panel on the playbooks page lists shortlisted playbooks with their total tasks, a remove button for
each, "Clear shortlist" and a link to contact sales, which carries the shortlist into the inquiry.

### Customer stories

`initCustomers()` renders a card per story with its lead metric and filters by industry chips. "Read the story"
fills the detail panel below with the story, a quote and a chart drawn by `metricChart()`; the chart has an
`aria-label` that reads every before and after value. `customers.html?story=<id>` opens a story directly (for
example `?story=ironpine-freight`).

### Pricing calculator

`initPricing()` and `priceQuote()` build the quote. Each plan in `PLANS` has a monthly `fee`, a number of
`included` active onboardings, a price per `extra` onboarding and a `max`. `recommendedPlan()` picks the eligible
plan with the lowest monthly total; choosing a plan overrides it until "Show the lowest-priced plan instead".
Add-ons listed in a plan's `bundled` array show as "Included". Annual billing takes `ANNUAL_DISCOUNT` (15%) off
everything recurring and bills twelve months at once; one-time add-ons (Guided launch) are added to the first
invoice.

| Settings | Result |
|----------|--------|
| 30 active, annual, no add-ons (the default) | Team: $290 + 15 × $16 = $530 subtotal, $450.50 a month, $5,406 billed today |
| 60 active, annual, SSO and CRM sync | Growth: $790 + 10 × $11 + $150 + $120 = $1,170, $994.50 a month, $11,934 a year |
| 200 active, monthly | Enterprise is cheaper than Growth ($2,400 against $2,440): $2,400 a month |

"Send this quote to sales" links to `contact.html?topic=sales&active=…&billing=…&plan=…&addons=…`. The pricing
page reads the same parameters, so a quote link also reopens the calculator. Prices are in USD before sales tax.

### Resource library and onboarding clinic

`initResources()` filters `RESOURCES` by format chips (with live counts), topic and search, sorted newest or
quickest first. `?type=` (`guide`, `template`, `checklist`, `benchmark`, `recording`) and `?topic=` (`kickoff`,
`handoff`, `adoption`, `metrics`, `security`) preselect filters. Publication dates are past dates and stay as
written.

`clinicDates()` lists the next three monthly clinics: the second Thursday of each month, 10:00 to 11:00 a.m. PT,
at least two days ahead and never on an office closure. On October 24, 2026 they are November 12, December 10 and
January 14. "Save a seat" opens `contact.html?topic=clinic&date=YYYY-MM-DD`.

### Team, office hours and closures

`initTeam()` draws a portrait for each person in `TEAM` with `portrait()`, from `skin`, `hair` (`short`, `long`,
`curly`, `bun`, `crop` or `wave`), `hairColor`, `shirt` and `glasses`.

`officeStatus()` shows whether the Reno office and support desk are open now, from `HOURS` in Pacific time, for
example "Open now. The support desk closes at 5:00 p.m. PT." or "Closed. Opens Monday at 7:00 a.m. PT."
`holidaysFor(year)` works out closures by rule for any year: New Year's Day, Martin Luther King Jr. Day,
Presidents' Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Nevada Day (last Friday in October),
Thanksgiving, Family Day (the Friday after) and Christmas Day, with weekend holidays observed on the nearest
weekday. Add one-off closures as `"YYYY-MM-DD"` strings to `CLOSED_DATES` in `data.js`. The company page lists
the next four closures.

### Demo time picker

On the contact page, choosing "Book a 30-minute demo" (or arriving at `contact.html#demo`, which the header's
"Book a demo" link uses) shows the picker. `demoDays()` offers the next five business days after today and each
day offers the start times in `DEMO_SLOTS` (Pacific time), with the visitor's own time shown when their time zone
differs. `slotTaken()` marks some slots as booked using a simple hash of the date and time, so the same slots
stay taken all day; replace it with your calendar's availability when you connect a real booking service.

### Menu and motion

The mobile menu button toggles `aria-expanded`, moves focus to the first link and closes with Escape. Content
with the `.reveal` class fades in as it scrolls into view (`initReveals()`), and everything above a revealed
element is revealed too. With reduced motion, reveals and transitions are switched off.

### Keeping the demo current

The demo stays correct on any date:

- **Rules, not dates:** demo slots, the plan preview's default kickoff, the clinic dates, office status and
  closures are all computed from today in `America/Los_Angeles`.
- **`KEEP_DEMO_CURRENT`** (top of `main.js`, `true`): clinics roll forward by the second-Thursday rule. Set it to
  `false` to list the fixed dates in `FIXED_CLINIC_DATES` instead (past ones are dropped).
- **Copyright year:** filled into `[data-year]` in the browser.
- **`?now=YYYY-MM-DDTHH:MM`** previews any page at a Reno wall-clock time, for example
  `company.html?now=2027-07-05T09:00` (Independence Day observed, so the office shows as closed).

Customer story numbers, the benchmark and resource publication dates are past facts and keep their dates.

## Forms

There are three forms. The playbook, resource and story filters and the pricing calculator never submit
anything. The plan preview checks that a kickoff date is set.

The sales inquiry on `contact.html` validates on submit, shows a summary ("Please check 3 fields below.") and an
inline message under each field, and moves focus to the first problem:

| Field | Rule |
|-------|------|
| Full name | 2 to 80 characters |
| Work email | A valid address; common free mail domains (Gmail, Yahoo, Outlook and others in `FREE_MAIL`) are refused |
| Company, role, company size, start | Required |
| Active onboardings at once | A whole number from 1 to 5,000 |
| Message | Optional, up to 1,500 characters |
| Demo time | Required when the topic is a demo |
| Consent | Must be checked |

On success the form is replaced with "Request received", a reference such as `LL-261024-4821`, who will pick it
up and what happens next. Routing: partnerships go to Nkechi Amankwah, migrations to Elodie Reiss, and teams with
150 or more active onboardings or more than 200 people to Laszlo Tenney; everyone else to the sales team. The
reply day is today when the request arrives on a business day before 3:00 p.m. PT, otherwise the next business day.

Context travels with the request in a hidden `context` field: a pricing quote from the URL, a clinic date and the
playbook shortlist, listed above the form so the visitor can see them.

The demo form does not send anything until you connect it. To use a form service such as Formspree, find the
comment "Connect a real endpoint here" in `initContact()` and make the submit handler post the form, showing the
success state only when the service answers OK:

```js
const response = await fetch("https://formspree.io/f/your-form-id", {
  method: "POST",
  body: new FormData(form),
  headers: { Accept: "application/json" },
});
if (!response.ok) {
  $("[data-form-errors]").textContent = "Sorry, that didn't go through. Please try again or email sales@latchline.example.";
  $("[data-form-errors]").hidden = false;
  return;
}
```

Make the listener `async` when you add this. All fields have `name` attributes, so `FormData` includes them, with
the chosen demo time in `demoSlot`.

## Saved data (localStorage)

| Key | Shape | Validation on read |
|-----|-------|--------------------|
| `latchline:shortlist:v1` | Array of playbook ids, `["saas-kickoff", "payroll-switch"]` | Must be an array; unknown, duplicate and non-string ids are dropped and the cleaned list is saved back |
| `latchline:quote:v1` | `{ "active": 60, "billing": "annual", "plan": "auto", "addons": ["sso", "crm"] }` | `active` must be a whole number from 1 to 1,000; `billing`, `plan` and add-on ids must be known keys; anything else falls back to the defaults |

Every read and write goes through `safeStorage`, which falls back to memory when the browser blocks
localStorage (private modes, sandboxed iframes), so the shortlist and calculator keep working for the visit.
Ids from storage and the URL are looked up with an own-key check, so values such as `?segment=constructor` are
ignored. To reset, clear the site's data in the browser, or run `localStorage.removeItem("latchline:shortlist:v1")`
in the console. Bump the `:v1` suffix in `STORAGE_KEYS` if you change a shape.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `theme-color` in its `<head>`. `og:image`
points at `assets/img/og-image.png` with a relative path; social sites need an absolute URL, so change it on every
page when you deploy:

```html
<meta property="og:image" content="https://www.yourdomain.com/assets/img/og-image.png" />
```

Consider adding a `sitemap.xml` listing the eight content pages and a `robots.txt`. There is no structured data;
`Organization` or `SoftwareApplication` JSON-LD would suit this site.

## Accessibility

- Skip link to `#main`, landmarks (`header`, `nav`, `main`, `footer`) and one `<h1>` per page.
- Visible focus outlines in cobalt (sun yellow on dark bands).
- Tabs with arrow-key support on the product page; `aria-pressed` on view, shortlist and story buttons.
- Live regions for result counts, the quote total, the plan preview, shortlist changes (`#notice`) and form
  errors; the success panel takes focus.
- Filter chips are real radio buttons, and demo days and times are radio groups, so they work with the keyboard
  and screen readers.
- Charts and diagrams have text alternatives (`aria-label` or a figure caption); decorative SVGs are hidden.
- Reduced motion turns off reveals, smooth scrolling and transitions.

When editing, keep one `<h1>` per page, give every new input a `<label>`, and check that any new
`aria-controls` or `aria-describedby` points at an id that exists.

## Building and deploying

The compiled CSS is committed, so the site works as downloaded. After changing Tailwind classes in the HTML or
in `main.js`, rebuild it with Node 24:

```sh
npm install
npm run build    # or: npm run watch while editing
```

Tailwind scans the whole folder (`@import "tailwindcss" source("../")`), including class names written inside
`main.js`. Keep class names as whole strings there so they are found.

To publish, upload the folder to any static host: Netlify Drop, Cloudflare Pages, GitHub Pages, Vercel or plain
web hosting. No server code is needed. Set the absolute `og:image` URL and connect the inquiry form first.

## Troubleshooting

- **Fonts look like the system default.** The pages load Google Fonts, which needs an internet connection. Check
  that a content blocker isn't stopping `fonts.googleapis.com`.
- **New Tailwind classes have no effect.** Rebuild the CSS with `npm run build`. Classes assembled from pieces in
  JavaScript (`"bg-" + color`) are not detected; write them in full.
- **Dates look a day off.** Everything uses `America/Los_Angeles`. To move the business to another time zone,
  change `TIME_ZONE` in `main.js`, then update the copy that says "PT" and `holidaysFor()` if your holidays differ.
- **A playbook doesn't appear.** Check its `segment` and `motion` match keys in `SEGMENTS` and `MOTIONS`, and that
  the `id` is unique. Errors in `data.js` stop every list from rendering; open the browser console.
- **The shortlist or quote doesn't persist between visits.** The browser is blocking localStorage (private
  browsing, or the page is in a sandboxed frame). It still works within the visit.
- **The calculator chooses a different plan from mine.** A plan you chose is shown unless the volume is above its
  `max`; then the lowest-priced eligible plan is used. Raise `max` in `PLANS` if needed.
- **Demo times show as booked.** That comes from `slotTaken()`, a placeholder for real availability. Return
  `false` from it to offer every slot.

## License

MIT. The code and all included artwork are free for personal and commercial use under [LICENSE.txt](LICENSE.txt).
Funnel Display, Funnel Sans and Spline Sans Mono are served by Google Fonts under the SIL Open Font License.
Latchline, its people, customers, contact details and figures are fictional.
