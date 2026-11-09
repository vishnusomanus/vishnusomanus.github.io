# Changelog

All notable changes to the Matinee template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.3] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.2] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.1] - 2026-10-22

### Fixed

- "Coming soon" is right on every day once the program rolls forward: films that open during the program now have an `opens` date that moves with it, so films already playing are no longer shown as opening later in the week, and the real openers are never pushed out.
- The seat map's "Back of the house · step-free entrance" caption is no longer cut off on phones, and the seat map can be scrolled with the keyboard.
- The "Sold" swatch in the seat key now matches the sold seats on the map, and seats booked on this device show as "Booked by you".
- Long film titles on the marquee letterboard wrap in two balanced halves instead of leaving one word on its own line.
- Projectionist's Choice and Late Show Society times match their events, and the Late Show event no longer mentions costumes on dates far from Halloween.
- Renamed two cast members whose surnames were used in other templates, and US spelling throughout ("inquiry", "canceled").

## [1.0.0] - 2026-10-21

### Added

- Initial release with 9 pages: Home, What's on, Film, Tickets, Membership, Events & private hire, Visit, About, 404.
- Marquee home page with a lit letterboard of tonight's films and a countdown to the next screening.
- Two-week program as a day-by-day list or a week grid, filtered by day, genre and accessibility (`?view=week&access=cc`).
- Captioned, audio-described, sensory-friendly and parent-and-baby screenings marked everywhere.
- A page for every film (`film.html?film=`) with its own SVG poster, credits, showtimes and calendar export.
- Seat-map ticket booking with keyboard navigation, best-available seats, matinee prices, snacks and a booking reference.
- Watchlist and bookings saved on the device, with a header badge and cancel option.
- Membership levels with a monthly/annual switch and a savings slider.
- Film series, an events calendar and a private-hire quote with a live marquee preview.
- Box office hours with an open-now status, accessibility details and a filterable concession menu.
- Showtimes and events roll forward week by week (`KEEP_DEMO_CURRENT`), so the program never looks out of date.
- Full documentation in `DOCS.md`.
