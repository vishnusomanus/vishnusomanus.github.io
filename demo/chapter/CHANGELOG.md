# Changelog

All notable changes to the Chapter template (HTML + Tailwind CSS) are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the template uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.5] - 2026-11-05

### Changed

- Set in Salem, Massachusetts, with American spelling, US dollars, US phone numbers and local details.
- Dates and times use Eastern time and a 12-hour clock. New books come out on a Tuesday, the usual day in the US,
  so the publication-day countdown and launch night moved to a Tuesday.

## [1.0.4] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.3] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.2] - 2026-10-23

### Fixed

- The newsletter and contact thank-you messages no longer say this is a demo form that doesn't send anything.
  Newsletter sign-ups are asked to look out for an email confirming their address. The contact form names
  who the message has gone to, says when they usually reply (a new `thanks` line in `CONTACT_TOPICS`, using
  the reply times the page already shows) and gives a reference like CT-7K2Q. `DOCS.md` describes both.

## [1.0.1] - 2026-10-19

### Fixed

- The logo link's accessible name now includes its visible text (WCAG 2.5.3).

## [1.0.0] - 2026-10-18

### Added

- Nine pages and a 404 for Clemency Thorne, a fictional novelist from Canterbury: home, books, single
  book, events, about, book clubs, press and media, newsletter and contact.
- Home page with a new-release hero: a live countdown to publication day in UK time that switches to an
  "out now" state by itself, pre-order links to five bookstores, early praise, the opening lines, the
  series in reading order, the next three events, a "continue reading" bookmark and a newsletter sign-up.
- Books page with series/standalone filters and counts (`books.html?show=`) and a reading-order or
  newest-first view (`books.html?order=`).
- Single book pages generated from one data list (`book.html?id=`): blurb, formats with ISBNs and prices,
  buy links, reviews and the rest of the series.
- First-chapter reader with page turns, arrow keys, three text sizes and your place saved in
  localStorage (kept in memory when storage is blocked).
- Events in Europe/London time that roll forward with the calendar (`KEEP_DEMO_CURRENT`) and disappear
  once over, with in-person/online filters (`events.html?format=`), the visitor's own time for online
  events and `.ics` calendar files.
- Book club guides with themes and discussion questions for every book (`book-clubs.html?book=`),
  downloadable as a text file or a printable SVG page, with a copy button.
- Press kit with biographies and contact emails to copy, a fact sheet and press release generated as
  text files, the author portrait and every jacket as SVG downloads.
- Contact form that routes by topic (`contact.html?topic=`) with its own fields per topic and a
  character counter, plus validated newsletter forms with demo success states.
- SVG book jackets drawn from each book's colors and motif, an illustrated portrait, a map of the
  places in the books, a PNG social image and SEO and Open Graph tags on every page.
- Accessible mobile menu, skip link, scroll reveals and back-to-top button that respect reduced motion.
