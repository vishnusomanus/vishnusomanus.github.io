# Atlas documentation

## Overview

Atlas is a personal-brand website template for an independent real estate agent or realtor. The demo content is for
**Delia Quintero**, a fictional Nashville agent who trained as an architect and works in six neighborhoods. It is
built with plain HTML5, Tailwind CSS v4 and one vanilla JavaScript file with no dependencies. Listings, neighborhoods,
the home value formula and the booking rules all live in data constants at the top of `assets/js/main.js`, and every
house and room picture is an SVG drawn from that data, so there are no photos to license. This is version 1.0.4 (see
[CHANGELOG.md](CHANGELOG.md)). Live demo: [freeframe.dev/templates/atlas](https://freeframe.dev/templates/atlas).

## Quick start

1. Unzip the download and open `index.html` in a browser. Every page works from the file system; nothing needs
   installing.
2. To preview over HTTP (closer to production), serve the folder with any static server, for example:

   ```sh
   npx serve .
   ```

3. You only need Node.js 24 if you change `src/input.css` or add Tailwind classes that are not used anywhere yet.
   See [Building and deploying](#building-and-deploying).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with portrait and "I'm buying" / "I'm selling" paths, instant estimate teaser, featured listings, count-up stats, testimonial carousel, neighborhood teaser with map, booking CTA |
| `listings.html` | Listings | Status tabs (for sale, under contract, sold, all), neighborhood, bedroom and price filters with live counts, sort, empty state, URL state, off-market CTA |
| `listing.html` | Listing detail | Reads `?id=`; illustrated gallery, key facts, description, highlights, open houses with `.ics` downloads, tour request form, similar homes, not-found state |
| `sell.html` | Selling | Three-step home value estimate, seller net proceeds sheet, four-week selling plan |
| `buy.html` | Buying | Tour-notes sketch, six-step buyer guide, affordability calculator with donut chart, FAQ accordion |
| `neighborhoods.html` | Neighborhood guides | Interactive SVG map with an info panel, six guide cards with statistics and links to filtered listings |
| `about.html` | About the agent | Story and portrait, sold history chart, timeline, three principles, credentials, personal facts |
| `contact.html` | Book a consult | Consult types, day strip, time slots, details form, live summary, confirmation with `.ics` download |
| `404.html` | Not found | Map with a bobbing pin and links back into the site |

## Project structure

```text
atlas/
  index.html ... 404.html   the nine pages (header and footer are repeated in each)
  assets/
    css/style.css           compiled Tailwind CSS (generated, do not edit by hand)
    js/main.js              data (agent, neighborhoods, listings, booking rules) and all interactivity
    img/
      favicon.svg           browser tab icon (the DQ house monogram)
      og-image.svg          social sharing image (source)
      og-image.png          social sharing image used in og:image (1200 x 630)
      delia-portrait.svg    illustrated portrait (480 x 600)
  src/input.css             Tailwind source: brand tokens and component classes
  package.json              build and watch scripts for the CSS
  README.md                 short introduction
  DOCS.md                   this guide
  CHANGELOG.md              version history
```

## Customizing

### Brand and colors

All design tokens live in the `@theme` block at the top of `src/input.css`. Each token becomes Tailwind utilities
(`bg-cobalt-600`, `text-persimmon-700`, `border-sand-200` and so on).

| Token group | Used for |
|-------------|----------|
| `--color-paper`, `--color-sand-50` to `--color-sand-300` | Page background, soft panels, borders |
| `--color-ink-400` to `--color-ink-950` | Text, the footer and dark sections |
| `--color-cobalt-50` to `--color-cobalt-900` | The brand blue: primary buttons, links, the estimate and calculator panels |
| `--color-persimmon-50` to `--color-persimmon-700` | The warm accent: highlighted words, the "selling" path, section numbers |
| `--color-butter-100` to `--color-butter-400` | Highlights on dark backgrounds, the "under contract" pill |
| `--color-moss-100` to `--color-moss-700` | Parks and gardens in the art, "sold" results |

To change the brand blue, replace the cobalt scale and rebuild the CSS:

```css
@theme {
  --color-cobalt-600: #0f766e;
  --color-cobalt-700: #0d5f59;
  --color-cobalt-800: #0b4a46;
}
```

Contrast rules noted in the comments: use `persimmon-600` or darker behind white text, `persimmon-700` for small
persimmon text on paper, and `ink-600` or darker for small gray text. Reusable pieces such as `.btn`, `.btn-primary`,
`.card`, `.kicker`, `.display`, `.hl`, `.swash`, `.input`, `.tab`, `.seg`, `.slot` and `.listing-card` are defined in
the `@layer components` block of the same file.

The illustrations use hex colors directly: the `art` colors of each listing in `main.js`, the constants `GLASS`,
`LAWN`, `TREE` and `TREE_DARK` near the house drawings, the map in each page, and the SVG files in `assets/img/`. If
you change the palette, search for the old hex values (for example `#2742cc` and `#e4552b`) and replace them.

### Typography

Two Google Fonts are loaded in the `<head>` of every page:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Albert+Sans:ital,wght@0,400..800;1,400..600&amp;family=Gloock&amp;display=swap">
```

`--font-display` (Gloock, a high-contrast display serif with a single weight) is used for headlines, prices and big
numbers through the `.display` class and `font-display`; `--font-sans` (Albert Sans) is the body face. Gloock has no
italic, so emphasis in headlines uses the `.hl` color and the hand-drawn `.swash` underline instead. To swap fonts,
change the link on every page and the two `--font-*` tokens in `src/input.css`. Inline SVGs that contain text (the
logo, map labels, the chart and the footer wordmark) name the fonts in `font-family` attributes.

### Content

Page text is plain HTML. The data that drives the interactive parts lives at the top of `assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `AGENT` | Name, phone, email, office address and time zone (`America/Chicago`), used in calendar files and titles |
| `AREAS` | The six neighborhoods: `id`, `name`, `ppsf` (price per square foot), `median`, `dom` (average days on market) and `yoy` (one-year price change) |
| `LISTINGS` | Every home, active, under contract or sold |
| `VALUATION` | Factors and rounding for the home value estimate |
| `CONSULT_TYPES` | Bookable consultations: label, length in minutes and where they happen |
| `AVAILABILITY` | Weekly hours, slot spacing, notice period, number of days shown, closed dates and the demo "busy" share |

A listing looks like this (fields after `description` shortened):

```js
{ id: 'utah-4512', status: 'active', featured: true, address: '4512 Utah Ave', area: 'sylvan-park', zip: '37209',
  price: 925000, beds: 3, baths: 2, sqft: 1780, lot: '0.21 acres', year: 1928, type: 'Single-family', style: 'Craftsman bungalow', dom: 3, listed: '2026-10-12',
  headline: 'A Sylvan Park bungalow with the original built-ins',
  description: ['First paragraph.', 'Second paragraph.'],
  features: ['Original built-ins and fireplace', 'Deep back deck'],
  openHouses: [['sat', '13:00', '15:00']],
  art: { style: 'bungalow', sky: '#e3ead9', body: '#8fa97a', roof: '#435a39', trim: '#f6f2ea', door: '#a13517' } }
```

To add a home, copy an object in `LISTINGS` and change it:

- `id` must be unique; it is the `?id=` of the listing page.
- `status` is `active`, `pending` or `sold`. Sold homes also need `sold: { price, date }` (`date` as `YYYY-MM-DD`).
- `area` must be an `id` from `AREAS`.
- `featured: true` puts an active home on the home page (the first three are shown).
- `listed` (and `sold.date`) drive the "Newest" sort.
- `openHouses` is a list of `[weekday, start, end]` in Nashville time, with weekdays `sun` to `sat` and 24-hour
  times. Each one is shown on its next date, so they never go stale. Only active homes show open houses.
- `art.style` picks the house drawing (see [Images and artwork](#images-and-artwork)).

The listing cards, the listing page, the "recent sales" on the estimate, the map counts and the guide buttons all
read this array, so nothing else needs updating. Neighborhood statistics come from `AREAS`; the guide text itself is
HTML in `neighborhoods.html`.

The home page stats, testimonials, the about page chart and timeline are HTML. Keep the headline numbers (238 homes,
8 days, 101.6%, $171M) in step across `index.html`, `sell.html` and `about.html` when you change them.

### Images and artwork

Everything is SVG:

- **Houses.** `houseSVG()` in `main.js` draws a 400 x 300 (4:3) house for each listing from its `art` object. The
  styles are `victorian`, `farmhouse`, `bungalow`, `townhome`, `modern`, `ranch`, `foursquare`, `tudor` and `condo`;
  the colors are `sky`, `body`, `roof`, `trim` and `door`.
- **Rooms.** The gallery on `listing.html` shows the house plus five rooms (`living`, `kitchen`, `bedroom`, `bath`,
  `yard`) drawn by `ROOMS` and tinted from the same colors. The list and captions are in `GALLERY`.
- **Portrait.** `assets/img/delia-portrait.svg` (480 x 600, 4:5) is used on the home, about and listing pages. Replace
  it with a 4:5 photo; the `.arch` class rounds the top into an arch.
- **Map.** The neighborhood map is inline SVG in `index.html`, `neighborhoods.html` and `404.html`. It is stylized,
  not to scale. Each area is a `<polygon class="area-shape">` with a label; on `neighborhoods.html` each sits in an
  `<a class="map-area" data-area="...">`.

To use real photos for listings, add an image URL to each listing (for example `photo: 'assets/img/utah-4512.jpg'`)
and return an `<img>` instead of `houseSVG(l, ...)` in `listingCard()` and in the gallery's `roomSVG()` call. Keep a
4:3 aspect ratio so cards line up.

The social image is `assets/img/og-image.png` (1200 x 630); `og-image.svg` is its editable source. After editing the
SVG, export it to PNG with any tool (or open it in a browser and take a 1200 x 630 screenshot). The favicon is
`assets/img/favicon.svg`.

### Navigation, header and footer

The header (with the "Open this weekend" bar) and the footer are repeated in every page. To add or remove a page,
edit the `<nav aria-label="Main">` list, the `#mobile-menu` list and the footer "Explore" list in each file, and put
`aria-current="page"` on the link to the current page. The weekend bar links to one listing; change its text and
`listing.html?id=` link in every page, or delete the bar's `<div>`.

## Features

### Listings filters

`listings.html` renders cards into `[data-listings] [data-results]` with `initListings()`.

- **Status tabs** are buttons with `data-status` (`active`, `pending`, `sold`, `all`) and `aria-pressed`.
- **Filters**: neighborhood (`area`), minimum bedrooms (`beds`: 1 to 4), minimum and maximum price (`min`, `max`, from
  `PRICE_STEPS`), and sort (`newest`, `price-asc`, `price-desc`, `size`). Sold homes are filtered and sorted by their
  sold price.
- **Live counts**: each tab and each neighborhood option shows how many homes you would see if you picked it, given
  the other filters.
- **URL state**: the state is written to the address bar with `history.replaceState`, for example
  `listings.html?status=sold&area=east-nashville&beds=3`. Defaults (`status=active`, `sort=newest`) are left out.
  Unknown values (`?status=banana`, `?min=7`) are ignored and dropped.
- **Empty state**: `[data-empty]` appears when nothing matches, with a clear-filters button.

The result count is an `aria-live` region, so screen readers hear "3 homes for sale" after each change.

### Listing page

`initDetail()` reads `?id=` from the URL and fills every `[data-l="..."]` element. Without an `id` it shows the first
listing; with an unknown one it shows the not-found section (`[data-not-found]`), which takes over the page's `<h1>`.
The tab title becomes "address, neighborhood — site name", where the site name is read from `og:site_name`.

The gallery has previous and next buttons, thumbnails with `aria-current`, and responds to the left and right arrow
keys when focused. Sold homes show the sold price, the percentage of asking and a "Want one like this?" panel instead
of the tour form; homes under contract say so in the open-house box.

### Open houses and calendar files

`nextOpenHouse()` turns each `[weekday, start, end]` into the next real date in `AGENT.timeZone`, skipping one that
has already ended today. Times are shown in Central Time, with the visitor's own time added when they are in another
time zone. "Add to calendar" builds an iCalendar file with `buildIcs()` (times in UTC, so every calendar app places it
correctly) and downloads it with `downloadIcs()`.

### Home value estimate

The teaser on the home page (`[data-estimate-teaser]`) and the three-step wizard on `sell.html` (`[data-valuation]`)
share `estimate()`:

```text
value = sqft x area ppsf x type factor x condition factor x (1 + bed and bath adjustment) x (1 + extras)
range = value plus or minus the condition's spread, rounded to $5,000
```

The factors are in `VALUATION`. The teaser links to `sell.html?area=...&sqft=...#valuation`, which pre-fills the
wizard. Each wizard step validates before moving on and moves focus to the next step's heading. The result shows
where the estimate sits against the neighborhood median and lists the agent's sold homes in that area. "Use in the net
sheet" copies the midpoint into the net sheet. The page states clearly that the estimate is illustrative.

### Seller net sheet

`[data-net-sheet]` recalculates on every input: sale price minus commission (percent), closing costs (percent),
mortgage payoff and repairs or credits. The colored bar uses `[data-bar]` segments sized as a share of the price, and
a warning appears if costs exceed the price. Money fields with `data-money` are formatted with thousands separators
when you leave them.

### Affordability calculator

`[data-afford]` on `buy.html` applies the 28/36 rule from `AFFORD`: housing costs up to 28% of gross monthly income,
and housing plus debts up to 36%. It finds the highest price whose monthly cost (principal and interest, property
tax, insurance, mortgage insurance below 20% down, HOA dues) fits both limits, draws an SVG donut of the payment, and
links to `listings.html?max=` with the highest price step at or below the result. Change `FRONT_END`, `BACK_END`,
`PMI_RATE` or `PMI_BELOW` in `AFFORD` to use different assumptions.

### Neighborhood map

On `neighborhoods.html`, hovering or focusing an area on the map (`[data-area]`) highlights its guide card
(`[data-area-card]`) and fills the info panel (`[data-map-info]`); hovering or focusing a card highlights its area.
Each area is a link to its guide, so Tab and Enter work. Selecting an area (or arriving with a `#east-nashville` style
hash) keeps it highlighted. Elements with `data-area-count="id"` show the number of active listings and elements with
`data-area-stat="id:median"` (also `ppsf`, `dom`, `yoy`) show statistics from `AREAS`.

To add a neighborhood, add it to `AREAS`, add a polygon to the map in each page that has it, and copy a guide
`<article>` in `neighborhoods.html` with matching `id` and `data-area-card`.

### Consultation booking

`initBooking()` on `contact.html` runs the booking form:

1. **Consult type**: radio cards from `CONSULT_TYPES` (`buyer`, `seller`, `value`, `relocation`). `?type=seller`
   pre-selects one, and `?listing=<id>` pre-fills the message.
2. **Day**: a strip of the next `AVAILABILITY.daysShown` days that have a free slot, skipping closed dates and days
   without hours.
3. **Time**: slots every `slotStep` minutes inside the day's windows, long enough for the chosen consult and at least
   `minNoticeHours` from now. All times are Nashville time (`AGENT.timeZone`), with the visitor's local time added in
   the summary when it differs.
4. **Details**: name, email, optional phone, timeline and message.

The summary panel updates live. On submit, missing choices are reported inline and focus moves to the first problem.
The confirmation repeats the booking, shows a short reference (`DQ-` and four characters, from `makeRef()` in
`main.js`) and offers an `.ics` download that carries the same reference. `demoBusyShare` marks a fixed share of slots as
taken (the same ones on every load) so the demo looks realistic; set it to `0` when connected to a real calendar.

### Carousel, stats, reveals and back to top

- **Testimonials** (`[data-carousel]`) are a native scroll-snap track with previous and next buttons and a "1 / 6"
  status. Swipe, trackpad and keyboard scrolling work.
- **Count-up stats** animate elements with `data-count` (and optional `data-decimals`) once they scroll into view.
- **Scroll reveals** fade in `.reveal` elements. Revealing an element also reveals everything above it, so jumping
  with the End key or an anchor never leaves hidden content.
- **FAQ** buttons (`.acc-btn`) toggle their panel and `aria-expanded`.
- **Back to top** is created by the last block in `main.js`; delete that block and the `.back-to-top` styles to remove
  it.

Animations, smooth scrolling and transitions are turned off for visitors who prefer reduced motion.

## Forms

| Form | Where | Validates |
|------|-------|-----------|
| Newsletter (`[data-newsletter-form]`) | Footer of every page | Email |
| Tour request (`[data-tour-form]`) | `listing.html` | Date (today or later), name, email, optional phone |
| Home value wizard | `sell.html` | Address, neighborhood, square feet (400 to 9,000) |
| Booking | `contact.html` | Consult type, day, time, name, email, optional phone |

Fields with `data-validate` are checked on submit and again as the visitor corrects them; errors appear under the
field and are linked with `aria-describedby`. The values are `required`, `email`, `phone-optional`, `address`,
`sqft`, `future-date` and `choice` (a radio group), and `data-message` overrides the empty-field message.

After validation each form shows an in-world confirmation: the newsletter asks the subscriber to look out for a
confirmation email, and the tour request and the booking show a short reference made in the browser (`DQ-` and four
characters, from `makeRef()` in `main.js`; if your form service or booking tool returns its own reference, show that
instead). The tour confirmation promises an email "within a few hours" and the booking confirmation "within one
business day", matching what the pages already say; change them to match how you actually reply.

**Nothing is sent until you connect the forms.** To send data, replace the commented block in the submit handler in
`main.js`.

### Connecting to Formspree

Create a form at Formspree, then in the newsletter handler (search for `Connect a real endpoint here`) send the data
before showing the success panel:

```js
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validateForm(form)) return;
  fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    .then(function (res) {
      if (!res.ok) throw new Error('Send failed');
      form.hidden = true;
      success.classList.remove('hidden');
      success.focus();
    })
    .catch(function () { alert('Sorry, that did not send. Please email hello@deliaquintero.example.'); });
});
```

Do the same in the tour form handler in `initDetail()`. Every form field has a `name`, so `FormData` picks them all
up; the tour form also sends the listing address in a hidden `listing` field.

### Connecting a booking tool

The booking flow is a front end only. Either replace the form on `contact.html` with your Cal.com or Calendly embed,
or keep it and post the request to your form service in the submit handler in `initBooking()` (the block marked
"Connect a real booking tool"), sending `state.type`, `state.slot.start.toISOString()` and the details fields. Set
`AVAILABILITY.demoBusyShare` to `0` either way.

## SEO and sharing

Each page has its own `<title>`, meta description and Open Graph tags in its `<head>`. The listing page sets its title
from the listing in JavaScript. `og:image` points to `assets/img/og-image.png` with a relative path; most social sites
need an absolute URL, so after deploying change it on every page, for example:

```html
<meta property="og:image" content="https://www.example.com/assets/img/og-image.png">
```

`404.html` has `<meta name="robots" content="noindex">`. Consider adding a `sitemap.xml` listing your pages, and a
`robots.txt`. Because listing pages are built from `?id=`, search engines see one `listing.html`; if listings matter
for search, give each home its own static page.

Real estate sites usually must show license and brokerage details and fair-housing wording. The footer has
placeholders (license no. 000000, Larkspur & Main Realty); replace them with your real details and check your
state's advertising rules.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page and a logical heading order.
- Visible focus outlines (cobalt on light, butter on dark backgrounds) and WCAG AA contrast for text.
- The mobile menu button uses `aria-expanded` and `aria-controls`; Esc closes the menu.
- Status tabs, bedroom choices and day buttons use `aria-pressed` or native radios; result counts, the estimate
  teaser, calculator results and the booking summary are `aria-live` regions.
- The map areas are links with descriptive labels; illustrations are either labeled (`role="img"`) or hidden from
  screen readers when decorative.
- Booked time slots are announced as "booked" rather than offered.
- Motion is reduced for visitors who prefer it.

When editing, keep one `<h1>` per page, give every new input a `<label>`, and keep the `data-*` hooks that
`main.js` uses.

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` is generated from `src/input.css` by Tailwind CSS. Rebuild it after changing tokens or using
classes that don't exist in the compiled file yet:

```sh
npm install
npm run build    # or: npm run watch
```

Classes used only inside JavaScript strings are picked up too, because Tailwind scans `assets/js/main.js`.

### Deploying

Upload the folder to any static host: Netlify (drag the folder onto Netlify Drop), GitHub Pages, Cloudflare Pages, or
your own server. There is no server code. `src/`, `package.json` and the Markdown files are not needed on the server.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| A new Tailwind class has no effect | Rebuild the CSS (`npm run build`). The compiled file only contains classes that were used when it was built. |
| A listing page says "That listing isn't on my desk" | The `?id=` doesn't match any `id` in `LISTINGS`. Check the spelling, including the link on cards you added by hand. |
| A new listing doesn't appear | Its `status` must be `active`, `pending` or `sold`, its `area` must match an `id` in `AREAS`, and check the browser console for a missing comma. |
| Open houses show the wrong day or time | Weekdays are `sun` to `sat`, times are 24-hour Nashville time, and the agent's zone is `AGENT.timeZone`. |
| No booking days appear | Check `AVAILABILITY.hours` (day 0 is Sunday) and `closed`, and that `minNoticeHours` isn't larger than your windows. |
| Map counts show 0 | `data-area-count` must use the same `id` as `AREAS` and `LISTINGS`, and only active listings are counted. |
| The social image doesn't show when sharing | Use an absolute `og:image` URL and the PNG, not the SVG. |
| Fonts look different | The Google Fonts link must be present on the page; check your Content Security Policy allows `fonts.googleapis.com` and `fonts.gstatic.com`. |

## License

MIT. Free for personal and commercial use; see `LICENSE.txt` in the download (or the repository license). All
illustrations, the portrait, map and icons are part of the template and covered by the same license. The agent,
brokerage, homes, prices and clients are fictional.
