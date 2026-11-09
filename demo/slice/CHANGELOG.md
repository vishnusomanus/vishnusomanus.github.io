# Changelog

All notable changes to the Slice template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.6] - 2026-11-05

### Changed

- Set in New Haven, Connecticut, with American spelling, US dollars, US phone numbers and local details.
- The delivery checker and catering form take US ZIP codes (5 digits, optional +4) instead of UK postcodes, opening hours and time slots show a 12-hour clock in Eastern time, menu prices and delivery fees are set for the US, and the checkout says prices and totals don't include sales tax.

## [1.0.5] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.4] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.3] - 2026-10-23

### Fixed

- Confirmations no longer tell visitors the site is a demo or that nothing was sent or charged. The order
  confirmation says the receipt is on its way and that tracker times are a guide; order numbers now look like
  CC-7K2Q (made without 0/O or 1/I) instead of CC- and four digits. The catering inquiry confirms the party order
  with the promised one-working-day reply and a reference; the newsletter asks subscribers to look out for a
  confirmation email. The footer line, promo code hints and checkout notes no longer mention a demo (the payment
  step still says no payment is taken). `DOCS.md` describes the reference.

## [1.0.2] - 2026-10-16

### Fixed

- The cart and the delivery or collection choice now work when the browser blocks localStorage (in a sandboxed iframe, like the
  freeframe.dev demo, or with strict privacy settings): the state is kept in memory for the page view.
  Before, adding to the cart left it empty.

## [1.0.1] - 2026-10-15

### Fixed

- The catering form's delivery postcode, which only appears once you choose delivery, is now
  checked as you type and when you leave the field, like the other fields. Before, a mistake in
  it was only flagged when you sent the form.

## [1.0.0] - 2026-10-14

### Added

- Initial release with 8 pages: Home, Menu, Deals & bundles, Checkout, Locations & delivery, Our story,
  Catering & party orders, 404.
- Menu with sticky section nav, scrollspy and vegan, vegetarian, gluten-free and spicy filters (shareable
  `?diet=` links).
- Pizza customizer with sizes, crusts, extra toppings, half and half and a live price, diet tags and allergens.
- Postcode delivery checker with zones, fees, minimum orders and delivery times.
- Cart drawer on every page with editing, kitchen notes, promo codes and free-delivery progress.
- Set meal deals and a build-your-bundle builder with discount tiers.
- Checkout with delivery or pickup, ASAP or time slots generated from opening hours and kitchen lead time.
- Animated order tracker on the confirmation page.
- Live open-now badges and opening hours in the shop's time zone, plus an SVG delivery-zone map.
- Catering pizza calculator and party-order inquiry form with validation.
- Pizzas, sides and drinks drawn in SVG from the menu data.
- Full documentation in `DOCS.md`.
