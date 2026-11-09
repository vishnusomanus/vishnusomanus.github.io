# Bistro documentation

## Overview

Bistro is a warm, high-end website for a restaurant, café or wine bar. The demo restaurant is **Olive &
Ember**, a fictional wood-fired Mediterranean kitchen in Annapolis, Maryland, with tabbed menus, a reservation
form whose time slots follow the opening hours, private dining packages and a live "open now" badge.
It is built with HTML5, Tailwind CSS v4 and a small vanilla JavaScript file, and needs no build step.
This guide covers version 1.1.11.

Live demo: [freeframe.dev/templates/bistro](https://freeframe.dev/templates/bistro)

## Quick start

1. Unzip the download and open `index.html` in a browser.
2. Or serve the folder with any static server:

   ```sh
   cd bistro
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

Node.js 24 is only needed to rebuild the CSS (see [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections |
|------|---------|------------------|
| `index.html` | Home | Fire hero, open-now strip, intro and stats, signature dishes, chef quote, reviews, hours and booking call to action |
| `menu.html` | Menus | Lunch / Dinner / Drinks / Desserts tabs, vegetarian / vegan / gluten-free filter, allergen notes |
| `about.html` | Story | Timeline, values, team, suppliers |
| `reservations.html` | Book a table | Reservation form with day-dependent time slots, policies sidebar |
| `events.html` | Private dining | Three packages, upcoming events, inquiry form |
| `contact.html` | Visit | Contact cards, opening hours with today highlighted, illustrated map, contact form, FAQ |
| `404.html` | Not found | Error page with links home, to the menu and to reservations |

Every page has a newsletter form in the footer.

## Project structure

```text
bistro/
├── index.html, menu.html, about.html, reservations.html, events.html, contact.html, 404.html
├── assets/
│   ├── css/style.css      compiled Tailwind CSS (generated)
│   ├── js/main.js         hours, menu, tabs, filter, forms, reveals, back to top
│   └── img/               SVG food, chef, fire and wine art, favicon, social image
├── src/input.css          Tailwind source: design tokens (@theme) and component classes
├── package.json           scripts to rebuild the CSS
├── template.json          template metadata used by freeframe.dev
├── README.md
├── CHANGELOG.md
└── DOCS.md                this guide
```

`assets/js/main.js` is split into five numbered sections: **1. Opening hours**, **2. Header + mobile
menu**, **3. Scroll reveal**, **4. Tabs + dietary filter** and **5. Forms**, followed by the back-to-top
block.

## Customizing

### Brand and colors

The palette and fonts are tokens in the `@theme` block at the top of `src/input.css`:

| Token | Used for |
|-------|----------|
| `--color-char`, `--color-char-2`, `--color-char-3` | Dark charcoal backgrounds (header, hero, dark bands) |
| `--color-cream`, `--color-parchment`, `--color-sand` | Light backgrounds and borders |
| `--color-ember`, `--color-ember-dark`, `--color-ember-light` | Primary accent: buttons, links |
| `--color-olive`, `--color-olive-light` | Secondary accent |
| `--color-gold` | Highlights, "Today" tags, dietary notes |
| `--color-muted` | Secondary text |

For example, a deep blue accent instead of ember:

```css
@theme {
  --color-ember: #2b4c7e;
  --color-ember-dark: #1f3a63;
  --color-ember-light: #7c9ccf;
}
```

Rebuild the CSS afterwards and update the `theme-color` meta tag in each page's `<head>`.

### Typography

Headings use **Cormorant Garamond** (`--font-display`) and text uses **Manrope** (`--font-sans`), loaded
from Google Fonts in each page's `<head>`. Replace that `<link>` on every page and the two tokens to
change them.

### Content

Text is plain HTML in the page files; the restaurant name, address and phone number appear on every
page, so use search and replace to rebrand.

**Opening hours** are set once in section 1 of `assets/js/main.js`:

```js
// Opening hours per weekday (0 = Sunday). Times are minutes after midnight.
// null = closed all day.
var HOURS = {
  0: { open: 12 * 60, close: 16 * 60 },
  1: null,
  2: { open: 17 * 60, close: 22 * 60 },
  // ...
};
var LAST_SEATING_BEFORE_CLOSE = 90; // minutes
var SLOT_STEP = 30;                 // minutes between reservation slots

var TIMEZONE = 'America/New_York';  // the restaurant's time zone (IANA name)
```

Set `TIMEZONE` to your restaurant's zone (for example `'America/New_York'` or `'America/Chicago'`). "Now" is
always read in that zone by `businessNow()`, so every visitor sees the same open/closed status, today's
row and bookable times, wherever their device is.

`HOURS` drives the open/closed badge, the highlighted row in the hours tables and the reservation
time slots. The hours **printed** in the HTML (hours tables on `contact.html`, the footer and other
pages) are plain text: update them to match. Each hours row lists the weekdays it covers so today's
row can be highlighted:

```html
<div class="hours-row border-cream/15" data-day="2,3,4"><dt>Tuesday – Thursday ...</dt><dd class="text-cream/60">5pm – 10pm</dd></div>
```

**Menu dishes** on `menu.html` are list items inside a tab panel and a group:

```html
<div data-menu-group>
  <h3>Small plates</h3>
  <ul>
    <li class="flex gap-6 border-b border-dashed border-sand py-5" data-dish data-diet="v gf">
      ...dish name, description and price...
    </li>
  </ul>
</div>
```

`data-diet` holds space-separated codes: `v` (vegetarian), `vg` (vegan) and `gf` (gluten-free), or is
empty. Show the matching badges (`badge-v`, `badge-vg`, `badge-gf`) inside the dish so guests can see
them. Every dish needs `data-dish`; every group of dishes needs `data-menu-group`.

**Private dining packages** on `events.html` each have an "Inquire" link with
`data-package="The Long Table"`; the value must match an `<option>` in the inquiry form's `package`
select (see [Forms](#forms)).

### Images and artwork

All artwork in `assets/img/` is original SVG: dishes (`dish-*.svg`), `chef.svg`, `hero-fire.svg`,
`wine.svg`, plus `favicon.svg` and the social image (`og-image.svg` source, `og-image.png` export at
1200×630). To use photos, save them in `assets/img/` and change the `src` attributes; keep similar
proportions (dish images are square-ish, the hero is wide) and write descriptive `alt` text.

### Navigation, header and footer

The header, mobile menu (`#mobile-nav`) and footer are repeated in every page. To add a page, copy one,
replace the content inside `<main>`, and add the link to the desktop navigation and `#mobile-nav` on
every page, marking the current page with `aria-current="page"`.

## Features

### Open now badge and today's hours

Any element with `data-open-status` shows the live status from `HOURS`, for example "Open now · until
10pm" or "Closed · opens tomorrow at 5pm", and gets `data-state="open"` or `"closed"` for styling. Its
`[data-open-text]` child receives the text. Rows with `data-day` get the `is-today` class on matching
weekdays. The status refreshes every minute.

The status uses the time in `TIMEZONE`, not the visitor's device clock, so a guest browsing from another
country still sees whether you're open right now.

### Menu tabs

The tab bar on `menu.html` (`data-tabs`) follows the WAI-ARIA tabs pattern: buttons with `role="tab"`,
`aria-selected` and `aria-controls` pointing at panels. **Left/Right** arrows move between tabs and
**Home/End** jump to the first or last. Clicking a tab updates the URL hash, and opening
`menu.html#drinks` selects the Drinks tab. To add a tab, add a button and a panel with matching
`aria-controls` and `id`.

### Dietary filter

Buttons with `data-diet-filter` (`all`, `v`, `vg`, `gf`) show only matching dishes in every tab. Vegan
dishes also count as vegetarian. Groups with no matching dishes are hidden, an empty-state message
(`[data-empty]` inside a panel) appears if a whole tab is empty, and `[data-filter-status]` announces the
result ("Showing 14 matching dishes and drinks.").

### Reservation time slots

On `reservations.html` the `time` select is filled from the chosen date:

- Slots run every `SLOT_STEP` minutes from opening until `LAST_SEATING_BEFORE_CLOSE` minutes before
  closing.
- For today, only slots at least an hour from now are offered.
- Closed days (`null` in `HOURS`) show "Closed that day" and the date field explains why.
- The date can't be in the past (`data-min-today`) or more than two months ahead (`data-max-months="2"`
  sets the field's `max` from today's date in `TIMEZONE`).
