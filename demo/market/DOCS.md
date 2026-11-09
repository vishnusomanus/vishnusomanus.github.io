# Market documentation

## Overview

Market is a complete storefront for **Kiln & Co.**, a fictional handmade-ceramics studio: home, a filterable
shop, product pages with glaze and size variants, a cart saved in the browser, a slide-out mini cart, a
validated checkout, an about page and a searchable FAQ with a contact form. Product images are drawn in
SVG from the product data, so there are no photos to replace before launch. This is the **HTML + Tailwind CSS
v4** version, **version 1.1.11**, with vanilla JavaScript and no runtime dependencies. See it live at
[freeframe.dev/templates/market](https://freeframe.dev/templates/market).

## Quick start

Open `index.html` in a browser, or serve the folder (recommended, so links with query strings behave like they
will in production):

```sh
npx serve .
```

To change styles you need Node.js 24 or newer:

```sh
npm install
npm run watch     # rebuilds assets/css/style.css while you edit
npm run build     # one-off minified build
```

| Command | What it does |
|---------|--------------|
| `npm run build` | Compile `src/input.css` to `assets/css/style.css` (minified) |
| `npm run watch` | Same, rebuilding on every change |

## Pages

| File | `data-page` | What's on it |
|------|-------------|--------------|
| `index.html` | `home` | Hero with product art, shop by shape, bestsellers (rendered from `featured` products), story, reasons to buy, reviews, newsletter band |
| `shop.html` | `shop` | Product grid with category, price and sort filters and a live result count |
| `product.html` | `product` | One product, chosen by `?id=`: gallery with four views, glaze and size options, quantity, details, related products |
| `cart.html` | `cart` | Cart lines with quantity steppers, free-shipping progress, promo code, order summary |
| `checkout.html` | `checkout` | Contact, shipping address, delivery method and card fields, order summary, confirmation |
| `about.html` | `about` | Studio story, timeline, team and visit info |
| `faq.html` | `faq` | Searchable FAQ grouped by topic, and a contact form (`#contact`) |
| `404.html` | `404` | Not-found page |

`main.js` reads `<body data-page="…">` to decide which page script to run, so keep that attribute when you copy
a page.

## Project structure

```text
market/
├─ index.html, shop.html, product.html, cart.html, checkout.html, about.html, faq.html, 404.html
├─ assets/
│  ├─ css/style.css       compiled Tailwind output (don't edit; edit src/input.css)
│  ├─ js/main.js          catalog, SVG art, cart, page scripts, forms, back to top
│  └─ img/                favicon.svg, og-image.png (1200×630), og-image.svg (its source)
├─ src/input.css          Tailwind entry: brand tokens, components, animations
├─ package.json           Tailwind CLI build scripts
└─ README.md, DOCS.md, CHANGELOG.md, template.json
```

`assets/js/main.js` is split into numbered sections: 1 Product catalog, 2 SVG product art, 3 Helpers,
4 Cart, 5 Cart drawer and toast, 6 Header and mobile menu, 7 Home, 8 Shop, 9 Product page, 10 Cart page,
11 Checkout, 12 Forms and FAQ, then the back-to-top script.

## Customizing

### Brand and colors

All colors are tokens in the `@theme` block of `src/input.css`:

| Token | Default | Used for |
|-------|---------|----------|
| `--color-paper` | `#f6f1ea` | Page background |
| `--color-sand` / `--color-oat` | `#ebe3d6` / `#e2d7c6` | Panels and image tiles |
| `--color-line` | `#d9cebd` | Borders |
| `--color-ink` | `#1f1c19` | Text and primary buttons |
| `--color-stone` | `#645d54` | Muted text |
| `--color-clay` / `--color-clay-dark` | `#a1441d` / `#7f3414` | Accent, links, focus rings, badges |
| `--color-moss` | `#56653f` | Secondary accent (shipping progress bar) |
| `--color-cream` | `#fbf8f3` | Light surfaces and form fields |

Change them and run `npm run build`. Also update `<meta name="theme-color">` in each page and the colors inside
`assets/img/favicon.svg`. Button styles are `.btn-primary`, `.btn-accent`, `.btn-outline` and `.btn-light`.

### Typography

Fraunces (display, `font-display`) and Inter (body, `font-sans`) load from Google Fonts in each page's
`<head>`. To change them, edit that `<link>` in every page and the `--font-display` / `--font-sans` tokens.

### Content

Products are the `PRODUCTS` array at the top of `assets/js/main.js`. Each product looks like this:

```js
{
  id: 'ridge-vase', name: 'Ridge Vase', category: 'Vases', price: 68, shape: 'vase',
  rating: 4.9, reviews: 214, badge: 'Bestseller', featured: 1,
  blurb: 'A tall, generous vase thrown in one pull…',
  glazes: [{ name: 'Oat', color: '#e6d9c2' }, { name: 'Moss', color: '#76855a' }],
  sizes: [{ name: 'Medium · 9.5 in', delta: 0 }, { name: 'Large · 12.5 in', delta: 26 }],
  details: ['Stoneware, fired to 2300°F', 'Fully glazed inside — watertight'],
  dims: 'Medium: 9.5 in tall, 5.5 in wide. Large: 12.5 in tall, 7 in wide.'
}
```

| Field | Notes |
|-------|-------|
| `id` | Unique, used in `product.html?id=…` and in saved carts. Changing an id drops it from visitors' carts |
| `category` | Must be one of `CATEGORIES`; add new categories there and to the radio list in `shop.html` |
| `price` | Base price in dollars; each size adds its `delta` (which can be negative) |
| `shape` | `vase`, `bud`, `mug`, `cup`, `tumbler`, `bowl`, `plate`, `pitcher` or `planter` (drives the SVG art) |
| `badge` | Optional label such as `Bestseller`, `New` or `Limited` |
| `featured` | Optional; products with it appear in the home page bestsellers, sorted by the number |
| `glazes` | Color options; `color` is the glaze color in the art |
| `sizes` | Size options; the one with `delta: 0` is preselected |

Store settings sit just below the array:

| Constant | Default | Meaning |
|----------|---------|---------|
| `FREE_SHIPPING` | `75` | Subtotal for free standard shipping |
| `STANDARD_SHIPPING` / `EXPRESS_SHIPPING` | `8` / `18` | Delivery prices |
| `TAX_RATE` | `0.08` | Estimated sales tax, applied after the discount. Washington taxes online orders by delivery address, so for a real store use your payment provider's tax tool and check current rules with the Washington State Department of Revenue. |
| `PROMO` | `{ code: 'WELCOME10', rate: 0.10 }` | The demo promo code |
| `MAX_QTY` | `99` | Largest quantity per cart line |

Prices are formatted with `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })` (the `money`
helper); change the locale and currency there. The "Free shipping on orders over $75" announcement bar and the
shipping FAQ are plain text in the HTML, so update them when you change `FREE_SHIPPING`.

### Images and artwork

Every product image is generated by `art(product, glazeIndex, view)` from the product's `shape` and glaze
color. Views are `0` front, `1` glaze close-up, `2` on a shelf and `3` a pair. Place art anywhere with:

```html
<div class="art aspect-square overflow-hidden rounded-[1.75rem]" data-art="terrace-planter" data-glaze="1" data-view="2"></div>
```

To use photos instead, add an `image` field to each product and return an `<img>` from `art()` (or change
`productCard()` and the product gallery). The social image is `assets/img/og-image.png` (1200×630); its source
is `og-image.svg`.

### Navigation, header and footer

The header, mobile menu, footer, cart drawer (`#cart-drawer`, `#cart-overlay`) and toast (`#toast`) are
repeated in every page, so edit them in all eight files. Mark the current page's links with
`aria-current="page"`. Category links use the shop query string, for example
`shop.html?category=Mugs%20%26%20Cups`. The footer social links point to `#`; replace them with your profiles.

## Features

### Cart and mini cart

The cart is saved in `localStorage` and synced across tabs. Any element with `data-cart-open` opens the
slide-out cart; product cards add with `data-add="<product id>"`. The drawer traps focus, closes with Escape,
the close button or the backdrop, and returns focus to where it was. Adding an item bumps the header badge
(`data-cart-count`) and shows a toast with a "View cart" button.

Each cart line (in the drawer and on `cart.html`) carries `data-line="<id>:<glaze>:<size>"`. After −, + or
Remove, keyboard focus stays on the same button of the same line, and the line is updated in place so the
quantity's live region reads out the new number. When a line goes (Remove, or − at quantity 1), focus moves to
the same button on the next line, or on the previous line if it was the last; when the cart is then empty, it
moves to the empty cart's "Shop" link ("Shop the collection" in the drawer, "Shop all ceramics" on the cart
page).

