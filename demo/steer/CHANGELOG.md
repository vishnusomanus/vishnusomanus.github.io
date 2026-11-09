# Changelog

All notable changes to the Steer template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.6] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.5] - 2026-11-05

### Changed

- Set in Eau Claire, Wisconsin, with American spelling, US dollars, US phone numbers and local details.
- The pick-up checker takes ZIP codes (5 digits, optional +4), the booking form checks US phone numbers, and lessons skip US federal holidays by rule, in Central time.
- The steps, FAQ and quiz follow the Wisconsin DMV process: knowledge and signs tests, instruction permit, road test. The quiz has 26 new questions, with a passing score of 80%. Automatic is now the preselected transmission, and Pass Plus is now a Winter & Highway course.

## [1.0.4] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.3] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.2] - 2026-10-31

### Fixed

- The phone menu opened with no height, so its links could not be seen or tapped: the header's background blur made the header, not the screen, the frame for the fixed menu. The blur is now switched off while the menu is open.

## [1.0.1] - 2026-10-22

### Fixed

- "1 instructor teaches in an automatic car" (was "a automatic").
- The office manager and the by-arrangement area have new names (Shona; NG31 Grantham) that no other template uses.
- Pass Plus copy says it can be taken any time after passing and that insurer discounts have conditions; intensive
  course copy no longer promises a test date at the end of the course, since it depends on test availability.
- The price calculator's average per hour now counts the test car the same way for weekly lessons and intensive
  courses, and says "test car included" when it is.
- The Christmas break now closes every day from 24 December to 1 January (`CHRISTMAS_BREAK`), so 27 and 28 December
  are no longer bookable in years when Christmas falls on a Monday to Wednesday. `EXTRA_CLOSED` also accepts one-off
  dates (`YYYY-MM-DD`).

## [1.0.0] - 2026-10-21

### Added

- Initial release: a nine-page site for Brayline Driving School, a fictional independent driving school in Lincoln: Home, Lessons & prices, Instructors, Book a lesson, Theory practice, Areas & test routes, Pupil passes, FAQ, Contact and a 404 page.
- Lesson booking: pick-up postcode check, manual or automatic, 1, 1½ or 2-hour lessons, a chosen instructor or whoever is free first, and a seven-day week view of free start times from tomorrow up to four weeks ahead, worked out from each instructor's working days and hours. Sundays, bank holidays (England and Wales, calculated for any year) and the Christmas break are skipped. `?i=`, `?t=`, `?d=`, `?slot=` and `?postcode=` prefill it; the request finishes with a reference and what happens next.
- Postcode checker on the home, areas and booking pages for full or partial UK postcodes, with covered (LN1 to LN6), by-arrangement and outside-area answers.
- Price calculator for weekly lessons (block discounts at 10, 20 and 30 hours, first two hours at the new-pupil rate, student discount, test car) and intensive courses, plus Pass Plus, with the saving against pay-as-you-go. Choices are saved in localStorage and can be shared with `?mode=`, `?t=`, `?h=` and `?course=`.
- Six instructors with SVG portraits, drawn cars, areas, languages, working days, first-time pass rates and their next free lesson; gearbox, area and language filters; a chosen instructor is remembered and preselected when booking.
- Theory practice quiz with 26 original multiple-choice questions in six topics, quick and full modes, per-question feedback, a result ring, a review of every answer and best scores saved per mode and topic.
- Areas page with an SVG district map, a district picker listing villages, instructors and their next free lesson, and four illustrated test-route types.
- Pupil passes wall with gearbox, instructor and first-time filters and live stats; pass dates move forward by whole weeks while `KEEP_DEMO_CURRENT` is on.
- Searchable FAQ, contact form with a reference and `?topic=`, office open-now status and today's hours in UK time, next free lesson in the top strip of every page, intensive course start dates worked out from today and a copyright year filled in the browser.
- Accessible mobile menu, skip link, back-to-top button and scroll reveals that respect reduced motion; SVG favicon and social image.
