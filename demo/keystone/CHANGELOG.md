# Changelog

All notable changes to the Keystone HTML template are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions use
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.6] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.5] - 2026-11-05

### Changed

- The sample copy uses American spelling, as the template is set in the US.

## [1.0.4] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.3] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.2] - 2026-10-23

### Fixed

- The quote request and contact confirmations no longer tell visitors the form is a demo and nothing was sent.
  The quote panel now reads "Request received" with its reference and says a project director will reply within
  one working day; the contact panel confirms which office the message reached, promises a reply within one
  working day (as the page already says) and shows a reference like CB-7K2Q. `DOCS.md` describes the
  references, and its version line now reads 1.0.2.

## [1.0.1] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.0] - 2026-10-12

### Added

- Eight pages: home, projects, a project case study, services, estimator, about, contact and a 404 page.
- Five-step project estimator (type, size, finish, timeline, details) with a live cost range, build time and
  breakdown, remembered in `localStorage` (validated on load), feeding a quote request form with inline
  validation and a success state.
- Project portfolio with type filters, live search, a result count and shareable `?type=` / `?q=` URLs.
- Case study with a facts table, a keyboard-accessible before/after slider, a drawing gallery with an accessible
  lightbox and related projects.
- Services page with sectors, contract models and an FAQ accordion; about page with a history timeline, values,
  leadership, an SVG safety-record chart and open roles; contact page with live open/closed office status, an
  SVG map and a validated contact form.
- Hero line drawing that draws itself in, count-up stats, scroll reveals (all off for reduced motion), an
  accessible mobile menu and a back-to-top button.
- Blueprint-style SVG project drawings, before/after views, team portraits, SVG favicon and a PNG social image
  (SVG source included). Full documentation in `DOCS.md`.
