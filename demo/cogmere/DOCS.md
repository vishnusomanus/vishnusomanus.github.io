# Cogmere documentation

## Overview

Cogmere 1.0.3 is a complete HTML and Tailwind CSS v4 website for a fictional bicycle repair workshop in Chico, California. Its cobalt repair drawings, illustrated workshop scenes and clear workshop tickets suit an independent mechanic who wants to explain the work before asking for a booking. Ten pages include a searchable repair board, a multi-job estimate, a rolling drop-off booking and a saved pre-ride checklist. The [template page](https://freeframe.dev/templates/cogmere) links to the live demo.

## Quick start

1. Unzip the download into a new folder.
2. Open `index.html` in a modern browser.
3. Follow the repair board to an individual service, build an estimate and try the drop-off booking.
4. Read this guide before publishing contact details or connecting a form.

The compiled stylesheet and all illustrations are included; the two typefaces load from Google Fonts. Viewing the site does not require Node, an account, a database or a build step.

For a local HTTP preview, serve this folder with a static server. For example, if Python is installed:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080/index.html`. An HTTP preview is useful for clipboard permissions and for testing any backend you add.

To rebuild styles, use Node 24 and install the two development dependencies:

```sh
npm install
npm run build
```

Do not publish `node_modules`. No JavaScript bundler is used.

## Pages

| File            | Purpose                       | Notable sections and features                                                             |
| --------------- | ----------------------------- | ----------------------------------------------------------------------------------------- |
| `index.html`    | Introduce the workshop        | Bicycle illustration, next drop-off day, featured repairs, work standard and links        |
| `services.html` | Find a repair                 | All 16 repairs, symptom search, category buttons, labor-price and bench-time sorting     |
| `service.html`  | Explain one repair            | `?repair=` selection, three work steps, suitability, labor, parts allowance and mechanic |
| `estimate.html` | Build a repair plan           | `?repair=` preselection, quantities, bike complexity, parts grade, overlap advice, copy   |
| `book.html`     | Book a drop-off               | Ten rolling opening days, mechanic choice, time buttons, validation and a booked state    |
| `workshop.html` | Meet the people               | Three mechanic profiles, individual specialties and workshop standards                    |
| `journal.html`  | Explain bicycle care          | Eight searchable notes with category selection and expandable practical guidance          |
| `prep.html`     | Check before a ride           | Ride length, wet-weather additions, saved checks, progress and reset                       |
| `visit.html`    | Find and contact the workshop | Map, hours, next drop-off day, access notes and a question form with a success state      |
| `404.html`      | Recover from a missing page   | Links back to the home page, repair board and drop-off calendar                           |

`service.html` always renders one heading in the browser. An unknown or inherited `repair` value falls back to the safety check. Its `noscript` content gives a route back to the repair board.

## Project structure

```text
cogmere/
  index.html                 Home page
  services.html              Searchable repair board
  service.html               Selected repair detail
  estimate.html              Repair estimator
  book.html                  Drop-off request
  workshop.html              Mechanics and standards
  journal.html               Searchable care notes
  prep.html                  Saved pre-ride checks
  visit.html                 Directions, hours and question form
  404.html                   Missing-page recovery
  assets/
    css/style.css            Compiled Tailwind stylesheet
    img/                     Repair drawings, page illustrations, ride-note art, portraits, favicon and social image
    js/main.js               Data, validation and all page interactions
  src/input.css              Tailwind import, brand tokens and repeated components
  package.json               CSS build and watch commands
  README.md                  Short introduction and quick start
  DOCS.md                    This guide
  CHANGELOG.md               Template version history
  LICENSE.txt                License supplied in the download
```

`template.json` is gallery metadata in the source repository. It is omitted from the downloadable archive.

## Customizing

### Brand and colors

Open `src/input.css`. The `@theme` block defines the shared palette and typefaces:

| Token            | Default     | Use                                               |
| ---------------- | ----------- | ------------------------------------------------- |
| `--color-ink`    | `#101828`   | Text, rules, dark sections and primary buttons    |
| `--color-blue`   | `#1747d1`   | Cobalt artwork, accents, links and focus outlines |
| `--color-acid`   | `#e8f65b`   | Small highlights and selected summary surfaces    |
| `--color-mist`   | `#edf1ff`   | Pale artwork and section backgrounds              |
| `--color-paper`  | `#fbfcff`   | Main page background                              |
| `--color-line`   | `#c6cddc`   | Fine card borders and dividers                    |
| `--color-muted`  | `#48566d`   | Secondary text                                    |
| `--font-display` | Chivo       | Headings and the wordmark                         |
| `--font-sans`    | Spline Sans | Body text and controls                            |

For example:

```css
@theme {
  --color-blue: #1d45a8;
}
```

Rebuild the CSS after changing tokens. SVG files contain their own color values, so update those separately. Check text contrast, including buttons and focus outlines, whenever you change colors.

Most layout styling is Tailwind utilities in HTML and generated strings in `main.js`. The small component layer covers repeated buttons, labels, inputs, cards and reveal behavior.

### Typography

Chivo (headings and the wordmark) and Spline Sans (body text and controls) load from Google Fonts. Every page's `<head>` has the same three tags: two `preconnect` hints and one stylesheet link that requests only the weights the design uses:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Chivo:wght@500;600;700;900&amp;family=Spline+Sans:wght@400..700&amp;display=swap"
/>
```

`display=swap` shows text in the fallback stack (`ui-sans-serif, system-ui, sans-serif`, set in the `@theme` tokens) until the fonts arrive.

To swap a family, change the link on every page, update `--font-display` or `--font-sans` in `src/input.css` and rebuild the CSS. Also change the families in `og-image.svg` and regenerate the PNG (see [Images and artwork](#images-and-artwork)).

### Content

Static headings, addresses, navigation and explanatory sections live in the HTML files. Shared interactive content lives at the top of `assets/js/main.js`:

| Constant             | Content                                                                                         |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| `SERVICES`           | The 16 repairs: ID, name, category, prices, minutes, mechanic, search keywords, copy and artwork |
| `TEAM`               | Three mechanics, biographies, specialties, portraits and approaches                             |
| `GUIDES`             | Eight ride notes: title, category, introduction, three practical points, a safety note and art  |
| `CHECKS`             | Checklist IDs, labels, explanations, applicable ride kinds and wet-only flags                   |
| `BIKE_TYPES`         | Bike labels and labor-complexity rates                                                         |
| `PARTS_GRADES`       | Parts labels and allowance multipliers                                                          |
| `SERVICE_CATEGORIES` | Filter button order                                                                             |
| `GUIDE_CATEGORIES`   | Journal category labels                                                                         |
| `RIDE_TYPES`         | Ride labels and contextual sidebar advice                                                       |
| `CONTACT_TOPICS`     | Question subjects and the "what happens next" line shown after sending                          |
| `DROP_OFF_TIMES`     | Drop-off time labels in local workshop time                                                     |

All service money values are integer cents. `money()` formats them with `en-US` and USD. Prices exclude sales tax, and the estimate and booking say so. Minutes describe approximate bench time, not a guaranteed completion or collection time.

A repair has this shape; add it to `SERVICES` and provide the named drawing:

```js
{
  id: "chain",
  name: "Chain replacement",
  category: "Drivetrain",
  labour: 2000,
  parts: 3500,
  minutes: 25,
  mechanic: "bertram",
  keywords: "chain stretch worn skipping slipping noise squeak rusty jumping",
  short: "Measured, matched and cut to the right length.",
  suitable: "A chain at its wear limit, before it damages more expensive parts.",
  steps: ["Measure wear.", "Install a compatible chain.", "Test under load."],
  note: "A worn cassette may need replacement too.",
  art: "chain.svg"
}
```

Add `perBike: true` to a whole-bike package (the safety check, everyday tune-up, full teardown & rebuild and contact point setup use it): it can be added once, and the estimate shows "One per bike" instead of a quantity box. A `parts` value of `0` shows "parts to confirm" on cards, the detail page and the estimate. `keywords` holds the words people use for the symptom ("flat", "squeal", "creak"); search reads them along with the name, copy, steps and note.

IDs must be unique, short lowercase slugs. The `mechanic` must match an ID in `TEAM`. Add a new category to `SERVICE_CATEGORIES` if needed. `SERVICE_MAP`, `TEAM_MAP` and `CHECK_MAP` are derived automatically.

The homepage chooses four repairs in the final initialization block: `service`, `puncture`, `rim` and `gears`. Change that list to choose different featured cards.

### Images and artwork

All artwork was drawn for this design. Each repair has its own 240 × 250 component SVG (named in `SERVICES`). `bicycle.svg` is the 640 × 520 home illustration and `workbench.svg` the 640 × 400 workshop drawing. Each inner page has its own 560 × 420 hero scene: `tool-wall.svg` (repairs), `job-ticket.svg` (estimate), `handover-desk.svg` (booking), `bench-notebook.svg` (ride notes), `prep-stand.svg` (checklist), `yard-map.svg` (visit) and `wrong-turn.svg` (404). The eight ride notes use 320 × 200 scenes named `note-*.svg` in `GUIDES`. `mechanic-1.svg` to `mechanic-3.svg` are the portraits. None of the illustrations contain text, so they render the same everywhere.

To use photographs, keep the existing dimensions or aspect ratios and write useful alternative text. Decorative images have an empty `alt`; do not describe the same image twice beside a heading.

`favicon.svg` is the cobalt square with the acid-yellow C from the header logo. `og-image.svg` is the editable 1200 × 630 social artwork, and `og-image.png` is the sharing image. Regenerate the PNG after changing its source in a browser or renderer that loads Chivo and Spline Sans, for example by opening the SVG in Chrome with the fonts installed and taking a 1200 × 630 screenshot.

### Navigation, header and footer

The header and footer are repeated in all ten HTML files. Update every copy when changing the workshop name, navigation, hours, address, email or telephone number.

The desktop and mobile menus have separate markup. Mark the appropriate link with `aria-current="page"` and keep the `mobile-menu` ID paired with the menu button's `aria-controls`.

The footer year is filled in the browser using `TIME_ZONE`. Change all fictional contact details before launching a real business. Use the same information in the HTML, meta descriptions and sharing artwork.

## Features

### Repair board and detail pages

`initServiceBoard()` combines a case-insensitive symptom search with one category and a sort order. `render()` inside that function rebuilds the cards and announces the count. `searchWords()` splits the query into words and `matchesAll()` keeps a repair only when every word appears in its name, category, `keywords`, short explanation, suitability, steps or note (a trailing plural "s" is ignored, so "brakes rubbing" finds the brake jobs). On phones the board shows two compact cards per row.

`serviceCard()` is shared by the home page and repair board. An add button calls `addJob()`; a detail link opens `service.html?repair=<id>`.

`initServiceDetail()` validates the `repair` parameter with an own-key check before looking up `SERVICE_MAP`. The default is `check`. It updates the document title and renders the work steps, ticket and assigned mechanic. Change the actual repair text in `SERVICES`, rather than in a second copy of the page.

### Multi-job estimates

`cleanPlan()`, `readPlan()` and `writePlan()` keep the saved plan valid. `planTotals()` calculates:

- Labor: each catalog labor price multiplied by quantity.
- Complexity: the combined labor multiplied by the selected bike rate, rounded to the nearest cent.
- Parts: each catalog allowance multiplied by the selected parts multiplier, rounded per job, then multiplied by quantity.
- Total: labor plus complexity plus parts.

The standard bike rate is 0%; cargo is 20%; e-bike mechanical work is 15%. Parts multipliers are 1 for everyday, 1.4 for the longer-wearing allowance and 0 for labor-only estimates. Quantities are clamped to whole numbers from 1 to 4, or to 1 for `perBike` packages.

For example, a safety check and an inner tube replacement on a standard bike with everyday parts total $50: $40 labor and $10 parts. Choosing cargo adds $8 complexity, for $58. These remain allowances subject to inspection.

`renderEstimate()` also shows overlap notes when packages include the routine adjustments selected separately. It does not silently discount or remove a job: the mechanic resolves overlap in the final quote.

`estimate.html?repair=<id>` preselects that repair in the "Add a repair" list (an unknown ID is ignored). It doesn't add anything until the visitor presses Add repair.

`planText()` produces the text for Copy estimate. `navigator.clipboard` may require HTTP and permission; if copying is blocked, the page shows one labeled, selected textarea (reused on later clicks and kept up to date as the plan changes) so the visitor can copy manually.

Removing a line returns focus to the next remove button or the repair selector. Clearing a plan returns focus to the selector. Every change updates the totals and live status.

### Rolling drop-off calendar

`TIME_ZONE` is `America/Los_Angeles`. `todayKey()` derives the workshop's current calendar day, regardless of the visitor's time zone. `openingDates()` then finds the next ten opening days, starting tomorrow. It skips Sundays, Mondays, US federal holidays and `EXTRA_CLOSURES`.

`bankHolidays(year)` calculates the US federal holidays by rule: New Year's Day, Martin Luther King Jr. Day, Presidents' Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving Day and Christmas Day. A date-fixed holiday closes on the day itself and on the weekday it's observed (Friday for a Saturday, Monday for a Sunday), including December 31 when the next New Year's Day is a Saturday. Exceptional closures are not inferred: add a one-off date to `EXTRA_CLOSURES` when needed.

`FIXED_OPENING_DATES` defaults to `null`, so no hard-coded booking year goes stale. For a real calendar with a fixed schedule, replace it with an array of future `YYYY-MM-DD` keys. Invalid, past and closed-day entries are filtered out. Duplicate dates are removed and the result is sorted. Dates are requests, not live availability; connect your actual booking system before treating them as reservations.

`DROP_OFF_TIMES` has six 20-minute conversation starts. Choosing a particular mechanic omits that mechanic's bench-handoff window; choosing the first suitable mechanic shows all starts. This is a simple presentation rule, not a stock or reservations system.

The optional `book.html?repair=<id>` parameter preselects the repair's mechanic and names the repair in the booking when no repair plan is saved. It does not add a job to the saved plan.

To change opening days, edit `isOpeningDay()`, the printed hours in every HTML file and the visit page. To change the number of days, update the limit in `openingDates()` and the explanatory text in `book.html`.

### Ride notes

`initGuides()` filters `GUIDES` by selected category and a search across the whole note: title, category, introduction, practical points and the safety note (so "wet weather" and "bulge" both find notes). `readingMinutes()` works out the reading time from the note's own words at about 200 words a minute. The result count is live. Each note uses native `details` and `summary` elements for keyboard-operable expansion. Search and expanded notes are not saved.

The notes are general care guidance. Keep the advice to stop riding when a brake, steering part, wheel or tire may be unsafe. Do not turn them into a guarantee of safety.

### Saved pre-ride checks

`visibleChecks()` includes checks matching the selected ride kind and adds wet-only items when the weather is wet. The everyday dry list has six checks; the loaded wet list has thirteen.

`renderChecklist()` creates labeled checkboxes and `updateChecklistProgress()` updates the visible checked count and the `role="progressbar"` meter (`data-check-meter`, filled by `data-check-bar`). Changing the ride or weather retains existing valid checks; only relevant checks count toward progress. The reset action clears all checks while keeping the selected ride settings.

A previous check mark is not a new inspection. The page explains this and provides a prominent fresh-check action. Change check text and applicability in `CHECKS`; update sidebar tips in `RIDE_TYPES`.

### Navigation and motion

`initNavigation()` controls the mobile menu, moves focus to its first link when opened, closes it on Escape with focus returned to the button, and closes it when the visitor clicks outside or reaches desktop width.

`initReveals()` observes home sections. When an element enters view, it also reveals earlier elements so fast scrolling cannot leave hidden content behind. Reduced-motion visitors see everything immediately. Without JavaScript, content is visible by default.

## Forms

The forms don't send anything until you connect them to a backend. Both validate on the client with inline errors and then finish the way the workshop would: the form is replaced by a success state with a reference (`CG-` and four digits from `reference()`), and focus moves to it.

`initBooking()` validates an upcoming opening day, a known mechanic or `any`, one of the offered times, a name of 2–80 characters, a complete email and a bike description of at least three characters; each error shows under its own field. The success state (`data-book-done`) reads "Booked for Wednesday, October 21 at 10:00am", the reference, a summary (drop-off, mechanic, name, email, bike and the work from the saved plan or `?repair=`) and what happens next: a confirmation email within a business day, the price agreed at drop-off, and a call when the bike is ready. "Book another bike" resets the form.

`initContact()` validates the same name and email rules and a question of at least 15 characters. Its success state (`data-contact-done`) thanks the visitor by first name, shows a reference and the "what happens next" line for the chosen topic from `CONTACT_TOPICS`. Contact details are never saved.

The add-repair form in `estimate.html` selects an ID from the catalog. Search and filter controls only change the local display.

To connect a form service such as Formspree, add its endpoint to the form:

```html
<form data-contact-form action="https://formspree.io/f/YOUR_FORM_ID" method="post" novalidate></form>
```

Each submit listener has a comment where the request goes, after validation and before the success state. Make the listener `async` and only show the success state when the endpoint answers OK:

```js
const button = form.querySelector('[type="submit"]');
button.disabled = true;
try {
  const response = await fetch(form.action, {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Request failed");
} catch {
  announce("Sorry, that didn't go through. Please try again or call (530) 555-0174.");
  return;
} finally {
  button.disabled = false;
}
// ...the existing success-state code runs here.
```

Keep credentials on a server, not in this JavaScript.

For bookings, use your server to check availability again before confirming a slot. Include the selected date, time, mechanic and repair plan, and calculate authoritative prices from your server catalog. A browser estimate is not an invoice or an authorization to take payment.

Publish a real privacy notice explaining the form service, retention and contact route before collecting personal information.

## Saved data (localStorage)

All storage access goes through `safeStorage`. It writes to a memory map before attempting `localStorage`, and reads fall back to that map when storage is blocked. In a sandboxed preview, saved features continue within the current page view; navigation or reload may discard memory-only state.

| Key                      | Shape                                  | Validation                                                                                                              |
| ------------------------ | -------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `cogmere.repair-plan.v1` | `{ jobs: [{ id, qty }], bike, parts }` | Known own-key repair, bike and parts IDs; maximum 16 distinct repairs; quantities clamped 1–4; duplicate repairs merged |
| `cogmere.ride-checks.v1` | `{ kind, weather, done: [] }`          | Known ride kind, `dry` or `wet` weather, unique known check IDs                                                         |

Catalog prices, names and descriptions are never taken from saved values. Invalid JSON is removed. Invalid shapes become safe defaults, unknown fields are dropped and valid portions are written back in normalized form. `cleanPlan()` examines at most 64 incoming job entries.

To reset both features from the browser console on your deployed origin:

```js
localStorage.removeItem("cogmere.repair-plan.v1");
localStorage.removeItem("cogmere.ride-checks.v1");
location.reload();
```

The on-page clear and fresh-check buttons also work when storage is blocked. Names, email addresses, bike descriptions, messages, dates and chosen time slots are not saved.

## SEO and sharing

Every page has a unique title and description, Open Graph title and description, site name, locale, theme color and favicon. The repair detail updates its browser title from the validated repair; its static social metadata describes the repair detail page generally.

Before publishing, replace `og:image` with an absolute URL to your own hosted `assets/img/og-image.png`. Add a canonical URL to each page if your hosting serves duplicate paths. Add a sitemap for your real public pages and a `robots.txt` suited to your deployment.

Use your real domain in production metadata. There is no analytics or structured-data script included. If adding LocalBusiness structured data, use accurate address, hours and contact information; never publish the fictional details as a real listing.

## Accessibility

The pages include a skip link, semantic header/navigation/main/footer landmarks, one rendered `h1`, visible focus outlines, labeled controls, inline validation and live result counts. Menu controls, selected filters and drop-off times expose their state. Dynamic customer text is escaped or assigned as text.

Keep all `aria-controls`, `aria-labelledby` and `aria-describedby` references paired with existing IDs. New icons that repeat text should be hidden from assistive technology. Do not use a shorter `aria-label` that drops visible button text.

Check keyboard order after editing the estimator. Removing a repair should leave focus in the remaining plan or the add selector. The booking and contact success states have `tabindex="-1"` so submission can move focus to them.

The design follows the same light palette for either system color scheme; it does not store a theme preference. Recheck contrast at mobile and desktop sizes after changing colors. Avoid shrinking tap targets or disabling zoom.

## Building and deploying

Rebuild CSS after adding utilities or changing `src/input.css`:

```sh
npm install
npm run build
```

For development:

```sh
npm run watch
```

Tailwind scans this template's HTML and JavaScript through `source("../")`. Keep utility classes as complete literal strings; dynamically assembling partial class names can omit styles from the build.

Upload the HTML files and `assets/` together to any static host. Netlify Drop, Cloudflare Pages and GitHub Pages can serve this site. Keep relative link paths intact when hosting under a subdirectory.

Configure your host's missing-page behavior to serve `404.html` with an HTTP 404 status. Test `index.html`, an inner page, an unknown URL, the fonts, all drawings and both forms after deployment.

Before launch, test every page at phone and desktop widths, all estimator settings, quantity limits, removal focus, blocked storage, keyboard navigation and a successful and failed backend submission if connected. Test the calendar around Thanksgiving, Christmas and the year boundary as well as a year and two years ahead.

## Troubleshooting

### The new repair looks unstyled

Rebuild Tailwind after adding utility classes in HTML or JavaScript. Keep classes as full strings in files inside this folder. Confirm that the deployed `assets/css/style.css` is the rebuilt file.

### Fonts fall back to a plain sans serif

The fonts come from Google Fonts, so the page needs a network connection to show them; offline it uses the system fallback. Check that each page still has the `fonts.googleapis.com` stylesheet link, and that a Content Security Policy allows `https://fonts.googleapis.com` in `style-src` and `https://fonts.gstatic.com` in `font-src`.

### A saved plan disappears after navigation

The browser may block persistent storage, as sandboxed previews do. Memory fallback keeps features working within one page view but cannot persist through navigation. Use your own hosted origin to test persistence.

### A quantity or repair disappears on reload

The saved-data validator removes unknown IDs and clamps quantities. Update the catalog and any migrated storage together when renaming IDs. Clear the old storage keys while testing catalog changes.

### Copy estimate shows a text box

Clipboard permission is unavailable or the page was opened from the file system. Select and copy the provided text manually, or test over HTTP. The fallback does not send the estimate anywhere.

### The calendar skips an expected day

Check the weekday, calculated federal holiday rules and `EXTRA_CLOSURES`. The calendar begins tomorrow and shows only future opening days. The mechanic selector also omits one handover time for each named mechanic.

### A request did not arrive

Until you connect a form service (see [Forms](#forms)), the success state is shown without sending anything. Connect an endpoint, then test both a successful and a failed submission.

### A service link shows the safety check

The `repair` query parameter is missing or not a known catalog ID. Use the exact lowercase ID from `SERVICES`, for example `service.html?repair=chain`.

## License

MIT. The code and included artwork are supplied under the terms in `LICENSE.txt` in the download.

Chivo and Spline Sans are Google Fonts under the SIL Open Font License.

Cogmere, its people and contact details are fictional. All illustrations are included.
