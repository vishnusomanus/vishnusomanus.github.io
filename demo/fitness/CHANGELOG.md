# Changelog

All notable changes to the Fitness template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.13] - 2026-11-07

### Changed

- Set in New Bedford, Massachusetts, as Keel Athletic Club, with 12-hour times and US units.
- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.1.12] - 2026-11-05

### Changed

- The sample copy uses American spelling, as the template is set in the US.

## [1.1.11] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.10] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.1.9] - 2026-10-26

### Fixed

- The club is now called Keel Athletic Club (it shared the name "Forge" with another Freeframe template), with a new "K" logo mark, favicon and social image.
- Phone numbers now use a real area code with the 555-01xx numbers reserved for fiction: (619) 555-0172 for Harbor and (619) 555-0177 for Northgate.

## [1.1.8] - 2026-10-23

### Fixed

- The contact, free trial and footer newsletter confirmations no longer say the form is a demo and nothing
  was sent. The contact and free trial confirmations now show a reference (like FA-7K2Q) and say what happens
  next, and the newsletter one asks subscribers to look out for a confirmation email. `DOCS.md` describes the
  reference.

## [1.1.7] - 2026-10-16

### Fixed

- Class bookings now work when the browser blocks localStorage (in a sandboxed iframe, like the
  freeframe.dev demo, or with strict privacy settings): the state is kept in memory for the page view.
  Before, "Book my spot" didn't book the class.

## [1.1.6] - 2026-10-09

### Fixed

- Links with `?plan=` (free trial) and `?topic=` (contact) are matched in any letter case, like `?type=`,
  `?coach=` and `?id=`: `?plan=Elite` preselects Elite and `?topic=PT` personal training. Only the
  form's own options count (`?plan=constructor` or `?topic=__proto__` still preselect nothing).

## [1.1.5] - 2026-10-09

### Fixed

- Coach page: `?id=` is matched case-insensitively like the timetable's `?coach=`, so `?id=DEV` shows
  Dev instead of the default coach. Only the coaches' own keys match (`constructor`, `__proto__` and
  `toString` still fall back to the default).

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.1.4] - 2026-10-08

### Fixed

- Class page: `?type=` is matched case-insensitively like on the timetable, so `?type=BOX` shows
  Box & Burn instead of the default class. Only the classes' own keys match (`constructor` and
  `__proto__` still fall back to the default).

## [1.1.3] - 2026-10-07

### Fixed

- `class.html?type=` and `trainer.html?id=` only accept real class and coach ids: `?type=constructor` or `?id=__proto__` no longer crash the page and show the default class or coach instead.
- Unknown `?type=` or `?coach=` values on `classes.html` are ignored, so the timetable shows every class instead of "0 classes this week".

## [1.1.2] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

### Fixed

- `?coach=` and `?type=` links and the coach specialty filter match regardless of case.
- Open/closed status, today's timetable day, "next up" classes and the earliest trial date use the club's time zone (new `TIMEZONE` setting) instead of each visitor's device clock.

## [1.1.1] - 2026-10-06

### Fixed

- Class bookings in localStorage are validated: corrupt data no longer breaks the timetable, and unknown sessions are dropped and storage repaired.
- The current class link on class pages no longer uses `aria-pressed` (not allowed on links); `aria-current` marks it instead.

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

- Initial release with 9 pages: Home, Timetable, Class detail, Coaches, Coach profile, Membership, Free trial, Locations & contact, 404.
- Weekly timetable from one data list, with day tabs on mobile and a week grid on desktop
- Filters by class, intensity and coach, plus spots-left and full/waitlist badges
- Accessible booking modal; bookings are saved in the browser and shown on the timetable
- Class and coach pages filled from the URL (class.html?type=box, trainer.html?id=lena)
- Monthly / yearly pricing toggle, comparison table and add-ons
- BMI & calorie calculator with metric and imperial units
- Three-step free-trial form with goal tiles, validation and a review step
- Live open-now status for each location, today's hours highlighted
- Next-up-today class strip, count-up stats and a class ticker
- Athlete pictograms, class covers and coach portraits drawn in SVG
