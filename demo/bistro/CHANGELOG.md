# Changelog

All notable changes to the Bistro template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.11] - 2026-11-07

### Changed

- Set in Annapolis, Maryland, as Olive & Ember, with dollar prices and local details.
- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.1.10] - 2026-11-06

### Changed

- The guide's time zone examples now use US zones. The template itself is unchanged.

## [1.1.9] - 2026-11-05

### Changed

- The sample copy uses American spelling, as the template is set in the US.

## [1.1.8] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.7] - 2026-10-26

### Fixed

- The phone numbers use a real area code with an exchange reserved for fiction, (902) 555-0120 and (902) 555-0121,
  instead of the invalid area code 555.

## [1.1.6] - 2026-10-22

### Fixed

- The reservation, contact and private dining confirmations no longer tell guests the form is a demo and
  "nothing has been sent". They now confirm the request was received, show a reference (like OE-7K2Q) and say
  what happens next, and the footer newsletter confirmation asks subscribers to look out for a confirmation
  email instead of telling the site owner to connect a mailing list. `DOCS.md` describes the reference.

## [1.1.5] - 2026-10-09

### Fixed

- "Make another booking" now resets the notes character counter to 0 and hides the "nine or more guests"
  note along with the rest of the form.
- Private dining inquiry: the confirmation no longer reads "in Not sure yet" when that space is chosen.
  It now names the space in its own sentence ("Space: Not sure yet.").
- `DOCS.md` no longer says the 404 page shows opening hours (it has links home, to the menu and to
  reservations).

## [1.1.4] - 2026-10-08

### Fixed

- Inner pages: the dark page header and its `h1` are now inside `<main>`, so "Skip to content" no
  longer jumps past the page heading.
- Reservation thank-you: "1 guest" instead of "1 guests".
- Reservations: the date field's maximum is two months ahead (today in the restaurant's time zone,
  like the minimum), as the page promises; a later date shows an error.
- Menu: the Dinner subtitle reads "Tuesday to Saturday from 5pm", matching the opening hours (it
  said "Tuesday to Sunday from 5pm (Sunday lunch only)").

## [1.1.3] - 2026-10-07

### Fixed

- The reservation phone field's `pattern` is now valid in the browser's `v` (unicode sets) regex mode (`[0-9+\(\)\-\s]{7,}`). Before, Chrome logged a console warning and ignored the pattern.
- The "Reserve a table" button in the mobile menu has `aria-current="page"` on `reservations.html`, matching the desktop header.

## [1.1.2] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

### Fixed

- The open/closed badge, today's highlighted hours and today's reservation times use the restaurant's time zone (new `TIMEZONE` setting) instead of each visitor's device clock.

## [1.1.1] - 2026-10-06

### Fixed

- Raised low-contrast text to meet WCAG AA (axe color-contrast checks now pass in light and dark).
- Star ratings use `role="img"` so their label is valid.

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

- Initial release with 7 pages: Home, Menu, Our story, Reservations, Private dining & events, Contact & directions, 404.
- Tabbed lunch, dinner, drinks and dessert menus with keyboard support
- Vegetarian, vegan and gluten-free filter with badges and legend
- Live 'Open now / Closed' badge and today's hours highlighted
- Reservation form with time slots generated from your opening hours
- Seating choice cards, party-size guidance and a character counter
- Private dining packages that preselect the inquiry form
- Client-side validation with inline errors and success states
- Accessible mobile menu, skip link and scroll-reveal animations
- Illustrated SVG dishes, chef portrait and map, no stock photos needed
- SEO and Open Graph tags on every page, plus a 404 page
