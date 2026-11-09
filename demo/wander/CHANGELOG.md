# Changelog

All notable changes to the Wander template (HTML + Tailwind CSS) are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the template uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.5] - 2026-11-05

### Changed

- Set in Flagstaff, Arizona, with American spelling, US dollars, US phone numbers and local details.
- Trip prices, supplements, the deposit and the budget filter's range are set in US dollars, heights and distances are in feet and miles, and dates and office hours use US formats.

## [1.0.4] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.3] - 2026-10-26

### Fixed

- Saltwind Journeys now runs from Unit 4, Cargo Wharf, Wharf Street, Sheffield S2 5SY, so no two Freeframe
  templates share a home city: the address, postmark, office description and page titles all say Sheffield. The
  office number is now 0114 496 0417, from Ofcom's range of numbers reserved for drama.
- The round postmark's lettering now fits around the circle; the founding year used to be cut off.

## [1.0.2] - 2026-10-23

### Fixed

- The newsletter, contact and tour inquiry success messages no longer say the form is a demo and nothing was
  sent. The newsletter one asks the reader to look out for a confirmation email; the contact and inquiry ones
  confirm the message or inquiry, say a reply comes within one working day (as the pages already promise) and
  show a reference like SJ-7K2Q. `DOCS.md` and `template.json` are updated to match.

## [1.0.1] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.0] - 2026-10-12

### Added

- Eight pages and a 404 for Saltwind Journeys, a fictional small-group travel company in Bristol: home,
  tours, tour, destinations, journal, article, about and contact.
- Home page trip finder that opens the tours page with region, month, style and length already filtered.
- Tours page filters for region, trip style, duration, travel month and budget, with sort, live counts,
  removable filter chips, an empty state and shareable URL parameters.
- Tour pages generated from the `TOURS` data: highlights, day-by-day itinerary accordion with "expand all",
  illustrated route map, what's included and excluded, departure dates with availability and prices, and
  related trips.
- Booking widget with departure, travelers stepper and room choice, showing a live total and deposit,
  feeding a validated inquiry form with a demo success state.
- Destinations page with a month-by-month seasonality table and a best-time chart for each region.
- Journal with a topic filter, and an article page with a reading progress bar and table of contents.
- About page with the company story, guides with illustrated avatars and responsible travel commitments,
  including a "where your money goes" bar.
- Contact form with inline validation and trip prefill (`contact.html?tour=<id>`), office details and FAQ.
- Illustrated SVG landscapes (dunes, mountains, fjord, coast, Fuji, savannah) at four times of day,
  postcard and stamp details, a PNG social image and SEO and Open Graph tags on every page.
- Accessible mobile menu, skip link, scroll reveals and back-to-top button that respect reduced motion.