### Shop filters

`shop.html` filters by category (radio buttons, counts from `data-count-for`), maximum price (`#price-max`) and
sort (`#sort`: featured, price up/down, rating, name). The result count and heading update live, and the
category is kept in the URL (`?category=Vases`) so filtered views can be linked. On small screens the filters
fold behind `#filters-toggle`.

### Product page

`product.html?id=daily-mug` shows that product (an unknown id shows the first product). The page title,
breadcrumb and text fill from the product. Glaze swatches recolor the gallery; sizes change the price;
the quantity stepper is limited to 1–99; four thumbnails switch views. Related products prefer the same
category.

### Promo code and shipping progress

On the cart page, `WELCOME10` takes 10% off. The free-shipping progress bar appears in the drawer and cart page.

### Checkout

The checkout validates every field, formats the card number and expiry as you type, checks the card number
with the Luhn algorithm (use `4242 4242 4242 4242`) and rejects expired dates. On success it shows a
confirmation with an order number (`KC-` and four characters, made in the browser by `makeRef()`) and clears the
cart. The confirmation promises an email and shipping within 2–3 business days, like the FAQ and the checkout
banner: change them together if yours differ, and show your payment provider's order number instead if it returns
one. The payment section says payments are in test mode and gives the test card number; remove that note when you
connect a real provider. **No payment is processed.** Replace the
`setupValidation(form, …)` callback in `initCheckout()` with your payment provider; the comment there marks
the spot. For real payments, use a hosted checkout such as Stripe Checkout or Shopify, and don't collect card
numbers in your own form.

