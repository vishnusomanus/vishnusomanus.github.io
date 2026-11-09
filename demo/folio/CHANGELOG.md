# Changelog

All notable changes to the Folio template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.10] - 2026-11-05

### Changed

- Set in Lancaster, Pennsylvania, with American spelling, US dollars, US phone numbers and local details.
- The studio clock shows Eastern time in 12-hour format, and rolling dates use US month and day order.

## [1.1.9] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.8] - 2026-10-26

### Fixed

- Placeholder email addresses in forms now use the reserved `.example` domain instead of a real-looking `.com` one.

## [1.1.7] - 2026-10-22

### Fixed

- The contact form's thank-you message no longer says it is a template demo and nothing has been sent. It
  now confirms the inquiry, promises a reply within two working days (as the page already says) and shows a
  reference like MO-7K2Q. `DOCS.md` describes the reference.

## [1.1.6] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.1.5] - 2026-10-17

### Fixed

- "Booking projects from November 2026" on the contact page now shows next month, so the availability never goes
  stale.

## [1.1.4] - 2026-10-09

### Fixed

- Work filter: switching filters quickly (for example Brand, Web, All within the fade) could leave a
  card hidden while the count said it was shown. A card that matches again now cancels its pending hide.
- Copy email: clicking the button twice within 1.8 seconds left it reading "Copied". It now always goes
  back to its own label.

## [1.1.3] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.1.2] - 2026-10-08

### Fixed

- Work page: the category filter's fade now plays. `main.js` toggles `.is-hiding` on the card's
  wrapper (`.project-card-wrap`), but the CSS only targeted `.project-card`, so filtered cards
  disappeared without the fade.

## [1.1.1] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

## [1.1.0] - 2026-10-05

### Added

- "Back to top" button on every page. It fades in after you scroll about one screen,
  returns to the top (instantly for visitors who prefer reduced motion), moves keyboard
  focus to the main content, lifts itself above toast messages, steps aside while an in-page
  "Back to top" link is on screen and is hidden when printing.
  It is styled to match the template.
- `data-back-to-top-avoid` (lift the button above an element) and `data-back-to-top-hide`
  (hide the button while it would cover a sticky or fixed element) to keep it clear of your own UI.
- This changelog and a `version` field in `template.json`.

### Fixed

- Social sharing image is now a 1200×630 PNG (`assets/img/og-image.png`); most social sites don't display SVG. The SVG stays as the editable source.

## [1.0.0] - 2026-10-03

### Added

- Initial release with 6 pages: Home, Work, Case study, About, Contact, 404.
- Oversized animated headline with line-by-line reveal
- Work page with animated category filter (deep-linkable, e.g. work.html#brand)
- Full case-study layout: facts, challenge, process, screens and results
- Cursor-follow "View" badge on projects (mouse only, off for reduced motion)
- Project inquiry form with budget, timeline and inline validation
- Copy-email button and live local-time clock
- Accessible full-screen mobile menu (Esc to close)
- Infinite client logo marquee that pauses on hover
- Open Graph image, SVG favicon and a styled 404 page
