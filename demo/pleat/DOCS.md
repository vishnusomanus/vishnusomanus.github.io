# Pleat documentation

## Overview

Pleat is a complete HTML and Tailwind CSS v4 website for an independent alterations and repair workroom in Alexandria, Virginia. This guide covers version 1.0.5, which includes a service catalog, a multi-garment price estimator, a saved repair plan, a rolling fitting calendar, a fitting request form and an inquiry form. The fictional studio uses American spelling, US dollars and the `America/New_York` time zone. See the [template page and live demo](https://freeframe.dev/templates/pleat).

## Quick start

The compiled CSS, JavaScript and original SVG artwork are included. The two typefaces load from Google Fonts.
Open `index.html` directly, or serve this directory over HTTP:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`. The website does not require a backend to browse, build estimates or try the fitting request and inquiry forms.
The forms show their confirmation in the browser but send nothing until you connect them (see [Forms](#forms)).

Node 24 and npm are required only when rebuilding the CSS.
No JavaScript package or framework runs in the browser.

## Pages

| File            | Purpose                      | Notable features                                                                        |
| --------------- | ---------------------------- | --------------------------------------------------------------------------------------- |
| `index.html`    | Introduce the workroom       | Three garment plates (one on phones), featured work, process and next fitting           |
| `services.html` | Find an alteration           | Sixteen services, category filters and text search                                      |
| `service.html`  | Inspect one service          | Validated `?service=`, finishes, live price, fitting advice and related services        |
| `quote.html`    | Build a repair plan          | Multiple garments, fabric allowances, quantity, priority, remove, clear, save and print |
| `book.html`     | Request a fitting            | `?type=` and `?person=`, specialists, six-week calendar, validation and confirmation    |
| `work.html`     | Explore completed work       | Category filters and keyboard-accessible detail dialogs                                 |
| `studio.html`   | Meet the three staff         | Specialties, work days and direct fitting links                                         |
| `care.html`     | Look after clothes           | Searchable care notes, fabric filters and expandable advice                             |
| `visit.html`    | Find or contact the workroom | Hours, access, winter closures and inquiry preparation                                  |
| `404.html`      | Recover from a missing page  | Links to the home page and alteration list                                              |

A service detail page falls back to `trouser-hem` when an unknown service key is supplied.
Other unsupported filter values fall back to their respective `all` category.

## Project structure

```text
pleat/
  index.html                 Home page
  services.html              Service catalog
  service.html               Data-driven service detail
  quote.html                 Estimate and saved repair plan
  book.html                  Fitting calendar and request form
  work.html                  Work ledger and detail dialog
  studio.html                People and approach
  care.html                  Care notes
  visit.html                 Directions and inquiry form
  404.html                   Missing-page recovery
  assets/
    css/style.css            Compiled Tailwind CSS
    js/main.js               Data, rules, storage and interactions
    img/                     Original SVG plates, the street map and social assets
  src/input.css              Tailwind source and brand tokens
  package.json               CSS build and watch commands
  template.json              Catalog metadata
  README.md                  Short introduction and quick start
  DOCS.md                    This guide
  CHANGELOG.md               Template release history
```

The public download also includes `LICENSE.txt`; catalog metadata is removed during packaging.
Do not put credentials or private customer data into this directory.

## Customizing

### Brand and colors

Edit the `@theme` block in `src/input.css`, then rebuild the CSS.
Layouts are composed with Tailwind utilities in the HTML and JavaScript-generated markup.
The components layer holds repeated controls, typography and form fields.

| Token           | Default   | Use                                    |
| --------------- | --------- | -------------------------------------- |
| `--color-ink`   | `#172b3a` | Main text and midnight workroom panels |
| `--color-paper` | `#f3efe5` | Parchment background                   |
| `--color-white` | `#fffdf8` | Form and content panels                |
| `--color-brass` | `#aa8752` | Rules and decorative accents           |
| `--color-gold`  | `#d4b882` | Text and buttons on dark backgrounds   |
| `--color-ochre` | `#72582d` | Small accent text on light backgrounds |
| `--color-muted` | `#56616a` | Secondary text                         |
| `--color-line`  | `#d1cbbc` | Light-background borders               |
| `--color-error` | `#9e342c` | Form errors                            |

For example:

```css
@theme {
  --color-ink: #172b3a;
  --color-brass: #aa8752;
}
```

The SVG drawings have their own literal colors. Update those too when changing the palette.
Keep text contrast strong, especially on dark panels and in small form hints.

### Typography

Prata (400) is the display face and Kumbh Sans (400–700) is the body face.
Both load from Google Fonts through the `<link>` tags in the `<head>` of every page:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@400..700&amp;family=Prata&amp;display=swap"
/>
```

To use another pairing, change the families in that link on every page, then `--font-display` and `--font-sans` in
`src/input.css`, and rebuild the CSS. `display=swap` shows fallback text (Georgia and the system sans) while the fonts load.
The street names on the map are outlined from Kumbh Sans, so they need no font request.
The editable social image uses the same two family names; `og-image.png` is rendered with them loaded.

### Content

Shared business copy is repeated in each HTML header and footer.
Edit all pages when changing the workroom address, phone number or navigation.
Most service-specific content lives in `assets/js/main.js`.

| Constant          | Contents                                                                   |
| ----------------- | -------------------------------------------------------------------------- |
| `SERVICES`        | Sixteen service records, finish prices, fitting notes and related services |
| `CATEGORIES`      | Service filter labels                                                      |
| `COMPLEXITY`      | Fabric multipliers and extra turnaround days                               |
| `URGENCY`         | Standard schedule and priority allowance                                   |
| `PEOPLE`          | Staff names, biographies, business days and appointment types              |
| `APPOINTMENTS`    | Fitting names, durations and guidance                                      |
| `ICONS`           | A small line drawing per service, shown on service cards and detail pages  |
| `WORK`            | Six garment case studies, each with its own `art` plate and `label`        |
| `WORK_CATEGORIES` | Work ledger filters                                                        |
| `CARE`            | Eight care notes with steps, cautions and workroom advice                  |
| `CARE_CATEGORIES` | Care note filters                                                          |

To add a service, copy a complete record in `SERVICES` and give it a unique key.
For an extra finish on the pants hem, add this inside its `finishes` object:

```js
hand: {
  name: 'Hand-finished hem',
  extra: 12,
  note: 'A hand finish agreed after inspecting the cloth.'
}
```

`extra` is added to the service's base `price` before the fabric multiplier.
Every service needs `name`, `category`, `art`, `price`, `days`, `short`, `description`, `finishes`, `checks`, `bring`, `limit` and `related`.
Use only existing category keys and artwork filenames, and add a matching entry to `ICONS`: a list of path strings on a 48 × 48 grid
(prefix a path with `d:` to dash it, or write `c:x y` for a small circle).
`SERVICE_APPOINTMENT` picks the appointment type that the service page's "Arrange a fitting" link opens for each category.
Related keys must name other records in `SERVICES`.
Finish keys must remain stable if you want existing saved plans to keep their options.

### Images and artwork

All pictures are original SVG plates in `assets/img/`, drawn for this template. None of them contains text, except the street names on the map.

| Files                                                                                      | Used on                                                            |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| `coat`, `trousers`, `dress`, `skirt`, `shirt`, `knit`                                      | Home hero and the service page (each service's `art`)              |
| `work-overcoat`, `work-denim`, `work-occasion`, `work-jumper`, `work-linen`, `work-pleats` | Each case study's own repair, close up (`WORK[].art`)              |
| `person-iona`, `person-malachy`, `person-eluned`                                           | Each specialist's tools on the studio page (`PEOPLE[].art`)        |
| `rail`, `bench`, `care-hanger`, `tools`, `skirt`, `shirt`, `dress`, `map`                  | Page heroes: work, studio, care, 404, quote, services, book, visit |

The drawings use a 530 × 520 view box.
Keep that approximate aspect ratio when replacing them so the page rhythm remains balanced.
The map is a schematic guide; verify directions and access before using it for a real address.

`favicon.svg` is the browser icon.
`og-image.svg` is the editable 1200 × 630 social image source; `og-image.png` is its shareable raster version.
Regenerate the PNG after editing the artwork, and verify that the chosen typefaces are loaded during rendering.
Changing only the SVG does not change the PNG used by social networks.

### Navigation, header and footer

The header and footer are repeated in every HTML page to keep the download standalone.
Update both desktop and mobile navigation when adding a page.
Keep `aria-current="page"` on the current page's link.
The service detail, estimate and booking pages are reached through their relevant calls to action.

`initHeader()` controls `#menu-toggle` and `#mobile-menu`.
The menu button exposes `aria-expanded`, closes with Escape and returns focus to the button.
Crossing the desktop breakpoint closes the mobile menu.

## Features

### Service catalog and detail

`initServices()` filters the records by category and search term.
The category is reflected in `?category=`; search text stays on the page and is not saved.
`data-service-count` announces updated result counts.

`initDetail()` reads `?service=` using an own-property check before looking up the service.
Changing `#detail-finish` updates the estimated price and finish note.
Adding a service uses the selected finish, everyday cloth and a quantity of one.
Open the estimate page to change fabric, quantities or timing.

### Multi-garment estimate

`initQuote()` handles `#quote-add`; `linePrice()` and `totals()` hold the calculation.
The calculation is:

```js
(service.price + service.finishes[line.finish].extra) * COMPLEXITY[line.complexity].multiplier;
```

The result is rounded to cents, then multiplied by the number of garments.
Priority adds 30% of the subtotal, also rounded to cents.
The longest service turnaround plus its fabric allowance is shown for the standard schedule.
Priority asks for about half that turnaround, rounded up, and never less than `URGENCY.priority.days` (3) business days:
a 14-business-day plan shows "7 business days requested (standard 14)". It is subject to studio capacity and garment suitability.
Turnarounds are durations, not promises or computed pickup dates.

Everyday cloth has a multiplier of 1 and no extra days.
Delicate cloth adds 25% and two business days.
Detailed construction adds 50% and four business days.
The form accepts whole quantities from one to six and a maximum of twelve separate lines.
Invalid typed quantities produce an inline error and move focus to the quantity field.

Removing a line moves focus to the next remove button or the plan heading.
A polite live region announces line additions, removals and saves.
The print button opens the browser print dialog, with header and footer hidden on paper.

### Saved repair plans

`persistPlan()` writes and re-reads the plan through `safeStorage`.
Adding a garment, removing a line and changing priority keep the current plan updated automatically.
The explicit save button announces the saved state again.
Clear removes the stored key and resets priority to standard.
No name, email, appointment notes or contact form message is saved.

When browser storage is blocked, the same plan works in memory for the current page view.
It cannot survive a navigation or reload without a storage backend; the save feedback describes this limit.

### Fitting calendar

`initBooking()` builds a rolling calendar from tomorrow to `BOOK_AHEAD_DAYS` days ahead.

Two URL parameters preselect the form; unknown values are ignored:

| Parameter  | Values                                        | Example                               |
| ---------- | --------------------------------------------- | ------------------------------------- |
| `?type=`   | `fitting`, `repair`, `occasion`, `collection` | `book.html?type=occasion`             |
| `?person=` | `iona`, `malachy`, `eluned`                   | `book.html?type=repair&person=eluned` |

A named specialist always stays selected. If they don't offer the requested appointment (or the default `fitting`
when no type is given), the form starts on the first appointment in their `appointments` list instead, so
`book.html?person=eluned` opens a repair assessment with Eluned. The studio page's links name both.

