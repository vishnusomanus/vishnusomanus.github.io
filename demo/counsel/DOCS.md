# Counsel documentation

## Overview

Counsel is a complete website for a law firm or professional services practice, shown as **Hartwell & Sloane LLP**, a
fictional partner-led firm with offices in Boston, Hartford and Providence. It has practice areas with an audience
filter, an attorney directory with search, case results, insights articles with a reading progress bar, and a
consultation request form with a conflict-check notice. This is the **HTML + Tailwind CSS v4** version (1.0.4): plain
HTML files, one stylesheet and one small vanilla JavaScript file, with no build step needed to run it.

Live demo: [freeframe.dev/templates/counsel](https://freeframe.dev/templates/counsel)

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Every page works straight from the file system.

To preview it the way a host serves it:

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

Node.js 24 (for `npm`) is only needed to rebuild the CSS after changing `src/input.css` or adding new Tailwind
classes (see [Building and deploying](#building-and-deploying)).

## Pages

| File | Page | Notable sections and features |
|------|------|-------------------------------|
| `index.html` | Home | Hero with courthouse illustration, count-up statistics, practice areas, how we work, attorneys, client quotes, insights, consultation call to action |
| `practice-areas.html` | Practice areas | Eight practice areas filtered by audience (businesses or individuals) |
| `practice-area.html` | Practice area | One practice in depth (Employment Law): services, process, results, FAQ, team |
| `attorneys.html` | Attorneys | Directory with name search, a practice-area filter, a live count and an empty state |
| `attorney.html` | Attorney profile | Priya Raman: bio, contact, matters, publications, bar admissions, education |
| `results.html` | Results | Case results filtered by outcome and practice area, with disclaimers |
| `insights.html` | Insights | Articles filtered by topic, newsletter sign-up |
| `article.html` | Article | Long-form article with a reading progress bar and a table of contents that follows your scroll |
| `contact.html` | Contact | Consultation request form with a conflict-check notice, office details and an illustrated map |
| `404.html` | Not found | Page-not-found page |

The cards for practice areas, attorneys and articles all link to one example detail page each (`practice-area.html`,
`attorney.html`, `article.html`). Duplicate a detail page for every item you publish (see [Content](#content)).

## Project structure

```text
counsel/
├── index.html … contact.html, 404.html   one HTML file per page
├── assets/
│   ├── css/style.css     compiled Tailwind CSS (generated: don't edit by hand)
│   ├── js/main.js        menu, reveals, count-up, filters, article progress, forms, back-to-top
│   └── img/              SVG portraits, facade, article covers, favicon, og-image.svg and og-image.png
├── src/input.css         Tailwind source: design tokens (@theme) and component classes
├── package.json          scripts to rebuild the CSS
├── README.md             short introduction
├── DOCS.md               this guide
├── CHANGELOG.md          version history
└── LICENSE.txt           MIT license (added to the download)
```

## Customizing

### Brand and colors

Design tokens are in the `@theme` block at the top of `src/input.css`:

| Token | Used for |
|-------|----------|
| `--color-ink` | Text and deep navy sections |
| `--color-ink-2` | Raised panels on navy |
| `--color-paper`, `--color-paper-2` | Page background (warm ivory) and sunken panels |
| `--color-surface` | Cards |
| `--color-line`, `--color-line-dark` | Hairlines on ivory and on navy |
| `--color-muted` | Secondary text on ivory |
| `--color-mist` | Secondary text on navy |
| `--color-gold` | Decorative brass: rules, icons, borders |
| `--color-gold-ink` | Brass for text on light backgrounds (meets AA contrast) |
| `--color-gold-soft` | Brass for text on navy (meets AA contrast) |
| `--color-danger` | Error messages |

For example, to swap the brass accent for a deep green:

```css
@theme {
  --color-gold: #4f7a62;
  --color-gold-ink: #2f5a43;
  --color-gold-soft: #9cc7ae;
}
```

Then rebuild the CSS. Keep the `-ink` and `-soft` variants at WCAG AA contrast against ivory and navy respectively.

### Typography

Fonts load from Google Fonts in every page's `<head>`:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&amp;family=Libre+Caslon+Display&amp;display=swap">
```

`--font-display` (Libre Caslon Display, used for `h1`, `h2` and `.font-display`) and `--font-sans` (IBM Plex Sans,
body) are set in `@theme`. To change a font, edit the link on every page and the family name in the token, then
rebuild the CSS.

### Content

All content is HTML. The interactive lists use data attributes, so keep them when you add or edit cards:

| Page | Card attribute | Values |
|------|----------------|--------|
| `practice-areas.html` | `data-audience` | `business` or `individual` |
| `attorneys.html` | `data-practices` | Space-separated practice keys, e.g. `"ip corporate"` |
| `attorneys.html` | `data-search` | Lower-case words the search matches, e.g. `"priya raman partner"` |
| `results.html` | `data-type`, `data-practices` | Outcome (`verdict`, `settlement`, `transaction`, `appeal`, `dismissal`, `resolution`) and practice key |
| `insights.html` | `data-topic` | `business`, `employment`, `intellectual-property`, `estate-planning`, `real-estate` |

Practice keys used by the filters are `corporate`, `litigation`, `employment`, `ip`, `real-estate`, `estate-planning`,
`family` and `injury` (the `<option>` values of the practice select on `attorneys.html` and `results.html`).

To add an attorney:

1. Copy an `<article data-item …>` card in `attorneys.html`, update the portrait, name, role and practices, and set
   `data-practices` and `data-search` (lower case).
2. Copy `attorney.html` to a new file (for example `attorney-jane-doe.html`), replace the profile content and point the
   card's links at it.
3. Add the portrait as `assets/img/attorney-jane-doe.svg` (or `.jpg`) at 400 × 480.

Practice areas and articles work the same way: copy a card, duplicate the detail page, update the links. The office
details appear in `contact.html` and in the footer of every page; the firm's phone and email appear in the header and
footer.

The home page statistics count up from zero. Each one is a `data-count` element with its final value and an optional
suffix:

```html
<span data-count data-to="1200" data-suffix="+">1,200+</span>
```

### Images and artwork

All artwork is original SVG in `assets/img/`:

| Files | Size | Where |
|-------|------|-------|
| `attorney-<name>.svg` | 400 × 480 (5:6) | Attorney cards and profile |
| `insight-0.svg` … `insight-5.svg` | 640 × 400 (16:10) | Article covers |
| `facade.svg` | 640 × 560 | Home hero (courthouse) |
| `favicon.svg` | 64 × 64 | Browser tab icon |
| `og-image.svg` / `og-image.png` | 1200 × 630 | Social sharing image (the SVG is the editable source) |

The office map on `contact.html` is an inline SVG with a `<title>` describing it. Replace images with photos of the same
proportions (`.jpg` or `.webp`), keeping descriptive `alt` text.

### Navigation, header and footer

The header, mobile menu and footer are repeated in every HTML file. To add a page, copy an existing one, replace the
content inside `<main id="main">`, add the link to the desktop and mobile menus on **every** page, and mark the current
page's links with `aria-current="page"`. Detail pages highlight their section (for example `attorney.html` marks
"Attorneys" as current). A project-wide search and replace keeps the menus in sync.

### Legal notices

The footer of every page carries an attorney-advertising and not-legal-advice notice. `results.html`, `article.html` and
`contact.html` add their own disclaimers. Review all of them against your bar's advertising rules before publishing:
requirements differ between jurisdictions.

## Features

### Filterable lists

`practice-areas.html`, `attorneys.html`, `results.html` and `insights.html` share one generic filter in `main.js`. A
container marked `data-filter-list` holds the cards (`data-item`) and any of these controls:

| Control | Markup | Filters on |
|---------|--------|------------|
| Chips | `<button data-chip data-value="…" aria-pressed>` | The attribute named by the list's `data-key` (e.g. `data-key="audience"`) |
| Selects | `<select data-filter-select data-key="practices">` | The attribute named by the select's own `data-key` |
| Search box | `<input type="search" data-filter-search>` | Each card's `data-search` text |
| Count | `[data-filter-count]` | Shows the number of visible cards (inside a live region) |
| Empty state | `[data-filter-empty]` | Shown when nothing matches |
| Reset | `[data-filter-reset]` | Clears every control and refocuses the search |

Attribute values can hold several space-separated tokens (`data-practices="ip corporate"`), and a card matches if any
token matches. The value `all` matches everything. To filter a new list, wrap it in a `data-filter-list` container with
the same markup; no JavaScript changes are needed.

### Count-up statistics

Elements with `data-count` animate from 0 to `data-to` (with `data-suffix`) over 1.4 seconds when they scroll into view.
With reduced motion they show the final value at once. The HTML already contains the final value, so the number is
correct without JavaScript.

### Reading progress and table of contents

On `article.html`, the bar marked `data-reading-progress` fills as you read the `data-article-body` (via the
`--progress` CSS variable), and the table-of-contents links (`data-toc-link`, pointing at section ids) get
`aria-current="true"` for the section you're reading. To add a section, give its heading an `id` and add a matching
`data-toc-link` to the contents list.

### Header, mobile menu and scroll reveals

- The header (`data-header`) gets an `is-scrolled` class after scrolling, which adds its shadow.
- The menu button (`data-menu-button`) toggles `#mobile-menu`, updates `aria-expanded` and its label, moves focus to the
  first link, and Esc closes it and returns focus.
- Elements with the `reveal` class fade in as they scroll into view; revealing one also reveals everything before it,
  so jumping to an anchor never leaves hidden content. With reduced motion (or without JavaScript) everything shows at
  once. Optional `style="--d:70ms"` staggers neighboring cards.

### Back to top

The last block of `main.js` adds a "Back to top" button after the visitor scrolls about one screen. It scrolls smoothly
(instantly with reduced motion) and moves keyboard focus to the skip-link target. It steps aside while an in-page "Back
to top" link is on screen, lifts above toasts and elements marked `data-back-to-top-avoid`, and hides while it would
cover a sticky element marked `data-back-to-top-hide`. Restyle it with the `.back-to-top` rules at the end of
`src/input.css`; to remove it, delete the block and those rules.

## Forms

| Form | Page | Validates |
|------|------|-----------|
| Consultation request | `contact.html` | Name, email, who it's for (a required radio group), practice area, a message of at least 20 characters and the acknowledgment checkbox; phone, office and other parties are optional |
| Newsletter | `insights.html` | Email |

Every `form[data-validate]` is handled in `main.js`:

- required fields, emails, minimum lengths and checkboxes are checked on blur and on submit, with plain-language
  messages created under each field (`aria-invalid` and `aria-describedby` are set for you);
- a group of radios or checkboxes wrapped in an element with `data-required-group="Your message"` must have one option
  chosen, and shows that message otherwise;
- focus moves to the first problem;
- on success the form is hidden and the element marked `data-success` next to it is shown and focused. A
  `data-reset-form` button inside the wrapper (`data-form-wrap`) brings the form back.

The consultation confirmation thanks the visitor, shows a short reference (`HS-` and four characters, made in the
browser by `makeRef()` and written into any `data-ref` element in the success panel) and says a partner will reply
within one business day, as the contact page promises. If your form service or case management system returns its own
reference, show that instead, and change the reply time if yours differs. The newsletter confirmation asks subscribers to
look out for a confirmation email, which suits a double opt-in mailing list.

**Nothing is sent** until you connect a backend. To use a form service such as [Formspree](https://formspree.io):

1. Add the endpoint to the form: `<form action="https://formspree.io/f/your-id" method="POST" … data-validate>`.
2. In `main.js`, replace the demo block in the submit handler:

```js
// Demo only: nothing is sent. See the comment above to connect a form service.
fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  .then(function (res) {
    if (!res.ok) throw new Error('Request failed');
    var success = $('[data-success]', form.parentNode);
    form.hidden = true;
    success.hidden = false;
    success.focus();
  })
  .catch(function () {
    alert('Sorry, your request could not be sent. Please call us instead.');
  });
```

3. Check that the success messages match how you handle inquiries (reply time, conflict check, confirmation email).

Keep the conflict-check notice on the consultation form, and don't ask for confidential details before you've confirmed
there's no conflict of interest.

## SEO and sharing

Each page has its own `<title>`, `<meta name="description">`, Open Graph tags and a `theme-color` in `<head>`. Update them
for your firm.

`og:image` is the relative path `assets/img/og-image.png`. Social networks need an **absolute** URL, so when you deploy,
change it on every page:

```html
<meta property="og:image" content="https://www.your-firm.com/assets/img/og-image.png">
```

For launch, consider adding a `sitemap.xml` and `robots.txt`, and [`LegalService`](https://schema.org/LegalService) /
`Attorney` structured data (JSON-LD) with your offices, phone numbers and opening hours.

## Accessibility

Built in:

- a "Skip to content" link and landmarks on every page, with one `h1` per page;
- visible focus rings in brass (`:focus-visible`, with a lighter variant on navy);
- filter chips with `aria-pressed`, counts in polite live regions, and table-of-contents links with `aria-current`;
- form errors linked to their fields with `aria-describedby`, and focus moved to the first error;
- an accessible mobile menu (`aria-expanded`, Esc to close, focus management);
- the office map with a descriptive `<title>`;
- reduced motion respected by reveals, count-ups, smooth scrolling and the back-to-top button;
- color pairs that meet WCAG AA, including dedicated brass shades for text on ivory and on navy.

When editing, keep one `h1` per page, label new inputs, use `--color-gold-ink`/`--color-gold-soft` (not `--color-gold`)
for brass text, and keep `alt` text meaningful.

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` is compiled and included. Rebuild it after editing `src/input.css` or using Tailwind classes that
aren't in the HTML yet:

```sh
npm install
npm run build    # or: npm run watch while you edit
```

### Deploying

The folder is a static site:

- **Netlify Drop:** drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **GitHub Pages:** push the files to a repository and enable Pages.
- **Cloudflare Pages / any static host:** upload the folder; there's no build command.

Make your host serve `404.html` for missing pages (Netlify and GitHub Pages do this automatically). You can leave out
`src/`, `package.json` and the Markdown files when uploading.

## Troubleshooting

- **A new card never appears when filtering.** Check its data attributes: values are matched as exact lower-case
  tokens (`data-practices="real-estate"`, not `"Real estate"`), and the card must be inside the `data-filter-list`
  container with `data-item`.
- **Search doesn't find an attorney.** The search reads `data-search`, not the visible name. Add the words (lower case)
  to `data-search`.
- **The table of contents doesn't highlight a new section.** The `data-toc-link` `href` must match the section heading's
  `id`.
- **New Tailwind classes have no effect.** Run `npm run build`; the compiled CSS only contains classes that were used
  when it was built.
- **Statistics show 0.** The count-up starts when the number scrolls into view. If you changed the markup, make sure
  `data-to` is a whole number.
- **The form shows its confirmation but nothing arrived.** It sends nothing until you connect it (see [Forms](#forms)).
- **Social previews show no image.** Make `og:image` an absolute URL on your domain.

## License

MIT: the full text is in `LICENSE.txt`, included in the download. You can use, change and sell sites built with this
template, including the SVG artwork. Hartwell & Sloane and everyone in this template are fictional.
