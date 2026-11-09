/* The Garnet Theater — site script
 * Vanilla JavaScript, no dependencies. Reads the program from assets/js/data.js.
 *  1. Settings and storage keys            9. What's on (day list and week grid)
 *  2. Helpers and safe storage            10. Film page
 *  3. Time (always in America/Denver)     11. Tickets: screening, seats, tickets, snacks
 *  4. Building the program (demo dates)   12. Membership
 *  5. Watchlist and bookings              13. Events, series and private hire
 *  6. Artwork: posters, series, icons     14. Visit: hours and concessions
 *  7. Header, menu, reveal, footer        15. Forms
 *  8. Home page                           16. Boot
 */
document.documentElement.classList.add('js');

(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Settings and storage keys
   * ------------------------------------------------------------------ */
  var D = window.GARNET;
  if (!D) return;
  var THEATER = D.THEATER, FILMS = D.FILMS, TAGS = D.TAGS, GENRES = D.GENRES;

  // localStorage keys. Both are validated on every read.
  //   watchlist: ['film-id', ...]
  //   bookings:  [{ ref, show, seats: ['F7', ...], tickets: { adult: 2 }, snacks: { 'popcorn-large': 1 }, total, name, made }]
  var STORAGE_KEYS = { watchlist: 'garnet-watchlist', bookings: 'garnet-bookings' };
  // How many days of screenings the What's on page and the film pages offer.
  var WINDOW_DAYS = 14;
  // Online booking closes this many minutes before a screening starts.
  var BOOKING_CUTOFF = 0;
  var LOCALE = 'en-US';

  /* ------------------------------------------------------------------
   * 2. Helpers and safe storage
   * ------------------------------------------------------------------ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function has(obj, key) { return typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function money(n) {
    return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'USD', minimumFractionDigits: n % 1 ? 2 : 0 }).format(n);
  }
  function clamp(n, min, max) { return Math.min(max, Math.max(min, n)); }
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

  // localStorage, or an in-memory stand-in when the browser blocks it (a sandboxed iframe, strict
  // privacy settings): the watchlist and bookings then last for this page view.
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
  function writeJSON(key, value) {
    try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* full or blocked */ }
  }

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
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
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
      toast('Downloading ' + filename);
    } catch (e) { toast('Your browser blocked the download'); }
  }
  function seeded(seed) {
    var s = 0;
    for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    return function () { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  }

  /* ------------------------------------------------------------------
   * 3. Time (always in THEATER.timeZone)
   *    Dates are whole day numbers (days since 1970-01-01), so the
   *    visitor's own time zone never shifts them.
   * ------------------------------------------------------------------ */
  function dayNum(ymd) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(ymd || '');
    return m ? Math.round(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5) : NaN;
  }
  function ymd(day) { return new Date(day * 864e5).toISOString().slice(0, 10); }
  function weekday(day) { return ((day + 4) % 7 + 7) % 7; } // 0 = Sunday
  function fmtDay(day, opts) { return new Intl.DateTimeFormat(LOCALE, Object.assign({ timeZone: 'UTC' }, opts)).format(new Date(day * 864e5)); }
  function longDate(day) { return fmtDay(day, { weekday: 'long', month: 'long', day: 'numeric' }); }
  function shortDate(day) { return fmtDay(day, { weekday: 'short', month: 'short', day: 'numeric' }); }
  function mins(hhmm) { var p = String(hhmm).split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
  // 1125 (minutes) → '6:45 pm'
  function fmtTime(m) {
    var h = Math.floor(m / 60) % 24;
    return ((h % 12) || 12) + ':' + String(m % 60).padStart(2, '0') + (h < 12 ? ' am' : ' pm');
  }

  var tzFormat;
  try {
    tzFormat = new Intl.DateTimeFormat('en-US', { timeZone: THEATER.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  } catch (e) {
    tzFormat = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  }
  function tzParts(ms) {
    var p = {};
    tzFormat.formatToParts(new Date(ms)).forEach(function (x) { p[x.type] = x.value; });
    return { day: dayNum(p.year + '-' + p.month + '-' + p.day), secs: (+p.hour % 24) * 3600 + (+p.minute) * 60 + (+p.second) };
  }
  // A theater wall-clock time → a real instant (handles daylight saving time).
  function zonedToMs(day, minutes) {
    var guess = day * 864e5 + minutes * 6e4;
    var offset = function (ms) { var p = tzParts(ms); return (p.day * 864e5 + p.secs * 1000) - ms; };
    var utc = guess - offset(guess);
    var second = guess - offset(utc);
    return second !== utc ? second : utc;
  }
  // ?now=2026-10-21T18:30 previews any page at that theater time (handy for screenshots).
  var NOW_OVERRIDE = (function () {
    var m = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(param('now') || '');
    if (!m || +m[2] > 23 || +m[3] > 59) return null;
    return zonedToMs(dayNum(m[1]), (+m[2]) * 60 + (+m[3])) - Date.now();
  })();
  function nowMs() { return Date.now() + (NOW_OVERRIDE || 0); }
  function theaterNow() { return tzParts(nowMs()); }

  /* ------------------------------------------------------------------
   * 4. Building the program
   *    While KEEP_DEMO_CURRENT is on, every date moves forward by the
   *    whole weeks since DEMO_ANCHOR (see data.js).
   * ------------------------------------------------------------------ */
  var TODAY = theaterNow().day;
  var SHIFT = D.KEEP_DEMO_CURRENT ? Math.max(0, Math.floor((TODAY - dayNum(D.DEMO_ANCHOR)) / 7) * 7) : 0;

  var SHOWS = [];
  var SHOW_BY_ID = {};
  Object.keys(D.PROGRAM).forEach(function (date) {
    var day = dayNum(date);
    if (isNaN(day)) return;
    day += SHIFT;
    String(D.PROGRAM[date]).split('|').forEach(function (part) {
      var bits = part.trim().split(/\s+/);
      if (!/^\d{1,2}:\d{2}$/.test(bits[0] || '') || !has(FILMS, bits[1])) return;
      var start = mins(bits[0]);
      var id = ymd(day) + '-' + String(Math.floor(start / 60)).padStart(2, '0') + String(start % 60).padStart(2, '0');
      var show = {
        id: id, day: day, start: start, film: bits[1],
        tags: bits.slice(2).filter(function (t) { return has(TAGS, t); }),
        end: start + FILMS[bits[1]].runtime + THEATER.trailerMinutes,
        ms: zonedToMs(day, start)
      };
      SHOWS.push(show);
      SHOW_BY_ID[id] = show;
    });
  });
  SHOWS.sort(function (a, b) { return a.day - b.day || a.start - b.start; });
  // One screen: flag any overlap while editing the program.
  SHOWS.forEach(function (s, i) {
    var next = SHOWS[i + 1];
    if (next && next.day === s.day && next.start < s.end) {
      if (window.console) console.info('Program overlap on ' + ymd(s.day) + ': ' + s.film + ' runs into ' + next.film);
    }
  });

  function isPast(show) { return show.ms - BOOKING_CUTOFF * 6e4 <= nowMs(); }
  function upcoming() { return SHOWS.filter(function (s) { return !isPast(s); }); }
  function inWindow(show) { return show.day >= TODAY && show.day < TODAY + WINDOW_DAYS; }
  // Opening day of a film with `opens` in data.js (moved with the program), else null: the film is
  // already playing. Not worked out from the first screening, because the program only starts a few
  // days back and films that opened before it would look like they open later this week.
  function openingDay(id) {
    var day = has(FILMS, id) && typeof FILMS[id].opens === 'string' ? dayNum(FILMS[id].opens) : NaN;
    return isNaN(day) ? null : day + SHIFT;
  }
  function isComingSoon(id) { var o = openingDay(id); return o !== null && o > TODAY; }
  function filmIds() { return Object.keys(FILMS); }
  function nowShowingIds() {
    return filmIds().filter(function (id) { return !isComingSoon(id) && upcoming().some(function (s) { return s.film === id; }); });
  }
  function comingSoonIds() {
    return filmIds().filter(isComingSoon).sort(function (a, b) { return openingDay(a) - openingDay(b); });
  }
  function dayLabel(day) {
    if (day === TODAY) return 'Today';
    if (day === TODAY + 1) return 'Tomorrow';
    return fmtDay(day, { weekday: 'long' });
  }
  function isMatinee(show) { return show.start < 17 * 60; }
  function priceFor(type, show) {
    var t = D.TICKET_TYPES[type];
    return show && isMatinee(show) ? t.matinee : t.price;
  }
  function runtimeText(m) { return Math.floor(m / 60) + ' hr ' + (m % 60) + ' min'; }
  function tagList(tags, cls) {
    return tags.map(function (t) {
      var tag = TAGS[t];
      var kind = tag.kind === 'access' ? 'tag-access' : (tag.kind === 'format' ? 'tag-format' : 'tag-event');
      return '<span class="tag ' + kind + (cls ? ' ' + cls : '') + '" title="' + esc(tag.label) + '">' + esc(tag.short) + '</span>';
    }).join('');
  }

  /* ------------------------------------------------------------------
   * 5. Watchlist and bookings (one safeStorage, validated on read)
   * ------------------------------------------------------------------ */
  function getWatchlist() {
    var raw = readJSON(STORAGE_KEYS.watchlist);
    if (!Array.isArray(raw)) return [];
    var out = [];
    raw.forEach(function (id) { if (has(FILMS, id) && out.indexOf(id) === -1) out.push(id); });
    return out;
  }
  function isWatched(id) { return getWatchlist().indexOf(id) !== -1; }
  function toggleWatch(id) {
    if (!has(FILMS, id)) return false;
    var list = getWatchlist();
    var at = list.indexOf(id);
    if (at === -1) list.push(id); else list.splice(at, 1);
    writeJSON(STORAGE_KEYS.watchlist, list);
    syncWatch();
    toast(at === -1 ? FILMS[id].title + ' added to your watchlist' : FILMS[id].title + ' removed from your watchlist');
    return at === -1;
  }
  var watchListeners = [];
  function syncWatch() {
    var list = getWatchlist();
    $$('[data-watch]').forEach(function (btn) {
      var id = btn.getAttribute('data-watch');
      var on = list.indexOf(id) !== -1;
      btn.setAttribute('aria-pressed', String(on));
      var title = has(FILMS, id) ? FILMS[id].title : 'this film';
      var label = $('[data-watch-label]', btn);
      if (label) label.textContent = on ? 'On your watchlist' : 'Add to watchlist';
      else btn.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + title + (on ? ' from' : ' to') + ' your watchlist');
    });
    $$('[data-watch-count]').forEach(function (el) {
      el.textContent = String(list.length);
      el.hidden = list.length === 0;
    });
    $$('[data-watch-link]').forEach(function (a) {
      a.setAttribute('aria-label', 'Watchlist, ' + plural(list.length, 'film'));
    });
    watchListeners.forEach(function (fn) { fn(list); });
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-watch]') : null;
    if (!btn) return;
    e.preventDefault();
    toggleWatch(btn.getAttribute('data-watch'));
  });
  function watchButton(id, extra) {
    return '<button type="button" class="watch-btn ' + (extra || '') + '" data-watch="' + esc(id) + '" aria-pressed="false" aria-label="Add ' + esc(FILMS[id].title) + ' to your watchlist">' + ICON.star + '</button>';
  }

  function getBookings() {
    var raw = readJSON(STORAGE_KEYS.bookings);
    if (!Array.isArray(raw)) return [];
    return raw.filter(function (b) {
      return b && typeof b.ref === 'string' && /^GT-[A-Z0-9]{4}-[A-Z0-9]{2}$/.test(b.ref) && has(SHOW_BY_ID, b.show) &&
        Array.isArray(b.seats) && b.seats.every(function (s) { return typeof s === 'string' && /^[A-Z]\d{1,2}$/.test(s); }) &&
        typeof b.total === 'number' && isFinite(b.total);
    }).slice(0, 12);
  }
  function saveBookings(list) { writeJSON(STORAGE_KEYS.bookings, list.slice(0, 12)); }
  function bookedSeats(showId) {
    var out = [];
    getBookings().forEach(function (b) { if (b.show === showId) out = out.concat(b.seats); });
    return out;
  }

  /* ------------------------------------------------------------------
   * 6. Artwork: posters, series art and icons (all SVG)
   *    Each film gets its own poster motif (POSTER_MOTIFS[id]), drawn in
   *    its palette on a 200 × 300 canvas; the title band is shared.
   * ------------------------------------------------------------------ */
  var ICON = {
    star: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path class="star-fill" d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/></svg>',
    clock: '<svg viewBox="0 0 20 20" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="10" r="7.5"/><path d="M10 6v4l2.5 2"/></svg>',
    pin: '<svg viewBox="0 0 20 20" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M10 18s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10z"/><circle cx="10" cy="8" r="2"/></svg>',
    cal: '<svg viewBox="0 0 20 20" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4.5" width="14" height="12.5" rx="2"/><path d="M3 8.5h14M7 3v3M13 3v3"/></svg>',
    ticket: '<svg viewBox="0 0 20 20" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M3 6.5V5h14v1.5a2 2 0 0 0 0 4V15H3v-4.5a2 2 0 0 0 0-4z"/><path d="M12 5v10" stroke-dasharray="1.6 1.8"/></svg>',
    arrow: '<svg viewBox="0 0 20 20" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12M11 5l5 5-5 5"/></svg>'
  };

  function stars(rnd, n, color, maxY) {
    var g = '';
    for (var i = 0; i < n; i++) {
      g += '<circle cx="' + (12 + rnd() * 176).toFixed(1) + '" cy="' + (12 + rnd() * (maxY - 12)).toFixed(1) + '" r="' + (0.5 + rnd() * 1.1).toFixed(2) + '" fill="' + color + '" opacity="' + (0.4 + rnd() * 0.6).toFixed(2) + '"/>';
    }
    return g;
  }

  var POSTER_MOTIFS = {
    'sweetwater-static': function (p, r) {
      var g = '<rect width="200" height="220" fill="url(#sky)"/>' + stars(r, 40, p[3], 120);
      for (var i = 1; i <= 5; i++) g += '<path d="M' + (100 - i * 16) + ' ' + (62 - i * 6) + 'q' + (i * 16) + ' ' + (-i * 12) + ' ' + (i * 32) + ' 0" fill="none" stroke="' + p[2] + '" stroke-width="1.6" opacity="' + (1 - i * 0.15).toFixed(2) + '"/>';
      g += '<path d="M100 60 78 200h44z" fill="none" stroke="' + p[3] + '" stroke-width="2"/>';
      for (var y = 80; y < 200; y += 20) {
        var w = (y - 60) * 0.157;
        g += '<path d="M' + (100 - w).toFixed(1) + ' ' + y + 'L' + (100 + w + 3.1).toFixed(1) + ' ' + (y + 20) + 'M' + (100 + w).toFixed(1) + ' ' + y + 'L' + (100 - w - 3.1).toFixed(1) + ' ' + (y + 20) + '" stroke="' + p[3] + '" stroke-width="1" opacity=".75"/>';
      }
      g += '<circle cx="100" cy="58" r="4" fill="#ff4b4b"/><circle cx="100" cy="58" r="9" fill="#ff4b4b" opacity=".25"/>' +
        '<path d="M0 196c40-10 70-6 100-2s70 6 100-6v32H0z" fill="' + p[0] + '"/><path d="M150 196h20v-14h-20z" fill="' + p[0] + '"/><rect x="154" y="186" width="5" height="5" fill="' + p[2] + '"/>';
      return g;
    },
    'grammar-of-rivers': function (p) {
      return '<rect width="200" height="220" fill="' + p[0] + '"/><circle cx="140" cy="54" r="26" fill="' + p[2] + '" opacity=".9"/>' +
        '<path d="M0 104 34 62l26 26 34-46 38 50 22-22 46 40v110H0z" fill="' + p[1] + '"/><path d="M60 88 94 42l10 14-16 6 6 10z" fill="' + p[3] + '" opacity=".7"/>' +
        '<path d="M0 140c30-14 70-10 100-4s70 6 100-6v90H0z" fill="#0b2a31"/>' +
        '<path d="M20 140c20 20 50 30 70 50s14 30 10 30" fill="none" stroke="' + p[3] + '" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M180 136c-22 20-44 28-62 46s-14 30-14 38" fill="none" stroke="' + p[3] + '" stroke-width="5" stroke-linecap="round" opacity=".85"/>' +
        '<path d="M102 132c-6 20 10 40 2 60s-4 28-4 28" fill="none" stroke="' + p[3] + '" stroke-width="4" stroke-linecap="round" opacity=".7"/>' +
        '<g fill="' + p[2] + '"><circle cx="54" cy="174" r="2"/><circle cx="148" cy="166" r="2"/><circle cx="96" cy="150" r="1.6"/></g>';
    },
    'glass-orchard': function (p, r) {
      var g = '<rect width="200" height="220" fill="' + p[0] + '"/><circle cx="100" cy="150" r="70" fill="' + p[2] + '" opacity=".85"/><circle cx="100" cy="150" r="88" fill="' + p[2] + '" opacity=".15"/>' +
        '<path d="M0 160c40-12 80-12 200-2v62H0z" fill="' + p[1] + '"/>';
      [[44, 120, 28], [100, 104, 36], [158, 124, 26]].forEach(function (t) {
        g += '<rect x="' + (t[0] - 3) + '" y="' + t[1] + '" width="6" height="' + (172 - t[1]) + '" fill="#1a2a1f"/><circle cx="' + t[0] + '" cy="' + t[1] + '" r="' + t[2] + '" fill="#1a2a1f"/>';
        for (var i = 0; i < 6; i++) {
          var a = r() * Math.PI * 2, d = r() * (t[2] - 8);
          g += '<circle cx="' + (t[0] + Math.cos(a) * d).toFixed(1) + '" cy="' + (t[1] + Math.sin(a) * d).toFixed(1) + '" r="4.5" fill="' + p[3] + '" fill-opacity=".35" stroke="' + p[3] + '" stroke-width="1"/>';
        }
      });
      return g + '<path d="M0 196c50-8 120-8 200 0v24H0z" fill="#162419"/>';
    },
    'hallelujah-switchback': function (p) {
      var g = '<rect width="200" height="220" fill="' + p[3] + '"/><circle cx="150" cy="50" r="22" fill="' + p[2] + '"/>';
      for (var i = 0; i < 12; i++) {
        var a = (i / 12) * Math.PI * 2;
        g += '<path d="M' + (150 + 28 * Math.cos(a)).toFixed(1) + ' ' + (50 + 28 * Math.sin(a)).toFixed(1) + 'L' + (150 + 36 * Math.cos(a)).toFixed(1) + ' ' + (50 + 36 * Math.sin(a)).toFixed(1) + '" stroke="' + p[2] + '" stroke-width="3" stroke-linecap="round"/>';
      }
      g += '<path d="M-10 220 92 48l118 172z" fill="' + p[1] + '"/><path d="M92 48 70 86l14-6 8 12 8-14 12 8z" fill="' + p[3] + '"/>' +
        '<path d="M40 210h96l-72-26h80l-58-24h50l-38-22h26l-16-18" fill="none" stroke="' + p[3] + '" stroke-width="4" stroke-linejoin="round"/>' +
        '<g transform="translate(116 150) rotate(-8)"><rect width="30" height="13" rx="3" fill="' + p[0] + '"/><rect x="3" y="3" width="5" height="4" fill="' + p[3] + '"/><rect x="10" y="3" width="5" height="4" fill="' + p[3] + '"/><rect x="17" y="3" width="5" height="4" fill="' + p[3] + '"/><circle cx="7" cy="14" r="3" fill="#1a0f08"/><circle cx="24" cy="14" r="3" fill="#1a0f08"/></g>' +
        '<g fill="' + p[0] + '" font-family="Georgia, serif" font-size="12"><text x="112" y="140">&#9834;</text><text x="150" y="128">&#9835;</text></g>';
      return g;
    },
    'ferris-hotel': function (p, r) {
      var g = '<rect width="200" height="220" fill="' + p[0] + '"/>' + stars(r, 26, p[3], 70) + '<circle cx="160" cy="38" r="16" fill="' + p[3] + '"/><circle cx="154" cy="34" r="14" fill="' + p[0] + '"/>' +
        '<rect x="40" y="56" width="120" height="164" fill="' + p[1] + '"/><path d="M34 56h132l-12-14H46z" fill="' + p[1] + '"/><rect x="74" y="30" width="52" height="14" fill="' + p[0] + '" stroke="' + p[3] + '"/>' +
        '<text x="100" y="40.5" text-anchor="middle" font-family="Limelight, serif" font-size="9" fill="' + p[3] + '">FERRIS</text>';
      for (var row = 0; row < 7; row++) {
        for (var col = 0; col < 5; col++) {
          var lit = r() > 0.55, red = row === 2 && col === 3;
          g += '<rect x="' + (50 + col * 21) + '" y="' + (66 + row * 19) + '" width="14" height="11" fill="' + (red ? p[2] : (lit ? p[3] : '#0b0814')) + '" opacity="' + (red ? 1 : (lit ? 0.8 : 1)) + '"/>';
        }
      }
      return g + '<rect x="86" y="196" width="28" height="24" fill="#0b0814"/><path d="M80 196h40l-6-8H86z" fill="' + p[2] + '"/>';
    },
    'juniper-weather': function (p) {
      var g = '<rect width="200" height="220" fill="' + p[0] + '"/><circle cx="50" cy="56" r="24" fill="' + p[2] + '"/>' +
        '<g fill="' + p[3] + '"><circle cx="118" cy="56" r="20"/><circle cx="142" cy="48" r="24"/><circle cx="166" cy="60" r="16"/><rect x="100" y="56" width="80" height="20" rx="10"/></g>';
      for (var i = 0; i < 6; i++) g += '<path d="M' + (112 + i * 12) + ' 84l-5 14" stroke="' + p[1] + '" stroke-width="2.5" stroke-linecap="round"/>';
      g += '<path d="M0 176c50-14 120-14 200 0v44H0z" fill="#3c7a3a"/><path d="M0 196c60-8 140-8 200 0v24H0z" fill="#2e5f2c"/>' +
        '<rect x="96" y="132" width="52" height="46" rx="4" fill="#c2552d"/><circle cx="112" cy="152" r="9" fill="' + p[3] + '"/><path d="M112 152l5-5" stroke="#2a0b14" stroke-width="2"/>' +
        '<rect x="128" y="144" width="12" height="4" fill="' + p[2] + '"/><rect x="128" y="152" width="12" height="4" fill="' + p[2] + '"/><path d="M134 132v-22" stroke="#2a0b14" stroke-width="2.5"/><circle cx="134" cy="108" r="4" fill="' + p[2] + '"/>' +
        '<circle cx="70" cy="136" r="9" fill="#5a3825"/><path d="M60 136c0-12 20-12 20 0" fill="#2b1a10"/><path d="M58 182l12-36 12 36z" fill="' + p[2] + '"/><path d="M78 156l18-6" stroke="#5a3825" stroke-width="3" stroke-linecap="round"/>';
      return g;
    },
    'quiet-cartographer': function (p) {
      var g = '<rect width="200" height="220" fill="' + p[3] + '"/>';
      for (var i = 0; i < 7; i++) {
        g += '<path d="M' + (40 - i * 5) + ' ' + (110 - i * 2) + 'c10-' + (30 + i * 6) + ' ' + (60 + i * 6) + '-' + (46 + i * 7) + ' ' + (110 + i * 10) + '-' + (14 + i * 2) + 's' + (14 + i * 3) + ' ' + (60 + i * 6) + '-' + (30 + i * 4) + ' ' + (78 + i * 7) + 's-' + (80 + i * 8) + ' ' + (16 + i * 3) + '-' + (80 + i * 5) + '-' + (64 + i * 4) + 'z" fill="none" stroke="' + p[1] + '" stroke-width="1.2" opacity="' + (0.9 - i * 0.1).toFixed(2) + '"/>';
      }
      g += '<path d="M14 200c20-6 26 4 40-2s20-8 36-2" fill="none" stroke="' + p[0] + '" stroke-width="1.6" stroke-dasharray="3 3"/>' +
        '<g transform="translate(100 110)"><circle r="34" fill="' + p[3] + '" stroke="' + p[0] + '" stroke-width="1.5"/><circle r="28" fill="none" stroke="' + p[1] + '" stroke-width=".8"/>' +
        '<path d="M0-40 7-7 40 0 7 7 0 40-7 7-40 0-7-7z" fill="' + p[0] + '"/><path d="M0-40 7-7 0 0zM40 0 7 7 0 0zM0 40-7 7 0 0zM-40 0-7-7 0 0z" fill="' + p[2] + '"/>' +
        '<text y="-44" text-anchor="middle" font-family="Limelight, serif" font-size="10" fill="' + p[0] + '">N</text></g>';
      return g;
    },
    'small-hours-tangier': function (p, r) {
      var g = '<rect width="200" height="220" fill="' + p[0] + '"/>' + stars(r, 30, p[3], 210) +
        '<path d="M150 36a16 16 0 1 0 12 26 13 13 0 1 1-12-26z" fill="' + p[3] + '"/>' +
        '<path d="M44 220V112c0-40 26-66 56-66s56 26 56 66v108z" fill="' + p[1] + '"/>' +
        '<path d="M58 220V116c0-30 18-52 42-52s42 22 42 52v104z" fill="' + p[2] + '" opacity=".9"/>' +
        '<path d="M58 220V116c0-30 18-52 42-52s42 22 42 52v104z" fill="url(#glow)"/>' +
        '<path d="M100 64v34" stroke="#3a1d0a" stroke-width="1.5"/><path d="M92 98h16l-3 18h-10z" fill="#3a1d0a"/><path d="M94 102h12l-2 10h-8z" fill="' + p[3] + '"/>';
      for (var i = 0; i < 7; i++) g += '<rect x="' + (30 + i * 22) + '" y="208" width="18" height="12" fill="' + (i % 2 ? p[1] : p[0]) + '"/>';
      return g;
    },
    'copper-line': function (p) {
      var g = '<rect width="200" height="220" fill="' + p[3] + '"/><rect y="60" width="200" height="50" fill="' + p[2] + '"/><rect y="110" width="200" height="40" fill="' + p[1] + '"/><circle cx="60" cy="110" r="34" fill="' + p[1] + '"/><circle cx="60" cy="110" r="26" fill="#f6dfa0"/>' +
        '<path d="M0 150h200v70H0z" fill="' + p[0] + '"/>';
      for (var x = 0; x < 200; x += 20) g += '<path d="M' + x + ' 220 ' + (x + 10) + ' 160 ' + (x + 20) + ' 220" fill="none" stroke="' + p[1] + '" stroke-width="2"/>';
      g += '<rect x="0" y="152" width="200" height="6" fill="#2a0f08"/>' +
        '<g fill="#2a0f08"><rect x="96" y="118" width="62" height="30" rx="3"/><rect x="140" y="104" width="22" height="20"/><rect x="104" y="104" width="8" height="16"/><path d="M90 148h76l6 6H84z"/><rect x="40" y="124" width="52" height="24" rx="2"/>' +
        '<circle cx="110" cy="152" r="7"/><circle cx="130" cy="152" r="7"/><circle cx="150" cy="152" r="7"/><circle cx="54" cy="152" r="5"/><circle cx="78" cy="152" r="5"/></g>' +
        '<g fill="#fff6e2" opacity=".85"><circle cx="108" cy="92" r="8"/><circle cx="98" cy="78" r="11"/><circle cx="82" cy="62" r="14"/></g><rect x="146" y="108" width="10" height="7" fill="' + p[2] + '"/>';
      return g;
    },
    'starlight-dispatch': function (p, r) {
      var g = '<rect width="200" height="220" fill="' + p[0] + '"/>' + stars(r, 24, p[3], 200) +
        '<path d="M30 220 70 0h22L50 220z" fill="' + p[3] + '" opacity=".14"/><path d="M170 220 128 0h-22l42 220z" fill="' + p[3] + '" opacity=".14"/>' +
        '<path d="M100 40l13 28 31 4-23 21 6 31-27-15-27 15 6-31-23-21 31-4z" fill="' + p[2] + '"/><path d="M100 54l8 18 20 3-15 13 4 20-17-10-17 10 4-20-15-13 20-3z" fill="' + p[0] + '" opacity=".2"/>' +
        '<rect x="56" y="160" width="88" height="40" rx="6" fill="' + p[1] + '"/><rect x="66" y="148" width="68" height="16" rx="3" fill="' + p[3] + '"/><path d="M70 152h60M70 157h44" stroke="' + p[1] + '" stroke-width="1.2"/>';
      for (var row = 0; row < 3; row++) for (var c = 0; c < 8; c++) g += '<circle cx="' + (68 + c * 9 + row * 2) + '" cy="' + (172 + row * 8) + '" r="2.6" fill="' + p[3] + '"/>';
      return g + '<path d="M0 204h200v16H0z" fill="#2b2b2b"/>';
    },
    'ninth-floor-nocturne': function (p, r) {
      var g = '<rect width="200" height="220" fill="' + p[0] + '"/>';
      for (var i = 0; i < 46; i++) {
        var x = r() * 210 - 10, y = r() * 220;
        g += '<path d="M' + x.toFixed(1) + ' ' + y.toFixed(1) + 'l-4 14" stroke="' + p[3] + '" stroke-width=".8" opacity=".35"/>';
      }
      g += '<path d="M30 120a70 70 0 0 1 140 0z" fill="' + p[1] + '" stroke="' + p[2] + '" stroke-width="2"/><path d="M42 120a58 58 0 0 1 116 0" fill="none" stroke="' + p[2] + '" stroke-width=".8"/>';
      for (var n = 1; n <= 9; n++) {
        var a = Math.PI - (n - 1) * (Math.PI / 8);
        g += '<text x="' + (100 + 48 * Math.cos(a)).toFixed(1) + '" y="' + (124 - 48 * Math.sin(a)).toFixed(1) + '" text-anchor="middle" font-family="Limelight, serif" font-size="11" fill="' + (n === 9 ? p[2] : p[3]) + '">' + n + '</text>';
      }
      g += '<path d="M100 120 140 108" stroke="' + p[2] + '" stroke-width="3" stroke-linecap="round"/><circle cx="100" cy="120" r="5" fill="' + p[2] + '"/>' +
        '<rect x="60" y="128" width="80" height="92" fill="#081018" stroke="' + p[2] + '" stroke-width="1.5"/><path d="M100 128v92" stroke="' + p[2] + '" stroke-width="1.5"/>' +
        '<g fill="' + p[3] + '"><rect x="72" y="176" width="22" height="3" rx="1.5" opacity=".7"/><rect x="72" y="182" width="16" height="3" rx="1.5" opacity=".5"/></g>';
      return g;
    },
    'snowbound-choir': function (p, r) {
      var g = '<rect width="200" height="220" fill="' + p[0] + '"/>';
      for (var i = 0; i < 50; i++) g += '<circle cx="' + (r() * 200).toFixed(1) + '" cy="' + (r() * 200).toFixed(1) + '" r="' + (0.8 + r() * 1.6).toFixed(1) + '" fill="#fff" opacity="' + (0.4 + r() * 0.5).toFixed(2) + '"/>';
      g += '<path d="M0 120c40-20 90-24 200-8v108H0z" fill="' + p[1] + '"/><path d="M0 150c50-10 120-12 200 0v70H0z" fill="' + p[3] + '"/>' +
        '<rect x="118" y="96" width="50" height="36" fill="#2a3b52"/><path d="M112 98l31-24 31 24z" fill="' + p[3] + '"/><path d="M138 74v-12h10v18" fill="' + p[3] + '"/>' +
        '<rect x="126" y="108" width="8" height="10" fill="' + p[2] + '"/><rect x="152" y="108" width="8" height="10" fill="' + p[2] + '"/>';
      for (var k = 0; k < 7; k++) {
        var x = 26 + k * 22;
        g += '<path d="M' + (x - 9) + ' 206c0-20 4-32 9-32s9 12 9 32z" fill="' + (k % 2 ? '#1f3550' : '#7a2033') + '"/><circle cx="' + x + '" cy="166" r="7" fill="#f3d9c0"/><ellipse cx="' + x + '" cy="169" rx="2" ry="' + (1.4 + (k % 3)) + '" fill="#4a1a1a"/>';
      }
      return g + '<g fill="' + p[2] + '" font-family="Georgia, serif" font-size="13"><text x="40" y="140">&#9834;</text><text x="92" y="132">&#9835;</text><text x="70" y="118">&#9834;</text></g>';
    },
    'hollow-larch': function (p, r) {
      var g = '<rect width="200" height="220" fill="' + p[0] + '"/><circle cx="40" cy="40" r="14" fill="' + p[3] + '" opacity=".7"/>';
      for (var i = 0; i < 5; i++) {
        var y = 40 + i * 28, w = 30 + i * 13;
        g += '<path d="M100 ' + (y - 10) + 'L' + (100 + w) + ' ' + (y + 30) + 'H' + (100 - w) + 'z" fill="' + p[2] + '" opacity="' + (0.95 - i * 0.06).toFixed(2) + '"/>';
      }
      g += '<rect x="88" y="170" width="24" height="50" fill="#2a160d"/><ellipse cx="100" cy="128" rx="14" ry="22" fill="#120805"/>' +
        '<circle cx="94" cy="124" r="2.6" fill="' + p[3] + '"/><circle cx="106" cy="124" r="2.6" fill="' + p[3] + '"/>';
      for (var k = 0; k < 30; k++) g += '<path d="M' + (r() * 200).toFixed(1) + ' ' + (r() * 210).toFixed(1) + 'l3 5" stroke="' + p[2] + '" stroke-width="1.2" opacity=".6"/>';
      g += '<path d="M0 206c40-6 80-4 200 0v14H0z" fill="#2a160d"/>';
      [16, 34, 166, 184].forEach(function (x, j) { g += '<path d="M' + x + ' 210l10-' + (60 + j * 8) + ' 10 ' + (60 + j * 8) + 'z" fill="#0d0605"/>'; });
      return g;
    },
    'bonfire-logic': function (p, r) {
      var g = '<rect width="200" height="220" fill="' + p[0] + '"/>' + stars(r, 34, p[3], 110) + '<circle cx="100" cy="166" r="64" fill="' + p[2] + '" opacity=".14"/>' +
        '<path d="M100 72c18 26 36 40 36 72a36 36 0 0 1-72 0c0-20 10-28 16-40 4 10 8 14 12 14-2-18 2-30 8-46z" fill="' + p[2] + '"/>' +
        '<path d="M100 112c10 14 20 22 20 38a20 20 0 0 1-40 0c0-12 8-18 12-26 2 6 4 8 6 8 0-8 0-14 2-20z" fill="' + p[3] + '"/>' +
        '<path d="M58 184l84-18M58 166l84 18" stroke="#3a2010" stroke-width="10" stroke-linecap="round"/>';
      for (var i = 0; i < 14; i++) g += '<circle cx="' + (80 + r() * 40).toFixed(1) + '" cy="' + (30 + r() * 50).toFixed(1) + '" r="' + (0.8 + r()).toFixed(1) + '" fill="' + p[3] + '"/>';
      g += '<path d="M10 150 72 128M190 150l-62-22" stroke="#c9a77a" stroke-width="2"/><rect x="66" y="122" width="10" height="8" rx="3" fill="#fff" transform="rotate(-20 71 126)"/><rect x="124" y="122" width="10" height="8" rx="3" fill="#fff" transform="rotate(20 129 126)"/>' +
        '<path d="M0 200c50-6 140-6 200 0v20H0z" fill="#120b08"/>';
      return g;
    },
    'owls-lolo': function (p, r) {
      var g = '<rect width="200" height="220" fill="' + p[0] + '"/>' + stars(r, 30, p[3], 120) + '<circle cx="100" cy="92" r="62" fill="' + p[3] + '" opacity=".92"/>';
      [[10, 90], [30, 70], [160, 76], [182, 96]].forEach(function (t) { g += '<path d="M' + t[0] + ' 220l14-' + (220 - t[1]) + ' 14 ' + (220 - t[1]) + 'z" fill="' + p[1] + '"/>'; });
      g += '<path d="M40 150c40-6 80-8 130-2" stroke="#2a1c12" stroke-width="7" stroke-linecap="round"/>' +
        '<path d="M100 76c-26 0-34 20-34 44s14 34 34 34 34-10 34-34-8-44-34-44z" fill="#8a6a46"/><path d="M70 82l-6-18 18 12zM130 82l6-18-18 12z" fill="#8a6a46"/>' +
        '<path d="M100 112c-16 0-24 10-24 26 8 10 40 10 48 0 0-16-8-26-24-26z" fill="#c9a77a"/>' +
        '<circle cx="86" cy="98" r="13" fill="' + p[2] + '"/><circle cx="114" cy="98" r="13" fill="' + p[2] + '"/><circle cx="86" cy="98" r="6" fill="#120c06"/><circle cx="114" cy="98" r="6" fill="#120c06"/>' +
        '<path d="M100 104l-5 6h10z" fill="#3a2a10"/><path d="M84 152l-4 6M92 152v7M108 152v7M116 152l4 6" stroke="#3a2a10" stroke-width="2"/>' +
        '<path d="M0 196c50-8 140-8 200 0v24H0z" fill="#0c1726"/>';
      return g;
    },
    'seven-lakes': function (p) {
      var g = '<rect width="200" height="220" fill="' + p[3] + '"/><circle cx="148" cy="44" r="18" fill="' + p[2] + '"/>' +
        '<path d="M0 110 40 52l30 34 36-50 40 46 22-20 32 38v120H0z" fill="' + p[1] + '"/><path d="M106 36 94 54l10-2 6 8 4-12 8 4z" fill="#fff"/><path d="M40 52l-8 12 8-2 4 6 2-8z" fill="#fff"/>' +
        '<path d="M0 130c60-12 140-12 200-4v94H0z" fill="#2d6a52"/><path d="M0 166c70-10 130-10 200 0v54H0z" fill="#1f4d3c"/>';
      [[30, 140, 16, 5], [84, 136, 12, 4], [140, 142, 20, 6], [56, 172, 22, 6], [122, 176, 14, 5], [172, 186, 12, 4], [92, 200, 26, 7]].forEach(function (l) {
        g += '<ellipse cx="' + l[0] + '" cy="' + l[1] + '" rx="' + l[2] + '" ry="' + l[3] + '" fill="' + p[0] + '"/><ellipse cx="' + (l[0] - 3) + '" cy="' + (l[1] - 1) + '" rx="' + (l[2] * 0.5) + '" ry="1" fill="' + p[3] + '" opacity=".7"/>';
      });
      return g;
    },
    'harvest-small': function (p) {
      var g = '<rect width="200" height="220" fill="' + p[3] + '"/><g fill="none" stroke="' + p[1] + '" stroke-width="1" opacity=".35">';
      for (var x = 0; x <= 200; x += 25) for (var y = 0; y <= 220; y += 25) g += '<path d="M' + x + ' ' + (y - 10) + 'l10 10-10 10-10-10z"/><circle cx="' + x + '" cy="' + y + '" r="3"/>';
      g += '</g><path d="M0 0h200v40c-40 10-80 0-120 8S20 60 0 52z" fill="' + p[1] + '" opacity=".25"/>' +
        '<path d="M30 0c10 40 40 60 80 70" fill="none" stroke="#4a2b1a" stroke-width="5" stroke-linecap="round"/>';
      [[60, 34, -20], [90, 56, 10], [44, 14, -40], [118, 66, 30]].forEach(function (l) {
        g += '<path d="M0 0c10-14 26-14 30 0-6 4-10 2-12 10-6-6-10-2-18-10z" fill="#3f6a3a" transform="translate(' + l[0] + ' ' + l[1] + ') rotate(' + l[2] + ')"/>';
      });
      g += '<path d="M40 150h120c-4 34-28 50-60 50s-56-16-60-50z" fill="' + p[0] + '"/><path d="M40 150h120" stroke="' + p[2] + '" stroke-width="3"/>';
      [[78, 140], [100, 134], [122, 140], [90, 120], [112, 122]].forEach(function (f) {
        g += '<path d="M' + f[0] + ' ' + (f[1] - 14) + 'c-10 6-12 16-10 22 3 6 17 6 20 0 2-6 0-16-10-22z" fill="' + p[1] + '"/><path d="M' + f[0] + ' ' + (f[1] - 14) + 'v-4" stroke="#3f6a3a" stroke-width="2"/>';
      });
      return g + '<path d="M0 204h200v16H0z" fill="' + p[0] + '"/>';
    }
  };

  // Greedy line split for the poster title band.
  function titleLines(title, max) {
    var words = title.toUpperCase().split(/\s+/), lines = [], line = '';
    words.forEach(function (w) {
      if (line && (line + ' ' + w).length > max) { lines.push(line); line = w; } else line = line ? line + ' ' + w : w;
    });
    if (line) lines.push(line);
    return lines;
  }

  // A film poster (2:3). label: alt text; omit for a decorative poster next to the title.
  function posterArt(id, label) {
    if (!has(FILMS, id)) return '';
    var f = FILMS[id], p = f.palette, uid = 'p-' + id + '-' + Math.floor(Math.random() * 1e6);
    var motif = has(POSTER_MOTIFS, id) ? POSTER_MOTIFS[id](p, seeded(id)) : '<rect width="200" height="220" fill="' + p[1] + '"/>';
    var lines = titleLines(f.title, 12);
    var longest = Math.max.apply(null, lines.map(function (l) { return l.length; }));
    var fs = Math.min(lines.length > 2 ? 17 : 22, 168 / (longest * 0.74));
    var lh = fs * 1.08;
    var top = 248 - ((lines.length - 1) * lh) / 2 + fs * 0.35;
    var text = lines.map(function (l, i) {
      return '<text x="100" y="' + (top + i * lh).toFixed(1) + '" text-anchor="middle" font-family="Limelight, serif" font-size="' + fs.toFixed(1) + '" fill="' + p[3] + '">' + esc(l) + '</text>';
    }).join('');
    var role = label ? 'role="img" aria-label="' + esc(label) + '"' : 'aria-hidden="true" focusable="false"';
    // The motif uses ids "sky" and "glow"; they are renamed per poster so several posters can share a page.
    motif = motif.replace(/url\(#sky\)/g, 'url(#' + uid + '-sky)').replace(/url\(#glow\)/g, 'url(#' + uid + '-glow)');
    return '<svg viewBox="0 0 200 300" ' + role + '>' +
      '<defs><linearGradient id="' + uid + '-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + p[0] + '"/><stop offset="1" stop-color="' + p[1] + '"/></linearGradient>' +
      '<radialGradient id="' + uid + '-glow" cx=".5" cy=".7" r=".6"><stop offset="0" stop-color="#fff6d6" stop-opacity=".55"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient>' +
      '<clipPath id="' + uid + '-clip"><rect width="200" height="220"/></clipPath></defs>' +
      '<rect width="200" height="300" fill="' + p[0] + '"/><g clip-path="url(#' + uid + '-clip)">' + motif + '</g>' +
      '<rect y="214" width="200" height="86" fill="' + p[0] + '"/><path d="M0 214h200" stroke="' + p[2] + '" stroke-width="2"/>' +
      '<path d="M76 220h48M88 223h24" stroke="' + p[2] + '" stroke-width="1" opacity=".8"/>' + text +
      '<text x="100" y="289" text-anchor="middle" font-family="Libre Franklin, sans-serif" font-size="6.4" font-weight="700" letter-spacing="1.6" fill="' + p[2] + '">' + esc(('A film by ' + f.director).toUpperCase()) + '</text>' +
      '<rect x="5" y="5" width="190" height="290" fill="none" stroke="' + p[2] + '" stroke-width="1" opacity=".75"/>' +
      '<path d="M5 25V5h20M175 5h20v20M195 275v20h-20M25 295H5v-20" fill="none" stroke="' + p[2] + '" stroke-width="2.5"/></svg>';
  }

  // Series art, 160 × 100, one motif per series (SERIES[key].art).
  function seriesArt(key) {
    if (!has(D.SERIES, key)) return '';
    var art = D.SERIES[key].art, g = '';
    if (art === 'club') {
      g = '<rect width="160" height="100" fill="#5e1124"/><path d="M0 70h160v30H0z" fill="#3d0a17"/><rect x="58" y="34" width="36" height="36" rx="4" fill="#f7eedb"/><path d="M94 42c12 0 12 20 0 20" fill="none" stroke="#f7eedb" stroke-width="5"/>' +
        '<path d="M66 28c-4-6 4-8 0-14M78 28c-4-6 4-8 0-14" stroke="#e8c874" stroke-width="2" fill="none" stroke-linecap="round"/><rect x="40" y="70" width="80" height="6" rx="3" fill="#c8a046"/>' +
        '<path d="M112 46h30l-4 24h-22z" fill="#e8c874"/><path d="M114 52h26" stroke="#9b1c34" stroke-width="3"/>';
    } else if (art === 'organ') {
      g = '<rect width="160" height="100" fill="#2a0610"/>';
      [10, 22, 30, 36, 40, 36, 30, 22, 10].forEach(function (h, i) { g += '<rect x="' + (36 + i * 10) + '" y="' + (70 - h - 20) + '" width="7" height="' + (h + 20) + '" rx="3.5" fill="' + (i % 2 ? '#c8a046' : '#e8c874') + '"/>'; });
      g += '<rect x="26" y="70" width="108" height="10" fill="#9b1c34"/>';
      for (var k = 0; k < 13; k++) g += '<rect x="' + (30 + k * 8) + '" y="82" width="7" height="14" fill="' + (k % 3 === 1 ? '#2a0610' : '#f7eedb') + '"/>';
    } else if (art === 'kids') {
      g = '<rect width="160" height="100" fill="#f2c14e"/><path d="M54 92 46 38h68l-8 54z" fill="#fcf7ec"/>';
      for (var s = 0; s < 4; s++) g += '<path d="M' + (50 + s * 16) + ' 38l6 54" stroke="#c22a45" stroke-width="6"/>';
      g += '<g fill="#fff6e2" stroke="#e8c874">';
      [[56, 30], [70, 24], [84, 28], [98, 22], [108, 32], [64, 18], [90, 14]].forEach(function (c) { g += '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="9"/>'; });
      g += '</g><circle cx="134" cy="26" r="10" fill="#1d5a52"/><path d="M134 36v40" stroke="#1d5a52" stroke-width="1.5"/>';
    } else if (art === 'late') {
      g = '<rect width="160" height="100" fill="#120c1f"/><circle cx="110" cy="40" r="22" fill="#f4d79a"/><circle cx="102" cy="36" r="20" fill="#120c1f"/>' +
        '<path d="M30 60c6-6 10-6 14 0 4-6 8-6 14 0-4-2-8 2-14 6-6-4-10-8-14-6z" fill="#c22a45"/>' +
        '<path d="M0 84c30-8 60-8 160 0v16H0z" fill="#2f2447"/><text x="40" y="94" font-family="Limelight, serif" font-size="11" fill="#e8c874">11:30 PM</text>';
    } else if (art === 'mountain') {
      g = '<rect width="160" height="100" fill="#d4e8e2"/><circle cx="118" cy="30" r="12" fill="#e8c874"/><path d="M0 100 46 34l24 28 26-38 64 76z" fill="#1d5a52"/><path d="M96 24 84 42l10-4 6 6 4-8z" fill="#fcf7ec"/>' +
        '<path d="M0 86c40-6 80-4 160 2v12H0z" fill="#2a0b14"/>';
    } else {
      g = '<rect width="160" height="100" fill="#3d0a17"/><g transform="translate(58 50)"><circle r="30" fill="#c8a046"/><circle r="6" fill="#3d0a17"/>';
      for (var a = 0; a < 6; a++) g += '<circle cx="' + (17 * Math.cos(a * Math.PI / 3)).toFixed(1) + '" cy="' + (17 * Math.sin(a * Math.PI / 3)).toFixed(1) + '" r="7" fill="#3d0a17"/>';
      g += '</g><path d="M86 70c20 4 40 2 74-8" fill="none" stroke="#2a0610" stroke-width="10"/><path d="M86 70c20 4 40 2 74-8" fill="none" stroke="#e8c874" stroke-width="6" stroke-dasharray="4 3"/>';
    }
    return '<svg viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' + g + '</svg>';
  }

  function hydrateArt(root) {
    $$('[data-poster]', root).forEach(function (el) {
      var id = el.getAttribute('data-poster');
      if (has(FILMS, id)) el.innerHTML = posterArt(id, el.hasAttribute('data-decorative') ? '' : 'Poster for ' + FILMS[id].title);
    });
    $$('[data-series-art]', root).forEach(function (el) { el.innerHTML = seriesArt(el.getAttribute('data-series-art')); });
  }

  /* ------------------------------------------------------------------
   * 7. Header, mobile menu, scroll reveal, footer
   * ------------------------------------------------------------------ */
  function initChrome() {
    var menuBtn = $('#menu-toggle'), menu = $('#mobile-menu');
    function setMenu(open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
      $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
      $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
    }
    if (menuBtn && menu) {
      menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
      });
      window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
    }
    var header = $('#site-header');
    if (header) {
      var onScroll = function () { header.classList.toggle('shadow-[0_10px_30px_-12px_rgb(0_0_0/.6)]', window.scrollY > 8); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }
    $$('[data-year]').forEach(function (el) { el.textContent = String(new Date(nowMs()).getFullYear()); });
    // <span data-since="1931">95</span> → years since the theater opened.
    $$('[data-since]').forEach(function (el) {
      var y = parseInt(el.getAttribute('data-since'), 10);
      if (y > 1800) el.textContent = String(new Date(nowMs()).getFullYear() - y);
    });

    // Back to top
    var btt = document.createElement('button');
    btt.type = 'button';
    btt.className = 'back-to-top';
    btt.setAttribute('aria-label', 'Back to top');
    btt.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btt);
    btt.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var main = $('#main');
      if (main) main.focus({ preventScroll: true });
    });
    window.addEventListener('scroll', function () { btt.classList.toggle('is-visible', window.scrollY > 900); }, { passive: true });

    boxOfficeStatus();
    setInterval(boxOfficeStatus, 60000);
  }

  var revealObserver = ('IntersectionObserver' in window && !reduceMotion)
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          // Reveal this element and everything above it, so fast jumps never leave gaps.
          var top = en.target.getBoundingClientRect().top;
          $$('.reveal:not(.is-visible)').forEach(function (el) {
            if (el.getBoundingClientRect().top <= top) { el.classList.add('is-visible'); revealObserver.unobserve(el); }
          });
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 })
    : null;
  function reveal(root) {
    $$('.reveal:not(.is-visible)', root).forEach(function (el) {
      if (revealObserver) revealObserver.observe(el); else el.classList.add('is-visible');
    });
  }

  // Box office status in the top bar and on visit.html: open now, opens later today, or opens tomorrow.
  function hoursFor(day) {
    var wd = weekday(day);
    for (var i = 0; i < D.HOURS.length; i++) if (D.HOURS[i].day === wd) return D.HOURS[i];
    return null;
  }
  function boxOfficeState() {
    var n = theaterNow(), m = Math.floor(n.secs / 60);
    var h = hoursFor(n.day);
    if (h && m >= mins(h.open) && m < mins(h.close)) return { open: true, text: 'Box office open until ' + fmtTime(mins(h.close)) };
    if (h && m < mins(h.open)) return { open: false, text: 'Box office opens today at ' + fmtTime(mins(h.open)) };
    var t = hoursFor(n.day + 1);
    return { open: false, text: 'Box office opens tomorrow at ' + (t ? fmtTime(mins(t.open)) : '') };
  }
  function boxOfficeStatus() {
    var st = boxOfficeState();
    $$('[data-boxoffice]').forEach(function (el) {
      el.innerHTML = '<span class="inline-block size-2 rounded-full ' + (st.open ? 'bg-[#7ee0a8]' : 'bg-gold') + '" aria-hidden="true"></span>' + esc(st.text);
    });
  }

  /* ------------------------------------------------------------------
   * 8. Home page
   * ------------------------------------------------------------------ */
  // One line of letterboard tiles. Titles of three or more words are split into two balanced halves,
  // so when a long title has to wrap it breaks in the middle ("NIGHT OWLS OF / LOLO PASS") rather
  // than leaving one word on its own.
  function boardLine(text, red) {
    var words = String(text).toUpperCase().split(/\s+/).filter(Boolean);
    function tiles(list) {
      return list.map(function (w) {
        return '<span class="inline-flex gap-[.14rem]">' + w.split('').map(function (c) {
          return '<span class="board-char' + (red ? ' is-red' : '') + '">' + esc(c) + '</span>';
        }).join('') + '</span>';
      }).join('<span class="board-gap"></span>');
    }
    if (words.length < 3) return '<div class="board-line">' + tiles(words) + '</div>';
    var total = words.join(' ').length, best = 1, bestDiff = Infinity;
    for (var k = 1; k < words.length; k++) {
      var left = words.slice(0, k).join(' ').length, diff = Math.abs(total - 2 * left - 1);
      if (diff < bestDiff) { bestDiff = diff; best = k; }
    }
    return '<div class="board-line is-split"><span class="board-half">' + tiles(words.slice(0, best)) + '</span><span class="board-half">' + tiles(words.slice(best)) + '</span></div>';
  }
  // The letterboard on the home page: tonight's films in screening order.
  function renderMarqueeBoard() {
    var el = $('[data-marquee-board]');
    if (!el) return;
    var day = tonightDay();
    // Films still to play that day first, then the ones already shown, up to three lines.
    var dayShows = SHOWS.filter(function (s) { return s.day === day; });
    var ordered = dayShows.filter(function (s) { return !isPast(s); }).concat(dayShows.filter(isPast).reverse());
    var titles = [];
    ordered.forEach(function (s) { if (titles.indexOf(s.film) === -1) titles.push(s.film); });
    titles = titles.slice(0, 3);
    var first = SHOWS.filter(function (s) { return s.day === day && !isPast(s); })[0];
    var html = boardLine(day === TODAY ? 'Tonight' : dayLabel(day), true) +
      titles.map(function (id) { return boardLine(FILMS[id].title); }).join('') +
      (first ? boardLine('Next show ' + fmtTime(first.start).replace(' ', ''), true) : '');
    el.innerHTML = html;
    el.setAttribute('aria-label', (day === TODAY ? 'Tonight' : dayLabel(day)) + ': ' + titles.map(function (id) { return FILMS[id].title; }).join(', '));
  }
  // The day "Tonight" means: today while screenings remain, otherwise the next day with screenings.
  function tonightDay() {
    var next = upcoming()[0];
    return next ? next.day : TODAY;
  }
  function renderTonight() {
    var list = $('[data-tonight]');
    if (!list) return;
    var day = tonightDay();
    var shows = SHOWS.filter(function (s) { return s.day === day; });
    $$('[data-tonight-heading]').forEach(function (el) { el.textContent = (day === TODAY ? 'Tonight' : (day === TODAY + 1 ? 'Tomorrow' : 'Next')) + ' at The Garnet'; });
    $$('[data-tonight-label]').forEach(function (el) { el.textContent = day === TODAY ? 'Today, ' + fmtDay(day, { month: 'long', day: 'numeric' }) : longDate(day); });
    list.innerHTML = shows.map(function (s) {
      var f = FILMS[s.film], past = isPast(s);
      return '<li class="grid grid-cols-[4.5rem_1fr] items-center gap-4 border-b border-brass/30 py-4 last:border-0 sm:grid-cols-[5.5rem_3.2rem_1fr_auto]">' +
        '<p class="font-display text-2xl tabular-nums sm:text-[1.7rem] ' + (past ? 'text-cream/70 line-through' : 'text-gold') + '">' + fmtTime(s.start).replace(' ', '<span class="ml-0.5 text-sm">') + '</span></p>' +
        '<div class="poster hidden w-12 sm:block" data-poster="' + s.film + '" data-decorative></div>' +
        '<div class="min-w-0"><p class="font-bold text-cream"><a class="hover:text-gold hover:underline" href="film.html?film=' + s.film + '">' + esc(f.title) + '</a></p>' +
        '<p class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-cream/75">' + esc(GENRES[f.genre]) + ' · ' + runtimeText(f.runtime) + ' · ' + esc(f.rating) + ' ' + tagList(s.tags) + '</p></div>' +
        '<div class="col-span-2 sm:col-span-1">' + (past ? '<span class="text-sm font-semibold text-cream/75">Started</span>' : '<a class="btn btn-brass btn-sm w-full sm:w-auto" href="tickets.html?show=' + s.id + '">Book seats<span class="sr-only"> for ' + esc(f.title) + ' at ' + fmtTime(s.start) + '</span></a>') + '</div></li>';
    }).join('');
    hydrateArt(list);
  }
  function renderNextShow() {
    var box = $('[data-next-show]');
    if (!box) return;
    function tick() {
      var next = upcoming()[0];
      if (!next) { box.textContent = 'New screenings are added every Tuesday.'; return; }
      var secs = Math.max(0, Math.round((next.ms - nowMs()) / 1000));
      var h = Math.floor(secs / 3600), m = Math.floor(secs / 60) % 60;
      var when = h >= 24 ? 'on ' + longDate(next.day) : (h ? plural(h, 'hour') + ' ' : '') + plural(m, 'minute');
      box.innerHTML = 'Next screening: <a class="font-bold text-gold underline-offset-4 hover:underline" href="film.html?film=' + next.film + '">' + esc(FILMS[next.film].title) + '</a> ' + (h >= 24 ? when : 'starts in ' + when) + '.';
    }
    tick();
    setInterval(tick, 30000);
  }

  function nextShowFor(id) {
    var list = upcoming().filter(function (s) { return s.film === id; });
    return list[0] || null;
  }
  function filmCard(id, opts) {
    var f = FILMS[id];
    opts = opts || {};
    var next = nextShowFor(id);
    var soon = isComingSoon(id);
    var access = [];
    upcoming().forEach(function (s) {
      if (s.film === id && inWindow(s)) s.tags.forEach(function (t) { if (TAGS[t].kind === 'access' && access.indexOf(t) === -1) access.push(t); });
    });
    var when = soon ? 'Opens ' + fmtDay(openingDay(id), { weekday: 'short', month: 'short', day: 'numeric' })
      : (next ? 'Next: ' + dayLabel(next.day) + ' ' + fmtTime(next.start) : 'Ask the box office');
    return '<article class="film-card group relative flex flex-col">' +
      '<div class="relative"><a href="film.html?film=' + id + '" class="poster block" data-poster="' + id + '" data-decorative tabindex="-1" aria-hidden="true"></a>' +
      '<div class="absolute right-2.5 top-2.5">' + watchButton(id) + '</div>' +
      (soon ? '<span class="absolute left-2.5 top-2.5 rounded-sm bg-gold px-2 py-1 text-[11px] font-extrabold uppercase tracking-widest text-velvet">Coming soon</span>' : '') + '</div>' +
      '<h3 class="mt-4 text-lg font-bold leading-snug ' + (opts.dark ? 'text-cream' : 'text-ink') + '"><a href="film.html?film=' + id + '" class="hover:underline">' + esc(f.title) + '</a></h3>' +
      '<p class="mt-1 text-sm ' + (opts.dark ? 'text-cream/75' : 'text-muted') + '">' + esc(GENRES[f.genre]) + ' · ' + runtimeText(f.runtime) + ' · ' + esc(f.rating) + '</p>' +
      '<p class="mt-2 flex flex-wrap items-center gap-2 text-sm font-semibold ' + (opts.dark ? 'text-gold' : 'text-garnet') + '">' + esc(when) + ' ' + tagList(access) + '</p></article>';
  }
  function renderFilmGrid(sel, ids, opts) {
    var el = $(sel);
    if (!el) return;
    el.innerHTML = ids.map(function (id) { return '<li>' + filmCard(id, opts) + '</li>'; }).join('');
    hydrateArt(el);
    syncWatch();
  }
  function initHome() {
    if (document.body.getAttribute('data-page') !== 'home') return;
    renderMarqueeBoard();
    renderTonight();
    renderNextShow();
    renderFilmGrid('[data-now-showing]', nowShowingIds().slice(0, 8));
    renderFilmGrid('[data-coming-soon]', comingSoonIds().slice(0, 4), { dark: true });
    renderEventList($('[data-home-events]'), 3);
  }

  /* ------------------------------------------------------------------
   * 9. What's on: a day-by-day list and a week grid, with filters
   *    URL: ?view=day|week &day=YYYY-MM-DD &week=1|2 &genre=drama &access=cc,sf &watch=1
   * ------------------------------------------------------------------ */
  function initWhatsOn() {
    var root = $('[data-whats-on]');
    if (!root) return;
    var days = [];
    for (var i = 0; i < WINDOW_DAYS; i++) days.push(TODAY + i);
    var dayKeys = {};
    days.forEach(function (d) { dayKeys[ymd(d)] = d; });
    var ACCESS = {};
    Object.keys(TAGS).forEach(function (t) { if (TAGS[t].kind === 'access') ACCESS[t] = TAGS[t]; });

    var state = { view: 'day', day: TODAY, week: 1, genre: '', access: [], watch: false };
    var pv = param('view'); if (pv === 'week' || pv === 'day') state.view = pv;
    var pd = param('day'); if (has(dayKeys, pd)) state.day = dayKeys[pd];
    if (param('week') === '2') state.week = 2;
    var pg = param('genre'); if (has(GENRES, pg)) state.genre = pg;
    (param('access') || '').split(',').forEach(function (a) { if (has(ACCESS, a) && state.access.indexOf(a) === -1) state.access.push(a); });
    state.watch = param('watch') === '1';
    // If today's screenings are all over, start on tomorrow.
    if (!pd && !SHOWS.some(function (s) { return s.day === TODAY && !isPast(s); })) state.day = TODAY + 1;

    var strip = $('[data-day-strip]', root), genreBox = $('[data-genre-filters]', root), accessBox = $('[data-access-filters]', root);
    strip.innerHTML = days.map(function (d) {
      return '<button type="button" class="day-chip" data-day="' + ymd(d) + '" aria-pressed="false">' +
        '<span class="text-[11px] font-bold uppercase tracking-wider">' + esc(d === TODAY ? 'Today' : fmtDay(d, { weekday: 'short' })) + '</span>' +
        '<span class="font-display text-lg">' + fmtDay(d, { day: 'numeric' }) + '</span><span class="sr-only"> ' + esc(fmtDay(d, { month: 'long' })) + '</span></button>';
    }).join('');
    genreBox.innerHTML = '<button type="button" class="chip" data-genre="" aria-pressed="false">All genres</button>' + Object.keys(GENRES).map(function (g) {
      return '<button type="button" class="chip" data-genre="' + g + '" aria-pressed="false">' + esc(GENRES[g]) + '</button>';
    }).join('');
    accessBox.innerHTML = Object.keys(ACCESS).map(function (a) {
      return '<button type="button" class="chip" data-access="' + a + '" aria-pressed="false"><span class="tag tag-access">' + esc(ACCESS[a].short) + '</span>' + esc(ACCESS[a].label) + '</button>';
    }).join('');

    function matches(s) {
      var f = FILMS[s.film];
      if (state.genre && f.genre !== state.genre) return false;
      if (state.access.length && !state.access.every(function (a) { return s.tags.indexOf(a) !== -1; })) return false;
      if (state.watch && !isWatched(s.film)) return false;
      return true;
    }
    function render() {
      $$('[data-day]', strip).forEach(function (b) { b.setAttribute('aria-pressed', String(dayKeys[b.getAttribute('data-day')] === state.day)); });
      $$('[data-genre]', genreBox).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-genre') === state.genre)); });
      $$('[data-access]', accessBox).forEach(function (b) { b.setAttribute('aria-pressed', String(state.access.indexOf(b.getAttribute('data-access')) !== -1)); });
      $$('[data-view]', root).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-view') === state.view)); });
      $$('[data-week]', root).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.getAttribute('data-week') === state.week)); });
      var watchToggle = $('[data-watch-only]', root);
      if (watchToggle) watchToggle.setAttribute('aria-pressed', String(state.watch));
      $('[data-day-panel]', root).hidden = state.view !== 'day';
      $('[data-week-panel]', root).hidden = state.view !== 'week';
      if (state.view === 'day') renderDay(); else renderWeek();
      setParams({
        view: state.view === 'week' ? 'week' : '', day: state.view === 'day' && state.day !== TODAY ? ymd(state.day) : '',
        week: state.view === 'week' && state.week === 2 ? '2' : '', genre: state.genre, access: state.access.join(','), watch: state.watch ? '1' : ''
      });
    }
    function renderDay() {
      var out = $('[data-day-list]', root);
      var shows = SHOWS.filter(function (s) { return s.day === state.day; });
      var shown = shows.filter(matches);
      $('[data-day-heading]', root).textContent = (state.day === TODAY ? 'Today, ' : '') + longDate(state.day);
      $('[data-result-count]', root).textContent = plural(shown.length, 'screening') + ' on ' + longDate(state.day) + (shown.length < shows.length ? ' (of ' + shows.length + ')' : '');
      if (!shown.length) {
        out.innerHTML = '<li class="card px-6 py-10 text-center"><p class="font-display text-2xl">Nothing matches on this day</p><p class="mt-2 text-muted">Try another day or clear a filter. Captioned and sensory-friendly screenings run every week.</p><button type="button" class="btn btn-outline btn-sm mt-5" data-clear-filters>Clear filters</button></li>';
        return;
      }
      out.innerHTML = shown.map(function (s) {
        var f = FILMS[s.film], past = isPast(s);
        return '<li class="card grid grid-cols-[4.2rem_1fr] gap-4 p-4 sm:grid-cols-[6.5rem_5.5rem_1fr_auto] sm:items-center sm:gap-6 sm:p-5' + (past ? ' bg-sand/70' : '') + '">' +
          '<p class="font-display text-2xl leading-none text-garnet tabular-nums sm:text-3xl">' + fmtTime(s.start).replace(' ', '<span class="block text-xs font-sans font-bold uppercase tracking-widest text-muted">') + '</span></p>' +
          '<a href="film.html?film=' + s.film + '" class="poster row-span-2 hidden w-full sm:block" data-poster="' + s.film + '" data-decorative tabindex="-1" aria-hidden="true"></a>' +
          '<div class="min-w-0"><h3 class="text-lg font-bold leading-snug"><a class="hover:underline" href="film.html?film=' + s.film + '">' + esc(f.title) + '</a></h3>' +
          '<p class="mt-1 text-sm text-muted">' + esc(GENRES[f.genre]) + ' · ' + runtimeText(f.runtime) + ' · ' + esc(f.rating) + ' · ends about ' + fmtTime(s.end % 1440) + '</p>' +
          (s.tags.length ? '<p class="mt-2 flex flex-wrap gap-1.5">' + s.tags.map(function (t) { return '<span class="tag ' + (TAGS[t].kind === 'access' ? 'tag-access' : TAGS[t].kind === 'format' ? 'tag-format' : 'tag-event') + '">' + esc(TAGS[t].label) + '</span>'; }).join('') + '</p>' : '') + '</div>' +
          '<div class="col-span-2 flex items-center gap-3 sm:col-span-1">' + watchButton(s.film, 'watch-btn-light') +
          (past ? '<span class="text-sm font-semibold text-muted">Started</span>' : '<a class="btn btn-garnet btn-sm flex-1 sm:flex-none" href="tickets.html?show=' + s.id + '">Book<span class="sr-only"> ' + esc(f.title) + ', ' + esc(longDate(s.day)) + ' at ' + fmtTime(s.start) + '</span></a>') + '</div></li>';
      }).join('');
      hydrateArt(out);
      syncWatch();
    }
    function renderWeek() {
      var start = TODAY + (state.week - 1) * 7;
      var weekDays = [];
      for (var d = start; d < start + 7; d++) weekDays.push(d);
      var shows = SHOWS.filter(function (s) { return s.day >= start && s.day < start + 7 && matches(s); });
      var films = [];
      shows.forEach(function (s) { if (films.indexOf(s.film) === -1) films.push(s.film); });
      films.sort(function (a, b) { return FILMS[a].title.localeCompare(FILMS[b].title); });
      $('[data-week-heading]', root).textContent = fmtDay(start, { month: 'long', day: 'numeric' }) + ' – ' + fmtDay(start + 6, { month: 'long', day: 'numeric' });
      $('[data-result-count]', root).textContent = plural(shows.length, 'screening') + ' of ' + plural(films.length, 'film') + ', ' + fmtDay(start, { month: 'short', day: 'numeric' }) + ' to ' + fmtDay(start + 6, { month: 'short', day: 'numeric' });
      var table = $('[data-week-grid]', root);
      if (!films.length) {
        table.innerHTML = '<p class="card px-6 py-10 text-center text-muted">No screenings match these filters this week. <button type="button" class="font-bold text-garnet underline" data-clear-filters>Clear filters</button></p>';
        return;
      }
      table.innerHTML = '<table class="w-full min-w-[56rem] border-separate border-spacing-0 text-left text-sm"><caption class="sr-only">Showtimes by film and day</caption><thead><tr>' +
        '<th scope="col" class="sticky left-0 z-10 bg-velvet px-4 py-3 text-xs font-bold uppercase tracking-widest text-gold">Film</th>' +
        weekDays.map(function (d) { return '<th scope="col" class="week-day px-2 py-3 text-center text-xs font-bold uppercase tracking-widest ' + (d === TODAY ? 'is-today' : '') + '">' + esc(d === TODAY ? 'Today' : fmtDay(d, { weekday: 'short' })) + '<span class="block font-display text-base normal-case tracking-normal">' + fmtDay(d, { month: 'short', day: 'numeric' }) + '</span></th>'; }).join('') +
        '</tr></thead><tbody>' + films.map(function (id) {
          var f = FILMS[id];
          return '<tr><th scope="row" class="sticky left-0 z-10 border-b border-brass/30 bg-paper px-4 py-3 align-top"><a href="film.html?film=' + id + '" class="font-bold hover:underline">' + esc(f.title) + '</a><span class="block text-xs font-normal text-muted">' + runtimeText(f.runtime) + ' · ' + esc(f.rating) + '</span></th>' +
            weekDays.map(function (d) {
              var cell = shows.filter(function (s) { return s.film === id && s.day === d; });
              return '<td class="border-b border-l border-brass/30 bg-paper/60 px-1.5 py-2 text-center align-top">' + (cell.length ? cell.map(function (s) {
                var past = isPast(s);
                return '<a class="showtime showtime-sm my-0.5' + (past ? ' is-past' : '') + '" href="tickets.html?show=' + s.id + '"' + (past ? ' aria-disabled="true" tabindex="-1"' : '') + '>' + fmtTime(s.start) +
                  (s.tags.length ? '<small>' + s.tags.map(function (t) { return esc(TAGS[t].short); }).join(' · ') + '</small>' : '') + '<span class="sr-only"> ' + esc(f.title) + ', ' + esc(longDate(d)) + (past ? ', started' : '') + '</span></a>';
              }).join('') : '<span class="text-muted" aria-label="No screenings">–</span>') + '</td>';
            }).join('') + '</tr>';
        }).join('') + '</tbody></table>';
    }

    root.addEventListener('click', function (e) {
      var t = e.target.closest('button');
      if (!t || !root.contains(t)) return;
      if (t.hasAttribute('data-day')) { state.day = dayKeys[t.getAttribute('data-day')]; state.view = 'day'; }
      else if (t.hasAttribute('data-genre')) state.genre = t.getAttribute('data-genre');
      else if (t.hasAttribute('data-access')) {
        var a = t.getAttribute('data-access'), at = state.access.indexOf(a);
        if (at === -1) state.access.push(a); else state.access.splice(at, 1);
      } else if (t.hasAttribute('data-view')) state.view = t.getAttribute('data-view') === 'week' ? 'week' : 'day';
      else if (t.hasAttribute('data-week')) state.week = t.getAttribute('data-week') === '2' ? 2 : 1;
      else if (t.hasAttribute('data-watch-only')) state.watch = !state.watch;
      else if (t.hasAttribute('data-clear-filters')) { state.genre = ''; state.access = []; state.watch = false; }
      else return;
      render();
    });
    watchListeners.push(function () { if (state.watch) render(); renderWatchlist(); });
    render();
    renderWatchlist();
  }

  // "Your watchlist" on whats-on.html: each saved film with its next screening.
  function renderWatchlist() {
    var box = $('[data-watchlist]');
    if (!box) return;
    var list = getWatchlist();
    var count = $('[data-watchlist-count]');
    if (count) count.textContent = list.length ? plural(list.length, 'film') + ' saved on this device' : 'Nothing saved yet';
    if (!list.length) {
      box.innerHTML = '<li class="col-span-full rounded-md border border-dashed border-brass/60 px-6 py-8 text-center text-cream/80">Tap the star on any film to keep it here. Your watchlist stays on this device; there is nothing to sign up for.</li>';
      return;
    }
    box.innerHTML = list.map(function (id) {
      var f = FILMS[id], next = nextShowFor(id), soon = isComingSoon(id);
      return '<li class="flex items-center gap-4 rounded-md bg-wine/60 p-3 ring-1 ring-brass/40"><a href="film.html?film=' + id + '" class="poster w-14 shrink-0" data-poster="' + id + '" data-decorative tabindex="-1" aria-hidden="true"></a>' +
        '<div class="min-w-0 flex-1"><p class="font-bold text-cream"><a href="film.html?film=' + id + '" class="hover:underline">' + esc(f.title) + '</a></p>' +
        '<p class="text-sm text-cream/75">' + (next ? (soon ? 'Opens ' : 'Next: ') + esc(shortDate(next.day)) + ', ' + fmtTime(next.start) : 'No screenings scheduled') + '</p></div>' +
        watchButton(id) + '</li>';
    }).join('');
    hydrateArt(box);
    $$('[data-watch]', box).forEach(function (b) { b.setAttribute('aria-pressed', 'true'); b.setAttribute('aria-label', 'Remove ' + FILMS[b.getAttribute('data-watch')].title + ' from your watchlist'); });
  }

  /* ------------------------------------------------------------------
   * 10. Film page (film.html?film=<id>)
   * ------------------------------------------------------------------ */
  var DEFAULT_FILM = 'sweetwater-static';
  function initFilm() {
    var root = $('[data-film-page]');
    if (!root) return;
    var asked = param('film');
    var id = has(FILMS, asked) ? asked : DEFAULT_FILM;
    var notice = $('[data-film-notice]');
    if (asked && !has(FILMS, asked) && notice) {
      notice.hidden = false;
      notice.textContent = 'We couldn’t find that film in our program, so here is our pick of the week instead.';
    }
    var f = FILMS[id];
    document.title = f.title + ' (' + f.year + ') — showtimes and tickets | The Garnet Theater';
    var meta = $('meta[name="description"]');
    if (meta) meta.setAttribute('content', f.tagline + ' ' + f.synopsis.split('. ')[0] + '. At The Garnet Theater, Missoula.');
    $('[data-film-poster]').innerHTML = posterArt(id, 'Poster for ' + f.title);
    $('#film-title').textContent = f.title;
    $$('[data-film-crumb]').forEach(function (el) { el.textContent = f.title; });
    $('[data-film-tagline]').textContent = f.tagline;
    $('[data-film-meta]').innerHTML = [f.year, GENRES[f.genre], runtimeText(f.runtime), f.rating === 'NR' ? 'Not rated' : 'Rated ' + f.rating].map(function (x) {
      return '<li class="rounded-sm bg-wine/70 px-2.5 py-1 ring-1 ring-brass/40">' + esc(String(x)) + '</li>';
    }).join('');
    $('[data-film-synopsis]').textContent = f.synopsis;
    $('[data-film-note]').textContent = f.note;
    $('[data-film-credits]').innerHTML =
      '<div><dt class="text-xs font-bold uppercase tracking-widest text-brass-deep">Director</dt><dd class="mt-1 font-semibold">' + esc(f.director) + '</dd></div>' +
      '<div><dt class="text-xs font-bold uppercase tracking-widest text-brass-deep">Cast</dt><dd class="mt-1 font-semibold">' + f.cast.map(esc).join(', ') + '</dd></div>' +
      '<div><dt class="text-xs font-bold uppercase tracking-widest text-brass-deep">Country</dt><dd class="mt-1 font-semibold">' + esc(f.country) + '</dd></div>' +
      '<div><dt class="text-xs font-bold uppercase tracking-widest text-brass-deep">Language</dt><dd class="mt-1 font-semibold">' + esc(f.language) + '</dd></div>';
    $$('[data-film-watch]').forEach(function (b) { b.setAttribute('data-watch', id); });

    var shows = upcoming().filter(function (s) { return s.film === id && inWindow(s); });
    var box = $('[data-film-showtimes]');
    var soon = isComingSoon(id);
    $('[data-film-status]').textContent = soon ? 'Opens ' + longDate(openingDay(id)) : (shows.length ? 'Now showing' : 'Returning soon');
    if (!shows.length) {
      box.innerHTML = '<p class="text-muted">No screenings in the next two weeks. Call the box office on (406) 555-0120 and we will tell you when it is back.</p>';
    } else {
      var byDay = [];
      shows.forEach(function (s) {
        var last = byDay[byDay.length - 1];
        if (!last || last.day !== s.day) byDay.push({ day: s.day, shows: [s] }); else last.shows.push(s);
      });
      box.innerHTML = '<ul class="divide-y divide-brass/30">' + byDay.map(function (g) {
        return '<li class="grid gap-3 py-4 sm:grid-cols-[12rem_1fr] sm:items-center"><p class="font-bold">' + esc(g.day === TODAY ? 'Today' : (g.day === TODAY + 1 ? 'Tomorrow' : fmtDay(g.day, { weekday: 'long' }))) +
          '<span class="block text-sm font-normal text-muted">' + esc(fmtDay(g.day, { month: 'long', day: 'numeric' })) + '</span></p><div class="flex flex-wrap gap-2">' +
          g.shows.map(function (s) {
            return '<a class="showtime" href="tickets.html?show=' + s.id + '">' + fmtTime(s.start) + (s.tags.length ? '<small>' + s.tags.map(function (t) { return esc(TAGS[t].short); }).join(' · ') + '</small>' : '') +
              '<span class="sr-only">, ' + esc(longDate(s.day)) + (s.tags.length ? ', ' + s.tags.map(function (t) { return TAGS[t].label; }).join(', ') : '') + '</span></a>';
          }).join('') + '</div></li>';
      }).join('') + '</ul>';
    }
    var tagsUsed = [];
    shows.forEach(function (s) { s.tags.forEach(function (t) { if (tagsUsed.indexOf(t) === -1) tagsUsed.push(t); }); });
    $('[data-film-tags]').innerHTML = tagsUsed.length ? tagsUsed.map(function (t) {
      return '<li class="flex gap-3"><span class="tag ' + (TAGS[t].kind === 'access' ? 'tag-access' : TAGS[t].kind === 'format' ? 'tag-format' : 'tag-event') + ' mt-0.5 shrink-0">' + esc(TAGS[t].short) + '</span><span><strong>' + esc(TAGS[t].label) + '.</strong> ' + esc(TAGS[t].note) + '</span></li>';
    }).join('') : '<li class="text-muted">Every screening has audio-description and assistive-listening headsets on request.</li>';

    var first = shows[0];
    var book = $('[data-film-book]');
    if (book) {
      if (first) { book.href = 'tickets.html?show=' + first.id; book.innerHTML = 'Book ' + esc(dayLabel(first.day).toLowerCase() === 'today' ? 'today' : dayLabel(first.day)) + ', ' + fmtTime(first.start); }
      else book.hidden = true;
    }
    var ics = $('[data-film-ics]');
    if (ics) {
      if (!first) ics.hidden = true;
      ics.addEventListener('click', function () {
        if (first) download(id + '.ics', icsFor(f.title + ' at The Garnet', first.day, first.start, first.end, THEATER.address, f.tagline), 'text/calendar;charset=utf-8');
      });
    }
    var related = filmIds().filter(function (o) { return o !== id && FILMS[o].genre === f.genre; });
    filmIds().forEach(function (o) { if (o !== id && related.indexOf(o) === -1 && related.length < 4 && !isComingSoon(o)) related.push(o); });
    renderFilmGrid('[data-film-related]', related.slice(0, 4));
    syncWatch();
  }

  // A one-event .ics calendar file (times in the theater's time zone, written in UTC).
  function icsFor(title, day, start, end, place, desc) {
    function stamp(ms) { return new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    function fold(s) { return String(s).replace(/[\\;,]/g, function (c) { return '\\' + c; }).replace(/\n/g, '\\n'); }
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//The Garnet Theater//Program//EN', 'BEGIN:VEVENT',
      'UID:' + ymd(day) + '-' + start + '-' + Math.abs(title.length * 7919) + '@' + THEATER.uidDomain,
      'DTSTAMP:' + stamp(Date.now()), 'DTSTART:' + stamp(zonedToMs(day, start)), 'DTEND:' + stamp(zonedToMs(day, end)),
      'SUMMARY:' + fold(title), 'LOCATION:' + fold(place), 'DESCRIPTION:' + fold(desc), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  }

  /* ------------------------------------------------------------------
   * 11. Tickets (tickets.html?show=<YYYY-MM-DD-HHMM> or ?film=<id>)
   *     Screening → tickets → seats → snacks → details → reference.
   * ------------------------------------------------------------------ */
  var SEATS = (function () {
    var rows = [], total = 0;
    D.SEAT_ROWS.forEach(function (r) {
      var n = 0, cells = [];
      for (var i = 0; i < (r.offset || 0); i++) cells.push(null);
      r.blocks.forEach(function (count, b) {
        if (b > 0) cells.push('aisle');
        for (var k = 0; k < count; k++) {
          n++;
          cells.push({ id: r.row + n, row: r.row, num: n, wheel: (r.wheel || []).indexOf(n) !== -1 });
        }
      });
      total += n;
      rows.push({ row: r.row, cells: cells });
    });
    return { rows: rows, total: total };
  })();
  THEATER.seats = SEATS.total;

  // Seats already sold for a screening: a steady pattern per screening (busier on weekend
  // evenings, quieter at matinees and relaxed screenings), plus anything booked on this device.
  function soldSeats(show) {
    var rnd = seeded(show.id);
    var wd = weekday(show.day);
    var rate = show.start >= 18 * 60 ? 0.38 : 0.2;
    if ((wd === 5 || wd === 6) && show.start >= 18 * 60) rate = 0.52;
    if (show.start >= 23 * 60) rate = 0.3;
    if (show.tags.indexOf('sf') !== -1 || show.tags.indexOf('pb') !== -1) rate = 0.14;
    if (show.tags.indexOf('qa') !== -1) rate = 0.6;
    var sold = {};
    SEATS.rows.forEach(function (r, ri) {
      var len = r.cells.length;
      r.cells.forEach(function (c, ci) {
        if (!c || c === 'aisle') return;
        var center = 1 - Math.abs(ci - len / 2) / (len / 2);
        var middleRows = 1 - Math.abs(ri - 6) / 8;
        var p = rate * (0.55 + 0.45 * center + 0.3 * middleRows) * (c.wheel ? 0.4 : 1);
        if (rnd() < p) sold[c.id] = true;
      });
    });
    bookedSeats(show.id).forEach(function (id) { sold[id] = 'yours'; });
    return sold;
  }

  function initTickets() {
    var form = $('[data-booking]');
    if (!form) return;
    var filmSelect = $('#bk-film', form), showBox = $('[data-show-options]', form), seatMap = $('[data-seat-map]', form);
    var typesBox = $('[data-ticket-types]', form), snacksBox = $('[data-snacks]', form), summary = $('[data-summary]');
    var seatStatus = $('[data-seat-status]', form);
    var state = { show: null, seats: [], tickets: {}, snacks: {} };
    Object.keys(D.TICKET_TYPES).forEach(function (t) { state.tickets[t] = 0; });
    var addons = D.CONCESSIONS.filter(function (c) { return c.addon; });
    var ADDON_BY_ID = {};
    addons.forEach(function (c) { ADDON_BY_ID[c.id] = c; state.snacks[c.id] = 0; });

    var bookable = function (id) { return upcoming().filter(function (s) { return s.film === id && inWindow(s); }); };
    var films = filmIds().filter(function (id) { return bookable(id).length; });
    films.sort(function (a, b) { return bookable(a)[0].ms - bookable(b)[0].ms; });
    filmSelect.innerHTML = films.map(function (id) { return '<option value="' + id + '">' + esc(FILMS[id].title) + '</option>'; }).join('');

    // Starting screening: ?show= (if it is still bookable), else the first of ?film=, else the next screening.
    var askShow = param('show'), askFilm = param('film');
    var start = null;
    if (has(SHOW_BY_ID, askShow) && !isPast(SHOW_BY_ID[askShow]) && inWindow(SHOW_BY_ID[askShow])) start = SHOW_BY_ID[askShow];
    else if (has(FILMS, askFilm) && bookable(askFilm).length) start = bookable(askFilm)[0];
    else if (films.length) start = bookable(films[0])[0];
    var notice = $('[data-ticket-notice]');
    if (askShow && start && start.id !== askShow && notice) {
      notice.hidden = false;
      notice.textContent = 'That screening has already started or is no longer on sale, so we have picked the next one for you.';
    }

    function seatCount() { return state.seats.length; }
    function ticketCount() { return Object.keys(state.tickets).reduce(function (n, t) { return n + state.tickets[t]; }, 0); }

    function renderShows() {
      var id = filmSelect.value;
      var list = bookable(id);
      showBox.innerHTML = list.map(function (s) {
        return '<button type="button" class="showtime showtime-wide" data-show="' + s.id + '" aria-pressed="' + String(state.show && state.show.id === s.id) + '">' +
          '<small>' + esc(s.day === TODAY ? 'Today' : fmtDay(s.day, { weekday: 'short', month: 'short', day: 'numeric' })) + '</small>' + fmtTime(s.start) +
          (s.tags.length ? '<small>' + s.tags.map(function (t) { return esc(TAGS[t].short); }).join(' · ') + '</small>' : '') + '</button>';
      }).join('');
    }
    function selectShow(show) {
      state.show = show;
      state.seats = [];
      filmSelect.value = show.film;
      renderShows();
      renderTypes();
      renderSeats();
      renderSummary();
      if (has(SHOW_BY_ID, show.id)) setParams({ show: show.id, film: '' });
      var f = FILMS[show.film];
      $$('[data-bk-film-title]').forEach(function (el) { el.textContent = f.title; });
      var poster = $('[data-bk-poster]');
      if (poster) poster.innerHTML = posterArt(show.film, '');
    }

    function renderTypes() {
      var show = state.show;
      typesBox.innerHTML = Object.keys(D.TICKET_TYPES).map(function (t) {
        var tt = D.TICKET_TYPES[t];
        return '<li class="flex items-center justify-between gap-4 py-3"><div><p class="font-bold" id="tt-' + t + '">' + esc(tt.label) + '</p><p class="text-sm text-muted">' + money(priceFor(t, show)) + (show && isMatinee(show) ? ' matinee price' : '') + (t === 'member' ? ' · member number needed' : '') + '</p></div>' +
          '<div class="stepper" role="group" aria-labelledby="tt-' + t + '"><button type="button" data-step="' + t + '" data-dir="-1" aria-label="One fewer ' + esc(tt.label) + ' ticket">−</button><output aria-live="polite">' + state.tickets[t] + '</output><button type="button" data-step="' + t + '" data-dir="1" aria-label="One more ' + esc(tt.label) + ' ticket">+</button></div></li>';
      }).join('');
      updateSteppers();
    }
    function updateSteppers() {
      var total = ticketCount();
      $$('[data-step]', typesBox).forEach(function (b) {
        var t = b.getAttribute('data-step'), dir = +b.getAttribute('data-dir');
        b.disabled = dir < 0 ? state.tickets[t] === 0 : total >= D.MAX_SEATS;
        b.parentNode.querySelector('output').textContent = state.tickets[t];
      });
      var member = $('[data-member-field]', form);
      if (member) member.hidden = state.tickets.member === 0;
    }

    function renderSeats() {
      var show = state.show;
      if (!show) { seatMap.innerHTML = ''; return; }
      var sold = soldSeats(show);
      var free = 0;
      seatMap.innerHTML = '<div class="screen-arc mx-auto mb-1 w-4/5"></div><p class="mb-6 text-center text-[11px] font-bold uppercase tracking-[.3em] text-gold">Screen</p>' +
        '<div class="seat-grid" role="group" aria-label="Seats for ' + esc(FILMS[show.film].title) + '">' + SEATS.rows.map(function (r) {
          return '<div class="seat-row"><span class="seat-label" aria-hidden="true">' + r.row + '</span>' + r.cells.map(function (c) {
            if (c === null) return '<span class="seat-gap seat-gap-full" aria-hidden="true"></span>';
            if (c === 'aisle') return '<span class="seat-gap" aria-hidden="true"></span>';
            var isSold = !!sold[c.id], mine = state.seats.indexOf(c.id) !== -1;
            if (!isSold) free++;
            var label = 'Row ' + c.row + ', seat ' + c.num + (c.wheel ? ', wheelchair space' : '') + (sold[c.id] === 'yours' ? ', booked by you' : (isSold ? ', sold' : ''));
            return '<button type="button" class="seat' + (c.wheel ? ' is-wheel' : '') + (sold[c.id] === 'yours' ? ' is-held' : '') + '" data-seat="' + c.id + '" aria-pressed="' + mine + '" data-num="' + c.num + '" aria-label="' + label + '"' + (isSold ? ' disabled' : '') + ' tabindex="-1"></button>';
          }).join('') + '<span class="seat-label" aria-hidden="true">' + r.row + '</span></div>';
        }).join('') + '</div>';
      $('[data-seats-free]', form).textContent = plural(free, 'seat') + ' left of ' + SEATS.total;
      // On narrow screens the map scrolls sideways: start in the middle, facing the screen.
      var scroller = seatMap.closest('[data-seat-scroller]');
      if (scroller && scroller.scrollWidth > scroller.clientWidth && !scroller.scrollLeft) scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) / 2;
      var focusable = $('.seat[aria-pressed="true"]', seatMap) || $('.seat:not(:disabled)', seatMap);
      if (focusable) focusable.tabIndex = 0;
      updateSeatStatus();
    }
    function updateSeatStatus(msg) {
      var need = ticketCount(), have = seatCount();
      var text = msg || (need === 0 ? 'Add tickets first, then pick ' + 'your seats.' : (have === need ? 'All ' + plural(need, 'seat') + ' chosen: ' + state.seats.join(', ') + '.' : 'Choose ' + plural(need - have, 'more seat') + ' (' + have + ' of ' + need + ' chosen).'));
      seatStatus.textContent = text;
    }
    function toggleSeat(id) {
      var at = state.seats.indexOf(id);
      if (at !== -1) state.seats.splice(at, 1);
      else {
        if (ticketCount() === 0) { state.tickets.adult = 1; updateSteppers(); }
        if (seatCount() >= ticketCount()) {
          if (ticketCount() >= D.MAX_SEATS) { updateSeatStatus('You can book up to ' + D.MAX_SEATS + ' seats at a time. Deselect a seat first.'); return; }
          state.tickets.adult++;
          updateSteppers();
        }
        state.seats.push(id);
      }
      $$('.seat', seatMap).forEach(function (b) { b.setAttribute('aria-pressed', String(state.seats.indexOf(b.getAttribute('data-seat')) !== -1)); });
      updateSeatStatus();
      renderSummary();
    }
    // Best available: the most central run of free seats, from the middle rows outward.
    function bestSeats() {
      var need = ticketCount() || 2;
      if (!ticketCount()) { state.tickets.adult = 2; updateSteppers(); }
      var sold = soldSeats(state.show);
      var order = [5, 6, 4, 7, 3, 8, 9, 2, 10, 1, 11, 0];
      for (var oi = 0; oi < order.length; oi++) {
        var r = SEATS.rows[order[oi]];
        if (!r) continue;
        var runs = [], run = [];
        r.cells.forEach(function (c, ci) {
          if (c && c !== 'aisle' && !sold[c.id] && !c.wheel) run.push({ id: c.id, ci: ci }); else { if (run.length) runs.push(run); run = []; }
        });
        if (run.length) runs.push(run);
        var best = null, bestScore = Infinity, mid = r.cells.length / 2;
        runs.forEach(function (rn) {
          for (var i = 0; i + need <= rn.length; i++) {
            var center = (rn[i].ci + rn[i + need - 1].ci) / 2;
            var score = Math.abs(center - mid);
            if (score < bestScore) { bestScore = score; best = rn.slice(i, i + need).map(function (x) { return x.id; }); }
          }
        });
        if (best) {
          state.seats = best;
          renderSeats();
          renderSummary();
          updateSeatStatus('Best available: ' + best.join(', ') + '.');
          return;
        }
      }
      updateSeatStatus('We could not find ' + need + ' seats together. Pick them one by one, or call (406) 555-0120.');
    }

    function renderSnacks() {
      snacksBox.innerHTML = addons.map(function (c) {
        return '<li class="flex items-center justify-between gap-4 py-3"><div class="min-w-0"><p class="font-bold" id="sn-' + c.id + '">' + esc(c.name) + ' <span class="font-normal text-muted">' + money(c.price) + '</span></p><p class="text-sm text-muted">' + esc(c.desc) + '</p></div>' +
          '<div class="stepper shrink-0" role="group" aria-labelledby="sn-' + c.id + '"><button type="button" data-snack="' + c.id + '" data-dir="-1" aria-label="Remove one ' + esc(c.name) + '">−</button><output aria-live="polite">0</output><button type="button" data-snack="' + c.id + '" data-dir="1" aria-label="Add one ' + esc(c.name) + '">+</button></div></li>';
      }).join('');
      updateSnacks();
    }
    function updateSnacks() {
      $$('[data-snack]', snacksBox).forEach(function (b) {
        var id = b.getAttribute('data-snack'), dir = +b.getAttribute('data-dir');
        b.disabled = dir < 0 ? state.snacks[id] === 0 : state.snacks[id] >= 9;
        b.parentNode.querySelector('output').textContent = state.snacks[id];
      });
    }

    function totals() {
      var lines = [], sum = 0;
      Object.keys(state.tickets).forEach(function (t) {
        var n = state.tickets[t];
        if (!n) return;
        var each = priceFor(t, state.show);
        lines.push({ label: n + ' × ' + D.TICKET_TYPES[t].label, amount: n * each });
        sum += n * each;
      });
      Object.keys(state.snacks).forEach(function (id) {
        var n = state.snacks[id];
        if (!n) return;
        lines.push({ label: n + ' × ' + ADDON_BY_ID[id].name, amount: n * ADDON_BY_ID[id].price });
        sum += n * ADDON_BY_ID[id].price;
      });
      return { lines: lines, total: sum };
    }
    function renderSummary() {
      if (!summary || !state.show) return;
      var s = state.show, f = FILMS[s.film], t = totals();
      $('[data-sum-film]', summary).textContent = f.title;
      $('[data-sum-when]', summary).textContent = longDate(s.day) + ' at ' + fmtTime(s.start);
      $('[data-sum-seats]', summary).textContent = state.seats.length ? state.seats.join(', ') : 'No seats chosen yet';
      $('[data-sum-lines]', summary).innerHTML = t.lines.length ? t.lines.map(function (l) {
        return '<li class="flex justify-between gap-4"><span>' + esc(l.label) + '</span><span class="tabular-nums">' + money(l.amount) + '</span></li>';
      }).join('') : '<li class="text-muted">No tickets yet</li>';
      $('[data-sum-total]', summary).textContent = money(t.total);
      $('[data-sum-tags]', summary).innerHTML = tagList(s.tags);
    }

    // Arrow keys move between seats (one tab stop for the whole map).
    seatMap.addEventListener('keydown', function (e) {
      var cur = e.target.closest('.seat');
      if (!cur || ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].indexOf(e.key) === -1) return;
      e.preventDefault();
      var rowsEls = $$('.seat-row', seatMap);
      var rowEl = cur.closest('.seat-row'), ri = rowsEls.indexOf(rowEl);
      var cells = function (el) { return $$('.seat:not(:disabled)', el); };
      var target = null;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        var list = cells(rowEl), i = list.indexOf(cur);
        target = list[i + (e.key === 'ArrowLeft' ? -1 : 1)];
      } else if (e.key === 'Home') target = cells(rowEl)[0];
      else if (e.key === 'End') { var l2 = cells(rowEl); target = l2[l2.length - 1]; }
      else {
        var x = cur.getBoundingClientRect().left;
        for (var k = ri + (e.key === 'ArrowUp' ? -1 : 1); k >= 0 && k < rowsEls.length && !target; k += (e.key === 'ArrowUp' ? -1 : 1)) {
          var best = null, dist = Infinity;
          cells(rowsEls[k]).forEach(function (b) { var d = Math.abs(b.getBoundingClientRect().left - x); if (d < dist) { dist = d; best = b; } });
          target = best;
        }
      }
      if (target) { cur.tabIndex = -1; target.tabIndex = 0; target.focus(); }
    });

    form.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b || b.disabled) return;
      if (b.hasAttribute('data-show')) {
        var sid = b.getAttribute('data-show');
        if (has(SHOW_BY_ID, sid)) selectShow(SHOW_BY_ID[sid]);
      } else if (b.hasAttribute('data-step')) {
        var t = b.getAttribute('data-step');
        if (!has(state.tickets, t)) return;
        state.tickets[t] = clamp(state.tickets[t] + (+b.getAttribute('data-dir')), 0, D.MAX_SEATS);
        while (seatCount() > ticketCount()) state.seats.pop();
        updateSteppers();
        $$('.seat', seatMap).forEach(function (s) { s.setAttribute('aria-pressed', String(state.seats.indexOf(s.getAttribute('data-seat')) !== -1)); });
        updateSeatStatus();
        renderSummary();
      } else if (b.hasAttribute('data-seat')) {
        $$('.seat', seatMap).forEach(function (s) { s.tabIndex = -1; });
        b.tabIndex = 0;
        toggleSeat(b.getAttribute('data-seat'));
      } else if (b.hasAttribute('data-best-seats')) {
        bestSeats();
      } else if (b.hasAttribute('data-snack')) {
        var id = b.getAttribute('data-snack');
        if (!has(state.snacks, id)) return;
        state.snacks[id] = clamp(state.snacks[id] + (+b.getAttribute('data-dir')), 0, 9);
        updateSnacks();
        renderSummary();
      }
    });
    filmSelect.addEventListener('change', function () {
      var list = bookable(filmSelect.value);
      if (list.length) selectShow(list[0]);
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(form);
      var errors = [];
      if (!state.show || isPast(state.show)) errors.push(['bk-film', 'This screening has started. Please choose another.']);
      if (ticketCount() === 0) errors.push(['bk-tickets', 'Add at least one ticket.']);
      else if (seatCount() !== ticketCount()) errors.push(['bk-seats', 'Choose ' + plural(ticketCount(), 'seat') + ' to match your tickets (you have ' + seatCount() + ').']);
      var name = $('#bk-name', form), email = $('#bk-email', form), member = $('#bk-member', form);
      if (!name.value.trim()) errors.push(['bk-name', 'Please enter the name for the booking.']);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) errors.push(['bk-email', 'Please enter an email address like you@example.com.']);
      if (state.tickets.member > 0 && !/^GM-\d{5}$/i.test(member.value.trim())) errors.push(['bk-member', 'Member numbers look like GM-40213 and are on your card.']);
      if (errors.length) { showErrors(form, errors); return; }

      // To take real bookings, send the booking to your ticketing system here (e.g. fetch() to
      // your box-office API) and show the confirmation only when it answers OK.
      var ref = 'GT-' + Math.random().toString(36).slice(2, 6).toUpperCase().replace(/[^A-Z0-9]/g, 'X').padEnd(4, 'X') + '-' + String(Math.floor(Math.random() * 90) + 10);
      var t = totals();
      var booking = { ref: ref, show: state.show.id, seats: state.seats.slice(), tickets: {}, snacks: {}, total: t.total, name: name.value.trim().slice(0, 60), made: Date.now() };
      Object.keys(state.tickets).forEach(function (k) { if (state.tickets[k]) booking.tickets[k] = state.tickets[k]; });
      Object.keys(state.snacks).forEach(function (k) { if (state.snacks[k]) booking.snacks[k] = state.snacks[k]; });
      var list = getBookings();
      list.unshift(booking);
      saveBookings(list);
      showConfirmation(booking);
      Object.keys(state.tickets).forEach(function (k) { state.tickets[k] = 0; });
      Object.keys(state.snacks).forEach(function (k) { state.snacks[k] = 0; });
      state.seats = [];
      updateSteppers();
      updateSnacks();
      renderSeats();
      renderSummary();
      renderMyBookings();
    });

    function showConfirmation(b) {
      var box = $('[data-confirmation]');
      if (!box) return;
      var s = SHOW_BY_ID[b.show], f = FILMS[s.film];
      var first = b.name.split(/\s+/)[0];
      box.hidden = false;
      box.innerHTML = '<div class="stub grid gap-6 p-6 sm:grid-cols-[1fr_auto] sm:p-8"><div><p class="eyebrow">Seats held</p>' +
        '<h2 class="deco-title mt-3 text-3xl" tabindex="-1" id="confirm-title">Thank you, ' + esc(first) + '. Enjoy the show.</h2>' +
        '<p class="mt-3 text-muted">Your seats for <strong class="text-ink">' + esc(f.title) + '</strong> on ' + esc(longDate(s.day)) + ' at ' + fmtTime(s.start) + ' are held under reference <strong class="text-ink">' + esc(b.ref) + '</strong>.</p>' +
        '<p class="mt-3 text-muted">Seats ' + esc(b.seats.join(', ')) + ' · total ' + money(b.total) + '. Give your reference at the box office from 30 minutes before the show; we take cards and cash there. Held seats are released 10 minutes before the film starts.</p></div>' +
        '<div class="flex flex-col items-center justify-center gap-2 border-t border-dashed border-brass/60 pt-5 sm:border-l sm:border-t-0 sm:pl-8 sm:pt-0"><p class="text-xs font-bold uppercase tracking-widest text-muted">Reference</p><p class="font-display text-3xl text-garnet">' + esc(b.ref) + '</p>' +
        '<button type="button" class="btn btn-outline btn-sm mt-2" data-booking-ics="' + esc(b.ref) + '">Add to calendar</button></div></div>';
      var h = $('#confirm-title', box);
      box.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      if (h) h.focus({ preventScroll: true });
    }
    function renderMyBookings() {
      var box = $('[data-my-bookings]');
      if (!box) return;
      var list = getBookings();
      var wrap = $('[data-my-bookings-wrap]');
      if (wrap) wrap.hidden = list.length === 0;
      box.innerHTML = list.map(function (b) {
        var s = SHOW_BY_ID[b.show], f = FILMS[s.film];
        return '<li class="card flex flex-wrap items-center gap-4 p-4"><div class="poster w-12 shrink-0" data-poster="' + s.film + '" data-decorative></div><div class="min-w-0 flex-1"><p class="font-bold">' + esc(f.title) + '</p>' +
          '<p class="text-sm text-muted">' + esc(shortDate(s.day)) + ', ' + fmtTime(s.start) + ' · ' + plural(b.seats.length, 'seat') + ' (' + esc(b.seats.join(', ')) + ') · ' + money(b.total) + '</p></div>' +
          '<p class="font-display text-lg text-garnet">' + esc(b.ref) + '</p><div class="flex gap-2"><button type="button" class="btn btn-outline btn-sm" data-booking-ics="' + esc(b.ref) + '">Calendar</button><button type="button" class="btn btn-outline btn-sm" data-cancel="' + esc(b.ref) + '">Cancel<span class="sr-only"> booking ' + esc(b.ref) + '</span></button></div></li>';
      }).join('');
      hydrateArt(box);
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-cancel],[data-booking-ics]') : null;
      if (!b) return;
      var ref = b.getAttribute('data-cancel') || b.getAttribute('data-booking-ics');
      var list = getBookings();
      var found = list.filter(function (x) { return x.ref === ref; })[0];
      if (!found) return;
      if (b.hasAttribute('data-cancel')) {
        saveBookings(list.filter(function (x) { return x.ref !== ref; }));
        toast('Booking ' + ref + ' canceled');
        renderMyBookings();
        if (state.show && state.show.id === found.show) renderSeats();
      } else {
        var s = SHOW_BY_ID[found.show];
        download(found.ref + '.ics', icsFor(FILMS[s.film].title + ' at The Garnet (' + found.ref + ')', s.day, s.start, s.end, THEATER.address, 'Seats ' + found.seats.join(', ') + '. Reference ' + found.ref + '.'), 'text/calendar;charset=utf-8');
      }
    });

    renderSnacks();
    if (start) selectShow(start);
    renderMyBookings();
  }

  /* ------------------------------------------------------------------
   * 12. Membership: monthly/annual switch and the join form
   *     URL: ?billing=annual &tier=projectionist
   * ------------------------------------------------------------------ */
  function initMembership() {
    var box = $('[data-tiers]');
    if (!box) return;
    var sw = $('[data-billing-switch]');
    var annual = param('billing') === 'annual';
    var tierSelect = $('#jn-tier');
    var M = D.MEMBERSHIP;
    function render() {
      sw.setAttribute('aria-checked', String(annual));
      $$('[data-billing-label]').forEach(function (el) { el.classList.toggle('text-gold', (el.getAttribute('data-billing-label') === 'annual') === annual); });
      box.innerHTML = Object.keys(M).map(function (k) {
        var t = M[k], featured = !!t.featured;
        var price = annual ? t.annual : t.monthly;
        return '<li class="reveal is-visible relative flex flex-col rounded-md p-7 ' + (featured ? 'bg-velvet text-cream shadow-[0_0_0_2px_var(--color-gold),0_30px_60px_-30px_#000] lg:-my-4 lg:py-11' : 'bg-paper text-ink shadow-[var(--shadow-deco)]') + '">' +
          (featured ? '<p class="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-sm bg-gold px-3 py-1 text-[11px] font-extrabold uppercase tracking-[.2em] text-velvet">Most popular</p>' : '') +
          '<h3 class="deco-title text-3xl ' + (featured ? 'text-gold' : 'text-garnet') + '">' + esc(t.name) + '</h3>' +
          '<p class="mt-1 text-sm font-semibold ' + (featured ? 'text-cream/80' : 'text-muted') + '">' + esc(t.tickets) + '</p>' +
          '<p class="mt-6 flex items-baseline gap-1"><span class="font-display text-5xl tabular-nums">' + money(price) + '</span><span class="text-sm ' + (featured ? 'text-cream/80' : 'text-muted') + '">/ ' + (annual ? 'year' : 'month') + '</span></p>' +
          '<p class="mt-1 min-h-5 text-sm ' + (featured ? 'text-gold' : 'text-jade') + '">' + (annual ? 'Two months free: you save ' + money(t.monthly * 12 - t.annual) : 'Or ' + money(t.annual) + ' a year, two months free') + '</p>' +
          '<ul class="mt-6 flex-1 space-y-3 text-[15px]">' + t.perks.map(function (p) {
            return '<li class="flex gap-3"><svg viewBox="0 0 20 20" class="mt-0.5 h-5 w-5 shrink-0 ' + (featured ? 'text-gold' : 'text-garnet') + '" aria-hidden="true"><path d="M10 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6z" fill="currentColor"/></svg><span>' + esc(p) + '</span></li>';
          }).join('') + '</ul>' +
          '<a href="#join" class="btn ' + (featured ? 'btn-brass' : 'btn-garnet') + ' mt-8 w-full" data-choose-tier="' + k + '">Join as ' + esc(t.name) + '</a></li>';
      }).join('');
      var calc = $('[data-member-savings]');
      if (calc) updateSavings();
      updateJoinPrice();
      setParams({ billing: annual ? 'annual' : '' });
    }
    function updateJoinPrice() {
      var out = $('[data-join-price]');
      if (!out || !tierSelect || !has(M, tierSelect.value)) return;
      var t = M[tierSelect.value];
      out.textContent = t.name + ': ' + money(annual ? t.annual : t.monthly) + (annual ? ' a year' : ' a month');
    }
    // "How much would I save?" slider: visits a month × ticket price vs member price.
    function updateSavings() {
      var range = $('#visits'), out = $('[data-member-savings]');
      var visits = clamp(parseInt(range.value, 10) || 0, 0, 12);
      $('[data-visits-out]').textContent = plural(visits, 'visit') + ' a month';
      var adult = D.TICKET_TYPES.adult.price, member = D.TICKET_TYPES.member.price;
      var usherSave = visits * (adult - member) - M.usher.monthly;
      var projSave = Math.min(visits, 2) * adult + Math.max(0, visits - 2) * (adult - member) - M.projectionist.monthly;
      var best = projSave > usherSave ? 'projectionist' : 'usher';
      var saving = Math.max(usherSave, projSave);
      out.innerHTML = saving > 0
        ? 'At ' + plural(visits, 'film') + ' a month, <strong class="text-gold">' + esc(M[best].name) + '</strong> saves you about <strong class="text-gold">' + money(saving) + '</strong> a month on tickets alone.'
        : 'At ' + plural(visits, 'film') + ' a month, membership is about supporting the theater more than saving money, and we are very grateful.';
    }
    sw.addEventListener('click', function () { annual = !annual; render(); });
    $$('[data-billing-label]').forEach(function (el) {
      el.addEventListener('click', function () { annual = el.getAttribute('data-billing-label') === 'annual'; render(); });
    });
    var range = $('#visits');
    if (range) range.addEventListener('input', updateSavings);
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('[data-choose-tier]') : null;
      if (a && tierSelect) { tierSelect.value = a.getAttribute('data-choose-tier'); updateJoinPrice(); }
    });
    if (tierSelect) {
      var pt = param('tier');
      if (has(M, pt)) tierSelect.value = pt;
      tierSelect.addEventListener('change', updateJoinPrice);
    }
    var gift = $('#jn-gift'), giftBox = $('[data-gift-fields]');
    if (gift && giftBox) gift.addEventListener('change', function () { giftBox.hidden = !gift.checked; });
    render();
  }

  /* ------------------------------------------------------------------
   * 13. Events, series and private hire
   * ------------------------------------------------------------------ */
  var EVENTS = D.EVENTS.map(function (e) {
    var out = Object.assign({}, e);
    out.day = dayNum(e.date) + SHIFT;
    if (e.show) {
      var p = e.show.split(' ');
      var sid = ymd(dayNum(p[0]) + SHIFT) + '-' + p[1].replace(':', '');
      out.showId = has(SHOW_BY_ID, sid) ? sid : '';
    }
    return out;
  }).filter(function (e) { return !isNaN(e.day) && has(D.SERIES, e.series); }).sort(function (a, b) { return a.day - b.day || mins(a.start) - mins(b.start); });
  function upcomingEvents() {
    var n = theaterNow();
    return EVENTS.filter(function (e) { return e.day > n.day || (e.day === n.day && mins(e.end) * 60 > n.secs); });
  }
  function eventPrice(e) {
    if (e.showId) {
      var s = SHOW_BY_ID[e.showId];
      return 'Tickets ' + money(priceFor('adult', s)) + ', members ' + money(priceFor('member', s));
    }
    return e.price || '';
  }
  function renderEventList(el, limit, series) {
    if (!el) return 0;
    var list = upcomingEvents().filter(function (e) { return !series || e.series === series; });
    if (limit) list = list.slice(0, limit);
    el.innerHTML = list.length ? list.map(function (e) {
      var sr = D.SERIES[e.series];
      var action = e.showId && !isPast(SHOW_BY_ID[e.showId])
        ? '<a class="btn btn-garnet btn-sm" href="tickets.html?show=' + e.showId + '">Book seats<span class="sr-only"> for ' + esc(e.title) + '</span></a>'
        : '<button type="button" class="btn btn-outline btn-sm" data-event-ics="' + esc(e.id) + '">Add to calendar<span class="sr-only">: ' + esc(e.title) + '</span></button>';
      return '<li class="card reveal grid grid-cols-[4.5rem_1fr] gap-5 p-5 sm:grid-cols-[5.5rem_1fr_auto] sm:items-center sm:p-6">' +
        '<div class="rounded-sm bg-velvet py-3 text-center text-cream ring-1 ring-brass"><p class="text-[11px] font-bold uppercase tracking-[.2em] text-gold">' + esc(fmtDay(e.day, { month: 'short' })) + '</p><p class="font-display text-3xl leading-none">' + fmtDay(e.day, { day: 'numeric' }) + '</p><p class="mt-1 text-[11px] font-semibold uppercase tracking-wider">' + esc(fmtDay(e.day, { weekday: 'short' })) + '</p></div>' +
        '<div class="min-w-0"><p class="text-xs font-bold uppercase tracking-[.18em] text-brass-deep">' + esc(sr.name) + '</p><h3 class="mt-1 text-lg font-bold leading-snug">' + esc(e.title) + '</h3>' +
        '<p class="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted"><span class="inline-flex items-center gap-1.5">' + ICON.clock + fmtTime(mins(e.start)) + '–' + fmtTime(mins(e.end)) + '</span><span class="inline-flex items-center gap-1.5">' + ICON.pin + esc(e.place) + '</span><span class="inline-flex items-center gap-1.5">' + ICON.ticket + esc(eventPrice(e)) + '</span></p>' +
        '<p class="mt-2 text-[15px] leading-relaxed text-ink/85">' + esc(e.summary) + '</p></div><div class="col-span-2 sm:col-span-1">' + action + '</div></li>';
    }).join('') : '<li class="card px-6 py-10 text-center text-muted">No events in this series right now. The next season is announced in the members’ newsletter.</li>';
    reveal(el);
    return list.length;
  }
  document.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('[data-event-ics]') : null;
    if (!b) return;
    var e = EVENTS.filter(function (x) { return x.id === b.getAttribute('data-event-ics'); })[0];
    if (e) download(e.id + '.ics', icsFor(e.title, e.day, mins(e.start), mins(e.end), e.place + ', ' + THEATER.address, e.summary), 'text/calendar;charset=utf-8');
  });

  function initEvents() {
    var list = $('[data-event-list]');
    if (!list) return;
    var seriesBox = $('[data-series-list]');
    if (seriesBox) {
      seriesBox.innerHTML = Object.keys(D.SERIES).map(function (k) {
        var s = D.SERIES[k];
        var count = upcomingEvents().filter(function (e) { return e.series === k; }).length;
        return '<li class="card reveal flex flex-col overflow-hidden"><div class="aspect-[16/10] overflow-hidden border-b border-brass/50" data-series-art="' + k + '"></div><div class="flex flex-1 flex-col p-6">' +
          '<h3 class="deco-title text-2xl text-garnet">' + esc(s.name) + '</h3><p class="mt-1 text-sm font-semibold text-brass-deep">' + esc(s.when) + '</p><p class="mt-3 flex-1 text-[15px] leading-relaxed text-ink/85">' + esc(s.blurb) + '</p>' +
          '<button type="button" class="mt-5 inline-flex items-center gap-2 self-start font-bold text-garnet underline-offset-4 hover:underline" data-series-pick="' + k + '">' + (count ? 'See ' + plural(count, 'upcoming event') : 'See the series') + ICON.arrow + '</button></div></li>';
      }).join('');
      hydrateArt(seriesBox);
    }
    var filters = $('[data-event-filters]');
    var current = has(D.SERIES, param('series')) ? param('series') : '';
    filters.innerHTML = '<button type="button" class="chip" data-series="" aria-pressed="false">Everything</button>' + Object.keys(D.SERIES).map(function (k) {
      return '<button type="button" class="chip" data-series="' + k + '" aria-pressed="false">' + esc(D.SERIES[k].name) + '</button>';
    }).join('');
    function render() {
      $$('[data-series]', filters).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-series') === current)); });
      var n = renderEventList(list, 0, current);
      $('[data-event-count]').textContent = plural(n, 'upcoming event') + (current ? ' in ' + D.SERIES[current].name : '');
      setParams({ series: current });
    }
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('[data-series]');
      if (!b) return;
      current = has(D.SERIES, b.getAttribute('data-series')) ? b.getAttribute('data-series') : '';
      render();
    });
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-series-pick]') : null;
      if (!b) return;
      current = b.getAttribute('data-series-pick');
      render();
      $('#calendar').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    render();
    initHire();
  }

  function initHire() {
    var form = $('[data-hire]');
    if (!form) return;
    var H = D.HIRE;
    var type = $('#hr-type', form), guests = $('#hr-guests', form), hours = $('#hr-hours', form);
    type.innerHTML = Object.keys(H.types).map(function (k) { return '<option value="' + k + '">' + esc(H.types[k].label) + '</option>'; }).join('');
    guests.max = String(THEATER.seats);
    $$('[data-hire-seats]').forEach(function (el) { el.textContent = String(THEATER.seats); });
    $('[data-hire-addons]', form).innerHTML = Object.keys(H.addons).map(function (k) {
      var a = H.addons[k];
      return '<label class="flex cursor-pointer items-start gap-3 rounded-md bg-paper p-3 ring-1 ring-ink/15 hover:ring-garnet"><input type="checkbox" class="check mt-0.5" name="addon" value="' + k + '"><span><span class="block font-semibold">' + esc(a.label) + '</span><span class="text-sm text-muted">' + (a.perGuest ? money(a.perGuest) + ' per guest' : money(a.price)) + '</span></span></label>';
    }).join('');
    var date = $('#hr-date', form);
    if (date) date.min = ymd(TODAY + 14);
    function quote() {
      var t = has(H.types, type.value) ? H.types[type.value] : H.types.birthday;
      var g = clamp(parseInt(guests.value, 10) || 0, 0, THEATER.seats);
      var h = clamp(parseInt(hours.value, 10) || H.minHours, H.minHours, H.maxHours);
      var lines = [[h + ' hours × ' + money(t.rate), h * t.rate]];
      $$('input[name="addon"]:checked', form).forEach(function (c) {
        if (!has(H.addons, c.value)) return;
        var a = H.addons[c.value];
        lines.push([a.label + (a.perGuest ? ' (' + plural(g, 'guest') + ')' : ''), a.perGuest ? a.perGuest * g : a.price]);
      });
      var total = lines.reduce(function (s, l) { return s + l[1]; }, 0);
      $('[data-hours-out]', form).textContent = plural(h, 'hour');
      $('[data-quote-lines]', form).innerHTML = lines.map(function (l) { return '<li class="flex justify-between gap-4"><span>' + esc(l[0]) + '</span><span class="tabular-nums">' + money(l[1]) + '</span></li>'; }).join('');
      $('[data-quote-total]', form).textContent = money(total);
      $('[data-quote-per]', form).textContent = g > 0 ? 'About ' + money(Math.round((total / g) * 100) / 100) + ' per guest' : 'Add your guest count for a per-guest price';
      var lineInputs = $$('[data-board-input]', form);
      var hasMarquee = !!$('input[name="addon"][value="marquee"]:checked', form);
      var preview = $('[data-hire-board]');
      if (preview) {
        var lines2 = lineInputs.map(function (i) { return i.value.trim(); }).filter(Boolean);
        if (!lines2.length) lines2 = ['Happy birthday', 'Ruthie'];
        preview.innerHTML = boardLine('The Garnet', true) + lines2.map(function (l) { return boardLine(l); }).join('');
        preview.setAttribute('aria-label', 'Marquee preview: ' + lines2.join(', '));
        var note = $('[data-board-note]');
        if (note) note.textContent = hasMarquee ? 'Included in your quote.' : 'Add “Your message on the marquee” to include it.';
      }
      return { total: total, hours: h, guests: g };
    }
    form.addEventListener('input', quote);
    form.addEventListener('change', quote);
    $$('[data-hours-step]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        hours.value = String(clamp((parseInt(hours.value, 10) || H.minHours) + (+b.getAttribute('data-hours-step')), H.minHours, H.maxHours));
        quote();
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      clearErrors(form);
      var errors = [];
      var name = $('#hr-name', form), email = $('#hr-email', form);
      var g = parseInt(guests.value, 10);
      if (!name.value.trim()) errors.push(['hr-name', 'Please tell us your name.']);
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) errors.push(['hr-email', 'Please enter an email address like you@example.com.']);
      if (!(g >= 1 && g <= THEATER.seats)) errors.push(['hr-guests', 'Guests must be between 1 and ' + THEATER.seats + '.']);
      var dn = dayNum(date.value);
      if (isNaN(dn) || dn < TODAY + 14) errors.push(['hr-date', 'Please pick a date at least two weeks from today.']);
      if (errors.length) { showErrors(form, errors); return; }
      var q = quote();
      // Connect a real endpoint here (e.g. Formspree: fetch(form.action, { method: 'POST', body: new FormData(form) }))
      // and show the success state only when it answers OK.
      var ref = 'GH-' + String(1000 + Math.floor(Math.random() * 9000));
      finishForm(form, '<p class="font-display text-2xl text-garnet">Thanks, ' + esc(name.value.trim().split(/\s+/)[0]) + '. Your request is in.</p>' +
        '<p class="mt-2">Reference <strong>' + ref + '</strong>: ' + esc(H.types[type.value] ? H.types[type.value].label : 'Private hire') + ' for ' + plural(q.guests, 'guest') + ' on ' + esc(longDate(dn)) + ', estimated ' + money(q.total) + '.</p>' +
        '<p class="mt-2 text-muted">Hedda or Winnifred will check the program and reply within two business days with availability and a hold on the date. Questions sooner? Call (406) 555-0123.</p>');
    });
    quote();
  }

  /* ------------------------------------------------------------------
   * 14. Visit: hours table and concessions menu
   * ------------------------------------------------------------------ */
  function initVisit() {
    var table = $('[data-hours]');
    if (table) {
      var today = weekday(TODAY);
      var order = [1, 2, 3, 4, 5, 6, 0];
      table.innerHTML = order.map(function (wd) {
        var h = D.HOURS.filter(function (x) { return x.day === wd; })[0];
        var name = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][wd];
        var isToday = wd === today;
        return '<tr class="' + (isToday ? 'bg-gold/25 font-bold' : '') + '"><th scope="row" class="border-b border-brass/30 py-3 pl-4 pr-6 text-left font-semibold">' + name + (isToday ? ' <span class="tag tag-event ml-1">Today</span>' : '') + '</th>' +
          '<td class="border-b border-brass/30 py-3 pr-4 text-right tabular-nums">' + (h ? fmtTime(mins(h.open)) + ' – ' + fmtTime(mins(h.close)) : 'Closed') + '</td></tr>';
      }).join('');
    }
    var menu = $('[data-menu]');
    if (!menu) return;
    var filters = $('[data-diet-filters]');
    var diet = has(D.DIETS, param('diet')) ? param('diet') : '';
    filters.innerHTML = '<button type="button" class="chip" data-diet="" aria-pressed="false">Everything</button>' + Object.keys(D.DIETS).map(function (k) {
      return '<button type="button" class="chip" data-diet="' + k + '" aria-pressed="false">' + esc(D.DIETS[k]) + '</button>';
    }).join('');
    function render() {
      $$('[data-diet]', filters).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-diet') === diet)); });
      var groups = [];
      D.CONCESSIONS.forEach(function (c) {
        if (diet && c.diet.indexOf(diet) === -1 && !(diet === 'v' && c.diet.indexOf('vg') !== -1)) return;
        var g = groups.filter(function (x) { return x.name === c.group; })[0];
        if (!g) { g = { name: c.group, items: [] }; groups.push(g); }
        g.items.push(c);
      });
      var count = groups.reduce(function (n, g) { return n + g.items.length; }, 0);
      $('[data-menu-count]').textContent = plural(count, 'item') + (diet ? ' marked ' + D.DIETS[diet].toLowerCase() : ' on the menu');
      menu.innerHTML = groups.map(function (g) {
        return '<div class="break-inside-avoid pb-8"><h3 class="deco-title border-b border-brass/60 pb-2 text-2xl text-gold">' + esc(g.name) + '</h3><ul class="mt-3 space-y-4">' + g.items.map(function (c) {
          return '<li><p class="flex items-baseline gap-3 font-bold text-cream"><span>' + esc(c.name) + '</span><span class="flex-1 border-b border-dotted border-brass/50" aria-hidden="true"></span><span class="tabular-nums text-gold">' + money(c.price) + '</span></p>' +
            '<p class="mt-0.5 text-sm text-cream/75">' + esc(c.desc) + (c.diet.length ? ' <span class="whitespace-nowrap font-semibold text-cream/90">(' + c.diet.map(function (d) { return d.toUpperCase(); }).join(', ') + ')</span>' : '') + '</p></li>';
        }).join('') + '</ul></div>';
      }).join('');
      setParams({ diet: diet });
    }
    filters.addEventListener('click', function (e) {
      var b = e.target.closest('[data-diet]');
      if (!b) return;
      diet = has(D.DIETS, b.getAttribute('data-diet')) ? b.getAttribute('data-diet') : '';
      render();
    });
    render();
  }

  /* ------------------------------------------------------------------
   * 15. Forms: inline errors, success states
   *     The demo forms finish in the browser. To connect a real backend,
   *     post the form (e.g. Formspree: fetch('https://formspree.io/f/<id>',
   *     { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } }))
   *     and call finishForm() only when the response is OK.
   * ------------------------------------------------------------------ */
  function clearErrors(form) {
    $$('[aria-invalid="true"]', form).forEach(function (el) { el.removeAttribute('aria-invalid'); el.removeAttribute('aria-describedby'); });
    $$('.field-error[data-generated]', form).forEach(function (el) { el.remove(); });
    $$('[data-error-for]', form).forEach(function (el) { el.textContent = ''; });
  }
  function showErrors(form, errors) {
    var firstFocus = null;
    errors.forEach(function (pair) {
      var el = document.getElementById(pair[0]);
      var slot = $('[data-error-for="' + pair[0] + '"]', form);
      if (slot) slot.textContent = pair[1];
      if (el && /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName)) {
        el.setAttribute('aria-invalid', 'true');
        if (!slot) {
          var p = document.createElement('p');
          p.className = 'field-error';
          p.id = pair[0] + '-error';
          p.setAttribute('data-generated', '');
          p.textContent = pair[1];
          el.insertAdjacentElement('afterend', p);
          el.setAttribute('aria-describedby', p.id);
        } else if (slot.id) el.setAttribute('aria-describedby', slot.id);
        if (!firstFocus) firstFocus = el;
      } else if (!firstFocus && (slot || el)) firstFocus = slot || el;
    });
    var status = $('[data-form-status]', form);
    if (status) status.textContent = 'Please fix ' + plural(errors.length, 'thing') + ' above.';
    if (firstFocus) {
      if (firstFocus.focus && /^(INPUT|SELECT|TEXTAREA)$/.test(firstFocus.tagName)) firstFocus.focus();
      else firstFocus.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    }
  }
  function finishForm(form, html) {
    var box = document.createElement('div');
    box.className = 'rounded-md bg-paper p-6 text-ink shadow-[var(--shadow-deco)]';
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.innerHTML = html;
    form.replaceWith(box);
    box.focus();
  }

  function initForms() {
    $$('form[data-form]').forEach(function (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        clearErrors(form);
        var errors = [];
        $$('[required]', form).forEach(function (el) {
          var v = el.type === 'checkbox' ? el.checked : el.value.trim();
          if (!v) errors.push([el.id, (el.getAttribute('data-label') || 'This field') + ' is required.']);
          else if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(el.value.trim())) errors.push([el.id, 'Please enter an email address like you@example.com.']);
          else if (el.hasAttribute('data-zip') && !/^\d{5}$/.test(el.value.trim())) errors.push([el.id, 'Please enter a five-digit ZIP code.']);
        });
        if (errors.length) { showErrors(form, errors); return; }
        var kind = form.getAttribute('data-form');
        var nameEl = $('[name="name"]', form);
        var first = nameEl && nameEl.value.trim() ? esc(nameEl.value.trim().split(/\s+/)[0]) : '';
        if (kind === 'join') {
          var tierKey = $('#jn-tier', form).value;
          var tier = has(D.MEMBERSHIP, tierKey) ? D.MEMBERSHIP[tierKey] : D.MEMBERSHIP.usher;
          var annual = $('[data-billing-switch]') && $('[data-billing-switch]').getAttribute('aria-checked') === 'true';
          var gift = $('#jn-gift', form) && $('#jn-gift', form).checked;
          var num = 'GM-' + String(40000 + Math.floor(Math.random() * 59999));
          finishForm(form, '<p class="font-display text-2xl text-garnet">Welcome to The Garnet' + (first ? ', ' + first : '') + '.</p>' +
            '<p class="mt-2">' + (gift ? 'Your gift membership' : 'Your membership') + ': <strong>' + esc(tier.name) + '</strong>, ' + money(annual ? tier.annual : tier.monthly) + (annual ? ' a year' : ' a month') + '. Member number <strong>' + num + '</strong>.</p>' +
            '<p class="mt-2 text-muted">Member prices work from your next visit: give your number at the box office or when booking online. Your card and welcome letter go in the mail within five business days. We’ll set up payment with you by phone from (406) 555-0125.</p>');
        } else {
          finishForm(form, '<p class="font-display text-xl text-garnet">You’re on the list' + (first ? ', ' + first : '') + '.</p><p class="mt-1 text-muted">The Garnet Gazette arrives every Tuesday with the coming week’s program. Unsubscribe from any issue in one click.</p>');
        }
      });
    });
  }

  /* ------------------------------------------------------------------
   * 16. Boot
   * ------------------------------------------------------------------ */
  initChrome();
  hydrateArt(document);
  initHome();
  initWhatsOn();
  initFilm();
  initTickets();
  initMembership();
  initEvents();
  initVisit();
  initForms();
  syncWatch();
  reveal(document);
})();
