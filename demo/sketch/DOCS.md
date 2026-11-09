# Sketch documentation

## Overview

Sketch is a playful personal-brand website for an online course creator. The demo brand is **Marnie
Draws**, the fictional illustrator Marnie Ashdown, who teaches drawing on the iPad from Asbury Park, New Jersey,
through self-paced courses, a Sunday newsletter and live online workshops. It is built with plain HTML,
Tailwind CSS v4 and one vanilla JavaScript file, with no build step needed to run it. This is version
1.0.6 (see `template.json` and [CHANGELOG.md](CHANGELOG.md)). Live demo:
[freeframe.dev/templates/sketch](https://freeframe.dev/templates/sketch).

Copy uses American English, prices are in US dollars (USD) and every date and time is Eastern time
(`America/New_York`, EST in winter and EDT in summer).

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
| `index.html` | Home | Hero with portrait and early-bird ribbon, three ways to start, flagship course with live price and countdown, student work wall, sticky-note reviews, more courses, next workshop, newsletter sign-up |
| `courses.html` | Course catalog | Level and topic filter chips, "saved only" toggle, result count, empty state, refund promise |
| `course.html` | Course sales page | Rendered from `COURSES` by `?id=`: stats, what you'll make, curriculum accordion with computed counts and runtime, reviews, FAQ, sticky price card with early-bird countdown, enroll dialog, related courses |
| `workshops.html` | Live workshops | Upcoming dates in Eastern time with EST/EDT, the visitor's own time, seats left bar, booking and waitlist dialog, private workshop call to action |
| `resources.html` | Free resources | Type filter, worksheets, palettes and cheat sheets downloaded as generated SVG files, brush packs linked to the newsletter |
| `gallery.html` | Student gallery | Course filter, generated artwork grid, lightbox with previous/next and keyboard arrows |
| `about.html` | About Marnie | Story, timeline, beliefs, kit list, call to action |
| `newsletter.html` | The Sunday Sketch | Sign-up form with interests, recent issues, reader quotes |
| `contact.html` | Contact | Validated form with `?topic=` preselect, quick answers, contact details |
| `404.html` | Not found | Friendly error page with links back |

## Project structure

```text
sketch/
  index.html, courses.html, course.html, workshops.html, resources.html,
  gallery.html, about.html, newsletter.html, contact.html, 404.html
  assets/
    css/style.css        compiled Tailwind CSS (generated, do not edit by hand)
    js/main.js           every script: data, rendering, filters, countdown, dialogs, forms
    img/marnie.svg       illustrated portrait (home and about)
    img/favicon.svg      browser tab icon
    img/og-image.svg     social sharing image source (1200 x 630)
    img/og-image.png     social sharing image used by og:image
  src/input.css          Tailwind source: brand tokens and components
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
| `--color-paper` | `#fffefa` | Page background (with a faint dot grid on `body`) |
| `--color-paper-2` | `#fff6e0` | Warm panels |
| `--color-ink` | `#1d1626` | Text, outlines and the hard shadows |
| `--color-muted` | `#554c60` | Secondary text |
| `--color-pink`, `--color-blue`, `--color-yellow`, `--color-green`, `--color-orange`, `--color-lilac` | marker colors | Buttons, stickers and fills, always with ink text |
| `--color-*-soft` | pale versions | Card and section backgrounds |
| `--color-pink-ink`, `--color-blue-ink`, `--color-green-ink`, `--color-orange-ink` | dark versions | Colored text on white (AA contrast) |

To change the main accent from pink to, say, teal:

```css
@theme {
  --color-pink: #2ec4b6;
  --color-pink-soft: #d4f4f0;
  --color-pink-ink: #0e6b62;
}
```

The artwork in `assets/js/main.js` uses hex values directly: `COLOURS` (course cover backgrounds),
`PALETTES` (artwork color sets) and `INK`. Change those too if you change the palette. The squiggle
underlines and the hand-drawn nav circle are data-URI SVGs in `src/input.css` (`.squiggle`,
`.squiggle-blue`, `.squiggle-yellow`, `.squiggle-green`, `.nav-link[aria-current="page"]`); edit the
`stroke='%23ff6fae'` color in them.

Useful component classes in `src/input.css`: `.btn` with `.btn-yellow`, `.btn-pink`, `.btn-green`,
`.btn-white`, `.btn-ink`, `.btn-lg`, `.btn-sm`; `.card` (wonky corners and hard shadow); `.tilt-l`,
`.tilt-r`, `.tilt-l2`, `.tilt-r2` (slight rotations); `.lift` (straightens and lifts on hover);
`.sticker`, `.tag`, `.chip`, `.note` (sticky note with tape), `.marker` (highlighter swipe), `.eyebrow`
and `.h2`.

### Typography

Three Google Fonts are loaded in the `<head>` of every page:

- **Lilita One** for headings (`font-display`, token `--font-display`)
- **Be Vietnam Pro** for body text (`font-sans`, token `--font-sans`)
- **Gochi Hand** for handwritten notes (`.hand`, `.eyebrow`, token `--font-hand`)

To swap one, change the `<link href="https://fonts.googleapis.com/css2?...">` in each page and the
matching token in `@theme`, then rebuild the CSS. The SVG lettering in `main.js` and in `og-image.svg`
names `Lilita One` in its `font-family` too.

### Content

Static text lives in the HTML files. Everything that repeats or is computed lives in data constants at
the top of `assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `SITE_NAME` | Brand name used in page titles set by the script |
| `TIMEZONE`, `LOCALE`, `CURRENCY` | `'America/New_York'`, `'en-US'`, `'USD'` |
| `STORAGE_KEYS` | `{ saved: 'sketch-saved', waitlist: 'sketch-waitlist' }` |
| `EARLY_BIRD_ENDS` | Flagship early-bird deadline: `null` (rolling demo deadline) or `'YYYY-MM-DDTHH:MM'` Eastern time (see [Demo dates](#demo-dates)) |
| `KEEP_DEMO_CURRENT`, `DEMO_ANCHOR` | `true` and `'2026-10-17'`: move the demo workshops forward in whole weeks (see [Demo dates](#demo-dates)) |
| `FEW_SEATS` | A workshop with this many seats left or fewer shows "Only N seats left" (5) |
| `LEVELS` | `beginner`, `improver` (shown as "Intermediate"), `confident`: name and tag background |
| `TOPICS` | `basics`, `characters`, `lettering`, `colour`, `places`, `animation` |
| `COLOURS`, `PALETTES` | Hex colors for covers and generated artwork |
| `COURSES` | Every course, its modules and lessons |
| `FLAGSHIP` | Id of the course shown on the home page and at `course.html` with no `?id=` (`'draw-anything'`) |
| `REVIEWS` | Student quotes per course (`course` is a course id) |
| `WORKSHOPS` | Live workshop dates, times, prices and seats |
| `RESOURCE_TYPES`, `RESOURCES` | Free downloads and brush packs |
| `GALLERY` | Student artwork |
| `CONTACT_TOPICS` | Values accepted by `contact.html?topic=` (must match the `<option>` values) |

A course looks like this. Each module is `[title, lessons]` and each lesson is `[title, minutes]` or
`[title, minutes, 'project']`. Lesson counts, the module runtimes, the total runtime and the number of
projects are all computed from these numbers by `courseStats()`, so they never go out of date.

```js
{ id: 'pet-portraits', title: 'Pet Portraits', tagline: 'Draw the animals you love.',
  level: 'improver', topic: 'characters', price: 69, earlyBird: null,
  colour: 'orange', motif: 'cat', palette: 'peach', badge: 'New', rating: 4.8, reviews: 12, students: 140,
  app: 'Procreate',
  summary: 'A longer paragraph for the sales page.',
  makes: [['A portrait of your pet', 'cat'], ['A pet sticker sheet', 'mushroom']],
  modules: [
    ['Fur and faces', [['Simple fur', 12], ['Eyes with sparkle', 9]]],
    ['Your portrait', [['Planning the pose', 10], ['The final portrait', 25, 'project']]]
  ] }
```

`price: 0` makes a free course (shown as "Free" with a "Start for free" button). `badge` can be `''`,
`'Flagship'`, `'Bestseller'`, `'Free'` or `'New'`. `earlyBird` is `null` or `{ price, ends }`, where
`ends` is an Eastern time such as `'2026-11-15T23:59'`, or `null` for the rolling demo deadline (the flagship
uses `ends: EARLY_BIRD_ENDS`; see [Early-bird pricing and countdown](#early-bird-pricing-and-countdown)). Link to a course with
`course.html?id=<id>`.

A workshop:

```js
{ id: 'spring-flowers', title: 'Spring Flowers Draw Along', date: '2027-04-10', start: '10:00', end: '11:30',
  price: 25, capacity: 40, booked: 0, level: 'beginner', palette: 'mint', motif: 'plant',
  blurb: 'Tulips, daffodils and a jam jar vase.' }
```

`date`, `start` and `end` are wall-clock times in `TIMEZONE`. `price: 0` shows "Free" and "Save a free
seat". When `booked` reaches `capacity` the workshop shows "Fully booked" and a waitlist button. While
`KEEP_DEMO_CURRENT` is `true`, the dates you write are moved forward; set it to `false` when you enter real
dates (see [Demo dates](#demo-dates)).

### Demo dates

The demo must never look out of date, so two things roll forward with the calendar. Both are switched off
by changing one constant at the top of `assets/js/main.js`:

```js
var EARLY_BIRD_ENDS = null;       // or '2026-11-15T23:59' (Eastern time) for a real launch
var KEEP_DEMO_CURRENT = true;     // false once WORKSHOPS has your real dates
var DEMO_ANCHOR = '2026-10-17';   // the week the demo workshop dates were written for
```

- **Early bird.** With `EARLY_BIRD_ENDS = null`, `rollingDeadline()` sets the deadline to the last day of
  the current month at 11:59 PM Eastern time, or of next month when fewer than 7 days are left, so the offer is
  always running. With a date, the offer ends at that moment and the page switches to the full price.
- **Workshops.** With `KEEP_DEMO_CURRENT = true`, every date in `WORKSHOPS` moves forward by the number of
  whole weeks since `DEMO_ANCHOR`, so weekdays and times never change and there are always six upcoming
  workshops. With `false`, the dates are used exactly as written and past workshops disappear.

What the demo shows at a few fixed clocks (useful for tests):

| Clock (UTC) | Early bird (rolling) | First workshop (rolling) |
|-------------|----------------------|--------------------------|
| 2026-10-17 10:00 | $99 until Saturday, October 31 at 11:59 PM, "ends in 14 days" | Saturday, October 24, 10:00 AM–11:30 AM EDT, 7 seats left |
| 2026-10-26 12:00 | until Monday, November 30 at 11:59 PM | Saturday, October 31, 10:00 AM–11:30 AM EDT |
| 2027-03-01 12:00 | until Wednesday, March 31 at 11:59 PM | Saturday, March 6, 10:00 AM–11:30 AM EST |

With `EARLY_BIRD_ENDS = '2026-11-15T23:59'` and `KEEP_DEMO_CURRENT = false`, a clock of 2026-11-16 shows
$149 and "The early-bird price ended on Sunday, November 15", and on 2027-03-01 the workshops page shows
"0 upcoming workshops" with the empty state.

The home page hero, steps, testimonials and the flagship course description are static HTML in
`index.html`; the flagship price, stats, work wall, course strip and next workshop are filled in by the
script.

### Images and artwork

There are no photos. Everything is SVG:

- `assets/img/marnie.svg` is the portrait (400 x 440). To use a photo instead, replace the `<img>` in
  `index.html` and `about.html` with a 10:11 portrait and keep the `alt` text meaningful.
- Course covers, "what you'll make", workshop thumbnails and student work are drawn by `art(motif,
  palette, opts)` in `main.js`. The motifs are the keys of `MOTIFS`: `cat`, `plant`, `house`, `mug`,
  `mushroom`, `whale`, `lettering` (draws `opts.art.word`), `rainbow`, `moon`, `cactus`. Palettes are the
  keys of `PALETTES`. Each drawing uses a square 200 x 200 viewBox, so square images (for example
  800 x 800) are the right replacement if you switch to real artwork.
- The free worksheets and palettes are generated by `resourceSheet()` as US Letter portrait SVGs (612 x 792).
- The social image is `assets/img/og-image.png` (1200 x 630), made from `og-image.svg`. After editing the
  SVG, export it to PNG with any vector editor or browser screenshot at the same size.
- `assets/img/favicon.svg` is the tab icon (the same mark as the header logo).

### Navigation, header and footer

The header and footer are repeated in every HTML file. To add or remove a page, edit the two `<ul>` lists
in the header (desktop `nav[aria-label="Main"]` and mobile `#mobile-menu`) and the footer link lists in
all ten files. The current page carries `aria-current="page"`, which draws the hand-drawn circle. The
header heart links to `courses.html?saved=1` and shows the saved-course count in `[data-saved-count]`.

## Features

### Course catalog filters

`initCourses()` in `main.js` renders `courseCard()` for every course in `COURSES` into
`[data-course-grid]`. Chips for each level and topic show how many courses they contain. Filters are kept
in the URL (`?level=`, `?topic=`, `?saved=1`) with `history.replaceState`, so a filtered view can be
shared. URL values are only accepted if they are own keys of `LEVELS` or `TOPICS`. The "Saved only" chip
shows saved courses; an empty state explains what to do. Chips are buttons with `aria-pressed` inside
labeled groups, and the result count is an `aria-live` region.

### Saved courses

Every course card, the home flagship section and the course price card have a heart button
(`[data-save="<id>"]`, `aria-pressed`). Saving toggles the id in `sketch-saved`, updates every heart on
the page, the header count and shows a toast. Other open tabs update through the `storage` event.

### Course sales page

`course.html?id=<id>` is rendered by `initCourse()`. Without `?id=` it shows `FLAGSHIP`; an unknown id
(including `constructor` or `__proto__`) shows a friendly "That course has wandered off" page. The page
title and meta description are set from the course. Sections:

- Stats stickers: modules, lessons, runtime, projects and the app.
- "What you'll make" from `makes`.
- Curriculum: a `<details>` accordion, the first module open, with lesson numbers, minutes and "Project"
  tags. "Expand all" opens or closes every module. Counts use correct singular and plural ("1 lesson").
- Reviews from `REVIEWS` and a static FAQ.
- The sticky price card with enroll and save buttons, and three related courses.

### Early-bird pricing and countdown

A course with `earlyBird: { price: 99, ends: '2026-11-15T23:59' }` sells at the early-bird price until
`ends`, read as Eastern time by `zonedDate()`. The flagship uses `ends: EARLY_BIRD_ENDS`, which is `null` in the
demo: a rolling deadline at the end of the month (see [Demo dates](#demo-dates)). `renderPriceBox()` shows the price, the crossed-out full price,
the saving, the deadline ("Sunday, November 15 at 11:59 PM (Eastern time)") and a days/hours/minutes/seconds
countdown that ticks every second. When the deadline passes, the box re-renders by itself with the full
price and "The early-bird price ended on ...", the home hero ribbon (`[data-early-ribbon]`) hides, course
cards drop their early-bird sticker and the enroll dialog quotes the full price. To run a real offer, set
`EARLY_BIRD_ENDS` (or a course's `ends`) to a date; to remove it, set the course's `earlyBird: null`.

The countdown has `role="timer"`; its digits are hidden from screen readers and a visually hidden sentence
(`[data-countdown-label]`) carries the time left.

### Live workshops

`initWorkshops()` lists every workshop whose end time has not passed, soonest first (after the demo shift
described in [Demo dates](#demo-dates)). Each shows the date
and time in Eastern time with the right label (`EST` or `EDT`, from `ZONE_LABELS`), and, when the visitor's
browser is in another time zone, a line such as "That is Sat 7:00 AM PDT where you are." Seats left are
`capacity - booked`: "7 seats left", "Only 1 seat left" (at or below `FEW_SEATS`, with an orange bar) or
"Fully booked". A workshop that has started shows "Live now". When no workshops are left, an empty state
points to the newsletter. The note under the heading shows the current Eastern time and zone.

"Book a seat" opens the sign-up dialog. On a full workshop, "Join the waitlist" opens the same dialog in
waitlist mode; after submitting, the workshop id is stored in `sketch-waitlist`, the card shows
"Waitlist requested" with an "Undo" button. The home page "next live draw-along" card shows the first
upcoming workshop that still has seats.

### Sign-up dialog

`#signup-dialog` (in `course.html` and `workshops.html`) is a native `<dialog>` opened with
`showModal()`, so focus stays inside and Esc closes it. Buttons with `data-enrol`, `data-book` or
`data-waitlist` (set to an id) open it with the right title, details and button text. Focus returns to the
button that opened it. Connect it as described in [Forms](#forms).

### Free resources

`initResources()` lists `RESOURCES` with a type filter (`?type=worksheet|palette|cheatsheet|brushes`,
validated against `RESOURCE_TYPES`). Worksheets, palettes and cheat sheets show a live preview and a
"Download SVG" button that builds the file in the browser (`resourceSheet()`) and saves it as
`marnie-draws-<id>.svg`. A worksheet's `drill` picks the page (`circles`, `lines`, `faces`, `boxes`,
`expressions`, `shading`); a palette lists six hex `colours`. Brush packs link to the newsletter. To offer
real files instead, replace the button in `initResources()` with a link such as
`<a href="downloads/your-file.pdf" download>`.

### Student gallery and lightbox

`initGallery()` renders `GALLERY` with a course filter (`?course=<course id>`). Each piece is a button
that opens `#lightbox`, a `<dialog>` showing the large artwork, title, student, their note and a link to
the course. Previous/next buttons and the Left/Right arrow keys move through the filtered set, Esc or
"Close" closes it and focus returns to the piece. `gallery.html?art=<id>` opens a piece directly (the
home work wall links this way).

### Mobile menu, reveals, back to top and toast

- Below 1024px the menu button toggles `#mobile-menu` (`aria-expanded`, Esc closes and returns focus).
- Elements with `.reveal` fade up as they scroll into view, and everything above them is revealed too. With
  reduced motion they are shown immediately, and the wobbling and bobbing doodles stop.
- `initBackToTop()` adds a round button after 700px of scrolling. Delete that call and the `.back-to-top`
  CSS block to remove it.
- `toast()` writes short confirmations into `#toast` (`role="status"`).

## Forms

No form sends anything until you connect it, although each success message reads as if it had been:

- The newsletter forms ask subscribers to look out for a confirmation email.
- The contact form thanks the sender by first name, says Marnie answers emails on Tuesdays and Thursdays (as
  the page says) and shows a reference (`MD-` and four characters, made in the browser by `makeRef()` in
  section 9 and written into `[data-success-ref]`).
- The sign-up dialog shows a reference too and says what happens next: a welcome email with the course login
  (free course), an email with a link to pay (paid course), a confirmation email with the joining link and,
  for paid workshops, an invoice (booking), or an email if a seat opens up (waitlist). The messages are in
  the submit handler in `initSignupDialog()`.

Change the wording to match how you actually handle sign-ups and payments, and show your form service's or
course platform's own reference if it returns one.

| Form | Where | Validates |
|------|-------|-----------|
| Newsletter (`[data-newsletter-form]`) | `index.html`, `newsletter.html` | Email required and well formed |
| Contact (`[data-contact-form]`) | `contact.html` | Name, email, topic, message (10+ characters) |
| Sign-up dialog (`[data-signup-form]`) | `course.html`, `workshops.html` | Name and email |

Validation is in `validate(form)` and reads the `required`, `type="email"` and `data-minlength`
attributes; errors appear under the field with `aria-invalid` and `aria-describedby`, and focus moves to
the first problem. `?topic=course|workshop|collab|other` on `contact.html` preselects the subject.

To connect the contact form to Formspree, give the form your endpoint and send it in the submit handler
in `initForms()` where the comment says "Connect here":

```html
<form action="https://formspree.io/f/your-id" method="post" data-contact-form novalidate>
```

```js
fetch(contact.action, { method: 'POST', body: new FormData(contact), headers: { Accept: 'application/json' } })
  .then(function (res) { if (!res.ok) throw new Error('Send failed'); /* show the success message */ })
  .catch(function () { /* show an error and keep the form */ });
```

The newsletter forms work the same way with your email provider's form endpoint (Buttondown, Kit,
MailerLite and others offer one). For the sign-up dialog, most course platforms (Teachable, Podia,
Thinkific and so on) and booking tools give you a checkout link: the simplest change is to turn the
enroll and book buttons into links to those pages, or to redirect from the submit handler in
`initSignupDialog()`.

## Saved data (localStorage)

| Key | Shape | Notes |
|-----|-------|-------|
| `sketch-saved` | `["draw-anything", "characters"]` | Saved course ids |
| `sketch-waitlist` | `["sleepy-moon"]` | Workshops the visitor asked to be waitlisted for |

Every read goes through `readIds()`: anything that isn't an array becomes `[]`, and only ids that are own
keys of `COURSE_BY_ID` or `WORKSHOP_BY_ID` are kept, without duplicates. All access goes through one
`safeStorage` object: when the browser blocks localStorage (a sandboxed iframe or strict privacy
settings), it falls back to an in-memory store, so saving still works for the page view. To reset, run
`localStorage.removeItem('sketch-saved')` and `localStorage.removeItem('sketch-waitlist')` in the browser
console, or clear the site's data.

## SEO and sharing

Each page has its own `<title>`, `meta name="description"`, Open Graph tags and `theme-color` in its
`<head>`. The course page title and description are replaced by the script with the course's own.

Social sites need an absolute image URL. Before launching, change `og:image` in every page from
`assets/img/og-image.png` to your full URL, for example
`https://www.example.com/assets/img/og-image.png`. Add a `sitemap.xml` listing your pages (use one
`course.html?id=` URL per course) and a `robots.txt`. If you want rich results, a `Course` structured data
block (JSON-LD) per course fits this template well.

## Accessibility

- Skip link, landmarks (`header`, `nav` with labels, `main`, `footer`) and one `<h1>` per page.
- Visible focus outlines on everything interactive; buttons and chips use `aria-pressed`, the menu uses
  `aria-expanded` and `aria-controls`.
- Dialogs are native `<dialog>` elements with `aria-labelledby`; focus returns to the opener.
- Live regions announce result counts, toasts and form success; the countdown has a readable summary.
- Decorative SVG is `aria-hidden`; artwork in the lightbox and course hero has a text label.
- Color pairs meet WCAG AA: marker colors always carry ink text, and colored text uses the `*-ink`
  tokens.
- `prefers-reduced-motion` turns off reveals, wobbles, bobbing doodles and smooth scrolling.

When editing, keep one `<h1>` per page, give every new input a `<label>`, and keep colored text on the
`*-ink` tokens.

## Building and deploying

The compiled CSS is committed, so you only rebuild after changing classes or `src/input.css`:

```sh
npm install
npm run build     # one-off, minified
npm run watch     # rebuild on every change
```

Tailwind scans the HTML files and `assets/js/main.js` for class names; classes built in JavaScript must
appear as whole strings.

To publish, upload the folder (without `node_modules`) to any static host: Netlify Drop, Cloudflare Pages,
GitHub Pages, Vercel or your own server. There is no server code.

## Troubleshooting

- **The countdown says the offer ended.** The date in `EARLY_BIRD_ENDS` (or a course's `ends`) has
  passed. Set a new date (`'YYYY-MM-DDTHH:MM'`, Eastern time), `null` for the rolling demo deadline, or set the
  course's `earlyBird: null`.
- **My workshop dates are wrong.** `KEEP_DEMO_CURRENT` is still `true`, so dates are moved forward. Set it
  to `false` after entering real dates.
- **No workshops are listed.** With `KEEP_DEMO_CURRENT = false`, every workshop's end time is in the past.
  Add new dates to `WORKSHOPS`.
- **Workshop times look an hour off.** Times are Eastern wall-clock times; the script works out EST or EDT for
  each date. Don't convert them to UTC yourself.
- **A course link shows "That course has wandered off".** The `?id=` doesn't match an `id` in `COURSES`.
- **New classes don't apply.** Rebuild the CSS with `npm run build`; classes used only in JavaScript must be
  written out in full.
- **Saved courses disappear after closing the tab.** The browser is blocking localStorage (private mode or
  an embedded preview), so the template keeps them in memory for that page view only.
- **Downloads don't start in an embedded preview.** Some sandboxed previews block downloads; open the page
  directly.

## License

MIT. The code and all included artwork are free for personal and commercial use; see `LICENSE.txt` in
the download.

The fonts (Lilita One, Be Vietnam Pro and Gochi Hand) are from Google Fonts under the SIL Open Font
License.

Marnie Draws, Marnie Ashdown, the students and their quotes are fictional placeholders; replace them with
your own content.
