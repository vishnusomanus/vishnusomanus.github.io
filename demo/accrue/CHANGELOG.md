# Changelog

All notable changes to the Accrue template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.3] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.2] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.1] - 2026-10-31

### Fixed

- The phone menu opened with no height, so its links could not be seen or tapped: the header's background blur made the header, not the screen, the frame for the fixed menu. The blur is now switched off while the menu is open.

## [1.0.0] - 2026-10-30

### Added

- Initial release: a ten-page site for Fernley Whitcomb CPAs, a fictional accounting and tax firm in Chattanooga, Tennessee: Home, Services, Service detail, Pricing, Deadlines, Team, Insights, Article, Book a consultation and a 404 page.
- Tax deadline calendar for the current and next year, worked out from rules: federal deadlines move past weekends, federal holidays and DC Emancipation Day; Tennessee franchise & excise deadlines move past weekends, state holidays and Good Friday. Filters by taxpayer type (`?type=`), a year switch (`?year=`), a live countdown to the next deadline and a holiday list.
- Next-deadline line in the top bar of every page and a deadline teaser with countdown on the home page.
- Tax-season document checklist for individuals, freelancers, S corps and partnerships, and nonprofits; ticks are saved in localStorage (validated on read) and kept in memory when storage is blocked.
- Fee estimator: entity type, monthly transactions, payroll employees, states and cleanup months give a monthly estimate with a breakdown, an annual total and a one-time cleanup fee; inputs are kept in the URL.
- Consultation booking with a service picker (`?service=`), meeting type, a rolling grid of the next ten open days in Eastern time (lunch break, office holidays, tax-season Saturdays), validation and a success state with a reference number.
- Seven services rendered from data on `service.html?s=<slug>` and seven articles on `article.html?a=<slug>`, each with a fallback for unknown links; category filter on Insights (`?cat=`).
- `?now=YYYY-MM-DDTHH:MM` previews every date-dependent part of the site at an Eastern date and time.
- SVG artwork: an illustration per service and per article, seven illustrated team portraits, industry icons, a downtown map, a 404 drawing, favicon and social image.
- Accessible mobile menu, skip link, back-to-top button and scroll reveals that respect reduced motion.
