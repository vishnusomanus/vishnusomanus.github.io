# Changelog

All notable changes to the Atlas HTML template are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions use
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.3] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.2] - 2026-10-23

### Fixed

- The tour request, consultation booking and newsletter confirmations no longer tell visitors "Demo only: nothing was
  sent". The tour request and booking now confirm the request was received, show a reference (like DQ-7K2Q) and say
  when Delia will be in touch; the booking's `.ics` file carries the reference instead of "Demo booking request". The
  newsletter asks subscribers to look out for a confirmation email. `DOCS.md` describes the reference.

## [1.0.1] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).
- The booking calendar's day buttons and the neighborhood map's areas are now named by the text they show (WCAG 2.5.3).

## [1.0.0] - 2026-10-15

### Added

- Nine pages: home, listings, listing detail, sell, buy, neighborhoods, about, book a consult and a 404 page.
- Listings with status tabs, neighborhood, bedroom and price filters with live counts, sorting, an empty state and
  shareable URLs (`?status=`, `?area=`, `?beds=`, `?min=`, `?max=`, `?sort=`).
- Listing detail pages (`listing.html?id=`) with an illustrated room gallery, key facts, sold results, open houses
  with `.ics` downloads, a validated tour request form and similar homes.
- Home value estimate (three steps), seller net proceeds sheet and buyer affordability calculator, all labeled as
  illustrative.
- Interactive SVG neighborhood map linked to six neighborhood guides with per-area statistics.
- Consultation booking with consult types, a day strip, time slots in Central Time, validation, a confirmation and
  an `.ics` download (demo only, nothing is booked).
- Instant estimate teaser, count-up stats, testimonial carousel, newsletter sign-up, scroll reveals, accessible
  mobile menu and a back-to-top button.
- SVG house and room illustrations generated from listing data, an illustrated portrait, SVG favicon and a PNG
  social image (SVG source included). Full documentation in `DOCS.md`.
