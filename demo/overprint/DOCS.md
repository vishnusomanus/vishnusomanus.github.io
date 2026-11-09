# Overprint documentation

## Overview

Overprint is a multi-page portfolio website for an independent illustrator, styled like a risograph print.
The demo is built for Pomelo Press, the fictional studio of illustrator Pipa Valdespino on Frankfort Ave in
Louisville, Kentucky, who draws editorial illustration, picture books, packaging and posters and prints much
of it herself. It is plain HTML5, Tailwind CSS v4 and vanilla JavaScript with no dependencies: twelve
projects with case studies, a shop with a cart and checkout, a four-step commission inquiry with a fee
estimate and timeline, an about page with fairs and events, and a contact form. This guide covers version
1.0.4 (see `template.json` and [CHANGELOG.md](CHANGELOG.md)). The template page, with a link to the live
demo, is at https://freeframe.dev/templates/overprint.

US spelling, US dollars and US Eastern time (`America/Kentucky/Louisville`) are used throughout.

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Everything works from the file system: links are relative and there is
   no build step.
3. To preview it as it will be served, run any static server in the folder, for example `npx serve .` or
   `python3 -m http.server`, and open the address it prints.

You only need Node.js 24 if you change `src/input.css` or add Tailwind classes that aren't already used
(see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Misregistered headline, booking month, next fair, two overlapping prints and a spinning sticker, client list, four featured projects, what I do with live counts, how a commission runs with the earliest start date, a client quote, four shop items, the sticker sheet newsletter sign-up |
| `work.html` | Portfolio (`?type=`) | Filter chips with counts, live result count, twelve project cards, a commission link that follows the filter |
| `project.html` | Case study (`?project=`) | Title, client, kind, year and inks; Sketch, Plates and Final print tabs; ink toggles; brief; deliverables; three process notes; result; client quote; more of the same kind; previous and next |
| `shop.html` | Shop (`?filter=`, `#<product id>`) | Filter chips, twelve products with sizes, editions and stock, add to cart, next mail day, questions |
| `checkout.html` | Checkout | Cart lines with steppers, delivery options, address, test card payment, totals with shipping and tax, order confirmation |
| `commissions.html` | Commission inquiry (`?type=`) | Four steps with a progress bar, live fee range and dated timeline, budget check, rush and too-soon warnings, terms |
| `about.html` | About and events | Riso portrait, biography, four-step process, tools, studio facts with the local time and next open studio, upcoming fairs and events |
| `contact.html` | Contact (`?topic=`) | Contact form with an order-number field for shop questions, studio details, live local time and open/closed line, an illustrated map |
| `404.html` | Not found | A misregistered 404 and links back |

## Project structure

```text
overprint/
  index.html, work.html, project.html, shop.html, checkout.html,
  commissions.html, about.html, contact.html, 404.html
  assets/
    css/style.css        compiled Tailwind CSS (generated, do not edit by hand)
    js/data.js           the content: studio, commission prices, projects, products, shipping, events, clients
    js/main.js           every script: dates, theme, artwork, cart, pages, forms, back to top
    img/favicon.svg      browser tab icon
    img/og-image.svg     social sharing image source (1200 x 630)
    img/og-image.png     social sharing image used by og:image
  src/input.css          Tailwind source: design tokens, dark paper, components
  package.json           scripts to rebuild the CSS
  README.md              short introduction
  DOCS.md                this guide
  CHANGELOG.md           version history
  LICENSE.txt            license (added to the download)
```

## Customizing

### Brand and colors

The design tokens are in the `@theme` block of `src/input.css`. The ones that matter:

| Token | Light | Use |
|-------|-------|-----|
| `--color-paper` | `#f7f0e1` | page background (cream stock) |
| `--color-paper-2` | `#efe4cc` | sunken bands |
| `--color-card` | `#fffaf0` | cards, inputs, the paper inside artwork |
| `--color-ink` | `#24202e` | text |
| `--color-muted` | `#5b5468` | secondary text |
| `--color-pink` | `#ff48b0` | fluorescent pink ink |
| `--color-blue` | `#3255a4` | federal blue ink |
| `--color-yellow` | `#ffe23a` | yellow ink |
| `--color-pink-text`, `--color-blue-text` | `#b8146b`, `#2b4a92` | the inks dark enough for text |
| `--color-on-blue`, `--color-on-ink` | | text on blue fills, text on pink and yellow fills |

Dark paper overrides the same tokens under `:root.dark` in the first `@layer base` block. To change an ink,
change it in both places and rebuild the CSS. For example, to print in teal instead of federal blue:

```css
@theme {
  --color-blue: #00838a;
  --color-blue-text: #006a70;
}
```

The artwork reads the ink colors through the `text-pink`, `text-blue` and `text-yellow` classes, so it
follows the tokens automatically.

### Typography

Three Google Fonts are loaded with one `<link>` in the `<head>` of every page:

- **Rammetto One** (`font-display`): headlines, card titles and the wordmark.
- **Quicksand** 500, 600 and 700 (`font-sans`): body text, buttons and forms.
- **Courier Prime** 400 and 700 (`font-mono`): small stamps, prices and edition numbers (`.stamp`).

To swap one, change the family in the Google Fonts URL on every page and the matching `--font-*` token in
`src/input.css`, then rebuild. The `.h-display`, `.h-page`, `.h-section` and `.h-card` classes set the
headline sizes.

### Content

Everything that lists, filters or calculates lives in `assets/js/data.js`, in one object
`window.OVERPRINT`:

| Constant | What it holds |
|----------|---------------|
| `STUDIO` | name, address, phones, emails, `timeZone`, `startLeadDays` (14), `replyWorkingDays` (2), `mailDays` (Tuesday and Friday), `openStudio` (first Saturday, 11am to 4pm), `winterBreakFrom` (`12-24`) |
| `TYPES` | commission types with their starting fee (`from`) and phase lengths in business days |
| `USAGES`, `BUDGETS`, `RUSH` | license options and their fee factor, budget bands, the rush squeeze (0.7) and fee (25%) |
| `CATEGORIES`, `PROJECTS` | the four kinds of work and the twelve projects |
| `SHOP_FILTERS`, `PRODUCTS` | the shop filters and the twelve products with their options |
| `SHIPPING`, `TAX`, `MAX_QTY` | delivery methods, Kentucky sales tax (6%), the most of one item per order (10) |
| `KEEP_DEMO_CURRENT`, `DEMO_ANCHOR`, `EVENTS` | fairs and events and the switch that rolls them forward |
| `CLIENTS`, `QUOTES` | the client list on the home page and the quotes used by case studies |

Add a project by copying an entry in `PROJECTS`:

```js
{
  id: 'harbor-lights', title: 'Harbor Lights', client: 'Flicker Weekly', type: 'editorial', year: 2026,
  motif: 'street', inks: ['yellow', 'pink', 'blue'], reg: [[0, 0], [2, -2], [-2, 2]],
  summary: 'One line for cards and the case study.',
  brief: 'What the client asked for.',
  deliverables: ['Cover', 'Two spots'],
  process: [['Step title', 'What happened.'], ['…', '…'], ['…', '…']],
  result: 'How it went.',
  quote: null
}
```

`type` must be a key of `CATEGORIES`; `quote` is a key of `QUOTES` or `null`. Give a project `featured: 5`
to show it on the home page (lower numbers first). Add a product the same way in `PRODUCTS`: `kind` is
`print`, `poster`, `zine`, `stickers` or `postcards`, and each option has a `label`, `price`, `edition` and
`left` (0 shows it as sold out).

Page copy (biography, process, terms, questions) is plain HTML in each page.

### Images and artwork

There are no image files besides the favicon and social image. All artwork is SVG drawn by
`assets/js/main.js`, section 4 ("Artwork"):

- `MOTIFS` holds one drawing per motif name (`moon`, `bus`, `mouse`, `gardeners`, `economy`, `heat`, `tea`,
  `cider`, `chocolate`, `zinefest`, `monsters`, `moth`, `street`, `swimmers`, `cat`, `pomelo`, `swatches`,
  `stickers`). Each returns the shapes for each ink plate in a 400 x 500 box; `@ht` and `@hd` in a shape
  become that ink's light and dense halftone.
- `projectArt(project)` prints a motif's plates with the project's `inks` and `reg` (the register offsets
  in pixels). `productArt(product)` places a motif on a print, poster, zine, sticker sheet or postcards.
- Any element with `data-art="<project id>"` or `data-product-art="<product id>"` is filled with that
  drawing; add `data-art-label` to give it an accessible name.
- Each plate has the `plate` class: `mix-blend-mode: multiply` on cream paper, `screen` on dark paper. The
  rough edges and speckle come from the SVG filter in `artDefs()`; delete the `filter` attribute in
  `plate()` for clean edges.

To use real scans instead, put a 4:5 image inside the `.art` box (for example
`<img src="assets/img/moon.jpg" alt="…" class="h-full w-full object-cover">`) and remove its `data-art`
attribute. The portrait on the about page and the map on the contact page are inline SVG in those pages.

The social image is `assets/img/og-image.svg`; after editing it, regenerate `assets/img/og-image.png`
(1200 x 630) by exporting the SVG from any editor, with Rammetto One, Quicksand and Courier Prime installed.
The favicon is `assets/img/favicon.svg`.

### Navigation, header and footer

The header, mobile menu and footer are repeated in every page. To add a page, copy an existing page, then add
a link to the `<nav aria-label="Main">` list, the `<nav aria-label="Mobile">` list and the footer in every
page. Mark the current page's links with `aria-current="page"`. Each page's `<body data-page="…">` decides
which script runs (`home`, `work`, `project`, `shop`, `checkout`, `commissions`, `contact`).

### Dark mode

The moon/sun button (`data-theme-toggle`, `aria-pressed`) switches between cream paper and dark paper. The
choice is saved under `overprint-theme` (`light` or `dark`); without a saved choice the site follows the
visitor's system setting. A small inline script in each page's `<head>` applies it before the page paints.
To ship light only, delete that inline script, the toggle button in the header and the `:root.dark` block
in `src/input.css`.

## Features

### Riso artwork and misregistered headlines

Every drawing is built from separate ink plates, printed with `mix-blend-mode`, so pink over blue makes
violet and yellow over pink makes orange-red, as on a real riso. Page headlines with the `misreg` class
print a second, pink copy a fraction off register from the `data-ink` attribute (keep it the same as the
heading text); the copy is decoration and hidden from screen readers. The body has a fixed paper-grain
overlay (`body::before` in `src/input.css`). Hover wobbles and the spinning sticker stop with reduced motion.

### Work filter

`initWork()` builds chips for "All work" and each key of `CATEGORIES`, with counts. Chips are buttons with
`aria-pressed`; choosing one updates the grid, the live count ("Showing 3 projects in posters") and the URL
(`work.html?type=posters`), which can be shared. Unknown values fall back to all work.

### Case studies

`project.html?project=<id>` renders any project from `PROJECTS`; with no id it shows the first, and with an
unknown id it shows the first with a short notice. The stages are an ARIA tablist (Left/Right arrows,
Home and End): **Sketch** draws every plate as a pencil line (`is-sketch` class), **Plates** shows each ink
alone, and **Final print** shows the overprint with a button per ink (`data-plate`, `aria-pressed`) that
takes it off the press. At least one ink stays on.

### Shop and cart

`initShop()` renders `PRODUCTS` with size options (radios), the price, edition and stock ("Edition of 60 ·
only 12 left") and an Add to cart button (`data-add="<product id>"`). Sold-out sizes are disabled and
crossed out. The filter chips use `?filter=` (`all`, `prints`, `zines`, `paper`). The header cart button
(`data-cart-open`, count in `data-cart-count`) opens a `<dialog>` drawer with quantity steppers; on the
checkout page it is a plain link. A line can't go above `MAX_QTY` or the stock left.

### Checkout

`initCheckout()` lists the cart with steppers, offers the `SHIPPING` methods (standard is free from $75),
adds `TAX` when the state is Kentucky or the order is picked up, and validates name, email, address, ZIP
code and a test card (Luhn check, expiry not in the past, 3 or 4 digit code). The confirmation shows an
order number like `PP-7K2Q`, the items, the total and the next mail day, then empties the cart. No payment
is taken; connect a real payment provider (for example a hosted checkout) before selling anything.

### Commission estimate

`initCommissions()` runs four steps, each validated before the next. The aside shows:

- the fee range: `TYPES[type].from` × the license factor × 1.2 for worldwide (× 1.25 for a rush), to 1.6
  times that, rounded to $50. Editorial for one-time print in North America reads "$650 to $1,050";
- whether the budget band is under, in or above that range;
- a timeline in business days from the earliest start (the first working Monday at least 14 days away): kickoff,
  sketches, revisions, final art and print-ready files;
- a rush or too-soon warning when the deadline is before the usual or the squeezed delivery.

The deadline field's minimum is tomorrow; when a type is chosen it suggests the usual delivery plus five
workdays. `commissions.html?type=posters` preselects a type (the work and case study pages link this
way).

### Dates, holidays and the preview clock

All dates are worked out in the studio's time zone (`STUDIO.timeZone`). `holidays(year)` closes the studio
on New Year's Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Thanksgiving and the Friday after,
and from `winterBreakFrom` to December 31, by rule, for any year. These fill:

| Attribute | Shows |
|-----------|-------|
| `data-booking-from` | month of the earliest start |
| `data-start-date` | earliest start date |
| `data-reply-by` | two business days from today |
| `data-mail-day` | next Tuesday or Friday the studio is open |
| `data-open-studio` | next first Saturday of the month |
| `data-next-event` | the next event |
| `data-studio-clock`, `data-studio-status` | local time and open/closed (weekdays 10am to 5pm) |
| `data-year` | copyright year |

Add `?now=2027-03-01T10:00` to any page to preview another date and time (studio time).

### Events that roll forward

`EVENTS` in `data.js` has real dates. While `KEEP_DEMO_CURRENT` is `true`, an event whose last day has
passed moves forward by 364 days at a time (whole weeks, so weekdays stay right) until it is upcoming, and
the list is sorted by date. On `DEMO_ANCHOR` (2026-10-27) nothing moves. For a real site, set
`KEEP_DEMO_CURRENT = false` and keep the list up to date; past events then drop off.

### Mobile menu, reveal and back to top

The menu button (`#menu-button`, `aria-expanded`, `aria-controls="mobile-menu"`) opens a full-height menu
that Esc closes. Elements with `reveal` fade in on scroll (and everything above them), off with reduced
motion. A back-to-top button appears after one screen and moves focus to the main content.

## Forms

There are four forms. None of them send anything until you connect them.

| Form | Where | Validates | Success state |
|------|-------|-----------|---------------|
| Sticker newsletter (`data-form="stickers"`) | home | name, email, ZIP code | "You're on the list" with the next newsletter month |
| Contact (`data-form="contact"`) | contact | name, email, topic, order number (`PP-XXXX`, only for shop orders), message of 10 to 1,200 characters | a reference and the reply date |
| Commission (`#commission-form`) | commissions | type, brief of 20+ characters, license, budget, deadline, name, email, optional US phone | a reference, the reply date, the earliest kickoff and a summary |
| Checkout (`#checkout-form`) | checkout | contact, delivery, address, card | an order number and the mail day |

Errors appear under each field (`aria-invalid`, `aria-describedby`) and the first one gets focus. To connect
a form, replace the `successSwap(...)` call in its handler in `initForms()`, `initCommissions()` or
`initCheckout()` with a request, and show the success state only when the service answers OK. With
Formspree:

```js
fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  .then((r) => { if (r.ok) successSwap(form, '<p>Thanks!</p>'); else toast('Sorry, that didn’t go through.'); });
```

Give the inputs `name` attributes so `FormData` picks them up (some only have an `id`).

## Saved data (localStorage)

| Key | Shape | Notes |
|-----|-------|-------|
| `overprint-cart` | `[{ "id": "river-swimmers", "option": "letter", "qty": 2 }]` | read through `normalizeCart()`: unknown products or options, sold-out options and bad quantities are dropped, duplicates merged, quantities capped at `MAX_QTY` and stock |
| `overprint-theme` | `"light"` or `"dark"` | anything else means "follow the system" |

All access goes through `safeStorage` in `main.js`: localStorage when it works, an in-memory store when the
browser blocks it (a sandboxed iframe or strict privacy settings), so the cart still works for that page
view. To reset, remove the keys in the browser's developer tools, or run
`localStorage.removeItem('overprint-cart')`.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `theme-color` in its `<head>`. The
case study also updates `document.title` for the project shown. Social sites need an absolute image URL, so
on your live site change `content="assets/img/og-image.png"` to the full address, for example
`https://pomelopress.example/assets/img/og-image.png`. Add a `sitemap.xml` listing your pages, and a
`robots.txt`; for a real artist site, `Person` or `LocalBusiness` structured data on the about page helps.

## Accessibility

- Skip link, landmarks, one `<h1>` per page and logical headings.
- Visible focus rings on every control; the current page is marked with `aria-current="page"`.
- Filter chips and ink toggles are buttons with `aria-pressed`; the stages are a tablist with arrow keys;
  the cart is a modal `<dialog>`; steppers have labels; counts and the plate status are live regions.
- Artwork that only decorates a card is hidden from screen readers; main pictures have a label.
- Text meets WCAG AA on cream and dark paper (the inks have darker text versions for that reason).
- Reduced motion turns off reveals, hover wobbles, the spinning sticker and smooth scrolling.

When editing, keep one `h1`, give new inputs a `<label>`, and keep the `misreg` heading's `data-ink` equal
to its text.

## Building and deploying

The compiled CSS is included, so the site can be uploaded as it is. After changing `src/input.css` or using
Tailwind classes that aren't in the CSS yet, rebuild (Node.js 24):

```sh
npm install
npm run build     # once
npm run watch     # rebuild on every change
```

Upload the folder to any static host: Netlify Drop, GitHub Pages, Cloudflare Pages or your own server. There
is no server code.

## Troubleshooting

- **New Tailwind classes have no effect.** Rebuild the CSS. Classes written in JavaScript strings must
  appear in full in a file (not built from pieces) for Tailwind to find them.
- **The artwork is invisible in dark mode.** The plates use `screen` on dark paper; if you change an ink to
  a very dark color, it disappears on dark paper. Keep inks light and saturated, or set a separate dark
  value under `:root.dark`.
- **The cart empties on every page.** The browser is blocking storage (a sandboxed preview or private
  mode). It works for each page view; on a normal site it persists.
- **Events disappeared.** `KEEP_DEMO_CURRENT` is `false` and the dates have passed. Add new dates to
  `EVENTS`.
- **The deadline says "too soon".** The date is before the squeezed (rush) delivery for that type. Shorten
  the phases in `TYPES` or change `RUSH.squeeze`.
- **The headline shows a doubled word.** The `data-ink` attribute of a `misreg` heading doesn't match its
  text.
- **Dates are a day out.** Check `STUDIO.timeZone`; the clock uses the studio's time zone, not the
  visitor's. Use `?now=` to test.

## License

MIT. The code and all included artwork are free for personal and commercial use. See `LICENSE.txt` in the
download. Rammetto One, Quicksand and Courier Prime are licensed under the SIL Open Font License. Pomelo
Press, Pipa Valdespino, the clients, the projects and the products are fictional.
