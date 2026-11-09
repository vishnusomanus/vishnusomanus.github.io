# Guardmere documentation

## Overview

Guardmere is an HTML and Tailwind CSS v4 website for a fictional independent cybersecurity practice in Huntsville, Alabama. Version 1.0.3 includes nine pages, twelve illustrated assessment areas, a scope calculator, saved readiness evidence notes and a consultation request form. See the [template page](https://freeframe.dev/templates/guardmere) for the live preview.

## Quick start

The compiled website needs no build step. Open `index.html`, or serve the folder with a local static server.

```sh
python3 -m http.server 8080
```

Visit `http://localhost:8080`. Serving over HTTP gives browser storage a consistent origin.

Google Fonts require internet access. All illustrations, CSS and JavaScript are local.

Node 24 and npm are needed only when rebuilding CSS. Install dependencies in this folder, rather than in its parent.

```sh
npm install
npm run build
```

No account, API key, database or external JavaScript library is required.

## Pages

| File                | Purpose               | Notable content                                                                                 |
| ------------------- | --------------------- | ----------------------------------------------------------------------------------------------- |
| `index.html`        | Practice introduction | Illustrated report, three services, process tabs, next consultation date                       |
| `services.html`     | Service catalog     | Twelve records, category/search filters, detail dialogs, saved scope additions                  |
| `assessment.html`   | Assessment planning   | Organization inputs, selected controls, itemized estimate, save and remove controls             |
| `readiness.html`    | Evidence preparation  | Twelve questions, category/state/search filters, notes, completion progress, reset confirmation |
| `case-studies.html` | Engagement accounts   | Six anonymous accounts, sector/search filters, accessible detail dialogs                        |
| `resources.html`    | Security field notes  | Twelve articles, topic/search filters, expandable practical steps                               |
| `company.html`      | People and approach   | Three illustrated specialists, working principles, visiting information                         |
| `contact.html`      | Conversation request  | Validation, optional business-day call preference, saved scope summary, success reference        |
| `404.html`          | Missing-page recovery | Links to services, planning and the practice                                                    |

The engagement accounts describe fictional work. They do not claim guaranteed protection or certification.

## Project structure

```text
.
├── index.html                 Practice introduction
├── services.html              Searchable service catalog
├── assessment.html            Assessment calculator
├── readiness.html             Evidence checklist
├── case-studies.html          Engagement accounts
├── resources.html             Field notes
├── company.html               Practice and team
├── contact.html               Conversation request
├── 404.html                   Missing-page recovery
├── assets/
│   ├── css/style.css          Compiled, minified stylesheet
│   ├── js/main.js             Data, validation and interactions
│   └── img/                   Original SVG illustrations and social artwork
├── src/input.css              Tailwind import, brand tokens and repeated components
├── package.json               CSS build and watch commands
├── template.json              Catalog metadata and version
├── README.md                  Short getting-started guide
├── DOCS.md                    This guide
├── CHANGELOG.md               Version history
└── LICENSE.txt                Included in the download
```

There is no client-side router. Relative links work when the folder is published beneath a subdirectory.

## Customizing

### Brand and colors

Edit `@theme` in `src/input.css`, then rebuild `assets/css/style.css`.

| Token             | Default   | Use                                  |
| ----------------- | --------- | ------------------------------------ |
| `--color-paper`   | `#f6f3ed` | Page background                      |
| `--color-card`    | `#fffcf8` | Form and card surfaces               |
| `--color-wash`    | `#ece5dc` | Quiet inset surfaces                 |
| `--color-ink`     | `#2d2625` | Body text and dark footer            |
| `--color-muted`   | `#625851` | Secondary text                       |
| `--color-oxblood` | `#601e2d` | Primary action and security diagrams |
| `--color-rose`    | `#ead5d5` | Selection and diagram highlights     |
| `--color-rule`    | `#cfc3b7` | Dividers and borders                 |

For example:

```css
@theme {
  --color-oxblood: #5a2739;
}
```

Also update the theme-color meta tags, `template.json` accent and SVG colors when changing the palette. Check text, buttons, focus indicators and hover states for contrast.

### Typography

Headings use Bitter at weights 400 and 600. Body text uses Overpass at weights 400, 600 and 700. Each HTML head loads both through a Google Fonts CSS2 link with `display=swap`, plus preconnects for the two Google font hosts.

`--font-display` and `--font-sans` in `src/input.css` select the families. Update the Google Fonts link in all nine pages when replacing them. The SVG social image uses the same family names and needs rerendering after a font change.

No font files are bundled. Georgia and Arial are the respective fallbacks.

### Content

Static introductions, navigation, contact details and footer text live in the HTML files. Structured content lives in `assets/js/main.js`:

| Constant     | Content                                                                   |
| ------------ | ------------------------------------------------------------------------- |
| `SERVICES`   | Twelve assessment areas, categories, base days, evidence and next actions |
| `CASES`      | Six engagement accounts, sectors, working steps and outcomes              |
| `RESOURCES`  | Twelve field notes, steps and cautions                                    |
| `TEAM`       | Three names, roles, portraits and professional focus                      |
| `CATEGORIES` | Labels for systems, operations and people                                 |
| `SIZE_BANDS` | Organization labels and effort multipliers                                |
| `TIMINGS`    | Timing labels                                                             |

A service uses this shape:

```js
{
  id: 'identity',
  name: 'Identity & access',
  category: 'systems',
  days: 1.5,
  strap: 'Who can reach what, and why.',
  intro: 'Review privileged access, onboarding and offboarding, and authentication across the systems that matter.',
  deliverables: ['Access map and account ownership', 'Privileged account review', 'Practical authentication priorities'],
  evidence: ['An up-to-date user list', 'A list of administrators', 'Onboarding and offboarding procedures'],
  question: 'Can you explain who has privileged access and when it was last reviewed?',
  next: 'Start with account ownership and remove access no longer required.'
}
```

Use a unique, lowercase identifier and one of the existing categories. Add a matching `assets/img/ID.svg` illustration. Services feed the catalog, calculator and readiness checklist, so review all three after an addition. The checklist progress denominator comes from `SERVICES.length`.

`SERVICE_MAP` and `CASE_MAP` are derived from these records. Identifier lookups use an own-property check rather than trusting URL or storage values.

### Images and artwork

Every service has a distinct 600 × 420 SVG drawing (`ID.svg`), used on its service card. Each inner page has its own hero drawing (`hero-services.svg`, `hero-assessment.svg`, `hero-readiness.svg`, `hero-case-studies.svg`, `hero-resources.svg`, `hero-contact.svg`, `hero-404.svg`), each case study has its own `case-ID.svg`, and each field note has a small 160 × 160 `note-ID.svg`; add a matching file when you add a case or note. Retain the 10:7 ratio for 600 × 420 replacements. Portraits are 280 × 220 (displayed at 560 × 440). `report.svg` is the home hero, and `practice.svg` illustrates the office. No drawing contains text, so nothing falls back to a system font; labels belong in the HTML.

All drawings are included locally. Decorative images use empty alternative text; the three portraits describe the person depicted. Replace portrait alt text when changing people.

`assets/img/favicon.svg` is the small shield mark. `og-image.svg` is the 1200 × 630 editable social source; `og-image.png` is the raster sharing image. Update both when changing the brand. The downloadable catalog thumbnail is managed outside this folder.

### Navigation, header and footer

The header and footer repeat in every HTML file. Update all copies together. Desktop navigation appears from 1280px; the smaller layout uses an expandable menu with Escape support.

Keep `aria-current="page"` on the current page only. Resource and contact links are also available in the footer. Preserve `mobile-menu` and its button's `aria-controls` relationship.

The practice address is Eustis Avenue SE, Suite 4, Huntsville, AL 35801. Hours are Monday–Thursday 9 a.m.–5 p.m. and Friday 9 a.m.–3 p.m., Central time. Telephone and email are fictional and must be replaced before launch.

## Features

### Service search and scope additions

`setupServices()` filters the `SERVICES` array by category and case-insensitive text. Search covers names, descriptions and deliverables. Counts and empty states update immediately.

`serviceCard()` creates the catalog cards. The service details open in a native dialog, with deliverables and evidence to gather. Escape, Close and an outside click dismiss the dialog; focus returns to the opener.

`toggleScope()` reads the saved plan, adds a known service once (or removes it if it is already in scope), saves it and rereads it through the storage adapter. Every "Include in scope" button for that service (card and dialog) gets `aria-pressed` from the saved selection, and the count and live notification show the actual saved selection. Default assessment areas count as selected before the first explicit save.

### Assessment estimate

`setupAssessment()` reads organization inputs and selected areas without replacing active native inputs. `estimate()` calculates the fee from the catalog.

| Setting                             | Behavior                                    |
| ----------------------------------- | -------------------------------------------- |
| `DAY_RATE_PENCE`                    | 180000 cents, or $1,800 per consultant day   |
| `SIZE_BANDS.small.multiplier`       | 1 for up to 50 people                        |
| `SIZE_BANDS.growing.multiplier`     | 1.35 for 51–150 people                       |
| `SIZE_BANDS.distributed.multiplier` | 1.7 for 151–500 people                       |
| Coordination                        | 0.5 day when any area is selected            |
| Locations                           | 1–5; each additional location adds 0.25 day  |
| Cloud workloads                     | 0–12; each adds 0.25 day                     |
| Rounding                            | Effort rounds up to the next quarter day     |
| `PRIORITY_MULTIPLIER`               | 1.15, applied to fees for priority timing    |

Base service days are summed, multiplied for team size, and then increased by coordination and complexity. Priority timing remains subject to availability. Fees exclude any sales tax and are a planning guide rather than a binding quote.

The initial identity, email and recovery scope has 3.5 base days. With two cloud workloads and one location, it totals 4.5 days and $8,100 excluding any sales tax.

An empty selection produces zero days and $0. The recommendation asks for at least one area. Otherwise, it recommends missing identity, email and recovery foundations before describing the next sequence. Multiple locations add local-contact advice, four or more cloud workloads add ownership mapping, larger teams add stakeholder workshops, and priority timing asks for evidence availability. These are planning priorities rather than a measured security score.

Below the large breakpoint the estimate panel sits after all twelve areas, so a compact bar (`data-assessment-sticky`) sticks to the bottom of the screen while the form is in view. It repeats the total, the number of areas and the consultant days, updates on every change and links to the full breakdown (`#estimate`). It is hidden from `lg` up, where the panel sits beside the form.

Save this scope commits the current inputs. Start a fresh scope restores defaults without silently overwriting a saved scope. Remove saved scope deletes the saved record and keeps the current estimate visible.

The optional `assessment.html?service=identity` parameter adds a valid service to the current form. Unknown identifiers, including inherited property names, are ignored. It does not save until the visitor chooses Save.

### Readiness evidence

`setupReadiness()` presents one question and three evidence prompts per service. Visitors can mark evidence ready and save a non-sensitive note of up to 240 characters.

Progress uses all twelve areas, even when a filter hides some. Search covers names, questions and evidence prompts. Category and state filters combine with the query.

A checkbox change saves state and updates progress. In a filtered state view, a changed row leaves the results when appropriate and focus moves to the state filter. Notes save as typed and do not rebuild their own textarea.

Reset checklist opens a confirmation panel. Cancellation preserves data; confirmation clears checkmarks and notes and returns focus to the reset button. Evidence readiness is a preparation aid, not a security score or certification.

### Engagement accounts

`setupCases()` combines sector and text filters and shows each engagement's own `case-ID.svg`. Search covers the title, problem and evidence. Detail dialogs describe the starting point, working steps, evidence and the next action.

Accounts use anonymous sectors rather than invented client endorsements or logos. Keep outcomes specific and avoid promising that the same work will guarantee protection elsewhere.

### Field notes

`setupResources()` filters twelve `RESOURCES` by topic and text. Search includes practical steps. Native `details` and `summary` elements provide keyboard-operable expansion without a separate JavaScript accordion.

Each article contains a caution as well as steps. These notes are general guidance, not a substitute for authorization, legal advice or a scoped technical review.

### Process tabs and menu

`setupNavigation()` controls the home-page process tabs. Arrow keys move between tabs, and Home and End select the first or last tab. Each tab owns a labeled panel and maintains one keyboard tab stop.

The mobile menu updates `aria-expanded`, closes with Escape and returns focus to the trigger. Growing to the desktop breakpoint closes it. Navigation uses ordinary links.

### Consultation calendar

`consultationDates()` offers the next ten eligible business days, starting tomorrow. It derives today through `londonToday()` (the function keeps its original name) in `America/Chicago`, avoiding the visitor's local time zone for business-day selection.

Weekends are excluded. `bankHolidays()` (also keeping its original name) calculates the US federal holidays for any year: New Year's Day, Martin Luther King Jr. Day, Washington's Birthday, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving and Christmas Day.

A fixed-date holiday that falls on a Saturday is observed on the Friday before, and one on a Sunday on the Monday after. That means New Year's Day can close December 31 of the year before.

`EXTRA_CLOSURES` accepts additional `YYYY-MM-DD` strings for exceptional closures. Update it for one-off national or practice closures. Regular holidays roll automatically; extraordinary future holidays cannot be inferred.

`CONSULTATIONS_ENABLED` is the calendar off-switch. Set it to `false` to hide and disable the optional call preference and show the general contact message on the home page.

`CONSULTATION_DAYS` controls how many dates are listed. The search stops after 370 scanned days, so an extensively closed calendar cannot loop indefinitely. Keep `CONSULTATIONS_ENABLED` false while dates should be unavailable.

Call times are 9:30 a.m., 11:00 a.m. and 2:00 p.m. Central time, within the published opening hours. These are preferences, not live availability or a confirmed appointment. The success text explicitly says availability will be confirmed in the reply.

The home-page next consultation date uses the same function. The copyright year also follows the Huntsville date. There are no fixed future appointment dates to maintain.

## Forms

The catalog, readiness, case and resource filter forms operate locally and prevent normal submission. The assessment form calculates locally; its explicit buttons save or reset the scope.

The contact form validates a 2–100 character name, an email address up to 200 characters, a 20–2,000 character message and, when requested, an eligible call date. Organization is optional. Inline errors, an alert summary and focus on the first invalid field support correction.

The optional `contact.html?topic=assessment` parameter preselects assessment, readiness, review or conversation. Unknown values are ignored. A saved assessment summary appears above the form when available.

The standalone form is front-end only: it makes no network request and delivers no inquiry until connected to a backend. Its success view generates a local `GM-` reference, displays next steps and provides a new-inquiry button. It never claims that an email was sent. Personal contact details are not written to browser storage.

### Connect a submission endpoint

In the submit listener inside `setupContact()`, replace the documented standalone success branch with a request to your endpoint. Keep validation before the request and reveal success only after the endpoint accepts it.

For a form service endpoint, the request can use:

```js
const response = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
  method: "POST",
  body: new FormData(form),
  headers: { Accept: "application/json" },
});
if (!response.ok) {
  $("[data-form-errors]").textContent = "We could not accept your request. Please try again.";
  $("[data-form-errors]").hidden = false;
  return;
}
```

Add an `action` and `method="post"` to the form if your endpoint also supports a non-JavaScript fallback. Use the reference returned by your server instead of the generated local reference. Disable the submit button while awaiting the result and restore it on failure. Include network error handling, rate limiting, privacy information and server-side validation appropriate to your business.

Recheck date availability on the server before confirming an appointment. Never treat the selected preference as a reservation. Do not put credentials or private API keys in this JavaScript file.

## Saved data (localStorage)

All state goes through `safeStorage`, which mirrors writes in memory. If browser storage throws, same-page save, read, remove and progress operations still work. Memory-only data ends when the page is closed or reloaded.

| Key                       | Shape                                                      | Reset                                 |
| ------------------------- | ---------------------------------------------------------- | ------------------------------------- |
| `guardmere.assessment.v1` | Object with size, locations, cloud, timing and service IDs | Remove saved scope on assessment page |
| `guardmere.readiness.v1`  | Object with done IDs and per-ID notes                      | Reset checklist, then confirm         |

An assessment record is:

```json
{
  "size": "small",
  "locations": 1,
  "cloud": 2,
  "timing": "standard",
  "services": ["identity", "email", "recovery"]
}
```

A readiness record is:

```json
{
  "done": ["identity"],
  "notes": { "identity": "Operations lead holds the current access register." }
}
```

`readJSON()` removes malformed JSON or invalid top-level shapes. `normalisePlan()` accepts only known bands, timing values and own service IDs, deduplicates selections and clamps integer ranges. Numeric fields accept strings or numbers only; nested objects, arrays, booleans and null use safe defaults without invoking coercion methods. `normaliseReadiness()` accepts only known IDs, removes duplicates and limits cleaned notes to 240 characters. Unknown fields are dropped and normalized records are written back.

Saved values are escaped before insertion into generated HTML. Contact names, addresses, messages and call preferences are never persisted. Do not use readiness notes for confidential evidence, passwords or personal data.

Changing the storage keys starts a new namespace. If changing service IDs, plan a migration or explain that old IDs are discarded. Browser tools can also remove these two keys without affecting unrelated websites.

## SEO and sharing

Each HTML head has a unique title and description, Open Graph text, the site name, locale and a social-image path. Replace the fictional business information consistently.

For production, change every `og:image` to the absolute published URL of `assets/img/og-image.png`. Add a canonical URL for each page after the final domain is known. The default source deliberately avoids guessing a production domain.

Publish a sitemap listing the eight main pages and a robots file suited to the site. Configure the host to use `404.html` for missing routes. No structured data or analytics is included; add only accurate business information and respect your privacy requirements.

## Accessibility

The pages include a skip link, main landmark, one primary heading, visible keyboard focus, labeled controls and descriptive page titles. Decorative art is hidden from assistive technology with empty alternative text.

Native dialogs manage modal focus; Close and Escape restore the opener. Both dialogs have valid initial heading references even before opening. Tabs maintain the selected state, panel references and keyboard movement.

Live regions announce counts, estimate totals and saved actions. Contact errors identify the field and focus the first invalid control. Reset confirmations preserve a useful focus destination.

The page respects reduced-motion preferences. Reveal content remains visible if IntersectionObserver is unavailable. The reveal observer also marks elements above intersecting content, and a passive scroll listener covers fast End-key and anchor jumps that skip an intersection transition. Keep labels associated when adding fields, maintain heading order and check contrast after recoloring artwork or text.

## Building and deploying

Edit HTML and JavaScript directly. Rebuild CSS after changing utility classes or `src/input.css`.

```sh
npm install
npm run build
```

During styling work:

```sh
npm run watch
```

Tailwind scans this template through `source("../")`. Compiled CSS is committed and can be served as-is. Do not upload `node_modules`.

Upload the HTML files and `assets` folder together to a static host such as GitHub Pages, Netlify or Cloudflare Pages. Source CSS and documentation may also be retained, but are not required at runtime.

Connect the inquiry endpoint, replace fictional business details, update social URLs and test keyboard navigation, form errors, call preferences and saved-data resets on the published origin. Storage is origin-specific, so local saved plans do not transfer to the live domain.

## Troubleshooting

| Problem                                        | Check and fix                                                                                                                                                  |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fonts look different                           | Confirm access to the Google Fonts hosts and that both CSS2 family names match the theme tokens. Fallback fonts work offline.                                  |
| New classes have no effect                     | Rebuild CSS with `npm run build`; the browser reads `assets/css/style.css`, not the source file.                                                               |
| Saved state vanishes after reload              | The browser may block localStorage. The memory fallback preserves same-page behavior but cannot survive reloads. Serve over HTTP and review privacy settings. |
| Old service IDs disappear                      | Normalization intentionally discards IDs absent from `SERVICES`. Migrate records before renaming catalog IDs.                                                |
| A call date is missing                         | Weekends, calculated federal holidays and `EXTRA_CLOSURES` are excluded. The list begins tomorrow in Central time.                                                    |
| A request shows success but no inquiry arrives | The front-end needs a real submission endpoint. Connect it in `setupContact()` and wait for `response.ok` before showing success.                              |
| A social image does not update                 | Regenerate the PNG from the edited SVG and use an absolute production `og:image` URL. Sharing services may cache earlier images.                               |
| Mobile navigation stays open after edits       | Preserve the menu ID, toggle data attribute and deferred `main.js` script. Check the browser console for earlier JavaScript errors.                            |

## License

MIT. See `LICENSE.txt` in the download for the template license.

The original illustrations and icons are included.

Bitter and Overpass are supplied through Google Fonts under the SIL Open Font License.

All business details, people and engagement accounts are fictional. Replace them before publishing a real business website.
