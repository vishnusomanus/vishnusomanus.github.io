# Changelog

All notable changes to the Manual template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.11] - 2026-11-06

### Changed

- Uses American spelling throughout the documentation.

## [1.1.10] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.9] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.1.8] - 2026-10-26

### Fixed

- The GitHub links (repository, discussions, contributing and "Edit this page") point to `github.example`, so the
  fictional Relay project no longer links to an account someone could register.

## [1.1.7] - 2026-10-19

### Fixed

- The header search button's accessible name now includes its visible text and keyboard shortcut (WCAG 2.5.3).

## [1.1.6] - 2026-10-17

### Fixed

- The footer copyright year is now this year in the browser; it was fixed at 2026.

## [1.1.5] - 2026-10-09

### Fixed

- Guides, "Don't swallow errors silently" callout: the example read `catch {{}}` (doubled braces); it
  now reads `catch {}`.

## [1.1.4] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.1.3] - 2026-10-07

### Fixed

- The quick start page no longer skips a heading level: a visually hidden "Steps" `<h2>` now introduces the
  numbered steps (`<h3>`).
- Wide tables (`.table-wrap` on the API reference, core concepts and installation pages) can be scrolled with
  the keyboard: each scroller has `tabindex="0"`, `role="region"` and its own accessible name.
- `404.html` has `<meta name="robots" content="noindex">`, so the error page is not indexed.
- A tampered stored theme (any `relay-docs-theme` value other than `"dark"` or `"light"`) no longer forces light
  mode; it is ignored and the page follows the system setting.

## [1.1.2] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

## [1.1.1] - 2026-10-06

### Fixed

- A stored tab label is no longer put into a CSS selector, so a tampered value can't break the page.
- Code comments in syntax-highlighted blocks now meet WCAG AA contrast.

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

- Initial release with 9 pages: Docs home, Quick start, Installation, Core concepts guide, Examples, API reference, Changelog, FAQ, 404.
- Full-text search modal (⌘K, Ctrl+K or /) with keyboard navigation and highlighted matches
- Collapsible sidebar navigation that slides in on phones
- "On this page" outline that highlights the section you're reading
- Syntax highlighting for JavaScript, TypeScript, shell, HTML and JSON with no library
- Copy buttons on every code block
- npm / pnpm / Yarn / Bun tabs that stay in sync and are remembered across pages
- Note, tip, warning and danger callouts, parameter tables and changelog badges
- Previous / next links, "Edit this page" and a "Was this helpful?" widget
- Dark mode that remembers the reader's choice, with no flash on load
- Version switcher, heading anchor links, SEO and Open Graph tags on every page
