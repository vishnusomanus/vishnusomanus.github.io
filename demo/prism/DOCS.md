# Prism documentation

## Overview

Prism is a marketing website for an AI startup, built for **Prism**, a fictional research assistant made by
Prism Labs (San Jose and Salt Lake City). The product answers questions from a team's docs, tickets and the web with
citations, in an app and through an API. The site has a home page with a streaming playground demo, a product
page, API docs, pricing with a cost calculator, a changelog, a company and careers page and a sales form. It is
plain HTML with Tailwind CSS v4 and one vanilla JavaScript file, with no build step needed to use it. The design
is dark-first: near-black surfaces, a hairline grid, film grain and spectrum gradients taken from light passing
through a prism. This guide covers version 1.0.6. See it live at
[freeframe.dev/templates/prism](https://freeframe.dev/templates/prism).

## Quick start

1. Unzip the download and open `index.html` in a browser. Every page works from the file system.
2. Or serve the folder, which is closer to how it runs on a host:

   ```sh
   npx serve .
   ```

3. You only need Node.js 24 or newer if you change CSS classes (see
   [Building and deploying](#building-and-deploying)).

## Pages

| File | Purpose | Notable sections and features |
|------|---------|-------------------------------|
| `index.html` | Home | Hero, streaming playground, logo strip, feature grid, how it works, benchmark chart, testimonials, call to action |
| `product.html` | Product | Search, write, briefs and analyze sections with UI mock-ups, integrations grid (`#integrations`), security badges and data retention table (`#security`), model cards and latency chart (`#models`) |
| `developers.html` | API docs | Example response, three-step quickstart with code tabs (`#quickstart`), endpoint list (`#endpoints`), SDK cards with copy buttons (`#sdks`), rate limits table (`#rate-limits`) |
| `pricing.html` | Pricing | Monthly / annual switch, three plans, API price table, cost calculator (`#calculator`), FAQ accordion (`#faq`) |
| `changelog.html` | Changelog | Dated releases on a timeline, topic filter with counts (`changelog.html?tag=api`) |
| `about.html` | Company and careers | Story, figures, values, team, open roles with a team filter (`about.html?team=research#careers`) |
| `contact.html` | Talk to sales | What happens next, offices, sales form (`contact.html?topic=security` preselects the topic) |
| `404.html` | Not found | Prism illustration and links back to the site |

## Project structure

```text
prism/
  index.html … contact.html, 404.html   the pages (header and footer repeated in each)
  assets/css/style.css                  compiled Tailwind CSS (generated, do not edit)
  assets/js/main.js                     all JavaScript: playground, chart, pricing, tabs, filters, forms
  assets/img/favicon.svg                browser icon
  assets/img/prism-beam.svg             prism and light-beam illustration (CTA panels and 404)
  assets/img/og-image.svg               social image source (1200×630)
  assets/img/og-image.png               social image used by the pages
  src/input.css                         Tailwind source: design tokens and component classes
  package.json                          scripts to rebuild the CSS
  README.md, DOCS.md, CHANGELOG.md
```

## Customizing

### Brand and colors

The design tokens live in the `@theme` block of `src/input.css`. Every utility such as `bg-ink-900`,
`text-muted` or `text-brand-300` comes from them.

| Token | Default | Used for |
|-------|---------|----------|
| `--color-ink-950` | `#05060a` | Page background |
| `--color-ink-900`, `--color-ink-850`, `--color-ink-800` | `#0a0c12`, `#0f1219`, `#151924` | Cards, inputs, raised panels |
| `--color-fg` | `#eef0f6` | Headings, body text, primary buttons |
| `--color-muted` | `#a6acbe` | Secondary text |
| `--color-subtle` | `#8b92a7` | Captions and meta text (still AA on every surface) |
| `--color-brand-200` … `--color-brand-700` | aqua scale | Links, focus rings, highlights, citation chips |
| `--color-ray-rose`, `-amber`, `-lemon`, `-mint`, `-sky`, `-violet` | the spectrum | Logo, gradients, chart bars, icons |

The spectrum gradient used for dividers and tabs is the `--spectrum` custom property in `:root`; the gradient
text class `.text-spectrum` and the `.glass` card border are defined in the same file.

To change the brand color, edit the brand scale and rebuild:

```css
@theme {
  --color-brand-300: #a5b4fc;
  --color-brand-400: #818cf8;
  --color-brand-500: #6366f1;
}
```

Prism is a dark-only design (`color-scheme: dark` in `src/input.css` and a `color-scheme` meta tag on every
page). There is no light theme or toggle. To lighten it, change the `ink` and text tokens together and check
contrast again.

### Typography

Three Google Fonts are loaded by a `<link>` in the `<head>` of every page: **Geist** (text and headings),
**Geist Mono** (labels, code, numbers) and **Instrument Serif** italic (the accent word in headlines, class
`.serif`). The stacks are `--font-sans`, `--font-mono` and `--font-serif` in `@theme`, each with system
fallbacks. To swap a font, change the Google Fonts URL on every page and the matching token, then rebuild.

### Content

All text is in the HTML files. The data behind the interactive parts is at the top of `assets/js/main.js`
(section 1):

| Constant | What it holds |
|----------|---------------|
| `PLAYGROUND` | The example prompts and their streamed answers, sources, seconds and token counts |
| `PLAYGROUND_FALLBACK` | The answer shown for any prompt that isn't an example (`{prompt}` is replaced) |
| `MODELS` | Playground models: milliseconds per token and a time factor for the meta line |
| `BENCHMARKS` | Chart models (name, color) and tests (name, scores in percent) |
| `PRICING` | Seat prices, included tokens, input share, API prices per model, slider steps, enterprise threshold |
| `FREE_EMAIL` | Email domains the sales form rejects as non-work addresses (section 10) |

To add a playground example, add an object to `PLAYGROUND`. In answer text, `**bold**` makes emphasis and
`[n]` cites source `n`:

```js
{
  id: 'churn',
  label: 'Explain last month’s churn',
  prompt: 'Why did churn go up in September?',
  seconds: 1.8, tokens: 120,
  sources: [{ kind: 'Analytics', title: 'Churn dashboard, September' }],
  answer: [
    { p: 'Churn rose to **3.9%**, mostly from monthly plans [1].' },
    { ul: ['First point [1].', 'Second point [1].'] }
  ]
}
```

The example buttons are generated from this array, so nothing else needs to change.

Changelog entries are `<article data-filter-item="changelog" data-tags="api fixes">` elements in
`changelog.html`; copy one, change the date, version and text, and list its topics in `data-tags`. Open roles
are `<li data-filter-item="roles" data-tags="engineering">` items in `about.html`. Plan prices are in the HTML
of `pricing.html` (see [Pricing and calculator](#pricing-and-calculator)).

### Images and artwork

There are no photos. Everything is SVG or CSS:

- **Logo** — the faceted triangle in the header and footer is inline SVG in every page; the same mark is in
  `assets/img/favicon.svg`.
- **Customer logos** — inline SVG wordmarks in the logo strip on `index.html`. Each has `role="img"` and an
  `aria-label`; keep those when you replace them.
- **Avatars** — inline SVG portraits (gradient, head and shoulders) in the testimonials and team grid. To use
  photos, replace each `<svg>` with an `<img>` of the same size class (square, at least 400×400 px for the team,
  80×80 px for testimonials) and a real `alt`.
- **Prism illustration** — `assets/img/prism-beam.svg` (800×400), used in the call-to-action panels and the
  404 page.
- **Product mock-ups** — the playground, citation preview, search results, draft editor, briefs and charts are
  HTML and inline SVG, marked `aria-hidden="true"` where they are decorative.
- **Background** — the grid (`.bg-grid`), glow (`.aurora`) and film grain (`.grain`, an SVG noise filter) are
  CSS classes in `src/input.css`. Remove `grain` from `<body>` to drop the grain.
- **Social image** — `assets/img/og-image.png` (1200×630) is what the pages reference. Edit
  `assets/img/og-image.svg` and export it to PNG at 1200×630; most social sites don't display SVG.

### Navigation, header and footer

The header and footer are repeated in every page. To add a page, copy an existing page, change its `<title>`,
description and Open Graph tags, and add a link to the `<nav aria-label="Main">` list and the
`<nav aria-label="Mobile">` list in every page's header (and the footer columns if you like). The current page
gets `aria-current="page"` on its links, which also styles them. The header becomes frosted after scrolling
(class `is-scrolled`, set in section 3 of `main.js`).

## Features

### Playground

On the home page, `#playground` streams a pre-written answer token by token: sources appear first ("Searching
4 sources…"), then the text with a caret, numbered citation links to the sources, and a meta line with model,
time and tokens. The first example runs once when the playground scrolls into view.

- **Code:** `initPlayground()` in section 4 of `assets/js/main.js`; data in `PLAYGROUND`,
  `PLAYGROUND_FALLBACK` and `MODELS`.
- **Controls:** the example buttons, the prompt (`#pg-prompt`, run with Ctrl/Cmd + Enter), the Run button that
  becomes Stop while streaming, and the model select (`#pg-model`), which changes the streaming speed via
  `msPerToken`.
- **Any other prompt** gets `PLAYGROUND_FALLBACK`, with the visitor's text inserted as plain text (never as
  HTML).
- **Connecting a real model:** replace the body of `run()` with a call to your own backend (never call an AI
  API with a secret key from the browser) and feed each streamed chunk to the writer's `step()` logic, or
  append text to `#pg-output` directly.
- **Accessibility:** the answer area has `aria-live="polite"` and `aria-busy="true"` while streaming, so
  screen readers read the finished answer once. Example buttons use `aria-pressed`. With reduced motion the whole
  answer appears at once and nothing auto-plays.

### Benchmark chart

`initBenchmarks()` (section 5) draws grouped horizontal bars into `#bench-chart` from `BENCHMARKS`, a legend into
`#bench-legend` and a data table into `#bench-table` (inside "View as a table"). The SVG is redrawn on resize so
labels stay readable on phones. The first model uses the spectrum gradient (`color: 'spectrum'`); others take any
CSS color. The SVG has `role="img"` and an `aria-label` that lists every value. Bars grow in when the figure is
revealed (`.bar` rules in `src/input.css`), instantly with reduced motion.

### Pricing and calculator

On `pricing.html`, `initPricing()` (section 6) wires up:

- **Billing switch** `#billing-toggle` (`role="switch"`, `aria-checked`). Any element with
  `data-price-monthly` and `data-price-annual` shows one or the other; `data-billing-note` elements switch
  between their `data-monthly` and `data-annual` text. Annual is the default because the button starts with
  `aria-checked="true"`.
- **Calculator** with `#calc-seats` (1–250), `#calc-tokens` (steps from `PRICING.tokenSteps`, in millions) and
  the `calc-model` radios. The estimate is seats × seat price (from `PRICING.seat`, following the switch) plus
  billable tokens × a blended price (`inputShare` input, the rest output), after `includedTokensM` free tokens.
  From `enterpriseSeats` seats a note suggests Enterprise pricing.

To change prices, edit `PRICING` and the matching text in the plan cards and API table. The sliders announce
readable values (`aria-valuetext`), and the total is announced politely a moment after changes stop.

### Code tabs and copy buttons

On `developers.html`, each `[data-tabs]` group has a `role="tablist"` with tabs carrying `data-lang` (`curl`,
`js` or `python`) and `role="tabpanel"` panels. Choosing a language switches every group on the page and is
remembered (see [Saved data](#saved-data-localstorage)). Arrow keys, Home and End move between tabs.

Copy buttons have `data-copy`. With a value (`data-copy="npm install @prismlabs/sdk"`) they copy that text;
empty, they copy the visible code block in their `[data-tabs]` or `[data-copy-scope]` container. The label
changes to "Copied" and a live region announces it. Code is syntax-colored with spans (`t-k`, `t-s`, `t-n`,
`t-c`, `t-f`, `t-p`) styled in `src/input.css`; when you change a sample you can drop the spans and keep plain
text. Code blocks are focusable so keyboard users can scroll them.

### Filters

`initFilters()` (section 9) powers the changelog topics and the careers team filter. A container
`[data-filter="name"]` holds buttons with `data-filter-value` (`all` plus one per tag); items are
`[data-filter-item="name"]` with space-separated `data-tags`. Counts are filled into `.seg-count`. With
`data-filter-param="tag"` the choice is kept in the URL (`changelog.html?tag=security`), so filtered views can be
shared. Buttons use `aria-pressed`, and "Showing 4 releases" is announced (`data-filter-noun` sets the word).
An optional `[data-filter-empty="name"]` element shows when nothing matches.

### FAQ accordion

`[data-accordion]` on `pricing.html` contains `.acc-item` rows; each button has `aria-expanded` and
`aria-controls` pointing at its panel. One answer is open at a time; remove the loop over `items` in
`initAccordions()` to allow several. Without JavaScript every answer is visible.

### Header, menu, reveals and back to top

The mobile menu (`#menu-toggle`, `#mobile-menu`) uses `aria-expanded`, closes on Escape and when the window
grows to desktop width. Elements with `.reveal` fade up as they enter the viewport (`reveal-d1` to `reveal-d3`
add a delay); everything above a revealed element is revealed too, and nothing is hidden for reduced motion or
without JavaScript. The logo strip scrolls slowly (paused on hover, static for reduced motion). A back-to-top
button appears after one screen of scrolling; delete the last block of `main.js` and the `.back-to-top` styles
to remove it.

## Forms

There are two forms, validated by section 10 of `assets/js/main.js` with inline messages, `aria-invalid`,
`aria-describedby` and focus on the first problem:

| Form | Where | Checks |
|------|-------|--------|
| `data-form="newsletter"` | Footer of every page | Email required and well-formed |
| `data-form="contact"` | `contact.html` | First and last name, work email (`data-validate="work-email"` rejects `FREE_EMAIL` domains), company, team size, at least one "Interested in" box (`data-group`), optional message of at least 20 characters, consent box |

`contact.html?topic=careers` (or `sales`, `trial`, `enterprise`, `security`, `api`, `partnerships`, `other`)
preselects the topic.

On success each form is replaced by a confirmation (`role="status"`, focused). The footer form says "You’re on
the list" and asks the subscriber to look out for a confirmation email. The sales form thanks the visitor by first
name, says a real person will reply within one business day (as the page promises) and shows a short reference made
in the browser by `makeRef('PL')`: `PL-` and four characters with no 0/O or 1/I, like PL-7K2Q. If your form service
or CRM returns its own reference, show that instead, and change the reply time if yours differs.

**The forms don't send anything until you connect them.** To connect a form service such as
[Formspree](https://formspree.io), replace the `successSwap(...)` call in `initForms()` with a request:

```js
setupValidation(form, () => {
  fetch('https://formspree.io/f/your-id', {
    method: 'POST',
    body: new FormData(form),
    headers: { Accept: 'application/json' }
  }).then((r) => {
    if (r.ok) successSwap(form, '<p class="text-xl font-medium">Thanks, we’ll be in touch.</p>');
    else $('[data-form-status]', form).textContent = 'Something went wrong. Please try again.';
  });
});
```

Every input has a `name`, so `FormData` sends all fields. The footer form has no status element; add a
`<p data-form-status>` if you want an error message there too.

## Saved data (localStorage)

| Key | Value | Validation |
|-----|-------|------------|
| `prism-code-lang` | `curl`, `js` or `python` | Ignored unless it matches one of those three |

It only stores the preferred code language on `developers.html`. Reading and writing are wrapped in
`try`/`catch`, so blocked storage only means the choice isn't remembered. To reset it, run
`localStorage.removeItem('prism-code-lang')` in the console; to stop saving, remove the `store(LANG_KEY, lang)`
call in `selectLang()`.

## SEO and sharing

Every page has its own `<title>`, meta description, `og:title`, `og:description`, `og:image`, `theme-color` and
`twitter:card` in its `<head>`. Social sites need an absolute URL for the image, so after deploying change

```html
<meta property="og:image" content="assets/img/og-image.png">
```

to `https://your-domain.com/assets/img/og-image.png` on every page, and add
`<meta property="og:url" content="https://your-domain.com/pricing.html">` per page. Add a `sitemap.xml` listing
the pages and a `robots.txt` pointing to it. The 404 page should be configured as your host's not-found page
and kept out of the sitemap. There is no structured data; `Organization` and `SoftwareApplication` JSON-LD are
good additions.

## Accessibility

Built in:

- Skip link to `#main`, landmarks (`header`, `nav` with labels, `main`, `footer`) and one `<h1>` per page with
  ordered headings.
- Visible focus rings (`:focus-visible` in brand aqua) and color contrast that passes WCAG AA on every
  surface.
- ARIA patterns: menu button with `aria-expanded`, tabs with roving `tabindex`, a switch (`role="switch"`),
  accordion buttons, `aria-pressed` filters, live regions for the playground, calculator, filters and copy
  buttons, and labeled scrollable tables (`role="region"`, `tabindex="0"`).
- `prefers-reduced-motion`: no streaming animation, no marquee, no reveals, instant back-to-top.
- Decorative SVG and mock-ups are `aria-hidden`; meaningful graphics (logos, charts) have labels.

When editing, keep one `<h1>` per page, give every new input a `<label>`, keep `alt=""` on decorative images,
and check contrast if you change the `ink`, `muted` or `subtle` tokens.

## Building and deploying

`assets/css/style.css` is generated from `src/input.css` and the classes used in the HTML and `main.js`. Rebuild
it whenever you use a Tailwind class that isn't already in the site, or change `src/input.css`:

```sh
npm install
npm run build     # one-off, minified
npm run watch     # rebuild while you edit
```

Classes that only appear inside JavaScript strings must be written out in full in `main.js` so Tailwind sees
them. Then upload the whole folder to any static host: Netlify Drop, Cloudflare Pages, GitHub Pages, Vercel or
an S3 bucket. There is no server code. `src/`, `package.json` and the Markdown files aren't needed on the host.

## Troubleshooting

- **A new Tailwind class has no effect.** Run `npm run build`; the shipped CSS only contains classes that were
  used when it was built.
- **The playground answer appears all at once.** Your system has "reduce motion" turned on; streaming is
  intentionally skipped.
- **Copy buttons say "Press Ctrl+C".** The browser blocked clipboard access (some do for `file://` pages).
  Serve the folder with `npx serve .` or deploy it.
- **The filter doesn't update the URL when opened from disk.** Some browsers block `history.replaceState` on
  `file://` pages; filtering still works and the URL updates once the site is served.
- **Calculator totals don't match new prices.** Prices are in two places: `PRICING` in `main.js` and the text in
  `pricing.html`. Update both.
- **Social previews show no image.** `og:image` must be an absolute `https://` URL to the PNG.
- **Fonts look different.** The pages load Geist, Geist Mono and Instrument Serif from Google Fonts; offline or
  blocked, the system fallbacks are used.

## License

MIT, as in the repository's license (included as `LICENSE.txt` in the download). Free for personal and
commercial use. All artwork (logo, wordmarks, avatars, prism illustration and social image) is original SVG and
covered by the same license.
