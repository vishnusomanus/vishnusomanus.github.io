/* Studio (Raster, Saint Paul) — site scripts. Vanilla JavaScript, no dependencies.
   Sections: data, helpers, header, clock, reveals, work index, case study, estimator,
   inquiry form, journal, small extras, back to top. */
(function () {
  'use strict';

  /* localStorage, or memory when it's blocked or a save fails (storage full). Memory is read first, so a change
     that couldn't be saved still shows for this page view. */
  var safeStorage = (function () {
    var local = null;
    try { local = window.localStorage; local.getItem('_'); } catch (e) { local = null; /* blocked */ }
    var memory = Object.create(null);
    return {
      getItem: function (key) {
        if (key in memory) return memory[key];
        try { return local ? local.getItem(key) : null; } catch (e) { return null; }
      },
      setItem: function (key, value) {
        if (local) {
          try { local.setItem(key, String(value)); delete memory[key]; return; } catch (e) { /* full */ }
        }
        memory[key] = String(value);
      },
      removeItem: function (key) {
        delete memory[key];
        if (local) { try { local.removeItem(key); } catch (e) { /* blocked */ } }
      }
    };
  })();

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* =====================================================================
     DATA
     ===================================================================== */

  /* Disciplines used by the work filter (?discipline=) and the case studies. */
  var DISCIPLINES = {
    identity: 'Identity',
    digital: 'Digital product',
    editorial: 'Editorial',
    wayfinding: 'Wayfinding'
  };

  /* Case studies shown by project.html?id=<id>, newest first. This order also drives
     the previous/next links. Each project's cover lives in assets/img/work/<id>.svg.
     palette: bg (background), ink (text/marks on bg), accent, soft (a quiet second tone).
     mark: SVG drawn in a 100 x 100 box, filled with currentColor.
     gallery: three images; the first is wide (16:9), the next two are tall (4:5).
       kinds: board, screens, spread (wide) and poster, signage, mark (tall). */
  var PROJECTS = [
    {
      id: 'seeline',
      client: 'Wakeline',
      title: 'A calmer identity for the lake ferries',
      disciplines: ['identity', 'wayfinding'],
      year: 2025,
      sector: 'Public transport',
      location: 'Excelsior',
      duration: '14 months',
      services: ['Identity system', 'Wayfinding', 'Schedule design', 'Livery'],
      summary: 'Wakeline runs eleven passenger ferries on Lake Minnetonka. We rebuilt its identity around a single ring-and-wave mark and a schedule system that works on a phone, a pier and a paper fold-out.',
      challenge: 'Wakeline had grown out of three older operators, and it showed: four logos, two typefaces on the same pier and schedules that changed format from boat to boat. Tourists missed the last ferry home; regulars ignored the signs altogether. The brief was to make one ferry company out of three, without losing the warmth people felt for the old boats.',
      approach: [
        { title: 'Audit every touchpoint', text: 'We photographed all 23 piers and catalogd 412 signs, tickets and notices. Two thirds carried information that was already out of date.' },
        { title: 'One mark, one grid', text: 'The ring-and-wave mark reads at a third of an inch on a ticket and at ten feet on a bow. Everything else sits on a single eight-column grid shared by print, signs and screens.' },
        { title: 'Schedules first', text: 'We designed the departure board before the logo. Times are set large in tabular figures, with the last boat of the day marked in buoy orange.' }
      ],
      results: [
        { value: '−38%', label: 'Complaints about missing the last ferry, first season' },
        { value: '23', label: 'Piers re-signed in one winter shutdown' },
        { value: '1', label: 'Grid shared by print, signage and the app' }
      ],
      quote: { text: 'People tell us the boats feel newer. They are not. They are just easier to understand now.', name: 'Andrea Lutz', role: 'Head of customer experience, Wakeline' },
      credits: ['Noemi Imhof', 'Selin Karaca', 'Céline Odermatt'],
      palette: { bg: '#1d3b57', ink: '#f1efe7', accent: '#ff7a3d', soft: '#8fb3c9' },
      mark: '<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="11"/><path d="M12 56c13-11 25-11 38 0s25 11 38 0" fill="none" stroke="currentColor" stroke-width="11"/>',
      poster: { lines: ['Summer', 'schedule'], sub: 'May 1 – Sep 30, 2025' },
      sign: ['3', 'Departures', 'Wayzata · Excelsior · Tonka Bay'],
      gallery: [
        { kind: 'board', caption: 'Identity board: the ring-and-wave mark, wordmark and four-color palette.' },
        { kind: 'signage', caption: 'Pier signage puts departures first and everything else second.' },
        { kind: 'poster', caption: 'Summer schedule poster for the piers and downtown Excelsior.' }
      ]
    },
    {
      id: 'fondo',
      client: 'Fondo',
      title: 'Saving, made legible',
      disciplines: ['digital'],
      year: 2025,
      sector: 'Fintech',
      location: 'Saint Paul',
      duration: '9 months',
      services: ['Product strategy', 'UX and UI design', 'Design system', 'App store assets'],
      summary: 'Fondo helps young households in Minnesota put money aside automatically. We designed its iOS and Android app and the design system its in-house team now builds on.',
      challenge: 'Fondo’s first app was accurate and unreadable. Every screen carried six numbers of equal weight, and the most common support question was “how much do I actually have?” The team needed an app that answered that at a glance, and a system its four developers could extend without a designer in the room.',
      approach: [
        { title: 'One number per screen', text: 'Each screen leads with a single figure set large in tabular numerals. Everything else is one tap away.' },
        { title: 'Plain-language money', text: 'We rewrote 340 strings with Fondo’s compliance team, replacing terms like “allocation” with words people actually say.' },
        { title: 'A system, not a kit', text: 'Forty-two components, documented with usage rules and live code examples, so new features look like they were always there.' }
      ],
      results: [
        { value: '4.8', label: 'App store rating, up from 3.9' },
        { value: '−52%', label: 'Support tickets about balances' },
        { value: '42', label: 'Components in the shared design system' }
      ],
      quote: { text: 'Raster made us remove things. The app does more now and shows less.', name: 'Mona Steiner', role: 'Head of product, Fondo' },
      credits: ['Matteo Sutter', 'Tobias Wyss', 'Céline Odermatt'],
      palette: { bg: '#e9e3d6', ink: '#1b1b19', accent: '#2f6b4f', soft: '#c9d8c5' },
      mark: '<rect x="16" y="16" width="68" height="18"/><rect x="16" y="41" width="46" height="18"/><rect x="16" y="66" width="24" height="18"/>',
      ui: { headline: 'Your savings', figure: '$12,480' },
      poster: { lines: ['Put a little', 'aside.'], sub: 'Saving on autopilot' },
      gallery: [
        { kind: 'screens', caption: 'The overview and goals screens, one figure each.' },
        { kind: 'mark', caption: 'The app icon, built from three stacked bars.' },
        { kind: 'poster', caption: 'Launch poster for Twin Cities light-rail platforms.' }
      ]
    },
    {
      id: 'halle-neun',
      client: 'Hall Nine',
      title: 'An identity that changes with every show',
      disciplines: ['identity', 'editorial'],
      year: 2024,
      sector: 'Culture',
      location: 'Two Harbors',
      duration: '7 months',
      services: ['Identity system', 'Exhibition graphics', 'Catalogs', 'Website art direction'],
      summary: 'Hall Nine is a contemporary art space in a former locomotive shop. Its identity is a fixed numeral and a flexible grid that each exhibition fills differently.',
      challenge: 'The hall shows six exhibitions a year, each with a different curator and artist. A rigid identity would fight the art, and no identity at all had left the space invisible in its own city. It needed one constant that could step back whenever the work needed it to.',
      approach: [
        { title: 'A numeral, not a logo', text: 'The 9 is drawn from one circle and one stroke. It is the only element that never changes.' },
        { title: 'A grid each show fills', text: 'Every exhibition gets its own color and image crop on the same nine-unit grid, so the posters change and still read as a series.' },
        { title: 'Catalogs on the same system', text: 'The catalog template uses two type sizes only. The hall’s own team now lays out a 96-page catalog in three weeks.' }
      ],
      results: [
        { value: '+61%', label: 'Visitors in the first year' },
        { value: '6', label: 'Exhibitions a year, one system' },
        { value: '3 wks', label: 'To lay out a 96-page catalog' }
      ],
      quote: { text: 'Every artist we have shown since has wanted to be on one of those posters.', name: 'Vera Gasser', role: 'Director, Hall Nine' },
      credits: ['Noemi Imhof', 'Selin Karaca'],
      palette: { bg: '#f2f0ea', ink: '#111111', accent: '#f2c230', soft: '#d3cec2' },
      mark: '<circle cx="46" cy="38" r="24" fill="none" stroke="currentColor" stroke-width="14"/><rect x="63" y="38" width="14" height="52"/>',
      poster: { lines: ['Material', 'Memory'], sub: 'Spring exhibition · Mar 14–Jun 2, 2024' },
      spread: { title: 'Material Memory', sub: 'Catalog no. 31' },
      gallery: [
        { kind: 'spread', caption: 'Exhibition catalog, 96 pages, lay-flat bound.' },
        { kind: 'poster', caption: 'Poster for the spring show, on the nine-unit grid.' },
        { kind: 'mark', caption: 'The numeral, drawn from one circle and one stroke.' }
      ]
    },
    {
      id: 'archiv-ost',
      client: 'Northland Archive',
      title: 'Forty years of climate records, findable',
      disciplines: ['digital'],
      year: 2024,
      sector: 'Research',
      location: 'Bemidji',
      duration: '11 months',
      services: ['UX research', 'Interface design', 'Data visualization', 'Front-end build'],
      summary: 'Northland Archive holds weather and snow measurements from 140 stations in northern Minnesota. We designed the public portal that lets researchers, journalists and schools find and download them.',
      challenge: 'The records were complete and nearly impossible to reach. Finding one station’s snow depth for one winter took eleven clicks and a PDF manual. The archive’s funding now depends on public use, so it had to work for people who are not climatologists.',
      approach: [
        { title: 'Start from questions', text: 'We interviewed 24 users and found that almost every search began with a place and a year, not a dataset name. Search now works that way.' },
        { title: 'Show the data first', text: 'Every series opens as a small chart, so people know they have the right one before they export it.' },
        { title: 'Built to last', text: 'Plain HTML, progressive enhancement and no tracking. The portal loads in under a second on a school laptop.' }
      ],
      results: [
        { value: '11 → 3', label: 'Clicks to a dataset download' },
        { value: '×4', label: 'Monthly downloads after launch' },
        { value: '0.8 s', label: 'Median page load' }
      ],
      quote: { text: 'For the first time, teachers are using our data in class. That was the whole point.', name: 'Dr. Peter Rohner', role: 'Head of archive, Northland Archive' },
      credits: ['Matteo Sutter', 'Tobias Wyss'],
      palette: { bg: '#1f2a26', ink: '#e6ede8', accent: '#9fd3b4', soft: '#47584f' },
      mark: '<circle cx="22" cy="22" r="9"/><circle cx="50" cy="22" r="9"/><circle cx="78" cy="22" r="9"/><circle cx="22" cy="50" r="9"/><circle cx="50" cy="50" r="14"/><circle cx="78" cy="50" r="9"/><circle cx="22" cy="78" r="9"/><circle cx="50" cy="78" r="9"/><circle cx="78" cy="78" r="4"/>',
      ui: { headline: 'Eagle Mountain · snow depth', figure: '1985–2024' },
      poster: { lines: ['Forty', 'winters'], sub: 'Open data from 140 stations' },
      gallery: [
        { kind: 'screens', caption: 'Station search and the series preview, before any download.' },
        { kind: 'mark', caption: 'The dot-matrix mark: one dot per station region.' },
        { kind: 'poster', caption: 'Poster for the public launch at the university library.' }
      ]
    },
    {
      id: 'moraene',
      client: 'Moraine',
      title: 'Outdoor gear, without the shouting',
      disciplines: ['identity'],
      year: 2023,
      sector: 'Retail',
      location: 'Ely',
      duration: '6 months',
      services: ['Brand strategy', 'Identity system', 'Packaging', 'Retail graphics'],
      summary: 'Moraine makes repairable outdoor clothing in northern Minnesota. We gave it a quiet, durable identity that sits as comfortably on a care label as on a storefront.',
      challenge: 'Outdoor brands compete by shouting: summit photography, extreme claims, neon. Moraine’s customers buy a jacket to keep it for fifteen years, and the brand needed to sound like that: calm, specific and honest about materials.',
      approach: [
        { title: 'Name the material', text: 'Every label leads with what the garment is made of and how to repair it. The brand voice grew out of those labels.' },
        { title: 'A mark from the landscape', text: 'The mark is the profile of a glacial moraine, reduced to a single shape that survives embroidery at half an inch.' },
        { title: 'Stone, not neon', text: 'The palette is taken from the rock around Ely. Rust is used once per surface, never more.' }
      ],
      results: [
        { value: '+44%', label: 'Online sales in the first year' },
        { value: '1 in 5', label: 'Orders that now include a repair kit' },
        { value: '½ in', label: 'Smallest embroidered mark' }
      ],
      quote: { text: 'Customers say the labels are the best thing about the jackets. We are choosing to take that as a compliment.', name: 'Gus Nyberg', role: 'Co-founder, Moraine' },
      credits: ['Noemi Imhof', 'Selin Karaca', 'Céline Odermatt'],
      palette: { bg: '#c8c3b7', ink: '#24221f', accent: '#a3492a', soft: '#e4e0d6' },
      mark: '<path d="M6 84 38 26l18 32 10-16 28 42Z"/>',
      poster: { lines: ['Made to', 'be mended.'], sub: 'Fall / Winter 2023' },
      sign: ['M', 'Repairs', 'Workshop open Tue–Sat'],
      gallery: [
        { kind: 'board', caption: 'Identity board with the moraine mark and the stone palette.' },
        { kind: 'poster', caption: 'Cover of the fall catalog.' },
        { kind: 'signage', caption: 'Blade sign for the repair workshop in Ely.' }
      ]
    },
    {
      id: 'kino-riff',
      client: 'Cine Riff',
      title: 'A movie theater you can find in the dark',
      disciplines: ['identity', 'wayfinding'],
      year: 2023,
      sector: 'Culture',
      location: 'Minneapolis',
      duration: '8 months',
      services: ['Identity system', 'Wayfinding', 'Ticketing UI', 'Print program'],
      summary: 'Cine Riff is a three-screen independent movie theater in a former printing plant. We designed its identity, its monthly program and a wayfinding system that works with the house lights down.',
      challenge: 'The screens are spread across two floors of an old printing plant, and latecomers regularly walked into the wrong film. The previous signs were beautiful and unlit. The owners wanted the building’s character kept and the confusion removed.',
      approach: [
        { title: 'Light as material', text: 'Screen numbers are back-lit and sized to be read from the far end of each hallway at 5 lux.' },
        { title: 'One arrow', text: 'A single arrow, cut from the mark, does all of the directional work on walls, floors and tickets.' },
        { title: 'A program you keep', text: 'The monthly program folds out into a poster. People pin it up at home, which is the best advertising a small theater can get.' }
      ],
      results: [
        { value: '0', label: 'Wrong-screen walk-ins reported in 2024' },
        { value: '3,000', label: 'Program posters printed each month' },
        { value: '5 lux', label: 'Light level the signs are designed for' }
      ],
      quote: { text: 'Our ushers used to spend half the evening redirecting people. Now they actually get to watch the films.', name: 'Lou Graber', role: 'Programmer and co-owner, Cine Riff' },
      credits: ['Noemi Imhof', 'Tobias Wyss', 'Céline Odermatt'],
      palette: { bg: '#3b1016', ink: '#f6e9dc', accent: '#ff5a3c', soft: '#6d2a30' },
      mark: '<path d="M14 14h72v72H14Z" fill="none" stroke="currentColor" stroke-width="10"/><path d="M38 32 66 50 38 68Z"/>',
      poster: { lines: ['Cine', 'Riff'], sub: 'Program · November 2023' },
      sign: ['2', 'Screen Two', 'Upstairs, then left'],
      gallery: [
        { kind: 'board', caption: 'Identity board: the play mark, its arrow and the night palette.' },
        { kind: 'signage', caption: 'Back-lit screen sign on the second floor.' },
        { kind: 'poster', caption: 'The monthly program, folded out.' }
      ]
    },
    {
      id: 'edition-hohl',
      client: 'Hohl Editions',
      title: 'A paperback series in 24 colors',
      disciplines: ['editorial'],
      year: 2022,
      sector: 'Publishing',
      location: 'Saint Paul',
      duration: '5 months',
      services: ['Series design', 'Typography', 'Cover system', 'Production'],
      summary: 'Hohl Editions publishes translated Central European fiction. We designed a paperback series where every title gets its own color and nothing else changes.',
      challenge: 'A small publisher cannot afford an illustrated cover for every book, and bookstores shelve translated fiction spine-out at the back. The series had to be recognizable from across a store and cheap to produce, twelve titles a year.',
      approach: [
        { title: 'Color is the cover', text: 'Each title gets one of 24 colors from a fixed set, so the shelf always looks like a series.' },
        { title: 'Type does the rest', text: 'Author and title are set in one size, top left, in the same position on every book. The translator is credited on the front.' },
        { title: 'A template, not a designer', text: 'The editors now produce covers themselves from a template with locked styles.' }
      ],
      results: [
        { value: '24', label: 'Titles in the series so far' },
        { value: '−70%', label: 'Cover cost per title' },
        { value: '31', label: 'Bookstores that gave the series its own shelf' }
      ],
      quote: { text: 'Readers collect the colors. We did not plan that, but we are not complaining.', name: 'Miriam Hohl', role: 'Publisher, Hohl Editions' },
      credits: ['Selin Karaca', 'Noemi Imhof'],
      palette: { bg: '#efe8da', ink: '#1d1d1b', accent: '#3c5a8a', soft: '#b9c9a4' },
      mark: '<rect x="16" y="16" width="14" height="68"/><path d="M42 16a34 34 0 0 1 0 68Z"/>',
      poster: { lines: ['The Salt', 'Hours'], sub: 'Novel · translated from the Czech' },
      spread: { title: 'The Salt Hours', sub: 'Hohl Editions · no. 17' },
      gallery: [
        { kind: 'spread', caption: 'Title spread: one size of type, generous margins.' },
        { kind: 'poster', caption: 'A cover from the series, color no. 17.' },
        { kind: 'mark', caption: 'The half-moon colophon on every spine.' }
      ]
    },
    {
      id: 'taktwerk',
      client: 'Beatwork',
      title: 'Lesson planning for forty music schools',
      disciplines: ['digital'],
      year: 2022,
      sector: 'Education',
      location: 'Rochester',
      duration: '10 months',
      services: ['UX research', 'Interface design', 'Design system', 'Usability testing'],
      summary: 'Beatwork is the scheduling platform used by 40 community music schools. We redesigned the web app teachers use to plan lessons, rooms and recitals.',
      challenge: 'Music teachers plan around rooms, instruments and the school schedules of hundreds of children. The old tool was a spreadsheet with a login. Teachers kept paper planners alongside it, and two schools were close to leaving.',
      approach: [
        { title: 'Sit in on lessons', text: 'We spent two weeks in four schools, watching how teachers actually plan, including in the five minutes between lessons.' },
        { title: 'The week is the interface', text: 'Everything happens on one week view. Dragging a lesson checks the room, the instrument and the student’s school day in one move.' },
        { title: 'Test with real schedules', text: 'Every iteration was tested on a copy of a real school’s data, clashes and all.' }
      ],
      results: [
        { value: '−6 h', label: 'Planning time per teacher, per semester' },
        { value: '40', label: 'Schools, none lost since launch' },
        { value: '92%', label: 'Of teachers use it every week' }
      ],
      quote: { text: 'Our teachers stopped carrying two planners. I did not know that was possible.', name: 'Rachel Wenger', role: 'Director, River Valley School of Music' },
      credits: ['Matteo Sutter', 'Tobias Wyss', 'Selin Karaca'],
      palette: { bg: '#d8d2f3', ink: '#18162a', accent: '#4b3bd1', soft: '#f2f0fb' },
      mark: '<rect x="12" y="40" width="12" height="44"/><rect x="34" y="16" width="12" height="68"/><rect x="56" y="52" width="12" height="32"/><rect x="78" y="28" width="12" height="56"/>',
      ui: { headline: 'Week of Nov 9', figure: '28 lessons' },
      poster: { lines: ['Recital', 'season'], sub: 'Template for 40 schools' },
      gallery: [
        { kind: 'screens', caption: 'The week view on desktop and on a teacher’s phone.' },
        { kind: 'mark', caption: 'The rhythm mark: four bars, one beat.' },
        { kind: 'poster', caption: 'Recital poster template the schools fill in themselves.' }
      ]
    },
    {
      id: 'ostwind-velo',
      client: 'Eastwind Bikes',
      title: 'A co-op identity built from a wheel',
      disciplines: ['identity'],
      year: 2021,
      sector: 'Mobility',
      location: 'Saint Paul',
      duration: '4 months',
      services: ['Identity system', 'Signage', 'Stencils and stamps', 'Website design'],
      summary: 'Eastwind Bikes is a worker-owned bicycle repair co-op with two workshops. We designed an identity the members apply themselves with a stencil, a stamp and one typeface.',
      challenge: 'The co-op had no budget for a print shop and nine members with opinions. The identity had to be cheap to reproduce by hand, hard to get wrong, and agreed on by all nine.',
      approach: [
        { title: 'Design the tools', text: 'We designed the stencil, the rubber stamp and the sticker before the guidelines. If it could not be made by hand in the workshop, it was not part of the identity.' },
        { title: 'Decide together', text: 'Three workshops with all nine members and one vote at the end. It passed nine to nothing.' },
        { title: 'Green, cream, one yellow', text: 'Three colors, chosen to survive a photocopier and a muddy bike.' }
      ],
      results: [
        { value: '9–0', label: 'The members’ vote' },
        { value: '$380', label: 'Cost of the stencil and stamp set' },
        { value: '2', label: 'Workshops re-signed by the members themselves' }
      ],
      quote: { text: 'It is the only logo I have ever seen that our mechanics actually like.', name: 'Fatima Berisha', role: 'Member, Eastwind Bikes' },
      credits: ['Noemi Imhof', 'Matteo Sutter'],
      palette: { bg: '#2e5a3c', ink: '#f3f1e8', accent: '#e6c84a', soft: '#8aa88f' },
      mark: '<circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="9"/><path d="M50 12v76M12 50h76M23 23l54 54M77 23 23 77" stroke="currentColor" stroke-width="5"/><circle cx="50" cy="50" r="11"/>',
      poster: { lines: ['Spring', 'tune-up'], sub: 'From $75 · both workshops' },
      gallery: [
        { kind: 'board', caption: 'Identity board: the wheel mark, stencil letters and the three colors.' },
        { kind: 'mark', caption: 'The wheel mark, cut as a stencil.' },
        { kind: 'poster', caption: 'Spring tune-up poster, printed on a borrowed risograph.' }
      ]
    }
  ];

  /* ---------- Brief estimator (services.html) ----------
     Indicative ranges in US dollars and weeks. Edit these to match your studio.
     The same keys are used by the inquiry form (contact.html?services=identity,website). */
  var SCOPE = {
    strategy: { label: 'Brand strategy', cost: [12000, 18000], weeks: [3, 4] },
    identity: { label: 'Identity system', cost: [28000, 45000], weeks: [6, 9] },
    website: { label: 'Website', cost: [35000, 60000], weeks: [8, 12] },
    product: { label: 'Digital product', cost: [45000, 80000], weeks: [10, 16] },
    editorial: { label: 'Editorial and print', cost: [10000, 22000], weeks: [4, 6] },
    wayfinding: { label: 'Wayfinding and signage', cost: [20000, 38000], weeks: [6, 10] }
  };
  var SCALE = {
    focused: { label: 'Focused', mult: 0.75, pace: 0.8 },
    standard: { label: 'Standard', mult: 1, pace: 1 },
    extensive: { label: 'Extensive', mult: 1.4, pace: 1.3 }
  };
  var URGENCY = {
    relaxed: { label: 'Relaxed', mult: 0.95, pace: 1.2 },
    standard: { label: 'Standard', mult: 1, pace: 1 },
    priority: { label: 'Priority', mult: 1.2, pace: 0.8 }
  };
  /* Budget bands offered in the inquiry form; the estimator picks one from its midpoint. */
  var BUDGETS = [
    { key: 'under-30', label: 'Under $30,000', max: 30000 },
    { key: '30-60', label: '$30,000–$60,000', max: 60000 },
    { key: '60-120', label: '$60,000–$120,000', max: 120000 },
    { key: '120-plus', label: 'Over $120,000', max: Infinity }
  ];
  var DEFAULT_BRIEF = { scope: ['identity', 'website'], scale: 'standard', urgency: 'standard' };

  /* Studio hours for the open/closed note on the contact page (America/Chicago time).
     Day 0 is Sunday; hours are 24-hour decimals. */
  var STUDIO_HOURS = { tz: 'America/Chicago', days: [1, 2, 3, 4], open: 9, close: 18 };

  /* localStorage keys */
  var VIEW_KEY = 'studio-work-view';
  var BRIEF_KEY = 'studio-brief-v1';

  /* =====================================================================
     HELPERS
     ===================================================================== */
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function plural(n, one, many) { return n === 1 ? one : many; }
  // A short reference for the inquiry confirmation, like RA-7K2Q (no 0/O or 1/I to misread).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  // 41000 -> "41,000" (comma thousands separator)
  function chf(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function store(key, value) { try { safeStorage.setItem(key, value); } catch (e) {} }
  function read(key) { try { return safeStorage.getItem(key); } catch (e) { return null; } }
  function setParams(params) {
    var qs = params.toString();
    try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash); } catch (e) {}
  }
  function findProject(id) {
    for (var i = 0; i < PROJECTS.length; i++) if (PROJECTS[i].id === id) return i;
    return -1;
  }

  /* =====================================================================
     PROJECT ARTWORK (inline SVG for the case study gallery)
     Every function takes a project and returns an SVG string drawn in its palette.
     ===================================================================== */
  var SANS = 'Host Grotesk, Helvetica Neue, Arial, sans-serif';
  var MONO = 'Fragment Mono, ui-monospace, Menlo, monospace';
  function svgOpen(w, h, label) {
    return '<svg viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + esc(label) + '" class="block h-auto w-full" preserveAspectRatio="xMidYMid slice">';
  }
  function markAt(p, x, y, size, color) {
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + (size / 100) + ')" fill="' + color + '" color="' + color + '">' + p.mark + '</g>';
  }
  function gridLines(w, h, step, color, opacity) {
    var s = '<g stroke="' + color + '" stroke-opacity="' + opacity + '" stroke-width="1">';
    for (var x = step; x < w; x += step) s += '<path d="M' + x + ' 0V' + h + '"/>';
    for (var y = step; y < h; y += step) s += '<path d="M0 ' + y + 'H' + w + '"/>';
    return s + '</g>';
  }
  function textLines(x, y, widths, gap, color, opacity) {
    var s = '';
    widths.forEach(function (w, i) { s += '<rect x="' + x + '" y="' + (y + i * gap) + '" width="' + w + '" height="6" fill="' + color + '" fill-opacity="' + (opacity || 1) + '"/>'; });
    return s;
  }

  var ART = {
    /* Wide 1600 x 900: mark, wordmark and swatches */
    board: function (p, label) {
      var c = p.palette;
      var s = svgOpen(1600, 900, label) + '<rect width="1600" height="900" fill="' + c.bg + '"/>' + gridLines(1600, 900, 100, c.ink, 0.07);
      s += '<rect x="100" y="100" width="600" height="700" fill="' + c.ink + '" fill-opacity=".06"/>';
      s += markAt(p, 200, 250, 400, c.ink);
      s += '<text x="800" y="330" font-family="' + SANS + '" font-size="118" font-weight="600" letter-spacing="-5" fill="' + c.ink + '">' + esc(p.client) + '</text>';
      s += '<text x="806" y="390" font-family="' + MONO + '" font-size="20" letter-spacing="1" fill="' + c.ink + '" fill-opacity=".7">' + esc(p.services[0].toUpperCase()) + ' · ' + p.year + '</text>';
      var sw = [c.ink, c.accent, c.soft, c.bg];
      sw.forEach(function (col, i) {
        var x = 800 + i * 175;
        s += '<rect x="' + x + '" y="500" width="150" height="200" fill="' + col + '"' + (i === 3 ? ' stroke="' + c.ink + '" stroke-opacity=".35"' : '') + '/>';
        s += '<text x="' + x + '" y="740" font-family="' + MONO + '" font-size="18" fill="' + c.ink + '" fill-opacity=".75">' + col.toUpperCase() + '</text>';
      });
      return s + '</svg>';
    },
    /* Wide 1600 x 900: a browser window and a phone */
    screens: function (p, label) {
      var c = p.palette, ui = p.ui || { headline: p.client, figure: '' };
      var paper = '#fbfaf7', dark = '#171716';
      var s = svgOpen(1600, 900, label) + '<rect width="1600" height="900" fill="' + c.bg + '"/>';
      // browser
      s += '<rect x="120" y="130" width="980" height="640" fill="' + paper + '"/><rect x="120" y="130" width="980" height="44" fill="' + dark + '" fill-opacity=".08"/>';
      s += '<circle cx="146" cy="152" r="6" fill="' + dark + '" fill-opacity=".25"/><circle cx="168" cy="152" r="6" fill="' + dark + '" fill-opacity=".25"/><circle cx="190" cy="152" r="6" fill="' + dark + '" fill-opacity=".25"/>';
      s += markAt(p, 160, 210, 40, c.accent);
      s += '<text x="216" y="240" font-family="' + SANS + '" font-size="22" font-weight="600" fill="' + dark + '">' + esc(p.client) + '</text>';
      s += textLines(820, 226, [60], 0, dark, 0.35) + textLines(900, 226, [60], 0, dark, 0.35) + textLines(980, 226, [80], 0, dark, 0.35);
      s += '<text x="160" y="330" font-family="' + MONO + '" font-size="16" fill="' + dark + '" fill-opacity=".6">' + esc(ui.headline.toUpperCase()) + '</text>';
      s += '<text x="156" y="430" font-family="' + SANS + '" font-size="104" font-weight="500" letter-spacing="-4" fill="' + dark + '">' + esc(ui.figure) + '</text>';
      // bar chart
      var bars = [0.45, 0.6, 0.38, 0.72, 0.55, 0.8, 0.66, 0.9, 0.74, 0.58, 0.84, 0.95];
      bars.forEach(function (b, i) {
        var h = Math.round(220 * b);
        s += '<rect x="' + (160 + i * 46) + '" y="' + (720 - h) + '" width="30" height="' + h + '" fill="' + (i === 11 ? c.accent : dark) + '" fill-opacity="' + (i === 11 ? 1 : 0.14) + '"/>';
      });
      s += '<rect x="740" y="480" width="320" height="110" fill="' + c.soft + '"/>' + textLines(764, 508, [180, 120], 22, dark, 0.55);
      s += '<rect x="740" y="610" width="320" height="110" fill="' + dark + '" fill-opacity=".05"/>' + textLines(764, 638, [210, 90], 22, dark, 0.4);
      // phone
      s += '<rect x="1180" y="100" width="320" height="680" rx="44" fill="' + dark + '"/><rect x="1194" y="114" width="292" height="652" rx="32" fill="' + paper + '"/>';
      s += '<rect x="1300" y="128" width="80" height="18" rx="9" fill="' + dark + '"/>';
      s += '<text x="1222" y="214" font-family="' + MONO + '" font-size="13" fill="' + dark + '" fill-opacity=".6">' + esc(ui.headline.toUpperCase()) + '</text>';
      s += '<circle cx="1340" cy="360" r="96" fill="none" stroke="' + dark + '" stroke-opacity=".1" stroke-width="22"/>';
      s += '<circle cx="1340" cy="360" r="96" fill="none" stroke="' + c.accent + '" stroke-width="22" stroke-dasharray="420 604" transform="rotate(-90 1340 360)"/>';
      s += '<text x="1340" y="372" text-anchor="middle" font-family="' + SANS + '" font-size="34" font-weight="600" letter-spacing="-1" fill="' + dark + '">70%</text>';
      [520, 590, 660].forEach(function (y, i) {
        s += '<rect x="1222" y="' + y + '" width="236" height="54" fill="' + (i === 0 ? c.soft : dark) + '" fill-opacity="' + (i === 0 ? 1 : 0.05) + '"/>' + textLines(1238, y + 18, [120, 70], 14, dark, 0.45);
      });
      return s + '</svg>';
    },
    /* Wide 1600 x 900: an open book */
    spread: function (p, label) {
      var c = p.palette, sp = p.spread || { title: p.client, sub: '' };
      var s = svgOpen(1600, 900, label) + '<rect width="1600" height="900" fill="#e4e1d9"/>';
      s += '<rect x="196" y="126" width="1220" height="680" fill="#000" fill-opacity=".08"/>';
      s += '<rect x="180" y="110" width="620" height="680" fill="#faf8f3"/><rect x="800" y="110" width="620" height="680" fill="#fdfcf8"/>';
      s += '<rect x="770" y="110" width="30" height="680" fill="#000" fill-opacity=".05"/><rect x="800" y="110" width="22" height="680" fill="#000" fill-opacity=".04"/>';
      s += '<rect x="180" y="110" width="620" height="680" fill="' + c.accent + '" fill-opacity=".92"/>';
      s += markAt(p, 380, 330, 220, c.bg);
      s += '<text x="880" y="210" font-family="' + SANS + '" font-size="46" font-weight="500" letter-spacing="-1.5" fill="#1b1b1a">' + esc(sp.title) + '</text>';
      s += '<text x="882" y="250" font-family="' + MONO + '" font-size="15" fill="#1b1b1a" fill-opacity=".6">' + esc(sp.sub.toUpperCase()) + '</text>';
      for (var col = 0; col < 2; col++) {
        var widths = [];
        for (var i = 0; i < 16; i++) widths.push(i % 6 === 5 ? 120 : 228 - ((i * 37) % 40));
        s += textLines(880 + col * 270, 360, widths, 22, '#1b1b1a', 0.32);
      }
      s += '<text x="1340" y="760" text-anchor="end" font-family="' + MONO + '" font-size="14" fill="#1b1b1a" fill-opacity=".55">7</text>';
      return s + '</svg>';
    },
    /* Tall 800 x 1000: a poster with a cropped mark */
    poster: function (p, label) {
      var c = p.palette, po = p.poster;
      var s = svgOpen(800, 1000, label) + '<rect width="800" height="1000" fill="#d9d8d2"/>';
      s += '<rect x="120" y="70" width="560" height="790" fill="' + c.bg + '"/>';
      s += '<clipPath id="poster-' + p.id + '"><rect x="120" y="70" width="560" height="790"/></clipPath>';
      s += '<g clip-path="url(#poster-' + p.id + ')">' + markAt(p, 300, 300, 560, c.accent) + '</g>';
      po.lines.forEach(function (line, i) {
        s += '<text x="150" y="' + (160 + i * 64) + '" font-family="' + SANS + '" font-size="66" font-weight="600" letter-spacing="-2.5" fill="' + c.ink + '">' + esc(line) + '</text>';
      });
      s += '<text x="152" y="826" font-family="' + MONO + '" font-size="15" fill="' + c.ink + '">' + esc(po.sub.toUpperCase()) + '</text>';
      s += '<text x="648" y="826" text-anchor="end" font-family="' + SANS + '" font-size="18" font-weight="600" fill="' + c.ink + '">' + esc(p.client) + '</text>';
      s += '<rect x="120" y="860" width="560" height="16" fill="#000" fill-opacity=".07"/>';
      return s + '</svg>';
    },
    /* Tall 800 x 1000: a hanging sign on a wall */
    signage: function (p, label) {
      var c = p.palette, sg = p.sign || [p.client, '', ''];
      var s = svgOpen(800, 1000, label) + '<rect width="800" height="1000" fill="#cfcdc6"/><rect y="820" width="800" height="180" fill="#bab7af"/>';
      s += '<path d="M280 0v190M520 0v190" stroke="#3a3a37" stroke-width="5"/>';
      s += '<rect x="170" y="190" width="460" height="520" fill="' + c.bg + '"/><rect x="170" y="700" width="460" height="10" fill="#000" fill-opacity=".18"/>';
      s += '<text x="210" y="420" font-family="' + SANS + '" font-size="230" font-weight="600" letter-spacing="-10" fill="' + c.ink + '">' + esc(sg[0]) + '</text>';
      s += '<g transform="translate(470 300)"><circle r="64" fill="' + c.accent + '"/><path d="M-26 0h50M4-24 28 0 4 24" fill="none" stroke="' + c.bg + '" stroke-width="12"/></g>';
      s += '<path d="M210 480h380" stroke="' + c.ink + '" stroke-opacity=".3" stroke-width="2"/>';
      s += '<text x="210" y="560" font-family="' + SANS + '" font-size="54" font-weight="600" letter-spacing="-1.5" fill="' + c.ink + '">' + esc(sg[1]) + '</text>';
      s += '<text x="212" y="620" font-family="' + MONO + '" font-size="18" fill="' + c.ink + '" fill-opacity=".8">' + esc(sg[2].toUpperCase()) + '</text>';
      s += markAt(p, 548, 630, 42, c.ink);
      s += '<ellipse cx="400" cy="900" rx="250" ry="18" fill="#000" fill-opacity=".08"/>';
      return s + '</svg>';
    },
    /* Tall 800 x 1000: the mark with its construction lines */
    mark: function (p, label) {
      var c = p.palette;
      var s = svgOpen(800, 1000, label) + '<rect width="800" height="1000" fill="' + c.accent + '"/>';
      s += '<g fill="none" stroke="' + c.bg + '" stroke-opacity=".35" stroke-width="1.5">';
      s += '<rect x="160" y="260" width="480" height="480"/><path d="M160 500h480M400 260v480M160 260l480 480M640 260 160 740"/><circle cx="400" cy="500" r="240"/><circle cx="400" cy="500" r="120"/>';
      s += '</g>' + markAt(p, 160, 260, 480, c.bg);
      s += '<text x="60" y="100" font-family="' + MONO + '" font-size="18" fill="' + c.bg + '">' + esc(p.client.toUpperCase()) + ' / MARK</text>';
      s += '<text x="740" y="940" text-anchor="end" font-family="' + MONO + '" font-size="18" fill="' + c.bg + '">100 × 100 UNITS</text>';
      return s + '</svg>';
    }
  };

  /* Case study markup. project.html contains this output for the first project, so the page
     reads fine without JavaScript; with JavaScript it is re-rendered for ?id=. */
  function renderProject(p, i) {
    var prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length];
    var next = PROJECTS[(i + 1) % PROJECTS.length];
    var disc = p.disciplines.map(function (d) { return DISCIPLINES[d]; }).join(', ');
    var h = '';
    h += '<header class="wrap pt-12 pb-10 sm:pt-20 sm:pb-14">';
    h += '<nav aria-label="Breadcrumb" class="label"><ol class="flex flex-wrap items-center gap-2"><li><a class="link-under" href="work.html">Work</a></li><li aria-hidden="true">/</li><li aria-current="page" class="text-ink">' + esc(p.client) + '</li></ol></nav>';
    h += '<div class="grid-12 mt-10 gap-y-8">';
    h += '<div class="col-span-4 sm:col-span-12 lg:col-span-9"><p class="text-lg font-medium text-ink sm:text-xl">' + esc(p.client) + '</p>';
    h += '<h1 class="display mt-3 text-[2.6rem] sm:text-6xl xl:text-[5.5rem]">' + esc(p.title) + '</h1></div>';
    h += '</div>';
    h += '<dl class="mt-12 grid grid-cols-2 gap-x-6 gap-y-6 border-t border-ink pt-5 sm:grid-cols-4">';
    [['Year', p.year], ['Discipline', disc], ['Sector', p.sector + ', ' + p.location], ['Duration', p.duration]].forEach(function (row) {
      h += '<div><dt class="label">' + row[0] + '</dt><dd class="mt-1.5 text-ink">' + esc(row[1]) + '</dd></div>';
    });
    h += '</dl></header>';

    h += '<div class="wrap"><figure class="cover aspect-[4/3] sm:aspect-[16/9]"><img src="assets/img/work/' + p.id + '.svg" alt="' + esc(p.client + ' project cover') + '" width="800" height="600" class="!object-cover"></figure></div>';

    h += '<section class="wrap grid-12 gap-y-6 py-20 sm:py-28" aria-labelledby="cs-overview">';
    h += '<h2 id="cs-overview" class="label col-span-4 sm:col-span-3">Overview</h2>';
    h += '<div class="col-span-4 sm:col-span-9 lg:col-span-7"><p class="lead">' + esc(p.summary) + '</p>';
    h += '<ul class="mt-8 flex flex-wrap gap-2" aria-label="Services">';
    p.services.forEach(function (s) { h += '<li class="rounded-full border border-rule px-3 py-1 text-sm text-mute">' + esc(s) + '</li>'; });
    h += '</ul></div></section>';

    h += '<section class="wrap grid-12 gap-y-6 border-t border-rule py-16 sm:py-24" aria-labelledby="cs-challenge">';
    h += '<h2 id="cs-challenge" class="label col-span-4 sm:col-span-3">The challenge</h2>';
    h += '<p class="col-span-4 text-lg leading-relaxed text-ink sm:col-span-9 lg:col-span-7">' + esc(p.challenge) + '</p></section>';

    h += '<section class="wrap" aria-label="Project images"><div class="grid gap-6 sm:grid-cols-2">';
    p.gallery.forEach(function (g, gi) {
      var wide = gi === 0;
      h += '<figure class="' + (wide ? 'sm:col-span-2' : '') + '"><div class="overflow-hidden bg-tint">' + ART[g.kind](p, g.caption) + '</div>';
      h += '<figcaption class="mt-3 flex gap-3 text-sm text-mute"><span class="idx">' + ('0' + (gi + 1)) + '</span>' + esc(g.caption) + '</figcaption></figure>';
    });
    h += '</div></section>';

    h += '<section class="wrap grid-12 gap-y-6 py-20 sm:py-28" aria-labelledby="cs-approach">';
    h += '<h2 id="cs-approach" class="label col-span-4 sm:col-span-3">Approach</h2>';
    h += '<ol class="col-span-4 border-t border-ink sm:col-span-9">';
    p.approach.forEach(function (a, ai) {
      h += '<li class="grid gap-2 border-b border-rule py-6 sm:grid-cols-[3rem_1fr_1.4fr] sm:gap-6"><span class="idx pt-1">0' + (ai + 1) + '</span><h3 class="text-xl font-medium tracking-[-0.01em] text-ink">' + esc(a.title) + '</h3><p class="leading-relaxed text-mute">' + esc(a.text) + '</p></li>';
    });
    h += '</ol></section>';

    h += '<section class="bg-ink text-paper" aria-labelledby="cs-results"><div class="wrap py-20 sm:py-28">';
    h += '<h2 id="cs-results" class="label text-paper/70">Results</h2>';
    h += '<dl class="mt-10 grid gap-10 sm:grid-cols-3 sm:gap-6">';
    p.results.forEach(function (r) {
      h += '<div class="flex flex-col border-t border-paper/25 pt-5"><dt class="order-2 mt-3 max-w-[16rem] text-paper/70">' + esc(r.label) + '</dt><dd class="order-1 text-5xl font-medium tracking-[-0.04em] sm:text-6xl tnum">' + esc(r.value) + '</dd></div>';
    });
    h += '</dl>';
    h += '<figure class="mt-20 max-w-4xl sm:mt-28"><blockquote><p class="text-2xl leading-snug font-medium tracking-[-0.02em] sm:text-4xl">“' + esc(p.quote.text) + '”</p></blockquote>';
    h += '<figcaption class="mt-6 flex items-center gap-3 text-paper/70"><span class="dot"></span>' + esc(p.quote.name) + ', ' + esc(p.quote.role) + '</figcaption></figure>';
    h += '</div></section>';

    h += '<section class="wrap grid-12 gap-y-6 py-16 sm:py-20" aria-labelledby="cs-credits">';
    h += '<h2 id="cs-credits" class="label col-span-4 sm:col-span-3">Credits</h2>';
    h += '<p class="col-span-4 text-ink sm:col-span-9">' + p.credits.map(esc).join(', ') + ' — for ' + esc(p.client) + ', ' + esc(p.location) + ', ' + p.year + '.</p></section>';

    h += '<nav class="border-t border-ink" aria-label="More projects"><div class="wrap grid sm:grid-cols-2">';
    h += '<a href="project.html?id=' + prev.id + '" class="group flex items-center gap-5 border-b border-rule py-8 sm:border-r sm:border-b-0 sm:pr-8"><span class="cover aspect-[4/3] w-24 shrink-0 sm:w-32"><img src="assets/img/work/' + prev.id + '.svg" alt="" width="800" height="600"></span><span><span class="label block">Previous project</span><span class="mt-1 block text-xl font-medium tracking-[-0.02em] text-ink sm:text-2xl">' + esc(prev.client) + '</span></span></a>';
    h += '<a href="project.html?id=' + next.id + '" class="group flex items-center justify-end gap-5 py-8 text-right sm:pl-8"><span><span class="label block">Next project</span><span class="mt-1 block text-xl font-medium tracking-[-0.02em] text-ink sm:text-2xl">' + esc(next.client) + '</span></span><span class="cover aspect-[4/3] w-24 shrink-0 sm:w-32"><img src="assets/img/work/' + next.id + '.svg" alt="" width="800" height="600"></span></a>';
    h += '</div></nav>';
    return h;
  }

  /* =====================================================================
     HEADER: mobile menu
     ===================================================================== */
  var menuBtn = document.getElementById('menu-button');
  var menu = document.getElementById('mobile-menu');
  if (menuBtn && menu) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.querySelector('[data-menu-label]').textContent = open ? 'Close' : 'Menu';
      menu.classList.toggle('hidden', !open);
      document.documentElement.classList.toggle('overflow-hidden', open);
    };
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.matchMedia('(min-width: 64rem)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* =====================================================================
     SAINT PAUL CLOCK: <span data-clock>2:32 PM</span> anywhere on the page
     ===================================================================== */
  var clocks = $$('[data-clock]');
  var openNote = document.querySelector('[data-studio-status]');
  if (clocks.length || openNote) {
    var timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: STUDIO_HOURS.tz, hour: 'numeric', minute: '2-digit', hour12: true });
    var attrFmt = new Intl.DateTimeFormat('en-US', { timeZone: STUDIO_HOURS.tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    var partsFmt = new Intl.DateTimeFormat('en-US', { timeZone: STUDIO_HOURS.tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false });
    var DAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    var tickClock = function () {
      var now = new Date();
      var t = timeFmt.format(now);
      clocks.forEach(function (el) { el.textContent = t; el.setAttribute('datetime', attrFmt.format(now)); });
      if (openNote) {
        var parts = {};
        partsFmt.formatToParts(now).forEach(function (pt) { parts[pt.type] = pt.value; });
        var hour = (Number(parts.hour) % 24) + Number(parts.minute) / 60;
        var open = STUDIO_HOURS.days.indexOf(DAYS[parts.weekday]) !== -1 && hour >= STUDIO_HOURS.open && hour < STUDIO_HOURS.close;
        openNote.textContent = open ? 'The studio is open now. We usually reply within a business day.' : 'The studio is closed right now. We’ll reply on the next business day.';
        openNote.setAttribute('data-open', String(open));
      }
    };
    tickClock();
    setInterval(tickClock, 15000);
  }

  /* =====================================================================
     SCROLL REVEALS
     .reveal fades in, .rise lifts headline lines. Everything above an element that
     becomes visible is revealed too, so fast jumps never leave gaps.
     ===================================================================== */
  var reveals = $$('.reveal, .rise, .fill-bar');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = reveals.indexOf(entry.target);
        reveals.slice(0, index + 1).forEach(function (el) { el.classList.add('is-visible'); io.unobserve(el); });
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* Count-up numbers: <span data-count="140">140</span>. The HTML holds the final value. */
  var counters = $$('[data-count]');
  if (counters.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
    var countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        countIo.unobserve(el);
        var end = parseFloat(el.getAttribute('data-count'));
        var start = null;
        var tick = function (now) {
          if (start === null) start = now;
          var p = Math.min(1, (now - start) / 1200);
          el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4)));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { el.textContent = '0'; countIo.observe(el); });
  }

  /* =====================================================================
     WORK INDEX (work.html): discipline filter, year sort, grid/list view,
     live count and the hover/focus preview in list view.
     ===================================================================== */
  var workRoot = document.querySelector('[data-work]');
  if (workRoot) {
    var list = workRoot.querySelector('[data-work-list]');
    var items = $$('[data-project]', list);
    var chips = $$('[data-filter]', workRoot);
    var sortSel = workRoot.querySelector('[data-sort]');
    var viewBtns = $$('[data-view-btn]', workRoot);
    var countEl = workRoot.querySelector('[data-work-count]');
    var emptyEl = workRoot.querySelector('[data-work-empty]');
    var preview = workRoot.querySelector('[data-work-preview]');
    var previewImg = preview.querySelector('img');
    var params = new URLSearchParams(location.search);
    var filter = params.get('discipline');
    if (!DISCIPLINES.hasOwnProperty(filter)) filter = 'all';
    var sort = params.get('sort') === 'oldest' ? 'oldest' : 'newest';
    var view = read(VIEW_KEY) === 'list' ? 'list' : 'grid';

    var applyWork = function () {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === filter)); });
      sortSel.value = sort;
      var shown = 0;
      items.slice().sort(function (a, b) {
        var d = Number(b.getAttribute('data-year')) - Number(a.getAttribute('data-year'));
        if (sort === 'oldest') d = -d;
        return d || Number(a.getAttribute('data-order')) - Number(b.getAttribute('data-order'));
      }).forEach(function (li) {
        list.appendChild(li);
        var match = filter === 'all' || li.getAttribute('data-disciplines').split(' ').indexOf(filter) !== -1;
        li.hidden = !match;
        if (match) shown++;
      });
      var noun = plural(shown, 'project', 'projects');
      countEl.textContent = shown === items.length ? 'Showing all ' + shown + ' ' + noun : 'Showing ' + shown + ' of ' + items.length + ' projects';
      emptyEl.hidden = shown > 0;
      var q = new URLSearchParams();
      if (filter !== 'all') q.set('discipline', filter);
      if (sort !== 'newest') q.set('sort', sort);
      setParams(q);
    };
    var applyView = function () {
      list.setAttribute('data-view', view);
      viewBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view-btn') === view)); });
      hidePreview();
    };

    chips.forEach(function (c) { c.addEventListener('click', function () { filter = c.getAttribute('data-filter'); applyWork(); }); });
    sortSel.addEventListener('change', function () { sort = sortSel.value === 'oldest' ? 'oldest' : 'newest'; applyWork(); });
    viewBtns.forEach(function (b) {
      b.addEventListener('click', function () { view = b.getAttribute('data-view-btn'); store(VIEW_KEY, view); applyView(); });
    });
    workRoot.querySelector('[data-work-reset]').addEventListener('click', function () { filter = 'all'; applyWork(); chips[0].focus(); });

    /* Preview: follows the pointer on hover; sits beside the row on keyboard focus. */
    var canPreview = window.matchMedia('(min-width: 48rem)');
    function hidePreview() { preview.classList.remove('is-on'); }
    function showPreview(li, x, y) {
      if (list.getAttribute('data-view') !== 'list' || !canPreview.matches) return;
      var src = li.querySelector('img').getAttribute('src');
      if (previewImg.getAttribute('src') !== src) previewImg.setAttribute('src', src);
      var w = preview.offsetWidth, h = preview.offsetHeight;
      x = Math.min(Math.max(16, x), window.innerWidth - w - 16);
      y = Math.min(Math.max(16, y), window.innerHeight - h - 16);
      preview.style.setProperty('--x', x + 'px');
      preview.style.setProperty('--y', y + 'px');
      preview.classList.add('is-on');
    }
    items.forEach(function (li) {
      var link = li.querySelector('a');
      link.addEventListener('pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        showPreview(li, e.clientX + 28, e.clientY - preview.offsetHeight / 2);
      });
      link.addEventListener('pointerleave', hidePreview);
      link.addEventListener('focus', function () {
        if (!link.matches(':focus-visible')) return;
        var r = link.getBoundingClientRect();
        showPreview(li, r.left + r.width * 0.42, r.top + r.height / 2 - preview.offsetHeight / 2);
      });
      link.addEventListener('blur', hidePreview);
    });
    window.addEventListener('scroll', hidePreview, { passive: true });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') hidePreview(); });

    applyView();
    applyWork();
  }

  /* =====================================================================
     CASE STUDY (project.html?id=)
     ===================================================================== */
  var caseRoot = document.querySelector('[data-case]');
  if (caseRoot) {
    var article = caseRoot.querySelector('[data-case-article]');
    var missing = caseRoot.querySelector('[data-case-missing]');
    var wanted = new URLSearchParams(location.search).get('id');
    var index = wanted ? findProject(wanted) : 0;
    if (index === -1) {
      // Swap in the not-found message and promote its heading to the page's only <h1>.
      article.remove();
      missing.hidden = false;
      var h2 = missing.querySelector('h2');
      var h1 = document.createElement('h1');
      h1.id = h2.id;
      h1.className = h2.className;
      h1.textContent = h2.textContent;
      h2.replaceWith(h1);
      document.title = 'Project not found — Raster';
    } else {
      var proj = PROJECTS[index];
      if (article.getAttribute('data-rendered') !== proj.id) {
        article.innerHTML = renderProject(proj, index);
        article.setAttribute('data-rendered', proj.id);
      }
      document.title = proj.client + ': ' + proj.title + ' — Raster';
      var desc = document.querySelector('meta[name="description"]');
      if (desc) desc.setAttribute('content', proj.summary);
    }
  }

  /* =====================================================================
     BRIEF ESTIMATOR (services.html)
     ===================================================================== */
  function readBrief() {
    var raw = null;
    try { raw = JSON.parse(read(BRIEF_KEY)); } catch (e) { raw = null; }
    var b = { scope: DEFAULT_BRIEF.scope.slice(), scale: DEFAULT_BRIEF.scale, urgency: DEFAULT_BRIEF.urgency };
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      if (Array.isArray(raw.scope)) {
        b.scope = raw.scope.filter(function (k, i, arr) { return typeof k === 'string' && SCOPE.hasOwnProperty(k) && arr.indexOf(k) === i; });
      }
      if (typeof raw.scale === 'string' && SCALE.hasOwnProperty(raw.scale)) b.scale = raw.scale;
      if (typeof raw.urgency === 'string' && URGENCY.hasOwnProperty(raw.urgency)) b.urgency = raw.urgency;
    }
    return b;
  }
  /* Budget: sum of the selected services × scale × urgency, rounded out to $1,000.
     Duration: the longest service plus half of the others (work overlaps), × scale and urgency pace. */
  function estimateBrief(b) {
    if (!b.scope.length) return null;
    var low = 0, high = 0, wl = [], wh = [];
    b.scope.forEach(function (k) { low += SCOPE[k].cost[0]; high += SCOPE[k].cost[1]; wl.push(SCOPE[k].weeks[0]); wh.push(SCOPE[k].weeks[1]); });
    var mult = SCALE[b.scale].mult * URGENCY[b.urgency].mult;
    var pace = SCALE[b.scale].pace * URGENCY[b.urgency].pace;
    var overlap = function (arr) {
      var max = Math.max.apply(null, arr), sum = arr.reduce(function (a, n) { return a + n; }, 0);
      return max + (sum - max) * 0.5;
    };
    low = Math.floor(low * mult / 1000) * 1000;
    high = Math.ceil(high * mult / 1000) * 1000;
    var weeks = [Math.max(2, Math.round(overlap(wl) * pace)), Math.max(3, Math.round(overlap(wh) * pace))];
    var mid = (low + high) / 2, band = BUDGETS[BUDGETS.length - 1].key;
    for (var i = 0; i < BUDGETS.length; i++) { if (mid < BUDGETS[i].max) { band = BUDGETS[i].key; break; } }
    return { low: low, high: high, weeks: weeks, band: band };
  }

  var estRoot = document.querySelector('[data-estimator]');
  if (estRoot) {
    var brief = readBrief();
    var out = {
      budget: estRoot.querySelector('[data-est-budget]'),
      weeks: estRoot.querySelector('[data-est-weeks]'),
      lines: estRoot.querySelector('[data-est-lines]'),
      count: estRoot.querySelector('[data-est-count]'),
      cta: estRoot.querySelector('[data-est-cta]'),
      empty: estRoot.querySelector('[data-est-empty]'),
      live: estRoot.querySelector('[data-est-live]')
    };
    var syncInputs = function () {
      $$('input[name="scope"]', estRoot).forEach(function (cb) { cb.checked = brief.scope.indexOf(cb.value) !== -1; });
      $$('input[name="scale"]', estRoot).forEach(function (r) { r.checked = r.value === brief.scale; });
      $$('input[name="urgency"]', estRoot).forEach(function (r) { r.checked = r.value === brief.urgency; });
    };
    var renderBrief = function () {
      var est = estimateBrief(brief);
      var n = brief.scope.length;
      out.count.textContent = n + ' ' + plural(n, 'service', 'services') + ' selected';
      out.empty.hidden = !!est;
      if (!est) {
        out.budget.textContent = '—';
        out.weeks.textContent = '—';
        out.lines.innerHTML = '';
        out.cta.setAttribute('href', 'contact.html');
        out.live.textContent = 'No services selected.';
        return;
      }
      out.budget.textContent = '$' + chf(est.low) + '–$' + chf(est.high);
      out.weeks.textContent = est.weeks[0] + '–' + est.weeks[1] + ' weeks';
      // Keep the breakdown in the order the services are listed on the page.
      out.lines.innerHTML = Object.keys(SCOPE).filter(function (k) { return brief.scope.indexOf(k) !== -1; }).map(function (k) {
        var s = SCOPE[k];
        return '<li class="flex justify-between gap-4 border-b border-rule py-2"><span>' + esc(s.label) + '</span><span class="tnum text-mute">' + chf(s.cost[0] / 1000) + '–' + chf(s.cost[1] / 1000) + 'k</span></li>';
      }).join('') +
        '<li class="flex justify-between gap-4 py-2 text-mute"><span>Scale: ' + SCALE[brief.scale].label + ' · Timeline: ' + URGENCY[brief.urgency].label + '</span><span class="tnum">×' + (SCALE[brief.scale].mult * URGENCY[brief.urgency].mult).toFixed(2) + '</span></li>';
      var q = new URLSearchParams();
      q.set('services', Object.keys(SCOPE).filter(function (k) { return brief.scope.indexOf(k) !== -1; }).join(','));
      q.set('budget', est.band);
      q.set('timeline', brief.urgency);
      out.cta.setAttribute('href', 'contact.html?' + q.toString().replace(/%2C/g, ','));
      out.live.textContent = 'Estimate updated: $' + chf(est.low) + ' to $' + chf(est.high) + ', ' + est.weeks[0] + ' to ' + est.weeks[1] + ' weeks.';
    };
    estRoot.addEventListener('change', function () {
      brief.scope = $$('input[name="scope"]:checked', estRoot).map(function (cb) { return cb.value; });
      var sc = estRoot.querySelector('input[name="scale"]:checked');
      var ur = estRoot.querySelector('input[name="urgency"]:checked');
      brief.scale = sc ? sc.value : DEFAULT_BRIEF.scale;
      brief.urgency = ur ? ur.value : DEFAULT_BRIEF.urgency;
      store(BRIEF_KEY, JSON.stringify(brief));
      renderBrief();
    });
    estRoot.querySelector('[data-est-reset]').addEventListener('click', function () {
      brief = { scope: DEFAULT_BRIEF.scope.slice(), scale: DEFAULT_BRIEF.scale, urgency: DEFAULT_BRIEF.urgency };
      try { safeStorage.removeItem(BRIEF_KEY); } catch (e) {}
      syncInputs();
      renderBrief();
    });
    syncInputs();
    renderBrief();
  }

  /* =====================================================================
     FORM VALIDATION HELPERS
     ===================================================================== */
  function errorFor(container, id, message, field) {
    var err = container.querySelector('#' + id);
    if (message) {
      if (!err) { err = document.createElement('p'); err.className = 'field-error'; err.id = id; container.appendChild(err); }
      err.textContent = message;
    } else if (err) {
      err.remove();
    }
    if (field) {
      var ids = (field.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== id; });
      if (message) ids.push(id);
      if (ids.length) field.setAttribute('aria-describedby', ids.join(' ')); else field.removeAttribute('aria-describedby');
      if (message) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
    }
  }
  function checkField(field) {
    var v = (field.value || '').trim();
    var msg = '';
    if (field.type === 'checkbox') { if (field.required && !field.checked) msg = 'Please check this box to continue.'; }
    else if (field.required && !v) msg = field.tagName === 'SELECT' ? 'Please choose an option.' : 'Please fill in this field.';
    else if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter an email address like name@example.com.';
    else if (field.type === 'url' && v && !/^https?:\/\/[^\s/$.?#][^\s]*\.[^\s]{2,}$/i.test(v)) msg = 'Enter a full link starting with https://';
    else if (field.minLength > 0 && v && v.length < field.minLength) msg = 'Please write at least ' + field.minLength + ' characters (' + v.length + ' so far).';
    errorFor(field.closest('[data-field]') || field.parentElement, (field.id || field.name) + '-error', msg, field);
    return !msg;
  }
  // Checkbox / radio groups: <fieldset data-group="services" data-min="1">
  function checkGroup(fs) {
    var name = fs.getAttribute('data-group');
    var ok = !!fs.querySelector('input:checked');
    var first = fs.querySelector('input');
    var msg = ok ? '' : (first.type === 'checkbox' ? 'Choose at least one option.' : 'Choose an option.');
    errorFor(fs, name + '-error', msg, null);
    if (ok) { fs.removeAttribute('aria-invalid'); fs.removeAttribute('aria-describedby'); }
    else { fs.setAttribute('aria-invalid', 'true'); fs.setAttribute('aria-describedby', name + '-error'); }
    return ok;
  }
  function liveValidate(scope) {
    // While a form button is being pressed, skip the blur check: an error appearing above the
    // button would push it down before mouse-up and swallow the click. The button validates anyway.
    var pressing = false, pressTimer;
    scope.addEventListener('pointerdown', function (e) {
      if (!e.target.closest || !e.target.closest('[data-next], [data-back], button[type=submit]')) return;
      pressing = true;
      window.clearTimeout(pressTimer);
      pressTimer = window.setTimeout(function () { pressing = false; }, 1000);
    }, true);
    scope.addEventListener('click', function () { pressing = false; }, true);
    $$('input:not([type=radio]):not([type=checkbox]), select, textarea', scope).forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value && !pressing) checkField(f); });
      f.addEventListener(f.tagName === 'SELECT' ? 'change' : 'input', function () { if (f.getAttribute('aria-invalid')) checkField(f); });
    });
    $$('input[type=checkbox][required]', scope).forEach(function (f) {
      f.addEventListener('change', function () { if (f.getAttribute('aria-invalid')) checkField(f); });
    });
    scope.addEventListener('change', function (e) {
      var fs = e.target.closest && e.target.closest('fieldset[data-group][aria-invalid]');
      if (fs) checkGroup(fs);
    });
  }
  function validate(scope) {
    var ok = true;
    $$('input:not([type=radio]):not([type=checkbox]), select, textarea, input[type=checkbox][required]', scope).forEach(function (f) { if (!checkField(f)) ok = false; });
    $$('fieldset[data-group]', scope).forEach(function (fs) { if (!checkGroup(fs)) ok = false; });
    if (!ok) {
      var first = scope.querySelector('[aria-invalid="true"]');
      if (first && first.matches('fieldset')) first = first.querySelector('input');
      if (first) first.focus();
    }
    return ok;
  }

  /* =====================================================================
     PROJECT INQUIRY (contact.html): five steps with a review.
     Prefills from contact.html?services=identity,website&budget=60-120&timeline=priority
     ===================================================================== */
  var enquiry = document.querySelector('[data-enquiry]');
  if (enquiry) {
    var steps = $$('[data-step]', enquiry);
    var tabs = $$('[data-step-tab]', enquiry.parentElement);
    var success = document.querySelector('[data-enquiry-success]');
    var stepLive = document.querySelector('[data-step-live]');
    var current = 0, reached = 0;

    var goTo = function (n, focus) {
      current = n;
      reached = Math.max(reached, n);
      steps.forEach(function (s, i) { s.hidden = i !== n; });
      tabs.forEach(function (t, i) {
        if (i === n) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current');
        t.toggleAttribute('data-done', i < reached && i !== n);
        t.disabled = i > reached;
      });
      if (steps[n].hasAttribute('data-review')) buildSummary();
      stepLive.textContent = 'Step ' + (n + 1) + ' of ' + steps.length + ': ' + steps[n].getAttribute('data-title');
      if (focus) {
        var heading = steps[n].querySelector('[data-step-heading]');
        heading.focus({ preventScroll: true });
        var top = enquiry.parentElement.getBoundingClientRect().top + window.scrollY - 96;
        if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
    };

    /* Review step: read every answer back from the form. */
    var buildSummary = function () {
      var labelOf = function (input) { return input.getAttribute('data-label') || input.value; };
      var val = function (name) { var el = enquiry.elements[name]; return el ? (el.value || '').trim() : ''; };
      var services = $$('input[name="services"]:checked', enquiry).map(labelOf).join(', ');
      var budget = enquiry.querySelector('input[name="budget"]:checked');
      var timeline = enquiry.querySelector('input[name="timeline"]:checked');
      var src = enquiry.elements.source;
      var rows = [
        [1, 'Organization', val('organisation')],
        [1, 'Services', services],
        [2, 'Budget', budget ? labelOf(budget) : ''],
        [2, 'Timeline', timeline ? labelOf(timeline) : ''],
        [3, 'Project details', val('details')],
        [3, 'Brief or files', val('link') || 'None'],
        [3, 'Heard about us', src && src.value ? src.options[src.selectedIndex].text : 'Not given'],
        [4, 'Name', val('name') + (val('role') ? ', ' + val('role') : '')],
        [4, 'Email', val('email')]
      ];
      enquiry.querySelector('[data-summary]').innerHTML = rows.map(function (r) {
        return '<div class="grid gap-1 border-b border-rule py-4 sm:grid-cols-[10rem_1fr_auto] sm:gap-6"><dt class="label pt-1">' + r[1] + '</dt><dd class="min-w-0 break-words whitespace-pre-line text-ink">' + esc(r[2] || '—') + '</dd>' +
          '<dd><button type="button" class="link-under text-sm text-mute hover:text-ink" data-edit="' + (r[0] - 1) + '">Edit<span class="sr-only"> ' + r[1].toLowerCase() + '</span></button></dd></div>';
      }).join('');
    };

    enquiry.addEventListener('click', function (e) {
      var t = e.target.closest('[data-next], [data-back], [data-edit]');
      if (!t) return;
      if (t.hasAttribute('data-next')) { if (validate(steps[current])) goTo(current + 1, true); }
      else if (t.hasAttribute('data-back')) goTo(current - 1, true);
      else goTo(Number(t.getAttribute('data-edit')), true);
    });
    tabs.forEach(function (t, i) { t.addEventListener('click', function () { if (i <= reached) goTo(i, true); }); });

    // Character counter for the details field
    var details = enquiry.elements.details;
    var counter = enquiry.querySelector('[data-counter]');
    var updateCounter = function () {
      var n = details.value.trim().length, min = details.minLength;
      counter.textContent = n < min ? (min - n) + ' more ' + plural(min - n, 'character', 'characters') + ' needed' : n + ' ' + plural(n, 'character', 'characters');
    };
    details.addEventListener('input', updateCounter);
    updateCounter();

    // Prefill from the estimator link
    var ep = new URLSearchParams(location.search);
    var filled = false;
    (ep.get('services') || '').split(',').forEach(function (k) {
      var cb = enquiry.querySelector('input[name="services"][value="' + (SCOPE.hasOwnProperty(k) ? k : '') + '"]');
      if (cb) { cb.checked = true; filled = true; }
    });
    ['budget', 'timeline'].forEach(function (name) {
      var v = ep.get(name);
      $$('input[name="' + name + '"]', enquiry).forEach(function (r) { if (r.value === v) { r.checked = true; filled = true; } });
    });
    if (filled) document.querySelector('[data-prefill-note]').hidden = false;

    liveValidate(enquiry);
    enquiry.addEventListener('submit', function (e) {
      e.preventDefault();
      // Re-check every step; jump to the first one with a problem.
      for (var i = 0; i < steps.length - 1; i++) {
        steps[i].hidden = false;
        var ok = validate(steps[i]);
        steps[i].hidden = true;
        if (!ok) { goTo(i, true); validate(steps[i]); return; }
      }
      // Demo only: nothing is sent. To receive inquiries, POST new FormData(enquiry) to your
      // form service here (see DOCS.md, "Forms"), then show the success message.
      enquiry.parentElement.hidden = true;
      success.querySelector('[data-success-name]').textContent = enquiry.elements.name.value.trim().split(/\s+/)[0];
      success.querySelector('[data-success-ref]').textContent = makeRef('RA');
      success.hidden = false;
      success.focus();
      window.scrollTo({ top: success.getBoundingClientRect().top + window.scrollY - 120, behavior: 'auto' });
    });
    success.querySelector('[data-success-reset]').addEventListener('click', function () {
      enquiry.reset();
      $$('[aria-invalid]', enquiry).forEach(function (f) { f.removeAttribute('aria-invalid'); });
      $$('.field-error', enquiry).forEach(function (el) { el.remove(); });
      updateCounter();
      reached = 0;
      success.hidden = true;
      enquiry.parentElement.hidden = false;
      goTo(0, true);
    });
    goTo(0, false);
  }

  /* =====================================================================
     NEWSLETTER (journal.html)
     ===================================================================== */
  $$('[data-newsletter]').forEach(function (form) {
    liveValidate(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      // Demo only: connect your newsletter provider here (see DOCS.md, "Forms").
      form.hidden = true;
      var done = form.parentElement.querySelector('[data-newsletter-done]');
      done.hidden = false;
      done.focus();
    });
  });

  /* =====================================================================
     JOURNAL (journal.html): tag filter (?tag=), live count, expandable notes.
     ===================================================================== */
  var journal = document.querySelector('[data-journal]');
  if (journal) {
    var notes = $$('[data-note]', journal);
    var tagBtns = $$('[data-tag]', journal);
    var noteCount = journal.querySelector('[data-note-count]');
    var tags = tagBtns.map(function (b) { return b.getAttribute('data-tag'); });
    var tag = new URLSearchParams(location.search).get('tag');
    if (tags.indexOf(tag) === -1) tag = 'all';

    var applyTag = function () {
      var shown = 0;
      tagBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-tag') === tag)); });
      notes.forEach(function (n) {
        var match = tag === 'all' || n.getAttribute('data-tags').split(' ').indexOf(tag) !== -1;
        n.hidden = !match;
        if (match) shown++;
      });
      noteCount.textContent = shown === notes.length ? 'Showing all ' + shown + ' ' + plural(shown, 'note', 'notes') : 'Showing ' + shown + ' of ' + notes.length + ' notes';
      var q = new URLSearchParams();
      if (tag !== 'all') q.set('tag', tag);
      setParams(q);
    };
    var setNote = function (note, open) {
      var btn = note.querySelector('[data-note-toggle]');
      var body = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(open));
      btn.querySelector('[data-note-label]').textContent = open ? 'Close note' : 'Read note';
      body.hidden = !open;
    };
    tagBtns.forEach(function (b) { b.addEventListener('click', function () { tag = b.getAttribute('data-tag'); applyTag(); }); });
    notes.forEach(function (n) {
      n.querySelector('[data-note-toggle]').addEventListener('click', function () {
        setNote(n, this.getAttribute('aria-expanded') !== 'true');
      });
    });
    var openFromHash = function () {
      var target = location.hash && document.getElementById(location.hash.slice(1));
      if (!target || !target.hasAttribute('data-note')) return;
      if (target.hidden) { tag = 'all'; applyTag(); }
      setNote(target, true);
      target.scrollIntoView({ block: 'start' });
    };
    applyTag();
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
  }

  /* =====================================================================
     SMALL EXTRAS
     ===================================================================== */
  /* Copy the email address: <button data-copy="hello@raster.example"> */
  $$('[data-copy]').forEach(function (btn) {
    var label = btn.querySelector('[data-copy-label]');
    var original = label.textContent;
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function (ok) {
        label.textContent = ok ? 'Copied' : 'Press Ctrl+C to copy';
        setTimeout(function () { label.textContent = original; }, 2200);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else {
        done(false);
      }
    });
  });

  /* 12-column grid overlay, toggled from the footer button [data-grid-toggle] */
  var gridBtn = document.querySelector('[data-grid-toggle]');
  if (gridBtn) {
    var overlay = document.createElement('div');
    overlay.className = 'grid-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    var cols = '';
    for (var c = 0; c < 12; c++) cols += c < 4 ? '<span></span>' : '<span class="hidden sm:block"></span>';
    overlay.innerHTML = '<div class="wrap grid-12">' + cols + '</div>';
    document.body.appendChild(overlay);
    gridBtn.addEventListener('click', function () {
      var on = gridBtn.getAttribute('aria-pressed') !== 'true';
      gridBtn.setAttribute('aria-pressed', String(on));
      overlay.classList.toggle('is-on', on);
    });
  }

  /* Rolling dates: [data-months-ahead="n"] shows the month n months from now ("November 2026"; "Feb 2027"
     with data-month-format="short"; "December 15, 2026" with data-day="15"), so availability, start dates and
     deadlines never go stale. Replace the span with plain text to show a fixed date. */
  document.querySelectorAll('[data-months-ahead]').forEach(function (el) {
    var n = parseInt(el.getAttribute('data-months-ahead'), 10);
    if (!(n >= 0 && n <= 36)) return;
    var now = new Date(), d = new Date(now.getFullYear(), now.getMonth() + n, 1);
    var day = parseInt(el.getAttribute('data-day'), 10);
    var month = d.toLocaleDateString('en-US', { month: el.getAttribute('data-month-format') === 'short' ? 'short' : 'long' });
    el.textContent = month + (day >= 1 && day <= 28 ? ' ' + day + ',' : '') + ' ' + d.getFullYear();
  });

  $$('[data-current-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();


/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It steps aside while the footer's "Back to top" link
   is on screen. Mark your own UI with data-back-to-top-avoid (lift above it) or
   data-back-to-top-hide (hide while covering it). To remove the button: delete this
   block and the .back-to-top styles in src/input.css. */
(function () {
  'use strict';
  if (document.querySelector('.back-to-top')) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.title = 'Back to top';
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var AVOID = '[data-toast], .toast, [data-back-to-top-avoid]';
  var queued = false;

  function isShown(el) {
    var cs = window.getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05;
  }
  function lift() {
    var offset = 0;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    Array.prototype.forEach.call(document.querySelectorAll(AVOID), function (el) {
      if (!isShown(el)) return;
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.bottom > vh - 140 && r.right > vw - 96 && r.top < vh) offset = Math.max(offset, vh - r.top + 4);
    });
    btn.style.setProperty('--btt-lift', offset + 'px');
  }
  var inlineLinks = Array.prototype.filter.call(document.querySelectorAll('a'), function (a) { return /back to top/i.test(a.textContent); });
  function inlineLinkInView() {
    return inlineLinks.some(function (a) {
      var r = a.getBoundingClientRect();
      return r.width > 0 && r.top < window.innerHeight && r.bottom > 0;
    });
  }
  function coversHideZone() {
    var b = btn.getBoundingClientRect();
    return Array.prototype.some.call(document.querySelectorAll('[data-back-to-top-hide]'), function (el) {
      var pos = window.getComputedStyle(el).position;
      if (pos !== 'sticky' && pos !== 'fixed') return false;
      var r = el.getBoundingClientRect();
      return r.width > 0 && r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top;
    });
  }
  function update() {
    queued = false;
    lift();
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !inlineLinkInView() && !coversHideZone());
  }
  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();

  function focusTop() {
    var target = document.getElementById('main') || document.querySelector('main');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
  btn.addEventListener('click', function () {
    if (reduceMotion.matches) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      focusTop();
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    var done = false;
    function finish() {
      if (done) return;
      done = true;
      window.removeEventListener('scrollend', finish);
      focusTop();
    }
    if ('onscrollend' in window) window.addEventListener('scrollend', finish);
    window.setTimeout(finish, 1500);
  });
})();
