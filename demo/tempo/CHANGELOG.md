# Changelog

All notable changes to the Tempo template (HTML + Tailwind CSS) are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the template uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.10] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.9] - 2026-11-06

### Changed

- The press page no longer shows a fixed update date, so it doesn't look out of date.

## [1.0.8] - 2026-11-05

### Changed

- Set in Lincoln, Nebraska, with American spelling, US dollars and local details.
- The tour now opens with a Midwest run: the `uk` tour region became `midwest` (`?region=midwest`), the `na` region reads "Coasts & Canada", and doors times show in 12-hour time. The release id `clyde-in-winter` became `creek-in-winter`. Prices exclude sales tax, and US shipping is $6, free over $60.

## [1.0.7] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.6] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.5] - 2026-10-23

### Fixed

- The Static Club, tour alert and contact confirmations no longer say the form is a demo or that nothing was sent.
  The sign-ups ask the visitor to look out for a confirmation email; the contact confirmation says who the message
  went to, repeats that topic's reply time and shows a reference like MS-7K2Q.
- The merch checkout no longer calls itself a demo: the note shows the shipping times from the merch page, the button
  reads "Place order", and the confirmation reads "Order placed" with an order reference like MS-7K2Q. The contact
  form's order number field accepts these references too.
- The pre-save toast no longer ends in "(demo)". `DOCS.md` and `template.json` describe the new wording.

## [1.0.4] - 2026-10-19

### Fixed

- The track play buttons, release covers and tour Remind me links' accessible names now include their visible text (WCAG 2.5.3).

## [1.0.3] - 2026-10-17

### Fixed

- Once the whole tour has passed, the tour and the new album move on to the same weeks of the next year by whole weeks
  (weekdays stay right; the tour used to move by whole years, which changed them), so the demo always has an album on
  the way and upcoming shows.
- The announcement bar, the "Pre-save" buttons, "Pre-order the LP", the tour years ("2026–27"), the press kit and
  about page dates and the home page title follow the release and tour dates; pre-save and pre-order links read
  "Listen" and "Buy the LP" once the album is out, and "Pre-order" badges become "Out now".
- Shows marked "on sale soon" go on sale on their on-sale date.

## [1.0.2] - 2026-10-16

### Fixed

- The album pre-save button now works when the browser blocks localStorage (in a sandboxed iframe, like the
  freeframe.dev demo, or with strict privacy settings): the state is kept in memory for the page view.
  Before, it didn't respond.

## [1.0.1] - 2026-10-15

### Fixed

- Fields that appear after choosing a topic on the contact form (such as the event date and the order
  number) are now checked as you type and when you leave them, like the other fields, instead of only
  when you send the form.

## [1.0.0] - 2026-10-14

### Added

- Seven pages and a 404 for Marigold Static, a fictional indie band from Glasgow: home, music, tour, merch,
  about, press kit and contact.
- Home page with a new-release hero (countdown, pre-save saved in localStorage, "out now" state on release
  day), the new album's track list, a click-to-play video poster, the next four shows, a merch preview, a
  press quote and a validated fan-club sign-up.
- Track player docked to the bottom of the page with play/pause, previous/next, seek, mute, a now-playing
  state in every track list and keyboard shortcuts. Previews are synthesized in the browser as WAV files;
  a track with a `src` plays a real file instead.
- Discography with album/EP/single filters and counts (`music.html?type=`), a release detail view with track
  list, credits and previous/next links (`music.html?release=`), and a copy-link button.
- Tour page with region and country filters (`tour.html?region=&country=`), sold-out, last-tickets and
  on-sale-soon states, `.ics` calendar downloads, past shows, an FAQ and a "notify me" form that can be
  pre-filled from a show (`tour.html?notify=`).
- Merch store with category filters (`merch.html?cat=`), color swatches that redraw the product art, sizes
  with sold-out options, and a cart drawer saved in localStorage with quantities, subtotal, a free-shipping
  meter and a clearly labeled demo checkout.
- Press kit with a fact sheet, short/medium/long bio tabs with copy to clipboard and downloadable cover art,
  logo, bios, fact sheet and tech rider; contacts with copy buttons.
- Contact form that routes by topic (booking by region, press, sync, orders, general) with conditional
  fields and a character counter.
- SVG album covers generated per release, merch mock-ups, band and member portraits, a PNG social image and
  SEO and Open Graph tags on every page.
- Accessible mobile menu, skip link, scroll reveals and back-to-top button that respect reduced motion.
