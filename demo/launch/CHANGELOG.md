# Changelog

All notable changes to the Launch template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.8] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.1.7] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.6] - 2026-10-26

### Fixed

- US spelling throughout (organized, organizations, prioritization, aging, color and more), the work email
  placeholder uses the reserved `.example` domain, and the product preview's address bar shows `app.launch.example`.

## [1.1.5] - 2026-10-23

### Fixed

- The contact, sign-in and sign-up success messages no longer say the template is a demo and nothing was sent or
  no account was touched. The contact message now confirms the message, promises a reply within one business day
  (as the page already says) and shows a reference like LA-7K2Q; sign-in welcomes the user back, and sign-up asks
  them to look out for an email confirming their address. `DOCS.md` describes the reference.

## [1.1.4] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.1.3] - 2026-10-07

### Fixed

- The "14-day free trial" line in the dark call-to-action banner (home, features, pricing and about) uses
  `text-zinc-400`; `text-zinc-500` on the banner was 4.12:1, below WCAG AA.
- The pricing comparison table's sideways scroller is keyboard reachable: `tabindex="0"`, `role="region"`
  and an accessible name ("Plan comparison table (scrolls sideways)").

## [1.1.2] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

### Fixed

- Smooth scrolling now applies only to in-page link jumps (`html:focus-within`) and never for reduced motion, matching the Next.js version; scripted scrolling is instant.

## [1.1.1] - 2026-10-06

### Fixed

- Raised low-contrast text to meet WCAG AA (axe color-contrast checks now pass in light and dark).
- Star ratings use `role="img"` so their label is valid.

## [1.1.0] - 2026-10-05

### Added

- "Back to top" button on every page. It fades in after you scroll about one screen,
  returns to the top (instantly for visitors who prefer reduced motion), moves keyboard
  focus to the main content, lifts itself above toast messages, steps aside while an in-page
  "Back to top" link is on screen and is hidden when printing.
  It is styled to match the template and its dark mode.
- `data-back-to-top-avoid` (lift the button above an element) and `data-back-to-top-hide`
  (hide the button while it would cover a sticky or fixed element) to keep it clear of your own UI.
- This changelog and a `version` field in `template.json`.

### Fixed

- Social sharing image is now a 1200×630 PNG (`assets/img/og-image.png`); most social sites don't display SVG. The SVG stays as the editable source.

## [1.0.0] - 2026-10-03

### Added

- Initial release with 7 pages: Home, Features, Pricing, About, Contact, Sign in / Sign up, 404.
- Dark mode toggle that remembers the visitor's choice, with no flash on load
- Sticky header that gains a shadow on scroll, plus an accessible mobile menu
- Product screenshot, Gantt chart, changelog and analytics chart built in HTML/SVG
- Monthly / annual pricing toggle and a full plan comparison table
- Animated FAQ accordion and count-up statistics
- Contact, sign-in and sign-up forms with inline validation and success states
- Accessible sign-in / create-account tabs with arrow-key support
- Subtle scroll-reveal animations that respect reduced-motion settings
- SEO and Open Graph tags, SVG favicon and social image on every page
