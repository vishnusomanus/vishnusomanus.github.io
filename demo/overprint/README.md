# Overprint: free HTML5 + Tailwind CSS illustrator portfolio template

A complete portfolio website for an independent illustrator, built for **Pomelo Press**, the fictional
Louisville studio of Pipa Valdespino: editorial illustration, picture books, packaging and posters. It looks
like a risograph print: three spot inks (fluorescent pink, federal blue and yellow) that overprint where they
meet, halftone screens, paper grain, plates a hair off register, stickers and zine pages. Dark mode prints
the same inks on dark paper. Plain HTML, Tailwind CSS v4 and vanilla JavaScript.

Every picture is drawn in SVG as separate ink plates, from the project data. The work page filters twelve
projects by type, and every project has a case study that steps from pencil sketch to plates to the final
print. The shop sells prints, zines and stickers with a cart and a checkout, the commission form estimates a
fee and a dated timeline in four steps, and fair dates roll forward so the demo never goes stale.

**Version 1.0.4** · [Documentation](DOCS.md) · [Changelog](CHANGELOG.md) ·
[Live demo](https://freeframe.dev/templates/overprint)

## Quick start

Open `index.html` in a browser. It works straight away: no install or build step is needed.

To rebuild the CSS after changing `src/input.css` or adding new Tailwind classes (Node.js 24):

```sh
npm install
npm run build
```

## Documentation

[DOCS.md](DOCS.md) is the full guide: pages and files, inks and fonts, adding projects and products, how
the riso artwork is drawn, the cart and checkout, the commission estimate and its dates, the events that
roll forward, connecting the forms, saved data, SEO, accessibility, deploying and troubleshooting. Changes
are listed in [CHANGELOG.md](CHANGELOG.md).

## License

MIT. The code and all included artwork are free for personal and commercial use. See `LICENSE.txt` in the
download. Rammetto One, Quicksand and Courier Prime are licensed under the SIL Open Font License. Pomelo
Press, Pipa Valdespino, the clients and the projects are fictional.
