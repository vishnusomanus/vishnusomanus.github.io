# Studio documentation

## Overview

Studio is a complete website for a small design studio, built for the fictional **Raster**, a five-person studio in
Saint Paul that works across identity, digital product, editorial and wayfinding. The design is deliberately restrained:
a strict 12-column grid, one typeface family in several weights plus a mono face for labels, a monochrome palette and
a single red accent. Project imagery is drawn in SVG, so there are no photos to license. It has a work index with
filters and grid/list views, nine data-driven case studies, a services page with a brief estimator, a studio page, a
journal and a five-step project inquiry. This is the HTML + Tailwind CSS v4 version, **version 1.0.7**. See it live at
[freeframe.dev/templates/studio](https://freeframe.dev/templates/studio).

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Every page and link works straight from your computer.
3. For a closer match to a real host (and for the copy-email button, which browsers only allow on `https://` or
   `localhost`), serve the folder:

   ```sh
   cd studio
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

No build step is needed to use or edit the text. Node.js 24 is only needed to rebuild the CSS (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Page | What's on it |
|------|------|--------------|
| `index.html` | Home | Typographic hero with availability, selected work with hover labels, services list, client wordmarks, count-up numbers, journal teaser, contact call to action |
| `work.html` | Work | All nine projects with discipline filters, year sort, live count, grid/list view toggle and a hover/focus preview in list view |
| `project.html` | Case study | Rendered from data for `project.html?id=<id>`: facts, cover, overview, challenge, three artwork images, approach, results, quote, credits, previous/next project |
| `services.html` | Services | Four disciplines with deliverables, timelines and starting prices, three engagement models, the brief estimator and an FAQ |
| `studio.html` | Studio | Story, floor plan of the studio, values, process timeline, team, open roles and visiting details |
| `journal.html` | Journal | Eight short notes with topic filters, expandable text and a newsletter sign-up |
| `contact.html` | Contact | Five-step project inquiry with a review step, plus email, phone and studio hours with a live open/closed note |
| `404.html` | Not found | "Off the grid" page with links back into the site |

## Project structure

```text
studio/
├─ index.html, work.html, project.html, services.html, studio.html, journal.html, contact.html, 404.html
├─ assets/
│  ├─ css/style.css        compiled Tailwind CSS (generated: don't edit by hand)
│  ├─ js/main.js           all interactivity and the project data, vanilla JavaScript, no dependencies
│  └─ img/
│     ├─ work/*.svg        project covers, one per project id (800×600)
│     ├─ favicon.svg       browser tab icon
│     ├─ og-image.svg      editable source of the social sharing image
│     └─ og-image.png      1200×630 social sharing image
├─ src/input.css           Tailwind source: design tokens, component classes, back-to-top styles
├─ package.json            scripts to rebuild assets/css/style.css
└─ README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

All design tokens live in the `@theme` block of `src/input.css`:

| Token | Value | Used for |
|-------|-------|----------|
| `--color-paper` | `#f6f6f3` | Page background |
| `--color-sheet` | `#ffffff` | Raised surfaces: the estimator panel and the inquiry form |
| `--color-tint` | `#ecece7` | Quiet fills and image backgrounds |
| `--color-rule` | `#d6d6cf` | Hairlines between rows and sections |
| `--color-faint` | `#8b8b85` | Decorative lines only (too light for text) |
| `--color-mute` | `#5b5b56` | Secondary text (WCAG AA on paper and sheet) |
| `--color-ink`, `--color-ink-2` | `#121211`, `#2a2a28` | Text, buttons, dark sections |
| `--color-signal` | `#e8381e` | The accent, for small fills: dots, squares, bars |
| `--color-signal-ink` | `#c02a12` | Accent text on light backgrounds and error messages |

The accent is used sparingly on purpose: the square in the logo, the dot before labels and the current menu item,
the `+` and `%` in the numbers, and error markers. To change it, edit both signal tokens and rebuild the CSS:

```css
@theme {
  --color-signal: #2b50ff;
  --color-signal-ink: #1f3ad1;
}
```

The accent also appears as a hex value in the logo SVG in every page's header, `assets/img/favicon.svg`,
`assets/img/og-image.svg`, the floor plan on `studio.html` and the 404 drawing. Search for `e8381e` to find them.
Each project has its own palette for its artwork (see [Content](#content)).

Useful component classes in `src/input.css`:

| Class | What it does |
|-------|--------------|
| `.wrap` | The page container (`max-w-[90rem]` with side padding) |
| `.grid-12` | The grid every section sits on: 4 columns on phones, 12 from `sm` |
| `.label`, `.idx`, `.dot` | Small uppercase mono labels, index numbers and the red square |
| `.display`, `.h-section`, `.lead` | Display headings, section headings and lead paragraphs |
| `.btn` + `.btn-ink`, `.btn-line`, `.btn-line-light`, `.btn-sm` | Square-cornered buttons |
| `.link-line`, `.link-under` | An underline that draws in on hover, and a quiet permanent underline |
| `.chip`, `.seg`, `.seg-btn` | Filter chips and the grid/list segmented control |
| `.input`, `.field-label`, `.field-hint`, `.field-error`, `.choice`, `.choice-box` | Form fields and choice tiles |
| `.acc`, `.acc-icon` | Native `<details>` accordions with a plus/minus icon |
| `.cover` | An image frame that zooms its image slightly on hover |
| `.work-list`, `.work-item`, `.work-link`, `.work-row`… | The two layouts of the work index (see [Work index](#work-index)) |
| `.reveal`, `.rise`, `.fill-bar` | Scroll reveal, headline line reveal and the process bars |

### Typography

Two Google Fonts are loaded by one `<link>` in the `<head>` of every page:

- **Host Grotesk** (300–700, plus italic 400) for everything: `--font-sans`. Headings use weight 500 with tight
  negative letter-spacing; the team monograms use 300.
- **Fragment Mono** for labels, index numbers and dates: `--font-mono`.

Each token has a system fallback stack (Helvetica, Arial), so the site keeps its character if the fonts don't load.
To swap a font, change the Google Fonts URL in every page's `<head>` and the matching token:

```css
--font-sans: "Inter Tight", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif;
```

The generated case study artwork in `main.js` names the fonts in the `SANS` and `MONO` constants; change those too.

### Content

Most text lives in the HTML files. Two things are data in `assets/js/main.js`: the case studies (`PROJECTS`) and the
estimator's price model (see [Brief estimator](#brief-estimator)).

**Projects.** Every project appears in up to four places:

1. `PROJECTS` in `main.js` – the case study itself. The array order is the order of the previous/next links.
2. `assets/img/work/<id>.svg` – its cover (800×600).
3. `work.html` – one `<li>` in the work index.
4. `index.html` – optionally, one of the four selected-work cards.

A project in `PROJECTS` looks like this (shortened):

```js
{
  id: 'seeline',                       // used in project.html?id=seeline and the cover file name
  client: 'Wakeline',
  title: 'A calmer identity for the lake ferries',
  disciplines: ['identity', 'wayfinding'], // keys of DISCIPLINES
  year: 2025,
  sector: 'Public transport',
  location: 'Excelsior',
  duration: '14 months',
  services: ['Identity system', 'Wayfinding', 'Schedule design', 'Livery'],
  summary: '…',
  challenge: '…',
  approach: [{ title: 'Audit every touchpoint', text: '…' }, …],   // three steps
  results: [{ value: '−38%', label: '…' }, …],                     // three results
  quote: { text: '…', name: 'Andrea Lutz', role: 'Head of customer experience, Wakeline' },
  credits: ['Noemi Imhof', 'Selin Karaca', 'Céline Odermatt'],
  palette: { bg: '#1d3b57', ink: '#f1efe7', accent: '#ff7a3d', soft: '#8fb3c9' },
  mark: '<circle cx="50" cy="50" r="38" …/>',  // SVG in a 100×100 box, filled with currentColor
  poster: { lines: ['Summer', 'schedule'], sub: 'May 1 – Sep 30, 2025' },
  sign: ['3', 'Departures', 'Wayzata · Excelsior · Tonka Bay'],
  gallery: [
    { kind: 'board', caption: '…' },     // the first image is wide (16:9)
    { kind: 'signage', caption: '…' },   // the next two are tall (4:5)
    { kind: 'poster', caption: '…' }
  ]
}
```

Gallery `kind` values: `board`, `screens` and `spread` are wide; `poster`, `signage` and `mark` are tall. `screens`
reads `ui: { headline, figure }`, `spread` reads `spread: { title, sub }`, `poster` reads `poster` and `signage` reads
`sign` (a large number or letter, a title and a small line).

To add a project:

1. Add an object to `PROJECTS` with a new `id`.
2. Add `assets/img/work/<id>.svg` (or a JPEG/WebP; then change the `.svg` in `renderProject` and in `work.html`).
3. Copy an `<li class="work-item" …>` in `work.html`, set `href="project.html?id=<id>"`, the image, the text,
   `data-year`, `data-disciplines` (space-separated keys) and the next `data-order`, then update the numbers in the
   filter chips' `<span class="chip-count">`, the `(9)` after the heading and the "Showing all 9 projects" text.

**Disciplines.** `DISCIPLINES` in `main.js` maps the filter keys to labels: `identity`, `digital`, `editorial`,
`wayfinding`. To add one, add a key there and a chip `<button type="button" class="chip" data-filter="motion"
aria-pressed="false">…</button>` in `work.html`.

**The pre-rendered case study.** `project.html` contains the rendered HTML of the first project (`seeline`) inside
`<article data-case-article data-rendered="seeline">`, so the page has real content without JavaScript and for search
engines. If you change the first project's data or `renderProject`, either update that HTML too or remove the
`data-rendered` attribute (the script then always renders from data).

**Count-up numbers.** The home page numbers use `<span data-count="140">140</span>`. Keep the final value as the
text: that is what visitors see without JavaScript or with reduced motion.

**Journal notes.** Each note on `journal.html` is an `<article id="note-…" data-note data-tags="type process">`. The
tags are space-separated and must match a chip's `data-tag`. The hidden text is the `<div id="note-…-body" hidden>`,
and the toggle button's `aria-controls` must point at that id. Update the chip counts when you add a note. The home
page teaser links to notes with `journal.html#note-figures`.

**Team, roles and services.** Edit `studio.html` and `services.html` directly. The team "portraits" are monogram
tiles; replace each `<div … aria-hidden="true">` with an `<img>` at 4:5 if you have photos.

**Rolling dates.** The availability dates are `<span data-months-ahead="n">`: the script shows the month n
months from now and its year, so they never go stale. On the home page "From Feb 2027" (`4`, with
`data-month-format="short"`) and "Booking projects from February 2027" (`4`); in the jobs list on `studio.html` the
start dates "From January 2027" (`3`) and "From March 2027" (`5`) and the internship deadline "December 15, 2026"
(`2`, with `data-day="15"`). The dates in the HTML are shown without JavaScript. To show a fixed date, replace the
span with plain text.

### Images and artwork

There are no photos; all artwork is SVG.

| Artwork | Size / ratio | Notes |
|---------|--------------|-------|
| `assets/img/work/*.svg` | 800×600 (4:3) | Project covers in the grid, list preview, home page and case study. Replace with 4:3 images, at least 1600×1200 |
| Case study gallery | 1600×900 and 800×1000 | Generated in `main.js` (`ART`) from each project's palette and mark |
| Floor plan (`studio.html`), 404 drawing | Inline SVG | Edit in place |
| `assets/img/og-image.png` | 1200×630 | Social image. Edit `og-image.svg`, then export it to PNG at 1200×630 |
| `assets/img/favicon.svg` | 32×32 | Browser tab icon |

To use photos in the case study gallery instead of generated artwork, replace `ART[g.kind](p, g.caption)` in
`renderProject` with an `<img>` built from a path you add to each gallery item, for example
`'<img src="' + g.src + '" alt="' + esc(g.caption) + '" class="block h-auto w-full">'`.

Images in `.cover` frames use `object-cover`, so other ratios still fit. Keep `width`, `height` and a meaningful `alt`
in step when you replace them. Covers in cards have an empty `alt` because the link text names the project.

### Navigation, header and footer

The header and footer are repeated in every HTML file, so change them in all eight pages (search and replace works
well). The desktop menu is `<nav aria-label="Main">` and the mobile menu is `<nav id="mobile-menu">`. Mark the current
page with `aria-current="page"` on its links in both menus; the red square and color come from the `aria-[current]`
styles on `.nav-link` and `.mobile-link`. `project.html` marks Work with `aria-current="true"` because it is inside that
section.

The footer has the contact call to action, address, an index of pages, external links, a large `aria-hidden` "Raster."
wordmark, the copyright line (the year is filled in by `[data-current-year]`), the "Show grid" toggle and a "Back to top" link.

## Features

### Work index

`work.html` wraps everything in `[data-work]`. Each project is an `<li data-project data-order data-year
data-disciplines>` inside `<ul class="work-list" data-work-list data-view="grid">`.

- **Filter.** Chips with `data-filter="all|identity|digital|editorial|wayfinding"` set `aria-pressed`. The choice is
  kept in the URL as `?discipline=identity`, so filtered views can be shared; unknown values fall back to all.
- **Sort.** The `<select data-sort>` sorts by year, `newest` (default) or `oldest`, kept as `?sort=oldest`. Items
  with the same year keep their `data-order`.
- **Count.** `[data-work-count]` (`aria-live="polite"`) reads "Showing all 9 projects", "Showing 3 of 9 projects" or
  "Showing 1 of 9 projects".
- **View.** The two `[data-view-btn]` buttons switch `data-view` on the list between `grid` and `list`; the choice is
  saved in `localStorage` (`studio-work-view`). Both layouts are pure CSS on the same markup (`.work-list[data-view=…]`
  rules in `src/input.css`).
- **Preview.** In list view at 768 px and wider, `[data-work-preview]` shows the project's cover next to the pointer.
  When a row receives keyboard focus, the preview appears beside that row. It hides on blur, on scroll and with
  Escape, is `aria-hidden` and never blocks the pointer. On phones the list shows a small thumbnail instead.

### Case study

`project.html` reads `?id=` and renders the matching `PROJECTS` entry with `renderProject()` into
`[data-case-article]`. It updates the page `<title>` and meta description. Without `?id=` it shows the first project;
an unknown id removes the article and shows `[data-case-missing]` with its heading promoted to the page's `<h1>`.
Previous and next links wrap around the `PROJECTS` array. Each gallery image is an inline SVG with `role="img"` and its
caption as the accessible name.

### Brief estimator

The estimator on `services.html#estimator` is the `[data-estimator]` block. Its price model is at the top of
`main.js`:

```js
var SCOPE = {
  strategy: { label: 'Brand strategy', cost: [12000, 18000], weeks: [3, 4] },
  identity: { label: 'Identity system', cost: [28000, 45000], weeks: [6, 9] },
  …
};
var SCALE = { focused: { label: 'Focused', mult: 0.75, pace: 0.8 }, standard: …, extensive: … };
var URGENCY = { relaxed: { label: 'Relaxed', mult: 0.95, pace: 1.2 }, standard: …, priority: … };
```

- **Budget** = the sum of the selected services' `cost` × `SCALE.mult` × `URGENCY.mult`, low rounded down and high
  rounded up to $1,000, shown with a comma thousands separator (`$63,000–$105,000`).
- **Duration** = the longest selected service plus half of the others (phases overlap), × `SCALE.pace` ×
  `URGENCY.pace`, rounded to whole weeks.
- **Breakdown** lists each selected service and the combined multiplier.
- **Send this brief** links to `contact.html?services=identity,website&budget=60-120&timeline=standard`. The budget
  band is picked from the midpoint of the range using `BUDGETS`.

The checkboxes and radios in `services.html` must use the same keys as `SCOPE`, `SCALE` and `URGENCY`, and the price
hints in their labels are plain text, so update them when you change the numbers. The default selection is
`DEFAULT_BRIEF`. Choices are saved in `localStorage` (see [Saved data](#saved-data-localstorage)); Reset restores the
defaults. Results are announced through a visually hidden `aria-live` region.

### Project inquiry

The form on `contact.html` (`[data-enquiry]`) has five `<section data-step>` steps: Project, Budget and timeline,
Details, About you and Review. "Next" validates the current step before moving on; the step tabs above the form let
visitors jump back to any step they have reached. Moving between steps focuses the new step's heading and announces
"Step 2 of 5: Budget and timeline" through `[data-step-live]`. The Review step lists every answer with an "Edit"
button that jumps to the right step. The details field shows a live character count.

It is prefilled from the estimator link: `?services=` (comma-separated `SCOPE` keys), `?budget=`
(`under-30`, `30-60`, `60-120`, `120-plus`) and `?timeline=` (`relaxed`, `standard`, `priority`). When anything is
prefilled, `[data-prefill-note]` appears.

### Journal filters and notes

`journal.html` wraps the notes in `[data-journal]`. Topic chips (`data-tag`) filter the notes, kept in the URL as
`?tag=process`; `[data-note-count]` announces the result with correct singular/plural wording. Each note's "Read
note" button toggles `aria-expanded` and the `hidden` body. Opening `journal.html#note-figures` expands that note
(clearing a filter that would hide it).

### Clock, studio status and small extras

- **Saint Paul clock.** Any `<time data-clock>` shows the current time in Saint Paul, updated every 15 seconds.
- **Studio status.** `[data-studio-status]` on `contact.html` says whether the studio is open now, using
  `STUDIO_HOURS` (`days` with 0 = Sunday, `open` and `close` in 24-hour decimals, `tz`). Keep it in step with the
  hours written on the page.
- **Copy email.** A `<button data-copy="hello@raster.example">` copies the address and briefly shows "Copied". The
  label sits in an `aria-live` region. Browsers only allow copying on `https://` or `localhost`; elsewhere the label
  asks the visitor to copy it by hand.
- **Grid overlay.** The footer's "Show grid" button (`[data-grid-toggle]`, `aria-pressed`) overlays the 12-column
  grid in translucent red, handy while you edit layouts. Remove the button to drop it.

### Reveals and motion

`.reveal` elements fade up as they scroll into view; `.rise` headings lift each line (`<span><span>…</span></span>`)
into place; `.fill-bar` bars on the studio page grow from the left; numbers with `data-count` count up. Everything above
a revealed element is revealed too, so fast jumps never leave hidden content. With `prefers-reduced-motion: reduce`
all of this is off and content is shown immediately. Without JavaScript nothing is hidden (the styles only apply
under `html.js`).

### Header, mobile menu and back to top

The header is sticky. Below 1024 px the "Menu" button (`#menu-button`, `aria-expanded`, `aria-controls`) opens a
full-height menu; Escape or a link closes it and focus returns to the button. The back-to-top button is created by
`main.js` after you scroll about one screen; it hides while the footer's "Back to top" link is visible. To remove it,
delete the last block of `main.js` and the `.back-to-top` styles in `src/input.css`.

## Forms

There are two forms. Neither sends anything until you connect it, although their success messages read as if it had.
The inquiry confirmation shows a short reference (`RA-` and four characters, made in the browser by `makeRef()` in
`main.js`; show your form service's own reference instead if it returns one) and repeats the reply time the contact page
already promises (within two business days, usually to suggest a 30-minute call). The newsletter confirmation asks the
visitor to look out for a confirmation email. Change either if yours differs.

| Form | Page | Validates |
|------|------|-----------|
| Project inquiry (`[data-enquiry]`) | `contact.html` | At least one service; organization; a budget and a timeline; project details of at least 40 characters; an optional link that must start with `http://` or `https://`; name; a valid email; the consent box |
| Newsletter (`[data-newsletter]`) | `journal.html` | A valid email |

Errors appear under each field (`.field-error`), are linked with `aria-describedby` and mark the field
`aria-invalid="true"`; the first invalid field receives focus. Fields re-check as they are corrected.

### Connecting to Formspree

1. Create a form at [formspree.io](https://formspree.io) and copy its endpoint, for example
   `https://formspree.io/f/abcdwxyz`.
2. In `main.js`, find the inquiry `submit` handler (look for "Demo only: nothing is sent") and replace the lines
   that show the success message with a request:

   ```js
   fetch('https://formspree.io/f/abcdwxyz', {
     method: 'POST',
     body: new FormData(enquiry),
     headers: { Accept: 'application/json' }
   }).then(function (res) {
     if (!res.ok) throw new Error('Request failed');
     enquiry.parentElement.hidden = true;
     success.querySelector('[data-success-name]').textContent = enquiry.elements.name.value.trim().split(/\s+/)[0];
     success.querySelector('[data-success-ref]').textContent = makeRef('RA');
     success.hidden = false;
     success.focus();
   }).catch(function () {
     alert('Sorry, something went wrong. Please email hello@raster.example.');
   });
   ```

3. Check the success text in `contact.html` (`[data-enquiry-success]`) matches what really happens next. To show the
   reference, keep the `[data-success-ref]` line from the original handler inside the `.then()`.

The newsletter form works the same way: replace the lines after "Demo only: connect your newsletter provider here"
with a request to your provider (Buttondown, Mailchimp and others accept a form POST), then check the
`[data-newsletter-done]` text matches your provider (most send a confirmation email for double opt-in). Checkbox groups submit one `services` value per checked box.

## Saved data (localStorage)

| Key | Shape | Validation on read | Reset |
|-----|-------|--------------------|-------|
| `studio-work-view` | `"grid"` or `"list"` | Anything other than `"list"` means grid | Switch the view, or remove the key |
| `studio-brief-v1` | `{"scope":["identity","website"],"scale":"standard","urgency":"standard"}` | Unknown or duplicate scope keys are dropped; an unknown scale or urgency falls back to the default; invalid JSON means defaults | The estimator's Reset button removes it |

Storage is wrapped in `try`/`catch`, so private browsing modes that block it simply don't remember choices. To reset
everything, run `localStorage.removeItem('studio-work-view'); localStorage.removeItem('studio-brief-v1');` in the
browser console.

## SEO and sharing

Every page has its own `<title>`, meta description, Open Graph tags (`og:title`, `og:description`, `og:image`), a
Twitter card tag, `theme-color` and the favicon, all in the `<head>`. The case study page also updates its title and
description for each `?id=`; for search engines, consider one static HTML file per project if case studies matter for
SEO (copy `project.html` and paste in the rendered output).

`og:image` is the relative path `assets/img/og-image.png`. Social networks need an absolute URL, so after deploying
change it on every page:

```html
<meta property="og:image" content="https://www.your-studio.example/assets/img/og-image.png">
```

Add a `sitemap.xml` listing the eight pages (and `robots.txt` pointing to it), and consider `Organization` or
`ProfessionalService` structured data with your address on the home page.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page and a logical heading order.
- Visible focus outlines in the accent color; all interactive elements are native buttons, links and inputs.
- Filters, view toggle and grid toggle use `aria-pressed`; counts and estimator results use `aria-live="polite"`.
- The work preview is decorative (`aria-hidden`), appears on keyboard focus as well as hover and is dismissible
  with Escape.
- The inquiry form moves focus to each step's heading, announces the step and links errors to their fields.
- Accordions are native `<details>`; note toggles use `aria-expanded` and `aria-controls`.
- Text colors meet WCAG AA: use `text-mute` (not `text-faint`) for secondary text, and `text-signal-ink` for red
  text on light backgrounds.
- `prefers-reduced-motion` turns off all reveals, count-ups and transitions.

When editing, keep one `<h1>` per page, give every new input a `<label>`, and keep every `aria-labelledby`,
`aria-describedby` and `aria-controls` pointing at an id that exists.

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` is compiled from `src/input.css` and the classes used in the HTML and `main.js`. After adding
Tailwind classes or changing tokens (Node.js 24):

```sh
npm install
npm run build    # or: npm run watch while you work
```

Classes that only appear inside JavaScript strings must be written out in full (as in `renderProject`) so Tailwind
can find them.

### Deploying

The site is static. Upload the folder (without `node_modules/` and `src/` if you like) to any static host: Netlify
Drop, Cloudflare Pages, GitHub Pages, Vercel or plain web space. All links are relative, so it also works in a
subfolder. Set `404.html` as the error page if your host supports it.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| New Tailwind classes have no effect | Rebuild the CSS with `npm run build`; the compiled file only contains classes it found |
| A project link shows "We couldn't find that project" | The `?id=` doesn't match an `id` in `PROJECTS` exactly (ids are lowercase with hyphens) |
| The work index always opens in list view | It remembers the last view in `localStorage`; switch back to Grid or remove `studio-work-view` |
| The estimator shows old selections | Choices are saved; press Reset, or remove `studio-brief-v1` |
| "Copy email" says "Press Ctrl+C to copy" | Browsers only allow clipboard access on `https://` or `localhost`; serve the folder or deploy it |
| Changes to the first project don't show without JavaScript | `project.html` contains pre-rendered HTML for it; update that HTML or remove `data-rendered="seeline"` |
| Fonts look different in the project covers | Covers are `<img>` SVGs, which can't load web fonts; their few labels fall back to Helvetica or Arial |

## License

MIT. Free for personal and commercial use, including client work. The full text is in `LICENSE.txt` in the download.
All artwork (project covers, generated case study images, floor plan, favicon and social image) is included under
the same license. Raster, its team, clients and projects are fictional.
