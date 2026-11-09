# Changelog

All notable changes to the Agency template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.9] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.1.8] - 2026-11-05

### Changed

- Set in Birmingham, Alabama, with American spelling, US dollars, US phone numbers and local details.
- Studio clocks show US time zones in 12-hour time, the second studio moved from Lisbon to Oakland, and the about page no longer claims B Corp certification.

## [1.1.7] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.6] - 2026-10-26

### Fixed

- Placeholder email addresses in forms now use the reserved `.example` domain instead of a real-looking `.com` one.

## [1.1.5] - 2026-10-23

### Fixed

- The project brief and job application confirmations no longer say "(demo)" or that nothing was sent. They
  now confirm the inquiry or application, show a reference (like NS-7K2Q) and say what happens next, using the
  reply times the pages already promise (two working days for inquiries, ten for applications). `DOCS.md`
  describes the reference.

## [1.1.4] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.1.3] - 2026-10-08

### Fixed

- Mobile menu: the link numbers (01, 02...) are decorative (`aria-hidden`), so the links are named
  "Work", "Services"... instead of "Work01", "Services02"...

## [1.1.2] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

## [1.1.1] - 2026-10-06

### Fixed

- Raised low-contrast text to meet WCAG AA (axe color-contrast checks now pass in light and dark).

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

## [1.0.0] - 2026-10-04

### Added

- Initial release with 8 pages: Home, Services, Work, Case study, About, Careers, Contact, 404.
- Line-by-line headline reveal, rotating word and an infinite services marquee
- Accessible testimonial carousel with pause, arrow keys and screen-reader announcements
- Work page filter by industry with live counts and shareable links (work.html#fintech)
- Case study with a keyboard-accessible before/after comparison slider
- Careers page with team filter, expandable role details and an application form
- Project-brief form with service tiles, budget slider and inline validation
- Count-up statistics and live local times for each studio
- Full-screen accessible mobile menu, skip link and scroll-reveal animations
- Original SVG case-study artwork and illustrated team portraits
- SEO and Open Graph tags, SVG favicon and social image on every page
