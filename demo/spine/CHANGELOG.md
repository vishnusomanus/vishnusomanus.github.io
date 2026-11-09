# Changelog

All notable changes to the Spine template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.5] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.4] - 2026-11-05

### Changed

- The sample copy uses American spelling, as the template is set in the US.

## [1.0.3] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.2] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.1] - 2026-10-22

### Fixed

- Renamed "The Drowned Bell" (now "What the Reservoir Kept") and "The Glasswright's Key" (now "The Towers of
  Vell") so no book shares a title with a real one.
- The Bookworms club (now ages 8 to 12) reads only middle-grade books: "Tidewater Kings" (14+) and "The Year We
  Lit the Lighthouse" (12+) are replaced by a new middle-grade book, "The Summer We Looked for Champ", with its
  own cover.
- Event and story-time wording follows the season of the date shown, so events the demo moves forward week by
  week no longer promise winter readings and snow days in summer.
- RSVPs are keyed by the event's id instead of its date, so a saved RSVP survives the weekly demo shift and is
  kept until the occurrence it was made for has ended.
- Renamed the leftover event id `treadwell-conversation` to `pennywhistle-conversation`.
- The shop-status bar is inside the header landmark (the header is now `sticky -top-10`, so the bar still scrolls
  away).

## [1.0.0] - 2026-10-21

### Added

- Initial release with 9 pages: Home, Shop, Book, Bag & checkout, Events, Book clubs, Find your next read,
  Visit us, 404.
- Twenty-four books, each with its own hand-drawn SVG cover generated from the book data, plus a bookshelf hero drawn from the same catalog
- Shop with genre, format and price filters, staff-pick and new-release toggles, search, six sorts and shareable URLs
- Book pages with hardcover or paperback choice, live availability (on the shelf, order in or preorder), quantity limits and related books
- Staff picks shown as handwritten shelf-talker cards from four illustrated booksellers
- Bag saved in localStorage with free store pickup or US shipping, a free-shipping bar, sales tax, ready dates and an order reference
- Events calendar of author readings, launches, book clubs and Saturday story time that rolls forward, with type filters and saved RSVPs
- Five book clubs that meet by rule, with each month’s pick worked out from a reading list and a join form that remembers your clubs
- Four-question reading finder that ranks the catalog and gives a reason for every suggestion
- Live open or closed status for the shop and café, the next seven days’ hours and US holidays computed by rule on New York time
- Full documentation in `DOCS.md`.
