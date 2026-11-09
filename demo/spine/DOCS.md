# Spine documentation

## Overview

Spine is a bookstore website template built with plain HTML, Tailwind CSS v4 and vanilla JavaScript (no
dependencies). The demo brand is **Larchmere Books**, a fictional independent bookstore with a café corner (The
Margin) at 112 Maple Street in Burlington, Vermont, run by Odessa Merriweather and three booksellers. It sells
twenty-five books in hardcover and paperback, lists author readings, book clubs and Saturday story time with
RSVPs, runs five book clubs with monthly picks, and has a bag with free store pickup or US shipping. Every book
cover is drawn in SVG from the book data, so there are no photos to replace. This guide is for version
**1.0.5** (see `template.json` and [CHANGELOG.md](CHANGELOG.md)). The template page, with a link to the live
demo, is at [freeframe.dev/templates/spine](https://freeframe.dev/templates/spine).

All dates and opening times use the shop’s time zone, **America/New_York**, whatever the visitor’s own clock
says. Prices are in US dollars and the copy uses US spelling.

## Quick start

1. Unzip the download and open `index.html` in a browser. Everything works from the file system, including the
   bag, RSVPs and checkout.
2. Or serve the folder, which is closer to how it runs online:

   ```sh
   npx serve .
   ```

3. To change styles you need Node.js 24 or newer (see [Building and deploying](#building-and-deploying)).

Add `?now=2026-12-24T14:00` to any page to see it at another date and time (Burlington time). The preview clock
keeps ticking from there. It is handy for checking opening hours, holidays, pickup times and the events list.

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Bookshelf hero drawn from the catalog, open/closed status for shop and café, one staff pick per bookseller with a shelf-talker card, new and upcoming books, the next three author events, the café corner, the next book club meeting, a link to the reading finder |
| `shop.html` | Shop | Search, genre, format and price filters, staff-pick and new-release toggles, six sorts, result count, shareable URLs, empty state |
| `book.html` | One book (`?book=lantern-ferry`) | Drawn cover, format choice with prices, copies stepper with a limit, availability (on the shelf, order in or preorder), pickup time, staff shelf-talker, the author’s upcoming event, details, related books |
| `bag.html` | Bag and checkout | Quantity steppers, store pickup or shipping, gift wrap, free-shipping bar, sales tax, ready and arrival dates, contact and US address validation, order confirmation |
| `events.html` | Events | Author events, book clubs and story time in date order, grouped by month, type filters, seats left, RSVP form, “Your RSVPs” with cancel |
| `clubs.html` | Book clubs | Five clubs with the next meeting and its book, coming picks, a three-meetings table, a “bring your own club” card, a join form that remembers your clubs |
| `finder.html` | Find your next read | Four-question finder, one question at a time, three ranked books with reasons and add-to-bag buttons |
| `visit.html` | Visit us | Live status, map, the next seven days’ shop and café hours, usual hours, upcoming holidays, the shop’s story, four bookseller portraits, special-order and contact form |
| `404.html` | Not found | An empty slot on a shelf, a search box and links back |

## Project structure

```text
spine/
├── index.html … 404.html   the nine pages (header and footer repeated in each)
├── assets/
│   ├── css/style.css       compiled Tailwind CSS (generated: don't edit by hand)
│   ├── js/data.js          the catalog, booksellers, events, clubs and finder questions
│   ├── js/main.js          settings, dates, cover drawings, bag, pages and forms
│   └── img/
│       ├── favicon.svg     the bookshelf mark
│       ├── og-image.svg    social image source (1200 × 630)
│       └── og-image.png    social image used by og:image
├── src/input.css           Tailwind source: brand tokens and a few components
├── package.json            build and watch scripts for the CSS
├── README.md
├── DOCS.md                 this file
└── CHANGELOG.md
```

`data.js` loads before `main.js` on every page and sets `window.LARCHMERE`.

## Customizing

### Brand and colors

The colors and fonts are Tailwind theme tokens in `src/input.css`, so utilities such as `bg-pine`,
`text-vermilion-ink` or `ring-line` follow them:

| Token | Default | Used for |
|-------|---------|----------|
| `--color-paper` / `--color-leaf` / `--color-vellum` | `#f7f1e3` / `#fcf9f1` / `#eee5d0` | page background, cards and forms, quiet panels |
| `--color-line` | `#d9cdb0` | hairlines |
| `--color-ink` / `--color-muted` | `#1d2b26` / `#535f58` | text |
| `--color-pine` / `--color-pine-deep` / `--color-pine-tint` | `#17463a` / `#0f3229` / `#e1e9dc` | brand green: wordmark, shelves, secondary buttons, dark bands and footer |
| `--color-vermilion` / `--color-vermilion-deep` | `#c8401f` / `#9f3015` | main buttons, the bookmark ribbon, badges |
| `--color-vermilion-ink` / `--color-vermilion-tint` | `#b2361c` / `#f7e0d6` | vermilion text on paper, errors, tinted panels |
| `--color-ember` | `#f0714f` | vermilion on dark green (large italics) |
| `--color-brass` / `--color-brass-ink` | `#e3b25a` / `#7a5714` | small labels on dark green, “New” tags; brass as text on paper |

To change the main button color, edit the vermilion tokens and rebuild the CSS:

```css
@theme {
  --color-vermilion: #2f5d8a;
  --color-vermilion-deep: #234569;
}
```

The repeated pieces live in `@layer components`: `.btn-primary`, `.btn-pine`, `.btn-ghost`, `.btn-cream`,
`.display` (headings), `.kicker`, `.link`, `.shelf`, `.talker` (the staff shelf-talker card with its strip of
tape), form fields (`.field`, `.field-label`, `.field-error`, `.hint`), radio cards (`.option`), filter buttons
(`.chip`), `.stepper` and `.tag`. Everything else is Tailwind utilities in the HTML and in `main.js`.

Cover colors are not tokens: they belong to each book’s `cover` in `data.js` (see
[Images and artwork](#images-and-artwork)).

### Typography

Two Google Fonts, loaded with one `<link>` in the `<head>` of every page:

- **Brygada 1918** (`--font-display`): headings, the wordmark, cover titles and the italic shelf-talkers.
- **Lato** (`--font-sans`): body text, buttons, labels and the author names on covers.

To swap them, change the Google Fonts URL in each page and the two font tokens in `src/input.css`, then rebuild.
The cover drawings name the fonts in `SERIF` and `SANS` near the top of section 6 of `main.js`; change those too.

### Content

Page text is plain HTML. Data lives in two places:

| File | Constant | What it holds |
|------|----------|---------------|
| `data.js` | `GENRES` | the seven genres used by the shop filter and tags |
| `data.js` | `FORMATS` | `hardcover` and `paperback`, with a short note |
| `data.js` | `STAFF` | the four booksellers (name, first name, role, what they read) |
| `data.js` | `BOOKS` | the twenty-five books |
| `data.js` | `EVENT_TYPES`, `EVENTS` | event types and the dated author and kids’ events |
| `data.js` | `STORY_TIME`, `STORY_THEMES` | the weekly story time and its rotating themes |
| `data.js` | `CLUBS` | the five book clubs, their meeting rules and reading lists |
| `data.js` | `QUIZ` | the reading finder’s four questions |
| `main.js` | `SHOP` | name, address, phone and email used in messages |
| `main.js` | `TIMEZONE`, `LOCALE` | `'America/New_York'` and `'en-US'` |
| `main.js` | `HOURS`, `CAFE_HOURS` | shop and café hours, Sunday first |
| `main.js` | `HOLIDAYS`, `CLOSURES` | US holiday rules and one-off closures |
| `main.js` | `KEEP_DEMO_CURRENT`, `DEMO_ANCHOR`, `DEMO_RECENT_DAYS` | the demo-date switch (see [Time zone and demo dates](#time-zone-and-demo-dates)) |
| `main.js` | `NEW_RELEASE_DAYS` | how long a book counts as “New”: `60` days |
| `main.js` | `MAX_QTY` | copies of one book in one format per online order: `5` |
| `main.js` | `TAX_RATE` | sales tax on books and shipping: `0.07` |
| `main.js` | `SHIPPING` | flat rate, free-shipping threshold, packing and transit days |
| `main.js` | `ORDER_IN_DAYS`, `PICKUP_READY_MINS` | business days to order a book in; minutes to get a shelf copy ready |
| `main.js` | `EVENT_HORIZON_DAYS`, `RSVP_MAX` | how far ahead the calendar looks (`70`); seats per RSVP (`4`) |
| `main.js` | `PRICE_BANDS`, `SORTS` | the shop’s price filters and sort options |

Prices are whole cents (`2800` is $28.00). A book looks like this:

```js
{
  id: "lantern-ferry", title: "The Lantern Ferry", lines: ["The Lantern", "Ferry"], author: "Henrietta Rookwood",
  genre: "fiction", audience: "adult", pages: 344, pub: "2026-10-06",
  formats: { hardcover: 2800 }, stock: { hardcover: 9 },
  pick: "odessa", note: "A ferry captain, one last crossing, forty years of passengers…",
  moods: ["thoughtful", "cozy"],
  blurb: "On the last night of a lake ferry’s service…",
  description: "For forty-one years Edda Lusk has piloted…",
  cover: { bg: "#1f3b57", fg: "#f6e7c4", ac: "#f2a541", dk: "#132638", motif: "ferry", title: "top" }
}
```

- `id` goes in the URL (`book.html?book=lantern-ferry`); keep it short, lowercase and unique.
- `lines` is the title split into lines for the cover; keep each line under about 14 characters.
- `audience` is `adult`, `teen`, `middle` (ages 8 to 12) or `young` (ages 3 to 7); the finder and the details
  table use it.
- `formats` lists only the formats the book exists in. `stock` is copies on the shelf per format; `0` means
  “we’ll order it in” (`ORDER_IN_DAYS`). A `pub` date after today makes it a preorder.
- `pick` (a `STAFF` id) and `note` make it a staff pick with a shelf-talker. The home page shows the first pick
  of each bookseller, in `STAFF` order.
- `moods` feed the reading finder: `cozy`, `gripping`, `thoughtful`, `otherworldly`, `true`, `funny`.

To add a book, copy one, give it a new `id`, pick a `motif` and four colors. Cards in the shop, home page,
related books, bag, events, clubs and finder all come from this one array.

### Images and artwork

There are no photos. `coverArt()` in section 6 of `main.js` draws each cover at 200 × 300 from the book’s
`cover`: a background (`bg`), a motif from `MOTIFS` drawn in `fg`, `ac` and `dk`, the title lines in Brygada
1918, a short accent rule and the author’s name. `title: "top"` sets the title above the motif, `"bottom"`
below it. There are twenty-five motifs, one per book: `ferry`, `hill`, `abacus`, `windows`, `letter`, `books`,
`gull`, `bell`, `key`, `moon`, `stars`, `crown`, `lighthouse`, `rain`, `feather`, `field`, `bread`, `iceroad`,
`stones`, `bulbs`, `maple`, `moth`, `bear`, `oak` and `champ`. Each is a function returning SVG for a 200 × 150 box; add
your own to `MOTIFS` the same way.

Any element with `data-cover="book-id"` is filled with that book’s cover. The home hero’s bookshelf is
`shelfArt()` (spines sized from each book’s page count, in its cover colors); event tiles for story time are
`storyArt()`. The café, the event chairs, the club table, the signpost, the map, the shopfront, the four staff
portraits and the 404 shelf are inline SVG in their pages.

To use real cover images instead, replace the `coverArt(...)` calls in `bookCard()`, `pickCard()` and the page
functions with an `<img>`; keep the 2:3 aspect ratio the frames use.

The social image is `assets/img/og-image.png` (1200 × 630), generated from `assets/img/og-image.svg`. After
editing the SVG, convert it with any SVG-to-PNG tool, keeping the size.

### Navigation, header and footer

The header (with the shop-status bar as its first row), mobile menu and footer are repeated in every page. The
header is `sticky -top-10`, so the 2.5rem status bar scrolls away and the logo and menu row stays at the top. To add a page, copy the `<li>` in
the desktop `<nav aria-label="Main">`, the mobile `<nav aria-label="Mobile">` and, if you like, the footer, in
each file. Mark the current page’s links with `aria-current="page"`. The book page marks “Shop” as current.

## Features

### Shop clock, hours and holidays

`shopNow()` reads the time in `TIMEZONE`. From it:

- `[data-shop-status]` shows “Open now until 8pm” or “Closed now · opens tomorrow at 9am”, and
  `[data-cafe-status]` the café’s, refreshed every 30 seconds; `[data-shop-dot]` turns green or vermilion.
- `[data-hours-today]` shows today’s hours (used in the bag’s pickup note).
- `HOLIDAYS` are rules, so they work for any year: a fixed date (`{ month: 7, day: 4 }`) or the nth weekday
  (`{ month: 11, weekday: 4, nth: 4 }` is Thanksgiving; `nth: -1` is the last one). `hours: null` closes the
  shop; `['11:00', '16:00']` opens it for shorter hours. By default the shop closes on New Year’s Day,
  Independence Day, Thanksgiving and Christmas Day, and opens shorter hours on Memorial Day, Labor Day,
  Christmas Eve and New Year’s Eve.
- `CLOSURES` takes one-off dates: `{ '2027-03-15': { name: 'Stocktake', hours: null } }`.
- The visit page lists the next seven days (`#hours-week`), the usual hours (`#hours-usual`) and the next six
  holidays (`#holidays`).

### Shop filters

`initShop()` builds the filter buttons from `GENRES`, `FORMATS` and `PRICE_BANDS`. With a format chosen, the
price filter and price sorts use that format’s price; otherwise a book matches if any of its formats is in the
band. Search matches every word against the title, author, genre and blurb. “Booksellers’ order” puts staff
picks first; title sorting ignores a leading “The” or “A”. Filters are toggle buttons with `aria-pressed`, the
count is a polite live region, and the URL updates so a view can be shared (see [URL parameters](#url-parameters)).

### Book page

`book.html?book=<id>` fills the page from `BOOKS`. With no `book` parameter the page shows the first staff
pick, so the page still makes sense on its own; an unknown id (including `toString` or `__proto__`) shows a
“couldn’t find that book” panel with staff picks. The format is a radio group; price, availability, pickup time
and the URL follow it (`&format=paperback`). Copies run from 1 to `MAX_QTY` minus what is already in the bag,
and a note says when the limit is reached. If the author has an upcoming event it appears in a panel with an
RSVP link. Related books score genre first, then shared moods and audience.

### Availability and dates

- **On the shelf** (`stock` above 0): pickup is ready `PICKUP_READY_MINS` (60) after ordering during opening
  hours, rounded to the half hour, or one hour after the next opening.
- **Order in** (`stock` 0): ready in `ORDER_IN_DAYS` (3 to 5) business days. Business days are Monday to Friday,
  not holidays.
- **Preorder** (`pub` in the future): ready, or shipped, on publication day.
- **Shipping**: packed in `SHIPPING.packDays` (1) business day (plus the order-in time when needed), then 3 to 6
  business days in the mail (`SHIPPING.transit`). Orders with a preorder ship together on publication day.

### Bag and checkout

The bag (`bag.html`) lists each book and format with − and + steppers and Remove buttons; keyboard focus stays
on the same control. Store pickup is free; shipping costs `SHIPPING.flat` ($4.99), free when the books come to
`SHIPPING.freeFrom` ($45), with a progress bar. Sales tax is `TAX_RATE` (7%: Vermont’s 6% plus Burlington’s 1%
local option) on books and shipping; change it for your location. The summary lists when each kind of book will
be ready or arrive.

The checkout form validates name, email, an optional 10-digit phone and, for shipping, street, city, a
two-letter US state and a ZIP code (`12345` or `12345-6789`). Placing the order shows a confirmation with an
order number (`LB-` and five digits), what happens next and the items, saves it as the last order and empties
the bag. **No payment is taken.** To take payment, send the order to your shop system or payment provider in the
`setupValidation(form, …)` callback inside `initBag()`, where the comment says so, and show the confirmation only
when it succeeds. The header badge and its `aria-label` (“Bag, 3 books”) update on every page and in other tabs.

### Events calendar and RSVPs

`allEvents()` merges three sources, keeps those that haven’t ended within `EVENT_HORIZON_DAYS` (70) and sorts
them by date and time:

| Source | Rule |
|--------|------|
| `EVENTS` | dated author events and kids’ events (moved forward by `KEEP_DEMO_CURRENT`) |
| `STORY_TIME` | every Saturday at 10:30am, unless the shop is closed or a kids’ event is booked that morning; the theme rotates through `STORY_THEMES` week by week |
| `CLUBS` | each club’s next four meetings, titled with that month’s book |

The list is grouped by month with sticky month headings; the type chips filter it (`?type=`). Each event shows
the book’s cover (or a story-time tile), its time and seats left. Seats taken by other people come from
`seatsLeft()`, a stable demo number per event that never takes more than 70% of the seats; replace it with your
booking system’s numbers. RSVP buttons fill the form in the sidebar; an RSVP saves up to `RSVP_MAX` (4) seats with
a reference (`EV-` and four digits), marks the event “You’re going” and appears in “Your RSVPs”, where it can be
canceled.

RSVP keys are stable: `e:<event id>` for `EVENTS`, `story:<date>` for story time and `club:<club id>:<date>` for a
club meeting. Each RSVP also stores the `date` of the occurrence it was made for. When `KEEP_DEMO_CURRENT` moves
the events forward a week, an event with an RSVP stays on the date it was booked for until that occurrence has
ended; then the RSVP is dropped and the event moves on with the others.

Event `title` and `blurb` (and any `STORY_THEMES` entry) can be a string or an object with `winter`, `spring`,
`summer` and `fall` wording; `seasonal()` in `main.js` picks the one for the season of the date shown (December to
February is winter, and so on). Use it for anything that mentions the weather, a holiday or seasonal food, because
the demo shift can show a December event in July.

### Book clubs

Each club in `CLUBS` meets on the `nth` (1 to 4) `day` (0 = Sunday) of the month from `start` to `end`; a meeting
on a holiday moves a week later (`clubDate()`). The book for a meeting is
`picks[(year * 12 + month) % picks.length]`, so the list never runs out; if that book isn’t published by the
meeting, the next one on the list is used (`clubPick()`). The page shows each club’s next meeting, its book and
the two after, plus a table of every club’s next three meetings. The join form needs at least one club, saves
the chosen clubs, marks those cards “You’re a member” and shows a reference (`BC-` and four digits).

### Reading finder

`initFinder()` builds four steps from `QUIZ`. Books for the chosen audience are scored: mood match +3 (+1 more
if it’s the book’s first mood), length in range +2 (adult and teen books only), the chosen format +1 or −2 if the
book doesn’t come in it, staff pick +0.6 and new or upcoming +0.2. The top three are shown with up to three
reasons. When an audience has fewer than three books, the nearest audiences fill the gaps (`ADJACENT`). Answers
are saved, so returning to the page shows the same results until “Start again”.

### Back to top

A square button appears after about a screen of scrolling and returns to the top, moving focus to the main
content. Remove the “Back to top” block at the end of `main.js` and the `.back-to-top` styles in
`src/input.css` to drop it.

## URL parameters

| Page | Parameter | Values |
|------|-----------|--------|
| any | `now` | `YYYY-MM-DDTHH:MM`, Burlington time: preview the site at that moment |
| `shop.html` | `genre` | `fiction`, `mystery`, `speculative`, `poetry`, `nonfiction`, `teen`, `kids` |
| `shop.html` | `format` | `hardcover`, `paperback` |
| `shop.html` | `price` | `under20`, `20to30`, `over30` |
| `shop.html` | `picks`, `new` | `1`: staff picks only, new and upcoming only |
| `shop.html` | `q` | search text |
| `shop.html` | `sort` | `featured`, `newest`, `price-asc`, `price-desc`, `title`, `author` |
| `book.html` | `book` | a book `id` (without it, the first staff pick) |
| `book.html` | `format` | a format the book comes in |
| `events.html` | `type` | `author`, `club`, `kids` |

Every value is checked with an own-key lookup (`Object.prototype.hasOwnProperty.call`, the `has()` helper), so
values such as `toString` or `__proto__` fall back to the default.

## Forms

| Form | Where | Validates | Finishes with |
|------|-------|-----------|---------------|
| Checkout | `bag.html` | name, email, optional phone, US address for shipping | order number `LB-12345` |
| RSVP | `events.html` | event, name, email, seats (up to the seats left) | reference `EV-1234` |
| Join a club | `clubs.html` | name, email, at least one club | reference `BC-1234` |
| Special order / contact | `visit.html` | name, email, topic, book title for special orders, message up to 800 characters | reference `SO-1234` or `LM-1234` |
| Newsletter | footer of every page | email | a thank-you panel |

Errors appear under each field (`aria-invalid` and `aria-describedby`), focus moves to the first problem and a
success message replaces or follows the form. **The forms don’t send anything until you connect them.** To use a
form service such as Formspree, send the form in the `setupValidation(form, …)` callback and show the success
state only when it answers OK. For the contact form, in `initVisit()`:

```js
setupValidation(form, () => {
  fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    .then((r) => r.ok ? successSwap(form, '<p class="display text-[2rem]">Thanks.</p>') : alert('Sorry, that didn’t send.'));
});
```

The newsletter is in `initForms()`, RSVPs in `initEvents()`, the club form in `initClubs()` and the checkout in
`initBag()`.

## Saved data (localStorage)

All saved data goes through `safeStorage`, which falls back to memory when the browser blocks `localStorage` (a
sandboxed iframe or strict privacy settings), so the bag, RSVPs and clubs still work for that page view.

| Key | Shape | Checked on read |
|-----|-------|-----------------|
| `spine-bag` | `{ lines: [{ id, format, qty }], method: 'pickup' \| 'ship', gift: boolean }` | unknown books or formats are dropped, quantities clamped to 1–5, duplicates merged, at most 40 lines |
| `spine-last-order` | `{ ref, total, method, items: [{ title, format, qty }] }` | written on checkout only |
| `spine-rsvps` | `[{ key, date, seats, name, ref }]` | RSVPs for unknown events or for an occurrence that has ended are dropped and the list is written back; seats clamped to 1–4 |
| `spine-clubs` | `['fiction', 'mystery', …]` | unknown club ids and duplicates are dropped |
| `spine-finder` | `{ for, mood, time, format }` (option ids) | used only when every answer is a real option of its question |

To reset, run `localStorage.removeItem('spine-bag')` (or another key) in the browser console, or clear the site’s
data.

## Time zone and demo dates

Everything dated is computed in `America/New_York`.

- **Author events and recent publication dates** are real dates written around `DEMO_ANCHOR`
  (`'2026-10-21'`). While `KEEP_DEMO_CURRENT` is `true`, they move forward by the whole weeks since the anchor
  (`SHIFT_DAYS`), so weekdays never change, a Thursday reading stays on a Thursday, and the demo always has new
  releases, preorders and upcoming events. Books published up to `DEMO_RECENT_DAYS` (70) before the anchor move
  too; older books keep their dates. A moved event that lands on a holiday skips a week. On the anchor’s own week
  the page shows exactly the dates written in `data.js`.
- **Story time, book clubs, holidays, pickup and shipping dates** come from rules, so they never go stale.
- The copyright year fills itself in (`[data-year]`).

For a real shop with real dates, set `KEEP_DEMO_CURRENT = false` in `main.js` and enter your events in `EVENTS`:
past events then drop off the calendar on their own, and books stay “New” for `NEW_RELEASE_DAYS` after their
`pub` date. The stock numbers and `seatsLeft()` are demo data; replace them with your own.

## SEO and sharing

Each page has its own `<title>`, meta description and Open Graph tags in the `<head>`. The book page updates its
title and description from the book. `og:image` points at `assets/img/og-image.png`; social sites need an
absolute URL, so change it to your domain when you publish (for example
`https://larchmerebooks.example/assets/img/og-image.png`). Add a `sitemap.xml` listing the pages and a
`robots.txt` if your host doesn’t make them. `schema.org/BookStore` on the visit page and `schema.org/Book` on
the book page (built from the same `BOOKS` entry) are good additions.

## Accessibility

- Skip link, landmarks, one `<h1>` per page, labeled navigation (`Main`, `Mobile`, `Breadcrumb`, footer).
- The menu button has `aria-expanded`, `aria-controls` and a label that changes to “Close menu”; Escape closes it
  and returns focus.
- Filters and event types are toggle buttons with `aria-pressed`; formats, pickup or shipping and finder answers
  are real radio buttons styled as cards, with visible focus.
- Result counts, quantities, form status and the toast are announced through live regions; after an order, RSVP
  or club sign-up, focus moves to the confirmation.
- Covers on the book page have a text label (“Cover of The Lantern Ferry by Henrietta Rookwood”); covers next to
  a visible title are decorative. Add buttons carry the book title in screen-reader text.
- Text meets WCAG AA contrast in every state; `prefers-reduced-motion` turns off the scroll reveals, the cover
  tilt, the steam and smooth scrolling.

When editing, keep one `<h1>` per page, give new inputs a `<label>`, and keep `aria-controls`,
`aria-labelledby` and `aria-describedby` pointing at ids that exist.

## Building and deploying

The compiled CSS is included, so you only rebuild after adding or changing Tailwind classes:

```sh
npm install
npm run build     # one-off, minified
npm run watch     # rebuild on save
```

Tailwind finds classes in the HTML and in `assets/js/*.js`. Write class names as whole strings in the JavaScript
(not built from pieces), or they won’t be generated.

Upload the folder to any static host: Netlify Drop, Cloudflare Pages, GitHub Pages or plain web hosting. There is
no server code. `src/`, `package.json` and `node_modules/` aren’t needed online.

## Troubleshooting

- **A new color or class has no effect.** Rebuild the CSS (`npm run build`). If the class is only in `main.js`,
  check it is written out in full.
- **The bag empties on every page.** The browser is blocking storage (private mode in some browsers, or the page
  is in a sandboxed iframe). The bag then lasts for one page view; serve the site normally.
- **Events show the wrong dates after you entered real ones.** Turn `KEEP_DEMO_CURRENT` off, or every date moves
  forward by the weeks since `DEMO_ANCHOR`.
- **A book link shows “We couldn’t find that book”.** The `book` value must match an `id` in `BOOKS` exactly.
- **A cover title runs off the edge.** Split it into shorter `lines`; the size is worked out from the longest line.
- **Hours look wrong on a holiday.** Check the rule in `HOLIDAYS` and preview with `?now=2026-11-26T12:00`.
- **The social preview has no image.** Use an absolute URL in `og:image` on the live site.

## License

MIT. The code and all included artwork are free for personal and commercial use. The full license text is in
`LICENSE.txt`, which is added to the download. Brygada 1918 and Lato are licensed under the SIL Open Font
License. Larchmere Books, its booksellers, authors, books and address details are fictional.
