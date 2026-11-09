# Changelog

All notable changes to the Market template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.11] - 2026-11-06

### Changed

- The home page no longer names a fixed season and year, so it doesn't look out of date.

## [1.1.10] - 2026-11-05

### Changed

- Set in Tacoma, Washington, with American spelling, US dollars, US phone numbers and local details.
- US addresses at checkout now need a ZIP code (5 digits, optional +4); other countries keep the looser postal code check. Tax lines read "Sales tax" and prices say they are before sales tax. Sizes and temperatures are in inches, ounces, quarts and Fahrenheit.

## [1.1.9] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.8] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.1.7] - 2026-10-23

### Fixed

- The checkout, contact and newsletter confirmations no longer say the store is a demo and nothing was sent. The
  checkout confirms the order with an order number like KC-7K2Q (instead of five digits; the contact form's
  order-number placeholder follows), says a confirmation email is on its way and that orders leave the studio
  within 2–3 working days. The contact message promises a reply within one working day and shows a reference; the
  newsletter asks subscribers to look out for a confirmation email. The "demo store" notes in the footer and on
  the cart and checkout pages are replaced with store copy, the button reads "Place order", and the card note says
  payments are in test mode and gives the test number. `DOCS.md` and `template.json` describe the new wording.

## [1.1.6] - 2026-10-16

### Fixed

- Keyboard focus no longer drops to the page after −, + or Remove on a cart line (in the drawer and on the
  cart page). It stays on the same button; when the line goes it moves to the next line's button (or the
  previous one), and to the "Shop" link when the cart is empty. Lines are now updated in place, so the quantity
  is read out by screen readers.

## [1.1.5] - 2026-10-16

### Fixed

- The cart now works when the browser blocks localStorage (in a sandboxed iframe, like the
  freeframe.dev demo, or with strict privacy settings): the state is kept in memory for the page view.
  Before, Quick add showed its toast but the badge stayed at 0 and the cart stayed empty.

## [1.1.4] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.1.3] - 2026-10-08

### Fixed

- Shop: "Reset filters" also puts the sort order back to Featured (the sort menu sits outside the
  filter form, so it was left as it was).
- Checkout: the "Demo store" notice's icon no longer shrinks when the text wraps on narrow screens.

## [1.1.2] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

### Fixed

- Every form field now has a `name`, so `new FormData(form)` sends the contact, newsletter and checkout values when you connect a form service.

## [1.1.1] - 2026-10-06

### Security

- The cart in localStorage is validated before use: only known products, valid glaze/size options and whole quantities from 1 to 99 are kept, duplicates are merged and corrupt data is repaired. Prices always come from the product list, never from storage.

### Fixed

- A corrupt or tampered cart (for example `{}` or `[null]`) no longer crashes the shop, and negative or fractional quantities can no longer produce wrong totals.
- Newsletter text on the moss panel now meets WCAG AA contrast.

## [1.1.0] - 2026-10-05

### Added

- "Back to top" button on every page. It fades in after you scroll about one screen,
  returns to the top (instantly for visitors who prefer reduced motion), moves keyboard
  focus to the main content, lifts itself above toast messages, steps aside while an in-page
  "Back to top" link is on screen and is hidden when printing.
  It is styled to match the template.
- `data-back-to-top-avoid` (lift the button above an element) and `data-back-to-top-hide`
  (hide the button while it would cover a sticky or fixed element) to keep it clear of your own UI.
- This changelog and a `version` field in `template.json`.

### Fixed

- Social sharing image is now a 1200×630 PNG (`assets/img/og-image.png`); most social sites don't display SVG. The SVG stays as the editable source.

## [1.0.0] - 2026-10-03

### Added

- Initial release with 8 pages: Home, Shop, Product, Cart, Checkout, About, FAQ & contact, 404.
- Cart saved in localStorage, synced across tabs
- Slide-out mini cart with focus trap and Esc to close
- Live cart badge and add-to-cart toasts
- Shop filters: category, price range, sort and live result count
- Product pages with glaze and size variants, quantity stepper and image gallery
- Free-shipping progress bar and WELCOME10 promo code demo
- Multi-step checkout with inline validation and card formatting (demo only)
- Searchable FAQ accordion and validated contact form
- Product illustrations drawn in SVG — no image files to replace
- Accessible mobile menu, skip link and scroll-reveal animations
