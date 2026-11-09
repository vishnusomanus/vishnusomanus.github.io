/* Paws (Sweetgum Animal Clinic) — site scripts. Vanilla JavaScript, no dependencies.
   All clinic data (hours, holidays, vets, visit types, planner schedules, prices) lives at the top
   of this file. Keep it in step with the HTML pages; see DOCS.md, "Content". */
(function () {
  'use strict';

  /* ======================================================================
     1. Clinic settings
     ====================================================================== */

  /* Time zone and opening hours. Times are 24-hour wall-clock times in Asheville (Eastern time).
     Day 0 is Sunday; null means closed. Keep in step with the hours lists in the HTML (data-hours). */
  var CLINIC = {
    name: 'Sweetgum Animal Clinic',
    timeZone: 'America/New_York',
    zoneName: 'Eastern time',
    phone: '(828) 555-0163'
  };
  var HOURS = {
    0: null,
    1: ['07:30', '19:00'],
    2: ['07:30', '18:00'],
    3: ['07:30', '19:00'],
    4: ['07:30', '18:00'],
    5: ['07:30', '18:00'],
    6: ['08:00', '13:00']
  };

  /* Holidays the clinic closes for. They are worked out for every year from these rules, so the
     demo never shows a past date. A fixed date: { month, day }. "The nth weekday of a month":
     { month, weekday (0 = Sunday), nth } where nth -1 means the last one. */
  var HOLIDAYS = [
    { name: 'New Year’s Day', month: 1, day: 1 },
    { name: 'Memorial Day', month: 5, weekday: 1, nth: -1 },
    { name: 'Independence Day', month: 7, day: 4 },
    { name: 'Labor Day', month: 9, weekday: 1, nth: 1 },
    { name: 'Thanksgiving', month: 11, weekday: 4, nth: 4 },
    { name: 'Christmas Day', month: 12, day: 25 }
  ];
  // One-off closures as 'YYYY-MM-DD' (clinic date), e.g. a staff training day.
  var EXTRA_CLOSED = [];

  /* ---------- Pets ---------- */
  var SPECIES = {
    dog: { label: 'Dog', plural: 'dogs', art: 'dog' },
    cat: { label: 'Cat', plural: 'cats', art: 'cat' },
    rabbit: { label: 'Rabbit', plural: 'rabbits', art: 'rabbit' },
    exotic: { label: 'Small or exotic pet', plural: 'small and exotic pets', art: 'exotic' }
  };

  /* ---------- Vets (team.html, book.html) ----------
     pets: the species each vet sees. shifts: appointment hours by weekday (0 = Sunday).
     Keep the "In the clinic" days on team.html in step. */
  var VETS = {
    arceneaux: {
      name: 'Dr. Lucinda Arceneaux', short: 'Dr. Arceneaux', pets: ['dog', 'cat'],
      shifts: { 1: ['07:30', '15:30'], 2: ['10:00', '18:00'], 3: ['07:30', '15:30'], 5: ['07:30', '15:30'], 6: ['08:00', '13:00'] }
    },
    mbatha: {
      name: 'Dr. Everett Mbatha', short: 'Dr. Mbatha', pets: ['dog', 'cat', 'rabbit'],
      shifts: { 1: ['11:00', '19:00'], 2: ['07:30', '15:30'], 3: ['11:00', '19:00'], 4: ['07:30', '18:00'] }
    },
    castellanos: {
      name: 'Dr. Amaru Castellanos', short: 'Dr. Castellanos', pets: ['rabbit', 'exotic', 'cat'],
      shifts: { 2: ['07:30', '18:00'], 4: ['10:00', '18:00'], 5: ['10:00', '18:00'], 6: ['08:00', '13:00'] }
    }
  };

  /* ---------- Visit types (book.html) ----------
     minutes: length. pets: who it's for. vets: only these vets offer it (null = any vet who sees
     the species). notice: minimum minutes between now and the first bookable start. */
  var SERVICES = {
    wellness: { label: 'Wellness exam', note: 'Yearly check-up, nose to tail', minutes: 30, pets: ['dog', 'cat', 'rabbit', 'exotic'], vets: null, price: 'From $68', notice: 120 },
    puppy: { label: 'Puppy or kitten visit', note: 'First check-up and vaccine plan', minutes: 30, pets: ['dog', 'cat'], vets: null, price: 'From $62', notice: 120 },
    vaccines: { label: 'Vaccines or boosters', note: 'Includes a quick health check', minutes: 30, pets: ['dog', 'cat', 'rabbit', 'exotic'], vets: null, price: 'From $28 per vaccine', notice: 120 },
    sick: { label: 'Sick or injured (not an emergency)', note: 'Same-day slots held every day', minutes: 30, pets: ['dog', 'cat', 'rabbit', 'exotic'], vets: null, price: 'From $82', notice: 60 },
    dental: { label: 'Dental check', note: 'Awake check and cleaning estimate', minutes: 30, pets: ['dog', 'cat', 'rabbit'], vets: ['mbatha', 'castellanos'], price: 'From $68', notice: 120 },
    surgery: { label: 'Surgery consult', note: 'Spay, neuter or a lump to check', minutes: 30, pets: ['dog', 'cat', 'rabbit', 'exotic'], vets: ['mbatha', 'castellanos'], price: 'From $68', notice: 120 },
    senior: { label: 'Senior check-up', note: 'An hour, with bloodwork if needed', minutes: 60, pets: ['dog', 'cat', 'rabbit'], vets: null, price: 'From $96', notice: 120 },
    microchip: { label: 'Microchip', note: 'Quick, no anesthetic needed', minutes: 30, pets: ['dog', 'cat', 'rabbit', 'exotic'], vets: null, price: '$55', notice: 120 }
  };
  var BOOKING = {
    slotStep: 30,         // minutes between start times
    daysPerPage: 7,       // days shown at once in the day picker
    pages: 3,             // how many pages of days (3 x 7 = the next 21 days, today included)
    demoBusyShare: 0.35,  // share of slots shown as taken so the demo looks real. Set to 0 when connected.
    maxPets: 6            // saved pets kept on this device
  };
  var PETS_KEY = 'paws-pets';

  /* ---------- Vaccine & wellness planner (planner.html) ----------
     Ages are in weeks. Each stage runs from `from` up to (not including) `to`. General guidance only:
     edit it to match your own clinic's protocols. */
  var PLANNER = {
    dog: {
      young: 'puppy', adult: 'dog',
      stages: [
        { from: 0, to: 6, name: 'Settling in', items: ['A first check-up within a week of coming home', 'Deworming, repeated a few times while young', 'Gentle handling of paws, ears and mouth with treats'] },
        { from: 6, to: 10, name: 'Puppy vaccines: round one', items: ['Check-up and first DHPP vaccine', 'Deworming and a stool test', 'Start heartworm, flea and tick prevention'] },
        { from: 10, to: 14, name: 'Puppy vaccines: round two', items: ['DHPP booster', 'Leptospirosis, first of two doses, if recommended for your dog', 'Microchip, if not done already'] },
        { from: 14, to: 18, name: 'Puppy vaccines: final round', items: ['Final DHPP booster (at 16 weeks or older)', 'Rabies vaccine, required in North Carolina by 4 months', 'Leptospirosis second dose, if started'] },
        { from: 18, to: 48, name: 'Growing up', items: ['A chat about spay or neuter timing (it depends on breed and size)', 'Monthly heartworm, flea and tick prevention', 'Training classes and lots of calm socializing'] },
        { from: 48, to: 72, name: 'First birthday boosters', items: ['One-year DHPP and rabies boosters', 'Heartworm test at the first yearly visit', 'Leptospirosis booster, if your dog has it'] },
        { from: 72, to: 365, name: 'Adult dog', items: ['A yearly wellness exam', 'Heartworm and stool tests every year', 'A dental check at every visit'] },
        { from: 365, to: Infinity, name: 'Senior dog', items: ['Check-ups every 6 months', 'A senior blood panel once a year', 'Watch for stiffness, thirst and weight changes'] }
      ],
      yearly: ['Wellness exam with a weight and dental check', 'DHPP every 3 years; rabies every 1 or 3 years, depending on the vaccine', 'Heartworm test and year-round prevention'],
      extras: {
        boarding: ['Bordetella (kennel cough), usually yearly', 'Canine influenza, two doses then yearly, if your daycare asks for it'],
        woods: ['Lyme vaccine, two doses then yearly', 'Leptospirosis every year', 'Tick checks after every hike or swim']
      }
    },
    cat: {
      young: 'kitten', adult: 'cat',
      stages: [
        { from: 0, to: 6, name: 'Settling in', items: ['A first check-up within a week of coming home', 'Deworming and a flea check', 'Litter box and scratching post set up'] },
        { from: 6, to: 10, name: 'Kitten vaccines: round one', items: ['Check-up and first FVRCP vaccine', 'FeLV and FIV test', 'Deworming and a stool test'] },
        { from: 10, to: 14, name: 'Kitten vaccines: round two', items: ['FVRCP booster', 'FeLV vaccine, first of two doses', 'Microchip, if not done already'] },
        { from: 14, to: 20, name: 'Kitten vaccines: final round', items: ['Final FVRCP booster (at 16 weeks or older)', 'Rabies vaccine, required in North Carolina by 4 months', 'FeLV second dose'] },
        { from: 20, to: 48, name: 'Growing up', items: ['Spay or neuter, usually around 5–6 months', 'Start brushing teeth', 'Flea prevention if they go outside or live with a dog'] },
        { from: 48, to: 72, name: 'First birthday boosters', items: ['One-year FVRCP, rabies and FeLV boosters', 'A yearly wellness exam', 'A weight check: young indoor cats gain easily'] },
        { from: 72, to: 520, name: 'Adult cat', items: ['A yearly wellness exam', 'A dental check at every visit', 'A stool test every year'] },
        { from: 520, to: Infinity, name: 'Senior cat', items: ['Check-ups every 6 months', 'Blood panel and blood pressure once a year', 'Watch for weight loss, thirst and litter box changes'] }
      ],
      yearly: ['Wellness exam with a weight and dental check', 'FVRCP every 3 years; rabies every 1 or 3 years, depending on the vaccine', 'FeLV boosters only if your cat goes outdoors'],
      extras: {
        outdoor: ['FeLV boosters every 1–3 years', 'Monthly flea, tick and heartworm prevention', 'A microchip and a breakaway collar']
      }
    },
    rabbit: {
      young: 'young rabbit', adult: 'rabbit',
      stages: [
        { from: 0, to: 8, name: 'Settling in', items: ['A first check-up once they’re settled', 'Unlimited hay from day one', 'Introduce leafy greens slowly'] },
        { from: 8, to: 16, name: 'First vaccines', items: ['RHDV2 vaccine, first dose', 'Second RHDV2 dose about 3 weeks later, depending on the vaccine', 'A diet and housing check'] },
        { from: 16, to: 26, name: 'Growing up', items: ['RHDV2 second dose, if not done yet', 'A chat about spay or neuter (from around 4–6 months)', 'Litter training and bunny-proofing'] },
        { from: 26, to: 52, name: 'Young adult', items: ['Spay or neuter, if planned', 'A dental check: back teeth grow all the time', 'Nail trims every 6–8 weeks'] },
        { from: 52, to: 260, name: 'Adult rabbit', items: ['A yearly wellness exam with a teeth check', 'Yearly RHDV2 booster', 'Weight and body condition check'] },
        { from: 260, to: Infinity, name: 'Senior rabbit', items: ['Check-ups every 6 months', 'Watch for stiffness and dental problems', 'Blood tests if your vet suggests them'] }
      ],
      yearly: ['Wellness exam with a back-teeth check', 'RHDV2 booster', 'Nail trim and weight check'],
      extras: {
        outdoorRabbit: ['Daily flystrike checks in warm weather', 'Shade, airflow and protection from predators', 'Ask us about parasite prevention']
      }
    },
    ferret: {
      young: 'ferret kit', adult: 'ferret',
      stages: [
        { from: 0, to: 8, name: 'Settling in', items: ['A first check-up within a week of coming home', 'Ferret-proof your home', 'A meat-based ferret diet'] },
        { from: 8, to: 11, name: 'First vaccines', items: ['Canine distemper vaccine, first dose', 'Stay 30 minutes after each vaccine so we can watch for reactions', 'A stool test'] },
        { from: 11, to: 14, name: 'Distemper booster', items: ['Second distemper vaccine', 'A diet and weight check'] },
        { from: 14, to: 20, name: 'Final kit vaccines', items: ['Third distemper vaccine', 'Rabies vaccine, required in North Carolina by 4 months'] },
        { from: 20, to: 52, name: 'Growing up', items: ['Check spay or neuter status (many ferrets come already done)', 'Ask us about heartworm prevention'] },
        { from: 52, to: 156, name: 'Adult ferret', items: ['A yearly wellness exam', 'Yearly distemper and rabies boosters'] },
        { from: 156, to: Infinity, name: 'Senior ferret', items: ['Check-ups every 6 months', 'A yearly blood sugar test and belly check'] }
      ],
      yearly: ['Wellness exam with a dental and weight check', 'Distemper and rabies boosters'],
      extras: {}
    }
  };
  var PLANNER_UNITS = { weeks: 1, months: 52 / 12, years: 52 };

  /* ---------- Pricing estimator (pricing.html) ----------
     [low, high] in US dollars for each pet size; null = not offered for that pet.
     Keys: dog-s (under 25 lb), dog-m (25–60 lb), dog-l (over 60 lb), cat, rabbit, exotic. */
  var PRICE_PETS = {
    'dog-s': { label: 'a small dog', species: 'dog' },
    'dog-m': { label: 'a medium dog', species: 'dog' },
    'dog-l': { label: 'a large dog', species: 'dog' },
    cat: { label: 'a cat', species: 'cat' },
    rabbit: { label: 'a rabbit', species: 'rabbit' },
    exotic: { label: 'a small or exotic pet', species: 'exotic' }
  };
  var PRICES = {
    exam: { label: 'Wellness exam', 'dog-s': [68, 78], 'dog-m': [68, 78], 'dog-l': [68, 78], cat: [68, 78], rabbit: [74, 86], exotic: [74, 92] },
    vaccines: { label: 'Core vaccines', 'dog-s': [56, 92], 'dog-m': [56, 92], 'dog-l': [56, 92], cat: [52, 88], rabbit: [48, 60], exotic: [40, 70] },
    rabies: { label: 'Rabies vaccine', 'dog-s': [28, 34], 'dog-m': [28, 34], 'dog-l': [28, 34], cat: [28, 34], rabbit: null, exotic: [28, 34] },
    heartworm: { label: 'Heartworm & tick-borne disease test', 'dog-s': [52, 60], 'dog-m': [52, 60], 'dog-l': [52, 60], cat: null, rabbit: null, exotic: null },
    fecal: { label: 'Stool (fecal) test', 'dog-s': [38, 46], 'dog-m': [38, 46], 'dog-l': [38, 46], cat: [38, 46], rabbit: [38, 46], exotic: [38, 46] },
    bloodwork: { label: 'Blood panel', 'dog-s': [120, 180], 'dog-m': [120, 180], 'dog-l': [120, 180], cat: [120, 180], rabbit: [130, 190], exotic: [130, 200] },
    xray: { label: 'X-rays (two views)', 'dog-s': [190, 240], 'dog-m': [210, 260], 'dog-l': [230, 290], cat: [190, 240], rabbit: [190, 240], exotic: [170, 220] },
    dental: { label: 'Dental cleaning under anesthesia', 'dog-s': [420, 650], 'dog-m': [480, 720], 'dog-l': [560, 840], cat: [420, 650], rabbit: [380, 620], exotic: null },
    spay: { label: 'Spay', 'dog-s': [340, 460], 'dog-m': [420, 560], 'dog-l': [520, 720], cat: [310, 380], rabbit: [360, 480], exotic: [380, 520] },
    neuter: { label: 'Neuter', 'dog-s': [280, 380], 'dog-m': [330, 440], 'dog-l': [400, 540], cat: [180, 240], rabbit: [260, 340], exotic: [300, 420] },
    microchip: { label: 'Microchip with registration', 'dog-s': [55, 55], 'dog-m': [55, 55], 'dog-l': [55, 55], cat: [55, 55], rabbit: [55, 55], exotic: [55, 55] },
    nails: { label: 'Nail trim', 'dog-s': [18, 25], 'dog-m': [18, 25], 'dog-l': [18, 25], cat: [18, 25], rabbit: [18, 25], exotic: [18, 25] }
  };

  /* ======================================================================
     2. Helpers
     ====================================================================== */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // Own-key lookups, so URL or stored values like "constructor" never match built-in properties.
  function has(obj, key) { return typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }
  function range(r) { return r[0] === r[1] ? money(r[0]) : money(r[0]) + ' – ' + money(r[1]); }
  function param(name) { try { return new URLSearchParams(window.location.search).get(name); } catch (e) { return null; } }
  function setParams(values) {
    try {
      var url = new URL(window.location.href);
      Object.keys(values).forEach(function (k) {
        if (values[k]) url.searchParams.set(k, values[k]); else url.searchParams.delete(k);
      });
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) { /* file:// in some browsers: the page still works without the URL update */ }
  }

  /* localStorage, or an in-memory stand-in when it's blocked (sandboxed iframes, strict privacy
     settings). Saved pets then last for the page view instead of breaking the booking form. */
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
  function writeJSON(key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* full or blocked */ } }

  var toastTimer;
  function toast(msg) {
    var t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 3200);
  }

  var ICON = {
    check: '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
    x: '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    dot: '<svg class="size-5 shrink-0 text-persimmon-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><ellipse cx="12" cy="16" rx="5.2" ry="4.4"/><ellipse cx="5" cy="10.5" rx="2.2" ry="2.8"/><ellipse cx="9.3" cy="5.6" rx="2.2" ry="2.9"/><ellipse cx="14.7" cy="5.6" rx="2.2" ry="2.9"/><ellipse cx="19" cy="10.5" rx="2.2" ry="2.8"/></svg>'
  };
  // Pet heads for generated markup: copied from the inline SVGs in the pages.
  function petArt(kind, cls) {
    var src = document.querySelector('[data-art="' + kind + '"]');
    var tpl = src ? src.innerHTML : '';
    return '<svg class="' + cls + '" viewBox="0 0 120 120" aria-hidden="true">' + tpl + '</svg>';
  }

  /* ======================================================================
     3. Dates and times (everything in the clinic's time zone)
     ====================================================================== */
  function toMin(hhmm) { var p = hhmm.split(':'); return Number(p[0]) * 60 + Number(p[1]); }
  function fmtTime(mins) {
    var h = Math.floor(mins / 60), m = mins % 60, ap = h < 12 ? 'am' : 'pm';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + String(m).padStart(2, '0') + ' ' + ap;
  }
  function partsIn(date, zone) {
    var out = {};
    new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
      .formatToParts(date).forEach(function (p) { if (p.type !== 'literal') out[p.type] = parseInt(p.value, 10); });
    if (out.hour === 24) out.hour = 0;
    return out;
  }
  function keyOf(y, m, d) { return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); }
  function addDays(key, n) {
    var d = key.split('-').map(Number), x = new Date(Date.UTC(d[0], d[1] - 1, d[2] + n));
    return keyOf(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate());
  }
  function weekday(key) { var d = key.split('-').map(Number); return new Date(Date.UTC(d[0], d[1] - 1, d[2])).getUTCDay(); }
  function dateLabel(key, opts) {
    var d = key.split('-').map(Number);
    return new Date(Date.UTC(d[0], d[1] - 1, d[2], 12)).toLocaleDateString('en-US', Object.assign({ timeZone: 'UTC' }, opts));
  }
  function clinicNow() {
    var p = partsIn(new Date(), CLINIC.timeZone);
    var key = keyOf(p.year, p.month, p.day);
    return { key: key, year: p.year, month: p.month, day: weekday(key), mins: p.hour * 60 + p.minute };
  }
  function relativeDay(key, today) {
    if (key === today) return 'Today';
    if (key === addDays(today, 1)) return 'Tomorrow';
    return dateLabel(key, { weekday: 'short', month: 'short', day: 'numeric' });
  }
  // A short reference for confirmations, like SW-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  // A stable pseudo-random number per string, so demo "taken" slots don't change between renders.
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }

  /* ---------- Holidays ---------- */
  function holidayKey(rule, year) {
    if (rule.day) return keyOf(year, rule.month, rule.day);
    if (rule.nth > 0) {
      var first = weekday(keyOf(year, rule.month, 1));
      return keyOf(year, rule.month, 1 + ((rule.weekday - first + 7) % 7) + (rule.nth - 1) * 7);
    }
    var lastDay = new Date(Date.UTC(year, rule.month, 0)).getUTCDate();
    var last = weekday(keyOf(year, rule.month, lastDay));
    return keyOf(year, rule.month, lastDay - ((last - rule.weekday + 7) % 7));
  }
  var holidayCache = {};
  function holidayOn(key) {
    var year = Number(key.slice(0, 4));
    if (!holidayCache[year]) {
      holidayCache[year] = {};
      HOLIDAYS.forEach(function (rule) { holidayCache[year][holidayKey(rule, year)] = rule.name; });
    }
    if (has(holidayCache[year], key)) return holidayCache[year][key];
    if (EXTRA_CLOSED.indexOf(key) !== -1) return 'a staff day';
    return null;
  }
  function hoursOn(key) { return holidayOn(key) ? null : HOURS[weekday(key)]; }

  /* ======================================================================
     4. Header, reveal, footer year, back to top
     ====================================================================== */
  var header = $('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 30); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    var menuBtn = $('[data-menu-button]', header), menu = $('[data-mobile-menu]', header);
    if (menuBtn && menu) {
      var setMenu = function (open, returnFocus) {
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.hidden = !open;
        $('[data-icon-open]', menuBtn).hidden = open;
        $('[data-icon-close]', menuBtn).hidden = !open;
        if (!open && returnFocus) menuBtn.focus();
      };
      menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') setMenu(false, true);
      });
      document.addEventListener('click', function (e) {
        if (menuBtn.getAttribute('aria-expanded') === 'true' && !header.contains(e.target)) setMenu(false);
      });
      $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
      window.matchMedia('(min-width: 1280px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
    }
  }

  // Scroll reveal. Revealing an element also reveals everything before it, so fast jumps never leave gaps.
  var reveals = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = reveals.indexOf(entry.target);
        reveals.slice(0, index + 1).forEach(function (el) { el.classList.add('is-visible'); io.unobserve(el); });
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  $$('[data-year]').forEach(function (el) { el.textContent = String(clinicNow().year); });

  /* ======================================================================
     5. Opening hours: today's row, open-now pill, emergency advice, holidays
     ====================================================================== */
  function openStatus() {
    var now = clinicNow(), h = hoursOn(now.key);
    if (h && now.mins >= toMin(h[0]) && now.mins < toMin(h[1])) {
      return { open: true, until: h[1], text: 'Open now · until ' + fmtTime(toMin(h[1])) };
    }
    for (var i = 0; i < 10; i++) {
      var key = addDays(now.key, i), hh = hoursOn(key);
      if (!hh || (i === 0 && now.mins >= toMin(hh[0]))) continue;
      var when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : dateLabel(key, { weekday: 'long' });
      return { open: false, text: 'Opens ' + when + ' at ' + fmtTime(toMin(hh[0])), next: when + ' at ' + fmtTime(toMin(hh[0])) };
    }
    return { open: false, text: 'Call for our hours', next: '' };
  }
  function renderHours() {
    var now = clinicNow(), s = openStatus();
    $$('[data-hours] [data-day]').forEach(function (row) {
      row.setAttribute('data-today', String(Number(row.getAttribute('data-day')) === now.day && !holidayOn(now.key)));
    });
    $$('[data-open-status]').forEach(function (el) {
      el.hidden = false;
      el.setAttribute('data-open', String(s.open));
      $('[data-open-text]', el).textContent = s.text;
    });
    $$('[data-emergency-advice]').forEach(function (el) {
      el.textContent = s.open
        ? 'We’re open until ' + fmtTime(toMin(s.until)) + ' today. Call ' + CLINIC.phone + ' now and tell us what’s happening: we’ll tell you whether to come straight in. We keep slots free for urgent cases.'
        : 'We’re closed right now' + (s.next ? ' (we open ' + s.next + ')' : '') + '. Call the nearest 24-hour emergency vet now: don’t wait for us to open.';
    });
    $$('[data-holiday-note]').forEach(function (el) {
      for (var i = 0; i < 14; i++) {
        var key = addDays(now.key, i), name = holidayOn(key);
        if (name) {
          el.textContent = 'Closed ' + (i === 0 ? 'today' : dateLabel(key, { weekday: 'long', month: 'long', day: 'numeric' })) + ' for ' + name + '.';
          el.hidden = false;
          return;
        }
      }
      el.hidden = true;
    });
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ======================================================================
     6. Booking engine: slots from vet shifts, opening hours and visit length
     ====================================================================== */
  function vetsFor(serviceId, species) {
    var svc = SERVICES[serviceId];
    return Object.keys(VETS).filter(function (id) {
      if (species && VETS[id].pets.indexOf(species) === -1) return false;
      return !svc || !svc.vets || svc.vets.indexOf(id) !== -1;
    });
  }
  // All open start times for one visit type on one date. vetPref: a vet id or 'any'.
  function slotsFor(serviceId, species, vetPref, key, now) {
    var svc = SERVICES[serviceId], hours = hoursOn(key);
    now = now || clinicNow();
    if (!svc || !hours || key < now.key) return [];
    var vets = vetsFor(serviceId, species);
    if (vetPref && vetPref !== 'any') vets = vets.filter(function (v) { return v === vetPref; });
    var out = {};
    vets.forEach(function (v) {
      var sh = VETS[v].shifts[weekday(key)];
      if (!sh) return;
      var from = Math.max(toMin(sh[0]), toMin(hours[0])), to = Math.min(toMin(sh[1]), toMin(hours[1]));
      for (var t = from; t + svc.minutes <= to; t += BOOKING.slotStep) {
        if (out[t]) continue;
        if (key === now.key && t - now.mins < svc.notice) continue;
        if (hash(v + key + t) < BOOKING.demoBusyShare) continue;
        out[t] = { key: key, mins: t, vet: v };
      }
    });
    return Object.keys(out).map(Number).sort(function (a, b) { return a - b; }).map(function (t) { return out[t]; });
  }
  function horizonDays() { return BOOKING.daysPerPage * BOOKING.pages; }
  function firstAvailable(serviceId, species, vetPref) {
    var now = clinicNow();
    for (var i = 0; i < horizonDays(); i++) {
      var s = slotsFor(serviceId, species, vetPref, addDays(now.key, i), now);
      if (s.length) return s[0];
    }
    return null;
  }

  // Home: next check-up opening.
  var nextSlot = $('[data-next-slot]');
  if (nextSlot) {
    var renderNext = function () {
      var s = firstAvailable('wellness', null, 'any');
      if (!s) { nextSlot.hidden = true; return; }
      $('[data-next-slot-text]', nextSlot).textContent = relativeDay(s.key, clinicNow().key) + ' · ' + fmtTime(s.mins);
      nextSlot.hidden = false;
    };
    renderNext();
    setInterval(renderNext, 60000);
  }

  /* ======================================================================
     7. Saved pets (localStorage key "paws-pets")
     Shape: [{ id: "p1a2b3", name: "Waffles", species: "dog", kind: "", born: "2023-06" }]
     ====================================================================== */
  function monthIndex(ym) { var p = ym.split('-').map(Number); return p[0] * 12 + (p[1] - 1); }
  function nowMonthIndex() { var n = clinicNow(); return n.year * 12 + (n.month - 1); }
  function bornFromAge(years, months) {
    var idx = nowMonthIndex() - (years * 12 + months);
    return Math.floor(idx / 12) + '-' + String((idx % 12) + 1).padStart(2, '0');
  }
  function ageMonths(pet) { return Math.max(0, nowMonthIndex() - monthIndex(pet.born)); }
  function ageText(months) {
    if (months < 1) return 'under 1 month';
    if (months < 24) return plural(months, 'month');
    var y = Math.floor(months / 12);
    return plural(y, 'year');
  }
  function cleanText(v, max) { return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : ''; }
  function loadPets() {
    var raw = readJSON(PETS_KEY), out = [], seen = {};
    if (!Array.isArray(raw)) return out;
    raw.forEach(function (p) {
      if (!p || typeof p !== 'object' || out.length >= BOOKING.maxPets) return;
      var id = typeof p.id === 'string' && /^p[a-z0-9]{1,16}$/.test(p.id) ? p.id : null;
      var name = cleanText(p.name, 30);
      var born = typeof p.born === 'string' && /^\d{4}-(0[1-9]|1[0-2])$/.test(p.born) ? p.born : null;
      if (!id || seen[id] || !name || !has(SPECIES, p.species) || !born || monthIndex(born) > nowMonthIndex()) return;
      seen[id] = true;
      out.push({ id: id, name: name, species: p.species, kind: cleanText(p.kind, 30), born: born });
    });
    return out;
  }
  function savePets(list) { writeJSON(PETS_KEY, list.slice(0, BOOKING.maxPets)); }
  function petCountText(n) { return n ? plural(n, 'saved pet') : 'No saved pets yet'; }
  function petLine(p) { return (p.kind || SPECIES[p.species].label) + ', ' + ageText(ageMonths(p)); }

  /* ======================================================================
     8. Booking wizard (book.html)
     ====================================================================== */
  var bookingForm = $('[data-booking]');
  if (bookingForm) (function () {
    var state = { step: 1, pet: null, service: null, vet: 'any', slot: null, page: 0, day: null };
    var steps = $$('[data-step]', bookingForm);
    var stepsNav = $$('[data-steps-nav] li');
    var success = $('[data-booking-success]');
    var pets = loadPets();
    savePets(pets); // heal anything invalid that was stored

    // URL presets: ?pet=cat&service=dental&vet=mbatha
    var preSpecies = param('pet'), preService = param('service'), preVet = param('vet');
    if (!has(SPECIES, preSpecies)) preSpecies = null;
    if (!has(SERVICES, preService)) preService = null;
    if (!has(VETS, preVet)) preVet = null;
    if (preSpecies) { var sp = $('input[name="species"][value="' + preSpecies + '"]', bookingForm); if (sp) sp.checked = true; }

    function selectedSpecies() { var r = $('input[name="species"]:checked', bookingForm); return r ? r.value : null; }
    function newPetMode() { var r = $('input[name="petChoice"]:checked', bookingForm); return !pets.length || !r || r.value === 'new'; }

    /* ----- Step 1: pets ----- */
    function renderPets(selectedId) {
      $$('[data-pet-count]').forEach(function (el) { el.textContent = petCountText(pets.length); });
      var wrap = $('[data-saved-pets]', bookingForm), list = $('[data-saved-pet-list]', bookingForm);
      wrap.hidden = !pets.length;
      $('[data-new-pet-title]', bookingForm).hidden = true;
      if (!pets.length) { list.innerHTML = ''; toggleNewPet(); return; }
      var chosen = selectedId || (state.pet && state.pet.id) || pets[0].id;
      if (selectedId === 'new') chosen = 'new';
      list.innerHTML = pets.map(function (p) {
        return '<div class="relative"><label class="choice"><input type="radio" name="petChoice" value="' + p.id + '"' + (p.id === chosen ? ' checked' : '') + '>' +
          '<span class="choice-box flex items-center gap-3 !pr-12"><span class="pet-tile size-12 shrink-0 bg-oat-dark">' + petArt(SPECIES[p.species].art, 'size-10') + '</span>' +
          '<span class="min-w-0"><span class="block font-bold text-ink">' + esc(p.name) + '</span><span class="block text-sm text-muted">' + esc(petLine(p)) + '</span></span></span></label>' +
          '<button type="button" class="absolute top-1/2 right-3 grid size-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:bg-persimmon-50 hover:text-persimmon-700" aria-label="Remove ' + esc(p.name) + ' from saved pets" data-remove-pet="' + p.id + '">' + ICON.x + '</button></div>';
      }).join('') +
        '<label class="choice"><input type="radio" name="petChoice" value="new"' + (chosen === 'new' ? ' checked' : '') + '><span class="choice-box flex h-full items-center gap-3"><span class="grid size-12 shrink-0 place-items-center rounded-full border-2 border-dashed border-line text-xl font-bold text-persimmon-700" aria-hidden="true">+</span><span class="font-bold text-ink">A different pet</span></span></label>';
      toggleNewPet();
    }
    function toggleNewPet() {
      var show = newPetMode();
      $('[data-new-pet]', bookingForm).hidden = !show;
      $('[data-kind-field]', bookingForm).hidden = selectedSpecies() !== 'exotic';
      updateSummary();
    }
    bookingForm.addEventListener('change', function (e) {
      if (e.target.name === 'petChoice' || e.target.name === 'species') {
        clearError(1);
        toggleNewPet();
      }
    });
    bookingForm.addEventListener('click', function (e) {
      var rm = e.target.closest('[data-remove-pet]');
      if (!rm) return;
      var id = rm.getAttribute('data-remove-pet');
      var gone = pets.filter(function (p) { return p.id === id; })[0];
      pets = pets.filter(function (p) { return p.id !== id; });
      savePets(pets);
      if (state.pet && state.pet.id === id) state.pet = null;
      renderPets(pets.length ? pets[0].id : null);
      if (gone) toast(gone.name + ' was removed from your saved pets');
      var first = $('input[name="petChoice"]', bookingForm) || $('#b-pet-name');
      if (first) first.focus();
    });

    function currentPet() {
      if (!newPetMode()) {
        var id = $('input[name="petChoice"]:checked', bookingForm).value;
        return pets.filter(function (p) { return p.id === id; })[0] || null;
      }
      var name = cleanText($('#b-pet-name').value, 30), species = selectedSpecies();
      var years = Math.min(25, Math.max(0, parseInt($('#b-years').value, 10) || 0));
      var months = Math.min(11, Math.max(0, parseInt($('#b-months').value, 10) || 0));
      return { id: null, name: name, species: species, kind: species === 'exotic' ? cleanText($('#b-kind').value, 30) : '', born: bornFromAge(years, months) };
    }

    /* ----- Step 2: visit types ----- */
    function renderServices() {
      var species = state.pet.species, list = $('[data-service-options]', bookingForm);
      var ids = Object.keys(SERVICES).filter(function (id) { return SERVICES[id].pets.indexOf(species) !== -1; });
      if (state.service && ids.indexOf(state.service) === -1) state.service = null;
      if (!state.service && preService && ids.indexOf(preService) !== -1) state.service = preService;
      $('[data-service-intro]', bookingForm).textContent = 'Visits we offer for ' + state.pet.name + '. Every visit includes time for your questions.';
      list.innerHTML = ids.map(function (id) {
        var s = SERVICES[id];
        return '<label class="choice"><input type="radio" name="service" value="' + id + '"' + (id === state.service ? ' checked' : '') + '>' +
          '<span class="choice-box flex items-start gap-3"><span class="choice-tick mt-0.5">' + ICON.check + '</span><span class="min-w-0">' +
          '<span class="block font-bold text-ink">' + esc(s.label) + '</span><span class="block text-[.95rem]">' + esc(s.note) + '</span>' +
          '<span class="mt-1 block text-sm font-semibold text-muted">' + s.minutes + ' min · ' + esc(s.price) + '</span></span></span></label>';
      }).join('');
    }
    bookingForm.addEventListener('change', function (e) {
      if (e.target.name === 'service') { state.service = e.target.value; state.slot = null; state.day = null; clearError(2); updateSummary(); }
      if (e.target.name === 'vet') { state.vet = e.target.value; state.slot = null; state.day = null; state.page = 0; renderDays(true); updateSummary(); }
    });

    /* ----- Step 3: vet, day and time ----- */
    function renderVets() {
      var ids = vetsFor(state.service, state.pet.species);
      if (state.vet !== 'any' && ids.indexOf(state.vet) === -1) state.vet = 'any';
      if (preVet && ids.indexOf(preVet) !== -1) { state.vet = preVet; preVet = null; }
      var opts = [['any', 'First available', ids.length === 1 ? VETS[ids[0]].short + ' is the only vet for this visit' : 'Any of our ' + plural(ids.length, 'vet') + ' for this visit']]
        .concat(ids.map(function (id) { return [id, VETS[id].name, 'Sees ' + VETS[id].pets.map(function (p) { return SPECIES[p].plural; }).join(', ').replace(/, ([^,]*)$/, ' and $1')]; }));
      $('[data-vet-options]', bookingForm).innerHTML = opts.map(function (o) {
        return '<label class="choice"><input type="radio" name="vet" value="' + o[0] + '"' + (o[0] === state.vet ? ' checked' : '') + '>' +
          '<span class="choice-box flex items-start gap-3"><span class="choice-tick mt-0.5">' + ICON.check + '</span><span><span class="block font-bold text-ink">' + esc(o[1]) + '</span><span class="block text-sm">' + esc(o[2]) + '</span></span></span></label>';
      }).join('');
    }
    function dayKeys() {
      var today = clinicNow().key, out = [];
      for (var i = 0; i < BOOKING.daysPerPage; i++) out.push(addDays(today, state.page * BOOKING.daysPerPage + i));
      return out;
    }
    function renderDays(pickFirst) {
      var now = clinicNow();
      if (pickFirst || !state.day) {
        // Jump to the first day with times.
        state.day = null;
        for (var i = 0; i < horizonDays(); i++) {
          var k = addDays(now.key, i);
          if (slotsFor(state.service, state.pet.species, state.vet, k, now).length) { state.day = k; state.page = Math.floor(i / BOOKING.daysPerPage); break; }
        }
      }
      var keys = dayKeys();
      $('[data-week-label]', bookingForm).textContent = dateLabel(keys[0], { month: 'short', day: 'numeric' }) + ' – ' + dateLabel(keys[keys.length - 1], { month: 'short', day: 'numeric' });
      $('[data-week-prev]', bookingForm).disabled = state.page === 0;
      $('[data-week-next]', bookingForm).disabled = state.page >= BOOKING.pages - 1;
      $('[data-days]', bookingForm).innerHTML = keys.map(function (k) {
        var n = slotsFor(state.service, state.pet.species, state.vet, k, now).length, closed = holidayOn(k);
        var label = dateLabel(k, { weekday: 'long', month: 'long', day: 'numeric' }) + ', ' + (closed ? 'closed for ' + closed : n ? plural(n, 'time') + ' free' : 'no times free');
        return '<button type="button" class="day" data-day-key="' + k + '" aria-pressed="' + (k === state.day) + '" aria-label="' + esc(label) + '"' + (n ? '' : ' disabled') + '>' +
          '<small>' + dateLabel(k, { weekday: 'short' }) + '</small><span class="day-num">' + Number(k.slice(8)) + '</span><small>' + dateLabel(k, { month: 'short' }) + '</small></button>';
      }).join('');
      renderSlots();
    }
    function renderSlots() {
      var box = $('[data-slots]', bookingForm), empty = $('[data-slot-empty]', bookingForm);
      var slots = state.day ? slotsFor(state.service, state.pet.species, state.vet, state.day) : [];
      if (state.slot && !slots.some(function (s) { return s.key === state.slot.key && s.mins === state.slot.mins; })) state.slot = null;
      box.innerHTML = slots.map(function (s) {
        var on = state.slot && state.slot.key === s.key && state.slot.mins === s.mins;
        return '<button type="button" class="slot" data-slot="' + s.mins + '" data-vet-id="' + s.vet + '" aria-pressed="' + Boolean(on) + '" aria-label="' + fmtTime(s.mins) + ' with ' + esc(VETS[s.vet].short) + '">' + fmtTime(s.mins) + '</button>';
      }).join('');
      box.hidden = !slots.length;
      if (!slots.length) {
        empty.textContent = state.day ? 'No times left on this day. Try another day or vet.' : 'No times free in the next ' + horizonDays() + ' days for this choice. Try “First available” or call ' + CLINIC.phone + '.';
        empty.hidden = false;
      } else empty.hidden = true;
      updateSummary();
    }
    $('[data-days]', bookingForm).addEventListener('click', function (e) {
      var b = e.target.closest('[data-day-key]');
      if (!b || b.disabled) return;
      state.day = b.getAttribute('data-day-key');
      $$('[data-day-key]', bookingForm).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      renderSlots();
    });
    $('[data-slots]', bookingForm).addEventListener('click', function (e) {
      var b = e.target.closest('[data-slot]');
      if (!b) return;
      state.slot = { key: state.day, mins: Number(b.getAttribute('data-slot')), vet: b.getAttribute('data-vet-id') };
      $$('[data-slot]', bookingForm).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      clearError(3);
      updateSummary();
    });
    $('[data-week-prev]', bookingForm).addEventListener('click', function () { if (state.page > 0) { state.page--; state.day = firstOpenOnPage(); renderDays(false); } });
    $('[data-week-next]', bookingForm).addEventListener('click', function () { if (state.page < BOOKING.pages - 1) { state.page++; state.day = firstOpenOnPage(); renderDays(false); } });
    function firstOpenOnPage() {
      var keys = dayKeys();
      for (var i = 0; i < keys.length; i++) if (slotsFor(state.service, state.pet.species, state.vet, keys[i]).length) return keys[i];
      return null;
    }

    /* ----- Step 4: details ----- */
    var detailRules = {
      'b-name': function (v) { return v.trim() ? '' : 'Enter your name.'; },
      'b-phone': function (v) { return (v.match(/\d/g) || []).length >= 10 ? '' : 'Enter a phone number with area code, like ' + CLINIC.phone + '.'; },
      'b-email': function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Enter an email address like name@example.com.'; }
    };

    /* ----- Errors, steps and summary ----- */
    function fieldError(input, msg) {
      var el = document.getElementById(input.getAttribute('aria-describedby').split(' ')[0]);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (el) { el.textContent = msg; el.hidden = !msg; }
    }
    function stepEl(n) { return steps[n - 1]; }
    function showError(n, msg) { var e = $('[data-step-error]', stepEl(n)); e.textContent = msg; }
    function clearError(n) { var e = $('[data-step-error]', stepEl(n)); if (e) e.textContent = ''; }
    function validate(n) {
      if (n === 1) {
        state.day = null;
        state.slot = null;
        if (!newPetMode()) { state.pet = currentPet(); return !!state.pet; }
        var name = $('#b-pet-name'), ok = true, first = null;
        var nameMsg = cleanText(name.value, 30) ? '' : 'Enter your pet’s name.';
        fieldError(name, nameMsg);
        if (nameMsg) { ok = false; first = name; }
        var sp = $('#b-species-error');
        var spMsg = selectedSpecies() ? '' : 'Choose a species.';
        sp.textContent = spMsg; sp.hidden = !spMsg;
        if (spMsg) { ok = false; first = first || $('input[name="species"]', bookingForm); }
        if (!ok) { showError(1, 'Please check the highlighted fields.'); first.focus(); return false; }
        var pet = currentPet();
        if ($('[data-remember]', bookingForm).checked) {
          var match = pets.filter(function (p) { return p.name.toLowerCase() === pet.name.toLowerCase() && p.species === pet.species; })[0];
          if (match) { match.born = pet.born; match.kind = pet.kind; pet = match; }
          else {
            if (pets.length >= BOOKING.maxPets) pets.pop();
            pet.id = 'p' + Date.now().toString(36);
            pets.unshift(pet);
          }
          savePets(pets);
          state.pet = pet;
          renderPets(pet.id);
          toast(pet.name + ' is saved on this device');
        } else state.pet = pet;
        return true;
      }
      if (n === 2) { if (!state.service) { showError(2, 'Choose the kind of visit.'); var r = $('input[name="service"]', bookingForm); if (r) r.focus(); return false; } return true; }
      if (n === 3) { if (!state.slot) { showError(3, 'Choose a day and a time.'); var s = $('[data-slot]', bookingForm) || $('[data-vet-options] input', bookingForm); if (s) s.focus(); return false; } return true; }
      if (n === 4) {
        var bad = null;
        Object.keys(detailRules).forEach(function (id) {
          var input = document.getElementById(id), msg = detailRules[id](input.value);
          fieldError(input, msg);
          if (msg && !bad) bad = input;
        });
        var consent = $('input[name="consent"]', bookingForm), cm = consent.checked ? '' : 'Please check this box to continue.';
        fieldError(consent, cm);
        if (cm && !bad) bad = consent;
        if (bad) { showError(4, 'Please check the highlighted fields.'); bad.focus(); return false; }
        clearError(4);
        return true;
      }
      return true;
    }
    function go(n, focus) {
      state.step = n;
      steps.forEach(function (s, i) { s.hidden = i !== n - 1; });
      stepsNav.forEach(function (li, i) {
        li.setAttribute('data-state', i + 1 < n ? 'done' : i + 1 === n ? 'current' : 'todo');
        if (i + 1 === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      if (n === 2) renderServices();
      if (n === 3) { renderVets(); renderDays(!state.day); }
      updateSummary();
      if (focus !== false) {
        var t = $('[data-step-title]', stepEl(n));
        t.focus({ preventScroll: true });
        var top = bookingForm.getBoundingClientRect().top + window.scrollY - 140;
        if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
    }
    bookingForm.addEventListener('click', function (e) {
      if (e.target.closest('[data-next]')) { if (validate(state.step)) { clearError(state.step); go(state.step + 1); } }
      else if (e.target.closest('[data-back]')) go(state.step - 1);
    });
    $('#b-pet-name').addEventListener('input', function () { if (this.getAttribute('aria-invalid') === 'true' && this.value.trim()) fieldError(this, ''); updateSummary(); });
    Object.keys(detailRules).forEach(function (id) {
      document.getElementById(id).addEventListener('blur', function () { if (this.value) fieldError(this, detailRules[id](this.value)); });
    });

    function setSum(k, v) { var el = $('[data-sum="' + k + '"]'); if (el) el.textContent = v; }
    function updateSummary() {
      var pet = state.step === 1 ? currentPet() : state.pet;
      setSum('pet', pet && pet.name && pet.species ? pet.name + ' (' + (pet.kind || SPECIES[pet.species].label.toLowerCase()) + ')' : 'Not chosen yet');
      var svc = state.service && SERVICES[state.service];
      setSum('service', svc ? svc.label + ', ' + svc.minutes + ' min' : 'Not chosen yet');
      setSum('vet', state.slot ? VETS[state.slot.vet].name : state.vet !== 'any' ? VETS[state.vet].name : 'First available');
      setSum('when', state.slot ? dateLabel(state.slot.key, { weekday: 'long', month: 'long', day: 'numeric' }) + ' at ' + fmtTime(state.slot.mins) : 'Not chosen yet');
      setSum('price', svc ? svc.price + '. Typical starting price; we’ll confirm costs at the visit.' : 'Prices are shown once you pick a visit type.');
    }

    bookingForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (state.step !== 4) { if (validate(state.step)) go(state.step + 1); return; }
      if (!validate(4)) return;
      /* Connect here: send the request to your practice software or a form service, e.g.
         fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(bookingForm), headers: { Accept: 'application/json' } }) */
      var svc = SERVICES[state.service];
      $('[data-success-text]', success).textContent = state.pet.name + ' · ' + svc.label + ' · ' + dateLabel(state.slot.key, { weekday: 'long', month: 'long', day: 'numeric' }) + ' at ' + fmtTime(state.slot.mins) + ' with ' + VETS[state.slot.vet].name + '.';
      $('[data-success-ref]', success).textContent = makeRef('SW');
      $('[data-success-art]', success).innerHTML = petArt(SPECIES[state.pet.species].art, 'size-20');
      var plannerLink = $('[data-success-planner]', success), ps = state.pet.species;
      plannerLink.hidden = ps === 'exotic';
      if (ps !== 'exotic') {
        var m = ageMonths(state.pet);
        plannerLink.href = 'planner.html?pet=' + ps + (m < 4 ? '&age=' + Math.max(1, Math.round(m * 52 / 12) || 1) + '&unit=weeks' : m < 24 ? '&age=' + m + '&unit=months' : '&age=' + Math.floor(m / 12) + '&unit=years');
      }
      bookingForm.hidden = true;
      $('[data-steps-nav]').hidden = true;
      success.hidden = false;
      success.focus();
    });
    $('[data-booking-restart]', success).addEventListener('click', function () {
      bookingForm.reset();
      state = { step: 1, pet: null, service: null, vet: 'any', slot: null, page: 0, day: null };
      preService = null;
      $$('[data-error]', bookingForm).forEach(function (el) { el.hidden = true; });
      $$('[aria-invalid]', bookingForm).forEach(function (el) { el.removeAttribute('aria-invalid'); });
      success.hidden = true;
      bookingForm.hidden = false;
      $('[data-steps-nav]').hidden = false;
      renderPets(pets.length ? pets[0].id : null);
      updateCount($('#b-notes'));
      go(1);
    });

    renderPets(null);
    go(1, false);
  })();

  /* ======================================================================
     9. Vaccine & wellness planner (planner.html)
     ====================================================================== */
  var planner = $('[data-planner]');
  if (planner) (function () {
    var plan = $('[data-plan]'), ageInput = $('#pl-age'), unitSel = $('#pl-unit'), ageErr = $('#pl-age-error');
    var petName = null;
    var planBg = { dog: 'bg-marigold-200', cat: 'bg-sky-200', rabbit: 'bg-persimmon-200', ferret: 'bg-leaf-200' };

    // URL: ?pet=dog&age=10&unit=weeks
    var pp = param('pet'), pa = parseInt(param('age'), 10), pu = param('unit');
    if (has(PLANNER, pp)) $('input[name="pet"][value="' + pp + '"]', planner).checked = true;
    if (pa >= 1 && pa <= 30) ageInput.value = String(pa);
    if (has(PLANNER_UNITS, pu)) unitSel.value = pu;

    // Saved pets from the booking form (dogs, cats, rabbits and ferrets).
    var saved = loadPets().map(function (p) {
      var sp = p.species === 'exotic' ? (/ferret/i.test(p.kind) ? 'ferret' : null) : p.species;
      return sp ? { pet: p, species: sp } : null;
    }).filter(Boolean);
    if (saved.length) {
      $('[data-planner-pets]', planner).hidden = false;
      $('[data-planner-pet-list]', planner).innerHTML = saved.map(function (s, i) {
        return '<button type="button" class="chip" aria-pressed="false" data-use-pet="' + i + '"><span class="chip-icon">' + petArt(s.species === 'ferret' ? 'ferret' : SPECIES[s.species].art, 'size-6') + '</span>' + esc(s.pet.name) + '</button>';
      }).join('');
      planner.addEventListener('click', function (e) {
        var b = e.target.closest('[data-use-pet]');
        if (!b) return;
        var s = saved[Number(b.getAttribute('data-use-pet'))], m = ageMonths(s.pet);
        $('input[name="pet"][value="' + s.species + '"]', planner).checked = true;
        if (m < 4) { ageInput.value = String(Math.max(1, Math.round(m * 52 / 12))); unitSel.value = 'weeks'; }
        else if (m < 24) { ageInput.value = String(m); unitSel.value = 'months'; }
        else { ageInput.value = String(Math.min(30, Math.floor(m / 12))); unitSel.value = 'years'; }
        petName = s.pet.name;
        $$('[data-use-pet]', planner).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        render(true, true);
      });
    }

    function species() { var r = $('input[name="pet"]:checked', planner); return r && has(PLANNER, r.value) ? r.value : 'dog'; }
    function listHTML(items) { return items.map(function (t) { return '<li class="flex gap-2.5">' + ICON.dot + '<span>' + esc(t) + '</span></li>'; }).join(''); }
    function ageLabel(n, unit) { return plural(n, unit.replace(/s$/, '')) + ' old'; }

    function render(fromPet, push) {
      if (!fromPet) { petName = null; $$('[data-use-pet]', planner).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); }
      var sp = species(), data = PLANNER[sp];
      $$('[data-life-for]', planner).forEach(function (el) {
        var on = el.getAttribute('data-life-for') === sp;
        el.hidden = !on;
        if (!on) $('input', el).checked = false;
      });
      $('[data-life-none]', planner).hidden = sp !== 'ferret';
      $('[data-life-none]', planner).textContent = 'No lifestyle questions for ferrets.';

      var n = Number(ageInput.value), unit = has(PLANNER_UNITS, unitSel.value) ? unitSel.value : 'weeks';
      if (!(n >= 1 && n <= 30 && Math.floor(n) === n)) {
        ageInput.setAttribute('aria-invalid', 'true');
        ageErr.textContent = 'Enter a whole number from 1 to 30.';
        ageErr.hidden = false;
        return;
      }
      ageInput.setAttribute('aria-invalid', 'false');
      ageErr.hidden = true;
      if (push) setParams({ pet: sp, age: String(n), unit: unit });

      var weeks = n * PLANNER_UNITS[unit];
      var idx = 0;
      data.stages.forEach(function (s, i) { if (weeks >= s.from) idx = i; });
      var stage = data.stages[idx], next = data.stages[idx + 1];
      var young = weeks < 52;
      $('[data-plan-title]', plan).textContent = (petName || 'Your ' + (young ? data.young : data.adult)) + ', ' + ageLabel(n, unit);
      $('[data-plan-stage]', plan).textContent = stage.name;
      $('[data-plan-art]', plan).className = 'pet-tile size-20 shrink-0 ' + planBg[sp];
      $('[data-plan-art]', plan).innerHTML = petArt(sp === 'ferret' ? 'ferret' : sp, 'size-16');

      $('[data-plan-list="now"]', plan).innerHTML = listHTML(stage.items);
      var nextBlock = $('[data-plan-block="next"]', plan);
      if (next) {
        var days = Math.max(1, Math.round((next.from - weeks) * 7));
        var nk = addDays(clinicNow().key, days);
        var when = days <= 14 ? 'in about ' + plural(Math.max(1, Math.round(days / 7)), 'week') : 'around ' + dateLabel(nk, { month: 'long', year: 'numeric' });
        $('[data-plan-heading="next"]', plan).textContent = 'Coming up ' + when;
        $('[data-plan-list="next"]', plan).innerHTML = '<li class="font-semibold text-ink">' + esc(next.name) + '</li>' + listHTML(next.items);
        nextBlock.hidden = false;
      } else nextBlock.hidden = true;
      $('[data-plan-list="yearly"]', plan).innerHTML = listHTML(data.yearly);

      var extras = [];
      Object.keys(data.extras).forEach(function (k) {
        var box = $('input[name="' + k + '"]', planner);
        if (box && box.checked) extras = extras.concat(data.extras[k]);
      });
      $('[data-plan-list="extras"]', plan).innerHTML = extras.length ? listHTML(extras) : '<li class="text-muted">' + (Object.keys(data.extras).length ? 'Check a lifestyle box to see extra vaccines or checks.' : 'Ferrets don’t usually need lifestyle vaccines.') + '</li>';
      $('[data-plan-book]', plan).href = 'book.html?pet=' + (sp === 'ferret' ? 'exotic' : sp) + '&service=vaccines';
    }
    planner.addEventListener('change', function () { render(false, true); });
    ageInput.addEventListener('input', function () { render(false, true); });
    planner.addEventListener('submit', function (e) { e.preventDefault(); render(false, true); });
    render(false, false);
  })();

  /* ======================================================================
     10. Services filter (services.html)
     ====================================================================== */
  var petFilter = $('[data-pet-filter]');
  if (petFilter) (function () {
    var items = $$('[data-service-list] > li'), count = $('[data-service-count]'), empty = $('[data-service-empty]');
    var LABELS = { all: '', dog: 'dogs', cat: 'cats', rabbit: 'rabbits', exotic: 'small and exotic pets' };
    function apply(pet, push) {
      if (!has(LABELS, pet)) pet = 'all';
      var shown = 0;
      $$('[data-pet]', petFilter).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pet') === pet)); });
      items.forEach(function (li) {
        var on = pet === 'all' || li.getAttribute('data-pets').split(' ').indexOf(pet) !== -1;
        li.hidden = !on;
        if (on) shown++;
        var link = $('[data-book-link]', li);
        if (link) {
          var base = link.getAttribute('data-base') || link.getAttribute('href');
          link.setAttribute('data-base', base);
          link.setAttribute('href', pet === 'all' || /[?&]pet=/.test(base) ? base : base + '&pet=' + pet);
        }
      });
      count.textContent = 'Showing ' + plural(shown, 'service') + (pet === 'all' ? '' : ' for ' + LABELS[pet]);
      empty.hidden = shown > 0;
      if (push) setParams({ pet: pet === 'all' ? null : pet });
    }
    petFilter.addEventListener('click', function (e) { var b = e.target.closest('[data-pet]'); if (b) apply(b.getAttribute('data-pet'), true); });
    $('[data-pet-reset]').addEventListener('click', function () { apply('all', true); });
    apply(param('pet'), false);
  })();

  /* ======================================================================
     11. Team: who's in today (team.html)
     ====================================================================== */
  $$('[data-vet-status]').forEach(function (el) {
    var id = el.getAttribute('data-vet-status');
    if (!has(VETS, id)) return;
    var render = function () {
      var now = clinicNow(), vet = VETS[id], text = '', open = false;
      for (var i = 0; i < 10 && !text; i++) {
        var key = addDays(now.key, i), sh = vet.shifts[weekday(key)];
        if (!sh || !hoursOn(key)) continue;
        if (i === 0 && now.mins < toMin(sh[1])) {
          open = now.mins >= toMin(sh[0]);
          text = open ? 'In today until ' + fmtTime(toMin(sh[1])) : 'In today from ' + fmtTime(toMin(sh[0]));
        } else if (i > 0) text = 'In the clinic ' + (i === 1 ? 'tomorrow' : dateLabel(key, { weekday: 'long' }));
      }
      el.setAttribute('data-open', String(open));
      $('[data-vet-status-text]', el).textContent = text;
      el.hidden = !text;
    };
    render();
    setInterval(render, 60000);
  });

  /* ======================================================================
     12. Articles: filters and read-more (articles.html)
     ====================================================================== */
  var articleFilter = $('[data-article-filter]');
  if (articleFilter) (function () {
    var cards = $$('[data-article]'), count = $('[data-article-count]'), empty = $('[data-article-empty]');
    var search = $('#a-search'), topic = $('#a-topic'), pet = 'all';
    var PETS = { all: 1, dog: 1, cat: 1, rabbit: 1, exotic: 1 };
    var TOPICS = {};
    $$('option', topic).forEach(function (o) { TOPICS[o.value] = true; });
    var byId = {};
    cards.forEach(function (c) { byId[c.id] = c; c.setAttribute('data-text', c.textContent.toLowerCase().replace(/\s+/g, ' ')); });

    function apply(push) {
      var q = search.value.trim().toLowerCase(), t = topic.value, shown = 0;
      $$('[data-pet]', articleFilter).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pet') === pet)); });
      cards.forEach(function (c) {
        var on = (pet === 'all' || c.getAttribute('data-pets').split(' ').indexOf(pet) !== -1) &&
          (t === 'all' || c.getAttribute('data-topic') === t) &&
          (!q || c.getAttribute('data-text').indexOf(q) !== -1);
        c.hidden = !on;
        if (on) shown++;
      });
      count.textContent = 'Showing ' + plural(shown, 'article');
      empty.hidden = shown > 0;
      if (push) setParams({ pet: pet === 'all' ? null : pet, topic: t === 'all' ? null : t });
    }
    articleFilter.addEventListener('click', function (e) { var b = e.target.closest('[data-pet]'); if (b) { pet = b.getAttribute('data-pet'); apply(true); } });
    topic.addEventListener('change', function () { apply(true); });
    search.addEventListener('input', function () { apply(false); });
    articleFilter.addEventListener('submit', function (e) { e.preventDefault(); });
    $('[data-article-reset]').addEventListener('click', function () { pet = 'all'; topic.value = 'all'; search.value = ''; apply(true); search.focus(); });

    function setOpen(btn, open) {
      var body = document.getElementById(btn.getAttribute('aria-controls'));
      btn.setAttribute('aria-expanded', String(open));
      body.hidden = !open;
      $('[data-toggle-text]', btn).textContent = open ? 'Close the article' : 'Read the article';
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-article-toggle]');
      if (b) setOpen(b, b.getAttribute('aria-expanded') !== 'true');
    });
    function openFromHash() {
      var id = decodeURIComponent(window.location.hash.slice(1));
      if (!has(byId, id)) return;
      var card = byId[id];
      if (card.hidden) { pet = 'all'; topic.value = 'all'; search.value = ''; apply(true); }
      setOpen($('[data-article-toggle]', card), true);
      card.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }
    var up = param('pet'), ut = param('topic');
    if (has(PETS, up)) pet = up;
    if (has(TOPICS, ut)) topic.value = ut;
    apply(false);
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
  })();

  /* ======================================================================
     13. Pricing estimator (pricing.html)
     ====================================================================== */
  var estimator = $('[data-estimator]');
  if (estimator) (function () {
    var up = param('pet');
    if (up === 'dog') up = 'dog-m';
    if (has(PRICE_PETS, up)) $('input[name="pet"][value="' + up + '"]', estimator).checked = true;
    function render(push) {
      var r = $('input[name="pet"]:checked', estimator), pet = r && has(PRICE_PETS, r.value) ? r.value : 'dog-m';
      var low = 0, high = 0, lines = [], hidden = [];
      $$('[data-est-item]', estimator).forEach(function (li) {
        var id = li.getAttribute('data-est-item'), item = has(PRICES, id) ? PRICES[id] : null, pr = item && item[pet];
        var box = $('input', li);
        li.hidden = !pr;
        if (!pr) { box.checked = false; if (item) hidden.push(item.label); return; }
        $('[data-est-range]', li).textContent = range(pr);
        if (box.checked) { low += pr[0]; high += pr[1]; lines.push('<li class="flex justify-between gap-3"><span>' + esc(item.label) + '</span><span class="shrink-0 font-semibold text-ink tabular-nums">' + range(pr) + '</span></li>'); }
      });
      $('[data-est-pet]', estimator).textContent = PRICE_PETS[pet].label;
      $('[data-est-total]', estimator).textContent = lines.length ? range([low, high]) : '$0';
      $('[data-est-count]', estimator).textContent = lines.length ? plural(lines.length, 'service') : 'Check a service to start';
      $('[data-est-lines]', estimator).innerHTML = lines.join('');
      var note = $('[data-est-hidden-note]', estimator);
      note.hidden = !hidden.length;
      note.textContent = hidden.length ? 'Not offered for ' + PRICE_PETS[pet].label.replace(/^an? /, '') + 's: ' + hidden.join(', ').toLowerCase() + '.' : '';
      $('[data-est-book]', estimator).href = 'book.html?pet=' + PRICE_PETS[pet].species;
      if (push) setParams({ pet: pet });
    }
    estimator.addEventListener('change', function (e) { render(e.target.name === 'pet'); });
    estimator.addEventListener('submit', function (e) { e.preventDefault(); });
    render(false);
  })();

  /* ======================================================================
     14. Forms: validation, character counters, contact topic, packing list
     ====================================================================== */
  function updateCount(field) {
    if (!field) return;
    var out = document.getElementById(field.getAttribute('data-count-for'));
    if (!out) return;
    var left = Number(field.getAttribute('maxlength')) - field.value.length;
    out.textContent = plural(left, 'character') + ' left';
  }
  $$('[data-count-for]').forEach(function (f) { f.addEventListener('input', function () { updateCount(f); }); updateCount(f); });

  var topicSel = $('[data-contact-topic]'), pt = param('topic');
  if (topicSel && typeof pt === 'string' && $$('option', topicSel).some(function (o) { return o.value === pt; })) topicSel.value = pt;

  var bring = $('[data-bring]');
  if (bring) {
    var bringCount = function () {
      var boxes = $$('input', bring), n = boxes.filter(function (b) { return b.checked; }).length;
      $('[data-bring-count]').textContent = n === boxes.length ? 'All ' + boxes.length + ' packed. See you soon!' : n + ' of ' + boxes.length + ' packed';
    };
    bring.addEventListener('change', bringCount);
    bringCount();
  }

  function fieldMessage(f) {
    var v = f.value.trim();
    if (f.type === 'checkbox') return f.required && !f.checked ? 'Please check this box to continue.' : '';
    if (f.required && !v) {
      var lbl = f.id && $('label[for="' + f.id + '"]');
      return 'Please fill in ' + (lbl ? lbl.textContent.replace(/\(.*\)/, '').trim().toLowerCase() : 'this field') + '.';
    }
    if (v && f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Enter an email address like name@example.com.';
    var min = Number(f.getAttribute('minlength'));
    if (v && min && v.length < min) return 'Please write at least ' + plural(min, 'character') + '.';
    return '';
  }
  var uid = 0;
  function setFieldError(f, msg) {
    if (!f.id) f.id = 'f-' + (++uid);
    var id = f.id + '-error', el = document.getElementById(id);
    if (!el) {
      el = document.createElement('p');
      el.id = id;
      el.className = 'field-error';
      el.hidden = true;
      var anchor = f.type === 'checkbox' ? f.closest('label') : (f.closest('.flex.flex-col') || f);
      anchor.insertAdjacentElement('afterend', el);
      var d = f.getAttribute('aria-describedby');
      f.setAttribute('aria-describedby', d ? d + ' ' + id : id);
    }
    el.textContent = msg;
    el.hidden = !msg;
    f.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  $$('form[data-validate]').forEach(function (form) {
    var fields = $$('input, textarea, select', form).filter(function (f) { return f.required || f.type === 'email' || f.hasAttribute('minlength'); });
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.getAttribute('aria-invalid') === 'true' || f.value) setFieldError(f, fieldMessage(f)); });
      f.addEventListener('change', function () { if (f.getAttribute('aria-invalid') === 'true') setFieldError(f, fieldMessage(f)); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      fields.forEach(function (f) { var m = fieldMessage(f); setFieldError(f, m); if (m && !first) first = f; });
      var ok = $('[data-success]', form);
      if (first) { if (ok) ok.hidden = true; first.focus(); return; }
      /* Connect here: e.g. fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } }) */
      if (ok) { ok.textContent = form.getAttribute('data-success-text').replace('{ref}', makeRef('SW')); ok.hidden = false; }
      form.reset();
      $$('[data-count-for]', form).forEach(updateCount);
      fields.forEach(function (f) { f.removeAttribute('aria-invalid'); });
    });
  });
})();

/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. Mark your own UI with data-back-to-top-avoid (lift
   above it) or data-back-to-top-hide (hide while covering it). To remove the
   button: delete this block and the .back-to-top styles in src/input.css. */
(function () {
  'use strict';
  if (document.querySelector('.back-to-top')) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.title = 'Back to top';
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var AVOID = '[data-toast], .toast, [data-back-to-top-avoid]';
  var queued = false;

  function isShown(el) {
    var cs = window.getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05;
  }
  function lift() {
    var offset = 0, vw = window.innerWidth, vh = window.innerHeight;
    Array.prototype.forEach.call(document.querySelectorAll(AVOID), function (el) {
      if (!isShown(el)) return;
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.bottom > vh - 140 && r.right > vw - 96 && r.top < vh) offset = Math.max(offset, vh - r.top + 4);
    });
    btn.style.setProperty('--btt-lift', offset + 'px');
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
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !coversHideZone());
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
