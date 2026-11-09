# Changelog

All notable changes to the Kinetic HTML template are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions use
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.7] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.6] - 2026-11-05

### Changed

- Set in Colorado Springs, Colorado, with American spelling, US dollars, US phone numbers and local details.
- Dates and times use Mountain Time and a 12-hour clock. The studio closes on US federal holidays and December 24–28,
  worked out by rule for any year. Weights, distances and the pace calculator default to pounds, inches and miles.

## [1.0.5] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.4] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.3] - 2026-10-26

### Fixed

- The email address uses the reserved `.example` domain (`hello@fenlineperformance.example`).

## [1.0.2] - 2026-10-23

### Fixed

- The contact and booking confirmations no longer say the form is a demo and nothing was sent or booked. They now
  confirm the message, booking or call-back request, show a reference (like FP-7K2Q) and say what happens next,
  using the reply times the pages already promise. The `.ics` file carries the reference, and the pricing
  calculator's note no longer calls the prices "illustrative prices for this demo". `DOCS.md` describes the
  reference.

## [1.0.1] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.0] - 2026-10-15

### Added

- Eight pages for Fenline Performance, a fictional two-coach personal training studio in Cambridge: home,
  programs, pricing, client results, training tools, about, contact and online booking, plus a 404 page.
- Home page goal picker with a recommended program, coach, price and first six weeks for each of five goals,
  remembered in `localStorage`, and a live "next free consult" badge.
- Programs and client stories filterable by goal, with `?goal=` links that can be shared.
- Booking flow with six session types, a coach step with each coach's next opening, a week view built from coach
  shifts, small-group classes, session length and notice periods, PAR-Q style health questions with a
  "please talk to us first" outcome, and a confirmation with a `.ics` download (demo only, nothing is booked).
- Pricing page with a Kickstart intro offer, session packs, memberships, a sessions-per-week calculator comparing
  pay per session, packs and membership, a comparison table and an FAQ.
- Training tools: a weekly plan builder (saved in `localStorage`, printable), a one-rep max estimator and a running
  pace calculator.
- Client progress charts drawn as inline SVG, live open-now status in UK time, a validated contact form, SVG athlete
  pictograms, coach portraits, studio illustration, map, favicon and a PNG social image (SVG source included),
  scroll reveals, an accessible mobile menu and a back-to-top button. Full documentation in `DOCS.md`.
