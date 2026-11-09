# Changelog

All notable changes to the Estate template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.14] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.1.13] - 2026-11-05

### Changed

- The sample copy uses American spelling, as the template is set in the US.

## [1.1.12] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.11] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.1.10] - 2026-10-26

### Fixed

- The office and agent phone numbers use Maine's 207 area code with numbers reserved for fiction, (207) 555-0151 to
  (207) 555-0157, instead of the invalid area code 555.

## [1.1.9] - 2026-10-23

### Fixed

- The viewing, valuation, contact and footer newsletter confirmations no longer say "This is a demo form, so
  nothing was sent". The viewing, valuation and contact messages now confirm the request, promise a reply
  within one working day (as the pages already say) and show a reference like HH-7K2Q; the newsletter message
  asks subscribers to look out for a confirmation email. `DOCS.md` describes the reference.

## [1.1.8] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).
- The last gallery photo's accessible name now starts with its visible "View all … photos" text (WCAG 2.5.3).

## [1.1.7] - 2026-10-16

### Fixed

- Saved homes now work when the browser blocks localStorage (in a sandboxed iframe, like the
  freeframe.dev demo, or with strict privacy settings): the state is kept in memory for the page view.
  Before, the heart button didn't respond and the saved count stayed at 0.

## [1.1.6] - 2026-10-09

### Fixed

- Forms: pressing Submit no longer checks the field you were in on its way out. That check could add an
  error above the button and move it from under the pointer, so the click was lost (a too-short message
  on the contact form, or an email address in the footer newsletter). The submit itself checks every
  field as before; leaving a field any other way still checks it.
- Footer newsletter: an error now appears below the email field instead of squeezing in beside it.
- "Request another time" on a property page now puts focus in the name field instead of the hidden
  property reference, which lost focus.
- Listings: switching between grid and list only changes the layout classes, so the results keep their
  top margin (`mt-8`) below the toolbar.

## [1.1.5] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.1.4] - 2026-10-08

### Fixed

- Content marked `reveal` no longer stays hidden when JavaScript is off: every page adds the `js`
  class to `<html>` in the `<head>`, and the reveal styles only apply under `.js`.
- The property page's tab title takes the site name from the page's `og:site_name` instead of a
  hard-coded "Harbor & Hill Realty", so renaming the site in the `<head>` renames it too.
- Form comments point at the Forms section of `DOCS.md` instead of the README.

## [1.1.3] - 2026-10-07

### Fixed

- The phone fields' `pattern` is now valid in the browser's `v` (unicode sets) regex mode (`[0-9+\(\)\-\s]{7,}`). Before, Chrome logged a console warning and ignored the pattern, so any text was accepted.
- The earliest date on `data-future` date inputs (the viewing request) uses the visitor's local date. It used the UTC date, so in the evening west of UTC the earliest choice was the day after tomorrow.
- Listing URL parameters that aren't one of the filter options (such as `?type=banana`, an unknown `?location=`, `?beds=abc`, `?sort=` or `?agent=`) are ignored instead of leaving the listings empty, and are dropped from the shared URL.

## [1.1.2] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

## [1.1.1] - 2026-10-06

### Fixed

- Saved homes in localStorage are validated: corrupt data (such as `{}`) no longer breaks the listings, and unknown ids are dropped and the stored list repaired.
- Muted text, eyebrows and the brass buttons now meet WCAG AA contrast (slightly darker `--color-muted`, `--color-brass-600` and button color).
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

## [1.0.0] - 2026-10-04

### Added

- Initial release with 8 pages: Home, Listings, Property, Agents, Sell / valuation, About, Contact, 404.
- Home-page search that pre-fills the listings filters
- Listings filters: buy/rent, area, type, price, beds, baths
- Sort, grid/list toggle and shareable filter URLs
- Saved homes with hearts, stored in the browser
- Property gallery with keyboard-friendly lightbox
- Live mortgage calculator (move-in costs for rentals)
- Generated floor plan and similar-homes suggestions
- Validated viewing, valuation, contact and newsletter forms
- SVG property illustrations at four times of day
- Accessible mobile menu, skip link and scroll reveals
