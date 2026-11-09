# Changelog

All notable changes to the Brew template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.3] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.0.2] - 2026-11-04

### Fixed

- A change you make is kept for the visit when the browser can't save it, for example when its storage is full, instead of going back to the old value.

## [1.0.1] - 2026-10-22

### Fixed

- Seasonal events no longer drift into the wrong season: costume night, the winter makers market, the Rimfire,
  Tumbleweed and Lava Tube releases and the other seasonal events (`yearly: true`) come back at the same time each
  year on the same weekday, while the regular program still moves forward by whole weeks. Fourteen new seasonal
  events cover January to September, and the calendar shows about twelve weeks ahead, so it is full and in date
  order on any date. Trivia topics and the bluegrass night no longer mention winter.
- The tap board no longer says Rimfire was "just tapped" while its release day is still coming up: Rimfire and
  Tumbleweed take turns on tap 4 (`SEASONAL_TAP`), each from the start of its release event, and the tasting notes
  say when a seasonal beer is back on tap.
- Events that would start after closing time on a day with holiday hours (such as Christmas Eve) are hidden.
- US wording throughout: "inquiry" instead of "enquiry", "Private events" instead of "Private hire", "rental fee",
  "business days", "retailers", "canceled" and "Customizing".
- Trivia winners now take home a $50 gift card instead of drinking free for the night.
- Private events form: a guest count over the space's capacity is now an inline error, the per-head figure only shows
  for 8 guests or more and uses the minimum for the chosen day.
- Kasimir's bio names an Oregon town; Lava Tube is poured in 10 oz snifters, matching the board and menu; the barrel
  room tour description no longer repeats "taste".

## [1.0.0] - 2026-10-21

### Added

- Initial release: a ten-page site for Cinderjack Brewing Co., a fictional independent brewery, taproom and beer garden in Bend, Oregon: Home, Beers, Taproom & menu, Events, Shop, Pickup order, Tours, About & visit, Private events & contact and a 404 page.
- Live "on tap now" board on the home and taproom pages with keg levels, pour prices and just-tapped badges, and an open-now status with today's hours in Pacific time on every page (never a bare "Closed": it says when the taproom opens next). `?now=` previews any Pacific date and time.
- Opening hours with US federal holidays worked out for any year by rule (holiday hours or closures per holiday) and extra yearly special days; the next changes are listed on the taproom and visit pages.
- Food truck rotation by weekday rule (alternating weeks on Friday to Sunday), with today's truck in the header and a seven-day schedule.
- Fifteen beers with style, ABV, IBU, tasting notes, hops and pairings, filterable by style, strength and what's pouring (`?style=`, `?strength=`, `?tap=1`), an ABV/IBU map, and a tasting-notes dialog with an SVG flavor chart (`?beer=`).
- Pour menu, snacks and a flight builder with a drawn flight paddle.
- Events calendar with eighteen dated release parties, trivia nights, live music, beer dinners and community days in date order, type filters (`?type=`) and a next-up countdown; dates move forward in whole weeks while `KEEP_DEMO_CURRENT` is on.
- Cans and merch to go: a cart saved in localStorage (validated on read, in memory when storage is blocked) with options and per-item limits, the Oregon bottle deposit, a pickup day and 30-minute slot picker, a 21+ confirmation for beer and an order reference.
- Brewery tour booking with two tours, live capacity per start time, party size steppers, saved bookings (localStorage) and cancel.
- Private events inquiry with three spaces, capacity checks, minimum spend by day of the week and a reference on success.
- SVG artwork: a label for every beer drawn from the data, merch drawings, beer garden, brewhouse cutaway, neighborhood map, six crew portraits, favicon and social image.
- Accessible mobile menu, skip link, keyboard-friendly pickers and dialog, back-to-top button and scroll reveals that respect reduced motion.
