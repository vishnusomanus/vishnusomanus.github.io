# Changelog

All notable changes to the Gather template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.7] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.6] - 2026-11-05

### Changed

- The sample copy uses American spelling, as the template is set in the US.

## [1.0.5] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.4] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.3] - 2026-10-23

### Fixed

- The visit, giving, contact, prayer and newsletter confirmations no longer say the form is a demo or that
  nothing was sent or charged. They confirm the request or gift, show a reference (like RC-7K2Q) for visits,
  gifts and messages, and say what happens next; the newsletter one points to a confirmation email. The note
  on the giving form explains card details are entered on the provider's secure page instead of telling the
  site owner to connect one, and the footer reads "A fictional church." `DOCS.md` and `template.json` are
  updated to match.

## [1.0.2] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.1] - 2026-10-16

### Fixed

- Sermon listening progress now works when the browser blocks localStorage (in a sandboxed iframe, like the
  freeframe.dev demo, or with strict privacy settings): the state is kept in memory for the page view.
  Before, progress on the sermon cards was lost as soon as the list was filtered.

## [1.0.0] - 2026-10-12

### Added

- Initial release with 10 pages: Home, Plan your visit, Sermons, Sermon, Events, Groups & ministries, Give,
  About, Contact & prayer, 404.
- Next-service countdown from a weekly schedule in the church's time zone, with a "Live now" state during services
- Accessible sermon audio player: play/pause, scrubbing, ±15 s, speed and keyboard shortcuts, with resume position saved
- Sermon archive with series, speaker and book filters, search and shareable URLs
- Sermon pages with notes, key verse, copyable discussion questions and related messages
- Events month calendar and list view with category filter, detail dialog and .ics calendar downloads
- Plan-your-visit form with upcoming Sundays, party size, kids' ages mapped to check-in rooms and a live summary
- Small-group finder filtering by day, area, season of life and childcare, with live counts
- Giving form with amount chips, custom amount, funds, cover-the-fee option and live total (no payment taken)
- Prayer request form with a keep-private option, plus contact form pre-filled from group links
- SVG illustrations, staff portraits and series covers generated from data; accessible menu, skip link, reduced motion and scroll reveals
- Full documentation in `DOCS.md`.
