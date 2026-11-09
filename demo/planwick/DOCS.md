# Planwick documentation

## Overview

Planwick is a spacious product-planning website for a fictional SaaS business in Chapel Hill, North Carolina, in a deep indigo, periwinkle and marigold palette. Version 1.0.2 uses static HTML, Tailwind CSS v4 and plain browser JavaScript. Its workspace combines a roadmap, transparent priority inputs and capacity-based release planning. The [template page](https://freeframe.dev/templates/planwick) links to the live preview.

## Quick start

The compiled stylesheet is included. No build is needed to explore the pages.

1. Extract the download into a folder.
2. Serve that folder with a local static server.
3. Open the local address and choose `index.html`.
4. Visit Workspace to change initiative stages and release scope.
5. Read Forms before collecting any customer information.

For example, with Python installed:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`. Use an HTTP server for consistent storage and browser behavior.

Node 24 and npm are needed only when rebuilding the stylesheet.

```sh
npm install
npm run build
```

## Pages

| File                | Purpose              | Notable features                                                          |
| ------------------- | -------------------- | ------------------------------------------------------------------------- |
| `index.html`        | Introduction         | Roadmap product mock, customers, numbers, score card, quotes |
| `product.html`      | Product explanation  | Product tabs, six features, a customer quote, security and six FAQs |
| `workspace.html`    | Interactive planning | Sixteen initiatives, filters, editable scores, release scope and capacity |
| `use-cases.html`    | Team approaches      | Six team views, a saved release starting point and three customer stories |
| `pricing.html`      | Plans and calculator | Seat count, billing cycle, add-ons and contact handoff                    |
| `integrations.html` | Connection planning  | Twelve connections, access notes, saved rollout and data-access promises |
| `resources.html`    | Planning library     | Eight searchable, expandable practical guides                             |
| `contact.html`      | Business inquiries   | Validation, optional conversation date, reference and success state       |
| `404.html`          | Recovery page        | Links back to the product, workspace and library                          |

The contact page introduces the three team members and gives business hours.
All nine pages have their own title, description and one main heading.

## Project structure

```text
planwick/
  index.html             Main introduction
  product.html           Product tabs and principles
  workspace.html         Roadmap and release planning
  use-cases.html         Team-specific starting points
  pricing.html           Plan calculator
  integrations.html      Connection rollout checklist
  resources.html         Searchable planning guides
  contact.html           Inquiry form and team information
  404.html               Recovery page
  assets/
    css/style.css        Compiled, minified Tailwind stylesheet
    js/data.js           Business catalog and calculation inputs
    js/main.js           Browser interactions and validation
    img/                 Original SVG artwork, favicon and sharing image
  src/input.css          Tailwind import, theme and reusable components
  template.json          Catalog metadata and page list
  package.json           Stylesheet build and watch commands
  README.md              Short introduction and local start
  CHANGELOG.md           Release history
  DOCS.md                This guide
```

## Customizing

### Brand and colors

The `@theme` block in [src/input.css](src/input.css) owns the palette.

| Token            | Use                                         |
| ---------------- | ------------------------------------------- |
| `--color-ink` | Main text, buttons and dark sections        |
| `--color-muted`  | Supporting copy                             |
| `--color-mist`   | Soft product backgrounds                    |
| `--color-paper`  | Main page background                        |
| `--color-sun`   | Highlights and dark-section calls to action |
| `--color-rose`  | Secondary illustration accents              |
| `--color-line`   | Borders and dividers                        |
| `--color-error`  | Form errors                                 |

Change the ink color and rebuild:

```css
@theme {
  --color-ink: #1c2752;
}
```

The repeated components are `.wrap`, `.btn`, `.btn-outline`, `.btn-sun`, `.nav-link`, `.eyebrow`, `.field`, `.label`, `.error`, `.text-link`, `.pill` and `.reveal`.
Most layout and spacing comes from utility classes in HTML and generated markup.
Check foreground contrast whenever changing the palette.

### Typography

Darker Grotesque is the display face at weight 700.
Hind Vadodara is the body face at weights 400, 500, 600 and 700.
Every HTML head has Google Fonts CSS links and both font-host preconnects.
The links use `display=swap`; system fallbacks remain available.
There are no bundled font files.

Change the Google Fonts link in every page and update `--font-display` or `--font-sans` in `src/input.css`.
Keep only the weights your replacement design uses.
Rebuild the stylesheet and check headings at narrow widths.

### Content

Page introductions, shared navigation, footer, FAQs and contact labels live in HTML.
[assets/js/data.js](assets/js/data.js) exposes `window.PLANWICK_DATA`.

| Property       | Content                                                  |
| -------------- | -------------------------------------------------------- |
| `initiatives`  | Sixteen roadmap records with evidence and scoring inputs |
| `integrations` | Twelve connection records, permissions and setup checks  |
| `usecases`     | Six team approaches with scope identifiers and capacity  |
| `resources`    | Eight guides with steps and takeaways                    |
| `team`         | Three people, roles and descriptions                     |
| `plans`        | Start, Team and Scale seat rates and features            |
| `product`      | Three product-tab panels                                 |

Initiative records include these real fields:

```js
{
  id: 'unified-search',
  title: 'Unified search',
  team: 'product',
  stage: 'now',
  reach: 320,
  impact: 3,
  confidence: 85,
  effort: 5,
  summary: 'Bring projects, decisions and files into one searchable view.',
  evidence: 'Support conversations repeatedly mention switching between three places to find one answer.',
  owner: 'Alton Bynum'
}
```

To add a record, give it a unique stable identifier and all these fields.
Supported teams are `product`, `engineering` and `operations`.
Supported stages are `now`, `next` and `later`.
Update the filter options when adding a team or stage.
Update `sanitiseWorkspace` and stage render logic when changing the stage vocabulary.
Update use-case scope lists if removing an initiative they reference.

### Images and artwork

The artwork is original SVG, designed for this template.
The twelve connection images each use a different composition.
Each page hero has its own illustration: `rhythm.svg` (product), `roadmap.svg` (workspace), `team.svg` (use cases),
`seats.svg` (pricing), `hub.svg` (integrations), `library.svg` (resources), `notebook.svg` (contact) and
`detour.svg` (404). `alignment.svg`, `priority.svg` and `capacity.svg` illustrate the three product steps on the home
page and the product tabs.
Illustration canvases are 540 × 400; preserve the aspect ratio when replacing them.
The illustrations contain no SVG text, so they look the same whatever fonts a visitor has. Put any labels in HTML.

The home page hero is a product mock built in HTML, not an image: a three-column roadmap with seven initiatives,
their owners' initials, priority scores and the default release (6 initiatives, 23 effort points at 8 a week, so
weeks of 8, 8 and 7 points). Its numbers are written in `index.html` and match the defaults in `data.js`; update
both together if you change those initiatives. The score card in the dark home section works the same way
(Unified search: 320 × 3 × 85% ÷ 5 = 163.2).
All decorative images use empty alternative text because adjacent copy explains them.
Give informative replacements a meaningful alternative description.

`assets/img/og-image.svg` is the 1200 × 630 sharing source.
`assets/img/og-image.png` is its raster version.
Update both when changing the business identity.
`assets/img/favicon.svg` contains the small P symbol.

### Customers, numbers and security claims

The customer wordmarks, the four numbers on the home page, the quotes and the three customer stories on the use-cases
page, and the security and trust section on the product page (US hosting, encryption, single sign-on, backups,
privacy and security paperwork) are written for the fictional business. Replace every one of them with your own
facts, and only claim certifications and hosting arrangements you actually have.

### Navigation, header and footer

The header, mobile menu and footer are repeated in every HTML file.
Update them consistently when adding a page.
Set `aria-current="page"` on its matching navigation entry.
The main menu switches to the mobile version below 1024 pixels.
Keep `menu-toggle` and `mobile-menu` IDs and their ARIA relationship intact.
The footer year is filled from the current America/New_York calendar date.
Replace the fictional address, telephone, email and business statement before launch.

## Features

### Shared navigation and motion

`closeMenu` controls the mobile menu and restores focus after Escape.
The menu button updates its expanded state and accessible name.
Crossing into desktop width closes the mobile menu.
An intersection observer reveals `.reveal` elements once as they enter the viewport.
It also reveals earlier elements after an anchor jump or fast End scroll, so content above remains visible.
People requesting reduced motion see these elements immediately.

### Product tabs

`setupProduct` creates all three panel IDs before activating the tab controls.
The panels use `tabpanel`, their visible tab labels and a focusable content region.
Arrow keys move between tabs; Home and End choose the first or last.
Only the active tab participates in the normal tab sequence.
The URL fragments `#align`, `#prioritise` and `#commit` choose an initial panel.
Unknown fragments leave the first panel active.
Choosing a tab replaces the fragment (without adding a history entry), so a reload or a shared link opens the same
panel. A `hashchange` listener switches panels when a link such as `product.html#commit` is followed while the
product page is already open.

### Roadmap filters and stages

`setupWorkspace` renders all sixteen initiatives into Now, Next and Later columns.
Search includes the title, summary, owner and evidence.
Team and stage filters combine with search and update the result count.
Filters are transient and do not change stored planning data.
Stage selectors save the selected stage immediately.
The board restores focus to the changed control after rendering.
The reset button restores original inputs, stages, capacity and release scope.

### Priority inputs

The Edit score button opens the native `score-dialog` dialog.
`previewScore` updates the visible preview as inputs change.
The calculation in `score` is reach × impact × confidence / 100 / effort.
Reach is 1–10,000; impact is 0.5, 1, 2 or 3; confidence is 10–100%; effort is 1–40.
The form checks these field limits before saving.
The close control and Escape leave values unchanged.
After closing, focus returns to the corresponding Edit score button.
Order by priority score saves descending score order within each stage.
Equal scores use the identifier as a stable tiebreaker.

### Release scope and capacity

Each initiative can be included in or removed from release scope.
The release list sorts selected initiatives by score.
`renderPlan` accumulates their effort and divides by weekly capacity.
Capacity is an integer from 1 to 40 points per week.
The final week for an initiative is `ceil(cumulative effort / capacity)`.
The displayed completion date is Friday of that planning week.
This is a capacity calculation, not a live delivery forecast.
Changing the capacity does not replace the active number input.
Removing a release row moves focus to the nearest remaining Remove button.
The Clear release scope button keeps initiative scores and stages.

`KEEP_RELEASES_CURRENT` defaults to `true` in `main.js`.
`releaseStart` then chooses the next strictly future Monday from America/New_York today.
If today is Monday it chooses the following Monday.
Date arithmetic uses UTC noon to avoid daylight-saving boundary drift.
Set `KEEP_RELEASES_CURRENT` to `false` to use `FIXED_RELEASE_START`, currently `2026-10-26`.
The home page's next-cycle label uses the same start date.

### Team starting points

`setupUsecases` renders six approach buttons and one detailed approach.
Each shows practices, review cadence, initiative scope and proposed capacity.
Use this release starting point replaces only saved scope and capacity.
Existing stages, priority inputs and sort setting remain available.
A visible status reports the selected initiative count and capacity.
The workspace link opens the saved plan.

### Pricing calculator

`setupPricing` reads catalog rates from `PLANWICK_DATA.plans`.
The monthly seat rates in cents are Start 800, Team 1500 and Scale 2900.
The accepted seat count is 2–200 whole people.
Annual billing reduces the seat component by 20%.
The Insights pack adds 4000 cents per monthly equivalent.
Extended archive adds 2000 cents per monthly equivalent.
Add-ons receive no additional annual discount.
The annual invoice is twelve times the monthly equivalent.
Prices exclude sales tax, and no payment is collected.

`plan`, `seats` and `billing` query parameters can initialize this page.
Plans must be own properties of the catalog; unknown plans are ignored.
Seat values are clamped; billing must be `monthly` or `annual`.
Calculated contact links pass these three validated values to `contact.html`.
The reset control returns to Team, ten seats, monthly, with no add-ons.
All changes update the adjacent calculation without replacing the number input.

### Connections and rollout

`setupIntegrations` filters twelve connection types by phrase and category.
Show only connections in my rollout combines with both filters.
Connection cards expose access descriptions and a first setup check.
Adding a card saves its identifier to an ordered rollout checklist.
This is a planning checklist; it does not connect an account or request credentials.
The `connection` query parameter chooses an initial exact-title search for a valid ID.
Unknown IDs, including inherited object property names, are ignored.
Removing a row restores focus to its nearest remaining peer.
Clear rollout choices empties only the connection checklist.

### Resource library

`setupResources` searches titles, summaries, guide steps and takeaways.
The topic filter combines with the phrase search.
Each native details control exposes three practical steps and a takeaway.
Read-time labels are editorial estimates, not timers.
Search and expanded details are not saved between visits.

## Forms

### Inquiry form

`setupContact` handles `contact-form` in `contact.html`.
It requires a name, valid email, organization, a message of at least twelve trimmed characters and consent to reply.
Errors are associated with their inputs and marked with `aria-invalid`.
A summary reports the number of fields requiring attention and focus moves to the first.
The topic and team-size selectors capture the purpose and scale of the request.
The optional preferred date appears only for product walkthroughs.

`conversationDays` provides the next six Tuesday or Thursday dates after today, labeled with the weekday
(for example "Tuesday, October 27, 2026"). When a walkthrough is requested with a specific day, the success panel
repeats it: "We’ll suggest a walkthrough time on Tuesday, October 27, 2026, in Eastern time."
It uses America/New_York for the current day and UTC noon for date arithmetic.
The business closes on US federal holidays (`federalHolidays`, worked out by rule for any year) and from December 24
through January 3, inclusive.
`KEEP_CONVERSATIONS_CURRENT` defaults to `true`.
Set it to `false` to calculate from `FIXED_CONVERSATION_START`, currently `2026-10-20`.
This gives a reproducible preview; it does not represent calendar availability.
The team agrees on an exact time after discussing the request.

Valid `plan`, `seats` and `billing` parameters prefill a pricing inquiry.
No raw URL value is inserted into HTML.
The success panel includes a generated `PW-` reference and the next step.
Ask another question restores the form and focuses the name field.
No personal field is placed in localStorage.

The included form is a front-end presentation: it does not transmit an inquiry, send email or reserve a meeting.
Before launch, connect a real service and display the success panel only after its successful response.
The submission handler contains the integration comment immediately before reference generation.
Replace that section with your request, preserving the validation and focus behavior.

For example, create a Formspree endpoint and replace the success block with an async request:

```js
const response = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
  method: "POST",
  body: new FormData(form),
  headers: { Accept: "application/json" },
});
if (!response.ok) {
  const summary = document.querySelector("#form-error-summary");
  summary.hidden = false;
  summary.textContent = "We could not receive your request. Please try again.";
  return;
}
```

Make the existing submit listener `async`, disable its submit button while waiting and use `try/catch` for network failures.
Use the backend's reference in the success panel rather than the browser-generated reference.
Only hide the form and show success after `response.ok` is true.
Configure consent retention and a privacy notice appropriate to your business.

### Planning and filter forms

The workspace score form edits saved planning inputs and validates numeric limits.
Workspace, connection and resource filter forms operate locally and suppress navigation on Enter.
The pricing form recalculates local catalog amounts and does not process payment.
These forms need no backend unless you want shared accounts or synchronized data.

## Saved data (localStorage)

The workspace, pricing calculator and connection rollout remember a visitor's choices in this browser. The pages
don't mention it; if your site needs a cookie or storage notice, add it to your own privacy page. The rollout list
is a planning checklist only: it doesn't connect accounts or ask for credentials.

All persistence goes through `safeStorage` in `main.js`.
Its in-memory map is updated before attempting localStorage writes.
If storage is blocked, the current page retains read-after-write behavior.
A reload or another page cannot retain that fallback memory.
Malformed JSON is replaced with a sanitized default.
All stored catalog identifiers require own-key membership.

| Key                        | Shape                                       | Reset            |
| -------------------------- | ------------------------------------------- | ---------------- |
| `planwick.workspace.v1`    | `{items, scope, capacity, sorted}`          | Reset roadmap    |
| `planwick.pricing.v1`      | `{plan, seats, billing, insights, archive}` | Reset pricing choices |
| `planwick.integrations.v1` | Array of unique connection IDs              | Clear rollout choices |

`sanitiseWorkspace` retains every catalog initiative and accepts only known overrides.
It rejects unknown or duplicate IDs and invalid stage names.
Numeric inputs reject non-scalar shapes and are bounded to their documented limits.
Reach, effort and capacity are rounded to whole values; confidence uses five-point increments.
The scope array accepts only unique known initiative IDs.
An explicitly empty scope remains empty after reload.
`sorted` accepts only the Boolean `true`.

`sanitisePricing` validates plan membership and billing vocabulary.
It clamps and rounds seats and accepts add-ons only as strict Booleans.
Prices are always calculated from the catalog rather than saved amounts.
Connection state accepts only a unique array of known IDs.

To remove all saved choices in the browser console:

```js
localStorage.removeItem("planwick.workspace.v1");
localStorage.removeItem("planwick.pricing.v1");
localStorage.removeItem("planwick.integrations.v1");
location.reload();
```

These keys contain planning preferences, not personal inquiry details.
Change the key version if you deliberately introduce an incompatible schema.

## SEO and sharing

Every HTML head contains a unique title and description.
Open Graph text matches that page's purpose; the shared image is `assets/img/og-image.png`.
Before launch, replace each `og:image` value with the absolute HTTPS image URL on your domain.
Add canonical URLs when the final production routes are known.
There is no structured data, sitemap or robots file included.
Create a sitemap listing your public pages and configure the host's real 404 response.
Do not include private account pages in a public sitemap if adding authentication later.

## Accessibility

The pages include a skip link, landmarks, one main heading and visible focus styling.
All fields have visible labels; errors retain their input associations.
The mobile menu supports Escape and reports its expanded state.
Product tabs support the expected arrow, Home and End keys.
The native score dialog contains focus and returns it to the opener.
Result counts and planning changes use live status messages.
Removal controls preserve a useful focus location after rerendering.
Decorative SVG images do not repeat nearby text to screen readers.
Reduced-motion preferences disable reveals and movement.

Keep a single `h1` per page when editing.
Give new controls visible labels and maintain full visible text in accessible names.
Do not use color alone to explain a planning stage or selected item.
Recheck at 390-pixel and 1280-pixel widths after altering content.
Long labels and new navigation entries can affect the responsive header.

## Building and deploying

The stylesheet input imports Tailwind and scans this template folder.
Documentation and JSON are excluded from content scanning.
Generated class strings in `main.js` are included in the scan.
Rebuild after changing classes in either HTML or JavaScript.

```sh
npm install
npm run build
npm run watch
```

`build` writes `assets/css/style.css`; `watch` recompiles while editing.
The shipped stylesheet is already compiled and minified.
Upload the full folder to a static host such as GitHub Pages, Cloudflare Pages or Netlify.
Keep relative file paths and the `assets` directory together.
Configure `404.html` as the host's not-found response where supported.
Serve over HTTPS in production and connect the inquiry backend before collecting requests.
No application server, database, account system or payment service is included.

## Troubleshooting

| Problem                                            | Fix                                                                                             |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| New utility classes have no effect                 | Rebuild CSS after editing HTML or JavaScript strings.                                           |
| Font appearance differs                            | Check access to Google Fonts and both preconnect links; system fonts are the fallback.          |
| Planning choices disappear                         | Check private-browsing or storage restrictions; the fallback survives only on the current page. |
| An old initiative reappears after reset            | Reset intentionally restores all current catalog records and defaults.                        |
| A URL selects no connection                        | Use an exact known connection ID such as `issues`; unknown IDs are ignored.                     |
| An annual total seems different                    | The 20% reduction applies to seats; add-ons keep their monthly equivalent.                      |
| The inquiry success appears but nobody receives it | Connect a backend; the included handler presents the local success state only.                  |
| Dates remain fixed                                 | Set both current-date flags to `true` and check the browser clock.                              |

## License

MIT, as in the repository's license (included as `LICENSE.txt` in the download). Free for personal and commercial
use. All artwork (logo, illustrations, customer wordmarks and social image) is original SVG and covered by the same
license.
Darker Grotesque and Hind Vadodara are available through Google Fonts under the SIL Open Font License.
The included inline icons and illustrations are original artwork.
All business details, team identities and planning records are fictional.
