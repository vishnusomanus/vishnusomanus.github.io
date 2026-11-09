# Rillmark documentation

## Overview

Rillmark is a multi-page portfolio website for an independent motion designer and director. The demo is
built for Rillmark, the fictional studio of Marika Drever on Arch Street in Hartford, Connecticut, who makes
title sequences, brand motion, explainer animation and music videos. It is plain HTML5, Tailwind CSS v4
and vanilla JavaScript with no dependencies: a showreel drawn live in SVG, fifteen projects with their own
case studies and artwork, a fee estimator in dollars, a journal, an about page and a project inquiry. This
guide covers version 1.0.3 (see `template.json` and [CHANGELOG.md](CHANGELOG.md)). The template page,
with a link to the live demo, is at https://freeframe.dev/templates/rillmark.

American spelling, US dollars and Eastern time (America/New_York) are used throughout.

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Everything works from the file system: links are relative and there
   is no build step.
3. To preview it as it will be served, run any static server in the folder, for example
   `npx serve .` or `python3 -m http.server`, and open the address it prints.

You only need Node.js 24 if you change `src/input.css` or add Tailwind classes that aren't already used
(see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Kinetic headline, studio facts with the next start date, the showreel player, four disciplines with live counts, three featured projects, a client quote and client list, the latest three journal notes, a six-month availability strip |
| `work.html` | The work index | Discipline chips with counts, year filter, search, "shortlist only" view, live result count, cards with hover previews and Save buttons, the shortlist panel |
| `project.html` | Case study (`?project=`) | Title, client and discipline, a styleframe scrubber with timecode, facts, brief, four styleframes, process, results, credits, quote, previous and next projects |
| `services.html` | Services and fees (`?service=`) | Four services with "from" prices, the fee estimator, how a project runs, questions about fees |
| `journal.html` | Journal (`?topic=`, `#<note id>`) | Topic chips with counts, dated notes newest first, each opening in place |
| `about.html` | About | Portrait, biography, three working principles, collaborators, the studio and its view, gear, recognition |
| `contact.html` | Project inquiry (`?service=`) | Validated inquiry with budget and finish date, the attached estimate and shortlisted references, studio clock, hours, availability, success state with reference and next steps |
| `404.html` | Not found | A film strip with a missing frame and links back |

## Project structure

```text
rillmark/
  index.html, work.html, project.html, services.html,
  journal.html, about.html, contact.html, 404.html
  assets/
    css/style.css        compiled Tailwind CSS (generated, do not edit by hand)
    js/data.js           the content: studio, projects, showreel, prices, journal, collaborators
    js/main.js           every script: dates, artwork, showreel, filters, case study, estimator, forms
    img/favicon.svg      browser tab icon
    img/marika.svg       illustrated portrait of the director (400 x 480)
    img/studio.svg       illustration of the studio window over the Connecticut River (640 x 480)
    img/og-image.svg     social sharing image source (1200 x 630)
    img/og-image.png     social sharing image used by og:image
  src/input.css          Tailwind source: design tokens and components
  package.json           scripts to rebuild the CSS
  README.md              short introduction
  DOCS.md                this guide
  CHANGELOG.md           version history
  LICENSE.txt            license (added to the download)
```

`data.js` must load before `main.js`; every page includes both at the end of `<body>`.

## Customizing

### Brand and colors

Design tokens live in the `@theme` block at the top of `src/input.css`.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-paper` | `#efecf4` | Page background, a cool lilac gray |
| `--color-paper-2` | `#e4dfec` | Alternate bands and sunken panels |
| `--color-card` | `#f9f8fc` | Cards, inputs, text on dark sections |
| `--color-line` | `#cdc5d9` | Hairlines on paper |
| `--color-ink` | `#1c1426` | Text, borders, solid buttons |
| `--color-muted` | `#574d66` | Secondary text (AA on every paper tone) |
| `--color-plum`, `--color-plum-2`, `--color-plum-line` | `#24152f`, `#342146`, `#4a3560` | The reel, the footer and other dark sections |
| `--color-haze` | `#cbbfdb` | Secondary text on plum |
| `--color-violet`, `--color-violet-deep` | `#5a2fd0`, `#4320a8` | Links, accents, button shadows; the availability band |
| `--color-mint` | `#8ff0c8` | Highlights on plum: timecodes, the play button, focus rings |
| `--color-coral` | `#ff6f5e` | The record dot and small marks (not for text on paper) |

To change the accent from violet to, say, a deep teal:

```css
@theme {
  --color-violet: #0f6b6b;
  --color-violet-deep: #0a4f4f;
}
```

Useful component classes in `@layer components`: `.wrap` (page width), `.slate` (the small monospace
labels), `.h-display`, `.h-page`, `.h-section`, `.h-card` and `.lead`; `.btn` with `.btn-solid`,
`.btn-line`, `.btn-mint`, `.btn-ghost` and `.btn-sm`; `.nav-link` and `.mnav-link`; `.frame` (a 16:9
box for artwork); `.chip`; `.option` (the estimator's radio cards); `.label`, `.hint`, `.input`, `.check`,
`.field-error`; `.scrub` (the range sliders); `.toast`. Sections with a dark background carry `.on-dark`,
which switches link and focus colors.

### Typography

Three Google Fonts are loaded with one `<link>` in the `<head>` of every page:

- **Anybody** for headlines, titles and the wordmark (`font-display`, token `--font-display`). It is a
  variable font with a width axis from 50% to 150%, set with `font-stretch`: `.h-display` is 62%,
  `.h-page` 68%, `.h-section` 80%, and utilities such as `font-stretch-72%` set it per element.
- **Gelasio** for body text and quotes (`font-serif`, token `--font-serif`).
- **Red Hat Mono** for slates, timecodes, buttons and labels (`font-mono`, token `--font-mono`).

To swap one, change the `https://fonts.googleapis.com/css2?...` link in each page and the matching token
in `@theme`, then rebuild the CSS. If the new display face has no width axis, the `font-stretch` values
simply have no effect. `og-image.svg`, `marika.svg` and the collaborator marks in `main.js` name the fonts
in their `font-family` attributes too.

### Content

Static text lives in the HTML files. Everything that is listed, filtered or computed comes from
`assets/js/data.js`:

| Constant | What it holds |
|----------|---------------|
| `STUDIO` | Name, director, email, phone, address, `hours` by weekday, `leadWeeks` (6), `replyWorkingDays` (2), `winterClosure` (`['12-24', '01-04']`) |
| `DISCIPLINES` | `titles`, `brand`, `explainer`, `music`: name, short name and blurb |
| `PROJECTS` | Every project (15): card, case study, styleframes, process, results, credits, quote |
| `REEL` | The showreel: `scenes` (project ids in order), `sceneSeconds` (4), `fps` (24) |
| `SERVICES`, `STYLES`, `ROUNDS`, `RUSH`, `ADD_ONS`, `DEPOSIT` | The estimator's prices (see [The fee estimator](#the-fee-estimator)) |
| `TOPICS`, `JOURNAL` | Journal topics and the notes, newest first |
| `PEOPLE` | Collaborators on the about page: name, role, base, a mark `shape` and `colour`, a note |

And at the top of `assets/js/main.js`:

| Constant | Value | What it does |
|----------|-------|--------------|
| `TIMEZONE`, `LOCALE`, `CURRENCY` | `'America/New_York'`, `'en-US'`, `'USD'` | Every date, time and price |
| `STORAGE_KEYS` | `{ shortlist: 'rillmark-shortlist', estimate: 'rillmark-estimate' }` | localStorage keys |
| `DEFAULT_PROJECT` | `'season-of-tides'` | The case study `project.html` shows without (or with an unknown) `?project=` |
| `KEEP_DEMO_CURRENT`, `DEMO_ANCHOR` | `true`, `'2026-10-24'` | Rolls the journal dates forward (see [Demo dates](#demo-dates)) |

A project looks like this (shortened):

```js
{
  id: 'season-of-tides', title: 'Season of Tides', client: 'Bracken Hall', discipline: 'brand', year: 2026, runtime: 45,
  role: 'Direction, design and animation', motif: 'tides', palette: ['#14233f', '#f4ead3', '#d9a441', '#7fb7c9'],
  summary: 'A motion identity for a concert hall’s new season, built from the swell of a held note.',
  tags: ['orchestra', 'season launch', 'identity', 'toolkit'],
  brief: ['First paragraph.', 'Second paragraph.'],
  frames: [{ t: 0.08, caption: 'Opening: a single line, the A the orchestra tunes to.' } /* four in all */],
  process: [{ title: 'Listening first', text: 'We recorded the orchestra tuning…' } /* three */],
  results: [{ figure: '40', label: 'concerts promoted from one toolkit' } /* three */],
  credits: [['Client', 'Bracken Hall'], ['Direction and animation', 'Marika Drever']],
  quote: { text: 'It moves like us…', name: 'Stuart Kinney', role: 'Program director, Bracken Hall' }
}
```

- `id` is used in links (`project.html?project=season-of-tides`) and in the saved shortlist: keep it
  lowercase with hyphens and don't change it once people may have saved it.
- `discipline` must be a key of `DISCIPLINES`. `runtime` is in seconds.
- `motif` picks the artwork (see [Images and artwork](#images-and-artwork)); `palette` is
  `[background, foreground, accent, second accent]`.
- `frames[].t` is the moment in the film (0 to 1) each styleframe is drawn at; its timecode is worked out
  from `runtime`.
- `tags` are only used by the search. `quote` can be `null`.
- The order of `PROJECTS` is the order of the work index, the case study numbers and previous/next.

To add a project, copy an entry in `PROJECTS`, give it a new `id` and pick a `motif` and `palette`. The
work grid, the counts, the year filter, search and its case study pick it up. The home page's three
featured projects and the discipline cards are written in `index.html` (with `data-art="<id>"` for their
artwork), so edit those by hand.

A journal note:

```js
{
  id: 'give-motion-a-verb', date: '2026-10-20', topic: 'process', minutes: 6, title: 'Give motion a verb',
  excerpt: 'A useful movement system starts with language more specific than “energetic” or “premium”.',
  body: ['Paragraph one.', 'Paragraph two.']
}
```

`topic` must be a key of `TOPICS`. Notes are sorted by date, newest first, so their order in the array
doesn't matter. Link to one with `journal.html#<id>`: it opens and scrolls into view.

### Demo dates

A demo can be online for years, so nothing dated may go stale. The rules:

- **Journal.** While `KEEP_DEMO_CURRENT` is `true`, every note moves forward by the number of whole weeks
  since `DEMO_ANCHOR` (`'2026-10-24'`). Weekdays never change and the newest note is always less than two
  weeks old. On the anchor week the notes show exactly the dates written in `data.js`. Set
  `KEEP_DEMO_CURRENT = false` when you write real notes: they then keep their dates.
- **Availability.** The earliest start is the first Monday at least `STUDIO.leadWeeks` (6) weeks from
  today that is a business day. The strip shows the next six months: months before that start are
  "Booked", its month has "One slot left", later months are "Open". The header's "Booking from" month and
  every `[data-next-start]` use the same date.
- **Replies.** The inquiry's reply date is `STUDIO.replyWorkingDays` (2) business days after today.
- **Business days** skip weekends, US federal holidays (worked out for any year by
  `scottishBankHolidays(year)`, which keeps its original name: New Year's Day, Martin Luther King Jr. Day,
  Washington's Birthday, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day,
  Thanksgiving and Christmas, with a Saturday observed the Friday before and a Sunday the Monday after) and
  the winter closure in `STUDIO.winterClosure`.
- **Copyright year** is filled in by the browser (`[data-year]`).
- Projects keep their real years: they are past work.

For example, on Saturday, October 24, 2026 the site shows "Booking from December", a next start of Monday,
December 7, the strip October and November booked, December with one slot left and January to March open,
and an inquiry reply by Tuesday, October 27.

To check another date, add `?now=2027-03-01` or `?now=2027-03-01T16:30` (Eastern time) to any page's address.

### Images and artwork

Every piece of project artwork is SVG drawn in the browser by `ART` in `main.js` (section 6), one function
per `motif`, at a moment `t` from 0 to 1:

| Motif | Project | Drawing |
|-------|---------|---------|
| `tides` | Season of Tides | Swelling waves and a rising sun |
| `iris` | Morrowfield Festival Titles | A nine-blade camera iris opening |
| `windows` | The Lowlight Hours | Apartment house windows lighting one by one |
| `lanterns` | Paper Lanterns | Lanterns rising over roofs |
| `pipes` | How the Heat Gets Home | A drop of heat traveling along a pipe to three houses |
| `books` | Borrow Anything | A spine sliding out of a shelf, then objects appearing |
| `rain` | Weather-Made | Sideways rain and a turning mark |
| `grid` | Ninefold Onboarding | A three-by-three grid of filling jars that swap places |
| `glitch` | Cold Open | Jumping lyric bars and tracking lines |
| `seastack` | Seastack | A day passing behind a lighthouse rock |
| `loom` | Threads of Millhaven | Weft crossing the warp on a loom |
| `dots` | Tactile Futures | A raised-dot grid rising under a fingertip |
| `aurora` | Talcott Lights | Aurora ribbons over hills |
| `satchel` | A Book in Every Bag | A book dropping into a bag, stories flying out |
| `tower` | Hollowtide | A tide rising round a lighthouse town |

`frameSVG(project, t)` returns the 320 x 180 SVG. Any element with `data-art="<project id>"` (and an
optional `data-art-t="0.5"`) is filled with that project's frame when the page loads; inside a link with
`data-hover-preview`, the frame plays on hover and focus.

To use real stills instead, replace the `.frame` contents with an `<img>` at 16:9 (for example 1600 x
900) and remove its `data-art` attribute; for the work grid, change `workCard()` in `main.js`. Keep
`.frame` on the wrapper so the aspect ratio holds.

Other images: `assets/img/marika.svg` (400 x 480 portrait), `assets/img/studio.svg` (640 x 480), the
collaborator marks drawn by `personMark()` from each person's `shape` (`wave`, `cube`, `line`, `bars`,
`grid`) and `colour`, and the 404 film strip inline in `404.html`.

The social image is `assets/img/og-image.png` (1200 x 630), generated from `og-image.svg`. After editing
the SVG, export a PNG at the same size with any SVG editor and replace the file. The favicon is
`assets/img/favicon.svg`.

### Navigation, header and footer

The header (the plum strip with the booking month and clock, the logo, the main menu, the shortlist link
and the mobile menu) and the footer are repeated in every HTML file. To add a page:

1. Copy an existing page, change its `<title>`, meta description and Open Graph tags, and keep one `<h1>`.
2. Add a `<li><a href="new.html" class="nav-link">New</a></li>` to the `Main` nav, and the same with
   `class="mnav-link"` to the `Mobile` nav, in every page.
3. On the new page, put `aria-current="page"` on its own links; the current page gets the coral dot.

## Features

### The showreel

`initReel()` in `main.js` plays the projects in `REEL.scenes`, `REEL.sceneSeconds` (4) each, redrawing
the frame at `REEL.fps` (24) with a running timecode (`00:00:SS:FF`), a progress bar per scene and a scene
list beside the player. Controls: Play/Pause, previous and next scene, and the scene list (each is a
button). Arrow keys move between scenes while focus is on the controls.

- It starts by itself only when the visitor hasn't asked for reduced motion and the player is on screen.
  It pauses when scrolled out of view or when the tab is hidden, and resumes when it comes back.
- With reduced motion it waits for Play; scenes are then shown as stills and change every four seconds.
- The title, client and timecode overlay is hidden from screen readers; scene changes the visitor makes
  are announced in a polite live region, and the "See the … case study" link follows the scene.

To change the reel, edit `REEL.scenes` (any project ids). The "six scenes · 0:24" label above the player
is written in `index.html`.

### Work filters and search

`initWork()` builds the grid from `PROJECTS`. Discipline chips (with counts that follow the other
filters), a year select built from the projects' years, a search box (matching title, client, summary,
discipline, year and `tags`, every word must match) and "Shortlist only" combine. The count above the grid
("Showing 4 of 15 projects") is a polite live region. Filters are written to the address so a view can be
shared: `work.html?discipline=titles`, `?year=2024`, `?q=festival`, `?shortlist=1`. Values from the URL are
checked against `DISCIPLINES` and the projects' years with own-key checks; unknown values are ignored.

In the demo: all 15; titles 4, brand 4, explainer 4, music 3; 2024 has 4 projects.

### The shortlist

Every card and case study has a Save button (`[data-save="<id>"]`, `aria-pressed`). Saved projects appear
in the work page's shortlist panel (with remove buttons and "Clear the shortlist"), in the header count
(`[data-shortlist-count]`) and on the inquiry form as references the visitor can uncheck. Toasts confirm
each change. See [Saved data](#saved-data-localstorage).

### Case studies

`initCaseStudy()` reads `?project=<id>` and fills every `[data-cs-…]` element from that project. An
unknown id shows `DEFAULT_PROJECT` with a short note. The page title and meta description are updated.

The scrubber (`#cs-scrub`, a range from 0 to 1000) redraws the hero frame at that moment and shows its
timecode (`MM:SS:FF` at 24 fps); it works with the arrow keys and announces the time as its value text.
The four styleframes, process steps, results, credits, quote and previous/next links are generated from
the project's data. Without JavaScript the page shows the default project's title and summary.

### The fee estimator

`initEstimator()` on `services.html`. The estimate is:

1. **Direction, boards and styleframes:** `SERVICES[service].design`.
2. **Animation:** seconds x `perSecond` x the style's `factor`, rounded to $10.
3. **Extra rounds:** each round over `ROUNDS.included` (2) costs `ROUNDS.extraFee` ($600), up to
   `ROUNDS.max` (4).
4. **Extras:** each `ADD_ONS` item costs `base + perSecond x seconds`.
5. **Rush:** `RUSH.uplift` (30%) of lines 1 and 2, rounded to $10.

Then a deposit of `DEPOSIT` (40%) of the total, which is before sales tax, and a schedule of
`SERVICES[service].weeks` + one week per started minute + one week per extra round (times
`RUSH.weeksFactor`, 0.65, rounded up, for a rush). The schedule starts on the earliest start date; if it
runs over the winter closure, two weeks are added and a note says so.

| Service (`SERVICES`) | Design | Per second | Default length | Range | Base weeks |
|----------------------|--------|------------|----------------|-------|------------|
| `titles` | $3,000 | $120 | 60 s | 15 s – 3 min | 5 |
| `brand` | $4,000 | $90 | 30 s | 15 s – 2 min | 6 |
| `explainer` | $2,400 | $75 | 90 s | 30 s – 3 min | 5 |
| `music` | $2,500 | $40 | 3 min | 2 – 5 min | 6 |

Styles (`STYLES`): `graphic` x1, `mixed` x1.25, `cel` x1.45, `cgi` x1.6. Extras (`ADD_ONS`): `sound` $600 +
$6/s, `cutdowns` $1,000, `captions` $150.

Worked example, the default (a 60-second 2D graphic title sequence, two rounds, no extras): $3,000 + $7,200
= **$10,200** before sales tax, deposit $4,080, 6 weeks. On October 24, 2026 that starts Monday, December 7
and, with the winter closure, delivers around Friday, January 29, 2027. The same sum gives the "from" prices
on the service list (`[data-from-price]`): $10,200, $6,700, $9,150 and $9,700.

The estimate doesn't add sales tax; a line under the total says any that applies is extra. Whether tax
applies depends on your state and what you deliver, so check with your accountant before publishing prices.

`services.html?service=music` preselects a service (checked against `SERVICES`). "Send this estimate
with an inquiry" saves the estimate and opens `contact.html`, where it is summarized, fills the service
and budget fields and is sent as the hidden `estimate` field. The labels on the radio cards and the
rounds select repeat the prices in HTML: update them if you change `data.js`.

### The journal

`initJournal()` lists `JOURNAL` newest first with dates in US format, "4 days ago" style ages and a topic
and reading time. Topic chips show counts (`journal.html?topic=craft`); "Read the note" buttons open each
note in place (`aria-expanded`, `aria-controls`). `journal.html#<note id>` opens that note. The home page
shows the latest three.

### Studio clock and availability

The header and contact page show the time in Hartford (`[data-local-clock]`, "2:32 PM EST" or "EDT"), updated
every 15 seconds. `[data-open-state]` on the contact page says whether the studio is open, from
`STUDIO.hours`, federal holidays and the winter closure. Availability is described in
[Demo dates](#demo-dates).

### Motion and reveals

Headlines with `.kinetic` stretch from condensed to their set width as the page loads; titles with
`.stretch-hover` widen on hover; sections with `.reveal` fade up as they scroll into view, and everything
above a revealed element is revealed too. All of it, the hover previews and the showreel autoplay are off
when the visitor prefers reduced motion (the CSS lives in `@media (prefers-reduced-motion:
no-preference)` in `src/input.css`).

## Forms

The project inquiry (`[data-enquiry-form]` on `contact.html`) checks, in the browser:

- name: required; email: required and shaped like an address;
- what you need and budget: a choice is required;
- finish date: required, after today and within two years. A hint below says how many weeks that leaves,
  and suggests a rush schedule under `RUSH.threshold` (4) weeks;
- the brief: at least 40 characters, with a live character count.

Errors appear under each field (`aria-invalid` and `aria-describedby`), the first invalid field is
focused, and fields re-check as they are corrected. On success the form is replaced by "Inquiry received"
with a reference like `RM-7K2Q`, the reply date, how many saved projects went with it and next steps.
`?service=titles` preselects the service.

The demo form doesn't send anything until you connect it. To use a form service such as Formspree, give
the form an endpoint and post it in the `submit` handler in `initContact()` (section 15 of `main.js`),
showing the success state only when the service answers OK:

```js
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validate(form)) return;
  fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    .then(function (res) {
      if (res.ok) showDone();
      else toast('Sorry, that didn’t go through. Please email studio@rillmark.example.');
    })
    .catch(function () { toast('Sorry, that didn’t go through. Please email studio@rillmark.example.'); });
});
```

The form posts `name`, `email`, `organisation`, `service`, `budget`, `deadline`, `message`, `estimate` and
one `references` value per checked project id.

## Saved data (localStorage)

| Key | Shape | Validated on read |
|-----|-------|-------------------|
| `rillmark-shortlist` | `["season-of-tides", "cold-open"]` | Must be an array; ids that aren't in `PROJECTS` and duplicates are dropped |
| `rillmark-estimate` | `{ "service": "titles", "seconds": 60, "style": "graphic", "rounds": 2, "rush": false, "addons": ["sound"] }` | `service` and `style` must be own keys of `SERVICES` and `STYLES`; seconds are snapped to 15 and clamped to the service's range; rounds clamped to 2–4; unknown add-ons dropped. Anything else is ignored |

All access goes through one `safeStorage` object. When localStorage is blocked (a sandboxed iframe or
strict privacy settings) it keeps the values in memory, so saving and removing still work for the page
view. To reset, remove the keys in the browser's developer tools (Application > Local Storage), or press
"Clear the shortlist" and the estimate's "Remove" on the contact page.

## SEO and sharing

Every page has its own `<title>`, meta description, `theme-color` and Open Graph tags in its `<head>`.
`project.html` updates its title and description for the project shown. Social sites need absolute URLs,
so when you publish, change each `og:image` to your full address:

```html
<meta property="og:image" content="https://www.yourstudio.example/assets/img/og-image.png">
```

Add a `sitemap.xml` listing your pages (case studies as `project.html?project=<id>`) and a `robots.txt`
pointing to it. For search, consider `Person` or `Organization` structured data with your name, address
and services; none is included.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page and headings in order.
- Visible focus rings (violet on paper, mint on plum); every control works by keyboard.
- The mobile menu button uses `aria-expanded` and `aria-controls`; Esc closes it.
- Toggle buttons (filters, Save, Shortlist only) use `aria-pressed`; result counts and the estimate are
  polite live regions; each note toggle uses `aria-expanded`.
- Artwork is decorative (`aria-hidden`) except where it carries meaning: case-study styleframes and the
  scrubber frame have text alternatives.
- The showreel has visible play and pause controls, only autoplays with motion allowed and pauses off
  screen; reduced motion turns off every animation.
- Colors meet WCAG AA. Coral is for decoration only on paper.

When editing, keep one `<h1>`, label every new input, keep `aria-controls` and `aria-labelledby`
pointing at ids that exist, and don't put text in coral on the paper background.

## Building and deploying

The compiled CSS is included, so you only rebuild after changing `src/input.css` or adding Tailwind classes
that aren't used anywhere yet (Node.js 24):

```sh
npm install
npm run build     # once
npm run watch     # rebuild on every change
```

Tailwind scans the HTML and JavaScript files for class names, so classes written in `main.js` strings are
picked up too; keep them as whole words (not built from pieces).

To publish, upload the folder (without `node_modules/`) to any static host: Netlify Drop, Cloudflare
Pages, GitHub Pages or your own server. There is no server code.

## Troubleshooting

- **The artwork, filters and dates are missing.** `assets/js/data.js` didn't load, or loads after
  `main.js`. Both scripts must be at the end of `<body>`, `data.js` first.
- **A new Tailwind class has no effect.** It isn't in `assets/css/style.css` yet: run `npm run build`.
- **The showreel doesn't move.** Your device asks for reduced motion (press Play to step through stills),
  or the player is scrolled out of view.
- **The shortlist forgets itself between pages.** The browser blocks localStorage (private mode in some
  browsers, or the page is inside a sandboxed frame); saving still works within each page.
- **A case study link shows Season of Tides instead.** The `?project=` id doesn't match an `id` in
  `PROJECTS`. Ids are case-sensitive.
- **The journal dates don't match `data.js`.** `KEEP_DEMO_CURRENT` is `true`, so they have moved forward
  by whole weeks since `DEMO_ANCHOR`. Set it to `false` for real notes.
- **Headlines look narrow but don't stretch.** The Anybody font didn't load (offline or blocked); the
  fallback has no width axis. Check the Google Fonts `<link>` in the page.

## License

MIT. The code and all included artwork are free for personal and commercial use. See `LICENSE.txt` in the
download.

Anybody, Gelasio and Red Hat Mono are licensed under the SIL Open Font License and served by Google Fonts.

Rillmark, Marika Drever, the collaborators, clients, projects and quotes are fictional. Replace them with
your own before publishing.
