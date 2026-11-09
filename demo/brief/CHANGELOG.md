# Changelog

All notable changes to the Brief HTML template are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions use
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.8] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.7] - 2026-11-06

### Changed

- Removed a leftover mention of VAT from a stylesheet comment. The template's look is unchanged.

## [1.0.6] - 2026-11-05

### Changed

- Set in Dayton, Ohio, with American spelling, US dollars, US phone numbers and local details.
- The options check, deadline calculator and guides now follow Ohio and federal employment law (at-will jobs, EEOC charges within 300 days, two-year Ohio Civil Rights Commission and wage limits). The estimator no longer has a VAT option, the booking calendar closes on US federal holidays worked out by rule for any year, and times are Eastern.

## [1.0.5] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.4] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.3] - 2026-10-26

### Fixed

- The phone number is now 01632 960 491, from Ofcom's range reserved for drama, so it can't reach a real line.

## [1.0.2] - 2026-10-23

### Fixed

- The booking confirmation and the message form's thank-you no longer say this is a demo and nothing was sent.
  They now give a reference (like PE-7K2Q) and say what happens next, using the one-working-day reply the page
  already promises, and the booking confirmation says how to change the time. The calendar hold no longer
  calls itself a demo. `DOCS.md` describes the reference.

## [1.0.1] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.0] - 2026-10-15

### Added

- Nine pages for Pennington Employment Law, a fictional solo employment solicitor in Southampton: home,
  services, fees, check your options, guides, a sample article, about, book a call and a 404 page.
- Fee estimator with matter and complexity choices, fixed fees or ranges, a VAT toggle, an employer
  contribution, an interest-free payment plan and shareable `?matter=` and `?level=` URLs, plus a full fee
  table and staged tribunal fees.
- Branching "what are my options?" check with plain-English results, a recommended service, a recap of the
  answers and a saved result in `localStorage` (validated on read) with a start-again button.
- Employment tribunal deadline calculator (three months less one day, or six months for statutory
  redundancy pay) with days remaining and urgent and late warnings.
- Four-step booking flow with call types, an accessible month calendar, UK-time slots with the visitor's
  local time, conflict-check fields, inline validation, a confirmation and a `.ics` download (demo only,
  nothing is booked), and a message form.
- Services filtered by area with live counts and `?area=` URLs; guides with topic filters, search and
  `?tag=`/`?q=` URLs; a long-form article with reading progress and a table of contents.
- Not-legal-advice notices, regulation and complaints placeholders and review disclaimers.
- SVG portrait, office and document illustrations, SVG favicon and a PNG social image (SVG source
  included), scroll reveals, FAQ accordion, accessible mobile menu and a back-to-top button. Full
  documentation in `DOCS.md`.
