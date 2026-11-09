# Cuefold documentation

## Overview

Cuefold 1.0.3 is an HTML5 and Tailwind CSS v4 website for a fictional independent theater in Staunton, Virginia. Its ten pages combine a six-week performance program that stays current, detailed productions, saved visit planning, access preferences, and ticket and workshop requests. The [template page](https://freeframe.dev/templates/cuefold) links to the live preview and available downloads.

## Quick start

Open `index.html` directly in a browser. Compiled CSS, vanilla JavaScript and artwork are included, and the fonts load from Google Fonts; no server or installation is needed for the website itself.

Alternatively, serve the folder with a static server:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080/index.html`. Using a local server gives the browser one consistent storage origin across all pages. Some browsers isolate storage for pages opened directly from disk.

Node 24 and npm are needed only when rebuilding Tailwind after changing classes. There are no browser JavaScript dependencies.

## Pages

| File               | Purpose                     | Notable features                                                                            |
| ------------------ | --------------------------- | ------------------------------------------------------------------------------------------- |
| `index.html`       | Theater introduction        | Featured production date, three program cards, room statistics and visitor routes         |
| `programme.html`   | Find a performance          | Search, genre, date window and access filters; eighteen productions in date order           |
| `show.html`        | Production details          | `show` parameter, story, credits, age guidance, effects notes, performances and saved dates |
| `planner.html`     | Build an evening            | Saved performances, overlaps, cost and date summaries, access notes and text download       |
| `tickets.html`     | Ask the box office          | Production/date selection, live estimate, seating and a box-office reply with a reference   |
| `access.html`      | Plan a comfortable visit    | Room diagram, practical access details, questions and saved preferences                     |
| `participate.html` | Workshops and volunteering  | Three rule-dated workshops with their own art, usher information and a spot request      |
| `about.html`       | Meet the theater            | Building story, three team members and approach to programming                              |
| `visit.html`       | Find the door               | Address, hours, travel guidance and arrival-time calculator                                 |
| `404.html`         | Recover from a missing page | Program, home and box-office links                                                        |

Every file repeats the same header and footer. Every page has a static `h1`; on `show.html` it holds The Borrowed Staircase and `initShow()` replaces it with the chosen production. If JavaScript is disabled, the shared navigation, contact information and static editorial sections remain available; the catalog, estimates and planner need JavaScript.

## Project structure

```text
cuefold/
  index.html               Home page
  programme.html           Program search and filters
  show.html                Production detail shell
  planner.html             Saved visit plan
  tickets.html             Ticket request form and confirmation
  access.html              Access guide and preferences
  participate.html         Workshops and inquiries
  about.html               Theater and team
  visit.html               Travel and arrival timing
  404.html                 Missing-page recovery
  assets/
    css/style.css          Compiled Tailwind output
    js/main.js             Data, calendar, validation and all interactions
    img/                   Production, people, room and map SVG artwork
  src/input.css            Tailwind import, tokens and repeated component rules
  package.json             CSS build and watch commands
  README.md                Short introduction
  DOCS.md                  This guide
  CHANGELOG.md             Version history
  LICENSE.txt              Included license in the download
```

`template.json` supplies gallery information in the source repository and is excluded from the public download. It lists pages, category, features and the template version.

## Customizing

### Brand and colors

Change the theater name in every HTML file and in `assets/js/main.js`. Also update the wordmark text in `assets/img/og-image.svg`, the social PNG, the favicon, email addresses and downloadable text headings.

`src/input.css` defines the brand in `@theme`:

| Token            | Role                                              |
| ---------------- | ------------------------------------------------- |
| `--color-paper`  | Warm page and field background                    |
| `--color-ink`    | Main text, borders and dark panels                |
| `--color-muted`  | Secondary text                                    |
| `--color-lilac`  | Home hero, planning and request surfaces          |
| `--color-orange` | Rust accent, errors, focus and contrasting panels |
| `--color-peach`  | Stage and building illustrations                  |
| `--color-rule`   | Quiet separators                                  |
| `--color-panel`  | Pale editorial and review panels                  |

For example, change the rust accent and rebuild:

```css
@theme {
  --color-orange: #a62f25;
}
```

Keep the changed color dark enough for text on paper and paper-colored text on the accent. Artwork contains its own explicit SVG colors; changing CSS tokens does not recolor the drawing files.

### Typography

Fahkwang is the display face and Questrial is the body face, both regular weight. Every page loads them from Google Fonts in its `<head>`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fahkwang&amp;family=Questrial&amp;display=swap" />
```

The `--font-display` and `--font-sans` tokens in `src/input.css` name the families, with a system fallback stack. To swap a family, change the `<link>` on every page (ask only for the weights you use), update the token and rebuild CSS. Update the social SVG font names and regenerate its PNG in the chosen faces. To self-host instead, download the fonts with their licenses, add `@font-face` rules and remove the links.

### Content

Edit editorial copy directly in the HTML files. Repeated production data lives in the `SHOWS` array in `assets/js/main.js`.

| Field                                | Meaning                                                                              |
| ------------------------------------ | ------------------------------------------------------------------------------------ |
| `id`                                 | Unique production key used by URLs, images and performance IDs                       |
| `title`, `genre`, `summary`, `story` | Catalog and detail copy                                                            |
| `duration`                           | Whole running time in minutes                                                        |
| `price`                              | Standard price in dollars; the discount ticket is $5 less                                      |
| `age`                                | Recommended audience age text                                                        |
| `warning`                            | Specific effects and theme information                                               |
| `interval`                           | Whether the running time includes an intermission                                        |
| `dates`                              | Two performances, as `'YYYY-MM-DD HH:MM'` venue time                                 |
| `relaxed`, `captioned`, `audio`      | Production access availability                                                       |
| `room`, `company`, `kind`            | Room, company name and `A Cuefold production`, `Visiting company` or `Co-production` |
| `credits`                            | `[role, name]` pairs shown on the detail page                                        |

A production has two performances, with IDs ending `-a` and `-b` for the first and second entry in `dates`. Captioning and relaxed performances are the first date when enabled; audio description is the second.

Use an existing object as the shape for an addition:

```js
{
  id: "staircase",
  title: "The Borrowed Staircase",
  genre: "Drama",
  duration: 105,
  price: 30,
  age: "12+",
  dates: ["2026-10-21 19:45", "2026-10-22 19:45"],
}
```

This is a short excerpt of the existing object, not a complete replacement. Include the remaining fields described above, draw `assets/img/<id>.svg` and keep `id` unique. Add any new genre to `GENRES` and the genre select in `programme.html`.

`WORKSHOPS` holds the three workshop titles, week numbers (see Workshops below), times, durations, prices, leaders and image keys. The interests select, `choices` in `initInterest()` and URL validation must agree with the workshop IDs. The fourth inquiry option is `volunteer`.

Contact information is repeated in HTML. `BOX_OFFICE` is the email address printed in the downloadable visit plan. Phone `(540) 555-0147` and `.example` addresses are fictional; replace them consistently for a real theater.

### Images and artwork

Each of the eighteen production SVGs is a separate 600 × 600 stage-object composition. Keep a square aspect ratio for replacement artwork. Catalog cards use the whole square and the ticket estimate shows a small square thumbnail. The three workshops have their own 600 × 430 drawings (`workshop-story.svg`, `workshop-movement.svg`, `workshop-objects.svg`).

Additional artwork includes `theatre.svg`, `access-room.svg`, `map.svg`, `catriona.svg`, `melisande.svg` and `anselm.svg`. The map is an orientation sketch. It is not a surveyed route or live navigation service; replace it with verified directions for the real venue.

`og-image.svg` is the editable 1200 × 630 sharing source. `og-image.png` is the image referenced by all pages. Render the SVG with Fahkwang and Questrial loaded, then review the PNG before publishing. `favicon.svg` is an abstract letter-and-slash mark.

When replacing art with photographs, preserve useful text alternatives. Images duplicating an adjacent label can retain empty alt text, while meaningful spatial diagrams need an alternative explanation.

### Navigation, header and footer

The header is repeated across all ten pages. Update both the desktop and mobile link lists, then update each page’s `aria-current="page"` state. The logo links to `index.html`.

`initMenu()` controls the small-screen menu, keeps `aria-expanded` in step with visibility, closes on Escape and returns focus to the menu button. It also closes after a click outside the menu and when the desktop breakpoint is reached.

This design has a single light palette and intentionally does not store a theme preference. A dark operating-system color scheme does not replace the theater’s chosen colors.

## Features

### A program that stays current

The calendar uses `LOCALE = 'en-US'` and `TIMEZONE = 'America/New_York'` (Eastern time). `londonToday()` (the name is kept for compatibility) finds the current calendar day in that zone; calendar arithmetic uses midday UTC dates to avoid daylight-saving shifts.

Every performance has a real date and time in `SHOWS[].dates`, written for a six-week program from Tuesday, Oct 20, 2026. With `KEEP_PROGRAMME_CURRENT = true`, a performance that has started moves forward by whole program cycles (`PROGRAMME_WEEKS = 6`, so 42 days): the weekday and time stay right and the program always runs about six weeks ahead, with something on in the next few days. Performances that haven't happened yet keep their dates, so on Oct 20, 2026 the page shows exactly the dates in the data.

Set `KEEP_PROGRAMME_CURRENT = false` for a real program with fixed dates. Performances that have started then drop out of the listings, and a production with no performances left disappears from the program and says so on its detail page.

`PERFORMANCES` contains the upcoming performances in date order, derived from `SHOWS`. Performance IDs (`staircase-a`) never change when a date rolls. `performanceById` and `showById` provide validated lookups. `dayLabel()`, `timeLabel()` and `performanceLabel()` format all visitor-facing dates and times. Copyright uses the current year at the venue. Times on the page use a 12-hour clock (`clockTime()`).

Saved plans store each performance with the date it was saved for. A saved performance stays saved until it has started; after that it is removed from the plan and the planner says once which performances have taken place. Access preferences are separate and never expire.

Test with a fixed clock a year and two years ahead, and around a saved performance's start time, when changing this logic. There are no hard-coded upcoming years in page copy.

### Program search and filters

`initProgramme()` combines title/story search, genre, a 7, 14 or 28-day window (`PERIODS`) and access type. Date windows are measured from today; the whole program covers six weeks. The result card uses the first performance that matches all filters.

The list remains in date order. A production with two matching dates appears once; the result text also counts its matching performances. Open its detail page to compare both dates.

The live result count announces changes. Clear filters resets the form and focuses search. Empty results offer a visible reset button. Search text is limited to 100 characters before matching.

### Production details

`initShow()` reads `?show=<id>`, validates the ID with an own-property check and falls back to the first production for unknown values. It replaces the static content (The Borrowed Staircase) and updates the page title, description, Open Graph title and description in the browser.

Each production has a story, running time (with or without an intermission), price, age guidance, effects notes, room, company, credits and two performances. The request link carries both the production and performance IDs into the ticket page.

For production-specific social previews that do not execute JavaScript, publish individual HTML detail pages or add a server that writes the appropriate metadata per URL.

### Saved performance planning

Every `data-save` button reads and writes through `safeStorage`. `updateSavedUI()` updates pressed states, labels and the header count. Each button names both the production and date, so the two dates are distinguishable to assistive technology.

`renderPlan()` lists saved performances in date order. `planConflicts()` compares their start and end times. The Studio and Main room sometimes play on the same evening (for example The Borrowed Staircase and When the Kettle Sings on the first Wednesday), which makes it possible to try the warning.

The standard-ticket sum represents one standard ticket per saved performance. It excludes the per-request handling fee, because a saved plan is not a ticket request. The days-out count is the number of distinct performance dates. Planner suggestions are the next three productions on.

Removing a planner row moves focus to the next available Remove button, or to a suggestion when the list becomes empty. Download uses `downloadText()` and includes dates, venue contact details, access notes and any timing warning. It does not create a ticket or reservation.

### Access preferences

`ACCESS_NOTES` defines `stepfree`, `hearing`, `quiet` and `companion`. `initAccess()` saves only booleans, announces a saved count and can clear the preferences. `readAccess()` normalizes the stored shape and removes unrelated fields.

The planner displays the notes and the ticket request includes them. A saved step-free preference preselects a wheelchair-space request; the visitor can choose a different seating option. The box office must confirm all arrangements.

Preferences are practical planning information rather than medical details. They are not transmitted by this website. Do not expand this into sensitive health information without an appropriate privacy and security design.

### Ticket requests

`initTickets()` chooses an initial production from validated URL parameters, then a saved performance, then the first production with performances. The performance must belong to the selected production. Changing productions rebuilds the date options.

`calculation()` reads catalog prices, never prices from the URL or storage. Each quantity box takes a whole number from 0 to 8 and the total must be 1–8. A box that breaks the rule is marked `aria-invalid` with the message under the quantity fields as soon as it is typed, and the estimate shows a dash rather than a number that differs from the field. A discount ticket is `CONCESSION_OFF` ($5) less than the standard ticket; cards show the discount price as "From".

`HANDLING_PENCE = 200` (in cents, $2) is added once per non-empty request. For The Borrowed Staircase, two standard tickets and one discount ticket cost $30 + $30 + $25 + $2 = $87.

When the request is valid, the form is replaced by the box office's reply: "Request received · ref CF-1234", the performance, tickets, estimated total and access notes, and what happens next (seats held now, a confirmation email within one business day, payment by phone or at the box office). See Forms for connecting it to a real service.

### Workshops and inquiries

Workshop dates follow a rule rather than fixed dates: the first Saturday at least `WORKSHOP_NOTICE_DAYS` (3) days ahead, then one a week in `WORKSHOPS` order (`week: 0, 1, 2`). Request a spot selects the matching option in the form and moves focus to it.

`initInterest()` validates name and email, then replaces the form with "Inquiry received · ref CF-1234" and the next step: a penciled-in place with the workshop's date and price, or a welcome chat for ushers.

### Arrival-time calculator

`initArrival()` accepts a local curtain time and a journey of zero to 360 minutes. It works backward to arrival 30 minutes before the show, taking a seat 10 minutes before, and the recommended time to set off.

If the set-off time crosses midnight, the result says “previous day”. The output is announced as a status. This is planning arithmetic, not live traffic or parking information; the visitor should allow extra time when needed.

### Motion and announcements

`initReveal()` adds a subtle entrance to top-level sections. An observer reveals earlier sections too, so quick scrolling cannot strand invisible content. Reduced-motion visitors see content immediately with no transition.

The hidden announcement region reports saved-plan changes. Visible result and preference status regions announce their own updates. Navigation and controls remain usable with a keyboard.

## Forms

The ticket request and participation inquiry use `novalidate` with visible, field-specific JavaScript errors. Name needs 2–100 characters; email must have a complete address shape and be at most 160 characters. Ticket notes are limited to 800 characters; participation notes to 600. Ticket requests also require permission to reply.

Both forms finish in `submitForm()` in `assets/js/main.js`, which shows the reply right away. Until you connect a service, nothing reaches the theater. To connect one, create an endpoint and add it to the form:

```html
<form data-ticket-form action="https://formspree.io/f/YOUR_FORM_ID" method="post" novalidate></form>
```

Then post the form in `submitForm()` and call `done()` only when the service answers OK (the comment above `submitForm()` shows the same thing):

```js
const response = await fetch(form.action, {
  method: "POST",
  body: new FormData(form),
  headers: { Accept: "application/json" },
});
if (response.ok) done();
```

Catch failures, keep the entered data and report a useful error (with the box-office phone number). The `CF-1234` reference is made in the browser; use your service's reference if it returns one. Include the calculated production/date fields and verify them again on the server. Do not trust browser totals for sales or bookings. Only say a request was received after a confirmed successful response; only say a booking is confirmed after a real booking system confirms it.

`data-access-form` saves local preferences only. `data-arrival-form` performs local arithmetic. The program filter form never transmits a query. No form stores contact names, email addresses or messages in localStorage.

## Saved data (localStorage)

All access goes through `safeStorage` in `assets/js/main.js`. It probes browser storage, maintains an in-memory copy and switches to memory if any read or write throws. This keeps controls working inside sandboxed previews and strict privacy settings for the current page view.

| Key                 | Shape                                                                 | Validation                                                        |
| ------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `cuefold-plan-v1`   | `{ items: [{ id: 'staircase-a', date: '2026-10-21' }], passed: [] }`  | Known production, `-a`/`-b`, date shape, deduplicated, maximum 36 |
| `cuefold-access-v1` | `{ stepfree: false, hearing: false, quiet: false, companion: false }` | Only four recognized keys; only literal `true` enables a choice   |

Malformed JSON and plans of the wrong shape are removed. An item whose performance has started moves to `passed` until the planner has shown the notice. Unknown performance IDs, duplicates and extra preference fields are stripped. Catalog lookups use `Object.prototype.hasOwnProperty.call` so values such as `constructor` and `toString` cannot select inherited properties.

Clear the plan on `planner.html` and access preferences on `access.html`, or reset both from the browser console:

```js
localStorage.removeItem("cuefold-plan-v1");
localStorage.removeItem("cuefold-access-v1");
location.reload();
```

When storage is blocked, in-memory choices last only until the next navigation or reload. Download a visit plan if you need a portable copy. The website does not make a network backup or require an account.

Supported URL parameters are `show` and `performance` on tickets, `show` on detail, `genre`, `access`, `period` and `search` on the program, and `interest` on participation. Unrecognized lookup keys fall back safely. There is no time-preview parameter; use a browser test clock for calendar checks.

## SEO and sharing

Each HTML file has its own title, description, theme color, icon and Open Graph tags. Replace fictional business details, update the copy and use the real absolute social image URL after deployment:

```html
<meta property="og:image" content="https://your-theater.example/assets/img/og-image.png" />
```

This address is an example to replace with your real site URL. The supplied relative path works in the downloaded site but social crawlers need an absolute public URL. Add a canonical link, `robots.txt` and a sitemap for your chosen host. The template does not ship unverified structured data.

The detail page updates metadata in JavaScript. See Production details above before relying on query-string production URLs for social sharing or search indexing.

## Accessibility

The template includes semantic landmarks, a skip link, one `h1` per rendered page, labeled fields, visible focus indicators and reduced-motion support. The menu exposes its open state and closes on Escape. Status regions announce filtering and saved-state updates.

Keep the one-heading structure when adding content. Do not remove label associations or the IDs used by `aria-describedby`. Give new buttons explicit visible action text and keep any longer accessible name beginning with that same action.

Access claims describe the fictional theater. Verify entrance widths, wheelchair spaces, equipment, companion arrangements and actual performance features before publishing for a real venue. A diagram alone is not an access audit.

## Building and deploying

Install CSS tooling with Node 24:

```sh
npm install
npm run build
```

`npm run watch` recompiles while editing. Commit or upload the regenerated `assets/css/style.css`; the browser does not compile `src/input.css`.

Upload the complete folder to any static host, including Netlify Drop, Cloudflare Pages or GitHub Pages. Keep relative paths and `.html` filenames intact. A custom 404 needs host configuration: GitHub Pages recognizes `404.html`; other hosts have their own error-page setting.

Do not upload `node_modules`. No build step or environment variable is required on the host if you upload the already compiled files.

Before launch, verify dates, real contact details, ticket prices, access information and a real message/booking integration. Test every page on a narrow phone and desktop. Regenerate the sharing PNG after changing its words or typography.

## Troubleshooting

### Fonts fall back to a system face

Check that each page still has the Google Fonts `<link>` tags and that a content security policy, if you add one, allows `fonts.googleapis.com` (styles) and `fonts.gstatic.com` (fonts). Offline, the system fallback in `--font-display` and `--font-sans` is used.

### New utility classes have no effect

Run `npm run build` after adding classes. Tailwind scans HTML and JavaScript under this folder. Keep dynamically selected class names written as complete literal strings, as `card()` does.

### A saved plan has disappeared

Saved performances are removed once they have started, and the planner says so. A private browser, sandboxed frame or page opened from disk may also limit saved state to one view. Download a text plan before leaving if needed.

### A request did not reach the theater

The forms show the box office's reply in the browser but don't send anything until you connect an endpoint in `submitForm()` (see Forms).

### A program filter has no results

Clear filters and search again. Date and access choices are combined, so a narrow date window can legitimately exclude a particular production. Check `SHOWS`, `PERFORMANCES` and the access flags when editing data.

### Dates are a day or an hour out

Keep `TIMEZONE` as the venue’s real zone and preserve midday UTC calendar arithmetic. The show’s hour and minute are local venue times, not UTC timestamps. Do not parse a date-only string as a local midnight and then convert it between time zones.

### Seat or ticket totals seem wrong

Prices come from `SHOWS`, with a $5 discount-ticket reduction and one $2 handling fee per non-empty request. The planner totals one standard ticket per performance and omits handling. The box office must confirm any companion places or other arrangements.

## License

MIT. See `LICENSE.txt` in the download for the terms covering the code and included artwork.
Fahkwang and Questrial are served by Google Fonts under the SIL Open Font License.
All production, room, map and portrait artwork is included. The business, people and productions are fictional.
