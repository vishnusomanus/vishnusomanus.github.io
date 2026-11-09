# Compass documentation

## Overview

Compass is a website template for coaches and consultants. The demo content is for **Bearing**, the fictional
leadership coaching practice of Nadia Whitcombe in Pittsburgh, who works with new managers, founders and senior
leaders through 1:1 coaching, a group cohort and team workshops. It is built with plain HTML5, Tailwind CSS v4 and
one vanilla JavaScript file with no dependencies. This is version 1.0.6 (see [CHANGELOG.md](CHANGELOG.md)). Live
demo: [freeframe.dev/templates/compass](https://freeframe.dev/templates/compass).

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
| `index.html` | Home | Hero with portrait and intro-call CTA, press wordmarks, "who it's for" persona cards, count-up outcomes, programs preview, four-step method, testimonial carousel, free guide sign-up, final CTA |
| `programs.html` | Programs and pricing | Foundations and Executive 1:1 packages, strategy session, First 90 Days cohort, team workshops, comparison table, FAQ accordion, "Recommended for you" badges |
| `method.html` | The Bearing Method | Interactive compass diagram with tabs, 60-minute session structure, six-month engagement timeline |
| `results.html` | Client results | Summary stats, eight client stories with before/after metrics, filters by client type, pull quote |
| `about.html` | About the coach | Story, studio illustration, career path, credentials, values, personal notes |
| `resources.html` | Resources | Leadership self-check quiz, filterable library of articles, worksheets and episodes, podcast, guide sign-up |
| `article.html` | Sample article | Long-form layout with drop cap, illustration, pull quote, "try this week" box, author card, related links |
| `book.html` | Book a call | Four-step booking flow with a live summary sidebar |
| `contact.html` | Contact | SVG map, studio address, contact cards, validated contact form, other ways to work together |
| `404.html` | Not found | Wandering compass needle and links back into the site |

## Project structure

```text
compass/
  index.html ... 404.html   the ten pages (header and footer are repeated in each)
  assets/
    css/style.css           compiled Tailwind CSS (generated, do not edit by hand)
    js/main.js              all interactivity: menu, reveals, carousel, filters, forms, quiz, booking
    img/
      favicon.svg           browser tab icon
      og-image.svg          social sharing image (source)
      og-image.png          social sharing image used in og:image (1200 x 630)
      nadia-portrait.svg    arch-framed portrait illustration (480 x 600)
      studio.svg            studio interior illustration (800 x 560)
      guide-cover.svg       cover of the free guide (360 x 460)
  src/input.css             Tailwind source: brand tokens and component classes
  package.json              build and watch scripts for the CSS
  README.md                 short introduction
  DOCS.md                   this guide
  CHANGELOG.md              version history
```

## Customizing

### Brand and colors

All design tokens live in the `@theme` block at the top of `src/input.css`. Each token becomes Tailwind utilities
(`bg-dusk-800`, `text-marigold-700`, `border-linen-200` and so on).

| Token group | Used for |
|-------------|----------|
| `--color-ivory`, `--color-linen-50` to `--color-linen-300` | Page background, soft section backgrounds, borders |
| `--color-stone-500` to `--color-stone-800` | Body copy and muted text |
| `--color-dusk-50` to `--color-dusk-950` | The brand indigo: buttons, links, dark sections, the footer |
| `--color-marigold-100` to `--color-marigold-700` | The warm accent: highlights, stars, accent buttons on dark backgrounds |
| `--color-clay-100` to `--color-clay-700` | Secondary accent for tags and illustrations |

To change the brand color, replace the dusk scale and rebuild the CSS:

```css
@theme {
  --color-dusk-700: #2f5d50;
  --color-dusk-800: #244a40;
  --color-dusk-900: #1a3730;
  --color-dusk-950: #12261f;
}
```

Keep the contrast rules noted in the comments: use `marigold-700` (not 400/500) for marigold text on light
backgrounds, and `stone-600` or darker for small text. Reusable pieces such as `.btn`, `.btn-primary`, `.card`,
`.chip`, `.input`, `.eyebrow` and `.display` are defined in the `@layer components` block of the same file.

The illustrations (`assets/img/*.svg`) and the inline SVGs use hex colors directly. If you change the palette,
search for the old hex values (for example `#2a3259` and `#f0c464`) and replace them.

### Typography

Two Google Fonts are loaded in the `<head>` of every page:

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400..700&amp;family=Source+Serif+4:ital,opsz,wght@0,8..60,300..600;1,8..60,300..600&amp;display=swap">
```

`--font-serif` (Source Serif 4) is used for headings, numbers and quotes through the `.display` class and
`font-serif`; `--font-sans` (Instrument Sans) is the body face. To swap fonts, change the link on every page and the
two `--font-*` tokens in `src/input.css`. Inline SVGs that contain text (press wordmarks, the method compass, the
podcast cover and the map) name the fonts in `font-family` attributes; quote family names that contain digits, as in
`font-family="'Source Serif 4', Georgia, serif"`.

### Content

Most content is plain HTML in the page files. A few things live in `assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `PROGRAMS` | Name, price, link and summary of each program, used by the quiz result |
| `QUIZ_QUESTIONS` | The six self-check questions and which result type each answer points to |
| `QUIZ_RESULTS` | The four result types: name, text, three next steps and the recommended program key |
| `CALL_TYPES` | Bookable call types: label, length in minutes, price and where it happens |
| `AVAILABILITY` | Studio time zone, weekly hours, slot spacing, notice period, booking window and closed dates |
| `COHORT_DATES`, `COHORT_MIN_WEEKS` | First 90 Days start dates. `null` (the default) shows rolling demo dates: the next second Wednesday of January, April, July or October at least `6` weeks away, and the one after it. Set `{ next: '2027-01-13', after: '2027-04-14' }` for real dates |

Client stories (`results.html`) and resources (`resources.html`) are HTML cards. Each card has a `data-tags`
attribute that the filters read. To add a client story, copy an `<article>` in `results.html` and set its tags:

```html
<article class="card reveal flex flex-col p-7 sm:p-9" data-tags="founders" id="story-maya" aria-labelledby="story-maya-title">
  ...
  <h2 id="story-maya-title" class="mt-5 font-serif text-[1.75rem] leading-tight text-dusk-950">Your headline</h2>
  ...
</article>
```

Valid story tags are the `data-filter` values of the chips: `managers`, `founders`, `executives`, `teams` and
`career`. A card can have several, separated by spaces (`data-tags="executives teams"`). The chip counts are
recalculated by the script, so you don't need to update the numbers by hand. Resource topics work the same way
(`delegation`, `feedback`, `confidence`, `strategy`, `career`). To add a new filter, add a chip button with a new
`data-filter` value and use that value in some cards.

Programs and prices appear on `programs.html`, in the home page preview, in the comparison table and in `PROGRAMS`
in `main.js`; keep them in step when you change a price.

Cohort dates are filled in by the script wherever an element has `data-cohort="next"` (the next cohort) or
`data-cohort="after"` (the one after it), in the format given by `data-cohort-format`: `full` ("Wednesday,
January 13, 2027"), `long` ("January 13, 2027"), `month` ("April 2027") or `season` ("Winter 2027"). They are
on the home page program preview and the cohort card on `programs.html`. The dates written in the HTML are
shown without JavaScript; keep them in step with `COHORT_DATES` once you set real dates.

### Images and artwork

All artwork is SVG, so there are no photos to license. To use real photos instead:

- Portrait (`nadia-portrait.svg`, used on home, about, article and book pages): replace with a 4:5 photo. To keep
  the arch shape, add `class="arch object-cover"` to the `<img>`; `.arch` rounds the top into a full arch.
- Studio (`studio.svg` on about): any 10:7 landscape image.
- Guide cover (`guide-cover.svg`): a 360 x 460 (roughly 4:5) cover image of your own lead magnet.
- The method compass, press wordmarks, map, podcast cover, article illustration and 404 compass are inline SVG in
  their pages. Replace the press wordmarks in `index.html` with your own logos, and only list publications that have
  really featured you.

The social image is `assets/img/og-image.png` (1200 x 630), rendered from `og-image.svg`. Edit the SVG, then export a
new PNG with any vector editor or a headless browser. The favicon is `assets/img/favicon.svg`.

### Navigation, header and footer

The header and footer are repeated in every page. To add or remove a page, edit the `<nav aria-label="Main">` list,
the `#mobile-menu` list and the footer columns in each HTML file. Mark the current page with `aria-current="page"` on
its link in both the desktop and mobile menus; the underline and mobile highlight come from that attribute. The
desktop menu appears from the `lg` breakpoint (1024 px); below that the menu button shows the mobile menu.

## Features

### Booking flow

`book.html` contains a four-step flow inside the `[data-booking]` element, driven by `initBooking()` in `main.js`:

1. **Call type**: radio cards named `call-type`, one per key in `CALL_TYPES`. Link to `book.html?type=strategy` (or
   `team`) to preselect a type.
2. **Date and time**: a month calendar (Monday first) and a list of time slots. Slots are generated from
   `AVAILABILITY`:

   ```js
   var AVAILABILITY = {
     timeZone: 'America/New_York',
     zoneName: 'Eastern Time',
     hours: { 1: [['09:00', '12:00'], ['13:30', '17:00']], /* ... */ 5: [['09:00', '12:30']] },
     slotStep: 30,
     minNoticeHours: 24,
     daysAhead: 45,
     closed: ['2026-11-26', '2026-12-25' /* ... */],
     demoBusyShare: 0.35
   };
   ```

   `hours` is keyed by weekday (0 is Sunday) in studio time; a slot fits when its whole length (`minutes` of the call
   type) ends before the window closes. `demoBusyShare` hides a stable share of slots so the demo looks realistic;
   set it to `0` once you connect real availability. Times are shown in the visitor's time zone (detected with
   `Intl`), with the studio time underneath and a "Show times in" selector to switch to studio time. Slots that
   cross midnight are labeled `(+1 day)`.
3. **Details**: a validated form (`[data-booking-form]`) with name, email, role, optional company, a message of at
   least 20 characters and a consent checkbox.
4. **Confirm**: a summary of the request with a reference (see [Forms](#forms)) and how to change or cancel, a
   **Save a calendar hold (.ics)** button that downloads an event file built in the browser, and **Book another call**.

The sidebar (`[data-booking-aside]`) updates as choices are made.

Accessibility: each step has a focusable heading that receives focus when the step changes; the step list marks the
current step with `aria-current="step"`. Calendar days are buttons with full-date `aria-label`s that include the
number of open times; only one day is in the tab order, and the arrow keys move by day and week, Home/End go to the
start/end of the week and Page Up/Page Down move four weeks. Unavailable days use `aria-disabled="true"`. Time slots
are native radio buttons inside a fieldset, and a missing date or time shows an inline `role="alert"` message.

### Leadership self-check

The quiz on `resources.html` (`#quiz`, element `[data-quiz]`) has three views: intro, questions and result.
Questions are rendered from `QUIZ_QUESTIONS` as a fieldset of radio buttons, one question at a time with a progress
bar and Back/Next buttons. Each answer is tagged with a result type; the type with the most answers wins, and ties
go to the type listed first in `QUIZ_RESULTS`. The result shows the type, three steps to try, a bar for each type and
the recommended program from `PROGRAMS`.

To change the quiz, edit the arrays: every question needs one answer per result type you want it to count toward,
and each result's `program` must be a key of `PROGRAMS`. Link to `resources.html#quiz` from anywhere to send people
to it. The legend of each new question receives focus so screen reader users hear it.

### Recommended program badge

On `programs.html`, elements with `data-recommended` (hidden by default) are shown inside the element whose
`data-program` matches the saved quiz result: `foundations`, `executive`, `cohort` or `teams`.

### Method compass

On `method.html`, the four tabs (`[data-compass-tabs]`, standard `role="tablist"` with arrow-key, Home and End
support) show one panel each. The compass SVG (`[data-compass]`) turns its `.needle` group to the selected point by
the shortest route and highlights the matching `[data-point]` circle; clicking a point in the drawing selects its tab.
The drawing is decorative for assistive technology, which uses the tabs.

### Filters

Any element with `data-filter-root` gets a filter: chip buttons with `data-filter` (with `all` meaning everything),
cards with `data-tags`, an optional `[data-filter-count]` live region and an optional `[data-filter-empty]` message.
The selected filter is written to the URL (`?type=` on results, `?topic=` on resources, set with
`data-filter-param`), so filtered views can be shared and linked, for example `results.html?type=founders`. Chips use
`aria-pressed`.

### Testimonial carousel

The home page carousel (`[data-carousel]`) is a horizontal scroll-snap list, so swiping, trackpads and the arrow
keys (once the list is focused) all work. The Previous/Next buttons scroll by one card and disable at the ends; the
"1 / 6" counter is visual only. There is no autoplay. To add a testimonial, copy an `<li>` and update its
`aria-label` ("7 of 7") and the others' totals.

### FAQ accordion

Each question on `programs.html` is a `.acc-btn` button with `aria-expanded` and `aria-controls` pointing to its
panel. Set `aria-expanded="true"` and remove `hidden` from a panel to open it by default.

### Count-up stats, scroll reveals and motion

Numbers with `data-count` (and optional `data-decimals`) count up once when they scroll into view; the final value
is already in the HTML. Elements with `.reveal` fade in on scroll (add `.reveal-delay-1` to `-3` to stagger), and
everything above a revealed element is revealed too. The 404 needle wanders with a CSS animation. All motion is
switched off when the visitor prefers reduced motion.

### Header, mobile menu and back to top

The header gains a border and shadow after scrolling. Below 1024 px the menu button toggles `#mobile-menu`, updates
`aria-expanded` and its label, and closes on Escape or when a link is chosen. A back-to-top button appears after
about one screen of scrolling and moves focus to the main content; to remove it, delete the "Back to top" block at
the end of `main.js` and the `.back-to-top` styles in `src/input.css`.

## Forms

There are four forms. None of them sends anything until you connect it, even though the success states read as if
it had been. The contact form and the booking confirmation show a short reference (`BL-` and four characters) made
in the browser by `makeRef()` in `main.js`; if your form service or booking tool returns its own reference, show
that instead. Check that the promises in those states (a reply within one business day, Nadia confirming each
booking request personally, a confirmation email for the guide) match how you work.

| Form | Where | Validates |
|------|-------|-----------|
| Guide sign-up (`[data-guide-form]`) | `index.html`, `resources.html` | First name required, email format |
| Contact (`[data-contact-form]`) | `contact.html` | Name, email, optional phone (7+ digits if filled), topic, message of 20+ characters |
| Booking details (`[data-booking-form]`) | `book.html` | Name, email, role, message of 20+ characters, consent checkbox |
| Quiz (`[data-quiz-form]`) | `resources.html` | An answer is chosen before moving on |

Validation is driven by `data-validate` attributes (`required`, `email`, `phone-optional`, `message`, `consent`) and
the messages in `fieldMessage()` in `main.js`. Errors appear under the field, are linked with `aria-describedby`,
set `aria-invalid="true"` and clear as the visitor fixes them; the first invalid field receives focus.

### Connecting to Formspree

Create a form at Formspree and copy its endpoint. Then, in `main.js`, find the comment
`Connect a real endpoint here` in the guide/contact form handler and send the data before showing the success panel:

```js
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!validateForm(form)) return;
  fetch('https://formspree.io/f/your-id', {
    method: 'POST',
    body: new FormData(form),
    headers: { Accept: 'application/json' }
  }).then(function (res) {
    if (!res.ok) throw new Error('Send failed');
    form.hidden = true;
    success.classList.remove('hidden');
    success.focus();
  }).catch(function () {
    alert('Sorry, something went wrong. Please email hello@bearing.example.');
  });
});
```

Keep the lines that fill in the success text and the reference (`[data-success-text]`, `[data-success-ref]`) before
showing the panel. For the guide sign-up you can instead
post to your email tool (Kit, Mailchimp, Buttondown) using the form action it gives you.

### Booking flow

You have three options:

- **Replace it with an embed.** Remove the `[data-booking]` section in `book.html` and paste the inline embed code
  from Cal.com or Calendly. Keep the page header and remove the booking code from `main.js` if you like (it only runs
  when `[data-booking]` exists).
- **Keep the flow and send a request.** In the `[data-booking-form]` submit handler in `initBooking()`, post the
  details plus the chosen slot (`state.type`, `state.slot.at.toISOString()`) to a form service before calling
  `goTo(4)`, then confirm each request by hand. Change the step 4 notice to say a confirmation will follow.
- **Use a scheduling API.** Load real free slots from the Cal.com or Calendly API on your own server and replace
  `slotsFor()` with them; never put API keys in `main.js`.

## Saved data (localStorage)

| Key | Shape | Notes |
|-----|-------|-------|
| `compass-quiz-v1` | `{ "answers": [0, 2, 1, 0, 3, 2], "date": "2026-10-12" }` | One answer index per question |

On read, the value is ignored unless `answers` is an array with exactly one whole-number index per question, each in
range. The result type is always recalculated from the answers, so editing `QUIZ_RESULTS` never leaves a stale
result. **Retake the self-check** removes the key. To clear it manually, run
`localStorage.removeItem('compass-quiz-v1')` in the browser console. If storage is blocked, the quiz still works; it
just isn't remembered. If you change the questions, bump the key (for example `compass-quiz-v2`) in `QUIZ_KEY`.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `theme-color` in its `<head>`. Update them
with your name, city and services. `og:image` points to `assets/img/og-image.png`; most social networks need an
absolute URL, so change it to your domain when you publish:

```html
<meta property="og:image" content="https://www.example.com/assets/img/og-image.png">
```

Also add a `sitemap.xml` listing your pages and a `robots.txt`, and consider `ProfessionalService` or `Person`
structured data (JSON-LD) on the home and about pages with your name, address and services.

## Accessibility

Built in: a skip link, semantic landmarks, one `<h1>` per page and a logical heading order, visible focus rings
(`:focus-visible` in `src/input.css`), WCAG AA contrast for text, `aria-current` in the navigation, labeled form
fields with inline errors, `aria-pressed` filter chips with a live result count, accessible tabs and accordion, a
keyboard-operable calendar, a carousel that never moves on its own, `alt` text or `aria-hidden` on every image and
SVG, and reduced-motion support everywhere.

When editing: keep one `h1` per page, give every new input a `<label>`, keep the `aria-controls` ids of tabs and
accordion buttons in step with their panels, keep `alt` text meaningful when you swap illustrations for photos, and
check new color pairs for contrast (small text on ivory should be `stone-600` or darker).

## Building and deploying

### Rebuilding the CSS

`assets/css/style.css` is generated from `src/input.css` and the classes used in the HTML and JavaScript. After
changing either, rebuild it with Node.js 24:

```sh
npm install
npm run build    # minified build
npm run watch    # rebuild on every save while you work
```

Classes that only appear inside JavaScript strings must be written out in full in a scanned file so Tailwind finds
them.

### Deploying

Upload the whole folder to any static host: Netlify (drag it onto Netlify Drop), Cloudflare Pages, GitHub Pages,
Vercel or plain shared hosting. There is no server code. `src/`, `package.json` and the Markdown files are not needed
at runtime, so you can leave them out. Most hosts serve `404.html` automatically for missing pages; on others, set it
as the error page.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| New Tailwind classes have no effect | Rebuild the CSS (`npm run build`); the compiled file only contains classes that were in use when it was built |
| No time slots on any day | Check `AVAILABILITY.hours` uses weekday numbers 0 to 6 and `"HH:MM"` strings, the call length fits inside each window, and `daysAhead` is larger than `minNoticeHours` / 24 |
| Times look an hour off around daylight saving changes | Make sure `AVAILABILITY.timeZone` is an IANA name such as `America/New_York`, not a fixed offset |
| The quiz always shows an old result | It is saved in `localStorage`; click **Retake the self-check** or remove `compass-quiz-v1`, and bump `QUIZ_KEY` when you change the questions |
| A filter chip shows 0 or the wrong cards | The chip's `data-filter` value must appear exactly (lowercase, no spaces) in the cards' `data-tags` |
| SVG text renders in the wrong font | Quote font names that contain digits in `font-family` attributes, for example `'Source Serif 4'` |
| Fonts look different offline | Google Fonts need a connection; the system fallbacks in `--font-serif` and `--font-sans` are used otherwise |
| Content stays invisible after editing | Elements with `.reveal` start hidden until `main.js` runs; check the script path and the browser console for errors |

## License

MIT. Free for personal and commercial use; see `LICENSE.txt` in the download (the repository's MIT License). The
illustrations, icons and artwork in `assets/img/` and inline in the pages are part of the template and covered by the
same license. All people, clients, companies and publications named in the demo are fictional.
