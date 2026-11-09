# Glaze documentation

## Overview

Glaze is a shop website for a small pottery studio, built with plain HTML, Tailwind CSS v4 and vanilla
JavaScript (no dependencies). The demo brand is **Vennick Clay**, a fictional studio and shop at 228 N Mesquite Street in
Las Cruces, New Mexico, run by Celandine Vennick and Tobi Akintola. It sells twelve stoneware pieces in five
glazes, books workshops, and has a checkout with shipping or pickup. Every pot is drawn in SVG from the
product data, so the drawing changes when a visitor picks another glaze or size. This guide is for version
**1.0.5** (see `template.json` and [CHANGELOG.md](CHANGELOG.md)). The template page, with a link to the live
demo, is at [freeframe.dev/templates/glaze](https://freeframe.dev/templates/glaze).

All dates and opening times use the studio’s time zone, **America/Denver** (Mountain time), whatever the visitor’s own clock
says. Prices are in US dollars and exclude tax; the cart and checkout say “plus applicable tax” and don’t calculate it.

## Quick start

1. Unzip the download and open `index.html` in a browser. Everything works from the file system, including
   the cart and checkout.
2. Or serve the folder, which is closer to how it runs online:

   ```sh
   npx serve .
   ```

3. To change styles you need Node.js 24 or newer (see [Building and deploying](#building-and-deploying)).

Add `?now=2026-12-23T16:00` to any page to see it at another date and time (Mountain time). The preview clock
keeps ticking from there. It is handy for checking opening hours, holiday closures and workshop dates.

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Still life drawn from the pottery shapes, four featured pieces, shop by shape, the next kiln-opening Saturday, the next workshop dates with spaces, studio story, quote |
| `shop.html` | Shop | Shape, glaze and “ready to ship” filters, sorting, result count, shareable URLs, empty state |
| `product.html` | One piece (`?piece=ripple`) | Glaze and size choices, price, quantity with a limit that says so, stock per glaze, delivery and collection dates, details, related pieces |
| `workshops.html` | Workshops | Three workshops, booking form with rolling dates and spots left, number of people, FAQ |
| `basket.html` | Cart | Pottery and workshop spots, quantity steppers, shipping or pickup, free-shipping progress, arrival dates |
| `checkout.html` | Checkout | Contact details, shipping address with state and ZIP code rules, or pickup, workshop names, gift option, order confirmation |
| `studio.html` | The studio | Story, how a piece is made (six steps), the five glazes, the people |
| `care.html` | Care and shipping | Care advice, glaze-by-glaze guide, shipping table with live dates, returns and breakages |
| `contact.html` | Visit and contact | Live open or closed status, the next seven days’ hours, kiln-opening Saturdays, map, contact form |
| `404.html` | Not found | A cracked bowl mended with gold, links back |

## Project structure

```text
glaze/
├── index.html … 404.html   the ten pages (header and footer repeated in each)
├── assets/
│   ├── css/style.css       compiled Tailwind CSS (generated: don't edit by hand)
│   ├── js/main.js          all data and behavior: pieces, glazes, workshops, dates, cart, forms
│   └── img/
│       ├── favicon.svg     the pot mark
│       ├── og-image.svg    social image source (1200 × 630)
│       └── og-image.png    social image used by og:image
├── src/input.css           Tailwind source: brand tokens and a few components
├── package.json            build and watch scripts for the CSS
├── README.md
├── DOCS.md                 this file
└── CHANGELOG.md
```

## Customizing

### Brand and colors

The colors and fonts are Tailwind theme tokens in `src/input.css`, so every utility such as `bg-clay`,
`text-cobalt` or `ring-line` follows them:

| Token | Default | Used for |
|-------|---------|----------|
| `--color-paper` | `#f5f0e6` | page background |
| `--color-bisque` / `--color-sand` | `#ece3d2` / `#e0d2ba` | panels and art tiles |
| `--color-line` | `#d8cbb4` | hairlines |
| `--color-ink` / `--color-muted` | `#29271f` / `#5f5749` | text |
| `--color-clay` / `--color-clay-deep` / `--color-clay-tint` | `#a4472d` / `#803520` / `#f2ddd0` | brand: wordmark, italics, kiln band, errors |
| `--color-cobalt` / `--color-cobalt-deep` / `--color-cobalt-tint` | `#2a46a8` / `#1d3281` / `#e1e6f5` | buttons, links, selected options |
| `--color-moss` / `--color-moss-tint` | `#56653a` / `#e3e7d1` | “ready to ship”, confirmations |
| `--color-kiln` | `#2a2822` | dark bands and footer |

To change the main button color, edit the cobalt tokens and rebuild the CSS:

```css
@theme {
  --color-cobalt: #2f6f5e;
  --color-cobalt-deep: #23564a;
  --color-cobalt-tint: #dff0ea;
}
```

The few repeated pieces live in `@layer components`: `.btn-primary`, `.btn-ghost`, `.btn-paper`,
`.btn-clay`, `.display` (headings), `.kicker`, `.link`, form fields (`.field`, `.field-label`,
`.field-error`, `.hint`), radio cards (`.option`), filter buttons (`.pill`), `.stepper`, `.swatch` and
`.tag`. Everything else is Tailwind utilities in the HTML.

The pot colors are not tokens: they belong to each glaze in `GLAZES` in `assets/js/main.js` (see
[Images and artwork](#images-and-artwork)).

### Typography

Two Google Fonts, loaded with one `<link>` in the `<head>` of every page:

- **Petrona** (`--font-display`): headings, the wordmark and the big italics.
- **Red Hat Text** (`--font-sans`): body text, buttons and labels.

To swap them, change the Google Fonts URL in each page and the two font tokens in `src/input.css`, then
rebuild. Both tokens end in system fallbacks, so the site still reads well if the fonts fail to load.

### Content

Page text is plain HTML. Data and rules are constants at the top of `assets/js/main.js`, in numbered
sections:

| Constant | What it holds |
|----------|---------------|
| `SHOP` | name, address, phone and email used in messages |
| `TIMEZONE` | `'America/Denver'`: every date and time is worked out here |
| `HOURS` | opening hours, Sunday first: `['10:00', '17:00']` or `null` for closed |
| `CLOSED_DATES` | extra days closed every year, as `'MM-DD'` (shop, workshops, shipping and pickup); US federal holidays are closed too, by rule, in `federalHolidays(year)` |
| `KILN_OPENING` | the kiln-opening Saturday: `weekday` and the early `open` time |
| `GLAZES`, `GLAZE_ORDER` | the five glazes: name, note, colors, tile class, care flags |
| `CATEGORIES` | the five shapes used by the shop filter |
| `SORTS` | the sort options |
| `PRODUCTS` | the twelve pieces |
| `MADE_BY` | how a piece is formed, shown under “Made” |
| `MAX_QTY` | the most of one piece (one glaze and size) per order online: `6` |
| `DELIVERY` | shipping fee, free-shipping threshold, remote fee, packing and transit days |
| `MADE_TO_ORDER_DAYS` | business days to make a piece that isn’t in stock: `15` |
| `REMOTE_POSTCODES`, `NO_POST` | ZIP code prefixes (first three digits) with the remote fee, and ones you can’t ship to |
| `WORKSHOPS`, `WORKSHOP_ORDER` | the workshops and their date rules |
| `RHYTHM_ANCHOR`, `BOOKING_LEAD_DAYS`, `WORKSHOP_HORIZON_DAYS`, `WORKSHOP_MAX_PLACES` | workshop date settings |
| `DEMO_FULL_PERCENT` | demo availability (see [Workshops](#workshop-booking)) |

A piece looks like this:

```js
{ id: 'ripple', name: 'Ripple breakfast bowl', category: 'bowls', shape: 'bowl', price: 36, featured: 1,
  glazes: ['oat', 'cobalt', 'moss'], stock: { oat: 5, cobalt: 2, moss: 0 },
  sizes: [{ id: 'cereal', label: 'Cereal', detail: '6 in across, holds 16 oz', add: 0, scale: 0.88 },
          { id: 'breakfast', label: 'Breakfast', detail: '6¾ in across, holds 22 oz', add: 8, scale: 1 }],
  blurb: 'A wide, rippled bowl for oatmeal, peaches and everything after.',
  description: 'Thrown in one pull and trimmed with a soft foot…' }
```

- `id` goes in the URL (`product.html?piece=ripple`); keep it short, lowercase and unique.
- `price` is the first size’s price in dollars; each size’s `add` is added on top. A piece with one size still
  needs one entry in `sizes`.
- `scale` draws a size larger or smaller; `count` draws two, three or six pots (pairs and sets).
- `stock` is pieces ready to ship per glaze. `0` means made to order (about three weeks).
- `shape` picks the drawing: `bowl`, `pasta`, `pinch`, `mug`, `beaker`, `espresso`, `plate`, `platter`,
  `jug`, `teapot`, `budvase` or `vessel`.
- `featured` puts a piece on the home page, in that order (`0` = not featured). Keep it to four.
- `made` (optional) is a key of `MADE_BY`; pieces without it are “thrown on the wheel”.

To add a piece, copy one, give it a new `id`, and list only glazes that exist in `GLAZES`. Cards on the home
page, shop, related pieces, cart and checkout all come from this one array; there are no static product
cards to update.

### Images and artwork

There are no photos. The pots are drawn by `potArt()` in section 7 of `main.js` from the piece’s `shape` and
the chosen glaze: a body path filled with the glaze’s three `body` colors, `rim` and `inside` colors, iron
`speckle` dots (or `null`), and an unglazed foot in `CLAY_BODY`. The drawings have no background of their own;
the tile behind each pot takes the glaze’s `tile` class (`bg-bisque`, `bg-cobalt-tint`…). To add a glaze, add
an entry to `GLAZES` and its id to `GLAZE_ORDER`, then list it on the pieces that come in it.

To use photographs instead, replace the `potArt(...)` call in `productCard()` and on the product page with an
`<img>`; keep the tiles’ aspect ratio (6:5 on the shop and product pages, square on phones) and use
transparent or light-background photos. Elements with `data-art="ripple"` (plus optional `data-glaze` and
`data-size`) are filled with a drawing anywhere you put them.

The home still life is `sceneArt()`, the 404 bowl `brokenArt()`. The studio portrait, the wheel, the kiln and
the map are inline SVG in `studio.html`, `index.html` and `contact.html`.

The social image is `assets/img/og-image.png` (1200 × 630), generated from `assets/img/og-image.svg`. After
editing the SVG, convert it with any SVG-to-PNG tool, keeping the size.

### Navigation, header and footer

The header (with the kiln-opening bar above it), mobile menu and footer are repeated in every page. To add a
page, copy the `<li>` in the desktop `<nav aria-label="Main">`, the mobile `<nav aria-label="Mobile">` and,
if you like, the footer, in each file. Mark the current page’s links with `aria-current="page"`.

## Features

### Studio clock, opening hours and kiln-opening Saturdays

`shopNow()` reads the time in `TIMEZONE`. From it:

- `[data-studio-status]` shows “Open now until 5pm” or “Closed now · opens Thursday at 10am”, refreshed
  every 30 seconds, with a green or clay `[data-studio-dot]`.
- `[data-hours]` (contact page) lists the next seven days, marking kiln-opening Saturdays and closures.
- The kiln-opening Saturday is the **first Saturday of every month** (`KILN_OPENING`), opening at 9am, skipped
  when it falls on a `CLOSED_DATES` day. `[data-kiln-next]`, `[data-kiln-next-short]` and `[data-kiln-list]`
  (the next four) show the dates.

### Shop filters

`initShop()` builds the shape and glaze filter buttons from `CATEGORIES` and `GLAZES`. “Ready to ship”
keeps pieces with stock in the chosen glaze (or any glaze). The cards then show the chosen glaze. Filters are
toggle buttons with `aria-pressed`, the count is a polite live region, and the URL updates so a filtered view
can be shared (see [URL parameters](#url-parameters)). An odd last card in the two-column phone grid spans
both columns.

### Product page

`product.html?piece=<id>` fills the page from `PRODUCTS`. Glaze and size are radio cards; the price, drawing,
care note, stock line and delivery estimate follow them, and the URL keeps `glaze` and `size`. Quantity runs
from 1 to `MAX_QTY`; at the limit the plus button is disabled and a note says why, and adding beyond the
limit (on a card or the product page) shows a message instead of quietly stopping. If the quantity is more
than the stock, the page says the rest are made to order and the delivery date moves. Related pieces are
worked out by `relatedTo()`: same shape first, then pieces sharing a glaze, never the piece itself. An unknown
`piece` (including `toString` or `__proto__`) shows a “couldn’t find that piece” message.

### Shipping and pickup dates

Dates are worked out from today in Mountain time:

- A piece in stock ships `DELIVERY.dispatchDays` (2) business days from today and arrives 2 to 5
  business days later (`transitDays`). Business days are Monday to Friday, not closed dates.
- Made-to-order pieces ship after `MADE_TO_ORDER_DAYS` (15) business days.
- Alaska and Hawaii (`REMOTE_POSTCODES`) take up to three days longer (`remoteExtraDays`) and cost
  `DELIVERY.remoteFee` ($28).
- Pickup is free from the first opening day at least `collectReadyDays` (2) days ahead, or after the
  made-to-order time.
- Shipping to the Lower 48 states and DC is `DELIVERY.fee` ($12), free when the pottery comes to
  `DELIVERY.freeFrom` ($125). Workshop spots don’t count toward it and need no shipping.

### Workshop booking

Sessions come from a rule, never a list of dates, so the page is always current:

| Workshop | Rule | Sessions listed |
|----------|------|-----------------|
| `taster` Wheel intro, $75 | every Sunday at 10am and 2pm (`rule: 'weekly'`) | next 8 |
| `handbuild` Hand-building evening, $60 | every other Wednesday at 6:30pm (`'fortnightly'`, in step with `RHYTHM_ANCHOR`) | next 5 |
| `course` Six-week wheel course, $325 | the first Tuesday of each month at 6:30pm (`'first'`) | next 3 |

Sessions start `BOOKING_LEAD_DAYS` (2) days from today and skip closed dates. Spots left come from
`placesTaken()`, a stable pseudo-random number per session; `DEMO_FULL_PERCENT` (14) of sessions show as full.
Replace `placesTaken()` with your booking system’s numbers for a real site. Spots already in the cart are
taken off, and a booking is up to `WORKSHOP_MAX_PLACES` (4) people. Spots go into the cart next to any
pottery; a session that has passed is removed from the cart with a notice.

### Cart

The cart (`basket.html`) lists pottery and workshop spots with − and + steppers and Remove buttons.
Keyboard focus stays on the same control after a change, or moves to the next line. The summary has a
shipping or pickup choice, a free-shipping progress bar and the arrival or pickup date. The header
badge and its `aria-label` (“Cart, 3 items”) update on every page, and in other tabs through the `storage`
event.

### Checkout

`checkout.html` validates name, email, optional phone and, for shipping, the address, state and a ZIP code (5 digits, optional +4). It
normalizes the ZIP code (`880011234` → `88001-1234`), charges the remote fee for Alaska and Hawaii and refuses
Puerto Rico, the US territories and military addresses (`NO_POST`) with a message. Pickup hides the address
and shows the pickup date; a workshop-only order hides shipping entirely and asks for names. Placing the
order shows a confirmation with an order number (`VC-` and five digits), the summary and the dates, saves it
as the last order and empties the cart. No payment is taken: connect your payment provider in the
`setupValidation(form, …)` callback in `initCheckout()`, where the comment says so, and show the confirmation
only after it succeeds.

### Back to top

A round button appears after about a screen of scrolling and returns to the top, moving focus to the main
content. Remove the “Back to top” block at the end of `main.js` and the `.back-to-top` styles in
`src/input.css` to drop it.

## URL parameters

| Page | Parameter | Values |
|------|-----------|--------|
| any | `now` | `YYYY-MM-DDTHH:MM`, Mountain time: preview the site at that moment |
| `shop.html` | `category` | `cups`, `bowls`, `plates`, `pouring`, `vases` |
| `shop.html` | `glaze` | `oat`, `cobalt`, `earth`, `moss`, `chalk` |
| `shop.html` | `ready` | `1`: only pieces ready to ship |
| `shop.html` | `sort` | `featured`, `price-asc`, `price-desc`, `name` |
| `product.html` | `piece` | a product `id` (required) |
| `product.html` | `glaze`, `size` | a glaze and size the piece comes in |
| `workshops.html` | `workshop` | `taster`, `handbuild`, `course` (preselects it and scrolls to booking) |

Every value is checked with an own-key lookup (`Object.prototype.hasOwnProperty.call`), so values such as
`toString` or `__proto__` fall back to the default.

## Forms

| Form | Where | Validates |
|------|-------|-----------|
| Checkout | `checkout.html` | name (2+ characters), email, optional phone, address, city, state, ZIP code |
| Contact | `contact.html` | name, email, topic, number of pieces (commissions and wholesale), message (15–1500 characters, with a counter) |
| Kiln list | footer of every page | email |

Errors appear under each field (`aria-invalid` and `aria-describedby`), focus moves to the first problem, and
a success panel replaces the form. **The forms don’t send anything until you connect them.** To use a form
service such as Formspree, replace the `successSwap(...)` call in `initForms()` with a request and show the
panel when it succeeds:

```js
setupValidation(form, () => {
  fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    .then((r) => r.ok ? successSwap(form, '<p class="display text-[2.2rem]">Thank you.</p>') : alert('Sorry, that didn’t send.'));
});
```

The checkout sends nothing either: see [Checkout](#checkout).

## Saved data (localStorage)

All saved data goes through `safeStorage`, which falls back to memory when the browser blocks
`localStorage` (a sandboxed iframe or strict privacy settings), so the cart still works for that page view.

| Key | Shape | Checked on read |
|-----|-------|-----------------|
| `glaze-basket` | `{ lines: [{ kind: 'piece', id, glaze, size, qty } \| { kind: 'workshop', id, date, slot, qty }], method: 'delivery' \| 'collect' }` | unknown pieces, glazes, sizes and workshops are dropped; quantities are clamped (6 per piece, 4 spots); past or invalid sessions are removed with a notice; duplicates are merged; at most 40 lines; the repaired cart is written back |
| `glaze-last-order` | `{ number: 'VC-12345', placedAt, summary, total }` | ignored unless the number, summary and total have the right form |

To reset, run `localStorage.removeItem('glaze-basket')` in the browser console, or clear the site’s data.

## Time zone and demo dates

Everything dated is computed in `America/Denver` from rules, so the demo never shows past dates:

- Workshop sessions: weekly, every-other-week and first-of-the-month rules (see [Workshop booking](#workshop-booking)).
- Kiln-opening Saturdays: the first Saturday of each month.
- Shipping and pickup dates: business days from today.
- Closures: `federalHolidays(year)` works out US federal holidays by rule, with the weekday they’re observed on;
  `CLOSED_DATES` adds Christmas Eve and New Year’s Eve, and repeats every year. Edit either for your own closures.
- The copyright year fills itself in (`[data-year]`).

There is no `KEEP_DEMO_CURRENT` switch because nothing is a fixed date. The workshop availability
(`placesTaken()`, `DEMO_FULL_PERCENT`) and the stock numbers in `PRODUCTS` are demo data: replace them with
your own. To add a one-off closure, add its `'MM-DD'` to `CLOSED_DATES` (it then repeats every year) or extend
`isClosedDate()` to check full dates.

## SEO and sharing

Each page has its own `<title>`, meta description and Open Graph tags in the `<head>`. The product page
updates its title and description from the piece. `og:image` points at `assets/img/og-image.png`; social
sites need an absolute URL, so change it to your domain when you publish (for example
`https://vennickclay.example/assets/img/og-image.png`). Add a `sitemap.xml` listing the pages and a
`robots.txt` if your host doesn’t make them. Product structured data (`schema.org/Product`) can be added to
`product.html` from the same `PRODUCTS` entry.

## Accessibility

- Skip link, landmarks, one `<h1>` per page, labeled navigation (`Main`, `Mobile`, `Breadcrumb`, footer).
- The menu button has `aria-expanded`, `aria-controls` and a label that changes to “Close menu”; Escape
  closes it and returns focus.
- Filters are toggle buttons with `aria-pressed`; glaze, size, workshop and session choices are real radio
  buttons styled as cards, with visible focus.
- Quantity changes, the shop count, product notes and the toast are announced through live regions.
- Pot drawings on the product page have a text label (“Drawing of the Loop handle mug in cobalt wash”); the
  others are decorative.
- Text meets WCAG AA contrast; `prefers-reduced-motion` turns off the scroll reveals, the sprig sway and
  smooth scrolling.

When editing, keep one `<h1>` per page, give new inputs a `<label>`, and keep `aria-controls` and
`aria-describedby` pointing at ids that exist.

## Building and deploying

The compiled CSS is included, so you only rebuild after adding or changing Tailwind classes:

```sh
npm install
npm run build     # one-off, minified
npm run watch     # rebuild on save
```

Tailwind finds classes in the HTML and in `assets/js/main.js`. Write class names as whole strings in the
JavaScript (not built from pieces), or they won’t be generated.

Upload the folder to any static host: Netlify Drop, Cloudflare Pages, GitHub Pages or plain web hosting.
There is no server code. `src/`, `package.json` and `node_modules/` aren’t needed online.

## Troubleshooting

- **A new color or class has no effect.** Rebuild the CSS (`npm run build`). If the class is only in
  `main.js`, check it is written out in full.
- **The cart empties on every page.** The browser is blocking storage (private mode in some browsers, or the
  page is in a sandboxed iframe). The cart then lasts for one page view; serve the site normally.
- **Opening hours look wrong.** Check `HOURS` (Sunday first), `CLOSED_DATES` and `federalHolidays()`, and preview with
  `?now=2026-12-24T11:00`.
- **A product link shows “We couldn’t find that piece”.** The `piece` value must match an `id` in `PRODUCTS`
  exactly.
- **A workshop shows no dates.** Its `day` must match the rule (`0` = Sunday), and the rule must find a date
  within `WORKSHOP_HORIZON_DAYS`.
- **The social preview has no image.** Use an absolute URL in `og:image` on the live site.

## License

MIT. The code and all included artwork are free for personal and commercial use. The full license text is
in `LICENSE.txt`, which is added to the download. Petrona and Red Hat Text are
licensed under the SIL Open Font License. Vennick Clay, its people and its address details are fictional.
