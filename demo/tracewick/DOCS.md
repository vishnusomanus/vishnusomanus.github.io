# Tracewick documentation

## Overview

Tracewick is a fictional observability company in Cary, North Carolina. This HTML5, Tailwind CSS v4 and dependency-free JavaScript template is version 1.0.2. Its nine pages combine a midnight telemetry aesthetic with a useful service explorer, local request queries, pricing calculations and searchable engineering guides. Visit [the template page](https://freeframe.dev/templates/tracewick) for the live preview.

## Quick start

Open `index.html` in a browser or serve this folder with any static HTTP server.
The compiled stylesheet and browser JavaScript are included.
You do not need Node to view the pages.
The selected fonts require access to Google Fonts; system sans-serif fallbacks remain available.

For a local HTTP preview, from this folder run:

```sh
python3 -m http.server 8080
```

Visit `http://localhost:8080`.
Use Node 24 if you want to rebuild Tailwind CSS.
No API keys, database, external JavaScript packages or build step are required to use the compiled site.

## Pages

| File            | Purpose                   | Main sections and features                                                              |
| --------------- | ------------------------- | --------------------------------------------------------------------------------------- |
| `index.html`    | Product introduction      | Waterfall hero, service signals, workflow and engineering invitation                    |
| `platform.html` | Platform capabilities     | Service-map artwork, six capabilities and adoption stages                               |
| `console.html`  | Engineering workspace     | Fourteen services, search, group filters, sorting, watchlist, budgets and trace queries |
| `pricing.html`  | Usage pricing             | Three plans, ingestion, seats, retention, annual billing and saved estimate             |
| `docs.html`     | Engineering documentation | Sixteen searchable guides, topic filter and copyable snippets                           |
| `status.html`   | Reliability agreement     | Current status, 90-day uptime, incident history, maintenance, commitments and updates   |
| `company.html`  | Company and team          | Cary working room, three people, operating principles and career invitation          |
| `contact.html`  | Engineering inquiry       | Topic selector, validation, request reference and next steps                            |
| `404.html`      | Missing route             | Route illustration and links back to useful destinations                                |

## Project structure

```text
tracewick/
├── index.html              Product landing page
├── platform.html           Capability and adoption page
├── console.html            Interactive engineering workspace
├── pricing.html            Usage calculator
├── docs.html               Searchable guide library
├── status.html             Planned maintenance and update form
├── company.html            Company story and team
├── contact.html            Engineering request form
├── 404.html                Missing-route page
├── assets/
│   ├── css/style.css       Compiled Tailwind output
│   ├── js/main.js          All data and browser features
│   └── img/                Original SVG diagrams, portraits and social artwork
├── src/input.css           Tailwind import, theme and shared components
├── package.json            CSS build commands
├── template.json           Catalog metadata and page list
├── README.md               Short introduction
├── DOCS.md                 This guide
├── CHANGELOG.md            Version history
└── LICENSE.txt             Template license
```

## Customizing

### Brand and colors

The `@theme` block in `src/input.css` owns the design tokens.
Rebuild the stylesheet after changing tokens or utility classes.

| Token           | Use                                  |
| --------------- | ------------------------------------ |
| `--color-ink`   | Main midnight background             |
| `--color-deep`  | Footer and input background          |
| `--color-panel` | Raised telemetry panels              |
| `--color-line`  | Borders and grid lines               |
| `--color-ice`   | Primary text                         |
| `--color-muted` | Supporting text                      |
| `--color-cyan`  | Actions, focus and signal highlights |
| `--color-amber` | Budget attention state               |
| `--color-rose`  | Errors and exceeded budgets          |

For example, change the accent inside the existing theme block:

```css
--color-cyan: #6ce9e0;
```

Keep foreground contrast readable after changing colors.
The small shared classes include `.wrap`, `.eyebrow`, `.btn`, `.field`, `.label`, `.metric` and `.signal-grid`.
Most page layout is expressed directly as Tailwind utility classes in HTML and generated markup.
There is one dark design; no theme toggle or theme preference is stored.

### Typography

Rajdhani is the display face and Golos Text is the body face.
Every HTML head has Google Fonts preconnects and a CSS2 stylesheet link with `display=swap`.
The `--font-display` and `--font-sans` tokens select those families.
Weights 400, 500, 600 and 700 are requested.
To change families, update the Google Fonts link in all nine pages and both CSS tokens.
Update SVG artwork labels when changing the display face.
No font binaries or local `@font-face` rules are shipped.

### Content

Page-specific prose lives in its HTML file.
Shared data and generated interfaces live in `assets/js/main.js`.
The script is an immediately invoked function; constants are deliberately private.

| Constant       | Content                                                |
| -------------- | ------------------------------------------------------ |
| `SERVICES`     | Fourteen service workloads and diagram IDs             |
| `GUIDES`       | Sixteen guide summaries, bodies and snippets           |
| `GROUPS`       | Service filter labels                                  |
| `SORTS`        | Valid explorer sort options                            |
| `DOC_TOPICS`   | Guide topic labels                                     |
| `TOPICS`       | Contact topics                                         |
| `PLANS`        | Three usage plans and included allowances              |
| `CAPABILITIES` | Platform capability cards                              |
| `TEAM`         | Company people and portrait filenames                  |
| `MAINTENANCE`  | Planned work, component, day offset, hour and duration |
| `COMMITMENTS`  | Reliability agreement cards                            |

Each service contains `id`, `name`, `group`, `owner`, `route`, `requests`, `latency`, `errors`, `slo`, `summary` and `role`.
Use a unique lowercase `id` and an existing group.
`errors` and `slo` are percentages, `latency` is milliseconds and `requests` is a count.
The corresponding image must exist at `assets/img/<id>.svg`.
For example, the first service's editable measurements are:

```js
requests: 820000,
latency: 112,
errors: 0.14,
slo: 99.9,
```

When adding a service, add a complete object to `SERVICES` and create its diagram.
The map, explorer, selector and reference trace records derive from that array.
Update the fixed service count in the console hero and any prose that mentions fourteen services.
For a new guide, copy an existing `GUIDES` object and change its unique `id`, `topic`, `title`, `summary`, `body` and `code`.
Keep guide topics within `DOC_TOPICS` or extend that map and the topic selector together.
The supplied workload is illustrative reference data; it does not poll production systems.

### Images and artwork

All illustrations are original SVGs in `assets/img/`.
Fourteen service diagrams use 260 × 240 view boxes.
The platform hero (`context-relay.svg`), service map, team portraits and Cary room drawing (`retford-room.svg`) have distinct compositions.
The home-page waterfall is HTML, not an image, so its labels use the page font; edit the rows in `index.html`.
SVGs shown through `<img>` carry no text (it would render in a fallback font); labels such as the service-map
caption are HTML beside the image.
Keep SVG view boxes when replacing artwork so layouts retain their intended ratio.
Use appropriate `alt` text for informative artwork; diagrams repeated next to equivalent text use empty alternatives.
The favicon is `favicon.svg`.
The social image source is `og-image.svg`, with a 1200 × 630 PNG at `og-image.png`.
Export a replacement PNG at the same dimensions after editing the source.

### Navigation, header and footer

Header and footer markup is repeated in every HTML file.
Update desktop navigation, mobile navigation and footer links together.
Move `aria-current="page"` to the matching link for each destination.
The mobile trigger controls `#mobile-menu`; keep its ID unique on each page.
Contact details appear in the footer and contact page.
Replace the fictional phone, address, email, people and company details before launch.
The copyright year is inserted by `initStaticData()` using `America/New_York`.

## Features

### Service explorer

`initConsole()` reads `SERVICES`, `GROUPS` and `SORTS`.
Search matches service name, owner, route and summary.
Group filtering, watchlist-only filtering and sorting combine in one result set.
Available sorts are request count, latency, errors and name.
`data-console-count` announces results and the empty state explains how to recover.
Reset filters restores the starting view and returns focus to search.
The initial URL accepts `search`, `group` and `service`.
Known group and service IDs are checked with `safeParam()` using own-property lookup.
A valid `service` opens its detail dialog on load.
Unknown IDs fall back safely.
The query string is only read initially; filter changes do not rewrite the URL.
Text search updates on input; other filters update on change so leaving search does not replace a clicked result.

### Service details

`openService()` renders a service diagram, trend, workload measures and current alert budget.
The native modal dialog is labeled by its service heading.
Close, Escape and the backdrop dismiss it.
Closing returns focus to the invoking detail button when it still exists.
The budget action closes the dialog and focuses the relevant service selector.
`budgetState()` compares reference measures with the chosen limits.
The trend lines come from `serviceSeries()`: 24 hourly p95 values derived from each service's latency, error rate,
group (`PEAK_HOUR`) and a seed from its ID, so every service has its own shape. `sparkline()` draws the card line and
`serviceChart()` draws the dialog's p95 chart (with the alert-budget line) and hourly error bars.
The service dialog is centered with `fixed inset-0 m-auto` because Tailwind's preflight removes the native dialog margin.

### Watchlist

`initWatchlist()`, `toggleWatch()` and `renderWatchlist()` manage saved services.
Buttons expose their state through `aria-pressed` and an accessible name containing the visible label.
Add or remove a service from a card, remove a row, or clear the whole list.
The list is available on the same page even when browser storage is blocked.
Removal moves focus to a remaining remove button or the clear control.
Changing the watchlist immediately updates watchlist-only results.

### Alert budgets

`initBudget()` saves latency and error limits per service.
Latency must be a whole number from 10 to 10000 milliseconds.
Errors must be from 0.1 to 20 percent, rounded to one decimal place.
The defaults in `DEFAULT_BUDGET` are 250 milliseconds and 1 percent.
A service exceeds its budget if either reference measurement is above its limit.
Reset budget removes that service's override and restores the default.
The status message and all affected cards update after a save.
These thresholds are local planning settings; they do not create real monitoring alerts.

### Trace workbench

`TRACES` contains 84 deterministic reference requests derived from the service catalog.
`parseQuery()` supports space-separated conditions:

| Condition          | Meaning                                  |
| ------------------ | ---------------------------------------- |
| `service:checkout` | A known service ID                       |
| `duration>200`     | Duration strictly above 200 milliseconds |
| `duration<500`     | Duration strictly below 500 milliseconds |
| `outcome:error`    | Error outcome                            |
| `outcome:ok`       | Successful outcome                       |

All conditions must match.
Unknown tokens produce an explanation instead of executing arbitrary expressions.
`initQuery()` calculates the matching count and p95 using `percentile()`.
The table shows the first 24 matching requests; the status explains larger result sets.
No query or result is sent over the network or stored.

### Trace dialog

Every trace ID in the workbench (and in a service dialog's recent traces) opens the `data-trace-dialog` waterfall;
clicking anywhere else on a workbench row does too. `buildTrace()` expands a `TRACES` row into spans across the
services it calls (`CALLS`, `STEPS`), deterministic for each trace ID. Each span shows its service, start and
duration as a bar on a shared time axis. On an error trace the failed span (with `ERROR_TYPES`) is marked in rose
and later calls are cut short; otherwise the slowest span is marked in amber. The panel beside the waterfall lists
the selected span's attributes (`spanAttributes()`): service, version, span and parent IDs, timing, status, route
and owner.

Spans are buttons in a list: Arrow Up/Down, Home and End move between them, Enter or a click selects one, and the
attributes panel announces the change. The dialog opens with the highlighted span focused. Escape, Close trace and
the backdrop close it and focus returns to the trace link that opened it.
Change the factors used to construct `TRACES` if you need a different reference distribution.

### Usage estimate

`initPricing()`, `cleanEstimate()` and `priceFor()` own the calculator.
The estimate combines plan base, ingestion overage, extra seats and retention beyond the plan allowance.

| Setting                  | Value                                          |
| ------------------------ | ---------------------------------------------- |
| `EXTRA_SEAT_PRICE`       | $8 per extra seat monthly                      |
| `RETENTION_GB_DAY_PRICE` | $0.015 per ingested GB per extra retention day |
| `ANNUAL_DISCOUNT`        | 0.10, applied to the complete monthly subtotal |
| `RETENTION_DAYS`         | 7, 14, 30 or 90                                |
| Ingestion range          | 1–5000 GB per month                            |
| Seat range               | 1–250                                          |

`PLANS` holds base prices and included ingestion, seats and retention.
The Team starting workload is 120 GB, 6 seats, 14 days and monthly billing.
Its monthly total is $88.20; annual billing shows $79.38 monthly equivalent and $952.56 annually.
Prices are estimates excluding sales tax.
Saving writes only the selected workload; resetting clears that saved estimate.
The save status reads the stored selection back, including the in-memory fallback.
Changing numbers updates the result without replacing the edited input element.

### Engineering guides

`initGuides()` filters `GUIDES` by search and topic.
`search` and a validated `guide` ID may be supplied in the initial URL.
The selected article includes a real configuration or command snippet.
The guide list scrolls within a 620-pixel panel so the selected article remains easy to reach.
Copy uses the Clipboard API and falls back to a selected text area when needed.
The status announces copy success or the available manual copy field.
Guide selection moves focus to the article heading.
An empty result has clear recovery instructions.
Check snippets against your actual collector, API and deployment before publishing.

### Current status, uptime and incidents

`initStatus()` renders the status summary, five components (`STATUS_COMPONENTS`) with 90 daily uptime bars, and the
incident history (`INCIDENTS`). The current status rule: every component is operational unless a planned window in
`MAINTENANCE` is running now in Cary, on Eastern time (the query index rotation shows "Degraded performance", other windows
"Under maintenance"), or you list a live issue in `CURRENT_ISSUES`, for example
`{ component: "query", level: "degraded", note: "Long-range queries are slower than usual." }`.

Past incidents are dated relative to today (`daysAgo`, Eastern time) while `KEEP_INCIDENTS_RELATIVE = true`, so the history
and the bars never look old; for a real site set it to `false` and give each incident a fixed `date` (`YYYY-MM-DD`).
Each day's bar takes its color from the incidents on that day: degraded time counts as half downtime and planned
maintenance inside its published window does not count. Bars are buttons; selecting one shows that day's detail.

### Planned maintenance

`initMaintenance()` renders three planned windows and filters by ingestion, query or console.
This is a planning calendar, with no live health probe or incident feed.
`TIME_ZONE` is `America/New_York`.
`londonToday()` gets the current calendar date in that zone.
With `KEEP_MAINTENANCE_CURRENT = true`, `maintenanceAnchor()` chooses the next Wednesday at least seven days ahead.
The first window uses that date; the other windows use offsets of seven and fourteen days in `MAINTENANCE`.
Full day, month and year labels prevent ambiguous upcoming dates.
Window hours are local Eastern wall-clock labels on a 12-hour clock (`clockLabel()`), including daylight saving time when applicable.
Incident `start` and `steps` times are display text in the same style.
To freeze a published schedule, set `KEEP_MAINTENANCE_CURRENT = false` and update `FIXED_MAINTENANCE_ANCHOR`.
The shipped fixed anchor is `2026-10-28`.
Review frozen schedules manually after their final window passes.

### Navigation and motion

`initMenu()` toggles the mobile navigation and its expanded state.
Escape closes it and returns focus to the trigger.
Following a menu link also closes the menu.
`initReveals()` uses Intersection Observer for restrained entrance transitions.
Reduced-motion users see content immediately.
Content stays visible if Intersection Observer is unavailable.

## Forms

### Engineering request

`initContact()` handles `data-contact-form` on `contact.html`.
It validates a name of at least two characters, a complete email address, a team name of at least two characters, at least fifteen characters of context and permission to reply.
`topic` is initialized from the URL only when it matches `TOPICS`.
Field errors are associated with inputs and the first invalid input receives focus.
The form hides on success and the focused panel contains an engineering request reference beginning `TW`, the topic by its label, a one-business-day reply and what happens next.
Submitted names are escaped before being inserted into the success panel.

### Maintenance preferences

`initUpdates()` handles `data-updates-form` on `status.html`.
It requires a valid email and at least one component from ingestion, query, console, alert delivery and exports.
The components error is linked to the fieldset with `aria-describedby`.
The form hides on success; the panel includes a `TU` reference, the selected components by name and the updates to expect.
No confirmation email is claimed.
Neither form stores personal details in localStorage.
The shipped handlers validate and display local front-end success only; they do not transmit a request or create a subscription until you connect a backend.

### Connect a backend

Both handlers contain a comment directly before their success branches.
Replace the comment with your real endpoint integration and make each submit callback `async`.
For example, add your form service's endpoint as the contact form's `action` and insert this before `const target` in `initContact()`:

```js
const response = await fetch(form.action, {
  method: "POST",
  body: new FormData(form),
  headers: { Accept: "application/json" },
});
if (!response.ok) {
  announce("We could not receive your request. Please try again.");
  return;
}
```

Set the form action to the endpoint supplied by your provider, such as a Formspree form URL.
Catch network errors, show an inline error and preserve the user's fields.
Disable the submit button while the request is pending, then restore it on failure.
Only display the existing business success branch after a successful `response.ok`.
Apply the same approach to `initUpdates()` with your subscription endpoint.
Validate all values again on the server, add spam controls, set your retention policy and provide a privacy notice.
Never put private service tokens in browser code.
The console filter, trace query, documentation search, budget and estimate forms are local tools and need no form-service endpoint.

## Saved data (localStorage)

All persistence passes through `safeStorage`.
It catches unavailable storage and keeps an in-memory map for the current page view.
Read-after-write continues working in that mode; state does not survive navigation or reload.
`readJSON()` removes malformed JSON.
`readWatchlist()`, `readBudgets()` and `readEstimate()` normalize shapes before use.

| Key                     | Shape                                                            | Validation                                                                  |
| ----------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------- |
| `tracewick.watch.v1`    | Array of service IDs                                             | Known own-map IDs only, unique, maximum catalog length                    |
| `tracewick.budgets.v1`  | Object keyed by service ID                                       | Known IDs, object values, latency/error limits clamped to supported ranges  |
| `tracewick.estimate.v1` | Object with `plan`, `ingestion`, `seats`, `retention`, `billing` | Known plan, bounded numbers, supported retention and monthly/annual billing |

Example watchlist value:

```json
["checkout", "gateway"]
```

Example budget override:

```json
{ "checkout": { "latency": 400, "errors": 1.5 } }
```

Use Clear watchlist, Reset budget and Reset estimate to remove settings through the interface.
To reset every preference manually in your browser console:

```js
localStorage.removeItem("tracewick.watch.v1");
localStorage.removeItem("tracewick.budgets.v1");
localStorage.removeItem("tracewick.estimate.v1");
location.reload();
```

No contact names, company details, messages, email addresses or update recipients are saved.
Unknown URL IDs such as inherited object property names are rejected.
The versioned keys let a later application introduce an explicit migration.

## SEO and sharing

Every page head has its own title, description, Open Graph fields and Twitter card.
Replace the fictional brand in each head when rebranding.
The current relative `og:image` is convenient for local preview.
Before launch, set it to your absolute image URL, for example `https://your-domain.example/assets/img/og-image.png`.
Add canonical URLs, a sitemap and robots rules appropriate to your public host.
There is no fabricated review, organization rating or structured-data claim in this template.
Configure your host to serve `404.html` as its missing-route page.

## Accessibility

Every page provides one main heading, a skip link, landmarks and visible keyboard focus.
Inputs have visible labels and validation messages.
Result counts, toast feedback and saved-state messages use live statuses.
The service detail uses a native dialog, a named heading and focus restoration.
The mobile menu exposes `aria-controls` and `aria-expanded`.
Watch buttons have pressed states, and remove actions preserve a usable focus destination.
The design supports reduced motion and small viewports.
Keep heading levels sequential when inserting new sections.
Do not remove label text, duplicate IDs or put the only explanation in a placeholder.
Keep equivalent text beside decorative diagrams.
Check contrast again whenever colors or image backgrounds change.

## Building and deploying

From this template folder, install the CSS build dependencies with Node 24:

```sh
npm install
npm run build
```

For continuous rebuilds while editing:

```sh
npm run watch
```

`src/input.css` scopes Tailwind scanning to this template using `source("../")`.
The build writes the minified `assets/css/style.css`; do not edit that output directly.
Upload the complete folder to a static host such as Netlify, GitHub Pages or Cloudflare Pages.
Keep the relative directory layout intact, including images and JavaScript.
No server rendering or JavaScript bundler is needed.
Connect and test the two business form endpoints before accepting real inquiries.
Review contact details, pricing, service claims, privacy terms and future maintenance dates before launch.

## Troubleshooting

| Problem                                     | Fix                                                                                                   |
| ------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| Font looks different                        | Allow Google Fonts and check both CSS2 and font requests; the system fallback remains usable offline. |
| A new utility has no effect                 | Rebuild `assets/css/style.css` from `src/input.css`.                                                  |
| Saved preferences disappear                 | Storage may be blocked; the in-memory fallback lasts only for the current page view.                  |
| A service does not appear                   | Check its group, current filters, unique ID and required data fields.                                 |
| A trace query is rejected                   | Use only documented tokens with a known service ID and numeric duration.                              |
| Clipboard copy fails                        | Use HTTPS or localhost and allow clipboard access; the fallback depends on browser support.           |
| Maintenance remains on an old date          | Enable `KEEP_MAINTENANCE_CURRENT` or update the fixed anchor and planned offsets.                     |
| A form shows success but no request arrives | Connect its handler to a real endpoint and wait for `response.ok` before showing success.             |

## License

MIT. The code and included artwork may be used for personal and commercial projects under `LICENSE.txt`.

Rajdhani and Golos Text are provided through Google Fonts under the SIL Open Font License.
The inline icons and SVG illustrations are included original artwork.
All company details, people, workloads and operating information are fictional.
