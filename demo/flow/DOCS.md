# Flow documentation

## Overview

Flow is a multi-page website template for an independent yoga studio, built for Salt & Sage Yoga, a fictional
studio above the harbor in Santa Cruz, California. It is plain HTML5, Tailwind CSS v4 and one vanilla JavaScript
file, with no framework and no build step needed to run it. The home page lists today's classes from the weekly
schedule, the schedule can be filtered and shows what's on now and next, and visitors can reserve a specific mat
and see it under My bookings. This guide covers version 1.0.6 (see `template.json`). Live demo:
[freeframe.dev/templates/flow](https://freeframe.dev/templates/flow).

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Everything works from the file system, including booking a mat, the
   filters and the calculator.
3. To preview over HTTP instead (closer to how it will run online), serve the folder with any static server:

   ```sh
   npx serve .
   ```

You only need Node.js 24 if you change `src/input.css` or add Tailwind classes that aren't already in the compiled
CSS. See [Building and deploying](#building-and-deploying).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with a live "next class" card, today's classes (or tomorrow's after the last class), class styles, intro offer band, teachers, testimonials, workshops |
| `timetable.html` | Schedule and booking | My bookings, style/level/teacher filters, seven-day list with "On now" and "Up next", mat booking dialog |
| `classes.html` | Class styles | Seven styles with "good if" lists, length, room, teachers, next class and classes a week; level guide; health note |
| `teachers.html` | Teachers | Four profiles with training, styles, next class and a link to their filtered schedule |
| `pricing.html` | Prices | Intro offer, class passes, memberships, intro-offer calculator, short FAQ |
| `workshops.html` | Workshops and retreats | Event cards with spots left, kind filter, booking inquiry form |
| `guide.html` | Beginners' guide and FAQ | Five steps, what to bring, health note, searchable FAQ accordion |
| `contact.html` | Contact | Illustrated map, address, today's opening times, travel notes, message form |
| `404.html` | Not found | Links back into the site |

## Project structure

```text
flow/
  index.html ... 404.html    the nine pages (header and footer are repeated in each)
  assets/css/style.css       compiled Tailwind CSS (generated: don't edit by hand)
  assets/js/main.js          all data and interactions, vanilla JavaScript
  assets/img/favicon.svg     the sun-over-the-sea mark
  assets/img/og-image.svg    social image source; og-image.png is the 1200x630 export
  assets/img/pose-*.svg      line drawings for the class styles (240x240)
  assets/img/teacher-*.svg   arch-shaped teacher portraits (240x300)
  assets/img/map.svg         illustrated map on the contact page (640x440)
  src/input.css              Tailwind source: theme tokens and components
  package.json               Tailwind CLI scripts for rebuilding the CSS
  README.md                  short introduction
  DOCS.md                    this guide
  CHANGELOG.md               version history
  LICENSE.txt                MIT license (in the download)
```

## Customizing

### Brand and colors

All design tokens are in the `@theme` block at the top of `src/input.css`:

| Token | Use |
|-------|-----|
| `--color-sand`, `--color-shell`, `--color-dune`, `--color-drift`, `--color-line` | Page background, cards, soft panels, deeper panels, borders |
| `--color-sea-50` ... `--color-sea-900` | Brand color: buttons and links (700), dark bands (900) |
| `--color-clay-100` ... `--color-clay-700` | Warm accent: italic words, "On now", best-value bars |
| `--color-sage-100` ... `--color-sage-700` | Level dots, check marks and leaves |
| `--color-ink`, `--color-body`, `--color-mute` | Headings, body text, secondary text |
| `--color-error` | Form errors |

To change the brand color, replace the sea scale with your own and rebuild the CSS:

```css
@theme {
  --color-sea-700: #3b4f7a; /* buttons, links */
  --color-sea-900: #1f2a44; /* dark bands and footer */
}
```

Inline SVG artwork uses hex values directly (for example `#2c524d` in the logo and `#1a3431` for line drawings), so
search for the old hex codes in the HTML and `assets/img/` if you change the palette a lot.

### Typography

Headings use **EB Garamond** (`--font-serif`, classes `display`, `section-title`, `card-title`) and body text uses
**Mulish** (`--font-sans`). Both load from Google Fonts in the `<head>` of every page:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400..600;1,400..600&amp;family=Mulish:ital,wght@0,400..800;1,400..600&amp;display=swap">
```

To swap fonts, change that link on every page and the two `--font-*` tokens in `src/input.css`, then rebuild.

### Content

Page text lives in the HTML files. Everything the scripts compute from lives in constants at the top of
`assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `STUDIO` | Name, `timeZone` (`America/Los_Angeles`), contact details, `daysAhead` (7), `bookingCutoff` (minutes before the start when booking closes, 0), `demoFill` (share of mats shown as taken, 0.45) |
| `ROOMS` | `loft` (16 mats, 4 per row) and `garden` (10 mats, 5 per row) |
| `TEACHERS` | `morwenna`, `jago`, `anouk`, `kerensa`: name, short name, role |
| `STYLES` | `vinyasa`, `hatha`, `slow`, `yin`, `restore`, `pregnancy`, `beginners` |
| `LEVELS` | `open` (All levels, 0 dots), `gentle` (1), `steady` (2), `strong` (3) |
| `CLASSES` | The weekly schedule: 30 classes with `id`, `day` (0 = Sunday), `start` (24-hour Pacific time, shown on the page in 12-hour form by `hhmm()`), `mins`, `style`, `level`, `teacher`, `room` |
| `PRICES` | Drop-in price, intro offer ($59 for 3 weeks), discount (`concession`, 20%), and the five options the calculator compares |
| `EVENTS` | Workshop and retreat ids, titles, kinds and dates: a rolling `rule` (for example the 1st Saturday of next month) or fixed `date`/`end` in the studio's time zone |
| `TOPICS` | Contact form topics that `?topic=` can preselect |

To add a class, add a line to `CLASSES` with a unique `id` (bookings are saved against it):

```js
{ id: 'thu-1230', day: 4, start: '12:30', mins: 45, style: 'slow', level: 'gentle', teacher: 'kerensa', room: 'garden' },
```

To add a style, teacher or level, add it to the matching constant, add an `<option>` with the same key to the
filters in `timetable.html`, and add its section to `classes.html` or `teachers.html` with `id="<key>"` (the
schedule links to `classes.html#<style>` and `teachers.html#<teacher>`).

Prices appear twice: in the cards in `pricing.html` and in `PRICES` for the calculator. Change both. Workshops also
appear twice: the cards and form options in `workshops.html` (each card has `data-event="<id>"`) and `EVENTS`.

#### Workshop dates: rolling or fixed

So the demo always has upcoming events, each event in `EVENTS` has a rolling `rule`, worked out from today's date in
Santa Cruz: `monthsAhead` (1 = next month), `weekday` (0 = Sunday ... 6 = Saturday) and `nth` (1–4, or -1 for the last one
in the month). `days` sets how long it lasts (default 1). For your real program, replace the rule with fixed dates;
an event with a `date` ignores its rule:

```js
// Rolling: the 3rd Sunday of next month
inversions: { title: 'Arm balances & inversions, step by step', kind: 'workshop', rule: { monthsAhead: 1, weekday: 0, nth: 3 } },
// Fixed: a two-day event on March 13–14, 2027 (end is optional)
'new-year': { title: 'Beginners’ weekend', kind: 'course', date: '2027-03-13', end: '2027-03-14' },
```

The dates on the cards (`[data-event-when="<id>"]`), the short dates on the home page teasers
(`[data-event-short="<id>"]`) and the inquiry form options are filled in from `EVENTS`. Without JavaScript the cards
read "Dates on request". Keep the ids: `?event=<id>` links use them.

### Images and artwork

There are no photos. All artwork is SVG drawn for this template:

- `pose-*.svg` (240x240): a line figure over a colored pebble, used for class styles.
- `teacher-*.svg` (240x300): arch-shaped portraits. To use photos, keep a 4:5 ratio and the `arch` class on the
  wrapper so they get the same rounded top.
- The home hero scene is inline SVG in `index.html` (460x560, arch frame).
- `map.svg` is an illustration, not a real map. Replace it with a screenshot of your own map or an embedded map.
- `og-image.svg` is the social image source. Export it to `og-image.png` (1200x630) after editing; social sites don't
  show SVG. `favicon.svg` is the browser tab icon.

### Navigation, header and footer

The header and footer are repeated in every HTML file. To add a page, copy an existing page, then add a link to the
`<nav aria-label="Main">` list, the mobile menu (`#mobile-menu`) and, if you like, the footer, in every file. Mark
the current page's link with `aria-current="page"`. The desktop menu shows from 1280px (`xl:`); below that the menu
button opens the mobile menu.

## Features

### Today's classes and next class

On the home page `[data-today-list]` lists today's classes with their state, and `[data-next-class]` shows the next
class that hasn't started yet, with a button to reserve a mat. Times come from `CLASSES` and the current time in
`STUDIO.timeZone` (`America/Los_Angeles`), whatever the visitor's own time zone. Once today's last class has finished the
list switches to tomorrow ("Tomorrow at the studio"), so the page never looks empty. A class is "On now" between
its start and end, and the first class after now is "Up next".

### Schedule and filters

`timetable.html` shows today plus the next six days (`STUDIO.daysAhead`), one section per day, built by
`renderTimetable()` inside `[data-timetable]`. Days with no matching classes are skipped and a count is announced in
`[data-tt-count]`. The three selects in `[data-tt-filters]` filter by style, level and teacher; their values are kept
in the URL so filtered views can be shared:

```text
timetable.html?style=yin
timetable.html?teacher=jago&level=strong
```

URL values are only used when they are own keys of `STYLES`, `LEVELS` or `TEACHERS`
(`Object.prototype.hasOwnProperty.call`), so `?style=constructor` is ignored. If nothing matches, `[data-tt-empty]`
appears with a button to clear the filters.

### Mat booking

Every bookable class has a button with `data-book="<class id>@<YYYY-MM-DD>"`. It opens the native `<dialog>`
`[data-book-dialog]` with a room plan (`[data-mat-grid]`): one radio button per mat, laid out `ROOMS[room].cols` per
row with the teacher at the front. Mats shown as taken are demo data from `takenMats()`, a stable hash of the class
and date controlled by `STUDIO.demoFill`; at least two mats are always left free. Set `demoFill` to `0` when you
connect real data.

Reserving saves the booking (see [Saved data](#saved-data-localstorage)), updates the header count
(`[data-booking-count]`) on every page, the My bookings list on the schedule (`[data-my-bookings]`) and the class
row ("Mat 7 booked"). Opening a booked class lets you move to another mat or cancel. Classes that have started or
finished can't be booked; `STUDIO.bookingCutoff` closes booking earlier if you set it above 0.

Bookings live only in the visitor's browser; the note under the mat map tells them reserved mats are listed under
My bookings. To take real bookings, connect a booking system (Momence, Mindbody, bsport, TeamUp and others have
widgets or APIs) and replace the confirm handler on
`[data-book-confirm]` in `main.js` with a call to it, or link the "Reserve a mat" buttons to its booking pages.

Accessibility: the dialog is a modal `<dialog>` (focus is trapped, Esc closes it and focus returns to the button
that opened it). Mats are a radio group inside a `<fieldset>` with a legend, taken mats are disabled and announced as
"taken", and confirmations appear in a polite live region (`[data-toast]`).

### Class styles and teachers

On `classes.html` and `teachers.html`, `[data-next-of="style:<key>"]` and `[data-next-of="teacher:<key>"]` show the
next class of that style or teacher, and `[data-weekly-of="..."]` shows how many classes a week they have, both
computed from `CLASSES`.

### Intro-offer calculator

`[data-price-calc]` on `pricing.html` takes classes a week (1–6, a range input) and a discount checkbox. It shows
what the intro offer costs per class over three weeks and how much it saves on drop-in prices, then works out a
month's cost for every option in `PRICES.options` (52 weeks / 12 months): drop-in, 5-class pass, 10-class pass,
Eight a month (plus `extra` per class over eight) and Unlimited. The cheapest is highlighted and bars compare the
rest. The discount only applies to memberships. Results are announced through `aria-live`.

### Workshops and retreats

Each card in `workshops.html` has `data-event="<id>"`. Dates come from `EVENTS` (rolling rules or fixed dates, see
[Workshop dates](#workshop-dates-rolling-or-fixed)) and the cards are sorted by date. Events whose end date is before
today are hidden, and their option is removed from the inquiry form. The "Everything / Workshops / Retreats" buttons
in `[data-kind-filter]` use `aria-pressed`. An "Inquire" button preselects the event in the form, and
`workshops.html?event=scilly#enquire` does the same from another page (only ids in `EVENTS` are accepted).

### FAQ search

`[data-faq-search]` on `guide.html` filters the `<details data-faq>` items as you type, highlights the match in
each question with `<mark>`, opens items whose match is only in the answer, hides empty groups and announces the
count. `guide.html?q=mat` pre-fills the search. The accordion uses native `<details>`/`<summary>`, so it works with
the keyboard and without JavaScript.

### Small extras

- Header gets a hairline when you scroll; mobile menu with `aria-expanded`, Esc and click-outside to close.
- Scroll reveal (`.reveal`), off with reduced motion; gentle drifting cards and tide lines in the hero.
- `contact.html` shows today's first door-opening time and last class end in `[data-today-hours]`.
- `contact.html?topic=teaching` preselects a topic (own keys of `TOPICS` only).
- A back-to-top button appears after one screen of scrolling.

## Forms

There are two forms, both with `novalidate`, `data-validate-form`, inline errors and a success state:

| Form | Page | Validates |
|------|------|-----------|
| Booking inquiry (`[data-enquiry-form]`) | `workshops.html` | Event chosen, name, valid email, optional phone format, terms checked |
| Message (`[data-contact-form]`) | `contact.html` | Name, valid email, topic chosen, message of at least 10 characters |

Each field names its error element with `data-error-id` and is linked to it with `aria-describedby`. On submit, the
first invalid field gets focus and a summary appears in a `role="alert"` paragraph. The success state confirms the
message or inquiry has reached the studio, shows a short reference in `[data-success-ref]` (`SS-` and four
characters, made in the browser by `makeRef()`) and says what happens next: a reply within one business day for
messages and within two business days, with a deposit link, for workshop inquiries. If your form service returns
its own reference, show that instead, and change the reply times to match how you actually handle messages.

**The forms don't send anything until you connect them**, although their success states read as if they had. To use Formspree (or any form service that accepts
a POST), replace the demo success block in the `form[data-validate-form]` submit handler in `assets/js/main.js`:

```js
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (!res.ok) throw new Error('Send failed');
  form.hidden = true;
  done.hidden = false;
  done.focus();
}).catch(function () {
  summary.textContent = 'Sorry, that didn’t send. Please email hello@saltandsageyoga.example.';
  summary.hidden = false;
});
```

Give each form an `action` with the same URL and `method="post"` if you also want it to work without JavaScript.

## Saved data (localStorage)

| Key | Shape | Validated on read |
|-----|-------|-------------------|
| `flow.bookings` | `[{ "c": "mon-0700", "d": "2026-10-19", "m": 7 }]`: class id, studio date, mat number | Must be an array; `c` must be an own key of the classes; `d` must be `YYYY-MM-DD` on the class's weekday; `m` a whole number within the room's mats. Duplicates and classes that have finished are dropped and the cleaned list is written back. |

All access goes through one `safeStorage` object. When `localStorage` is blocked (sandboxed iframes, strict privacy
settings) it falls back to an in-memory store, so booking still works for the rest of the page view. To reset, run
`localStorage.removeItem('flow.bookings')` in the browser console or cancel each booking under My bookings.

## SEO and sharing

Every page has its own `<title>`, meta description, `og:title`, `og:description`, `og:image` and `theme-color` in
its `<head>`. Before you launch:

- Set `og:image` to an absolute URL, for example `https://www.saltandsageyoga.example/assets/img/og-image.png`.
- Add `<link rel="canonical">` with each page's full URL.
- Add a `sitemap.xml` listing the pages and a `robots.txt` that points to it.
- Consider `LocalBusiness` / `ExerciseGym` structured data (JSON-LD) with your address and opening hours.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page and a logical heading order.
- Visible focus rings (`:focus-visible`), WCAG AA color contrast on sand, shell and dune backgrounds.
- Native `<dialog>` for booking, a radio group for mats, `aria-pressed` filter buttons, `<details>` for accordions.
- Live regions for schedule counts, FAQ results, the calculator and booking confirmations.
- `prefers-reduced-motion` turns off reveals, drifting and the breathing dot.

When editing, keep one `<h1>` per page, give new inputs a `<label>`, and make sure every `aria-describedby`,
`aria-labelledby` and `aria-controls` points at an id that exists.

## Building and deploying

The compiled CSS is committed, so you can upload the folder as it is. To change styles or add Tailwind classes that
aren't used yet, install Node.js 24 and run:

```sh
npm install
npm run build   # or: npm run watch
```

Classes used only inside `main.js` strings are picked up because Tailwind scans the JavaScript file too.

To deploy, upload the folder to any static host: Netlify Drop, Cloudflare Pages, GitHub Pages or your own server.
There is no server code. Remove `src/`, `package.json` and `DOCS.md` from the upload if you don't want them public.

## Troubleshooting

- **Classes show at the wrong time.** Times are Pacific time (`STUDIO.timeZone`). If your studio is elsewhere, change
  the time zone and the "Pacific time" wording in the HTML.
- **A booking disappeared.** Bookings are removed once the class has finished, and they live in one browser only.
  In a private window or with storage blocked they last for the current page view.
- **A filter link doesn't filter.** The value must match a key in `STYLES`, `LEVELS` or `TEACHERS` exactly
  (`?style=restore`, not `?style=restorative`).
- **A new class doesn't show.** Check its `day` (0 = Sunday) and that its `style`, `level`, `teacher` and `room`
  keys exist in the matching constants.
- **New Tailwind classes have no effect.** Rebuild the CSS with `npm run build`.
- **A workshop vanished.** Events with a fixed `date` are hidden once it has passed; update the date, switch back to a
  rolling `rule`, or remove the card.
- **The social preview shows no image.** Use an absolute URL for `og:image` and the PNG, not the SVG.

## License

MIT. The code and all included artwork are free for personal and commercial use, including client work. The full
license is in `LICENSE.txt` in the download. EB Garamond and Mulish are licensed under the SIL Open Font License.
Salt & Sage Yoga, its teachers, students, reviews, events and prices are fictional.
