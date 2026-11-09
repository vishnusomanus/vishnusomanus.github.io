# Matinee documentation

## Overview

Matinee is a website template for an independent movie theater. The demo is **The Garnet Theater**, a
fictional nonprofit, single-screen art deco movie palace on North Higgins Avenue in Missoula, Montana, opened
in 1931. The design borrows from the theater itself: deep velvet burgundy, brass and gold, cream letterboards,
marquee bulbs and sunburst ceilings. It has a marquee home page with tonight's screenings, a two-week program,
a page for every film with its own SVG poster, seat-map ticket booking, memberships, film series and private
hire, and a visit page. It is built with plain HTML, Tailwind CSS v4 and vanilla JavaScript (no build step
needed to run it). This is version 1.0.4 (see `template.json` and [CHANGELOG.md](CHANGELOG.md)). Live demo:
[freeframe.dev/templates/matinee](https://freeframe.dev/templates/matinee).

Copy uses US English, prices are in US dollars and every date and time is Mountain Time
(`America/Denver`), whatever time zone the visitor is in.

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Everything works from the file system.
3. Or serve the folder, which is closer to how it will run online:

```sh
npx serve .
```

You only need Node.js 24 or newer if you change the styles and rebuild the CSS (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Blade sign and marquee letterboard with tonight's films, next-screening countdown, tonight's showtimes with booking buttons, ticket prices and screening key, now showing, coming soon, next three events, membership band, visit cards |
| `whats-on.html` | The program | Day strip for the next 14 days, day list or week grid (`?view=week`), genre and accessibility filters, "watchlist only", the saved watchlist |
| `film.html` | One film (`?film=`) | Poster, tagline, credits, synopsis, programmer's note, showtimes for two weeks, accessibility notes, next show to calendar, watchlist button, related films |
| `tickets.html` | Booking (`?show=` or `?film=`) | Screening picker, ticket types with matinee prices, seat map with best-available, snacks for pickup, details, booking reference, "your bookings" with cancel and calendar |
| `membership.html` | Membership | Monthly/annual switch, three levels, savings slider, comparison table, join form, questions |
| `events.html` | Series, events and hire | Six series with their own art, an events calendar filtered by series (`?series=`), private-hire quote with a live marquee preview and an inquiry form |
| `visit.html` | Plan your visit | Box office hours with today highlighted and an open-now status, map, parking and buses, accessibility, concession menu with a dietary filter, questions |
| `about.html` | Our story | SVG facade, timeline since 1931, things to look for in the building, staff, support band |
| `404.html` | Not found | An "intermission" letterboard and links back |

## Project structure

```text
matinee/
  index.html, whats-on.html, film.html, tickets.html, membership.html,
  events.html, visit.html, about.html, 404.html
  assets/
    css/style.css        compiled Tailwind CSS (generated, do not edit by hand)
    js/data.js           the program: films, showtimes, seats, prices, snacks, series, events, membership, hours
    js/main.js           everything that draws and runs the pages (posters, filters, booking, forms)
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

`data.js` is loaded before `main.js` on every page and exposes one object, `window.GARNET`.

## Customizing

### Brand and colors

Design tokens live in the `@theme` block at the top of `src/input.css`.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-velvet`, `--color-velvet-deep`, `--color-wine` | `#3d0a17`, `#2a0610`, `#5e1124` | Header, footer, heroes and dark sections |
| `--color-garnet`, `--color-garnet-bright` | `#9b1c34`, `#c22a45` | Buttons, headings on cream, focus outline |
| `--color-brass`, `--color-gold` | `#c8a046`, `#e8c874` | Lines, bulbs, brass buttons, text on dark |
| `--color-brass-deep` | `#7a5a14` | Brass-colored labels on cream (AA contrast) |
| `--color-cream`, `--color-paper`, `--color-sand` | `#f7eedb`, `#fcf7ec`, `#efe0c2` | Page, cards and panels |
| `--color-ink`, `--color-muted` | `#2a0b14`, `#6b4b50` | Text |
| `--color-jade`, `--color-jade-soft` | `#1d5a52`, `#d4e8e2` | Accessibility tags and the wheelchair spaces |

To make the house teal instead of burgundy:

```css
@theme {
  --color-velvet: #0f3b44;
  --color-velvet-deep: #0a2a31;
  --color-wine: #16505b;
}
```

Useful component classes: `.btn` with `.btn-garnet`, `.btn-brass`, `.btn-outline` and `.btn-sm`;
`.deco-title` (Limelight headings); `.eyebrow`; `.card`, `.card-velvet` and `.deco-frame` (inner brass
line); `.marquee-sign`, `.bulbs`, `.letterboard`, `.board-line`, `.board-char`; `.sunburst`; `.chip`,
`.day-chip`, `.tag` with `.tag-access`, `.tag-format`, `.tag-event`; `.showtime`; `.poster`; `.watch-btn`;
`.seat`; `.stepper`; `.switch`; `.stub` (ticket edge). Dark sections carry `.on-dark`, which switches
eyebrow, outline-button and focus colors.

### Typography

Two Google Fonts are loaded with a `<link>` in the `<head>` of every page:

- **Limelight** for headings, the logo, posters and big numbers (`font-display`, `.deco-title`)
- **Libre Franklin** (400–800) for body text, buttons and the letterboard (`font-sans`)

To swap one, change the `https://fonts.googleapis.com/css2?...` link in every page and the matching token
in `@theme` (`--font-display`, `--font-sans`), then rebuild the CSS. The posters drawn in `main.js`, the
inline SVG art and `og-image.svg` name the fonts in their `font-family` attributes too.

### Content

Static text lives in the HTML files. Everything listed, counted or computed lives in `assets/js/data.js`:

| Constant | What it holds |
|----------|---------------|
| `THEATER` | Name, `timeZone` (`'America/Denver'`), address, `trailerMinutes` (10), `uidDomain` for calendar files |
| `KEEP_DEMO_CURRENT`, `DEMO_ANCHOR` | `true` and `'2026-10-16'` (see [Demo dates](#demo-dates)) |
| `GENRES` | Genre keys and labels: `drama`, `comedy`, `documentary`, `thriller`, `family`, `classic`, `horror`, `romance` |
| `TAGS` | Screening tags: `cc` open captions, `ad` audio description, `sf` sensory-friendly, `pb` parent & baby (kind `access`); `mm` 35mm print (`format`); `qa` intro or Q&A (`event`) |
| `FILMS` | 17 films keyed by id: title, year, genre, runtime, rating, country, language, director, cast, tagline, synopsis, programmer's note, poster palette, and `opens` for the four films that open during the program |
| `PROGRAM` | Every screening, one line per date (21 days) |
| `SEAT_ROWS` | The auditorium, row by row (202 seats) |
| `TICKET_TYPES`, `MAX_SEATS` | Prices (evening and matinee) and the most seats per booking (10) |
| `CONCESSIONS`, `DIETS` | The concession menu; `addon: true` items are offered on the tickets page |
| `SERIES`, `EVENTS` | The six series and the dated events |
| `MEMBERSHIP` | Three levels with monthly and annual prices and perks |
| `HIRE` | Private-hire rates per hour, `minHours`/`maxHours` and add-ons |
| `HOURS` | Box office hours by weekday (0 = Sunday) |

A film looks like this:

```js
'sweetwater-static': {
  title: 'Sweetwater Static', year: 2026, genre: 'drama', runtime: 112, rating: 'PG-13', country: 'USA', language: 'English',
  director: 'Sidonie Marchal', cast: ['Augustin Ruskell', 'Florrie Brannick', 'Benny Ostrowski'],
  tagline: 'The last night-shift DJ in Sweetwater County is still on the air.',
  synopsis: 'When the AM station she has run alone for eleven years is sold…',
  note: 'Shot on 16mm in the high desert…',
  palette: ['#1b1238', '#3c2a6b', '#e8c874', '#f7eedb']
}
```

`genre` must be a key of `GENRES`; `runtime` is in minutes; `palette` is `[background, middle, accent,
light]` for the poster.

The program is one string per day. Each screening is `HH:MM film-id` followed by any tags, separated by `|`:

```js
'2026-10-21': '13:00 glass-orchard pb | 16:00 owls-lolo ad | 18:45 small-hours-tangier | 21:15 hallelujah-switchback',
```

The Garnet has one screen, so screenings on a day must not overlap: each runs `runtime` plus
`trailerMinutes`. `main.js` logs a console message (`console.info`) when one runs into the next. Unknown
film ids and tags are skipped. A screening's id is its date and time, for example `2026-10-21-1845`; that
is what `tickets.html?show=` takes.

To add a film: add it to `FILMS`, give it screenings in `PROGRAM`, and (optionally) a poster motif in
`POSTER_MOTIFS` in `main.js`. Without a motif the poster is a plain panel in the film's colors with the
title band.

A film that opens during the program has `opens: 'YYYY-MM-DD'` (its first screening). Until that date it is
listed as "Coming soon" with "Opens …", and its film page says "Opens …"; after it, it is "Now showing".
Films without `opens` are already playing. `opens` moves with the program (see [Demo dates](#demo-dates)),
so the same four films are always the ones about to open. Without `opens`, a new film is "Now showing" as
soon as it has a screening ahead.

An event:

```js
{ id: 'organ-gull-rock', series: 'organ-silents', date: '2026-11-09', start: '13:00', end: '14:30', place: 'Auditorium',
  price: '$12', title: 'Organ Loft Silents: The Lighthouse at Gull Rock (1926)', summary: 'A storm, a lighthouse keeper…' }
```

`series` must be a key of `SERIES`. An event with `show: 'YYYY-MM-DD HH:MM'` belongs to a screening in
`PROGRAM`: it gets a **Book seats** button and its price is worked out from `TICKET_TYPES`. Other events
show `price` and an **Add to calendar** button. Events disappear once their end time has passed.

The seat map:

```js
{ row: 'C', blocks: [4, 10, 4] },                           // 4 seats, aisle, 10 seats, aisle, 4 seats
{ row: 'M', blocks: [2, 10, 2], offset: 2, wheel: [1, 2, 13, 14] }
```

Seats are numbered left to right across the row. `offset` adds empty seat widths at the start so rows line
up; `wheel` lists wheelchair spaces. The seat count shown on the site (202) and the private-hire guest
limit come from this list.

### Demo dates

A template can wait a long time between downloads, so the program must never look out of date. `PROGRAM`
and `EVENTS` are written for the three weeks starting `DEMO_ANCHOR` (a Friday, when the program changes).
While `KEEP_DEMO_CURRENT` is `true`, every date moves forward by the whole weeks elapsed since
`DEMO_ANCHOR` (`SHIFT` in `main.js`), so the site always shows this week and next. Weekdays and times
never change, and on 2026-10-21, the day the demo was written, nothing moves.

```js
var KEEP_DEMO_CURRENT = true;    // false once PROGRAM and EVENTS have your real dates
var DEMO_ANCHOR = '2026-10-16';  // the Friday the demo program starts
```

**Set `KEEP_DEMO_CURRENT = false` when you enter real dates.** Past screenings then disappear on their
own, films with no screenings left show "Returning soon", and past events are hidden.

Other things that keep the demo current:

- The footer year (`[data-year]`) and the theater's age on `about.html` (`<span data-since="1931">`) are
  filled in the browser.
- "Tonight" means today while screenings remain; after the last show of the night the home page shows
  tomorrow ("Tomorrow at The Garnet") and the What's on page opens on tomorrow.
- Started screenings are marked "Started" and can't be booked.

What the demo shows at a few fixed clocks (UTC, useful for tests):

| Clock (UTC) | Theater time | Home page |
|-------------|--------------|-----------|
| 2026-10-21 18:30 | Wednesday 12:30 pm | "Tonight": The Glass Orchard 1:00 pm (parent & baby), Night Owls of Lolo Pass 4:00 pm (AD), Small Hours in Tangier 6:45 pm, Hallelujah Switchback 9:15 pm; next screening in 30 minutes |
| 2027-01-15 06:30 | Thursday 11:30 pm | Today's screenings are over: "Tomorrow at The Garnet", Friday January 15, from 1:30 pm; Bonfire Logic, The Snowbound Choir, Seven Lakes, One Summer and Harvest of Small Things listed as coming soon |
| 2027-10-21 10:00 | Thursday 4:00 am | A full week ahead, with screenings from 4:00 pm that day |

### Previewing a date

Add `?now=YYYY-MM-DDTHH:MM` (theater time) to any page to see it at that moment, for example
`index.html?now=2026-10-21T22:30`. Invalid values are ignored.

### Images and artwork

There are no photos. Everything is SVG:

- **Posters** are drawn by `posterArt(id, label)` in `main.js`: the film's motif from `POSTER_MOTIFS`
  (a radio tower, braided rivers, a glass-fruit orchard, a mountain switchback, a hotel facade, a weather
  machine, a compass rose, a lantern-lit arch, a steam train, searchlights and a typewriter, an elevator dial,
  a snowed-in choir, a hollow larch, a bonfire, an owl, alpine lakes and a bowl of figs), a title band in
  Limelight and a brass frame, on a 200 × 300 canvas. Any element with `data-poster="<film id>"` is filled;
  add `data-decorative` when the title is already next to it. To use real posters, replace the calls with
  `<img>` tags at a 2:3 ratio inside the `.poster` wrapper.
- **Series art** is drawn by `seriesArt(key)` (160 × 100) from each series' `art` key: `club`, `organ`,
  `kids`, `late`, `mountain`, `reel`.
- The blade sign on the home page, the organ on `events.html`, the map on `visit.html`, and the facade,
  building icons and staff portraits on `about.html` are inline SVG in the HTML.
- The social image is `assets/img/og-image.png` (1200 × 630), made from `og-image.svg`. Social sites don't
  show SVG, so export a new PNG after editing the SVG.
- `assets/img/favicon.svg` is the browser tab icon.

### Navigation, header and footer

The top bar, header and footer are repeated in every HTML file. To add a page, copy an existing page, change
its `<title>`, description, `data-page` on `<body>` and content, then add a link to
`nav[aria-label="Main"]`, the mobile menu (`#mobile-menu`) and the footer in every file. Mark the current
page with `aria-current="page"`. The footer has one discreet line saying the theater is fictional; remove it
for a real site.

## Features

### Marquee and tonight's screenings

`renderMarqueeBoard()` writes up to three of the day's films on the letterboard (`[data-marquee-board]`),
films still to play first, plus the next show time; `boardLine()` turns text into letterboard tiles.
`renderTonight()` fills `[data-tonight]` with the day's screenings and booking buttons, and
`renderNextShow()` keeps `[data-next-show]` updated every 30 seconds. The letterboard has an `aria-label`
listing the films. The bulbs twinkle only when the visitor hasn't asked for reduced motion.

### What's on

`initWhatsOn()` draws the day strip (`[data-day-strip]`, 14 days from today, `WINDOW_DAYS`), genre chips
(`[data-genre-filters]`), accessibility chips (`[data-access-filters]`) and the watchlist-only toggle. Two
views:

- **By day**: every screening on the chosen day in time order, with tags, end time, a watchlist star and
  a **Book** link.
- **Week grid** (`?view=week`): a table of films by day for this week or next (`&week=2`), with dated
  column headers and today highlighted. It scrolls sideways on narrow screens.

Accessibility filters combine (a screening must have every chosen tag). All choices are kept in the URL:
`whats-on.html?day=2026-10-24&genre=family&access=sf,cc&watch=1`. Values are checked against the day list,
`GENRES` and `TAGS` with own-key checks; anything else is ignored. Buttons use `aria-pressed`; the result
count is a polite live region.

### Film pages

`film.html?film=<id>` is filled by `initFilm()`. An unknown id shows `DEFAULT_FILM`
(`'sweetwater-static'`) with a short notice. The page title and meta description follow the film. Showtimes
cover the next 14 days, grouped by day; **Next show to calendar** downloads an `.ics` file built by
`icsFor()` (times written in UTC from Mountain Time). Related films share the genre first.

### Watchlist

Any `[data-watch="<film id>"]` button toggles the film on the watchlist (`aria-pressed` and a label that
names the film). The header star (`[data-watch-count]`) shows the count; `whats-on.html#watchlist` lists
each saved film with its next screening.

### Ticket booking

`initTickets()` runs `tickets.html`:

1. **Screening**: a film `<select>` and the film's bookable screenings. `?show=` preselects one (if it
   hasn't started and is in the next 14 days, otherwise the next screening is chosen with a notice);
   `?film=` preselects the film's next screening.
2. **Tickets**: steppers for `TICKET_TYPES`. Screenings before 5:00 pm use the `matinee` price. Member
   tickets ask for a member number (`GM-` and five digits).
3. **Seats**: the map from `SEAT_ROWS`. Sold seats come from `soldSeats(show)`, a steady pattern per
   screening (busier on weekend evenings and Q&As, quieter at matinees and relaxed screenings) plus seats
   booked on this device, which show as "Booked by you" (brass with a check mark, `.seat.is-held`). Picking a seat
   adds an adult ticket if needed. **Best available** (`bestSeats()`)
   finds the most central run of seats together, from the middle rows outward. The map is one tab stop:
   arrow keys move between free seats, Home/End jump along the row, Enter or Space chooses. On narrow screens the map scrolls sideways inside `[data-seat-scroller]`, a focusable region that starts centered on the screen.
4. **Snacks**: steppers for `CONCESSIONS` with `addon: true`.
5. **Details**: name, email and optional notes.

The summary stub updates as you go. **Hold my seats** validates, saves the booking and shows a confirmation
with a reference like `GT-K7P2-48`. "Your bookings on this device" lists bookings with **Calendar** and
**Cancel** (canceling frees the seats). The page says no payment is taken online: customers pay at the box
office.

To take real bookings, send the booking to your ticketing system where the comment in the submit handler
says so, and show the confirmation only when it answers OK.

### Membership

`initMembership()` draws the levels from `MEMBERSHIP` into `[data-tiers]`. The switch
(`[data-billing-switch]`, `role="switch"`) flips between monthly and annual prices (`?billing=annual`).
**Join as …** buttons set the level in the join form (`?tier=projectionist` does the same). The savings
slider (`#visits`) compares evening ticket prices with member prices.

### Events, series and private hire

`initEvents()` draws the series cards and the calendar; series chips filter it (`?series=late-show`), and
each card's link jumps to its events. `initHire()` runs the quote: occasion, guests (up to the seat count),
hours (2–6) and add-ons from `HIRE` give a live total and per-guest price. The three marquee lines preview on
a letterboard (`[data-hire-board]`).

### Visit: hours and concessions

`initVisit()` writes `HOURS` into the hours table with today's row highlighted. `boxOfficeState()` drives the
status in the top bar and on `visit.html` ("Box office open until 9:30 pm", "opens today at…", "opens
tomorrow at…"). The concession menu is grouped from `CONCESSIONS` and filtered by diet (`?diet=vg`);
vegan items also count as vegetarian.

### Scroll reveals, menu and back to top

Elements with `.reveal` fade in once (along with everything above them). The menu button has
`aria-expanded`, and Escape closes it. A back-to-top button appears after scrolling. All motion stops with
`prefers-reduced-motion: reduce`.

## Forms

Every form validates in the browser, shows messages under each field and ends in a success state. **The
forms don't send anything until you connect them.**

| Form | Where | Validates | Success |
|------|-------|-----------|---------|
| Booking (`[data-booking]`) | `tickets.html` | Screening not started, at least one ticket, seats equal to tickets, name, email, member number for member tickets | Reference `GT-XXXX-NN`, saved on the device |
| Join (`data-form="join"`) | `membership.html` | Name, email, five-digit ZIP | Member number `GM-NNNNN` and next steps |
| Private hire (`[data-hire]`) | `events.html` | Name, email, guests 1–202, a date at least two weeks ahead | Reference `GH-NNNN` with the estimate |
| Newsletter (`data-form="newsletter"`) | Footer of every page | Email | "You're on the list" |

Rules for the generic forms come from attributes: `required`, `type="email"`, `data-zip` and `data-label`
(the field name in the message). To connect a form to a service such as Formspree, post it before calling
`finishForm()` (in `initForms()` or `initHire()`):

```js
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (res.ok) finishForm(form, '<p>Thanks, we have your request.</p>');
});
```

## Saved data (localStorage)

| Key | Shape | Validation |
|-----|-------|------------|
| `garnet-watchlist` | `["sweetwater-static", "owls-lolo"]` | Only ids that are own keys of `FILMS`, no duplicates |
| `garnet-bookings` | `[{ "ref": "GT-K7P2-48", "show": "2026-10-21-1845", "seats": ["F7", "F8"], "tickets": { "adult": 2 }, "snacks": { "popcorn-large": 1 }, "total": 34, "name": "Sam Rivera", "made": 1792000000000 }]` | `ref` must match `GT-XXXX-NN`, `show` must be a screening in the current program, seats like `F7`, a finite total; at most 12 kept |

Both keys are listed in `STORAGE_KEYS` in `main.js`. Storage goes through one `safeStorage` object; when
localStorage is blocked (a sandboxed iframe, strict privacy settings) it falls back to memory, so the
watchlist and bookings still work for the page view. Bookings for screenings that are no longer in the
program are dropped when read. To reset, run `localStorage.removeItem('garnet-watchlist')` (or
`'garnet-bookings'`) in the browser console, or clear the site's data.

URL parameters are validated the same way:

| Page | Parameter | Values |
|------|-----------|--------|
| any page | `now` | `YYYY-MM-DDTHH:MM` preview time |
| `whats-on.html` | `view`, `day`, `week`, `genre`, `access`, `watch` | `day`/`week`; a date in the next 14 days; `2`; a genre key; comma-separated access tags; `1` |
| `film.html` | `film` | A film id |
| `tickets.html` | `show`, `film` | A screening id like `2026-10-21-1845`; a film id |
| `membership.html` | `billing`, `tier` | `annual`; `usher`, `projectionist`, `marquee-circle` |
| `events.html` | `series` | A series key |
| `visit.html` | `diet` | `v`, `vg`, `gf` |

## SEO and sharing

Each page has its own `<title>`, meta description and Open Graph tags in the `<head>`; `film.html` also
updates the title and description for the chosen film. `og:image` points to `assets/img/og-image.png` with
a relative path; most social sites need an absolute URL, so change it to
`https://your-domain/assets/img/og-image.png` once you know the address. Add a `sitemap.xml` listing the
pages and one `film.html?film=` URL per film. For search results with showtimes, consider `MovieTheater`
and `ScreeningEvent` structured data (JSON-LD).

## Accessibility

- Skip link, landmarks, one `<h1>` per page, the current page marked with `aria-current="page"`.
- Visible focus outlines (garnet on cream, gold on dark sections).
- Filters, views, watchlist stars and seats use `aria-pressed`; the billing switch uses `role="switch"`
  with `aria-checked`; the menu uses `aria-expanded` and `aria-controls`.
- Every seat has a label ("Row F, seat 7", "wheelchair space", "sold"); the seat map is a single tab stop
  with arrow-key movement, and the seat status line is a live region.
- Result counts, the quote total and form messages are announced; errors are linked with
  `aria-describedby` and the first invalid field gets focus.
- Posters have text alternatives where they carry meaning and are hidden where the title sits next to them.
- Text colors meet WCAG AA; brass is used as text on cream only in the darker `brass-deep`.
- Wide tables (week grid, membership comparison) scroll inside their own region.
- Animation (reveals, twinkling bulbs, smooth scrolling) is off with reduced motion.

When editing, keep one `<h1>` per page, give new inputs a `<label>`, and keep `aria-labelledby`,
`aria-controls` and `aria-describedby` pointing at ids that exist.

## Building and deploying

The compiled CSS is included, so the site runs as it is. After changing `src/input.css` or adding new
Tailwind classes to the HTML or the JavaScript, rebuild it (Node.js 24):

```sh
npm install
npm run build     # once
npm run watch     # rebuild on every change
```

Tailwind scans the HTML and JavaScript files, so classes used only in `main.js` strings work as long as
they appear there in full. Upload the folder (without `node_modules/`) to any static host: Netlify Drop,
Cloudflare Pages, GitHub Pages or any web server. All links are relative, so it also works in a subfolder.

## Troubleshooting

- **The showtimes have the wrong dates.** `KEEP_DEMO_CURRENT` is still `true`, so dates move forward each
  week. Set it to `false` once `PROGRAM` and `EVENTS` have your real dates.
- **Nothing is on the program.** With `KEEP_DEMO_CURRENT = false`, every date in `PROGRAM` has passed. Add
  the coming weeks.
- **A film shows "Coming soon" when it is already playing.** Its `opens` date in `FILMS` is after today.
  Remove `opens` (the film is then already playing) or set it to the first screening.
- **A screening is missing.** Check the line in `PROGRAM`: the time must be `HH:MM`, the film id must exist
  in `FILMS`, and screenings are separated by `|`. Look in the browser console for overlap messages.
- **Times are an hour off.** Times are Mountain Time. If your theater is elsewhere, change
  `THEATER.timeZone` (and `timeZoneLabel`) in `data.js`.
- **Saved bookings disappeared.** Bookings for screenings no longer in the program are dropped, and with
  storage blocked they only last for the page view.
- **A new Tailwind class has no effect.** Rebuild the CSS (see above).

## License

MIT. The code and all included artwork are free for personal and commercial use; see `LICENSE.txt`.
Limelight and Libre Franklin are licensed under the SIL Open Font License.
The Garnet Theater, its films, filmmakers, staff, events and bookings are fictional.
