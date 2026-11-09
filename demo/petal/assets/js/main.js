/* Hollyhock — site script for the Petal template
 * Vanilla JavaScript, no dependencies. Sections:
 *  1. Shop settings: address, hours, delivery rules, delivery zones
 *  2. Seasons
 *  3. Catalog: occasions, colors, price bands, sizes, bouquets
 *  4. Subscriptions, weddings and flower care data
 *  5. Helpers and saved data (safeStorage)
 *  6. Shop clock: Eastern time, delivery days, the same-day cut-off
 *  7. Bouquet artwork (SVG drawn from the product data)
 *  8. Basket (localStorage)
 *  9. Header, mobile menu, reveal, season, countdown, toast
 * 10. Product cards          14. Checkout
 * 11. Home and shop          15. Subscriptions
 * 12. Product page           16. Weddings, care guide, about
 * 13. Basket page            17. Forms and boot
 */
document.documentElement.classList.add('js');

(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Shop settings — edit these to make the template yours.
   *    All times are in TIMEZONE, so a visitor abroad still sees the
   *    florist's real clock.
   * ------------------------------------------------------------------ */
  const SHOP = {
    name: 'Hollyhock',
    address: '447 Mulberry Street, Macon, GA 31201',
    phone: '(478) 555-0163',
    email: 'hello@hollyhockflowers.example'
  };
  const TIMEZONE = 'America/New_York';
  const LOCALE = 'en-US';
  const CURRENCY = 'USD';

  // Studio opening hours, Sunday first, ['open', 'close'] or null when closed.
  const HOURS = [
    null,               // Sunday
    ['08:30', '17:30'], // Monday
    ['08:30', '17:30'], // Tuesday
    ['08:30', '17:30'], // Wednesday
    ['08:30', '17:30'], // Thursday
    ['08:30', '17:30'], // Friday
    ['09:00', '16:00']  // Saturday
  ];

  // Delivery rules.
  //  cutoff: order before this time for delivery the same day
  //  days: weekdays we deliver (0 = Sunday … 6 = Saturday)
  //  daysAhead: how far ahead the date picker goes
  //  messageMax / fromMax: gift card limits
  //  maxQty: most of one bouquet per line
  const DELIVERY = { cutoff: '13:00', days: [1, 2, 3, 4, 5, 6], daysAhead: 27, messageMax: 200, fromMax: 40, maxQty: 10 };

  // Days we never deliver, every year ('MM-DD'): New Year's Day, the Fourth of July, Christmas Day.
  const CLOSED_DATES = ['01-01', '07-04', '12-25'];
  // Holidays that move, worked out for any year: [month, weekday (0 = Sunday), nth (-1 = last)].
  // Memorial Day, Labor Day and Thanksgiving. A holiday closes the day itself, not an observed day.
  const CLOSED_RULES = [[5, 1, -1], [9, 1, 1], [11, 4, 4]];

  // Our busiest days, worked out for any year (the FAQ on about.html shows the next dates):
  // a fixed month and day, or a month and [weekday, nth].
  const PEAK_DAYS = [
    { name: 'Valentine’s Day', month: 2, day: 14 },
    { name: 'Mother’s Day', month: 5, rule: [0, 2] }
  ];

  // Days the vans are full. KEEP_DEMO_CURRENT moves these forward in whole weeks from
  // DEMO_ANCHOR so the demo always shows some fully booked days ahead (weekdays never change).
  // Set it to false once you enter real dates.
  const KEEP_DEMO_CURRENT = true;
  const DEMO_ANCHOR = '2026-10-17';
  const FULLY_BOOKED = ['2026-10-22', '2026-10-28', '2026-10-31'];

  // Delivery zones by 5-digit ZIP code. fee is per delivery day; sameDay false means
  // the earliest delivery there is the next delivery day.
  const ZONES = [
    { id: 'town', label: 'Macon', districts: ['31201', '31204', '31206', '31210', '31211', '31216', '31217', '31220'], fee: 10, sameDay: true },
    { id: 'villages', label: 'Towns around Macon', districts: ['31008', '31020', '31052'], fee: 15, sameDay: true },
    { id: 'county', label: 'Farther out in Middle Georgia', districts: ['31028', '31029', '31061', '31088', '31093'], fee: 25, sameDay: false }
  ];

  /* ------------------------------------------------------------------
   * 2. Seasons, by month in the shop's time zone. The colors live in
   *    src/input.css (:root[data-season=…]); this is the wording.
   * ------------------------------------------------------------------ */
  const SEASONS = {
    spring: { label: 'spring', months: [3, 4, 5], flowers: ['Ranunculus', 'Tulips', 'Snapdragons', 'Sweet peas', 'Cherry blossom'] },
    summer: { label: 'summer', months: [6, 7, 8], flowers: ['Zinnias', 'Sunflowers', 'Lisianthus', 'Celosia', 'Hydrangeas'] },
    autumn: { label: 'fall', months: [9, 10, 11], flowers: ['Dahlias', 'Chrysanthemums', 'Marigolds', 'Beautyberry', 'Cotton stems'] },
    winter: { label: 'winter', months: [12, 1, 2], flowers: ['Amaryllis', 'Camellias', 'Anemones', 'Magnolia leaves', 'Winterberry'] }
  };

  /* ------------------------------------------------------------------
   * 3. Catalog
   * ------------------------------------------------------------------ */
  const OCCASIONS = {
    birthday: 'Birthday',
    anniversary: 'Anniversary',
    'thank-you': 'Thank you',
    sympathy: 'Sympathy',
    'new-baby': 'New baby',
    'just-because': 'Just because'
  };
  const COLOURS = {
    pink: { label: 'Pink', swatch: '#f47fa4' },
    red: { label: 'Red', swatch: '#c8102e' },
    orange: { label: 'Orange', swatch: '#ec5f12' },
    yellow: { label: 'Yellow', swatch: '#ffc83d' },
    blue: { label: 'Blue', swatch: '#3d5bd9' },
    purple: { label: 'Purple', swatch: '#8e5bd6' },
    white: { label: 'White', swatch: '#ffffff' }
  };
  // Price bands for the shop filter (classic size), in dollars: [min, max).
  const PRICE_BANDS = {
    'under-60': { label: 'Under $60', min: 0, max: 60 },
    '60-80': { label: '$60 to $80', min: 60, max: 80.01 },
    'over-80': { label: 'Over $80', min: 80.01, max: Infinity }
  };
  const SORTS = {
    featured: 'Featured',
    'price-asc': 'Price, low to high',
    'price-desc': 'Price, high to low',
    name: 'Name, A to Z'
  };
  // Every bouquet comes in three sizes. add: dollars on top of the classic price; extra: flower heads added to the drawing.
  const SIZES = {
    classic: { label: 'Classic', add: 0, stems: 'About 15 stems', extra: 0 },
    generous: { label: 'Generous', add: 20, stems: 'About 22 stems', extra: 2 },
    abundant: { label: 'Abundant', add: 40, stems: 'About 30 stems', extra: 4 }
  };
  const SIZE_ORDER = ['classic', 'generous', 'abundant'];

  // tint: card background (tint-pink, tint-yellow, tint-blue, tint-green, tint-purple, tint-snow).
  // art: how the bouquet is drawn (see section 7).
  const PRODUCTS = [
    { id: 'florists-choice', name: 'The Florist’s Choice', price: 65, tint: 'tint-season', bestseller: 1,
      occasions: ['birthday', 'thank-you', 'just-because', 'anniversary'], colours: ['pink', 'orange', 'purple'],
      blurb: 'Whatever is best at the market this morning, wrapped the way Oonagh would want it for herself.',
      details: 'Different every day, always seasonal. Expect five or six varieties and plenty of foliage.',
      art: { wrap: 'paper', paper: '#f4ead8', ribbon: '#14201a', shape: 'dome', foliage: 'eucalyptus',
        heads: [['dahlia', '#ec5f12'], ['rose', '#f47fa4'], ['ranunculus', '#ffb020'], ['anemone', '#ffffff'], ['dahlia', '#c2185b'], ['rose', '#ffb020'], ['ranunculus', '#f47fa4'], ['anemone', '#8e5bd6'], ['rose', '#ec5f12']], spikes: ['#8e5bd6'] } },
    { id: 'peony-blush', name: 'Blush Peony Posy', price: 75, tint: 'tint-pink', bestseller: 2,
      occasions: ['birthday', 'anniversary', 'new-baby'], colours: ['pink', 'white'],
      blurb: 'Fat pink peonies with white spray roses and a cloud of waxflower.',
      details: 'Peonies arrive in bud and open over two or three days. In fall and winter we use garden roses instead.',
      art: { wrap: 'paper', paper: '#ffffff', ribbon: '#e0306f', shape: 'dome', foliage: 'leaf',
        heads: [['peony', '#f7a1c0'], ['peony', '#f47fa4'], ['rose', '#ffffff'], ['peony', '#fbc9da'], ['rose', '#f7a1c0'], ['daisy', '#ffffff'], ['peony', '#f47fa4'], ['rose', '#ffffff'], ['daisy', '#ffffff']] } },
    { id: 'marmalade-sky', name: 'Marmalade Sky', price: 70, tint: 'tint-yellow', bestseller: 3,
      occasions: ['birthday', 'thank-you', 'just-because'], colours: ['orange', 'yellow'],
      blurb: 'Burnt orange dahlias, apricot roses and golden craspedia. Loud in the best way.',
      details: 'A warm, bright mix that suits a kitchen table. Dahlias last about five days; the roses go on for longer.',
      art: { wrap: 'paper', paper: '#14201a', ribbon: '#ffb020', shape: 'loose', foliage: 'leaf',
        heads: [['dahlia', '#ec5f12'], ['rose', '#ffb020'], ['dahlia', '#ff8a3d'], ['daisy', '#ffc83d'], ['rose', '#ff8a3d'], ['dahlia', '#ffb020'], ['daisy', '#ffffff'], ['rose', '#ec5f12'], ['dahlia', '#ffc83d']] } },
    { id: 'meadow-blue', name: 'Meadow Blue', price: 55, tint: 'tint-blue', bestseller: 4,
      occasions: ['thank-you', 'just-because', 'birthday'], colours: ['blue', 'white'],
      blurb: 'Cornflowers, delphinium and white scabious, loose and a little wild.',
      details: 'Picked to look like it came from a field edge. Delphinium spires add height.',
      art: { wrap: 'paper', paper: '#e2e8ff', ribbon: '#3d5bd9', shape: 'tall', foliage: 'fern',
        heads: [['daisy', '#3d5bd9'], ['anemone', '#ffffff'], ['daisy', '#6f86e8'], ['anemone', '#3d5bd9'], ['daisy', '#ffffff'], ['daisy', '#3d5bd9'], ['anemone', '#ffffff'], ['daisy', '#6f86e8'], ['anemone', '#3d5bd9']], spikes: ['#3d5bd9', '#6f86e8'] } },
    { id: 'white-garden', name: 'White Garden', price: 80, tint: 'tint-green',
      occasions: ['sympathy', 'new-baby', 'anniversary'], colours: ['white'],
      blurb: 'White roses, anemones and lisianthus with silver eucalyptus. Quiet and generous.',
      details: 'Our most-asked-for sympathy bouquet. We can deliver it to a funeral home; add their details at checkout.',
      art: { wrap: 'paper', paper: '#dcf2e5', ribbon: '#14201a', shape: 'dome', foliage: 'eucalyptus',
        heads: [['rose', '#ffffff'], ['anemone', '#ffffff'], ['peony', '#ffffff'], ['rose', '#f5f1e8'], ['anemone', '#ffffff'], ['ranunculus', '#ffffff'], ['rose', '#ffffff'], ['daisy', '#ffffff'], ['peony', '#f5f1e8']] } },
    { id: 'tulip-armful', name: 'Tulip Armful', price: 55, tint: 'tint-purple',
      occasions: ['birthday', 'just-because', 'thank-you'], colours: ['pink', 'purple'],
      blurb: 'Twenty-five tulips in pinks and plums, tied simply and left to bend.',
      details: 'Tulips keep growing in the vase, so give them a trim every couple of days and let them wander.',
      art: { wrap: 'paper', paper: '#efe7ff', ribbon: '#8e5bd6', shape: 'tall', foliage: 'leaf',
        heads: [['tulip', '#f47fa4'], ['tulip', '#8e5bd6'], ['tulip', '#c2185b'], ['tulip', '#f7a1c0'], ['tulip', '#6b3fb0'], ['tulip', '#f47fa4'], ['tulip', '#c2185b'], ['tulip', '#8e5bd6'], ['tulip', '#f7a1c0']] } },
    { id: 'velvet-red', name: 'Velvet Red', price: 95, tint: 'tint-pink',
      occasions: ['anniversary', 'birthday'], colours: ['red'],
      blurb: 'Deep red roses and ranunculus with dark foliage. The grown-up romantic.',
      details: 'Long-lasting Ecuadorian roses with Georgia-grown ranunculus when in season.',
      art: { wrap: 'paper', paper: '#ffffff', ribbon: '#c8102e', shape: 'dome', foliage: 'leaf',
        heads: [['rose', '#c8102e'], ['rose', '#9e0c25'], ['ranunculus', '#c8102e'], ['rose', '#c8102e'], ['rose', '#9e0c25'], ['ranunculus', '#e0306f'], ['rose', '#c8102e'], ['rose', '#9e0c25'], ['ranunculus', '#c8102e']] } },
    { id: 'little-sunshine', name: 'Little Sunshine', price: 45, tint: 'tint-yellow',
      occasions: ['new-baby', 'thank-you', 'just-because'], colours: ['yellow', 'white'],
      blurb: 'A small, sunny posy of yellow ranunculus, chamomile and solidago.',
      details: 'Sized for a bedside table or a desk. Lovely for a new arrival.',
      art: { wrap: 'paper', paper: '#fff0c7', ribbon: '#14201a', shape: 'dome', foliage: 'fern',
        heads: [['ranunculus', '#ffc83d'], ['daisy', '#ffffff'], ['ranunculus', '#ffb020'], ['daisy', '#ffffff'], ['ranunculus', '#ffe08a'], ['daisy', '#ffffff'], ['ranunculus', '#ffc83d'], ['daisy', '#ffffff'], ['ranunculus', '#ffb020']] } },
    { id: 'lilac-haze', name: 'Lilac Haze', price: 70, tint: 'tint-purple',
      occasions: ['sympathy', 'just-because', 'anniversary'], colours: ['purple', 'white'],
      blurb: 'Lilac stocks, lavender roses and veronica in soft, smoky purples.',
      details: 'Stocks are scented, so this one fills a room. Change the water every other day.',
      art: { wrap: 'paper', paper: '#ffffff', ribbon: '#8e5bd6', shape: 'loose', foliage: 'eucalyptus',
        heads: [['rose', '#b79ae8'], ['anemone', '#ffffff'], ['rose', '#8e5bd6'], ['peony', '#d8c7f5'], ['rose', '#b79ae8'], ['anemone', '#8e5bd6'], ['rose', '#ffffff'], ['peony', '#b79ae8'], ['rose', '#8e5bd6']], spikes: ['#8e5bd6', '#b79ae8'] } },
    { id: 'rose-hatbox', name: 'Rose Hatbox', price: 110, tint: 'tint-pink',
      occasions: ['anniversary', 'birthday'], colours: ['pink', 'red'],
      blurb: 'Roses packed into a keepsake hatbox on wet foam. No vase needed.',
      details: 'Top up the foam with a little water every day and it lasts about a week. The box is yours to keep.',
      art: { wrap: 'box', box: '#14201a', band: '#e0306f', shape: 'dome', foliage: 'none',
        heads: [['rose', '#f47fa4'], ['rose', '#c8102e'], ['rose', '#f7a1c0'], ['rose', '#e0306f'], ['rose', '#f47fa4'], ['rose', '#c8102e'], ['rose', '#f7a1c0'], ['rose', '#e0306f'], ['rose', '#f47fa4']] } },
    { id: 'hedgerow-jug', name: 'Fencerow Pitcher', price: 75, tint: 'tint-green',
      occasions: ['thank-you', 'just-because', 'sympathy'], colours: ['white', 'orange'],
      blurb: 'Garden flowers, grasses and berries, arranged in an enamel pitcher.',
      details: 'Arrives arranged and watered in a white enamel pitcher you can keep.',
      art: { wrap: 'jug', jug: '#ffffff', rim: '#14201a', shape: 'loose', foliage: 'fern',
        heads: [['daisy', '#ffffff'], ['dahlia', '#ec5f12'], ['anemone', '#ffffff'], ['daisy', '#ffc83d'], ['rose', '#ff8a3d'], ['daisy', '#ffffff'], ['dahlia', '#ffb020'], ['anemone', '#ffffff'], ['daisy', '#ffffff']], spikes: ['#ffffff'] } },
    { id: 'silver-birch', name: 'River Birch', price: 50, tint: 'tint-snow',
      occasions: ['sympathy', 'new-baby', 'thank-you'], colours: ['white'],
      blurb: 'White ranunculus and spray roses with silver eucalyptus and twigs.',
      details: 'Simple and calm. The eucalyptus dries beautifully once the flowers are over.',
      art: { wrap: 'paper', paper: '#14201a', ribbon: '#ffffff', shape: 'tall', foliage: 'eucalyptus',
        heads: [['ranunculus', '#ffffff'], ['rose', '#ffffff'], ['ranunculus', '#f5f1e8'], ['daisy', '#ffffff'], ['rose', '#ffffff'], ['ranunculus', '#ffffff'], ['rose', '#f5f1e8'], ['ranunculus', '#ffffff'], ['daisy', '#ffffff']] } }
  ];

  /* ------------------------------------------------------------------
   * 4. Subscriptions, weddings and flower care
   * ------------------------------------------------------------------ */
  // perYear: deliveries a year; discount: off the one-off price of the same size.
  const SUBSCRIPTION = {
    plans: {
      weekly: { label: 'Weekly', perYear: 52, discount: 0.2, every: 7 },
      fortnightly: { label: 'Every two weeks', perYear: 26, discount: 0.15, every: 14 },
      monthly: { label: 'Monthly', perYear: 12, discount: 0.1, every: 28 }
    },
    sizes: {
      classic: { label: 'Classic', price: 60 },
      generous: { label: 'Generous', price: 80 },
      abundant: { label: 'Abundant', price: 100 }
    },
    days: [2, 3, 4, 5], // Tuesday to Friday
    preview: 4         // upcoming deliveries listed
  };

  // Wedding and event estimate. price per item, max per inquiry.
  const WEDDING = {
    items: [
      { id: 'bridal', label: 'Bridal bouquet', price: 225, max: 3 },
      { id: 'bridesmaid', label: 'Bridesmaid bouquets', price: 95, max: 10 },
      { id: 'buttonhole', label: 'Boutonnieres', price: 18, max: 40 },
      { id: 'corsage', label: 'Corsages', price: 30, max: 20 },
      { id: 'centrepiece', label: 'Table centerpieces', price: 85, max: 40 },
      { id: 'arch', label: 'Ceremony arch or arbor', price: 1200, max: 1 }
    ],
    setupRate: 0.15,  // setup and teardown, as a share of the flowers
    setupMin: 250,
    minSpend: 1000,
    leadWeeks: 8      // earliest event date, in weeks from today
  };

  // The care guide's day-by-day plan, counted from delivery day (day 1).
  const CARE_PLAN = [
    { from: 1, to: 1, title: 'Unwrap and trim', text: 'Fill a clean vase with cool water and the flower food. Cut about an inch off each stem at an angle and strip any leaves below the waterline.' },
    { from: 2, to: 2, title: 'Find the right spot', text: 'Out of direct sun, away from heat vents and the fruit bowl (ripening fruit makes flowers fade faster).' },
    { from: 3, to: 4, title: 'Fresh water, fresh cut', text: 'Change the water completely, rinse the vase and trim another half inch off the stems.' },
    { from: 5, to: 6, title: 'Edit the bunch', text: 'Take out anything that has gone over so it doesn’t shorten the life of the rest. Re-cut and re-water.' },
    { from: 7, to: 9, title: 'Make a smaller vase', text: 'Cut the strongest stems short and put them in a mason jar or a tumbler. Eucalyptus can be hung up to dry.' },
    { from: 10, to: 99, title: 'Compost and come back', text: 'Most bouquets are over by now. Compost the stems and wash the vase with hot soapy water before it goes away.' }
  ];

  // Flowers in the care guide. vase: typical vase life in days.
  const FLOWER_CARE = [
    { name: 'Roses', vase: '7–10 days', tip: 'If a head droops, re-cut the stem and stand it in deep, warm water for an hour.' },
    { name: 'Peonies', vase: '5–7 days', tip: 'Buds open faster in a warm room. Wipe sticky buds with a damp cloth to help them along.' },
    { name: 'Tulips', vase: '5–7 days', tip: 'They keep growing and bend toward light. Turn the vase daily, or let them wander.' },
    { name: 'Dahlias', vase: '4–6 days', tip: 'Change the water daily: dahlias drink a lot and dirty water shortens their life.' },
    { name: 'Ranunculus', vase: '7–10 days', tip: 'Keep the water shallow; their hollow stems go soft if they stand too deep.' },
    { name: 'Anemones', vase: '5–7 days', tip: 'They close at night and open in the light. Keep them cool overnight.' },
    { name: 'Sweet peas', vase: '4–5 days', tip: 'Enjoy the scent while it lasts. Keep them away from fruit and heat vents.' },
    { name: 'Chrysanthemums', vase: '10–14 days', tip: 'Remove leaves below the waterline; they rot quickly and cloud the water.' },
    { name: 'Eucalyptus', vase: '2–3 weeks', tip: 'Once the flowers are done, hang eucalyptus upside down to dry for a winter vase.' },
    { name: 'Hydrangeas', vase: '5–7 days', tip: 'If a head wilts, submerge it in cool water for an hour. They drink through their petals.' },
    { name: 'Lilies', vase: '7–12 days', tip: 'Pull off the orange anthers as the flowers open: pollen stains, and lilies are toxic to cats.' },
    { name: 'Stocks', vase: '5–7 days', tip: 'Change the water every other day; stocks get smelly in old water.' }
  ];

  /* ------------------------------------------------------------------
   * 5. Helpers and saved data
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const has = (obj, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const round2 = (n) => Math.round(n * 100) / 100;
  const money = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });
  // $38.40, but whole dollars without cents ($40).
  function price(n) {
    return Number.isInteger(round2(n)) ? money.format(n).replace(/\.00$/, '') : money.format(n);
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function listText(items) {
    if (items.length < 2) return items.join('');
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function urlParams() {
    const out = new URLSearchParams();
    new URLSearchParams(location.search).forEach((v, k) => out.append(k.toLowerCase(), v));
    return out;
  }
  // Plain text from storage or a form: no control characters, trimmed to max.
  function cleanText(value, max) {
    return typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').slice(0, max) : '';
  }

  const PRODUCT_BY_ID = PRODUCTS.reduce((m, p) => { m[p.id] = p; return m; }, Object.create(null));
  const findProduct = (id) => (typeof id === 'string' && PRODUCT_BY_ID[id]) || null;
  const unitPrice = (p, size) => p.price + SIZES[size].add;

  // localStorage, or an in-memory stand-in when the browser blocks it (a sandboxed iframe, strict
  // privacy settings): saved state then lasts for this page view instead of the feature doing nothing.
  const safeStorage = (function () {
    let local = null;
    try { local = window.localStorage; local.getItem('_'); } catch (e) { local = null; /* blocked */ }
    // A save that fails (storage full) stays in memory, and memory is read first, so the change isn't lost.
    const memory = Object.create(null);
    return {
      getItem: (key) => {
        if (key in memory) return memory[key];
        try { return local ? local.getItem(key) : null; } catch (e) { return null; }
      },
      setItem: (key, value) => {
        if (local) {
          try { local.setItem(key, String(value)); delete memory[key]; return; } catch (e) { /* full */ }
        }
        memory[key] = String(value);
      },
      removeItem: (key) => {
        delete memory[key];
        if (local) { try { local.removeItem(key); } catch (e) { /* blocked */ } }
      }
    };
  })();
  const KEYS = { basket: 'petal-basket', drafts: 'petal-gift-drafts', lastOrder: 'petal-last-order' };
  function read(key) {
    try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; }
  }
  function write(key, value) {
    try {
      if (value === null) safeStorage.removeItem(key);
      else safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage full: the page keeps working without it */ }
  }

  /* ------------------------------------------------------------------
   * 6. Shop clock. Dates are 'YYYY-MM-DD' strings in TIMEZONE.
   *    Add ?now=2026-10-17T10:15 to any page to preview another time;
   *    the preview clock keeps ticking from there.
   * ------------------------------------------------------------------ */
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const pad = (n) => String(n).padStart(2, '0');
  const toMins = (t) => { const p = t.split(':'); return +p[0] * 60 + +p[1]; };
  const isIsoDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + 'T12:00:00Z')) && new Date(s + 'T12:00:00Z').toISOString().slice(0, 10) === s;
  const dayOf = (iso) => new Date(iso + 'T12:00:00Z').getUTCDay();
  const dayNum = (iso) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
  function addDays(iso, n) {
    const d = new Date(iso + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  // 780 → "1pm", 510 → "8:30am", 720 → "12 noon"
  function clock(mins) {
    const h = Math.floor(mins / 60) % 24, m = mins % 60;
    if (h === 12 && m === 0) return '12 noon';
    return (h % 12 || 12) + (m ? ':' + pad(m) : '') + (h < 12 ? 'am' : 'pm');
  }

  const LOADED_AT = Date.now();
  const PREVIEW = (function () {
    const v = urlParams().get('now');
    if (!v || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) || !isIsoDate(v.slice(0, 10))) return null;
    const h = +v.slice(11, 13), m = +v.slice(14, 16);
    return h < 24 && m < 60 ? Date.parse(v + ':00Z') : null;
  })();
  // { date: 'YYYY-MM-DD', day: 0-6, mins, secs: seconds since midnight, month: 1-12 }
  function shopNow() {
    let y, mo, d, h, mi, s;
    if (PREVIEW !== null) {
      const t = new Date(PREVIEW + (Date.now() - LOADED_AT));
      y = t.getUTCFullYear(); mo = t.getUTCMonth() + 1; d = t.getUTCDate(); h = t.getUTCHours(); mi = t.getUTCMinutes(); s = t.getUTCSeconds();
    } else {
      const parts = {};
      new Intl.DateTimeFormat(LOCALE, { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach((p) => { parts[p.type] = p.value; });
      y = +parts.year; mo = +parts.month; d = +parts.day; h = +parts.hour % 24; mi = +parts.minute; s = +parts.second;
    }
    const date = y + '-' + pad(mo) + '-' + pad(d);
    return { date: date, day: dayOf(date), mins: h * 60 + mi, secs: h * 3600 + mi * 60 + s, month: mo };
  }
  function seasonId(month) {
    return Object.keys(SEASONS).find((k) => SEASONS[k].months.indexOf(month) !== -1) || 'summer';
  }
  function fmtDate(iso, opts) {
    return new Intl.DateTimeFormat(LOCALE, Object.assign({ weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }, opts || {}))
      .format(new Date(iso + 'T12:00:00Z'));
  }
  // "Today", "Tomorrow", or "Monday, October 19" (short: "Mon, Oct 19").
  // The same, for the middle of a sentence ("delivered today, October 17").
  const inSentence = (iso, short) => dateLabel(iso, short).replace(/^(Today|Tomorrow)/, (m) => m.toLowerCase());
  function dateLabel(iso, short) {
    const today = shopNow().date;
    if (iso === today) return short ? 'Today' : 'Today, ' + fmtDate(iso, { weekday: undefined });
    if (iso === addDays(today, 1)) return short ? 'Tomorrow' : 'Tomorrow, ' + fmtDate(iso);
    return short ? fmtDate(iso, { weekday: 'short', month: 'short' }) : fmtDate(iso);
  }

  const BOOKED = (function () {
    const shift = KEEP_DEMO_CURRENT ? Math.floor((dayNum(shopNow().date) - dayNum(DEMO_ANCHOR)) / 7) * 7 : 0;
    const set = Object.create(null);
    FULLY_BOOKED.forEach((iso) => { if (isIsoDate(iso)) set[addDays(iso, shift)] = true; });
    return set;
  })();
  // The nth given weekday (0 = Sunday) of a month, as 'YYYY-MM-DD'; nth -1 is the last one.
  function nthWeekday(year, month, weekday, nth) {
    const first = year + '-' + pad(month) + '-01';
    if (nth > 0) return addDays(first, (weekday - dayOf(first) + 7) % 7 + (nth - 1) * 7);
    const last = addDays(month === 12 ? (year + 1) + '-01-01' : year + '-' + pad(month + 1) + '-01', -1);
    return addDays(last, -((dayOf(last) - weekday + 7) % 7));
  }
  const isClosedDate = (iso) => CLOSED_DATES.indexOf(iso.slice(5)) !== -1 ||
    CLOSED_RULES.some((c) => nthWeekday(+iso.slice(0, 4), c[0], c[1], c[2]) === iso);
  const isBooked = (iso) => BOOKED[iso] === true;

  // Can we deliver on this date? { ok, reason: 'past' | 'far' | 'sunday' | 'closed' | 'booked' | 'cutoff', text }
  function deliveryState(iso) {
    const now = shopNow();
    if (!isIsoDate(iso) || iso < now.date) return { ok: false, reason: 'past', text: 'In the past' };
    if (iso > addDays(now.date, DELIVERY.daysAhead)) return { ok: false, reason: 'far', text: 'Too far ahead to book' };
    if (DELIVERY.days.indexOf(dayOf(iso)) === -1) return { ok: false, reason: 'sunday', text: 'No deliveries on ' + DAY_NAMES[dayOf(iso)] + 's' };
    if (isClosedDate(iso)) return { ok: false, reason: 'closed', text: 'Closed for the holiday' };
    if (isBooked(iso)) return { ok: false, reason: 'booked', text: 'Fully booked' };
    if (iso === now.date && now.mins >= toMins(DELIVERY.cutoff)) return { ok: false, reason: 'cutoff', text: 'Same-day orders close at ' + clock(toMins(DELIVERY.cutoff)) };
    return { ok: true, reason: '', text: 'Available' };
  }
  function earliestDelivery(from) {
    let d = from || shopNow().date;
    for (let i = 0; i <= DELIVERY.daysAhead + 7; i++, d = addDays(d, 1)) if (deliveryState(d).ok) return d;
    return null;
  }
  function deliveryDates() {
    const today = shopNow().date, out = [];
    for (let i = 0; i <= DELIVERY.daysAhead; i++) { const d = addDays(today, i); if (deliveryState(d).ok) out.push(d); }
    return out;
  }
  // Seconds left to order for delivery today, or 0 when same-day delivery isn't on.
  function secondsToCutoff() {
    const now = shopNow();
    const st = deliveryState(now.date);
    return st.ok ? Math.max(0, toMins(DELIVERY.cutoff) * 60 - now.secs) : 0;
  }
  // The headline for the delivery band and the home page countdown.
  function deliveryMessage() {
    const left = secondsToCutoff();
    if (left > 0) {
      const h = Math.floor(left / 3600), m = Math.floor(left / 60) % 60, s = left % 60;
      return { sameDay: true, left: left, digits: pad(h) + ':' + pad(m) + ':' + pad(s),
        text: 'Order in the next ' + (h ? h + 'h ' : '') + pad(m) + 'm ' + pad(s) + 's for delivery today' };
    }
    const now = shopNow();
    const next = earliestDelivery();
    const st = deliveryState(now.date);
    const why = st.reason === 'cutoff' ? 'Same-day orders closed at ' + clock(toMins(DELIVERY.cutoff)) + '.'
      : st.reason === 'sunday' ? 'We don’t deliver on Sundays.'
      : st.reason === 'booked' ? 'Today is fully booked.'
      : st.reason === 'closed' ? 'We’re closed today.' : '';
    const when = !next ? 'soon' : next === addDays(now.date, 1) ? 'tomorrow, ' + fmtDate(next) : fmtDate(next);
    return { sameDay: false, left: 0, digits: '', next: next, why: why, text: 'Order now for delivery ' + when };
  }
  // { open, text } for the studio, e.g. "Open now until 5:30pm" / "Closed · opens Monday 8:30am"
  function studioStatus() {
    const now = shopNow();
    const h = HOURS[now.day];
    if (h && now.mins >= toMins(h[0]) && now.mins < toMins(h[1])) return { open: true, text: 'Studio open now until ' + clock(toMins(h[1])) };
    if (h && now.mins < toMins(h[0])) return { open: false, text: 'Studio opens today at ' + clock(toMins(h[0])) };
    for (let i = 1; i <= 7; i++) {
      const d = (now.day + i) % 7;
      if (HOURS[d]) return { open: false, text: 'Studio closed · opens ' + (i === 1 ? 'tomorrow' : DAY_NAMES[d]) + ' ' + clock(toMins(HOURS[d][0])) };
    }
    return { open: false, text: 'Studio closed' };
  }

  // The next Valentine's Day and Mother's Day, and the day we'd deliver for each when we don't
  // deliver on the day itself ("Valentine's Day is Sunday, February 14, 2027, and …").
  function peakDayText() {
    const today = shopNow().date, year = +today.slice(0, 4);
    const dateIn = (p, y) => (p.rule ? nthWeekday(y, p.month, p.rule[0], p.rule[1]) : y + '-' + pad(p.month) + '-' + pad(p.day));
    return PEAK_DAYS.map((p) => ({ name: p.name, date: dateIn(p, year) >= today ? dateIn(p, year) : dateIn(p, year + 1) }))
      .sort((a, b) => (a.date < b.date ? -1 : 1))
      .map((p) => {
        let d = p.date;
        while (DELIVERY.days.indexOf(dayOf(d)) === -1 || isClosedDate(d)) d = addDays(d, -1);
        return p.name + ' is ' + fmtDate(p.date, { year: 'numeric' }) + (d === p.date ? '.' : ', and we don’t deliver that day, so those bouquets go out the day before, on ' + fmtDate(d) + '.');
      }).join(' ');
  }

  // ZIP code → { district, zone } ; district is the first five digits; zone is null when we don't deliver there.
  function normalisePostcode(v) {
    const s = String(v || '').trim();
    const m = s.match(/^(\d{5})[-\s]?(\d{4})?$/);
    return m ? m[1] + (m[2] ? '-' + m[2] : '') : s;
  }
  function checkPostcode(v) {
    const pc = normalisePostcode(v);
    if (!/^\d{5}(-\d{4})?$/.test(pc)) return { valid: false, postcode: pc, district: '', zone: null };
    const district = pc.slice(0, 5);
    const zone = ZONES.find((z) => z.districts.indexOf(district) !== -1) || null;
    return { valid: true, postcode: pc, district: district, zone: zone };
  }

  /* ------------------------------------------------------------------
   * 7. Bouquet artwork. Art.bouquet(art, extra, key) returns a 240×280
   *    hand-drawn SVG from a product's art settings:
   *      wrap: 'paper' | 'box' | 'jug'      shape: 'dome' | 'tall' | 'loose'
   *      heads: [[kind, color], …] kinds: rose, peony, dahlia, ranunculus, anemone, daisy, tulip
   *      spikes: colors of delphinium-style spires   foliage: 'eucalyptus' | 'leaf' | 'fern' | 'none'
   *    Colors can be CSS variables ('var(--season-1)').
   * ------------------------------------------------------------------ */
  /* ART:START */
  const Art = (function () {
    const INK = '#14201a';
    const STEM = '#3f7d4f';
    const SLOTS = {
      dome: [[120, 94, 30], [82, 112, 27], [158, 112, 27], [100, 64, 24], [142, 66, 24], [54, 138, 22], [186, 138, 22], [120, 134, 25], [122, 36, 20]],
      tall: [[120, 70, 26], [88, 98, 23], [152, 94, 23], [106, 40, 21], [66, 128, 20], [174, 126, 20], [128, 122, 22], [140, 18, 18], [96, 148, 19]],
      loose: [[110, 90, 26], [156, 106, 23], [72, 118, 22], [140, 58, 21], [84, 56, 20], [188, 72, 18], [48, 88, 18], [124, 134, 22], [170, 146, 18]]
    };
    const SPIKE_SLOTS = [[72, 74], [168, 66], [124, 28]];
    const f = (n) => Math.round(n * 10) / 10;
    // fill attribute; CSS variables need the style attribute.
    const fill = (c) => (c.indexOf('var(') === 0 ? 'style="fill:' + c + '"' : 'fill="' + c + '"');
    const line = 'stroke="' + INK + '" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"';
    function seeded(key) {
      let h = 2166136261;
      for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
      return function () { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    }
    function petalRing(cx, cy, n, dist, rx, ry, c, rot) {
      let s = '';
      for (let i = 0; i < n; i++) {
        const a = rot + (360 / n) * i;
        s += '<ellipse cx="' + f(cx) + '" cy="' + f(cy - dist) + '" rx="' + f(rx) + '" ry="' + f(ry) + '" ' + fill(c) + ' ' + line + ' transform="rotate(' + f(a) + ' ' + f(cx) + ' ' + f(cy) + ')"/>';
      }
      return s;
    }
    const HEAD = {
      rose(cx, cy, r, c) {
        return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" ' + fill(c) + ' ' + line + '/>' +
          '<path d="M' + f(cx - r * .18) + ' ' + f(cy) + 'a' + f(r * .2) + ' ' + f(r * .2) + ' 0 1 1 ' + f(r * .38) + ' 0a' + f(r * .45) + ' ' + f(r * .42) + ' 0 1 1 -' + f(r * .82) + ' ' + f(r * .06) +
          'a' + f(r * .7) + ' ' + f(r * .64) + ' 0 1 1 ' + f(r * 1.32) + ' -' + f(r * .18) + '" fill="none" stroke="' + INK + '" stroke-width="1.4" stroke-linecap="round" opacity=".55"/>';
      },
      peony(cx, cy, r, c) {
        return petalRing(cx, cy, 7, r * .45, r * .5, r * .5, c, 10) +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + f(r * .55) + '" ' + fill(c) + ' ' + line + '/>' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + f(r * .55) + '" fill="#fff" opacity=".28"/>' +
          '<path d="M' + f(cx - r * .3) + ' ' + f(cy + r * .05) + 'q' + f(r * .3) + ' -' + f(r * .35) + ' ' + f(r * .6) + ' 0" fill="none" stroke="' + INK + '" stroke-width="1.3" stroke-linecap="round" opacity=".5"/>';
      },
      dahlia(cx, cy, r, c) {
        let s = '';
        [[16, r * .62, r * .2, r * .42, 0], [12, r * .36, r * .17, r * .3, 15]].forEach((ring) => {
          for (let i = 0; i < ring[0]; i++) {
            const a = ring[4] + (360 / ring[0]) * i;
            s += '<path d="M' + cx + ' ' + cy + 'l-' + f(ring[2]) + ' -' + f(ring[1] * .6) + 'q' + f(ring[2]) + ' -' + f(ring[3]) + ' ' + f(ring[2] * 2) + ' 0z" ' + fill(c) + ' ' + line + ' transform="rotate(' + f(a) + ' ' + cx + ' ' + cy + ') translate(0 -' + f(ring[1] * .45) + ')"/>';
          }
        });
        return '<circle cx="' + cx + '" cy="' + cy + '" r="' + f(r * .9) + '" ' + fill(c) + ' ' + line + '/>' + s +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + f(r * .18) + '" fill="' + INK + '" opacity=".75"/>';
      },
      ranunculus(cx, cy, r, c) {
        return '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" ' + fill(c) + ' ' + line + '/>' +
          '<circle cx="' + cx + '" cy="' + f(cy - r * .05) + '" r="' + f(r * .68) + '" fill="#fff" opacity=".22" ' + line + '/>' +
          '<circle cx="' + cx + '" cy="' + f(cy - r * .1) + '" r="' + f(r * .4) + '" ' + fill(c) + ' ' + line + '/>' +
          '<circle cx="' + cx + '" cy="' + f(cy - r * .12) + '" r="' + f(r * .16) + '" fill="' + INK + '" opacity=".6"/>';
      },
      anemone(cx, cy, r, c) {
        return petalRing(cx, cy, 6, r * .48, r * .46, r * .52, c, 0) +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + f(r * .32) + '" fill="' + INK + '"/>' +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + f(r * .5) + '" fill="none" stroke="' + INK + '" stroke-width="1.2" stroke-dasharray="1 3" stroke-linecap="round"/>';
      },
      daisy(cx, cy, r, c) {
        return petalRing(cx, cy, 12, r * .55, r * .17, r * .45, c, 0) +
          '<circle cx="' + cx + '" cy="' + cy + '" r="' + f(r * .3) + '" fill="#ffb020" ' + line + '/>';
      },
      tulip(cx, cy, r, c) {
        return '<path d="M' + f(cx - r * .72) + ' ' + f(cy - r * .35) + 'C' + f(cx - r * .8) + ' ' + f(cy + r * .7) + ' ' + f(cx + r * .8) + ' ' + f(cy + r * .7) + ' ' + f(cx + r * .72) + ' ' + f(cy - r * .35) +
          'L' + f(cx + r * .36) + ' ' + f(cy - r * .02) + 'L' + cx + ' ' + f(cy - r * .62) + 'L' + f(cx - r * .36) + ' ' + f(cy - r * .02) + 'Z" ' + fill(c) + ' ' + line + '/>' +
          '<path d="M' + cx + ' ' + f(cy - r * .1) + 'v' + f(r * .5) + '" stroke="' + INK + '" stroke-width="1.3" opacity=".45" stroke-linecap="round"/>';
      }
    };
    function leaf(x, y, len, ang, c) {
      return '<path d="M0 0C' + f(len * .3) + ' -' + f(len * .28) + ' ' + f(len * .75) + ' -' + f(len * .25) + ' ' + f(len) + ' 0C' + f(len * .75) + ' ' + f(len * .25) + ' ' + f(len * .3) + ' ' + f(len * .28) + ' 0 0Z" fill="' + c + '" ' + line + ' transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')"/>' +
        '<path d="M0 0H' + f(len * .8) + '" stroke="' + INK + '" stroke-width="1" opacity=".35" transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + f(ang) + ')"/>';
    }
    function foliage(kind, rand, oy) {
      let s = '';
      const tie = [120, 196 + oy];
      if (kind === 'eucalyptus') {
        [[40, 96], [200, 92], [64, 40], [178, 36], [30, 150], [210, 146]].forEach((end) => {
          const ex = end[0], ey = end[1] + oy;
          s += '<path d="M' + tie[0] + ' ' + tie[1] + 'Q' + f((tie[0] + ex) / 2 + (ex < 120 ? 10 : -10)) + ' ' + f((tie[1] + ey) / 2) + ' ' + ex + ' ' + ey + '" fill="none" stroke="#6e8f7c" stroke-width="2" stroke-linecap="round"/>';
          for (let t = 0.35; t <= 1.001; t += 0.16) {
            const x = tie[0] + (ex - tie[0]) * t, y = tie[1] + (ey - tie[1]) * t;
            s += '<circle cx="' + f(x + (rand() * 8 - 4)) + '" cy="' + f(y + (rand() * 8 - 4)) + '" r="' + f(6 + rand() * 3) + '" fill="#9fbcaa" ' + line + '/>';
          }
        });
      } else if (kind === 'leaf') {
        [[78, 150, 62, 205], [162, 150, 62, -25], [70, 110, 56, 220], [170, 108, 56, -40], [104, 70, 50, 250], [140, 70, 50, -70]].forEach((l, i) => {
          s += leaf(l[0], l[1] + oy, l[2], l[3], i % 2 ? '#2f8a5b' : '#3f9a68');
        });
      } else if (kind === 'fern') {
        [[120, 196, 44, 70, -1], [120, 196, 196, 64, 1], [120, 196, 80, 24, -1], [120, 196, 166, 22, 1]].forEach((fr) => {
          const x0 = fr[0], y0 = fr[1] + oy, x1 = fr[2], y1 = fr[3] + oy;
          s += '<path d="M' + x0 + ' ' + y0 + 'L' + x1 + ' ' + y1 + '" stroke="#2f8a5b" stroke-width="2" stroke-linecap="round"/>';
          for (let t = 0.3; t < 1; t += 0.1) {
            const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
            const ang = Math.atan2(y1 - y0, x1 - x0) * 180 / Math.PI;
            const len = 16 * (1.1 - t);
            s += leaf(x, y, len + 6, ang - 55, '#4aa36f') + leaf(x, y, len + 6, ang + 55, '#4aa36f');
          }
        });
      }
      return s;
    }
    function spike(x, y, c, rand) {
      let s = '<path d="M' + x + ' ' + (y + 60) + 'Q' + (x + 4) + ' ' + (y + 20) + ' ' + x + ' ' + (y - 6) + '" fill="none" stroke="' + STEM + '" stroke-width="2.2"/>';
      for (let i = 0; i < 7; i++) {
        const yy = y + 50 - i * 8.5, rr = 7 - i * 0.6;
        s += '<circle cx="' + f(x + (i % 2 ? 4 : -4) + (rand() * 2 - 1)) + '" cy="' + f(yy) + '" r="' + f(rr) + '" ' + fill(c) + ' ' + line + '/>';
      }
      return s;
    }
    function bouquet(art, extra, key) {
      const rand = seeded(key || 'petal');
      const wrap = art.wrap || 'paper';
      const oy = wrap === 'box' ? 34 : wrap === 'jug' ? 26 : 0;
      const slots = SLOTS[art.shape] || SLOTS.dome;
      const count = Math.min(slots.length, 5 + (extra || 0));
      const heads = art.heads.slice(0, count).map((h, i) => ({ kind: h[0], c: h[1], x: slots[i][0], y: slots[i][1] + oy, r: slots[i][2] }));
      const tie = [120, 196 + oy];
      let back = '', mid = '', front = '';
      back += '<ellipse cx="120" cy="268" rx="78" ry="7" fill="' + INK + '" opacity=".1"/>';
      if (wrap === 'paper') {
        back += '<path d="M46 126 120 256 194 126C170 108 70 108 46 126Z" ' + fill(art.paper) + ' ' + line + '/>';
        back += '<path d="M58 132C90 122 150 122 182 132" fill="none" stroke="' + INK + '" stroke-width="1" opacity=".25"/>';
      }
      back += foliage(art.foliage, rand, oy);
      (art.spikes || []).slice(0, 1 + Math.floor((extra || 0) / 2)).forEach((c, i) => { const p = SPIKE_SLOTS[i % 3]; back += spike(p[0], p[1] + oy, c, rand); });
      if (wrap !== 'box') {
        heads.forEach((h) => { mid += '<path d="M' + h.x + ' ' + h.y + 'Q' + f((h.x + tie[0]) / 2 + (rand() * 10 - 5)) + ' ' + f((h.y + tie[1]) / 2) + ' ' + tie[0] + ' ' + tie[1] + '" fill="none" stroke="' + STEM + '" stroke-width="2.4" stroke-linecap="round"/>'; });
        if (wrap === 'paper') {
          for (let i = -3; i <= 3; i++) mid += '<path d="M' + tie[0] + ' ' + tie[1] + 'L' + (tie[0] + i * 4) + ' 262" stroke="' + STEM + '" stroke-width="2.4" stroke-linecap="round"/>';
        }
      }
      if (wrap === 'box') {
        mid += '<ellipse cx="120" cy="' + (176 + 0) + '" rx="80" ry="17" fill="' + INK + '" opacity=".9"/>';
      }
      heads.sort((a, b) => a.y - b.y).forEach((h) => { mid += '<g transform="rotate(' + f(rand() * 24 - 12) + ' ' + h.x + ' ' + h.y + ')">' + HEAD[h.kind](h.x, h.y, h.r, h.c) + '</g>'; });
      if (wrap === 'paper') {
        front += '<path d="M64 160 120 270 176 160C150 178 90 178 64 160Z" ' + fill(art.paper) + ' ' + line + '/>';
        front += '<path d="M64 160C82 188 102 214 120 270" fill="none" stroke="' + INK + '" stroke-width="1.2" opacity=".3"/>';
        front += '<path d="M120 214c-10-12-30-14-30-4s20 10 30 4c10-12 30-14 30-4s-20 10-30 4Z" fill="' + art.ribbon + '" ' + line + '/>';
        front += '<path d="M118 216l-12 26M122 216l12 26" stroke="' + art.ribbon + '" stroke-width="4" stroke-linecap="round"/><circle cx="120" cy="214" r="4.5" fill="' + art.ribbon + '" ' + line + '/>';
      } else if (wrap === 'box') {
        front += '<path d="M40 176v70a80 17 0 0 0 160 0v-70a80 17 0 0 1-160 0Z" fill="' + art.box + '" ' + line + '/>';
        front += '<path d="M40 210a80 17 0 0 0 160 0v14a80 17 0 0 1-160 0Z" fill="' + art.band + '"/>';
        front += '<path d="M62 192c10 4 22 6 34 7" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".35" fill="none"/>';
      } else if (wrap === 'jug') {
        front += '<path d="M176 196c26-4 30 34 2 46" fill="none" stroke="' + INK + '" stroke-width="9" stroke-linecap="round"/><path d="M176 196c26-4 30 34 2 46" fill="none" stroke="' + art.jug + '" stroke-width="5" stroke-linecap="round"/>';
        front += '<path d="M70 188C60 222 64 254 84 266h72c20-12 24-44 14-78Z" fill="' + art.jug + '" ' + line + '/>';
        front += '<path d="M64 186h112" stroke="' + art.rim + '" stroke-width="6" stroke-linecap="round"/><path d="M58 186l-8-6" stroke="' + art.rim + '" stroke-width="5" stroke-linecap="round"/>';
        front += '<path d="M86 210c-4 16-2 32 6 42" stroke="' + INK + '" stroke-width="1.4" opacity=".25" fill="none" stroke-linecap="round"/>';
      }
      return '<svg viewBox="0 0 240 280" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + back + mid + front + '</svg>';
    }
    return { bouquet: bouquet };
  })();
  /* ART:END */
  function bouquetArt(p, size) {
    return Art.bouquet(p.art, SIZES[size || 'classic'].extra, p.id);
  }

  /* ------------------------------------------------------------------
   * 8. Basket. { lines: [{ id, size, date, message, from, qty }], postcode }
   *    Everything is checked on every read: unknown bouquets and sizes are
   *    dropped, dates we can't deliver on move to the earliest delivery day,
   *    quantities become whole numbers from 1 to DELIVERY.maxQty, identical
   *    lines merge. Prices always come from PRODUCTS and SIZES.
   * ------------------------------------------------------------------ */
  const movedLines = [];
  function lineKey(l) {
    let h = 0;
    const s = l.message + '\u0001' + l.from;
    for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) | 0;
    return l.id + '~' + l.size + '~' + l.date + '~' + (h >>> 0).toString(36);
  }
  function normalizeBasket(raw) {
    const out = { lines: [], postcode: '' };
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    const fallback = earliestDelivery();
    const byKey = Object.create(null);
    (Array.isArray(raw.lines) ? raw.lines : []).forEach((l) => {
      if (!l || typeof l !== 'object') return;
      const p = findProduct(l.id);
      if (!p || !has(SIZES, l.size)) return;
      const qty = typeof l.qty === 'number' && isFinite(l.qty) ? Math.min(DELIVERY.maxQty, Math.max(1, Math.floor(l.qty))) : 1;
      let date = l.date;
      if (!deliveryState(date).ok) {
        if (!fallback) return;
        if (isIsoDate(date)) movedLines.push({ name: p.name, from: date, to: fallback });
        date = fallback;
      }
      const line = { id: p.id, size: l.size, date: date, message: cleanText(l.message, DELIVERY.messageMax), from: cleanText(l.from, DELIVERY.fromMax), qty: qty };
      const k = lineKey(line);
      if (byKey[k]) byKey[k].qty = Math.min(DELIVERY.maxQty, byKey[k].qty + qty);
      else { byKey[k] = line; out.lines.push(line); }
    });
    out.postcode = typeof raw.postcode === 'string' && checkPostcode(raw.postcode).valid ? checkPostcode(raw.postcode).postcode : '';
    return out;
  }
  const basketListeners = [];
  function loadBasket() {
    const rawText = safeStorage.getItem(KEYS.basket);
    const b = normalizeBasket(read(KEYS.basket));
    // Heal whatever was stored: write the repaired basket back.
    if (rawText !== null && rawText !== JSON.stringify(b)) write(KEYS.basket, b);
    return b;
  }
  let basket = loadBasket();
  function saveBasket(next, silent) {
    basket = normalizeBasket(next);
    write(KEYS.basket, basket);
    if (!silent) basketListeners.forEach((fn) => fn(basket));
  }
  window.addEventListener('storage', (e) => {
    if (e.key === KEYS.basket) { basket = loadBasket(); basketListeners.forEach((fn) => fn(basket)); }
  });
  const basketCount = () => basket.lines.reduce((n, l) => n + l.qty, 0);
  const lineTotal = (l) => unitPrice(findProduct(l.id), l.size) * l.qty;
  const subtotal = () => round2(basket.lines.reduce((t, l) => t + lineTotal(l), 0));
  const deliveryDays = () => basket.lines.map((l) => l.date).filter((d, i, a) => a.indexOf(d) === i).sort();
  // Delivery charge: the zone's fee for each delivery day. null when the ZIP code isn't known.
  function deliveryCharge(postcode) {
    const res = checkPostcode(postcode);
    if (!res.zone) return null;
    return { zone: res.zone, days: deliveryDays().length, fee: res.zone.fee * deliveryDays().length };
  }
  // Lines that can't go to this ZIP code's zone on their date (no same-day farther out).
  function zoneConflicts(postcode) {
    const res = checkPostcode(postcode);
    if (!res.zone || res.zone.sameDay) return [];
    const today = shopNow().date;
    return basket.lines.filter((l) => l.date === today);
  }
  function addToBasket(line) {
    saveBasket({ lines: basket.lines.concat([line]), postcode: basket.postcode });
  }

  // Gift message drafts on the product page: { [productId]: { message, from } }.
  function readDrafts() {
    const raw = read(KEYS.drafts);
    const out = Object.create(null);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    Object.keys(raw).forEach((id) => {
      if (!findProduct(id) || !raw[id] || typeof raw[id] !== 'object') return;
      const message = cleanText(raw[id].message, DELIVERY.messageMax), from = cleanText(raw[id].from, DELIVERY.fromMax);
      if (message || from) out[id] = { message: message, from: from };
    });
    return out;
  }
  function saveDraft(id, draft) {
    const all = readDrafts();
    if (draft && (draft.message || draft.from)) all[id] = draft; else delete all[id];
    write(KEYS.drafts, Object.keys(all).length ? all : null);
  }

  /* ------------------------------------------------------------------
   * 9. Header, mobile menu, reveal, season, countdown, toast
   * ------------------------------------------------------------------ */
  const header = $('#site-header');
  const menuBtn = $('#menu-toggle');
  const mobileMenu = $('#mobile-menu');
  function setMenu(open) {
    if (!menuBtn || !mobileMenu) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.hidden = !open;
    $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
    $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }
  const onScroll = () => header && header.classList.toggle('shadow-[0_12px_30px_-26px_rgb(20_32_26/.7)]', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const revealObserver = ('IntersectionObserver' in window && !reduceMotion)
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          // Reveal this element and everything above it, so fast jumps never leave gaps.
          const top = en.target.getBoundingClientRect().top;
          $$('.reveal:not(.is-visible)').forEach((el) => {
            if (el.getBoundingClientRect().top <= top) { el.classList.add('is-visible'); revealObserver.unobserve(el); }
          });
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 })
    : null;
  function reveal(root) {
    $$('.reveal:not(.is-visible)', root).forEach((el) => {
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add('is-visible');
    });
  }

  // Season: colors via <html data-season>, words via [data-season-name] and [data-season-flowers].
  function renderSeason() {
    const id = seasonId(shopNow().month);
    document.documentElement.setAttribute('data-season', id);
    $$('[data-season-name]').forEach((el) => { el.textContent = SEASONS[id].label; });
    $$('[data-season-flowers]').forEach((el) => {
      el.innerHTML = SEASONS[id].flowers.map((n) => '<li class="rounded-full bg-white/85 px-3 py-1 text-sm font-medium text-ink ring-1 ring-ink/10">' + escapeHtml(n) + '</li>').join('');
    });
  }

  // Delivery band, countdowns and studio status. Runs every second.
  function renderClock() {
    const msg = deliveryMessage();
    $$('[data-delivery-band]').forEach((el) => {
      el.textContent = msg.sameDay ? msg.text + ' in Macon' : (msg.why ? msg.why + ' ' : '') + msg.text;
    });
    $$('[data-countdown]').forEach((el) => {
      const big = $('[data-countdown-digits]', el), label = $('[data-countdown-label]', el), note = $('[data-countdown-note]', el), sr = $('[data-countdown-sr]', el);
      el.setAttribute('data-state', msg.sameDay ? 'open' : 'next');
      if (msg.sameDay) {
        const h = Math.floor(msg.left / 3600), m = Math.floor(msg.left / 60) % 60;
        big.textContent = msg.digits;
        big.setAttribute('aria-hidden', 'true');
        sr.textContent = (h ? plural(h, 'hour', 'hours') + ' ' : '') + plural(m, 'minute', 'minutes');
        label.textContent = 'left to order for delivery today';
        note.textContent = 'Order by ' + clock(toMins(DELIVERY.cutoff)) + ', Monday through Saturday, and we deliver the same afternoon.';
      } else {
        big.textContent = msg.next ? dateLabel(msg.next, true) : 'Soon';
        big.removeAttribute('aria-hidden');
        sr.textContent = '';
        label.textContent = msg.next ? 'is the next delivery day' : '';
        note.textContent = (msg.why ? msg.why + ' ' : '') + (msg.next ? 'Order any time for ' + fmtDate(msg.next) + '.' : '');
      }
    });
    const st = studioStatus();
    $$('[data-open-status]').forEach((el) => {
      const html = '<span class="dot ' + (st.open ? 'text-[#2f9a5f]' : 'text-marigold') + '" aria-hidden="true"></span>' + escapeHtml(st.text);
      if (el.innerHTML !== html) el.innerHTML = html;
    });
  }

  function renderHours() {
    const today = shopNow().day;
    $$('[data-hours-list]').forEach((el) => {
      el.innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => '<li class="flex items-center justify-between gap-4 py-2' + (d === today ? ' font-semibold' : '') + '">' +
        '<span>' + DAY_NAMES[d] + (d === today ? ' <span class="ml-1 rounded-full bg-mint px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-fern-deep">Today</span>' : '') + '</span>' +
        '<span class="tabular-nums' + (HOURS[d] ? '' : ' text-muted') + '">' + (HOURS[d] ? clock(toMins(HOURS[d][0])) + '–' + clock(toMins(HOURS[d][1])) : 'Closed') + '</span></li>').join('');
    });
  }

  // Basket count in the header.
  function renderBasketLinks() {
    const n = basketCount();
    $$('[data-basket-link]').forEach((a) => { a.setAttribute('aria-label', 'Cart, ' + plural(n, 'item', 'items')); });
    $$('[data-basket-count]').forEach((el) => { el.textContent = n; el.hidden = n === 0; });
  }
  function popBadge() {
    $$('[data-basket-count]').forEach((el) => { el.classList.remove('badge-pop'); void el.offsetWidth; el.classList.add('badge-pop'); });
  }

  const toastEl = $('#toast');
  let toastTimer = null;
  function toast(html) {
    if (!toastEl) return;
    $('[data-toast-text]', toastEl).innerHTML = html;
    toastEl.hidden = false;
    void toastEl.offsetWidth;
    toastEl.setAttribute('data-show', 'true');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 5200);
  }
  function hideToast() {
    if (!toastEl) return;
    toastEl.setAttribute('data-show', 'false');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, reduceMotion ? 0 : 260);
  }
  if (toastEl) $('[data-toast-close]', toastEl).addEventListener('click', hideToast);

  /* ------------------------------------------------------------------
   * 10. Product cards
   * ------------------------------------------------------------------ */
  function productCard(p, opts) {
    const o = opts || {};
    const tag = o.headingTag || 'h3';
    return '<article class="group relative flex flex-col">' +
      '<div class="art relative aspect-[6/7] overflow-hidden rounded-xl ' + p.tint + '">' +
        '<div class="lift absolute inset-x-[8%] bottom-0 top-[6%]">' + bouquetArt(p) + '</div>' +
        (o.rank ? '<span class="absolute left-4 top-3 font-display text-[3.2rem] font-semibold italic leading-none text-ink/85" aria-hidden="true">' + pad(o.rank) + '</span>' : '') +
        (p.bestseller && !o.rank ? '<span class="badge absolute left-3 top-3">Bestseller</span>' : '') +
      '</div>' +
      '<div class="mt-4 flex items-start justify-between gap-3">' +
        '<' + tag + ' class="font-display text-[1.45rem] font-semibold leading-tight tracking-[-0.01em]"><a href="product.html?id=' + p.id + '" class="after:absolute after:inset-0 focus:outline-none group-focus-within:underline group-hover:underline decoration-2 underline-offset-4">' + escapeHtml(p.name) + '</a></' + tag + '>' +
        '<p class="mt-1 shrink-0 text-[15px] font-semibold tabular-nums"><span class="sr-only">From </span>' + price(p.price) + '</p>' +
      '</div>' +
      '<p class="mt-1.5 text-[15px] leading-relaxed text-muted">' + escapeHtml(p.blurb) + '</p>' +
      '<p class="mt-3 flex flex-wrap items-center gap-1.5" aria-label="Colors: ' + p.colours.map((c) => COLOURS[c].label).join(', ') + '">' +
        p.colours.map((c) => '<span class="swatch-dot" style="background:' + COLOURS[c].swatch + '" title="' + COLOURS[c].label + '"></span>').join('') + '</p>' +
    '</article>';
  }

  /* ------------------------------------------------------------------
   * 11. Home and shop
   * ------------------------------------------------------------------ */
  function initHome() {
    const grid = $('#bestsellers');
    if (grid) {
      const best = PRODUCTS.filter((p) => p.bestseller).sort((a, b) => a.bestseller - b.bestseller);
      grid.innerHTML = best.map((p, i) => '<li>' + productCard(p, { rank: i + 1 }) + '</li>').join('');
    }
    $$('[data-occasion-count]').forEach((el) => {
      const id = el.getAttribute('data-occasion-count');
      if (has(OCCASIONS, id)) el.textContent = plural(PRODUCTS.filter((p) => p.occasions.indexOf(id) !== -1).length, 'bouquet', 'bouquets');
    });
  }

  function initShop() {
    const grid = $('#shop-grid');
    if (!grid) return;
    const params = urlParams();
    const state = {
      occasion: has(OCCASIONS, params.get('occasion')) ? params.get('occasion') : '',
      colour: has(COLOURS, params.get('colour')) ? params.get('colour') : '',
      price: has(PRICE_BANDS, params.get('price')) ? params.get('price') : '',
      sort: has(SORTS, params.get('sort')) ? params.get('sort') : 'featured'
    };
    const occBox = $('#filter-occasion'), colBox = $('#filter-colour'), priceBox = $('#filter-price');
    const sortSel = $('#shop-sort'), count = $('#shop-count'), empty = $('#shop-empty');
    occBox.innerHTML = '<button type="button" class="pill" data-filter="occasion" data-value="">All occasions</button>' +
      Object.keys(OCCASIONS).map((k) => '<button type="button" class="pill" data-filter="occasion" data-value="' + k + '">' + OCCASIONS[k] + '</button>').join('');
    colBox.innerHTML = '<button type="button" class="pill" data-filter="colour" data-value="">Any color</button>' +
      Object.keys(COLOURS).map((k) => '<button type="button" class="pill" data-filter="colour" data-value="' + k + '"><span class="swatch-dot" style="background:' + COLOURS[k].swatch + '" aria-hidden="true"></span>' + COLOURS[k].label + '</button>').join('');
    priceBox.innerHTML = '<button type="button" class="pill" data-filter="price" data-value="">Any price</button>' +
      Object.keys(PRICE_BANDS).map((k) => '<button type="button" class="pill" data-filter="price" data-value="' + k + '">' + PRICE_BANDS[k].label + '</button>').join('');
    sortSel.innerHTML = Object.keys(SORTS).map((k) => '<option value="' + k + '">' + SORTS[k] + '</option>').join('');

    function matches(p) {
      if (state.occasion && p.occasions.indexOf(state.occasion) === -1) return false;
      if (state.colour && p.colours.indexOf(state.colour) === -1) return false;
      if (state.price) { const b = PRICE_BANDS[state.price]; if (p.price < b.min || p.price >= b.max) return false; }
      return true;
    }
    function render() {
      $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(state[b.getAttribute('data-filter')] === b.getAttribute('data-value'))));
      sortSel.value = state.sort;
      let list = PRODUCTS.filter(matches);
      if (state.sort === 'price-asc') list = list.slice().sort((a, b) => a.price - b.price);
      if (state.sort === 'price-desc') list = list.slice().sort((a, b) => b.price - a.price);
      if (state.sort === 'name') list = list.slice().sort((a, b) => a.name.replace(/^The /, '').localeCompare(b.name.replace(/^The /, ''), LOCALE));
      grid.innerHTML = list.map((p) => '<li>' + productCard(p, { headingTag: 'h2' }) + '</li>').join('');
      const active = [state.occasion && OCCASIONS[state.occasion].toLowerCase(), state.colour && COLOURS[state.colour].label.toLowerCase(), state.price && PRICE_BANDS[state.price].label.toLowerCase()].filter(Boolean);
      count.textContent = plural(list.length, 'bouquet', 'bouquets') + (active.length ? ' · ' + active.join(', ') : '');
      empty.hidden = list.length > 0;
      $('#shop-reset').hidden = !(state.occasion || state.colour || state.price || state.sort !== 'featured');
      const q = new URLSearchParams();
      ['occasion', 'colour', 'price'].forEach((k) => { if (state[k]) q.set(k, state[k]); });
      if (state.sort !== 'featured') q.set('sort', state.sort);
      const qs = q.toString();
      try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash); } catch (e) { /* file:// in some browsers */ }
    }
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]');
      if (b) {
        const k = b.getAttribute('data-filter'), v = b.getAttribute('data-value');
        state[k] = state[k] === v ? '' : v;
        render();
      }
      if (e.target.closest('[data-shop-reset]')) {
        state.occasion = state.colour = state.price = '';
        state.sort = 'featured';
        render();
        const first = $('[data-filter="occasion"]');
        if (e.target.closest('#shop-reset') && first) first.focus();
      }
    });
    sortSel.addEventListener('change', () => { if (has(SORTS, sortSel.value)) { state.sort = sortSel.value; render(); } });
    render();
  }

  /* ------------------------------------------------------------------
   * 12. Product page: size, delivery date calendar, gift message
   * ------------------------------------------------------------------ */
  function initProduct() {
    const root = $('#product');
    if (!root) return;
    const params = urlParams();
    const p = findProduct(params.get('id')) || null;
    if (!p) {
      document.title = 'Bouquet not found — Hollyhock, florist in Macon';
      root.innerHTML = '<section class="container-x py-20 text-center"><p class="kicker">Shop</p>' +
        '<h1 class="display mt-4 text-[2.8rem] sm:text-[3.8rem]">We couldn’t find that bouquet.</h1>' +
        '<p class="mx-auto mt-4 max-w-lg text-lg text-muted">It may have gone out of season. Everything we have today is in the shop.</p>' +
        '<a href="shop.html" class="btn-primary mt-8">See all bouquets</a></section>';
      return;
    }
    document.title = p.name + ' — Hollyhock, florist in Macon';
    const meta = $('meta[name="description"]');
    if (meta) meta.setAttribute('content', p.blurb);
    const state = { size: has(SIZES, params.get('size')) ? params.get('size') : 'classic', date: earliestDelivery() };
    const draft = readDrafts()[p.id] || { message: '', from: '' };

    $('[data-p-name]').textContent = p.name;
    $('[data-p-crumb]').textContent = p.name;
    $('[data-p-blurb]').textContent = p.blurb;
    $('[data-p-details]').textContent = p.details;
    $('[data-p-occasions]').innerHTML = p.occasions.map((o) => '<li><a class="pill" href="shop.html?occasion=' + o + '">' + OCCASIONS[o] + '</a></li>').join('');
    $('[data-p-colours]').textContent = listText(p.colours.map((c) => COLOURS[c].label.toLowerCase()));
    const stage = $('[data-p-art]');
    stage.className = stage.className.replace(/\btint-\S+/g, '') + ' ' + p.tint;

    const sizes = $('#p-sizes');
    sizes.innerHTML = SIZE_ORDER.map((k) => '<label class="option min-w-0 flex-col gap-0.5 p-3 sm:p-4">' +
      '<input type="radio" name="size" value="' + k + '" class="sr-only">' +
      '<span class="font-display text-[1.1rem] font-semibold sm:text-xl">' + SIZES[k].label + '</span>' +
      '<span class="text-sm text-muted">' + SIZES[k].stems + '</span>' +
      '<span class="mt-2 font-semibold tabular-nums">' + price(unitPrice(p, k)) + '</span></label>').join('');

    const message = $('#p-message'), from = $('#p-from'), counter = $('#p-message-count');
    message.maxLength = DELIVERY.messageMax;
    from.maxLength = DELIVERY.fromMax;
    message.value = draft.message;
    from.value = draft.from;
    function renderCounter() {
      const left = DELIVERY.messageMax - message.value.length;
      counter.textContent = plural(left, 'character', 'characters') + ' left';
      counter.classList.toggle('text-peony-deep', left <= 20);
    }
    function saveDraftNow() { saveDraft(p.id, { message: cleanText(message.value, DELIVERY.messageMax), from: cleanText(from.value, DELIVERY.fromMax) }); }
    message.addEventListener('input', () => { renderCounter(); saveDraftNow(); renderPreview(); });
    from.addEventListener('input', () => { saveDraftNow(); renderPreview(); });
    function renderPreview() {
      $('[data-card-message]').textContent = message.value.trim() || 'Your message, handwritten by us on a Hollyhock card.';
      $('[data-card-message]').classList.toggle('text-muted', !message.value.trim());
      $('[data-card-from]').textContent = from.value.trim() ? '— ' + from.value.trim() : '';
    }

    // Calendar: today to today + DELIVERY.daysAhead, Monday-first, one tab stop (roving tabindex).
    const cal = $('#p-calendar');
    function renderCalendar() {
      const today = shopNow().date;
      const lead = (dayOf(today) + 6) % 7;
      let html = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => '<span class="pb-1 text-center text-[12px] font-semibold uppercase tracking-wider text-muted" aria-hidden="true">' + d + '</span>').join('');
      for (let i = 0; i < lead; i++) html += '<span aria-hidden="true"></span>';
      let monthShown = '';
      for (let i = 0; i <= DELIVERY.daysAhead; i++) {
        const d = addDays(today, i);
        const st = deliveryState(d);
        const label = fmtDate(d) + (st.ok ? '' : ', ' + st.text.toLowerCase());
        const month = d.slice(0, 7);
        const showMonth = month !== monthShown && (i === 0 || d.slice(8) === '01');
        monthShown = month;
        html += '<button type="button" class="cal-day" data-date="' + d + '" aria-label="' + escapeHtml(label) + '"' + (st.ok ? '' : ' disabled data-reason="' + st.reason + '" title="' + escapeHtml(st.text) + '"') +
          (d === today ? ' data-today' : '') + ' aria-pressed="' + (d === state.date) + '" tabindex="-1">' +
          (showMonth ? '<span class="absolute left-1 top-0.5 text-[9.5px] font-semibold uppercase not-italic tracking-wide opacity-70">' + fmtDate(d, { weekday: undefined, day: undefined, month: 'short' }) + '</span>' : '') +
          (+d.slice(8)) + '</button>';
      }
      cal.innerHTML = html;
      const focusable = $('.cal-day[aria-pressed="true"]', cal) || $('.cal-day:not(:disabled)', cal);
      if (focusable) focusable.tabIndex = 0;
    }
    cal.addEventListener('click', (e) => {
      const b = e.target.closest('.cal-day');
      if (!b || b.disabled) return;
      state.date = b.getAttribute('data-date');
      render();
      const again = $('.cal-day[data-date="' + state.date + '"]', cal);
      if (again) again.focus();
    });
    cal.addEventListener('keydown', (e) => {
      const b = e.target.closest('.cal-day');
      if (!b) return;
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      const days = $$('.cal-day', cal);
      let i = days.indexOf(b);
      if (e.key === 'Home' || e.key === 'End') {
        e.preventDefault();
        const open = days.filter((x) => !x.disabled);
        const t = e.key === 'Home' ? open[0] : open[open.length - 1];
        if (t) { days.forEach((x) => { x.tabIndex = -1; }); t.tabIndex = 0; t.focus(); }
        return;
      }
      if (!step) return;
      e.preventDefault();
      // Move to the nearest available day in that direction.
      for (i += step; i >= 0 && i < days.length; i += (Math.abs(step) === 7 ? step : Math.sign(step))) {
        if (!days[i].disabled) { days.forEach((x) => { x.tabIndex = -1; }); days[i].tabIndex = 0; days[i].focus(); return; }
        if (Math.abs(step) === 7) break;
      }
      if (Math.abs(step) === 7) {
        // A week up or down landed on a closed day: take the next open day after it.
        for (let j = i + Math.sign(step); j >= 0 && j < days.length; j += Math.sign(step)) {
          if (!days[j].disabled) { days.forEach((x) => { x.tabIndex = -1; }); days[j].tabIndex = 0; days[j].focus(); return; }
        }
      }
    });

    function render() {
      $$('input[name="size"]', sizes).forEach((r) => { r.checked = r.value === state.size; });
      $('[data-p-price]').textContent = price(unitPrice(p, state.size));
      $('[data-p-art]').innerHTML = '<div class="sway absolute inset-x-[10%] bottom-[2%] top-[4%]">' + bouquetArt(p, state.size) + '</div>';
      $('[data-p-art]').setAttribute('aria-label', 'Drawing of the ' + SIZES[state.size].label.toLowerCase() + ' ' + p.name + ' bouquet');
      if (state.date && !deliveryState(state.date).ok) state.date = earliestDelivery();
      renderCalendar();
      $('[data-p-date]').textContent = state.date ? dateLabel(state.date) : 'No delivery days available';
      $('#p-add').disabled = !state.date;
      try {
        const q = new URLSearchParams({ id: p.id });
        if (state.size !== 'classic') q.set('size', state.size);
        history.replaceState(null, '', location.pathname + '?' + q.toString() + location.hash);
      } catch (e) { /* file:// in some browsers */ }
    }
    sizes.addEventListener('change', (e) => { if (has(SIZES, e.target.value)) { state.size = e.target.value; render(); } });

    $('#p-form').addEventListener('submit', (e) => {
      e.preventDefault();
      if (!state.date || !deliveryState(state.date).ok) { render(); return; }
      addToBasket({ id: p.id, size: state.size, date: state.date, message: cleanText(message.value.trim(), DELIVERY.messageMax), from: cleanText(from.value.trim(), DELIVERY.fromMax), qty: 1 });
      saveDraft(p.id, null);
      message.value = ''; from.value = '';
      renderCounter(); renderPreview();
      popBadge();
      toast('<strong>' + escapeHtml(SIZES[state.size].label + ' ' + p.name) + '</strong> added for ' + escapeHtml(inSentence(state.date, true)) + '. <a href="basket.html" class="font-semibold underline underline-offset-4">View cart</a>');
    });

    $('#related').innerHTML = PRODUCTS.filter((x) => x.id !== p.id && x.occasions.some((o) => p.occasions.indexOf(o) !== -1)).slice(0, 4)
      .map((x) => '<li>' + productCard(x) + '</li>').join('');

    renderCounter(); renderPreview(); render();
    // Keep the calendar right when the cut-off passes while the page is open.
    let lastState = deliveryState(shopNow().date).ok;
    setInterval(() => {
      const ok = deliveryState(shopNow().date).ok;
      if (ok !== lastState) { lastState = ok; render(); }
    }, 15000);
  }

  /* ------------------------------------------------------------------
   * 13. Basket page
   * ------------------------------------------------------------------ */
  // Re-render `root` from `html` in place: nodes that are still there are updated rather than
  // replaced, so after − or + the focused button keeps focus and the quantity's live region
  // announces the new number. A basket line (data-line) is only reused for the same line.
  function patch(root, html) {
    const tpl = document.createElement('template');
    tpl.innerHTML = html;
    morph(root, tpl.content);
  }
  function morph(from, to) {
    let i, a, b;
    if (from.nodeType === 1 && to.nodeType === 1) {
      for (i = from.attributes.length - 1; i >= 0; i--) {
        if (!to.hasAttribute(from.attributes[i].name)) from.removeAttribute(from.attributes[i].name);
      }
      for (i = 0; i < to.attributes.length; i++) {
        b = to.attributes[i];
        if (from.getAttribute(b.name) !== b.value) from.setAttribute(b.name, b.value);
      }
      if (from.tagName === 'SELECT' && from.value !== to.getAttribute('data-value')) from.value = to.getAttribute('data-value') || from.value;
    }
    const kids = from.childNodes, next = to.childNodes;
    for (i = 0; i < next.length; i++) {
      a = kids[i]; b = next[i];
      if (!a) from.appendChild(b.cloneNode(true));
      else if (a.nodeType !== b.nodeType || a.nodeName !== b.nodeName ||
        (a.nodeType === 1 && a.getAttribute('data-line') !== b.getAttribute('data-line'))) from.replaceChild(b.cloneNode(true), a);
      else if (a.nodeType === 1 && a.tagName === 'TEXTAREA') { if (a !== document.activeElement && a.value !== b.textContent) a.value = b.textContent; }
      else if (a.nodeType === 1) morph(a, b);
      else if (a.nodeValue !== b.nodeValue) a.nodeValue = b.nodeValue;
    }
    while (kids.length > next.length) from.removeChild(from.lastChild);
  }

  // Keyboard focus after a line's −, + or Remove: the same control on the same line; if the line
  // is gone, the same control on the next line, else on the previous line; if the basket is now
  // empty, the empty basket's "Shop" link.
  function keepLineFocus(button, change) {
    const scope = () => $('#basket-lines');
    const line = button.closest('[data-line]');
    if (!line) return change();
    const keys = $$('[data-line]', scope()).map((li) => li.getAttribute('data-line'));
    const at = keys.indexOf(line.getAttribute('data-line'));
    const control = button.hasAttribute('data-remove') ? '[data-remove]' : '[data-step="' + button.getAttribute('data-step') + '"]';
    change();
    const rows = $$('[data-line]', scope());
    const row = [keys[at], keys[at + 1], keys[at - 1]].reduce((found, key) => found || rows.filter((li) => key && li.getAttribute('data-line') === key)[0], null);
    let target = row ? $(control, row) : $('#basket-empty a');
    if (target && target.disabled) target = $('[data-step]:not(:disabled)', row) || $('[data-remove]', row);
    if (target && target !== document.activeElement) target.focus();
  }

  function initBasket() {
    const lines = $('#basket-lines');
    if (!lines) return;
    const emptyBox = $('#basket-empty'), filled = $('#basket-filled'), summary = $('#basket-summary');
    const pcForm = $('#postcode-form'), pcInput = $('#postcode'), pcResult = $('#postcode-result');
    if (basket.postcode) pcInput.value = basket.postcode;

    function lineHtml(l, i) {
      const p = findProduct(l.id);
      const key = lineKey(l);
      const name = SIZES[l.size].label + ' ' + p.name;
      const dates = deliveryDates();
      const idp = 'l' + i;
      return '<li class="grid gap-5 py-7 sm:grid-cols-[9rem_1fr]" data-line="' + escapeHtml(key) + '">' +
        '<a href="product.html?id=' + p.id + '" class="art relative block aspect-[6/7] w-28 overflow-hidden rounded-lg sm:w-36 ' + p.tint + '" tabindex="-1" aria-hidden="true"><span class="absolute inset-x-[8%] bottom-0 top-[6%]">' + bouquetArt(p, l.size) + '</span></a>' +
        '<div class="min-w-0">' +
          '<div class="flex flex-wrap items-start justify-between gap-x-4 gap-y-1">' +
            '<h2 class="font-display text-2xl font-semibold leading-tight"><a href="product.html?id=' + p.id + (l.size !== 'classic' ? '&amp;size=' + l.size : '') + '" class="hover:underline decoration-2 underline-offset-4">' + escapeHtml(p.name) + '</a></h2>' +
            '<p class="font-semibold tabular-nums">' + price(lineTotal(l)) + '</p>' +
          '</div>' +
          '<p class="mt-0.5 text-[15px] text-muted">' + SIZES[l.size].label + ' · ' + price(unitPrice(p, l.size)) + ' each</p>' +
          '<div class="mt-4 grid gap-4 md:grid-cols-2">' +
            '<div><label class="field-label text-sm" for="' + idp + '-date">Delivery day</label>' +
              '<select id="' + idp + '-date" class="field py-2.5" data-line-date="' + i + '" data-value="' + l.date + '">' +
                dates.map((d) => '<option value="' + d + '"' + (d === l.date ? ' selected' : '') + '>' + escapeHtml(dateLabel(d)) + '</option>').join('') +
              '</select></div>' +
            '<div><span class="field-label text-sm" id="' + idp + '-qty-label">Quantity</span>' +
              '<div class="stepper" role="group" aria-labelledby="' + idp + '-qty-label ' + idp + '-name">' +
                '<button type="button" data-step="-1" data-index="' + i + '" aria-label="One fewer"' + (l.qty <= 1 ? ' disabled' : '') + '>−</button>' +
                '<span class="min-w-8 text-center font-semibold tabular-nums" aria-live="polite">' + l.qty + '</span>' +
                '<button type="button" data-step="1" data-index="' + i + '" aria-label="One more"' + (l.qty >= DELIVERY.maxQty ? ' disabled' : '') + '>+</button>' +
              '</div><span id="' + idp + '-name" class="sr-only">' + escapeHtml(name) + '</span></div>' +
          '</div>' +
          '<details class="mt-4 rounded-lg bg-snow px-4 py-3"' + (l.message ? ' open' : '') + '>' +
            '<summary class="flex items-center justify-between gap-3 text-[15px] font-semibold">Gift card message<span class="text-sm font-normal text-muted">' + (l.message ? 'Edit' : 'Add one, free') + '</span></summary>' +
            '<div class="mt-3"><label class="sr-only" for="' + idp + '-msg">Gift card message for ' + escapeHtml(name) + '</label>' +
              '<textarea id="' + idp + '-msg" rows="3" maxlength="' + DELIVERY.messageMax + '" class="field" data-line-msg="' + i + '" aria-describedby="' + idp + '-msg-count">' + escapeHtml(l.message) + '</textarea>' +
              '<p id="' + idp + '-msg-count" class="hint" data-msg-count="' + i + '">' + plural(DELIVERY.messageMax - l.message.length, 'character', 'characters') + ' left</p>' +
              '<label class="field-label mt-3 text-sm" for="' + idp + '-from">From</label>' +
              '<input id="' + idp + '-from" class="field py-2.5" maxlength="' + DELIVERY.fromMax + '" data-line-from="' + i + '" value="' + escapeHtml(l.from) + '" autocomplete="name">' +
            '</div></details>' +
          '<button type="button" data-remove="' + i + '" class="mt-4 text-sm font-semibold text-muted underline decoration-ink/25 underline-offset-4 hover:text-peony-deep">Remove<span class="sr-only"> ' + escapeHtml(name) + '</span></button>' +
        '</div></li>';
    }

    function renderPostcode() {
      const res = checkPostcode(basket.postcode);
      if (!basket.postcode) { pcResult.innerHTML = ''; return; }
      const conflicts = zoneConflicts(basket.postcode);
      pcResult.innerHTML = res.zone
        ? '<p class="flex items-start gap-2 text-fern-deep"><svg viewBox="0 0 24 24" class="mt-0.5 size-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 4 4 10-10"/></svg><span>We deliver to <strong>' + escapeHtml(res.postcode) + '</strong> (' + escapeHtml(res.zone.label) + '): ' + price(res.zone.fee) + ' per delivery day' + (res.zone.sameDay ? ', same day if you order by ' + clock(toMins(DELIVERY.cutoff)) : ', from the next delivery day') + '.</span></p>' +
          (conflicts.length ? '<p class="mt-2 text-peony-deep">We can’t deliver to ' + escapeHtml(res.district) + ' today. Choose another day for ' + escapeHtml(listText(conflicts.map((l) => findProduct(l.id).name))) + '.</p>' : '')
        : '';
    }

    function render() {
      const n = basketCount();
      $$('[data-basket-heading-count]').forEach((el) => { el.textContent = n ? '(' + plural(n, 'bouquet', 'bouquets') + ')' : ''; });
      emptyBox.hidden = n > 0;
      filled.hidden = n === 0;
      if (!n) { lines.innerHTML = ''; renderLastOrder(); return; }
      patch(lines, basket.lines.map(lineHtml).join(''));
      const notice = $('#basket-moved');
      if (movedLines.length) {
        notice.hidden = false;
        notice.textContent = 'We moved ' + listText(movedLines.map((m) => m.name)) + ' to ' + inSentence(movedLines[0].to) + ', because the day you chose is no longer available. You can pick another day below.';
      }
      renderPostcode();
      const charge = deliveryCharge(basket.postcode);
      const sub = subtotal();
      const conflicts = zoneConflicts(basket.postcode);
      const days = deliveryDays();
      summary.innerHTML =
        '<div class="flex justify-between gap-4"><dt>Flowers</dt><dd class="tabular-nums">' + price(sub) + '</dd></div>' +
        '<div class="flex justify-between gap-4"><dt>Delivery' + (charge ? ' <span class="block text-sm text-muted">' + plural(charge.days, 'delivery day', 'delivery days') + ' × ' + price(charge.zone.fee) + '</span>' : ' <span class="block text-sm text-muted">' + plural(days.length, 'delivery day', 'delivery days') + ', add your ZIP code</span>') + '</dt><dd class="tabular-nums">' + (charge ? price(charge.fee) : '–') + '</dd></div>' +
        '<div class="flex justify-between gap-4 border-t border-ink/15 pt-3 text-lg font-semibold"><dt>Total before tax</dt><dd class="tabular-nums">' + price(sub + (charge ? charge.fee : 0)) + '</dd></div>';
      const go = $('#basket-checkout');
      const ready = !!charge && !conflicts.length;
      go.setAttribute('aria-disabled', String(!ready));
      $('#basket-checkout-hint').textContent = ready ? '' : !basket.postcode ? 'Check your delivery ZIP code to continue.' : !charge ? 'We can’t deliver to that ZIP code yet.' : 'Choose another delivery day for the flagged bouquet.';
      $('#basket-days').textContent = days.length ? 'Delivering ' + listText(days.map((d) => dateLabel(d, true))) : '';
    }

    function renderLastOrder() {
      const box = $('#basket-last');
      const order = readLastOrder();
      box.hidden = !order;
      if (order) box.innerHTML = '<p class="font-semibold">Your last order: ' + escapeHtml(order.number) + '</p><p class="mt-1 text-muted">' + escapeHtml(order.summary) + '</p>';
    }

    lines.addEventListener('click', (e) => {
      const step = e.target.closest('[data-step]');
      const rm = e.target.closest('[data-remove]');
      if (step && !step.disabled) {
        const i = +step.getAttribute('data-index');
        keepLineFocus(step, () => {
          const next = basket.lines.map((l, j) => (j === i ? Object.assign({}, l, { qty: Math.max(1, Math.min(DELIVERY.maxQty, l.qty + +step.getAttribute('data-step'))) }) : l));
          saveBasket({ lines: next, postcode: basket.postcode });
        });
      }
      if (rm) {
        const i = +rm.getAttribute('data-remove');
        const name = findProduct(basket.lines[i].id).name;
        keepLineFocus(rm, () => saveBasket({ lines: basket.lines.filter((l, j) => j !== i), postcode: basket.postcode }));
        toast(escapeHtml(name) + ' removed from your cart.');
      }
    });
    lines.addEventListener('change', (e) => {
      const sel = e.target.closest('[data-line-date]');
      if (!sel) return;
      const i = +sel.getAttribute('data-line-date');
      if (!deliveryState(sel.value).ok) return;
      saveBasket({ lines: basket.lines.map((l, j) => (j === i ? Object.assign({}, l, { date: sel.value }) : l)), postcode: basket.postcode });
      const again = $$('[data-line-date]', lines).filter((s) => s.value === sel.value)[0];
      if (again && document.activeElement !== again) again.focus();
    });
    // Gift messages save as you type, without re-rendering the field you're typing in.
    lines.addEventListener('input', (e) => {
      const msg = e.target.closest('[data-line-msg]'), fromEl = e.target.closest('[data-line-from]');
      if (!msg && !fromEl) return;
      const i = +(msg || fromEl).getAttribute(msg ? 'data-line-msg' : 'data-line-from');
      const patchLine = msg ? { message: cleanText(msg.value, DELIVERY.messageMax) } : { from: cleanText(fromEl.value, DELIVERY.fromMax) };
      const next = basket.lines.map((l, j) => (j === i ? Object.assign({}, l, patchLine) : l));
      basket = { lines: next, postcode: basket.postcode };
      write(KEYS.basket, basket);
      const li = (msg || fromEl).closest('[data-line]');
      li.setAttribute('data-line', lineKey(next[i]));
      if (msg) $('[data-msg-count="' + i + '"]', lines).textContent = plural(DELIVERY.messageMax - msg.value.length, 'character', 'characters') + ' left';
    });
    // Two lines that now match exactly are merged once you leave the field.
    lines.addEventListener('focusout', (e) => {
      if (e.target.closest('[data-line-msg], [data-line-from]')) {
        const before = basket.lines.length;
        const norm = normalizeBasket(basket);
        if (norm.lines.length !== before) saveBasket(norm);
      }
    });

    pcInput.addEventListener('input', () => { if (pcInput.hasAttribute('aria-invalid')) showError(pcInput, ''); });
    pcForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const res = checkPostcode(pcInput.value);
      if (!pcInput.value.trim()) { showError(pcInput, 'Enter the ZIP code we’re delivering to.'); pcInput.focus(); return; }
      if (!res.valid) { showError(pcInput, 'That doesn’t look like a ZIP code. Try something like 31201.'); pcInput.focus(); return; }
      if (!res.zone) {
        showError(pcInput, 'Sorry, we don’t deliver to ' + res.district + ' yet. We cover Macon, Byron, Dry Branch and Lizella, plus Centerville, Forsyth, Milledgeville and Warner Robins. Call us at ' + SHOP.phone + ' and we’ll suggest a florist nearby.');
        saveBasket({ lines: basket.lines, postcode: '' });
        pcInput.focus();
        return;
      }
      showError(pcInput, '');
      pcInput.value = res.postcode;
      saveBasket({ lines: basket.lines, postcode: res.postcode });
    });
    $('#basket-checkout').addEventListener('click', (e) => {
      if (e.currentTarget.getAttribute('aria-disabled') === 'true') {
        e.preventDefault();
        if (!deliveryCharge(basket.postcode)) pcInput.focus();
      }
    });

    basketListeners.push(render);
    render();
  }

  /* ------------------------------------------------------------------
   * 14. Checkout (demo)
   * ------------------------------------------------------------------ */
  // The last order, checked before use (petal-last-order): { number, placedAt, summary, total }.
  function readLastOrder() {
    const o = read(KEYS.lastOrder);
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    if (typeof o.number !== 'string' || !/^HH-\d{5}$/.test(o.number)) return null;
    if (typeof o.summary !== 'string' || typeof o.total !== 'number' || !isFinite(o.total)) return null;
    return { number: o.number, summary: cleanText(o.summary, 400), total: round2(o.total), placedAt: typeof o.placedAt === 'string' ? o.placedAt.slice(0, 30) : '' };
  }

  function initCheckout() {
    const form = $('#checkout-form');
    if (!form) return;
    const sumBox = $('#checkout-summary');
    const pc = $('#c-postcode');
    if (basket.postcode) pc.value = basket.postcode;
    let placed = false;
    function render() {
      if (placed) return;
      const n = basketCount();
      $('#checkout-empty').hidden = n > 0;
      $('#checkout-main').hidden = n === 0;
      if (!n) {
        const last = readLastOrder();
        $('#checkout-last').hidden = !last;
        if (last) $('#checkout-last').innerHTML = '<p class="font-semibold">Your last order: ' + escapeHtml(last.number) + '</p><p class="mt-1 text-muted">' + escapeHtml(last.summary) + '</p>';
        return;
      }
      const charge = deliveryCharge(pc.value);
      const sub = subtotal();
      sumBox.innerHTML = '<ul class="divide-y divide-line">' + basket.lines.map((l) => {
        const p = findProduct(l.id);
        return '<li class="flex gap-3 py-3"><span class="art relative block h-16 w-14 shrink-0 overflow-hidden rounded-md ' + p.tint + '"><span class="absolute inset-0">' + bouquetArt(p, l.size) + '</span></span>' +
          '<span class="min-w-0 flex-1"><span class="block font-semibold leading-snug">' + (l.qty > 1 ? l.qty + ' × ' : '') + escapeHtml(p.name) + '</span>' +
          '<span class="block text-sm text-muted">' + SIZES[l.size].label + ' · ' + escapeHtml(dateLabel(l.date, true)) + (l.message ? ' · with a card' : '') + '</span></span>' +
          '<span class="shrink-0 tabular-nums">' + price(lineTotal(l)) + '</span></li>';
      }).join('') + '</ul>' +
        '<dl class="mt-3 space-y-2 border-t border-ink/15 pt-3 text-[15px]">' +
          '<div class="flex justify-between gap-4"><dt>Flowers</dt><dd class="tabular-nums">' + price(sub) + '</dd></div>' +
          '<div class="flex justify-between gap-4"><dt>Delivery' + (charge ? ' (' + plural(charge.days, 'day', 'days') + ' × ' + price(charge.zone.fee) + ')' : '') + '</dt><dd class="tabular-nums">' + (charge ? price(charge.fee) : 'Enter ZIP code') + '</dd></div>' +
          '<div class="flex justify-between gap-4 text-lg font-semibold"><dt>Total before tax</dt><dd class="tabular-nums">' + price(sub + (charge ? charge.fee : 0)) + '</dd></div></dl>' +
        '<p class="mt-3 text-sm text-muted">Prices don’t include sales tax, which is added when you pay.</p>';
    }
    pc.addEventListener('input', render);
    pc.addEventListener('change', () => {
      const res = checkPostcode(pc.value);
      if (res.zone) { pc.value = res.postcode; saveBasket({ lines: basket.lines, postcode: res.postcode }, true); }
      render();
    });
    // Card number: groups of four as you type.
    const card = $('#c-card');
    card.addEventListener('input', () => {
      const digits = card.value.replace(/\D/g, '').slice(0, 16);
      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
      if (formatted !== card.value) card.value = formatted;
    });
    const exp = $('#c-expiry');
    exp.addEventListener('input', () => {
      const d = exp.value.replace(/\D/g, '').slice(0, 4);
      const v = d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d;
      if (v !== exp.value && !(exp.value.length < v.length && d.length === 2)) exp.value = v;
    });
    setupValidation(form, () => {
      if (zoneConflicts(pc.value).length) {
        showError(pc, 'Same-day delivery isn’t available to ' + checkPostcode(pc.value).district + '. Change the delivery day in your cart.');
        pc.focus();
        return;
      }
      const charge = deliveryCharge(pc.value);
      const total = round2(subtotal() + charge.fee);
      const number = 'HH-' + String(Math.floor(10000 + Math.random() * 90000));
      const recipient = $('#c-recipient').value.trim();
      const summaryText = plural(basketCount(), 'bouquet', 'bouquets') + ' for ' + recipient + ', ' + listText(deliveryDays().map((d) => fmtDate(d, { weekday: 'short', month: 'short' }))) + ', ' + price(total) + ' before tax';
      // A real shop sends the order and takes payment here, before showing the confirmation.
      write(KEYS.lastOrder, { number: number, placedAt: new Date().toISOString(), summary: summaryText, total: total });
      const days = deliveryDays();
      const box = document.createElement('div');
      box.setAttribute('role', 'status');
      box.setAttribute('tabindex', '-1');
      box.className = 'rounded-xl bg-mint p-6 focus:outline-none sm:p-10';
      box.innerHTML = '<p class="kicker">Order ' + escapeHtml(number) + '</p>' +
        '<h2 class="display mt-3 text-4xl sm:text-5xl">Thank you. We’re on it.</h2>' +
        '<p class="mt-4 max-w-xl text-lg leading-relaxed">' + escapeHtml(plural(basketCount(), 'bouquet', 'bouquets')) + ' for ' + escapeHtml(recipient) + ' at ' + escapeHtml(checkPostcode(pc.value).postcode) + ', delivered ' + escapeHtml(listText(days.map((d) => inSentence(d)))) + '. Total before sales tax ' + price(total) + '.</p>' +
        '<p class="mt-3 text-muted">We’ll email your confirmation to ' + escapeHtml($('#c-email').value.trim()) + '. If anything needs changing, call us or reply to that email with your order number.</p>' +
        '<a href="shop.html" class="btn-primary mt-6">Back to the shop</a>';
      placed = true;
      $('#checkout-main').replaceWith(box);
      box.focus();
      saveBasket({ lines: [], postcode: basket.postcode });
    });
    basketListeners.push(render);
    render();
  }

  /* ------------------------------------------------------------------
   * 15. Subscriptions: plan, size, day, savings maths
   * ------------------------------------------------------------------ */
  function initSubscriptions() {
    const form = $('#sub-form');
    if (!form) return;
    const params = urlParams();
    const state = {
      plan: has(SUBSCRIPTION.plans, params.get('plan')) ? params.get('plan') : 'fortnightly',
      size: has(SUBSCRIPTION.sizes, params.get('size')) ? params.get('size') : 'generous',
      day: 5
    };
    const plans = $('#sub-plans'), sizes = $('#sub-sizes'), daySel = $('#sub-day');
    plans.innerHTML = Object.keys(SUBSCRIPTION.plans).map((k) => {
      const pl = SUBSCRIPTION.plans[k];
      return '<label class="option flex-col gap-1"><input type="radio" name="plan" value="' + k + '" class="sr-only">' +
        '<span class="font-display text-2xl font-semibold">' + pl.label + '</span>' +
        '<span class="text-sm text-muted">' + plural(pl.perYear, 'delivery', 'deliveries') + ' a year</span>' +
        '<span class="mt-2 inline-flex w-fit rounded-full bg-marigold px-2.5 py-1 text-[13px] font-semibold text-ink">Save ' + Math.round(pl.discount * 100) + '%</span></label>';
    }).join('');
    sizes.innerHTML = Object.keys(SUBSCRIPTION.sizes).map((k) => '<label class="option min-w-0 flex-col gap-0.5 p-3 sm:p-4"><input type="radio" name="sub-size" value="' + k + '" class="sr-only">' +
      '<span class="font-display text-[1.1rem] font-semibold sm:text-xl">' + SUBSCRIPTION.sizes[k].label + '</span>' +
      '<span class="text-sm text-muted"><s>' + price(SUBSCRIPTION.sizes[k].price) + '</s> one-off</span></label>').join('');
    daySel.innerHTML = SUBSCRIPTION.days.map((d) => '<option value="' + d + '">' + DAY_NAMES[d] + 's</option>').join('');

    // First delivery: the first chosen weekday at least one full day away.
    function firstDelivery() {
      let d = addDays(shopNow().date, 2);
      for (let i = 0; i < 14; i++, d = addDays(d, 1)) if (dayOf(d) === state.day && !isClosedDate(d)) return d;
      return d;
    }
    function upcoming() {
      const out = [];
      let d = firstDelivery();
      const every = SUBSCRIPTION.plans[state.plan].every;
      for (let i = 0; out.length < SUBSCRIPTION.preview && i < 20; i++) {
        let real = d;
        // A holiday closure moves that delivery to the next delivery day.
        for (let j = 0; j < 7 && (isClosedDate(real) || DELIVERY.days.indexOf(dayOf(real)) === -1); j++) real = addDays(real, 1);
        out.push({ date: real, moved: real !== d });
        d = addDays(d, every);
      }
      return out;
    }
    function render() {
      $$('input[name="plan"]', plans).forEach((r) => { r.checked = r.value === state.plan; });
      $$('input[name="sub-size"]', sizes).forEach((r) => { r.checked = r.value === state.size; });
      daySel.value = String(state.day);
      const pl = SUBSCRIPTION.plans[state.plan], sz = SUBSCRIPTION.sizes[state.size];
      const each = round2(sz.price * (1 - pl.discount));
      const year = round2(each * pl.perYear);
      const saved = round2((sz.price - each) * pl.perYear);
      const month = round2(year / 12);
      $('[data-sub-each]').textContent = price(each);
      $('[data-sub-was]').textContent = price(sz.price);
      $('[data-sub-month]').textContent = price(month);
      $('[data-sub-year]').textContent = price(year);
      $('[data-sub-saved]').textContent = price(saved);
      $('[data-sub-summary]').textContent = sz.label + ' bouquet, ' + pl.label.toLowerCase() + ', on ' + DAY_NAMES[state.day] + 's: ' + price(each) + ' a delivery (' + Math.round(pl.discount * 100) + '% off ' + price(sz.price) + '), about ' + price(month) + ' a month, ' + price(year) + ' a year. You save ' + price(saved) + ' a year.';
      $('#sub-dates').innerHTML = upcoming().map((u, i) => '<li class="flex items-center justify-between gap-3 py-2.5"><span>' + (i === 0 ? '<strong>First:</strong> ' : '') + escapeHtml(fmtDate(u.date)) + (u.moved ? ' <span class="text-sm text-white/75">(moved for the holiday)</span>' : '') + '</span><span class="tabular-nums text-white/75">' + price(each) + '</span></li>').join('');
      try {
        const q = new URLSearchParams({ plan: state.plan, size: state.size });
        history.replaceState(null, '', location.pathname + '?' + q.toString() + location.hash);
      } catch (e) { /* file:// in some browsers */ }
    }
    plans.addEventListener('change', (e) => { if (has(SUBSCRIPTION.plans, e.target.value)) { state.plan = e.target.value; render(); } });
    sizes.addEventListener('change', (e) => { if (has(SUBSCRIPTION.sizes, e.target.value)) { state.size = e.target.value; render(); } });
    daySel.addEventListener('change', () => { const d = +daySel.value; if (SUBSCRIPTION.days.indexOf(d) !== -1) { state.day = d; render(); } });
    setupValidation(form, () => {
      const first = $('#s-name').value.trim().split(/\s+/)[0];
      successSwap(form, '<p class="kicker">Subscription request</p><p class="display mt-3 text-4xl">Lovely, ' + escapeHtml(first) + '.</p>' +
        '<p class="mt-4 text-lg leading-relaxed">' + escapeHtml($('[data-sub-summary]').textContent) + '</p>' +
        '<p class="mt-2 leading-relaxed">First delivery ' + escapeHtml(fmtDate(firstDelivery())) + ' to ' + escapeHtml(checkPostcode($('#s-postcode').value).postcode) + '.</p>' +
        '<p class="mt-3 text-muted">Your reference is <strong class="text-ink">' + makeRef('HH') + '</strong>. We’ll email you within a business day to confirm your subscription and set up payment before your first delivery.</p>');
    });
    render();
  }

  /* ------------------------------------------------------------------
   * 16. Weddings estimate, care guide, about
   * ------------------------------------------------------------------ */
  function initWeddings() {
    const box = $('#estimate');
    if (!box) return;
    const qty = Object.create(null);
    WEDDING.items.forEach((it) => { qty[it.id] = 0; });
    qty.bridal = 1; qty.buttonhole = 6; qty.centrepiece = 8;
    const list = $('#estimate-items');
    list.innerHTML = WEDDING.items.map((it) => '<li class="flex items-center justify-between gap-4 py-3" data-est="' + it.id + '">' +
      '<span><span class="block font-semibold" id="est-' + it.id + '">' + it.label + '</span><span class="text-sm text-muted">' + price(it.price) + ' each</span></span>' +
      '<span class="stepper shrink-0" role="group" aria-labelledby="est-' + it.id + '">' +
        '<button type="button" data-est-step="-1" aria-label="One fewer">−</button>' +
        '<span class="min-w-8 text-center font-semibold tabular-nums" aria-live="polite" data-est-qty></span>' +
        '<button type="button" data-est-step="1" aria-label="One more">+</button></span></li>').join('');
    function render() {
      let flowers = 0;
      WEDDING.items.forEach((it) => {
        const row = $('[data-est="' + it.id + '"]', list);
        $('[data-est-qty]', row).textContent = qty[it.id];
        $('[data-est-step="-1"]', row).disabled = qty[it.id] <= 0;
        $('[data-est-step="1"]', row).disabled = qty[it.id] >= it.max;
        flowers += qty[it.id] * it.price;
      });
      const setup = flowers ? Math.max(WEDDING.setupMin, Math.round(flowers * WEDDING.setupRate)) : 0;
      const total = flowers + setup;
      $('[data-est-flowers]').textContent = price(flowers);
      $('[data-est-setup]').textContent = price(setup);
      $('[data-est-total]').textContent = price(total);
      const under = total < WEDDING.minSpend;
      $('[data-est-note]').textContent = !total ? 'Add a few things to see a rough figure.'
        : under ? 'Our minimum for weddings is ' + price(WEDDING.minSpend) + '. We’re happy to talk about smaller celebrations, though: ask about our posy packages.'
        : 'A rough guide, including setup and teardown. Your final quote depends on the season, flowers and venue.';
      const hidden = $('#w-estimate');
      if (hidden) hidden.value = price(total);
    }
    list.addEventListener('click', (e) => {
      const b = e.target.closest('[data-est-step]');
      if (!b || b.disabled) return;
      const id = b.closest('[data-est]').getAttribute('data-est');
      const it = WEDDING.items.find((x) => x.id === id);
      qty[id] = Math.max(0, Math.min(it.max, qty[id] + +b.getAttribute('data-est-step')));
      render();
      if (b.disabled) { const other = $('[data-est-step]:not(:disabled)', b.parentNode); if (other) other.focus(); }
    });
    render();
    const date = $('#w-date');
    if (date) {
      const today = shopNow().date;
      date.min = addDays(today, WEDDING.leadWeeks * 7);
      date.max = addDays(today, 730);
      $('#w-date-hint').textContent = 'We book weddings from ' + fmtDate(date.min, { weekday: undefined, year: 'numeric' }) + ' onward (' + WEDDING.leadWeeks + ' weeks’ notice).';
    }
    const form = $('#wedding-form');
    setupValidation(form, () => {
      const first = $('#w-name').value.trim().split(/\s+/)[0];
      successSwap(form, '<p class="kicker">Inquiry received</p><p class="display mt-3 text-4xl">Thank you, ' + escapeHtml(first) + '.</p>' +
        '<p class="mt-4 text-lg leading-relaxed">Bettany has your inquiry for ' + escapeHtml(fmtDate($('#w-date').value, { year: 'numeric' })) + ' at ' + escapeHtml($('#w-venue').value.trim()) + ' (rough estimate ' + escapeHtml($('#w-estimate').value) + ') and will reply within two business days to arrange a consultation.</p>' +
        '<p class="mt-3 text-muted">Your reference is <strong class="text-ink">' + makeRef('HH') + '</strong>.</p>');
    });
  }

  function initCare() {
    const input = $('#care-date');
    if (input) {
      const today = shopNow().date;
      input.max = today;
      input.min = addDays(today, -30);
      input.value = today;
      const out = $('#care-plan');
      const render = () => {
        const v = input.value;
        if (!isIsoDate(v) || v > today || v < input.min) {
          showError(input, 'Choose a day in the last 30 days.');
          return;
        }
        showError(input, '');
        const day = dayNum(today) - dayNum(v) + 1;
        $('#care-day').textContent = 'Day ' + day + (day === 1 ? ': they arrived today' : day === 2 ? ': they arrived yesterday' : ': they arrived ' + fmtDate(v));
        out.innerHTML = CARE_PLAN.map((s) => {
          const now = day >= s.from && day <= s.to;
          const done = day > s.to;
          const range = s.to >= 99 ? 'Day ' + s.from + '+' : s.from === s.to ? 'Day ' + s.from : 'Days ' + s.from + '–' + s.to;
          return '<li class="relative rounded-lg p-5 ring-1 ' + (now ? 'bg-ink text-white ring-ink' : done ? 'bg-snow text-muted ring-line' : 'bg-white ring-line') + '"' + (now ? ' aria-current="step"' : '') + '>' +
            '<p class="text-[12.5px] font-semibold uppercase tracking-[0.16em] ' + (now ? 'text-marigold' : 'text-fern') + '">' + range + (now ? ' · today' : done ? ' · done' : '') + '</p>' +
            '<h3 class="mt-2 font-display text-xl font-semibold">' + s.title + '</h3>' +
            '<p class="mt-1.5 text-[15px] leading-relaxed' + (now ? ' text-white/85' : '') + '">' + s.text + '</p></li>';
        }).join('');
      };
      input.addEventListener('change', render);
      input.addEventListener('input', render);
      render();
    }
    const search = $('#care-search');
    const grid = $('#care-flowers');
    if (search && grid) {
      const render = () => {
        const q = search.value.trim().toLowerCase();
        const list = FLOWER_CARE.filter((fl) => !q || fl.name.toLowerCase().indexOf(q) !== -1 || fl.tip.toLowerCase().indexOf(q) !== -1);
        grid.innerHTML = list.map((fl) => '<li class="rounded-xl bg-white p-5 ring-1 ring-line"><div class="flex items-baseline justify-between gap-3"><h3 class="font-display text-xl font-semibold">' + fl.name + '</h3><p class="shrink-0 text-sm text-muted">' + fl.vase + '</p></div><p class="mt-2 text-[15px] leading-relaxed">' + fl.tip + '</p></li>').join('');
        $('#care-count').textContent = q ? plural(list.length, 'flower', 'flowers') + ' match “' + search.value.trim() + '”' : plural(list.length, 'flower', 'flowers');
        $('#care-none').hidden = list.length > 0;
      };
      search.addEventListener('input', render);
      render();
    }
  }

  /* ------------------------------------------------------------------
   * 17. Forms and boot
   * ------------------------------------------------------------------ */
  function luhn(num) {
    let sum = 0;
    for (let i = 0; i < num.length; i++) {
      let d = +num[num.length - 1 - i];
      if (i % 2) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
    }
    return sum % 10 === 0;
  }
  function fieldMessage(el) {
    const v = el.value.trim();
    const label = el.getAttribute('data-label') || 'This field';
    if (el.type === 'checkbox') return el.required && !el.checked ? (el.getAttribute('data-msg') || 'Please check this box.') : '';
    if (el.required && !v) return el.getAttribute('data-required-msg') || label + ' is required.';
    if (!v) return '';
    const rule = el.getAttribute('data-validate') || el.type;
    if (rule === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter an email address like name@example.com.';
    if (rule === 'tel') {
      const digits = v.replace(/\D/g, '');
      if (!/^[+()\d\s.-]+$/.test(v) || digits.length < 10 || digits.length > 13) return 'Enter a phone number like (478) 555-0142.';
    }
    if (rule === 'postcode' || rule === 'postcode-any') {
      const res = checkPostcode(v);
      if (!res.valid) return 'Enter a ZIP code like 31201.';
      if (!res.zone) return 'Sorry, we don’t deliver to ' + res.district + '. We cover Macon, Byron, Dry Branch and Lizella, plus Centerville, Forsyth, Milledgeville and Warner Robins.';
    }
    if (rule === 'order' && !/^HH-?\d{5}$/i.test(v)) return 'Order numbers look like HH-12345.';
    if (rule === 'card') {
      const d = v.replace(/\s/g, '');
      if (!/^\d{16}$/.test(d)) return 'Enter the 16-digit card number.';
      if (!luhn(d)) return 'That card number doesn’t look right. Check it, or use 4242 4242 4242 4242.';
    }
    if (rule === 'expiry') {
      const m = v.match(/^(\d{2})\s*\/\s*(\d{2})$/);
      if (!m || +m[1] < 1 || +m[1] > 12) return 'Use the format MM / YY.';
      const today = shopNow().date, y = +today.slice(0, 4), mo = +today.slice(5, 7);
      if (2000 + +m[2] < y || (2000 + +m[2] === y && +m[1] < mo)) return 'This card has expired.';
    }
    if (rule === 'cvc' && !/^\d{3,4}$/.test(v)) return 'Enter the 3 or 4 digit code on the back.';
    if (el.type === 'number') {
      const n = Number(v), min = el.min !== '' ? +el.min : -Infinity, max = el.max !== '' ? +el.max : Infinity;
      if (!isFinite(n) || n < min || n > max || Math.floor(n) !== n) return label + ' must be a whole number from ' + el.min + ' to ' + el.max + '.';
    }
    if (el.type === 'date') {
      if (!isIsoDate(v)) return 'Choose a date.';
      if (el.min && v < el.min) return el.getAttribute('data-min-msg') || 'The earliest date is ' + fmtDate(el.min, { year: 'numeric' }) + '.';
      if (el.max && v > el.max) return 'Choose a date before ' + fmtDate(el.max, { year: 'numeric' }) + '.';
    }
    const max = +el.getAttribute('maxlength');
    if (max && v.length > max) return label + ' can be up to ' + max + ' characters.';
    const min = +el.getAttribute('minlength');
    if (min && v.length < min) return label + ' needs at least ' + plural(min, 'character', 'characters') + '.';
    return '';
  }
  function showError(el, msg) {
    const errId = el.id + '-error';
    let err = document.getElementById(errId);
    if (!err) {
      err = document.createElement('p');
      err.id = errId;
      err.className = 'field-error';
      (el.closest('[data-error-after]') || el).insertAdjacentElement('afterend', err);
    }
    err.textContent = msg;
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      const desc = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      if (desc.indexOf(errId) === -1) desc.push(errId);
      el.setAttribute('aria-describedby', desc.join(' '));
    } else {
      el.removeAttribute('aria-invalid');
    }
  }
  function isField(el) {
    return el.matches('input, select, textarea') && el.type !== 'radio' && el.type !== 'hidden' && el.type !== 'submit' && !!el.id && !el.closest('[data-group]') && !el.hasAttribute('data-no-validate');
  }
  function fieldsOf(root) {
    return $$('input, select, textarea', root).filter((el) => isField(el) && !el.closest('[hidden]'));
  }
  function groupMessage(group) {
    return $$('input:checked', group).length ? '' : group.getAttribute('data-msg') || 'Choose an option.';
  }
  function validate(form) {
    let firstBad = null;
    fieldsOf(form).forEach((el) => {
      const msg = fieldMessage(el);
      showError(el, msg);
      if (msg && !firstBad) firstBad = el;
    });
    $$('[data-group]', form).forEach((g) => {
      if (g.closest('[hidden]')) return;
      const msg = groupMessage(g);
      showError(g, msg);
      if (msg && !firstBad) firstBad = $('input', g);
    });
    const status = $('[data-form-status]', form);
    if (firstBad) {
      if (status) status.textContent = 'Please check the highlighted fields.';
      firstBad.focus();
      return false;
    }
    if (status) status.textContent = '';
    return true;
  }
  function setupValidation(form, onValid) {
    if (!form) return;
    form.setAttribute('novalidate', '');
    form.addEventListener('focusout', (e) => {
      const el = e.target;
      if (isField(el) && (el.value.trim() || el.hasAttribute('aria-invalid'))) showError(el, fieldMessage(el));
    });
    form.addEventListener('input', (e) => {
      const el = e.target;
      if (isField(el) && el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el));
    });
    form.addEventListener('change', (e) => {
      const g = e.target.closest('[data-group]');
      if (g && g.hasAttribute('aria-invalid')) showError(g, groupMessage(g));
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validate(form)) onValid(form);
    });
  }
  // A short reference for confirmations, like HH-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  function successSwap(form, html, dark) {
    const box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.className = dark ? 'rounded-lg bg-white/10 p-5 text-white focus:outline-none' : 'rounded-xl bg-mint p-6 text-ink focus:outline-none sm:p-8';
    box.innerHTML = html;
    form.replaceWith(box);
    box.focus();
  }

  // To connect a form: replace successSwap(...) below with a fetch() to your form service, e.g.
  // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  //   .then((r) => r.ok ? successSwap(form, '…') : alert('Sorry, that didn’t send.'));
  function initForms() {
    $$('[data-form="newsletter"]').forEach((form) => setupValidation(form, () => {
      successSwap(form, '<p class="font-display text-xl font-semibold">You’re on the list.</p><p class="mt-1 text-sm text-white/85">Look out for a confirmation email from us; once you click the link, next month’s flower note is yours.</p>', true);
    }));
    $$('[data-form="contact"]').forEach((form) => setupValidation(form, () => {
      const first = $('#ct-name').value.trim().split(/\s+/)[0];
      successSwap(form, '<p class="display text-3xl">Thanks, ' + escapeHtml(first) + '.</p>' +
        '<p class="mt-3 leading-relaxed">Your message is with the studio and we’ll reply within a business day (usually much sooner).</p>' +
        '<p class="mt-2 text-sm text-muted">Your reference is <strong class="text-ink">' + makeRef('HH') + '</strong>.</p>');
    }));
    // Live character counters: <textarea id="x" maxlength="600"> + <p data-count-for="x">.
    $$('[data-count-for]').forEach((out) => {
      const field = document.getElementById(out.getAttribute('data-count-for'));
      if (!field) return;
      const upd = () => { out.textContent = plural(field.maxLength - field.value.length, 'character', 'characters') + ' left'; };
      field.addEventListener('input', upd);
      upd();
    });
    // ZIP code checker (home page): a quick "do you deliver to me?".
    $$('[data-form="zone-check"]').forEach((form) => {
      const input = $('input', form), out = $('[data-zone-result]', form.parentNode);
      form.setAttribute('novalidate', '');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const res = checkPostcode(input.value);
        if (!input.value.trim() || !res.valid) { showError(input, 'Enter a ZIP code like 31204.'); input.focus(); out.textContent = ''; return; }
        showError(input, '');
        input.value = res.postcode;
        out.innerHTML = res.zone
          ? '<strong>Yes, we deliver to ' + escapeHtml(res.district) + '.</strong> ' + escapeHtml(res.zone.label) + ', ' + price(res.zone.fee) + ' a delivery' + (res.zone.sameDay ? ', same day when you order by ' + clock(toMins(DELIVERY.cutoff)) + '.' : ', from the next delivery day.')
          : '<strong>Sorry, not ' + escapeHtml(res.district) + ' yet.</strong> Call ' + escapeHtml(SHOP.phone) + ' and we’ll recommend a florist near you.';
      });
    });
  }

  $$('[data-year]').forEach((el) => { el.textContent = shopNow().date.slice(0, 4); });
  // <div data-art="product-id" data-size="abundant"> → that bouquet's drawing.
  $$('[data-art]').forEach((el) => {
    const p = findProduct(el.getAttribute('data-art'));
    const size = el.getAttribute('data-size');
    if (p) el.innerHTML = bouquetArt(p, has(SIZES, size) ? size : 'classic');
  });
  $$('[data-peak-days]').forEach((el) => { el.textContent = peakDayText(); });
  renderSeason();
  renderClock();
  setInterval(renderClock, 1000);
  renderHours();
  renderBasketLinks();
  basketListeners.push(renderBasketLinks);
  initForms();
  const page = document.body.getAttribute('data-page');
  if (page === 'home') initHome();
  if (page === 'shop') initShop();
  if (page === 'product') initProduct();
  if (page === 'basket') initBasket();
  if (page === 'checkout') initCheckout();
  if (page === 'subscriptions') initSubscriptions();
  if (page === 'weddings') initWeddings();
  if (page === 'care') initCare();
  reveal(document);
})();



