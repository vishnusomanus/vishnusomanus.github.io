# Mosaic documentation

## Overview

Mosaic is a multi-page website template for a community arts center, gallery or makers' space. The demo is
Mosaic, a fictional arts center in an old dye works on Race Street, Holyoke, Massachusetts, with classes, gigs,
film nights, family sessions, free exhibitions, room rental and volunteering. It is built with plain HTML,
Tailwind CSS v4 and vanilla JavaScript (no frameworks, no build step needed to use it). This guide covers version 1.0.6.
See the template page at [freeframe.dev/templates/mosaic](https://freeframe.dev/templates/mosaic), which links
to the live demo.

The program has no fixed dates. Every date is worked out in the browser from rules such as "every Tuesday" or
"last Friday of the month", in Eastern time, so the site is always current on any day you open it.

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Everything works from the file system, including the program, filters,
   saved events and calendar downloads.
3. Or serve the folder with any static server, for example `npx serve .`, and open the address it prints.

You only need Node 24 if you change Tailwind classes or `src/input.css` and want to rebuild
`assets/css/style.css` (see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero collage, "This week at Mosaic" (next six sessions, one per listing), eight category tiles with live date counts, the current exhibition, how it works, quote and numbers, get involved and rental teasers |
| `whats-on.html` | The program | Seven-day strip, filters (category, age, price, when, custom dates, saved only), list grouped into Today / This week / Next week / months, "Show three more weeks", winter break note |
| `event.html` | One listing | Artwork, description, included and bring lists, upcoming dates to choose from, .ics download, booking request form or drop-in note, "More like this" |
| `workshops.html` | Classes | Weekly schedule (Monday to Sunday), filterable class cards with next session, first-class steps, FAQ |
| `hire.html` | Room rental | Four rooms with floor plans, live estimate (room, date, start, hours, people, layout, extras, community discount) and inquiry form, FAQ |
| `get-involved.html` | Volunteering and support | On-page navigation, six volunteer roles, volunteer form, Friends membership tiers, teach / exhibit / start a group |
| `about.html` | Our story | Story and timeline, values, team with cut-paper portraits, how the center is funded |
| `visit.html` | Visiting | Live opening status, hours table with today highlighted, winter break note, illustrated map, getting here, access, contact form |
| `404.html` | Not found | Helpful links and artwork |

## Project structure

```text
mosaic/
  index.html, whats-on.html, event.html, workshops.html, hire.html,
  get-involved.html, about.html, visit.html, 404.html
  assets/
    css/style.css        compiled Tailwind CSS (generated; do not edit by hand)
    js/data.js           the program, rooms, hours and settings (edit this)
    js/main.js           all behavior: dates, program, artwork, filters, forms
    img/hero.svg         home page collage
    img/about.svg        about page collage
    img/favicon.svg      the tile logo
    img/og-image.svg     social image source
    img/og-image.png     social image (1200 x 630) used by og:image
  src/input.css          Tailwind source: @import "tailwindcss", @theme tokens, components
  package.json           scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

All design tokens live in the `@theme` block at the top of `src/input.css`. Tailwind turns each
`--color-*` token into utilities such as `bg-violet`, `text-vermilion-dark` or `ring-line`.

| Token | Value | Used for |
|-------|-------|----------|
| `--color-paper` | `#f8f1e4` | Page background |
| `--color-card` | `#fffaf1` | Cards and form fields |
| `--color-ink` | `#1f1d36` | Text, dark bands, footer |
| `--color-violet` | `#5b34a8` | Brand: buttons, links, Music & words |
| `--color-vermilion` | `#e0532f` | Accents, Print & drawing |
| `--color-ochre` | `#f3b23a` | Highlights, Ceramics |
| `--color-rose` | `#f2a7bf` | Textiles |
| `--color-sky` | `#8ec5e6` | Family |
| `--color-teal` | `#17685a` | Exhibitions, success messages |
| `--color-leaf` | `#7fb069` | Open studios & socials |

Each color has `-light` (and some `-dark`) partners for tag backgrounds and readable text. To change the brand
color:

```css
@theme {
  --color-violet: #0f6e8c;
  --color-violet-dark: #0b546b;
}
```

The artwork in `assets/js/main.js` uses the same colors from the `C` object (section 5); change them there too
if you re-color the site. Category tag colors come from `TONES` in the same section.

### Typography

Two Google Fonts are loaded in the `<head>` of every page:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bagel+Fat+One&amp;family=Epilogue:ital,wght@0,400..800;1,400..600&amp;display=swap">
```

- **Bagel Fat One** is the display face (`font-display`, the `h-display` and `h-section` classes).
- **Epilogue** is the text face (`font-sans`).

To swap them, change the link on each page and `--font-display` / `--font-sans` in `src/input.css`, then rebuild
the CSS. Both have system fallbacks.

### Content

Page text is in the HTML files. The program, rooms and settings are in `assets/js/data.js`, in one object,
`window.MOSAIC_DATA`:

| Constant | What it holds |
|----------|---------------|
| `CENTRE` | Name, address, phone, email and `uidDomain` (used in .ics UIDs) |
| `HOURS` | Welcome desk hours by weekday (`0` = Sunday); `null` means closed |
| `WINTER_BREAK` | The yearly closure, `{ from: { month: 12, day: 24 }, to: { month: 1, day: 1 } }` |
| `HOLIDAYS` | Holidays the building also closes for, by rule: Thanksgiving (`{ month: 11, nth: 4, day: 4 }`, the fourth Thursday of November) and the Fourth of July (`{ month: 7, date: 4 }`) |
| `CATEGORIES` | Program categories: `print`, `clay`, `textile`, `music`, `family`, `exhibition`, `film`, `studio`, each with a `label` and a color `tone` |
| `AGES` | Who a listing is for: `all`, `under5`, `kids`, `teens`, `adults` |
| `AGE_FILTERS` | The age filter options and which `AGES` each one shows |
| `PRICE_FILTERS` | The price filter options: `any`, `free`, `under10`, `pwyc` |
| `ROOMS` | Rooms in the building; rooms with `hire` (rate per hour, seated and standing capacity, size) appear on the rental page |
| `HIRE_EXTRAS` | Flat-fee extras for rentals: `projector` ($25), `pa` ($40), `kitchen` ($20), `clear` ($50) |
| `HIRE` | Rental rules: `minHours` 2, `maxHours` 10, `firstStart` 8, `lastEnd` 22, `communityDiscount` 0.3, `eveningSurcharge` 0.15 from `eveningFrom` 18 |
| `LISTINGS` | The 20 listings in the program |
| `GALLERY` | The order and length of exhibitions in the Foyer Gallery |

A listing looks like this:

```js
{
  id: 'clay-thursdays', title: 'Hand-building with clay', cat: 'clay', workshop: true,
  rule: { every: 'week', day: 4 }, start: '18:30', end: '20:30', room: 'clay-studio', host: 'Fintan Holme',
  price: 22, per: 'session', ages: 'adults', level: 'Beginners welcome', places: 10, booking: 'book',
  summary: '…', body: ['…', '…'], bring: ['…'], included: ['…']
}
```

| Field | Meaning |
|-------|---------|
| `id` | Used in URLs (`event.html?id=clay-thursdays`) and saved events; letters, numbers and hyphens |
| `cat` | A key of `CATEGORIES` |
| `workshop` | `true` to list it on `workshops.html` |
| `rule` | When it repeats (see [Date rules](#date-rules)); exhibitions have none |
| `start`, `end` | Eastern times, 24-hour `HH:MM`; the site shows them on a 12-hour clock |
| `room` | A key of `ROOMS` |
| `price`, `per`, `pwyc` | Price in dollars (`0` = free), what it is per (`session`, `child`, `ticket`, `person`), and `pwyc: true` for pay what you can |
| `ages` | A key of `AGES` |
| `places`, `booking` | Places per session, and `'book'` (shows the booking form) or `'drop-in'` |
| `summary`, `body`, `bring`, `included` | Text for cards and the event page |
| `motif` | Optional: which artwork to draw instead of the category's (see [Images and artwork](#images-and-artwork)) |

To add a listing, copy one in `LISTINGS`, give it a new `id` and edit the fields. It appears on what's on, the
home page, the event page and (with `workshop: true`) the workshops page and schedule.

### Date rules

Every date is calculated from today in Eastern time (`TIMEZONE = 'America/New_York'` in `main.js`), so the demo never
shows past events.

| Rule | Meaning |
|------|---------|
| `{ every: 'week', day: 2 }` | Every Tuesday (`0` = Sunday … `6` = Saturday) |
| `{ every: 'month', nth: [1], day: 0 }` | First Sunday of the month |
| `{ every: 'month', nth: [2, 4], day: 0 }` | Second and fourth Sunday |
| `{ every: 'month', nth: [-1], day: 5 }` | Last Friday of the month |

- No sessions are listed during `WINTER_BREAK` (December 24 to January 1) or on `HOLIDAYS`; the what's-on list
  shows a note for each closure in its range, and the visit page shows a note when the winter break is near.
- Sessions that have already finished today are hidden; the list always starts with today (or the next open
  day) and never skips the coming week.
- **Exhibitions** take turns in the Foyer Gallery. `GALLERY.anchor` (`'2026-09-26'`, a Saturday) is when the
  first run in `GALLERY.runs` opened; each run lasts its `weeks`, opens on a Saturday, closes on a Sunday, and
  the next one opens the following Saturday. The cycle repeats forever. The Friday before each opening is a
  free preview evening (`GALLERY.preview`, 6:00 to 8:00 PM).

For a real site with one-off dates, the simplest change is to keep using rules for regular sessions and add
exhibitions to `GALLERY.runs` in the order you will show them, setting `GALLERY.anchor` to the first opening day.
There is no switch to turn off: the rules are the program.

The `?now=YYYY-MM-DDTHH:MM` URL parameter (Eastern time) previews any page on another date, for example
`whats-on.html?now=2027-12-28T10:00` to see the winter break.

### Images and artwork

All artwork is SVG, drawn for this template:

- `assets/img/hero.svg` (640 x 600) on the home page and `assets/img/about.svg` (600 x 520) on the about page.
- Category artwork is drawn by `artFor()` in `main.js` from the `MOTIFS` object: one motif per category plus
  `waves`, `teapot`, `salon` (the three exhibitions), `drawing`, `zine`, `wheel` and `repair`. `MOTIF_FOR`
  assigns these to listings by id. Cards use a 4:3 box; keep that ratio if you replace it with photos.
- Any element with `data-art="<category or listing id>"` (and an optional `data-variant`) is filled with artwork
  when the page loads.
- The room floor plans, the visit page facade and map, the volunteer hands and the team portraits are inline SVG
  in the HTML.
- The social image is `assets/img/og-image.png` (1200 x 630), made from `og-image.svg`. After editing the SVG,
  regenerate the PNG with any SVG-to-PNG tool, or with Freeframe's `scripts/og-png.mjs` if you have the repo.
- The favicon is `assets/img/favicon.svg`, the same tile mark as the logo.

### Navigation, header and footer

The header and footer are repeated in every HTML file. To add a page, copy an existing page, then add a link to
the `<nav aria-label="Main">` list and the `<nav aria-label="Mobile">` list in every file. Mark the current page
with `aria-current="page"` on its link. The **Saved** button in the header links to `whats-on.html?saved=1` and
shows the saved count (`data-saved-count`).

## Features

### Program and date engine

`main.js` section 4. `occurrences(from, to, filter)` returns every session, exhibition run and preview between
two day numbers, sorted by date and time. `ruleText()` writes "Every Tuesday" or "Second and fourth Sunday of
the month", `upcoming(listing, count)` returns the next dates of one listing, and `isClosed(day)` applies the
winter break and holidays. Times are converted to real instants with `zonedToDate()` so calendar files are right in summer
and winter time.

### What's on

`initWhatsOn()`. The list shows three weeks at first (`WINDOW_STEP = 21` days); "Show three more weeks" adds
more up to `WINDOW_MAX = 84`. Results are grouped into Today, This week (the next six days), Next week, then
months. Filters:

| Control | URL parameter | Values |
|---------|---------------|--------|
| Category pills | `cat` | `all` or a `CATEGORIES` key |
| Who's it for? | `age` | `any`, `children`, `teens`, `adults` |
| Price | `price` | `any`, `free`, `under10`, `pwyc` |
| When | `when` | `any`, `today`, `week`, `weekend`, `month`, `custom` |
| From / To (when `custom`) | `from`, `to` | `YYYY-MM-DD`, today to a year ahead |
| Only saved | `saved` | `1` |

Every value is checked with an own-key test against the allowed list, and invalid dates fall back to the next
seven days, so `?cat=toString` or `?from=2026-02-31` can't break the page. The filters update the URL with
`history.replaceState`, so a filtered view can be shared. The seven-day strip sets a one-day custom range;
pressing the same day again clears it. The result count is a live region (`role="status"`).

### Event page

`initEvent()` reads `?id=` (a listing id; unknown ids show the default listing, `DEFAULT_EVENT`, with a notice)
and `?date=` (one of the next eight sessions; otherwise the next one is selected and a notice explains why).
Choosing a date updates the URL, the "Next date" panel, the booking form and the calendar download. Listings
with `booking: 'book'` show a booking request form with a live total; drop-in listings and exhibitions show a
"Just show up" note instead.

### Calendar downloads

`icsFor()` builds an iCalendar file for one date: sessions and previews with UTC start and end times,
exhibitions as all-day events for the whole run. The file name is `<id>-<date>.ics`.

### Saved events

Press **Save** on any card, row or event page. Saved ids are stored under `mosaic-saved` (see
[Saved data](#saved-data-localstorage)); the header count and every save button update together, and
`whats-on.html?saved=1` lists only saved events. Buttons use `aria-pressed`.

### Workshops

`initWorkshops()` lists every listing with `workshop: true`, with filters for type (`?type=`, a category that has
workshops) and time (`?time=any|day|evening|weekend`). Weekday sessions starting at 5:00 PM or later count as
evenings. The schedule shows every regular listing by weekday.

### Rental estimate

`initHire()` recalculates on every `input` and `change` event. Hours before `HIRE.eveningFrom` use the room
rate; later hours add `HIRE.eveningSurcharge` (15%). Extras are added, then the community discount (30%) is taken
off the total. People over the room's seated (or standing, for the Standing layout) capacity show a note that
suggests a bigger room. `?room=` preselects a room (`print-room`, `yard-room`, `snug`, `ground`). On submit the
form also checks that the date is from tomorrow, within a year and not in the winter break or on a holiday, that the room is
big enough and that the booking ends by 10:00 PM.

### Opening status

`initStatus()` fills every `[data-open-status]` ("Open now until 5:00 PM", "Closed now. Opens tomorrow at 10:00 AM")
from `HOURS` and highlights today's row in the visit page's hours table. A note about the winter break appears
on the visit page when it is less than eight weeks away.

### Get involved and visit

Volunteer role links (`data-role-link`) preselect the role in the form and update `?role=` (`welcome`,
`workshop`, `gallery`, `repair`, `crew`, `other`). The visit page's contact form reads `?topic=` (`general`,
`access`, `booking`, `press`).

### Menu, reveals and back to top

The mobile menu button toggles `#mobile-menu` (`aria-expanded`, Escape closes it and returns focus). Elements
with `.reveal` fade in as they scroll into view, and everything above a revealed element is shown too. A back to
top button appears after you scroll. All animation is switched off when the visitor prefers reduced motion.

## Forms

Every form validates in the browser with inline messages and a success state; **none of them send anything until
you connect them**. The forms are:

| Form | Page | Checks |
|------|------|--------|
| `#booking-form` | event | Date, places, name, email |
| `#hire-form` | rent a space | Room, date (tomorrow to a year ahead, not in the winter break or on a holiday), people within capacity, finish by 10:00 PM, name, email, optional phone format, message of 20+ characters |
| `#volunteer-form` | get involved | Name, email, role, at least one time (`fieldset[data-group]`), consent |
| `#friends-form` | get involved | Membership tier, email |
| `#contact-form` | visit | Name, email, message of 15+ characters |
| Newsletter (`form[data-simple-form]`) | every footer | Email |

Messages come from the field's `data-msg-required`, `data-msg-email`, `data-msg-range`, `data-msg-pattern`
attributes, or a generic message built from the field's label, so new fields work without code changes. Each
message is written into the element with `data-error="<field id>"`.

To connect a form, edit `initForm()` in `main.js` (section 11), where the success box is shown, and post the
form data to your service first. With Formspree:

```js
fetch('https://formspree.io/f/your-form-id', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (res.ok) { /* show the success box */ } else { /* show an error */ }
});
```

Give every input a `name` attribute (they already have one) so it is included in `FormData`.

Each success message confirms the request in the center's own words, says what happens next and, except for the
newsletter, shows a short reference made in the browser by `makeRef()` (`MA-` and four characters, no 0/O or 1/I).
If your booking system or form service returns its own reference, show that instead. The messages promise a reply
within two business days (bookings, room rentals and the contact form, as the rental and visit pages say), a call from the
volunteer coordinator within a week, an email link to set up a Friends membership and a confirmation email for the
newsletter: change them to match how you actually handle requests.

## Saved data (localStorage)

| Key | Shape | Validation |
|-----|-------|------------|
| `mosaic-saved` | JSON array of listing ids, e.g. `["lino-tuesdays","tide-lines"]` | Anything that isn't an array is ignored; entries that aren't strings, aren't a listing id (own-key check) or are duplicates are dropped |

All storage goes through `safeStorage`. When `localStorage` is blocked (sandboxed iframes, strict privacy
settings) it falls back to memory, so saving still works until the page is closed. To reset, run
`localStorage.removeItem('mosaic-saved')` in the browser console, or clear site data.

## SEO and sharing

Each page has its own `<title>`, meta description and Open Graph tags in its `<head>`; `event.html` updates its
title and description for the listing shown. `og:image` points at `assets/img/og-image.png`; most social sites
need an absolute URL, so change it to `https://your-domain.example/assets/img/og-image.png` when you publish. Add a
`sitemap.xml` listing each page and a `robots.txt` if your host doesn't create them. For events, you could add
schema.org `Event` structured data built from `LISTINGS`.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page and headings in order.
- `aria-current="page"` on the current navigation link; breadcrumbs on the event page.
- Visible focus outlines, AA color contrast in the tokens, `prefers-reduced-motion` respected.
- Filters and pills are real radio buttons, checkboxes and selects with labels; result counts and estimates use
  live regions.
- Save buttons and date choices use `aria-pressed`; form errors are linked with `aria-describedby` and fields get
  `aria-invalid`.
- Decorative artwork is `aria-hidden`; meaningful images and the map have text alternatives.

When editing, keep one `h1` per page, label every new input and give it a matching `data-error` element.

## Building and deploying

The compiled CSS is included, so you can deploy the folder as it is. After changing classes or `src/input.css`:

```sh
npm install
npm run build    # or: npm run watch
```

This runs Tailwind CSS v4 (`@tailwindcss/cli`) and writes `assets/css/style.css`. Then upload the folder to any
static host: Netlify Drop, GitHub Pages, Cloudflare Pages or your own server. Keep links relative (`about.html`)
so the site also works from a sub-folder.

## Troubleshooting

- **The program is empty or shows "Loading the program…"**: JavaScript is off or `assets/js/data.js` didn't
  load. Check that both scripts are present and that `data.js` is listed before `main.js`.
- **A new listing doesn't appear**: check that `cat`, `room` and `ages` are existing keys, that `rule.day` is
  0 to 6, and that `start`/`end` use `HH:MM`.
- **Dates are a day out**: the site always uses Eastern time. Change `TIMEZONE` in `main.js` if your center is
  elsewhere, and the currency in `money()`.
- **New Tailwind classes have no effect**: rebuild the CSS (`npm run build`). Classes built in JavaScript must be
  written out in full in a source file so Tailwind can find them.
- **Saved events disappear**: the browser is blocking storage, so they are only kept in memory for the page view.
- **The calendar file opens at the wrong time**: make sure the event's `start` and `end` are Eastern times; the file
  stores UTC times and calendar apps convert them.

## License

MIT. The code and all included artwork are free for personal and commercial use. See `LICENSE.txt` in the
download.

Bagel Fat One and Epilogue are licensed under the SIL Open Font License and loaded from Google Fonts.

Mosaic, its staff, program, address and contact details are fictional; the phone number and email domain are
reserved for fiction and examples.
