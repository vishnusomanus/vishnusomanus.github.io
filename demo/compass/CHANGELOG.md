# Changelog

All notable changes to the Compass HTML template are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions use
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.6] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.5] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.4] - 2026-10-26

### Fixed

- US spelling throughout (behavior, realized, color, practice, candor, prioritizing and more), and the work email
  placeholder uses the reserved `.example` domain.

## [1.0.3] - 2026-10-23

### Fixed

- The guide sign-up, contact and booking confirmations no longer say this is a demo or that nothing was sent.
  The contact and booking confirmations now give a reference (like BL-7K2Q) and say what happens next, and the
  calendar hold no longer calls itself a demo. The guide sign-up asks people to look out for a confirmation email.
  `DOCS.md` is updated to match.

## [1.0.2] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.1] - 2026-10-17

### Fixed

- The First 90 Days cohort dates ("Next cohort starts January 13, 2027", "Winter 2027 cohort", "Next cohort after
  this: April 2027") are now rolling demo dates: the next second Wednesday of January, April, July or October at least
  six weeks away (`COHORT_DATES = null`), so the demo never advertises a cohort that has started.

## [1.0.0] - 2026-10-12

### Added

- Ten pages: home, programs, method, results, about, resources, a sample article, book a call, contact and a 404 page.
- Booking flow with call types, an accessible month calendar, time slots generated from weekly availability rules
  and shown in the visitor's time zone, a validated details form and a confirmation summary with a `.ics` download
  (demo only, nothing is booked).
- Leadership self-check quiz with four result types and a recommended program, saved in `localStorage` (validated on
  read) with a retake button, plus a "Recommended for you" badge on the programs page.
- Programs page with 1:1 packages, the First 90 Days cohort, team workshops, a comparison table and an FAQ accordion.
- Interactive Bearing Method compass diagram with accessible tabs, session structure and an engagement timeline.
- Client stories filterable by client type with before-and-after metrics and shareable URLs; resource library with
  topic filters; testimonial carousel; count-up stats; fictional press wordmarks.
- Guide sign-up and contact forms with inline validation and success states.
- Cut-paper SVG portrait, studio, guide cover and podcast artwork, SVG favicon and a PNG social image (SVG source
  included), scroll reveals, accessible mobile menu and a back-to-top button. Full documentation in `DOCS.md`.
