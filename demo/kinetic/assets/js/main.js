/* Kinetic (Foothill Performance) — site scripts. Vanilla JavaScript, no dependencies.
   All studio data (hours, coaches, sessions, prices, chart data, plan-builder rules) lives at
   the top of this file. Keep it in step with the HTML pages; see DOCS.md, "Content". */
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

  /* ---------- Studio: time zone, opening hours, closures ----------
     Times are 24-hour wall-clock times in Colorado Springs (Mountain Time). Day 0 is Sunday; null means closed.
     Keep these in step with the hours lists in the HTML (data-hours). */
  var STUDIO = {
    name: 'Foothill Performance',
    timeZone: 'America/Denver',
    zoneName: 'Mountain Time',
    phone: '(719) 555-0146',
    email: 'hello@foothillperformance.example',
    address: 'Suite 3, Carriage Works, 2418 W. Cucharras St, Colorado Springs, CO 80904'
  };
  var HOURS = {
    0: null,
    1: ['06:00', '20:30'],
    2: ['06:00', '20:30'],
    3: ['06:00', '20:30'],
    4: ['06:00', '20:30'],
    5: ['06:00', '20:30'],
    6: ['07:00', '13:00']
  };
  // One-off closures (YYYY-MM-DD, studio date). December 24–28 and US federal holidays are worked out in isClosedDate().
  var CLOSED_DATES = [];

  /* ---------- Coaches ----------
     shifts: the hours each coach takes 1:1 sessions, by weekday (0 = Sunday). */
  var COACHES = {
    ffion: {
      name: 'Ffion Beckett', short: 'Ffion', role: 'Founder & head coach', img: 'assets/img/coach-ffion.svg',
      shifts: { 1: [['06:30', '13:00'], ['16:30', '20:00']], 2: [['06:30', '13:00']], 4: [['06:30', '13:00'], ['16:30', '20:00']], 5: [['06:30', '12:00']], 6: [['08:00', '12:00']] }
    },
    yusuf: {
      name: 'Yusuf Dacre', short: 'Yusuf', role: 'Performance & mobility coach', img: 'assets/img/coach-yusuf.svg',
      shifts: { 1: [['12:00', '20:30']], 2: [['07:00', '11:00'], ['15:00', '20:30']], 3: [['06:00', '14:00'], ['16:00', '20:30']], 4: [['12:00', '20:30']], 6: [['07:00', '13:00']] }
    }
  };

  /* Small-group classes (max 4 people). They block 1:1 slots for the coach who leads them. */
  var GROUP_CLASSES = [
    { day: 1, time: '18:30', coach: 'yusuf', name: 'Engine & strength' },
    { day: 2, time: '07:00', coach: 'ffion', name: 'Barbell basics' },
    { day: 3, time: '18:30', coach: 'yusuf', name: 'Run strong' },
    { day: 4, time: '18:30', coach: 'ffion', name: 'Strength club' },
    { day: 6, time: '09:00', coach: 'ffion', name: 'Saturday strength' }
  ];
  var GROUP_SIZE = 4;

  /* ---------- Session types (book.html) ----------
     minutes: session length. coaches: who offers it, in the order "no preference" tries them.
     notice: minimum minutes between now and the first bookable start.
     screen: true if a "yes" to any health question turns the booking into a call-back request. */
  var SESSIONS = {
    consult: { label: 'Free consultation', minutes: 30, price: 0, priceLabel: 'Free', coaches: ['ffion', 'yusuf'], notice: 120, screen: false },
    pt60: { label: '1:1 personal training', minutes: 60, price: 90, priceLabel: '$90', coaches: ['ffion', 'yusuf'], notice: 720, screen: true },
    pt45: { label: '1:1 express session', minutes: 45, price: 70, priceLabel: '$70', coaches: ['ffion', 'yusuf'], notice: 720, screen: true },
    partner: { label: 'Partner training', minutes: 60, price: 124, priceLabel: '$124 for two', coaches: ['ffion', 'yusuf'], notice: 720, screen: true },
    mobility: { label: 'Movement screen & mobility', minutes: 45, price: 65, priceLabel: '$65', coaches: ['yusuf'], notice: 720, screen: true },
    group: { label: 'Small-group trial', minutes: 60, price: 25, priceLabel: '$25', coaches: ['ffion', 'yusuf'], notice: 180, screen: true, fixed: true }
  };
  var BOOKING = {
    slotStep: 30,          // minutes between 1:1 start times
    weeksAhead: 4,         // weeks shown in the week view, starting with this week
    demoBusyShare: 0.45    // share of slots shown as taken so the demo looks real. Set to 0 when connected.
  };

  /* ---------- Goals (home goal picker, program filters, plan builder) ---------- */
  var GOALS = {
    strength: 'Strength',
    fatloss: 'Fat loss',
    mobility: 'Mobility',
    sport: 'Sport',
    postnatal: 'Postpartum'
  };

  /* ---------- Pricing calculator (pricing.html) ----------
     payg: pay-per-session price by session length. packs: session packs (valid 12 weeks).
     member: per-session rate on a monthly membership, for 1, 2, 3 and 4 sessions a week. */
  var PRICING = {
    payg: { 45: 70, 60: 90 },
    packs: { 45: [{ size: 10, price: 630 }, { size: 20, price: 1190 }], 60: [{ size: 10, price: 810 }, { size: 20, price: 1540 }] },
    packWeeks: 12,
    member: { 45: [62, 58, 55, 52], 60: [80, 74, 70, 66] },
    weeksPerMonth: 52 / 12
  };

  /* ---------- Client progress charts (index.html, results.html) ----------
     unit 'time' values are seconds. better: 'down' flips the axis so progress always rises. */
  var RESULTS = {
    deadlift: { label: 'Trap-bar deadlift', unit: 'lb', x: ['Wk 1', 'Wk 4', 'Wk 8', 'Wk 12', 'Wk 16'], y: [135, 160, 185, 215, 245], better: 'up' },
    fivek: { label: '5K time', unit: 'time', x: ['Wk 1', 'Wk 3', 'Wk 6', 'Wk 9', 'Wk 12'], y: [1872, 1790, 1715, 1650, 1588], better: 'down' },
    steps: { label: 'Average daily steps', unit: 'steps', x: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'], y: [4200, 5600, 6900, 7800, 8900, 9400], better: 'up' },
    reach: { label: 'Toe-touch reach', unit: 'in', x: ['Wk 1', 'Wk 3', 'Wk 6', 'Wk 9', 'Wk 12'], y: [-5.5, -3.5, -2, -0.5, 1], better: 'up' },
    goblet: { label: 'Goblet squat working weight', unit: 'lb', x: ['Wk 2', 'Wk 6', 'Wk 10', 'Wk 14', 'Wk 18'], y: [15, 20, 25, 30, 35], better: 'up' },
    pushups: { label: 'Full push-ups in one set', unit: 'reps', x: ['Wk 1', 'Wk 4', 'Wk 8', 'Wk 12'], y: [0, 3, 7, 12], better: 'up' }
  };

  /* ---------- Plan builder (tools.html) ----------
     Each exercise is [full gym, dumbbells at home, bodyweight only]. Sessions show 3, 4 or 5
     exercises for 30, 45 or 60 minutes. Illustrative only: not a personalized program. */
  var EQUIPMENT = { gym: 0, dumbbells: 1, bodyweight: 2 };
  var FOCUS = {
    fullA: { name: 'Full body A', ex: [['Goblet squat', 'Goblet squat', 'Tempo squat'], ['Romanian deadlift', 'Dumbbell Romanian deadlift', 'Single-leg hip hinge'], ['Bench press', 'Dumbbell floor press', 'Push-up (incline if needed)'], ['Seated cable row', 'One-arm dumbbell row', 'Prone Y-T raise'], ['Dead bug', 'Dead bug', 'Dead bug']] },
    fullB: { name: 'Full body B', ex: [['Trap-bar deadlift', 'Dumbbell deadlift', 'Glute bridge'], ['Split squat', 'Dumbbell split squat', 'Split squat'], ['Lat pulldown', 'Dumbbell pullover', 'Doorway isometric row'], ['Overhead press', 'Half-kneeling dumbbell press', 'Pike push-up'], ['Side plank', 'Suitcase carry', 'Side plank']] },
    fullC: { name: 'Full body C', ex: [['Front squat', 'Dumbbell front squat', 'Cossack squat'], ['Hip thrust', 'Dumbbell hip thrust', 'Single-leg glute bridge'], ['Incline dumbbell press', 'Incline dumbbell press', 'Push-up'], ['Chin-up (assisted)', 'Chest-supported row', 'Towel row'], ['Pallof press', 'Farmer carry', 'Bear crawl']] },
    upper: { name: 'Upper body', ex: [['Bench press', 'Dumbbell floor press', 'Push-up'], ['Chin-up (assisted)', 'One-arm dumbbell row', 'Towel row'], ['Overhead press', 'Seated dumbbell press', 'Pike push-up'], ['Cable face pull', 'Rear-delt fly', 'Prone Y-T raise'], ['Farmer carry', 'Farmer carry', 'Plank shoulder tap']] },
    lower: { name: 'Lower body', ex: [['Back squat', 'Goblet squat', 'Tempo squat'], ['Romanian deadlift', 'Dumbbell Romanian deadlift', 'Single-leg hip hinge'], ['Walking lunge', 'Reverse lunge', 'Reverse lunge'], ['Leg curl', 'Dumbbell hamstring bridge', 'Hamstring walkout'], ['Calf raise', 'Single-leg calf raise', 'Single-leg calf raise']] },
    power: { name: 'Speed & power', ex: [['Box jump', 'Squat jump', 'Squat jump'], ['Medicine-ball throw', 'Dumbbell push press', 'Plyo push-up (incline)'], ['Hang power clean', 'Dumbbell snatch', 'Broad jump'], ['Sled push', 'Shuttle sprint', 'Shuttle sprint'], ['Copenhagen plank', 'Copenhagen plank', 'Copenhagen plank']] },
    conditioning: { name: 'Conditioning', scheme: '20-minute interval circuit, easy to moderate effort', ex: [['Rower intervals', 'Kettlebell swing', 'Fast step-ups'], ['Bike sprints', 'Dumbbell thruster', 'Mountain climbers'], ['Sled push', 'Renegade row', 'Skater hops'], ['Battle ropes', 'Farmer carry', 'Jumping jacks'], ['Cool-down walk', 'Cool-down walk', 'Cool-down walk']] },
    mobility: { name: 'Mobility & control', scheme: '2 rounds, slow and controlled, 30–45 s each', ex: [['90/90 hip switches', '90/90 hip switches', '90/90 hip switches'], ['Thoracic rotations', 'Thoracic rotations', 'Thoracic rotations'], ['Cossack squat', 'Goblet Cossack squat', 'Cossack squat'], ['Cable shoulder CARs', 'Dumbbell halo', 'Shoulder CARs'], ['Couch stretch', 'Couch stretch', 'Couch stretch']] },
    foundations: { name: 'Foundations', scheme: '2 × 8–10 gentle reps, breathing first', ex: [['360° breathing', '360° breathing', '360° breathing'], ['Glute bridge', 'Glute bridge', 'Glute bridge'], ['Box squat', 'Goblet box squat', 'Sit-to-stand'], ['Band row', 'One-arm dumbbell row', 'Wall angel'], ['Bird dog', 'Bird dog', 'Bird dog']] }
  };
  // Training days for 2–5 days a week (0 = Monday ... 6 = Sunday).
  var PLAN_DAYS = { 2: [0, 3], 3: [0, 2, 4], 4: [0, 1, 3, 4], 5: [0, 1, 2, 4, 5] };
  var SPLITS = {
    strength: { 2: ['fullA', 'fullB'], 3: ['fullA', 'fullB', 'fullC'], 4: ['upper', 'lower', 'upper', 'lower'], 5: ['upper', 'lower', 'conditioning', 'upper', 'lower'] },
    fatloss: { 2: ['fullA', 'fullB'], 3: ['fullA', 'conditioning', 'fullB'], 4: ['fullA', 'conditioning', 'fullB', 'conditioning'], 5: ['fullA', 'conditioning', 'fullB', 'mobility', 'conditioning'] },
    mobility: { 2: ['mobility', 'fullA'], 3: ['mobility', 'fullA', 'mobility'], 4: ['mobility', 'fullA', 'mobility', 'fullB'], 5: ['mobility', 'fullA', 'mobility', 'fullB', 'mobility'] },
    sport: { 2: ['power', 'fullA'], 3: ['power', 'fullA', 'conditioning'], 4: ['power', 'lower', 'upper', 'conditioning'], 5: ['power', 'lower', 'upper', 'conditioning', 'mobility'] },
    postnatal: { 2: ['foundations', 'foundations'], 3: ['foundations', 'mobility', 'foundations'], 4: ['foundations', 'mobility', 'foundations', 'mobility'], 5: ['foundations', 'mobility', 'foundations', 'mobility', 'foundations'] }
  };
  var SCHEMES = {
    strength: '4 × 4–6 reps, 2–3 min rest',
    fatloss: '3 × 10–12 reps, 60–90 s rest',
    mobility: '3 × 8–10 slow reps, 90 s rest',
    sport: '4 × 3–5 fast reps, full rest',
    postnatal: '2 × 8–10 gentle reps'
  };
  var PLAN_KEY = 'kinetic-plan';
  var GOAL_KEY = 'kinetic-goal';

  /* ---------- Small helpers ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n, pence) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: pence ? 2 : 0, maximumFractionDigits: pence ? 2 : 0 }); }
  function store(key, value) { try { if (value === null) safeStorage.removeItem(key); else safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage unavailable */ } }
  function read(key) { try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; } }
  // Own-key lookups, so URL or stored values like "constructor" never match built-in properties.
  function has(obj, key) { return (typeof key === 'string' || typeof key === 'number') && Object.prototype.hasOwnProperty.call(obj, key); }
  function param(name) { try { return new URLSearchParams(window.location.search).get(name); } catch (e) { return null; } }
  var ICON = {
    check: '<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16v.01"/></svg>'
  };
  var toastTimer;
  function toast(msg) {
    var t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 3200);
  }

  /* ---------- Time helpers (everything is in the studio's time zone) ---------- */
  function toMin(hhmm) { var p = hhmm.split(':'); return Number(p[0]) * 60 + Number(p[1]); }
  function hhmm(mins) { var h = Math.floor(mins / 60) % 24; return (h % 12 || 12) + ':' + String(mins % 60).padStart(2, '0') + (h < 12 ? ' AM' : ' PM'); }
  function partsIn(date, zone) {
    var out = {};
    new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(date).forEach(function (p) { if (p.type !== 'literal') out[p.type] = parseInt(p.value, 10); });
    if (out.hour === 24) out.hour = 0;
    return out;
  }
  function keyOf(y, m, d) { return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); }
  function addDays(key, n) {
    var d = key.split('-').map(Number), x = new Date(Date.UTC(d[0], d[1] - 1, d[2] + n));
    return keyOf(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate());
  }
  function dayDiff(a, b) {
    var x = a.split('-').map(Number), y = b.split('-').map(Number);
    return Math.round((Date.UTC(y[0], y[1] - 1, y[2]) - Date.UTC(x[0], x[1] - 1, x[2])) / 864e5);
  }
  function weekday(key) { var d = key.split('-').map(Number); return new Date(Date.UTC(d[0], d[1] - 1, d[2])).getUTCDay(); }
  function mondayOf(key) { return addDays(key, -((weekday(key) + 6) % 7)); }
  function dateLabel(key, opts) {
    var d = key.split('-').map(Number);
    return new Date(Date.UTC(d[0], d[1] - 1, d[2], 12)).toLocaleDateString('en-US', Object.assign({ timeZone: 'UTC' }, opts));
  }
  function longDate(key) { return dateLabel(key, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  function studioNow() {
    var p = partsIn(new Date(), STUDIO.timeZone);
    var key = keyOf(p.year, p.month, p.day);
    return { key: key, day: weekday(key), mins: p.hour * 60 + p.minute };
  }
  // Studio wall time -> real instant (for .ics files).
  function wallToInstant(key, mins) {
    var d = key.split('-').map(Number);
    var guess = Date.UTC(d[0], d[1] - 1, d[2], Math.floor(mins / 60), mins % 60);
    var offset = function (t) { var p = partsIn(new Date(t), STUDIO.timeZone); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(t / 60000) * 60000; };
    var off = offset(guess), res = guess - off, off2 = offset(res);
    return new Date(off2 === off ? res : guess - off2);
  }
  function relativeDay(key, today) {
    if (key === today) return 'Today';
    if (key === addDays(today, 1)) return 'Tomorrow';
    return dateLabel(key, { weekday: 'short', day: 'numeric', month: 'short' });
  }
  // A short reference for confirmations, like FP-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  // A stable pseudo-random number per string, so demo "taken" slots don't change between renders.
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }

  /* ---------- Header: shadow on scroll + mobile menu ---------- */
  var header = $('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 40); };
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

  /* ---------- Scroll reveal ----------
     Revealing an element also reveals everything before it, so fast jumps never leave gaps. */
  var reveals = $$('.reveal, .reveal-x, [data-reveal]');
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

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Studio hours: today's row + live open-now badge ---------- */
  /* Closed by rule, for any year: December 24–28 and US federal holidays. A holiday on a Saturday or
     Sunday also closes the studio on the Friday before or the Monday after, the day it's observed. */
  function nthWeekday(y, m, day, n) {
    if (n > 0) return keyOf(y, m, 1 + (day - weekday(keyOf(y, m, 1)) + 7) % 7 + (n - 1) * 7);
    var end = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return keyOf(y, m, end - (weekday(keyOf(y, m, end)) - day + 7) % 7);
  }
  function federalHolidays(y) {
    var out = [nthWeekday(y, 1, 1, 3), nthWeekday(y, 2, 1, 3), nthWeekday(y, 5, 1, -1), nthWeekday(y, 9, 1, 1), nthWeekday(y, 10, 1, 2), nthWeekday(y, 11, 4, 4)];
    [[1, 1], [6, 19], [7, 4], [11, 11], [12, 25]].forEach(function (d) {
      var key = keyOf(y, d[0], d[1]), wd = weekday(key);
      out.push(key);
      if (wd === 6) out.push(addDays(key, -1));
      if (wd === 0) out.push(addDays(key, 1));
    });
    return out;
  }
  function isClosedDate(key) {
    var y = Number(key.slice(0, 4)), md = key.slice(5);
    if (CLOSED_DATES.indexOf(key) !== -1 || (md >= '12-24' && md <= '12-28')) return true;
    // New Year's Day on a Saturday is observed on December 31 of the year before.
    return federalHolidays(y).indexOf(key) !== -1 || (md === '12-31' && weekday(keyOf(y + 1, 1, 1)) === 6);
  }
  function hoursOn(key) { return isClosedDate(key) ? null : HOURS[weekday(key)]; }
  function openStatus() {
    var now = studioNow(), h = hoursOn(now.key);
    if (h && now.mins >= toMin(h[0]) && now.mins < toMin(h[1])) return { open: true, text: 'Open now · until ' + hhmm(toMin(h[1])) };
    for (var i = 0; i < 8; i++) {
      var key = addDays(now.key, i), hh = hoursOn(key);
      if (!hh || (i === 0 && now.mins >= toMin(hh[0]))) continue;
      return { open: false, text: 'Closed · opens ' + (i === 0 ? '' : i === 1 ? 'tomorrow ' : dateLabel(key, { weekday: 'short' }) + ' ') + hhmm(toMin(hh[0])) };
    }
    return { open: false, text: 'Closed now' };
  }
  function renderHours() {
    var now = studioNow(), s = openStatus();
    $$('[data-hours]').forEach(function (list) {
      $$('[data-day]', list).forEach(function (row) { row.setAttribute('data-today', String(Number(row.getAttribute('data-day')) === now.day)); });
    });
    $$('[data-open-status]').forEach(function (el) {
      el.hidden = false;
      el.setAttribute('data-open', String(s.open));
      $('[data-open-text]', el).textContent = s.text;
    });
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- Booking engine: slots from coach shifts, group classes and session length ---------- */
  function groupBusy(coachId, key) {
    var day = weekday(key);
    return GROUP_CLASSES.filter(function (g) { return g.coach === coachId && g.day === day; })
      .map(function (g) { return [toMin(g.time), toMin(g.time) + 60]; });
  }
  function bookable(key, mins, notice, now) {
    return dayDiff(now.key, key) * 1440 + mins - now.mins >= notice;
  }
  // All open starts for one session type on one date. coachPref: a coach id or 'any'.
  function slotsFor(typeId, coachPref, key, now) {
    var type = SESSIONS[typeId];
    now = now || studioNow();
    var hours = hoursOn(key);
    if (!type || !hours || dayDiff(now.key, key) < 0) return [];
    var coaches = coachPref && coachPref !== 'any' ? [coachPref] : type.coaches;
    coaches = coaches.filter(function (c) { return type.coaches.indexOf(c) !== -1; });
    var out = {};
    if (type.fixed) {
      GROUP_CLASSES.forEach(function (g) {
        if (g.day !== weekday(key) || coaches.indexOf(g.coach) === -1) return;
        var start = toMin(g.time);
        if (!bookable(key, start, type.notice, now)) return;
        var spaces = Math.floor(hash(g.coach + key + g.time) * (GROUP_SIZE + 1));
        if (BOOKING.demoBusyShare === 0) spaces = GROUP_SIZE;
        if (spaces > 0) out[start] = { key: key, mins: start, coach: g.coach, note: g.name + ' · ' + spaces + ' of ' + GROUP_SIZE + ' left' };
      });
    } else {
      coaches.forEach(function (c) {
        var shifts = (COACHES[c].shifts[weekday(key)] || []), busy = groupBusy(c, key);
        shifts.forEach(function (sh) {
          var from = Math.max(toMin(sh[0]), toMin(hours[0])), to = Math.min(toMin(sh[1]), toMin(hours[1]));
          for (var t = from; t + type.minutes <= to; t += BOOKING.slotStep) {
            if (out[t]) continue;
            var end = t + type.minutes;
            if (busy.some(function (b) { return t < b[1] && end > b[0]; })) continue;
            if (!bookable(key, t, type.notice, now)) continue;
            if (hash(c + key + t) < BOOKING.demoBusyShare) continue;
            out[t] = { key: key, mins: t, coach: c };
          }
        });
      });
    }
    return Object.keys(out).map(Number).sort(function (a, b) { return a - b; }).map(function (t) { return out[t]; });
  }
  function horizon(now) { return addDays(mondayOf(now.key), BOOKING.weeksAhead * 7 - 1); }
  function firstAvailable(typeId, coachPref) {
    var now = studioNow(), last = horizon(now);
    for (var key = now.key; key <= last; key = addDays(key, 1)) {
      var s = slotsFor(typeId, coachPref, key, now);
      if (s.length) return s[0];
    }
    return null;
  }
  function slotText(slot) { return relativeDay(slot.key, studioNow().key) + ' ' + hhmm(slot.mins); }

  // Home page: the next free consultation.
  $$('[data-next-consult]').forEach(function (el) {
    var s = firstAvailable('consult', 'any');
    $('[data-next-consult-text]', el).textContent = s ? slotText(s) + ' with ' + COACHES[s.coach].short : 'Call us to arrange a time';
    el.hidden = false;
  });

  /* ---------- Goal picker (index.html) ----------
     Radios name="goal" inside [data-goal-picker]; the matching [data-goal-panel] is shown. */
  $$('[data-goal-picker]').forEach(function (root) {
    var radios = $$('input[name="goal"]', root);
    function show(goal, save) {
      $$('[data-goal-panel]', root).forEach(function (p) { p.hidden = p.getAttribute('data-goal-panel') !== goal; });
      if (save) store(GOAL_KEY, goal);
    }
    var saved = read(GOAL_KEY);
    var start = has(GOALS, param('goal')) ? param('goal') : (has(GOALS, saved) ? saved : 'strength');
    radios.forEach(function (r) {
      r.checked = r.value === start;
      r.addEventListener('change', function () { if (r.checked) show(r.value, true); });
    });
    show(start, false);
  });

  /* ---------- Filters (programs and results by goal) ----------
     [data-filter] holds chip buttons [data-filter-value] and items [data-goals="a b"].
     With data-filter-url the choice is kept in ?goal= so filtered views can be shared. */
  $$('[data-filter]').forEach(function (root) {
    var chips = $$('[data-filter-value]', root), items = $$('[data-goals]', root);
    var status = $('[data-filter-status]', root), empty = $('[data-filter-empty]', root);
    var useUrl = root.hasAttribute('data-filter-url');
    chips.forEach(function (chip) {
      var v = chip.getAttribute('data-filter-value');
      var n = v === 'all' ? items.length : items.filter(function (it) { return it.getAttribute('data-goals').split(' ').indexOf(v) !== -1; }).length;
      var c = $('.chip-count', chip);
      if (c) c.textContent = String(n);
    });
    function apply(value, fromUser) {
      if (value !== 'all' && !has(GOALS, value)) value = 'all';
      var shown = 0;
      chips.forEach(function (chip) { chip.setAttribute('aria-pressed', String(chip.getAttribute('data-filter-value') === value)); });
      items.forEach(function (it) {
        var on = value === 'all' || it.getAttribute('data-goals').split(' ').indexOf(value) !== -1;
        it.hidden = !on;
        if (on) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      if (status) status.textContent = value === 'all' ? 'Showing all ' + shown : 'Showing ' + shown + ' for ' + GOALS[value].toLowerCase();
      if (useUrl && fromUser) {
        try {
          var url = new URL(window.location.href);
          if (value === 'all') url.searchParams.delete('goal'); else url.searchParams.set('goal', value);
          window.history.replaceState(null, '', url.pathname.split('/').pop() + url.search + url.hash);
        } catch (e) { /* file:// in some browsers */ }
      }
      if (fromUser && value !== 'all') store(GOAL_KEY, value);
    }
    chips.forEach(function (chip) { chip.addEventListener('click', function () { apply(chip.getAttribute('data-filter-value'), true); }); });
    apply(useUrl && has(GOALS, param('goal')) ? param('goal') : 'all', false);
  });

  /* ---------- Progress charts ----------
     <figure data-chart="deadlift"> gets an inline SVG line chart drawn from RESULTS. */
  function fmt(v, unit) {
    if (unit === 'time') { var m = Math.floor(v / 60), s = Math.round(v % 60); return m + ':' + String(s).padStart(2, '0'); }
    if (unit === 'steps') return Math.round(v).toLocaleString('en-US');
    if (unit === 'in') return (v > 0 ? '+' : '') + v + ' in';
    if (unit === 'reps') return v + ' reps';
    return v + ' ' + unit;
  }
  // Round axis limits to 3-4 friendly steps (minutes for times).
  function niceRange(min, max, unit) {
    var span = max - min || 1, step;
    if (unit === 'time') {
      step = [30, 60, 120, 300, 600, 1800].filter(function (s) { return span / s <= 4; })[0] || 3600;
    } else {
      var base = Math.pow(10, Math.floor(Math.log10(span / 3)));
      step = [1, 2, 5, 10].map(function (m) { return base * m; }).filter(function (s) { return span / s <= 4; })[0];
    }
    return { lo: Math.floor(min / step) * step, hi: Math.ceil(max / step) * step, step: step };
  }
  function renderChart(fig) {
    var id = fig.getAttribute('data-chart'), d = has(RESULTS, id) ? RESULTS[id] : null;
    if (!d) return;
    var W = 340, H = 190, L = 46, R = 16, T = 22, B = 30;
    var r = niceRange(Math.min.apply(null, d.y), Math.max.apply(null, d.y), d.unit);
    var flip = d.better === 'down';
    var x = function (i) { return L + (i * (W - L - R)) / (d.x.length - 1); };
    var y = function (v) { var f = (v - r.lo) / (r.hi - r.lo); if (flip) f = 1 - f; return T + (1 - f) * (H - T - B); };
    var grid = '', ticks = '';
    for (var v = r.lo; v <= r.hi + 1e-9; v += r.step) {
      grid += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '" stroke="#e4e1d8" stroke-width="1"/>';
      ticks += '<text x="' + (L - 8) + '" y="' + (y(v) + 4).toFixed(1) + '" text-anchor="end" font-size="12" fill="#575c7c">' + esc(d.unit === 'time' ? fmt(v, 'time') : d.unit === 'steps' ? (v / 1000) + 'k' : String(v)) + '</text>';
    }
    var pts = d.y.map(function (v, i) { return [x(i), y(v)]; });
    var line = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var area = line + ' L' + pts[pts.length - 1][0].toFixed(1) + ' ' + (H - B) + ' L' + L + ' ' + (H - B) + ' Z';
    var len = 0;
    for (var i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    var last = pts[pts.length - 1], first = d.y[0], end = d.y[d.y.length - 1];
    var labels = d.x.map(function (t, i) { return '<text x="' + x(i).toFixed(1) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="12" fill="#575c7c">' + esc(t) + '</text>'; }).join('');
    var dots = pts.slice(0, -1).map(function (p) { return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4" fill="#fff" stroke="#2b3be0" stroke-width="2.5"/>'; }).join('');
    var tag = fmt(end, d.unit), tw = tag.length * 7.2 + 16;
    var tx = Math.min(last[0] - tw / 2, W - tw), ty = last[1] - 34;
    var summary = d.label + ': ' + fmt(first, d.unit) + ' at ' + d.x[0] + ', ' + fmt(end, d.unit) + ' at ' + d.x[d.x.length - 1] + (flip ? ' (lower is better)' : '') + '.';
    var gid = 'grad-' + id + '-' + Math.floor(hash(fig.className + id) * 1e6);
    fig.querySelector('[data-chart-svg]').innerHTML =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(summary) + '">' +
      '<defs><linearGradient id="' + gid + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3be0" stop-opacity=".22"/><stop offset="1" stop-color="#2b3be0" stop-opacity="0"/></linearGradient></defs>' +
      grid + ticks + labels +
      '<path d="' + area + '" fill="url(#' + gid + ')"/>' +
      '<path class="chart-line" data-draw style="--len:' + Math.ceil(len) + '" d="' + line + '"/>' + dots +
      '<circle cx="' + last[0].toFixed(1) + '" cy="' + last[1].toFixed(1) + '" r="7" fill="#ff5a33" stroke="#fff" stroke-width="3"/>' +
      '<g transform="translate(' + tx.toFixed(1) + ' ' + ty.toFixed(1) + ')"><rect width="' + tw.toFixed(1) + '" height="22" rx="4" fill="#0f1330"/><text x="' + (tw / 2).toFixed(1) + '" y="15.5" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">' + esc(tag) + '</text></g>' +
      '</svg>';
  }
  $$('[data-chart]').forEach(renderChart);

  /* ---------- Form validation ----------
     Fields with data-validate are checked on submit (and live once they have an error).
     Rules come from the HTML: required, type="email", minlength, data-phone. Errors are shown
     inline and linked with aria-describedby. */
  function fieldMessage(field) {
    var v = (field.value || '').trim(), label = field.getAttribute('data-label') || 'This field';
    if (field.type === 'checkbox') return field.required && !field.checked ? (field.getAttribute('data-required-msg') || 'Please check this box to continue.') : '';
    if (field.type === 'radio') {
      var group = $$('input[name="' + field.name + '"]', field.form);
      return field.required && !group.some(function (r) { return r.checked; }) ? (field.getAttribute('data-required-msg') || 'Please choose an option.') : '';
    }
    if (field.required && !v) return field.getAttribute('data-required-msg') || label + ' is required.';
    if (!v) return '';
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Please enter an email address like name@example.com.';
    if (field.hasAttribute('data-phone') && v.replace(/\D/g, '').length < 10) return 'Please enter a phone number with the area code, like (719) 555-0123.';
    if (field.minLength > 0 && v.length < field.minLength) return label + ' needs at least ' + field.minLength + ' characters.';
    return '';
  }
  function errorHost(field) {
    if (field.type === 'radio') {
      var host = field.closest('[data-error-host]');
      if (host) return host;
    }
    return field.closest('[data-field]') || field.parentNode;
  }
  function showError(field, msg) {
    var host = errorHost(field);
    var id = (field.type === 'radio' ? field.name : field.id || field.name) + '-error';
    var el = document.getElementById(id);
    var targets = field.type === 'radio' ? $$('input[name="' + field.name + '"]', field.form) : [field];
    if (msg) {
      if (!el) {
        el = document.createElement('p');
        el.id = id;
        el.className = 'field-error';
        host.appendChild(el);
      }
      el.innerHTML = ICON.alert + '<span>' + esc(msg) + '</span>';
      targets.forEach(function (t) {
        t.setAttribute('aria-invalid', 'true');
        var d = (t.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
        if (d.indexOf(id) === -1) d.push(id);
        t.setAttribute('aria-describedby', d.join(' '));
      });
    } else {
      if (el) el.remove();
      targets.forEach(function (t) {
        t.removeAttribute('aria-invalid');
        var rest = (t.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== id; });
        if (rest.length) t.setAttribute('aria-describedby', rest.join(' ')); else t.removeAttribute('aria-describedby');
      });
    }
  }
  function validateFields(fields) {
    var first = null, seen = {};
    fields.forEach(function (field) {
      if (field.type === 'radio') { if (seen[field.name]) return; seen[field.name] = true; }
      var msg = fieldMessage(field);
      showError(field, msg);
      if (msg && !first) first = field;
    });
    if (first) first.focus();
    return !first;
  }
  function liveValidate(root) {
    var seen = {};
    $$('[data-validate]', root).forEach(function (field) {
      if (field.type === 'radio') { if (seen[field.name]) return; seen[field.name] = true; }
      var evt = field.type === 'checkbox' || field.type === 'radio' || field.tagName === 'SELECT' ? 'change' : 'input';
      var recheck = function () { if (field.getAttribute('aria-invalid') === 'true') showError(field, fieldMessage(field)); };
      // A radio group's error clears when any option in it is picked.
      var targets = field.type === 'radio' ? $$('input[name="' + field.name + '"]', field.form) : [field];
      targets.forEach(function (t) {
        t.addEventListener(evt, recheck);
        t.addEventListener('blur', recheck);
      });
    });
  }

  /* Contact form (contact.html). Demo only: nothing is sent.
     To connect it, set the form's action to your endpoint (e.g. https://formspree.io/f/yourid)
     and replace the success block below with a fetch() POST. See DOCS.md, "Forms". */
  $$('[data-contact-form]').forEach(function (form) {
    liveValidate(form);
    var goal = param('goal');
    if (has(GOALS, goal) && form.elements.goal) form.elements.goal.value = goal;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateFields($$('[data-validate]', form))) return;
      var done = $('[data-form-success]', form.parentNode);
      $('[data-success-name]', done).textContent = form.elements.name.value.trim().split(' ')[0];
      $('[data-success-ref]', done).textContent = makeRef('FP');
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
    var again = $('[data-form-again]', form.parentNode);
    if (again) again.addEventListener('click', function () {
      form.reset();
      form.hidden = false;
      $('[data-form-success]', form.parentNode).hidden = true;
      form.elements[0].focus();
    });
  });

  /* ---------- Pricing calculator (pricing.html) ----------
     Compares pay-per-session, the best session pack and a monthly membership for
     1–4 sessions a week of 45 or 60 minutes. */
  $$('[data-calculator]').forEach(function (root) {
    var perWeek = 2, length = 60;
    var out = function (name) { return $('[data-calc="' + name + '"]', root); };
    var minus = $('[data-calc-minus]', root), plus = $('[data-calc-plus]', root);
    function costs() {
      var perMonth = perWeek * PRICING.weeksPerMonth;
      var payg = PRICING.payg[length] * perMonth;
      var inValidity = perWeek * PRICING.packWeeks;
      var packs = PRICING.packs[length].filter(function (p) { return p.size <= inValidity; });
      var pack = packs[packs.length - 1] || PRICING.packs[length][0];
      var packPer = pack.price / pack.size;
      var memberPer = PRICING.member[length][perWeek - 1];
      var member = Math.round(memberPer * perWeek * PRICING.weeksPerMonth);
      return { perMonth: perMonth, payg: Math.round(payg), pack: Math.round(packPer * perMonth), packSize: pack.size, packPer: packPer, member: member, memberPer: memberPer };
    }
    function render() {
      var c = costs();
      $('output', root).textContent = String(perWeek);
      minus.disabled = perWeek <= 1;
      plus.disabled = perWeek >= 4;
      out('sessions').textContent = '≈ ' + c.perMonth.toFixed(1).replace('.0', '') + ' sessions a month';
      out('payg').textContent = money(c.payg);
      out('payg-per').textContent = money(PRICING.payg[length]) + ' a session';
      out('pack').textContent = money(c.pack);
      out('pack-per').textContent = c.packSize + '-session pack · ' + money(c.packPer, c.packPer % 1 !== 0) + ' a session';
      out('member').textContent = money(c.member);
      out('member-per').textContent = money(c.memberPer) + ' a session, billed monthly';
      var max = Math.max(c.payg, c.pack, c.member);
      [['payg', c.payg], ['pack', c.pack], ['member', c.member]].forEach(function (row) {
        var bar = $('[data-bar="' + row[0] + '"]', root);
        bar.style.setProperty('--w', Math.round((row[1] / max) * 100) + '%');
      });
      var best = c.member <= c.pack ? 'member' : 'pack';
      $$('[data-calc-row]', root).forEach(function (r) { r.toggleAttribute('data-best', r.getAttribute('data-calc-row') === best); });
      var saving = c.payg - Math.min(c.member, c.pack);
      out('best').textContent = best === 'member' ? 'Membership' : 'A ' + c.packSize + '-session pack';
      out('saving').textContent = money(saving) + ' a month (about ' + money(saving * 12) + ' a year)';
    }
    minus.addEventListener('click', function () { if (perWeek > 1) { perWeek--; render(); } });
    plus.addEventListener('click', function () { if (perWeek < 4) { perWeek++; render(); } });
    $$('input[name="calc-length"]', root).forEach(function (r) {
      r.addEventListener('change', function () { if (r.checked) { length = Number(r.value); render(); } });
    });
    render();
  });

  /* ---------- Plan builder (tools.html) ----------
     Builds an illustrative weekly split from days, goal, equipment and session length.
     The inputs are saved in localStorage under PLAN_KEY. */
  $$('[data-plan-builder]').forEach(function (form) {
    var grid = $('[data-plan-grid]', form.parentNode), summary = $('[data-plan-summary]', form.parentNode);
    var postnatalNote = $('[data-plan-postnatal]', form.parentNode);
    var DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    function state() {
      var f = form.elements;
      return { days: Number(f.days.value), goal: f['plan-goal'].value, equipment: f.equipment.value, minutes: Number(f.minutes.value) };
    }
    function valid(s) {
      return s && typeof s === 'object' && has(PLAN_DAYS, s.days) && has(GOALS, s.goal) && has(EQUIPMENT, s.equipment) && [30, 45, 60].indexOf(s.minutes) !== -1;
    }
    function setRadio(name, value) { $$('input[name="' + name + '"]', form).forEach(function (r) { r.checked = r.value === String(value); }); }
    function render(save) {
      var s = state();
      if (!valid(s)) return;
      var days = PLAN_DAYS[s.days], split = SPLITS[s.goal][s.days], count = s.minutes === 30 ? 3 : s.minutes === 45 ? 4 : 5;
      var eq = EQUIPMENT[s.equipment];
      grid.innerHTML = DAY_NAMES.map(function (name, i) {
        var at = days.indexOf(i);
        if (at === -1) {
          var rest = s.goal === 'mobility' || s.goal === 'postnatal' ? '10-minute walk and gentle mobility' : (i === 6 ? 'Full rest' : 'Rest or an easy walk');
          return '<li class="plan-day" data-type="rest"><p class="day-name text-muted">' + name.slice(0, 3) + '</p><p class="mt-2 text-sm font-bold text-muted">' + rest + '</p></li>';
        }
        var f = FOCUS[split[at]];
        var list = f.ex.slice(0, count).map(function (e) { return '<li class="flex gap-2"><span class="mt-[.55rem] size-1.5 shrink-0 -skew-x-12 bg-flare-500" aria-hidden="true"></span><span>' + esc(e[eq]) + '</span></li>'; }).join('');
        return '<li class="plan-day" data-type="train" data-focus="' + split[at] + '"><p class="day-name">' + name.slice(0, 3) + '</p>' +
          '<p class="card-title mt-2 text-xl text-cobalt-700">' + esc(f.name) + '</p>' +
          '<p class="mt-1 text-xs font-bold text-muted">' + esc(f.scheme || SCHEMES[s.goal]) + '</p>' +
          '<ul class="mt-3 grid gap-1.5 text-sm text-ink">' + list + '</ul></li>';
      }).join('');
      summary.textContent = s.days + ' days a week · ' + GOALS[s.goal] + ' · ' + $('input[name="equipment"]:checked + span', form).textContent + ' · ' + s.minutes + ' minutes';
      postnatalNote.hidden = s.goal !== 'postnatal';
      if (save) store(PLAN_KEY, s);
    }
    var saved = read(PLAN_KEY);
    if (valid(saved)) {
      setRadio('days', saved.days); setRadio('plan-goal', saved.goal); setRadio('equipment', saved.equipment); setRadio('minutes', saved.minutes);
    } else {
      if (saved !== null) store(PLAN_KEY, null);
      var g = param('goal') || read(GOAL_KEY);
      if (has(GOALS, g)) setRadio('plan-goal', g);
    }
    form.addEventListener('change', function () { render(true); });
    form.addEventListener('submit', function (e) { e.preventDefault(); render(true); });
    var reset = $('[data-plan-reset]', form.parentNode);
    if (reset) reset.addEventListener('click', function () {
      store(PLAN_KEY, null);
      setRadio('days', 3); setRadio('plan-goal', 'strength'); setRadio('equipment', 'gym'); setRadio('minutes', 45);
      render(false);
      toast('Plan reset to the defaults.');
    });
    var print = $('[data-plan-print]', form.parentNode);
    if (print) print.addEventListener('click', function () { window.print(); });
    render(false);
  });

  /* ---------- One-rep max estimate (tools.html) ----------
     Epley formula: weight × (1 + reps ÷ 30). Illustrative only. */
  var ORM_TABLE = [[95, 2], [90, 4], [85, 6], [80, 8], [75, 10], [70, 12], [65, 15], [60, 18]];
  $$('[data-orm]').forEach(function (form) {
    var res = $('[data-orm-result]', form.parentNode), table = $('[data-orm-table]', form.parentNode);
    function round(v, unit) { var step = unit === 'kg' ? 2.5 : 5; return Math.round(v / step) * step; }
    function calc() {
      var w = parseFloat(form.elements.weight.value), r = parseInt(form.elements.reps.value, 10), unit = form.elements.unit.value;
      var ok = w > 0 && w < 1000 && r >= 1 && r <= 12;
      if (!ok) { res.textContent = '–'; table.innerHTML = ''; return false; }
      var est = r === 1 ? w : w * (1 + r / 30);
      res.textContent = round(est, unit) + ' ' + unit;
      table.innerHTML = ORM_TABLE.map(function (row) {
        return '<tr class="border-t border-line"><td class="py-2 pr-3 font-bold text-ink">' + row[0] + '%</td><td class="py-2 pr-3 tnum">' + round(est * row[0] / 100, unit) + ' ' + unit + '</td><td class="py-2 text-muted">about ' + row[1] + ' reps</td></tr>';
      }).join('');
      return true;
    }
    liveValidate(form);
    form.addEventListener('input', function () { if (form.elements.weight.value && form.elements.reps.value) calc(); });
    form.addEventListener('change', calc);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (validateFields($$('[data-validate]', form))) calc();
    });
    calc();
  });

  /* ---------- Pace calculator (tools.html) ---------- */
  var DISTANCES = { '5k': 5, '10k': 10, half: 21.0975, marathon: 42.195 };
  function clock(sec) {
    sec = Math.round(sec);
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
    return (h ? h + ':' + String(m).padStart(2, '0') : m) + ':' + String(s).padStart(2, '0');
  }
  $$('[data-pace]').forEach(function (form) {
    var custom = $('[data-pace-custom]', form);
    function km() {
      var d = form.elements.distance.value;
      return d === 'custom' ? parseFloat(form.elements.km.value) * 1.609344 : DISTANCES[d];
    }
    function calc() {
      custom.hidden = form.elements.distance.value !== 'custom';
      var f = form.elements, dist = km();
      var total = (parseInt(f.h.value, 10) || 0) * 3600 + (parseInt(f.m.value, 10) || 0) * 60 + (parseInt(f.s.value, 10) || 0);
      var out = function (n) { return $('[data-pace-out="' + n + '"]', form.parentNode); };
      if (!(dist > 0 && dist <= 250) || total <= 0) {
        ['km', 'mile', 'speed'].forEach(function (n) { out(n).textContent = '–'; });
        out('table').innerHTML = '';
        return;
      }
      var perKm = total / dist;
      out('km').textContent = clock(perKm) + ' /km';
      out('mile').textContent = clock(perKm * 1.609344) + ' /mile';
      out('speed').textContent = (dist / 1.609344 / (total / 3600)).toFixed(1) + ' mph';
      out('table').innerHTML = [['5K', 5], ['10K', 10], ['Half marathon', 21.0975], ['Marathon', 42.195]].map(function (row) {
        return '<tr class="border-t border-line"><td class="py-2 pr-3 font-bold text-ink">' + row[0] + '</td><td class="py-2 tnum">' + clock(perKm * row[1]) + '</td></tr>';
      }).join('');
    }
    form.addEventListener('input', calc);
    form.addEventListener('change', calc);
    form.addEventListener('submit', function (e) { e.preventDefault(); calc(); });
    calc();
  });

  /* ---------- Booking flow (book.html) ----------
     Steps: 1 session type, 2 coach, 3 week view and time, 4 details and health questions,
     5 confirmation. Demo only: nothing is booked or sent. To connect a real booking system,
     replace slotsFor() with your availability API and the submit handler with a POST. */
  var booking = $('[data-booking]');
  if (booking) initBooking(booking);

  function initBooking(root) {
    var form = $('form', root);
    var state = { step: 1, type: null, coach: 'any', slot: null, week: null, request: false };
    var panels = $$('[data-step]', root), bar = $$('.step', root);
    var now = studioNow();
    var firstWeek = mondayOf(now.key);

    function setStep(n, focus) {
      state.step = n;
      panels.forEach(function (p) { p.hidden = Number(p.getAttribute('data-step')) !== n; });
      bar.forEach(function (b, i) {
        var s = i + 1 < n ? 'done' : i + 1 === n ? 'current' : 'todo';
        b.setAttribute('data-state', s);
        if (s === 'current') b.setAttribute('aria-current', 'step'); else b.removeAttribute('aria-current');
      });
      $('[data-step-count]', root).textContent = 'Step ' + Math.min(n, 4) + ' of 4';
      $('[data-progress]', root).hidden = n === 5;
      $('[data-summary]', root).hidden = n === 5;
      if (focus) {
        var h = $$('[data-step="' + n + '"] [data-step-heading]', root).filter(function (el) { return el.offsetParent !== null; })[0];
        if (h) h.focus({ preventScroll: true });
        var top = root.getBoundingClientRect().top + window.scrollY - 90;
        if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }
    }
    function stepError(n, msg) {
      var el = $('[data-step="' + n + '"] [data-step-error]', root);
      if (!el) return;
      el.hidden = !msg;
      el.innerHTML = msg ? ICON.alert + '<span>' + esc(msg) + '</span>' : '';
    }

    /* Summary sidebar */
    function renderSummary() {
      var t = SESSIONS[state.type];
      $('[data-sum="type"]', root).textContent = t ? t.label + ' · ' + t.minutes + ' min' : 'Not chosen yet';
      $('[data-sum="coach"]', root).textContent = state.slot ? COACHES[state.slot.coach].name : state.coach === 'any' ? 'No preference' : COACHES[state.coach].name;
      $('[data-sum="time"]', root).textContent = state.slot ? dateLabel(state.slot.key, { weekday: 'short', day: 'numeric', month: 'short' }) + ', ' + hhmm(state.slot.mins) : 'Not chosen yet';
      $('[data-sum="price"]', root).textContent = t ? t.priceLabel : '–';
    }

    /* Step 1: session type */
    $$('input[name="type"]', root).forEach(function (r) {
      r.addEventListener('change', function () {
        if (!r.checked) return;
        state.type = r.value;
        stepError(1, '');
        // A coach who doesn't offer this session can't stay selected.
        if (state.coach !== 'any' && SESSIONS[state.type].coaches.indexOf(state.coach) === -1) state.coach = 'any';
        state.slot = null;
        renderCoaches();
        renderSummary();
      });
    });

    /* Step 2: coach */
    function renderCoaches() {
      var t = SESSIONS[state.type];
      $$('input[name="coach"]', root).forEach(function (r) {
        var id = r.value, offers = !t || id === 'any' || t.coaches.indexOf(id) !== -1;
        r.disabled = !offers;
        r.checked = id === state.coach;
        var next = $('[data-coach-next="' + id + '"]', root);
        if (next) {
          if (!t) next.textContent = '';
          else if (!offers) next.textContent = 'Doesn’t offer this session';
          else {
            var s = firstAvailable(state.type, id);
            next.textContent = s ? 'Next: ' + slotText(s) + (id === 'any' ? ' with ' + COACHES[s.coach].short : '') : 'No times in the next ' + BOOKING.weeksAhead + ' weeks';
          }
        }
      });
    }
    $$('input[name="coach"]', root).forEach(function (r) {
      r.addEventListener('change', function () {
        if (!r.checked) return;
        state.coach = r.value;
        state.slot = null;
        renderSummary();
      });
    });

    /* Step 3: week view */
    var weekGrid = $('[data-week-grid]', root), weekLabel = $('[data-week-label]', root);
    var prevBtn = $('[data-week-prev]', root), nextBtn = $('[data-week-next]', root);
    var lastWeek = addDays(firstWeek, (BOOKING.weeksAhead - 1) * 7);
    function renderWeek() {
      var today = studioNow(), total = 0;
      var start = state.week;
      weekLabel.textContent = 'Week of ' + dateLabel(start, { day: 'numeric', month: 'long' });
      prevBtn.disabled = start <= firstWeek;
      nextBtn.disabled = start >= lastWeek;
      var html = '';
      for (var i = 0; i < 7; i++) {
        var key = addDays(start, i), slots = slotsFor(state.type, state.coach, key, today);
        total += slots.length;
        var hid = 'day-' + key;
        var closed = !hoursOn(key);
        var past = key < today.key;
        var body;
        if (past) body = '<p class="py-2 text-sm font-bold text-muted">Past</p>';
        else if (closed) body = '<p class="py-2 text-sm font-bold text-muted">' + (isClosedDate(key) ? 'Studio closed' : 'Closed') + '</p>';
        else if (!slots.length) body = '<p class="py-2 text-sm font-bold text-muted">No times left</p>';
        else body = '<div class="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-1">' + slots.map(function (s) {
          var checked = state.slot && state.slot.key === s.key && state.slot.mins === s.mins && state.slot.coach === s.coach;
          var sub = s.note || (state.coach === 'any' ? COACHES[s.coach].short : '');
          return '<label class="slot"><input type="radio" name="slot" value="' + s.key + '|' + s.mins + '|' + s.coach + '"' + (checked ? ' checked' : '') +
            ' aria-label="' + esc(longDate(s.key) + ', ' + hhmm(s.mins) + (sub ? ', ' + sub : '')) + '"><span class="slot-time">' + hhmm(s.mins) + '</span>' + (sub ? '<span class="slot-sub">' + esc(sub) + '</span>' : '') + '</label>';
        }).join('') + '</div>';
        html += '<div class="day-col' + (past ? ' hidden lg:block' : '') + '" role="group" aria-labelledby="' + hid + '"' + (key === today.key ? ' data-today' : '') + '>' +
          '<p class="day-head" id="' + hid + '"><span class="day-name">' + dateLabel(key, { weekday: 'short' }) + '</span><span class="day-date">' + dateLabel(key, { day: 'numeric', month: 'short' }) + (key === today.key ? ' · Today' : '') + '</span></p>' + body + '</div>';
      }
      weekGrid.innerHTML = html;
      $('[data-week-empty]', root).hidden = total > 0;
      $('[data-week-status]', root).textContent = total + (total === 1 ? ' time' : ' times') + ' available in this week';
      $$('input[name="slot"]', weekGrid).forEach(function (r) {
        r.addEventListener('change', function () {
          if (!r.checked) return;
          var p = r.value.split('|');
          state.slot = { key: p[0], mins: Number(p[1]), coach: p[2] };
          stepError(3, '');
          renderSummary();
        });
      });
    }
    prevBtn.addEventListener('click', function () { state.week = addDays(state.week, -7); renderWeek(); });
    nextBtn.addEventListener('click', function () { state.week = addDays(state.week, 7); renderWeek(); });
    function openWeek() {
      if (state.slot) { state.week = mondayOf(state.slot.key); return; }
      var s = firstAvailable(state.type, state.coach);
      state.week = s ? mondayOf(s.key) : firstWeek;
    }

    /* Step 4: details and health questions */
    var health = $$('[data-health] input[type="radio"]', root);
    var outcome = $('[data-health-outcome]', root);
    function healthState() {
      var names = {}, yes = false;
      health.forEach(function (r) { names[r.name] = names[r.name] || false; if (r.checked) { names[r.name] = true; if (r.value === 'yes') yes = true; } });
      var answered = Object.keys(names).every(function (n) { return names[n]; });
      return { answered: answered, yes: yes };
    }
    function renderHealth() {
      var h = healthState(), t = SESSIONS[state.type];
      state.request = h.yes && !!t && t.screen;
      var level = h.yes ? (state.request ? 'talk' : 'consult') : (h.answered ? 'clear' : '');
      $$('[data-outcome]', outcome).forEach(function (o) { o.hidden = o.getAttribute('data-outcome') !== level; });
      outcome.hidden = !level;
      outcome.setAttribute('data-level', level === 'clear' ? 'clear' : 'talk');
      $('[data-submit-label]', root).textContent = state.request ? 'Send call-back request' : 'Confirm booking';
    }
    health.forEach(function (r) { r.addEventListener('change', renderHealth); });
    liveValidate(form);

    /* Navigation */
    function go(n) {
      if (n === 3) { openWeek(); renderWeek(); }
      if (n === 4) renderHealth();
      setStep(n, true);
    }
    $$('[data-next]', root).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var n = state.step;
        if (n === 1 && !state.type) { stepError(1, 'Choose a session type to continue.'); $('input[name="type"]', root).focus(); return; }
        if (n === 3 && !state.slot) { stepError(3, 'Choose a time to continue.'); return; }
        go(n + 1);
      });
    });
    $$('[data-back]', root).forEach(function (btn) { btn.addEventListener('click', function () { go(state.step - 1); }); });
    $$('[data-goto]', root).forEach(function (btn) { btn.addEventListener('click', function () { go(Number(btn.getAttribute('data-goto'))); }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (state.step !== 4) return;
      if (!validateFields($$('[data-validate]', form))) return;
      renderHealth();
      var t = SESSIONS[state.type], s = state.slot, c = COACHES[s.coach];
      var first = form.elements.name.value.trim().split(' ')[0];
      $$('[data-done]', root).forEach(function (d) { d.hidden = d.getAttribute('data-done') !== (state.request ? 'request' : 'booked'); });
      $$('[data-done-name]', root).forEach(function (el) { el.textContent = first; });
      $$('[data-done-coach]', root).forEach(function (el) { el.textContent = c.short; });
      $('[data-done-type]', root).textContent = t.label + ' (' + t.minutes + ' min)';
      $('[data-done-coach-full]', root).textContent = c.name;
      $('[data-done-when]', root).textContent = longDate(s.key) + ', ' + hhmm(s.mins) + '–' + hhmm(s.mins + t.minutes) + ' ' + STUDIO.zoneName;
      $('[data-done-price]', root).textContent = t.priceLabel + (t.price ? ', paid at the studio' : '');
      $('[data-done-email]', root).textContent = form.elements.email.value.trim();
      $('[data-done-avatar]', root).src = c.img;
      state.ref = makeRef('FP');
      $('[data-done-ref]', root).textContent = state.ref;
      setStep(5, true);
    });

    /* .ics download for the confirmed session */
    $('[data-ics]', root).addEventListener('click', function () {
      var t = SESSIONS[state.type], s = state.slot;
      if (!t || !s) return;
      var start = wallToInstant(s.key, s.mins), end = new Date(start.getTime() + t.minutes * 60000);
      var stamp = function (d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
      var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Foothill Performance//Booking//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
        'UID:' + stamp(start) + '-' + s.coach + '@foothillperformance.example', 'DTSTAMP:' + stamp(new Date()), 'DTSTART:' + stamp(start), 'DTEND:' + stamp(end),
        'SUMMARY:' + t.label + ' with ' + COACHES[s.coach].short + ' (Foothill)', 'LOCATION:' + STUDIO.address.replace(/,/g, '\\,'),
        'DESCRIPTION:Reference ' + state.ref + '. Wear comfortable workout clothes and bring water. To change or cancel\\, call ' + STUDIO.phone + ' at least 24 hours before.', 'END:VEVENT', 'END:VCALENDAR'];
      var blob = new Blob([lines.join('\r\n')], { type: 'text/calendar' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'foothill-session.ics';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 0);
      toast('Calendar file downloaded.');
    });
    $('[data-book-again]', root).addEventListener('click', function () {
      form.reset();
      state = { step: 1, type: null, coach: 'any', slot: null, week: null, request: false };
      health.forEach(function (r) { r.checked = false; });
      renderCoaches(); renderSummary();
      setStep(1, true);
    });

    /* URL parameters: ?type=pt60&coach=yusuf&goal=sport */
    var pType = param('type'), pCoach = param('coach'), pGoal = param('goal');
    if (has(SESSIONS, pType)) { state.type = pType; $$('input[name="type"]', root).forEach(function (r) { r.checked = r.value === pType; }); }
    if (has(COACHES, pCoach) && (!state.type || SESSIONS[state.type].coaches.indexOf(pCoach) !== -1)) state.coach = pCoach;
    if (has(GOALS, pGoal) && form.elements.goal) form.elements.goal.value = pGoal;
    else {
      var g = read(GOAL_KEY);
      if (has(GOALS, g) && form.elements.goal) form.elements.goal.value = g;
    }
    renderCoaches();
    renderSummary();
    setStep(1, false);
  }
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
