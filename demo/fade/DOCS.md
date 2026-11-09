# Fade documentation

## Overview

Fade is a nine-page website for a barbershop. The demo brand is Fade Bros. Barber Co., a fictional independent
barbershop with two shops in Chicago: Logan Square (2741 N Milwaukee Ave) and Pilsen (1532 W 18th St). It's built with
plain HTML5, Tailwind CSS v4 and one vanilla JavaScript file with no dependencies. Highlights are an illustrative
"current wait" board for each shop, a five-step booking flow that works out time slots from each barber's schedule and
the length of the chosen services, filterable services and barbers, a grooming product shop with a saved bag, and a gift
card builder with a live preview. This guide covers version 1.0.8. Live demo:
[freeframe.dev/templates/fade](https://freeframe.dev/templates/fade).

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Everything works from the file system, including booking, the bag and gift cards.
3. For a local server instead (closer to production), run one from the folder:

```sh
npx serve .
```

You only need Node.js 24 if you change the styles and rebuild the CSS (see
[Building and deploying](#building-and-deploying)). The compiled `assets/css/style.css` is included.

## Pages

| File | Page | Notable sections and features |
|------|------|-------------------------------|
| `index.html` | Home | Hero with the current-wait board, services preview, barbers, house rules, reviews, both shops with open-now status, gift card call to action |
| `services.html` | Services and prices | Price list by category with times, category filter with live count, "Book" link per service, FAQ accordion |
| `barbers.html` | Barbers | Six profiles, filters by shop and specialty, days in the chair, next free time, "Book with" links |
| `book.html` | Book a chair | Five-step booking flow with a running summary, confirmation and `.ics` download |
| `shop.html` | Shop and gift cards | Product grid with category filter, the bag (quantities, pickup or shipping, checkout), gift card builder |
| `locations.html` | Locations and hours | SVG map, each shop's hours, open-now status, transit, parking, walk-in wait, how the estimate works |
| `about.html` | About and careers | Story, timeline, standards, open jobs and chair rental |
| `contact.html` | Contact | Validated contact form with topics, both shops' details, group and wedding bookings |
| `404.html` | Not found | Links back into the site |

Every page shares the header (with the bag count), the footer (open-now badges for both shops and the newsletter form)
and the back-to-top button.

## Project structure

```text
fade/
├── index.html … 404.html      The nine pages (header and footer are repeated in each)
├── assets/
│   ├── css/style.css          Compiled Tailwind CSS (generated from src/input.css)
│   ├── js/main.js             All interactivity and the FADE data object
│   └── img/
│       ├── barbers/           Barber portraits, one SVG per barber id (400 x 480)
│       ├── storefront.svg     Storefront illustration (also inlined on about.html)
│       ├── favicon.svg
│       └── og-image.svg, og-image.png
├── src/input.css              Tailwind source: @theme tokens and component styles
├── package.json               Tailwind CLI scripts (build, watch)
├── template.json              Template metadata (name, version, pages, features)
├── README.md                  Short introduction
├── DOCS.md                    This guide
└── CHANGELOG.md               Version history
```

## Customizing

### Brand and colors

All design tokens live in the `@theme` block at the top of `src/input.css`:

| Token | Default | Used for |
|-------|---------|----------|
| `--color-paper` | `#f2ead9` | Page background |
| `--color-card` | `#fbf7ef` | Cards, inputs |
| `--color-sand` | `#e8dcc4` | Soft panels and alternate sections |
| `--color-ink` | `#151515` | Text, borders, hard shadows, dark sections |
| `--color-coal` | `#24211e` | Raised surfaces on dark (the wait board) |
| `--color-mute` | `#5a5249` | Secondary text |
| `--color-red` | `#b5281c` | Barber red: buttons, eyebrows, links |
| `--color-navy` | `#1d3557` | Barber blue in the stripes |
| `--color-brass` | `#e0a83a` | Accents on dark backgrounds only |
| `--color-go` | `#2c6a37` | "Open" dots and positive states |

Each token becomes Tailwind utilities (`bg-red`, `text-ink`, `border-brass`...). To change the accent:

```css
@theme {
  --color-red: #1f6f5c;      /* a deep green instead of barber red */
  --color-red-dark: #165243;
}
```

Keep text colors at 4.5:1 contrast or more against `paper`, `card` and `sand`. Brass is only for text on `ink`.
The barber-pole stripes are the `pole-stripe` utility (a `repeating-linear-gradient` of red, paper and navy); the
header and footer use it through `.pole-band`.

The SVG artwork has its colors written in. Portraits, the storefront and the social image use the same hex values,
so a find-and-replace of `#b5281c` across `assets/img/` and the HTML updates them.

### Typography

Two Google Fonts are loaded in the `<head>` of every page:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&amp;family=Archivo:wdth,wght@62..125,400..900&amp;display=swap">
```

- **Anton** (`--font-display`) for headings. All `h1` and `h2` elements, and anything with `font-display`, are set in
  Anton, uppercase.
- **Archivo** (`--font-sans`) for everything else. It's a variable font with a width axis: the `.condensed` class and
  the button, tag and label styles use `font-stretch` for the narrow, sign-painter look.

To swap fonts, change the link in each page and the two `--font-*` tokens in `src/input.css`, then rebuild the CSS.

### Content

Text lives in the HTML files. Data that the scripts need lives in one object, `FADE`, at the top of
`assets/js/main.js`:

| Key | What it holds |
|-----|---------------|
| `shop` | Name, email, `timeZone` (`America/Chicago`), currency and locale |
| `locations` | The two shops: id, address, phone, number of chairs, `hours` per weekday (0 = Sunday, `null` = closed), transit and parking |
| `categories` | Service categories (`cuts`, `beard`, `shaves`, `kids`, `packages`) |
| `services` | Each service: `id`, `cat`, `name`, `mins`, `price`, optional `needs` and `popular` |
| `specialties` | The specialty filter on the barbers page |
| `barbers` | Each barber: `id`, `short` name, `role`, `skills`, `specialties` and `schedule` per shop per weekday |
| `traffic` | The demo walk-in traffic curve used by the wait estimate |
| `products`, `productCategories` | Shop products and their filter categories |
| `giftDesigns`, `gift`, `shipping` | Gift card designs and limits, flat shipping and the free-shipping threshold |

The visible lists (price list, barber cards, product cards, hours tables) are plain HTML so they work without
JavaScript and are indexed by search engines. When you change a service, barber or product, change it in **both**
the HTML and `FADE`. For example, to add a "Hot towel & line-up" service:

```js
{ id: 'towel-lineup', cat: 'cuts', name: 'Hot towel & line-up', mins: 20, price: 24, desc: 'A line-up finished with two hot towels.' }
```

Then add a row to the Cuts group in `services.html` (copy an existing `<li class="svc-row">`) and a checkbox to the
Cuts list in step 2 of `book.html` (copy an existing `<li>` with `name="services"` and set `value="towel-lineup"`).

`needs` lists the skills a barber must have; it defaults to the service's own category. Packages use it, e.g.
`needs: ['cuts', 'shaves']` for The Full Service, so only barbers with both skills are offered.

To add a barber, add an entry to `FADE.barbers`, a portrait at `assets/img/barbers/<id>.svg`, and a card in
`barbers.html` (copy an `<li data-barber="...">` and update `data-locs` and `data-specs`):

```js
{
  id: 'nia', short: 'Nia', name: 'Nia Brooks', role: 'Barber', years: 4,
  skills: ['cuts', 'beard', 'kids'], specialties: ['fades', 'kids'],
  bio: '…', signature: 'Burst fade',
  schedule: { logan: { 4: ['12:00', '20:00'], 5: ['12:00', '20:00'] } }
}
```

Keep barber schedules inside the shop's opening hours.

### Images and artwork

Everything is SVG, so there are no photos to license:

- **Barber portraits**: `assets/img/barbers/<barber id>.svg`, 400 x 480 (5:6). The booking flow also loads them by
  id. To use photos, keep the 5:6 ratio (e.g. 800 x 960 JPG) and change the `src` in `index.html`, `barbers.html` and
  the `assets/img/barbers/' + o.id + '.svg'` path in `main.js`.
- **Products**: drawn inline in each product card on `shop.html` (`.product-art`, square). Replace the `<svg>` with
  an `<img>` of a square product shot.
- **Storefront** (`about.html`) and **map** (`locations.html`) are inline SVGs so they use the page fonts.
  `assets/img/storefront.svg` is a standalone copy.
- **Social image**: `assets/img/og-image.svg` is the source; social sites need the PNG, `og-image.png` (1200 x 630).
  Export it from any vector editor, or from the Freeframe repository with
  `node scripts/og-png.mjs og-image.svg og-image.png index.html`.
- **Favicon**: `assets/img/favicon.svg`.

### Navigation, header and footer

The header and footer are repeated in every HTML file. To add a page, copy an existing one, change the `<title>`,
description, Open Graph tags and `<main>`, then add a link to the `<nav aria-label="Main">` list, the mobile menu
list and the footer in every page. The current page's links carry `aria-current="page"`, which styles them.

## Features

### Booking flow

`book.html`, section 9 of `assets/js/main.js`. Five steps inside one `<form id="booking-form">`:

1. **Shop**: radio cards with open-now status and who is in today.
2. **Services**: checkboxes; the duration and total add up in the summary and the running total.
3. **Barber**: "First available" plus every barber who works at the chosen shop and has the skills for every chosen
   service, with their next free time. Barbers left out are listed with the reason (e.g. "Rosa (no straight-razor
   shaves)").
4. **Time**: a month calendar and the open times for the chosen day, grouped into morning, afternoon and evening.
5. **Details**: name, mobile, email, notes, reminder and cancellation policy, all validated.

If nobody at the chosen shop can do every chosen service in one visit (kids cut + hot towel shave in Pilsen),
step 2 explains it instead of continuing. The confirmation shows a summary, a reference (`FB-` and four characters, from `makeRef()`) and a button that
downloads an `.ics` file carrying the same reference. It says the chair is on hold and that the shop will text to
confirm within a few minutes; change that to match how your booking system confirms. The note at the top of the page
repeats the cancellation policy.

URL parameters preselect choices: `book.html?location=pilsen`, `?service=fade`, `?barber=rosa` (a barber also sets
their shop). Only ids that exist in `FADE` are accepted.

### Time slots

Slots come from `slotsFor(locId, key, ids, barberId, now)`:

- The shop's hours that day, the barber's `schedule` at that shop, and the total minutes of the chosen services.
- Start times every `SLOT_STEP` (15) minutes; today's earliest is `LEAD_TIME` (30) minutes from now.
- Visitors can book `BOOK_AHEAD` (42) days ahead.
- `isBooked()` marks about a third of each barber's half-hours as taken, using a stable hash so the calendar looks real
  and doesn't change on reload. Replace it with your booking system's availability.

```js
var SLOT_STEP = 15;      // minutes between start times
var LEAD_TIME = 30;      // earliest booking is this many minutes from now
var BOOK_AHEAD = 42;     // days visitors can book ahead (6 weeks)
```

All times are the shop's local time (`FADE.shop.timeZone`), whatever the visitor's own time zone is.

### Connecting real bookings

The flow is a front end only. To take real bookings, either embed your provider's widget in place of the form
(Square Appointments, Fresha, Booksy and Cal.com all offer one), or keep this flow and send the request where
`confirm()` says so. Its comment marks the spot:

```js
// Demo only: nothing is sent. Post { location, services, barber, date, time, details } to
// your booking provider here (Square Appointments, Fresha, Booksy or Cal.com APIs/embeds).
```

Booking APIs need a secret key, so call them from a small server function (Netlify Functions, Cloudflare Workers,
Vercel Functions), never directly from the browser.

### Current wait estimate

`index.html` (hero board) and `locations.html`, section 6 of `main.js`. Any element with `data-wait="<shop id>"` is
filled in: `[data-wait-num]`, `[data-wait-detail]`, `[data-wait-unit]`, `[data-wait-chart]` and
`[data-wait-chart-label]`.

`estimateWait()` multiplies the traffic level for this hour (`FADE.traffic`, 0 to 1, separate curves for weekdays,
Saturday and Sunday) by 70 minutes, divides by the number of barbers working, adds a small stable variation and rounds
to 5 minutes. It is **illustrative**: the page says so next to every number and `locations.html#wait-model` explains
it. To show real waits, replace `estimateWait()` with a call to your queue system (e.g. a JSON endpoint), and remove
the "Illustrative estimate" labels.

Add `?at=2026-10-17T10:30` to any page URL to preview the site at a shop-local time (useful for testing busy and
closed states).

### Open now and hours

Section 5 of `main.js`. `[data-open-now="logan"]` badges show "Open now · until 8 pm", "Closing soon · 8 pm" (last 45
minutes) or "Closed · opens tomorrow 9 am". `[data-today-hours]` shows today's hours, and the current weekday's row in
every `[data-hours]` table is highlighted and marked `aria-current="date"`. Everything refreshes every minute.

### Services filter

`services.html`, section 7. Chips with `data-filter` show one category; the count is announced with
`aria-live="polite"`. `services.html?category=beard` preselects a category.

### Barber filters and next free time

`barbers.html`, section 8. Two chip groups filter by shop (`data-barber-loc`) and specialty (`data-barber-spec`);
cards carry `data-locs` and `data-specs`. If no barber matches, an empty state offers to reset. `?location=pilsen` and
`?speciality=curly` preselect filters. Each card shows the barber's next free time for a Classic cut.

### Bag and checkout

`shop.html`, section 10. "Add to bag" buttons (`data-add="<product id>"`) add products; the bag lists products with
quantity steppers (1 to 10) and gift cards, offers pickup at either shop or shipping (`FADE.shipping`: $6, free over
$50 in products) with a progress meter, and totals everything. "Checkout" shows an "Order placed" summary with an
order reference from `makeRef()`; the line under the button says no payment is taken online. The header bag icon
shows the item count on every page and links to `shop.html#bag`.

To sell for real, send the bag lines from `readBag()` to Shopify (Buy Button or Storefront API), Square Online or
Stripe Checkout where the `[data-checkout]` click handler is, and show the provider's own order number instead of the
made-up reference.

### Gift card builder

`shop.html#gift-cards`, section 11. Preset amounts or a custom whole amount between `FADE.gift.min` and `FADE.gift.max`
($20 to $300), three designs (`gift-pole`, `gift-stamp`, `gift-blackout` in `src/input.css`), recipient, sender,
message (140 characters, with a counter) and "right away" or a date within a year. The preview updates as you type and
a screen-reader summary is announced politely. A valid card is added to the bag as a gift line.

### Header, menu, reveals and back to top

The header is sticky. Below 1024px a menu button opens a full-screen menu (`aria-expanded`, Esc closes it and returns
focus). Elements with `.reveal` fade up once as they scroll into view; everything above the viewport is revealed too,
and nothing is hidden with reduced motion. The marquee and the stamp badge stop moving with reduced motion. The
back-to-top button is the last block of `main.js`; delete it and the `.back-to-top` styles to remove it.

## Forms

| Form | Where | Validates |
|------|-------|-----------|
| Booking details | `book.html` step 5 | Name, 10-digit US mobile, email, policy checkbox |
| Gift card | `shop.html` | Custom amount range, recipient name and email, sender, delivery date |
| Contact | `contact.html` | Name, email, optional phone (10 digits if given), message of 20+ characters |
| Newsletter | footer of every page | Email |

Errors appear inline next to each field, fields get `aria-invalid`, and focus moves to the first problem. On success
the contact form says the message was received, promises a reply within one business day (as the page already says)
and shows a reference (`FB-` and four characters from `makeRef()`; use your form service's own reference instead if
it returns one). The footer newsletter message asks subscribers to look out for a confirmation email, so use a
mailing list tool that sends one (double opt-in) or reword it. **No form sends anything until you connect it.**

`contact.html?topic=careers` (or `group`, `chair-rental`, `feedback`, `press`) preselects the topic.

### Connecting to Formspree

Create a form at Formspree, then replace the comment in the contact form handler in `main.js`:

```js
// Send new FormData(contact) to your endpoint here
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(contact),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (!res.ok) throw new Error('Send failed');
  contact.reset();
  var ok = $('[data-form-success]', contact);
  $('[data-ref]', ok).textContent = makeRef();
  ok.hidden = false;
  ok.focus();
});
```

Move the `contact.reset()` and success lines into the `then` so the message only shows after a real send, and update
the success text in `contact.html`. The newsletter handler has the same kind of comment; point it at Mailchimp,
Buttondown or your email tool.

## Saved data (localStorage)

| Key | Shape | Validation on read |
|-----|-------|--------------------|
| `fade-bag` | `{ items: [...], delivery: "logan" \| "pilsen" \| "ship" }` | See below |

Each item is either `{ type: "product", id, qty }` or `{ type: "gift", key, amount, design, to, toEmail, from, message,
date }`. `readBag()` drops unknown product ids, duplicate lines, quantities that aren't whole numbers (and caps them at
10), gift cards with an amount outside the limits, an unknown design or an invalid email, and trims text to its maximum
length. A cleaned version is written back. Bags open in two tabs stay in sync through the `storage` event.

To reset, empty the bag on `shop.html`, or run `localStorage.removeItem('fade-bag')` in the browser console. Nothing
else is stored.

## SEO and sharing

Every page has its own `<title>`, meta description, Open Graph title, description and image, `theme-color` and
favicon in the `<head>`. Social sites need an absolute image URL, so after deploying change each page's

```html
<meta property="og:image" content="assets/img/og-image.png">
```

to your full URL, e.g. `https://fadebros.example/assets/img/og-image.png`. Add a `sitemap.xml` listing the pages and a
`robots.txt`. For local search, consider adding `BarberShop` structured data (JSON-LD) with each shop's address,
phone and opening hours to `locations.html`.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page and a logical heading order.
- Visible focus styles (a red outline, brass on dark sections) on every interactive element.
- Filters are buttons with `aria-pressed`; result counts use `aria-live="polite"`.
- The booking flow moves focus to each step's heading, marks the current step with `aria-current="step"`, and the
  calendar uses a roving tabindex with arrow keys, Home/End and PageUp/PageDown. Each day's label says how many
  times are open.
- The FAQ uses native `<details>`/`<summary>`.
- Text meets WCAG AA contrast; decorative SVGs are `aria-hidden`, portraits and the map have text alternatives.
- `prefers-reduced-motion` turns off reveals, the marquee and the stamp rotation, and makes scrolling instant.

When editing, keep one `h1` per page, give new inputs a `<label>`, and keep brass text on dark backgrounds only.

## Building and deploying

### Rebuilding the CSS

Tailwind scans the HTML and `main.js` for class names. After adding new classes or editing `src/input.css`:

```sh
npm install
npm run build    # one-off, minified
npm run watch    # rebuild on every change while you work
```

Classes that only appear inside JavaScript strings must be written out in full (as they are in `main.js`) so Tailwind
finds them.

### Deploying

The folder is a static site. Upload it as is to Netlify (drag and drop the folder onto Netlify Drop), Cloudflare
Pages, GitHub Pages or any web host. There is no build step on the server. `404.html` is picked up automatically by
Netlify, Cloudflare Pages and GitHub Pages.

## Troubleshooting

- **The wait board says "Closed" during your opening hours.** Times are worked out in `FADE.shop.timeZone`. Set it to
  your shop's IANA zone (e.g. `America/New_York`) and check `hours` in `FADE.locations` (0 is Sunday).
- **A barber never shows up in booking.** They must have the shop in `schedule` and every skill in the chosen
  services' `needs` (or category). Check `skills` spelling against the category ids.
- **No times on any day.** The chosen services may be longer than the barber's shift, or the shift falls outside the
  shop's hours. Shorten the services or widen the `schedule`.
- **A new service appears on the price list but not in booking.** Add the checkbox to step 2 of `book.html` and the
  entry to `FADE.services`; the `value` must equal the `id`.
- **New Tailwind classes have no effect.** Rebuild the CSS (`npm run build`).
- **The bag shows old items after you changed product ids.** Old ids are dropped automatically on the next read; if
  you renamed an id, ask testers to clear the bag.
- **Social previews show no image.** Use an absolute `og:image` URL and the PNG, not the SVG.

## License

MIT, free for personal and commercial use. See `LICENSE.txt` in the download (the repository's MIT License). All
illustrations, portraits, product art, the map and the icons are original SVG artwork included under the same license.
