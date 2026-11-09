# Notebook documentation

## Overview

Notebook is a personal developer blog. The demo belongs to **Imke Vos**, a fictional backend engineer in
Paducah who writes long posts about databases, build tools and debugging. It has a home page with the
latest posts and featured series, a post layout made for technical writing (highlighted code with copy
buttons, heading links, an outline that follows your reading, a progress bar and series navigation), an
archive by year, a tag browser, instant search, a series page, projects, an about and now page and a
subscribe page. The design is a sheet of graph paper with a red margin line and a yellow highlighter, in
light and dark mode. It is built with HTML5, Tailwind CSS v4 and vanilla JavaScript, and needs no build
step. This guide covers version 1.0.3.

Live demo: [freeframe.dev/templates/notebook](https://freeframe.dev/templates/notebook)

## Quick start

1. Unzip the download and open `index.html` in a browser.
2. Or serve the folder with any static server:

   ```sh
   cd notebook
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

Node.js 24 is only needed to rebuild the CSS (see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections |
|------|---------|------------------|
| `index.html` | Home | Introduction with the "now" line, newest post, five latest posts, series, tags, newsletter |
| `post.html` | A post | Series box, outline, reading time and progress, highlighted code with copy buttons, callouts, heading links, older/newer posts |
| `archive.html` | Archive | Every post grouped by year, with links to each year |
| `tags.html` | Tags | Tag buttons with counts and the posts of the chosen tag (`tags.html?tag=postgres`) |
| `series.html` | Series | Each series with its description and parts, in order |
| `search.html` | Search | Instant search with highlighted matches (`search.html?q=vacuum`) |
| `about.html` | About | Introduction and portrait, now, uses, contact |
| `projects.html` | Projects | Project cards with status, language and links, talks |
| `subscribe.html` | Subscribe | Email sign-up form, RSS address with a copy button, recent emails |
| `404.html` | Not found | Search box and links back |

## Project structure

```text
notebook/
  index.html, post.html, archive.html, tags.html, series.html,
  search.html, about.html, projects.html, subscribe.html, 404.html
  assets/
    css/style.css     compiled Tailwind CSS (generated, don't edit)
    js/posts.js       the post index: every post's title, date, tags, series and address
    js/main.js        all interactive features
    img/              logo, favicon, illustrations, portrait and social image
  src/input.css       Tailwind source: color tokens, fonts and component classes
  package.json        scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

All colors are CSS custom properties at the top of `src/input.css`, once for light mode (`:root`) and once
for dark mode (`.dark`). Tailwind reads them through `@theme inline`, so classes such as `bg-paper`,
`text-muted`, `border-line`, `text-pen` and `bg-marker` follow the tokens.

| Token | Used for |
|-------|----------|
| `--paper` | Page background |
| `--surface` | Cards ("sheets"), inputs |
| `--ink` / `--muted` | Text and secondary text |
| `--line` | Borders and dashed rules |
| `--grid` | The graph-paper lines behind the page |
| `--pen` / `--pen-soft` | Red pen: margin lines, `// labels`, series badges, active outline entry |
| `--marker` | Highlighter: link underlines, `<mark>`, the current nav item |
| `--shadow` | Hard offset shadow under cards and buttons |
| `--code-bg`, `--code-ink`, `--code-line`, `--tok-*` | Code blocks and the syntax colors |

To make the pen blue instead of red:

```css
:root { --pen: #1f4fb8; --pen-soft: #e2e9f8; }
.dark { --pen: #8fb3ff; --pen-soft: #1c2740; }
```

To remove the graph paper, delete the `background-image` and `background-size` lines from `body` in
`src/input.css`. Rebuild the CSS after any change (`npm run build`).

### Typography

Three Google Fonts are loaded in the `<head>` of every page: **Martian Mono** for headings and labels
(slightly condensed with `font-stretch: 87.5%` in the `.display`, `.kicker` and `.post-title` classes),
**Atkinson Hyperlegible Next** for text and **Atkinson Hyperlegible Mono** for code. The stacks are
`--font-display`, `--font-sans` and `--font-mono` in `src/input.css`. To swap a font, change the Google
Fonts link in every page and the matching variable.

### Content

**The post index.** `assets/js/posts.js` lists every post once, newest first, in `window.NOTEBOOK_POSTS`,
and the series in `window.NOTEBOOK_SERIES`. The archive, the tag browser, search, the series box and the
older/newer links on a post are all built from it, so adding a post there updates all of them:

```js
{ slug: 'my-new-post', title: 'My new post', excerpt: 'One sentence about it.', date: '2026-11-02',
  tags: ['postgres'], series: '', part: 0, minutes: 6, url: 'my-new-post.html' },
```

| Field | Meaning |
|-------|---------|
| `slug` | Unique id; a post page names itself with `data-post="<slug>"` |
| `title`, `excerpt` | Shown in lists and searched |
| `date` | `YYYY-MM-DD`, shown exactly as written (never converted to a time zone) |
| `tags` | Lower-case tag names, in alphabetical order |
| `series`, `part` | A series slug from `NOTEBOOK_SERIES` and the part number, or `''` and `0` |
| `minutes` | Reading time shown in lists |
| `url` | The post's page; in the demo every post links to `post.html` |

Entries with a missing slug or title, a date that isn't `YYYY-MM-DD` or no `tags` array are skipped.

**Writing a post.** Copy `post.html` to a new file (for example `my-new-post.html`), then change the
`<title>`, meta description and Open Graph tags, the header (series badge, `<h1>`, summary, date, tags),
the two `data-post` attributes (on `[data-series-nav]` and `[data-post-nav]`) and the text inside
`<div class="prose-nb" data-post-body>`. Add the post to `assets/js/posts.js` and link it from the home
page's "Latest posts" and, if it's part of one, `series.html`. Headings (`<h2>`, `<h3>`) in the text become
the outline automatically.

**Code blocks.** Write a `<pre>` with a `lang-<name>` class; the script adds the frame, the language label
and the copy button:

```html
<pre class="lang-sql"><code><span class="tok-k">SELECT</span> id <span class="tok-k">FROM</span> users;</code></pre>
```

Highlighting is plain `<span>`s with five classes: `tok-k` (keywords), `tok-s` (strings), `tok-n` (numbers),
`tok-c` (comments) and `tok-f` (functions and commands). Their colors are the `--tok-*` tokens, one set
for each theme. Known languages get a friendly label (`sql` → SQL, `bash` → Shell, `text` → Output; the
list is `LANGS` in `assets/js/main.js`); any other name is shown as written.

**Callouts.** `<aside class="callout">` (red pen) or `<aside class="callout callout-note">` (highlighter).

**Static lists.** The home page's newest post and latest list, the series cards, the tag list and the
series page are plain HTML; update them when you publish. Projects, talks, the now section and uses are
plain HTML too.

### Images and artwork

Everything in `assets/img/` is an original SVG: `logo.svg` (also `favicon.svg`), `notebook-page.svg`
(home illustration, 560 × 440), `imke.svg` (portrait, square) and `og-image.svg` (social image source,
1200 × 630). Replace the portrait with a square photo of any size and keep `width`/`height` on the `<img>`.
`og-image.png` is the social image that sites actually display; export a new one at 1200 × 630 when you
change the SVG.

### Navigation, header and footer

The header and footer are repeated in every page. To add a page, add an `<li>` to both the desktop
`<nav aria-label="Main">` and the mobile `#mobile-menu`, and mark the current page with
`aria-current="page"` on its own page. The footer columns are plain lists.

### Dark mode

The theme button toggles the `dark` class on `<html>` and stores `"dark"` or `"light"` under
`notebook-theme` in localStorage. A small inline script in each `<head>` applies it before the page paints;
without a stored choice the page follows the system setting. To default to dark for everyone, change that
script's condition to `t!=='light'`. To remove dark mode, delete the theme button and the inline script.

## Features

### Code blocks and copy buttons

Every `<pre>` inside `[data-post-body]` is wrapped in a `.code-block` frame with a header showing the
language and a **Copy** button (`assets/js/main.js`, "Code blocks"). Copying uses the Clipboard API with a
fallback for pages opened from the file system; the button reads "Copied" for two seconds and a toast
announces it. The code is focusable (`tabindex="0"`) so keyboard users can scroll wide lines, and named
("SQL code") for screen readers. The light and dark syntax themes switch with the site theme.

### Heading links, outline and progress

Each `<h2>` and `<h3>` in the post gets an id (from its text, made unique) and a `#` link that appears on
hover or focus. Following it also copies the section's address. Both `[data-toc]` lists (a sidebar on wide
screens, a collapsible "On this page" on phones) are filled from the same headings; `<h3>`s are indented.
The entry of the section you are reading is highlighted and marked `aria-current="location"`: it is the
last heading above the top quarter of the screen. The bar at the very top (`[data-progress]`) grows as you
read the post's text, and `[data-reading-time]` is counted from the text at 230 words a minute.

### Series box and older/newer posts

`[data-series-nav]` and `[data-post-nav]` read their post's `data-post` slug, find it in the post index and
render the series (with the current part highlighted) and links to the next older and newer posts. A post
with no series shows no box; the newest post shows only the "Older post" card.

### Archive by year

`[data-archive]` groups every post by the year of its date and `[data-archive-years]` lists links to each
year (`#year-2025`). `[data-post-count]` shows the total.

### Tag browser

`tags.html` builds one button per tag (most used first) plus "All", each a toggle with `aria-pressed`.
Choosing one lists its posts, updates the heading and the live count and rewrites the address to
`?tag=<name>` with `history.replaceState`, so the view can be shared. On load `?tag=` is matched
regardless of case; a value that isn't a tag is ignored and a short notice says so.

### Search

`search.html` searches as you type. Every word you type must appear in a post's title, summary, tags or
series name; matches are highlighted with `<mark>` and the count is announced politely. The query is kept
in `?q=` (up to 100 characters), the form still works with Enter, and "Clear the search" returns focus to
the box. Press <kbd>/</kbd> on any page to jump to search (or into the box on the search page); it is
ignored while you type in a field.

### Copy the feed address

On `subscribe.html` the button with `data-copy-target="feed-url"` copies the value of the `#feed-url`
input. Change the address in that input.

### Scroll reveals

Elements with the class `reveal` fade in when they scroll into view, and so does everything above them,
so jumping to the end never leaves hidden content. With reduced motion they are visible right away.

### Mobile menu

Below 1024 px the menu button opens `#mobile-menu`. It updates `aria-expanded` and its label, closes with
Escape (returning focus to the button), when a link is followed, and when the window gets wider.

### Back to top button

`assets/js/main.js` adds a button after you scroll about one screen. It returns to the top (instantly with
reduced motion), focuses the main content and lifts itself above toasts. Remove the "Back to top" block in
`main.js` and the `.back-to-top` styles in `src/input.css` to drop it.

## Forms

The newsletter forms on the home and subscribe pages have `data-validate`. On submit the script checks
each named field: the email address is required and must look like `name@example.com`. Errors appear
under the field (`#<id>-error`), the field gets `aria-invalid="true"` and the first invalid field is
focused. When everything is valid the form resets and the `[data-form-success]` message is shown and
focused. It tells the reader to look out for a confirmation email, as most newsletter services send one
to confirm a sign-up; change the wording if yours doesn't. **Nothing is sent until you connect a
backend**, even though the message reads as if it had been.

To connect a service such as Formspree, set the form's `action` and send the data where `main.js` says
"Send the data to your form endpoint here":

```html
<form action="https://formspree.io/f/yourid" method="post" data-validate novalidate aria-label="Newsletter sign-up">
```

```js
fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  .then(function (res) { if (!res.ok) throw new Error(res.status); /* show success here */ });
```

Most newsletter services (Buttondown, Mailchimp, ConvertKit) give you a form `action` URL that works the
same way. Search and the 404 page's search box need no backend: they are plain `GET` forms to
`search.html`.

## Saved data (localStorage)

| Key | Value | Validation |
|-----|-------|------------|
| `notebook-theme` | `"dark"` or `"light"` | Any other value is ignored and the system setting is used |

Nothing else is stored. Clear it in the browser's site data, or run `localStorage.removeItem('notebook-theme')`.

## SEO and sharing

Every page has its own `<title>`, meta description, `theme-color` and Open Graph tags (`og:type` is
`article` on the post). Once the site is live, change `og:image` to an absolute URL such as
`https://example.com/assets/img/og-image.png`. The 404 page has `noindex`. Add a `sitemap.xml` listing your
pages and posts, a `robots.txt`, and an RSS feed at the address shown on the subscribe page if you
generate one.

## Accessibility

- A skip link, landmarks (`header`, `nav` with labels, `main`, `aside`, `footer`) and one `<h1>` per page.
- Visible focus outlines in the pen color; the current page is marked with `aria-current="page"`.
- Toggle buttons (`aria-pressed`) for theme and tags, live regions for counts, copy and form messages.
- Focusable, labeled code blocks; heading links named after their section.
- Colors meet WCAG AA in both themes, including the syntax colors.
- Reduced motion turns off reveals and smooth scrolling.

When editing, keep one `<h1>` per page, give every new input a `<label>`, and keep headings in order.

## Building and deploying

The compiled CSS is committed, so the site works as it is. After changing `src/input.css` or adding
Tailwind classes to the HTML or `main.js`, rebuild it:

```sh
npm install
npm run build     # or: npm run watch
```

Upload the folder to any static host: Netlify Drop, GitHub Pages, Cloudflare Pages, Vercel or your own
server. No server-side code is needed.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| A new post doesn't appear in the archive, tags or search | Add it to `assets/js/posts.js`; check the date is `YYYY-MM-DD` and `tags` is an array |
| The series box or older/newer links are missing on a post | The `data-post` attributes must match the post's `slug` in `posts.js` |
| A new Tailwind class has no effect | Rebuild the CSS (`npm run build`) |
| Copy buttons don't copy from `file://` in some browsers | Serve the folder over `http://localhost`; the Clipboard API needs a secure context (the fallback covers most browsers) |
| A heading is missing from the outline | Only `<h2>` and `<h3>` inside `[data-post-body]` are listed |
| The newsletter form shows its confirmation but nothing arrives | It sends nothing until you connect it; see [Forms](#forms) |
| `?tag=` shows every post | The tag doesn't exist in `posts.js`; the notice above the list says so |

## License

MIT, see `LICENSE.txt` in the download. The illustrations, portrait and social image are original artwork
included under the same license. Fonts are from Google Fonts under the SIL Open Font License.
