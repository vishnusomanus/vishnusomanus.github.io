# Changelog

All notable changes to the Roast template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.7] - 2026-11-07

### Changed

- Bag sizes are now in ounces and pounds, with temperatures in Fahrenheit.
- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.6] - 2026-11-05

### Changed

- The sample copy uses American spelling, as the template is set in the US.

## [1.0.5] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.4] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.3] - 2026-10-23

### Fixed

- The checkout, subscription, wholesale, contact and newsletter confirmations no longer say the shop is a demo
  and nothing was sent. The checkout confirms the order with an order number like FC-7K2Q (instead of five
  digits; the contact form's order-number field and placeholder follow), says a confirmation email is on its
  way and that the coffee is roasted on Monday and shipped on Tuesday. The subscription, wholesale and contact
  confirmations show a reference and say what happens next; the newsletter asks subscribers to look out for a
  confirmation email. The "demo" labels on the checkout (eyebrow, banner, "Place order" button) and the footer
  line are replaced with shop copy, the checkout banner says payments are in test mode and keeps the test card
  number, and the subscription terms checkbox no longer mentions a demo shop. `DOCS.md` and `template.json`
  describe the new wording.

## [1.0.2] - 2026-10-19

### Fixed

- The home page's coffee artwork links and the product photo buttons are no longer named by text that leaves out the words on the artwork (WCAG 2.5.3).

## [1.0.1] - 2026-10-16

### Fixed

- The cart now works when the browser blocks localStorage (in a sandboxed iframe, like the
  freeframe.dev demo, or with strict privacy settings): the state is kept in memory for the page view.
  Before, adding a coffee left the badge at 0 and the cart empty.

## [1.0.0] - 2026-10-10

### Added

- Initial release with 10 pages: Home, Shop, Product, Subscribe, Checkout, Brew guides, Wholesale,
  Our sourcing, Contact & FAQ, 404.
- Shop filters for roast, origin and process, with sort, live count and shareable URLs
- Product pages with bag sizes, grinds, tasting profile and a brew recipe per coffee
- Subscription builder with price per cup, monthly estimate and next delivery dates
- Cart drawer with quantities, free-shipping progress and a focus trap
- Cart and plan saved in localStorage, validated and repaired on every read
- Three-step checkout with inline validation and card formatting (demo only)
- Brew guides in accessible tabs with a recipe scaler
- Wholesale volume estimator and inquiry form
- Coffee bags and beans drawn in SVG from the product data
- Accessible mobile menu, skip link, reduced-motion support and scroll reveals
- Full documentation in `DOCS.md`.
