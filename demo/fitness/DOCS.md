# Fitness documentation

## Overview

Fitness is a bold, dark website for a gym or fitness studio: a weekly class schedule with booking,
class and coach profiles, membership pricing with a BMI and calorie calculator, and a three-step free
trial sign-up. The demo is **Keel Athletic Club**, a fictional club in New Bedford, Massachusetts, with two locations, six class
types, six coaches and 36 weekly sessions. It is built with HTML5, Tailwind CSS v4 and one vanilla
JavaScript file, and needs no build step. This guide covers version 1.1.13.

Live demo: [freeframe.dev/templates/fitness](https://freeframe.dev/templates/fitness)

## Quick start

1. Unzip the download and open `index.html` in a browser.
2. Or serve the folder with any static server:

   ```sh
   cd fitness
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

Node.js 24 is only needed to rebuild the CSS (see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections |
|------|---------|------------------|
| `index.html` | Home | Hero, class-name strip, "next up today" sessions, class cards, count-up results, membership teaser, coaches, member stories, facilities, free-trial banner |
| `classes.html` | Schedule | Week grid (day tabs on phones), filters by class, intensity and coach, spots left, booking dialog |
| `class.html` | One class type (`class.html?type=box`) | What to expect, intensity meter, equipment, coaches, upcoming sessions |
| `trainers.html` | Coaches | Six coach cards with a specialty filter |
| `trainer.html` | One coach (`trainer.html?id=lena`) | Bio, quote, certifications, classes, booking link |
| `membership.html` | Membership | Three plans with monthly/yearly switch, comparison table, add-ons, BMI and calorie calculator, FAQ |
| `trial.html` | Free trial | Three-step sign-up: goal, details, review |
| `contact.html` | Locations and contact | Two clubs with maps, live open/closed status, today's hours, contact form |
| `404.html` | Not found | Error page with hours and links |

Most pages have a newsletter form in the footer.

## Project structure

```text
fitness/
├── index.html, classes.html, class.html, trainers.html, trainer.html, membership.html, trial.html, contact.html, 404.html
├── assets/
│   ├── css/style.css      compiled Tailwind CSS (generated)
│   ├── js/main.js         FORGE data object, then all interactions and the back-to-top button
│   └── img/               class-*.svg, coach-*.svg, hero.svg, favicon, social image
├── src/input.css          Tailwind source: design tokens (@theme) and component classes
├── package.json           scripts to rebuild the CSS
├── template.json          template metadata used by freeframe.dev
├── README.md
├── CHANGELOG.md
└── DOCS.md                this guide
```

## Customizing

### Brand and colors

The palette and fonts are tokens in the `@theme` block at the top of `src/input.css`:

| Token | Used for |
|-------|----------|
| `--color-bg`, `--color-surface`, `--color-raised` | Dark page and card backgrounds |
| `--color-line` | Borders |
| `--color-ink`, `--color-muted` | Text |
| `--color-volt` | Main accent (`#c8ff2e`): buttons, highlights, focus rings |
| `--color-volt-dim` | Accent hover |
| `--color-heat` | High intensity, "few spots left" alerts |
| `--color-cool` | Low intensity |

For example, an orange accent:

```css
@theme {
  --color-volt: #ff8a1f;
  --color-volt-dim: #e5730a;
}
```

The accent is used as a background behind dark text, so keep it bright. Rebuild the CSS afterwards and
update the `theme-color` meta tag in each page's `<head>`.

### Typography

Headlines use **Anton** (`--font-display`, a tall condensed face) and text uses **Inter**
(`--font-sans`), loaded from Google Fonts in each page's `<head>`. Replace that `<link>` on every page
and the two tokens to change them.

### Content

Static text is plain HTML. **Classes, coaches, locations and the schedule are data** in the `FORGE`
object at the very top of `assets/js/main.js`:

| Key | Contents |
|-----|----------|
| `FORGE.classes` | Class types keyed by id: `strength`, `ignite`, `ride`, `box`, `flow`, `engine` |
| `FORGE.coaches` | Coaches keyed by id: `maya`, `dev`, `jonah`, `lena`, `sami`, `chloe` |
| `FORGE.locations` | Clubs keyed by id (`harbor`, `northgate`) with weekly opening hours |
| `FORGE.sessions` | The weekly schedule (36 sessions) |

A class type:

```js
"strength": {
  "name": "Strength Lab",
  "short": "Small-group barbell training with coached progressions every week.",
  "desc": "Strength Lab is where Keel members get genuinely strong...",
  "intensity": 2,          // 1 = low, 2 = medium, 3 = high
  "duration": 60,          // minutes
  "kcal": "350–500",
  "expect": ["A 10-minute movement-prep warm-up...", "..."],
  "equipment": ["Olympic barbell & bumper plates", "..."],
  "who": "All levels. New lifters start on technique blocks with a lighter bar.",
  "tag": "Strength"
}
```

A coach has `name`, `role`, `tags` (specialties), `classes` (class ids they teach), `years`, `certs`,
`quote`, `bio` (an array of paragraphs) and `handle` (social handle without `@`).

A location's `hours` is an array of seven `[open, close]` pairs in 24-hour `"HH:MM"` text, **starting on
Monday**:

```js
"harbor": { "name": "Keel Harbor", "hours": [["05:30", "22:00"], /* Tue … Sat */ ["08:00", "18:00"]] }
```

A session in the schedule:

```js
{ "id": "s00", "day": 0, "time": "06:00", "type": "ignite", "coach": "dev", "loc": "northgate", "cap": 20, "booked": 9 }
```

`day` counts from Monday (`0`) to Sunday (`6`); `type`, `coach` and `loc` are ids from the other keys;
`cap` is the class size and `booked` the number of spots already taken (demo data). Give every session a
unique `id`: bookings are saved by id.

**Adding a class type** needs four things: an entry in `FORGE.classes`, an illustration at
`assets/img/class-<id>.svg`, its id in some coaches' `classes`, and sessions using it. Update the class
cards on `index.html`, the class filter `<select>` on `classes.html` and the "other classes" links on
`class.html` too (they are static HTML). **Adding a coach** is the same pattern: an entry in
`FORGE.coaches`, `assets/img/coach-<id>.svg`, a card on `trainers.html` and an option in the coach filter.

The printed opening hours (`data-hours` lists on `contact.html` and the footers) are plain HTML; keep them
in step with `FORGE.locations`.

Times stay 24-hour in the data (`"06:00"`, `"22:00"`) and show as 12-hour on the page (`6am`, `10pm`). `clock()` in `assets/js/main.js` does the conversion.

**Time zone.** `TIMEZONE` near the top of the interactions script in `assets/js/main.js` (default
`'America/New_York'`) is the club's IANA time zone. `businessNow()` reads "now" there, so the open/closed
status, today's row and schedule day, "next up" classes and the earliest trial date are the same for every
visitor, wherever their device is.

### Images and artwork

All artwork in `assets/img/` is original SVG: class images (`class-<type>.svg`), coach portraits
(`coach-<id>.svg`), `hero.svg`, `favicon.svg` and the social image (`og-image.svg` source, `og-image.png`
export at 1200×630). The class and coach pages build image paths from ids, so photos must use the same
file names (change the paths in the "Class detail page" and "Coach profile page" sections of
`assets/js/main.js` if you switch to `.jpg`).

### Navigation, header and footer

The header, mobile menu and footer are repeated in every page. To add a page, copy one, replace the
content inside `<main>`, and add the link to the desktop and mobile menus on every page with
`aria-current="page"` on the current one.

## Features

### Schedule

`classes.html` renders the week from `FORGE.sessions` into `[data-timetable]`:

- On desktop all seven days show side by side; on phones day tabs (`[data-day-tab]`, a tablist with
  **Left/Right**, **Home** and **End** keys) show one day at a time, starting on today.
- Filters (`<select data-filter="type">`, `"intensity"`, `"coach"`) narrow the sessions; **Reset**
  (`data-filter-reset`) clears them, and a live count shows "24 classes this week".
- Each session shows its time, intensity meter, coach, club and a badge: "12 spots", "2 left",
  "Full · waitlist" or "Booked".
- Links can preselect filters and the day: `classes.html?type=box`, `?coach=lena`, `?day=4` (ids match regardless of case;
  unknown ids are ignored, so the schedule shows every class).

### Booking dialog

Clicking a session opens the native `<dialog id="booking-modal">` with the class details and one action
button: **Book my spot**, **Cancel booking**, or **Join waitlist** when full. Bookings are saved in
`localStorage` (see [Saved data](#saved-data-localstorage)) so they show as "Booked" after a reload; the
waitlist only shows a message. **Esc**, the close button or clicking outside closes the dialog, and focus
returns to the session. "Clear my bookings" (`data-clear-bookings`) removes them all.

This is a demo: bookings live only in the visitor's browser and `booked` counts never change for other
people. For real bookings, connect a gym-management or class-booking service (Mindbody, Glofox,
TeamUp...) and replace the action button's handler, or link each session to their booking page.

### Next up today

On the home page `[data-next-up]` lists the next four sessions later today (or tomorrow's first four if
none are left), each linking to that day on the schedule.

### Class and coach pages

`class.html` and `trainer.html` contain static content for one default record (`data-default="strength"`
and `data-default="maya"`), so they work without JavaScript. With `?type=` or `?id=`, the script fills in
another class or coach from `FORGE`, including the page title and meta description, and lists that
class's upcoming sessions or that coach's classes. Ids match in any letter case (`?id=DEV` shows Dev);
unknown ids keep the default.

### Coach filter

Buttons with `data-coach-filter` on `trainers.html` show cards whose `data-tags` (space-separated, for
example `data-tags="Strength Nutrition"`) include that specialty; `All` shows everyone. Matching ignores
case.

### Membership pricing switch

The switch `[data-billing-toggle]` (`role="switch"`, `aria-checked`) swaps every `[data-price]` between
its `data-monthly` and `data-annual` values and every `[data-billing-note]` between its notes:

```html
<span data-price data-monthly="39" data-annual="32">39</span>
```

### BMI and calorie calculator

The calculator on `membership.html` (`form[data-calc]`) takes units (metric or imperial), height, weight,
age, sex and activity level and shows:

- **BMI** = weight (kg) ÷ height (m)², with a category (under 18.5, 18.5–25, 25–30, 30 and over) and a
  marker on a scale.
- **BMR** with the Mifflin–St Jeor equation, and daily calories (BMR × the activity factor: 1.2, 1.375,
  1.55 or 1.725).
- Suggested targets for cutting (−450 kcal) and building (+300 kcal).

Results are announced to screen readers. Change the offsets in the "BMI & calorie calculator" section of
`assets/js/main.js`. The figures are general estimates, not medical advice; keep the disclaimer on the
page.

### Free trial sign-up

`trial.html` contains a three-step form (`form[data-trial]`):

1. **Goal** (`goal` radio tiles).
2. **Details**: `first`, `last`, `email`, `phone`, `location` (home club), `start` (no past dates),
   `level` (experience) and `plan`.
3. **Review**, then a required `terms` checkbox.

Each step is validated before moving on, focus moves to the step's legend, and `?plan=` preselects the
plan (the value must match an `<option>` in `#t-plan`, in any letter case: `?plan=Elite` works like
`?plan=elite`). The confirmation says the free week is booked, shows a reference in `[data-done-ref]` (`FA-`
and four characters, made in the browser by `makeRef()`) and promises the first-visit details by email within
one business day.

### Open/closed status and today's hours

Elements with `data-open-status="harbor"` (or another location id) show "Open now · until 10pm" or
"Closed · opens 6am". Hours lists with `data-hours` highlight today's `[data-hours-row]` (counted from
Monday) in the accent color and mark it with `aria-current="date"`.

### Mobile menu, header, reveals and counters

The header gains a background on scroll. The mobile menu opens full screen, updates `aria-expanded`,
closes with **Esc** and on navigation. Elements with `reveal` fade in when scrolled into view (everything
above is revealed too). Numbers with a count-up animation run once when visible. With reduced motion,
reveals and counters appear immediately.

### Back to top button

Every page gets a "Back to top" button in the bottom-right corner, created by the "Back to top" block at
the end of `assets/js/main.js` and styled by the `.back-to-top` rules at the end of `src/input.css`. It
appears after about one screen of scrolling, scrolls to the top (instantly with reduced motion), moves
focus to the main content and lifts above toasts. Add `data-back-to-top-avoid` to anything you pin to
the bottom of the screen, or `data-back-to-top-hide` to a sticky element it must never cover. To remove
it, delete that JavaScript block and the CSS rules, then rebuild the CSS.

## Forms

| Form | Page | Notes |
|------|------|-------|
| Contact | `contact.html` | `topic` can be preselected with `?topic=membership`, `pt`, `corporate` or `other` (any letter case) |
| Newsletter | Footer of most pages | Email only |
| Free trial (`data-trial`) | `trial.html` | See [Free trial sign-up](#free-trial-sign-up) |
| Calculator (`data-calc`) | `membership.html` | Calculates in the browser; sends nothing |

Forms use the browser's constraints (`required`, `type="email"`, `pattern`, `minlength`, `min`/`max`)
with friendly messages from `fieldMessage()`. Errors appear under each field, fields get `aria-invalid`,
and the first problem is focused. Simple forms reveal their `[data-success]` message on success. The contact
message confirms the message reached the team, promises a reply within one business day and fills any
`[data-ref]` inside it with a reference like `FA-7K2Q` from `makeRef()`; the newsletter one asks subscribers to
look out for a confirmation email. If your form service returns its own reference, show that instead, and change
the reply times to match how you actually handle messages.

**Nothing is sent until you connect the forms**, although their confirmations read as if it had been. For the contact and newsletter forms, add an `action`
(for example a [Formspree](https://formspree.io) endpoint) and send the data in `onValid()` in
`assets/js/main.js`:

```js
function onValid(form) {
  fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    .then(function (res) {
      if (!res.ok) throw new Error('Request failed');
      form.reset();
      var ok = $('[data-success]', form);
      $$('[data-ref]', ok).forEach(function (el) { el.textContent = makeRef('FA'); });
      ok.classList.remove('hidden');
      ok.setAttribute('tabindex', '-1');
      ok.focus();
    })
    .catch(function () { toast('Sorry, that didn’t send. Please try again.'); });
}
```

For the free trial, follow the comment "To send for real" in the trial's submit handler and post
`new FormData(trial)` before showing the confirmation.

## Saved data (localStorage)

| Key | Shape | Purpose |
|-----|-------|---------|
| `forge-bookings` | Array of session ids, e.g. `["s04", "s17"]` | Classes the visitor booked |

`getBookings()` validates the value on every read: anything that isn't an array of known, unique session
ids is dropped and the stored value is repaired, so corrupt or tampered data can't break the schedule.
Visitors can clear bookings with the "Clear my bookings" button; developers can run
`localStorage.removeItem('forge-bookings')`. If you change session ids, old bookings for removed ids are
simply ignored.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `twitter:card`. `class.html` and
`trainer.html` update their title and description from the data when a `?type=`/`?id=` is given. Because
that happens in the browser, search engines that don't run JavaScript only see the default class and
coach; create one static page per class or coach if those pages matter for search.

When you deploy, change `og:image` on every page to an absolute URL:

```html
<meta property="og:image" content="https://example.com/assets/img/og-image.png">
```

Consider [ExerciseGym](https://schema.org/ExerciseGym) structured data with each club's address and hours,
and a `sitemap.xml`.

## Accessibility

- Skip link, labeled landmarks, one `<h1>` per page and strong focus rings.
- Day tabs follow the tabs pattern; the booking dialog is a native `<dialog>` with focus return.
- Filter buttons use `aria-pressed`; the pricing switch uses `role="switch"` and `aria-checked`.
- Intensity is shown as a meter with a text label, not color alone.
- Multi-step forms move focus to each step's legend and mark the current step with `aria-current`.
- Reveals, counters and smooth scrolling respect `prefers-reduced-motion`.

When editing, keep text contrast at WCAG AA on the dark background (the accent should only sit behind dark
text), label every new form field and keep one `<h1>` per page.

## Building and deploying

`assets/css/style.css` is pre-built. Rebuild it after editing `src/input.css` or using Tailwind classes
that aren't in the CSS yet, including classes inside the HTML strings in `assets/js/main.js`. With
Node.js 24:

```sh
npm install
npm run build     # or: npm run watch
```

Fitness is a static site: upload the folder (without `node_modules/`) to Netlify, GitHub Pages,
Cloudflare Pages or any web host. No build command is needed on the host.

## Troubleshooting

- **A session doesn't appear.** Its `type`, `coach` and `loc` must be existing ids, and `day` must be
  0–6 (Monday–Sunday).
- **A class page shows Strength Lab instead of the class I linked.** The `?type=` value must be a key in
  `FORGE.classes` (any letter case: `?type=BOX` works like `?type=box`, as on the schedule).
- **A coach page shows Maya Torres instead of the coach I linked.** The `?id=` value must be a key
  in `FORGE.coaches` (any letter case: `?id=DEV` works like `?id=dev`, as with the schedule's `?coach=`).
- **A coach card disappears with every filter.** Its `data-tags` must contain the filter values
  (space-separated; case doesn't matter).
- **The open/closed status is an hour or more out.** Set `TIMEZONE` in `assets/js/main.js` to the club's
  IANA zone name.
- **Bookings vanished.** They're stored per browser; private windows and cleared site data reset them.
- **New Tailwind classes have no effect.** Rebuild the CSS.
- **Forms "send" but nothing arrives.** Connect them as described in [Forms](#forms).

## License

Fitness is released under the MIT License (see `LICENSE.txt` in the download), for personal and
commercial use. The included SVG illustrations and portraits are covered by the same license. Anton and
Inter are licensed under the SIL Open Font License.
