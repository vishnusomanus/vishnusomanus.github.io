# Changelog

All notable changes to the Lingua template (HTML + Tailwind CSS) are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the template uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.8] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.7] - 2026-11-05

### Changed

- Set in San Antonio, Texas, with American spelling, US dollars, US phone numbers and local details.
- Class times use a 12-hour clock, dates read like Jan 11 and January 11, 2027, the demo term rolls over on San Antonio's date (America/Chicago), and prices are set for a US school.

## [1.0.6] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.5] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.4] - 2026-10-26

### Fixed

- Lingua is now a school at 14 Wharf Lane, Nottingham NG1 7HB, so no two Freeframe templates share a home city:
  the address, map description, directions, meta descriptions and social image all say Nottingham. The phone
  number is now 0115 496 0321, from Ofcom's range of numbers reserved for drama.

## [1.0.3] - 2026-10-23

### Fixed

- The enrollment, contact and newsletter confirmations no longer say the form is a demo and nothing was sent. The
  enrollment and contact messages now confirm the request, promise an email or reply within one working day and show a
  reference (like LI-7K2Q); the newsletter one asks subscribers to look out for a confirmation email. The notes beside
  the contact and enrollment buttons no longer say nothing is sent. `DOCS.md` describes the reference.

## [1.0.2] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.1] - 2026-10-17

### Fixed

- The winter term and every course start move on to the same term the next year (by whole weeks, so weekdays stay
  right) once the term has started while `KEEP_DEMO_CURRENT` is `true`, so the demo never offers a course that has
  begun; "Winter term 2027", the timetable dates and the "weeks from" lines on the course cards follow.

## [1.0.0] - 2026-10-10

### Added

- Ten pages for Lingua Language School, a fictional language school in Bristol: home, courses, course, placement
  test, teachers, timetable, fees and enrollment, about, contact and a 404 page.
- Course filters by language, level and format, kept in the URL, with a live count and empty state.
- Course pages from `?id=` with keyboard-accessible tabs (overview, syllabus, teacher), fee, places left and related
  courses.
- A ten-question placement test that estimates a CEFR level (A1 to C1) and recommends courses, with the result saved
  on the device and validated on every read.
- Weekly timetable with filters by language, format and time of day; teacher directory with a language filter.
- Prices in accessible tabs for group courses, private lessons and companies.
- Four-step enrollment form with validation, concession rate, course book and installments, a live fee summary and a
  saved draft that is repaired when it has been tampered with.
- Contact form with `?topic=` prefill, newsletter form and FAQ.
- URL parameters read in any case and accepted only when they name the template's own courses, languages and options.
- Back-to-top button, scroll reveals and greeting bubbles that respect reduced motion, and an accessible mobile menu.
- Original SVG illustrations and teacher portraits, a PNG social image, and SEO and Open Graph tags on every page.
- Full documentation in `DOCS.md`.
