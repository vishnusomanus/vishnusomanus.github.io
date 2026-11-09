# Brief documentation

## Overview

Brief is a website template for a solo lawyer or attorney. The demo content is for **Pennington
Employment Law**, the fictional Dayton, Ohio, practice of independent employment attorney Tessa Pennington, who
advises employees and senior staff on severance agreements, layoffs, wrongful termination, discrimination and
problems at work, mostly for fixed fees. It is built with plain HTML5, Tailwind CSS v4 and one vanilla
JavaScript file with no dependencies. This is version 1.0.8 (see [CHANGELOG.md](CHANGELOG.md)). Live demo:
[freeframe.dev/templates/brief](https://freeframe.dev/templates/brief).

The sample copy is general information about employment law in Ohio and under federal law, written for a fictional
practice. Before you publish, have a qualified lawyer in your jurisdiction review every legal statement, fee,
time limit and regulatory detail, and replace the placeholders (registration number, insurance, complaints
procedure) with your own.

## Quick start

1. Unzip the download and open `index.html` in a browser. Every page works from the file system; nothing needs
   installing.
2. To preview over HTTP (closer to production), serve the folder with any static server, for example:

   ```sh
   npx serve .
   ```

3. You only need Node.js 24 if you change `src/input.css` or add Tailwind classes that are not used anywhere yet.
   See [Building and deploying](#building-and-deploying).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with the plain-English promise, portrait and "Book a free 15-minute call", credentials strip, four areas of help, four-step "how working together works", fixed-fee teaser, client reviews with a disclaimer, FAQ accordion, call to action |
| `services.html` | Services | Eight services with what's included, typical timeline and fee; filter chips by area with live counts and a shareable `?area=` URL |
| `fees.html` | Fees | Fee estimator (matter, complexity, employer contribution, payment plan), full fee table, staged lawsuit fees, employer contributions, payment plans and insurance |
| `check.html` | Check your options | Branching questionnaire with plain-English results, and a claim deadline calculator |
| `resources.html` | Guides | Featured guide, topic filters, search, empty state, shareable `?tag=` and `?q=` URLs |
| `article.html` | Sample guide | Long-form article with breadcrumb, reading progress bar, sticky table of contents, not-legal-advice notices, author box and related guides |
| `about.html` | About | Story, three promises, credentials timeline, office illustration and hours, regulation, insurance, complaints and confidentiality (`#regulation`) |
| `book.html` | Book a call | Four-step booking flow with a live summary sidebar, plus a short message form |
| `404.html` | Not found | Struck-out page illustration and links back into the site |

## Project structure

```text
brief/
  index.html, services.html, fees.html, check.html,
  resources.html, article.html, about.html, book.html, 404.html
  assets/
    css/style.css          compiled Tailwind CSS (generated, do not edit by hand)
    js/main.js             all interactivity: data constants at the top, then one block per feature
    img/favicon.svg        logo mark, used as the favicon
    img/og-image.svg       social sharing image source (1200 x 630)
    img/og-image.png       the same image as PNG, referenced by og:image
    img/tessa-portrait.svg illustrated portrait (480 x 560)
    img/office.svg         office and river illustration on the about page (640 x 460)
  src/input.css            Tailwind source: brand tokens (@theme) and component classes
  package.json             npm scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

All colors are tokens in the `@theme` block at the top of `src/input.css`. Tailwind turns each one into
utilities (`bg-ink`, `text-pine`, `border-line` and so on), so changing a token changes it everywhere.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-paper` | `#f5f3ec` | Page background |
| `--color-paper-2` | `#ece9df` | Sunken panels, tags |
| `--color-card` | `#fffdf8` | Cards and inputs |
| `--color-line` / `--color-line-strong` | `#dcd8ca` / `#bfb9a6` | Hairlines and input borders |
| `--color-ink` | `#13221c` | Text, primary buttons, dark sections |
| `--color-ink-2` / `--color-ink-3` | `#1c3229` / `#2c473b` | Raised surfaces and hovers on ink |
| `--color-slate` | `#4c5852` | Secondary text (AA on paper and card) |
| `--color-slate-soft` | `#b6c4bb` | Secondary text on ink |
| `--color-pine` / `--color-pine-soft` | `#1f5a43` / `#dfe9e2` | Links, icons and icon tiles |
| `--color-lime` / `--color-lime-soft` / `--color-lime-deep` | `#d4eb5c` / `#edf6bd` / `#b8d13a` | The highlighter accent: marks, chips, buttons on ink |

The lime accent is a fill color. Don't use it for text on light backgrounds; use `text-pine` or `text-ink`.
To change the accent, for example to a warm coral:

```css
@theme {
  --color-lime: #ffb199;
  --color-lime-soft: #ffe1d6;
  --color-lime-deep: #f2896b;
}
```

The SVG files in `assets/img/` and the inline SVGs (logo, page illustrations) use the hex values directly;
search for `#d4eb5c` and `#13221c` to update them too. Then rebuild the CSS.

### Typography

Two Google Fonts are loaded by the `<link>` in the `<head>` of every page:

- **Literata** (`--font-serif`, used through `font-serif` and the `.display` class) for headings, prices and
  quotes.
- **Albert Sans** (`--font-sans`) for everything else.

To swap them, change the Google Fonts URL on every page and the two `--font-*` tokens in `src/input.css`. Both
tokens include system fallbacks, so the site still reads well if the fonts fail to load.

### Content

Most text lives directly in the HTML pages. The data that drives the interactive features lives at the top of
`assets/js/main.js`:

| Constant | What it holds | Used by |
|----------|---------------|---------|
| `MATTERS` | Each matter's name, area, timeline, whether an employer contribution applies, three `levels` (`[min, max]` in US dollars) and three `hints` | Fee estimator, options check results, booking topics |
| `LEVELS` | `['straightforward', 'standard', 'complex']`, the `?level=` values | Fee estimator |
| `PLAN` | `{ minFee: 1000, months: 3 }` | Payment plan in the estimator |
| `CHECK_STEPS` | The questions of the options check | Options check |
| `CHECK_RESULTS` | The 15 result screens | Options check |
| `DEADLINE_RULES` | Claim types and their time limits in months | Deadline calculator |
| `CALL_TYPES` | Booking call types: label, minutes, price, where | Booking flow |
| `AVAILABILITY` | Time zone, weekly hours, notice, closed days | Booking flow |

To add a matter, add an entry to `MATTERS`:

```js
vacation: { name: 'Vacation pay claim', area: 'Claims and disputes', timeline: '1–2 weeks', contribution: false, levels: [[300, 300], [1250, 1250], [1000, 2500]],
  hints: ['Checking your figures', 'Plus a letter to your employer', 'Several years of underpayment'] },
```

It then appears in the estimator's matter list and the booking topic list. Also add a card to
`services.html` (copy an existing `<li id="...">` and give it the same key as its `id`) and a row to the fee
table in `fees.html`, so the static pages match the estimator.

Services on `services.html` are plain HTML. Each card is an `<li>` with an `id` (used by links such as
`services.html#settlement`) and a `data-tags` value naming its area (`leaving`, `at-work`, `disputes` or
`new-job`). Guides on `resources.html` are `<li data-guide data-tags="..." data-text="...">` items; `data-text`
holds extra search words that aren't visible on the card.

### Images and artwork

All artwork is SVG, so it stays sharp and light:

- `assets/img/tessa-portrait.svg` (480 x 560) is the portrait on the home and about pages, and is cropped to a
  circle or square on the article and booking pages. To use a photo, keep a 6:7 portrait crop and replace the
  `src`; the `object-cover object-top` classes keep the face in view in the small crops.
- `assets/img/office.svg` (640 x 460) on the about page.
- Inline SVGs: the logo mark in the header and footer, the document drawings in the call to action, options
  check, featured guide and 404 page, and every icon.
- `assets/img/og-image.svg` is the source of the social image. Social networks need a PNG, so export it to
  `assets/img/og-image.png` at 1200 x 630 after editing (any vector editor or a headless browser).
- `assets/img/favicon.svg` is the favicon.

### Navigation, header and footer

The header, mobile menu, call to action and footer are repeated in every page, so menu changes need to be
made in each file. The current page's links carry `aria-current="page"`, which also draws the highlighter
underline. To add a page, copy an existing page, change its `<title>`, description and Open Graph tags, add
it to the `<nav aria-label="Main">` list, the `#mobile-menu` list and the footer, and set `aria-current` on
the new page's own links.

The footer holds the not-legal-advice notice and the regulatory statement. Keep both on every page, and
replace the placeholder registration number with your own.

## Features

### Fee estimator

On `fees.html` (`#estimator`), inside `[data-estimator]`. Code: `initEstimator()` in `main.js`.

- The matter list is built from `MATTERS`. The three level cards (`input[name="est-level"]`, values `0`-`2`)
  show the matter's `hints`.
- When `min` equals `max` the result shows a fixed fee with a "Fixed fee" tag; otherwise a range with a
  "Range: fixed in writing before work starts" tag.
- The breakdown always lists the fee, any employer contribution and what you pay.
- **My employer is contributing** only appears for matters with `contribution: true` (severance agreements
  and exit negotiations). The amount (default 500) is deducted from the fee, never below zero.
- **I'd like to spread the cost** shows `PLAN.months` equal payments when the amount you pay (after any contribution) is at least `PLAN.minFee`, and otherwise explains why it isn't available.
- The matter and level are written to the URL (`fees.html?matter=tribunal&level=complex`), so links such as
  "Estimate this fee" on the services page open the right estimate.

The result is announced politely to screen readers (`aria-live`). Every control is a native select, radio,
checkbox or number input, so it works with a keyboard.

### Options check

On `check.html`, inside `[data-check]`. Code: `initCheck()`, `replayCheck()` and `readCheck()`.

Each step in `CHECK_STEPS` has a question `q`, an optional `hint` and `options`. An option has either `next`
(another step id) or `result` (a key of `CHECK_RESULTS`). The first step is always `start`. A result has a
`tag`, `title`, `summary`, `steps`, an optional `urgent` message, a `service` (a `MATTERS` key, or `null`) and
a `deadline` (a `DEADLINE_RULES` key, or `null`).

The result screen shows the summary and next steps, an amber "Time-sensitive" box when `urgent` is set, the
recommended service with its lowest fee and links to the services page, estimator and booking
(`book.html?topic=<service>`), a "There may be a time limit" prompt that preselects the right claim type in
the calculator, and a collapsible recap of the answers. Back and Start again buttons let visitors change
their answers.

To add a branch, add a step and point an option at it:

```js
'warn-stage': { q: 'Has the layoff happened yet?', hint: '', options: [
  { label: 'Not yet', result: 'general' },
  { label: 'Yes', result: 'general' }] },
```

Each question is a `<fieldset>` with a `<legend>` that receives focus when it appears; answers are radio
buttons styled as cards. A missing answer shows an inline error with `role="alert"`.

### Deadline calculator

On `check.html` (`#deadline`), inside `[data-deadline]`. Code: `deadlineFrom()` and the block after it.

Each claim type in `DEADLINE_RULES` has `days` or `months`. A rule in days counts from the date (300 days from March 15 is January 9). A rule in months ends the day before the same date that many months later, or on the final day of that month if it has no such date. The two 300-day rules follow the EEOC charge deadline in Ohio; the two-year rules follow the Ohio Civil Rights Commission and federal wage limits. The result shows the date, the number of days left ("1 day", "12 days"), and warnings when the date is
21 days away or less, today, or has passed. Dates must be within the last two years or the next six months.

This is an estimate only and says so on screen. It doesn’t model continuing violations, tolling or late-claim exceptions, and it doesn't store anything.

### Booking flow

On `book.html`, inside `[data-booking]`. Code: `initBooking()`.

1. **Call type** from `CALL_TYPES`. `book.html?type=advice` preselects one.
2. **Date and time**: a month calendar (Monday first) and time slots generated from `AVAILABILITY`: weekly
   `hours` windows in Eastern time, `slotStep` minutes apart, at least `minNoticeHours` from now, up to
   `daysAhead` days ahead, skipping
   US federal holidays (worked out for any year by `federalHolidays()`) and any `closed` dates. `demoBusyShare` hides a stable share of slots so the demo
   looks realistic; set it to `0` when you connect a real calendar.
3. **Details**: name, email, optional phone, topic (`book.html?topic=settlement` preselects it), the
   conflict-check fields (employer, required; anyone else involved, optional), an optional deadline, a short
   description and a required acknowledgment that booking doesn't create a client relationship.
4. **Confirmation** with a summary, a short reference (see [Forms](#forms)), what to do to change the time and a
   **Save a calendar hold (.ics)** button.

Times are always generated in `America/New_York`, so they follow US daylight saving time. If the visitor's device is
in another time zone, each slot also shows their local time, and so do the summary and confirmation.

The calendar is a table of buttons with a roving `tabindex`: arrow keys move by day and week, Home and End to
the start and end of the week, Page Up and Page Down by four weeks. Unavailable days are `aria-disabled`, the
chosen day is `aria-pressed`, and each day has a full label such as "Tuesday, October 20, 2026, 9 times
available". Each step's heading receives focus when the step opens.

### Filters and search

- **Services** (`[data-filter-root]` on `services.html`): chips with `data-filter` show cards whose
  `data-tags` contain the value, update the counts and the "8 services shown" status, and keep the choice in
  `?area=`.
- **Guides** (`[data-guides]` on `resources.html`): topic chips (`data-tag`) and the search box combine. Search
  matches every word against the card text and its `data-text`. Both are kept in the URL as `?tag=` and `?q=`.
  When nothing matches, an empty state offers to clear everything.

Chips are buttons with `aria-pressed`, and the result counts are in a polite live region.

### Article reading aids

On `article.html`, `[data-progress]` is the bar at the top of the window; it fills as you scroll through
`[data-article]`. The table of contents (`[data-toc]`) marks the section you're reading with
`aria-current="true"`. Each `<h2>` in the article needs an `id` that matches a TOC link.

### FAQ accordion, scroll reveals and motion

Accordion buttons (`.acc-btn`) toggle the panel named in `aria-controls` and update `aria-expanded`.
Elements with `.reveal` fade in as they scroll into view, and the hero highlighter (`.draw-mark`) draws in
once. With "reduce motion" turned on, everything appears immediately.

### Header, mobile menu and back to top

The header gains a border once you scroll. Below 1024px the menu button opens `#mobile-menu`; Escape closes it
and returns focus to the button. The back-to-top button appears after about one screen of scrolling and hides
while the footer's "Back to top" link is visible.

## Forms

There are three forms. None of them sends anything until you connect it, even though the booking confirmation
and the message form's thank-you read as if it had been. Both show a short reference (`PE-` and four characters)
made in the browser by `makeRef()` in `main.js`; if your form service or booking tool returns its own reference,
show that instead. They promise a reply or confirmation within one business day, as the rest of `book.html` does:
change them all if yours differs.

| Form | Where | Validates |
|------|-------|-----------|
| Booking details (`[data-booking-form]`) | `book.html`, step 3 | Name, email, optional phone (10+ digits), topic, employer, description (20+ characters), acknowledgment |
| Message (`[data-contact-form]`) | `book.html` | Name, email, message (20+ characters) |
| Deadline calculator (`[data-deadline]`) | `check.html` | A date within the last two years or the next six months |

Validation runs on submit and again as fields are corrected. Each field declares its rule with
`data-validate` (`required`, `email`, `phone-optional`, `message`, `consent`, `date-event`). Errors appear
under the field, are linked with `aria-describedby`, set `aria-invalid="true"`, and focus moves to the first
invalid field.

### Connecting to Formspree

Create a form at Formspree, then replace the marked comment in the `[data-contact-form]` submit handler in
`main.js`:

```js
fetch('https://formspree.io/f/your-id', {
  method: 'POST',
  body: new FormData(cf),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (!res.ok) throw new Error('Send failed');
  // show the success panel here
}).catch(function () {
  alert('Sorry, your message could not be sent. Please email or call instead.');
});
```

Move the lines that hide the form and show `[data-success]` into the `then` callback. The booking form has the
same marked comment in its submit handler.

### Taking real bookings

The simplest route is a scheduling tool such as Cal.com or Calendly: replace the step 2 calendar with the
tool's embed, or send people straight to your booking link from step 1. If you keep this calendar, post the
details form to your form service (as above, using `new FormData(form)`) and add the chosen slot:

```js
var data = new FormData(form);
data.append('call_type', state.type);
data.append('start', state.slot.at.toISOString());
```

Set `AVAILABILITY.demoBusyShare` to `0`, and add any other days off to `closed`.

Because inquiries can contain sensitive personal information, use a form service that stores data in a
suitable region, and say in your privacy notice how you handle it.

## Saved data (localStorage)

| Key | Shape | Written by |
|-----|-------|------------|
| `brief-check-v1` | `{ "answers": [0, 1], "date": "2026-10-15" }` | Options check, when a result is reached |

`answers` holds the chosen option index for each question in order. On load, `readCheck()` replays the
answers through `CHECK_STEPS`; if any index is out of range, or the answers don't end in a result, the saved
value is ignored and the intro is shown. If you change the questions, bump the key (for example to
`brief-check-v2`) so old answers are dropped. **Start again** removes the key; visitors can also clear site
data in their browser. Nothing else is stored, and nothing is sent anywhere.

## SEO and sharing

Every page has its own `<title>`, meta description, `theme-color` and Open Graph tags in the `<head>`. Update
them when you change a page's content. `og:image` points to `assets/img/og-image.png`; many social networks
need an absolute URL, so once you know your domain change it on every page:

```html
<meta property="og:image" content="https://www.example.com/assets/img/og-image.png">
```

Also consider adding a `sitemap.xml` listing the eight content pages, a `robots.txt`, a canonical link on each
page, and `LegalService` structured data (JSON-LD) on the home page with your real name, address, phone and
business hours. Check your state bar’s rules on advertising, reviews and how fees must be published.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page and a logical heading order.
- Visible focus outlines; colors meet WCAG AA (body text `slate` on `paper` is about 7:1).
- Native form controls with labels, hints linked by `aria-describedby`, inline errors and focus management.
- Accessible patterns: mobile menu (`aria-expanded`, Escape), accordion, chips (`aria-pressed`), live regions
  for counts and the estimate, keyboard calendar, focus moved to new steps and results.
- `prefers-reduced-motion` turns off reveals, the highlighter animation and smooth scrolling.

When editing, keep one `<h1>` per page, give every new input a `<label>`, and keep text on `lime` dark
(`text-ink`).

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` is generated by Tailwind from `src/input.css` and the classes used in the HTML and
`main.js`. Rebuild it after changing tokens or using new classes (Node.js 24):

```sh
npm install
npm run build   # once, minified
npm run watch   # rebuild on every change while you work
```

Classes that only appear inside JavaScript strings must still be written out in full in `main.js` so Tailwind
can find them.

### Deploying

The site is static: upload the folder as it is. Netlify Drop, GitHub Pages, Cloudflare Pages, Vercel or any
web host will serve it. `src/`, `package.json` and the Markdown files aren't needed on the server, but are
harmless. Most hosts serve `404.html` automatically for missing pages.

## Troubleshooting

- **New Tailwind classes have no effect.** Run `npm run build`; the compiled CSS only contains classes it found
  when it was last built.
- **The fee estimator, check or booking shows nothing.** Check the browser console. A typo in `MATTERS`,
  `CHECK_STEPS` or `CALL_TYPES` (a missing comma or quote) stops all of `main.js`.
- **An option in the check leads nowhere.** Every `next` must name a key of `CHECK_STEPS`, and every `result`
  a key of `CHECK_RESULTS`.
- **The check keeps showing an old result.** It's saved in `localStorage`. Click **Start again**, or bump
  `CHECK_KEY` after changing the questions.
- **The booking calendar has no free days.** Check `AVAILABILITY.hours` (day 0 is Sunday), `minNoticeHours`,
  `daysAhead` and `closed`, and that `demoBusyShare` is below 1.
- **Booking times look an hour out.** Slots are in `America/New_York` and follow US daylight saving time. Change
  `AVAILABILITY.timeZone` and `zoneName` if you practice elsewhere.
- **A form shows its thank-you message but nothing arrives.** It sends nothing until you connect it; see
  [Forms](#forms).
- **The social preview has no image.** Use an absolute `og:image` URL and make sure `og-image.png` was
  uploaded.

## License

MIT, like every Freeframe template: free for personal and commercial use. See `LICENSE.txt` in the download.
The SVG illustrations, portrait and icons are original artwork included under the same license.
