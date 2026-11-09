# Steer documentation

## Overview

Steer is a website template for a driving school or an independent driving instructor. The demo brand is
**Brayline Driving School**, a fictional school in Eau Claire, Wisconsin with six instructors teaching automatic and
manual lessons across six ZIP codes around the city. It is built with plain HTML, Tailwind CSS v4 and one vanilla
JavaScript file, with no build step needed to run it. This is version 1.0.6 (see `template.json` and
[CHANGELOG.md](CHANGELOG.md)). Live demo: [freeframe.dev/templates/steer](https://freeframe.dev/templates/steer).

Copy uses American English, prices are in US dollars (USD) and every date and time is Central time
(`America/Chicago`), whatever the visitor's own time zone.

The permit and road test copy follows the Wisconsin DMV process as of November 2026 (the Motorists' Handbook and the
DMV's permit, probationary license and road test pages). Rules and fees change, so re-check them against
[wisconsindmv.gov](https://wisconsindmv.gov), and swap them for your own state's if you move the site.

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
| `index.html` | Home | Hero with ZIP code check and the next free lesson card, stats band, lesson types, four steps to a license, instructor strip with next free times, permit quiz teaser, latest passes, new-student offer |
| `lessons.html` | Lessons & prices | Price list, block booking table, intensive courses with start dates, Winter & Highway, price calculator |
| `instructors.html` | Instructors | Transmission, area and language filters, six instructor cards with portrait, car, areas, languages, days, hours, pass rate and next free lesson, "Choose" button |
| `book.html` | Book a lesson | Pick-up ZIP code check, transmission, lesson length, instructor, seven-day week view of free times, details form, summary panel and confirmation |
| `theory.html` | Permit test practice | Quiz start screen (quick ten, all 26, by topic), one question at a time with feedback, result ring and answer review, best scores |
| `areas.html` | Areas & test routes | ZIP code checker, SVG map with ZIP code picker, four test-route types |
| `passes.html` | Student passes | Live stats, transmission, instructor and first-time filters, passes wall |
| `faq.html` | FAQ | Live search with highlighted matches, four question groups |
| `contact.html` | Contact | Office open-now status, contact form with a reference, office hours with today highlighted, street map |
| `404.html` | Not found | Y-turn illustration and links back into the site |

## Project structure

```text
steer/
  index.html … 404.html     the ten pages (header and footer are repeated in each)
  assets/
    css/style.css           compiled Tailwind CSS (generated: don't edit by hand)
    js/main.js              all the data and interactions
    img/favicon.svg         the logo mark, used as the favicon
    img/og-image.svg        source of the social sharing image
    img/og-image.png        the social sharing image (1200 × 630)
    img/instructors/*.svg   one illustrated portrait per instructor
  src/input.css             Tailwind source: brand tokens and shared components
  package.json              scripts to rebuild the CSS
  README.md                 short introduction
  DOCS.md                   this guide
  CHANGELOG.md              version history
```

## Customizing

### Brand and colors

The design tokens live in the `@theme` block at the top of `src/input.css`:

| Token | Default | Used for |
|-------|---------|----------|
| `--color-route` | `#0b4f6c` | Brand blue: headings, buttons, links, selected states |
| `--color-route-dark` | `#083b52` | Button hover |
| `--color-night` | `#062536` | Footer, top strip, dark panels |
| `--color-teal` / `--color-teal-soft` | `#0c6e78` / `#dcf0f1` | Eyebrows, map areas, soft panels |
| `--color-sun` / `--color-sun-deep` / `--color-sun-soft` | `#ffc531` / `#f2ae00` / `#fff3d0` | The warm accent: primary buttons, lane markings, highlights |
| `--color-ink` / `--color-slate` / `--color-mist` | `#0d2230` / `#48606f` / `#b7cdd7` | Body text, secondary text on white, secondary text on dark |
| `--color-cloud` / `--color-line` | `#f1f6f8` / `#d3e1e7` | Alternate section background, borders |
| `--color-go` / `--color-stop` | `#17734a` / `#b42318` | Free times, right answers / errors, wrong answers |

Yellow is only used behind dark text or on dark backgrounds, never as text on white. To change the brand blue:

```css
@theme {
  --color-route: #1d4e89;
  --color-route-dark: #163c69;
}
```

Then rebuild the CSS. The SVG artwork uses the same colors as literal hex values, so search the HTML and
`assets/img/` for `#0b4f6c` and `#ffc531` if you want the drawings to follow.

### Typography

Headings use **Readex Pro** (500, 600, 700) and body text **Inclusive Sans** (400, 600), loaded from Google Fonts by
the `<link>` in every page's `<head>`. To swap them, change that link on each page and the two font tokens in
`src/input.css`:

```css
@theme {
  --font-sans: "Inclusive Sans", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Readex Pro", ui-sans-serif, system-ui, sans-serif;
}
```

### Content

Page text lives in the HTML files. Everything the interactions use lives in section 1 of `assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `SCHOOL` | Name and phone number used in generated messages |
| `TRANSMISSIONS` | `manual` and `automatic` with their hourly `rate` |
| `LESSON_LENGTHS` | Lesson lengths offered when booking (minutes → label) |
| `FIRST_RATE`, `FIRST_HOURS` | New-student offer: the first 2 hours at $55 an hour |
| `BLOCK_TIERS` | Block discounts: $ off each hour from 10, 20 and 30 hours |
| `STUDENT_DISCOUNT`, `TEST_CAR_PRICE`, `PASS_PLUS_PRICE` | 5%, $145 and $420 (`PASS_PLUS_PRICE` is the Winter & Highway course) |
| `INTENSIVES` | Intensive courses: hours, weeks, prices per transmission, who it suits |
| `INTENSIVE_LEAD_DAYS` | How far ahead the next intensive course starts (14 days) |
| `AREAS`, `NEARBY` | Covered ZIP codes with their neighborhoods and towns, and by-arrangement ZIP codes |
| `INSTRUCTORS` | The six instructors (see below) |
| `BOOK_AHEAD_DAYS`, `DEMO_BUSY`, `CLOSE_ON_BANK_HOLIDAYS`, `CHRISTMAS_BREAK`, `EXTRA_CLOSED` | Booking window and schedule rules |
| `OFFICE_HOURS` | Office hours per weekday for the contact page status |
| `TOPICS`, `QUESTIONS` | Permit test quiz topics and the 26 questions |
| `PASSES` | The student passes wall |
| `KEEP_DEMO_CURRENT`, `DEMO_ANCHOR` | Keep the passes wall recent (see [Demo dates](#demo-dates)) |

Prices also appear as text in `index.html` and `lessons.html` (the price list and the calculator labels). When you
change `TRANSMISSIONS` or the discounts, update that copy too.

To add an instructor, add an entry to `INSTRUCTORS` and a portrait at `assets/img/instructors/<id>.svg`:

```js
sian: {
  name: 'Sian Example', short: 'Sian', role: 'Instructor since 2022', t: 'manual',
  car: { body: 'hatch', colour: '#17734a', label: 'Green five-door hatchback', fuel: 'Gas' },
  areas: ['54701', '54703'], languages: ['English'], days: [1, 2, 3, 4, 5], hours: ['09:00', '17:00'],
  firstTime: 70, good: ['Nervous learners'],
  bio: 'One or two sentences about how they teach.'
}
```

`t` is `manual` or `automatic`, `days` uses 0 = Sunday … 6 = Saturday, `hours` are the first start time and the end
of the workday, and `car.body` is one of `hatch`, `suv`, `saloon` (the sedan shape) or `estate` (the station wagon shape), drawn by `carSvg()`; these ids are never shown. The cards,
filters, booking form, areas panel and passes filter all read from this object. Also add the portrait to the hero
grid in `instructors.html` if you want it there.

To add a quiz question, add an object to `QUESTIONS`; `answer` is the index of the right option:

```js
{ topic: 'rules', q: 'Your question?', options: ['A', 'B', 'C', 'D'], answer: 2, why: 'A short explanation.' }
```

Write your own questions rather than copying them from a state test. The demo's are written from the Wisconsin
Motorists' Handbook.

To add a pass, add an object to `PASSES` with a past `date` (`YYYY-MM-DD`), an `instructor` id, `t`, `first`
(first-time pass), `minors` (shown as notes from the examiner), `hours`, `area` and a short `quote`. Only publish students who have agreed to it.

### Images and artwork

All artwork is inline SVG or SVG files: the hero roundabout scene, lesson-type icons, the interstate scene, the quiz
card, the area map, four test-route drawings, the office street map and the 404 Y-turn are inline in the
pages; instructor portraits are `assets/img/instructors/*.svg` (200 × 200, shown in circles); instructor cars are
drawn by `carSvg()` in `main.js` from each instructor's `car` color and body. To use photos instead, replace the
portrait `src` in `portrait()` with your own square images (at least 400 × 400).

The social image is `assets/img/og-image.png` (1200 × 630), generated from `assets/img/og-image.svg`. Edit the SVG,
then export a PNG at the same size with any SVG tool. `assets/img/favicon.svg` is the logo mark.

### Navigation, header and footer

The header (top strip, logo, desktop menu, mobile menu) and the footer are repeated in every page. To add or remove a
page, edit the `<nav aria-label="Main">` list, the `#mobile-menu` list and the footer lists in each HTML file, and
mark the current page's links with `aria-current="page"`. The desktop menu uses short labels (Prices, Permit test,
Areas…); the mobile menu and footer use the long ones.

## Features

### Lesson availability

Section 3 of `main.js` works out each instructor's free times from today, so the demo never shows a past or empty
schedule. `freeUnits(id, key)` splits a business day (from `hours[0]` to `hours[1]`, on `days` only) into half-hour units
and marks some as already booked with a seeded pseudo-random pattern (`hash()`), roughly `DEMO_BUSY` percent of the
day. `startsFor()` lists the on-the-hour start times with enough free units for a lesson, `slotsOn()` merges
instructors for a day and `nextFree()` finds the earliest free lesson for a filter (`t`, `area`, `instructor`).

Lessons can be booked from tomorrow (`FIRST_BOOKABLE`) up to `BOOK_AHEAD_DAYS` (28) days ahead. Sundays have no
lessons because no instructor lists day 0; federal holidays, the holiday break and `EXTRA_CLOSED` days are skipped by
`closedReason()`.

To connect a real schedule, replace `freeUnits()` with data from your booking system (an array of free half-hour units
per instructor and day), or replace `startsFor()` entirely.

### Federal holidays and closures

`bankHolidays(year)` returns the eleven US federal holidays for any year by rule, on the day they're observed: one
that falls on a Saturday moves to the Friday before, one on a Sunday to the Monday after. Christmas Day is always
closed, and `CHRISTMAS_BREAK` closes every day from December 24 to January 1 inclusive, whatever weekday Christmas
falls on:

```js
const CHRISTMAS_BREAK = { from: '12-24', to: '01-01', label: 'Holiday break' };
```

Set it to `null` to teach between Christmas and New Year's (federal holidays are still skipped), and
`CLOSE_ON_BANK_HOLIDAYS` to `false` to teach on federal holidays. Other closures go in `EXTRA_CLOSED`:
`{ md: 'MM-DD', label }` closes that date every year, `{ md: 'YYYY-MM-DD', label }` once (a staff day, a move).

### Next free lesson

The top strip of every page (`[data-next-slot-short]`) and the home page card (`[data-next-card]`) show the next free
2-hour lesson with anyone, link to `book.html` with that slot, instructor and transmission filled in, and count the free
times in the next seven days. The instructor cards, home strip and areas panel show each instructor's next free hour.

### Booking

`book.html` (`[data-booking]`) has four parts:

1. **ZIP code**: checked with `parsePostcode()` and `coverage()`. A covered ZIP code narrows the instructor list to
   those who teach there; others in the list are disabled with "doesn't cover 54720".
2. **Lesson**: transmission, length (`LESSON_LENGTHS`) and instructor. The instructor list only shows instructors for the
   chosen transmission. Picking one saves it (see [Saved data](#saved-data-localstorage)).
3. **Week view** (`[data-week]`): seven days at a time from tomorrow, with previous and next buttons up to four weeks
   ahead. Each day lists free start times as buttons with `aria-pressed`; a day off shows why (Sunday, a federal holiday
   name, the holiday break). When several instructors are free at once, the saved instructor wins, then the first
   in `INSTRUCTORS`. If nothing is free in the visible week, a link jumps to the next free time.
4. **Details**: name, cell number, email, instruction permit status, first-lesson offer and notes.

The summary panel shows the pick-up, lesson, instructor, time and price (the first two hours at `FIRST_RATE` when "This
is my first lesson" is checked). Submitting shows a confirmation with a reference such as `BL-4K7QZ` and what happens
next. Changing the transmission, length or instructor drops a picked time that is no longer free.

### ZIP code checker

Every `[data-postcode-form]` (home and areas pages) and the booking form accept a 5-digit ZIP code (`54703`) or ZIP+4
(`54703-1234`). The answer is "covered" (ZIP codes in `AREAS`, listing neighborhoods, towns and instructors), "by
arrangement" (`NEARBY`) or "not covered". On the areas page a covered result also selects that ZIP code on the map; a by-arrangement result highlights its pill.

### Price calculator

`lessons.html#calculator` (`[data-calc]`) prices weekly lessons or an intensive course with `quote()`:

- Weekly lessons: 1 to 45 hours. The first `FIRST_HOURS` hours are at `FIRST_RATE` for new students; the rest at the
  hourly rate less the highest matching `BLOCK_TIERS` discount. Students get `STUDENT_DISCOUNT` off blocks of 10 hours
  or more. The test car is optional.
- Intensive courses: the fixed `INTENSIVES` price, which includes the test car; the new-student offer doesn't apply.
- The Winter & Highway course can be added to either.

It shows each line, the total, the average per hour (everything but Winter & Highway divided by the lesson hours, labeled
"road test car included" whenever the test car is in the price, as it always is for an intensive course), the saving
against pay-as-you-go and a rough number of weeks at two hours a week. The block table and intensive cards on the same page are built from the same constants. "Copy
link" copies a URL with the choices; if the clipboard isn't available the link is shown instead.

### Intensive course dates

`intensiveStarts()` lists the next three Mondays at least `INTENSIVE_LEAD_DAYS` days away whose Monday to Friday has
no federal holiday or closure, so the dates always roll forward.

### Instructors

`instructors.html` builds a card for each `INSTRUCTORS` entry with filters for transmission (chips with `aria-pressed`),
pick-up area and language (selects), a live count and an empty state. "Choose Lowri" saves the instructor; the button
then reads "Your instructor" and the hero shows the name with a "Book with them" link. Click again to clear it.
`?t=manual` and `?area=54720` preset the filters.

### Permit test quiz

`theory.html` (`[data-quiz]`): choose "Quick ten" (ten random questions), "All 26" or one topic, then answer one
question at a time. Answers are real radio buttons; "Check answer" marks them right or wrong and explains, and the
final screen shows a score ring, a passing-score message (80%, as on the Wisconsin knowledge test) and a review of every question with a
"Only the ones I missed" toggle. "End quiz" finishes early with the questions answered so far. The best score per mode
or topic is saved and shown in the sidebar; "Clear my scores" removes them. `?mode=full` and `?topic=weather` preset
the start screen.

### Areas map

The map in `areas.html` is inline SVG: each ZIP code is a `path.district` and a `g.district-label` with
`data-district="54703"`. The ZIP code buttons (`[data-district-buttons]`) are built from `AREAS`; choosing one sets
`data-active` on the map shapes and fills the panel with the ZIP code's neighborhoods and towns, instructors and their next free
lesson. `?area=54720` opens a ZIP code. If you change the ZIP codes, redraw the paths and labels to match.

### Passes wall

`passes.html` shows `PASSES` newest first with transmission, instructor and first-time filters, a live count and stats
(passes, first-time share, average examiner notes, latest pass). `?i=lowri` presets the instructor. The home page shows the
three latest.

### Demo dates

The passes are written for the week of `DEMO_ANCHOR` (`2026-10-21`). While `KEEP_DEMO_CURRENT` is `true`, every pass
date moves forward by the whole weeks since then, so weekdays stay right and the wall always looks recent; on the day it
was written the dates are exactly as typed. On a real site set it to `false` and enter real pass dates:

```js
const KEEP_DEMO_CURRENT = false;
```

Everything else that is dated is worked out from today by rule: lesson availability, the next free lesson, intensive
course start dates, the office status, relative dates ("3 days ago") and the copyright year in the footer
(`[data-year]`). `?at=2027-03-15T10:30` previews any page at an Eau Claire date and time.

### FAQ search

`[data-faq-search]` filters the `details[data-faq]` items as you type (every word must match), hides empty groups,
opens and highlights matches with `<mark>`, and announces "3 questions match …" or shows a "Nothing matches" box.
`?q=` prefills the search.

### Header, mobile menu, reveals and back to top

The mobile menu button has `aria-expanded` and `aria-controls`; Esc closes it and returns focus. Elements with
`.reveal` fade up once as they scroll into view (instantly with reduced motion). The back-to-top button is the separate
block at the end of `main.js`; sticky panels marked `data-back-to-top-hide` hide it while it would cover them.

## Forms

| Form | Where | Validates |
|------|-------|-----------|
| ZIP code check | `index.html`, `areas.html` `[data-postcode-form]` | A 5-digit ZIP code, optionally with +4 |
| Booking request | `book.html` `[data-booking]` | Covered ZIP code, a picked time, name, US phone, email, instruction permit status |
| Contact | `contact.html` `[data-contact-form]` | Name, email, optional US phone, message (10+ characters); `?topic=` preselects the subject |

Errors appear under each field (`[data-error="name"]`) with `aria-invalid`, and focus moves to the first problem. The
forms don't send anything until you connect them. To connect one, post it where the comments in `main.js` say, for
example with Formspree:

```js
// in the contact submit handler, before showing the thank-you panel
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(contact),
  headers: { Accept: 'application/json' }
}).then((res) => {
  if (!res.ok) throw new Error('Send failed');
  // show the thank-you panel here
});
```

The booking time isn't a form field, so add it before sending:
`const data = new FormData(booking); data.append('date', st.slot.key); data.append('time', hhmm(st.slot.mins)); data.append('instructor', st.slot.id);`.
For live availability, connect the schedule as described in [Lesson availability](#lesson-availability).

## Saved data (localStorage)

| Key | Shape | Validated on read |
|-----|-------|-------------------|
| `steer:instructor` | `"rhona"` | Must be an own key of `INSTRUCTORS`; anything else counts as no choice. |
| `steer:quiz` | `{ "quick": { "score": 8, "total": 10, "date": "2026-10-21" }, "topic-weather": { … } }` | Keys must be `quick`, `full` or `topic-` plus a `TOPICS` id; `score` and `total` must be whole numbers with `0 ≤ score ≤ total ≤ 26`; `date` must be a real `YYYY-MM-DD` date. Invalid entries are dropped. |
| `steer:plan` | `{ "mode": "weekly", "t": "manual", "h": 20, "course": "i30", "first": true, "student": false, "testcar": true, "plus": false }` | `mode` must be `weekly` or `intensive`, `t` an own key of `TRANSMISSIONS`, `h` a whole number from 1 to 45, `course` an own key of `INTENSIVES`, the rest booleans; anything else falls back to the defaults. |

Contact and booking details are not stored. All storage goes through one `safeStorage` object: `localStorage`, or an
in-memory stand-in when the browser blocks storage (a sandboxed iframe, strict privacy settings), so choosing an
instructor, quiz scores and the calculator keep working for the page view. To reset, use "Clear my scores" on the
permit test page, click your chosen instructor again, or run `localStorage.removeItem('steer:plan')` in the browser console.

### URL parameters

| Parameter | Page | Values |
|-----------|------|--------|
| `?at=2027-03-15T10:30` | every page | Preview the site at an Eau Claire date and time |
| `?i=`, `?t=`, `?d=`, `?slot=`, `?postcode=` | `book.html` | Instructor id, `manual`/`automatic`, `60`/`90`/`120`, `YYYY-MM-DDTHH:MM`, a ZIP code |
| `?mode=`, `?t=`, `?h=`, `?course=` | `lessons.html` | `weekly`/`intensive`, transmission, hours (1–45), an `INTENSIVES` id |
| `?t=`, `?area=` | `instructors.html` | Transmission filter, an `AREAS` id |
| `?mode=`, `?topic=` | `theory.html` | `quick`/`full`, a `TOPICS` id |
| `?area=` | `areas.html` | An `AREAS` id |
| `?i=` | `passes.html` | An instructor id |
| `?q=` | `faq.html` | Search words (first 80 characters) |
| `?topic=` | `contact.html` | `lessons`, `test`, `intensive`, `area`, `gift` or `other` |

Ids are always checked with `Object.prototype.hasOwnProperty.call(...)`, so `?i=constructor` or `?area=__proto__` are
ignored. A `?slot=` is only used if that time is still free for the chosen instructor and transmission.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `theme-color` in its `<head>`, with
`lang="en-US"`. After deploying, change `og:image` to an absolute URL (for example
`https://www.yourschool.example/assets/img/og-image.png`), since social sites don't read relative image paths. Add a
`sitemap.xml` and `robots.txt` at the site root if your host doesn't generate them. For local search, consider adding
`DrivingSchool` structured data (JSON-LD) with your address, phone and hours to `index.html` and `contact.html`.

## Accessibility

- Skip link, landmarks, one `<h1>` per page and a logical heading order.
- Visible focus outlines everywhere (blue on light, yellow on dark).
- Filter chips, ZIP code buttons and time slots use `aria-pressed`; time slots have full labels such as "Friday, October
  23, 10am with Lowri Pennick".
- Quiz answers are native radio buttons in a `fieldset`; focus moves to each new question and to the result.
- Counts, results and confirmations are live regions (`role="status"` / `aria-live="polite"`); form errors use
  `aria-invalid` and `aria-describedby`.
- Drawings have `role="img"` with a `<title>`; decorative portraits have empty `alt`.
- Color contrast meets WCAG AA; yellow is only used behind dark text or on dark backgrounds.
- Scroll reveals, the progress bar and smooth scrolling respect `prefers-reduced-motion`.

When editing, keep one `<h1>` per page, give every new input a `<label>`, and keep `aria-describedby` ids in step with
the error elements.

## Building and deploying

### Rebuilding the CSS

The compiled `assets/css/style.css` is included. If you add Tailwind classes or change `src/input.css`:

```sh
npm install
npm run build    # or: npm run watch
```

Tailwind finds classes in the HTML and in `assets/js/main.js`; write class names in full (not built from pieces).

### Deploying

Upload the folder to any static host: Netlify Drop, Cloudflare Pages, GitHub Pages, Vercel or your own server. No
server code is needed. Leave out `src/`, `package.json` and `node_modules/` if you like; the site only needs the HTML
files and `assets/`.

## Troubleshooting

- **The week view shows no free times.** Check `days` and `hours` for each instructor, `BOOK_AHEAD_DAYS` and
  `DEMO_BUSY` in `assets/js/main.js`. A high `DEMO_BUSY` fills the demo schedule; set it to `0` to show every hour free.
- **A holiday is missing.** `bankHolidays()` follows the US federal holidays; add state or one-off closures to
  `EXTRA_CLOSED` as `{ md: 'YYYY-MM-DD', label }`.
- **A ZIP code is rejected.** `parsePostcode()` accepts 5 digits with an optional +4. Add ZIP codes to `AREAS` or
  `NEARBY` to cover them.
- **Prices don't match between pages.** Prices live in `TRANSMISSIONS`, `BLOCK_TIERS`, `INTENSIVES` and the other
  price constants, and as text in `index.html` and `lessons.html`; update them together.
- **Saved choices disappear after closing the tab.** The browser is blocking storage (private mode, a sandboxed
  iframe); the site falls back to memory for that page view.
- **The passes wall shows different dates from the code.** `KEEP_DEMO_CURRENT` is moving them forward; set it to
  `false`.
- **New Tailwind classes have no effect.** Rebuild the CSS (`npm run build`).
- **The social preview has no image.** Make `og:image` an absolute URL after deploying.

## License

MIT. The code and all included artwork are free for personal and commercial use; the full text is in `LICENSE.txt`,
included in the download. Readex Pro and Inclusive Sans are licensed under the SIL Open Font License. Brayline Driving
School, its instructors, students, passes and reviews are fictional, and the permit test questions are original practice
questions, not the official DMV test.
