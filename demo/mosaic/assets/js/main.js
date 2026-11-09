/* Mosaic: site scripts for a community arts center in Holyoke. Vanilla JavaScript, no dependencies.
 * The program, rooms and settings live in assets/js/data.js.
 *
 *  1. Settings and data
 *  2. Helpers (escaping, plurals, money, URL parameters, safeStorage, toast, downloads)
 *  3. Time (every date and time is Eastern time, America/New_York)
 *  4. Program rules: repeating sessions, the winter break, gallery runs
 *  5. Artwork: cut-paper SVG drawn per category
 *  6. Saved events
 *  7. Shared UI: header, menu, reveals, back to top, year, opening status
 *  8. Cards and rows
 *  9. Calendar (.ics) downloads
 * 10. Pages: home, what's on, event, workshops, hire, get involved, visit, about
 * 11. Forms (demo: nothing is sent; see DOCS.md "Forms")
 * 12. Start
 */
(function () {
  'use strict';

  /* ======================================================================
     1. Settings and data
     ====================================================================== */
  var DATA = window.MOSAIC_DATA;
  if (!DATA) return;
  var CENTRE = DATA.CENTRE;
  var TIMEZONE = 'America/New_York';
  var LOCALE = 'en-US';
  // localStorage key. Validated on every read: an array of listing ids from LISTINGS.
  var STORAGE_KEYS = { saved: 'mosaic-saved' };
  // What's on shows WINDOW_STEP days at first; "Show more" adds WINDOW_STEP more, up to WINDOW_MAX.
  var WINDOW_STEP = 21;
  var WINDOW_MAX = 84;
  // How far ahead event.html lists dates and the date filter accepts (days).
  var LOOKAHEAD = 365;
  // The listing event.html shows when ?id= is missing or unknown.
  var DEFAULT_EVENT = 'lino-tuesdays';

  var LISTINGS = DATA.LISTINGS;
  var BY_ID = Object.create(null);
  LISTINGS.forEach(function (l, i) { l.index = i; BY_ID[l.id] = l; });

  /* ======================================================================
     2. Helpers
     ====================================================================== */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function has(obj, key) { return typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key); }
  function listing(id) { return has(BY_ID, id) ? BY_ID[id] : null; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function money(n) {
    return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'USD', minimumFractionDigits: n % 1 ? 2 : 0 }).format(n);
  }
  function param(name) {
    try { return new URLSearchParams(window.location.search).get(name); } catch (e) { return null; }
  }
  function setParams(values) {
    try {
      var url = new URL(window.location.href);
      Object.keys(values).forEach(function (k) {
        if (values[k]) url.searchParams.set(k, values[k]); else url.searchParams.delete(k);
      });
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) { /* some browsers refuse replaceState on file:// */ }
  }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* localStorage, or memory when storage is blocked (sandboxed iframes, strict privacy settings), so
     saving events still works for the page view. */
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
  function readJSON(key) {
    try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; }
  }
  function writeJSON(key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* quota */ } }

  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2800);
  }
  function download(filename, text, type) {
    try {
      var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
      return true;
    } catch (e) { return false; }
  }

  /* ======================================================================
     3. Time (always in TIMEZONE)
     Days are whole numbers (days since 1970-01-01 on the local calendar); times are minutes after midnight.
     ?now=YYYY-MM-DDTHH:MM (Eastern time) previews the site on another date.
     ====================================================================== */
  var partsFmt = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  function zoneParts(date) {
    var p = {};
    partsFmt.formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
    return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, s: +p.second };
  }
  // Milliseconds TIMEZONE is ahead of UTC at an instant (negative: 5 hours behind in winter, 4 in summer).
  function offsetAt(ms) {
    var p = zoneParts(new Date(ms));
    return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000;
  }
  // A local wall-clock time (day number + minutes) as a real instant.
  function zonedToDate(day, minutes) {
    var guess = day * 864e5 + minutes * 6e4;
    var t = guess - offsetAt(guess);
    return new Date(guess - offsetAt(t));
  }
  var PREVIEW_NOW = (function () {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(param('now') || '');
    if (!m || +m[2] < 1 || +m[2] > 12 || +m[3] < 1 || +m[3] > 31 || +m[4] > 23 || +m[5] > 59) return null;
    return zonedToDate(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5, +m[4] * 60 + +m[5]);
  })();
  function now() { return PREVIEW_NOW || new Date(); }
  function dayNum(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(iso || ''));
    if (!m) return NaN;
    var n = Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5;
    return isoOf(n) === iso ? n : NaN; // rejects 2026-02-31
  }
  function isoOf(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  function ymd(n) { var d = new Date(n * 864e5); return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate() }; }
  function weekday(n) { return ((n % 7) + 11) % 7; } // 1970-01-01 was a Thursday (4)
  function todayNum() { var p = zoneParts(now()); return Date.UTC(p.y, p.m - 1, p.d) / 864e5; }
  function nowMinutes() { var p = zoneParts(now()); return p.h * 60 + p.mi; }
  function mins(hhmm) { var m = /^(\d{2}):(\d{2})$/.exec(hhmm || ''); return m ? +m[1] * 60 + +m[2] : 0; }
  // Minutes after midnight as a display time: "7:00 PM".
  function hhmm(minutes) {
    var h = Math.floor(minutes / 60) % 24;
    return (h % 12 || 12) + ':' + String(minutes % 60).padStart(2, '0') + (h < 12 ? ' AM' : ' PM');
  }
  // A range of display times: "7:00–9:00 PM", or "10:30 AM–12:00 PM" across noon.
  function hhmmRange(a, b) {
    var from = hhmm(a), to = hhmm(b);
    return (from.slice(-2) === to.slice(-2) ? from.slice(0, -3) : from) + '–' + to;
  }
  function fmtDay(n, opts) {
    return new Intl.DateTimeFormat(LOCALE, Object.assign({ timeZone: 'UTC' }, opts)).format(new Date(n * 864e5 + 432e5));
  }
  // "Tue, Oct 20" (adds the year when it isn't this year).
  function shortDay(n) {
    var o = { weekday: 'short', day: 'numeric', month: 'short' };
    if (ymd(n).y !== ymd(todayNum()).y) o.year = 'numeric';
    return fmtDay(n, o);
  }
  function longDay(n) {
    var o = { weekday: 'long', day: 'numeric', month: 'long' };
    if (ymd(n).y !== ymd(todayNum()).y) o.year = 'numeric';
    return fmtDay(n, o);
  }
  // "Today", "Tomorrow" or "Tue, Oct 20".
  function relDay(n) {
    var t = todayNum();
    return n === t ? 'Today' : n === t + 1 ? 'Tomorrow' : shortDay(n);
  }
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  /* ======================================================================
     4. Program rules
     ====================================================================== */
  // The winter break (DATA.WINTER_BREAK): closed from December 24 to January 1.
  function isWinterBreak(n) {
    var d = ymd(n), b = DATA.WINTER_BREAK;
    var md = d.m * 100 + d.d, from = b.from.month * 100 + b.from.day, to = b.to.month * 100 + b.to.day;
    return from <= to ? md >= from && md <= to : md >= from || md <= to;
  }
  // The holiday (DATA.HOLIDAYS) that falls on day n, if any.
  function holidayOn(n) {
    var d = ymd(n), hit = null;
    DATA.HOLIDAYS.forEach(function (h) {
      if (d.m === h.month && (h.date ? d.d === h.date : weekday(n) === h.day && Math.ceil(d.d / 7) === h.nth)) hit = h;
    });
    return hit;
  }
  function isClosed(n) { return isWinterBreak(n) || !!holidayOn(n); }
  // What the building is closed for on day n: "the winter break", "Thanksgiving" or ''.
  function closureName(n) {
    if (isWinterBreak(n)) return 'the winter break';
    var h = holidayOn(n);
    return h ? h.name : '';
  }
  // The first open day after a closure.
  function reopensAfter(n) { while (isClosed(n)) n++; return n; }
  function daysInMonth(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }
  function matchesRule(rule, n) {
    if (!rule || weekday(n) !== rule.day) return false;
    if (rule.every === 'week') return true;
    if (rule.every === 'month') {
      var d = ymd(n), idx = Math.ceil(d.d / 7), last = d.d + 7 > daysInMonth(d.y, d.m);
      return rule.nth.indexOf(idx) !== -1 || (last && rule.nth.indexOf(-1) !== -1);
    }
    return false;
  }
  var NTH = { 1: 'first', 2: 'second', 3: 'third', 4: 'fourth', '-1': 'last' };
  // "Every Tuesday", "First Sunday of the month", "Second and fourth Sunday of the month".
  function ruleText(l) {
    if (l.cat === 'exhibition') return 'Runs for ' + plural(galleryRun(l.id).weeks, 'week') + ' in the Foyer Gallery';
    var r = l.rule;
    if (r.every === 'week') return 'Every ' + WEEKDAYS[r.day];
    var words = r.nth.map(function (k) { return NTH[k]; });
    var list = words.length > 1 ? words.slice(0, -1).join(', ') + ' and ' + words[words.length - 1] : words[0];
    return list.charAt(0).toUpperCase() + list.slice(1) + ' ' + WEEKDAYS[r.day] + ' of the month';
  }
  function timeText(l) { return hhmmRange(mins(l.start), mins(l.end)); }
  function priceText(l, short) {
    if (l.pwyc && !l.price) return 'Pay what you can';
    if (!l.price) return 'Free';
    var p = money(l.price);
    if (l.pwyc) return short ? p + ' or pay what you can' : p + ' suggested, or pay what you can';
    return l.per === 'child' ? p + ' per child' : l.per === 'session' ? p + ' a session' : p;
  }

  // Gallery runs (DATA.GALLERY): exhibitions take turns, on repeat, from the anchor Saturday.
  var GALLERY = DATA.GALLERY;
  var GALLERY_ANCHOR = dayNum(GALLERY.anchor);
  var CYCLE_WEEKS = GALLERY.runs.reduce(function (s, r) { return s + r.weeks; }, 0);
  function galleryRun(id) {
    var offset = 0;
    for (var i = 0; i < GALLERY.runs.length; i++) {
      if (GALLERY.runs[i].id === id) return { weeks: GALLERY.runs[i].weeks, offset: offset };
      offset += GALLERY.runs[i].weeks;
    }
    return { weeks: 0, offset: 0 };
  }
  // Every run of exhibition `id` that is open at some point between days `from` and `to`.
  function runsOf(id, from, to) {
    var r = galleryRun(id), out = [];
    if (!r.weeks) return out;
    var k = Math.floor((from - GALLERY_ANCHOR - 7 * (r.offset + r.weeks)) / (7 * CYCLE_WEEKS));
    for (; ; k++) {
      var start = GALLERY_ANCHOR + 7 * (r.offset + k * CYCLE_WEEKS);
      var end = start + 7 * r.weeks - 6;
      if (start > to) break;
      if (end >= from) out.push({ start: start, end: end });
    }
    return out;
  }
  function nextRun(id) { var t = todayNum(); return runsOf(id, t, t + 7 * CYCLE_WEEKS + 7)[0] || null; }

  /* Every occurrence between days `from` and `to`, sorted by date and time. An occurrence is
     { l: listing, day, start, end (minutes), kind: 'session' | 'run' | 'preview', runStart, runEnd }.
     Sessions that already finished today are left out. Exhibitions appear once ("On now" or "Opens"),
     sorted on the first day of the range they are open, plus their preview evening. */
  function occurrences(from, to, filterFn) {
    var out = [], today = todayNum(), nowM = nowMinutes();
    from = Math.max(from, today);
    LISTINGS.forEach(function (l) {
      if (filterFn && !filterFn(l)) return;
      if (l.cat === 'exhibition') {
        runsOf(l.id, from, to).forEach(function (run) {
          // Shown on the first day the building is open (not during the winter break).
          var day = reopensAfter(Math.max(run.start, from));
          if (day > run.end || day > to) return;
          out.push({ l: l, day: day, start: mins('10:00'), end: mins('17:00'), kind: 'run', runStart: run.start, runEnd: run.end });
        });
        runsOf(l.id, from + 1, to + 1).forEach(function (run) {
          var pv = run.start - 1;
          if (pv < from || pv > to || isClosed(pv)) return;
          if (pv === today && mins(GALLERY.preview.end) <= nowM) return;
          out.push({ l: l, day: pv, start: mins(GALLERY.preview.start), end: mins(GALLERY.preview.end), kind: 'preview', runStart: run.start, runEnd: run.end });
        });
        return;
      }
      for (var n = from; n <= to; n++) {
        if (isClosed(n) || !matchesRule(l.rule, n)) continue;
        if (n === today && mins(l.end) <= nowM) continue;
        out.push({ l: l, day: n, start: mins(l.start), end: mins(l.end), kind: 'session' });
      }
    });
    out.sort(function (a, b) {
      return a.day - b.day || (a.kind === 'run') - (b.kind === 'run') || a.start - b.start || a.l.index - b.l.index;
    });
    return out;
  }
  // The next `count` occurrences of one listing.
  function upcoming(l, count) {
    var t = todayNum();
    return occurrences(t, t + LOOKAHEAD, function (x) { return x === l; })
      .filter(function (o) { return o.kind !== 'preview'; }).slice(0, count);
  }
  // "Tue, Oct 20, 7:00 PM" or, for an exhibition, "Until Sun, Nov 1" / "Opens Sat, Nov 7".
  function whenText(o) {
    if (o.kind === 'run') return o.runStart <= todayNum() ? 'On now, until ' + shortDay(o.runEnd) : 'Opens ' + relDay(o.runStart) + ', until ' + shortDay(o.runEnd);
    return relDay(o.day) + ', ' + hhmm(o.start);
  }

  /* ======================================================================
     5. Artwork: cut-paper collage drawn in SVG for each category (or `motif`)
     ====================================================================== */
  var C = { paper: '#fffaf1', ink: '#1f1d36', violet: '#5b34a8', lilac: '#e9e0fa', vermilion: '#e0532f', blush: '#fbe0d5',
    ochre: '#f3b23a', ochreLight: '#fde8bd', rose: '#f2a7bf', roseLight: '#fbe3eb', teal: '#17685a', tealLight: '#d5ece4',
    sky: '#8ec5e6', skyLight: '#ddeef8', leaf: '#7fb069', leafLight: '#e3f0da', sand: '#efe4d0' };
  // Tag colors per category tone. Class names are written out in full so Tailwind generates them.
  var TONES = {
    vermilion: { tag: 'bg-blush text-vermilion-dark', dot: 'bg-vermilion', bg: [C.blush, C.vermilion] },
    ochre: { tag: 'bg-ochre-light text-ochre-dark', dot: 'bg-ochre', bg: [C.ochreLight, C.ochre] },
    rose: { tag: 'bg-rose-light text-rose-dark', dot: 'bg-rose', bg: [C.roseLight, C.rose] },
    violet: { tag: 'bg-lilac text-violet', dot: 'bg-violet', bg: [C.lilac, C.violet] },
    sky: { tag: 'bg-sky-light text-sky-dark', dot: 'bg-sky', bg: [C.skyLight, C.sky] },
    teal: { tag: 'bg-teal-light text-teal', dot: 'bg-teal', bg: [C.tealLight, C.teal] },
    ink: { tag: 'bg-sand text-ink', dot: 'bg-ink', bg: [C.sand, C.ink] },
    leaf: { tag: 'bg-leaf-light text-leaf-dark', dot: 'bg-leaf', bg: [C.leafLight, C.leaf] }
  };
  function tone(cat) { return TONES[has(DATA.CATEGORIES, cat) ? DATA.CATEGORIES[cat].tone : 'ink']; }
  function catLabel(cat) { return has(DATA.CATEGORIES, cat) ? DATA.CATEGORIES[cat].label : ''; }

  // A torn paper scrap behind each motif, tilted a little differently per variant.
  function scrap(fill, v) {
    var a = [-5, 4, -2, 6, -7, 3][v % 6];
    return '<path transform="rotate(' + a + ' 200 150)" d="M62 52 92 44l40 6 38-8 44 7 36-5 40 9 30-4 6 40-5 38 7 44-6 36 4 34-34 4-40-6-38 7-44-5-36 6-42-7-28 4-5-38 6-40-7-36 5-44z" fill="' + fill + '"/>';
  }
  var MOTIFS = {
    print: function () {
      return '<rect x="96" y="88" width="150" height="118" rx="6" transform="rotate(-8 171 147)" fill="' + C.ochre + '"/>' +
        '<g transform="rotate(-8 171 147)" fill="none" stroke="' + C.ink + '" stroke-width="5" stroke-linecap="round"><path d="M120 120c18-14 30 10 50-4s30 8 50-6M118 150c20-12 34 12 54-2s28 8 52-4M124 178c16-8 28 6 44 0"/></g>' +
        '<path d="M196 170c22-40 70-46 98-20-30 4-46 26-58 52-14-4-28-14-40-32z" fill="' + C.paper + '"/><path d="M214 182c20-16 44-24 72-30" stroke="' + C.vermilion + '" stroke-width="4" fill="none"/>' +
        '<g class="bob"><rect x="246" y="66" width="86" height="34" rx="17" fill="' + C.ink + '"/><rect x="282" y="98" width="12" height="62" rx="6" fill="' + C.ink + '"/><rect x="274" y="152" width="28" height="44" rx="10" fill="' + C.violet + '"/></g>' +
        '<circle cx="104" cy="214" r="22" fill="' + C.ink + '"/><circle cx="122" cy="224" r="9" fill="' + C.ink + '"/>';
    },
    clay: function () {
      return '<ellipse cx="200" cy="232" rx="118" ry="16" fill="' + C.ink + '" opacity=".14"/>' +
        '<path d="M150 230c-30-30-36-76-14-104 10-12 12-24 6-36h60c-6 12-4 24 6 36 22 28 16 74-14 104z" fill="' + C.vermilion + '"/>' +
        '<path d="M140 122h82M134 160h94M144 198h74" stroke="' + C.paper + '" stroke-width="5" stroke-linecap="round" opacity=".7"/>' +
        '<path d="M236 230c-8-24-4-52 12-60h56c16 8 20 36 12 60z" fill="' + C.teal + '"/><path d="M248 186h58" stroke="' + C.ochre + '" stroke-width="6" stroke-linecap="round"/>' +
        '<g class="bob-slow" fill="none" stroke="' + C.ink + '" stroke-width="6" stroke-linecap="round"><path d="M266 92c16-20 44-20 56 0s-6 40-28 34-22-30 0-30 20 18 8 22"/></g>' +
        '<path d="M86 230c0-20 12-34 30-34s30 14 30 34z" fill="' + C.violet + '"/>';
    },
    textile: function () {
      return '<rect x="102" y="86" width="132" height="132" rx="10" transform="rotate(6 168 152)" fill="' + C.violet + '"/>' +
        '<rect x="122" y="106" width="92" height="92" rx="6" transform="rotate(6 168 152)" fill="none" stroke="' + C.paper + '" stroke-width="4" stroke-dasharray="10 9"/>' +
        '<g stroke="' + C.ochre + '" stroke-width="6" stroke-linecap="round"><path d="m150 136 30 30m0-30-30 30"/></g>' +
        '<path class="bob" d="M232 70c50 10 70 60 40 90s-90 20-60 70 90 30 98 10" fill="none" stroke="' + C.vermilion + '" stroke-width="6" stroke-linecap="round"/>' +
        '<rect x="300" y="196" width="16" height="70" rx="3" transform="rotate(32 308 231)" fill="' + C.ink + '"/>' +
        '<circle cx="292" cy="96" r="24" fill="' + C.ochre + '"/><g fill="' + C.ink + '"><circle cx="284" cy="90" r="4"/><circle cx="300" cy="90" r="4"/><circle cx="284" cy="104" r="4"/><circle cx="300" cy="104" r="4"/></g>';
    },
    music: function () {
      return '<circle cx="168" cy="152" r="84" fill="' + C.ink + '"/><circle cx="168" cy="152" r="60" fill="none" stroke="' + C.paper + '" stroke-width="2" opacity=".35"/><circle cx="168" cy="152" r="40" fill="none" stroke="' + C.paper + '" stroke-width="2" opacity=".35"/>' +
        '<circle cx="168" cy="152" r="24" fill="' + C.ochre + '"/><circle cx="168" cy="152" r="5" fill="' + C.ink + '"/>' +
        '<g class="bob" fill="' + C.vermilion + '"><path d="M270 82v86" stroke="' + C.vermilion + '" stroke-width="8"/><path d="M270 82l46 -12v26l-46 12z"/><ellipse cx="256" cy="170" rx="18" ry="13"/></g>' +
        '<g class="bob-slow" fill="' + C.paper + '"><path d="M318 128v62" stroke="' + C.paper + '" stroke-width="7"/><ellipse cx="306" cy="192" rx="15" ry="11"/></g>' +
        '<path d="M96 240c40-20 80-20 120 0" stroke="' + C.rose + '" stroke-width="10" fill="none" stroke-linecap="round"/>';
    },
    family: function () {
      return '<circle class="bob-slow" cx="296" cy="86" r="30" fill="' + C.ochre + '"/>' +
        '<path d="M92 236V150l60-46 60 46v86z" fill="' + C.vermilion + '"/><rect x="138" y="186" width="28" height="50" rx="14" fill="' + C.ink + '"/><rect x="108" y="154" width="22" height="22" rx="3" fill="' + C.paper + '"/><rect x="174" y="154" width="22" height="22" rx="3" fill="' + C.paper + '"/>' +
        '<g fill="' + C.violet + '"><circle cx="252" cy="152" r="14"/><path d="M234 236l6-62h24l6 62z"/></g>' +
        '<g fill="' + C.teal + '"><circle cx="298" cy="172" r="11"/><path d="M284 236l4-48h20l4 48z"/></g>' +
        '<path d="M262 196h28" stroke="' + C.ink + '" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M70 236h270" stroke="' + C.ink + '" stroke-width="6" stroke-linecap="round"/>';
    },
    film: function () {
      return '<path d="M86 116 330 70v160L86 186z" fill="' + C.ochre + '" opacity=".55"/>' +
        '<rect x="56" y="104" width="86" height="94" rx="12" fill="' + C.ink + '"/><circle cx="82" cy="92" r="24" fill="' + C.ink + '"/><circle cx="124" cy="88" r="20" fill="' + C.ink + '"/>' +
        '<circle cx="82" cy="92" r="9" fill="' + C.paper + '"/><circle cx="124" cy="88" r="7" fill="' + C.paper + '"/><rect x="140" y="132" width="22" height="34" rx="4" fill="' + C.vermilion + '"/>' +
        '<g transform="rotate(-6 250 160)"><rect x="196" y="112" width="132" height="92" rx="4" fill="' + C.paper + '"/><g fill="' + C.ink + '"><rect x="196" y="112" width="132" height="14"/><rect x="196" y="190" width="132" height="14"/></g>' +
        '<g fill="' + C.paper + '"><rect x="204" y="116" width="10" height="6" rx="1"/><rect x="226" y="116" width="10" height="6" rx="1"/><rect x="248" y="116" width="10" height="6" rx="1"/><rect x="270" y="116" width="10" height="6" rx="1"/><rect x="292" y="116" width="10" height="6" rx="1"/><rect x="314" y="116" width="10" height="6" rx="1"/><rect x="204" y="194" width="10" height="6" rx="1"/><rect x="226" y="194" width="10" height="6" rx="1"/><rect x="248" y="194" width="10" height="6" rx="1"/><rect x="270" y="194" width="10" height="6" rx="1"/><rect x="292" y="194" width="10" height="6" rx="1"/><rect x="314" y="194" width="10" height="6" rx="1"/></g>' +
        '<circle cx="262" cy="158" r="20" fill="' + C.teal + '"/><path d="M226 186c20-24 46-34 76-20" fill="none" stroke="' + C.violet + '" stroke-width="6"/></g>';
    },
    studio: function () {
      return '<rect x="96" y="70" width="104" height="166" rx="52" fill="' + C.ink + '"/><path d="M110 236V122a38 38 0 0 1 76 0v114z" fill="' + C.ochre + '"/>' +
        '<path d="M148 236 186 122v114z" fill="' + C.paper + '" opacity=".5"/>' +
        '<g class="bob"><path d="M236 150h66v38a33 33 0 0 1-66 0z" fill="' + C.paper + '"/><path d="M302 160a16 16 0 0 1 0 28" fill="none" stroke="' + C.paper + '" stroke-width="7"/>' +
        '<path d="M254 136c-6-10 6-16 0-28M276 136c-6-10 6-16 0-28" fill="none" stroke="' + C.ink + '" stroke-width="4" stroke-linecap="round"/></g>' +
        '<path d="M232 236h104" stroke="' + C.ink + '" stroke-width="6" stroke-linecap="round"/>' +
        '<g transform="rotate(-38 316 96)"><rect x="304" y="64" width="16" height="70" rx="6" fill="' + C.vermilion + '"/><circle cx="312" cy="62" r="18" fill="' + C.vermilion + '"/><rect x="306" y="40" width="12" height="20" fill="' + C.leaf + '"/></g>';
    },
    // Exhibitions each have their own motif (`motif` in LISTINGS falls back to the category).
    waves: function () {
      return '<rect x="84" y="62" width="232" height="168" rx="4" fill="' + C.paper + '"/><rect x="84" y="62" width="232" height="168" rx="4" fill="none" stroke="' + C.ink + '" stroke-width="8"/>' +
        '<circle cx="250" cy="112" r="22" fill="' + C.ochre + '"/>' +
        '<g fill="none" stroke-width="7" stroke-linecap="round"><path d="M100 150c20-14 40 14 60 0s40 14 60 0 40 14 60 0" stroke="' + C.teal + '"/><path d="M100 176c20-14 40 14 60 0s40 14 60 0 40 14 60 0" stroke="' + C.sky + '"/><path d="M100 202c20-14 40 14 60 0s40 14 60 0 40 14 60 0" stroke="' + C.teal + '"/></g>' +
        '<path d="M128 250h144" stroke="' + C.ink + '" stroke-width="6" stroke-linecap="round"/>';
    },
    teapot: function () {
      return '<path d="M110 212h180" stroke="' + C.ink + '" stroke-width="10" stroke-linecap="round"/>' +
        '<path d="M140 206c-12-50 10-92 60-92s72 42 60 92z" fill="' + C.vermilion + '"/><path d="M186 114c0-14 28-14 28 0z" fill="' + C.ink + '"/>' +
        '<path d="M258 150c26-10 42-30 52-46" stroke="' + C.vermilion + '" stroke-width="14" stroke-linecap="round" fill="none"/>' +
        '<path d="M146 140c-30-6-40 30-10 44" stroke="' + C.vermilion + '" stroke-width="10" fill="none"/>' +
        '<g fill="' + C.paper + '"><circle cx="180" cy="160" r="8"/><circle cx="204" cy="150" r="8"/><circle cx="228" cy="164" r="8"/><circle cx="196" cy="184" r="8"/></g>' +
        '<rect x="300" y="160" width="40" height="46" rx="6" fill="' + C.teal + '"/><path d="M340 172c14 0 14 22 0 22" stroke="' + C.teal + '" stroke-width="6" fill="none"/>';
    },
    salon: function () {
      return '<rect x="74" y="64" width="86" height="68" fill="' + C.vermilion + '" stroke="' + C.ink + '" stroke-width="6"/><circle cx="117" cy="98" r="18" fill="' + C.ochre + '"/>' +
        '<rect x="176" y="54" width="62" height="88" fill="' + C.paper + '" stroke="' + C.ink + '" stroke-width="6"/><path d="M188 126l18-40 20 40z" fill="' + C.teal + '"/>' +
        '<rect x="254" y="70" width="76" height="58" fill="' + C.violet + '" stroke="' + C.ink + '" stroke-width="6"/><path d="M266 112c18-20 36 10 54-12" stroke="' + C.rose + '" stroke-width="5" fill="none"/>' +
        '<rect x="96" y="150" width="62" height="62" rx="31" fill="' + C.sky + '" stroke="' + C.ink + '" stroke-width="6"/>' +
        '<rect x="176" y="160" width="108" height="66" fill="' + C.ochre + '" stroke="' + C.ink + '" stroke-width="6"/><path d="M190 212h80M190 196h56" stroke="' + C.ink + '" stroke-width="5"/>' +
        '<rect x="300" y="150" width="36" height="52" fill="' + C.leaf + '" stroke="' + C.ink + '" stroke-width="6"/>';
    }
  };
  // Extra motifs for listings that share a category.
  MOTIFS.drawing = function () {
    return '<path d="M150 250 196 70h8l46 180M200 74v190" stroke="' + C.ink + '" stroke-width="7" stroke-linecap="round" fill="none"/>' +
      '<rect x="128" y="96" width="144" height="110" rx="4" fill="' + C.paper + '" stroke="' + C.ink + '" stroke-width="4"/>' +
      '<path d="M190 120c-14 0-18 22-6 28-18 6-24 30-14 46M190 148c14 4 24 14 28 30M184 150c-10 10-16 24-14 40" fill="none" stroke="' + C.vermilion + '" stroke-width="4" stroke-linecap="round"/><circle cx="192" cy="118" r="10" fill="none" stroke="' + C.vermilion + '" stroke-width="4"/>' +
      '<g class="bob"><rect x="292" y="84" width="10" height="70" rx="3" transform="rotate(24 297 119)" fill="' + C.ink + '"/><path d="M306 150l6 14-14-6z" fill="' + C.ochre + '"/></g>' +
      '<circle cx="96" cy="96" r="22" fill="' + C.ochre + '"/>';
  };
  MOTIFS.zine = function () {
    return '<g transform="rotate(-6 200 150)"><path d="M90 90h110v130H90z" fill="' + C.paper + '"/><path d="M200 90h110v130H200z" fill="' + C.vermilion + '"/><path d="M200 90v130" stroke="' + C.ink + '" stroke-width="4"/>' +
      '<path d="M106 112h76M106 128h60M106 144h70" stroke="' + C.ink + '" stroke-width="6" stroke-linecap="round"/><circle cx="142" cy="186" r="20" fill="' + C.violet + '"/>' +
      '<path d="M222 200l30-60 30 60z" fill="' + C.ochre + '"/><circle cx="286" cy="116" r="10" fill="' + C.paper + '"/></g>' +
      '<g class="bob-slow"><rect x="290" y="210" width="70" height="40" rx="6" transform="rotate(10 325 230)" fill="' + C.teal + '"/></g>';
  };
  MOTIFS.wheel = function () {
    return '<ellipse cx="200" cy="214" rx="120" ry="30" fill="' + C.ink + '"/><ellipse cx="200" cy="204" rx="104" ry="22" fill="' + C.sky + '"/>' +
      '<path d="M162 200c-8-40 0-74 14-90h48c14 16 22 50 14 90z" fill="' + C.vermilion + '"/><ellipse cx="200" cy="110" rx="24" ry="7" fill="' + C.ink + '"/>' +
      '<g class="bob" fill="none" stroke="' + C.ink + '" stroke-width="5" stroke-linecap="round"><path d="M96 120c10-10 24-10 32 0M290 110c10-12 26-12 34 0"/></g>' +
      '<path d="M100 270h200" stroke="' + C.ink + '" stroke-width="12" stroke-linecap="round"/>';
  };
  MOTIFS.repair = function () {
    return '<path d="M120 236h90l-14-60h-62z" fill="' + C.violet + '"/><path d="M165 176V110l40-30" stroke="' + C.ink + '" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M190 66l52 20-14 34-52-20z" fill="' + C.ochre + '"/><circle cx="226" cy="132" r="14" fill="' + C.paper + '" opacity=".8"/>' +
      '<g class="bob" transform="rotate(40 290 160)"><rect x="282" y="110" width="18" height="110" rx="6" fill="' + C.ink + '"/><path d="M270 100a22 22 0 1 0 42 0l-10 12h-22z" fill="' + C.ink + '"/></g>' +
      '<rect x="248" y="214" width="80" height="22" rx="4" fill="' + C.vermilion + '"/><path d="M100 250h240" stroke="' + C.ink + '" stroke-width="6" stroke-linecap="round"/>';
  };
  MOTIFS.exhibition = MOTIFS.salon;
  // The full artwork for a listing (or a category key), as an SVG string. Decorative: aria-hidden.
  function artFor(key, variant, cls) {
    var l = listing(key);
    var cat = l ? l.cat : key;
    var motif = l && l.motif && has(MOTIFS, l.motif) ? l.motif : cat;
    if (!has(MOTIFS, motif)) motif = 'studio';
    var t = tone(cat), v = variant || 0;
    var bg = v % 2 ? t.bg[0] : C.paper;
    var scrapFill = v % 2 ? C.paper : t.bg[0];
    return '<svg viewBox="0 0 400 300" class="' + (cls || 'h-full w-full') + '" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<rect width="400" height="300" fill="' + bg + '"/>' + scrap(scrapFill, v) + MOTIFS[motif]() + '</svg>';
  }
  var MOTIF_FOR = { 'tide-lines': 'waves', kept: 'teapot', 'mosaic-open': 'salon', 'life-drawing': 'drawing', 'zine-day': 'zine', 'wheel-taster': 'wheel', 'repair-cafe': 'repair' };
  Object.keys(MOTIF_FOR).forEach(function (id) { if (BY_ID[id] && !BY_ID[id].motif) BY_ID[id].motif = MOTIF_FOR[id]; });
  // Fill <div data-art="clay" data-variant="1"> placeholders in the HTML.
  function paintArt(root) {
    $$('[data-art]', root).forEach(function (el) {
      if (el.firstElementChild) return;
      el.innerHTML = artFor(el.getAttribute('data-art'), +el.getAttribute('data-variant') || 0);
    });
  }

  /* ======================================================================
     6. Saved events (safeStorage, key STORAGE_KEYS.saved)
     ====================================================================== */
  function readSaved() {
    var v = readJSON(STORAGE_KEYS.saved);
    if (!Array.isArray(v)) return [];
    var seen = Object.create(null);
    return v.filter(function (id) {
      if (typeof id !== 'string' || !has(BY_ID, id) || seen[id]) return false;
      seen[id] = true;
      return true;
    }).slice(0, LISTINGS.length);
  }
  var saved = readSaved();
  var savedListeners = [];
  function isSaved(id) { return saved.indexOf(id) !== -1; }
  function toggleSaved(id) {
    if (!has(BY_ID, id)) return;
    saved = isSaved(id) ? saved.filter(function (x) { return x !== id; }) : saved.concat(id);
    writeJSON(STORAGE_KEYS.saved, saved);
    toast(isSaved(id) ? 'Saved “' + BY_ID[id].title + '”' : 'Removed “' + BY_ID[id].title + '”');
    syncSaved();
    savedListeners.forEach(function (fn) { fn(); });
  }
  function syncSaved() {
    $$('[data-save]').forEach(function (btn) {
      var id = btn.getAttribute('data-save');
      var on = isSaved(id);
      btn.setAttribute('aria-pressed', String(on));
      var label = $('[data-save-label]', btn);
      if (label) label.textContent = on ? (btn.hasAttribute('data-save-long') ? 'Saved to your list' : 'Saved') : (btn.hasAttribute('data-save-long') ? 'Save this event' : 'Save');
      // The name starts with the visible text, then says which event.
      var name = btn.getAttribute('data-save-name');
      if (label && name) btn.setAttribute('aria-label', label.textContent + ': ' + name);
    });
    $$('[data-saved-count]').forEach(function (el) {
      el.textContent = String(saved.length);
      var link = el.closest('a[aria-label]');
      if (link) link.setAttribute('aria-label', 'Saved: ' + plural(saved.length, 'event'));
    });
    $$('[data-saved-label]').forEach(function (el) { el.textContent = plural(saved.length, 'saved event'); });
  }
  function saveButton(l, extra) {
    var on = isSaved(l.id);
    return '<button type="button" data-save="' + esc(l.id) + '" aria-pressed="' + on + '" data-save-name="' + esc(l.title) + '" aria-label="' + (on ? 'Saved' : 'Save') + ': ' + esc(l.title) + '" class="group/save inline-flex shrink-0 items-center gap-1.5 rounded-full border-2 border-ink/15 bg-card px-3 py-1.5 text-sm font-bold transition hover:border-violet aria-pressed:border-violet aria-pressed:bg-violet aria-pressed:text-white ' + (extra || '') + '">' +
      '<svg viewBox="0 0 20 20" class="size-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path class="group-aria-pressed/save:fill-current" d="M5 3h10v14l-5-3.5L5 17z"/></svg><span data-save-label>' + (on ? 'Saved' : 'Save') + '</span></button>';
  }

  /* ======================================================================
     7. Shared UI
     ====================================================================== */
  function initMenu() {
    var btn = $('#menu-toggle'), menu = $('#mobile-menu');
    if (!btn || !menu) return;
    function set(open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
      $('[data-icon-open]', btn).classList.toggle('hidden', open);
      $('[data-icon-close]', btn).classList.toggle('hidden', !open);
    }
    btn.addEventListener('click', function () { set(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { set(false); btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) set(false); });
    var header = $('#site-header');
    if (header) {
      var onScroll = function () { header.classList.toggle('shadow-paper', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
  }
  function initReveal() {
    var els = $$('.reveal');
    if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var bottom = entry.target.getBoundingClientRect().bottom;
        // Reveal this element and everything above it, so fast jumps never leave hidden content.
        els.forEach(function (el) {
          if (!el.classList.contains('is-visible') && el.getBoundingClientRect().top <= bottom) { el.classList.add('is-visible'); io.unobserve(el); }
        });
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    els.forEach(function (el) { io.observe(el); });
  }
  function revealNew(root) { $$('.reveal', root).forEach(function (el) { el.classList.add('is-visible'); }); }
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);
    var onScroll = function () { btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 1.2); };
    window.addEventListener('scroll', onScroll, { passive: true });
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var main = $('#main');
      if (main) main.focus({ preventScroll: true });
    });
    onScroll();
  }
  function initYear() { $$('[data-year]').forEach(function (el) { el.textContent = String(ymd(todayNum()).y); }); }

  // Opening status: "Open now until 5:00 PM" / "Closed now. Opens Tuesday at 10:00 AM".
  function openStatus() {
    var t = todayNum(), m = nowMinutes();
    if (!isClosed(t)) {
      var h = DATA.HOURS[weekday(t)];
      if (h && m >= mins(h.open) && m < mins(h.close)) return { open: true, text: 'Open now until ' + hhmm(mins(h.close)) };
      if (h && m < mins(h.open)) return { open: false, text: 'Opens today at ' + hhmm(mins(h.open)) };
    }
    for (var n = t + 1; n < t + 14; n++) {
      var hh = DATA.HOURS[weekday(n)];
      if (hh && !isClosed(n)) return { open: false, text: 'Closed now. Opens ' + (n === t + 1 ? 'tomorrow' : WEEKDAYS[weekday(n)]) + ' at ' + hhmm(mins(hh.open)) };
    }
    return { open: false, text: 'Closed now' };
  }
  function initStatus() {
    var s = openStatus();
    $$('[data-open-status]').forEach(function (el) {
      el.textContent = s.text;
      var dot = el.previousElementSibling;
      if (dot && dot.hasAttribute('data-open-dot')) {
        dot.classList.toggle('bg-leaf', s.open);
        dot.classList.toggle('bg-ochre', !s.open);
      }
    });
    var t = todayNum();
    $$('[data-hours-row]').forEach(function (row) {
      var on = +row.getAttribute('data-hours-row') === weekday(t);
      row.classList.toggle('bg-ochre-light', on);
      row.classList.toggle('font-bold', on);
      var flag = $('[data-today-flag]', row);
      if (flag) flag.hidden = !on;
    });
    // The next winter break, when it is less than eight weeks away (or now).
    var y = ymd(t).y, b = DATA.WINTER_BREAK;
    var start = Date.UTC(y, b.from.month - 1, b.from.day) / 864e5;
    if (isWinterBreak(t)) { start = t; while (isWinterBreak(start - 1)) start--; }
    var end = reopensAfter(start) - 1;
    $$('[data-winter-note]').forEach(function (el) {
      if (end >= t && start - t <= 56) {
        el.hidden = false;
        $('[data-winter-text]', el).textContent = 'Closed for the winter break from ' + longDay(start) + ' to ' + longDay(end) + '. We reopen on ' + longDay(end + 1) + '.';
      }
    });
  }

  /* ======================================================================
     8. Cards and rows
     ====================================================================== */
  function tagHtml(cat) {
    return '<span class="tag ' + tone(cat).tag + '">' + esc(catLabel(cat)) + '</span>';
  }
  function eventHref(l, o) {
    return 'event.html?id=' + encodeURIComponent(l.id) + (o && o.kind === 'session' ? '&date=' + isoOf(o.day) : '');
  }
  // A card for the home page and related events.
  function cardHtml(o, i) {
    var l = o.l;
    var badge = o.kind === 'preview' ? 'Preview evening' : o.kind === 'run' ? (o.runStart <= todayNum() ? 'On now' : 'Opening soon') : relDay(o.day);
    return '<article class="reveal card card-hover group relative flex flex-col overflow-hidden">' +
      '<div class="art relative aspect-[4/3] overflow-hidden border-b border-line">' + artFor(l.id, i, 'h-full w-full transition duration-500 group-hover:scale-[1.04]') +
      '<span class="absolute left-3 top-3 -rotate-3 rounded-lg bg-ink px-2.5 py-1 text-xs font-extrabold uppercase tracking-wider text-white">' + esc(badge) + '</span></div>' +
      '<div class="flex flex-1 flex-col p-5">' +
      '<div class="flex flex-wrap items-center gap-2">' + tagHtml(l.cat) + '</div>' +
      '<h3 class="mt-3 text-xl font-extrabold leading-snug"><a href="' + eventHref(l, o) + '" class="after:absolute after:inset-0 hover:text-violet">' + esc(l.title) + '</a></h3>' +
      '<p class="mt-2 text-sm font-semibold text-muted">' + esc(whenText(o)) + ' · ' + esc(priceText(l, true)) + '</p>' +
      '<div class="relative z-10 mt-auto flex items-center justify-between gap-3 pt-5"><span class="text-sm text-muted">' + esc(DATA.AGES[l.ages] || '') + '</span>' + saveButton(l) + '</div>' +
      '</div></article>';
  }
  // A row in the what's-on list.
  function rowHtml(o, i) {
    var l = o.l, room = has(DATA.ROOMS, l.room) ? DATA.ROOMS[l.room].name : '';
    var dateBlock = o.kind === 'run'
      ? '<span class="text-[11px] font-extrabold uppercase tracking-wider">' + (o.runStart <= todayNum() ? 'On now' : 'Opens') + '</span><span class="font-display text-2xl leading-none">' + (o.runStart <= todayNum() ? '★' : ymd(o.runStart).d) + '</span><span class="text-xs font-bold">' + (o.runStart <= todayNum() ? 'Gallery' : fmtDay(o.runStart, { month: 'short' })) + '</span>'
      : '<span class="text-[11px] font-extrabold uppercase tracking-wider">' + fmtDay(o.day, { weekday: 'short' }) + '</span><span class="font-display text-3xl leading-none">' + ymd(o.day).d + '</span><span class="text-xs font-bold">' + fmtDay(o.day, { month: 'short' }) + '</span>';
    var time = o.kind === 'run' ? (o.runStart <= todayNum() ? 'Until ' + longDay(o.runEnd) : longDay(o.runStart) + ' to ' + longDay(o.runEnd)) : hhmmRange(o.start, o.end);
    var title = o.kind === 'preview' ? 'Preview evening: ' + l.title : l.title;
    return '<li class="reveal relative grid grid-cols-[4.25rem_1fr] gap-4 rounded-2xl bg-card p-3 shadow-paper ring-1 ring-line transition hover:ring-violet/40 sm:grid-cols-[4.5rem_7.5rem_1fr_auto] sm:items-center sm:gap-5 sm:p-4" data-occurrence data-cat="' + esc(l.cat) + '">' +
      '<div class="flex flex-col items-center justify-center rounded-xl bg-ink py-2 text-center text-white">' + dateBlock + '</div>' +
      '<div class="art hidden aspect-[4/3] overflow-hidden rounded-xl sm:block">' + artFor(l.id, i) + '</div>' +
      '<div class="min-w-0">' +
      '<div class="flex flex-wrap items-center gap-2">' + tagHtml(l.cat) + (l.booking === 'drop-in' ? '<span class="tag bg-sand text-ink">Drop in</span>' : '') + '</div>' +
      '<h3 class="mt-1.5 text-lg font-extrabold leading-snug"><a href="' + eventHref(l, o) + '" class="after:absolute after:inset-0 hover:text-violet">' + esc(title) + '</a></h3>' +
      '<p class="mt-1 text-sm text-muted"><span class="font-bold text-ink">' + esc(time) + '</span> · ' + esc(room) + ' · ' + esc(o.kind === 'preview' ? 'Free' : priceText(l, true)) + ' · ' + esc(DATA.AGES[l.ages] || '') + '</p>' +
      '</div>' +
      '<div class="relative z-10 col-start-2 sm:col-start-auto">' + saveButton(l) + '</div>' +
      '</li>';
  }
  function bindSaveButtons(root) {
    root.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-save]');
      if (!btn || !root.contains(btn)) return;
      e.preventDefault();
      toggleSaved(btn.getAttribute('data-save'));
    });
  }

  /* ======================================================================
     9. Calendar (.ics) downloads
     ====================================================================== */
  function icsText(s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n'); }
  function icsFold(line) {
    var out = '';
    while (line.length > 74) { out += line.slice(0, 74) + '\r\n '; line = line.slice(74); }
    return out + line;
  }
  function icsStamp(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
  function icsFor(o) {
    var l = o.l, room = has(DATA.ROOMS, l.room) ? DATA.ROOMS[l.room].name : '';
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//' + CENTRE.name + '//Program//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'BEGIN:VEVENT',
      'UID:' + l.id + '-' + o.kind + '-' + isoOf(o.kind === 'run' ? o.runStart : o.day) + '@' + CENTRE.uidDomain,
      'DTSTAMP:' + icsStamp(new Date())];
    if (o.kind === 'run') {
      lines.push('DTSTART;VALUE=DATE:' + isoOf(o.runStart).replace(/-/g, ''), 'DTEND;VALUE=DATE:' + isoOf(o.runEnd + 1).replace(/-/g, ''));
    } else {
      lines.push('DTSTART:' + icsStamp(zonedToDate(o.day, o.start)), 'DTEND:' + icsStamp(zonedToDate(o.day, o.end)));
    }
    lines.push('SUMMARY:' + icsText((o.kind === 'preview' ? 'Preview evening: ' : '') + l.title + ' at ' + CENTRE.name),
      'LOCATION:' + icsText(room + ', ' + CENTRE.address),
      'DESCRIPTION:' + icsText(l.summary), 'END:VEVENT', 'END:VCALENDAR');
    return lines.map(icsFold).join('\r\n') + '\r\n';
  }
  function downloadIcs(o) {
    var name = o.l.id + '-' + isoOf(o.kind === 'run' ? o.runStart : o.day) + '.ics';
    var ok = download(name, icsFor(o), 'text/calendar;charset=utf-8');
    toast(ok ? 'Downloaded ' + name : 'Your browser blocked the download');
    return ok ? name : '';
  }

  /* ======================================================================
     10. Pages
     ====================================================================== */
  /* ---- Home ---- */
  function initHome() {
    var grid = $('#home-week');
    if (grid) {
      var t = todayNum();
      // The next six sessions, one per listing, so the week looks as varied as it is.
      var seen = Object.create(null), picks = [];
      occurrences(t, t + 21).forEach(function (o) {
        if (picks.length < 6 && !seen[o.l.id] && o.kind !== 'run') { seen[o.l.id] = true; picks.push(o); }
      });
      grid.innerHTML = picks.map(cardHtml).join('');
      revealNew(grid);
      bindSaveButtons(grid);
    }
    var gal = $('#home-gallery');
    if (gal) {
      var t2 = todayNum();
      var runs = occurrences(t2, t2 + 7 * CYCLE_WEEKS, function (l) { return l.cat === 'exhibition'; })
        .filter(function (o) { return o.kind === 'run'; });
      var cur = runs[0];
      if (cur) {
        $('[data-gal-title]', gal).textContent = cur.l.title;
        $('[data-gal-title]', gal).setAttribute('href', eventHref(cur.l));
        $('[data-gal-summary]', gal).textContent = cur.l.summary;
        $('[data-gal-when]', gal).textContent = cur.runStart <= t2 ? 'On now until ' + longDay(cur.runEnd) : 'Opens ' + longDay(cur.runStart) + ', until ' + longDay(cur.runEnd);
        $('[data-gal-art]', gal).innerHTML = artFor(cur.l.id, 1);
        var next = runs[1];
        if (next) $('[data-gal-next]', gal).textContent = 'Next: ' + next.l.title + ', from ' + longDay(next.runStart) + '.';
      }
    }
    $$('[data-cat-count]').forEach(function (el) {
      var cat = el.getAttribute('data-cat-count');
      var occ = occurrences(todayNum(), todayNum() + 27, function (l) { return l.cat === cat; });
      if (cat === 'exhibition') {
        var shows = occ.filter(function (o) { return o.kind === 'run'; }).length;
        el.textContent = shows ? plural(shows, 'exhibition') + ' in the next four weeks' : 'New shows coming soon';
        return;
      }
      el.textContent = occ.length ? plural(occ.length, 'date') + ' in the next four weeks' : 'Coming up soon';
    });
  }

  /* ---- What's on ---- */
  var WHEN = { any: 'Any time', today: 'Today', week: 'Next 7 days', weekend: 'This weekend', month: 'Next 30 days', custom: 'Choose dates' };
  function initWhatsOn() {
    var list = $('#wo-list');
    if (!list) return;
    var form = $('#wo-filters');
    var state = { cat: 'all', age: 'any', price: 'any', when: 'any', from: '', to: '', saved: false, span: WINDOW_STEP };
    // Read and validate the URL: unknown values fall back to the defaults.
    var p = param('cat'); if (p === 'all' || has(DATA.CATEGORIES, p)) state.cat = p;
    p = param('age'); if (has(DATA.AGE_FILTERS, p)) state.age = p;
    p = param('price'); if (has(DATA.PRICE_FILTERS, p)) state.price = p;
    p = param('when'); if (has(WHEN, p)) state.when = p;
    state.saved = param('saved') === '1';
    var t = todayNum();
    var f = dayNum(param('from')), to = dayNum(param('to'));
    if (state.when === 'custom') {
      if (isNaN(f) || f < t || f > t + LOOKAHEAD) f = t;
      if (isNaN(to) || to < f || to > t + LOOKAHEAD) to = Math.min(f + 6, t + LOOKAHEAD);
      state.from = isoOf(f); state.to = isoOf(to);
    }
    var fromInput = $('#wo-from'), toInput = $('#wo-to');
    fromInput.min = toInput.min = isoOf(t);
    fromInput.max = toInput.max = isoOf(t + LOOKAHEAD);

    function range() {
      var t0 = todayNum(), wd = weekday(t0);
      switch (state.when) {
        case 'today': return [t0, t0];
        case 'week': return [t0, t0 + 6];
        case 'weekend':
          // Saturday and Sunday: the coming weekend, or what is left of this one.
          return wd === 0 ? [t0, t0] : [t0 + 6 - wd, t0 + 7 - wd];
        case 'month': return [t0, t0 + 29];
        case 'custom': return [dayNum(state.from), dayNum(state.to)];
        default: return [t0, t0 + state.span - 1];
      }
    }
    function matches(l) {
      if (state.cat !== 'all' && l.cat !== state.cat) return false;
      var af = DATA.AGE_FILTERS[state.age];
      if (af.match && af.match.indexOf(l.ages) === -1) return false;
      if (state.price === 'free' && (l.price || l.pwyc)) return false;
      if (state.price === 'under10' && l.price > 10) return false;
      if (state.price === 'pwyc' && !l.pwyc) return false;
      if (state.saved && !isSaved(l.id)) return false;
      return true;
    }
    function groupOf(day) {
      var t0 = todayNum(), d = day - t0;
      if (d === 0) return 'Today';
      if (d <= 6) return 'This week';
      if (d <= 13) return 'Next week';
      var mo = fmtDay(day, { month: 'long' });
      return ymd(day).m === ymd(t0).m && ymd(day).y === ymd(t0).y ? 'Later in ' + mo : mo + (ymd(day).y !== ymd(t0).y ? ' ' + ymd(day).y : '');
    }
    function render() {
      var r = range();
      var occ = occurrences(r[0], r[1], matches);
      var groups = [], cur = null;
      occ.forEach(function (o) {
        var g = groupOf(o.day);
        if (!cur || cur.name !== g) { cur = { name: g, items: [] }; groups.push(cur); }
        cur.items.push(o);
      });
      var html = '';
      // A note for each closure (the winter break, a holiday) that falls inside the range.
      var notes = '', noted = Object.create(null);
      for (var n = Math.max(r[0], todayNum()); n <= r[1]; n++) {
        var why = closureName(n);
        if (!why || noted[why]) continue;
        noted[why] = true;
        notes += '<p class="mb-8 rounded-2xl bg-ochre-light p-4 text-sm font-semibold">We’re closed for ' + esc(why) + (n === todayNum() ? '' : (isWinterBreak(n) ? ' from ' : ' on ') + esc(longDay(n))) + '. Sessions start again on ' + esc(longDay(reopensAfter(n))) + '.</p>';
      }
      var i = 0;
      groups.forEach(function (g) {
        var id = 'wo-g-' + g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        html += '<section aria-labelledby="' + id + '" class="mt-10 first:mt-0"><div class="flex items-baseline justify-between gap-4 border-b-2 border-ink pb-2">' +
          '<h2 id="' + id + '" class="font-display text-3xl">' + esc(g.name) + '</h2><p class="text-sm font-bold text-muted">' + plural(g.items.length, 'listing') + '</p></div>' +
          '<ul class="mt-4 space-y-3" role="list">' + g.items.map(function (o) { return rowHtml(o, i++); }).join('') + '</ul></section>';
      });
      list.innerHTML = notes + html;
      revealNew(list);
      $('#wo-empty').hidden = occ.length > 0;
      var span = state.when === 'any' ? 'over the next ' + plural(Math.round(state.span / 7), 'week')
        : state.when === 'custom' ? 'from ' + shortDay(r[0]) + ' to ' + shortDay(r[1]) : WHEN[state.when].toLowerCase();
      var listings = Object.keys(occ.reduce(function (acc, o) { acc[o.l.id] = 1; return acc; }, {})).length;
      $('#wo-count').textContent = plural(occ.length, 'date') + ' from ' + plural(listings, 'listing') + ' ' + span + (state.saved ? ', from your saved events' : '');
      var more = $('#wo-more');
      more.hidden = state.when !== 'any' || state.span >= WINDOW_MAX;
      $('#wo-saved-empty').hidden = !(state.saved && saved.length === 0);
      $('#wo-custom').hidden = state.when !== 'custom';
      setParams({ cat: state.cat === 'all' ? '' : state.cat, age: state.age === 'any' ? '' : state.age, price: state.price === 'any' ? '' : state.price,
        when: state.when === 'any' ? '' : state.when, from: state.when === 'custom' ? state.from : '', to: state.when === 'custom' ? state.to : '', saved: state.saved ? '1' : '' });
      $$('[data-week-day]').forEach(function (b) {
        var on = state.when === 'custom' && state.from === state.to && state.from === b.getAttribute('data-week-day');
        b.setAttribute('aria-pressed', String(on));
      });
    }
    // Put the state into the form controls.
    function syncForm() {
      var c = $('input[name="cat"][value="' + state.cat + '"]', form);
      if (c) c.checked = true;
      $('#wo-age').value = state.age;
      $('#wo-price').value = state.price;
      $('#wo-when').value = state.when;
      $('#wo-saved').checked = state.saved;
      fromInput.value = state.from; toInput.value = state.to;
    }
    form.addEventListener('change', function (e) {
      var el = e.target;
      if (el.name === 'cat') state.cat = el.value;
      else if (el.id === 'wo-age') state.age = has(DATA.AGE_FILTERS, el.value) ? el.value : 'any';
      else if (el.id === 'wo-price') state.price = has(DATA.PRICE_FILTERS, el.value) ? el.value : 'any';
      else if (el.id === 'wo-saved') state.saved = el.checked;
      else if (el.id === 'wo-when') {
        state.when = has(WHEN, el.value) ? el.value : 'any';
        if (state.when === 'custom' && !state.from) { state.from = isoOf(todayNum()); state.to = isoOf(todayNum() + 6); syncForm(); }
      } else if (el === fromInput || el === toInput) {
        var a = dayNum(fromInput.value), b = dayNum(toInput.value), t0 = todayNum();
        var err = $('#wo-date-error');
        err.textContent = '';
        if (isNaN(a) || isNaN(b)) { err.textContent = 'Choose both dates.'; return; }
        if (a < t0) { err.textContent = 'Choose a start date from today onwards.'; return; }
        if (b < a) { err.textContent = 'The end date must be on or after the start date.'; return; }
        if (b > t0 + LOOKAHEAD) { err.textContent = 'Choose dates within the next year.'; return; }
        state.from = fromInput.value; state.to = toInput.value;
      }
      render();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    function reset() {
      state = { cat: 'all', age: 'any', price: 'any', when: 'any', from: '', to: '', saved: false, span: WINDOW_STEP };
      $('#wo-date-error').textContent = '';
      syncForm();
      render();
    }
    $$('[data-wo-reset]').forEach(function (b) { b.addEventListener('click', reset); });
    $('#wo-more').addEventListener('click', function () {
      state.span = Math.min(WINDOW_MAX, state.span + WINDOW_STEP);
      render();
    });
    // The seven-day strip in the hero: pick a day.
    var strip = $('#wo-strip');
    if (strip) {
      var t0 = todayNum(), html = '';
      for (var d = 0; d < 7; d++) {
        var day = t0 + d;
        var occ = occurrences(day, day);
        var dots = occ.slice(0, 5).map(function (o) { return '<span class="size-2 rounded-full ' + tone(o.l.cat).dot + '"></span>'; }).join('');
        html += '<li><button type="button" data-week-day="' + isoOf(day) + '" aria-pressed="false" class="flex h-full w-full flex-col items-center rounded-2xl bg-card px-1 py-3 text-center shadow-paper ring-1 ring-line transition hover:-translate-y-0.5 hover:ring-violet aria-pressed:bg-ink aria-pressed:text-white ' + (d % 2 ? 'rotate-1' : '-rotate-1') + '">' +
          '<span class="text-[11px] font-extrabold uppercase tracking-wider">' + (d === 0 ? 'Today' : fmtDay(day, { weekday: 'short' })) + '</span>' +
          '<span class="font-display text-2xl leading-tight sm:text-3xl">' + ymd(day).d + '</span>' +
          '<span class="flex min-h-2 flex-wrap justify-center gap-1" aria-hidden="true">' + dots + '</span>' +
          '<span class="sr-only">' + esc(longDay(day)) + ', ' + (isClosed(day) ? 'closed' : plural(occ.length, 'listing')) + '</span>' +
          '<span aria-hidden="true" class="mt-1 text-[11px] font-bold opacity-75">' + (isClosed(day) ? 'Closed' : occ.length) + '</span></button></li>';
      }
      strip.innerHTML = html;
      strip.addEventListener('click', function (e) {
        var b = e.target.closest('[data-week-day]');
        if (!b) return;
        var iso = b.getAttribute('data-week-day');
        if (b.getAttribute('aria-pressed') === 'true') { reset(); return; }
        state.when = 'custom'; state.from = iso; state.to = iso;
        syncForm();
        render();
        var target = $('#wo-results');
        if (target) target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      });
    }
    bindSaveButtons(list);
    savedListeners.push(function () { if (state.saved) render(); });
    syncForm();
    render();
  }

  /* ---- Event ---- */
  function initEvent() {
    var root = $('#event');
    if (!root) return;
    var requested = param('id');
    var l = listing(requested) || BY_ID[DEFAULT_EVENT];
    var notice = $('#ev-notice');
    if (requested && !listing(requested)) notice.hidden = false;
    var t = todayNum();
    var room = has(DATA.ROOMS, l.room) ? DATA.ROOMS[l.room].name : '';
    var t2 = tone(l.cat);
    document.title = l.title + ' | Mosaic, Holyoke';
    var meta = $('meta[name="description"]');
    if (meta) meta.setAttribute('content', l.summary);
    var ogt = $('meta[property="og:title"]'); if (ogt) ogt.setAttribute('content', document.title);
    var ogd = $('meta[property="og:description"]'); if (ogd) ogd.setAttribute('content', l.summary);

    $('#ev-crumb').textContent = l.title;
    $('#ev-tag').className = 'tag ' + t2.tag;
    $('#ev-tag').textContent = catLabel(l.cat);
    $('#ev-title').textContent = l.title;
    $('#ev-summary').textContent = l.summary;
    $('#ev-art').innerHTML = artFor(l.id, 1);
    $('#ev-body').innerHTML = l.body.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    function fillList(sel, items, wrap) {
      var el = $(sel);
      el.innerHTML = items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('');
      $(wrap).hidden = !items.length;
    }
    fillList('#ev-included', l.included || [], '#ev-included-wrap');
    fillList('#ev-bring', l.bring || [], '#ev-bring-wrap');
    $('#ev-rule').textContent = ruleText(l) + (l.cat === 'exhibition' ? '' : ', ' + timeText(l));
    $('#ev-price').textContent = priceText(l);
    $('#ev-ages').textContent = DATA.AGES[l.ages] || '';
    $('#ev-room').textContent = room;
    $('#ev-host').textContent = l.host;
    $('#ev-level').textContent = l.level;
    $('#ev-booking').textContent = l.booking === 'book' ? 'Book ahead: ' + plural(l.places, 'spot') + ' a session' : 'Drop in: no need to book';
    var saveBtn = $('#ev-save');
    saveBtn.setAttribute('data-save', l.id);
    saveBtn.setAttribute('data-save-name', l.title);
    syncSaved();
    saveBtn.addEventListener('click', function () { toggleSaved(l.id); });

    // Dates: sessions (pick one) or an exhibition run (with its preview evening).
    var dates = [];
    if (l.cat === 'exhibition') {
      var run = nextRun(l.id);
      if (run) {
        dates.push({ l: l, kind: 'run', day: Math.max(run.start, t), start: mins('10:00'), end: mins('17:00'), runStart: run.start, runEnd: run.end });
        if (run.start - 1 >= t && !isClosed(run.start - 1)) dates.push({ l: l, kind: 'preview', day: run.start - 1, start: mins(GALLERY.preview.start), end: mins(GALLERY.preview.end), runStart: run.start, runEnd: run.end });
      }
    } else {
      dates = upcoming(l, 8);
    }
    var wanted = dayNum(param('date'));
    var sel = 0;
    dates.forEach(function (o, i) { if (o.day === wanted && o.kind === 'session') sel = i; });
    if (param('date') && l.cat !== 'exhibition' && !(dates[sel] && dates[sel].day === wanted)) {
      var dn = $('#ev-date-notice');
      dn.hidden = false;
      dn.textContent = 'That date isn’t one of the upcoming sessions, so we’ve picked the next one.';
    }
    var listEl = $('#ev-dates');
    function renderDates() {
      listEl.innerHTML = dates.map(function (o, i) {
        var label = o.kind === 'run' ? (o.runStart <= t ? 'On now until ' + longDay(o.runEnd) : longDay(o.runStart) + ' to ' + longDay(o.runEnd))
          : o.kind === 'preview' ? 'Preview evening, ' + longDay(o.day) + ', ' + hhmmRange(o.start, o.end)
            : longDay(o.day) + ', ' + hhmmRange(o.start, o.end);
        return '<li><button type="button" data-date-index="' + i + '" aria-pressed="' + (i === sel) + '" class="flex w-full items-center justify-between gap-3 rounded-xl border-2 border-ink/10 bg-card px-4 py-3 text-left text-[15px] font-semibold transition hover:border-violet aria-pressed:border-ink aria-pressed:bg-ink aria-pressed:text-white">' +
          '<span>' + esc(label) + '</span>' + (i === 0 && o.kind === 'session' ? '<span class="shrink-0 rounded-full bg-ochre px-2 py-0.5 text-xs font-extrabold text-ink">Next</span>' : '') + '</button></li>';
      }).join('');
      var o = dates[sel];
      $('#ev-next').textContent = o ? (o.kind === 'run' ? (o.runStart <= t ? 'On now' : 'Opens ' + longDay(o.runStart)) : longDay(o.day)) : 'Dates to be announced';
      $('#ev-time').textContent = o ? (o.kind === 'run' ? 'Until ' + longDay(o.runEnd) + ' · ' + GALLERY.hours : hhmmRange(o.start, o.end) + ' (Eastern time)') : '';
      $('#ev-ics').disabled = !o;
      var bookDate = $('#bk-date');
      if (bookDate && o && o.kind === 'session') bookDate.value = isoOf(o.day);
    }
    listEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-date-index]');
      if (!b) return;
      sel = +b.getAttribute('data-date-index');
      renderDates();
      if (dates[sel].kind === 'session') setParams({ date: isoOf(dates[sel].day) });
      var again = $('[data-date-index="' + sel + '"]', listEl);
      if (again) again.focus();
    });
    $('#ev-ics').addEventListener('click', function () {
      var o = dates[sel];
      if (!o) return;
      var name = downloadIcs(o);
      $('#ev-ics-status').textContent = name ? 'Downloaded ' + name + '. Open it to add the date to your calendar.' : 'Your browser blocked the download.';
    });
    renderDates();

    // Booking request (only for listings you book ahead).
    var bookWrap = $('#ev-book');
    var dropWrap = $('#ev-dropin');
    if (l.booking === 'book' && dates.length && l.cat !== 'exhibition') {
      bookWrap.hidden = false;
      dropWrap.hidden = true;
      var bd = $('#bk-date');
      bd.innerHTML = dates.map(function (o) { return '<option value="' + isoOf(o.day) + '">' + esc(longDay(o.day) + ', ' + hhmm(o.start)) + '</option>'; }).join('');
      bd.value = isoOf(dates[sel].day);
      var places = $('#bk-places');
      var max = Math.min(6, l.places);
      places.innerHTML = '';
      for (var k = 1; k <= max; k++) places.insertAdjacentHTML('beforeend', '<option value="' + k + '">' + plural(k, 'spot') + '</option>');
      var unit = l.per === 'child' ? 'child' : 'spot';
      $('#bk-places-label').textContent = l.per === 'child' ? 'How many children?' : 'How many spots?';
      var updateTotal = function () {
        var n = +places.value || 1;
        $('#bk-total').textContent = l.price ? money(l.price * n) + ' for ' + plural(n, unit, unit === 'child' ? 'children' : 'spots') + (l.pwyc ? ' (suggested)' : '') : priceText(l);
      };
      places.addEventListener('change', updateTotal);
      bd.addEventListener('change', function () {
        dates.forEach(function (o, i) { if (isoOf(o.day) === bd.value) sel = i; });
        renderDates();
      });
      updateTotal();
      initForm($('#booking-form'), function (form) {
        var day = dayNum(bd.value);
        var who = $('#bk-name').value.trim().split(/\s+/)[0];
        return '<p class="font-display text-2xl">Thanks, ' + esc(who) + '.</p><p class="mt-2 leading-relaxed text-muted">Your request for ' + esc(plural(+places.value, unit, unit === 'child' ? 'children' : 'spots')) + ' at ' + esc(l.title) + ' on ' + esc(longDay(day)) + ' is with the welcome desk. We’ll email to confirm your booking within two business days. Your reference is <strong class="text-ink">' + makeRef() + '</strong>.</p>';
      });
    } else {
      bookWrap.hidden = true;
      dropWrap.hidden = false;
      $('#ev-dropin-text').textContent = l.cat === 'exhibition'
        ? 'Free entry, no need to book. The gallery is open ' + GALLERY.hours.toLowerCase() + '.'
        : 'No need to book: just show up. Sessions start on time, but you’re welcome to join late.';
    }

    // More like this: other listings in the same category, then anything coming up soon.
    var rel = $('#ev-related');
    if (rel) {
      var seen = Object.create(null); seen[l.id] = true;
      var picks = [];
      var pool = occurrences(t, t + 42).filter(function (o) { return o.kind !== 'preview'; });
      pool.filter(function (o) { return o.l.cat === l.cat; }).concat(pool).forEach(function (o) {
        if (picks.length < 3 && !seen[o.l.id]) { seen[o.l.id] = true; picks.push(o); }
      });
      rel.innerHTML = picks.map(cardHtml).join('');
      revealNew(rel);
      bindSaveButtons(rel);
    }
  }

  /* ---- Workshops ---- */
  var TIME_FILTERS = { any: 'Any time', day: 'Daytime', evening: 'Evenings', weekend: 'Weekends' };
  function initWorkshops() {
    var grid = $('#ws-grid');
    if (!grid) return;
    var ws = LISTINGS.filter(function (l) { return l.workshop; });
    var state = { type: 'all', time: 'any' };
    var p = param('type'); if (p === 'all' || (has(DATA.CATEGORIES, p) && ws.some(function (l) { return l.cat === p; }))) state.type = p;
    p = param('time'); if (has(TIME_FILTERS, p)) state.time = p;
    function timeOf(l) { return mins(l.start) >= 17 * 60 ? 'evening' : 'day'; }
    function weekend(l) { return l.rule.day === 0 || l.rule.day === 6; }
    function render() {
      var shown = ws.filter(function (l) {
        if (state.type !== 'all' && l.cat !== state.type) return false;
        if (state.time === 'weekend' && !weekend(l)) return false;
        if ((state.time === 'day' || state.time === 'evening') && (weekend(l) || timeOf(l) !== state.time)) return false;
        return true;
      });
      grid.innerHTML = shown.map(function (l, i) {
        var next = upcoming(l, 1)[0];
        return '<article class="reveal card card-hover group relative flex flex-col overflow-hidden" data-workshop="' + esc(l.id) + '">' +
          '<div class="art aspect-[16/10] overflow-hidden border-b border-line">' + artFor(l.id, i + 1, 'h-full w-full transition duration-500 group-hover:scale-[1.04]') + '</div>' +
          '<div class="flex flex-1 flex-col p-6"><div class="flex flex-wrap gap-2">' + tagHtml(l.cat) + '<span class="tag bg-sand text-ink">' + esc(l.level) + '</span></div>' +
          '<h3 class="mt-3 text-xl font-extrabold"><a class="after:absolute after:inset-0 hover:text-violet" href="' + eventHref(l, next) + '">' + esc(l.title) + '</a></h3>' +
          '<p class="mt-2 leading-relaxed text-muted">' + esc(l.summary) + '</p>' +
          '<dl class="mt-5 grid grid-cols-2 gap-3 text-sm"><div><dt class="font-bold text-muted">When</dt><dd class="mt-0.5 font-semibold">' + esc(ruleText(l)) + ', ' + esc(timeText(l)) + '</dd></div>' +
          '<div><dt class="font-bold text-muted">Next session</dt><dd class="mt-0.5 font-semibold">' + (next ? esc(longDay(next.day)) : 'To be announced') + '</dd></div>' +
          '<div><dt class="font-bold text-muted">Price</dt><dd class="mt-0.5 font-semibold">' + esc(priceText(l, true)) + '</dd></div>' +
          '<div><dt class="font-bold text-muted">With</dt><dd class="mt-0.5 font-semibold">' + esc(l.host) + '</dd></div></dl>' +
          '<div class="relative z-10 mt-auto flex items-center justify-between gap-3 pt-6"><span class="text-sm font-bold">' + esc(l.booking === 'book' ? 'Book ahead' : 'Drop in') + '</span>' + saveButton(l) + '</div></div></article>';
      }).join('');
      revealNew(grid);
      $('#ws-empty').hidden = shown.length > 0;
      $('#ws-count').textContent = plural(shown.length, 'class', 'classes') + ' and workshops' + (state.type === 'all' && state.time === 'any' ? '' : ' match');
      setParams({ type: state.type === 'all' ? '' : state.type, time: state.time === 'any' ? '' : state.time });
    }
    var form = $('#ws-filters');
    form.addEventListener('change', function (e) {
      if (e.target.name === 'type') state.type = e.target.value;
      if (e.target.name === 'time') state.time = has(TIME_FILTERS, e.target.value) ? e.target.value : 'any';
      render();
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    $('#ws-reset').addEventListener('click', function () {
      state = { type: 'all', time: 'any' };
      $('input[name="type"][value="all"]', form).checked = true;
      $('input[name="time"][value="any"]', form).checked = true;
      render();
    });
    var tIn = $('input[name="type"][value="' + state.type + '"]', form); if (tIn) tIn.checked = true;
    var tmIn = $('input[name="time"][value="' + state.time + '"]', form); if (tmIn) tmIn.checked = true;
    bindSaveButtons(grid);
    render();

    // The weekly schedule: every regular session, Monday to Sunday.
    var tt = $('#ws-timetable');
    if (tt) {
      var order = [1, 2, 3, 4, 5, 6, 0];
      tt.innerHTML = order.map(function (d) {
        var items = LISTINGS.filter(function (l) { return l.rule && l.rule.day === d; })
          .sort(function (a, b) { return mins(a.start) - mins(b.start); });
        return '<li class="rounded-2xl bg-card p-4 shadow-paper ring-1 ring-line"><h3 class="font-display text-xl">' + WEEKDAYS[d] + '</h3><ul class="mt-3 space-y-2">' +
          (items.length ? items.map(function (l) {
            return '<li class="border-l-4 pl-3 ' + ({ vermilion: 'border-vermilion', ochre: 'border-ochre', rose: 'border-rose', violet: 'border-violet', sky: 'border-sky', teal: 'border-teal', ink: 'border-ink', leaf: 'border-leaf' })[DATA.CATEGORIES[l.cat].tone] + '"><a href="' + eventHref(l) + '" class="block text-sm font-bold leading-snug hover:text-violet">' + esc(l.title) + '</a>' +
              '<span class="block text-xs text-muted">' + esc(hhmm(mins(l.start))) + ' · ' + esc(l.rule.every === 'week' ? 'weekly' : ruleText(l).replace(/ of the month$/, '').replace(' ' + WEEKDAYS[d], '') + ' of the month') + '</span></li>';
          }).join('') : '<li class="text-sm text-muted">Building closed</li>') + '</ul></li>';
      }).join('');
    }
  }

  /* ---- Hire ---- */
  function initHire() {
    var form = $('#hire-form');
    if (!form) return;
    var H = DATA.HIRE, ROOMS = DATA.ROOMS, EXTRAS = DATA.HIRE_EXTRAS;
    var p = param('room');
    if (has(ROOMS, p) && ROOMS[p].hire) { var r = $('input[name="room"][value="' + p + '"]', form); if (r) r.checked = true; }
    var dateIn = $('#h-date'), startIn = $('#h-start'), hoursIn = $('#h-hours'), peopleIn = $('#h-people'), layoutIn = $('#h-layout');
    var t = todayNum();
    dateIn.min = isoOf(t + 1);
    dateIn.max = isoOf(t + LOOKAHEAD);
    function room() { var c = $('input[name="room"]:checked', form); return c && has(ROOMS, c.value) && ROOMS[c.value].hire ? c.value : null; }
    function quote() {
      var id = room();
      if (!id) return null;
      var rate = ROOMS[id].hire.rate, hours = +hoursIn.value, start = +startIn.value;
      if (!(hours >= H.minHours && hours <= H.maxHours)) hours = H.minHours;
      if (!(start >= H.firstStart && start < H.lastEnd)) start = 10;
      var lines = [], total = 0;
      var dayHours = Math.max(0, Math.min(start + hours, H.eveningFrom) - start);
      var eveHours = hours - dayHours;
      if (dayHours) { lines.push([ROOMS[id].name + ', ' + plural(dayHours, 'hour') + ' × ' + money(rate), rate * dayHours]); total += rate * dayHours; }
      if (eveHours) { var er = Math.round(rate * (1 + H.eveningSurcharge)); lines.push([ROOMS[id].name + ', ' + plural(eveHours, 'evening hour') + ' × ' + money(er), er * eveHours]); total += er * eveHours; }
      $$('input[name="extras"]:checked', form).forEach(function (x) {
        if (has(EXTRAS, x.value)) { lines.push([EXTRAS[x.value].label, EXTRAS[x.value].price]); total += EXTRAS[x.value].price; }
      });
      if ($('#h-community').checked) { var off = Math.round(total * H.communityDiscount); lines.push(['Community and nonprofit discount (' + Math.round(H.communityDiscount * 100) + '%)', -off]); total -= off; }
      return { lines: lines, total: total, id: id, hours: hours, start: start };
    }
    function capacityProblem() {
      var id = room(), n = +peopleIn.value;
      if (!id || !peopleIn.value || !(n > 0)) return '';
      var cap = layoutIn.value === 'standing' ? ROOMS[id].hire.standing : ROOMS[id].hire.seated;
      if (n <= cap) return '';
      var bigger = Object.keys(ROOMS).filter(function (k) { return ROOMS[k].hire && (layoutIn.value === 'standing' ? ROOMS[k].hire.standing : ROOMS[k].hire.seated) >= n; })
        .sort(function (a, b) { return ROOMS[a].hire.rate - ROOMS[b].hire.rate; })[0];
      return ROOMS[id].name + ' holds up to ' + cap + (layoutIn.value === 'standing' ? ' standing' : ' seated') + '.' + (bigger ? ' Try ' + ROOMS[bigger].name + '.' : ' Talk to us about larger events.');
    }
    function update() {
      var q = quote();
      var out = $('#h-lines');
      if (!q) { out.innerHTML = '<li class="text-white/80">Choose a room to see an estimate.</li>'; $('#h-total').textContent = money(0); return; }
      out.innerHTML = q.lines.map(function (x) {
        return '<li class="flex justify-between gap-4"><span class="text-white/85">' + esc(x[0]) + '</span><span class="shrink-0 font-bold">' + (x[1] < 0 ? '−' + money(-x[1]) : money(x[1])) + '</span></li>';
      }).join('');
      $('#h-total').textContent = money(q.total);
      $('#h-when').textContent = hhmmRange(q.start * 60, (q.start + q.hours) * 60) + (dayNum(dateIn.value) >= t + 1 ? ' on ' + longDay(dayNum(dateIn.value)) : '');
      var capErr = capacityProblem();
      $('#h-cap-note').textContent = capErr;
      var late = q.start + q.hours > H.lastEnd;
      $('#h-late-note').textContent = late ? 'The building closes at ' + hhmm(H.lastEnd * 60) + ', so the latest finish is ' + hhmm(H.lastEnd * 60) + '.' : '';
    }
    // Start times and durations, built from DATA.HIRE.
    for (var h = H.firstStart; h < H.lastEnd - 1; h++) startIn.insertAdjacentHTML('beforeend', '<option value="' + h + '"' + (h === 10 ? ' selected' : '') + '>' + hhmm(h * 60) + '</option>');
    for (var k = H.minHours; k <= H.maxHours; k++) hoursIn.insertAdjacentHTML('beforeend', '<option value="' + k + '"' + (k === 3 ? ' selected' : '') + '>' + plural(k, 'hour') + '</option>');
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    update();
    initForm(form, function () {
      var q = quote();
      var who = $('#h-name').value.trim().split(/\s+/)[0];
      return '<p class="font-display text-3xl">Thanks, ' + esc(who) + '.</p><p class="mt-3 leading-relaxed text-muted">Your inquiry for ' + esc(ROOMS[q.id].name) + ' on ' + esc(longDay(dayNum(dateIn.value))) + ', ' + esc(hhmmRange(q.start * 60, (q.start + q.hours) * 60)) + ' (estimate ' + esc(money(q.total)) + ') is with our bookings team. They’ll reply within two business days to confirm availability and the final price. Your reference is <strong class="text-ink">' + makeRef() + '</strong>.</p>';
    }, function () {
      // Checks across fields: the date must be bookable, the room big enough and the finish in time.
      var errs = [];
      var d = dayNum(dateIn.value);
      if (!isNaN(d) && d <= t) errs.push([dateIn, 'Choose a date from tomorrow onwards.']);
      else if (!isNaN(d) && d > t + LOOKAHEAD) errs.push([dateIn, 'We take bookings up to a year ahead.']);
      else if (!isNaN(d) && isClosed(d)) errs.push([dateIn, 'We’re closed for ' + closureName(d) + ' then. Choose a date from ' + longDay(reopensAfter(d)) + '.']);
      var cap = capacityProblem();
      if (cap) errs.push([peopleIn, cap]);
      if (+startIn.value + +hoursIn.value > H.lastEnd) errs.push([hoursIn, 'That runs past ' + hhmm(H.lastEnd * 60) + '. Choose fewer hours or an earlier start.']);
      return errs;
    });
  }

  /* ---- Get involved ---- */
  var ROLES = { welcome: 'Welcome desk', workshop: 'Workshop helper', gallery: 'Gallery host', repair: 'Repair café fixer', crew: 'Set-up crew', other: 'Something else' };
  function initInvolved() {
    var form = $('#volunteer-form');
    if (!form) return;
    var p = param('role');
    if (has(ROLES, p)) { $('#v-role').value = p; }
    $$('[data-role-link]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var role = a.getAttribute('data-role-link');
        if (!has(ROLES, role)) return;
        e.preventDefault();
        $('#v-role').value = role;
        setParams({ role: role });
        var target = $('#volunteer');
        target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        $('#v-name').focus({ preventScroll: true });
      });
    });
    initForm(form, function () {
      var who = $('#v-name').value.trim().split(/\s+/)[0];
      var role = has(ROLES, $('#v-role').value) ? ROLES[$('#v-role').value] : 'volunteering';
      return '<p class="font-display text-3xl">Thank you, ' + esc(who) + '.</p><p class="mt-3 leading-relaxed text-muted">Ned, our volunteer coordinator, will get in touch within a week to arrange a cup of coffee and a look around, and to talk about ' + esc(role.toLowerCase()) + '. Your reference is <strong class="text-ink">' + makeRef() + '</strong>.</p>';
    });
    var friend = $('#friends-form');
    if (friend) initForm(friend, function () {
      var tier = $('input[name="tier"]:checked', friend);
      return '<p class="font-display text-2xl text-ink">Welcome aboard.</p><p class="mt-2 text-muted">Look out for an email from us with a secure link to set up your ' + esc(tier ? tier.getAttribute('data-tier-name') : 'Friends') + ' membership. Nothing is taken until you’ve done that. Your reference is <strong class="text-ink">' + makeRef() + '</strong>.</p>';
    });
  }

  /* ---- Visit ---- */
  var TOPICS = { general: 'A general question', access: 'Access and getting here', booking: 'A booking', press: 'Press and partnerships' };
  function initVisit() {
    var form = $('#contact-form');
    if (!form) return;
    var p = param('topic');
    if (has(TOPICS, p)) $('#c-topic').value = p;
    initForm(form, function () {
      var who = $('#c-name').value.trim().split(/\s+/)[0];
      return '<p class="font-display text-3xl">Thanks, ' + esc(who) + '.</p><p class="mt-3 leading-relaxed text-muted">Your message is with the welcome desk and someone will reply within two business days. Your reference is <strong class="text-ink">' + makeRef() + '</strong>.</p>';
    });
  }

  /* ======================================================================
     11. Forms: inline validation and a success state. Nothing is sent.
     To connect a form, replace the success swap in initForm with a fetch() to your form service, e.g.
       fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
     and show the success message when the response is ok (see DOCS.md, Forms).
     ====================================================================== */
  function fieldLabel(el) {
    var lab = el.id ? $('label[for="' + el.id + '"]') : null;
    return lab ? lab.textContent.replace(/\s*\(optional\)\s*$/i, '').replace(/\s+/g, ' ').trim() : '';
  }
  // The message for one field, from its data-msg-* attributes or a generic one for its type.
  function messageFor(el) {
    var v = el.validity;
    if (v.valid) return '';
    var custom = function (k) { return el.getAttribute('data-msg-' + k); };
    if (v.valueMissing) {
      if (custom('required')) return custom('required');
      if (el.tagName === 'SELECT' || el.type === 'radio') return 'Please choose an option.';
      if (el.type === 'checkbox') return 'Please check this box to continue.';
      if (el.type === 'date') return 'Please choose a date.';
      var name = fieldLabel(el);
      return name ? 'Please fill in “' + name + '”.' : 'Please fill in this field.';
    }
    if (v.typeMismatch && el.type === 'email') return custom('email') || 'Enter an email address like name@example.com.';
    if (v.tooShort) return custom('short') || 'Please write at least ' + el.minLength + ' characters (you have ' + el.value.trim().length + ').';
    if (v.tooLong) return 'Please keep this under ' + el.maxLength + ' characters.';
    if (v.patternMismatch) return custom('pattern') || 'Please check the format of this field.';
    if (v.rangeUnderflow) return custom('range') || 'Please enter ' + el.min + ' or more.';
    if (v.rangeOverflow) return custom('range') || 'Please enter ' + el.max + ' or less.';
    if (v.badInput || v.stepMismatch) return custom('range') || 'Please enter a whole number.';
    return custom('invalid') || 'Please check this field.';
  }
  function errorEl(el) {
    var id = el.getAttribute('data-error-for') || el.id || el.name;
    return $('[data-error="' + id + '"]', el.form) || null;
  }
  function setError(el, msg) {
    var out = errorEl(el);
    if (out) out.textContent = msg;
    var group = el.closest('fieldset[data-group], fieldset[data-radio]');
    (group || el).setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  // Groups of checkboxes that need at least one checked: <fieldset data-group data-min="1">.
  function groupProblem(fs) {
    var min = +fs.getAttribute('data-min') || 0;
    var n = $$('input[type="checkbox"]:checked', fs).length;
    return n < min ? (fs.getAttribute('data-msg-required') || 'Please choose at least ' + plural(min, 'option') + '.') : '';
  }
  // A short reference for a confirmation, like MA-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return 'MA-' + out;
  }
  function initForm(form, success, extraChecks) {
    if (!form || form.__mosaic) return;
    form.__mosaic = true;
    form.setAttribute('novalidate', '');
    // Fields the browser validates; optional checkboxes and buttons are left out.
    var fields = function () {
      return $$('input, select, textarea', form).filter(function (el) { return el.willValidate && (el.type !== 'checkbox' || el.required); });
    };
    function trimValue(el) { if (el.type !== 'checkbox' && el.type !== 'radio' && typeof el.value === 'string' && el.value.trim() !== el.value && el.tagName !== 'SELECT') el.value = el.value.trim(); }
    form.addEventListener('blur', function (e) {
      var el = e.target;
      if (!el.willValidate || !el.value) return;
      trimValue(el);
      setError(el, messageFor(el));
    }, true);
    form.addEventListener('input', function (e) {
      var el = e.target;
      var holder = el.closest('fieldset[data-radio]') || el;
      if (holder.getAttribute('aria-invalid') === 'true') setError(el, messageFor(el));
      var fs = el.closest('fieldset[data-group]');
      if (fs && fs.getAttribute('aria-invalid') === 'true') { var m = groupProblem(fs); $('[data-error="' + fs.id + '"]', form).textContent = m; fs.setAttribute('aria-invalid', m ? 'true' : 'false'); }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      fields().forEach(function (el) {
        trimValue(el);
        var msg = messageFor(el);
        setError(el, msg);
        if (msg && !first) first = el;
      });
      $$('fieldset[data-group]', form).forEach(function (fs) {
        var m = groupProblem(fs);
        var out = $('[data-error="' + fs.id + '"]', form);
        if (out) out.textContent = m;
        fs.setAttribute('aria-invalid', m ? 'true' : 'false');
        if (m && !first) first = $('input', fs);
      });
      if (!first && extraChecks) {
        extraChecks(form).forEach(function (pair) {
          setError(pair[0], pair[1]);
          if (!first) first = pair[0];
        });
      }
      var summary = $('[data-form-summary]', form);
      if (first) {
        var count = $$('[aria-invalid="true"]', form).length;
        if (summary) { summary.hidden = false; summary.textContent = 'Please fix ' + plural(count, 'problem') + ' before sending.'; }
        first.focus();
        return;
      }
      if (summary) summary.hidden = true;
      var box = document.createElement('div');
      box.className = 'rounded-[1.4rem] bg-teal-light p-6 sm:p-8';
      box.setAttribute('role', 'status');
      box.setAttribute('tabindex', '-1');
      box.innerHTML = success(form);
      form.hidden = true;
      form.insertAdjacentElement('afterend', box);
      box.focus();
    });
  }
  function initSimpleForms() {
    $$('form[data-simple-form]').forEach(function (form) {
      initForm(form, function () {
        return '<p class="font-display text-2xl text-ink">You’re on the list.</p><p class="mt-2 text-muted">Look out for a confirmation email from us. Once you click the link, the Mosaic monthly arrives on the first Monday of the month.</p>';
      });
    });
  }

  /* ======================================================================
     12. Start
     ====================================================================== */
  initYear();
  initMenu();
  paintArt(document);
  initStatus();
  initHome();
  initWhatsOn();
  initEvent();
  initWorkshops();
  initHire();
  initInvolved();
  initVisit();
  initSimpleForms();
  syncSaved();
  initBackToTop();
  initReveal();
})();