/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It lifts itself above toasts so they never overlap, and
   steps aside while an in-page "Back to top" link (e.g. in the footer) is on screen.
   Mark your own UI with data-back-to-top-avoid (lift above it) or data-back-to-top-hide
   (hide while covering it). To remove the button: delete this block and the .back-to-top
   styles in src/input.css. */
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
  // Fixed UI the button should never sit on top of (toasts, snackbars...).
  var AVOID = '[data-toast], #toast, .toast, [data-back-to-top-avoid]';
  var queued = false;

  function isShown(el) {
    var cs = window.getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05;
  }

  // Lift the button above any visible avoid-element in the bottom-right corner.
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

  // In-page "Back to top" links (e.g. in a footer): hide the button while one is on screen.
  var inlineLinks = Array.prototype.filter.call(document.querySelectorAll('a'), function (a) {
    return /back to top/i.test(a.textContent);
  });
  function inlineLinkInView() {
    return inlineLinks.some(function (a) {
      var r = a.getBoundingClientRect();
      return r.width > 0 && r.top < window.innerHeight && r.bottom > 0;
    });
  }

  // Elements marked data-back-to-top-hide (e.g. a sticky sidebar with a form) hide the
  // button while it would sit on top of them.
  function coversHideZone() {
    var b = btn.getBoundingClientRect();
    return Array.prototype.some.call(document.querySelectorAll('[data-back-to-top-hide]'), function (el) {
      // Only while the element is pinned (sticky/fixed); in normal flow it just scrolls past.
      var pos = window.getComputedStyle(el).position;
      if (pos !== 'sticky' && pos !== 'fixed') return false;
      var r = el.getBoundingClientRect();
      return r.width > 0 && r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top;
    });
  }

  function update() {
    queued = false;
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !inlineLinkInView() && !coversHideZone());
    lift();
  }
  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  // Toasts animate in and out; re-check the lift whenever another element transitions.
  document.addEventListener('transitionrun', function (e) { if (e.target !== btn) schedule(); }, true);
  document.addEventListener('transitionend', function (e) { if (e.target !== btn) schedule(); }, true);
  update();

  // Send focus to the skip-link target (or <main>) so keyboard users start at the top.
  function focusTop() {
    var skip = Array.prototype.find.call(document.querySelectorAll('a[href^="#"]'), function (a) {
      return /skip/i.test(a.textContent) && a.getAttribute('href').length > 1;
    });
    var target = (skip && document.getElementById(skip.getAttribute('href').slice(1))) || document.querySelector('main');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.classList.add('back-to-top-target');
    target.focus({ preventScroll: true });
  }

  btn.addEventListener('click', function () {
    if (reduceMotion.matches) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      focusTop();
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Move focus once the smooth scroll has finished (with a fallback for older browsers).
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
