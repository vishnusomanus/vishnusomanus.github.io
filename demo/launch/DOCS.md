# Launch documentation

## Overview

Launch is a complete marketing website for a software product, built for the fictional product-planning
tool "Launch". It has a product screenshot built in HTML, feature deep-dives, a pricing page with a
monthly/annual switch, an about page, a validated contact form and a sign-in / create-account page, in
light and dark themes. This is the HTML + Tailwind CSS v4 version, **version 1.1.8**. See it live at
[freeframe.dev/templates/launch](https://freeframe.dev/templates/launch).

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Every page and link works straight from your computer.
3. For a closer match to a real host, serve the folder instead:

   ```sh
   cd launch
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

No build step is needed to use or edit the text. You only need Node.js 24 if you change the Tailwind
setup or use Tailwind classes that aren't in the template yet (see [Building and deploying](#building-and-deploying)).

## Pages

| File | Page | What's on it |
|------|------|--------------|
| `index.html` | Home | Hero with a product screenshot built in HTML, logo cloud, feature cards, keyboard section, count-up statistics, testimonials, pricing teaser, call to action |
| `features.html` | Features | Roadmaps, issues, releases, feedback and insights sections with HTML/SVG illustrations, integrations grid |
| `pricing.html` | Pricing | Three plans with a monthly/annual switch, enterprise banner, comparison table, FAQ accordion |
| `about.html` | About | Story and timeline, values, team, open roles |
| `contact.html` | Contact | Validated contact form, support options, office addresses |
| `login.html` | Sign in | Sign in / create account tabs with validation and a show/hide password button (demo only) |
| `404.html` | Not found | Friendly not-found page |

## Project structure

```text
launch/
├─ index.html, features.html, pricing.html, about.html, contact.html, login.html, 404.html
├─ assets/
│  ├─ css/style.css      compiled Tailwind CSS (generated: don't edit by hand)
│  ├─ js/main.js         all interactivity, vanilla JavaScript, no dependencies
│  └─ img/
│     ├─ favicon.svg     browser tab icon
│     ├─ og-image.svg    editable source of the social sharing image
│     └─ og-image.png    1200×630 social sharing image used in og:image
├─ src/input.css         Tailwind source: theme tokens, component classes, back-to-top styles
├─ package.json          scripts to rebuild assets/css/style.css
├─ README.md             short introduction
├─ DOCS.md               this guide
└─ CHANGELOG.md          what changed in each version
```

## Customizing

### Brand and colors

All colors come from the `@theme` block at the top of `src/input.css`. Buttons, links, accents,
focus rings and the back-to-top button all use the `brand-*` scale:

```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;

  --color-brand-500: #7451fa;
  --color-brand-600: #6233ee;
  --color-brand-700: #5223d4;
  /* ...50 to 950 */
}
```

To rebrand, replace all eleven `--color-brand-*` values (50 to 950) with a scale for your color, then
rebuild the CSS. Grays come from Tailwind's built-in `zinc` palette. The logo mark is an inline SVG in the
header and footer of every page with its own gradient colors (`#9277ff` to `#5223d4`); change those
too. The browser theme color is set per page with `<meta name="theme-color">` (white in light
mode, `#09090b` in dark).

Shared component classes live in the `@layer components` block of `src/input.css`: `.btn`,
`.btn-primary`, `.btn-secondary`, `.btn-dark`, `.btn-lg`, `.eyebrow`, `.text-gradient`, `.card`,
`.label`, `.input` and `.field-error`.

### Typography

The site uses **Inter**, loaded from Google Fonts by a `<link>` in each page's `<head>`:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&amp;display=swap">
```

To change it, replace that link on every page and update `--font-sans` in `src/input.css`, then rebuild
the CSS. To avoid Google Fonts, self-host the font files and add an `@font-face` rule to `src/input.css`.

### Content

All text is plain HTML: edit the page files directly. There is no data file; everything is in the markup.

- **Statistics** on the home page count up when they scroll into view. Each number is a
  `<span data-count>` with optional `data-decimals` and `data-suffix`; keep the visible text the same
  as the final value so it reads correctly without JavaScript:

  ```html
  <span data-count="4000" data-suffix="+" data-decimals="0">4,000+</span>
  ```

- **Prices** in `pricing.html` carry both values. Change the attributes and the visible number:

  ```html
  $<span data-price-monthly="12" data-price-annual="10">12</span>
  <p data-billing-note data-monthly-note="billed monthly"
     data-annual-note="billed annually ($120/member/year)">billed monthly</p>
  ```

- **FAQ entries** in `pricing.html` are pairs of a `[data-accordion-button]` and the panel its
  `aria-controls` points to. Copy an existing pair and give it new ids (`faq-btn-N` / `faq-panel-N`).
- **Contact topics**: the `<select id="topic">` options in `contact.html` (`sales`, `support`,
  `billing`, `partnerships`, `press`, `careers`) can be linked to directly, for example
  `contact.html?topic=sales` preselects "Sales & demos".

### Images and artwork

There are no photos: the product screenshot, Gantt chart, changelog, analytics chart and team avatars
are built from HTML, Tailwind classes and inline SVG, so they stay sharp and switch with dark mode. To
use real images, add them to `assets/img/` and replace the illustration markup with an `<img>`:

```html
<img src="assets/img/screenshot.png" alt="The Launch roadmap view" width="1600" height="1000"
     class="rounded-2xl ring-1 ring-zinc-200" loading="lazy">
```

Keep product screenshots around 16:10. The favicon is `assets/img/favicon.svg`. The social image is
`assets/img/og-image.png` (1200×630); its editable source is `assets/img/og-image.svg`.

### Navigation, header and footer

The header and footer are repeated in every HTML file. To add a page:

1. Copy an existing page (for example `about.html`) and change its `<title>`, meta description, Open
   Graph tags and `<main>` content.
2. Add a link to the desktop menu (the `<nav aria-label="Main">` list) and the mobile menu
   (`#mobile-menu`) on **every** page. Mark the current page's link with `aria-current="page"`; the
   styles highlight it.
3. Add it to the footer links if you want it there.

Find-and-replace across all files is the quickest way to change shared header or footer content.

### Dark mode

A small inline script in each page's `<head>` adds the `dark` class to `<html>` before the page paints,
based on the saved choice or, if there isn't one, the visitor's system setting. The toggle buttons
(`[data-theme-toggle]`) are wired up in `assets/js/main.js` and save the choice in `localStorage`
under the key `theme`.

- **Default to light**: in the head script, remove the `||(!t&&window.matchMedia(...).matches)` part so
  only a saved `dark` choice turns dark mode on.
- **Disable dark mode**: delete the theme toggle button from the header, remove the head script's
  `dark` logic, and remove the `@custom-variant dark` line from `src/input.css` (then rebuild).

## Features

### Mobile menu

On small screens the `#menu-button` opens `#mobile-menu`. The button's `aria-expanded` and label update,
Escape closes the menu and returns focus to the button, choosing a link closes it, and it closes
automatically when the window grows past 768px. Code: the "Mobile menu" block in `assets/js/main.js`.

### Sticky header

`#site-header` is sticky and gains a border and shadow (the `is-scrolled` class) once the page scrolls
more than 8px.

### Scroll reveal and count-up numbers

Elements with the `reveal` class fade and slide in when they enter the viewport (an
`IntersectionObserver` adds `is-visible`). `reveal-delay-1` to `reveal-delay-3` stagger them. They're
only hidden once JavaScript has run (the head script adds `js` to `<html>`), so content is never lost
without JavaScript. `[data-count]` numbers count up over 1.4 seconds.

With reduced motion, reveals show immediately and numbers jump straight to their final value.

### Pricing switch

The `[data-billing-toggle]` switch (`role="switch"`, `aria-checked`) and the two
`[data-billing-label]` buttons swap every `[data-price-monthly]` number and `[data-billing-note]` line
between monthly and annual. It starts on monthly; to start on annual, change `setBilling(false)` to
`setBilling(true)` in the "Pricing" block of `assets/js/main.js`.

### FAQ accordion

Each `[data-accordion-button]` toggles its panel (named by `aria-controls`) with an animated height,
updating `aria-expanded`. Closed panels are made `inert` so their links can't be tabbed to.

### Sign-in tabs

`login.html` uses an ARIA tablist: click or use the Left/Right arrow keys to switch between "Sign in"
and "Create account". `login.html#signup` opens the create-account tab directly; the header's
"Start free" button links there.

### Show / hide password

`[data-password-toggle]` buttons switch their input (named by `aria-controls`) between hidden and
visible text, update `aria-pressed` and change their label between "Show" and "Hide".

### Back to top button

Every page gets a "Back to top" button in the bottom-right corner, created by the last block in
`assets/js/main.js` and styled by the `.back-to-top` rules at the end of `src/input.css`.

- It appears after scrolling about one screen and returns to the top (instantly with reduced motion),
  then moves keyboard focus to the skip-link target (`#main`).
- It lifts above toasts and anything marked `data-back-to-top-avoid`, and hides while an in-page
  "Back to top" link is visible or while it would cover a pinned element marked
  `data-back-to-top-hide`.
- It's hidden when printing.
- To remove it, delete that JavaScript block and the CSS block, then rebuild the CSS.

### Current year

Any element with `data-year` (the footer copyright) shows the current year.

## Forms

All forms have `data-validate` and are checked in the browser with the Constraint Validation API. Errors
appear in the element with id `<field-id>-error` below each field, the field gets
`aria-invalid="true"`, and focus moves to the first problem. After a first submit, fields re-check as
you type. A valid form shows the element named by its `data-success` attribute.

| Form | Page | Fields and rules |
|------|------|------------------|
| `#contact-form` | `contact.html` | Name (required), email (required, valid), company (optional), team size (required), topic (required), message (required, 20+ characters), consent checkbox (required) |
| `#signin-form` | `login.html` | Email (required, valid), password (required, 8+ characters), "Keep me signed in" |
| `#signup-form` | `login.html` | Name, email, password (8+ characters), terms checkbox, all required |

The success messages read as if the form went through. The contact message promises a reply within one
business day (as the note under the form does) and shows a short reference (`LA-` and four characters,
made in the browser by `makeRef()` and written into the success element's `[data-ref]`); if your form
service returns its own reference, show that instead. The sign-in message welcomes the user back, and
the sign-up message asks them to look out for an email confirming their address. Change these to match
what your product actually does.

**The forms don't send anything until you connect them.** The `onValid(form)` function in
`assets/js/main.js` only disables the button and shows the success message. To deliver contact messages with a form service
such as [Formspree](https://formspree.io):

1. Add the endpoint to the form:

   ```html
   <form id="contact-form" data-validate data-success="contact-success" novalidate
         action="https://formspree.io/f/your-id" method="POST">
   ```

2. Replace the body of `onValid` in `assets/js/main.js` with a real submission:

   ```js
   function onValid(form) {
     var success = document.getElementById(form.dataset.success);
     var refEl = success && success.querySelector('[data-ref]');
     if (refEl) refEl.textContent = makeRef('LA');
     var button = form.querySelector('[type="submit"]');
     button.disabled = true;
     fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
       .then(function (res) {
         if (!res.ok) throw new Error('Request failed');
         form.hidden = true;
         if (success) { success.hidden = false; success.focus(); }
       })
       .catch(function () {
         button.disabled = false;
         alert('Sorry, your message could not be sent. Please try again.');
       });
   }
   ```

Every field already has a `name`, so `FormData` picks them all up. The sign-in and sign-up forms need
your own authentication backend (or a hosted service); treat them as layouts to connect.

Custom messages: add `data-message="..."` to a field to replace its default error text. To require two
fields to match (for example a "confirm password" field), give the second one
`data-match="<first-field-id>"` and optionally `data-match-message`.

## Saved data (localStorage)

| Key | Value | Used for |
|-----|-------|----------|
| `theme` | `"dark"` or `"light"` | The visitor's color theme choice |

Any other value is ignored and the system setting is used. Visitors can reset it by clearing site data;
you can remove it by deleting the dark-mode code (see [Dark mode](#dark-mode)).

## SEO and sharing

Each page has its own `<title>`, `<meta name="description">`, Open Graph tags (`og:title`,
`og:description`, `og:image`, `og:site_name`) and `twitter:card`. Edit them in each file's `<head>`.

- **Social image**: `og:image` points to `assets/img/og-image.png` with a relative URL. Social networks
  need an absolute URL, so change it on every page when you deploy, for example
  `https://example.com/assets/img/og-image.png`.
- **Canonical URLs**: add `<link rel="canonical" href="https://example.com/pricing.html">` to each page
  once you know your domain.
- **Sitemap and robots**: add a `sitemap.xml` listing your pages and a `robots.txt` pointing to it; most
  static hosts serve them from the site root.

## Accessibility

Built in:

- A "Skip to content" link to `#main` on every page, and landmarks (`header`, `nav`, `main`, `footer`).
- Visible focus outlines (`:focus-visible` uses `brand-500`) and keyboard support for the menu, tabs,
  accordion, pricing switch, password toggle and the sideways-scrolling comparison table.
- Correct ARIA for the patterns used: `aria-expanded` on the menu and accordion, `role="tab"` with
  `aria-selected`, `role="switch"` with `aria-checked`, `aria-pressed` on toggles, `aria-invalid` and
  `aria-describedby` on form fields.
- Reduced motion: reveals, count-ups, smooth scrolling and the back-to-top animation are turned off.
- Text and controls meet WCAG AA contrast in light and dark themes.

When editing, keep exactly one `<h1>` per page, keep headings in order, give every new input a
`<label>` and an error element (`id="<field-id>-error"`), and check contrast if you change colors.

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` is compiled and only contains the Tailwind classes the pages use. Rebuild it when
you change `src/input.css` or add classes that aren't in the template yet. With Node.js installed:

```sh
npm install
npm run build    # one-off build to assets/css/style.css
npm run watch    # rebuild on every change while you work
```

### Deploying

The template is static files, so any host works:

- **Netlify Drop**: drag the folder onto app.netlify.com/drop.
- **GitHub Pages**: push the folder to a repository and enable Pages for the branch.
- **Cloudflare Pages**: create a project with "Direct upload" and upload the folder (no build command).
- **Any web server**: upload the files as they are.

Most hosts show `404.html` for missing pages automatically (Netlify and GitHub Pages do).

## Troubleshooting

- **New Tailwind classes have no effect.** The compiled CSS only includes classes that existed when it
  was built. Run `npm run build`.
- **Content doesn't appear (stays invisible).** `.reveal` elements are hidden until JavaScript adds
  `is-visible`. If `assets/js/main.js` fails to load or has an error, check the browser console and the
  script path.
- **The theme flashes on load.** Make sure the inline script in `<head>` is still before the
  stylesheet and wasn't removed from a page you added.
- **Prices show the wrong value after switching.** Each `[data-price-monthly]` element needs both
  `data-price-monthly` and `data-price-annual`.
- **A form error never shows.** The error element's id must be exactly the field's id plus `-error`,
  and the field needs an `id`.
- **Links preview without an image on social media.** `og:image` must be an absolute URL to the PNG.
- **The FAQ panel won't open.** Check that the button's `aria-controls` matches the panel's `id`.

## License

MIT. The code and all included artwork are free for personal and commercial use; the download includes
the license text in `LICENSE.txt`. Inter is licensed under the SIL Open Font License.
