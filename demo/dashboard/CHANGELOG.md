# Changelog

All notable changes to the Dashboard template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.12] - 2026-11-06

### Fixed

- Order dates no longer slip to the previous day around a daylight saving change.

## [1.1.11] - 2026-11-06

### Changed

- Uses American spelling and words throughout, and the sample customers, visitors by state and time zones are all in the US.

## [1.1.10] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.9] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.1.8] - 2026-10-26

### Fixed

- The demo no longer shows a fixed date. The overview greeting, the analytics date range, the revenue, traffic and
  customer charts, the orders heatmap, order dates, the plan's renewal date and the invoices all follow today's
  date in the browser (preview another day with `?now=YYYY-MM-DD`). Without JavaScript the pages show neutral text
  instead of a specific date.
- Email placeholders use the reserved `.example` domain (`name@company.example`) instead of a real-looking `.com`.

## [1.1.7] - 2026-10-23

### Fixed

- Toasts and buttons no longer say "(demo)", "nothing was deleted" or "no email sent". They now read as the
  real app would: exports say the file will arrive by email, an invitation is "sent", a plan change starts on
  the next invoice, deleting the workspace asks you to confirm by email, and a restock request shows a
  reference like TC-7K2Q. The feature list in `template.json` no longer calls the sign-in screen "demo
  only". `DOCS.md` describes the new messages.

## [1.1.6] - 2026-10-19

### Fixed

- The account menu button's accessible name now includes its visible text (WCAG 2.5.3).

## [1.1.5] - 2026-10-18

### Fixed

- The order-activity heatmap on the analytics page steps through calendar days instead of 24-hour blocks, so in
  time zones with daylight saving time a day no longer shifts to the wrong weekday and the order total no longer
  depends on where the page is viewed.
- The footer copyright year is now this year in the browser; it was fixed at 2026.

## [1.1.4] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.1.3] - 2026-10-08

### Fixed

- Sidebar: while the sidebar is collapsed (after a click or when restored from `ns-sidebar`), the
  collapse button is named "Expand sidebar" instead of "Collapse sidebar"; `aria-expanded` follows
  the state as before.

## [1.1.2] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

## [1.1.1] - 2026-10-06

### Fixed

- An unknown stored products view no longer hides both the grid and the table.
- The order status filters use `aria-pressed` instead of `aria-selected`, which isn't valid on plain buttons.
- Raised low-contrast text to meet WCAG AA (axe color-contrast checks now pass in light and dark).

## [1.1.0] - 2026-10-05

### Added

- "Back to top" button on every page. It fades in after you scroll about one screen,
  returns to the top (instantly for visitors who prefer reduced motion), moves keyboard
  focus to the main content, lifts itself above toast messages, steps aside while an in-page
  "Back to top" link is on screen and is hidden when printing.
  It is styled to match the template and its dark mode.
- `data-back-to-top-avoid` (lift the button above an element) and `data-back-to-top-hide`
  (hide the button while it would cover a sticky or fixed element) to keep it clear of your own UI.
- This changelog and a `version` field in `template.json`.

### Fixed

- Social sharing image is now a 1200×630 PNG (`assets/img/og-image.png`); most social sites don't display SVG. The SVG stays as the editable source.

## [1.0.0] - 2026-10-04

### Added

- Initial release with 8 pages: Overview, Analytics, Orders, Customers, Products, Settings, Sign in, 404.
- Collapsible sidebar that remembers its state, plus an off-canvas drawer on phones
- Dark mode toggle, saved and applied with no flash
- Interactive SVG charts: area with range tabs, multi-line, stacked bars, donut, funnel and heatmap
- Chart tooltips on hover and with arrow keys
- Orders table with search, status tabs, sorting, pagination and bulk actions
- Customer detail slide-over panel with recent orders and notes
- Product grid/table view toggle with live inventory levels
- Global search with Ctrl/⌘ K, plus notifications and account menus
- Tabbed settings with invite modal, plan switcher and notification switches
- Validated forms, toasts and a sign-in screen (demo only)
