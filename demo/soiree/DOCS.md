# Soiree documentation

## Overview

Soiree is an editorial, magazine-style website for wedding and event planners. The demo brand is Ivy & Ash
Events, a fictional planning studio at 112 Church Street in Charleston, South Carolina, that offers full
planning, partial planning and day-of coordination for weddings, corporate events and private parties. It is
built with HTML5, Tailwind CSS v4 and vanilla JavaScript (no frameworks, no dependencies), uses US spelling and
US dollars, and works out of time zone `America/New_York`. This guide covers version 1.0.5. Live demo:
[freeframe.dev/templates/soiree](https://freeframe.dev/templates/soiree).

## Quick start

1. Unzip the download and open `index.html` in a browser. Everything works from the file system.
2. To preview it the way a web host serves it, run a local server in the folder:

   ```sh
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

3. You only need Node.js 24 if you change Tailwind classes and want to rebuild `assets/css/style.css`
   (see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Magazine-cover hero with line-art "plate", "In this issue" contents, press names, founder's letter with studio numbers, the three packages, a pull quote, recent celebrations, process summary, estimator call to action, journal links |
| `services.html` | Services & packages | One section per package (`#full`, `#partial`, `#dayof`), comparison table (`#compare`), corporate and private events, add-on prices, FAQ (`<details>`) |
| `estimator.html` | Budget estimator | Event type, guest count slider and number field, season, package, add-ons; live fee range, whole-celebration range, per-guest figure and spending breakdown; "Send this with an inquiry" link |
| `portfolio.html` | Portfolio | Filter by type, eight case studies rendered from data, case-study dialog with previous/next, client quotes |
| `process.html` | Process | Seven planning steps with timing and a "Where would you start?" date checker |
| `venues.html` | Venue guide | Ten venues rendered from data; filter by area, setting and guest count; sort; save a shortlist; "shortlist only" toggle |
| `journal.html` | Journal | Feature article on costs, notes on rain plans, Thursday weddings and tipping (with a table), press and kind words |
| `inquire.html` | Inquiry form | Prefilled from the estimator or a case study, saved venues as checkboxes, validation with an error summary, confirmation with a reference |
| `404.html` | Not found | Friendly message and links to every page |

## Project structure

```text
soiree/
  index.html, services.html, estimator.html, portfolio.html,
  process.html, venues.html, journal.html, inquire.html, 404.html
  assets/
    css/style.css        compiled Tailwind CSS (generated; do not edit by hand)
    js/data.js           content and prices: packages, seasons, add-ons, venues, celebrations
    js/main.js           all behavior: menu, reveals, estimator, portfolio, venues, process, inquiry form
    img/favicon.svg      the "&" monogram favicon
    img/og-image.svg     source of the social sharing image
    img/og-image.png     the social sharing image (1200x630) used by og:image
    img/hero-piazza.svg  home page illustration (480x600)
    img/art-*.svg        line-art illustrations (400x500) for celebrations, venues and packages
  src/input.css          Tailwind source: @theme tokens and the small component layer
  package.json           scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
  LICENSE.txt            MIT license (in the download)
```

## Customizing

### Brand and colors

All design tokens live in the `@theme` block of `src/input.css`:

| Token | Value | Used for |
|-------|-------|----------|
| `--color-ink` | `#16130f` | Text, rules, dark sections, buttons |
| `--color-cream` | `#f4ede1` | Page background |
| `--color-paper` | `#fbf7ef` | Cards, form fields, alternate sections |
| `--color-bone` / `--color-rule` | `#ebe2d3` / `#cdbfa8` | Fine rules and dividers |
| `--color-muted` | `#5f574d` | Secondary text |
| `--color-blush` / `--color-blush-soft` | `#e8cfc3` / `#f3e3db` | The accent surfaces |
| `--color-rose` / `--color-rose-deep` | `#8f4c3e` / `#763c30` | Accent text, italics, focus rings, bars |
| `--color-gold` / `--color-champagne` | `#a88654` / `#d9c39a` | Line-art details, accents on ink |

Each token becomes Tailwind utilities (`bg-ink`, `text-rose`, `border-rule`...). To change the accent, edit
the rose and blush tokens and rebuild:

```css
@theme {
  --color-rose: #2f5d50;      /* deep green instead of rose */
  --color-rose-deep: #244a40;
  --color-blush: #cfe0d6;
  --color-blush-soft: #e4eee8;
}
```

Keep `--color-rose` dark enough for text on cream (at least 4.5:1). The illustrations in `assets/img/` have
their colors written into the SVG files; search and replace `#8f4c3e`, `#a88654` and `#f3e3db` there too.

### Typography

Two Google Fonts are loaded in the `<head>` of every page: **Playfair Display** (display serif, with
italics) and **Mulish** (body text). The families are set in `src/input.css`:

```css
--font-sans: "Mulish", ui-sans-serif, system-ui, ...;
--font-display: "Playfair Display", "Didot", "Bodoni 72", Georgia, "Times New Roman", serif;
```

To swap a font, change the Google Fonts `<link>` in each HTML file and the matching token, then rebuild the
CSS. Headings use the `display`, `headline`, `pull-quote` and `font-display` classes; small uppercase labels
use `kicker` and `smallcaps`.

### Content

Page text lives in the HTML files. Data that the scripts render or calculate with lives in
`assets/js/data.js`, on the `window.SOIREE` object:

| Name | Shape | Used by |
|------|-------|---------|
| `timeZone` | `'America/New_York'` | Date checks on Process and Inquire |
| `packages` | `{ full, partial, dayof }` each `{ name, base, perGuest, blurb }` | Estimator fee |
| `eventTypes` | `{ wedding, corporate, private }` each `{ name, perGuest }` | Estimator vendor spend |
| `seasons` | `{ peak, summer, winter }` each `{ name, months, feeFactor, spendFactor }` | Estimator |
| `addons` | `{ welcome, rehearsal, brunch, transport, design }` each `{ name, price }` | Estimator fee |
| `breakdown` | `[{ name, share }]`, shares adding up to 1 | Estimator breakdown |
| `guestLimits` | `{ min: 20, max: 400, step: 10, initial: 120 }` | Estimator guests |
| `spread` | `{ fee: [0.95, 1.1], spend: [0.85, 1.2] }` | Low and high ends of each range |
| `areas` | `{ downtown, 'mount-pleasant', islands, rural, north }` → label | Venue filter |
| `settings` | `{ indoor, outdoor, both }` → label | Venue labels |
| `venues` | `[{ id, name, area, setting, min, max, priceFrom, art, note }]` | Venue guide, inquiry shortlist |
| `eventTypeLabels` | `{ wedding, corporate, private }` → label | Portfolio filter and labels |
| `celebrations` | `[{ id, title, type, date, venue, guests, pkg, art, headline, summary, story, details, quote, by }]` | Portfolio grid and dialog |

To add a venue, append an object to `venues` (its `art` is the middle of an `assets/img/art-*.svg` file name):

```js
{ id: 'magnolia-hall', name: 'Magnolia Hall', area: 'downtown', setting: 'indoor', min: 40, max: 180,
  priceFrom: 7200, art: 'loft', note: 'A restored 1890s meeting hall with a sprung dance floor.' }
```

Use a new, URL-safe `id`, an `area` that exists in `areas` and a `setting` that exists in `settings`. If you
add an area, also add an `<option>` to the Area select in `venues.html`. Celebrations work the same way; their
`type` must be a key of `eventTypeLabels`. Package prices are also written in the HTML (home, services and
estimator pages and the comparison table): update both when you change `packages`.

### Images and artwork

All artwork is SVG line art drawn for this template: `hero-piazza.svg` (480x600) on the home page and eight
`art-*.svg` files (400x500, a 4:5 ratio) for celebrations, venues and packages. To use photos instead,
keep a similar ratio (4:5 portrait) and point the `<img>` tags or the `art` values at your files; frames
crop with `object-fit: cover`. Decorative images have `alt=""`; give real photos meaningful alt text.

The social image is `assets/img/og-image.png` (1200x630), generated from `og-image.svg`. The favicon is
`assets/img/favicon.svg`.

### Navigation, header and footer

The header and footer are repeated in every HTML file. The desktop header has two lists (`aria-label="Main"`
on the left and `aria-label="Secondary"` on the right of the centered logo), an "Inquire" button and a
full-screen mobile menu (`#mobile-menu`) with numbered links. To add a page, copy an existing page, change
its `<title>`, description and Open Graph tags, and add the link to both header lists or the mobile menu and
footer list in every file. Mark the current page with `aria-current="page"`.

The years in the top bar ("Now booking 2027 & 2028") and the footer copyright are filled in by
`assets/js/main.js` from today's date in Charleston: `<span data-year>` shows this year and
`<span data-year-ahead="1">` / `data-year-ahead="2"` show next year and the year after, so the demo never
advertises a season that has passed. The numbers written in the HTML are what visitors see without
JavaScript. To show fixed years, replace the spans with plain text.

## Features

### Budget estimator

`estimator.html`, code under "Budget estimator" in `assets/js/main.js`. The visitor picks an event type,
guest count, season, package and add-ons; the panel updates at once.

- Planning fee = (`base` + `perGuest` x guests above 50) x season `feeFactor` + add-on prices. The range is
  the fee times `spread.fee`, rounded to $100.
- Vendor spend = guests x event type `perGuest` x season `spendFactor`. The whole-celebration range is spend
  times `spread.spend` plus the fee range, rounded to $500. The per-guest figure is the midpoint divided by
  guests, rounded to $10.
- The breakdown multiplies the spend range by each `breakdown` share.
- "Full design and styling" is part of full planning, so it is checked and disabled for that package.
- With the defaults (wedding, 120 guests, spring or fall, full planning, no add-ons) it shows $18,100 – $20,900
  for the fee and $50,500 – $67,000 for the whole celebration, about $490 per guest.
- `?package=full|partial|dayof` (used by the Services page) selects a package. Choices are saved under
  `soiree-estimate`. "Start over" restores the defaults and clears the saved value.
- "Send this with an inquiry" links to `inquire.html?package=…&guests=…&type=…`.
- `window.SOIREE_ESTIMATE(state)` returns the calculation, for testing or reuse.

Every figure is labeled as an estimate only, not a quote. Accessibility: native radio buttons and checkboxes in
fieldsets with legends; the slider and number field are labeled; a polite live region announces the new
ranges half a second after the last change.

### Portfolio filter and case studies

`portfolio.html`, code under "Portfolio" in `main.js`. Cards are rendered from `celebrations` in a staggered
seven/five column grid. The filter buttons (`data-filter`) use `aria-pressed`, show counts and update a
polite status ("Showing 2 celebrations"). The filter is kept in the URL as `?type=wedding|corporate|private`.

Each card title is a button that opens a native `<dialog>` with the full story. `?case=<id>` opens a story
directly (if it's hidden by the filter, the filter resets to All). In the dialog, previous/next buttons and the
Left/Right arrow keys move through the visible stories, Esc or a click on the backdrop closes it, and focus
returns to the story's card. "Plan something like this" links to `inquire.html?type=<type>`.

### Venue guide and shortlist

`venues.html`, code under "Venue guide" in `main.js`. Filters: Area (`?area=` in the URL), Setting, Guests
(venues whose minimum and maximum include the number) and Sort (name ignoring a leading "The", lowest price,
largest capacity). "Shortlist only" (`aria-pressed`) shows saved venues. Each "Save" button is a toggle with
`aria-pressed` and a toast confirms the change. When nothing matches, an empty state offers "Clear filters".
The shortlist is saved under `soiree-shortlist` and appears on the inquiry form.

### Where would you start?

`process.html`, code under "Process" in `main.js`. The visitor enters an event date; the script works out the
whole months between today in Charleston (`America/New_York`) and that date, then marks the first step whose
`data-from` (months ahead) is at or below it with "Start here" (`is-current`), dims earlier steps (`is-past`)
and explains the result ("Your date is 14 months away: perfect timing."). Dates must be after today and
within three years. Change the thresholds with the `data-from` attributes on each `<li class="step">`.

### Header, reveals and back to top

The mobile menu button uses `aria-expanded` and `aria-controls`, Esc closes the menu and returns focus, and
it closes when the screen grows to desktop width. Elements with `reveal` fade in on scroll
(IntersectionObserver), and everything shows at once with reduced motion. The back-to-top button is created by
the last block of `main.js` and styled by the `.back-to-top` rules in `src/input.css`; delete both to remove it.

## Forms

### Inquiry form

`inquire.html`, code under "Inquiry form" in `main.js`. It validates when submitted, then live as the
visitor corrects fields:

| Field | Rule |
|-------|------|
| Your name | Required |
| Email | Required, `name@domain.tld` shape |
| Phone | Optional; if filled, at least 10 digits |
| Type of event | Required (wedding, corporate or private) |
| Event date | A real date after today and within three years, in Charleston time; may be empty if "Our date is flexible" is checked |
| Guest count | Required whole number from 10 to 500 |
| Overall budget | Required band |
| Message | At least 20 characters (2,000 maximum, with a counter) |

Errors appear under each field (`aria-invalid` and `aria-describedby`) and in an error summary that takes
focus and links to each field. The form reads `?package=`, `?guests=` and `?type=` from the URL (validated
against the data), shows a note when it came from the estimator, and lists shortlisted venues as checked
checkboxes. On success it shows a reference (`IA-` and four characters, made in the browser by `makeRef()`),
the reply promise from the "What happens next" list and a summary of the inquiry.

### Connecting a real backend

The form doesn't send anything until you connect it, although its confirmation reads as if it had. With a
service such as Formspree, add the endpoint to the form in `inquire.html`:

```html
<form class="grid gap-9" data-inquiry-form action="https://formspree.io/f/your-id" method="POST" novalidate>
```

Then, in `main.js`, find the comment "Connect your form here" and send the data before showing the success
block:

```js
fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  .then(function (res) { if (!res.ok) throw new Error('Send failed'); /* show the success block */ })
  .catch(function () { /* show an error message and keep the form */ });
```

The date checker on the Process page is not a form submission and sends nothing.

## Saved data (localStorage)

| Key | Shape | Validation on read | Reset |
|-----|-------|--------------------|-------|
| `soiree-estimate` | `{ type, guests, season, pkg, addons: [] }` | Each value checked with an own-key lookup against `eventTypes`, `seasons`, `packages` and `addons`; guests rounded and clamped to 20–400; duplicate or unknown add-ons dropped; invalid JSON removed | "Start over" on the estimator |
| `soiree-shortlist` | `["venue-id", ...]` | Must be an array; unknown or duplicate ids are dropped and the cleaned list saved back | Unsave venues, or `localStorage.removeItem('soiree-shortlist')` |

All storage goes through one `safeStorage` object in `main.js`. When the browser blocks localStorage (a
sandboxed iframe or strict privacy settings), it uses an in-memory stand-in, so the estimator and shortlist
still work for the rest of the page view.

## SEO and sharing

Each page has its own `<title>`, meta description, `theme-color`, Open Graph tags (`og:title`,
`og:description`, `og:image`) and a Twitter card in its `<head>`. Social sites need an absolute image URL,
so after deploying, change `content="assets/img/og-image.png"` to your full address, for example
`https://ivyandash.example/assets/img/og-image.png`. Add a `sitemap.xml` listing the eight content pages and a
`robots.txt`, and consider `LocalBusiness` structured data (JSON-LD) with your address and phone number. Set
your host to serve `404.html` for missing pages.

## Accessibility

- Skip link, landmarks (`header`, labeled `nav`s, `main`, `footer`), one `<h1>` per page and a logical heading
  order.
- Visible focus rings (rose on light, champagne on ink), AA contrast for text, and a light color scheme only.
- Toggle buttons use `aria-pressed`; the menu uses `aria-expanded`; status text uses polite live regions; the
  case study uses a native modal `<dialog>` with focus return.
- Form fields have labels, hints and errors linked with `aria-describedby`; radio groups are fieldsets.
- Scroll reveals, dialog animation and smooth scrolling are off with `prefers-reduced-motion`.
- The comparison and tipping tables scroll inside a labeled, focusable region on small screens.

When editing, keep one `<h1>` per page, label every new input, and keep every `aria-controls`,
`aria-labelledby` and `aria-describedby` pointing at an id that exists.

## Building and deploying

The compiled CSS is included, so you can upload the folder as it is. If you add Tailwind classes, rebuild:

```sh
npm install
npm run build    # one-off, minified
npm run watch    # rebuild on every change while editing
```

Classes written only in JavaScript strings (in `main.js`) are picked up because the build scans that file;
keep them as whole class names. Deploy by uploading the folder to any static host: Netlify Drop, GitHub
Pages, Cloudflare Pages, Vercel or plain shared hosting. No server code is needed.

## Troubleshooting

- **New Tailwind classes have no effect.** Run `npm run build` in the template folder (not a parent folder),
  so the CSS build scans these files.
- **The estimator keeps old choices.** They're saved under `soiree-estimate`; press "Start over" or clear the
  site's storage.
- **A shortlisted venue disappeared after editing `data.js`.** Saved ids that no longer exist in `venues`
  are dropped. Keep ids stable when renaming venues.
- **A date is rejected as "after today" near midnight.** Dates use Charleston time (`America/New_York`).
  Change `timeZone` in `data.js` if your business is elsewhere.
- **The inquiry form says it's done but no email arrives.** It sends nothing until connected; follow
  [Connecting a real backend](#connecting-a-real-backend).
- **Shared links show no image.** Use an absolute URL for `og:image` and check the PNG is uploaded.
- **Portfolio or venue lists are empty.** They are rendered by JavaScript from `data.js`; check the browser
  console for a syntax error after editing the data.

## License

MIT. The code and all included artwork are free for personal and commercial use; see `LICENSE.txt`.

The fonts Playfair Display and Mulish are licensed under the SIL Open Font License.

Ivy & Ash Events, its people, clients, venues and publications are fictional placeholders.
