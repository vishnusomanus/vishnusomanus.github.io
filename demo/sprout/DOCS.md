# Sprout documentation

## Overview

Sprout is a multi-page website template for a practical gardening school, built for the fictional **Loamstead field
school** on a walled plot in Corvallis, Oregon. It has ten courses with their own pages and drawings, a filterable
course list, a twelve-week schedule with places left, a three-step enrollment request, a bed planner that draws plants
to scale, a saved shortlist, instructor profiles, and an accessibility statement, booking terms and student safety note written the
way a real school would write them. The look is a field notebook: cream paper, graph-paper panels, deep green ink and a
rust accent, with Vollkorn headings and Commissioner text.

It is plain HTML, Tailwind CSS v4 and one vanilla JavaScript file, with no dependencies. This guide covers version
**1.0.5** of the HTML version. The template page, with a live demo, is at
[freeframe.dev/templates/sprout](https://freeframe.dev/templates/sprout).

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Everything works from the file system, including course links and saved data.
3. To preview it over HTTP instead (closer to a real host), run a static server in the folder:

   ```sh
   python3 -m http.server 8000
   ```

   and open `http://localhost:8000`.

The compiled CSS is included. You only need Node.js 24 if you change `src/input.css` or add Tailwind classes that
aren't already used (see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with the field drawing, the next five sessions, "In the garden this month", the three soonest courses, how enrollment works, bed planner teaser, instructors and student quotes |
| `courses.html` | All courses | Level buttons, topic and season filters (kept in the URL), course cards with next date and places, Save buttons, level guide |
| `course.html` | One course (`?course=<id>`) | Title, description and Open Graph tags set from the course; facts, drawing, session plan, what you take home, what to bring, next four dates with places, instructor, student quote, related courses; an "unknown course" message for bad links |
| `timetable.html` | Schedule of upcoming sessions | Every session starting in the next twelve weeks, grouped by month, filterable by course and level, with Enroll links |
| `enrol.html` | Enrollment request | Three steps (date, who's coming, your details), inline validation, running total, confirmation with a reference |
| `planner.html` | Bed planner | Bed size and crop, plant count, scale drawing with one mark per plant, too-small and corner-only messages, suggested course with Save |
| `saved.html` | Shortlist | Saved courses with their next dates, enrollment requests made on this device, clear and remove buttons |
| `about.html` | About the school | Founder's note, map of the plot, numbers, instructor cards, values |
| `visit.html` | Visit and contact | Inquiry form, address, hours, sketch map, travel notes, accessibility statement (`#access`), booking terms (`#terms`), student safety (`#safeguarding`), FAQ (`#faq`) |
| `404.html` | Page not found | Links back to the home page, courses and schedule |

## Project structure

```text
sprout/
  index.html, courses.html, course.html, timetable.html, enrol.html,
  planner.html, saved.html, about.html, visit.html, 404.html
  assets/
    css/style.css         compiled Tailwind CSS (generated; don't edit by hand)
    js/main.js            all data and behavior: courses, instructors, session rules, forms, planner, storage
    img/favicon.svg       the seedling logo
    img/field.svg         hero drawing (tomato plant and living soil)
    img/plot-map.svg      map of the Walled Plot (about page)
    img/directions.svg    sketch map of South Corvallis (visit page)
    img/og-image.svg      social image source
    img/og-image.png      social image (1200 × 630) used by og:image
  src/input.css           Tailwind source: brand tokens and a few shared components
  package.json            build and watch scripts for the CSS
  README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

The colors are Tailwind theme tokens in `src/input.css`. Every `bg-*`, `text-*` and `border-*` class in the pages
uses them, so changing a value changes it everywhere after a CSS rebuild.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-paper` | `#f6f4e9` | Page background |
| `--color-paper-2` | `#ecedda` | Graph-paper panels (`.graph`) |
| `--color-card` | `#fffdf6` | Cards and form fields |
| `--color-line` | `#c8ccb2` | Hairlines and card borders |
| `--color-ink` | `#1f3a2e` | Text, buttons, footer |
| `--color-muted` | `#4b5b4f` | Secondary text |
| `--color-leaf` | `#dbe3b8` | Pressed buttons, "places left" badges |
| `--color-rust` | `#a84325` | Accent: italic headline words, eyebrows, focus ring |
| `--color-straw` | `#f1dfb2` | Notes, tape, "only a few places" badges |

```css
@theme {
  --color-ink: #1f3a2e;   /* change to recolor text, buttons and the footer */
  --color-rust: #a84325;  /* the accent */
}
```

The drawings in `assets/js/main.js` (section 3) and the SVG files use the same hex values directly; search for
`#1f3a2e` and `#a84325` if you change the palette. Also update `theme-color` in each page's `<head>`.

Shared pieces live in `@layer components` in `src/input.css`: `.wrap` (page width), `.btn`, `.btn-primary`,
`.btn-ghost`, `.btn-sm`, `.link`, `.eyebrow`, `.sheet` (the specimen-card frame), `.tape` (the strip of tape),
`.graph` (graph paper), `.tag`, `.chip`, `.label`, `.input`, `.select`, `.field-error`, `.check`, `.choice` (the
session and experience options) and `.acc` (FAQ accordions). Everything else is Tailwind utilities in the markup.

### Typography

Two Google Fonts are loaded in each page's `<head>`:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Commissioner:wght@400;500;600;700&amp;family=Vollkorn:ital,wght@0,400;0,500;0,600;1,400;1,500&amp;display=swap">
```

`--font-sans` (Commissioner) is the body face and `--font-display` (Vollkorn) is used for headings, prices and the
italic accent words through the `font-display` class. Vollkorn uses old-style figures by default; `src/input.css`
switches headings and `.font-display` to lining figures so dates and prices line up. To swap a font, change the
Google Fonts link on every page and the family name in `@theme`.

### Content

Page text is in the HTML files. The school's data is in the first section of `assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `COURSES` | The ten courses: `id`, `name`, `level`, `topic`, `tutor`, `price` (dollars per person), `capacity`, `rule` (when it runs), `start`/`end` (Pacific local time), `tone` (drawing background), `summary`, `about`, `plan`, `takeaway`, `bring` |
| `TUTORS` | Eudora Wickmere, Idris Pennock and Halima Fennimore: `name`, `role`, `bio`, `quote` |
| `LEVELS`, `TOPICS`, `SEASONS` | Filter values and labels (`SEASONS` lists the months in each season) |
| `QUOTES` | One student quote per course: `course`, `name`, `place`, `text` |
| `CROPS` | Planner crops: `name`, `spacing` (inches), `mark` (the plant drawing), `course` (the course suggested) |
| `MONTH_NOTES` | Twelve "In the garden this month" notes: title, text and a course id |
| `MIN_LEAD_DAYS`, `TIMETABLE_DAYS`, `SESSIONS_PER_COURSE`, `CLOSED`, `DEMO_TAKEN`, `MAX_PEOPLE` | Schedule and enrollment settings (see [Session dates](#session-dates)) |

To add a course, add an object to `COURSES` with a new `id`, add a drawing to `ART` (or let it fall back to the first
course's drawing), and add a quote to `QUOTES` if you have one:

```js
{
  id: 'herb-garden', name: 'A kitchen herb garden', level: 'beginner', topic: 'containers', tutor: 'halima', price: 55, capacity: 10,
  rule: { day: 6, every: 'month', nth: 4, months: [4, 5, 6, 7], parts: [0] }, start: '10:00', end: '12:30',
  tone: '#e4e9cf',
  summary: 'Grow the herbs you cook with, in pots or a small bed.',
  about: 'A morning planting a herb trough to take home.',
  plan: ['Sun, soil and drainage for herbs', 'Planting a trough', 'Picking and cutting back'],
  takeaway: ['A planted herb trough'],
  bring: 'Nothing: everything is provided.'
}
```

The inquiry form's topic list fills itself from `COURSES`. Course and planner copy on the home page (for example "Ten
courses through the year") is plain text in `index.html` and `courses.html`; update the number if you add or remove
courses.

### Images and artwork

All artwork is SVG drawn for the template; there are no photos.

- **Course drawings** are built in `assets/js/main.js` (`ART`, one function per course id, drawn in a 320 × 220
  view box and shown at 16:11). To use a photo instead, replace `courseArt(c)` with an `<img>` of the same ratio.
- **Instructor portraits** are `PORTRAIT` entries drawn by `portrait(id)`.
- **Planner marks** are `MARKS`, one small drawing per crop type, centered on 0,0.
- `assets/img/field.svg` (600 × 660), `plot-map.svg` (640 × 480) and `directions.svg` (480 × 360) are plain SVG files
  used with `<img>`; keep the ratios or update the `width`/`height` attributes.
- The social image is `assets/img/og-image.png` (1200 × 630), made from `og-image.svg`. Edit the SVG, then regenerate
  the PNG with any SVG-to-PNG tool or a browser screenshot at 1200 × 630.
- The favicon is `assets/img/favicon.svg`; the same mark is inline in the header and footer of every page.

### Navigation, header and footer

The header and footer are repeated in every HTML file, so edit them in each page (a find-and-replace across the
folder works well). The current page's link has `aria-current="page"`; `course.html` marks **Courses** as current, and
`enrol.html` marks the **Enroll** button. The mobile menu (`#mobile-menu`) repeats the links. The footer holds the
address, phone, email and office hours, and the line "A fictional school from a Freeframe template", which you should
delete for a real site.

## Features

### Session dates

Session dates are never written down. Each course has a `rule`, and `sessionsFor(course)` works out its next dates
from today's date **in Pacific time** (`TIME_ZONE = 'America/Los_Angeles'`), so the demo always shows upcoming sessions:

| `rule` field | Meaning |
|--------------|---------|
| `day` | Weekday the course starts on: 0 Sunday … 6 Saturday |
| `every` | `'week'`, `'fortnight'` (every other week, with `parity` 0 or 1 choosing which weeks) or `'month'` (with `nth`: 1st, 2nd or 3rd of that weekday in the month) |
| `months` | The months it runs in (1–12): seasonal courses only appear in season |
| `parts` | Day offsets of each meeting: `[0]` one day, `[0, 1]` a weekend, `[0, 21]` two Saturdays three weeks apart |

The rules as shipped:

| Course | Rule | Time |
|--------|------|------|
| Your first growing bed | Every other Saturday (parity 0), March–October | 10am–2pm |
| A harvest in small spaces | Every other Sunday (parity 1), April–September | 10am–1pm |
| Make living soil | First Saturday of every month | 2:30pm–5pm |
| Seed to supper | Second Saturday, February–May, plus a Saturday 21 days later | 10am–1pm |
| Winter fruit-tree pruning | Every other Saturday (parity 1), November–February | 10am–3pm |
| Cordons and espaliers | Every other Saturday (parity 0), July–September | 10am–2pm |
| Cuttings and propagation | Every Wednesday, May–September | 6pm–8:30pm |
| Hedge-laying weekend | Third Saturday and the Sunday after, November–February | 9am–3:30pm |
| Setting up no-dig beds | Every other Sunday (parity 0), February–March and September–November | 10am–3pm |
| Saving your own seed | Second Sunday, August–October | 2pm–4:30pm |

Other rules:

- The first bookable day is `MIN_LEAD_DAYS` (7) days after today, so the next session is always at least a week away.
- No session starts or runs between `CLOSED.from` and `CLOSED.to` (December 20 to January 4). The visit page says the
  same in its hours list; change both together.
- Every-other-week rules count weeks from Monday, January 5, 1970 (`weekIndex`); parity 0 and 1 alternate.
- Course pages and the enrollment form offer the next `SESSIONS_PER_COURSE` (4) dates, however far ahead. The schedule
  lists every session starting within `TIMETABLE_DAYS` (84) days of the first bookable day. If a filtered course has
  nothing in that window (a seasonal course out of season), it says when the next date is and links to it.
- Long dates add the year when it isn't the current year ("Saturday, March 6, 2027").

For example, with today as Sunday, October 18, 2026 the first bookable day is Sunday, October 25, and the home page
lists: Your first growing bed, Saturday, October 31; Setting up no-dig beds, Sunday, November 1; Winter fruit-tree
pruning and Make living soil, Saturday, November 7; Setting up no-dig beds, Sunday, November 15.

To use fixed dates on a real site, either set each course's `rule` to match your real pattern, or replace
`sessionsFor()` with a function that returns your own list of `makeSession(course, 'YYYY-MM-DD')` objects.

**Preview another date:** add `?now=YYYY-MM-DD` to any page (for example `timetable.html?now=2027-06-01`) to see the
site as it will look on that day in Oregon. The parameter is ignored unless it is a real calendar date.

### Places left

Each session shows how many places are left: `capacity` minus a demo number of places already taken, minus places
requested on this device. The demo number comes from a stable hash of the course and date, so it doesn't change
between visits: sessions within three weeks have up to about `DEMO_TAKEN` (75%) of their places taken, further-out
sessions fewer, and at least two places are always left until a visitor requests them. With three or fewer left the badge turns straw
colored ("Only 2 places left", "Last place"); a session with none left shows "Full" and a waitlist link to the
inquiry form. On a real site, replace the `taken` value in `makeSession()` with numbers from your booking system.

### Course list filters

`courses.html` filters by level (buttons with `aria-pressed`), topic and season (selects). The choice is written to
the URL (`?level=beginner&topic=veg&season=spring`) with `history.replaceState`, so a filtered list can be shared.
The count above the grid is a live region ("Showing 2 of 10 courses"); when nothing matches, a message and a **Clear
the filters** button appear. A course is in a season when any of its `rule.months` falls in that season.

### Course pages

`course.html?course=<id>` renders one course from `COURSES` into the page's `data-c-*` elements and sets the
document title, meta description and Open Graph title and description. The id is matched case-insensitively and only
against the courses' own ids. Without a parameter the page shows the first course (the HTML holds its text, so the page
reads sensibly before the script runs). With an unknown id it says "We couldn't find that course" and lists every
course instead of showing a wrong one.

### Schedule

`timetable.html` (the Schedule page) groups sessions by month with a heading per month. Each row shows the date, course, time, instructor,
price, level and places left, and links to `enrol.html?course=<id>&session=<YYYY-MM-DD>`. The course and level
filters are kept in the URL (`?course=…&level=…`).

### Enrollment request

`enrol.html` is one form in three steps (`fieldset[data-step]`); **Continue** validates the current step before moving
on and focuses the next step's heading. Step 1 picks a course and one of its next four dates (full dates are
disabled); step 2 takes the number of people (1 to `MAX_PEOPLE`, and never more than the places left), how much
growing they have done and optional access or other needs; step 3 takes name, email, an optional US phone number and
agreement to the booking terms. Errors appear under each field, the field gets `aria-invalid="true"` and focus moves
to the first problem. The summary card shows the course drawing, date, time, people and total as you go.

On submit the request is saved to `sprout:enrolments:v1` with a reference such as `LS-4821`, the places left on that
date go down, and the confirmation says the request was received, that the office confirms places by email within one business day, and how
to change something by phone quoting the reference. The request then appears on `saved.html`. If your booking system
returns its own reference, show that instead (see [Forms](#forms)).

A link with an unknown course, or with a date that has passed or doesn't match the course's rule, shows a short note
above the steps and lets the visitor choose again.

### Bed planner

`planner.html` divides the bed into equal squares, one per plant, with the crop's `spacing` as the side: plants across
= floor(width ÷ spacing), along = floor(length ÷ spacing). The default (4 ft × 8 ft, lettuce at 12 in) gives 4 × 8 =
32 plants.

- **Validation:** width and length must be numbers between 0.5 and 30 feet (`PLANNER_LIMITS`; a comma works as a
  decimal point). Errors are inline, with `aria-invalid` and focus on the first problem. The form has `novalidate`.
- **Too small:** when a bed is narrower or shorter than one spacing, it explains why, for example "A 1 ft × 6 ft bed
  is too narrow for kale at 18 in spacing. Make it at least 1.5 ft each way, or choose a crop that sits closer
  together."
- **Drawing:** the bed is drawn to scale with one plant mark per plant (a different drawing for each crop type in
  `MARKS`). Beds with more than 24 plants across or 30 along (`DRAW_MAX`) are drawn as one corner, with a dashed edge
  and a note: "The drawing shows one corner of the bed (24 × 30 = 720 plants). The full bed holds 5040."
- **Suggested course:** each crop names a course (`CROPS[…].course`); the card links to it, gives its next date and
  has a Save button for the shortlist.
- The result is a polite live region, and the last plan is remembered in `sprout:planner:v1`. `?crop=<id>` preselects
  a crop.

### Shortlist

Every course card, course page and the planner's suggestion have a **Save** toggle (`[data-save]`, `aria-pressed`).
The header link shows the number saved and its accessible name says it ("Shortlist, 2 courses saved"). `saved.html`
lists the saved courses with their next dates, and the enrollment requests made on this device, each with a Remove
button. Changes are announced through a polite live region (`#announcer`).

### In the garden this month

The home page note is `MONTH_NOTES[month - 1]` for the current month in Oregon, with a link to that month's course.

### Header, mobile menu and scroll reveal

The header is sticky. Below 1024 px the menu button (`#menu-button`, `aria-expanded`, `aria-controls="mobile-menu"`)
opens the mobile menu; Escape closes it and returns focus to the button. Elements with `.reveal` fade in as they
scroll into view (everything above a revealed item is shown too); with reduced motion they appear at once. The
copyright year is filled in by the script.

## Forms

None of the forms sends anything until you connect it: each shows its confirmation in the page and saves nothing to a
server. The enrollment confirmation shows its `LS-4821` reference; the inquiry confirmation shows a reference such as
`LS-7K2Q` (`LS-` and four characters from `makeRef()`, with no 0/O or 1/I). Both say what happens next ("within one
business day", the reply time the visit page already promises); change them to match how you actually handle requests.

| Form | Where | Validates |
|------|-------|-----------|
| Enrollment request | `enrol.html`, `[data-enrol-form]` | Course, date, people, experience, name, email, optional US phone, terms |
| Inquiry | `visit.html`, `[data-enquiry-form]` | Name (2+ characters), email, message (10–1,500 characters); topic is a select |
| Bed planner | `planner.html`, `[data-planner]` | Width and length (0.5–30 ft), crop |

`visit.html?topic=<course id>` (or `general`, `visit`, `access`, `group`) preselects the inquiry topic; course pages
and waitlist links use it.

To connect the inquiry form to a service such as [Formspree](https://formspree.io), set the form's `action` to your
endpoint and replace the success branch in section 14 of `assets/js/main.js` with a request:

```js
const response = await fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
});
if (!response.ok) { /* show an error message and keep the form */ return; }
// then hide the form and show [data-enquiry-done]
```

Make the submit handler `async` to use `await`. The enrollment form works the same way (section 11, the submit
handler): send `new FormData(form)` to your booking system or form service, and only show the confirmation and save
the request once the response is OK. If your booking system or form service returns its own reference, put it in
`[data-done-ref]` or `[data-enquiry-ref]` instead of the one made in the browser. If you take payment online, link to
your payment page from the confirmation rather than collecting card details in this form.

## Saved data (localStorage)

| Key | Shape | Validated on read |
|-----|-------|-------------------|
| `sprout:shortlist:v1` | Array of course ids, `["first-bed","cuttings"]` | Must be an array; unknown ids and duplicates are dropped |
| `sprout:enrolments:v1` | Array of `{ ref, course, date, people, name, made }` | Each entry needs a `LS-0000` reference, a known course, a real date that hasn't passed, 1–4 people and a name up to 80 characters; anything else is dropped (at most 20 are kept) |
| `sprout:planner:v1` | `{ w, l, crop }` | Numbers within the planner limits and a known crop, otherwise ignored |

All access goes through one `safeStorage` object. When the browser blocks `localStorage` (a sandboxed iframe, strict
privacy settings), it falls back to memory, so saving, the shortlist count and enrollment requests still work for the
page view. Damaged JSON is treated as empty. To reset, clear the keys in the browser's developer tools, or use **Clear
shortlist** and **Remove** on `saved.html`.

### URL parameters

| Parameter | Page | Accepted values |
|-----------|------|-----------------|
| `course` | `course.html`, `timetable.html`, `enrol.html` | A course id (case-insensitive) |
| `session` | `enrol.html` | `YYYY-MM-DD`, preselected when it is one of that course's dates |
| `level`, `topic`, `season` | `courses.html` | Keys of `LEVELS`, `TOPICS`, `SEASONS` |
| `level` | `timetable.html` | A key of `LEVELS` |
| `crop` | `planner.html` | A key of `CROPS` |
| `topic` | `visit.html` | A course id or `general`, `visit`, `access`, `group` |
| `now` | any page | `YYYY-MM-DD`: preview the site on that date in Oregon |

Every value is checked with an own-key lookup (`Object.prototype.hasOwnProperty.call`), so values such as
`?course=constructor` or `__proto__` are treated as unknown.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags (`og:title`, `og:description`, `og:url`,
`og:image`), `theme-color` and favicon in its `<head>`. `course.html` updates its title, description and Open Graph
title and description for the chosen course in the browser; for link previews of each course on social sites (which
don't run JavaScript), generate one static page per course on your host or build step.

Replace `https://loamstead.example/` in every `og:url` with your domain, and make `og:image` an absolute URL
(`https://your-domain/assets/img/og-image.png`): social sites need an absolute image URL. Add a `sitemap.xml` listing
the pages and a `robots.txt` that points to it. For richer search results you could add `Course` or
`EducationalOrganization` structured data (JSON-LD).

## Accessibility

- A skip link, `header`/`nav`/`main`/`footer` landmarks, one `h1` per page and headings in order.
- Visible focus rings (3 px rust outline) on every interactive element; text and controls meet WCAG AA contrast.
- `aria-current="page"` on the current navigation link, `aria-pressed` on filter and Save buttons, `aria-expanded`
  on the menu button, and an accessible name on the icon-only shortlist link that includes the count.
- Forms use visible labels, `novalidate` with inline errors linked by `aria-describedby`, `aria-invalid` and focus
  on the first problem; enrollment steps move focus to each step's heading.
- Results and counts that change (course count, planner result, saved and removed messages) are live regions.
- Drawings are decorative (`aria-hidden`) where the text says the same thing; the hero, plot map and sketch map have
  descriptive `alt` text.
- `prefers-reduced-motion` turns off the reveal animation and smooth scrolling.

When editing, keep one `h1` per page, give new inputs a `<label>`, and keep `aria-describedby` pointing at error ids
that exist.

## Building and deploying

### Rebuilding the CSS

The compiled `assets/css/style.css` is included. After changing `src/input.css` or adding classes that aren't used
anywhere yet, rebuild it (Node.js 24):

```sh
npm install
npm run build    # or: npm run watch
```

Tailwind scans the HTML files and `assets/js/main.js`, so classes written in the script's markup strings are
included. Keep class names whole (not built from pieces) so the scanner can find them.

### Deploying

Upload the folder to any static host: Netlify Drop, Cloudflare Pages, GitHub Pages or plain web hosting. There is no
server code. `404.html` is picked up automatically by most static hosts.

## Troubleshooting

- **The schedule shows different dates from the screenshots.** Dates are worked out from today in Pacific time. Use
  `?now=YYYY-MM-DD` to see a particular day.
- **A seasonal course has no dates on the schedule.** It is out of season in the next twelve weeks; its course page
  and the enrollment form still show its next four dates, and the schedule says when it next runs.
- **New Tailwind classes have no effect.** Rebuild the CSS (`npm run build`). Classes put together from strings in
  JavaScript (`'bg-' + color`) aren't found by the scanner; write the full class name.
- **Saved courses disappear when I close the tab.** The browser is blocking storage (a private window or sandboxed
  preview), so the shortlist lives in memory for the page view. It persists on a normal site.
- **A course link shows "We couldn't find that course".** The `?course=` value doesn't match an `id` in `COURSES`.
  Check the spelling, or keep old ids working by adding them back.
- **The plan drawing shows only part of the bed.** Beds with more than 24 plants across or 30 along are drawn as one
  corner to stay readable; the count is still for the whole bed. Change `DRAW_MAX` to draw more.
- **Fonts look different offline.** The fonts come from Google Fonts; without a connection the system fallbacks
  (Georgia and the system sans-serif) are used.

## License

MIT. The code and all included artwork are free for personal and commercial use; the full text is in `LICENSE.txt`,
included in the download.

Commissioner and Vollkorn are licensed under the SIL Open Font License.

Loamstead field school, its instructors, students, quotes and address are fictional.
