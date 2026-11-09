/* Heatloop — thermal battery startup template. Vanilla JavaScript, no dependencies.
 *
 * Sections
 *  1. Settings and data           7. Technology: a day of charge and release
 *  2. Helpers and storage         8. Savings and carbon estimator
 *  3. Maine time and demo dates  9. Reserve: three-step reservation
 *  4. Theme, menu, reveal, top   10. Careers: filters, saved roles, role dialog
 *  5. Rolling dates and years    11. News: topic filter and coming-up events
 *  6. Home: shift teaser         12. Company: portraits   13. Forms
 *
 * Every date uses the company's clock (America/New_York, Eastern time), not the visitor's.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Settings and data. Edit these to make the template yours.
   * ------------------------------------------------------------------ */
  var TIME_ZONE = 'America/New_York';

  // Demo dates. While KEEP_DEMO_CURRENT is true, every dated thing written for DEMO_ANCHOR (news posts,
  // milestone years, the reservation count) moves forward by the whole weeks elapsed since that day, so
  // the demo never looks abandoned. On DEMO_ANCHOR itself nothing moves. Set it to false for a real site.
  var KEEP_DEMO_CURRENT = true;
  var DEMO_ANCHOR = '2026-10-27';

  // The three models. capacity: kWh of heat stored; power: kW charging element; price: indicative US dollars,
  // installed, not counting any rebate or tax credit. Used by the shift teaser, the technology diagram, the estimator and Reserve.
  var MODELS = {
    hl18: { name: 'Heatloop 18', capacity: 18, power: 5, price: 8900, fits: 'Apartments and small homes' },
    hl28: { name: 'Heatloop 28', capacity: 28, power: 7, price: 11500, fits: 'Most mid-size homes' },
    hl40: { name: 'Heatloop 40', capacity: 40, power: 9, price: 14500, fits: 'Large homes' }
  };
  var MODEL_ORDER = ['hl18', 'hl28', 'hl40'];

  // Home teaser: share of a day's heat that is used during the cheap hours anyway (night-time demand).
  var NIGHT_SHARE = 0.12;

  // An illustrative time-of-use rate plan, cents per kWh, by time band ('HH:MM', Eastern time).
  // Sample numbers for the demo, not any utility's rates.
  var TARIFF_BANDS = [
    { from: '00:00', to: '07:00', p: 13 },
    { from: '07:00', to: '12:00', p: 28 },
    { from: '12:00', to: '16:00', p: 20 },
    { from: '16:00', to: '20:00', p: 40 },
    { from: '20:00', to: '23:00', p: 28 },
    { from: '23:00', to: '24:00', p: 13 }
  ];
  var CHARGE_BELOW = 13;     // charge flat out when the price is at or below this (cents/kWh)
  var TOPUP_BELOW = 20;      // top up when the price is at or below this...
  var TOPUP_TARGET = 0.85;    // ...until the store is this full (share of capacity)
  // Heat a home uses through a cold day, as relative weights for each hour (0 = midnight).
  var DEMAND_WEIGHTS = [0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 1.6, 2.4, 1.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 0.8, 1.6, 2.4, 2.6, 2.4, 2.0, 1.6, 1.0, 0.6];
  var DAY_HEAT = 90;         // kWh of heat on the technology page's cold day

  // Estimator. heat: kWh of heat a year (space heating and hot water) before the regional factor.
  var HOMES = {
    apartment: { label: 'Apartment, under 1,000 sq ft', heat: 9000, model: 'hl18' },
    small: { label: 'Small home, 1,000-1,500 sq ft', heat: 15000, model: 'hl18' },
    midsize: { label: 'Mid-size home, 1,500-2,500 sq ft', heat: 22000, model: 'hl28' },
    large: { label: 'Large home, over 2,500 sq ft', heat: 32000, model: 'hl40' }
  };
  // Sample prices, labeled as estimates on the page. price: US dollars per unit; unit: how the fuel is sold;
  // kwhPerUnit: kWh in one unit; eff: heat out per kWh in; co2: lb CO2e per kWh in.
  var HEATING = {
    gas: { label: 'Natural gas boiler', price: 1.75, unit: 'therm', kwhPerUnit: 29.3, eff: 0.85, co2: 0.399 },
    oil: { label: 'Oil boiler', price: 5.75, unit: 'gallon', kwhPerUnit: 40.6, eff: 0.85, co2: 0.552 },
    propane: { label: 'Propane boiler', price: 3.5, unit: 'gallon', kwhPerUnit: 26.8, eff: 0.85, co2: 0.47 },
    storage: { label: 'Electric thermal storage heaters', price: 0.2, unit: 'kWh', kwhPerUnit: 1, eff: 0.9, co2: 0.57 },
    electric: { label: 'Electric baseboard or panel heaters', price: 0.28, unit: 'kWh', kwhPerUnit: 1, eff: 1, co2: 0.58 }
  };
  // Rate plans for running a Heatloop, in cents per kWh. shift: share of its electricity bought at the off-peak price.
  var TARIFFS = {
    tou: { label: 'Time-of-use rate', off: 13, peak: 28, shift: 0.85 },
    offpeak: { label: 'Off-peak heating rate', off: 15, peak: 30, shift: 0.75 },
    single: { label: 'Standard flat rate', off: 28, peak: 28, shift: 0 }
  };
  // climate: multiplies a home's heat use for colder or milder regions.
  var REGIONS = {
    eastern: { label: 'Bangor and eastern Maine', climate: 1 },
    northern: { label: 'Northern Maine', climate: 1.15 },
    central: { label: 'Central Maine', climate: 0.98 },
    western: { label: 'Western Maine mountains', climate: 1.08 },
    midcoast: { label: 'Midcoast and Downeast', climate: 0.93 },
    southern: { label: 'Southern Maine and coastal New Hampshire', climate: 0.9 }
  };
  var HEATLOOP_EFF = 0.95;                 // heat delivered per kWh of electricity, store losses included
  var GRID_CO2 = { off: 0.55, peak: 0.6 }; // lb CO2e per kWh, illustrative New England grid figures
  var ESTIMATE_DEFAULTS = { size: 'midsize', heat: 'oil', tariff: 'tou', region: 'eastern' };

  // Reservations. ZIP codes we install in now, and the ones coming next.
  var COVERAGE = {
    '04401': 'Bangor, Hermon, Veazie and Glenburn', '04412': 'Brewer', '04473': 'Orono',
    '04429': 'Holden and Dedham', '04427': 'Corinth', '04419': 'Carmel',
    '04428': 'Eddington and Clifton', '04450': 'Kenduskeag', '04456': 'Levant',
    '04461': 'Milford', '04474': 'Orrington', '04489': 'Stillwater'
  };
  var COMING_NEXT = { '04605': 'Ellsworth', '04416': 'Bucksport', '04953': 'Newport' };
  var RESERVATIONS_AT_ANCHOR = 2140;   // reservations so far on DEMO_ANCHOR
  var RESERVATIONS_PER_WEEK = 26;      // how fast the count grows while KEEP_DEMO_CURRENT is true
  var SURVEY_LEAD_MONTHS = 3;          // covered ZIP codes: first home assessments from this many months ahead

  // Careers. team and location keys must exist in TEAMS and LOCATIONS; mode: onsite | hybrid | remote.
  var TEAMS = { engineering: 'Engineering', manufacturing: 'Manufacturing', installs: 'Installations', operations: 'Operations', commercial: 'Commercial' };
  var LOCATIONS = { bangor: 'Bangor office', hermon: 'Hermon workshop', field: 'Penobscot County, on the road', remote: 'Remote, US' };
  var MODES = { onsite: 'On site', hybrid: 'Hybrid', remote: 'Remote' };
  var ROLES = [
    { id: 'thermal-engineer', title: 'Senior Thermal Engineer', team: 'engineering', location: 'bangor', mode: 'hybrid', salary: '$105,000–$130,000',
      summary: 'Own the design of the phase-change store, from cell geometry to the heat exchanger.',
      do: ['Model charge and discharge for new store sizes', 'Run cell cycling and calorimetry tests in the lab', 'Work with manufacturing on tolerances and sealing'],
      bring: ['Heat transfer or thermal storage experience in industry or research', 'Comfort with test rigs as well as simulation', 'Clear writing about trade-offs'] },
    { id: 'firmware-engineer', title: 'Embedded Firmware Engineer', team: 'engineering', location: 'bangor', mode: 'hybrid', salary: '$95,000–$120,000',
      summary: 'Write the code that decides when to charge, how hot to run and when to call for help.',
      do: ['Develop controller firmware in C on ARM microcontrollers', 'Build safe over-the-air updates', 'Instrument the field fleet so we learn from every home'],
      bring: ['Shipped embedded products', 'Experience with safety interlocks or power electronics', 'Interest in electricity rate plans'] },
    { id: 'controls-data', title: 'Controls and Data Scientist', team: 'engineering', location: 'remote', mode: 'remote', salary: '$95,000–$120,000',
      summary: 'Turn half-hourly prices, weather and household habits into better charging schedules.',
      do: ['Forecast each home’s heat demand a day ahead', 'Design schedules that respect comfort first', 'Publish what we learn in our research notes'],
      bring: ['Time-series forecasting or optimization experience', 'Python and SQL', 'A skeptical eye for your own results'] },
    { id: 'manufacturing-engineer', title: 'Manufacturing Engineer', team: 'manufacturing', location: 'hermon', mode: 'onsite', salary: '$78,000–$95,000',
      summary: 'Take the production line in Hermon from twenty units a week to a hundred.',
      do: ['Design jigs, fixtures and work instructions', 'Run time studies and remove bottlenecks', 'Bring new suppliers up to standard'],
      bring: ['Manufacturing or process engineering background', 'Lean or similar methods, used sensibly', 'Hands that like a wrench'] },
    { id: 'production-technician', title: 'Production Technician (two roles)', team: 'manufacturing', location: 'hermon', mode: 'onsite', salary: '$45,000–$55,000',
      summary: 'Build, fill, seal and test Heatloop stores on our line in Hermon.',
      do: ['Assemble stores to work instructions', 'Run pressure and electrical end-of-line tests', 'Suggest improvements to the line'],
      bring: ['Experience in assembly, fabrication or a trade', 'Care with detail and with paperwork', 'Day shifts, Monday to Friday'] },
    { id: 'quality-lead', title: 'Quality Lead', team: 'manufacturing', location: 'hermon', mode: 'onsite', salary: '$80,000–$98,000',
      summary: 'Set up the quality system that every unit leaving Hermon goes through.',
      do: ['Own incoming, in-process and final inspection', 'Lead root-cause work on field returns', 'Prepare for product certification audits'],
      bring: ['Quality engineering in a regulated product', 'ISO 9001 experience', 'Calm under audit'] },
    { id: 'heating-engineer', title: 'Heating Technician, Installs', team: 'installs', location: 'field', mode: 'onsite', salary: '$60,000–$78,000 plus company truck',
      summary: 'Fit Heatloops in homes around Bangor and leave every customer confident with it.',
      do: ['Install and commission units on hot-water heating systems', 'Remove old boilers and tidy up after', 'Show customers how their Heatloop works'],
      bring: ['Experienced heating technician who knows hot-water systems', 'A plumbing or heating license, or working toward one', 'A valid driver’s license'] },
    { id: 'surveyor', title: 'Home Energy Assessor and Install Planner', team: 'installs', location: 'bangor', mode: 'hybrid', salary: '$58,000–$70,000',
      summary: 'Visit homes, size the right model and plan each install day.',
      do: ['Assess homes and heating systems', 'Recommend a model and explain why', 'Plan routes and parts for the install teams'],
      bring: ['Home energy, retrofit or heating background', 'Friendly and clear with homeowners', 'A valid driver’s license'] },
    { id: 'customer-success', title: 'Customer Success Lead', team: 'operations', location: 'remote', mode: 'remote', salary: '$68,000–$82,000',
      summary: 'Look after every household from reservation to its first winter, and after.',
      do: ['Build our support processes and help center', 'Spot patterns in questions and feed them to product', 'Handle tricky cases yourself'],
      bring: ['Customer support leadership at a hardware or energy company', 'Patience and warmth', 'Good with simple data'] },
    { id: 'partnerships', title: 'Partnerships Manager, Housing', team: 'commercial', location: 'bangor', mode: 'hybrid', salary: '$85,000–$100,000 plus bonus',
      summary: 'Bring Heatloop to housing authorities and nonprofit landlords across Maine.',
      do: ['Run pilots with affordable-housing owners', 'Build business cases with their asset teams', 'Represent Heatloop at sector events'],
      bring: ['Experience selling to or working in affordable housing', 'Understanding of weatherization and retrofit funding', 'Patience with long decisions'] },
    { id: 'product-designer', title: 'Product Designer', team: 'commercial', location: 'remote', mode: 'remote', salary: '$80,000–$100,000',
      summary: 'Design the app, the display on the unit and the reservation journey.',
      do: ['Research with pilot households', 'Design and test the Heatloop app', 'Keep our web and print materials consistent'],
      bring: ['A portfolio of shipped product design', 'Interest in physical products and energy', 'Comfort with accessibility'] }
  ];

  // Coming-up events: rules, so the list is always in the future. weekday: 0 = Sunday;
  // nth: 1-4 for the first to fourth weekday of the month, -1 for the last.
  var EVENT_RULES = [
    { id: 'open-morning', title: 'Open house at the Hermon workshop', weekday: 6, nth: 1, time: '10:00', end: '12:30', where: 'Coldbrook Road, Hermon', text: 'See stores being built, look inside a cutaway and ask the engineers anything. Children welcome.' },
    { id: 'webinar', title: 'Online: is a heat battery right for my home?', weekday: 3, nth: 2, time: '19:00', end: '20:00', where: 'Online', text: 'A forty-minute talk on how Heatloop works, what a home assessment involves and how to read your own estimate, with questions at the end.' },
    { id: 'installers', title: 'Installer partner evening', weekday: 4, nth: -1, time: '18:00', end: '20:00', where: 'Exchange Street office, Bangor', text: 'For heating technicians interested in fitting Heatloops: product training, commissioning and how partner work is paid.' }
  ];
  var EVENTS_SHOWN = 3;

  var CONTACT_TYPES = { homeowner: 'Homeowner', installer: 'Installer partner', housing: 'Housing and landlords', press: 'Press', investor: 'Investors', careers: 'Careers', other: 'Something else' };
  var CONTACT_REPLY = { homeowner: 'our customer team', installer: 'our installs team', housing: 'our partnerships team', press: 'our press office', investor: 'Margot Thibodeau’s office', careers: 'our hiring team', other: 'our team' };

  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Saved data (localStorage keys).
  var THEME_KEY = 'heatloop:theme';
  var RESERVATION_KEY = 'heatloop:reservation';
  var SAVED_ROLES_KEY = 'heatloop:saved-roles';

  /* ------------------------------------------------------------------
   * 2. Helpers and storage
   * ------------------------------------------------------------------ */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var has = function (obj, key) { return typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function groupThousands(s) { return s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function money(n) { return '$' + groupThousands(String(Math.round(n))); }
  function num(n, digits) { return groupThousands(n.toFixed(digits || 0)); }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function announce(msg) { var r = $('#live-region'); if (r) { r.textContent = ''; setTimeout(function () { r.textContent = msg; }, 30); } }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function refCode(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 4; i++) s += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + s;
  }

  // localStorage, or an in-memory stand-in when storage is blocked (sandboxed iframes, strict privacy).
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
  function readJSON(key) { try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; } }
  function writeJSON(key, value) {
    try {
      if (value === null) safeStorage.removeItem(key);
      else safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage full: the page keeps working without it */ }
  }

  /* ------------------------------------------------------------------
   * 3. Maine time and demo dates (londonParts keeps its old name; it reads TIME_ZONE). Calendar dates are 'YYYY-MM-DD' strings and day numbers
   *    (days since 1970-01-01), so daylight saving never shifts them.
   * ------------------------------------------------------------------ */
  var londonParts = (function () {
    var fmt;
    try { fmt = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }); } catch (e) { fmt = null; }
    return function (date) {
      if (!fmt) return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate(), hh: date.getHours(), mm: date.getMinutes() };
      var out = {};
      fmt.formatToParts(date).forEach(function (p) { out[p.type] = p.value; });
      return { y: +out.year, m: +out.month, d: +out.day, hh: +out.hour % 24, mm: +out.minute };
    };
  })();
  function dayNumber(iso) { var p = iso.split('-'); return Math.round(Date.UTC(+p[0], +p[1] - 1, +p[2]) / 864e5); }
  function isoOf(day) { var d = new Date(day * 864e5); return d.getUTCFullYear() + '-' + pad(d.getUTCMonth() + 1) + '-' + pad(d.getUTCDate()); }
  function weekdayOf(day) { return (day + 4) % 7; } // 1970-01-01 was a Thursday
  function today() {
    var p = londonParts(new Date());
    var iso = p.y + '-' + pad(p.m) + '-' + pad(p.d);
    return { iso: iso, day: dayNumber(iso), y: p.y, m: p.m, minutes: p.hh * 60 + p.mm };
  }
  function longDate(iso) { var p = iso.split('-'); return MONTHS[+p[1] - 1] + ' ' + +p[2] + ', ' + p[0]; }
  function shortDay(iso) { var day = dayNumber(iso); var p = iso.split('-'); return WEEKDAYS[weekdayOf(day)].slice(0, 3) + ', ' + MONTHS[+p[1] - 1].slice(0, 3) + ' ' + +p[2]; }
  // 'HH:MM' on the 24-hour clock to the 12-hour clock used in copy: '17:30' to '5:30 PM'.
  function clock12(hhmm) { var p = hhmm.split(':'), h = +p[0] % 24; return (h % 12 || 12) + ':' + p[1] + (h < 12 ? ' AM' : ' PM'); }

  var NOW = today();
  // Whole weeks since DEMO_ANCHOR (0 on the anchor day, and always 0 when KEEP_DEMO_CURRENT is false).
  var SHIFT_WEEKS = KEEP_DEMO_CURRENT ? Math.max(0, Math.floor((NOW.day - dayNumber(DEMO_ANCHOR)) / 7)) : 0;
  var SHIFT_YEARS = Math.floor(SHIFT_WEEKS * 7 / 365.25);
  function shiftIso(iso) { return isoOf(dayNumber(iso) + SHIFT_WEEKS * 7); }

  /* ------------------------------------------------------------------
   * 4. Theme, mobile menu, scroll reveal, back to top
   * ------------------------------------------------------------------ */
  function initTheme() {
    var root = document.documentElement;
    function sync() {
      var dark = root.classList.contains('dark');
      $$('[data-theme-toggle]').forEach(function (b) { b.setAttribute('aria-pressed', dark ? 'true' : 'false'); });
    }
    $$('[data-theme-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var dark = !root.classList.contains('dark');
        root.classList.toggle('dark', dark);
        try { safeStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch (e) { /* ignore */ }
        sync();
        announce(dark ? 'Dark theme on' : 'Light theme on');
      });
    });
    // When storage is blocked, the head script couldn't read a saved choice: keep the in-memory one.
    var saved = safeStorage.getItem(THEME_KEY);
    if (saved === 'dark' || saved === 'light') root.classList.toggle('dark', saved === 'dark');
    sync();
  }

  function initMenu() {
    var btn = $('#menu-toggle'), menu = $('#mobile-menu');
    if (!btn || !menu) return;
    function set(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      menu.hidden = !open;
      document.body.classList.toggle('menu-open', open);
      $('[data-icon-open]', btn).classList.toggle('hidden', open);
      $('[data-icon-close]', btn).classList.toggle('hidden', !open);
    }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) set(false); });
  }

  function initReveal() {
    var items = $$('.reveal');
    if (!('IntersectionObserver' in window) || reduceMotion) { items.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Reveal this item and everything above it, so fast jumps never leave hidden content behind.
        var top = entry.target.getBoundingClientRect().top;
        items.forEach(function (el) { if (el.getBoundingClientRect().top <= top + 1) { el.classList.add('is-visible'); io.unobserve(el); } });
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  function initBackToTop() {
    var main = $('#main');
    if (!main) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);
    main.classList.add('back-to-top-target');
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      main.focus({ preventScroll: true });
    });
    var onScroll = function () { btn.classList.toggle('is-visible', window.scrollY > 900); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ------------------------------------------------------------------
   * 5. Rolling dates and years (see KEEP_DEMO_CURRENT)
   * ------------------------------------------------------------------ */
  function initDates() {
    $$('[data-year]').forEach(function (el) { el.textContent = String(NOW.y); });
    $$('[data-shift-year]').forEach(function (el) {
      var y = parseInt(el.getAttribute('data-shift-year'), 10);
      if (!isNaN(y)) el.textContent = String(y + SHIFT_YEARS);
    });
    $$('time[data-news-date]').forEach(function (el) {
      var iso = el.getAttribute('data-news-date');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
      var shifted = shiftIso(iso);
      el.setAttribute('datetime', shifted);
      el.textContent = longDate(shifted);
    });
    $$('[data-reservations]').forEach(function (el) { el.textContent = num(RESERVATIONS_AT_ANCHOR + SHIFT_WEEKS * RESERVATIONS_PER_WEEK); });
    // Pages that know a reservation exists change their call to action.
    var saved = loadReservation();
    if (saved) {
      $$('[data-reserve-cta]').forEach(function (a) { a.textContent = a.classList.contains('btn-sm') ? 'Your place' : 'View your reservation'; });
      var t = $('[data-cta-title]'), x = $('[data-cta-text]');
      if (t) t.textContent = 'You’re number ' + num(saved.place) + ' in the queue.';
      if (x) x.textContent = 'Reference ' + saved.ref + ' for a ' + MODELS[saved.model].name + ' in ' + saved.district + '. We’ll be in touch before your home assessment.';
    }
  }

  /* ------------------------------------------------------------------
   * 6. Home: how much could you shift?
   * ------------------------------------------------------------------ */
  function shiftEstimate(modelKey, need) {
    var cap = MODELS[modelKey].capacity;
    var cheap = Math.min(need, need * NIGHT_SHARE + cap);
    return { cheap: cheap, day: need - cheap, pct: Math.round(cheap / need * 100) };
  }
  function initShift() {
    var root = $('[data-shift]');
    if (!root) return;
    var model = 'hl28', range = $('[data-shift-need]', root);
    function render() {
      var need = parseInt(range.value, 10) || 90;
      var r = shiftEstimate(model, need);
      $('[data-shift-need-out]').textContent = need + ' kWh';
      $('[data-shift-pct]').textContent = String(r.pct);
      $('[data-shift-summary]').textContent = 'of a ' + need + ' kWh day’s heat could be bought at the cheap rate: ' + r.cheap.toFixed(1) + ' kWh, with ' + r.day.toFixed(1) + ' kWh at the day rate.';
      $('[data-shift-fill]').setAttribute('width', String(Math.round(480 * r.cheap / need)));
    }
    $$('[data-shift-model]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        model = btn.getAttribute('data-shift-model');
        $$('[data-shift-model]', root).forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        render();
      });
    });
    range.addEventListener('input', render);
    render();
  }

  /* ------------------------------------------------------------------
   * 7. Technology: a day of charging and releasing over the rate plan
   * ------------------------------------------------------------------ */
  function minutesOf(hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }
  function priceAt(slot) { // slot: half-hour index 0-47
    var m = slot * 30;
    for (var i = 0; i < TARIFF_BANDS.length; i++) if (m >= minutesOf(TARIFF_BANDS[i].from) && m < minutesOf(TARIFF_BANDS[i].to)) return TARIFF_BANDS[i].p;
    return TARIFF_BANDS[TARIFF_BANDS.length - 1].p;
  }
  // Simulates one day in half-hour slots. Runs twice so the store starts the day as it ended the last.
  function simulateDay(modelKey, dayHeat) {
    var m = MODELS[modelKey], cap = m.capacity, perSlot = m.power / 2;
    var total = DEMAND_WEIGHTS.reduce(function (a, b) { return a + b; }, 0);
    var soc = cap * 0.3, slots = [];
    for (var pass = 0; pass < 2; pass++) {
      slots = [];
      for (var s = 0; s < 48; s++) {
        var price = priceAt(s), demand = dayHeat * DEMAND_WEIGHTS[Math.floor(s / 2)] / total / 2;
        var mode, charged = 0, fromStore = 0, direct = 0;
        if (price <= CHARGE_BELOW && soc < cap) { mode = 'charge'; charged = Math.min(perSlot, cap - soc); direct = demand; }
        else if (price <= TOPUP_BELOW && soc < cap * TOPUP_TARGET) { mode = 'topup'; charged = Math.min(perSlot, cap * TOPUP_TARGET - soc); direct = demand; }
        else if (price <= CHARGE_BELOW) { mode = 'hold'; direct = demand; }
        else { fromStore = Math.min(demand, soc); direct = demand - fromStore; mode = direct > 0.001 ? 'backup' : 'release'; }
        soc = soc + charged - fromStore;
        slots.push({ slot: s, price: price, demand: demand, charged: charged, fromStore: fromStore, direct: direct, mode: mode, soc: soc, pct: Math.round(soc / cap * 100) });
      }
    }
    var bought = 0, cheapBought = 0, cost = 0;
    slots.forEach(function (x) {
      var kwh = x.charged + x.direct;
      bought += kwh; cost += kwh * x.price;
      if (x.price <= CHARGE_BELOW) cheapBought += kwh;
    });
    return { slots: slots, bought: bought, cheapShare: Math.round(cheapBought / bought * 100), cost: cost / 100, cap: cap };
  }
  var MODE_TEXT = {
    charge: ['Charging', 'Cheap rate: the element is on and the cells are melting.'],
    topup: ['Topping up', 'Midday shoulder rate: topping the store up before the evening peak.'],
    hold: ['Holding', 'Full and holding: heat for the home still comes straight from the cheap rate.'],
    release: ['Releasing', 'Peak or day rate: the radiators and faucets are fed from the store.'],
    backup: ['Backup', 'The store is running low, so some heat comes straight from the grid.']
  };
  function slotTime(s) { return clock12(pad(Math.floor(s / 2)) + ':' + (s % 2 ? '30' : '00')); }

  function initDayChart() {
    var root = $('[data-day]');
    if (!root) return;
    var svgHost = $('[data-day-chart]', root), range = $('[data-day-time]', root), play = $('[data-day-play]', root);
    var model = 'hl28', sim = null, timer = null;
    // The chart is drawn narrower on small screens so its labels stay readable.
    var W, H = 300, L, R = 26, T = 18, priceH = 70, gap = 26, socTop = T + priceH + gap, socH = H - socTop - 28, FS, HOUR_STEP;
    function size() { var narrow = svgHost.clientWidth < 560; W = narrow ? 430 : 720; L = narrow ? 50 : 44; FS = narrow ? 15 : 11; HOUR_STEP = narrow ? 6 : 3; return narrow; }
    var tick = function (x0, y0, anchor, label) { return '<text x="' + x0 + '" y="' + y0 + '" text-anchor="' + anchor + '" font-family="Source Code Pro, monospace" font-size="' + FS + '" fill="currentColor" opacity=".8">' + label + '</text>'; };
    var x = function (s) { return L + (W - L - R) * s / 48; };
    var py = function (p) { return T + priceH - priceH * p / 42; };
    var sy = function (pct) { return socTop + socH - socH * pct / 100; };

    function draw() {
      size();
      sim = simulateDay(model, DAY_HEAT);
      var out = [];
      out.push('<title id="day-chart-title">Electricity price and the store’s state of charge over 24 hours for the ' + MODELS[model].name + '</title>');
      // cheap windows
      var runStart = -1;
      sim.slots.concat([{ slot: 48, price: Infinity }]).forEach(function (d) {
        var cheap = d.price <= CHARGE_BELOW;
        if (cheap && runStart < 0) runStart = d.slot;
        if (!cheap && runStart >= 0) { out.push('<rect x="' + x(runStart) + '" y="' + T + '" width="' + (x(d.slot) - x(runStart)) + '" height="' + (H - T - 28) + '" fill="var(--forest)" opacity=".08"/>'); runStart = -1; }
      });
      // grid and axes
      [0, 50, 100].forEach(function (p) { out.push('<path d="M' + L + ' ' + sy(p) + 'H' + (W - R) + '" stroke="var(--rule)" stroke-width="1"/>' + tick(L - 8, sy(p) + 4, 'end', p + '%')); });
      [25, 75].forEach(function (p) { out.push('<path d="M' + L + ' ' + sy(p) + 'H' + (W - R) + '" stroke="var(--rule)" stroke-width="1"/>'); });
      [0, 40].forEach(function (p) { out.push(tick(L - 8, py(p) + 4, 'end', p + '¢')); });
      out.push('<path d="M' + L + ' ' + (T + priceH) + 'H' + (W - R) + '" stroke="currentColor" stroke-width="1" opacity=".5"/>');
      for (var h = 0; h <= 24; h += HOUR_STEP) out.push('<path d="M' + x(h * 2) + ' ' + (H - 28) + 'v5" stroke="currentColor" opacity=".6"/>' + tick(x(h * 2), H - 8, 'middle', ((h % 12) || 12) + (h % 24 < 12 ? ' AM' : ' PM')));
      // price step line
      var pd = '';
      sim.slots.forEach(function (d, i) { pd += (i ? 'H' + x(d.slot) + 'V' : 'M' + x(0) + ' ') + py(d.price); });
      pd += 'H' + x(48);
      out.push('<path d="' + pd + '" fill="none" stroke="var(--ochre)" stroke-width="2.2"/>');
      // state of charge area (end of each slot)
      var sd = 'M' + x(0) + ' ' + sy(sim.slots[47].pct);
      sim.slots.forEach(function (d) { sd += 'L' + x(d.slot + 1) + ' ' + sy(d.soc / sim.cap * 100); });
      out.push('<path d="' + sd + 'V' + sy(0) + 'H' + x(0) + 'Z" fill="var(--forest)" opacity=".16"/>');
      out.push('<path d="' + sd + '" fill="none" stroke="var(--forest)" stroke-width="2.2"/>');
      out.push(tick(L + 6, T - 4, 'start', 'RATE, ¢/KWH'));
      out.push(tick(L + 6, socTop - 6, 'start', 'STATE OF CHARGE'));
      out.push('<g data-cursor><path d="" stroke="currentColor" stroke-width="1" stroke-dasharray="3 3"/><circle r="5" fill="var(--forest)"/><circle r="5" fill="var(--forest)" class="pulse"/><circle r="4" fill="var(--ochre)"/></g>');
      svgHost.innerHTML = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="h-auto w-full text-ink" role="img" aria-labelledby="day-chart-title">' + out.join('') + '</svg>';
      $('[data-day-summary]', root).textContent = 'Over this cold day the ' + MODELS[model].name + ' buys ' + sim.bought.toFixed(1) + ' kWh, ' + sim.cheapShare + '% of it at the cheap rate, for about ' + money(sim.cost) + ' on this rate plan.';
      update();
    }
    function update() {
      var s = parseInt(range.value, 10) || 0;
      var d = sim.slots[s], cx = x(s + 0.5), pct = Math.round(d.soc / sim.cap * 100);
      var g = $('[data-cursor]', svgHost);
      $('path', g).setAttribute('d', 'M' + cx + ' ' + T + 'V' + (H - 28));
      $$('circle', g).forEach(function (c, i) { c.setAttribute('cx', cx); c.setAttribute('cy', i < 2 ? sy(pct) : py(d.price)); });
      var mt = MODE_TEXT[d.mode];
      $('[data-day-out="time"]', root).textContent = slotTime(s) + '–' + slotTime((s + 1) % 48);
      $('[data-day-out="price"]', root).textContent = d.price + '¢ / kWh';
      $('[data-day-out="mode"]', root).textContent = mt[0];
      $('[data-day-out="mode-text"]', root).textContent = mt[1];
      $('[data-day-out="soc"]', root).textContent = pct + '% · ' + d.soc.toFixed(1) + ' kWh';
      $('[data-day-out="heat"]', root).textContent = d.demand.toFixed(2) + ' kWh';
      range.setAttribute('aria-valuetext', slotTime(s) + ', ' + d.price + ' cents, ' + mt[0] + ', ' + pct + '% charged');
      $('[data-day-time-out]', root).textContent = slotTime(s);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } play.setAttribute('aria-pressed', 'false'); $('[data-day-play-label]', play).textContent = 'Play the day'; }
    play.addEventListener('click', function () {
      if (timer) { stop(); return; }
      play.setAttribute('aria-pressed', 'true');
      $('[data-day-play-label]', play).textContent = 'Pause';
      timer = setInterval(function () {
        var s = (parseInt(range.value, 10) + 1) % 48;
        range.value = String(s); update();
        if (s === 47) stop();
      }, reduceMotion ? 600 : 260);
    });
    range.addEventListener('input', function () { stop(); update(); });
    $$('[data-day-model]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        model = btn.getAttribute('data-day-model');
        $$('[data-day-model]', root).forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
        draw();
      });
    });
    var lastNarrow = null;
    window.addEventListener('resize', function () { var n = svgHost.clientWidth < 560; if (lastNarrow !== null && n !== lastNarrow) draw(); lastNarrow = n; });
    draw();
    lastNarrow = svgHost.clientWidth < 560;
  }

  /* ------------------------------------------------------------------
   * 8. Savings and carbon estimator (inputs kept in the URL)
   * ------------------------------------------------------------------ */
  function estimate(o) {
    var home = HOMES[o.size], cur = HEATING[o.heat], tar = TARIFFS[o.tariff], reg = REGIONS[o.region];
    var heat = home.heat * reg.climate;
    var curIn = heat / cur.eff;
    var curUnits = curIn / cur.kwhPerUnit;
    var curCost = curUnits * cur.price;
    var curCo2 = curIn * cur.co2;
    var hlIn = heat / HEATLOOP_EFF;
    var hlPrice = tar.shift * tar.off + (1 - tar.shift) * tar.peak;
    var hlCost = hlIn * hlPrice / 100;
    var hlCo2 = hlIn * (tar.shift * GRID_CO2.off + (1 - tar.shift) * GRID_CO2.peak);
    return { heat: heat, curIn: curIn, curUnits: curUnits, curCost: curCost, curCo2: curCo2, hlIn: hlIn, hlPrice: hlPrice, hlCost: hlCost, hlCo2: hlCo2, model: home.model,
      saving: curCost - hlCost, co2Saving: curCo2 - hlCo2, co2Pct: Math.round((curCo2 - hlCo2) / curCo2 * 100) };
  }
  function readEstimateParams() {
    var q = new URLSearchParams(window.location.search), o = {};
    var maps = { size: HOMES, heat: HEATING, tariff: TARIFFS, region: REGIONS };
    Object.keys(maps).forEach(function (k) { var v = q.get(k); o[k] = has(maps[k], v) ? v : ESTIMATE_DEFAULTS[k]; });
    return o;
  }
  function initEstimator() {
    var form = $('[data-estimator]');
    if (!form) return;
    var o = readEstimateParams();
    $$('input[type="radio"]', form).forEach(function (r) { r.checked = o[r.name] === r.value; });
    $$('select', form).forEach(function (s) { s.value = o[s.name]; });
    function tonnes(lb) { return (lb / 2000).toFixed(1) + ' tons'; } // US short tons from pounds
    function render() {
      $$('input[type="radio"]:checked, select', form).forEach(function (el) { if (has(ESTIMATE_DEFAULTS, el.name)) o[el.name] = el.value; });
      var r = estimate(o), out = function (k) { return $('[data-est="' + k + '"]'); };
      out('cur-cost').textContent = money(r.curCost);
      out('hl-cost').textContent = money(r.hlCost);
      out('cur-co2').textContent = tonnes(r.curCo2);
      out('hl-co2').textContent = tonnes(r.hlCo2);
      out('cur-label').textContent = HEATING[o.heat].label;
      var diff = Math.round(r.saving);
      out('saving').textContent = Math.abs(diff) < 1 ? 'About the same' : money(Math.abs(diff)) + (diff > 0 ? ' less a year' : ' more a year');
      out('saving-note').textContent = diff >= 0
        ? 'Estimated yearly running cost with a Heatloop compared with your ' + HEATING[o.heat].label.toLowerCase() + '.'
        : 'On these prices a Heatloop is estimated to cost more to run than your ' + HEATING[o.heat].label.toLowerCase() + '. The carbon saving below may still matter to you; a cheaper off-peak rate narrows the gap.';
      out('co2-saving').textContent = Math.abs(r.co2Saving) < 100 ? 'About the same CO₂e' : r.co2Saving > 0 ? tonnes(r.co2Saving) + ' less CO₂e (' + r.co2Pct + '%)' : tonnes(-r.co2Saving) + ' more CO₂e';
      out('model').textContent = MODELS[r.model].name;
      out('model-link').setAttribute('href', 'reserve.html?model=' + r.model);
      // bars
      var maxCost = Math.max(r.curCost, r.hlCost), maxCo2 = Math.max(r.curCo2, r.hlCo2);
      out('bar-cur-cost').setAttribute('width', String(Math.round(300 * r.curCost / maxCost)));
      out('bar-hl-cost').setAttribute('width', String(Math.round(300 * r.hlCost / maxCost)));
      out('bar-cur-co2').setAttribute('width', String(Math.round(300 * r.curCo2 / maxCo2)));
      out('bar-hl-co2').setAttribute('width', String(Math.round(300 * r.hlCo2 / maxCo2)));
      // the formula, with this estimate's numbers
      var h = HOMES[o.size], reg = REGIONS[o.region], cur = HEATING[o.heat], tar = TARIFFS[o.tariff];
      out('f-heat').textContent = num(h.heat) + ' kWh × ' + reg.climate.toFixed(2) + ' (' + reg.label + ') = ' + num(r.heat) + ' kWh of heat a year';
      out('f-cur').textContent = num(r.heat) + ' ÷ ' + cur.eff.toFixed(2) + ' efficiency = ' + num(r.curIn) + ' kWh' + (cur.unit === 'kWh' ? ' × ' + (cur.price * 100).toFixed(1) + '¢' : ' ÷ ' + cur.kwhPerUnit.toFixed(1) + ' kWh per ' + cur.unit + ' = ' + num(r.curUnits) + ' ' + cur.unit + 's × $' + cur.price.toFixed(2)) + ' = ' + money(r.curCost) + '; ' + num(r.curIn) + ' kWh × ' + cur.co2.toFixed(3) + ' lb = ' + num(r.curCo2) + ' lb CO₂e';
      out('f-price').textContent = Math.round(tar.shift * 100) + '% × ' + tar.off.toFixed(1) + '¢ + ' + Math.round((1 - tar.shift) * 100) + '% × ' + tar.peak.toFixed(1) + '¢ = ' + r.hlPrice.toFixed(2) + '¢ per kWh';
      out('f-hl').textContent = num(r.heat) + ' ÷ ' + HEATLOOP_EFF.toFixed(2) + ' = ' + num(r.hlIn) + ' kWh × ' + r.hlPrice.toFixed(2) + '¢ = ' + money(r.hlCost) + '; carbon ' + num(r.hlCo2) + ' lb CO₂e';
      // keep the inputs in the URL so the result can be shared
      var url = window.location.pathname + '?size=' + o.size + '&heat=' + o.heat + '&tariff=' + o.tariff + '&region=' + o.region;
      try { window.history.replaceState(null, '', url); } catch (e) { /* file:// in some browsers */ }
      shareUrl = window.location.href;
    }
    var shareUrl = window.location.href;
    form.addEventListener('change', render);
    form.addEventListener('submit', function (e) { e.preventDefault(); render(); });
    var share = $('[data-est-share]'), status = $('[data-est-share-status]');
    if (share) share.addEventListener('click', function () {
      function done(msg) { status.textContent = msg; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl).then(function () { done('Link copied. Anyone who opens it sees this estimate.'); }, function () { done('Copy this link: ' + shareUrl); });
      } else done('Copy this link: ' + shareUrl);
    });
    render();
  }

  /* ------------------------------------------------------------------
   * 9. Reserve: model, ZIP code check, contact; saved for returning visitors
   * ------------------------------------------------------------------ */
  function districtOf(postcode) {
    // A US ZIP code: 5 digits, with an optional +4. The district is the 5-digit ZIP.
    var pc = String(postcode || '').replace(/\s+/g, '');
    if (!/^\d{5}(-\d{4})?$/.test(pc)) return null;
    return pc.slice(0, 5);
  }
  function formatPostcode(postcode) { return String(postcode).replace(/\s+/g, ''); }
  function surveyMonth() {
    var m = NOW.m - 1 + SURVEY_LEAD_MONTHS;
    return MONTHS[m % 12] + ' ' + (NOW.y + Math.floor(m / 12));
  }
  function coverageOf(district) {
    if (has(COVERAGE, district)) return { covered: true, area: COVERAGE[district] };
    if (has(COMING_NEXT, district)) return { covered: false, next: true, area: COMING_NEXT[district] };
    return { covered: false, next: false, area: '' };
  }
  // Reads the saved reservation and checks every field, so edited or old data can't break the page.
  function loadReservation() {
    var r = readJSON(RESERVATION_KEY);
    if (!r || typeof r !== 'object') return null;
    if (typeof r.ref !== 'string' || !/^HL-[A-Z0-9]{2,5}-[A-Z0-9]{4}$/.test(r.ref)) return null;
    if (!has(MODELS, r.model) || typeof r.postcode !== 'string' || !districtOf(r.postcode)) return null;
    if (typeof r.name !== 'string' || !r.name.trim() || typeof r.email !== 'string') return null;
    if (typeof r.place !== 'number' || !isFinite(r.place) || r.place < 1) return null;
    if (typeof r.created !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(r.created)) return null;
    r.district = districtOf(r.postcode);
    r.phone = typeof r.phone === 'string' ? r.phone : '';
    r.updates = r.updates === true;
    return r;
  }

  function initReserve() {
    var form = $('[data-reserve]');
    if (!form) return;
    var steps = $$('[data-step]', form), current = 0;
    var savedPanel = $('[data-reservation-saved]'), success = $('[data-reserve-success]');
    var editing = null;

    var q = new URLSearchParams(window.location.search).get('model');
    if (has(MODELS, q)) $('input[name="model"][value="' + q + '"]', form).checked = true;

    function showStep(i) {
      current = i;
      steps.forEach(function (s, n) { s.hidden = n !== i; });
      $$('[data-step-nav]').forEach(function (li, n) {
        li.setAttribute('data-step-state', n < i ? 'done' : (n === i ? 'current' : 'todo'));
        if (n === i) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      $('[data-step-count]').textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
    }
    function setError(input, msg) {
      var err = document.getElementById(input.getAttribute('aria-describedby').split(' ')[0]);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) err.textContent = msg || '';
      return !msg;
    }
    function checkPostcode(show) {
      var input = $('#res-postcode'), out = $('[data-postcode-result]');
      var d = districtOf(input.value);
      if (!input.value.trim()) { setError(input, 'Enter your ZIP code.'); out.hidden = true; return null; }
      if (!d) { setError(input, 'Enter a 5-digit ZIP code, like 04401.'); out.hidden = true; return null; }
      setError(input, '');
      var c = coverageOf(d);
      if (show) {
        out.hidden = false;
        out.setAttribute('data-covered', c.covered ? 'yes' : 'no');
        out.innerHTML = c.covered
          ? '<p class="font-serif text-xl">Good news: we install in ' + escapeHtml(d) + '.</p><p class="mt-1 text-muted">' + escapeHtml(c.area) + '. First home assessments for new reservations from ' + surveyMonth() + '.</p>'
          : (c.next
            ? '<p class="font-serif text-xl">' + escapeHtml(d) + ' is next on our list.</p><p class="mt-1 text-muted">We plan to reach ' + escapeHtml(c.area) + ' next. Reserve now and you keep your place in the queue.</p>'
            : '<p class="font-serif text-xl">We don’t install in ' + escapeHtml(d) + ' yet.</p><p class="mt-1 text-muted">You can still reserve. We’ll write to you when installs reach your area, and you won’t lose your place.</p>');
      }
      return { district: d, coverage: c };
    }
    function validateStep(i) {
      if (i === 0) {
        var picked = $('input[name="model"]:checked', form), err = $('#res-model-error');
        err.textContent = picked ? '' : 'Choose a model. Not sure? Pick the one for your home type; the home assessment confirms it.';
        return !!picked;
      }
      if (i === 1) return !!checkPostcode(true);
      var ok = true;
      var name = $('#res-name'), email = $('#res-email'), phone = $('#res-phone');
      ok = setError(name, name.value.trim() ? '' : 'Enter your name.') && ok;
      var em = email.value.trim();
      ok = setError(email, !em ? 'Enter your email address.' : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) ? '' : 'Enter an email address like name@example.com.')) && ok;
      var ph = phone.value.replace(/[\s().-]/g, '');
      ok = setError(phone, !ph || /^(\+?1)?[2-9]\d{9}$/.test(ph) ? '' : 'Enter a US phone number, or leave it blank.') && ok;
      return ok;
    }
    $$('[data-next]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        if (!validateStep(current)) { var bad = $('[aria-invalid="true"]', steps[current]); if (bad) bad.focus(); return; }
        showStep(current + 1);
        var h = $('legend', steps[current]); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
      });
    });
    $$('[data-back]', form).forEach(function (b) { b.addEventListener('click', function () { showStep(current - 1); $('legend', steps[current]).focus(); }); });
    $('[data-check-postcode]', form).addEventListener('click', function () { checkPostcode(true); });
    $('#res-postcode').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); checkPostcode(true); } });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (current < steps.length - 1) { $('[data-next]', steps[current]).click(); return; }
      if (!validateStep(2)) { var bad = $('[aria-invalid="true"]', form); if (bad) bad.focus(); return; }
      var pc = checkPostcode(false);
      // To connect a real backend, POST the form here (e.g. fetch('https://formspree.io/f/yourid',
      // { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })) and only
      // save and show the success state when it answers OK. See DOCS.md "Forms".
      var r = {
        ref: editing ? editing.ref : 'HL-' + pc.district.replace(/[^A-Z0-9]/g, '').slice(0, 5) + '-' + refCode('X').slice(2),
        model: $('input[name="model"]:checked', form).value,
        postcode: formatPostcode($('#res-postcode').value),
        name: $('#res-name').value.trim(),
        email: $('#res-email').value.trim(),
        phone: $('#res-phone').value.trim(),
        updates: $('#res-updates').checked,
        place: editing ? editing.place : RESERVATIONS_AT_ANCHOR + SHIFT_WEEKS * RESERVATIONS_PER_WEEK + 1,
        created: editing ? editing.created : NOW.iso
      };
      writeJSON(RESERVATION_KEY, r);
      editing = null;
      renderSaved(true);
    });

    function renderSaved(justNow) {
      var r = loadReservation();
      if (!r) { savedPanel.hidden = true; success.hidden = true; form.hidden = false; return; }
      var c = coverageOf(r.district), first = r.name.split(/\s+/)[0];
      var panel = justNow ? success : savedPanel;
      (justNow ? savedPanel : success).hidden = true;
      form.hidden = true;
      panel.hidden = false;
      $('[data-res-greeting]', panel).textContent = justNow ? 'Thank you, ' + first + '. Your Heatloop is reserved.' : 'Welcome back, ' + first + '. Your place is saved.';
      $('[data-res-place]', panel).textContent = num(r.place);
      $('[data-res-ref]', panel).textContent = r.ref;
      $('[data-res-model]', panel).textContent = MODELS[r.model].name;
      $('[data-res-postcode]', panel).textContent = r.postcode;
      $('[data-res-date]', panel).textContent = longDate(r.created);
      $('[data-res-next]', panel).textContent = c.covered
        ? 'We install in ' + r.district + '. Our team will email ' + r.email + ' to book a home assessment, with first slots from ' + surveyMonth() + '.'
        : 'We don’t install in ' + r.district + ' yet. We’ll email ' + r.email + ' as soon as installs reach your area; your place in the queue is kept.';
      if (justNow) { panel.focus(); announce('Reservation ' + r.ref + ' saved.'); }
    }
    $$('[data-res-edit]').forEach(function (b) {
      b.addEventListener('click', function () {
        var r = loadReservation(); if (!r) return;
        editing = r;
        $('input[name="model"][value="' + r.model + '"]', form).checked = true;
        $('#res-postcode').value = r.postcode; $('#res-name').value = r.name; $('#res-email').value = r.email; $('#res-phone').value = r.phone; $('#res-updates').checked = r.updates;
        savedPanel.hidden = true; success.hidden = true; form.hidden = false; showStep(0);
        $('legend', steps[0]).setAttribute('tabindex', '-1'); $('legend', steps[0]).focus();
      });
    });
    $$('[data-res-cancel]').forEach(function (b) {
      b.addEventListener('click', function () {
        writeJSON(RESERVATION_KEY, null);
        editing = null; form.reset(); showStep(0);
        savedPanel.hidden = true; success.hidden = true; form.hidden = false;
        announce('Reservation canceled. You can reserve again at any time.');
        $('legend', steps[0]).setAttribute('tabindex', '-1'); $('legend', steps[0]).focus();
      });
    });
    showStep(0);
    renderSaved(false);
    $$('[data-survey-month]').forEach(function (el) { el.textContent = surveyMonth(); });
  }

  /* ------------------------------------------------------------------
   * 10. Careers: filters (in the URL), saved roles and the role dialog
   * ------------------------------------------------------------------ */
  function loadSavedRoles() {
    var list = readJSON(SAVED_ROLES_KEY);
    if (!Array.isArray(list)) return [];
    var ids = ROLES.map(function (r) { return r.id; });
    return list.filter(function (id, i) { return typeof id === 'string' && ids.indexOf(id) !== -1 && list.indexOf(id) === i; });
  }
  function roleById(id) { for (var i = 0; i < ROLES.length; i++) if (ROLES[i].id === id) return ROLES[i]; return null; }

  function initCareers() {
    var list = $('[data-roles]');
    if (!list) return;
    var teamSel = $('#filter-team'), locSel = $('#filter-location'), remote = $('#filter-remote');
    var dialog = $('#role-dialog'), saved = loadSavedRoles(), lastOpener = null;
    var q = new URLSearchParams(window.location.search);
    if (has(TEAMS, q.get('team'))) teamSel.value = q.get('team');
    if (has(LOCATIONS, q.get('location'))) locSel.value = q.get('location');
    remote.checked = q.get('remote') === '1';

    function card(r) {
      var on = saved.indexOf(r.id) !== -1;
      return '<li class="grid gap-4 border-b border-rule py-6 sm:grid-cols-[1fr_auto] sm:items-center" data-role="' + r.id + '">' +
        '<div><p class="label-muted">' + TEAMS[r.team] + '</p>' +
        '<h3 class="mt-1 font-serif text-2xl"><button type="button" class="text-left hover:text-copper" data-open-role="' + r.id + '">' + escapeHtml(r.title) + '</button></h3>' +
        '<p class="mt-1 text-muted">' + escapeHtml(r.summary) + '</p>' +
        '<p class="mt-3 flex flex-wrap gap-2"><span class="chip text-forest">' + LOCATIONS[r.location] + '</span><span class="chip text-copper">' + MODES[r.mode] + '</span><span class="chip text-muted">' + escapeHtml(r.salary) + '</span></p></div>' +
        '<div class="flex gap-2"><button type="button" class="toggle" data-save-role="' + r.id + '" aria-pressed="' + on + '"><svg viewBox="0 0 24 24" class="h-4 w-4" fill="' + (on ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z"/></svg>' + (on ? 'Saved' : 'Save') + '<span class="sr-only"> ' + escapeHtml(r.title) + '</span></button>' +
        '<button type="button" class="btn-line btn-sm" data-open-role="' + r.id + '">Details<span class="sr-only"> for ' + escapeHtml(r.title) + '</span></button></div></li>';
    }
    function render() {
      var team = teamSel.value, loc = locSel.value, onlyRemote = remote.checked;
      var shown = ROLES.filter(function (r) { return (team === 'all' || r.team === team) && (loc === 'all' || r.location === loc) && (!onlyRemote || r.mode === 'remote'); });
      list.innerHTML = shown.map(card).join('');
      $('[data-roles-empty]').hidden = shown.length > 0;
      $('[data-roles-count]').textContent = plural(shown.length, 'open role');
      var params = [];
      if (team !== 'all') params.push('team=' + team);
      if (loc !== 'all') params.push('location=' + loc);
      if (onlyRemote) params.push('remote=1');
      try { window.history.replaceState(null, '', window.location.pathname + (params.length ? '?' + params.join('&') : '')); } catch (e) { /* ignore */ }
      renderSaved();
    }
    function renderSaved() {
      $('[data-saved-count]').textContent = String(saved.length);
      var box = $('[data-saved-list]');
      box.innerHTML = saved.length
        ? saved.map(function (id) { var r = roleById(id); return '<li class="flex items-baseline justify-between gap-3 border-b border-rule py-2.5"><button type="button" class="text-left hover:text-copper" data-open-role="' + id + '">' + escapeHtml(r.title) + '</button><span class="tick shrink-0">' + LOCATIONS[r.location] + '</span></li>'; }).join('')
        : '<li class="py-2 text-muted">Nothing saved yet. Use Save on any role to keep it here.</li>';
    }
    function toggleSave(id, fromList) {
      var i = saved.indexOf(id);
      if (i === -1) saved.push(id); else saved.splice(i, 1);
      writeJSON(SAVED_ROLES_KEY, saved);
      var r = roleById(id);
      announce((i === -1 ? 'Saved ' : 'Removed ') + r.title + '. ' + plural(saved.length, 'saved role') + '.');
      render();
      var again = $('[data-roles] [data-save-role="' + id + '"]');
      if (fromList && again) again.focus();
      syncDialogSave(id);
    }
    function syncDialogSave(id) {
      var b = $('[data-dialog-save]');
      if (!b || b.getAttribute('data-save-role') !== id) return;
      var on = saved.indexOf(id) !== -1;
      b.setAttribute('aria-pressed', on ? 'true' : 'false');
      $('[data-dialog-save-label]', b).textContent = on ? 'Saved' : 'Save this role';
    }
    function openRole(id, opener) {
      var r = roleById(id); if (!r) return;
      lastOpener = opener || null;
      $('[data-dialog-title]').textContent = r.title;
      $('[data-dialog-meta]').textContent = TEAMS[r.team] + ' · ' + LOCATIONS[r.location] + ' · ' + MODES[r.mode] + ' · ' + r.salary;
      $('[data-dialog-summary]').textContent = r.summary;
      $('[data-dialog-do]').innerHTML = r.do.map(function (t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('');
      $('[data-dialog-bring]').innerHTML = r.bring.map(function (t) { return '<li>' + escapeHtml(t) + '</li>'; }).join('');
      $('[data-dialog-apply]').setAttribute('href', 'contact.html?type=careers&role=' + r.id);
      $('[data-dialog-save]').setAttribute('data-save-role', r.id);
      syncDialogSave(r.id);
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    }
    document.addEventListener('click', function (e) {
      var s = e.target.closest('[data-save-role]');
      if (s) { toggleSave(s.getAttribute('data-save-role'), !!s.closest('[data-roles]')); return; }
      var o = e.target.closest('[data-open-role]');
      if (o) openRole(o.getAttribute('data-open-role'), o);
    });
    $$('[data-dialog-close]').forEach(function (b) { b.addEventListener('click', function () { dialog.close(); }); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () { if (lastOpener && document.body.contains(lastOpener)) lastOpener.focus(); });
    [teamSel, locSel, remote].forEach(function (el) { el.addEventListener('change', render); });
    $('[data-roles-reset]').addEventListener('click', function () { teamSel.value = 'all'; locSel.value = 'all'; remote.checked = false; render(); teamSel.focus(); });
    render();
    var open = q.get('role');
    if (open && roleById(open)) openRole(open, null);
  }

  /* ------------------------------------------------------------------
   * 11. News: topic filter (in the URL) and coming-up events from rules
   * ------------------------------------------------------------------ */
  function nthWeekday(y, m, weekday, nth) { // m: 1-12; returns a day number or null
    if (nth > 0) {
      var first = dayNumber(y + '-' + pad(m) + '-01');
      var d = first + ((weekday - weekdayOf(first) + 7) % 7) + (nth - 1) * 7;
      return isoOf(d).slice(5, 7) === pad(m) ? d : null;
    }
    var next = m === 12 ? dayNumber((y + 1) + '-01-01') : dayNumber(y + '-' + pad(m + 1) + '-01');
    var last = next - 1;
    return last - ((weekdayOf(last) - weekday + 7) % 7);
  }
  function upcomingEvents() {
    var out = [];
    EVENT_RULES.forEach(function (rule) {
      for (var k = 0; k < 4; k++) {
        var m = NOW.m - 1 + k, y = NOW.y + Math.floor(m / 12); m = m % 12 + 1;
        var d = nthWeekday(y, m, rule.weekday, rule.nth);
        if (d === null) continue;
        if (d < NOW.day || (d === NOW.day && minutesOf(rule.time) <= NOW.minutes)) continue;
        out.push({ rule: rule, day: d });
        break; // only the next date for each rule
      }
    });
    out.sort(function (a, b) { return a.day - b.day || minutesOf(a.rule.time) - minutesOf(b.rule.time); });
    return out.slice(0, EVENTS_SHOWN);
  }
  function initEvents() {
    var box = $('[data-events]');
    if (!box) return;
    box.innerHTML = upcomingEvents().map(function (e) {
      var iso = isoOf(e.day), p = iso.split('-');
      return '<li class="grid grid-cols-[4.5rem_1fr] gap-4 border-t border-rule py-5">' +
        '<p class="text-center"><span class="block font-mono text-[0.72rem] uppercase tracking-[0.12em] text-copper">' + MONTHS[+p[1] - 1].slice(0, 3) + '</span><span class="block font-serif text-4xl leading-none">' + +p[2] + '</span><span class="block font-mono text-[0.72rem] uppercase text-muted">' + WEEKDAYS[weekdayOf(e.day)].slice(0, 3) + '</span></p>' +
        '<div><h3 class="font-serif text-xl leading-snug">' + escapeHtml(e.rule.title) + '</h3>' +
        '<p class="mt-1 font-mono text-[0.8rem] uppercase tracking-[0.06em] text-muted"><time datetime="' + iso + 'T' + e.rule.time + '">' + shortDay(iso) + ', ' + clock12(e.rule.time) + '–' + clock12(e.rule.end) + '</time> · ' + escapeHtml(e.rule.where) + '</p>' +
        '<p class="mt-2 text-[0.98rem] text-muted">' + escapeHtml(e.rule.text) + '</p></div></li>';
    }).join('');
  }
  function initNewsFilter() {
    var buttons = $$('[data-topic-filter]');
    if (!buttons.length) return;
    var posts = $$('[data-topic]');
    function apply(topic, push) {
      var shown = 0;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-topic-filter') === topic ? 'true' : 'false'); });
      posts.forEach(function (p) { var on = topic === 'all' || p.getAttribute('data-topic') === topic; p.hidden = !on; if (on) shown++; });
      $('[data-news-count]').textContent = plural(shown, 'post');
      if (push) { try { window.history.replaceState(null, '', window.location.pathname + (topic === 'all' ? '' : '?topic=' + topic) + window.location.hash); } catch (e) { /* ignore */ } }
    }
    var topics = {}; buttons.forEach(function (b) { topics[b.getAttribute('data-topic-filter')] = 1; });
    var q = new URLSearchParams(window.location.search).get('topic');
    buttons.forEach(function (b) { b.addEventListener('click', function () { apply(b.getAttribute('data-topic-filter'), true); }); });
    apply(has(topics, q) ? q : 'all', false);
    // Open a post linked by #id.
    var target = window.location.hash && document.getElementById(window.location.hash.slice(1));
    if (target && target.tagName === 'DETAILS') { target.hidden = false; target.open = true; }
  }

  /* ------------------------------------------------------------------
   * 12. Company: line-drawn portraits from data-portrait="hair,glasses,beard,tone"
   * ------------------------------------------------------------------ */
  var HAIR = {
    short: 'M38 46c0-16 10-24 22-24s22 8 22 24c-4-8-12-10-22-10s-18 2-22 10Z',
    long: 'M36 50c-2-20 8-30 24-30s26 10 24 30l2 34h-8l-2-30c-4-10-12-14-16-14s-12 4-16 14l-2 30h-8Z',
    bun: 'M38 46c0-16 10-24 22-24s22 8 22 24c-4-8-12-10-22-10s-18 2-22 10Z M52 18a8 8 0 1 1 16 0 8 8 0 1 1-16 0Z',
    curly: 'M36 48c-4-6-2-14 4-16 0-8 8-12 14-10 4-6 14-6 18 0 6-2 14 2 14 10 6 2 8 10 4 16-6-6-14-10-30-10s-20 4-24 10Z',
    crop: 'M40 42c2-12 10-18 20-18s18 6 20 18c-6-4-12-5-20-5s-14 1-20 5Z',
    side: 'M38 48c-2-18 8-26 22-26 12 0 24 8 22 22-10-2-22-8-28-14-4 8-10 14-16 18Z'
  };
  function portrait(spec) {
    var p = spec.split(','), hair = has(HAIR, p[0]) ? HAIR[p[0]] : HAIR.short, tone = ['var(--paper-3)', 'var(--paper-2)', 'var(--ochre)'][+p[3] || 0];
    return '<svg viewBox="0 0 120 120" class="h-full w-full text-ink" aria-hidden="true">' +
      '<rect width="120" height="120" fill="var(--paper-2)"/><path d="M0 96H120" stroke="var(--rule)"/>' +
      '<path d="M22 120c2-20 16-30 38-30s36 10 38 30Z" fill="var(--forest)" opacity=".85"/><path d="M50 90l10 12 10-12" fill="none" stroke="var(--paper)" stroke-width="1.6"/>' +
      '<path d="M52 76v14h16V76" fill="' + tone + '" stroke="currentColor" stroke-width="1.4"/>' +
      '<ellipse cx="60" cy="54" rx="21" ry="25" fill="' + tone + '" stroke="currentColor" stroke-width="1.4" ' + (p[3] === '2' ? 'fill-opacity=".55"' : '') + '/>' +
      '<path d="' + hair + '" fill="currentColor" opacity=".88"/>' +
      '<path d="M52 56h.01M68 56h.01" stroke="currentColor" stroke-width="3.2" stroke-linecap="round"/><path d="M55 68c3 2 7 2 10 0" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>' +
      (p[1] === 'g' ? '<g fill="none" stroke="currentColor" stroke-width="1.4"><circle cx="52" cy="56" r="6"/><circle cx="68" cy="56" r="6"/><path d="M58 56h4"/></g>' : '') +
      (p[2] === 'b' ? '<path d="M40 60c2 16 10 22 20 22s18-6 20-22c-4 8-10 10-20 10s-16-2-20-10Z" fill="currentColor" opacity=".75"/>' : '') +
      '</svg>';
  }
  function initPortraits() {
    $$('[data-portrait]').forEach(function (el) { el.innerHTML = portrait(el.getAttribute('data-portrait')); });
  }

  /* ------------------------------------------------------------------
   * 13. Forms: contact (type and role from the URL) and newsletter
   * ------------------------------------------------------------------ */
  function initForms() {
    var contact = $('#contact-form');
    if (contact) {
      var q = new URLSearchParams(window.location.search), type = q.get('type'), role = roleById(q.get('role') || '');
      if (has(CONTACT_TYPES, type)) $('#contact-type').value = type;
      if (role) { $('#contact-type').value = 'careers'; $('#contact-message').value = 'Application: ' + role.title + '\n\n'; }
    }
    $$('form[data-validate]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var firstBad = null;
        $$('input, select, textarea', form).forEach(function (el) {
          if (!el.id) return;
          var err = document.getElementById(el.id + '-error'), msg = '', v = (el.value || '').trim();
          if (el.required && !v) msg = el.getAttribute('data-required-msg') || 'This field is required.';
          else if (v && el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter an email address like name@example.com.';
          else if (v && el.type === 'tel' && !/^(\+?1)?[2-9]\d{9}$/.test(v.replace(/[\s().-]/g, ''))) msg = 'Enter a US phone number, or leave it blank.';
          else if (v && el.hasAttribute('data-minlength') && v.length < +el.getAttribute('data-minlength')) msg = 'Please write a little more (at least ' + el.getAttribute('data-minlength') + ' characters).';
          if (err) err.textContent = msg;
          if (el.type !== 'checkbox') el.setAttribute('aria-invalid', msg ? 'true' : 'false');
          if (msg && !firstBad) firstBad = el;
        });
        if (firstBad) { firstBad.focus(); return; }
        // To connect a real endpoint, send the form here, e.g.
        //   fetch('https://formspree.io/f/yourid', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        // and show the success panel below only when the response is OK.
        var panel = document.getElementById(form.getAttribute('data-success'));
        if (form.id === 'contact-form') {
          var first = $('#contact-name').value.trim().split(/\s+/)[0], t = $('#contact-type').value;
          $('[data-contact-first]', panel).textContent = first;
          $('[data-contact-ref]', panel).textContent = refCode('HL-E');
          $('[data-contact-team]', panel).textContent = has(CONTACT_REPLY, t) ? CONTACT_REPLY[t] : CONTACT_REPLY.other;
        }
        if (form.hasAttribute('data-hide-on-success')) form.hidden = true;
        panel.hidden = false;
        panel.focus();
        form.reset();
      });
    });
  }

  initTheme();
  initMenu();
  initDates();
  initShift();
  initDayChart();
  initEstimator();
  initReserve();
  initCareers();
  initEvents();
  initNewsFilter();
  initPortraits();
  initForms();
  initReveal();
  initBackToTop();
})();
