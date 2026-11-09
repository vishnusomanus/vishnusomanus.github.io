# Agency documentation

## Overview

Agency is a complete website for a creative or digital agency, built for the fictional **Northbound
Studio** (Birmingham, AL, Oakland and New York). It has a big-type home page with a rotating word, marquee and
testimonial carousel, services with engagement models and price ranges, a filterable work page, a full
case study with a before/after slider, an about page with team portraits, a careers page with filterable
roles and an application form, and a detailed project-brief contact form. This is the HTML + Tailwind CSS
v4 version, **version 1.1.9**. See it live at
[freeframe.dev/templates/agency](https://freeframe.dev/templates/agency).

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Every page and link works straight from your computer.
3. For a closer match to a real host, serve the folder:

   ```sh
   cd agency
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

No build step is needed to use or edit the text. Node.js 24 is only needed to rebuild the CSS (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Page | What's on it |
|------|------|--------------|
| `index.html` | Home | Line-by-line headline with a rotating word, featured project, services marquee, client logos, services list, selected work, process, count-up numbers and awards, testimonial carousel |
| `services.html` | Services | Four services with deliverables, timelines and linked case studies, three engagement models with price ranges, FAQ |
| `work.html` | Work | All six case studies with an industry filter; `work.html#retail` opens it filtered |
| `case-study.html` | Case study | The Kite Mobility project: facts, challenge, before/after slider, approach, brand system and app screens, results, quote, credits, next project |
| `about.html` | About | Studio illustration, story timeline, values, eight team portraits |
| `careers.html` | Careers | Perks, seven open roles with a team filter and expandable details, application form |
| `contact.html` | Contact | Project-brief form, email addresses, three studios with live local times |
| `404.html` | Not found | Not-found page |

## Project structure

```text
agency/
├─ index.html, services.html, work.html, case-study.html, about.html, careers.html, contact.html, 404.html
├─ assets/
│  ├─ css/style.css        compiled Tailwind CSS (generated: don't edit by hand)
│  ├─ js/main.js           all interactivity, vanilla JavaScript, no dependencies
│  └─ img/
│     ├─ case-*.svg        case study covers (1600×1000)
│     ├─ kite-*.svg        case study images (before, brand system, app screens)
│     ├─ team-1…8.svg      team portraits (400×480)
│     ├─ studio.svg        about page illustration
│     ├─ favicon.svg       browser tab icon
│     ├─ og-image.svg      editable source of the social sharing image
│     └─ og-image.png      1200×630 social sharing image
├─ src/input.css           Tailwind source: brand tokens, component classes, back-to-top styles
├─ package.json            scripts to rebuild assets/css/style.css
└─ README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

The brand tokens are the `@theme` block at the top of `src/input.css`:

```css
@theme {
  --color-paper: #f1efe9;      /* page background */
  --color-paper-2: #e7e4dc;    /* sunken panels */
  --color-ink: #0e0e0c;        /* text and dark sections */
  --color-muted: #5f5c55;      /* secondary text */
  --color-line: #d4d0c5;       /* hairlines on paper */
  --color-cobalt: #2b36f5;     /* primary accent */
  --color-cobalt-600: #1f28c9;
  --color-lime: #d4ff3f;       /* highlight accent, used on dark */
}
```

Each token becomes Tailwind utilities (`bg-paper`, `text-ink`, `text-muted`, `border-line`,
`text-cobalt`, `bg-lime`...). To rebrand, change `--color-cobalt` (and its darker `-600` hover shade) and
`--color-lime`, then rebuild the CSS. Keep text on `paper` and `ink` at WCAG AA contrast.

Component classes in `src/input.css`: `.btn` with `.btn-primary`, `.btn-outline`, `.btn-lime`,
`.btn-ghost-dark`; `.chip` (filter buttons); `.eyebrow` (small monospace labels); `.display-xl` and
`.display-lg` (big headings); `.field`, `.label`, `.field-error`, `.check-tile` (forms); `.case-card`,
`.link-u` (underlined links), `.marquee`, `.rotator`, `.compare`, `.slide`, `.dot`, `.role`.
Sections with a dark background use the `on-dark` class, which switches focus rings to lime.

### Typography

Three Google Fonts are loaded by one `<link>` in each page's `<head>`: **Bricolage Grotesque**
(headings), **Inter** (body) and **JetBrains Mono** (labels). They map to `--font-display`,
`--font-sans` and `--font-mono` in `@theme`. To swap one, change the Google Fonts URL on every page and
the matching token, then rebuild the CSS.

### Content

All text is in the HTML files; there is no separate data file.

- **Headline**: each line of the home page headline is a `<span class="line-mask"><span>` that slides up
  on load; the `--d` style sets each line's delay. The rotating word is a
  `<span class="rotator" data-rotator>` containing one `<span>` per word; the first has `is-active`.
- **Case studies** on `work.html` are `<article class="case-card" data-industry="...">`. The industry
  must match one of the filter buttons' `data-filter` values (`mobility`, `fintech`, `food`, `health`,
  `media`, `retail`). Add a case:

  ```html
  <article class="case-card reveal" data-industry="retail">
    <a href="case-study.html" class="group block">
      <div class="case-media aspect-[16/10]">
        <img src="assets/img/case-yourbrand.jpg" alt="Your project artwork" width="1600" height="1000" loading="lazy">
      </div>
      <!-- client and year, title, discipline: copy the rest from an existing card -->
    </a>
  </article>
  ```

  Add a new filter button too if you introduce a new industry; the counts update automatically.
- **Numbers** on the home page count up from zero: `data-count-to="140"` with an optional
  `data-suffix="+"` (whole numbers only). Keep the final value as the element's text.
- **Open roles** on `careers.html` are `<details class="role" data-department="design">` elements. The
  department must match a `data-filter` button (`design`, `engineering`, `strategy`, `operations`). The
  "Apply for this role" link has `data-apply="Role name"`; that exact text must also be an `<option>` in
  the `#apply-role` select so it can be preselected.
- **Office clocks**: any element with `data-tz="America/Los_Angeles"` (an IANA time zone) shows that city's
  current time, updated every 30 seconds.

### Images and artwork

All artwork is SVG in `assets/img/`. To use photos, keep the proportions and change the `src`:

| Image | Size / ratio |
|-------|--------------|
| Case study covers (`case-*.svg`) | 1600×1000 (16:10) |
| Team portraits (`team-*.svg`) | 400×480 (5:6) |
| Case study images (`kite-*.svg`) | 16:10 |
| Social image (`og-image.png`) | 1200×630 |

`.jpg` and `.webp` work fine. Write meaningful `alt` text for each photo. The before/after slider on
`case-study.html` uses `kite-before.svg` and `case-kite.svg`; both must have the same aspect ratio (16:10).

### Navigation, header and footer

The header (with its full-screen mobile menu `#mobile-menu`) and the dark footer are repeated in every
HTML file. To add a page, copy an existing one, update its `<title>`, description and Open Graph tags,
and add the link to the desktop nav, the mobile menu and the footer on **every** page. Mark the current
page's links with `aria-current="page"`. Find-and-replace across files is the quickest way to change
shared content.

## Features

### Header and mobile menu

`.site-header` turns solid once the page scrolls more than 12px. Below 1024px the menu button
(`[data-menu-button]`) opens a full-screen `#mobile-menu`: focus moves to its first link, page scrolling
is locked, Escape closes it and returns focus to the button, and it closes when the window grows past
1024px.

### Headline and rotating word

On load, `main.js` adds `is-loaded` to `<body>`, which slides each `.line-mask` line into place. The
rotating word cycles every 2.6 seconds. With reduced motion, the headline appears immediately and the
word doesn't rotate (the first word stays).

### Marquee and logo wall

The services marquee scrolls continuously with the `--animate-marquee` animation (38 seconds per loop)
defined in `@theme`. Its track is duplicated for a seamless loop and marked `aria-hidden="true"`; the
real list of services is elsewhere on the page. It stops with reduced motion.

### Scroll reveal and count-up

`.reveal` elements fade in as they scroll into view. When one reveals, everything above it reveals too,
so jumping to an anchor never leaves hidden content. Counters (`[data-count-to]`) count up over 1.6
seconds. With reduced motion everything shows immediately.

### Testimonial carousel

The `[data-carousel]` region on the home page has slides (`[data-slide]`), dots (`[data-dot]`), previous
/ next buttons (`[data-prev]`, `[data-next]`) and a pause/play button (`[data-carousel-toggle]`).

- It advances every 7 seconds and pauses while the pointer is over it or focus is inside it.
- Left and Right arrow keys move between slides; a live region (`[data-carousel-status]`) announces
  "Testimonial 2 of 3" when you change slides yourself.
- Hidden slides are `aria-hidden` and `inert`; the current dot has `aria-current`.
- With reduced motion it starts paused.

To add a testimonial, copy a `<figure class="slide" data-slide>` and add a matching `[data-dot]` button.

### Filters (work and careers)

A filter is a group with `data-filter-group="<key>"` containing buttons with `data-filter="<value>"`
(and `data-filter="all"`). Items anywhere on the page with `data-<key>="<value>"` are shown or hidden.
Each button's `.count` shows how many items match, `[data-filter-count="<key>"]` shows the result count,
and `[data-filter-empty="<key>"]` appears when nothing matches. The chosen filter is written to the URL
hash, so `work.html#fintech` or `careers.html#engineering` can be shared.

### Before / after slider

On `case-study.html`, `[data-compare]` contains two images and a native range input
(`#compare-range`). Dragging or using the arrow keys sets the `--pos` custom property that reveals the
"before" image. Because it's a real `<input type="range">`, it works with keyboards and screen readers.

### Careers roles

Each role is a native `<details>` element, so it expands with a click, Enter or Space. "Apply for this
role" jumps to the form and preselects the role in `#apply-role`.

### Contact budget slider

`#budget` is a range input with five steps; `main.js` shows the matching label in `[data-budget-out]`
and sets `aria-valuetext`. Change the labels in the `steps` array in the "Contact: budget slider label"
block of `assets/js/main.js`:

```js
var steps = ['Under $25k', '$25k – $50k', '$50k – $100k', '$100k – $250k', '$250k+'];
```

Keep the input's `max` equal to the number of steps minus one.

### Back to top button

Every page gets a "Back to top" button, created by the last block in `assets/js/main.js` and styled by
the `.back-to-top` rules at the end of `src/input.css`. It appears after scrolling about one screen,
returns to the top (instantly with reduced motion) and moves keyboard focus to `#main`. It lifts above
anything marked `data-back-to-top-avoid`, hides while the footer's own "Back to top" link is visible or
while it would cover a pinned element marked `data-back-to-top-hide`, and is hidden when printing. To
remove it, delete the JavaScript block and the CSS block, then rebuild the CSS.

## Forms

Forms with `data-validate` are checked in the browser. Error messages are created next to each field
(inside its `[data-field]` wrapper), the field gets `aria-invalid` and `aria-describedby`, and focus moves
to the first problem. Checkbox groups marked `data-required-group="message"` need at least one checked
box. A valid form hides itself and shows the `[data-success]` panel next to it; `[data-reset-form]`
brings the form back. The panel's `[data-ref]` shows a short reference (`NS-` and four characters, made in
the browser by `makeRef()`; use your form service's own reference instead if it returns one). The panels say
what happens next, using the reply times the pages already promise (a partner replies to inquiries within
two business days, applications get a reply within ten business days): change both if yours differ.

| Form | Page | Fields and rules |
|------|------|------------------|
| Project brief | `contact.html` | Name, email, company (all required); services checkboxes (at least one, `#services-group`); budget range; timeline (required); message (required, 20+ characters); "how did you hear about us" (optional) |
| Application | `careers.html` | Name, email, role (required); portfolio link (required, must be a full `https://` URL); location (optional); note (required, 30+ characters); consent checkbox (required) |

**The forms don't send anything yet.** To receive submissions with a service such as
[Formspree](https://formspree.io):

1. Give the form an action: `<form ... data-validate action="https://formspree.io/f/your-id" method="POST">`.
2. In `assets/js/main.js`, find the comment `// Demo only: nothing is sent.` in the form `submit` handler
   and replace the lines after it with:

   ```js
   var success = $('[data-success]', form.parentNode);
   var ref = $('[data-ref]', success);
   if (ref) ref.textContent = makeRef();
   fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
     .then(function (res) {
       if (!res.ok) throw new Error('Request failed');
       form.hidden = true;
       success.hidden = false;
       success.focus();
     })
     .catch(function () { alert('Sorry, something went wrong. Please email us instead.'); });
   ```

All fields have `name` attributes, and the services checkboxes share `name="services"`, so the service
receives every checked value.

## Saved data (localStorage)

This template doesn't store anything in the browser.

## SEO and sharing

Each page has its own `<title>`, `<meta name="description">`, Open Graph tags and `twitter:card` in its
`<head>`.

- **Social image**: `og:image` points to `assets/img/og-image.png` with a relative path. Social networks
  need an absolute URL, so change it on every page when you deploy, e.g.
  `https://example.com/assets/img/og-image.png`. The editable source is `assets/img/og-image.svg`;
  re-export it as a 1200×630 PNG after changing it.
- **Canonical URLs, sitemap and robots**: add `<link rel="canonical">` to each page, plus a
  `sitemap.xml` and `robots.txt` at the site root, once you know your domain.

## Accessibility

Built in:

- A skip link (`.skip-link`) to `#main`, landmarks, and visible focus rings (cobalt on paper, lime on
  dark sections).
- Keyboard support for the menu, carousel (arrow keys, pause button), filters (`aria-pressed`),
  before/after slider (native range input) and roles (native `<details>`).
- The carousel follows the ARIA carousel pattern with a live status message and inert hidden slides.
- Form errors are linked to their fields with `aria-describedby`; the budget slider has `aria-valuetext`.
- Reduced motion: no headline animation, rotating word, marquee, reveals, count-ups or auto-advancing
  carousel.
- WCAG AA contrast throughout.

When editing, keep one `<h1>` per page, keep heading levels in order, label every new field, and give
every image meaningful `alt` text (or `alt=""` if purely decorative).

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` only contains the classes the pages use. Rebuild it when you change
`src/input.css` or add Tailwind classes that aren't in the template yet:

```sh
npm install
npm run build   # or: npm run watch
```

### Deploying

The template is static files. Upload the folder to any host: Netlify (drag and drop at
app.netlify.com/drop), GitHub Pages, Cloudflare Pages (direct upload, no build command) or your own
server. Most hosts serve `404.html` for missing pages automatically.

## Troubleshooting

- **A filter shows no items.** The items' `data-<key>` values must match the buttons' `data-filter`
  values exactly (lowercase), and the group must have `data-filter-group="<key>"`.
- **"Apply for this role" doesn't preselect the role.** The `data-apply` text must match an `<option>`
  value in `#apply-role` exactly.
- **An office clock shows `--:--`.** The `data-tz` value isn't a valid IANA time zone name.
- **New Tailwind classes have no effect.** Run `npm run build`; the compiled CSS only has existing
  classes.
- **The carousel keeps moving while I read it.** It pauses on hover and focus; add more time by changing
  the `7000` in the "Testimonial carousel" block.
- **Link previews have no image.** Make `og:image` an absolute URL to the PNG.
- **Fonts look different.** Check the Google Fonts `<link>` is still in the page's `<head>`.

## License

MIT. The code and all included artwork are free for personal and commercial use; the download includes
the license text in `LICENSE.txt`. The fonts are licensed under the SIL Open Font License.
