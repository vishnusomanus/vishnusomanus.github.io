# Dashboard documentation

## Overview

Dashboard is a complete admin interface for the fictional outdoor-gear shop behind **Northstar Admin**:
KPI cards and charts, analytics, a full orders table, customers with a detail panel, a product catalog
with inventory, settings (profile, team, billing, notifications) and a sign-in screen, in light and dark
themes. Every chart is SVG drawn by plain JavaScript; there are no frameworks or chart libraries. This is
the HTML + Tailwind CSS v4 version, **version 1.1.12**. See it live at
[freeframe.dev/templates/dashboard](https://freeframe.dev/templates/dashboard).

## Quick start

1. Unzip the download.
2. Open `index.html` in a browser. Every page works straight from your computer.
3. For a closer match to a real host, serve the folder:

   ```sh
   cd dashboard
   python3 -m http.server 8000   # then open http://localhost:8000
   ```

No build step is needed. Node.js 24 is only needed to rebuild the CSS (see
[Building and deploying](#building-and-deploying)).

## Pages

| File | Page | What's on it |
|------|------|--------------|
| `index.html` | Overview | KPI cards with sparklines, revenue area chart (7 days / 30 days / 12 months), traffic-source donut, recent orders, activity feed |
| `analytics.html` | Analytics | Visitors line chart, revenue bars, checkout funnel, order heatmap, top pages, states |
| `orders.html` | Orders | Searchable, filterable, sortable and paginated orders table with row selection and bulk actions |
| `customers.html` | Customers | Customer list with segments and search, slide-over detail panel with a notes form |
| `products.html` | Products | Product catalog with category filter, grid/table view and inventory levels |
| `settings.html` | Settings | Profile, team (invite modal), billing (plans, invoices), notification switches; `settings.html#billing` opens a tab directly |
| `login.html` | Sign in | Sign-in screen (demo: accepts any email and 8+ character password) |
| `404.html` | Not found | Not-found page |

## Project structure

```text
dashboard/
├─ index.html, analytics.html, orders.html, customers.html, products.html, settings.html, login.html, 404.html
├─ assets/
│  ├─ css/style.css       compiled Tailwind CSS (generated: don't edit by hand)
│  ├─ js/main.js          all JavaScript: demo data, charts, tables, menus, forms
│  └─ img/
│     ├─ favicon.svg
│     ├─ og-image.svg     editable source of the social sharing image
│     └─ og-image.png     1200×630 social sharing image
├─ src/input.css          Tailwind source: brand and chart tokens, component classes
├─ package.json           scripts to rebuild assets/css/style.css
└─ README.md, DOCS.md, CHANGELOG.md
```

`assets/js/main.js` is organized in numbered sections: 1 Helpers, 2 Demo data, 3 Theme, 4 Sidebar and
drawer, 5 Dropdown menus and global search, 6 Toast, modals, tabs and forms, 7 Charts, 8 Overview and
analytics pages, 9 Orders table, 10 Customers, 11 Products, 12 Settings and sign-in, 13 Scroll reveal,
then the back-to-top button.

## Customizing

### Brand and colors

Tokens live at the top of `src/input.css`. The `brand-*` scale (indigo by default) colors buttons, links,
active navigation and focus rings:

```css
@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SF Mono", Menlo, Consolas, monospace;

  --color-brand-500: #6366f1;
  --color-brand-600: #4f46e5;
  /* ...50 to 950 */
}
```

Chart colors are separate CSS variables, defined once for light mode and again for dark mode just below
`@theme`: `--chart-1` to `--chart-5` (series colors), `--chart-grid`, `--chart-text` and
`--chart-surface`. Charts read them at paint time, so changing a variable recolors every chart and they
follow the theme without re-rendering. Rebuild the CSS after editing.

### Typography

Inter (interface) and JetBrains Mono (numbers and codes) load from Google Fonts by a `<link>` in each
page's `<head>`. Change that link on every page and the `--font-sans` / `--font-mono` tokens, then rebuild
the CSS.

### Content

All demo data is generated in **section 2 ("Demo data")** of `assets/js/main.js`:

| Name | What it is |
|------|------------|
| `TODAY` | The "current" date the demo is built around: the visitor's today (preview another day with `?now=YYYY-MM-DD`) |
| `NAMES`, `CITIES`, `CHANNELS` | Lists used to generate customers and orders |
| `STATUSES` | Order statuses and their badge classes (`Paid`, `Pending`, `Refunded`, `Failed`) |
| `PRODUCTS` | Product catalog: name, SKU, category, price, stock, capacity, units sold, color and icon |
| `ORDERS` | 48 generated orders (id, customer, date, status, channel, items, product, total) |
| `CUSTOMERS` | Customers derived from `NAMES` and their orders (email, city, joined, orders, spent, segment) |

Chart series for the overview are in `REVENUE` (section 8); the analytics charts are built in the same
section. Add a product by appending to `PRODUCTS`:

```js
{ name: 'Summit Trail Cap', sku: 'AP-402', cat: 'Apparel', price: 29, stock: 140, cap: 200, sold: 610, hue: 'emerald', icon: 'jacket' },
```

`hue` is a key of `HUES` and `icon` a key of `ICONS` (section 11). To use real data, replace these arrays
with data from your API (for example `fetch('/api/orders').then(r => r.json())`) and call the same render
code once it arrives. Static text (page titles, labels, the activity feed and
settings content) is in the HTML files.

### Images and artwork

There are no photos. Avatars are generated initials (`avatar()` in section 1), product images are SVG
icons on a colored tile (`thumb()` in section 11), and charts are SVG. To show real product photos,
change `thumb()` to return an `<img>`. The favicon is `assets/img/favicon.svg`; the social image is
`assets/img/og-image.png` (1200×630, editable source `og-image.svg`).

### Navigation, sidebar and top bar

The sidebar (`#sidebar`) and top bar are repeated in every page; update them in each file (find-and-replace
works well). Mark the current page's link with `aria-current="page"`. To add a page, copy an existing one,
change its `<title>`, description and `<main>` content, add it to the sidebar on every page, and add an
entry to the `SEARCH` list (section 5) so global search finds it.

### Dark mode

A script in each page's `<head>` applies the saved theme and sidebar state before the page paints. The
theme toggle (`[data-theme-toggle]`, section 3) switches the `dark` class on `<html>` and saves
`ns-theme` in `localStorage`.

- **Default to light**: in the head script, remove `|| (!t && matchMedia('(prefers-color-scheme: dark)').matches)`.
- **Disable dark mode**: remove the toggle buttons, the theme lines in the head script and the
  `@custom-variant dark` line in `src/input.css`.

## Features

### Sidebar and mobile drawer

On wide screens the sidebar can be collapsed to icons; the choice is saved as `ns-sidebar`. Collapsed
links keep accessible names (`aria-label`) and tooltips, and the collapse button is then named "Expand
sidebar" (with `aria-expanded="false"`). Below 1024px the sidebar becomes a drawer with a
backdrop: focus is trapped inside, Escape or the backdrop closes it, and focus returns to the menu button.

### Global search

`Ctrl K` / `⌘ K` or `/` focuses the search box in the top bar. Results come from `SEARCH` (pages, settings
sections, every customer, order and product) and are navigable with the arrow keys and Enter. Results
link to filtered pages, such as `orders.html?q=NS-4821` or `customers.html?q=Olivia%20Martin`.

### Menus, modals and toasts

Dropdown menus (notifications, account) open on click and close with Escape or a click outside.
Elements with `data-modal` are dialogs: `data-modal-open="<id>"` opens one, `data-modal-close` closes it,
focus is trapped and returned. `toast(message)` shows a short status message; any element with
`data-toast-msg="..."` shows one when clicked. Buttons for screens the template doesn't include (help
center, new customer, CSV import, photo upload and so on) show an in-app message such as "Opening the help
center…" or "Exporting your report. The PDF will arrive by email."; point them at your own pages or actions
and change the messages to match.

### Charts

Section 7 contains the chart functions: `sparkline(el)`, `lineChart(el, cfg)`, `donut(el, segments,
centerLabel)`, `barChart(el, cfg)`, `funnel(el, steps)` and `heatmap(el)`. They redraw on resize and
show tooltips on hover. Line charts are also focusable: the Left/Right arrow keys move from point to point
and show each value in the tooltip, and Escape hides it. A line chart takes:

```js
lineChart(el, {
  height: 280,
  labels: ['Mon', 'Tue', 'Wed'],
  format: money0.format,
  series: [{ name: 'This period', color: color(1), values: [1200, 1640, 1510], area: true }]
});
```

The overview's range buttons (`[data-range="7d" | "30d" | "12m"]`) switch the revenue chart between the
three entries of `REVENUE`.

### Orders table

`orders.html` filters by status tab and search (also from `?q=`), sorts by any column header
(`aria-sort` is updated), paginates 10 rows per page, and supports selecting rows with a bulk-action bar
("Mark as paid", "Export", "Clear"). Change the page size with `per: 10` in the orders `state` (section 9).
The export buttons only show a toast ("Exporting 3 orders. The CSV will arrive by email."); connect them
to your own export.

### Customers and products

`customers.html` filters by segment and search and opens a slide-over detail panel with recent orders and
a notes form. `products.html` filters by category and switches between grid and table views; the choice is
saved as `ns-products-view`. Stock shows as a meter with "In stock", "Low stock" or "Out of stock". The
"Restock" buttons show "Restock request TC-7K2Q created for …" with a short reference (`TC-` and four
characters, made in the browser by `makeRef()` in section 1; use your purchasing system's own reference if
it has one).

### Settings

Tabs (`[role=tablist][data-tabs="hash"]`) support arrow keys, Home and End, and update the URL hash, so
`settings.html#team` and `settings.html#billing` open those tabs. The invite modal adds a member to the
list, plan buttons switch the current plan, notification switches are `role="switch"` buttons, and the bio
field has a 240-character counter.

### Back to top button

Created by the last block in `assets/js/main.js` and styled by `.back-to-top` at the end of
`src/input.css`. It appears after scrolling about one screen, returns to the top (instantly with reduced
motion), moves focus to the main content, lifts above the toast and anything marked
`data-back-to-top-avoid`, hides over pinned elements marked `data-back-to-top-hide`, and is hidden when
printing. Delete both blocks to remove it.

## Forms

Forms with `data-validate` are checked on submit: required fields, email format and `minlength`. Errors
appear under each field (inside its `[data-field]` wrapper), linked with `aria-describedby`, and focus moves
to the first problem. A valid form then calls the handler named by `data-on-valid` (from the `HANDLERS`
object) or shows the toast in `data-success`.

| Form | Page | Behavior |
|------|------|-----------|
| Sign in (`data-on-valid="signin"`) | `login.html` | Email and password (8+ characters); `HANDLERS.signin` redirects to `index.html` |
| Profile (`data-success="Profile saved"`) | `settings.html` | Name, email, bio and other profile fields; shows a toast |
| Invite (`data-on-valid="invite"`) | `settings.html` modal | Email and role; `HANDLERS.invite` adds the member to the team list and shows "Invitation sent to …" |
| Customer note (`data-success="Note saved to customer profile"`) | `customers.html` panel | Note text; shows a toast |

**Nothing is saved or sent until you connect it**, although the messages read as if it were ("Invitation
sent to …", "Plan changed to Scale. The new price starts on your next invoice."). To connect your API, look for the comment `// Demo only: nothing is sent.`
in `bindForms()` (section 6) and send the data before showing the success state:

```js
form.addEventListener('submit', function (e) {
  e.preventDefault();
  var ok = fields.map(checkField).every(Boolean);
  if (!ok) { $('[aria-invalid="true"]', form).focus(); return; }
  fetch(form.action, { method: 'POST', body: new FormData(form) })
    .then(function (res) {
      if (!res.ok) throw new Error();
      if (form.dataset.onValid && HANDLERS[form.dataset.onValid]) HANDLERS[form.dataset.onValid](form);
      else toast(form.dataset.success || 'Saved');
    })
    .catch(function () { toast('Something went wrong. Please try again.'); });
});
```

and give each form an `action` (for example `action="/api/profile"`). Replace `HANDLERS.signin` with a
call to your authentication provider. A dashboard should only be reachable after a real sign-in; protect
it on your server or host, not in this front-end code.

## Saved data (localStorage)

| Key | Values | Used for |
|-----|--------|----------|
| `ns-theme` | `"dark"` or `"light"` | Color theme |
| `ns-sidebar` | `"collapsed"` or `"open"` | Desktop sidebar state |
| `ns-products-view` | `"grid"` or `"table"` | Products page view |

Each value is compared with the exact expected strings when read, so a missing or tampered value falls back
to the default (system theme, open sidebar, grid view). Visitors can reset them by clearing site data.

## SEO and sharing

Each page has its own `<title>`, description and Open Graph tags in its `<head>`. A real admin dashboard
usually shouldn't be indexed: add `<meta name="robots" content="noindex">` to every page and a
`robots.txt` with `Disallow: /`. If you keep the pages public, make `og:image` an absolute URL (e.g.
`https://example.com/assets/img/og-image.png`).

## Accessibility

Built in: a skip link, landmarks, visible focus rings, keyboard support everywhere (drawer and modals trap
focus, menus close with Escape, tabs use arrow keys / Home / End, charts are keyboard-readable with
tooltips on line charts), `aria-sort` on sortable columns, `aria-pressed` on toggle buttons, `role="switch"` switches,
form errors linked with `aria-describedby`, reduced-motion support, and WCAG AA contrast in both themes.

When editing, keep one `<h1>` per page, give new controls labels, and give each chart an `aria-label`
describing what it shows.

## Building and deploying

### Rebuilding the CSS

```sh
npm install
npm run build    # or: npm run watch
```

Needed when you change `src/input.css` or add Tailwind classes that aren't in the template yet. Classes
created inside `assets/js/main.js` strings are included because Tailwind scans that file too.

### Deploying

Upload the folder to any static host (Netlify, GitHub Pages, Cloudflare Pages or your own server). For a
real admin area, put it behind authentication (your app's login, or your host's password protection) and
connect the data to your API.

## Troubleshooting

- **Charts are blank.** Their containers are found by attributes such as `[data-revenue-chart]` and
  `#traffic-donut`; keep those when editing the HTML.
- **A chart's colors don't change.** Edit the `--chart-*` variables (both light and dark blocks), then
  rebuild the CSS.
- **Search doesn't find a new page.** Add it to `SEARCH` in section 5.
- **`settings.html#billing` opens the wrong tab.** The tab's `aria-controls` must be `panel-billing`.
- **Dates look wrong.** Everything dated (charts, orders, the greeting, the analytics date range, the plan's
  renewal date and the invoices) is worked out from `TODAY`, which is the visitor's today. Without JavaScript
  the pages show neutral text ("today", "Last 30 days", "the 1st of next month").
- **New Tailwind classes have no effect.** Run `npm run build`.
- **The sidebar stays collapsed.** Clear `ns-sidebar` from `localStorage` or click the collapse button.

## License

MIT. The code and artwork are free for personal and commercial use; the download includes the license text
in `LICENSE.txt`. Inter and JetBrains Mono are licensed under the SIL Open Font License.
