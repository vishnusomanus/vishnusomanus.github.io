# Changelog

All notable changes to the Petal template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.6] - 2026-11-05

### Changed

- Set in Macon, Georgia, with American spelling, US dollars, US phone numbers and local details.
- Delivery areas use ZIP codes around Macon (5 digits, with an optional +4) on Eastern time. Closures use US holidays, with Memorial Day, Labor Day and Thanksgiving worked out for any year, and the about page gives the next Valentine's Day and Mother's Day by rule. In-season flowers follow Middle Georgia, and totals show that prices don't include sales tax.

## [1.0.5] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.4] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.3] - 2026-10-26

### Fixed

- The phone number is now 01632 960 763, from Ofcom's range reserved for drama, so it can't reach a real line.

## [1.0.2] - 2026-10-23

### Fixed

- The checkout, subscription, wedding inquiry, contact and flower post confirmations no longer say they are a
  demo and that nothing was sent or charged. The order confirmation says a confirmation email follows; the
  subscription, wedding and contact confirmations show a reference (like HH-7K2Q) and say what happens next
  using the reply times the pages already promise; flower post sign-ups point to a confirmation email. The
  checkout and subscription notes now just say no payment is taken. `DOCS.md` and `template.json` are updated
  to match.

## [1.0.1] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.0] - 2026-10-18

### Added

- Initial release with 10 pages: Home, Shop, Product, Basket, Checkout, Subscriptions, Weddings & events,
  Flower care, About & contact, 404.
- Live same-day delivery countdown in the shop’s time zone (Europe/London) that rolls to the next delivery day after the 1pm cut-off, on Sundays and on fully booked days
- Seasonal colors: the hero bouquet, delivery band and “in season now” list follow spring, summer, autumn and winter
- Shop filters for occasion, color and price, with sorting and shareable ?occasion=, ?colour=, ?price= and ?sort= links
- Product pages with three sizes and prices, a keyboard-friendly delivery calendar that skips Sundays, holidays and fully booked days, and a gift message with a live counter and card preview
- Basket saved in localStorage: per-bouquet delivery day, quantity and gift message, with gift message drafts kept as you type
- Postcode check against delivery zones, with a charge per delivery day and no same-day delivery further afield
- Demo checkout with inline validation, card formatting and an order number
- Subscription builder: weekly, fortnightly or monthly, with the price per delivery, per month, per year, the yearly saving and the first delivery dates
- Wedding and event estimate with steppers and a validated inquiry form
- Every bouquet drawn in SVG from the product data, no photos to replace
- Full documentation in `DOCS.md`.
