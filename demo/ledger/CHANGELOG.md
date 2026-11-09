# Changelog

All notable changes to the Ledger template are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this template follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.10] - 2026-11-07

### Changed

- American wording throughout, including US terms for checkboxes, business days, schedules and units.

## [1.1.9] - 2026-11-06

### Changed

- Set in Ann Arbor, Michigan, with American spelling and US places in the copy.

## [1.1.8] - 2026-11-05

### Changed

- The guide, README and changelog use American spelling. The template itself is unchanged.

## [1.1.7] - 2026-10-23

### Fixed

- The contact form's confirmation no longer says it is a demo and nothing was sent. It now confirms the
  message was received, shows a reference (like LE-7K2Q) and says we reply to most messages within a week,
  as the contact page already promises. The newsletter confirmations ask readers to look out for a
  confirmation email instead of pointing site owners to the README. `DOCS.md` describes the reference.

## [1.1.6] - 2026-10-09

### Fixed

- Reading time counts only the words a reader reads: each text node on its own (words in neighboring
  tags used to run together), without the chart's SVG text (its title, description and labels), scripts,
  styles, hidden elements or the notes. The example essay now reads "4 min read" (it was 5 because of
  the chart's text), also on the home page and in the archive.

## [1.1.5] - 2026-10-09

### Changed

- The CSS build no longer reads the documentation and metadata files (`*.md`, `*.json`), so words in
  the guides can no longer add unused rules to `assets/css/style.css`. No visible change.

## [1.1.4] - 2026-10-08

### Fixed

- "Short notes" on the front page and "Masthead" and "What we believe" on the about page are `<section>` elements named by their headings. They were `<div>`s with `aria-labelledby`, which ARIA doesn't allow on generic elements, so the name was ignored.
- The footer colophon no longer claims "Made with plain HTML.", which was wrong for the Astro and WordPress versions: it reads "Set in Newsreader & Inter." in every version.

## [1.1.3] - 2026-10-07

### Fixed

- The thin strip above the header is a labeled landmark (`role="region"`, `aria-label="About The Ledger"`).
- The code block in `article.html` has `tabindex="0"`, so keyboard users can scroll it on small screens.
- `404.html` has `<meta name="robots" content="noindex">`, so the error page is not indexed.
- A tampered stored theme (any `ledger-theme` value other than `"dark"` or `"light"`) no longer forces light
  mode; it is ignored and the page follows the system setting.

## [1.1.2] - 2026-10-07

### Added

- Full documentation in `DOCS.md`.

### Fixed

- `archive.html?topic=` links match the topic regardless of case (`?topic=design` selects Design).

## [1.1.1] - 2026-10-06

### Fixed

- The accent kicker on the inverted quote band now meets WCAG AA contrast in both themes.
- Footnote back-links are underlined so they don't rely on color alone.

## [1.1.0] - 2026-10-05

### Added

- "Back to top" button on every page. It fades in after you scroll about one screen,
  returns to the top (instantly for visitors who prefer reduced motion), moves keyboard
  focus to the main content, lifts itself above toast messages, steps aside while an in-page
  "Back to top" link is on screen and is hidden when printing.
  It is styled to match the template and its dark mode.
- `data-back-to-top-avoid` (lift the button above an element) and `data-back-to-top-hide`
  (hide the button while it would cover a sticky or fixed element) to keep it clear of your own UI.
- This changelog and a `version` field in `template.json`.

### Fixed

- Social sharing image is now a 1200×630 PNG (`assets/img/og-image.png`); most social sites don't display SVG. The SVG stays as the editable source.

## [1.0.0] - 2026-10-03

### Added

- Initial release with 7 pages: Home, Article, Archive, Topics, About, Contact, 404.
- Dark mode toggle that remembers the choice, with no flash on load
- Reading progress bar and estimated reading time
- Auto-generated table of contents that highlights the current section
- Archive with live search, topic filters and shareable filter URLs
- Share buttons with copy-link toast
- Pull quotes, footnotes, code blocks and an accessible SVG chart
- Validated contact, pitch and newsletter forms
- Responsive layout with an accessible mobile menu
- Subtle scroll-reveal animations that respect reduced motion
- Hand-made SVG cover art and writer avatars
