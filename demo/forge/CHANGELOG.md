# Changelog

All notable changes to the Forge template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.6] - 2026-11-06

### Changed

- Set in Erie, Pennsylvania, and Bellingham, Washington, with American spelling, US dollars in the code samples and US billing options.

## [1.0.5] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.4] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.3] - 2026-10-26

### Fixed

- Placeholder email addresses in forms now use the reserved `.example` domain instead of a real-looking `.com` one.

## [1.0.2] - 2026-10-23

### Fixed

- The form confirmations no longer say the form is a demo and nothing was sent. The newsletter sign-up asks the
  subscriber to look out for a confirmation email; the sales request is "received", promises a reply within one
  business day (as the page already says) and shows a reference like FG-7K2Q. The notes under the sales and sign-up
  forms and the sign-up's test key warning no longer say they are demos. The quickstart's sample endpoint secret
  is now `whsec_example`. `DOCS.md` and `template.json` wording updated.

## [1.0.1] - 2026-10-17

### Fixed

- The scheduled maintenance notice on the status page is now a rolling demo date (the next Thursday at least three
  days away, `STATUS.maintenance = null`), so it never announces maintenance that has already happened.

## [1.0.0] - 2026-10-15

### Added

- Initial release with 10 pages: Home, Quickstart, SDKs and tools, Pricing, Changelog, Status, Company & careers,
  Talk to sales, Get an API key, 404.
- Hero code sample that types itself in curl, Node, Python or Go, then streams in the JSON response and delivery results
- API explorer: pick one of five endpoints, edit parameters and get realistic JSON, headers, status codes, latency and 404/422 errors
- Usage-based pricing with a monthly / annual switch and a volume slider that picks the cheapest plan and itemizes overage tiers
- Quickstart with copyable code blocks and language tabs that stay in sync across the page and are remembered on every page
- Status page with a component-by-region grid, 90-day uptime bars per region with hover and keyboard tooltips, and incident timelines
- Filterable changelog (feature, improvement, fix, breaking) and SDK directory with type filters, search and shareable URLs
- API key sign-up demo that validates the form and generates a masked test key with reveal and copy
- Sales form with work-email check, character counter and volume preselected from the pricing calculator
- Terminal-inspired dark design: framed hairline grid, IBM Plex Mono accents, one amber accent and SVG diagrams
- SEO and Open Graph tags, SVG favicon, 1200×630 social image, skip link and reduced-motion support
- Full documentation in `DOCS.md`.
