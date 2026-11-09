# Changelog

All notable changes to the Hearth template (HTML + Tailwind CSS) are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the template uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.6] - 2026-11-05

### Changed

- Set in Woodstock, Vermont, with American spelling, US dollars, US phone numbers and local details.
- The Fallow Hart is now a New England country inn with a tavern, in Eastern time, with US dates, Vermont trails in
  miles and feet, and a redrawn trail map. Seasons follow Vermont (high season July to October), and prices show as
  before tax.
- Gift vouchers are now gift certificates that don't expire, sent by mail or email. Dogs stay in the snug and at the
  porch tables rather than the tavern, and service animals are welcome everywhere.

## [1.0.5] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.4] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.3] - 2026-10-23

### Fixed

- The room inquiry, gift voucher, contact and newsletter confirmations no longer tell guests the form is a demo
  and nothing was sent. The inquiry and contact panels confirm the message reached the inn, promise a reply
  within a day (as the pages already say) and show a reference like FH-7K2Q; the voucher panel confirms the
  order with a reference and says how the voucher will arrive; the newsletter panel asks subscribers to look
  out for a confirmation email. `DOCS.md` describes the reference, and its version line now reads 1.0.3.

## [1.0.2] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.1] - 2026-10-17

### Fixed

- Seasonal one-off events (lantern walk, bonfire, wreath workshop, carols, ceilidh, wassail, Burns Night, beer
  festival) come back a year later once they have passed while `KEEP_DEMO_CURRENT` is `true`, on the same date or,
  with `sameWeekday: true`, the same weekday, so the events list never runs out of specials.

## [1.0.0] - 2026-10-17

### Added

- Eight pages for The Fallow Hart, a fictional inn with rooms in Kirkby Malham, Yorkshire Dales: home, rooms
  and prices, food and drink, walks from the door, dogs and good to know, what's on, gift vouchers, contact and
  getting here, plus a 404 page.
- "Fire's lit" status, today's bar, kitchen and breakfast hours, and the next event, all worked out from the
  opening hours in UK time (Europe/London).
- Stay checker with date, guest and dog validation, a Saturday two-night minimum, seasonal nightly rates priced
  night by night, a dog fee, demo availability and a booking inquiry form.
- Booking inquiry draft (dates, guests, dogs, room and contact details) saved in the browser, validated on every
  read and kept in memory when storage is blocked.
- Menus for breakfast, lunch, dinner and Sunday roast in accessible tabs, with a vegetarian, vegan and
  gluten-free filter and a chalkboard of specials for each day of the week.
- Eight walks filtered by length and difficulty (kept in the URL), an SVG route map and saved walks.
- Upcoming events from recurring rules (weekly quiz, folk sessions, supper club) and one-off dates, with a type
  filter kept in the URL.
- Gift voucher builder with a live preview, character counter, postage option and total.
- Contact form with the topic from the URL, opening hours with today highlighted, and a newsletter form.
- Woodcut-style SVG illustrations, a PNG social image, an accessible mobile menu, scroll reveals that respect
  reduced motion, a back-to-top button, and SEO and Open Graph tags on every page.
