# Gather documentation

## Overview

Gather is a website for a local church, built for **Riverbend Church**, a fictional non-denominational
church in Lawrence, Kansas. It has a home page with this Sunday's times and a countdown to the next
service, a plan-your-visit page, a sermon archive and sermon pages with an audio player, an events
calendar with calendar downloads, a small-group finder and ministries, a giving page, an about page with
the staff team, contact and prayer requests, and a 404 page. It is plain HTML with Tailwind CSS v4 and one
vanilla JavaScript file, with no build step needed to use it. This guide covers version 1.0.7. See it live
at [freeframe.dev/templates/gather](https://freeframe.dev/templates/gather).

## Quick start

1. Unzip the download and open `index.html` in a browser. Every page works from the file system.
2. Or serve the folder, which is closer to how it runs on a host:

   ```sh
   npx serve .
   ```

3. You only need Node.js 24 or newer if you change the CSS classes (see
   [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with river illustration, "This Sunday" card with times and the next-service countdown, three-step "I'm new" path, latest sermon with player, next four events, ministries, scripture and figures band, newsletter sign-up |
| `visit.html` | Plan your visit | What to expect, service times, kids' check-in steps and rooms, accessibility, SVG parking map, FAQ accordion, plan-your-visit form with live summary |
| `sermons.html` | Sermon archive | "Watch live" panel with countdown and the latest message, series cards, search and series/speaker/book filters with URL state, sermon cards |
| `sermon.html` | One sermon (`sermon.html?id=room-at-the-table`) | Series cover, audio player, key verse, notes, discussion questions with copy button, speaker card, the rest of the series, related sermons |
| `events.html` | Events | Category filter, month calendar and list views, selected-day agenda, event dialog with "Add to calendar" (.ics) |
| `groups.html` | Groups and ministries | Small-group finder (day, area, season of life, childcare), ministries for kids, youth, care and music (`#kids`, `#youth`, `#care`, `#music`) |
| `give.html` | Give | Frequency, amount chips and custom amount, fund, cover-the-fee option, live total, "your card details stay safe" note, budget bar, funds, FAQ |
| `about.html` | About | Story timeline, beliefs (`#beliefs`), leadership, staff grid with SVG portraits |
| `contact.html` | Contact and prayer | Office details, urgent pastoral contact, contact form, prayer request form (`#prayer`) |
| `404.html` | Not found | Signpost illustration and links back |

## Project structure

```text
gather/
  index.html … contact.html, 404.html   the pages (header and footer repeated in each)
  assets/css/style.css                  compiled Tailwind CSS (generated, do not edit)
  assets/js/main.js                     all JavaScript: church data, artwork, every page's features
  assets/img/favicon.svg                browser icon (the Riverbend logo)
  assets/img/og-image.svg               social image source (1200×630)
  assets/img/og-image.png               social image used by the pages
  src/input.css                         Tailwind source: brand tokens and component classes
  package.json                          scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

`main.js` is split into numbered sections (listed at the top of the file): 1 church settings and schedule,
2 people, series and sermons, 3 events, 4 groups, giving and visit settings, 5 helpers and dates,
6 artwork, 7 header, menu and countdown, 8 audio player, 9 sermon archive, 10 sermon page, 11 events
calendar, 12 groups finder, 13 plan your visit, 14 giving form, 15 forms, 16 boot. A separate back-to-top
block follows.

## Customizing

### Brand and colors

The design tokens are in the `@theme` block of `src/input.css`. Every utility such as `bg-plum` or
`text-muted` comes from them.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-paper` | `#fbf6ee` | Page background |
| `--color-shell` | `#fffdf9` | Cards and form fields |
| `--color-sand` | `#f4eadb` | Soft panels, filter bars |
| `--color-line` | `#e5d8c5` | Hairlines and card rings |
| `--color-ink` | `#2b1b36` | Text, the footer, dark bands and the audio player |
| `--color-muted` | `#5f5468` | Secondary text |
| `--color-plum` / `--color-plum-dark` | `#5b2a6e` / `#431d52` | Brand color, primary buttons, links |
| `--color-lilac` | `#efe5f5` | Selected states, worship events |
| `--color-apricot` / `-light` / `-dark` | `#f6a96b` / `#fde3cc` / `#9a4716` | Warm accent (backgrounds), tint, accent text |
| `--color-sage` / `-light` / `-dark` | `#c9dcc0` / `#e6efe0` / `#33603b` | Hills, care ministry, serve events, success |
| `--color-river` / `-light` / `-dark` | `#bcd9e8` / `#e3f0f6` / `#1f5577` | River, kids' ministry and events |
| `--color-rose` | `#b3364a` | Errors, "Live now", classes events |

To change the brand color, edit the tokens and rebuild the CSS:

```css
@theme {
  --color-plum: #1f5c7a;
  --color-plum-dark: #164459;
}
```

Use `apricot` only as a background: for text on light backgrounds use `apricot-dark`, which passes
WCAG AA. The SVG artwork (hero, map, avatars, series covers, logo) uses literal hex values; search the
HTML and `main.js` for `#5b2a6e` and `#f6a96b` to recolor it.

Component classes in `src/input.css`: `.btn-primary`, `.btn-warm`, `.btn-outline`, `.btn-light`,
`.btn-sm`, `.card`, `.card-hover`, `.eyebrow`, `.h-display`, `.h-section`, `.tag`, `.chip-dot`, `.link`,
`.field`, `.field-label`, `.field-error`, `.option` and `.pill` (radio and checkbox cards that highlight
when checked), `.check`, `.faq` (the accordion) and `.scrub` (the player's slider).

### Typography

Two Google Fonts are loaded by a `<link>` in each page's `<head>`: **Urbanist** for headings
(`font-display`) and **Nunito Sans** for body text (`font-sans`). To swap them, change the `family=`
parts of the link on every page and the names in `src/input.css`:

```css
--font-sans: "Nunito Sans", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
--font-display: "Urbanist", ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
```

### Content

Page copy is in the HTML files. Everything that is listed, filtered or calculated comes from constants at
the top of `assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `CHURCH` | Name, `timeZone` (IANA name, e.g. `America/Chicago`), `timeZoneLabel`, full address for calendar files, `liveUrl`, `uidDomain` |
| `SERVICES` | The weekly schedule: `day` (0 = Sunday), `start` (`'09:00'`), `minutes`, `name` |
| `KEEP_DEMO_CURRENT`, `DEMO_ANCHOR` | Moves demo dates forward (see [Demo dates](#demo-dates)) |
| `PEOPLE`, `STAFF` | Staff and speakers with role, email, bio and avatar; `STAFF` is the order on the about page |
| `SERIES` | Sermon series: `title`, `subtitle`, `art` (`table`, `sun`, `wheat` or `wave`), `blurb` |
| `BOOKS` | Labels for the book filter |
| `SERMONS` | Every sermon (see below) |
| `EVENT_CATS`, `EVENTS` | Event categories with their color classes, and events |
| `DAYS`, `AREAS`, `STAGES`, `GROUPS` | Small-group filter labels and groups |
| `GIVING` | Amount chips, default amount, min and max, card fee, funds |
| `VISIT` | Number of Sundays offered, maximum party size, kids' rooms by age |

Add a sermon by adding an object to `SERMONS` (order doesn't matter; the archive sorts by date):

```js
{
  id: 'a-new-sermon', title: 'A New Sermon', series: 'open-table', part: 6, speaker: 'dana',
  date: '2026-10-18', book: 'luke', passage: 'Luke 10:38–42', duration: 2100, audio: '',
  summary: 'One or two sentences for cards and the page description.',
  verse: { text: 'Quoted text.', ref: 'Luke 10:41 (KJV)' },
  notes: [['Heading', 'One short paragraph.'], ['Heading', 'Paragraph.']],
  questions: ['First question?', 'Second question?']
}
```

`speaker` is a key of `PEOPLE`, `series` a key of `SERIES`, `book` a key of `BOOKS`, and `duration` is in
seconds. The demo quotes the King James Version, which is in the public domain; check the license of any
other translation before quoting it.

Add an event to `EVENTS`. Times are 24-hour, in the church's time zone; add `weekly` to repeat it every
week until that date:

```js
{ id: 'choir-night', title: 'Choir Night', cat: 'worship', date: '2026-11-05', weekly: '2026-12-17',
  start: '19:00', end: '20:30', place: 'Main auditorium', summary: 'Open rehearsal for anyone who sings.' }
```

Add a group to `GROUPS`; `day`, `area` and `stage` must be keys of `DAYS`, `AREAS` and `STAGES`, `spots: 0`
shows "Full: join the waitlist":

```js
{ id: 'lunch-break', name: 'Lunch Break', day: 'wed', time: '12:15', area: 'downtown', stage: 'everyone',
  host: 'Ana Ruiz', where: 'Riverbend, Room 210', spots: 6, childcare: false, blurb: 'A 45-minute study over lunch.' }
```

### Demo dates

The demo is written for the week of `DEMO_ANCHOR` (`'2026-10-11'`). While `KEEP_DEMO_CURRENT` is `true`,
every sermon and event date moves forward by whole weeks so that the latest sermon is always last Sunday and
events are always upcoming. Weekdays never change. **Set `KEEP_DEMO_CURRENT = false` once you enter real
dates**, or your dates will be shifted too.

### Images and artwork

There are no photos. All artwork is SVG:

| Artwork | Where |
|---------|-------|
| Hero landscape (church, river, hills) | Inline in `index.html`, 600×540 |
| Welcome tent, small-group table, 404 signpost | Inline in `visit.html`, `groups.html`, `404.html` |
| Parking map | Inline in `visit.html`, 640×420, with a `<title>` and `<desc>` |
| Staff portraits | `avatar()` in `main.js`, drawn from each person's `avatar` settings |
| Series covers | `seriesArt()` in `main.js`, 320×200, varied by the sermon's `part` |
| Logo | Inline in each page's header and footer, and `assets/img/favicon.svg` |

A portrait's `avatar` object takes `skin`, `hair`, `style` (`short`, `long`, `bun`, `curly`, `coily`,
`waves` or `bald`), `bg`, `shirt`, and optional `glasses` and `beard`. Elements with
`data-avatar="dana"` are filled with that portrait (add `data-decorative` to hide it from screen readers).

To use photos instead, replace the generated markup with `<img>` tags: portraits are square (1:1), series
covers 16:10, and the hero frame about 10:9. Give every image meaningful `alt` text.

The social image is `assets/img/og-image.png` (1200×630), rendered from `og-image.svg`. Edit the SVG, then
export it to PNG with any vector editor or browser screenshot at 1200×630.

### Navigation, header and footer

The header (with the service status bar) and footer are repeated in every HTML file. To add or remove a
page, edit the `<nav aria-label="Main">` list, the `<nav aria-label="Mobile">` list and the footer links on
every page. Mark the current page with `aria-current="page"` on its link; the styles highlight it
automatically. The "Give" button in the header also uses `aria-current` on `give.html`.

## Features

### Service status and countdown

The bar above the header (`[data-service-status]`) shows "Next gathering: Sunday at 9:00 am", or "Live
now" with a "Watch" link while a service is running. Elements with `data-countdown` (on the home page and
the sermons page) show days, hours, minutes and seconds to the next service, and switch to a "Live now"
card with a "Watch live" button linking to `CHURCH.liveUrl`. `[data-this-sunday]` elements show the date of
the next Sunday with a service still to come.

Everything is computed by `serviceState()` from `SERVICES` in `CHURCH.timeZone`, so a visitor in another
time zone sees the right countdown for your church. Add a service by adding to `SERVICES`:

```js
{ day: 3, start: '18:30', minutes: 60, name: 'Midweek Worship' }
```

To preview the live state at any time, add `?live=1` to a page's URL, for example `index.html?live=1`.
The ticking numbers are hidden from screen readers; a visually hidden sentence ("Starts in 5 days, 18
hours and 53 minutes.") gives the same information without announcing every second.

### Audio player

The player is built by `playerMarkup()` and `initPlayer()` (section 8). It appears on `sermon.html`, on the
home page (latest sermon) and in the "Watch live" panel on `sermons.html`.

- **With a real file:** set the sermon's `audio` to a URL (`'audio/room-at-the-table.mp3'` or a full URL
  from your podcast host). The player then drives a real `<audio>` element: its duration comes from the file,
  and speed, seeking and progress use the media element.
- **Without a file** (`audio: ''`, the demo): playback is simulated over the sermon's `duration` with a
  timer, so every control works and a note under the player says so. Remove the note by giving each sermon
  an `audio` URL.

Controls: play/pause, a slider for scrubbing (5-second steps), back and forward 15 seconds, and a speed
button cycling through `SPEEDS` (1×, 1.25×, 1.5×, 1.75×, 2×, 0.75×). Only one player plays at a time.

Keyboard, while focus is inside the player: `Space` (when not on a button) or `K`
play/pause, `J` and `L` back and forward 15 seconds, arrow keys on the slider move 5
seconds, `Home`/`End` jump to the start or end. The slider has an `aria-valuetext` such
as "12 minutes 5 seconds of 38 minutes 42 seconds", buttons have labels that change between "Play" and
"Pause", and speed changes are announced through a polite live region.

The listening position is saved (see [Saved data](#saved-data-localstorage)); returning to a sermon shows
"Resuming at 12:04" and cards in the archive show "Resume at 12:04".

### Sermon archive

`initSermons()` fills the series, speaker and book selects from the data, and filters on every change.
Search matches every word against the title, passage, summary, series and speaker. The filters are kept in
the URL, so links can be shared: `sermons.html?series=open-table&speaker=dana&book=luke&q=table`. Series
cards toggle the series filter. The result count is a live region; with no results an empty state offers to
clear the filters.

### Sermon page

`sermon.html?id=<id>` shows one sermon; an unknown or missing id shows the latest sermon with a notice. The
page title and meta description are updated from the sermon. "Copy questions" copies the title, passage and
numbered questions to the clipboard (it needs `https` or `localhost`; elsewhere it says copying failed).
Related sermons are the rest of the series, then other sermons by the same speaker.

### Events calendar

`initEvents()` (section 11) shows every occurrence of `EVENTS` (weekly events are expanded). The month view
is a table with one button per day; choosing a day shows its events in the "Selected day" panel, with the
next three events after it. On wide screens each day lists up to two events and a "+n more" button. The
list view shows weekly events once in an "Every week" box, then upcoming events by month.

Category pills filter both views. State is kept in the URL: `events.html?view=list&cat=kids,serve&month=2026-11`.
Opening an event adds `&event=<id>-<date>`, so a link opens straight to that event.

The detail is a native `<dialog>` (focus is trapped and `Esc` closes it; focus returns to the
button that opened it). "Add to calendar" downloads an `.ics` file built by `buildIcs()`, with start and end
times converted from the church's time zone to UTC, so it imports correctly into Google Calendar, Apple
Calendar and Outlook wherever the visitor is.

### Groups finder

`initGroups()` (section 12) renders filter pills for day, area and season of life from `DAYS`, `AREAS` and
`STAGES`, each with a live count; options that would give no results are disabled. "Childcare provided" is
a checkbox. State is in the URL: `groups.html?day=tue,thu&area=west&stage=families&childcare=1`. "Ask to
join" links to `contact.html?topic=groups&group=<id>`, which pre-fills the contact form.

### Plan your visit

`initVisit()` (section 13) offers the next `VISIT.sundays` Sundays (computed in the church's time zone;
today is skipped once the last Sunday service has started) and one radio card per Sunday service. Adults and
children use steppers; each child gets an age select, and the summary shows which room they go to from
`VISIT.rooms`. Children in the last room (youth) count as an extra seat.

### Giving

`initGive()` (section 14) builds the amount chips from `GIVING.amounts` and the fund select from
`GIVING.funds`. Typing a custom amount clears the chips. "Cover the card fee" adds what is needed so that,
after the fee in `GIVING.fee` (2.2% + $0.30 by default), the church receives the whole gift; the summary
shows the total and what the church receives either way. `give.html?fund=pantry` pre-selects a fund.

**No payment is taken.** See [Forms](#forms) for connecting a payment provider.

### Scroll reveal and back to top

Elements with `.reveal` fade in as they scroll into view; everything above the current element is revealed
too, so jumping to an anchor never leaves gaps. With reduced motion, nothing is hidden or animated. The
back-to-top button is created by the last block of `main.js`; delete that block and the `.back-to-top`
styles in `src/input.css` to remove it.

## Forms

All forms are validated by `setupValidation()` in section 15 of `main.js`: errors appear on blur and
submit, the first invalid field is focused, each error is linked with `aria-describedby`, and a status line
says "Please fix the highlighted fields."

| Attribute | Rule |
|-----------|------|
| `required` | Must not be empty (checkboxes must be checked, selects must have a value) |
| `type="email"`, `type="tel"` | Must look like an email address / phone number |
| `minlength` | Minimum length |
| `data-label` | Name used in the error message |
| `data-novalidate` | Field is skipped (used by filters) |

| Form | Where | Behavior |
|------|-------|-----------|
| Newsletter (`data-form="newsletter"`) | `index.html` | Replaced with a thank-you message that points to a confirmation email |
| Plan your visit (`#visit-form`) | `visit.html#plan` | Validates contact details and each child's age; confirms the Sunday, time and seats, with a reference |
| Giving (`#give-form`) | `give.html` | Validates the amount (min and max from `GIVING`), name and email; confirms the gift, fund and frequency, with a reference |
| Contact (`#contact-form`) | `contact.html` | Pre-filled from `?topic=` and `?group=`; thank-you message with a reference |
| Prayer (`#prayer-form`) | `contact.html#prayer` | Request required; email becomes required when "I'd like a pastor to get in touch" is checked; the message reflects "Keep this private" |

**The forms don't send anything** until you connect them, although their success messages read as if they
had. The visit, giving and contact messages show a short reference (`RC-` and four characters) made in the
browser by `makeRef()` in section 15; show your form service's or payment provider's own reference instead if
it returns one. Check that the promises in the messages match how your church works: a reminder email before
Sunday, an emailed receipt for every gift, a reply within two business days (as the contact page says), and a
confirmation email for newsletter sign-ups. To collect submissions, post the form in its callback, for example
to Formspree:

```js
setupValidation(contact, () => {
  fetch('https://formspree.io/f/your-id', {
    method: 'POST', body: new FormData(contact), headers: { Accept: 'application/json' }
  }).then((res) => successSwap(contact, res.ok ? '<p>Thanks, we got your message.</p>' : '<p>Something went wrong. Please email us.</p>'));
});
```

Every field has a `name`, so `FormData` carries all the values; keep a `name` on any field you add.
Prayer requests can be sensitive: send them to a service and inbox only your pastoral team can read, and
honor the `private` field.

### Connecting a payment provider

The giving form never collects card details. To take real gifts, replace the `successSwap(...)` call in
the `setupValidation(form, ...)` callback inside `initGive()` with a request to your server, which creates a
checkout session with your provider (Stripe Checkout, PayPal, or a church platform such as Tithe.ly or
Planning Center Giving) and returns its URL:

```js
fetch('/api/create-gift', { method: 'POST', body: new FormData(form) })
  .then((res) => res.json())
  .then((data) => { window.location.href = data.url; });
```

Recurring gifts (`frequency` is `weekly` or `monthly`) map to subscriptions in most providers. Many church
platforms also offer an embeddable giving form you can use instead of this one.

## Saved data (localStorage)

| Key | Shape | Used for |
|-----|-------|----------|
| `riverbend-sermon-progress` | `{ "room-at-the-table": 724 }` (seconds) | Resume position for each sermon |

`readProgress()` keeps only ids that exist in `SERMONS` and positions between 5 seconds and 5 seconds before
the end; anything else is dropped. A position is removed when a sermon finishes. If storage is blocked, the
player works without saving. To reset, run `localStorage.removeItem('riverbend-sermon-progress')` in the
browser console, or change `PROGRESS_KEY` to stop using it.

## SEO and sharing

Each page has its own `<title>`, meta description and Open Graph tags in its `<head>`; `sermon.html` also
updates its title and description from the sermon shown. Social sites need an absolute image URL, so once you
know your domain change every `og:image` to, for example:

```html
<meta property="og:image" content="https://www.yourchurch.org/assets/img/og-image.png">
```

Add a `sitemap.xml` listing the pages and a `robots.txt` pointing to it. For search, consider
`Church` structured data (a `schema.org` type) with your address and service times in a
`<script type="application/ld+json">` block on the home page.

## Accessibility

- Skip link, landmarks, one `<h1>` per page and a logical heading order.
- `aria-current="page"` on the current navigation item; the mobile menu uses `aria-expanded`, closes with
  `Esc` and when the window grows to desktop width.
- Visible focus outlines on every control; radio and checkbox cards show focus on the card.
- The audio player is fully keyboard operable, with labeled buttons and a native range slider with
  spoken time.
- The calendar is a table with a caption and column headers; day buttons have full-date labels with the
  number of events; the event detail is a modal `<dialog>`.
- Filter results and counts are announced with `role="status"`; form errors are linked to their fields.
- Illustrations have `<title>` text (the map also has a `<desc>`); decorative SVG is hidden from screen
  readers.
- Color contrast meets WCAG AA; `prefers-reduced-motion` turns off reveals, the live pulse and the river
  shimmer.

When editing, keep one `<h1>` per page, give every new input a `<label>`, and don't use `apricot` for text.

## Building and deploying

`assets/css/style.css` is compiled from `src/input.css` and the classes in the HTML and `main.js`. Rebuild
it whenever you use a class that isn't already in the template:

```sh
npm install
npm run build     # once, minified
npm run watch     # rebuild on every change
```

To publish, upload the whole folder to any static host: Netlify Drop, GitHub Pages, Cloudflare Pages, Vercel
or your own server. No server code is needed (except for real payments, see above).

## Troubleshooting

- **The countdown is an hour off.** Check `CHURCH.timeZone` is your church's IANA time zone (for example
  `America/New_York`), not a city name or an offset.
- **My sermons or events have the wrong dates.** `KEEP_DEMO_CURRENT` is still `true`, so dates are moved
  forward. Set it to `false`.
- **The player says playback is simulated.** The sermon's `audio` is empty. Add a URL to an audio file; if it
  is on another domain, that server must allow it to be played (most podcast hosts do).
- **A new sermon or group doesn't show under a filter.** Its `series`, `speaker`, `book`, `day`, `area` or
  `stage` must be a key of the matching constant.
- **"Copy questions" fails.** The clipboard needs `https` or `localhost`; it doesn't work from a `file://`
  page.
- **A new class has no effect.** Rebuild the CSS (`npm run build`). Classes only built in JavaScript must
  appear literally in `main.js` for Tailwind to find them.
- **Fonts look different offline.** The fonts come from Google Fonts; without a connection the system
  fallback is used.

## License

MIT: free for personal and commercial use. See `LICENSE.txt` in the download. The SVG artwork, logo,
portraits and social image are part of the template and covered by the same license. Scripture quotations
in the demo are from the King James Version, which is in the public domain.
