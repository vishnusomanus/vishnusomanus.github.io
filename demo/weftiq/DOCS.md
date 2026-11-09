# Weftiq documentation

## Overview

Weftiq is a fictional workflow automation business in Plano, Texas. This HTML and Tailwind CSS website includes a twelve-recipe library, an editable workflow workbench, transparent pricing and connection guidance. Version 1.0.2 includes nine pages. Visit the [template page](https://freeframe.dev/templates/weftiq) for the live preview.

## Quick start

The compiled CSS and browser JavaScript are included. You can view the pages without a build step.

1. Extract the download.
2. Open `index.html`, or serve the folder over HTTP.
3. Browse to the address printed by the server.

For example, from the template folder:

```sh
python3 -m http.server 8080
```

Open `http://localhost:8080`.
HTTP is recommended because browser storage behavior can vary for local files.
Node.js 24 or newer is required only when rebuilding CSS.
No browser framework, external JavaScript library or API credential is required.
Google Fonts require a network connection; system sans-serif fonts remain available when offline.

## Pages

| File                | Purpose               | Notable features                                                           |
| ------------------- | --------------------- | -------------------------------------------------------------------------- |
| `index.html`        | Business introduction | Vertical workflow illustration, working principles, featured recipes       |
| `recipes.html`      | Recipe library        | Twelve original diagrams, text and team filters, favorites                |
| `recipe.html`       | Recipe detail         | Validated recipe identifier, trigger, condition, actions and care guidance |
| `builder.html`      | Workflow workbench    | Editable nodes, rule checks, local run log, eight named flows              |
| `pricing.html`      | Plans and estimates   | Task, AI credit and editor assumptions; monthly and annual calculations    |
| `integrations.html` | Connection directory  | Twelve records, search, categories and setup disclosures                   |
| `company.html`      | People and approach   | Three illustrated people and rolling workflow hours                        |
| `contact.html`      | Business inquiry      | Validation, request reference and next steps                               |
| `404.html`          | Missing page          | Helpful links back into the website                                        |

The recipe detail page reads `recipe` from its query string.
Its default recipe is `inbox-sort`.
The builder accepts the same recipe identifier to prefill a flow.

## Project structure

```text
weftiq/
  index.html              Home page
  recipes.html            Searchable recipe catalog
  recipe.html             Recipe detail renderer
  builder.html            Editable local workbench
  pricing.html            Plans and cost calculator
  integrations.html       Connection catalog
  company.html            People and rolling dates
  contact.html            Inquiry form
  404.html                Missing-page recovery
  assets/
    css/style.css         Compiled Tailwind stylesheet
    js/main.js            Data, rendering, validation and interactions
    img/                  Original SVG artwork and social image
  src/input.css           Tailwind import, design tokens and shared components
  template.json           Catalog metadata and version
  package.json            CSS build and watch commands
  README.md               Short introduction and quick start
  CHANGELOG.md            Release notes
  DOCS.md                 This guide
  LICENSE.txt             MIT license
```

## Customizing

### Brand and colors

Design tokens live in the `@theme` block of [src/input.css](src/input.css).
The warm palette combines paper, peach, lemon, coral and dark ink.

| Token           | Default   | Used for                          |
| --------------- | --------- | --------------------------------- |
| `--color-paper` | `#f9f5ed` | Page background and controls      |
| `--color-ink`   | `#28251f` | Text, borders and primary buttons |
| `--color-muted` | `#60594f` | Supporting copy                   |
| `--color-peach` | `#f3c9b5` | Highlight panels                  |
| `--color-coral` | `#a93d26` | Accent text, hover and focus      |
| `--color-lemon` | `#e3e9b9` | Rules and saved states            |
| `--color-rule`  | `#c6bdae` | Secondary dividers                |
| `--color-error` | `#a32222` | Validation messages               |

For example:

```css
@theme {
  --color-coral: #943d32;
}
```

Rebuild CSS after editing tokens or utility classes.
Check contrast after changing colors, especially muted text and button labels.
The `.wrap`, `.btn`, `.field`, `.label`, `.save-button` and `.node-line` components hold repeated layout behavior.

### Typography

Delius 400 supplies the naturally drawn headings.
Wix Madefor Text 400, 600 and 700 supplies body text and controls.
Every page includes preconnects and a Google Fonts CSS2 link with `display=swap`.
The template does not include local font files.

To change typography, update the Google Fonts link in all nine HTML heads.
Then change `--font-display` and `--font-sans` in `src/input.css`.
Use only weights available in the chosen family.
The source social image also names these font families; update and regenerate it when changing fonts.

### Content

Static business copy lives in the HTML pages.
All product data and interactive logic live in [assets/js/main.js](assets/js/main.js).

| Constant        | Purpose                                                      |
| --------------- | ------------------------------------------------------------ |
| `RECIPES`       | Twelve workflows, actions, conditions, summaries and artwork |
| `INTEGRATIONS`  | Twelve connection records and setup instructions             |
| `TEAM`          | Names, roles, quotes and portrait geometry                   |
| `TEAMS`         | Recipe team labels                                           |
| `TRIGGERS`      | Supported channels and trigger descriptions                  |
| `CONDITIONS`    | Rule labels, help and input modes                            |
| `ACTIONS`       | Action labels, descriptions and AI credit flags              |
| `QUEUES`        | Valid routing destinations                                   |
| `PLANS`         | Included tasks, editors and base prices in cents             |
| `PRICING`       | Usage block sizes, prices and annual discount                |
| `DEFAULT_PRICE` | Initial calculator assumptions                               |
| `SYMBOLS`       | Original inline SVG connection glyphs                        |

A recipe record contains the following fields:

```js
{
  id: "inbox-sort",
  title: "Sort the support inbox",
  team: "support",
  trigger: "email",
  condition: "urgency",
  value: "4",
  actions: ["classify", "tag", "task", "notify"],
  minutes: 4,
  summary: "Bring the urgent messages into view without losing the quieter questions.",
  story: "A new message reaches a shared inbox. The rule checks urgency before the team receives a clear, categorized handoff.",
  care: "Keep the first category broad. Let the support lead correct it before using it to drive a more sensitive decision.",
  art: "recipe-1.svg"
}
```

Add a unique record to `RECIPES`, using existing keys from the team, trigger, condition and action maps.
Add a genuinely different diagram to `assets/img/` and reference its filename in `art`.
`RECIPE_MAP` is derived automatically.
`minutes` is editorial context rather than a live savings claim.
Update metadata and documentation if you change the advertised record count.

### Images and artwork

`flow-hero.svg` is the tall connected home illustration. Its card labels are HTML in `index.html`, positioned over the drawing and sized in container units (`cqw`) so they scale with it and use the template's fonts.
`hero-recipes.svg`, `hero-builder.svg`, `hero-pricing.svg`, `hero-integrations.svg`, `hero-company.svg` and `hero-contact.svg` are the inner page heroes, 520 by 440 each.
`recipe-1.svg` through `recipe-12.svg` are distinct 420 by 260 process drawings.
Preserve that aspect ratio for replacements so cards retain a consistent rhythm.
Connection symbols and people portraits are inline SVG generated from the JavaScript data.
Their labels describe the record or person without repeating decorative shapes.

`og-image.svg` is the editable 1200 by 630 social artwork.
`og-image.png` is the raster sharing image.
Regenerate the PNG after editing the source SVG or fonts.
`favicon.svg` is the small brand mark.
No external image service is used.

### Navigation, header and footer

Header, mobile menu and footer markup repeat in every HTML page.
Update all nine files when changing destinations or contact details.
The desktop navigation marks the current page with `aria-current`.
The mobile menu uses `menu-toggle` and `mobile-menu` IDs.
Keep those IDs and the button's `aria-controls` aligned.
The business footer uses a dynamic Central time year through `[data-year]`.
There is no dark mode.

## Features

### Recipe discovery and favorites

`initRecipes` renders the catalog and listens to search, team and view controls.
Search matches the title, summary and team label without case sensitivity.
Views include all recipes, saved recipes, AI-assisted recipes and rules-only recipes.
The visible count uses singular and plural wording.
A reset button clears filters and restores focus to the search field.

The URL supports `team` and `q` on `recipes.html`.
Only own keys from `TEAMS` are accepted; unknown teams fall back to all.
Queries are trimmed and limited to 100 characters.
No query is inserted as unescaped HTML.

`initRecipeSaves` handles all `[data-save-recipe]` buttons.
`favourites` validates saved IDs, removes duplicates and limits the list to twelve.
`refreshSaveButtons` updates the pressed state on every matching button.
The `weftiq:saved` event refreshes a visible saved-only list.
After removing a visible saved card, focus returns to its view selector.
The live notice reports the change.

### Recipe detail and prefilled flows

`initRecipeDetail` reads a validated `recipe` parameter.
Unknown or prototype-like values fall back to the first recipe.
The page shows the trigger, condition, action sequence and human review guidance.
The browser title changes to the selected recipe title.
`recipeFlow` converts a recipe into editable node data.
Opening `builder.html?recipe=inbox-sort` starts from that recipe instead of the stored draft.
The builder then removes `recipe` from the address with `history.replaceState`, so a reload keeps the edited draft.
An unknown recipe value is ignored and removed in the same way.
No query parameter is executed as code.

### Workflow editing

`initBuilder` owns the workbench state.
`cleanFlow` normalizes every draft and named flow.
A flow has a name, trigger, condition, rule value and up to six actions.
Names are limited to 60 characters; phrase rules are limited to 80.
Urgency thresholds range from one to five.
Amount thresholds range from zero to one million dollars.
The weekday rule means Monday through Friday in `America/Chicago`; it does not look up holidays.

The action types are `classify`, `summarise`, `tag`, `task`, `notify`, `route`, `wait` and `archive`.
Each action also has a destination from `QUEUES`.
Use the add form, Up, Down and Remove buttons to change the sequence.
Buttons keep meaningful focus after a node is removed or reordered.
A flow requires at least one action before it can be saved or run.
The New flow button starts a form-triggered task flow.
Draft changes are saved as you edit.

### Deterministic run log

`runCondition` checks the channel before evaluating the selected rule.
`categoryFor` uses transparent keyword groups for first-pass classification.
`actionOutput` produces a local summary, label, task, queue or checkpoint description.
`excerpt` shortens summaries to 120 characters and task text to 56, cutting on a word boundary and adding an ellipsis.
A matching run counts one task per action and one AI credit for each AI-marked action.
A skipped run counts zero tasks and zero AI credits.
The default urgency-four recipe does not match the initial urgency-three event.

The run form validates message length from 5 to 1,000 characters and amount from zero to one million dollars.
The event channel must be one of the five supported channels.
The result explains the condition and shows Completed or Skipped against every action.
The page presents the workbench as a sandbox ("Try it here: test runs don't touch your tools").
In this template that is literally true: the workbench does not call AI services, connect accounts, deliver notifications or alter source content.
Classification and summaries use the transparent local rules above, not a model.
A wait node records a checkpoint; it does not start a background timer.
The run output receives focus after submission.
Event message content is not saved.

### Named workflows

The Save named flow button keeps up to eight flows.
Saving the same name, ignoring letter case, replaces the existing named flow.
Saving another name at the limit produces a useful notice.
Load restores the fields and draft; Remove deletes the named entry.
Both operations work during the current page visit when browser storage is blocked.
`readFlows` validates identifiers, removes duplicates and sanitizes nested flows.
A record whose `flow` is not an object with at least one known action (for example `{"id":"wf-abcdefg","flow":"x"}`) is dropped rather than replaced with a default flow.
Saved names are escaped when rendered.
Named flows contain process settings, so do not put personal information in their names.

### Cost calculator

`initPricing` reads and writes sanitized settings.
`priceFor` returns costs in cents to avoid display rounding errors.
The included task allowances are 2,000, 8,000 and 20,000.
Plan prices are $24, $59 and $129 per month.
Editor allowances are one, five and fifteen.

Tasks equal monthly runs multiplied by actions per run.
AI credits equal monthly runs multiplied by AI actions per run.
Extra tasks cost $5 per started block of 1,000.
AI credits cost $3 per started block of 1,000; no AI allowance is included.
Extra editors cost $6 each per month.
Annual billing reduces only the plan fee by 20 percent.
Usage and extra editor prices are unchanged by that discount.
The calculator states the annual plan payment and a full-year estimate using unchanged assumptions.
All prices exclude sales tax, which is added to invoices where it applies; the plan cards, the estimate total and the footnote say so.
If your prices include tax, change all three.
While a number field is empty or half typed, the previous estimate stays on screen and nothing is saved; leaving the field restores the last valid value.
The Choose a plan with us button links to `contact.html` with the current assumptions (`topic=plan&plan=…&billing=…&runs=…&actions=…&ai=…&editors=…`).

Defaults are 1,000 runs, three actions, one AI action and two editors on the starter plan.
The expected monthly total is $38.
At 2,000 runs that becomes $56, or $51.20 with annual billing.
These are editable planning assumptions rather than measured account usage.
Runs are clamped to 0–1,000,000, actions to 1–6 and editors to 1–100.
AI actions cannot exceed total actions.
Reset restores `DEFAULT_PRICE` and focuses the runs input.

### Connection directory

`initIntegrations` filters by search and kind.
Search includes name, summary, events and actions.
The four kinds are messages, documents, operations and commerce.
Each disclosure lists events, actions, scopes, setup steps and a caution.
These are original fictional product records; the page does not claim a connected account.
Add actual OAuth or API integrations behind your backend before offering account connection.
Keep secrets and provider tokens out of the HTML and browser storage.
Native `details` and `summary` elements support keyboard expansion.

### People and rolling workflow hours

`initCompany` renders `TEAM` and four workflow-hour cards.
`TIME_ZONE` is `America/Chicago`.
`todayKey` obtains the local calendar date in that zone.
`KEEP_CLINICS_CURRENT` defaults to `true`.
`clinicDates` finds the next four Tuesdays or Thursdays, beginning at least three days ahead.
Cards show 2:00–2:45 p.m. in Central time.
Calendar dates are formatted from UTC midday so time-zone conversion does not shift their day.

Sessions skip the winter break (`WINTER_BREAK`, December 24 to January 2), US federal holidays and any date in `CLOSED_DATES`.
`bankHolidays(year)` works the federal holidays out by rule (New Year's Day, Martin Luther King Jr. Day, Washington's Birthday, Memorial Day, Juneteenth, Independence Day, Labor Day, Columbus Day, Veterans Day, Thanksgiving and Christmas Day, with Friday or Monday observed dates when a fixed holiday falls on a weekend), so it never needs a yearly list.
Each card's Ask for a spot link carries its date (`contact.html?topic=clinic&date=YYYY-MM-DD`).
Set `KEEP_CLINICS_CURRENT` to `false` to use `FIXED_CLINIC_DATES`.
Replace that array with confirmed `YYYY-MM-DD` dates.
Past fixed dates are hidden; an exhausted list shows a contact invitation.
No card asserts a remaining spot count or real-time availability.
The inquiry link prefills `topic=clinic`.

### Menu and motion

`initMenu` controls the small-screen menu.
Opening it focuses its first link.
Escape closes it and restores the toggle's focus.
Crossing the desktop breakpoint closes the small-screen menu.
`initReveals` observes entrance sections and supports reduced motion.
Without JavaScript, content remains visible.

## Forms

The contact form is the only inquiry form.
Other forms filter records, add nodes, run local rules or calculate costs; they do not submit inquiries.
`initContact` validates a 2–100 character name, complete email up to 180 characters, 15–2,000 character message and consent.
Field errors use `aria-invalid` and linked error text.
The first invalid field receives focus.
The URL accepts only `workflow`, `plan`, `clinic` or `connection` for `topic`.
`date` is accepted only when it is one of the workflow-hour dates currently on offer; it selects the clinic topic, shows the chosen session above the form and is echoed in the success state.
With `topic=plan`, a valid `plan` plus the calculator fields (cleaned by `cleanPricing`) show the estimate above the form and in the success state.
Either value is sent in the hidden `context` field, so a connected form service receives it.

The standalone form validates locally and displays a business success state.
It does not transmit or store the name, email, consent or message.
The reference format is `WQ-YYMMDD-NNNN`, based on the Central time date and a local random suffix.
That reference is a local interface reference until you connect a backend.
Replace it with a server-issued reference in production.
The success panel explains that the team replies within two business days.
It does not claim a confirmation email was sent.
The Another question button clears the form and focuses the name field.

Connect a form service at the marked submission-handler comment in `initContact`.
For example, with Formspree, add your assigned endpoint and method to the existing form in `contact.html`:

```html
<form data-contact-form action="https://formspree.io/f/YOUR_FORM_ID" method="post" class="space-y-6" novalidate></form>
```

Replace `YOUR_FORM_ID` with the identifier from your form service.
Keep all of the existing fields and their `name` attributes inside that form.
Change the contact handler callback from `(event) =>` to `async (event) =>`.
Then place this request after validation and before creating the success state:

```js
const response = await fetch(form.action, {
  method: "POST",
  body: new FormData(form),
  headers: { Accept: "application/json" },
});
if (!response.ok) {
  const summary = document.querySelector("[data-form-errors]");
  summary.textContent = "Please try again. We could not receive your request.";
  summary.hidden = false;
  return;
}
```

For a form service, set `action` to its assigned HTTPS endpoint.
Show production success only after `response.ok`.
Handle network exceptions with the same visible error summary.
Disable the submit button while waiting and re-enable it on failure.
Validate on your server, add abuse controls and define a retention policy.
Use an appropriate privacy notice before collecting real inquiries.

## Saved data (localStorage)

Every saved feature goes through `safeStorage` and `readJSON`/`writeJSON`.
The wrapper retains an in-memory copy when localStorage access throws.
This supports read-after-write interactions during the same page visit.
Memory-only data ends on navigation or reload.
Storage is browser-local and does not synchronize accounts or devices.
No contact details or run messages are stored.

| Key                    | Shape                                 | Read validation                                             |
| ---------------------- | ------------------------------------- | ----------------------------------------------------------- |
| `weftiq:favourites:v1` | Array of recipe ID strings            | Own catalog IDs only; deduplicated; maximum twelve        |
| `weftiq:draft:v1`      | Flow object                           | `cleanFlow` sanitizes fields, rules, queues and six actions |
| `weftiq:flows:v1`      | Array of `{id, flow}`                 | Valid `wf-` ID, unique IDs, sanitized flows, maximum eight  |
| `weftiq:pricing:v1`    | Plan, billing and numeric assumptions | `cleanPricing` validates plans and clamps ranges            |

A flow shape is:

```js
{
  name: "My useful flow",
  trigger: "form",
  condition: "always",
  value: "",
  actions: [{ type: "task", team: "operations" }]
}
```

Malformed JSON and stored JSON null values are removed.
Wrong-shaped records are replaced with defaults or clean empty arrays.
Prototype-like identifiers are rejected with own-property checks.
Use recipe Save buttons, named-flow Remove buttons and calculator Reset to change saved data through the interface.
To remove all saved settings, use browser developer tools under Application → Local Storage.
Remove the four `weftiq:` keys listed above, then reload.
A draft is written again when the builder opens.

## SEO and sharing

Every HTML head contains its own title, description and Open Graph title.
The recipe detail browser title changes with the selected recipe.
For independently indexed recipes, create permanent routes with server-rendered metadata.
Add canonical tags for your deployed page URLs and update social URLs for your production domain.
`og:image` must point to the absolute public URL of `assets/img/og-image.png`.
Keep the 1200 by 630 image size and update its alt text if artwork changes.
Add a sitemap and robots file for your production domain.
Configure your static host to serve `404.html` for unknown routes.
There is no structured-data script or analytics tracker included.

## Accessibility

Each page includes a skip link, main landmark, navigation and footer.
Headings use a single rendered `h1` per page.
Inputs have visible labels and linked helper or error messages.
Save buttons expose their state through `aria-pressed`.
Live notices and result counts announce relevant updates.
Removed controls have a deliberate next focus destination.
Visible focus outlines use coral on light surfaces and peach on dark surfaces.
Motion respects `prefers-reduced-motion`.
Native disclosures remain operable with keyboard input.
Keep visible button words within their accessible names when editing labels.
Maintain alternative text for informative diagrams.
Test long names, zoom, narrow screens, keyboard navigation and color contrast after customizing.

## Building and deploying

Install build dependencies from this folder:

```sh
npm install
npm run build
```

For ongoing CSS changes:

```sh
npm run watch
```

Tailwind scans the template through `@import "tailwindcss" source("../")`.
The build writes `assets/css/style.css`.
Upload the whole folder, including compiled CSS, JavaScript and images, to a static host.
Netlify, Cloudflare Pages and GitHub Pages can all serve these relative links.
The contact backend is a separate deployment requirement.
Do not deploy development dependency folders.
Use HTTPS for production and review headers, form policy and cache lifetimes with your host.

## Troubleshooting

| Problem                                  | Check and fix                                                                       |
| ---------------------------------------- | ----------------------------------------------------------------------------------- |
| New utility classes have no effect       | Run the CSS build after editing HTML or JavaScript strings                          |
| Headings use a fallback font             | Check the Google Fonts links and network access; no local font is bundled           |
| A recipe link shows the first recipe     | Confirm its `recipe` value exactly matches a `RECIPES` ID                           |
| A run skips every action                 | Match the event channel and rule threshold; the first recipe requires urgency four  |
| A named flow disappears after reload     | Check private browsing or blocked storage; memory fallback lasts for one page visit |
| Costs look higher than the plan card     | AI credits, extra task blocks and extra editors are separate editable assumptions   |
| Fixed workflow hours disappear           | Update `FIXED_CLINIC_DATES`, or enable rolling dates with `KEEP_CLINICS_CURRENT`    |
| Contact success appears without delivery | Connect `initContact` to a backend and wait for `response.ok` before success        |

## License

MIT. The code and included artwork are free for personal and commercial use under [LICENSE.txt](LICENSE.txt).
Delius and Wix Madefor Text are served by Google Fonts under the SIL Open Font License.
The SVG illustrations and icons are included.
Weftiq, its people, connection products, contact details and business content are fictional.
