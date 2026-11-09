# Echo documentation

## Overview

Echo is a website template for a podcast, built for **Overtone**, a fictional independent interview show
about how things get made. Its hosts, Nadia Ferreira (an industrial designer) and Eli Brandt (a science
journalist), record in a former piano workshop in Philadelphia and have published 62 episodes over four
seasons. The site has a home page with the latest episode, an episode archive, episode pages with chapters,
show notes and a transcript, hosts, subscribe, advertise and be-a-guest pages, and an audio player that
follows the visitor from page to page. It is plain HTML with Tailwind CSS v4 and one vanilla JavaScript file,
with no build step needed to use it. The design is dark-first: a blackcurrant night background, wide Syne
headlines, mono labels and colorful SVG cover art. This guide covers version 1.0.6. See it live at
[freeframe.dev/templates/echo](https://freeframe.dev/templates/echo).

## Quick start

1. Unzip the download and open `index.html` in a browser. Every page works from the file system.
2. Or serve the folder, which is closer to how it runs on a host (and needed for the clipboard API on some
   browsers):

   ```sh
   npx serve .
   ```

3. You only need Node.js 24 or newer if you change CSS classes (see
   [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with the latest episode and its player, "listen on" links, guest ticker, four featured episodes, topics with counts, hosts, listener reviews, newsletter form |
| `episodes.html` | Archive | Search, season and topic filters, sort, filter chips, load more, empty state (`episodes.html?topic=sound&season=4&q=room&sort=oldest`) |
| `episode.html` | One episode | Cover, full player with chapter markers, about and pull quote, chapters (`#chapters`), show notes (`#notes`), transcript (`#transcript`), guest card, share box (`#share`), related episodes. `episode.html?id=18&t=754` opens episode 18 at 12:34; without `id` it shows the latest episode |
| `hosts.html` | Hosts and story | Host cards, numbers, timeline, how an episode is made, press quotes (`#press`), team |
| `subscribe.html` | Subscribe | App links (`#apple-podcasts`, `#spotify`, `#youtube`, `#pocket-casts`, `#overcast`, `#rss`), copyable RSS feed, next release date, FAQ, newsletter form |
| `sponsor.html` | Advertise | Audience stats, growth line chart, occupations donut, age and country bars, ad formats, rate card (`#rates`), inquiry form (`#enquire`; `sponsor.html?format=season` checks a format) |
| `guest.html` | Be a guest | What we look for, what happens next, pitch form |
| `404.html` | Not found | "Dead air" page with links back into the site |

## Project structure

```text
echo/
  index.html … guest.html, 404.html   the pages (header, footer and mini player repeated in each)
  assets/css/style.css                compiled Tailwind CSS (generated, do not edit)
  assets/js/main.js                   all JavaScript: data, player, archive, episode page, charts, forms
  assets/img/favicon.svg              browser icon
  assets/img/host-nadia.svg           illustrated host portrait (400×480)
  assets/img/host-eli.svg             illustrated host portrait (400×480)
  assets/img/og-image.svg             social image source (1200×630)
  assets/img/og-image.png             social image used by the pages
  src/input.css                       Tailwind source: design tokens and component classes
  package.json                        scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

`assets/js/main.js` is split into numbered sections (data, helpers, artwork, player engine, player
interfaces, cards and home, archive, episode page, charts, forms, chrome, back to top). Search for the
section title to find your way around.

## Customizing

### Brand and colors

The design tokens live in the `@theme` block of `src/input.css`. Every utility such as `bg-night`,
`text-muted` or `text-lilac` comes from them.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-night` | `#0e0c13` | Page background |
| `--color-ink-900`, `--color-ink-800`, `--color-ink-700` | `#15121c`, `#1c1826`, `#272132` | Sections, cards and inputs, hover states |
| `--color-line` | `#342c42` | Borders, rules, the unplayed part of waveforms |
| `--color-paper` | `#f4efe6` | Headings and body text |
| `--color-muted`, `--color-subtle` | `#b6adc2`, `#948aa3` | Secondary text and captions |
| `--color-lilac` | `#b9a4ff` | Main accent: buttons, links, the played part of waveforms, focus rings |
| `--color-tomato`, `--color-sun`, `--color-sky`, `--color-mint` | | "On air" dots, stars and chapter markers, topic colors |

To change the main accent, edit the lilac tokens and rebuild:

```css
@theme {
  --color-lilac: #7ee0d0;
  --color-lilac-soft: #b4f0e6;
  --color-lilac-deep: #3fbfa8;
}
```

A few colors are also written in JavaScript and SVG because they are drawn into artwork: the season cover
colors in `SEASONS`, the occupation colors in `AUDIENCE.work`, the chart strokes in `initCharts()` and the
colors inside `assets/img/*.svg`. Echo is a dark-only design (`color-scheme: dark` in `src/input.css` and a
`color-scheme` meta tag on every page). There is no light theme or toggle.

### Typography

Three Google Fonts are loaded by the `<link>` in the `<head>` of every page:

- **Syne** (600–800) for display headings, through the `display` utility and the `.h-hero`, `.h-page` and
  `.h-section` classes, and inside the SVG cover art.
- **Schibsted Grotesk** for body text (`--font-sans`).
- **DM Mono** for labels, timestamps and episode numbers (`--font-mono`, the `.meta` class).

To swap a font, change the Google Fonts URL on each page and the matching stack in `@theme`
(`--font-display`, `--font-sans`, `--font-mono`). Each stack ends with system fallbacks.

### Content

Static text (hero, hosts, reviews, press, rates, FAQ) is plain HTML in each page. Everything about episodes
comes from the data at the top of `assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `SHOW` | Show name, the RSS feed address shown on `subscribe.html`, and the credits line added to show notes |
| `TOPICS` | Topic ids, labels, color dot class and a one-line description (used by filters and the home topic list) |
| `SEASONS` | Season labels, years and the cover colors for each season |
| `EPISODES` | One object per episode |
| `DETAILS` | Optional chapters, show notes, transcript and guest bio and links for an episode id |
| `AUDIENCE` | Numbers for the advertise page charts |

An episode looks like this. `duration` is in seconds and `date` is `YYYY-MM-DD`:

```js
{ id: 63, season: 4, title: "The Sound of Snow", guest: "Dr. Mira Holm", role: "Snow physicist", topic: 'science', date: '2026-10-21', duration: 3540,
  summary: "Why fresh snow makes a city quiet, and how Mira measures it.",
  quote: "Snow is a very large, very cold acoustic panel.",
  src: 'audio/episode-63.mp3' }
```

The newest `date` becomes the latest episode everywhere: the home hero, "New episode" links and the subscribe
page's next release date (two weeks later). The home page's "Start with these four" list is set by
`data-ep-cards="18,41,2,33"` in `index.html`.

To give an episode real chapters, notes and a transcript, add an entry to `DETAILS` with its id. Times are
seconds from the start. Notes are blocks: a string is a paragraph, `{ h }` a heading, `{ ul }` a list and
`{ links }` a list of `[label, url]` pairs:

```js
63: {
  bio: 'Mira Holm studies how snow absorbs sound at a research station in Tromsø.',
  links: [['Mira’s lab', 'https://example.com/snow-lab']],
  chapters: [{ t: 0, title: 'Cold open' }, { t: 140, title: 'Meet Mira' }, { t: 1260, title: 'Measuring quiet' }],
  notes: ['Paragraph of show notes.', { h: 'Mentioned' }, { links: [['Episode 62: The Quietest Room on Earth', 'episode.html?id=62']] }],
  transcript: [[0, 'Eli', 'From a former piano workshop in Philadelphia, this is Overtone.'], [140, 'Mira', 'Thanks for having me.']]
}
```

Episodes without a `DETAILS` entry still get a full page: `chaptersFor()` spreads a standard running order
across the episode, `notesFor()` builds notes from the summary, chapters and related episodes, and
`transcriptFor()` writes a short excerpt marked as such. Replace these with your real content when you can.

### Images and artwork

There are no photos. All artwork is SVG:

- **Cover art** is generated by `cover(ep)` in `main.js`: the season color from `SEASONS`, a motif for the
  topic (waveform for sound, orbits for science, a shape grid for design, a truss for engineering, woven
  scales for craft) and the episode number. Covers are square. To use your own artwork, return an
  `<img src="…" alt="">` string from `cover()` instead, with square images of at least 600×600.
- **Waveforms** are generated by `bars()` and `waveSVG()` from a stable hash of the episode id, so each
  episode always has the same shape. They are decorative; they don't analyze audio.
- **Guest avatars** (`avatar(ep)`) are the guest's initials on the season color.
- **Host portraits** are `assets/img/host-nadia.svg` and `assets/img/host-eli.svg` (5:6). Replace them with
  photos of the same ratio, for example 800×960, and keep the `alt` text.
- **Social image**: `assets/img/og-image.png` (1200×630) is rendered from `og-image.svg`. Edit the SVG, then
  export it to PNG at 1200×630 with any browser or design tool. The favicon is `assets/img/favicon.svg`.

### Navigation, header and footer

The header (with the mobile menu), footer, mini player and toast are repeated in every page, so a change to
the menu has to be made in each HTML file. Mark the current page's link with `aria-current="page"` (it is
already set on every page). Links with `data-latest-link` are pointed at the newest episode by
`initLatestLinks()`. The "Listen on" links in the footer, home and episode pages go to the matching card on
`subscribe.html`; the cards there link to your show in each app. Replace the `https://example.com/overtone/…`
addresses in `subscribe.html` with your real show pages.

## Features

### The player

Every element with `data-player-ui` is a player. `bindPlayer()` wires up whatever controls it contains:

| Attribute value | Where | Controls |
|-----------------|-------|----------|
| `data-player-ui="latest"` | Home hero | Always the newest episode |
| `data-player-ui="62"` | `#episode-player` on `episode.html` (set from the URL) | That episode |
| `data-player-ui="mini"` | `#mini-player` on every page | Whatever is loaded |

All of them share one engine, `Player`, so pressing play anywhere pauses everything else, and every player
and play button stays in sync. Inside a player, these hooks are used when present: `[data-act="toggle"]`,
`"back"`, `"fwd"`, `"rate"`, `"mute"` and `"close"` buttons, `[data-wave]` (the waveform scrubber, built as
an invisible `<input type="range">` over two SVG layers), `[data-vol]`, `[data-cur]`, `[data-dur]`,
`[data-bar]` and the `data-ui-*` text hooks. Any button with `data-play="<id>"` plays or pauses that
episode.

Settings: skip length is `SKIP` (15 seconds) and the speed cycle is `RATES` (`1, 1.25, 1.5, 1.75, 2,
0.75`).

**Real audio or a simulated clock.** If an episode has a `src`, `Player.load()` creates an `<audio>` element
for it and the time, duration, speed, volume and end of the episode come from the real file. Episodes
without `src` play on a clock: a timer advances the position every 250 ms by the elapsed time multiplied by
the speed, until it reaches `duration`. That is how the demo plays all 62 episodes with no audio files. To
go live, add `src` to each episode (a relative path such as `audio/episode-63.mp3`, or your podcast host's
MP3 URL). Keep `duration` accurate: it is shown before the file has loaded and used for chapters and the
waveform.

**Keyboard.** Inside any player: <kbd>Space</kbd> or <kbd>K</kbd> play or pause, <kbd>←</kbd>/<kbd>→</kbd>
or <kbd>J</kbd>/<kbd>L</kbd> skip 15 seconds, <kbd>↑</kbd>/<kbd>↓</kbd> change the volume and <kbd>M</kbd>
mutes. On the waveform slider itself the arrows move 5 seconds, <kbd>Page Up</kbd>/<kbd>Page Down</kbd> a
minute and <kbd>Home</kbd>/<kbd>End</kbd> jump to the ends. On `episode.html`, K, J, L and M also work
anywhere on the page while you are not typing in a field. The episode player lists the shortcuts under
"Shortcuts".

**Accessibility.** Every player is labeled (the episode and mini players are regions); the play button's label says what will happen ("Play
episode 62: The Quietest Room on Earth"); the seek slider announces its position in words ("12 minutes 34
seconds of 57 minutes 56 seconds"); mute is a toggle button with `aria-pressed`. Animated equalizer bars and
the ripple rings around the home cover only move while playing and stay still with reduced motion.

### Mini player and saved progress

`#mini-player` slides up at the bottom of the page as soon as an episode is loaded, and the page gets extra
bottom padding (`.has-mini`) so nothing is hidden behind it. On an episode page it tucks away while that
episode's own player is on screen. The close button stops playback and hides it; the position is kept.

The player saves to localStorage every five seconds while playing, and on pause, seek and page change (see
[Saved data](#saved-data-localstorage)). On the next page it loads the same episode at the same second; if it
was playing it carries on (a real audio file may be blocked by the browser's autoplay rules, in which case it
waits, paused, for the visitor to press play). Episode cards and archive rows show "23 min left" or "Played"
with a progress bar.

### Episode archive

`initArchive()` on `episodes.html` filters `EPISODES` with `filterEpisodes()`: a search across title, guest,
role, summary and topic (matches are highlighted), one season, one topic and a sort (`newest`, `oldest`,
`longest`, `shortest` in `SORTS`). The state is written to the URL with `history.replaceState`, so filtered
views can be shared and bookmarked. Topic buttons show live counts within the current season and search.
Results show 12 at a time (`PAGE_SIZE`); "Show more" focuses the first new episode. Active filters appear as
removable chips, and an empty state offers to clear them. Filter buttons use `aria-pressed`, and the result
count is a polite live region.

### Chapters, transcript and sharing

On `episode.html`, `initEpisodePage()` fills the page from the `id` in the URL (an unknown id shows the
`#episode-missing` template instead).

- **Chapters**: each is a button that seeks there and plays. The current chapter gets `aria-current="true"`,
  is named above the waveform, and appears as a dot under the waveform (`data-chapter-marks`).
- **Transcript**: each line is a button that seeks and plays. The current line is highlighted while you
  listen, and with "Follow along while playing" checked the transcript box scrolls to keep it in view (it
  stops following for a few seconds after you scroll it yourself, and scrolls instantly with reduced motion).
  The search box filters lines and highlights matches.
- **Share**: the share box shows the episode link; check "Start at" to add `&t=` with the current second,
  then "Copy link". Opening a link with `?t=` loads the episode at that point, paused, with a note saying so.
  `t` also accepts `12:34` or `1:02:03`. Where the browser supports it, a "More" button opens the system
  share sheet.

### Charts

`initCharts()` on `sponsor.html` draws the growth line chart and the occupation donut as inline SVG, and the
age and country charts as CSS bars, from `AUDIENCE`. Each SVG chart has a text alternative in `aria-label`,
the bar lists are readable as text, and "Show the numbers" opens a data table for the growth chart. Change
the numbers in `AUDIENCE` and the `aria-label` text together.

### Header, menu, reveals and back to top

The header turns solid after scrolling. Below 1024 px the menu button opens a full-height menu
(`aria-expanded`, <kbd>Esc</kbd> closes it). Elements with `.reveal` fade in on scroll, and revealing one also
reveals everything above it; with reduced motion they are visible straight away. The back-to-top button at
the end of `main.js` lifts itself above the mini player and toasts. To remove it, delete that block and the
`.back-to-top` styles in `src/input.css`.

## Forms

Every form with `data-validate` is checked on submit by `initForms()`: required fields, email format, web
addresses (`type="url"`), minimum lengths, required checkboxes and checkbox groups
(`<fieldset data-required-group>`). Errors appear under each field (in the element whose id is the field id
plus `-error`), the first invalid field gets focus, and fields re-check as you fix them. On success the form
is replaced by its success box (`data-success="<id>"`), which takes focus.

| Form | Page | Checks |
|------|------|--------|
| `#newsletter-form` | Home | Email |
| `#sub-form` | Subscribe | Email |
| `#sponsor-form` | Advertise | Name, company, email, optional website, at least one format, budget, message (30+ characters) |
| `#guest-form` | Be a guest | Name, email, their name when "Someone else" is chosen (`data-toggle-when`), field, topic, optional link, story (120+ characters with a live counter), consent |

**The forms don't send anything** until you connect them, although their success messages read as if they
had. To connect them, edit `onValid()` in section 10 of `assets/js/main.js`. With [Formspree](https://formspree.io):

```js
function onValid(form) {
  fetch('https://formspree.io/f/your-form-id', {
    method: 'POST',
    body: new FormData(form),
    headers: { Accept: 'application/json' }
  }).then(function (res) {
    if (res.ok) showSuccess(form);
    else toast('Something went wrong. Please email us.');
  });
}
```

Use a different endpoint per form by checking `form.id`. For the newsletter, most email services
(Buttondown, Mailchimp, ConvertKit) accept the same `fetch` to their form endpoint. Then check the success
messages in the HTML match what really happens: the newsletter ones promise a confirmation email, the
sponsor one a reply from Rosa within two business days and the guest one a reply within three weeks. The
sponsor and guest messages show a short reference (`OT-` and four characters) made by `makeRef()` in
`showSuccess()`; show your form service's own reference instead if it returns one.

## Saved data (localStorage)

| Key | Shape | Notes |
|-----|-------|-------|
| `overtone-player` | `{ "id": 18, "rate": 1.25, "volume": 0.9, "muted": false, "playing": true }` | The loaded episode and player settings. Unknown ids and speeds not in `RATES` are ignored on read, and the volume is clamped to 0–1. Without `id`, nothing is loaded |
| `overtone-progress` | `{ "18": 1720.4, "62": 312 }` | Seconds listened per episode id. Positions within 2 seconds of the end count as played and restart from the top |

Values are read with `readJSON()`, which falls back to defaults on missing or broken data, and written with
`writeJSON()`, which ignores storage errors (private windows, full storage) so playback still works. To reset,
run `localStorage.removeItem('overtone-player'); localStorage.removeItem('overtone-progress')` in the browser
console. To rename the keys, change `STORE_PLAYER` and `STORE_PROGRESS`.

## SEO and sharing

Every page has its own `<title>`, meta description, Open Graph and Twitter tags, `theme-color` and favicon in
its `<head>`. On `episode.html`, the title and description are replaced with the episode's when the page
loads; for search engines and link previews that don't run JavaScript, consider generating one static page
per episode, or render them on your server.

Social sites need an absolute image URL. Before you publish, change every
`<meta property="og:image" content="assets/img/og-image.png">` to your full address, for example
`https://yourshow.com/assets/img/og-image.png`. Add a `sitemap.xml` listing your pages, a `robots.txt`, and
`<link rel="alternate" type="application/rss+xml" href="…/feed.xml">` in each `<head>` so podcast apps can
find your feed.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`, labeled `aside` and regions) and one `<h1>` per
  page.
- Visible focus rings in lilac on every control, including the invisible seek slider (the waveform gets the
  ring).
- The player is fully keyboard operable, with labeled buttons, a slider with spoken values and documented
  shortcuts (`aria-keyshortcuts`).
- Filters use `aria-pressed`, the current chapter and transcript line use `aria-current`, result counts and
  form errors are live regions.
- Reduced motion turns off scroll reveals, the ticker, equalizer and ripple animations, and smooth scrolling.
- Text colors meet WCAG AA on every surface.

When editing, keep one `<h1>` per page, give new inputs a `<label>` and an error element with the matching
id, and keep `alt` text on replaced images.

## Building and deploying

The compiled CSS is included, so you only rebuild it after changing `src/input.css` or using Tailwind
classes that aren't already in the pages or `main.js`:

```sh
npm install
npm run build    # once
npm run watch    # rebuild on every change
```

Tailwind scans the HTML files and `assets/js/main.js`, so classes written in JavaScript strings are
included. Deploy by uploading the whole folder to any static host: Netlify Drop, GitHub Pages, Cloudflare
Pages, Vercel or your own server. Audio files can live in the same folder (for example `audio/`) or on your
podcast host.

## Troubleshooting

- **Nothing plays when I add a `src`.** Check the path relative to the page, that the file is MP3, AAC or
  another format the browser plays, and that your audio host allows it (some hosts block hotlinking). Errors
  show a toast.
- **The player keeps resuming an old episode.** That is the saved state. Clear it with the commands in
  [Saved data](#saved-data-localstorage), or press the mini player's close button.
- **"Copy link" doesn't copy when opened from the file system.** The clipboard API needs `https` or
  `localhost`; the template falls back to selecting the link. Serve the folder with `npx serve .`.
- **Filters reset when I reload from the file system.** Some browsers don't allow `history.replaceState` on
  `file://` URLs. It works on any web server.
- **A new utility class has no effect.** Rebuild the CSS (`npm run build`).
- **Times or chapters are wrong after replacing audio.** Update `duration` and the chapter `t` values in
  `DETAILS`, all in seconds.

## License

MIT. Free for personal and commercial use, including client work. The full text is in `LICENSE.txt` in the
download. All artwork (cover art, waveforms, portraits and icons) is part of the template and covered by the
same license.
