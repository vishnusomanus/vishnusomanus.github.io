# Keystone documentation

## Overview

Keystone is a multi-page website template for a construction and architecture firm that designs and builds under
one contract. The demo brand is **Corbel Design-Build**, a fictional Milwaukee general contractor with an in-house
architecture practice (Corbel Studio), founded in 1987. The design is architectural and technical: drawing-paper and
blueprint grids, SVG line drawings with dimension lines, condensed uppercase headings and a safety-orange accent on
charcoal and concrete tones. It is built with plain HTML5, Tailwind CSS v4 and one vanilla JavaScript file, with no
dependencies. This guide covers version 1.0.6 (see `template.json`). Live demo:
[freeframe.dev/templates/keystone](https://freeframe.dev/templates/keystone).

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Every page works straight from the file system: links are relative and there is
   no build step.
3. To preview over HTTP instead (closer to production), serve the folder with any static server, for example:

   ```sh
   npx serve .
   ```

You only need Node.js (version 24) if you change `src/input.css` or add Tailwind classes that are not already in the
compiled CSS. See [Building and deploying](#building-and-deploying).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with a self-drawing SVG building and crane, count-up stats, four services, featured projects, process timeline (design, permits, build, handover), safety and accreditation strip, client references, call-to-action band |
| `projects.html` | Portfolio | Nine project cards with type filter chips, live search, result count, empty state, shareable URLs |
| `project.html` | Case study (Malt House Lofts) | Facts table, challenge and solution, before/after slider, drawing gallery with lightbox, outcome numbers, related projects |
| `services.html` | Services | Four service sections with scope and typical costs, sectors, three contract models, FAQ accordion |
| `estimate.html` | Project estimator | Five steps: type, size, finish, timeline, your details; live cost range, build time and breakdown; quote request form |
| `about.html` | Company | Story and milestones, values, leadership team, safety record with an SVG bar chart, open roles |
| `contact.html` | Contact | Contact form, two offices with hours and live open/closed status, SVG regional map, direct email lines |
| `404.html` | Not found | Keystone-and-arch line drawing and links back into the site |

## Project structure

```text
keystone/
  index.html, projects.html, project.html, services.html,
  estimate.html, about.html, contact.html, 404.html
  assets/
    css/style.css         compiled Tailwind CSS (generated, do not edit by hand)
    js/main.js            all interactive behavior, vanilla JavaScript
    img/
      favicon.svg         browser tab icon
      og-image.svg        social image source (1200 x 630)
      og-image.png        social image used in og:image
      project-*.svg       nine project elevation drawings (800 x 600)
      malt-house-*.svg    case study before/after views (800 x 520) and gallery sheets (800 x 600)
      team-*.svg          four leadership portraits (400 x 480)
  src/input.css           Tailwind source: brand tokens and component classes
  package.json            scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

All design tokens live in the `@theme` block of `src/input.css`. Three color families matter:

| Token family | Used for |
|--------------|----------|
| `--color-char-950` … `--color-char-500` | Charcoal: dark sections, header border, text |
| `--color-concrete-50` … `--color-concrete-400` | Concrete: page background, borders, drawing grids |
| `--color-signal-300` … `--color-signal-700` | Signal orange: buttons, highlights, accents |

Use `signal-500` as a fill (with `char-950` text on it) and as text on charcoal. Use `signal-700` for orange text on
light backgrounds; `signal-500` text on white does not meet WCAG AA contrast.

To change the accent, edit the signal values and rebuild the CSS:

```css
@theme {
  --color-signal-300: #7cc4ff;
  --color-signal-400: #3fa5ff;
  --color-signal-500: #1488f0;
  --color-signal-600: #0b6fcc;
  --color-signal-700: #0a5299;
}
```

A few colors are written directly into SVG artwork and inline SVG (the hero drawing, map, chart, logo mark and the
files in `assets/img/`) as hex values such as `#f15a0f`. Search and replace them if you change the accent. The
`theme-color` meta tag in each page uses `#1a1b1d`.

Useful component classes in `src/input.css`:

| Class | What it does |
|-------|--------------|
| `.btn` + `.btn-signal`, `.btn-dark`, `.btn-ghost`, `.btn-ghost-light`, `.btn-lg` | Square-cornered uppercase buttons |
| `.eyebrow`, `.eyebrow-light` | Mono section label with an orange square |
| `.h-display` | Condensed uppercase display heading |
| `.spec` | Small mono uppercase text for specs and labels |
| `.grid-paper`, `.grid-blueprint` | Light drawing-paper and dark blueprint grid backgrounds |
| `.crop` | Orange crop marks on two corners of a card |
| `.chip`, `.option-card`, `.input`, `.label`, `.field-error` | Filters, estimator choices and form fields |
| `.container-x` | The page container (`max-w-7xl` with side padding) |

### Typography

Three Google Fonts are loaded by a `<link>` in the `<head>` of every page:

- **Barlow Condensed** (500–700) for headings, buttons and navigation: `--font-display`.
- **Barlow** (400–600) for body text: `--font-sans`.
- **IBM Plex Mono** (400–500) for technical labels: `--font-mono`.

Each token has a system fallback stack, so the site still reads well if the fonts don't load. To swap a font, change
the Google Fonts URL in every page's `<head>` and the matching token in `@theme`:

```css
--font-display: "Oswald", "Arial Narrow", ui-sans-serif, system-ui, sans-serif;
```

### Content

All text lives in the HTML files. There is no content database; edit pages directly.

**Projects.** Each card in `projects.html` is an `<li>` inside `[data-project-list]`:

```html
<li class="reveal" data-project data-type="renovation" data-text="malt house lofts walker's point, milwaukee renovation 2025 ...">
  <article class="group relative flex h-full flex-col border-2 border-char-900 bg-white ...">
    ...
  </article>
</li>
```

- `data-type` is one of `commercial`, `residential`, `renovation` or `architecture` and must match a filter chip's
  `data-filter`.
- `data-text` is the lowercase text the search looks through. Include the name, place, type and year.

To add a project, copy a card, change the image, `data-type`, `data-text`, code, title, summary, floor area and year,
and update the count inside the matching chip (`<span class="chip-count">`). To add a new type, add a chip
`<button type="button" class="chip" data-filter="industrial" aria-pressed="false">Industrial ...</button>` and use the
same value in `data-type`. The same card markup is reused for related projects on `project.html` and featured work on
`index.html` (without `data-project`, so it isn't filtered).

**Case studies.** `project.html` is one complete case study. For more, duplicate it (for example
`project-third-ward.html`), replace the facts table, text, images and gallery, and point that project's card link to the
new file. The gallery reads its titles and captions from a JSON block at the end of the gallery section:

```html
<script type="application/json" data-lightbox-data>[{"src":"assets/img/project-malt-house-lofts.svg","title":"North elevation","caption":"Restored brick, steel windows and the rebuilt water tower."}, ...]</script>
```

Keep that array in the same order as the `data-lightbox-open="0"`, `"1"`… buttons.

**Count-up numbers.** Stats use `<span data-count="620" data-decimals="0">620</span>`. Keep the final value as the
text inside the span: that is what visitors see without JavaScript or with reduced motion.

**Team, roles and offices.** Edit the cards on `about.html` and `contact.html` directly. If you change office hours,
also update `OFFICE_HOURS` in `main.js` (see [Office open/closed status](#office-openclosed-status)).

### Images and artwork

There are no photos: every image is an SVG designed as a technical drawing.

| Artwork | Size / ratio | Replace with |
|---------|--------------|--------------|
| `project-*.svg` | 800 x 600 (4:3) | Project photos at 4:3, at least 1200 x 900 |
| `malt-house-before.svg`, `malt-house-after.svg` | 800 x 520 | A matching pair of photos from the same viewpoint and size |
| `malt-house-section.svg`, `malt-house-interior.svg`, `malt-house-site.svg` | 800 x 600 | Gallery photos or drawings at 4:3 |
| `team-*.svg` | 400 x 480 (5:6) | Portraits at 5:6 |
| Hero, map, chart and 404 drawings | Inline SVG in the HTML | Edit the SVG or swap for an `<img>` |

Cards crop images with `object-cover`, so other ratios still fit, but 4:3 looks best. When you switch to JPEG or WebP,
keep the `width` and `height` attributes in step with the real size and write a meaningful `alt`.

The hero drawing on `index.html` and the 404 drawing use the class `draw`. Every `path` and `line` inside it has
`pathLength="1"`, which lets the CSS animate the stroke from 0 to 1. Elements with the class `fade` fade in after the
lines. If you add your own lines to a `.draw` SVG, give them `pathLength="1"` too.

The social image is `assets/img/og-image.png` (1200 x 630). Its source is `og-image.svg`; edit it, then export it to
PNG with any SVG editor or browser screenshot at 1200 x 630. The favicon is `assets/img/favicon.svg`.

### Navigation, header and footer

The header and footer are repeated in every HTML file, so change them in all eight pages (search and replace works
well). The desktop menu is the `<nav aria-label="Main">` list and the mobile menu is `<nav id="mobile-menu">`. Mark the
current page with `aria-current="page"` on its links in both menus; the underline and color come from the
`aria-[current=page]` styles on `.nav-link` and `.mobile-link`. `project.html` marks the Projects link with
`aria-current="true"` because it is inside that section. The "Get an estimate" button sits outside the nav and is
shown from the `sm` breakpoint up; the mobile menu repeats it as the last link.

The top bar above the header holds the license number and phone number. The footer's large "CORBEL" wordmark is an
`aria-hidden` inline SVG; change its `<text>` or remove the whole `<div aria-hidden="true">`.

## Features

### Project estimator

`estimate.html` walks through five steps and shows a live estimate in the summary panel (`aria-live="polite"`), with
a slim sticky price bar on small screens.

- **Where the code is:** the "Estimator price model" block at the top of `assets/js/main.js` (data and
  `estimate()`), and the "Estimator: 4 steps + request form" block further down (UI).
- **The data:**

  ```js
  var TYPES = {
    commercial: { label: 'Commercial build', desc: '...', rate: [215, 340], min: 2000, max: 80000, step: 500, size: 12000, weeks: [26, 1], help: '...' },
    ...
  };
  var FINISH = { standard: { ..., mult: [1, 1] }, premium: { ..., mult: [1.18, 1.28] }, signature: { ..., mult: [1.45, 1.65] } };
  var TIMELINE = { flexible: { ..., mult: [0.96, 0.97], pace: 1.15 }, standard: { ... }, fast: { ..., mult: [1.08, 1.14], pace: 0.82 } };
  var DESIGN = { label: 'Architecture & permits', mult: [1.07, 1.1], weeks: [12, 20] };
  var DEFAULT_ESTIMATE = { type: 'commercial', size: 12000, finish: 'standard', timeline: 'standard', design: true };
  ```

- **The calculation** (`estimate(s)`): floor area x the type's `rate` per ft², times the finish and timeline
  multipliers, times `DESIGN.mult` when architecture is included. The low end is rounded down and the high end up to
  the nearest $5,000. Build time in weeks is `(weeks[0] + weeks[1] x size / 1000) x pace`, shown as a range of −8% to
  +10%. `compact()` formats amounts as `$640k` or `$3.08M`.
- **Changing prices:** edit `rate` and `mult` values. Also update the matching price text on the option cards in
  `estimate.html` (for example `$215–$340 / ft²`, `+18–28%`) and the default numbers shown in the summary panel, which
  are what visitors see before the script runs.
- **Adding a project type:** add a key to `TYPES` and copy an option card in step 1 with
  `<input type="radio" name="type" value="your-key">`. The size limits, step, default size and help text come from
  `TYPES`, and are applied whenever the type changes.
- **Links in:** `estimate.html?type=renovation` preselects a type (used by the services and case study pages), and
  `estimate.html#request` opens the details step.
- **Accessibility:** each step is a `<fieldset>` with a `<legend>`; choices are real radio buttons and a checkbox, so
  arrow keys and Space work. The step buttons use `aria-current="step"`. Moving between steps puts focus on the new
  step's heading. Without JavaScript all steps are shown at once.

### Projects filter and search

On `projects.html`, the chips filter by `data-type` and the search box matches every typed word against `data-text`.
The count (`role="status"`) announces "Showing 2 of 9 projects", an empty state with a "Clear filters" button appears
when nothing matches, and the URL updates to `?type=...&q=...` with `history.replaceState`, so filtered views can be
shared or linked to (the services page links to `projects.html?type=commercial` and so on). Chips are buttons with
`aria-pressed`. The code is the "Projects: type filter + search" block in `main.js`.

### Before/after slider

On `project.html`, the after image sits underneath and the before image is clipped on top with
`clip-path: inset(...)` driven by the `--pos` custom property (`.before-after-clip` in `src/input.css`). An invisible
`<input type="range">` covers the image, so dragging, clicking, touch and arrow keys all work, and screen readers get
`aria-valuetext` such as "52% before, 48% after". The visible handle and the focus ring follow the range. To use it
elsewhere, copy the `[data-before-after]` block and use two images of the same size.

### Gallery lightbox

The gallery on `project.html` opens images in a native `<dialog>` (`[data-lightbox]`) with previous and next buttons,
arrow keys, Esc to close, a click on the backdrop to close and focus returned to the button that opened it. Image data
comes from the `data-lightbox-data` JSON block described in [Content](#content).

### FAQ accordion

`services.html` uses buttons with `aria-expanded` and `aria-controls` inside `[data-accordion]`; each answer is a
`role="region"` panel toggled with the `hidden` attribute. Several answers can be open at once. To open one by
default, set its button to `aria-expanded="true"` and remove `hidden` from its panel.

### Office open/closed status

Each office card on `contact.html` (`[data-office="milwaukee"]`) shows "Open now · until 5:30 pm" or "Closed · opens
tomorrow 7:00 am", worked out in the office's own time zone with `Intl.DateTimeFormat`:

```js
var OFFICE_HOURS = {
  milwaukee: { tz: 'America/Chicago', days: [null, [7, 17.5], [7, 17.5], [7, 17.5], [7, 17.5], [7, 16], null] },
  madison: { tz: 'America/Chicago', days: [null, [8, 17], [8, 17], [8, 17], [8, 17], [8, 17], null] }
};
```

Day 0 is Sunday; `null` means closed; hours are decimals (`17.5` is 5:30 pm). Keep these in step with the hours tables
in the HTML. Without JavaScript the badge reads "Office hours".

### Count-up stats, scroll reveals and line drawings

Elements with `.reveal` fade and rise into view, and `.draw` SVGs draw their lines, when they scroll into view
(IntersectionObserver in `main.js`). Anything above a revealed element is revealed too, so jumping with the End key or
an anchor never leaves hidden content. `[data-count]` numbers count up once when they appear. All three are skipped
when the visitor prefers reduced motion, and content is only hidden once the script has added the `js` class to
`<html>`, so nothing disappears without JavaScript.

### Header, mobile menu and back to top

The header is sticky and gains a shadow after scrolling. Below the `lg` breakpoint the menu button toggles
`#mobile-menu`, updating `aria-expanded` and its label; Esc closes it and returns focus to the button. A back-to-top
button appears after about one screen of scrolling and steps aside while the footer's "Back to top" link is visible.
On the estimator it lifts above the sticky price bar, which has `data-back-to-top-avoid`. To remove the button, delete
the last block in `main.js` and the `.back-to-top` rules in `src/input.css`.

## Forms

There are two forms. Both validate in the browser and **neither sends anything until you connect it**. Their
success panels confirm the request the way a real office would: the quote request shows a reference like
`CDB-26-1234` and says a project director will reply within one business day to book a site walk; the contact form
says which office the message reached, promises a reply within one business day (as the page already says) and
shows a reference like `CB-7K2Q` (`CB-` and four characters, made by `makeRef()` in `main.js`).

| Form | Where | Validation |
|------|-------|------------|
| Quote request (`data-quote-form`) | `estimate.html`, step 5 | Name, email, phone (10+ digits), site, ideal start, project notes (20+ characters), consent box |
| Contact (`data-contact-form`) | `contact.html` | Name, email, optional phone (10+ digits if filled), topic, nearest office, message (10+ characters) |

Validation is in `wireForm()` and `check()` in `main.js`. It reads standard attributes (`required`, `type="email"`,
`minlength`, required checkboxes) and a `data-validate` attribute:

| `data-validate` | Rule |
|-----------------|------|
| `phone` | At least 10 digits |
| `phone-optional` | At least 10 digits if anything is typed |

A `<fieldset data-group="name">` of radio buttons requires one to be chosen. Errors appear under each field as
`.field-error`, linked with `aria-describedby`, and the field gets `aria-invalid="true"`. On a failed submit, focus
moves to the first invalid field, and fields are rechecked as they are corrected.

### Connecting to Formspree

`wireForm(form, onValid)` only calls `onValid(form)` once everything is valid; the comment "To send for real, POST new
FormData(form) to your form service here" marks the spot. Create a form at Formspree, then post from the callback. For
the contact form, give it an `action`:

```html
<form class="reveal mt-8 grid gap-5 sm:grid-cols-2" data-contact-form novalidate action="https://formspree.io/f/your-form-id" method="POST">
```

and send it in the `[data-contact-form]` block of `main.js` before the form is reset:

```js
wireForm(form, function () {
  fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    .then(function (res) {
      if (!res.ok) throw new Error('Send failed');
      form.reset();
      form.classList.add('hidden');
      ok.classList.remove('hidden');
      ok.focus();
    })
    .catch(function () { alert('Sorry, your message could not be sent. Please call us.'); });
});
```

For the quote request, do the same inside `wireForm(quoteForm, ...)`. The estimator choices live in a separate form,
so append them to the data you send:

```js
var data = new FormData(form);
var r = estimate(state);
data.append('type', state.type);
data.append('size_ft2', state.size);
data.append('finish', state.finish);
data.append('timeline', state.timeline);
data.append('design', state.design ? 'yes' : 'no');
data.append('estimate', compact(r.low) + ' – ' + compact(r.high));
fetch('https://formspree.io/f/your-form-id', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
```

Both references are made in the browser at random; replace them with the ID your system returns, or remove them.
If you handle requests differently, change the "within one business day" promises in the success text (in
`estimate.html`, `contact.html` and the `onValid` callbacks in `main.js`) to match.

## Saved data (localStorage)

| Key | Shape | Written |
|-----|-------|---------|
| `keystone-estimate-v1` | `{"type": "commercial", "size": 12000, "finish": "standard", "timeline": "standard", "design": true}` | On every estimator change |

`readEstimate()` validates the stored value: `type`, `finish` and `timeline` must be keys of `TYPES`, `FINISH` and
`TIMELINE`; `size` must be a number within the type's `min` and `max` (otherwise the type's default size is used);
`design` must be a boolean. Anything else falls back to `DEFAULT_ESTIMATE`. Storage errors (private browsing, blocked
storage) are ignored. A `?type=` in the URL overrides the saved type.

To reset it, delete the key in your browser's developer tools (Application, Local Storage). If you change the shape
or rename types, change `ESTIMATE_KEY` (for example to `keystone-estimate-v2`) so old values are ignored. To stop
saving, remove the `saveEstimate(state)` call in `commit()`.

## SEO and sharing

Each page has its own `<title>`, `meta name="description"`, Open Graph title, description and image, a Twitter card
tag, `theme-color` and the SVG favicon, all in the `<head>`. Update them when you change the brand.

`og:image` is relative (`assets/img/og-image.png`) so the demo works anywhere, but social networks need an absolute
URL. After deploying, change it in every page:

```html
<meta property="og:image" content="https://www.your-domain.com/assets/img/og-image.png">
```

Also consider adding `<link rel="canonical">` and `og:url` per page, a `sitemap.xml` listing the eight pages and a
`robots.txt`. For a real firm, `LocalBusiness` or `GeneralContractor` structured data (JSON-LD) with your address,
phone and opening hours helps search engines show your details.

## Accessibility

Built in:

- Skip link, `header`/`nav`/`main`/`footer` landmarks, one `<h1>` per page and a logical heading order.
- Visible focus outlines in signal orange, including on custom radio cards and the before/after slider.
- Mobile menu with `aria-expanded`, `aria-controls` and Esc to close.
- Filter chips with `aria-pressed`, a live result count, accordion buttons with `aria-expanded`, estimator steps with
  `aria-current="step"` and a live estimate.
- Native `<dialog>` lightbox with keyboard support and focus return.
- Labeled form fields, inline errors linked with `aria-describedby`, and focus moved to the first error.
- Meaningful `alt` text on drawings; decorative SVG is `aria-hidden`. The safety chart has a screen-reader table.
- Reduced motion turns off reveals, line drawing, count-ups and smooth scrolling.
- Text colors meet WCAG AA contrast.

When editing, keep one `<h1>` per page, give every new input a `<label>`, keep orange text on light backgrounds at
`signal-700`, and keep the final value inside `[data-count]` spans.

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` is compiled from `src/input.css` and contains only the classes used in the HTML and JavaScript.
If you add Tailwind classes that aren't already used, rebuild it (Node.js 24):

```sh
npm install
npm run build    # one-off, minified
npm run watch    # rebuild on every change while you work
```

Tailwind scans the HTML files and `assets/js/main.js`. Classes that only appear in JavaScript strings must be written
out in full there (for example `bg-emerald-600`) so Tailwind can find them.

### Deploying

The site is static. Upload the folder (you can leave out `src/`, `package.json` and the Markdown files) to any static
host: Netlify Drop, Cloudflare Pages, GitHub Pages, Vercel, or ordinary web hosting. Most hosts serve `404.html` for
missing pages automatically; on others, point the host's custom error page setting at it.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| A new Tailwind class has no effect | Rebuild the CSS with `npm run build`. If the class is only in JavaScript, write it out in full in `main.js`. |
| The estimator shows old answers | They are saved in `localStorage`. Delete `keystone-estimate-v1` or change `ESTIMATE_KEY`. |
| Estimator card prices don't match the summary | The cards are plain HTML. Update their text when you change `TYPES`, `FINISH` or `TIMELINE`. |
| The office status says "Closed" during opening hours | Check `OFFICE_HOURS` (day 0 is Sunday, decimal hours) and the `tz` value for your city. |
| The before/after images don't line up | Use two images with exactly the same dimensions and framing. |
| Social previews show no image | Set an absolute `og:image` URL on your live domain. |
| Content stays invisible after editing | Elements with `.reveal` are hidden until scrolled into view. Make sure `assets/js/main.js` loads and has no errors in the browser console. |
| Fonts look different offline | Google Fonts need a connection; the system fallbacks are used otherwise. Self-host the fonts if needed. |

## License

MIT. Free for personal and commercial use, including client projects. The license text is in `LICENSE.txt` in the
download. All artwork (SVG drawings, portraits, icons, favicon and social image) is included under the same license.
Corbel Design-Build and every person, project and address in the template are fictional.
