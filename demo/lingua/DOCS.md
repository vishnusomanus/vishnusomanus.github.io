# Lingua documentation

## Overview

Lingua is a complete website for a language school that teaches adults in small groups, in person and online. It is
shown as **Lingua Language School**, a fictional school on Villita Lane in San Antonio with thirteen courses in Spanish,
French, Italian, German, Japanese and Portuguese. It has a course catalog with filters, course pages with a syllabus
and teacher, an interactive placement test that recommends a course, a weekly schedule, teachers, fees and a
four-step enrollment form. This is the **HTML + Tailwind CSS v4** version (1.0.8): plain HTML files, one stylesheet
and one vanilla JavaScript file, with no build step needed to run it.

Live demo: [freeframe.dev/templates/lingua](https://freeframe.dev/templates/lingua)

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Every page and feature works straight from the file system.

To preview it the way a host serves it, run any static server in the folder:

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

You only need Node.js 24 (for `npm`) if you change `src/input.css` or add Tailwind classes that aren't used yet
(see [Building and deploying](#building-and-deploying)).

## Pages

| File | Page | Notable sections and features |
|------|------|-------------------------------|
| `index.html` | Home | Hero with greeting bubbles, six language cards, how it works, in person and online, three featured courses, student quotes, teachers, placement test call to action |
| `courses.html` | Courses | Every course as a card, filters by language, level and format (kept in the URL), level guide |
| `course.html` | Course | One course chosen with `?id=<course id>`: key facts, fee and seats left, tabs for overview, syllabus and teacher, related courses |
| `placement.html` | Placement test | A language plus ten can-do questions, a CEFR level estimate and recommended courses |
| `teachers.html` | Teachers | Eight teacher cards with a language filter and the courses each teaches |
| `timetable.html` | Schedule | Monday to Saturday week view with filters by language, format and time of day |
| `enrol.html` | Fees & enrollment | Prices in tabs (group, private, companies), good-to-know facts, four-step enrollment form with a live fee summary |
| `about.html` | About | Story and figures, teaching method, the building, FAQ |
| `contact.html` | Contact | Contact form (topic prefilled from the URL), map, address, front desk hours, getting here |
| `404.html` | Not found | Friendly 404 page for your host to serve |

## Project structure

```text
lingua/
├── index.html … contact.html, 404.html   one HTML file per page
├── assets/
│   ├── css/style.css     compiled Tailwind CSS (generated: don't edit by hand)
│   ├── js/main.js        all interactivity, plus the course, teacher, syllabus and fee data
│   └── img/              SVG artwork, teachers/ portraits, logo.svg, favicon.svg, og-image.svg (source) and og-image.png
├── src/input.css         Tailwind source: design tokens (@theme) and component classes
├── package.json          scripts to rebuild the CSS
├── README.md             short introduction
├── DOCS.md               this guide
├── CHANGELOG.md          version history
└── LICENSE.txt           MIT license (added to the download)
```

## Customizing

### Brand and colors

All design tokens are in the `@theme` block at the top of `src/input.css`. Tailwind turns each `--color-*` token into
utilities (`bg-brand`, `text-tomato-ink`, `border-ink`...), so changing a token re-skins the whole site.

| Token | Used for |
|-------|----------|
| `--color-paper`, `--color-paper-2` | Page background and panels |
| `--color-ink` | Text, the outlines and offset "sticker" shadows, dark sections |
| `--color-muted` | Secondary text |
| `--color-brand`, `--color-brand-dark`, `--color-brand-soft` | Ultramarine buttons, links and highlights |
| `--color-tomato` / `--color-tomato-ink` | Decorative accent / accent text (eyebrows, "seats left") |
| `--color-sun`, `--color-mint` | Yellow highlights (level badges, call to action) and success panels |
| `--color-es` … `--color-pt` (+ `-ink`, `-solid`) | One color pair per language, applied with the `tone-es` … `tone-pt` classes |

For example, to make the brand color teal:

```css
@theme {
  --color-brand: #0f6f69;
  --color-brand-dark: #0b5651;
  --color-brand-soft: #dcf1ee;
}
```

Keep small text at WCAG AA contrast (4.5:1): `--color-tomato` is decorative only, which is why text uses
`--color-tomato-ink`. Rebuild the CSS afterwards (`npm run build`).

The look comes from a few component classes in `src/input.css`: `.card` (white box with a 2px ink outline and an
offset shadow), `.btn-primary`, `.btn-secondary` and `.btn-sun`, `.bubble` (a speech bubble with a tail), `.eyebrow`
(a label with a small bubble before it), `.squiggle` (the hand-drawn underline in headings), `.chip`, `.level-badge`,
`.choice` (radio and checkbox cards) and `.tab`.

### Typography

Two Google Fonts are loaded in the `<head>` of every page:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Lexend:wght@300..700&amp;family=Young+Serif&amp;display=swap">
```

**Young Serif** is the display face (`font-display`, headings and prices) and **Lexend** the text face (`font-sans`).
To swap them, change that link on every page and the two `--font-*` tokens in `src/input.css`. Young Serif has a
single weight, so headings use `font-normal`.

### Content

Text is in the HTML files. The data the scripts need is at the top of `assets/js/main.js`:

| Constant | Contents |
|----------|----------|
| `LANGS` | The six languages: `id` (used in URLs), `code`, `name`, `tone` (color class) |
| `LEVELS` | CEFR levels A1 to C1 with a name and a one-line description |
| `COURSES` | Every course: `id`, `lang`, `level`, `format` (`in-person` or `online`), `title`, `days` (0 = Monday … 5 = Saturday), `start`, `end`, `weeks`, `starts` (`YYYY-MM-DD`), `fee` (dollars), `teacher`, `seats`, `room`, `summary`, `description` |
| `KEEP_DEMO_CURRENT`, `TERM` | `true` and `{ starts: '2027-01-11', ends: '2027-03-26' }`: the term the courses belong to. Once it has started, the demo moves the term and every course start on by whole weeks to the same term next year (see [Demo dates](#demo-dates)). Set it to `false` once `COURSES` and `TERM` hold your real dates |
| `TEACHERS` | Name, role, home town, years teaching, bio and quote |
| `SYLLABUS`, `OUTCOMES` | Five modules and four outcomes per level, shared by every language |
| `BOOK_PRICE`, `CONCESSION` | The optional course book ($28) and the discount (0.15) |

The course page, the related courses, the placement test's recommendations and the enrollment form are built from
`COURSES`. The course cards on `index.html` and `courses.html`, the schedule, the teacher cards and the enrollment
form's course list are HTML, so a new course needs both. To add one:

1. Add an entry to `COURSES`:

   ```js
   { "id": "fr-b1-online", "lang": "french", "level": "b1", "format": "online", "title": "French Intermediate", "days": [2], "start": "19:00", "end": "20:30", "weeks": 10, "starts": "2027-01-13", "fee": 320, "teacher": "julien-mbaye", "seats": 8, "room": "Online", "summary": "…", "description": "…" }
   ```

2. Copy an `<article data-course-card …>` in `courses.html` and update its `data-lang`, `data-level`,
   `data-format`, link (`course.html?id=fr-b1-online`), the `data-course-from` id on its "weeks from" line, text
   and fee.
3. Add an `<li data-session …>` to each day it runs in `timetable.html` (`data-time` is `morning`, `lunchtime` or
   `evening`).
4. Add an `<option value="fr-b1-online">` to the French `<optgroup>` of `#e-course` in `enrol.html`, and the course
   to its teacher's "Teaching this term" line in `teachers.html`.

Course ids must stay lowercase: links and saved drafts use them.

#### Demo dates

The demo is written for the winter term in `TERM` (January 11 to March 26, 2027). While `KEEP_DEMO_CURRENT` is
`true` and that term has started, the term and every course's `starts` move forward to the same term the next year,
by whole weeks so weekdays never change (January 11, 2027 becomes January 10, 2028), so visitors never see a course
that has already begun. The script also fills in the dates written in the pages: `data-term="year"` (the eyebrows
on `courses.html` and `timetable.html`), `data-term="starts"` and `data-term="ends"` (the schedule intro) and
`data-course-from="<course id>"` ("10 weeks from Jan 11" on each course card). **Set `KEEP_DEMO_CURRENT = false`
when you enter your real term dates**, and keep the dates written in the HTML in step with them.

### Images and artwork

Everything is original SVG in `assets/img/`: `hero-class.svg` (1200 × 1000), `in-person.svg` and `online.svg`
(1200 × 800), `school.svg` and `map.svg` (1200 × 900) and the teacher portraits in `assets/img/teachers/`
(600 × 500, one file per teacher id). The greeting bubbles around the home illustration are HTML (`[data-hello]`).

To use photos, replace the file (keep the aspect ratio or change the `aspect-[…]` class on the `.art` wrapper) and
update the `alt` text. Images inside `.art` are cropped with `object-fit: cover`. For a new teacher, add
`assets/img/teachers/<teacher id>.svg` (or change the `src`).

The social image is `og-image.png` (1200 × 630), rendered from `og-image.svg`. The favicon and the header logo are
`favicon.svg` and `logo.svg`.

### Navigation, header and footer

The header and footer are repeated in every HTML file. To add a page, copy an existing page, then add a link to the
`<nav aria-label="Main">` list, the mobile menu list (`#mobile-menu`) and the footer on every page. The current page
gets `aria-current="page"` on its links (the course page marks Courses).

## Features

### Course filters

`courses.html`: three selects in `form[data-course-filters]` filter the `[data-course-card]` articles by
`data-lang`, `data-level` and `data-format`. The count above the grid (`[data-course-count]`) is a live region, and
`[data-course-empty]` appears when nothing matches. Filters are written to the URL (`courses.html?lang=french&format=online`)
with `history.replaceState`, so a filtered list can be shared or bookmarked; the home page's language cards link to
these URLs. Code: `initCourseFilters()`.

URL values are read in any case (`?LANG=French` works), and only values that exist as options are accepted;
anything else is ignored.

### Course page

`course.html?id=<course id>` shows that course: `initCoursePage()` fills every `[data-course-field]` (title, chips,
schedule, start date, length in hours, place, teacher, fee, seats left, overview, outcomes, syllabus and teacher
tab), points the enroll button to `enrol.html?course=<id>#enrol` and the placement link to
`placement.html?lang=<language>`, rebuilds the related courses (other courses in the same language first) and sets the
page title. The id is matched in any case; an unknown or missing id shows the course in the markup (the first one).
Seats left under four are shown in the accent color.

Syllabus weeks are spread over the course length (a two-week intensive shows "Part 1" to "Part 5"). Dates are plain
strings formatted without `Date` objects, so the page shows the same thing in every time zone.

### Tabs

The course page (Overview, Syllabus, Your teacher) and the prices on `enrol.html` (Group courses, Private lessons,
For companies) use the ARIA tabs pattern: `role="tablist"`, `role="tab"` with `aria-selected` and `aria-controls`,
`role="tabpanel"`. Left and right arrows move between tabs (wrapping), Home and End jump to the first and last, and
only the selected tab is in the tab order. A hash naming a panel opens it: `enrol.html#private` and
`enrol.html#companies`. Code: `initTabs()`.

### Placement test

`placement.html` asks for a language, then shows ten "can-do" statements one at a time (two per level from A1 to
C1), each answered *Not yet* (0), *With some effort* (1) or *Easily* (2). Next without an answer shows an inline error
and focuses the first option; Back returns to the previous step; each step moves focus to its question, and a
progress bar and "Step n of 11" show where you are.

The score (0–20) gives the level through `PLACEMENT_BANDS` (`[5, 9, 13, 17]`: 5 or more is A2, 9 B1, 13 B2, 17 C1).
`recommend()` then lists the language's courses at that level, or the nearest level (the lower one when two are as
close), with a note when there is no exact match, an "Enroll in …" button and a link to all that language's courses.
The result is saved (see [Saved data](#saved-data-localstorage)) and shown again on the next visit; "Start again"
clears it. `placement.html?lang=german` starts a fresh test with that language chosen. Code: `initPlacement()`.

To change the questions, edit the statements in `placement.html` (keep ten, or update `PLACEMENT_QUESTIONS`, which
is used to validate saved results) and the thresholds in `PLACEMENT_BANDS`.

### Teacher filter

`teachers.html`: the buttons in the "Filter by language" group are toggle buttons (`aria-pressed`). Each teacher card
lists its languages in `data-langs`; the count is a live region. `teachers.html?lang=portuguese` (any case) starts
filtered, and choosing a filter updates the URL. Code: `initTeacherFilter()`.

### Schedule

`timetable.html` shows one column per day with a card per class (`[data-session]`, colored by language). Filters:
language, format and time of day (mornings start before noon, lunchtimes before 5 PM, evenings later; Saturdays
match the Saturday column). Empty days show "No classes", and a message appears when nothing matches. Filters are
kept in the URL (`?lang=&format=&time=`, any case). Code: `initTimetable()`.

### Enrollment form

`enrol.html#enrol` is a four-step form (`form[data-enrol-form]`):

1. **Course**: a required select grouped by language, with when, where, teacher and seats left below it.
2. **Your details**: first and last name, email (checked for a valid address), an optional phone (digits, spaces,
   `+`, `(`, `)` and `-`, at least seven digits), and whether you've studied the language before.
3. **Options**: pay in full or in three monthly installments, the 15% discount rate and the $28 course book.
4. **Review**: everything you entered, the total and a required terms checkbox.

The step indicator marks the current step with `aria-current="step"`; each step validates before moving on, shows
inline errors and focuses the first invalid field. The summary (`[data-summary]`) updates live with the fee, the discount, the book, the total and, for installments, the three payments (the last absorbs any rounding, so they add
up exactly). Fees are calculated in cents by `enrolQuote()`.

`enrol.html?course=<id>` (any case, own ids only) chooses the course; the course page and placement result link
here. Confirming shows a thank-you panel that confirms the enrollment, promises an email within one business day and
shows a short reference (`LI-` and four characters, made in the browser by `makeRef()`; show your booking system's own
reference instead if it returns one), and clears the draft. Code: `initEnrol()`.

### Header, mobile menu and scroll reveals

The header gets a border once the page scrolls (`.site-header.is-scrolled`). Below 1024px the menu button
(`#menu-toggle`, with `aria-expanded`) opens `#mobile-menu`; Esc closes it and returns focus to the button, and the
page doesn't scroll behind it. Elements with `.reveal` fade in as they scroll into view; revealing one also reveals
everything above it. The home page's greeting bubbles bob gently (`.bob`). With reduced motion, reveals, the bobbing
and smooth scrolling are all off.

### Back to top

A round button appears after scrolling about one screen. It scrolls to the top (instantly with reduced motion) and
moves focus to `<main>`. It hides while it would cover the sticky course fee card or enrollment summary
(`data-back-to-top-hide`). To remove it, delete the "Back to top" block at the end of `main.js` and the `.back-to-top`
styles in `src/input.css`.

## Forms

| Form | Page | Validates |
|------|------|-----------|
| Placement test (`data-placement-form`) | `placement.html` | An answer on every step |
| Enrollment (`data-enrol-form`) | `enrol.html` | Each step (see above) |
| Contact (`data-form="contact"`) | `contact.html` | Name, email, message of at least 20 characters |
| Newsletter (`data-form="newsletter"`) | Footer of every page | Email |

Every `form[data-form]` is handled by `initForms()`: errors appear under each field (in the element named by
`aria-describedby`), focus moves to the first invalid field, and a success message (`[data-form-success]`) is shown.
`contact.html?topic=private` (any case) chooses the topic; only the select's own values (`general`, `courses`,
`placement`, `private`, `companies`) are accepted. The contact form's success message shows a short reference
(`[data-ref]`: `LI-` and four characters, made by `makeRef()`) and promises a reply within one business day, like the
note above the form; the newsletter one asks subscribers to look out for a confirmation email. Change them to match
what really happens. **The forms don't send anything** until you connect them, although their success messages read
as if they had.

To send the contact and newsletter forms with a form service such as [Formspree](https://formspree.io), replace the
comment in the submit handler of `initForms()`:

```js
// To send for real: fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form) })
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (!res.ok) throw new Error('Request failed');
  form.reset();
  if (success) { success.classList.remove('hidden'); success.focus(); }
}).catch(function () {
  alert('Sorry, your message could not be sent. Please try again or email us.');
});
```

and remove the lines after it that reset the form and show the success message straight away (keep the two lines
that fill in `[data-ref]`, or use your form service's reference). To use different endpoints, branch on
`form.dataset.form` (`contact`, `newsletter`).

The enrollment form is sent in the same way from the last branch of its submit handler in `initEnrol()` (look for
"To send for real"). Send `new FormData(form)`, or `JSON.stringify(draft)` plus `enrolQuote(draft)` if your booking
system takes JSON, and show the thank-you panel only once it succeeds. Take real payments on your payment
provider's own page, never in this form.

## Saved data (localStorage)

| Key | Shape |
|-----|-------|
| `lingua:enrol:v1` | `{ course, first, last, email, phone, experience, plan, concession, book, heard }` — the enrollment in progress |
| `lingua:placement:v1` | `{ lang, answers }` — the last placement result (`answers`: ten numbers, each 0, 1 or 2) |

Every read is validated:

- the enrollment draft goes through `sanitizeDraft()`: `course` must be a course id, the text fields lose control
  characters and are cut to their maximum length, `experience`, `plan` and `heard` must be one of their values and
  `concession` and `book` must be `true` to count. The repaired draft is written back, and JSON that can't be parsed
  is removed;
- a placement result must name a known language and have exactly ten answers of 0, 1 or 2, otherwise it's removed
  and the test starts from the beginning.

The draft is saved on every change and cleared after confirming. To reset by hand, run
`localStorage.removeItem('lingua:enrol:v1')` or `localStorage.removeItem('lingua:placement:v1')` in the browser
console. If storage is blocked (some private windows), everything still works; nothing is remembered.

## SEO and sharing

Each page has its own `<title>`, `<meta name="description">`, Open Graph tags and a `theme-color` in `<head>`. The
course page also updates `document.title` for the course shown. Update them for your school.

`og:image` is the relative path `assets/img/og-image.png`. Social networks need an **absolute** URL, so when you
deploy, change it on every page:

```html
<meta property="og:image" content="https://www.your-school.com/assets/img/og-image.png">
```

Suggestions for launch:

- add a `sitemap.xml` listing your pages, including every `course.html?id=…`, and a `robots.txt`;
- add [`EducationalOrganization`](https://schema.org/EducationalOrganization) and [`Course`](https://schema.org/Course) structured data
  (JSON-LD) with your address and courses.

## Accessibility

Built in:

- a "Skip to content" link and landmarks (`header`, `nav`, `main`, `footer`) on every page;
- visible focus rings (`:focus-visible` and `.choice:has(input:focus-visible)` in `src/input.css`);
- one `h1` per page, and level badges with hidden "Level" text for screen readers;
- form errors linked with `aria-describedby` and `aria-invalid`, focus moved to the first error, and focus moved to
  each new step's heading in the placement test and enrollment form;
- tabs, toggle buttons and step indicators using the standard ARIA patterns (`role="tab"`, `aria-pressed`,
  `aria-current="step"`), and native radio buttons and checkboxes inside the choice cards;
- live regions for filter counts, the course details in the enrollment form and the fee summary;
- reduced motion respected by reveals, the bobbing bubbles, smooth scrolling and the back-to-top button;
- text colors that meet WCAG AA contrast; the language colors pair a light background with a dark text color.

When editing, keep one `h1` per page, give every new input a `<label>`, keep `alt` text meaningful, and check contrast
if you change colors.

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` is compiled and included. Rebuild it only after editing `src/input.css` or using Tailwind
classes that aren't in the HTML yet:

```sh
npm install
npm run build    # or: npm run watch while you edit
```

Tailwind scans the HTML and `main.js` for class names, so classes written in JavaScript strings are included.

### Deploying

The folder is a static site. Upload it as it is:

- **Netlify Drop:** drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **GitHub Pages:** push the files to a repository and enable Pages for the branch.
- **Cloudflare Pages / any static host:** upload the folder; no build command is needed.

Configure your host to serve `404.html` for missing pages (Netlify and GitHub Pages do this automatically). You can
leave out `src/`, `package.json` and the Markdown files when uploading.

## Troubleshooting

- **New Tailwind classes have no effect.** The compiled CSS only contains classes that were in use when it was built.
  Run `npm run build`.
- **The course page always shows Spanish for Beginners.** The `id` in the URL must match an `id` in `COURSES`;
  unknown ids fall back to the course in the markup.
- **A new course appears on its course page but not in the list or schedule.** The lists are HTML: add its card,
  schedule entries and enrollment option too (see [Content](#content)).
- **The enrollment form starts with someone else's details.** It restores the saved draft from this browser. Clear
  `lingua:enrol:v1` (see [Saved data](#saved-data-localstorage)).
- **The placement test opens on a result.** A previous result is saved; use "Start again", or link to
  `placement.html?lang=<language>` to start a fresh test.
- **Fees on the cards don't match the enrollment total.** Card prices are HTML; the enrollment uses `COURSES[].fee`,
  `CONCESSION` and `BOOK_PRICE`. Update both when you change prices.
- **Social previews show no image.** Make `og:image` an absolute URL on your domain.

## License

MIT: the full text is in `LICENSE.txt`, included in the download. You can use, change and sell sites built with this
template, including the SVG artwork and portraits. Lingua, its teachers and its students are fictional.
