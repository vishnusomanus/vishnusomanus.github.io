# Changelog

All notable changes to the Studio HTML template are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions use
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.7] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.6] - 2026-11-05

### Changed

- Set in Saint Paul, MN, with American spelling, US dollars, US phone numbers and local details.
- The header clock and the rolling dates use the 12-hour clock and US date format, in America/Chicago time.

## [1.0.5] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.4] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.3] - 2026-10-26

### Fixed

- The phone number now follows an obviously fictional pattern, +41 44 000 01 84 (subscriber numbers starting 000 are
  never issued).

## [1.0.2] - 2026-10-23

### Fixed

- The project inquiry and newsletter confirmations no longer say "This is a demo, so nothing was sent". The inquiry
  confirmation now says it reached the studio, gives a reference (like RA-7K2Q) and repeats the two-working-day reply
  promise; the newsletter one asks the visitor to look out for a confirmation email. `DOCS.md` and `template.json`
  describe the new wording.

## [1.0.1] - 2026-10-17

### Fixed

- The availability ("From Feb 2027", "Booking projects from February 2027"), the job start dates and the internship
  deadline are now rolling months from today, so they never go stale.

## [1.0.0] - 2026-10-15

### Added

- Eight pages: home, work index, case study, services, studio, journal, contact and a 404 page.
- Work index with discipline filters, a year sort, a live count, shareable `?discipline=` / `?sort=` URLs and
  grid/list views remembered in `localStorage`, with a pointer-following and keyboard-accessible preview in list view.
- Nine case studies rendered from data at `project.html?id=`, with generated SVG artwork in each project's palette and
  previous/next navigation.
- Brief estimator (scope, scale, timeline) with an indicative CHF budget, duration and breakdown, saved in
  `localStorage` (validated on load) and linked to the inquiry form.
- Five-step project inquiry with inline validation, a review step, prefill from the estimator and a success state.
- Journal with topic filters, `?tag=` URLs and expandable notes; newsletter sign-up form.
- Live Zürich clock, studio open/closed note, copy-email button, 12-column grid overlay, headline and scroll reveals,
  count-up numbers, an accessible mobile menu and a back-to-top button.
- SVG project covers, floor plan, favicon and a PNG social image (SVG source included). Full documentation in `DOCS.md`.
