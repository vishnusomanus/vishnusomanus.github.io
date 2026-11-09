# Hearth documentation

## Overview

Hearth is a complete website for a country inn with a tavern or a bed and breakfast, shown as **The Fallow
Hart**, a fictional old stagecoach inn with six rooms just off the green in Woodstock, Vermont. It has a
"fire's lit" status worked out from the opening hours, rooms with seasonal prices and a stay checker, tabbed
menus with a dietary filter and a daily specials board, trails from the door with a route map, events, gift
certificates and directions. The look is rustic and warm: woodcut-style SVG artwork, cream paper, forest green and
ox-blood, a slab serif and a chalkboard. This is the **HTML + Tailwind CSS v4** version (1.0.6): plain HTML
files, one stylesheet and one vanilla JavaScript file, with no build step needed to run it.

Live demo: [freeframe.dev/templates/hearth](https://freeframe.dev/templates/hearth)

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
| `index.html` | Home | Woodcut hero with the "fire's lit" status card, a check-a-stay bar, today's hours and the next event, three rooms, food, trails, dogs, guest book, gift certificate ticket |
| `rooms.html` | Rooms and prices | Six rooms with features and a price per season, the stay checker (`#check`), the booking inquiry form and house notes |
| `food.html` | Food & drink | Menus in tabs (breakfast, lunch, dinner, Sunday roast), diet filter, chalkboard specials for today, ales on tap |
| `walks.html` | Trails from the door | Eight trails with length, difficulty and saved filters, an SVG route map, save buttons |
| `dogs.html` | Dogs & good to know | Dog policy, what's provided for dogs, FAQ (`<details>`), house rules |
| `events.html` | What's on | Upcoming events for the next 60 days, filterable by type; the regulars; barn rental |
| `vouchers.html` | Gift certificates | Certificate builder with live preview, character counter, delivery choice and total |
| `contact.html` | Contact & getting here | Contact form (topic from `?topic=`), address, opening hours with today highlighted, directions and a sketch map |
| `404.html` | Not found | Friendly 404 page for your host to serve |

## Project structure

```text
hearth/
  index.html, rooms.html, food.html, walks.html,
  dogs.html, events.html, vouchers.html, contact.html, 404.html
  assets/
    css/style.css        compiled Tailwind CSS (generated, don't edit by hand)
    js/main.js           all interactions; settings and data at the top
    img/
      hero.svg           home page woodcut (inn, hills, walls, stag)
      room-*.svg         one woodcut per room (snug, hayloft, shepherd, beck, cove, dairy)
      food.svg           pie and pint
      hearth.svg         fireplace and sleeping dog
      fiddle.svg         events artwork
      favicon.svg        stag roundel
      og-image.svg       social image source
      og-image.png       social image (1200x630) used by og:image
  src/input.css          Tailwind source: brand tokens and components
  package.json           npm scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
  LICENSE.txt            MIT license (in the download)
```

## Customizing

### Brand and colors

The design tokens are in the `@theme` block at the top of `src/input.css`:

| Token | Value | Used for |
|-------|-------|----------|
| `--color-paper` | `#f4ecdc` | Page background (cream paper) |
| `--color-paper-2`, `--color-paper-3` | `#ebdfc6`, `#ddcca9` | Panels and deeper panels |
| `--color-ink` | `#211b15` | Text, borders, printed shadows |
| `--color-muted` | `#5c5043` | Secondary text |
| `--color-forest`, `--color-forest-2`, `--color-forest-dark` | `#22402f`, ... | Status strip, green bands, footer, pressed filters |
| `--color-oxblood`, `--color-oxblood-dark` | `#7d2431`, `#5f1a24` | Accent: buttons, eyebrows, errors |
| `--color-ember` | `#d9932f` | Firelight; decorative and on dark backgrounds only |
| `--color-chalk` | `#f2ede1` | Text on green and on the chalkboard |
| `--color-board` | `#1e2622` | Chalkboard |

Change a value and rebuild the CSS. For example, a navy accent instead of ox-blood:

```css
@theme {
  --color-oxblood: #23395b;
  --color-oxblood-dark: #172840;
}
```

The paper grain is an inline SVG noise tile on `body` (in `@layer base`); delete the `background-image` line for
flat paper. The SVG artwork uses the same colors as fixed hex values, so edit the files in `assets/img/` (or the
inline SVGs in the pages) if you change the palette a lot.

Components defined in `src/input.css` include `btn` (with `btn-primary`, `btn-green`, `btn-paper`, `btn-sm`),
`card`, `panel`, `stamp`, `ticket`, `board`, `toggle`, `tab`, `field`, `field-error`, `eyebrow`, `display`,
`press` (the letterpress text shadow) and `fleuron`.

### Typography

Three Google Fonts are loaded by a `<link>` in the `<head>` of every page:

- **Zilla Slab** (`--font-display`, class `font-display`): headings, buttons, labels.
- **Alegreya** (`--font-serif`, the body font): text and italics.
- **Caveat Brush** (`--font-chalk`, class `chalk`): the specials board only.

To swap one, change the Google Fonts URL in every page's `<head>` and the matching token in `@theme`.

### Content

Text lives in the HTML files. Data that features compute with lives in constants at the top of
`assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `TIME_ZONE` | `'America/New_York'`: every clock-based feature uses the inn's time, not the visitor's |
| `HOURS` | Per weekday (`0` = Sunday): `bar` `[open, close]`, `kitchen` list of `[from, to]`, `breakfast` `[from, to]`, all `'HH:MM'` |
| `SEASONS` | `low` (Mar, Apr, Nov), `mid` (Dec to Feb, May, Jun), `high` (Jul to Oct): a `label` and its `months` |
| `ROOMS` | Per room id: `name`, `sleeps`, `dogs` (true if dogs allowed), `rates` per season in dollars, before tax |
| `ROOM_ORDER` | Room ids in display order (also used by the demo availability) |
| `STAY_RULES` | `maxNights` 14, `maxDaysAhead` 365, `saturdayMinNights` 2, `maxGuests` 4, `maxDogs` 2, `dogFee` 30 |
| `SPECIALS` | Per weekday: a list of `[dish, price]` for the chalkboard |
| `EVENT_RULES` | Recurring events: `weekday`, optional `nth` weeks of the month (`-1` = last), `time`, `title`, `price`, `text`, `type` |
| `EVENTS` | One-off events with an ISO `date`; `sameWeekday: true` keeps the weekday when the demo moves it to a later year |
| `KEEP_DEMO_CURRENT` | `true`: past one-off events come back a year later so the demo always has seasonal specials (see [Events](#events)). Set it to `false` once `EVENTS` holds your real dates |
| `EVENT_TYPES`, `EVENT_WINDOW_DAYS` | Type labels (`quiz`, `music`, `food`, `special`) and how far ahead to list (60 days) |
| `WALKS` | Per trail id: `name`, `miles`, `level`; must match the cards on `walks.html` |
| `WALK_LENGTHS`, `WALK_LEVELS` | Length buckets in miles (`short` under 4, `half` 4 to 8, `full` 8 or more) and level labels |
| `VOUCHERS`, `VOUCHER_LIMITS` | Gift certificate kinds and prices; `min` 25, `max` 1000, `messageMax` 150, `postage` 4 |
| `CONTACT_TOPICS` | Topics allowed in `contact.html?topic=` |

Room prices appear in two places: the `ROOMS` constant (used by the stay checker) and the price tables in
`rooms.html` and the "from" prices on `index.html`. Change both. To add a room:

```js
var ROOMS = {
  // ...
  barn: { name: 'The Barn Loft', sleeps: 3, dogs: true, rates: { low: 240, mid: 280, high: 335 } }
};
var ROOM_ORDER = ['snug', 'hayloft', 'shepherd', 'beck', 'cove', 'dairy', 'barn'];
```

Then copy one `<article id="room-...">` in `rooms.html`, add an `<option value="barn">` to the `#stay-room`
select, and draw or add an image.

Menus are plain HTML in `food.html`. Each dish is an `<li data-dish data-diet="...">`; the diet codes are `v`
(vegetarian), `vg` (vegan) and `gf` (gluten-free), separated by spaces. Vegan dishes carry `v vg` so they also
match the vegetarian filter:

```html
<li class="grid grid-cols-[1fr_auto] gap-x-4 border-b border-dotted border-ink/30 py-3.5" data-dish data-diet="v vg">
  <div class="min-w-0"><h4 class="inline font-display text-lg font-bold">Lentil stew</h4>
    <abbr class="diet diet-vg ml-1 align-[2px] no-underline" title="Vegan">vg</abbr>
    <p class="mt-0.5 text-muted">Smoked paprika, kale, herb dumplings</p></div>
  <p class="font-display text-lg font-bold tabular-nums">$19</p>
</li>
```

Trails are cards in `walks.html` (`<li data-walk="id" data-miles="..." data-level="...">`) plus a route path in
the map (`<path class="route" data-route="id" d="...">`), and an entry in `WALKS`. The map uses a 600 x 520
coordinate space; the inn is at about (300, 380).

Events: add one-offs to `EVENTS` with an ISO date (`'2027-05-01'`) and set `KEEP_DEMO_CURRENT = false`; past
events then drop off by themselves.

### Images and artwork

All artwork is SVG drawn for this template in a woodcut style: `hero.svg` (1200 x 800, shown at 3:2), the room
pictures and `food.svg`, `hearth.svg`, `fiddle.svg` (800 x 600, shown at 4:3). To use photos, replace the `src`
of the `<img>` and keep the aspect ratio of its frame (`aspect-[3/2]`, `aspect-[4/3]`); the `art` class crops
with `object-fit: cover`. The trail map, the getting-here map and the 404 picture are inline SVG in their pages.

The social image is `assets/img/og-image.png` (1200 x 630), made from `og-image.svg`. The favicon is
`assets/img/favicon.svg`.

### Navigation, header and footer

The header and footer are repeated in every HTML file. To add a page, copy an existing one, change its
`<title>`, description, Open Graph tags and `data-page`, then add a link to the desktop nav (`<nav
aria-label="Main">`), the mobile menu (`#mobile-menu`) and, if you like, the footer lists in every page. Mark
the current page with `aria-current="page"` on its links. The desktop nav shows from 1280px (`xl`); below that
the menu button opens `#mobile-menu`.

The green strip above the header shows the short status (`[data-status-short]`), the phone number and the place.

## Features

### Open status ("fire's lit")

`initStatus()` reads the time in `TIME_ZONE` and the day's `HOURS`, then fills:

- `[data-status-title]`: "The fire's lit" while the bar is open; "Morning at the Hart" from 5am until the bar
  opens; "The fire's banked for the night" otherwise. The site never shows a bare "Closed".
- `[data-status-detail]` and `[data-status-short]`: bar closing time and kitchen state ("Kitchen serving until
  9pm", "Kitchen opens at 6pm"), or when the bar opens next.
- `data-state` on every `[data-status]` element: `open` (a glowing ember dot) or `resting`.
- `[data-today-bar]`, `[data-today-kitchen]`, `[data-today-breakfast]`, `[data-today-name]`: today's hours on
  the home page.
- `[data-hours-day]` rows on `contact.html`: today's row gets `data-today`, `aria-current="date"` and a "Today"
  stamp.

Times use the 12-hour clock ("12 noon", "11:30pm"). The static text in the HTML is what shows without
JavaScript. The opening hours table in `contact.html` is plain HTML: keep it in step with `HOURS`.

### Check a stay (home page)

`#quick-check` on the home page validates the arrival and departure dates with the same rules as the stay
checker, then opens `rooms.html?checkin=YYYY-MM-DD&checkout=YYYY-MM-DD&guests=N#check`.

### Stay checker and prices

`initStayChecker()` drives `#stay-check` on `rooms.html`:

- **Validation** (`checkStay()`): arrival is required, a real date, not before today at the inn and at most
  `maxDaysAhead` days away; departure is after arrival and at most `maxNights` nights later. If the stay
  includes a Saturday night it must be at least `saturdayMinNights` nights ("Try leaving on Monday,
  October 26."). When a room is chosen, guests must fit (`sleeps`) and dogs must be allowed. Errors appear under
  each field with `aria-invalid`.
- **Prices** (`quote()`): each night is priced at the room's rate for that night's season, so a stay across
  October and November mixes high and low rates. The breakdown shows one line per season ("3 nights x $255 (mid
  season)") and a dog line ("1 dog x $30 per stay"), then the total before tax. Text uses the right singular or plural.
- **Availability** (`isBooked()`) is a fixed demo pattern so some rooms show "Booked on Sat, Oct 24". Replace
  it with a call to your booking system.
- With no room chosen, all six rooms are listed: available ones with prices and an "Inquire about ..." button
  that fills the inquiry form; others with the reason (too small, dog-free, booked).
- URL parameters prefill the form and show prices at once: `room` (a room id), `checkin`, `checkout`
  (`YYYY-MM-DD`), `guests` (1 to 4), `dogs` (0 to 2). Room ids are checked with
  `Object.prototype.hasOwnProperty.call(ROOMS, id)`, so `?room=constructor` is ignored.

The results area (`#stay-results`) is a polite live region and receives focus after "Check prices".

### Booking inquiry

`#enquiry` sits under the checker. `[data-enquiry-summary]` repeats the chosen stay and total. The checker and
the inquiry fields are saved as you type (see [Saved data](#saved-data-localstorage)); "Clear saved details"
(`[data-clear-draft]`) empties both forms and the saved copy. A successful send also clears it.

### Menu tabs and diet filter

`initMenu()` on `food.html` follows the ARIA tabs pattern: arrow keys, Home and End move between tabs, only the
selected tab is in the tab order. The hash selects a tab (`food.html#roast`; ids `breakfast`, `lunch`,
`dinner`, `roast`, checked against the tabs on the page). Without a hash it opens what the kitchen is serving now
at the inn: breakfast before 11am, Sunday roast on Sundays until 4pm, lunch until 5pm, dinner after.

The diet toggles (`[data-diet-filter="v|vg|gf"]`, `aria-pressed`) combine: pressing vegan and gluten-free shows
dishes that are both. Empty groups hide, `[data-menu-empty]` shows when nothing matches, and
`[data-diet-status]` announces "Showing 3 of 13 dishes on the Dinner menu."

### Specials board

`initSpecials()` writes today's `SPECIALS` (Eastern weekday) into `[data-specials]` and the day name into
`[data-specials-day]`. Prices are formatted as `$10.50` or `$36`.

### Trails: filters, map and saved trails

`initWalks()` on `walks.html`:

- Length (`[data-filter-length]`: `any`, `short`, `half`, `full`) and difficulty (`[data-filter-level]`: `any`,
  `easy`, `moderate`, `strenuous`) filter the cards; "Saved trails only" (`[data-saved-only]`) shows saved ones.
- Filters are kept in the URL as `?length=` and `?level=` (validated with own-key checks against
  `WALK_LENGTHS` and `WALK_LEVELS`), so a filtered list can be shared. `dogs.html` links to
  `walks.html?level=easy`.
- "Show on map" (`[data-show-route]`, `aria-pressed`) draws that route in ox-blood on the map; routes of
  filtered-out trails fade. `[data-map-label]` names the shown trail.
- "Save" (`[data-walk-save]`, `aria-pressed`) adds or removes a trail; the count shows in `[data-saved-count]`.
- `[data-walk-count]` reads "Showing 3 trails of 8."; `[data-walk-empty]` offers "Show all trails".

### Events

`initEvents()` builds the list for the next `EVENT_WINDOW_DAYS` days from `EVENT_RULES` and `EVENTS`, sorted by
date and time at the inn. Today's events stay listed until three hours after they start and are labeled
"Today" or "Tonight" (from 5pm); tomorrow's say "Tomorrow". The type filter (`[data-event-type]`) is kept in the
URL as `?type=quiz|music|food|special`. On the home page `[data-next-event]` shows the next event.

Demo dates: while `KEEP_DEMO_CURRENT` is `true`, a one-off event whose date has passed is moved on by whole
years until it is today or later, so the lantern walk is always on October 31 and the contra dance on December 31.
Events with `sameWeekday: true` (the bonfire, wreath workshop, carols, wassail, game supper and beer festival) move to the nearest
day with the same weekday instead, so a Saturday event stays on a Saturday. Set `KEEP_DEMO_CURRENT = false`
when you enter real dates.

Rules in the demo: Hart Trivia Night every Tuesday at 8:30pm, the folk session on the first and third Thursday at
8pm, supper club on the last Friday at 7pm.

### Gift certificates

`initVouchers()` on `vouchers.html` updates the preview ticket as you type: the certificate title (`$50` or the
experience name), recipient, sender and message, the message counter ("150 characters left", "1 character too
many") and the total (certificate plus $4 postage for a printed card). Choosing "Printed card by mail" swaps the
recipient email field for a mailing address. Dollar-amount certificates must be a whole number of dollars from $25
to $1,000. The page says certificates don't expire; federal and state rules limit gift certificate expiry, so check
current rules before you add a date.

### Contact topic

`contact.html?topic=rooms` preselects the topic (`general`, `rooms`, `table`, `events`, `vouchers`, `dogs`;
unknown values are ignored). Other pages link to it with `?topic=table`, `?topic=events` and `?topic=dogs`.

### Header, mobile menu, scroll reveals and back to top

The menu button toggles `#mobile-menu` with `aria-expanded`; Esc closes it and returns focus. Elements with
`reveal` fade in as they scroll into view (everything above a revealed element is revealed too); with reduced
motion they show at once. A back-to-top button (created in `initBackToTop()`, styled by `.back-to-top`) appears
after scrolling one screen and moves focus to `#main`.

## Forms

All forms validate in the browser with messages under each field and `aria-invalid`, then show a success panel
that confirms the request in the inn's voice. They are marked with `data-validate`, and `data-success` names the
success panel.

| Form | Page | Validates |
|------|------|-----------|
| `#stay-check` | `rooms.html` | Dates, Saturday minimum, guests and dogs for the room (see above) |
| `#quick-check` | `index.html` | Arrival and departure dates |
| `#enquiry` | `rooms.html` | Name, email, optional phone format, message length |
| `#voucher-form` | `vouchers.html` | Amount (dollar-amount certificate), to, from, message length, recipient email or mailing address, your email |
| `#contact-form` | `contact.html` | Name, email, message (10 to 2000 characters) |
| `#newsletter` | every page | Email |

To send them for real, use a form service such as Formspree. Give the form an `action`, then in
`assets/js/main.js` find the block marked `Demo only: nothing is sent` inside `initForms()` and replace it with a
request:

```js
// ---- Demo only: nothing is sent. Replace this block with a fetch() to your form service. ----
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (!res.ok) throw new Error('Send failed');
  $$('[data-success-ref]', success).forEach(function (el) { el.textContent = makeRef('FH'); }); // or your service's reference
  success.hidden = false;
  form.hidden = true;
  success.focus();
}).catch(function () {
  announce('Sorry, that didn\'t send. Please call us instead.');
});
```

The inquiry, gift certificate and contact panels show a short reference in `[data-success-ref]` (`FH-` and four
characters, made in the browser by `makeRef()`; show your form service's or booking system's own reference
instead if it returns one). The gift certificate panel's `[data-success-delivery]` line depends on the delivery choice.
The newsletter panel asks subscribers to look out for a confirmation email.

**Nothing is sent anywhere** until you connect the forms. The panels say what happens next ("we'll reply within
a day", "replies within a day with a booking link", "we'll mail the printed card first class within two
business days"): change them in the HTML (and the delivery lines in `initForms()`) to match how you actually
handle requests. The gift certificate form takes no payment; connect it to your payment provider's checkout instead of a
form service.

## Saved data (localStorage)

| Key | Shape | Validated on read |
|-----|-------|-------------------|
| `hearth:enquiry` | `{ checkin, checkout, guests, dogs, room, name, email, phone, message }` (every field optional) | Dates must be real `YYYY-MM-DD` dates, arrival not in the past, departure after arrival; `guests` an integer 1 to 4; `dogs` 0 to 2; `room` an own key of `ROOMS`; strings trimmed to 120 characters (message 1000). Anything else is dropped. |
| `hearth:saved-walks` | `["cove", "tarn"]` | Only ids that are own keys of `WALKS`, without duplicates |

URL parameters override the saved inquiry for that visit. All storage goes through one `safeStorage` object: it
is `localStorage`, or an in-memory stand-in when the browser blocks storage (a sandboxed iframe, strict privacy
settings), so saving still works for the rest of the page view. To reset, use "Clear saved details" on the rooms
page, unsave the trails, or run `localStorage.removeItem('hearth:enquiry')` in the browser console.

## SEO and sharing

Every page has its own `<title>`, meta description, `theme-color`, Open Graph tags (`og:title`,
`og:description`, `og:image`, `og:locale` `en_US`) and a Twitter card, in its `<head>`. `og:image` is the
relative path `assets/img/og-image.png`; social sites need an absolute URL, so after deploying change it to e.g.
`https://www.fallowhart.example/assets/img/og-image.png` on every page. To regenerate the PNG after editing the SVG,
open `og-image.svg` in a browser at 1200 x 630 and take a screenshot, or use any SVG-to-PNG converter.

Add a `sitemap.xml` listing the eight pages and a `robots.txt` that points to it. For richer search results you
can add `LodgingBusiness` or `BarOrPub` structured data (JSON-LD) to `index.html` with your address, phone,
opening hours and price range.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page and logical headings.
- Visible focus outlines (ox-blood on paper, amber on green), AA color contrast throughout; the ember color is
  used only on dark backgrounds or for decoration.
- ARIA patterns: tabs on the food page, toggle buttons with `aria-pressed` for filters, saves and the map,
  `aria-expanded` on the menu button, `aria-current="page"` in the nav and `aria-current="date"` on today's
  hours.
- Polite live regions for results, counts and announcements (`#live-region`); errors linked with
  `aria-describedby`.
- Inline SVG maps have a `<title>` and `<desc>`; decorative SVGs are `aria-hidden`.
- `prefers-reduced-motion` turns off reveals, the ember pulse and smooth scrolling.

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

- **The status says the fire's lit when the inn is shut.** Check `HOURS` in `assets/js/main.js`. The status
  uses Eastern time on purpose; change `TIME_ZONE` if your inn is elsewhere.
- **A room never shows as available.** The demo `isBooked()` marks a fixed pattern of nights as booked. Replace
  it with your real availability, or return `false` to show every room as free.
- **Prices in the checker don't match the room cards.** Prices live in both `ROOMS` (JavaScript) and the tables
  in `rooms.html`; update both.
- **New Tailwind classes have no effect.** Rebuild the CSS (`npm run build`). Classes built from pieces in JS
  (`'bg-' + color`) aren't found; write them in full.
- **Saved trails or the inquiry disappear after closing the tab.** The browser is blocking storage (private
  mode, a sandboxed iframe); the site falls back to memory for that page view.
- **The specials board or events show the wrong day.** They use Eastern time, so a visitor in another time zone
  can see tomorrow's board late at night. That's intended; change `TIME_ZONE` to suit.
- **The social preview has no image.** Make `og:image` an absolute URL after deploying.

## License

MIT. The code and all included artwork are free for personal and commercial use; the full text is in
`LICENSE.txt`, included in the download. Zilla Slab, Alegreya and Caveat Brush are licensed under the SIL Open
Font License. The Fallow Hart, its staff, guests and events are fictional.
