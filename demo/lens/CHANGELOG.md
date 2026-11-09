# Changelog

All notable changes to the Lens template are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the template uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.11] - 2026-11-06

### Changed

- Moved the destination stories to the US: Catalina Vows (Avalon, California), Rainier Elopement (Mount Rainier, Washington), French Quarter in Rain (New Orleans, Louisiana) and Adobe & Dune (New Mexico and Colorado), with new copy and redrawn photo stand-ins and social image.
- Renamed the matching gallery slugs and photo files: `amalfi-vows` to `catalina-vows`, `highland-elopement` to `rainier-elopement`, `kyoto-in-rain` to `french-quarter-in-rain` and `atlas-and-erg` to `adobe-and-dune`. Links with an old `?g=` value now open the first gallery, and proofing selections saved with an old photo id are dropped.
- The home page's key figures now count states rather than countries.

## [1.0.10] - 2026-11-05

### Changed

- Set in Monterey, California, with American spelling, US dollars and local details.
- Prices are now set for a US photographer, and story dates read like Sep 28, 2026.

## [1.0.9] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.8] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.7] - 2026-10-31

### Fixed

- The phone menu opened with no height, so its links could not be seen or tapped: the header's background blur made the header, not the screen, the frame for the fixed menu. The blur is now switched off while the menu is open.

## [1.0.6] - 2026-10-23

### Fixed

- The inquiry form's confirmation no longer says it is a demo and nothing was sent. It now confirms the
  inquiry, shows a reference (like IM-7K2Q) and says I reply within two working days, as the page already
  promises. The client proofing page no longer calls itself a demo: sending a selection shows "Selection
  received" with a reference and when to expect the first album layout. `DOCS.md` describes the references.

## [1.0.5] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.4] - 2026-10-17

### Fixed

- "Now booking 2027 weddings", "Now booking 2027", "A few 2027 dates are still open" and "2027 availability" now show
  next year, so the demo never advertises a season that has passed.
- The footer copyright year is now this year in the browser; it was fixed at 2026.

## [1.0.3] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.0.2] - 2026-10-07

### Fixed

- `contact.html?package=` only preselects real package ids: inherited object keys such as `?package=constructor` no longer clear the package select or set the occasion to Wedding.

## [1.0.1] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

### Fixed

- Content is no longer hidden when JavaScript is off: the reveal animation only hides elements once a script in each page's `<head>` adds the `js` class.
- The home slideshow caption is only announced to screen readers when the visitor picks a slide, not on every autoplay change.
- The proofing confirmation hides when the selection changes after it was sent, instead of showing an out-of-date count.

## [1.0.0] - 2026-10-06

### Added

- Initial release: a portfolio website for a wedding, portrait and travel photographer.
- Pages: home, portfolio, gallery, stories, story, packages, client proofing, contact and 404.
- Full-bleed home slideshow with captions, dot navigation and a pause button.
- Category filter for galleries with live counts and shareable links.
- Masonry gallery pages rendered from one data object, with an accessible lightbox (keyboard, swipe, Esc,
  focus return).
- Package calculator with extra hours, add-ons, included extras, total and deposit.
- Client proofing page with a 15-photo limit, saved in localStorage and validated on every read.
- Inquiry form with inline validation, conditional date rules and package prefill.
- 49 original SVG photo stand-ins, a back-to-top button, scroll reveals with reduced-motion support, and SEO
  and Open Graph tags on every page.
