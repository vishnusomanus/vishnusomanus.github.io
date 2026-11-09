/* Vennick Clay — site script for the Glaze template
 * Vanilla JavaScript, no dependencies. Sections:
 *  1. Studio settings: address, hours, closures, kiln-opening Saturdays
 *  2. Catalog: glazes, categories, pieces
 *  3. Shipping and pickup
 *  4. Workshops
 *  5. Helpers and saved data (safeStorage)
 *  6. Studio clock: Denver time, business days, workshop sessions
 *  7. Pottery artwork (SVG drawn from the product data)
 *  8. Cart (localStorage)
 *  9. Header, mobile menu, reveal, toast, open/closed status
 * 10. Product cards            14. Cart page
 * 11. Home and shop            15. Checkout
 * 12. Product page             16. Visit, care and studio pages
 * 13. Workshops page           17. Forms and boot
 */
document.documentElement.classList.add('js');

(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Studio settings — edit these to make the template yours.
   *    Every time is in TIMEZONE, so a visitor abroad still sees the
   *    studio's own clock.
   * ------------------------------------------------------------------ */
  const SHOP = {
    name: 'Vennick Clay',
    address: '228 N Mesquite Street, Las Cruces, NM 88001',
    phone: '(575) 555-0159',
    email: 'hello@vennickclay.example'
  };
  const TIMEZONE = 'America/Denver';
  const LOCALE = 'en-US';

  // Shop and studio opening hours, Sunday first: ['open', 'close'] or null when closed.
  const HOURS = [null, null, null, null, ['10:00', '17:00'], ['10:00', '17:00'], ['10:00', '17:00']];

  // Extra days the studio is closed every year ('MM-DD'): no shop, workshops, shipping or pickup.
  // US federal holidays are closed too: see federalHolidays() in section 6.
  const CLOSED_DATES = ['12-24', '12-31'];

  // Kiln-opening Saturday: the first Saturday of every month (a rule, so it never goes stale).
  // We open early, unpack the kiln and put the seconds shelf out.
  const KILN_OPENING = { weekday: 6, open: '09:00' };

  /* ------------------------------------------------------------------
   * 2. Catalog
   * ------------------------------------------------------------------ */
  // Glazes. body: three colors for the pot's sides (shadow, light, mid); rim: where the glaze
  // breaks thin; inside: the liner; speckle: iron spots or null; tile: the card background class.
  // dishwasher / microwave feed the care notes.
  const GLAZES = {
    oat: { name: 'Oat ash', note: 'A satin oatmeal that breaks toasty brown on every edge.', body: ['#a3865f', '#e8d7b5', '#c1a47b'], rim: '#8a6a4a', inside: '#dfcca8', speckle: '#7d6248', swatch: '#d2bb91', tile: 'bg-bisque', dishwasher: true, microwave: true },
    cobalt: { name: 'Cobalt wash', note: 'Deep blue that pools dark in the throwing lines.', body: ['#132a78', '#4b6dc2', '#1c3384'], rim: '#0f2263', inside: '#2d4ba3', speckle: null, swatch: '#2f4ea6', tile: 'bg-cobalt-tint', dishwasher: true, microwave: true },
    earth: { name: 'Burnt earth', note: 'A dry, warm iron glaze with the clay showing through.', body: ['#863b24', '#c97e55', '#9e4e31'], rim: '#6c2d1a', inside: '#b8693f', speckle: '#5d2414', swatch: '#b0603d', tile: 'bg-clay-tint', dishwasher: false, microwave: true },
    moss: { name: 'Moss celadon', note: 'A glassy green that gathers darker in the hollows.', body: ['#55653a', '#a8b57f', '#6e7e4a'], rim: '#46532e', inside: '#93a26c', speckle: null, swatch: '#8a9a5f', tile: 'bg-moss-tint', dishwasher: true, microwave: true },
    chalk: { name: 'Chalk speckle', note: 'Soft white with flecks of iron from the stoneware body.', body: ['#cbc1ae', '#f8f3e8', '#ddd4c2'], rim: '#a89b84', inside: '#f0e9db', speckle: '#6e604c', swatch: '#ebe4d6', tile: 'bg-sand/70', dishwasher: true, microwave: true }
  };
  const GLAZE_ORDER = ['oat', 'cobalt', 'earth', 'moss', 'chalk'];

  const CATEGORIES = {
    cups: { label: 'Mugs & cups', blurb: 'For the first cup and the last.' },
    bowls: { label: 'Bowls', blurb: 'Oatmeal, pasta, olives, salt.' },
    plates: { label: 'Plates & platters', blurb: 'Everyday plates and generous platters.' },
    pouring: { label: 'Pitchers & teapots', blurb: 'Milk, water, flowers and a good pot of tea.' },
    vases: { label: 'Vases & vessels', blurb: 'One stem, or simply the shape.' }
  };

  const SORTS = { featured: 'Our picks', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low', name: 'Name: A to Z' };

  // Every piece. price: the first size in dollars; sizes[].add: dollars on top. scale and count change
  // the drawing (a larger bowl, a pair of beakers). stock: pieces ready to ship per glaze; 0 means
  // made to order (see MADE_TO_ORDER_DAYS). shape: how it is drawn (section 7).
  // featured: its place on the home page (0 = not featured). made: how it is formed (MADE_BY;
  // thrown on the wheel when left out).
  const PRODUCTS = [
    { id: 'ripple', name: 'Ripple breakfast bowl', category: 'bowls', shape: 'bowl', price: 36, featured: 1,
      glazes: ['oat', 'cobalt', 'moss'], stock: { oat: 5, cobalt: 2, moss: 0 },
      sizes: [{ id: 'cereal', label: 'Cereal', detail: '6 in across, holds 16 oz', add: 0, scale: 0.88 }, { id: 'breakfast', label: 'Breakfast', detail: '6¾ in across, holds 22 oz', add: 8, scale: 1 }],
      blurb: 'A wide, rippled bowl for oatmeal, peaches and everything after.',
      description: 'Thrown in one pull and trimmed with a soft foot, the Ripple bowl keeps the lines the fingers leave behind. The glaze pools in each ring, so no two bowls catch the light the same way.' },
    { id: 'pasta', name: 'Mesquite pasta bowl', category: 'bowls', shape: 'pasta', price: 46, featured: 0,
      glazes: ['chalk', 'oat', 'cobalt'], stock: { chalk: 4, oat: 3, cobalt: 0 },
      sizes: [{ id: 'one', label: 'One size', detail: '9 in across, 2 in deep', add: 0, scale: 1 }],
      blurb: 'Shallow and wide, with a rim to rest a fork on.',
      description: 'Our most-used shape at home: wide enough for a heap of pasta, shallow enough for a salad, with a flat rim that stays cool to hold.' },
    { id: 'pinch', name: 'Pinch dishes', category: 'bowls', shape: 'pinch', price: 30, featured: 0, made: 'pinched',
      glazes: ['earth', 'cobalt', 'chalk'], stock: { earth: 6, cobalt: 3, chalk: 4 },
      sizes: [{ id: 'three', label: 'Set of three', detail: 'Each about 3 in across', add: 0, count: 3 }, { id: 'six', label: 'Set of six', detail: 'Each about 3 in across', add: 26, count: 6 }],
      blurb: 'Little pinched dishes for salt, olives, rings and keys.',
      description: 'Pinched by hand from a ball of clay, never thrown, so each one is slightly different in shape. The perfect first piece of handmade pottery to give.' },
    { id: 'loop', name: 'Loop handle mug', category: 'cups', shape: 'mug', price: 38, featured: 2,
      glazes: ['cobalt', 'oat', 'chalk', 'earth'], stock: { cobalt: 8, oat: 4, chalk: 0, earth: 2 },
      sizes: [{ id: 'regular', label: 'Regular', detail: 'Holds 10 oz', add: 0, scale: 0.9 }, { id: 'large', label: 'Large', detail: 'Holds 14 oz', add: 6, scale: 1 }],
      blurb: 'A generous morning mug with a hand-pulled handle.',
      description: 'The handle is pulled, not molded, so it fits four fingers and a thumb. Heavy enough to feel steady, light enough to carry upstairs full.' },
    { id: 'beaker', name: 'Rio tumbler', category: 'cups', shape: 'beaker', price: 30, featured: 0,
      glazes: ['moss', 'chalk', 'cobalt'], stock: { moss: 5, chalk: 6, cobalt: 1 },
      sizes: [{ id: 'single', label: 'Single', detail: '4½ in tall, holds 10 oz', add: 0, count: 1 }, { id: 'pair', label: 'A pair', detail: 'Two tumblers, 4½ in tall', add: 26, count: 2 }],
      blurb: 'A tall, handleless tumbler for water, wine or a flat white.',
      description: 'Named after the river at the edge of town. Straight-sided with a slight flare, so it sits well in the hand and stacks two high on the dish rack.' },
    { id: 'espresso', name: 'Thimble espresso cup', category: 'cups', shape: 'espresso', price: 32, featured: 0,
      glazes: ['cobalt', 'earth', 'chalk'], stock: { cobalt: 3, earth: 0, chalk: 4 },
      sizes: [{ id: 'single', label: 'Cup & saucer', detail: 'Holds 3 oz', add: 0, count: 1 }, { id: 'pair', label: 'Two cups & saucers', detail: 'Each holds 3 oz', add: 28, count: 2 }],
      blurb: 'A small cup and saucer for one strong coffee.',
      description: 'A thick wall keeps the coffee hot for the minute it lasts. The saucer has a shallow well, so the cup stays put when you carry it.' },
    { id: 'plate', name: 'Everyday plate', category: 'plates', shape: 'plate', price: 30, featured: 0, made: 'jiggered',
      glazes: ['chalk', 'moss', 'oat'], stock: { chalk: 10, moss: 3, oat: 6 },
      sizes: [{ id: 'side', label: 'Side', detail: '8¼ in across', add: 0, scale: 0.8 }, { id: 'dinner', label: 'Dinner', detail: '10½ in across', add: 14, scale: 1 }],
      blurb: 'A plain, sturdy plate with a soft raised edge.',
      description: 'Jiggered, then finished by hand, so the plates stack neatly but still feel made. The raised edge keeps the gravy where it should be.' },
    { id: 'pebble', name: 'Pebble serving platter', category: 'plates', shape: 'platter', price: 68, featured: 0, made: 'slab',
      glazes: ['cobalt', 'oat'], stock: { cobalt: 1, oat: 2 },
      sizes: [{ id: 'medium', label: 'Medium', detail: '12 in long', add: 0, scale: 0.86 }, { id: 'large', label: 'Large', detail: '15 in long', add: 24, scale: 1 }],
      blurb: 'An uneven, pebble-shaped platter for the middle of the table.',
      description: 'Rolled out as a slab and shaped over a hump mold, with an edge left as the rolling pin found it. Big enough for a roast chicken or a farmers’ market haul of tomatoes.' },
    { id: 'pour', name: 'Sunday pouring pitcher', category: 'pouring', shape: 'jug', price: 64, featured: 3,
      glazes: ['oat', 'cobalt', 'moss'], stock: { oat: 2, cobalt: 0, moss: 1 },
      sizes: [{ id: 'small', label: 'Small', detail: 'Holds 20 oz', add: 0, scale: 0.84 }, { id: 'large', label: 'Large', detail: 'Holds 40 oz', add: 22, scale: 1 }],
      blurb: 'An easy pour and a generous belly, for milk, water or flowers.',
      description: 'The lip is pulled while the clay is wet, so it pours cleanly without a drip. Equally at home with gravy on a Sunday or a handful of wildflowers.' },
    { id: 'teapot', name: 'Tortugas teapot', category: 'pouring', shape: 'teapot', price: 125, featured: 0,
      glazes: ['oat', 'cobalt', 'chalk'], stock: { oat: 1, cobalt: 0, chalk: 1 },
      sizes: [{ id: 'two', label: 'Two-cup', detail: 'Holds 20 oz', add: 0, scale: 0.86 }, { id: 'four', label: 'Four-cup', detail: 'Holds 36 oz', add: 25, scale: 1 }],
      blurb: 'A round, steady teapot with a lid that stays on.',
      description: 'Named for the round-topped mountain east of town. Six parts thrown separately and joined by hand: body, lid, knob, spout, strainer and a pulled handle. A locking tab keeps the lid on while you pour.' },
    { id: 'stem', name: 'Stem bud vase', category: 'vases', shape: 'budvase', price: 42, featured: 4,
      glazes: ['earth', 'moss', 'chalk'], stock: { earth: 4, moss: 2, chalk: 3 },
      sizes: [{ id: 'one', label: 'One size', detail: '7 in tall, watertight', add: 0, scale: 1 }],
      blurb: 'A small, round-bellied vase for one stem or three.',
      description: 'A narrow neck holds a single stem upright without fuss. Glazed inside, so it is watertight; the unglazed foot is sanded smooth and will not scratch a table.' },
    { id: 'totem', name: 'Totem vessel', category: 'vases', shape: 'vessel', price: 110, featured: 0, made: 'coiled',
      glazes: ['earth', 'cobalt'], stock: { earth: 1, cobalt: 0 },
      sizes: [{ id: 'one', label: 'One size', detail: '11½ in tall, watertight', add: 0, scale: 1 }],
      blurb: 'A tall, coil-built vessel with a grounded shape.',
      description: 'Built slowly from coils over three days, then scraped smooth so only the faintest rings remain. Beautiful empty; better with a branch of desert willow.' }
  ];

  const MADE_BY = {
    thrown: 'Thrown on the wheel',
    pinched: 'Pinched by hand',
    jiggered: 'Formed on a jigger and finished by hand',
    slab: 'Rolled as a slab and shaped over a mold',
    coiled: 'Built from coils by hand'
  };

  // The most of one piece (in one glaze and size) per order online. Larger orders: email us.
  const MAX_QTY = 6;

  /* ------------------------------------------------------------------
   * 3. Shipping and pickup
   * ------------------------------------------------------------------ */
  // dispatchDays: business days (Monday to Friday, not closed dates) to pack a piece we have ready.
  // MADE_TO_ORDER_DAYS: business days to throw, dry, fire twice and pack a piece we don't.
  const DELIVERY = {
    fee: 12,            // Lower 48 states and DC, per order
    freeFrom: 125,      // pieces subtotal for free shipping to the Lower 48
    remoteFee: 28,      // Alaska and Hawaii
    dispatchDays: 2,
    transitDays: [2, 5],
    remoteExtraDays: 3,
    collectReadyDays: 2 // calendar days before a ready piece can be picked up
  };
  const MADE_TO_ORDER_DAYS = 15;
  // ZIP code prefixes (first three digits) we charge remoteFee for: Alaska and Hawaii.
  const REMOTE_POSTCODES = ['995', '996', '997', '998', '999', '967', '968'];
  // ZIP code prefixes we can't ship to yet: Puerto Rico, the territories and military addresses.
  const NO_POST = {
    '006': 'Puerto Rico', '007': 'Puerto Rico', '009': 'Puerto Rico', '008': 'the US Virgin Islands', '969': 'the Pacific territories',
    '090': 'military addresses', '091': 'military addresses', '092': 'military addresses', '093': 'military addresses', '094': 'military addresses',
    '095': 'military addresses', '096': 'military addresses', '097': 'military addresses', '098': 'military addresses', '340': 'military addresses',
    '962': 'military addresses', '963': 'military addresses', '964': 'military addresses', '965': 'military addresses', '966': 'military addresses'
  };

  /* ------------------------------------------------------------------
   * 4. Workshops. Sessions come from a rule, never a list of dates:
   *    weekly (every `day`), fortnightly (every other week on `day`, in step
   *    with RHYTHM_ANCHOR) or first (the first `day` of each month).
   *    day: 0 = Sunday … 6 = Saturday. show: how many sessions to list.
   * ------------------------------------------------------------------ */
  const WORKSHOPS = {
    taster: { name: 'Wheel intro', price: 75, capacity: 6, rule: 'weekly', day: 0, slots: ['10:00', '14:00'], hours: 2.5, show: 8,
      length: '2½ hours', blurb: 'Your first try at the wheel. Throw four or five pots; we trim, glaze and fire your favorite two.',
      includes: ['All clay, tools and an apron', 'Two pieces glazed and fired, ready four weeks later', 'Coffee, and biscochitos from the bakery next door'] },
    handbuild: { name: 'Hand-building evening', price: 60, capacity: 8, rule: 'fortnightly', day: 3, slots: ['18:30'], hours: 2.5, show: 5,
      length: '2½ hours', blurb: 'Pinch, coil and slab a small vessel or a set of dishes. No wheel, no pressure, a lot of laughing.',
      includes: ['Clay, tools and a glaze of your choice', 'Everything you make, fired and ready in four weeks', 'Something cold to drink'] },
    course: { name: 'Six-week wheel course', price: 325, capacity: 6, rule: 'first', day: 2, slots: ['18:30'], hours: 2.5, weeks: 6, show: 3,
      length: 'Six Tuesday evenings', blurb: 'Center, open, pull, trim and glaze, one step a week, until you can throw a set of bowls on your own.',
      includes: ['25 lb of clay and all your firings', 'A shelf of your own in the studio for six weeks', 'A free practice session at the end'] }
  };
  const WORKSHOP_ORDER = ['taster', 'handbuild', 'course'];
  const RHYTHM_ANCHOR = '2026-01-07';    // any Wednesday with a hand-building evening
  const BOOKING_LEAD_DAYS = 2;           // booking closes this many days before a session
  const WORKSHOP_HORIZON_DAYS = 120;     // how far ahead sessions are listed
  const WORKSHOP_MAX_PLACES = 4;         // spots per booking online
  // Demo availability: the share (0–100) of sessions that show as full, and a stable
  // pseudo-random number of spots taken on the rest. Replace with your real bookings.
  const DEMO_FULL_PERCENT = 14;

  /* ------------------------------------------------------------------
   * 5. Helpers and saved data
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const has = (obj, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const round2 = (n) => Math.round(n * 100) / 100;
  // $36, or $9.50 when there are cents.
  function price(n) {
    return '$' + (Number.isInteger(n) ? String(n) : n.toFixed(2));
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
    return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '';
  }
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13;
    return h >>> 0;
  }

  const PRODUCT_BY_ID = PRODUCTS.reduce((m, p) => { m[p.id] = p; return m; }, Object.create(null));
  const findProduct = (id) => (typeof id === 'string' && PRODUCT_BY_ID[id]) || null;
  const findSize = (p, id) => p.sizes.filter((s) => s.id === id)[0] || null;
  const unitPrice = (p, sizeId) => p.price + (findSize(p, sizeId) || p.sizes[0]).add;
  const minPrice = (p) => p.price;
  const inStock = (p, glaze) => (has(p.stock, glaze) ? p.stock[glaze] : 0);

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
  const KEYS = { basket: 'glaze-basket', lastOrder: 'glaze-last-order' };
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
   * 6. Studio clock. Dates are 'YYYY-MM-DD' strings in TIMEZONE.
   *    Add ?now=2026-10-17T10:15 to any page to preview another time.
   * ------------------------------------------------------------------ */
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const pad = (n) => String(n).padStart(2, '0');
  const toMins = (t) => { const p = t.split(':'); return +p[0] * 60 + +p[1]; };
  const isIsoDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + 'T12:00:00Z')) && new Date(s + 'T12:00:00Z').toISOString().slice(0, 10) === s;
  const dayOf = (iso) => new Date(iso + 'T12:00:00Z').getUTCDay();
  const dayNum = (iso) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
  function addDays(iso, n) {
    const d = new Date(iso + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  // 600 → "10am", 1110 → "6:30pm", 720 → "noon"
  function clock(mins) {
    if (mins === 720) return 'noon';
    const h = Math.floor(mins / 60), m = mins % 60;
    return (h % 12 || 12) + (m ? ':' + pad(m) : '') + (h < 12 ? 'am' : 'pm');
  }
  const LOADED_AT = Date.now();
  const PREVIEW = (function () {
    const v = urlParams().get('now');
    if (!v || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) || !isIsoDate(v.slice(0, 10))) return null;
    const h = +v.slice(11, 13), m = +v.slice(14, 16);
    return h < 24 && m < 60 ? Date.parse(v + ':00Z') : null;
  })();
  // { date: 'YYYY-MM-DD', day: 0-6, mins: minutes since midnight }
  function shopNow() {
    let y, mo, d, h, mi;
    if (PREVIEW !== null) {
      const t = new Date(PREVIEW + (Date.now() - LOADED_AT));
      y = t.getUTCFullYear(); mo = t.getUTCMonth() + 1; d = t.getUTCDate(); h = t.getUTCHours(); mi = t.getUTCMinutes();
    } else {
      const parts = {};
      new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach((p) => { parts[p.type] = p.value; });
      y = +parts.year; mo = +parts.month; d = +parts.day; h = +parts.hour % 24; mi = +parts.minute;
    }
    const date = y + '-' + pad(mo) + '-' + pad(d);
    return { date: date, day: dayOf(date), mins: h * 60 + mi };
  }
  function fmtDate(iso, opts) {
    return new Intl.DateTimeFormat(LOCALE, Object.assign({ weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }, opts || {})).format(new Date(iso + 'T12:00:00Z'));
  }
  const shortDate = (iso) => fmtDate(iso, { weekday: 'short', month: 'short' });
  // US federal holidays for a year, worked out by rule so they never go stale: the day itself,
  // plus the weekday it's observed on when it falls on a weekend. Add or remove them here.
  const holidayCache = Object.create(null);
  function federalHolidays(year) {
    if (holidayCache[year]) return holidayCache[year];
    const first = (month) => year + '-' + pad(month) + '-01';
    // The nth given weekday of a month; n = 0 means the last one.
    const nth = (month, weekday, n) => {
      if (n) return addDays(first(month), ((weekday - dayOf(first(month)) + 7) % 7) + (n - 1) * 7);
      const end = addDays(first(month + 1), -1);
      return addDays(end, -((dayOf(end) - weekday + 7) % 7));
    };
    const out = [nth(1, 1, 3), nth(2, 1, 3), nth(5, 1, 0), nth(9, 1, 1), nth(10, 1, 2), nth(11, 4, 4)];
    ['01-01', '06-19', '07-04', '11-11', '12-25'].forEach((md) => {
      const iso = year + '-' + md;
      out.push(iso);
      if (dayOf(iso) === 6) out.push(addDays(iso, -1));
      if (dayOf(iso) === 0) out.push(addDays(iso, 1));
    });
    holidayCache[year] = out;
    return out;
  }
  const isClosedDate = (iso) => CLOSED_DATES.indexOf(iso.slice(5)) !== -1 || federalHolidays(+iso.slice(0, 4)).indexOf(iso) !== -1;
  const isWorkingDay = (iso) => dayOf(iso) >= 1 && dayOf(iso) <= 5 && !isClosedDate(iso);
  const isOpenDay = (iso) => !!HOURS[dayOf(iso)] && !isClosedDate(iso);
  function addWorkingDays(iso, n) {
    let d = iso;
    for (let i = 0; i < n;) { d = addDays(d, 1); if (isWorkingDay(d)) i++; }
    return d;
  }
  function nextOpenDay(from) {
    let d = from;
    for (let i = 0; i < 30 && !isOpenDay(d); i++) d = addDays(d, 1);
    return d;
  }
  const isKilnOpening = (iso) => dayOf(iso) === KILN_OPENING.weekday && +iso.slice(8) <= 7 && !isClosedDate(iso);
  // Opening hours for a date, with kiln-opening Saturdays' early start.
  function hoursOn(iso) {
    if (!isOpenDay(iso)) return null;
    const h = HOURS[dayOf(iso)];
    return isKilnOpening(iso) ? [KILN_OPENING.open, h[1]] : h;
  }
  function kilnOpenings(count) {
    const out = [];
    const now = shopNow();
    let d = now.date;
    for (let i = 0; i < 800 && out.length < count; i++, d = addDays(d, 1)) {
      if (!isKilnOpening(d)) continue;
      if (d === now.date && now.mins >= toMins(hoursOn(d)[1])) continue;
      out.push(d);
    }
    return out;
  }
  // { open, text } e.g. "Open now until 5pm" / "Closed · opens Thursday at 10am"
  function studioStatus() {
    const now = shopNow();
    const today = hoursOn(now.date);
    if (today && now.mins >= toMins(today[0]) && now.mins < toMins(today[1])) {
      return { open: true, text: 'Open now until ' + clock(toMins(today[1])) + (isKilnOpening(now.date) ? ' · kiln opening today' : '') };
    }
    let d = now.date;
    if (today && now.mins < toMins(today[0])) return { open: false, text: 'Closed now · opens today at ' + clock(toMins(today[0])) };
    for (let i = 1; i < 30; i++) {
      d = addDays(now.date, i);
      const h = hoursOn(d);
      if (h) return { open: false, text: 'Closed now · opens ' + (i === 1 ? 'tomorrow' : DAY_NAMES[dayOf(d)]) + ' at ' + clock(toMins(h[0])) };
    }
    return { open: false, text: 'Closed now' };
  }

  // Workshop sessions: [{ key, id, date, slot }] from today + BOOKING_LEAD_DAYS onwards.
  function ruleMatches(w, iso) {
    if (dayOf(iso) !== w.day || isClosedDate(iso)) return false;
    if (w.rule === 'weekly') return true;
    if (w.rule === 'fortnightly') return (((dayNum(iso) - dayNum(RHYTHM_ANCHOR)) / 7) % 2 + 2) % 2 === 0;
    if (w.rule === 'first') return +iso.slice(8) <= 7;
    return false;
  }
  function sessionsFor(id, limit) {
    const w = WORKSHOPS[id];
    const out = [];
    const start = addDays(shopNow().date, BOOKING_LEAD_DAYS);
    for (let i = 0; i <= WORKSHOP_HORIZON_DAYS && out.length < (limit || w.show); i++) {
      const d = addDays(start, i);
      if (!ruleMatches(w, d)) continue;
      w.slots.forEach((slot) => { if (out.length < (limit || w.show)) out.push({ key: id + '~' + d + '~' + slot, id: id, date: d, slot: slot }); });
    }
    return out;
  }
  function isBookableSession(id, date, slot) {
    if (!has(WORKSHOPS, id) || !isIsoDate(date) || typeof slot !== 'string') return false;
    const w = WORKSHOPS[id];
    const start = addDays(shopNow().date, BOOKING_LEAD_DAYS);
    return w.slots.indexOf(slot) !== -1 && ruleMatches(w, date) && date >= start && dayNum(date) - dayNum(start) <= WORKSHOP_HORIZON_DAYS;
  }
  // Spots already booked by other people (demo availability, stable for a session).
  function placesTaken(id, date, slot) {
    const h = hash(id + '|' + date + '|' + slot);
    const w = WORKSHOPS[id];
    return h % 100 < DEMO_FULL_PERCENT ? w.capacity : (h >>> 8) % w.capacity;
  }
  function placesLeft(id, date, slot, ignoreBasket) {
    const inBasket = ignoreBasket ? 0 : basket.lines.filter((l) => l.kind === 'workshop' && l.id === id && l.date === date && l.slot === slot).reduce((n, l) => n + l.qty, 0);
    return Math.max(0, WORKSHOPS[id].capacity - placesTaken(id, date, slot) - inBasket);
  }
  function sessionLabel(id, date, slot, short) {
    const w = WORKSHOPS[id];
    const end = toMins(slot) + w.hours * 60;
    return (short ? shortDate(date) : fmtDate(date)) + ', ' + clock(toMins(slot)) + '–' + clock(end) + (w.weeks ? (short ? ' · 6 weeks' : ', then five more Tuesdays') : '');
  }

  // Delivery estimates for the pieces in a cart (or one piece). Returns ISO dates.
  function dispatchDate(madeToOrder) {
    return addWorkingDays(shopNow().date, madeToOrder ? MADE_TO_ORDER_DAYS : DELIVERY.dispatchDays);
  }
  function arrivalRange(madeToOrder, remote) {
    const sent = dispatchDate(madeToOrder);
    const extra = remote ? DELIVERY.remoteExtraDays : 0;
    return [addWorkingDays(sent, DELIVERY.transitDays[0] + extra), addWorkingDays(sent, DELIVERY.transitDays[1] + extra)];
  }
  function collectFrom(madeToOrder) {
    const ready = madeToOrder ? addWorkingDays(dispatchDate(true), 0) : addDays(shopNow().date, DELIVERY.collectReadyDays);
    return nextOpenDay(ready);
  }
  function rangeText(r) {
    if (r[0] === r[1]) return fmtDate(r[0]);
    return fmtDate(r[0], { month: 'short' }) + ' – ' + fmtDate(r[1], { month: 'short' });
  }

  // ZIP code (5 digits, optional +4) → { valid, postcode, area, district, remote, blocked }
  // postcode: the tidied ZIP; area: its first three digits; district: its first five.
  function checkPostcode(v) {
    const m = String(v || '').trim().match(/^(\d{5})(?:[-\s]?(\d{4}))?$/);
    if (!m || +m[1].slice(0, 3) < 5) return { valid: false }; // no ZIP codes start below 005
    const area = m[1].slice(0, 3);
    return {
      valid: true, postcode: m[1] + (m[2] ? '-' + m[2] : ''), area: area, district: m[1],
      remote: REMOTE_POSTCODES.indexOf(area) !== -1,
      blocked: has(NO_POST, area) ? NO_POST[area] : ''
    };
  }

  /* ------------------------------------------------------------------
   * 7. Pottery artwork. Every pot is drawn from its shape and glaze:
   *    a body path (clipped for the unglazed foot, speckle and shading),
   *    parts behind it (handles, spouts, saucers) and parts in front
   *    (rims, liners). The SVG has no background: the tile behind it
   *    gives the color, so there is never a box behind a pot.
   *    Coordinates: viewBox 0 0 600 520, the table at y = 430.
   * ------------------------------------------------------------------ */
  const CLAY_BODY = '#c19a74';  // raw stoneware where the glaze stops
  const SHAPES = {
    bowl: { shadow: [300, 432, 170, 18], back: () => '<path d="M232 396Q300 412 368 396L360 428Q300 437 240 428Z" fill="' + CLAY_BODY + '"/>',
      body: 'M120 240Q140 404 300 410Q460 404 480 240Z', foot: 384,
      front: (g) => '<ellipse cx="300" cy="240" rx="180" ry="46" fill="' + g.rim + '"/><ellipse cx="300" cy="238" rx="166" ry="34" fill="' + g.inside + '"/>' +
        '<path d="M141 286Q300 350 459 286M154 320Q300 378 446 320M178 356Q300 400 422 356" fill="none" stroke="#000" stroke-opacity=".12" stroke-width="3"/>' },
    pasta: { shadow: [300, 430, 230, 18], back: () => '<path d="M244 382Q300 392 356 382L350 416Q300 424 250 416Z" fill="' + CLAY_BODY + '"/>',
      body: 'M66 262Q100 380 300 388Q500 380 534 262Z', foot: 368,
      front: (g) => '<ellipse cx="300" cy="262" rx="234" ry="58" fill="' + g.rim + '"/><ellipse cx="300" cy="261" rx="218" ry="47" fill="' + g.inside + '"/>' +
        '<ellipse cx="300" cy="272" rx="132" ry="25" fill="#000" fill-opacity=".07"/>' },
    pinch: { shadow: [300, 432, 160, 16], back: () => '<path d="M236 396Q300 410 364 396L356 428Q300 436 244 428Z" fill="' + CLAY_BODY + '"/>',
      body: 'M126 250Q150 400 300 408Q452 400 474 250Q300 262 126 250Z', foot: 382,
      front: (g) => '<path d="M126 250Q190 196 300 204Q420 190 474 250Q420 292 300 290Q178 296 126 250Z" fill="' + g.rim + '"/><path d="M144 250Q200 210 300 216Q410 206 456 250Q404 280 300 278Q192 284 144 250Z" fill="' + g.inside + '"/>' },
    mug: { shadow: [296, 432, 160, 18], back: () => '<path d="M394 235C525 202 522 365 406 358L399 324C468 333 477 251 400 269Z" fill="url(#@b)"/>',
      body: 'M164 193L180 380Q288 438 397 380L413 193Z', foot: 384,
      front: (g) => '<ellipse cx="288" cy="193" rx="124" ry="34" fill="' + g.rim + '"/><ellipse cx="288" cy="192" rx="110" ry="24" fill="' + g.inside + '"/>' +
        '<path d="M172 260Q288 290 404 260M176 318Q288 350 400 318" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3"/>' },
    beaker: { shadow: [300, 430, 112, 15], back: () => '',
      body: 'M206 140L224 388Q300 418 376 388L394 140Z', foot: 372,
      front: (g) => '<ellipse cx="300" cy="140" rx="94" ry="23" fill="' + g.rim + '"/><ellipse cx="300" cy="139" rx="82" ry="16" fill="' + g.inside + '"/>' +
        '<path d="M212 214Q300 238 388 214M216 282Q300 306 384 282" fill="none" stroke="#000" stroke-opacity=".09" stroke-width="3"/>' },
    espresso: { shadow: [300, 432, 166, 16], back: (g) => '<ellipse cx="300" cy="408" rx="158" ry="30" fill="' + g.rim + '"/><ellipse cx="300" cy="402" rx="156" ry="30" fill="url(#@b)"/><ellipse cx="300" cy="398" rx="100" ry="16" fill="' + g.inside + '"/>' +
        '<path d="M370 282C430 270 434 344 372 346L372 326C410 324 410 296 374 302Z" fill="url(#@b)"/>',
      body: 'M222 252L234 372Q300 398 366 372L378 252Z', foot: 362,
      front: (g) => '<ellipse cx="300" cy="252" rx="78" ry="20" fill="' + g.rim + '"/><ellipse cx="300" cy="251" rx="68" ry="14" fill="' + g.inside + '"/>' },
    plate: { shadow: [300, 418, 220, 22], back: (g) => '<ellipse cx="300" cy="334" rx="230" ry="86" fill="' + g.rim + '"/>',
      body: 'M70 322A230 84 0 1 0 530 322A230 84 0 1 0 70 322Z', foot: null,
      front: (g) => '<ellipse cx="300" cy="328" rx="156" ry="54" fill="' + g.inside + '"/><ellipse cx="300" cy="328" rx="156" ry="54" fill="#000" fill-opacity=".05"/>' +
        '<ellipse cx="300" cy="322" rx="214" ry="76" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="3"/>' },
    platter: { shadow: [304, 420, 230, 22], back: (g) => '<path d="M90 307C80 237 220 212 330 219C460 227 530 257 518 317C506 379 380 399 280 395C160 391 100 367 90 307Z" fill="' + g.rim + '"/>',
      body: 'M90 300C80 230 220 205 330 212C460 220 530 250 518 310C506 372 380 392 280 388C160 384 100 360 90 300Z', foot: null,
      front: (g) => '<path d="M150 304C146 260 240 246 320 250C420 256 462 276 456 312C450 350 360 362 288 359C200 356 154 338 150 304Z" fill="' + g.inside + '"/><path d="M150 304C146 260 240 246 320 250C420 256 462 276 456 312C450 350 360 362 288 359C200 356 154 338 150 304Z" fill="#000" fill-opacity=".06"/>' },
    jug: { shadow: [300, 432, 160, 18], back: () => '<path d="M398 183C542 167 549 362 425 369L418 334C491 321 492 218 407 224Z" fill="url(#@b)"/>',
      body: 'M206 151L387 156L398 233Q463 303 419 409Q310 447 195 409Q151 303 216 233Z', foot: 392,
      front: (g) => '<path d="M210 150L166 132L184 186L218 204Z" fill="url(#@b)"/><path d="M210 150L166 132" stroke="' + g.rim + '" stroke-width="7" stroke-linecap="round"/><ellipse cx="297" cy="156" rx="92" ry="25" fill="' + g.rim + '"/><ellipse cx="297" cy="156" rx="76" ry="15" fill="#3a2e26"/>' +
        '<path d="M190 300Q300 330 424 300" fill="none" stroke="#000" stroke-opacity=".08" stroke-width="3"/>' },
    teapot: { shadow: [300, 432, 176, 18], back: (g) => '<path d="M190 334Q138 326 116 238L102 228L124 222L136 234Q156 290 194 290Z" fill="url(#@b)"/><ellipse cx="112" cy="226" rx="12" ry="5" transform="rotate(-24 112 226)" fill="' + g.rim + '"/><path d="M416 250C504 232 516 366 420 374L416 346C480 336 474 270 418 280Z" fill="url(#@b)"/>',
      body: 'M176 252Q150 410 300 414Q450 410 424 252Q412 206 300 202Q188 206 176 252Z', foot: 394,
      front: (g) => '<ellipse cx="300" cy="216" rx="96" ry="21" fill="' + g.rim + '"/><path d="M216 214Q300 170 384 214Q300 226 216 214Z" fill="url(#@b)"/><ellipse cx="300" cy="180" rx="18" ry="11" fill="url(#@b)"/><ellipse cx="300" cy="176" rx="12" ry="5" fill="' + g.rim + '" fill-opacity=".5"/>' },
    budvase: { shadow: [300, 432, 112, 15], back: () => '',
      body: 'M276 118L272 178Q196 222 202 328Q210 414 300 416Q390 414 398 328Q404 222 328 178L324 118Z', foot: 396,
      front: (g) => '<ellipse cx="300" cy="118" rx="27" ry="8" fill="' + g.rim + '"/><ellipse cx="300" cy="118" rx="17" ry="4.5" fill="#2e2620"/>',
      sprig: true },
    vessel: { shadow: [300, 434, 130, 16], back: () => '',
      body: 'M262 58L258 122Q176 176 184 300Q194 422 300 426Q406 422 416 300Q424 176 342 122L338 58Z', foot: 406,
      front: (g) => '<ellipse cx="300" cy="58" rx="40" ry="10" fill="' + g.rim + '"/><ellipse cx="300" cy="58" rx="28" ry="6" fill="#2e2620"/>' +
        '<path d="M232 170Q300 186 368 170M196 230Q300 254 404 230M186 300Q300 326 414 300M196 366Q300 392 404 366" fill="none" stroke="#000" stroke-opacity=".09" stroke-width="4"/>',
      sprig: false }
  };
  // Where copies sit when a size draws two, three or six pots: [dx, dy, scale].
  const LAYOUTS = {
    1: [[0, 0, 1]],
    2: [[-120, -18, 0.72], [110, 0, 0.78]],
    3: [[-160, -24, 0.56], [160, -24, 0.56], [0, 0, 0.62]],
    6: [[-165, -70, 0.46], [0, -78, 0.46], [165, -70, 0.46], [-165, 4, 0.52], [0, -2, 0.52], [165, 4, 0.52]]
  };
  let artCount = 0;
  // One pot (or several) as SVG markup. sizeId picks the scale and count.
  function potArt(p, glazeId, sizeId, label) {
    const g = GLAZES[has(GLAZES, glazeId) ? glazeId : p.glazes[0]];
    const size = findSize(p, sizeId) || p.sizes[0];
    const uid = 'vc' + (++artCount);
    const shape = SHAPES[p.shape];
    const layout = LAYOUTS[size.count || 1] || LAYOUTS[1];
    const scale = size.scale || 1;
    let pots = '';
    layout.forEach((pos, i) => {
      const s = pos[2] * scale;
      pots += '<g transform="translate(' + pos[0] + ' ' + pos[1] + ') translate(300 430) scale(' + s + ') translate(-300 -430)">' +
        drawPot(shape, g, uid, hash(p.id + i)) + '</g>';
    });
    const sprig = shape.sprig && (size.count || 1) === 1 ? sprigArt(118, scale) : '';
    return '<svg viewBox="40 20 520 440" xmlns="http://www.w3.org/2000/svg"' + (label ? ' role="img" aria-label="' + escapeHtml(label) + '"' : ' aria-hidden="true" focusable="false"') + '>' +
      glazeDefs(g, uid, shape.body) + (sprig ? '<g class="sway">' + sprig + '</g>' : '') + pots + '</svg>';
  }
  function glazeDefs(g, uid, body) {
    return '<defs><linearGradient id="' + uid + 'b" x1="0" x2="1"><stop offset="0" stop-color="' + g.body[0] + '"/><stop offset=".38" stop-color="' + g.body[1] + '"/><stop offset="1" stop-color="' + g.body[2] + '"/></linearGradient>' +
      '<linearGradient id="' + uid + 's" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".1"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".16"/></linearGradient>' +
      (body ? '<clipPath id="' + uid + 'c"><path d="' + body + '"/></clipPath>' : '') + '</defs>';
  }
  function drawPot(shape, g, uid, seed) {
    const ref = (s) => s.replace(/@/g, uid);
    const sh = shape.shadow;
    let speckle = '';
    if (g.speckle) {
      let r = seed || 1;
      for (let i = 0; i < 46; i++) {
        r = (Math.imul(r, 1103515245) + 12345) >>> 0;
        const x = 60 + (r % 480), y = 40 + ((r >>> 9) % 400), rad = 1 + ((r >>> 4) % 3) * 0.7;
        speckle += '<circle cx="' + x + '" cy="' + y + '" r="' + rad.toFixed(1) + '"/>';
      }
      speckle = '<g fill="' + g.speckle + '" fill-opacity=".55">' + speckle + '</g>';
    }
    const foot = shape.foot ? '<path d="M0 ' + shape.foot + 'Q75 ' + (shape.foot - 7) + ' 150 ' + shape.foot + 'T300 ' + shape.foot + 'T450 ' + shape.foot + 'T600 ' + shape.foot + 'V520H0Z" fill="' + CLAY_BODY + '"/>' : '';
    return '<ellipse cx="' + sh[0] + '" cy="' + sh[1] + '" rx="' + sh[2] + '" ry="' + sh[3] + '" fill="#3b2a1c" fill-opacity=".14"/>' +
      ref(shape.back(g)) +
      '<path d="' + shape.body + '" fill="url(#' + uid + 'b)"/>' +
      '<g clip-path="url(#' + uid + 'c)">' + speckle + foot +
        '<rect width="600" height="520" fill="url(#' + uid + 's)"/>' +
        '<ellipse cx="236" cy="250" rx="26" ry="120" fill="#fff" fill-opacity=".14"/></g>' +
      ref(shape.front(g));
  }
  function sprigArt(top, scale) {
    const y = 430 - (430 - top) * scale;
    return '<g transform="translate(300 ' + y + ') scale(' + (0.72 * scale).toFixed(2) + ')"><path d="M0 4Q-8 -50 14 -96M4 -40Q30 -58 46 -84M2 -66Q-26 -82 -36 -110" fill="none" stroke="#5e6a3a" stroke-width="3.5" stroke-linecap="round"/>' +
      '<path d="M14 -96Q-4 -122 20 -138Q34 -116 14 -96ZM46 -84Q44 -110 72 -112Q72 -90 46 -84ZM-36 -110Q-62 -112 -64 -138Q-38 -136 -36 -110Z" fill="#7b8a4c"/>' +
      '<circle cx="20" cy="-140" r="6" fill="#e9d8b0"/></g>';
  }
  // The home page still life: jug, bowl and mug, drawn from the same shapes.
  function sceneArt() {
    const uid = 'vcs' + (++artCount);
    const oat = GLAZES.oat, cobalt = GLAZES.cobalt;
    const piece = (shape, g, id, t) => '<g transform="' + t + '">' + glazeDefs(g, id, shape.body) + drawPot(shape, g, id, hash(id)) + '</g>';
    return '<svg viewBox="0 0 900 900" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
      '<circle cx="640" cy="250" r="300" fill="#e9dbc3"/><path d="M0 640L900 590V900H0Z" fill="#c9ad8a"/><path d="M0 640L900 590" stroke="#a88a67" stroke-width="3"/>' +
      '<g transform="translate(340 92) scale(1.02)"><g class="sway">' + '<g transform="translate(297 156) scale(1.4)"><path d="M0 4Q-12 -60 18 -110M6 -46Q38 -64 58 -96M2 -74Q-30 -92 -44 -124" fill="none" stroke="#5e6a3a" stroke-width="3" stroke-linecap="round"/><path d="M18 -110Q-2 -138 24 -156Q40 -130 18 -110ZM58 -96Q56 -124 86 -126Q86 -102 58 -96ZM-44 -124Q-72 -126 -74 -154Q-46 -152 -44 -124Z" fill="#7b8a4c"/><circle cx="24" cy="-158" r="7" fill="#f1e3c0"/></g></g>' +
        piece(SHAPES.jug, oat, uid + 'j', '') + '</g>' +
      piece(SHAPES.bowl, oat, uid + 'b', 'translate(0 340) scale(.98)') +
      piece(SHAPES.mug, cobalt, uid + 'm', 'translate(400 452) scale(.62)') +
      '</svg>';
  }
  // A cracked bowl mended with gold, for the 404 page.
  function brokenArt() {
    const uid = 'vck' + (++artCount);
    return '<svg viewBox="0 0 600 520" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + glazeDefs(GLAZES.cobalt, uid, SHAPES.bowl.body) +
      drawPot(SHAPES.bowl, GLAZES.cobalt, uid, 7) +
      '<path d="M256 252L282 300L262 340L290 404M282 300L336 318L368 290M336 318L352 372" fill="none" stroke="#d8a93b" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  }

  /* ------------------------------------------------------------------
   * 8. Cart. Saved as glaze-basket:
   *    { lines: [ { kind: 'piece', id, glaze, size, qty }
   *             | { kind: 'workshop', id, date, slot, qty } ],
   *      method: 'delivery' | 'collect' }
   * ------------------------------------------------------------------ */
  const MAX_LINES = 40;
  const removedSessions = [];
  function lineKey(l) {
    return l.kind === 'workshop' ? 'w~' + l.id + '~' + l.date + '~' + l.slot : 'p~' + l.id + '~' + l.glaze + '~' + l.size;
  }
  function normalizeBasket(raw) {
    const out = { lines: [], method: 'delivery' };
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    const byKey = Object.create(null);
    (Array.isArray(raw.lines) ? raw.lines : []).slice(0, MAX_LINES).forEach((l) => {
      if (!l || typeof l !== 'object' || typeof l.qty !== 'number' || !isFinite(l.qty)) return;
      let line;
      if (l.kind === 'workshop') {
        if (!has(WORKSHOPS, l.id)) return;
        if (!isBookableSession(l.id, l.date, l.slot)) {
          if (isIsoDate(l.date)) removedSessions.push(WORKSHOPS[l.id].name + ' on ' + fmtDate(l.date));
          return;
        }
        line = { kind: 'workshop', id: l.id, date: l.date, slot: l.slot, qty: Math.min(WORKSHOP_MAX_PLACES, Math.max(1, Math.floor(l.qty))) };
      } else if (l.kind === 'piece') {
        const p = findProduct(l.id);
        if (!p || p.glazes.indexOf(l.glaze) === -1 || !findSize(p, l.size)) return;
        line = { kind: 'piece', id: p.id, glaze: l.glaze, size: l.size, qty: Math.min(MAX_QTY, Math.max(1, Math.floor(l.qty))) };
      } else return;
      const k = lineKey(line);
      if (byKey[k]) byKey[k].qty = Math.min(line.kind === 'workshop' ? WORKSHOP_MAX_PLACES : MAX_QTY, byKey[k].qty + line.qty);
      else { byKey[k] = line; out.lines.push(line); }
    });
    out.method = raw.method === 'collect' ? 'collect' : 'delivery';
    return out;
  }
  const basketListeners = [];
  function loadBasket() {
    const rawText = safeStorage.getItem(KEYS.basket);
    const b = normalizeBasket(read(KEYS.basket));
    // Heal whatever was stored: write the repaired cart back.
    if (rawText !== null && rawText !== JSON.stringify(b)) write(KEYS.basket, b);
    return b;
  }
  let basket = { lines: [], method: 'delivery' };
  basket = loadBasket();
  function saveBasket(next) {
    basket = normalizeBasket(next);
    write(KEYS.basket, basket);
    basketListeners.forEach((fn) => fn(basket));
  }
  window.addEventListener('storage', (e) => {
    if (e.key === KEYS.basket) { basket = loadBasket(); basketListeners.forEach((fn) => fn(basket)); }
  });
  const pieceLines = () => basket.lines.filter((l) => l.kind === 'piece');
  const workshopLines = () => basket.lines.filter((l) => l.kind === 'workshop');
  const basketCount = () => basket.lines.reduce((n, l) => n + l.qty, 0);
  const lineTotal = (l) => l.kind === 'workshop' ? WORKSHOPS[l.id].price * l.qty : unitPrice(findProduct(l.id), l.size) * l.qty;
  const piecesSubtotal = () => round2(pieceLines().reduce((t, l) => t + lineTotal(l), 0));
  const subtotal = () => round2(basket.lines.reduce((t, l) => t + lineTotal(l), 0));
  const madeToOrder = (l) => l.qty > inStock(findProduct(l.id), l.glaze);
  // Shipping charge for the pieces. postcode: optional ZIP code, for the remote rate.
  function deliveryCharge(method, postcode) {
    if (!pieceLines().length || method === 'collect') return 0;
    const pc = checkPostcode(postcode);
    if (pc.valid && pc.remote) return DELIVERY.remoteFee;
    return piecesSubtotal() >= DELIVERY.freeFrom ? 0 : DELIVERY.fee;
  }
  // Add a line; returns { qty: what was added, capped: true when the limit stopped it }.
  function addToBasket(line) {
    const max = line.kind === 'workshop' ? WORKSHOP_MAX_PLACES : MAX_QTY;
    const k = lineKey(line);
    const existing = basket.lines.filter((l) => lineKey(l) === k)[0];
    const before = existing ? existing.qty : 0;
    const room = Math.max(0, max - before);
    const qty = Math.min(room, line.qty);
    if (qty > 0) saveBasket({ lines: basket.lines.concat([Object.assign({}, line, { qty: qty })]), method: basket.method });
    return { qty: qty, total: before + qty, capped: qty < line.qty };
  }
  function lineTitle(l) {
    if (l.kind === 'workshop') return WORKSHOPS[l.id].name;
    return findProduct(l.id).name;
  }
  function lineDetail(l, short) {
    if (l.kind === 'workshop') return sessionLabel(l.id, l.date, l.slot, short) + ' · ' + plural(l.qty, 'spot', 'spots');
    const p = findProduct(l.id);
    const size = findSize(p, l.size);
    return GLAZES[l.glaze].name + (p.sizes.length > 1 ? ' · ' + size.label : '');
  }
  const capMessage = (name) => 'You have the most we can take online of ' + name + ' (' + MAX_QTY + '). For more, email ' + SHOP.email + ' and we’ll make a set for you.';

  /* ------------------------------------------------------------------
   * 9. Header, mobile menu, reveal, toast, studio status
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
  const onScroll = () => header && header.classList.toggle('shadow-[0_14px_30px_-26px_rgb(41_39_31/.7)]', window.scrollY > 8);
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

  function renderBasketLinks() {
    const n = basketCount();
    $$('[data-basket-count]').forEach((el) => { el.textContent = String(n); el.hidden = n === 0; });
    $$('[data-basket-link]').forEach((a) => a.setAttribute('aria-label', 'Cart, ' + plural(n, 'item', 'items')));
  }
  function popBadge() {
    if (reduceMotion) return;
    $$('[data-basket-count]').forEach((el) => { el.classList.remove('badge-pop'); void el.offsetWidth; el.classList.add('badge-pop'); });
  }
  const toastBox = document.createElement('div');
  toastBox.id = 'toast';
  toastBox.setAttribute('role', 'status');
  toastBox.setAttribute('data-show', 'false');
  toastBox.className = 'fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-start gap-3 rounded-2xl bg-kiln px-5 py-4 text-[15px] leading-snug text-paper shadow-2xl on-dark sm:inset-x-auto sm:right-6 sm:bottom-6';
  document.body.appendChild(toastBox);
  let toastTimer = 0;
  function toast(html) {
    toastBox.innerHTML = '<span class="min-w-0 flex-1">' + html + '</span><button type="button" class="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-full text-paper/80 hover:bg-white/10 hover:text-paper" aria-label="Dismiss" data-toast-close><svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>';
    toastBox.setAttribute('data-show', 'true');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 6000);
  }
  function hideToast() { toastBox.setAttribute('data-show', 'false'); }
  toastBox.addEventListener('click', (e) => { if (e.target.closest('[data-toast-close]')) hideToast(); });
  toastBox.addEventListener('mouseenter', () => clearTimeout(toastTimer));
  toastBox.addEventListener('mouseleave', () => { toastTimer = setTimeout(hideToast, 3000); });

  // "Added" on an add button for a moment. Each button has its own timer and keeps its
  // own label in data-idle, so quick repeated clicks never leave it stuck.
  const buttonTimers = new WeakMap();
  function flashButton(btn, text) {
    const label = $('[data-btn-label]', btn) || btn;
    if (!btn.hasAttribute('data-idle')) btn.setAttribute('data-idle', label.textContent);
    label.textContent = text;
    clearTimeout(buttonTimers.get(btn));
    buttonTimers.set(btn, setTimeout(() => { label.textContent = btn.getAttribute('data-idle'); }, 1600));
  }

  function renderStatus() {
    const st = studioStatus();
    $$('[data-studio-status]').forEach((el) => {
      el.textContent = st.text;
    });
    $$('[data-studio-dot]').forEach((el) => {
      el.classList.toggle('text-moss', st.open);
      el.classList.toggle('text-clay', !st.open);
    });
    const next = kilnOpenings(1)[0];
    $$('[data-kiln-next]').forEach((el) => { el.textContent = next ? (next === shopNow().date ? 'today' : fmtDate(next)) : ''; });
    $$('[data-kiln-next-short]').forEach((el) => { el.textContent = next ? fmtDate(next, { weekday: undefined }) : ''; });
  }

  /* ------------------------------------------------------------------
   * 10. Product cards
   * ------------------------------------------------------------------ */
  function stockTag(p, glaze) {
    return inStock(p, glaze) > 0
      ? '<span class="tag bg-paper/90 text-moss"><span class="dot"></span>Ready to ship</span>'
      : '<span class="tag bg-paper/90 text-clay-deep"><span class="dot"></span>Made to order</span>';
  }
  function productCard(p, opts) {
    const o = opts || {};
    const tag = o.headingTag || 'h3';
    const glaze = o.glaze && p.glazes.indexOf(o.glaze) !== -1 ? o.glaze : p.glazes[0];
    const size = p.sizes[0];
    const url = 'product.html?piece=' + p.id + (glaze !== p.glazes[0] ? '&glaze=' + glaze : '');
    return '<article class="group relative flex h-full flex-col">' +
      '<div class="art relative aspect-square overflow-hidden rounded-[1.5rem] sm:aspect-[6/5] ' + GLAZES[glaze].tile + '">' +
        '<div class="lift absolute inset-x-[5%] bottom-[3%] top-[17%]">' + potArt(p, glaze, size.id) + '</div>' +
        '<span class="absolute left-3 top-3">' + stockTag(p, glaze) + '</span>' +
      '</div>' +
      '<div class="mt-4 flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-3">' +
        '<' + tag + ' class="font-display text-[1.25rem] sm:text-[1.4rem] font-medium leading-tight tracking-[-0.01em]"><a href="' + url + '" class="after:absolute after:inset-0 after:z-0 focus:outline-none group-focus-within:underline group-hover:underline decoration-1 underline-offset-4">' + escapeHtml(p.name) + '</a></' + tag + '>' +
        '<p class="shrink-0 text-[15px] font-semibold tabular-nums sm:mt-1">' + (p.sizes.length > 1 ? '<span class="font-normal text-muted">from </span>' : '') + price(minPrice(p)) + '</p>' +
      '</div>' +
      '<p class="mt-1.5 hidden text-[15px] leading-relaxed text-muted sm:block">' + escapeHtml(p.blurb) + '</p>' +
      '<div class="mt-auto flex items-center justify-between gap-3 pt-4">' +
        '<p class="flex flex-wrap items-center gap-1 sm:gap-1.5"><span class="sr-only">Glazes: ' + p.glazes.map((g) => GLAZES[g].name).join(', ') + '</span>' +
          p.glazes.map((g) => '<span class="swatch max-sm:size-3.5' + (g === glaze ? ' ring-2 ring-ink ring-offset-2 ring-offset-paper' : '') + '" style="background:' + GLAZES[g].swatch + '" title="' + GLAZES[g].name + '" aria-hidden="true"></span>').join('') + '</p>' +
        '<button type="button" class="relative z-10 inline-flex min-h-10 shrink-0 items-center gap-1 rounded-full px-3 sm:gap-1.5 sm:px-3.5 text-[14.5px] font-semibold text-cobalt ring-[1.5px] ring-cobalt/30 ring-inset transition hover:bg-cobalt hover:text-white" data-quick-add="' + p.id + '" data-glaze="' + glaze + '" aria-label="Add ' + escapeHtml(p.name + ', ' + GLAZES[glaze].name + (p.sizes.length > 1 ? ', ' + size.label.toLowerCase() : '')) + ', to cart">' +
          '<svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span data-btn-label>Add</span></button>' +
      '</div>' +
    '</article>';
  }
  // Quick add from a card: the first size, in the glaze shown.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-quick-add]');
    if (!btn) return;
    const p = findProduct(btn.getAttribute('data-quick-add'));
    if (!p) return;
    const glaze = p.glazes.indexOf(btn.getAttribute('data-glaze')) !== -1 ? btn.getAttribute('data-glaze') : p.glazes[0];
    const res = addToBasket({ kind: 'piece', id: p.id, glaze: glaze, size: p.sizes[0].id, qty: 1 });
    if (!res.qty) { flashButton(btn, 'Limit reached'); toast(escapeHtml(capMessage(p.name))); return; }
    flashButton(btn, 'Added');
    popBadge();
    toast('<strong>' + escapeHtml(p.name) + '</strong> in ' + escapeHtml(GLAZES[glaze].name.toLowerCase()) + ' is in your cart' + (res.total > 1 ? ' (' + res.total + ')' : '') + '. <a href="basket.html" class="font-semibold underline underline-offset-4">View cart</a>');
  });
  // Odd number of cards in a two-column grid: the last one spans both columns.
  const LAST_WIDE = 'max-lg:[&>li:last-child:nth-child(odd)]:col-span-2';

  /* ------------------------------------------------------------------
   * 11. Home and shop
   * ------------------------------------------------------------------ */
  function initHome() {
    const grid = $('#featured');
    if (grid) {
      grid.innerHTML = PRODUCTS.filter((p) => p.featured).sort((a, b) => a.featured - b.featured)
        .map((p) => '<li class="reveal">' + productCard(p) + '</li>').join('');
    }
    $$('[data-category-count]').forEach((el) => {
      const id = el.getAttribute('data-category-count');
      if (has(CATEGORIES, id)) el.textContent = plural(PRODUCTS.filter((p) => p.category === id).length, 'piece', 'pieces');
    });
    $$('[data-category-art]').forEach((el) => {
      const p = findProduct(el.getAttribute('data-category-art'));
      if (p) el.innerHTML = potArt(p, el.getAttribute('data-glaze'), p.sizes[p.sizes.length - 1].id);
    });
    const hero = $('[data-scene]');
    if (hero) hero.innerHTML = sceneArt();
    const ws = $('#home-workshops');
    if (ws) {
      ws.innerHTML = WORKSHOP_ORDER.map((id) => {
        const w = WORKSHOPS[id];
        const s = sessionsFor(id).filter((x) => placesLeft(x.id, x.date, x.slot) > 0)[0];
        return '<li class="flex flex-col rounded-[1.5rem] bg-paper/10 p-6 ring-1 ring-paper/20">' +
          '<h3 class="font-display text-2xl font-medium">' + escapeHtml(w.name) + '</h3>' +
          '<p class="mt-1 text-[15px] text-paper/75">' + escapeHtml(w.length) + ' · ' + price(w.price) + (w.weeks ? '' : ' a person') + '</p>' +
          '<p class="mt-4 text-[15px] leading-relaxed text-paper/90">' + escapeHtml(w.blurb) + '</p>' +
          '<p class="mt-auto pt-5 text-[15px]"><span class="block text-[12.5px] font-semibold uppercase tracking-[0.18em] text-oat">Next with openings</span>' + (s ? escapeHtml(sessionLabel(id, s.date, s.slot, true)) : 'New dates soon') + '</p>' +
          '<a href="workshops.html?workshop=' + id + '" class="mt-4 inline-flex items-center gap-2 font-semibold text-paper underline decoration-paper/40 underline-offset-4 hover:decoration-paper">Book ' + escapeHtml(w.name.toLowerCase()) + '<span aria-hidden="true">→</span></a></li>';
      }).join('');
    }
  }

  function initShop() {
    const grid = $('#shop-grid');
    if (!grid) return;
    grid.className += ' ' + LAST_WIDE;
    const params = urlParams();
    const state = {
      category: has(CATEGORIES, params.get('category')) ? params.get('category') : '',
      glaze: has(GLAZES, params.get('glaze')) ? params.get('glaze') : '',
      ready: params.get('ready') === '1',
      sort: has(SORTS, params.get('sort')) ? params.get('sort') : 'featured'
    };
    const catBox = $('#filter-category'), glazeBox = $('#filter-glaze'), sortSel = $('#shop-sort');
    catBox.innerHTML = '<button type="button" class="pill" data-filter="category" data-value="">Everything</button>' +
      Object.keys(CATEGORIES).map((k) => '<button type="button" class="pill" data-filter="category" data-value="' + k + '">' + escapeHtml(CATEGORIES[k].label) + '</button>').join('');
    glazeBox.innerHTML = '<button type="button" class="pill" data-filter="glaze" data-value="">Any glaze</button>' +
      GLAZE_ORDER.map((k) => '<button type="button" class="pill" data-filter="glaze" data-value="' + k + '"><span class="swatch" style="background:' + GLAZES[k].swatch + '" aria-hidden="true"></span>' + GLAZES[k].name + '</button>').join('');
    sortSel.innerHTML = Object.keys(SORTS).map((k) => '<option value="' + k + '">' + SORTS[k] + '</option>').join('');
    const readyBtn = $('#filter-ready');

    function matches(p) {
      if (state.category && p.category !== state.category) return false;
      if (state.glaze && p.glazes.indexOf(state.glaze) === -1) return false;
      if (state.ready && !(state.glaze ? inStock(p, state.glaze) : p.glazes.some((g) => inStock(p, g) > 0))) return false;
      return true;
    }
    function shownGlaze(p) {
      if (state.glaze) return state.glaze;
      if (state.ready) return p.glazes.filter((g) => inStock(p, g) > 0)[0] || p.glazes[0];
      return p.glazes[0];
    }
    function render() {
      $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(state[b.getAttribute('data-filter')] === b.getAttribute('data-value'))));
      readyBtn.setAttribute('aria-pressed', String(state.ready));
      sortSel.value = state.sort;
      let list = PRODUCTS.filter(matches);
      if (state.sort === 'price-asc') list = list.slice().sort((a, b) => a.price - b.price);
      if (state.sort === 'price-desc') list = list.slice().sort((a, b) => b.price - a.price);
      if (state.sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name, LOCALE));
      grid.innerHTML = list.map((p) => '<li>' + productCard(p, { headingTag: 'h2', glaze: shownGlaze(p) }) + '</li>').join('');
      const active = [state.category && CATEGORIES[state.category].label.toLowerCase(), state.glaze && 'in ' + GLAZES[state.glaze].name.toLowerCase(), state.ready && 'ready to ship'].filter(Boolean);
      $('#shop-count').textContent = plural(list.length, 'piece', 'pieces') + (active.length ? ' · ' + active.join(', ') : '');
      $('#shop-empty').hidden = list.length > 0;
      $('#shop-reset').hidden = !(state.category || state.glaze || state.ready || state.sort !== 'featured');
      const q = new URLSearchParams();
      ['category', 'glaze'].forEach((k) => { if (state[k]) q.set(k, state[k]); });
      if (state.ready) q.set('ready', '1');
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
      if (e.target.closest('#filter-ready')) { state.ready = !state.ready; render(); }
      if (e.target.closest('[data-shop-reset]')) {
        state.category = state.glaze = '';
        state.ready = false;
        state.sort = 'featured';
        render();
        const first = $('[data-filter="category"]');
        if (first) first.focus();
      }
    });
    sortSel.addEventListener('change', () => { if (has(SORTS, sortSel.value)) { state.sort = sortSel.value; render(); } });
    render();
  }

  /* ------------------------------------------------------------------
   * 12. Product page: glaze, size, quantity, stock and delivery estimate
   * ------------------------------------------------------------------ */
  // Pieces to suggest: same category first, then pieces sharing a glaze, never the piece itself.
  function relatedTo(p, n) {
    return PRODUCTS.filter((x) => x.id !== p.id)
      .map((x, i) => ({ x: x, score: (x.category === p.category ? 10 : 0) + x.glazes.filter((g) => p.glazes.indexOf(g) !== -1).length, i: i }))
      .sort((a, b) => b.score - a.score || a.i - b.i)
      .slice(0, n).map((r) => r.x);
  }
  function initProduct() {
    const root = $('#product');
    if (!root) return;
    const params = urlParams();
    const p = findProduct(params.get('piece'));
    if (!p) {
      document.title = 'Piece not found — Vennick Clay, Las Cruces';
      root.innerHTML = '<section class="container-x py-20 text-center sm:py-28"><p class="kicker">The shop</p>' +
        '<h1 class="display mt-4 text-[2.8rem] sm:text-[3.8rem]">We couldn’t find that piece.</h1>' +
        '<p class="mx-auto mt-4 max-w-lg text-lg text-muted">It may have sold out of the last kiln. Everything we’re making now is in the shop.</p>' +
        '<a href="shop.html" class="btn-primary mt-8">See every piece</a></section>';
      return;
    }
    document.title = p.name + ' — Vennick Clay, Las Cruces';
    const meta = $('meta[name="description"]');
    if (meta) meta.setAttribute('content', p.blurb + ' Handmade stoneware from Vennick Clay in Las Cruces.');
    const state = {
      glaze: p.glazes.indexOf(params.get('glaze')) !== -1 ? params.get('glaze') : p.glazes[0],
      size: findSize(p, params.get('size') || '') ? params.get('size') : p.sizes[0].id,
      qty: 1
    };
    $('[data-p-name]').textContent = p.name;
    $('[data-p-crumb]').textContent = p.name;
    $('[data-p-blurb]').textContent = p.blurb;
    $('[data-p-description]').textContent = p.description;
    const catLink = $('[data-p-category]');
    catLink.textContent = CATEGORIES[p.category].label;
    catLink.href = 'shop.html?category=' + p.category;

    const glazeBox = $('#p-glazes');
    glazeBox.innerHTML = p.glazes.map((g) => '<label class="option min-w-0 items-center gap-3 p-3">' +
      '<input type="radio" name="glaze" value="' + g + '" class="sr-only">' +
      '<span class="size-7 shrink-0 rounded-full ring-1 ring-ink/20" style="background:' + GLAZES[g].swatch + '" aria-hidden="true"></span>' +
      '<span class="min-w-0"><span class="block font-semibold leading-tight">' + GLAZES[g].name + '</span>' +
      '<span class="block text-[13.5px] text-muted">' + (inStock(p, g) > 0 ? plural(inStock(p, g), 'ready', 'ready') + ' to ship' : 'Made to order') + '</span></span></label>').join('');
    const sizeBox = $('#p-sizes');
    $('#p-size-group').hidden = p.sizes.length < 2;
    sizeBox.innerHTML = p.sizes.map((s) => '<label class="option min-w-0 flex-col gap-0.5 p-3 sm:p-4">' +
      '<input type="radio" name="size" value="' + s.id + '" class="sr-only">' +
      '<span class="font-semibold">' + escapeHtml(s.label) + '</span>' +
      '<span class="text-sm text-muted">' + escapeHtml(s.detail) + '</span>' +
      '<span class="mt-2 font-semibold tabular-nums">' + price(unitPrice(p, s.id)) + '</span></label>').join('');

    const qtyOut = $('#p-qty'), minus = $('#p-minus'), plusBtn = $('#p-plus'), qtyNote = $('#p-qty-note');
    function render(fromInput) {
      $$('input[name="glaze"]', glazeBox).forEach((r) => { r.checked = r.value === state.glaze; });
      $$('input[name="size"]', sizeBox).forEach((r) => { r.checked = r.value === state.size; });
      const g = GLAZES[state.glaze], size = findSize(p, state.size);
      const stage = $('[data-p-art]');
      stage.className = stage.className.replace(/\bbg-\S+/g, '').trim() + ' ' + g.tile;
      $('[data-p-art-inner]').innerHTML = potArt(p, state.glaze, state.size, 'Drawing of the ' + p.name + ' in ' + g.name.toLowerCase() + (p.sizes.length > 1 ? ', ' + size.label.toLowerCase() : ''));
      $('[data-p-glaze-name]').textContent = g.name;
      $('[data-p-glaze-note]').textContent = g.note;
      $('[data-p-size]').textContent = size.detail;
      $('[data-p-made]').textContent = MADE_BY[has(MADE_BY, p.made) ? p.made : 'thrown'] + ' at 228 N Mesquite, glazed by hand and fired twice to 2,300°F.';
      $('[data-p-price]').textContent = price(unitPrice(p, state.size));
      $('[data-p-care]').textContent = (g.dishwasher ? 'Dishwasher and microwave safe.' : 'Microwave safe. Wash by hand to keep the satin finish.') + (p.category === 'vases' ? ' Watertight, glazed inside.' : ' Food safe.');
      qtyOut.textContent = String(state.qty);
      minus.disabled = state.qty <= 1;
      plusBtn.disabled = state.qty >= MAX_QTY;
      qtyNote.textContent = state.qty >= MAX_QTY ? 'That’s the most we can take online per piece. For a bigger set, email ' + SHOP.email + '.' : '';
      // Stock and the delivery estimate for this glaze and quantity.
      const ready = inStock(p, state.glaze);
      const mto = state.qty > ready;
      const stock = $('[data-p-stock]');
      stock.innerHTML = ready > 0
        ? '<span class="dot text-moss"></span><span><strong>' + plural(ready, 'piece', 'pieces') + ' ready to ship</strong> in ' + escapeHtml(g.name.toLowerCase()) + (mto ? '. The rest are made to order.' : '.') + '</span>'
        : '<span class="dot text-clay"></span><span><strong>Made to order</strong> in ' + escapeHtml(g.name.toLowerCase()) + ': thrown, fired twice and shipped in about three weeks.</span>';
      $('[data-p-delivery]').textContent = 'Delivered ' + rangeText(arrivalRange(mto, false)) + ', or pick up on Mesquite Street starting ' + fmtDate(collectFrom(mto)) + '.';
      if (!fromInput) {
        try {
          const q = new URLSearchParams({ piece: p.id });
          if (state.glaze !== p.glazes[0]) q.set('glaze', state.glaze);
          if (state.size !== p.sizes[0].id) q.set('size', state.size);
          history.replaceState(null, '', location.pathname + '?' + q.toString() + location.hash);
        } catch (e) { /* file:// in some browsers */ }
      }
    }
    glazeBox.addEventListener('change', (e) => { if (p.glazes.indexOf(e.target.value) !== -1) { state.glaze = e.target.value; render(); } });
    sizeBox.addEventListener('change', (e) => { if (findSize(p, e.target.value)) { state.size = e.target.value; render(); } });
    minus.addEventListener('click', () => { state.qty = Math.max(1, state.qty - 1); render(true); });
    plusBtn.addEventListener('click', () => { state.qty = Math.min(MAX_QTY, state.qty + 1); render(true); if (plusBtn.disabled) minus.focus(); });

    $('#p-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = $('#p-add');
      const res = addToBasket({ kind: 'piece', id: p.id, glaze: state.glaze, size: state.size, qty: state.qty });
      const name = p.name + ' in ' + GLAZES[state.glaze].name.toLowerCase();
      if (!res.qty) { flashButton(btn, 'Limit reached'); toast(escapeHtml(capMessage(p.name))); return; }
      flashButton(btn, 'Added to cart');
      popBadge();
      toast('<strong>' + res.qty + ' × ' + escapeHtml(name) + '</strong> in your cart.' +
        (res.capped ? ' We added ' + res.qty + ', as ' + MAX_QTY + ' is the most we can take online.' : '') +
        ' <a href="basket.html" class="font-semibold underline underline-offset-4">View cart</a>');
    });

    $('#related').className += ' ' + LAST_WIDE;
    $('#related').innerHTML = relatedTo(p, 4).map((x) => '<li>' + productCard(x) + '</li>').join('');
    render();
  }

  /* ------------------------------------------------------------------
   * 13. Workshops: pick a class, a session and the number of spots
   * ------------------------------------------------------------------ */
  function initWorkshops() {
    const form = $('#ws-form');
    if (!form) return;
    const params = urlParams();
    const state = { id: has(WORKSHOPS, params.get('workshop')) ? params.get('workshop') : 'taster', key: '', qty: 1 };
    const pick = $('#ws-pick'), list = $('#ws-sessions'), qtyOut = $('#ws-qty'), minus = $('#ws-minus'), plusBtn = $('#ws-plus');
    pick.innerHTML = WORKSHOP_ORDER.map((id) => {
      const w = WORKSHOPS[id];
      return '<label class="option min-w-0 flex-col gap-0.5 p-3 sm:p-4"><input type="radio" name="workshop" value="' + id + '" class="sr-only">' +
        '<span class="font-semibold leading-tight">' + escapeHtml(w.name) + '</span><span class="text-sm text-muted">' + escapeHtml(w.length) + '</span>' +
        '<span class="mt-2 font-semibold tabular-nums">' + price(w.price) + '</span></label>';
    }).join('');
    // Info cards for each workshop on the page.
    $$('[data-ws-next]').forEach((el) => {
      const id = el.getAttribute('data-ws-next');
      if (!has(WORKSHOPS, id)) return;
      const s = sessionsFor(id).filter((x) => placesLeft(x.id, x.date, x.slot) > 0)[0];
      el.textContent = s ? sessionLabel(id, s.date, s.slot, true) : 'New dates soon';
    });
    $$('[data-ws-includes]').forEach((el) => {
      const id = el.getAttribute('data-ws-includes');
      if (has(WORKSHOPS, id)) el.innerHTML = WORKSHOPS[id].includes.map((t) => '<li class="flex gap-2.5"><svg viewBox="0 0 24 24" class="mt-0.5 size-5 shrink-0 text-moss" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5L19 7"/></svg><span>' + escapeHtml(t) + '</span></li>').join('');
    });
    function sessions() { return sessionsFor(state.id); }
    function chosen() { return sessions().filter((s) => s.key === state.key)[0] || null; }
    function render(keepFocus) {
      const w = WORKSHOPS[state.id];
      $$('input[name="workshop"]', pick).forEach((r) => { r.checked = r.value === state.id; });
      const all = sessions();
      if (!chosen() || placesLeft(chosen().id, chosen().date, chosen().slot) < 1) {
        const firstOpen = all.filter((s) => placesLeft(s.id, s.date, s.slot) > 0)[0];
        state.key = firstOpen ? firstOpen.key : '';
      }
      list.innerHTML = all.map((s) => {
        const left = placesLeft(s.id, s.date, s.slot);
        return '<label class="option min-w-0 items-center justify-between gap-3 px-4 py-3">' +
          '<input type="radio" name="session" value="' + s.key + '" class="sr-only"' + (left < 1 ? ' disabled' : '') + (s.key === state.key ? ' checked' : '') + '>' +
          '<span class="min-w-0"><span class="block font-semibold">' + escapeHtml(fmtDate(s.date, { month: 'short' })) + '</span>' +
          '<span class="block text-sm text-muted">' + clock(toMins(s.slot)) + '–' + clock(toMins(s.slot) + w.hours * 60) + (w.weeks ? ' · ' + w.weeks + ' weeks' : '') + '</span></span>' +
          '<span class="shrink-0 text-sm font-semibold ' + (left < 1 ? 'text-muted' : left <= 2 ? 'text-clay-deep' : 'text-moss') + '">' + (left < 1 ? 'Full' : left <= 2 ? plural(left, 'spot', 'spots') + ' left' : plural(left, 'spot', 'spots')) + '</span></label>';
      }).join('');
      const s = chosen();
      const left = s ? placesLeft(s.id, s.date, s.slot) : 0;
      const max = Math.min(WORKSHOP_MAX_PLACES, left);
      state.qty = Math.max(1, Math.min(state.qty, max || 1));
      qtyOut.textContent = String(state.qty);
      minus.disabled = state.qty <= 1;
      plusBtn.disabled = state.qty >= max;
      $('#ws-qty-note').textContent = s && state.qty >= max ? (max === WORKSHOP_MAX_PLACES && left > max ? 'Booking for more than ' + WORKSHOP_MAX_PLACES + '? Email us about a private session.' : 'That’s every spot left on this date.') : '';
      $('[data-ws-total]').textContent = price(w.price * state.qty);
      $('[data-ws-summary]').textContent = s ? w.name + ', ' + sessionLabel(s.id, s.date, s.slot) + ', for ' + plural(state.qty, 'person', 'people') + '.' : 'Every listed date is full. New dates are added every week.';
      $('#ws-add').disabled = !s;
      if (!keepFocus) {
        try { history.replaceState(null, '', location.pathname + '?workshop=' + state.id + location.hash); } catch (e) { /* file:// */ }
      }
    }
    pick.addEventListener('change', (e) => { if (has(WORKSHOPS, e.target.value)) { state.id = e.target.value; state.key = ''; render(); } });
    list.addEventListener('change', (e) => { if (e.target.name === 'session') { state.key = e.target.value; render(true); const r = $('input[value="' + state.key + '"]', list); if (r) r.focus(); } });
    minus.addEventListener('click', () => { state.qty--; render(true); });
    plusBtn.addEventListener('click', () => { state.qty++; render(true); if (plusBtn.disabled) minus.focus(); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const s = chosen();
      if (!s || placesLeft(s.id, s.date, s.slot) < state.qty) { render(); return; }
      const res = addToBasket({ kind: 'workshop', id: s.id, date: s.date, slot: s.slot, qty: state.qty });
      if (!res.qty) { toast('You already have ' + WORKSHOP_MAX_PLACES + ' spots on this date in your cart, the most we can book online.'); return; }
      flashButton($('#ws-add'), 'Added to cart');
      popBadge();
      toast('<strong>' + escapeHtml(WORKSHOPS[s.id].name) + '</strong>, ' + escapeHtml(sessionLabel(s.id, s.date, s.slot, true)) + ', ' + plural(res.qty, 'spot', 'spots') + ' in your cart. <a href="basket.html" class="font-semibold underline underline-offset-4">View cart</a>');
      state.qty = 1;
      render(true);
    });
    basketListeners.push(() => render(true));
    render();
    if (has(WORKSHOPS, params.get('workshop'))) {
      const book = $('#book');
      if (book) book.scrollIntoView({ block: 'start' });
    }
  }

  /* ------------------------------------------------------------------
   * 14. Cart page
   * ------------------------------------------------------------------ */
  function lineThumb(l) {
    if (l.kind === 'workshop') {
      return '<span class="grid size-20 shrink-0 place-items-center rounded-2xl bg-kiln text-paper sm:size-24" aria-hidden="true"><svg viewBox="0 0 48 48" class="size-10" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="24" cy="34" rx="16" ry="5"/><path d="M14 33c0-10 4-14 10-14s10 4 10 14"/><path d="M19 19c-1-4 1-8 5-10m5 10c1-3 0-6-3-8"/></svg></span>';
    }
    const p = findProduct(l.id);
    return '<a href="product.html?piece=' + p.id + '&glaze=' + l.glaze + '&size=' + l.size + '" tabindex="-1" aria-hidden="true" class="art block size-20 shrink-0 overflow-hidden rounded-2xl sm:size-24 ' + GLAZES[l.glaze].tile + '">' + potArt(p, l.glaze, l.size) + '</a>';
  }
  function initBasket() {
    const linesBox = $('#basket-lines');
    if (!linesBox) return;
    if (removedSessions.length) {
      const n = $('#basket-notice');
      n.hidden = false;
      n.textContent = listText(removedSessions) + (removedSessions.length === 1 ? ' has' : ' have') + ' passed or closed for booking, so we took ' + (removedSessions.length === 1 ? 'it' : 'them') + ' out of your cart.';
    }
    function render() {
      const n = basketCount();
      $('#basket-empty').hidden = n > 0;
      $('#basket-filled').hidden = n === 0;
      $('[data-basket-heading-count]').textContent = n ? '(' + plural(n, 'item', 'items') + ')' : '';
      if (!n) return;
      linesBox.innerHTML = basket.lines.map((l, i) => {
        const max = l.kind === 'workshop' ? Math.min(WORKSHOP_MAX_PLACES, l.qty + placesLeft(l.id, l.date, l.slot)) : MAX_QTY;
        const name = escapeHtml(lineTitle(l));
        const title = l.kind === 'workshop'
          ? '<a href="workshops.html?workshop=' + l.id + '" class="hover:underline underline-offset-4">' + name + '</a>'
          : '<a href="product.html?piece=' + l.id + '&glaze=' + l.glaze + '&size=' + l.size + '" class="hover:underline underline-offset-4">' + name + '</a>';
        const note = l.kind === 'piece'
          ? (madeToOrder(l) ? '<span class="tag mt-2 bg-clay-tint text-clay-deep"><span class="dot"></span>Made to order, about 3 weeks</span>' : '<span class="tag mt-2 bg-moss-tint text-moss"><span class="dot"></span>Ready to ship</span>')
          : '';
        return '<li class="flex gap-4 py-5 sm:gap-6" data-line="' + escapeHtml(lineKey(l)) + '">' + lineThumb(l) +
          '<div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-4">' +
            '<div class="min-w-0"><h2 class="font-display text-[1.35rem] font-medium leading-tight">' + title + '</h2>' +
            '<p class="mt-1 text-[15px] text-muted">' + escapeHtml(lineDetail(l)) + '</p>' + note + '</div>' +
            '<p class="shrink-0 font-semibold tabular-nums">' + price(lineTotal(l)) + '</p></div>' +
          '<div class="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">' +
            '<div class="stepper" role="group" aria-label="' + (l.kind === 'workshop' ? 'Spots' : 'Quantity') + ' for ' + name + '">' +
              '<button type="button" data-step="-1" data-index="' + i + '" aria-label="One fewer"' + (l.qty <= 1 ? ' disabled' : '') + '>−</button>' +
              '<span class="w-8 text-center font-semibold tabular-nums" aria-live="polite">' + l.qty + '</span>' +
              '<button type="button" data-step="1" data-index="' + i + '" aria-label="One more"' + (l.qty >= max ? ' disabled' : '') + '>+</button></div>' +
            '<button type="button" data-remove data-index="' + i + '" class="text-[15px] font-semibold text-muted underline decoration-ink/25 underline-offset-4 hover:text-clay-deep">Remove<span class="sr-only"> ' + name + '</span></button>' +
            (l.kind === 'piece' && l.qty >= MAX_QTY ? '<p class="w-full text-sm text-muted">' + MAX_QTY + ' is the most we can take online. Email us for a bigger set.</p>' : '') +
            (l.kind === 'workshop' && l.qty >= max ? '<p class="w-full text-sm text-muted">' + (max === WORKSHOP_MAX_PLACES ? WORKSHOP_MAX_PLACES + ' spots is the most we book online.' : 'That’s every spot left on this date.') + '</p>' : '') +
          '</div></div></li>';
      }).join('');
      renderSummary();
    }
    function renderSummary() {
      const hasPieces = pieceLines().length > 0;
      $('#basket-method').hidden = !hasPieces;
      $$('input[name="method"]').forEach((r) => { r.checked = r.value === basket.method; });
      const sub = subtotal(), pieces = piecesSubtotal();
      const charge = deliveryCharge(basket.method, '');
      const mto = pieceLines().some(madeToOrder);
      const left = round2(DELIVERY.freeFrom - pieces);
      $('#basket-summary').innerHTML =
        '<div class="flex justify-between gap-4"><dt>Subtotal</dt><dd class="tabular-nums">' + price(sub) + '</dd></div>' +
        (hasPieces ? '<div class="flex justify-between gap-4"><dt>' + (basket.method === 'collect' ? 'Pickup on Mesquite Street' : 'US shipping') + '</dt><dd class="tabular-nums">' + (charge ? price(charge) : 'Free') + '</dd></div>' : '') +
        '<div class="flex justify-between gap-4 border-t border-ink/15 pt-3 text-lg font-semibold"><dt>Total <span class="block text-sm font-normal text-muted">plus applicable tax</span></dt><dd class="tabular-nums">' + price(round2(sub + charge)) + '</dd></div>';
      const free = $('#basket-free');
      free.hidden = !hasPieces || basket.method === 'collect';
      if (!free.hidden) {
        const pct = Math.min(100, Math.round((pieces / DELIVERY.freeFrom) * 100));
        free.innerHTML = '<p class="text-[15px]">' + (left > 0 ? 'Add <strong>' + price(left) + '</strong> more in pottery for free US shipping.' : '<strong>Free US shipping</strong> on this order.') + '</p>' +
          '<div class="mt-2 h-2 overflow-hidden rounded-full bg-ink/10"><div class="h-full rounded-full bg-moss transition-[width] duration-500" style="width:' + pct + '%"></div></div>';
      }
      $('#basket-when').textContent = !hasPieces ? 'Workshop spots only: nothing to ship.'
        : basket.method === 'collect' ? 'Ready for pickup starting ' + fmtDate(collectFrom(mto)) + ', Thursday to Saturday, 10am to 5pm.'
          : 'Arrives ' + rangeText(arrivalRange(mto, false)) + (mto ? ', once the made-to-order pieces are out of the kiln.' : '.') + ' Alaska and Hawaii: ' + price(DELIVERY.remoteFee) + '.';
    }
    linesBox.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-step], [data-remove]');
      if (!btn) return;
      const i = +btn.getAttribute('data-index');
      const line = basket.lines[i];
      if (!line) return;
      const key = lineKey(line);
      const isRemove = btn.hasAttribute('data-remove');
      const control = isRemove ? '[data-remove]' : '[data-step="' + btn.getAttribute('data-step') + '"]';
      const keys = basket.lines.map(lineKey);
      const next = basket.lines.map((l) => Object.assign({}, l));
      if (isRemove) next.splice(i, 1);
      else next[i].qty = Math.max(1, next[i].qty + +btn.getAttribute('data-step'));
      saveBasket({ lines: next, method: basket.method });
      // Keep keyboard focus: same control on the same line, else the next or previous line.
      const rows = $$('[data-line]', linesBox);
      const find = (k) => rows.filter((r) => r.getAttribute('data-line') === k)[0];
      const row = isRemove ? (find(keys[i + 1]) || find(keys[i - 1])) : find(key);
      let target = row ? $(control, row) : $('#basket-empty a');
      if (target && target.disabled) target = $('[data-step]:not(:disabled)', row) || $('[data-remove]', row);
      if (target) target.focus();
    });
    $('#basket-method').addEventListener('change', (e) => {
      if (e.target.name === 'method') saveBasket({ lines: basket.lines, method: e.target.value === 'collect' ? 'collect' : 'delivery' });
    });
    basketListeners.push(render);
    render();
  }

  /* ------------------------------------------------------------------
   * 15. Checkout: contact, shipping or pickup, order confirmation.
   *     No payment step: connect your payment provider where marked.
   * ------------------------------------------------------------------ */
  function readLastOrder() {
    const o = read(KEYS.lastOrder);
    if (!o || typeof o !== 'object' || Array.isArray(o)) return null;
    if (typeof o.number !== 'string' || !/^VC-\d{5}$/.test(o.number)) return null;
    if (typeof o.summary !== 'string' || typeof o.total !== 'number' || !isFinite(o.total) || o.total < 0) return null;
    return { number: o.number, summary: cleanText(o.summary, 300), total: round2(o.total) };
  }
  function initCheckout() {
    const form = $('#checkout-form');
    if (!form) return;
    let placed = false;
    const pc = $('#c-postcode');
    function method() { return ($('input[name="c-method"]:checked', form) || { value: basket.method }).value === 'collect' ? 'collect' : 'delivery'; }
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
      const hasPieces = pieceLines().length > 0;
      $('#c-fulfilment').hidden = !hasPieces;
      $('#c-address').hidden = !hasPieces || method() === 'collect';
      $('#c-collect-note').hidden = !hasPieces || method() !== 'collect';
      $('#c-attendees').hidden = workshopLines().length === 0;
      const mto = pieceLines().some(madeToOrder);
      $('#c-collect-note').textContent = 'Ready for pickup starting ' + fmtDate(collectFrom(mto)) + ' at ' + SHOP.address + ', Thursday to Saturday, 10am to 5pm. We’ll email when it’s on the shelf.';
      const charge = deliveryCharge(method(), pc.value);
      const pcRes = checkPostcode(pc.value);
      $('#checkout-summary').innerHTML = '<ul class="divide-y divide-line">' + basket.lines.map((l) =>
        '<li class="flex gap-3 py-3">' + (l.kind === 'piece' ? '<span class="art block size-14 shrink-0 overflow-hidden rounded-xl ' + GLAZES[l.glaze].tile + '">' + potArt(findProduct(l.id), l.glaze, l.size) + '</span>' : '<span class="grid size-14 shrink-0 place-items-center rounded-xl bg-kiln text-[11px] font-semibold uppercase tracking-wider text-paper" aria-hidden="true">Class</span>') +
          '<span class="min-w-0 flex-1"><span class="block font-semibold leading-snug">' + (l.qty > 1 && l.kind === 'piece' ? l.qty + ' × ' : '') + escapeHtml(lineTitle(l)) + '</span>' +
          '<span class="block text-sm text-muted">' + escapeHtml(lineDetail(l, true)) + '</span></span>' +
          '<span class="shrink-0 tabular-nums">' + price(lineTotal(l)) + '</span></li>').join('') + '</ul>' +
        '<dl class="mt-3 space-y-2 border-t border-ink/15 pt-3 text-[15px]">' +
          '<div class="flex justify-between gap-4"><dt>Subtotal</dt><dd class="tabular-nums">' + price(subtotal()) + '</dd></div>' +
          (hasPieces ? '<div class="flex justify-between gap-4"><dt>' + (method() === 'collect' ? 'Pickup' : pcRes.valid && pcRes.remote ? 'Shipping (Alaska & Hawaii)' : 'US shipping') + '</dt><dd class="tabular-nums">' + (charge ? price(charge) : 'Free') + '</dd></div>' : '') +
          '<div class="flex justify-between gap-4 text-lg font-semibold"><dt>Total <span class="block text-sm font-normal text-muted">plus applicable tax</span></dt><dd class="tabular-nums">' + price(round2(subtotal() + charge)) + '</dd></div></dl>';
    }
    $$('input[name="c-method"]', form).forEach((r) => { r.checked = r.value === basket.method; });
    form.addEventListener('change', (e) => {
      if (e.target.name === 'c-method') { saveBasket({ lines: basket.lines, method: method() }); render(); }
    });
    pc.addEventListener('input', render);
    pc.addEventListener('change', () => { const r = checkPostcode(pc.value); if (r.valid) pc.value = r.postcode; render(); });
    setupValidation(form, () => {
      const hasPieces = pieceLines().length > 0;
      const m = method();
      const charge = deliveryCharge(m, pc.value);
      const total = round2(subtotal() + charge);
      const number = 'VC-' + String(Math.floor(10000 + Math.random() * 90000));
      const name = cleanText($('#c-name').value, 80);
      const email = cleanText($('#c-email').value, 120);
      const pcRes = checkPostcode(pc.value);
      const mto = pieceLines().some(madeToOrder);
      const parts = [];
      if (hasPieces) parts.push(plural(pieceLines().reduce((t, l) => t + l.qty, 0), 'piece', 'pieces') + (m === 'collect' ? ' for pickup starting ' + shortDate(collectFrom(mto)) : ' to ' + pcRes.postcode + ', arriving ' + shortDate(arrivalRange(mto, pcRes.remote)[0])));
      workshopLines().forEach((l) => parts.push(plural(l.qty, 'spot', 'spots') + ' on the ' + WORKSHOPS[l.id].name.toLowerCase() + ', ' + shortDate(l.date)));
      const summaryText = listText(parts) + '. Total ' + price(total) + ' plus applicable tax.';
      // A real shop sends the order to its backend and takes payment here, before confirming.
      write(KEYS.lastOrder, { number: number, placedAt: new Date().toISOString(), summary: summaryText, total: total });
      const lines = basket.lines.map((l) => '<li class="flex justify-between gap-4 py-2"><span>' + (l.kind === 'piece' && l.qty > 1 ? l.qty + ' × ' : '') + escapeHtml(lineTitle(l)) + ' <span class="text-muted">· ' + escapeHtml(lineDetail(l, true)) + '</span></span><span class="shrink-0 tabular-nums">' + price(lineTotal(l)) + '</span></li>').join('');
      const box = document.createElement('div');
      box.setAttribute('role', 'status');
      box.setAttribute('tabindex', '-1');
      box.className = 'container-x pb-20 focus:outline-none';
      box.innerHTML = '<div class="grid gap-10 rounded-[2rem] bg-moss-tint p-6 sm:p-10 lg:grid-cols-12">' +
        '<div class="lg:col-span-7"><p class="kicker text-moss">Order ' + escapeHtml(number) + '</p>' +
        '<h2 class="display mt-3 text-[2.6rem] sm:text-[3.4rem]">Thank you, ' + escapeHtml(name.split(/\s+/)[0]) + '.</h2>' +
        '<p class="mt-4 max-w-xl text-lg leading-relaxed">' +
          (hasPieces ? (m === 'collect' ? 'Your pottery will be ready for pickup starting ' + escapeHtml(fmtDate(collectFrom(mto))) + ' at 228 N Mesquite Street.' : 'Your pottery should arrive ' + escapeHtml(rangeText(arrivalRange(mto, pcRes.remote))) + ', wrapped in paper and wool, never plastic.') : '') +
          (workshopLines().length ? ' We’ll see you at the studio for your workshop: come ten minutes early and wear something you don’t mind getting clay on.' : '') + '</p>' +
        '<p class="mt-4 max-w-xl leading-relaxed text-muted">Your order number is ' + escapeHtml(number) + '. Mention it if you need to get in touch at ' + escapeHtml(SHOP.email) + '; we’ll use ' + escapeHtml(email) + ' for any questions about your order.</p>' +
        '<a href="shop.html" class="btn-primary mt-7">Back to the shop</a></div>' +
        '<div class="lg:col-span-5"><h3 class="font-semibold">Order summary</h3><ul class="mt-2 divide-y divide-ink/10 text-[15px]">' + lines + '</ul>' +
        '<p class="mt-2 flex justify-between border-t border-ink/20 pt-3 text-lg font-semibold"><span>Total <span class="block text-sm font-normal text-muted">plus applicable tax</span></span><span class="tabular-nums">' + price(total) + '</span></p></div></div>';
      placed = true;
      $('#checkout-main').replaceWith(box);
      $('[data-checkout-heading]').textContent = 'Order placed';
      box.focus();
      window.scrollTo(0, 0);
      saveBasket({ lines: [], method: basket.method });
    });
    basketListeners.push(render);
    render();
  }

  /* ------------------------------------------------------------------
   * 16. Visit, care and studio pages
   * ------------------------------------------------------------------ */
  function renderHours() {
    $$('[data-hours]').forEach((table) => {
      const today = shopNow();
      // The next seven days from today, so kiln-opening Saturdays and closures show.
      let html = '';
      for (let i = 0; i < 7; i++) {
        const d = addDays(today.date, i);
        const h = hoursOn(d);
        html += '<tr class="border-b border-line' + (i === 0 ? ' font-semibold' : '') + '">' +
          '<th scope="row" class="py-2.5 pr-4 text-left font-[inherit]">' + DAY_NAMES[dayOf(d)] + (i === 0 ? ' <span class="text-muted">(today)</span>' : '') + '</th>' +
          '<td class="py-2.5 text-right tabular-nums">' + (h ? clock(toMins(h[0])) + ' – ' + clock(toMins(h[1])) + (isKilnOpening(d) ? '<span class="block text-sm font-normal text-clay-deep">Kiln opening</span>' : '') : isClosedDate(d) ? 'Closed for the holiday' : 'Closed') + '</td></tr>';
      }
      table.innerHTML = html;
    });
    $$('[data-kiln-list]').forEach((el) => {
      el.innerHTML = kilnOpenings(4).map((d, i) => '<li class="flex items-center justify-between gap-4 py-3' + (i ? ' border-t border-line' : '') + '"><span class="font-semibold">' + escapeHtml(fmtDate(d)) + '</span><span class="text-sm text-muted">' + clock(toMins(hoursOn(d)[0])) + ' – ' + clock(toMins(hoursOn(d)[1])) + '</span></li>').join('');
    });
  }
  function renderGlazeGuide() {
    $$('[data-glaze-guide]').forEach((el) => {
      el.innerHTML = GLAZE_ORDER.map((id) => {
        const g = GLAZES[id];
        const p = PRODUCTS.filter((x) => x.glazes.indexOf(id) !== -1 && x.shape === 'bowl')[0] || PRODUCTS.filter((x) => x.glazes.indexOf(id) !== -1)[0];
        return '<li class="flex flex-col overflow-hidden rounded-[1.5rem] bg-white/50 ring-1 ring-line">' +
          '<div class="art aspect-[6/4] ' + g.tile + '"><div class="h-full px-[10%] pt-[4%]">' + potArt(p, id, p.sizes[p.sizes.length - 1].id) + '</div></div>' +
          '<div class="flex flex-1 flex-col p-5"><h3 class="font-display text-[1.45rem] font-medium">' + g.name + '</h3>' +
          '<p class="mt-1.5 text-[15px] leading-relaxed text-muted">' + escapeHtml(g.note) + '</p>' +
          '<p class="mt-auto pt-4 text-sm font-semibold">' + (g.dishwasher ? 'Dishwasher safe' : 'Hand wash') + ' · Microwave safe</p>' +
          '<a class="link mt-3 text-[15px]" href="shop.html?glaze=' + id + '">Pieces in ' + g.name.toLowerCase() + '</a></div></li>';
      }).join('');
    });
    $$('[data-delivery-table]').forEach((el) => {
      const mto = arrivalRange(true, false);
      const ready = arrivalRange(false, false);
      el.innerHTML =
        '<tr class="border-b border-line"><th scope="row" class="py-3 pr-4 text-left align-top font-semibold">Lower 48 states</th><td class="py-3 pr-4 align-top">' + price(DELIVERY.fee) + ', free on pottery over ' + price(DELIVERY.freeFrom) + '</td><td class="py-3 align-top">Order today: ' + escapeHtml(rangeText(ready)) + '</td></tr>' +
        '<tr class="border-b border-line"><th scope="row" class="py-3 pr-4 text-left align-top font-semibold">Alaska and Hawaii</th><td class="py-3 pr-4 align-top">' + price(DELIVERY.remoteFee) + '</td><td class="py-3 align-top">Up to three business days longer</td></tr>' +
        '<tr class="border-b border-line"><th scope="row" class="py-3 pr-4 text-left align-top font-semibold">Pick up on Mesquite Street</th><td class="py-3 pr-4 align-top">Free</td><td class="py-3 align-top">From ' + escapeHtml(fmtDate(collectFrom(false))) + '</td></tr>' +
        '<tr><th scope="row" class="py-3 pr-4 text-left align-top font-semibold">Made-to-order pieces</th><td class="py-3 pr-4 align-top">As above</td><td class="py-3 align-top">Order today: ' + escapeHtml(rangeText(mto)) + '</td></tr>';
    });
  }

  /* ------------------------------------------------------------------
   * 17. Forms and boot
   * ------------------------------------------------------------------ */
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
      if (!/^[+()\d\s.-]+$/.test(v) || digits.length < 10 || digits.length > 13) return 'Enter a phone number like (575) 555-0123.';
    }
    if (rule === 'postcode') {
      const res = checkPostcode(v);
      if (!res.valid) return 'Enter a ZIP code like 88001.';
      if (res.blocked) return 'We can’t ship pottery to ' + res.blocked + ' yet. Email ' + SHOP.email + ' and we’ll find a way.';
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
    return el.matches('input, select, textarea') && el.type !== 'radio' && el.type !== 'hidden' && el.type !== 'submit' && !!el.id && !el.hasAttribute('data-no-validate');
  }
  function fieldsOf(root) {
    return $$('input, select, textarea', root).filter((el) => isField(el) && !el.closest('[hidden]'));
  }
  function validate(form) {
    let firstBad = null;
    fieldsOf(form).forEach((el) => {
      const msg = fieldMessage(el);
      showError(el, msg);
      if (msg && !firstBad) firstBad = el;
    });
    // Fields inside a hidden section don't count: clear their errors.
    $$('[hidden] .field', form).forEach((el) => { if (el.id && el.hasAttribute('aria-invalid')) showError(el, ''); });
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
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validate(form)) onValid(form);
    });
  }
  function successSwap(form, html, dark) {
    const box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.className = dark ? 'rounded-2xl bg-paper/10 p-5 text-paper focus:outline-none' : 'rounded-[1.5rem] bg-moss-tint p-6 text-ink focus:outline-none sm:p-8';
    box.innerHTML = html;
    form.replaceWith(box);
    box.focus();
  }

  // To connect a form: replace successSwap(...) below with a fetch() to your form service, e.g.
  // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  //   .then((r) => r.ok ? successSwap(form, '…') : alert('Sorry, that didn’t send.'));
  function initForms() {
    $$('[data-form="newsletter"]').forEach((form) => setupValidation(form, () => {
      successSwap(form, '<p class="font-display text-xl font-medium">You’re on the kiln list.</p><p class="mt-1 text-sm text-paper/85">One short email a month, the week before each kiln opening.</p>', true);
    }));
    $$('[data-form="contact"]').forEach((form) => {
      const topic = $('#ct-topic', form);
      const showFor = () => $$('[data-show-for]', form).forEach((el) => { el.hidden = el.getAttribute('data-show-for').split(' ').indexOf(topic.value) === -1; });
      topic.addEventListener('change', showFor);
      showFor();
      setupValidation(form, () => {
        const first = cleanText($('#ct-name').value, 80).split(/\s+/)[0];
        successSwap(form, '<p class="display text-[2.2rem]">Thank you, ' + escapeHtml(first) + '.</p>' +
          '<p class="mt-3 max-w-lg text-lg leading-relaxed">We read every message ourselves, between kiln firings, and reply within two business days. If it’s about an order, have your order number handy.</p>');
      });
    });
    // Live character counters: <textarea id="x" maxlength="600"> + <p data-count-for="x">.
    $$('[data-count-for]').forEach((out) => {
      const field = document.getElementById(out.getAttribute('data-count-for'));
      if (!field) return;
      const upd = () => { out.textContent = plural(field.maxLength - field.value.length, 'character', 'characters') + ' left'; };
      field.addEventListener('input', upd);
      upd();
    });
  }

  $$('[data-year]').forEach((el) => { el.textContent = shopNow().date.slice(0, 4); });
  $$('[data-broken-art]').forEach((el) => { el.innerHTML = brokenArt(); });
  // <div data-art="piece-id" data-glaze="cobalt" data-size="large"> → that piece's drawing.
  $$('[data-art]').forEach((el) => {
    const p = findProduct(el.getAttribute('data-art'));
    if (p) el.innerHTML = potArt(p, el.getAttribute('data-glaze'), el.getAttribute('data-size'));
  });
  renderStatus();
  setInterval(renderStatus, 30000);
  renderHours();
  renderGlazeGuide();
  renderBasketLinks();
  basketListeners.push(renderBasketLinks);
  initForms();
  const page = document.body.getAttribute('data-page');
  if (page === 'home') initHome();
  if (page === 'shop') initShop();
  if (page === 'product') initProduct();
  if (page === 'workshops') initWorkshops();
  if (page === 'basket') initBasket();
  if (page === 'checkout') initCheckout();
  reveal(document);
})();



/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It lifts itself above toasts so they never overlap, and
   steps aside while an in-page "Back to top" link (e.g. in a footer) is on screen.
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
