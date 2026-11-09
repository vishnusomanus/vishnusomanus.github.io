# Changelog

All notable changes to the Mend template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.4] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.1.3] - 2026-11-05

### Changed

- Set in Billings, Montana, with American spelling, US dollars, US phone numbers and local details.
- The clinic is now Ledgerock Physical Therapy, with US credentials and direct access wording, a health plan checker
  with fictional plan names, and emergency advice that points to 911.
- Acupuncture is now dry needling, and the diary closes on US federal holidays, worked out by rule, in Mountain Time.

## [1.1.2] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.1] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.1.0] - 2026-10-22

### Changed

- Redesigned every page as a clinician's notepad, so Mend no longer shares its layout with the other clinic
  templates: biro-blue ink on warm paper, ruled lines, a red margin rail with index numbers and margin notes,
  and a highlighter for whatever is selected. New palette (biro, margin red, highlighter) and new fonts
  (Piazzolla, Reddit Sans and Reddit Mono, loaded from Google Fonts).
- The home page now opens with "Where does it hurt?": a new front and back anatomical line drawing where
  every region is a keyboard-accessible radio button, with a notes panel and a booking link that carries the
  area. The urgent-help strip at the top is replaced by a "When not to wait" section and a footer note.
- New home sections: a first-visit timeline, a seven-day diary strip of free initial assessments (each day
  links to booking on that day), a ruled treatment index and a "Visit us" section with a drawing of the
  clinic.
- Conditions page rebuilt as an index of eight areas with one section per area, locator figures and a
  sticky side index. Treatments, team and prices use the notes layout with filters or an index in the rail;
  booking puts the steps and summary in the rail under a seven-day view of the clinic's hours.
- Booking accepts `?day=` (from the diary strips) and, with `?area=`, marks the treatments suggested for
  that area.
- New art: treatment room, exercise sheet, receipt and clinic front heroes, the body map, the social image
  and the favicon. Exercise figures are redrawn with outlines, start positions and highlighted working
  muscles (the clamshell and glute bridge are much clearer); portraits, the map, the spine study and the 404
  drawing are recoloured.

### Fixed

- The clinic phone number was the same as another template's; it is now 01632 960517 everywhere, including
  the validation hint.
- Renamed the clinic director to Thea Varcoe (portrait `team-varcoe.svg`), so no surname is shared with
  another template or a real brand.
- The self-pay price table no longer overflows at phone widths, and its scrolling wrapper is a focusable,
  labeled region.
- The body map no longer draws joint circles that look clickable but aren't: every visible region and pin
  is a real control.
- The booking diary labeled Sunday "closed for the weekend" although Saturday is open; closed days now say
  "closed on Sundays" or name the bank holiday.
- Pressing "Send message" or "Request this appointment" straight after correcting a field could miss the
  button, because the error line under the field disappeared on blur and moved the button mid-click.

## [1.0.0] - 2026-10-21

### Added

- Initial release with 8 pages and a 404: Home, Treatments, Conditions, Exercises, Our team, Book online,
  Prices and insurance, and Contact.
- 4-step booking: treatment, clinician, day and time, and your details with health screening questions that
  stop the booking and point to NHS 111 or 999 when a red flag is ticked; confirmation with a reference.
- Online diary built from each clinician's shifts, opening hours and bank holidays in England and Wales,
  worked out for every year, so it always rolls forward from today.
- Interactive SVG body map (front and back) with arrow-key navigation, common conditions, suggested
  treatments, matching exercises and red flags for eight areas.
- Home exercise library of 18 exercises with area, level and equipment filters and a drawing for each.
- Saved "my plan" with daily ticks (`mend-plan`), kept in memory when storage is blocked.
- Rep counter and hold timer with rest periods between sets.
- Next available appointment, open-now badge and bank holiday notices in UK time.
- Clinician cards with working days, "in clinic today" and first free slot, filtered by treatment.
- Prices table, packages, a cost estimator and an insurer checker.
- Hand-drawn SVG art for ten treatments, six clinicians, the hero, a map and the 404 page.
- Accessible mobile menu, skip link, scroll reveals and back-to-top button.
