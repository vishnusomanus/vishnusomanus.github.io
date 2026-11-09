# Changelog

All notable changes to the Soiree template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.5] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.4] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.3] - 2026-10-22

### Fixed

- The inquiry confirmation no longer says "This is a demo form, so nothing has been sent". It now confirms
  the inquiry reached the studio, gives a reference (like IA-7K2Q) and repeats the two-business-day reply
  promise. `DOCS.md` describes the reference.

## [1.0.2] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.1] - 2026-10-17

### Fixed

- "Now booking 2027 & 2028" in the top bar now shows next year and the year after, and the footer copyright shows this
  year, so the demo never advertises a season that has passed.
- The date example in the inquiry form's error messages is always in the future.

## [1.0.0] - 2026-10-17

### Added

- Nine pages: Home, Services & packages, Budget estimator, Portfolio, Process, Venue guide, Journal,
  Inquire and a 404 page, for Ivy & Ash Events, a fictional wedding and event planner in Charleston, SC.
- Home: magazine-cover hero, "in this issue" contents, press names, a founder's letter with studio
  numbers, the three packages, a pull quote, recent celebrations, a process summary and journal links.
- Services: full planning, partial planning and day-of coordination with what's included, a comparison
  table, corporate and private events, add-on prices and an FAQ.
- Budget estimator: event type, guest count (slider and number), season, package and add-ons give a
  planning-fee range, a whole-celebration range, a per-guest figure and a spending breakdown, clearly
  marked as an estimate only. Choices are saved on the device and can be sent to the inquiry form.
- Portfolio: eight celebrations filtered by type (`?type=`), with a case-study dialog (`?case=`) that
  has previous/next buttons, arrow keys, Esc and focus return.
- Process: seven steps with timing, and a date checker that marks where you'd start (Charleston time).
- Venue guide: ten venues filtered by area (`?area=`), setting and guest count, sorted by name, price or
  capacity, with a shortlist saved on the device and shown in the inquiry form.
- Journal: a feature on wedding costs, notes on rain plans, Thursday weddings and tipping, and press quotes.
- Inquiry form: prefilled from the estimator or a case study, validates name, email, optional phone,
  event type, a future date within three years (or a flexible date), guest count, budget band and
  message, with inline errors, an error summary and a demo success state that sends nothing.
- Accessible mobile menu, scroll reveals that respect reduced motion, a back-to-top button, saved state
  that falls back to memory when storage is blocked, social sharing image and favicon.
