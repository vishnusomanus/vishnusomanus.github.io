# Stay documentation

## Overview

Stay is a complete website for a small hotel or resort, shown as **Casa Marea**, a fictional 22-room boutique
hotel in a 1903 villa above the sea in Newport, Rhode Island. It has an immersive home page with a booking bar,
filterable rooms, a room page with live prices and an availability calendar, dining menus, experiences, offers
with promo codes, a location page and a five-step booking flow. This is the **HTML + Tailwind CSS v4** version
(1.0.7): plain HTML files, one stylesheet and one vanilla JavaScript file, with no build step needed to run it.

Live demo: [freeframe.dev/templates/stay](https://freeframe.dev/templates/stay)

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Every page and feature works straight from the file system.

To preview it the way a host serves it, run any static server in the folder:

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

You only need Node.js 24 (for `npm`) if you change `src/input.css` or add Tailwind classes that aren't used yet
(see [Building and deploying](#building-and-deploying)).

## Pages

| File | Page | Notable sections and features |
|------|------|-------------------------------|
| `index.html` | Home | Hero with the booking bar, intro, three featured rooms, pool/spa/boat cards, dining, offers, reviews, location |
| `rooms.html` | Rooms & suites | Six room cards with filters by view, beds and guests; filters are kept in the URL |
| `room.html` | Room | One room chosen with `?room=<id>`: photo gallery and lightbox, details and amenities, live price, availability calendar |
| `dining.html` | Dining | Restaurant, breakfast and bar, menus in tabs, table request form |
| `experiences.html` | Experiences | Spa, sea, land and events experiences with a category filter |
| `offers.html` | Offers | Packages with promo codes and a copy button |
| `contact.html` | Location & contact | Illustrated map, getting here, contact form (prefilled from the URL), FAQ |
| `booking.html` | Booking | Five steps: dates, room, extras, guest details, review; confirmation with a reference |
| `404.html` | Not found | Friendly 404 page for your host to serve |

## Project structure

```text
stay/
├── index.html … booking.html, 404.html   one HTML file per page
├── assets/
│   ├── css/style.css     compiled Tailwind CSS (generated: don't edit by hand)
│   ├── js/main.js        all interactivity, the room/extra/offer data and the pricing rules
│   └── img/              SVG artwork, favicon.svg, og-image.svg (source) and og-image.png
├── src/input.css         Tailwind source: design tokens (@theme) and component classes
├── package.json          scripts to rebuild the CSS
├── README.md             short introduction
├── DOCS.md               this guide
├── CHANGELOG.md          version history
└── LICENSE.txt           MIT license (added to the download)
```

## Customizing

### Brand and colors

All design tokens live in the `@theme` block at the top of `src/input.css`:

| Token | Used for |
|-------|----------|
| `--color-linen` | Page background |
| `--color-shell`, `--color-sand` | Panels and deeper panels |
| `--color-line` | Borders |
| `--color-ink` | Text and dark sections |
| `--color-sea` | Secondary dark (buttons, selected states, back-to-top) |
| `--color-mist` | Muted text |
| `--color-coral`, `--color-coral-dark` | Accent (eyebrows, focus rings, errors) |
| `--color-olive`, `--color-sun` | Decorative details |
| `--color-foam` | Light text on dark backgrounds |

To change the accent:

```css
@theme {
  --color-coral: #2f6f5e;
  --color-coral-dark: #245748;
}
```

Then rebuild the CSS (`npm run build`). Keep text colors at WCAG AA contrast against the backgrounds they sit on.
A few inline styles use hex values directly (for example `accent-[#1d4b57]` on checkboxes in `booking.html`);
search for the old hex when you change `--color-sea`.

### Typography

Two Google Fonts are loaded in every page's `<head>`:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..600;1,6..96,400..500&amp;family=Jost:wght@300..600&amp;display=swap">
```

`--font-display` (Bodoni Moda, headings) and `--font-sans` (Jost, body) in `@theme` map them to the `font-display`
and `font-sans` utilities. To swap a font, change the Google Fonts link on every page and the family name in the
matching token, then rebuild the CSS.

### Content

Page copy is plain HTML in each file. The data that drives the interactive parts sits at the top of
`assets/js/main.js` in one `DATA` object:

| Key | What it holds |
|-----|---------------|
| `DATA.rooms` | Each room: `id`, `name`, `view` (`sea`, `garden` or `pool`), `bed` (`king` or `twin`), `capacity`, `size` (sq ft), `rate` (per night, US dollars), `short`, `description`, `highlights` |
| `DATA.extras` | Booking extras: `id`, `name`, `price`, `unit`, `text` |
| `DATA.promos` | Promo codes and their rules (see [Promo codes](#promo-codes)) |
| `DATA.amenities` | Amenities listed on every room page after the room's own highlights |

To add a room:

```js
{
  "id": "loft",
  "name": "Garden Loft",
  "view": "garden",
  "bed": "king",
  "capacity": 2,
  "size": 34,
  "rate": 290,
  "short": "A split-level room under the eaves.",
  "description": "…",
  "highlights": ["Mezzanine bedroom", "Garden patio", "Rain shower"]
}
```

Then:

1. Add three images to `assets/img/`: `room-loft.svg`, `room-loft-terrace.svg` and `room-loft-bath.svg` (the room
   page builds the gallery from these names).
2. Copy one of the `<article data-room-card …>` blocks in `rooms.html` and set `data-view`, `data-bed` and
   `data-capacity` to match, so the filters work. Update the link to `room.html?room=loft`.
3. Optionally add it to the featured rooms on `index.html`.

The room cards in `rooms.html` and `index.html`, the extras list in `booking.html` and the offer cards in
`offers.html` are written in HTML. When you change `DATA`, update the matching HTML so prices and names agree.
The dining menus (`dining.html`), experiences (`experiences.html`), reviews and FAQ are HTML only.

### Images and artwork

All artwork is original SVG in `assets/img/`:

| Files | Aspect ratio | Where |
|-------|--------------|-------|
| `hero-coast.svg` | 16:10 (1600 × 1000) | Home hero |
| `room-<id>.svg`, `room-<id>-terrace.svg`, `room-<id>-bath.svg` | 16:10 | Room cards, room gallery, booking flow |
| `pool.svg`, `spa.svg`, `boat.svg`, `dining.svg`, `breakfast.svg`, `bar.svg`, `events.svg` | 16:10 | Feature cards and pages |
| `map.svg` | 3:2 (1200 × 800) | Location page |
| `favicon.svg` | square | Browser tab icon |
| `og-image.svg` / `og-image.png` | 1200 × 630 | Social sharing image (SVG is the editable source) |

To use photos, export them at the same aspect ratio (1600 × 1000 works everywhere) as `.jpg` or `.webp` and change
the `src` attributes. The room page builds its gallery paths in `initRoomPage()` in `main.js`
(`'assets/img/room-' + room.id + '.svg'` and the `-terrace`/`-bath` variants); change the extension there too.
Keep meaningful `alt` text.

### Navigation, header and footer

The header, mobile menu and footer are repeated in every HTML file. To add a page:

1. Copy an existing page (for example `offers.html`) and replace the content inside `<main id="main">`.
2. Add a link to the desktop menu (`<nav aria-label="Main">`) and the mobile menu (`<nav aria-label="Mobile">`) on
   **every** page, and to the footer columns if you like.
3. Mark the current page's links with `aria-current="page"`: the styles underline the desktop link and color the
   mobile one.

A project-wide search and replace is the quickest way to change the menu on all pages.

## Features

### Booking bar

The form on the home page (`<form data-booking-bar>`) has arrival and departure dates, adults and children. In
`initBookingBar()` it:

- prefills itself from the saved draft (or two weeks from today for three nights);
- keeps departure after arrival when the arrival date changes;
- validates with `checkDates()`: arrival can't be in the past, departure must be after arrival, and stays are
  limited to `MAX_NIGHTS` (21);
- on submit, saves the stay and opens `booking.html?checkin=…&checkout=…&adults=…&children=…`.

Errors are written into the element named by each field's `aria-describedby`, and focus moves to the first problem.

### Room filters

`rooms.html` has three selects inside `<form data-room-filters>` with `data-filter="view"`, `"bed"` and `"guests"`.
`initRoomsFilter()` hides cards that don't match (`guests` keeps rooms whose `data-capacity` is at least the chosen
number), updates the live count (`[data-room-count]`, announced to screen readers) and shows the empty state
(`[data-room-empty]`) when nothing matches. The current filters are written to the URL, so
`rooms.html?view=sea&guests=3` can be shared or linked to.

### Room page

`room.html?room=<id>` shows one room. The HTML ships with the Sea View Room filled in as a fallback;
`initRoomPage()` replaces every `[data-room-field="…"]` element (name, description, rate, size, bed, capacity, view
and amenities) with the requested room's data and updates the page title. An unknown `id` falls back to the first room.

The page also lists up to three other rooms and disables adult counts above the room's `capacity`.

### Photo lightbox

The gallery buttons (`[data-gallery-open="0|1|2"]`) open a native `<dialog data-lightbox>` showing the bedroom, terrace
and bathroom images. Arrow keys and the Previous/Next buttons move between photos, Esc or a click on the backdrop closes
it, and the dialog traps focus while it's open.

### Prices

Prices are calculated by `quote(stay)` in `main.js`. The rules are constants next to the data:

| Constant | Default | Meaning |
|----------|---------|---------|
| `WEEKEND_UPLIFT` | `0.15` | Friday and Saturday nights cost 15% more |
| `EXTRA_ADULT` | `45` | Per night, for each adult beyond two |
| `EXTRA_CHILD` | `25` | Per night, for each child once the room already has two guests |
| `VAT_RATE` | `0.14` | Estimated tax added to the total: Rhode Island sales tax (7%), state hotel tax (5%) and local hotel tax (2%), as of 2026. Check current rates with the Rhode Island Division of Taxation. Shown as "Estimated sales and hotel tax (14%)"; also change that label in `breakdownHTML()` |
| `MAX_NIGHTS` | `21` | Longest stay bookable online |

How a total is built:

1. Each night costs the room `rate`, plus `WEEKEND_UPLIFT` on Fridays and Saturdays (rounded to whole dollars).
2. Extra guests are added per night.
3. Extras are added: breakfast is charged per guest per night; every other extra once per stay.
4. A valid promo code takes its percentage off the **room total only** (not extras or extra guests).
5. Tax (`VAT_RATE`) is worked out on that subtotal and added to the total. Rates and extras are shown before tax, and the breakdown says so.

`breakdownHTML()` renders the result as a list, used on the room page and in the booking summary. To change
currency, edit `money()` (it formats with `en-US` and a `$` sign).

### Availability calendar

The room page shows two months of availability (`[data-calendar]`). Booked nights are struck through and can't be chosen
as arrival; click an arrival date, then a departure date, and the price updates. A stay that runs into a booked night
is refused with a message in `[data-cal-status]`, which is announced to screen readers.

Availability comes from `isBlocked(roomId, iso)`, which returns a **deterministic demo pattern**. Replace it with a call
to your reservations system or channel manager. Because the calendar renders synchronously, the simplest approach is to
fetch the booked nights for a room once, store them in a `Set` of ISO dates, and have `isBlocked()` check that set:

```js
var BOOKED = new Set(); // fill from your API, e.g. ['2026-11-02', '2026-11-03']
function isBlocked(roomId, iso) { return BOOKED.has(roomId + ':' + iso); }
```

`firstBlocked()` uses `isBlocked()` for every night of a stay, so the room page and the booking flow follow the same data.

### Booking flow

`booking.html` is one `<form data-booking-form>` with five `<fieldset data-step="1…5">` steps. `initBooking()`:

1. **Dates and guests** — validated with `checkDates()`.
   If the guests change and the chosen room no longer sleeps them, `fitRoomToGuests()` switches to the first room
   that does (the same rule as for guests from the URL) and the summary says so ("The Sea View Room sleeps up
   to 2 guests, so we've switched you to the Marea Suite …"). If no room sleeps that many (5 or 6 guests), the
   summary shows no price, only "No room sleeps 6 guests" and a note to choose fewer guests or contact the hotel,
   and the room step lists every room as too small.
2. **Room** — rooms are listed with their price for the chosen dates; rooms that are too small or booked on any of
   the nights are disabled with the reason. The first free room is preselected.
3. **Extras** — the checkboxes in the HTML (`name="extra"`, values matching `DATA.extras` ids).
4. **Guest details** — first and last name, email and phone (validated inline), plus an arrival time and special
   requests.
5. **Review** — a summary, the promo code field and the cancellation policy checkbox.

A live summary with the full price breakdown sits beside the form. The step list marks the current step with
`aria-current="step"`, and focus moves to each step's legend. Arriving with a `room` in the URL (from a room page)
starts on step 2.

On the final submit the template shows a confirmation ("Booking received") with a reference such as `CM-7K2Q`, says
the confirmation email follows within a day, and clears the draft. The reference is made in the browser by
`makeRef('CM')`: `CM-` and four characters, with no 0/O or 1/I. **Nothing is booked until you connect it.** The place
to send the booking is marked in the submit handler:

```js
// Demo only: send `state` and the guest details to your reservations system here.
var ref = makeRef('CM');
```

Replace it with a request to your booking engine and show the reference it returns. Change the "within a day" wording
in `booking.html` to match how you actually confirm bookings. Validate prices and availability
again on your server: anything calculated in the browser can be changed by the visitor.

### Promo codes

Each entry in `DATA.promos` has:

| Field | Meaning |
|-------|---------|
| `code` | What guests type (case-insensitive) |
| `name` | Shown in messages and the price breakdown |
| `percent` | Discount off the room total |
| `minNights` | Minimum stay |
| `advanceDays` | Minimum days between today and arrival (`0` for none) |
| `rooms` | Room ids the code applies to (`[]` for all rooms) |
| `summary`, `terms` | Text for your offer cards |

`checkPromo(code, stay)` returns a clear message when a code doesn't apply ("needs a stay of at least 4 nights"). The
codes can be passed in the URL (`booking.html?promo=LONGSTAY`) and are checked on the last step. The offer cards on
`offers.html` are HTML: keep them in sync with `DATA.promos`.

### Dining menu tabs

The menus on `dining.html` are an accessible tab set (`[data-tabs]` with `role="tab"` buttons). Arrow keys move between
tabs, Home and End jump to the first and last, and only the selected tab is in the tab order. To add a menu, add a tab
button with `aria-controls` pointing at a new `role="tabpanel"` element.

### Experiences filter

The buttons with `data-exp-filter="All|Spa|Sea|Land|Events"` filter the cards by their `data-type` and update the count.
A matching hash opens a category directly, for example `experiences.html#sea`.

### Copy offer codes

Buttons with `data-copy-code="LONGSTAY"` copy the code to the clipboard and show a toast. The clipboard needs HTTPS (or
`localhost`); elsewhere the toast shows the code instead.

### Contact prefill

`contact.html?topic=events&about=boat` selects the topic and starts the message ("Hello, I'd like to ask about a private
boat to Jamestown."). The `about` keys and their wording are in `initContactPrefill()`. Topics must match the
`<option>` values of the topic select.

### Header, mobile menu and scroll reveals

- The header gains a border and shadow after you scroll.
- The menu button toggles `#mobile-menu`, updates `aria-expanded`, and Esc closes it and returns focus to the button.
- Elements with the `reveal` class fade in as they scroll into view. Revealing one element also reveals everything
  above it, so jumping to the end of a page never leaves hidden content. With reduced motion, or without JavaScript
  (the `js` class is added by a one-line script in `<head>`), everything is visible straight away.

### Back to top

The last block of `main.js` adds a "Back to top" button after the visitor scrolls about one screen. It scrolls smoothly
(instantly with reduced motion), moves keyboard focus to `<main>`, lifts itself above the toast and hides while it
would cover elements marked `data-back-to-top-hide` (the sticky booking cards). Add `data-back-to-top-avoid` to your own
fixed elements at the bottom of the screen to keep the button above them. Restyle it with the `.back-to-top` rules at
the end of `src/input.css`; to remove it, delete the block and those rules.

## Forms

| Form | Page | Validates |
|------|------|-----------|
| Booking bar (`data-booking-bar`) | `index.html` | Dates (see above) |
| Room price (`data-room-price`) | `room.html` | Dates, capacity, availability |
| Booking (`data-booking-form`) | `booking.html` | Each step (see above) |
| Table request (`data-form="table"`) | `dining.html` | Required fields, email, date from today |
| Contact (`data-form="contact"`) | `contact.html` | Name, email, message of at least 10 characters |
| Newsletter (`data-form="newsletter"`) | Footer of every page | Email |

Every `form[data-form]` is handled by `initForms()`: errors appear under each field (in the element named by
`aria-describedby`), focus moves to the first invalid field, and a success message (`[data-form-success]`) is shown.
**The forms don't send anything** until you connect them. The table request and contact confirmations show a reference
(`CM-` and four characters from `makeRef()`, filled into `[data-form-ref]`) and say the reply comes within a day, as
the contact page promises; the newsletter confirmation asks the subscriber to look out for a confirmation email.

To send them with a form service such as [Formspree](https://formspree.io), replace the comment in the submit handler of
`initForms()`:

```js
// To send for real: fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form) })
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (!res.ok) throw new Error('Request failed');
  form.reset();
  if (success) { success.classList.remove('hidden'); success.focus(); }
}).catch(function () {
  alert('Sorry, your message could not be sent. Please try again or email us.');
});
```

and remove the lines after it that reset the form and show the success message straight away. If your form service
returns its own reference, put it in `[data-form-ref]` instead, and change the reply times in the success messages to
match how you actually answer. To use different endpoints per form, branch on
`form.dataset.form` (`table`, `contact`, `newsletter`).

## Saved data (localStorage)

| Key | Shape |
|-----|-------|
| `casa-marea:booking:v1` | `{ checkin, checkout, adults, children, room, extras, promo }` — the booking in progress |

The booking bar, room page and booking flow share this draft. Every read goes through `sanitizeDraft()`:

- dates must be real `YYYY-MM-DD` dates;
- `adults` is clamped to 1–4 and `children` to 0–2, whole numbers only;
- `room` and `extras` must be known ids (duplicates are dropped);
- `promo` must be 3–20 letters or digits.

Anything invalid (including JSON that can't be parsed) is dropped and the stored value is repaired, so a corrupt or
edited value never breaks a page. Values in the URL take priority over the draft. When the booking flow restores a room that can't sleep the restored guests, guests from the URL keep
their number and get the first room that sleeps them; otherwise the guests are reduced to the room's capacity
(adults first). The draft is cleared after a confirmed
booking. To reset it by hand, run `localStorage.removeItem('casa-marea:booking:v1')` in the browser console.

## SEO and sharing

Each page has its own `<title>`, `<meta name="description">`, Open Graph tags and a `theme-color` in `<head>`. Update
them for your hotel.

`og:image` is the relative path `assets/img/og-image.png`. Social networks need an **absolute** URL, so when you deploy,
change it on every page:

```html
<meta property="og:image" content="https://www.your-hotel.com/assets/img/og-image.png">
```

Suggestions for launch:

- add a `sitemap.xml` listing your pages and a `robots.txt`;
- add [`Hotel` structured data](https://schema.org/Hotel) (JSON-LD) to `index.html` with your address, phone and price
  range;
- give `room.html?room=…` links in your navigation and sitemap so each room is crawled.

## Accessibility

Built in:

- a "Skip to content" link and landmarks (`header`, `nav`, `main`, `footer`) on every page;
- visible focus rings (`:focus-visible` in `src/input.css`);
- one `h1` per page;
- form errors linked with `aria-describedby` and `aria-invalid`, and focus moved to the first error;
- tabs, dialog and step indicators using the standard ARIA patterns (`role="tab"`, native `<dialog>`, `aria-current`);
- live regions for filter counts, calendar status and toasts;
- reduced motion respected by animations, smooth scrolling, the hero zoom and the back-to-top button;
- text colors that meet WCAG AA contrast.

When editing, keep one `h1` per page, give every new input a `<label>`, keep `alt` text meaningful, and check contrast
if you change colors.

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` is compiled and included. Rebuild it only after editing `src/input.css` or using Tailwind classes
that aren't in the HTML yet:

```sh
npm install
npm run build    # or: npm run watch while you edit
```

Tailwind scans the HTML and `main.js` for class names, so classes written in JavaScript strings are included.

### Deploying

The folder is a static site. Upload it as it is:

- **Netlify Drop:** drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **GitHub Pages:** push the files to a repository and enable Pages for the branch.
- **Cloudflare Pages / any static host:** upload the folder; no build command is needed.

Configure your host to serve `404.html` for missing pages (Netlify and GitHub Pages do this automatically). You can
leave out `src/`, `package.json` and the Markdown files when uploading.

## Troubleshooting

- **Copying an offer code shows the code instead of copying it.** The clipboard API needs HTTPS or `localhost`; opening
  the file directly (`file://`) falls back to showing the code. It works once the site is served.
- **New Tailwind classes have no effect.** The compiled CSS only contains classes that were in use when it was built. Run
  `npm run build`.
- **The room page always shows the Sea View Room.** The `room` value in the URL must match an `id` in `DATA.rooms`;
  unknown ids fall back to the first room.
- **A promo code says it isn't valid.** Check its `minNights`, `advanceDays` and `rooms` rules in `DATA.promos`; the
  message names the rule that failed.
- **Prices on the cards don't match the booking total.** Card prices are HTML; the booking uses `DATA.rooms[].rate` plus
  weekend, guest and extra charges. Update the HTML when you change rates.
- **The booking flow starts with old dates or guests.** It restores the saved draft. Clear
  `casa-marea:booking:v1` from local storage (see [Saved data](#saved-data-localstorage)).
- **Social previews show no image.** Make `og:image` an absolute URL on your domain.

## License

MIT: the full text is in `LICENSE.txt`, included in the download. You can use, change and sell sites built with this
template, including the SVG artwork. Casa Marea, its staff and its guests are fictional.
