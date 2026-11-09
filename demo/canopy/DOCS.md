# Canopy documentation

## Overview

Canopy is a complete website for a campground, RV park or cabin resort, shown as **Tamarack Pines Campground &
Cabins**, a fictional family-run campground with walk-in tent sites, RV sites and five cabins on Lake Superior,
12 miles north of Marquette, Michigan. It has a season status worked out from the opening rule, an interactive
SVG map of every site with filters, a booking calendar that prices a stay night by night, trails with elevation
profiles, guided programs, a camp store pre-order basket, rates and policies, directions and a contact form. The
look is a northwoods trail map: birch-white paper with contour lines, forest green, Lake Superior blue and
safety-orange trail blazes. This is the **HTML + Tailwind CSS v4** version (1.0.0): plain HTML files, one
stylesheet and one vanilla JavaScript file, with no build step needed to run it.

Live demo: [freeframe.dev/templates/canopy](https://freeframe.dev/templates/canopy)

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
| `index.html` | Home | Trail-map hero with the season status card and countdown, ways to stay with prices, three cabins, trails, the next three programs, camp store, guest book, "booking now" band |
| `sites.html` | Sites & cabins | Map key, filters (type, hookups, RV length, pets), the SVG campground map with a detail panel, a card for every site, the five cabins with their own artwork, amenities |
| `book.html` | Book a site | Site picker, "next free weekend", a two-month date-range calendar, party (guests, dogs, tent or RV and its length), add-ons, a live quote, and the booking request form |
| `activities.html` | Trails, paddling & programs | Five trails with a difficulty filter and elevation profiles, paddling routes and kayak prices, guided programs with a type filter, the people who lead them |
| `rates.html` | Rates & policies | Season dates, a season strip, the nightly rate table, add-ons and fees, policies (`#policies`) |
| `store.html` | Camp store | Fifteen products with categories and options, the pre-order basket, pickup details and the order success panel |
| `visit.html` | Visit & FAQ | Area map, address and directions, arrival details, what to pack, nearby places, FAQ (`<details>`) |
| `contact.html` | Contact | Contact form (topic from `?topic=`), phone numbers, office status, office hours for the season and winter, the people you'll talk to |
| `404.html` | Not found | Friendly 404 page with a compass, for your host to serve |

## Project structure

```text
canopy/
  index.html, sites.html, book.html, activities.html,
  rates.html, store.html, visit.html, contact.html, 404.html
  assets/
    css/style.css        compiled Tailwind CSS (generated, don't edit by hand)
    js/main.js           all interactions; settings and data at the top
    img/
      hero.svg           home page trail-map illustration (lake, pines, tent, cabin)
      cabin-*.svg        one illustration per cabin (agate, chickadee, osprey, balsam, trillium)
      paddle.svg         kayaks off the point (activities page)
      store-porch.svg    the camp store (store page)
      favicon.svg        tamarack roundel
      og-image.svg       social image source
      og-image.png       social image (1200x630) used by og:image
  src/input.css          Tailwind source: brand tokens and components
  package.json           npm scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
  LICENSE.txt            MIT license (in the download)
```

The campground map (`sites.html`), the area map (`visit.html`) and the 404 compass are inline SVG in the pages;
the site pins, elevation profiles, season strip and store product icons are drawn by `assets/js/main.js`.

## Customizing

### Brand and colors

The design tokens are in the `@theme` block at the top of `src/input.css`:

| Token | Value | Used for |
|-------|-------|----------|
| `--color-birch`, `--color-birch-2`, `--color-birch-3` | `#f6f4ec`, `#ebe8dc`, `#dcd8c7` | Page background, panels, deeper panels |
| `--color-bark` | `#1c2420` | Text, borders, map ink |
| `--color-lichen` | `#4c5850` | Secondary text |
| `--color-pine`, `--color-pine-2`, `--color-pine-dark` | `#1f4b37`, `#2c6249`, `#12301f` | Forest green: buttons, the quote panel, footer |
| `--color-lake`, `--color-lake-deep`, `--color-lake-light` | `#1b5c86`, `#0e3a57`, `#d5e6ef` | Lake Superior blue: dark bands, calendar selection |
| `--color-blaze` | `#f26a21` | Safety orange: main buttons (with dark text), trail blazes, decoration |
| `--color-blaze-dark` | `#b23f0a` | Orange text on light backgrounds, error messages |
| `--color-blaze-light` | `#ffcfae` | Orange text on green and blue |
| `--color-moss`, `--color-sand`, `--color-topo` | `#7f9a5c`, `#eadfbf`, `#c8d1c0` | Decoration and contour lines |

Change a value and rebuild the CSS. For example, a red-orange accent instead of safety orange:

```css
@theme {
  --color-blaze: #e5482b;
  --color-blaze-dark: #a3301a;
}
```

The contour-line backgrounds are inline SVG tiles in the `.topo` and `.topo-dark` classes; edit the stroke color
in the data URL (`%23c8d1c0`) to match a new palette. The SVG artwork uses the same colors as fixed hex values, so
edit the files in `assets/img/` (and the inline SVGs) if you change the palette a lot.

Components defined in `src/input.css` include the `btn` utility (with `btn-blaze`, `btn-pine`, `btn-lake`,
`btn-birch` and `btn-sm`), `card`, `panel`, `tag`, `chip` (filter toggles), `field`, `field-error`, `eyebrow`,
`display`, `lede`, `blaze-mark`, `step-num`, `site-pin` (map pins), `cal-day` (calendar days) and `status-dot`.

### Typography

Two Google Fonts are loaded by a `<link>` in the `<head>` of every page:

- **Arvo** (`--font-display`, class `font-display`): headings, prices, the map labels.
- **Overpass** (`--font-sans`, the body font): text, buttons, labels. Its highway-sign shapes suit a trail map.

To swap one, change the Google Fonts URL in every page's `<head>` and the matching token in `@theme`.

### Content

Text lives in the HTML files. Data that features compute with lives in constants at the top of
`assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `TIME_ZONE` | `'America/Detroit'`: every date and time uses the campground's clock, not the visitor's |
| `SEASON` | The season rule: `open` (3rd Friday of May), `close` (3rd Sunday of October, the last check-out day), `peakFrom` (June 15), `peakUntil` (Labor Day, not included), `checkIn`, `checkOut` |
| `RATE_CLASSES` | Nightly rates for `tent`, `electric` and `full` sites: `shoulder`, `peak` and the `weekend` supplement (Friday and Saturday nights) |
| `HOOKUPS`, `SITE_TYPES` | Labels for the hookup and type filters |
| `SITES` | Every site and cabin: `id`, `rate` (a `RATE_CLASSES` key or `'cabin'`), `types`, `hookups`, `maxRv` (feet), `pets`, `sleeps`, `x`/`y` on the map, `note`; cabins also have `name` and their own `rates` |
| `STAY_RULES` | `maxNights` (14), `maxDaysAhead` (540), `saturdayMinNights` (2), `maxGuests` (6; the guest menu also stops at the chosen site's `sleeps`), `maxPets`, `cabinPetFee` ($15), `taxRate` (0.06) |
| `ADDONS` | Booking add-ons: `price` and `per` (`'each'`, `'day'`, `'stay'` or `'night'`) |
| `TRAILS`, `TRAIL_LEVELS` | Trails: `miles`, `level`, `blaze` color, `surface` and `profile` (elevations in feet) |
| `PROGRAM_RULES` | Weekly guided programs: `weekday` (0 = Sunday), `time`, optional `months`, title, leader, place, price, text |
| `ONE_OFF_PROGRAMS`, `KEEP_DEMO_CURRENT` | Dated programs and the switch that rolls them forward (see [Guided programs](#guided-programs)) |
| `PROGRAM_TYPES`, `PROGRAM_WINDOW_DAYS` | Program filter labels; how many days ahead the list shows (21) |
| `PRODUCTS`, `PRODUCT_CATS`, `STORE_RULES` | Camp store items (`name`, `cat`, `price`, `text`, optional `options`), categories, the most of one item (20) |
| `OFFICE_HOURS`, `CONTACT_TOPICS`, `PHONE` | Office hours in season and in winter, allowed `?topic=` values, the phone number used in messages |
| `BASKET_KEY`, `BOOKING_KEY` | localStorage keys (see [Saved data](#saved-data-localstorage)) |

To add a site, add an entry to `SITES` with a free spot on the map (the viewBox is 1000 by 640; keep pins at
least 60 units apart):

```js
{ id: 'E9', rate: 'electric', types: ['tent', 'rv'], hookups: 'electric', maxRv: 30, pets: true, sleeps: 6, x: 210, y: 590, note: 'Quiet corner by the bog trail.' },
```

The pin, the site card, the booking select and the availability calendar pick it up automatically. Update the
counts written in the page copy ("Twenty sites and five cabins", "Compare all 25") to match.

To add a cabin, add a `SITES` entry with `rate: 'cabin'`, a `name` and `rates`, then copy one of the
`<article id="cabin-…">` blocks in `sites.html` and draw its artwork. Cabin prices on the cabin cards come from
the data through `data-rate-from="C1"`; the rate table in `rates.html` is rebuilt from the data too.

To add a store product:

```js
jerky: { name: 'Venison jerky', cat: 'food', price: 11, text: 'Smoked in Ishpeming, four ounces.' },
```

and add a drawing for it to `PRODUCT_ART` (a 64 by 64 SVG fragment) with the same key.

### Images and artwork

All artwork is SVG drawn for this template. The hero (`hero.svg`, 4:3), the cabin, paddling and store
illustrations (4:3, 800 by 600) are shown with `object-fit: cover`, so photos at the same aspect ratio drop in
with no layout change: replace the `src`, keep the `width`/`height` attributes and write a new `alt`. Images inside
an `<img>` can't use the page's fonts, which is why the illustrations have no text.

The social image is `assets/img/og-image.png` (1200 by 630), rendered from `og-image.svg`. After editing the SVG,
open it in a browser at 1200 by 630 and take a screenshot, or use any SVG-to-PNG converter. The favicon is
`assets/img/favicon.svg`; the logo in the header and footer is the same drawing inline.

### Navigation, header and footer

The header (status strip, logo, menu, "Book a site" button, mobile menu) and footer are repeated in every HTML
file. The status strip above the sticky header is an `<aside aria-label="Campground status">`, so it sits in a
landmark like everything else on the page. To add a page, copy an existing page, change its `<title>`, description and Open Graph tags, and add a link
to the `<nav aria-label="Main">` list, the mobile menu list and the footer in every file. Mark the current page's
links with `aria-current="page"`. The camp store link carries the basket count badge (`data-basket-badge`).

## Features

### Season status

`getStatus()` and `seasonState()` work out, from `SEASON` and today's date in Michigan, whether the campground is
open (`'open'`), before this year's opening (`'pre'`) or closed for the winter (`'closed'`). `initStatus()` fills
every element with these attributes:

| Attribute | Shows |
|-----------|-------|
| `data-status` | Gets `data-state="open"` or `"closed"`/`"pre"` (drives the dot color) |
| `data-status-title`, `data-status-detail`, `data-status-short` | "Open for the 2027 season" / "Now booking the 2027 season" and details |
| `data-status-countdown` | "212 days to opening day" or "94 nights left this season" |
| `data-season-year` | The year of the running or next season |
| `data-season-open`, `data-season-close`, `data-season-lastnight` | Dates of that season (`data-with-year` adds the year) |
| `data-season-range`, `data-peak-range` | "May 21 – October 17", "June 15 – September 5" |

In season the detail counts the sites free tonight from the availability data. Off season it always points at
the next season, with the year filled in, so "Now booking" never shows a past year.

### Campground map and filters

`initSitesMap()` draws a pin for every entry in `SITES` into `<g data-site-layer>` on the map in `sites.html`:
triangles for tent sites, rounded squares for RV sites (dark blue for full hookups) and little houses for
cabins. Choosing a pin (click, Enter or Space) fills the detail panel with hookups, size, rates, the next free two
nights and a "Book" link that carries the site and those dates to `book.html`.

Filters are `aria-pressed` toggles (`data-filter-type`, `data-filter-hookups`, `data-filter-pets`) and the
`#rv-length` select. Filtered-out pins dim, leave the tab order and are hidden from screen readers; the list of
site cards (`data-site-list`) and the count update. The state is kept in the URL:
`sites.html?type=rv&hookups=full&rv=40&pets=1&site=F3`. Every value is checked against the data with an own-key
lookup, so unknown values are ignored.

Keyboard: Tab moves between pins in the order of `SITES`; the arrow keys jump to the nearest visible pin in that
direction. On small screens the map scrolls sideways inside its frame so the pins stay readable: the frame is a
focusable, labeled region (arrow keys scroll it), a hint above it (`data-map-hint`) and a fade on the right edge
(`data-map-fade`) show while there is more map to the right, and choosing a site (`?site=`, a pin or "On the map")
scrolls its pin into view.

### Booking calendar and quote

`initBooking()` runs `book.html`. The site select is built from `SITES`. The calendar shows two months; days are
buttons with a price for the night once a site is chosen. Click (or Enter) an arrival day, then a departure day.
The calendar knows:

- **Closed** days: outside the season (`inSeason()`), before today or beyond `STAY_RULES.maxDaysAhead`.
- **Booked** nights for the chosen site (`isBooked()`), shown struck through. A booked night can still be your
  departure day.
- **Peak** nights (lightly tinted) and Friday and Saturday weekend prices, from `nightRate()`.

`stayError()` checks the stay: at most 14 nights, every night free and in season, and two nights minimum when the
stay includes a Saturday night. The party section checks guests against the site's `sleeps`, dogs against `pets`,
and an RV's length against `maxRv`. `quote()` groups nights by rate ("2 peak weekend nights × $62"), adds the
add-ons and the cabin pet fee, then the 6% tax. "Next free weekend" finds the next Friday-to-Sunday stay that
passes `stayError()`.

Keyboard: arrow keys move a day or a week, Home and End go to the start and end of the week, Page Up and Page Down
change month. Each day has a full label ("Friday, July 23, 2027, $62 night, peak weekend").

`book.html?site=E5&arrive=2027-07-23&depart=2027-07-25` opens with that stay selected when it is valid.

### Availability

`isBooked(siteId, day)` is demo data: a fixed pattern of three-night bookings, busier on peak weekends, so the
calendar always looks lived-in and never fully booked. Replace it with a call to your reservation system (or
return `false` to show everything as free). It is used by the calendar, the "free tonight" count and the "next
free" suggestions.

### Trails and elevation profiles

`initTrails()` draws an elevation profile for each card with `data-trail` from `TRAILS[id].profile` (`profileSvg()`:
a filled line with elevation gridlines, mile marks and an orange dot at the high point) and fills
`data-trail-gain` with the total climb. The difficulty toggles (`data-trail-level`) filter the cards and keep
`?level=` in the URL. To add a trail, add it to `TRAILS` and copy a card in `activities.html`.

### Guided programs

`programsBetween()` builds the program list from `PROGRAM_RULES` (every matching weekday in season, optionally
only in some `months`), an opening-weekend pancake breakfast on the day after opening, and `ONE_OFF_PROGRAMS`.
`upcomingPrograms()` shows the next `PROGRAM_WINDOW_DAYS` days in season; out of season it shows the opening weeks
of the next season, and near the end of a season it adds them below. The home page shows the first three
(`data-next-programs`); `activities.html` lists them all, with a type filter kept in `?type=`.

**Demo dates switch.** While `KEEP_DEMO_CURRENT` is `true`, a one-off program whose date has passed moves forward
by whole weeks (52, or 53 when 52 would drift more than three days early) until it is upcoming, so a Saturday
stays a Saturday and the demo never runs out of specials. On the day the template was built the dates are exactly
as written. For a real site, put your real dates in `ONE_OFF_PROGRAMS` and set:

```js
var KEEP_DEMO_CURRENT = false;
```

Past one-off programs then simply drop off the list. The weekly programs and the season itself are rules, so they
need no switch.

### Rates table and season strip

`initRates()` rebuilds the rate table (`data-rate-table`) from `RATE_CLASSES` and the cabins in `SITES`, and
draws the season strip (`data-season-strip`): closed months, shoulder and peak, with an orange line for today.
Elements with `data-rate-from="C1"`, `data-rate-class="tent"` or `data-addon-price="kayak"` anywhere on the site
are filled from the same data by `initRateFills()`, so prices stay in step.

### Camp store basket

`initStore()` renders the products from `PRODUCTS` (with their `PRODUCT_ART` icons) into `data-product-grid`,
with a category filter kept in `?cat=`. Products with `options` (the mug's color, the T-shirt's size) show a
select, and each option is its own basket line. The basket shows quantities with plus and minus buttons, the
subtotal, tax and total; the count badge in the header (`data-basket-count`) updates on every page.

The pickup form asks for the arrival day (it must be in season), an optional booking reference, a name and an
email, then shows an order reference (`ST-…`) and empties the basket. If a booking request was made on this
device, its arrival day, reference and first name are filled in.

### Contact topic and office hours

`initContact()` selects the topic from `?topic=` (one of `CONTACT_TOPICS`: `booking`, `cabins`, `groups`, `store`,
`access`, `other`), says whether the office is open now from `OFFICE_HOURS`, and highlights the season or winter
hours row.

### Preview another date

Add `?now=YYYY-MM-DDTHH:MM` to any page to see it at another moment in campground time, for example
`index.html?now=2027-07-15T10:00` for an in-season Thursday morning. It is handy for checking the status, the
calendar and the programs; remove `nowLocal()`'s `?now` handling if you don't want it on a live site.

### Header, mobile menu, scroll reveals and back to top

The menu button toggles `#mobile-menu` with `aria-expanded`; Esc closes it and returns focus. Elements with
`reveal` fade in as they scroll into view (everything above a revealed element is revealed too); with reduced
motion they show at once. A back-to-top button (created in `initBackToTop()`, styled by `.back-to-top`) appears
after one screen and moves focus to `#main`. The copyright year (`data-year`) is filled in by the script.

## Forms

All forms validate in the browser with messages under each field and `aria-invalid`, then show a success panel
with a reference. They are marked with `data-validate`; `data-success` names the success panel and
`data-ref-prefix` sets the reference prefix. Pages can add their own checks by listening for the `form:valid`
event (the booking and store forms use it to check the stay and the basket and to fill the success panel).

| Form | Page | Validates | Success |
|------|------|-----------|---------|
| `#book-request` | `book.html` | Name, email, optional phone, notes length; a valid site, dates and party | Reference `TP-…`, site, dates, total |
| `#pickup-form` | `store.html` | Arrival day in season, optional booking reference (`TP-` and four characters), name, email, a basket that isn't empty | Order `ST-…`, items, total, pickup day |
| `#contact-form` | `contact.html` | Name, email, optional phone, message (10 to 2000 characters) | Reference `MSG-…` |
| `#newsletter` | every page | Email | Confirmation |

Nothing is sent anywhere until you connect the forms. To use a form service such as Formspree, find the block
marked `Replace this block with a fetch() to your form service` inside `initForms()` in `assets/js/main.js` and
send the form there, showing the success panel only when the service answers OK:

```js
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (!res.ok) throw new Error('Send failed');
  success.hidden = false;
  form.hidden = true;
  success.focus();
}).catch(function () {
  announce('Sorry, that didn\u2019t send. Please call us instead.');
});
```

The booking request takes no payment; connect it to your reservation system or payment provider instead of a
form service if you want to take a deposit online. Change the success text in the HTML to match how you work.

## Saved data (localStorage)

| Key | Shape | Validated on read |
|-----|-------|-------------------|
| `canopy:basket` | `{ "firewood": 2, "tee\|L": 1 }` | Keys must be own keys of `PRODUCTS`, with an option from that product's `options` after a `\|` (and none for products without options); quantities whole numbers from 1, capped at 20. Anything else is dropped. |
| `canopy:last-booking` | `{ ref, site, arrive, depart, name }` | `ref` must match `TP-` and four characters, `site` an own key of the sites, both dates real `YYYY-MM-DD` with departure after arrival; only used if arrival is today or later |

All storage goes through one `safeStorage` object: it is `localStorage`, or an in-memory stand-in when the browser
blocks storage (a sandboxed iframe, strict privacy settings), so the basket still works for the rest of the page
view. To reset, empty the basket on the store page, or run `localStorage.removeItem('canopy:basket')` in the
browser console.

### URL parameters

| Page | Parameter | Values |
|------|-----------|--------|
| `sites.html` | `type`, `hookups`, `rv`, `pets`, `site` | `tent`/`rv`/`cabin`; `none`/`electric`/`full`; `20` to `45`; `1`; a site id |
| `book.html` | `site`, `arrive`, `depart` | A site id; `YYYY-MM-DD` dates (used only if the stay is valid) |
| `activities.html` | `level`, `type` | `easy`/`moderate`/`hard`; `nature`/`kids`/`evening`/`paddle` |
| `store.html` | `cat` | `fire`/`food`/`gear`/`gifts` |
| `contact.html` | `topic` | See `CONTACT_TOPICS` |
| any page | `now` | `YYYY-MM-DDTHH:MM`, preview date |

Every value is checked with `Object.prototype.hasOwnProperty.call()` against the data, so `?type=constructor` is
ignored.

## SEO and sharing

Every page has its own `<title>`, meta description, `theme-color`, Open Graph tags (`og:title`,
`og:description`, `og:image`, `og:locale` `en_US`) and a Twitter card, in its `<head>`. `og:image` is the relative
path `assets/img/og-image.png`; social sites need an absolute URL, so after deploying change it to e.g.
`https://www.example.com/assets/img/og-image.png` on every page.

Add a `sitemap.xml` listing the eight pages and a `robots.txt` that points to it. For richer search results you
can add `Campground` structured data (JSON-LD) to `index.html` with your address, phone, opening season, price
range and amenities.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page and logical headings.
- Visible focus outlines (lake blue on light backgrounds, pale orange on dark), AA color contrast; safety orange is
  used behind dark text or for decoration only.
- The campground map is a labeled group with a description; each pin is a focusable `role="button"` with a full
  label (site, hookups, RV length, pets) and `aria-pressed` when chosen.
- Calendar days are buttons with full date labels, `aria-pressed` for the chosen stay and `aria-disabled` for
  closed and booked nights; arrow, Home, End and Page keys move around.
- Filters use `aria-pressed` toggles; counts, quotes and results use polite live regions; errors are linked with
  `aria-describedby`.
- Elevation profiles and the season strip have text alternatives (`<title>`); decorative SVGs are `aria-hidden`.
- `prefers-reduced-motion` turns off reveals, the status pulse and smooth scrolling.

When editing, keep one `<h1>`, label every new input, and make sure every `aria-controls`, `aria-labelledby` and
`aria-describedby` points at an id on the page.

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` is compiled from `src/input.css` by Tailwind CSS v4, which scans the HTML files and
`assets/js/` for class names. With Node.js 24:

```sh
npm install
npm run build    # once
npm run watch    # rebuild on every change
```

Classes that only appear inside JavaScript strings must be written out in full in `assets/js/main.js` so
Tailwind finds them.

### Deploying

The folder is a static site. Upload it as-is to any static host: Netlify Drop (drag the folder in), GitHub
Pages, Cloudflare Pages or plain web hosting. Configure your host to serve `404.html` for missing pages. You
don't need to upload `src/`, `package.json` or the Markdown files.

## Troubleshooting

- **The status says we're closed in July.** Check `SEASON` in `assets/js/main.js`. The status uses Michigan time
  on purpose; change `TIME_ZONE` if your campground is elsewhere.
- **A site never shows as free.** The demo `isBooked()` marks a fixed pattern of nights as booked. Replace it with
  your real availability, or return `false` to show every site as free.
- **A new site's pin overlaps a label on the map.** Pins are placed by `x` and `y` in `SITES` on a 1000 by 640
  map; move it at least 60 units from other pins and labels.
- **Prices on a page don't match the calendar.** Prices come from `RATE_CLASSES`, the cabin `rates` and
  `ADDONS`; text written by hand in the pages (for example the hero cards on the home page) must be updated too.
- **New Tailwind classes have no effect.** Rebuild the CSS (`npm run build`). Classes built from pieces in JS
  (`'bg-' + color`) aren't found; write them in full.
- **The basket empties after closing the tab.** The browser is blocking storage (private mode, a sandboxed
  iframe); the site falls back to memory for that page view.
- **The social preview has no image.** Make `og:image` an absolute URL after deploying.

## License

MIT. The code and all included artwork are free for personal and commercial use; the full text is in
`LICENSE.txt`, included in the download. Arvo and Overpass are licensed under the SIL Open Font License.
Tamarack Pines Campground & Cabins, its staff, guests and programs are fictional.
