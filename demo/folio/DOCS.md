# Folio documentation

## Overview

Folio is a dark, type-led portfolio for product designers, developers and small studios. The demo
content belongs to Mira Okafor, a fictional independent product designer in Lancaster, PA, with six sample
projects and one full case study. It is built with plain HTML5, Tailwind CSS v4 and a small vanilla
JavaScript file, so it runs without a build step. This guide covers version 1.1.10.

Live demo: [freeframe.dev/templates/folio](https://freeframe.dev/templates/folio)

## Quick start

1. Unzip the download and open `index.html` in a browser. Every page and link works straight from
   your computer.
2. For a setup closer to real hosting, serve the folder with any static server:

   ```sh
   cd folio
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

You only need Node.js 24 if you change `src/input.css` or add Tailwind classes that aren't used yet
(see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections |
|------|---------|------------------|
| `index.html` | Home | Oversized animated headline, local-time status line, selected work, services, client marquee, testimonial, call to action |
| `work.html` | All projects | Sticky category filter (All / Product / Web / Brand) with a live project count |
| `project.html` | Case study (Tidal Banking) | Facts, overview, challenge, process, screens, design system, results, next project |
| `about.html` | About | Bio, portrait, numbers, experience timeline, skills, awards |
| `contact.html` | Contact | Large email link with a copy button, FAQ, project inquiry form |
| `404.html` | Not found | Styled error page with links back |

## Project structure

```text
folio/
├── index.html, work.html, project.html, about.html, contact.html, 404.html
├── assets/
│   ├── css/style.css      compiled Tailwind CSS (generated: don't edit by hand)
│   ├── js/main.js         all interactions: menu, reveals, filter, clock, cursor, form, back to top
│   └── img/               SVG artwork, portrait, favicon and social image
├── src/input.css          Tailwind source: design tokens (@theme) and component classes
├── package.json           scripts to rebuild the CSS
├── template.json          template metadata used by freeframe.dev
├── README.md
├── CHANGELOG.md
└── DOCS.md                this guide
```

## Customizing

### Brand and colors

All colors and fonts are design tokens in the `@theme` block at the top of `src/input.css`:

| Token | Used for |
|-------|----------|
| `--color-bg` | Page background (`#0b0b0c`) |
| `--color-surface`, `--color-raised` | Cards and raised panels |
| `--color-line` | Borders and dividers |
| `--color-ink` | Main text |
| `--color-muted` | Secondary text |
| `--color-accent`, `--color-accent-soft` | Brand orange: links, highlights, the italic headline word, focus rings |

To switch the accent to a green, change the tokens and rebuild the CSS:

```css
@theme {
  --color-accent: #2fbf71;
  --color-accent-soft: #6fdc9f;
}
```

The `theme-color` meta tag in each page's `<head>` (`#0b0b0c`) colors the browser UI on phones; update
it if you change `--color-bg`.

### Typography

Folio uses **Inter Tight** (text and headings) and **Instrument Serif** (italic accents), loaded from
Google Fonts with a `<link>` in each page's `<head>`:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Inter+Tight:wght@300..800&display=swap">
```

To change fonts, replace that link on every page and update `--font-sans` and `--font-serif` in
`src/input.css`, then rebuild the CSS.

### Content

All text is plain HTML in the page files. Names, email address (`hello@example.com`) and the
city appear on several pages, so a project-wide search and replace is the quickest way to rebrand.

**Projects** are `<article>` cards. On `work.html` each card carries its categories:

```html
<article class="project-card-wrap reveal" data-category="web brand" style="--d:0ms">
  <a href="project.html" class="project-card group" data-cursor="View">
    ...
  </a>
</article>
```

- `data-category` holds one or more space-separated categories that must match a filter button.
- `style="--d:120ms"` staggers the reveal animation; alternate `0ms` and `120ms`.
- `data-cursor="View"` sets the label of the cursor badge for that card.

To add a project, copy an `<article>`, change the image, title, year and link, and update the count
in the matching filter button (`<sup>6</sup>`). The home page shows a hand-picked subset of the same
cards.

**Case studies:** `project.html` is one complete case study. Duplicate it once per project (for
example `project-verde.html`) and point each card's `href` at its copy. The "Next project" link at the
bottom is plain HTML.

**Local time:** the "Lancaster, PA · 12:00 PM" clocks are elements with `data-local-time`. The time zone is set
in `assets/js/main.js`:

```js
var fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
```

Change `timeZone` to any IANA zone (for example `America/Chicago`) and update the city text next to
each clock. Elements with `data-year` are filled with the current year.

**Rolling dates.** "Booking projects from November 2026" on the contact page is
`<span data-months-ahead="1">`: the script shows next month and its year, so the availability line never goes
stale. The month in the HTML is shown without JavaScript. To show a fixed month, replace the span with plain text.

### Images and artwork

All artwork in `assets/img/` is original SVG:

| File | Where | Aspect ratio |
|------|-------|--------------|
| `project-*.svg` | Project cards | 16:10 (1600×1000) |
| `tidal-screens.svg`, `tidal-system.svg` | Case study screens | 16:9 (1600×900) |
| `portrait.svg` | About page | Portrait |
| `favicon.svg` | Browser tab icon | Square |
| `og-image.svg` / `og-image.png` | Social sharing image | 1200×630 |

Replace them with your own screenshots or photos (`.jpg`/`.webp`) at the same aspect ratio, update the
`src`, `width`/`height` and `alt` text, and keep `loading="lazy"` on images below the fold.

### Navigation, header and footer

The header, mobile menu and footer are repeated in every HTML file. To add a page:

1. Copy an existing page (for example `about.html`) and replace the content inside `<main id="main">`.
2. Add a link to the desktop menu (`<nav aria-label="Main">`) and the mobile menu
   (`<div id="mobile-menu">`) on **every** page.
3. Mark the current page's links with `aria-current="page"`; the styles highlight it.

## Features

### Animated headline and scroll reveals

Elements with `reveal` (fade and rise) or `reveal-line` (the headline's line-by-line mask) start hidden
and get `is-visible` when they scroll into view. The script uses `IntersectionObserver` and shows
everything immediately for visitors who prefer reduced motion. Delay an element with the `--d` custom
property, for example `style="--d:240ms"`.

### Work filter

The filter on `work.html` is a `role="group"` with `data-filter-group`. Each button has
`data-filter="product"` and `aria-pressed`; `data-filter="all"` shows everything. Clicking a button:

- shows cards whose `data-category` contains that value and fades the rest out;
- updates the count in `[data-filter-count]` (zero-padded, e.g. `03`);
- writes the filter to the URL hash, so `work.html#brand` opens with Brand selected.

To add a category, add a button with a new `data-filter` value and use the same value in cards'
`data-category`. With reduced motion the cards are hidden and shown without animation.

### Cursor badge

On devices with a mouse or trackpad, a round "View" badge follows the pointer over any element with
`data-cursor`. It's created by the "Cursor follower" block in `assets/js/main.js`, is `aria-hidden`, and
is not created at all on touch devices or with reduced motion. Remove the `data-cursor` attributes (or
that block) to turn it off.

### Mobile menu

Below 768px the `.menu-toggle` button opens a full-screen menu (`#mobile-menu`). It updates
`aria-expanded` and its label, locks page scrolling, moves focus to the first link and closes with
**Esc** (returning focus to the button) or when the window grows to desktop width.

### Client marquee

The scrolling client strip on the home page uses the `--animate-marquee` token (38 seconds per loop)
and pauses on hover. Reduced motion stops it.

### Copy email button

Any button with `data-copy="hello@example.com"` copies that value to the clipboard and briefly changes
its `[data-copy-label]` text to "Copied" (or "Press Ctrl+C" if the browser blocks clipboard access).
Change the attribute when you change the email address.

### Back to top button

Every page gets a "Back to top" button in the bottom-right corner, created by the "Back to top" block at
the end of `assets/js/main.js` and styled by the `.back-to-top` rules at the end of `src/input.css`.

- It appears after about one screen of scrolling and hides while the footer's own "Back to top" link
  is on screen.
- It scrolls to the top (instantly with reduced motion) and moves keyboard focus to `<main>`.
- Add `data-back-to-top-avoid` to anything you pin to the bottom of the screen (a cookie bar, chat
  launcher) and the button sits above it; add `data-back-to-top-hide` to a sticky element it must
  never cover.
- To remove it, delete that JavaScript block and the CSS rules, then rebuild the CSS.

## Forms

`contact.html` has one form, marked `data-validate`. It collects:

| Field | `name` | Rule |
|-------|--------|------|
| Project type | `type` (checkboxes) | Optional |
| Name | `name` | At least 2 characters |
| Email | `email` | Valid email format |
| Company | `company` | Optional |
| Budget | `budget` | A range must be chosen |
| Timeline | `timeline` | A timeline must be chosen |
| Message | `message` | At least 20 characters |

Errors appear under each field (in `#<name>-error`, announced to screen readers), fields get
`aria-invalid`, and the first invalid field is focused. On success the form is hidden and
`#form-success` is shown with the sender's first name and a short reference (`MO-` and four characters,
made in the browser; use your form service's own reference instead if it returns one). The message promises
a reply within two business days, like the "Response time" on the page: change both if yours differs.

**The form doesn't send anything until you connect it.** To use a form service such as
[Formspree](https://formspree.io):

1. Set the form's `action` to your endpoint:

   ```html
   <form class="space-y-10 reveal" action="https://formspree.io/f/your-id" method="post" novalidate data-validate>
   ```

2. In `assets/js/main.js`, find the comment `// Demo only: nothing is sent.` inside the submit handler
   and send the data before showing the success message:

   ```js
   fetch(form.action, {
     method: 'POST',
     body: new FormData(form),
     headers: { Accept: 'application/json' }
   }).then(function (res) {
     if (!res.ok) throw new Error('Request failed');
     form.hidden = true;
     success.hidden = false;
     success.focus();
   }).catch(function () {
     alert('Sorry, the message could not be sent. Please email hello@example.com.');
   });
   ```

Netlify Forms also works: add `data-netlify="true"` and `name="inquiry"` to the `<form>` and deploy to
Netlify.

## SEO and sharing

Each page's `<head>` has its own `<title>`, `meta name="description"`, Open Graph tags
(`og:title`, `og:description`, `og:image`, `og:site_name`) and `twitter:card`. Update them for every
page.

`og:image` points to `assets/img/og-image.png` with a relative path. Social networks need an absolute
URL, so change it when you deploy:

```html
<meta property="og:image" content="https://example.com/assets/img/og-image.png">
```

The PNG's editable source is `assets/img/og-image.svg`; export it again at 1200×630 after editing. For
search engines, add a `sitemap.xml` listing your pages and a `robots.txt` at the root of your site.

## Accessibility

- A "Skip to content" link jumps to `<main id="main">`; focus rings use the accent color.
- Landmarks (`header`, `nav` with labels, `main`, `footer`) and one `<h1>` per page.
- Filter buttons use `aria-pressed`; the mobile menu uses `aria-expanded` and closes with Esc.
- Form errors are linked with `aria-describedby` and announced with `aria-live`.
- The cursor badge, marquee and reveal animations respect `prefers-reduced-motion`.

When editing, keep one `<h1>` per page, give every new image meaningful `alt` text (or `alt=""` if
decorative), label every new input, and keep text contrast at WCAG AA against the dark background.

## Building and deploying

`assets/css/style.css` is pre-built, so you can edit HTML and text without any tools. Rebuild it only
when you change `src/input.css` or use Tailwind classes that aren't in the CSS yet. With Node.js 24:

```sh
npm install
npm run build     # one-off build, minified
npm run watch     # rebuild automatically while you edit
```

Folio is a static site. Upload the folder (without `node_modules/`) to any static host:

- **Netlify Drop:** drag the folder onto app.netlify.com/drop.
- **GitHub Pages:** push it to a repository and enable Pages for the branch.
- **Cloudflare Pages:** create a project with "Direct upload". No build command is needed.

Most hosts serve `404.html` automatically for missing pages.

## Troubleshooting

- **New Tailwind classes have no effect.** The CSS only contains classes that were in use when it was
  built. Run `npm run build`.
- **A filter button shows nothing.** The card's `data-category` must contain exactly the button's
  `data-filter` value (lowercase, space-separated).
- **`work.html#web` doesn't preselect a filter.** The hash must match a button's `data-filter`.
- **The form shows its thank-you message but nothing arrives.** It sends nothing until you connect it; see
  [Forms](#forms).
- **The clock shows the wrong time.** Change `timeZone` in `assets/js/main.js`.
- **Shared links have no preview image.** Use an absolute URL in `og:image`.
- **Animations don't play.** Your system has reduced motion turned on; content is shown without
  animation by design.

## License

Folio is released under the MIT License (see `LICENSE.txt` in the download). You can use it for
personal and commercial projects. The included SVG artwork is covered by the same license. Inter Tight
and Instrument Serif are licensed under the SIL Open Font License.
