# Lens documentation

## Overview

Lens is an image-led portfolio for wedding, portrait and travel photographers, built for **Ines Morrow
Photography**, a fictional photographer in Monterey, California. It has a full-bleed slideshow home page, filterable galleries
with a masonry layout and a lightbox, photo stories, packages with a live price calculator, a client proofing page
for choosing album favorites and an inquiry form. The 49 "photographs" are original SVG illustrations ready to be
swapped for your own. This is the **HTML + Tailwind CSS v4** version, **1.0.11**: static pages and one vanilla
JavaScript file, no build step needed to run it.

Live demo: [freeframe.dev/templates/lens](https://freeframe.dev/templates/lens)

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Every page works from your computer, including `gallery.html?g=…` links.

To preview it the way a host serves it:

```sh
cd lens
python3 -m http.server 8000   # then open http://localhost:8000
```

**Node.js 24** is only needed to rebuild the CSS after changing styles (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable features |
| --- | --- | --- |
| `index.html` | Home | Full-bleed slideshow (`data-hero`) with captions, dots and pause, introduction and stats, recent work, testimonials, availability call to action |
| `portfolio.html` | All galleries | Category filter with counts, shareable as `portfolio.html#weddings` |
| `gallery.html` | One gallery | Masonry grid and lightbox; the gallery is chosen with `gallery.html?g=<slug>`; previous/next gallery links |
| `stories.html` | Journal list | Story cards |
| `story.html` | A long-form photo story | Full-width photos with captions, a pull quote and "Keep reading" |
| `packages.html` | Packages and pricing | Package cards that double as the calculator's choice, extra hours, add-ons, total and deposit, FAQ |
| `proofing.html` | Client proofing | Choose up to 15 favorites, saved in `localStorage`; all/selected view, clear and send |
| `contact.html` | Inquiry form | Conditional date rule, package prefill from `?package=` |
| `404.html` | Page not found | Links back home and to the portfolio |

## Project structure

```text
lens/
├── index.html … 404.html     the nine pages (header and footer repeated in each)
├── assets/
│   ├── css/style.css         compiled Tailwind CSS (do not edit; rebuild from src/input.css)
│   ├── js/main.js            the LENS data object and every script
│   └── img/
│       ├── photos/           49 SVG photo stand-ins, named <gallery-slug>-NN.svg
│       ├── favicon.svg       favicon
│       ├── og-image.svg      source of the social image
│       └── og-image.png      social sharing image, 1200×630
├── src/input.css             Tailwind entry: @theme tokens and component classes
├── package.json              Tailwind CLI scripts (build, watch)
└── template.json             template metadata and version
```

## Customizing

### Brand and colors

Design tokens are in the `@theme` block of `src/input.css`:

| Token | Default | Used for |
| --- | --- | --- |
| `--color-paper` | `#f5f2ec` | Page background |
| `--color-paper-2` | `#ebe6dd` | Sunken panels, image placeholders |
| `--color-ink` | `#171512` | Text, dark sections, solid buttons |
| `--color-ink-2` | `#24211d` | Raised dark surfaces |
| `--color-muted` | `#5e574f` | Secondary text on paper |
| `--color-mist` | `#b9b1a6` | Secondary text on ink |
| `--color-line` | `#dcd5ca` | Hairlines |
| `--color-rust` | `#94492a` | Accent on paper (links, focus, selected proofs) |
| `--color-sand` | `#e8c9a7` | Accent on ink |

Change the accent, then rebuild the CSS:

```css
@theme {
  --color-rust: #2f5d50;
  --color-sand: #c8ddd3;
}
```

Also update `<meta name="theme-color">` in each page if you change `--color-paper`. Dark sections use the
`.on-dark` class, which switches focus outlines to sand.

### Typography

Bodoni Moda (headings, `--font-display`) and Hanken Grotesk (body, `--font-sans`) load from Google Fonts with a
`<link>` in every page's `<head>`. To swap, change that link on every page and the font names in `@theme`:

```css
--font-display: "Cormorant Garamond", ui-serif, Georgia, serif;
```

### Content

Copy on most pages is in the HTML. Everything the scripts render or calculate is in the `LENS` object at the top
of `assets/js/main.js`:

| Key | Shape | Used by |
| --- | --- | --- |
| `galleries` | `{ slug, title, category, location, date, summary, photos: { id, w, h, caption, alt }[] }` | `gallery.html` and its lightbox |
| `packages` | `{ <id>: { name, price, hours, kind } }` (`kind` is `"Wedding"` or `"Portrait"`) | Calculator, contact prefill |
| `included` | `{ <package id>: [addon values] }` | Add-ons a package already includes |
| `extraHour` | `350` | Price per extra hour |
| `deposit` | `0.3` | Deposit share of the total |
| `proofLimit` | `15` | Maximum proofing selections |
| `proofIds` | photo ids | Ids accepted on the proofing page |

**Add a gallery:**

1. Add an object to `LENS.galleries` with a new `slug` and its photos. Each photo `id` is the file name in
   `assets/img/photos/` without `.svg`; `w` and `h` are its pixel size (they set the aspect ratio and prevent layout
   shift).

```js
{
  "slug": "monterey-portraits",
  "title": "Monterey Portraits",
  "category": "Portraits",
  "location": "Monterey, California",
  "date": "May 2026",
  "summary": "Street portraits on Cannery Row on a bright spring morning.",
  "photos": [
    { "id": "monterey-portraits-01", "w": 960, "h": 1200, "caption": "Ana, painter.", "alt": "A woman in a doorway lit by morning sun" }
  ]
}
```

2. Add a card to `portfolio.html` (copy an `<article data-category="portraits">`, link it to
   `gallery.html?g=monterey-portraits`) and update the counts in the filter buttons. The `data-category` value must
   match a `data-filter` button (`weddings`, `portraits` or `travel`).

`gallery.html` contains the first gallery as plain HTML, so crawlers see real content;
other galleries replace it when the page loads. If you change the first gallery in `LENS`, update that HTML too.

**Packages:** the cards and the add-on list are in `packages.html`; each add-on is
`<input type="checkbox" name="addon" value="album" data-price="850">` with a `data-addon-note="album"` line.
Prices in the calculation come from `LENS.packages` and the add-ons' `data-price`, but the prices shown on the
cards, the "($350 each)" label, "Deposit to book (30%)" and the package options in `contact.html` are text, so
update them together.

**Stories:** `stories.html` lists the cards and `story.html` is the one story layout. Every card links to
`story.html`; copy `story.html` for each new story and update the links.

### Images and artwork

- **Photos:** the SVGs in `assets/img/photos/` are illustrations, not photographs. Replace them with your own JPEG
  or WebP images (about 2000px on the long edge). The scripts build the path as
  `'assets/img/photos/' + p.id + '.svg'` in three places in `main.js` (gallery grid, lightbox image, preloading);
  change `.svg` there if you switch format, and update the `<img>` tags in the HTML pages.
- **Aspect ratios:** galleries keep each photo's own ratio (masonry). Cards use fixed frames: portfolio cards
  `aspect-[4/3]`, the large home card `aspect-[4/5]`, square tiles `aspect-square`; photos are cropped with
  `object-cover`. The hero slides fill the screen, so use landscape images with the subject away from the bottom
  left, where the headline sits.
- **Alt text:** write a real `alt` for every photograph, and `alt=""` only for decorative backgrounds.
- **Social image:** `assets/img/og-image.png` (1200×630) comes from `assets/img/og-image.svg`; edit the SVG and
  export a new PNG.
- **Favicon:** `assets/img/favicon.svg`.

### Navigation, header and footer

The header, mobile menu (`#mobile-menu`) and footer are repeated in every HTML file. To add a page, copy one (for
example `stories.html`), update its `<title>`, description and Open Graph tags, then add the link to the desktop
nav, the mobile menu and the footer "Explore" list in every page. Mark the current page's nav link with
`aria-current="page"` (it draws the underline).

On the home page the header has `data-overlay`: it sits transparently over the slideshow and turns solid once you
scroll. Remove the attribute to make it solid from the start.

The years in "Now booking 2027 weddings" (the menu), "Now booking 2027" (the footer), "A few 2027 dates are
still open" (home) and "2027 availability" (contact) are `<span data-year-ahead="1">` and show next year; the footer
copyright is `<span data-year>` and shows this year. `assets/js/main.js` fills them in from today's date, so the demo
never advertises a season that has passed; the numbers in the HTML are shown without JavaScript. To show fixed years,
replace the spans with plain text.

## Features

### Hero slideshow

`index.html` (`data-hero`) and the "Home hero slideshow" block in `main.js`. Each slide is a
`<figure class="hero-slide" data-slide data-caption="…">`; slides crossfade every 6.5 seconds, the caption
(`data-hero-caption`) follows the active slide, the dots (`data-dot`, `aria-current`) jump to
a slide and `data-hero-toggle` pauses or plays. Inactive slides are `aria-hidden`. With reduced motion the
slideshow starts paused. The caption is only announced to screen readers when the visitor picks a slide with a dot:
`show(n, announce)` sets `aria-live` to `polite` for those changes and `off` while autoplaying, so the slideshow
doesn't interrupt every 6.5 seconds. Change the interval in `setInterval(…, 6500)`. To add a slide, copy a `<figure>` and add a
matching dot button.

### Portfolio filter

`portfolio.html` and the "Portfolio filter" block. Buttons with `data-filter` (`all`, `weddings`, `portraits`,
`travel`) show cards whose `data-category` matches, set `aria-pressed`, update the polite count
(`data-filter-count`) and show `data-filter-empty` when nothing matches. The choice is written to the URL hash, so
`portfolio.html#travel` opens filtered. To add a category, add a button and use its value on the cards.

### Gallery pages

`gallery.html` and the "Gallery page" block. The script reads `?g=<slug>`, finds the gallery in `LENS.galleries`
(falling back to the first one), fills the heading, summary and details (`data-g-title`, `data-g-category`,
`data-g-summary`, `data-g-location`, `data-g-date`, `data-g-count`), updates the page title and description,
renders the photos into `.masonry` (`data-gallery`) with `loading="lazy"`, and points the previous/next links
(`data-g-prev`, `data-g-next`) at the neighboring galleries. The masonry is CSS columns: 1, 2 and 3 columns at the
`sm` and `lg` breakpoints (`.masonry` in `src/input.css`).

### Lightbox

A native `<dialog class="lightbox" data-lightbox>` in `gallery.html`. Clicking a photo (`data-lightbox-open`)
opens it with `showModal()`, so focus is trapped and Escape closes it; focus starts on Close and returns to the
photo afterwards. Left/Right arrows, the previous/next buttons and a 50px swipe (touch and pen) move through the
photos, wrapping around; the counter (`data-lb-counter`) is a live region; clicking the dark area around the photo
closes it. The next photo is preloaded.

### Package calculator

`packages.html` (`<form data-calculator>`) and the "Package calculator" block. Choosing a package card (a radio
`name="package"`) sets the base price and hours; the − / + buttons (`data-hours-step`) add 0–6 extra hours
(`MAX_EXTRA`) at `LENS.extraHour`; checked add-ons add their `data-price`. Add-ons in `LENS.included[package]` are
checked, disabled and labeled "Included in …", and aren't charged. The summary, total (`data-calc-total`, live
region) and deposit (`total × LENS.deposit`) update on every change. **Inquire with this estimate**
(`data-calc-enquire`) links to `contact.html?package=…&hours=…&addons=…`.

To change prices, edit `LENS.packages`, `LENS.extraHour`, `LENS.deposit` and the add-ons' `data-price`, and the
matching visible text.

### Client proofing

`proofing.html` and the "Client proofing" block. Each photo is a `<figure class="proof-card" data-proof="<id>">`
with a heart button (`data-proof-toggle`, `aria-pressed`). Up to `LENS.proofLimit` photos can be chosen; trying to
add more shows a message in `data-proof-message` (a status region). The sticky bar shows the count, a progress bar
and "N left", and has **All / Selected** view buttons (`data-proof-view`), **Clear** and **Send selection**, which
shows a confirmation (`data-proof-done`) with a short reference in `data-proof-ref` (`IM-` and four characters, made
in the browser by `makeRef()`) and moves focus to it. The confirmation promises a first album layout within three
weeks; change it to match how you work. Changing the selection afterwards (here or in another
tab) hides the confirmation again, since it no longer matches. Choices are saved in `localStorage` (see
[Saved data](#saved-data-localstorage)) and stay in sync across tabs through the `storage` event.

To use your own shortlist, change the `<figure>` cards in `proofing.html` and list the same ids in
`LENS.proofIds`; ids that aren't in `proofIds` are dropped when the selection is read. The "of 15" and "All 24"
labels are text in the HTML; update them if you change `proofLimit` or the number of photos.

### Scroll reveals

Elements with `.reveal` fade up when they enter the viewport (`.js .reveal` and `.is-in` in `src/input.css`). The
hidden starting state only applies once a tiny script in each page's `<head>` adds the `js` class to `<html>`, so
content is always visible with JavaScript turned off. Keep that script on new pages. When one
reveals, every `.reveal` before it does too, so jumping down the page never leaves hidden content. With reduced
motion, or without `IntersectionObserver`, everything is shown immediately.

### Back-to-top button

The block at the end of `main.js` adds a square button after you scroll about one screen. It scrolls to the top
(instantly with reduced motion) and moves focus to `#main`. Mark your own fixed UI with `data-back-to-top-avoid`
(the button lifts above it) or `data-back-to-top-hide` (it hides while overlapping). Restyle it with the
`.back-to-top` rules in `src/input.css`; to remove it, delete that block and those styles.

## Forms

**The inquiry form doesn't send anything until you connect it.** `contact.html` has
`<form data-enquiry novalidate>`, validated by the "Inquiry form" block in `main.js`:

| Field | Rule |
| --- | --- |
| `c-name` (`name`) | Required |
| `c-email` (`email`) | Required, valid email |
| `c-type` (`type`) | Required (wedding, elopement, portrait, travel, other) |
| `c-date` (`date`) | Required for weddings and elopements; must not be in the past (`min` is today) |
| `c-location` (`location`) | Optional |
| `c-budget` (`budget`) | Required |
| `c-package` (`package`) | Optional; preselected from `?package=` (and the occasion set to wedding or portrait) |
| `c-message` (`message`) | Required, at least 20 characters |

Errors appear under each field (`aria-invalid`, `aria-describedby`) on submit and when leaving a filled field; the
first invalid field gets focus. On success the `data-success` box is shown and focused, with a short reference in its
`data-ref` element (`IM-` and four characters, made in the browser by `makeRef()`; show your form service's own
reference instead if it returns one). It promises a reply within two business days, like the intro on the page: change
both if yours differs. **Send another inquiry** (`data-reset`) clears the form.

To receive inquiries with Formspree, replace the comment in the submit handler (after the `if (!ok)` line) with:

```js
fetch('https://formspree.io/f/your-form-id', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (!res.ok) throw new Error('Send failed');
  var success = $('[data-success]', form);
  $('[data-ref]', success).textContent = makeRef('IM');
  success.classList.remove('hidden');
  success.focus();
}).catch(function () {
  alert('Sorry, your inquiry could not be sent. Please email the studio.');
});
```

and remove the four success lines that follow. Every field
already has a `name`. The calculator's `hours` and `addons` URL parameters aren't read by the form; if you want them
in the inquiry, read them from `params` and add hidden inputs.

The proofing page's **Send selection** only shows a confirmation. To send the choice to the studio, `fetch` the
`selected` array (photo ids) to your endpoint in the `[data-proof-submit]` click handler.

## Saved data (localStorage)

| Key | Shape | Validation |
| --- | --- | --- |
| `lens-proofing-v1` | JSON array of photo ids, for example `["catalina-vows-01","fieldwork-03"]` | On every read: anything that isn't an array is ignored; only strings in `LENS.proofIds` are kept, without duplicates, up to `LENS.proofLimit`. If the cleaned list differs, it's written back. |

Reads and writes are wrapped in `try`/`catch`, so blocked or full storage still works for the visit. The **Clear**
button empties the selection; to remove the key entirely, delete it in the browser's developer tools (Application →
Local Storage). Change the key name (for example to `lens-proofing-v2`) to start everyone fresh after replacing the
shortlist.

## SEO and sharing

- Each page has its own `<title>`, meta description, Open Graph tags (`og:type`, `og:site_name`, `og:title`,
  `og:description`, `og:image`), a `summary_large_image` Twitter card and `theme-color`. On `gallery.html` the
  script also updates the title and description for the chosen gallery; Open Graph tags stay those of the first
  gallery, because crawlers don't run JavaScript.
- `og:image` is the relative path `assets/img/og-image.png`. Social networks need an absolute URL, so change it on
  every page when you deploy:

```html
<meta property="og:image" content="https://your-domain.com/assets/img/og-image.png">
```

- Add `sitemap.xml` (list each `gallery.html?g=<slug>` URL too) and `robots.txt` at the site root. For local SEO,
  consider `LocalBusiness` or `ProfessionalService` structured data with the studio address.

## Accessibility

Built in:

- Skip link, landmarks, one `h1` per page and `aria-current="page"` on the current nav link.
- Visible focus outlines (rust on paper, sand on dark sections) and AA contrast.
- Mobile menu with `aria-expanded` and `aria-controls`; focus moves into it, Escape closes it and returns focus.
- Slideshow with a pause button, labeled dots and hidden inactive slides; it starts paused with reduced motion.
- Lightbox on native `<dialog>` (focus trap, Escape, focus return), labeled buttons and a live counter.
- Filter, view and proofing buttons use `aria-pressed`; counts, totals and messages are live regions.
- Form errors linked with `aria-describedby`; the date hint stays linked.
- Reduced motion turns off reveals, crossfade zooms and smooth scrolling.

When editing, write meaningful alt text for every photo, keep one `h1` per page and label every new form field.

## Building and deploying

The compiled `assets/css/style.css` is included. Rebuild only after changing `src/input.css` or adding Tailwind
classes that aren't used yet:

```sh
npm install
npm run build    # one-off build
npm run watch    # rebuild while you work
```

Deploy by uploading the folder to any static host: Netlify Drop (drag the folder onto `app.netlify.com/drop`),
GitHub Pages or Cloudflare Pages. No build command is needed; `src/`, `package.json` and the Markdown files can be
left out. Most hosts serve `404.html` for missing pages automatically.

## Troubleshooting

- **A Tailwind class I added does nothing.** Rebuild the CSS with `npm run build`.
- **`gallery.html?g=my-slug` shows the first gallery.** The slug isn't in `LENS.galleries`; check the spelling in
  both the link and the data.
- **Photos are missing after switching to JPEG.** Change `.svg` to `.jpg` in the three paths in `main.js` and in
  the HTML `<img>` tags.
- **Some proofing choices disappear on reload.** Only ids listed in `LENS.proofIds` are kept; add the new ids
  there.
- **A new add-on doesn't change the total.** It needs `name="addon"`, a `data-price` and a matching
  `data-addon-note` element inside the calculator form.
- **The portfolio filter hides a new card.** Its `data-category` must match a `data-filter` button value.
- **Sections stay invisible on a new page.** Copy the `<script>document.documentElement.classList.add('js');</script>`
  line from another page's `<head>` (before the stylesheet) and make sure `assets/js/main.js` is loaded at the end of
  `<body>`.
- **Shared links show no image.** Use an absolute URL for `og:image`.

## License

MIT, like every Freeframe template: free for personal and commercial projects, no attribution required. The SVG
photo stand-ins and the social image are included under the same license. See `LICENSE.txt` in the download. The
photographer, clients and places in the copy are fictional.
