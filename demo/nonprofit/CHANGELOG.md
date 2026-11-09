# Changelog

All notable changes to the Nonprofit template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.9] - 2026-11-07

### Changed

- Contact addresses use the reserved `.example` domain.
- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.1.8] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.7] - 2026-10-26

### Fixed

- Clearwater Trust is now based in Minneapolis (418 Washington Ave N, Minneapolis, MN 55401, (612) 555-0142), so it no longer shares Portland with another Freeframe template; the events and volunteer roles moved with it.
- US spelling throughout: "In honor of", "program director", "meters", "organization", "color".

## [1.1.6] - 2026-10-23

### Fixed

- Form messages no longer say the form is a demo, that nothing was sent or that the template doesn't
  process payments. The volunteer application now says Sam replies within a week (as the page already
  says) and the RSVP points to a confirmation email; both show a reference like CT-7K2Q. The donation
  thank-you shows a gift reference and says no payment is taken on this site, the payment step's "Demo"
  badge is gone, and the "Secure checkout once connected to your payment provider" point now reads "We
  never sell or share your details". `DOCS.md` describes the reference.
- The donation thank-you's closing line had too little contrast on its pale panel; it is now dark teal.

## [1.1.5] - 2026-10-09

### Fixed

- Programs map: one of the background dots near the top of the map was drawn twice, so it had a darker
  edge. It is now drawn once.
- Donate: after a submit with a custom amount under $5, typing a valid amount kept showing "The minimum
  gift is $5.". The minimum is now checked again as you type.

## [1.1.4] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.1.3] - 2026-10-08

### Fixed

- On the story page the header's Stories link (desktop and mobile menu) is marked `aria-current="true"`, the current section, instead of `aria-current="page"`: it links to the stories list, not to the page being read. It keeps the same highlight.

## [1.1.2] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

### Fixed

- The "send for real" comment in the form script now shows a working Formspree example.
- The matched-giving note on `donate.html` only shows for known appeals (`MATCHED_APPEALS`), not for any `?appeal=` value.
- The appeal's raised amount, goal and progress-bar value are all filled in from `data-raised`/`data-goal`, so they can't disagree.

## [1.1.1] - 2026-10-06

### Fixed

- Raised low-contrast text to meet WCAG AA (axe color-contrast checks now pass in light and dark).

## [1.1.0] - 2026-10-05

### Added

- "Back to top" button on every page. It fades in after you scroll about one screen,
  returns to the top (instantly for visitors who prefer reduced motion), moves keyboard
  focus to the main content, lifts itself above toast messages, steps aside while an in-page
  "Back to top" link is on screen and is hidden when printing.
  It is styled to match the template.
- `data-back-to-top-avoid` (lift the button above an element) and `data-back-to-top-hide`
  (hide the button while it would cover a sticky or fixed element) to keep it clear of your own UI.
- This changelog and a `version` field in `template.json`.

### Fixed

- Social sharing image is now a 1200×630 PNG (`assets/img/og-image.png`); most social sites don't display SVG. The SVG stays as the editable source.

## [1.0.0] - 2026-10-04

### Added

- Initial release with 9 pages: Home, About & finances, Programs, Stories, Story, Get involved, Events, Donate, 404.
- Donate page with one-time/monthly toggle, preset and custom amounts
- Live impact message for every amount, plus cover-the-fees total
- Gift dedication (in honor or memory) and validated demo checkout
- Animated impact counters and appeal progress bar
- Programs filter with a dot-matrix world map that highlights regions
- SVG donut chart showing where every dollar goes
- Volunteer roles that preselect the application form
- Event list with RSVP buttons and a guest-count stepper
- Long-form story page with pull quote, figure and copy-link sharing
- Accessible mobile menu, skip link and reduced-motion-aware reveals
