# Changelog

All notable changes to the Stay template (HTML + Tailwind CSS) are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the template uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.11] - 2026-11-05

### Changed

- Set in Newport, Rhode Island, with American spelling, US dollars, US phone numbers and local details.
- Room sizes are in square feet and times use a 12-hour clock. Rates now exclude tax: the total adds an estimated 14% Rhode Island sales and hotel tax, replacing VAT and city tax.

## [1.0.10] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.9] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.8] - 2026-10-26

### Fixed

- The phone number now follows an obviously fictional pattern, +39 0185 000 0412 (subscriber numbers starting 000
  are never issued).

## [1.0.7] - 2026-10-23

### Fixed

- The booking, table request, contact and newsletter confirmations no longer tell guests the site is a demo and
  nothing was sent or booked. The booking confirmation now says the booking was received and the confirmation email
  follows within a day; the table request and contact confirmations show a reference (like CM-7K2Q) and the reply
  time; the newsletter confirmation asks subscribers to look out for a confirmation email. Booking references now
  use the same `CM-7K2Q` shape. The booking page intro mentions free cancellation instead of calling itself a demo.
  `DOCS.md` describes the references and covers this version.

## [1.0.6] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).
- The room gallery's main photo button's accessible name now includes its visible "View photos" text (WCAG 2.5.3).

## [1.0.5] - 2026-10-09

### Fixed

- Availability calendar: a booked night inside the selected stay is readable (it failed color contrast).

## [1.0.4] - 2026-10-09

### Fixed

- Booking step 1: changing the guests no longer prices a room that can't sleep them. If the chosen
  room is too small, the first room that sleeps the guests is chosen instead (as for guests from the
  home page's booking bar) and the summary says so; if no room sleeps that many guests, the summary
  shows no price and asks for fewer guests (or to contact the hotel).

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.0.3] - 2026-10-08

### Fixed

- Booking: step 1 of the step indicator has `aria-current="step"` when the page loads (it was only
  set after moving between steps).
- Booking: a restored draft whose room can't sleep its guests is no longer priced with extra-guest
  charges for that room until the room step. Guests from the URL (the home booking bar) get the
  first room that sleeps them; otherwise the guests are reduced to the room's capacity, adults first.

## [1.0.2] - 2026-10-07

### Fixed

- The booking review step pluralizes guests correctly ("1 adult, 1 child" instead of "1 adults, 1 children").

## [1.0.1] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

## [1.0.0] - 2026-10-06

### Added

- Nine pages for Casa Marea, a fictional boutique hotel: home, rooms & suites, room, dining, experiences,
  offers, location & contact, booking and a 404 page.
- Home page booking bar that validates dates and guests and opens the booking flow with them.
- Room filters by view, beds and guests, kept in the URL, with a live count and empty state.
- Room page with a photo lightbox (arrow keys, Esc), live price with weekend rates, extra guests, VAT and
  city tax, and a two-month availability calendar with click-to-select stays.
- Five-step booking flow (dates, room, extras, details, review) with promo codes, a live summary and a
  demo confirmation that makes clear nothing was booked.
- Booking draft saved in the browser and validated on every read, so corrupt or tampered data never
  breaks a page.
- Dining menus in accessible tabs; table, contact and newsletter forms with inline validation.
- Experiences filter, offer codes with a copy button, FAQ accordion and an illustrated map.
- Back-to-top button, scroll reveals that respect reduced motion, and an accessible mobile menu.
- Original SVG illustrations, a PNG social image, and SEO and Open Graph tags on every page.
