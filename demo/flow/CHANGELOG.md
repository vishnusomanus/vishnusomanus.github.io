# Changelog

All notable changes to the Flow HTML template are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions use
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.6] - 2026-11-05

### Changed

- Set in Santa Cruz, California, with American spelling, US dollars, US phone numbers and local details.
- Times show on a 12-hour clock in Pacific time, dates use the US format, and the retreats move to Davenport and Big Sur.

## [1.0.5] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.4] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.3] - 2026-10-26

### Fixed

- The studio's email address uses the reserved `.example` domain (`hello@saltandsageyoga.example`).

## [1.0.2] - 2026-10-23

### Fixed

- The contact and workshop inquiry confirmations no longer say the form is a demo that doesn't send anything.
  They now confirm the message or inquiry reached the studio, show a reference (like SS-7K2Q) and give the reply
  times the pages already promise. The note under the mat map no longer says "In this demo"; it says reserved
  mats are listed under My bookings. `DOCS.md` describes the reference.

## [1.0.1] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).
- The header's My bookings link's accessible name now includes its visible text and count (WCAG 2.5.3).

## [1.0.0] - 2026-10-17

### Added

- Eight pages for Salt & Sage Yoga, a fictional independent yoga studio in Falmouth, Cornwall: home, timetable,
  class styles, teachers, pricing, workshops and retreats, beginners' guide and FAQ, and contact, plus a 404 page.
- Home page "today at the studio" list and a "next class" card, worked out from the weekly timetable and the
  current UK time; after the last class it shows tomorrow instead.
- Rolling seven-day timetable with style, level and teacher filters (shareable `?style=`, `?level=` and
  `?teacher=` links), "On now" and "Up next" markers and mats left for each class.
- Mat booking: choose your spot on a room plan, saved in `localStorage` (or in memory when storage is blocked),
  listed under My bookings with a count in the header on every page, and cancelable.
- Class styles with a three-level guide, each style's next class and classes a week; teacher profiles with their
  next class.
- Class passes and memberships with an intro-offer calculator that compares every option for how often you
  practice, with a concession toggle.
- Workshops and retreats with rolling dates (or fixed dates you set), a kind filter, past events hidden
  automatically and a validated booking inquiry form (`?event=` preselects an event).
- Beginners' guide and a searchable FAQ accordion that highlights matching words.
- Contact page with an illustrated map, travel notes, today's opening times and a validated message form.
- Hand-drawn SVG line art, arch frames, pebble shapes and wave dividers; EB Garamond and Mulish.
- Full documentation in `DOCS.md`.
