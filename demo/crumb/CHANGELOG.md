# Changelog

All notable changes to the Crumb template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.7] - 2026-11-05

### Changed

- Set in Saratoga Springs, New York, with American spelling, US dollars, US phone numbers and local details.
- The calendar file uses America/New_York with US daylight saving rules, dates read in US order and the checkout's phone hint shows a US number.

## [1.0.6] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.5] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.4] - 2026-10-26

### Fixed

- Email addresses use the reserved `.example` domain (`hello@brambleandrye.example`, `cakes@brambleandrye.example`)
  and the phone number is 01632 960 284, from Ofcom's range reserved for drama, so neither can reach a real
  business.

## [1.0.3] - 2026-10-23

### Fixed

- The checkout, wholesale and bake list confirmations no longer say they are a demo and that nothing was sent.
  The order confirmation says "Paid by card" or "Pay at the counter", that a confirmation email is on its way
  and how to change the order (call and quote the order number); the checkout banner, card option and
  "Pay & place order" button drop the "demo" labels, and the card form keeps a short "Test mode" note with the
  test card number. The wholesale confirmation shows a reference (like BR-7K2Q) and says Ruth will reply within
  two working days, and the bake list confirmation asks subscribers to look out for a confirmation email.
  `DOCS.md` and `template.json` describe the new wording.

## [1.0.2] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.1] - 2026-10-16

### Fixed

- The basket now works when the browser blocks localStorage (in a sandboxed iframe, like the
  freeframe.dev demo, or with strict privacy settings): the state is kept in memory for the page view.
  Before, adding a bake left the basket empty and the order confirmation blank.

## [1.0.0] - 2026-10-15

### Added

- Initial release with 8 pages: Home, Preorder, Celebration cakes, Café menu, Checkout, Our story,
  Visit & wholesale, 404.
- Live “fresh out of the oven” board: out at, baking now, on the shelf and sold out, from the bake schedule in the bakery’s time zone
- Preorder catalog with shelf filters, shareable ?category= links and a “baked that day” toggle
- Per-day bake availability, quantity limits and days’ notice for whole cakes
- Basket drawer with collection day, half-hour slots from opening hours, a 2pm next-day cut-off and notes
- Celebration cake builder with a live SVG drawing, price breakdown, message limit and lead-time date
- Demo checkout with inline validation, order number and an .ics calendar file for collection
- Café menu with vegan, vegetarian, gluten-free and dairy-free filters
- Open-now badges, hours with today highlighted and an illustrated map
- Every bake and cake drawn in SVG from the product data, no photos to replace
- Accessible mobile menu, focus-trapped drawer, skip link, reduced-motion support and scroll reveals
- Full documentation in `DOCS.md`.
