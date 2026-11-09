# Academy documentation

## Overview

Academy is a complete website for an online school, built for the fictional **Northfield Academy**, which
teaches design, code and data. It has a searchable course catalog, course pages with a curriculum, learning
paths, instructor profiles, pricing with a team seats calculator, a student dashboard and a lesson player.
This is the **HTML + Tailwind CSS v4** version, **1.0.5**. Plain HTML pages share one vanilla JavaScript file,
with no framework or build step needed to run it.

Live demo: [freeframe.dev/templates/academy](https://freeframe.dev/templates/academy)

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Every page and link works straight from your computer.

For a setup closer to real hosting, serve the folder with any static server:

```sh
cd academy
python3 -m http.server 8000   # then open http://localhost:8000
```

You only need **Node.js 24** if you change the styles and want to rebuild the CSS (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable features |
|------|---------|------------------|
| `index.html` | Home | Hero with course search, topic tiles with live course counts, featured courses, how it works, learning paths, count-up stats, instructors, testimonials, pricing teaser |
| `courses.html` | Course catalog | Search, filters (topic, level, length, price, rating), six sort orders, grid/list view, filters kept in the URL, empty state |
| `course.html` | One course, chosen with `?id=` (for example `course.html?id=react-from-scratch`) | Outcomes, curriculum accordion with free preview lessons, preview dialog, instructor, reviews histogram, FAQs, sticky enroll card, related courses |
| `paths.html` | Learning paths | Each path's courses in order, total hours, weeks and bundle price |
| `instructors.html` | Instructor grid | "Teach with us" application form (`#teach`) |
| `instructor.html` | One instructor, chosen with `?id=` (for example `instructor.html?id=hana`) | Bio, stats, tags, their courses, other instructors |
| `pricing.html` | Plans | Monthly/yearly toggle, team seats calculator, team quote form (`#teams`), comparison table, FAQ (`#faq`) |
| `learn.html` | Student dashboard ("My learning") | Stats, learning streak, continue where you left off, progress rings, certificates dialog, recommendations, reset button |
| `lesson.html` | Lesson player, chosen with `?course=` and `&lesson=` (for example `lesson.html?course=sql-essentials&lesson=m1-l1`) | Course sidebar, mark as complete, Overview/Notes/Resources tabs, previous/next links, locked lessons until enrolled |
| `404.html` | Not found | Course search and suggested courses |

`course.html`, `instructor.html` and `lesson.html` are single templates that fill themselves from the data in
`assets/js/main.js`. An unknown or missing id falls back to the first course or instructor.

## Project structure

```text
academy/
├── index.html … lesson.html, 404.html   the pages (each has data-page="…" on <body>)
├── assets/
│   ├── css/style.css     compiled Tailwind CSS (generated, don't edit by hand)
│   ├── js/main.js        data, generated artwork, page renderers and all interactions
│   └── img/
│       ├── favicon.svg
│       ├── og-image.svg  editable source of the social sharing image
│       └── og-image.png  1200×630 social sharing image
├── src/input.css         Tailwind source: @theme tokens and component classes
├── package.json          scripts to rebuild the CSS
├── README.md
├── DOCS.md               this file
└── CHANGELOG.md
```

Each page's `<body>` has a `data-page` attribute (`home`, `courses`, `course`, `paths`, `instructors`,
`instructor`, `pricing`, `learn`, `lesson`, `notfound`). `main.js` runs the matching function in its `pages`
object (`pages.home`, `pages.courses`, …), so a page only renders what it needs.

## Customizing

### Brand and colors

All design tokens live in the `@theme` block at the top of `src/input.css`:

| Token | Used for |
|-------|----------|
| `--color-leaf-50` … `--color-leaf-950` | Brand green: buttons, links, eyebrows, focus rings |
| `--color-sun-100` … `--color-sun-500` | Friendly yellow accent: badges, streak, highlights |
| `--color-ink` | Body text |
| `--color-paper` | Light background |
| `--color-night`, `--color-night-2`, `--color-night-3` | Dark-mode backgrounds |

To change the brand color, replace the `leaf` scale with your own (keep the 50–950 steps) and rebuild the CSS:

```css
@theme {
  --color-leaf-600: #2563eb;
  --color-leaf-700: #1d4ed8;
  --color-leaf-800: #1e40af;
}
```

A few colors are not tokens:

- The logo SVG in each page header uses `#19693a` and `#ffc727` directly.
- Topic colors (course covers, path cards) are the `TOPICS` object in `assets/js/main.js`, and the topic
  label text colors are `TOPIC_TEXT` next to it (chosen for AA contrast in light and dark).
- The certificate artwork in `certificate()` uses the brand green and yellow directly.

### Typography

Two Google Fonts are loaded by the `<link>` in every page's `<head>`: **Plus Jakarta Sans** (all text) and
**Caveat** (the handwritten accents, class `hand`). They're mapped in `src/input.css`:

```css
--font-sans: "Plus Jakarta Sans", ui-sans-serif, system-ui, …;
--font-hand: "Caveat", "Segoe Print", "Bradley Hand", cursive;
```

To swap a font, change the Google Fonts URL in each page's `<head>`, update the token and rebuild the CSS.

### Content

The school's name is the `SITE_NAME` constant at the very top of `assets/js/main.js`
(`var SITE_NAME = 'Northfield Academy';`). The script uses it for every page title it sets: "Course title —
Northfield Academy" on `course.html`, "Instructor — Northfield Academy" on `instructor.html` and "Lesson ·
Course — Northfield Academy" on `lesson.html`. The name also appears as plain text in the HTML (each page's
`<title>`, Open Graph tags, the logo's `aria-label`, the footer) and in the certificate line "Issued by
Northfield Academy" in `assets/js/main.js`, so search for "Northfield Academy" and replace it there too when
you rename the school.

Static text (hero copy, FAQs, testimonials, plan descriptions) is in the HTML files. Everything about courses
comes from the **Data** section near the top of `assets/js/main.js`:

| Constant | Contents |
|----------|----------|
| `TOPICS` | The five topics (`design`, `frontend`, `backend`, `data`, `product`) with name and art colors |
| `INSTRUCTORS` | `id`, `name`, `role`, `topic`, portrait colors (`skin`, `hair`, `style`), `rating`, `students`, `bio`, `tags` |
| `COURSES` | `id`, `title`, `topic`, `level`, `hours`, `price` (0 = free), `rating`, `reviews`, `students`, `instructor` (an instructor `id`), optional `badge`, `updated`, `summary`, `outcomes`, `modules`, optional `lessons` |
| `PATHS` | `id`, `name`, `topic`, `weeks`, `blurb`, `courses` (course ids, in order) |

Add a course by adding an object to `COURSES`:

```js
{ id: 'figma-basics', title: 'Figma for Beginners', topic: 'design', level: 'Beginner', hours: 4, price: 39,
  rating: 4.7, reviews: 120, students: 2400, instructor: 'amara', badge: 'New', updated: 'Oct 2026',
  summary: 'Learn frames, auto layout and components by designing a small app.',
  outcomes: ['Use frames and auto layout', 'Build reusable components'],
  modules: ['Getting started', 'Auto layout', 'Components', 'Prototyping'] },
```

It then appears in the catalog, on `course.html?id=figma-basics`, in search, on its instructor's page and,
if you add its id to a path, in that path.

How the curriculum works (function `curriculum(course)`):

- Each entry in `modules` becomes a module with ids `m1`, `m2`, ….
- If the course has a `lessons` array (one array of lesson titles per module), those titles are used. Otherwise
  every module gets five lessons named from `LESSON_PATTERN` (`Why it matters`, `Core ideas`, …).
- Lesson ids are `m<module>-l<lesson>`, for example `m2-l3`.
- Lesson lengths are generated from the course id so they add up to `hours`, and never change between visits.
- The first two lessons of the first module are free previews.

Lesson ids are also what saved progress refers to, so if you rename or reorder modules on a live site, existing
visitors' progress for that course may point at different lessons (unknown ids are dropped, see
[Saved data](#saved-data-localstorage)).

The featured courses on the home page are the ids listed at the start of `pages.home`. The headline "Twelve
courses …" on `courses.html` and the stats on the home page are plain text, so update them when your catalog
changes.

Prices on the pricing cards are written in the HTML as `data-monthly` and `data-annual` attributes. The team
calculator's per-seat prices are separate: `var base = annual ? 24 : 29;` in `pages.pricing`, with the volume
discount tiers on the line below. Change both places together.

### Images and artwork

There are no image files for courses or people. All of it is SVG drawn by functions in `assets/js/main.js`:

| Function | Draws | Notes |
|----------|-------|-------|
| `cover(course)` | Course cover art (320×200 viewBox, used at 16:10) | Colors from the course's topic; two alternating motifs per topic |
| `avatar(person, size)` | Instructor portrait (square, circular crop) | Uses the instructor's `skin`, `hair` and `style` (0–5) |
| `stars(rating)` | Star rating with partial fill | Has a text alternative ("Rated 4.8 out of 5") |
| `certificate(course, name)` | Certificate of completion (560×380) | Shown on the dashboard |

To use photos, return an `<img>` from `cover()` (keep a 16:10 image, for example 1280×800) and `avatar()`
(square, at least 320×320). Give the `<img>` meaningful `alt` text or `alt=""` when the image is decorative,
as the cards do.

The dashboard's student name, **Alex Morgan**, appears on certificates and in the welcome text (search
`learn.html` and `main.js` for `Alex`). Replace it with the signed-in user's name when you connect real accounts.

Sharing image: `assets/img/og-image.png` (1200×630) is generated from `assets/img/og-image.svg`. Edit the SVG,
then export it again as a 1200×630 PNG. The favicon is `assets/img/favicon.svg`.

### Navigation, header and footer

The header and footer are repeated in every HTML file. To add a page:

1. Copy an existing page (for example `paths.html`), change its `<title>`, meta description, Open Graph tags,
   `data-page` and content.
2. Add a link in the desktop menu (`<nav aria-label="Main">`), the mobile menu (`#mobile-menu`) and the footer
   of **every** page. Search and replace across all files works well.

If your new page needs JavaScript, add a `pages.<name>` function in `main.js` and set `data-page="<name>"`.

### Dark mode

A small inline script in each page's `<head>` applies the saved theme before the page paints, so there's no
flash. It reads `localStorage` key `theme` (`"dark"` or `"light"`); with nothing saved it follows the
visitor's system setting. The toggle buttons have `data-theme-toggle`.

- **Default to light:** in the inline script, remove `||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)`.
- **Remove dark mode:** delete the inline script and the `data-theme-toggle` buttons. The `dark:` classes then
  never apply.

## Features

### Course catalog

`courses.html`, function `pages.courses`.

- **Search** matches the course title, summary, topic name and instructor name.
- **Filters:** topic and level (checkboxes, any number), length (`short` under 5 hours, `medium` 5–10,
  `long` over 10), price (`free`, `paid`) and minimum rating (`4.8`, `4.7`).
- **Sort:** `popular` (most students, the default), `rating`, `newest` (order in `COURSES`, last first),
  `length`, `price-asc`, `price-desc`.
- The state is written to the URL with `history.replaceState`, so searches can be shared and the home page
  topic tiles can link to `courses.html?topic=data`. Supported parameters: `q`, `topic` and `level`
  (comma-separated), `length`, `price`, `rating`, `sort`.
- **Grid or list view** is saved in `localStorage` (`academy-view`).
- On small screens the filters are behind a "Filters" button (`aria-expanded` on the button).
- The result count is an `aria-live` region, so screen readers hear "5 courses" after each change.

To add a filter value, add the input in `courses.html` and the matching condition in the `apply()` function.

### Course page

`course.html`, function `pages.course`.

- Elements with `data-bind="…"` are filled from the course (title, summary, level, hours, price and so on).
- The curriculum is native `<details>` elements, so it works with the keyboard and screen readers without
  extra code. "Expand all" toggles every module.
- Preview lessons link to the lesson player; the "Preview this course" dialog (`#preview-dialog`, a native
  `<dialog>`) lists them. Escape and clicking the backdrop close it.
- The review histogram is generated to match the course's rating.
- **Enroll** (`data-enrol`) saves the enrollment in the browser and shows a toast. It doesn't take payment. For a
  paid course the toast gives an order reference (`NA-` and four characters, from `makeRef()`); when you connect a
  checkout, show its order number instead. Once enrolled, the button becomes "Continue learning" and opens the next lesson.
- The enroll card is sticky on large screens and marked `data-back-to-top-hide`, so the back-to-top button never
  covers it.

### Learning paths

`paths.html`, function `pages.paths`. Each item in `PATHS` becomes a section with an anchor (`paths.html#data-analyst`).
Hours and the bundle price are added up from the courses; `weeks` is your own estimate.

### Student dashboard

`learn.html`, function `pages.learn`.

- Stats (lessons completed, hours learned, certificates) are calculated from saved progress.
- The **learning streak** counts consecutive days with a completed lesson; the week strip marks the days.
- **Continue learning** picks the first course still in progress and links to its last lesson.
- Each enrolled course shows a progress ring (`.ring-progress`, driven by the CSS variable `--p`).
- Finished courses earn a certificate, shown in a dialog (`#cert-dialog`).
- **Reset demo progress** (`data-reset`) clears saved progress and notes.

Until a visitor does something themselves, the dashboard shows **sample progress** (the `DEMO` object in
`main.js`) so it never looks empty, with a note explaining it. Their first enrollment or completed lesson
replaces the sample with their own progress (`makeOwn()`).

### Lesson player

`lesson.html`, function `pages.lesson`.

- The sidebar lists every module and lesson with completion check marks, and marks the current one with
  `aria-current="page"`. On small screens it's a drawer opened by the "Course contents" button.
- **Mark as complete** (`data-complete`) toggles the lesson, updates the streak and moves "last lesson" to the
  next unfinished one. Its state is exposed with `aria-pressed`.
- Lessons other than previews are **locked** until the visitor enrolls (or completes a preview lesson).
- **Tabs** (Overview, Notes, Resources) follow the ARIA tabs pattern: arrow keys, Home and End move between
  them (`setupTabs()`).
- **Notes** save automatically as you type (after a short pause) and are kept per lesson.
- The video area is a placeholder: put your player (an `<iframe>` or `<video>`) inside the element marked
  `data-player`, replacing the `data-video-art` artwork.

### Pricing and team seats calculator

`pricing.html`, function `pages.pricing`.

- The billing switch (`data-billing-toggle`, `role="switch"`) swaps every `[data-price]` between its
  `data-monthly` and `data-annual` values, and the notes under them.
- The seats slider (`#seats`, 2–200) and number input (`#seats-number`, 2–500) stay in sync. Values outside
  2–500 show an error and are corrected when the field loses focus.
- Per-seat price: $24 (yearly) or $29 (monthly), less 5% from 10 seats, 10% from 50 and 15% from 200.

### Scroll reveals and counters

Elements with the class `reveal` fade in as they scroll into view; elements with `data-count` (plus optional
`data-decimals` and `data-suffix`) count up from zero. Revealing an element also reveals everything above it,
so jumping to the end of a page never leaves content hidden. With reduced motion, everything is shown at once.

### Back-to-top button

The block at the end of `main.js` adds a "Back to top" button after the visitor scrolls about one screen. It
scrolls back up (instantly with reduced motion), moves focus to `<main id="main">` and lifts itself above
toasts. Add `data-back-to-top-avoid` to anything pinned to the bottom of the screen, or `data-back-to-top-hide`
to a sticky element it must never cover. Its styles are the `.back-to-top` rules in `src/input.css`. To remove
it, delete both blocks and rebuild the CSS.

## Forms

| Form | Where | Validates |
|------|-------|-----------|
| Newsletter | Footer of every page (`data-newsletter`) | Email present and well-formed |
| Course search | Home, catalog, 404 (`data-search-form`) | An empty search goes to the full catalog |
| Teach with us | `instructors.html#teach` (`data-teach-form`) | Name, email, topic chosen, idea at least 20 characters |
| Team quote | `pricing.html#teams` (`data-team-form`) | Name, work email, company or school |

Errors appear under each field (`fieldError()` sets `aria-invalid` and `aria-describedby`), and focus moves to the
first problem. On success the form shows a message. The teach and team quote messages include a short reference
(`NA-` and four characters, made in the browser by `makeRef()` and written into `[data-ref]`; use your form
service's own reference instead if it returns one) and say what happens next: the team quote promises a reply within
one business day, as the form's intro does, and the teach application a reply within two weeks. The newsletter
message asks subscribers to look out for a confirmation email. Change these to match how you actually handle sign-ups
and requests. **The forms don't send anything** until you connect them.

To connect a form, find its success branch in `main.js` (each has a "Demo only" comment) and post the data. For
example, with [Formspree](https://formspree.io), in `pages.pricing`:

```js
// Replace the "Demo only" comment in the team form's submit handler:
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (!res.ok) throw new Error('Request failed');
  form.hidden = true;
  var done = $('[data-team-success]');
  $('[data-ref]', done).textContent = makeRef();
  done.hidden = false;
  done.focus();
}).catch(function () {
  alert('Sorry, something went wrong. Please try again.');
});
```

Make sure every input has a `name` attribute so `FormData` includes it, and keep the success message only for a
real success. Netlify Forms works too: add `name="team-quote"` and `data-netlify="true"` to the `<form>`.

Enrollment and progress are also front-end only: to support real accounts, replace the functions in the
"Progress" section of `main.js` with calls to your backend.

## Saved data (localStorage)

| Key | Shape | Written by |
|-----|-------|------------|
| `academy-progress` | `{ enrolled: { "<course id>": { done: ["m1-l1", …], last: "m1-l2" } }, streak: { count: 3, last: "2026-10-07" } }` | Enroll, mark as complete, opening a lesson |
| `academy-notes` | `{ "<course id>/<lesson id>": "note text" }` (each note at most 5,000 characters) | Lesson notes |
| `academy-view` | `"grid"` or `"list"` | Catalog view buttons |
| `theme` | `"dark"` or `"light"` | Theme toggle |

Everything is validated when read (`cleanProgress()` and `loadNotes()`):

- Unknown courses, unknown lesson ids, duplicates and non-string values are dropped.
- The streak count must be a whole number from 0 to 3,650 (anything else resets the streak) and dates must look
  like `YYYY-MM-DD`.
- If anything had to be dropped, the cleaned value is written back (self-healing). Unreadable JSON is removed.

To reset, use **Reset demo progress** on `learn.html`, or run `localStorage.clear()` in the browser console.
To stop saving altogether, remove the `writeJSON` calls.

## SEO and sharing

- Every page has its own `<title>`, `<meta name="description">`, Open Graph tags and `theme-color`.
- `course.html`, `instructor.html` and `lesson.html` also update `document.title` (with the school's name from
  `SITE_NAME`, see [Content](#content)) and the course page its meta description from the data, but search engines that don't run JavaScript only see the HTML defaults. For
  real SEO on individual courses, generate one HTML file per course or use the Next.js version.
- `og:image` is the relative path `assets/img/og-image.png`. Social networks need an absolute URL, so when you
  deploy, change it on every page:

```html
<meta property="og:image" content="https://your-domain.com/assets/img/og-image.png">
```

- Add a `sitemap.xml` listing your pages and a `robots.txt` that points to it. Most hosts serve both from the
  site root.

## Accessibility

Built in:

- A skip link to `<main id="main">`, landmarks (`header`, `nav`, `main`, `footer`) and one `h1` per page.
- Visible focus styles (`:focus-visible` outlines in `src/input.css`) and AA color contrast in both themes.
- The mobile menu sets `aria-expanded`, closes with Escape and returns focus to its button.
- Tabs, dialogs, the billing switch and the progress bars use the matching ARIA patterns.
- Star ratings, progress rings and covers have text alternatives; decorative SVGs are `aria-hidden`.
- Live regions announce result counts and toasts.
- Reduced motion turns off reveals, count-ups and smooth scrolling.

When you edit, keep one `h1` per page, give every new input a `<label>`, and check new colors for contrast in
light and dark mode.

## Building and deploying

The compiled CSS (`assets/css/style.css`) is included, so the site works as it is. Rebuild it only when you change
`src/input.css` or use Tailwind classes that aren't in the template yet:

```sh
npm install
npm run build    # one-off build
npm run watch    # rebuild on every change while you work
```

Tailwind only generates classes it finds in the files, including the class names inside `assets/js/main.js`.

To deploy, upload the whole folder to any static host:

- **Netlify Drop:** drag the folder onto `app.netlify.com/drop`.
- **GitHub Pages:** push the folder to a repository and enable Pages for the branch.
- **Cloudflare Pages:** create a project with direct upload; no build command is needed.

You can leave out `src/`, `package.json` and the Markdown files when uploading; they aren't used by the browser.

## Troubleshooting

- **A class I added has no effect.** It isn't in the compiled CSS yet. Run `npm run build`.
- **The dashboard shows courses I never took.** That's the sample progress. Enroll in a course or complete a
  lesson, or press **Reset demo progress**.
- **My new course doesn't appear.** Check that its `instructor` matches an `id` in `INSTRUCTORS` and its
  `topic` is a key of `TOPICS`, and look for errors in the browser console (a missing comma in `COURSES` stops
  the whole script).
- **A new course page shows the first course instead.** The `?id=` in the link must match the course `id`
  exactly.
- **Progress disappeared after I renamed modules.** Lesson ids come from module and lesson positions; renaming
  or reordering them changes which lessons saved ids point to. Unknown ids are dropped on the next visit.
- **Fonts look different offline.** The fonts come from Google Fonts; without a connection the system fallback
  fonts are used.
- **Shared links show no image.** `og:image` must be an absolute URL on your own domain.

## License

MIT, like every Freeframe template: free for personal and commercial projects, no attribution required. The
generated artwork is included under the same license. See `LICENSE.txt` in the download.
