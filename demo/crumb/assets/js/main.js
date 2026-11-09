/* Bramble & Rye — site script for the Crumb template
 * Vanilla JavaScript, no dependencies. Sections:
 *  1. Shop settings: address, opening hours, pickup rules
 *  2. Bakes: categories, allergens, products, today's bake schedule
 *  3. Café menu and celebration cake options
 *  4. Helpers
 *  5. Shop clock: opening hours, pickup dates and slots (in the shop's time zone)
 *  6. Bake artwork (SVG drawn from the product data)
 *  7. Saved basket (localStorage)
 *  8. Header, mobile menu, reveal, open-now badges
 *  9. Basket drawer and toast
 * 10. Product cards
 * 11. Home page           14. Celebration cake builder
 * 12. Preorder page       15. Checkout and .ics
 * 13. Café menu           16. Visit page and hours
 * 17. Forms               18. Boot
 */
document.documentElement.classList.add('js');

(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Shop settings — edit these to make the template yours.
   *    HOURS: one entry per weekday, Sunday first, as ['open', 'close']
   *    in 24-hour time, or null when closed. Times are in TIMEZONE, so a
   *    visitor in another time zone still sees the bakery's real clock.
   * ------------------------------------------------------------------ */
  const SHOP = {
    name: 'Bramble & Rye',
    address: '27 Phila Street, Saratoga Springs, NY 12866',
    phone: '(518) 555-0129',
    email: 'hello@brambleandrye.example'
  };
  const TIMEZONE = 'America/New_York';
  const LOCALE = 'en-US';
  const CURRENCY = 'USD';

  const HOURS = [
    ['09:00', '14:00'], // Sunday
    null,               // Monday: closed (the ovens get a rest)
    ['07:30', '16:00'], // Tuesday
    ['07:30', '16:00'], // Wednesday
    ['07:30', '16:00'], // Thursday
    ['07:30', '16:00'], // Friday
    ['08:00', '16:00']  // Saturday
  ];

  // Pickup rules.
  //  cutoff: order before this time for pickup the next day we're open
  //  slotStep: minutes between pickup slots
  //  lastSlotBeforeClose: the last slot is this many minutes before closing
  //  daysAhead: how far ahead people can book a pickup
  const PICKUP = {
    cutoff: '14:00',
    slotStep: 30,
    lastSlotBeforeClose: 30,
    daysAhead: 14,
    notesMax: 200
  };

  /* ------------------------------------------------------------------
   * 2. Bakes. Every price, card, basket line and bake-board entry is
   *    worked out from PRODUCTS.
   *    days: weekdays it's baked (0 = Sunday … 6 = Saturday), or null
   *          for every day we're open.
   *    max: most you can preorder in one order.
   *    leadDays: days' notice (default 1, i.e. order by the cutoff the day before).
   *    art: how the bake is drawn (see section 6).
   * ------------------------------------------------------------------ */
  const CATEGORIES = [
    { id: 'bread', label: 'Bread', blurb: 'Long-fermented loaves, shaped by hand' },
    { id: 'pastry', label: 'Pastries', blurb: 'Laminated with Fish Creek butter' },
    { id: 'bakes', label: 'Cakes & bakes', blurb: 'Slices, cookies and things with custard' },
    { id: 'whole', label: 'Whole cakes', blurb: 'Two days’ notice, boxed and ribboned' }
  ];

  const ALLERGENS = {
    gluten: 'gluten', milk: 'milk', egg: 'egg', nuts: 'tree nuts', sesame: 'sesame',
    soya: 'soy', sulphites: 'sulfites', mustard: 'mustard'
  };
  const DIETS = {
    vegan: { label: 'Vegan', short: 'VG' },
    vegetarian: { label: 'Vegetarian', short: 'V' },
    gf: { label: 'Gluten-free', short: 'GF' },
    df: { label: 'Dairy-free', short: 'DF' }
  };

  const PRODUCTS = [
    // Bread
    { id: 'country-sourdough', name: 'Country sourdough', category: 'bread', price: 9, unit: '1¾ lb loaf', days: null, max: 4,
      blurb: 'Our everyday loaf: Greenfield Mill white and a little wholemeal, fermented for 36 hours. Blistered crust, custardy crumb.',
      allergens: ['gluten'], diet: ['vegan'], art: { kind: 'boule', crust: '#c98744', top: '#dea468' } },
    { id: 'seeded-rye', name: 'Seeded Saratoga rye', category: 'bread', price: 10, unit: '2 lb pan loaf', days: [4, 6], max: 3,
      blurb: 'Dark, dense and keeps for a week. Rye sour, sunflower, linseed and toasted sesame, baked low and slow.',
      allergens: ['gluten', 'sesame'], diet: ['vegan'], art: { kind: 'tin', crust: '#7b4a2b', top: '#946038', seeds: true } },
    { id: 'baguette', name: 'Bramble baguette', category: 'bread', price: 4.5, unit: 'each', days: null, max: 6,
      blurb: 'Poolish baguette with a thin, shattering crust. Best eaten on the walk home.',
      allergens: ['gluten'], diet: ['vegan'], art: { kind: 'baguette', crust: '#d08f4a', top: '#e6b06d' } },
    { id: 'focaccia', name: 'Rosemary focaccia', category: 'bread', price: 8, unit: 'slab, serves 4', days: [0, 5, 6], max: 4,
      blurb: 'Bubbly, olive-oil-soaked and crisp underneath, with rosemary from the yard and flaky sea salt.',
      allergens: ['gluten'], diet: ['vegan'], art: { kind: 'focaccia' } },
    { id: 'spelt-honey', name: 'Spelt & honey loaf', category: 'bread', price: 9.5, unit: '1½ lb loaf', days: [2, 5], max: 3,
      blurb: 'Nutty wholegrain spelt sweetened with honey from Loughberry Lake hives. Great toasted with butter.',
      allergens: ['gluten'], diet: ['vegetarian'], art: { kind: 'tin', crust: '#b8763f', top: '#cf9156', oats: true } },
    { id: 'apple-rye', name: 'Apple & cider rye', category: 'bread', price: 11, unit: '1½ lb loaf', days: [5, 6], max: 2, special: 'Fall special',
      blurb: 'Rye and wheat sour with Kettle Lane Northern Spies and a splash of dry New York cider. Only while the apples last.',
      allergens: ['gluten', 'sulphites'], diet: ['vegan'], art: { kind: 'boule', crust: '#a9683a', top: '#c3824b', score: 'leaf' } },

    // Pastries
    { id: 'croissant', name: 'Butter croissant', category: 'pastry', price: 4.5, unit: 'each', days: null, max: 12,
      blurb: 'Three days from dough to oven, 81 layers of Fish Creek butter.',
      allergens: ['gluten', 'milk', 'egg'], diet: ['vegetarian'], art: { kind: 'croissant' } },
    { id: 'pain-au-chocolat', name: 'Pain au chocolat', category: 'pastry', price: 5, unit: 'each', days: null, max: 12,
      blurb: 'Croissant dough wrapped around two batons of 70% dark chocolate.',
      allergens: ['gluten', 'milk', 'egg', 'soya'], diet: ['vegetarian'], art: { kind: 'painchoc' } },
    { id: 'cardamom-bun', name: 'Cardamom knot', category: 'pastry', price: 5, unit: 'each', days: null, max: 12,
      blurb: 'Swedish-style knot, freshly ground cardamom and a crunch of pearl sugar. Our bestseller.',
      allergens: ['gluten', 'milk', 'egg'], diet: ['vegetarian'], art: { kind: 'knot' } },
    { id: 'cinnamon-bun', name: 'Cinnamon bun', category: 'pastry', price: 5, unit: 'each', days: null, max: 12,
      blurb: 'Soft, sticky and well spiced, finished with a brown-butter glaze.',
      allergens: ['gluten', 'milk', 'egg'], diet: ['vegetarian'], art: { kind: 'bun' } },
    { id: 'almond-croissant', name: 'Almond croissant', category: 'pastry', price: 5.75, unit: 'each', days: [0, 3, 6], max: 8,
      blurb: 'Yesterday’s croissants, soaked in syrup and baked again with frangipane and flaked almonds.',
      allergens: ['gluten', 'milk', 'egg', 'nuts'], diet: ['vegetarian'], art: { kind: 'croissant', almonds: true } },
    { id: 'pumpkin-bun', name: 'Pumpkin morning bun', category: 'pastry', price: 5.5, unit: 'each', days: [0, 6], max: 8, special: 'Fall special',
      blurb: 'Laminated bun rolled with roast pumpkin, brown sugar and nutmeg, tossed in orange sugar.',
      allergens: ['gluten', 'milk', 'egg'], diet: ['vegetarian'], art: { kind: 'bun', dough: '#e3a04f', swirl: '#b8692c' } },
    { id: 'cheddar-scone', name: 'Leek & cheddar scone', category: 'pastry', price: 4.75, unit: 'each', days: null, max: 8,
      blurb: 'Savory, buttery and generous, with sharp New York cheddar and a little hot mustard.',
      allergens: ['gluten', 'milk', 'egg', 'mustard'], diet: ['vegetarian'], art: { kind: 'scone' } },

    // Cakes & bakes
    { id: 'plum-tart', name: 'Plum & frangipane tart', category: 'bakes', price: 6.5, unit: 'slice', days: [3, 4, 5, 6, 0], max: 8, special: 'This week only',
      blurb: 'Sweet pastry, almond frangipane and Stanley plums from Kettle Lane, glazed with their own jam.',
      allergens: ['gluten', 'milk', 'egg', 'nuts'], diet: ['vegetarian'], art: { kind: 'tart' } },
    { id: 'lemon-drizzle', name: 'Lemon glaze loaf', category: 'bakes', price: 24, unit: 'whole loaf, serves 8', days: null, max: 2,
      blurb: 'Sharp, sticky and soaked right through. Feeds an office, or two people for a week.',
      allergens: ['gluten', 'milk', 'egg'], diet: ['vegetarian'], art: { kind: 'loafcake' } },
    { id: 'brown-butter-cookie', name: 'Brown butter cookie', category: 'bakes', price: 3.75, unit: 'each', days: null, max: 12,
      blurb: 'Crisp edges, chewy middle, dark chocolate chunks and a pinch of sea salt.',
      allergens: ['gluten', 'milk', 'egg', 'soya'], diet: ['vegetarian'], art: { kind: 'cookie' } },
    { id: 'buckwheat-brownie', name: 'Buckwheat brownie', category: 'bakes', price: 4.75, unit: 'each', days: null, max: 12,
      blurb: 'Fudgy and made without gluten, with buckwheat flour and a crackly top.',
      allergens: ['milk', 'egg', 'soya'], diet: ['vegetarian', 'gf'], art: { kind: 'brownie' } },

    // Whole cakes (two days' notice)
    { id: 'victoria-sponge', name: 'Vanilla berry cake', category: 'whole', price: 58, unit: '8-inch, serves 12', days: null, max: 2, leadDays: 2,
      blurb: 'Vanilla cake, raspberry jam, vanilla buttercream and fresh berries. A classic for a reason.',
      allergens: ['gluten', 'milk', 'egg'], diet: ['vegetarian'], art: { kind: 'layercake', sponge: '#f3d38b', frosting: '#fff6e8', filling: '#c2334d', top: 'berries' } },
    { id: 'carrot-cake', name: 'Carrot & walnut cake', category: 'whole', price: 62, unit: '8-inch, serves 14', days: null, max: 2, leadDays: 2,
      blurb: 'Spiced and moist, with cream cheese frosting and candied walnuts.',
      allergens: ['gluten', 'milk', 'egg', 'nuts'], diet: ['vegetarian'], art: { kind: 'layercake', sponge: '#c88447', frosting: '#fbf0dc', filling: '#fbf0dc', top: 'walnuts' } },
    { id: 'chocolate-cake', name: 'Chocolate fudge cake', category: 'whole', price: 62, unit: '8-inch, serves 14', days: null, max: 2, leadDays: 2,
      blurb: 'Three layers of dark chocolate cake, salted caramel and a glossy ganache drip.',
      allergens: ['gluten', 'milk', 'egg', 'soya'], diet: ['vegetarian'], art: { kind: 'layercake', sponge: '#5c3424', frosting: '#7a4a35', filling: '#d99a4e', top: 'drip' } },
    { id: 'vegan-lemon-cake', name: 'Lemon & elderflower cake', category: 'whole', price: 60, unit: '8-inch, serves 12', days: null, max: 2, leadDays: 2,
      blurb: 'Fully plant-based: lemon cake, elderflower syrup and a whipped coconut lemon frosting.',
      allergens: ['gluten', 'soya'], diet: ['vegan'], art: { kind: 'layercake', sponge: '#f1d36b', frosting: '#fdf6d8', filling: '#f2c94c', top: 'flowers' } }
  ];

  // Today's bake board on the home page. out: when the first tray comes out;
  // soldOut (optional): when it usually runs out. Items only show on the
  // days they're baked (PRODUCTS.days). "Baking now" starts BAKING_MINS before out.
  const BAKE_SCHEDULE = [
    { id: 'croissant', out: '07:00', soldOut: '12:30' },
    { id: 'country-sourdough', out: '07:15' },
    { id: 'pain-au-chocolat', out: '07:20', soldOut: '12:00' },
    { id: 'baguette', out: '07:40' },
    { id: 'cardamom-bun', out: '08:00', soldOut: '11:30' },
    { id: 'cinnamon-bun', out: '08:30', soldOut: '13:00' },
    { id: 'pumpkin-bun', out: '09:00', soldOut: '12:00' },
    { id: 'almond-croissant', out: '09:30', soldOut: '13:30' },
    { id: 'seeded-rye', out: '10:00' },
    { id: 'focaccia', out: '10:30', soldOut: '14:30' },
    { id: 'apple-rye', out: '11:00' },
    { id: 'spelt-honey', out: '11:00' },
    { id: 'cheddar-scone', out: '11:30' },
    { id: 'plum-tart', out: '12:00' },
    { id: 'buckwheat-brownie', out: '13:00' }
  ];
  const BAKING_MINS = 45;

  /* ------------------------------------------------------------------
   * 3. Café menu (cafe.html) and celebration cake options (cakes.html).
   *    diet: any of 'vegan', 'vegetarian', 'gf', 'df' (see DIETS).
   * ------------------------------------------------------------------ */
  const CAFE_MENU = [
    { id: 'coffee', title: 'Coffee', note: 'High Rock Coffee espresso, roasted in Saratoga Springs. Oat milk at no extra cost.', items: [
      { name: 'Espresso', price: 3.5, desc: 'Double shot of our house blend, chocolatey and round.', diet: ['vegan', 'gf', 'df'] },
      { name: 'Flat white', price: 4.75, desc: 'Double shot, silky milk.', diet: ['vegetarian', 'gf'] },
      { name: 'Cappuccino', price: 4.75, desc: 'With a dusting of cocoa if you ask nicely.', diet: ['vegetarian', 'gf'] },
      { name: 'Batch brew', price: 3.5, desc: 'Rotating single origin, ask what’s on today.', diet: ['vegan', 'gf', 'df'] },
      { name: 'Cardamom latte', price: 5.5, desc: 'Our own cardamom and brown sugar syrup.', diet: ['vegetarian', 'gf'] }
    ] },
    { id: 'tea', title: 'Tea & other things', note: 'Loose-leaf tea in real teapots.', items: [
      { name: 'Pot of breakfast tea', price: 4.5, desc: 'Strong Assam blend, serves two cups.', diet: ['vegan', 'gf', 'df'] },
      { name: 'Fresh mint & lemon', price: 4, desc: 'Leaves from the back yard planters.', diet: ['vegan', 'gf', 'df'] },
      { name: 'Real hot chocolate', price: 5, desc: 'Melted 70% chocolate, whole milk, a pinch of salt.', diet: ['vegetarian', 'gf'] },
      { name: 'Apple & ginger press', price: 5.5, desc: 'Cold-pressed Kettle Lane apples with fresh ginger.', diet: ['vegan', 'gf', 'df'] }
    ] },
    { id: 'brunch', title: 'Brunch', note: 'Served 9am to 2pm, Tuesday to Sunday.', items: [
      { name: 'Sourdough toast & cultured butter', price: 6.5, desc: 'Two thick slices with jam from the shelf.', diet: ['vegetarian'] },
      { name: 'Eggs on toast', price: 12, desc: 'Wren Hollow Farm eggs, soft scrambled, on country sourdough. Add bacon $4.', diet: ['vegetarian'] },
      { name: 'Mushrooms on rye', price: 14, desc: 'Garlicky mushrooms, white bean purée, herbs and chili oil.', diet: ['vegan', 'df'] },
      { name: 'Cheddar rarebit', price: 13.5, desc: 'New York cheddar and ale on toasted sourdough, pickled shallots.', diet: ['vegetarian'] },
      { name: 'Seasonal granola bowl', price: 11, desc: 'Buckwheat granola, poached plums, yogurt and honey.', diet: ['vegetarian', 'gf'] },
      { name: 'Focaccia sandwich', price: 13, desc: 'Roast squash, whipped feta, arugula and pickled chili. Fri to Sun.', diet: ['vegetarian'] }
    ] },
    { id: 'sweet', title: 'Sweet things', note: 'Anything on the counter, plus these.', items: [
      { name: 'Cardamom knot & a coffee', price: 8.75, desc: 'Our bestseller with any espresso drink.', diet: ['vegetarian'] },
      { name: 'Cinnamon French toast', price: 13, desc: 'Yesterday’s brioche, brown butter apples, crème fraîche.', diet: ['vegetarian'] },
      { name: 'Buckwheat brownie', price: 4.75, desc: 'Fudgy, crackly top, made without gluten.', diet: ['vegetarian', 'gf'] },
      { name: 'Vegan banana bread', price: 5, desc: 'Toasted, with maple and a sprinkle of salt.', diet: ['vegan', 'df'] }
    ] }
  ];

  // Celebration cakes. factor scales the finish and sponge extras for bigger cakes.
  // tiers: diameter of each tier in inches, bottom first (used for the drawing).
  const CAKE = {
    leadDays: 4,       // days' notice for a celebration cake
    daysAhead: 90,     // how far ahead a celebration cake can be booked
    messageMax: 30,    // characters piped on the plaque
    maxPerOrder: 2,
    sizes: [
      { id: '6in', label: '6-inch', serves: '8–10', price: 68, factor: 1, tiers: [6] },
      { id: '8in', label: '8-inch', serves: '14–16', price: 88, factor: 1.3, tiers: [8] },
      { id: '10in', label: '10-inch', serves: '24–28', price: 125, factor: 1.7, tiers: [10] },
      { id: 'two-tier', label: 'Two tiers', serves: '35–40', price: 225, factor: 2.4, tiers: [9, 6] },
      { id: 'three-tier', label: 'Three tiers', serves: '60–70', price: 350, factor: 3.4, tiers: [10, 8, 6] }
    ],
    sponges: [
      { id: 'vanilla', label: 'Vanilla bean', price: 0, colour: '#f2d48f', diet: ['vegetarian'] },
      { id: 'chocolate', label: 'Dark chocolate', price: 0, colour: '#5f3626', diet: ['vegetarian'] },
      { id: 'lemon', label: 'Lemon & poppy seed', price: 0, colour: '#f3dc7a', diet: ['vegetarian'] },
      { id: 'carrot', label: 'Carrot & walnut', price: 6, colour: '#c98a4c', diet: ['vegetarian'] },
      { id: 'vegan-choc', label: 'Vegan chocolate', price: 8, colour: '#55301f', diet: ['vegan'] }
    ],
    fillings: [
      { id: 'raspberry', label: 'Raspberry jam & vanilla buttercream', price: 0, colour: '#c43c58' },
      { id: 'caramel', label: 'Salted caramel', price: 0, colour: '#d39448' },
      { id: 'lemon-curd', label: 'Lemon curd & mascarpone', price: 0, colour: '#f2cf4a' },
      { id: 'ganache', label: 'Chocolate ganache', price: 0, colour: '#4a2a1d' },
      { id: 'blackberry', label: 'Blackberry & bay (seasonal)', price: 5, colour: '#5d2346' }
    ],
    finishes: [
      { id: 'naked', label: 'Naked', note: 'A thin scrape of buttercream, layers on show', price: 0, colour: false },
      { id: 'smooth', label: 'Smooth buttercream', note: 'Piped border, in your color', price: 10, colour: true },
      { id: 'drip', label: 'Chocolate drip', note: 'Glossy ganache running down the sides', price: 15, colour: true },
      { id: 'flowers', label: 'Pressed flowers', note: 'Edible violas and cornflowers', price: 20, colour: true },
      { id: 'sprinkles', label: 'Sprinkles', note: 'Hand-mixed, no glitter', price: 8, colour: true }
    ],
    colours: [
      { id: 'cream', label: 'Cream', hex: '#fbf1dc' },
      { id: 'blush', label: 'Blush', hex: '#f4c9c4' },
      { id: 'pistachio', label: 'Pistachio', hex: '#cfdcb1' },
      { id: 'butter', label: 'Butter', hex: '#f6df92' },
      { id: 'lilac', label: 'Lilac', hex: '#d9cbe9' },
      { id: 'sky', label: 'Sky', hex: '#c6dfe9' }
    ],
    allergens: ['gluten', 'milk', 'egg']
  };

  /* ------------------------------------------------------------------
   * 4. Helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const round2 = (n) => Math.round(n * 100) / 100;
  const money = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });
  // $9.50, but whole dollars without cents ($58).
  function price(n) {
    return Number.isInteger(n) ? money.format(n).replace(/\.00$/, '') : money.format(n);
  }

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
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function wholeNumber(value, min, max, fallback) {
    const n = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
    return isFinite(n) ? Math.min(max, Math.max(min, Math.floor(n))) : fallback;
  }
  function urlParams() {
    const out = new URLSearchParams();
    new URLSearchParams(location.search).forEach((v, k) => out.append(k.toLowerCase(), v));
    return out;
  }
  function listText(items) {
    if (items.length < 2) return items.join('');
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  const findProduct = (id) => PRODUCTS.find((p) => p.id === id) || null;
  const findCategory = (id) => CATEGORIES.find((c) => c.id === id) || null;
  const byId = (list, id) => list.find((x) => x.id === id) || null;

  function dietTags(diet, small) {
    return ['vegan', 'vegetarian', 'gf', 'df'].filter((d) => diet.indexOf(d) !== -1)
      // Vegan already implies vegetarian and dairy-free: show one badge.
      .filter((d) => !((d === 'vegetarian' || d === 'df') && diet.indexOf('vegan') !== -1))
      .map((d) => '<span class="tag tag-' + d + '"' + (small ? ' title="' + DIETS[d].label + '"' : '') + '>' +
        (small ? DIETS[d].short + '<span class="sr-only"> (' + DIETS[d].label + ')</span>' : DIETS[d].label) + '</span>').join('');
  }
  function allergenText(list) {
    return list.length ? 'Contains ' + listText(list.map((a) => ALLERGENS[a] || a)) + '.' : 'No major allergens.';
  }

  /* ------------------------------------------------------------------
   * 5. Shop clock. Everything uses the bakery's clock (TIMEZONE).
   *    Dates are 'YYYY-MM-DD' strings in that zone.
   * ------------------------------------------------------------------ */
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const toMins = (hhmm) => { const p = hhmm.split(':'); return +p[0] * 60 + +p[1]; };
  const pad = (n) => String(n).padStart(2, '0');
  const hhmm = (mins) => pad(Math.floor(mins / 60) % 24) + ':' + pad(mins % 60);
  // 450 → "7:30am", 720 → "12 noon", 960 → "4pm"
  function clock(mins) {
    const h = Math.floor(mins / 60) % 24, m = mins % 60;
    if (h === 12 && m === 0) return '12 noon';
    return (h % 12 || 12) + (m ? ':' + pad(m) : '') + (h < 12 ? 'am' : 'pm');
  }

  // Now in the shop's time zone: { date: 'YYYY-MM-DD', day: 0-6, mins: minutes since midnight }.
  // Add ?now=2026-10-17T10:15 to any page to preview another time (handy for testing).
  function shopNow() {
    const preview = urlParams().get('now');
    if (preview && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(preview)) {
      return { date: preview.slice(0, 10), day: dayOf(preview.slice(0, 10)), mins: toMins(preview.slice(11)) };
    }
    const parts = {};
    new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(new Date()).forEach((p) => { parts[p.type] = p.value; });
    const date = parts.year + '-' + parts.month + '-' + parts.day;
    return { date: date, day: dayOf(date), mins: (+parts.hour % 24) * 60 + +parts.minute };
  }
  function addDays(isoDate, n) {
    const d = new Date(isoDate + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function dayOf(isoDate) { return new Date(isoDate + 'T12:00:00Z').getUTCDay(); }
  const isIsoDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(new Date(s + 'T12:00:00Z'));
  function fmtDate(isoDate, opts) {
    return new Intl.DateTimeFormat(LOCALE, Object.assign({ weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }, opts || {}))
      .format(new Date(isoDate + 'T12:00:00Z'));
  }
  // "Tomorrow", "Today", or "Saturday, October 17" (short: "Sat, Oct 17").
  function dateLabel(isoDate, short) {
    const today = shopNow().date;
    const rel = isoDate === today ? 'Today' : isoDate === addDays(today, 1) ? 'Tomorrow' : '';
    const full = short ? fmtDate(isoDate, { weekday: 'short', month: 'short' }) : fmtDate(isoDate);
    return rel ? rel + (short ? '' : ', ' + full) : full;
  }
  const isOpenDay = (isoDate) => !!HOURS[dayOf(isoDate)];
  function hoursLabel(h) { return h ? clock(toMins(h[0])) + '–' + clock(toMins(h[1])) : 'Closed'; }

  // { open, soon, text } e.g. "Open now · until 4pm" / "Closed · opens Tuesday 7:30am"
  function shopStatus() {
    const now = shopNow();
    const h = HOURS[now.day];
    if (h && now.mins >= toMins(h[0]) && now.mins < toMins(h[1])) {
      const left = toMins(h[1]) - now.mins;
      return { open: true, soon: left <= 45, text: left <= 45 ? 'Closing soon, at ' + clock(toMins(h[1])) : 'Open now until ' + clock(toMins(h[1])) };
    }
    if (h && now.mins < toMins(h[0])) return { open: false, text: 'Opens today at ' + clock(toMins(h[0])) };
    for (let i = 1; i <= 7; i++) {
      const d = (now.day + i) % 7;
      if (HOURS[d]) return { open: false, text: 'Closed · opens ' + (i === 1 ? 'tomorrow' : DAY_NAMES[d]) + ' ' + clock(toMins(HOURS[d][0])) };
    }
    return { open: false, text: 'Closed' };
  }

  // Is this product baked on this date?
  function bakedOn(product, isoDate) {
    const day = dayOf(isoDate);
    if (!HOURS[day]) return false;
    return !product.days || product.days.indexOf(day) !== -1;
  }
  // "Every day we're open", "Fridays & Saturdays", "Wednesday to Sunday".
  // short: "Daily", "Fri & Sat", "Wed–Sun".
  function bakeDaysText(product, short) {
    if (!product.days) return short ? 'Daily' : 'Every day we’re open';
    const order = [1, 2, 3, 4, 5, 6, 0].filter((d) => HOURS[d]);
    const idx = order.map((d, i) => (product.days.indexOf(d) !== -1 ? i : -1)).filter((i) => i !== -1);
    const name = (i) => (short ? DAY_SHORT[order[i]] : DAY_NAMES[order[i]]);
    if (idx.length >= 3 && idx[idx.length - 1] - idx[0] === idx.length - 1) return name(idx[0]) + (short ? '–' : ' to ') + name(idx[idx.length - 1]);
    const names = idx.map((i) => name(i) + (short ? '' : 's'));
    return names.length === 1 ? names[0] + ' only' : names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1];
  }
  // Earliest pickup date for a lead time in days, honoring the cutoff
  // (order before PICKUP.cutoff for the next open day) and closed days.
  function earliestDate(leadDays) {
    const now = shopNow();
    let lead = Math.max(1, leadDays || 1);
    if (now.mins >= toMins(PICKUP.cutoff)) lead += 1;
    let d = addDays(now.date, lead);
    for (let i = 0; i < 7 && !isOpenDay(d); i++) d = addDays(d, 1);
    return d;
  }
  // The pickup dates on offer for a basket's lines: open days from the earliest
  // possible to PICKUP.daysAhead (CAKE.daysAhead when there's a celebration cake).
  function pickupDates(lines) {
    const first = earliestDate(leadOf(lines));
    const last = addDays(shopNow().date, lines.some((l) => l.id === 'cake') ? CAKE.daysAhead : PICKUP.daysAhead);
    const out = [];
    for (let d = first; d <= last; d = addDays(d, 1)) if (isOpenDay(d)) out.push(d);
    return out;
  }
  // Pickup slots on a date, in minutes: opening time to PICKUP.lastSlotBeforeClose before closing.
  function pickupSlots(isoDate) {
    const h = HOURS[dayOf(isoDate)];
    if (!h) return [];
    const out = [];
    for (let m = toMins(h[0]); m <= toMins(h[1]) - PICKUP.lastSlotBeforeClose; m += PICKUP.slotStep) out.push(m);
    return out;
  }
  // "Order in the next 2h 14m for pickup tomorrow" style countdown to the cutoff.
  function cutoffText() {
    const now = shopNow();
    const next = earliestDate(1);
    const nextName = next === addDays(now.date, 1) ? 'tomorrow' : DAY_NAMES[dayOf(next)];
    const left = toMins(PICKUP.cutoff) - now.mins;
    if (left > 0 && next === addDays(now.date, 1)) {
      const h = Math.floor(left / 60), m = left % 60;
      return 'Order in the next ' + (h ? h + 'h ' : '') + m + 'm for pickup tomorrow';
    }
    return 'Preorders open for ' + nextName + ', ' + fmtDate(next, { weekday: undefined, day: 'numeric', month: 'long' });
  }

  /* ------------------------------------------------------------------
   * 6. Bake artwork. Each bake is drawn as inline SVG from its art
   *    settings (PRODUCTS[].art.kind plus colors), in an inked, hand-made
   *    style. Art.bake(art) returns a 120×120 drawing; Art.cake(config)
   *    draws a celebration cake from the cake builder's choices.
   * ------------------------------------------------------------------ */
  /* ART:START */
  const Art = (function () {
    const INK = '#3a2620';
    const f = (n) => Math.round(n * 10) / 10;
    // Small seeded random generator, so the same bake always looks the same.
    function rng(seed) {
      let h = 2166136261;
      for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
      return function () {
        h += 0x6D2B79F5;
        let t = h;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const ink = (w) => ' stroke="' + INK + '" stroke-width="' + (w || 2.2) + '" stroke-linejoin="round" stroke-linecap="round"';
    const shadow = (cx, cy, rx) => '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="5" fill="' + INK + '" opacity=".12"/>';
    function dust(rand, n, x, y, w, h, colour) {
      let s = '';
      for (let i = 0; i < n; i++) s += '<circle cx="' + f(x + rand() * w) + '" cy="' + f(y + rand() * h) + '" r="' + f(0.8 + rand() * 1.1) + '" fill="' + (colour || '#fff8ec') + '" opacity=".9"/>';
      return s;
    }

    const draw = {
      boule(a, rand) {
        const crust = a.crust || '#c98744', top = a.top || '#dea468';
        let s = shadow(60, 95, 44) +
          '<path d="M15 80C13 52 36 31 60 31s47 21 45 49c-1 12-19 16-45 16S16 92 15 80Z" fill="' + crust + '"' + ink() + '/>' +
          '<path d="M25 66c4-17 19-27 35-27 17 0 31 9 35 24" fill="none" stroke="' + top + '" stroke-width="11" stroke-linecap="round" opacity=".85"/>';
        if (a.score === 'leaf') {
          s += '<path d="M32 62C46 50 74 48 90 58" fill="none" stroke="#f4e2c4" stroke-width="4.5" stroke-linecap="round"/>';
          [40, 52, 64, 76].forEach((x, i) => {
            const y = 58 - i * 1.4 + (i > 2 ? 2 : 0);
            s += '<path d="M' + x + ' ' + f(y) + 'l6 -9M' + x + ' ' + f(y) + 'l7 7" fill="none" stroke="#f4e2c4" stroke-width="3.2" stroke-linecap="round"/>';
          });
        } else {
          s += '<path d="M36 63C48 49 72 46 88 56" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round" opacity=".55"/>' +
            '<path d="M34 59C46 45 70 41 87 51" fill="none" stroke="#f6e6ca" stroke-width="6" stroke-linecap="round"/>';
        }
        return s + dust(rand, 14, 30, 40, 60, 28);
      },
      tin(a, rand) {
        const crust = a.crust || '#7b4a2b', top = a.top || '#946038';
        let s = shadow(60, 96, 46) +
          '<path d="M19 93V62c0-20 20-28 41-28s41 8 41 28v31a3 3 0 0 1-3 3H22a3 3 0 0 1-3-3Z" fill="' + crust + '"' + ink() + '/>' +
          '<path d="M24 58c2-13 18-18 36-18s34 5 36 18" fill="none" stroke="' + top + '" stroke-width="10" stroke-linecap="round"/>' +
          '<path d="M19 66h82" stroke="' + INK + '" stroke-width="1.6" opacity=".35"/>' +
          '<path d="M30 76v12M46 76v12M62 76v12M78 76v12M92 76v12" stroke="' + INK + '" stroke-width="1.4" opacity=".18" stroke-linecap="round"/>';
        for (let i = 0; i < (a.seeds || a.oats ? 26 : 0); i++) {
          const x = 26 + rand() * 68, y = 41 + rand() * 20 + Math.abs(x - 60) * 0.12;
          s += a.oats
            ? '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="3" ry="1.5" transform="rotate(' + f(rand() * 180) + ' ' + f(x) + ' ' + f(y) + ')" fill="#f3e2bd" stroke="' + INK + '" stroke-width=".7"/>'
            : '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="2.2" ry="1.3" transform="rotate(' + f(rand() * 180) + ' ' + f(x) + ' ' + f(y) + ')" fill="' + (rand() > 0.5 ? '#efdcab' : '#4b3a2c') + '"/>';
        }
        return s;
      },
      baguette(a) {
        const crust = a.crust || '#d08f4a', top = a.top || '#e6b06d';
        let s = shadow(60, 94, 46) + '<g transform="rotate(-22 60 64)">' +
          '<rect x="6" y="50" width="108" height="28" rx="14" fill="' + crust + '"' + ink() + '/>' +
          '<path d="M16 58h88" stroke="' + top + '" stroke-width="7" stroke-linecap="round" opacity=".8"/>';
        [22, 42, 62, 82].forEach((x) => {
          s += '<path d="M' + (x + 1) + ' 64q8-9 17-3" fill="none" stroke="' + INK + '" stroke-width="1.5" opacity=".5" stroke-linecap="round"/>' +
            '<path d="M' + x + ' 61q8-9 17-3" fill="none" stroke="#f6e6ca" stroke-width="4.5" stroke-linecap="round"/>';
        });
        return s + '</g>';
      },
      focaccia(a, rand) {
        let s = shadow(60, 96, 48) +
          '<rect x="12" y="42" width="96" height="52" rx="16" fill="#c98a3a"' + ink() + '/>' +
          '<rect x="12" y="34" width="96" height="50" rx="16" fill="#eab95d"' + ink() + '/>' +
          '<rect x="20" y="40" width="80" height="36" rx="11" fill="#f1c96f" opacity=".7"/>';
        for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) {
          const x = 24 + c * 14 + rand() * 4, y = 45 + r * 12 + rand() * 3;
          s += '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="2.8" fill="#c9852f" opacity=".8"/>';
        }
        [[34, 52, -30], [70, 46, 20], [82, 68, -10], [48, 70, 35]].forEach((p) => {
          s += '<g transform="rotate(' + p[2] + ' ' + p[0] + ' ' + p[1] + ')"><path d="M' + (p[0] - 9) + ' ' + p[1] + 'h18" stroke="#4d6b35" stroke-width="1.6" stroke-linecap="round"/>' +
            [-6, -2, 2, 6].map((d) => '<path d="M' + (p[0] + d) + ' ' + p[1] + 'l-2.5 -4M' + (p[0] + d) + ' ' + p[1] + 'l-2.5 4" stroke="#5f8a3c" stroke-width="1.8" stroke-linecap="round"/>').join('') + '</g>';
        });
        return s + dust(rand, 12, 20, 40, 80, 36, '#ffffff');
      },
      croissant(a, rand) {
        const tip = '#c57a37', mid = '#d8954a', ctr = '#e6ad5f';
        let s = shadow(60, 92, 46) +
          '<path d="M13 76c0-12 12-19 23-15l7 21c-12 7-29 6-30-6Z" fill="' + tip + '"' + ink() + '/>' +
          '<path d="M107 76c0-12-12-19-23-15l-7 21c12 7 29 6 30-6Z" fill="' + tip + '"' + ink() + '/>' +
          '<path d="M31 60c4-11 15-16 23-15l3 40c-8 2-16 1-21-2Z" fill="' + mid + '"' + ink() + '/>' +
          '<path d="M89 60c-4-11-15-16-23-15l-3 40c8 2 16 1 21-2Z" fill="' + mid + '"' + ink() + '/>' +
          '<path d="M47 46c6-10 20-10 26 0l1 40c-8 3-20 3-28 0Z" fill="' + ctr + '"' + ink() + '/>' +
          '<path d="M52 52c4-5 12-5 16 0M38 60c3-4 8-6 12-6M82 60c-3-4-8-6-12-6" fill="none" stroke="#f3cf8f" stroke-width="3" stroke-linecap="round"/>';
        if (a.almonds) {
          for (let i = 0; i < 9; i++) {
            const x = 38 + rand() * 44, y = 50 + rand() * 18;
            s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="4" ry="2.2" transform="rotate(' + f(rand() * 180) + ' ' + f(x) + ' ' + f(y) + ')" fill="#f6e7c9" stroke="' + INK + '" stroke-width=".8"/>';
          }
          s += dust(rand, 26, 30, 46, 60, 30, '#ffffff');
        }
        return s;
      },
      painchoc() {
        return shadow(60, 94, 44) +
          '<rect x="11" y="58" width="12" height="9" rx="3" fill="#4a2a1d"' + ink(1.6) + '/><rect x="97" y="58" width="12" height="9" rx="3" fill="#4a2a1d"' + ink(1.6) + '/>' +
          '<rect x="11" y="73" width="12" height="9" rx="3" fill="#4a2a1d"' + ink(1.6) + '/><rect x="97" y="73" width="12" height="9" rx="3" fill="#4a2a1d"' + ink(1.6) + '/>' +
          '<rect x="18" y="46" width="84" height="44" rx="14" fill="#d48f45"' + ink() + '/>' +
          '<path d="M24 56c14-8 58-8 72 0" fill="none" stroke="#ebb56a" stroke-width="9" stroke-linecap="round"/>' +
          '<path d="M22 70c16-5 60-5 76 0M23 80c16-4 58-4 74 0" fill="none" stroke="' + INK + '" stroke-width="1.5" opacity=".4" stroke-linecap="round"/>';
      },
      bun(a) {
        const dough = a.dough || '#d9954d', swirl = a.swirl || '#8d4f25';
        let d = '';
        for (let t = 0; t <= Math.PI * 5.2; t += 0.25) {
          const r = 3 + t * 2.05, x = 60 + Math.cos(t) * r, y = 62 + Math.sin(t) * r * 0.86;
          d += (t === 0 ? 'M' : 'L') + f(x) + ' ' + f(y);
        }
        return shadow(60, 96, 42) +
          '<ellipse cx="60" cy="66" rx="42" ry="35" fill="' + dough + '"' + ink() + '/>' +
          '<ellipse cx="60" cy="62" rx="42" ry="35" fill="' + dough + '"' + ink() + '/>' +
          '<path d="' + d + '" fill="none" stroke="' + swirl + '" stroke-width="4.5" stroke-linecap="round" opacity=".9"/>' +
          '<path d="M30 52c8 4 10-4 18 0s10-4 18 0 10-4 18 0M34 70c8 4 10-4 18 0s10-4 18 0 10-4 16 0" fill="none" stroke="#fff6e6" stroke-width="3" stroke-linecap="round" opacity=".95"/>';
      },
      knot(a, rand) {
        let s = shadow(60, 96, 42);
        [0, 60, 120].forEach((r, i) => {
          s += '<ellipse cx="60" cy="62" rx="36" ry="17" transform="rotate(' + r + ' 60 62)" fill="' + ['#cf8a45', '#d99a52', '#e3a961'][i] + '"' + ink() + '/>';
        });
        s += '<ellipse cx="60" cy="62" rx="16" ry="14" fill="#e8b46d"' + ink() + '/>' +
          '<path d="M50 58c6-6 14-6 20 0" fill="none" stroke="#f4d197" stroke-width="3" stroke-linecap="round"/>';
        for (let i = 0; i < 22; i++) {
          const ang = rand() * Math.PI * 2, rr = 8 + rand() * 28;
          const x = 60 + Math.cos(ang) * rr, y = 62 + Math.sin(ang) * rr * 0.8;
          s += '<rect x="' + f(x) + '" y="' + f(y) + '" width="2.6" height="2.4" rx=".8" fill="#ffffff" stroke="' + INK + '" stroke-width=".5" transform="rotate(' + f(rand() * 90) + ' ' + f(x) + ' ' + f(y) + ')"/>';
        }
        return s;
      },
      scone(a, rand) {
        let s = shadow(60, 94, 40) +
          '<path d="M24 56v26c0 10 72 10 72 0V56Z" fill="#e8b66a"' + ink() + '/>' +
          '<path d="M30 74c10 4 50 4 60 0" fill="none" stroke="#f3d39c" stroke-width="4" stroke-linecap="round"/>' +
          '<ellipse cx="60" cy="56" rx="36" ry="14" fill="#cf8b42"' + ink() + '/>';
        [[48, 54, 10, 5], [68, 52, 9, 4.5], [60, 60, 8, 3.5]].forEach((c) => {
          s += '<ellipse cx="' + c[0] + '" cy="' + c[1] + '" rx="' + c[2] + '" ry="' + c[3] + '" fill="#f2c04d" opacity=".95"/>';
        });
        for (let i = 0; i < 7; i++) {
          const x = 36 + rand() * 48, y = 50 + rand() * 10;
          s += '<path d="M' + f(x) + ' ' + f(y) + 'l4 -2" stroke="#6f9440" stroke-width="2.4" stroke-linecap="round"/>';
        }
        return s;
      },
      tart(a, rand) {
        let s = shadow(60, 96, 46) +
          '<ellipse cx="60" cy="70" rx="46" ry="24" fill="#c98640"' + ink() + '/>' +
          '<ellipse cx="60" cy="64" rx="46" ry="24" fill="#e0a55a"' + ink() + '/>' +
          '<ellipse cx="60" cy="64" rx="38" ry="18" fill="#efcf8f"/>';
        // A fan of plum slices in two rings.
        [[29, 13.5, 14, 6.5], [14, 6.5, 8, 5]].forEach((ring) => {
          for (let i = 0; i < ring[2]; i++) {
            const t = (i / ring[2]) * Math.PI * 2, x = 60 + Math.cos(t) * ring[0], y = 64 + Math.sin(t) * ring[1];
            const deg = f((t * 180) / Math.PI + 90);
            s += '<ellipse cx="' + f(x) + '" cy="' + f(y) + '" rx="' + ring[3] + '" ry="2.8" transform="rotate(' + deg + ' ' + f(x) + ' ' + f(y) + ')" fill="#7d2a4f" stroke="#4e1631" stroke-width=".8"/>' +
              '<ellipse cx="' + f(x) + '" cy="' + f(y - 0.6) + '" rx="' + f(ring[3] - 2) + '" ry="1" transform="rotate(' + deg + ' ' + f(x) + ' ' + f(y) + ')" fill="#c4568a" opacity=".8"/>';
          }
        });
        return s + '<ellipse cx="60" cy="64" rx="4" ry="2.6" fill="#7d2a4f"/><path d="M30 54c10-6 22-8 34-8" fill="none" stroke="#fff" stroke-width="2" opacity=".5" stroke-linecap="round"/>';
      },
      cookie(a, rand) {
        let s = shadow(60, 96, 38) +
          '<path d="M24 62c0-20 16-34 36-34s36 13 36 33-16 33-36 33-36-12-36-32Z" fill="#d7a05a"' + ink() + '/>' +
          '<path d="M30 60c0-15 13-26 30-26" fill="none" stroke="#e8bd7c" stroke-width="6" stroke-linecap="round"/>';
        for (let i = 0; i < 7; i++) {
          const x = 38 + rand() * 42, y = 42 + rand() * 38;
          s += '<path d="M' + f(x) + ' ' + f(y) + 'l5 -2 3 4 -4 4 -5 -1Z" fill="#3d2318" transform="rotate(' + f(rand() * 90) + ' ' + f(x) + ' ' + f(y) + ')"/>';
        }
        return s + '<path d="M44 76l6-3M66 50l5 3M74 72l-4 4" stroke="' + INK + '" stroke-width="1.2" opacity=".4" stroke-linecap="round"/>' + dust(rand, 7, 36, 40, 48, 40, '#ffffff');
      },
      brownie() {
        return shadow(62, 94, 42) +
          '<path d="M22 54l28 16v22L22 76Z" fill="#432517"' + ink() + '/>' +
          '<path d="M50 70l50-14v22L50 92Z" fill="#53301f"' + ink() + '/>' +
          '<path d="M22 54l50-14 28 16-50 14Z" fill="#6a3d28"' + ink() + '/>' +
          '<path d="M38 52l12 4 10-6M58 46l8 6 12-2M44 60l14-2 8 4" fill="none" stroke="#a06b4a" stroke-width="1.6" stroke-linecap="round"/>' +
          '<path d="M24 70l24 13M54 84l44-12" stroke="#2a160e" stroke-width="1.2" opacity=".5"/>';
      },
      loafcake(a, rand) {
        let drips = 'M17 60C22 44 98 44 103 60';
        for (let x = 101; x >= 19; x -= 8) drips += 'L' + x + ' ' + f(60 + (rand() > 0.45 ? 6 + rand() * 9 : 2)) + 'L' + (x - 4) + ' 60';
        return shadow(60, 96, 46) +
          '<path d="M15 60l7 33h76l7-33Z" fill="#e8b25b"' + ink() + '/>' +
          '<path d="M24 72h72M26 82h68" stroke="#f3cd85" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M15 60C20 40 100 40 105 60Z" fill="#d9993f"' + ink() + '/>' +
          '<path d="' + drips + 'Z" fill="#fffaf0"' + ink(1.4) + '/>' +
          '<circle cx="60" cy="47" r="9" fill="#f6dc55"' + ink(1.6) + '/><circle cx="60" cy="47" r="6" fill="#fbeea0"/>' +
          '<path d="M60 41v12M54 47h12M56 43l8 8M64 43l-8 8" stroke="#f0c93a" stroke-width="1"/>';
      },
      layercake(a, rand) {
        const sponge = a.sponge || '#f3d38b', frosting = a.frosting || '#fff6e8', filling = a.filling || '#c2334d';
        let s = '<ellipse cx="60" cy="95" rx="52" ry="7" fill="#fffdf8"' + ink(1.8) + '/>' +
          '<rect x="18" y="40" width="84" height="52" rx="5" fill="' + sponge + '"' + ink() + '/>' +
          '<rect x="19" y="56" width="82" height="5" fill="' + filling + '"/><rect x="19" y="73" width="82" height="5" fill="' + filling + '"/>' +
          '<rect x="18" y="40" width="84" height="52" rx="5" fill="' + frosting + '" opacity=".38"/>' +
          '<rect x="18" y="40" width="84" height="52" rx="5" fill="none"' + ink() + '/>' +
          '<ellipse cx="60" cy="40" rx="42" ry="9" fill="' + frosting + '"' + ink() + '/>';
        if (a.top === 'berries') {
          [[40, 38, '#c42f47'], [52, 35, '#5b4fa3'], [62, 39, '#c42f47'], [74, 36, '#c42f47'], [83, 40, '#5b4fa3'], [47, 42, '#5b4fa3']].forEach((b) => {
            s += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="4.2" fill="' + b[2] + '"' + ink(1.2) + '/>';
          });
          s += '<path d="M60 31l2-4 3 3" fill="none" stroke="#4d6b35" stroke-width="1.6" stroke-linecap="round"/>';
        } else if (a.top === 'walnuts') {
          [[40, 38], [56, 36], [70, 40], [82, 37]].forEach((w) => {
            s += '<path d="M' + w[0] + ' ' + w[1] + 'c-3-5 4-8 6-4 2-4 9-1 6 4-2 4-10 4-12 0Z" fill="#9a5f30"' + ink(1) + '/>';
          });
        } else if (a.top === 'drip') {
          let d = 'M18 42';
          for (let x = 18; x <= 102; x += 7) d += 'L' + x + ' ' + f(44 + (rand() > 0.4 ? 5 + rand() * 12 : 2)) + 'L' + Math.min(102, x + 3.5) + ' 44';
          s += '<path d="' + d + 'L102 40L18 40Z" fill="#3a2016"/><ellipse cx="60" cy="40" rx="42" ry="9" fill="#3a2016"' + ink() + '/>' +
            '<path d="M36 37c8-4 30-5 46 0" fill="none" stroke="#7a4a35" stroke-width="2" stroke-linecap="round"/>' +
            '<circle cx="50" cy="36" r="3.4" fill="#d99a4e"' + ink(1) + '/><circle cx="66" cy="38" r="3.4" fill="#d99a4e"' + ink(1) + '/>';
        } else if (a.top === 'flowers') {
          [[40, 38, '#f2c94c'], [58, 36, '#ffffff'], [76, 39, '#f2c94c'], [50, 43, '#ffffff']].forEach((fl) => {
            for (let p = 0; p < 5; p++) {
              const t = (p / 5) * Math.PI * 2;
              s += '<circle cx="' + f(fl[0] + Math.cos(t) * 2.6) + '" cy="' + f(fl[1] + Math.sin(t) * 1.8) + '" r="2" fill="' + fl[2] + '"/>';
            }
            s += '<circle cx="' + fl[0] + '" cy="' + fl[1] + '" r="1.3" fill="#c97a1e"/>';
          });
        }
        return s;
      }
    };

    // A 120×120 bake. title: accessible name (omit for decorative art).
    function bake(art, title) {
      const fn = draw[(art && art.kind) || 'boule'] || draw.boule;
      const rand = rng(JSON.stringify(art || {}));
      return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"' + (title ? ' role="img" aria-label="' + title + '"' : ' aria-hidden="true" focusable="false"') + '>' + fn(art || {}, rand) + '</svg>';
    }

    // A celebration cake drawn from the builder's choices. All colors come
    // from CAKE; cfg = { tiers: [inches…], sponge, filling, finish, colour, message }.
    function cake(cfg, title) {
      const W = 360, base = 272;
      const tiers = cfg.tiers || [8];
      const th = tiers.length === 1 ? 118 : tiers.length === 2 ? 92 : 70;
      // One tier: bigger cakes are wider. Stacked tiers: each step clearly smaller.
      const widthOf = (inch) => tiers.length === 1 ? 100 + inch * 15 : inch * 25;
      const rand = rng(JSON.stringify(cfg));
      const frost = cfg.finish === 'naked' ? '#fbf1dc' : cfg.colourHex || '#fbf1dc';
      let s = '<ellipse cx="180" cy="' + (base + 22) + '" rx="150" ry="9" fill="' + INK + '" opacity=".1"/>' +
        '<path d="M150 ' + (base + 6) + 'h60l10 20h-80Z" fill="#fffdf8"' + ink(2) + '/>' +
        '<ellipse cx="180" cy="' + base + '" rx="146" ry="14" fill="#fffdf8"' + ink(2.4) + '/>';
      tiers.forEach((inch, i) => {
        const w = widthOf(inch), x = 180 - w / 2, y = base - th * (i + 1) - 2, ry = Math.max(7, w * 0.06);
        if (cfg.finish === 'naked') {
          s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + th + '" rx="6" fill="' + cfg.spongeHex + '"' + ink(2.4) + '/>';
          [1, 2].forEach((k) => {
            s += '<rect x="' + (x + 1) + '" y="' + f(y + (th * k) / 3 - 3) + '" width="' + (w - 2) + '" height="6" fill="' + cfg.fillingHex + '"/>';
          });
          s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + th + '" rx="6" fill="#fffaf0" opacity=".42"/>';
          for (let k = 0; k < 5; k++) {
            const sx = x + 8 + rand() * (w - 30), sy = y + 8 + rand() * (th - 20);
            s += '<path d="M' + f(sx) + ' ' + f(sy) + 'q8 -3 16 1" fill="none" stroke="#fffaf0" stroke-width="5" stroke-linecap="round" opacity=".8"/>';
          }
          s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + th + '" rx="6" fill="none"' + ink(2.4) + '/>';
        } else {
          s += '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + th + '" rx="6" fill="' + frost + '"' + ink(2.4) + '/>' +
            '<rect x="' + (x + 7) + '" y="' + (y + 10) + '" width="7" height="' + (th - 22) + '" rx="3.5" fill="#ffffff" opacity=".45"/>';
          if (cfg.finish === 'smooth' || cfg.finish === 'sprinkles' || cfg.finish === 'flowers') {
            for (let px = x + 7; px <= x + w - 6; px += 11) s += '<circle cx="' + f(px) + '" cy="' + (y + th - 2) + '" r="5.2" fill="' + frost + '"' + ink(1.4) + '/>';
          }
          if (cfg.finish === 'drip') {
            let d = 'M' + x + ' ' + y;
            for (let px = x; px < x + w; px += 9) {
              const len = rand() > 0.35 ? 10 + rand() * (th * 0.42) : 4;
              d += 'L' + f(px) + ' ' + f(y + 4) + 'Q' + f(px + 1) + ' ' + f(y + len + 4) + ' ' + f(px + 4.5) + ' ' + f(y + len + 4) + 'Q' + f(px + 8) + ' ' + f(y + len + 4) + ' ' + f(px + 9) + ' ' + f(y + 4);
            }
            s += '<path d="' + d + 'L' + (x + w) + ' ' + y + 'Z" fill="#3a2016"' + ink(1.4) + '/>';
          }
          if (cfg.finish === 'sprinkles') {
            const cols = ['#e46d7f', '#f2c94c', '#6fb3c9', '#8fb36a', '#ffffff', '#b07cc6'];
            for (let k = 0; k < Math.round(w / 6); k++) {
              const sx = x + 8 + rand() * (w - 16), sy = y + 8 + rand() * (th - 22);
              s += '<rect x="' + f(sx) + '" y="' + f(sy) + '" width="7" height="2.6" rx="1.3" fill="' + cols[k % cols.length] + '" transform="rotate(' + f(rand() * 180) + ' ' + f(sx) + ' ' + f(sy) + ')"/>';
            }
          }
          if (cfg.finish === 'flowers') {
            const cols = [['#6b4fa8', '#f2c94c'], ['#3f73b8', '#ffffff'], ['#e9a1b4', '#c97a1e'], ['#f2c94c', '#c97a1e']];
            for (let k = 0; k < Math.max(3, Math.round(w / 34)); k++) {
              const cx = x + 16 + rand() * (w - 32), cy = y + 14 + rand() * (th - 34), c = cols[k % cols.length], r = 4.6 + rand() * 2;
              for (let p = 0; p < 5; p++) {
                const t = (p / 5) * Math.PI * 2 + k;
                s += '<circle cx="' + f(cx + Math.cos(t) * r) + '" cy="' + f(cy + Math.sin(t) * r) + '" r="' + f(r * 0.72) + '" fill="' + c[0] + '"/>';
              }
              s += '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(r * 0.45) + '" fill="' + c[1] + '"/>' +
                '<path d="M' + f(cx + r + 2) + ' ' + f(cy + 2) + 'q5 3 9 0" fill="none" stroke="#5f8a3c" stroke-width="1.6" stroke-linecap="round"/>';
            }
          }
        }
        // Top surface of this tier.
        const top = cfg.finish === 'drip' ? '#3a2016' : cfg.finish === 'naked' ? '#fbf1dc' : frost;
        s += '<ellipse cx="180" cy="' + y + '" rx="' + (w / 2) + '" ry="' + f(ry) + '" fill="' + top + '"' + ink(2.4) + '/>';
        if (i === tiers.length - 1) {
          if (cfg.finish === 'drip') s += '<circle cx="168" cy="' + (y - 3) + '" r="6" fill="#d99a4e"' + ink(1.4) + '/><circle cx="186" cy="' + (y - 1) + '" r="6" fill="#c43c58"' + ink(1.4) + '/>';
          else if (cfg.finish === 'naked') s += '<circle cx="164" cy="' + (y - 2) + '" r="5.5" fill="#c42f47"' + ink(1.2) + '/><circle cx="178" cy="' + (y - 4) + '" r="5.5" fill="#5b4fa3"' + ink(1.2) + '/><circle cx="192" cy="' + (y - 1) + '" r="5.5" fill="#c42f47"' + ink(1.2) + '/><path d="M200 ' + (y - 4) + 'q6 -8 12 -2" fill="none" stroke="#4d6b35" stroke-width="2" stroke-linecap="round"/>';
          else {
            // Piped dollops around the back rim of the top.
            for (let k = 0; k <= 8; k++) {
              const t = Math.PI + (k / 8) * Math.PI, dx = 180 + Math.cos(t) * (w / 2 - 11), dy = y + Math.sin(t) * (ry - 3);
              s += '<circle cx="' + f(dx) + '" cy="' + f(dy) + '" r="5.6" fill="' + frost + '"' + ink(1.3) + '/><circle cx="' + f(dx - 1.6) + '" cy="' + f(dy - 1.8) + '" r="1.6" fill="#ffffff" opacity=".7"/>';
            }
          }
        }
      });
      // The message, piped on a ribbon across the bottom tier.
      const msg = (cfg.message || '').trim();
      if (msg) {
        const w0 = widthOf(tiers[0]);
        const bw = Math.min(w0 - 30, 250), by = base - th * 0.5 - 16;
        const est = msg.length * 9.6;
        s += '<path d="M' + (180 - bw / 2 - 14) + ' ' + (by + 4) + 'h18v26h-18l7-13Z" fill="#561f42"/><path d="M' + (180 + bw / 2 + 14) + ' ' + (by + 4) + 'h-18v26h18l-7-13Z" fill="#561f42"/>' +
          '<rect x="' + (180 - bw / 2) + '" y="' + by + '" width="' + bw + '" height="32" rx="3" fill="#74305a"' + ink(1.6) + '/>' +
          '<text x="180" y="' + (by + 23) + '" text-anchor="middle" font-family="\'Delicious Handrawn\', cursive" font-size="22" fill="#fffdf8"' +
          (est > bw - 16 ? ' textLength="' + (bw - 16) + '" lengthAdjust="spacingAndGlyphs"' : '') + '>' + escapeHtml(msg) + '</text>';
      }
      return '<svg viewBox="0 0 ' + W + ' 320" xmlns="http://www.w3.org/2000/svg"' + (title ? ' role="img" aria-label="' + escapeHtml(title) + '"' : ' aria-hidden="true" focusable="false"') + '>' + s + '</svg>';
    }

    return { bake: bake, cake: cake };
  })();
  /* ART:END */

  /* ------------------------------------------------------------------
   * 7. Saved basket (localStorage). One key holds everything:
   *    crumb-basket = { lines: [...], date: 'YYYY-MM-DD', time: 'HH:MM', notes: '' }
   *    A line is { id: 'croissant', qty: 2 } or a celebration cake
   *    { id: 'cake', key: 'c-…', cake: { size, sponge, filling, finish, colour, message }, qty: 1 }.
   *    Whatever is stored is checked and repaired on every read.
   * ------------------------------------------------------------------ */
  const BASKET_KEY = 'crumb-basket';
  // Pastel behind each category's bakes (Tailwind classes).
  const CATEGORY_TINT = { bread: 'bg-oat', pastry: 'bg-butter', bakes: 'bg-blush', whole: 'bg-pistachio' };
  const ORDER_KEY = 'crumb-last-order';

  // A valid cake configuration, or null.
  function normalizeCake(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const pick = (list, id, fallback) => (byId(list, id) ? id : fallback);
    const size = pick(CAKE.sizes, raw.size, null);
    const sponge = pick(CAKE.sponges, raw.sponge, null);
    const filling = pick(CAKE.fillings, raw.filling, null);
    const finish = pick(CAKE.finishes, raw.finish, null);
    if (!size || !sponge || !filling || !finish) return null;
    return {
      size: size, sponge: sponge, filling: filling, finish: finish,
      colour: byId(CAKE.finishes, finish).colour ? pick(CAKE.colours, raw.colour, CAKE.colours[0].id) : null,
      message: typeof raw.message === 'string' ? raw.message.replace(/[\u0000-\u001f]/g, '').trim().slice(0, CAKE.messageMax) : ''
    };
  }
  function cakeParts(cfg) {
    return {
      size: byId(CAKE.sizes, cfg.size), sponge: byId(CAKE.sponges, cfg.sponge), filling: byId(CAKE.fillings, cfg.filling),
      finish: byId(CAKE.finishes, cfg.finish), colour: cfg.colour ? byId(CAKE.colours, cfg.colour) : null
    };
  }
  // Price breakdown: the size's base price, then extras scaled by the size's factor.
  function cakePrice(cfg) {
    const p = cakeParts(cfg);
    const extra = (n) => Math.round(n * p.size.factor);
    const rows = [[p.size.label + ' (serves ' + p.size.serves + ')', p.size.price]];
    if (p.sponge.price) rows.push([p.sponge.label + ' cake', extra(p.sponge.price)]);
    if (p.filling.price) rows.push([p.filling.label.replace(/ \(seasonal\)/, ''), extra(p.filling.price)]);
    if (p.finish.price) rows.push([p.finish.label + ' finish', extra(p.finish.price)]);
    return { rows: rows, total: rows.reduce((t, r) => t + r[1], 0) };
  }
  function cakeSummary(cfg) {
    const p = cakeParts(cfg);
    return [p.size.label, p.sponge.label, p.filling.label.replace(/ \(seasonal\)/, ''), p.finish.label + (p.colour ? ' in ' + p.colour.label.toLowerCase() : '')].join(' · ');
  }
  function cakeAllergens(cfg) {
    const vegan = cfg.sponge === 'vegan-choc';
    const out = ['gluten'].concat(vegan ? ['soya'] : ['milk', 'egg']);
    if (cfg.sponge === 'carrot') out.push('nuts');
    if ((cfg.sponge === 'chocolate' || cfg.filling === 'ganache' || cfg.finish === 'drip') && out.indexOf('soya') === -1) out.push('soya');
    return out;
  }
  // Everything Art.cake needs to draw a configuration.
  function cakeArtConfig(cfg) {
    const p = cakeParts(cfg);
    return { tiers: p.size.tiers, finish: cfg.finish, spongeHex: p.sponge.colour, fillingHex: p.filling.colour, colourHex: p.colour ? p.colour.hex : null, message: cfg.message };
  }

  // Make whatever is in storage into a valid line, or null.
  function normalizeLine(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (raw.id === 'cake') {
      const cake = normalizeCake(raw.cake);
      if (!cake) return null;
      const key = typeof raw.key === 'string' && /^c-[\w-]{1,40}$/.test(raw.key) ? raw.key : 'c-' + Math.random().toString(36).slice(2, 10);
      return { id: 'cake', key: key, cake: cake, qty: 1 };
    }
    const p = findProduct(raw.id);
    if (!p) return null;
    // Zero, negative or junk quantities drop the line; too many is capped at the limit.
    const qty = wholeNumber(raw.qty, 0, p.max, 0);
    return qty >= 1 ? { id: p.id, qty: qty } : null;
  }

  function leadOf(lines) {
    return lines.reduce((m, l) => Math.max(m, l.id === 'cake' ? CAKE.leadDays : findProduct(l.id).leadDays || 1), 1);
  }
  // Is every line in the basket baked on this date?
  function lineBakedOn(l, isoDate) { return l.id === 'cake' ? isOpenDay(isoDate) : bakedOn(findProduct(l.id), isoDate); }
  function conflictsOn(lines, isoDate) { return lines.filter((l) => !lineBakedOn(l, isoDate)); }

  function loadBasket() {
    const raw = read(BASKET_KEY);
    const src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    const lines = [];
    let cakes = 0;
    (Array.isArray(src.lines) ? src.lines : []).forEach((r) => {
      const l = normalizeLine(r);
      if (!l) return;
      if (l.id === 'cake') {
        if (cakes >= CAKE.maxPerOrder) return;
        cakes++;
        return lines.push(l);
      }
      // Merge duplicate products, keeping within the limit.
      const same = lines.find((x) => x.id === l.id);
      if (same) same.qty = Math.min(findProduct(l.id).max, same.qty + l.qty);
      else lines.push(l);
    });
    const dates = pickupDates(lines);
    let date = isIsoDate(src.date) && dates.indexOf(src.date) !== -1 ? src.date : null;
    // No (valid) date chosen yet: the first date that suits everything in the basket.
    if (!date) date = dates.find((d) => !conflictsOn(lines, d).length) || dates[0];
    const time = typeof src.time === 'string' && pickupSlots(date).map(hhmm).indexOf(src.time) !== -1 ? src.time : null;
    const notes = typeof src.notes === 'string' ? src.notes.slice(0, PICKUP.notesMax) : '';
    return { lines: lines, date: date, time: time, notes: notes };
  }

  let basket = loadBasket();
  // Heal whatever was stored: save the repaired basket back (only if something was there).
  try { if (safeStorage.getItem(BASKET_KEY) !== null) write(BASKET_KEY, basket.lines.length || basket.notes ? basket : null); } catch (e) { /* storage blocked */ }
  const basketListeners = [];
  function onBasket(fn) { basketListeners.push(fn); }
  function saveBasket(next) {
    write(BASKET_KEY, next);
    basket = loadBasket(); // re-validate (e.g. a new cake moves the earliest date)
    basketListeners.forEach((fn) => fn());
  }
  // Keep every open tab in sync.
  window.addEventListener('storage', (e) => {
    if (e.key !== BASKET_KEY && e.key !== null) return;
    basket = loadBasket();
    basketListeners.forEach((fn) => fn());
  });

  function lineInfo(l) {
    if (l.id === 'cake') {
      const pr = cakePrice(l.cake);
      return { name: 'Celebration cake', detail: cakeSummary(l.cake), message: l.cake.message, unit: pr.total, total: pr.total, qty: 1, max: 1,
        art: Art.cake(cakeArtConfig(l.cake)), tint: 'bg-blush', cake: true };
    }
    const p = findProduct(l.id);
    return { name: p.name, detail: p.unit, unit: p.price, total: round2(p.price * l.qty), qty: l.qty, max: p.max,
      art: Art.bake(p.art), tint: CATEGORY_TINT[p.category], product: p };
  }
  function basketCount(b) { return (b || basket).lines.reduce((n, l) => n + l.qty, 0); }
  function basketTotal(b) { return round2((b || basket).lines.reduce((t, l) => t + lineInfo(l).total, 0)); }
  function qtyOf(id) { const l = basket.lines.find((x) => x.id === id); return l ? l.qty : 0; }

  // The first date (from `from`) on which everything in `lines` is baked.
  function firstDateFor(lines, from) {
    return pickupDates(lines).find((d) => d >= (from || '') && !conflictsOn(lines, d).length) || null;
  }

  // Add one of a product. If it isn't baked on the chosen pickup day, the
  // pickup moves to the next day that suits the whole basket.
  function addProduct(id) {
    const p = findProduct(id);
    if (!p) return;
    const current = qtyOf(id);
    if (current >= p.max) return toast('You can preorder up to ' + p.max + ' of the ' + escapeHtml(p.name.toLowerCase()) + ' per order. For more, call us at ' + SHOP.phone + '.');
    const lines = basket.lines.map((l) => Object.assign({}, l));
    const same = lines.find((l) => l.id === id);
    if (same) same.qty++;
    else lines.push({ id: id, qty: 1 });
    let date = basket.date;
    let moved = false;
    if (conflictsOn(lines, date).length || pickupDates(lines).indexOf(date) === -1) {
      const next = firstDateFor(lines, date) || firstDateFor(lines);
      if (!next) return toast('Sorry, we can’t fit ' + escapeHtml(p.name) + ' in with the rest of your basket. Try a separate order.');
      moved = next !== date;
      date = next;
    }
    saveBasket({ lines: lines, date: date, time: moved ? null : basket.time, notes: basket.notes });
    pop();
    toast('<strong class="font-bold">' + escapeHtml(p.name) + '</strong> added.' + (moved ? ' Pickup moved to <strong class="font-bold">' + escapeHtml(dateLabel(date)) + '</strong>, the next day we bake it.' : ''), true);
  }
  function setQty(index, qty) {
    const l = basket.lines[index];
    if (!l) return;
    const lines = basket.lines.map((x) => Object.assign({}, x));
    if (qty <= 0) lines.splice(index, 1);
    else lines[index].qty = Math.min(lineInfo(l).max, qty);
    saveBasket({ lines: lines, date: basket.date, time: basket.time, notes: basket.notes });
  }
  function setPickup(changes) {
    saveBasket(Object.assign({ lines: basket.lines, date: basket.date, time: basket.time, notes: basket.notes }, changes));
  }

  function pop() {
    $$('[data-basket-count]').forEach((el) => {
      el.classList.remove('badge-pop');
      void el.offsetWidth;
      el.classList.add('badge-pop');
    });
  }

  /* ------------------------------------------------------------------
   * 8. Header, mobile menu, scroll reveal, open-now badges
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
  const onScroll = () => header && header.classList.toggle('shadow-[0_10px_30px_-24px_rgb(58_38_32/.6)]', window.scrollY > 8);
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

  // <span data-open-status></span> → "Open now until 4pm" with a colored dot.
  function renderStatuses() {
    const st = shopStatus();
    $$('[data-open-status]').forEach((el) => {
      el.innerHTML = '<span class="dot ' + (st.open ? (st.soon ? 'text-[#c98a0c]' : 'text-[#5f9a3a]') : 'text-crust') + '" aria-hidden="true"></span>' + escapeHtml(st.text);
    });
    $$('[data-cutoff]').forEach((el) => { el.textContent = cutoffText(); });
    $$('[data-hours-list]').forEach((el) => {
      const today = shopNow().day;
      el.innerHTML = [2, 3, 4, 5, 6, 0, 1].map((d) => '<li class="flex items-center justify-between gap-4 py-2' + (d === today ? ' font-bold text-ink' : '') + '">' +
        '<span>' + DAY_NAMES[d] + (d === today ? ' <span class="ml-1 rounded-full bg-butter px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-butter-deep">Today</span>' : '') + '</span>' +
        '<span class="tabular-nums' + (HOURS[d] ? '' : ' text-muted') + '">' + hoursLabel(HOURS[d]) + '</span></li>').join('');
    });
  }

  /* ------------------------------------------------------------------
   * 9. Basket drawer and toast
   * ------------------------------------------------------------------ */
  const drawer = $('#basket-drawer');
  const backdrop = $('#basket-backdrop');
  let lastOpener = null;

  function focusables(root) {
    return $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', root)
      .filter((el) => el.offsetParent !== null || el === document.activeElement);
  }
  function openDrawer(opener) {
    if (!drawer) return;
    lastOpener = opener || document.activeElement;
    hideToast();
    renderDrawer();
    drawer.hidden = false;
    backdrop.hidden = false;
    void drawer.offsetWidth;
    drawer.classList.add('is-open');
    backdrop.classList.remove('opacity-0');
    document.documentElement.classList.add('drawer-open');
    $$('[data-basket-open]').forEach((b) => b.setAttribute('aria-expanded', 'true'));
    $('[data-basket-close]', drawer).focus();
  }
  function closeDrawer() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('is-open');
    backdrop.classList.add('opacity-0');
    document.documentElement.classList.remove('drawer-open');
    $$('[data-basket-open]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    setTimeout(() => { drawer.hidden = true; backdrop.hidden = true; }, reduceMotion ? 0 : 320);
    if (lastOpener && document.contains(lastOpener)) lastOpener.focus();
  }
  if (drawer) {
    backdrop.addEventListener('click', closeDrawer);
    drawer.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { e.preventDefault(); closeDrawer(); }
      if (e.key !== 'Tab') return;
      const f = focusables(drawer);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });
  }

  // Re-render a region but keep focus on "the same" control (matched by data-fk).
  function rerender(el, html) {
    const active = document.activeElement;
    const key = active && el.contains(active) ? active.getAttribute('data-fk') : null;
    el.innerHTML = html;
    if (key) {
      const again = $('[data-fk="' + key + '"]', el);
      if (again) again.focus();
      else if (el.closest('#basket-drawer')) $('[data-basket-close]', drawer).focus();
    }
  }

  function stepperHtml(index, info, fk) {
    return '<div class="stepper" role="group" aria-label="Quantity of ' + escapeHtml(info.name) + '">' +
      '<button type="button" data-qty="' + index + '" data-delta="-1" data-fk="' + fk + '-dec" aria-label="' + (info.qty === 1 ? 'Remove ' : 'One fewer ') + escapeHtml(info.name) + '">' + (info.qty === 1 ? '<svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M5 7h14M10 11v6M14 11v6M7 7l1 12h8l1-12M9 7V4h6v3"/></svg>' : '−') + '</button>' +
      '<span class="min-w-7 text-center font-bold tabular-nums" aria-live="polite">' + info.qty + '</span>' +
      '<button type="button" data-qty="' + index + '" data-delta="1" data-fk="' + fk + '-inc" aria-label="One more ' + escapeHtml(info.name) + '"' + (info.qty >= info.max ? ' disabled' : '') + '>+</button></div>';
  }

  // Date and time pickers for pickup. prefix keeps ids unique (drawer / checkout).
  function pickupFieldsHtml(prefix, b) {
    const dates = pickupDates(b.lines);
    const slots = pickupSlots(b.date);
    const opts = dates.map((d) => {
      const n = conflictsOn(b.lines, d).length;
      return '<option value="' + d + '"' + (d === b.date ? ' selected' : '') + '>' + escapeHtml(dateLabel(d, true)) + (n ? ' (' + plural(n, 'item', 'items') + ' not baked)' : '') + '</option>';
    }).join('');
    const h = HOURS[dayOf(b.date)];
    return '<div class="grid gap-3 sm:grid-cols-2">' +
      '<div><label class="field-label" for="' + prefix + '-date">Pickup day</label>' +
      '<select id="' + prefix + '-date" class="field" data-pickup-date data-fk="' + prefix + '-date">' + opts + '</select></div>' +
      '<div><label class="field-label" for="' + prefix + '-time">Time slot</label>' +
      '<select id="' + prefix + '-time" class="field" data-pickup-time data-fk="' + prefix + '-time" data-label="A time slot" required>' +
      '<option value="">Choose a time</option>' +
      slots.map((m) => '<option value="' + hhmm(m) + '"' + (hhmm(m) === b.time ? ' selected' : '') + '>' + clock(m) + '–' + clock(m + PICKUP.slotStep) + '</option>').join('') +
      '</select></div></div>' +
      '<p class="hint">' + escapeHtml(DAY_NAMES[dayOf(b.date)]) + ': we’re open ' + hoursLabel(h) + '. Your order waits on the pickup shelf by the door.</p>';
  }

  function conflictHtml(b) {
    const bad = conflictsOn(b.lines, b.date);
    if (!bad.length) return '';
    const names = bad.map((l) => findProduct(l.id).name);
    const better = firstDateFor(b.lines, b.date) || firstDateFor(b.lines);
    return '<div class="rounded-2xl bg-blush p-4 text-[15px] text-blush-deep" role="alert"><p class="font-bold">' + escapeHtml(listText(names)) + (bad.length === 1 ? ' isn’t' : ' aren’t') + ' baked on ' + escapeHtml(DAY_NAMES[dayOf(b.date)]) + 's.</p>' +
      '<p class="mt-1 text-ink">' + (better ? 'Pick up on <button type="button" class="link" data-set-date="' + better + '" data-fk="fix-date">' + escapeHtml(dateLabel(better, true)) + '</button> instead, or remove ' + (bad.length === 1 ? 'it' : 'them') + '.' : 'Remove ' + (bad.length === 1 ? 'it' : 'them') + ' to carry on.') + '</p></div>';
  }

  function drawerLineHtml(l, i) {
    const info = lineInfo(l);
    const off = !lineBakedOn(l, basket.date);
    return '<li class="flex gap-4 py-4">' +
      '<div class="art grid size-20 shrink-0 place-items-center overflow-hidden rounded-2xl ' + info.tint + (info.cake ? ' p-1' : ' p-2') + '">' + info.art + '</div>' +
      '<div class="min-w-0 flex-1"><div class="flex items-start justify-between gap-3"><p class="font-display text-lg leading-snug">' + escapeHtml(info.name) + '</p><p class="font-bold tabular-nums">' + price(info.total) + '</p></div>' +
      '<p class="mt-0.5 text-sm text-muted">' + escapeHtml(info.detail) + (info.qty > 1 ? ' · ' + price(info.unit) + ' each' : '') + '</p>' +
      (info.message ? '<p class="mt-1 text-sm">Message: <span class="hand text-lg text-bramble">“' + escapeHtml(info.message) + '”</span></p>' : '') +
      (off ? '<p class="mt-1 text-sm font-bold text-blush-deep">Baked ' + escapeHtml(bakeDaysText(info.product)) + '</p>' : '') +
      '<div class="mt-2.5 flex items-center justify-between gap-3">' +
      (info.cake ? '<a href="cakes.html" class="text-sm font-bold text-muted underline underline-offset-4 hover:text-ink">Design another</a>' : stepperHtml(i, info, 'l' + (l.key || l.id))) +
      '<button type="button" data-remove="' + i + '" data-fk="rm-' + (l.key || l.id) + '" class="text-sm font-bold text-muted underline underline-offset-4 hover:text-blush-deep">Remove<span class="sr-only"> ' + escapeHtml(info.name) + '</span></button>' +
      '</div></div></li>';
  }

  function renderDrawer() {
    if (!drawer) return;
    const body = $('[data-basket-body]', drawer);
    const foot = $('[data-basket-foot]', drawer);
    const count = basketCount();
    $('[data-drawer-count]', drawer).textContent = count ? '(' + plural(count, 'item', 'items') + ')' : '';
    if (!basket.lines.length) {
      rerender(body, '<div class="flex flex-col items-center px-6 py-14 text-center">' +
        '<div class="w-36">' + emptyBagSvg() + '</div>' +
        '<p class="mt-6 font-display text-2xl">Your basket is empty</p>' +
        '<p class="mt-2 max-w-xs text-muted">' + escapeHtml(cutoffText()) + '. Fill a bag and we’ll have it waiting on the shelf.</p>' +
        '<a href="shop.html" class="btn-primary mt-6">Browse today’s bakes</a></div>');
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    rerender(body, '<ul class="divide-y divide-line px-5 sm:px-6">' + basket.lines.map(drawerLineHtml).join('') + '</ul>' +
      '<section class="mx-5 mb-6 mt-2 rounded-[1.5rem] bg-paper p-5 ring-1 ring-ink/10 sm:mx-6" aria-labelledby="drawer-pickup-title">' +
      '<h3 id="drawer-pickup-title" class="flex items-center gap-2 font-display text-xl"><svg viewBox="0 0 24 24" class="size-5 text-bramble" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>Pick up from the shop</h3>' +
      '<p class="mt-1 text-sm text-muted">' + escapeHtml(SHOP.address) + '</p>' +
      '<div class="mt-4">' + pickupFieldsHtml('drawer', basket) + '</div>' +
      '<div class="mt-3">' + conflictHtml(basket) + '</div>' +
      '<label class="field-label mt-4" for="drawer-notes">Notes for the bakers <span class="font-normal text-muted">(optional)</span></label>' +
      '<textarea id="drawer-notes" class="field min-h-20 resize-y" data-pickup-notes data-fk="drawer-notes" maxlength="' + PICKUP.notesMax + '" aria-describedby="drawer-notes-count" placeholder="Slice the sourdough, please">' + escapeHtml(basket.notes) + '</textarea>' +
      '<p id="drawer-notes-count" class="hint text-right tabular-nums" data-notes-count>' + basket.notes.length + '/' + PICKUP.notesMax + '</p>' +
      '</section>');
    const bad = conflictsOn(basket.lines, basket.date).length;
    foot.innerHTML = '<div class="flex items-baseline justify-between"><span class="font-bold">Subtotal</span><span class="font-display text-2xl tabular-nums">' + price(basketTotal()) + '</span></div>' +
      '<p class="mt-1 text-sm text-muted">Picking up <strong class="text-ink">' + escapeHtml(dateLabel(basket.date, true)) + (basket.time ? ', ' + clock(toMins(basket.time)) : '') + '</strong>. No charge until checkout.</p>' +
      (bad ? '<button type="button" class="btn-primary mt-4 w-full" disabled>Fix your pickup day to continue</button>'
        : '<a href="checkout.html" class="btn-primary mt-4 w-full py-3.5 text-base">' + (basket.time ? 'Checkout' : 'Choose a time at checkout') + ' <span aria-hidden="true">→</span></a>');
  }

  // heart: a filled bag (order placed) instead of the empty smile.
  function emptyBagSvg(heart) {
    return '<svg viewBox="0 0 140 140" aria-hidden="true"><ellipse cx="70" cy="126" rx="44" ry="6" fill="#3a2620" opacity=".1"/>' +
      '<path d="M32 44h76l-6 80H38Z" fill="#e8d3b4" stroke="#3a2620" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<path d="M32 44l8-14h60l8 14" fill="#f3e7d5" stroke="#3a2620" stroke-width="2.4" stroke-linejoin="round"/>' +
      '<path d="M40 30l-8 14M100 30l8 14M46 44l-6-14M94 44l6-14" stroke="#3a2620" stroke-width="1.4" opacity=".4"/>' +
      (heart ? '<path d="M70 86c-10-8-16-13-16-19a8 8 0 0 1 16-3 8 8 0 0 1 16 3c0 6-6 11-16 19Z" fill="#f3dce7" stroke="#3a2620" stroke-width="2.4" stroke-linejoin="round"/>'
        : '<path d="M56 62c0 8 6 12 14 12s14-4 14-12" fill="none" stroke="#3a2620" stroke-width="2.4" stroke-linecap="round"/>') +
      '<text x="70" y="104" text-anchor="middle" font-family="\'Delicious Handrawn\', cursive" font-size="13" fill="#74305a">Bramble &amp; Rye</text>' +
      '<path d="M48 18c2-5 6-5 8 0M64 12c2-5 6-5 8 0M82 18c2-5 6-5 8 0" fill="none" stroke="#b9733c" stroke-width="2" stroke-linecap="round" opacity=".6"/></svg>';
  }

  function renderBasketButtons() {
    const count = basketCount();
    $$('[data-basket-count]').forEach((el) => { el.textContent = count; el.hidden = !count; });
    $$('[data-basket-label]').forEach((el) => el.setAttribute('aria-label', 'Basket, ' + plural(count, 'item', 'items') + (count ? ', ' + price(basketTotal()) : '')));
  }

  // Toast: short confirmations. withLink adds a "View basket" button.
  const toastEl = $('#toast');
  let toastTimer = null;
  function toast(html, withLink) {
    if (!toastEl) return;
    $('[data-toast-text]', toastEl).innerHTML = html;
    $('[data-toast-link]', toastEl).hidden = !withLink;
    toastEl.hidden = false;
    void toastEl.offsetWidth;
    toastEl.setAttribute('data-show', 'true');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 5200);
  }
  function hideToast() {
    if (!toastEl) return;
    toastEl.setAttribute('data-show', 'false');
    setTimeout(() => { if (toastEl.getAttribute('data-show') === 'false') toastEl.hidden = true; }, 260);
  }
  if (toastEl) {
    toastEl.addEventListener('mouseenter', () => clearTimeout(toastTimer));
    toastEl.addEventListener('mouseleave', () => { toastTimer = setTimeout(hideToast, 2500); });
    $('[data-toast-close]', toastEl).addEventListener('click', hideToast);
  }

  // One click handler for everything rendered now or later.
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-basket-open], [data-basket-close], [data-add], [data-qty], [data-remove], [data-set-date], [data-toast-link]');
    if (!t) return;
    if (t.hasAttribute('data-basket-open') || t.hasAttribute('data-toast-link')) {
      e.preventDefault();
      if (t.hasAttribute('data-toast-link')) hideToast();
      openDrawer(t.hasAttribute('data-toast-link') ? $('[data-basket-open]') : t);
    } else if (t.hasAttribute('data-basket-close')) closeDrawer();
    else if (t.hasAttribute('data-add')) addProduct(t.getAttribute('data-add'));
    else if (t.hasAttribute('data-qty')) {
      const i = +t.getAttribute('data-qty');
      const l = basket.lines[i];
      if (l) setQty(i, l.qty + +t.getAttribute('data-delta'));
    } else if (t.hasAttribute('data-remove')) {
      const i = +t.getAttribute('data-remove');
      const l = basket.lines[i];
      if (!l) return;
      const name = lineInfo(l).name;
      setQty(i, 0);
      toast(escapeHtml(name) + ' removed from your basket.');
    } else if (t.hasAttribute('data-set-date')) setPickup({ date: t.getAttribute('data-set-date') });
  });
  document.addEventListener('change', (e) => {
    const t = e.target;
    if (t.hasAttribute('data-pickup-date')) setPickup({ date: t.value });
    else if (t.hasAttribute('data-pickup-time')) setPickup({ time: t.value || null });
  });
  // Notes save as you type, without re-rendering the field you're typing in.
  document.addEventListener('input', (e) => {
    const t = e.target;
    if (!t.hasAttribute('data-pickup-notes')) return;
    basket.notes = t.value.slice(0, PICKUP.notesMax);
    write(BASKET_KEY, basket);
    $$('[data-pickup-notes]').forEach((el) => { if (el !== t) el.value = basket.notes; });
    $$('[data-notes-count]').forEach((el) => { el.textContent = basket.notes.length + '/' + PICKUP.notesMax; });
  });

  /* ------------------------------------------------------------------
   * 10. Product cards (preorder page and home specials)
   * ------------------------------------------------------------------ */
  // Monday-first week strip: which days a bake comes out of the oven.
  function dayDotsHtml(p) {
    return '<span class="day-dots" aria-hidden="true">' + [1, 2, 3, 4, 5, 6, 0].map((d) => {
      const cls = !HOURS[d] ? 'closed' : !p.days || p.days.indexOf(d) !== -1 ? 'on' : 'off';
      return '<span class="' + cls + '" title="' + DAY_NAMES[d] + (cls === 'on' ? '' : cls === 'closed' ? ': closed' : ': not baked') + '">' + DAY_NAMES[d][0] + '</span>';
    }).join('') + '</span><span class="sr-only">Baked ' + escapeHtml(bakeDaysText(p)) + '.</span>';
  }

  // The add button or quantity stepper for a product on the current pickup day.
  function cardActionHtml(p) {
    const i = basket.lines.findIndex((l) => l.id === p.id);
    if (i !== -1) {
      const info = lineInfo(basket.lines[i]);
      return '<div class="flex items-center justify-between gap-3">' + stepperHtml(i, info, 'c' + p.id) +
        '<button type="button" data-basket-open aria-controls="basket-drawer" aria-expanded="false" data-fk="c' + p.id + '-view" class="text-sm font-bold text-bramble underline decoration-bramble/35 underline-offset-4 hover:decoration-bramble">In your basket</button></div>';
    }
    const lines = basket.lines.concat([{ id: p.id, qty: 1 }]);
    const fits = !conflictsOn(lines, basket.date).length && pickupDates(lines).indexOf(basket.date) !== -1;
    if (fits) return '<button type="button" class="btn-primary w-full" data-add="' + p.id + '" data-fk="c' + p.id + '-add">Add to basket<span class="sr-only">: ' + escapeHtml(p.name) + '</span></button>';
    const next = firstDateFor(lines, basket.date) || firstDateFor(lines);
    if (!next) return '<p class="rounded-full bg-oat px-4 py-3 text-center text-sm font-bold text-muted">Not available with your basket</p>';
    return '<button type="button" class="btn-soft w-full" data-add="' + p.id + '" data-fk="c' + p.id + '-add">Add for ' + escapeHtml(dateLabel(next, true)) + '<span class="sr-only"> (moves your pickup): ' + escapeHtml(p.name) + '</span></button>';
  }

  function productCard(p, opts) {
    const o = opts || {};
    const lead = p.leadDays && p.leadDays > 1;
    return '<article class="card group reveal flex flex-col p-4 sm:p-5" data-product="' + p.id + '">' +
      '<div class="relative grid aspect-[4/3] place-items-center overflow-hidden rounded-[1.25rem] ' + CATEGORY_TINT[p.category] + '">' +
      '<div class="art bake-lift w-[54%]">' + Art.bake(p.art) + '</div>' +
      (p.special ? '<span class="tag tag-special absolute left-3 top-3">' + escapeHtml(p.special) + '</span>' : '') +
      (lead ? '<span class="tag absolute right-3 top-3 bg-paper/90 text-ink">' + p.leadDays + ' days’ notice</span>' : '') +
      '</div>' +
      '<div class="mt-4 flex items-start justify-between gap-3"><h3 class="font-display text-xl leading-tight">' + escapeHtml(p.name) + '</h3><p class="pt-0.5 font-bold tabular-nums">' + price(p.price) + '</p></div>' +
      '<p class="mt-0.5 text-sm text-muted">' + escapeHtml(p.unit) + '</p>' +
      (o.blurb === false ? '' : '<p class="mt-2.5 text-[15px] leading-relaxed text-muted">' + escapeHtml(p.blurb) + '</p>') +
      '<div class="mt-3 flex flex-wrap items-center gap-1.5">' + dietTags(p.diet) + '</div>' +
      '<div class="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-dashed border-line pt-3.5">' + dayDotsHtml(p) +
      '<span class="text-[13px] font-bold text-muted" aria-hidden="true">' + escapeHtml(bakeDaysText(p, true)) + '</span></div>' +
      '<p class="mt-2 text-[13px] text-muted">' + escapeHtml(allergenText(p.allergens)) + '</p>' +
      '<div class="mt-auto pt-4" data-card-action="' + p.id + '">' + cardActionHtml(p) + '</div></article>';
  }
  function refreshCards() {
    $$('[data-card-action]').forEach((el) => {
      const p = findProduct(el.getAttribute('data-card-action'));
      if (p) rerender(el, cardActionHtml(p));
    });
  }

  /* ------------------------------------------------------------------
   * 11. Home page: today's bake board and this week's specials
   * ------------------------------------------------------------------ */
  // Where one scheduled bake is at, given minutes since midnight.
  function bakeStatus(entry, mins) {
    const out = toMins(entry.out);
    if (entry.soldOut && mins >= toMins(entry.soldOut)) return { key: 'sold', text: 'Sold out', order: 3 };
    if (mins >= out) return { key: 'fresh', text: 'Out since ' + clock(out), order: 0 };
    if (mins >= out - BAKING_MINS) return { key: 'baking', text: 'Baking now', order: 1 };
    return { key: 'out', text: 'Out at ' + clock(out), order: 2 };
  }
  // Today's board while we're open (or before opening); otherwise the next bake day's.
  function boardState() {
    const now = shopNow();
    const h = HOURS[now.day];
    const live = !!h && now.mins < toMins(h[1]);
    let date = now.date;
    if (!live) {
      date = addDays(now.date, 1);
      for (let i = 0; i < 7 && !isOpenDay(date); i++) date = addDays(date, 1);
    }
    const items = BAKE_SCHEDULE.map((e) => ({ e: e, p: findProduct(e.id) }))
      .filter((x) => x.p && bakedOn(x.p, date))
      .map((x) => Object.assign(x, { status: live ? bakeStatus(x.e, now.mins) : { key: 'out', text: 'Out at ' + clock(toMins(x.e.out)), order: 2 } }));
    // On the shelf and baking first, then what's to come, sold out last; each by time.
    items.sort((a, b) => a.status.order - b.status.order || toMins(a.e.out) - toMins(b.e.out));
    return { date: date, live: live, items: items };
  }
  function renderBoard() {
    const board = $('#bake-board');
    if (!board) return;
    const st = boardState();
    const tomorrow = addDays(shopNow().date, 1);
    $('[data-board-title]').textContent = st.live ? 'Today, ' + fmtDate(st.date, { weekday: 'long', day: 'numeric', month: 'long' }) : (st.date === tomorrow ? 'Tomorrow' : DAY_NAMES[dayOf(st.date)]) + ', ' + fmtDate(st.date, { weekday: undefined });
    const counts = { fresh: 0, baking: 0, out: 0, sold: 0 };
    st.items.forEach((x) => counts[x.status.key]++);
    $('[data-board-note]').textContent = st.live
      ? [counts.fresh && counts.fresh + ' on the shelf', counts.baking && counts.baking + ' in the oven', counts.out && counts.out + ' still to come', counts.sold && counts.sold + ' sold out'].filter(Boolean).join(' · ')
      : 'We’re closed right now. Here’s what comes out of the oven next.';
    board.innerHTML = st.items.map((x) => '<li class="w-[11.5rem] shrink-0 snap-start sm:w-auto">' +
      '<a href="shop.html?category=' + x.p.category + '" class="group flex h-full flex-col rounded-[1.4rem] bg-paper p-3 ring-1 ring-ink/[.07] transition hover:-translate-y-0.5 hover:ring-ink/25">' +
      '<span class="relative grid aspect-square place-items-center rounded-[1.1rem] ' + CATEGORY_TINT[x.p.category] + (x.status.key === 'sold' ? ' opacity-60 grayscale-[.4]' : '') + '">' +
      (x.status.key === 'baking' ? '<svg viewBox="0 0 40 30" class="steam absolute left-1/2 top-2 w-10 -translate-x-1/2 text-crust" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M10 26c-4-6 4-8 0-15"/><path d="M20 26c-4-6 4-8 0-15"/><path d="M30 26c-4-6 4-8 0-15"/></svg>' : '') +
      '<span class="art bake-lift block w-[72%]">' + Art.bake(x.p.art) + '</span></span>' +
      '<span class="mt-3 px-1 font-display text-[1.05rem] leading-tight">' + escapeHtml(x.p.name) + '</span>' +
      '<span class="mt-auto px-1 pt-2.5"><span class="status-pill status-' + x.status.key + '"><span class="dot" aria-hidden="true"></span>' + escapeHtml(x.status.text) + '</span></span></a></li>').join('');
  }

  function initHome() {
    renderBoard();
    setInterval(renderBoard, 60000);
    const specials = $('#specials');
    if (specials) {
      specials.innerHTML = PRODUCTS.filter((p) => p.special).map((p) => productCard(p)).join('');
      onBasket(refreshCards);
    }
  }

  /* ------------------------------------------------------------------
   * 12. Preorder page: category filter (?category=), pickup day,
   *     "baked that day" toggle, grouped product grid
   * ------------------------------------------------------------------ */
  function initShop() {
    const results = $('#shop-results');
    if (!results) return;
    const filters = $('#shop-filters');
    const dateSel = $('#shop-date');
    const onlyDay = $('#only-day');
    const countEl = $('#shop-count');
    let category = (urlParams().get('category') || 'all').toLowerCase();
    if (category !== 'all' && !findCategory(category)) category = 'all';
    let renderedDate = null;

    function visible(cat) {
      return PRODUCTS.filter((p) => (cat === 'all' || p.category === cat) && (!onlyDay.checked || bakedOn(p, basket.date)));
    }
    function renderFilters() {
      rerender(filters, [{ id: 'all', label: 'Everything' }].concat(CATEGORIES).map((c) => {
        const n = visible(c.id).length;
        return '<button type="button" class="chip shrink-0 whitespace-nowrap" data-category="' + c.id + '" data-fk="cat-' + c.id + '" aria-pressed="' + (category === c.id) + '">' + escapeHtml(c.label) +
          ' <span class="rounded-full bg-current/10 px-1.5 text-xs tabular-nums opacity-80">' + n + '</span></button>';
      }).join(''));
    }
    function renderDate() {
      const dates = pickupDates(basket.lines);
      rerender(dateSel, dates.map((d) => '<option value="' + d + '"' + (d === basket.date ? ' selected' : '') + '>' + escapeHtml(dateLabel(d, true)) + '</option>').join(''));
    }
    function render() {
      renderedDate = basket.date;
      renderFilters();
      renderDate();
      const cats = category === 'all' ? CATEGORIES : [findCategory(category)];
      let total = 0;
      let html = '';
      cats.forEach((c) => {
        const items = visible(c.id);
        total += items.length;
        if (!items.length && category === 'all') return;
        html += '<section class="mt-14 first:mt-0" aria-labelledby="cat-' + c.id + '">' +
          '<div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-1 border-b border-line pb-4"><h2 id="cat-' + c.id + '" class="h-display text-3xl sm:text-4xl">' + escapeHtml(c.label) + '</h2>' +
          '<p class="hand text-2xl text-bramble">' + escapeHtml(c.blurb) + '</p></div>' +
          '<div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">' + items.map((p) => productCard(p)).join('') +
          (c.id === 'whole' ? '<a href="cakes.html" class="reveal group relative flex min-h-[22rem] flex-col justify-end overflow-hidden rounded-[1.6rem] bg-bramble p-6 text-paper on-dark">' +
            '<span class="art absolute -right-6 -top-4 w-[78%] rotate-6 transition duration-500 group-hover:rotate-3">' + Art.cake({ tiers: [9, 6], finish: 'flowers', spongeHex: '#f2d48f', fillingHex: '#c43c58', colourHex: '#f4c9c4', message: '' }) + '</span>' +
            '<span class="relative hand text-2xl text-butter">Something bigger?</span><span class="relative mt-1 font-display text-3xl leading-tight">Design a celebration cake</span>' +
            '<span class="relative mt-2 text-paper/85">Choose tiers, flavor, filling and finish, add a message and see it drawn as you go. ' + CAKE.leadDays + ' days’ notice.</span>' +
            '<span class="relative mt-4 inline-flex items-center gap-2 font-bold underline decoration-paper/40 underline-offset-4 group-hover:decoration-paper">Open the cake builder <span aria-hidden="true">→</span></span></a>' : '') +
          '</div>' +
          (!items.length ? '<p class="mt-6 rounded-[1.5rem] bg-oat p-6 text-muted">Nothing from this shelf is baked on ' + escapeHtml(DAY_NAMES[dayOf(basket.date)]) + '. Try another pickup day, or <button type="button" class="link" data-show-all>show every bake</button>.</p>' : '') +
          '</section>';
      });
      if (!total && category === 'all') html = '<p class="rounded-[1.5rem] bg-oat p-6 text-muted">Nothing is baked on that day.</p>';
      results.innerHTML = html;
      countEl.textContent = 'Showing ' + plural(total, 'bake', 'bakes') + (category === 'all' ? '' : ' from ' + findCategory(category).label.toLowerCase()) +
        (onlyDay.checked ? ', baked on ' + DAY_NAMES[dayOf(basket.date)] : '') + '.';
      reveal(results);
    }
    function setCategory(id) {
      category = id;
      const url = new URL(location.href);
      if (id === 'all') url.searchParams.delete('category');
      else url.searchParams.set('category', id);
      history.replaceState(null, '', url.pathname + url.search + url.hash);
      render();
    }
    filters.addEventListener('click', (e) => {
      const b = e.target.closest('[data-category]');
      if (b) setCategory(b.getAttribute('data-category'));
    });
    results.addEventListener('click', (e) => {
      if (!e.target.closest('[data-show-all]')) return;
      onlyDay.checked = false;
      render();
    });
    onlyDay.addEventListener('change', render);
    // dateSel carries data-pickup-date, so the shared change handler saves it.
    onBasket(() => { if (basket.date !== renderedDate) render(); else { renderFilters(); renderDate(); refreshCards(); } });
    render();
  }

  /* ------------------------------------------------------------------
   * 13. Café menu with diet filters (?diet=vegan,gf)
   * ------------------------------------------------------------------ */
  function initCafe() {
    const menu = $('#cafe-menu');
    if (!menu) return;
    const filters = $('#cafe-filters');
    const countEl = $('#cafe-count');
    const chosen = (urlParams().get('diet') || '').toLowerCase().split(',').filter((d) => DIETS[d]);
    const matches = (item) => chosen.every((d) => item.diet.indexOf(d) !== -1 || (item.diet.indexOf('vegan') !== -1 && (d === 'vegetarian' || d === 'df')));

    function render() {
      filters.innerHTML = Object.keys(DIETS).map((d) => '<button type="button" class="chip" data-diet="' + d + '" aria-pressed="' + (chosen.indexOf(d) !== -1) + '">' +
        '<span class="tag tag-' + d + ' px-1.5 py-0.5 text-[11px]" aria-hidden="true">' + DIETS[d].short + '</span>' + DIETS[d].label + '</button>').join('') +
        (chosen.length ? '<button type="button" class="px-2 text-[15px] font-bold text-muted underline underline-offset-4 hover:text-ink" data-diet-clear>Clear</button>' : '');
      let n = 0;
      menu.innerHTML = CAFE_MENU.map((sec) => {
        const items = sec.items.filter(matches);
        n += items.length;
        if (!items.length) return '';
        return '<section class="break-inside-avoid pb-12" aria-labelledby="cafe-' + sec.id + '">' +
          '<h2 id="cafe-' + sec.id + '" class="h-display text-3xl">' + escapeHtml(sec.title) + '</h2>' +
          '<p class="hand mt-1 text-xl text-bramble">' + escapeHtml(sec.note) + '</p>' +
          '<ul class="mt-5 space-y-5">' + items.map((it) => '<li>' +
            '<div class="flex items-baseline gap-3"><h3 class="font-bold text-lg">' + escapeHtml(it.name) + '</h3><span class="mb-1 flex-1 border-b-2 border-dotted border-ink/20" aria-hidden="true"></span><span class="font-display text-lg tabular-nums">' + money.format(it.price) + '</span></div>' +
            '<p class="mt-1 text-[15px] leading-relaxed text-muted">' + escapeHtml(it.desc) + '</p>' +
            '<div class="mt-1.5 flex flex-wrap gap-1">' + dietTags(it.diet, true) + '</div></li>').join('') + '</ul></section>';
      }).join('');
      $('#cafe-empty').hidden = n > 0;
      countEl.textContent = chosen.length ? plural(n, 'dish', 'dishes') + ' and drinks that are ' + listText(chosen.map((d) => DIETS[d].label.toLowerCase())) + '.' : 'Showing the full menu: ' + plural(n, 'item', 'items') + '.';
      const url = new URL(location.href);
      if (chosen.length) url.searchParams.set('diet', chosen.join(','));
      else url.searchParams.delete('diet');
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    }
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-diet], [data-diet-clear]');
      if (!b) return;
      if (b.hasAttribute('data-diet-clear')) { chosen.length = 0; render(); const first = $('[data-diet]', filters); if (first) first.focus(); return; }
      const d = b.getAttribute('data-diet');
      const i = chosen.indexOf(d);
      if (i === -1) chosen.push(d); else chosen.splice(i, 1);
      render();
      const again = $('[data-diet="' + d + '"]', filters);
      if (again) again.focus();
    });
    render();
  }

  /* ------------------------------------------------------------------
   * 14. Celebration cake builder: options from CAKE, live SVG preview
   *     and price, earliest date = CAKE.leadDays (and the cutoff)
   * ------------------------------------------------------------------ */
  function initCakes() {
    const form = $('#cake-form');
    if (!form) return;
    const preview = $('#cake-preview');
    const dateEl = $('#cake-date');
    const msgEl = $('#cake-message');
    const earliest = earliestDate(CAKE.leadDays);
    dateEl.min = earliest;
    dateEl.max = addDays(shopNow().date, CAKE.daysAhead);
    msgEl.maxLength = CAKE.messageMax;
    $$('[data-earliest]').forEach((el) => { el.textContent = fmtDate(earliest); });

    const radio = (name, item, checked, inner, cls) => '<label class="' + cls + '"><input type="radio" class="sr-only" name="' + name + '" value="' + item.id + '"' + (checked ? ' checked' : '') + '>' + inner + '</label>';
    $('[data-cake-sizes]').innerHTML = CAKE.sizes.map((s) => radio('size', s, s.id === '8in',
      '<span class="flex w-full flex-col"><span class="h-10" aria-hidden="true">' + tierIcon(s.tiers) + '</span><span class="mt-2 font-bold">' + s.label + '</span><span class="text-sm text-muted">Serves ' + s.serves + '</span><span class="mt-1 font-display text-lg">' + price(s.price) + '</span></span>', 'option')).join('');
    $('[data-cake-sponges]').innerHTML = CAKE.sponges.map((s) => radio('sponge', s, s.id === 'vanilla',
      '<span class="flex w-full items-center gap-3"><span class="size-7 shrink-0 rounded-full ring-1 ring-ink/25" style="background:' + s.colour + '" aria-hidden="true"></span><span class="flex-1 font-bold">' + s.label + (s.diet.indexOf('vegan') !== -1 ? ' <span class="tag tag-vegan ml-1">Vegan</span>' : '') + '</span><span class="text-sm text-muted">' + (s.price ? '+' + price(s.price) + '*' : 'Included') + '</span></span>', 'option py-3')).join('');
    $('[data-cake-fillings]').innerHTML = CAKE.fillings.map((s) => radio('filling', s, s.id === 'raspberry',
      '<span class="flex w-full items-center gap-3"><span class="h-3 w-7 shrink-0 rounded-full ring-1 ring-ink/25" style="background:' + s.colour + '" aria-hidden="true"></span><span class="flex-1 font-bold">' + s.label + '</span><span class="text-sm text-muted">' + (s.price ? '+' + price(s.price) + '*' : 'Included') + '</span></span>', 'option py-3')).join('');
    $('[data-cake-finishes]').innerHTML = CAKE.finishes.map((s) => radio('finish', s, s.id === 'smooth',
      '<span class="flex w-full flex-col"><span class="font-bold">' + s.label + '</span><span class="mt-0.5 text-sm leading-snug text-muted">' + s.note + '</span><span class="mt-2 text-sm font-bold">' + (s.price ? '+' + price(s.price) + '*' : 'Included') + '</span></span>', 'option')).join('');
    $('[data-cake-colours]').innerHTML = CAKE.colours.map((c) => '<label class="swatch" style="background:' + c.hex + '"><input type="radio" class="sr-only" name="colour" value="' + c.id + '"' + (c.id === 'blush' ? ' checked' : '') + '><span class="sr-only">' + c.label + '</span></label>').join('');

    function config() {
      const val = (n) => { const el = $('input[name="' + n + '"]:checked', form); return el ? el.value : null; };
      return normalizeCake({ size: val('size'), sponge: val('sponge'), filling: val('filling'), finish: val('finish'), colour: val('colour'), message: msgEl.value });
    }
    function update() {
      const cfg = config();
      const parts = cakeParts(cfg);
      const pr = cakePrice(cfg);
      const coloured = parts.finish.colour;
      $$('input[name="colour"]', form).forEach((el) => { el.disabled = !coloured; });
      $('[data-colour-note]').textContent = coloured ? 'Buttercream color: ' + (parts.colour ? parts.colour.label : '') : 'A naked cake shows off its layers, so there’s no color to choose.';
      const desc = parts.size.label + ' ' + parts.sponge.label.toLowerCase() + ' cake with ' + parts.filling.label.toLowerCase().replace(/ \(seasonal\)/, '') + ', ' + parts.finish.label.toLowerCase() + ' finish' + (parts.colour ? ' in ' + parts.colour.label.toLowerCase() : '') + (cfg.message ? ', with the message “' + cfg.message + '”' : '');
      preview.innerHTML = Art.cake(cakeArtConfig(cfg), desc);
      $('#cake-price').textContent = price(pr.total);
      $$('[data-cake-total]').forEach((el) => { el.textContent = price(pr.total); });
      $('#cake-breakdown').innerHTML = pr.rows.map((r, i) => '<li class="flex justify-between gap-4"><span>' + (i ? '+ ' : '') + escapeHtml(r[0]) + '</span><span class="tabular-nums">' + price(r[1]) + '</span></li>').join('');
      $('#cake-serves').textContent = 'Serves ' + parts.size.serves;
      $('#cake-allergens').textContent = allergenText(cakeAllergens(cfg)) + (cfg.sponge === 'vegan-choc' ? ' Fillings and buttercream are made vegan too.' : '');
      $('#cake-message-count').textContent = msgEl.value.length + '/' + CAKE.messageMax;
    }
    form.addEventListener('change', update);
    msgEl.addEventListener('input', update);
    update();

    setupValidation(form, () => {
      const cakes = basket.lines.filter((l) => l.id === 'cake').length;
      if (cakes >= CAKE.maxPerOrder) {
        showError(dateEl, '');
        return toast('One order can hold ' + CAKE.maxPerOrder + ' celebration cakes. Call us at ' + SHOP.phone + ' for more.');
      }
      const cfg = config();
      const lines = basket.lines.concat([{ id: 'cake', key: 'c-' + Date.now().toString(36), cake: cfg, qty: 1 }]);
      const date = dateEl.value;
      const bad = conflictsOn(lines, date).filter((l) => l.id !== 'cake').length;
      saveBasket({ lines: lines, date: date, time: date === basket.date ? basket.time : null, notes: basket.notes });
      pop();
      toast('Your celebration cake is in the basket for <strong class="font-bold">' + escapeHtml(dateLabel(date)) + '</strong>.' + (bad ? ' Some other items aren’t baked that day: check your basket.' : ''), true);
    });
  }
  // Tiny tier silhouette for the size options.
  function tierIcon(tiers) {
    const h = 40, th = tiers.length === 1 ? 20 : tiers.length === 2 ? 15 : 12;
    let s = '';
    tiers.forEach((inch, i) => {
      const w = tiers.length === 1 ? 14 + inch * 4.4 : inch * 6, y = h - 2 - th * (i + 1);
      s += '<rect x="' + (40 - w / 2) + '" y="' + y + '" width="' + w + '" height="' + th + '" rx="2.5" fill="#f3dce7" stroke="#3a2620" stroke-width="1.6"/>';
    });
    return '<svg viewBox="0 0 80 40" class="h-10 w-20" aria-hidden="true">' + s + '<path d="M8 39h64" stroke="#3a2620" stroke-width="1.6" stroke-linecap="round"/></svg>';
  }

  /* ------------------------------------------------------------------
   * 15. Checkout (demo): pickup, details, payment, confirmation
   *     with an order number and a calendar (.ics) file for pickup.
   *     Nothing is sent and no payment is taken.
   * ------------------------------------------------------------------ */
  // The last order, checked before use (crumb-last-order).
  function readLastOrder() {
    const o = read(ORDER_KEY);
    if (!o || typeof o !== 'object' || !/^BR-\d{5}$/.test(o.number) || !isIsoDate(o.date) || !/^\d{2}:\d{2}$/.test(o.time) || !Array.isArray(o.lines)) return null;
    const lines = o.lines.filter((l) => l && typeof l.name === 'string').map((l) => ({
      name: l.name.slice(0, 80), detail: typeof l.detail === 'string' ? l.detail.slice(0, 160) : '', message: typeof l.message === 'string' ? l.message.slice(0, CAKE.messageMax) : '',
      qty: wholeNumber(l.qty, 1, 99, 1), total: typeof l.total === 'number' && isFinite(l.total) && l.total >= 0 ? round2(l.total) : 0
    }));
    if (!lines.length) return null;
    return {
      number: o.number, date: o.date, time: o.time, lines: lines,
      name: typeof o.name === 'string' ? o.name.slice(0, 80) : '',
      payment: o.payment === 'card' ? 'card' : 'collection',
      notes: typeof o.notes === 'string' ? o.notes.slice(0, PICKUP.notesMax) : '',
      total: round2(lines.reduce((t, l) => t + l.total, 0))
    };
  }

  // A calendar file for the pickup slot, in the bakery's time zone.
  function icsFor(order) {
    const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1').replace(/\n/g, '\\n');
    const stamp = (d, mins) => d.replace(/-/g, '') + 'T' + hhmm(mins).replace(':', '') + '00';
    const start = toMins(order.time);
    const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
    return [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + esc(SHOP.name) + '//Preorders//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
      'BEGIN:VTIMEZONE', 'TZID:' + TIMEZONE,
      'BEGIN:DAYLIGHT', 'TZOFFSETFROM:-0500', 'TZOFFSETTO:-0400', 'TZNAME:EDT', 'DTSTART:19700308T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'END:DAYLIGHT',
      'BEGIN:STANDARD', 'TZOFFSETFROM:-0400', 'TZOFFSETTO:-0500', 'TZNAME:EST', 'DTSTART:19701101T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'END:STANDARD',
      'END:VTIMEZONE',
      'BEGIN:VEVENT',
      'UID:' + order.number + '@brambleandrye.example',
      'DTSTAMP:' + now,
      'DTSTART;TZID=' + TIMEZONE + ':' + stamp(order.date, start),
      'DTEND;TZID=' + TIMEZONE + ':' + stamp(order.date, start + PICKUP.slotStep),
      'SUMMARY:' + esc('Pick up ' + SHOP.name + ' order ' + order.number),
      'LOCATION:' + esc(SHOP.address),
      'DESCRIPTION:' + esc(order.lines.map((l) => l.qty + ' × ' + l.name).join('\n') + '\n\nOrder ' + order.number + '. Questions? ' + SHOP.phone),
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n') + '\r\n';
  }
  function icsLink(order, cls) {
    const url = URL.createObjectURL(new Blob([icsFor(order)], { type: 'text/calendar;charset=utf-8' }));
    return '<a href="' + url + '" download="bramble-rye-' + order.number + '.ics" class="' + cls + '">' +
      '<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4M12 13v5M9.5 15.5h5"/></svg>Add to calendar (.ics)</a>';
  }
  try { if (safeStorage.getItem(ORDER_KEY) !== null && !readLastOrder()) write(ORDER_KEY, null); } catch (e) { /* storage blocked */ }
  const slotText = (time) => clock(toMins(time)) + '–' + clock(toMins(time) + PICKUP.slotStep);

  function initCheckout() {
    const main = $('[data-checkout-main]');
    if (!main) return;
    const form = $('#checkout-form');
    const empty = $('[data-checkout-empty]');
    const done = $('[data-checkout-done]');
    const pickupEl = $('[data-checkout-pickup]');
    const summary = $('[data-checkout-summary]');
    const cardFields = $('[data-card-fields]');
    let placed = false;

    function renderEmpty() {
      const last = readLastOrder();
      $('[data-last-order]', empty).innerHTML = last
        ? '<div class="ticket mx-auto mt-8 max-w-md bg-paper p-5 text-left"><p class="text-sm font-bold uppercase tracking-[0.16em] text-muted">Your last order</p>' +
          '<p class="mt-1 font-display text-2xl">' + escapeHtml(last.number) + '</p><p class="mt-1 text-muted">Pick up ' + escapeHtml(fmtDate(last.date)) + ', ' + slotText(last.time) + '</p>' +
          icsLink(last, 'btn-soft mt-4') + '</div>'
        : '';
    }
    function renderSummary() {
      const t = basketTotal();
      summary.innerHTML = '<h2 class="font-display text-2xl">Your order</h2>' +
        '<ul class="mt-4 divide-y divide-line">' + basket.lines.map((l) => {
          const info = lineInfo(l);
          return '<li class="flex gap-3 py-3"><span class="art relative grid size-14 shrink-0 place-items-center rounded-xl ' + info.tint + ' p-1">' + info.art +
            '<span class="absolute -right-1.5 -top-1.5 grid size-6 place-items-center rounded-full bg-ink text-xs font-bold text-paper">' + info.qty + '</span></span>' +
            '<span class="min-w-0 flex-1"><span class="block font-bold leading-snug">' + escapeHtml(info.name) + '</span><span class="block text-sm text-muted">' + escapeHtml(info.detail) + '</span>' +
            (info.message ? '<span class="hand block text-lg text-bramble">“' + escapeHtml(info.message) + '”</span>' : '') + '</span>' +
            '<span class="font-bold tabular-nums">' + price(info.total) + '</span></li>';
        }).join('') + '</ul>' +
        '<div class="stitch mt-2"></div>' +
        '<dl class="mt-4 space-y-2 text-[15px]"><div class="flex justify-between"><dt class="text-muted">Subtotal</dt><dd class="tabular-nums">' + price(t) + '</dd></div>' +
        '<div class="flex justify-between"><dt class="text-muted">Pickup</dt><dd>Free</dd></div>' +
        '<div class="flex items-baseline justify-between border-t border-line pt-3"><dt class="font-bold">Total</dt><dd class="font-display text-2xl tabular-nums">' + price(t) + '</dd></div></dl>' +
        '<p class="mt-4 rounded-2xl bg-oat p-4 text-sm text-muted"><strong class="text-ink">Picking up ' + escapeHtml(dateLabel(basket.date)) + (basket.time ? ', ' + slotText(basket.time) : '') + '.</strong> ' + escapeHtml(SHOP.address) + '</p>' +
        '<button type="button" data-basket-open aria-controls="basket-drawer" aria-expanded="false" class="mt-4 text-sm font-bold text-bramble underline underline-offset-4">Edit basket</button>';
      $('[data-place-total]').textContent = price(t);
    }
    function renderPickup() {
      rerender(pickupEl, pickupFieldsHtml('co', basket) + '<div class="mt-3">' + conflictHtml(basket) + '</div>');
    }
    function render() {
      if (placed) return;
      const has = basket.lines.length > 0;
      main.hidden = !has;
      empty.hidden = has;
      if (!has) return renderEmpty();
      renderPickup();
      renderSummary();
      const notes = $('#co-notes');
      if (document.activeElement !== notes) notes.value = basket.notes;
      $('[data-notes-count]', form).textContent = basket.notes.length + '/' + PICKUP.notesMax;
    }

    function syncPayment() {
      const card = ($('input[name="payment"]:checked', form) || {}).value === 'card';
      cardFields.hidden = !card;
      $('[data-place-label]').textContent = card ? 'Pay & place order' : 'Place order';
    }
    form.addEventListener('change', (e) => { if (e.target.name === 'payment') syncPayment(); });
    syncPayment();
    // Card number in groups of four, expiry as MM / YY.
    $('#co-card').addEventListener('input', (e) => {
      const d = e.target.value.replace(/\D/g, '').slice(0, 16);
      e.target.value = d.replace(/(\d{4})(?=\d)/g, '$1 ');
    });
    $('#co-expiry').addEventListener('input', (e) => {
      const d = e.target.value.replace(/\D/g, '').slice(0, 4);
      e.target.value = d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d;
    });

    onBasket(render);
    render();

    setupValidation(form, () => {
      if (conflictsOn(basket.lines, basket.date).length) {
        $('[data-form-status]', form).textContent = 'Some items aren’t baked on your pickup day. Change the day or remove them.';
        $('#co-date').focus();
        return;
      }
      const t = basketTotal();
      const order = {
        number: 'BR-' + String(Date.now()).slice(-5),
        placedAt: new Date().toISOString(),
        date: basket.date, time: basket.time, notes: basket.notes,
        name: $('#co-name').value.trim(), email: $('#co-email').value.trim(), phone: $('#co-phone').value.trim(),
        payment: ($('input[name="payment"]:checked', form) || {}).value === 'card' ? 'card' : 'collection',
        lines: basket.lines.map((l) => { const i = lineInfo(l); return { name: i.name, detail: i.detail, message: i.message || '', qty: i.qty, total: i.total }; }),
        total: t
      };
      // To take real orders, send `order` to your backend or order system here, e.g.
      // fetch('https://example.com/api/orders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(order) })
      // and take payment with your provider (Stripe Checkout, Square, SumUp…) before confirming.
      write(ORDER_KEY, order);
      placed = true;
      saveBasket({ lines: [], date: null, time: null, notes: '' });
      renderDone(readLastOrder());
    });

    function renderDone(order) {
      main.hidden = true;
      empty.hidden = true;
      done.hidden = false;
      const first = order.name.split(/\s+/)[0];
      done.innerHTML = '<div class="mx-auto max-w-2xl text-center">' +
        '<div class="mx-auto w-40">' + emptyBagSvg(true) + '</div>' +
        '<p class="hand mt-4 text-3xl text-bramble">It’s on the list!</p>' +
        '<h2 class="h-display mt-2 text-4xl sm:text-5xl">Thank you' + (first ? ', ' + escapeHtml(first) : '') + '</h2>' +
        '<p class="mx-auto mt-4 max-w-lg text-lg text-muted">We’ll bake your order fresh and put it on the pickup shelf by the door. Just give your name or order number at the counter.</p></div>' +
        '<div class="ticket mx-auto mt-10 max-w-2xl bg-paper p-6 sm:p-8">' +
        '<div class="flex flex-wrap items-start justify-between gap-4"><div><p class="text-sm font-bold uppercase tracking-[0.16em] text-muted">Order number</p><p class="font-display text-3xl">' + escapeHtml(order.number) + '</p></div>' +
        '<div class="sm:text-right"><p class="text-sm font-bold uppercase tracking-[0.16em] text-muted">Pick up</p><p class="font-bold">' + escapeHtml(fmtDate(order.date)) + '</p><p class="text-muted">' + slotText(order.time) + '</p></div></div>' +
        '<div class="stitch my-5"></div>' +
        '<ul class="space-y-2">' + order.lines.map((l) => '<li class="flex justify-between gap-4"><span><span class="font-bold tabular-nums">' + l.qty + ' ×</span> ' + escapeHtml(l.name) +
          (l.message ? ' <span class="hand text-lg text-bramble">“' + escapeHtml(l.message) + '”</span>' : '') + '</span><span class="tabular-nums">' + price(l.total) + '</span></li>').join('') + '</ul>' +
        '<div class="mt-4 flex justify-between border-t border-line pt-4 font-bold"><span>Total</span><span class="tabular-nums">' + price(order.total) + '</span></div>' +
        '<p class="mt-3 text-[15px] text-muted">' + (order.payment === 'card' ? 'Paid by card.' : 'Pay at the counter when you pick up, by card or cash.') + '</p>' +
        (order.notes ? '<p class="mt-2 text-[15px] text-muted">Your note: “' + escapeHtml(order.notes) + '”</p>' : '') +
        '<div class="mt-6 flex flex-wrap gap-3">' + icsLink(order, 'btn-primary') + '<a href="index.html" class="btn-line">Back to the bakery</a></div></div>' +
        '<p class="mx-auto mt-6 max-w-2xl text-center text-sm text-muted">Your confirmation is on its way to your inbox. Need to change something? Call us at ' + escapeHtml(SHOP.phone) + ' and quote ' + escapeHtml(order.number) + '.</p>';
      done.focus();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  /* ------------------------------------------------------------------
   * 16. Visit page: hours (see renderStatuses) and the wholesale form
   * ------------------------------------------------------------------ */

  /* ------------------------------------------------------------------
   * 17. Forms: inline validation and a success state. Demo forms send
   *     nothing; see the comments below to connect a real endpoint.
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
      if (!/^[+()\d\s.-]+$/.test(v) || digits.length < 10 || digits.length > 13) return 'Enter a phone number we can call, like (518) 555-0123.';
    }
    if (rule === 'name' && v.length < 2) return 'Enter your name so we know whose bag it is.';
    if (rule === 'card') {
      const d = v.replace(/\s/g, '');
      if (!/^\d{16}$/.test(d)) return 'Enter the 16-digit card number.';
      if (!luhn(d)) return 'That card number doesn’t look right. Check it, or use the test card 4242 4242 4242 4242.';
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
      if (el.min && v < el.min) return el.getAttribute('data-min-msg') || 'The earliest date is ' + fmtDate(el.min) + '.';
      if (el.max && v > el.max) return 'We take bookings up to ' + fmtDate(el.max) + '.';
      if (rule === 'open-day' && !isOpenDay(v)) return 'We’re closed on ' + DAY_NAMES[dayOf(v)] + 's. Choose another day.';
    }
    const max = +el.getAttribute('maxlength');
    if (max && v.length > max) return label + ' can be up to ' + max + ' characters.';
    const min = +el.getAttribute('minlength');
    if (min && v.length < min) return label + ' needs at least ' + min + ' characters.';
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

  // A field that gets its own message (radio and checkbox groups are checked as a whole).
  function isField(el) {
    return el.matches('input, select, textarea') &&
      el.type !== 'radio' && el.type !== 'hidden' && el.type !== 'submit' && !!el.id && !el.closest('[data-group]');
  }
  // The fields to check on submit: the ones on show (a hidden field isn't asked for).
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
    form.setAttribute('novalidate', '');
    // Listen on the form rather than on each field, so fields rendered later are checked too.
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
      const el = e.target;
      if (isField(el) && el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el));
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validate(form)) onValid(form);
    });
  }

  // A short reference for the confirmation, like BR-7K2Q (no 0/O or 1/I to misread over the phone).
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
    box.className = dark ? 'rounded-3xl bg-paper/10 p-5 text-paper focus:outline-none' : 'rounded-[2rem] bg-pistachio p-6 text-ink focus:outline-none sm:p-8';
    box.innerHTML = html;
    form.replaceWith(box);
    box.focus();
  }

  // To connect a form: replace successSwap(...) below with a fetch() to your form service, e.g.
  // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  //   .then((r) => r.ok ? successSwap(form, '…') : showFormError(form));
  function initForms() {
    $$('[data-form="newsletter"]').forEach((form) => setupValidation(form, () => {
      successSwap(form, '<p class="font-display text-xl">You’re on the bake list.</p><p class="mt-1 text-sm text-paper/85">Look out for a confirmation email from us; once you click the link, Thursday’s bake news is yours.</p>', true);
    }));
    $$('[data-form="wholesale"]').forEach((form) => setupValidation(form, () => {
      const first = $('#w-name').value.trim().split(/\s+/)[0];
      const business = $('#w-business').value.trim();
      successSwap(form, '<p class="hand text-3xl text-pistachio-deep">Wonderful, thank you!</p>' +
        '<p class="mt-2 font-display text-2xl">Thanks, ' + escapeHtml(first) + '.</p>' +
        '<p class="mt-3 leading-relaxed">Ruth has your inquiry for <strong>' + escapeHtml(business) + '</strong> and will reply within two business days with a price list and a tasting box date.</p>' +
        '<p class="mt-3 text-sm text-muted">Your reference is <strong class="text-ink">' + makeRef('BR') + '</strong>. Quote it if you call us.</p>');
    }));
    // Dates with data-min-days: the minimum is that many days from today in the shop's time zone.
    $$('input[type="date"][data-min-days]').forEach((el) => {
      const today = shopNow().date;
      el.min = addDays(today, +el.getAttribute('data-min-days'));
      el.max = addDays(today, 365);
    });
    // Live character counters: <textarea id="x" maxlength="600"> + <p data-count-for="x">.
    $$('[data-count-for]').forEach((out) => {
      const field = document.getElementById(out.getAttribute('data-count-for'));
      if (!field) return;
      const upd = () => { out.textContent = field.value.length + '/' + field.maxLength; };
      field.addEventListener('input', upd);
      upd();
    });
  }

  /* ------------------------------------------------------------------
   * 18. Boot
   * ------------------------------------------------------------------ */
  $$('[data-year]').forEach((el) => { el.textContent = shopNow().date.slice(0, 4); });
  renderStatuses();
  setInterval(renderStatuses, 30000);
  renderBasketButtons();
  onBasket(renderBasketButtons);
  onBasket(() => { if (drawer && !drawer.hidden) renderDrawer(); });
  initForms();
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'shop') initShop();
  if (page === 'cafe') initCafe();
  if (page === 'cakes') initCakes();
  if (page === 'checkout') initCheckout();
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
