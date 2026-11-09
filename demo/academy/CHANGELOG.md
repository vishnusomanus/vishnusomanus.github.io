# Changelog

All notable changes to the Academy template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.9] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.8] - 2026-11-06

### Changed

- Uses American spelling and words throughout, such as "Enroll", "catalog" and "color", and replies come within one "business day".

## [1.0.7] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.6] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.5] - 2026-10-23

### Fixed

- The team quote and "Teach with us" confirmations no longer say the form is a demo and nothing was sent. They
  now confirm the request, show a reference (like NA-7K2Q) and say what happens next (a reply within one working
  day for a quote, within two weeks for an application). The footer newsletter confirmation asks subscribers to
  look out for a confirmation email, and enrolling in a paid course gives an order reference instead of saying
  no payment was taken. `DOCS.md` describes the reference.

## [1.0.4] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.3] - 2026-10-09

### Fixed

- The page titles the script sets on course, instructor and lesson pages use a single `SITE_NAME`
  constant at the top of `assets/js/main.js` instead of a hard-coded "Northfield Academy", so renaming
  the school is one change (as in the Astro, Next.js and WordPress versions).

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.0.2] - 2026-10-08

### Fixed

- Generated lesson titles keep the module title's casing ("Core ideas: Components and JSX" instead of
  "Core ideas: components and jsx").
- A stored streak count that isn't a whole number from 0 to 3,650 resets the streak (like other
  tampered progress) instead of being clamped to 3,650 days.
- The "Teach with us" and team quote forms' fields have `name` attributes (`name`, `email`, `topic`,
  `idea`; `name`, `email`, `company`), so a real form backend receives their values.

## [1.0.1] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

## [1.0.0] - 2026-10-06

### Added

- Ten pages: home, course catalog, course detail, learning paths, instructors, instructor profile,
  pricing, student dashboard (My learning), lesson player and a 404 page.
- One data section for the whole site (top of `assets/js/main.js`): 12 courses, 6 instructors and
  4 learning paths, with curricula and lesson lengths generated from each course.
- Course catalog with search and filters for topic, level, length, price and rating, six sort
  orders and grid/list views; filters live in the URL and the view is remembered.
- Course pages with outcomes, a curriculum accordion with free preview lessons, a preview dialog,
  instructor bio, reviews with a rating histogram, FAQs and a sticky enroll card.
- Student dashboard with stats, a learning streak, continue-where-you-left-off, progress rings and
  certificates (generated SVG) in a dialog.
- Lesson player with a course sidebar, mark-as-complete, per-lesson notes, accessible tabs and
  previous/next navigation; locked lessons until you enroll.
- Progress, notes and preferences saved in localStorage and validated on every read, so tampered or
  corrupt data never breaks a page.
- Pricing with a monthly/yearly toggle, comparison table, team seats calculator with volume
  discounts and a validated quote form.
- Dark mode, accessible mobile menu, scroll reveals that respect reduced motion, back-to-top button,
  validated forms with success states, SEO and Open Graph tags, favicon and social image.
