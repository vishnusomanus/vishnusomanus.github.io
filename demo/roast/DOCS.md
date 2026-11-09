# Roast documentation

## Overview

Roast is a shop for a specialty coffee roaster, built for **First Crack Coffee**, a fictional roastery in
Baltimore. It has a filterable coffee shop, product pages with bag sizes and grinds, a subscription builder,
a cart drawer, a three-step checkout, brew guides, a wholesale page and a sourcing page. It is plain
HTML with Tailwind CSS v4 and one vanilla JavaScript file, with no build step needed to use it. This guide
covers version 1.0.7. See it live at [freeframe.dev/templates/roast](https://freeframe.dev/templates/roast).

## Quick start

1. Unzip the download and open `index.html` in a browser. Every page works from the file system.
2. Or serve the folder, which is closer to how it runs on a host:

   ```sh
   npx serve .
   ```

3. You only need Node.js 24 or newer if you change the CSS classes (see
   [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with bag art, tasting-note ticker, this week's roasts (from the catalog), roast levels, subscription steps, brew guide links, sourcing figures, reviews |
| `shop.html` | Shop | Roast, origin and process filters with counts, sort, active-filter chips, live result count, empty state, URL parameters |
| `product.html` | One coffee (`product.html?id=kochere`) | Gallery (bag and beans), size cards with prices, grind, quantity, add to cart, tasting profile, origin details, brew recipe, related coffees |
| `subscribe.html` | Subscription builder | Style, bag size, bags per delivery, frequency, grind; live summary with change buttons, price per delivery and per cup, monthly estimate, next three delivery dates; sign-up form |
| `checkout.html` | Checkout | Details, delivery and payment steps with validation, review with edit links, order summary, confirmation, empty state |
| `brew.html` | Brew guides | Six methods in tabs (`brew.html#aeropress`), recipe scaler for cups and strength |
| `wholesale.html` | Wholesale | Benefits, price tiers, volume estimator, inquiry form |
| `about.html` | Our sourcing | How we buy, prices paid table, producers |
| `contact.html` | Contact & FAQ | Contact form, roastery hours, FAQ (`contact.html#faq`) |
| `404.html` | Not found | Links back to the shop and home |

## Project structure

```text
roast/
  index.html … contact.html, 404.html   the pages (header and footer repeated in each)
  assets/css/style.css                  compiled Tailwind CSS (generated, do not edit)
  assets/js/main.js                     all JavaScript: catalog, art, cart, every page's features
  assets/img/favicon.svg                browser icon
  assets/img/og-image.svg               social image source (1200×630)
  assets/img/og-image.png               social image used by the pages
  src/input.css                         Tailwind source: brand tokens and component classes
  package.json                          scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

The design tokens are in the `@theme` block of `src/input.css`. Every utility such as `bg-cobalt` or
`text-muted` comes from them.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-butter` | `#fff6df` | Page background |
| `--color-cream` | `#fffcf4` | Cards and form fields |
| `--color-oat` | `#f6e9c8` | Soft panels |
| `--color-sun` | `#ffcd4a` | Yellow bands, stickers, the back-to-top button |
| `--color-cobalt` / `--color-cobalt-dark` | `#2338b5` / `#18268a` | Brand color, primary buttons, links |
| `--color-sky` | `#d9e0ff` | Selected options, highlight cards |
| `--color-navy` | `#141a3c` | Text, outlines and the offset "sticker" shadows |
| `--color-muted` | `#4b4f6e` | Secondary text |
| `--color-tomato` / `--color-tomato-dark` | `#e0522f` / `#b03417` | Decoration / error text, stars, the cart badge |
| `--color-leaf` | `#23714a` | Savings text, the order confirmation check mark |

To change the brand color, edit the token and rebuild the CSS:

```css
@theme {
  --color-cobalt: #0f6b5c;
  --color-cobalt-dark: #0a4d42;
}
```

The bag artwork and the logo use literal colors: the navy outline `#141a3c` in `art()` in `main.js`, and the
logo SVG in every page's header and footer and in `assets/img/favicon.svg`. Keep text contrast at 4.5:1 or
more if you change the dark or muted colors.

The component classes in `src/input.css` give the template its look: `.btn-primary`, `.btn-sun`,
`.btn-outline`, `.btn-light`, `.card` (outlined card with the offset shadow), `.sticker`, `.tag`, `.eyebrow`,
`.link`, `.field`, `.option` and `.pill` (radio cards and pills that highlight when their input is checked)
and `.check`.

### Typography

Two Google Fonts, loaded by a `<link>` in each page's `<head>`: **Unbounded** for headings
(`font-display`) and **Onest** for body text (`font-sans`). To swap them, change the `family=` parts of
the link on every page and the font names in `src/input.css`:

```css
--font-sans: "Onest", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
--font-display: "Unbounded", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
```

The bag artwork writes the origin in Unbounded and the process in Onest (`art()` in `main.js`); change the
`font-family` there too.

### Content

Page copy is in the HTML files. Everything the shop calculates comes from constants at the top of
`assets/js/main.js` (section 1):

| Constant | What it holds |
|----------|---------------|
| `COFFEES` | The catalog: one object per coffee |
| `ORIGINS`, `ROASTS`, `PROCESSES` | Filter keys and their labels |
| `SIZES` | Bag sizes: `id`, `label`, `grams` and `factor` (price = 12 oz price × factor, rounded to whole dollars) |
| `GRINDS` | Grind options |
| `FREE_SHIPPING`, `SHIPPING` | Free-shipping threshold and the delivery methods with prices |
| `MAX_QTY` | Largest quantity per cart line (20) |
| `STYLES`, `SUB_DISCOUNT`, `DOSE`, `FREQUENCIES`, `MAX_BAGS` | Subscription styles and prices, discount, grams per cup, schedules, bags per delivery |
| `ROAST_DAY`, `DELIVERY_LAG` | Roast weekday and days until delivery, for the delivery dates |
| `METHODS` | Brew recipes: ratio, milliliters per cup, grind, temperature, time |
| `TIERS`, `WHOLESALE_DOSE` | Wholesale price tiers and grams per drink (section 13) |

To add a coffee, add an object to `COFFEES`:

```js
{
  id: 'sidama-bensa', name: 'Bensa Natural', origin: 'ethiopia', region: 'Sidama',
  process: 'natural', roast: 'light', price: 23, rating: 4.8, reviews: 12, badge: 'New',
  notes: ['Strawberry', 'Cacao', 'Lime'], profile: { acidity: 4, sweetness: 5, body: 3 },
  producer: 'Bensa smallholders', altitude: '2,100 m', variety: 'Ethiopian landraces', harvest: 'January 2026',
  bag: '#e86a8f', brew: 'v60',
  blurb: 'Strawberry jam and cacao, with a lime-bright finish.'
}
```

- `id` is used in URLs (`product.html?id=sidama-bensa`) and in the saved cart: lower case, no spaces.
- `origin`, `roast` and `process` must be keys of `ORIGINS`, `ROASTS` and `PROCESSES`. A new origin also
  needs a checkbox in the filter form in `shop.html` (copy one `<label class="check">` and change `value`
  and `data-count-for`).
- `price` is the 12 oz price in dollars; `brew` is a key of `METHODS`; `bag` is the bag color.
- `featured: 1` to `4` puts the coffee on the home page in that order; `badge` adds a sticker.

The product page's HTML contains Kochere Lot 7 as default text, which the script replaces with the coffee
from the URL. The static tables (wholesale tiers in `wholesale.html`, prices paid in `about.html`) and the
shipping copy ("Free shipping over $45") are plain HTML: update them when you change `TIERS`,
`FREE_SHIPPING` or `SHIPPING`.

### Images and artwork

There are no photos. Every coffee "photo" is an SVG drawn by `art(coffee, view)` in `main.js`: view `0` is
the bag (color from `coffee.bag`, origin, process and roast dots on the label, a sun, waves or moon for the
roast), view `1` the roasted beans. Any element with `data-art="<coffee id>"` (and optionally
`data-view="1"`) is filled with it, as in the home hero.

To use photos instead, return an `<img>` from `art()` (keep the 4:5 aspect ratio of the frames, for
example 1200×1500 px) or replace the `data-art` element with an `<img>`. Other illustrations (roast icons,
the sourcing globe on `about.html`) are inline SVG in the pages.

The social image is `assets/img/og-image.png` (1200×630), rendered from `og-image.svg`. Edit the SVG and
export a PNG of the same size; social sites don't display SVG. The favicon is `assets/img/favicon.svg`.

### Navigation, header and footer

The header, mobile menu, footer, cart drawer and toast are repeated in every page. To add or remove a
page, edit the `<nav aria-label="Main">` list, the `#mobile-menu` list and the footer columns in each file.
Mark the current page's links with `aria-current="page"`; the styles highlight it. The announcement bar
above the header is the first `<p>` after the skip link.

## Features

### Shop filters

`initShop()` in `main.js`. The checkboxes in `#filters` (names `roast`, `origin`, `process`) filter
`COFFEES`: options in one group are combined with OR, groups with AND. `#sort` orders by featured, price,
roast level or name. The result count (`#result-count`) is a live region; active filters appear as chips
in `#active-filters` that remove themselves on click, and `[data-reset-filters]` buttons clear everything.
On phones the form is collapsed behind `#filters-toggle` (`aria-expanded`).

The URL keeps the state, so filtered views can be shared and linked:
`shop.html?roast=light,medium&origin=ethiopia&process=washed&sort=price-asc`. Parameter names and values
are case-insensitive, values can be comma-separated or repeated, and anything that isn't one of the
template's own keys is ignored.

### Product page

`initProduct()`. `?id=` picks the coffee (case-insensitive); a missing or unknown id shows the first
coffee. The page title, text, tasting profile bars (`profile`), origin details, brew recipe (from
`METHODS[coffee.brew]`), gallery, size cards and grind options are all filled from the data. Prices per
size come from `unitPrice()`; the add button shows the line total and the quantity is kept between 1 and
`MAX_QTY`. The gallery thumbnails are buttons with `aria-pressed`. Related coffees prefer the same roast.

### Cart and drawer

The cart is managed by the `Cart` object; `[data-add]` buttons (on every coffee card) add a 12 oz whole
bean bag. Any `[data-cart-open]` element opens the drawer `#cart-drawer`: it traps focus, closes with
Escape, the close button or the overlay, and returns focus to the button that opened it. Lines have a
quantity stepper and a remove button, and focus stays on the control you used. The free-shipping bar
(`shippingProgress()`) is a `role="progressbar"`. The header badge (`[data-cart-count]`) and the cart
button's label update everywhere, also across open tabs (the `storage` event). The header cart button is a
link to `checkout.html`, so it still works without JavaScript.

### Subscription builder

`initSubscribe()`. The plan is `{ style, size, bags, freq, grind }`. Each change updates the summary
(`[data-plan]` elements), the prices on the option cards, and saves the plan. `planPrice()` works out
the bag price (`STYLES` price × size factor × (1 − `SUB_DISCOUNT`)), the price per delivery, the price per
cup (`DOSE` grams per cup), an average monthly cost and the saving against shop prices. The "Change"
buttons (`[data-edit]`) scroll to their step and focus its current choice. `?style=bright` (from product
pages) preselects a style.

Delivery dates come from `deliveryDates(from, freq, count)`: the first delivery is `DELIVERY_LAG` days after
the next `ROAST_DAY` after today, then one every `freq` weeks. They are plain text, formatted as
"Thu, Oct 15" in the visitor's time zone, and look the same on every date.

### Checkout

`initCheckout()`. Three steps (`[data-step]`) with a step indicator (`aria-current="step"`). Each submit
validates only the current step, then moves on and focuses the next heading. The payment step shows a
review of the details with edit buttons (`[data-goto]`). Delivery methods come from `SHIPPING`; standard
is free from `FREE_SHIPPING`. Card number and expiry are formatted as you type. Placing the order shows
`#checkout-done` with an order number (`FC-` and four characters, made in the browser by `makeRef()` in
section 14) and empties the cart. The confirmation says a confirmation email is on its way and that the coffee
is roasted on Monday and shipped on Tuesday, like the banner and the footer: change them together if yours
differ, and show your payment provider's order number instead if it returns one. The banner at the top says
payments are in test mode and gives the test card number; remove it when you connect a real provider.
**No payment is taken.** To take real payments, send the cart to your provider (Stripe Checkout, PayPal, Shopify Buy Button…) in the
form's submit handler instead of showing the confirmation.

### Brew guides

`initBrew()`. A WAI-ARIA tab list: arrow keys, Home and End move between tabs, and the URL hash opens
one (`brew.html#cold`, case-insensitive). The recipe scaler multiplies the open method's `cup` by the cups
slider and divides by its ratio (strength moves the ratio by one; espresso keeps 1:2).

### Wholesale estimator

`initWholesale()`: drinks a day × `WHOLESALE_DOSE` × days open gives pounds per week, the matching tier from
`TIERS`, and the weekly spend. The matching row of the price table gets the class `is-current`.

### Scroll reveal, ticker and back to top

Elements with `.reveal` fade in when scrolled into view (everything above is revealed too). The home
page's tasting-note ticker scrolls with CSS (`.ticker`). Both stop for visitors who prefer reduced motion.
The back-to-top button is created by the last block of `main.js`; delete that block and the
`.back-to-top` styles to remove it.

## Forms

All forms are validated by `setupValidation()` in `main.js` (the checkout uses the same rules step by step):
errors appear on blur and submit, the first invalid field is focused, and each error is linked with
`aria-describedby`.

| Attribute | Rule |
|-----------|------|
| `required` | Must not be empty (checkboxes must be checked) |
| `type="email"`, `type="tel"` | Must look like an email address / phone number |
| `minlength` | Minimum length |
| `data-label` | Name used in the error message |
| `data-validate` | `zip`, `order`, `card`, `expiry` or `cvc` |
| `data-group` (on a fieldset) | At least one checkbox checked; message from `data-msg` |

| Form | Where | Behavior |
|------|-------|-----------|
| Newsletter (`data-form="newsletter"`) | Every footer | Replaced with a thank-you message |
| Subscription sign-up (`data-form="subscribe"`) | `subscribe.html#start` | Confirms the saved plan, first delivery date and a reference |
| Wholesale (`data-form="wholesale"`) | `wholesale.html#enquiry` | Replaced with a thank-you message and a reference |
| Contact (`data-form="contact"`) | `contact.html` | Replaced with a thank-you message and a reference |
| Checkout (`#checkout-form`) | `checkout.html` | Shows the order confirmation |

The newsletter thank-you asks subscribers to look out for a confirmation email. The contact message promises a
reply within one business day and the wholesale one a reply within two business days (as the wholesale page
says); the subscription confirmation gives the first delivery date and says you email two days before every
roast. Each shows a reference (`FC-` and four characters, from `makeRef()`), and the contact form's order
number field (`data-validate="order"`) accepts the same shape. Change the wording to match what really happens,
and show your form service's own reference if it returns one. **Nothing is sent** until you connect the forms,
although their messages read as if it had been. To collect submissions, post the form in its callback in section 14 of
`main.js`, for example to Formspree:

```js
$$('[data-form="contact"]').forEach((form) => setupValidation(form, () => {
  fetch('https://formspree.io/f/your-id', {
    method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }
  }).then((res) => successSwap(form, res.ok ? '<p>Thanks for writing.</p>' : '<p>Something went wrong. Please email us.</p>'));
}));
```

Every field has a `name`, so `FormData` carries all the values; keep a `name` on any field you add.

## Saved data (localStorage)

| Key | Value | Used for |
|-----|-------|----------|
| `firstcrack-cart` | JSON array of `{ id, size, grind, qty }` | Cart contents |
| `firstcrack-plan` | JSON object `{ style, size, bags, freq, grind }` | The subscription plan being built |

Both are validated every time they are read (`normalizeCart()`, `normalizePlan()`): ids, sizes, grinds and
styles must be the template's own keys (any letter case), quantities are whole numbers from 1 to `MAX_QTY`
(bags 1 to `MAX_BAGS`), frequencies must be in `FREQUENCIES`, duplicate cart lines are merged, and corrupt or
tampered data is replaced with the cleaned version. Prices are never stored. To reset, remove the keys in the
browser's developer tools (Application > Local storage) or run `localStorage.clear()` in the console. If
storage is blocked, the shop still works but forgets the cart on reload.

## SEO and sharing

Each page has its own `<title>`, meta description and Open Graph tags in its `<head>`; the product page
updates its title from the coffee shown. `og:image` is the relative `assets/img/og-image.png`: once you
know your domain, make it absolute (`https://example.com/assets/img/og-image.png`) on every page, because
social sites need full URLs. `404.html` has `noindex`. Consider adding a `sitemap.xml`, a `robots.txt` and
`Product` structured data (JSON-LD) for each coffee if you sell for real.

## Accessibility

- Skip link, landmarks, one `h1` per page and a logical heading order.
- `aria-current="page"` in the menus, `aria-current="step"` in the checkout.
- Keyboard support everywhere: the cart drawer traps focus and closes with Escape, the mobile menu closes
  with Escape, the brew tabs follow the WAI-ARIA tabs pattern, radio cards keep native radio behavior.
- Live regions for the result count, the plan summary, the scaler and estimator results, toasts and form
  status; errors are linked to their fields.
- Visible focus outlines, AA contrast, and `prefers-reduced-motion` turns off reveals, the ticker and
  smooth scrolling.

When editing, keep one `h1` per page, give new inputs a `<label>` and a `name`, and keep icon-only buttons'
`aria-label`.

## Building and deploying

`assets/css/style.css` is compiled from `src/input.css` and the classes in the HTML and `main.js`. Rebuild
it whenever you use a class that isn't already in the template:

```sh
npm install
npm run build     # once, minified
npm run watch     # rebuild on every change
```

To publish, upload the whole folder to any static host: Netlify Drop, GitHub Pages, Cloudflare Pages, Vercel
or your own server. No server code is needed.

## Troubleshooting

- **A new class has no effect.** Rebuild the CSS (`npm run build`). Classes only built in JavaScript must
  appear literally in `main.js` for Tailwind to find them.
- **The cart doesn't survive a reload.** The browser is blocking localStorage (some private windows or
  strict privacy settings). The shop works, but nothing is saved.
- **A new coffee doesn't appear under a filter.** Its `origin`, `roast` or `process` must be a key of
  `ORIGINS`, `ROASTS` or `PROCESSES`, and a new origin needs a checkbox in `shop.html`.
- **`product.html?id=…` shows the wrong coffee.** Unknown ids fall back to the first coffee; check the id
  matches `COFFEES`.
- **Delivery dates look a day off.** They use the visitor's own time zone and clock. Change `ROAST_DAY`
  (0 = Sunday) and `DELIVERY_LAG` to match your schedule.
- **Fonts look different offline.** The fonts come from Google Fonts; without a connection the system
  fallback is used.

## License

MIT: free for personal and commercial use. See `LICENSE.txt` in the download. The SVG artwork, logo and
social image are part of the template and covered by the same license.
