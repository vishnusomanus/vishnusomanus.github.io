# Vows documentation

## Overview

Vows is a wedding website for **Amara & Theo**, a fictional couple marrying at Hollowridge House on Saturday, June 19, 2027. Guests can find their invitation by code or name and RSVP for everyone on it (meal choices, dietary
needs, plus-ones, song requests). It has a live countdown, a weekend schedule with add-to-calendar `.ics` files, a
travel page with an illustrated map and room blocks, a registry with reservations and a honeymoon fund, an
illustrated gallery with a lightbox and a searchable FAQ. All artwork is botanical SVG, no photos needed. This is the
**HTML + Tailwind CSS v4** version, **1.0.12**: static pages plus two vanilla JavaScript files, no build step needed
to run it.

Live demo: [freeframe.dev/templates/vows](https://freeframe.dev/templates/vows)

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Everything works from your computer, including the RSVP and calendar downloads.
3. Try the RSVP with a demo code such as `ROSE-24`, or a name such as `Priya Shah`.

To preview it the way a host serves it (needed for copy-to-clipboard, which browsers only allow on `https://` or
`localhost`):

```sh
cd vows
python3 -m http.server 8000   # then open http://localhost:8000
```

**Node.js 24** is only needed to rebuild the CSS after changing styles (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable features |
| --- | --- | --- |
| `index.html` | Home | Names and date, live countdown (`data-countdown`), save the date with an add-to-calendar button, "Plan your weekend" links, story teaser, weekend overview, RSVP call to action |
| `story.html` | Our story | Illustrated timeline |
| `schedule.html` | The weekend | Friday, Saturday and Sunday events with dress codes; a calendar file per event and for the whole weekend |
| `travel.html` | Travel and stay | Illustrated map with a selectable legend, train/car/shuttle, room blocks with copyable booking codes, local tips |
| `rsvp.html` | RSVP | Find the invitation, reply for each guest, review, confirmation |
| `registry.html` | Registry | Honeymoon fund with preset or custom amounts; gift list with category filter, "Hide reserved gifts" and reservations |
| `gallery.html` | Gallery | Nine illustrations in a grid with a lightbox |
| `faq.html` | FAQ | Searchable questions in groups |
| `404.html` | Page not found | Links back home |

## Project structure

```text
vows/
├── index.html … 404.html   the nine pages (header and footer repeated in each)
├── assets/
│   ├── css/style.css       compiled Tailwind CSS (do not edit; rebuild from src/input.css)
│   ├── js/data.js          window.VOWS: couple, events, meals, guest list, registry, fund, gallery
│   ├── js/main.js          every interactive feature
│   └── img/
│       ├── gallery-*.svg   the nine gallery illustrations
│       ├── wreath.svg, sprig.svg, corner.svg   botanical ornaments
│       ├── favicon.svg     favicon
│       ├── og-image.svg    source of the social image
│       └── og-image.png    social sharing image, 1200×630
├── src/input.css           Tailwind entry: @theme tokens and component classes
├── package.json            Tailwind CLI scripts (build, watch)
└── template.json           template metadata and version
```

## Customizing

### Brand and colors

Design tokens are in the `@theme` block of `src/input.css`:

| Token | Default | Used for |
| --- | --- | --- |
| `--color-paper` | `#fbf7f0` | Page background |
| `--color-linen`, `--color-blush` | `#f4ece1`, `#f1ddd0` | Soft panels |
| `--color-ink`, `--color-muted`, `--color-line` | `#2b2622`, `#6a5f55`, `#e3d8c9` | Text, secondary text, hairlines |
| `--color-sage`, `--color-sage-deep`, `--color-sage-light`, `--color-forest` | greens | Buttons, accents, dark sections |
| `--color-terra`, `--color-terra-light` | `#a4462d`, `#c46a4e` | Script names, focus outline, primary accents |
| `--color-gold` | `#c9a464` | Ornaments |

Change the palette, then rebuild the CSS:

```css
@theme {
  --color-terra: #7a3e6b;
  --color-sage-deep: #3e4f5a;
}
```

The SVG ornaments and gallery illustrations have their colors inside the files; edit them or replace the files.
Update `<meta name="theme-color">` in each page if you change `--color-paper`.

### Typography

Cormorant Garamond (`--font-serif`), Jost (`--font-sans`) and Pinyon Script (`--font-script`, used by the `.script`
class for the names) load from Google Fonts with a `<link>` in every page's `<head>`. To swap one, change that link
on every page and the font name in `@theme`:

```css
--font-script: "Great Vibes", "Snell Roundhand", cursive;
```

### Content

Page text is in the HTML files; search for "Amara" to find every mention of the names. The data the scripts use is
`window.VOWS` in `assets/js/data.js`:

| Key | Shape | Used by |
| --- | --- | --- |
| `keepDemoCurrent` | `true` | Demo only: moves every date on a year once the weekend is over (see [Demo dates](#demo-dates)) |
| `couple` | `{ a, b, names, date_long, date_short, venue, place, ceremony_iso, rsvp_by, hashtag, email }` | Calendar file titles (`names`) |
| `events` | `{ id, day, title, start, end, place, address, dress, body }` | `.ics` files |
| `days` | `{ id, label, date, title }` | Reference only (the schedule page is written in HTML) |
| `meals`, `kidsMeal` | `{ id, label, note }` | RSVP dinner choices (`kidsMeal` is offered first to guests with `child: true`) |
| `invites` | `{ code, label, plusOne, guests: { id, name, child? }[] }` | RSVP lookup |
| `registry` | `{ id, name, category, price, needed, reserved, icon, note }` | Gift list (`icon` is a key of `giftIcons`) |
| `categories` | category names | Reference only (the filter buttons are in `registry.html`) |
| `fund` | `{ title, destination, goal, raised, amounts: { value, label }[] }` | Honeymoon fund |
| `gallery` | `{ slug, title, caption, shape }` (`shape` is `"tall"` or `"wide"`) | Lightbox |
| `giftIcons` | `{ <name>: "<svg paths>" }` | Gift card icons |

Some values also appear as text in the HTML, so change both together:

- **Ceremony date and time:** `couple.ceremony_iso`, the `data-countdown` attribute in `index.html`, and the dates
  written on the pages.
- **Schedule:** each event's text in `schedule.html` and its entry in `events` (used for the calendar files). Each
  "Add to calendar" button has `data-ics="<event id>"`.
- **Fund:** `fund.goal` and `fund.raised`, the "$3,100 raised of $5,000" text, the progress bar's `aria-valuemax`,
  `aria-valuenow` and width in `registry.html`, and the amount buttons (`data-amount`).
- **Gallery:** the grid in `gallery.html` (each button's `data-photo` is its index in `gallery`) and the `gallery`
  list.

**Add an invitation** to `invites`. `code` is matched ignoring case, spaces and punctuation; `id` must be unique
within the invitation:

```js
{
  "code": "BIRCH-05",
  "label": "The Novak family",
  "plusOne": false,
  "guests": [
    { "id": "anna", "name": "Anna Novak" },
    { "id": "eli", "name": "Eli Novak", "child": true }
  ]
}
```

**Add a gift** to `registry` (`needed` is how many you'd like, `reserved` how many are already taken):

```js
{ "id": "teapot", "name": "Stoneware teapot", "category": "Kitchen", "price": 48, "needed": 1, "reserved": 0, "icon": "pot", "note": "For long Sunday breakfasts." }
```

Times include their UTC offset (`-04:00` is Eastern Daylight Time), so calendar files show the right local time for
guests anywhere. Use your venue's offset on the wedding date.

#### Demo dates

The demo is written for the weekend of June 18–20, 2027. While `keepDemoCurrent` in `data.js` is `true` and that
weekend is over (after the last event in `events` ends), the script moves every date to the same weekend of the next
year, by whole weeks so weekdays never change (Saturday, June 19, 2027 becomes Saturday, June 17, 2028): the countdown,
the events and calendar files, `couple.ceremony_iso`, `date_long` and `date_short`, every `<time datetime>`, the text
of `data-date="2027-04-01"` spans ("April 1, 2027"; with `data-date-format="dm"` "June 18"), `data-edition="year"`
and `data-edition="short"` ("06.19.27"), and the date in the page title. The RSVP deadline and room-block dates move
with it. Before the weekend is over nothing changes. **Set `keepDemoCurrent` to `false` once you enter your real
dates.**

### Images and artwork

- **Gallery:** `assets/img/gallery-<slug>.svg`. Replace them with photos and either keep the file names or change
  `'assets/img/gallery-' + p.slug + '.svg'` in the lightbox block of `main.js` and the `<img>` tags in
  `gallery.html`. `tall` images are shown at 1200×1500 (4:5) and `wide` at 1200×900 (4:3).
- **Ornaments:** `wreath.svg`, `sprig.svg` and `corner.svg` are decorative (`alt=""`).
- **Social image:** `assets/img/og-image.png` (1200×630) comes from `assets/img/og-image.svg`; edit the SVG
  (names, date) and export a new PNG.
- **Favicon:** `assets/img/favicon.svg` (the couple's initials).
- **Map:** the illustrated map is inline SVG in `travel.html`; each place is a `<g class="map-pin" data-pin="…">`.

### Navigation, header and footer

The header, mobile menu (`#mobile-menu`) and footer are repeated in every HTML file. To add a page, copy one (for
example `faq.html`), update its `<title>`, description and Open Graph tags, then add the link to the desktop nav,
the mobile menu and the footer in every page. Mark the current page's link with `aria-current="page"`.

## Features

### Countdown

`index.html` has `<div data-countdown="2027-06-19T15:00:00-04:00" role="timer">` with four
`<span data-unit="days|hours|minutes|seconds">`. The "Countdown" block in `main.js` updates it every second; at zero
it stops and shows `data-countdown-done` ("Today's the day"). Without JavaScript the placeholders stay.

### Add to calendar

Any element with `data-ics="<event id>"` downloads a calendar file for that event; `data-ics="all"` downloads the
whole weekend. `buildIcs()` in `main.js` writes an RFC 5545 file from `VOWS.events`:

- `DTSTART`/`DTEND` in UTC (`20270619T190000Z`), converted from the offsets in `data.js`.
- Commas, semicolons, backslashes and new lines escaped; lines folded at 75 octets.
- `SUMMARY` is "`couple.names`: event title", `LOCATION` the `address`, and `DESCRIPTION` the `body` plus the dress
  code.

A toast confirms the download. The `PRODID`, the `UID` domain (`@amara-and-theo.example`) and the file names
(`amara-and-theo-wedding-weekend.ics`, `amara-and-theo-<id>.ics`) are written in `buildIcs()` and `downloadIcs()`;
change them to your names. `window.VOWS_ICS` exposes `buildIcs` for testing.

### RSVP

`rsvp.html` (`data-rsvp`) and the "RSVP" block in `main.js`, in four steps shown in a progress list
(`data-step-label`, `aria-current="step"`):

1. **Find** (`data-rsvp-find`): the guest types the code on their invitation or any guest's full name.
   `findInvite()` compares both ignoring case, accents, spaces and punctuation, so `rose 24` and `Ines Whitaker`
   match.
2. **Details** (`data-rsvp-details`): one block per guest with attending yes/no, and when attending a dinner choice
   and dietary needs. Children (`child: true`) also get `kidsMeal`. Invitations with `plusOne: true` show "I'd like
   to bring a guest" with name, meal and dietary fields. Then an optional song request and note, and a required
   email.
3. **Review** (`data-rsvp-review`): a summary with **Edit reply** and **Send reply**.
4. **Done** (`data-rsvp-done`): a thank-you that confirms the reply, names the email the confirmation goes to and
   shows a short reference (`AT-` and four characters, made in the browser by `makeRef()`), plus "Add the weekend
   to your calendar" if anyone is coming.

Validation: every guest needs an answer, every attending guest a meal, a plus-one needs a name and a meal, and the
email must look valid. Problems are listed in an alert box at the top and marked on each field, and focus moves to
the first one. Text fields are capped (`LIMITS`: dietary 300, name 80, song 120, note 500, email 254 characters).
Focus moves to each step's heading. While the guest fills it in, the reply is saved as a draft (see
[Saved data](#saved-data-localstorage)) and restored, with a notice, if they come back.

**Privacy:** `data.js` is public, so anyone can read the whole guest list. For a real wedding, look invitations up
on a server (see [Forms](#forms)) and remove `invites` from `data.js`.

### Registry

`registry.html` and the "Registry" block. Gifts from `VOWS.registry` render into `data-gift-grid`. Category
buttons (`data-gift-filter`, `aria-pressed`) and the "Hide reserved gifts" checkbox (`data-gift-available`) filter
the list, and `data-gift-count` (a live region) says how many are shown. **Reserve** marks a gift as reserved by
this visitor (shown as "Reserved by you", with **Undo**); when `reserved` plus the visitor's reservation reaches
`needed`, it's fully reserved. A note under the grid tells guests that reserving marks a gift as taken.
Reservations live only in the visitor's browser, so other guests don't see them; for
a shared list, store them on a server or link each gift to your gift-list provider.

### Honeymoon fund

`registry.html` (`data-fund-form`) and the "Honeymoon fund" block. Guests choose a preset amount (`data-amount`,
`aria-pressed`) or type a whole amount from $5 to $5,000, and give their name (required) and an optional message.
On success the raised total and progress bar update for this visit and a thank-you appears, naming the treat that
amount matches in `fund.amounts`, with an `AT-` reference and a note that the payment details are on the card
inside the invitation. **No payment is taken** on the site; change that sentence in the submit handler to match how
you collect gifts, or send guests to your payment page or provider there.

### Travel map

`travel.html`. Legend buttons (`data-pin-target`, `aria-pressed`) highlight the matching map pin
(`data-pin`, class `is-active`); pressing again clears it, and clicking a pin selects it too. The legend is the
keyboard-accessible way to use the map. Places: `venue`, `swan`, `mill`, `granary`, `station`, `oak`.

### Booking codes

Buttons with `data-copy="AMTHEO27"` copy the code and confirm with a toast; where copying isn't allowed, the toast
shows the code instead.

### Gallery lightbox

`gallery.html`: each `<button class="photo-btn" data-photo="N">` opens the native `<dialog data-lightbox>` with
`showModal()` (focus trapped, Escape closes). It shows the image, title, caption and "N of 9"; Left/Right arrows and
the Previous/Next buttons move through `VOWS.gallery`, clicking the backdrop closes it, and focus returns to the
photo.

### FAQ search

`faq.html`: each question is a `<details data-faq>` inside a `<section data-faq-group>`. Typing in
`data-faq-search` hides non-matching questions and empty groups, opens the matches, and reports the count in
`data-faq-status` (a live region). Clearing the search restores which questions were open.

### Toasts, reveals and back to top

- **Toast:** `<div class="toast" role="status" data-toast>` on every page, shown for 2.8 seconds.
- **Reveals:** `.reveal` sections fade in on scroll. The inline script swaps `no-js` for `js` on `<html>`, so
  without JavaScript everything is visible; with reduced motion everything shows at once.
- **Back to top:** the block at the end of `main.js` adds a button after about one screen; it scrolls up (instantly
  with reduced motion), moves focus to `#main`, lifts above toasts (`data-toast`, `data-back-to-top-avoid`), hides
  over `data-back-to-top-hide` and while the mobile menu is open, and is hidden when printing. Remove the block and
  the `.back-to-top` styles to drop it.

## Forms

**None of the forms send anything until you connect them**, although their confirmations read as if they had.

| Form | Where | Validates | Where to connect it |
| --- | --- | --- | --- |
| RSVP | `rsvp.html` | See [RSVP](#rsvp) | The `data-rsvp-send` click handler in `main.js` (the comment starting `// To connect it`) |
| Honeymoon fund | `registry.html` | Amount (preset or $5–$5,000 whole), name | The `data-fund-form` submit handler |
| Gift reservations | `registry.html` | Capacity (`needed`) | The `data-reserve` click handler |

The RSVP sends `state`, a plain object:

```json
{
  "code": "ROSE-24",
  "answers": { "priya": { "attending": "yes", "meal": "hake", "dietary": "" }, "daniel": { "attending": "no", "meal": "", "dietary": "" } },
  "plusOne": { "bringing": false, "name": "", "meal": "", "dietary": "" },
  "song": "September",
  "note": "",
  "email": "priya@example.com"
}
```

With Formspree, replace the comment in the `data-rsvp-send` handler with a request, and only show the confirmation
when it succeeds:

```js
if (e.target.closest('[data-rsvp-send]')) {
  fetch('https://formspree.io/f/your-form-id', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(state)
  }).then(function (res) {
    if (!res.ok) throw new Error('Send failed');
    store.remove(DRAFT_KEY);
    renderDone();
    showStep('done');
  }).catch(function () {
    toast('Sorry, your reply could not be sent. Please try again.');
  });
}
```

The confirmation in `renderDone()` reads as if the reply was received: it says a confirmation is on its way to the
guest's email and shows an `AT-` reference from `makeRef()` (change the prefix to your initials, or show your form
service's own reference if it returns one). Make sure your service really sends that email, or reword it. A Google Apps Script web app that appends
rows to a Google Sheet works the same way. To keep the guest list private, replace `findInvite()` with a request to
your server that returns one invitation for a code or name.

## Saved data (localStorage)

All access goes through `store` in `main.js`: if storage is blocked it falls back to memory, and a value that
isn't valid JSON is deleted.

| Key | Shape | Validation on read |
| --- | --- | --- |
| `vows:rsvp-draft:v1` | The RSVP `state` object above | Must be an object whose `code` is a known invitation (otherwise removed); only applied when it matches the invitation just found. Answers are kept only for that invitation's guests, `attending` must be `yes` or `no`, meals must be allowed for that guest, plus-one data only if the invitation allows one, and every text is cut to `LIMITS`. The cleaned draft is saved back. Removed when the reply is sent. |
| `vows:reserved:v1` | Array of gift ids, for example `["casserole","throw"]` | Must be an array; only known gift ids with room left (`needed - reserved >= 1`), without duplicates. Saved back if anything was dropped. |

To reset, delete the keys in the browser's developer tools (Application → Local Storage). Change the `:v1` suffix
(`DRAFT_KEY` or `KEY` in `main.js`) if you change the data shape, so old values are ignored.

## SEO and sharing

- Each page has its own `<title>`, meta description, Open Graph tags and a `summary_large_image` Twitter card, and
  `<html lang="en-US">`.
- `og:image` is the relative path `assets/img/og-image.png`. Social networks need an absolute URL, so change it on
  every page when you deploy:

```html
<meta property="og:image" content="https://your-domain.com/assets/img/og-image.png">
```

- A wedding site usually shouldn't be indexed. To keep it out of search results, add
  `<meta name="robots" content="noindex">` to every page, or a `robots.txt` with `Disallow: /`.

## Accessibility

Built in:

- Skip link, landmarks, one `h1` per page and `aria-current="page"` in the navigation.
- Visible focus outlines (terracotta) and AA contrast.
- Mobile menu with `aria-expanded`; Escape closes it and returns focus, and links close it.
- RSVP: labeled radio groups, an error summary (`role="alert"`), errors linked with `aria-describedby`, focus moved
  to each step's heading or the first problem, and `aria-current="step"` in the progress list.
- Native `<dialog>` lightbox, `<details>` FAQ, `aria-pressed` toggles, `role="timer"` countdown and polite live
  regions for counts and toasts.
- Reduced motion turns off reveals and smooth scrolling.

When editing, keep one `h1` per page, label every new field, and give new gallery images a meaningful caption (it's
used as the alt text in the lightbox).

## Building and deploying

The compiled `assets/css/style.css` is included. Rebuild only after changing `src/input.css` or adding Tailwind
classes that aren't used yet:

```sh
npm install
npm run build    # one-off build
npm run watch    # rebuild while you work
```

Deploy by uploading the folder to any static host: Netlify Drop (drag the folder onto `app.netlify.com/drop`),
GitHub Pages or Cloudflare Pages. No build command is needed; `src/`, `package.json` and the Markdown files can be
left out. Serve it over `https://` so copy buttons work.

## Troubleshooting

- **"We couldn't find that invitation."** The code or full name doesn't match an entry in `invites`; names must be
  the full name as written in `data.js` (accents and case don't matter).
- **Calendar events are an hour out.** Check the UTC offset on each `start` and `end` in `events` (`-04:00` in Eastern summer, `-05:00` in winter).
- **The countdown shows the old date.** Update the `data-countdown` attribute in `index.html` as well as
  `couple.ceremony_iso`.
- **A guest's restored reply is missing answers.** Drafts are validated against the current guest list; renamed
  guest ids or removed meals are dropped.
- **Copy buttons only show the code.** Clipboard access needs `https://` or `localhost`.
- **A Tailwind class I added does nothing.** Rebuild the CSS with `npm run build`.
- **Shared links show no image.** Use an absolute URL for `og:image`.

## License

MIT, like every Freeframe template: free for personal and commercial projects, no attribution required. The
botanical illustrations and social image are included under the same license. See `LICENSE.txt` in the download.
Names, places and people are fictional.
