# Bloom documentation

## Overview

Bloom is a nine-page website for a hair salon and day spa. The demo brand is Bloom Hair & Spa, a fictional independent
salon at 48 Burns Court, Sarasota, Florida. It's built with plain HTML5, Tailwind CSS v4 and one vanilla JavaScript file with
no dependencies. Highlights are a five-step booking wizard that works out real time slots from business hours, staff
business days and treatment length, level-based pricing (stylist, senior, director), a gift card builder with a live
preview, filterable service and team pages, a gallery with saved looks and a lightbox, a before/after slider and a live
"Open now" status. This guide covers version 1.0.10. Live demo:
[freeframe.dev/templates/bloom](https://freeframe.dev/templates/bloom).

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Everything works from the file system, including booking, gift cards and saved
   looks.
3. For a local server instead (closer to production), run one from the folder:

```sh
npx serve .
```

You only need Node.js 24 if you change the styles and rebuild the CSS (see
[Building and deploying](#building-and-deploying)). The compiled `assets/css/style.css` is included.

## Pages

| File | Page | Notable sections and features |
|------|------|-------------------------------|
| `index.html` | Home | Hero, signature treatments, before/after slider, team, reviews, gift cards, newsletter |
| `services.html` | Services and prices | Full menu by category, category filter with count, "Book" links per treatment |
| `team.html` | Team | Specialty filter, business days, pricing levels, "Book with" links |
| `book.html` | Book online | Five-step booking wizard with a running summary |
| `gift-cards.html` | Gift cards | Amount, design, message and delivery date with a live card preview |
| `gallery.html` | Gallery | Look filters, saved looks, lightbox with "Book with" link |
| `about.html` | About | Story, values and milestones |
| `contact.html` | Visit and contact | Map, business hours with today highlighted, open-now status, contact form |
| `404.html` | Not found | Links back into the site |

Every page shares the header, footer (with an open-now badge and the newsletter form) and the back-to-top button.

## Project structure

```text
bloom/
├── index.html … 404.html      The nine pages (header and footer are repeated in each)
├── assets/
│   ├── css/style.css          Compiled Tailwind CSS (generated from src/input.css)
│   ├── js/main.js             All interactivity and the BLOOM data object
│   └── img/
│       ├── looks/             Gallery looks, one SVG per look id
│       ├── team/              Team portraits, one SVG per team member id
│       ├── before.svg, after.svg, salon.svg, map.svg
│       ├── favicon.svg
│       └── og-image.svg, og-image.png
├── src/input.css              Tailwind source: @theme tokens and component styles
├── package.json               Tailwind CLI scripts (build, watch)
├── template.json              Template metadata (name, version, pages, features)
├── README.md                  Short introduction
├── CHANGELOG.md               Version history
└── DOCS.md                    This guide
```

`main.js` is organized in numbered sections (listed in its header comment): data, helpers, header, reveal, opening
hours, before/after, services, team, gallery, booking, gift cards, forms and back to top.

## Customizing

### Brand and colors

The design tokens are in the `@theme` block at the top of `src/input.css`. Tailwind turns each `--color-*` token into
utilities such as `bg-shell`, `text-plum` and `border-line`.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-shell` | `#faf6f2` | Page background |
| `--color-cream` | `#fffdfb` | Cards |
| `--color-blush` | `#f3e4dd` | Soft panels |
| `--color-rose` | `#e8cfc4` | Deeper panels |
| `--color-line` | `#e3d3ca` | Borders |
| `--color-ink` | `#2a2127` | Text |
| `--color-mute` | `#685a5f` | Secondary text (meets AA on shell, cream and blush) |
| `--color-plum`, `--color-plum-dark` | `#7a3e5b`, `#5e2c45` | Accent: buttons, links, selected states |
| `--color-sage` | `#5a6954` | Secondary accent, open-now badge |
| `--color-gold` | `#a5804f` | Decorative details |
| `--color-error` | `#a23a3a` | Form errors |

To change the accent:

```css
@theme {
  --color-plum: #2f5d62;
  --color-plum-dark: #1f4044;
}
```

Rebuild the CSS afterwards. The gift card designs (`.gift-petal`, `.gift-sage`, `.gift-noir` in `src/input.css`) and
the SVG artwork have their own colors; update them too, along with `accent` in `template.json`.

### Typography

Two Google Fonts are loaded by a `<link>` in the `<head>` of every page:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..700;1,6..96,400..700&amp;family=Jost:wght@300..600&amp;display=swap">
```

- `--font-display` is Bodoni Moda (headings, prices, the wordmark), used through the `font-display` class.
- `--font-sans` is Jost (body text).

To swap a font, change the `<link>` on every page and the family name in `@theme`, then rebuild:

```css
@theme {
  --font-display: "Cormorant Garamond", "Didot", ui-serif, Georgia, serif;
}
```

### Content

Page text is plain HTML. The data the scripts use is the `BLOOM` object at the top of `assets/js/main.js`:

| Key | What it holds | Used by the script for |
|-----|---------------|------------------------|
| `salon` | Name, address, phone, email, `currency` (ISO code, e.g. `USD`), `locale` (e.g. `en-US`) | Price formatting in the booking wizard and gift cards; otherwise reference only (the pages have their own copy) |
| `hours` | Seven entries, `day` 0 (Sunday) to 6, with `open`/`close` as `"HH:MM"` or `null` when closed | Open-now status, booking slots |
| `categories` | Service categories: `id`, `label`, `blurb` | Services filter count label |
| `services` | `id`, `cat`, `name`, `mins`, `price`, `desc`, optional `signature` | Booking durations, prices, summary |
| `levels` | `stylist` (×1), `senior` (×1.2), `director` (×1.4) with `label` and `blurb` | Level-based pricing |
| `team` | `id`, `name`, `role`, `level`, `cats`, `days`, `bio`, `specialties` | Booking stylists, availability, lightbox credit |
| `looks` | `id`, `cat`, `title`, `by` (team id), `palette`, `kind` | Gallery lightbox |
| `lookCategories` | Gallery filter ids and labels | Lightbox category label |
| `giftAmounts`, `giftDesigns` | Preset amounts and designs | Design labels in the gift card preview |

The comment says the data is "generated from one source shared with the Next.js version". In the HTML template, the
pages themselves are not built from it: the service menu, the booking checkboxes, the team cards, the gallery and the
hours tables are written out in HTML. When you change the data, change the HTML to match.

To add a treatment, for example a bang trim:

1. Add it to `BLOOM.services`:

```js
{
  "id": "bang-trim",
  "cat": "hair",
  "name": "Bang trim",
  "mins": 15,
  "price": 15,
  "desc": "A quick cleanup between cuts."
}
```

2. Add a row to the matching `data-service-group` section in `services.html`, with a link to
   `book.html?service=bang-trim`.
3. Add a checkbox to step 1 of `book.html` inside the right category `<fieldset>`, copying an existing one:

```html
<label class="option"><input type="checkbox" name="services" value="bang-trim" class="option-input"><span class="option-body">…</span></label>
```

The checkbox `value` must equal the service `id`; the script reads name, duration and price from `BLOOM.services`.

To add a team member, add an entry to `BLOOM.team` (`days` uses 0 for Sunday to 6 for Saturday; `cats` lists the
categories they can do), add `assets/img/team/<id>.svg` (the booking wizard loads the portrait from that path), and add
their card to `team.html` with `data-team-member data-cats="hair colour"`.

Contact details are repeated in every page and in `BLOOM.salon`. Search and replace `(941) 555-0173`,
`+19415550173` (used in `tel:` links), `hello@bloomhairspa.example` and `48 Burns Court`.

### Images and artwork

All artwork is SVG in `assets/img/`. Replace any file with a photo (JPG or WebP) at the same aspect ratio:

| Files | Size | Ratio |
|-------|------|-------|
| `looks/<look id>.svg` (12 files) | 480×600 | 4:5 |
| `team/<member id>.svg` (6 files) | 400×480 | 5:6 |
| `before.svg`, `after.svg` | 640×520 | Both must be the same size |
| `salon.svg` | 640×480 | 4:3 |
| `map.svg` | 640×420 | Illustrative map on the contact page |
| `favicon.svg` | 32×32 | 1:1 |

Two paths are built in JavaScript: the lightbox loads `assets/img/looks/<id>.svg` and the stylist list in the booking
wizard loads `assets/img/team/<id>.svg`. If you switch to JPGs, change those two strings in `main.js` as well as the
HTML.

`og-image.png` (1200×630) is the social sharing image; its editable source is `og-image.svg`. Export it again as a
1200×630 PNG after changing the SVG. Replace `map.svg` with a real map embed or a static map image of your location.

### Navigation, header and footer

The header, mobile menu and footer are repeated in every HTML file. To add a page or menu item, edit all nine files:
the desktop `<nav>` in `#site-header`, the `#mobile-menu` list, and the footer columns. Mark the current page with
`aria-current="page"`.

The menu button (`#menu-toggle`) toggles the `hidden` attribute on `#mobile-menu` and `aria-expanded` on itself.
Escape closes the menu and returns focus to the button; the menu also closes on link click and at the desktop
breakpoint.

## Features

### Booking wizard

`book.html` holds `[data-booking]` with `<form id="booking-form">`, five `<section data-step="1">` to `data-step="5"`
steps, a progress list (`.steps` with `data-step-indicator`) and a running summary (`<aside class="booking-summary">`).

| Step | What happens | Validation |
|------|--------------|------------|
| 1. Treatments | Checkboxes `name="services"` | At least one |
| 2. Stylist | Radio list built by `renderStylists()`: "Anyone available" plus everyone who can do all the chosen treatments | None |
| 3. Date and time | 21 day buttons from today (`renderDates()`), then time buttons (`renderSlots()`) | A time is chosen |
| 4. Your details | Name, email, cell phone, notes, first visit, remember details, cancellation policy | Name 2+ characters, valid email, 10–15 digit phone, policy checked |
| 5. Review | Rows with "Change" buttons that jump back to a step | None |

"Continue" validates the current step and moves on; on step 5 it becomes "Confirm booking" and calls `confirm()`, which
hides the wizard and shows `[data-booking-done]` with the first name, a summary, a reference (`BL-` plus four
characters, from `makeRef()`) and the email address the confirmation will go to. Each step's heading gets focus when it opens, and the active indicator has `aria-current="step"`.
"Book something else" (`[data-restart]`) starts again.

Preselect from links:

- `book.html?service=balayage` checks a treatment (must be a service `id`).
- `book.html?stylist=amara` preselects a team member (must be a team `id`). If they can't do the chosen treatments, the
  wizard falls back to "Anyone available".

Changing the treatments clears the chosen date and time.

### Time slots and availability

`slotsFor(date, serviceIds, stylist, now)` in section 2 of `main.js` returns the bookable start times. The rules:

- **Business hours:** from `BLOOM.hours[date.getDay()]`. A day with `open: null` has no slots (Monday in the demo).
- **Length:** the sum of the chosen services' `mins`. A slot must finish by closing time, so a 180-minute balayage on a
  Thursday (9:00 AM–8:00 PM) can start at 5:00 PM at the latest.
- **Step:** start times every 15 minutes.
- **Today:** the earliest start is at least an hour from now, rounded up to the next 15 minutes (at 10:07 AM the first slot
  is 11:15 AM).
- **Who can do it:** `eligibleMembers()` returns team members whose `cats` include every chosen category. With
  "Anyone available", each start time is offered if any eligible member is free; the slot remembers who
  (`data-member`), and the summary and confirmation name them.
- **Workdays:** a member is only considered on days listed in their `days`.
- **Schedule:** `isBusy(memberId, dateKey, block)` marks about one in five 30-minute blocks as already booked, using a
  deterministic hash so the same schedule appears on every visit. A member is free only if every block the treatment
  touches is free.
- **Mixed treatments:** if nobody can do all the chosen categories (for example a cut and a gel manicure), the wizard
  books "Best available team" back to back. `teamPlan()` takes the treatments in menu order and gives each one to the
  first team member (in `BLOOM.team` order) who does that category, works that day and is free for the whole
  treatment; a start time is only offered if every treatment can be covered. The slot keeps the plan in `team` (one
  member id per treatment).

To connect real availability, replace `isBusy()` (or `memberFree()`) with a lookup of your booking system's busy times:

```js
// busy = { "theo|2026-10-08": [20, 21, 26] } -> 30-minute block numbers (block 20 = 10:00 AM)
function isBusy(memberId, key, block) {
  var list = busy[memberId + '|' + key];
  return Boolean(list && list.indexOf(block) !== -1);
}
```

Load `busy` before the wizard renders step 3, for example from a JSON endpoint. To change the slot interval, edit the
`t += 15` loop in `slotsFor()`; to change the notice period, edit the `+ 60` in the `earliest` line; to show more days,
change the `21` in `renderDates()`.

### Level-based pricing

`priceFor(service, levelId)` multiplies the base `price` by the team member's level `multiplier`, but only for the
`hair` and `colour` categories. Nails, skin and massage cost the same with anyone. Results are rounded to whole dollars.

| Treatment | Stylist | Senior (×1.2) | Director (×1.4) |
|-----------|---------|---------------|-----------------|
| Signature cut & finish ($85) | $85 | $102 | $119 |
| Balayage ($260) | $260 | $312 | $364 |
Until a stylist or a time (and so a team member) is chosen, the summary shows hair and color prices and the total as
"from" the stylist price. To change the levels, edit `BLOOM.levels`; to make another category scale with level, add it
to the check in `priceFor()` and to the matching `scaled` checks in `paintSummary()`. The prices printed on
`services.html` and `team.html` are HTML; update them by hand.

### Business hours and open now

Section 5 of `main.js` reads `BLOOM.hours`:

- Every `[data-open-now]` badge gets text such as "Open now · until 7:00 PM" or "Closed · opens tomorrow at 9:00 AM" in its
  `[data-open-text]` child, and the class `is-closed` when closed.
- In any `.hours-table`, the `<tr data-day="N">` for today gets the class `is-today` and `aria-current="date"`.

It runs on load and every minute. It uses the visitor's clock and time zone, so a visitor in another time zone sees the status for
their local time. The rows in the hours tables are HTML; keep them in step with `BLOOM.hours`.

### Services filter

On `services.html`, `[data-services]` contains filter buttons with `data-filter` (`all`, `hair`, `colour`, `nails`,
`skin`, `massage`) and one `<section data-service-group="hair">` per category. Choosing a filter hides the other groups,
sets `aria-pressed` and updates `[data-services-count]` ("5 treatments in Hair"), a polite live region. Link to
`services.html?category=colour` to open with a category selected.

### Team filter

On `team.html`, `[data-team]` has buttons with `data-team-filter` and cards with `data-team-member` and
`data-cats="hair colour"` (space-separated). The count (`[data-team-count]`) is a live region. Each card links to
`book.html?stylist=<id>`.

### Gallery and saved looks

On `gallery.html`, `[data-gallery]` contains:

- filter buttons with `data-look-filter` (`all`, `colour`, `cuts`, `bridal`, `nails`, `skin`),
- a "Saved" toggle (`data-saved-toggle`) and its count (`data-saved-count`),
- one `<li data-look="<id>" data-cat="<cat>">` per look, with an open button (`data-look-open="N"`, the index into
  `BLOOM.looks`) and a heart button (`data-save="<id>"`, `aria-pressed`),
- a count (`data-gallery-count`, live region) and an empty message (`data-gallery-empty`) for when no saved looks match,
- a `<dialog data-lightbox>`.

Saved looks are stored in `localStorage` (see [Saved data](#saved-data-localstorage)) and stay in sync across tabs
through the `storage` event. The lightbox shows the look, who did it, its category, "N of M" and a "Book with" link
to `book.html?stylist=<id>`. The left and right arrow keys and the buttons step through the visible looks; Escape or a
backdrop click closes it and focus returns to the look.

To add a look, add it to `BLOOM.looks` (with `by` set to a team id and `cat` to a `lookCategories` id), add
`assets/img/looks/<id>.svg`, and add a `<li>` to `gallery.html` with `data-look-open` set to its index in `BLOOM.looks`.

### Gift cards

On `gift-cards.html`, `[data-gift]` contains `<form id="gift-form">` and a preview (`[data-gift-preview]`):

- **Amount:** radios `name="amount"` (50, 75, 100, 150, 250 or `custom`). A custom amount must be a whole number from
  $25 to $500.
- **Design:** radios `name="design"` (`petal`, `sage`, `noir`); the preview gets the class `gift-<design>`.
- **To, recipient email, from, your email, message:** the message has a 160-character counter.
- **Delivery:** `now` or `later`; later shows a date input limited to today through one year ahead.

The preview and the total update as you type, and `[data-preview-desc]` gives screen readers a text description of
the card. On a valid submit, the script shows `[data-gift-done]` ("Order confirmed") with a gift card code
(`BLOOM-XXXX-XXXX`), a summary and an order reference (`BL-` plus four characters, from `makeRef()`). Nothing is
charged; see [Forms](#forms) for taking payment.

The preset amounts in the HTML aren't read from `BLOOM.giftAmounts`; edit the radios to change them.

### Before/after slider

On `index.html`, `[data-ba]` stacks the before and after images with a native range input (`[data-ba-range]`) on top.
Its value sets `--pos`, and `aria-valuetext` reads "Showing 50% before". It works with mouse, touch and the arrow keys.

### Header and scroll reveals

The header gets `is-scrolled` after 8px. Elements with `reveal` fade in as they enter the viewport, with a short
stagger; anything scrolled past is revealed too, so fast jumps never leave content hidden. Reveals are skipped with
reduced motion.

### Back to top

The last block of `main.js` adds a round button after about one screen of scrolling. It scrolls to the top (instantly
with reduced motion) and moves focus to the main content. It lifts above toasts and anything marked
`data-back-to-top-avoid`, hides while it would cover a fixed or sticky element marked `data-back-to-top-hide`, and
hides while an in-page link whose text contains "Back to top" is on screen. Restyle it with `.back-to-top` in
`src/input.css`; to remove it, delete the block and those styles.

## Forms

| Form | Where | Validation |
|------|-------|------------|
| Booking (`#booking-form`) | `book.html` | Per step, see [Booking wizard](#booking-wizard) |
| Gift card (`#gift-form`) | `gift-cards.html` | Amount, names, both emails, delivery date |
| Contact (`#contact-form`) | `contact.html` | Name 2+ characters, valid email, message 20+ characters |
| Newsletter (`[data-newsletter]`) | Every page footer | Valid email |

Errors are written into the element with the matching `data-error="<field name>"` and the field gets
`aria-invalid="true"`; the first invalid field receives focus. Errors clear as you type. The contact form accepts
`contact.html?topic=careers` to preselect a topic (`appointments`, `gift-cards`, `events`, `careers`, `other`).

Each form ends with an in-world confirmation. The booking, gift card and contact confirmations show a short reference
made in the browser (`BL-` and four characters, from `makeRef()` in `main.js`; if your booking system, payment provider
or form service returns its own reference, show that instead), and the newsletter asks subscribers to look out for a
confirmation email. The booking confirmation says a confirmation email follows "shortly" and the contact confirmation
promises a reply "within one business day", as the contact page does; change them to match how you actually reply.

None of the forms send anything until you connect them. Each has a comment at the point to connect it:

- booking: "Demo only. Send { services, stylist, date, time, details } to your booking system here." in `confirm()`,
- gift card: "Demo only: create a payment session with your provider (e.g. Stripe Checkout) here.",
- contact: "Send new FormData(contact) to your endpoint here.",
- newsletter: before `nf.reset()`.

### Connecting to Formspree

For the contact form, add an `action` and post it where the comment is:

```html
<form id="contact-form" class="mt-8 grid gap-5 sm:grid-cols-2" action="https://formspree.io/f/your-form-id" method="POST" novalidate>
```

```js
// Send new FormData(contact) to your endpoint here.
var ok = $('[data-form-success]', contact);
fetch(contact.action, { method: 'POST', body: new FormData(contact), headers: { Accept: 'application/json' } })
  .then(function (res) {
    if (!res.ok) throw new Error('Send failed');
    contact.reset();
    $('[data-form-ref]', ok).textContent = makeRef();
    ok.hidden = false;
    ok.focus();
  })
  .catch(function () { cErr('message', 'Sorry, that did not send. Please call or email us.'); });
```

Remove the original `contact.reset()` and success lines that follow the comment, since the `then` does that.

For a booking request by email, post the wizard state from `confirm()`:

```js
var data = new FormData(form);
data.append('treatments', selected().map(function (id) { return serviceById[id].name; }).join(', '));
data.append('with', state.member ? memberById[state.member].name : state.stylist);
data.append('date', dateKey(state.date));
data.append('time', hhmm(state.slot));
fetch('https://formspree.io/f/your-form-id', { method: 'POST', body: data, headers: { Accept: 'application/json' } });
```

A form service only delivers the request; it doesn't block the time in a schedule. For real bookings, send the same data
to your booking system's API and use its availability in `isBusy()`. For gift cards, create a checkout session on your
server (for example Stripe Checkout) and redirect to it instead of showing the code straight away.

## Saved data (localStorage)

| Key | Shape | Written |
|-----|-------|---------|
| `bloom-saved-looks` | Array of look ids, for example `["honey-balayage", "french-bob"]` | When a heart is toggled |
| `bloom-details` | `{"name": "…", "email": "…", "phone": "…"}` | On booking confirmation, only if "Remember my details on this device" is checked |

Validation on read:

- `readSaved()` keeps only strings that are ids in `BLOOM.looks`, without duplicates, and writes the cleaned list back
  if anything was dropped.
- `readDetails()` requires an object, keeps `name` (up to 80 characters), `email` (up to 120, and only if it looks like
  an email) and `phone` (up to 30), and removes the key if nothing valid is left.

Confirming a booking with "remember" unchecked removes `bloom-details`. All storage access is wrapped in `try`/`catch`
(the `store` helper), so private browsing just disables saving. To reset, delete the keys in your browser's developer
tools (Application, Local Storage).

## SEO and sharing

Each page has its own `<title>`, `<meta name="description">`, `og:type`, `og:title`, `og:description` and `og:image`.
Edit them per page when you rebrand.

Social networks need an absolute image URL. When you deploy, change `og:image` on every page to your domain:

```html
<meta property="og:image" content="https://example.com/assets/img/og-image.png">
```

There is no structured data, sitemap or `robots.txt`. For a salon, consider adding a `HairSalon` or `BeautySalon`
JSON-LD block to `index.html` with your address, phone, business hours and booking URL, a `sitemap.xml` listing the
pages, and a `robots.txt` that points to it.

## Accessibility

Built in:

- A "Skip to content" link, landmarks (`header`, `nav`, `main`, `footer`) and one `<h1>` per page.
- Visible focus styles.
- Menu button with `aria-expanded`; Escape closes the menu.
- Toggle buttons with `aria-pressed` for filters, saved looks, dates and time slots; unavailable dates are disabled and
  labeled "unavailable".
- Live regions for the services, team and gallery counts.
- Wizard steps with focusable headings, `aria-current="step"` on the progress list and focus on the confirmation.
- Form errors next to each field with `aria-invalid`, focus on the first error.
- Today's business hours row marked with `aria-current="date"`.
- Native `<dialog>` lightbox with focus return, and a native range input for the before/after slider.
- Reduced motion: no reveal animations and instant scrolling.

When editing, keep one `<h1>` per page, label every new input, give new error messages a `data-error` element, and
write alt text for meaningful photos. `--color-mute` is tuned for AA contrast on the light backgrounds; check contrast
if you darken the panels.

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` is compiled and included. Rebuild it after editing `src/input.css` or using Tailwind classes that
aren't in the files yet (Node.js 24):

```sh
npm install
npm run build    # or: npm run watch while you edit
```

Tailwind scans the HTML and `main.js`, so classes written in JavaScript strings (such as those in the stylist list) are
included.

### Deploying

The folder is a static site. Upload it as it is:

- **Netlify Drop:** drag the folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
- **GitHub Pages:** push the files to a repository and enable Pages for the branch.
- **Cloudflare Pages / any static host:** upload the folder; no build command is needed.

Configure your host to serve `404.html` for missing pages (Netlify and GitHub Pages do this automatically). You can
leave out `src/`, `package.json` and the Markdown files when uploading.

## Troubleshooting

- **A new treatment doesn't appear in the booking wizard.** Add both the `BLOOM.services` entry and the checkbox in
  `book.html`; the checkbox `value` must equal the `id`.
- **The booking breaks when a new treatment is checked.** The checkbox `value` has no matching service in
  `BLOOM.services`. Check spelling.
- **No times appear for a day.** The salon is closed that day in `BLOOM.hours`, nobody eligible works it (`days`), or
  every slot is taken in the demo schedule. Try "Anyone available".
- **A stylist link opens with "Anyone available".** The `?stylist=` id doesn't exist, or that person can't do the
  chosen treatments.
- **The "Open now" badge looks wrong.** It uses the visitor's local time and `BLOOM.hours`. Update `BLOOM.hours` when you
  change the hours tables.
- **A look or portrait image is missing in the lightbox or wizard.** The file must be named after the id:
  `assets/img/looks/<id>.svg` or `assets/img/team/<id>.svg`.
- **New Tailwind classes have no effect.** Run `npm run build`.
- **Social previews show no image.** Make `og:image` an absolute URL on your domain.

## License

MIT: the full text is in `LICENSE.txt`, included in the download. You can use, change and sell sites built with this
template, including the SVG artwork. Bloom Hair & Spa, its team and its clients are fictional.
