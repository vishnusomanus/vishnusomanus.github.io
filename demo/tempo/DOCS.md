# Tempo documentation

## Overview

Tempo is a website template for a band or solo musician, built for **Marigold Static**, a fictional
four-piece indie band from Lincoln, Nebraska (Isla Carrick, Reuben Oyelaran, Fenna de Wit and Callum
Shiach) whose second album, *Weather for Two*, is about to come out on the fictional Lantern House Records.
The site has a home page with a release countdown and pre-save, a discography with a working track player,
tour dates, a merch store with a cart, an about page, an electronic press kit (EPK) and a contact form that
routes messages by topic. It is plain HTML with Tailwind CSS v4 and one vanilla JavaScript file, with no
build step needed to use it. The look is a printed gig poster: warm paper, black ink, fluorescent pink,
cobalt and sun-yellow "riso" inks, condensed Big Shoulders Display headlines and SVG artwork throughout.
This guide covers version 1.0.10. See it live at
[freeframe.dev/templates/tempo](https://freeframe.dev/templates/tempo).

## Quick start

1. Unzip the download and open `index.html` in a browser. Every page works from the file system, including
   the player, the cart and the downloads.
2. Or serve the folder, which is closer to how it runs on a host (and needed for the clipboard API in some
   browsers):

   ```sh
   npx serve .
   ```

3. You only need Node.js 24 or newer if you change CSS classes (see
   [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | New-release hero with countdown, pre-save and "Play Glasshouse" (`#presave`), platform links, city ticker, the new album's track list, click-to-play video poster, next four shows, merch preview, press quote, Static Club sign-up (`#join`) |
| `music.html` | Discography | Release stats, album/EP/single filter with counts, release grid, release detail (`#release`) with track list, credits and previous/next links. `music.html?type=ep&release=night-bus-hymns#release` |
| `tour.html` | Tour | Region filter and country select, show list with status badges, calendar downloads, past shows, "notify me" form (`#notify`), FAQ. `tour.html?region=europe&country=Germany`, `tour.html?notify=paris#notify` |
| `merch.html` | Store | Category filter (`merch.html?cat=apparel`), product cards with color and size options (`#p-<product id>`), shipping and sizing |
| `about.html` | About | Group illustration, story and stats, band members, timeline, press quotes |
| `press.html` | Press kit | Fact sheet, short/medium/long bio tabs with copy, downloads (`#downloads`), tech rider, press quotes, contacts (`#contacts`) |
| `contact.html` | Contact | Topic-routed form (`contact.html?topic=booking`), direct contacts, mailing address |
| `404.html` | Not found | "Not on the record" page with links back into the site |

The header (with the bag button), the footer, the player bar, the cart drawer and the toast are repeated
in every page, so the cart and player work everywhere.

## Project structure

```text
tempo/
  index.html … contact.html, 404.html   the pages
  assets/css/style.css                  compiled Tailwind CSS (generated, do not edit)
  assets/js/main.js                     all JavaScript: data, artwork, audio, player, pages, cart, forms
  assets/img/favicon.svg                browser icon
  assets/img/band.svg                   group illustration (1200×800)
  assets/img/member-isla.svg            member portraits (400×500), also -reuben, -fenna, -callum
  assets/img/og-image.svg               social image source (1200×630)
  assets/img/og-image.png               social image used by the pages
  src/input.css                         Tailwind source: design tokens and component classes
  package.json                          scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

`assets/js/main.js` is split into numbered sections: band data, helpers, artwork, audio, player
interfaces, home page, music page, tour page, merch and cart, press kit, forms, header and reveals, back
to top. Search for the section title to find your way around.

## Customizing

### Brand and colors

All design tokens live in the `@theme` block at the top of `src/input.css`:

| Token | Default | Used for |
|-------|---------|----------|
| `--color-paper` | `#f4efe6` | Page background |
| `--color-paper-2` | `#ebe4d6` | Alternate sections |
| `--color-card` | `#fbf8f2` | Cards, inputs, the cart drawer |
| `--color-ink` | `#15130f` | Text, borders, dark sections, hard shadows |
| `--color-soft` / `--color-subtle` | `#4b463d` / `#686155` | Secondary text and captions on paper |
| `--color-fog` / `--color-haze` | `#bdb5a6` / `#9c9485` | Secondary text and captions on ink |
| `--color-pink` | `#ff4d94` | Brand fill: primary buttons, chips, highlights (with ink text) |
| `--color-pink-deep` | `#c4155f` | Pink text and links on paper |
| `--color-cobalt` | `#2b3fd6` | Second ink: the fan-club section, focus rings |
| `--color-sun` | `#ffcf33` | Third ink: highlights, stickers, success boxes |

To rebrand, change the inks and rebuild the CSS:

```css
@theme {
  --color-pink: #ff7a1a;      /* fills, used with ink text */
  --color-pink-deep: #b34700; /* the same color dark enough for text on paper */
}
```

Keep `--color-pink-deep` at a 4.5:1 contrast with the paper. A few SVGs (the logo mark, the hero vinyl, the
video poster, the 404 record and the album covers in `main.js`) use the hex values directly; search for
`#ff4d94` to update them too.

Dark sections are marked with the `on-ink` class. Inside them buttons, links, meta text and form fields
switch to their light-on-dark versions automatically.

### Typography

The fonts are loaded from Google Fonts in the `<head>` of every page:

- **Big Shoulders Display** (700–900) for the condensed poster headlines (`--font-display`, the `poster`
  utility, `.h-hero`, `.h-page`, `.h-section`).
- **Familjen Grotesk** for body text (`--font-sans`).
- **Space Mono** for labels, dates and prices (`--font-mono`, `.meta`, `.eyebrow`, `.chip`).

To swap a font, change the Google Fonts `<link>` in each page and the matching `--font-*` token. The stacks
include system fallbacks, so the site still reads well if the fonts don't load.

### Content

Page text lives in the HTML files. Everything that is listed, filtered or played lives in data at the top of
`assets/js/main.js`:

| Constant | What it holds |
|----------|---------------|
| `BAND` | Name, site URL, email, `currency` and `locale` for prices and dates, `freeShippingFrom`, `shipping`, `keepDemoDatesFresh` |
| `RELEASES` | Every release, newest first: `id`, `type` (`album`, `ep`, `single`), `title`, `date`, `label`, `cat`, `art`, `merch`, `blurb`, `credits`, `tracks` |
| `REGIONS`, `TOUR` | Tour regions and shows: `id`, `date`, `time` (doors, 24-hour; `19:00` shows as 7:00 PM), `city`, `country`, `region`, `venue`, `status`, `onSale`, `note`, `support`, optional `tickets` |
| `PRODUCTS`, `MERCH_CATS` | Merch: `id`, `name`, `cat`, `kind`, `price`, `badge`, `desc`, optional `release`, `colours`, `sizes`, `soldOut` |
| `CONTACT_TOPICS` | Contact form topics, who each one goes to and the reply time |

Add a release by putting a new object at the start of `RELEASES`:

```js
{ id: 'bluestem-ep', type: 'ep', title: 'Bluestem', date: '2027-05-07', label: 'Lantern House Records', cat: 'LHR034',
  art: { bg: '#c9cff7', a: '#ff4d94', b: '#15130f', ink: '#15130f', motif: 'moons' },
  blurb: 'Four songs recorded in a grain elevator.', credits: 'Produced by Ailsa Braid.',
  tracks: [{ title: 'Bluestem', len: '3:40', early: true }, { title: 'Storm Cellar', len: '4:05' }] }
```

The first release in the list is the "new release" the home page counts down to. A release dated in the
future shows "Out <date>"; only tracks with `early: true` can be played before release day. Track ids are
generated as `<release id>-<track number>` (for example `weather-for-two-2`).

Add a show to `TOUR`:

```js
{ id: 'oslo', date: '2026-12-13', time: '20:00', city: 'Oslo', country: 'Norway', region: 'europe',
  venue: 'Kulturhuset Sal 2', status: 'on-sale', support: 'Twin Ferries', tickets: 'https://tickets.example/oslo' }
```

`status` is `on-sale`, `low` (shows "Last tickets"), `sold-out` (shows a waitlist link) or `soon` (shows
"On sale <onSale>" and a reminder link). Without `tickets`, `ticketUrl()` builds a placeholder address.
Shows dated before today move to "Past shows" automatically. The region counts in `tour.html` are filled
in by the script; update the numbers in the HTML too if you want them right without JavaScript.

**Demo dates:** `BAND.keepDemoDatesFresh` moves the whole tour, and the new album (the release with
`campaign: true`), forward to the same weeks of the next year once every tour date has passed, by whole weeks so
weekdays never change (Friday, November 13, 2026 becomes Friday, November 12, 2027). The demo then has an album on the
way and upcoming shows again. Set it to `false` on your real site.

The dates written in the pages follow `RELEASES` and `TOUR` (`initDemoText()`): the banner's
`[data-release-note]` ("Weather for Two is out November 13", then "is out now"), `[data-release-day]` (the press
kit and the about timeline, with `[data-release-year]`, and the home page title), `[data-tour-years]` ("2026–27",
also in the tour page title) and `[data-tour-from]` ("November 2026"). Once the new album is out, links with `data-release-cta` (the
"Pre-save" buttons, "Hear the first single", "Pre-order the LP") read their text from `RELEASE_CTA` instead
(`listen`: "Listen", `listen-album`, `listen-now`, `buy-lp`), products
with the "Pre-order" badge show "Out now", and a show marked `status: 'soon'` goes on sale on its `onSale` date.

Add a product to `PRODUCTS`:

```js
{ id: 'beanie', name: 'Static beanie', cat: 'apparel', kind: 'tee', price: 20,
  desc: 'Ribbed knit with a woven label.', colours: [{ name: 'Pink', hex: '#ff4d94' }],
  sizes: ['One size'] }
```

`kind` picks the SVG mock-up (`lp`, `cd`, `cassette`, `tee`, `hoodie`, `poster`, `tote` or `pins`); `lp` and
`cd` use the cover of the `release` you set. Products with more than one color get swatches; products with
`sizes` require a size before they can be added. Sizes listed in `soldOut` are shown crossed out and
disabled. Category counts on `merch.html` are filled in from the data.

### Images and artwork

- **Album covers** are drawn by `cover()` in `main.js` from each release's `art` object: `bg` (paper color),
  `a` and `b` (two inks), `ink` (title color) and `motif` (`weather`, `glass`, `river`, `signal`, `moons`,
  `bus`, `sun` or `grid`). Any element with `data-cover="<release id>"` gets the cover painted into it; add
  `data-cover-label=""` when the cover is decorative. To use real artwork, replace the cover markup in
  `cover()` with an `<img>` of your square artwork (at least 1200×1200).
- **Merch mock-ups** are drawn by `productArt()` for the selected color, in a 4:5 frame. Replace them with
  4:5 product photos the same way.
- **Band and member portraits** are SVG files in `assets/img/` (`band.svg` 1200×800, `member-*.svg`
  400×500). Swap them for photos with the same aspect ratios and keep the `alt` text accurate.
- **Social image:** `og-image.svg` is the source, `og-image.png` (1200×630) is what the pages reference.
  Export a new PNG after editing the SVG.
- **Favicon:** `assets/img/favicon.svg`.

### Navigation, header and footer

The announcement bar, header, mobile menu, footer, player bar, cart drawer and toast are repeated in every
HTML file. To add a page, copy an existing one, change its `<title>`, description, Open Graph tags,
`data-page` on `<body>` and the content of `<main>`, then add a link to the `<nav aria-label="Main">` list,
the `<nav aria-label="Mobile">` list and the footer in every page. Mark the current page's links with
`aria-current="page"`.

## Features

### The player

Any button with `data-track="<track id>"` plays that track; `data-play-release="<release id>"` plays a
release from its first playable track (add `data-play-track="<track id>"` to start somewhere else). Pressing
a playing button again pauses it. Playing a track queues the rest of its release, so previous and next work.

The player bar (`#player`) slides up when something is loaded. It has previous, play/pause, next, a seek
slider, mute and close. Every track list shows the current track with an equalizer and `aria-current`, and
play buttons switch to pause.

**Previews without audio files:** each track's preview is a 30-second piece of music synthesized in the
browser by `Synth` (a pad, bass, arpeggio and drums in a key, tempo and chord progression picked from the
track id), encoded as a WAV file and played by a normal `<audio>` element. To play your real audio, give
the track a `src`:

```js
{ title: 'Glasshouse', len: '3:41', early: true, src: 'audio/glasshouse-preview.mp3' }
```

Remove the "30-second preview" labels in `trackRow()` and the "Preview" chip in the player bar if you play
full tracks. The player also sets Media Session metadata, so lock screens and keyboards' media keys work.

**Keyboard:** all controls are buttons and the seek slider takes arrow keys. Space or K plays and pauses,
Shift+N and Shift+P skip tracks (ignored while typing or when a button or link has focus). A polite live
region announces the track that starts playing.

### New release countdown and pre-save

`initRelease()` reads the first release in `RELEASES`. Before its date the hero shows the countdown
(`data-countdown`), the pre-save button and "Play Glasshouse"; on release day everything marked
`data-release-state="soon"` hides and `data-release-state="out"` shows. The pre-save button
(`data-presave`) toggles and remembers its state in localStorage; point it at your pre-save service by
replacing it with a link, or call that service in its click handler.

### Video poster

The video section (`data-video`) shows an SVG poster and loads nothing until someone presses play. Put your
embed address in `data-video-embed` and the button swaps the poster for an iframe:

```html
<div data-video data-video-embed="https://www.youtube-nocookie.com/embed/VIDEO_ID" data-video-title="Glasshouse (official video)" …>
```

With `data-video-embed` empty (the demo), pressing play plays the preview of the release named in
`data-video-release` and animates the poster.

### Discography

`music.html` renders the release grid and detail from `RELEASES`. The filter buttons (`data-type-filter`)
update the grid, the live count and the `?type=` parameter; any link with `data-open-release` shows that
release in the detail section, moves focus to its title and updates `?release=`. "Copy link" copies a link
straight to the release.

### Tour dates and calendar files

`tour.html` renders upcoming shows from `TOUR`. The region buttons (`data-region`) and country select
(`#tour-country`) filter the list and keep `?region=` and `?country=` in the address; an empty state offers
a reset. "Calendar" buttons (`data-ics`) download an `.ics` file built by `icsFor()` with the doors time,
venue, support act and ticket link; it works in Apple Calendar, Google Calendar and Outlook. The home page
shows the next four shows with the same markup.

### Merch and cart

Product cards are rendered from `PRODUCTS`. Choosing a color redraws the mock-up; "Add to bag" checks that
a size is chosen, adds the item (merging identical color and size) and opens the cart drawer. The drawer
(`#cart`) is a modal dialog: focus moves into it and is kept there, Esc or the backdrop closes it and focus
returns to the button that opened it. It has quantity steppers (1–10), remove buttons, the subtotal, a
free-shipping meter based on `BAND.freeShippingFrom` and a shipping line based on `BAND.shipping`.

**Checkout.** "Checkout" shows an order summary and a shipping note; "Place order" empties the bag and shows
"Order placed" with an order reference (`MS-` and four characters, made in the browser by `makeRef()`) and
the shipping times from the merch page. Nothing is charged until you connect a store: to sell for real,
replace the `data-place-order` branch in `initCart()` with a redirect to your store, for example a Shopify cart permalink or Stripe Payment Link built from
`cart`:

```js
if (e.target.closest('[data-place-order]')) {
  window.location.href = 'https://your-shop.example/cart/' + cart.map(function (l) { return l.id + ':' + l.qty; }).join(',');
}
```

### Press kit

The bio tabs follow the ARIA tabs pattern (arrow keys, Home and End move between Short, Medium and Long).
"Copy this bio" copies the visible bio as plain paragraphs and the word count updates with the tab. The
downloads are generated in the browser: `data-download="cover"` saves the new album's cover as SVG,
`logo` saves `#logo-art`, `bio` saves all three bios as text, `facts` saves every `[data-fact]` row of the
fact sheet, and `rider` saves `#rider-text`. The band illustration is a plain `download` link to
`assets/img/band.svg`. Contact cards have `data-copy` buttons that copy an email address.

### Header, menu, reveals and back to top

The header gets a border once you scroll. On screens under 1024 px the menu button opens a full-height menu
(`aria-expanded`, Esc closes it and returns focus). Elements with `.reveal` fade in as they scroll into view
(revealing one also reveals everything above it); with reduced motion they are visible right away and
the ticker, equalizers and vinyl stop moving. The back-to-top button appears after one screen, lifts itself
above the player bar and toasts, and moves focus to the main content. Remove its block at the end of
`main.js` and the `.back-to-top` styles to drop it.

## Forms

| Form | Page | Validates | Success state |
|------|------|-----------|---------------|
| `#join-form` (Static Club) | `index.html` | Region, email, consent checkbox | `#join-success` |
| `#notify-form` (tour alerts) | `tour.html` | Email, town or city, country, travel distance | `#notify-success` |
| `#contact-form` | `contact.html` | Topic, name, email, message (30+ characters) and the topic's own fields | `#contact-success` |

Every form with `data-validate` is checked in the browser on submit and as fields change; errors appear
under each field (linked with `aria-describedby`) and focus moves to the first problem. Field names in
error messages come from `data-name`; checkbox and radio messages from `data-required-msg`.

**Contact routing:** choosing a topic shows that topic's fields (`data-topic-fields`) and says who the
message goes to, from `CONTACT_TOPICS`. Booking is routed by the "Where is the show?" select: North America
goes to the North American agent, everything else to the international agent. Fields marked `data-required` are only
required while their topic is selected; dates marked `data-future` can't be in the past.

**The forms don't send anything** until you connect them. Submissions end in `onValid()` in `main.js`. To
use Formspree, set the form's `action` and post the data there before showing the success box:

```js
function onValid(form) {
  fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    .then(function (r) { if (!r.ok) throw new Error(); /* then show the success box as before */ })
    .catch(function () { toast('Sorry, that didn’t send. Please email us instead.'); });
}
```

For the fan-club and tour-alert forms you can instead post to your mailing list provider's form endpoint.

**Success messages:** the fan-club and tour-alert boxes ask the visitor to look out for a confirmation email
(the usual double opt-in). The contact box says who the message went to, repeats that topic's reply time from
`CONTACT_TOPICS` and shows a reference (`MS-` and four characters from `makeRef()`; use your form service's own
reference instead if it returns one). The merch topic's order number field accepts these references as well
as numeric ones like `MS-10482`.

## Saved data (localStorage)

| Key | Shape | Notes |
|-----|-------|-------|
| `tempo-cart` | `[{ "id": "glasshouse-tee", "colour": "Pink", "size": "L", "qty": 2 }]` | Read by `readCart()`, which drops unknown products, colors or sizes, sold-out sizes and bad quantities, and caps quantities at 10 |
| `tempo-presave` | `true` or `false` | The pre-save button's state |

To reset, run `localStorage.removeItem('tempo-cart')` (or `tempo-presave`) in the browser console, or clear
the site's data. "Place order" also empties the cart.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph title, description and image, a Twitter card
and `theme-color` in its `<head>`. Social sites need an absolute image URL, so once you know your domain
change every

```html
<meta property="og:image" content="assets/img/og-image.png">
```

to `https://your-domain.com/assets/img/og-image.png` and add `<meta property="og:url">` per page. Add a
`sitemap.xml` listing the pages and a `robots.txt` pointing to it. For richer search results you can add
`MusicGroup` and `MusicEvent` JSON-LD built from your band details and tour dates.

## Accessibility

- Skip link, landmarks (`header`, `nav`, `main`, `footer`), one `h1` per page and a logical heading order.
- Visible focus rings (cobalt on paper, yellow on ink), AA contrast for text in both the paper and ink
  sections, `aria-current="page"` on the current menu item.
- Filters are toggle buttons with `aria-pressed` and live result counts; the player announces the new track;
  track buttons say "Play" or "Pause" with the track name.
- The cart is a modal dialog with focus trapping and Esc; the press bios use the ARIA tabs pattern; the menu
  uses `aria-expanded` and Esc.
- Forms have real labels, inline errors linked with `aria-describedby` and success boxes that receive focus.
- `prefers-reduced-motion` turns off reveals, the ticker, equalizers, the spinning vinyl and smooth
  scrolling.

When editing, keep one `h1` per page, give new inputs a `<label>`, keep `alt` text on portraits, and check
the contrast of any new color pairs.

## Building and deploying

The compiled CSS is included, so you only rebuild it if you change `src/input.css` or use Tailwind classes
that aren't already in the site:

```sh
npm install
npm run build   # or: npm run watch while you edit
```

Tailwind scans the HTML files and `assets/js/main.js` for class names. Then upload the whole folder to any
static host: drag it onto Netlify Drop, push it to GitHub Pages, or deploy it with Cloudflare Pages. No server
code is needed. Serve `404.html` as the not-found page (Netlify and Cloudflare Pages do this automatically).

## Troubleshooting

- **No sound when I press play.** Check the tab isn't muted and the player's mute button isn't on. If you
  added a `src`, check the path from the page (for example `audio/glasshouse.mp3` next to `index.html`) and
  that the file is a format the browser plays (MP3, AAC or Ogg).
- **The tour list is empty.** Every date is in the past. Add new shows, or leave
  `BAND.keepDemoDatesFresh` on while you build the site.
- **Copy buttons say "Select the text and copy it".** The clipboard API needs `https://` or `localhost`.
  Serve the folder with `npx serve .` while testing.
- **New classes have no effect.** Rebuild the CSS with `npm run build`. Classes built up from strings in
  JavaScript must appear in full somewhere in a scanned file.
- **The cart shows an item I deleted from `PRODUCTS`.** It doesn't: `readCart()` drops it. If the count looks
  wrong, clear `tempo-cart` in localStorage.
- **The social preview shows no image.** `og:image` must be an absolute `https://` URL to the PNG.
- **Fonts look different in the downloaded cover SVG.** SVG files use the fonts installed on the viewer's
  computer; convert the text to outlines in a design tool if you need exact type.

## License

MIT, free for personal and commercial use. The full text is in `LICENSE.txt` in the download (the
repository's license). All artwork, including the SVG covers, portraits, merch mock-ups and social image, is
included under the same license.