- Choosing "9 or more" guests shows a note pointing to private dining (`[data-party-note]`).
- A note under the field shows that day's kitchen hours and last seating.

### Character counters

A `<textarea>` with `data-count` and a `maxlength` shows "12 / 300" in the element whose id is the
textarea's id plus `-count` (for example `res-notes-count`).

### Mobile menu and header

The header (`data-header`) gains a background when the page scrolls. Below desktop width the button with
`data-nav-toggle` opens `#mobile-nav`, updates `aria-expanded`, and closes with **Esc** (returning focus)
or when the window gets wider.

### Scroll reveals

Elements with `data-reveal` fade in as they enter the viewport; delay them with `style="--d:100ms"`.
Reduced-motion settings make them appear immediately.

### Back to top button

Every page gets a "Back to top" button in the bottom-right corner, created by the "Back to top" block at
the end of `assets/js/main.js` and styled by the `.back-to-top` rules at the end of `src/input.css`. It
appears after about one screen of scrolling, scrolls to the top (instantly with reduced motion), moves
focus to the main content and lifts above toasts. Add `data-back-to-top-avoid` to anything you pin to
the bottom of the screen, or `data-back-to-top-hide` to a sticky element it must never cover. To remove
it, delete that JavaScript block and the CSS rules, then rebuild the CSS.

## Forms

Every form is marked `data-validate="<kind>"` and names its success panel with
`data-success="<id>"`:

