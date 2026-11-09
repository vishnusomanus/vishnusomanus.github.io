# Smile documentation

## Overview

Smile is a bright, friendly website for a family and cosmetic dental practice. It's built for Grin Lane Dental, a
fictional practice in Boise, Idaho, with four dentists, three hygienists and a patient care team. It includes a
five-step booking flow whose time slots come from each clinician's schedule and the length of the visit, a pricing page
with a cost estimator and a payment-plan calculator, an emergency symptom guide, a multi-step new patient form and
filterable treatments and team pages. It's plain HTML5, Tailwind CSS v4 and one vanilla JavaScript file with no
dependencies. This guide covers version 1.0.8 of the HTML version. Live demo:
[freeframe.dev/templates/smile](https://freeframe.dev/templates/smile).

All health content is general information written for a fictional practice. Have a qualified professional review
every treatment description, triage rule and price before you publish your own site.

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Every page works straight from the file system: no install, build step or
   server is needed.
3. To preview it over HTTP (closer to how it behaves when hosted), serve the folder with any static server:

   ```sh
   npx serve .
   ```

You only need Node.js 24 if you change `src/input.css` or add Tailwind classes that aren't already in the compiled CSS
(see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero with "Book an appointment" and "Dental emergency?" buttons, live open-now badge, next available checkup card, emergency strip, $99 new patient offer, six treatment cards, why-us cards, four dentists, review carousel, insurance and Grin Club teaser, hours with map, call-to-action band |
| `treatments.html` | Treatments | 16 treatments filterable by category (`?category=`), each with what to expect, duration, from-price and a booking link; general-information note; FAQ accordion |
| `pricing.html` | Pricing and insurance | Fee table (stacks into cards on phones), three Grin Club plans, cost estimator, illustrative payment-plan calculator, insurance help |
| `team.html` | Team | Nine team members filterable by role (`?role=`) and by language, with training, specialties, days in the practice and "Book with" links |
| `new-patients.html` | New patients | First-visit timeline, what to bring, nervous-patient guide in tabs, five-step patient form with review screen, privacy summary (`#privacy`) |
| `book.html` | Book online | Five-step booking flow with a summary sidebar; accepts `?reason=` and `?clinician=` |
| `emergency.html` | Dental emergencies | Call and book buttons, "call 911 first" box, three-question symptom guide, first-aid tips, emergency hours |
| `contact.html` | Contact | Contact cards, validated contact form, map, hours, getting here and accessibility (`#accessibility`) |
| `404.html` | Not found | Friendly error page with links (has `noindex`) |

## Project structure

```text
smile/
  index.html, treatments.html, pricing.html, team.html, new-patients.html,
  book.html, emergency.html, contact.html, 404.html
  assets/
    css/style.css        compiled Tailwind CSS (generated, don't edit by hand)
    js/main.js           all interactivity and all practice data (hours, clinicians, prices, triage)
    img/
      favicon.svg        browser tab icon (the tooth logo)
      hero.svg           Pip the tooth mascot, used on the home page
      map.svg            illustrated map, used on the home and contact pages
      dr-*.svg, jess-kowalski.svg, amir-haddad.svg, lena-brooks.svg,
      rosa-delgado.svg, kit-moreau.svg   illustrated team portraits
      og-image.svg       source of the social sharing image
      og-image.png       1200 x 630 social sharing image used by og:image
  src/input.css          Tailwind source: brand tokens (@theme) and component classes
  package.json           scripts to rebuild the CSS
  README.md              short introduction
  CHANGELOG.md           version history
  DOCS.md                this guide
```

## Customizing

### Brand and colors

All design tokens live in the `@theme` block at the top of `src/input.css`. Tailwind turns each token into
utilities, so `--color-berry-600` becomes `bg-berry-600`, `text-berry-600` and so on.

| Token group | Used for |
|-------------|----------|
| `--color-berry-50` to `--color-berry-950` | Brand blue-violet: buttons and links (600), dark sections and the footer (950) |
| `--color-bubble-50` to `--color-bubble-800` | Playful pink: emergency buttons and badges, tags |
| `--color-lemon-50` to `--color-lemon-700` | Sunny highlight: offer cards, squiggle underline, icon dots |
| `--color-mint-50` to `--color-mint-800` | Calm green: open-now badge, "included" tags, self-care states |
| `--color-ink`, `--color-body`, `--color-muted` | Headings, body text and secondary text |
| `--color-line`, `--color-cream`, `--color-cloud` | Borders, page background and soft panels |

To change the brand color, replace the berry scale and rebuild the CSS:

```css
@theme {
  --color-berry-50: #eef6ff;
  --color-berry-100: #d9eaff;
  /* ...keep 50 to 950 from light to dark... */
  --color-berry-600: #1f6fd1;
  --color-berry-950: #0c1f3d;
}
```

Keep the 600 shade dark enough for white button text (at least 4.5:1 contrast). A few colors are written as hex
values in the SVG files and the inline SVGs (for example `#5146d4` for berry and `#1d1a4d` for ink), so search and
replace those too if you change the palette. The `theme-color` meta tag in each page uses the cream background
`#fffaf3`.

Component classes (`.btn`, `.btn-primary`, `.btn-lemon`, `.btn-pink`, `.btn-outline`, `.card`, `.chip`, `.field`,
`.option`, `.slot`, `.cal-day`, `.faq`, `.open-pill`, `.outcome`, `.squiggle` and more) are defined in
`@layer components` in the same file.

### Typography

Two Google Fonts are loaded in the `<head>` of every page:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400..700&amp;family=Nunito:ital,wght@0,400..900;1,400..700&amp;display=swap">
```

Fredoka is the rounded display face for headings (`font-display`, also applied to `h1` to `h4` in the base layer) and
Nunito is the body face (`font-sans`). To swap them, change the link in every page and the two tokens in
`src/input.css`:

```css
--font-display: "Fredoka", "Nunito", ui-rounded, "SF Pro Rounded", system-ui, sans-serif;
--font-sans: "Nunito", ui-rounded, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
```

The fallbacks keep the site readable if Google Fonts can't load. To self-host, download the fonts, add `@font-face`
rules to `src/input.css` and remove the Google Fonts links.

### Content

Page text lives in the HTML files. Practice data that drives interactive features lives in constants at the top of
`assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `PRACTICE` | Name, time zone (`America/Boise`), time zone label, phone and address used in the booking flow and `.ics` file |
| `HOURS` | Office hours per weekday (0 = Sunday, `null` = closed), used by the open-now badge and the booking slots |
| `CLOSED_DATES` | Whole-practice closures as `YYYY-MM-DD` |
| `LUNCH` | Lunch break applied on days longer than six hours |
| `CLINICIANS` | Each clinician's name, short name, role, portrait and working weekdays |
| `REASONS` | Visit types for booking: label, length in minutes, price note, who offers it and minimum notice |
| `BOOKING` | Slot interval, how far ahead people can book and the demo "taken" share |
| `ESTIMATE_ITEMS`, `MEMBERSHIP`, `FINANCE` | Cost estimator treatments and prices, Grin Club prices and discount, payment-plan terms |
| `TRIAGE` | Symptom guide questions, red flags, tips and outcome wording |

The office hours also appear as plain HTML lists (`<dl data-hours>`) in the footer and on the home, emergency and
contact pages. When you change `HOURS`, update those lists too.

**Add a clinician.** Add an entry to `CLINICIANS`, list their id in the `who` array of each visit type they offer,
then add a card to `team.html`:

```js
var CLINICIANS = {
  // ...
  park: { name: 'Dr. Grace Park', short: 'Dr. Park', role: 'Dentist', img: 'assets/img/dr-park.svg', days: [1, 3, 5] }
};
var REASONS = {
  checkup: { label: 'Checkup & cleaning', minutes: 60, price: '$165, or included in Grin Club', who: ['kowalski', 'haddad', 'brooks', 'park'], notice: 240 },
  // ...
};
```

Team cards in `team.html` use `data-tags` for the role filter (`dentist`, `hygienist` or `care`) and `data-langs` for
the language filter (codes that match the `<option>` values in the "Speaks" select):

```html
<li id="park" class="reveal card card-hover flex flex-col p-6" data-filter-item data-tags="dentist" data-langs="en ko">
```

Link straight to a clinician with `book.html?clinician=park`.

**Add a treatment.** Copy a card in `treatments.html` and set `data-tags` to one of the filter categories (`general`,
`cosmetic`, `orthodontics`, `implants`, `kids`, `emergency`). The booking button links to `book.html?reason=<id>` with
an id from `REASONS`. The chip counts update automatically. If the treatment should be in the estimator, add it to
`ESTIMATE_ITEMS`:

```js
{ id: 'veneer', name: 'Porcelain veneer', price: 1150, qty: 0 },
```

Add `included: { per: 'adult', count: 2 }` (or `per: 'kid'`) when Grin Club covers it. Keep the fee table in
`pricing.html` and the prices on `treatments.html` in step with these numbers.

### Images and artwork

All artwork is SVG, so it stays sharp and needs no image optimization:

- `hero.svg` (560 x 520) is Pip the tooth mascot on the home page. The two floating cards over it are HTML.
- Team portraits are 240 x 240 SVGs with a rounded square background. To use photos, keep a square crop (at least
  480 x 480 pixels), save them as `.jpg` or `.webp` in `assets/img/` and change the `src`, plus the `img` path in
  `CLINICIANS` so the booking flow shows the same picture.
- `map.svg` (600 x 480) is an illustrated map. You can replace it with a static map image, or an embedded map
  `<iframe>` (that adds an external request).
- Smaller illustrations (why-us cards, page headers, 404, nervous-patient card) are inline SVG in the HTML.
- `favicon.svg` is the tooth logo. The same mark is inline in the header and footer of every page.
- The social image is `og-image.png` (1200 x 630). Its source is `og-image.svg`. After editing the SVG, export it to
  PNG at 1200 x 630 with any vector editor or browser, because social sites don't display SVG.

### Navigation, header and footer

The header and footer are repeated in every HTML file. To add, rename or remove a page, edit the `<nav aria-label="Main">`
list, the mobile menu (`<nav id="mobile-menu">`) and the footer link lists in each page. The current page's links carry
`aria-current="page"`, which highlights them. The "Emergency?" pill shows from 1280 px wide; below that, emergency
is in the mobile menu and in each page's content.

The footer starts with a wave. Its color class (`text-cream` on most pages, `text-berry-50` on `treatments.html`)
matches the background of the section above it:

```html
<svg class="wave-top text-cream" viewBox="0 0 1440 60" preserveAspectRatio="none" aria-hidden="true">
```

## Features

### Booking flow

`book.html` has five steps: visit type, clinician, date and time, details and confirmation. The code is
`initBooking()` in `assets/js/main.js`; the markup uses `data-booking`, `data-step` and `data-step-indicator`.

- **Visit type** comes from the radio buttons named `reason`. Their values must match keys in `REASONS`.
- **Clinician** is built from the visit type's `who` list, plus "First available". Each option shows the next opening.
- **Date and time.** `slotsFor(reasonId, clinician, dateKey)` builds start times every `BOOKING.slotStep` minutes
  inside each clinician's working windows (practice `HOURS` on their `days`, minus `LUNCH` on long days), keeping
  only times where the whole visit (`minutes`) fits before the window ends. Times before now plus the visit's
  `notice` are skipped, as are `CLOSED_DATES` and anything beyond `BOOKING.daysAhead`. With "First available", each
  time is offered by the first free clinician in `who` order and the slot shows their name.
- **Demo availability.** `BOOKING.demoBusyShare` (0.55) marks a stable, pseudo-random share of slots as taken so the
  demo looks realistic. Set it to `0` when you load real availability.
- **Details** are validated (see [Forms](#forms)). The confirmation shows a summary with a reference, what happens
  next and an "Add to calendar (.ics)" button that downloads a tentative event converted from Boise time to UTC.
- **Links in.** `book.html?reason=emergency` preselects a visit type; `book.html?clinician=reyes` preselects a
  clinician when they offer the chosen visit type.

All times are practice times (`PRACTICE.timeZone`), because patients come in person. To move the practice, change
`timeZone` and `zoneName`.

Accessibility: each step's heading receives focus when it opens; the progress bar marks the current step with
`aria-current="step"`; the calendar uses a roving tabindex (arrow keys move by day and week, Home and End jump to
the start and end of the week, Page Up and Page Down move four weeks) and each day has a full label such as
"Thursday, October 15, 2026, 6 times available". Unavailable days use `aria-disabled`. Errors are announced next to
the step's buttons.

### Cost estimator

On `pricing.html`, `initEstimator()` renders a row with a stepper for each entry in `ESTIMATE_ITEMS`, plus steppers
for the number of adults and kids in the plan. It compares:

- **Pay as you go:** quantity x price for every item.
- **With Grin Club:** yearly membership (`MEMBERSHIP.adultYear` per adult, `MEMBERSHIP.kidYear` per child), items
  covered by `included` free up to their yearly count per member, and everything else at `MEMBERSHIP.discount` off.

The cheaper option gets a "Best value" tag and a sentence explains the saving. Results are in an `aria-live`
region; each stepper is a labeled group with "Fewer" and "More" buttons and a number input.

### Payment-plan calculator

Below the estimator (`[data-plan]`), visitors enter a cost between `FINANCE.min` and `FINANCE.max` (or use the
slider, or "Use my estimate from above") and choose a term from `FINANCE.terms`. The monthly payment uses the standard
amortized loan formula, or a simple division for 0% terms. The rates are deliberately labeled as made-up examples;
replace them with your financing provider's published terms or remove the section.

### Emergency symptom guide

`emergency.html` has a three-question guide (`initTriage()`, data in `TRIAGE`):

1. The main problem (one of `TRIAGE.symptoms`).
2. Red flags (checkboxes; "None of these" clears the others). A flag listed as `'911'` in `TRIAGE.flags` sends
   people straight to the "Call 911" outcome; `'call'` sends them to "Call us now".
3. A yes or no follow-up question from the symptom's `ask`. Symptoms with `ask: null` go straight to their `outcome`.

Outcomes are `911`, `call`, `today` and `self`. Each shows its own steps plus the symptom's `tip` and the matching
buttons (elements with `data-outcome-cta` listing the levels they belong to). The wording is intentionally cautious
and the page repeats that it's general information, not a diagnosis. If you change the rules, keep a route to
emergency services for breathing problems, spreading swelling and head injuries.

### New patient form

See [Forms](#forms) for validation and connection. The form has five fieldsets (`data-intake-step`) with Back and Next
buttons, a progress bar, a "None of these" option that clears the other medical history boxes, a typed signature that
must match the first and last name from step 1, and a review screen with an "Edit" button per section.

### Filters

Treatments and team use one generic filter (`[data-filter-root]` in `main.js`): chips with `data-filter` and
`aria-pressed`, items with `data-filter-item` and `data-tags`, an optional select (`data-filter-select`) matched
against `data-langs`, an `aria-live` status message, live counts on each chip, an empty state and a reset button. The
chip value is kept in the URL using the parameter named by `data-filter-param` (`category` or `role`), so filtered
views can be shared.

### Office hours and open-now badge

`renderHours()` highlights today's row in every `[data-hours]` list and adds "(today)" for screen readers. Every
`[data-open-status]` badge shows "Open now · until 5:00 pm" or "Closed · opens tomorrow 8:00 am", calculated in the
practice's time zone, and refreshes every minute. The home page's "Next checkup" card uses the booking engine to find
the first open checkup slot.

### Tabs, accordion and carousel

- The nervous-patient guide uses the ARIA tabs pattern (`role="tablist"`, arrow keys, Home and End).
- FAQ items on `treatments.html` are native `<details>` elements styled with `.faq`.
- The review carousel is a horizontally scrolling list with scroll snapping and previous and next buttons that
  disable at each end. It's keyboard-scrollable and needs no autoplay.

### Scroll reveals, motion and back to top

Elements with `.reveal` fade up as they enter the viewport. Revealing one element also reveals everything before it,
so jumping with the End key or an anchor never leaves gaps. Floating cards, the open-now pulse and the card hovers
stop for visitors who prefer reduced motion. The back-to-top button is created by the last block in `main.js`; delete
that block and the `.back-to-top` styles in `src/input.css` to remove it.

## Forms

Every form validates in the browser and shows a success state, but **nothing is sent, booked or stored until you
connect it**, even though the confirmation screens read as if it had been. They show a short reference (`GL-` and
four characters) made in the browser by `makeRef()` in `main.js`; if your PMS or form service returns its own
reference, show that instead. Check that the promises on those screens (a confirming text within an hour, a reply
within one business day, answers going to the patient record) match how your practice works.

Validation is driven by attributes, handled by `validateFields()` and `fieldMessage()` in `main.js`:

| Attribute | Rule |
|-----------|------|
| `required` | Must be filled, checked or chosen (use `data-required-msg` for a custom message) |
| `type="email"` | Must look like an email address |
| `data-phone` | At least 10 digits |
| `data-past-date` | A valid date in the past (date of birth) |
| `minlength` | Minimum length |
| `data-match` | Must equal `data-match-value` (set by the patient form for the signature) |
| `data-validate` | Opts the field into validation |

Errors appear under the field (or under the group for radio buttons), are linked with `aria-describedby`, set
`aria-invalid` and focus the first problem.

| Form | Page | Validates |
|------|------|-----------|
| Contact form (`data-contact-form`) | `contact.html` | Name, email, optional phone, topic, message of 10+ characters |
| Booking details (`data-booking-form`) | `book.html` | First and last name, email, mobile, new or returning, consent |
| New patient form (`data-intake`) | `new-patients.html` | Name, date of birth, phone, email, contact preference, visit reason, last visit, how nervous, medical history, consent and signature |

### Connecting the contact form

The contact form is a good fit for a form service such as Formspree. Add the endpoint to the form:

```html
<form class="mt-7 grid gap-5 sm:grid-cols-2" novalidate data-contact-form action="https://formspree.io/f/your-id" method="POST">
```

Then, in the `[data-contact-form]` submit handler in `main.js`, send it before showing the success state:

```js
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validateFields($$('[data-validate]', form))) return;
  fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    .then(function (res) {
      if (!res.ok) throw new Error('Send failed');
      // ...existing code that hides the form and shows [data-form-success]
    })
    .catch(function () { toast('Sorry, that didn’t send. Please call us instead.'); });
});
```

Ask people not to include medical details in this form (the page already does).

### Connecting the booking flow

Bookings belong in your practice-management system (PMS). Most offer an online-scheduling API or an embeddable
booking widget. Either replace the booking section with the widget, or keep this flow and:

1. Load real open times from the PMS (through your own server, so API keys stay private) and return them from
   `slotsFor()` in the same `{ mins, who }` shape. Set `BOOKING.demoBusyShare` to `0`.
2. In the `data-booking-form` submit handler, POST the visit type, clinician, date, time and details to your server,
   which creates the appointment in the PMS.
3. Show step 5 only after the PMS confirms, and change the confirmation copy to match.

Booking details are health information. Use HTTPS and a vendor that will sign a Business Associate Agreement (BAA)
in the US or a Data Processing Agreement (DPA) under the GDPR in the EU and UK.

### Connecting the new patient form

The patient form collects health information, so a general-purpose form service or plain email isn't appropriate:

- **US (HIPAA):** post it only to a HIPAA-eligible form or intake service that signs a BAA, or use your PMS's own
  patient intake forms and link to them instead.
- **EU and UK (GDPR):** health data is special category data. Use a processor with a DPA, keep the explicit consent
  checkbox in step 4, collect only what you need and state your retention period in your privacy notice. The `#privacy` section
  of `new-patients.html` is a short summary that points to your full privacy notice; link to yours there.

Replace the success handling in `initIntake()` (the `submit` listener on `[data-intake]`) with a POST to that
service. The answers are deliberately never written to `localStorage` or cookies; keep it that way.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags (`og:title`, `og:description`, `og:type`,
`og:site_name`, `og:image`), `twitter:card` and `theme-color` in its `<head>`. `404.html` also has
`<meta name="robots" content="noindex">`.

Social sites need an absolute image URL. After deploying, change `og:image` in every page to your domain, and
consider adding `og:url` and a canonical link:

```html
<meta property="og:image" content="https://www.example.com/assets/img/og-image.png">
<meta property="og:url" content="https://www.example.com/">
<link rel="canonical" href="https://www.example.com/">
```

Suggestions: add a `sitemap.xml` listing the eight content pages and a `robots.txt` that points to it, and add
`Dentist` structured data (schema.org JSON-LD) to `index.html` with your real name, address, phone, hours and
geo-coordinates. The template doesn't include structured data because it would describe a fictional practice.

## Accessibility

Built in:

- A skip link, landmarks (`header`, `nav`, `main`, `footer`), one `<h1>` per page and a logical heading order.
- Visible focus outlines on every interactive element and color contrast that meets WCAG AA.
- An accessible mobile menu (`aria-expanded`, `aria-controls`, Escape closes it and returns focus).
- ARIA patterns: tabs, `aria-pressed` filter chips and calendar days, `aria-current` for the current page and
  booking step, `aria-live` regions for filter counts, estimates and slot headings.
- Forms with real labels, grouped radio buttons and checkboxes in `fieldset` and `legend`, inline errors linked
  with `aria-describedby`, and focus moved to the first error or the next step's heading.
- Decorative SVGs are hidden with `aria-hidden="true"`; meaningful images have alt text.
- Reduced motion turns off reveals, floating cards, the pulse and hover lifts.

When you edit:

- Keep exactly one `<h1>` per page and don't skip heading levels.
- Give every new input a `<label>` and add `data-validate` when it needs checking.
- Check contrast when you change colors, especially white text on the 600 shades.
- Keep the emergency guidance visible and plain: it's the content people need most when they're stressed.

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` is compiled from `src/input.css`. Rebuild it after changing the theme, the component classes
or adding Tailwind classes that aren't used anywhere yet (Node.js 24):

```sh
npm install
npm run build    # one-off, minified
npm run watch    # rebuild on every change while you work
```

Tailwind scans the HTML and `assets/js/main.js` for class names. Classes built from strings in JavaScript must
appear in full somewhere (for example `'tag tag-mint'`), not assembled from pieces.

### Deploying

The site is a folder of static files. Upload the whole folder (you can leave out `src/`, `package.json` and the
Markdown files) to any static host: Netlify Drop, Cloudflare Pages, GitHub Pages, Vercel or regular web hosting.
Configure your host to serve `404.html` for missing pages. Serve the site over HTTPS, especially once forms are
connected.

## Troubleshooting

- **New classes have no effect.** They aren't in the compiled CSS yet. Run `npm run build`. If the class only
  appears inside a JavaScript string, make sure it's written out in full.
- **The open-now badge looks wrong.** It uses `PRACTICE.timeZone` and `HOURS` in `main.js`, not the HTML hours lists
  and not the visitor's clock. Check both and keep them in step.
- **The booking calendar shows no times.** Check that the visit type's `who` clinicians work on days that are open
  in `HOURS`, that the visit `minutes` fit inside the office hours, and that the dates aren't in `CLOSED_DATES` or
  beyond `BOOKING.daysAhead`. Late in the day, today may have no times because of the visit's `notice`.
- **Times in the downloaded .ics file are an hour off.** `wallToInstant()` converts practice time to UTC using
  `PRACTICE.timeZone`. Make sure it's a valid IANA zone such as `America/Denver`.
- **Fonts look different offline.** Fredoka and Nunito come from Google Fonts. Without a connection the rounded
  system font or `system-ui` is used. Self-host the fonts if the site must work offline.
- **The social preview has no image.** `og:image` must be an absolute `https://` URL to `og-image.png` on your
  domain.
- **A filter link opens unfiltered.** The parameter value must match a chip's `data-filter` exactly, for example
  `treatments.html?category=orthodontics` or `team.html?role=hygienist`.

## License

MIT. Free for personal and commercial use, including client work. The full license is in `LICENSE.txt` in the
download. All artwork (the mascot, portraits, map, icons and social image) is original to this template and covered by
the same license. The practice, people, reviews and prices are fictional.
