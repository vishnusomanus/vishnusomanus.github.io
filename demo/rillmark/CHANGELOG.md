# Changelog

All notable changes to the Rillmark template (HTML + Tailwind CSS) are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the template uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.3] - 2026-11-05

### Changed

- Set in Hartford, Connecticut, with American spelling, US dollars, US phone numbers and local details.
- Working days, the studio clock and dates use Eastern time and US federal holidays, worked out for any year, including observed days. The estimator has US fees, drops VAT and says sales tax is extra. Timecodes run at 24 frames a second instead of 25.

## [1.0.2] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.1] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.0] - 2026-10-24

### Added

- Seven pages and a 404 for Rillmark, the fictional Dundee motion studio of director Marika Drever: home,
  work, case study, services and fees, journal, about and contact.
- Home page showreel drawn live in SVG from six projects, with timecode, progress, a scene list,
  play/pause and previous/next. It autoplays only when motion is allowed, pauses off screen and in hidden
  tabs, and shows stills with reduced motion.
- Fifteen projects in `assets/js/data.js`, each with its own SVG artwork drawn from a motif and palette,
  which plays a few seconds of the film on hover.
- Work index with discipline chips and live counts, a year filter, search and a shortlist-only view
  (`work.html?discipline=`, `?year=`, `?q=`, `?shortlist=1`).
- Shortlist of saved projects in localStorage (kept in memory when storage is blocked), shown in the
  header, the work page panel and the inquiry form.
- Case study for every project from the same data (`project.html?project=`): brief, a styleframe scrubber
  with timecode, four styleframes, process, results, credits, a quote and previous/next links.
- Fee estimator in GBP (`services.html?service=`): service, duration, style, rounds of changes, rush and
  extras, with a breakdown, VAT, deposit, schedule, earliest start and delivery date; the estimate can be
  sent with an inquiry.
- Journal of dated notes with topic filters (`journal.html?topic=`), notes that open in place and dates
  that roll forward with `KEEP_DEMO_CURRENT`.
- About page with an illustrated portrait, working principles, five collaborators, the Dundee studio,
  kit and recognition.
- Project inquiry with validation, budget, finish date and brief, saved references and estimate, ending
  in an "enquiry received" state with a reference, a reply date and next steps.
- Availability, earliest start and reply dates worked out in Europe/London time with Scottish bank
  holidays and the studio's winter closure, plus a `?now=` preview parameter.
- Anybody, Gelasio and Red Hat Mono from Google Fonts, kinetic variable-width headlines, a PNG social
  image, SVG favicon, accessible mobile menu, skip link and scroll reveals, all respecting reduced motion.
