/* Flow (Salt & Sage Yoga) — site scripts. Vanilla JavaScript, no dependencies.
   All studio data (teachers, class styles, the weekly schedule, prices, workshops) lives at the
   top of this file. Keep it in step with the HTML pages; see DOCS.md, "Content". */
(function () {
  'use strict';

  /* ---------- Studio ----------
     Every time on the site is wall-clock time in Santa Cruz (Pacific time), whatever the visitor's own
     time zone is. */
  var STUDIO = {
    name: 'Salt & Sage Yoga',
    timeZone: 'America/Los_Angeles',
    zoneName: 'Pacific time',
    phone: '(831) 555-0171',
    email: 'hello@saltandsageyoga.example',
    address: 'The Sail Loft, 9 Spinnaker Lane, Santa Cruz, CA 95062',
    daysAhead: 7,          // the schedule shows today plus the next six days
    bookingCutoff: 0,      // minutes before the start when booking closes (0 = until it starts)
    demoFill: 0.45         // share of mats shown as taken so the demo looks real. Set to 0 when connected.
  };

  /* ---------- Rooms ----------
     cols: mats per row in the mat picker (the teacher is at the front). */
  var ROOMS = {
    loft: { name: 'Loft studio', mats: 16, cols: 4 },
    garden: { name: 'Garden room', mats: 10, cols: 5 }
  };

  /* ---------- Teachers ---------- */
  var TEACHERS = {
    morwenna: { name: 'Morwenna Tregear', short: 'Morwenna', role: 'Founder · Hatha & yin' },
    jago: { name: 'Jago Maddern', short: 'Jago', role: 'Vinyasa & strong flow' },
    anouk: { name: 'Anouk Delahaye', short: 'Anouk', role: 'Restorative & pregnancy yoga' },
    kerensa: { name: 'Kerensa Kernick', short: 'Kerensa', role: 'Slow flow & beginners' }
  };

  /* ---------- Class styles (classes.html#<key>) ---------- */
  var STYLES = {
    vinyasa: { name: 'Vinyasa flow' },
    hatha: { name: 'Hatha' },
    slow: { name: 'Slow flow' },
    yin: { name: 'Yin' },
    restore: { name: 'Restorative' },
    pregnancy: { name: 'Pregnancy yoga' },
    beginners: { name: 'Beginners’ foundations' }
  };

  /* ---------- Levels (dots: 0 = all levels, 1–3 = gentle to strong) ---------- */
  var LEVELS = {
    open: { name: 'All levels', dots: 0 },
    gentle: { name: 'Gentle', dots: 1 },
    steady: { name: 'Steady', dots: 2 },
    strong: { name: 'Strong', dots: 3 }
  };

  /* ---------- Weekly schedule ----------
     day: 0 = Sunday ... 6 = Saturday. start: 24-hour Pacific time (shown on the page in 12-hour form). mins: length.
     id must be unique: bookings are saved against it. */
  var CLASSES = [
    { id: 'mon-0700', day: 1, start: '07:00', mins: 60, style: 'vinyasa', level: 'steady', teacher: 'jago', room: 'loft' },
    { id: 'mon-0930', day: 1, start: '09:30', mins: 75, style: 'hatha', level: 'open', teacher: 'morwenna', room: 'loft' },
    { id: 'mon-1230', day: 1, start: '12:30', mins: 45, style: 'slow', level: 'gentle', teacher: 'kerensa', room: 'garden' },
    { id: 'mon-1800', day: 1, start: '18:00', mins: 75, style: 'vinyasa', level: 'strong', teacher: 'jago', room: 'loft' },
    { id: 'mon-1945', day: 1, start: '19:45', mins: 75, style: 'yin', level: 'gentle', teacher: 'morwenna', room: 'garden' },
    { id: 'tue-0700', day: 2, start: '07:00', mins: 60, style: 'slow', level: 'gentle', teacher: 'kerensa', room: 'loft' },
    { id: 'tue-1000', day: 2, start: '10:00', mins: 75, style: 'pregnancy', level: 'open', teacher: 'anouk', room: 'garden' },
    { id: 'tue-1815', day: 2, start: '18:15', mins: 75, style: 'beginners', level: 'gentle', teacher: 'kerensa', room: 'loft' },
    { id: 'tue-1945', day: 2, start: '19:45', mins: 60, style: 'restore', level: 'gentle', teacher: 'anouk', room: 'garden' },
    { id: 'wed-0645', day: 3, start: '06:45', mins: 60, style: 'vinyasa', level: 'steady', teacher: 'jago', room: 'loft' },
    { id: 'wed-0930', day: 3, start: '09:30', mins: 75, style: 'hatha', level: 'steady', teacher: 'morwenna', room: 'loft' },
    { id: 'wed-1230', day: 3, start: '12:30', mins: 45, style: 'slow', level: 'gentle', teacher: 'kerensa', room: 'garden' },
    { id: 'wed-1800', day: 3, start: '18:00', mins: 75, style: 'hatha', level: 'open', teacher: 'morwenna', room: 'loft' },
    { id: 'wed-1930', day: 3, start: '19:30', mins: 75, style: 'yin', level: 'gentle', teacher: 'anouk', room: 'garden' },
    { id: 'thu-0700', day: 4, start: '07:00', mins: 60, style: 'vinyasa', level: 'strong', teacher: 'jago', room: 'loft' },
    { id: 'thu-1000', day: 4, start: '10:00', mins: 75, style: 'restore', level: 'gentle', teacher: 'anouk', room: 'garden' },
    { id: 'thu-1800', day: 4, start: '18:00', mins: 75, style: 'vinyasa', level: 'steady', teacher: 'jago', room: 'loft' },
    { id: 'thu-1945', day: 4, start: '19:45', mins: 75, style: 'pregnancy', level: 'open', teacher: 'anouk', room: 'garden' },
    { id: 'fri-0700', day: 5, start: '07:00', mins: 60, style: 'slow', level: 'gentle', teacher: 'kerensa', room: 'loft' },
    { id: 'fri-0930', day: 5, start: '09:30', mins: 75, style: 'hatha', level: 'open', teacher: 'morwenna', room: 'loft' },
    { id: 'fri-1730', day: 5, start: '17:30', mins: 60, style: 'vinyasa', level: 'steady', teacher: 'jago', room: 'loft' },
    { id: 'fri-1900', day: 5, start: '19:00', mins: 75, style: 'yin', level: 'gentle', teacher: 'morwenna', room: 'garden' },
    { id: 'sat-0800', day: 6, start: '08:00', mins: 75, style: 'vinyasa', level: 'steady', teacher: 'jago', room: 'loft' },
    { id: 'sat-1000', day: 6, start: '10:00', mins: 75, style: 'beginners', level: 'gentle', teacher: 'kerensa', room: 'loft' },
    { id: 'sat-1145', day: 6, start: '11:45', mins: 60, style: 'hatha', level: 'open', teacher: 'morwenna', room: 'garden' },
    { id: 'sat-1600', day: 6, start: '16:00', mins: 75, style: 'restore', level: 'gentle', teacher: 'anouk', room: 'garden' },
    { id: 'sun-0830', day: 0, start: '08:30', mins: 60, style: 'slow', level: 'gentle', teacher: 'kerensa', room: 'loft' },
    { id: 'sun-1000', day: 0, start: '10:00', mins: 75, style: 'vinyasa', level: 'steady', teacher: 'jago', room: 'loft' },
    { id: 'sun-1700', day: 0, start: '17:00', mins: 75, style: 'yin', level: 'gentle', teacher: 'morwenna', room: 'garden' },
    { id: 'sun-1845', day: 0, start: '18:45', mins: 60, style: 'restore', level: 'gentle', teacher: 'anouk', room: 'garden' }
  ];

  /* ---------- Prices (pricing.html calculator) ----------
     Keep in step with the price cards in pricing.html. */
  var PRICES = {
    dropIn: 25,
    intro: { price: 59, weeks: 3 },
    concession: 0.2,       // off memberships for students, anyone 65 or over and anyone on CalFresh or Medi-Cal
    options: {
      dropin: { name: 'Drop-in', kind: 'pass' },
      five: { name: '5-class pass', kind: 'pass', classes: 5, price: 110 },
      ten: { name: '10-class pass', kind: 'pass', classes: 10, price: 190 },
      eight: { name: 'Eight a month', kind: 'member', price: 128, included: 8, extra: 15 },
      unlimited: { name: 'Unlimited', kind: 'member', price: 159 }
    }
  };

  /* ---------- Workshops and retreats (workshops.html, home page teasers) ----------
     The cards are in the HTML (data-event="<id>"); this list gives their dates, fills them in and hides
     past events. Each event has EITHER a rolling rule, so the demo always has upcoming dates, OR fixed
     dates:
       rule: { monthsAhead: 1, weekday: 6, nth: 1 }  -> the 1st Saturday (0 = Sunday) of next month
       date: '2027-03-13', end: '2027-03-14'          -> fixed dates (end is optional)
     days: how many days a rolling event lasts (default 1). Keep the ids: ?event=<id> links use them. */
  var EVENTS = {
    breathwork: { title: 'Breathwork for everyday calm', kind: 'workshop', rule: { monthsAhead: 1, weekday: 6, nth: 1 } },
    inversions: { title: 'Arm balances & inversions, step by step', kind: 'workshop', rule: { monthsAhead: 1, weekday: 0, nth: 3 } },
    'solstice-yin': { title: 'Candlelit yin evening', kind: 'workshop', rule: { monthsAhead: 2, weekday: 6, nth: 2 } },
    'new-year': { title: 'Beginners’ weekend', kind: 'course', rule: { monthsAhead: 2, weekday: 6, nth: 3 }, days: 2 },
    'lizard-day': { title: 'Davenport coast day retreat', kind: 'retreat', rule: { monthsAhead: 3, weekday: 0, nth: 2 } },
    scilly: { title: 'Big Sur sea & stillness retreat', kind: 'retreat', rule: { monthsAhead: 4, weekday: 5, nth: 2 }, days: 4 }
  };

  /* ---------- Contact form topics (contact.html?topic=<key>) ---------- */
  var TOPICS = { classes: 'Classes and booking', private: 'Private or small-group sessions', hire: 'Studio rental', teaching: 'Teaching at Salt & Sage', other: 'Something else' };

  /* ---------- Saved data ---------- */
  var BOOKINGS_KEY = 'flow.bookings';

  /* ====================================================================== */

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function has(obj, key) { return typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function money(n, pence) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: pence ? 2 : 0, maximumFractionDigits: pence ? 2 : 0 }); }
  var CLASS_BY_ID = {};
  CLASSES.forEach(function (c) { CLASS_BY_ID[c.id] = c; });

  /* localStorage, or an in-memory stand-in when storage is blocked (sandboxed iframes, strict
     privacy settings). Everything saved goes through this object. */
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

  var toastTimer;
  function toast(msg) {
    var t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 3400);
  }

  /* ---------- Time helpers (everything is in the studio's time zone) ---------- */
  function toMin(hhmm) { var p = hhmm.split(':'); return Number(p[0]) * 60 + Number(p[1]); }
  // 12-hour clock for display, like 7:00 AM. The data in CLASSES stays 24-hour.
  function hhmm(mins) { var h = Math.floor(mins / 60); return (h % 12 || 12) + ':' + String(mins % 60).padStart(2, '0') + ' ' + (h < 12 ? 'AM' : 'PM'); }
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
  function studioNow() {
    var p = partsIn(new Date(), STUDIO.timeZone);
    var key = keyOf(p.year, p.month, p.day);
    return { key: key, day: weekday(key), mins: p.hour * 60 + p.minute };
  }
  function relativeDay(key, today) {
    if (key === today) return 'Today';
    if (key === addDays(today, 1)) return 'Tomorrow';
    return dateLabel(key, { weekday: 'long' });
  }
  function untilText(mins) {
    if (mins < 60) return 'in ' + plural(mins, 'minute');
    var h = Math.floor(mins / 60), m = mins % 60;
    return 'in ' + plural(h, 'hour') + (m ? ' ' + plural(m, 'minute') : '');
  }
  // A stable pseudo-random number per string, so demo "taken" mats don't change between renders.
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
    return (h >>> 0) / 4294967295; }

  /* ---------- Class occurrences: today plus the next six days ---------- */
  var NOW = studioNow();
  function occurrence(cls, date) {
    var start = toMin(cls.start), end = start + cls.mins, state = 'later';
    if (date === NOW.key) {
      if (NOW.mins >= end) state = 'past';
      else if (NOW.mins >= start) state = 'now';
    }
    return { key: cls.id + '@' + date, cls: cls, date: date, start: start, end: end, state: state };
  }
  function classesOn(date) {
    var day = weekday(date);
    return CLASSES.filter(function (c) { return c.day === day; })
      .sort(function (a, b) { return toMin(a.start) - toMin(b.start); })
      .map(function (c) { return occurrence(c, date); });
  }
  function week() {
    var days = [];
    for (var i = 0; i < STUDIO.daysAhead; i++) {
      var date = addDays(NOW.key, i);
      days.push({ date: date, items: classesOn(date) });
    }
    return days;
  }
  function bookable(occ) { return occ.state === 'later' && (occ.date !== NOW.key || occ.start - NOW.mins > STUDIO.bookingCutoff); }
  // The first class that hasn't started yet, from now on.
  function nextOccurrence(filter) {
    var days = week();
    for (var i = 0; i < days.length; i++) {
      for (var j = 0; j < days[i].items.length; j++) {
        var occ = days[i].items[j];
        if (occ.state === 'later' && (!filter || filter(occ.cls))) return occ;
      }
    }
    return null;
  }
  function findOccurrence(key) {
    var p = String(key).split('@');
    if (p.length !== 2 || !has(CLASS_BY_ID, p[0]) || !/^\d{4}-\d{2}-\d{2}$/.test(p[1])) return null;
    return occurrence(CLASS_BY_ID[p[0]], p[1]);
  }

  /* ---------- Bookings (saved in this browser) ----------
     Shape: [{ c: 'mon-0700', d: '2026-10-19', m: 7 }] — class id, studio date, mat number. */
  function readBookings() {
    var list;
    try { list = JSON.parse(safeStorage.getItem(BOOKINGS_KEY) || '[]'); } catch (e) { list = []; }
    if (!Array.isArray(list)) list = [];
    var seen = {};
    return list.filter(function (b) {
      if (!b || typeof b !== 'object' || !has(CLASS_BY_ID, b.c) || typeof b.d !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(b.d)) return false;
      var cls = CLASS_BY_ID[b.c], room = ROOMS[cls.room];
      if (weekday(b.d) !== cls.day || !(Number.isInteger(b.m) && b.m >= 1 && b.m <= room.mats)) return false;
      // Drop classes that have finished.
      if (b.d < NOW.key || (b.d === NOW.key && NOW.mins >= toMin(cls.start) + cls.mins)) return false;
      var k = b.c + '@' + b.d;
      if (seen[k]) return false;
      seen[k] = true;
      return true;
    }).sort(function (a, b) { return (a.d + CLASS_BY_ID[a.c].start).localeCompare(b.d + CLASS_BY_ID[b.c].start); });
  }
  function writeBookings(list) {
    if (list.length) safeStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
    else safeStorage.removeItem(BOOKINGS_KEY);
  }
  var bookings = readBookings();
  writeBookings(bookings);
  function bookingFor(occKey) {
    for (var i = 0; i < bookings.length; i++) if (bookings[i].c + '@' + bookings[i].d === occKey) return bookings[i];
    return null;
  }
  // Demo mats taken by other people. Leaves at least two mats free.
  function takenMats(occ) {
    var room = ROOMS[occ.cls.room], taken = [], fill = STUDIO.demoFill * (0.5 + hash(occ.key));
    for (var m = 1; m <= room.mats; m++) if (hash(occ.key + '#' + m) < fill) taken.push(m);
    var mine = bookingFor(occ.key);
    if (mine) taken = taken.filter(function (m) { return m !== mine.m; });
    while (taken.length > room.mats - 2) taken.pop();
    return taken;
  }
  function matsLeft(occ) {
    return ROOMS[occ.cls.room].mats - takenMats(occ).length - (bookingFor(occ.key) ? 1 : 0);
  }
  var listeners = [];
  function onBookingsChange(fn) { listeners.push(fn); fn(); }
  function bookingsChanged() { writeBookings(bookings); listeners.forEach(function (fn) { fn(); }); }

  /* ---------- Shared markup ---------- */
  function levelHtml(key) {
    var lv = LEVELS[key], dots = '';
    for (var i = 1; i <= 3; i++) dots += '<i class="' + (i <= lv.dots ? 'on' : '') + '"></i>';
    return '<span class="level"><span class="level-dots" aria-hidden="true">' + dots + '</span>' + esc(lv.name) + '</span>';
  }
  // 7:00–8:00 AM, or 11:45 AM–12:45 PM across noon.
  function timeRange(occ) { var a = hhmm(occ.start), b = hhmm(occ.end); return (a.slice(-2) === b.slice(-2) ? a.slice(0, -3) : a) + '–' + b; }
  // "today", "tomorrow" or a weekday name, for use inside a sentence.
  function dayPhrase(date) { var r = relativeDay(date, NOW.key); return r === 'Today' || r === 'Tomorrow' ? r.toLowerCase() : r; }
  function occLabel(occ) { return STYLES[occ.cls.style].name + ', ' + dayPhrase(occ.date) + ' at ' + hhmm(occ.start); }
  function stateTag(occ, nextKey) {
    if (occ.state === 'now') return '<span class="tag tag-now"><span class="pulse-dot" aria-hidden="true"></span>On now</span>';
    if (occ.key === nextKey) return '<span class="tag tag-next">Up next</span>';
    if (occ.state === 'past') return '<span class="tag">Finished</span>';
    return '';
  }
  function actionHtml(occ) {
    var mine = bookingFor(occ.key);
    if (mine) {
      return '<button type="button" class="btn btn-outline btn-sm w-full md:w-auto" data-book="' + esc(occ.key) + '" aria-label="Your mat for ' + esc(occLabel(occ)) + ': mat ' + mine.m + '">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>Mat ' + mine.m + ' booked</button>';
    }
    if (!bookable(occ)) return '';
    var left = matsLeft(occ);
    return '<button type="button" class="btn btn-primary btn-sm w-full md:w-auto" data-book="' + esc(occ.key) + '" aria-label="Reserve a mat for ' + esc(occLabel(occ)) + '">Reserve a mat</button>' +
      '<span class="mt-1.5 block text-center text-xs font-semibold text-mute md:text-right">' + plural(left, 'mat') + ' left</span>';
  }
  function rowHtml(occ, nextKey, opts) {
    var cls = occ.cls, t = TEACHERS[cls.teacher], mine = bookingFor(occ.key);
    var classes = 'tt-row' + (occ.state === 'past' ? ' is-past' : '') + (occ.state === 'now' ? ' is-now' : '') + (mine ? ' is-booked' : '');
    var tag = stateTag(occ, nextKey);
    return '<li class="' + classes + '" data-occ="' + esc(occ.key) + '">' +
      '<p class="tt-time tnum">' + hhmm(occ.start) + '<span class="mt-1 block font-sans text-xs font-semibold text-mute">' + plural(cls.mins, 'min') + '</span></p>' +
      '<div class="min-w-0">' +
        '<p class="flex flex-wrap items-center gap-x-3 gap-y-1.5"><a class="card-title text-[1.35rem] text-ink hover:text-sea-700" href="classes.html#' + cls.style + '">' + esc(STYLES[cls.style].name) + '</a>' + tag + '</p>' +
        '<p class="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">' +
          '<span>with <a class="font-semibold text-ink underline decoration-line underline-offset-4 hover:decoration-sea-500" href="teachers.html#' + cls.teacher + '">' + esc(t.short) + '</a></span>' +
          levelHtml(cls.level) +
          (opts && opts.room === false ? '' : '<span class="text-mute">' + esc(ROOMS[cls.room].name) + '</span>') +
        '</p>' +
      '</div>' +
      '<div class="tt-action md:min-w-[10.5rem]">' + actionHtml(occ) + '</div>' +
    '</li>';
  }

  /* ---------- Header: shadow on scroll + mobile menu ---------- */
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

  /* ---------- Scroll reveal ----------
     Revealing an element also reveals everything before it, so fast jumps never leave gaps. */
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

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = NOW.key.slice(0, 4); });

  /* ---------- Header "My bookings" count ---------- */
  onBookingsChange(function () {
    $$('[data-booking-count]').forEach(function (el) {
      el.textContent = String(bookings.length);
      el.setAttribute('data-count', String(bookings.length));
    });
    $$('[data-bookings-link]').forEach(function (a) {
      a.setAttribute('aria-label', 'My bookings: ' + plural(bookings.length, 'class', 'classes'));
    });
  });

  /* ---------- Booking dialog: choose a mat, reserve, cancel ---------- */
  var dialog = $('[data-book-dialog]');
  var current = null, opener = null, openerKey = '';
  function openBooking(occKey, from) {
    var occ = findOccurrence(occKey);
    if (!dialog || !occ) return;
    current = occ;
    opener = from || null;
    openerKey = occ.key;
    var cls = occ.cls, room = ROOMS[cls.room], mine = bookingFor(occ.key), taken = takenMats(occ);
    $('[data-bd-title]', dialog).textContent = STYLES[cls.style].name;
    $('[data-bd-when]', dialog).textContent = relativeDay(occ.date, NOW.key) + ', ' + dateLabel(occ.date, { day: 'numeric', month: 'long' }) + ' · ' + timeRange(occ);
    $('[data-bd-meta]', dialog).innerHTML = '<span>with ' + esc(TEACHERS[cls.teacher].name) + '</span>' + levelHtml(cls.level) + '<span>' + esc(room.name) + '</span>';
    var grid = $('[data-mat-grid]', dialog);
    grid.style.gridTemplateColumns = 'repeat(' + room.cols + ', minmax(0, 1fr))';
    var html = '';
    for (var m = 1; m <= room.mats; m++) {
      var isTaken = taken.indexOf(m) !== -1;
      html += '<label class="mat"><input type="radio" name="mat" value="' + m + '"' + (isTaken ? ' disabled' : '') + (mine && mine.m === m ? ' checked' : '') + '>' +
        '<span aria-hidden="true">' + m + '</span><span class="sr-only">Mat ' + m + (isTaken ? ', taken' : '') + '</span></label>';
    }
    grid.innerHTML = html;
    var free = room.mats - taken.length;
    $('[data-bd-free]', dialog).textContent = mine ? 'You’re on mat ' + mine.m + '. Pick another free mat to move.' : plural(free, 'mat') + ' free of ' + room.mats + '. The teacher’s mat is at the front.';
    $('[data-bd-error]', dialog).hidden = true;
    $('[data-bd-cancel]', dialog).hidden = !mine;
    updateConfirm();
    if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
    var first = $('input:checked', grid) || $('input:not(:disabled)', grid);
    if (first) first.focus();
  }
  function chosenMat() { var c = dialog && $('[data-mat-grid] input:checked', dialog); return c ? Number(c.value) : 0; }
  function updateConfirm() {
    if (!dialog || !current) return;
    var btn = $('[data-book-confirm]', dialog), mat = chosenMat(), mine = bookingFor(current.key);
    if (mine && mat === mine.m) btn.textContent = 'Keep mat ' + mat;
    else if (mine && mat) btn.textContent = 'Move to mat ' + mat;
    else btn.textContent = mat ? 'Reserve mat ' + mat : 'Reserve a mat';
  }
  function closeBooking() {
    if (!dialog) return;
    if (typeof dialog.close === 'function' && dialog.open) dialog.close(); else dialog.removeAttribute('open');
  }
  if (dialog) {
    dialog.addEventListener('change', updateConfirm);
    // Return focus to the button that opened the dialog. Lists re-render after a booking, so fall
    // back to the new button for the same class, then to <main>.
    dialog.addEventListener('close', function () {
      current = null;
      var back = opener && document.contains(opener) ? opener : (openerKey && $('[data-book="' + openerKey + '"]'));
      if (back) back.focus();
      else { var main = $('#main'); if (main) main.focus({ preventScroll: true }); }
    });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) closeBooking(); });
    $$('[data-bd-close]', dialog).forEach(function (b) { b.addEventListener('click', closeBooking); });
    $('[data-book-confirm]', dialog).addEventListener('click', function () {
      if (!current) return;
      var mat = chosenMat();
      if (!mat) { $('[data-bd-error]', dialog).hidden = false; var f = $('[data-mat-grid] input:not(:disabled)', dialog); if (f) f.focus(); return; }
      if (!bookable(current) && !bookingFor(current.key)) { toast('Booking has closed for this class.'); closeBooking(); return; }
      var occ = current, mine = bookingFor(occ.key);
      if (mine) mine.m = mat;
      else bookings.push({ c: occ.cls.id, d: occ.date, m: mat });
      bookings.sort(function (a, b) { return (a.d + CLASS_BY_ID[a.c].start).localeCompare(b.d + CLASS_BY_ID[b.c].start); });
      bookingsChanged();
      closeBooking();
      toast('Mat ' + mat + ' reserved: ' + occLabel(occ) + '.');
    });
    $('[data-bd-cancel]', dialog).addEventListener('click', function () {
      if (!current) return;
      cancelBooking(current.key);
      closeBooking();
    });
  }
  function cancelBooking(occKey) {
    var occ = findOccurrence(occKey);
    bookings = bookings.filter(function (b) { return b.c + '@' + b.d !== occKey; });
    bookingsChanged();
    if (occ) toast('Booking canceled: ' + occLabel(occ) + '.');
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('[data-book]') : null;
    if (b) openBooking(b.getAttribute('data-book'), b);
    var c = e.target.closest ? e.target.closest('[data-cancel-booking]') : null;
    if (c) {
      var key = c.getAttribute('data-cancel-booking');
      var list = c.closest('[data-my-bookings]');
      cancelBooking(key);
      var focusTo = list && ($('[data-cancel-booking]', list) || $('[data-my-bookings-heading]'));
      if (focusTo) focusTo.focus();
    }
  });

  /* ---------- My bookings list (timetable.html) ---------- */
  var myList = $('[data-my-bookings]');
  if (myList) {
    onBookingsChange(function () {
      var summary = $('[data-my-bookings-summary]');
      if (summary) summary.textContent = bookings.length ? 'You have ' + plural(bookings.length, 'mat') + ' reserved this week.' : 'No mats reserved yet. Pick a class below and choose your spot in the room.';
      myList.innerHTML = bookings.map(function (b) {
        var occ = findOccurrence(b.c + '@' + b.d), cls = occ.cls;
        return '<li class="flex items-center gap-4 rounded-2xl bg-shell p-4 ring-1 ring-line">' +
          '<span class="grid size-12 shrink-0 place-items-center rounded-full bg-sea-100 font-serif text-xl text-sea-800" aria-hidden="true">' + b.m + '</span>' +
          '<div class="min-w-0 flex-1"><p class="card-title text-lg text-ink">' + esc(STYLES[cls.style].name) + '</p>' +
          '<p class="text-sm text-mute">' + esc(relativeDay(occ.date, NOW.key)) + ' ' + dateLabel(occ.date, { day: 'numeric', month: 'short' }) + ' · ' + hhmm(occ.start) + ' · Mat ' + b.m + ' · ' + esc(TEACHERS[cls.teacher].short) + '</p></div>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-cancel-booking="' + esc(occ.key) + '" aria-label="Cancel ' + esc(occLabel(occ)) + '">Cancel</button>' +
        '</li>';
      }).join('');
    });
  }

  /* ---------- Home: next class card + today's classes ---------- */
  var nextCard = $('[data-next-class]');
  if (nextCard) {
    var paintNext = function () {
      var occ = nextOccurrence();
      if (!occ) return;
      var startsIn = occ.date === NOW.key ? untilText(occ.start - NOW.mins) : relativeDay(occ.date, NOW.key) + ' at ' + hhmm(occ.start);
      $('[data-next-when]', nextCard).textContent = occ.date === NOW.key ? 'Today · ' + hhmm(occ.start) : relativeDay(occ.date, NOW.key) + ' · ' + hhmm(occ.start);
      $('[data-next-name]', nextCard).textContent = STYLES[occ.cls.style].name;
      $('[data-next-meta]', nextCard).textContent = 'with ' + TEACHERS[occ.cls.teacher].short + ' · ' + plural(matsLeft(occ), 'mat') + ' left';
      var btn = $('[data-next-book]', nextCard);
      btn.setAttribute('data-book', occ.key);
      btn.setAttribute('aria-label', 'Reserve a mat for ' + occLabel(occ) + ', starts ' + startsIn);
      nextCard.hidden = false;
    };
    onBookingsChange(paintNext);
  }
  var todayList = $('[data-today-list]');
  if (todayList) {
    onBookingsChange(function () {
      var items = classesOn(NOW.key), day = NOW.key;
      // Once today's last class has finished, show tomorrow instead.
      if (!items.some(function (o) { return o.state !== 'past'; })) { day = addDays(NOW.key, 1); items = classesOn(day); }
      var next = nextOccurrence();
      $('[data-today-heading]').textContent = day === NOW.key ? 'Today at the studio' : 'Tomorrow at the studio';
      $('[data-today-date]').textContent = dateLabel(day, { weekday: 'long', day: 'numeric', month: 'long' });
      var upcoming = items.filter(function (o) { return o.state !== 'past'; }).length;
      $('[data-today-count]').textContent = day === NOW.key
        ? (upcoming === items.length ? plural(items.length, 'class', 'classes') + ' today' : plural(upcoming, 'class', 'classes') + ' still to come, ' + (items.length - upcoming) + ' finished')
        : plural(items.length, 'class', 'classes') + ' tomorrow';
      todayList.innerHTML = items.map(function (o) { return rowHtml(o, next ? next.key : ''); }).join('');
    });
  }

  /* ---------- Schedule: filters, now/next markers, rolling week ---------- */
  var tt = $('[data-timetable]');
  if (tt) {
    var form = $('[data-tt-filters]');
    var fields = { style: STYLES, level: LEVELS, teacher: TEACHERS };
    var params = new URLSearchParams(window.location.search);
    Object.keys(fields).forEach(function (name) {
      var v = params.get(name);
      if (v && has(fields[name], v)) form.elements[name].value = v;
    });
    var syncUrl = function () {
      var p = new URLSearchParams(window.location.search);
      Object.keys(fields).forEach(function (name) { var v = form.elements[name].value; if (v) p.set(name, v); else p.delete(name); });
      var q = p.toString();
      try { window.history.replaceState(null, '', window.location.pathname + (q ? '?' + q : '') + window.location.hash); } catch (e) { /* file:// in some browsers */ }
    };
    var renderTimetable = function () {
      var f = {};
      Object.keys(fields).forEach(function (name) { var v = form.elements[name].value; f[name] = has(fields[name], v) ? v : ''; });
      var match = function (c) { return (!f.style || c.style === f.style) && (!f.level || c.level === f.level) && (!f.teacher || c.teacher === f.teacher); };
      var next = nextOccurrence(match);
      var total = 0, html = '';
      week().forEach(function (d, i) {
        var items = d.items.filter(function (o) { return match(o.cls); });
        if (!items.length) return;
        total += items.length;
        var id = 'day-' + d.date;
        html += '<section class="reveal is-visible" aria-labelledby="' + id + '">' +
          '<h2 id="' + id + '" class="flex flex-wrap items-baseline gap-x-3 border-b border-line pb-3 font-serif text-[1.7rem] text-ink">' +
            esc(relativeDay(d.date, NOW.key)) + '<span class="font-sans text-sm font-semibold text-mute">' + dateLabel(d.date, i < 2 ? { weekday: 'long', day: 'numeric', month: 'long' } : { day: 'numeric', month: 'long' }) + ' · ' + plural(items.length, 'class', 'classes') + '</span></h2>' +
          '<ul class="mt-4 grid gap-3">' + items.map(function (o) { return rowHtml(o, next ? next.key : ''); }).join('') + '</ul>' +
        '</section>';
      });
      tt.innerHTML = html;
      var any = !!(f.style || f.level || f.teacher);
      $('[data-tt-count]').textContent = 'Showing ' + plural(total, 'class', 'classes') + ' over the next seven days' + (any ? ' that match your filters.' : '.');
      $('[data-tt-empty]').hidden = total > 0;
      $('[data-tt-clear]').hidden = !any;
    };
    form.addEventListener('change', function () { syncUrl(); renderTimetable(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    $$('[data-tt-clear], [data-tt-clear-empty]').forEach(function (b) {
      b.addEventListener('click', function () {
        Object.keys(fields).forEach(function (name) { form.elements[name].value = ''; });
        syncUrl(); renderTimetable();
        form.elements.style.focus();
      });
    });
    onBookingsChange(renderTimetable);
    $('[data-tt-now]').textContent = 'It’s ' + hhmm(NOW.mins) + ' in Santa Cruz on ' + dateLabel(NOW.key, { weekday: 'long', day: 'numeric', month: 'long' }) + '. All times are Pacific time.';
  }

  /* ---------- Class styles and teachers: next class + classes a week ---------- */
  $$('[data-next-of]').forEach(function (el) {
    var p = el.getAttribute('data-next-of').split(':'), field = p[0], value = p[1];
    if ((field !== 'style' && field !== 'teacher') || (field === 'style' && !has(STYLES, value)) || (field === 'teacher' && !has(TEACHERS, value))) return;
    var occ = nextOccurrence(function (c) { return c[field] === value; });
    if (!occ) return;
    var who = field === 'style' ? ' with ' + TEACHERS[occ.cls.teacher].short : ': ' + STYLES[occ.cls.style].name;
    el.textContent = 'Next: ' + relativeDay(occ.date, NOW.key) + ' at ' + hhmm(occ.start) + who;
  });
  $$('[data-weekly-of]').forEach(function (el) {
    var p = el.getAttribute('data-weekly-of').split(':'), field = p[0], value = p[1];
    if (field !== 'style' && field !== 'teacher') return;
    var n = CLASSES.filter(function (c) { return c[field] === value; }).length;
    el.textContent = plural(n, 'class', 'classes') + ' a week';
  });

  /* ---------- Pricing: intro offer + what suits you calculator ---------- */
  var calc = $('[data-price-calc]');
  if (calc) {
    var range = $('[data-calc-classes]', calc), conc = $('[data-calc-concession]', calc);
    var weeksPerMonth = 52 / 12;
    var paintCalc = function () {
      var n = Math.min(6, Math.max(1, parseInt(range.value, 10) || 2));
      var off = conc.checked ? 1 - PRICES.concession : 1;
      var month = n * weeksPerMonth, o = PRICES.options;
      var costs = [
        { key: 'dropin', cost: month * PRICES.dropIn },
        { key: 'five', cost: month * o.five.price / o.five.classes },
        { key: 'ten', cost: month * o.ten.price / o.ten.classes },
        { key: 'eight', cost: (o.eight.price + Math.max(0, Math.ceil(month) - o.eight.included) * o.eight.extra) * off },
        { key: 'unlimited', cost: o.unlimited.price * off }
      ];
      costs.forEach(function (c) { c.cost = Math.round(c.cost); });
      var best = costs.slice().sort(function (a, b) { return a.cost - b.cost; })[0];
      var max = Math.max.apply(null, costs.map(function (c) { return c.cost; }));
      var introClasses = n * PRICES.intro.weeks;
      $('[data-calc-value]', calc).textContent = plural(n, 'class', 'classes') + ' a week';
      range.setAttribute('aria-valuetext', plural(n, 'class', 'classes') + ' a week');
      $('[data-calc-intro]', calc).innerHTML = 'Over your three intro weeks that’s <strong class="text-ink">' + plural(introClasses, 'class', 'classes') + ' for ' + money(PRICES.intro.price) + '</strong>, about ' +
        money(PRICES.intro.price / introClasses, true) + ' a class. At drop-in prices it would cost ' + money(introClasses * PRICES.dropIn) + ', so you save ' + money(introClasses * PRICES.dropIn - PRICES.intro.price) + '.';
      $('[data-calc-best]', calc).textContent = o[best.key].name;
      $('[data-calc-best-cost]', calc).textContent = money(best.cost) + ' a month';
      $('[data-calc-best-note]', calc).textContent = 'About ' + money(best.cost / month, true) + ' a class at ' + plural(n, 'class', 'classes') + ' a week' + (conc.checked && o[best.key].kind === 'member' ? ', with the 20% discount.' : '.');
      $('[data-calc-bars]', calc).innerHTML = costs.map(function (c) {
        var isBest = c.key === best.key;
        return '<li><div class="flex items-baseline justify-between gap-3 text-sm"><span class="font-semibold text-ink">' + esc(o[c.key].name) + (isBest ? ' <span class="tag tag-clay ml-1">Best value</span>' : '') + '</span>' +
          '<span class="tnum font-semibold">' + money(c.cost) + '<span class="font-normal text-mute"> /month</span></span></div>' +
          '<div class="bar mt-2" aria-hidden="true"><div class="bar-fill' + (isBest ? ' is-best' : '') + '" style="width:' + Math.max(4, Math.round(c.cost / max * 100)) + '%"></div></div></li>';
      }).join('');
    };
    range.addEventListener('input', paintCalc);
    conc.addEventListener('change', paintCalc);
    paintCalc();
  }

  /* ---------- Workshops: dates, hide past events, kind filter, ?event= for the inquiry form ---------- */
  // The nth weekday (0 = Sunday) of a month; nth -1 is the last one.
  function nthWeekday(year, month, day, nth) {
    var first = keyOf(year, month, 1), offset = (day - weekday(first) + 7) % 7;
    if (nth > 0) return addDays(first, offset + (nth - 1) * 7);
    var next = month === 12 ? keyOf(year + 1, 1, 1) : keyOf(year, month + 1, 1);
    var last = addDays(next, -1);
    return addDays(last, -((weekday(last) - day + 7) % 7));
  }
  function eventDates(ev) {
    var iso = /^\d{4}-\d{2}-\d{2}$/;
    if (typeof ev.date === 'string' && iso.test(ev.date)) return { start: ev.date, end: typeof ev.end === 'string' && iso.test(ev.end) ? ev.end : ev.date };
    var r = ev.rule || {}, y = Number(NOW.key.slice(0, 4)), m = Number(NOW.key.slice(5, 7)) + (r.monthsAhead || 0);
    y += Math.floor((m - 1) / 12); m = (m - 1) % 12 + 1;
    var start = nthWeekday(y, m, r.weekday || 0, r.nth || 1);
    return { start: start, end: addDays(start, Math.max(1, ev.days || 1) - 1) };
  }
  function eventWhen(d) {
    var long = function (k) { return dateLabel(k, { weekday: 'long', day: 'numeric', month: 'long' }); };
    var year = ', ' + d.end.slice(0, 4);
    if (d.start === d.end) return long(d.start) + year;
    return long(d.start) + (d.start.slice(0, 4) !== d.end.slice(0, 4) ? ', ' + d.start.slice(0, 4) : '') + ' to ' + long(d.end) + year;
  }
  function eventShort(d) {
    var s = dateLabel(d.start, { weekday: 'short', day: 'numeric', month: 'short' });
    return d.start === d.end ? s : s + ' – ' + dateLabel(d.end, { weekday: 'short', day: 'numeric', month: 'short' });
  }
  var EVENT_DATES = {};
  Object.keys(EVENTS).forEach(function (id) { EVENT_DATES[id] = eventDates(EVENTS[id]); });
  function isPast(id) { return EVENT_DATES[id].end < NOW.key; }
  $$('[data-event-when]').forEach(function (el) {
    var id = el.getAttribute('data-event-when');
    if (has(EVENTS, id)) el.textContent = eventWhen(EVENT_DATES[id]);
  });
  $$('[data-event-short]').forEach(function (el) {
    var id = el.getAttribute('data-event-short');
    if (has(EVENTS, id)) el.textContent = eventShort(EVENT_DATES[id]);
  });
  $$('[data-enquiry-form] select[name="event"] option').forEach(function (opt) {
    var id = opt.value;
    if (!has(EVENTS, id)) return;
    if (isPast(id)) opt.remove();
    else opt.textContent = EVENTS[id].title + ' (' + eventShort(EVENT_DATES[id]) + ')';
  });
  var eventCards = $$('[data-event]');
  eventCards.forEach(function (card) {
    var id = card.getAttribute('data-event');
    if (has(EVENTS, id) && isPast(id)) card.hidden = true;
  });
  // Show the cards in date order.
  if (eventCards.length > 1) {
    eventCards.slice().sort(function (a, b) {
      var x = has(EVENTS, a.getAttribute('data-event')) ? EVENT_DATES[a.getAttribute('data-event')].start : '9';
      var y = has(EVENTS, b.getAttribute('data-event')) ? EVENT_DATES[b.getAttribute('data-event')].start : '9';
      return x < y ? -1 : x > y ? 1 : 0;
    }).forEach(function (card) { card.parentNode.appendChild(card); });
  }
  var kindBar = $('[data-kind-filter]');
  if (kindBar) {
    var kinds = { all: 1, workshop: 1, retreat: 1 };
    $$('button', kindBar).forEach(function (btn) {
      btn.addEventListener('click', function () {
        var k = btn.getAttribute('data-kind');
        if (!has(kinds, k)) return;
        $$('button', kindBar).forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var shown = 0;
        $$('[data-event]').forEach(function (card) {
          var id = card.getAttribute('data-event');
          var ev = has(EVENTS, id) ? EVENTS[id] : null;
          var past = !ev || isPast(id);
          var kind = ev && ev.kind === 'course' ? 'workshop' : ev && ev.kind;
          card.hidden = past || (k !== 'all' && kind !== k);
          if (!card.hidden) shown++;
        });
        $('[data-kind-count]').textContent = 'Showing ' + plural(shown, 'event') + '.';
      });
    });
  }
  $$('[data-enquire]').forEach(function (a) {
    a.addEventListener('click', function () {
      var id = a.getAttribute('data-enquire'), sel = $('[data-enquiry-form] select[name="event"]');
      if (sel && has(EVENTS, id)) sel.value = id;
    });
  });
  (function () {
    var sel = $('[data-enquiry-form] select[name="event"]');
    var id = new URLSearchParams(window.location.search).get('event');
    if (sel && id && has(EVENTS, id) && $('option[value="' + id + '"]', sel)) sel.value = id;
  })();

  (function () {
    var sel = $('[data-contact-form] select[name="topic"]');
    var id = new URLSearchParams(window.location.search).get('topic');
    if (sel && id && has(TOPICS, id) && $('option[value="' + id + '"]', sel)) sel.value = id;
  })();

  /* ---------- FAQ search ---------- */
  var faqSearch = $('[data-faq-search]');
  if (faqSearch) {
    var items = $$('[data-faq]');
    items.forEach(function (d) {
      var q = $('[data-faq-q]', d);
      q.setAttribute('data-plain', q.textContent);
    });
    var runSearch = function () {
      var term = faqSearch.value.trim().toLowerCase(), shown = 0;
      items.forEach(function (d) {
        var q = $('[data-faq-q]', d), plain = q.getAttribute('data-plain');
        var hit = !term || d.textContent.toLowerCase().indexOf(term) !== -1;
        d.hidden = !hit;
        if (hit) shown++;
        if (term && hit) {
          var i = plain.toLowerCase().indexOf(term);
          q.innerHTML = i === -1 ? esc(plain) : esc(plain.slice(0, i)) + '<mark>' + esc(plain.slice(i, i + term.length)) + '</mark>' + esc(plain.slice(i + term.length));
        } else {
          q.textContent = plain;
        }
        if (term && hit && plain.toLowerCase().indexOf(term) === -1) d.open = true;
      });
      $$('[data-faq-group]').forEach(function (g) { g.hidden = !$$('[data-faq]', g).some(function (d) { return !d.hidden; }); });
      $('[data-faq-count]').textContent = term ? plural(shown, 'question') + (shown === 1 ? ' matches “' : ' match “') + faqSearch.value.trim() + '”.' : 'Showing all ' + plural(items.length, 'question') + '.';
      $('[data-faq-empty]').hidden = shown > 0;
    };
    faqSearch.addEventListener('input', runSearch);
    var q0 = new URLSearchParams(window.location.search).get('q');
    if (q0 && q0.length <= 60) faqSearch.value = q0;
    runSearch();
  }

  /* ---------- Contact page: today's first and last class ---------- */
  var todayHours = $('[data-today-hours]');
  if (todayHours) {
    var t = classesOn(NOW.key);
    if (t.length) {
      var last = t[t.length - 1];
      todayHours.textContent = 'Today the doors open at ' + hhmm(t[0].start - 15) + ' and the last class ends at ' + hhmm(last.end) + '.';
    }
  }

  /* ---------- Forms: inline validation and a success state with a reference ----------
     To connect a form, set its action to your endpoint (e.g. https://formspree.io/f/yourid)
     and replace the "success" block below with a fetch() POST. See DOCS.md, "Forms". */
  // A short reference for the confirmation, like SS-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setError(field, msg) {
    var err = document.getElementById(field.getAttribute('data-error-id'));
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) { err.textContent = msg || ''; err.hidden = !msg; }
  }
  function validate(field) {
    var v = (field.type === 'checkbox' ? (field.checked ? 'on' : '') : field.value).trim();
    var rule = field.getAttribute('data-validate') || '';
    var label = field.getAttribute('data-label') || 'This field';
    var msg = '';
    if (field.required && !v) msg = field.type === 'checkbox' ? 'Please check this box to continue.' : (field.tagName === 'SELECT' ? 'Please choose ' + label.toLowerCase() + '.' : 'Please enter ' + label.toLowerCase() + '.');
    else if (v && rule === 'email' && !EMAIL.test(v)) msg = 'Please enter an email address like name@example.com.';
    else if (v && rule === 'phone' && !/^[+()\d\s-]{7,20}$/.test(v)) msg = 'Please enter a phone number using digits and spaces.';
    else if (rule === 'message' && v.length < 10) msg = v ? 'Please write a little more (at least 10 characters).' : 'Please enter ' + label.toLowerCase() + '.';
    setError(field, msg);
    return !msg;
  }
  $$('form[data-validate-form]').forEach(function (form) {
    var fieldsIn = $$('[data-error-id]', form);
    fieldsIn.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value || f.getAttribute('aria-invalid') === 'true') validate(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') validate(f); });
      f.addEventListener('change', function () { if (f.getAttribute('aria-invalid') === 'true') validate(f); });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = fieldsIn.filter(function (f) { return !validate(f); });
      var summary = $('[data-form-summary]', form);
      if (bad.length) {
        if (summary) { summary.textContent = 'Please check ' + plural(bad.length, 'field') + ' marked below.'; summary.hidden = false; }
        bad[0].focus();
        return;
      }
      if (summary) summary.hidden = true;
      // Demo success state: nothing is sent. To send for real:
      // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      var done = $('[data-form-success]', form.parentNode);
      var name = form.elements.name ? form.elements.name.value.trim().split(/\s+/)[0] : '';
      $$('[data-success-name]', done).forEach(function (el) { el.textContent = name; });
      var ref = makeRef('SS');
      $$('[data-success-ref]', done).forEach(function (el) { el.textContent = ref; });
      var evSel = form.elements.event;
      $$('[data-success-event]', done).forEach(function (el) { el.textContent = evSel && has(EVENTS, evSel.value) ? EVENTS[evSel.value].title : ''; });
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
    var again = $('[data-form-reset]', form.parentNode);
    if (again) again.addEventListener('click', function () {
      form.reset();
      fieldsIn.forEach(function (f) { setError(f, ''); });
      $('[data-form-success]', form.parentNode).hidden = true;
      form.hidden = false;
      var first = $('input, select, textarea', form);
      if (first) first.focus();
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
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
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