It uses `today()`, `addDays()`, `opening()` and `slotsFor()`.
Civil dates are represented at UTC noon; the current civil day is derived in `America/New_York`.
The calendar therefore remains correct for visitors in other time zones and across daylight-saving changes.

| Setting                  | Default                                                         |
| ------------------------ | --------------------------------------------------------------- |
| `TIME_ZONE`              | `America/New_York`                                              |
| `BOOK_AHEAD_DAYS`        | 42                                                              |
| `SLOT_STEP`              | 40 minutes between starts                                       |
| `HOURS`                  | Tue–Fri 9:30am–5:30pm, Sat 10am–3pm                             |
| `WINTER_BREAK`           | December 24 through January 2 inclusive                         |
| `CLOSE_ON_BANK_HOLIDAYS` | `true`: closed on US federal holidays                           |
| `EXTRA_CLOSED`           | Empty list of additional ISO closure dates, e.g. `"2027-07-16"` |

Sunday and Monday are closed.
`bankHolidays(year)` works out the US federal holidays for any year by rule: New Year's Day, Martin Luther King Jr.
Day, Washington's Birthday, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day,
Thanksgiving Day and Christmas Day. A holiday on a Saturday is also observed on the Friday before, and one on a Sunday
on the Monday after. The workroom opens Tuesday to Saturday, so the Monday holidays change nothing in practice; the
calendar labels a closed open-day with the holiday's name. Set `CLOSE_ON_BANK_HOLIDAYS = false` to open on them, add
one-off closures to `EXTRA_CLOSED`, and edit `bankHolidays()` for your own holiday list.
The appointment must fit before closing time and cannot overlap the 12:30–1:30pm lunch break.
Specialists must support the selected appointment type and work that weekday.
A deterministic rule withholds some slots to show a varied calendar; it is not live availability.
There is no fixed year, fixed future date or countdown to maintain.
The next-fitting labels reuse the same calendar rules.
Copyright is generated in Eastern time each year.

