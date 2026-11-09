# Changelog

All notable changes to the Sprocket template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

## [1.0.0] - 2026-10-31

### Added

- Initial release: a ten-page product launch site for Bonfield Bikes, a fictional e-bike startup in Duluth, Minnesota, taking reservations for the Portage compact cargo e-bike: Home, Configurator, Range estimator, Reserve, Specs, Build log, Article, About, Support and a 404 page.
- Configurator with five frame colors, two batteries and six accessories (the kid seat and panniers bring the rear rack along), a live price breakdown, an SVG bike that recolors and shows each part, shareable links (`?color=&battery=&acc=`) and a saved build in localStorage, kept in memory when storage is blocked.
- Production batches worked out from today in Central time: the open batch, ship month, spots left, closing date and the next batch, in the top bar of every page, on the home page and on the reserve page.
- Reservation flow: the build from the link or the saved build, delivery zone and fee from the ZIP code, validation, a refundable $150 deposit (no payment taken), a success state with a reference, and the saved reservation with a two-step cancel on return.
- Range estimator for battery, rider and cargo weight, terrain, temperature, assist level and studded tires, with three presets, the working shown and a battery suggestion linking into the configurator (`?battery=`).
- Specs page with full specifications, a footprint drawing, a comparison table and a car vs Portage cost calculator.
- Build log with a category filter (`?cat=`) and eight articles on `article.html?a=<slug>` with a fallback for unknown links; post dates move forward by whole weeks so the newest post always looks recent.
- About page with the story, a timeline, seven illustrated team portraits, backers and a team filter for open roles (`?team=`); support page with FAQ search, warranty, delivery zones with a ZIP checker and a contact form with a success state (`?topic=`).
- `?now=YYYY-MM-DDTHH:MM` previews every date-dependent part of the site at a Central date and time.
- SVG artwork: the Portage drawing with every accessory, a cover for every article, team portraits, a hill map, delivery zone rings, a footprint chart, a 404 drawing, favicon and social image.
- Accessible mobile menu, skip link, keyboard-friendly color swatches and filters, back-to-top button and scroll reveals that respect reduced motion.
