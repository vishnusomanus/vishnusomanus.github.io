# Ledger documentation

## Overview

Ledger is an editorial magazine template for long-form writing. The demo publication is **The Ledger**, a
fictional independent magazine of essays about software, design, craft and attention. It has a featured
front page, a long-form article layout with an automatic table of contents and reading progress, a
searchable archive, topic pages, a masthead and a contact page, with typography tuned for reading in light
and dark mode. It is built with HTML5, Tailwind CSS v4 and vanilla JavaScript, and needs no build step.
This guide covers version 1.1.10.

Live demo: [freeframe.dev/templates/ledger](https://freeframe.dev/templates/ledger)

## Quick start

1. Unzip the download and open `index.html` in a browser.
2. Or serve the folder with any static server:

   ```sh
   cd ledger
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

Node.js 24 is only needed to rebuild the CSS (see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections |
|------|---------|------------------|
| `index.html` | Front page | Featured essay, latest posts, short notes, most read, newsletter |
| `article.html` | Long-form article | Progress bar, reading time, table of contents, figure, SVG chart, code, pull quote, footnotes, share buttons, author bio, related posts |
| `archive.html` | Archive | Every post grouped by year, live search and topic filters with shareable URLs |
| `topics.html` | Topics | Topic directory with post counts |
| `about.html` | About | Mission, stats, writers, masthead, values |
| `contact.html` | Contact | Contact and pitch form, pitch guidelines, newsletter form |
| `404.html` | Not found | Archive search box |

## Project structure

```text
ledger/
├── index.html, article.html, archive.html, topics.html, about.html, contact.html, 404.html
├── assets/
│   ├── css/style.css      compiled Tailwind CSS (generated)
│   ├── js/main.js         theme, menu, reveals, article tools, archive, forms, back to top
│   └── img/               cover-*.svg art, avatar-*.svg writers, favicon, social image
├── src/input.css          Tailwind source: light and dark color variables and component classes
├── package.json           scripts to rebuild the CSS
├── template.json          template metadata used by freeframe.dev
├── README.md
├── CHANGELOG.md
└── DOCS.md                this guide
```

## Customizing

### Brand and colors

Colors are CSS variables at the top of `src/input.css`: `:root` for light mode and `.dark` for dark mode.
`@theme inline` maps them to Tailwind utilities (`bg-paper`, `bg-surface`, `text-ink`, `text-muted`,
`border-line`, `text-accent`, `bg-accent-soft`).

| Variable | Used for |
|----------|----------|
| `--paper` | Page background |
| `--surface` | Cards, inputs, chart panel |
| `--ink`, `--muted` | Text and secondary text |
| `--line` | Rules and borders |
| `--accent`, `--accent-soft` | Kickers, links, focus rings, success messages |

```css
:root { --accent: #1d4ed8; --accent-soft: #e0e8fb; }
.dark { --accent: #7aa2ff; --accent-soft: #1a2240; }
```

Rebuild the CSS after changes, and update the two `theme-color` meta tags in each page's `<head>` if you
change `--paper`.

### Typography

Headlines and article text use **Newsreader** (`--font-serif`), interface text uses **Inter**
(`--font-sans`) and code uses **JetBrains Mono** (`--font-mono`), loaded from Google Fonts in each page's
`<head>`. Replace that `<link>` on every page and the tokens to change them. Article typography is the
`.prose-ledger` component in `src/input.css`.

### Content

**Pages** are plain HTML. The front page, topics and about pages are edited directly.

**Articles.** `article.html` is the template for one essay. The text inside
`<div class="prose-ledger" data-article>` drives:

- **Reading time**: the words a reader reads ÷ 230, written into every `[data-reading-time]`. Words are
  counted per text node (so words in neighboring tags never run together), leaving out SVG text (the
  chart's title, description and labels), scripts, styles, `hidden`/`aria-hidden` elements and the notes;
  captions and code count.
- **Table of contents**: built from the article's `<h2>` headings (ids are generated from the text if
  missing). Add `data-toc-skip` to an `<h2>` to leave it out, as the "Notes" heading does.
- **Footnotes**: a reference `<sup><a href="#fn1" id="ref1" aria-describedby="notes-label">1</a></sup>` and
  a note `<li id="fn1">... <a href="#ref1" aria-label="Back to reference 1">↩</a></li>` in the Notes list.
- **Code**: hand-colored with `tok-c` (comment), `tok-k` (keyword), `tok-s` (string) and `tok-f`
  (function) spans; there's no automatic highlighter.

Copy `article.html` for each new essay and update its `<title>`, meta description, Open Graph tags and
`<time datetime>`.

**Archive.** The archive is rendered from the JSON inside
`<script type="application/json" id="posts-data">` at the bottom of `archive.html`:

```json
{
  "title": "The case for slower software",
  "dek": "Speed is a feature, but so is the time to think.",
  "topic": "Design",
  "author": "Jonah Reyes",
  "date": "2026-09-14",
  "minutes": 4
}
```

Topic chips are generated from the topics used. Every archive entry links to `article.html`; to link each
post to its own page, add a `url` field and change `href="article.html"` in the "Archive" section of
`assets/js/main.js` to use `escapeHtml(p.url)`. Post counts on `topics.html` are written by hand, so
update them when you add posts.

### Images and artwork

Cover art is SVG in `assets/img/cover-*.svg` (3:2) and writer avatars are `assets/img/avatar-*.svg`.
Replace them with images of the same ratio and update the `src` and `alt` attributes. The chart in
`article.html` is inline SVG with a `<title>` and `<desc>`; edit its bars and both text descriptions
together. The favicon is `assets/img/favicon.svg`; the social image is `assets/img/og-image.png`
(1200×630), exported from `assets/img/og-image.svg`.

### Navigation, header and footer

The header (with theme toggle and menu button), mobile menu and footer are repeated in every page. To add
a page, copy one, replace the content inside `<main>`, and add the link to the menus on every page.

### Dark mode

An inline script in each page's `<head>` adds the `dark` class to `<html>` before the first paint, from
the saved choice or, if there is none, the system setting. The toggle (`data-theme-toggle`, with
`aria-pressed`) switches it and saves the choice (see [Saved data](#saved-data-localstorage)). Dark
styles use the `dark:` variant, which follows the `.dark` class.

## Features

### Reading progress and table of contents

On `article.html`, the bar at the top (`[data-progress]`) grows as you read through the article. The table
of contents is filled into every `<ul data-toc>` (a sticky sidebar on wide screens, a collapsible
`<details>` on small ones, which closes after you pick a heading) and highlights the section you're
reading.

### Share buttons

Links with `data-share="x"`, `"linkedin"` or `"email"` get share URLs for the current page and title.
`data-copy-link` copies the page address (without the `#hash`) and shows a "Link copied to clipboard"
toast.

### Archive search and filters

On `archive.html`, typing in `[data-archive-search]` matches titles, deks, authors and topics; the topic
chips (`aria-pressed`) narrow by topic; results are grouped by year with a count (`[data-archive-count]`)
and an empty state with a reset button (`data-archive-reset`). The URL keeps the state, so
`archive.html?topic=Design&q=notes` can be shared. Press **/** to jump to the search box. The search box
on `404.html` submits to `archive.html?q=...`.

### Scroll reveals

Elements with `reveal` fade up when they scroll into view. They are only hidden while JavaScript is
running (`.js .reveal`) and show immediately with reduced motion.

### Mobile menu

The menu button (`data-menu-toggle`) opens the menu named in its `aria-controls`, swaps its icon and
label, and closes with **Esc**, a link click or on wide screens.

### Back to top button

Every page gets a "Back to top" button in the bottom-right corner, created by the "Back to top" block at
the end of `assets/js/main.js` and styled by the `.back-to-top` rules at the end of `src/input.css`. It
appears after about one screen of scrolling, scrolls to the top (instantly with reduced motion), moves
focus to the main content, lifts above the copy-link toast and steps aside while an in-page "Back to top"
link is on screen. Add `data-back-to-top-avoid` to anything you pin to the bottom of the screen, or
`data-back-to-top-hide` to a sticky element it must never cover. To remove it, delete that JavaScript
block and the CSS rules, then rebuild the CSS.

## Forms

| Form | Page | Fields |
|------|------|--------|
| Contact and pitch | `contact.html` | `name` (2+ characters), `email`, `topic`, `message` (30+ characters), `consent` |
| Newsletter | `index.html`, `contact.html` | `email` |
| Archive search | `404.html` | `q` (sent to `archive.html`) |

Forms with `data-validate` check required fields, email format and minimum lengths. Each field's message
goes into the element with id `<field id>-error`, using the field's `data-label` (for example "Please
enter your email address."), and the first problem is focused. On success the form's
`[data-form-success]` message is shown and focused, and the form resets. The contact form's message
fills its `[data-ref]` element with a short reference (`LE-` and four characters, made in the browser by
`makeRef()`; show your form service's own reference instead if it returns one) and promises a reply within a
week, like the intro on the contact page: change both if yours differs. The newsletter messages ask readers
to look out for a confirmation email, which suits a double opt-in mailing list.

**Nothing is sent yet.** To connect a form to Formspree:

1. Add the endpoint to the form:

   ```html
   <form action="https://formspree.io/f/your-id" method="post" class="space-y-5" data-validate novalidate aria-labelledby="form-title">
   ```

2. In the "Form validation" section of `assets/js/main.js`, find the comment "Send the data to your form
   endpoint here" and post the data before showing the success message:

   ```js
   fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
     .then(function (res) {
       if (!res.ok) throw new Error('Request failed');
       var success = $('[data-form-success]', form);
       if (success) {
         var refEl = $('[data-ref]', success);
         if (refEl) refEl.textContent = makeRef('LE');
         success.hidden = false;
         success.focus();
       }
       form.reset();
     });
   ```

3. For the newsletter, use your email provider's form endpoint instead.

## Saved data (localStorage)

| Key | Value | Purpose |
|-----|-------|---------|
| `ledger-theme` | `"dark"` or `"light"` | The reader's theme choice |

Any other stored value is ignored and the system setting is used.
Rename the key in `assets/js/main.js` and in the inline script in every page's `<head>`. Reset with
`localStorage.removeItem('ledger-theme')`.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `twitter:card`. When you deploy,
change `og:image` on every page to an absolute URL, ideally a per-article image:

```html
<meta property="og:image" content="https://example.com/assets/img/og-image.png">
```

For each article, consider [Article structured data](https://schema.org/Article) (headline, author,
`datePublished`, image) as JSON-LD, plus a `sitemap.xml` and an RSS feed.

## Accessibility

- Skip link, landmarks, one `<h1>` per page and visible focus outlines in the accent color.
- Text and kickers meet WCAG AA contrast in both themes; footnote back-links are underlined.
- The chart has a `<title>` and `<desc>`; footnotes link both ways with labels.
- Topic chips and the theme toggle use `aria-pressed`; the archive count is announced (`aria-live`).
- Form errors are linked with `aria-describedby`; success messages use `role="status"`.
- Reveals, smooth scrolling and transitions respect `prefers-reduced-motion`.

When editing, write real `alt` text for new covers, keep one `<h2>` per TOC entry, and label new form
fields.

## Building and deploying

`assets/css/style.css` is pre-built. Rebuild it after editing `src/input.css` or using Tailwind classes
that aren't in the CSS yet, including classes inside the HTML strings in `assets/js/main.js`. With
Node.js 24:

```sh
npm install
npm run build     # or: npm run watch
```

Ledger is a static site: upload the folder (without `node_modules/`) to Netlify, GitHub Pages, Cloudflare
Pages or any web host. No build command is needed on the host.

## Troubleshooting

- **The archive is empty or shows nothing.** The `posts-data` JSON must be valid (no trailing commas) and
  every post needs `title`, `dek`, `topic`, `author`, `date` (`YYYY-MM-DD`) and `minutes`.
- **A topic link opens the archive unfiltered.** `?topic=` must match a post's `topic` (case doesn't matter);
  check the spelling.
- **A heading is missing from the table of contents.** Only `<h2>` headings inside `[data-article]` are
  listed, and not ones with `data-toc-skip`.
- **An error message never appears.** The field needs an `id` and a matching `<p id="<id>-error">`.
- **New Tailwind classes have no effect.** Rebuild the CSS.
- **A form shows its thank-you message but nothing arrives.** It sends nothing until you connect it; see
  [Forms](#forms).

## License

Ledger is released under the MIT License (see `LICENSE.txt` in the download), for personal and commercial
use. The included SVG cover art and avatars are covered by the same license. Newsreader, Inter and
JetBrains Mono are licensed under the SIL Open Font License.
