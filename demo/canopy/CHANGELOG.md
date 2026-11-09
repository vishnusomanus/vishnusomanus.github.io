# Changelog

All notable changes to the Canopy template (HTML + Tailwind CSS) are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the template uses
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.4] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.0.3] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.2] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.1] - 2026-10-22

### Fixed

- The thumbnail shows the campground in season instead of "Closed for the winter".
- The site map is usable on phones: a hint and an edge fade show that it scrolls sideways to Pine Loop and the
  cabins, choosing a site scrolls its pin into view, and the scrolling frame is a focusable, labeled region.
- The guest menu stops at six and at the chosen site's limit, matching the six-person rule on the rates page.
- The newsletter success message no longer says the next letter goes out "when booking opens" (booking is
  always open).
- Visit page: Presque Isle Park is 10 miles away (on the way into town, closer than downtown), and Little Presque
  Isle is reached over a sandbar on calm days rather than "at low water" (Lake Superior has no tides).
- The visit page's area map no longer has an empty lower part.
- The season status strip above the header is in its own landmark.

## [1.0.0] - 2026-10-21

### Added

- Eight pages for Tamarack Pines Campground & Cabins, a fictional family-run campground on Lake Superior near
  Marquette, Michigan: home, sites and cabins, booking, trails and programs, rates and policies, camp store,
  visit and FAQ, and contact, plus a 404 page.
- Season status, countdown and "now booking" year worked out in the browser from the season rule (third Friday
  of May to the third Sunday of October), in Michigan time (America/Detroit).
- Interactive SVG campground map with 20 sites and 5 cabins, keyboard navigation, a detail panel and filters for
  type, hookups, RV length and pets, kept in the URL.
- Booking page with a date-range calendar, demo availability, shoulder, peak and weekend rates, a Saturday
  two-night minimum, party checks, add-ons, Michigan use tax and a booking request with a reference.
- Camp store with 15 products, categories, product options and a pre-order basket saved in the browser (in
  memory when storage is blocked), prefilled from the last booking request.
- Five trails with a difficulty filter and generated SVG elevation profiles, paddling routes and guided
  programs built from weekly rules and one-off dates that roll forward.
- Rates table and season strip drawn from the booking data, policies, directions with an area map, FAQ, and a
  contact form with office hours for the season and winter.
- Trail-map SVG artwork (hero, five cabins, paddling, camp store), a PNG social image, an accessible mobile
  menu, scroll reveals that respect reduced motion, a back-to-top button, and SEO and Open Graph tags.
