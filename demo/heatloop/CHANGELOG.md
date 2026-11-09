# Changelog

All notable changes to the Heatloop template (HTML + Tailwind CSS) are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the template uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.3] - 2026-11-05

### Changed

- Set in Bangor, Maine, with American spelling, US dollars, US phone numbers and local details.
- The savings estimator works in dollars, kWh, therms and gallons of heating oil or propane, with US home sizes in square feet, carbon in pounds and tons, and sample Maine prices labeled as estimates. The day chart and home teaser use a US rate plan, the 12-hour clock and a 90 kWh cold day that suits Maine. Some estimator and careers URL values changed to match, such as `region=eastern` and `location=bangor`.
- The reservation checks 5-digit ZIP codes (with an optional +4), references read like `HL-04401-7K2Q`, and phone fields check for US numbers. Grant wording is now general wording about federal, state and utility incentives, with none promised.

## [1.0.2] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.1] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.0] - 2026-10-27

### Added

- Eight pages for Heatloop, a fictional climate-tech hardware startup in Aberdeen: home, technology, savings and
  carbon estimator, reserve, careers, company, news and contact, plus a 404 page.
- Editorial deep-tech design: Hedvig Letters Serif and Sans with Source Code Pro, numbered sections, hairline
  rules, and technical SVG drawings (product cutaway, exploded view, coverage map, workshop, charts) that follow
  the light and dark themes.
- "How much could you shift" teaser with a model picker and a daily heat slider.
- Interactive 24-hour charge and release diagram over a time-of-use tariff, with a time slider, play button,
  three models and live readouts.
- Savings and carbon estimator (home, heating, tariff, region) with bars, a suggested model, the formula shown
  with the visitor's numbers, and results shareable by URL.
- Three-step reservation with a postcode coverage check, a reference and queue place, saved in the browser for
  returning visitors, with change and cancel.
- Careers with team, location and remote filters kept in the URL, saved roles and a role details dialog.
- Company page with drawn team portraits, backers, a timeline and press kit downloads.
- News with a topic filter, coming-up events built from rules, and dated posts, milestone years and the
  reservation count that roll forward with `KEEP_DEMO_CURRENT`.
- Contact form with the inquiry type and role from the URL and a reference on success, a newsletter form, dark
  mode toggle, accessible mobile menu, scroll reveals, back-to-top and a PNG social image.
