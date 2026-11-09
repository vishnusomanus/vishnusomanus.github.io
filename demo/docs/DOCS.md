# Manual documentation

## Overview

Manual is a developer documentation site with search, code tabs and dark mode. The demo documents
**Relay**, a fictional JavaScript HTTP client (`@relayhttp/relay`), with a docs home, quick start,
installation guide, a long concepts guide, examples, an API reference, a changelog and an FAQ. It is built
with HTML5, Tailwind CSS v4 and a single vanilla JavaScript file, and needs no build step. This guide
covers version 1.1.11.

Live demo: [freeframe.dev/templates/docs](https://freeframe.dev/templates/docs)

## Quick start

1. Unzip the download and open `index.html` in a browser.
2. Or serve the folder with any static server:

   ```sh
   cd docs
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

Copy buttons use the Clipboard API when the page is served over `https://` or `localhost`, and fall back
to an older copy method when opened as a file. Node.js 24 is only needed to rebuild the CSS (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections |
|------|---------|------------------|
| `index.html` | Docs home | Hero, package-manager install tabs, "Why Relay?", a first look, quick links |
| `getting-started.html` | Quick start | Numbered steps: install, first request, errors, shared instance |
| `installation.html` | Installation | Package managers, requirements, CDN, TypeScript, Deno, verifying the install |
| `guides.html` | Core concepts | Long guide with callouts and option tables |
| `examples.html` | Examples | Copy-paste recipes (forms, token refresh, uploads, polling, React hook) |
| `api.html` | API reference | Signatures, parameter tables and return types |
| `changelog.html` | Changelog | Releases with Added / Fixed / Changed / Breaking badges and upgrade notes |
| `faq.html` | FAQ | Questions grouped by topic |
| `404.html` | Not found | Error page with a search button |

## Project structure

```text
docs/
├── index.html, getting-started.html, installation.html, guides.html,
│   examples.html, api.html, changelog.html, faq.html, 404.html
├── assets/
│   ├── css/style.css      compiled Tailwind CSS (generated)
│   ├── js/main.js         search index, theme, sidebar, highlighting, tabs, outline, search, back to top
│   └── img/               favicon, social image
├── src/input.css          Tailwind source: light and dark color variables and component classes
├── package.json           scripts to rebuild the CSS
├── template.json          template metadata used by freeframe.dev
├── README.md
├── CHANGELOG.md
└── DOCS.md                this guide
```

## Customizing

### Brand and colors

Colors are CSS variables in `src/input.css`: `:root` holds the light theme and `.dark` the dark one.
The `@theme` block maps them to Tailwind utilities (`bg-bg`, `bg-subtle`, `bg-surface`, `text-ink`,
`text-muted`, `border-line`, `bg-brand`, `text-brand-ink`, `bg-brand-soft`), so you only change the
variables:

```css
:root {
  --d-brand: #0e7490;      /* links, buttons, focus rings */
  --d-brand-soft: #e0f2f7;
}
.dark {
  --d-brand: #67e8f9;
  --d-brand-soft: #0b2a33;
}
```

Other variables: `--d-bg`, `--d-subtle`, `--d-surface`, `--d-ink`, `--d-muted`, `--d-line`,
`--d-brand-ink` (text on brand buttons) and `--d-code-bg` (code blocks). Syntax colors are the `.tok-*`
classes, callouts `.callout-*` and changelog badges `.badge-*`, all in `src/input.css`. Rebuild the CSS
after changes. Update the two `theme-color` meta tags in each page's `<head>` to match `--d-bg`.

### Typography

Text uses **Inter** (`--font-sans`) and code uses **JetBrains Mono** (`--font-mono`), loaded from Google
Fonts in each page's `<head>`. Replace that `<link>` on every page and the two tokens to change them.

### Content

Your product name and links: search and replace `Relay`, `@relayhttp/relay` and
`https://github.example/relayhttp/relay` across the folder (including the "Edit this page" links, which point
to `.../edit/main/docs/<page>.md`).

Content is written in each page's `<main id="content">` inside a `.doc` wrapper. The building blocks:

**Headings** need an `id` and an anchor link, and a matching entry in both "On this page" lists (the
`<ul data-toc>` in the right-hand `<aside>` and the collapsible `<details>` under the intro):

```html
<h2 id="retries"><a class="anchor" href="#retries" aria-label="Link to this section">#</a>Retries</h2>
```

```html
<li><a class="toc-link" href="#retries">Retries</a></li>
<li><a class="toc-link toc-h3" href="#sending-data">Sending data</a></li>
```

**Code blocks** are highlighted by `data-lang` (`js`, `ts`, `bash`, `json` or `html`). Escape `<` and `&`
inside code as `&lt;` and `&amp;`:

```html
<div class="code-block">
  <div class="code-head"><span class="code-title">app.js</span>
    <button type="button" class="copy-btn" data-copy><span>Copy</span></button></div>
  <pre tabindex="0"><code data-lang="js">const data = await relay.get('posts').json();</code></pre>
</div>
```

**Callouts** are `<aside class="callout callout-note">` (or `callout-tip`, `callout-warning`,
`callout-danger`) with an `aria-label`, an icon and a `<p class="callout-title">`. Copy one from
`guides.html`. **Tables** go inside `<div class="table-wrap" tabindex="0" role="region" aria-label="Options table (scrolls sideways)">`
(focusable, so keyboard users can scroll a wide table; give each one its own label). **Changelog badges** are
`<span class="badge badge-added">` (`badge-fixed`, `badge-changed`, `badge-breaking`).

**Adding a page:**

1. Copy a page such as `guides.html` and change the `<title>`, description, Open Graph tags, `<h1>` and
   content.
2. Give every `<h2>` and `<h3>` an `id` and add them to both "On this page" lists.
3. Add a link to the sidebar on every page (mark the current one with `aria-current="page"`) and update
   the previous / next links.
4. Add the page and its headings to `SEARCH_INDEX` at the top of `assets/js/main.js`:

```js
{ "t": "Retries", "p": "Core concepts", "u": "guides.html#retries", "x": "Relay retries failed requests that are safe to repeat.", "k": "h2" }
```

`t` is the title, `p` the page name shown under it, `u` the link, `x` a short snippet that is also
searched, and `k` is `page`, `h2` or `h3`.

### Images and artwork

The logo and icons are inline SVG in each page. The favicon is `assets/img/favicon.svg`; the social image
is `assets/img/og-image.png` (1200×630), exported from `assets/img/og-image.svg`.

### Navigation, header and footer

The header (version switcher, search button, GitHub link, theme toggle), the sidebar
(`<nav id="sidebar">` with collapsible `<details class="side-group">` sections) and the footer are
repeated in every page. Edit them on every page when you add or rename pages.

### Dark mode

An inline script in each page's `<head>` adds the `dark` class to `<html>` before the first paint, from
the saved choice or, if there is none, the system setting. The header toggle (`data-theme-toggle`)
switches it and saves the choice (see [Saved data](#saved-data-localstorage)). Dark styles use the
`dark:` variant, which follows the `.dark` class.

## Features

### Search

Press **Ctrl K**, **⌘ K** or **/** (or click the search button, `data-search-open`) to open the search
dialog (`[data-search]`). With no query it lists every page; typing searches `SEARCH_INDEX` titles, page
names and snippets with light stemming ("retry" finds "retries"), ranks title matches first, shows up to
12 results and highlights matches. **Up/Down** move, **Enter** opens, **Esc** closes and returns focus.
The keyboard hint (`data-shortcut`) shows "⌘ K" on Apple devices and "Ctrl K" elsewhere.

The index is written by hand, so add an entry whenever you add a page or heading.

### Sidebar

On wide screens the sidebar is sticky; on phones the menu button (`data-sidebar-open`) slides it in with
a backdrop, moves focus to the close button and closes with **Esc** or a click outside. While closed it is
`inert`. Long sidebars scroll to keep the current page in view.

### "On this page" outline

The outline highlights the section you're reading (`.is-active` and `aria-current="location"`), and the
last one when you reach the bottom. On screens narrower than `xl` it becomes a collapsible box under the
intro.

### Syntax highlighting and copy buttons

A small tokenizer in `assets/js/main.js` (section 5, `RULES`) colors keywords, strings, numbers,
comments, functions and properties for `js`/`ts`, commands and flags for `bash`, keys for `json` and tags
for `html`, with no library. Every `[data-copy]` button copies its block's visible code and shows
"Copied!".

### Package-manager tabs

Code blocks with `data-tabs="package manager"` have tabs (`role="tab"`, `data-tab="npm"`) and panels
(`role="tabpanel"`, `data-panel="npm"`). Choosing a tab switches every block in the same group on the
page and is remembered across pages. Tabs support **Left/Right**, **Home** and **End**. Use another
`data-tabs` name for an independent group (for example `data-tabs="language"` with `js` and `ts`).

### Feedback widget and version switcher

Both are front-end demos. "Was this page helpful?" (`data-feedback`) shows a thank-you message; send the
answer to your analytics where the comment "Send the answer to your analytics here" is in section 9 of
`assets/js/main.js`. The version `<select data-version>` (header and sidebar) shows a toast for older
versions; in section 3, replace the toast with a redirect to your archived docs, for example
`location.href = '/v' + v + '/'`.

### Scroll reveals

Elements with `reveal` fade in as they scroll into view, and everything above them is revealed too. They
show immediately with reduced motion.

### Back to top button

Every page gets a "Back to top" button in the bottom-right corner, created by the "Back to top" block at
the end of `assets/js/main.js` and styled by the `.back-to-top` rules at the end of `src/input.css`. It
appears after about one screen of scrolling, scrolls to the top (instantly with reduced motion), moves
focus to the main content, lifts above toasts and steps aside while an in-page "Back to top" link is on
screen. Add `data-back-to-top-avoid` to anything you pin to the bottom of the screen, or
`data-back-to-top-hide` to a sticky element it must never cover. To remove it, delete that JavaScript
block and the CSS rules, then rebuild the CSS.

## Forms

Manual has no forms. To collect feedback for real, post the answer from the feedback widget (see
[Feedback widget and version switcher](#feedback-widget-and-version-switcher)), for example to Formspree:

```js
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
  body: JSON.stringify({ page: location.pathname, helpful: btn.dataset.feedbackAnswer })
});
```

## Saved data (localStorage)

| Key | Value | Purpose |
|-----|-------|---------|
| `relay-docs-theme` | `"dark"` or `"light"` | The reader's theme choice |
| `relay-docs-tab:<group>` | A tab label, e.g. `relay-docs-tab:package manager` = `"pnpm"` | The chosen tab in each tab group |

A stored theme other than `"dark"` or `"light"` is ignored and the system setting is used. A stored tab label is only used if a tab with that exact `data-tab` exists, so stale values are ignored.
Rename the `relay-docs-` prefix in `assets/js/main.js` and the inline `<head>` script for your product.
Reset by clearing these keys, for example `localStorage.removeItem('relay-docs-theme')`.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `twitter:card`. When you deploy,
change `og:image` on every page to an absolute URL:

```html
<meta property="og:image" content="https://example.com/assets/img/og-image.png">
```

Add a `sitemap.xml` listing every page. Heading `id`s give every section a stable, shareable link.

## Accessibility

- Skip link to `<main id="content">`, labeled landmarks and one `<h1>` per page.
- Search is a dialog with a combobox and listbox (`aria-activedescendant`), full keyboard support and
  focus kept inside while open.
- Tabs follow the WAI-ARIA tabs pattern; code blocks are focusable for keyboard scrolling.
- The mobile sidebar is `inert` while closed and returns focus when closed.
- Callouts have `aria-label`s; toasts and feedback use `role="status"`.
- Code comments and text meet WCAG AA contrast in both themes.
- Reveals and smooth scrolling respect `prefers-reduced-motion`.

## Building and deploying

`assets/css/style.css` is pre-built. Rebuild it after editing `src/input.css` or using Tailwind classes
that aren't in the CSS yet, including classes inside the HTML strings in `assets/js/main.js`. With
Node.js 24:

```sh
npm install
npm run build     # or: npm run watch
```

Manual is a static site: upload the folder (without `node_modules/`) to Netlify, GitHub Pages, Cloudflare
Pages or any web host. No build command is needed on the host.

## Troubleshooting

- **A new page or heading doesn't show up in search.** Add it to `SEARCH_INDEX` in `assets/js/main.js`.
- **The outline never highlights a heading.** Its `id` must match the `href` of a link in `<ul data-toc>`.
- **Code shows as plain text or is cut off.** Check `data-lang` is one of `js`, `ts`, `bash`, `json`,
  `html`, and escape `<` and `&` as `&lt;` and `&amp;`.
- **Tabs don't stay in sync.** All blocks must share the same `data-tabs` name and `data-tab` labels.
- **The theme flashes or ignores the saved choice.** Keep the inline theme script in every page's `<head>`,
  before the stylesheet.
- **New Tailwind classes have no effect.** Rebuild the CSS.

## License

Manual is released under the MIT License (see `LICENSE.txt` in the download), for personal and commercial
use. Inter and JetBrains Mono are licensed under the SIL Open Font License. Relay is fictional.
