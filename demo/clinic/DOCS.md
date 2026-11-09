# Clinic documentation

## Overview

Clinic is a calm, accessible website for a dental or medical practice, with treatments and typical
costs, the care team, patient information and a five-step online booking wizard. The demo practice is
**Brightside Dental**, a fictional family dental clinic. It is built with HTML5, Tailwind CSS v4 and one
vanilla JavaScript file, and needs no build step. This guide covers version 1.1.12.

Live demo: [freeframe.dev/templates/clinic](https://freeframe.dev/templates/clinic)

All treatment descriptions, prices and aftercare notes are placeholder copy, not medical advice.
Replace them with your practice's own information.

## Quick start

1. Unzip the download and open `index.html` in a browser.
2. Or serve the folder with any static server:

   ```sh
   cd clinic
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

Node.js 24 is only needed to rebuild the CSS (see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections |
|------|---------|------------------|
| `index.html` | Home | Hero with "next free slot" card, services, why us, team preview, reviews with rating breakdown, insurers, hours with open-now badge, map |
| `services.html` | Treatments | Four groups of expandable treatments with typical costs, payment plans prompt |
| `service.html` | One treatment in depth (dental implants) | Four-step timeline, aftercare, FAQs, sticky cost breakdown, related treatments |
| `team.html` | Care team | Eight people with credentials and languages, specialty filter |
| `appointments.html` | Online booking | Five-step wizard with a live summary |
| `patients.html` | Patient information | First visit, insurance search, downloadable forms, payment plans, FAQ, privacy |
| `contact.html` | Contact | Contact form, emergency notice, hours, contact cards, map, directions, accessibility |
| `404.html` | Not found | Error page with links back |

Most pages have a newsletter form in the footer.

## Project structure

```text
clinic/
├── index.html, services.html, service.html, team.html, appointments.html, patients.html, contact.html, 404.html
├── assets/
│   ├── css/style.css      compiled Tailwind CSS (generated)
│   ├── js/main.js         settings, hours, forms, team filter, insurance search, booking wizard, back to top
│   └── img/               team portraits (dr-*.svg and others), hero.svg, map.svg, favicon, social image
├── src/input.css          Tailwind source: design tokens (@theme) and component classes
├── package.json           scripts to rebuild the CSS
├── template.json          template metadata used by freeframe.dev
├── README.md
├── CHANGELOG.md
└── DOCS.md                this guide
```

`assets/js/main.js` is organized in seven numbered sections listed in its header comment. Section **1.
Settings** holds everything you are likely to change.

## Customizing

### Brand and colors

The palette and fonts are tokens in the `@theme` block at the top of `src/input.css`:

| Token | Used for |
|-------|----------|
| `--color-brand-50` … `--color-brand-900` | Teal brand scale: buttons, links, icons, focus rings, dark sections |
| `--color-sun`, `--color-coral` | Warm accents in illustrations and highlights |
| `--color-sky-soft`, `--color-cream` | Soft section backgrounds |
| `--color-ink`, `--color-body`, `--color-muted` | Headings, body text and secondary text |
| `--color-line` | Borders |
| `--radius-blob` | Rounded "blob" corners |

To switch to a blue brand, replace the brand scale (keep the lighter-to-darker order) and rebuild:

```css
@theme {
  --color-brand-500: #2f6fd1;
  --color-brand-600: #2459ad;
  --color-brand-700: #1d4789;
}
```

Keep `--color-brand-600` and darker shades dark enough for white text (WCAG AA). Update the
`theme-color` meta tag in each page's `<head>` too.

### Typography

Text uses **Figtree** (`--font-sans`) and headings use **Fraunces** (`--font-display`), loaded from
Google Fonts in each page's `<head>`. The base text size is slightly larger than usual for readability;
keep it that way. To change fonts, replace the Google Fonts `<link>` on every page and the two tokens.

### Content

Text, treatments, costs and FAQs are plain HTML. The practice name, phone number and address appear on
every page; use search and replace to rebrand.

**Booking settings** are in section 1 of `assets/js/main.js`:

```js
// Opening hours per weekday (0 = Sunday). Times are 24h decimals: 8.5 = 8:30 am.
var HOURS = {
  0: null,
  1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19],
  5: [8, 16],
  6: [9, 14]
};
var LUNCH = [12.5, 13.5];        // no appointments during lunch (weekdays)
var SLOT_STEP = 30;              // minutes between appointment start times
var MIN_NOTICE_MINUTES = 90;     // earliest bookable time from now
var WEEKS_AHEAD = 4;             // how far ahead people can book

