# Petal documentation

## Overview

Petal is a shop website for a florist with same-day local delivery, built for **Hollyhock**, a fictional
independent flower shop on Mulberry Street in Macon, Georgia. It has a seasonal home page with a live "order by 1pm for
same-day delivery" countdown, a shop filtered by occasion, color and price, product pages with sizes, a
delivery calendar and a gift message, a cart saved in the browser with a ZIP code check and delivery
charges, a demo checkout, a flower subscription builder with the savings worked out, a weddings and events
page with an estimate and inquiry form, a day-by-day flower care guide, an about and contact page and a 404
page. It is plain HTML with Tailwind CSS v4 and one vanilla JavaScript file, with no build step needed to use
it. This guide covers version 1.0.6. See it live at
[freeframe.dev/templates/petal](https://freeframe.dev/templates/petal).

## Quick start

1. Unzip the download and open `index.html` in a browser. Every page works from the file system.
2. Or serve the folder, which is closer to how it runs on a host:

   ```sh
   npx serve .
   ```

3. You only need Node.js 24 or newer if you change the CSS classes (see
   [Building and deploying](#building-and-deploying)).

Everything that depends on the time (the countdown, the delivery calendar, the season colors, open-now
badges) follows the shop's clock in `America/New_York` (Eastern time). To preview another moment, add `?now=` to any page URL,
for example `index.html?now=2026-10-17T12:58` (two minutes before the cut-off) or
`product.html?id=peony-blush&now=2026-10-18T10:00` (a Sunday). The preview clock keeps ticking from there.

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Seasonal hero with the bouquet drawn in the season's colors, live same-day countdown, "in season now" list, bestsellers (from the product data), shop by occasion with counts, how delivery works, ZIP code checker, subscription teaser, reviews |
| `shop.html` | Shop | Occasion, color and price filters, sort, live result count, shareable links (`shop.html?occasion=birthday&colour=pink&price=under-60&sort=price-asc`), empty state |
| `product.html` | Product | `product.html?id=peony-blush&size=generous`: three sizes with prices, delivery calendar, gift message with counter and card preview, add to cart, related bouquets |
| `basket.html` | Cart | Lines with delivery day, quantity and gift message, ZIP code check, delivery charge per delivery day, total, notice when a saved date has passed, last order when empty |
| `checkout.html` | Checkout (demo) | Recipient, address, ZIP code check, your details, demo card, validation, order number and confirmation |
| `subscriptions.html` | Subscriptions | Weekly, every two weeks or monthly; size; delivery day; price per delivery, per month and per year, the yearly saving and the first four dates (`subscriptions.html?plan=weekly&size=classic`) |
| `weddings.html` | Weddings & events | Recent work, rough estimate with steppers, inquiry form with an 8-week minimum date |
| `care.html` | Flower care | Day-by-day plan from the delivery date, the basics, searchable flower-by-flower tips |
| `about.html` | About & contact | Story, team, delivery zones table (`about.html#delivery`), hours with today highlighted, map, contact form (`about.html#contact`), FAQ with the next Valentine's Day and Mother's Day |
| `404.html` | Not found | Links back to home and the shop |

## Project structure

```text
petal/
  index.html … about.html, 404.html   the pages (header, footer and toast repeated in each)
  assets/css/style.css                compiled Tailwind CSS (generated, do not edit)
  assets/js/main.js                   all JavaScript: settings, bouquets, art, cart and every page's features
  assets/img/favicon.svg              browser icon
  assets/img/og-image.svg             social image source (1200×630)
  assets/img/og-image.png             social image used by the pages
  src/input.css                       Tailwind source: brand tokens, season colors and component classes
  package.json                        scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

The design tokens are in the `@theme` block of `src/input.css`. Every utility such as `bg-fern` or
`text-peony-deep` comes from them.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-paper` | `#ffffff` | Page background |
| `--color-snow` | `#f6f7f3` | Quiet panels |
| `--color-line` | `#e2e6df` | Hairlines |
| `--color-ink` | `#14201a` | Text, outlines, dark buttons |
| `--color-muted` | `#53605a` | Secondary text |
| `--color-fern` / `--color-fern-deep` | `#0d6a44` / `#094d31` | Brand: buttons, links, footer |
| `--color-mint` | `#dcf2e5` | Fern tint, success panels |
| `--color-peony` / `--color-peony-deep` | `#e0306f` / `#b0154f` | Pink accents; the deep shade for pink text and errors |
| `--color-blush`, `--color-butter`, `--color-sky`, `--color-lilac` | pastel tints | Product card backgrounds and panels |
| `--color-marigold`, `--color-cornflower`, `--color-poppy` | bright accents | Decoration, badges, numbers |

To change the brand color, edit the tokens and rebuild the CSS:

```css
@theme {
  --color-fern: #6b2fa3;
  --color-fern-deep: #4d1f78;
  --color-mint: #efe4fb;
}
```

#### Season colors

Below `@theme`, `:root[data-season="spring"]` (and `summer`, `autumn`, `winter`) set five variables:
`--season-1`, `--season-2`, `--season-3` (the hero bouquet's flowers), `--season-soft` (the hero circle,
countdown card and care plan panel) and `--season-ink` (the delivery band and the season word, so it must pass
AA contrast against white). `main.js` sets `data-season` on `<html>` from the month in the shop's time zone;
a small script in each page's `<head>` does the same before the page paints. The months for each season and
the "in season now" flowers are `SEASONS` in `main.js`.

### Typography

Two Google Fonts are loaded by the `<link>` in the `<head>` of every page:

| Token | Font | Used for |
|-------|------|----------|
| `--font-display` | Noto Serif Display (roman and italic) | Headings, prices, the wordmark, the countdown |
| `--font-sans` | Work Sans | Body text and UI |

To swap a font, change the Google Fonts URL in every page and the matching token in `src/input.css`, then
rebuild the CSS. `assets/img/og-image.svg` names both fonts for its text.

### Content

Text lives in the HTML files. Everything the scripts work from is at the top of `assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `SHOP` | Name, address, phone and email used in messages |
| `TIMEZONE`, `LOCALE`, `CURRENCY` | `America/New_York`, `en-US`, `USD` |
| `HOURS` | Studio opening hours per weekday, Sunday first, `['08:30', '17:30']` or `null` for closed |
| `DELIVERY` | `cutoff` (`'13:00'`), `days` (`[1, 2, 3, 4, 5, 6]`, Monday through Saturday), `daysAhead` (27), `messageMax` (200), `fromMax` (40), `maxQty` (10) |
| `CLOSED_DATES` | Days with no deliveries every year, as `'MM-DD'`: `'01-01'`, `'07-04'`, `'12-25'` |
| `CLOSED_RULES` | Holidays that move, worked out for any year as `[month, weekday, nth]`: Memorial Day, Labor Day, Thanksgiving. Only the day itself closes, not an observed day |
| `PEAK_DAYS` | Valentine's Day and Mother's Day, by rule; `[data-peak-days]` in the `about.html` FAQ shows the next dates |
| `KEEP_DEMO_CURRENT`, `DEMO_ANCHOR`, `FULLY_BOOKED` | Fully booked days (see [Fully booked days](#fully-booked-days)) |
| `ZONES` | Delivery zones: `id`, `label`, ZIP codes in `districts`, `fee` per delivery day, `sameDay` |
| `SEASONS` | Months and "in season now" flowers for spring, summer, fall (the `autumn` key) and winter |
| `OCCASIONS`, `COLOURS`, `PRICE_BANDS`, `SORTS` | Shop filter options (keys are what goes in the URL) |
| `SIZES`, `SIZE_ORDER` | `classic`, `generous`, `abundant`: label, price on top of the classic price (`add`), stems text and extra flowers in the drawing |
| `PRODUCTS` | Every bouquet |
| `SUBSCRIPTION` | Plans (`perYear`, `discount`, `every` in days), sizes with their one-off price, delivery `days`, dates shown |
| `WEDDING` | Estimate items (`price`, `max`), `setupRate` (0.15), `setupMin` ($250), `minSpend` ($1,000), `leadWeeks` (8) |
| `CARE_PLAN`, `FLOWER_CARE` | The care guide's day-by-day steps and flower tips |

Add a bouquet by adding an object to `PRODUCTS`:

```js
{ id: 'sweet-pea-jar', name: 'Sweet Pea Jar', price: 50, tint: 'tint-purple',
  occasions: ['thank-you', 'just-because'], colours: ['pink', 'purple'],
  blurb: 'A mason jar of scented sweet peas, picked that morning.',
  details: 'March to May only. They last four or five days and smell wonderful.',
  art: { wrap: 'jug', jug: '#ffffff', rim: '#8e5bd6', shape: 'loose', foliage: 'fern',
    heads: [['daisy', '#f7a1c0'], ['daisy', '#b79ae8'], /* … up to nine heads */] } },
```

| Field | Meaning |
|-------|---------|
| `id` | Unique; used in the URL (`product.html?id=…`) and the cart |
| `price` | Classic size, in dollars; the other sizes add `SIZES[size].add` |
| `tint` | Card background: `tint-pink`, `tint-yellow`, `tint-blue`, `tint-green`, `tint-purple`, `tint-snow` or `tint-season` |
| `bestseller` | Optional: 1 to 4, its place on the home page |
| `occasions`, `colours` | Keys from `OCCASIONS` and `COLOURS` (the shop filters) |
| `blurb`, `details` | Short and long descriptions |
| `art` | How it's drawn (see [Images and artwork](#images-and-artwork)) |

The home page's "See all 12 bouquets" link, the subscription prices in the home teaser and the delivery zones
table on `about.html` are plain HTML: update them alongside the data.

### Images and artwork

There are no photos. All artwork is SVG:

- **Bouquets** are drawn by `Art.bouquet(art, extra, key)` in section 7 of `main.js` (a 240×280 drawing), from a
  product's `art` object:
  - `wrap`: `'paper'` (needs `paper` and `ribbon` colors), `'box'` (a hatbox: `box`, `band`) or `'jug'`
    (`jug`, `rim`).
  - `shape`: `'dome'`, `'tall'` or `'loose'`.
  - `heads`: up to nine `[kind, color]` pairs, most important first. Kinds: `rose`, `peony`, `dahlia`,
    `ranunculus`, `anemone`, `daisy`, `tulip`. The classic size draws five; generous adds two, abundant four.
  - `spikes`: optional colors of delphinium-style spires. `foliage`: `'eucalyptus'`, `'leaf'`, `'fern'` or
    `'none'`.
  - Colors can be hex values or CSS variables such as `'var(--season-1)'`. The `key` (the product id) seeds the
    small random tilts, so a bouquet always looks the same.
- The **hero bouquet** on the home page is the same drawing, inlined in `index.html` with season variables. The
  team portraits, map, empty cart and 404 flower are inline SVG in their pages.
- `<div data-art="product-id" data-size="abundant">` anywhere draws that bouquet (used on `weddings.html`).

To use photos instead, replace `bouquetArt(p)` in `productCard()` with an `<img>` (keep the 6:7 tile) and give
each product an image path. The product page's drawing is `[data-p-art]`.

The social image is `assets/img/og-image.png` (1200×630), rendered from `og-image.svg`. The favicon is
`assets/img/favicon.svg`.

### Navigation, header and footer

The delivery band, header, mobile menu, footer and toast are repeated in every page. To add or remove a page,
edit the `<nav aria-label="Main">` list, the `#mobile-menu` list and the footer lists in every HTML file. Mark
the current page's links with `aria-current="page"`. Each page's `<body data-page="…">` tells `main.js` which
features to start (`home`, `shop`, `product`, `basket`, `checkout`, `subscriptions`, `weddings`, `care`).

## Features

### Shop clock and the same-day cut-off

All times use the florist's clock (`TIMEZONE`) through `shopNow()`, so a visitor abroad sees the shop's real
state. `deliveryState(date)` decides whether a date can be booked: not in the past, not more than
`DELIVERY.daysAhead` days ahead, a delivery weekday (`DELIVERY.days`), not in `CLOSED_DATES`, not fully booked,
and, for today, before `DELIVERY.cutoff`. `earliestDelivery()` is the first date that passes.

The countdown (`[data-countdown]` on the home page) and the delivery band at the top of every page
(`[data-delivery-band]`) update every second (`renderClock()`):

- Before 1pm on a delivery day: "02:14:36 left to order for delivery today" and "Order in the next 2h 14m 36s
  for delivery today in Macon".
- After the cut-off, on Sundays, on holidays and on fully booked days, they roll on to the next delivery day:
  "Tomorrow is the next delivery day" with "Same-day orders closed at 1pm. Order any time for Monday,
  October 19." The text never shows a stale date.

`[data-open-status]` shows whether the studio is open from `HOURS`, and `[data-hours-list]` lists the week
with today highlighted. To change the cut-off, edit `DELIVERY.cutoff` and the "1pm" in the page copy.

### Fully booked days

`FULLY_BOOKED` lists days the vans are full. While `KEEP_DEMO_CURRENT` is `true`, those dates move forward by
whole weeks from `DEMO_ANCHOR` (`'2026-10-17'`), so the demo always shows a few fully booked days in the next
two weeks and their weekdays never change. **Set `KEEP_DEMO_CURRENT = false` once you enter real dates**, or
your dates will be shifted too.

### Shop filters

`initShop()` renders the filter buttons from `OCCASIONS`, `COLOURS` and `PRICE_BANDS` (classic price) and the
sort menu from `SORTS`. Pressing a button again clears it. The URL is kept in step (`?occasion=`, `?colour=`,
`?price=`, `?sort=`) so a filtered page can be shared. Values from the URL are only used if they are a key of
the matching constant. The filters are buttons with `aria-pressed`, grouped and labeled, and the result count
("4 bouquets · birthday, pink") is a live region.

### Product page and delivery calendar

`initProduct()` reads `?id=` (unknown ids show a "We couldn't find that bouquet" page) and an optional
`?size=`. Choosing a size updates the price and redraws the bouquet with more flowers. The calendar shows today
to `DELIVERY.daysAhead` days ahead, Monday first. Sundays, holidays and past days are grayed out; fully booked
days are struck through in pink; after the cut-off today is disabled. Each day is a button with
`aria-pressed` and a full label ("Wednesday, October 28, fully booked"). The calendar is one tab stop: arrow keys
move between available days (up and down move a week), Home and End jump to the first and last.

The gift message is limited to `DELIVERY.messageMax` characters with a "200 characters left" counter, and is
shown on the card preview as you type. It is saved as a draft per bouquet (`petal-gift-drafts`) so it survives a
reload, and cleared once the bouquet is in the cart. "Add to cart" shows a toast with a link to the cart.

### Cart

`basket.html` (`initBasket()`) lists each line with its drawing, size, a delivery day select (every available
day), a quantity stepper (1 to `DELIVERY.maxQty`), a gift message and "From" field that save as you type, and
Remove. After −, + or Remove, keyboard focus stays on the same button; if the line has gone it moves to the
same button on the next line (or the previous one), and to the "Shop bouquets" link when the cart is empty.
The quantity is a live region, so the new number is read out.

Lines are merged when bouquet, size, day, message and sender all match. If a saved delivery day is no longer
available (it has passed, or the cut-off went by), the line moves to the earliest delivery day and a notice
says so.

### ZIP code check and delivery charge

The cart's ZIP code form (and the "Do we deliver to you?" box on the home page) checks the format (5 digits, with
an optional +4, so 31201 or 31201-1234) and looks up the first five digits in `ZONES`:

| Zone | ZIP codes | Fee per delivery day | Same day |
|------|-----------|----------------------|----------|
| Macon | 31201, 31204, 31206, 31210, 31211, 31216, 31217, 31220 | $10 | Yes |
| Towns around Macon | 31008 (Byron), 31020 (Dry Branch), 31052 (Lizella) | $15 | Yes |
| Farther out in Middle Georgia | 31028 (Centerville), 31029 (Forsyth), 31061 (Milledgeville), 31088 and 31093 (Warner Robins) | $25 | No |

The delivery charge is the zone's fee once for each different delivery day in the cart: two bouquets on
Tuesday and one on Friday to 31204 is 2 × $10 = $20. A ZIP code in a no-same-day zone with a line for today flags
that line and holds checkout until the day is changed. "Continue to checkout" stays disabled
(`aria-disabled`) until a ZIP code in a zone is saved.

Prices exclude sales tax: the cart, checkout and confirmation say "Total before tax", and the template doesn't
calculate tax. Add your state and local rate, or let your payment provider work it out, when you take real
payments.

### Checkout

`initCheckout()` shows the recipient, address and ZIP code (prefilled from the cart and checked again), your
details and a demo card form (Luhn-checked number in groups of four, `MM / YY` expiration, CVC), with the summary and
delivery charge alongside. On a valid submit it creates an order number (`HH-` and five digits), saves a short
summary to `petal-last-order`, empties the cart and shows a confirmation. The empty cart and checkout pages
show the last order.

### Subscription builder

`initSubscriptions()` builds the plan and size cards from `SUBSCRIPTION`. The math, for a size's one-off price
`P` and a plan's `discount` and `perYear`:

| Figure | Formula | Every two weeks, generous (default) |
|--------|---------|-------------------------------|
| Per delivery | `P × (1 − discount)` | $80 × 0.85 = $68 |
| A year | per delivery × `perYear` | $68 × 26 = $1,768 |
| A month | a year ÷ 12 | $147.33 |
| You save | `(P − per delivery) × perYear` | $12 × 26 = $312 |

Weekly classic is $48 a delivery and saves $624 a year; monthly abundant is $90 and saves $120. The
first delivery is the chosen weekday at least two days away; the next three follow every `every` days, and a
delivery that lands on a `CLOSED_DATES` day moves to the next delivery day. The URL keeps `?plan=` and `?size=`; the "Every two weeks" plan's key is still `fortnightly`.

### Wedding estimate

`initWeddings()` lists `WEDDING.items` with steppers (the defaults are one bridal bouquet, six boutonnieres and
eight centerpieces: $225 + $108 + $680 = $1,013, plus setup of 15% = $152, raised to the $250 minimum, so $1,263).
Below `WEDDING.minSpend` a note explains the minimum. The rough total goes into the inquiry form's hidden
`estimate` field.

### Flower care guide

`initCare()` takes the delivery date (today back to 30 days ago) and highlights the step of `CARE_PLAN` for that
day ("Day 3: they arrived Thursday, October 15"), marking earlier steps done. The flower search filters
`FLOWER_CARE` by name or tip, with a live count.

### Back to top

A back-to-top button appears after one screen of scrolling. Remove the block at the end of `main.js` and
the `.back-to-top` styles in `src/input.css` to drop it.

## Forms

| Form | Where | Validates |
|------|-------|-----------|
| Flower note sign-up (`data-form="newsletter"`) | Footer, every page | Email |
| ZIP code checker (`data-form="zone-check"`) | `index.html` | ZIP code format, then the zone |
| ZIP code (`#postcode-form`) | `basket.html` | ZIP code in a delivery zone |
| Checkout (`#checkout-form`) | `checkout.html` | Recipient, address, city or town, ZIP code in a zone, optional phone, notes up to 150 characters, your name, email and phone, card, expiration, CVC, confirmation box |
| Subscription (`#sub-form`) | `subscriptions.html` | Name, email, ZIP code in a zone |
| Wedding inquiry (`#wedding-form`) | `weddings.html` | Names, email, optional phone, date at least 8 weeks and at most 2 years ahead, guests 1–400, venue, message up to 600 characters |
| Contact (`data-form="contact"`) | `about.html` | Name, email, topic, optional order number (`HH-12345`), message of 10–800 characters |

Validation is inline: errors appear under each field on blur and submit (`fieldMessage()` in section 17), the
first invalid field gets focus, and a success panel replaces the form. **The forms send nothing until you
connect them**, even though the success panels read as if they had. The subscription, wedding inquiry and
contact panels show a short reference (`HH-` and four characters, made in the browser by `makeRef()` in
`main.js`); if your form service returns its own reference, show that instead. The panels promise a reply
within a business day (contact, subscription) or two business days (weddings), as the pages already say, the
order confirmation says a confirmation email follows, and the flower note asks people to look out for a
confirmation email: change them to match how your shop works. The checkout and subscription pages say no
payment is taken; change those notes once you take payment.

To connect a form to a form service such as Formspree, replace the `successSwap(...)` call in `initForms()`
(or in `initWeddings()` / `initSubscriptions()`):

```js
$$('[data-form="contact"]').forEach((form) => setupValidation(form, () => {
  fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    .then((r) => r.ok ? successSwap(form, '<p class="display text-3xl">Thanks, we’ll be in touch.</p>') : alert('Sorry, that didn’t send.'));
}));
```

Every field already has a `name`. For real orders, send the cart and the form in the checkout's submit
handler (a comment marks the spot) to your order system, and take payment with your provider (Stripe
Checkout, Square, SumUp…) before showing the confirmation. Remove the demo card fields when you do.

## Saved data (localStorage)

| Key | Shape | Notes |
|-----|-------|-------|
| `petal-basket` | `{ lines: [{ id, size, date, message, from, qty }], postcode }` | `date` is `YYYY-MM-DD`; `postcode` is the last checked ZIP code in a zone (the key is still `postcode`), e.g. `"31204"` |
| `petal-gift-drafts` | `{ "<product id>": { message, from } }` | Unsent gift messages on product pages |
| `petal-last-order` | `{ number, placedAt, summary, total }` | Written at checkout; shown on the empty cart and checkout pages |

Everything is checked on every read (`normalizeBasket()`, `readDrafts()`, `readLastOrder()`), with own-key
lookups so values such as `toString` never match: unknown bouquets and sizes are dropped, text is trimmed to its
limit and stripped of control characters, quantities become whole numbers from 1 to `DELIVERY.maxQty`,
duplicate lines merge, unavailable dates move to the earliest delivery day, ZIP codes outside the zones are
cleared, and the repaired cart is written back. Prices are never stored; they always come from `PRODUCTS` and
`SIZES`. Open tabs stay in sync through the `storage` event.

When the browser blocks localStorage (a sandboxed iframe or strict privacy settings), `safeStorage` keeps the
same data in memory for the page view, so the cart still works on that page. To reset, run
`localStorage.removeItem('petal-basket')` in the console, or clear the site's data.

## SEO and sharing

Each page has its own `<title>`, meta description and Open Graph tags in the `<head>`. The product page
updates its title and description for the bouquet. The `og:image` is the relative path
`assets/img/og-image.png`; social sites need an absolute URL, so change it on every page once you know your
domain:

```html
<meta property="og:image" content="https://www.hollyhockflowers.example/assets/img/og-image.png">
```

Also consider adding `<link rel="canonical">`, a `sitemap.xml` listing the pages (leave out `404.html`,
`basket.html` and `checkout.html`) and a `robots.txt`. A `Florist` schema.org block (name, address, opening
hours, telephone, area served) in `index.html` helps local search.

## Accessibility

- Skip link, landmarks, one `<h1>` per page and logical headings.
- Visible focus outlines; WCAG AA color contrast, including each season's `--season-ink`.
- The mobile menu button has `aria-expanded` and closes with Esc.
- Filter buttons and calendar days use `aria-pressed`; the calendar is one tab stop with arrow-key movement and
  each day's label says why it's unavailable.
- Result counts, the countdown's state, the ZIP code result, the estimate and toasts are live regions; the
  ticking digits themselves are not announced every second.
- Cart steppers keep keyboard focus after −, + and Remove.
- Form errors are linked with `aria-describedby` and fields get `aria-invalid`.
- Scroll reveals and the swaying bouquet are off with `prefers-reduced-motion`.

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

- **The countdown is an hour out.** `TIMEZONE` must be an IANA name such as `America/New_York`, not an offset.
  Your computer's clock is not used, so check it with `?now=`.
- **Today never shows as available.** It's after `DELIVERY.cutoff`, today isn't in `DELIVERY.days`, it's in
  `CLOSED_DATES`, or it's one of the fully booked days.
- **My fully booked dates are on the wrong days.** `KEEP_DEMO_CURRENT` is still `true`, so they are shifted.
  Set it to `false`.
- **A ZIP code is refused.** Its first five digits must be in a zone's `districts`, and the whole value must be
  5 digits or ZIP+4.
- **A new class does nothing.** Rebuild the CSS. Classes used only in JavaScript must appear literally in
  `main.js`, not built from pieces.
- **The cart lost a bouquet.** Stored carts are repaired against `PRODUCTS`; if you renamed an `id`, old
  carts drop that line. Clear `petal-basket` to start fresh.
- **Fonts look different offline.** The fonts come from Google Fonts; without a connection the system
  fallbacks are used.

## License

MIT. See the repository license (`LICENSE.txt` in the download). All artwork is included under the same
license. Noto Serif Display and Work Sans are licensed under the SIL Open Font License. Hollyhock, its people
and its reviews are fictional.
