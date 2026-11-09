/* Pomelo Press — the content for the Overprint template.
 * Plain data, read by assets/js/main.js. Edit this file to make the site yours:
 *  1. STUDIO           name, address, contact details, time zone, booking rules
 *  2. TYPES, USAGES, BUDGETS   the commission inquiry and its estimate
 *  3. PROJECTS         the portfolio (work grid, case studies)
 *  4. PRODUCTS, SHIPPING, TAX  the shop and its checkout
 *  5. EVENTS           fairs, markets and workshops (roll forward, see KEEP_DEMO_CURRENT)
 *  6. CLIENTS, QUOTES  the client list and what clients say
 * Artwork is drawn in SVG by main.js from each item's `motif` (see "Artwork" in DOCS.md).
 */
window.OVERPRINT = (function () {
  'use strict';

  /* 1. Studio ---------------------------------------------------------- */
  const STUDIO = {
    name: 'Pomelo Press',
    person: 'Pipa Valdespino',
    street: 'Studio 4, 1830 Frankfort Ave',
    city: 'Louisville, KY 40206',
    phone: '(502) 555-0184',
    shopPhone: '(502) 555-0186',
    email: 'hello@pomelopress.example',
    shopEmail: 'shop@pomelopress.example',
    timeZone: 'America/Kentucky/Louisville', // US Eastern time
    tzLabel: 'Eastern',
    // New commissions start on a Monday at least this many days from today.
    startLeadDays: 14,
    // Inquiries are answered within this many workdays.
    replyWorkingDays: 2,
    // Shop orders are packed and mailed on these weekdays (0 = Sunday … 6 = Saturday).
    mailDays: [2, 5],
    // Open studio: the first Saturday of every month, 11am to 4pm.
    openStudio: { weekday: 6, nth: 1, from: '11:00', to: '16:00' },
    // Winter break: the studio is closed from this day to the end of the year (MM-DD).
    winterBreakFrom: '12-24'
  };

  /* 2. Commission inquiry --------------------------------------------- */
  // days: business days for each phase. from: the usual starting fee in dollars.
  const TYPES = {
    editorial: {
      label: 'Editorial',
      blurb: 'Covers, spots and full-page pieces for magazines, newspapers and newsletters.',
      from: 650,
      phases: { sketches: 4, revisions: 2, finals: 4 },
      example: 'A cover and two spots'
    },
    'picture-books': {
      label: 'Picture book',
      blurb: 'A 32 or 40 page book with a publisher: roughs, color finals and the cover.',
      from: 9500,
      phases: { sketches: 25, revisions: 10, finals: 50 },
      example: 'A 32-page book, advance against royalties'
    },
    packaging: {
      label: 'Packaging',
      blurb: 'Labels, wrappers, tins and the patterns that go around them.',
      from: 2800,
      phases: { sketches: 10, revisions: 5, finals: 15 },
      example: 'A range of three labels'
    },
    posters: {
      label: 'Poster',
      blurb: 'Gig, film and event posters, printed here on the riso or by your printer.',
      from: 900,
      phases: { sketches: 4, revisions: 2, finals: 5 },
      example: 'An 18 × 24 in poster and social crops'
    },
    other: {
      label: 'Something else',
      blurb: 'Maps, murals, spot illustrations for the web. Tell me about it.',
      from: 1200,
      phases: { sketches: 5, revisions: 3, finals: 7 },
      example: 'An illustrated map'
    }
  };

  // How the artwork will be used. factor multiplies the starting fee.
  const USAGES = {
    'print-once': { label: 'One-time print', note: 'A single issue or print run, North America.', factor: 1 },
    'print-digital': { label: 'Print and digital, 2 years', note: 'Print plus website, newsletter and social.', factor: 1.35 },
    campaign: { label: 'Campaign, all media, 2 years', note: 'Advertising, packaging, merch and screens.', factor: 1.7 },
    exclusive: { label: 'Exclusive, no end date', note: 'All media, worldwide, and I won’t license it again.', factor: 2.4 }
  };

  const BUDGETS = {
    'under-1k': { label: 'Under $1,000', min: 0, max: 1000 },
    '1k-3k': { label: '$1,000 to $3,000', min: 1000, max: 3000 },
    '3k-8k': { label: '$3,000 to $8,000', min: 3000, max: 8000 },
    '8k-15k': { label: '$8,000 to $15,000', min: 8000, max: 15000 },
    '15k-plus': { label: '$15,000 or more', min: 15000, max: Infinity }
  };

  // A rush job squeezes every phase to this share of its usual length, for RUSH_FEE extra.
  const RUSH = { squeeze: 0.7, fee: 0.25 };

  /* 3. Projects ------------------------------------------------------- */
  const CATEGORIES = {
    editorial: 'Editorial',
    'picture-books': 'Picture books',
    packaging: 'Packaging',
    posters: 'Posters'
  };

  // motif: which SVG drawing main.js makes. inks: the plates it prints with, in print order.
  // reg: how far each plate drifts off register, in pixels of the 400 × 500 drawing.
  const PROJECTS = [
    {
      id: 'upside-down-moon', title: 'Otto and the Upside-Down Moon', client: 'Dovetail Books', type: 'picture-books', year: 2026,
      motif: 'moon', inks: ['blue', 'yellow', 'pink'], reg: [[0, 0], [3, -2], [-2, 3]], featured: 1,
      summary: 'A 32-page picture book about a boy who climbs onto his roof to turn the moon the right way up.',
      brief: 'Wendeline Saltmarsh’s text is only 410 words long, so the pictures carry the night. Dovetail wanted a book that felt printed, not rendered, and that would still read in a dim bedroom at story time.',
      deliverables: ['32 pages and cover', 'Endpapers', 'Three-color separations', 'Launch poster'],
      process: [
        ['Thumbnails on one sheet', 'The whole book as sixteen tiny spreads, so the page turns could be paced before anything was drawn properly. The ladder appears on page 9 and doesn’t leave until 28.'],
        ['Two inks, then a third', 'Roughs were blue and yellow only. Pink came in late, just for Otto, so he is the one warm thing on every spread and young readers can always find him.'],
        ['Separations by hand', 'Each spread was drawn as three grayscale plates and proofed on the studio riso. The overlaps, where pink sits on blue, make the deep violet of the sky at 3am.']
      ],
      result: 'First printing of 8,000 copies, a starred trade review and a second printing within four months.',
      quote: 'q-nomvula'
    },
    {
      id: 'grandpas-bus', title: 'Grandpa’s Bus Goes Everywhere', client: 'Dovetail Books', type: 'picture-books', year: 2024,
      motif: 'bus', inks: ['yellow', 'blue', 'pink'], reg: [[0, 0], [-3, 2], [2, -2]],
      summary: 'A counting book that rides one city bus route from the depot to the river and back.',
      brief: 'A board book for toddlers with ten stops, one more passenger at each, and a grandpa driver who waves at everybody.',
      deliverables: ['24-page board book', 'Cover', 'Activity sheet'],
      process: [
        ['Route map first', 'I drew the route as a map so every spread had a real place: the bakery, the ballpark, the bridge.'],
        ['Big shapes, thick edges', 'Board books are read upside down and chewed. Shapes are chunky and the type sits inside clear yellow fields.'],
        ['Counting check', 'Every spread was tested with a four-year-old consultant, who found the missing cat on stop seven.']
      ],
      result: 'Picked up by two library systems for their read-along program.',
      quote: null
    },
    {
      id: 'night-market-mouse', title: 'The Night Market Mouse', client: 'Butterwick Books', type: 'picture-books', year: 2025,
      motif: 'mouse', inks: ['blue', 'yellow', 'pink'], reg: [[0, 0], [2, 2], [-3, -1]],
      summary: 'A mouse who sells lanterns at a night market, and the one lantern she won’t sell.',
      brief: 'A gentle bedtime story set under strings of lights. The publisher asked for warmth without the usual brown-and-orange palette.',
      deliverables: ['40 pages and cover', 'Foil cover mock-up', 'Character sheet'],
      process: [
        ['Light from the inks', 'Yellow is the only light source. Wherever the lanterns glow, blue drops back to a halftone so the yellow reads as brighter.'],
        ['A character sheet', 'Twenty poses of the mouse at stamp size, so she stayed the same mouse across forty pages.'],
        ['Cover in three tries', 'The first two covers were too busy. The third has one lantern and one mouse, and it won.']
      ],
      result: 'Published in the US and in a co-edition in two other languages.',
      quote: null
    },
    {
      id: 'night-shift-gardeners', title: 'Night Shift Gardeners', client: 'Flicker Weekly', type: 'editorial', year: 2025,
      motif: 'gardeners', inks: ['yellow', 'pink', 'blue'], reg: [[0, 0], [3, 1], [-2, -2]], featured: 3,
      summary: 'A cover story about nurses, bakers and bus drivers who garden after their shifts end at dawn.',
      brief: 'The weekly wanted a cover that would stand out in a news rack at 7am, and a mood that was tired, happy and green-fingered at once.',
      deliverables: ['Cover', 'Two inside spots', 'Social crops'],
      process: [
        ['Streetlight as a stage', 'The yellow plate is a single cone of streetlight. Everything outside it is night blue, so the gardener steps into the light.'],
        ['Leaves as type', 'The pink leaves frame the masthead, so the art director could drop the cover lines on top without fighting the picture.'],
        ['Delivered as plates', 'The magazine printed in CMYK, so the three ink plates were converted with matched overprints and checked on a press proof.']
      ],
      result: 'The issue sold out its rack copies in two days, and the cover is now a print in the shop.',
      quote: null
    },
    {
      id: 'loneliness-economy', title: 'The Loneliness Economy', client: 'The Harbinger Quarterly', type: 'editorial', year: 2026,
      motif: 'economy', inks: ['yellow', 'blue', 'pink'], reg: [[0, 0], [-2, 3], [3, -1]], featured: 2,
      summary: 'Four illustrations for a long essay about the businesses that sell company to lonely people.',
      brief: 'A serious subject that couldn’t look grim. The art director asked for warmth, wit and no sad people staring at phones.',
      deliverables: ['Opening spread', 'Three spots', 'Animated social version'],
      process: [
        ['Two hands that miss', 'The opening image is two hands that almost touch. Printed in pink and blue, they only meet in the overprint, where the colors mix.'],
        ['Coins for scale', 'Yellow coins pour between them, a little absurd, so the picture argues with the essay rather than illustrating it.'],
        ['Spots as a set', 'The three spots reuse the hands at stamp size: holding a phone, a leash, a ticket.']
      ],
      result: 'Shortlisted for an editorial illustration award and reprinted in the magazine’s anniversary issue.',
      quote: 'q-kiki'
    },
    {
      id: 'heat-map-summer', title: 'Heat Map Summer', client: 'Flicker Weekly', type: 'editorial', year: 2024,
      motif: 'heat', inks: ['yellow', 'pink', 'blue'], reg: [[0, 0], [2, -3], [-1, 2]],
      summary: 'A special issue on the hottest summer on record and the city’s public pools.',
      brief: 'A cover and a fold-out guide to every free pool and splash pad in town.',
      deliverables: ['Cover', 'Fold-out map', 'Twelve pool icons'],
      process: [
        ['Rings of heat', 'The sun prints twice, solid and in halftone, with pink rings around it like a weather map.'],
        ['The pool below', 'The bottom third is cool blue water with one swimmer, so the eye drops from heat to relief.'],
        ['Icons that print small', 'Twelve pool icons drawn to read at half an inch on newsprint.']
      ],
      result: 'The fold-out map was pinned up in recreation centers all summer.',
      quote: null
    },
    {
      id: 'pell-tea', title: 'Pell & Daughter Tea tins', client: 'Pell & Daughter Tea', type: 'packaging', year: 2025,
      motif: 'tea', inks: ['blue', 'pink', 'yellow'], reg: [[0, 0], [2, 2], [-2, 1]], featured: 4,
      summary: 'Three tins for a family tea company: breakfast, ginger and a night-time chamomile.',
      brief: 'The tins had to sit together as a family on a shelf, and each had to be told apart from across a kitchen.',
      deliverables: ['Three tin wraps', 'Lid pattern', 'Shipping box', 'Brand stickers'],
      process: [
        ['One ink each', 'Every tin leads with one ink: blue breakfast, pink ginger, yellow chamomile. The other two inks print the leaves on top.'],
        ['A pattern for the lids', 'A repeat of tiny tea leaves, sized so it tiles perfectly on a 3-inch lid.'],
        ['Printer handover', 'The tins were printed in spot colors matched to the riso inks, with drawdowns approved at the printer.']
      ],
      result: 'Sales of the range rose by a third in its first season, and the tins are now in 60 shops.',
      quote: null
    },
    {
      id: 'mossgrove-cider', title: 'Mossgrove Cider labels', client: 'Mossgrove Cider', type: 'packaging', year: 2024,
      motif: 'cider', inks: ['pink', 'yellow', 'blue'], reg: [[0, 0], [-2, -2], [3, 2]],
      summary: 'Bottle labels for an orchard cidery’s first three releases.',
      brief: 'A small orchard making dry ciders wanted labels that looked handmade but read like a real product in a liquor store.',
      deliverables: ['Three bottle labels', 'Case boxes', 'Tap handle art'],
      process: [
        ['Apples as dots', 'The apples are halftone circles: yellow on pink makes the warm red-orange of a ripe fruit.'],
        ['A bottle-shaped grid', 'Labels were drawn on the bottle shoulder template, so nothing important wraps out of sight.'],
        ['Wet tests', 'Printed labels went into an ice bucket for a weekend to check the paper and inks held up.']
      ],
      result: 'The first release sold out at the cidery in five weeks.',
      quote: 'q-ozzie'
    },
    {
      id: 'cobbleworth-bars', title: 'Cobbleworth Chocolate wrappers', client: 'Cobbleworth Chocolate', type: 'packaging', year: 2026,
      motif: 'chocolate', inks: ['pink', 'blue', 'yellow'], reg: [[0, 0], [2, -2], [-3, 2]],
      summary: 'Wrappers for a bean-to-bar chocolate maker’s seasonal bars.',
      brief: 'Four bars a year, each with a new pattern, printed in small runs on the studio riso.',
      deliverables: ['Four wrapper patterns', 'Flavor stamps', 'Gift box'],
      process: [
        ['A pattern system', 'Stripes, dots, zigzags and checks, one for each season, all drawn on the same grid.'],
        ['Printed here', 'Wrappers are printed at the studio in runs of 500 and folded by hand at the chocolate shop.'],
        ['Flavor stamps', 'A rubber stamp for each flavor, so new bars can be made without reprinting.']
      ],
      result: 'The wrappers became the brand: customers collect them.',
      quote: null
    },
    {
      id: 'junebug-fair', title: 'Junebug Small Press Fair', client: 'Junebug Small Press Fair', type: 'posters', year: 2026,
      motif: 'zinefest', inks: ['yellow', 'blue', 'pink'], reg: [[0, 0], [3, 3], [-2, -1]],
      summary: 'The poster and table map for Louisville’s fair of zines, comics and small presses.',
      brief: 'One poster for 150 exhibitors, which had to work at 18 × 24 inches on a coffee-shop wall and as a tiny square online.',
      deliverables: ['18 × 24 in poster', 'Table map', 'Social squares', 'Tote bag'],
      process: [
        ['A big bug', 'The junebug is the logo, drawn huge so it works as a silhouette at any size.'],
        ['Type that overprints', 'The lettering is in pink over the blue bug, so the name stays readable where they cross.'],
        ['Printed for the fair', 'Three hundred posters printed on the studio riso, pulled in three passes.']
      ],
      result: 'Posters went up in 80 businesses around town, and the tote bags sold out.',
      quote: null
    },
    {
      id: 'summer-of-monsters', title: 'Summer of Monsters', client: 'Thistle Hall Cinema', type: 'posters', year: 2025,
      motif: 'monsters', inks: ['pink', 'blue', 'yellow'], reg: [[0, 0], [-3, 2], [2, -3]],
      summary: 'A season poster for an old single-screen cinema’s run of creature features.',
      brief: 'Eight films, one poster, and a cinema that wanted it to feel like a 1950s lobby card printed by a kid with a stencil.',
      deliverables: ['Season poster', 'Eight film cards', 'Ticket design'],
      process: [
        ['One eye', 'The monster is mostly an eye, so it stares at people walking past the box office.'],
        ['Film strip', 'A yellow film strip runs through it, carrying the eight film titles on the cards.'],
        ['Rough edges kept', 'The plates were left slightly off register on purpose. Monsters look better a bit wrong.']
      ],
      result: 'The season sold more tickets than any summer program in the cinema’s last ten years.',
      quote: null
    },
    {
      id: 'moth-choir', title: 'Moth Choir', client: 'Quillback Records', type: 'posters', year: 2026,
      motif: 'moth', inks: ['yellow', 'pink', 'blue'], reg: [[0, 0], [2, 3], [-3, -2]],
      summary: 'A tour poster and record sleeve for a six-piece folk choir.',
      brief: 'A choir named after moths, a record about leaving the porch light on, and a tour of twelve small venues.',
      deliverables: ['Tour poster', 'LP sleeve', 'Lyric insert'],
      process: [
        ['The porch light', 'A yellow lamp sits behind the moth, so the wings print over it and glow where they overlap.'],
        ['Wings in two inks', 'Upper wings pink, lower wings blue: the violet where they meet became the sleeve color.'],
        ['Tour dates as a list', 'The dates are a separate plate, so the poster could be reprinted for each leg.']
      ],
      result: 'The sleeve was shortlisted for an independent album art prize, and the poster is in the shop.',
      quote: null
    }
  ];

  /* 4. Shop ------------------------------------------------------------ */
  // kind: print | poster | zine | stickers | postcards (sets the drawing and the shop filter).
  // options: each size or format with its price in dollars, edition size and how many are left.
  const SHOP_FILTERS = {
    all: 'Everything',
    prints: 'Prints and posters',
    zines: 'Zines',
    paper: 'Stickers and cards'
  };
  const PRODUCTS = [
    { id: 'upside-down-moon-print', name: 'Upside-Down Moon', kind: 'print', motif: 'moon', project: 'upside-down-moon',
      blurb: 'Otto on the roof with his ladder, from the picture book.', paper: 'Cream 100 lb cover, three inks',
      options: [{ id: 'letter', label: '8.5 × 11 in', price: 28, edition: 100, left: 37 }, { id: 'tabloid', label: '11 × 17 in', price: 45, edition: 60, left: 12 }] },
    { id: 'night-shift-print', name: 'Night Shift Gardeners', kind: 'print', motif: 'gardeners', project: 'night-shift-gardeners',
      blurb: 'The sold-out cover, without the cover lines.', paper: 'Cream 100 lb cover, three inks',
      options: [{ id: 'letter', label: '8.5 × 11 in', price: 28, edition: 100, left: 54 }, { id: 'tabloid', label: '11 × 17 in', price: 45, edition: 60, left: 21 }] },
    { id: 'frankfort-dusk', name: 'Frankfort Ave at Dusk', kind: 'print', motif: 'street',
      blurb: 'The view from the studio window when the streetlights come on.', paper: 'Cream 100 lb cover, three inks',
      options: [{ id: 'letter', label: '8.5 × 11 in', price: 28, edition: 100, left: 68 }, { id: 'tabloid', label: '11 × 17 in', price: 45, edition: 60, left: 33 }] },
    { id: 'river-swimmers', name: 'River Swimmers', kind: 'print', motif: 'swimmers',
      blurb: 'The early swim club under the bridge, pink caps and all.', paper: 'White 100 lb cover, three inks',
      options: [{ id: 'letter', label: '8.5 × 11 in', price: 28, edition: 100, left: 19 }, { id: 'tabloid', label: '11 × 17 in', price: 45, edition: 60, left: 0 }] },
    { id: 'big-cat-small-hours', name: 'Big Cat, Small Hours', kind: 'print', motif: 'cat',
      blurb: 'A very large cat asleep across a very small apartment.', paper: 'Cream 100 lb cover, three inks',
      options: [{ id: 'letter', label: '8.5 × 11 in', price: 28, edition: 100, left: 44 }, { id: 'tabloid', label: '11 × 17 in', price: 45, edition: 60, left: 26 }] },
    { id: 'heat-map-print', name: 'Heat Map Summer', kind: 'print', motif: 'heat', project: 'heat-map-summer',
      blurb: 'The sun, the rings and the one cool swimmer.', paper: 'Cream 100 lb cover, three inks',
      options: [{ id: 'letter', label: '8.5 × 11 in', price: 28, edition: 100, left: 58 }] },
    { id: 'moth-choir-poster', name: 'Moth Choir tour poster', kind: 'poster', motif: 'moth', project: 'moth-choir',
      blurb: 'The tour poster, signed, with the dates plate left off.', paper: 'Cream 80 lb cover, three inks',
      options: [{ id: 'poster', label: '18 × 24 in', price: 38, edition: 80, left: 29 }] },
    { id: 'notebook-leftovers', name: 'Notebook Leftovers No. 3', kind: 'zine', motif: 'pomelo', cover: 'No. 3',
      blurb: 'A year of sketchbook pages that didn’t become anything, and a few that did.', paper: '28 pages, 5.5 × 8.5 in, two inks',
      options: [{ id: 'zine', label: '28 pages', price: 14, edition: 150, left: 62 }] },
    { id: 'two-inks', name: 'Two Inks Are Plenty', kind: 'zine', motif: 'swatches', cover: '2 inks',
      blurb: 'A pocket guide to riso overprints: every pair of studio inks, at five densities.', paper: '20 pages, 5.5 × 8.5 in, three inks',
      options: [{ id: 'zine', label: '20 pages', price: 16, edition: 200, left: 118 }] },
    { id: 'night-market-mini', name: 'The Night Market Mouse mini zine', kind: 'zine', motif: 'mouse', cover: 'Mini', project: 'night-market-mouse',
      blurb: 'Sketches and the character sheet from the picture book, folded from one sheet.', paper: '8 pages, 4.25 × 5.5 in, two inks',
      options: [{ id: 'zine', label: '8 pages', price: 8, edition: 250, left: 141 }] },
    { id: 'pantry-friends', name: 'Pantry Friends sticker sheet', kind: 'stickers', motif: 'stickers',
      blurb: 'Six die-cut vinyl stickers: a pomelo, a teapot, a cat, a moon, a bus and a star.', paper: '5 × 7 in sheet, matte vinyl',
      options: [{ id: 'sheet', label: 'One sheet', price: 7, edition: 500, left: 286 }, { id: 'three', label: 'Three sheets', price: 18, edition: 500, left: 286 }] },
    { id: 'twelve-spots', name: 'Twelve Spots postcard set', kind: 'postcards', motif: 'postcards',
      blurb: 'Twelve postcards of editorial spots, in a printed paper band.', paper: '4 × 6 in, 110 lb cover',
      options: [{ id: 'set', label: 'Set of 12', price: 18, edition: 300, left: 173 }] }
  ];

  const SHIPPING = {
    standard: { label: 'USPS Ground Advantage', note: 'Flat-mailed with board backing, 3 to 5 business days', price: 6, freeOver: 75 },
    priority: { label: 'USPS Priority, tracked', note: '1 to 3 business days after it ships', price: 12, freeOver: null },
    pickup: { label: 'Pick up at the studio', note: 'Frankfort Ave, any weekday 10am to 5pm once we email you', price: 0, freeOver: null }
  };
  // Kentucky sales tax, charged on orders shipped to (or picked up in) Kentucky.
  const TAX = { state: 'KY', rate: 0.06, label: 'Kentucky sales tax (6%)' };
  const MAX_QTY = 10;

  /* 5. Events ---------------------------------------------------------- */
  // While KEEP_DEMO_CURRENT is true, an event whose last day has passed moves forward by whole
  // years of 52 weeks (364 days), so weekdays stay right and the list is never empty.
  // Set it to false once you enter your real dates.
  const KEEP_DEMO_CURRENT = true;
  const DEMO_ANCHOR = '2026-10-27';
  const EVENTS = [
    { date: '2026-11-14', title: 'Junebug Small Press Fair', kind: 'Fair', place: 'Haberdash Hall, NuLu', note: 'Table 23. New zines, the moon print and the seconds bin.', time: '10am to 5pm' },
    { date: '2026-12-05', end: '2026-12-06', title: 'Holiday print swap', kind: 'Open studio', place: 'Pomelo Press, Frankfort Ave', note: 'Bring a print, take a print. Cider from Mossgrove.', time: '11am to 4pm' },
    { date: '2027-01-23', title: 'Workshop: Two Inks Are Plenty', kind: 'Workshop', place: 'Pomelo Press, Frankfort Ave', note: 'Six seats, $85, all materials. You leave with an edition of 20.', time: '10am to 3pm' },
    { date: '2027-03-13', title: 'Bluegrass Riso Market', kind: 'Market', place: 'Thistle Hall, Louisville', note: 'Forty riso printers from four states under one roof.', time: '11am to 6pm' },
    { date: '2027-04-17', title: 'Storytime: Otto and the Upside-Down Moon', kind: 'Reading', place: 'Frankfort Avenue branch library', note: 'A reading with Wendeline Saltmarsh, then everyone draws a moon.', time: '10:30am' },
    { date: '2027-06-05', title: 'Riverfront Comics and Zine Day', kind: 'Fair', place: 'Waterfront pavilion, Louisville', note: 'Outdoor tables, so the prints come in plastic sleeves.', time: '10am to 4pm' },
    { date: '2027-09-18', end: '2027-09-19', title: 'Ohio Valley Illustration Weekend', kind: 'Talk', place: 'Haberdash Hall, NuLu', note: 'A talk on drawing in separations, Saturday at 2pm.', time: 'Saturday and Sunday' }
  ];

  /* 6. Clients and quotes ---------------------------------------------- */
  const CLIENTS = ['The Harbinger Quarterly', 'Flicker Weekly', 'Dovetail Books', 'Butterwick Books', 'Pell & Daughter Tea', 'Mossgrove Cider', 'Cobbleworth Chocolate', 'Thistle Hall Cinema', 'Quillback Records', 'Junebug Small Press Fair'];
  const QUOTES = {
    'q-kiki': { text: 'Pipa sends sketches that already have an opinion. We ran the first idea she drew, which has never happened before.', name: 'Kiki Shimabukuro', role: 'Art director, The Harbinger Quarterly' },
    'q-nomvula': { text: 'Children find Otto on every page in under a second. That is the whole job of a picture book, and it’s rarer than you’d think.', name: 'Nomvula Rourke', role: 'Editor, Dovetail Books' },
    'q-ozzie': { text: 'She came to the orchard, tasted everything and drew labels that taste like the cider. Our bottles finally look like us.', name: 'Ozzie Ferncastle', role: 'Founder, Mossgrove Cider' }
  };

  return { STUDIO, TYPES, USAGES, BUDGETS, RUSH, CATEGORIES, PROJECTS, SHOP_FILTERS, PRODUCTS, SHIPPING, TAX, MAX_QTY, KEEP_DEMO_CURRENT, DEMO_ANCHOR, EVENTS, CLIENTS, QUOTES };
})();
