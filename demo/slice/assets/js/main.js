/* Crust Club — site script for the Slice template
 * Vanilla JavaScript, no dependencies. Sections:
 *  1. Shop settings: shops, hours, delivery zones, promo codes
 *  2. Menu data: sizes, crusts, toppings, menu items, deals, bundle
 *  3. Helpers
 *  4. Opening hours and time slots (in the shop's time zone)
 *  5. Pizza and food artwork (SVG drawn from the menu data)
 *  6. Saved order: mode, ZIP code, cart (localStorage)
 *  7. Prices and totals
 *  8. Header, mobile menu, reveal, open-now badges
 *  9. Delivery checker
 * 10. Item customizer and deal dialogs
 * 11. Cart drawer, toast and mobile order bar
 * 12. Menu page            15. Locations page
 * 13. Home page            16. Checkout and order tracker
 * 14. Deals and bundles    17. Catering calculator
 * 18. Forms                19. Boot
 */
document.documentElement.classList.add('js');

(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Shop settings — edit these to make the template yours.
   *    hours: one entry per weekday, Sunday first, as ['open', 'close']
   *    in 24-hour time, or null when closed. Times are in TIMEZONE.
   * ------------------------------------------------------------------ */
  const SHOP_NAME = 'Crust Club';
  const TIMEZONE = 'America/New_York';
  const LOCALE = 'en-US';
  const CURRENCY = 'USD';

  const STORES = [
    {
      id: 'ancoats',
      name: 'Wooster Square',
      address: '42 Franklin Street, New Haven, CT 06511',
      phone: '(203) 555-0118',
      hours: [['12:00', '21:00'], ['12:00', '22:00'], ['12:00', '22:00'], ['12:00', '22:00'], ['12:00', '22:00'], ['12:00', '23:00'], ['12:00', '23:00']],
      pickupMins: 20,   // kitchen lead time for pickup orders
      deliveryMins: 35  // kitchen + ride lead time for the first delivery slot
    },
    {
      id: 'chorlton',
      name: 'Westville',
      address: '317 Fountain Street, New Haven, CT 06515',
      phone: '(203) 555-0132',
      hours: [['12:00', '21:00'], null, ['16:00', '22:00'], ['16:00', '22:00'], ['16:00', '22:00'], ['16:00', '23:00'], ['12:00', '23:00']],
      pickupMins: 20,
      deliveryMins: 35
    }
  ];

  // Delivery zones by ZIP code. Each zone is served by one shop.
  const ZONES = [
    { id: 'city', store: 'ancoats', name: 'Downtown & Wooster Square', districts: ['06510', '06511'], fee: 2.99, min: 20, eta: [25, 35] },
    { id: 'north', store: 'ancoats', name: 'Hamden, Fair Haven & The Hill', districts: ['06512', '06513', '06514', '06517', '06518', '06519'], fee: 4.99, min: 25, eta: [35, 50] },
    { id: 'chorlton', store: 'chorlton', name: 'Westville & Woodbridge', districts: ['06515', '06525'], fee: 2.99, min: 20, eta: [25, 35] },
    { id: 'south', store: 'chorlton', name: 'West Haven, Allingtown & Orange', districts: ['06477', '06516'], fee: 4.99, min: 25, eta: [35, 50] }
  ];
  const FREE_DELIVERY_OVER = 50;  // subtotal (after promo) that makes delivery free
  const SLOT_STEP = 15;           // minutes between scheduled time slots
  const SCHEDULE_DAYS = 3;        // today plus the next two days
  const MAX_QTY = 20;

  // Demo promo codes. type: 'percent' (off menu items, not deals), 'delivery' or 'amount'.
  const PROMOS = {
    SLICE10: { type: 'percent', value: 10, label: '10% off menu items' },
    FREEDELIVERY: { type: 'delivery', label: 'Free delivery' },
    FIRSTSLICE: { type: 'amount', value: 5, min: 30, label: '$5 off orders over $30' }
  };

  // Order tracker demo: seconds each stage lasts on the confirmation page.
  const TRACKER_STEP_SECONDS = 8;

  // A short reference for orders and inquiries, like CC-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return 'CC-' + out;
  }

  /* ------------------------------------------------------------------
   * 2. Menu data — every price on the site is worked out from here.
   *    diet: 'vegan', 'vegetarian', 'gf' (gluten-free or GF base available),
   *    'spicy'. allergens use the keys of ALLERGENS.
   *    Pizza art: sauce 'tomato' | 'bianca' | 'pesto', cheese true | false
   *    | 'vegan', toppings are keys of the artwork drawers in section 5.
   * ------------------------------------------------------------------ */
  const ALLERGENS = {
    gluten: 'Gluten', milk: 'Milk', egg: 'Egg', nuts: 'Tree nuts', soya: 'Soy',
    mustard: 'Mustard', celery: 'Celery', sulphites: 'Sulfites', fish: 'Fish', sesame: 'Sesame'
  };
  const DIETS = {
    vegan: { label: 'Vegan', short: 'VG' },
    vegetarian: { label: 'Vegetarian', short: 'V' },
    gf: { label: 'Gluten-free', short: 'GF' },
    spicy: { label: 'Spicy', short: 'Hot' }
  };

  const SECTIONS = [
    { id: 'pizzas', name: 'Pizzas', blurb: '48-hour sourdough, baked for 90 seconds at 850°F. Every pizza comes in three sizes.' },
    { id: 'sides', name: 'Sides', blurb: 'For sharing, in theory.' },
    { id: 'dips', name: 'Dips', blurb: 'Crusts were made for dunking. All dips are made in-house.' },
    { id: 'desserts', name: 'Desserts', blurb: 'Room for one more?' },
    { id: 'drinks', name: 'Drinks', blurb: 'Cold cans, our house pale and real lemonade.' }
  ];

  const SIZES = [
    { id: 'small', label: 'Small', inches: 10, delta: -3, extra: 2.0 },
    { id: 'regular', label: 'Regular', inches: 12, delta: 0, extra: 2.5 },
    { id: 'large', label: 'Large', inches: 16, delta: 6, extra: 3.0 }
  ];
  const CRUSTS = [
    { id: 'sourdough', label: 'Classic sourdough', note: 'Puffy, blistered, chewy', price: 0 },
    { id: 'thin', label: 'Thin & crispy', note: 'Rolled thin, extra crunch', price: 0 },
    { id: 'stuffed', label: 'Garlic-butter stuffed crust', note: 'Mozzarella-filled rim', price: 3, sizes: ['regular', 'large'], allergens: ['milk'], notVegan: true },
    { id: 'gf', label: 'Gluten-free base', note: 'Small only, made in a kitchen that handles gluten', price: 3, sizes: ['small'], glutenFree: true }
  ];
  // kind: 'veg' keeps a pizza vegan, 'dairy'/'honey' keep it vegetarian, 'meat'/'fish' make it neither.
  const TOPPINGS = [
    { id: 'mozzarella', name: 'Extra fior di latte', kind: 'dairy', allergens: ['milk'] },
    { id: 'vegan-mozz', name: 'Vegan mozzarella', kind: 'veg', allergens: ['soya'] },
    { id: 'burrata', name: 'Burrata (added after the bake)', kind: 'dairy', allergens: ['milk'] },
    { id: 'pepperoni', name: 'Pepperoni', kind: 'meat' },
    { id: 'nduja', name: 'Nduja', kind: 'meat', spicy: true },
    { id: 'sausage', name: 'Fennel sausage', kind: 'meat', allergens: ['sulphites'] },
    { id: 'ham', name: 'Cooked ham', kind: 'meat' },
    { id: 'anchovy', name: 'Anchovies', kind: 'fish', allergens: ['fish'] },
    { id: 'mushroom', name: 'Roasted mushrooms', kind: 'veg' },
    { id: 'red-onion', name: 'Red onion', kind: 'veg' },
    { id: 'peppers', name: 'Roasted peppers', kind: 'veg' },
    { id: 'olive', name: 'Kalamata olives', kind: 'veg' },
    { id: 'jalapeno', name: 'Pickled jalapeños', kind: 'veg', spicy: true },
    { id: 'pineapple', name: 'Pineapple', kind: 'veg' },
    { id: 'tomato', name: 'Cherry tomatoes', kind: 'veg' },
    { id: 'rocket', name: 'Arugula', kind: 'veg' },
    { id: 'honey', name: 'Scotch bonnet hot honey', kind: 'honey', spicy: true },
    { id: 'chilli', name: 'Red pepper flakes', kind: 'veg', spicy: true }
  ];

  const MENU = [
    // Pizzas — price is the Regular (12") price.
    { id: 'margherita', section: 'pizzas', name: 'Margherita', price: 15, best: true,
      desc: 'Tomato, fior di latte, basil, a good glug of olive oil. The one we judge every new pizzaiolo on.',
      diet: ['vegetarian', 'gf'], allergens: ['gluten', 'milk'],
      art: { sauce: 'tomato', cheese: true, toppings: ['basil'] } },
    { id: 'marinara', section: 'pizzas', name: 'Marinara', price: 13,
      desc: 'Tomato, garlic slivers, oregano and Sicilian olive oil. No cheese, no regrets.',
      diet: ['vegan', 'vegetarian', 'gf'], allergens: ['gluten'],
      art: { sauce: 'tomato', cheese: false, toppings: ['garlic', 'oregano'] } },
    { id: 'pepperoni', section: 'pizzas', name: 'Pepperoni Party', price: 18, best: true,
      desc: 'A double layer of cup-and-char pepperoni on tomato and fior di latte. Crispy edges, little pools of joy.',
      diet: ['gf'], allergens: ['gluten', 'milk'],
      art: { sauce: 'tomato', cheese: true, toppings: ['pepperoni', 'pepperoni'] } },
    { id: 'hot-honey', section: 'pizzas', name: 'Hot Honey Pep', price: 19, best: true,
      desc: 'Pepperoni, fior di latte and tomato, finished with Scotch bonnet hot honey and red pepper flakes.',
      diet: ['gf', 'spicy'], allergens: ['gluten', 'milk'],
      art: { sauce: 'tomato', cheese: true, toppings: ['pepperoni', 'honey', 'chilli'] } },
    { id: 'nduja', section: 'pizzas', name: 'The Big Nduja', price: 19,
      desc: 'Spicy Calabrian nduja, red onion, fior di latte, tomato and a cooling blob of ricotta.',
      diet: ['gf', 'spicy'], allergens: ['gluten', 'milk'],
      art: { sauce: 'tomato', cheese: true, toppings: ['nduja', 'red-onion', 'ricotta'] } },
    { id: 'sausage', section: 'pizzas', name: 'Sausage & Friarielli', price: 18.5,
      desc: 'Fennel sausage, bitter Neapolitan broccoli, smoked scamorza and garlic on a white base.',
      diet: ['gf'], allergens: ['gluten', 'milk', 'sulphites'],
      art: { sauce: 'bianca', cheese: true, toppings: ['sausage', 'greens', 'garlic'] } },
    { id: 'funghi', section: 'pizzas', name: 'Funghi Bianca', price: 17,
      desc: 'Garlic cream, roasted cremini mushrooms, thyme, fior di latte and a drizzle of truffle oil.',
      diet: ['vegetarian', 'gf'], allergens: ['gluten', 'milk'],
      art: { sauce: 'bianca', cheese: true, toppings: ['mushroom', 'thyme'] } },
    { id: 'green-machine', section: 'pizzas', name: 'Green Machine', price: 17, best: true,
      desc: 'Nut-free basil pesto, zucchini, cherry tomatoes, vegan mozzarella and a handful of arugula.',
      diet: ['vegan', 'vegetarian', 'gf'], allergens: ['gluten', 'soya'],
      art: { sauce: 'pesto', cheese: 'vegan', toppings: ['courgette', 'tomato', 'rocket'] } },
    { id: 'controversial', section: 'pizzas', name: 'The Controversial One', price: 18,
      desc: 'Ham, pineapple, pickled jalapeños, fior di latte, tomato. We said what we said.',
      diet: ['gf', 'spicy'], allergens: ['gluten', 'milk'],
      art: { sauce: 'tomato', cheese: true, toppings: ['ham', 'pineapple', 'jalapeno'] } },
    { id: 'four-cheese', section: 'pizzas', name: 'Quattro Formaggi', price: 17.5,
      desc: 'Fior di latte, gorgonzola, smoked scamorza and vegetarian Italian hard cheese, black pepper, white base.',
      diet: ['vegetarian', 'gf'], allergens: ['gluten', 'milk'],
      art: { sauce: 'bianca', cheese: true, toppings: ['gorgonzola', 'pepper'] } },
    { id: 'veg-out', section: 'pizzas', name: 'Veg Out', price: 16.5,
      desc: 'Roasted peppers, red onion, mushrooms, Kalamata olives, fior di latte and tomato.',
      diet: ['vegetarian', 'gf'], allergens: ['gluten', 'milk'],
      art: { sauce: 'tomato', cheese: true, toppings: ['peppers', 'red-onion', 'mushroom', 'olive'] } },
    { id: 'vegan-diavola', section: 'pizzas', name: 'Vegan Diavola', price: 17.5,
      desc: 'Smoky red-pepper “nduja”, vegan mozzarella, jalapeños, chili oil and tomato.',
      diet: ['vegan', 'vegetarian', 'gf', 'spicy'], allergens: ['gluten', 'soya'],
      art: { sauce: 'tomato', cheese: 'vegan', toppings: ['nduja', 'jalapeno', 'chilli'] } },

    // Sides
    { id: 'garlic-knots', section: 'sides', name: 'Garlic Knots', price: 7, best: false,
      desc: 'Six knots of pizza dough, brushed with garlic butter and parsley. Comes with garlic mayo.',
      diet: ['vegetarian'], allergens: ['gluten', 'milk', 'egg', 'mustard'], art: { type: 'knots' } },
    { id: 'cheesy-bread', section: 'sides', name: 'Cheesy Garlic Bread', price: 8.5,
      desc: 'A 10" sourdough base with garlic butter and a ridiculous amount of mozzarella, cut into strips.',
      diet: ['vegetarian'], allergens: ['gluten', 'milk'], art: { type: 'bread' } },
    { id: 'wings', section: 'sides', name: 'Hot Honey Wings', price: 13,
      desc: 'Eight free-range chicken wings, roasted in the pizza oven and tossed in Scotch bonnet hot honey.',
      diet: ['gf', 'spicy'], allergens: ['celery'], art: { type: 'wings' } },
    { id: 'burrata', section: 'sides', name: 'Burrata & Tomatoes', price: 12,
      desc: 'A whole burrata, marinated heirloom tomatoes, basil oil and flaky salt.',
      diet: ['vegetarian', 'gf'], allergens: ['milk'], art: { type: 'burrata' } },
    { id: 'potatoes', section: 'sides', name: 'Rosemary Potatoes', price: 6.5,
      desc: 'Crispy roast potatoes with rosemary salt and garlic.',
      diet: ['vegan', 'vegetarian', 'gf'], allergens: [], art: { type: 'potatoes' } },
    { id: 'salad', section: 'sides', name: 'Big Green Salad', price: 9,
      desc: 'Little gem lettuce, cucumber, fennel, herbs and a mustardy lemon dressing.',
      diet: ['vegan', 'vegetarian', 'gf'], allergens: ['mustard'], art: { type: 'salad' } },

    // Dips
    { id: 'garlic-mayo', section: 'dips', name: 'Garlic Mayo', price: 1.25,
      desc: 'Roasted and raw garlic, whipped into mayo.', diet: ['vegetarian', 'gf'], allergens: ['egg', 'mustard'],
      art: { type: 'dip', color: '#fbf0cf', swirl: '#efd9a0' } },
    { id: 'vegan-garlic', section: 'dips', name: 'Vegan Garlic Dip', price: 1.25,
      desc: 'Aquafaba garlic mayo. Tastes like the other one.', diet: ['vegan', 'vegetarian', 'gf'], allergens: ['soya', 'mustard'],
      art: { type: 'dip', color: '#f7f2dc', swirl: '#d8e6b4' } },
    { id: 'hot-honey-dip', section: 'dips', name: 'Hot Honey', price: 1.25,
      desc: 'Wildflower honey steeped with Scotch bonnet.', diet: ['vegetarian', 'gf', 'spicy'], allergens: [],
      art: { type: 'dip', color: '#f2a516', swirl: '#c7461b' } },
    { id: 'nduja-mayo', section: 'dips', name: 'Nduja Mayo', price: 1.25,
      desc: 'Spicy, smoky, very orange.', diet: ['gf', 'spicy'], allergens: ['egg', 'mustard'],
      art: { type: 'dip', color: '#e9733a', swirl: '#c2421d' } },
    { id: 'ranch', section: 'dips', name: 'Buttermilk Ranch', price: 1.25,
      desc: 'Cool, herby and made for the Hot Honey Pep.', diet: ['vegetarian', 'gf'], allergens: ['milk', 'egg', 'mustard'],
      art: { type: 'dip', color: '#f4f1e6', swirl: '#8fb46a' } },

    // Desserts
    { id: 'nutella-knots', section: 'desserts', name: 'Nutella Knots', price: 8,
      desc: 'Warm dough knots, cinnamon sugar and a cup of Nutella for dunking.',
      diet: ['vegetarian'], allergens: ['gluten', 'milk', 'nuts', 'soya'], art: { type: 'sweet-knots' } },
    { id: 'tiramisu', section: 'desserts', name: 'Tiramisu Cup', price: 8,
      desc: 'Espresso-soaked savoiardi, mascarpone and a heavy dusting of cocoa.',
      diet: ['vegetarian'], allergens: ['gluten', 'milk', 'egg'], art: { type: 'tiramisu' } },
    { id: 'cookie', section: 'desserts', name: 'Salted Chocolate Cookie', price: 5,
      desc: 'Big, gooey and vegan. Baked in the pizza oven to order.',
      diet: ['vegan', 'vegetarian'], allergens: ['gluten', 'soya'], art: { type: 'cookie' } },
    { id: 'gelato', section: 'desserts', name: 'Pistachio Gelato', price: 6.5,
      desc: 'A 4 oz tub from a gelateria down the road in Westville.',
      diet: ['vegetarian', 'gf'], allergens: ['milk', 'nuts'], art: { type: 'gelato' } },

    // Drinks
    { id: 'cola', section: 'drinks', name: 'Cola', price: 2.5,
      desc: '12 oz can.', diet: ['vegan', 'vegetarian', 'gf'], allergens: [], art: { type: 'can', color: '#c8281a', band: '#2a1209' } },
    { id: 'lemonade', section: 'drinks', name: 'Sicilian Lemonade', price: 3,
      desc: '12 oz can, nice and tart.', diet: ['vegan', 'vegetarian', 'gf'], allergens: [], art: { type: 'can', color: '#ffd23f', band: '#1d6b3c' } },
    { id: 'blood-orange', section: 'drinks', name: 'Blood Orange Soda', price: 3,
      desc: '12 oz can.', diet: ['vegan', 'vegetarian', 'gf'], allergens: [], art: { type: 'can', color: '#e8622c', band: '#7a1d10' } },
    { id: 'water', section: 'drinks', name: 'Still Water', price: 2,
      desc: '16.9 oz bottle.', diet: ['vegan', 'vegetarian', 'gf'], allergens: [], art: { type: 'bottle', color: '#9fd3e6', band: '#2f7fa3' } },
    { id: 'pale', section: 'drinks', name: 'Club Pale Ale', price: 7,
      desc: 'Our house pale, 4.5%, brewed a few blocks away in Wooster Square. 21+, ID checked on delivery.',
      diet: ['vegan', 'vegetarian'], allergens: ['gluten'], art: { type: 'bottle', color: '#c97b22', band: '#fff4e2' } }
  ];

  // Fixed deals. art: pizzas drawn on the deal card. Each slot is either a choice ('pizza' at a size, or a menu section)
  // or a fixed item. Deal pizzas come on the classic crust with no extras.
  const DEALS = [
    { id: 'lunch', name: 'Solo Lunch', price: 12, tagline: 'Any small pizza and a cold drink',
      when: 'Every day until 4 PM, pickup or delivery', color: 'cheese', art: ['margherita'],
      slots: [{ choose: 'pizzas', size: 'small', label: 'Your pizza' }, { choose: 'drinks', label: 'Your drink' }] },
    { id: 'date-night', name: 'Date Night Duo', price: 34, tagline: 'Two regular pizzas, garlic knots and two dips', popular: true,
      when: 'Any day, all day', color: 'tomato', art: ['pepperoni', 'green-machine'],
      slots: [{ choose: 'pizzas', size: 'regular', label: 'Pizza one' }, { choose: 'pizzas', size: 'regular', label: 'Pizza two' },
        { item: 'garlic-knots' }, { choose: 'dips', label: 'Dip one' }, { choose: 'dips', label: 'Dip two' }] },
    { id: 'family', name: 'Family Feast', price: 56, tagline: 'Two large pizzas, two sides, four dips and a dessert',
      when: 'Any day, all day', color: 'basil', art: ['hot-honey', 'veg-out'],
      slots: [{ choose: 'pizzas', size: 'large', label: 'Large pizza one' }, { choose: 'pizzas', size: 'large', label: 'Large pizza two' },
        { choose: 'sides', label: 'Side one' }, { choose: 'sides', label: 'Side two' },
        { choose: 'dips', label: 'Dip one' }, { choose: 'dips', label: 'Dip two' }, { choose: 'dips', label: 'Dip three' }, { choose: 'dips', label: 'Dip four' },
        { choose: 'desserts', label: 'Dessert' }] }
  ];

  // Build-your-bundle: regular pizzas plus sides, desserts and drinks. The best tier you
  // qualify for applies to the whole bundle.
  const BUNDLE_TIERS = [
    { pizzas: 2, sides: 1, off: 15, label: '15% off' },
    { pizzas: 3, sides: 2, off: 20, label: '20% off' }
  ];
  const BUNDLE_SECTIONS = ['pizzas', 'sides', 'desserts', 'drinks'];
  const BUNDLE_MAX = 12; // items in one bundle

  /* ------------------------------------------------------------------
   * 3. Helpers
   * ------------------------------------------------------------------ */
  const money = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY });
  const fmt = (n) => money.format(Math.round(n * 100) / 100);
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const round2 = (n) => Math.round(n * 100) / 100;

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
  const findItem = (id) => MENU.find((m) => m.id === id) || null;
  const findSize = (id) => SIZES.find((s) => s.id === id) || null;
  const findCrust = (id) => CRUSTS.find((c) => c.id === id) || null;
  const findTopping = (id) => TOPPINGS.find((t) => t.id === id) || null;
  const findStore = (id) => STORES.find((s) => s.id === id) || null;
  const findZone = (id) => ZONES.find((z) => z.id === id) || null;
  const findDeal = (id) => DEALS.find((d) => d.id === id) || null;
  const itemsIn = (section) => MENU.filter((m) => m.section === section);
  const isPizza = (item) => !!item && item.section === 'pizzas';

  // pizza: label gluten-free as "GF base" (pizzas can be made on a gluten-free base).
  function dietTags(diet, small, pizza) {
    return ['vegan', 'vegetarian', 'gf', 'spicy'].filter((d) => diet.indexOf(d) !== -1)
      // Vegan already implies vegetarian: show one badge.
      .filter((d) => !(d === 'vegetarian' && diet.indexOf('vegan') !== -1))
      .map((d) => '<span class="tag tag-' + d + '"' + (small ? ' title="' + DIETS[d].label + '"' : '') + '>' +
        (d === 'spicy' ? '<svg viewBox="0 0 16 16" class="size-3" fill="currentColor" aria-hidden="true"><path d="M10.6 2.2c.4-.6 1.3-.3 1.2.4-.1.5.2.9.6 1.1 1.4.7 1.9 2.4 1.2 3.8C11.8 11 8 14 3 13.6c-.6 0-.7-.8-.2-1C6 11.3 7.8 8.6 8.3 5.6c.2-1 .9-1.6 1.8-1.7.3-.4.3-1 .5-1.7z"/></svg>' : '') +
        escapeHtml(small ? DIETS[d].short : pizza && d === 'gf' ? 'GF base' : DIETS[d].label) + (pizza && d === 'gf' && !small ? '<span class="sr-only"> available</span>' : '') + (small ? '<span class="sr-only"> (' + DIETS[d].label + ')</span>' : '') + '</span>').join('');
  }

  /* ------------------------------------------------------------------
   * 4. Opening hours and time slots. Everything uses the shop's clock
   *    (TIMEZONE), so a visitor in another time zone sees real hours.
   * ------------------------------------------------------------------ */
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const toMins = (hhmm) => { const p = hhmm.split(':'); return +p[0] * 60 + +p[1]; };
  const pad = (n) => String(n).padStart(2, '0');
  const clock = (mins) => {
    const h = Math.floor(mins / 60) % 24;
    return (h % 12 || 12) + ':' + pad(mins % 60) + (h < 12 ? ' AM' : ' PM');
  };
  // "22:00" (how hours are written in the data) -> "10:00 PM".
  const clockOf = (hhmm) => clock(toMins(hhmm));

  // Today in the shop's time zone: { date: 'YYYY-MM-DD', day: 0-6, mins: minutes since midnight }.
  function shopNow(at) {
    const parts = {};
    new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23', weekday: 'short' })
      .formatToParts(at || new Date()).forEach((p) => { parts[p.type] = p.value; });
    const date = parts.year + '-' + parts.month + '-' + parts.day;
    const day = new Date(Date.UTC(+parts.year, +parts.month - 1, +parts.day)).getUTCDay();
    return { date: date, day: day, mins: (+parts.hour % 24) * 60 + +parts.minute };
  }
  function addDays(isoDate, n) {
    const d = new Date(isoDate + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function dayOf(isoDate) { return new Date(isoDate + 'T12:00:00Z').getUTCDay(); }
  function dateLabel(isoDate, today) {
    if (isoDate === today) return 'Today';
    if (isoDate === addDays(today, 1)) return 'Tomorrow';
    return new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(isoDate + 'T12:00:00Z'));
  }
  function hoursLabel(h) { return h ? clockOf(h[0]) + '–' + clockOf(h[1]) : 'Closed'; }

  // { open: bool, text: 'Open until 10:00 PM' | 'Opens 4:00 PM' | 'Opens Tuesday 4:00 PM' }
  function storeStatus(store, at) {
    const now = shopNow(at);
    const h = store.hours[now.day];
    if (h && now.mins >= toMins(h[0]) && now.mins < toMins(h[1])) {
      const left = toMins(h[1]) - now.mins;
      return { open: true, closingSoon: left <= 45, text: left <= 45 ? 'Closing soon, last orders ' + clockOf(h[1]) : 'Open until ' + clockOf(h[1]) };
    }
    if (h && now.mins < toMins(h[0])) return { open: false, text: 'Opens today ' + clockOf(h[0]) };
    for (let i = 1; i <= 7; i++) {
      const d = (now.day + i) % 7;
      if (store.hours[d]) return { open: false, text: 'Opens ' + (i === 1 ? 'tomorrow' : DAY_NAMES[d]) + ' ' + clockOf(store.hours[d][0]) };
    }
    return { open: false, text: 'Closed' };
  }

  // Time slots for a shop on a date ('YYYY-MM-DD' in the shop's zone). The first slot is
  // the lead time after opening (or after now, for today), the last is closing time.
  function timeSlots(store, isoDate, mode, at) {
    const h = store.hours[dayOf(isoDate)];
    if (!h) return [];
    const lead = mode === 'delivery' ? store.deliveryMins : store.pickupMins;
    const now = shopNow(at);
    let start = toMins(h[0]) + lead;
    if (isoDate === now.date) start = Math.max(start, now.mins + lead);
    start = Math.ceil(start / SLOT_STEP) * SLOT_STEP;
    const out = [];
    for (let m = start; m <= toMins(h[1]); m += SLOT_STEP) out.push(m);
    return out;
  }

  /* ------------------------------------------------------------------
   * 5. Pizza and food artwork. Pizzas are drawn from their art settings
   *    (sauce, cheese, toppings), so a new pizza in MENU gets its own
   *    picture and the customizer preview follows the extras you pick.
   * ------------------------------------------------------------------ */
  /* ART:START */
  const Art = (function () {
    let uid = 0;
    // Small seeded random generator, so the same pizza always looks the same.
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
    const f = (n) => Math.round(n * 10) / 10;
    // A smooth wobbly closed shape (Catmull-Rom through jittered points).
    function blob(cx, cy, r, rand, points, wobble) {
      const n = points || 9;
      const w = wobble == null ? 0.2 : wobble;
      const pts = [];
      const turn = rand() * Math.PI * 2;
      for (let i = 0; i < n; i++) {
        const a = turn + (i / n) * Math.PI * 2;
        const rr = r * (1 - w / 2 + rand() * w);
        pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
      }
      let d = 'M' + f(pts[0][0]) + ' ' + f(pts[0][1]);
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
        d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6) + ' ' +
          f(p2[0] - (p3[0] - p1[0]) / 6) + ' ' + f(p2[1] - (p3[1] - p1[1]) / 6) + ' ' + f(p2[0]) + ' ' + f(p2[1]);
      }
      return d + 'Z';
    }
    const SAUCE = { tomato: ['#d4381c', '#b92c14'], bianca: ['#f8e6c0', '#ecd29f'], pesto: ['#5f9334', '#4b7d27'] };
    const g = (x, y, rot, inner) => '<g transform="translate(' + f(x) + ' ' + f(y) + ') rotate(' + Math.round(rot) + ')">' + inner + '</g>';

    // One drawer per topping: (x, y, rotation, rand) → SVG.
    const PIECES = {
      pepperoni: (x, y, r, R) => g(x, y, r, '<circle r="10.5" fill="#a92a17"/><circle r="8.6" fill="#c53720"/><circle cx="-2.5" cy="-2" r="2" fill="#8e2212" opacity=".55"/><circle cx="3" cy="2.6" r="1.5" fill="#8e2212" opacity=".55"/><circle cx="2" cy="-3.5" r="1.1" fill="#ef8d6b" opacity=".7"/><path d="M-6 3.5a7 7 0 0 0 7.5 3.4" stroke="#7d1b0d" stroke-width="1.4" fill="none" stroke-linecap="round" opacity=".6"/>'),
      basil: (x, y, r) => g(x, y, r, '<path d="M0-10C8-7 8 6 0 10-8 6-8-7 0-10Z" fill="#2f8a3f"/><path d="M0-8V8" stroke="#1d6b2c" stroke-width="1.3" stroke-linecap="round"/><path d="M-3-4c2 1 3 2 3 3" stroke="#57a85f" stroke-width="1" fill="none" opacity=".6"/>'),
      mozzarella: (x, y, r, R) => '<path d="' + blob(x, y, 9.5, R, 7, 0.3) + '" fill="#fffaf0" stroke="#f0dcae" stroke-width="1.2"/>',
      'vegan-mozz': (x, y, r, R) => '<path d="' + blob(x, y, 8.5, R, 7, 0.3) + '" fill="#fff6d2" stroke="#ead598" stroke-width="1.2"/>',
      ricotta: (x, y, r, R) => '<path d="' + blob(x, y, 7, R, 7, 0.35) + '" fill="#ffffff" stroke="#efe3c8" stroke-width="1"/>',
      burrata: (x, y, r, R) => '<path d="' + blob(x, y, 15, R, 9, 0.18) + '" fill="#fffdf6" stroke="#eadcb8" stroke-width="1.4"/><path d="' + blob(x + 2, y + 1, 7, R, 7, 0.3) + '" fill="#fbf2dc"/>',
      gorgonzola: (x, y, r, R) => '<path d="' + blob(x, y, 7.5, R, 7, 0.35) + '" fill="#f7f2e2" stroke="#e5dcc1" stroke-width="1"/><circle cx="' + f(x - 2) + '" cy="' + f(y + 1) + '" r="1.3" fill="#6f86a6"/><circle cx="' + f(x + 2.5) + '" cy="' + f(y - 1.5) + '" r="1" fill="#6f86a6"/>',
      mushroom: (x, y, r) => g(x, y, r, '<path d="M-9 1C-9-7 9-7 9 1Z" fill="#c99b6e" stroke="#7d5232" stroke-width="1.4"/><path d="M-3.4 1h6.8l-.8 7h-5.2Z" fill="#e8d1b0" stroke="#7d5232" stroke-width="1.4" stroke-linejoin="round"/><path d="M-5-1.5h10" stroke="#7d5232" stroke-width="1" opacity=".6"/>'),
      'red-onion': (x, y, r) => g(x, y, r, '<path d="M-9 3A9.5 9.5 0 0 1 9 3" stroke="#8e2f6e" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M-5.5 3.5A6 6 0 0 1 5.5 3.5" stroke="#c87bb0" stroke-width="2" fill="none" stroke-linecap="round"/>'),
      peppers: (x, y, r, R) => g(x, y, r, '<rect x="-9" y="-2.6" width="18" height="5.2" rx="2.6" fill="' + (R() > 0.5 ? '#e5532a' : '#f0b429') + '"/><rect x="-7" y="-1.4" width="9" height="1.6" rx=".8" fill="#fff" opacity=".35"/>'),
      olive: (x, y) => '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="4.6" fill="none" stroke="#3a2a2e" stroke-width="3.4"/><circle cx="' + f(x - 1.5) + '" cy="' + f(y - 2) + '" r=".9" fill="#a99aa0"/>',
      jalapeno: (x, y) => '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="5.6" fill="#7bb342" stroke="#3f7a1f" stroke-width="1.6"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="2.8" fill="#d8e9a6"/><circle cx="' + f(x - 1) + '" cy="' + f(y - .6) + '" r=".8" fill="#f6efc4"/><circle cx="' + f(x + 1.2) + '" cy="' + f(y + .8) + '" r=".8" fill="#f6efc4"/>',
      nduja: (x, y, r, R) => '<path d="' + blob(x, y, 7, R, 7, 0.45) + '" fill="#b32c13"/><path d="' + blob(x + 1, y - 1, 3, R, 6, 0.4) + '" fill="#e0602f" opacity=".7"/>',
      sausage: (x, y, r, R) => '<path d="' + blob(x, y, 4.6, R, 6, 0.5) + '" fill="#8f5530"/><path d="' + blob(x + 5, y + 2, 3.6, R, 6, 0.5) + '" fill="#a0653b"/><path d="' + blob(x - 2, y + 5, 3.2, R, 6, 0.5) + '" fill="#7d4726"/>',
      ham: (x, y, r, R) => '<path d="' + blob(x, y, 8.5, R, 6, 0.35) + '" fill="#f0a39b" stroke="#d77c72" stroke-width="1.3"/><path d="M' + f(x - 4) + ' ' + f(y - 2) + 'q4 2 8 0" stroke="#fbd0c8" stroke-width="1.4" fill="none" stroke-linecap="round"/>',
      anchovy: (x, y, r) => g(x, y, r, '<path d="M-10 0C-5-3.4 5-3.4 10 0 5 3.4-5 3.4-10 0Z" fill="#7a6455"/><path d="M-8 0h15" stroke="#c9b7a6" stroke-width=".9"/>'),
      pineapple: (x, y, r) => g(x, y, r, '<path d="M-7-6L7-6 0 8Z" fill="#ffd54a" stroke="#e1a51c" stroke-width="1.5" stroke-linejoin="round"/><path d="M-3-3h6" stroke="#fff3b8" stroke-width="1.2" stroke-linecap="round"/>'),
      tomato: (x, y) => '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="6.4" fill="#e2412a" stroke="#a82a17" stroke-width="1.3"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="3.4" fill="#f57a5c"/><circle cx="' + f(x - 2.2) + '" cy="' + f(y - 2.4) + '" r="1.1" fill="#ffd2c4"/>',
      courgette: (x, y) => '<circle cx="' + f(x) + '" cy="' + f(y) + '" r="7" fill="#e9eeb6" stroke="#3f7f2c" stroke-width="2.2"/><circle cx="' + f(x) + '" cy="' + f(y) + '" r="2.6" fill="#d6dd8e"/>',
      rocket: (x, y, r) => g(x, y, r, '<path d="M-10 2c3-4 5 1 8-3s4 2 7-1 4 1 5 0" stroke="#3f8a2e" stroke-width="3.2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>'),
      greens: (x, y, r, R) => '<path d="' + blob(x, y, 6.5, R, 7, 0.55) + '" fill="#2f5e2a"/><path d="' + blob(x + 3, y - 3, 3, R, 6, 0.5) + '" fill="#4f8a3a"/>',
      garlic: (x, y, r) => g(x, y, r, '<path d="M-4.5 0C-4.5-3 4.5-3 4.5 0S-4.5 3-4.5 0Z" fill="#fff6dc" stroke="#e2c98f" stroke-width="1"/>')
    };
    const COUNTS = { pepperoni: 9, basil: 5, mozzarella: 6, 'vegan-mozz': 6, ricotta: 5, burrata: 1, gorgonzola: 8, mushroom: 7, 'red-onion': 6,
      peppers: 8, olive: 8, jalapeno: 8, nduja: 9, sausage: 8, ham: 7, anchovy: 6, pineapple: 7, tomato: 7, courgette: 7, rocket: 7, greens: 7, garlic: 8 };
    const DUST = { chilli: ['#b8230f', 1.3, 26], oregano: ['#6d8a35', 1.1, 30], pepper: ['#2f241d', 1, 26], thyme: ['#55803a', 1.1, 22] };

    // Evenly-ish spread points inside the sauce, on one side for half-and-half pizzas.
    function place(count, R, side, taken, minGap) {
      const out = [];
      const radius = 62;
      for (let i = 0; i < count; i++) {
        let best = null, bestGap = -1;
        for (let t = 0; t < 24; t++) {
          const a = R() * Math.PI * 2;
          const d = radius * Math.sqrt(R());
          let x = Math.cos(a) * d, y = Math.sin(a) * d;
          if (side && x * side < 6) x = side * (6 + Math.abs(x) * 0.9);
          let gap = 999;
          taken.concat(out).forEach((p) => { gap = Math.min(gap, Math.hypot(p[0] - x, p[1] - y)); });
          if (gap > bestGap) { best = [x, y]; bestGap = gap; }
          if (gap >= minGap) break;
        }
        out.push(best);
      }
      return out;
    }

    function layer(spec, seed, side) {
      const R = rng(seed + (side || 0));
      const sauce = SAUCE[spec.sauce] || SAUCE.tomato;
      let s = '<path d="' + blob(0, 0, 80, R, 14, 0.06) + '" fill="' + sauce[0] + '"/>';
      // A few darker sauce streaks.
      for (let i = 0; i < 6; i++) {
        const a = R() * Math.PI * 2, d = 20 + R() * 50;
        s += '<path d="' + blob(Math.cos(a) * d, Math.sin(a) * d, 6 + R() * 8, R, 6, 0.5) + '" fill="' + sauce[1] + '" opacity=".55"/>';
      }
      if (spec.cheese) {
        const fill = spec.cheese === 'vegan' ? '#fff3cc' : '#fff4d8';
        const pts = place(9, R, side, [], 30);
        pts.forEach((p) => {
          s += '<path d="' + blob(p[0], p[1], 13 + R() * 7, R, 8, 0.32) + '" fill="' + fill + '"/>';
          s += '<path d="' + blob(p[0] + 2, p[1] - 2, 4 + R() * 3, R, 6, 0.4) + '" fill="#ffe594" opacity=".8"/>';
          if (R() > 0.55) s += '<circle cx="' + f(p[0] - 4) + '" cy="' + f(p[1] + 3) + '" r="1.8" fill="#e7b25c" opacity=".7"/>';
        });
      }
      const taken = [];
      const counts = {};
      (spec.toppings || []).forEach((t) => { counts[t] = (counts[t] || 0) + 1; });
      // Big pieces first, scatter and drizzles last.
      Object.keys(counts).forEach((t) => {
        if (!PIECES[t]) return;
        const n = Math.round((COUNTS[t] || 6) * (counts[t] > 1 ? 1.75 : 1) * (side ? 0.6 : 1));
        const pts = place(Math.max(1, n), R, side, taken, t === 'burrata' ? 0 : 15);
        pts.forEach((p) => { taken.push(p); s += PIECES[t](p[0], p[1], R() * 360, R); });
      });
      Object.keys(counts).forEach((t) => {
        if (!DUST[t]) return;
        const d = DUST[t];
        const pts = place(Math.round(d[2] * (side ? 0.6 : 1)), R, side, [], 6);
        pts.forEach((p) => { s += '<circle cx="' + f(p[0]) + '" cy="' + f(p[1]) + '" r="' + d[1] + '" fill="' + d[0] + '"/>'; });
      });
      if (counts.honey) {
        let d = '';
        for (let i = 0; i < 3; i++) {
          const y0 = -45 + i * 40 + R() * 10;
          const x0 = side ? side * 8 : -55, x1 = side ? side * 64 : 55;
          d += 'M' + f(x0) + ' ' + f(y0) + ' ';
          for (let x = x0; side ? (side > 0 ? x < x1 : x > x1) : x < x1; x += (side || 1) * 14) d += 'Q' + f(x + (side || 1) * 7) + ' ' + f(y0 + (R() > 0.5 ? 9 : -9)) + ' ' + f(x + (side || 1) * 14) + ' ' + f(y0 + R() * 4) + ' ';
        }
        s += '<path d="' + d + '" stroke="#f2a516" stroke-width="2.6" fill="none" stroke-linecap="round" opacity=".95"/>';
      }
      return s;
    }

    function crust(R, extraFill) {
      let s = '<path d="' + blob(0, 0, 97, R, 18, 0.05) + '" fill="#e2994d"/>';
      s += '<path d="' + blob(0, -1, 94, R, 18, 0.05) + '" fill="' + (extraFill || '#eeb26a') + '"/>';
      s += '<path d="' + blob(0, -2, 90, R, 16, 0.04) + '" fill="#f6c983" opacity=".7"/>';
      // Leopard spotting: the charred blisters of a hot oven.
      for (let i = 0; i < 16; i++) {
        const a = R() * Math.PI * 2, d = 84 + R() * 10;
        s += '<path d="' + blob(Math.cos(a) * d, Math.sin(a) * d, 1.6 + R() * 2.6, R, 6, 0.4) + '" fill="#5e3014" opacity="' + (0.35 + R() * 0.4).toFixed(2) + '"/>';
      }
      return s;
    }

    // spec: { seed, halves: [{ sauce, cheese, toppings }, { … }?], stuffed?, thin?, slice?, label? }
    function pizza(spec) {
      const id = 'pz' + (++uid);
      const R = rng(spec.seed || 'pizza');
      const halves = spec.halves || [spec];
      let inner = crust(R, spec.stuffed ? '#f3c27a' : null);
      if (spec.stuffed) inner += '<circle r="88" fill="none" stroke="#fff0c4" stroke-width="2.4" stroke-dasharray="3 7" opacity=".9"/>';
      const scale = spec.thin ? ' transform="scale(1.07)"' : '';
      if (halves.length === 2) {
        inner += '<defs><clipPath id="' + id + 'l"><rect x="-100" y="-100" width="100" height="200"/></clipPath><clipPath id="' + id + 'r"><rect x="0" y="-100" width="100" height="200"/></clipPath></defs>';
        inner += '<g' + scale + '><g clip-path="url(#' + id + 'l)">' + layer(halves[0], spec.seed + 'a', -1) + '</g>' +
          '<g clip-path="url(#' + id + 'r)">' + layer(halves[1], spec.seed + 'b', 1) + '</g></g>';
        inner += '<path d="M0-82V82" stroke="#f6c983" stroke-width="3" stroke-linecap="round" opacity=".9"/>';
      } else {
        inner += '<g' + scale + '>' + layer(halves[0], spec.seed, 0) + '</g>';
      }
      // Slice lines.
      inner += '<g stroke="#8a4a1f" stroke-width="1.1" opacity=".22">' + [0, 45, 90, 135].map((a) => '<path transform="rotate(' + a + ')" d="M-90 0H90"/>').join('') + '</g>';
      if (spec.slice) return sliced(id, inner);
      return '<svg viewBox="-100 -100 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + inner + '</svg>';
    }

    // The hero pizza: one slice pulled out, with cheese strings.
    function sliced(id, inner) {
      const a1 = -62 * Math.PI / 180, a2 = -22 * Math.PI / 180, r = 112;
      const p1 = f(Math.cos(a1) * r) + ' ' + f(Math.sin(a1) * r), p2 = f(Math.cos(a2) * r) + ' ' + f(Math.sin(a2) * r);
      const mid = (a1 + a2) / 2, dx = f(Math.cos(mid) * 30), dy = f(Math.sin(mid) * 30);
      return '<svg viewBox="-112 -132 232 236" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' +
        '<defs><clipPath id="' + id + 'main"><path d="M0 0L' + p2 + 'A' + r + ' ' + r + ' 0 1 1 ' + p1 + 'Z"/></clipPath>' +
        '<clipPath id="' + id + 'cut"><path d="M0 0L' + p1 + 'A' + r + ' ' + r + ' 0 0 1 ' + p2 + 'Z"/></clipPath></defs>' +
        '<g clip-path="url(#' + id + 'main)">' + inner + '</g>' +
        '<g transform="translate(' + dx + ' ' + dy + ')"><g clip-path="url(#' + id + 'cut)">' + inner + '</g></g>' +
        '<g fill="none" stroke="#fff2cf" stroke-linecap="round">' +
          '<path d="M' + f(Math.cos(a1) * 40) + ' ' + f(Math.sin(a1) * 40) + 'q6 4 ' + f(Number(dx) + 2) + ' ' + f(Number(dy) + 2) + '" stroke-width="3.2"/>' +
          '<path d="M' + f(Math.cos(a1) * 62) + ' ' + f(Math.sin(a1) * 62) + 'q5 7 ' + f(Number(dx) + 1) + ' ' + f(Number(dy) + 3) + '" stroke-width="2.2"/>' +
          '<path d="M' + f(Math.cos(a2) * 34) + ' ' + f(Math.sin(a2) * 34) + 'q10 -2 ' + f(Number(dx)) + ' ' + f(Number(dy)) + '" stroke-width="2.6"/>' +
          '<path d="M' + f(Math.cos(a2) * 58) + ' ' + f(Math.sin(a2) * 58) + 'q8 -6 ' + f(Number(dx) - 1) + ' ' + f(Number(dy) + 1) + '" stroke-width="1.8"/>' +
        '</g></svg>';
    }

    // Everything that isn't a pizza: sides, dips, desserts and drinks (viewBox 0 0 200 200).
    function food(art) {
      const R = rng(art.type + (art.color || ''));
      let s = '';
      const knot = (x, y, rot, fill, glaze) => g(x, y, rot,
        '<path d="' + blob(0, 2, 25, R, 8, 0.16) + '" fill="#2a1209" opacity=".12"/>' +
        '<path d="' + blob(0, 0, 24, R, 8, 0.16) + '" fill="#b8722f"/><path d="' + blob(-1, -1, 21, R, 8, 0.16) + '" fill="' + fill + '"/>' +
        '<path d="M-13 3c-2-11 12-17 19-9s-1 17-9 13-1-11 5-8" fill="none" stroke="#a8622a" stroke-width="3.4" stroke-linecap="round" opacity=".75"/>' +
        '<path d="M-12-8c4-6 11-8 16-6" fill="none" stroke="' + glaze + '" stroke-width="3.4" stroke-linecap="round" opacity=".85"/>');
      const plate = (fill) => '<ellipse cx="100" cy="112" rx="84" ry="80" fill="#2a1209" opacity=".12"/><circle cx="100" cy="104" r="82" fill="' + (fill || '#fffaf2') + '"/><circle cx="100" cy="104" r="68" fill="none" stroke="#2a1209" stroke-opacity=".08" stroke-width="2"/>';
      switch (art.type) {
        case 'knots':
        case 'sweet-knots': {
          const sweet = art.type === 'sweet-knots';
          s += '<rect x="22" y="30" width="156" height="148" rx="18" fill="#2a1209" opacity=".12" transform="rotate(-4 100 104)"/>';
          s += '<rect x="20" y="24" width="156" height="148" rx="18" fill="#fffaf2" transform="rotate(-4 100 100)"/>';
          s += '<path d="M28 40l140-10M30 62l140-10M32 84l140-10M34 106l140-10M36 128l140-10M38 150l140-10" stroke="#cc2a16" stroke-width="6" opacity=".18" transform="rotate(-4 100 100)"/>';
          [[66, 70, -12], [128, 66, 18], [70, 134, 24], [132, 132, -20]].forEach((k) => { s += knot(k[0], k[1], k[2], sweet ? '#d38a45' : '#e8a55c', sweet ? '#f6d9a3' : '#fff2c7'); });
          if (sweet) {
            s += '<circle cx="100" cy="100" r="22" fill="#fffaf2" stroke="#e9d8b8" stroke-width="3"/><path d="' + blob(100, 100, 16, R, 8, 0.2) + '" fill="#5a2e17"/><path d="M92 96q8-6 14 2" stroke="#8a4f2c" stroke-width="3" fill="none" stroke-linecap="round"/>';
            for (let i = 0; i < 26; i++) s += '<circle cx="' + f(40 + R() * 120) + '" cy="' + f(40 + R() * 120) + '" r="1.3" fill="#f1e2c4"/>';
          } else {
            for (let i = 0; i < 30; i++) s += '<circle cx="' + f(40 + R() * 120) + '" cy="' + f(40 + R() * 120) + '" r="1.4" fill="#3c7a2c"/>';
          }
          break;
        }
        case 'bread':
          s += '<ellipse cx="102" cy="112" rx="88" ry="74" fill="#2a1209" opacity=".12"/><rect x="18" y="36" width="164" height="136" rx="26" fill="#a86a3d"/><rect x="22" y="40" width="156" height="128" rx="22" fill="#e6a55e"/>';
          s += '<path d="' + blob(100, 104, 64, R, 14, 0.12) + '" fill="#fff0c2"/>';
          for (let i = 0; i < 9; i++) s += '<path d="' + blob(40 + R() * 120, 52 + R() * 104, 7 + R() * 7, R, 7, 0.4) + '" fill="#f7c35a" opacity=".85"/>';
          for (let i = 0; i < 22; i++) s += '<circle cx="' + f(42 + R() * 116) + '" cy="' + f(56 + R() * 96) + '" r="1.5" fill="#3c7a2c"/>';
          s += '<path d="M72 38v132M128 38v132M20 104h160" stroke="#8a4a1f" stroke-width="2.4" opacity=".35"/>';
          break;
        case 'wings':
          s += plate('#fffaf2');
          [[70, 78, -30], [128, 76, 30], [68, 130, 200], [130, 132, 150], [100, 104, 90]].forEach((w) => {
            s += g(w[0], w[1], w[2], '<path d="M-20-4C-20-18 10-22 18-8c6 10-2 22-16 20C-10 13-20 8-20-4Z" fill="#b8431c"/><path d="M-14-6C-12-14 4-16 10-8" stroke="#f2a516" stroke-width="4" fill="none" stroke-linecap="round" opacity=".85"/><circle cx="-6" cy="2" r="2" fill="#7d220d"/>');
          });
          for (let i = 0; i < 20; i++) s += '<circle cx="' + f(50 + R() * 100) + '" cy="' + f(56 + R() * 96) + '" r="1.4" fill="#fff2cf"/>';
          break;
        case 'burrata':
          s += plate('#fffaf2');
          s += '<path d="' + blob(100, 104, 60, R, 12, 0.1) + '" fill="#4f8a3a" opacity=".25"/>';
          [[62, 70], [140, 78], [56, 132], [146, 136], [100, 160], [96, 52]].forEach((p) => { s += '<path d="' + blob(p[0], p[1], 13, R, 7, 0.25) + '" fill="#e2412a"/><path d="' + blob(p[0], p[1], 6, R, 6, 0.3) + '" fill="#f57a5c"/>'; });
          s += '<path d="' + blob(100, 104, 34, R, 10, 0.12) + '" fill="#fffdf6" stroke="#eadcb8" stroke-width="2"/><path d="' + blob(104, 110, 16, R, 8, 0.25) + '" fill="#fbf1d6"/><path d="M84 92q10-8 20-2" stroke="#ffffff" stroke-width="4" fill="none" stroke-linecap="round"/>';
          s += PIECES.basil(124, 92, 30) + PIECES.basil(78, 120, -50);
          break;
        case 'potatoes':
          s += plate('#fffaf2');
          for (let i = 0; i < 16; i++) {
            const a = R() * Math.PI * 2, d = 50 * Math.sqrt(R());
            s += g(100 + Math.cos(a) * d, 104 + Math.sin(a) * d, R() * 90, '<rect x="-10" y="-9" width="20" height="18" rx="6" fill="#e4a04a"/><rect x="-7" y="-6" width="11" height="8" rx="3" fill="#f6cf7a"/>');
          }
          for (let i = 0; i < 9; i++) s += g(60 + R() * 80, 64 + R() * 80, R() * 180, '<path d="M-7 0h14" stroke="#2f6b2c" stroke-width="2.2" stroke-linecap="round"/>');
          break;
        case 'salad':
          s += '<ellipse cx="100" cy="114" rx="84" ry="78" fill="#2a1209" opacity=".12"/><circle cx="100" cy="104" r="82" fill="#1d6b3c"/><circle cx="100" cy="104" r="72" fill="#fffaf2"/>';
          for (let i = 0; i < 14; i++) {
            const a = R() * Math.PI * 2, d = 44 * Math.sqrt(R());
            s += '<path d="' + blob(100 + Math.cos(a) * d, 104 + Math.sin(a) * d, 14 + R() * 8, R, 7, 0.45) + '" fill="' + ['#7cb342', '#9ccc65', '#5b9a35', '#b7d77a'][i % 4] + '"/>';
          }
          for (let i = 0; i < 7; i++) s += '<circle cx="' + f(64 + R() * 72) + '" cy="' + f(68 + R() * 72) + '" r="7" fill="#e8f2c8" stroke="#6aa23b" stroke-width="2"/>';
          break;
        case 'dip':
          s += '<ellipse cx="100" cy="116" rx="72" ry="66" fill="#2a1209" opacity=".14"/><circle cx="100" cy="104" r="70" fill="#fffaf2"/><circle cx="100" cy="104" r="70" fill="none" stroke="#e9d8b8" stroke-width="5"/>' +
            '<circle cx="100" cy="104" r="56" fill="' + art.color + '"/><path d="M70 104c0-20 30-30 40-14s-6 26-18 18 2-18 12-10" fill="none" stroke="' + art.swirl + '" stroke-width="6" stroke-linecap="round" opacity=".8"/>' +
            '<path d="M66 82a44 44 0 0 1 22-18" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5" fill="none"/>';
          break;
        case 'tiramisu':
          s += '<ellipse cx="100" cy="176" rx="58" ry="10" fill="#2a1209" opacity=".14"/>' +
            '<path d="M48 44h104l-10 128H58Z" fill="#f4e6cf" stroke="#e2d0b0" stroke-width="3"/>' +
            '<path d="M51 80h98l-2 22H53Z" fill="#7a4a2c"/><path d="M54 122h92l-2 20H56Z" fill="#7a4a2c"/>' +
            '<path d="M52 102h96l-2 20H54Z" fill="#fff7e6"/><path d="M56 142h88l-2 26H58Z" fill="#fff7e6"/>' +
            '<path d="' + blob(100, 56, 50, R, 12, 0.06) + '" fill="#fffaf0" transform="scale(1 .38) translate(0 92)"/>' +
            '<ellipse cx="100" cy="56" rx="52" ry="12" fill="#5a2e17"/><ellipse cx="100" cy="54" rx="44" ry="8" fill="#6d3a1d"/>' +
            '<path d="M58 60v100" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45"/>';
          break;
        case 'cookie':
          s += '<ellipse cx="104" cy="114" rx="74" ry="70" fill="#2a1209" opacity=".14"/><path d="' + blob(100, 102, 72, R, 14, 0.08) + '" fill="#c98544"/><path d="' + blob(100, 100, 62, R, 12, 0.1) + '" fill="#dda15e"/>';
          for (let i = 0; i < 11; i++) { const a = R() * 6.28, d = 50 * Math.sqrt(R()); s += '<path d="' + blob(100 + Math.cos(a) * d, 100 + Math.sin(a) * d, 6 + R() * 5, R, 6, 0.4) + '" fill="#4a230e"/>'; }
          for (let i = 0; i < 14; i++) s += g(50 + R() * 100, 50 + R() * 100, R() * 90, '<rect x="-1.6" y="-1.6" width="3.2" height="3.2" fill="#ffffff" opacity=".9"/>');
          break;
        case 'gelato':
          s += '<ellipse cx="100" cy="178" rx="50" ry="9" fill="#2a1209" opacity=".14"/><path d="M56 92h88l-10 82H66Z" fill="#fffaf2" stroke="#e2d0b0" stroke-width="3"/><path d="M60 120h80" stroke="#1d6b3c" stroke-width="10"/>' +
            '<path d="' + blob(100, 80, 44, R, 10, 0.14) + '" fill="#b5cf7a"/><path d="' + blob(92, 72, 18, R, 8, 0.3) + '" fill="#c9de95"/>';
          for (let i = 0; i < 12; i++) s += '<path d="' + blob(70 + R() * 60, 56 + R() * 40, 2.6, R, 5, 0.5) + '" fill="#5d8a2a"/>';
          s += '<path d="M118 40l-14 44" stroke="#e9a35a" stroke-width="7" stroke-linecap="round"/>';
          break;
        case 'can':
          s += '<ellipse cx="100" cy="178" rx="44" ry="9" fill="#2a1209" opacity=".14"/>' +
            '<rect x="60" y="30" width="80" height="146" rx="14" fill="' + art.color + '"/>' +
            '<rect x="60" y="30" width="80" height="14" rx="7" fill="#d9d4cc"/><rect x="60" y="164" width="80" height="12" rx="6" fill="#bfb8ad"/>' +
            '<rect x="60" y="86" width="80" height="34" fill="' + art.band + '"/><circle cx="100" cy="103" r="10" fill="' + art.color + '"/><path d="M95 103h10" stroke="' + art.band + '" stroke-width="3" stroke-linecap="round"/>' +
            '<rect x="70" y="44" width="8" height="118" rx="4" fill="#fff" opacity=".35"/>';
          break;
        case 'bottle':
          s += '<ellipse cx="100" cy="180" rx="38" ry="8" fill="#2a1209" opacity=".14"/>' +
            '<path d="M88 20h24v34c0 10 22 18 22 40v76c0 6-4 10-10 10H76c-6 0-10-4-10-10V94c0-22 22-30 22-40Z" fill="' + art.color + '"/>' +
            '<rect x="86" y="14" width="28" height="12" rx="4" fill="#2a1209"/>' +
            '<rect x="66" y="108" width="68" height="44" fill="' + art.band + '"/><path d="M78 130h44" stroke="' + art.color + '" stroke-width="5" stroke-linecap="round"/>' +
            '<rect x="74" y="94" width="7" height="72" rx="3.5" fill="#fff" opacity=".35"/>';
          break;
        default:
          s += plate();
      }
      return '<svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">' + s + '</svg>';
    }

    return { pizza: pizza, food: food, blob: blob, rng: rng };
  })();
  /* ART:END */

  // Picture for a cart line or menu item. cfg (optional) is a pizza configuration.
  function itemArt(item, cfg) {
    if (!item) return '';
    if (!isPizza(item)) return Art.food(item.art);
    const extras = (cfg && cfg.extras) || [];
    const spec = (it) => ({ sauce: it.art.sauce, cheese: it.art.cheese, toppings: it.art.toppings.concat(extras) });
    const half = cfg && cfg.half ? findItem(cfg.half) : null;
    return Art.pizza({
      seed: item.id + (half ? '|' + half.id : ''),
      halves: half ? [spec(item), spec(half)] : [spec(item)],
      stuffed: cfg && cfg.crust === 'stuffed',
      thin: cfg && cfg.crust === 'thin'
    });
  }

  /* ------------------------------------------------------------------
   * 6. Saved order: how the visitor wants it (delivery or pickup) and
   *    what's in the cart. Both are validated and repaired on every read;
   *    prices are never stored, they always come from the menu data.
   * ------------------------------------------------------------------ */
  const ORDER_KEY = 'crustclub-order';
  const CART_KEY = 'crustclub-cart';
  const LAST_ORDER_KEY = 'crustclub-last-order';

  // ZIP code, with or without +4 ("06511-1234" keeps "06511" as the zone key). Returns null when it doesn’t look like one.
  function postcodeDistrict(raw) {
    const m = String(raw || '').trim().match(/^(\d{5})(?:[-\s]?(\d{4}))?$/);
    if (!m) return null;
    return { district: m[1], postcode: m[2] ? m[1] + '-' + m[2] : m[1] };
  }
  // { ok, zone, district, postcode, message }
  function checkPostcode(raw) {
    const p = postcodeDistrict(raw);
    if (!String(raw || '').trim()) return { ok: false, message: 'Enter your ZIP code to check delivery.' };
    if (!p) return { ok: false, message: 'That doesn’t look like a ZIP code. Try something like 06511.' };
    const zone = ZONES.find((z) => z.districts.indexOf(p.district) !== -1);
    if (!zone) return { ok: false, district: p.district, postcode: p.postcode, message: 'Sorry, we don’t deliver to ' + p.district + ' yet. You can still pick up from either shop.' };
    return { ok: true, zone: zone, district: p.district, postcode: p.postcode };
  }

  const Order = {
    get() {
      const raw = read(ORDER_KEY) || {};
      const mode = raw.mode === 'pickup' ? 'pickup' : 'delivery';
      const check = raw.postcode ? checkPostcode(raw.postcode) : null;
      const zone = check && check.ok ? check.zone : null;
      const store = findStore(raw.store) ? raw.store : (zone ? zone.store : STORES[0].id);
      return { mode: mode, postcode: check && check.postcode ? check.postcode : '', zone: zone ? zone.id : null, store: store };
    },
    set(patch) {
      const next = Object.assign(this.get(), patch);
      if ('postcode' in patch) {
        const c = checkPostcode(next.postcode);
        next.zone = c.ok ? c.zone.id : null;
        if (c.ok) next.store = c.zone.store;
      }
      write(ORDER_KEY, { mode: next.mode, postcode: next.postcode, store: next.store });
      refreshAll();
      return next;
    },
    // The shop that will make the order.
    store() {
      const o = this.get();
      if (o.mode === 'delivery' && o.zone) return findStore(findZone(o.zone).store);
      return findStore(o.store);
    }
  };

  function clampQty(v) { return wholeNumber(v, 1, MAX_QTY, null); }

  // Make whatever is in storage into a valid line, or null.
  function normalizeLine(raw) {
    if (!raw || typeof raw !== 'object') return null;
    const qty = clampQty(raw.qty);
    if (!qty) return null;
    if (raw.type === 'pizza') {
      const item = findItem(raw.id);
      if (!isPizza(item)) return null;
      const size = findSize(raw.size) ? raw.size : 'regular';
      let crust = findCrust(raw.crust) ? raw.crust : 'sourdough';
      const c = findCrust(crust);
      if (c.sizes && c.sizes.indexOf(size) === -1) crust = 'sourdough';
      const halfItem = findItem(raw.half);
      const half = isPizza(halfItem) && halfItem.id !== item.id && size !== 'small' ? halfItem.id : null;
      const extras = Array.isArray(raw.extras) ? raw.extras.filter((t, i, a) => findTopping(t) && a.indexOf(t) === i).slice(0, 6) : [];
      return { type: 'pizza', id: item.id, size: size, crust: crust, half: half, extras: extras, qty: qty };
    }
    if (raw.type === 'item') {
      const item = findItem(raw.id);
      return item && !isPizza(item) ? { type: 'item', id: item.id, qty: qty } : null;
    }
    if (raw.type === 'deal') {
      const deal = findDeal(raw.id);
      if (!deal || !Array.isArray(raw.picks)) return null;
      const choices = deal.slots.filter((s) => s.choose);
      if (raw.picks.length !== choices.length) return null;
      const ok = choices.every((s, i) => { const it = findItem(raw.picks[i]); return it && it.section === s.choose; });
      return ok ? { type: 'deal', id: deal.id, picks: raw.picks.slice(), qty: qty } : null;
    }
    if (raw.type === 'bundle') {
      if (!Array.isArray(raw.items)) return null;
      const items = [];
      raw.items.forEach((b) => {
        const it = b && findItem(b.id);
        const n = wholeNumber(b && b.qty, 0, BUNDLE_MAX, 0);
        if (it && n && BUNDLE_SECTIONS.indexOf(it.section) !== -1 && !items.some((x) => x.id === it.id)) items.push({ id: it.id, qty: n });
      });
      return items.length ? { type: 'bundle', items: items, qty: qty } : null;
    }
    return null;
  }
  const lineKey = (l) => JSON.stringify(Object.assign({}, l, { qty: 0 }));

  const Cart = {
    get() {
      const raw = read(CART_KEY) || {};
      const lines = [];
      (Array.isArray(raw.lines) ? raw.lines : []).forEach((r) => {
        const l = normalizeLine(r);
        if (!l) return;
        const same = lines.find((x) => lineKey(x) === lineKey(l));
        if (same) same.qty = Math.min(MAX_QTY, same.qty + l.qty); else lines.push(l);
      });
      const promo = typeof raw.promo === 'string' && PROMOS[raw.promo] ? raw.promo : '';
      const notes = typeof raw.notes === 'string' ? raw.notes.slice(0, 200) : '';
      return { lines: lines, promo: promo, notes: notes };
    },
    save(cart) { write(CART_KEY, cart); refreshAll(); },
    lines() { return this.get().lines; },
    count() { return this.lines().reduce((n, l) => n + l.qty, 0); },
    add(line) {
      const cart = this.get();
      const l = normalizeLine(line);
      if (!l) return;
      const same = cart.lines.find((x) => lineKey(x) === lineKey(l));
      if (same) same.qty = Math.min(MAX_QTY, same.qty + l.qty); else cart.lines.push(l);
      this.save(cart);
    },
    replace(index, line) {
      const cart = this.get();
      const l = normalizeLine(line);
      if (!l || !cart.lines[index]) return;
      cart.lines.splice(index, 1);
      const same = cart.lines.find((x) => lineKey(x) === lineKey(l));
      if (same) same.qty = Math.min(MAX_QTY, same.qty + l.qty); else cart.lines.splice(index, 0, l);
      this.save(cart);
    },
    setQty(index, qty) {
      const cart = this.get();
      if (!cart.lines[index]) return;
      if (qty <= 0) cart.lines.splice(index, 1); else cart.lines[index].qty = Math.min(MAX_QTY, qty);
      this.save(cart);
    },
    set(patch) { this.save(Object.assign(this.get(), patch)); },
    clear() { const c = this.get(); this.save({ lines: [], promo: '', notes: '' }); return c; }
  };

  /* ------------------------------------------------------------------
   * 7. Prices and totals
   * ------------------------------------------------------------------ */
  function pizzaUnit(cfg) {
    const item = findItem(cfg.id);
    const half = cfg.half ? findItem(cfg.half) : null;
    const size = findSize(cfg.size);
    const crust = findCrust(cfg.crust);
    // Half-and-half is charged at the pricier of the two halves.
    const base = half ? Math.max(item.price, half.price) : item.price;
    return round2(base + size.delta + crust.price + cfg.extras.length * size.extra);
  }
  function pizzaAt(item, sizeId) { return round2(item.price + findSize(sizeId).delta); }

  // What the items in a deal would cost on their own.
  function dealWorth(deal, picks) {
    let i = 0;
    return round2(deal.slots.reduce((sum, s) => {
      if (s.item) return sum + findItem(s.item).price;
      const it = findItem(picks[i++]);
      if (!it) return sum;
      return sum + (s.choose === 'pizzas' ? pizzaAt(it, s.size) : it.price);
    }, 0));
  }

  function bundleCounts(items) {
    const c = { pizzas: 0, sides: 0, total: 0 };
    items.forEach((b) => {
      const it = findItem(b.id);
      c.total += b.qty;
      if (it.section === 'pizzas') c.pizzas += b.qty;
      else if (it.section === 'sides') c.sides += b.qty;
    });
    return c;
  }
  // { worth, tier, price, next } — bundle pizzas are Regular, classic crust.
  function bundlePrice(items) {
    const worth = round2(items.reduce((s, b) => { const it = findItem(b.id); return s + (isPizza(it) ? pizzaAt(it, 'regular') : it.price) * b.qty; }, 0));
    const c = bundleCounts(items);
    let tier = null;
    BUNDLE_TIERS.forEach((t) => { if (c.pizzas >= t.pizzas && c.sides >= t.sides) tier = t; });
    const next = BUNDLE_TIERS.find((t) => !(c.pizzas >= t.pizzas && c.sides >= t.sides)) || null;
    return { worth: worth, tier: tier, next: next, counts: c, price: tier ? round2(worth * (1 - tier.off / 100)) : worth };
  }

  // Diet tags and allergens of a configured pizza.
  function pizzaDiet(cfg) {
    const item = findItem(cfg.id);
    const half = cfg.half ? findItem(cfg.half) : null;
    let diet = item.diet.filter((d) => d !== 'gf' && (!half || half.diet.indexOf(d) !== -1 || d === 'spicy'));
    if (half && half.diet.indexOf('spicy') !== -1 && diet.indexOf('spicy') === -1) diet.push('spicy');
    const drop = (d) => { diet = diet.filter((x) => x !== d); };
    cfg.extras.forEach((id) => {
      const t = findTopping(id);
      if (t.kind === 'meat' || t.kind === 'fish') { drop('vegan'); drop('vegetarian'); }
      if (t.kind === 'dairy' || t.kind === 'honey') drop('vegan');
      if (t.spicy && diet.indexOf('spicy') === -1) diet.push('spicy');
    });
    const crust = findCrust(cfg.crust);
    if (crust.notVegan) drop('vegan');
    if (crust.glutenFree) diet.push('gf');
    return diet;
  }
  function pizzaAllergens(cfg) {
    const set = {};
    const add = (list) => (list || []).forEach((a) => { set[a] = true; });
    add(findItem(cfg.id).allergens);
    if (cfg.half) add(findItem(cfg.half).allergens);
    cfg.extras.forEach((id) => add(findTopping(id).allergens));
    const crust = findCrust(cfg.crust);
    add(crust.allergens);
    if (crust.glutenFree) delete set.gluten;
    return Object.keys(ALLERGENS).filter((a) => set[a]);
  }

  // Everything the cart, drawer and checkout show about one line.
  function lineInfo(l) {
    if (l.type === 'pizza') {
      const item = findItem(l.id);
      const half = l.half ? findItem(l.half) : null;
      const size = findSize(l.size);
      const crust = findCrust(l.crust);
      const unit = pizzaUnit(l);
      const detail = [size.label + ' ' + size.inches + '″', crust.label];
      if (l.extras.length) detail.push('Extra ' + l.extras.map((t) => findTopping(t).name.toLowerCase()).join(', '));
      return { title: half ? 'Half ' + item.name + ' / half ' + half.name : item.name, detail: detail, unit: unit, total: round2(unit * l.qty), art: itemArt(item, l), editable: true };
    }
    if (l.type === 'item') {
      const item = findItem(l.id);
      return { title: item.name, detail: [], unit: item.price, total: round2(item.price * l.qty), art: itemArt(item), editable: false };
    }
    if (l.type === 'deal') {
      const deal = findDeal(l.id);
      let i = 0;
      const detail = deal.slots.map((s) => {
        if (s.item) return findItem(s.item).name;
        const it = findItem(l.picks[i++]);
        return s.choose === 'pizzas' ? it.name + ' (' + findSize(s.size).label.toLowerCase() + ')' : it.name;
      });
      const first = findItem(l.picks[0]);
      return { title: deal.name, detail: detail, unit: deal.price, total: round2(deal.price * l.qty), art: itemArt(first), editable: true, deal: true };
    }
    const b = bundlePrice(l.items);
    const firstPizza = l.items.map((x) => findItem(x.id)).find(isPizza) || findItem(l.items[0].id);
    return {
      title: 'Your bundle' + (b.tier ? ' (' + b.tier.label + ')' : ''),
      detail: l.items.map((x) => x.qty + ' × ' + findItem(x.id).name),
      unit: b.price, total: round2(b.price * l.qty), art: itemArt(firstPizza), editable: false, deal: true
    };
  }

  // Totals for the current cart and order mode.
  function totals(cart, order) {
    cart = cart || Cart.get();
    order = order || Order.get();
    let subtotal = 0, menuSubtotal = 0;
    cart.lines.forEach((l) => {
      const t = lineInfo(l).total;
      subtotal += t;
      if (l.type === 'pizza' || l.type === 'item') menuSubtotal += t;
    });
    subtotal = round2(subtotal);
    const promo = cart.promo ? PROMOS[cart.promo] : null;
    let discount = 0, promoNote = '';
    if (promo && promo.type === 'percent') {
      discount = round2(menuSubtotal * promo.value / 100);
      if (!discount) promoNote = 'Applies to menu items, not deals or bundles.';
    }
    if (promo && promo.type === 'amount') {
      if (subtotal >= promo.min) discount = Math.min(promo.value, subtotal);
      else promoNote = 'Add ' + fmt(promo.min - subtotal) + ' more to use this code.';
    }
    const zone = order.mode === 'delivery' && order.zone ? findZone(order.zone) : null;
    let delivery = 0, needsPostcode = false, short = 0, freeIn = 0;
    if (order.mode === 'delivery') {
      if (!zone) needsPostcode = true;
      else {
        const paid = subtotal - discount;
        const free = (promo && promo.type === 'delivery') || paid >= FREE_DELIVERY_OVER;
        delivery = free ? 0 : zone.fee;
        if (!free) freeIn = round2(FREE_DELIVERY_OVER - paid);
        short = round2(Math.max(0, zone.min - subtotal));
      }
    }
    return {
      subtotal: subtotal, discount: discount, promo: promo, promoCode: cart.promo, promoNote: promoNote,
      delivery: delivery, zone: zone, needsPostcode: needsPostcode, short: short, freeIn: freeIn,
      total: round2(subtotal - discount + delivery), count: cart.lines.reduce((n, l) => n + l.qty, 0),
      blocked: !cart.lines.length || needsPostcode || short > 0
    };
  }

  /* ------------------------------------------------------------------
   * 8. Header, mobile menu, scroll reveal, open-now badges and hours
   * ------------------------------------------------------------------ */
  const listeners = [];
  function onRefresh(fn) { listeners.push(fn); }
  function refreshAll() { listeners.forEach((fn) => fn()); }

  const menuBtn = $('#menu-toggle');
  const mobileMenu = $('#mobile-menu');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.hidden = !open;
    $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
    $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
  }
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });
  }

  const header = $('#site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('shadow-[0_10px_30px_-18px_rgb(42_18_9/.5)]', window.scrollY > 8);
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

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // <span data-store-status="ancoats"></span> → "● Open until 10:00 PM"
  function statusBadge(store) {
    const s = storeStatus(store);
    return '<span class="open-dot ' + (s.open ? (s.closingSoon ? 'bg-cheese' : 'bg-[#2fa35a]') : 'bg-tomato') + '" aria-hidden="true"></span><span>' + escapeHtml(s.text) + '</span>';
  }
  function renderStatuses() {
    $$('[data-store-status]').forEach((el) => {
      const store = findStore(el.getAttribute('data-store-status'));
      if (store) el.innerHTML = statusBadge(store);
    });
    $$('[data-today-hours]').forEach((el) => {
      const store = findStore(el.getAttribute('data-today-hours'));
      if (store) el.textContent = hoursLabel(store.hours[shopNow().day]);
    });
    // <tbody data-hours="ancoats"></tbody> → a row per day, Monday first, today highlighted.
    $$('[data-hours]').forEach((el) => {
      const store = findStore(el.getAttribute('data-hours'));
      if (!store) return;
      const today = shopNow().day;
      el.innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => {
        const isToday = d === today;
        return '<tr class="' + (isToday ? 'bg-cheese-soft font-bold' : '') + '">' +
          '<th scope="row" class="rounded-l-xl py-2 pl-3 pr-4 text-left font-semibold">' + DAY_NAMES[d] + (isToday ? ' <span class="ml-1 rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-mozz">Today</span>' : '') + '</th>' +
          '<td class="whitespace-nowrap rounded-r-xl py-2 pr-3 text-right tabular-nums ' + (store.hours[d] ? '' : 'text-cocoa') + '">' + hoursLabel(store.hours[d]) + '</td></tr>';
      }).join('');
    });
  }

  function orderSummaryText() {
    const o = Order.get();
    if (o.mode === 'pickup') return 'Pickup · ' + findStore(o.store).name;
    return o.zone ? 'Delivery · ' + o.postcode : 'Delivery or pickup?';
  }

  /* ------------------------------------------------------------------
   * 9. Delivery checker: <div data-zone-checker></div> anywhere becomes a
   *    Delivery / Pickup switch with a ZIP code check and shop picker.
   *    data-variant="compact" makes the small version used in the cart.
   * ------------------------------------------------------------------ */
  let zcCount = 0;
  const ICON_SCOOTER = '<svg viewBox="0 0 24 24" class="size-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="6" cy="17" r="2.5"/><circle cx="18" cy="17" r="2.5"/><path d="M8.5 17h7M15 6h2.5l2.5 8.5M6 14.5V11h6l3 6"/><path d="M4 8h5"/></svg>';
  const ICON_BAG = '<svg viewBox="0 0 24 24" class="size-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6Z"/><path d="M9 11V7a3 3 0 0 1 6 0v4"/></svg>';

  function zoneResult(check) {
    if (!check) return '';
    if (!check.ok) return '<span class="flex items-start gap-2 font-semibold text-tomato-deep"><svg viewBox="0 0 20 20" class="mt-0.5 size-4 shrink-0" fill="currentColor" aria-hidden="true"><path d="M10 1.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4Zm0 4.2a1 1 0 0 0-1 1v3.6a1 1 0 1 0 2 0V7a1 1 0 0 0-1-1Zm0 7.2a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2Z"/></svg><span>' + escapeHtml(check.message) + '</span></span>';
    const z = check.zone;
    const store = findStore(z.store);
    const st = storeStatus(store);
    return '<span class="flex items-start gap-2"><svg viewBox="0 0 20 20" class="mt-0.5 size-4 shrink-0 text-basil" fill="currentColor" aria-hidden="true"><path d="M10 1.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4Zm3.7 5.3a1 1 0 0 0-1.4.1l-3.2 3.9-1.5-1.5a1 1 0 1 0-1.4 1.4l2.3 2.3a1 1 0 0 0 1.5-.1l3.9-4.7a1 1 0 0 0-.2-1.4Z"/></svg>' +
      '<span><strong class="font-extrabold">We deliver to ' + escapeHtml(check.district) + '</strong> from ' + escapeHtml(store.name) + '. ' +
      fmt(z.fee) + ' delivery (free over ' + fmt(FREE_DELIVERY_OVER) + '), ' + fmt(z.min) + ' minimum, about ' + z.eta[0] + '–' + z.eta[1] + ' min.' +
      (st.open ? '' : ' <span class="font-semibold text-tomato-deep">' + escapeHtml(store.name) + ' is closed right now (' + escapeHtml(st.text.charAt(0).toLowerCase() + st.text.slice(1)) + '), so you can order ahead.</span>') + '</span></span>';
  }

  function zoneCheckerHtml(compact) {
    const n = ++zcCount;
    const storeOptions = STORES.map((s) =>
      '<label class="option flex-col gap-1 ' + (compact ? 'p-3' : '') + '"><input type="radio" class="sr-only" name="zc-store-' + n + '" value="' + s.id + '">' +
        '<span class="flex items-center justify-between gap-2"><span class="font-extrabold">' + escapeHtml(s.name) + '</span>' +
        '<svg viewBox="0 0 20 20" class="zc-tick size-5 text-ink" fill="currentColor" aria-hidden="true"><path d="M10 1.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4Zm3.7 5.3a1 1 0 0 0-1.4.1l-3.2 3.9-1.5-1.5a1 1 0 1 0-1.4 1.4l2.3 2.3a1 1 0 0 0 1.5-.1l3.9-4.7a1 1 0 0 0-.2-1.4Z"/></svg></span>' +
        (compact ? '' : '<span class="text-sm text-cocoa">' + escapeHtml(s.address.split(',')[0]) + '</span>') +
        '<span class="flex items-center gap-2 text-xs font-semibold" data-store-status="' + s.id + '"></span></label>').join('');
    return '<fieldset><legend class="sr-only">Delivery or pickup</legend><div class="segmented w-full">' +
        '<label><input type="radio" class="sr-only" name="zc-mode-' + n + '" value="delivery">' + ICON_SCOOTER + 'Delivery</label>' +
        '<label><input type="radio" class="sr-only" name="zc-mode-' + n + '" value="pickup">' + ICON_BAG + 'Pickup</label>' +
      '</div></fieldset>' +
      '<div data-zc-panel="delivery" class="' + (compact ? 'mt-3' : 'mt-5') + '">' +
        '<label for="zc-postcode-' + n + '" class="' + (compact ? 'sr-only' : 'field-label') + '">Your ZIP code</label>' +
        '<div class="flex gap-2"><input id="zc-postcode-' + n + '" type="text" inputmode="numeric" autocomplete="postal-code" autocapitalize="characters" spellcheck="false" maxlength="10" placeholder="ZIP code, e.g. 06511" class="field min-w-0 uppercase placeholder:normal-case' + (compact ? ' py-2.5' : '') + '">' +
        '<button type="button" data-zc-check class="btn-ink shrink-0 ' + (compact ? 'px-4 py-2.5' : '') + '">Check</button></div>' +
        '<p data-zc-result aria-live="polite" class="mt-3 text-sm leading-relaxed empty:hidden"></p>' +
      '</div>' +
      '<div data-zc-panel="pickup" class="' + (compact ? 'mt-3' : 'mt-5') + '"><fieldset><legend class="' + (compact ? 'sr-only' : 'field-label') + '">Pick up from</legend>' +
        '<div class="grid gap-2 grid-cols-2">' + storeOptions + '</div></fieldset>' +
        (compact ? '' : '<p class="mt-3 text-sm text-cocoa">Pickup orders are usually ready in about 20 minutes.</p>') +
      '</div>';
  }

  function initZoneChecker(root) {
    const compact = root.getAttribute('data-variant') === 'compact';
    root.innerHTML = zoneCheckerHtml(compact);
    const input = $('input[type="text"]', root);
    const result = $('[data-zc-result]', root);
    function sync() {
      const o = Order.get();
      $$('input[name^="zc-mode"]', root).forEach((r) => { r.checked = r.value === o.mode; });
      $$('input[name^="zc-store"]', root).forEach((r) => { r.checked = r.value === o.store; });
      $$('[data-zc-panel]', root).forEach((p) => { p.hidden = p.getAttribute('data-zc-panel') !== o.mode; });
      $$('.zc-tick', root).forEach((t) => { t.style.visibility = t.closest('label').querySelector('input').checked ? 'visible' : 'hidden'; });
      if (document.activeElement !== input && o.postcode && !input.value) input.value = o.postcode;
      if (o.postcode && !result.innerHTML && o.zone) result.innerHTML = zoneResult(checkPostcode(o.postcode));
    }
    function check() {
      const c = checkPostcode(input.value);
      result.innerHTML = zoneResult(c);
      input.setAttribute('aria-invalid', c.ok ? 'false' : 'true');
      if (c.postcode) input.value = c.postcode;
      Order.set({ postcode: c.ok ? c.postcode : '' });
      root.dispatchEvent(new CustomEvent('zonechange', { bubbles: true, detail: c }));
      return c;
    }
    root.addEventListener('change', (e) => {
      if (e.target.name && e.target.name.indexOf('zc-mode') === 0) Order.set({ mode: e.target.value });
      if (e.target.name && e.target.name.indexOf('zc-store') === 0) Order.set({ store: e.target.value });
    });
    $('[data-zc-check]', root).addEventListener('click', check);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); check(); } });
    root.zoneCheck = check;
    onRefresh(() => { sync(); renderStatuses(); });
    sync();
  }

  /* ------------------------------------------------------------------
   * 10. Item customizer and deal dialogs. One <dialog> is created on
   *     every page, so items can be added or edited from anywhere.
   * ------------------------------------------------------------------ */
  const ICON_CLOSE = '<svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>';
  const sheet = document.createElement('dialog');
  sheet.className = 'sheet';
  sheet.setAttribute('aria-labelledby', 'sheet-title');
  document.body.appendChild(sheet);
  sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
  sheet.addEventListener('close', () => { document.body.classList.remove('drawer-open'); if (sheet.onDone) { const fn = sheet.onDone; sheet.onDone = null; fn(); } });

  function openSheet(html) {
    sheet.innerHTML = html;
    if (!sheet.open) sheet.showModal();
    document.body.classList.add('drawer-open');
    const first = $('[data-autofocus]', sheet) || $('button, input', sheet);
    if (first) first.focus();
  }

  function stepperHtml(name, qty, label) {
    return '<div class="stepper" role="group" aria-label="Quantity">' +
      '<button type="button" data-step="-1" aria-label="One fewer ' + escapeHtml(label) + '"' + (qty <= 1 ? ' disabled' : '') + '>−</button>' +
      '<output name="' + name + '" class="w-8 text-center font-extrabold tabular-nums" aria-live="polite">' + qty + '</output>' +
      '<button type="button" data-step="1" aria-label="One more ' + escapeHtml(label) + '"' + (qty >= MAX_QTY ? ' disabled' : '') + '>+</button></div>';
  }
  function bindStepper(root, get, set) {
    $$('[data-step]', root).forEach((b) => b.addEventListener('click', () => {
      const q = Math.min(MAX_QTY, Math.max(1, get() + +b.getAttribute('data-step')));
      set(q);
      $('output', b.parentNode).textContent = q;
      $('[data-step="-1"]', b.parentNode).disabled = q <= 1;
      $('[data-step="1"]', b.parentNode).disabled = q >= MAX_QTY;
    }));
  }
  function allergenText(list, gfBase) {
    return '<span class="font-bold">Allergens:</span> ' + (list.length ? list.map((a) => ALLERGENS[a]).join(', ') : 'none of the major food allergens') + '.' +
      (gfBase ? ' Gluten-free bases are made in a kitchen that handles flour.' : '');
  }

  const TOPPING_GROUPS = [
    { label: 'Cheese', kinds: ['dairy'], ids: ['vegan-mozz'] },
    { label: 'Meat & fish', kinds: ['meat', 'fish'] },
    { label: 'Veg & finishes', kinds: ['veg', 'honey'], not: ['vegan-mozz'] }
  ];

  // Open the pizza customizer. editIndex: cart line being edited, or undefined to add.
  function openCustomiser(id, editIndex, preset) {
    const item = findItem(id);
    if (!isPizza(item)) return;
    const cfg = Object.assign({ type: 'pizza', id: item.id, size: 'regular', crust: 'sourdough', half: null, extras: [], qty: 1 }, preset || {});
    cfg.extras = cfg.extras.slice();
    const editing = typeof editIndex === 'number';
    const others = itemsIn('pizzas').filter((p) => p.id !== item.id);
    const radio = (name, value, inner, extra) => '<label class="option ' + (extra || '') + '"><input type="radio" class="sr-only" name="' + name + '" value="' + value + '">' + inner + '</label>';

    const sizes = SIZES.map((s) => radio('size', s.id,
      '<span class="flex w-full flex-col items-center gap-1 text-center"><svg viewBox="0 0 40 40" class="text-crust" style="width:' + (16 + s.inches * 1.4) + 'px" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="currentColor"/><circle cx="20" cy="20" r="14" fill="#d4381c"/><circle cx="15" cy="16" r="3.4" fill="#fff4d8"/><circle cx="25" cy="23" r="3.4" fill="#fff4d8"/></svg>' +
      '<span class="font-extrabold">' + s.label + '</span><span class="text-xs text-cocoa">' + s.inches + '″</span><span class="text-sm font-bold tabular-nums" data-size-price="' + s.id + '"></span></span>', 'justify-center p-3')).join('');
    const crusts = CRUSTS.map((c) => radio('crust', c.id,
      '<span class="flex w-full items-start justify-between gap-3"><span><span class="block font-bold">' + escapeHtml(c.label) + '</span><span class="block text-xs text-cocoa">' + escapeHtml(c.note) + '</span></span>' +
      '<span class="shrink-0 text-sm font-bold tabular-nums">' + (c.price ? '+' + fmt(c.price) : 'Free') + '</span></span>', 'p-3')).join('');
    const extras = TOPPING_GROUPS.map((grp) => {
      const list = TOPPINGS.filter((t) => (grp.kinds.indexOf(t.kind) !== -1 || (grp.ids || []).indexOf(t.id) !== -1) && (grp.not || []).indexOf(t.id) === -1 && !(grp.label !== 'Cheese' && t.id === 'vegan-mozz'));
      return '<p class="mt-4 text-xs font-extrabold uppercase tracking-[0.14em] text-cocoa">' + grp.label + '</p><div class="mt-2 flex flex-wrap gap-2">' +
        list.map((t) => '<label class="chip py-1.5 pl-3 pr-3"><input type="checkbox" class="sr-only" name="extra" value="' + t.id + '">' + escapeHtml(t.name) + '<span class="text-xs font-semibold opacity-80" data-extra-price></span></label>').join('') + '</div>';
    }).join('');

    openSheet(
      '<button type="button" data-sheet-close class="absolute right-4 top-4 z-20 grid size-11 place-items-center rounded-full bg-paper text-ink shadow-md ring-1 ring-ink/10 hover:bg-cheese" aria-label="Close">' + ICON_CLOSE + '</button>' +
      '<form method="dialog" class="grid min-h-0 flex-1 overflow-y-auto overscroll-contain md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]" data-customiser>' +
        '<div class="flex flex-col items-center bg-cheese-soft px-6 pb-6 pt-10 md:sticky md:top-0 md:h-full md:max-h-[calc(100dvh-2rem)] md:justify-center md:p-8">' +
          '<div data-sheet-art class="art aspect-square w-44 sm:w-56 md:w-full md:max-w-xs"></div>' +
          '<div data-sheet-tags class="mt-5 flex min-h-6 flex-wrap justify-center gap-1.5"></div>' +
          '<p data-sheet-allergens class="mt-3 max-w-xs text-center text-sm leading-relaxed text-cocoa"></p>' +
        '</div>' +
        '<div class="flex min-w-0 flex-col">' +
          '<div class="px-6 pt-6 sm:px-8 md:pt-10">' +
            '<h2 id="sheet-title" class="h-display pr-12 text-3xl sm:text-4xl">' + escapeHtml(item.name) + '</h2>' +
            '<p class="mt-2 leading-relaxed text-cocoa">' + escapeHtml(item.desc) + '</p>' +
            '<fieldset class="mt-6"><legend class="text-sm font-extrabold">Size</legend><div class="mt-2 grid grid-cols-3 gap-2">' + sizes + '</div></fieldset>' +
            '<fieldset class="mt-6"><legend class="text-sm font-extrabold">Crust</legend><div class="mt-2 grid gap-2 sm:grid-cols-2">' + crusts + '</div></fieldset>' +
            '<p data-sheet-note role="status" class="mt-3 rounded-2xl bg-tomato-soft px-4 py-3 text-sm font-semibold text-tomato-deep empty:hidden"></p>' +
            '<fieldset class="mt-6 rounded-3xl bg-flour p-4"><legend class="sr-only">Half and half</legend>' +
              '<label class="flex cursor-pointer items-center justify-between gap-4"><span><span class="block font-extrabold">Make it half &amp; half</span><span class="block text-sm text-cocoa" data-half-hint>Two pizzas on one base, charged at the pricier half.</span></span>' +
                '<input type="checkbox" name="half-on" class="peer sr-only"><span class="relative h-7 w-12 shrink-0 rounded-full bg-ink/20 transition after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-paper after:shadow after:transition peer-checked:bg-basil peer-checked:after:translate-x-5 peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink peer-disabled:opacity-40" aria-hidden="true"></span></label>' +
              '<div data-half-pick class="mt-3"><label for="half-select" class="field-label">Other half</label><select id="half-select" name="half" class="field">' +
                others.map((p) => '<option value="' + p.id + '">' + escapeHtml(p.name) + ' (' + fmt(p.price) + ')</option>').join('') + '</select></div>' +
            '</fieldset>' +
            '<fieldset class="mt-6 pb-6"><legend class="text-sm font-extrabold">Extra toppings <span class="font-semibold text-cocoa">(up to 6, added to the whole pizza)</span></legend>' + extras + '</fieldset>' +
          '</div>' +
          '<div class="sticky bottom-0 mt-auto flex items-center gap-3 border-t border-ink/10 bg-mozz/95 px-6 py-4 backdrop-blur sm:px-8">' +
            stepperHtml('qty', cfg.qty, item.name) +
            '<button type="submit" class="btn-primary flex-1 justify-between px-6 py-3.5" data-autofocus><span>' + (editing ? 'Update item' : 'Add to order') + '</span><span data-sheet-price class="tabular-nums"></span></button>' +
          '</div>' +
        '</div>' +
      '</form>');

    const form = $('[data-customiser]', sheet);
    const note = $('[data-sheet-note]', sheet);
    const halfOn = form.elements['half-on'];
    const halfSelect = form.elements.half;
    if (cfg.half) halfSelect.value = cfg.half;

    function paint() {
      $$('input[name="size"]', form).forEach((r) => { r.checked = r.value === cfg.size; });
      $$('input[name="crust"]', form).forEach((r) => { r.checked = r.value === cfg.crust; });
      $$('input[name="extra"]', form).forEach((c) => { c.checked = cfg.extras.indexOf(c.value) !== -1; c.disabled = !c.checked && cfg.extras.length >= 6; });
      const size = findSize(cfg.size);
      $$('[data-extra-price]', form).forEach((s) => { s.textContent = '+' + fmt(size.extra); });
      SIZES.forEach((s) => { $('[data-size-price="' + s.id + '"]', form).textContent = fmt(pizzaUnit(Object.assign({}, cfg, { size: s.id, crust: (findCrust(cfg.crust).sizes || [s.id]).indexOf(s.id) === -1 ? 'sourdough' : cfg.crust, half: s.id === 'small' ? null : cfg.half }))); });
      halfOn.checked = !!cfg.half;
      halfOn.disabled = cfg.size === 'small';
      $('[data-half-hint]', form).textContent = cfg.size === 'small' ? 'Available on Regular and Large pizzas.' : 'Two pizzas on one base, charged at the pricier half.';
      $('[data-half-pick]', form).hidden = !cfg.half;
      const unit = pizzaUnit(cfg);
      $('[data-sheet-price]', form).textContent = fmt(unit * cfg.qty);
      $('[data-sheet-art]', sheet).innerHTML = itemArt(item, cfg);
      $('[data-sheet-tags]', sheet).innerHTML = dietTags(pizzaDiet(cfg));
      $('[data-sheet-allergens]', sheet).innerHTML = allergenText(pizzaAllergens(cfg), cfg.crust === 'gf');
    }

    form.addEventListener('change', (e) => {
      const t = e.target;
      note.textContent = '';
      if (t.name === 'size') {
        cfg.size = t.value;
        const crust = findCrust(cfg.crust);
        if (crust.sizes && crust.sizes.indexOf(cfg.size) === -1) {
          cfg.crust = 'sourdough';
          note.textContent = crust.label + ' isn’t available in ' + findSize(cfg.size).label + ', so we switched you to classic sourdough.';
        }
        if (cfg.size === 'small' && cfg.half) { cfg.half = null; note.textContent = 'Half & half is only available on Regular and Large pizzas.'; }
      }
      if (t.name === 'crust') {
        cfg.crust = t.value;
        const crust = findCrust(cfg.crust);
        if (crust.sizes && crust.sizes.indexOf(cfg.size) === -1) {
          cfg.size = crust.sizes[0];
          note.textContent = crust.label + ' comes in ' + crust.sizes.map((s) => findSize(s).label + ' ' + findSize(s).inches + '″').join(' or ') + ' only, so we switched the size.';
          if (cfg.size === 'small' && cfg.half) cfg.half = null;
        }
      }
      if (t.name === 'half-on') cfg.half = t.checked ? halfSelect.value : null;
      if (t.name === 'half') cfg.half = t.value;
      if (t.name === 'extra') cfg.extras = $$('input[name="extra"]:checked', form).map((c) => c.value);
      paint();
    });
    bindStepper(form, () => cfg.qty, (q) => { cfg.qty = q; paint(); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = cfg.half ? 'Half ' + item.name + ' / half ' + findItem(cfg.half).name : item.name;
      if (editing) { Cart.replace(editIndex, cfg); toast('Updated <strong class="font-bold">' + escapeHtml(name) + '</strong>.'); sheet.onDone = openDrawer; }
      else { Cart.add(cfg); added(cfg.qty + ' × ' + name); }
      sheet.close();
    });
    $('[data-sheet-close]', sheet).addEventListener('click', () => sheet.close());
    paint();
  }

  // Deal picker: one select per choice slot.
  function openDeal(id, editIndex, picks) {
    const deal = findDeal(id);
    if (!deal) return;
    const editing = typeof editIndex === 'number';
    let qty = 1;
    const choiceSlots = deal.slots.filter((s) => s.choose);
    let defaults = picks && picks.length === choiceSlots.length ? picks.slice() : choiceSlots.map((s, i) => {
      const opts = itemsIn(s.choose);
      return (opts[i % opts.length] || opts[0]).id;
    });
    if (editing) qty = Cart.lines()[editIndex] ? Cart.lines()[editIndex].qty : 1;
    let ci = 0;
    const rows = deal.slots.map((s) => {
      if (s.item) return '<li class="flex items-center gap-3 rounded-2xl bg-flour px-4 py-3 font-bold"><svg viewBox="0 0 20 20" class="size-5 shrink-0 text-basil" fill="currentColor" aria-hidden="true"><path d="M10 1.8a8.2 8.2 0 1 1 0 16.4 8.2 8.2 0 0 1 0-16.4Zm3.7 5.3a1 1 0 0 0-1.4.1l-3.2 3.9-1.5-1.5a1 1 0 1 0-1.4 1.4l2.3 2.3a1 1 0 0 0 1.5-.1l3.9-4.7a1 1 0 0 0-.2-1.4Z"/></svg>' + escapeHtml(findItem(s.item).name) + '<span class="ml-auto text-xs font-semibold text-cocoa">Included</span></li>';
      const i = ci++;
      const opts = itemsIn(s.choose);
      return '<li><label for="deal-slot-' + i + '" class="field-label">' + escapeHtml(s.label) + (s.size ? ' <span class="font-semibold text-cocoa">(' + findSize(s.size).label + ' ' + findSize(s.size).inches + '″)</span>' : '') + '</label>' +
        '<select id="deal-slot-' + i + '" class="field" data-slot="' + i + '">' + opts.map((o) => '<option value="' + o.id + '"' + (o.id === defaults[i] ? ' selected' : '') + '>' + escapeHtml(o.name) + (o.diet.indexOf('vegan') !== -1 ? ' (vegan)' : o.diet.indexOf('vegetarian') !== -1 ? ' (veggie)' : '') + '</option>').join('') + '</select></li>';
    }).join('');
    openSheet(
      '<button type="button" data-sheet-close class="absolute right-4 top-4 z-20 grid size-11 place-items-center rounded-full bg-paper text-ink shadow-md ring-1 ring-ink/10 hover:bg-cheese" aria-label="Close">' + ICON_CLOSE + '</button>' +
      '<form method="dialog" class="grid min-h-0 flex-1 overflow-y-auto overscroll-contain md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]" data-deal-form>' +
        '<div class="on-red flex flex-col items-center justify-center bg-tomato px-6 pb-8 pt-10 text-mozz md:sticky md:top-0 md:h-full md:max-h-[calc(100dvh-2rem)]">' +
          '<div data-deal-art class="art aspect-square w-40 sm:w-52 md:w-full md:max-w-[17rem]"></div>' +
          '<p class="mt-5 text-center text-sm font-bold uppercase tracking-[0.14em]">' + escapeHtml(deal.when) + '</p>' +
        '</div>' +
        '<div class="flex min-w-0 flex-col">' +
          '<div class="px-6 pt-6 sm:px-8 md:pt-10">' +
            '<p class="eyebrow">Deal</p><h2 id="sheet-title" class="h-display mt-1 pr-12 text-3xl sm:text-4xl">' + escapeHtml(deal.name) + '</h2>' +
            '<p class="mt-2 text-cocoa">' + escapeHtml(deal.tagline) + '. Deal pizzas come on our classic sourdough; extras aren’t included.</p>' +
            '<ul class="mt-6 grid gap-4 pb-6">' + rows + '</ul>' +
          '</div>' +
          '<div class="sticky bottom-0 mt-auto border-t border-ink/10 bg-mozz/95 px-6 py-4 backdrop-blur sm:px-8">' +
            '<p class="mb-3 text-sm text-cocoa" data-deal-save aria-live="polite"></p>' +
            '<div class="flex items-center gap-3">' + stepperHtml('qty', qty, deal.name) +
            '<button type="submit" class="btn-primary flex-1 justify-between px-6 py-3.5" data-autofocus><span>' + (editing ? 'Update deal' : 'Add deal') + '</span><span data-sheet-price class="tabular-nums"></span></button></div>' +
          '</div>' +
        '</div>' +
      '</form>');
    const form = $('[data-deal-form]', sheet);
    const current = () => $$('[data-slot]', form).map((s) => s.value);
    function paint() {
      const p = current();
      const worth = dealWorth(deal, p);
      $('[data-sheet-price]', form).textContent = fmt(deal.price * qty);
      $('[data-deal-save]', form).innerHTML = worth > deal.price ? 'Worth ' + fmt(worth) + ' on its own. <strong class="font-extrabold text-basil">You save ' + fmt(worth - deal.price) + '</strong>' + (qty > 1 ? ' on each.' : '.') : '';
      $('[data-deal-art]', sheet).innerHTML = itemArt(findItem(p[0]));
    }
    form.addEventListener('change', paint);
    bindStepper(form, () => qty, (q) => { qty = q; paint(); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const line = { type: 'deal', id: deal.id, picks: current(), qty: qty };
      if (editing) { Cart.replace(editIndex, line); toast('Updated <strong class="font-bold">' + escapeHtml(deal.name) + '</strong>.'); sheet.onDone = openDrawer; }
      else { Cart.add(line); added(qty + ' × ' + deal.name); }
      sheet.close();
    });
    $('[data-sheet-close]', sheet).addEventListener('click', () => sheet.close());
    paint();
  }

  /* ------------------------------------------------------------------
   * 11. Cart drawer, toast and mobile order bar
   * ------------------------------------------------------------------ */
  const drawer = $('#cart-drawer');
  const overlay = $('#cart-overlay');
  let lastFocus = null;
  let promoError = '';

  function focusables(root) {
    return $$('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', root)
      .filter((el) => el.offsetParent !== null);
  }
  function openDrawer() {
    if (!drawer) return;
    hideToast();
    if (drawer.hidden) lastFocus = document.activeElement;
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
  function closeDrawer(keepFocus) {
    if (!drawer || drawer.hidden) return;
    drawer.classList.add('translate-x-full');
    overlay.classList.add('opacity-0');
    document.body.classList.remove('drawer-open');
    $$('[data-cart-open]').forEach((b) => b.setAttribute('aria-expanded', 'false'));
    setTimeout(() => { drawer.hidden = true; overlay.hidden = true; }, reduceMotion ? 0 : 320);
    if (!keepFocus && lastFocus && document.contains(lastFocus)) lastFocus.focus();
  }

  // Re-render a region but keep focus on "the same" control (matched by data-fk).
  function rerender(el, html) {
    const active = document.activeElement;
    const key = active && el.contains(active) ? active.getAttribute('data-fk') : null;
    el.innerHTML = html;
    if (key) {
      const again = $('[data-fk="' + key + '"]', el);
      if (again && !again.disabled) again.focus();
      else if (drawer && !drawer.hidden) $('[data-drawer-close]', drawer).focus();
    }
  }

  function lineHtml(l, i, compact) {
    const info = lineInfo(l);
    return '<li class="flex gap-4 py-4">' +
      '<div class="art size-16 shrink-0 rounded-2xl bg-flour p-1.5 sm:size-20">' + info.art + '</div>' +
      '<div class="flex min-w-0 flex-1 flex-col">' +
        '<div class="flex justify-between gap-3"><p class="font-extrabold leading-snug">' + (compact ? '<span class="tabular-nums">' + l.qty + ' × </span>' : '') + escapeHtml(info.title) + '</p><p class="font-bold tabular-nums">' + fmt(info.total) + '</p></div>' +
        (info.detail.length ? '<p class="mt-1 text-[13px] leading-snug text-cocoa">' + info.detail.map(escapeHtml).join(' · ') + '</p>' : '') +
        (compact ? '' :
        '<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">' +
          '<div class="stepper h-9"><button type="button" class="!h-9 !w-9" data-qty-step="-1" data-index="' + i + '" data-fk="dec' + i + '" aria-label="One fewer ' + escapeHtml(info.title) + '">−</button>' +
          '<span class="w-6 text-center text-sm font-extrabold tabular-nums">' + l.qty + '</span>' +
          '<button type="button" class="!h-9 !w-9" data-qty-step="1" data-index="' + i + '" data-fk="inc' + i + '" aria-label="One more ' + escapeHtml(info.title) + '"' + (l.qty >= MAX_QTY ? ' disabled' : '') + '>+</button></div>' +
          (info.editable ? '<button type="button" data-edit="' + i + '" class="text-sm font-bold underline decoration-2 underline-offset-4 hover:text-tomato-deep">Edit<span class="sr-only"> ' + escapeHtml(info.title) + '</span></button>' : '') +
          '<button type="button" data-remove="' + i + '" class="text-sm font-bold text-cocoa underline decoration-2 underline-offset-4 hover:text-tomato-deep">Remove<span class="sr-only"> ' + escapeHtml(info.title) + '</span></button>' +
        '</div>') +
      '</div></li>';
  }

  function totalsHtml(t, order) {
    const row = (label, value, cls) => '<div class="flex justify-between gap-4 ' + (cls || '') + '"><dt>' + label + '</dt><dd class="tabular-nums">' + value + '</dd></div>';
    let delivery;
    if (order.mode === 'pickup') delivery = row('Pickup from ' + escapeHtml(findStore(order.store).name), 'Free');
    else if (t.needsPostcode) delivery = row('Delivery', '<span class="text-cocoa">Add ZIP code</span>');
    else delivery = row('Delivery to ' + escapeHtml(order.postcode), t.delivery ? fmt(t.delivery) : '<span class="font-bold text-basil">Free</span>');
    return '<dl class="space-y-1.5 text-[15px]">' + row('Subtotal', fmt(t.subtotal)) +
      (t.discount ? row('Promo ' + escapeHtml(t.promoCode), '−' + fmt(t.discount), 'font-semibold text-basil') : '') +
      delivery + row('Total', fmt(t.total), 'mt-2 border-t-2 border-dashed border-ink/15 pt-3 text-lg font-extrabold') + '</dl>';
  }

  // Warnings and free-delivery progress shown above the checkout button.
  function deliveryNotice(t, order) {
    if (!t.count) return '';
    if (order.mode === 'delivery' && t.needsPostcode) return '<p class="rounded-2xl bg-cheese-soft px-4 py-3 text-sm font-semibold">Check your ZIP code to see delivery fees, or switch to pickup.</p>';
    if (t.short > 0) return '<p class="rounded-2xl bg-tomato-soft px-4 py-3 text-sm font-semibold text-tomato-deep">The minimum for delivery to ' + escapeHtml(t.zone.name) + ' is ' + fmt(t.zone.min) + '. Add ' + fmt(t.short) + ' more, or switch to pickup.</p>';
    if (order.mode === 'delivery' && t.freeIn > 0) {
      const pct = Math.max(4, Math.min(100, (1 - t.freeIn / FREE_DELIVERY_OVER) * 100));
      return '<div><p class="text-sm font-semibold">You’re <span class="tabular-nums">' + fmt(t.freeIn) + '</span> away from free delivery.</p><div class="mt-2 h-2.5 overflow-hidden rounded-full bg-ink/10"><div class="h-full rounded-full bg-basil" style="width:' + pct.toFixed(0) + '%"></div></div></div>';
    }
    if (order.mode === 'delivery' && t.delivery === 0) return '<p class="text-sm font-bold text-basil">Delivery is on us.</p>';
    return '';
  }

  function promoHtml(cart, t, prefix) {
    prefix = prefix || 'promo';
    if (cart.promo) {
      return '<div class="flex items-center justify-between gap-3 rounded-2xl bg-basil-soft px-4 py-3 text-sm"><p><strong class="font-extrabold">' + escapeHtml(cart.promo) + '</strong> · ' + escapeHtml(PROMOS[cart.promo].label) +
        (t.promoNote ? '<span class="mt-0.5 block text-cocoa">' + escapeHtml(t.promoNote) + '</span>' : '') + '</p>' +
        '<button type="button" data-promo-remove data-fk="promo-remove" class="shrink-0 font-bold underline decoration-2 underline-offset-4">Remove<span class="sr-only"> promo code</span></button></div>';
    }
    return '<div data-promo-form class="flex gap-2"><label for="' + prefix + '-input" class="sr-only">Promo code</label>' +
      '<input id="' + prefix + '-input" name="code" data-fk="promo-input" autocomplete="off" autocapitalize="characters" spellcheck="false" placeholder="Promo code" class="field min-w-0 py-2.5 uppercase placeholder:normal-case"' + (promoError ? ' aria-invalid="true" aria-describedby="' + prefix + '-error"' : '') + '>' +
      '<button type="button" data-promo-apply data-fk="promo-apply" class="btn-ghost shrink-0 px-5 py-2.5">Apply</button></div>' +
      (promoError ? '<p id="' + prefix + '-error" class="field-error">' + escapeHtml(promoError) + '</p>' : '<p class="mt-2 text-xs text-cocoa">Codes running now: SLICE10, FREEDELIVERY, FIRSTSLICE</p>');
  }

  function renderDrawer() {
    if (!drawer) return;
    const cart = Cart.get();
    const order = Order.get();
    const t = totals(cart, order);
    const body = $('[data-drawer-body]', drawer);
    const foot = $('[data-drawer-foot]', drawer);
    $('[data-drawer-count]', drawer).textContent = t.count ? plural(t.count, 'item', 'items') : '';
    if (!cart.lines.length) {
      rerender(body, '<div class="flex flex-col items-center px-2 py-12 text-center">' +
        '<div class="art w-36 opacity-90">' + Art.pizza({ seed: 'empty', halves: [{ sauce: 'tomato', cheese: true, toppings: ['basil'] }] }) + '</div>' +
        '<p class="h-display mt-6 text-2xl">Your box is empty</p>' +
        '<p class="mt-2 text-sm text-cocoa">Hungry? The oven’s hot.</p>' +
        '<div class="mt-6 flex flex-wrap justify-center gap-3"><a href="menu.html" class="btn-primary">Browse the menu</a><a href="deals.html" class="btn-ghost">See deals</a></div></div>');
      foot.hidden = true;
      return;
    }
    foot.hidden = false;
    rerender(body, '<ul class="divide-y-2 divide-dashed divide-ink/10">' + cart.lines.map((l, i) => lineHtml(l, i)).join('') + '</ul>' +
      '<div class="mt-2 border-t-2 border-dashed border-ink/10 pt-5"><label for="cart-notes" class="field-label">Notes for the kitchen</label>' +
      '<textarea id="cart-notes" rows="2" maxlength="200" data-cart-notes class="field resize-none text-sm" placeholder="Well done crusts, cut into squares, ring the top bell…">' + escapeHtml(cart.notes) + '</textarea></div>' +
      '<div class="mt-5 pb-6">' + promoHtml(cart, t) + '</div>');
    $('[data-drawer-notice]', foot).innerHTML = deliveryNotice(t, order);
    $('[data-drawer-totals]', foot).innerHTML = totalsHtml(t, order);
    const go = $('[data-drawer-checkout]', foot);
    go.setAttribute('aria-disabled', String(t.blocked));
    $('[data-drawer-checkout-label]', go).textContent = t.blocked ? (order.mode === 'delivery' && t.needsPostcode ? 'Add your ZIP code to continue' : 'Add ' + fmt(t.short) + ' to continue') : 'Checkout · ' + fmt(t.total);
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
    toastTimer = setTimeout(hideToast, 4500);
  }
  function added(text) {
    $$('[data-cart-count]').forEach((el) => { el.classList.remove('badge-pop'); void el.offsetWidth; el.classList.add('badge-pop'); });
    toast('<strong class="font-bold">' + escapeHtml(text) + '</strong> added to your order. <button type="button" data-cart-open class="ml-1 font-bold text-cheese underline underline-offset-4">View order</button>');
  }

  // Mobile "View order" bar (not on checkout).
  let orderBar = null;
  if (drawer && document.body.dataset.page !== 'checkout') {
    orderBar = document.createElement('div');
    orderBar.className = 'fixed inset-x-3 bottom-3 z-30 lg:hidden';
    orderBar.setAttribute('data-back-to-top-avoid', '');
    orderBar.hidden = true;
    orderBar.innerHTML = '<button type="button" data-cart-open aria-controls="cart-drawer" aria-expanded="false" class="flex w-full items-center gap-3 rounded-full bg-ink py-2.5 pl-2.5 pr-5 text-left text-mozz shadow-[0_14px_30px_-10px_rgb(42_18_9/.7)]">' +
      '<span class="grid size-10 place-items-center rounded-full bg-cheese font-extrabold tabular-nums text-ink" data-bar-count>0</span>' +
      '<span class="flex-1 font-extrabold">View your order</span><span class="font-extrabold tabular-nums" data-bar-total></span></button>';
    document.body.appendChild(orderBar);
  }

  function renderCartUI() {
    const t = totals();
    $$('[data-cart-count]').forEach((el) => { el.textContent = t.count; el.hidden = t.count === 0; });
    $$('[data-cart-total]').forEach((el) => { el.textContent = t.count ? fmt(t.subtotal) : 'Order'; });
    $$('[data-cart-open][data-cart-label]').forEach((b) => b.setAttribute('aria-label', 'Your order, ' + plural(t.count, 'item', 'items')));
    $$('[data-order-summary]').forEach((el) => { el.textContent = orderSummaryText(); });
    if (orderBar) {
      orderBar.hidden = t.count === 0;
      $('[data-bar-count]', orderBar).textContent = t.count;
      $('[data-bar-total]', orderBar).textContent = fmt(t.subtotal);
    }
    if (drawer && !drawer.hidden) renderDrawer();
  }
  onRefresh(renderCartUI);

  function editLine(i) {
    const l = Cart.lines()[i];
    if (!l) return;
    closeDrawer(true);
    if (l.type === 'pizza') openCustomiser(l.id, i, l);
    else if (l.type === 'deal') openDeal(l.id, i, l.picks);
  }

  function addItem(id) {
    const item = findItem(id);
    if (!item) return;
    if (isPizza(item)) { openCustomiser(id); return; }
    Cart.add({ type: 'item', id: id, qty: 1 });
    added(item.name);
  }

  // One click handler for everything rendered now or later.
  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-cart-open], [data-drawer-close], [data-add], [data-deal], [data-qty-step], [data-remove], [data-edit], [data-toast-close], [data-promo-remove], [data-drawer-checkout], [data-copy]');
    if (!t) return;
    if (t.hasAttribute('data-cart-open')) { e.preventDefault(); if (sheet.open) sheet.close(); openDrawer(); }
    else if (t.hasAttribute('data-drawer-close')) closeDrawer();
    else if (t.hasAttribute('data-add')) addItem(t.getAttribute('data-add'));
    else if (t.hasAttribute('data-deal')) openDeal(t.getAttribute('data-deal'));
    else if (t.hasAttribute('data-qty-step')) {
      const idx = +t.getAttribute('data-index');
      const line = Cart.lines()[idx];
      if (line) Cart.setQty(idx, line.qty + (+t.getAttribute('data-qty-step')));
    }
    else if (t.hasAttribute('data-remove')) Cart.setQty(+t.getAttribute('data-remove'), 0);
    else if (t.hasAttribute('data-edit')) editLine(+t.getAttribute('data-edit'));
    else if (t.hasAttribute('data-toast-close')) hideToast();
    else if (t.hasAttribute('data-promo-remove')) {
      const where = t.closest('#cart-drawer') ? '#cart-drawer' : '#co-promo';
      promoError = ''; Cart.set({ promo: '' });
      const inp = $(where + ' [data-promo-form] input'); if (inp) inp.focus();
    }
    else if (t.hasAttribute('data-drawer-checkout') && t.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      const pc = $('[data-zone-checker] input[type="text"]', drawer);
      if (pc && !pc.closest('[hidden]')) pc.focus();
    }
    else if (t.hasAttribute('data-copy')) {
      const code = t.getAttribute('data-copy');
      const done = () => toast('Copied <strong class="font-bold">' + escapeHtml(code) + '</strong>. Paste it in your order.');
      if (navigator.clipboard) navigator.clipboard.writeText(code).then(done, done); else done();
    }
  });

  // Promo codes (a <div>, not a <form>: the checkout summary sits inside the checkout form).
  function applyPromo(box) {
    const code = $('input', box).value.trim().toUpperCase().replace(/\s+/g, '');
    if (!code) promoError = 'Enter a promo code.';
    else if (!PROMOS[code]) promoError = '“' + code + '” isn’t a code we know. Check the spelling?';
    else promoError = '';
    const where = box.closest('#cart-drawer') ? '#cart-drawer' : '#co-promo';
    if (promoError) { refreshAll(); const inp = $(where + ' [data-promo-form] input'); if (inp) { inp.value = code; inp.focus(); } return; }
    Cart.set({ promo: code });
    if (where !== '#cart-drawer') toast('Code <strong class="font-bold">' + escapeHtml(code) + '</strong> applied: ' + escapeHtml(PROMOS[code].label) + '.');
    const rm = $(where + ' [data-promo-remove]');
    if (rm) rm.focus();
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest('[data-promo-apply]');
    if (b) applyPromo(b.closest('[data-promo-form]'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && e.target.matches('[data-promo-form] input')) { e.preventDefault(); applyPromo(e.target.closest('[data-promo-form]')); }
  });
  document.addEventListener('input', (e) => {
    // Save notes without re-rendering (so typing isn't interrupted).
    if (e.target.matches('[data-cart-notes]')) write(CART_KEY, Object.assign(Cart.get(), { notes: e.target.value.slice(0, 200) }));
  });

  if (overlay) overlay.addEventListener('click', () => closeDrawer());
  document.addEventListener('keydown', (e) => {
    if (!drawer || drawer.hidden || sheet.open) return;
    if (e.key === 'Escape') { closeDrawer(); return; }
    if (e.key === 'Tab') {
      const f = focusables(drawer);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  // Keep every open tab in sync.
  window.addEventListener('storage', (e) => { if (e.key === CART_KEY || e.key === ORDER_KEY) refreshAll(); });

  /* ------------------------------------------------------------------
   * 12. Menu page: sections and cards from MENU, diet filters (also as
   *     menu.html?diet=vegan,spicy), sticky section nav with scrollspy and
   *     menu.html?item=margherita to open an item straight away.
   * ------------------------------------------------------------------ */
  const CARD_TINTS = ['bg-cheese-soft', 'bg-tomato-soft', 'bg-basil-soft', 'bg-flour'];

  function menuCard(item, i, compact) {
    const pizza = isPizza(item);
    const price = pizza ? 'From ' + fmt(pizzaAt(item, 'small')) : fmt(item.price);
    const tint = CARD_TINTS[i % CARD_TINTS.length];
    // Phones: picture on the left; larger screens: picture on top.
    return '<article class="reveal card group relative flex overflow-hidden sm:flex-col" data-item="' + item.id + '">' +
      '<div class="relative flex w-28 shrink-0 flex-col items-center ' + tint + ' ' + (pizza ? 'p-2.5 sm:p-6' : 'p-4 sm:p-10') + ' sm:block sm:w-auto">' +
        '<div class="art pizza-turn mx-auto aspect-square w-full max-w-[15rem]">' + itemArt(item) + '</div>' +
        (item.best && !compact ? '<span class="mt-2 rotate-[-6deg] rounded-full bg-tomato px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-mozz sm:absolute sm:left-4 sm:top-4 sm:mt-0 sm:px-3 sm:py-1 sm:text-xs">Bestseller</span>' : '') +
      '</div>' +
      '<div class="flex min-w-0 flex-1 flex-col p-4 sm:p-6">' +
        '<div class="flex flex-col items-start gap-1.5 sm:flex-row sm:justify-between sm:gap-3"><h3 class="text-lg font-extrabold leading-tight sm:text-xl">' + escapeHtml(item.name) + '</h3><span class="price-tag shrink-0 px-2.5 py-0.5 text-[13px] sm:px-3 sm:py-1 sm:text-sm">' + price + '</span></div>' +
        '<p class="mt-2 flex-1 text-sm leading-relaxed text-cocoa sm:text-[15px]">' + escapeHtml(item.desc) + '</p>' +
        '<div class="mt-4 flex min-h-6 flex-wrap gap-1.5">' + dietTags(item.diet, false, pizza) + '</div>' +
        (compact ? '' : '<p class="mt-2 text-xs text-cocoa sm:mt-3"><span class="font-bold">Allergens:</span> ' + (item.allergens.length ? item.allergens.map((a) => ALLERGENS[a]).join(', ') : 'none') + '</p>') +
        '<button type="button" data-add="' + item.id + '" class="' + (pizza ? 'btn-primary' : 'btn-ghost') + ' mt-4 w-full px-4 py-2.5 sm:mt-5 sm:py-3">' +
          (pizza ? 'Choose size &amp; add' : 'Add to order') + '<span class="sr-only">: ' + escapeHtml(item.name) + '</span></button>' +
      '</div></article>';
  }

  function initMenu() {
    const root = $('#menu-sections');
    const nav = $('#menu-nav');
    const count = $('#menu-count');
    if (!root) return;
    root.innerHTML = SECTIONS.map((s) => {
      const items = itemsIn(s.id);
      return '<section id="' + s.id + '" class="scroll-mt-44 pt-14 first:pt-8" aria-labelledby="' + s.id + '-title" data-section>' +
        '<div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-2"><h2 id="' + s.id + '-title" class="h-display text-4xl sm:text-5xl">' + s.name + '</h2><p class="max-w-md text-cocoa">' + escapeHtml(s.blurb) + '</p></div>' +
        '<div class="mt-8 grid gap-6 ' + (s.id === 'pizzas' ? 'sm:grid-cols-2 lg:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4') + '">' + items.map((it, i) => menuCard(it, s.id === 'pizzas' ? i : i + 1)).join('') + '</div></section>';
    }).join('');
    nav.innerHTML = SECTIONS.map((s) => '<li><a href="#' + s.id + '" data-nav="' + s.id + '" class="block whitespace-nowrap rounded-full px-4 py-2 text-sm font-extrabold transition hover:bg-flour aria-[current=true]:bg-tomato aria-[current=true]:text-mozz">' + s.name + '</a></li>').join('');

    const chips = $$('[data-diet]');
    function selected() { return chips.filter((c) => c.getAttribute('aria-pressed') === 'true').map((c) => c.getAttribute('data-diet')); }
    function apply(push) {
      const diets = selected();
      let shown = 0;
      $$('[data-item]', root).forEach((card) => {
        const item = findItem(card.getAttribute('data-item'));
        const ok = diets.every((d) => item.diet.indexOf(d) !== -1);
        card.hidden = !ok;
        if (ok) shown++;
      });
      $$('[data-section]', root).forEach((sec) => {
        const any = $$('[data-item]', sec).some((c) => !c.hidden);
        sec.hidden = !any;
        const link = $('[data-nav="' + sec.id + '"]', nav);
        if (link) link.parentNode.hidden = !any;
      });
      $('#menu-empty').hidden = shown > 0;
      $('#menu-clear').hidden = !diets.length;
      count.textContent = diets.length
        ? 'Showing ' + plural(shown, 'item', 'items') + ' that ' + (diets.length > 1 ? 'are all of: ' : 'are ') + diets.map((d) => DIETS[d].label.toLowerCase()).join(', ') + '.'
        : 'Showing all ' + MENU.length + ' items.';
      if (push) {
        const url = new URL(location.href);
        if (diets.length) url.searchParams.set('diet', diets.join(',')); else url.searchParams.delete('diet');
        history.replaceState(null, '', url.pathname + url.search + url.hash);
      }
      reveal(root);
    }
    // ?diet=vegan,gf (also accepts gluten-free and veggie)
    const alias = { 'gluten-free': 'gf', glutenfree: 'gf', veggie: 'vegetarian', vegetarian: 'vegetarian', vegan: 'vegan', gf: 'gf', spicy: 'spicy', hot: 'spicy' };
    const fromUrl = (urlParams().get('diet') || '').toLowerCase().split(/[,\s]+/).map((d) => alias[d]).filter(Boolean);
    chips.forEach((c) => {
      c.setAttribute('aria-pressed', String(fromUrl.indexOf(c.getAttribute('data-diet')) !== -1));
      c.addEventListener('click', () => { c.setAttribute('aria-pressed', String(c.getAttribute('aria-pressed') !== 'true')); apply(true); });
    });
    const clear = () => { chips.forEach((c) => c.setAttribute('aria-pressed', 'false')); apply(true); };
    $('#menu-clear').addEventListener('click', clear);
    $('#menu-empty-clear').addEventListener('click', clear);
    apply(false);

    // Scrollspy: highlight the section nearest the top.
    if ('IntersectionObserver' in window) {
      const visible = {};
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((en) => { visible[en.target.id] = en.isIntersecting; });
        const shown = SECTIONS.map((s) => s.id).filter((id) => { const el = document.getElementById(id); return el && !el.hidden; });
        const current = shown.find((id) => visible[id]) || (window.scrollY < 400 ? shown[0] : null);
        $$('[data-nav]', nav).forEach((a) => {
          const on = a.getAttribute('data-nav') === current;
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
          if (on && a.parentNode.parentNode.scrollWidth > a.parentNode.parentNode.clientWidth) {
            const box = a.parentNode.parentNode;
            box.scrollTo({ left: a.offsetLeft - 16, behavior: reduceMotion ? 'auto' : 'smooth' });
          }
        });
      }, { rootMargin: '-180px 0px -55% 0px' });
      $$('[data-section]', root).forEach((s) => spy.observe(s));
    }

    const deep = findItem(urlParams().get('item'));
    if (deep) addItem(deep.id);
  }

  /* ------------------------------------------------------------------
   * 13. Home page: bestsellers and deal teasers from the data.
   * ------------------------------------------------------------------ */
  const DEAL_STYLES = {
    cheese: { card: 'bg-cheese text-ink', btn: 'btn-ink', sub: 'text-ink/80' },
    tomato: { card: 'bg-tomato text-mozz on-red', btn: 'btn-cheese', sub: 'text-mozz' },
    basil: { card: 'bg-basil text-mozz on-dark', btn: 'btn-cheese', sub: 'text-mozz' }
  };
  function dealCard(deal, big) {
    const st = DEAL_STYLES[deal.color] || DEAL_STYLES.cheese;
    const sample = (deal.art || []).map(findItem).filter(Boolean);
    const worth = dealWorth(deal, deal.slots.filter((s) => s.choose).map((s, i) => { const o = itemsIn(s.choose); return (o[i % o.length] || o[0]).id; }));
    return '<article id="deal-' + deal.id + '" class="reveal relative flex scroll-mt-28 flex-col overflow-hidden rounded-[2rem] p-7 sm:p-8 ' + st.card + '">' +
      (deal.popular ? '<span class="absolute right-5 top-5 rotate-6 rounded-full bg-ink px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-mozz">Most ordered</span>' : '') +
      '<div class="flex -space-x-8">' + sample.slice(0, 2).map((p, i) => '<div class="art size-24 shrink-0 rounded-full ' + (i ? 'rotate-12' : '-rotate-6') + ' drop-shadow-[0_8px_10px_rgb(42_18_9/.3)] sm:size-28">' + itemArt(p) + '</div>').join('') + '</div>' +
      '<h3 class="h-display mt-6 text-3xl">' + escapeHtml(deal.name) + '</h3>' +
      '<p class="mt-2 text-lg font-semibold leading-snug">' + escapeHtml(deal.tagline) + '</p>' +
      '<p class="mt-1 text-sm ' + st.sub + '">' + escapeHtml(deal.when) + '</p>' +
      '<div class="mt-auto flex flex-wrap items-end justify-between gap-4 pt-7"><p><span class="block text-sm font-bold line-through decoration-2">Usually ' + fmt(worth) + '</span><span class="text-4xl font-black tabular-nums">' + fmt(deal.price) + '</span></p>' +
      '<button type="button" data-deal="' + deal.id + '" class="' + st.btn + '">Pick &amp; add<span class="sr-only"> ' + escapeHtml(deal.name) + '</span></button></div>' +
      '</article>';
  }

  function initHome() {
    const best = $('#bestsellers');
    if (best) best.innerHTML = MENU.filter((m) => m.best).map((m, i) => menuCard(m, i, true)).join('');
    const deals = $('#home-deals');
    if (deals) deals.innerHTML = DEALS.map((d) => dealCard(d)).join('');
  }

  /* ------------------------------------------------------------------
   * 14. Deals page: fixed deals and the build-your-bundle builder.
   * ------------------------------------------------------------------ */
  function initDeals() {
    const cards = $('#deal-cards');
    if (cards) cards.innerHTML = DEALS.map((d) => dealCard(d, true)).join('');
    const root = $('#bundle-builder');
    if (!root) return;
    const qty = {};
    const list = $('#bundle-items', root);
    list.innerHTML = BUNDLE_SECTIONS.map((sec) => {
      const s = SECTIONS.find((x) => x.id === sec);
      return '<fieldset class="mt-8 first:mt-0"><legend class="h-display text-2xl">' + s.name + (sec === 'pizzas' ? ' <span class="font-sans text-sm font-bold text-cocoa">(Regular 12″)</span>' : '') + '</legend>' +
        '<ul class="mt-3 grid gap-2 sm:grid-cols-2">' + itemsIn(sec).map((it) =>
          '<li class="flex items-center gap-3 rounded-2xl bg-paper p-2.5 pr-3 ring-1 ring-ink/10 transition has-[output:not([data-zero])]:bg-cheese-soft has-[output:not([data-zero])]:ring-ink/40">' +
            '<div class="art size-12 shrink-0">' + itemArt(it) + '</div>' +
            '<div class="min-w-0 flex-1"><p class="truncate text-sm font-extrabold">' + escapeHtml(it.name) + '</p><p class="text-xs font-semibold tabular-nums text-cocoa">' + fmt(isPizza(it) ? pizzaAt(it, 'regular') : it.price) + '</p></div>' +
            '<div class="stepper h-9 shrink-0" role="group" aria-label="' + escapeHtml(it.name) + ' quantity">' +
              '<button type="button" class="!h-9 !w-9" data-b-step="-1" data-b-id="' + it.id + '" aria-label="One fewer ' + escapeHtml(it.name) + '" disabled>−</button>' +
              '<output class="w-6 text-center text-sm font-extrabold tabular-nums" data-b-qty="' + it.id + '" data-zero aria-live="polite">0</output>' +
              '<button type="button" class="!h-9 !w-9" data-b-step="1" data-b-id="' + it.id + '" aria-label="One more ' + escapeHtml(it.name) + '">+</button></div>' +
          '</li>').join('') + '</ul></fieldset>';
    }).join('');

    const items = () => Object.keys(qty).filter((id) => qty[id] > 0).map((id) => ({ id: id, qty: qty[id] }));
    function paint() {
      const b = bundlePrice(items());
      const c = b.counts;
      $$('[data-b-qty]', root).forEach((o) => {
        const n = qty[o.getAttribute('data-b-qty')] || 0;
        o.textContent = n;
        if (n) o.removeAttribute('data-zero'); else o.setAttribute('data-zero', '');
      });
      $$('[data-b-step="-1"]', root).forEach((btn) => { btn.disabled = !qty[btn.getAttribute('data-b-id')]; });
      $$('[data-b-step="1"]', root).forEach((btn) => { btn.disabled = c.total >= BUNDLE_MAX; });
      $('#bundle-pizzas').textContent = c.pizzas;
      $('#bundle-sides').textContent = c.sides;
      $('#bundle-other').textContent = c.total - c.pizzas - c.sides;
      BUNDLE_TIERS.forEach((t, i) => {
        const on = c.pizzas >= t.pizzas && c.sides >= t.sides;
        const el = $('[data-tier="' + i + '"]', root);
        el.classList.toggle('bg-basil', on); el.classList.toggle('text-mozz', on);
        el.classList.toggle('bg-paper', !on);
        $('[data-tier-state]', el).textContent = on ? 'Unlocked' : 'Locked';
      });
      const goal = BUNDLE_TIERS[BUNDLE_TIERS.length - 1];
      const progress = Math.min(1, (Math.min(c.pizzas, goal.pizzas) + Math.min(c.sides, goal.sides)) / (goal.pizzas + goal.sides));
      $('#bundle-meter').style.width = (progress * 100).toFixed(0) + '%';
      let hint;
      if (b.next) {
        const needP = Math.max(0, b.next.pizzas - c.pizzas), needS = Math.max(0, b.next.sides - c.sides);
        hint = 'Add ' + [needP ? plural(needP, 'more pizza', 'more pizzas') : '', needS ? plural(needS, 'more side', 'more sides') : ''].filter(Boolean).join(' and ') + ' to unlock ' + b.next.label + '.';
      } else hint = 'Top tier unlocked: ' + b.tier.label + ' the whole bundle.';
      if (c.total >= BUNDLE_MAX) hint = 'That’s the most we can fit in one bundle (' + BUNDLE_MAX + ' items).';
      $('#bundle-hint').textContent = hint;
      $('#bundle-worth').textContent = fmt(b.worth);
      $('#bundle-saving').textContent = b.tier ? '−' + fmt(b.worth - b.price) : fmt(0);
      $('#bundle-price').textContent = fmt(b.price);
      const add = $('#bundle-add');
      add.disabled = !b.tier;
      $('#bundle-add-label').textContent = b.tier ? 'Add bundle · ' + fmt(b.price) : 'Unlock a discount to add';
    }
    root.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-b-step]');
      if (!btn) return;
      const id = btn.getAttribute('data-b-id');
      qty[id] = Math.max(0, (qty[id] || 0) + +btn.getAttribute('data-b-step'));
      paint();
      if (btn.disabled) { const other = btn.parentNode.querySelector('[data-b-step]:not([disabled])'); if (other) other.focus(); }
    });
    $('#bundle-add').addEventListener('click', () => {
      const its = items();
      const b = bundlePrice(its);
      if (!b.tier) return;
      Cart.add({ type: 'bundle', items: its, qty: 1 });
      added('Your bundle (' + b.tier.label + ')');
      Object.keys(qty).forEach((k) => { qty[k] = 0; });
      paint();
    });
    $('#bundle-reset').addEventListener('click', () => { Object.keys(qty).forEach((k) => { qty[k] = 0; }); paint(); });
    paint();
  }

  /* ------------------------------------------------------------------
   * 15. Locations page: zone list and map highlights.
   * ------------------------------------------------------------------ */
  function initLocations() {
    const list = $('#zone-list');
    if (list) {
      list.innerHTML = ZONES.map((z) => '<tr data-zone-row="' + z.id + '" class="transition">' +
        '<th scope="row" class="py-3 pl-4 pr-3 text-left align-top"><span class="flex items-center gap-2 font-extrabold"><span class="size-3 shrink-0 rounded-full" data-swatch="' + z.id + '" aria-hidden="true"></span>' + escapeHtml(z.name) + '</span><span class="mt-0.5 block text-xs font-semibold text-cocoa">' + z.districts.join(', ') + ' · from ' + escapeHtml(findStore(z.store).name) + '</span>' +
        '<span class="mt-1 block text-sm font-semibold sm:hidden">' + fmt(z.fee) + ' delivery · ' + fmt(z.min) + ' minimum · ' + z.eta[0] + '–' + z.eta[1] + ' min</span></th>' +
        '<td class="hidden px-3 py-3 align-top tabular-nums sm:table-cell">' + fmt(z.fee) + '</td><td class="hidden px-3 py-3 align-top tabular-nums sm:table-cell">' + fmt(z.min) + '</td><td class="hidden whitespace-nowrap py-3 pl-3 pr-4 align-top tabular-nums sm:table-cell">' + z.eta[0] + '–' + z.eta[1] + ' min</td></tr>').join('');
      $$('[data-swatch]', list).forEach((s) => {
        const path = $('[data-map-zone="' + s.getAttribute('data-swatch') + '"]');
        if (path) s.style.background = path.getAttribute('fill');
      });
    }
    function highlight(id) {
      $$('[data-map-zone]').forEach((p) => { p.style.opacity = !id || p.getAttribute('data-map-zone') === id ? '' : '0.35'; });
      $$('[data-zone-row]').forEach((r) => r.classList.toggle('bg-cheese-soft', r.getAttribute('data-zone-row') === id));
    }
    $$('[data-zone-row], [data-map-zone]').forEach((el) => {
      const id = el.getAttribute('data-zone-row') || el.getAttribute('data-map-zone');
      el.addEventListener('mouseenter', () => highlight(id));
      el.addEventListener('mouseleave', () => highlight(Order.get().zone));
    });
    document.addEventListener('zonechange', (e) => highlight(e.detail.ok ? e.detail.zone.id : null));
    highlight(Order.get().zone);
  }

  /* ------------------------------------------------------------------
   * 16. Checkout and order tracker. Payment isn't connected: nothing is
   *     sent or charged. The tracker runs in fast-forward (TRACKER_STEP_SECONDS).
   * ------------------------------------------------------------------ */
  const STAGES = {
    delivery: [
      { label: 'Order received', note: 'The kitchen has your ticket.' },
      { label: 'In the oven', note: '90 seconds at 850°F. Don’t blink.' },
      { label: 'Out for delivery', note: 'Your rider is on the way.' },
      { label: 'Delivered', note: 'Enjoy it while it’s hot.' }
    ],
    pickup: [
      { label: 'Order received', note: 'The kitchen has your ticket.' },
      { label: 'In the oven', note: '90 seconds at 850°F. Don’t blink.' },
      { label: 'Boxed & ready', note: 'It’s on the shelf by the door with your name on it.' },
      { label: 'Picked up', note: 'Enjoy it while it’s hot.' }
    ]
  };

  function readLastOrder() {
    const o = read(LAST_ORDER_KEY);
    if (!o || typeof o.number !== 'string' || typeof o.placedAt !== 'number' || !Array.isArray(o.lines) || !STAGES[o.mode] || !o.totals) return null;
    if (Date.now() - o.placedAt > 6 * 3600 * 1000 || o.placedAt > Date.now() + 60000) return null;
    return o;
  }

  let trackerTimer = null;
  function renderTracker(order) {
    const box = $('#tracker');
    if (!box) return;
    const stages = STAGES[order.mode];
    const elapsed = (Date.now() - order.placedAt) / 1000;
    const at = Math.min(stages.length - 1, Math.floor(elapsed / TRACKER_STEP_SECONDS));
    const finished = at === stages.length - 1;
    // Smooth progress between stages for the rider.
    const pct = finished ? 100 : Math.min(100, ((at + Math.min(1, (elapsed % TRACKER_STEP_SECONDS) / TRACKER_STEP_SECONDS)) / (stages.length - 1)) * 100);
    $('#track-fill').style.width = pct + '%';
    $('#track-rider').style.left = pct + '%';
    $$('.track-step', box).forEach((li, i) => {
      const state = i < at || (finished && i === at) ? 'done' : i === at ? 'current' : 'todo';
      if (li.getAttribute('data-state') !== state) li.setAttribute('data-state', state);
      $('[data-step-state]', li).textContent = state === 'done' ? 'Done' : state === 'current' ? 'Now' : 'Up next';
    });
    const status = $('#track-status');
    const text = stages[at].label + '. ' + stages[at].note;
    if (status.textContent !== text) status.textContent = text;
    if (finished && trackerTimer) { clearInterval(trackerTimer); trackerTimer = null; }
  }

  function renderDone(order) {
    const root = $('#checkout-done');
    const stages = STAGES[order.mode];
    const icons = [
      '<path d="M7 4h10v16l-2.5-1.5L12 20l-2.5-1.5L7 20Z"/><path d="M10 9h4M10 13h4"/>',
      '<path d="M4 11a8 8 0 0 1 16 0v8H4Z"/><path d="M8 19v-4h8v4"/><path d="M9 7.5c.5-1 1-1 1.5 0s1 1 1.5 0 1-1 1.5 0"/>',
      order.mode === 'delivery' ? '<circle cx="6" cy="17" r="2.5"/><circle cx="18" cy="17" r="2.5"/><path d="M8.5 17h7M15 6h2.5l2.5 8.5M6 14.5V11h6l3 6"/>' : '<path d="M4 9h16v10H4Z"/><path d="M4 9l3-4h10l3 4"/><path d="M10 13h4"/>',
      '<path d="m5 12.5 4.5 4.5L19 7.5"/>'
    ];
    root.innerHTML =
      '<div class="card overflow-hidden" tabindex="-1" id="done-card">' +
        '<div class="on-dark relative overflow-hidden bg-basil px-6 py-10 text-mozz sm:px-10">' +
          '<div class="art pointer-events-none absolute -right-10 -top-10 hidden w-56 rotate-12 opacity-90 sm:block">' + Art.pizza({ seed: 'done', halves: [{ sauce: 'tomato', cheese: true, toppings: ['pepperoni', 'basil'] }] }) + '</div>' +
          '<p class="text-sm font-extrabold uppercase tracking-[0.16em] text-cheese">Order ' + escapeHtml(order.number) + '</p>' +
          '<h2 class="h-display mt-3 max-w-lg text-4xl sm:text-5xl">Thanks, ' + escapeHtml(order.name) + '. We’re on it.</h2>' +
          '<p class="mt-4 max-w-lg text-lg">' + escapeHtml(order.summary) + '</p>' +
        '</div>' +
        '<div class="px-6 py-8 sm:px-10" id="tracker">' +
          '<h3 class="text-xl font-extrabold">Track your order</h3>' +
          '<div class="relative mx-3 mt-8 h-3 rounded-full bg-flour" aria-hidden="true"><div id="track-fill" class="track-fill h-full w-0 rounded-full bg-tomato"></div>' +
            '<div id="track-rider" class="track-rider absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style="left:0"><span class="grid size-11 place-items-center rounded-full bg-ink text-mozz shadow-lg"><svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">' + (order.mode === 'delivery' ? '<circle cx="6" cy="17" r="2.5"/><circle cx="18" cy="17" r="2.5"/><path d="M8.5 17h7M15 6h2.5l2.5 8.5M6 14.5V11h6l3 6"/><path d="M4 8h5"/>' : '<path d="M5 8h14l-1 12H6Z"/><path d="M9 11V7a3 3 0 0 1 6 0v4"/>') + '</svg></span></div></div>' +
          '<ol class="mt-10 grid gap-4 sm:grid-cols-4">' + stages.map((s, i) =>
            '<li class="track-step flex items-center gap-3 sm:flex-col sm:text-center" data-state="todo">' +
              '<span class="track-dot grid size-12 shrink-0 place-items-center rounded-full"><svg viewBox="0 0 24 24" class="size-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + icons[i] + '</svg></span>' +
              '<span><span class="block font-extrabold">' + escapeHtml(s.label) + '</span><span class="block text-sm text-cocoa" data-step-state>Up next</span></span></li>').join('') + '</ol>' +
          '<p id="track-status" role="status" aria-live="polite" class="mt-8 rounded-2xl bg-cheese-soft px-5 py-4 font-semibold"></p>' +
          '<p class="mt-3 text-sm text-cocoa">Times are a guide: on busy nights it can run a few minutes over.</p>' +
        '</div>' +
      '</div>' +
      '<div class="mt-8 grid items-start gap-8 lg:grid-cols-[1.2fr_1fr]">' +
        '<div class="card p-6 sm:p-8"><h3 class="text-xl font-extrabold">What you ordered</h3><ul class="mt-4 divide-y-2 divide-dashed divide-ink/10">' +
          order.lines.map((l) => '<li class="flex justify-between gap-4 py-3"><span><span class="font-bold"><span class="tabular-nums">' + l.qty + ' × </span>' + escapeHtml(l.title) + '</span>' + (l.detail ? '<span class="block text-sm text-cocoa">' + escapeHtml(l.detail) + '</span>' : '') + '</span><span class="font-bold tabular-nums">' + fmt(l.total) + '</span></li>').join('') + '</ul>' +
          '<dl class="mt-4 space-y-1.5 border-t-2 border-dashed border-ink/10 pt-4"><div class="flex justify-between"><dt>Subtotal</dt><dd class="tabular-nums">' + fmt(order.totals.subtotal) + '</dd></div>' +
          (order.totals.discount ? '<div class="flex justify-between text-basil"><dt>Promo ' + escapeHtml(order.totals.promoCode) + '</dt><dd class="tabular-nums">−' + fmt(order.totals.discount) + '</dd></div>' : '') +
          '<div class="flex justify-between"><dt>' + (order.mode === 'delivery' ? 'Delivery' : 'Pickup') + '</dt><dd class="tabular-nums">' + (order.totals.delivery ? fmt(order.totals.delivery) : 'Free') + '</dd></div>' +
          '<div class="flex justify-between text-lg font-extrabold"><dt>Total</dt><dd class="tabular-nums">' + fmt(order.totals.total) + '</dd></div></dl></div>' +
        '<div class="card flex flex-col p-6 sm:p-8"><h3 class="text-xl font-extrabold">Need anything?</h3><p class="mt-2 text-cocoa">Call ' + escapeHtml(order.storeName) + ' at <a class="link" href="tel:+1' + escapeHtml(order.storePhone.replace(/\D/g, '')) + '">' + escapeHtml(order.storePhone) + '</a> and quote ' + escapeHtml(order.number) + '.</p>' +
          '<p class="mt-4 text-sm text-cocoa">Your receipt is on its way to your inbox.</p>' +
          '<div class="flex flex-wrap gap-3 pt-6"><a href="menu.html" class="btn-primary">Order something else</a><button type="button" id="new-order" class="btn-ghost">Start a new order</button></div></div>' +
      '</div>';
    $('#new-order').addEventListener('click', () => { write(LAST_ORDER_KEY, null); if (trackerTimer) clearInterval(trackerTimer); initCheckout(); });
    renderTracker(order);
    if (trackerTimer) clearInterval(trackerTimer);
    trackerTimer = setInterval(() => renderTracker(order), 500);
  }

  let checkoutReady = false;
  function initCheckout() {
    const form = $('#checkout-form');
    if (!form) return;
    const empty = $('#checkout-empty');
    const done = $('#checkout-done');
    const cart = Cart.get();
    const last = readLastOrder();
    form.hidden = empty.hidden = done.hidden = true;
    if (!cart.lines.length && last) { done.hidden = false; renderDone(last); return; }
    if (!cart.lines.length) { empty.hidden = false; return; }
    form.hidden = false;
    if (checkoutReady) { renderCheckout(); return; }
    checkoutReady = true;

    const daySel = $('#co-day'), timeSel = $('#co-time');
    form.addEventListener('change', (e) => {
      if (e.target.name === 'when' || e.target === daySel) renderCheckout();
      if (e.target.name === 'pay') renderCheckout();
    });
    // Card number in groups of four, expiry as MM / YY.
    const card = $('#co-card'), exp = $('#co-exp');
    card.addEventListener('input', () => { card.value = card.value.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '); });
    exp.addEventListener('input', (e) => {
      const d = exp.value.replace(/\D/g, '').slice(0, 4);
      exp.value = d.length > 2 || (d.length === 2 && e.inputType !== 'deleteContentBackward') ? d.slice(0, 2) + ' / ' + d.slice(2) : d;
    });
    $$('input, select, textarea', form).forEach((el) => {
      if (el.type === 'radio' || !el.id || el.closest('[data-zone-checker]')) return;
      el.addEventListener('blur', () => { if (el.value.trim() || el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
      el.addEventListener('input', () => { if (el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
    });
    onRefresh(() => { if (!form.hidden) renderCheckout(); });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = $('#co-status');
      const t = totals();
      const order = Order.get();
      let firstBad = null;
      $$('input, select, textarea', form).forEach((el) => {
        if (el.type === 'radio' || !el.id || el.closest('[hidden]') || el.closest('[data-zone-checker]')) return;
        const msg = fieldMessage(el);
        showError(el, msg);
        if (msg && !firstBad) firstBad = el;
      });
      if (t.blocked) {
        status.textContent = order.mode === 'delivery' && t.needsPostcode ? 'Check your delivery ZIP code first, or switch to pickup.' : 'Your order is under the delivery minimum.';
        const pc = $('[data-zone-checker] input[type="text"]', form);
        (order.mode === 'delivery' && t.needsPostcode && pc ? pc : $('[data-zone-checker]', form)).scrollIntoView({ block: 'center' });
        if (pc && t.needsPostcode) pc.focus();
        return;
      }
      if (firstBad) { status.textContent = 'Please fix the highlighted fields.'; firstBad.focus(); return; }
      status.textContent = '';
      const store = Order.store();
      const asap = form.elements.when.value === 'asap';
      const now = shopNow();
      const zone = t.zone;
      let summary;
      const placeLabel = order.mode === 'delivery' ? 'Delivering to ' + $('#co-address').value.trim() + ', ' + order.postcode : 'Pick up from ' + store.name + ', ' + store.address.split(',')[0];
      if (asap) {
        const mins = order.mode === 'delivery' ? zone.eta[1] : store.pickupMins;
        summary = placeLabel + '. ' + (order.mode === 'delivery' ? 'Arriving by about ' : 'Ready at about ') + clock(now.mins + mins) + '.';
      } else {
        summary = placeLabel + '. ' + (order.mode === 'delivery' ? 'Scheduled for ' : 'Ready for ') + dateLabel(daySel.value, now.date).replace(/^(Today|Tomorrow)$/, (m) => m.toLowerCase()) + ' at ' + clock(+timeSel.value) + '.';
      }
      const placed = {
        number: makeRef(),
        placedAt: Date.now(), mode: order.mode, name: $('#co-name').value.trim().split(/\s+/)[0],
        summary: summary, storeName: store.name, storePhone: store.phone,
        lines: Cart.lines().map((l) => { const info = lineInfo(l); return { qty: l.qty, title: info.title, detail: info.detail.join(' · '), total: info.total }; }),
        totals: { subtotal: t.subtotal, discount: t.discount, promoCode: t.promoCode, delivery: t.delivery, total: t.total }
      };
      // A real shop would send the order and take payment here, e.g.
      // fetch('/api/orders', { method: 'POST', body: JSON.stringify(placed) }) with your payment provider.
      write(LAST_ORDER_KEY, placed);
      write(CART_KEY, { lines: [], promo: '', notes: '' });
      refreshAll();
      window.scrollTo({ top: 0, behavior: 'auto' });
      initCheckout();
      const doneCard = $('#done-card');
      if (doneCard) doneCard.focus();
    });
    renderCheckout();
  }

  function renderCheckout() {
    const form = $('#checkout-form');
    if (!form || form.hidden) return;
    const cart = Cart.get();
    if (!cart.lines.length) { initCheckout(); return; }
    const order = Order.get();
    const t = totals(cart, order);
    const store = Order.store();
    const now = shopNow();

    // Delivery-only fields.
    $$('[data-delivery-only]', form).forEach((el) => { el.hidden = order.mode !== 'delivery'; });
    $$('[data-pickup-only]', form).forEach((el) => { el.hidden = order.mode !== 'pickup'; });
    $('#co-store-name').textContent = store.name;

    // When: ASAP is only offered while the kitchen can still make it today.
    const todaySlots = timeSlots(store, now.date, order.mode);
    const st = storeStatus(store);
    const asapOk = st.open && todaySlots.length > 0;
    const asap = $('#co-asap'), later = $('#co-later');
    asap.disabled = !asapOk;
    if (!asapOk && asap.checked) later.checked = true;
    if (!asap.checked && !later.checked) (asapOk ? asap : later).checked = true;
    const eta = order.mode === 'delivery' ? (t.zone ? t.zone.eta[0] + '–' + t.zone.eta[1] + ' min' : '25–50 min') : 'about ' + store.pickupMins + ' min';
    $('#co-asap-note').textContent = asapOk ? (order.mode === 'delivery' ? 'Delivered in ' : 'Ready in ') + eta : store.name + ' is closed right now. ' + st.text + '.';
    $('#co-schedule').hidden = !later.checked;

    const daySel = $('#co-day'), timeSel = $('#co-time');
    const prevDay = daySel.value, prevTime = timeSel.value;
    const days = [];
    for (let i = 0; i < SCHEDULE_DAYS; i++) {
      const d = addDays(now.date, i);
      const slots = timeSlots(store, d, order.mode);
      if (slots.length) days.push({ date: d, slots: slots });
    }
    daySel.innerHTML = days.map((d) => '<option value="' + d.date + '">' + dateLabel(d.date, now.date) + '</option>').join('');
    if (days.some((d) => d.date === prevDay)) daySel.value = prevDay;
    const day = days.find((d) => d.date === daySel.value) || days[0];
    timeSel.innerHTML = day ? day.slots.map((m) => '<option value="' + m + '">' + clock(m) + (order.mode === 'delivery' ? '–' + clock(m + SLOT_STEP) : '') + '</option>').join('') : '<option value="">No times available</option>';
    if (day && day.slots.indexOf(+prevTime) !== -1) timeSel.value = prevTime;
    $('#co-slot-note').textContent = 'Times for ' + store.name + ', ' + (order.mode === 'delivery' ? 'including ' + store.deliveryMins + ' minutes to cook and ride' : 'with ' + store.pickupMins + ' minutes to cook') + '.';

    // Payment.
    const pay = form.elements.pay.value || 'card';
    $('#co-card-fields').hidden = pay !== 'card';
    $('#co-door-label').textContent = order.mode === 'delivery' ? 'Pay the rider' : 'Pay at the counter';

    // Summary.
    $('#co-lines').innerHTML = cart.lines.map((l, i) => lineHtml(l, i, true)).join('');
    $('#co-notes').hidden = !cart.notes;
    $('#co-notes-text').textContent = cart.notes;
    rerender($('#co-promo'), promoHtml(cart, t, 'co-promo'));
    $('#co-notice').innerHTML = deliveryNotice(t, order);
    $('#co-totals').innerHTML = totalsHtml(t, order);
    $('#co-submit-label').textContent = 'Place order · ' + fmt(t.total);
  }

  /* ------------------------------------------------------------------
   * 17. Catering calculator: guests and appetite → large pizzas, sides and
   *     an estimate. Large (16") pizzas are cut into 8 slices.
   * ------------------------------------------------------------------ */
  const APPETITE = { light: 2, normal: 3, hungry: 4 };  // slices per person
  const CATERING_DISCOUNT = [{ pizzas: 20, off: 15 }, { pizzas: 10, off: 10 }];
  function initCatering() {
    const calc = $('#cater-calc');
    if (!calc) return;
    const guests = $('#cat-guests');
    const avgLarge = itemsIn('pizzas').reduce((s, p) => s + pizzaAt(p, 'large'), 0) / itemsIn('pizzas').length;
    function paint() {
      const n = wholeNumber(guests.value, 10, 300, 10);
      const per = APPETITE[(calc.querySelector('input[name="appetite"]:checked') || {}).value] || 3;
      const pizzas = Math.ceil(n * per / 8);
      const vegan = Math.max(1, Math.round(pizzas * 0.15));
      const veggie = Math.max(1, Math.round(pizzas * 0.35));
      const sides = Math.ceil(n / 8);
      const worth = pizzas * avgLarge + sides * 8;
      const tier = CATERING_DISCOUNT.find((d) => pizzas >= d.pizzas);
      const price = worth * (1 - (tier ? tier.off : 0) / 100);
      $('#cat-pizzas').textContent = pizzas;
      $('#cat-mix').textContent = plural(veggie, 'veggie', 'veggie') + ', ' + vegan + ' vegan, ' + Math.max(0, pizzas - veggie - vegan) + ' meaty';
      $('#cat-sides').textContent = sides;
      $('#cat-price').textContent = fmt(Math.round(price));
      $('#cat-per').textContent = fmt(price / n) + ' a head' + (tier ? ', with ' + tier.off + '% off' : '');
      $('#cat-guests-out').textContent = n;
    }
    calc.addEventListener('input', paint);
    calc.addEventListener('change', paint);
    $('#cat-use').addEventListener('click', () => {
      const field = $('#c-guests');
      field.value = wholeNumber(guests.value, 10, 300, 10);
      showError(field, '');
      $('#c-message').value = $('#c-message').value || 'Roughly ' + $('#cat-pizzas').textContent + ' large pizzas (' + $('#cat-mix').textContent + ') and ' + $('#cat-sides').textContent + ' sides.';
      $('#enquiry').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      $('#c-name').focus({ preventScroll: true });
    });
    paint();
  }

  /* ------------------------------------------------------------------
   * 18. Forms: inline validation and a success state. Demo forms send
   *     nothing; see the comments below to connect a real endpoint.
   * ------------------------------------------------------------------ */
  function fieldMessage(el) {
    const v = el.value.trim();
    const label = el.getAttribute('data-label') || 'This field';
    if (el.type === 'checkbox') return el.required && !el.checked ? (el.getAttribute('data-msg') || 'Please check this box.') : '';
    if (el.required && !v) return label + ' is required.';
    if (!v) return '';
    const rule = el.getAttribute('data-validate') || el.type;
    if (rule === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter an email address like name@example.com.';
    if (rule === 'tel' && !/^[+()\d\s.-]{10,20}$/.test(v)) return 'Enter a phone number we can call, like (203) 555-0147.';
    if (rule === 'postcode' && !postcodeDistrict(v)) return 'Enter a 5-digit ZIP code, like 06515.';
    if (rule === 'card' && !/^\d{16}$/.test(v.replace(/\s/g, ''))) return 'Enter the 16-digit card number.';
    if (rule === 'expiry') {
      const m = v.match(/^(\d{2})\s*\/\s*(\d{2})$/);
      if (!m || +m[1] < 1 || +m[1] > 12) return 'Use the format MM / YY.';
      const now = new Date();
      if (2000 + +m[2] < now.getFullYear() || (2000 + +m[2] === now.getFullYear() && +m[1] < now.getMonth() + 1)) return 'This card has expired.';
    }
    if (rule === 'cvc' && !/^\d{3,4}$/.test(v)) return 'Enter the 3 or 4 digit code on the back.';
    if (el.type === 'number') {
      const n = Number(v), min = el.min !== '' ? +el.min : -Infinity, max = el.max !== '' ? +el.max : Infinity;
      if (!isFinite(n) || n < min || n > max) return label + ' must be between ' + el.min + ' and ' + el.max + '.';
    }
    if (el.type === 'date') {
      if (el.min && v < el.min) return el.getAttribute('data-min-msg') || 'Choose a later date.';
      if (el.max && v > el.max) return 'Choose a date before ' + el.max + '.';
    }
    if (el.type === 'time' && ((el.min && v < el.min) || (el.max && v > el.max))) return 'Choose a time between ' + clockOf(el.min) + ' and ' + clockOf(el.max) + '.';
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
      el.type !== 'radio' && el.type !== 'hidden' && el.type !== 'submit' && el.id && !el.closest('[data-group]');
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
      if (status) status.textContent = 'Please fix the highlighted fields.';
      firstBad.focus();
      return false;
    }
    if (status) status.textContent = '';
    return true;
  }

  function setupValidation(form, onValid) {
    form.setAttribute('novalidate', '');
    // Listen on the form rather than on each field, so fields that are hidden when the page
    // loads (the catering form's delivery ZIP code) are checked as you type once they show.
    form.addEventListener('focusout', (e) => {
      const el = e.target;
      if (isField(el) && (el.value.trim() || el.hasAttribute('aria-invalid'))) showError(el, fieldMessage(el));
    });
    form.addEventListener('input', (e) => {
      const el = e.target;
      if (isField(el) && el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el));
    });
    $$('[data-group]', form).forEach((g) => g.addEventListener('change', () => { if (g.hasAttribute('aria-invalid')) showError(g, groupMessage(g)); }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validate(form)) onValid(form);
    });
  }

  function successSwap(form, html, dark) {
    const box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.className = dark ? 'rounded-3xl bg-mozz/10 p-5 text-mozz focus:outline-none' : 'rounded-[1.75rem] bg-basil-soft p-6 text-ink focus:outline-none sm:p-8';
    box.innerHTML = html;
    form.replaceWith(box);
    box.focus();
  }

  // To connect a form: replace successSwap(...) below with a fetch() to your form service, e.g.
  // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  //   .then((r) => r.ok ? successSwap(form, '…') : showFormError(form));
  $$('[data-form="newsletter"]').forEach((form) => setupValidation(form, () => {
    successSwap(form, '<p class="font-extrabold">Nearly there.</p><p class="mt-1 text-sm text-mozz/85">Look out for a confirmation email; once you click the link, you’re on the list for The Pizza Post.</p>', true);
  }));
  $$('[data-form="catering"]').forEach((form) => {
    // Delivery needs a ZIP code; pickup shows the shop choice.
    const sync = () => {
      const service = (form.querySelector('input[name="service"]:checked') || {}).value;
      $$('[data-service="delivery"]', form).forEach((el) => { el.hidden = service !== 'delivery'; });
    };
    form.addEventListener('change', sync);
    sync();
    setupValidation(form, () => {
      const name = $('#c-name').value.trim().split(/\s+/)[0];
      const guests = $('#c-guests').value;
      const date = $('#c-date').value;
      const when = new Intl.DateTimeFormat(LOCALE, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }).format(new Date(date + 'T12:00:00Z'));
      successSwap(form, '<p class="h-display text-3xl">Thanks, ' + escapeHtml(name) + '!</p>' +
        '<p class="mt-3 leading-relaxed">We’ve got your party order for <strong>' + escapeHtml(guests) + ' guests on ' + escapeHtml(when) + '</strong>. Our events team will reply within one business day with a menu and a fixed quote.</p>' +
        '<p class="mt-3 text-sm text-cocoa">Your reference is <strong class="text-ink">' + makeRef() + '</strong>.</p>');
    });
  });
  // Dates: the catering form's minimum is two days from today in the shop's time zone.
  $$('input[type="date"][data-min-days]').forEach((el) => {
    const today = shopNow().date;
    el.min = addDays(today, +el.getAttribute('data-min-days'));
    el.max = addDays(today, 180);
  });

  /* ------------------------------------------------------------------
   * 19. Boot
   * ------------------------------------------------------------------ */
  $$('[data-zone-checker]').forEach(initZoneChecker);
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'menu') initMenu();
  if (page === 'deals') initDeals();
  if (page === 'locations') initLocations();
  if (page === 'checkout') initCheckout();
  if (page === 'catering') initCatering();
  // Pizza art placeholders in the page: <div data-pizza="margherita"></div>
  $$('[data-pizza]').forEach((el) => { const it = findItem(el.getAttribute('data-pizza')); if (it) el.innerHTML = itemArt(it); });
  refreshAll();
  renderStatuses();
  setInterval(renderStatuses, 60000);
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
