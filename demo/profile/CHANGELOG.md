# Changelog

All notable changes to the Profile template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.12] - 2026-11-06

### Changed

- The home page no longer shows a fixed update date or talk date, so it doesn't look out of date.

## [1.1.11] - 2026-11-05

### Changed

- Set in Berkeley, California, with American spelling, US dollars and local details.
- Rolling dates use US English and US date order ("December 15, 2026").

## [1.1.10] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.9] - 2026-10-23

### Fixed

- The contact form's thank-you message no longer says it is a demo form and nothing was sent. It now confirms
  the message, promises a reply within two working days (as the page already says) and shows a reference like
  SL-7K2Q. `DOCS.md` describes the reference.

## [1.1.8] - 2026-10-19

### Fixed

- The search button's accessible name now includes its visible keyboard shortcut (WCAG 2.5.3).

## [1.1.7] - 2026-10-17

### Fixed

- "Full-time roles from January 2027" on the contact page now shows the month three months from today, so it never
  goes stale.

## [1.1.6] - 2026-10-09

### Fixed

- Footer: the credit line said "Built with HTML & Tailwind CSS.", which was wrong for the other
  versions of the template; it now reads "Set in Inter & JetBrains Mono.", the same in every version.

## [1.1.5] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.1.4] - 2026-10-08

### Fixed

- `contact.html`: the comment on connecting the form pointed at an `initContactForm` function that
  doesn't exist; it now points at the submit handler in the "Contact form validation" section of
  `assets/js/main.js`.

## [1.1.3] - 2026-10-07

### Fixed

- Code blocks in `post.html`, `project.html` and `uses.html` have `tabindex="0"`, so keyboard users can scroll
  them on small screens.
- The writing search data (`data-search`) for "The quiet power of the `<dialog>` element" is plain text. It
  contained raw `<code>` markup, so searching "the <dialog>" found nothing and searching "code" matched it.
- `404.html` has `<meta name="robots" content="noindex">`, so the error page is not indexed.
- A tampered stored theme (any `theme` value other than `"dark"` or `"light"`) no longer forces light
  mode; it is ignored and the page follows the system setting. Following live system changes now also works with a tampered value.

## [1.1.2] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

### Fixed

- The command palette's "Print résumé" now prints when you're already on the résumé page (it previously only changed the URL hash, which did nothing).

## [1.1.1] - 2026-10-06

### Fixed

- Muted labels now meet WCAG AA contrast in dark mode.

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

## [1.0.0] - 2026-10-03

### Added

- Initial release with 9 pages: Home, Résumé, Projects, Project case study, Writing, Blog post, Uses, Contact, 404.
- Dark mode toggle that remembers your choice, with no flash on load
- Ctrl/⌘ + K command palette to jump to any page
- Printable résumé with a dedicated print stylesheet for a clean PDF
- Project gallery filtered by technology
- GitHub-style stats and contribution graph
- Writing archive grouped by year with instant search
- Contact form with inline validation and copy-email button
- Accessible mobile menu, skip link and visible focus states
- Subtle scroll-reveal animations that respect reduced motion
- Open Graph tags and SVG favicon on every page
