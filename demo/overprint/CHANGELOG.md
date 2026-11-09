# Changelog

All notable changes to the Overprint template (HTML + Tailwind CSS) are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the template uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.3] - 2026-11-05

### Changed

- The sample copy uses American spelling, as the template is set in the US.

## [1.0.2] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.1] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.0] - 2026-10-27

### Added

- Eight pages and a 404 for Pomelo Press, the fictional Louisville studio of illustrator Pipa Valdespino:
  home, work, case study, shop, checkout, commissions, about and contact.
- Risograph artwork drawn in SVG by `assets/js/main.js`: every picture is three spot-ink plates (fluorescent
  pink, federal blue and yellow) that overprint with multiply on cream paper and screen on dark paper,
  slightly off register, with halftone screens and ink speckle.
- Twelve projects in `assets/js/data.js`, each with its own motif, filterable by type on the work page
  (`work.html?type=`).
- Case study for every project (`project.html?project=`): brief, deliverables, Sketch, Plates and Final
  print tabs, ink toggles, process notes, result, client quote and previous/next links.
- Shop of twelve prints, zines, stickers and postcards with sizes, numbered editions and stock
  (`shop.html?filter=`), and a cart saved in localStorage (in memory when storage is blocked) with a drawer
  and quantity steppers.
- Checkout with delivery options, free shipping over $75, Kentucky sales tax, address and test-card
  validation, ending in an order confirmation with the next mail day.
- Four-step commission inquiry (`commissions.html?type=`) with a live fee range, budget check, rush and
  too-soon warnings and a dated timeline in working days, ending in an "enquiry received" state.
- Studio dates in America/Kentucky/Louisville time with US holidays and the winter break: booking month,
  earliest start, reply date, open studio and mail days, plus a `?now=` preview parameter.
- Fairs and events that roll forward with `KEEP_DEMO_CURRENT`, a newsletter sticker sign-up and a contact
  form with an order-number field.
- Light and dark paper themes, Rammetto One, Quicksand and Courier Prime from Google Fonts, a PNG social
  image, SVG favicon, accessible mobile menu, skip link and scroll reveals that respect reduced motion.
