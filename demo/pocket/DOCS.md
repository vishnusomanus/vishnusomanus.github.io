# Pocket documentation

## Overview

Pocket is a launch website for a mobile app, built for **Pocket**, a fictional budgeting app from Tulsa.
It has layered phone mockups, a scroll-driven feature tour, a screenshot carousel with a lightbox, pricing,
release notes, a help center, a press kit and a privacy policy. Every phone screen is plain HTML and SVG, with no
image files. This is the **HTML + Tailwind CSS v4** version, **1.0.8**: static pages and one vanilla JavaScript
file, no build step needed to run it.

Live demo: [freeframe.dev/templates/pocket](https://freeframe.dev/templates/pocket)

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Every page and link works from your computer.

To preview it the way a host serves it:

```sh
cd pocket
python3 -m http.server 8000   # then open http://localhost:8000
```

**Node.js 24** is only needed to rebuild the CSS after changing styles (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable features |
|------|---------|------------------|
| `index.html` | Home | Hero with layered phone mockups and store buttons, press strip, sticky feature tour, count-up stats, app-store style reviews, privacy section, download block (`#download`), newsletter |
| `features.html` | Features | Six feature deep-dives with app screens and a grid of smaller features |
| `screenshots.html` | Screenshots | Horizontal carousel (buttons, swipe, arrow keys) with a lightbox |
| `pricing.html` | Pricing | Free, Plus and Family plans, monthly/yearly toggle, comparison table, FAQ accordion |
| `changelog.html` | Release notes ("What's new") | Timeline with type and platform filters and a live count |
| `support.html` | Help center | Searchable FAQ in groups, contact form in a sticky sidebar, newsletter |
| `press.html` | Press kit | Boilerplate, key facts, logos, colors and leadership, all with copy buttons |
| `privacy.html` | Privacy policy | Table of contents that highlights the section you're reading |
| `404.html` | Not found | Links back into the site |

## Project structure

```text
pocket/
├── index.html … privacy.html, 404.html
├── assets/
│   ├── css/style.css            compiled Tailwind CSS (generated)
│   ├── js/main.js               all interactions, one commented block per feature
│   └── img/
│       ├── favicon.svg          app icon, also used as the favicon
│       ├── pocket-logo.svg      logo for light backgrounds (press kit download)
│       ├── pocket-logo-dark.svg logo for dark backgrounds
│       ├── og-image.svg         editable source of the social image
│       └── og-image.png         1200×630 social image
├── src/input.css                Tailwind source: @theme tokens and component classes
├── package.json                 scripts to rebuild the CSS
├── README.md  DOCS.md  CHANGELOG.md
```

## Customizing

### Brand and colors

Tokens are in the `@theme` block of `src/input.css`:

| Token | Used for |
|-------|----------|
| `--color-pine-50` … `--color-pine-950` | Brand green: primary buttons, links, focus outline, app screens |
| `--color-sun-300` … `--color-sun-500` | Yellow accent; primary buttons in dark mode |
| `--color-coral-400`, `--color-coral-500` | Warm accent in the app screens |
| `--color-cream-50` … `--color-cream-200` | Light page backgrounds |
| `--color-ink-800` … `--color-ink-950` | Text and dark-mode backgrounds |

Change the green by replacing the `pine` scale (keep the 50–950 steps), then rebuild the CSS:

```css
@theme {
  --color-pine-500: #7c3aed;
  --color-pine-600: #6d28d9;
  --color-pine-700: #5b21b6;
}
```

The phone screens use **inline styles** with hex colors so each screen is self-contained. Search the HTML for
`#0f7457` (the brand green) and other hex values to recolor them. The logos and favicon are SVG files you can
edit in any vector editor or text editor.

### Typography

Google Fonts are loaded by the `<link>` in each page's `<head>`: **Sora** (headings, `--font-display`) and **Plus
Jakarta Sans** (text, `--font-sans`). All `h1`–`h3` use the display font (set in `@layer base`). Change the URL
in every page and the tokens in `src/input.css`, then rebuild.

### Content

All copy is in the HTML files. The parts that drive features:

- **Pricing:** each paid price is a `<span data-price-monthly="4.99" data-price-annual="3.99">`; notes under prices
  use `data-billing-note` with `data-monthly-note` and `data-annual-note`.
- **Release notes:** each release in `changelog.html` is an `<article data-release data-platform="both">`
  (`both`, `ios` or `android`), and each change an `<li data-change="new">` (`new`, `improved` or `fixed`). Add one:

```html
<article data-release data-platform="ios">
  <!-- version heading and date, copied from another release -->
  <ul>
    <li data-change="new"><span>New</span><span>Home screen widgets for iOS.</span></li>
  </ul>
</article>
```

- **Help articles:** each FAQ item in `support.html` is inside a `<section data-help-group>` and marked
  `data-faq-item`; the search covers the whole text of every item. Copy an existing item, give its button a new
  `aria-controls` value and its panel the matching `id`.
- **Press facts:** each copy button carries its value in `data-copy="…"`; update it together with the visible text.

### Images and artwork

- **Phones:** every phone is `<div class="phone"><div class="phone-screen">…</div></div>`. Edit the markup inside
  `.phone-screen`, or replace it with a real screenshot (portrait, about 9:19.5, for example 1170×2532):

```html
<div class="phone"><div class="phone-screen">
  <img src="assets/img/home-screen.png" alt="Pocket home screen showing a $1,240 safe-to-spend balance" class="size-full object-cover">
</div></div>
```

- **Store buttons:** the "Download on iPhone / Get it for Android" buttons (`.store-btn`, `data-store="ios|android"`)
  are generic, not official badge artwork. Point their `href` at your App Store and Google Play pages, or replace
  them with the official badges following Apple's and Google's guidelines. Until they link to your store pages they
  jump to `#download`. The line under them ("Free on the App Store and Google Play. No card needed to start.") should
  match your pricing.
- **Social image:** `assets/img/og-image.png` (1200×630) comes from `og-image.svg`; edit the SVG and export a new PNG.

### Navigation, header and footer

The header and footer are repeated in every HTML file. To add a page, copy one (for example `press.html`),
update its `<title>`, description and Open Graph tags, then add the link to the desktop nav, the mobile menu
(`#mobile-menu`) and the footer of every page.

### Dark mode

An inline script in each page's `<head>` applies the theme before the page paints. It reads `localStorage` key
`pocket-theme` (`"dark"` or `"light"`) and otherwise follows the system setting. Toggle buttons have
`data-theme-toggle`.

- **Default to light:** in the inline script, remove `||(t!=='light'&&window.matchMedia('(prefers-color-scheme: dark)').matches)`.
- **Remove dark mode:** delete the inline script and the toggle buttons.

## Features

### Feature tour

On `index.html`, the phone in the tour (`data-tour-phone`) is sticky while four steps scroll past
(`<article data-tour-step="budgets">`, `bills`, `goals`, `insights`). The phone contains one screen per step
(`data-tour-screen="…"`); when a step reaches the middle of the viewport, its screen gets the `is-active` class and
the phone's `aria-label` changes to name it.

To add a step, add an `<article data-tour-step="name">` with an `<h3>`, and a matching
`<div data-tour-screen="name">` inside the phone. On small screens each step shows its own phone instead, and with
reduced motion the screens don't animate.

### Screenshot carousel and lightbox

`screenshots.html`.

- The track (`data-carousel-track`) is a horizontally scrolling list with scroll snapping. The previous and next
  buttons move one screen; with the track focused, the left and right arrow keys do the same. The status line
  (`data-carousel-status`) says which screens are visible. Swipe and trackpad scrolling work natively.
- Each "Enlarge" button (`data-lightbox-open="0"` …) opens the lightbox (`role="dialog"`, `aria-modal="true"`).
  Its contents come from the `<template data-lightbox-item data-title="…" data-caption="…">` elements just before
  the lightbox, one per screen, in the same order as the buttons.
- In the lightbox: arrow keys move between screens, Escape or clicking the backdrop closes it, Tab is trapped
  inside, and focus returns to the button that opened it.

To add a screenshot, add a slide to the track, an "Enlarge" button with the next index, and a matching `<template>`.

### Pricing toggle

`pricing.html`. The two `data-billing` buttons (`monthly`, `annual`) use `aria-pressed`; choosing one swaps every
price and billing note and updates a status message for screen readers (`data-billing-status`).

### Accordions

FAQ items on the pricing and help pages are buttons marked `data-accordion-button` with `aria-expanded` and
`aria-controls` pointing to their panel. Closed panels are `inert`, so their links can't be tabbed to.

### Release note filters

`changelog.html`. The type buttons (`data-change-filter`: `all`, `new`, `improved`, `fixed`) and the platform select
(`data-platform-filter`) hide non-matching changes and empty releases, and update the count
(`data-change-count`). An empty state appears when nothing matches.

### Help center search

`support.html`. Typing in `data-help-search` filters every `data-faq-item` by its text, hides empty groups and shows
"3 articles match …" (`data-help-count`) or the empty state (`data-help-empty`). The contact form sits in a sticky
sidebar marked `data-back-to-top-hide`, so the back-to-top button never covers it.

### Press kit copy buttons

`press.html`. Buttons with `data-copy="text"` copy that text; `data-copy-target="boilerplate"` copies the text of the
element with that id. A toast (`data-toast`, `role="status"`) confirms the copy. Without the Clipboard API (for
example on plain `http://`), a fallback using a hidden textarea is used.

### Privacy table of contents

`privacy.html`. Links marked `data-toc-link` point at sections marked `data-toc-section`; the link for the section in
view gets `aria-current="true"`. The policy text is a placeholder: have it reviewed for your product and region.

### Scroll reveals and counters

Elements with the class `reveal` fade in once their top passes 92% of the viewport height, checked on scroll, so
jumping to the end of a page reveals everything above. Numbers with `data-count` (plus optional `data-decimals`
and `data-suffix`) count up when revealed. With reduced motion everything appears immediately.

### Back-to-top button

The last block of `main.js` adds the button after about one screen of scrolling. It returns to the top (instantly
with reduced motion), moves focus to the skip-link target (`#main`), lifts above toasts and hides while an in-page
"Back to top" link is on screen. Add `data-back-to-top-avoid` to bottom-pinned elements and
`data-back-to-top-hide` to sticky ones it must not cover. Remove it by deleting that block and the `.back-to-top`
rules in `src/input.css`.

## Forms

| Form | Where | Fields |
|------|-------|--------|
| Contact | `support.html` | Name, email, topic (select), phone (iPhone/Android), message (at least 20 characters) |
| Newsletter | The footer of every page | Email |

Forms with `data-validate` are checked with the browser's built-in constraints (`required`, `type="email"`,
`minlength`) and custom messages:

- Errors appear in the `<p id="<field id>-error">` under each field and `aria-invalid` is set.
- After the first submit, fields re-check as you type.
- Focus moves to the first invalid field.
- A field can override its message with `data-message="…"`, or require a match with another field using
  `data-match="<id>"` and `data-match-message`.

When valid, `onValid(form)` hides the form and shows the element named in `data-success`. The contact form's success
message ("Thanks, message received.") promises a reply within one business day, as the help center and features pages
say, and shows a short reference (`PO-` and four characters, made in the browser by `makeRef()` and written into the
message's `[data-ref]` element; use your help desk's own reference instead if it returns one). It has a "Send another
message" button whose `data-form-reset` holds the **form's** `id` (for example `data-form-reset="contact-form"`), not
the success message's. The newsletter's success message asks the visitor to look out for a confirmation email, the
usual double opt-in; turn that on in your mailing list provider or change the text. **Nothing is sent until you
connect the forms**, even though the success messages read as if it had been.

To connect a form, add an `action` and `name` attributes to its fields, then replace the body of `onValid` in
`assets/js/main.js` (it has a "Demo only" comment):

```js
function onValid(form) {
  var success = document.getElementById(form.dataset.success);
  var button = form.querySelector('[type="submit"]');
  button.disabled = true;
  fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    .then(function (res) {
      if (!res.ok) throw new Error('Request failed');
      var refEl = success && success.querySelector('[data-ref]');
      if (refEl) refEl.textContent = makeRef();
      form.hidden = true;
      if (success) { success.hidden = false; success.focus(); }
    })
    .catch(function () {
      button.disabled = false;
      alert('Sorry, your message could not be sent. Please try again.');
    });
}
```

```html
<form action="https://formspree.io/f/your-id" method="POST" data-validate data-success="contact-success" novalidate>
  <input id="c-name" name="name" required>
```

## SEO and sharing

- Each page has its own `<title>`, meta description, Open Graph tags, Twitter card and `theme-color` for light and
  dark.
- `og:image` is the relative path `assets/img/og-image.png`. Social networks need an absolute URL, so change it on
  every page when you deploy:

```html
<meta property="og:image" content="https://your-domain.com/assets/img/og-image.png">
```

- Add `sitemap.xml` and `robots.txt` at the site root. If you publish in the app stores, consider adding Apple's
  Smart App Banner (`<meta name="apple-itunes-app" content="app-id=…">`) to the home page.

## Accessibility

Built in:

- Skip link, landmarks and one `h1` per page.
- Visible focus outlines (`:focus-visible`) and AA contrast in light and dark mode.
- Mobile menu with `aria-expanded`; Escape closes it and returns focus.
- Phone mockups are exposed as single images (`role="img"` with a description of the screen) or hidden when
  purely decorative, so screen reader users aren't read every number inside a fake screen.
- Accordions, the lightbox (focus trap, Escape, focus return), `aria-pressed` toggles and live regions for filter
  counts, carousel status and toasts.
- Reduced motion turns off reveals, count-ups, the tour transitions and smooth scrolling.

When editing, give every new phone a meaningful `aria-label`, keep one `h1` per page and label every form field.

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
left out.

## Troubleshooting

- **A Tailwind class I added does nothing.** Rebuild the CSS with `npm run build`.
- **The copy buttons show "Copy failed".** Some browsers block clipboard access on plain `http://` or from a file;
  it works on `https://` and `localhost`.
- **The lightbox shows the wrong screen.** The `data-lightbox-open` indexes must match the order of the
  `<template data-lightbox-item>` elements.
- **A new release doesn't respond to the filters.** Check that the `<article>` has `data-release` and a
  `data-platform`, and each `<li>` has `data-change`.
- **The tour phone doesn't change.** Each `data-tour-step` value needs a matching `data-tour-screen` inside
  `data-tour-phone`.
- **Shared links show no image.** Use an absolute URL for `og:image`.
- **The form shows its thank-you message but nothing arrives.** It sends nothing until you connect it; see
  [Forms](#forms).

## License

MIT, like every Freeframe template: free for personal and commercial projects, no attribution required. Artwork
and logos are included. See `LICENSE.txt` in the download. The privacy policy is placeholder text, not legal advice.
