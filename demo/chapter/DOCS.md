# Chapter documentation

## Overview

Chapter is a literary website template for a novelist. The demo author is **Clemency Thorne**, a fictional
crime and historical novelist who lives in Salem, Massachusetts, with four Esme Lark mysteries set on the Great Marsh,
two standalone novels and a new book, *The Glass Marsh*, on the way. The design borrows from a well-set book
jacket: a book-face serif, generous margins, cream paper with a faint grain, fleuron ornaments and a jacket
drawn in SVG for every book. It is built with plain HTML, Tailwind CSS v4 and one vanilla JavaScript file,
with no build step needed to run it. This is version 1.0.5 (see `template.json` and
[CHANGELOG.md](CHANGELOG.md)). Live demo: [freeframe.dev/templates/chapter](https://freeframe.dev/templates/chapter).

Copy uses American English, prices are in US dollars (USD) and every date and time is Eastern time
(`America/New_York`, EST in winter and EDT in summer), on a 12-hour clock.

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Everything works from the file system.
3. Or serve the folder, which is closer to how it will run online:

```sh
npx serve .
```

You only need Node.js 24 or newer if you want to change the styles and rebuild the CSS (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | New-release hero with jacket, countdown to publication day (or "out now"), pre-order links, early praise, the opening lines, "continue reading" bookmark, the series in reading order, author introduction, next three events, newsletter sign-up |
| `books.html` | The backlist | Series/standalone filter with counts (`?show=`), reading order or newest first (`?order=`), a "reading: page N of M" badge for books you have started |
| `book.html` | One book (`?id=`) | Jacket, blurb, countdown when not yet published, buy links, formats with ISBNs and prices, reviews, first-chapter reader, the rest of the series, book club link |
| `events.html` | Events | Upcoming events in Eastern time, in person/online filter (`?format=`), visitor's own time for online events, `.ics` downloads, invitation information |
| `about.html` | About Clemency | Biography, SVG portrait, map of the places in the books, timeline, questions people ask |
| `book-clubs.html` | Book club guides (`?book=`) | Book picker, themes, discussion questions, `.txt` and printable `.svg` guide downloads, copy button, hosting tips |
| `press.html` | Press and media kit | Short and long biographies with copy buttons, new-book details, generated press release and fact sheet, portrait and jacket downloads, contacts with copy-email buttons |
| `newsletter.html` | The Marsh Letter | Sign-up with region and interests, what subscribers get, excerpts from recent letters |
| `contact.html` | Contact (`?topic=`) | Topic routing to agent, publicity, rights, events or Clemency, with fields per topic and a character counter |
| `404.html` | Not found | A "torn-out page" with links back |

## Project structure

```text
chapter/
  index.html, books.html, book.html, events.html, about.html,
  book-clubs.html, press.html, newsletter.html, contact.html, 404.html
  assets/
    css/style.css        compiled Tailwind CSS (generated, do not edit by hand)
    js/main.js           every script: data, jackets, countdown, reader, filters, downloads, forms
    img/clemency.svg     illustrated author portrait (400 x 480)
    img/favicon.svg      browser tab icon
    img/og-image.svg     social sharing image source (1200 x 630)
    img/og-image.png     social sharing image used by og:image
  src/input.css          Tailwind source: design tokens and components
  package.json           scripts to rebuild the CSS
  README.md              short introduction
  DOCS.md                this guide
  CHANGELOG.md           version history
  LICENSE.txt            license (added to the download)
```

## Customizing

### Brand and colors

Design tokens live in the `@theme` block at the top of `src/input.css`.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-paper` | `#f5efe3` | Page background (with a grain texture on `body`) |
| `--color-paper-2` | `#ece3d1` | Deeper paper for panels |
| `--color-card` | `#fbf8f1` | Cards, forms and the reader page |
| `--color-ink` | `#221c18` | Text and the footer |
| `--color-muted` | `#5b5047` | Secondary text |
| `--color-rule` | `#cbbca2` | Hairlines and borders |
| `--color-oxblood`, `--color-oxblood-deep` | `#7b2230`, `#5c1622` | Links, buttons, drop caps, newsletter band |
| `--color-gilt` | `#b08a3e` | Ornaments only (not text) |
| `--color-gilt-ink` | `#7a5a1c` | Gilt-colored labels on paper (AA contrast) |
| `--color-marsh`, `--color-marsh-2`, `--color-glass` | greens | The home page hero (the new book's colors) |

To change the accent from oxblood to, say, navy:

```css
@theme {
  --color-oxblood: #1f3a5f;
  --color-oxblood-deep: #142842;
}
```

The paper grain is a small SVG noise texture in the `body` rule of `src/input.css`; delete the
`background-image` line for flat paper. Useful component classes: `.btn` with `.btn-solid`, `.btn-line`,
`.btn-glass`, `.btn-ghost-light` and `.btn-sm`; `.caps` and `.caps-sm` (spaced capitals); `.h-title`,
`.h-section` and `.lead`; `.ornament` (a fleuron between hairlines); `.dropcap`; `.link`; `.jacket`
(spine shading and shadow around a jacket SVG); `.chip`; `.label`, `.input`, `.check`, `.field-error`.
Sections with a dark background use `.on-dark`, which switches link, muted-text, error and focus colors.

### Typography

Three Google Fonts are loaded in the `<head>` of every page:

- **Libre Baskerville** for headings, quotes and jacket titles (`font-display`, token `--font-display`)
- **Crimson Pro** for body text and the reader (`font-serif`, token `--font-serif`)
- **Josefin Sans** for spaced capitals, buttons and labels (`.caps`, token `--font-caps`)

To swap one, change the `<link href="https://fonts.googleapis.com/css2?...">` in each page and the matching
token in `@theme`, then rebuild the CSS. The jackets drawn in `main.js` and `og-image.svg` name the fonts
in their `font-family` attributes too.

### Content

Static text lives in the HTML files. Everything that repeats or is computed lives in data constants at
the top of `assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `SITE_NAME`, `SITE_URL` | Author name and the site address used in downloads and calendar files |
| `TIMEZONE`, `LOCALE`, `CURRENCY` | `'America/New_York'`, `'en-US'`, `'USD'` |
| `STORAGE_KEYS` | `{ reader: 'chapter-reader', size: 'chapter-reader-size' }` |
| `NEW_RELEASE` | Id of the book the home page, announcement bar and `book.html` without `?id=` are about (`'the-glass-marsh'`) |
| `KEEP_DEMO_CURRENT`, `DEMO_ANCHOR` | `true` and `'2026-10-17'`: move the new book's publication day and every event forward in whole weeks (see [Demo dates](#demo-dates)) |
| `RETAILERS` | Bookstores: name, a short note and the link prefix (`url + book id`) |
| `FORMAT_NAMES` | `hardback` (shown as Hardcover), `paperback`, `ebook`, `audio` |
| `SERIES` | Series names and jacket label (`lark`) |
| `BOOKS` | Every book: jacket, blurb, formats, reviews, first chapter, themes and questions |
| `EVENTS` | Events with date, times, venue, price and booking link |
| `EVENT_FORMATS` | Values accepted by `events.html?format=` |
| `CONTACT_TOPICS` | Values accepted by `contact.html?topic=`, who each topic goes to, their reply time (`reply`) and the next step shown after sending (`thanks`) (must match the `<option>` values) |

A book looks like this (shortened):

```js
{
  id: 'salt-and-shingle', title: 'Salt and Shingle', lines: ['Salt and', 'Shingle'], series: 'lark', no: 2, pub: '2020-05-05',
  imprint: 'Finch & Holloway', genre: 'Crime', setting: 'Gloucester and the Blynman Canal',
  jacket: { motif: 'shingle', bg: '#8e3a24', fg: '#f7ecdc', accent: '#f0c9a1', line: '#e2b878' },
  tagline: 'Every stone on the beach has a story. One of them is a lie.',
  blurb: ['First paragraph.', 'Second paragraph.'],
  formats: [
    { type: 'paperback', isbn: '978-1-0000-1221-7', pages: 352, price: 16.99, retailers: ['spine-and-story', 'bookhound', 'pagecraft'] },
    { type: 'audio', isbn: '978-1-0000-1227-9', length: '9 h 56 min', narrator: 'Philippa Strand', price: 18.99, retailers: ['listen-lane'] }
  ],
  reviews: [{ quote: 'Sun, sea and slow dread.', source: 'Dead Letter Quarterly' }],
  extract: { chapter: 'Chapter One', heading: 'Bunting', pages: [['Paragraph', 'Paragraph'], ['Paragraph']] },
  themes: ['Family secrets'],
  questions: ['How does the summer setting change the feel of the series?']
}
```

- `series` is a key of `SERIES`, or `null` for a standalone; `no` is the place in the reading order.
- `pub` is the US publication day (new books usually come out on a Tuesday). A book whose day hasn't come yet shows "Pre-order", the countdown and
  "Out <date>"; from midnight Eastern time on that day it shows "Buy" and its year.
- `lines` is how the title breaks on the jacket. A line that is just `The` is set small and italic.
- `extract.pages` holds the first chapter, one array of paragraphs per reader page. A paragraph of
  `'* * *'` is drawn as a section break.
- The ISBNs in the demo are fictional (prefix `978-1-0000`). Replace them with your own.

Link to a book with `book.html?id=<id>`; add `#read` to open the reader straight away.

An event:

```js
{ id: 'winter-words', title: 'Winter Words', format: 'in-person', kind: 'Festival talk', venue: 'Concord Town House',
  town: 'Concord', date: '2026-12-05', start: '15:00', end: '16:00', price: 15, book: 'the-glass-marsh',
  url: 'https://example.com/tickets', blurb: 'A winter book festival talk and reading.' }
```

`date`, `start` and `end` are wall-clock times in `TIMEZONE`, on a 24-hour clock in the data (shown as 7:00 PM). `price: 0` shows "Free, registration required".
`launch: true` adds a "Launch night" badge. An event disappears once its end time has passed.

### Demo dates

A template can wait a long time between downloads, so nothing dated is allowed to go stale. While
`KEEP_DEMO_CURRENT` is `true`, every event and every book whose `pub` is after `DEMO_ANCHOR` moves forward
by the number of whole weeks since `DEMO_ANCHOR`. Weekdays and times never change, so publication day is
always a Tuesday about three weeks away and the launch party is always on publication night.

```js
var KEEP_DEMO_CURRENT = true;     // false once BOOKS and EVENTS have your real dates
var DEMO_ANCHOR = '2026-10-17';   // the week the demo dates were written for
```

**Set `KEEP_DEMO_CURRENT = false` when you enter real dates.** The countdown then ends at midnight Eastern
time on publication day, the site switches to "out now" by itself (hero, announcement bar, buy links and
book page) and past events disappear.

What the demo shows at a few fixed clocks (useful for tests):

| Clock (UTC) | `KEEP_DEMO_CURRENT` | Publication day and countdown | Events |
|-------------|--------------------|-------------------------------|--------|
| 2026-10-17 10:00 | `true` | Tuesday, November 10, 23 days 19 hours 00 minutes | 9 upcoming (6 in person, 3 online); first: The Reading Room, live, Monday, October 19, 7:00–8:00 PM EDT |
| 2026-10-23 12:00 | `true` | Tuesday, November 10, 17 days 17 hours | 8 upcoming; the October 19 event is over and hidden; first: Newburyport Public Library, Saturday, October 24, 2:00–3:15 PM EDT |
| 2026-10-26 12:00 | `true` | Tuesday, November 17, 21 days 17 hours | 9 upcoming; first: Monday, October 26, 7:00–8:00 PM EDT |
| 2026-11-10 14:00 | `false` | "Out now"; buy links say "Buy" | 7 upcoming; first: the launch party, 6:30–8:30 PM EST |

### Images and artwork

There are no photos. Everything is SVG:

- **Jackets** are drawn by `jacketSVG(book, opts)` in `main.js` from each book's `jacket` object: `bg`,
  `fg` (title and author), `accent` (motif), `line` (frame and label) and `motif`, one of the keys of
  `MOTIFS`: `church`, `shingle`, `compass`, `lighthouse`, `bells`, `reeds`. Any element with
  `data-jacket="<book id>"` is filled with that book's jacket. To use real cover images, replace the
  `jacketSVG()` calls (or the `[data-jacket]` elements) with `<img>` tags at a 300:460 ratio and keep the
  `.jacket` class for the spine shading.
- `assets/img/clemency.svg` is the portrait (400 x 480) used on the home, about and press pages. Replace it
  with a 5:6 photo and keep a meaningful `alt` text.
- The map on `about.html` is inline SVG; edit the place names and dots there.
- The social image is `assets/img/og-image.png` (1200 x 630), made from `og-image.svg`. Social sites don't
  show SVG, so export a new PNG after editing the SVG.
- `assets/img/favicon.svg` is the browser tab icon.

### Navigation, header and footer

The announcement bar, header and footer are repeated in every HTML file. To add a page, copy an existing
page, change its `<title>`, description, `data-page` on `<body>` and content, then add a link to the
header (`nav[aria-label="Main"]` on the left of the name, `nav[aria-label="More"]` on the right), the
mobile menu (`#mobile-menu`) and the footer in every file. Mark the current page with
`aria-current="page"` on its links.

## Features

### Release countdown and "out now"

`fillRelease()` in `main.js` fills every `[data-release-date]` with the new book's publication day, shows
`[data-release-state="soon"]` or `[data-release-state="out"]`, sets `[data-buy-verb]` to "Pre-order" or
"Buy", fills `[data-buy-links]` with links to each bookstore that sells the book, and starts every
`[data-countdown]` (days, hours, minutes and seconds in `[data-unit]` boxes, with singular and plural
unit labels). When the countdown reaches zero the page switches to the "out" state without a reload.
The countdown has `role="timer"` and a hidden sentence (`[data-countdown-label]`) for screen readers.

### Books filter and reading order

`books.html` lists `BOOKS` with filter buttons (`data-filter="all|lark|standalone"`, shareable as
`books.html?show=lark`) and order buttons (`data-order="reading|published"`, `?order=published`). In
reading order, series books are numbered and standalones follow; "Newest first" sorts by `pub`. The buttons
use `aria-pressed`, and the result line (`[data-book-count]`) is announced politely. Unknown parameter
values fall back to "all" and "reading".

### Book pages

`book.html` reads `?id=`; an unknown id shows the new book with a short notice. Elements with
`data-b="title|series|tagline|genre|setting|imprint|pub|verb"` and the `[data-b-*]` containers are filled
from `BOOKS`. The table of formats sits in a scrolling wrapper on narrow screens.

### First-chapter reader

The reader on `book.html` (`[data-reader]`) shows `extract.pages` one page at a time:

- **Start reading** opens it (`aria-expanded` on the button); **Close the reader** puts it away.
- Previous/next buttons, or the Left and Right arrow keys while focus is inside the reader.
- Three text sizes (`data-reader-size="sm|md|lg"`, `aria-pressed`), remembered in
  `chapter-reader-size`.
- Your place is saved after every page turn. Closing and reopening, reloading or coming back later
  resumes on the same page ("Continue from page 3"), and the home page shows a "continue reading"
  bookmark for the last book you read. The books page shows a "Reading: page N of M" badge.
- After the last page, an end card offers the buy links and **Start again**, which clears the place.
- The status line (`[data-reader-saved]`) is a polite live region; page turns respect reduced motion.

### Events

`upcomingEvents()` keeps events whose end time is still in the future and sorts them. `events.html` filters
them with `data-format="all|in-person|online"` (`?format=online`); counts and the result line use the
right singular or plural ("1 upcoming event"). For online events, visitors in another time zone also see
their own time. **Add to calendar** downloads an `.ics` file (UTC times) built by `icsText()`. The home
page shows the next three (`[data-next-events]`), or a newsletter prompt when there are none.

### Book club guides

`book-clubs.html` fills its `<select>` from `BOOKS` and shows the chosen book's themes and questions
(`?book=<id>`). **Download the guide** saves a plain-text file and **Printable page** a US Letter-sized SVG
with the jacket and numbered questions (`guideText()` and `guideSVG()`). **Copy the questions** copies the
list.

### Press kit, copy and downloads

Any `<button data-copy="#element-id">` copies that element's text; `data-copy-text="..."` copies a fixed
string (the contact emails). The button label changes to "Copied" for a moment and a toast confirms.
`data-download="press-release"` builds a press release from the new book's data and the short biography;
`data-download="factsheet"` saves every `[data-fact]` row; `data-jacket-download="<id>"` saves a jacket as
a standalone SVG. Downloads are made in the browser with `Blob`, so nothing needs uploading.

### Scroll reveals, menu and back to top

Elements with `.reveal` fade in once (and everything above them, so fast jumps never leave gaps). The
mobile menu button has `aria-expanded`, Escape closes it and returns focus. A back-to-top button appears
after scrolling. All motion is off with `prefers-reduced-motion: reduce`.

## Forms

Every form validates in the browser and shows inline messages under each field, then a success state.
**The forms don't send anything until you connect them**, even though their success states read as if they
had. Rules come from attributes: `required`, `type="email"` and
`data-minlength`. Fields in hidden contact topics are disabled, so they are skipped.

| Form | Where | Validates |
|------|-------|-----------|
| Newsletter (`[data-newsletter-form]`) | `index.html`, `newsletter.html` | Email, consent checkbox |
| Contact (`[data-contact-form]`) | `contact.html` | Topic, name, email, message (20 characters or more) and the chosen topic's required fields |

The contact form preselects its topic from `contact.html?topic=agent|publicity|rights|events|readers`
and shows who the message goes to (from `CONTACT_TOPICS`). After sending, the thank-you names that person,
shows the topic's `thanks` line (when they usually reply) and a short reference (`CT-` and four characters,
made in the browser by `makeRef()`; use your form service's own reference instead if it returns one). Keep
the `reply` and `thanks` times in step with how quickly you really answer.

The newsletter thank-you asks the subscriber to look out for an email confirming their address. Most
mailing list services send one (double opt-in); if yours doesn't, change that line in `index.html` and
`newsletter.html`.

To connect a form to a service such as Formspree, replace the comment in the form's submit handler in
`initForms()` or `initContact()`:

```js
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (res.ok) showSuccess(form, '');
});
```

For the newsletter, use your mailing list's form action (Buttondown, Mailchimp, ConvertKit and others
accept a plain POST) and keep the consent checkbox.

## Saved data (localStorage)

| Key | Shape | Validation |
|-----|-------|------------|
| `chapter-reader` | `{ "last": "the-glass-marsh", "pages": { "the-glass-marsh": 3 } }` | Only ids that exist in `BOOKS` (own-key check) and whole page numbers from 1 to that book's page count are kept; `last` must be one of them |
| `chapter-reader-size` | `"sm"`, `"md"` or `"lg"` | Must be a key of `READER_SIZES`, otherwise `"md"` |

Storage goes through one `safeStorage` object. When localStorage is blocked (a sandboxed iframe, strict
privacy settings), it falls back to memory, so the reader still remembers your place for the page view.
To reset, run `localStorage.removeItem('chapter-reader')` in the browser console or clear the site's data.

URL parameters are validated the same way, with own-key checks against `BOOK_BY_ID`, `BOOK_FILTERS`,
`BOOK_ORDERS`, `EVENT_FORMATS` and `CONTACT_TOPICS`:

| Page | Parameter | Values |
|------|-----------|--------|
| `book.html` | `id` | A book id (default `NEW_RELEASE`); `#read` opens the reader |
| `books.html` | `show`, `order` | `all`, `lark`, `standalone`; `reading`, `published` |
| `events.html` | `format` | `all`, `in-person`, `online` |
| `book-clubs.html` | `book` | A book id |
| `contact.html` | `topic` | `agent`, `publicity`, `rights`, `events`, `readers` |

## SEO and sharing

Each page has its own `<title>`, meta description and Open Graph tags in the `<head>`; `book.html` also
sets `document.title` to the chosen book. `og:image` points to `assets/img/og-image.png` with a relative
path; most social sites need an absolute URL, so change it to `https://your-domain/assets/img/og-image.png`
once you know the address. Add a `sitemap.xml` listing the pages, and consider `Book` structured data
(JSON-LD with `name`, `author`, `isbn` and `datePublished`) on book pages.

## Accessibility

- Skip link, landmarks, one `<h1>` per page, current page marked with `aria-current="page"`.
- Visible focus outlines in oxblood (glass green on dark sections).
- Filter, order and text-size buttons use `aria-pressed`; the reader and menu buttons use
  `aria-expanded` and `aria-controls`.
- Jackets have text alternatives where they carry meaning and are hidden where the title is already
  next to them.
- Live regions announce result counts, reader progress, copy confirmations and the contact routing.
- Text colors meet WCAG AA on every paper tone; gilt is used as text only in the darker `gilt-ink`.
- Motion (reveals, page turns, smooth scrolling) is off with reduced motion.

When editing, keep one `<h1>` per page, give new inputs a `<label>`, and keep `aria-controls` and
`aria-describedby` pointing at ids that exist.

## Building and deploying

The compiled CSS is committed, so the site runs as it is. After changing `src/input.css` or adding new
Tailwind classes to the HTML or `main.js`, rebuild it (Node.js 24):

```sh
npm install
npm run build     # once
npm run watch     # rebuild on every change
```

Upload the folder to any static host: Netlify Drop, Cloudflare Pages, GitHub Pages, or any web server.
All links are relative, so it also works in a subfolder.

## Troubleshooting

- **The publication day or event dates are wrong.** `KEEP_DEMO_CURRENT` is still `true`, so dates are moved
  forward. Set it to `false` once `BOOKS` and `EVENTS` have your real dates.
- **The site still says "Pre-order" after publication.** Check the book's `pub` date and that
  `NEW_RELEASE` is its id. The switch happens at midnight Eastern time.
- **No events are listed.** With `KEEP_DEMO_CURRENT = false`, every event's end time has passed. Add new
  ones to `EVENTS`.
- **The reader opens on the wrong page.** It resumes where you stopped. Press **Start again** at the end of
  the chapter, or clear `chapter-reader` (see [Saved data](#saved-data-localstorage)).
- **A new Tailwind class has no effect.** Rebuild the CSS. Classes written only inside `main.js` strings
  must appear there literally to be generated.
- **Downloads or copying don't work in a preview.** Some sandboxed previews block downloads and the
  clipboard. Open the page directly in a browser.
- **A form shows its thank-you message but nothing arrives.** It sends nothing until you connect it; see
  [Forms](#forms).

## License

MIT. The code and all included artwork are free for personal and commercial use; see `LICENSE.txt`.
Libre Baskerville, Crimson Pro and Josefin Sans are licensed under the SIL Open Font License.
Clemency Thorne, her books, publisher, agency, bookstores, reviewers and events are fictional.
