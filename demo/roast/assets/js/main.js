/* First Crack Coffee — shop script
 * Vanilla JavaScript, no dependencies. Sections:
 *  1. Catalog and store settings   7. Shop page            13. Wholesale estimator
 *  2. Helpers                        8. Product page         14. Forms
 *  3. Bag and bean artwork           9. Subscription builder 15. Boot
 *  4. Cart (localStorage)           10. Checkout
 *  5. Cart drawer and toast         11. Brew guides
 *  6. Header, menu and reveal       12. Home page
 */
document.documentElement.classList.add('js');

(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Catalog and store settings — edit, add or remove coffees here.
   *    origin, roast and process use the keys of ORIGINS, ROASTS and
   *    PROCESSES. price is the 12 oz price in dollars; other sizes are
   *    worked out from SIZES. profile values run from 1 to 5.
   * ------------------------------------------------------------------ */
  const COFFEES = [
    {
      id: 'kochere', name: 'Kochere Lot 7', origin: 'ethiopia', region: 'Yirgacheffe, Gedeo zone',
      process: 'washed', roast: 'light', price: 21, rating: 4.9, reviews: 312, badge: 'New harvest', featured: 1,
      notes: ['Jasmine', 'Bergamot', 'White peach'], profile: { acidity: 5, sweetness: 4, body: 2 },
      producer: 'Worka Sakaro washing station', altitude: '1,950–2,150 m', variety: 'Ethiopian landraces', harvest: 'December 2025',
      bag: '#f4a6c4', brew: 'v60',
      blurb: 'Tea-like and floral, with a long peach finish. The coffee that turns people into pour-over people.'
    },
    {
      id: 'hambela', name: 'Hambela Natural', origin: 'ethiopia', region: 'Guji, Oromia',
      process: 'natural', roast: 'light', price: 22, rating: 4.8, reviews: 198, featured: 2,
      notes: ['Blueberry', 'Dark chocolate', 'Rose'], profile: { acidity: 4, sweetness: 5, body: 3 },
      producer: 'Dimtu Tero smallholders', altitude: '2,000–2,250 m', variety: 'Ethiopian landraces', harvest: 'January 2026',
      bag: '#8b6be0', brew: 'aeropress',
      blurb: 'Dried for four weeks on raised beds, so the fruit stays loud: blueberry jam, cocoa and a hint of rose.'
    },
    {
      id: 'gatomboya', name: 'Gatomboya AA', origin: 'kenya', region: 'Nyeri',
      process: 'washed', roast: 'light', price: 24, rating: 4.9, reviews: 141, featured: 3,
      notes: ['Blackcurrant', 'Grapefruit', 'Cane sugar'], profile: { acidity: 5, sweetness: 3, body: 3 },
      producer: 'Gatomboya cooperative factory', altitude: '1,700–1,850 m', variety: 'SL28, SL34, Ruiru 11', harvest: 'November 2025',
      bag: '#e0522f', brew: 'v60',
      blurb: 'Juicy and bright, like a glass of blackcurrant cordial. Our tasting table argued over this one for an hour.'
    },
    {
      id: 'kanzu', name: 'Kanzu Hill Honey', origin: 'rwanda', region: 'Nyamasheke, Western Province',
      process: 'honey', roast: 'light', price: 23, rating: 4.7, reviews: 86,
      notes: ['Red grape', 'Hibiscus', 'Honey'], profile: { acidity: 4, sweetness: 4, body: 3 },
      producer: 'Kanzu washing station', altitude: '1,800–2,000 m', variety: 'Red Bourbon', harvest: 'May 2026',
      bag: '#ff9b5c', brew: 'aeropress',
      blurb: 'Dried with some of the sticky fruit left on, which gives it a round, syrupy sweetness and a red-grape snap.'
    },
    {
      id: 'esperanza', name: 'La Esperanza', origin: 'colombia', region: 'Pitalito, Huila',
      process: 'washed', roast: 'medium', price: 19, rating: 4.8, reviews: 427, badge: 'Bestseller', featured: 4,
      notes: ['Red apple', 'Caramel', 'Cocoa nib'], profile: { acidity: 3, sweetness: 4, body: 3 },
      producer: 'Marleny Ortiz and family', altitude: '1,650 m', variety: 'Caturra, Castillo', harvest: 'June 2026',
      bag: '#f2b630', brew: 'french',
      blurb: 'Our everyday coffee, from a family farm we have bought from for six harvests. Sweet, easy, never boring.'
    },
    {
      id: 'arrieros', name: 'Los Arrieros', origin: 'guatemala', region: 'Huehuetenango',
      process: 'washed', roast: 'medium', price: 19, rating: 4.7, reviews: 164,
      notes: ['Brown sugar', 'Orange', 'Almond'], profile: { acidity: 3, sweetness: 4, body: 4 },
      producer: 'Asociación Los Arrieros', altitude: '1,750–1,900 m', variety: 'Bourbon, Caturra', harvest: 'March 2026',
      bag: '#3f9a63', brew: 'moka',
      blurb: 'Grown high near the Mexican border. Marzipan and orange peel in the cup, and great with milk.'
    },
    {
      id: 'marcala', name: 'Marcala Anaerobic', origin: 'honduras', region: 'Marcala, La Paz',
      process: 'anaerobic', roast: 'medium', price: 26, rating: 4.6, reviews: 58, badge: 'Limited',
      notes: ['Pineapple', 'Dark rum', 'Cacao'], profile: { acidity: 3, sweetness: 5, body: 4 },
      producer: 'Finca El Cerrito, Ana Lucía Mejía', altitude: '1,600 m', variety: 'Parainema', harvest: 'February 2026',
      bag: '#1f7f91', brew: 'cold',
      blurb: 'Cherries fermented in sealed tanks for 96 hours before drying. Wild, tropical and very good over ice.'
    },
    {
      id: 'cauca-decaf', name: 'Cauca Decaf', origin: 'colombia', region: 'Inzá, Cauca',
      process: 'decaf', roast: 'medium', price: 18, rating: 4.8, reviews: 233,
      notes: ['Milk chocolate', 'Plum', 'Toffee'], profile: { acidity: 2, sweetness: 4, body: 4 },
      producer: 'Asorcafé growers', altitude: '1,750 m', variety: 'Castillo, Colombia', harvest: 'May 2026',
      bag: '#93d3c6', brew: 'french',
      blurb: 'Decaffeinated with sugarcane ethyl acetate, which keeps the sweetness. Nobody guesses it is decaf.'
    },
    {
      id: 'cerrado', name: 'Cerrado Pulp', origin: 'brazil', region: 'Patrocínio, Cerrado Mineiro',
      process: 'natural', roast: 'dark', price: 16, rating: 4.6, reviews: 175,
      notes: ['Hazelnut', 'Dark chocolate', 'Molasses'], profile: { acidity: 1, sweetness: 4, body: 5 },
      producer: 'Fazenda Santa Rita', altitude: '1,100 m', variety: 'Yellow Catuaí', harvest: 'August 2025',
      bag: '#7a4530', brew: 'moka',
      blurb: 'Low acidity, big body and a chocolate-hazelnut finish. Built for moka pots and milky mornings.'
    },
    {
      id: 'night-shift', name: 'Night Shift Espresso', origin: 'blend', region: 'Brazil and Colombia',
      process: 'natural', roast: 'dark', price: 17, rating: 4.9, reviews: 506, badge: 'House espresso',
      notes: ['Dark cherry', 'Cola', 'Brown butter'], profile: { acidity: 2, sweetness: 4, body: 5 },
      producer: 'Fazenda Santa Rita and Marleny Ortiz', altitude: '1,100–1,650 m', variety: 'Catuaí, Caturra', harvest: 'Rotates by season',
      bag: '#1c2147', brew: 'espresso',
      blurb: 'The espresso we pour in our own café. Syrupy on its own and cuts cleanly through a flat white.'
    }
  ];

  const ORIGINS = {
    ethiopia: 'Ethiopia', kenya: 'Kenya', rwanda: 'Rwanda', colombia: 'Colombia',
    guatemala: 'Guatemala', honduras: 'Honduras', brazil: 'Brazil', blend: 'Blend'
  };
  const ROASTS = { light: 'Light', medium: 'Medium', dark: 'Dark' };
  const PROCESSES = { washed: 'Washed', natural: 'Natural', honey: 'Honey', anaerobic: 'Anaerobic', decaf: 'Decaf' };

  // Bag sizes: price = 12 oz price × factor, rounded to whole dollars.
  const SIZES = [
    { id: '250g', label: '12 oz', grams: 340, factor: 1 },
    { id: '500g', label: '2 lb', grams: 907, factor: 2.4 },
    { id: '1kg', label: '5 lb', grams: 2268, factor: 5.2 }
  ];
  const GRINDS = [
    { id: 'whole', label: 'Whole bean' },
    { id: 'espresso', label: 'Espresso' },
    { id: 'moka', label: 'Moka pot' },
    { id: 'filter', label: 'Pour-over' },
    { id: 'french', label: 'French press' },
    { id: 'cold', label: 'Cold brew' }
  ];

  const FREE_SHIPPING = 45;
  const SHIPPING = {
    standard: { label: 'Standard', note: '2–4 business days', price: 6 },
    express: { label: 'Express', note: 'Next business day', price: 12 },
    pickup: { label: 'Pick up at the roastery', note: 'Ready the day after roasting', price: 0 }
  };
  const MAX_QTY = 20;

  // Subscription styles: price is the 12 oz price before the subscriber discount.
  const STYLES = [
    { id: 'bright', name: 'Bright & floral', price: 20, desc: 'Light roasts from East Africa: tea-like, fruity, aromatic.', example: 'Like Kochere Lot 7' },
    { id: 'balanced', name: 'Sweet & balanced', price: 18, desc: 'Medium roasts from Latin America: caramel, apple, cocoa.', example: 'Like La Esperanza' },
    { id: 'rich', name: 'Rich & chocolatey', price: 16, desc: 'Darker roasts with low acidity and plenty of body.', example: 'Like Cerrado Pulp' },
    { id: 'decaf', name: 'Decaf', price: 18, desc: 'Sugarcane-process decaf that still tastes like coffee.', example: 'Like Cauca Decaf' },
    { id: 'roasters', name: 'Roaster’s choice', price: 21, desc: 'A different single origin every time, picked by our roasters.', example: 'Rotates every delivery' }
  ];
  const SUB_DISCOUNT = 0.1;    // 10% off shop prices
  const DOSE = 15;             // grams of coffee per cup, for "price per cup"
  const FREQUENCIES = [1, 2, 3, 4]; // weeks between deliveries
  const MAX_BAGS = 4;
  const ROAST_DAY = 1;         // Monday (0 = Sunday)
  const DELIVERY_LAG = 3;      // days from roasting to the door (Thursday)

  // Brew methods: ratio is grams of water per gram of coffee; cup is milliliters per cup.
  const METHODS = {
    v60: { name: 'V60 pour-over', ratio: 16, cup: 250, grind: 'Medium-fine, like table salt', temp: '201 °F', time: '3:00' },
    aeropress: { name: 'AeroPress', ratio: 14, cup: 200, grind: 'Fine, like superfine sugar', temp: '190 °F', time: '2:00' },
    french: { name: 'French press', ratio: 15, cup: 250, grind: 'Coarse, like sea salt', temp: '205 °F', time: '8:00' },
    moka: { name: 'Moka pot', ratio: 10, cup: 100, grind: 'Fine, a little coarser than espresso', temp: 'Hot from the kettle', time: '5:00' },
    cold: { name: 'Cold brew', ratio: 8, cup: 200, grind: 'Very coarse, like breadcrumbs', temp: 'Room temperature, then fridge', time: '16 h' },
    espresso: { name: 'Espresso', ratio: 2, cup: 36, grind: 'Espresso fine', temp: '200 °F', time: '0:28' }
  };

  const CART_KEY = 'firstcrack-cart';
  const PLAN_KEY = 'firstcrack-plan';

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
  const fmt = (n) => money.format(n);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  // localStorage, or an in-memory stand-in when the browser blocks it (a sandboxed iframe, strict
  // privacy settings): saved state then lasts for this page view instead of the feature doing nothing.
  var safeStorage = (function () {
    var local = null;
    try { local = window.localStorage; local.getItem('_'); } catch (e) { local = null; /* blocked */ }
    // A save that fails (storage full) stays in memory, and memory is read first, so the change isn't lost.
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

  function read(key) {
    try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; }
  }
  function write(key, value) {
    try {
      if (value === null) safeStorage.removeItem(key);
      else safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage full or blocked: the page keeps working without it */ }
  }
  // Case-insensitive lookup of one of our own keys; anything else gives null.
  function ownKey(value, keys) {
    if (typeof value !== 'string') return null;
    const v = value.trim().toLowerCase();
    return keys.indexOf(v) === -1 ? null : v;
  }
  // A whole number between min and max, or `fallback` when the value isn't a number.
  function wholeNumber(value, min, max, fallback) {
    const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
    return isFinite(n) ? Math.min(max, Math.max(min, Math.floor(n))) : fallback;
  }
  // The page's URL parameters with lower-case names, so ?ID= and ?id= both work.
  function urlParams() {
    const out = new URLSearchParams();
    new URLSearchParams(location.search).forEach((v, k) => out.append(k.toLowerCase(), v));
    return out;
  }
  function findCoffee(id) {
    const key = ownKey(id, COFFEES.map((c) => c.id));
    return key ? COFFEES.find((c) => c.id === key) : null;
  }
  const findSize = (id) => SIZES.find((s) => s.id === id) || null;
  const findGrind = (id) => GRINDS.find((g) => g.id === id) || null;
  function unitPrice(coffee, sizeId) {
    const size = findSize(sizeId) || SIZES[0];
    return Math.round(coffee.price * size.factor);
  }
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : many);
  function roastMeter(roast) {
    const level = Object.keys(ROASTS).indexOf(roast) + 1;
    let dots = '';
    for (let i = 1; i <= 3; i++) {
      dots += '<span class="size-2.5 rounded-full border-2 border-navy ' + (i <= level ? 'bg-navy' : 'bg-transparent') + '"></span>';
    }
    return '<span class="inline-flex items-center gap-1" role="img" aria-label="' + ROASTS[roast] + ' roast">' + dots + '</span>';
  }

  /* ------------------------------------------------------------------
   * 3. Bag and bean artwork — every product "photo" is drawn here.
   *    art(coffee, view) → SVG string. Views: 0 bag, 1 beans.
   * ------------------------------------------------------------------ */
  let uid = 0;
  function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function shade(hex, amt) {
    const c = hexToRgb(hex).map((v) => Math.round(amt < 0 ? v * (1 + amt) : v + (255 - v) * amt));
    return '#' + c.map((v) => ('0' + v.toString(16)).slice(-2)).join('');
  }
  function isLight(hex) {
    const c = hexToRgb(hex);
    return (c[0] * 299 + c[1] * 587 + c[2] * 114) / 1000 > 150;
  }
  function seeded(seed) {
    let h = 0;
    for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
    return function () {
      h = (h * 1103515245 + 12345) & 0x7fffffff;
      return h / 0x7fffffff;
    };
  }
  const BEAN_COLORS = { light: '#a86a3d', medium: '#7b4527', dark: '#3e2417' };

  function roastMark(roast, x, y, color) {
    if (roast === 'light') {
      let rays = '';
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        rays += '<path d="M' + (x + Math.cos(a) * 24).toFixed(1) + ' ' + (y + Math.sin(a) * 24).toFixed(1) + 'L' + (x + Math.cos(a) * 33).toFixed(1) + ' ' + (y + Math.sin(a) * 33).toFixed(1) + '" stroke="' + color + '" stroke-width="4" stroke-linecap="round"/>';
      }
      return '<circle cx="' + x + '" cy="' + y + '" r="17" fill="' + color + '"/>' + rays;
    }
    if (roast === 'medium') {
      let waves = '';
      for (let i = 0; i < 3; i++) {
        const yy = y - 14 + i * 14;
        waves += '<path d="M' + (x - 34) + ' ' + yy + ' q8.5 -9 17 0 t17 0 t17 0 t17 0" fill="none" stroke="' + color + '" stroke-width="5" stroke-linecap="round"/>';
      }
      return waves;
    }
    return '<path d="M' + (x + 6) + ' ' + (y - 30) + ' a30 30 0 1 0 22 46 a24 24 0 1 1 -22 -46z" fill="' + color + '"/>' +
      '<circle cx="' + (x + 24) + '" cy="' + (y - 18) + '" r="3.5" fill="' + color + '"/><circle cx="' + (x + 33) + '" cy="' + (y - 3) + '" r="2.5" fill="' + color + '"/>';
  }

  function bean(cx, cy, rot, size, color) {
    const crack = shade(color, -0.45);
    return '<g transform="translate(' + cx.toFixed(1) + ' ' + cy.toFixed(1) + ') rotate(' + rot.toFixed(0) + ') scale(' + size.toFixed(2) + ')">' +
      '<ellipse rx="22" ry="15" fill="' + color + '"/>' +
      '<ellipse rx="22" ry="15" fill="url(#bean-shine)" />' +
      '<path d="M-17 1 C-8 -7 8 9 17 -1" fill="none" stroke="' + crack + '" stroke-width="3.2" stroke-linecap="round"/></g>';
  }

  function art(coffee, view) {
    const id = 'fc' + (++uid);
    const bg = shade(coffee.bag, 0.72);
    const ink = '#141a3c';
    let s = '<rect width="400" height="500" fill="' + bg + '"/>';

    if (view === 1) {
      const rand = seeded(coffee.id);
      const color = BEAN_COLORS[coffee.roast];
      s += '<defs><radialGradient id="bean-shine" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>';
      s += '<circle cx="200" cy="250" r="150" fill="' + shade(coffee.bag, 0.45) + '"/>';
      for (let i = 0; i < 46; i++) {
        const a = rand() * Math.PI * 2;
        const d = Math.sqrt(rand()) * 175;
        s += bean(200 + Math.cos(a) * d, 250 + Math.sin(a) * d * 1.15, rand() * 360, 0.75 + rand() * 0.45, shade(color, (rand() - 0.5) * 0.25));
      }
      return '<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
        escapeHtml(ROASTS[coffee.roast] + ' roasted beans of ' + coffee.name) + '" preserveAspectRatio="xMidYMid slice">' + s.replace(/bean-shine/g, id + 's') + '</svg>';
    }

    const body = coffee.bag;
    const dark = shade(body, -0.28);
    const light = shade(body, 0.3);
    const labelInk = ink;
    s += '<defs><linearGradient id="' + id + 'g" x1="0" x2="1">' +
      '<stop offset="0" stop-color="' + dark + '"/><stop offset=".22" stop-color="' + body + '"/>' +
      '<stop offset=".5" stop-color="' + light + '"/><stop offset=".78" stop-color="' + body + '"/>' +
      '<stop offset="1" stop-color="' + dark + '"/></linearGradient></defs>';
    // Floor shadow, then the pouch: a crimped top band, a gusseted body and a one-way valve.
    s += '<ellipse cx="200" cy="452" rx="128" ry="14" fill="' + ink + '" opacity=".14"/>';
    s += '<path d="M104 92 L296 92 L306 420 Q307 446 280 446 L120 446 Q93 446 94 420 Z" fill="url(#' + id + 'g)" stroke="' + ink + '" stroke-width="4" stroke-linejoin="round"/>';
    s += '<path d="M104 64 L296 64 L296 96 L104 96 Z" fill="' + dark + '" stroke="' + ink + '" stroke-width="4" stroke-linejoin="round"/>';
    let teeth = 'M104 64';
    for (let x = 104; x < 296; x += 12) teeth += ' L' + (x + 6) + ' 56 L' + (x + 12) + ' 64';
    s += '<path d="' + teeth + ' Z" fill="' + dark + '" stroke="' + ink + '" stroke-width="3" stroke-linejoin="round"/>';
    s += '<path d="M112 80 L288 80" stroke="' + ink + '" stroke-width="2" stroke-dasharray="6 6" opacity=".55"/>';
    s += '<circle cx="200" cy="130" r="12" fill="' + light + '" stroke="' + ink + '" stroke-width="3"/><circle cx="200" cy="130" r="4" fill="' + ink + '"/>';
    // Label.
    s += '<rect x="128" y="168" width="144" height="222" rx="18" fill="#fffcf4" stroke="' + ink + '" stroke-width="4"/>';
    s += roastMark(coffee.roast, 200, 226, isLight(body) ? shade(body, -0.35) : body);
    s += '<text x="200" y="292" text-anchor="middle" font-family="Unbounded, system-ui, sans-serif" font-size="15" font-weight="700" fill="' + labelInk + '" letter-spacing="1">' +
      escapeHtml(ORIGINS[coffee.origin].toUpperCase()) + '</text>';
    s += '<path d="M150 306 L250 306" stroke="' + labelInk + '" stroke-width="2"/>';
    s += '<text x="200" y="330" text-anchor="middle" font-family="Onest, system-ui, sans-serif" font-size="13" font-weight="600" fill="' + labelInk + '">' +
      escapeHtml(PROCESSES[coffee.process]) + ' · ' + escapeHtml(ROASTS[coffee.roast]) + '</text>';
    const level = Object.keys(ROASTS).indexOf(coffee.roast) + 1;
    for (let i = 1; i <= 3; i++) {
      s += '<circle cx="' + (176 + (i - 1) * 24) + '" cy="360" r="7" fill="' + (i <= level ? labelInk : 'none') + '" stroke="' + labelInk + '" stroke-width="3"/>';
    }
    return '<svg viewBox="0 0 400 500" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' +
      escapeHtml('Bag of ' + coffee.name + ', ' + ORIGINS[coffee.origin]) + '" preserveAspectRatio="xMidYMid slice">' + s + '</svg>';
  }

  // <div data-art="coffee-id" data-view="1"> → artwork (decorative when data-decorative is set).
  function hydrateArt(root) {
    $$('[data-art]', root).forEach((el) => {
      const c = findCoffee(el.getAttribute('data-art'));
      if (!c) return;
      el.innerHTML = art(c, +(el.getAttribute('data-view') || 0));
      if (el.hasAttribute('data-decorative')) {
        const svg = $('svg', el);
        svg.removeAttribute('role');
        svg.removeAttribute('aria-label');
        svg.setAttribute('aria-hidden', 'true');
      }
    });
  }

  // Product card, shared by the home page, shop and related coffees.
  function coffeeCard(c) {
    const badge = c.badge ? '<span class="sticker absolute left-3 top-3 z-10">' + escapeHtml(c.badge) + '</span>' : '';
    return '' +
      '<article class="reveal group flex flex-col">' +
        '<a href="product.html?id=' + c.id + '" class="art relative block aspect-[4/5] overflow-hidden rounded-3xl border-2 border-navy transition duration-300 group-hover:-translate-y-1 group-hover:shadow-[5px_5px_0_var(--color-navy)]">' +
          badge + art(c, 0) +
          '<span class="sr-only">' + escapeHtml(c.name) + '</span>' +
        '</a>' +
        '<div class="mt-4 flex items-start justify-between gap-3">' +
          '<div class="min-w-0">' +
            '<p class="text-xs font-semibold uppercase tracking-[0.14em] text-muted">' + escapeHtml(ORIGINS[c.origin] + ' · ' + PROCESSES[c.process]) + '</p>' +
            '<h3 class="mt-1.5 font-display text-base font-semibold leading-snug"><a href="product.html?id=' + c.id + '" class="hover:text-cobalt">' + escapeHtml(c.name) + '</a></h3>' +
          '</div>' +
          '<p class="shrink-0 font-semibold tabular-nums">' + fmt(c.price) + '</p>' +
        '</div>' +
        '<p class="mt-1.5 text-sm text-muted">' + escapeHtml(c.notes.join(' · ')) + '</p>' +
        '<div class="mt-4 flex items-center justify-between gap-3">' +
          roastMeter(c.roast) +
          '<button type="button" data-add="' + c.id + '" class="rounded-full border-2 border-navy px-3.5 py-1.5 text-xs font-semibold transition hover:bg-navy hover:text-butter">Add 12 oz<span class="sr-only"> of ' + escapeHtml(c.name) + '</span></button>' +
        '</div>' +
      '</article>';
  }

  /* ------------------------------------------------------------------
   * 4. Cart — stored in localStorage as [{ id, size, grind, qty }]
   * ------------------------------------------------------------------ */
  // Whole quantity from 1 to MAX_QTY, or null when the value isn't usable.
  function clampQty(value) {
    const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
    if (!isFinite(n)) return null;
    const whole = Math.floor(n);
    return whole < 1 ? null : Math.min(MAX_QTY, whole);
  }
  // Turn whatever is in storage into a valid cart: our own coffees, sizes and grinds, whole
  // quantities. Anything else is dropped and duplicate lines are merged. Prices are never
  // stored; totals always come from COFFEES.
  function normalizeCart(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    const byKey = {};
    raw.forEach((entry) => {
      if (!entry || typeof entry !== 'object') return;
      const c = findCoffee(entry.id);
      const qty = clampQty(entry.qty);
      if (!c || qty === null) return;
      const size = ownKey(entry.size, SIZES.map((s) => s.id)) || SIZES[0].id;
      const grind = ownKey(entry.grind, GRINDS.map((g) => g.id)) || GRINDS[0].id;
      const key = c.id + ':' + size + ':' + grind;
      if (byKey[key]) byKey[key].qty = Math.min(MAX_QTY, byKey[key].qty + qty);
      else { byKey[key] = { id: c.id, size: size, grind: grind, qty: qty }; out.push(byKey[key]); }
    });
    return out;
  }

  const Cart = {
    items() {
      let raw = null;
      try { raw = safeStorage.getItem(CART_KEY); } catch (e) { /* blocked */ }
      const items = normalizeCart(read(CART_KEY));
      // Self-heal: replace corrupt or tampered data with the cleaned version.
      if (raw !== null && raw !== JSON.stringify(items)) write(CART_KEY, items);
      return items;
    },
    save(items) { write(CART_KEY, normalizeCart(items)); renderCartUI(); },
    add(id, size, grind, qty) { Cart.save(Cart.items().concat([{ id: id, size: size, grind: grind, qty: qty }])); },
    setQty(index, qty) {
      const items = Cart.items();
      if (!items[index]) return;
      const amount = clampQty(qty);
      if (amount === null) items.splice(index, 1); else items[index].qty = amount;
      Cart.save(items);
    },
    clear() { write(CART_KEY, []); renderCartUI(); },
    line(item) {
      const c = findCoffee(item.id);
      const unit = unitPrice(c, item.size);
      return { coffee: c, size: findSize(item.size), grind: findGrind(item.grind), unit: unit, total: unit * item.qty, qty: item.qty };
    },
    count() { return Cart.items().reduce((n, i) => n + i.qty, 0); },
    subtotal() { return Cart.items().reduce((n, i) => n + Cart.line(i).total, 0); },
    totals(method) {
      const subtotal = Cart.subtotal();
      const option = SHIPPING[method] || SHIPPING.standard;
      let shipping = 0;
      if (subtotal > 0) shipping = method === 'standard' || !SHIPPING[method] ? (subtotal >= FREE_SHIPPING ? 0 : option.price) : option.price;
      return { subtotal: subtotal, shipping: shipping, total: subtotal + shipping };
    }
  };

  // Free-shipping progress markup.
  function shippingProgress(subtotal) {
    const left = Math.max(0, FREE_SHIPPING - subtotal);
    const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING) * 100));
    const msg = left > 0
      ? 'Add <strong class="font-semibold">' + fmt(left) + '</strong> more for free shipping.'
      : '<strong class="font-semibold">You’ve unlocked free shipping.</strong>';
    return '<p class="text-sm">' + msg + '</p>' +
      '<div class="mt-2 h-3 overflow-hidden rounded-full border-2 border-navy bg-cream" role="progressbar" aria-label="Progress to free shipping" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '">' +
        '<div class="h-full bg-cobalt transition-[width] duration-500" style="width:' + pct + '%"></div>' +
      '</div>';
  }

  /* ------------------------------------------------------------------
   * 5. Cart drawer and toast
   * ------------------------------------------------------------------ */
  const drawer = $('#cart-drawer');
  const overlay = $('#cart-overlay');
  let lastFocus = null;

  function focusables(root) {
    return $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', root)
      .filter((el) => el.offsetParent !== null);
  }

  function openDrawer() {
    if (!drawer) return;
    hideToast();
    lastFocus = document.activeElement;
    renderDrawer();
    drawer.hidden = false;
    overlay.hidden = false;
    document.body.classList.add('drawer-open');
    requestAnimationFrame(() => {
      drawer.classList.remove('translate-x-full');
      overlay.classList.remove('opacity-0');
      $('[data-drawer-close]', drawer).focus();
    });
    $$('[data-cart-open]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
  }

  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.add('translate-x-full');
    overlay.classList.add('opacity-0');
    document.body.classList.remove('drawer-open');
    $$('[data-cart-open]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    setTimeout(() => { drawer.hidden = true; overlay.hidden = true; }, reduceMotion ? 0 : 320);
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  function qtyStepper(index, qty, name) {
    return '<div class="inline-flex h-9 items-center rounded-full border-2 border-navy bg-cream">' +
      '<button type="button" data-qty-step="-1" data-index="' + index + '" class="grid h-full w-9 place-items-center rounded-full text-lg leading-none hover:bg-sky" aria-label="Decrease quantity of ' + escapeHtml(name) + '">−</button>' +
      '<span class="w-7 text-center text-sm font-semibold tabular-nums">' + qty + '</span>' +
      '<button type="button" data-qty-step="1" data-index="' + index + '" class="grid h-full w-9 place-items-center rounded-full text-lg leading-none hover:bg-sky disabled:opacity-40" aria-label="Increase quantity of ' + escapeHtml(name) + '"' + (qty >= MAX_QTY ? ' disabled' : '') + '>+</button>' +
    '</div>';
  }

  function renderDrawer() {
    if (!drawer) return;
    const body = $('[data-drawer-body]', drawer);
    const foot = $('[data-drawer-foot]', drawer);
    const items = Cart.items();
    const subtotal = Cart.subtotal();
    $('[data-drawer-progress]', drawer).innerHTML = shippingProgress(subtotal);
    if (!items.length) {
      body.innerHTML = '<div class="flex h-full flex-col items-center justify-center px-2 py-16 text-center">' +
        '<p class="font-display text-xl font-semibold">Your bag is empty</p>' +
        '<p class="mt-2 text-sm text-muted">This week’s roasts are waiting in the shop.</p>' +
        '<a href="shop.html" class="btn-primary mt-6">Shop coffee</a></div>';
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    body.innerHTML = '<ul class="divide-y-2 divide-navy/10">' + items.map((item, i) => {
      const l = Cart.line(item);
      return '<li class="flex gap-4 py-5">' +
        '<a href="product.html?id=' + l.coffee.id + '" class="art block h-24 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-navy" tabindex="-1" aria-hidden="true">' + art(l.coffee, 0) + '</a>' +
        '<div class="flex min-w-0 flex-1 flex-col">' +
          '<div class="flex justify-between gap-3"><p class="font-display text-sm font-semibold leading-snug"><a href="product.html?id=' + l.coffee.id + '" class="hover:text-cobalt">' + escapeHtml(l.coffee.name) + '</a></p><p class="text-sm font-semibold tabular-nums">' + fmt(l.total) + '</p></div>' +
          '<p class="mt-1 text-xs text-muted">' + escapeHtml(l.size.label + ' · ' + l.grind.label + ' · ' + fmt(l.unit) + ' each') + '</p>' +
          '<div class="mt-auto flex items-center justify-between pt-3">' +
            qtyStepper(i, item.qty, l.coffee.name) +
            '<button type="button" data-remove="' + i + '" class="text-xs font-semibold text-muted underline underline-offset-4 hover:text-tomato-dark">Remove<span class="sr-only"> ' + escapeHtml(l.coffee.name) + '</span></button>' +
          '</div>' +
        '</div></li>';
    }).join('') + '</ul>';
    $('[data-drawer-subtotal]', drawer).textContent = fmt(subtotal);
  }

  let toastTimer;
  function hideToast() {
    const el = $('#toast');
    if (el) el.classList.add('translate-y-6', 'opacity-0', 'pointer-events-none');
  }
  function toast(html) {
    const el = $('#toast');
    if (!el) return;
    $('[data-toast-msg]', el).innerHTML = html;
    el.classList.remove('translate-y-6', 'opacity-0', 'pointer-events-none');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 4000);
  }

  function renderCartUI() {
    const count = Cart.count();
    $$('[data-cart-count]').forEach((el) => {
      el.textContent = count;
      el.hidden = count === 0;
    });
    $$('[data-cart-open]').forEach((b) => b.setAttribute('aria-label', 'Open cart, ' + plural(count, 'item', 'items')));
    if (drawer && !drawer.hidden) renderDrawer();
    if (document.body.dataset.page === 'checkout') renderCheckout();
  }

  function bumpBadge() {
    $$('[data-cart-count]').forEach((el) => {
      el.classList.remove('badge-pop');
      void el.offsetWidth;
      el.classList.add('badge-pop');
    });
  }

  function addToCart(id, size, grind, qty) {
    const c = findCoffee(id);
    if (!c) return;
    Cart.add(c.id, size, grind, qty);
    bumpBadge();
    toast('<strong class="font-semibold">' + escapeHtml(c.name) + '</strong> (' + escapeHtml(findSize(size).label) + ') added. ' +
      '<button type="button" data-cart-open class="ml-1 font-semibold underline underline-offset-4">View cart</button>');
  }

  // One click handler for everything rendered now or later.
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-cart-open], [data-drawer-close], [data-add], [data-qty-step], [data-remove], [data-toast-close]');
    if (!t) return;
    if (t.hasAttribute('data-cart-open')) { e.preventDefault(); openDrawer(); }
    else if (t.hasAttribute('data-drawer-close')) closeDrawer();
    else if (t.hasAttribute('data-add')) addToCart(t.getAttribute('data-add'), SIZES[0].id, GRINDS[0].id, 1);
    else if (t.hasAttribute('data-qty-step')) {
      const idx = +t.getAttribute('data-index');
      const item = Cart.items()[idx];
      if (item) Cart.setQty(idx, item.qty + (+t.getAttribute('data-qty-step')));
      // The list is re-rendered: keep focus on the same control.
      const again = $('[data-qty-step="' + t.getAttribute('data-qty-step') + '"][data-index="' + idx + '"]', drawer);
      if (again && !again.disabled) again.focus();
      else if (drawer && !drawer.hidden) $('[data-drawer-close]', drawer).focus();
    }
    else if (t.hasAttribute('data-remove')) {
      Cart.setQty(+t.getAttribute('data-remove'), 0);
      if (drawer && !drawer.hidden) $('[data-drawer-close]', drawer).focus();
    }
    else if (t.hasAttribute('data-toast-close')) hideToast();
  });

  if (overlay) overlay.addEventListener('click', closeDrawer);

  document.addEventListener('keydown', (e) => {
    if (!drawer || drawer.hidden) return;
    if (e.key === 'Escape') { closeDrawer(); return; }
    if (e.key === 'Tab') {
      const f = focusables(drawer);
      if (!f.length) return;
      const first = f[0];
      const last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // Keep every open tab in sync.
  window.addEventListener('storage', (e) => { if (e.key === CART_KEY) renderCartUI(); });

  /* ------------------------------------------------------------------
   * 6. Header, mobile menu and scroll reveal
   * ------------------------------------------------------------------ */
  const menuBtn = $('#menu-toggle');
  const menu = $('#mobile-menu');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
    $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });
  }

  // Header shadow once the page scrolls.
  const header = $('#site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('shadow-[0_2px_0_var(--color-navy)]', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

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
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 })
    : null;
  function reveal(root) {
    $$('.reveal:not(.is-visible)', root).forEach((el) => {
      if (revealObserver) revealObserver.observe(el); else el.classList.add('is-visible');
    });
  }

  // Current year in footers.
  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ------------------------------------------------------------------
   * 7. Shop page — filters, sort, URL parameters and live count
   *    shop.html?roast=light,medium&origin=ethiopia&process=washed&sort=price-asc
   * ------------------------------------------------------------------ */
  const FILTERS = { roast: ROASTS, origin: ORIGINS, process: PROCESSES };
  const SORTS = ['featured', 'price-asc', 'price-desc', 'roast', 'name'];

  // Values of a filter in the URL: case-insensitive, comma-separated or repeated, own keys only.
  function urlValues(params, name) {
    const keys = Object.keys(FILTERS[name]);
    const out = [];
    params.getAll(name).join(',').split(',').forEach((v) => {
      const k = ownKey(v, keys);
      if (k && out.indexOf(k) === -1) out.push(k);
    });
    return out;
  }

  function initShop() {
    const grid = $('#product-grid');
    const form = $('#filters');
    if (!grid || !form) return;
    const sort = $('#sort');
    const count = $('#result-count');
    const empty = $('#no-results');
    const chips = $('#active-filters');
    const toggle = $('#filters-toggle');

    const params = urlParams();
    Object.keys(FILTERS).forEach((name) => {
      urlValues(params, name).forEach((v) => {
        const box = $('input[name="' + name + '"][value="' + v + '"]', form);
        if (box) box.checked = true;
      });
    });
    const sortParam = ownKey(params.get('sort'), SORTS);
    if (sortParam) sort.value = sortParam;

    // How many coffees each option has.
    $$('[data-count-for]', form).forEach((el) => {
      const parts = el.getAttribute('data-count-for').split(':');
      el.textContent = COFFEES.filter((c) => c[parts[0]] === parts[1]).length;
    });

    function selected() {
      const s = {};
      Object.keys(FILTERS).forEach((name) => {
        s[name] = $$('input[name="' + name + '"]:checked', form).map((i) => i.value);
      });
      return s;
    }

    function apply() {
      const s = selected();
      const list = COFFEES.filter((c) => Object.keys(s).every((name) => !s[name].length || s[name].indexOf(c[name]) !== -1));
      const by = sort.value;
      const roastOrder = Object.keys(ROASTS);
      list.sort((a, b) => {
        if (by === 'price-asc') return a.price - b.price || a.name.localeCompare(b.name);
        if (by === 'price-desc') return b.price - a.price || a.name.localeCompare(b.name);
        if (by === 'roast') return roastOrder.indexOf(a.roast) - roastOrder.indexOf(b.roast) || a.name.localeCompare(b.name);
        if (by === 'name') return a.name.localeCompare(b.name);
        return COFFEES.indexOf(a) - COFFEES.indexOf(b);
      });
      grid.innerHTML = list.map(coffeeCard).join('');
      count.textContent = plural(list.length, 'coffee', 'coffees');
      empty.hidden = list.length > 0;
      grid.hidden = list.length === 0;

      const active = [];
      Object.keys(s).forEach((name) => s[name].forEach((v) => active.push({ name: name, value: v })));
      chips.innerHTML = active.map((a) =>
        '<li><button type="button" data-chip="' + a.name + ':' + a.value + '" class="inline-flex items-center gap-2 rounded-full border-2 border-navy bg-sky px-3 py-1 text-xs font-semibold hover:bg-cream" aria-label="Remove filter: ' + escapeHtml(FILTERS[a.name][a.value]) + ' ' + a.name + '">' +
          escapeHtml(FILTERS[a.name][a.value]) + '<span aria-hidden="true">×</span></button></li>').join('');
      chips.hidden = active.length === 0;
      if (toggle) $('[data-filter-count]', toggle).textContent = active.length ? '(' + active.length + ')' : '';
      reveal(grid);

      const url = new URL(location.href);
      // Drop our own parameters in any letter case, then write them back canonically.
      Array.from(url.searchParams.keys()).forEach((k) => {
        if (Object.keys(FILTERS).concat('sort').indexOf(k.toLowerCase()) !== -1) url.searchParams.delete(k);
      });
      Object.keys(s).forEach((name) => {
        if (s[name].length) url.searchParams.set(name, s[name].join(',')); else url.searchParams.delete(name);
      });
      if (by !== 'featured') url.searchParams.set('sort', by); else url.searchParams.delete('sort');
      history.replaceState(null, '', url.pathname + url.search.replace(/%2C/gi, ',') + url.hash);
    }

    form.addEventListener('change', apply);
    form.addEventListener('submit', (e) => e.preventDefault());
    sort.addEventListener('change', apply);
    chips.addEventListener('click', (e) => {
      const b = e.target.closest('[data-chip]');
      if (!b) return;
      const parts = b.getAttribute('data-chip').split(':');
      const box = $('input[name="' + parts[0] + '"][value="' + parts[1] + '"]', form);
      if (box) box.checked = false;
      apply();
      const next = $('[data-chip]', chips);
      (next || count).focus();
    });
    $$('[data-reset-filters]').forEach((b) => b.addEventListener('click', () => {
      $$('input:checked', form).forEach((i) => { i.checked = false; });
      sort.value = 'featured';
      apply();
      count.focus();
    }));
    if (toggle) {
      toggle.addEventListener('click', () => {
        const open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        form.classList.toggle('max-lg:hidden', !open);
      });
    }
    apply();
  }

  /* ------------------------------------------------------------------
   * 8. Product page — product.html?id=<coffee id>
   * ------------------------------------------------------------------ */
  function initProduct() {
    const root = $('#product');
    if (!root) return;
    const params = urlParams();
    const c = findCoffee(params.get('id')) || COFFEES[0];
    const set = (key, value) => $$('[data-p="' + key + '"]').forEach((el) => { el.textContent = value; });

    document.title = c.name + ' — ' + ORIGINS[c.origin] + ' coffee | First Crack Coffee';
    set('name', c.name);
    set('crumb', c.name);
    set('origin', ORIGINS[c.origin]);
    set('eyebrow', ORIGINS[c.origin] + ' · ' + c.region);
    set('blurb', c.blurb);
    set('rating', c.rating.toFixed(1));
    set('reviews', plural(c.reviews, 'review', 'reviews'));
    set('producer', c.producer);
    set('region', c.region);
    set('altitude', c.altitude);
    set('variety', c.variety);
    set('process', PROCESSES[c.process]);
    set('roast', ROASTS[c.roast] + ' roast');
    set('harvest', c.harvest);
    $$('[data-p="origin-link"]').forEach((a) => a.setAttribute('href', 'shop.html?origin=' + c.origin));
    const badge = $('[data-p="badge"]');
    if (badge) { badge.textContent = c.badge || ''; badge.hidden = !c.badge; }
    $('[data-p="notes"]').innerHTML = c.notes.map((n) => '<li class="tag">' + escapeHtml(n) + '</li>').join('');

    // Tasting profile bars.
    $('[data-p="profile"]').innerHTML = [['acidity', 'Acidity'], ['sweetness', 'Sweetness'], ['body', 'Body']].map((row) => {
      const v = c.profile[row[0]];
      let cells = '';
      for (let i = 1; i <= 5; i++) cells += '<span class="h-3 flex-1 rounded-full border-2 border-navy ' + (i <= v ? 'bg-cobalt' : 'bg-cream') + '"></span>';
      return '<div class="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3"><dt class="text-sm font-semibold">' + row[1] + '</dt>' +
        '<dd class="flex gap-1.5" aria-hidden="true">' + cells + '</dd><dd class="text-right text-sm tabular-nums text-muted">' + v + '<span class="sr-only"> out of 5</span><span aria-hidden="true">/5</span></dd></div>';
    }).join('');

    // Brew recipe for the method this coffee is best in.
    const m = METHODS[c.brew];
    const dose = Math.round((m.cup / m.ratio) * 10) / 10;
    set('brew-name', m.name);
    set('brew-dose', dose + ' g coffee');
    set('brew-water', m.cup + (c.brew === 'espresso' ? ' g out' : ' g water'));
    set('brew-ratio', '1:' + m.ratio);
    set('brew-grind', m.grind);
    set('brew-temp', m.temp);
    set('brew-time', m.time);
    $$('[data-p="brew-link"]').forEach((a) => a.setAttribute('href', 'brew.html#' + c.brew));
    $$('[data-p="subscribe-link"]').forEach((a) => {
      const style = c.process === 'decaf' ? 'decaf' : c.roast === 'light' ? 'bright' : c.roast === 'medium' ? 'balanced' : 'rich';
      a.setAttribute('href', 'subscribe.html?style=' + style);
    });

    // Gallery: the bag and the beans.
    const main = $('#gallery-main');
    const thumbs = $$('#gallery-thumbs [data-view]');
    function show(view) {
      main.innerHTML = art(c, view);
      thumbs.forEach((b) => b.setAttribute('aria-pressed', String(+b.getAttribute('data-view') === view)));
    }
    thumbs.forEach((b) => {
      // After the button's visually hidden name: the artwork is a picture, not the button's label.
      b.insertAdjacentHTML('beforeend', '<span class="art block h-full w-full" aria-hidden="true">' + art(c, +b.getAttribute('data-view')) + '</span>');
      b.addEventListener('click', () => show(+b.getAttribute('data-view')));
    });
    show(0);

    // Size and grind options, quantity and add to cart.
    const sizeBox = $('#size-options');
    sizeBox.innerHTML = SIZES.map((s, i) =>
      '<label class="option flex-col gap-1 p-3 text-center"><input type="radio" name="size" value="' + s.id + '" class="sr-only"' + (i === 0 ? ' checked' : '') + '>' +
      '<span class="font-display text-sm font-semibold">' + s.label + '</span><span class="text-sm tabular-nums text-muted">' + fmt(unitPrice(c, s.id)) + '</span></label>').join('');
    const grindSelect = $('#grind');
    grindSelect.innerHTML = GRINDS.map((g) => '<option value="' + g.id + '">' + g.label + '</option>').join('');
    const qty = $('#qty');

    function current() {
      return {
        size: ($('input[name="size"]:checked', sizeBox) || {}).value || SIZES[0].id,
        grind: ownKey(grindSelect.value, GRINDS.map((g) => g.id)) || GRINDS[0].id,
        qty: clampQty(qty.value) || 1
      };
    }
    function update() {
      const cur = current();
      const unit = unitPrice(c, cur.size);
      set('price', fmt(unit));
      set('size-label', findSize(cur.size).label);
      $('#add-total').textContent = fmt(unit * cur.qty);
      const grams = findSize(cur.size).grams;
      set('cups', 'About ' + Math.floor(grams / DOSE) + ' cups per bag');
      $('#qty-minus').disabled = cur.qty <= 1;
      $('#qty-plus').disabled = cur.qty >= MAX_QTY;
    }
    sizeBox.addEventListener('change', update);
    grindSelect.addEventListener('change', update);
    qty.addEventListener('input', update);
    qty.addEventListener('blur', () => { qty.value = clampQty(qty.value) || 1; update(); });
    $('#qty-minus').addEventListener('click', () => { qty.value = Math.max(1, (clampQty(qty.value) || 1) - 1); update(); });
    $('#qty-plus').addEventListener('click', () => { qty.value = Math.min(MAX_QTY, (clampQty(qty.value) || 1) + 1); update(); });
    $('#buy-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const cur = current();
      qty.value = cur.qty;
      addToCart(c.id, cur.size, cur.grind, cur.qty);
      update();
    });
    update();

    // Related: same roast first, then the rest, four in all.
    const related = $('#related');
    if (related) {
      const others = COFFEES.filter((o) => o.id !== c.id);
      const picks = others.filter((o) => o.roast === c.roast).concat(others.filter((o) => o.roast !== c.roast)).slice(0, 4);
      related.innerHTML = picks.map(coffeeCard).join('');
    }
  }

  /* ------------------------------------------------------------------
   * 9. Subscription builder — plan saved as { style, size, bags, freq, grind }
   * ------------------------------------------------------------------ */
  const DEFAULT_PLAN = { style: 'balanced', size: '250g', bags: 1, freq: 2, grind: 'whole' };

  function normalizePlan(raw) {
    const p = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const bags = clampQty(p.bags);
    const freq = typeof p.freq === 'number' && FREQUENCIES.indexOf(p.freq) !== -1 ? p.freq : DEFAULT_PLAN.freq;
    return {
      style: ownKey(p.style, STYLES.map((s) => s.id)) || DEFAULT_PLAN.style,
      size: ownKey(p.size, SIZES.map((s) => s.id)) || DEFAULT_PLAN.size,
      bags: bags === null ? DEFAULT_PLAN.bags : Math.min(MAX_BAGS, bags),
      freq: freq,
      grind: ownKey(p.grind, GRINDS.map((g) => g.id)) || DEFAULT_PLAN.grind
    };
  }

  function planPrice(plan) {
    const style = STYLES.find((s) => s.id === plan.style);
    const size = findSize(plan.size);
    const bag = Math.round(style.price * size.factor * (1 - SUB_DISCOUNT) * 100) / 100;
    const shop = Math.round(style.price * size.factor);
    const perDelivery = Math.round(bag * plan.bags * 100) / 100;
    const cups = Math.floor(size.grams / DOSE) * plan.bags;
    return {
      bag: bag,
      perDelivery: perDelivery,
      perCup: perDelivery / cups,
      cups: cups,
      monthly: Math.round((perDelivery * 52) / 12 / plan.freq * 100) / 100,
      saving: Math.round((shop * plan.bags - perDelivery) * 100) / 100
    };
  }

  // Delivery dates: we roast on ROAST_DAY and the parcel arrives DELIVERY_LAG days later. The
  // first delivery is from the next roast day after today; the rest follow every `freq` weeks.
  function deliveryDates(from, freq, count) {
    const d = new Date(from.getFullYear(), from.getMonth(), from.getDate());
    let ahead = (ROAST_DAY - d.getDay() + 7) % 7;
    if (ahead === 0) ahead = 7;
    d.setDate(d.getDate() + ahead + DELIVERY_LAG);
    const out = [];
    for (let i = 0; i < count; i++) {
      out.push(new Date(d.getFullYear(), d.getMonth(), d.getDate() + i * freq * 7));
    }
    return out;
  }
  const dayFormat = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  function initSubscribe() {
    const form = $('#plan-form');
    if (!form) return;
    const params = urlParams();
    const saved = read(PLAN_KEY);
    const plan = normalizePlan(saved);
    // ?style= (from product pages) wins over a saved plan.
    const fromUrl = ownKey(params.get('style'), STYLES.map((s) => s.id));
    if (fromUrl) plan.style = fromUrl;

    const bags = $('#bags');
    function fill() {
      $('input[name="style"][value="' + plan.style + '"]', form).checked = true;
      $('input[name="size"][value="' + plan.size + '"]', form).checked = true;
      $('input[name="freq"][value="' + plan.freq + '"]', form).checked = true;
      $('#plan-grind').value = plan.grind;
      bags.value = plan.bags;
    }
    // Prices on the option cards, from the data.
    $$('[data-style-price]', form).forEach((el) => {
      const s = STYLES.find((x) => x.id === el.getAttribute('data-style-price'));
      el.textContent = 'from ' + fmt(Math.round(s.price * (1 - SUB_DISCOUNT) * 100) / 100);
    });
    function sizePrices() {
      $$('[data-size-price]', form).forEach((el) => {
        const p = planPrice({ style: plan.style, size: el.getAttribute('data-size-price'), bags: 1, freq: plan.freq, grind: plan.grind });
        el.textContent = fmt(p.bag) + ' a bag';
      });
    }

    function render() {
      const style = STYLES.find((s) => s.id === plan.style);
      const size = findSize(plan.size);
      const price = planPrice(plan);
      const set = (key, value) => $$('[data-plan="' + key + '"]').forEach((el) => { el.textContent = value; });
      set('style', style.name);
      set('size', size.label);
      set('bags', plural(plan.bags, 'bag', 'bags'));
      set('freq', plan.freq === 1 ? 'Every week' : 'Every ' + plan.freq + ' weeks');
      set('grind', findGrind(plan.grind).label);
      set('per-delivery', fmt(price.perDelivery));
      set('per-cup', fmt(price.perCup));
      set('cups', 'About ' + price.cups + ' cups per delivery');
      set('monthly', '≈ ' + fmt(price.monthly) + ' a month');
      set('saving', 'You save ' + fmt(price.saving) + ' on every delivery');
      $('#bags-minus').disabled = plan.bags <= 1;
      $('#bags-plus').disabled = plan.bags >= MAX_BAGS;
      $('#plan-dates').innerHTML = deliveryDates(new Date(), plan.freq, 3)
        .map((d, i) => '<li class="flex justify-between gap-3"><span>' + (i === 0 ? 'First delivery' : 'Then') + '</span><span class="font-semibold tabular-nums">' + dayFormat.format(d) + '</span></li>').join('');
      sizePrices();
      write(PLAN_KEY, plan);
    }

    form.addEventListener('change', (e) => {
      const t = e.target;
      if (t.name === 'style') plan.style = ownKey(t.value, STYLES.map((s) => s.id)) || plan.style;
      if (t.name === 'size') plan.size = ownKey(t.value, SIZES.map((s) => s.id)) || plan.size;
      if (t.name === 'freq' && FREQUENCIES.indexOf(+t.value) !== -1) plan.freq = +t.value;
      if (t.id === 'plan-grind') plan.grind = ownKey(t.value, GRINDS.map((g) => g.id)) || plan.grind;
      if (t.id === 'bags') { plan.bags = Math.min(MAX_BAGS, clampQty(t.value) || 1); bags.value = plan.bags; }
      render();
    });
    form.addEventListener('submit', (e) => e.preventDefault());
    $('#bags-minus').addEventListener('click', () => { plan.bags = Math.max(1, plan.bags - 1); bags.value = plan.bags; render(); });
    $('#bags-plus').addEventListener('click', () => { plan.bags = Math.min(MAX_BAGS, plan.bags + 1); bags.value = plan.bags; render(); });

    // "Change" buttons in the summary jump to their step and focus its current choice.
    $$('[data-edit]').forEach((b) => b.addEventListener('click', () => {
      const step = document.getElementById('step-' + b.getAttribute('data-edit'));
      if (!step) return;
      step.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      const target = $('input:checked', step) || $('input, select', step);
      if (target) target.focus({ preventScroll: true });
    }));

    fill();
    render();
  }

  /* ------------------------------------------------------------------
   * 10. Checkout — three validated steps, demo only
   * ------------------------------------------------------------------ */
  let checkoutMethod = 'standard';

  function renderCheckout() {
    const lines = $('#co-lines');
    if (!lines) return;
    const items = Cart.items();
    const done = !$('#checkout-done').hidden;
    if (!done) {
      $('#checkout-empty').hidden = items.length > 0;
      $('#checkout-main').hidden = items.length === 0;
    }
    const t = Cart.totals(checkoutMethod);
    lines.innerHTML = items.map((item) => {
      const l = Cart.line(item);
      return '<li class="flex gap-3 py-3">' +
        '<span class="art relative block h-16 w-14 shrink-0 overflow-hidden rounded-lg border-2 border-navy" aria-hidden="true">' + art(l.coffee, 0) + '</span>' +
        '<div class="min-w-0 flex-1"><p class="text-sm font-semibold">' + escapeHtml(l.coffee.name) + '</p><p class="text-xs text-muted">' + escapeHtml(l.size.label + ' · ' + l.grind.label + ' · Qty ' + l.qty) + '</p></div>' +
        '<p class="text-sm font-semibold tabular-nums">' + fmt(l.total) + '</p></li>';
    }).join('');
    $('#co-subtotal').textContent = fmt(t.subtotal);
    $('#co-shipping').textContent = t.shipping === 0 ? 'Free' : fmt(t.shipping);
    $('#co-total').textContent = fmt(t.total);
    $('#co-progress').innerHTML = shippingProgress(t.subtotal);
    // Delivery option prices.
    $$('[data-ship-price]').forEach((el) => {
      const key = el.getAttribute('data-ship-price');
      const cost = key === 'standard' && t.subtotal >= FREE_SHIPPING ? 0 : SHIPPING[key].price;
      el.textContent = cost === 0 ? 'Free' : fmt(cost);
    });
  }

  function initCheckout() {
    const form = $('#checkout-form');
    if (!form) return;
    const steps = $$('[data-step]', form);
    const markers = $$('[data-step-marker]');
    let current = 0;

    function go(index, focus) {
      current = index;
      steps.forEach((s, i) => { s.hidden = i !== index; });
      markers.forEach((m, i) => {
        if (i === index) m.setAttribute('aria-current', 'step'); else m.removeAttribute('aria-current');
        m.classList.toggle('is-done', i < index);
      });
      if (index === steps.length - 1) review();
      if (focus) {
        const heading = $('h2', steps[index]);
        heading.setAttribute('tabindex', '-1');
        heading.focus();
      }
    }
    function review() {
      const v = (id) => ($('#' + id) || {}).value || '';
      $('#review-contact').textContent = v('email');
      $('#review-address').textContent = [v('first-name') + ' ' + v('last-name'), v('address'), v('city') + ', ' + v('state') + ' ' + v('zip')].join(', ');
      const opt = SHIPPING[checkoutMethod];
      $('#review-delivery').textContent = opt.label + ' (' + opt.note + ')';
    }

    form.addEventListener('change', (e) => {
      if (e.target.name === 'delivery' && SHIPPING[e.target.value]) {
        checkoutMethod = e.target.value;
        renderCheckout();
      }
    });

    // Card number and expiry formatting.
    const card = $('#card-number');
    card.addEventListener('input', () => {
      const digits = card.value.replace(/\D/g, '').slice(0, 16);
      card.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
    });
    const expiry = $('#card-expiry');
    expiry.addEventListener('input', () => {
      const d = expiry.value.replace(/\D/g, '').slice(0, 4);
      expiry.value = d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d;
    });

    $$('[data-back]', form).forEach((b) => b.addEventListener('click', () => go(Math.max(0, current - 1), true)));
    $$('[data-goto]', form).forEach((b) => b.addEventListener('click', () => go(+b.getAttribute('data-goto'), true)));

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validate(steps[current], form)) return;
      if (current < steps.length - 1) { go(current + 1, true); return; }
      // Demo only: a real store sends the order to its payment provider here.
      const t = Cart.totals(checkoutMethod);
      $('#confirm-number').textContent = makeRef('FC');
      $('#confirm-total').textContent = fmt(t.total);
      $('#confirm-email').textContent = $('#email').value.trim();
      Cart.clear();
      $('#checkout-main').hidden = true;
      $('#checkout-empty').hidden = true;
      const done = $('#checkout-done');
      done.hidden = false;
      const title = $('h2', done);
      title.setAttribute('tabindex', '-1');
      title.focus();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    go(0, false);
    renderCheckout();
  }

  /* ------------------------------------------------------------------
   * 11. Brew guides — tabs (#v60 deep links) and the recipe scaler
   * ------------------------------------------------------------------ */
  function initBrew() {
    const list = $('[role="tablist"]');
    if (!list) return;
    const tabs = $$('[role="tab"]', list);
    const ids = tabs.map((t) => t.getAttribute('aria-controls'));

    function select(index, focus) {
      tabs.forEach((t, i) => {
        const on = i === index;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(ids[i]).hidden = !on;
      });
      if (focus) tabs[index].focus();
      scale();
    }
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => {
        select(i, false);
        history.replaceState(null, '', '#' + ids[i]);
      });
      t.addEventListener('keydown', (e) => {
        let next = null;
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') next = 0;
        if (e.key === 'End') next = tabs.length - 1;
        if (next === null) return;
        e.preventDefault();
        select(next, true);
        history.replaceState(null, '', '#' + ids[next]);
      });
    });

    // Recipe scaler: cups and strength → coffee and water for the open method.
    const cups = $('#cups');
    const strength = $('#strength');
    function scale() {
      const index = tabs.findIndex((t) => t.getAttribute('aria-selected') === 'true');
      const key = ids[index];
      const m = METHODS[key];
      const n = wholeNumber(cups.value, 1, 8, 2);
      const ratio = m.ratio + (key === 'espresso' ? 0 : strength.value === 'strong' ? -1 : strength.value === 'light' ? 1 : 0);
      const water = m.cup * n;
      const coffee = Math.round((water / ratio) * 10) / 10;
      $('#cups-value').textContent = plural(n, 'cup', 'cups');
      $('#scale-method').textContent = m.name;
      $('#scale-coffee').textContent = coffee + ' g';
      $('#scale-water').textContent = water + (key === 'espresso' ? ' g' : ' ml');
      $('#scale-water-label').textContent = key === 'espresso' ? 'Espresso out' : 'Water';
      $('#scale-ratio').textContent = '1:' + ratio;
      $('#strength').disabled = key === 'espresso';
    }
    cups.addEventListener('input', scale);
    strength.addEventListener('change', scale);

    function fromHash() {
      const key = ownKey(decodeURIComponent(location.hash.slice(1)), ids);
      select(key ? ids.indexOf(key) : 0, false);
    }
    window.addEventListener('hashchange', fromHash);
    fromHash();
  }

  /* ------------------------------------------------------------------
   * 12. Home page
   * ------------------------------------------------------------------ */
  function initHome() {
    const grid = $('#featured-grid');
    if (!grid) return;
    grid.innerHTML = COFFEES.filter((c) => c.featured).sort((a, b) => a.featured - b.featured).map(coffeeCard).join('');
  }

  /* ------------------------------------------------------------------
   * 13. Wholesale estimator — cups a day → pounds a week and price tier
   * ------------------------------------------------------------------ */
  const WHOLESALE_DOSE = 18; // grams per espresso-based drink
  // min is pounds a week; perKg keeps its name but holds dollars per pound.
  const TIERS = [
    { name: 'Starter', min: 0, perKg: 12 },
    { name: 'Café', min: 10, perKg: 10.5 },
    { name: 'Volume', min: 35, perKg: 9 }
  ];
  function initWholesale() {
    const cups = $('#est-cups');
    if (!cups) return;
    const days = $('#est-days');
    function update() {
      const perDay = wholeNumber(cups.value, 0, 1000, 0);
      const d = wholeNumber(days.value, 1, 7, 6);
      const lb = Math.round((perDay * WHOLESALE_DOSE * d) / 45.36) / 10; // grams to pounds, one decimal
      let tier = TIERS[0];
      TIERS.forEach((t) => { if (lb >= t.min) tier = t; });
      $('#est-cups-value').textContent = plural(perDay, 'drink', 'drinks') + ' a day';
      $('#est-kg').textContent = lb + ' lb';
      $('#est-tier').textContent = tier.name + ' · ' + fmt(tier.perKg) + '/lb';
      $('#est-cost').textContent = fmt(Math.round(lb * tier.perKg));
      $$('[data-tier]').forEach((row) => row.classList.toggle('is-current', row.getAttribute('data-tier') === tier.name));
    }
    cups.addEventListener('input', update);
    days.addEventListener('change', update);
    update();
  }

  /* ------------------------------------------------------------------
   * 14. Forms — inline validation, success state. Demo forms send nothing.
   * ------------------------------------------------------------------ */
  function fieldMessage(el) {
    const v = el.value.trim();
    const label = el.getAttribute('data-label') || 'This field';
    if (el.type === 'checkbox') return el.required && !el.checked ? (el.getAttribute('data-msg') || 'Please check this box.') : '';
    if (el.required && !v) return label + ' is required.';
    if (!v) return '';
    const rule = el.getAttribute('data-validate') || el.type;
    if (rule === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter an email address like name@example.com.';
    if (rule === 'tel' && !/^[+()\d\s.-]{7,20}$/.test(v)) return 'Enter a phone number, digits only.';
    if (rule === 'zip' && !/^\d{5}(-\d{4})?$/.test(v)) return 'Enter a 5-digit ZIP code.';
    if (rule === 'order' && !/^FC-?[A-HJ-NP-Z2-9]{4}$/i.test(v)) return 'Order numbers look like FC-7K2Q.';
    if (rule === 'card' && !/^\d{16}$/.test(v.replace(/\s/g, ''))) return 'Enter the 16-digit card number.';
    if (rule === 'expiry') {
      const m = v.match(/^(\d{2})\s*\/\s*(\d{2})$/);
      if (!m || +m[1] < 1 || +m[1] > 12) return 'Use the format MM / YY.';
    }
    if (rule === 'cvc' && !/^\d{3,4}$/.test(v)) return 'Enter the 3 or 4 digit code.';
    const min = +el.getAttribute('minlength');
    if (min && v.length < min) return label + ' needs at least ' + min + ' characters.';
    return '';
  }

  function groupMessage(group) {
    const min = +group.getAttribute('data-min-checked') || 1;
    return $$('input:checked', group).length >= min ? '' : group.getAttribute('data-msg') || 'Choose at least one option.';
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

  function fieldsOf(root) {
    return $$('input, select, textarea', root).filter((el) =>
      el.type !== 'radio' && el.type !== 'hidden' && el.type !== 'submit' && el.id && !el.closest('[data-group]') && el.type !== 'range');
  }

  // Validate every field in `root`; focus the first problem. Returns true when all is well.
  function validate(root, form) {
    let firstBad = null;
    fieldsOf(root).forEach((el) => {
      const msg = fieldMessage(el);
      showError(el, msg);
      if (msg && !firstBad) firstBad = el;
    });
    $$('[data-group]', root).forEach((g) => {
      const msg = groupMessage(g);
      showError(g, msg);
      if (msg && !firstBad) firstBad = $('input', g);
    });
    const status = $('[data-form-status]', form);
    if (firstBad) {
      if (status) status.textContent = 'Please fix the highlighted fields.';
      firstBad.focus();
      return false;
    }
    if (status) status.textContent = '';
    return true;
  }

  function setupValidation(form, onValid) {
    form.setAttribute('novalidate', '');
    fieldsOf(form).forEach((el) => {
      el.addEventListener('blur', () => { if (el.value.trim() || el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
      el.addEventListener('input', () => { if (el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
    });
    $$('[data-group]', form).forEach((g) => g.addEventListener('change', () => { if (g.hasAttribute('aria-invalid')) showError(g, groupMessage(g)); }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validate(form, form)) onValid(form);
    });
  }

  // A short reference, like FC-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  function successSwap(form, html) {
    const box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.className = 'rounded-3xl border-2 border-navy bg-cream p-6 text-navy focus:outline-none';
    box.innerHTML = html;
    form.replaceWith(box);
    box.focus();
  }

  // To connect a form: replace successSwap(...) below with a fetch() to your form service, e.g.
  // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  $$('[data-form="newsletter"]').forEach((form) => setupValidation(form, () => {
    successSwap(form, '<p class="font-display text-lg font-semibold">You’re on the list.</p>' +
      '<p class="mt-1 text-sm text-muted">Look out for a confirmation email from us; click the link inside and the Monday letter is yours.</p>');
  }));
  $$('[data-form="contact"]').forEach((form) => setupValidation(form, () => {
    successSwap(form, '<p class="font-display text-xl font-semibold">Thanks for writing.</p>' +
      '<p class="mt-2 text-muted">Your message has reached the roastery, and we’ll reply within one business day. Your reference is <strong class="font-semibold">' + makeRef('FC') + '</strong>.</p>');
  }));
  $$('[data-form="wholesale"]').forEach((form) => setupValidation(form, () => {
    const name = ($('#w-business') || {}).value || '';
    successSwap(form, '<p class="font-display text-xl font-semibold">Thanks, ' + escapeHtml(name.trim()) + '.</p>' +
      '<p class="mt-2 text-muted">Our wholesale team will be in touch within two business days to set up a tasting. Your reference is <strong class="font-semibold">' + makeRef('FC') + '</strong>.</p>');
  }));
  $$('[data-form="subscribe"]').forEach((form) => setupValidation(form, () => {
    const plan = normalizePlan(read(PLAN_KEY));
    const style = STYLES.find((s) => s.id === plan.style);
    const first = deliveryDates(new Date(), plan.freq, 1)[0];
    successSwap(form, '<p class="font-display text-xl font-semibold">Your subscription is confirmed.</p>' +
      '<p class="mt-2 text-muted">' + escapeHtml(style.name + ', ' + plural(plan.bags, 'bag', 'bags') + ' of ' + findSize(plan.size).label + ', ' + (plan.freq === 1 ? 'every week' : 'every ' + plan.freq + ' weeks')) +
      '. Your first delivery arrives ' + dayFormat.format(first) + ', and we’ll email you two days before every roast so you can skip, swap or pause. Your reference is <strong class="font-semibold">' + makeRef('FC') + '</strong>.</p>');
  }));
  $$('#checkout-form').forEach((form) => form.setAttribute('novalidate', ''));
  $$('#checkout-form input, #checkout-form select').forEach((el) => {
    if (el.type === 'radio' || !el.id) return;
    el.addEventListener('blur', () => { if (el.value.trim() || el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
    el.addEventListener('input', () => { if (el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
  });

  /* ------------------------------------------------------------------
   * 15. Boot
   * ------------------------------------------------------------------ */
  hydrateArt(document);
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'shop') initShop();
  if (page === 'product') initProduct();
  if (page === 'subscribe') initSubscribe();
  if (page === 'checkout') initCheckout();
  if (page === 'brew') initBrew();
  if (page === 'wholesale') initWholesale();
  renderCartUI();
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
