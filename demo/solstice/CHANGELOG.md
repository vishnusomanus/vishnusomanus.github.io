# Changelog

All notable changes to the Solstice template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.8] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.7] - 2026-11-05

### Changed

- Set in Traverse City, Michigan, with American spelling, US dollars, US phone numbers and local details.
- The checkout takes a US ZIP code (5 digits, optional +4), and set times show on the 12-hour clock in Eastern time.

## [1.0.6] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.5] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.4] - 2026-10-26

### Fixed

- Solstice 2027 now takes place at Abbey Park, Leicester, so no two Freeframe templates share a home city: the
  venue, address, postcode hint, train and shuttle details, artist and trader home towns, calendar exports, meta
  descriptions and social image all say Leicester. The festival hotline is now 0116 496 0250, from Ofcom's range
  of numbers reserved for drama.

## [1.0.3] - 2026-10-23

### Fixed

- The ticket checkout, contact form and line-up alerts no longer tell visitors they are a demo or that nothing was
  sent, charged or issued. The ticket confirmation says the order is confirmed and the e-tickets are on their way;
  the contact form says which team the message reached, their usual reply time and a reference; the alerts ask
  subscribers to look out for a confirmation email. References now look like SO-7K2Q (made without 0/O or 1/I)
  instead of SOL27- plus random characters. The checkout's demo notice, "Place demo order" button and demo
  wording in the terms checkbox are gone. `DOCS.md` describes the reference.

## [1.0.2] - 2026-10-17

### Fixed

- Once the 2027 festival is over, every date moves on to the same week of the next year (by whole weeks, so weekdays
  stay right) while `keepDemoCurrent` is `true`: the countdown (no more "The gates are open" months later), early-bird
  prices, timetable, calendar export, the dates and the edition year in the header, footer, titles and copy.

## [1.0.1] - 2026-10-15

### Fixed

- Get involved form: switching topic after a failed submit no longer leaves the error messages
  (and red error styling) of the now-hidden topic's fields behind. If you switch back to that
  topic and submit again, its errors show again as expected.

## [1.0.0] - 2026-10-14

### Added

- Initial release with 8 pages: Home, Line-up, Timetable, Tickets, Food & drink, Plan your visit, Get involved, 404.
- Poster-style hero with SVG sun, hills and a live countdown to the gates opening
- Line-up filters by day, stage and genre, kept in the URL (`?day=sat&stage=meadow`)
- Accessible artist pop-ups with bio, set time and an "add to my plan" button
- Multi-stage timetable grid with a list view, day tabs and keyboard support
- "My plan" saved on the device, with clash detection and `.ics` calendar export
- Ticket shop with quantity steppers, early-bird prices, 10% group discount, fees and a demo checkout
- Food village with dietary and keyword filters linked to numbered map pins
- Interactive site map with toggleable layers and a searchable FAQ
- Contact form that routes volunteer, trader, press and visitor inquiries
- One data file for artists, stages, traders and ticket prices
- Full documentation in `DOCS.md`.