### FAQ search

Typing in `#faq-search` filters the `details[data-faq]` items, opens matches, hides empty `[data-faq-group]`
sections and announces the number of answers.

### Back to top button

A button appears after scrolling about one screen, returns to the top (instantly with reduced motion), moves
focus to `#main`, lifts above the toast and hides while an in-page "Back to top" link is visible. Add
`data-back-to-top-avoid` (lift above) or `data-back-to-top-hide` (hide while covering) to your own fixed UI. To
remove it, delete the "Back to top" block at the end of `main.js` and the `.back-to-top` styles in
`src/input.css`.

## Forms

All forms are validated by `setupValidation()` in `main.js`: errors appear on blur and submit, the first
invalid field is focused, and each error is linked with `aria-describedby`. Rules come from attributes:

| Attribute | Rule |
|-----------|------|
| `required` | Must not be empty |
| `type="email"` | Must look like an email address |
| `minlength` | Minimum length |
| `data-label` | Name used in the error message |
| `data-validate` | `card`, `expiry`, `cvc` or `postcode` (a 5-digit ZIP code, optional +4, when Country is United States; a looser check otherwise) |

| Form | Where | Behavior |
|------|-------|-----------|
| Newsletter (`data-form="newsletter"`) | Every footer, home page band | Replaced with a thank-you message |
| Contact (`data-form="contact"`) | `faq.html#contact` | Replaced with a thank-you message |
| Promo (`#promo-form`) | `cart.html` | Applies `WELCOME10` |
| Checkout (`#checkout-form`) | `checkout.html` | Shows the order confirmation |

