# Changelog

All notable changes to the Handy HTML template are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions use
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.7] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.6] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.5] - 2026-10-26

### Fixed

- US spelling throughout: neighbors, labeled, favorite, labor, specializes, color and more.

## [1.0.4] - 2026-10-23

### Fixed

- The booking request and contact confirmations no longer say "This is a demo, so nothing was sent". The
  booking request now says "Request received", that we'll call to confirm and when; the contact form says
  the message arrived and that we reply within one business day, as the pages already promise. Both show a
  reference like BL-7K2Q, made without 0/O or 1/I (the booking reference used to be four digits). `DOCS.md`
  describes the wording and the reference.

## [1.0.3] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).
- The project gallery buttons are now named by their visible title and details (WCAG 2.5.3).

## [1.0.2] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.0.1] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

### Fixed

- The estimate no longer depends on the order options are ticked in: fixed add-ons are added first, then percentage multipliers apply to the whole total, in a fixed order. HTML and Next.js give identical estimates.
- Breakdown lines are built from the price data (the emergency line was always "+50%" and the next-day line showed only the low amount).
- The estimate shown before the script runs now matches the default calculation ($120 – $420).

## [1.0.0] - 2026-10-06

### Added

- Ten pages: home, services and prices, a water heater service page, instant quote, service areas,
  projects, reviews, about, contact and a 404 page.
- Instant quote calculator with a live price range and breakdown, remembered in `localStorage` (validated
  on load), feeding a booking request form with arrival windows and inline validation.
- ZIP code service-area checker on the home and areas pages; the areas page highlights the match on an SVG
  coverage map.
- Before/after comparison slider, project gallery with category filters and an accessible lightbox, and a
  reviews page with rating breakdown, filters and sorting.
- 24/7 emergency bar, sticky mobile call bar, accessible mobile menu, scroll reveals that respect reduced
  motion, and a back-to-top button that lifts above the mobile call bar.
- SEO and Open Graph tags, SVG favicon, and a PNG social image (SVG source included).
