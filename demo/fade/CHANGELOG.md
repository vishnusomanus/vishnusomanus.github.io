# Changelog

All notable changes to the Fade template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.8] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.7] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.6] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.5] - 2026-10-26

### Fixed

- The example site URL in the docs uses the reserved `.example` domain (`fadebros.example`).

## [1.0.4] - 2026-10-23

### Fixed

- The booking, checkout, contact and footer newsletter confirmations no longer say they are a demo or that nothing
  was sent, booked or charged. The booking confirmation says the chair is on hold and the shop will text to confirm,
  and its `.ics` file carries the reference; checkout shows "Order placed" with an order reference; the contact form
  confirms the message, promises a reply within one working day (as the page already says) and shows a reference;
  the newsletter asks subscribers to look out for a confirmation email. References are `FB-` plus four characters
  with no 0/O or 1/I. The booking page's top note now states the cancellation policy instead of calling the booking
  a demo, and the line under "Checkout" says no payment is taken online. `DOCS.md` describes the references.

## [1.0.3] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.2] - 2026-10-17

### Fixed

- The footer copyright year is now this year in the browser; it was fixed at 2026.

## [1.0.1] - 2026-10-16

### Fixed

- The bag now works when the browser blocks localStorage (in a sandboxed iframe, like the
  freeframe.dev demo, or with strict privacy settings): the state is kept in memory for the page view.
  Before, adding a product left the bag empty.

## [1.0.0] - 2026-10-14

### Added

- Initial release: a nine-page site for Fade Bros. Barber Co., a fictional barbershop with two shops in Chicago: Home, Services & prices, Barbers, Book a chair, Shop & gift cards, Locations & hours, About & careers, Contact and a 404 page.
- Five-step booking flow (shop, services, barber or first available, date and time, details) with time slots worked out from each barber's schedule at each shop and the total length of the chosen services, a keyboard-friendly month calendar, a running summary, a confirmation and an `.ics` calendar file. `?location=`, `?service=` and `?barber=` preselect choices. Demo only: nothing is booked.
- Illustrative "current wait" board for both shops, estimated from opening hours, who is working and a typical traffic curve, with a chart of today's typical wait. `?at=` previews any shop-local time.
- Open-now badges in Chicago time and today's row highlighted in the opening hours tables.
- Product shop with category filter and a bag saved in localStorage (validated on read): quantities, pickup at either shop or shipping with a free-shipping meter, and a demo checkout. The header shows the bag count on every page.
- Gift card builder with preset or custom amounts ($20–$300), three designs, a message counter, scheduled delivery and a live preview; gift cards are added to the bag.
- Services category filter, barber filters by shop and speciality with each barber's next free time, FAQ accordion, validated contact and newsletter forms.
- SVG artwork: six barber portraits, product packaging, storefront, map, stamp badge, favicon and social image.
- Accessible mobile menu, skip link, back-to-top button and scroll reveals that respect reduced motion.
