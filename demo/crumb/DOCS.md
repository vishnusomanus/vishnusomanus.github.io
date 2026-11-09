# Crumb documentation

## Overview

Crumb is a website for a neighborhood bakery and café with order-ahead pickup, built for
**Bramble & Rye**, a fictional bakery on Phila Street in Saratoga Springs. It has a live "fresh out of the
oven" board, a preorder catalog with per-day availability and quantity limits, a basket drawer with a
pickup day, time slot and order cut-off, a pickup checkout with an order number and a calendar file, a
celebration cake builder with a live drawing and price, a café menu with diet filters, an about page and a
visit page with a wholesale form. It is plain HTML with Tailwind CSS v4 and one vanilla JavaScript file, with
no build step needed to use it. This guide covers version 1.0.7. See it live at
[freeframe.dev/templates/crumb](https://freeframe.dev/templates/crumb).

## Quick start

1. Unzip the download and open `index.html` in a browser. Every page works from the file system.
2. Or serve the folder, which is closer to how it runs on a host:

   ```sh
   npx serve .
   ```

3. You only need Node.js 24 or newer if you change the CSS classes (see
   [Building and deploying](#building-and-deploying)).

To preview the site at another time of day (the bake board, open-now badges and cut-off all follow the
bakery's clock), add `?now=` to any page URL, for example `index.html?now=2026-10-17T10:15`.

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with the shop-window illustration and "Preorder for pickup", live bake board, how preordering works, this week's specials (from the product data), celebration cake teaser, café teaser, reviews, visit us with open-now badge, hours and map |
| `shop.html` | Preorder | Shelf filters with counts (`shop.html?category=bread`), pickup-day picker, "only that day's bakes" toggle, product cards grouped by shelf, add buttons and steppers, allergen note |
| `cakes.html` | Celebration cakes | Builder for size, flavor, filling, finish, color, message and pickup date; live SVG preview, price breakdown and allergens; recent cakes; cake FAQ |
| `cafe.html` | Café menu | Coffee, tea, brunch and sweet things with diet filters (`cafe.html?diet=vegan,gf`), café notes |
| `checkout.html` | Checkout | Pickup day and slot, notes, contact details, pay at pickup or by card (test mode), order summary, confirmation with order number and `.ics` file, empty state with the last order |
| `about.html` | Our story | Story, timeline, the 36-hour sourdough process, suppliers, team, waste figures |
| `visit.html` | Visit & wholesale | Illustrated map, hours with today highlighted, contact, getting here, wholesale inquiry form (`visit.html#wholesale`), FAQ |
| `404.html` | Not found | Links back to home, preorder and café |

## Project structure

```text
crumb/
  index.html … visit.html, 404.html   the pages (header, footer, basket drawer and toast repeated in each)
  assets/css/style.css                compiled Tailwind CSS (generated, do not edit)
  assets/js/main.js                   all JavaScript: settings, bakes, art, basket and every page's features
  assets/img/favicon.svg              browser icon
  assets/img/og-image.svg             social image source (1200×630)
  assets/img/og-image.png             social image used by the pages
  src/input.css                       Tailwind source: brand tokens and component classes
  package.json                        scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

The design tokens are in the `@theme` block of `src/input.css`. Every utility such as `bg-bramble` or
`text-muted` comes from them.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-flour` | `#fbf5ec` | Page background |
| `--color-paper` | `#fffdf8` | Cards and form fields |
| `--color-oat` | `#f3e7d5` | Soft panels, bread tiles |
| `--color-line` | `#e7d6bf` | Hairlines and dashed rules |
| `--color-ink` | `#3a2620` | Text, outlines, the footer |
| `--color-muted` | `#6c574a` | Secondary text |
| `--color-bramble` / `--color-bramble-deep` | `#74305a` / `#561f42` | Brand color: buttons, links, basket |
| `--color-bramble-soft` | `#f3dce7` | Selected options, the hero window frame |
| `--color-blush` / `--color-blush-deep` | `#f7dcd3` / `#a33a3f` | Cake tiles, sold out, error text |
| `--color-pistachio` / `--color-pistachio-deep` | `#dfe8cb` / `#43602a` | Whole cake tiles, "on the shelf", vegan |
| `--color-butter` / `--color-butter-deep` | `#f9e8b2` / `#7a5a06` | Pastry tiles, "baking now", badges |
| `--color-lilac`, `--color-sky` | `#e5ddf0`, `#d9e8ee` | Pastel accents |
| `--color-crust` | `#b9733c` | Decoration only (steam, bread brown) |

To change the brand color, edit the tokens and rebuild the CSS:

```css
@theme {
  --color-bramble: #2f5d50;
  --color-bramble-deep: #1f4237;
  --color-bramble-soft: #d8ebe3;
}
```

The illustrations use fixed colors inside `assets/js/main.js` (section 6) and inline SVG in the pages, so a
new brand color doesn't recolor the bakes. The category tile colors are `CATEGORY_TINT` in `main.js`.

### Typography

Three Google Fonts are loaded by the `<link>` in the `<head>` of every page:

| Token | Font | Used for |
|-------|------|----------|
| `--font-display` | Corben | Headings, prices, the wordmark |
| `--font-sans` | Karla | Body text and UI |
| `--font-hand` | Delicious Handrawn | Hand-lettered notes (`.hand`), the cake message |

To swap a font, change the Google Fonts URL in every page and the matching token in `src/input.css`, then
rebuild the CSS. The SVG artwork names `'Delicious Handrawn'` and `Corben` directly for its labels.

### Content

Text lives in the HTML files. Everything the scripts work from is at the top of `assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `SHOP` | Name, address, phone and email used in the drawer, toasts and calendar file |
| `TIMEZONE`, `LOCALE`, `CURRENCY` | `America/New_York`, `en-US`, `USD` |
| `HOURS` | Opening hours per weekday, Sunday first, `['07:30', '16:00']` or `null` for closed |
| `PICKUP` | `cutoff` (`'14:00'`), `slotStep` (30), `lastSlotBeforeClose` (30), `daysAhead` (14), `notesMax` (200) |
| `CATEGORIES` | The shelves: `bread`, `pastry`, `bakes`, `whole` |
| `ALLERGENS`, `DIETS` | Allergen names and diet labels (`vegan`, `vegetarian`, `gf`, `df`) |
| `PRODUCTS` | Every bake on the preorder page |
| `BAKE_SCHEDULE`, `BAKING_MINS` | When each bake comes out of the oven, and how long "baking now" shows before that |
| `CAFE_MENU` | Café sections and items |
| `CAKE` | Celebration cake options, lead time and limits |

Add a bake by adding an object to `PRODUCTS`:

```js
{ id: 'rye-bun', name: 'Caraway rye bun', category: 'bread', price: 2.75, unit: 'each', days: [5, 6], max: 12,
  blurb: 'Soft rye buns with caraway, made for sandwiches.',
  allergens: ['gluten'], diet: ['vegan'], art: { kind: 'boule', crust: '#8c5532', top: '#a8693d' } },
```

| Field | Meaning |
|-------|---------|
| `id` | Unique, used in the basket and in `data-add` buttons |
| `category` | One of the `CATEGORIES` ids |
| `price` | In dollars; whole numbers show without cents (`$58`) |
| `days` | Weekdays it's baked (`0` Sunday to `6` Saturday), or `null` for every day you're open |
| `max` | The most one order can hold |
| `leadDays` | Optional days' notice (default 1: order before the cut-off the day before) |
| `special` | Optional badge text; specials also appear on the home page |
| `allergens`, `diet` | Keys from `ALLERGENS` and `DIETS` |
| `art` | How it's drawn (see [Images and artwork](#images-and-artwork)) |

To show a new bake on the home page board, add it to `BAKE_SCHEDULE` with the time the first tray comes out
and, optionally, when it usually sells out:

```js
{ id: 'rye-bun', out: '09:15', soldOut: '13:00' },
```

Café items are `{ name, price, desc, diet }` inside a `CAFE_MENU` section. The cake builder reads `CAKE.sizes`,
`CAKE.sponges`, `CAKE.fillings`, `CAKE.finishes` and `CAKE.colours`; each option has an `id`, a `label` and a
`price` (a size has `serves`, `factor` and `tiers`, the diameters in inches used for the drawing).

The footer hours, reviews and the café teaser on the home page are plain HTML: update them alongside
`HOURS` and `CAFE_MENU`.

### Images and artwork

There are no photos. All artwork is SVG:

- **Bakes** are drawn by `Art.bake(art)` in section 6 of `main.js` from a product's `art` object. `kind` picks
  the drawing: `boule`, `tin`, `baguette`, `focaccia`, `croissant`, `painchoc`, `bun`, `knot`, `scone`,
  `tart`, `cookie`, `brownie`, `loafcake` or `layercake`. Optional colors: `crust` and `top` (breads),
  `seeds` / `oats` (`tin`), `score: 'leaf'` (`boule`), `almonds` (`croissant`), `dough` / `swirl` (`bun`),
  `sponge`, `frosting`, `filling` and `top` (`'berries'`, `'walnuts'`, `'drip'`, `'flowers'`) for
  `layercake`.
- **Celebration cakes** are drawn by `Art.cake(config)` from the builder's choices.
- The hero shop window, map, kitchen window, team avatars, coffee cup and 404 loaf are inline SVG in the
  pages. Edit them in place, or replace them with an `<img>`.

To use photos instead, replace the art in `productCard()` with an `<img>` (keep the 4:3 tile) and give each
product an image path. Keep the hero image around 560×660 (portrait) to match the layout.

The social image is `assets/img/og-image.png` (1200×630), rendered from `og-image.svg`. The favicon is
`assets/img/favicon.svg`.

### Navigation, header and footer

The header, mobile menu, footer, basket drawer and toast are repeated in every page. To add or remove a page,
edit the `<nav aria-label="Main">` list, the `#mobile-menu` list and the footer "Explore" list in every HTML
file. Mark the current page's links with `aria-current="page"`. Each page's `<body data-page="…">` tells
`main.js` which features to start (`home`, `shop`, `cakes`, `cafe`, `checkout`).

## Features

### Shop clock and opening hours

All times use the bakery's clock (`TIMEZONE`) via `shopNow()`, so a visitor abroad sees the shop's real
state. Elements with `data-open-status` show "Open now until 4pm" or "Closed · opens Tuesday 7:30am" with a
colored dot; `data-cutoff` shows the countdown to the order cut-off ("Order in the next 2h 14m for pickup tomorrow"); `data-hours-list` lists the week with today highlighted. They refresh every 30 seconds. Add
`?now=YYYY-MM-DDTHH:MM` to a URL to test any time.

### Bake board

The home page's "Fresh out of the oven" list (`#bake-board`, `renderBoard()`) shows every `BAKE_SCHEDULE`
entry baked today. Each bake is **Out at 7:30am** until `BAKING_MINS` before its time, then **Baking now**,
then **Out since 7:30am**, and **Sold out** after its optional `soldOut` time. Bakes on the shelf come first
and sold-out ones last. After closing (and on closed days) it shows the next bake day instead, so the page
never looks empty. It refreshes every minute. Each card links to its shelf on the preorder page.

### Preorder catalog

`initShop()` renders `PRODUCTS` grouped by shelf. The chips filter by shelf and update the URL
(`?category=pastry`); the pickup-day picker is the basket's day; "Only that day's bakes" hides anything
not baked then. Cards show the bake days as a Monday-first week strip, diet tags, allergens and an action:

- **Add to basket** when it fits the chosen day.
- **Add for Sat, Oct 17** when it doesn't: adding it moves the pickup to the next day that suits the
  whole basket, and a toast says so.
- A quantity stepper once it's in the basket, capped at `max`.

Filters are buttons with `aria-pressed`, and the result count is a live region.

### Basket drawer

The basket button in the header opens `#basket-drawer`, a modal dialog with a focus trap; Esc, the close
button or the backdrop close it and focus returns to the button. It lists each line with a stepper and
remove button, then the pickup details:

- **Pickup day**: open days from the earliest possible (`earliestDate()`) up to `PICKUP.daysAhead`
  (`CAKE.daysAhead` when there's a celebration cake). Orders before `PICKUP.cutoff` can pick up the next
  open day; after it, the day after. Whole cakes add their `leadDays`, celebration cakes `CAKE.leadDays`.
- **Time slot**: half-hour slots from opening time until `lastSlotBeforeClose` minutes before closing.
- **Conflicts**: if something isn't baked on the chosen day, the drawer says so, offers the next day that
  suits everything, and disables checkout until it's fixed.
- **Notes** up to `PICKUP.notesMax` characters, saved as you type.

### Celebration cake builder

`initCakes()` builds the radio cards from `CAKE` and redraws the cake and price on every change. The price is
the size's `price` plus flavor, filling and finish extras multiplied by the size's `factor`, rounded to
whole dollars (`cakePrice()`). The color swatches are disabled for the naked finish. The message is limited
to `CAKE.messageMax` characters with a live counter. The date input's minimum is `CAKE.leadDays` days ahead
(after the cut-off) and closed days are rejected. Adding the cake puts it in the basket, sets the pickup
to that date and shows a toast; one order holds up to `CAKE.maxPerOrder` cakes.

### Café menu filters

`initCafe()` renders `CAFE_MENU`. The diet chips combine (a dish must match all of them; vegan counts as
vegetarian and dairy-free), update the URL (`?diet=vegan,gf`) and show an empty state with a clear button.

### Checkout and calendar file

`initCheckout()` shows the pickup picker, contact fields, payment choice and summary. "Pay now by card"
reveals a card form in test mode (Luhn-checked number, `MM / YY` expiration, CVC). On a valid submit it creates an order
number (`BR-` and five digits), saves the order to `crumb-last-order`, empties the basket and shows a
confirmation with an **Add to calendar (.ics)** link built by `icsFor()`: a 30-minute event at the pickup
slot in `America/New_York`, with the items in the description. The confirmation says a confirmation email is on
its way and gives the shop phone number (`SHOP.phone`) for changes, quoting the order number. The empty
checkout shows the last order and its calendar link.

### Back to top

A back-to-top button appears after one screen of scrolling. Remove the block at the end of `main.js` and
the `.back-to-top` styles in `src/input.css` to drop it.

## Forms

| Form | Where | Validates |
|------|-------|-----------|
| Bake list sign-up (`data-form="newsletter"`) | Footer, every page | Email |
| Wholesale inquiry (`data-form="wholesale"`) | `visit.html` | Business, type, name, email, optional phone, loaves a day (10–400), at least one interest, start date at least 7 days ahead, message up to 600 characters |
| Cake builder (`#cake-form`) | `cakes.html` | Pickup date (lead time, open day), message length |
| Checkout (`#checkout-form`) | `checkout.html` | Time slot, name, email, US phone, allergen confirmation, card fields when paying now |

Validation is inline: errors appear under each field on blur and submit (`fieldMessage()` in section 17), the
first invalid field gets focus, and a success panel replaces the form. The wholesale confirmation shows a short
reference (`BR-` and four characters, from `makeRef()` in section 17) and says Ruth replies within two working
days; the bake list confirmation asks subscribers to look out for a confirmation email. Change the wording to match
how you actually handle inquiries, and show your form service's own reference if it returns one. **The forms
send nothing until you connect them.**

To connect the newsletter or wholesale form to a form service such as Formspree, replace the
`successSwap(...)` call in `initForms()`:

```js
$$('[data-form="wholesale"]').forEach((form) => setupValidation(form, () => {
  fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    .then((r) => r.ok ? successSwap(form, '<p class="font-display text-2xl">Thanks, we’ll be in touch.</p>') : alert('Sorry, that didn’t send.'));
}));
```

Every field already has a `name`. For real orders, send the `order` object in the checkout's submit handler
(there is a comment marking the spot) to your order system, and take payment with your provider (Stripe
Checkout, Square, SumUp…) before showing the confirmation. Remove the test-mode card form and its
"Test mode" note when you do.

## Saved data (localStorage)

| Key | Shape | Notes |
|-----|-------|-------|
| `crumb-basket` | `{ lines, date, time, notes }` | `lines` are `{ id, qty }` or `{ id: 'cake', key, cake: { size, sponge, filling, finish, colour, message }, qty: 1 }`; `date` is `YYYY-MM-DD`, `time` is `HH:MM` |
| `crumb-last-order` | `{ number, placedAt, date, time, notes, name, email, phone, payment, lines, total }` | Written at checkout; shown on the empty checkout page |

Everything is checked on every read (`loadBasket()`, `readLastOrder()`): unknown products and cake options
are dropped, quantities become whole numbers within `max`, duplicates merge, dates outside the bookable
range and slots that don't exist reset, and the repaired value is written back. Prices are never stored; they
always come from `PRODUCTS` and `CAKE`. Open tabs stay in sync through the `storage` event. To reset, run
`localStorage.removeItem('crumb-basket')` in the console, or clear the site's data.

## SEO and sharing

Each page has its own `<title>`, meta description and Open Graph tags in the `<head>`. The `og:image` is the
relative path `assets/img/og-image.png`; social sites need an absolute URL, so change it on every page once
you know your domain:

```html
<meta property="og:image" content="https://www.example.com/assets/img/og-image.png">
```

Also consider adding `<link rel="canonical">`, a `sitemap.xml` listing the pages (leave out `404.html` and
`checkout.html`) and a `robots.txt`. A `Bakery` schema.org block (name, address, opening hours, telephone)
in `index.html` helps local search.

## Accessibility

- Skip link, landmarks, one `<h1>` per page and logical headings.
- Visible focus outlines in the brand color; WCAG AA color contrast.
- The mobile menu button has `aria-expanded` and closes with Esc.
- The basket drawer is a modal dialog with a focus trap, Esc to close and focus returned to the opener.
- Filter chips use `aria-pressed`; result counts and toasts are live regions.
- Steppers have labeled buttons ("One more Butter croissant"); the art has text alternatives or is hidden.
- Form errors are linked with `aria-describedby` and fields get `aria-invalid`.
- Scroll reveals, steam and pulses are off with `prefers-reduced-motion`.

When editing, keep one `<h1>` per page, label every new input and keep classes used only in JavaScript
strings inside `main.js` so Tailwind generates them.

## Building and deploying

The compiled CSS is committed, so you only rebuild when you add or change Tailwind classes:

```sh
npm install
npm run build     # one-off, minified
npm run watch     # rebuild on save
```

Upload the folder to any static host: Netlify Drop, Cloudflare Pages, GitHub Pages or plain web hosting.
There is no server code. Leave out `src/`, `package.json` and `node_modules/` if you like; the site doesn't
need them.

## Troubleshooting

- **The bake board says "Tomorrow" all day.** `HOURS` decides when you're open; check the closing time for
  today and that `TIMEZONE` is your bakery's zone.
- **A bake never appears on the board.** It needs a `BAKE_SCHEDULE` entry and must be baked that day
  (`days`).
- **Customers can't pick tomorrow.** It's after `PICKUP.cutoff`, tomorrow is closed, or something in the
  basket needs more notice (`leadDays`).
- **A new class does nothing.** Rebuild the CSS. Classes used only in JavaScript must appear literally in
  `main.js`, not built from pieces.
- **The basket shows old items.** Stored baskets are repaired against `PRODUCTS`; if you renamed an `id`,
  old baskets drop that line. Clear `crumb-basket` to start fresh.
- **Fonts look different offline.** The fonts come from Google Fonts; without a connection the system
  fallbacks are used.
- **The calendar file has the wrong time.** Events use `TIMEZONE`; if you change it, update the
  `VTIMEZONE` rules in `icsFor()` too.

## License

MIT. See the repository license (`LICENSE.txt` in the download). All artwork is included under the same
license.
