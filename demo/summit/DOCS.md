# Summit documentation

## Overview

Summit is a vibrant website for a conference or event: a live countdown, speakers with pop-up profiles,
a three-day schedule with tracks and a personal "My schedule", ticket selection with a team discount, the
venue and sponsors. The demo event is **Summit 2027**, a fictional design, engineering and AI conference
in Bellevue, WA (April 14–16, 2027) with 12 speakers and 35 sessions. It is built with HTML5, Tailwind CSS
v4 and vanilla JavaScript, and needs no build step. This guide covers version 1.1.12.

Live demo: [freeframe.dev/templates/summit](https://freeframe.dev/templates/summit)

## Quick start

1. Unzip the download and open `index.html` in a browser.
2. Or serve the folder with any static server:

   ```sh
   cd summit
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

Add `?now=2027-04-15T10:45` to any page's URL to preview it as if the event were live (see
[Live schedule state](#live-schedule-state)). Node.js 24 is only needed to rebuild the CSS (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections |
|------|---------|------------------|
| `index.html` | Home | Hero with live countdown, topics strip, highlights, featured speakers, count-up stats, schedule preview, sponsor wall, testimonial, venue preview, newsletter |
| `speakers.html` | All speakers | Track filter and pop-up speaker profiles |
| `speaker.html` | One speaker (`speaker.html?id=hana-kim`, any letter case) | Bio, links, sessions, "More speakers" |
| `schedule.html` | Program | Day tabs, track filter, starred sessions in "My schedule", "On now"/"Up next" during the event |
| `tickets.html` | Tickets | Four passes with early-bird prices, quantity steppers, order summary with team discount, comparison, refund FAQ, checkout with an order confirmation |
| `venue.html` | Venue and travel | Venue details, illustrated map, travel options, partner hotels, accessibility |
| `sponsors.html` | Sponsors | Sponsor tiers and packages, sponsorship inquiry form |
| `404.html` | Not found | Error page with links back |

## Project structure

```text
summit/
├── index.html, speakers.html, speaker.html, schedule.html, tickets.html, venue.html, sponsors.html, 404.html
├── assets/
│   ├── css/style.css      compiled Tailwind CSS (generated)
│   ├── js/data.js         event content: tracks, days, speakers, sessions, ticket settings
│   ├── js/main.js         countdown, speakers, schedule, tickets, forms, reveals, back to top
│   └── img/               speakers/<id>.svg portraits, favicon, social image
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
| `--color-night`, `--color-night-2`, `--color-panel` | Dark backgrounds and cards |
| `--color-edge` | Borders |
| `--color-ink`, `--color-haze` | Text and secondary text |
| `--color-violet`, `--color-magenta`, `--color-flame` | The gradient used for headlines, buttons and highlights |
| `--color-lime` | Focus rings, "On now" badges, selected items |
| `--color-sky` | "Up next" badges and accents |

Change the three gradient colors to restyle the whole event, then rebuild the CSS:

```css
@theme {
  --color-violet: #2563eb;
  --color-magenta: #06b6d4;
  --color-flame: #22c55e;
}
```

Track colors (`.tag-design`, `.tag-engineering`, ...) are component classes in `src/input.css`. Update
the `theme-color` meta tag in each page's `<head>` if you change `--color-night`.

### Typography

Headings use **Space Grotesk** (`--font-display`) and text uses **Inter** (`--font-sans`), loaded from
Google Fonts in each page's `<head>`. Replace that `<link>` on every page and the two tokens to change
them.

### Content

Event content is split between **`assets/js/data.js`** (used by scripts) and the **HTML** (what's shown
without JavaScript). Change both when you edit the program.

`data.js` defines `window.SUMMIT`:

| Key | Contents |
|-----|----------|
| `keepDemoCurrent` | `true` in the demo: once the edition is over, every date moves on a year (see [Demo dates](#demo-dates)). Set it to `false` when you enter your real dates |
| `tracks` | Track ids and labels: `design`, `engineering`, `ai`, `leadership`, `general` |
| `days` | `{ "id": "wed", "date": "2027-04-14", "label": "Wed, Apr 14", "title": "Workshop day" }` |
| `speakers` | `{ "id", "name", "role", "company", "city", "track", "bio", "twitter", "site" }` |
| `sessions` | `{ "id", "day", "start", "end", "title", "speakers": [ids], "track", "room", "level", "kind" }`. `start` and `end` are 24-hour in the data and show on a 12-hour clock. |
| `earlyBirdEnds` | When early-bird pricing ends, e.g. `"2026-12-31T23:59:59-08:00"` |
| `teamDiscount` | `{ "minTickets": 5, "percent": 15 }` |
| `tickets` | Ticket ids, names and prices (reference only; see below) |

What reads which source:

| Content | Comes from |
|---------|------------|
| Speaker cards on `speakers.html` and `index.html` | HTML |
| Speaker pop-up, `speaker.html?id=…`, "More speakers" | `SUMMIT.speakers` and `SUMMIT.sessions` |
| Default `speaker.html` (no `?id=`) | HTML for the first speaker in `SUMMIT.speakers`; other speakers are built with the same layout |
| Schedule sessions on `schedule.html` | HTML (`<li data-session="…">` items) |
| Valid starred sessions, a speaker's talks | `SUMMIT.sessions` |
| Ticket prices and early-bird prices | `SUMMIT.tickets` (`price` and `early` per ticket `id`) |
| Early-bird end date and team discount | `SUMMIT.earlyBirdEnds`, `SUMMIT.teamDiscount` |
| Countdown target | `data-countdown` on the countdown in `index.html` |

**Adding a session** means adding it to `SUMMIT.sessions` *and* adding a schedule item to the right day
panel in `schedule.html`, with the same id and timing attributes:

```html
<li class="session grid gap-4 p-5 sm:grid-cols-[10rem_1fr_auto] sm:p-6"
    data-session="s36" data-track="ai" data-day="thu"
    data-start="2027-04-15T16:00" data-end="2027-04-15T16:40">
  <!-- copy the inner markup of an existing session: time, title, speakers, room, star button -->
</li>
```

Copy the inner markup from a neighboring session so it keeps its star button (`data-star="s36"`) and
`.live-badge`. `data-start`/`data-end` are local event times without a time zone.

**Adding a speaker** means an entry in `SUMMIT.speakers`, a portrait at `assets/img/speakers/<id>.svg`,
and a card on `speakers.html` (a list item with `data-track` and a button with `data-speaker="<id>"`).

### Demo dates

The demo is written for April 14–16, 2027. While `SUMMIT.keepDemoCurrent` is `true` and that edition is over
(the event-local date is after the last day in `SUMMIT.days`), the script moves every date to the same week of
the next year, by whole weeks so weekdays never change (Wed, April 14, 2027 becomes Wed, April 12, 2028), so the
countdown, ticket prices, schedule and "live" state always point at an upcoming conference. The year of the
edition follows. It updates:

- `SUMMIT.days` (dates and labels), `SUMMIT.earlyBirdEnds`, the countdown target and every `data-start` and
  `data-end`;
- `data-edition` text: `dates` ("April 14–16, 2027"), `year` ("2027"), `year-1`, `year+1`, `yy` ("’27") and
  `yy-plain` ("27", in the hotel code);
- `data-date="2027-04-01"` text, written as `dmy` ("April 1, 2027", the default), `dm` ("March 1") or `dmon`
  ("Dec 31") with `data-date-format`;
- `data-day-label="wed"` (the schedule's day tabs), the page title and `aria-label`s that contain the year.

Before the edition is over nothing is changed, so a preview such as `?now=2027-04-15T10:45` still shows the
live schedule. **Set `keepDemoCurrent` to `false` in `data.js` once you enter your real dates.** Elements with
`data-early-only` (the "Early-bird tickets on sale" pill and the first sentence of the tickets intro) are removed
once early-bird pricing has ended, whatever the setting.

### Time zone

Event times are written in Pacific daylight time (`America/Los_Angeles`, UTC-7 in April). `eventTime()` in `assets/js/main.js` appends `-07:00`
to every time, and the schedule picks "today's" day tab from the event-local date (`now()` shifted by
`-7 * 3600 * 1000` ms, i.e. UTC-7). Change both offsets (and the note at the top of `data.js`) for an
event elsewhere, for example `-04:00` and `-4 * 3600 * 1000` for New York in summer.

### Images and artwork

Speaker portraits are illustrated SVGs in `assets/img/speakers/<speaker-id>.svg` (square). Replace them
with square photos using the same file names, or change the `assets/img/speakers/` paths in
`assets/js/main.js` if you use `.jpg`. Other art is inline SVG in the pages. The favicon is
`assets/img/favicon.svg`; the social image is `assets/img/og-image.png` (1200×630), exported from
`assets/img/og-image.svg`.

### Navigation, header and footer

The header, mobile menu and footer are repeated in every page. To add a page, copy one, replace the
content inside `<main>`, and add the link to the desktop and mobile menus on every page with
`aria-current="page"` on the current one.

## Features

### Countdown

The element with `data-countdown="2027-04-14T09:00:00-07:00"` counts down days, hours, minutes and
seconds into its `[data-unit="days"]`, `"hours"`, `"minutes"` and `"seconds"` children. It has
`role="timer"`, and stops at zero.

### Speakers filter and pop-up profiles

On `speakers.html`, buttons with `data-filter` (`all` or a track id) show speakers whose list item has a
matching `data-track` and update `[data-count-label]`. Clicking a speaker opens a native `<dialog>`
(`[data-speaker-modal]`) built from `SUMMIT.speakers`: photo, role, bio and every session they appear in.
**Esc**, the close button or clicking outside closes it, and focus returns to the speaker you opened.

### Schedule, tracks and My schedule

`schedule.html` has a tablist of days (`[data-day-tab]`, including a "My schedule" tab with id `mine`)
with **Left/Right**, **Home** and **End** keys. The current tab, chosen by click or key, is kept in the URL
hash (`schedule.html#fri`), and during the event the current day opens automatically.

- Track buttons (`data-track-filter`) show one track; breaks and socials (`general`) stay visible so each
  day still reads as a timeline. An empty state appears when a day has nothing in that track.
- Star buttons (`data-star`, `aria-pressed`) add sessions to **My schedule**, grouped by day, with a count
  in `[data-star-count]` and a toast. Their label follows the state ("Add “…” to my schedule", or "Remove
  “…” from my schedule" once starred, also for stars restored from the browser). Stars are saved in the browser (see
  [Saved data](#saved-data-localstorage)).

### Live schedule state

Every minute the schedule marks the session that is on now (`.is-now`, "● On now") and the next one
within three hours (`.is-next`, "Up next"), and shows a live note. Preview it any time with `?now=`:
`schedule.html?now=2027-04-15T10:45`. The same parameter also drives the countdown and early-bird
pricing, which is handy for testing.

### Tickets and order summary

Each ticket card on `tickets.html` (`data-ticket="<id>"`) has −/+ steppers
(`data-step`, 0–20 each). Until `SUMMIT.earlyBirdEnds` the early price is used and the full price is shown
struck through; afterwards the early-bird labels are removed. The summary lists each line, the subtotal,
the team discount (15% from five tickets, from `SUMMIT.teamDiscount`), a hint showing how many more
tickets unlock it, and the total. **Continue to checkout** opens the checkout form.

Prices come from `SUMMIT.tickets` in `assets/js/data.js`, matched to each card by its `data-ticket` id:

```js
"tickets": [
  { "id": "workshop", "name": "Workshop day", "price": 349, "early": 299 },
  { "id": "conference", "name": "Conference pass", "price": 799, "early": 599 }
]
```

The script writes the current price (`data-price-now`) and the full price (`data-price-was`) into each card,
so the order totals always match the data. When `early` equals `price` the struck-through price and
early-bird label are removed. The prices typed into the HTML are only shown if JavaScript doesn't run;
update them, and the comparison table, to match. A card whose id isn't in `SUMMIT.tickets` is hidden.

### Scroll reveals and count-up stats

Elements with `reveal` fade in when scrolled into view; numbers with a count-up animation run once when
visible. The gradient blobs drift slowly. All motion stops with `prefers-reduced-motion`.

### Mobile menu

The menu button opens a full-screen menu with an explicit height, makes the header solid while open,
updates `aria-expanded`, and closes with **Esc**.

### Back to top button

Every page gets a "Back to top" button in the bottom-right corner, created by the "Back to top" block at
the end of `assets/js/main.js` and styled by the `.back-to-top` rules at the end of `src/input.css`. It
appears after about one screen of scrolling, scrolls to the top (instantly with reduced motion), moves
focus to the main content and lifts above toasts (such as the "Added to my schedule" message). Add
`data-back-to-top-avoid` to anything you pin to the bottom of the screen, or `data-back-to-top-hide` to a
sticky element it must never cover. To remove it, delete that JavaScript block and the CSS rules, then
rebuild the CSS.

## Forms

| Form (`data-form`) | Page | Fields |
|--------------------|------|--------|
| `checkout` | `tickets.html` | `first`, `last`, `email`, `company`, `country`, `payment` (card or invoice), `terms` |
| `sponsor` | `sponsors.html` | `name`, `email`, `company`, `tier`, `message` |
| `newsletter` | `index.html` | `email` |

Forms marked `data-validate` check required fields, email format, minimum lengths and required
checkboxes. Errors appear next to each field (`data-error-for`), fields get `aria-invalid`, and the first
problem is focused. On success the form's `[data-success]` element is shown and a `summit:submitted`
event fires; the ticket page uses it to show an "Order placed" confirmation with the order total.

The confirmations read like the conference's own messages. The ticket confirmation and the sponsor one show a
short reference (`SU-` and four characters, made in the browser by `makeRef()` in `main.js`; the sponsor message
fills its `[data-ref]`, the ticket page its `[data-confirm-ref]`). Use your form or ticketing service's own
reference instead if it returns one. The sponsor message repeats the page's promise of the deck within two working
days; the ticket confirmation and the note under the payment choice say a secure payment link (or a PDF invoice)
follows by email; the newsletter one asks the visitor to look out for a confirmation email. Change any of these
to match what really happens.

**Nothing is sent until you connect the forms.** In the "forms" section of `assets/js/main.js`, find the
comment "To send for real" and post the data before showing success:

```js
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (!res.ok) throw new Error('Request failed');
  var success = $('[data-success]', form);
  if (success) {
    $$('[data-ref]', success).forEach(function (el) { el.textContent = makeRef('SU'); });
    success.classList.remove('hidden');
  }
  form.reset();
  document.dispatchEvent(new CustomEvent('summit:submitted', { detail: { form: form.dataset.form } }));
});
```

**For real ticket sales**, don't collect payment details in this form. Use a ticketing or payment
provider (Tito, Eventbrite, Stripe Checkout...): replace the checkout section with their embed, or send
the selected quantities to their checkout from the **Continue to checkout** button.

## Saved data (localStorage)

| Key | Shape | Purpose |
|-----|-------|---------|
| `summit-2027-stars` | Array of session ids, e.g. `["s2", "s14"]` | Sessions starred for My schedule |

On load the stored value is validated: anything that isn't an array of known, unique session ids (from
`SUMMIT.sessions`) is dropped and storage is repaired. For a new edition, change the key in
`STAR_KEY` (for example `summit-2028-stars`) so old stars don't carry over. Reset with
`localStorage.removeItem('summit-2027-stars')`.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `twitter:card`. `speaker.html`
updates its title for the speaker in `?id=`; because that happens in the browser, consider static pages
per speaker if they matter for search. When you deploy, change `og:image` on every page to an absolute
URL:

```html
<meta property="og:image" content="https://example.com/assets/img/og-image.png">
```

Add [Event structured data](https://schema.org/Event) (name, dates, location, offers) as JSON-LD on
`index.html` so search engines can show the event, and a `sitemap.xml`.

## Accessibility

- Skip link, labeled landmarks, one `<h1>` per page and visible lime focus rings.
- Day tabs follow the tabs pattern; filters and stars use `aria-pressed`.
- Speaker profiles use a native `<dialog>` with focus return; the countdown has `role="timer"`.
- Track tags use text labels, not color alone.
- Toasts are announced with `aria-live`.
- Motion (reveals, drifting gradients, counters) respects `prefers-reduced-motion`.

When editing, keep gradient text large and on dark backgrounds for contrast, label new form fields, and
give new portraits empty `alt` text only where the speaker's name is already next to them.

## Building and deploying

`assets/css/style.css` is pre-built. Rebuild it after editing `src/input.css` or using Tailwind classes
that aren't in the CSS yet, including classes inside the HTML strings in `assets/js/main.js`. With
Node.js 24:

```sh
npm install
npm run build     # or: npm run watch
```

Summit is a static site: upload the folder (without `node_modules/`) to Netlify, GitHub Pages, Cloudflare
Pages or any web host. No build command is needed on the host.

## Troubleshooting

- **A new session has no star or never shows "On now".** Copy the full inner markup of an existing
  session (star button and `.live-badge`), and give it `data-start`/`data-end`.
- **A starred session disappears after reload.** Its id must also exist in `SUMMIT.sessions`.
- **A speaker pop-up is empty or missing.** The button's `data-speaker` must match an `id` in
  `SUMMIT.speakers`.
- **A ticket card disappeared.** Its `data-ticket` id must match an `id` in `SUMMIT.tickets`.
- **Times are an hour or more off.** Change the `-07:00` offset in `eventTime()` (and the matching
  `-7 * 3600 * 1000` shift for the schedule's day tab) to your event's offset.
- **New Tailwind classes have no effect.** Rebuild the CSS.
- **Forms "send" but nothing arrives.** Connect them as described in [Forms](#forms).

## License

Summit is released under the MIT License (see `LICENSE.txt` in the download), for personal and
commercial use. The included SVG speaker portraits and artwork are covered by the same license. Space
Grotesk and Inter are licensed under the SIL Open Font License.
