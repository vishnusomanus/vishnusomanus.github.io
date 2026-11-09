# Loftwing documentation

## Overview

Loftwing is a multi-page, waitlist-first launch site for a startup. Its fictional brand is an email marketing
platform for independent newsletters and small online shops, based in Spokane, Washington, and still in private
beta, so every page leads to one goal: joining the waitlist for the public launch. It's built with HTML5, Tailwind
CSS v4 and vanilla JavaScript, with no runtime dependencies. This guide covers version 1.0.1. The template page, with
a link to the live demo, is at <https://freeframe.dev/templates/loftwing>.

## Quick start

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8080
```

Then visit `http://localhost:8080`. Google Fonts need an internet connection. No install or build is needed to view
or edit the HTML and JavaScript. You only need Node 24 if you add new Tailwind classes and want to rebuild the CSS
(see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|------------------------------|
| `index.html` | Home | Waitlist form, live countdown, campaign editor and inbox mockup, subject-line tester, beta proof, six tool cards, quotes, cohort timeline, closing form |
| `product.html` | Product tour | Five tabs: Loft Editor (preview size), Flightpaths (viewer), Flocks (segment builder), Homing Check (warm-up planner), Logbook (chart) |
| `waitlist.html` | The join flow | Four-field form, invite banner, your spot panel, invite link with copy, tier progress, invites accepted, FAQ |
| `pricing.html` | Founding pricing | Calculator, three plan cards, comparison table, FAQ |
| `migrate.html` | Switch to Loftwing | Estimator with a saved checklist, hands-on time and warm-up days |
| `roadmap.html` | Launch roadmap | 18 items in three columns, one vote per item, status filter, sorting |
| `journal.html` | Build journal | Nine dated entries, topic filter, expandable text |
| `about.html` | Company and contact | Story, stance, team avatars, office address, contact form with a reference number |
| `404.html` | Page not found | The lost pigeon and links back to the main pages |

## Project structure

```text
loftwing/
  index.html, product.html, waitlist.html, pricing.html,
  migrate.html, roadmap.html, journal.html, about.html, 404.html
  assets/css/style.css   compiled Tailwind output (generated, committed)
  assets/js/data.js      all content the features read (window.LOFTWING)
  assets/js/main.js      menus, reveals, dates and every interactive feature
  assets/img/            favicon.svg, og-image.svg, og-image.png
  src/input.css          Tailwind source: brand tokens and a few components
  package.json           lets you rebuild the CSS
  README.md              short introduction
  DOCS.md                this guide
  CHANGELOG.md           the template's own changelog
  LICENSE.txt            added to the download
```

## Customizing

### Brand and colors

Design tokens live in the `@theme` block of `src/input.css` and become Tailwind utilities such as `bg-night`,
`text-apricot` and `border-wire`.

| Token | Value | Use |
|-------|-------|-----|
| `--color-night` | `#0f0a1e` | Page color and text on bright buttons |
| `--color-plum` | `#241238` | Solid raised surfaces: the mobile menu, table group rows |
| `--color-dusk` | `#3a1d52` | Tracks and quiet fills |
| `--color-mist` | `#f7f1fb` | Headings and body text |
| `--color-haze` | `#d6cbe3` | Secondary text |
| `--color-fog` | `#b8abc9` | Captions and meta |
| `--color-wire` | `#8c7da6` | Field borders and chart axes |
| `--color-coral` | `#ff8f70` | Warm accent for buttons, marks and charts |
| `--color-apricot` | `#ffcb9e` | Warm accent for text on glass, selected states, focus ring |
| `--color-iris` | `#b9b1ff` | Cool accent for text and marks |
| `--color-iris-deep` | `#6f61e8` | Cool accent for fills |
| `--color-leaf` | `#9be8c2` | Success, always with a word |
| `--color-rose` | `#ffb4bc` | Errors, always with a word |
| `--color-honey` | `#ffe08a` | Caution, always with a word |

To change the warm accent, edit the two tokens and rebuild:

```css
--color-coral: #ff7a90;
--color-apricot: #ffc3cf;
```

The dusk sky is the `.sky` component in `src/input.css`: one fixed layer of soft gradients that drifts slowly. A few
inline SVGs and `main.js` chart strings use the hex values directly, so search for them if you change the palette
completely. If you brighten the sky, check the contrast of `text-fog` and `text-haze` on `.glass` panels as they
scroll over its brightest part.

Blur is used on purpose in only two places, the header bar and the hero mockup. Other panels use `.glass`, which is
translucent without `backdrop-filter`, so scrolling stays smooth.

### Typography

Red Hat Display sets the headings, Sen the body text and Overpass Mono the numbers and labels. They load from a Google
Fonts `<link>` in each page's `<head>` and are named in `--font-display`, `--font-sans` and `--font-mono` in
`src/input.css`. To swap one, change the link on every page and the matching token, then rebuild the CSS.

### Content

Fixed page copy is in the HTML. Everything the features read is in `assets/js/data.js`, on `window.LOFTWING`:

| Constant | What it holds |
|----------|---------------|
| `DEMO` | `KEEP_DEMO_CURRENT`, `MIN_WEEKS`, `FIXED_LAUNCH`, `LAUNCH_HOUR`, `TIME_ZONE`, `COHORT_WEEKS`, `FOUNDING_DAYS_BEFORE` |
| `WAITLIST` | `BASE`, `PER_REFERRAL`, `TIERS`, `WAVES`, `LIST_SIZES` |
| `TOOLS` | The kinds of tool people move from, shared by the waitlist and the estimator |
| `SUBJECT` | Every rule and penalty the subject-line tester uses, plus `SPAM_WORDS` and `GRADES` |
| `PRICING` | `BANDS`, `PLANS`, `COMPARE`, `ANNUAL_DISCOUNT`, `FOUNDING_DISCOUNT`, `OVERAGE_PER_THOUSAND_CENTS`, `DEFAULTS` |
| `MIGRATION` | `STEPS`, `SOURCES`, `SOURCE_NOTES`, `WARMUP`, `DEFAULTS`, `MAX_SIZE` |
| `ROADMAP` | `STATUSES` and `ITEMS` |
| `JOURNAL` | `TOPICS` and `ENTRIES` |
| `AUTOMATIONS`, `SEGMENTS`, `ANALYTICS` | The product tour's Flightpaths, Flocks and Logbook figures |

To add a roadmap item, add an object to `ROADMAP.ITEMS`. The `id` must be unique, since saved votes refer to it:

```js
{
  id: "inbox-preview",
  status: "next", // shipped, beta or next
  votes: 88,
  area: "Editor",
  title: "Inbox previews",
  body: "See your issue in the common mail apps before you send it.",
},
```

If you add a journal topic, add a filter button with `data-journal-filter` to `journal.html` as well.

### Images and artwork

All artwork is inline SVG, drawn for this template. Each page has its own scene (the flock on `product.html`, the
banded pigeon on `waitlist.html`, the three lofts on `pricing.html`, the basket and route on `migrate.html`, the
weather vane on `roadmap.html`, the logbook on `journal.html`, the loft at dusk on `about.html` and the lost pigeon on
`404.html`). Journal topics use the `TOPIC_ART` map in `main.js`. To use a photo instead, replace an SVG with an
`<img>` of about the same aspect ratio, for example 2:1 for the product hero and 13:8 for the about scene. The social
image is `assets/img/og-image.png` (1200 by 630), generated from `assets/img/og-image.svg`. The favicon is
`assets/img/favicon.svg`.

### Navigation, header and footer

The header and footer are repeated in each HTML file. To add a page, copy an existing file, add a link to the `<nav>`
and `#mobile-menu` lists and the footer on every page, and put `aria-current="page"` on the link in the new file. The
header's waitlist button has `data-spot-cta`, and `refreshSpotCallouts()` in `main.js` changes it to "Your spot: No.
18,413" once a visitor has joined.

### Dark mode

The template is dark only, and `color-scheme: dark` is set in `src/input.css`. There's no light theme or toggle.

## Features

### Launch date and rolling dates

Launch dates must never read as past, so they are worked out from today in `main.js` (`rollingLaunchDay`). While
`DEMO.KEEP_DEMO_CURRENT` is `true`, the launch is **the second Tuesday of the first month whose second Tuesday is at
least `MIN_WEEKS` (16) weeks away**, at `LAUNCH_HOUR` (9:00 AM) in `America/Los_Angeles`. On November 4, 2026 that
gives the written text, Tuesday, March 9, 2027.

| Date | Rule | On November 4, 2026 |
|------|------|---------------------|
| `launch` | The rule above | Tuesday, March 9, 2027 |
| `foundingEnd` | `FOUNDING_DAYS_BEFORE` (1) day before launch | Monday, March 8, 2027 |
| `cohort5` | `COHORT_WEEKS.cohort5` (12) weeks before launch | Tuesday, December 15, 2026 |
| `cohort6` | 8 weeks before launch | Tuesday, January 12, 2027 |
| `cohort7` | 4 weeks before launch | Tuesday, February 9, 2027 |

Any element with `data-date="launch"` and `data-format` (`long`, `medium`, `short`, `monthDay` or `year`) is filled in
by `initDates()`. The text written in the HTML is the November 4, 2026 value. Elements with `data-year` get the current
year. Journal entries keep their real past dates.

**For a real launch:** set `KEEP_DEMO_CURRENT: false` and `FIXED_LAUNCH: "YYYY-MM-DD"` in `data.js`. Cohorts and
founding dates still follow from it, and after that moment the countdown changes to the `[data-cd-live]` message.
Update the dates written in the HTML to match, so visitors without JavaScript see the right text.

**Previewing:** add `?now=YYYY-MM-DDTHH:MM` to any page URL to see the site at that Pacific time, for example
`index.html?now=2027-03-10T09:00`. The clock keeps ticking from there. The parameter is validated, and anything else
is ignored.

### Countdown

`[data-countdown]` on the home page counts down to the launch instant in days, hours, minutes and seconds, in
`initCountdown()`. It has `role="timer"`, with no live announcement of each tick. If the launch has passed, which can
only happen with a fixed date, `[data-cd-cells]` hides and `[data-cd-live]` shows.

### Subject-line tester

`initSubjectTester()` and `scoreSubject()` in `main.js`, with the rules in `SUBJECT`. Every score starts at 90 and is
clamped to 0 to 100:

| Rule | Points |
|------|--------|
| 1 to 14 characters | -25 |
| 15 to 27 | -8 |
| 28 to 50 | +6 |
| 51 to 60 | -6 |
| 61 to 78 | -16 |
| 79 or more | -28 |
| Each spam word (whole phrase, any case) | -12, at most -36 |
| Each shouted word of 4+ capital letters | -8, at most -16 |
| The whole line in capitals (replaces shouted words) | -20 |
| One `!` | -3 |
| Two or more `!` | -10 |
| `$$` or `??` | -8 |
| Starts with `Re:`, `Fw:` or `Fwd:` | -15 |
| Two or more emoji | -6 |
| Contains a digit | +2 |
| Contains a merge tag such as `{{first_name}}` | +2 |

Grades: 85 and up is "Ready to send", 65 is "Worth a tweak", 40 is "Needs work", and below that is "Likely to hit the
filters". Previews cut after `MOBILE_LIMIT` (38) and `DESKTOP_LIMIT` (60) characters, counted by code point, with an
ellipsis. The grade and flags are in an `aria-live` region.

### Product tour

`initTabs()` gives the five tabs full keyboard support (arrow keys, Home, End) and reads `?tab=` (`editor`,
`automations`, `segments`, `deliverability`, `analytics`). Clicking a tab updates the URL. Each panel has its own small
tool:

- **Preview size** (`initDevicePreview`): `[data-device]` buttons switch the email between full width and phone width.
- **Flightpaths** (`initFlowViewer`): radios show a flow from `AUTOMATIONS`.
- **Flocks** (`initSegmentBuilder`): "all" multiplies the chosen `SEGMENTS.RULES` shares, and "any" uses
  `1 - product(1 - share)`, on a list of 12,480. For example, "Opened" alone is 7,738, "Opened" and "Clicked" is 2,089,
  and either one is 9,018.
- **Warm-up planner** (`initWarmupPlanner`): `MIGRATION.WARMUP` gives the days, and each day's volume is
  `round(size * (day / days)^2)`, reaching the full list on the last day.
- **Logbook** (`initAnalyticsChart`): radios redraw an inline SVG chart from `ANALYTICS.METRICS`.

### Waitlist and referrals

`initWaitlist()` in `main.js`. The form validates the address, publication name, list size and current tool, with
inline errors that clear as you correct them. Addresses are trimmed and lowercased.

- **Position:** a new spot starts at `WAITLIST.BASE + seq`, where `seq` counts spots ever created on this device and
  never goes back, so a first spot is No. 18,413 and a spot number is never reused.
- **Duplicates:** an address that's already on the list gets its existing spot, invites included. No other field is
  checked and no invite is credited.
- **Invite link:** `waitlist.html?ref=<code>`. The code is `LW` plus six characters from an FNV-1a hash of the
  address, in the alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ23456789`. `a@x.example` gives `LWSFASHK`.
- **Arriving with `?ref=`:** a valid code is remembered until the visitor joins. Joining with a new address credits the
  spot with that code, if it's known, once only, and never to itself. A visitor who opens their own link sees their spot
  and a note. From there, "Use a different address" lets them join a second address from the link, which does count.
- **Matching an invite:** the "Someone join without your link?" form in the spot panel adds an accepted invite by
  address. It refuses the visitor's own address and duplicates. This is what makes the tiers work without a server. On a
  real site, it would ask your backend whether that address joined.

Position is `start - accepted * PER_REFERRAL - jumps of the tiers reached`, and never below 1. `WAVES` then picks the
invite date:

| Invites | Tier | Jump | Starting at 18,413 | Invite with |
|---------|------|------|--------------------|-------------|
| 0 | None | | 18,413 | Public launch day |
| 1 | None | | 18,388 | Public launch day |
| 3 | Perch | 500 | 17,838 | Cohort 7 |
| 10 | Loft | 1,000 | 16,663 | Cohort 6 |
| 25 | Lead bird | 5,000 | 11,288 | Cohort 5 |

"Leave the waitlist" asks for confirmation first, then removes the spot from this device.

Accessibility: errors use `aria-invalid` and `aria-describedby`, focus moves to the first invalid field, then to the
spot heading after joining. The notice has `role="status"`, and the progress bar is a labeled `role="progressbar"`.

### Pricing calculator

`initPricing()` and `planQuote()` in `main.js`, reading `PRICING`.

- **List price:** the `BANDS` row for the list size, with inclusive tops, times the plan's `factor` (Solo 1, Shop 1.5,
  Press 2.2), rounded to a whole dollar.
- **Discounts** are worked out in whole cents, once: monthly is `list * (100 - founding)`. A year is
  `list * 12 * 85 * (100 - founding) / 100`, rounded. Annual per month is that divided by 12, rounded.
- **Founding discount:** 25%, plus the highest `extraDiscount` of the tiers a saved spot has reached (Loft +5, Lead bird
  +10).
- **Overage:** extra emails beyond `includedSends` per subscriber cost 40 cents per 1,000 or part of it. They aren't
  discounted, and they're added to the total.
- **Best fit:** the first plan whose `includedSends` covers the sends, otherwise Press.
- **Above 100,000 subscribers:** plan cards are replaced by a quote panel.

| Subscribers | Sends | Billing | Founding | Solo | Shop | Press |
|-------------|-------|---------|----------|------|------|-------|
| 5,000 | 4 | Monthly | Yes | $29.25 | $44.25 | $64.50 |
| 1,000 | 4 | Monthly | Yes | $9 | | $19.50 |
| 1,001 | 4 | Monthly | Yes | $18 | | |
| 1,000 | 4 | Annual | Yes | $7.65 ($91.80 a year) | | |
| 1,001 | 4 | Annual | Yes | $15.30 ($183.60 a year) | | |
| 1,001 | 4 | Annual | No | $20.40 | | |
| 1,001 | 4 | Monthly | No | $24 | | |
| 100,000 | 4 | Monthly | Yes | $276.75 | | $609 |
| 5,000 | 25 | Monthly | Yes | | | $74.50 (with $10 overage) |

An invalid number in the subscribers field shows an error and keeps the last good estimate. Moving the slider or
pressing Reset clears the error. The slider covers 100 to 100,000, and the field accepts any whole number up to
1,000,000.

### Migration estimator

`initMigration()` in `main.js`, reading `MIGRATION`. Each kind of tool in `SOURCES` lists its steps from `STEPS`. A
step's minutes are `minutes + scale.add * ceil(size / scale.per)`, and the "automations" checkbox removes the `rebuild`
step. `WARMUP` gives the warm-up days, with inclusive tops. When "Nothing yet" is selected, list size and automations
hide and the warm-up uses the smallest row. `?from=` preselects a kind of tool.

| Kind of tool | Subscribers | Hands-on time | Warm-up |
|--------------|-------------|---------------|---------|
| `hosted` | 12,000 | 2 hr 35 min | 7 days |
| `hosted` | 5,000 | 2 hr 20 min | 3 days |
| `hosted` | 5,001 | 2 hr 25 min | 7 days |
| `store` | 12,000 | 2 hr 55 min | 7 days |
| `selfhosted` | 12,000 | 2 hr 35 min | 7 days |
| `spreadsheet` | 12,000 | 2 hr 40 min | 7 days |
| `general` | 12,000 | 2 hr 20 min | 7 days |
| `general`, no automations | 12,000 | 1 hr 35 min | 7 days |
| `none` | Not used | 1 hr 10 min | 3 days |

Checked steps are saved, with the time left recalculated, and "Start over" clears them.

### Roadmap voting

`initRoadmap()` in `main.js`, reading `ROADMAP`. Each visitor has one vote per item, and pressing again removes it.
Votes are saved and added to the item's starting count. Status filters are `aria-pressed` buttons, and `?status=`
(`shipped`, `beta` or `next`) opens one directly. Sorting is by most votes, fewest votes or name. Focus stays on the
vote button when the list redraws, and each vote is announced in a status region.

### Journal

`initJournal()` in `main.js`, reading `JOURNAL`. Entries are sorted newest first, with filter buttons and `?topic=`.
Each entry's full text is in a `<details>` element.

### FAQ

The FAQs on `waitlist.html` and `pricing.html` are plain `<details>` elements in the HTML, so they work with the
keyboard and without JavaScript. Dates inside them use `data-date`.

### Menu and reveals

`initMenu()` handles the mobile menu (`aria-expanded`, and Esc closes it and returns focus). `initReveal()` adds
`.is-visible` to `.reveal` elements with an IntersectionObserver, and also reveals everything above them. Both respect
`prefers-reduced-motion`.

## Forms

No form sends anything until you connect it. All of them validate in the browser and finish with a success state.

| Form | Where | Validates |
|------|-------|-----------|
| Quick join (`[data-quick-join]`) | `index.html` | Email, then opens `waitlist.html?email=` |
| Join (`[data-join-form]`) | `waitlist.html` | Email, publication (2+ characters), list size, current tool |
| Match invite (`[data-claim-form]`) | `waitlist.html` | Email, not your own, not already matched |
| Contact (`[data-contact-form]`) | `about.html` | Name (2+), email, topic, message (20+). Ends with a reference like `LW-7KQ2M` |

### Connect the waitlist

In `join()` inside `initWaitlist()`, post the fields and render the spot from the answer. The position and code should
come from your server. For the contact form, the same idea with Formspree goes in the submit handler of `initContact()`:

```js
const response = await fetch("https://formspree.io/f/your-id", {
  method: "POST",
  headers: { Accept: "application/json" },
  body: new FormData(form),
});
if (!response.ok) return; // show an error and keep the form
// then show the success state
```

Show the success state only when the response is OK. Once a backend runs the list, also remove the `[data-claim-form]`
shortcut or have it check with the server.

## Saved data (localStorage)

Every read and write goes through the `safeStorage` object in `main.js`, which falls back to memory for the page view
when storage is blocked.

| Key | Shape | Validation on read |
|-----|-------|--------------------|
| `loftwing:waitlist:v1` | `{ seq, current, spots: { email: { start, code, publication, size, tool, joined, referrals: [{ email, at, via }] } } }` | `loadWaitlist()` checks every field and drops anything odd |
| `loftwing:ref:v1` | An invite code string | Must match `/^LW[A-Z2-9]{6}$/` |
| `loftwing:votes:v1` | An array of roadmap item ids | Only known ids are kept |
| `loftwing:migrate:v1` | `{ source, size, automations, done: [stepId] }` | Own-key checks, whole-number range |
| `loftwing:pricing:v1` | `{ subscribers, sends, billing, founding }` | Type and range checks |

To reset, delete the keys in your browser's developer tools, or run:

```js
Object.keys(localStorage).filter((key) => key.startsWith("loftwing:")).forEach((key) => localStorage.removeItem(key));
```

## SEO and sharing

Each page has its own `<title>`, meta description and Open Graph tags in the `<head>`. Set `og:image` to an absolute URL
when you deploy, for example `https://yourdomain.example/assets/img/og-image.png`. Regenerate the PNG from the SVG if
you change the name or colors. Add a `sitemap.xml` and `robots.txt` at the root if your host doesn't create them. Many
hosts serve `404.html` automatically for missing pages.

## Accessibility

Built in: a skip link, landmarks, one `<h1>` per page, visible focus rings, labeled inputs with linked errors, the WAI
tab pattern, `aria-pressed` filters, status regions and `prefers-reduced-motion` support that stops the sky and the
reveals. Color is never the only signal: statuses have words. Text colors meet WCAG AA on glass panels at the brightest
part of the sky.

When you edit, keep one `<h1>` per page, label new inputs, and recheck contrast if you change the sky or `.glass`.
Automated tools often can't judge text over gradients, so check those by eye or with a pixel sampler.

## Building and deploying

Rebuild the CSS after adding Tailwind classes (Node 24):

```sh
npm install
npm run build   # or: npm run watch
```

Classes used only in JavaScript must appear literally in a scanned file, as they do in `main.js`. To deploy, upload the
folder to any static host, such as Netlify Drop, GitHub Pages or Cloudflare Pages. Internal links are relative, so it
also works from a subfolder.

## Troubleshooting

- **The launch date changed by itself.** That's `KEEP_DEMO_CURRENT`. Turn it off and set `FIXED_LAUNCH`.
- **My old test spot keeps appearing.** It's saved in this browser. Press "Leave the waitlist", or clear the
  `loftwing:` keys.
- **A referral didn't count.** Credit needs a new address and a code that belongs to a spot known to this browser, and
  it isn't given to the spot's own address. A real backend removes the browser limit.
- **A new class has no effect.** It isn't in `assets/css/style.css` yet. Run `npm run build`.
- **The spot isn't there after a reload in a preview.** Storage is blocked in sandboxed frames, so state lasts only
  for the page view. This is expected.
- **Fonts look different offline.** Google Fonts need a connection, and the site falls back to system fonts.
- **The sky looks banded or text feels dim after a color change.** Keep the `.sky` gradients dark, and check `text-fog`
  on `.glass` at the top right of the screen, where the sky is brightest.

## License

MIT. The code and all included artwork are free for personal and commercial use. See `LICENSE.txt`.
Red Hat Display, Sen and Overpass Mono are licensed under the SIL Open Font License.
All business, product and personal details are fictional, and any resemblance to real ones is a coincidence.
