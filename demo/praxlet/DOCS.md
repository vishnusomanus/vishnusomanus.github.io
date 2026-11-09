# Praxlet documentation

## Overview

Praxlet is a fictional educational robotics and modular hardware company in Nashua, New Hampshire. This HTML and Tailwind CSS v4 template includes a sixteen-module catalog, a compatible kit planner, project guides, field notes and a business inquiry form. This is version 1.0.2. Visit the [template page](https://freeframe.dev/templates/praxlet) for the live preview.

## Quick start

Serve this folder with a local static server and open `index.html`.
The compiled CSS is included, so no build step is needed to browse the site.
A server is recommended because clipboard permissions and local storage behave more predictably over HTTP.

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080` in your browser.
You can also open the HTML files directly, although browser restrictions may limit persistence and copying.
JavaScript must be enabled for the catalog, kit planner and inquiry validation.
Node.js 24 or later and npm are required only when rebuilding the CSS.
Google Fonts requires an internet connection; system sans-serif fallbacks remain available offline.

## Pages

| File                | Purpose            | Notable features                                                                        |
| ------------------- | ------------------ | --------------------------------------------------------------------------------------- |
| `index.html`        | Brand introduction | Exploded robot illustration, four modules, three projects and kit planning introduction |
| `modules.html`      | Module catalog   | Sixteen products, search, voltage/category filters, sorting and saved comparison        |
| `module.html`       | Module detail      | Specifications, included parts, assembly steps, dependencies and related modules        |
| `configurator.html` | Kit bench          | Presets, quantities, compatibility checks, budget and class-set totals, named builds    |
| `projects.html`     | Project bench      | Six parts lists, learning aims, expandable methods and planner links                    |
| `docs.html`         | Field notes        | Twelve searchable guides with practical steps and cautions                              |
| `company.html`      | Company story      | Principles, three team members and Nashua workshop information                          |
| `contact.html`      | Inquiries          | Validated request, kit quote with parts list and total, success reference and next steps |
| `404.html`          | Error recovery     | Links to the catalog, kit bench and company contact                                   |

`module.html?module=rangetail` selects a module.
An absent or unknown module selects Arcloop safely.
`configurator.html?project=quiet-scale` loads a complete project kit.
`configurator.html?module=softjaw` adds one known module to the current draft.
A valid planner query is consumed once and removed with `history.replaceState`.
Unknown identifiers, including inherited property names, cannot select records.
`docs.html?guide=first-power` opens the matching field note.
`contact.html?topic=kit` selects an inquiry topic.
The allowed topics are `quote`, `kit`, `module`, `project`, `visit` and `support`; anything else falls back to `kit`.
`contact.html?topic=quote` opens the quote request for the current kit bench (the kit bench's "Request a quote" button links here).

## Project structure

```text
praxlet/
  index.html                 Home page
  modules.html               Search and comparison
  module.html                Data-driven module detail
  configurator.html          Kit planner and saved builds
  projects.html              Six project methods
  docs.html                  Searchable field notes
  company.html               Team and workshop
  contact.html               Inquiry form and success state
  404.html                   Recovery page
  assets/
    css/style.css            Compiled Tailwind output
    js/data.js               Modules, projects, guides and team
    js/main.js               Behavior, validation and calculations
    img/                     Original SVG illustrations and sharing artwork
  src/input.css              Theme tokens, utilities and reusable components
  package.json               CSS build and watch commands
  template.json              Version, page list and feature metadata
  README.md                  Short getting-started guide
  DOCS.md                    Complete editing guide
  CHANGELOG.md               Release history
```

## Customizing

### Brand and colors

Edit `@theme` in `src/input.css` and rebuild `assets/css/style.css`.
The important tokens are `paper`, `ink`, `red`, `line`, `muted`, `wash` and `soft`.
`paper` is the warm page background, `ink` the dark instrument color and `red` the action color.
Keep sufficient contrast for small labels, borders and keyboard focus rings.

```css
@theme {
  --color-red: #b92e20;
  --color-paper: #f5f3ec;
  --color-ink: #252522;
}
```

The focus outline also contains the red value in the base layer.
Update that value when changing the accent.
The `.wrap`, `.btn`, `.field`, `.chip` and `.spec-line` classes hold repeated layout patterns.
Most page styling remains in Tailwind utility classes in HTML and JavaScript render functions.

### Typography

Teko provides headings; Mada provides body text and controls.
Every HTML head includes Google Fonts preconnects and one CSS2 stylesheet link with `display=swap`.
Teko loads weights 400, 500 and 600; Mada loads 400, 600 and 700.
There are no bundled font files or `@font-face` declarations.
Change the Google Fonts link on all nine pages and the `--font-display` / `--font-sans` theme tokens together.
The SVG specimen labels deliberately use a generic monospace face.
The social SVG contains its own font-family declarations; update those when changing the brand typography.

### Content

Static page copy lives in the HTML files.
The repeated content lives in `window.PRAXLET_DATA` in `assets/js/data.js`.
Its arrays are `modules`, `projects`, `guides` and `team`.
`main.js` reads these into `MODULES`, `PROJECTS`, `GUIDES` and `TEAM`.
`MODULE_MAP`, `PROJECT_MAP` and `GUIDE_MAP` index records by identifier.
Keep identifiers lowercase and stable when changing content: saved builds reference them.

A module record includes these fields:

| Field                        | Meaning                                                   |
| ---------------------------- | --------------------------------------------------------- |
| `id`, `name`, `code`         | Stable identifier, visible name and specimen code         |
| `category`, `interface`      | Catalog grouping and electrical/mechanical connection   |
| `voltage`, `current`         | Required logic/supply voltage and planning current in mA  |
| `price`                      | Price in integer cents, before sales tax                  |
| `slots`                      | Chassis mounting slots occupied by one unit               |
| `dimensions`, `mass`         | Dimensions in mm and mass in g                            |
| `description`, `note`        | Short introduction and module-specific practical guidance |
| `includes`, `steps`          | Included pieces and ordered setup instructions            |
| `capacity`                   | Controller channel limits, keyed by interface             |
| `ports`, `address`           | Channels used and fixed I²C address where relevant        |
| `requires`                   | Other module quantities required by one unit              |
| `supply`                     | Supply capacity in mA for Dockfin                         |
| `slotCapacity`, `extraSlots` | Base chassis and upper-deck mounting capacity             |

Only add optional fields when they apply to the module.
For example, Rangetail uses `interface: "i2c"`, `ports: 1` and `address: "0x29"`.
After adding a module, provide an original `assets/img/<id>.svg` illustration.
Inner-page heroes have their own art: `hero-modules.svg`, `hero-kit.svg`, `hero-projects.svg`, `hero-contact.svg` and
`bench.svg` (company). Team portraits are `person-1.svg` to `person-3.svg`, in the order of `team` in `data.js`;
names are in the HTML, not the artwork.

The age and small-parts note ("Recommended for ages 11+. Contains small parts.") appears on the catalog,
kit bench, projects, module detail and quote form. Change `AGE_NOTE` in `main.js` and the `data-age-note`
paragraphs in the HTML together, and check the wording against the safety marking your products carry.
Include its identifier in relevant project `parts` objects.
Update HTML claims about catalog size when changing the sixteen-item catalog.

Project records contain `id`, `title`, `level`, `minutes`, `voltage`, `summary`, `art`, `parts`, `learn` and `steps`.
Their `parts` object maps known module IDs to integer quantities.
Guide records contain `id`, `title`, `category`, `summary`, `steps` and `caution`.
Team records contain `name`, `role` and `bio`; their portraits follow array order.
All names, specifications, projects and contact details are fictional.
Replace them with checked information for your own organization before launch.

### Images and artwork

The sixteen module illustrations are individual 420 × 320 SVG constructions.
Project scenes, portraits, the bench and exploded assembly use the same specimen ratio.
Keep that aspect ratio to preserve card and hero alignment.
Replace SVGs with locally hosted images and update dimensions and meaningful alt text together.
Avoid putting important specifications only inside an image.
`assets/img/og-image.svg` is the 1200 × 630 social source.
`assets/img/og-image.png` is the rendered sharing image used by the HTML heads.
`assets/img/favicon.svg` is the browser icon.
No external image service or JavaScript library is required.

### Navigation, header and footer

Header and footer markup is repeated in all nine HTML files.
Update every copy when adding a page or changing the workshop details.
Set `aria-current="page"` only on the current navigation link.
The mobile toggle controls `#mobile-menu` through `data-menu-toggle`.
Preserve the controlled ID, expanded state, visible labels and Escape behavior.
The footer year is filled from the current date in America/New_York.
The site follows one fixed light palette in both operating-system color preferences.
There is no theme switch or saved dark-mode setting.

## Features

### Module search and sorting

`initCatalogue` filters the sixteen records by search text, category and voltage.
Search covers the module name, code, description, category and interface.
Sorting supports function, price ascending, current and name.
The count is a live status and an explicit empty state appears when nothing matches.
Text search updates on input; select filters update on change, so leaving a search field cannot replace the next clicked control.
The filters do not save personal or query data.
Change the categories in `CATEGORIES` and matching HTML options together.
`moduleCard` owns the repeated product markup and comparison button.

### Module detail

`initModule` validates the `module` query through an own-property lookup.
It renders one detail record, updates the document title and shows three related records.
Specifications use the same catalog data as the calculator.
The setup instructions and included pieces are authored per module.
The add-to-build link goes to the kit bench with a known module ID.

### Comparison board

`initComparison`, `toggleComparison` and `renderComparison` manage up to four modules.
`MAX_COMPARE` sets that limit.
Buttons expose `aria-pressed`, update the saved board and announce changes.
The board compares price, voltage, planning current, interface, dimensions, mass and mounting slots.
Remove buttons move focus to another removal control or the clear control as appropriate.
The clear button clears all selected modules and restores a useful focus target.
Filtering the catalog retains the comparison selection.
The detail page also supports adding or removing its module.

### Kit compatibility

`initBuilder` manages the current draft; `analyse` calculates every result.
`projectBuild` creates a preset from a project parts list.
`addPart` replaces the previous controller when another controller is selected.
The planner supports 3.3 V and 5 V systems and one Dockfin supply.
It checks all of the following:

- Exactly one controller and an appropriate power module.
- Controller voltage and each powered module's voltage against the selected system.
- Available controller channels for I²C, PWM, digital and analog connections.
- Fixed I²C address collisions, including repeated units with the same address.
- Module dependencies and their quantities, such as two Seamdrive units per Siltstep.
- Occupied mounting slots against Tackrail and optional Shelfwing capacity.
- Planned current including headroom against Dockfin's 1,200 mA capacity.

Mechanical modules do not create voltage conflicts.
A dependency is checked per quantity, rather than merely requiring its identifier to exist.
An empty bench receives an explicit planning prompt.
An invalid kit stays editable and all identified issues are listed.
These checks are educational planning aids, not certified electrical or mechanical validation.
The site never connects to or operates a device.
Keep the supervised low-voltage scope when adapting the content.

### Power and price calculations

`POWER_MARGIN` is 1.25: a 25% current allowance.
Planning current is `ceil(sum(current × quantity) × POWER_MARGIN)`.
The power bar is capped visually at 100%, while the actual number and overload warning remain visible.
Cost is the sum of module price in cents multiplied by each quantity.
The budget difference is measured per kit; class cost multiplies kit cost by the kit count.
The planner supports one to twelve kits and a per-kit budget from $0 to $10,000.
Most modules allow one to four units; controllers, supply, chassis and upper deck allow one.
`MAX_MODULE_QTY` controls the general quantity cap.
The initial Line courier kit costs $220.00 and draws 455 mA before allowance.
Its planning allowance is 569 mA against the 1,200 mA supply.
All six project presets are complete compatible builds using the supplied data.
`money` and `number` format values using US English and USD.

### Saved builds and bill of materials

`renderBuildLines` owns the editable parts list.
A quantity edit updates totals without replacing the input during its blur/change event.
`renderBuildSummary` updates the cost, mounting count, port use, power and issues.
`MAX_SAVED` limits named builds to six.
Saving an existing name, compared without case, updates its parts and settings.
A saved build can be loaded or removed on the same page.
Clearing the current bench leaves named builds intact.
`bomText` builds a plain-text parts list with prices, voltage and planning current.
The copy button uses the Clipboard API and falls back to a selectable text area.
This parts list contains no personal contact information.

### Projects and field notes

`initProjects` renders six project cards, filters their level and expands each method with native `details` elements.
Project links open the kit bench with the complete parts list.
`initGuides` filters twelve notes by query and category.
Search covers titles, summaries, steps and cautions.
A matching guide query opens that note; unknown identifiers do nothing.
Native disclosure controls remain keyboard accessible without a custom focus trap.

### Menu and motion

`initMenu` opens the mobile navigation, focuses its first link and closes it with Escape.
Escape returns focus to the menu button.
Crossing into the desktop breakpoint closes the mobile panel.
`revealNew` reveals new content with IntersectionObserver.
When reduced motion is requested or the API is unavailable, all content is immediately visible.
No content depends on an animation completing.

## Forms

### Inquiry request

`initContact` handles `data-contact-form` in `contact.html`.
It validates a name of at least two characters, a complete email, a twelve-character message, a known topic and permission to reply.
Organization is optional.
Errors appear beside their fields and in a live summary; focus moves to the first invalid field.
The current kit is displayed as context but contact details are never placed in local storage.
A valid submission hides the form and displays a focused success panel, a `PX-YYYYMMDD-####` reference and a two-business-day next step.

### Kit quote request

Choosing the `quote` topic (or arriving from the kit bench's "Request a quote for N kits" button) shows the
`data-quote-kit` fieldset: the parts list from the current kit bench with line prices, a number of kits (1–12) and
the per-kit and total prices before sales tax. Changing the number of kits updates the total and the kit bench.
The message is optional for a quote. An empty kit bench or a kit count outside 1–12 is reported beside the field.
The submitted `FormData` carries `topic=quote`, `kits` and `partsList` (the same text as Copy parts list).
Success hides the form and repeats the kit, number of kits and total with a `PX-QYYYYMMDD-####` quote reference and
three next steps (stock and build check, a written quote by email valid for 30 days, purchase order or card and
shipping within five business days). Edit those steps in `initContact`.
No email delivery or confirmation is claimed.
The Ask another question button resets the form and focuses the name field.
The success panel uses scoped `overflow-wrap: anywhere` to keep long unbroken names within narrow screens.

The supplied front-end handler does not send requests to a server.
Its success state demonstrates the completed customer journey and must be connected before accepting live inquiries.
Find the production integration comment immediately before `const firstName` in `initContact`.
Make the submit listener `async`, then insert a real request at that point.
For example, replace the placeholder endpoint below with your Formspree form endpoint:

```js
try {
  const response = await fetch("https://formspree.io/f/YOUR_FORM_ID", {
    method: "POST",
    body: new FormData(form),
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Request failed");
} catch {
  const summary = $("[data-form-summary]", form);
  summary.textContent = "We could not save your request. Please try again.";
  summary.hidden = false;
  summary.focus();
  return;
}
```

Keep the existing success code after this block so it runs only after `response.ok`.
Disable the submit control during the request and restore it on failure.
Prefer a server-generated reference returned by the endpoint over `requestReference` in production.
Add server-side validation, spam protection, retention rules and your privacy information.
If attaching the current kit, send only a sanitized parts/settings object and calculate prices on the server.
The catalog filter, guide filter, add-part and save-build forms only update the local interface.
They do not submit to a network endpoint.

## Saved data (localStorage)

All storage access passes through the single `safeStorage` adapter in `main.js`.
Writes reach an in-memory Map before attempting local storage.
If reading, writing or removal throws, subsequent operations use that Map for the current page.
This preserves same-page load, update and removal when persistent storage is blocked.
Memory-only changes end when the page closes or reloads.
`readJSON` catches malformed JSON and removes the corrupt value.

| Key                  | Shape                                    | Validation                                                                                          |
| -------------------- | ---------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `praxlet:build:v1`   | `{parts:[{id,qty}],voltage,budget,kits}` | Known own IDs, bounded integer quantities, 3.3/5 V, bounded budget and kit count                    |
| `praxlet:saved:v1`   | `[{id,name,build}]`                      | Up to six records, unique safe IDs and names, two-to-sixty-character names, sanitized nested builds |
| `praxlet:compare:v1` | `[moduleId]`                             | Known own IDs, unique values, maximum four                                                          |

`cleanBuild` inspects at most 64 incoming part entries and merges duplicate known IDs within quantity limits.
Unknown IDs, inherited property names and malformed record shapes are discarded.
Numeric fields accept only primitive numbers or strings before conversion; objects cannot trigger coercion hooks.
Saved-build IDs must be strings before the identifier pattern is checked.
`readSaved` strips control characters, deduplicates names without case and sanitizes every nested build, dropping any that has no modules left.
The build is written in its clean shape after reading.
An absent current draft starts with Line courier; an existing invalid shape becomes an empty safe draft.
No names, email addresses, messages or organization details from the inquiry form are stored.
Named build labels are user-entered local labels; avoid putting personal details in them.

Use the on-page clear, remove and delete controls for normal resets.
To restore all initial local state from the browser console:

```js
["praxlet:build:v1", "praxlet:saved:v1", "praxlet:compare:v1"].forEach((key) => {
  localStorage.removeItem(key);
});
location.reload();
```

Changing a module identifier breaks references in older saved builds.
Increment the storage-key version when introducing an incompatible schema.

## SEO and sharing

Every HTML head has its own title, description and Open Graph tags.
Module detail changes the document title after selecting its record.
All pages use `assets/img/og-image.png`; set `og:image` to its absolute deployed URL before launch.
Add a canonical URL per page when your domain is known.
Provide a sitemap and robots.txt for your final public routes.
A static host may need a rewrite or error-page setting to serve `404.html` for missing routes.
No structured-data claims, live stock feeds or external analytics are included.

## Accessibility

Pages contain a skip link, semantic header/navigation/main/footer landmarks and one `h1`.
All form controls have visible labels and errors are connected with `aria-describedby`.
Filter results and planning updates use status text rather than color alone.
Buttons expose pressed or expanded state where appropriate.
Comparison and saved-build removal return focus to a usable control.
The success panel is focusable and receives focus after a valid inquiry.
Keyboard focus outlines are visible against both paper and dark panels.
Reduced-motion preferences disable movement and show all revealed content.
Preserve contrast, label associations and heading order when changing colors or copy.
Test long module names, larger text, narrow screens and keyboard navigation after editing.

## Building and deploying

The generated CSS is included for immediate static hosting.
To change utility classes, install the declared development dependencies and rebuild:

```sh
npm install
npm run build
```

Use `npm run watch` during editing.
The input imports Tailwind with `source("../")`, scanning this template folder.
Markdown and JSON are excluded from class discovery.
Keep complete utility class names in HTML or JavaScript; dynamically constructed fragments may not be discovered.
Do not edit the minified CSS by hand.
Upload all HTML files and the `assets` directory to a static host.
Netlify, Cloudflare Pages, GitHub Pages and ordinary web hosting can serve the files.
Relative links work from a subdirectory without changing a base URL.
Serve HTTPS for reliable clipboard access and connect the inquiry backend before launch.
No API keys, wallet access or device-control credentials belong in these browser files.

`TIME_ZONE` is `America/New_York`.
`londonDateKey` uses that zone for generated request references.
The copyright uses the current year in that zone at page load.
There are no fixed upcoming dates, simulated live inventory signals or event calendars to roll forward.
If you do not need the year update, replace `data-year` elements with your chosen static text and remove that assignment in `main.js`.

## Troubleshooting

| Problem                                    | Fix                                                                                                            |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Changed utility classes do not appear      | Run the CSS build and use complete class strings within the scanned folder.                                    |
| Fonts use a system fallback                | Check internet access and the Google Fonts links in every page head.                                           |
| A kit shows voltage issues                 | Match the selected system to the controller and every powered peripheral; mechanical parts are neutral.        |
| A kit exceeds power or mounting capacity   | Reduce quantities, select a suitable project preset, or revise the catalog's checked physical specification. |
| A repeated sensor reports an address clash | The supplied sensor has a fixed I²C address; remove the duplicate or model a properly supported alternative.   |
| Saved builds disappear after reload        | Storage may be blocked or private; the memory fallback only lasts for the current page.                        |
| Clipboard copy is unavailable              | Use the displayed selectable parts-list field or serve the site over HTTPS.                                    |
| Inquiries show success but never arrive    | Connect the documented backend request and wait for `response.ok` before showing success.                      |

## License

MIT. The code and included artwork are free for personal and commercial use under the distribution license.
The downloadable package includes `LICENSE.txt`.
Teko and Mada are served by Google Fonts and licensed under the SIL Open Font License.
The included SVG illustrations and inline icons are original artwork.
The business, team, modules, specifications, projects and contact information are fictional.
