# Changelog

All notable changes to the Smile HTML template are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and versions use
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.8] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.7] - 2026-11-06

### Changed

- The sample copy uses American wording throughout: cleanings, office hours, business days, cell phone, "check all that apply", and American spelling in the guide and code comments.

## [1.0.6] - 2026-11-05

### Changed

- The sample copy uses American spelling, as the template is set in the US.

## [1.0.5] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.4] - 2026-10-23

### Fixed

- The demo contact email uses the reserved `.example` domain instead of a real-looking `.com`.

## [1.0.3] - 2026-10-22

### Fixed

- The booking, contact and new patient confirmations no longer show "This is a demo" notes saying nothing
  was sent or booked. They now give a reference (like GL-7K2Q), say what happens next and how to change a
  booking; the reference is also in the calendar file. The privacy summary on the new patients page no
  longer tells the site owner to replace placeholder text. `DOCS.md` and `template.json` are updated to match.

## [1.0.2] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.1] - 2026-10-15

### Added

- Booking: each option in the clinician step now shows that clinician's next opening, and "First available" shows
  the earliest one, as the documentation describes. The time is part of the option's label, so screen readers
  announce it too.

### Fixed

- New patient form: an error on a radio-button question (such as "Best way to reach you") now clears as soon
  as you pick any answer, not only the first one.
- Booking: if you chose a clinician and then switched to a visit type they don't offer, the summary kept showing
  their name. It now shows "First available", matching the selection.

## [1.0.0] - 2026-10-14

### Added

- Nine pages: home, treatments, pricing, team, new patients, book online, emergency, contact and a 404 page.
- Booking flow with seven visit types, a clinician step with "first available", an accessible month calendar, time
  slots generated from opening hours, each clinician's working days, lunch breaks and the visit length, a validated
  details form and a confirmation with a `.ics` download (demo only, nothing is booked).
- Pricing page with a fee table (stacked cards on phones), Grin Club membership plans, a pay-as-you-go versus
  membership cost estimator and an illustrative payment-plan calculator.
- Emergency page with a three-question symptom guide and four carefully worded outcomes, plus first-aid tips.
- New patients page with a first-visit timeline, a tabbed nervous-patient guide and a five-step patient form with
  medical history, consent, a typed signature check and a review screen (nothing is sent or stored).
- Treatments filterable by category with what to expect and from-prices, an FAQ accordion, a team filter by role
  and language, a live open-now badge, a testimonial carousel and a contact form with inline validation.
- SVG tooth mascot, illustrated portraits, map, favicon and a PNG social image (SVG source included), scroll
  reveals, an accessible mobile menu and a back-to-top button. Full documentation in `DOCS.md`.