For a real site, replace the slot-generation logic with availability from a server.
Recheck that availability when the user submits, and reserve atomically on the server.
Keep the request language until a real confirmation has been received.

### Work ledger

`initWork()` filters six `WORK` records and stores the active category in `?kind=`.
Each record has a different garment story, method, result and practical lesson.
The detail button opens the native `#work-dialog` modal.
Escape, the close button and an outside click close it; focus returns to its opener.
The browser's native dialog focus containment is retained.

### Care notes

`initCare()` combines the fabric category with a text search.
The category is reflected in `?fabric=` and validated against `CARE_CATEGORIES`.
Native `details` and `summary` elements make each note keyboard operable without a custom accordion.
Search updates a polite result count and displays a useful empty state.
Always check edited care advice against actual garment care labels.

### Motion

`initReveal()` uses IntersectionObserver for subtle fades.
When scrolling quickly it also reveals preceding items, avoiding missing content after an anchor jump.
Reduced-motion users see content immediately.
All content remains visible if JavaScript is disabled.

## Forms

### Fitting request

`#booking-form` validates a future open day, a valid slot, a name of 2–80 characters, an email up to 180 characters, notes of 12–1,200 characters and permission to contact the visitor.
The day and slot are rechecked against the calendar at submission time.
On success the form is hidden and `#booking-review` is shown and focused: "Request received", a summary of the
request and repair plan (inserted with text nodes) and a short reference (`PL-` and four characters, made in the
browser by `makeRef()`; use your booking system's own reference instead if it returns one). The message promises an
email within one business day to confirm the time or offer the nearest alternative: change it if yours differs.
No appointment is reserved and nothing is sent until you connect the form (see below).
Name, email and notes are not persisted.

### Workroom inquiry

`#contact-form` validates the name, email and a message of 12–1,500 characters.
`initContact()` validates the topic against a fixed own-key map.
On success the form is hidden and `#contact-review` is shown and focused with the sender's first name, the topic,
a reply within two business days (as the hint under the button says; change both if yours differs) and a `PL-`
reference from `makeRef()`. Nothing is sent until you connect the form.

### Connecting a real endpoint

For an inquiry service, add your own endpoint to the form:

```html
<form id="contact-form" action="https://formspree.io/f/YOUR_FORM_ID" method="post" novalidate></form>
```

In `initContact()`, after all `checks` pass and before showing `#contact-review`, send the form with a request such as:

```js
const response = await fetch(form.action, {
  method: "POST",
  body: new FormData(form),
  headers: { Accept: "application/json" },
});
if (!response.ok) throw new Error("Please try again or email the workroom.");
```

Make the submit handler `async`, wrap the request in `try/catch`, disable the submit button while pending and announce the actual result in a live region.
Show the confirmation only when the service answers OK, and keep the populated form on failure so the visitor can retry.
Validate and limit the input on the server too; add rate limiting and spam protection appropriate to the service.
Never place API secrets in `main.js`.
For fitting requests, a form service can collect the request but cannot guarantee a slot; a booking server must recheck and reserve capacity.
Publish your real privacy and retention policy when collecting personal details.

## Saved data (localStorage)

All storage calls go through the single `safeStorage` adapter.
It mirrors values in a Map and falls back to that map if native reads or writes throw.
The map lasts for the current page view only.

| Key                 | Shape                                               | Validation                                                                  |
| ------------------- | --------------------------------------------------- | --------------------------------------------------------------------------- |
| `pleat:repair-plan` | `{ version: 1, lines: [...], urgency: "standard" }` | Version, own service/finish/fabric keys, list length and bounded quantities |

A line has `service`, `finish`, `complexity` and `quantity`.
Unknown keys and invalid line objects are discarded.
Only twelve lines are read; quantities are clamped to whole numbers from one to six.
Stored prices are never trusted: every price is recalculated from `SERVICES`.
Malformed JSON and incompatible versions become an empty plan.
URL values such as `constructor`, `toString` and `__proto__` cannot resolve through inherited object properties.

Use Clear plan in the estimator to reset the saved data, or remove `pleat:repair-plan` through your browser's storage tools.
Storage is convenience state, not a business record or a confirmed quote.
Changing service keys or finish keys can invalidate older lines; bump `PLAN_VERSION` if you intentionally change the whole schema.

## SEO and sharing

Every HTML file has its own title, description and Open Graph tags.
Update the `.example` URLs to your real public domain before launch.
`og:image` points to the included PNG relatively for local browsing; use an absolute public URL for reliable social sharing:

```html
<meta property="og:image" content="https://your-domain.example/assets/img/og-image.png" />
```

The service page updates its browser title for the selected service; its HTML metadata remains generic.
Use separate rendered service URLs or server-generated metadata if each service needs its own search result and social card.
The template includes no JSON-LD, analytics, sitemap or robots file.
Add a sitemap for your real public pages and configure the static host to serve `404.html` for missing URLs.

## Accessibility

The pages include a skip link, semantic landmarks, exactly one main heading per page and visible keyboard focus.
Inputs have visible labels and linked inline errors.
Filter buttons expose `aria-pressed`; the mobile menu exposes `aria-expanded`.
Calendar controls are native buttons, with date labels and disabled closed days.
Price, result-count and save feedback use live announcements.
The work dialog restores focus on close, and removing a plan item restores focus to a useful target.

When editing, preserve label associations and ARIA target IDs.
Do not communicate a price change or an error only through color.
Keep target sizes comfortable at narrow widths and avoid adding unbroken long labels.

## Building and deploying

From this template directory, with Node 24 installed:

```sh
npm install
npm run build
```

Use `npm run watch` while editing HTML or generated-markup utilities.
The build writes `assets/css/style.css`; commit or upload that generated file with the site.
Only Tailwind CSS and its CLI are development dependencies.

Upload the complete folder to a static host such as GitHub Pages, Netlify or Cloudflare Pages.
Preserve the relative directory layout and compiled CSS.
No environment variables or secrets are required for the included client-side features.
If you set a content security policy, allow `https://fonts.googleapis.com` for styles and `https://fonts.gstatic.com` for fonts.

Before publishing, replace the business identity and reserved contact details, verify access information, connect the chosen inquiry service and review every page at desktop and mobile sizes.
Connect real booking capacity before offering confirmed appointments.
Test a saved plan, a blocked-storage plan and the winter closure period after changing the data.

## Troubleshooting

| Problem                                                   | What to check                                                                                    |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------ |
| A new utility class has no effect                         | Rebuild `assets/css/style.css` from `src/input.css` after editing markup                         |
| Display type falls back to Georgia                        | Check the Google Fonts `<link>` tags are in the page head and your CSP allows both font hosts    |
| A plan vanishes after moving pages                        | Native storage may be blocked; memory fallback intentionally lasts for one page view             |
| A saved line disappears after editing services            | Its service, finish or complexity key no longer exists, or the schema version changed            |
| A specialist has no times on a day                        | Check `PEOPLE.days`, appointment eligibility, lunch, duration and `HOURS`                        |
| No fittings appear at Christmas                           | The annual winter break closes December 24 through January 2; move to a later week               |
| An open weekday is closed, such as a Thursday in November | It is a federal holiday, here Thanksgiving; set `CLOSE_ON_BANK_HOLIDAYS = false` to open on them |
| A form shows its confirmation but nothing arrives         | It sends nothing until you connect it; see [Forms](#forms)                                       |
| Social networks show an old image                         | Regenerate the PNG, publish an absolute URL and refresh the network's cached preview             |

## License

MIT. See `LICENSE.txt` in the download for the template's terms.

Prata and Kumbh Sans are served by Google Fonts under the SIL Open Font License.

The original SVG artwork and inline SVG icons were drawn for this template.
Pleat, its staff and its garment stories are fictional, and contact information uses reserved example details.
