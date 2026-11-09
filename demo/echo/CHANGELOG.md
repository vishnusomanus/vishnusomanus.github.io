# Changelog

All notable changes to the Echo template (HTML + Tailwind CSS) are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the template uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.6] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.5] - 2026-11-06

### Changed

- Uses American spelling and words throughout, and guests' hometowns, measurements and temperatures read for US listeners.

## [1.0.4] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.3] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.2] - 2026-10-22

### Fixed

- The newsletter, sponsorship and guest pitch confirmations no longer say the form is a demo and nothing
  was sent. They read like the show's own messages: a confirmation link on its way for subscribers, and a
  reference (like OT-7K2Q) with the promised reply time for sponsor inquiries and guest pitches. `DOCS.md`
  and `template.json` describe the new wording.

## [1.0.1] - 2026-10-19

### Fixed

- The season filter buttons' accessible names now start with the text they show (S1, S2…) (WCAG 2.5.3).

## [1.0.0] - 2026-10-12

### Added

- Seven pages and a 404 for Overtone, a fictional independent interview podcast: home, episodes, episode,
  hosts, subscribe, advertise and be a guest.
- Audio player with play/pause, waveform scrubbing, 15-second skips, playback speed, volume and mute, time
  readouts and keyboard shortcuts. It plays a real `<audio>` file when an episode has a `src` and simulates
  playback on a clock otherwise.
- Mini player docked to the bottom of every page that keeps playing across page changes and resumes from the
  saved position, speed and volume (localStorage).
- Episode archive with search, season and topic filters, sort, live topic counts, removable filter chips,
  shareable URL parameters, an empty state and a load-more button.
- Episode pages generated from the `EPISODES` data: clickable chapters with the current one highlighted,
  chapter markers on the waveform, show notes, a searchable transcript that highlights and follows the
  current line, a guest card, related episodes and a share box that copies a link starting at the current
  second (`?t=`).
- Home page with the latest episode and its player, "listen on" links, featured episodes, topics with
  counts, hosts, listener reviews and a validated newsletter sign-up.
- Advertise page with audience stats, an SVG line chart, a donut chart and CSS bar charts (each with the
  numbers available as a table), ad formats, a rate card and a validated inquiry form.
- Be a guest page with a pitch form (conditional fields, character counter, URL check) and a success state;
  subscribe page with app links, a copyable RSS feed address, the next release date and an FAQ.
- Generated SVG cover art per season and topic, waveforms and guest avatars, illustrated host portraits, a
  PNG social image and SEO and Open Graph tags on every page.
- Accessible mobile menu, skip link, scroll reveals and back-to-top button that respect reduced motion.
