# Changelog

All notable changes to the Bloom template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.10] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.9] - 2026-11-05

### Changed

- Set in Sarasota, Florida, with American spelling, US dollars, US phone numbers and local details.
- Times use a 12-hour clock and dates read like Thu, Oct 8. Gift cards no longer expire.

## [1.0.8] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.7] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.6] - 2026-10-23

### Fixed

- The booking, gift card, contact and newsletter confirmations no longer tell visitors the form is a demo and nothing
  was sent, booked or paid. The booking confirmation says a confirmation email is on its way and how to change or
  cancel; the gift card shows "Order confirmed" with an order reference; the contact form confirms the message with a
  reply time; the newsletter asks subscribers to look out for a confirmation email. References now look like BL-7K2Q
  (made without 0/O or 1/I) instead of BLM- plus random characters. The booking page intro no longer says the demo
  doesn't book anything. `DOCS.md` describes the reference.

## [1.0.5] - 2026-10-18

### Fixed

- The footer copyright year is now this year in the browser; it was fixed at 2026.

## [1.0.4] - 2026-10-16

### Fixed

- Saved looks and the remembered booking details now work when the browser blocks localStorage (in a sandboxed iframe, like the
  freeframe.dev demo, or with strict privacy settings): the state is kept in memory for the page view.
  Before, "Book another" didn't fill in the remembered details.

## [1.0.3] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.0.2] - 2026-10-08

### Fixed

- Booking: `?service=` and `?stylist=` only match the data's own ids. `?service=constructor` or
  `__proto__` stopped the script ("Cannot set properties of null") and `?stylist=constructor` showed
  "Object" as the stylist; they are now ignored like any unknown value.
- Contact: a `"` in `?topic=` no longer throws (the topic is matched by comparing option values
  instead of building a selector).
- Gift cards: the "£—" placeholder and the custom amount error ("Enter a whole amount from £25 to
  £500.") use the salon's currency setting instead of a hard-coded pound sign.
- Booking: treatment and team names (and roles) are escaped before they are inserted into the
  summary and the stylist list.

## [1.0.1] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

### Fixed

- "Best available team" bookings now check each person's working days, diary and treatment times; before, many offered times couldn't actually be staffed.
- Prices are formatted with `Intl.NumberFormat` using the salon's `currency` and `locale` instead of a hardcoded "£".

## [1.0.0] - 2026-10-06

### Added

- Initial release: a nine-page site for Bloom Hair & Spa, a fictional salon and day spa: Home, Services & prices, Team, Book online, Gift cards, Gallery, About, Visit & contact and a 404 page.
- Five-step booking wizard (treatments, stylist, date and time, details, review) with time slots worked out from opening hours, each team member's working days and the length of the chosen treatments. Hair and color prices scale with the stylist's level, and the running total and duration update as you go. `?service=` and `?stylist=` preselect choices.
- Gift card builder with preset or custom amounts (£25–£500), three designs, a live preview, a character counter and scheduled delivery. Demo checkout only: no payment is taken.
- Service menu and team page filters with live counts, and a gallery with saved looks and a lightbox (arrow keys, Esc, focus returned to the look you opened).
- Before/after comparison slider built on a native range input.
- "Open now" status and today's row highlighted in opening hours tables.
- Validated booking, contact and newsletter forms. Saved looks and remembered booking details are validated when read from localStorage.
- Accessible mobile menu, skip link, back-to-top button, scroll reveals that respect reduced motion, unique titles, descriptions and social preview image on every page.
- SVG illustrations for the hero, team portraits, gallery looks, before/after, salon and map.
