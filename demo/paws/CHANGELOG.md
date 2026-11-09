# Changelog

All notable changes to the Paws template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.3] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.2] - 2026-10-23

### Fixed

- The appointment request, records transfer, contact and newsletter confirmations no longer say they are a
  demo and that nothing was sent. The request, records and contact confirmations now show a reference (like
  SW-7K2Q) and say what happens next using the reply times the pages already promise; newsletter sign-ups
  point to a confirmation email. `DOCS.md` describes the reference.

## [1.0.1] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.0] - 2026-10-18

### Added

- Initial release with 9 pages and a 404: Home, Services, Request a visit, Vaccine planner, Pricing guide,
  Our team, New clients, Pet care articles and Contact.
- 4-step appointment request: pet, visit type, vet and time, your details, with a live summary.
- Saved "my pets" on the device (`paws-pets`), kept in memory when storage is blocked.
- Time slots built from opening hours, each vet's shifts and US holidays worked out for every year.
- Vaccine and wellness planner for dogs, cats, rabbits and ferrets, with "coming up" dates that roll forward.
- Live open-now badge, next check-up opening, emergency advice and holiday notice in Eastern time.
- Services and articles filtered by pet (and topic and search for articles), with shareable URLs.
- Pricing estimator with ranges by pet size, clearly marked as an estimate only.
- New-client packing checklist, records transfer form and FAQ accordion.
- Hand-drawn SVG dogs, cats, rabbits, a ferret, a guinea pig and team portraits; no photos needed.
- Accessible mobile menu, skip link, scroll reveals and back-to-top button.
