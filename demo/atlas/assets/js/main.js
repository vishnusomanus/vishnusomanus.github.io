/* Atlas (Delia Quintero, Nashville real estate) — site scripts. Vanilla JavaScript, no dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- The agent ----------
     Used in calendar files, the listing page title and confirmation messages. */
  var AGENT = {
    name: 'Delia Quintero',
    phone: '(615) 555-0142',
    email: 'hello@deliaquintero.example',
    office: '1104 Woodland St, Suite 2, Nashville, TN 37206',
    timeZone: 'America/Chicago',
    zoneName: 'Central Time'
  };

  /* ---------- Neighborhoods ----------
     ppsf (price per square foot) drives the home-value estimate on sell.html and the home page.
     median, dom (average days on market) and yoy (price change over a year) are shown on
     neighborhoods.html. All figures are illustrative demo data, not market statistics. */
  var AREAS = [
    { id: 'east-nashville', name: 'East Nashville', ppsf: 455, median: 739000, dom: 19, yoy: 4.2 },
    { id: 'inglewood', name: 'Inglewood', ppsf: 380, median: 565000, dom: 24, yoy: 5.1 },
    { id: 'germantown', name: 'Germantown', ppsf: 545, median: 715000, dom: 27, yoy: 1.8 },
    { id: 'the-nations', name: 'The Nations', ppsf: 470, median: 689000, dom: 21, yoy: 3.4 },
    { id: 'sylvan-park', name: 'Sylvan Park', ppsf: 520, median: 869000, dom: 14, yoy: 3.9 },
    { id: 'twelve-south', name: '12South', ppsf: 640, median: 1249000, dom: 16, yoy: 2.7 }
  ];

  /* ---------- Listings ----------
     status: 'active' (for sale), 'pending' (under contract) or 'sold'.
     openHouses: [weekday, start, end] in Nashville time; each one is shown on its next date.
     art: the illustration. style is one of victorian, farmhouse, bungalow, townhome, modern,
     ranch, foursquare, tudor or condo; the colors tint the house and its rooms. */
  var LISTINGS = [
    { id: 'fatherland-1418', status: 'active', featured: true, address: '1418 Fatherland St', area: 'east-nashville', zip: '37206',
      price: 849000, beds: 3, baths: 2.5, sqft: 2060, lot: '0.17 acres', year: 1910, type: 'Single-family', style: 'Folk Victorian', dom: 6, listed: '2026-10-09',
      headline: 'A wraparound porch two blocks from Shelby Bottoms',
      description: ['Ten-foot ceilings, original heart-pine floors and a porch that wraps the corner: this 1910 Victorian was restored by people who loved it, and it shows.', 'The kitchen was rebuilt in 2022 with a walk-in pantry and a window over the sink that looks onto a fenced, gently terraced back garden. Upstairs, the primary suite has a clawfoot tub under the eaves. A detached studio with power is ready for an office or a music room.'],
      features: ['Restored heart-pine floors', 'Kitchen rebuilt in 2022', 'Detached studio with power', 'Fenced back garden', 'Off-street parking for two', 'Walk to Five Points'],
      openHouses: [['sat', '11:00', '13:00'], ['sun', '13:00', '15:00']],
      art: { style: 'victorian', sky: '#dce3fb', body: '#2f5d8a', roof: '#1c2d86', trim: '#f6f2ea', door: '#e4552b' } },
    { id: 'ashwood-2207', status: 'active', featured: true, address: '2207 Ashwood Ave', area: 'twelve-south', zip: '37212',
      price: 1595000, beds: 4, baths: 4.5, sqft: 3420, lot: '0.19 acres', year: 2024, type: 'Single-family', style: 'Modern farmhouse', dom: 12, listed: '2026-10-03',
      headline: 'New build, three blocks from Sevier Park',
      description: ['Built in 2024 by a small local builder, with the details that usually get value-engineered out: white-oak floors throughout, plaster range hood, a scullery behind the kitchen and a screened porch with a wood-burning fireplace.', 'The main-level guest suite works for visiting parents, and the bonus room over the garage has its own bath. You can walk to coffee, Sevier Park and the 12th Avenue shops without crossing a major road.'],
      features: ['Screened porch with fireplace', 'Scullery and butler’s pantry', 'Main-level guest suite', 'Two-car garage with bonus room', 'Builder warranty to 2034', 'Walk to Sevier Park'],
      openHouses: [['sun', '14:00', '16:00']],
      art: { style: 'farmhouse', sky: '#fbf1cf', body: '#f6f2ea', roof: '#252a40', trim: '#0e1430', door: '#56704a' } },
    { id: 'utah-4512', status: 'active', featured: true, address: '4512 Utah Ave', area: 'sylvan-park', zip: '37209',
      price: 925000, beds: 3, baths: 2, sqft: 1780, lot: '0.21 acres', year: 1928, type: 'Single-family', style: 'Craftsman bungalow', dom: 3, listed: '2026-10-12',
      headline: 'A Sylvan Park bungalow with the original built-ins',
      description: ['Tapered porch columns, a fireplace with its original tile and the built-in bookcases nobody has painted over: this 1928 bungalow has the details buyers ask me for.', 'The rear addition opens the kitchen to a family room and a deep back deck. The yard is flat, fenced and big enough for a garden. You are a short walk from the Richland Creek Greenway and the shops on Murphy Road.'],
      features: ['Original built-ins and fireplace', 'Open kitchen and family room', 'Deep back deck', 'Flat, fenced yard', 'New HVAC (2024)', 'Near Richland Creek Greenway'],
      openHouses: [['sat', '13:00', '15:00']],
      art: { style: 'bungalow', sky: '#e3ead9', body: '#8fa97a', roof: '#435a39', trim: '#f6f2ea', door: '#a13517' } },
    { id: 'fifth-1302', status: 'active', featured: false, address: '1302 5th Ave N, Unit 3', area: 'germantown', zip: '37208',
      price: 789000, beds: 3, baths: 3.5, sqft: 1920, lot: 'Shared', year: 2017, type: 'Townhome', style: 'Brick townhome', dom: 21, listed: '2026-09-24',
      headline: 'Rooftop terrace with a skyline view in Germantown',
      description: ['A three-story brick townhome on one of Germantown’s prettiest blocks, with a rooftop terrace that looks straight at the downtown skyline.', 'Each bedroom has its own bath, the garage is attached and the HOA covers the exterior and the landscaping. Farmers market, Bicentennial Mall and a dozen restaurants are all within ten minutes on foot.'],
      features: ['Private rooftop terrace', 'Attached one-car garage', 'Every bedroom en suite', 'HOA $215/month', 'Gas range and fireplace', 'Walk to the farmers market'],
      openHouses: [],
      art: { style: 'townhome', sky: '#fde0d3', body: '#a13517', roof: '#0e1430', trim: '#f6f2ea', door: '#1c2d86' } },
    { id: 'fiftyfirst-713', status: 'active', featured: false, address: '713 51st Ave N', area: 'the-nations', zip: '37209',
      price: 699000, beds: 3, baths: 3.5, sqft: 1960, lot: '0.08 acres', year: 2021, type: 'Single-family', style: 'Modern', dom: 9, listed: '2026-10-06',
      headline: 'A light-filled modern in the heart of The Nations',
      description: ['Clerestory windows, a floating staircase and a kitchen island that seats five. This 2021 build is bright from morning to night.', 'The main bedroom has a private balcony, and the low-maintenance yard is fully fenced for a dog. The Nations’ breweries, coffee and the Silo mural are a few minutes away on foot.'],
      features: ['Clerestory windows', 'Primary bedroom balcony', 'Kitchen island seats five', 'Fenced, low-maintenance yard', 'Tankless water heater', 'Walk to 51st Ave shops'],
      openHouses: [['sun', '12:00', '14:00']],
      art: { style: 'modern', sky: '#ebe4d6', body: '#252a40', roof: '#0e1430', trim: '#c9a46b', door: '#e8b93b' } },
    { id: 'ridgecrest-2817', status: 'active', featured: false, address: '2817 Ridgecrest Dr', area: 'inglewood', zip: '37216',
      price: 529000, beds: 3, baths: 2, sqft: 1540, lot: '0.34 acres', year: 1956, type: 'Single-family', style: 'Mid-century ranch', dom: 15, listed: '2026-09-30',
      headline: 'A mid-century ranch on a third of an acre',
      description: ['Single-level living on a big, leafy lot: this 1956 ranch keeps its breeze-block screen and picture windows and adds a renovated kitchen and two updated baths.', 'The backyard has mature oaks, a stone patio and room for a pool or a garden. Inglewood’s restaurants on Gallatin Pike and the Shelby Bottoms trails are close by.'],
      features: ['Single-level living', 'Third-of-an-acre lot', 'Renovated kitchen', 'Original breeze-block screen', 'Stone patio under oaks', 'Carport and storage room'],
      openHouses: [['sat', '12:00', '14:00']],
      art: { style: 'ranch', sky: '#fbf1cf', body: '#f2cf63', roof: '#3c4155', trim: '#f6f2ea', door: '#2742cc' } },
    { id: 'woodland-1009', status: 'pending', featured: false, address: '1009 Woodland St', area: 'east-nashville', zip: '37206',
      price: 1095000, beds: 4, baths: 3, sqft: 2640, lot: '0.2 acres', year: 1914, type: 'Single-family', style: 'American Foursquare', dom: 5, listed: '2026-10-02',
      headline: 'A brick Foursquare on Woodland Street',
      description: ['Under contract after five days with three offers. A classic 1914 American Foursquare with a full-width porch, pocket doors and a third-floor attic room.'],
      features: ['Full-width front porch', 'Original pocket doors', 'Finished attic room', 'Two-car garage off the alley'],
      openHouses: [],
      art: { style: 'foursquare', sky: '#dce3fb', body: '#a13517', roof: '#252a40', trim: '#f6f2ea', door: '#0e1430' } },
    { id: 'belmont-2915', status: 'pending', featured: false, address: '2915 Belmont Blvd', area: 'twelve-south', zip: '37212',
      price: 1385000, beds: 4, baths: 3, sqft: 2480, lot: '0.18 acres', year: 1930, type: 'Single-family', style: 'Tudor Revival', dom: 8, listed: '2026-09-29',
      headline: 'A storybook Tudor on Belmont Boulevard',
      description: ['Under contract. A 1930 Tudor with a steep slate-look roof, arched doorways, leaded windows and a stone chimney, updated for modern life without losing its character.'],
      features: ['Arched doorways', 'Leaded-glass windows', 'Updated kitchen and baths', 'Walk to Belmont University'],
      openHouses: [],
      art: { style: 'tudor', sky: '#e3ead9', body: '#f1ece2', roof: '#3c4155', trim: '#3c2a20', door: '#a13517' } },
    { id: 'russell-1806', status: 'sold', featured: false, address: '1806 Russell St', area: 'east-nashville', zip: '37206',
      price: 765000, beds: 3, baths: 2, sqft: 1690, lot: '0.15 acres', year: 1925, type: 'Single-family', style: 'Craftsman bungalow', dom: 4, listed: '2026-08-14',
      sold: { price: 791000, date: '2026-08-22' },
      headline: 'Sold in four days, over asking',
      description: ['A 1925 bungalow in Lockeland Springs. We repainted, staged and launched on a Thursday with a Friday-night open house; it went under contract on Sunday with five offers.'],
      features: ['Five offers', 'Sold 3.4% over asking', 'Represented the seller'],
      openHouses: [],
      art: { style: 'bungalow', sky: '#fbf1cf', body: '#5f78e6', roof: '#1c2d86', trim: '#f6f2ea', door: '#f2cf63' } },
    { id: 'bernard-2504', status: 'sold', featured: false, address: '2504 Bernard Ave', area: 'twelve-south', zip: '37212',
      price: 1150000, beds: 3, baths: 3, sqft: 2010, lot: '0.16 acres', year: 1938, type: 'Single-family', style: 'Cottage', dom: 6, listed: '2026-09-02',
      sold: { price: 1172000, date: '2026-09-19' },
      headline: 'A 12South cottage, sold in six days',
      description: ['A renovated 1938 cottage a short walk from 12th Avenue South. Priced right on day one, it drew two offers in the first weekend.'],
      features: ['Two offers', 'Sold 1.9% over asking', 'Represented the seller'],
      openHouses: [],
      art: { style: 'tudor', sky: '#fde0d3', body: '#f6f2ea', roof: '#56704a', trim: '#252a40', door: '#e4552b' } },
    { id: 'idaho-4309', status: 'sold', featured: false, address: '4309 Idaho Ave', area: 'sylvan-park', zip: '37209',
      price: 879000, beds: 3, baths: 2, sqft: 1720, lot: '0.18 acres', year: 1931, type: 'Single-family', style: 'Brick cottage', dom: 5, listed: '2026-07-08',
      sold: { price: 895000, date: '2026-07-25' },
      headline: 'A Sylvan Park cottage for first-time buyers',
      description: ['My buyers lost out on two homes before this one. We wrote a clean offer with a short inspection window and won it over four others.'],
      features: ['Won against four offers', 'Represented the buyers', 'Closed in 21 days'],
      openHouses: [],
      art: { style: 'bungalow', sky: '#dce3fb', body: '#c6431c', roof: '#252a40', trim: '#f6f2ea', door: '#18245f' } },
    { id: 'sixth-1527', status: 'sold', featured: false, address: '1527 6th Ave N, Unit 402', area: 'germantown', zip: '37208',
      price: 549000, beds: 2, baths: 2, sqft: 1085, lot: 'Condo', year: 2015, type: 'Condo', style: 'Condo', dom: 18, listed: '2026-05-20',
      sold: { price: 541000, date: '2026-06-24' },
      headline: 'A fourth-floor Germantown condo with a balcony',
      description: ['A corner unit with skyline views. We negotiated a credit for the HVAC replacement the inspection turned up, so my buyer moved in without a big first-year bill.'],
      features: ['Represented the buyer', 'Negotiated an $8,000 credit', 'Corner unit with balcony'],
      openHouses: [],
      art: { style: 'condo', sky: '#fbf1cf', body: '#3c4155', roof: '#0e1430', trim: '#ebe4d6', door: '#e4552b' } },
    { id: 'louisiana-5207', status: 'sold', featured: false, address: '5207 Louisiana Ave', area: 'the-nations', zip: '37209',
      price: 725000, beds: 3, baths: 2.5, sqft: 1880, lot: '0.09 acres', year: 2020, type: 'Single-family', style: 'Modern', dom: 7, listed: '2026-08-28',
      sold: { price: 738500, date: '2026-09-12' },
      headline: 'A Nations modern, sold for a relocating family',
      description: ['My sellers were moving to Denver for work. We listed while they were already gone, with a video walkthrough and a lockbox schedule, and closed on their timeline.'],
      features: ['Remote sale', 'Sold 1.9% over asking', 'Represented the sellers'],
      openHouses: [],
      art: { style: 'modern', sky: '#e3ead9', body: '#f6f2ea', roof: '#252a40', trim: '#56704a', door: '#c6431c' } },
    { id: 'shelton-1123', status: 'sold', featured: false, address: '1123 Shelton Ave', area: 'inglewood', zip: '37216',
      price: 489000, beds: 3, baths: 2, sqft: 1420, lot: '0.29 acres', year: 1952, type: 'Single-family', style: 'Ranch', dom: 3, listed: '2026-05-06',
      sold: { price: 502000, date: '2026-05-29' },
      headline: 'An Inglewood ranch, sold in a weekend',
      description: ['A well-kept 1952 ranch. Fresh paint, a tidy-up of the yard and honest pricing brought a weekend of showings and a clean offer on Monday morning.'],
      features: ['Sold 2.7% over asking', 'Three days on market', 'Represented the seller'],
      openHouses: [],
      art: { style: 'ranch', sky: '#dce3fb', body: '#8fa97a', roof: '#252a40', trim: '#f6f2ea', door: '#e4552b' } },
    { id: 'eastland-1615', status: 'sold', featured: false, address: '1615 Eastland Ave', area: 'east-nashville', zip: '37206',
      price: 960000, beds: 4, baths: 3, sqft: 2380, lot: '0.22 acres', year: 1908, type: 'Single-family', style: 'Victorian', dom: 12, listed: '2026-04-02',
      sold: { price: 960000, date: '2026-04-30' },
      headline: 'A grand Eastland Victorian, at full asking',
      description: ['A large 1908 Victorian with a turret room. We priced it to the comps rather than to hope, and it sold at full asking with no repair requests.'],
      features: ['Sold at 100% of asking', 'No repair requests', 'Represented the seller'],
      openHouses: [],
      art: { style: 'victorian', sky: '#fde0d3', body: '#56704a', roof: '#252a40', trim: '#f6f2ea', door: '#f2cf63' } }
  ];

  /* ---------- Home value estimate (index.html teaser and sell.html) ----------
     value = square feet x neighborhood ppsf x type x condition x (1 + rooms + extras).
     The range is the value plus or minus `spread`, rounded to `round`. Illustrative only. */
  var VALUATION = {
    type: { house: 1, townhome: 0.95, condo: 0.9 },
    condition: { 'needs-work': 0.84, original: 0.93, updated: 1, renovated: 1.08 },
    perBed: 0.015,          // per bedroom above or below 3
    perBath: 0.02,          // per bathroom above or below 2
    extras: { parking: 0.015, outdoor: 0.01, adu: 0.06 },
    spread: { 'needs-work': 0.08, original: 0.06, updated: 0.05, renovated: 0.05 },
    round: 5000,
    minSqft: 400,
    maxSqft: 9000
  };

  /* ---------- Consultation booking (contact.html) ----------
     Slots are generated in Nashville time (AGENT.timeZone). Nothing is booked: see DOCS.md,
     "Consultation booking", to connect Cal.com, Calendly or a form service. */
  var CONSULT_TYPES = {
    buyer: { label: 'Buyer consultation', minutes: 45, where: 'Coffee in East Nashville or video call' },
    seller: { label: 'Pricing & listing walkthrough', minutes: 60, where: 'At your home' },
    value: { label: 'Quick home-value call', minutes: 20, where: 'Phone call' },
    relocation: { label: 'Moving to Nashville call', minutes: 30, where: 'Video call' }
  };
  var AVAILABILITY = {
    // Day 0 is Sunday. Each window is [start, end] in 24-hour "HH:MM" Nashville time.
    hours: {
      1: [['09:00', '12:00'], ['13:00', '18:00']],
      2: [['09:00', '12:00'], ['13:00', '18:00']],
      3: [['09:00', '12:00'], ['13:00', '18:00']],
      4: [['09:00', '12:00'], ['13:00', '18:00']],
      5: [['09:00', '12:00'], ['13:00', '17:00']],
      6: [['10:00', '14:00']]
    },
    slotStep: 30,          // minutes between start times
    minNoticeHours: 12,    // earliest bookable slot from now
    daysShown: 14,         // number of bookable days in the day strip
    closed: ['2026-11-26', '2026-11-27', '2026-12-24', '2026-12-25', '2026-12-31', '2027-01-01'],
    demoBusyShare: 0.3     // share of slots shown as taken so the demo looks realistic. Set to 0 when connected.
  };

  /* ---------- Small helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function moneyShort(n) {
    if (n >= 1000000) return '$' + (Math.round(n / 10000) / 100).toString().replace(/\.?0+$/, '') + 'M';
    return '$' + Math.round(n / 1000) + 'K';
  }
  function num(v) { var n = parseFloat(String(v).replace(/[^0-9.\-]/g, '')); return isFinite(n) ? n : NaN; }
  function areaById(id) { for (var i = 0; i < AREAS.length; i++) if (AREAS[i].id === id) return AREAS[i]; return null; }
  function listingById(id) { for (var i = 0; i < LISTINGS.length; i++) if (LISTINGS[i].id === id) return LISTINGS[i]; return null; }
  function bathsText(b) { return (b % 1 ? b.toFixed(1) : String(b)); }
  var STATUS_LABEL = { active: 'For sale', pending: 'Under contract', sold: 'Sold' };
  var ICON = {
    check: '<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
    alert: '<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16v.01"/></svg>',
    arrow: '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    bed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 18.5v-11M3 14h18v4.5M21 14v-2.5a3 3 0 0 0-3-3h-7V14"/><circle cx="7" cy="11" r="1.8"/></svg>',
    bath: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16v2.5a4.5 4.5 0 0 1-4.5 4.5h-7A4.5 4.5 0 0 1 4 14.5ZM6 12V6a2 2 0 0 1 3.7-1M7 19l-1 2M17 19l1 2"/></svg>',
    area: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>',
    pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-6.5-5.4-6.5-11a6.5 6.5 0 0 1 13 0c0 5.6-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/></svg>',
    cal: '<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    download: '<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 10.5l5 5 5-5M5 20h14"/></svg>'
  };

  /* =========================================================================
     Illustrations: houses and rooms drawn as SVG from a listing's `art` colors.
     ========================================================================= */
  var GLASS = '#fbf1cf', GLASS_SHADE = '#e8b93b', LAWN = '#cfdcc2', TREE = '#8fa97a', TREE_DARK = '#56704a';
  function r(x, y, w, h, fill, extra) { return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function poly(points, fill, extra) { return '<polygon points="' + points + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function win(x, y, w, h, trim, opts) {
    opts = opts || {};
    var s = r(x - 3, y - 3, w + 6, h + 6, trim) + r(x, y, w, h, GLASS) + r(x, y + h * 0.55, w, h * 0.45, GLASS_SHADE, ' opacity=".35"');
    if (!opts.plain) s += r(x + w / 2 - 1, y, 2, h, trim) + (opts.cross === false ? '' : r(x, y + h / 2 - 1, w, 2, trim));
    return s;
  }
  function door(x, y, w, h, color, trim) { return r(x - 3, y - 3, w + 6, h + 3, trim) + r(x, y, w, h, color) + '<circle cx="' + (x + w - 6) + '" cy="' + (y + h * 0.55) + '" r="2" fill="' + GLASS + '"/>'; }
  function tree(x, y, s) {
    s = s || 1;
    return r(x - 3 * s, y, 6 * s, 46 * s, '#6b4f3a') + '<circle cx="' + x + '" cy="' + (y - 4 * s) + '" r="' + 30 * s + '" fill="' + TREE + '"/><circle cx="' + (x + 12 * s) + '" cy="' + (y + 6 * s) + '" r="' + 19 * s + '" fill="' + TREE_DARK + '" opacity=".55"/>';
  }
  function shrub(x, y, w) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + w + '" ry="' + (w * 0.55) + '" fill="' + TREE_DARK + '"/>'; }
  function scene(c, inner, opts) {
    opts = opts || {};
    var sun = opts.noSun ? '' : '<circle cx="' + (opts.sunX || 326) + '" cy="62" r="30" fill="#fff" opacity=".7"/>';
    return '<rect width="400" height="300" fill="' + c.sky + '"/>' + sun +
      '<path d="M0 252h400v48H0Z" fill="' + LAWN + '"/><path d="M0 256h400" stroke="#fff" stroke-width="2" opacity=".6"/>' +
      '<ellipse cx="200" cy="254" rx="150" ry="6" fill="#0e1430" opacity=".08"/>' + inner;
  }
  var HOUSES = {
    victorian: function (c) {
      var s = tree(52, 208, 0.9);
      s += r(108, 122, 184, 130, c.body);
      s += poly('96,128 200,46 304,128', c.roof) + poly('120,126 200,64 280,126', c.body);
      s += '<path d="M134 124 200 72l66 52" fill="none" stroke="' + c.trim + '" stroke-width="3"/>';
      s += win(182, 84, 36, 30, c.trim) + win(128, 136, 30, 40, c.trim) + win(242, 136, 30, 40, c.trim);
      s += r(90, 184, 220, 10, c.roof) + r(92, 194, 216, 4, c.trim);
      for (var i = 0; i < 5; i++) s += r(98 + i * 50, 198, 6, 54, c.trim);
      s += r(98, 228, 206, 3, c.trim);
      for (var j = 0; j < 20; j++) s += r(106 + j * 10, 231, 2, 21, c.trim, ' opacity=".8"');
      s += door(186, 204, 28, 48, c.door, c.trim) + win(126, 206, 32, 22, c.trim, { cross: false }) + win(242, 206, 32, 22, c.trim, { cross: false });
      s += r(176, 252, 48, 6, '#ded4c1') + shrub(80, 250, 16) + shrub(318, 250, 18);
      return scene(c, s);
    },
    farmhouse: function (c) {
      var s = tree(350, 206, 0.85);
      s += r(78, 140, 168, 112, c.body) + poly('68,146 162,64 256,146', c.roof) + poly('84,142 162,76 240,142', c.body);
      for (var i = 0; i < 15; i++) s += r(86 + i * 11, 142, 1.5, 110, '#0e1430', ' opacity=".07"');
      s += r(246, 168, 92, 84, c.body) + poly('240,172 338,150 344,160 246,182', c.roof);
      s += win(140, 90, 44, 40, c.trim) + win(96, 166, 44, 52, c.trim) + win(184, 166, 44, 52, c.trim) + win(262, 192, 60, 34, c.trim, { cross: false });
      s += r(128, 220, 72, 6, c.roof) + door(150, 226, 28, 26, c.door, c.trim) + r(150, 226, 28, 26, c.door);
      s += r(70, 230, 8, 22, c.trim) + r(246, 230, 8, 22, c.trim);
      s += shrub(110, 250, 18) + shrub(214, 250, 18) + shrub(300, 250, 22) + r(146, 252, 36, 6, '#ded4c1');
      return scene(c, s, { sunX: 80 });
    },
    bungalow: function (c) {
      var s = tree(44, 210, 0.75) + tree(360, 214, 0.7);
      s += r(78, 160, 244, 92, c.body);
      s += poly('54,168 200,90 346,168', c.roof) + poly('92,164 200,106 308,164', c.body);
      s += '<path d="M88 164 200 104l112 60" fill="none" stroke="' + c.trim + '" stroke-width="3"/>';
      s += win(178, 122, 44, 26, c.trim, { cross: false }) + r(178, 132, 44, 2, c.trim);
      s += r(70, 176, 260, 10, c.roof);
      [86, 156, 228, 298].forEach(function (x) { s += poly((x - 6) + ',252 ' + (x + 22) + ',252 ' + (x + 16) + ',212 ' + x + ',212', c.trim) + r(x - 2, 186, 12, 26, c.trim); s += r(x - 8, 232, 32, 20, '#c9bba2'); });
      s += win(108, 196, 38, 30, c.trim) + win(254, 196, 38, 30, c.trim) + door(186, 198, 28, 54, c.door, c.trim);
      s += r(174, 252, 52, 6, '#ded4c1');
      return scene(c, s);
    },
    townhome: function (c) {
      var s = '';
      [104, 200].forEach(function (x, k) {
        s += r(x, 60, 96, 192, k ? c.body : c.roof === '#0e1430' ? c.body : c.body);
        s += r(x, 60, 96, 192, '#0e1430', ' opacity="' + (k ? 0 : 0.08) + '"');
        s += r(x - 4, 52, 104, 12, c.roof) + r(x - 2, 64, 100, 4, c.trim);
        s += win(x + 14, 82, 26, 36, c.trim) + win(x + 56, 82, 26, 36, c.trim) + win(x + 14, 140, 26, 36, c.trim) + win(x + 56, 140, 26, 36, c.trim);
        s += win(x + 54, 200, 30, 32, c.trim, { cross: false }) + door(x + 14, 196, 26, 56, c.door, c.trim);
        s += r(x + 8, 236, 38, 4, c.trim) + r(x + 10, 244, 34, 8, '#ded4c1');
        for (var i = 0; i < 9; i++) s += r(x, 72 + i * 20, 96, 1, '#0e1430', ' opacity=".08"');
      });
      s += '<path d="M104 46h192" stroke="' + c.trim + '" stroke-width="2"/>' + r(110, 34, 44, 12, 'none', ' stroke="' + c.trim + '" stroke-width="2"') + shrub(82, 250, 16) + shrub(318, 250, 16) + tree(46, 212, 0.75) + tree(356, 212, 0.75);
      return scene(c, s, { sunX: 64 });
    },
    modern: function (c) {
      var s = tree(70, 212, 0.8);
      s += r(132, 82, 140, 170, c.body) + poly('124,92 280,58 280,70 124,104', c.roof);
      s += r(272, 140, 70, 112, c.trim) + r(272, 132, 74, 8, c.roof);
      for (var i = 0; i < 9; i++) s += r(276, 146 + i * 11, 62, 4, '#0e1430', ' opacity=".14"');
      s += r(148, 104, 108, 22, GLASS) + r(148, 104, 108, 22, '#0e1430', ' opacity=".08"');
      s += win(148, 140, 52, 66, c.trim, { plain: true }) + r(212, 140, 44, 30, GLASS) + r(212, 140, 44, 30, '#0e1430', ' opacity=".06"');
      s += r(140, 206, 68, 4, c.trim) + door(222, 196, 28, 56, c.door, c.trim);
      s += r(144, 210, 60, 2, c.trim) + r(150, 212, 2, 40, c.trim, ' opacity="0"');
      s += r(214, 252, 44, 6, '#ded4c1') + shrub(300, 250, 22);
      return scene(c, s, { sunX: 340 });
    },
    ranch: function (c) {
      var s = tree(366, 204, 0.95);
      s += r(44, 170, 312, 82, c.body) + poly('30,176 116,136 284,136 370,176', c.roof) + r(30, 174, 340, 6, c.trim);
      s += win(66, 192, 90, 36, c.trim) + r(64, 228, 94, 8, '#8a5a3c');
      for (var i = 0; i < 4; i++) for (var j = 0; j < 3; j++) s += '<circle cx="' + (256 + i * 18) + '" cy="' + (198 + j * 18) + '" r="6" fill="none" stroke="' + c.trim + '" stroke-width="3"/>';
      s += r(246, 186, 82, 66, '#0e1430', ' opacity=".05"') + door(196, 196, 30, 56, c.door, c.trim);
      s += shrub(110, 250, 22) + shrub(176, 251, 10) + r(186, 252, 50, 6, '#ded4c1');
      return scene(c, s, { sunX: 72 });
    },
    foursquare: function (c) {
      var s = tree(356, 208, 0.85);
      s += r(104, 98, 192, 154, c.body);
      for (var i = 0; i < 15; i++) s += r(104, 104 + i * 10, 192, 1, '#0e1430', ' opacity=".08"');
      s += poly('92,104 156,56 244,56 308,104', c.roof);
      s += r(178, 62, 44, 30, c.body) + poly('172,66 200,46 228,66', c.roof) + win(188, 70, 24, 16, c.trim, { cross: false });
      s += win(124, 114, 40, 42, c.trim) + win(236, 114, 40, 42, c.trim) + win(184, 118, 32, 34, c.trim);
      s += r(92, 176, 216, 12, c.roof) + r(94, 188, 212, 4, c.trim);
      [98, 160, 234, 296].forEach(function (x) { s += r(x - 2, 192, 12, 60, c.trim); });
      s += win(122, 202, 40, 30, c.trim) + win(238, 202, 40, 30, c.trim) + door(186, 202, 28, 50, c.door, c.trim);
      s += r(176, 252, 48, 6, '#ded4c1') + shrub(70, 250, 16);
      return scene(c, s, { sunX: 64 });
    },
    tudor: function (c) {
      var s = tree(56, 210, 0.8);
      s += r(98, 146, 210, 106, c.body) + r(264, 92, 22, 70, '#8a5a3c') + r(260, 86, 30, 8, '#6b4f3a');
      s += poly('206,152 254,118 330,152', c.roof) + poly('84,158 156,52 228,158', c.roof) + poly('106,156 156,82 206,156', c.body);
      s += '<path d="M156 84v70M126 128l30-22 30 22M116 146h80" stroke="' + c.trim + '" stroke-width="4" fill="none"/>';
      s += win(140, 112, 32, 24, c.trim, { cross: false });
      s += '<path d="M138 252v-34a18 18 0 0 1 36 0v34Z" fill="' + c.trim + '"/><path d="M142 252v-33a14 14 0 0 1 28 0v33Z" fill="' + c.door + '"/><circle cx="164" cy="234" r="2" fill="' + GLASS + '"/>';
      s += win(212, 178, 26, 38, c.trim) + win(256, 178, 26, 38, c.trim) + win(106, 186, 22, 30, c.trim);
      s += r(146, 252, 24, 6, '#ded4c1') + shrub(300, 250, 18) + shrub(206, 250, 12);
      return scene(c, s, { sunX: 340 });
    },
    condo: function (c) {
      var s = '';
      s += r(96, 40, 208, 212, c.body) + r(90, 32, 220, 10, c.roof);
      for (var f = 0; f < 4; f++) {
        var y = 54 + f * 38;
        for (var k = 0; k < 3; k++) s += r(108 + k * 66, y, 52, 26, GLASS) + r(108 + k * 66, y + 14, 52, 12, GLASS_SHADE, ' opacity=".3"');
        s += r(100, y + 26, 200, 4, c.trim) + r(100, y + 30, 200, 1.5, c.trim, ' opacity=".6"');
      }
      s += r(96, 206, 208, 46, '#0e1430', ' opacity=".18"') + r(110, 212, 120, 40, GLASS) + door(248, 212, 32, 40, c.door, c.trim);
      for (var i = 0; i < 4; i++) s += r(110 + i * 30, 212, 2, 40, c.trim);
      s += tree(52, 212, 0.8) + tree(350, 212, 0.8);
      return scene(c, s, { sunX: 340 });
    }
  };
  function houseSVG(l, cls, label) {
    var draw = HOUSES[l.art.style] || HOUSES.bungalow;
    var a11y = label ? 'role="img" aria-label="' + esc(label) + '"' : 'aria-hidden="true"';
    return '<svg class="' + (cls || 'block h-auto w-full') + '" viewBox="0 0 400 300" ' + a11y + '>' + draw(l.art) + '</svg>';
  }

  /* Rooms for the listing gallery. Wall colors are a light tint of the house color. */
  function tint(hex, amount) {
    var n = parseInt(hex.slice(1), 16), rr = n >> 16, g = (n >> 8) & 255, b = n & 255;
    function m(v) { return Math.round(v + (255 - v) * amount); }
    return '#' + ((1 << 24) + (m(rr) << 16) + (m(g) << 8) + m(b)).toString(16).slice(1);
  }
  var ROOMS = {
    living: function (c) {
      var wall = tint(c.body, 0.82), acc = c.door;
      return r(0, 0, 400, 300, wall) + r(0, 222, 400, 78, '#c9a46b') + r(0, 222, 400, 3, '#8a5a3c', ' opacity=".4"') +
        [40, 120, 200, 280, 360].map(function (x) { return r(x, 225, 1.5, 75, '#8a5a3c', ' opacity=".25"'); }).join('') +
        r(36, 52, 112, 128, '#fff') + r(42, 58, 100, 116, c.sky) + '<circle cx="118" cy="86" r="14" fill="#fff" opacity=".8"/>' + r(42, 140, 100, 34, LAWN) + r(91, 58, 2, 116, '#fff') +
        r(214, 70, 64, 48, '#0e1430') + r(218, 74, 56, 40, tint(acc, 0.35)) + '<circle cx="246" cy="94" r="10" fill="' + GLASS + '"/>' + r(290, 82, 40, 36, '#0e1430') + r(294, 86, 32, 28, c.sky) +
        '<path d="M176 222v-56h188v56" fill="' + acc + '"/>' + r(170, 186, 200, 40, acc) + r(170, 186, 200, 40, '#0e1430', ' opacity=".12"') + r(164, 176, 22, 50, acc) + r(354, 176, 22, 50, acc) +
        r(190, 166, 50, 22, tint(acc, 0.5)) + r(300, 166, 50, 22, tint(acc, 0.5)) + r(176, 226, 6, 10, '#3c2a20') + r(358, 226, 6, 10, '#3c2a20') +
        '<ellipse cx="250" cy="258" rx="70" ry="10" fill="#0e1430" opacity=".1"/>' + r(200, 236, 104, 8, '#3c2a20') + r(208, 244, 4, 14, '#3c2a20') + r(292, 244, 4, 14, '#3c2a20') +
        r(60, 196, 26, 30, '#c6431c') + '<circle cx="73" cy="178" r="22" fill="' + TREE + '"/><circle cx="62" cy="170" r="12" fill="' + TREE_DARK + '"/>' +
        '<path d="M120 222V130" stroke="#0e1430" stroke-width="3"/><path d="M104 132h32l-6-22h-20Z" fill="' + GLASS + '"/>';
    },
    kitchen: function (c) {
      var wall = tint(c.body, 0.86), cab = c.trim === '#f6f2ea' ? tint(c.body, 0.25) : c.trim;
      var s = r(0, 0, 400, 300, wall) + r(0, 240, 400, 60, '#ded4c1');
      for (var i = 0; i < 6; i++) s += r(30 + i * 56, 40, 50, 64, cab) + r(52 + i * 56, 82, 6, 2, '#fff');
      s += r(30, 104, 340, 50, '#fff') + '<path d="M30 129h340M86 104v50M142 104v50M198 104v50M254 104v50M310 104v50" stroke="' + wall + '" stroke-width="1.5"/>';
      s += r(26, 154, 348, 8, '#ebe4d6') + r(30, 162, 340, 78, cab);
      for (var j = 0; j < 5; j++) s += r(36 + j * 68, 168, 60, 66, '#0e1430', ' opacity=".06"') + r(62 + j * 68, 176, 8, 2, '#fff');
      s += r(110, 190, 180, 12, '#f1ece2') + r(118, 202, 164, 60, c.door) + r(118, 202, 164, 60, '#0e1430', ' opacity=".1"');
      s += [150, 200, 250].map(function (x) { return '<path d="M' + x + ' 0v40" stroke="#0e1430" stroke-width="2"/><path d="M' + (x - 14) + ' 54a14 14 0 0 1 28 0Z" fill="' + c.roof + '"/><circle cx="' + x + '" cy="58" r="5" fill="' + GLASS + '"/>'; }).join('');
      s += '<circle cx="320" cy="146" r="10" fill="' + TREE + '"/>' + r(314, 146, 12, 10, '#c6431c') + r(52, 138, 30, 16, '#fff') + r(56, 132, 22, 6, c.door);
      s += [140, 190, 240].map(function (x) { return r(x, 262, 22, 6, '#3c2a20') + r(x + 3, 268, 3, 32, '#3c2a20') + r(x + 16, 268, 3, 32, '#3c2a20'); }).join('');
      return s;
    },
    bedroom: function (c) {
      var wall = tint(c.door, 0.85), acc = c.body;
      return r(0, 0, 400, 300, wall) + r(0, 230, 400, 70, '#c9a46b') + r(0, 230, 400, 3, '#8a5a3c', ' opacity=".4"') +
        r(286, 40, 84, 110, '#fff') + r(292, 46, 72, 98, c.sky) + '<circle cx="342" cy="78" r="12" fill="#fff" opacity=".8"/>' + r(292, 120, 72, 24, LAWN) + r(327, 46, 2, 98, '#fff') +
        r(96, 98, 168, 92, acc) + r(96, 98, 168, 92, '#0e1430', ' opacity=".1"') + r(84, 172, 192, 50, '#fff') + r(84, 196, 192, 30, tint(c.door, 0.4)) + r(108, 158, 56, 26, '#fff') + r(196, 158, 56, 26, '#fff') +
        r(88, 222, 6, 14, '#3c2a20') + r(266, 222, 6, 14, '#3c2a20') +
        r(30, 176, 44, 50, '#3c2a20') + r(26, 172, 52, 6, '#3c2a20') + '<path d="M52 172v-30" stroke="#0e1430" stroke-width="2.5"/><path d="M40 144h24l-4-18h-16Z" fill="' + GLASS + '"/>' +
        r(286, 186, 44, 40, '#3c2a20') + r(282, 182, 52, 6, '#3c2a20') + '<circle cx="308" cy="170" r="10" fill="' + TREE + '"/>' + r(302, 172, 12, 10, c.door) +
        r(140, 40, 80, 46, '#fff') + r(146, 46, 68, 34, tint(c.door, 0.55)) + '<path d="M146 80l22-20 16 14 12-8 18 14Z" fill="' + c.door + '" opacity=".6"/>';
    },
    bath: function (c) {
      var wall = tint(c.body, 0.9), tile = '#fff';
      var s = r(0, 0, 400, 300, wall);
      for (var y = 120; y < 300; y += 18) for (var x = 0; x < 400; x += 26) s += r(x + ((y / 18) % 2 ? 13 : 0), y, 24, 16, tile, ' opacity=".7"');
      s += r(0, 250, 400, 50, '#ded4c1');
      s += '<path d="M40 190h190v24a36 36 0 0 1-36 36H76a36 36 0 0 1-36-36Z" fill="#fff" stroke="#c9bba2" stroke-width="2"/>' + r(48, 194, 174, 10, tint(c.sky, 0.2));
      s += r(62, 250, 8, 14, '#c9a46b') + r(200, 250, 8, 14, '#c9a46b') + '<path d="M210 190v-46a12 12 0 0 1 24 0" fill="none" stroke="#3c4155" stroke-width="4"/>';
      s += r(262, 160, 108, 70, c.door) + r(262, 160, 108, 70, '#0e1430', ' opacity=".1"') + r(256, 152, 120, 10, '#f1ece2') + '<ellipse cx="316" cy="152" rx="26" ry="5" fill="#fff"/>';
      s += r(280, 40, 72, 94, '#c9a46b') + r(286, 46, 60, 82, tint(c.sky, 0.3)) + '<path d="M296 60l20-10M296 74l34-18" stroke="#fff" stroke-width="3" opacity=".7"/>';
      s += r(80, 40, 120, 70, '#fff') + r(86, 46, 108, 58, c.sky) + r(139, 46, 2, 58, '#fff') + '<circle cx="360" cy="138" r="9" fill="' + TREE + '"/>' + r(354, 140, 12, 12, '#fff');
      return s;
    },
    yard: function (c) {
      var s = r(0, 0, 400, 300, c.sky) + '<circle cx="80" cy="60" r="26" fill="#fff" opacity=".7"/>' + r(0, 170, 400, 130, LAWN);
      for (var i = 0; i < 20; i++) s += r(i * 20, 120, 16, 64, '#c9a46b') + r(i * 20, 120, 16, 4, '#8a5a3c', ' opacity=".4"');
      s += tree(340, 120, 1.1) + tree(40, 130, 0.8);
      s += '<path d="M0 30 Q100 60 200 34 T400 40" fill="none" stroke="#3c4155" stroke-width="1.5"/>' + [30, 70, 110, 150, 190, 230, 270, 310, 350].map(function (x, k) { return '<circle cx="' + x + '" cy="' + (36 + 14 * Math.sin(k)) + '" r="4" fill="' + GLASS + '"/>'; }).join('');
      s += poly('20,300 60,214 340,214 380,300', '#c9a46b') + [0, 1, 2, 3, 4, 5].map(function (k) { return '<path d="M' + (20 + k * 72) + ' 300 L' + (60 + k * 56) + ' 214" stroke="#8a5a3c" stroke-width="1.5" opacity=".35"/>'; }).join('');
      s += r(130, 222, 120, 8, '#3c2a20') + r(140, 230, 6, 34, '#3c2a20') + r(234, 230, 6, 34, '#3c2a20');
      s += r(96, 204, 30, 40, c.door) + r(254, 204, 30, 40, c.door) + r(92, 238, 38, 6, '#3c2a20') + r(250, 238, 38, 6, '#3c2a20');
      s += '<ellipse cx="190" cy="214" rx="20" ry="4" fill="' + c.door + '" opacity=".5"/><circle cx="190" cy="208" r="8" fill="' + TREE_DARK + '"/>';
      return s;
    }
  };
  var GALLERY = [
    ['exterior', 'Front of the house'], ['living', 'Living room'], ['kitchen', 'Kitchen'],
    ['bedroom', 'Primary bedroom'], ['bath', 'Primary bath'], ['yard', 'Back yard']
  ];
  function roomSVG(kind, l, cls, label) {
    if (kind === 'exterior') return houseSVG(l, cls, label);
    var a11y = label ? 'role="img" aria-label="' + esc(label) + '"' : 'aria-hidden="true"';
    return '<svg class="' + (cls || 'block h-auto w-full') + '" viewBox="0 0 400 300" ' + a11y + '>' + ROOMS[kind](l.art) + '</svg>';
  }

  /* =========================================================================
     Header, reveals, counters, carousel, accordion
     ========================================================================= */
  var header = document.getElementById('site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 48); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  var menuBtn = document.getElementById('menu-button');
  var menu = document.getElementById('mobile-menu');
  if (menuBtn && menu) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('hidden', !open);
      $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
      $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
    };
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* Scroll reveal: .reveal fades in. Everything above an element that becomes visible is
     revealed too, so fast jumps (End key, anchors) never leave hidden content behind. */
  var reveals = [];
  var revealIo = null;
  function observeReveals() {
    var fresh = $$('.reveal').filter(function (el) { return reveals.indexOf(el) === -1 && !el.classList.contains('is-visible'); });
    if (!fresh.length) return;
    reveals = reveals.concat(fresh);
    // Keep document order so "everything above" is correct after dynamic content is added.
    reveals.sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
    if (reduceMotion.matches || !('IntersectionObserver' in window)) { fresh.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    if (!revealIo) {
      revealIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var index = reveals.indexOf(entry.target);
          reveals.slice(0, index + 1).forEach(function (el) { el.classList.add('is-visible'); revealIo.unobserve(el); });
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    }
    fresh.forEach(function (el) { revealIo.observe(el); });
  }

  /* Count-up numbers: [data-count] (optional data-decimals, data-prefix, data-suffix). */
  var counters = $$('[data-count]');
  if (counters.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
    var countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target, end = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
        countIo.unobserve(el);
        var start = null, dur = 1400;
        var step = function (t) {
          if (start === null) start = t;
          var p = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (end * eased).toFixed(dec);
          if (p < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countIo.observe(el); });
  }

  /* Testimonial carousel ([data-carousel]): a native scroll-snap track with prev/next buttons. */
  $$('[data-carousel]').forEach(function (root) {
    var track = $('[data-carousel-track]', root);
    var prev = $('[data-carousel-prev]', root), next = $('[data-carousel-next]', root), status = $('[data-carousel-status]', root);
    var slides = $$(':scope > li', track);
    function step() { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth; }
    function update() {
      var i = Math.round(track.scrollLeft / step());
      var max = track.scrollWidth - track.clientWidth - 2;
      var perView = Math.max(1, Math.round(track.clientWidth / step()));
      if (track.scrollLeft >= max) i = slides.length - perView;
      if (status) status.textContent = (i + 1) + ' / ' + slides.length;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    function go(dir) { track.scrollBy({ left: dir * step(), behavior: reduceMotion.matches ? 'auto' : 'smooth' }); }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* Accordion: .acc-btn controls the panel named in aria-controls. */
  $$('.acc-btn').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    });
  });

  /* =========================================================================
     Listing cards
     ========================================================================= */
  function soldPct(l) { return l.sold ? Math.round(l.sold.price / l.price * 1000) / 10 : 0; }
  function shortDate(iso) { return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  function listingCard(l, opts) {
    opts = opts || {};
    var area = areaById(l.area);
    var pill = '<span class="pill pill-' + l.status + '">' + (l.status === 'active' ? '<span class="size-1.5 rounded-full bg-cobalt-600" aria-hidden="true"></span>' : '') + STATUS_LABEL[l.status] + '</span>';
    var open = l.status === 'active' && l.openHouses.length ? '<span class="pill pill-open">Open house</span>' : '';
    var priceLine = l.sold
      ? '<p class="font-display text-[1.75rem] leading-none text-ink-950">' + money(l.sold.price) + '</p><p class="mt-1.5 text-sm font-semibold text-moss-700">Sold ' + shortDate(l.sold.date) + ' &middot; ' + soldPct(l) + '% of asking</p>'
      : '<p class="font-display text-[1.75rem] leading-none text-ink-950">' + money(l.price) + '</p><p class="mt-1.5 text-sm text-ink-600">' + esc(l.style) + ' &middot; built ' + l.year + '</p>';
    var tag = opts.tag || 'li';
    return '<' + tag + ' class="listing-card reveal">' +
      '<div class="relative">' + houseSVG(l, 'block aspect-[4/3] h-auto w-full') +
      '<div class="absolute top-4 left-4 flex flex-wrap gap-2">' + pill + open + '</div></div>' +
      '<div class="flex flex-1 flex-col p-5 sm:p-6">' +
      '<p class="text-xs font-bold tracking-[0.14em] text-persimmon-700 uppercase">' + esc(area ? area.name : '') + '</p>' +
      '<h3 class="mt-2 text-lg font-semibold text-ink-950"><a class="stretched" href="listing.html?id=' + encodeURIComponent(l.id) + '">' + esc(l.address) + '</a></h3>' +
      '<div class="mt-4">' + priceLine + '</div>' +
      '<ul class="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-t border-sand-200 pt-4" aria-label="Key facts">' +
      '<li class="fact">' + ICON.bed + l.beds + ' bd</li><li class="fact">' + ICON.bath + bathsText(l.baths) + ' ba</li><li class="fact">' + ICON.area + l.sqft.toLocaleString('en-US') + ' sq ft</li></ul>' +
      '</div></' + tag + '>';
  }

  var featured = $('[data-featured-listings]');
  if (featured) {
    featured.innerHTML = LISTINGS.filter(function (l) { return l.featured && l.status === 'active'; }).slice(0, 3).map(function (l) { return listingCard(l); }).join('');
  }
  var recentSold = $('[data-recent-sold]');
  if (recentSold) {
    recentSold.innerHTML = LISTINGS.filter(function (l) { return l.status === 'sold'; })
      .sort(function (a, b) { return a.sold.date < b.sold.date ? 1 : -1; }).slice(0, 4)
      .map(function (l) {
        return '<li class="flex items-center gap-4 py-4"><a href="listing.html?id=' + l.id + '" class="group flex min-w-0 flex-1 items-center gap-4"><span class="block w-24 shrink-0 overflow-hidden rounded-xl">' + houseSVG(l, 'block h-auto w-full') + '</span><span class="min-w-0"><span class="block truncate font-semibold text-ink-950 group-hover:underline">' + esc(l.address) + '</span><span class="mt-0.5 block text-sm text-ink-600">' + esc(areaById(l.area).name) + ' &middot; ' + l.dom + ' days on market</span></span></a><span class="shrink-0 text-right"><span class="block font-display text-xl text-ink-950">' + moneyShort(l.sold.price) + '</span><span class="block text-xs font-bold text-moss-700">' + soldPct(l) + '%</span></span></li>';
      }).join('');
  }

  /* =========================================================================
     Listings page ([data-listings]): status tabs, filters, sort, URL state
     ========================================================================= */
  var PRICE_STEPS = [400000, 500000, 600000, 750000, 900000, 1000000, 1250000, 1500000, 2000000];
  var SORTS = { newest: 'Newest', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low', size: 'Largest first' };
  var listingsRoot = $('[data-listings]');
  if (listingsRoot) initListings(listingsRoot);

  function initListings(root) {
    var DEFAULTS = { status: 'active', area: 'all', beds: 0, min: 0, max: 0, sort: 'newest' };
    var state = Object.assign({}, DEFAULTS);
    var grid = $('[data-results]', root), countEl = $('[data-result-count]', root), empty = $('[data-empty]', root);
    var areaSel = $('[name="area"]', root), minSel = $('[name="min"]', root), maxSel = $('[name="max"]', root), sortSel = $('[name="sort"]', root);
    var tabs = $$('[data-status]', root), clearBtns = $$('[data-clear]', root);

    // Fill the selects from the data so they always match AREAS and PRICE_STEPS.
    areaSel.innerHTML = '<option value="all">All neighborhoods</option>' + AREAS.map(function (a) { return '<option value="' + a.id + '">' + esc(a.name) + '</option>'; }).join('');
    minSel.innerHTML = '<option value="0">No min</option>' + PRICE_STEPS.map(function (p) { return '<option value="' + p + '">' + moneyShort(p) + '</option>'; }).join('');
    maxSel.innerHTML = '<option value="0">No max</option>' + PRICE_STEPS.map(function (p) { return '<option value="' + p + '">' + moneyShort(p) + '</option>'; }).join('');
    sortSel.innerHTML = Object.keys(SORTS).map(function (k) { return '<option value="' + k + '">' + SORTS[k] + '</option>'; }).join('');

    function priceOf(l) { return l.sold ? l.sold.price : l.price; }
    function matches(l, s, skip) {
      if (skip !== 'status' && s.status !== 'all' && l.status !== s.status) return false;
      if (skip !== 'area' && s.area !== 'all' && l.area !== s.area) return false;
      if (s.beds && l.beds < s.beds) return false;
      if (s.min && priceOf(l) < s.min) return false;
      if (s.max && priceOf(l) > s.max) return false;
      return true;
    }
    function readUrl() {
      var p = new URLSearchParams(window.location.search);
      var s = Object.assign({}, DEFAULTS);
      var st = p.get('status');
      if (st && (st === 'all' || STATUS_LABEL[st])) s.status = st;
      var ar = p.get('area');
      if (ar && areaById(ar)) s.area = ar;
      var bd = parseInt(p.get('beds'), 10);
      if ([1, 2, 3, 4].indexOf(bd) !== -1) s.beds = bd;
      var mn = parseInt(p.get('min'), 10), mx = parseInt(p.get('max'), 10);
      if (PRICE_STEPS.indexOf(mn) !== -1) s.min = mn;
      if (PRICE_STEPS.indexOf(mx) !== -1) s.max = mx;
      if (s.min && s.max && s.min > s.max) s.max = 0;
      var so = p.get('sort');
      if (so && SORTS[so]) s.sort = so;
      return s;
    }
    function writeUrl() {
      if (!window.history || !history.replaceState) return;
      var url = new URL(window.location.href);
      ['status', 'area', 'beds', 'min', 'max', 'sort'].forEach(function (k) {
        if (state[k] === DEFAULTS[k]) url.searchParams.delete(k); else url.searchParams.set(k, state[k]);
      });
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
    function render() {
      // Controls reflect state
      tabs.forEach(function (t) { t.setAttribute('aria-pressed', String(t.getAttribute('data-status') === state.status)); });
      areaSel.value = state.area; minSel.value = String(state.min); maxSel.value = String(state.max); sortSel.value = state.sort;
      $$('[name="beds"]', root).forEach(function (b) { b.checked = parseInt(b.value, 10) === state.beds; });

      // Live counts: each status tab and each neighborhood option counts what you would see if you picked it.
      tabs.forEach(function (t) {
        var st = t.getAttribute('data-status');
        var n = LISTINGS.filter(function (l) { return matches(l, Object.assign({}, state, { status: st }), null); }).length;
        $('.tab-count', t).textContent = n;
      });
      $$('option', areaSel).forEach(function (o) {
        var n = LISTINGS.filter(function (l) { return matches(l, Object.assign({}, state, { area: o.value }), null); }).length;
        var a = areaById(o.value);
        o.textContent = (a ? a.name : 'All neighborhoods') + ' (' + n + ')';
      });

      var list = LISTINGS.filter(function (l) { return matches(l, state, null); });
      list.sort(function (a, b) {
        if (state.sort === 'price-asc') return priceOf(a) - priceOf(b);
        if (state.sort === 'price-desc') return priceOf(b) - priceOf(a);
        if (state.sort === 'size') return b.sqft - a.sqft;
        var da = a.sold ? a.sold.date : a.listed, db = b.sold ? b.sold.date : b.listed;
        return da < db ? 1 : da > db ? -1 : 0;
      });
      grid.innerHTML = list.map(function (l) { return listingCard(l); }).join('');
      observeReveals();
      var label = state.status === 'all' ? 'home' : state.status === 'sold' ? 'sold home' : state.status === 'pending' ? 'home under contract' : 'home for sale';
      var plural = state.status === 'all' ? 'homes' : state.status === 'sold' ? 'sold homes' : state.status === 'pending' ? 'homes under contract' : 'homes for sale';
      countEl.textContent = list.length + ' ' + (list.length === 1 ? label : plural);
      empty.hidden = list.length !== 0;
      grid.hidden = list.length === 0;
      var dirty = ['area', 'beds', 'min', 'max'].some(function (k) { return state[k] !== DEFAULTS[k]; });
      clearBtns.forEach(function (b) { b.hidden = !dirty && !b.hasAttribute('data-clear-always'); });
      writeUrl();
    }
    tabs.forEach(function (t) { t.addEventListener('click', function () { state.status = t.getAttribute('data-status'); render(); }); });
    areaSel.addEventListener('change', function () { state.area = areaSel.value; render(); });
    minSel.addEventListener('change', function () { state.min = parseInt(minSel.value, 10) || 0; if (state.max && state.min > state.max) state.max = 0; render(); });
    maxSel.addEventListener('change', function () { state.max = parseInt(maxSel.value, 10) || 0; if (state.min && state.max && state.min > state.max) state.min = 0; render(); });
    sortSel.addEventListener('change', function () { state.sort = sortSel.value; render(); });
    $$('[name="beds"]', root).forEach(function (b) { b.addEventListener('change', function () { state.beds = parseInt(b.value, 10) || 0; render(); }); });
    clearBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        state = Object.assign({}, DEFAULTS, { status: state.status, sort: state.sort });
        render();
        areaSel.focus();
      });
    });
    var filterForm = $('[data-filters]', root);
    if (filterForm) filterForm.addEventListener('submit', function (e) { e.preventDefault(); });
    state = readUrl();
    render();
  }

  /* =========================================================================
     Time zones and calendar files (open houses and consultations)
     ========================================================================= */
  function partsIn(date, zone) {
    var out = {};
    new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(date).forEach(function (p) { if (p.type !== 'literal') out[p.type] = parseInt(p.value, 10); });
    return out;
  }
  // Wall-clock time in `zone` -> the real instant (a Date).
  function zonedDate(y, m, d, hh, mm, zone) {
    var guess = Date.UTC(y, m - 1, d, hh, mm);
    for (var i = 0; i < 2; i++) {
      var p = partsIn(new Date(guess), zone);
      var asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute);
      guess += Date.UTC(y, m - 1, d, hh, mm) - asUtc;
    }
    return new Date(guess);
  }
  function hm(s) { var p = s.split(':'); return [parseInt(p[0], 10), parseInt(p[1], 10)]; }
  function isoDay(y, m, d) { return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); }
  // The calendar date `offset` days after today in `zone`, as { y, m, d, dow, iso }.
  function dayInZone(offset, zone) {
    var t = partsIn(new Date(), zone);
    var base = new Date(Date.UTC(t.year, t.month - 1, t.day + offset, 12));
    return { y: base.getUTCFullYear(), m: base.getUTCMonth() + 1, d: base.getUTCDate(), dow: base.getUTCDay(), iso: isoDay(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate()) };
  }
  function fmtTime(date, zone) { return date.toLocaleTimeString('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit' }); }
  function fmtDay(date, zone, long) { return date.toLocaleDateString('en-US', { timeZone: zone, weekday: long ? 'long' : 'short', month: long ? 'long' : 'short', day: 'numeric' }); }
  var DOW = { sun: 0, mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 };
  // The next occurrence (today included, if it hasn't ended) of an open house.
  function nextOpenHouse(oh) {
    var s = hm(oh[1]), e = hm(oh[2]), now = Date.now();
    for (var i = 0; i < 8; i++) {
      var day = dayInZone(i, AGENT.timeZone);
      if (day.dow !== DOW[oh[0]]) continue;
      var end = zonedDate(day.y, day.m, day.d, e[0], e[1], AGENT.timeZone);
      if (end.getTime() <= now) continue;
      return { start: zonedDate(day.y, day.m, day.d, s[0], s[1], AGENT.timeZone), end: end };
    }
    return null;
  }
  function icsStamp(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function icsText(s) { return String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1'); }
  function buildIcs(ev) {
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Delia Quintero Real Estate//Atlas template//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VEVENT', 'UID:' + ev.uid + '@deliaquintero.example', 'DTSTAMP:' + icsStamp(new Date()), 'DTSTART:' + icsStamp(ev.start), 'DTEND:' + icsStamp(ev.end),
      'SUMMARY:' + icsText(ev.title), 'LOCATION:' + icsText(ev.location), 'DESCRIPTION:' + icsText(ev.description), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
  }
  function downloadIcs(ev, filename) {
    var blob = new Blob([buildIcs(ev)], { type: 'text/calendar;charset=utf-8' });
    var a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  var visitorZone = (Intl.DateTimeFormat().resolvedOptions().timeZone) || AGENT.timeZone;
  function zoneNote(date) {
    if (visitorZone === AGENT.timeZone) return '';
    var a = fmtTime(date, AGENT.timeZone), b = fmtTime(date, visitorZone);
    return a === b ? '' : b + ' your time';
  }

  /* =========================================================================
     Form validation (shared)
     Fields with data-validate are checked on submit and again as the visitor fixes them.
     Values: required, email, phone-optional, address, sqft, future-date, choice (radio group).
     ========================================================================= */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function todayIso() { var d = new Date(); return isoDay(d.getFullYear(), d.getMonth() + 1, d.getDate()); }
  function fieldMessage(field) {
    var type = field.getAttribute('data-validate');
    if (type === 'choice') {
      var form = field.form || field.closest('form');
      var checked = $$('[name="' + field.name + '"]', form).some(function (x) { return x.checked; });
      return checked ? '' : (field.getAttribute('data-message') || 'Please choose an option.');
    }
    var v = (field.value || '').trim();
    if (field.type === 'checkbox') return field.required && !field.checked ? 'Please check this box to continue.' : '';
    if (field.required && !v) return field.getAttribute('data-message') || (type === 'email' ? 'Please enter your email address.' : field.tagName === 'SELECT' ? 'Please choose an option.' : 'Please fill in this field.');
    if (type === 'email' && v && !EMAIL.test(v)) return 'Please enter an email address like name@example.com.';
    if (type === 'phone-optional' && v && v.replace(/\D/g, '').length < 7) return 'Please enter a phone number I can call, or leave it blank.';
    if (type === 'address' && v && v.length < 5) return 'Please enter a street address, like 1418 Fatherland St.';
    if (type === 'sqft' && v) {
      var n = num(v);
      if (!isFinite(n) || n < VALUATION.minSqft || n > VALUATION.maxSqft) return 'Please enter a size between ' + VALUATION.minSqft + ' and ' + VALUATION.maxSqft.toLocaleString('en-US') + ' square feet.';
    }
    if (type === 'future-date' && v && v < todayIso()) return 'Please choose today or a later date.';
    return '';
  }
  function errorHost(field) {
    if (field.getAttribute('data-validate') === 'choice') return field.closest('fieldset') || field.closest('[data-field]');
    return field.closest('[data-field]') || field.parentNode;
  }
  function showError(field, msg) {
    var key = field.getAttribute('data-validate') === 'choice' ? field.name : field.id;
    var id = key + '-error';
    var err = document.getElementById(id);
    var wrap = errorHost(field);
    var targets = field.getAttribute('data-validate') === 'choice' ? $$('[name="' + field.name + '"]', field.form || document) : [field];
    if (msg) {
      if (!err) {
        err = document.createElement('p');
        err.id = id;
        err.className = 'field-error';
        wrap.appendChild(err);
      }
      err.innerHTML = ICON.alert + '<span>' + esc(msg) + '</span>';
      targets.forEach(function (t) {
        t.setAttribute('aria-invalid', 'true');
        var described = (t.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
        if (described.indexOf(id) === -1) described.push(id);
        t.setAttribute('aria-describedby', described.join(' '));
      });
    } else {
      if (err) err.remove();
      targets.forEach(function (t) {
        t.removeAttribute('aria-invalid');
        var rest = (t.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== id; });
        if (rest.length) t.setAttribute('aria-describedby', rest.join(' ')); else t.removeAttribute('aria-describedby');
      });
    }
  }
  var lastInvalid = null;
  function validateFields(fields) {
    var first = null;
    fields.forEach(function (field) {
      var msg = fieldMessage(field);
      showError(field, msg);
      if (msg && !first) first = field;
    });
    lastInvalid = first;
    if (first) first.focus();
    return !first;
  }
  function validateForm(form) { return validateFields($$('[data-validate]', form)); }
  function liveValidate(form) {
    $$('[data-validate]', form).forEach(function (field) {
      var choice = field.getAttribute('data-validate') === 'choice';
      var evt = field.type === 'checkbox' || field.type === 'radio' || field.tagName === 'SELECT' || field.type === 'date' ? 'change' : 'input';
      var recheck = function () { if (field.getAttribute('aria-invalid') === 'true') showError(field, fieldMessage(field)); };
      if (choice) $$('[name="' + field.name + '"]', form).forEach(function (x) { x.addEventListener('change', function () { if (x.getAttribute('aria-invalid') === 'true') showError(field, fieldMessage(field)); }); });
      else { field.addEventListener(evt, recheck); field.addEventListener('blur', recheck); }
    });
    $$('input[type="date"][data-validate="future-date"]', form).forEach(function (d) { d.min = todayIso(); });
  }
  function firstName(form) { return (form.elements.name && form.elements.name.value.trim().split(' ')[0]) || ''; }
  // A short reference for confirmations, like DQ-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return 'DQ-' + out;
  }

  /* Newsletter (footer) and general forms with a [data-success] panel next to them.
     Demo only: nothing is sent. To send for real, replace the marked block with a fetch()
     to your form service (see DOCS.md, "Forms"). */
  $$('[data-newsletter-form], [data-message-form]').forEach(function (form) {
    var success = form.parentNode.querySelector('[data-success]');
    liveValidate(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      /* --- Connect a real endpoint here, e.g.:
         fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      --- */
      var name = firstName(form);
      var text = success && $('[data-success-text]', success);
      if (text && form.hasAttribute('data-message-form')) text.textContent = 'Thanks' + (name ? ', ' + name : '') + '. Your message is in, and I reply within one business day.';
      form.hidden = true;
      if (success) { success.classList.remove('hidden'); success.focus(); }
    });
  });

  /* =========================================================================
     Listing detail (listing.html?id=)
     ========================================================================= */
  var detail = $('[data-listing-detail]');
  if (detail) initDetail(detail);

  function initDetail(root) {
    var id = new URLSearchParams(window.location.search).get('id');
    var l = listingById(id) || (id ? null : LISTINGS[0]);
    var notFound = $('[data-not-found]');
    if (!l) {
      root.hidden = true;
      if (notFound) notFound.hidden = false;
      // Keep exactly one visible h1: the not-found heading takes the page's h1.
      var h1 = $('h1', root), h2 = $('[data-not-found-heading]', notFound);
      if (h1 && h2) { h1.className = h2.className; h1.textContent = h2.textContent; h2.parentNode.replaceChild(h1, h2); }
      document.title = 'Listing not found — ' + ($('meta[property="og:site_name"]') || { content: AGENT.name }).content;
      return;
    }
    var area = areaById(l.area);
    var siteName = ($('meta[property="og:site_name"]') || { content: AGENT.name }).content;
    document.title = l.address + ', ' + area.name + ' — ' + siteName;
    function set(key, html) { $$('[data-l="' + key + '"]', root).forEach(function (el) { el.innerHTML = html; }); }
    set('address', esc(l.address));
    set('crumb', esc(l.address));
    set('area', esc(area.name));
    set('area-link', '<a class="link-arrow" href="neighborhoods.html#' + area.id + '">The ' + esc(area.name) + ' guide' + ICON.arrow + '</a>');
    set('city', esc(area.name) + ', Nashville, TN ' + l.zip);
    set('status', '<span class="pill pill-' + l.status + '">' + STATUS_LABEL[l.status] + '</span>');
    set('headline', esc(l.headline));
    set('price', money(l.sold ? l.sold.price : l.price));
    set('price-label', l.sold ? 'Sold price' : l.status === 'pending' ? 'List price (under contract)' : 'List price');
    set('description', l.description.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join(''));
    set('features', l.features.map(function (f) { return '<li class="flex items-start gap-3"><span class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-persimmon-100 text-persimmon-700">' + ICON.check + '</span><span>' + esc(f) + '</span></li>'; }).join(''));
    var facts = [
      ['Bedrooms', l.beds], ['Bathrooms', bathsText(l.baths)], ['Interior', l.sqft.toLocaleString('en-US') + ' sq ft'], ['Lot', l.lot],
      ['Built', l.year], ['Type', l.type], ['Price per sq ft', money((l.sold ? l.sold.price : l.price) / l.sqft)], ['Days on market', l.dom]
    ];
    set('facts', facts.map(function (f) { return '<div class="border-t border-sand-200 pt-3"><dt class="text-xs font-bold tracking-[0.12em] text-ink-600 uppercase">' + f[0] + '</dt><dd class="mt-1 font-display text-2xl text-ink-950">' + esc(f[1]) + '</dd></div>'; }).join(''));
    if (l.sold) {
      set('sold-note', '<p class="rounded-2xl bg-moss-100 p-4 text-ink-900"><strong class="font-semibold">Sold ' + shortDate(l.sold.date) + '</strong> for ' + money(l.sold.price) + ', ' + soldPct(l) + '% of the ' + money(l.price) + ' asking price, after ' + l.dom + ' days on market.</p>');
    }

    // Gallery
    var stage = $('[data-gallery-stage]', root), caption = $('[data-gallery-caption]', root), counter = $('[data-gallery-count]', root), thumbs = $('[data-gallery-thumbs]', root);
    var current = 0;
    thumbs.innerHTML = GALLERY.map(function (g, i) {
      return '<li><button type="button" class="thumb w-full" data-index="' + i + '" aria-label="Show ' + esc(g[1].toLowerCase()) + '">' + roomSVG(g[0], l, 'block aspect-[4/3] h-auto w-full') + '</button></li>';
    }).join('');
    function show(i, focusStage) {
      current = (i + GALLERY.length) % GALLERY.length;
      var g = GALLERY[current];
      stage.innerHTML = roomSVG(g[0], l, 'block aspect-[4/3] h-auto w-full', 'Illustration: ' + g[1].toLowerCase() + ' at ' + l.address);
      caption.textContent = g[1];
      counter.textContent = (current + 1) + ' / ' + GALLERY.length;
      $$('[data-index]', thumbs).forEach(function (b, k) { if (k === current) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
      if (focusStage) stage.parentNode.focus();
    }
    $$('[data-index]', thumbs).forEach(function (b) { b.addEventListener('click', function () { show(parseInt(b.getAttribute('data-index'), 10)); }); });
    $('[data-gallery-prev]', root).addEventListener('click', function () { show(current - 1); });
    $('[data-gallery-next]', root).addEventListener('click', function () { show(current + 1); });
    stage.parentNode.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    });
    show(0);

    // Open houses
    var ohBox = $('[data-open-houses]', root);
    var upcoming = l.status === 'active' ? l.openHouses.map(nextOpenHouse).filter(Boolean).sort(function (a, b) { return a.start - b.start; }) : [];
    if (upcoming.length) {
      ohBox.innerHTML = upcoming.map(function (o, i) {
        var note = zoneNote(o.start);
        return '<li class="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand-200 bg-white p-4"><div><p class="font-semibold text-ink-950">' + fmtDay(o.start, AGENT.timeZone, true) + '</p><p class="text-sm text-ink-600">' + fmtTime(o.start, AGENT.timeZone) + ' – ' + fmtTime(o.end, AGENT.timeZone) + ' Central' + (note ? ' (' + note + ')' : '') + '</p></div>' +
          '<button type="button" class="btn btn-outline btn-sm" data-ics="' + i + '">' + ICON.download + 'Add to calendar<span class="sr-only">: ' + fmtDay(o.start, AGENT.timeZone, true) + '</span></button></li>';
      }).join('');
      $$('[data-ics]', ohBox).forEach(function (b) {
        b.addEventListener('click', function () {
          var o = upcoming[parseInt(b.getAttribute('data-ics'), 10)];
          downloadIcs({ uid: 'open-' + l.id + '-' + o.start.getTime(), start: o.start, end: o.end, title: 'Open house: ' + l.address, location: l.address + ', Nashville, TN ' + l.zip, description: 'Hosted by ' + AGENT.name + ', ' + AGENT.phone + '. ' + money(l.price) + ' · ' + l.beds + ' bd · ' + bathsText(l.baths) + ' ba.' }, 'open-house-' + l.id + '.ics');
        });
      });
    } else {
      ohBox.innerHTML = '<li class="rounded-2xl border border-dashed border-sand-300 p-4 text-ink-700">' + (l.status === 'sold' ? 'This home has sold.' : l.status === 'pending' ? 'This home is under contract, so there are no open houses. Backup offers are welcome.' : 'No open house scheduled. Request a private tour below.') + '</li>';
    }

    // Tour form: shown for active and pending homes; sold homes show a "find me one like it" panel.
    var tour = $('[data-tour]', root), soldCta = $('[data-sold-cta]', root);
    if (l.status === 'sold') { tour.hidden = true; soldCta.hidden = false; }
    var form = $('[data-tour-form]', root);
    if (form) {
      form.elements.listing.value = l.address;
      liveValidate(form);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validateForm(form)) return;
        /* --- Connect a real endpoint here (see DOCS.md, "Forms"). Demo only: nothing is sent. --- */
        var success = $('[data-success]', tour);
        var when = form.elements.date.value ? new Date(form.elements.date.value + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : '';
        var how = $('[name="tour-type"]:checked', form);
        $('[data-success-text]', success).textContent = 'Thanks, ' + firstName(form) + '. Your ' + (how ? how.value : 'tour') + ' request for ' + l.address + (when ? ' on ' + when + ' (' + form.elements.time.value.toLowerCase() + ')' : '') + ' is in.';
        var refEl = $('[data-ref]', success);
        if (refEl) refEl.textContent = makeRef();
        form.hidden = true;
        success.classList.remove('hidden');
        success.focus();
      });
    }

    // More homes: same neighborhood first, then other homes for sale.
    var more = $('[data-more]', root);
    if (more) {
      var others = LISTINGS.filter(function (x) { return x.id !== l.id && x.status !== 'sold' && x.area === l.area; })
        .concat(LISTINGS.filter(function (x) { return x.id !== l.id && x.status === 'active' && x.area !== l.area; })).slice(0, 3);
      more.innerHTML = others.map(function (x) { return listingCard(x); }).join('');
    }
    observeReveals();
  }

  /* =========================================================================
     Home value estimate
     ========================================================================= */
  function estimate(input) {
    var a = areaById(input.area);
    if (!a || !(input.sqft > 0)) return null;
    var cond = VALUATION.condition[input.condition] || 1;
    var type = VALUATION.type[input.type] || 1;
    var rooms = 1 + VALUATION.perBed * ((input.beds || 3) - 3) + VALUATION.perBath * ((input.baths || 2) - 2);
    var extras = 0;
    (input.extras || []).forEach(function (x) { extras += VALUATION.extras[x] || 0; });
    var mid = input.sqft * a.ppsf * type * cond * rooms * (1 + extras);
    var spread = VALUATION.spread[input.condition] || 0.06;
    var rd = function (v) { return Math.round(v / VALUATION.round) * VALUATION.round; };
    return { low: rd(mid * (1 - spread)), mid: rd(mid), high: rd(mid * (1 + spread)), ppsf: a.ppsf, area: a };
  }
  function fillAreaSelect(sel, placeholder) {
    if (!sel || sel.options.length > 1) return;
    sel.innerHTML = '<option value="">' + placeholder + '</option>' + AREAS.map(function (a) { return '<option value="' + a.id + '">' + esc(a.name) + '</option>'; }).join('');
  }

  /* Home page teaser ([data-estimate-teaser]): neighborhood + size -> instant range. */
  var teaser = $('[data-estimate-teaser]');
  if (teaser) {
    var tArea = $('[name="area"]', teaser), tSqft = $('[name="sqft"]', teaser), tOut = $('[data-teaser-result]', teaser), tLink = $('[data-teaser-link]', teaser);
    fillAreaSelect(tArea, 'Choose a neighborhood');
    if (!tArea.value) tArea.value = AREAS[0].id;
    var updTeaser = function () {
      var sq = num(tSqft.value);
      var ok = tArea.value && sq >= VALUATION.minSqft && sq <= VALUATION.maxSqft;
      var est = ok ? estimate({ area: tArea.value, sqft: sq, condition: 'updated', type: 'house' }) : null;
      if (est) {
        tOut.innerHTML = '<span class="block text-sm font-semibold text-cobalt-100">Ballpark for an updated house</span><span class="mt-1 block font-display text-4xl text-white sm:text-5xl">' + moneyShort(est.low) + ' – ' + moneyShort(est.high) + '</span><span class="mt-2 block text-sm text-cobalt-100">' + esc(est.area.name) + ' averages ' + money(est.ppsf) + ' per sq ft</span>';
        tLink.href = 'sell.html?area=' + encodeURIComponent(tArea.value) + '&sqft=' + Math.round(sq) + '#valuation';
      } else {
        tOut.innerHTML = '<span class="block text-sm font-semibold text-cobalt-100">Your ballpark range</span><span class="mt-1 block font-display text-4xl text-white/50 sm:text-5xl">$ — </span><span class="mt-2 block text-sm text-cobalt-100">Pick a neighborhood and enter a size between ' + VALUATION.minSqft + ' and ' + VALUATION.maxSqft.toLocaleString('en-US') + ' sq ft.</span>';
        tLink.href = 'sell.html#valuation';
      }
    };
    tArea.addEventListener('change', updTeaser);
    tSqft.addEventListener('input', updTeaser);
    teaser.addEventListener('submit', function (e) { e.preventDefault(); window.location.href = tLink.href; });
    updTeaser();
  }

  /* Valuation wizard (sell.html, [data-valuation]): three steps, then a result. */
  var valuation = $('[data-valuation]');
  if (valuation) initValuation(valuation);

  function initValuation(root) {
    var steps = $$('[data-vstep]', root), pills = $$('[data-vpill]', root);
    var form = $('form', root);
    var at = 1;
    fillAreaSelect(form.elements.area, 'Choose a neighborhood');
    liveValidate(form);
    var params = new URLSearchParams(window.location.search);
    if (areaById(params.get('area'))) form.elements.area.value = params.get('area');
    var sq = parseInt(params.get('sqft'), 10);
    if (sq >= VALUATION.minSqft && sq <= VALUATION.maxSqft) form.elements.sqft.value = sq;

    function go(n, focus) {
      at = n;
      steps.forEach(function (s) { s.hidden = parseInt(s.getAttribute('data-vstep'), 10) !== n; });
      pills.forEach(function (p) {
        var k = parseInt(p.getAttribute('data-vpill'), 10);
        if (k === n) p.setAttribute('aria-current', 'step'); else p.removeAttribute('aria-current');
        if (k < n) p.setAttribute('data-done', ''); else p.removeAttribute('data-done');
      });
      if (focus) { var h = $('[data-vstep="' + n + '"] [data-step-heading]', root); if (h) h.focus(); }
    }
    function input() {
      return {
        area: form.elements.area.value,
        type: ($('[name="type"]:checked', form) || {}).value || 'house',
        beds: parseInt(form.elements.beds.value, 10),
        baths: parseFloat(form.elements.baths.value),
        sqft: num(form.elements.sqft.value),
        condition: ($('[name="condition"]:checked', form) || {}).value,
        extras: $$('[name="extras"]:checked', form).map(function (x) { return x.value; })
      };
    }
    function result() {
      var data = input(), est = estimate(data);
      if (!est) return;
      $('[data-v="low"]', root).textContent = money(est.low);
      $('[data-v="high"]', root).textContent = money(est.high);
      $('[data-v="mid"]', root).textContent = money(est.mid);
      $('[data-v="address"]', root).textContent = form.elements.address.value.trim() + ', ' + est.area.name;
      $('[data-v="ppsf"]', root).textContent = money(est.mid / data.sqft);
      $('[data-v="area-ppsf"]', root).textContent = money(est.ppsf);
      // Where the midpoint sits against the neighborhood median (scale: 40% to 200% of median).
      var pos = Math.max(0, Math.min(100, (est.mid / est.area.median - 0.4) / 1.6 * 100));
      $('[data-v="marker"]', root).style.left = pos + '%';
      $('[data-v="median"]', root).textContent = money(est.area.median);
      var medPos = (1 - 0.4) / 1.6 * 100;
      $('[data-v="median-mark"]', root).style.left = medPos + '%';
      var comps = LISTINGS.filter(function (x) { return x.area === data.area && x.status === 'sold'; });
      $('[data-v="comps"]', root).innerHTML = comps.length ? comps.map(function (c) {
        return '<li class="flex items-center justify-between gap-4 py-3"><a class="min-w-0 truncate font-semibold text-ink-950 underline decoration-sand-300 underline-offset-4 hover:decoration-ink-950" href="listing.html?id=' + c.id + '">' + esc(c.address) + '</a><span class="shrink-0 text-right text-sm text-ink-700"><span class="font-semibold text-ink-950">' + money(c.sold.price) + '</span> &middot; ' + c.sqft.toLocaleString('en-US') + ' sq ft</span></li>';
      }).join('') : '<li class="py-3 text-ink-700">No recent sales of mine here yet.</li>';
      $('[data-v="area-name"]', root).textContent = est.area.name;
      root.setAttribute('data-estimate', String(est.mid));
    }
    $$('[data-vnext]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var fields = $$('[data-vstep="' + at + '"] [data-validate]', root);
        if (!validateFields(fields)) return;
        if (at === 2) result();
        go(at + 1, true);
      });
    });
    $$('[data-vback]', root).forEach(function (b) { b.addEventListener('click', function () { go(at - 1, true); }); });
    $('[data-vrestart]', root).addEventListener('click', function () { go(1, true); });
    form.addEventListener('submit', function (e) { e.preventDefault(); var n = $('[data-vstep="' + at + '"] [data-vnext]', root); if (n) n.click(); });
    var use = $('[data-use-estimate]', root);
    if (use) use.addEventListener('click', function () {
      var price = $('[data-net-sheet] [name="price"]');
      if (!price) return;
      price.value = parseInt(root.getAttribute('data-estimate'), 10).toLocaleString('en-US');
      price.dispatchEvent(new Event('input', { bubbles: true }));
      document.getElementById('net-sheet').scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'start' });
      price.focus({ preventScroll: true });
    });
    go(1, false);
  }

  /* =========================================================================
     Money inputs: format with thousands separators as you leave the field.
     ========================================================================= */
  $$('[data-money]').forEach(function (inp) {
    inp.addEventListener('blur', function () { var n = num(inp.value); if (isFinite(n)) inp.value = Math.round(n).toLocaleString('en-US'); });
  });

  /* Seller net proceeds ([data-net-sheet]) */
  var net = $('[data-net-sheet]');
  if (net) {
    var calcNet = function () {
      var f = net.elements;
      var price = Math.max(0, num(f.price.value) || 0);
      var commission = price * Math.max(0, num(f.commission.value) || 0) / 100;
      var closing = price * Math.max(0, num(f.closing.value) || 0) / 100;
      var payoff = Math.max(0, num(f.payoff.value) || 0);
      var other = Math.max(0, num(f.other.value) || 0);
      var proceeds = price - commission - closing - payoff - other;
      var parts = [['commission', commission], ['closing', closing], ['payoff', payoff], ['other', other], ['keep', Math.max(0, proceeds)]];
      $('[data-n="net"]', net).textContent = (proceeds < 0 ? '−' : '') + money(Math.abs(proceeds));
      $('[data-n="net"]', net).classList.toggle('text-red-200', proceeds < 0);
      parts.forEach(function (p) {
        var el = $('[data-n="' + p[0] + '"]', net); if (el) el.textContent = money(p[1]);
        var bar = $('[data-bar="' + p[0] + '"]', net); if (bar) bar.style.width = (price > 0 ? Math.max(0, p[1] / price * 100) : 0) + '%';
      });
      $('[data-n="share"]', net).textContent = price > 0 ? Math.max(0, Math.round(proceeds / price * 100)) + '% of the sale price' : '';
      $('[data-n="warning"]', net).hidden = proceeds >= 0;
    };
    net.addEventListener('input', calcNet);
    net.addEventListener('submit', function (e) { e.preventDefault(); });
    calcNet();
  }

  /* =========================================================================
     Affordability calculator (buy.html, [data-afford])
     Housing costs may use up to FRONT_END of gross monthly income, and housing plus other debts
     up to BACK_END. The highest price whose monthly cost fits both limits is found by bisection.
     ========================================================================= */
  var AFFORD = { FRONT_END: 0.28, BACK_END: 0.36, PMI_RATE: 0.005, PMI_BELOW: 0.2 };
  var afford = $('[data-afford]');
  if (afford) {
    var monthlyPI = function (loan, rate, years) {
      var n = years * 12, i = rate / 100 / 12;
      if (loan <= 0) return 0;
      return i === 0 ? loan / n : loan * i / (1 - Math.pow(1 + i, -n));
    };
    var costs = function (price, o) {
      var loan = Math.max(0, price - o.down);
      var pmi = price > 0 && o.down / price < AFFORD.PMI_BELOW ? loan * AFFORD.PMI_RATE / 12 : 0;
      var c = { pi: monthlyPI(loan, o.rate, o.years), tax: price * o.tax / 100 / 12, ins: o.ins / 12, pmi: pmi, hoa: o.hoa };
      c.total = c.pi + c.tax + c.ins + c.pmi + c.hoa;
      return c;
    };
    var calcAfford = function () {
      var f = afford.elements;
      var o = {
        income: Math.max(0, num(f.income.value) || 0), debts: Math.max(0, num(f.debts.value) || 0), down: Math.max(0, num(f.down.value) || 0),
        rate: Math.max(0, num(f.rate.value) || 0), years: parseInt(($('[name="years"]:checked', afford) || {}).value, 10) || 30,
        tax: Math.max(0, num(f.tax.value) || 0), ins: Math.max(0, num(f.insurance.value) || 0), hoa: Math.max(0, num(f.hoa.value) || 0)
      };
      var monthly = o.income / 12;
      var budget = Math.max(0, Math.min(monthly * AFFORD.FRONT_END, monthly * AFFORD.BACK_END - o.debts));
      var lo = 0, hi = 10000000;
      if (costs(o.down, o).total > budget) hi = o.down;
      for (var i = 0; i < 60; i++) { var m = (lo + hi) / 2; if (costs(m, o).total <= budget) lo = m; else hi = m; }
      var price = budget > 0 ? Math.floor(lo / 1000) * 1000 : 0;
      var c = costs(price, o);
      $('[data-a="price"]', afford).textContent = money(price);
      $('[data-a="monthly"]', afford).textContent = money(c.total);
      $('[data-a="loan"]', afford).textContent = money(Math.max(0, price - o.down));
      $('[data-a="downpct"]', afford).textContent = price > 0 ? Math.round(Math.min(o.down, price) / price * 100) + '%' : '0%';
      $('[data-a="dti"]', afford).textContent = monthly > 0 ? Math.round((c.total + o.debts) / monthly * 100) + '%' : '0%';
      var parts = [['pi', c.pi, '#2742cc'], ['tax', c.tax, '#e4552b'], ['ins', c.ins, '#f2cf63'], ['pmi', c.pmi, '#8fa97a'], ['hoa', c.hoa, '#8a8d9a']];
      parts.forEach(function (p) { var el = $('[data-a="' + p[0] + '"]', afford); if (el) el.textContent = money(p[1]); var row = $('[data-row="' + p[0] + '"]', afford); if (row) row.hidden = (p[0] === 'pmi' || p[0] === 'hoa') && p[1] < 0.5; });
      // Donut chart of the monthly payment
      var donut = $('[data-a="donut"]', afford), R = 52, C = 2 * Math.PI * R, offset = 0, svg = '';
      parts.forEach(function (p) {
        if (c.total <= 0 || p[1] <= 0) return;
        var len = p[1] / c.total * C;
        svg += '<circle cx="70" cy="70" r="' + R + '" fill="none" stroke="' + p[2] + '" stroke-width="20" stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-offset).toFixed(2) + '" transform="rotate(-90 70 70)"/>';
        offset += len;
      });
      donut.innerHTML = '<circle cx="70" cy="70" r="' + R + '" fill="none" stroke="#ebe4d6" stroke-width="20"/>' + svg;
      // Link to homes in budget: the highest price step at or below the result.
      var link = $('[data-a="browse"]', afford), step = 0;
      PRICE_STEPS.forEach(function (s) { if (s <= price) step = s; });
      link.href = step ? 'listings.html?max=' + step : 'listings.html';
      link.innerHTML = (step ? 'See homes under ' + moneyShort(step) : 'Browse all listings') + ICON.arrow;
    };
    afford.addEventListener('input', calcAfford);
    afford.addEventListener('change', calcAfford);
    afford.addEventListener('submit', function (e) { e.preventDefault(); });
    calcAfford();
  }

  /* =========================================================================
     Neighborhood map ([data-area-map]) and cards ([data-area-card])
     Hovering or focusing an area highlights its card and the reverse.
     ========================================================================= */
  var map = $('[data-area-map]');
  $$('[data-area-count]').forEach(function (el) {
    var id = el.getAttribute('data-area-count');
    var n = LISTINGS.filter(function (l) { return l.area === id && l.status === 'active'; }).length;
    el.textContent = n;
  });
  $$('[data-area-stat]').forEach(function (el) {
    var p = el.getAttribute('data-area-stat').split(':'), a = areaById(p[0]);
    if (!a) return;
    if (p[1] === 'median') el.textContent = moneyShort(a.median);
    if (p[1] === 'ppsf') el.textContent = money(a.ppsf);
    if (p[1] === 'dom') el.textContent = a.dom;
    if (p[1] === 'yoy') el.textContent = (a.yoy > 0 ? '+' : '') + a.yoy + '%';
  });
  if (map) {
    var shapes = $$('[data-area]', map);
    var cards = $$('[data-area-card]');
    var info = $('[data-map-info]');
    var setActive = function (id) {
      shapes.forEach(function (s) { s.classList.toggle('is-active', s.getAttribute('data-area') === id); });
      cards.forEach(function (c) { c.classList.toggle('is-active', c.getAttribute('data-area-card') === id); });
      if (info) {
        var a = areaById(id);
        if (!a) { $('[data-info-empty]', info).hidden = false; $('[data-info-body]', info).hidden = true; return; }
        $('[data-info-empty]', info).hidden = true; $('[data-info-body]', info).hidden = false;
        $('[data-info="name"]', info).textContent = a.name;
        $('[data-info="median"]', info).textContent = moneyShort(a.median);
        $('[data-info="ppsf"]', info).textContent = money(a.ppsf);
        $('[data-info="dom"]', info).textContent = a.dom + ' days';
        $('[data-info="count"]', info).textContent = LISTINGS.filter(function (l) { return l.area === id && l.status === 'active'; }).length;
        $('[data-info="link"]', info).href = '#' + id;
      }
    };
    // Hover wins while the pointer is over an area or card; otherwise keyboard focus, then the
    // last area clicked (or the one in the URL hash).
    var pinned = null, focused = null;
    var rest = function () { setActive(focused || pinned); };
    shapes.forEach(function (s) {
      var id = s.getAttribute('data-area');
      s.addEventListener('mouseenter', function () { setActive(id); });
      s.addEventListener('mouseleave', rest);
      s.addEventListener('focus', function () { focused = id; setActive(id); });
      s.addEventListener('blur', function () { focused = null; rest(); });
      s.addEventListener('click', function () { pinned = id; });
    });
    cards.forEach(function (c) {
      var id = c.getAttribute('data-area-card');
      c.addEventListener('mouseenter', function () { setActive(id); });
      c.addEventListener('mouseleave', rest);
      c.addEventListener('focusin', function () { focused = id; setActive(id); });
      c.addEventListener('focusout', function () { focused = null; rest(); });
    });
    var fromHash = window.location.hash.slice(1);
    if (areaById(fromHash)) { pinned = fromHash; }
    window.addEventListener('hashchange', function () { var h = window.location.hash.slice(1); if (areaById(h)) { pinned = h; setActive(h); } });
    setActive(pinned);
  }

  /* =========================================================================
     Consultation booking (contact.html, [data-booking])
     ========================================================================= */
  var booking = $('[data-booking]');
  if (booking) initBooking(booking);

  function initBooking(root) {
    var form = $('form', root);
    var dayStrip = $('[data-days]', root), slotBox = $('[data-slots]', root), slotHint = $('[data-slot-hint]', root);
    var state = { type: null, day: null, slot: null };
    var days = [];

    // Deterministic "already booked" slots so the demo looks lived-in and is the same on every load.
    function busy(iso, t) {
      var h = 0, s = iso + t;
      for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
      return (h % 1000) / 1000 < AVAILABILITY.demoBusyShare;
    }
    function slotsFor(day) {
      var out = [], windows = AVAILABILITY.hours[day.dow] || [], minutes = state.type ? CONSULT_TYPES[state.type].minutes : 30;
      var earliest = Date.now() + AVAILABILITY.minNoticeHours * 3600000;
      windows.forEach(function (w) {
        var s = hm(w[0]), e = hm(w[1]);
        for (var t = s[0] * 60 + s[1]; t + minutes <= e[0] * 60 + e[1]; t += AVAILABILITY.slotStep) {
          var start = zonedDate(day.y, day.m, day.d, Math.floor(t / 60), t % 60, AGENT.timeZone);
          if (start.getTime() < earliest) continue;
          var label = String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0');
          out.push({ start: start, end: new Date(start.getTime() + minutes * 60000), id: label, taken: busy(day.iso, label) });
        }
      });
      return out;
    }
    // The next AVAILABILITY.daysShown days that have at least one free slot.
    function buildDays() {
      days = [];
      for (var i = 0; i < 60 && days.length < AVAILABILITY.daysShown; i++) {
        var d = dayInZone(i, AGENT.timeZone);
        if (AVAILABILITY.closed.indexOf(d.iso) !== -1 || !AVAILABILITY.hours[d.dow]) continue;
        if (slotsFor(d).some(function (s) { return !s.taken; })) days.push(d);
      }
      dayStrip.innerHTML = days.map(function (d, i) {
        var date = new Date(Date.UTC(d.y, d.m - 1, d.d, 12));
        var dow = date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' });
        var mon = date.toLocaleDateString('en-US', { month: 'short', timeZone: 'UTC' });
        return '<li><button type="button" class="day-btn" data-day="' + i + '" aria-pressed="' + !!(state.day && state.day.iso === d.iso) + '"><span class="day-btn-dow">' + dow + '</span> <span class="day-btn-num">' + d.d + '</span> <span class="day-btn-mon">' + mon + '</span></button></li>';
      }).join('');
      $$('[data-day]', dayStrip).forEach(function (b) {
        b.addEventListener('click', function () {
          state.day = days[parseInt(b.getAttribute('data-day'), 10)];
          state.slot = null;
          $$('[data-day]', dayStrip).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          showError($('[data-day-proxy]', root), '');
          var stale = document.getElementById('slot-error'); if (stale) stale.remove();
          renderSlots();
          summary();
        });
      });
    }
    function renderSlots() {
      if (!state.day) { slotBox.innerHTML = ''; slotHint.hidden = false; return; }
      slotHint.hidden = true;
      var slots = slotsFor(state.day);
      slotBox.innerHTML = slots.map(function (s) {
        var t = fmtTime(s.start, AGENT.timeZone);
        if (s.taken) return '<li><span class="slot slot-taken" aria-hidden="true">' + t + '</span><span class="sr-only">' + t + ' is booked</span></li>';
        return '<li><label class="slot"><input type="radio" class="sr-only" name="slot" value="' + s.id + '"' + (state.slot && state.slot.id === s.id ? ' checked' : '') + ' data-validate="choice" data-message="Please pick a time."><span>' + t + '</span></label></li>';
      }).join('');
      $$('[name="slot"]', slotBox).forEach(function (inp) {
        inp.addEventListener('change', function () {
          state.slot = slots.filter(function (s) { return s.id === inp.value; })[0];
          showError(inp, '');
          summary();
        });
      });
    }
    function summary() {
      var t = state.type && CONSULT_TYPES[state.type];
      $('[data-sum="type"]', root).textContent = t ? t.label : 'Choose a consultation';
      $('[data-sum="meta"]', root).textContent = t ? t.minutes + ' minutes · ' + t.where : '';
      var when = 'Pick a day and time';
      if (state.day && state.slot) when = fmtDay(state.slot.start, AGENT.timeZone, true) + ', ' + fmtTime(state.slot.start, AGENT.timeZone) + ' – ' + fmtTime(state.slot.end, AGENT.timeZone) + ' Central';
      else if (state.day) when = new Date(Date.UTC(state.day.y, state.day.m - 1, state.day.d, 12)).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }) + ', choose a time';
      $('[data-sum="when"]', root).textContent = when;
      var note = state.slot ? zoneNote(state.slot.start) : '';
      $('[data-sum="local"]', root).textContent = note ? 'That is ' + note + '.' : '';
    }
    $$('[name="consult"]', form).forEach(function (r0) {
      r0.addEventListener('change', function () {
        state.type = r0.value;
        state.slot = null;
        buildDays();
        renderSlots();
        summary();
      });
    });
    var pre = new URLSearchParams(window.location.search).get('type');
    if (pre && CONSULT_TYPES[pre]) { var radio = $('[name="consult"][value="' + pre + '"]', form); if (radio) { radio.checked = true; state.type = pre; } }
    var listingParam = listingById(new URLSearchParams(window.location.search).get('listing'));
    if (listingParam && form.elements.message) form.elements.message.value = 'I’d like to talk about ' + listingParam.address + '.';
    buildDays();
    renderSlots();
    summary();
    liveValidate(form);

    var success = $('[data-booking-success]', root);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = [];
      fields.push($('[name="consult"]', form));
      var proxy = $('[data-day-proxy]', root);
      proxy.value = state.day ? state.day.iso : '';
      fields.push(proxy);
      if (state.day) { var firstSlot = $('[name="slot"]', slotBox); if (firstSlot) fields.push(firstSlot); }
      fields = fields.concat($$('[data-validate]', $('[data-details]', root)));
      if (!validateFields(fields)) {
        if (lastInvalid === proxy) { var db = $('[data-day]', dayStrip); if (db) db.focus(); }
        return;
      }
      /* --- Connect a real booking tool or form endpoint here (see DOCS.md, "Consultation booking").
             Demo only: nothing is booked or sent. --- */
      var t = CONSULT_TYPES[state.type];
      var ref = makeRef();
      $('[data-confirm="name"]', success).textContent = firstName(form);
      $('[data-confirm="ref"]', success).textContent = ref;
      $('[data-confirm="type"]', success).textContent = t.label;
      $('[data-confirm="when"]', success).textContent = fmtDay(state.slot.start, AGENT.timeZone, true) + ' at ' + fmtTime(state.slot.start, AGENT.timeZone) + ' Central (' + t.minutes + ' minutes)';
      $('[data-confirm="where"]', success).textContent = t.where;
      $('[data-confirm="email"]', success).textContent = form.elements.email.value.trim();
      var note = zoneNote(state.slot.start);
      $('[data-confirm="local"]', success).textContent = note ? 'That is ' + note + '.' : '';
      form.hidden = true;
      success.hidden = false;
      success.focus();
      var ev = { uid: 'consult-' + state.slot.start.getTime(), start: state.slot.start, end: state.slot.end, title: t.label + ' with ' + AGENT.name, location: t.where, description: 'Consultation request ' + ref + '. ' + AGENT.name + ', ' + AGENT.phone + ', ' + AGENT.email };
      $('[data-confirm-ics]', success).onclick = function () { downloadIcs(ev, 'consultation-delia-quintero.ics'); };
    });
    $('[data-booking-reset]', root).addEventListener('click', function () {
      form.reset();
      state = { type: null, day: null, slot: null };
      buildDays(); renderSlots(); summary();
      success.hidden = true;
      form.hidden = false;
      $('[name="consult"]', form).focus();
    });
  }

  observeReveals();
})();

/* Back to top button. Created here so every page gets it; to remove it, delete this
   block and the .back-to-top styles in src/input.css. */
(function () {
  'use strict';
  if (document.querySelector('.back-to-top')) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.title = 'Back to top';
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
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
