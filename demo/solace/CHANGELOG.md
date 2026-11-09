# Changelog

All notable changes to the Solace template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.3] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.2] - 2026-11-05

### Changed

- The sample copy uses American spelling, as the template is set in the US.

## [1.0.1] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.0] - 2026-11-01

### Added

- Initial release with 9 pages and a 404: Home, Approach, Services, Our clinicians, Clinician profile, Fees and
  insurance, Find a therapist, Questions and answers and Request a consultation.
- Five-question match quiz that ranks clinicians from data and explains each suggestion; answers are saved on the
  device (`solace-match`) and kept in memory when storage is blocked.
- Clinician directory with filters for concern, client group, insurance, format, new clients and sliding scale,
  synced to the URL, and a saved shortlist (`solace-shortlist`).
- Clinician profiles (`clinician.html?id=`) with session hours, next free consultation, fees, plans and training.
- Sliding-scale calculator based on household size and income, an insurance checker with an out-of-network refund
  estimate and a Good Faith Estimate section.
- Three-step consultation request with validation, prefilled from the quiz, a profile or the URL, with a saved
  draft of the non-identifying choices (`solace-intake`), a reference like BBC-7K2QH and a reply-by date.
- Therapy groups and a couples workshop whose start dates roll forward by rule, with an interest-list form.
- Office hours, open-now status and observed US federal holidays in Pacific time.
- Crisis panel on every page pointing to 988 and 911.
- Approaches in accessible tabs and a searchable FAQ.
- Hand-drawn SVG landscapes, service art, a map and six illustrated clinician portraits.
