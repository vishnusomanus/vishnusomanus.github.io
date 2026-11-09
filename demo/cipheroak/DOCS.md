# Cipheroak documentation

## Overview

Cipheroak is a nine-page HTML and Tailwind CSS v4 website for a fictional self-custody security studio in Santa Fe, New Mexico. The studio helps households and small teams set up and maintain hardware wallets, multisig vaults, recovery and inheritance plans and key ceremonies. The site sells reviews, setups and planning only: it has no price charts, trading, yield or investment content, and it names no real wallet or exchange brands. It includes a vault-readiness assessment, a multisig signer planner, fourteen illustrated security guides with a reading list, a quote builder, rolling field notes and advisories, studio hours and a review-call booking form in Mountain Time. This is version 1.0.4. See the [template page](https://freeframe.dev/templates/cipheroak) for the live demo.

## Quick start

Everything is prebuilt: the compiled CSS is in `assets/css/style.css` and the JavaScript runs in the browser with no dependencies.

1. Unzip the download.
2. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8080
```

3. Visit `http://localhost:8080`.

Serving over HTTP is closest to a real host. Google Fonts need a network connection; without one the pages fall back to system fonts. Node.js 24 is only needed if you change Tailwind classes and rebuild the CSS (see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
| --- | --- | --- |
| `index.html` | Home | Arched oak-ring hero, three promises, four services, key ceremony steps, latest advisory, next open call slot, featured guides, client quotes |
| `assessment.html` | Vault-readiness assessment | Ten questions in four parts, live progress, readiness dial and level, section bars, prioritized fixes linked to guides |
| `guides.html` | Security guides | Fourteen guides with SVG art, topic and level filters with counts, search, checklists, saved reading list |
| `teams.html` | For teams | Signer planner (holders, threshold, key locations), ring diagram, five bad-day checks, how-to-read section, team engagement steps |
| `pricing.html` | Pricing | Three plans, quote builder with devices, signers, recovery plan, ceremony travel and care plan, fee questions |
| `notes.html` | Field notes | Advisories, field notes and checklist updates in date order, type filter, severity legend, drill office hours, advisory email sign-up |
| `company.html` | Company | Four people with drawn portraits, six principles, studio map and address, hours table with live status, coming closures |
| `contact.html` | Book a review | Recovery-phrase warning, validated booking form with a day and time picker in Mountain Time, request received state |
| `404.html` | Page not found | Links back to the main pages |

## Project structure

```text
cipheroak/
  index.html            Home page
  assessment.html       Vault-readiness assessment
  guides.html           Security guides and reading list
  teams.html            Signer planner
  pricing.html          Plans and quote builder
  notes.html            Field notes and advisories
  company.html          People, principles, studio and hours
  contact.html          Review-call booking form
  404.html              Page not found
  assets/
    css/style.css       Compiled Tailwind CSS (generated, do not edit)
    js/main.js          All data and interactions
    img/                Favicon, social image and SVG artwork
  src/input.css         Tailwind source: theme tokens and a few components
  package.json          Scripts to rebuild the CSS
  README.md             Short introduction
  DOCS.md               This guide
  CHANGELOG.md          Version history
  LICENSE.txt           License (added to the download)
```

## Customizing

### Brand and colors

The design tokens live in the `@theme` block at the top of `src/input.css`. Tailwind turns each `--color-*` token into utilities such as `bg-juniper`, `text-bark-soft` and `border-line`.

| Token | Default | Used for |
| --- | --- | --- |
| `--color-caliche` | `#f4ece0` | Page background |
| `--color-parchment` | `#fbf7f0` | Cards and inputs |
| `--color-adobe` | `#e8d8c2` | Page heroes and alternate bands |
| `--color-adobe-deep` | `#d9c2a3` | Progress tracks and art shading |
| `--color-line` | `#cfbca1` | Borders and rules |
| `--color-bark` | `#2b211b` | Text, primary buttons, dark bands |
| `--color-bark-soft` | `#5b4b3f` | Secondary text |
| `--color-juniper` | `#1f5a52` | Links, selected states, the main accent |
| `--color-turquoise` | `#4f9a90` | Art and bars |
| `--color-sky` | `#d3e6df` | Turquoise tint, "today" rows |
| `--color-ochre` | `#c98d2e` | Highlights on dark bands |
| `--color-ochre-soft` | `#f1dcae` | Notices and the "Watch" badge |
| `--color-chile` | `#9b3f1f` | Warnings and the "Act now" badge |
| `--color-chile-soft` | `#f2d3c3` | Warning backgrounds |
| `--color-error` | `#a3241c` | Form errors |

To change the main accent, edit one line and rebuild the CSS:

```css
--color-juniper: #1f4f6b;
```

A few colors are repeated as hex values where Tailwind can't reach: the SVG files in `assets/img/`, the drawing functions in `assets/js/main.js` (`INK`, `PAPER`, `TOPIC_GROUND`, the `LOCATIONS` colors and the ring diagram) and the `theme-color` meta tag in each page.

The shared components in `@layer components` are small: `.wrap` (page width), `.eyebrow`, `.btn`, `.btn-ghost`, `.btn-sm`, `.nav-link`, `.text-link`, `.label`, `.field`, `.error`, `.chip` (toggle buttons, styled by `aria-pressed` or `aria-checked`), `.arch` (the arched frame used for page art and portraits) and `.reveal`.

### Typography

| Role | Family | Token |
| --- | --- | --- |
| Headings | Besley (500, 600, 700, italic 500) | `--font-display`, class `font-display` |
| Body | Radio Canada (400, 500, 600) | `--font-sans` |
| Labels, references, numbers | Sometype Mono (400, 500) | `--font-mono`, class `font-mono` |

The fonts load from Google Fonts with one `<link>` in the `<head>` of every page. To swap a family, change that link on every page and the matching `--font-*` token in `src/input.css`, then rebuild. The ring diagram on the teams page and the SVG files name the families too, so update those if you change fonts.

### Content

Page copy is plain HTML in each file. Everything that is listed, scored or calculated is data at the top of `assets/js/main.js`, in numbered sections:

| Constant | What it holds |
| --- | --- |
| `STUDIO`, `TIMEZONE`, `LOCALE`, `CURRENCY` | Business details, `America/Denver`, `en-US`, `USD` |
| `HOURS`, `HOLIDAYS`, `CLOSURES` | Opening hours, holiday rules, one-off closures |
| `BOOKING`, `SLOT_TIMES`, `SERVICES`, `AUDIENCES` | Call length, booking window, call start times, form options |
| `SECTIONS`, `QUESTIONS`, `LEVELS`, `RECOMMENDATIONS` | The assessment |
| `TOPICS`, `GUIDE_LEVELS`, `GUIDES` | The security guides |
| `MAX_KEYS`, `LOCATIONS`, `PRESETS`, `HOLDER_MAX` | The signer planner |
| `PLANS`, `RECOVERY_PLANS`, `TRAVEL_ZONES`, `QUOTE_LIMITS` | Pricing and the quote builder |
| `KEEP_DEMO_CURRENT`, `DEMO_ANCHOR`, `NOTE_TYPES`, `SEVERITIES`, `NOTES` | Field notes and advisories |
| `PEOPLE` | The team on the company page |

To add a guide, add an object to `GUIDES`. `topic` must be a key of `TOPICS`, `level` a key of `GUIDE_LEVELS`, and `art` a key of `GUIDE_ART` (section 11):

```js
{
  id: "safe-deposit-box",
  title: "Using a safe deposit box well",
  topic: "backups",
  level: "intermediate",
  minutes: 15,
  art: "map",
  summary: "What a bank box is good for, and the access rules to check first.",
  steps: [
    "Ask who can open the box if you can't.",
    "Keep a device and its own backup in different places.",
    "Visit once a year.",
  ],
},
```

To add a field note, add an object to `NOTES` with an ISO `date`, a `type` from `NOTE_TYPES` and, for advisories, a `severity` from `SEVERITIES`. The order in the array doesn't matter; the page sorts newest first.

The plan cards on `pricing.html` show prices from `PLANS` (each `[data-plan-price]` element is filled in), but their bullet points are HTML, so update both when you change what a plan includes. The home page service cards and footer hours are also plain HTML.

### Images and artwork

All artwork is SVG drawn for this template; there are no photos.

| File or function | Where | Size |
| --- | --- | --- |
| `assets/img/hero-home.svg` | Home hero (oak rings and three keys) | 560 × 660 |
| `assets/img/hero-assessment.svg`, `hero-guides.svg`, `hero-teams.svg`, `hero-pricing.svg`, `hero-notes.svg`, `hero-company.svg`, `hero-contact.svg` | Inner page heroes, shown from 640px up | 352 × 300 |
| `assets/img/hero-404.svg` | 404 page | 384 × 460 |
| `assets/img/service-*.svg` | Home service cards | 112 × 112 |
| `assets/img/studio-map.svg` | Company page map | 640 × 320 |
| `GUIDE_ART` and `guideArt()` in `main.js` | One drawing per guide, on a ground color per topic | 320 × 200 |
| `portrait()` in `main.js` | Team portraits, drawn from each person's `portrait` settings | 200 × 220 |
| `ringDiagram()` in `main.js` | The signer planner's key ring | 360 × 360 |

To use photos instead, keep the same aspect ratios and replace the `<img>` sources or the drawing function's output. Hero art sits inside the `.arch` frame, which rounds the top fully, so keep the subject in the lower two thirds.

The social image is `assets/img/og-image.png` (1200 × 630), generated from `assets/img/og-image.svg`. The favicon is `assets/img/favicon.svg`.

### Navigation, header and footer

The header and footer are repeated in every HTML file. To add a page, copy an existing page, change its `<title>`, description, Open Graph tags and `data-page` on `<body>`, and add a link to both the main `<nav>` and the `#mobile-menu` list in every file. The current page's links carry `aria-current="page"`. The footer year comes from `[data-year]` and the studio status in the top bar from `[data-studio-status]`, both filled in by `initChrome()`.

## Features

### Studio clock and hours

All dates and times are worked out in `TIMEZONE` (`America/Denver`) by `studioNow()`, so a visitor elsewhere still sees the studio's clock. `HOURS` lists opening times Sunday first; `null` means closed. `usHolidays(year)` computes the closures in `HOLIDAYS` from rules for any year (New Year's Day, Martin Luther King Jr. Day, Memorial Day, Juneteenth, Independence Day, Labor Day, Indigenous Peoples' Day, Thanksgiving and the day after, Christmas Eve and Christmas Day). Fixed-date holidays on a weekend are observed on the Friday or Monday. Add one-off closures to `CLOSURES`:

```js
const CLOSURES = [{ date: "2027-03-12", label: "Team training day" }];
```

`studioStatus()` drives "Open now until 5:00 PM" or "Closed, opens Monday at 9:00 AM" in the top bar and on the company page, which also shows an hours table with today highlighted and the next four closures.

Add `?now=2026-10-26T09:15` (studio time) to any page to preview another moment.

### Vault-readiness assessment

`assessment.html`, `initAssessment()`. Each item in `QUESTIONS` belongs to a part in `SECTIONS` and has options with `points`; options that leave a gap name a key of `RECOMMENDATIONS`. The score is the points as a percentage of the best possible total (29 with the shipped questions), and `LEVELS` maps it to Exposed (0–39), Fragile (40–64), Steady (65–84) or Vault-ready (85–100). Part bars show each section's share. Once all ten are answered, up to five recommendations appear sorted by `priority` (1 is most urgent; 1–2 are marked "Do this first"), each linking to its `guide`. Examples: answering the first option of every question scores 26 of 29, which is 90 and Vault-ready; the mix custody 3rd, sourcing 2nd, pin 2nd, medium 2nd, places 2nd, tested 3rd, loss 2nd, approval 2nd, aware 2nd, succession 3rd scores 41, Fragile.

Answers are buttons with `role="radio"` in a `role="radiogroup"` per question; arrow keys move and choose, with a roving tabindex. Answers are saved (see [Saved data](#saved-data-localstorage)) and "Clear my answers" removes them.

### Security guides

`guides.html`, `initGuides()`. Cards are built from `GUIDES`. Topic and level chips (`[data-topic]`, `[data-level]`, `aria-pressed`) and the search box combine; each chip shows how many guides it would match with the other filters applied, and a live status reads "Showing 5 of 14 guides". The state is kept in the URL as `?topic=`, `?level=` and `?q=`, validated against `TOPICS` and `GUIDE_LEVELS` with own-key checks. Linking to `guides.html#guide-<id>` opens that guide's checklist and scrolls to it. "Save to reading list" toggles a guide into the sidebar list, which shows the count and total reading minutes; Remove moves focus to the next item.

### Signer planner

`teams.html`, `initTeams()`. A plan is a `threshold` and a list of keys, each with a `holder` (free text, up to `HOLDER_MAX` characters) and a `location` from `LOCATIONS`. `PRESETS` holds the examples; `?preset=household|team|two-of-two|single` loads one. `analysePlan()` computes:

- keys that can be lost: keys minus threshold;
- keys that can be stolen safely: threshold minus one;
- five checks: lose any one key, a thief takes one key, a fire or flood at one place, a break-in at one place (or mugging, for carried keys), and one person unavailable for good (keys are grouped by holder name, case-insensitive).

Five passes is "Resilient", three or four "Mostly resilient", fewer "Fragile". The shipped examples give: Household 2-of-3, 1 lost, 1 stolen, 4 of 5 (fails "one person unavailable", because "You" holds two keys); Team 3-of-5, 2 and 2, 5 of 5; Couple 2-of-2 (both at home), 0 and 1, 1 of 5; Single key, 0 and 0, 0 of 5. Up to `MAX_KEYS` (7) keys; the threshold is kept between 1 and the number of keys.

### Quote builder

`pricing.html`, `initPricing()`. A quote is a plan from `PLANS`, a number of devices and signers (limits in `QUOTE_LIMITS`), a recovery plan from `RECOVERY_PLANS`, a ceremony location from `TRAVEL_ZONES` and an optional care plan. Each plan includes some devices and signers and charges `extraDevice` and `extraSigner` beyond them. `TRAVEL_ZONES.away` sets `travelAtCost`, which shows a note that flights and lodging are billed at cost. `?plan=review|household|team` preselects a plan. The default (household vault, 3 devices, 3 signers, letter of instruction, Santa Fe ceremony, care plan) totals $2,150 one time plus $240 a year; a team vault with the same extras is $4,400 plus $960 a year. The quote is saved and offered as an attachment on the booking form.

### Field notes and rolling dates

`notes.html`, `initNotes()`. Notes are sorted newest first and filtered by type (`?type=advisory|field|checklist` also works). Advisories carry a severity badge. The home page shows the newest advisory, and `notes.html#note-<id>` links to a note. Drill office hours are computed as the second Thursday of each month at 4:00 PM, skipping studio holidays.

**Demo dates.** `KEEP_DEMO_CURRENT = true` moves every note forward by whole weeks since `DEMO_ANCHOR` (`2026-10-24`), so the newest note always reads as written in the past week and weekdays never change. On the anchor date the page shows the dates exactly as written. For a real site, set it to `false` and write real dates:

```js
const KEEP_DEMO_CURRENT = false;
```

Everything else that is dated works from today by rule: the copyright year, open status, closures, call slots and office hours.

### Review-call booking

`contact.html`, `initContact()`. The day picker shows the next `BOOKING.businessDays` (10) business days that have a slot at least `BOOKING.leadHours` (18) hours away, skipping weekends and holidays. Start times come from `SLOT_TIMES` by weekday. About three in ten slots show as taken; `slotTaken()` decides this from the date and time, so the same slots are taken on every visit. Fully taken days are disabled. The chosen slot is described in Mountain Time and, when the visitor's time zone differs, in their own time too. `?service=` preselects an option from `SERVICES`.

### Recovery-phrase guard

`looksSecret()` checks the message before sending. It rejects a run of twelve or more plain words of three to eight letters with no everyday filler words (the shape of a recovery phrase, numbered or not), a 64-character hexadecimal key, or a long extended key, and explains that Cipheroak never needs it. Ordinary sentences pass. The warning box above the form and the success state repeat that nobody will ever ask for a phrase.

### Menu, reveal and notices

The menu button (`#menu-toggle`) toggles `#mobile-menu` below 1280px, updates `aria-expanded` and its label, closes on Escape and returns focus. Sections with `.reveal` fade in once with an IntersectionObserver; everything above a revealed element is revealed too, and reduced-motion users see everything at once. `notice()` shows short confirmations in the `#notice` live region.

## Forms

| Form | Page | Validates |
| --- | --- | --- |
| Booking request (`[data-booking]`) | `contact.html` | Name (2+ characters), email format, optional phone (10+ digits), who it is for, service, a chosen slot, message length and the recovery-phrase guard |
| Advisory sign-up (`[data-subscribe]`) | `notes.html` | Email format |

Errors appear inline under each field (`aria-invalid` and `aria-describedby`), a summary says how many things to fix, and focus moves to the first problem. On success the booking form is replaced by "Request received" with the first name, the slot, the service, a reference like `CO-261024-47F1` (date plus four random characters) and the next steps. The demo forms don't send anything until you connect them.

To connect the booking form to a service such as Formspree, give the fields `name` attributes, then replace the comment in the submit handler in `initContact()` with a request, and only show the success state when it answers OK:

```js
const response = await fetch("https://formspree.io/f/your-form-id", {
  method: "POST",
  body: JSON.stringify(Object.assign({ slot: day + " " + slot, reference: ref }, data)),
  headers: { "Content-Type": "application/json", Accept: "application/json" },
});
if (!response.ok) {
  summary.hidden = false;
  summary.textContent = "Something went wrong. Please call us at (505) 555-0172.";
  return;
}
```

Make the submit handler `async` when you do. The sign-up form has the same comment in `initNotes()`; connect it to your email list provider in the same way.

## Saved data (localStorage)

All storage goes through `safeStorage`, which falls back to memory when the browser blocks `localStorage` (a sandboxed iframe or strict privacy settings), so features keep working for the page view. Every value is validated on read and ignored if it doesn't fit.

| Key | Shape | Validation |
| --- | --- | --- |
| `cipheroak-assessment` | `{ answers: { [questionId]: optionIndex }, saved: "YYYY-MM-DD" }` | Only known question ids with an integer index in range |
| `cipheroak-reading-list` | `["guide-id", ...]` | Only known guide ids, no duplicates |
| `cipheroak-signer-plan` | `{ preset, threshold, keys: [{ holder, location }] }` | Known locations, up to 7 keys, holder text cleaned and trimmed, threshold clamped |
| `cipheroak-quote` | `{ plan, devices, signers, recovery, travel, care }` | Known plan, recovery and travel ids; numbers clamped to `QUOTE_LIMITS` |

To reset, clear site data in the browser, or run `localStorage.removeItem("cipheroak-quote")` (or another key) in the console. To change key names, edit `KEYS` in `main.js`.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `theme-color` in its `<head>`. `og:image` points at `assets/img/og-image.png` with a relative path; for social previews, change it to an absolute URL on your domain:

```html
<meta property="og:image" content="https://www.example.com/assets/img/og-image.png" />
```

To regenerate the PNG after editing `og-image.svg`, open the SVG in a browser and export it at 1200 × 630, or use any SVG-to-PNG tool with the fonts installed. Add a `sitemap.xml` listing the eight content pages and a `robots.txt` when you deploy. Structured data isn't included; a `LocalBusiness` block with the studio address and hours would fit the company page.

## Accessibility

- A skip link, landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page and a logical heading order.
- Visible focus outlines in juniper (ochre on dark bands), and color contrast at WCAG AA.
- The mobile menu uses `aria-expanded` and `aria-controls` and closes on Escape.
- Assessment answers and the quote's plan picker are radio groups with arrow-key support; filters and slots are toggle buttons with `aria-pressed`; counts and results are announced through live regions.
- Form fields have labels, inline errors are linked with `aria-describedby`, and focus moves to the first error or to the success message.
- Removing a key or a reading-list item keeps focus nearby instead of dropping it on the page.
- Reduced motion turns off the reveal and other transitions; smooth scrolling only applies when motion is allowed.
- Every illustration has alternative text, or an empty `alt` where it is decorative.

When editing, keep one `<h1>` per page, give every new input a `<label>`, and make sure any `aria-describedby` id exists.

## Building and deploying

The compiled CSS is committed, so you only need to rebuild after adding or changing Tailwind classes in the HTML or `main.js`:

```sh
npm install
npm run build    # or: npm run watch
```

This runs `tailwindcss -i src/input.css -o assets/css/style.css --minify` with Node 24. Classes that appear only inside JavaScript strings are found because Tailwind scans `main.js` too; write them as whole class names.

To deploy, upload the folder to any static host: Netlify Drop, Cloudflare Pages, GitHub Pages or your own server. There is no server code. All links are relative, so the site also works from a subfolder.

## Troubleshooting

- **New classes have no effect.** Rebuild the CSS with `npm run build`; only classes present when the CSS was built exist.
- **Saved answers or the reading list disappear on reload.** The browser is blocking storage (private mode, a sandboxed preview); the site falls back to memory for that page view. Try a normal window or a real host.
- **The studio shows the wrong open or closed status.** Check `HOURS`, `HOLIDAYS` and `CLOSURES`, and remember times are in `TIMEZONE`. Use `?now=YYYY-MM-DDTHH:MM` to test a moment.
- **The booking form says my message looks like a recovery phrase.** Twelve or more plain words in a row without small words like "the" or "and" trip the guard. Ask clients to write in sentences; adjust `looksSecret()` if your audience needs it.
- **Field note dates have moved.** `KEEP_DEMO_CURRENT` is on. Set it to `false` once you enter real dates.
- **A guide link doesn't open its checklist.** The link must be `guides.html#guide-<id>` with an id that exists in `GUIDES`.
- **Fonts look different offline.** Google Fonts need a connection; the system fallbacks are used without one.

## License

MIT. The code and all included artwork are free for personal and commercial use; see `LICENSE.txt` in the download.
Besley, Radio Canada and Sometype Mono are licensed under the SIL Open Font License.
Cipheroak, its people, clients, advisories and contact details are fictional.
