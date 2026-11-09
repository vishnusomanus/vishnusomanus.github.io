# Changelog

All notable changes to the Clinic template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.12] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.1.11] - 2026-11-05

### Changed

- The sample copy uses American spelling, as the template is set in the US.

## [1.1.10] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.9] - 2026-10-26

### Fixed

- The phone number uses Oregon's 503 area code with an exchange reserved for fiction, (503) 555-0142, instead of the
  invalid area code 555 (which it also shared with other templates).

## [1.1.8] - 2026-10-23

### Fixed

- The booking, contact and newsletter confirmations no longer say this is a demo or that nothing was sent.
  Booking and contact confirmations now give a reference (like BD-7K2Q) and say what happens next; the
  newsletter asks people to look out for a confirmation email. The patient form download links, the privacy
  summary and the note under the prices no longer speak to the site owner. `DOCS.md` is updated to match.

## [1.1.7] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.1.6] - 2026-10-17

### Fixed

- The footer copyright year is now this year in the browser; it was fixed at 2026.

## [1.1.5] - 2026-10-09

### Fixed

- Newsletter sign-up: the error for an empty or invalid email now appears below the email field and the
  "Join" button, instead of squeezed between them.
- Booking: changing the treatment updates the summary's clinician straight away. A clinician who doesn't
  offer the new treatment is cleared (before, the summary kept them until you reached step 2); one who
  does is kept.

## [1.1.4] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.1.3] - 2026-10-08

### Fixed

- Treatment guide: the aftercare lists (`<ul class="prose-c">`) get their bullets and indent again;
  the `.prose-c ul` rule only matched lists inside a `.prose-c` element.
- Star ratings: the five-star ratings have `role="img"`, so their `aria-label` ("5 out of 5 stars")
  is announced, and the single decorative star after "4.9" in the hero is hidden from screen readers
  instead of being labeled "1 out of 5 stars".

## [1.1.2] - 2026-10-07

### Fixed

- The "date of birth can't be in the future" check compares with the visitor's local date. It compared against UTC midnight, so east of UTC today's date was rejected early in the morning.
- The "Book appointment" button in the mobile menu has `aria-current="page"` on `appointments.html`, matching the desktop header.

## [1.1.1] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

### Fixed

- Hours lists now number days like `HOURS` (`data-day`: 0 = Sunday), removing the Monday-first numbering that made edits error-prone.
- The open-now badge, today's row, the next free slot and bookable times use the practice's time zone (new `TIMEZONE` setting) instead of each visitor's device clock.

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

- Initial release with 8 pages: Home, Services & costs, Treatment guide, Our team, Book appointment, Patient info, Contact, 404.
- 5-step booking wizard: treatment, clinician, date, time, details and review
- Time slots built from opening hours and each clinician's working days
- Live open-now badge and today's hours highlighted
- Services with expandable details and typical costs
- Team filter by specialty, with credentials and languages
- Searchable insurance plan list
- Accessible-first: larger text, high contrast, clear focus styles
- Validated contact and newsletter forms with inline errors
- Friendly SVG illustrations and portraits, no photos needed
- Accessible mobile menu, skip link and scroll reveals
