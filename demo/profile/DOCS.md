# Profile documentation

## Overview

Profile is a developer portfolio with a résumé, projects, writing and a ⌘K command palette. The demo
person is **Sam Lindqvist**, a fictional engineer. It pairs a printable résumé and a filterable project
gallery with a writing archive, a `/uses` page and a validated contact form, with persistent dark mode
and keyboard-first navigation. It is built with HTML5, Tailwind CSS v4 and vanilla JavaScript, and needs
no build step. This guide covers version 1.1.12.

Live demo: [freeframe.dev/templates/profile](https://freeframe.dev/templates/profile)

## Quick start

1. Unzip the download and open `index.html` in a browser.
2. Or serve the folder with any static server:

   ```sh
   cd profile
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

Node.js 24 is only needed to rebuild the CSS (see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections |
|------|---------|------------------|
| `index.html` | Home | Intro, /now, highlights, selected projects, latest writing |
| `resume.html` | Résumé | Experience, skills, education; print stylesheet for a clean PDF |
| `projects.html` | Projects | GitHub-style stats, contribution graph, technology filter, project cards |
| `project.html` | Project case study | Case study for "tinytable" |
| `writing.html` | Writing | Posts grouped by year with instant search |
| `post.html` | Blog post | "The quiet power of `<dialog>`" |
| `uses.html` | Uses | Hardware, software and editor setup |
| `contact.html` | Contact | Validated contact form, availability, copy-email button |
| `404.html` | Not found | Error page with links back |

## Project structure

```text
profile/
├── index.html, resume.html, projects.html, project.html, writing.html,
│   post.html, uses.html, contact.html, 404.html
├── assets/
│   ├── css/style.css      compiled Tailwind CSS (generated)
│   ├── js/main.js         theme, menu, command palette, reveals, filters, search, print, contact form, back to top
│   └── img/               avatar.svg, favicon, social image
├── src/input.css          Tailwind source: accent and font tokens, component classes, print styles
├── package.json           scripts to rebuild the CSS
├── template.json          template metadata used by freeframe.dev
├── README.md
├── CHANGELOG.md
└── DOCS.md                this guide
```

## Customizing

### Brand and colors

The accent color is a scale in the `@theme` block at the top of `src/input.css`
(`--color-accent-50` to `--color-accent-900`, teal by default). Neutrals use Tailwind's `zinc` palette.
Replace the accent scale to re-color links, focus rings, eyebrows and the contribution graph, then
rebuild the CSS:

```css
@theme {
  --color-accent-500: #8b5cf6;
  --color-accent-600: #7c3aed;
  --color-accent-700: #6d28d9;
}
```

Component classes (`.btn-primary`, `.card`, `.chip`, `.link`, `.nav-link`, `.field`...) are in the
`@layer components` block of the same file. Update the two `theme-color` meta tags in each page's
`<head>` if you change the page background.

### Typography

Text uses **Inter** (`--font-sans`) and labels and code use **JetBrains Mono** (`--font-mono`), loaded
from Google Fonts in each page's `<head>`. Replace that `<link>` on every page and the two tokens to
change them.

### Content

All words are in the HTML. Search and replace "Sam Lindqvist" and `sam@example.com` across the folder
(including `<meta name="author">`). Things driven by attributes or scripts:

- **Projects** on `projects.html`: each card in `[data-project-grid]` has comma-separated tags with no
  spaces, `data-tags="React,CSS,TypeScript"`. Each filter button has `data-filter="React"` (plus one with
  `data-filter="All"`); the tag must match exactly.
- **Posts** on `writing.html`: each `<li data-post data-search="...">` sits in a year
  `<section data-year-group>`. `data-search` is the lowercase text the search looks in, so include the
  title and keywords, as plain text with no HTML tags: `data-search="design tokens that survive a rebrand design systems"`.
- **Command palette pages**: `PAGES` in the "Command palette" section of `assets/js/main.js`:

```js
var PAGES = [
  { label: 'About', hint: 'Home page', href: 'index.html' },
  { label: 'Résumé', hint: 'Experience, skills, education', href: 'resume.html' },
  // ...
  { label: 'Toggle dark mode', hint: 'Action', action: toggleTheme }
];
```

Add an entry with `href` for a page, or `action` (a function) for a command.

- **Stats and contribution graph** on `projects.html`: the numbers are plain HTML, and the graph
  (`[data-contrib]`) is decorative sample data generated in `assets/js/main.js` (it is `aria-hidden`).
  Replace it with real data or remove it.

**Rolling dates.** "Full-time roles from January 2027" on the contact page is `<span data-months-ahead="3">`:
the script shows the month three months from now and its year, so the line never goes stale. The month in the HTML is
shown without JavaScript. To show a fixed month, replace the span with plain text.

### Images and artwork

The portrait is `assets/img/avatar.svg`; replace it with your photo (square) and update the `src` if the
extension changes. The favicon is `assets/img/favicon.svg`; the social image is `assets/img/og-image.png`
(1200×630), exported from `assets/img/og-image.svg`.

### Navigation, header and footer

The header (with the palette button, theme toggle and menu button), mobile menu (`#mobile-menu`) and
footer are repeated in every page. To add a page, copy one, replace the content inside `<main>`, add the
link to the desktop and mobile menus on every page with `aria-current="page"` on the current one, and add
it to `PAGES`.

### Dark mode

An inline script in each page's `<head>` adds the `dark` class to `<html>` before the first paint, from
the saved choice or, if there is none, the system setting. The toggle (`data-theme-toggle`, with
`aria-pressed`) and the palette's "Toggle dark mode" switch it and save the choice (see
[Saved data](#saved-data-localstorage)). Until a visitor chooses, the site follows system changes live.
Dark styles use the `dark:` variant, which follows the `.dark` class.

## Features

### Command palette

Press **Ctrl K** or **⌘ K**, or click the search button (`data-palette-open`), to open a native
`<dialog>` listing `PAGES`. Typing filters labels and hints; **Up/Down** move, **Enter** opens, **Esc** or
clicking the backdrop closes it. The keyboard hint (`data-kbd`) shows "⌘K" on Apple devices and "Ctrl K"
elsewhere.

### Printable résumé

`resume.html` has a print button (`data-print`). The `@media print` block in `src/input.css` hides the
header, footer and anything with `.no-print`, and the page uses `print:` utility classes for a clean
résumé. Add `print-break-avoid` to blocks that shouldn't split across pages. Opening `resume.html#print`
prints after load. The palette's "Print résumé" opens that URL from other pages and prints straight away
when you're already on the résumé.

### Project filter

On `projects.html`, the filter buttons (`data-filter`, `aria-pressed`) show only cards whose `data-tags`
include the tag and update `[data-filter-status]` ("Showing 2 projects tagged React"), which is announced
to screen readers.

### Writing search

On `writing.html`, typing in `[data-post-search]` hides posts whose `data-search` doesn't contain the
text, hides empty year groups and shows `[data-post-empty]` when nothing matches.

### Copy email

On `contact.html`, the copy button (`data-copy-email`) copies the text of `[data-email]` and reports in
`[data-copy-status]`; if copying isn't allowed it selects the address and suggests **Ctrl+C** / **⌘C**.

### Scroll reveals

Elements with `reveal` fade in as they scroll into view, and everything above them is revealed too. They
show immediately with reduced motion and when printing.

### Mobile menu

The menu button (`data-menu-toggle`) opens `#mobile-menu`, updates `aria-expanded` and its label, closes
with **Esc** (returning focus to the button) and closes itself on wide screens.

### Back to top button

Every page gets a "Back to top" button in the bottom-right corner, created by the "Back to top" block at
the end of `assets/js/main.js` and styled by the `.back-to-top` rules at the end of `src/input.css`. It
appears after about one screen of scrolling, scrolls to the top (instantly with reduced motion), moves
focus to the main content and steps aside while an in-page "Back to top" link is on screen. It is hidden
when printing. Add `data-back-to-top-avoid` to anything you pin to the bottom of the screen, or
`data-back-to-top-hide` to a sticky element it must never cover. To remove it, delete that JavaScript
block and the CSS rules, then rebuild the CSS.

## Forms

The contact form (`[data-contact-form]` on `contact.html`) has these fields:

| Field | Rule |
|-------|------|
| `name` | Required |
| `email` | Required, must look like an email address |
| `topic` | Required choice |
| `message` | Required, at least 20 characters (with a live character count in `[data-count]`) |

Rules and messages are in the `rules` object in the "Contact form validation" section of
`assets/js/main.js`. Each field shows its message in `#<name>-error` and gets `aria-invalid`; the first
problem is focused. On success the form is replaced by `[data-form-success]` (focused), and "Write
another" (`data-form-reset`) brings the empty form back. The success message promises a reply within two
business days, like the intro on the page, and shows a short reference in `[data-ref]` (`SL-` and four
characters with no 0/O or 1/I, like SL-7K2Q, made in the browser just above `form.hidden = true`). Use your
form service's own reference instead if it returns one, and change the reply time in both places if yours
differs.

**Nothing is sent until you connect the form.** To connect the form to Formspree, add the endpoint to the form:

```html
<form data-contact-form novalidate class="grid gap-5" action="https://formspree.io/f/your-id" method="POST">
```

then, in the submit handler (below the comment "To send for real"), post the data before showing
success:

```js
fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  .then(function (res) {
    if (!res.ok) throw new Error('Request failed');
    form.hidden = true;
    success.hidden = false;
    success.focus();
  });
```

## Saved data (localStorage)

| Key | Value | Purpose |
|-----|-------|---------|
| `theme` | `"dark"` or `"light"` | The visitor's theme choice |

Any other stored value is ignored and the system setting is used.
The key is generic; if other sites share your domain, rename it (for example `profile-theme`) in
`assets/js/main.js` and in the inline script in every page's `<head>`. Reset with
`localStorage.removeItem('theme')`.

## SEO and sharing

Each page has its own `<title>`, meta description, `<meta name="author">`, Open Graph tags and
`twitter:card`. When you deploy, change `og:image` on every page to an absolute URL:

```html
<meta property="og:image" content="https://example.com/assets/img/og-image.png">
```

Consider [Person structured data](https://schema.org/Person) (name, job title, `sameAs` links to your
profiles) as JSON-LD on `index.html`, a `sitemap.xml`, and an RSS feed for your writing.

## Accessibility

- Skip link, landmarks, one `<h1>` per page and visible accent focus outlines.
- Muted text meets WCAG AA contrast in both themes.
- The command palette is a native modal `<dialog>` with a combobox and listbox (`aria-activedescendant`).
- The theme toggle and project filters use `aria-pressed`; filter results and copy status are announced.
- Form errors are linked with `aria-describedby`; the success message receives focus.
- The decorative contribution graph is hidden from screen readers.
- Reveals, smooth scrolling and transitions respect `prefers-reduced-motion`.

## Building and deploying

`assets/css/style.css` is pre-built. Rebuild it after editing `src/input.css` or using Tailwind classes
that aren't in the CSS yet, including classes inside the HTML strings in `assets/js/main.js`. With
Node.js 24:

```sh
npm install
npm run build     # or: npm run watch
```

Profile is a static site: upload the folder (without `node_modules/`) to Netlify, GitHub Pages,
Cloudflare Pages or any web host. No build command is needed on the host.

## Troubleshooting

- **A project disappears for its own tag.** `data-tags` must be comma-separated with no spaces and match
  the button's `data-filter` exactly, including capitals.
- **A post can't be found by search.** Add the words to its `data-search` attribute, in lowercase.
- **A new page is missing from ⌘K.** Add it to `PAGES` in `assets/js/main.js`.
- **The printed résumé shows the header or extra pages.** Add `no-print` to elements to hide and
  `print-break-avoid` to blocks that shouldn't split.
- **New Tailwind classes have no effect.** Rebuild the CSS.
- **The form shows its thank-you message but nothing arrives.** It sends nothing until you connect it; see
  [Forms](#forms).

## License

Profile is released under the MIT License (see `LICENSE.txt` in the download), for personal and
commercial use. The included SVG artwork is covered by the same license. Inter and JetBrains Mono are
licensed under the SIL Open Font License. Sam Lindqvist is fictional.
