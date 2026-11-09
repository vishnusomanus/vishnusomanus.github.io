# Changelog

All notable changes to the Vows template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.12] - 2026-11-05

### Changed

- Set in Rhinebeck, New York, with American spelling, US dollars, US phone numbers and local details.
- Dates read in US order (June 19, 2027 and 06.19.27), times use Eastern Daylight Time in the schedule, countdown and calendar files, and Rhinecliff station moves to the southwest on the travel map to match the real place.

## [1.0.11] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.10] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.9] - 2026-10-23

### Fixed

- The RSVP confirmation no longer says the reply was not sent anywhere. It confirms the reply, names the email the
  confirmation goes to and shows a reference like AT-7K2Q. The honeymoon fund thank-you no longer says it's a demo
  and no payment was taken: it notes the gift under a reference and points to the transfer details on the
  invitation. The note under the registry no longer calls Reserve a demo. `DOCS.md` and `template.json` are updated
  to match.

## [1.0.8] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).
- The schedule's Add to calendar buttons and the registry's Reserved buttons' accessible names now include their visible text (WCAG 2.5.3).

## [1.0.7] - 2026-10-18

### Fixed

- Once the wedding weekend (18–20 June 2027) is over, every date moves on to the same weekend of the next year (by
  whole weeks, so weekdays stay right) while `keepDemoCurrent` is `true`: the countdown (no more "Today's the day" a
  year later), the schedule and calendar files, the RSVP and room-block deadlines, "19.06.27", the year and the page
  title.

## [1.0.6] - 2026-10-16

### Fixed

- The RSVP page no longer moves keyboard focus to the "Find your invitation" heading when it loads, which
  skipped keyboard and screen-reader users past the skip link, the header and the menu. Focus now stays at
  the top of the page; it still moves to the new step's heading when you go from one step to the next.

## [1.0.5] - 2026-10-16

### Fixed

- The RSVP draft now works when the browser blocks localStorage (in a sandboxed iframe, like the
  freeframe.dev demo, or with strict privacy settings): the state is kept in memory for the page view.
  Before, finding the invitation again lost the answers already given.

## [1.0.4] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.0.3] - 2026-10-08

### Fixed

- The FAQ search suggests "parking or children": the suggested "kids" matched no question (the FAQ says "children").
- Honeymoon fund: an amount error always focuses the custom amount field (the only case it can happen); removed the unreachable branch that focused the first amount button.

## [1.0.2] - 2026-10-07

### Fixed

- The back-to-top button hides as soon as the mobile menu opens (and returns when it closes). It only rechecked on scroll, resize or a transition, so it often stayed on top of the open menu.

## [1.0.1] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

## [1.0.0] - 2026-10-06

### Added

- Nine pages: Home, Our story, Schedule, Travel & stay, RSVP, Registry, Gallery, FAQ and a 404 page.
- Home: names and date, a live countdown to the ceremony, save-the-date card with an add-to-calendar
  file, quick links, the weekend at a glance and an RSVP call to action.
- Schedule: Friday to Sunday itinerary with times, places and dress codes; a downloadable `.ics`
  calendar file for each event and for the whole weekend.
- Travel: illustrated map with a selectable legend, train/car/shuttle details, three room blocks with
  copyable booking codes, and local tips.
- RSVP: find an invitation by code or by any guest's name (accents and spacing ignored), reply for each
  guest, choose meals (with a children's menu), add dietary needs, a plus-one where allowed, a song
  request and a note; inline validation with an error summary; a review step and a demo confirmation.
  Unsent replies are saved on the device and validated before they are restored.
- Registry: honeymoon fund with preset or custom amounts and a progress bar, and a gift list with
  category filters and reservations remembered on the device.
- Gallery: nine illustrated "photos" with a lightbox (arrow keys, Esc, focus returns).
- FAQ: grouped questions with search.
- Accessible mobile menu, scroll reveals that respect reduced motion, a back-to-top button, social
  sharing image and favicon.
