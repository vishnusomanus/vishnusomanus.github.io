/* Rillmark — site scripts for the motion studio of Marika Drever. Vanilla JavaScript, no dependencies.
 * The data (projects, journal, prices, people) lives in assets/js/data.js, loaded first.
 *
 *  1. Settings (time zone, storage keys, demo dates)
 *  2. Helpers (escaping, plurals, money, URL parameters, storage, toast)
 *  3. Time (every date is Eastern time, America/New_York; US federal holidays; business days)
 *  4. Data lookups
 *  5. Keeping the demo current (KEEP_DEMO_CURRENT) and the booking calendar
 *  6. Artwork: every project's frames are drawn as SVG (ART)
 *  7. Shared UI: header, menu, clock, availability, reveals, year
 *  8. The shortlist (saved projects)
 *  9. Home: the showreel player, disciplines, latest notes
 * 10. Work: filters, search, counts and the shortlist panel
 * 11. Case study (project.html?project=)
 * 12. Services: the scope and fee estimator
 * 13. Journal
 * 14. About: collaborators
 * 15. Contact: the project inquiry
 * 16. Start
 */
(function () {
  'use strict';

  var D = window.RILLMARK;
  if (!D) return;

  /* ======================================================================
     1. Settings
     ====================================================================== */
  // Every date and time on the site (availability, reply dates, journal) is wall-clock time here.
  var TIMEZONE = 'America/New_York';
  var LOCALE = 'en-US';
  var CURRENCY = 'USD';
  // localStorage keys. Both are validated on every read (see DOCS.md, "Saved data").
  //   shortlist: ['<project id>', ...]
  //   estimate:  { service, seconds, style, rounds, rush, addons: ['<add-on id>', ...] }
  var STORAGE_KEYS = { shortlist: 'rillmark-shortlist', estimate: 'rillmark-estimate' };
  // The project project.html shows when there is no (or an unknown) ?project=.
  var DEFAULT_PROJECT = 'season-of-tides';
  // Demo dates: the journal is written for the week of DEMO_ANCHOR. While KEEP_DEMO_CURRENT is
  // true, every note moves forward by the whole weeks that have passed since then, so the newest
  // note is always less than two weeks old and weekdays stay right. Set it to false when you
  // write real notes: they then keep their dates. Availability and reply dates are always worked
  // out from today (STUDIO.leadWeeks, STUDIO.replyWorkingDays in data.js).
  var KEEP_DEMO_CURRENT = true;
  var DEMO_ANCHOR = '2026-10-24';

  /* ======================================================================
     2. Helpers
     ====================================================================== */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function has(obj, key) { return typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function money(n) {
    return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, maximumFractionDigits: 0 }).format(Math.round(n));
  }
  function round10(n) { return Math.round(n / 10) * 10; }
  function clamp(n, lo, hi) { return Math.min(hi, Math.max(lo, n)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
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
    } catch (e) { /* file:// in some browsers */ }
  }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Storage that degrades to memory when localStorage is blocked (sandboxed iframes, strict
     privacy settings), so the shortlist and the estimate still work for the page view. */
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
  function removeKey(key) { try { safeStorage.removeItem(key); } catch (e) { /* blocked */ } }

  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
  }

  // A small seeded random generator, so artwork is the same on every visit.
  function seeded(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6d2b79f5) >>> 0;
      var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  /* ======================================================================
     3. Time (always in TIMEZONE)
     ====================================================================== */
  var partsFmt = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  function zoneParts(date) {
    var p = {};
    partsFmt.formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
    return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, s: +p.second };
  }
  // Milliseconds TIMEZONE is ahead of UTC at an instant (-5 h in winter, -4 h in summer).
  function offsetAt(ms) {
    var p = zoneParts(new Date(ms));
    return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000;
  }
  // ?now=2027-03-01 or ?now=2027-03-01T09:30 (Eastern time) previews the site on another date.
  var previewNow = (function () {
    var v = param('now');
    var m = v && /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(v);
    if (!m) return null;
    var guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +(m[4] || 12), +(m[5] || 0));
    var ms = guess - offsetAt(guess - offsetAt(guess));
    return isNaN(ms) ? null : ms;
  })();
  var loadedAt = Date.now();
  function now() { return previewNow === null ? new Date() : new Date(previewNow + (Date.now() - loadedAt)); }

  // Whole days since 1970-01-01 for an ISO date, for today in TIMEZONE, and back again.
  function dayNum(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5 : NaN; }
  function dayOf(y, m, d) { return Date.UTC(y, m - 1, d) / 864e5; }
  function todayNum() { var p = zoneParts(now()); return dayOf(p.y, p.m, p.d); }
  function isoFromDayNum(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  function weekday(n) { return new Date(n * 864e5).getUTCDay(); } // 0 = Sunday
  function yearOf(n) { return new Date(n * 864e5).getUTCFullYear(); }
  function fmtDay(n, opts) {
    return new Intl.DateTimeFormat(LOCALE, Object.assign({ timeZone: 'UTC' }, opts)).format(new Date(n * 864e5 + 12 * 36e5));
  }
  // 'Monday, December 7' (the year is added when it isn't this year).
  function longDay(n, withWeekday) {
    var opts = { day: 'numeric', month: 'long' };
    if (yearOf(n) !== zoneParts(now()).y) opts.year = 'numeric';
    return (withWeekday !== false ? fmtDay(n, { weekday: 'long' }) + ', ' : '') + fmtDay(n, opts);
  }
  function monthName(n, withYear) { return fmtDay(n, withYear ? { month: 'long', year: 'numeric' } : { month: 'long' }); }

  function nthWeekday(y, m, wd, nth) { var n = dayOf(y, m, 1); while (weekday(n) !== wd) n++; return n + (nth - 1) * 7; }
  function firstMonday(y, m) { return nthWeekday(y, m, 1, 1); }
  function lastMonday(y, m) { var n = dayOf(y, m + 1, 1) - 1; while (weekday(n) !== 1) n--; return n; }
  // A holiday on a Saturday is observed the Friday before, one on a Sunday the Monday after.
  function observed(n) { var w = weekday(n); return w === 6 ? n - 1 : w === 0 ? n + 1 : n; }
  // US federal holidays for any year, from the rules (not a list of dates). The function keeps
  // its original name so existing customizations still work.
  var holidayCache = {};
  function scottishBankHolidays(y) {
    if (has(holidayCache, String(y))) return holidayCache[y];
    var list = [
      observed(dayOf(y, 1, 1)), // New Year's Day
      nthWeekday(y, 1, 1, 3), // Martin Luther King Jr. Day
      nthWeekday(y, 2, 1, 3), // Washington's Birthday
      lastMonday(y, 5), // Memorial Day
      observed(dayOf(y, 6, 19)), // Juneteenth
      observed(dayOf(y, 7, 4)), // Independence Day
      firstMonday(y, 9), // Labor Day
      nthWeekday(y, 10, 1, 2), // Columbus Day
      observed(dayOf(y, 11, 11)), // Veterans Day
      nthWeekday(y, 11, 4, 4), // Thanksgiving
      observed(dayOf(y, 12, 25)) // Christmas
    ];
    // Next New Year's Day on a Saturday is observed on December 31 of this year.
    var nextNewYear = observed(dayOf(y + 1, 1, 1));
    if (yearOf(nextNewYear) === y) list.push(nextNewYear);
    holidayCache[y] = list;
    return list;
  }
  // The studio's winter closure (STUDIO.winterClosure, e.g. December 24 to January 4).
  function inWinterClosure(n) {
    var c = D.STUDIO.winterClosure, iso = isoFromDayNum(n).slice(5);
    return iso >= c[0] || iso <= c[1];
  }
  function isWorkingDay(n) {
    var w = weekday(n);
    return w !== 0 && w !== 6 && scottishBankHolidays(yearOf(n)).indexOf(n) === -1 && !inWinterClosure(n);
  }
  function addWorkingDays(n, count) {
    var d = n;
    while (count > 0) { d++; if (isWorkingDay(d)) count--; }
    return d;
  }
  // Short zone label: browsers differ ("EDT" or "GMT-4"), so Eastern time uses its own labels.
  function zoneName(date) { return offsetAt(date.getTime()) === -4 * 36e5 ? 'EDT' : 'EST'; }

  /* ======================================================================
     4. Data lookups
     ====================================================================== */
  var PROJECTS = D.PROJECTS;
  var PROJECT_BY_ID = Object.create(null);
  PROJECTS.forEach(function (p, i) { p.index = i; PROJECT_BY_ID[p.id] = p; });
  function project(id) { return typeof id === 'string' && PROJECT_BY_ID[id] ? PROJECT_BY_ID[id] : null; }
  function disciplineName(key) { return has(D.DISCIPLINES, key) ? D.DISCIPLINES[key].name : ''; }
  function runtimeLabel(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    if (!m) return s + ' s';
    return m + ' min' + (s ? ' ' + s + ' s' : '');
  }
  // 'Hand-drawn cel' -> 'hand-drawn cel' inside a sentence; '2D graphic' and '3D' stay as they are.
  function inSentence(name) { return /^[A-Z][a-z]/.test(name) ? name.charAt(0).toLowerCase() + name.slice(1) : name; }
  function runtimeCode(sec) { return pad(Math.floor(sec / 60)) + ':' + pad(sec % 60); }
  function countIn(discipline) { return PROJECTS.filter(function (p) { return p.discipline === discipline; }).length; }

  /* ======================================================================
     5. Keeping the demo current, and the booking calendar
     ====================================================================== */
  // Days to add to every journal date (whole weeks since DEMO_ANCHOR, never negative).
  function demoShift() {
    if (!KEEP_DEMO_CURRENT) return 0;
    var weeks = Math.floor((todayNum() - dayNum(DEMO_ANCHOR)) / 7);
    return weeks > 0 ? weeks * 7 : 0;
  }
  // Journal notes with their (rolled) day number, newest first.
  function journal() {
    var shift = demoShift();
    return D.JOURNAL.map(function (note) {
      return Object.assign({}, note, { day: dayNum(note.date) + shift });
    }).sort(function (a, b) { return b.day - a.day; });
  }
  function ago(n) {
    var diff = todayNum() - n;
    if (diff <= 0) return 'Today';
    if (diff === 1) return 'Yesterday';
    if (diff < 14) return plural(diff, 'day') + ' ago';
    if (diff < 63) return plural(Math.floor(diff / 7), 'week') + ' ago';
    return plural(Math.round(diff / 30.4), 'month') + ' ago';
  }

  // The first Monday at least STUDIO.leadWeeks away that is a business day.
  function earliestStart() {
    var n = todayNum() + D.STUDIO.leadWeeks * 7;
    while (weekday(n) !== 1 || !isWorkingDay(n)) n++;
    return n;
  }
  // The next six months: booked before the earliest start, limited in its month, open after.
  function bookingMonths(count) {
    var p = zoneParts(now()), start = earliestStart(), out = [];
    var startKey = isoFromDayNum(start).slice(0, 7);
    for (var i = 0; i < count; i++) {
      var y = p.y + Math.floor((p.m - 1 + i) / 12), m = ((p.m - 1 + i) % 12) + 1;
      var first = dayOf(y, m, 1), key = isoFromDayNum(first).slice(0, 7);
      var status = key < startKey ? 'booked' : key === startKey ? 'limited' : 'open';
      out.push({ day: first, status: status });
    }
    return out;
  }

  /* ======================================================================
     6. Artwork. Every frame is a 320 × 180 SVG drawn from a project's motif at a
        moment `t` (0 to 1) in its film, in the project's palette [bg, fg, a, b].
     ====================================================================== */
  var W = 320, H = 180, uid = 0;
  function f(n) { return Math.round(n * 10) / 10; }
  function wavePath(y, amp, freq, phase, x0, x1) {
    var d = '';
    for (var x = x0 || 0; x <= (x1 || W); x += 8) d += (d ? 'L' : 'M') + f(x) + ' ' + f(y + Math.sin(x * freq + phase) * amp);
    return d;
  }
  function rect(x, y, w, h, fill, extra) { return '<rect x="' + f(x) + '" y="' + f(y) + '" width="' + f(w) + '" height="' + f(h) + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function circle(cx, cy, r, fill, extra) { return '<circle cx="' + f(cx) + '" cy="' + f(cy) + '" r="' + f(Math.max(r, 0)) + '" fill="' + fill + '"' + (extra || '') + '/>'; }
  function poly(points, fill, extra) {
    return '<polygon points="' + points.map(function (pt) { return f(pt[0]) + ',' + f(pt[1]); }).join(' ') + '" fill="' + fill + '"' + (extra || '') + '/>';
  }
  function star(cx, cy, r, fill) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var a = Math.PI / 5 * i - Math.PI / 2, rr = i % 2 ? r * 0.45 : r;
      pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]);
    }
    return poly(pts, fill);
  }

  var ART = {
    // Bracken Hall: a held note swelling into a tide; the season mark crosses the sky.
    tides: function (t, c) {
      var s = rect(0, 0, W, H, c[0]);
      s += circle(40 + 240 * t, 52 - Math.sin(t * Math.PI) * 18, 13, c[2]);
      for (var i = 0; i < 7; i++) {
        var amp = (1.5 + i * 1.4) * (0.25 + t * 1.1);
        s += '<path d="' + wavePath(70 + i * 15, amp, 0.022 + i * 0.003, t * 6.3 + i * 0.8) + '" fill="none" stroke="' + (i % 2 ? c[3] : c[1]) + '" stroke-width="' + (i === 0 ? 2.2 : 1.4) + '" stroke-opacity="' + (0.95 - i * 0.09) + '"/>';
      }
      return s + rect(0, 168, W, 12, c[2], ' opacity=".9"');
    },
    // Morrowfield: a nine-blade iris opening on a flood of color.
    iris: function (t, c) {
      var id = 'iris' + (++uid), cx = 160, cy = 90, R = 74, r = 6 + 50 * t, rot = t * 120;
      var s = rect(0, 0, W, H, c[0]) + '<defs><clipPath id="' + id + '"><circle cx="160" cy="90" r="' + R + '"/></clipPath></defs>';
      s += circle(cx, cy, R, c[2]) + circle(cx, cy, r * 0.7, c[3]);
      s += '<g clip-path="url(#' + id + ')">';
      for (var i = 0; i < 9; i++) {
        var a = (i * 40 + rot) * Math.PI / 180, b = a + 1.15, inner = a + 0.7;
        s += poly([[cx + Math.cos(a) * 90, cy + Math.sin(a) * 90], [cx + Math.cos(b) * 90, cy + Math.sin(b) * 90], [cx + Math.cos(inner) * r, cy + Math.sin(inner) * r], [cx + Math.cos(a + 0.05) * r, cy + Math.sin(a + 0.05) * r]], i % 2 ? '#1d1d22' : '#28282f', ' stroke="' + c[1] + '" stroke-opacity=".25" stroke-width=".8"');
      }
      s += '</g>' + circle(cx, cy, R, 'none', ' stroke="' + c[1] + '" stroke-width="2"');
      for (var k = 0; k < 24; k++) {
        var ang = k * 15 * Math.PI / 180;
        s += '<line x1="' + f(cx + Math.cos(ang) * 80) + '" y1="' + f(cy + Math.sin(ang) * 80) + '" x2="' + f(cx + Math.cos(ang) * (k % 2 ? 84 : 88)) + '" y2="' + f(cy + Math.sin(ang) * (k % 2 ? 84 : 88)) + '" stroke="' + c[1] + '" stroke-opacity=".6"/>';
      }
      return s;
    },
    // The Lowlight Hours: an apartment house whose windows light one by one through the night.
    windows: function (t, c) {
      var rnd = seeded(7), s = rect(0, 0, W, H, c[0]);
      s += circle(268, 34, 13, c[1]) + circle(274, 30, 12, c[0]);
      for (var k = 0; k < 18; k++) s += circle(rnd() * W, rnd() * 40, 0.8, c[1], ' opacity=".6"');
      s += rect(44, 44, 232, 136, c[3], ' opacity=".28"') + rect(70, 32, 10, 14, c[3], ' opacity=".28"') + rect(232, 30, 10, 16, c[3], ' opacity=".28"');
      for (var r = 0; r < 4; r++) {
        for (var col = 0; col < 6; col++) {
          var x = 60 + col * 36, y = 58 + r * 28, on = rnd() < t * 1.08;
          if (on) s += rect(x - 3, y - 3, 26, 22, c[2], ' opacity=".18"');
          s += rect(x, y, 20, 16, on ? c[2] : c[1], on ? '' : ' opacity=".07"') + rect(x + 9.5, y, 1, 16, c[0], ' opacity=".5"');
        }
      }
      return s + rect(132, 150, 22, 30, c[0]) + rect(0, 176, W, 4, c[1], ' opacity=".2"');
    },
    // Paper Lanterns: lanterns rise over a sleeping town.
    lanterns: function (t, c) {
      var rnd = seeded(11), s = rect(0, 0, W, H, c[0]) + circle(160, 200, 150, c[2], ' opacity=".12"');
      for (var k = 0; k < 30; k++) s += circle(rnd() * W, rnd() * 90, rnd() * 0.9 + 0.3, c[1], ' opacity="' + f(0.3 + t * 0.6) + '"');
      for (var i = 0; i < 10; i++) {
        var x0 = 20 + rnd() * 280, speed = 0.6 + rnd() * 0.8, off = rnd() * 150;
        var y = 160 - ((t * 140 * speed + off) % 160), x = x0 + Math.sin(t * 7 + i) * 6, sc = 0.7 + (y / 160) * 0.6;
        s += circle(x, y, 11 * sc, c[2], ' opacity=".22"') + rect(x - 4 * sc, y - 6 * sc, 8 * sc, 11 * sc, c[2], ' rx="' + f(3 * sc) + '" stroke="' + c[1] + '" stroke-width=".6"');
      }
      var roofs = [[0, 180], [0, 150], [30, 150], [44, 138], [58, 150], [96, 150], [96, 140], [122, 140], [136, 128], [150, 140], [196, 140], [196, 150], [238, 150], [252, 134], [266, 150], [320, 150], [320, 180]];
      s += poly(roofs, '#000', ' opacity=".45"');
      return s + rect(110, 156, 6, 6, c[2]) + rect(214, 158, 6, 6, c[2], ' opacity="' + f(t) + '"');
    },
    // How the Heat Gets Home: a drop of warm water travels from the river to the apartments.
    pipes: function (t, c) {
      var pts = [[30, 146], [96, 146], [96, 118], [150, 118], [150, 146], [212, 146], [212, 108], [276, 108]];
      var s = rect(0, 0, W, H, c[0]) + rect(0, 154, W, 26, c[1], ' opacity=".08"');
      s += '<path d="M0 60 C14 90 22 120 10 180 L0 180Z" fill="' + c[3] + '" opacity=".45"/>';
      [[96, 118], [150, 118], [276, 108]].forEach(function (h) {
        s += rect(h[0] - 18, h[1] - 34, 36, 34, c[0], ' stroke="' + c[1] + '" stroke-width="2"') + poly([[h[0] - 22, h[1] - 34], [h[0], h[1] - 54], [h[0] + 22, h[1] - 34]], c[1]) + rect(h[0] - 6, h[1] - 24, 12, 10, c[3], ' opacity=".5"');
      });
      s += '<polyline points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '" fill="none" stroke="' + c[1] + '" stroke-width="5" stroke-linejoin="round"/>';
      s += '<polyline points="' + pts.map(function (p) { return p.join(','); }).join(' ') + '" fill="none" stroke="' + c[2] + '" stroke-width="1.5" stroke-dasharray="4 5" stroke-dashoffset="' + f(-t * 60) + '"/>';
      var total = 0, segs = [];
      for (var i = 1; i < pts.length; i++) { var len = Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]); segs.push(len); total += len; }
      var dist = t * total, at = pts[0];
      for (var j = 0; j < segs.length; j++) {
        if (dist <= segs[j]) { var k = dist / segs[j]; at = [pts[j][0] + (pts[j + 1][0] - pts[j][0]) * k, pts[j][1] + (pts[j + 1][1] - pts[j][1]) * k]; break; }
        dist -= segs[j]; at = pts[j + 1];
      }
      [96, 150, 276].forEach(function (hx, n) {
        if (t > 0.25 + n * 0.3) s += '<path d="M' + (hx - 6) + ' 62 q3 -6 0 -12 M' + hx + ' 60 q3 -6 0 -12 M' + (hx + 6) + ' 62 q3 -6 0 -12" fill="none" stroke="' + c[2] + '" stroke-width="1.6" transform="translate(0 ' + (n === 2 ? -10 : 0) + ')"/>';
      });
      return s + circle(at[0], at[1], 10, c[2], ' opacity=".25"') + circle(at[0], at[1], 5, c[2]);
    },
    // Borrow Anything: one spine slides out of the shelf, and the shelf fills with things.
    books: function (t, c) {
      var rnd = seeded(5), s = rect(0, 0, W, H, c[0]), x = 26, cols = [c[1], c[2], c[3], c[1]];
      s += rect(0, 146, W, 7, c[1]) + rect(0, 74, W, 5, c[1], ' opacity=".8"');
      for (var i = 0; i < 17; i++) {
        var w = 10 + Math.floor(rnd() * 8), h = 46 + Math.floor(rnd() * 22), fill = cols[i % 4];
        if (i === 7) {
          var lift = t * 34, ang = -t * 14;
          s += '<g transform="translate(' + x + ' ' + f(146 - lift) + ') rotate(' + f(ang) + ')">' + rect(0, -h, w + 4, h, c[2]) + circle((w + 4) / 2, -h * 0.4, 4, c[0]) + rect((w + 4) / 2 - 1, -h + 6, 2, h * 0.5, c[0]) + '</g>';
        } else {
          s += rect(x, 146 - h, w, h, fill, i % 4 === 3 ? ' opacity=".55"' : '') + rect(x + 2, 146 - h + 8, w - 4, 2, c[0], ' opacity=".6"');
        }
        x += w + 2;
      }
      var grow = clamp((t - 0.5) * 3, 0, 1);
      if (grow > 0) {
        s += '<g opacity="' + f(grow) + '">';
        s += poly([[40, 74], [62, 74 - 30 * grow], [84, 74]], c[3]) + rect(58, 74 - 12 * grow, 8, 12 * grow, c[0]);
        s += rect(120, 74 - 22 * grow, 30, 16 * grow, c[2], ' rx="3"') + rect(150, 74 - 18 * grow, 14, 6, c[1]);
        s += circle(212, 74 - 14 * grow, 12 * grow, c[1]) + rect(222, 74 - 40 * grow, 4, 28 * grow, c[1]);
        s += rect(262, 74 - 26 * grow, 18, 26 * grow, c[3], ' rx="2"');
        s += '</g>';
      }
      return s;
    },
    // Weather-Made: sideways rain off the sea, and the brand mark turning into the wind.
    rain: function (t, c) {
      var rnd = seeded(3), s = rect(0, 0, W, H, c[0]);
      s += '<path d="M0 132 L60 118 L104 126 L160 108 L214 122 L262 112 L320 120 L320 180 L0 180Z" fill="' + c[3] + '" opacity=".35"/>';
      s += rect(0, 146, W, 34, c[3], ' opacity=".25"');
      for (var i = 0; i < 46; i++) {
        var x = ((rnd() * 360 + t * 260) % 360) - 20, y = ((rnd() * 200 + t * 520) % 200) - 20;
        s += '<line x1="' + f(x) + '" y1="' + f(y) + '" x2="' + f(x + 9) + '" y2="' + f(y + 22) + '" stroke="' + c[1] + '" stroke-opacity=".45" stroke-width="1.2"/>';
      }
      var rot = -20 + t * 70;
      s += '<g transform="translate(228 72) rotate(' + f(rot) + ')">' + circle(0, 0, 26, 'none', ' stroke="' + c[2] + '" stroke-width="4"') + rect(-26, -2, 52, 4, c[2]) + poly([[0, -26], [9, -8], [-9, -8]], c[2]) + '</g>';
      return s;
    },
    // Ninefold: a three-by-three grid of savings jars filling up and trading places.
    grid: function (t, c) {
      var s = rect(0, 0, W, H, c[0]), size = 36, gap = 9, x0 = 160 - (size * 1.5 + gap), y0 = 90 - (size * 1.5 + gap);
      var swap = clamp((t - 0.55) * 3, 0, 1);
      for (var i = 0; i < 9; i++) {
        var col = i % 3, row = Math.floor(i / 3);
        var x = x0 + col * (size + gap), y = y0 + row * (size + gap);
        if (i === 2 || i === 6) {
          var tx = x0 + (i === 2 ? 0 : 2) * (size + gap), ty = y0 + (i === 2 ? 2 : 0) * (size + gap);
          x += (tx - x) * swap; y += (ty - y) * swap;
        }
        var fill = clamp(t * 1.5 - i * 0.07, 0.06, 1) * ((i * 37) % 9 + 3) / 11;
        s += rect(x, y, size, size, c[0], ' stroke="' + c[1] + '" stroke-width="2"');
        s += rect(x + 3, y + size - 3 - (size - 6) * fill, size - 6, (size - 6) * fill, i === 4 ? c[2] : c[3], i === 4 ? '' : ' opacity=".75"');
      }
      var drop = clamp((t - 0.25) * 4, 0, 1);
      if (drop > 0 && drop < 1) s += circle(160, 6 + drop * 70, 5, c[2]);
      return s + rect(18, 18, 8, 8, c[2]) + rect(294, 154, 8, 8, c[3]);
    },
    // Cold Open: tracking lines and lyric bars that jump on every snare hit.
    glitch: function (t, c) {
      var rnd = seeded(13), s = rect(0, 0, W, H, c[0]), amount = 0.25 + 0.75 * Math.abs(Math.sin(t * 9));
      for (var i = 0; i < 13; i++) {
        var w = 80 + rnd() * 190, y = 12 + i * 12.5, x = (W - w) / 2 + Math.sin(i * 1.9 + t * 14) * 34 * amount;
        s += rect(x - 4, y, w, 7, c[2], ' opacity=".85"') + rect(x + 4, y, w, 7, c[3], ' opacity=".7"') + rect(x, y, w, 7, c[1]);
      }
      for (var k = 0; k < 45; k++) s += rect(0, k * 4, W, 1, c[1], ' opacity=".05"');
      return s + rect(0, (t * 420) % 180, W, 7, c[1], ' opacity=".18"') + circle(296, 18, 5, c[2]);
    },
    // Seastack: one day passing behind a lighthouse rock.
    seastack: function (t, c) {
      var s = rect(0, 0, W, H, c[0]);
      s += rect(0, 0, W, H, c[2], ' opacity="' + f(0.28 * (1 - Math.sin(t * Math.PI))) + '"');
      s += circle(50 + 220 * t, 122 - Math.sin(t * Math.PI) * 86, 14, c[2]);
      var sea = 120 + Math.sin(t * Math.PI * 2) * 3;
      s += rect(0, sea, W, H - sea, c[3], ' opacity=".55"');
      for (var i = 0; i < 4; i++) s += '<path d="' + wavePath(sea + 10 + i * 13, 1.6, 0.06, t * 12 + i, 0, W) + '" fill="none" stroke="' + c[1] + '" stroke-opacity=".35"/>';
      s += poly([[176, sea + 4], [182, 74], [190, 64], [198, 60], [206, 68], [210, 92], [218, sea + 4]], '#0a121e', ' opacity=".82"');
      s += rect(194, 46, 8, 15, c[1]) + rect(193, 43, 10, 4, c[1]) + circle(198, 50, t > 0.85 ? 4 : 2, t > 0.85 ? c[2] : c[0]);
      if (t > 0.85) s += poly([[198, 50], [320, 34], [320, 62]], c[2], ' opacity=".2"');
      for (var b = 0; b < 5; b++) {
        var bx = ((b * 64 + t * 180) % 340) - 10, by = 40 + (b % 3) * 14;
        s += '<path d="M' + f(bx) + ' ' + by + ' l5 3 l5 -3" fill="none" stroke="' + c[1] + '" stroke-width="1.2"/>';
      }
      return s;
    },
    // Threads of Millhaven: warp strung on the loom, weft crossing line by line.
    loom: function (t, c) {
      var rnd = seeded(17), s = rect(0, 0, W, H, c[0]), weftY = 22 + 136 * t;
      for (var i = 0; i < 28; i++) s += rect(30 + i * 9.5, 18, 1.4, 144, c[1], ' opacity=".45"');
      for (var y = 22; y < weftY; y += 7) {
        var row = Math.round((y - 22) / 7);
        for (var j = 0; j < 28; j++) {
          if ((j + row) % 2) continue;
          s += rect(27 + j * 9.5, y, 8, 5, rnd() < 0.18 ? c[3] : c[2], rnd() < 0.5 ? ' opacity=".85"' : '');
        }
      }
      var shuttle = 30 + 250 * ((t * 7) % 1);
      s += rect(26, weftY, 270, 2, c[3]) + rect(shuttle - 12, weftY - 4, 24, 10, c[1], ' rx="5"');
      return s + rect(18, 12, 284, 6, c[1]) + rect(18, 162, 284, 6, c[1]);
    },
    // Tactile Futures: a raised-dot grid that rises under a passing fingertip.
    dots: function (t, c) {
      var s = rect(0, 0, W, H, c[0]), px = 40 + 240 * t, py = 90 + Math.sin(t * Math.PI * 2) * 34;
      for (var r = 0; r < 11; r++) {
        for (var col = 0; col < 21; col++) {
          var x = 20 + col * 14, y = 20 + r * 14, d2 = (x - px) * (x - px) + (y - py) * (y - py);
          var rad = 1.6 + 4.4 * Math.exp(-d2 / 900);
          s += circle(x, y, rad, rad > 3.4 ? c[2] : c[1], rad > 3.4 ? '' : ' opacity=".5"');
        }
      }
      return s + circle(px, py, 18, 'none', ' stroke="' + c[3] + '" stroke-width="2" opacity=".85"');
    },
    // Talcott Lights: aurora ribbons, one per stem of the mix, over the hills.
    aurora: function (t, c) {
      var rnd = seeded(23), s = rect(0, 0, W, H, c[0]);
      for (var k = 0; k < 44; k++) s += circle(rnd() * W, rnd() * 110, rnd() * 0.9 + 0.3, c[1], ' opacity=".7"');
      for (var r = 0; r < 3; r++) {
        var strength = clamp((t - r * 0.22) * 2.4, 0, 1);
        if (!strength) continue;
        var top = [], bottom = [];
        for (var x = -10; x <= W + 10; x += 10) {
          var y = 36 + r * 16 + Math.sin(x * 0.02 + t * 5 + r * 1.7) * 12;
          top.push([x, y]);
          bottom.unshift([x, y + 20 + Math.sin(x * 0.035 + r) * 9]);
        }
        s += poly(top.concat(bottom), r === 1 ? c[3] : c[2], ' opacity="' + f(0.38 * strength) + '"');
      }
      s += '<path d="M0 140 Q50 112 96 128 T190 118 T320 132 V180 H0Z" fill="#000" opacity=".4"/>';
      return s + '<path d="M0 156 Q70 136 140 150 T320 146 V180 H0Z" fill="#000" opacity=".55"/>' + rect(214, 146, 7, 5, c[2]);
    },
    // A Book in Every Bag: a book goes into a school bag and stories fly out.
    satchel: function (t, c) {
      var rnd = seeded(29), s = rect(0, 0, W, H, c[0]);
      var open = clamp((t - 0.35) * 2, 0, 1);
      if (open > 0) s += circle(160, 104, 40 + 30 * open, c[2], ' opacity="' + f(0.18 * open) + '"');
      for (var i = 0; i < 9; i++) {
        var ang = -Math.PI * (0.15 + rnd() * 0.7), dist = open * (60 + rnd() * 70);
        var x = 160 + Math.cos(ang) * dist, y = 100 + Math.sin(ang) * dist * 0.8;
        if (open > 0) s += i % 3 === 0 ? star(x, y, 7 * open, c[2]) : i % 3 === 1 ? circle(x, y, 6 * open, c[3]) + circle(x - 2, y - 1, 1.2, c[0]) + circle(x + 2, y - 1, 1.2, c[0]) : rect(x - 6, y - 4, 12 * open, 8 * open, c[1], ' rx="1.5"');
      }
      var drop = clamp(t / 0.35, 0, 1);
      if (t < 0.42) s += rect(146, 30 + drop * 62, 28, 36, c[1], ' rx="2"') + rect(150, 34 + drop * 62, 3, 28, c[0], ' opacity=".6"');
      s += '<path d="M128 100 q32 -46 64 0" fill="none" stroke="' + c[1] + '" stroke-width="5"/>';
      s += rect(112, 98, 96, 64, c[3], ' rx="8"') + '<path d="M112 106 q48 30 96 0 v-8 h-96z" fill="' + c[2] + '"/>' + rect(154, 112, 12, 10, c[1], ' rx="2"');
      return s + rect(0, 162, W, 18, c[1], ' opacity=".08"');
    },
    // Hollowtide: low-poly peaks, a lighthouse town and the tide coming in.
    tower: function (t, c) {
      var s = rect(0, 0, W, H, c[0]);
      s += poly([[0, 120], [60, 58], [110, 104], [160, 40], [214, 96], [264, 54], [320, 110], [320, 180], [0, 180]], c[1], ' opacity=".1"');
      s += poly([[0, 130], [70, 84], [120, 124], [180, 76], [240, 120], [320, 92], [320, 180], [0, 180]], c[1], ' opacity=".14"');
      for (var i = 0; i < 9; i++) {
        var hx = 30 + i * 21, hh = 12 + (i * 7) % 10;
        s += rect(hx, 140 - hh, 16, hh, c[1], ' opacity=".5"') + poly([[hx - 2, 140 - hh], [hx + 8, 132 - hh], [hx + 18, 140 - hh]], c[1], ' opacity=".5"');
      }
      s += rect(226, 62, 14, 80, c[1]) + rect(222, 56, 22, 6, c[1]) + circle(233, 50, 5, c[2]);
      s += poly([[233, 50], [320, 30], [320, 70]], c[2], ' opacity="' + f(0.1 + 0.25 * t) + '"');
      var level = 156 - t * 74, pts = [];
      for (var x = 0; x <= W; x += 16) pts.push([x, level + Math.sin(x * 0.05 + t * 9) * 2.5]);
      return s + poly(pts.concat([[W, H], [0, H]]), c[3], ' opacity=".6"');
    }
  };

  // The SVG for a project at moment t. opts.label gives it role="img"; otherwise it is decorative.
  function frameSVG(p, t, opts) {
    opts = opts || {};
    var draw = has(ART, p.motif) ? ART[p.motif] : ART.tides;
    var a11y = opts.label ? ' role="img" aria-label="' + esc(opts.label) + '"' : ' aria-hidden="true" focusable="false"';
    return '<svg viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice"' + a11y + '>' + draw(clamp(t, 0, 1), p.palette) + '</svg>';
  }
  // Fills every [data-art="<project id>"], at data-art-t (default 0.5).
  function paintArt(ctx) {
    $$('[data-art]', ctx).forEach(function (el) {
      var p = project(el.getAttribute('data-art'));
      if (!p) return;
      var t = parseFloat(el.getAttribute('data-art-t'));
      el.innerHTML = frameSVG(p, isNaN(t) ? 0.5 : t, { label: el.getAttribute('data-art-label') || '' });
    });
  }
  /* Hovering or focusing a card plays a few seconds of its film (only when motion is allowed). */
  function hoverPreview(trigger, frame, p) {
    if (reduceMotion || !trigger || !frame) return;
    var raf = 0, start = 0, base = parseFloat(frame.getAttribute('data-art-t')) || 0.5;
    function tick(ts) {
      if (!start) start = ts;
      var t = (base + (ts - start) / 4000) % 1;
      frame.innerHTML = frameSVG(p, t);
      raf = requestAnimationFrame(tick);
    }
    function play() { if (!raf) { start = 0; raf = requestAnimationFrame(tick); } }
    function stop() { cancelAnimationFrame(raf); raf = 0; frame.innerHTML = frameSVG(p, base); }
    trigger.addEventListener('mouseenter', play);
    trigger.addEventListener('mouseleave', stop);
    trigger.addEventListener('focus', play);
    trigger.addEventListener('blur', stop);
  }

  // Collaborator portrait marks (about page): an abstract mark in each person's color.
  function personMark(person) {
    var c = person.colour, s = '<rect width="96" height="96" fill="#24152f"/>', i;
    if (person.shape === 'wave') for (i = 0; i < 5; i++) s += '<path d="' + wavePath(28 + i * 10, 5, 0.12, i, 8, 88) + '" fill="none" stroke="' + c + '" stroke-width="2.5" opacity="' + f(1 - i * 0.15) + '"/>';
    if (person.shape === 'cube') s += '<path d="M48 18 76 34v30L48 80 20 64V34Z" fill="none" stroke="' + c + '" stroke-width="3"/><path d="M20 34 48 50 76 34M48 50v30" fill="none" stroke="' + c + '" stroke-width="3"/>';
    if (person.shape === 'line') s += '<path d="M14 70c14-40 26-46 34-24s20 18 34-26" fill="none" stroke="' + c + '" stroke-width="4" stroke-linecap="round"/>' + circle(82, 20, 5, c);
    if (person.shape === 'bars') for (i = 0; i < 6; i++) s += rect(14 + i * 12, 70 - ((i * 23) % 44) - 10, 8, ((i * 23) % 44) + 10, c, i % 2 ? ' opacity=".6"' : '');
    if (person.shape === 'grid') for (i = 0; i < 16; i++) s += rect(16 + (i % 4) * 17, 16 + Math.floor(i / 4) * 17, 12, 12, c, (i * 5) % 3 ? ' opacity=".35"' : '');
    var initials = person.name.split(' ').map(function (w) { return w.charAt(0); }).join('');
    s += '<text x="88" y="90" text-anchor="end" font-family="Red Hat Mono, monospace" font-size="10" font-weight="600" fill="#efecf4">' + esc(initials) + '</text>';
    return '<svg viewBox="0 0 96 96" aria-hidden="true" focusable="false">' + s + '</svg>';
  }

  /* ======================================================================
     7. Shared UI
     ====================================================================== */
  function initHeader() {
    var btn = $('#menu-button'), menu = $('#mobile-menu');
    if (!btn || !menu) return;
    function setOpen(open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
      $('[data-icon-open]', btn).classList.toggle('hidden', open);
      $('[data-icon-close]', btn).classList.toggle('hidden', !open);
      document.documentElement.classList.toggle('overflow-hidden', open);
    }
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024 && btn.getAttribute('aria-expanded') === 'true') setOpen(false); });
  }

  // The studio clock in the header and on the contact page: "2:32 PM EST", plus open or closed.
  function initClock() {
    var els = $$('[data-local-clock]'), states = $$('[data-open-state]');
    if (!els.length && !states.length) return;
    function paint() {
      var d = now(), p = zoneParts(d);
      var label = (p.h % 12 || 12) + ':' + pad(p.mi) + (p.h < 12 ? ' AM ' : ' PM ') + zoneName(d);
      els.forEach(function (el) { el.textContent = label; });
      var n = dayOf(p.y, p.m, p.d), hours = D.STUDIO.hours[weekday(n)], hm = pad(p.h) + ':' + pad(p.mi);
      var open = isWorkingDay(n) && hours && hm >= hours[0] && hm < hours[1];
      states.forEach(function (el) { el.textContent = open ? 'In the studio now' : 'Out of the studio'; });
    }
    paint();
    setInterval(paint, 15000);
  }

  // Availability: [data-next-start], [data-booking-month] and the [data-availability] month strip.
  function initAvailability() {
    var start = earliestStart();
    $$('[data-next-start]').forEach(function (el) { el.textContent = longDay(start); });
    $$('[data-booking-month]').forEach(function (el) { el.textContent = monthName(start, yearOf(start) !== zoneParts(now()).y); });
    var LABELS = { booked: 'Booked', limited: 'One slot left', open: 'Open' };
    var STYLE = { booked: 'border-dashed border-current/40', limited: 'border-coral', open: 'border-mint' };
    $$('[data-availability]').forEach(function (list) {
      list.innerHTML = bookingMonths(6).map(function (m) {
        return '<li class="flex min-h-24 flex-col justify-between border-t-4 pt-3 ' + STYLE[m.status] + '">' +
          '<span class="font-display text-2xl leading-none font-bold font-stretch-80%">' + esc(fmtDay(m.day, { month: 'short' })) + ' <span class="slate">' + yearOf(m.day) + '</span></span>' +
          '<span class="slate mt-3">' + LABELS[m.status] + '</span></li>';
      }).join('');
    });
  }

  function initReveal() {
    var els = $$('.reveal');
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Reveal this element and everything above it, so fast jumps never leave gaps.
        var top = entry.target.getBoundingClientRect().top;
        els.forEach(function (el) {
          if (!el.classList.contains('is-visible') && el.getBoundingClientRect().top <= top + 1) { el.classList.add('is-visible'); io.unobserve(el); }
        });
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  function initYear() {
    var y = String(zoneParts(now()).y);
    $$('[data-year]').forEach(function (el) { el.textContent = y; });
  }

  /* ======================================================================
     8. The shortlist: project ids saved with the Save buttons ([data-save="<id>"]).
     ====================================================================== */
  var shortlist = (function () {
    var raw = readJSON(STORAGE_KEYS.shortlist), seen = Object.create(null);
    return (Array.isArray(raw) ? raw : []).filter(function (id) {
      if (!project(id) || seen[id]) return false;
      seen[id] = true;
      return true;
    });
  })();
  var shortlistListeners = [];
  function isSaved(id) { return shortlist.indexOf(id) !== -1; }
  function setSaved(id, on) {
    if (!project(id)) return;
    var i = shortlist.indexOf(id);
    if (on && i === -1) shortlist.push(id);
    if (!on && i !== -1) shortlist.splice(i, 1);
    writeJSON(STORAGE_KEYS.shortlist, shortlist);
    paintShortlist();
  }
  function paintShortlist() {
    $$('[data-save]').forEach(function (btn) {
      var id = btn.getAttribute('data-save'), p = project(id);
      if (!p) return;
      var on = isSaved(id);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + p.title + (on ? ' from' : ' to') + ' your shortlist');
      var label = $('[data-save-label]', btn);
      if (label) label.textContent = on ? 'Saved' : 'Save';
    });
    $$('[data-shortlist-count]').forEach(function (el) { el.textContent = String(shortlist.length); });
    shortlistListeners.forEach(function (fn) { fn(); });
  }
  function initShortlist() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-save]') : null;
      if (!btn) return;
      var id = btn.getAttribute('data-save'), p = project(id);
      if (!p) return;
      var on = !isSaved(id);
      setSaved(id, on);
      toast(on ? p.title + ' added to your shortlist' : p.title + ' removed from your shortlist');
    });
    paintShortlist();
  }
  function saveButton(p, extra) {
    return '<button type="button" class="btn btn-line btn-sm ' + (extra || '') + '" data-save="' + esc(p.id) + '" aria-pressed="false" aria-label="Save ' + esc(p.title) + ' to your shortlist">' +
      '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4Z"/></svg><span data-save-label>Save</span></button>';
  }

  /* ======================================================================
     9. Home: the showreel, disciplines and the latest notes
     ====================================================================== */
  /* The showreel plays REEL.scenes, REEL.sceneSeconds each, drawn at REEL.fps. It starts by itself
     only when motion is allowed and it is on screen; with reduced motion it waits for Play, then
     shows each scene as a still and cuts between them. It pauses off screen and in a hidden tab. */
  function initReel() {
    var root = $('[data-reel]');
    if (!root) return;
    var scenes = D.REEL.scenes.map(project).filter(Boolean);
    if (!scenes.length) return;
    var screen = $('[data-reel-screen]', root), playBtn = $('[data-reel-play]', root);
    var sceneMs = D.REEL.sceneSeconds * 1000, frameMs = 1000 / D.REEL.fps;
    var state = { scene: 0, t: 0, playing: false, visible: true, userPaused: false };
    var raf = 0, last = 0, lastDraw = 0;

    var list = $('[data-reel-list]', root);
    if (list) {
      list.innerHTML = scenes.map(function (p, i) {
        return '<li><button type="button" class="group flex w-full items-baseline gap-4 border-t border-plum-line py-3 text-left transition hover:text-mint" data-reel-scene="' + i + '">' +
          '<span class="slate w-14 shrink-0 text-haze">' + runtimeCode(i * D.REEL.sceneSeconds) + '</span>' +
          '<span class="min-w-0 flex-1"><span class="block font-display text-xl leading-tight font-bold font-stretch-85%">' + esc(p.title) + '</span>' +
          '<span class="slate mt-1 block text-haze">' + esc(p.client) + ' · ' + esc(D.DISCIPLINES[p.discipline].short) + '</span></span></button></li>';
      }).join('');
    }
    var bars = $('[data-reel-progress]', root);
    if (bars) bars.innerHTML = scenes.map(function () { return '<span class="relative h-1 flex-1 overflow-hidden bg-card/20"><span class="absolute inset-y-0 left-0 w-0 bg-mint" data-bar></span></span>'; }).join('');

    function draw() {
      var p = scenes[state.scene];
      screen.innerHTML = frameSVG(p, reduceMotion ? 0.62 : state.t);
      var frames = Math.floor((state.scene * sceneMs + state.t * sceneMs) / frameMs), fps = D.REEL.fps;
      var sec = Math.floor(frames / fps);
      $('[data-reel-tc]', root).textContent = '00:' + pad(Math.floor(sec / 60)) + ':' + pad(sec % 60) + ':' + pad(frames % fps);
      $$('[data-bar]', root).forEach(function (bar, i) { bar.style.width = (i < state.scene ? 100 : i === state.scene ? state.t * 100 : 0) + '%'; });
    }
    function paintScene(announce) {
      var p = scenes[state.scene];
      $('[data-reel-title]', root).textContent = p.title;
      $('[data-reel-client]', root).textContent = p.client + ' · ' + disciplineName(p.discipline);
      $('[data-reel-count]', root).textContent = 'SC ' + pad(state.scene + 1) + '/' + pad(scenes.length);
      $('[data-reel-link]', root).setAttribute('href', 'project.html?project=' + encodeURIComponent(p.id));
      $('[data-reel-link]', root).textContent = 'See the ' + p.title + ' case study';
      $$('[data-reel-scene]', root).forEach(function (b, i) {
        if (i === state.scene) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
        b.classList.toggle('text-mint', i === state.scene);
      });
      if (announce) $('[data-reel-status]', root).textContent = 'Scene ' + (state.scene + 1) + ' of ' + scenes.length + ': ' + p.title + ', ' + p.client;
      draw();
    }
    function tick(ts) {
      raf = 0;
      if (!state.playing || !state.visible || document.hidden) { last = 0; return; }
      if (last) {
        state.t += (ts - last) / sceneMs;
        if (state.t >= 1) { state.t = 0; state.scene = (state.scene + 1) % scenes.length; paintScene(false); }
      }
      last = ts;
      if (ts - lastDraw >= frameMs || state.t === 0) { lastDraw = ts; draw(); }
      raf = requestAnimationFrame(tick);
    }
    function run() { if (!raf && state.playing && state.visible && !document.hidden) { last = 0; raf = requestAnimationFrame(tick); } }
    function setPlaying(on) {
      state.playing = on;
      playBtn.setAttribute('aria-label', on ? 'Pause the showreel' : 'Play the showreel');
      $('[data-reel-play-label]', playBtn).textContent = on ? 'Pause' : 'Play';
      $('[data-icon-play]', playBtn).classList.toggle('hidden', on);
      $('[data-icon-pause]', playBtn).classList.toggle('hidden', !on);
      $('[data-reel-rec]', root).classList.toggle('opacity-30', !on);
      if (on) run();
    }
    function goTo(i, announce) {
      state.scene = (i + scenes.length) % scenes.length;
      state.t = 0;
      paintScene(announce);
    }
    playBtn.addEventListener('click', function () { state.userPaused = state.playing; setPlaying(!state.playing); });
    $('[data-reel-prev]', root).addEventListener('click', function () { goTo(state.scene - 1, true); });
    $('[data-reel-next]', root).addEventListener('click', function () { goTo(state.scene + 1, true); });
    root.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-reel-scene]') : null;
      if (b) goTo(+b.getAttribute('data-reel-scene'), true);
    });
    root.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight' && e.target.closest('[data-reel-controls]')) goTo(state.scene + 1, true);
      if (e.key === 'ArrowLeft' && e.target.closest('[data-reel-controls]')) goTo(state.scene - 1, true);
    });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        state.visible = entries[0].isIntersecting;
        run();
      }).observe(screen);
    }
    document.addEventListener('visibilitychange', run);
    paintScene(false);
    setPlaying(!reduceMotion);
  }

  function initDisciplineCounts() {
    $$('[data-discipline-count]').forEach(function (el) {
      var key = el.getAttribute('data-discipline-count');
      if (has(D.DISCIPLINES, key)) el.textContent = plural(countIn(key), 'project');
    });
    $$('[data-project-total]').forEach(function (el) { el.textContent = String(PROJECTS.length); });
  }

  function noteHref(note) { return 'journal.html#' + note.id; }
  function initLatestNotes() {
    var box = $('[data-latest-notes]');
    if (!box) return;
    box.innerHTML = journal().slice(0, 3).map(function (n) {
      return '<li class="reveal is-visible"><a class="group block h-full border-t-2 border-ink pt-5" href="' + noteHref(n) + '">' +
        '<p class="slate flex flex-wrap gap-x-3 text-muted"><time datetime="' + isoFromDayNum(n.day) + '">' + esc(longDay(n.day, false)) + '</time><span>' + esc(D.TOPICS[n.topic]) + '</span><span>' + n.minutes + ' min</span></p>' +
        '<h3 class="h-card stretch-hover mt-3 group-hover:text-violet">' + esc(n.title) + '</h3>' +
        '<p class="mt-3 text-lg leading-relaxed text-muted">' + esc(n.excerpt) + '</p></a></li>';
    }).join('');
  }

  /* ======================================================================
     10. Work: discipline chips, year, search, shortlist-only and live counts.
         URL: work.html?discipline=titles&year=2024&q=festival&shortlist=1
     ====================================================================== */
  function workCard(p) {
    var n = pad(p.index + 1);
    return '<li class="reveal flex flex-col" data-card="' + esc(p.id) + '">' +
      '<a class="group block" href="project.html?project=' + encodeURIComponent(p.id) + '" data-card-link>' +
      '<span class="frame border-2 border-ink"><span class="frame-lift absolute inset-0" data-card-art data-art-t="0.5">' + frameSVG(p, 0.5) + '</span>' +
      '<span class="slate absolute top-2 left-2 bg-ink/80 px-2 py-1 text-card">' + n + '</span>' +
      '<span class="slate absolute right-2 bottom-2 bg-ink/80 px-2 py-1 text-mint">' + runtimeCode(p.runtime) + '</span></span>' +
      '<span class="mt-4 block font-display text-[1.7rem] leading-[1.02] font-extrabold uppercase stretch-hover group-hover:text-violet font-stretch-72%">' + esc(p.title) + '</span>' +
      '<span class="mt-2 block text-lg text-muted">' + esc(p.summary) + '</span></a>' +
      '<div class="mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-line pt-3 mt-4">' +
      '<p class="slate text-muted">' + esc(p.client) + ' · ' + esc(D.DISCIPLINES[p.discipline].short) + ' · ' + p.year + '</p>' + saveButton(p) + '</div></li>';
  }

  function initWork() {
    var grid = $('[data-work-grid]');
    if (!grid) return;
    var search = $('#work-search'), year = $('#work-year'), chips = $('[data-discipline-chips]'), onlyBtn = $('[data-shortlist-only]');
    var years = PROJECTS.map(function (p) { return p.year; }).filter(function (y, i, a) { return a.indexOf(y) === i; }).sort(function (a, b) { return b - a; });
    year.innerHTML = '<option value="">All years</option>' + years.map(function (y) { return '<option value="' + y + '">' + y + '</option>'; }).join('');

    var state = { discipline: '', year: '', q: '', only: false };
    var d = param('discipline'); if (has(D.DISCIPLINES, d)) state.discipline = d;
    var y = param('year'); if (y && years.indexOf(+y) !== -1) state.year = y;
    var q = param('q'); if (q) state.q = q.slice(0, 60);
    state.only = param('shortlist') === '1';
    search.value = state.q;
    year.value = state.year;

    grid.innerHTML = PROJECTS.map(workCard).join('');
    $$('[data-card]', grid).forEach(function (li) {
      var p = project(li.getAttribute('data-card'));
      hoverPreview($('[data-card-link]', li), $('[data-card-art]', li), p);
    });

    function matches(p, s, ignore) {
      if (ignore !== 'discipline' && s.discipline && p.discipline !== s.discipline) return false;
      if (s.year && String(p.year) !== s.year) return false;
      if (s.only && !isSaved(p.id)) return false;
      if (s.q) {
        var hay = [p.title, p.client, p.summary, D.DISCIPLINES[p.discipline].name, p.year].concat(p.tags).join(' ').toLowerCase();
        var words = s.q.toLowerCase().split(/\s+/).filter(Boolean);
        for (var i = 0; i < words.length; i++) if (hay.indexOf(words[i]) === -1) return false;
      }
      return true;
    }
    function paintChips() {
      var keys = [''].concat(Object.keys(D.DISCIPLINES));
      chips.innerHTML = keys.map(function (k) {
        var n = PROJECTS.filter(function (p) { return matches(p, state, 'discipline') && (!k || p.discipline === k); }).length;
        return '<button type="button" class="chip" data-discipline="' + k + '" aria-pressed="' + (state.discipline === k) + '">' + (k ? esc(D.DISCIPLINES[k].name) : 'All work') + ' <span class="count">' + n + '</span></button>';
      }).join('');
    }
    function apply(updateUrl) {
      var shown = 0;
      $$('[data-card]', grid).forEach(function (li) {
        var ok = matches(project(li.getAttribute('data-card')), state);
        li.hidden = !ok;
        if (ok) shown++;
      });
      paintChips();
      onlyBtn.setAttribute('aria-pressed', String(state.only));
      $('[data-work-count]').textContent = 'Showing ' + shown + ' of ' + plural(PROJECTS.length, 'project');
      $('[data-work-empty]').hidden = shown > 0;
      if (updateUrl) setParams({ discipline: state.discipline, year: state.year, q: state.q, shortlist: state.only ? '1' : '' });
    }
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-discipline]');
      if (!b) return;
      var k = b.getAttribute('data-discipline');
      state.discipline = has(D.DISCIPLINES, k) ? k : '';
      apply(true);
      var again = $('[data-discipline="' + state.discipline + '"]', chips);
      if (again) again.focus();
    });
    year.addEventListener('change', function () { state.year = year.value; apply(true); });
    search.addEventListener('input', function () { state.q = search.value.trim().slice(0, 60); apply(true); });
    $('[data-work-form]').addEventListener('submit', function (e) { e.preventDefault(); });
    onlyBtn.addEventListener('click', function () { state.only = !state.only; apply(true); });
    $$('[data-work-reset]').forEach(function (b) {
      b.addEventListener('click', function () {
        state = { discipline: '', year: '', q: '', only: false };
        search.value = ''; year.value = '';
        apply(true);
        search.focus();
      });
    });

    // The shortlist panel.
    var panelList = $('[data-shortlist-list]');
    function paintPanel() {
      var saved = shortlist.map(project).filter(Boolean);
      $('[data-shortlist-empty]').hidden = saved.length > 0;
      $('[data-shortlist-actions]').hidden = saved.length === 0;
      $('[data-shortlist-summary]').textContent = saved.length ? plural(saved.length, 'project') + ' saved' : 'Nothing saved yet';
      panelList.innerHTML = saved.map(function (p) {
        return '<li class="flex items-center gap-3 border-t border-plum-line py-3"><span class="frame w-20 shrink-0" data-art="' + esc(p.id) + '" data-art-t="0.6"></span>' +
          '<a class="min-w-0 flex-1 font-display text-lg leading-tight font-bold hover:text-mint font-stretch-85%" href="project.html?project=' + encodeURIComponent(p.id) + '">' + esc(p.title) + '</a>' +
          '<button type="button" class="grid size-10 shrink-0 place-items-center border border-plum-line hover:border-mint hover:text-mint" data-remove="' + esc(p.id) + '" aria-label="Remove ' + esc(p.title) + ' from your shortlist"><svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 18 18 6M6 6l12 12"/></svg></button></li>';
      }).join('');
      paintArt(panelList);
      if (state.only) apply(false);
    }
    panelList.addEventListener('click', function (e) {
      var b = e.target.closest('[data-remove]');
      if (b) { setSaved(b.getAttribute('data-remove'), false); var first = $('[data-remove]', panelList) || $('[data-shortlist-summary]'); if (first && first.focus) first.focus(); }
    });
    $('[data-shortlist-clear]').addEventListener('click', function () {
      shortlist.slice().forEach(function (id) { setSaved(id, false); });
      toast('Shortlist cleared');
    });
    shortlistListeners.push(paintPanel);
    paintShortlist();
    apply(false);
  }

  /* ======================================================================
     11. Case study: project.html?project=<id>, every section drawn from PROJECTS.
     ====================================================================== */
  function initCaseStudy() {
    var root = $('[data-case]');
    if (!root) return;
    var asked = param('project'), p = project(asked) || project(DEFAULT_PROJECT) || PROJECTS[0];
    $('[data-cs-missing]').hidden = !asked || !!project(asked);
    document.title = p.title + ' for ' + p.client + ' — Rillmark';
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', p.summary);

    function set(sel, text) { $$(sel, root).forEach(function (el) { el.textContent = text; }); }
    set('[data-cs-title]', p.title);
    set('[data-cs-client]', p.client);
    set('[data-cs-summary]', p.summary);
    set('[data-cs-year]', String(p.year));
    set('[data-cs-role]', p.role);
    set('[data-cs-runtime]', runtimeLabel(p.runtime));
    set('[data-cs-index]', 'Project ' + pad(p.index + 1) + ' of ' + pad(PROJECTS.length));
    var disc = $('[data-cs-discipline]', root);
    disc.textContent = disciplineName(p.discipline);
    disc.setAttribute('href', 'work.html?discipline=' + p.discipline);
    $('[data-cs-save]', root).setAttribute('data-save', p.id);

    $('[data-cs-brief]', root).innerHTML = p.brief.map(function (para, i) { return '<p class="' + (i ? 'mt-5 text-xl leading-relaxed text-muted' : 'lead') + '">' + esc(para) + '</p>'; }).join('');

    // The scrubber: drag through the film; the frame and the timecode follow.
    var hero = $('[data-cs-hero]', root), scrub = $('#cs-scrub'), tc = $('[data-cs-tc]', root);
    function paintScrub() {
      var t = +scrub.value / 1000, sec = t * p.runtime, frames = Math.round(sec * 24);
      hero.innerHTML = frameSVG(p, t, { label: 'Styleframe from ' + p.title + ' at ' + runtimeCode(Math.floor(sec)) });
      var code = pad(Math.floor(frames / 1440)) + ':' + pad(Math.floor(frames / 24) % 60) + ':' + pad(frames % 24);
      tc.textContent = code;
      scrub.setAttribute('aria-valuetext', runtimeLabel(Math.floor(sec)) + ' of ' + runtimeLabel(p.runtime));
    }
    scrub.addEventListener('input', paintScrub);
    paintScrub();

    $('[data-cs-frames]', root).innerHTML = p.frames.map(function (fr, i) {
      var sec = Math.floor(fr.t * p.runtime);
      return '<figure class="reveal"><div class="frame border-2 border-ink">' + frameSVG(p, fr.t, { label: 'Styleframe ' + (i + 1) + ': ' + fr.caption }) + '</div>' +
        '<figcaption class="mt-3 flex gap-3"><span class="slate shrink-0 pt-1 text-violet">' + runtimeCode(sec) + '</span><span class="text-lg leading-snug">' + esc(fr.caption) + '</span></figcaption></figure>';
    }).join('');
    $('[data-cs-process]', root).innerHTML = p.process.map(function (step, i) {
      return '<li class="reveal border-t-2 border-ink pt-5"><p class="slate text-violet">Step ' + pad(i + 1) + '</p><h3 class="h-card mt-2">' + esc(step.title) + '</h3><p class="mt-3 text-lg leading-relaxed text-muted">' + esc(step.text) + '</p></li>';
    }).join('');
    $('[data-cs-results]', root).innerHTML = p.results.map(function (r) {
      return '<div class="border-t border-plum-line pt-4"><dt class="sr-only">' + esc(r.label) + '</dt><dd><span class="block font-display text-5xl leading-none font-extrabold text-mint font-stretch-70%">' + esc(r.figure) + '</span><span class="mt-2 block text-lg text-haze">' + esc(r.label) + '</span></dd></div>';
    }).join('');
    $('[data-cs-credits]', root).innerHTML = p.credits.map(function (c) {
      return '<div class="flex flex-wrap justify-between gap-x-6 gap-y-1 border-t border-line py-3"><dt class="slate pt-1 text-muted">' + esc(c[0]) + '</dt><dd class="text-lg">' + esc(c[1]) + '</dd></div>';
    }).join('');
    var quote = $('[data-cs-quote]', root);
    quote.hidden = !p.quote;
    if (p.quote) {
      set('[data-cs-quote-text]', '“' + p.quote.text + '”');
      set('[data-cs-quote-name]', p.quote.name);
      set('[data-cs-quote-role]', p.quote.role);
    }
    var prev = PROJECTS[(p.index - 1 + PROJECTS.length) % PROJECTS.length], next = PROJECTS[(p.index + 1) % PROJECTS.length];
    [['[data-cs-prev]', prev], ['[data-cs-next]', next]].forEach(function (pair) {
      var a = $(pair[0], root);
      a.setAttribute('href', 'project.html?project=' + encodeURIComponent(pair[1].id));
      $('[data-cs-nav-title]', a).textContent = pair[1].title;
      var art = $('[data-art]', a);
      art.setAttribute('data-art', pair[1].id);
    });
    paintArt(root);
    paintShortlist();
  }

  /* ======================================================================
     12. Services: the scope and fee estimator. Prices live in data.js (SERVICES, STYLES,
         ROUNDS, RUSH, ADD_ONS, DEPOSIT). URL: services.html?service=music
     ====================================================================== */
  function readEstimate(raw) {
    if (!raw || typeof raw !== 'object') return null;
    if (!has(D.SERVICES, raw.service) || !has(D.STYLES, raw.style)) return null;
    var svc = D.SERVICES[raw.service];
    var seconds = clamp(Math.round(+raw.seconds / 15) * 15 || svc.seconds, svc.min, svc.max);
    var rounds = clamp(Math.round(+raw.rounds) || D.ROUNDS.included, D.ROUNDS.included, D.ROUNDS.max);
    var addons = (Array.isArray(raw.addons) ? raw.addons : []).filter(function (a, i, arr) { return has(D.ADD_ONS, a) && arr.indexOf(a) === i; });
    return { service: raw.service, seconds: seconds, style: raw.style, rounds: rounds, rush: raw.rush === true, addons: addons };
  }
  function calculate(s) {
    var svc = D.SERVICES[s.service], style = D.STYLES[s.style], lines = [];
    var animation = round10(s.seconds * svc.perSecond * style.factor);
    lines.push({ label: 'Direction, boards and styleframes', detail: svc.name, amount: svc.design });
    lines.push({ label: 'Animation', detail: runtimeLabel(s.seconds) + ' × ' + money(svc.perSecond) + '/s' + (style.factor !== 1 ? ' × ' + style.factor + ' (' + style.name + ')' : ' (' + style.name + ')'), amount: animation });
    var extra = s.rounds - D.ROUNDS.included;
    if (extra > 0) lines.push({ label: 'Extra rounds of changes', detail: plural(extra, 'round') + ' × ' + money(D.ROUNDS.extraFee), amount: extra * D.ROUNDS.extraFee });
    s.addons.forEach(function (key) {
      var a = D.ADD_ONS[key];
      lines.push({ label: a.name, detail: a.perSecond ? money(a.base) + ' + ' + money(a.perSecond) + '/s' : 'Fixed fee', amount: a.base + a.perSecond * s.seconds });
    });
    if (s.rush) lines.push({ label: 'Rush schedule', detail: '+' + Math.round(D.RUSH.uplift * 100) + '% on direction and animation', amount: round10((svc.design + animation) * D.RUSH.uplift) });
    var subtotal = lines.reduce(function (sum, l) { return sum + l.amount; }, 0);
    var weeks = svc.weeks + Math.ceil(s.seconds / 60) + Math.max(0, extra);
    if (s.rush) weeks = Math.ceil(weeks * D.RUSH.weeksFactor);
    var start = earliestStart(), end = start + weeks * 7 - 3, closure = false;
    // If production runs over the winter closure, add the two weeks the studio is shut.
    for (var n = start; n <= end; n++) if (inWinterClosure(n)) { closure = true; break; }
    if (closure) end += 14;
    return { lines: lines, subtotal: subtotal, deposit: Math.round(subtotal * D.DEPOSIT), weeks: weeks, start: start, end: end, closure: closure };
  }
  function fromPrice(key) {
    var svc = D.SERVICES[key];
    return calculate({ service: key, seconds: svc.seconds, style: 'graphic', rounds: D.ROUNDS.included, rush: false, addons: [] }).subtotal;
  }

  function initEstimator() {
    $$('[data-from-price]').forEach(function (el) {
      var key = el.getAttribute('data-from-price');
      if (has(D.SERVICES, key)) el.textContent = money(fromPrice(key));
    });
    var form = $('[data-estimator]');
    if (!form) return;
    var range = $('#est-seconds');
    var saved = readEstimate(readJSON(STORAGE_KEYS.estimate));
    var asked = param('service');
    var s = saved || { service: 'titles', seconds: D.SERVICES.titles.seconds, style: 'graphic', rounds: D.ROUNDS.included, rush: false, addons: [] };
    if (has(D.SERVICES, asked) && asked !== s.service) s = { service: asked, seconds: D.SERVICES[asked].seconds, style: s.style, rounds: s.rounds, rush: s.rush, addons: s.addons };

    function load() {
      $$('input[name="service"]', form).forEach(function (i) { i.checked = i.value === s.service; });
      $$('input[name="style"]', form).forEach(function (i) { i.checked = i.value === s.style; });
      $('#est-rounds').value = String(s.rounds);
      $('#est-rush').checked = s.rush;
      $$('input[name="addons"]', form).forEach(function (i) { i.checked = s.addons.indexOf(i.value) !== -1; });
      var svc = D.SERVICES[s.service];
      range.min = svc.min; range.max = svc.max; range.value = s.seconds;
      $('[data-est-range]').textContent = runtimeLabel(svc.min) + ' to ' + runtimeLabel(svc.max);
    }
    function read() {
      var service = ($('input[name="service"]:checked', form) || {}).value;
      var style = ($('input[name="style"]:checked', form) || {}).value;
      return readEstimate({
        service: service, style: style, seconds: +range.value, rounds: +$('#est-rounds').value, rush: $('#est-rush').checked,
        addons: $$('input[name="addons"]:checked', form).map(function (i) { return i.value; })
      }) || s;
    }
    function paint() {
      var r = calculate(s);
      $('[data-est-seconds]').textContent = runtimeLabel(s.seconds);
      range.setAttribute('aria-valuetext', runtimeLabel(s.seconds));
      $$('[data-addon-price]').forEach(function (el) {
        var a = D.ADD_ONS[el.getAttribute('data-addon-price')];
        if (a) el.textContent = money(a.base + a.perSecond * s.seconds);
      });
      $('[data-est-lines]').innerHTML = r.lines.map(function (l) {
        return '<tr class="border-t border-plum-line align-top"><th scope="row" class="py-3 pr-4 text-left font-normal"><span class="block text-lg text-card">' + esc(l.label) + '</span><span class="slate mt-1 block text-haze">' + esc(l.detail) + '</span></th><td class="py-3 text-right font-mono text-lg whitespace-nowrap text-card">' + money(l.amount) + '</td></tr>';
      }).join('');
      $('[data-est-subtotal]').textContent = money(r.subtotal);
      $('[data-est-deposit]').textContent = money(r.deposit);
      $('[data-est-weeks]').textContent = plural(r.weeks, 'week');
      $('[data-est-start]').textContent = longDay(r.start);
      $('[data-est-end]').textContent = longDay(r.end);
      $('[data-est-closure]').hidden = !r.closure;
      $('[data-est-service]').textContent = D.SERVICES[s.service].name + ', ' + inSentence(D.STYLES[s.style].name);
    }
    form.addEventListener('change', function (e) {
      var before = s.service;
      s = read();
      if (e.target.name === 'service' && s.service !== before) { s.seconds = D.SERVICES[s.service].seconds; load(); }
      paint();
    });
    range.addEventListener('input', function () { s = read(); paint(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      writeJSON(STORAGE_KEYS.estimate, s);
      window.location.href = 'contact.html';
    });
    $('[data-est-reset]').addEventListener('click', function () {
      s = { service: s.service, seconds: D.SERVICES[s.service].seconds, style: 'graphic', rounds: D.ROUNDS.included, rush: false, addons: [] };
      load(); paint();
    });
    load();
    paint();
  }

  /* ======================================================================
     13. Journal: topic chips with counts, notes newest first, each opened in place.
         URL: journal.html?topic=craft, or journal.html#<note id> opens that note.
     ====================================================================== */
  function initJournal() {
    var list = $('[data-journal-list]');
    if (!list) return;
    var notes = journal(), chips = $('[data-topic-chips]');
    var topic = param('topic');
    if (!has(D.TOPICS, topic)) topic = '';
    list.innerHTML = notes.map(function (n, i) {
      var bodyId = 'note-' + n.id + '-body';
      return '<li id="' + esc(n.id) + '" class="reveal grid gap-4 border-t-2 border-ink py-8 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-10" data-note data-topic="' + n.topic + '">' +
        '<div class="slate flex flex-wrap gap-x-4 gap-y-1 text-muted md:flex-col"><time datetime="' + isoFromDayNum(n.day) + '" class="text-ink">' + esc(longDay(n.day)) + '</time><span>' + ago(n.day) + '</span><span>' + esc(D.TOPICS[n.topic]) + ' · ' + n.minutes + ' min read</span></div>' +
        '<div class="min-w-0"><h2 class="h-section">' + esc(n.title) + '</h2>' +
        '<p class="mt-4 max-w-3xl text-xl leading-relaxed text-muted">' + esc(n.excerpt) + '</p>' +
        '<div id="' + bodyId + '" class="mt-6 max-w-3xl space-y-5 border-l-4 border-violet pl-5 text-xl leading-relaxed" hidden>' + n.body.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('') + '<p class="slate text-muted">Marika Drever, ' + esc(longDay(n.day)) + '</p></div>' +
        '<button type="button" class="btn btn-line btn-sm mt-6" aria-expanded="false" aria-controls="' + bodyId + '" data-note-toggle>Read the note</button>' +
        (i === 0 ? '<span class="slate ml-3 inline-flex items-center gap-2 text-violet"><span class="size-2 rounded-full bg-coral"></span>Latest</span>' : '') + '</div></li>';
    }).join('');

    function openNote(id, focus) {
      var li = document.getElementById(id);
      if (!li || !li.hasAttribute('data-note')) return;
      var btn = $('[data-note-toggle]', li), body = document.getElementById(btn.getAttribute('aria-controls'));
      body.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      btn.textContent = 'Close the note';
      if (focus) btn.focus({ preventScroll: true });
    }
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-note-toggle]');
      if (!btn) return;
      var body = document.getElementById(btn.getAttribute('aria-controls')), open = btn.getAttribute('aria-expanded') !== 'true';
      body.hidden = !open;
      btn.setAttribute('aria-expanded', String(open));
      btn.textContent = open ? 'Close the note' : 'Read the note';
    });
    function apply(updateUrl) {
      var shown = 0;
      $$('[data-note]', list).forEach(function (li) {
        var ok = !topic || li.getAttribute('data-topic') === topic;
        li.hidden = !ok;
        if (ok) shown++;
      });
      chips.innerHTML = [''].concat(Object.keys(D.TOPICS)).map(function (k) {
        var n = notes.filter(function (x) { return !k || x.topic === k; }).length;
        return '<button type="button" class="chip" data-topic-chip="' + k + '" aria-pressed="' + (topic === k) + '">' + (k ? esc(D.TOPICS[k]) : 'All notes') + ' <span class="count">' + n + '</span></button>';
      }).join('');
      $('[data-journal-count]').textContent = plural(shown, 'note') + (topic ? ' on ' + D.TOPICS[topic].toLowerCase() : '') + ', newest first';
      if (updateUrl) setParams({ topic: topic });
    }
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-topic-chip]');
      if (!b) return;
      var k = b.getAttribute('data-topic-chip');
      topic = has(D.TOPICS, k) ? k : '';
      apply(true);
      var again = $('[data-topic-chip="' + topic + '"]', chips);
      if (again) again.focus();
    });
    apply(false);
    var hash = window.location.hash.slice(1);
    if (hash && /^[a-z0-9-]+$/.test(hash)) {
      var target = document.getElementById(hash);
      if (target && target.hidden) { topic = ''; apply(true); }
      openNote(hash, false);
      if (target) target.scrollIntoView();
    }
  }

  /* ======================================================================
     14. About: collaborators from PEOPLE.
     ====================================================================== */
  function initPeople() {
    var box = $('[data-people]');
    if (!box) return;
    box.innerHTML = D.PEOPLE.map(function (person) {
      return '<li class="reveal flex gap-5 border-t border-plum-line pt-5"><div class="size-24 shrink-0 border border-plum-line">' + personMark(person) + '</div>' +
        '<div class="min-w-0"><h3 class="h-card text-card">' + esc(person.name) + '</h3><p class="slate mt-1 text-mint">' + esc(person.role) + ' · ' + esc(person.base) + '</p>' +
        '<p class="mt-2 text-lg leading-relaxed text-haze">' + esc(person.note) + '</p></div></li>';
    }).join('');
  }

  /* ======================================================================
     15. Contact: the project inquiry. Nothing is sent until you connect it: see DOCS.md, "Forms".
     ====================================================================== */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setError(input, msg) {
    var id = input.id + '-error';
    var el = document.getElementById(id);
    var hint = input.getAttribute('data-hint-id');
    if (msg) {
      if (!el) {
        el = document.createElement('p');
        el.id = id;
        el.className = 'field-error';
        (input.closest('[data-field]') || input.parentNode).appendChild(el);
      }
      el.textContent = msg;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', id + (hint ? ' ' + hint : ''));
    } else {
      if (el) el.remove();
      input.removeAttribute('aria-invalid');
      if (hint) input.setAttribute('aria-describedby', hint); else input.removeAttribute('aria-describedby');
    }
  }
  function deadlineDay(value) { var n = dayNum(value); return isNaN(n) ? null : n; }
  function fieldMessage(input) {
    var v = (input.value || '').trim();
    var label = input.getAttribute('data-name') || 'This field';
    if (input.required && !v) return input.tagName === 'SELECT' ? 'Choose one of the options.' : label + ' is needed.';
    if (v && input.type === 'email' && !EMAIL_RE.test(v)) return 'Enter an email address like you@studio.example.';
    if (v && input.type === 'date') {
      var n = deadlineDay(v);
      if (n === null) return 'Enter a date, like ' + longDay(todayNum() + 60, false) + '.';
      if (n <= todayNum()) return 'Choose a date after today.';
      if (n > todayNum() + 730) return 'Choose a date within the next two years.';
    }
    var min = +input.getAttribute('data-minlength') || 0;
    if (v && min && v.length < min) return label + ' needs at least ' + plural(min, 'character') + ' (' + v.length + ' so far).';
    return '';
  }
  function validate(form) {
    var first = null;
    $$('input, select, textarea', form).forEach(function (input) {
      if (input.type === 'hidden' || input.type === 'checkbox' || input.disabled) return;
      var msg = fieldMessage(input);
      setError(input, msg);
      if (msg && !first) first = input;
    });
    if (first) first.focus();
    return !first;
  }
  function liveRevalidate(form) {
    function recheck(e) {
      var input = e.target;
      if (!input.matches || !input.matches('input, select, textarea') || input.type === 'checkbox') return;
      if (input.getAttribute('aria-invalid') === 'true' || e.type === 'focusout') {
        if (e.type === 'focusout' && !input.value) return;
        setError(input, fieldMessage(input));
      }
    }
    form.addEventListener('input', recheck);
    form.addEventListener('change', recheck);
    form.addEventListener('focusout', recheck);
  }
  // A reference like RM-7K2Q (no 0/O or 1/I to misread).
  function makeRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', ref = 'RM-';
    for (var i = 0; i < 4; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
    return ref;
  }
  // Budget bands for a total before sales tax.
  function budgetBand(total) {
    if (total < 5000) return 'under-5k';
    if (total < 10000) return '5k-10k';
    if (total < 20000) return '10k-20k';
    return '20k-plus';
  }

  function initContact() {
    var form = $('[data-enquiry-form]');
    if (!form) return;
    liveRevalidate(form);
    var deadline = $('#enq-deadline'), hint = $('[data-deadline-hint]');
    deadline.min = isoFromDayNum(todayNum() + 1);
    deadline.max = isoFromDayNum(todayNum() + 730);

    // Service from ?service=, or from a saved estimate (services.html "Send this estimate").
    var svc = param('service');
    if (has(D.DISCIPLINES, svc)) $('#enq-service').value = svc;
    var estimate = readEstimate(readJSON(STORAGE_KEYS.estimate));
    var estBox = $('[data-enquiry-estimate]');
    function paintEstimate() {
      estBox.hidden = !estimate;
      $('#enq-estimate').value = '';
      if (!estimate) return;
      var r = calculate(estimate);
      var summary = D.SERVICES[estimate.service].name + ', ' + runtimeLabel(estimate.seconds) + ', ' + inSentence(D.STYLES[estimate.style].name) + (estimate.rush ? ', rush' : '');
      $('[data-estimate-summary]').textContent = summary;
      $('[data-estimate-total]').textContent = money(r.subtotal) + ' before sales tax';
      $('#enq-estimate').value = summary + ': ' + money(r.subtotal) + ' before sales tax';
      $('#enq-service').value = estimate.service;
      $('#enq-budget').value = budgetBand(r.subtotal);
    }
    $('[data-estimate-remove]').addEventListener('click', function () {
      estimate = null;
      removeKey(STORAGE_KEYS.estimate);
      paintEstimate();
      $('#enq-service').focus();
    });
    paintEstimate();

    // Saved projects become references the inquiry can include.
    var refs = $('[data-enquiry-refs]');
    function paintRefs() {
      var saved = shortlist.map(project).filter(Boolean);
      $('[data-refs-box]').hidden = !saved.length;
      refs.innerHTML = saved.map(function (p) {
        return '<li><label class="flex items-center gap-3 border border-ink/20 bg-card p-2 pr-3"><input type="checkbox" class="check mt-0" name="references" value="' + esc(p.id) + '" checked>' +
          '<span class="frame w-16 shrink-0" data-art="' + esc(p.id) + '" data-art-t="0.6"></span><span class="min-w-0 text-lg leading-tight">' + esc(p.title) + '<span class="slate mt-0.5 block text-muted">' + esc(p.client) + '</span></span></label></li>';
      }).join('');
      paintArt(refs);
    }
    shortlistListeners.push(paintRefs);
    paintRefs();

    function paintHint() {
      var n = deadlineDay(deadline.value);
      if (n === null || n <= todayNum()) { hint.textContent = 'Most projects take six to ten weeks. New projects can start from ' + longDay(earliestStart()) + '.'; return; }
      var weeks = Math.floor((n - todayNum()) / 7);
      hint.textContent = weeks < D.RUSH.threshold
        ? 'That’s ' + (weeks ? 'under ' + plural(weeks + 1, 'week') : 'less than a week') + ' away, so it would be a rush schedule. Tell Marika what’s fixed and she’ll say honestly what’s possible.'
        : 'That gives ' + plural(weeks, 'week') + '. New projects can start from ' + longDay(earliestStart()) + '.';
    }
    deadline.addEventListener('input', paintHint);
    deadline.addEventListener('change', paintHint);
    paintHint();

    var message = $('#enq-message'), counter = $('[data-message-count]');
    function paintCount() { counter.textContent = message.value.trim().length + ' / 40 characters minimum'; }
    message.addEventListener('input', paintCount);
    paintCount();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      /* Connect a real endpoint here, e.g. Formspree:
           fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
             .then(function (res) { if (res.ok) showDone(); else showFailure(); });
         and only show the success state when it answers OK. */
      showDone();
    });
    function showDone() {
      var name = $('#enq-name').value.trim().split(/\s+/)[0];
      var picked = $$('input[name="references"]:checked', form).length;
      var done = $('[data-enquiry-success]');
      $('[data-success-name]', done).textContent = name;
      $('[data-success-ref]', done).textContent = makeRef();
      $('[data-reply-date]', done).textContent = longDay(addWorkingDays(todayNum(), D.STUDIO.replyWorkingDays));
      $('[data-success-refs]', done).textContent = picked ? 'with ' + plural(picked, 'saved project') + (picked === 1 ? ' as a reference' : ' as references') : 'with your brief';
      $('[data-success-start]', done).textContent = longDay(earliestStart());
      form.hidden = true;
      done.hidden = false;
      done.focus();
      window.scrollTo({ top: done.getBoundingClientRect().top + window.scrollY - 120, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    $('[data-enquiry-again]').addEventListener('click', function () {
      form.reset();
      $$('[aria-invalid]', form).forEach(function (i) { setError(i, ''); });
      $('[data-enquiry-success]').hidden = true;
      form.hidden = false;
      paintEstimate(); paintRefs(); paintHint(); paintCount();
      $('#enq-name').focus();
    });
  }

  /* ======================================================================
     16. Start
     ====================================================================== */
  initHeader();
  initYear();
  initClock();
  initAvailability();
  paintArt(document);
  $$('[data-hover-preview]').forEach(function (a) {
    var frame = $('[data-art]', a);
    hoverPreview(a, frame, frame && project(frame.getAttribute('data-art')));
  });
  initShortlist();
  initReel();
  initDisciplineCounts();
  initLatestNotes();
  initWork();
  initCaseStudy();
  initEstimator();
  initJournal();
  initPeople();
  initContact();
  initReveal();
})();
