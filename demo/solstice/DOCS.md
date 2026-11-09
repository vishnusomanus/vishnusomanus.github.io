# Solstice documentation

## Overview

Solstice is a sunny, poster-style website for an outdoor food and music festival: a live countdown, a
filterable lineup with artist pop-ups, a multi-stage schedule where visitors build their own plan (with
clash warnings and a calendar export), a ticket shop with early-bird prices and a group discount, a food
village with dietary filters and a map, and a visitor guide with an interactive site map and a searchable
FAQ. The demo event is **Solstice 2027**, a fictional three-day festival at Birch Bluff Farm, Traverse City, Michigan
(Friday – Sunday, June 25–27, 2027) with 40 acts on four stages and 16 food and drink vendors. It is built
with HTML5, Tailwind CSS v4 and vanilla JavaScript, and needs no build step. This guide covers version
1.0.8

Live demo: [freeframe.dev/templates/solstice](https://freeframe.dev/templates/solstice)

## Quick start

1. Unzip the download and open `index.html` in a browser.
2. Or serve the folder with any static server:

   ```sh
   cd solstice
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

Add `?now=2027-06-25T21:30` to any page's URL to preview it at a given festival time (see
[Previewing a date](#previewing-a-date)). Node.js 24 is only needed to rebuild the CSS (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections |
|------|---------|------------------|
| `index.html` | Home | Poster hero with countdown and early-bird sticker, scrolling tape, poster-style lineup by day, "What's on" tiles, ticket preview, numbers, FAQ teaser, visitor guide card, lineup alerts sign-up |
| `lineup.html` | Lineup | Day, stage and genre filters (kept in the URL), "My plan only", artist cards with generated artwork, artist pop-up |
| `schedule.html` | Schedule | Day tabs, grid and list views, "My plan only", My plan panel with clashes, `.ics` export and clear, opening times |
| `tickets.html` | Tickets | Day, weekend and add-on rows with steppers, order summary with fees and group discount, three-step checkout with an order reference, good-to-know cards |
| `food.html` | Food & drink | Food/sweet/drink and dietary filters, search, vendor cards, food village map with numbered pins |
| `info.html` | Plan your visit | Site map with layer toggles and a text version, getting there, accessibility, families, what to bring, searchable FAQ |
| `contact.html` | Get involved | Contact form that routes volunteer, vendor, press and visitor inquiries, direct contacts |
| `404.html` | Not found | Error page with links back |

## Project structure

```text
solstice/
├── index.html, lineup.html, schedule.html, tickets.html, food.html, info.html, contact.html, 404.html
├── assets/
│   ├── css/style.css      compiled Tailwind CSS (generated, do not edit by hand)
│   ├── js/data.js         festival content: days, stages, genres, artists, vendors, tickets, add-ons
│   ├── js/main.js         every interactive feature, forms, reveals and the back-to-top button
│   └── img/
│       ├── hero-sun.svg   striped sunset sun with slowly turning rays
│       ├── hero-hills.svg layered hills with the main stage, trees, tents and a ferris wheel
│       ├── bunting.svg    flag bunting along the top of the home and visitor pages
│       ├── favicon.svg    sun logo mark
│       ├── og-image.svg   social image source
│       └── og-image.png   social image (1200×630) used in og:image
├── src/input.css          Tailwind source: design tokens (@theme) and component classes
├── package.json           scripts to rebuild the CSS
├── template.json          template metadata used by freeframe.dev
├── README.md
├── CHANGELOG.md
└── DOCS.md                this guide
```

## Customizing

### Brand and colors

All colors are tokens in the `@theme` block of `src/input.css`. Tailwind turns each one into utilities
(`bg-sun`, `text-tomato`, `border-ink`...), and the component classes use them through CSS variables.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-cream` | `#fff4de` | Page background |
| `--color-paper` | `#fffbf2` | Cards, fields, buttons |
| `--color-ink` | `#24122e` | Text, outlines, hard shadows, footer |
| `--color-muted` | `#654757` | Secondary text |
| `--color-sun` / `--color-sun-soft` | `#ffc53d` / `#ffe08a` | Main accent, planned sets, hover states |
| `--color-tangerine` | `#ff8a2b` | Orchard stage, accents |
| `--color-tomato` | `#c73a1e` | Primary buttons, clash warnings, eyebrows |
| `--color-sea`, `--color-sky`, `--color-leaf`, `--color-peach` | | Section colors, stages, dietary tags |

To change the main accent, edit the token and rebuild:

```css
@theme {
  --color-tomato: #b4235a; /* raspberry buttons and warnings instead of tomato red */
}
```

Keep white text on `--color-tomato` at 4.5:1 contrast or more. The SVG files in `assets/img/` and the
generated artwork in `main.js` use hex colors directly; search for the old hex value to change them too.

The "poster" look comes from a few component classes in `src/input.css`: `.poster` (thick ink outline
and a hard offset shadow), `.poster-sm`, `.poster-hover`, `.btn` with `.btn-primary`, `.btn-sun`,
`.btn-ink` and `.btn-ghost`, `.chip`, `.tag`, `.display` (condensed uppercase headings) and `.wordmark`.

### Typography

Three Google Fonts are loaded in the `<head>` of every page:

| Font | Token | Used for |
|------|-------|----------|
| Bricolage Grotesque (wdth 75–100, wght 400–800) | `--font-display` | Headings via `.display` and `.h-section`, numbers |
| DM Sans | `--font-sans` | Body text |
| Shrikhand | `--font-script` | The "Solstice" wordmark (`.wordmark`) |

To swap a font, change the Google Fonts `<link>` in each page and the matching token in `@theme`.
`.display` uses `font-stretch: 75%`; if your new display font has no width axis, remove that line.

### Content

Festival content lives in `assets/js/data.js` as `window.SOLSTICE`:

| Key | What it holds |
|-----|---------------|
| `keepDemoCurrent` | `true` in the demo: once the festival is over, every date moves on a year (see [Demo dates](#demo-dates)). Set it to `false` when you enter your real dates |
| `gatesOpen`, `utcOffset` | Opening time and the festival's UTC offset (`-04:00` for Eastern Daylight Time) |
| `days` | `id`, `label`, `short`, `date`, `gates`, `curfew` |
| `stages` | `id`, `name`, `blurb` (order = schedule column order) |
| `genres` | Genre id → label |
| `artists` | One entry per act and set (see below) |
| `diets`, `vendors` | Dietary labels and the food village vendors |
| `tickets`, `addons` | Ticket types and extras with prices |
| `earlyBirdEnds`, `groupSize`, `groupDiscount`, `fee`, `maxPerType`, `currency` | Ticket rules |

Add an artist by adding an object to `artists`. Times are local festival time, 24-hour; the pages show them on the 12-hour clock:

```js
{ id: 'paper-moons', name: 'Paper Moons', day: 'sat', stage: 'orchard', start: '19:15', end: '20:00',
  genre: 'folk', tier: 3, from: 'Ann Arbor',
  bio: 'Three-part harmonies and a borrowed double bass.', art: ['waves', '#8fd0ee', '#24122e'] }
```

- `id` must be unique; it is used in URLs (`lineup.html?artist=paper-moons`), the plan and the calendar.
- `tier` is 1 for headliners (red "Headliner" badge, listed first), 2 for special guests, 3 for the rest.
- `art` is `[motif, background, foreground]`. Motifs: `sun`, `waves`, `rings`, `stripes`, `burst`, `hills`.
- Sets should finish by midnight; the schedule grid spans from the earliest start to the latest end of
  each day.

The lineup and schedule are drawn from this data automatically. The poster-style lineup on the home
page (`index.html`, "Three days. Forty acts.") is plain HTML so search engines can read it: update it
by hand when you change headliners.

Add a vendor to `vendors`:

```js
{ id: 'pie-minister', name: 'Pie Minister', kind: 'food', cuisine: 'Savory pies',
  dish: 'Steak or mushroom pies with mashed potatoes', price: '$12–$16',
  diets: ['vegetarian'], pin: [62, 44] }
```

`kind` is `food`, `sweet` or `drink` (pin color and the "Show" filter). `diets` uses the keys of `diets`.
`pin` is the position on the food village map in percent (x, y). Vendor numbers follow the array order.

Ticket prices are in `tickets` (`price` and `early`, in dollars) and `addons` (`price`). The ticket rows
in `tickets.html` show the same names and prices; prices on every page are refreshed from `data.js`
when the page loads (elements with `data-price-of="<ticket id>"` and `data-full-of="<ticket id>"`), so
`data.js` is the source of truth. If you add a ticket type, copy one of the rows in `tickets.html` and
change its `data-qty`, ids and labels.

### Images and artwork

There are no photos. All artwork is SVG:

- `hero-sun.svg` (600×600) and `hero-hills.svg` (1440×300) are reused on the home page, inner page
  headers and the 404 page. The sun's rays turn slowly; the animation is inside the SVG and stops for
  visitors who prefer reduced motion.
- Artist artwork is generated by `artSvg()` in `main.js` from each artist's `art` setting. To use photos
  instead, replace `artSvg(a)` in the card and pop-up templates with an `<img>`; keep a square (1:1)
  image for cards.
- The site map (`info.html`) and the food village map (`food.html`) are inline SVG. Food pins are drawn
  by `main.js` from `vendors[].pin`.
- `og-image.svg` is the editable source of the social image; export it to `og-image.png` at 1200×630
  after editing (most social sites don't display SVG).
- `favicon.svg` is the logo mark; the same mark is inlined in each page's header and footer.

### Navigation, header and footer

The header and footer are repeated in every HTML file. To add a page, copy an inner page such as
`contact.html`, then add a link to the desktop `<nav aria-label="Main">`, the mobile menu
(`#mobile-menu`) and the footer in every page. Mark the current page with `aria-current="page"` on its
links. The "My plan" pill (`[data-plan-link]`) and every `[data-plan-count]` element show how many sets
are saved.

## Features

### Countdown

`index.html` has `<div data-countdown="2027-06-25T14:00:00-04:00">` with four `[data-unit]` cells
(days, hours, minutes, seconds). Change the attribute to move the target. When it reaches zero, the
cells are hidden and `[data-countdown-done]` is shown. The countdown has `role="timer"`.

### Early-bird prices

`earlyBirdEnds` in `data.js` decides which price is used everywhere. Before that moment, early-bird
prices show with the full price struck through and `[data-early-only]` elements (such as the hero
sticker) are shown; afterwards, full prices show and `[data-early-hide]` elements appear instead.

### Lineup filters and artist pop-up

The code is in the "lineup page" section of `main.js`. Day buttons (`[data-day-filter]`), the stage and
genre selects (`#filter-stage`, `#filter-genre`) and "My plan only" (`[data-plan-only]`) filter the
cards; the result count is announced through an `aria-live` region. Filters are written back to the URL
with `history.replaceState`, so `lineup.html?day=sat&stage=meadow&genre=indie` can be shared or
bookmarked. `lineup.html?artist=<id>` opens that artist's pop-up on load.

Clicking an artist name opens a native `<dialog>` (`[data-artist-modal]`) with the artwork, stage, set
time, bio, a clash warning if relevant, "Add to my plan" and "See in schedule". Esc, the close button or
a click on the backdrop closes it, and focus returns to the card.

### My plan and clash detection

Every sun button (`[data-plan-toggle="<artist id>"]`) adds or removes a set from the visitor's plan and
uses `aria-pressed`. The plan is saved in `localStorage` (see [Saved data](#saved-data-localstorage)),
shared by all pages and synced between open tabs. `clashes()` in `main.js` marks two planned sets as
clashing when they are on the same day and their times overlap.

### Schedule

`schedule.html` shows one day at a time with keyboard-friendly tabs (Left/Right, Home/End). The day is
kept in the URL (`schedule.html?day=sun`); without it, the page opens on the current festival day or
Friday. "Grid" draws the four stages as columns on an hour scale (scrolls sideways on small screens);
"List" shows the day's sets in time order. List is the default below 768px. Planned sets are yellow and
clashes get a red striped background and a "Clash" badge. Links like `schedule.html?day=fri#set-halcyon-bloom`
scroll to and highlight one set.

The My plan panel lists saved sets by day with their clashes, and has two buttons:

- **Add to calendar (.ics)** downloads `solstice-2027-my-plan.ics` with one event per set (times in
  UTC, location and description included). It works with Apple, Google and Outlook calendars.
- **Clear plan** needs two clicks within three seconds, so a stray tap can't wipe the plan.

To change the hour height of the grid, edit `--hour` on `.tt` in `src/input.css`.

### Tickets and checkout

Steppers (`[data-qty]` with `[data-step="-1"]` and `[data-step="1"]`) change quantities from 0 to
`maxPerType`. The order summary lists every line, then:

- **Group discount**: `groupDiscount` (10%) off the ticket subtotal when an order has `groupSize` (6) or
  more tickets. Add-ons are not discounted. A hint shows how many more tickets unlock it.
- **Service fee**: `fee` ($4.50) per ticket; add-ons have no fee.
- **Rules**: a RV site needs a Weekend + camping or Family weekend ticket per RV, and a bell tent
  needs at least one of those tickets. The summary explains the problem and disables "Continue".

The cart is saved on the device. "Continue to details" shows step 2, a validated form (name, email, ZIP
code, two required checkboxes); a valid submit shows step 3, "Order … is confirmed", with an order reference
(`SO-` and four characters, from `makeRef()`; use your ticketing provider's own reference instead if it returns
one), the total and a note that the e-tickets are on their way by email, hides the order summary so the confirmation spans the full width (`data-step="done"` on `[data-checkout-layout]`), and empties the cart. Nothing is charged or sent. To sell real tickets, link the "Continue"
button to your ticketing provider, or send the cart to your own checkout from the `solstice:valid`
listener in the "tickets page" section of `main.js`.

### Food village filters and map

"Show" buttons (`[data-kind]`) filter by food, sweet or drink; dietary chips (`[data-diet]`) can be
combined and vendors must match all of them; the search box matches name, cuisine and dish. Matching pins
on the map stay bright, others fade. "Show on map" highlights a vendor's pin; clicking a pin (or pressing
Enter on it) highlights the vendor's card. `food.html?diet=vegan,gluten-free` preselects dietary filters.

### Site map layers

Each layer of the `info.html` map is a `<g class="map-layer" data-layer-group="...">` (`stages`, `food`,
`toilets` (the Restrooms layer), `firstaid`, `water`, `access`). The buttons with the same `data-layer` toggle it with
`aria-pressed`, and "Show all" turns every layer back on. Each symbol has a `<title>` tooltip, and the
"Read the map as a list" section gives the same information as text. To add a symbol, put a new `<g>` with
a `<title>` inside the right layer group.

### FAQ search

Typing in `[data-faq-search]` filters the `[data-faq]` questions on `info.html`, opens matches,
highlights the words with `<mark>`, hides empty groups (`[data-faq-group]`) and announces the count. To
add a question, copy a `<details class="faq ..." data-faq>` block; keep the `data-faq-q` and `data-faq-a`
hooks.

### Contact routing

The topic radios on `contact.html` show the matching `[data-topic-panel]` (`volunteer`, `trader`, `press`,
`general`), disable the fields of the others (so they are neither validated nor submitted) and say where the
message goes. `contact.html?topic=trader` preselects a topic. Team names and addresses are in `ROUTES` in
the "contact" section of `main.js`.

### Scroll reveals, tape and back to top

Elements with `.reveal` fade in as they scroll into view, and everything above them is revealed too, so
fast jumps never leave gaps. The home page tape scrolls continuously and pauses on hover. A back-to-top
button appears after one screen of scrolling; it steps aside for the sticky order summary
(`data-back-to-top-hide`). All motion is switched off for visitors who prefer reduced motion.

### Demo dates

The demo is written for June 25–27, 2027. While `keepDemoCurrent` in `data.js` is `true` and that edition is over
(after the last day's curfew), the script moves every date to the same week of the next year, by whole weeks so
weekdays never change (Friday, June 25, 2027 becomes Friday, June 23, 2028), so the countdown, early-bird prices,
schedule and calendar export always point at an upcoming festival. The year of the edition follows. It updates:

- `days` dates, `gatesOpen`, `earlyBirdEnds`, the countdown target and years and dates in the artist bios;
- `data-edition` text: `dates` ("June 25–27, 2027"), `dates-noyear`, `dates-long` ("Friday – Sunday, June 25–27, 2027"), `dates-long-noyear`, `year` and `year+1`;
- `data-date="2027-06-01"` text ("June 1, 2027"; `data-date-format="dm"` leaves out the year, and
  `data-date-end` makes a range such as "June 19–24");
- `data-day-label="fri"` ("Friday, June 25"), the page title, `aria-label`s and `data-error` messages.

Before the edition is over nothing is changed, so `?now=2027-06-26T21:40` still previews the festival weekend.
**Set `keepDemoCurrent` to `false` once you enter your real dates.**

### Previewing a date

Add `?now=YYYY-MM-DDTHH:MM` (festival local time) to any page to pretend it is that moment, for example
`tickets.html?now=2027-03-01T10:00` to see full prices after the early-bird ends, or
`schedule.html?now=2027-06-26T15:00` to open on Saturday.

## Forms

Every form with `data-validate` gets inline validation from the "forms" section of `main.js`: errors
appear under each field (linked with `aria-describedby`), `aria-invalid` is set, and focus moves to the
first problem. Groups of checkboxes or radios use `<fieldset data-group-required="message">`.

| Form | Page | Validates |
|------|------|-----------|
| Lineup alerts (`data-form="alerts"`) | `index.html` | Email, at least one alert type |
| Checkout (`data-form="checkout"`) | `tickets.html` | Name, email, ZIP code pattern (5 digits, optional +4), age and terms checkboxes |
| Contact (`data-form="contact"`) | `contact.html` | Topic, name, email, topic fields, message of 20+ characters |

Each form finishes with an in-world confirmation. The lineup alerts ask subscribers to look out for a
confirmation email. The contact form says which team the message reached, repeats that team's reply time from
`ROUTES` (the same times the page shows before sending) and shows a reference (`SO-` and four characters, made
in the browser by `makeRef()` in `main.js`; use your form service's own reference instead if it returns one).
Change the reply times in `ROUTES` if yours differ.

**The forms don't send anything until you connect them.** On a valid submit, the form fires a
`solstice:valid` event with the `FormData` and shows its `[data-success]` message. To connect a form service such as Formspree, set
the form's `action` and send the data in the submit handler, where the comment marks the spot:

```js
// in form.addEventListener('submit', ...) in assets/js/main.js
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (!res.ok) throw new Error('Send failed');
  // show the success message here
});
```

Show the confirmation only when the service answers OK, and keep the filled-in form on failure so the visitor
can try again.

## Saved data (localStorage)

| Key | Shape | Validation |
|-----|-------|------------|
| `solstice-plan` | Array of artist ids, e.g. `["halcyon-bloom","kemi-sunday"]` | Non-strings, duplicates and unknown ids are dropped and storage is repaired |
| `solstice-cart` | `{ "tickets": { "camping": 2 }, "addons": { "parking": 1 } }` | Unknown ids are dropped, quantities are clamped to 0–`maxPerType`; removed when the cart is empty |

If storage is unavailable (private mode), everything still works for the current page. Visitors can reset
by clearing the plan on the schedule or the site data in their browser; in code, call
`localStorage.removeItem('solstice-plan')`.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `theme-color` in its `<head>`.
`og:image` is `assets/img/og-image.png`; most social sites need an absolute URL, so change it to your
domain on every page:

```html
<meta property="og:image" content="https://www.yourfestival.com/assets/img/og-image.png">
```

Add a `sitemap.xml` listing the pages and a `robots.txt` when you deploy. For richer search results you
can add `schema.org/MusicEvent` or `Festival` structured data (name, dates, location, offers) to
`index.html`.

## Accessibility

- Skip link, landmarks, one `<h1>` per page and a logical heading order.
- Visible focus outlines and WCAG AA color contrast.
- Mobile menu with `aria-expanded`, closed with Esc.
- Filters and toggles use `aria-pressed`; day tabs use the tabs pattern; the artist pop-up is a native
  `<dialog>` that returns focus; counts and totals are announced with `aria-live`.
- The schedule has a list view, each grid column is labeled with its stage, and the site map has a text
  version.
- Reduced motion turns off reveals, the tape, the turning sun and hover lifts.

When editing, keep one `<h1>` per page, give every new field a `<label>`, and keep sun buttons as
`<button>` elements with the `data-plan-toggle` attribute so their labels stay up to date.

## Building and deploying

The compiled CSS is included, so you only need to rebuild after changing `src/input.css` or adding
Tailwind classes that aren't used anywhere yet. With Node.js 24:

```sh
npm install
npm run build    # or: npm run watch
```

Tailwind scans the HTML and JavaScript files for class names, so classes used only in `main.js` strings
work as long as they appear literally in the file.

To publish, upload the folder (without `node_modules/`) to any static host: Netlify Drop, GitHub Pages,
Cloudflare Pages, Vercel or your own server. No server-side code is needed.

## Troubleshooting

- **New Tailwind classes have no effect.** Run `npm run build`; only classes found in the files are
  generated.
- **The lineup or schedule is empty.** `data.js` must load before `main.js`, and must not have a
  syntax error (check the browser console, a missing comma is the usual cause).
- **A set shows in the wrong place.** Check `day`, `stage` (must match a stage `id`) and `HH:MM` times in
  24-hour format.
- **Prices show the full price before the early-bird date.** Check `earlyBirdEnds` (ISO date with a time
  zone) and remove any `?now=` from the URL.
- **The calendar file has the wrong times.** Set `utcOffset` to your festival's offset during the event
  (`-04:00` for Eastern Daylight Time, `-07:00` for Pacific Daylight Time).
- **Saved plans contain removed artists.** They are dropped automatically the next time a page loads.
- **The social preview shows no image.** Use an absolute `og:image` URL and the PNG, not the SVG.

## License

MIT. See `LICENSE.txt` in the download (or the repository license). All SVG artwork in this template is
included under the same license.
