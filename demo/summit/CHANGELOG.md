# Changelog

All notable changes to the Summit template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.12] - 2026-11-05

### Changed

- Set in Bellevue, Washington, with American spelling, US dollars, US phone numbers and local details.
- Event times run on Pacific time (America/Los_Angeles, UTC-7 in April) and show on a 12-hour clock, dates read in US order, and the checkout says prices exclude sales tax.

## [1.1.11] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.10] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.1.9] - 2026-10-26

### Fixed

- Speaker websites and the email placeholder use the reserved `.example` domain.

## [1.1.8] - 2026-10-23

### Fixed

- The ticket checkout, sponsor inquiry and newsletter confirmations no longer say the site is a demo or that
  nothing was sent. The checkout button reads "Place order" and its confirmation says "Order placed" with an
  order reference (like SU-7K2Q) and that a payment link or invoice follows by email; the sponsor inquiry gives
  a reference and repeats the two-working-day promise; the newsletter asks the visitor to look out for a
  confirmation email. `DOCS.md`, `README.md` and `template.json` describe the new wording.

## [1.1.7] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.1.6] - 2026-10-17

### Fixed

- Once the 2027 edition is over, every date moves on to the same week of the next year (by whole weeks, so weekdays
  stay right) while `keepDemoCurrent` is `true`: the countdown, ticket prices, schedule, live state, the dates and the
  edition year in the header, footer, titles and copy, so the demo never shows a conference that has passed.
- The "Early-bird tickets on sale" pill and the early-bird sentence on the tickets page disappear once early-bird
  pricing has ended.

## [1.1.5] - 2026-10-09

### Fixed

- Speaker page: every speaker is laid out like the first (the default page): the same reveal animation,
  the globe icon on the website link and the sessions as cards with time, room, track, kind and level.
  Other speakers used to get no animation, no icon and a compact session list.
- Speaker page: `?id=` is matched in any letter case (`?id=Mei-Tanaka` works like `?id=mei-tanaka`). Only
  the speakers' own ids count; `constructor`, `__proto__` and unknown ids still show the first speaker.
- Home page: the stats said "12 hands-on workshops", but the program has 5; it now says 5.
- Schedule: choosing a day with the arrow keys, Home or End now updates the URL hash too (only clicks
  did), so reloading or sharing the page opens that day.
- Schedule: a star button's label follows its state: "Remove “…” from my schedule" once the session is
  starred, "Add “…” to my schedule" otherwise, updated when you press it and when saved stars are
  restored.

## [1.1.4] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.1.3] - 2026-10-07

### Fixed

- The schedule opens "today's" day tab using the event-local date (UTC+2) instead of the UTC date, so it no longer opens the previous day between midnight and 02:00 event time.
- `speaker.html?id=` (and the speaker pop-up) only match real speaker ids: `?id=constructor` or `?id=__proto__` no longer render an "Object"/"undefined" profile and show the default speaker instead. Ticket prices are looked up the same way.

## [1.1.2] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

### Fixed

- Ticket prices and order totals now come from `SUMMIT.tickets` in `assets/js/data.js` (one place to edit) instead of duplicate `data-price`/`data-early` attributes; removed a no-op expression in the order summary.

## [1.1.1] - 2026-10-06

### Fixed

- Starred sessions in localStorage are validated: corrupt data no longer breaks the schedule, and unknown sessions are dropped and storage repaired.
- Day-tab dates on the schedule now meet WCAG AA contrast.
- The ticket summary list contains only term/definition pairs; the VAT note moved below it.

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

- Initial release with 8 pages: Home, Speakers, Speaker profile, Schedule, Tickets, Venue & travel, Sponsors, 404.
- Live countdown to the opening keynote
- Speaker grid with track filter and accessible pop-up profiles
- Speaker profile pages driven by ?id= in the URL
- Schedule with day tabs, track filter and keyboard-friendly tabs
- Star sessions into a personal schedule saved on the device
- "On now" and "Up next" highlights while the event is live
- Ticket quantities with live totals, early-bird pricing and a 15% team discount
- Validated demo checkout, sponsor inquiry and newsletter forms
- Illustrated SVG speaker portraits, venue scene and city map
- One data file for speakers, sessions and ticket prices
