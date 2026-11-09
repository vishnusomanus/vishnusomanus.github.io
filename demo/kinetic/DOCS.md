# Kinetic documentation

## Overview

Kinetic is a complete website template for an independent personal trainer or a small personal training studio.
The demo content is for **Foothill Performance**, a fictional two-coach studio in Old Colorado City, Colorado Springs, Colorado, run by
Ffion Beckett and Yusuf Dacre. It is plain HTML5, Tailwind CSS v4 and one vanilla JavaScript file with no
dependencies. This guide covers version 1.0.7 (see `template.json`). Live demo:
[freeframe.dev/templates/kinetic](https://freeframe.dev/templates/kinetic).

The copy uses American English, US dollars, a 12-hour clock and the `America/Denver` time zone (Mountain Time). All health content
is general and carefully worded; review it with a qualified professional before you publish your own site.

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Everything works from the file system, including the booking flow and
   calculators.
3. To preview over HTTP instead (closer to how it will run online), serve the folder with any static server, for
   example:

   ```sh
   npx serve .
   ```

You only need Node.js 24 if you change `src/input.css` or add Tailwind classes that aren't already in the compiled
CSS. See [Building and deploying](#building-and-deploying).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with live "next free consult" badge, goal picker with five recommendation panels, programs teaser, three client progress charts, how it works, testimonials, pricing teaser with Kickstart offer and a health note |
| `programmes.html` | Programs | Seven program cards filterable by goal (`?goal=`), what's included, prices, facts and booking links, comparison table |
| `pricing.html` | Pricing | Kickstart intro offer (`#kickstart`), session packs, memberships (`#memberships`), cost calculator (`#calculator`), monthly vs pay-per-session table, FAQ (`#faq`), small print (`#terms`) |
| `results.html` | Client results | Six anonymized progress stories with SVG charts, filterable by goal (`?goal=`), review wall |
| `tools.html` | Training tools | Plan builder (`#plan`), one-rep max estimator (`#one-rep-max`), pace calculator (`#pace`) |
| `about.html` | About | Studio story, coach profiles (`#ffion`, `#yusuf`), approach, milestones, studio facts and safety note |
| `contact.html` | Contact | Contact form, map, getting there, studio hours with open-now status, social links (`#social`), privacy note (`#privacy`) |
| `book.html` | Book online | Four-step booking flow with a week view, health questions and a confirmation with `.ics` download |
| `404.html` | Not found | Friendly error page with links back into the site (`noindex`) |

## Project structure

```text
kinetic/
  index.html ... 404.html   the nine pages
  assets/
    css/style.css           compiled Tailwind CSS (generated, don't edit by hand)
    js/main.js              all JavaScript: studio data at the top, then each feature
    img/
      favicon.svg           browser tab icon
      og-image.svg          social sharing image source (1200 x 630)
      og-image.png          social sharing image used in og:image
      pose-*.svg            athlete pictograms for the five goals (120 x 120)
      coach-ffion.svg       illustrated coach portraits (240 x 240, square)
      coach-yusuf.svg
      studio.svg            studio illustration (640 x 400)
      map.svg               illustrated location map (600 x 420)
  src/input.css             Tailwind source: brand tokens and component classes
  package.json              scripts to rebuild the CSS
  README.md                 short introduction
  DOCS.md                   this guide
  CHANGELOG.md              version history
```

## Customizing

### Brand and colors

All design tokens live in the `@theme` block at the top of `src/input.css`. The ones that matter most:

| Token | Used for |
|-------|----------|
| `--color-cobalt-50` to `--color-cobalt-950` | Brand blue: buttons, links, headings accents, dark bands (`900`/`950`) |
| `--color-flare-50` to `--color-flare-800` | Energy color: highlights, button shadows, stripes; `700`/`800` for text on light backgrounds |
| `--color-sun-*` | Small highlights (today's hours row, chart markers) |
| `--color-mint-*` | Success and "included" check marks, positive outcomes |
| `--color-ink`, `--color-body`, `--color-muted` | Heading, body and secondary text |
| `--color-paper`, `--color-mist`, `--color-line` | Page background, quiet fills and borders |

To change the brand color, replace the cobalt scale (keep `600` dark enough for white text, at least 4.5:1):

```css
@theme {
  --color-cobalt-600: #0f766e; /* buttons and links */
  --color-cobalt-700: #115e59; /* hover */
  --color-cobalt-950: #042f2e; /* footer and dark bands */
}
```

A few SVG files and the chart code use hex values directly (`#2b3be0` cobalt, `#ff5a33` flare, `#0f1330` ink):
search `assets/img/*.svg` and `renderChart()` in `assets/js/main.js` if you change the palette. Rebuild the CSS
afterwards.

### Typography

Two Google Fonts are loaded in the `<head>` of every page:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Sofia+Sans+Extra+Condensed:ital,wght@0,600..900;1,600..900&amp;family=Sofia+Sans:ital,wght@0,400..900;1,400..700&amp;display=swap">
```

`--font-display` (Sofia Sans Extra Condensed) is used by `.display`, `.section-title`, `.card-title` and buttons;
`--font-sans` (Sofia Sans) for everything else. To swap them, change the link on every page and the two tokens in
`src/input.css`. Condensed display faces such as Saira Extra Condensed or Barlow Condensed suit the layout best;
wider faces will need smaller heading sizes.

### Content

Text lives in the HTML pages. Data used by scripts lives at the top of `assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `STUDIO` | Name, time zone (`America/Denver`), phone, email and address (used in `.ics` files) |
| `HOURS` | Opening hours by weekday (`0` = Sunday, `null` = closed), 24-hour `HH:MM` strings (shown on a 12-hour clock by `hhmm()`) |
| `CLOSED_DATES` | One-off closures as `YYYY-MM-DD`. December 24–28 and US federal holidays are worked out by rule in `isClosedDate()`, so they stay right every year |
| `COACHES` | Each coach's name, short name, role, portrait and `shifts` (1:1 hours by weekday) |
| `GROUP_CLASSES`, `GROUP_SIZE` | Small-group classes (weekday, start time, coach, name) and the class size |
| `SESSIONS` | Bookable session types: label, minutes, price, price label, coaches, notice and whether health answers trigger a call-back |
| `BOOKING` | Slot spacing, weeks shown and the demo "busy" share |
| `GOALS` | The five goal ids and labels used by the goal picker, filters, booking and plan builder |
| `PRICING` | Calculator prices: pay per session, packs, membership rates |
| `RESULTS` | Chart data for client stories |
| `FOCUS`, `PLAN_DAYS`, `SPLITS`, `SCHEMES`, `EQUIPMENT` | Plan builder rules and exercises |

Keep the HTML and the data in step: the hours list in the footer and on `contact.html` (`data-hours`) should match
`HOURS`, and the prices on `pricing.html` should match `SESSIONS` and `PRICING`.

**Add a coach.** Add an entry to `COACHES`, list them in the `coaches` of each session they offer, add a radio card in
step 2 of `book.html` and a profile on `about.html`:

```js
var COACHES = {
  // ...
  maya: {
    name: 'Maya Lin', short: 'Maya', role: 'Coach', img: 'assets/img/coach-maya.svg',
    shifts: { 2: [['16:00', '20:30']], 4: [['16:00', '20:30']], 6: [['08:00', '12:00']] }
  }
};
```

```html
<label class="option"><input type="radio" name="coach" value="maya"><span class="option-box flex-col">
  <!-- copy the markup of an existing coach card, including data-coach-next="maya" -->
</span></label>
```

**Add a session type.** Add it to `SESSIONS` and a matching radio card (`name="type"`, same `value`) in step 1 of
`book.html`:

```js
assessment: { label: 'Fitness assessment', minutes: 60, price: 85, priceLabel: '$85', coaches: ['yusuf'], notice: 1440, screen: true }
```

**Add a program.** Copy an `<article>` on `programmes.html`. Its `data-goals` attribute lists the goal ids it
should appear under, separated by spaces (`data-goals="strength sport"`). Filter counts update automatically.

**Add a client story chart.** Add an entry to `RESULTS` and a figure where you want it:

```html
<figure class="chart" data-chart="plank" data-reveal>
  <div data-chart-svg></div>
</figure>
```

```js
plank: { label: 'Plank hold', unit: 'reps', x: ['Wk 1', 'Wk 4', 'Wk 8'], y: [20, 45, 70], better: 'up' }
```

`unit` can be `lb`, `kg`, `in`, `reps`, `steps` or `time` (values in seconds, shown as `m:ss`). With
`better: 'down'` the axis is flipped so improvement still rises.

### Images and artwork

All artwork is SVG and drawn for this template:

- `pose-strength.svg`, `pose-fatloss.svg`, `pose-mobility.svg`, `pose-sport.svg` and `pose-postnatal.svg` are
  120 x 120 pictograms. On selected goal cards and program headers they are turned white with a CSS filter
  (`brightness-0 invert`), so keep them single-color plus flare accents.
- `coach-ffion.svg` and `coach-yusuf.svg` are square portraits. Replace them with square photos (at least
  480 x 480) and keep `alt` text on `about.html` describing the person.
- `studio.svg` is 16:10 and `map.svg` is 10:7. You can swap the map for an embedded map, but note that adds
  external requests and cookies.
- The home hero, page heroes and 404 art are inline SVG in the HTML.

The social image is `assets/img/og-image.png` (1200 x 630), rendered from `og-image.svg`. Edit the SVG, then export
it to PNG with any vector editor or browser screenshot at 1200 x 630. The favicon is `assets/img/favicon.svg`.

### Navigation, header and footer

The header (announcement bar, logo, main navigation, "Book a free consult" button and mobile menu) and footer are
repeated in every page. To add or remove a page, edit both `<ul>` lists in the header (desktop `nav[aria-label="Main"]`
and `#mobile-menu`) and the footer columns on every page, and mark the current page with `aria-current="page"`.
The desktop navigation appears from 1280 px (`xl`); below that the menu button is shown.

## Features

### Goal picker

On `index.html`, five radio cards (`input[name="goal"]`) inside `[data-goal-picker]` show one of five pre-written
panels (`[data-goal-panel="strength"]` and so on). Edit the panels directly in the HTML. The choice is saved under
the `kinetic-goal` key and preselected next time; `index.html?goal=sport` also selects a goal. The panel container is
an `aria-live="polite"` region and the cards are a native radio group (arrow keys move between goals).

### Program and story filters

`programmes.html` and `results.html` use the same filter. A `[data-filter]` wrapper holds chip buttons
(`[data-filter-value]`, `aria-pressed`) and items with `data-goals`. With `data-filter-url` on the wrapper the choice is
written to `?goal=` with `history.replaceState`, so `programmes.html?goal=postnatal` opens filtered. Unknown values
fall back to "All". A status line (`[data-filter-status]`, `role="status"`) announces how many items are shown, and
choosing a goal also updates `kinetic-goal`.

### Progress charts

`renderChart()` in `main.js` draws each `<figure data-chart="id">` from `RESULTS` as an inline SVG line chart with
grid lines, axis labels, an area fill and a highlighted final value. Each SVG has `role="img"` and an `aria-label`
summary such as "5K time: 31:12 at Wk 1, 26:28 at Wk 12 (lower is better)." The line draws in when scrolled into
view; with reduced motion it appears immediately.

### Next free consult

`[data-next-consult]` on the home page shows the first bookable consultation from the booking engine, for example
"Tomorrow 7:00 AM with Ffion". It stays hidden if JavaScript is off.

### Booking flow

`book.html` holds a form inside `[data-booking]` with four steps and a confirmation:

1. **Session**: radio cards `name="type"` matching the keys of `SESSIONS`.
2. **Coach**: `name="coach"` with `any` (no preference), `ffion` or `yusuf`. Coaches who don't offer the chosen
   session are disabled, and each card shows its next opening (`[data-coach-next]`).
3. **Time**: a week view (Monday to Sunday) with previous and next week buttons, for this week and the next
   `BOOKING.weeksAhead - 1` weeks. It opens on the week of the first available time.
4. **Your details**: name, email, cell phone, optional goal and notes, seven yes/no health questions and a consent box.
5. **Confirmation**: a summary with a reference (like FP-7K2Q), coach portrait, what happens next and an **Add to
   calendar (.ics)** button; the `.ics` file carries the reference too.

How times are built, in `slotsFor()`:

- A 1:1 session can start every `BOOKING.slotStep` minutes inside the coach's `shifts` and the studio `HOURS`, and
  must finish by the end of the shift.
- It can't overlap a small-group class the coach is leading (`GROUP_CLASSES`, 60 minutes).
- It must start at least `notice` minutes from now (2 hours for consults, 12 hours for training), in Mountain Time.
- Federal holidays, December 24–28, `CLOSED_DATES` and closed weekdays show "Studio closed" / "Closed".
- `group` sessions use the fixed `GROUP_CLASSES` times and show the spaces left.
- With "No preference", each time goes to the first coach in the session's `coaches` list who is free.
- `BOOKING.demoBusyShare` hides a stable, pseudo-random share of times so the demo looks realistic. **Set it to `0`
  when you connect real availability.**

URL parameters preselect choices: `book.html?type=pt60&coach=yusuf&goal=sport`. `type` must be a `SESSIONS` key,
`coach` a `COACHES` key that offers that session, and `goal` a `GOALS` key (it fills the goal field; otherwise the
saved `kinetic-goal` is used).

All dates and times are calculated and shown in `STUDIO.timeZone` (`America/Denver`), whatever the visitor's own time
zone. The `.ics` file stores the start and end in UTC, so calendars convert it correctly.

Accessibility: each step heading receives focus when the step opens, the progress bar marks the current step with
`aria-current="step"`, step errors use `role="alert"`, each day in the week view is a labeled group and every time
is a radio with a full label (for example "Tuesday, October 20, 2026, 7:30 AM, Ffion").

### Health questions

Step 4 asks seven PAR-Q style yes/no questions (`name="parq1"` to `parq7`). They are required. As soon as they are
answered, `[data-health-outcome]` shows one of three messages:

| Outcome | When | Result |
|---------|------|--------|
| `clear` | All answers are no | Booking confirms as normal |
| `talk` | Any yes, for a session with `screen: true` | The button changes to "Send call-back request" and the confirmation explains that it is a request, not a booking, with no `.ics` file |
| `consult` | Any yes, for the free consultation (`screen: false`) | The booking goes ahead, with a note that the consult is the right place to talk it through |

The wording is deliberately cautious: it asks people to talk to the coach first and to check with their doctor. Keep
it that way, and have a professional review the questions for your country before you publish. Health answers are sensitive personal data, and privacy laws vary by state: if you connect this form, store them securely, keep them only as long as you need and check which rules apply to you.

### Pricing calculator

`[data-calculator]` on `pricing.html` has a sessions-a-week stepper (1 to 4) and a 45/60-minute toggle. For the
chosen combination it compares, per month (`PRICING.weeksPerMonth` = 52 / 12):

- **Pay per session**: `PRICING.payg[length]` x sessions a month.
- **Session pack**: the largest pack in `PRICING.packs[length]` you'd use within `PRICING.packWeeks`, priced per
  session.
- **Monthly membership**: `PRICING.member[length][perWeek - 1]` x sessions a week x 52 / 12, rounded to the dollar.

The cheapest of pack and membership is marked "Best value", and the saving against pay per session is shown per month
and per year. The results list is `aria-live="polite"`. Change prices in `PRICING` and in the tables on the page.

### Plan builder

`[data-plan-builder]` on `tools.html` builds an illustrative week from four radio groups: days a week (2 to 5), goal,
equipment (`gym`, `dumbbells`, `bodyweight`) and session length (30, 45 or 60 minutes, showing 3, 4 or 5 exercises).
Training days come from `PLAN_DAYS`, the session focus for each day from `SPLITS[goal][days]`, exercises from
`FOCUS` (each exercise is `[gym, dumbbells, bodyweight]`) and the sets and reps from `SCHEMES` or the focus's own
`scheme`. Rest days are filled in automatically. The postpartum goal shows an extra safety note.

The inputs are saved under `kinetic-plan` and restored on the next visit. **Print** calls `window.print()` (the print
styles hide the header and footer); **Reset** clears the saved plan.

### One-rep max and pace calculators

`[data-orm]` estimates a one-rep max with the Epley formula (weight x (1 + reps / 30), or the weight itself for one
rep), rounded to 2.5 kg or 5 lb, and lists 60 to 95% training weights from `ORM_TABLE`. Reps are limited to 1 to 12.

`[data-pace]` turns a distance (5K, 10K, half marathon, marathon or a custom distance up to 155 miles) and a finish time into pace per mile, pace per km and speed in miles per hour, plus finish times for the standard distances at the same pace.

### Studio hours and open-now status

Every `[data-hours]` list highlights today's row, and every `[data-open-status]` badge shows "Open now · until 8:30 PM" or "Closed · opens tomorrow 6:00 AM", based on `HOURS` and `CLOSED_DATES` in Mountain Time. They refresh every minute.

### Small extras

- **Mobile menu**: `[data-menu-button]` toggles `#mobile-menu`, updates `aria-expanded` and its label, and closes on
  Esc, outside clicks or link clicks.
- **Scroll reveals**: `.reveal` and `.reveal-x` elements fade in once; revealing one also reveals everything above it.
  Turned off with reduced motion.
- **Ticker**: the scrolling goal band on the home page is decorative (`aria-hidden`) and stops with reduced motion.
- **Back to top**: created by the last block in `main.js`; delete that block and the `.back-to-top` styles to remove it.

## Forms

There are two forms. Both validate in the browser with inline errors (linked with `aria-describedby`), focus the first
invalid field and **don't send anything** until you connect them.

| Form | Validates |
|------|-----------|
| Contact (`contact.html`, `[data-contact-form]`) | Name, email format, optional phone (at least 10 digits if filled), interest, reply method, message of 10+ characters, consent |
| Booking (`book.html`, `[data-booking] form`) | Session, time, name, email, cell phone, all seven health questions, consent |

Validation rules come from HTML attributes on fields with `data-validate`: `required`, `type="email"`, `minlength`,
`data-phone`, plus `data-label` and `data-required-msg` for the messages.

The confirmations read as if the message or booking went through: they show a short reference (`FP-` and four
characters) made in the browser by `makeRef()` in `main.js`, and say what happens next (a reply within one business day, the coach confirming a booking by email and text, a call-back within one business day after a health "yes").
If your form service or booking system returns its own reference, show that instead, and change those promises to
match how you actually work.

To connect the contact form to [Formspree](https://formspree.io) (or any service that accepts a POST), give the form an
action:

```html
<form action="https://formspree.io/f/yourid" method="POST" class="mt-7 grid gap-5 sm:grid-cols-2" novalidate data-contact-form>
```

Then, in the "Contact form" block of `assets/js/main.js`, replace the success code inside the submit handler with a
real request:

```js
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validateFields($$('[data-validate]', form))) return;
  fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    .then(function (res) {
      if (!res.ok) throw new Error('Send failed');
      var done = $('[data-form-success]', form.parentNode);
      $('[data-success-name]', done).textContent = form.elements.name.value.trim().split(' ')[0];
      $('[data-success-ref]', done).textContent = makeRef('FP');
      form.hidden = true;
      done.hidden = false;
      done.focus();
    })
    .catch(function () { toast('Sorry, that didn’t send. Please call (719) 555-0146.'); });
});
```

For bookings, connect a real booking system rather than a form service: replace `slotsFor()` with a call to your
availability API (and set `BOOKING.demoBusyShare` to `0`), and in the booking `submit` handler POST the session,
`state.slot` and the form data before showing step 5. Many booking platforms offer an embed instead; you can replace
the booking section of `book.html` with it and keep the rest of the site.

## Saved data (localStorage)

| Key | Shape | Written by | Validation on read |
|-----|-------|-----------|--------------------|
| `kinetic-goal` | JSON string, one of `"strength"`, `"fatloss"`, `"mobility"`, `"sport"`, `"postnatal"` | Goal picker and goal filters | Ignored unless it is a string that matches a `GOALS` key |
| `kinetic-plan` | `{ "days": 3, "goal": "strength", "equipment": "gym", "minutes": 45 }` | Plan builder | Every field is checked against `PLAN_DAYS`, `GOALS`, `EQUIPMENT` and 30/45/60; an invalid value is removed |

Nothing else is stored; booking and contact details are never saved. To reset, use **Reset** on the plan builder or
clear the site's storage in the browser's developer tools. Every read and write is wrapped in `try`/`catch`, so the
site works when storage is blocked.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags (`og:title`, `og:description`, `og:image`,
`og:locale`), `twitter:card` and `theme-color` in its `<head>`. `404.html` is `noindex`.

Social sites need an absolute image URL. After you deploy, change `og:image` on every page:

```html
<meta property="og:image" content="https://www.foothillperformance.example/assets/img/og-image.png">
```

Also consider:

- a `sitemap.xml` listing the eight public pages and a `robots.txt` that points to it;
- `<link rel="canonical">` on each page once you know the final URLs;
- `LocalBusiness` or `ExerciseGym` structured data (JSON-LD) with your address, phone and opening hours.

## Accessibility

Built in:

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page and a logical heading order.
- Visible focus styles on every control; the mobile menu exposes `aria-expanded` and closes with Esc.
- Native radio groups for the goal picker, session, coach, time and health questions; filters use `aria-pressed`
  buttons; the calculator, filters, booking and plan builder announce changes with live regions.
- Charts have text summaries; decorative SVG is `aria-hidden`; meaningful images have `alt` text.
- Color contrast meets WCAG AA for text; flare (`#ff5a33`) is only used behind dark text or as decoration.
- `prefers-reduced-motion` turns off reveals, the ticker, floating cards, chart drawing and smooth scrolling.

When editing, keep one `h1` per page, give every new input a `<label>`, keep `aria-labelledby` and
`aria-describedby` pointing at ids that exist, and check contrast if you change colors.

## Building and deploying

The compiled CSS is included, so you can deploy as is. To rebuild it after changing `src/input.css` or using new
Tailwind classes in the HTML or JavaScript (Node.js 24):

```sh
npm install
npm run build   # one-off, minified
npm run watch   # rebuild on every change while you work
```

Tailwind scans the HTML and `assets/js/main.js` for class names; classes built from strings in JavaScript must appear
in full somewhere in those files.

To deploy, upload the whole folder (you can leave out `src/`, `package.json` and the Markdown files) to any static
host: Netlify Drop, Cloudflare Pages, GitHub Pages, Vercel or plain web hosting. There is no server code.

## Troubleshooting

**The week view says "No times left this week".** Times need `notice` minutes of warning and are limited to coach
shifts. Check `COACHES[...].shifts`, `HOURS` and `CLOSED_DATES`, and remember the demo hides about 45% of times
(`BOOKING.demoBusyShare`).

**Times look an hour off.** The site always uses `STUDIO.timeZone`. If your studio isn't in Mountain Time, change it to your IANA zone (for example `America/Chicago`) and update `STUDIO.zoneName` and the "Mountain Time" notes in the HTML.

**New Tailwind classes have no effect.** The CSS is precompiled. Run `npm install` and `npm run build`.

**The goal picker or plan builder opens with an old choice.** It's restored from `localStorage`. Use Reset on the
plan builder, or remove `kinetic-goal` / `kinetic-plan` in the browser's storage settings.

**`?goal=` links don't filter.** The value must be one of the `GOALS` keys (`strength`, `fatloss`, `mobility`,
`sport`, `postnatal`). Anything else shows all items.

**The social preview has no image.** `og:image` must be an absolute `https://` URL to the PNG (not the SVG).

**A chart is empty.** The `data-chart` value must match a key in `RESULTS`, and the figure needs a
`<div data-chart-svg>` inside it.

## License

MIT. Free for personal and commercial use, including client work. The full license is in `LICENSE.txt` in the
download. All artwork (the athlete pictograms, portraits, studio illustration, map, icons and social image) is original
to this template and covered by the same license. Foothill Performance, its coaches, clients, reviews and prices are
fictional.
