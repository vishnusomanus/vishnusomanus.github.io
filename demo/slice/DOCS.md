# Slice documentation

## Overview

Slice is a website for a pizzeria or takeout with online ordering, built for **Crust Club**, a fictional
sourdough pizzeria with two shops in New Haven (Wooster Square and Westville). It has a filterable menu with a
pizza customizer, a cart drawer on every page, a ZIP code delivery checker, set deals and a bundle builder, a
checkout with time slots worked out from the opening hours, an animated order tracker, a locations page
with a delivery-zone map, an about page and a catering page with a pizza calculator and inquiry form. It is
plain HTML with Tailwind CSS v4 and one vanilla JavaScript file, with no build step needed to use it. This
guide covers version 1.0.6. See it live at
[freeframe.dev/templates/slice](https://freeframe.dev/templates/slice).

## Quick start

1. Unzip the download and open `index.html` in a browser. Every page works from the file system.
2. Or serve the folder, which is closer to how it runs on a host:

   ```sh
   npx serve .
   ```

3. You only need Node.js 24 or newer if you change the CSS classes (see
   [Building and deploying](#building-and-deploying)).

Try an order: check the ZIP code `06511` on the home page, add a pizza from the menu, apply the code
`SLICE10` in the cart and place the order. Nothing is sent or charged until you connect the checkout (see
[Forms](#forms)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with delivery / pickup switch and ZIP code checker, bestsellers (from the menu data), deals, how ordering works, dough story, reviews, both shops with open-now badges |
| `menu.html` | Menu | Sticky section nav with scrollspy, vegan / vegetarian / gluten-free / spicy filters, live count, empty state, item customizer, allergen guide (`menu.html#allergens`) |
| `deals.html` | Deals & bundles | Three set deals with a picker dialog, build-your-bundle with discount tiers (`deals.html#bundle`), demo promo codes with copy buttons |
| `checkout.html` | Checkout | Delivery or pickup, ASAP or scheduled slot, contact and address, demo payment, order summary with promo code, confirmation with order tracker, empty state |
| `locations.html` | Locations & delivery | SVG delivery-zone map, ZIP code checker, zones table, both shops with full hours (today highlighted) and open-now, delivery FAQ |
| `about.html` | Our story | Timeline, the four dough steps, suppliers, team, values |
| `catering.html` | Catering & party orders | Packages, pizza calculator, party-order inquiry form, FAQ |
| `404.html` | Not found | Links to the menu, home and locations |

## Project structure

```text
slice/
  index.html … 404.html   the pages (header, footer and cart drawer are repeated in each)
  assets/
    css/style.css         compiled Tailwind CSS (generated: don't edit by hand)
    js/main.js            all JavaScript: menu data, cart, ordering, checkout, forms
    img/favicon.svg       browser tab icon
    img/hero-pizza.svg    the sliced pizza on the home and 404 pages
    img/og-image.svg      editable source of the social sharing image
    img/og-image.png      1200×630 social sharing image used by og:image
  src/input.css           Tailwind source: brand tokens and component classes
  package.json            scripts to rebuild the CSS
  README.md               short introduction
  DOCS.md                 this guide
  CHANGELOG.md            version history
```

## Customizing

### Brand and colors

All colors and fonts are tokens in the `@theme` block at the top of `src/input.css`. Each token becomes
Tailwind classes (`--color-tomato` gives `bg-tomato`, `text-tomato`, `ring-tomato`...).

| Token | Default | Used for |
|-------|---------|----------|
| `--color-mozz` | `#fff4e2` | Page background |
| `--color-paper` | `#fffaf2` | Cards and fields |
| `--color-flour` | `#f9e6c8` | Soft panels, steppers |
| `--color-tomato` | `#cc2a16` | Brand red: hero, primary buttons, menu header |
| `--color-tomato-deep` | `#94190b` | Button lip, red text on cream |
| `--color-cheese` | `#ffc23a` | Yellow: deals band, stickers, secondary buttons |
| `--color-basil` | `#1d6b3c` | Green: vegan tags, success, dough band |
| `--color-ink` | `#2a1209` | Text, footer, dark buttons |
| `--color-cocoa` | `#6b4a3a` | Secondary text |

Each strong color has a `-soft` tint (`tomato-soft`, `cheese-soft`, `basil-soft`) for tags and card
backgrounds. To re-brand, change the values and rebuild the CSS:

```css
@theme {
  --color-tomato: #1f4fd1;      /* a blue pizzeria */
  --color-tomato-deep: #12307f;
}
```

Keep text on `tomato` and `basil` at 4.5:1 contrast or better. A few colors are written directly in SVG
artwork (pizza toppings, the map, `og-image.svg`) and in `<meta name="theme-color">` on each page.

Component classes live in `@layer components` in `src/input.css`: `btn-primary`, `btn-cheese`,
`btn-basil`, `btn-ink`, `btn-ghost`, `btn-cream`, `card`, `tag` with `tag-vegan` / `tag-vegetarian` /
`tag-gf` / `tag-spicy`, `field`, `option` (radio cards), `chip` (filter and checkbox pills), `segmented`
(the Delivery / Pickup switch), `stepper`, `checker` (the tablecloth band) and `scallop-b` (the scalloped
bottom edge of hero bands).

### Typography

Two Google Fonts are loaded in the `<head>` of every page:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Rubik:ital,wght@0,400..900;1,400..700&amp;family=Shrikhand&amp;display=swap">
```

`--font-display` (Shrikhand, used through the `h-display` class and `font-display`) is for big headings and
the logo; `--font-sans` (Rubik) is for everything else. To swap them, change the link on every page and the
two tokens in `src/input.css`. Shrikhand only has one weight, so keep it for large text.

### Content

Text lives in the HTML pages. Everything you can order lives in data at the top of `assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `STORES` | Shops: `id`, `name`, `address`, `phone`, `hours` (Sunday first, 24-hour here and shown in 12-hour time, `['12:00', '22:00']` or `null`), `pickupMins`, `deliveryMins` |
| `ZONES` | Delivery zones: ZIP codes in `districts`, the `store` that serves them, `fee`, `min` order and `eta` range in minutes |
| `FREE_DELIVERY_OVER` | Subtotal (after promo) that makes delivery free (`50`) |
| `PROMOS` | Demo promo codes (see [Promo codes](#promo-codes)) |
| `SECTIONS` | Menu sections in order, with the blurb under each heading |
| `SIZES` | Pizza sizes: `delta` from the Regular price and `extra` (price of each extra topping) |
| `CRUSTS` | Crusts: `price`, optional `sizes` they're limited to, `allergens`, `notVegan`, `glutenFree` |
| `TOPPINGS` | Extra toppings: `kind` (`veg`, `dairy`, `honey`, `meat`, `fish`) decides vegan / vegetarian tags |
| `MENU` | Every item: `section`, `name`, `price`, `desc`, `diet`, `allergens`, `art`, optional `best` |
| `DEALS` | Set deals with their `slots` |
| `BUNDLE_TIERS` | Bundle discount tiers |

Other settings: `TIMEZONE` (`'America/New_York'`), `LOCALE` and `CURRENCY` (prices are formatted with
`Intl.NumberFormat`), `SLOT_STEP` (minutes between time slots), `SCHEDULE_DAYS`, `MAX_QTY` and
`TRACKER_STEP_SECONDS`.

To add a pizza, add an entry to `MENU`. Pizza prices are the Regular (12″) price; the other sizes follow
`SIZES`. The picture is drawn from `art`:

```js
{ id: 'truffle', section: 'pizzas', name: 'Truffle Shuffle', price: 14,
  desc: 'Garlic cream, mushrooms, fior di latte and truffle oil.',
  diet: ['vegetarian', 'gf'], allergens: ['gluten', 'milk'],
  art: { sauce: 'bianca', cheese: true, toppings: ['mushroom', 'thyme'] } },
```

For anything else, `art` picks a drawing: `knots`, `sweet-knots`, `bread`, `wings`, `burrata`, `potatoes`,
`salad`, `dip` (with `color` and `swirl`), `tiramisu`, `cookie`, `gelato`, `can` or `bottle` (with `color` and
`band`). `diet` uses `vegan`, `vegetarian`, `gf` and `spicy`; for pizzas `gf` means "can be made on the
gluten-free base" and shows as **GF base**. `allergens` uses the keys of `ALLERGENS`. Items with
`best: true` appear in the home page bestsellers.

Prices are never stored in the cart, so changing a price updates every page, saved cart and total.

### Images and artwork

There are no photos. Pizzas, sides, dips, desserts and drinks are drawn as SVG in section 5 of `main.js`
(`Art.pizza()` and `Art.food()`), from each item's `art` settings, so new menu items get a picture
automatically. Topping drawings are in the `PIECES` object; add a key there to use a new topping in `art`.
Pizza positions are seeded from the item id, so the same pizza always looks the same.

Any element with `data-pizza="<menu id>"` is filled with that item's picture (used for the decorative
pizzas in page headers). `assets/img/hero-pizza.svg` is a static file drawn with the same code; replace it
with any square image. If you prefer photos, replace the `itemArt()` function's output with an `<img>`:
menu cards show art in a square, the cart in a 64–80 px square.

The social image is `assets/img/og-image.png` (1200×630). Edit `og-image.svg`, then export it as a PNG at
the same size, because most social sites don't display SVG. The favicon is `assets/img/favicon.svg`.

### Navigation, header and footer

The header, mobile menu, footer, cart drawer and toast are repeated in every page. To add or remove a page,
copy an existing page, then update the `<nav aria-label="Main">` list, the `<nav aria-label="Mobile">` list
and the footer links in every file. Mark the current page's links with `aria-current="page"`. Set
`data-page` on `<body>` if the page needs page-specific JavaScript (see the boot section at the end of
`main.js`).

Shop details in the footer and on the home and locations pages are written in the HTML; the open-now
badges and hours tables are filled from `STORES`. If you change an address or phone number, change it in
`STORES` and in the HTML.

## Features

### Delivery checker

Any `<div data-zone-checker></div>` becomes a Delivery / Pickup switch with a ZIP code check (delivery) or
shop picker (pickup). Add `data-variant="compact"` for the small version used in the cart drawer. It's on
the home page, locations page, checkout and in the drawer, and every copy stays in sync.

`checkPostcode()` reads the 5-digit ZIP code (with an optional +4, `06511-1234` → `06511`) and finds
the zone in `ZONES` that lists it. The result shows the shop, fee, minimum and delivery time, and warns
when that shop is closed. A valid ZIP code outside every zone gets a "we don't deliver there yet" message.
The choice is saved (see [Saved data](#saved-data-localstorage)) and shown in the header.

When a ZIP code is checked, the element fires a `zonechange` event with the result in `event.detail`; the
locations page uses it to highlight the zone on the map. Press Enter in the ZIP code field to check.

### Open now and opening hours

`storeStatus()` compares the current time in `TIMEZONE` (not the visitor's clock) with `STORES[].hours`.
It fills any element with `data-store-status="<store id>"` ("Open until 10:00 PM", "Closing soon, last orders 10:00 PM", "Opens today 4:00 PM" or "Opens Tuesday 4:00 PM"), `data-today-hours="<store id>"` and
`<tbody data-hours="<store id>">` (a row per day, Monday first, today highlighted). They refresh every
minute.

### Menu filters and section nav

`initMenu()` renders `menu.html` from `SECTIONS` and `MENU`. The chips with `data-diet` filter items that
have all selected diets; empty sections and their nav links hide, the count updates in a live region and
"Clear" resets. The URL follows the filters, so links like `menu.html?diet=vegan` or
`menu.html?diet=vegan,spicy` work (`gluten-free`, `veggie` and `hot` are accepted too). `menu.html?item=margherita`
opens that item straight away.

The section nav sticks under the header and highlights the section in view (an `IntersectionObserver`
scrollspy), scrolling itself sideways on phones.

### Item customizer

`openCustomiser()` opens a `<dialog>` for a pizza: size (with the price of each size), crust, half and half,
up to six extra toppings and quantity. The picture, price, diet tags and allergens update as you choose.
Rules come from the data:

- Crusts with `sizes` (gluten-free is Small only, stuffed crust is Regular and Large) switch the size for
  you, with a note explaining why; picking a size the crust doesn't come in switches back to classic.
- Half and half is Regular and Large only and is charged at the pricier half (`pizzaUnit()`).
- Extras add `SIZES[].extra` each; meat, fish, dairy and honey extras remove the vegan / vegetarian tags
  (`pizzaDiet()`), and their allergens are added (`pizzaAllergens()`).

Sides, dips, desserts and drinks have no options, so their button adds one straight to the cart. Any button
with `data-add="<menu id>"` does the right thing.

The dialog is the native `<dialog>` element, so focus stays inside it, Esc closes it and focus returns to
the button that opened it. On phones it opens as a bottom sheet.

### Cart drawer

The cart opens from the header button, the mobile "View your order" bar and any `[data-cart-open]` element.
It shows the delivery checker, each line with picture, options, quantity stepper, **Edit** (pizzas and
deals reopen their dialog) and **Remove**, notes for the kitchen (200 characters), a promo code field and
the totals. Above the checkout button it shows a minimum-order warning for the zone, free-delivery
progress, or a prompt to add a ZIP code; the checkout button is disabled until the order can go through.

`totals()` works out everything: subtotal, promo discount, delivery fee (free over `FREE_DELIVERY_OVER`
or with a delivery code; pickup is always free), the zone minimum and the total. The drawer traps focus,
closes on Esc or the backdrop, and keeps focus on the same control when lines change.

### Promo codes

`PROMOS` holds the demo codes, applied in the drawer or at checkout:

| Code | Type | Effect |
|------|------|--------|
| `SLICE10` | `percent` | 10% off menu items (not deals or bundles) |
| `FREEDELIVERY` | `delivery` | Free delivery |
| `FIRSTSLICE` | `amount` | $5 off orders of $30 or more |

One code at a time. Unknown codes show an inline error. Codes are checked in the browser, so anyone can see
them in the source: a real shop must validate codes on its server.

### Deals and bundles

`DEALS` defines set deals. A slot is either a choice (`{ choose: 'pizzas', size: 'regular', label: 'Pizza one' }`
or any section id) or a fixed item (`{ item: 'garlic-knots' }`). `art` lists the pizzas drawn on the deal
card. The deal dialog (`openDeal()`) shows a select per choice and how much the deal saves against the
same items bought separately (`dealWorth()`). Deal pizzas are classic crust with no extras.

The bundle builder on `deals.html` lets you pick Regular pizzas, sides, desserts and drinks from
`BUNDLE_SECTIONS`, up to `BUNDLE_MAX` items. The best tier in `BUNDLE_TIERS` you qualify for applies to the
whole bundle (two pizzas and a side for 15% off, three pizzas and two sides for 20%), with a meter and a hint
for the next tier. **Add bundle** is enabled once a tier is unlocked. Bundles appear in the cart as one line.

### Checkout and time slots

`checkout.html` shows the empty state, the form, or the confirmation of the latest order. The form has four
steps:

1. **Delivery or pickup**: the delivery checker.
2. **When**: "As soon as possible" is offered only while the shop is open and can still make the order
   today; otherwise "Schedule for later" is chosen. `timeSlots()` builds slots every `SLOT_STEP` minutes
   for today and the next days (`SCHEDULE_DAYS`): the first slot is opening time plus the lead time
   (`pickupMins` or `deliveryMins`), or now plus the lead time for today, and the last is closing time.
3. **Your details**: name, cell number, email, and for delivery a street address and rider instructions.
4. **Payment**: card (number in groups of four, expiration date `MM / YY`, CVC) or pay on delivery / at the
   counter. A note says no payment is taken on the site and any 16-digit number will do; remove it once you
   connect a payment provider.

On submit the fields are validated with inline errors and the order is checked against the delivery
minimum and ZIP code. A valid order is saved as the latest order, the cart is cleared and the confirmation
is shown. Nothing is sent: see [Forms](#forms) for where to connect a real order system.

Prices and totals don’t include sales tax, and the note under the checkout button says so. Add your rate when you
connect a real order system, or change the note if your prices include it.

### Order tracker

The confirmation shows the order number (`CC-` and four characters, made in the browser by `makeRef()`; use
your ordering system's own number instead if it returns one), a summary, a note that the receipt is on its
way by email (the checkout asks for an email "for your receipt") and a tracker with four stages (received, in the oven,
out for delivery, delivered; for pickup the last two are "Boxed & ready" and "Picked up"). In the demo each
stage lasts `TRACKER_STEP_SECONDS` (8 seconds) from the time the order was placed, so it keeps its place if
you reload. A rider (or bag) icon moves along the bar, the current stage pulses and the status line is a live
region for screen readers. Stages are in `STAGES`; to show real progress, replace the timer in
`renderTracker()` with updates from your kitchen or delivery system. **Start a new order** clears it.

### Locations map

The map on `locations.html` is inline SVG. Each zone is a `<path data-map-zone="<zone id>">`; its `fill` is
also used for the swatch in the zones table, which is built from `ZONES`. Hovering a row or zone highlights
it, and a checked ZIP code highlights its zone. The map is decorative (it has a text description); the
table carries the same information. To draw your own area, replace the paths and pins and keep the
`data-map-zone` ids in step with `ZONES`.

### Catering calculator

On `catering.html`, guests (10–300) and appetite (`APPETITE`: slices per person) give the number of large
pizzas (8 slices each), a suggested veggie / vegan / meaty mix, sides and an estimate using the average
large pizza price and `CATERING_DISCOUNT` (10% off 10+ pizzas, 15% off 20+). **Use these numbers** copies
the guest count and a summary into the inquiry form.

### Scroll reveal, motion and back to top

Elements with `.reveal` fade in as they scroll into view; anything above them is revealed too, so jumping
down the page never leaves gaps. The hero ingredients float (`.bob`), the round badge spins and menu-card
pizzas turn on hover. All motion is off for visitors who prefer reduced motion. A back-to-top button
appears after one screen; it lifts above toasts and the mobile order bar. Remove the block at the end of
`main.js` and the `.back-to-top` styles to drop it.

## Forms

All forms validate in the browser with inline messages (`fieldMessage()` in `main.js`) and finish with an
in-world confirmation. The catering inquiry confirms the party order, promises a reply within one business day
with a menu and a fixed quote (as the catering page says; change both if yours differs) and shows a reference
(`CC-` and four characters, from `makeRef()`; use your form service's own reference instead if it returns
one). The newsletter asks subscribers to look out for a confirmation email. **None of them send anything**
until you connect them.

| Form | Where | Validates |
|------|-------|-----------|
| Newsletter (`data-form="newsletter"`) | Footer of every page | Email |
| Catering inquiry (`data-form="catering"`) | `catering.html` | Name, email, phone, guests 10–300, date at least two days ahead (in the shop's time zone), time 11:00 AM–10:00 PM, delivery or pickup, delivery ZIP code (5 digits, optional +4, only when delivering), consent |
| Checkout (`#checkout-form`) | `checkout.html` | Delivery ZIP code in a zone, minimum order, a time slot, name, phone, email, address (delivery), card fields (card payment) |

To connect the newsletter or catering form to a form service such as [Formspree](https://formspree.io),
replace the `successSwap(...)` call in its `setupValidation()` callback in section 18 of `main.js`:

```js
$$('[data-form="catering"]').forEach((form) => {
  setupValidation(form, () => {
    fetch('https://formspree.io/f/your-id', {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    }).then((r) => {
      if (r.ok) successSwap(form, '<p class="h-display text-3xl">Thanks!</p><p class="mt-3">We’ll reply within one business day.</p>');
      else $('[data-form-status]', form).textContent = 'Sorry, that didn’t send. Please try again or call us.';
    });
  });
});
```

For real online ordering, the checkout's submit handler in `initCheckout()` builds a `placed` object with
the lines, totals, mode and time; send that to your ordering system or payment provider (for example a
Stripe Checkout session created by your server) where the comment says so, and only show the confirmation
when it succeeds. Never trust prices from the browser: recalculate them on the server.

## Saved data (localStorage)

| Key | Shape | Notes |
|-----|-------|-------|
| `crustclub-order` | `{ mode: 'delivery' \| 'pickup', postcode: '06511', store: 'ancoats' }` | Delivery or pickup choice. The zone is worked out again from the ZIP code on every read. |
| `crustclub-cart` | `{ lines: [...], promo: 'SLICE10', notes: '...' }` | Lines are `{ type: 'pizza', id, size, crust, half, extras, qty }`, `{ type: 'item', id, qty }`, `{ type: 'deal', id, picks, qty }` or `{ type: 'bundle', items: [{ id, qty }], qty }`. |
| `crustclub-last-order` | The confirmation: number, time placed, mode, summary, lines and totals | Shown on `checkout.html` for six hours while the cart is empty. |

Every read is validated by `normalizeLine()` and `Cart.get()`: unknown items, sizes, crusts, toppings and
codes are dropped, crusts and half-and-half are corrected for the size, quantities are clamped to 1–`MAX_QTY`
and duplicate lines are merged. Prices are always recalculated from `MENU`. Other open tabs update through
the `storage` event. To reset, clear the site's storage in the browser's developer tools, or run
`localStorage.removeItem('crustclub-cart')` in the console. Change the key names if you run several sites on
one domain.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `theme-color` in its `<head>`. Social
sites need an absolute URL for the image, so once the site is live, change

```html
<meta property="og:image" content="assets/img/og-image.png">
```

to the full address, for example `https://your-pizzeria.example/assets/img/og-image.png`, on every page. Add a
`sitemap.xml` and `robots.txt` at the root of your host. For local search, consider adding `Restaurant`
structured data (JSON-LD) with each shop's address, phone, `openingHours` and `hasMenu`.

The menu is rendered by JavaScript from `MENU`. Search engines that run JavaScript (such as Google) see it;
if you need the menu in the raw HTML, copy the rendered cards into `menu.html`.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page and a logical heading order.
- Visible focus outlines everywhere, including radio cards, chips and the Delivery / Pickup switch.
- The mobile menu button has `aria-expanded` and closes on Esc.
- The customizer and deal pickers use the native `<dialog>`; the cart drawer is `role="dialog"` with
  `aria-modal`, a focus trap and Esc to close.
- Filter chips are toggle buttons (`aria-pressed`); the result count, ZIP code result, bundle hint, toasts
  and tracker status are live regions.
- Quantity steppers have labeled buttons ("One more Margherita"), and remove / edit buttons include the
  item name for screen readers.
- Diet tags have text, not just color; allergens are written out.
- Reduced motion turns off reveals, floating, spinning, card turns and tracker animations.
- Colors meet WCAG AA contrast. Keep text on `tomato` and `basil` at full opacity when you edit.

When editing, keep exactly one `h1` per page, give every new input a `<label>`, and keep `alt` text on
meaningful images.

## Building and deploying

`assets/css/style.css` is compiled from `src/input.css`. If you add Tailwind classes to the HTML or to
strings in `main.js`, rebuild it (Node.js 24 or newer):

```sh
npm install
npm run build    # one-off, minified
npm run watch    # rebuild on every change
```

Tailwind scans the HTML and JavaScript for class names, so classes used only in `main.js` must be written
out in full there.

To publish, upload the whole folder (without `node_modules/` and `src/` if you like) to any static host:
Netlify Drop, GitHub Pages, Cloudflare Pages, Vercel or your own server. There is no server code; all links
are relative.

## Troubleshooting

- **The menu is empty or nothing happens when I click "Add".** JavaScript isn't running: check the browser
  console for errors after editing `main.js` (a missing comma in `MENU` is the usual culprit).
- **New classes have no effect.** Rebuild the CSS with `npm run build`. Classes built from pieces in
  JavaScript (`'bg-' + color`) aren't found by Tailwind; write the full class name.
- **"Open now" is wrong.** Hours are in `TIMEZONE`. Check `STORES[].hours` (Sunday first) and set
  `TIMEZONE` to your shop's zone, for example `'America/Chicago'`.
- **My ZIP code isn’t recognized.** Zones match 5-digit ZIP codes: add it to `ZONES[].districts`. For other countries, change
  `postcodeDistrict()` and `checkPostcode()` to read your format and list those
  codes in `ZONES[].districts`.
- **The cart shows old items or totals after I changed the menu.** Lines whose item, size or topping no
  longer exists are removed on the next read. Clear `crustclub-cart` to start fresh.
- **There are no time slots.** The shop is closed for the next `SCHEDULE_DAYS` days, or the lead time runs
  past closing. Check the hours, `pickupMins` and `deliveryMins`.
- **The social preview has no image.** Use an absolute `og:image` URL to the PNG, not the SVG.

## License

MIT, see the repository's license (included as `LICENSE.txt` in the download). Free for personal and
commercial use. All artwork (pizzas, food, map, logo and illustrations) is included and covered by the same
license.
