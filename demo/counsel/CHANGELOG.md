# Changelog

All notable changes to the Counsel template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.8] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.7] - 2026-11-05

### Changed

- The sample copy uses American spelling, as the template is set in the US.

## [1.0.6] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.5] - 2026-10-26

### Fixed

- Placeholder email addresses in forms now use the reserved `.example` domain instead of a real-looking `.com` one.

## [1.0.4] - 2026-10-23

### Fixed

- The consultation request confirmation no longer says "This is a demo" and that nothing was sent. It now confirms
  the inquiry, shows a reference (like HS-7K2Q) and says a partner will reply within one business day, as the contact
  page already promises. The newsletter confirmation asks subscribers to look out for a confirmation email instead of
  telling the site owner to connect an email service. `DOCS.md` describes the reference.

## [1.0.3] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.2] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.0.1] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

## [1.0.0] - 2026-10-06

### Added

- Ten pages for Hartwell & Sloane, a fictional law firm: home, practice areas, an in-depth practice
  page, attorney directory, attorney profile, case results, insights, a long-form article, contact
  and 404.
- Practice areas filtered by audience, an attorney directory with name search and practice filter,
  and case results filtered by outcome and practice area, each with live counts and empty states.
- Long-form article with a reading progress bar and a table of contents that follows your scroll.
- Consultation form with a conflict-check notice, a required acknowledgement and inline validation;
  newsletter sign-up form. Demo only: nothing is sent.
- Attorney-advertising and not-legal-advice notice in every footer, plus result and article disclaimers.
- Count-up statistics, scroll reveals, an accessible mobile menu, a skip link and a back-to-top
  button, all respecting reduced motion.
- Original SVG artwork: courthouse illustration, eight attorney portraits, six article covers and an
  office map. SEO and Open Graph tags with a PNG social image on every page.