| Form | Page | Fields |
|------|------|--------|
| Reservation (`data-validate="reservation"`) | `reservations.html` | `date`, `time`, `guests`, `seating` (radio cards), `occasion`, `name`, `email`, `phone`, `notes` |
| Private dining inquiry (`enquiry`) | `events.html` | `type`, `package`, `date`, `guests` (8–60), `name`, `email`, `message` (20+ characters) |
| Contact (`contact`) | `contact.html` | `topic`, `name`, `email`, `message` (10+ characters) |
| Newsletter (`newsletter`) | Footer of every page | `email` |

Validation uses the browser's constraints (`required`, `type="email"`, `pattern`, `min`/`max`,
`minlength`) with custom messages from data attributes on each field: `data-msg-required`,
`data-msg-pattern`, `data-msg-min` and `data-msg-max`. Errors appear in the element with id
`<field-id>-error` and the first invalid field is focused. On success the form is hidden and its success
panel shown; elements with `data-fill="name"` (or `date`, `time`, `guests`, `seating`) are filled with the
submitted values (a word marked `data-count-of="guests"` switches between its `data-one` and `data-other`
text, so the panel says "1 guest" or "2 guests"), and a `[data-reset]` button brings the form back.
`data-fill="ref"` shows a short reference made in the browser (`OE-` and four characters, from `makeRef()`).
If your booking system or form service returns its own reference, show that instead. The success panels say
what happens next ("We reply within a day", "within two business days", "We'll email to confirm your table");
change them to match how you actually handle requests.

**Nothing is sent until you connect the forms.** In section 5 of `assets/js/main.js`, find the comment
"Demo only: nothing is sent anywhere" in the submit handler and post the data first, for example to
[Formspree](https://formspree.io):

```js
fetch('https://formspree.io/f/YOUR_ID', {
  method: 'POST',
  body: new FormData(form),
  headers: { Accept: 'application/json' }
}).then(function (res) {
  if (!res.ok) throw new Error('Request failed');
  // ...existing success code: fill data-fill elements, hide the form, show the success panel
}).catch(function () {
  alert('Sorry, your request could not be sent. Please call us.');
});
```

Use `form.dataset.validate` to send each form type to a different endpoint. Netlify Forms also works:
add `data-netlify="true"` and a `name` to each `<form>`. For real reservations you will usually want a
booking system (OpenTable, Resy, SevenRooms...) instead of email; replace the reservation form with their
widget or link, and keep the page around it.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `twitter:card`. When you deploy,
change `og:image` on every page to an absolute URL:

```html
<meta property="og:image" content="https://example.com/assets/img/og-image.png">
```

Restaurants benefit from [Restaurant structured data](https://schema.org/Restaurant): consider adding a
JSON-LD block with your address, phone, hours and menu URL to `index.html` and `contact.html`, and a
`sitemap.xml` listing your pages.

## Accessibility

- Skip link, labeled landmarks and one `<h1>` per page.
- Menu tabs use the tabs pattern with arrow-key support; filter buttons use `aria-pressed`.
- Dietary badges have visible codes plus screen-reader text ("Vegetarian").
- Form errors are linked with `aria-describedby`, fields get `aria-invalid`, and success panels receive
  focus.
- Animations (reveals, the flicker on the fire art) respect `prefers-reduced-motion`.

When editing, keep the screen-reader text on new dietary badges, label new form fields, and keep one
`<h1>` per page.

## Building and deploying

`assets/css/style.css` is pre-built. Rebuild it after editing `src/input.css` or using Tailwind classes
that aren't in the CSS yet. With Node.js 24:

```sh
npm install
npm run build     # or: npm run watch
```

Bistro is a static site: upload the folder (without `node_modules/`) to Netlify, GitHub Pages,
Cloudflare Pages or any web host. No build command is needed on the host.

## Troubleshooting

- **The open/closed badge is an hour or more out.** Set `TIMEZONE` at the top of `assets/js/main.js` to
  your restaurant's IANA zone name (for example `'America/Chicago'`).
- **No reservation times appear.** Check `HOURS` for that weekday isn't `null`, and that opening hours
  minus `LAST_SEATING_BEFORE_CLOSE` leaves at least one slot.
- **A dish doesn't show up when filtering.** It needs `data-dish` and the right codes in `data-diet`
  (`v`, `vg`, `gf`).
- **`menu.html#drinks` doesn't open the Drinks tab.** The hash must match the tab's `aria-controls` value.
- **The "Inquire" button doesn't preselect a package.** Its `data-package` must exactly match an
  `<option>` in the `package` select.
- **New Tailwind classes have no effect.** Rebuild the CSS.
- **Forms "send" but nothing arrives.** Connect them as described in [Forms](#forms).

## License

Bistro is released under the MIT License (see `LICENSE.txt` in the download), for personal and
commercial use. The included SVG artwork is covered by the same license. Cormorant Garamond and Manrope
are licensed under the SIL Open Font License.
