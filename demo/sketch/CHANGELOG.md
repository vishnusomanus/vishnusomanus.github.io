# Changelog

All notable changes to the Sketch template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.6] - 2026-11-05

### Changed

- Set in Asbury Park, New Jersey, with American spelling, US dollars, US phone numbers and local details.
- Workshop and early-bird times use Eastern time (EST/EDT) on a 12-hour clock, and the free worksheets and palettes download at US Letter size instead of A4.

## [1.0.5] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.4] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.3] - 2026-10-26

### Fixed

- The email address uses the reserved `.example` domain (`hello@marniedraws.example`).

## [1.0.2] - 2026-10-23

### Fixed

- The newsletter, contact and sign-up (enroll, book, waitlist) confirmations no longer say they are a demo and
  that nothing was sent. The newsletter asks subscribers to look out for a confirmation email; the contact
  message says Marnie answers emails on Tuesdays and Thursdays and shows a reference like MD-7K2Q; the sign-up
  dialog shows a reference and says what happens next for a free or paid course, a free or paid workshop
  booking and a waitlist request. `DOCS.md` and `template.json` describe the new wording.

## [1.0.1] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).
- The course page's Save for later button's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.0] - 2026-10-17

### Added

- Initial release with 10 pages: Home, Courses, Course sales page, Live workshops, Free resources,
  Student gallery, About, Newsletter, Contact and 404.
- Course catalog filtered by level and topic, with shareable `?level=` and `?topic=` links
- Saved courses kept in localStorage (or in memory when storage is blocked), with a header count and a
  "saved only" filter
- Course sales page generated from one data file: curriculum accordion with lesson counts and total runtime
  computed from the lessons, "what you'll make", reviews and FAQ
- Early-bird pricing with a live countdown in UK time that switches to the full price when the offer ends
- Demo dates that never go stale: a rolling early-bird deadline (`EARLY_BIRD_ENDS = null`) and workshop dates
  that move forward in whole weeks (`KEEP_DEMO_CURRENT`), both easy to switch to real dates
- Live workshops in Europe/London time with BST/GMT labels, the visitor's own time, seats left and a waitlist
- Free worksheets, color palettes and cheat sheets generated as downloadable SVG files, filterable by type
- Student gallery with course filters and a keyboard-friendly lightbox
- Validated newsletter, contact, enroll and booking forms with demo success states
- Hand-drawn SVG artwork throughout: portrait, course covers, student work and doodles
- Accessible mobile menu, skip link, reduced-motion support, scroll reveals and a back-to-top button
- Full documentation in `DOCS.md`.