var TIMEZONE = 'America/Los_Angeles'; // the practice's time zone (IANA name)
```

Set `TIMEZONE` to your practice's zone. `nowInZone()` reads "now" there, so the open-now badge, today's
row, the next free slot and the bookable times are the same for every visitor, wherever their device is.

**Clinicians** (used by the booking wizard) are in `CLINICIANS`, keyed by an id. `days` lists the
weekdays they work (0 = Sunday):

```js
'dr-okoye': { name: 'Dr. Amara Okoye', role: 'General & family dentist', days: [1, 2, 3, 4, 5] },
```

The wizard shows each clinician's portrait from `assets/img/<id>.svg`, so add a portrait with the same
file name when you add someone.

**Bookable treatments** are in `SERVICES`. `minutes` sets the appointment length and `who` lists the
clinician ids who offer it:

```js
{ id: 'checkup', name: 'Check-up & cleaning', minutes: 60, note: 'Exam, clean and polish', who: ['dr-okoye', 'jordan-ellis', 'sofia-marchetti'] },
```

The team page and treatment pages are static HTML, so update them separately when you change
`CLINICIANS` or `SERVICES`. Likewise, the **printed** opening hours (`data-hours` lists on several pages)
are plain HTML: keep them in step with `HOURS`.

### Images and artwork

All artwork in `assets/img/` is original SVG: team portraits (`dr-*.svg`, `jordan-ellis.svg`,
`sofia-marchetti.svg`, `grace-liu.svg`), `hero.svg`, `map.svg`, `favicon.svg` and the social image
(`og-image.svg` source, `og-image.png` export at 1200×630). Replace portraits with photos of the same
portrait proportions (they are cropped from the top), and keep the file names that `CLINICIANS` ids
expect, or change the path in `renderClinicians()`.

### Navigation, header and footer

The header, mobile menu (`#mobile-menu`) and footer are repeated in every page. To add a page, copy one,
replace the content inside `<main>`, and add the link to the desktop and mobile menus on every page with
`aria-current="page"` on the current one.

## Features

### Open-now badge and today's hours

Elements with `data-open-status` show "Open now · closes at 7:00 pm" or "Closed now · opens tomorrow at
8:00 am" and get `data-open="true"`/`"false"` for styling; the text goes into their `[data-open-text]`
child. Hours lists marked `data-hours` highlight today's `.hours-row` with `data-today="true"` and
`aria-current="date"`. `data-day` uses the same numbers as `HOURS` (`0` = Sunday … `6` = Saturday). The
status refreshes every minute and uses the time in `TIMEZONE`.

### Next free slot

On the home page, `[data-next-slot]` shows the earliest free 60-minute slot in the next two weeks across
all clinicians, for example "Tomorrow, 9:30 am".

### Booking wizard

`appointments.html` contains the wizard (`form[data-booking]`) with five `fieldset[data-step]` steps:

1. **Treatment**: generated from `SERVICES`. Link to `appointments.html?service=implant` to preselect one.
2. **Clinician**: the people in that treatment's `who` list, plus "First available".
3. **Date and time**: a week view (up to `WEEKS_AHEAD` weeks) and time slots.
4. **Your details**: `first`, `last`, `email`, `phone`, `dob`, `insurance`, `returning` (new or
   returning), `notes` and a required `consent` checkbox.
5. **Review**: every choice with a "Change" link back to its step.

Time slots are calculated by `slotsFor(date, minutes, clinicianIds)`:

- start every `SLOT_STEP` minutes from opening, as long as the appointment ends by closing time;
- skip the `LUNCH` window on weekdays;
- skip anything sooner than `MIN_NOTICE_MINUTES` from now;
- only count clinicians who work that weekday;
- mark some slots as already booked using `isTaken()`, a fixed pattern so the demo looks realistic.

