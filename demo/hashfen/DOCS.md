# Hashfen documentation

## Overview

Hashfen is a fictional network research product based in Golden, Colorado, built with standalone HTML, Tailwind CSS v4 and dependency-free JavaScript. Version 1.0.2 includes nine pages, twelve original network profiles, transaction modeling, a research workspace and a pricing calculator. See the [template page](https://freeframe.dev/templates/hashfen) for the live preview.

The profiles describe invented networks and editable assumptions. The product does not connect wallets, request secrets, move funds or query blockchains. Replace the research content with reviewed material appropriate to your business before publishing.

## Quick start

Open [index.html](index.html) directly in a browser. The compiled stylesheet and all JavaScript are included; no build step is required.

For local development, serve the folder over HTTP:

```sh
npx serve .
```

Follow the localhost address printed by the command. Google Fonts requires an internet connection; system sans-serif fallbacks remain usable offline.

Only CSS rebuilds need Node 24 and npm:

```sh
npm install
npm run build
```

Run these commands from this template folder, where [package.json](package.json) lives.

## Pages

| File            | Purpose              | Features                                                          |
| --------------- | -------------------- | ----------------------------------------------------------------- |
| `index.html`    | Product introduction | Original network artwork, research method, featured profiles      |
| `networks.html` | Network catalog    | Search, architecture filter, sorting, watchlist buttons           |
| `network.html`  | Individual profile   | Validated network parameter, assumptions, risks, related profiles |
| `planner.html`  | Transaction planning | Editable fee calculation, sensitivity, saved scenarios            |
| `research.html` | Research workspace   | Saved profiles, notes, comparison table, add/remove/clear         |
| `pricing.html`  | Subscription plans   | Three plans and a seat/lookup usage calculator                    |
| `learn.html`    | Research library     | Nine searchable, categorized expandable notes                     |
| `company.html`  | Company and contact  | Three people, methods, contact request and success state          |
| `404.html`      | Missing page         | Useful routes back to the catalog and planner                   |

All paths are relative. Keep the pages and `assets` directory together when deploying under a subdirectory.

## Project structure

```text
hashfen/
  index.html              Home and featured profiles
  networks.html           Searchable catalog
  network.html            Data-driven profile
  planner.html            Transaction model and named scenarios
  research.html           Saved research and notes
  pricing.html            Plans and usage calculator
  learn.html              Research guides
  company.html            Company, people and contact form
  404.html                Missing-page recovery
  assets/
    css/style.css         Compiled Tailwind stylesheet
    js/data.js            Network, guide, plan and team catalogs
    js/main.js            Rendering, calculations, storage and interaction
    img/                  Original SVG art, favicon and social images
  src/input.css           Tailwind import, theme and component styles
  package.json            CSS build and watch commands
  README.md               Short introduction and setup
  DOCS.md                 This guide
  CHANGELOG.md            Version history
```

The social image source is `assets/img/og-image.svg`; `assets/img/og-image.png` is its 1200 × 630 raster export.

## Customizing

### Brand and colors

Edit the `@theme` block in [src/input.css](src/input.css). The main tokens are:

| Token            | Default   | Use                                          |
| ---------------- | --------- | -------------------------------------------- |
| `--color-ink`    | `#111119` | Page canvas and dark field background        |
| `--color-panel`  | `#1c1b27` | Cards and surfaces                           |
| `--color-raised` | `#252332` | Hover and raised surfaces                    |
| `--color-paper`  | `#f4f0fc` | Primary text                                 |
| `--color-muted`  | `#c4bdcf` | Secondary text                               |
| `--color-line`   | `#595362` | Borders and separators                       |
| `--color-lime`   | `#c9f76b` | Calls to action, focus and calculated totals |
| `--color-violet` | `#bda5f1` | Labels, accents and link decoration          |

For example, change the accent while retaining a light color against the dark canvas:

```css
@theme {
  --color-lime: #d9f296;
}
```

Rebuild CSS after editing. Check button text, input boundaries and focus contrast when changing tokens. Update the SVG palette separately; SVG colors do not inherit Tailwind tokens.

### Typography

Every HTML head links to Google Fonts for Michroma regular 400 and Lato 400/700, with preconnects to both Google font hosts and `display=swap`.

`--font-display` sets Michroma for headings. `--font-sans` sets Lato for body content. Michroma has only regular weight; do not add unsupported bold heading weights.

To switch families, replace the Google Fonts link on all nine pages and update both tokens. Keep a `sans-serif` fallback. No font binaries or `@font-face` rules are included.

### Content

Static copy lives in the HTML pages. Shared catalog content lives in [assets/js/data.js](assets/js/data.js), exposed as `window.HASHFEN_DATA`.

| Catalog  | Contents                                                                       |
| ---------- | ------------------------------------------------------------------------------ |
| `networks` | Twelve networks, IDs, labels, assumptions, artwork and operating questions     |
| `guides`   | Nine notes with category, title, summary, paragraphs and a closing check       |
| `plans`    | Three subscription plans, allowances, additional-seat and lookup-block prices |
| `team`     | Three people, roles, biographies and portrait paths                            |

In [assets/js/main.js](assets/js/main.js), these become `NETWORKS`, `GUIDES`, `PLANS` and `TEAM`. `NETWORK_MAP` and `PLAN_MAP` are generated from catalog IDs.

To add a profile, copy a complete existing object from `networks`, give it a unique lower-case ID and supply every field, including `checks`, `metrics`, `index` and `art`.

The core assumptions have this shape:

```js
{
  id: 'velcrux',
  name: 'Velcrux',
  ticker: 'VQRX',
  layer: 'Layer 1',
  consensus: 'Proof of stake',
  finality: 12,
  fee: 18,
  units: 21000,
  token: 1400,
  batch: 8,
  capacity: 1100
}
```

This is an excerpt of the existing record, not a complete replacement object. `finality` is seconds, `fee` is the fee rate in nanotokens (billionths of the network token) per fee unit, `units` is fee units per operation and `token` is a US-dollar token-value assumption. The planner initially uses zero batch saving; the profile's `batch` value is descriptive context.

Update `LAYERS` and the HTML architecture options if introducing a new architecture. Guide categories are explicitly allowed in `initGuides`; update that list and the select options together.

Keep profile IDs stable after launch so saved research retains its meaning. Removing an ID automatically drops it from validated saved watchlists.

### Images and artwork

The twelve network SVGs use different geometries. `research-cube.svg` is the home illustration. `endellion.svg`, `teleri.svg` and `emrys.svg` are original illustrated portraits.

Network artwork uses a 400 × 330 aspect ratio; portraits use 300 × 300. The planner, research, pricing, company and learn pages each have their own hero illustration (`hero-<page>.svg`, 560 × 360). No artwork contains text; labels sit in the HTML. Preserve those ratios or update the HTML width/height attributes and layout together.

Edit `assets/img/og-image.svg` for the social artwork, then regenerate its 1200 × 630 PNG with an SVG renderer that loads your selected fonts. HTML Open Graph tags must continue pointing to the PNG.

The favicon is `assets/img/favicon.svg`. Icons are inline SVG within HTML and JavaScript, with decorative icons hidden from assistive technology.

### Navigation, header and footer

Header, mobile navigation and footer are repeated in each HTML file. Apply navigation edits to all nine files. Keep `aria-current="page"` on the current section link.

`initMenu` controls `data-menu-toggle` and `#mobile-menu`. The control updates its expanded state, focuses the first link when opening and returns focus when Escape closes it. At desktop width the mobile menu closes.

The theme is deliberately dark and does not include a theme switch or theme storage key. Operating-system color preferences do not change its palette.

## Features

### Network discovery

`initNetworkLibrary` reads `NETWORKS`, `LAYERS` and `SORTS`, then renders `card` entries into `data-network-grid`. Search covers the name, consensus, use and heading. Sorting supports name, fee and finality.

The `q`, `layer` and `sort` URL parameters initialize the controls; subsequent edits stay on the page without rewriting the URL. Unknown sort and architecture values use safe defaults. The result count is a live status and the empty state offers a reset.

`initNetworkDetail` uses the `network` parameter and an own-property lookup against `NETWORK_MAP`. Unknown IDs, including inherited property names, fall back to Velcrux. It updates the document title and social description to match the selected profile.

### Transaction assumptions

`initPlanner`, `planValues`, `calculate`, `renderPlan` and `fillPlanner` implement the planner. Inputs are validated before a result or stored state changes.

| Input                   | Allowed range             |
| ----------------------- | ------------------------- |
| Operations              | Integer 1–100,000         |
| Fee units per operation | Integer 21,000–30,000,000 |
| Fee rate                | 0.01–10,000 nanotokens    |
| Token value             | $0.01–$1,000,000          |
| Batch saving            | 0–60%                     |
| Finality windows        | 1, 2, 3 or 5              |

`LIMITS` defines these bounds. Keep native input attributes aligned when changing limits.

The calculation is operations × fee units × fee rate ÷ 1,000,000,000 × token value × (1 − saving ÷ 100). Settlement allowance is profile finality × selected windows. Sensitivity figures halve and double the entered fee; they hold other assumptions constant.

The default Velcrux calculation is 100 × 21,000 × 18 ÷ 1,000,000,000 × $1,400 = $52.92. Two finality windows give 24 seconds. A 10% batch saving gives $47.63 after rounding.

Changing network restores that profile's assumptions but keeps the operation count. Restore profile assumptions also resets operations to 100. A valid `network` URL parameter takes precedence over remembered inputs.

### Named scenarios

The separate `data-save-scenario` form records a name, optional research note and validated planner values. `MAX_SCENARIOS` is eight. A case-insensitive duplicate name updates the existing scenario; a ninth unique scenario replaces the oldest stored entry.

`renderScenarios` provides load and remove controls. Loading fills the planner and save form, then focuses the network selector. Removing returns focus to a nearby remove control or the scenario name. Clear returns focus to the name input.

Scenario names are limited to 60 characters and notes to 400. The save status is announced without moving focus. Do not enter contact details or secrets into research notes.

### Research watchlist

`toggleWatch`, `updateWatchUI`, `initResearch` and `renderResearch` share saved profiles across the catalog, details and workspace. The workspace also has its own add selector so saving remains useful when browser storage is unavailable.

Each saved profile has a note capped at 600 characters. Input updates saved state without replacing the active textarea. Adding or removing another profile re-renders the workspace from the saved state, retaining notes.

The comparison table uses saved catalog assumptions. On narrow screens it scrolls inside its own wrapper. Remove and clear actions return keyboard focus to a surviving control.

### Pricing calculator

`initPricing` reads `PLANS`; `priceCalculation` derives all charges from catalog prices. Seats are clamped to 1–100 and lookups to 0–1,000,000. This calculator does not persist inputs.

Additional seats are charged above the included allowance. Additional lookups are rounded up to blocks of 10,000. Annual pricing discounts the base subscription only; additions are charged at their monthly rate multiplied by twelve.

For Research team, seven seats and 70,000 lookups cost $103.00 monthly or $1,078.00 annually. A valid `plan` parameter selects the initial plan. Changing plan restores its included allowances.

### Research library

`initGuides` searches titles, summaries and paragraphs, combined with the Costs, Settlement, Risk or Research category. Each result uses a native `details` disclosure, with a keyboard-operable `summary`.

No guides or search terms are saved. Empty results have a specific message; clearing search and choosing all areas restores the library.

### Motion and dates

`initReveals` observes `.reveal` elements and adds `.is-visible`. Reduced-motion preference makes content visible immediately. The base CSS also leaves content visible when JavaScript is unavailable.

`TIME_ZONE` is `America/Denver`. Copyright spans marked `data-year` derive their year from the current browser date in that timezone. There are no fixed upcoming events, availability deadlines, live feed claims or booking windows to roll forward.

To use a fixed legal year instead, remove `data-year` and set the span text in every page; this is the only date-driven feature.

## Forms

The network filter, guide filter, research picker, planner, scenario save and pricing forms are local tools. Their submit handlers prevent navigation and calculate or update the current page.

The contact form in [company.html](company.html) is front-end-only and does not transmit data until you connect a backend. It validates names of 2–100 characters, email format up to 180 characters, messages of 12–2,000 characters and an allowed topic. Each problem is shown beside its own field.

Organization is optional. Contact details are not stored in localStorage. On success the form gives a reference and a next step. No email is sent by this standalone version.

Connect a form service inside `initContact`, immediately after validation and before reference generation. Make the submit listener asynchronous and replace the integration comment with an awaited request:

```js
const response = await fetch(form.action, {
  method: "POST",
  body: new FormData(form),
  headers: { Accept: "application/json" },
});
if (!response.ok) {
  summary.hidden = false;
  summary.textContent = "We could not receive your request. Please try again.";
  return;
}
```

Set the actual form's `action` to your Formspree endpoint, for example `https://formspree.io/f/YOUR_FORM_ID`, and add `async` to the existing submit callback. Wrap the request in `try/catch` and show the same inline retry message for network errors. Disable the submit button while awaiting the response and re-enable it in `finally`.

Only continue to the existing reference/success panel after `response.ok`. Prefer a server-generated reference if the backend supports it. Validate again on the server, provide a privacy policy and configure spam protection before accepting public submissions.

The current `HF-` reference is generated from the browser clock for the local success presentation. It is not a delivery receipt. `data-contact-another` resets the form for another question.

## Saved data (localStorage)

All saved features use one `safeStorage` adapter. It mirrors writes into a memory map before attempting localStorage. If any access throws, it uses that memory map for the rest of the current page, including later reads.

| Key                    | Shape                                                     | Use                                   |
| ---------------------- | --------------------------------------------------------- | ------------------------------------- |
| `hashfen:watch:v1`     | `{items: [{id, note}]}`                                   | Known network IDs and research notes  |
| `hashfen:planner:v1`   | `{network, operations, units, fee, token, saving, windows}` | Most recent valid working inputs      |
| `hashfen:scenarios:v1` | `[{id, name, note, values}]`                              | Up to eight named calculation records |

`readJSON` removes malformed JSON. `cleanWatch` accepts records with an items array, checks own ID properties, rejects unknown IDs, removes duplicates and truncates notes. `cleanPlanner` starts with profile defaults, reads own numeric properties, clamps ranges and restricts finality windows. Inputs saved under the earlier `gas` property name are read as `units`.

`cleanScenarios` accepts only arrays, requires a unique `hf-` ID matching its pattern, a non-empty name and a values record, then sanitizes each calculation. The read functions rewrite valid JSON to its normalized shape. All three stores are checked at boot, even on pages that do not display them.

Use Clear watchlist and Clear saved scenarios in their respective pages. To reset all persisted settings through the browser console:

```js
localStorage.removeItem("hashfen:watch:v1");
localStorage.removeItem("hashfen:planner:v1");
localStorage.removeItem("hashfen:scenarios:v1");
location.reload();
```

Blocked storage retains changes only in the current page. Reloading or navigating discards that memory fallback. Use the workspace add selector and planner's saved scenario controls to exercise every feature on the same page.

Research notes are local to this browser, not synchronized to a server. Do not use them for secrets, private keys, seed phrases or personal contact information.

## SEO and sharing

Each HTML head has a unique title and description, Open Graph tags, theme color and favicon. `network.html` updates its title and descriptions after selecting a valid profile; crawlers without JavaScript receive the default profile metadata.

Replace the relative `og:image` value on every page with the absolute public URL of `assets/img/og-image.png`, such as `https://your-domain.example/assets/img/og-image.png`. Use your real production domain when launching.

Set canonical URLs, add a sitemap listing your public pages and configure robots rules at your host. No structured data is included; add only claims that describe your real business and reviewed content.

## Accessibility

Pages include a skip link, header/navigation/main/footer landmarks, visible focus outlines and one primary heading. Keep heading levels logical when adding content.

Inputs have visible labels. Invalid contact fields receive `aria-invalid` and linked inline explanations; focus moves to the first invalid field. The success panel receives focus after submission.

Results and save actions use status messages. Watchlist buttons expose pressed state and their accessible labels contain the full visible wording. Keep this relationship when changing labels.

The mobile menu supports Escape and focus return. Native guide disclosures support keyboard use without custom roles. Tables keep a caption and scoped header cells.

Reduced motion disables reveal transitions. When changing colors or imagery, recheck contrast, 200% zoom, keyboard order, meaningful image alternatives and narrow-screen overflow.

## Building and deploying

The download includes compiled CSS. Rebuild after changing theme tokens or adding new Tailwind utilities:

```sh
npm install
npm run build
```

For continuous compilation:

```sh
npm run watch
```

`src/input.css` scans this template through `source("../")`. Keep the compiled output at `assets/css/style.css` and deploy all HTML, CSS, JS and artwork together.

Upload the folder to any static host, including GitHub Pages, Netlify or Cloudflare Pages. Configure the host's missing-page behavior to use `404.html`. A backend integration for contact requests is a separate deployment concern.

Test the deployed URLs under the actual base path. Cache fingerprinting is not built in; invalidate stale CSS/JS when publishing an update.

## Troubleshooting

| Problem                                           | Fix                                                                                     |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| New utility classes do not appear                 | Run `npm run build`; confirm `source("../")` and the stylesheet link                    |
| Headings use fallback fonts                       | Check Google Fonts access, the CSS2 link and the two font tokens                        |
| Research disappears after navigation              | Storage may be blocked; memory fallback lasts only for the current page                 |
| A profile link opens Velcrux                      | Check the exact `network` ID against `networks` in `data.js`                            |
| Contact requests do not arrive                    | Connect and verify a backend inside `initContact`; the standalone form does not send    |
| Annual estimate differs from ten monthly payments | Only the base plan is discounted; additional seats and lookup blocks use twelve months |
| A changed catalog ignores old saved entries     | Known-ID validation deliberately removes deleted or renamed IDs                         |
| Social previews show an old image                 | Regenerate the PNG, set an absolute `og:image` and refresh the platform's preview cache |

## License

MIT. See `LICENSE.txt` in the download for the full terms. The code and included artwork may be used for personal and commercial projects.

Michroma and Lato are Google Fonts distributed under the SIL Open Font License. Fonts are loaded remotely and are not bundled in this folder.

All icons and illustrations are original SVG artwork included with the template. The business, people, networks and research figures are fictional. Replace them with reviewed material before launch.
