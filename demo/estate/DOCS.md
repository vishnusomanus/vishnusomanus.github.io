# Estate documentation

## Overview

Estate is a complete website for a real-estate agency: searchable listings, property pages with a photo
gallery and mortgage calculator, agent profiles and valuation requests. The demo is **Harbor & Hill
Realty**, a fictional independent agency in the fictional coastal town of Marlow Bay, with 12 listings
(for sale and for rent) and six agents. It is built with HTML5, Tailwind CSS v4 and one vanilla
JavaScript file, and needs no build step. This guide covers version 1.1.14.

Live demo: [freeframe.dev/templates/estate](https://freeframe.dev/templates/estate)

## Quick start

1. Unzip the download and open `index.html` in a browser.
2. Or serve the folder with any static server, which is closer to real hosting:

   ```sh
   cd estate
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

Listings, property pages and artwork are generated in the browser from data in `assets/js/main.js`, so
they work from the file system too. Node.js 24 is only needed to rebuild the CSS (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections |
|------|---------|------------------|
| `index.html` | Home | Hero with property search, stats, six featured homes, neighborhood guides, services, testimonials |
| `listings.html` | All homes | Buy/rent/all switch, filters, sort, grid/list view, saved homes, shareable URLs |
| `property.html` | One property (`property.html?id=3`) | Gallery and lightbox, key facts, features, floor plan, mortgage calculator or move-in costs, viewing form, agent card, similar homes |
| `agents.html` | Team | Agent profiles, each linking to that agent's listings |
| `sell.html` | Selling | Process steps, fees, FAQ, free valuation form |
| `about.html` | About the agency | Story, values, timeline, offices |
| `contact.html` | Contact | Contact form, offices, hours, illustrated map |
| `404.html` | Not found | Error page with links back |

Every page also has a newsletter form in the footer.

## Project structure

```text
estate/
├── index.html, listings.html, property.html, agents.html, sell.html, about.html, contact.html, 404.html
├── assets/
│   ├── css/style.css      compiled Tailwind CSS (generated)
│   ├── js/main.js         data, SVG artwork generator, listings, property page, forms, back to top
│   └── img/               agent portraits (agent-1.svg … agent-6.svg), favicon, social image
├── src/input.css          Tailwind source: design tokens (@theme) and component classes
├── package.json           scripts to rebuild the CSS
├── template.json          template metadata used by freeframe.dev
├── README.md
├── CHANGELOG.md
└── DOCS.md                this guide
```

`assets/js/main.js` is organized in four numbered parts, marked by comment banners: **1. Data**,
**2. Artwork**, **3. Shared UI** and **4. Pages**.

## Customizing

### Brand and colors

The palette and fonts are tokens in the `@theme` block at the top of `src/input.css`:

| Token | Used for |
|-------|----------|
| `--color-forest`, `--color-forest-600` | Primary brand green: header accents, buttons, dark sections |
| `--color-brass`, `--color-brass-600`, `--color-brass-700`, `--color-brass-soft` | Accent: badges, icons, focus rings, highlights |
| `--color-cream`, `--color-sand`, `--color-paper` | Page and card backgrounds |
| `--color-ink`, `--color-muted` | Text |
| `--color-line` | Borders |

For example, a navy brand:

```css
@theme {
  --color-forest: #1f2f4a;
  --color-forest-600: #2b3f61;
}
```

Rebuild the CSS after editing, and update the `theme-color` meta tag (`#22362c`) in each page's
`<head>`.

### Typography

Headings use **DM Serif Display** (`--font-display`) and text uses **DM Sans** (`--font-sans`), loaded
from Google Fonts in each page's `<head>`. To change them, replace the Google Fonts `<link>` on every
page and the two tokens in `src/input.css`.

### Content

Static text (about, selling process, fees, FAQ, offices) is plain HTML. **Listings and agents are data**
in part 1 of `assets/js/main.js`.

**Agents** are in the `AGENTS` array:

```js
{ id: 1, name: 'Eleanor Vance', role: 'Founding Partner', phone: '(207) 555-0156', email: 'eleanor@example.com', img: 'assets/img/agent-1.svg' }
```

**Listings** are in the `PROPERTIES` array. Each listing:

```js
{ id: 13, title: 'Garden Flat on Mill Road', address: '22 Mill Road', area: 'Linden Park', status: 'rent', type: 'Apartment',
  price: 2400, beds: 2, baths: 1, sqft: 900, year: 1998, parking: 'Street', lot: '—', listed: 1, agent: 3, badges: ['New'],
  look: { kind: 'townhouse', time: 'day', wall: '#ece4d6', trim: '#3b3a36', accent: '#7d8f7a', room: '#efe8dc' },
  summary: 'A bright two-bedroom garden flat a short walk from the park.',
  features: ['Private garden', 'Bike storage', 'Pets considered'] }
```

| Field | Meaning |
|-------|---------|
| `id` | Unique number, used in `property.html?id=` |
| `status` | `'buy'` or `'rent'` (rent prices are per month) |
| `area` | Neighborhood; must match the filter options (see below) |
| `type` | `'House'`, `'Apartment'`, `'Townhouse'` or `'Cottage'` |
| `price`, `beds`, `baths`, `sqft`, `year`, `parking`, `lot` | Facts shown on cards and the property page |
| `listed` | Days since listing; "Newest" sorting uses it |
| `agent` | An `id` from `AGENTS` |
| `badges` | Short labels such as `'New'` or `'Open house Sat'` |
| `look` | Illustration settings (see [Images and artwork](#images-and-artwork)) |
| `summary`, `features` | Description and bullet list on the property page |

**Featured homes** on the home page are chosen by id in part 4:

```js
featured.innerHTML = [1, 3, 12, 4, 5, 6].map(function (id) { return card(byId(id), 'grid'); }).join('');
```

**Neighborhoods** (`Old Harbor`, `The Docklands`, `Linden Park`, `Westshore`, `Cedar Heights`,
`Hillcrest`) appear in several places. If you rename or add one, update:

- the `location` `<select>` in the home-page search (`index.html`) and in the filters (`listings.html`);
- the neighborhood guides on `index.html` and any mentions in `sell.html`;
- the short area descriptions used on the property page: the object literal inside the
  `$('[data-p-more]').textContent = ...` line in part 4 of `assets/js/main.js`.

**Price filter options** are in `PRICE_OPTIONS` (one list for buying, one for renting). The home-page
search has its own `max` `<select>` with sale prices in `index.html`.

### Images and artwork

Property pictures are SVG illustrations generated in part 2 of `assets/js/main.js` from each listing's
`look`:

| `look` field | Values |
|--------------|--------|
| `kind` | `modern`, `townhouse`, `cottage`, `apartment`, `coastal` (exterior style) |
| `time` | `day`, `golden`, `dusk`, `night` (sky and lighting) |
| `wall`, `trim`, `accent`, `room` | Hex colors for walls, window frames, details and interior walls |

Each property gets five gallery views from `gallery(p)`: the exterior, living room, kitchen, primary
bedroom and the exterior at another time of day. Static artwork on pages uses placeholders such as
`<div data-art="exterior" data-id="3" data-time="dusk">`, filled in by `hydrateArt()`.

**To use photos**, return images instead of SVG:

1. In `gallery(p)`, change each `html` function to return an `<img>` tag, for example
   `return '<img src="assets/img/listings/' + p.id + '-living.jpg" alt="Living room">';`
2. In `card(p, view)`, replace the call to `exterior(p)` with the listing's cover image.

Use 4:3 photos for the gallery. Agent portraits are `assets/img/agent-*.svg` (600×700); replace them
with photos of the same proportions and update `img` in `AGENTS`. The social image is
`assets/img/og-image.png` (1200×630) with its editable source `assets/img/og-image.svg`; the favicon is
`assets/img/favicon.svg`.

### Navigation, header and footer

The header, mobile menu and footer are repeated in every HTML file. The header's Buy and Rent links
point at `listings.html?status=buy` and `?status=rent`; on the listings page they are highlighted with
`aria-current="page"` to match the current filter (`data-nav-status`). To add a page, copy an existing
one, replace the content inside `<main>`, and add the link to the desktop and mobile menus on every page.

## Features

### Home-page search

The search card on `index.html` is a normal `GET` form with `action="listings.html"`. Its fields
(`status`, `location`, `type`, `max`, `beds`) become URL parameters, which the listings page reads to
pre-fill its filters.

### Listings filters, sort and views

`listings.html` renders cards into `[data-results]` from the `PROPERTIES` data:

- **Buy / Rent / All** buttons (`data-status`, with `aria-pressed`).
- **Filters** form (`data-filters`): `location`, `type`, `max` (price), `beds`, `baths` (minimums) and
  `saved`. The price options switch between sale and rent ranges, and price is disabled for "All".
- **Sort**: `newest`, `price-asc`, `price-desc`, `size`.
- **Grid / list view** (`data-view`), remembered in `localStorage` under `estate-view`.
- A live count ("8 homes for sale"), a title that follows the mode, an empty state and **Clear filters**
  (`data-reset`).
- Every change updates the URL (`?status=rent&location=Westshore&beds=2&sort=price-asc`), so searches can
  be shared or bookmarked. `?agent=3` lists one agent's homes and shows a note with their name. Values
  that aren't one of a filter's options (such as `?type=banana`) or an unknown agent are ignored.
- On small screens the filter panel collapses behind a toggle (`data-filter-toggle`, `aria-expanded`).

To add a filter, add a control with a new `name` to the filters form, add a property to the `state`
object, test it in `filtered()`, and add its name to the list of keys written to the URL in `render()`.

### Saved homes

Heart buttons on cards and the property page save homes in `localStorage` (see
[Saved data](#saved-data-localstorage)). The header shows a count (`[data-saved-count]`), the
"Saved homes" filter on `listings.html?saved=1` lists them, and changes sync between open tabs.

### Property page

`property.html` reads `?id=` and fills the page from that listing (an unknown or missing id shows the
first listing). It sets the document title and meta description, breadcrumbs, facts, features, a
floor plan scaled to the number of bedrooms (`floorPlan(p)`), the agent card and three similar homes
(same status, closest in price). The **Share** button copies the page URL and shows a toast.

### Gallery and lightbox

The gallery shows one large view and four thumbnails; every view opens a full-screen lightbox
(`[data-lightbox]`) with a caption ("2 / 5 · Living room"). Keyboard: **Left/Right** move between
views, **Esc** closes, **Tab** stays inside the lightbox, and focus returns to the view you opened.

### Mortgage calculator and move-in costs

For listings with `status: 'buy'` the page shows a mortgage calculator (`[data-calc]`) with the price
pre-filled:

| Input | Default |
|-------|---------|
| Price (`price`) | The listing price |
| Deposit (`deposit`, range) | 20% (5–50%) |
| Interest rate (`rate`) | 6.25% |
| Term (`term`) | 30 years (15, 20, 25 or 30) |

It updates as you type and shows the deposit, monthly payment, loan amount, total interest, total cost
and a principal/interest bar. The monthly payment uses the standard amortization formula. Change the
defaults in the inputs' `value` attributes in `property.html`.

For rentals it shows **move-in costs** instead: first month plus a deposit of 1.5 × monthly rent. Change
the multiplier in the line `var deposit = p.price * 1.5;` in `assets/js/main.js`.

### Mobile menu

The menu button (`data-menu-toggle`) opens `#mobile-menu`, updates `aria-expanded`, and closes with
**Esc** or when the window grows to desktop width.

### Scroll reveals

Elements with `reveal` fade in as they scroll into view; reaching one also reveals everything above it,
so jumping to the end of a page never leaves hidden content. With reduced motion everything is shown
immediately. Reveals only hide content once JavaScript is running (a one-line script in the `<head>` adds
the `js` class to `<html>`), so with JavaScript off every section is visible.

### Back to top button

Every page gets a "Back to top" button in the bottom-right corner, created by the "Back to top" block at
the end of `assets/js/main.js` and styled by the `.back-to-top` rules at the end of `src/input.css`. It
appears after about one screen of scrolling, scrolls to the top (instantly with reduced motion), moves
focus to the main content and lifts above toasts. Add `data-back-to-top-avoid` to anything you pin to
the bottom of the screen, or `data-back-to-top-hide` to a sticky element it must never cover. To remove
it, delete that JavaScript block and the CSS rules, then rebuild the CSS.

## Forms

All forms marked `data-validate` share one validator that uses the browser's own constraints
(`required`, `type="email"`, `pattern`, `minlength`, `min`/`max`) and shows friendly messages under each
field. Set `data-pattern-message` on a field to customize its pattern message. Date inputs with
`data-future` can't be set earlier than tomorrow (on the visitor's local calendar).

| Form | Page | Notes |
|------|------|-------|
| Request a viewing (`#viewing`) | `property.html` | Hidden `property` field is filled with the listing name and reference (e.g. "Rose Cottage (HH-1003)") |
| Free valuation | `sell.html` | Property details and contact information |
| Contact | `contact.html` | General inquiries |
| Newsletter | Footer of every page | Email only |

On success the form's `[data-form-body]` is hidden and its `[data-success]` message shown; a
`[data-form-reset]` button brings the form back. The viewing, valuation and contact messages show a short
reference in their `[data-ref]` element (`HH-` and four characters, made in the browser; use your form
service's or CRM's own reference instead if it returns one). They promise a reply within one business day, as
the pages already say: change both if yours differs. The footer newsletter message asks subscribers to look
out for a confirmation email, so use a mailing list service that sends one (double opt-in) or reword it.

**The forms don't send anything until you connect them.** With a form service such as
[Formspree](https://formspree.io):

1. Add an `action` to the form:

   ```html
   <form class="card p-6 sm:p-8" action="https://formspree.io/f/your-id" method="post" novalidate data-validate>
   ```

2. In the submit handler in part 3 of `assets/js/main.js` (it follows the comment "To receive
   submissions..."), send the data before showing the success message:

   ```js
   fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
     .then(function (res) {
       if (!res.ok) throw new Error('Request failed');
       if (body) body.hidden = true;
       // ...keep the reference code from the original handler here...
       if (success) { success.hidden = false; success.focus(); }
       form.reset();
     })
     .catch(function () { alert('Sorry, something went wrong. Please call or email us.'); });
   ```

Each form can have its own endpoint. Netlify Forms also works: add `data-netlify="true"` and a `name`
attribute to the form.

## Saved data (localStorage)

| Key | Shape | Purpose |
|-----|-------|---------|
| `estate-saved` | Array of listing ids, e.g. `[3, 7]` | Saved homes |
| `estate-view` | `"grid"` or `"list"` | Preferred listings layout |

`getSaved()` validates `estate-saved` on every read: anything that isn't an array of known, unique
listing ids is dropped and the stored value is repaired, so corrupt or tampered data can never break a
page. `estate-view` falls back to `grid` for any unexpected value. To reset, clear the site's storage in
the browser's developer tools, or run `localStorage.removeItem('estate-saved')`.

Saved homes stay on one device and browser; they aren't shared between devices.

## SEO and sharing

Each page has its own `<title>`, meta description, Open Graph tags and `twitter:card` in the `<head>`.
The property page also sets its title (e.g. "Rose Cottage — Linden Park | Harbor & Hill Realty") and
description from the listing data when it loads; the site name in that title is read from the page's
`og:site_name` meta tag.

Change `og:image` on every page to an absolute URL when you deploy:

```html
<meta property="og:image" content="https://example.com/assets/img/og-image.png">
```

Because listing pages are generated in the browser, search engines that don't run JavaScript see
generic content for `property.html`. If listings matter for search, generate one static HTML page per
listing (or use a CMS) and add a `sitemap.xml` that lists them.

## Accessibility

- Skip link, labeled landmarks and one `<h1>` per page.
- Filter and view buttons use `aria-pressed`; the mobile filter panel and menu use `aria-expanded`.
- Generated artwork has `role="img"` and descriptive labels; decorative art is `aria-hidden`.
- The lightbox traps focus, closes with Esc and restores focus.
- Form errors are linked with `aria-describedby` and fields get `aria-invalid`.
- Reveals and smooth scrolling respect `prefers-reduced-motion`.

When adding listings, write meaningful `title` and `summary` text (they're used in labels). Keep one
`<h1>` per page and label any new form field.

## Building and deploying

`assets/css/style.css` is pre-built. Rebuild it only after editing `src/input.css` or using Tailwind
classes that aren't in the CSS yet (including classes you add inside `assets/js/main.js` templates).
With Node.js 24:

```sh
npm install
npm run build     # or: npm run watch
```

Estate is a static site: upload the folder (without `node_modules/`) to Netlify (drag and drop),
GitHub Pages, Cloudflare Pages or any web host. No build command is needed on the host. `404.html` is
used automatically by most hosts.

## Troubleshooting

- **A new listing doesn't appear.** Check its `status` (`'buy'`/`'rent'`) matches the current mode, and
  that the `id` is unique.
- **A neighborhood filter shows no homes.** The listing's `area` must match the `<option value>` exactly.
- **`property.html` always shows the same home.** The URL needs `?id=` with an existing listing id.
- **New classes in `main.js` have no styling.** Rebuild the CSS so Tailwind picks them up.
- **Saved homes disappear.** They're stored per browser; private windows and cleared site data reset them.
- **A form shows its thank-you message but nothing arrives.** The forms send nothing until you connect them;
  see [Forms](#forms).
- **Shared links show no image.** Use an absolute URL in `og:image`.

## License

Estate is released under the MIT License (see `LICENSE.txt` in the download), for personal and
commercial use. The generated property artwork and agent portraits are covered by the same license.
DM Serif Display and DM Sans are licensed under the SIL Open Font License.