Sundays and other closed days, past days and days with no free times are disabled. A live summary card
(`[data-sum="service"]`, `"clinician"`, `"when"`, `"length"`) follows the choices. Each step is validated
before moving on, and focus moves to the step's heading. The confirmation (`[data-done]`) shows a
reference in `[data-done-ref]` (see [Forms](#forms)), says the practice will confirm by email within one
business day and gives the phone number for changes. Nothing is booked until you connect it.

**To take real bookings**, replace `isTaken()` with availability from your scheduling system and send
the booking in the submit handler (see [Forms](#forms)). Many practices embed their practice-management
or booking provider's widget instead; you can drop it into `appointments.html` in place of the form.

### Team filter

On `team.html`, buttons with `data-filter` (`all`, `general`, `ortho`, `kids`, `surgery`, `cosmetic`,
`hygiene`, `care`) show matching cards in `[data-filter-grid]` by their `data-specialty`, with a live
count in `[data-filter-count]`. Add a button and use the same value on cards to add a specialty.

### Insurance search

On `patients.html`, the search field `[data-plan-search]` filters every `[data-plan]` element by its
text, updates `[data-plan-count]` and shows `[data-plan-empty]` when nothing matches. Add an insurer by
adding another element with `data-plan`.

### Downloadable forms

Links with `data-demo-download` show a toast instead of downloading (it says the form is being updated
and asks the patient to complete it in the waiting room). Put your PDFs in `assets/`, set each link's
`href` to the file, and remove the `data-demo-download` attribute.

### Mobile menu, header and reveals

The header gets a shadow once the page scrolls. Below 1024px the `[data-menu-toggle]` button opens
`#mobile-menu`, swaps its icon, updates `aria-expanded` and closes with **Esc**. Elements with `reveal`
fade in when scrolled into view (everything above is revealed too) and appear immediately with reduced
motion.

### Back to top button

Every page gets a "Back to top" button in the bottom-right corner, created by the "Back to top" block at
the end of `assets/js/main.js` and styled by the `.back-to-top` rules at the end of `src/input.css`. It
appears after about one screen of scrolling, scrolls to the top (instantly with reduced motion), moves
focus to the main content and lifts above toasts. The sticky cost card on `service.html` uses
`data-back-to-top-hide` so the button never covers it. Add `data-back-to-top-avoid` to anything you pin
to the bottom of the screen. To remove the button, delete that JavaScript block and the CSS rules, then
rebuild the CSS.

## Forms

| Form | Page | Notes |
|------|------|-------|
| Contact | `contact.html` | Marked `data-validate` with its own success text |
| Newsletter | Footer of most pages | Email only |
| Booking wizard (`data-booking`) | `appointments.html` | See [Booking wizard](#booking-wizard) |

Forms marked `data-validate` are checked by `validateField()`: required fields, email format, phone
numbers on fields with `data-phone` (at least 7 digits), `minlength`, and dates of birth in the future.
Errors appear under each field, are linked with `aria-describedby`, and the first invalid field is
focused. On success the `[data-success]` element shows the form's `data-success-text`, with any `{ref}`
replaced by a short reference (`BD-` and four characters) made in the browser by `makeRef()`. The contact
form uses it; the booking wizard shows one too. If your form service or scheduling system returns its own
reference, show that instead.

The confirmations read as if the form had been sent: the contact form promises a reply within one working
day, the booking wizard a confirming email within one business day, and the newsletter a confirmation email.
Check those promises match how your practice works.

**Nothing is sent until you connect the forms.** For the contact and newsletter forms, add an `action`
(for example a [Formspree](https://formspree.io) endpoint) and, in section 5 of `assets/js/main.js`,
replace the success code in the submit handler (after the comment "To send for real") with:

```js
fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  .then(function (res) {
    if (!res.ok) throw new Error('Request failed');
    var success = $('[data-success]', form);
    success.textContent = (form.dataset.successText || 'Thank you!').replace('{ref}', makeRef('BD'));
    success.classList.remove('hidden');
    form.reset();
  })
  .catch(function () { toast('Sorry, that didn’t send. Please call us instead.'); });
```

For the booking wizard, look for the comment "To take real bookings" in the wizard's submit handler and
send `new FormData(booking)` together with the chosen `state` (service, clinician, date, time) to your
scheduling system before showing the confirmation.

Health information is sensitive: send forms only over HTTPS to services you trust, ask for the minimum
needed, and check your local privacy rules (for example HIPAA in the US or GDPR in the EU) before
collecting medical details online.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `twitter:card`. When you deploy,
change `og:image` on every page to an absolute URL:

```html
<meta property="og:image" content="https://example.com/assets/img/og-image.png">
```

Local practices benefit from [Dentist](https://schema.org/Dentist) or MedicalClinic structured data
(address, phone, opening hours) in a JSON-LD block, and a `sitemap.xml` listing your pages.

## Accessibility

Clinic is built for patients of all ages and abilities:

- Larger base text, high contrast, thick 3px focus rings, skip link and labeled landmarks.
- The wizard uses fieldsets with legends, moves focus to each step's heading, marks the current step
  with `aria-current="step"`, and labels each day button with its date and availability.
- Filter buttons use `aria-pressed`; the mobile menu uses `aria-expanded` and closes with Esc.
- Form errors are announced and linked to their fields.
- Animations respect `prefers-reduced-motion`.

When editing, keep text contrast at WCAG AA, give new images meaningful `alt` text, and label every new
form field.

## Building and deploying

`assets/css/style.css` is pre-built. Rebuild it after editing `src/input.css` or using Tailwind classes
that aren't in the CSS yet, including classes in the HTML that `assets/js/main.js` generates. With
Node.js 24:

```sh
npm install
npm run build     # or: npm run watch
```

Clinic is a static site: upload the folder (without `node_modules/`) to Netlify, GitHub Pages,
Cloudflare Pages or any web host. No build command is needed on the host.

## Troubleshooting

- **Open-now badge or slots are an hour or more out.** Set `TIMEZONE` at the top of `assets/js/main.js` to
  your practice's IANA zone name (for example `'America/Chicago'`).
- **A treatment has no free days.** Check that its `who` clinicians work on open days (`days` in
  `CLINICIANS`) and that the appointment length fits within the hours outside `LUNCH`.
- **A clinician's portrait is missing in the wizard.** Add `assets/img/<clinician-id>.svg` (or change the
  path in `renderClinicians()`).
- **Today's row in the hours list is off by one day.** `data-day` must use the same numbers as `HOURS`
  (`0` = Sunday … `6` = Saturday).
- **`?service=` doesn't preselect a treatment.** The value must match an `id` in `SERVICES`.
- **New Tailwind classes have no effect.** Rebuild the CSS.
- **Forms "send" but nothing arrives.** Connect them as described in [Forms](#forms).

## License

Clinic is released under the MIT License (see `LICENSE.txt` in the download), for personal and
commercial use. The included SVG portraits and illustrations are covered by the same license. Figtree
and Fraunces are licensed under the SIL Open Font License.
