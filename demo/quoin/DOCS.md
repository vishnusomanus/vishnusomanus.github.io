# Quoin documentation

## Overview

Quoin is a fictional architectural salvage yard in Troy, New York. Version 1.0.2 is a complete HTML and Tailwind CSS v4 website with sixteen stock lots, a cart, a reservation request checkout, a room-by-room project board, care notes, the yard team and a visit page with opening days, a delivery guide and a contact form. The [template page](https://freeframe.dev/templates/quoin) links to the live preview and download.

## Quick start

1. Unzip the download into a folder of its own.
2. Open `index.html` in a browser, or serve the folder with a static web server.
3. Open `stock.html`, choose a lot and try its preparation options.
4. Add a few pieces to the cart and send a reservation request from `checkout.html`.
5. Edit the business details in every HTML file before publishing.

The compiled stylesheet is included. Visitors do not need Node, pnpm or a framework. Use Node 24 only when rebuilding the CSS.

Browser privacy rules can limit storage on `file:` URLs. Use an HTTP server when testing persistence across pages.

## Pages

| File            | Purpose                     | Main features                                                                  |
| --------------- | --------------------------- | ------------------------------------------------------------------------------ |
| `index.html`    | Introduce the yard          | Material study, four featured lots, how the yard works, visit links            |
| `stock.html`    | Browse the inventory        | Search, category and price filters, sort, quick preview, save to project board |
| `lot.html`      | Examine one lot             | Provenance, dimensions, condition, preparation, quantity and cart              |
| `basket.html`   | Review a selection          | Quantity controls, removal, weight and price summary, last request             |
| `checkout.html` | Send a reservation request  | Contact details, pickup day or delivery ZIP code, live summary, reference      |
| `projects.html` | Build a room-by-room plan   | Picker, room tags, notes, budget and print                                     |
| `care.html`     | Understand the materials    | Eight searchable care notes and expandable instructions                        |
| `yard.html`     | Meet the people             | Three team portraits, the way the yard works, offering pieces to the yard      |
| `visit.html`    | Plan a visit or delivery    | Opening days with closures, ZIP code delivery guide, contact form              |
| `404.html`      | Recover from a missing link | Inventory, project board and contact routes                                    |

### URL parameters

| Page         | Parameter                                  | Effect                                                                                          |
| ------------ | ------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `lot.html`   | `lot=oak-door`                             | Shows that lot. Missing or unknown ids show the first lot; unknown ids also show a note.        |
| `stock.html` | `q`, `category`, `max`, `sort`             | Pre-fills the filters (`max` is `100`, `300` or `500`; `sort` is `lot`, `low`, `high`, `name`). |
| `visit.html` | `topic=selling`                            | Pre-selects the contact form topic (`stock`, `selling`, `delivery`, `other`).                   |
| `visit.html` | `lot=slate-hearth`                         | Pre-selects "A piece in stock" and starts the message with the lot number and name.             |
| any page     | `now=2026-12-23` or `now=2026-12-23T09:30` | Previews the opening days, pickup days and copyright year on another date (New York time).    |

Every value is checked against an allowlist or an own-key lookup (`Object.prototype.hasOwnProperty.call`), so `?lot=constructor` or `?topic=__proto__` fall back safely.

## Project structure

```text
index.html                 Home and featured lots
stock.html                 Search and quick-preview shell
lot.html                   Data-driven lot details
basket.html                Cart and price summary
checkout.html              Reservation request and confirmation
projects.html              Project board controls
care.html                  Searchable care library
yard.html                  Team and sourcing story
visit.html                 Opening days, delivery guide and contact form
404.html                   Missing-page recovery
assets/css/style.css       Compiled Tailwind stylesheet
assets/js/data.js          Inventory, care notes and team
assets/js/main.js          State, rendering, validation and interaction
assets/img/                Lot drawings, team portraits, page illustrations and sharing art
src/input.css              Theme tokens and a small component layer
package.json               CSS build and watch scripts
README.md                  Short introduction and documentation link
CHANGELOG.md               Template release history
DOCS.md                    This guide
```

`template.json` is catalog metadata in the source repository and is excluded from the downloadable ZIP. The download receives a `LICENSE.txt` file during packaging.

## Customizing

### Brand and colors

The colors and fonts are declared in the `@theme` block in `src/input.css`.

| Token            | Purpose                        |
| ---------------- | ------------------------------ |
| `--color-paper`  | Warm page background           |
| `--color-ink`    | Main text and footer           |
| `--color-muted`  | Secondary text                 |
| `--color-line`   | Dividers and borders           |
| `--color-moss`   | Primary actions                |
| `--color-rust`   | Accents and validation         |
| `--color-wash`   | Quiet panels and illustrations |
| `--font-display` | Antic Didone headings          |
| `--font-sans`    | Sarabun body and controls      |

For example, change the primary action color, then rebuild:

```css
@theme {
  --color-moss: #354d3c;
}
```

Most layout styling is Tailwind utility classes directly in the HTML or in the rendering strings in `main.js`. Keep complete utility class names in the source so the compiler finds them.

Shared classes such as `.wrap`, `.btn`, `.field` and `.eyebrow` cover repeated patterns. Avoid growing the component layer into a separate layout system.

### Typography

Headings use Antic Didone (400) and body text and controls use Sarabun (400 and 600). Both come from Google Fonts, loaded by a `<link>` in the `<head>` of every HTML file, after two `preconnect` hints:

```html
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Antic+Didone&amp;family=Sarabun:wght@400;600&amp;display=swap"
/>
```

`display=swap` shows the fallback (Georgia for headings, Arial for body text) until the fonts arrive. To change a font, edit the `family=` part of that link in every HTML file, update `--font-display` or `--font-sans` in `src/input.css`, rebuild the CSS and regenerate `og-image.png` so the social image uses the new typeface. If you would rather not call Google, download the WOFF2 files, add `@font-face` rules to `src/input.css` and remove the links.

### Content

Business copy lives in the HTML files. `assets/js/data.js` assigns `window.QUOIN_DATA`, which contains `products`, `guides` and `team`. `main.js` gives those arrays the local names `PRODUCTS`, `GUIDES` and `TEAM`.

Each product has the following fields:

| Field         | Meaning                                                                   |
| ------------- | ------------------------------------------------------------------------- |
| `id`          | Unique URL and storage identifier, such as `oak-door`                     |
| `lot`         | Lot number shown on cards, the lot page and the reservation request       |
| `name`        | Plain description of the piece, such as "Oak four-panel door"             |
| `provenance`  | One line on where it came from, shown on cards and the lot page           |
| `unit`        | What one price and one unit of stock buys: `piece`, `pair`, `set`, `pack` |
| `category`    | Filter category                                                           |
| `price`       | Price per unit in US dollars, before sales tax                            |
| `stock`       | Units available across all finishes                                       |
| `era`         | Approximate period, such as `1910s`                                       |
| `dimensions`  | Measurements in inches                                                    |
| `weight`      | Approximate pounds per unit, for handling and delivery                    |
| `finishGroup` | Key in `FINISHES`                                                         |
| `intro`       | Short description                                                         |
| `condition`   | Imperfections and included parts                                          |
| `use`         | Suggested use and install cautions                                        |
| `art`         | Relative image path                                                       |
| `featured`    | Whether it appears on the home page                                       |

Units are defined in `UNITS` in `main.js`. A unit's `label` follows the price ("$120 per pack of four") and `one`/`many` are used for stock and quantities ("12 packs in stock", "3 packs"). The tiles are sold in packs of four, the brass pulls, shelf brackets and shutters in pairs, and the balusters in sets of six; `stock` and `weight` count those units. To add a unit, add an entry to `UNITS` and use its key in the product.

To add a lot, duplicate an object in `products`, give it a unique `id` and lot number, write a plain `name` and a one-line `provenance`, then add its drawing. Check stock, dimensions, weight and unit together.

A preparation group is an array of objects in `FINISHES`:

```js
wax: [
  { id: "original", label: "Cleaned, as found", extra: 0 },
  { id: "waxed", label: "Light wax finish", extra: 25 },
],
```

`extra` is added to each unit. Unknown finish identifiers fall back to the first option in the group. Cart totals always come from this catalog, never from a stored price.

Category names are also listed in the `stock.html` select. If you introduce another category, add an option there. The same applies to care materials in `care.html`.

The team has `name`, `role`, `initials`, `look` (the portrait's alt text), `portrait` (its image) and `text`.

### Images and artwork

Every lot has its own 400 × 330 SVG drawing in `assets/img/`, named `lot-<id>.svg`. The drawings are measured studies: the brass pulls are shown front and side with their 5 in screw centers, the slate hearth in three-quarter view with its rough-cut back edge, the fanlight with its glazing bars.

| File                                                        | Used on                     | Size      |
| ----------------------------------------------------------- | --------------------------- | --------- |
| `yard-study.svg`                                            | Home hero                   | 650 × 640 |
| `yard-shed.svg`                                             | Yard page hero              | 560 × 440 |
| `team-lowenna.svg`, `team-fenella.svg`, `team-taliesin.svg` | Yard team portraits         | 400 × 300 |
| `sack-truck.svg`                                            | Cart hero, empty checkout   | 400 × 330 |
| `project-board.svg`                                         | Project board hero          | 400 × 330 |

Photographs can replace drawings. Keep the aspect ratio and rewrite the `alt` text to describe the actual object. Don't put measurements only inside an image.

The favicon is `favicon.svg`. The social source is `og-image.svg`; its raster version is `og-image.png`, 1200 × 630. Social services need the PNG. Render it with Antic Didone and Sarabun loaded, then look at the result.

### Navigation, header and footer

The header, mobile menu and footer are repeated in all ten HTML files. Update each copy when changing a link, address, contact detail or opening hour.

The desktop menu starts at the `lg` breakpoint. The mobile menu uses `data-menu-toggle` and the `mobile-menu` id. Keep the id and `aria-controls` aligned.

The footer is the only place where the fictional business notice appears. The template has no dark mode.

## Features

### Inventory search and sorting

`initStock()` reads the filter form and renders matching products with `card()`.

Search covers the name, category, description, provenance, era and lot number. Category and price filters combine with the search. The sort choices are lot, low price, high price and name.

The result count uses `aria-live="polite"`. Empty results have an explanation and the clear-filters action restores all sixteen lots.

### Quick preview

`initQuickLook()` opens a native modal dialog from a stock card. It shows the drawing, dimensions, description, provenance, preparation, quantity and a link to the full condition notes.

The close action and Escape return focus to the card control that opened it.

`purchaseForm()` is shared by the quick preview and the lot page. Keep its per-instance id prefix unique if you add another instance.

### Cart and preparation

`addToBasket()` clamps quantities against `stockRemaining()`. A lot can have separate finish lines, but their combined quantity can't exceed its stock.

`loadBasket()` sanitizes every stored line. Unknown identifiers are dropped, unknown finishes are reset, duplicate lines are merged and the stock cap is enforced.

`basketCost()` derives the total from current catalog prices and preparation extras. `basketWeight()` totals the load.

After a removal, focus moves to the next remaining action or the inventory link. When the cart is empty, the cart page (`basket.html`) shows the last reservation request, if there is one.

### Reservation request (checkout)

`initCheckout()` drives `checkout.html`. With an empty cart it hides the form and shows an empty state with the last request. Otherwise it lists the pieces and keeps the summary (`summaryMarkup()`) in step with the delivery choice:

| Choice                         | Summary line                        | Total                         |
| ------------------------------ | ----------------------------------- | ----------------------------- |
| Pick up at the yard            | Pickup in Troy: Free                | Total at pickup, before sales tax |
| Deliver, ZIP code not valid    | Delivery: Add your ZIP code         | Subtotal, before sales tax    |
| Deliver, guide-price area      | Delivery to 12180 (guide): $65      | Estimated total, before sales tax |
| Deliver, individual-quote area | Delivery to 99501: Quoted separately | Subtotal, before sales tax   |

Pickup shows a "Preferred pickup day" select filled with the next six open days (`collectionDays()`); delivery shows the ZIP code field instead. On submit the name, phone number, email and (for delivery) ZIP code are validated. A valid request:

1. makes a reference such as `QN-4821`,
2. shows "Reservation request QN-4821 received." with the customer's first name, the number we'll call, what we'll arrange, and the time the pieces are held until (`HOLD_HOURS`, 48),
3. lists the requested lines and total, and what happens next,
4. saves a short summary under `quoin.last-request.v1` and empties the cart.

The copy promises a call within one business day and that nothing is paid online; change it in `checkout.html` and `showConfirmation()` if your yard works differently.

### Project board

`initBoard()` works with the `board` object. Save a piece from the inventory or add it with the board picker. The picker also makes the feature usable in a single page view when storage is blocked.

`ROOMS` defines the allowed room labels. Every saved piece has a room and a note of up to 300 characters. The project name is limited to 80 characters and the budget to $0–$1,000,000; a negative budget is reset to 0 in the field as well.

The estimate counts one unit of each saved lot at its base price. It excludes preparation and delivery, and doesn't change the cart. Saving a piece doesn't hold it; only a reservation request does.

`updateBoardTotal()` reports the number of pieces, their total and the difference from the working budget. Printing uses a print stylesheet with controls hidden.

### Delivery guide

`deliveryQuote()` normalizes and validates the ZIP code (5 digits, optional +4), then applies `DELIVERY` by its first three digits. The field and code keep the name `postcode`.

| Area                                                                      | Starting guide price |
| ------------------------------------------------------------------------- | -------------------- |
| Capital Region (120–123)                                                  | $65                  |
| Hudson Valley, Adirondacks, Berkshires, southern Vermont (124–129, 012, 052, 053) | $145                 |
| The rest of the contiguous US                                             | $395                 |

Each started 100 lb band above the first 100 lb adds $25. For example, a 250 lb load to a Capital Region ZIP code has a $115 guide price.

The visit form offers 20, 100 or 250 lb. The checkout uses the cart weight. Pickup is free.

`INDIVIDUAL_AREAS` and `INDIVIDUAL_DISTRICTS` list the routes that get an individual carrier quote instead of a guide price: Puerto Rico and the US Virgin Islands (006–009), Hawaii and the Pacific territories (967–969), Alaska (995–999) and military addresses (090–098, 340, 962–966). These are guide rules, not a carrier database; check them against your carrier before going live.

### Care library

`initCare()` filters the eight `GUIDES` by text and material. Each record contains `id`, `title`, `material`, `summary`, `steps` and `caution`. Each card's label shows the material and the number of steps.

Each note uses a native `details` element for its full instructions. Keep the safety cautions when editing a note, especially for old paint, glass and electrical fixtures.

### Opening days, federal holidays and closures

`TIME_ZONE` is `America/New_York`. `openingDays()` starts from today's New York date (or `?now=`) and walks forward through `OPEN_WEEKDAYS` (Wednesday to Saturday) until it has six open days. Opening weekdays that fall on a closure are kept in the list with the reason, and `initDates()` merges a run of closed days with the same reason into one card ("Wed, Dec 30, 2026 – Sat, Jan 2, 2027 · Closed · Christmas break").

A day is closed when `closedReason()` returns a reason:

- **Federal holidays:** `bankHolidays(year)` works out the US federal holidays for any year: New Year's Day, Martin Luther King Jr. Day, Washington's Birthday, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving Day and Christmas Day. A fixed-date holiday on a weekend is also closed on its observed weekday (Saturday to Friday, Sunday to Monday), and the yard stays shut on the date itself. Set `CLOSE_ON_BANK_HOLIDAYS` to `false` to open on them.
- **Yearly closures:** `YARD_CLOSURES` holds month-day ranges. The demo closes from Christmas Eve to January 2 (`{ from: "12-24", to: "01-02", label: "Christmas break" }`), with Christmas Day and New Year's Day named first so they show their own names. A range may run over New Year. The first matching entry wins.

Nothing here is a fixed date, so the list stays current on any day. For one-off closures (an inventory count, a vacation week), add a short dated list and check it in `closedReason()`. The same open days fill the checkout's collection-day select. `initDates()` also fills every copyright year from the New York date.

To see a date, add `?now=2026-12-23` to `visit.html` or `checkout.html`.

### Navigation and motion

`initMenu()` opens and closes the small-screen navigation, sets its expanded state and moves focus to the first link. Escape closes it and returns focus to the toggle.

`revealNew()` uses IntersectionObserver and also reveals content above a newly visible section. Reduced-motion users see all content immediately.

## Forms

The forms check their fields in the browser and then show the result straight away. Nothing is sent anywhere until you connect a service.

| Form                | Page            | Validates                                                                     | Finishes with                                                     |
| ------------------- | --------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Reservation request | `checkout.html` | Name, phone (10+ digits), email, ZIP code when delivering, a non-empty cart   | Reference `QN-1234`, hold time, what happens next; cart emptied   |
| Contact             | `visit.html`    | Name, email, a message of at least ten characters                             | "Thanks, Jo. Your message is with the yard." and the reply time   |
| Delivery guide      | `visit.html`    | A 5-digit ZIP code, optional +4                                               | A guide price, or a note that the route needs a carrier quote     |

Errors appear under each field, are linked with `aria-describedby`, set `aria-invalid` and move focus to the first problem. Typing in a field clears its error.

### Connecting a form service

Both `initCheckout()` and `initContact()` have a comment showing where to post the form. With [Formspree](https://formspree.io), replace `showConfirmation(details)` (checkout) or `showThanks()` (contact) in the submit handler with:

```js
fetch("https://formspree.io/f/your-form-id", {
  method: "POST",
  body: new FormData(form),
  headers: { Accept: "application/json" },
}).then((response) => (response.ok ? showThanks() : showSendError()));
```

Show the success state, and on the checkout clear the cart, only when the response is OK. Write a small `showSendError()` that keeps the form and the cart, and asks the customer to try again or call the yard. Disable the submit button while the request runs. The checkout form doesn't include the cart lines by itself; add them as a hidden field (for example the lot numbers, units and finishes) before posting.

For a real shop, check lot ids, quantities, prices and stock on your server, and never treat the browser's totals as an order. Add your privacy notice and terms before collecting customer details.

## Saved data (localStorage)

All access goes through `safeStorage`. It keeps an in-memory copy and falls back to it if storage throws. With storage blocked the features work during the current page view; a reload or navigation starts afresh.

| Key                     | Shape                                      | Validation                                                                              |
| ----------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------- |
| `quoin.basket.v1`       | Array of `{id, finish, quantity}`          | Catalog own-key identifier, allowed finish, positive integer and cumulative stock cap |
| `quoin.board.v1`        | `{name, budget, items:[{id, room, note}]}` | Text limits, budget clamp, unique catalog ids and allowed room                        |
| `quoin.last-request.v1` | `{ref, items, total, method, when}`        | `ref` must be `QN-` and four digits, integer counts and total, `collect` or `delivery`  |

Malformed JSON is removed. Valid JSON with the wrong shape is ignored or replaced with a safe empty value. Fields are read with own-property checks, so names such as `constructor` are never product ids.

HTML rendering escapes text before interpolation. No stored value can override a catalog price. The template doesn't save names, phone numbers, email addresses, ZIP codes or messages; the last request keeps only its reference, item count, total, method and date.

Reset saved state from the browser console:

```js
localStorage.removeItem("quoin.basket.v1");
localStorage.removeItem("quoin.board.v1");
localStorage.removeItem("quoin.last-request.v1");
location.reload();
```

## SEO and sharing

Every HTML file has its own title, description, Open Graph title and description, locale, theme color, favicon and sharing image. The lot page updates its visible title for the chosen object after loading.

Change `og:image` to an absolute deployed URL, such as `https://your-domain.example/assets/img/og-image.png`, before launch. Replace the example domain with your real domain.

A production catalog may need separate indexable product URLs and server-rendered metadata. The query-driven lot page is a compact static catalog, not a full search-indexing platform.

Add a sitemap containing the public pages and a robots file appropriate to your deployment. The template does not contain structured data or analytics.

## Accessibility

The site has a skip link, semantic landmarks, one rendered `h1` per page, visible keyboard focus, labeled form fields and polite live status messages.

Native `dialog`, `details`, `select` and radio controls provide familiar keyboard behavior. Form errors are associated through `aria-describedby` and marked with `aria-invalid`.

After removing a cart or board item, focus moves to a remaining action. Dialog close restores focus to its opener. Mobile Escape closes the menu.

Lot drawings and team portraits have alt text, and every measurement in a drawing is repeated in the page text. The checkout radio choices are native radio buttons inside a fieldset with a legend.

Keep text contrast, input labels and focus outlines when changing colors. Check every page at narrow widths, including long lot names and the checkout confirmation.

## Building and deploying

Node 24 is needed for CSS authoring. From the template folder:

```sh
npm install
npm run build
```

`npm run watch` recompiles while editing. The compiler scans this template's HTML and JavaScript using the scoped import in `src/input.css`.

Upload the HTML files and the complete `assets/` directory to any static host. Netlify Drop, GitHub Pages, Cloudflare Pages and ordinary web hosting all work.

Keep the `src/` directory and documentation in your editable source. They are not needed for runtime requests, but help future maintenance.

Configure the host to serve `404.html` for missing paths. Keep relative `.html` links if the site is published below a subdirectory.

## Troubleshooting

### Cart disappears after navigation

Storage may be blocked by the browser, a sandbox or a `file:` origin. The in-memory fallback only lasts for one page view. Test persistent state over HTTP and document browser requirements for a real shop.

### New utility does not appear

Run the CSS build after editing markup or JavaScript rendering strings. The shipped stylesheet is compiled; changing class names alone does not add new CSS.

### A quantity is lower than requested

Stock is capped across every finish of the same lot. Remove other finish lines or reduce their quantities before adding more. Stored values are also clamped when a page loads.

### Delivery has no instant price

Some ZIP codes deliberately require a carrier conversation. Invalid ZIP codes show an inline error. A guide price is never a firm shipping quote.

### The confirmation shows but nothing arrives

The forms aren't connected to a service yet. Follow [Connecting a form service](#connecting-a-form-service) and show the success state only when the service answers OK.

### Fonts look different

The fonts load from Google Fonts. Check that the `fonts.googleapis.com` link is still in the page's `<head>` and that your site's Content Security Policy allows `fonts.googleapis.com` and `fonts.gstatic.com`. Regenerate the social PNG when the font changes.

### The opening days look wrong

They're worked out in `America/New_York` from the visitor's clock. Check a date with `?now=2026-12-23` on `visit.html`, and review `YARD_CLOSURES` and `CLOSE_ON_BANK_HOLIDAYS` in `main.js`.

### A saved piece vanished

Removing or renaming a product identifier drops stale state on the next load. Keep ids stable for published inventory, or plan a migration before changing them.

## License

MIT. The code and included artwork may be used under the license in `LICENSE.txt` supplied with the download.

Antic Didone and Sarabun are Google Fonts under the SIL Open Font License, loaded from Google Fonts. The SVG illustrations are original artwork included with the template. Quoin, its team and its inventory are fictional.
