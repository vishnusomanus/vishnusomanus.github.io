# Gather — HTML + Tailwind CSS template

A website for **Riverbend Church**, a fictional non-denominational church in Lawrence, Kansas: a home page
with this Sunday's times and a live countdown to the next service, a plan-your-visit page with kids'
check-in, accessibility, a parking map, FAQ and a visit form, a filterable sermon archive and sermon pages
with an accessible audio player, an events calendar with .ics downloads, a small-group finder and
ministries, a giving form with a live total, an about page with staff, contact and prayer requests, and a
404 page. Every illustration and portrait is SVG, so there are no photos to replace. Plain HTML, Tailwind
CSS v4 and vanilla JavaScript.

**Version 1.0.7** · [Documentation](DOCS.md) · [Changelog](CHANGELOG.md) ·
[Live demo](https://freeframe.dev/templates/gather)

## Quick start

Open `index.html` in a browser, or serve the folder:

```sh
npx serve .
```

To change styles (Node.js 24 or newer):

```sh
npm install
npm run watch     # rebuilds assets/css/style.css while you edit
```

## Documentation

[DOCS.md](DOCS.md) covers everything: pages and structure, brand tokens, the service schedule and time
zone, adding sermons, events and groups, the audio player (real files or simulated playback), connecting
forms and a payment provider, saved data, SEO, accessibility and deploying.

## License

MIT. Free for personal and commercial use.