The newsletter thank-you asks subscribers to look out for a confirmation email, and the contact one promises a
reply within one business day (as the FAQ says) and shows a reference (`KC-` and four characters, from `makeRef()`).
Change them to match what really happens. **Nothing is sent** until you connect the forms, although their messages
read as if it had been. To collect submissions, post the form in its `onValid` callback, for example to
Formspree:

```js
$$('[data-form="contact"]').forEach(function (form) {
  setupValidation(form, function () {
    fetch('https://formspree.io/f/your-id', {
      method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }
    }).then(function (res) {
      successSwap(form, res.ok ? '<p>Thank you for writing.</p>' : '<p>Something went wrong. Please email us.</p>');
    });
  });
});
```

`FormData` only includes fields with a `name`. Every field already has one (`email`, `name`, `topic`, `order`,
`message`, and the checkout fields), so the request carries all the values; keep a `name` on any field you add.

## Saved data (localStorage)

| Key | Value | Used for |
|-----|-------|----------|
| `kiln-cart` | JSON array of `{ id, glaze, size, qty }` | Cart contents |
| `kiln-promo` | `"WELCOME10"` or `null` | Applied promo code |

The cart is validated every time it is read: unknown products and bad entries are dropped, glaze and size
indexes are range-checked, quantities are clamped to 1–`MAX_QTY`, duplicate lines are merged, and tampered
data is overwritten with the cleaned version. Prices are never stored; totals are always calculated from
`PRODUCTS`. If storage is blocked (some private windows), the store still works, but the cart is empty after
a reload.

## SEO and sharing

- Each page has its own `<title>` and `<meta name="description">`. The product page also sets `document.title`
  from the product.
- Open Graph and Twitter tags are in each `<head>`. `og:image` is the relative path `assets/img/og-image.png`;
  most social networks need an absolute URL, so change it to `https://your-domain/assets/img/og-image.png`
  and add `<meta property="og:url">` and `<link rel="canonical">` when you deploy.
- Product pages are filled in by JavaScript from `?id=`, so search engines that don't run scripts see the
  default content. If product search traffic matters, create one HTML file per product with its text written
  into the page.
- Add a `sitemap.xml` and `robots.txt` at the root for production.

## Accessibility

Built in: a skip link, landmarks, visible focus rings, a focus-trapped cart drawer that closes with Escape,
a mobile menu with `aria-expanded` that closes with Escape, a live cart count in the cart button's label, polite
toasts, `aria-pressed` gallery thumbnails, glaze names for screen readers, an ARIA progress bar for free
shipping, inline form errors linked to fields, a live FAQ result count, reduced-motion support and WCAG AA
contrast. Content still shows without JavaScript except the parts drawn from the catalog (art, grids and the
cart).

When editing, keep one `<h1>` per page, give each glaze a meaningful `name` (it's the image's text alternative)
and keep the `data-label` attributes on form fields.

## Building and deploying

1. Run `npm run build` if you changed `src/input.css` or added Tailwind classes to HTML or JS.
2. Upload the folder (without `node_modules/`, `src/` and `package.json` if you like) to any static host:
   Netlify, Vercel, Cloudflare Pages, GitHub Pages or plain hosting.
3. Configure the host to serve `404.html` for missing pages.

Tailwind scans the HTML and `assets/js/main.js` for class names, so classes used only inside JavaScript strings
are included as long as they appear in full.

## Troubleshooting

- **A new class has no effect.** Run `npm run build`, and write class names in full (not built from pieces).
- **A product shows the Ridge Vase instead.** The `?id=` doesn't match any product `id`.
- **A category filter shows nothing.** The product's `category` must match a value in `CATEGORIES` and the
  radio's `value` exactly.
- **The cart forgets items.** `localStorage` is blocked, or the product's `id` changed.
- **Social previews have no image.** Use an absolute `og:image` URL.
- **Totals look wrong after changing prices.** Totals always use current `PRODUCTS` prices; carts don't store
  prices, so this is expected.

## License

MIT. The code and artwork are free for personal and commercial use; the download includes the license text in
`LICENSE.txt`. Fraunces and Inter are licensed under the SIL Open Font License.
