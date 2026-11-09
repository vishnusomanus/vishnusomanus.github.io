# Wander documentation

## Overview

Wander is a website for a small-group tour company, built for **Saltwind Journeys**, a fictional travel
company by Flagstaff's rail depot that runs trips of twelve travelers or fewer in Morocco, Peru, Norway,
the Aegean, Japan and Tanzania. It has a trip finder, a filterable tours page, tour pages with a
day-by-day itinerary, a route map, departure dates and a live-priced booking inquiry, a destinations page
with a seasonality chart, a journal with an article, an about page and a contact page. It is plain HTML
with Tailwind CSS v4 and one vanilla JavaScript file, with no build step needed to use it. This guide
covers version 1.0.5. See it live at [freeframe.dev/templates/wander](https://freeframe.dev/templates/wander).

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
| `index.html` | Home | Hero with postcard art, trip finder, destination ticker, featured tours (from the data), why travel with us, destinations grid, traveler postcards with ratings, journal teaser, newsletter |
| `tours.html` | All tours | Region, style, duration, month and budget filters with live counts, sort, filter chips, result count, empty state, URL parameters |
| `tour.html` | One tour (`tour.html?id=atlas-sahara`) | Key facts, highlights, itinerary accordion, route map, included and excluded, departure dates table, booking widget, inquiry form, related tours, mobile price bar |
| `destinations.html` | Regions and when to go | Seasonality table (regions × months), a section per region with highlights and a best-time chart |
| `journal.html` | Travel guides and stories | Featured story, topic filter (`journal.html?topic=food`), story cards |
| `article.html` | One journal article | Reading progress bar, table of contents, drop cap, pull quote, packing checklist, related tours |
| `about.html` | Company story | Story and timeline, numbers, guides with illustrated avatars, responsible travel commitments, "where your money goes" bar |
| `contact.html` | Contact & FAQ | Contact form with trip prefill (`contact.html?tour=kumano-kodo`), office details, emergency line, FAQ (`contact.html#faq`) |
| `404.html` | Not found | Compass illustration and links back into the site |

## Project structure

```text
wander/
  index.html … contact.html, 404.html   the pages (header and footer repeated in each)
  assets/css/style.css                  compiled Tailwind CSS (generated, do not edit)
  assets/js/main.js                     all JavaScript: trip data, illustrations, every page's features
  assets/img/favicon.svg                browser icon
  assets/img/og-image.svg               social image source (1200×630)
  assets/img/og-image.png               social image used by the pages
  src/input.css                         Tailwind source: brand tokens and component classes
  package.json                          scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

The design tokens are in the `@theme` block of `src/input.css`. Every utility such as `bg-clay` or
`text-muted` comes from them.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-paper` | `#fbf5ea` | Page background |
| `--color-postcard` | `#fffaf1` | Cards, form fields, stamps |
| `--color-sand` / `--color-dune` | `#f4e6cc` / `#ecd5ad` | Panels, chart cells |
| `--color-line` | `#e2cfae` | Borders and dashed rules |
| `--color-ink` | `#23180f` | Text, outlines and the offset card shadows |
| `--color-muted` | `#66523f` | Secondary text |
| `--color-clay` / `--color-clay-dark` | `#b0431d` / `#8c3214` | Brand color: primary buttons, links, eyebrows |
| `--color-sun` / `--color-sun-deep` | `#f4a62a` / `#b86e00` | Stamps, ticker, highlights / stars and icons |
| `--color-sea` / `--color-deep` | `#0e5a5f` / `#0a3b3f` | Dark bands, "best" season, footer |
| `--color-lagoon`, `--color-coral` | `#7cc4b8`, `#ef7b5a` | Decoration and charts |
| `--color-foam` | `#fff9ef` | Text on dark backgrounds |

To change the brand color, edit the tokens and rebuild the CSS:

```css
@theme {
  --color-clay: #2f6b4f;
  --color-clay-dark: #214d39;
}
```

A few colors are written directly into SVG in `assets/js/main.js` (the route map pins and the landscape
palettes in `SKIES` and `LAYERS`), in the logo inside each page header and footer, and in
`assets/img/favicon.svg`. Search for the hex value to change them too.

### Typography

Three Google Fonts, loaded by a `<link>` in each page's `<head>`: **Caprasimo** for headings
(`font-display`), **Outfit** for body text (`font-sans`) and **Kalam** for handwritten postcard notes
(`font-hand`, the `.hand` class). To swap them, change the `family=` parts of the link on every page and
the names in `src/input.css`:

```css
--font-sans: "Outfit", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
--font-display: "Caprasimo", "Cooper Black", ui-serif, Georgia, serif;
--font-hand: "Kalam", "Segoe Print", "Bradley Hand", cursive;
```

Caprasimo has a single weight, so headings use `font-normal`. The route map labels use Outfit, set in
`routeMap()` in `main.js`.

### Content

Page copy is in the HTML files. Everything the tours, filters and booking widget work out comes from the
constants in section 1 of `assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `REGIONS` | Regions: `id`, `name`, `label`, the `scene` and `time` of their artwork and a `season` array |
| `STYLES` | Trip styles (`hiking`, `culture`, `wildlife`, `coast`) and their labels |
| `DURATIONS` | Duration filter buckets with `min` and `max` days |
| `TOURS` | The trips, one object each (see below) |
| `INCLUDED`, `EXCLUDED` | Lines shown on every tour page, before or after each tour's own `includes` / `excludes` |
| `PRICE_MIN`, `PRICE_MAX` | Range of the budget slider on `tours.html` |
| `PEAK_SUPPLEMENT` | Added per person to departures in a region's best months |
| `DEPOSIT` | Deposit per person shown in the booking widget |
| `MAX_TRAVELLERS` | Most travelers in one inquiry |
| `BOOKING_CUTOFF` | Departures sooner than this many days from today are not offered |
| `DEPARTURE_DAYS` | Days of the month after which each departure's Saturday is chosen |

To add a tour, add an object to `TOURS`:

```js
{
  id: 'dolomites-huts', name: 'Dolomites Hut to Hut', region: 'alps', country: 'Italy', style: 'hiking',
  days: 8, price: 3090, single: 380, rating: 4.8, reviews: 0, group: 12, level: 'Moderate', badge: 'New',
  months: [6, 7, 8, 9], scene: 'mountains', time: 'day', featured: 0,
  summary: 'Seven days between mountain huts, with your bags sent ahead.',
  highlights: ['Tre Cime at sunrise', 'Nights in family-run huts', 'Via ferrata taster'],
  includes: ['Hut-to-hut luggage transfers'], excludes: [],
  stops: [[20, 70, 'Cortina'], [45, 45, 'Tre Cime'], [75, 30, 'Sesto']],
  itinerary: [
    { d: '1', t: 'Cortina', x: 'Meet the group and walk to the first hut.', stay: 'Rifugio Lago' },
    { d: '2–7', t: 'Hut to hut', x: 'Six days on high trails.', stay: 'Mountain huts' },
    { d: '8', t: 'Departure', x: 'Transfers to Venice airport.', stay: '' }
  ]
}
```

- `id` is used in URLs (`tour.html?id=dolomites-huts`, `contact.html?tour=dolomites-huts`): lower case, no
  spaces.
- `region` must be the `id` of a `REGIONS` entry (the example assumes you added an `alps` region) and
  `style` the `id` of a `STYLES` entry. The tour then appears under those filters automatically. A new
  region also needs a checkbox in the filter form in
  `tours.html` (copy one `<label class="pill-check">` and change `value` and `data-count-for`), an option
  in the home page trip finder, and a section on `destinations.html` if you want one.
- `price` is the lowest price per person and `single` the own-room supplement per person, in US dollars.
- `months` (1–12) are the months the tour departs; they drive the month filter and the departure dates.
- `stops` are route map points: `[x, y, name]`, with `x` and `y` as percentages of the map's width and
  height.
- `itinerary` entries are accordion rows: `d` is the day or range, `t` the title, `x` the text and
  `stay` the overnight (leave empty to hide it).
- `featured: 1` to `4` puts the tour on the home page in that order and first in "Recommended" sort;
  `badge` adds a label on the card.

The tour page's HTML contains Atlas to the Sahara as default text; the script replaces it with the tour
from the URL. The journal stories, guides, testimonials, FAQ and region descriptions are plain HTML.

### Images and artwork

There are no photos. Every landscape is an SVG drawn by `art(scene, time, label)` in `main.js`. Scenes are
`dunes`, `mountains`, `fjord` (with northern lights at night), `coast`, `fuji` and `savannah`; times are
`dawn`, `day`, `dusk` and `night`. Any element with `data-art="<scene>"` and `data-time="<time>"` is filled
with one (add `data-label` to give it alt text; without it the art is decorative):

```html
<div class="art-frame aspect-[4/3] rounded-[2rem]" data-art="coast" data-time="dusk" data-label="Sunset over Milos"></div>
```

The art is drawn at 3:2 and cropped to fit its frame (`preserveAspectRatio="xMidYMid slice"`), so any
aspect ratio works. To use photos instead, replace the element with an `<img>` inside the same frame
(cards use 4:3, region sections 4:3, the tour hero 21:9 on desktop), or return an `<img>` from `art()`.
The `.art-frame` class adds a subtle paper grain over whatever is inside.

Other generated art: `routeMap(tour)` draws the tour page map from `stops`, and `avatar(spec)` draws the
guide and traveler portraits for elements with `data-avatar="skin,hair,style,background"` (style is
`short`, `long`, `bun`, `curly` or `bald`). Replace either with images if you have them.

The social image is `assets/img/og-image.png` (1200×630), rendered from `og-image.svg`. Edit the SVG and
export a PNG of the same size; social sites don't display SVG. The favicon is `assets/img/favicon.svg`.

### Navigation, header and footer

The announcement bar, header, mobile menu and footer are repeated in every page. To add or remove a page,
edit the `<nav aria-label="Main">` list, the `#mobile-menu` list and the footer columns in each file. Mark
the current page's links with `aria-current="page"`; the styles highlight it. The announcement bar is the
first `<p>` after the skip link.

## Features

### Trip finder

`initFinder()`. The form `#trip-finder` on the home page has four selects (`region`, `month`, `style`,
`duration`). On submit it opens `tours.html` with only the chosen values as URL parameters, for example
`tours.html?region=japan&month=4`. Without JavaScript the form still submits to `tours.html` with GET.

### Tour filters

`initTours()` on `tours.html`. The form `#tour-filters` has checkboxes named `region`, `style` and
`duration` (several in one group combine with OR, groups combine with AND), a `month` select and a `max`
budget slider. `#sort` orders by recommended, price, length or rating (`SORTS`). Every change re-renders
`#tour-grid`, updates the live count `#result-count`, the removable chips in `#active-filters` and the
small count next to each option (how many trips you'd see if you checked it), and writes the state to the
URL with `history.replaceState`:

```text
tours.html?region=morocco,japan&style=hiking&duration=medium&month=5&max=4000&sort=price-asc
```

`readState()` reads the URL: names and values are case-insensitive, lists can be comma-separated or
repeated, and unknown values are ignored. When nothing matches, `#tour-empty` appears with a reset button.
On phones the filters are behind `#filters-toggle` (`aria-expanded`), with a badge showing how many are
active. When a month is chosen, card links carry it (`tour.html?id=…&month=5`) so the tour page preselects
a departure in that month.

### Tour page

`initTourPage()`. `?id=` picks the tour (case-insensitive); a missing or unknown id shows the first tour.
The page title and meta description, the elements marked `data-tour="name"` (and `summary`, `days`,
`price`, `rating` and so on), the hero art, highlights, included and excluded lists, map and related tours
are filled from the data.

The itinerary is a list of buttons with `aria-expanded` and `aria-controls`; the first day starts open and
`[data-itinerary-all]` expands or collapses every day.

### Departures and prices

`departures(tour, limit)` works out the next eight departures: in each month listed in `tour.months`, a
departure leaves on the first Saturday on or after each day in `DEPARTURE_DAYS`, skipping any sooner than
`BOOKING_CUTOFF` days from today. Months rated 3 ("best") in the region's `season` cost
`PEAK_SUPPLEMENT` more and are marked "Peak". Places left are demo data from a stable hash of the tour and
date, so they are the same on every visit: 0 shows "Full" (and is disabled in the widget), 1–3 "Only N
left", and four or more travelers booked shows "Guaranteed". Replace `departures()` with your real dates
(for example a fixed array per tour) if you have them; the table and widget only need objects of the form
`{ start, end, month, price, peak, left, guaranteed }`.

### Booking widget and inquiry

The `#booking-widget` card has a departure select (`#dep-select`), a travelers stepper (1 to
`MAX_TRAVELLERS`, never more than the places left) and a room choice. `quote(tour, departure, travelers,
room)` returns the price per person, the own-room supplement, the total and the deposit, shown live in an
`aria-live` list. "Choose" buttons in the dates table select a departure. The current choice is written to
the summary above the inquiry form and to its hidden fields (`tour`, `departure`, `travellers`, `room`,
`total`), so a connected form receives everything. On phones a fixed bar at the bottom shows the total and
links to the widget. `?date=YYYY-MM-DD`, `?month=5` and `?travellers=3` preselect choices.

### Seasonality

`initSeasons()` on `destinations.html` builds the `#season-table` table (a row per region, a cell per
month, each with a screen-reader label such as "April: Best") and fills each `[data-season="<region id>"]`
element with a 12-bar chart and the list of best months, all from `REGIONS[].season`. Levels are 0
(avoid), 1 (possible), 2 (good) and 3 (best). The table scrolls sideways on small screens with the region
names kept in view.

### Journal filter

`initJournal()`. Buttons with `data-topic-btn` (and `aria-pressed`) show only the story cards whose
`data-topic` matches; `#journal-status` announces the result and the URL keeps `?topic=`. To add a story,
copy an `<article data-topic="…">` card in `journal.html`.

### Scroll reveal, ticker, progress and back to top

Elements with `.reveal` fade in when scrolled into view (everything above is revealed too). The home page
ticker scrolls with CSS (`.ticker`) and pauses on hover; the hero stamp floats (`.float`). On
`article.html`, `[data-read-progress]` grows with how far you have read through `[data-article]`. Reveals,
the ticker and the float stop for visitors who prefer reduced motion. The back-to-top button is created by
the last block of `main.js`; delete that block and the `.back-to-top` styles to remove it.

## Forms

All forms with `data-validate` are checked by `initForms()` in `main.js`: errors appear on blur and on
submit, the first invalid field is focused, and each error is in the element `<field id>-error`, linked with
`aria-describedby`.

| Attribute | Rule |
|-----------|------|
| `required` | Must not be empty (checkboxes must be checked; message from `data-msg`) |
| `type="email"` | Must look like an email address |
| `type="tel"` | Digits, spaces, `+`, `(`, `)` and `-` only, 7 to 20 characters |
| `minlength` | Minimum length |
| `data-label` | Words used in the "Enter …" message |

| Form | Where | Success state |
|------|-------|---------------|
| Newsletter (`#newsletter-form`) | `index.html` | `#newsletter-success` |
| Inquiry (`#enquiry-form`) | `tour.html#enquire` | `#enquiry-success`, repeating the booking summary |
| Contact (`#contact-form`) | `contact.html` | `#contact-success` |

The form's `data-success` attribute names its success box. **The forms don't send anything** until you
connect them, although their success messages read as if they had: the newsletter one asks the reader to
look out for a confirmation email, the contact one promises a reply within one business day and the inquiry
one a reply from a travel expert within one business day, as the pages already say. The contact and inquiry
messages show a short reference (`SJ-` and four characters) made by `makeRef()` in `showSuccess()`; show
your form service's own reference instead if it returns one. To collect submissions, post the form in `onValid()` in section 11 of `main.js`,
for example to Formspree:

```js
function onValid(form) {
  fetch('https://formspree.io/f/your-id', {
    method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }
  }).then(function (res) {
    if (res.ok) showSuccess(form); else toast('Something went wrong. Please email us.');
  });
}
```

Then check the success text in each page matches what really happens. Every field has a `name`, so
`FormData` carries all values; keep a `name` on any field you add. The contact form's trip list is filled
from `TOURS`, and `contact.html?tour=<id>` preselects a trip.

## SEO and sharing

Each page has its own `<title>`, meta description and Open Graph tags in its `<head>`; the tour page updates
its title and description from the tour shown. `og:image` is the relative `assets/img/og-image.png`: once
you know your domain, make it absolute (`https://example.com/assets/img/og-image.png`) on every page,
because social sites need full URLs. `404.html` has `noindex`. Consider adding a `sitemap.xml`, a
`robots.txt`, and `TouristTrip` or `Product` structured data (JSON-LD) for each tour. Tour pages are filled
by JavaScript; if search visibility for each tour matters, generate one static page per tour.

## Accessibility

- Skip link, landmarks, one `h1` per page and a logical heading order; breadcrumbs use `aria-current`.
- `aria-current="page"` in the menus.
- Keyboard support everywhere: the mobile menu closes with Escape, the itinerary and FAQ are buttons and
  `<details>`, filter options and room choices are real checkboxes and radios.
- Live regions for the result count, the journal status, the booking total, toasts and form status;
  errors are linked to their fields and the first one is focused.
- The seasonality chart is a real table with text for every cell; the region charts and route map have
  text alternatives; decorative art is hidden from screen readers.
- Visible focus outlines, AA contrast, and `prefers-reduced-motion` turns off reveals, the ticker, the
  floating stamp and smooth scrolling.

When editing, keep one `h1` per page, give new inputs a `<label>` and a `name`, add `data-label` to art that
carries meaning, and keep icon-only buttons' `aria-label`.

## Building and deploying

`assets/css/style.css` is compiled from `src/input.css` and the classes in the HTML and `main.js`. Rebuild
it whenever you use a class that isn't already in the template:

```sh
npm install
npm run build     # once, minified
npm run watch     # rebuild on every change
```

To publish, upload the whole folder to any static host: Netlify Drop, GitHub Pages, Cloudflare Pages,
Vercel or your own server. No server code is needed.

## Troubleshooting

- **A new class has no effect.** Rebuild the CSS (`npm run build`). Classes only used in JavaScript must
  appear literally in `main.js` for Tailwind to find them.
- **A new tour doesn't appear under a filter.** Its `region` and `style` must match an `id` in `REGIONS` and
  `STYLES`, and its `months` must be numbers from 1 to 12.
- **`tour.html?id=…` shows the wrong tour.** Unknown ids fall back to the first tour; check the id matches
  `TOURS`.
- **A tour shows no departures.** Departures are only generated for the next 15 months and never sooner
  than `BOOKING_CUTOFF` days away; check the tour's `months`.
- **Prices look higher than "from".** Departures in a region's best months add `PEAK_SUPPLEMENT`; set it
  to `0` to turn peak pricing off.
- **The inquiry shows its confirmation but nothing arrives.** The forms send nothing until you connect them
  in `onValid()` (see [Forms](#forms)).
- **Fonts look different offline.** The fonts come from Google Fonts; without a connection the system
  fallbacks are used.

## License

MIT: free for personal and commercial use. See `LICENSE.txt` in the download. The SVG illustrations, logo
and social image are part of the template and covered by the same license.
