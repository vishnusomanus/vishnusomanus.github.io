/* Larchmere Books — site script for the Spine template
 * Vanilla JavaScript, no dependencies. The catalog, events, clubs and finder questions live in
 * assets/js/data.js (window.LARCHMERE). Sections:
 *  1. Shop settings: address, hours, holidays, shipping, demo dates
 *  2. Helpers and saved data (safeStorage)
 *  3. Shop clock: Burlington time, holidays, open/closed
 *  4. Keeping the demo current (KEEP_DEMO_CURRENT)
 *  5. Books: lookups, availability, prices
 *  6. Artwork: covers, spines and the shelf, drawn as SVG from the data
 *  7. Events and book clubs: dates by rule
 *  8. The bag (localStorage)
 *  9. Header, menu, reveal, toast, open/closed status
 * 10. Book cards and lists
 * 11. Pages: home, shop, book, bag, events, clubs, finder, visit
 * 12. Forms and start
 * Add ?now=2026-12-24T14:00 to any page to preview another moment (Burlington time).
 */
(function () {
  'use strict';

  const DATA = window.LARCHMERE || {};
  const GENRES = DATA.GENRES || {};
  const FORMATS = DATA.FORMATS || {};
  const STAFF = DATA.STAFF || {};
  const BOOKS = DATA.BOOKS || [];
  const EVENT_TYPES = DATA.EVENT_TYPES || {};
  const EVENTS = DATA.EVENTS || [];
  const STORY_TIME = DATA.STORY_TIME || null;
  const STORY_THEMES = DATA.STORY_THEMES || [];
  const CLUBS = DATA.CLUBS || [];
  const QUIZ = DATA.QUIZ || [];

  /* ------------------------------------------------------------------
   * 1. Shop settings — edit these to make the template yours.
   *    Every time is in TIMEZONE, so a visitor elsewhere still sees the
   *    shop's own clock.
   * ------------------------------------------------------------------ */
  const SHOP = {
    name: 'Larchmere Books',
    address: '112 Maple Street, Burlington, VT 05401',
    phone: '(802) 555-0154',
    email: 'hello@larchmerebooks.example'
  };
  const TIMEZONE = 'America/New_York';
  const LOCALE = 'en-US';

  // Shop and café hours, Sunday first: ['open', 'close'] in 24-hour time, or null when closed.
  const HOURS = [['10:00', '18:00'], ['09:00', '20:00'], ['09:00', '20:00'], ['09:00', '20:00'], ['09:00', '20:00'], ['09:00', '21:00'], ['09:00', '21:00']];
  const CAFE_HOURS = [['09:00', '16:00'], ['07:30', '17:00'], ['07:30', '17:00'], ['07:30', '17:00'], ['07:30', '17:00'], ['07:30', '17:00'], ['08:00', '17:00']];

  // US holidays, worked out for any year by rule. hours: null = closed all day, or the shorter
  // ['open', 'close'] for that day. Rules: { month, day } for a fixed date, or { month, weekday, nth }
  // for "the nth weekday" (nth: -1 = the last one in the month). weekday: 0 = Sunday … 6 = Saturday.
  const HOLIDAYS = [
    { name: 'New Year’s Day', month: 1, day: 1, hours: null },
    { name: 'Memorial Day', month: 5, weekday: 1, nth: -1, hours: ['11:00', '16:00'] },
    { name: 'Independence Day', month: 7, day: 4, hours: null },
    { name: 'Labor Day', month: 9, weekday: 1, nth: 1, hours: ['11:00', '16:00'] },
    { name: 'Thanksgiving', month: 11, weekday: 4, nth: 4, hours: null },
    { name: 'Christmas Eve', month: 12, day: 24, hours: ['09:00', '15:00'] },
    { name: 'Christmas Day', month: 12, day: 25, hours: null },
    { name: 'New Year’s Eve', month: 12, day: 31, hours: ['09:00', '16:00'] }
  ];
  // One-off closures or short days for a single date: { 'YYYY-MM-DD': { name, hours } }.
  const CLOSURES = {};

  // Demo dates. Author events and recent publication dates are real dates written relative to
  // DEMO_ANCHOR. While KEEP_DEMO_CURRENT is true they move forward in whole weeks (so weekdays never
  // change) and the demo always has new releases and upcoming readings. Set it to false once you
  // enter your real dates: past events then drop off on their own.
  const KEEP_DEMO_CURRENT = true;
  const DEMO_ANCHOR = '2026-10-21';
  // Books published up to this many days before DEMO_ANCHOR move with it (older ones keep their dates).
  const DEMO_RECENT_DAYS = 70;

  const NEW_RELEASE_DAYS = 60;      // "New" for this many days after publication
  const MAX_QTY = 5;                // copies of one book in one format per online order
  const TAX_RATE = 0.07;            // Vermont sales tax (6%) plus Burlington's 1% local option
  const SHIPPING = {
    flat: 499,                      // cents, per order
    freeFrom: 4500,                 // books subtotal for free shipping
    packDays: 1,                    // business days to pack books we have on the shelf
    transit: [3, 6]                 // business days in the mail
  };
  const ORDER_IN_DAYS = [3, 5];     // business days to get a book we don't have on the shelf
  const PICKUP_READY_MINS = 60;     // shelf copies are ready this long after ordering, in open hours
  const EVENT_HORIZON_DAYS = 70;    // how far ahead the events calendar looks
  const RSVP_MAX = 4;               // seats per RSVP

  const PRICE_BANDS = {
    under20: { label: 'Under $20', min: 0, max: 1999 },
    '20to30': { label: '$20 to $30', min: 2000, max: 3000 },
    over30: { label: 'Over $30', min: 3001, max: 1e9 }
  };
  const SORTS = { featured: 'Booksellers’ order', newest: 'Newest first', 'price-asc': 'Price: low to high', 'price-desc': 'Price: high to low', title: 'Title: A to Z', author: 'Author: A to Z' };

  /* ------------------------------------------------------------------
   * 2. Helpers and saved data
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const has = (obj, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 2800 → "$28.00"
  const money = (cents) => '$' + (Math.round(cents) / 100).toFixed(2);
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function listText(items) {
    if (items.length < 2) return items.join('');
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function urlParams() {
    const out = new URLSearchParams();
    new URLSearchParams(location.search).forEach((v, k) => out.append(k.toLowerCase(), v));
    return out;
  }
  function cleanText(value, max) {
    return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '';
  }
  function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13;
    return h >>> 0;
  }
  function reference(prefix, digits) {
    let n = '';
    for (let i = 0; i < digits; i++) n += Math.floor(Math.random() * 10);
    return prefix + '-' + (n[0] === '0' ? '7' + n.slice(1) : n);
  }

  // localStorage, or an in-memory stand-in when the browser blocks it (a sandboxed iframe, strict
  // privacy settings): saved state then lasts for this page view instead of the feature doing nothing.
  const safeStorage = (function () {
    let local = null;
    try { local = window.localStorage; local.getItem('_'); } catch (e) { local = null; /* blocked */ }
    // A save that fails (storage full) stays in memory, and memory is read first, so the change isn't lost.
    const memory = Object.create(null);
    return {
      getItem: (key) => {
        if (key in memory) return memory[key];
        try { return local ? local.getItem(key) : null; } catch (e) { return null; }
      },
      setItem: (key, value) => {
        if (local) {
          try { local.setItem(key, String(value)); delete memory[key]; return; } catch (e) { /* full */ }
        }
        memory[key] = String(value);
      },
      removeItem: (key) => {
        delete memory[key];
        if (local) { try { local.removeItem(key); } catch (e) { /* blocked */ } }
      }
    };
  })();
  const KEYS = { bag: 'spine-bag', lastOrder: 'spine-last-order', rsvps: 'spine-rsvps', clubs: 'spine-clubs', finder: 'spine-finder' };
  function read(key) {
    try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; }
  }
  function write(key, value) {
    try {
      if (value === null) safeStorage.removeItem(key);
      else safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage full: the page keeps working without it */ }
  }

  /* ------------------------------------------------------------------
   * 3. Shop clock. Dates are 'YYYY-MM-DD' strings in TIMEZONE.
   * ------------------------------------------------------------------ */
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const NTH_WORDS = { 1: 'First', 2: 'Second', 3: 'Third', 4: 'Fourth', '-1': 'Last' };
  const pad = (n) => String(n).padStart(2, '0');
  const toMins = (t) => { const p = t.split(':'); return +p[0] * 60 + +p[1]; };
  const isIsoDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + 'T12:00:00Z')) && new Date(s + 'T12:00:00Z').toISOString().slice(0, 10) === s;
  const dayOf = (iso) => new Date(iso + 'T12:00:00Z').getUTCDay();
  const dayNum = (iso) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
  const isoFromDayNum = (n) => new Date(n * 86400000 + 43200000).toISOString().slice(0, 10);
  const addDays = (iso, n) => isoFromDayNum(dayNum(iso) + n);
  // 540 → "9am", 1110 → "6:30pm", 720 → "noon"
  function clock(mins) {
    if (mins === 720) return 'noon';
    const h = Math.floor(mins / 60) % 24, m = mins % 60;
    return (h % 12 || 12) + (m ? ':' + pad(m) : '') + (h < 12 ? 'am' : 'pm');
  }
  // "7–8pm", "6:30–8pm", "10:30–11:15am", "11am–4pm"
  function timeRange(start, end) {
    const a = toMins(start), b = toMins(end);
    const left = clock(a), right = clock(b);
    if ((a < 720) === (b < 720) && a !== 720 && b !== 720) return left.replace(/am|pm/, '') + '–' + right;
    return left + '–' + right;
  }
  const LOADED_AT = Date.now();
  const PREVIEW = (function () {
    const v = urlParams().get('now');
    if (!v || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) || !isIsoDate(v.slice(0, 10))) return null;
    const h = +v.slice(11, 13), m = +v.slice(14, 16);
    return h < 24 && m < 60 ? Date.parse(v + ':00Z') : null;
  })();
  // { date: 'YYYY-MM-DD', day: 0-6, mins: minutes since midnight }, in Burlington time.
  function shopNow() {
    let y, mo, d, h, mi;
    if (PREVIEW !== null) {
      const t = new Date(PREVIEW + (Date.now() - LOADED_AT));
      y = t.getUTCFullYear(); mo = t.getUTCMonth() + 1; d = t.getUTCDate(); h = t.getUTCHours(); mi = t.getUTCMinutes();
    } else {
      const parts = {};
      new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach((p) => { parts[p.type] = p.value; });
      y = +parts.year; mo = +parts.month; d = +parts.day; h = +parts.hour % 24; mi = +parts.minute;
    }
    const date = y + '-' + pad(mo) + '-' + pad(d);
    return { date: date, day: dayOf(date), mins: h * 60 + mi };
  }
  const today = () => shopNow().date;
  function fmtDate(iso, opts) {
    return new Intl.DateTimeFormat(LOCALE, Object.assign({ weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }, opts || {})).format(new Date(iso + 'T12:00:00Z'));
  }
  const shortDate = (iso) => fmtDate(iso, { weekday: 'short', month: 'short' });
  const monthDay = (iso) => fmtDate(iso, { weekday: undefined });

  // The nth weekday of a month (nth -1 = last). month: 1–12.
  function nthWeekday(year, month, weekday, nth) {
    if (nth === -1) {
      const last = new Date(Date.UTC(year, month, 0, 12));
      const back = (last.getUTCDay() - weekday + 7) % 7;
      return last.toISOString().slice(0, 8) + pad(last.getUTCDate() - back);
    }
    const first = new Date(Date.UTC(year, month - 1, 1, 12)).getUTCDay();
    return year + '-' + pad(month) + '-' + pad(1 + ((weekday - first + 7) % 7) + (nth - 1) * 7);
  }
  const holidayCache = Object.create(null);
  // { 'YYYY-MM-DD': { name, hours } } for one year.
  function holidaysIn(year) {
    if (holidayCache[year]) return holidayCache[year];
    const out = Object.create(null);
    HOLIDAYS.forEach((h) => {
      const iso = h.day ? year + '-' + pad(h.month) + '-' + pad(h.day) : nthWeekday(year, h.month, h.weekday, h.nth);
      out[iso] = { name: h.name, hours: h.hours };
    });
    Object.keys(CLOSURES).forEach((iso) => { if (+iso.slice(0, 4) === year) out[iso] = CLOSURES[iso]; });
    holidayCache[year] = out;
    return out;
  }
  function holidayOn(iso) {
    const list = holidaysIn(+iso.slice(0, 4));
    return iso in list ? list[iso] : null;
  }
  // Opening hours for a date: ['09:00', '20:00'] or null.
  function hoursOn(iso, cafe) {
    const h = holidayOn(iso);
    const usual = (cafe ? CAFE_HOURS : HOURS)[dayOf(iso)];
    if (!h) return usual;
    if (!h.hours || !usual) return null;
    // On a short day the café closes with the shop (or earlier, if it usually does).
    return cafe ? [h.hours[0] > usual[0] ? h.hours[0] : usual[0], h.hours[1] < usual[1] ? h.hours[1] : usual[1]] : h.hours;
  }
  const isOpenDay = (iso) => !!hoursOn(iso);
  const isBusinessDay = (iso) => dayOf(iso) >= 1 && dayOf(iso) <= 5 && !holidayOn(iso);
  function addBusinessDays(iso, n) {
    let d = iso;
    for (let i = 0; i < n;) { d = addDays(d, 1); if (isBusinessDay(d)) i++; }
    return d;
  }
  // { open, text } e.g. "Open now until 8pm" / "Closed now · opens tomorrow at 9am"
  function statusFor(cafe) {
    const now = shopNow();
    const t = hoursOn(now.date, cafe);
    const what = cafe ? 'Café' : '';
    if (t && now.mins >= toMins(t[0]) && now.mins < toMins(t[1])) {
      return { open: true, text: (cafe ? 'Café open' : 'Open now') + ' until ' + clock(toMins(t[1])) };
    }
    if (t && now.mins < toMins(t[0])) return { open: false, text: (what ? what + ' opens' : 'Closed now · opens') + ' today at ' + clock(toMins(t[0])) };
    for (let i = 1; i < 14; i++) {
      const d = addDays(now.date, i);
      const h = hoursOn(d, cafe);
      if (h) return { open: false, text: (what ? what + ' opens' : 'Closed now · opens') + ' ' + (i === 1 ? 'tomorrow' : DAY_NAMES[dayOf(d)]) + ' at ' + clock(toMins(h[0])) };
    }
    return { open: false, text: 'Closed now' };
  }
  function upcomingHolidays(count) {
    const t = today();
    const y = +t.slice(0, 4);
    const all = [];
    [y, y + 1].forEach((yr) => {
      const list = holidaysIn(yr);
      Object.keys(list).forEach((iso) => { if (iso >= t) all.push({ date: iso, name: list[iso].name, hours: list[iso].hours }); });
    });
    return all.sort((a, b) => (a.date < b.date ? -1 : 1)).slice(0, count);
  }

  /* ------------------------------------------------------------------
   * 4. Keeping the demo current (see KEEP_DEMO_CURRENT)
   * ------------------------------------------------------------------ */
  // Whole weeks since DEMO_ANCHOR. Events and recently published books move by it.
  const SHIFT_DAYS = KEEP_DEMO_CURRENT ? Math.max(0, Math.floor((dayNum(today()) - dayNum(DEMO_ANCHOR)) / 7) * 7) : 0;
  if (SHIFT_DAYS) {
    EVENTS.forEach((e) => {
      let d = addDays(e.date, SHIFT_DAYS);
      // Never land on a holiday the shop is closed or short: skip a week.
      for (let i = 0; i < 3 && holidayOn(d); i++) d = addDays(d, 7);
      e.date = d;
    });
    BOOKS.forEach((b) => { if (dayNum(b.pub) >= dayNum(DEMO_ANCHOR) - DEMO_RECENT_DAYS) b.pub = addDays(b.pub, SHIFT_DAYS); });
  }

  /* ------------------------------------------------------------------
   * 5. Books
   * ------------------------------------------------------------------ */
  const FORMAT_ORDER = ['hardcover', 'paperback'];
  const BOOK_BY_ID = BOOKS.reduce((m, b) => { m[b.id] = b; return m; }, Object.create(null));
  const findBook = (id) => (typeof id === 'string' && id in BOOK_BY_ID ? BOOK_BY_ID[id] : null);
  const formatsOf = (b) => FORMAT_ORDER.filter((f) => has(b.formats, f));
  const lowestPrice = (b) => Math.min.apply(null, formatsOf(b).map((f) => b.formats[f]));
  const stockOf = (b, f) => (has(b.stock, f) ? b.stock[f] : 0);
  const isPreorder = (b) => b.pub > today();
  const isNew = (b) => !isPreorder(b) && dayNum(today()) - dayNum(b.pub) <= NEW_RELEASE_DAYS;
  const pubYear = (b) => b.pub.slice(0, 4);
  const genreLabel = (b) => (has(GENRES, b.genre) ? GENRES[b.genre].label : '');
  const staffFor = (b) => (b.pick && has(STAFF, b.pick) ? STAFF[b.pick] : null);
  // { kind: 'preorder' | 'shelf' | 'order', text, short }
  function availability(b, format) {
    if (isPreorder(b)) {
      return { kind: 'preorder', text: 'Preorder: out ' + fmtDate(b.pub), short: 'Out ' + fmtDate(b.pub, { weekday: undefined, month: 'short' }) };
    }
    const f = format || formatsOf(b).filter((x) => stockOf(b, x) > 0)[0] || formatsOf(b)[0];
    const n = stockOf(b, f);
    if (n > 0) return { kind: 'shelf', text: (n === 1 ? 'One copy' : n + ' copies') + ' on our shelves', short: 'On the shelf' };
    return { kind: 'order', text: 'We’ll order it in: ' + ORDER_IN_DAYS[0] + '–' + ORDER_IN_DAYS[1] + ' business days', short: 'Order in, ' + ORDER_IN_DAYS[0] + '–' + ORDER_IN_DAYS[1] + ' days' };
  }
  const audienceText = { adult: 'Adult', teen: 'Teen (12 and up)', middle: 'Ages 8 to 12', young: 'Ages 3 to 7' };

  /* ------------------------------------------------------------------
   * 6. Artwork. Covers are drawn from each book's `cover` data: a motif,
   *    four colors and the title set in Brygada 1918. Motifs draw in a
   *    200 × 150 box.
   * ------------------------------------------------------------------ */
  const SERIF = "'Brygada 1918', Georgia, serif";
  const SANS = "Lato, Arial, sans-serif";
  const MOTIFS = {
    ferry: (c) => '<circle cx="152" cy="34" r="15" fill="' + c.fg + '" opacity=".9"/><circle cx="146" cy="30" r="15" fill="' + c.bg + '"/>' +
      '<path d="M0 108q25-6 50 0t50 0 50 0 50 0v42H0z" fill="' + c.dk + '"/>' +
      '<path d="M98 50v32" stroke="' + c.fg + '" stroke-width="2.5"/><circle cx="98" cy="48" r="17" fill="' + c.ac + '" opacity=".22"/><circle cx="98" cy="48" r="6" fill="' + c.ac + '"/>' +
      '<path d="M66 82h56v18H66z" fill="' + c.fg + '"/><path d="M72 86h8v7h-8zm14 0h8v7h-8zm14 0h8v7h-8z" fill="' + c.ac + '"/>' +
      '<path d="M34 100h134l-14 16H50z" fill="' + c.fg + '"/><path d="M40 106h122" stroke="' + c.dk + '" stroke-width="2"/>' +
      '<path d="M84 124h30M70 134h58M90 144h18" stroke="' + c.ac + '" stroke-width="3" stroke-linecap="round" opacity=".7"/>',
    hill: (c) => '<path d="M0 150V86q42-34 86-6t70-12q24-4 44 6v76z" fill="' + c.dk + '" opacity=".55"/>' +
      '<path d="M0 150v-40q60-30 118-6t82-6v52z" fill="#fff"/>' +
      '<path d="M120 104V84l14-12 14 12v20z" fill="' + c.ac + '"/><path d="M116 86l18-16 18 16" fill="none" stroke="' + c.fg + '" stroke-width="3" stroke-linejoin="round"/><path d="M130 92h8v12h-8z" fill="' + c.fg + '"/>' +
      '<path d="M40 112l9-24 9 24zm16 4l8-20 8 20zm108-6l7-18 7 18z" fill="' + c.fg + '"/>' +
      '<g fill="' + c.fg + '" opacity=".5"><circle cx="30" cy="40" r="2"/><circle cx="70" cy="24" r="1.6"/><circle cx="104" cy="44" r="2"/><circle cx="160" cy="30" r="1.6"/><circle cx="186" cy="56" r="2"/><circle cx="52" cy="62" r="1.4"/></g>',
    abacus: (c) => '<rect x="34" y="14" width="132" height="126" rx="4" fill="none" stroke="' + c.fg + '" stroke-width="5"/>' +
      [32, 54, 76, 98, 120].map((y, i) => '<path d="M38 ' + y + 'h124" stroke="' + c.dk + '" stroke-width="2"/>' +
        [0, 1, 2, 3, 4].slice(0, 5 - i).map((k) => '<circle cx="' + (48 + k * 13 + i * 6) + '" cy="' + y + '" r="6" fill="' + (k === 0 ? c.ac : c.fg) + '"/>').join('')).join(''),
    windows: (c) => '<path d="M0 150V96l22-20 22 20V70l26-24 26 24v26l18-16 18 16V60l24-22 24 22v90z" fill="' + c.dk + '"/>' +
      '<g fill="' + c.ac + '"><rect x="12" y="104" width="9" height="11"/><rect x="28" y="120" width="9" height="11"/><rect x="58" y="76" width="9" height="11"/><rect x="74" y="98" width="9" height="11"/><rect x="58" y="118" width="9" height="11"/><rect x="104" y="106" width="9" height="11"/><rect x="146" y="70" width="9" height="11"/><rect x="164" y="96" width="9" height="11"/><rect x="146" y="120" width="9" height="11"/></g>' +
      '<g fill="' + c.ac + '" opacity=".22"><circle cx="16" cy="110" r="12"/><circle cx="62" cy="82" r="12"/><circle cx="150" cy="76" r="12"/><circle cx="168" cy="102" r="12"/></g>' +
      '<g fill="' + c.fg + '"><circle cx="40" cy="20" r="1.6"/><circle cx="120" cy="14" r="1.6"/><circle cx="96" cy="32" r="1.2"/><circle cx="186" cy="22" r="1.6"/></g>',
    letter: (c) => '<g transform="rotate(-6 100 75)"><rect x="34" y="34" width="132" height="86" rx="3" fill="#fffdf6" stroke="' + c.dk + '" stroke-width="2"/>' +
      '<path d="M34 36l66 46 66-46" fill="none" stroke="' + c.dk + '" stroke-width="2"/>' +
      '<rect x="134" y="42" width="24" height="28" fill="' + c.ac + '"/><path d="M146 47v18M138 56h16M140 50l12 12M152 50l-12 12" stroke="#fffdf6" stroke-width="1.6"/>' +
      '<path d="M48 104h44M48 112h30" stroke="' + c.fg + '" stroke-width="2" opacity=".5"/></g>' +
      '<path d="M18 132q12-8 24 0t24 0" fill="none" stroke="' + c.dk + '" stroke-width="2"/>',
    books: (c) => '<g transform="rotate(-8 70 80)"><rect x="40" y="26" width="52" height="96" rx="3" fill="' + c.fg + '"/><path d="M48 26v96" stroke="' + c.dk + '" stroke-width="3"/><path d="M56 46h28M56 54h20" stroke="' + c.dk + '" stroke-width="2.5"/></g>' +
      '<g transform="rotate(7 130 80)"><rect x="106" y="26" width="52" height="96" rx="3" fill="' + c.fg + '"/><path d="M114 26v96" stroke="' + c.dk + '" stroke-width="3"/><path d="M122 46h28M122 54h20" stroke="' + c.dk + '" stroke-width="2.5"/></g>' +
      '<path d="M128 120q4 10 0 20" fill="none" stroke="' + c.ac + '" stroke-width="4" stroke-linecap="round"/><circle cx="128" cy="144" r="4" fill="' + c.ac + '"/>' +
      '<circle cx="100" cy="72" r="20" fill="none" stroke="' + c.ac + '" stroke-width="5"/><path d="M114 86l18 18" stroke="' + c.ac + '" stroke-width="7" stroke-linecap="round"/>',
    gull: (c) => '<path d="M0 116q20-10 40 0t40 0 40 0 40 0 40 0v34H0z" fill="' + c.dk + '"/><path d="M0 132q20-8 40 0t40 0 40 0 40 0 40 0" fill="none" stroke="' + c.ac + '" stroke-width="2" opacity=".6"/>' +
      '<path d="M50 56q24-26 48 2 24-28 50-4" fill="none" stroke="' + c.fg + '" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M128 22q8-8 16 0 8-8 16 0" fill="none" stroke="' + c.fg + '" stroke-width="3" stroke-linecap="round"/>' +
      '<path d="M150 102l6-20 6 20z" fill="' + c.ac + '"/><path d="M146 102h20l-2 10h-16z" fill="#c8401f"/>',
    bell: (c) => '<path d="M64 98q0-56 36-56t36 56l8 10H56z" fill="' + c.ac + '"/><circle cx="100" cy="114" r="7" fill="' + c.ac + '"/><path d="M100 30v12" stroke="' + c.ac + '" stroke-width="5"/>' +
      '<path d="M0 64q25-8 50 0t50 0 50 0 50 0v86H0z" fill="' + c.fg + '" opacity=".14"/>' +
      '<path d="M0 64q25-8 50 0t50 0 50 0 50 0" fill="none" stroke="' + c.fg + '" stroke-width="2.5"/><path d="M20 82q20-6 40 0M120 92q20-6 40 0M60 128q20-6 40 0" fill="none" stroke="' + c.fg + '" stroke-width="1.6" opacity=".6"/>' +
      '<g fill="none" stroke="' + c.fg + '" stroke-width="1.5" opacity=".7"><circle cx="150" cy="118" r="4"/><circle cx="158" cy="104" r="2.6"/><circle cx="44" cy="110" r="3"/></g>',
    key: (c) => '<g transform="rotate(-32 100 75)"><circle cx="58" cy="75" r="26" fill="none" stroke="' + c.fg + '" stroke-width="8"/><circle cx="58" cy="75" r="9" fill="' + c.ac + '"/>' +
      '<path d="M84 75h86" stroke="' + c.fg + '" stroke-width="9" stroke-linecap="round"/><path d="M148 75v18h10V75m-30 0v14h10V75" fill="' + c.fg + '" stroke="' + c.fg + '" stroke-width="4"/></g>' +
      '<g fill="' + c.ac + '" opacity=".55"><path d="M150 18l14 10-6 16-14-6z"/><path d="M28 118l16-4 6 14-14 6z"/><path d="M168 112l10 4-2 12-10-2z"/></g>',
    moon: (c) => '<circle cx="100" cy="78" r="46" fill="' + c.fg + '"/><circle cx="120" cy="66" r="44" fill="' + c.bg + '"/>' +
      '<g fill="none" stroke="' + c.ac + '" stroke-width="3" stroke-linecap="round"><path d="M150 50a22 22 0 0 1 0 30"/><path d="M160 40a36 36 0 0 1 0 50"/><path d="M170 30a50 50 0 0 1 0 70"/></g>' +
      '<g fill="' + c.fg + '"><circle cx="30" cy="22" r="1.6"/><circle cx="56" cy="130" r="1.4"/><circle cx="20" cy="96" r="2"/><circle cx="176" cy="132" r="1.6"/></g><path d="M0 146h200" stroke="' + c.dk + '" stroke-width="8"/>',
    stars: (c) => '<ellipse cx="100" cy="76" rx="84" ry="34" fill="none" stroke="' + c.dk + '" stroke-width="1.5" stroke-dasharray="4 5" transform="rotate(-12 100 76)"/>' +
      '<path d="M34 112L64 70l40 12 26-46 38 22" fill="none" stroke="' + c.dk + '" stroke-width="2"/>' +
      [[34, 112, 4], [64, 70, 5], [104, 82, 4], [130, 36, 6], [168, 58, 4]].map((p) => '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="' + p[2] + '" fill="' + c.dk + '"/>').join('') +
      '<path d="M130 24v24M118 36h24" stroke="' + c.ac + '" stroke-width="3" stroke-linecap="round"/><circle cx="150" cy="118" r="10" fill="' + c.ac + '"/>',
    crown: (c) => '<path d="M50 92l8-50 24 28 18-38 18 38 24-28 8 50z" fill="' + c.ac + '"/><path d="M50 92h100v10H50z" fill="' + c.ac + '"/>' +
      '<g fill="' + c.fg + '"><circle cx="58" cy="40" r="5"/><circle cx="100" cy="30" r="5"/><circle cx="142" cy="40" r="5"/><circle cx="100" cy="82" r="5"/></g>' +
      '<path d="M0 112q25-10 50 0t50 0 50 0 50 0v38H0z" fill="' + c.dk + '"/><path d="M0 128q25-10 50 0t50 0 50 0 50 0" fill="none" stroke="' + c.fg + '" stroke-width="2.5" opacity=".7"/>',
    lighthouse: (c) => '<path d="M86 130l6-80h16l6 80z" fill="#fffaf0"/><path d="M89 96h22l1 14H88zM91 66h18l1 14H90z" fill="' + c.ac + '"/>' +
      '<path d="M88 50h24v-10H88z" fill="' + c.fg + '"/><path d="M92 40h16l-8-10z" fill="' + c.ac + '"/>' +
      '<path d="M112 44L200 24v30zM88 44L0 24v30z" fill="#fff6d8" opacity=".75"/>' +
      '<path d="M40 150q30-28 60-22t70 22z" fill="' + c.dk + '"/>',
    rain: (c) => '<g fill="none" stroke="' + c.ac + '" stroke-width="1.6" opacity=".7"><path d="M20 120q30-30 70-14t90-26"/><path d="M20 134q40-26 80-12t80-20"/><path d="M40 106q30-24 60-10t70-24"/></g>' +
      '<g stroke="' + c.dk + '" stroke-width="2.4" stroke-linecap="round">' +
      [[30, 10], [60, 22], [90, 6], [120, 26], [150, 12], [176, 30], [44, 46], [104, 52], [138, 60], [74, 70]].map((p) => '<path d="M' + p[0] + ' ' + p[1] + 'l-6 18"/>').join('') + '</g>' +
      '<path d="M98 96c0 8 10 8 10 0l-5-10z" fill="' + c.fg + '"/>',
    feather: (c) => '<path d="M58 140C70 96 104 44 154 18c-8 40-30 92-90 116z" fill="' + c.dk + '"/>' +
      '<path d="M58 140C88 102 120 60 154 18" fill="none" stroke="' + c.fg + '" stroke-width="2.5"/>' +
      '<g stroke="' + c.bg + '" stroke-width="1.6"><path d="M90 94l-14-8M104 76l-14-10M118 58l-12-12M96 104l18 4M112 84l20 4M128 64l18 2"/></g>' +
      '<path d="M44 140h24" stroke="' + c.ac + '" stroke-width="4" stroke-linecap="round"/><circle cx="150" cy="118" r="7" fill="' + c.ac + '"/><circle cx="168" cy="108" r="4" fill="' + c.ac + '"/>',
    field: (c) => '<circle cx="146" cy="38" r="22" fill="' + c.fg + '" opacity=".85"/>' +
      '<path d="M0 74h200v76H0z" fill="' + c.ac + '"/>' +
      '<g stroke="' + c.dk + '" stroke-width="3" fill="none"><path d="M-20 150L80 74M20 150l70-76M60 150l40-76M100 150l10-76M140 150l-20-76M180 150l-50-76M220 150l-80-76"/></g>' +
      '<path d="M30 74V54M30 58l-8-6M30 62l8-6" stroke="' + c.fg + '" stroke-width="2.5" fill="none"/>' +
      '<path d="M58 26q8-6 14 0M74 18q6-5 12 0" fill="none" stroke="' + c.fg + '" stroke-width="2"/>',
    bread: (c) => '<ellipse cx="100" cy="92" rx="70" ry="40" fill="' + c.ac + '"/><ellipse cx="100" cy="100" rx="70" ry="32" fill="' + c.dk + '" opacity=".35"/>' +
      '<path d="M60 72q12 10 6 28M88 64q12 12 6 34M118 64q12 12 6 34M144 72q10 10 4 26" fill="none" stroke="' + c.fg + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M26 136h148" stroke="' + c.fg + '" stroke-width="3"/><path d="M168 30v40M168 38l-8-6M168 46l-8-6M168 54l-8-6M168 38l8-6M168 46l8-6M168 54l8-6" stroke="' + c.fg + '" stroke-width="2.4" stroke-linecap="round"/>',
    iceroad: (c) => '<path d="M0 50h200v100H0z" fill="#fff"/><path d="M0 50h200" stroke="' + c.dk + '" stroke-width="3"/>' +
      '<path d="M88 150l10-100h4l10 100z" fill="' + c.dk + '" opacity=".35"/><path d="M100 150V54" stroke="' + c.fg + '" stroke-width="1.6" stroke-dasharray="6 6"/>' +
      '<g fill="' + c.ac + '"><path d="M60 120v-16l10 5-10 5z"/><path d="M140 96v-12l8 4-8 4z"/><path d="M78 82v-10l6 3-6 3z"/></g>' +
      '<path d="M60 120v8M140 96v6M78 82v5" stroke="' + c.fg + '" stroke-width="1.6"/>' +
      '<path d="M0 50l30-20 24 14 30-26 34 22 30-16 52 26" fill="none" stroke="' + c.dk + '" stroke-width="2"/><path d="M104 124h16v8h-16z" fill="' + c.fg + '"/>',
    stones: (c) => [[18, 128, 26], [62, 130, 22], [104, 128, 26], [150, 130, 24], [188, 128, 16], [36, 104, 22], [80, 104, 24], [126, 104, 22], [168, 106, 22], [58, 80, 22], [102, 80, 20], [146, 82, 22], [82, 58, 18], [124, 58, 18]]
      .map((s, i) => '<ellipse cx="' + s[0] + '" cy="' + s[1] + '" rx="' + s[2] + '" ry="' + (s[2] * 0.48) + '" fill="' + (i % 3 === 0 ? c.dk : i % 3 === 1 ? c.fg : '#8f897b') + '" stroke="' + c.bg + '" stroke-width="2"/>').join('') +
      '<path d="M104 40q-4-14 6-24 6 12-6 24z" fill="' + c.ac + '"/><path d="M104 40v8" stroke="' + c.ac + '" stroke-width="2"/>',
    bulbs: (c) => [40, 100, 160].map((x, i) => '<path d="M' + x + ' 128q-18-2-16-20 2-16 16-24 14 8 16 24 2 18-16 20z" fill="' + c.fg + '" opacity=".9"/>' +
      '<path d="M' + (x - 8) + ' 128l-4 12M' + x + ' 128v14M' + (x + 8) + ' 128l4 12" stroke="' + c.fg + '" stroke-width="1.6" opacity=".7"/>' +
      '<path d="M' + x + ' 84V' + (40 + i * 8) + '" stroke="#8fbf7a" stroke-width="3"/>' +
      '<path d="M' + x + ' ' + (40 + i * 8) + 'c-10-4-12-16-6-22 4 6 6 6 6 6s2 0 6-6c6 6 4 18-6 22z" fill="' + c.ac + '"/>').join('') +
      '<path d="M0 90h200" stroke="' + c.dk + '" stroke-width="2" stroke-dasharray="3 6"/>',
    maple: (c) => '<path d="M100 18l10 22 16-8-4 22 20-4-10 18 16 10-28 6 4 16-24-14-24 14 4-16-28-6 16-10-10-18 20 4-4-22 16 8z" fill="' + c.ac + '"/><path d="M100 104v36" stroke="' + c.ac + '" stroke-width="4" stroke-linecap="round"/>' +
      '<path d="M146 112h26l-4 30h-18z" fill="' + c.fg + '"/><path d="M144 112h30" stroke="' + c.dk + '" stroke-width="3"/><path d="M158 96v10" stroke="' + c.fg + '" stroke-width="2"/><circle cx="158" cy="108" r="2.4" fill="' + c.ac + '"/>',
    moth: (c) => '<circle cx="100" cy="64" r="44" fill="#fff6c9" opacity=".7"/>' +
      '<path d="M100 60C78 30 46 34 50 58c3 18 30 22 50 10zM100 60c22-30 54-26 50-2-3 18-30 22-50 10z" fill="' + c.ac + '"/>' +
      '<path d="M100 68c-14 6-30 22-22 32 8 8 18-8 22-20zM100 68c14 6 30 22 22 32-8 8-18-8-22-20z" fill="' + c.fg + '" opacity=".85"/>' +
      '<rect x="96" y="48" width="8" height="40" rx="4" fill="' + c.fg + '"/><path d="M98 50q-6-12-14-14M102 50q6-12 14-14" fill="none" stroke="' + c.fg + '" stroke-width="2" stroke-linecap="round"/>' +
      '<circle cx="66" cy="54" r="5" fill="' + c.bg + '"/><circle cx="134" cy="54" r="5" fill="' + c.bg + '"/><path d="M40 140h120" stroke="' + c.dk + '" stroke-width="6" stroke-linecap="round"/>',
    bear: (c) => '<circle cx="66" cy="40" r="15" fill="' + c.ac + '"/><circle cx="134" cy="40" r="15" fill="' + c.ac + '"/><circle cx="100" cy="72" r="46" fill="' + c.ac + '"/>' +
      '<ellipse cx="100" cy="88" rx="20" ry="15" fill="#e8c9a4"/><ellipse cx="100" cy="80" rx="8" ry="5" fill="' + c.fg + '"/><circle cx="82" cy="64" r="4.5" fill="' + c.fg + '"/><circle cx="118" cy="64" r="4.5" fill="' + c.fg + '"/>' +
      '<path d="M94 94q6 5 12 0" fill="none" stroke="' + c.fg + '" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M54 110l46 10 46-10v34l-46 6-46-6z" fill="#c8401f"/><path d="M100 120v30" stroke="#8f2a12" stroke-width="2.5"/>' +
      '<circle cx="56" cy="122" r="10" fill="' + c.ac + '"/><circle cx="144" cy="122" r="10" fill="' + c.ac + '"/>',
    champ: (c) => '<circle cx="158" cy="28" r="14" fill="' + c.ac + '"/>' +
      '<path d="M0 78q25-6 50 0t50 0 50 0 50 0v72H0z" fill="' + c.dk + '"/>' +
      '<path d="M30 82q11-30 22 0M62 82q13-36 26 0" fill="none" stroke="' + c.fg + '" stroke-width="10" stroke-linecap="round"/>' +
      '<path d="M98 82c0-28 6-44 18-48 9-3 18 2 17 9l-12 4c-5 2-8 14-8 35z" fill="' + c.fg + '"/><circle cx="123" cy="40" r="2.2" fill="' + c.dk + '"/>' +
      '<path d="M16 94q14-5 28 0M56 96q16-5 32 0M96 94q12-4 24 0" fill="none" stroke="' + c.fg + '" stroke-width="2" opacity=".55"/>' +
      '<path d="M112 128h70l-10 10h-50z" fill="' + c.ac + '"/><circle cx="134" cy="120" r="5.5" fill="' + c.fg + '"/><circle cx="158" cy="120" r="5.5" fill="' + c.fg + '"/>' +
      '<path d="M166 108l14 30" stroke="' + c.fg + '" stroke-width="2.5" stroke-linecap="round"/><path d="M104 144q20-5 40 0t40 0" fill="none" stroke="' + c.fg + '" stroke-width="2" opacity=".55"/>',
    oak: (c) => '<circle cx="100" cy="50" r="46" fill="' + c.dk + '"/><circle cx="62" cy="62" r="28" fill="' + c.dk + '"/><circle cx="140" cy="60" r="30" fill="' + c.dk + '"/>' +
      '<path d="M80 150q8-20 6-56h28q-2 36 6 56z" fill="#6b4a2b"/><path d="M92 150v-24a8 8 0 0 1 16 0v24z" fill="' + c.ac + '"/><circle cx="104" cy="138" r="1.6" fill="' + c.fg + '"/>' +
      '<g fill="' + c.ac + '"><circle cx="70" cy="40" r="3"/><circle cx="128" cy="36" r="3"/><circle cx="150" cy="68" r="3"/><circle cx="56" cy="70" r="3"/></g>'
  };

  // A book cover as an SVG string. opts.label: give it role="img" and an accessible name.
  function coverArt(b, opts) {
    const o = opts || {};
    const c = b.cover || { bg: '#17463a', fg: '#f7f1e3', ac: '#c8401f', dk: '#0f3229', motif: '', title: 'top' };
    const top = c.title !== 'bottom';
    const longest = Math.max.apply(null, b.lines.map((l) => l.length));
    const size = Math.min(27, Math.floor(176 / (longest * 0.56)));
    const lh = Math.round(size * 1.08);
    const titleStart = top ? 26 + size : 262 - (b.lines.length - 1) * lh;
    const motifY = top ? 112 + Math.max(0, (3 - b.lines.length) * 4) : 14;
    const motif = has(MOTIFS, c.motif) ? MOTIFS[c.motif](c) : '';
    const titleSvg = b.lines.map((l, i) => '<text x="100" y="' + (titleStart + i * lh) + '" text-anchor="middle" font-family="' + SERIF + '" font-weight="600" font-size="' + size + '" fill="' + c.fg + '">' + escapeHtml(l) + '</text>').join('');
    const ruleY = top ? titleStart + (b.lines.length - 1) * lh + 12 : titleStart - size - 6;
    const label = o.label ? ' role="img" aria-label="' + escapeHtml('Cover of ' + b.title + ' by ' + b.author) + '"' : ' aria-hidden="true" focusable="false"';
    return '<svg viewBox="0 0 200 300" xmlns="http://www.w3.org/2000/svg"' + label + ' preserveAspectRatio="xMidYMid meet">' +
      '<rect width="200" height="300" fill="' + c.bg + '"/>' +
      '<g transform="translate(0 ' + motifY + ')">' + motif + '</g>' +
      titleSvg +
      '<path d="M84 ' + ruleY + 'h32" stroke="' + c.ac + '" stroke-width="2.5"/>' +
      '<text x="100" y="288" text-anchor="middle" font-family="' + SANS + '" font-weight="700" font-size="9.5" letter-spacing="1.6" fill="' + c.fg + '">' + escapeHtml(b.author.toUpperCase()) + '</text>' +
      '<rect width="7" height="300" fill="#000" opacity=".16"/><rect x="7" width="1.5" height="300" fill="#fff" opacity=".18"/>' +
      '</svg>';
  }

  // The bookshelf in the home hero: spines drawn from the catalog, two shelves deep.
  function shelfArt() {
    const W = 560;
    const rows = [BOOKS.slice(0, 12), BOOKS.slice(12, 24)];
    let out = '<svg viewBox="0 0 ' + W + ' 440" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">';
    out += '<rect width="' + W + '" height="440" fill="#0f3229"/><rect x="18" y="14" width="' + (W - 36) + '" height="412" fill="#123b30"/>';
    rows.forEach((row, r) => {
      const base = r === 0 ? 196 : 400;
      let x = 34;
      row.forEach((b, i) => {
        const c = b.cover;
        const w = Math.round(18 + Math.min(b.pages, 520) / 26);
        const h = 118 + (hash(b.id) % 50);
        const lean = r === 0 && i === row.length - 1;
        const g = lean ? ' transform="rotate(14 ' + (x + w) + ' ' + base + ')"' : '';
        out += '<g' + g + '><rect x="' + x + '" y="' + (base - h) + '" width="' + w + '" height="' + h + '" rx="2" fill="' + c.bg + '"/>' +
          '<rect x="' + x + '" y="' + (base - h + 10) + '" width="' + w + '" height="5" fill="' + c.ac + '"/>' +
          '<rect x="' + x + '" y="' + (base - 18) + '" width="' + w + '" height="4" fill="' + c.ac + '" opacity=".8"/>' +
          '<rect x="' + (x + w / 2 - 2) + '" y="' + (base - h + 26) + '" width="4" height="' + Math.round(h * 0.42) + '" rx="2" fill="' + c.fg + '" opacity=".75"/>' +
          '<rect x="' + x + '" y="' + (base - h) + '" width="3" height="' + h + '" fill="#000" opacity=".15"/></g>';
        x += w + (lean ? 18 : 2);
      });
      if (r === 0) {
        // A mug of coffee with steam, then a trailing plant.
        out += '<g transform="translate(' + (x + 10) + ' ' + (base - 44) + ')"><path class="steam" d="M10 -8q-6-8 0-16t0-16" fill="none" stroke="#f7f1e3" stroke-width="3" stroke-linecap="round" opacity=".7"/>' +
          '<path class="steam steam-2" d="M24 -8q-6-8 0-16t0-16" fill="none" stroke="#f7f1e3" stroke-width="3" stroke-linecap="round" opacity=".7"/>' +
          '<path d="M0 0h36v34a10 10 0 0 1-10 10H10A10 10 0 0 1 0 34z" fill="#c8401f"/><path d="M36 8h6a8 8 0 0 1 0 16h-6" fill="none" stroke="#c8401f" stroke-width="5"/>' +
          '<path d="M4 14h28" stroke="#f7f1e3" stroke-width="2" opacity=".6"/></g>';
      } else {
        out += '<g transform="translate(' + Math.min(x + 8, W - 70) + ' ' + (base - 48) + ')"><path d="M6 14h40l-5 34H11z" fill="#e3b25a"/>' +
          '<path d="M26 14C20 0 8-6 0-2c8 2 14 8 18 16M26 14c4-14 16-22 26-18-10 4-16 10-20 18M26 14V-6" fill="none" stroke="#7fb27a" stroke-width="3" stroke-linecap="round"/>' +
          '<path d="M44 40c6 14 4 30-2 40M44 52c6 2 8 6 6 10" fill="none" stroke="#7fb27a" stroke-width="2.5" stroke-linecap="round"/></g>';
      }
      out += '<rect x="18" y="' + base + '" width="' + (W - 36) + '" height="16" fill="#3a6a59"/><rect x="18" y="' + (base + 16) + '" width="' + (W - 36) + '" height="6" fill="#0a241d" opacity=".6"/>';
    });
    out += '</svg>';
    return out;
  }

  // Small illustrations for the events list.
  function storyArt(theme) {
    const n = hash(theme) % 4;
    const bg = ['#f7e0d6', '#e1e9dc', '#f3e6c4', '#dfe7ea'][n];
    const fg = ['#c8401f', '#17463a', '#7a5714', '#1f3b57'][n];
    return '<svg viewBox="0 0 120 160" aria-hidden="true" focusable="false"><rect width="120" height="160" rx="6" fill="' + bg + '"/>' +
      '<path d="M18 112c14-8 28-8 42 0 14-8 28-8 42 0v18c-14-8-28-8-42 0-14-8-28-8-42 0z" fill="' + fg + '"/><path d="M60 112v18" stroke="' + bg + '" stroke-width="2"/>' +
      '<circle cx="40" cy="62" r="16" fill="' + fg + '" opacity=".85"/><circle cx="80" cy="66" r="12" fill="' + fg + '" opacity=".6"/><path d="M28 92q12-12 24 0M70 92q10-10 20 0" fill="none" stroke="' + fg + '" stroke-width="5" stroke-linecap="round"/>' +
      '<path d="M86 24l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#c8401f"/></svg>';
  }

  /* ------------------------------------------------------------------
   * 7. Events and book clubs
   * ------------------------------------------------------------------ */
  // Copy that depends on the time of year (an event's blurb, a story-time theme) can be a plain string or
  // { winter, spring, summer, fall }: the season of the date it is shown for picks the wording, so events
  // that the demo moves forward week by week never talk about snow in July.
  const SEASON_BY_MONTH = ['winter', 'winter', 'spring', 'spring', 'spring', 'summer', 'summer', 'summer', 'fall', 'fall', 'fall', 'winter'];
  const seasonOf = (iso) => SEASON_BY_MONTH[+iso.slice(5, 7) - 1];
  function seasonal(v, iso) {
    if (typeof v === 'string') return v;
    if (!v || typeof v !== 'object') return '';
    const k = seasonOf(iso);
    return has(v, k) && typeof v[k] === 'string' ? v[k] : '';
  }
  const STAFF_NAME = (id) => (has(STAFF, id) ? STAFF[id].name : '');
  const CLUB_BY_ID = CLUBS.reduce((m, c) => { m[c.id] = c; return m; }, Object.create(null));
  // The club's meeting in a month (month: 1–12), a week later if it lands on a holiday.
  function clubDate(club, year, month) {
    let d = nthWeekday(year, month, club.day, club.nth);
    if (holidayOn(d)) d = addDays(d, 7);
    return d;
  }
  function clubPick(club, iso) {
    const idx = (+iso.slice(0, 4)) * 12 + (+iso.slice(5, 7) - 1);
    // Skip a book that isn't published by the meeting (a preorder) and take the next one on the list.
    for (let k = 0; k < club.picks.length; k++) {
      const b = findBook(club.picks[(idx + k) % club.picks.length]);
      if (b && b.pub <= iso) return b;
    }
    return findBook(club.picks[idx % club.picks.length]);
  }
  // The next n meetings that haven't ended.
  function clubMeetings(club, n) {
    const now = shopNow();
    const out = [];
    let y = +now.date.slice(0, 4), m = +now.date.slice(5, 7);
    for (let i = 0; i < 24 && out.length < n; i++) {
      const d = clubDate(club, y, m);
      if (d > now.date || (d === now.date && now.mins < toMins(club.end))) out.push(d);
      m++; if (m > 12) { m = 1; y++; }
    }
    return out;
  }
  function clubRuleText(club) {
    return NTH_WORDS[String(club.nth)] + ' ' + DAY_NAMES[club.day] + ' of the month, ' + timeRange(club.start, club.end);
  }
  // Every upcoming event in date order: { key, type, date, start, end, title, blurb, book, capacity, kind }.
  function allEvents() {
    const now = shopNow();
    const until = addDays(now.date, EVENT_HORIZON_DAYS);
    const list = [];
    EVENTS.forEach((e) => {
      if (!has(EVENT_TYPES, e.type) || !isIsoDate(e.date)) return;
      // Keyed by the event's id, so an RSVP survives the weekly demo shift. An RSVP holds the date it was
      // made for: until that occurrence has passed, the event stays listed on that date.
      const key = 'e:' + e.id;
      const held = rsvps.filter((r) => r.key === key)[0];
      const date = held ? held.date : e.date;
      list.push({ key: key, kind: 'dated', type: e.type, date: date, start: e.start, end: e.end, title: seasonal(e.title, date), blurb: seasonal(e.blurb, date), book: findBook(e.book), capacity: e.capacity });
    });
    if (STORY_TIME) {
      for (let d = now.date; d <= until; d = addDays(d, 1)) {
        if (dayOf(d) !== STORY_TIME.day || !isOpenDay(d)) continue;
        if (EVENTS.some((e) => e.type === 'kids' && e.date === d && e.start < '12:00')) continue;
        const theme = STORY_THEMES.length ? seasonal(STORY_THEMES[Math.floor(dayNum(d) / 7) % STORY_THEMES.length], d) : '';
        list.push({ key: 'story:' + d, kind: 'story', type: 'kids', date: d, start: STORY_TIME.start, end: STORY_TIME.end, title: STORY_TIME.title + (theme ? ': ' + theme.toLowerCase() : ''), theme: theme, blurb: STORY_TIME.blurb, book: null, capacity: STORY_TIME.capacity });
      }
    }
    CLUBS.forEach((club) => {
      clubMeetings(club, 4).forEach((d) => {
        const pick = clubPick(club, d);
        list.push({ key: 'club:' + club.id + ':' + d, kind: 'club', type: 'club', date: d, start: club.start, end: club.end, title: club.name + (pick ? ': ' + pick.title : ''), blurb: club.blurb + ' Hosted by ' + STAFF_NAME(club.host) + '.', book: pick, capacity: 24, club: club });
      });
    });
    return list
      .filter((e) => e.date <= until && (e.date > now.date || (e.date === now.date && now.mins < toMins(e.end))))
      .sort((a, b) => (a.date + a.start < b.date + b.start ? -1 : a.date + a.start > b.date + b.start ? 1 : 0));
  }
  let eventsCache = null;
  const eventsList = () => eventsCache || (eventsCache = allEvents());
  const findEvent = (key) => eventsList().filter((e) => e.key === key)[0] || null;
  // Seats taken by other people (demo numbers, stable per event; never more than 70%).
  function seatsLeft(ev) {
    const taken = hash(ev.key) % Math.floor(ev.capacity * 0.7);
    const mine = rsvps.filter((r) => r.key === ev.key).reduce((n, r) => n + r.seats, 0);
    return Math.max(0, ev.capacity - taken - mine);
  }
  function dateBlock(iso, dark) {
    return '<div class="flex w-16 shrink-0 flex-col items-center self-start rounded-md ' + (dark ? 'bg-paper text-pine-deep' : 'bg-pine text-white') + ' px-2 py-2 text-center leading-none">' +
      '<span class="text-[11.5px] font-bold uppercase tracking-[0.14em]">' + fmtDate(iso, { weekday: 'short', month: undefined, day: undefined }) + '</span>' +
      '<span class="mt-1 font-display text-[1.75rem] font-semibold">' + (+iso.slice(8)) + '</span>' +
      '<span class="mt-0.5 text-[11.5px] font-bold uppercase tracking-[0.14em]">' + fmtDate(iso, { weekday: undefined, day: undefined, month: 'short' }) + '</span></div>';
  }

  /* ------------------------------------------------------------------
   * 8. The bag. { lines: [{ id, format, qty }], method: 'pickup' | 'ship', gift: bool }
   * ------------------------------------------------------------------ */
  function cleanBag(raw) {
    const out = { lines: [], method: 'pickup', gift: false };
    if (!raw || typeof raw !== 'object') return out;
    if (raw.method === 'ship') out.method = 'ship';
    out.gift = raw.gift === true;
    const seen = Object.create(null);
    (Array.isArray(raw.lines) ? raw.lines : []).slice(0, 40).forEach((l) => {
      if (!l || typeof l !== 'object') return;
      const b = findBook(l.id);
      if (!b || !has(b.formats, l.format)) return;
      const qty = Math.min(MAX_QTY, Math.max(1, Math.floor(Number(l.qty)) || 1));
      const k = b.id + '|' + l.format;
      if (k in seen) { seen[k].qty = Math.min(MAX_QTY, seen[k].qty + qty); return; }
      seen[k] = { id: b.id, format: l.format, qty: qty };
      out.lines.push(seen[k]);
    });
    return out;
  }
  let bag = cleanBag(read(KEYS.bag));
  const bagListeners = [];
  function saveBag(next) {
    bag = cleanBag(next);
    write(KEYS.bag, bag);
    bagListeners.forEach((fn) => fn());
  }
  window.addEventListener('storage', (e) => {
    if (e.key === KEYS.bag) { bag = cleanBag(read(KEYS.bag)); bagListeners.forEach((fn) => fn()); }
  });
  const bagCount = () => bag.lines.reduce((n, l) => n + l.qty, 0);
  const lineBook = (l) => findBook(l.id);
  const linePrice = (l) => lineBook(l).formats[l.format];
  const bagSubtotal = () => bag.lines.reduce((n, l) => n + linePrice(l) * l.qty, 0);
  function addToBag(id, format, qty) {
    const existing = bag.lines.filter((l) => l.id === id && l.format === format)[0];
    const before = existing ? existing.qty : 0;
    const add = Math.max(0, Math.min(MAX_QTY - before, qty));
    if (add > 0) {
      const lines = bag.lines.map((l) => (l === existing ? { id: l.id, format: l.format, qty: l.qty + add } : l));
      if (!existing) lines.push({ id: id, format: format, qty: add });
      saveBag({ lines: lines, method: bag.method, gift: bag.gift });
    }
    return { added: add, capped: add < qty };
  }
  function shippingFor(subtotal, method) {
    if (method !== 'ship' || subtotal === 0) return 0;
    return subtotal >= SHIPPING.freeFrom ? 0 : SHIPPING.flat;
  }
  function totals() {
    const sub = bagSubtotal();
    const ship = shippingFor(sub, bag.method);
    const tax = Math.round((sub + ship) * TAX_RATE);
    return { sub: sub, ship: ship, tax: tax, total: sub + ship + tax };
  }
  // When the order is ready: a sentence for pickup or shipping.
  function readiness(method) {
    const lines = bag.lines.map((l) => ({ b: lineBook(l), f: l.format, qty: l.qty }));
    const pre = lines.filter((x) => isPreorder(x.b));
    const order = lines.filter((x) => !isPreorder(x.b) && stockOf(x.b, x.f) < x.qty);
    const latestPub = pre.reduce((m, x) => (x.b.pub > m ? x.b.pub : m), '');
    const now = shopNow();
    const parts = [];
    if (method === 'pickup') {
      if (lines.length > pre.length + order.length || !lines.length) parts.push('Books on our shelves: ' + pickupReadyText(now));
      if (order.length) parts.push('Ordered-in books: ready ' + rangeText([addBusinessDays(now.date, ORDER_IN_DAYS[0]), addBusinessDays(now.date, ORDER_IN_DAYS[1])]));
      if (pre.length) parts.push('Preorders: ready on publication day, ' + fmtDate(latestPub));
    } else {
      const ready = addBusinessDays(now.date, SHIPPING.packDays + (order.length ? ORDER_IN_DAYS[1] : 0));
      const sendFrom = latestPub && latestPub > ready ? latestPub : ready;
      parts.push((pre.length ? 'Ships together on ' + fmtDate(sendFrom) : 'Ships ' + fmtDate(sendFrom)) + ', arriving about ' + rangeText([addBusinessDays(sendFrom, SHIPPING.transit[0]), addBusinessDays(sendFrom, SHIPPING.transit[1])]));
    }
    return parts;
  }
  function pickupReadyText(now) {
    const h = hoursOn(now.date);
    if (h && now.mins + PICKUP_READY_MINS <= toMins(h[1]) - 15) {
      const at = Math.max(toMins(h[0]), now.mins) + PICKUP_READY_MINS;
      return 'ready today from ' + clock(Math.ceil(at / 30) * 30);
    }
    for (let i = 1; i < 14; i++) {
      const d = addDays(now.date, i);
      const dh = hoursOn(d);
      if (dh) return 'ready ' + (i === 1 ? 'tomorrow' : fmtDate(d)) + ' from ' + clock(toMins(dh[0]) + PICKUP_READY_MINS);
    }
    return 'ready when we reopen';
  }
  function rangeText(r) {
    const f = (iso) => fmtDate(iso, { weekday: 'short', month: 'short' });
    return r[0] === r[1] ? f(r[0]) : f(r[0]) + ' – ' + f(r[1]);
  }

  // RSVPs: [{ key, date, seats, name, ref }]. key: 'e:<event id>' for EVENTS (stable across the weekly demo
  // shift), 'story:<date>' or 'club:<club id>:<date>'. date: the occurrence it was made for; an RSVP is kept
  // until that occurrence has ended.
  let rsvps = [];
  const EVENT_BY_ID = EVENTS.reduce((m, e) => { m[e.id] = e; return m; }, Object.create(null));
  function loadRsvps() {
    const raw = read(KEYS.rsvps);
    const now = shopNow();
    rsvps = [];
    eventsCache = null;
    (Array.isArray(raw) ? raw : []).slice(0, 30).forEach((r) => {
      if (!r || typeof r.key !== 'string' || !isIsoDate(r.date)) return;
      if (rsvps.some((x) => x.key === r.key)) return;
      let end;
      const m = /^e:(.+)$/.exec(r.key);
      if (m) {
        const e = has(EVENT_BY_ID, m[1]) ? EVENT_BY_ID[m[1]] : null;
        if (!e || !has(EVENT_TYPES, e.type) || r.date > addDays(today(), EVENT_HORIZON_DAYS)) return;
        end = e.end;
      } else {
        const ev = findEvent(r.key);
        if (!ev || ev.date !== r.date) return;
        end = ev.end;
      }
      if (r.date < now.date || (r.date === now.date && now.mins >= toMins(end))) return;
      const seats = Math.min(RSVP_MAX, Math.max(1, Math.floor(Number(r.seats)) || 1));
      rsvps.push({ key: r.key, date: r.date, seats: seats, name: cleanText(r.name, 60), ref: /^EV-\d{4}$/.test(r.ref) ? r.ref : reference('EV', 4) });
    });
    eventsCache = null;
    write(KEYS.rsvps, rsvps.length ? rsvps : null);
  }
  // Book clubs joined: ['fiction', …]
  function loadClubs() {
    const raw = read(KEYS.clubs);
    return (Array.isArray(raw) ? raw : []).filter((id, i, a) => has(CLUB_BY_ID, id) && a.indexOf(id) === i);
  }

  /* ------------------------------------------------------------------
   * 9. Header, mobile menu, reveal, toast, open/closed status
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
  const onScroll = () => header && header.classList.toggle('shadow-[0_12px_28px_-24px_rgb(15_50_41/.8)]', window.scrollY > 8);
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

  function renderBagLinks() {
    const n = bagCount();
    $$('[data-bag-count]').forEach((el) => { el.textContent = String(n); el.hidden = n === 0; });
    $$('[data-bag-link]').forEach((a) => a.setAttribute('aria-label', 'Bag, ' + plural(n, 'book', 'books')));
  }
  function popBadge() {
    if (reduceMotion) return;
    $$('[data-bag-count]').forEach((el) => { el.classList.remove('badge-pop'); void el.offsetWidth; el.classList.add('badge-pop'); });
  }
  const toastBox = document.createElement('div');
  toastBox.id = 'toast';
  toastBox.setAttribute('role', 'status');
  toastBox.setAttribute('data-show', 'false');
  toastBox.className = 'on-dark fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-start gap-3 rounded-md bg-pine-deep px-5 py-4 text-[15px] leading-snug text-paper shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6';
  document.body.appendChild(toastBox);
  let toastTimer = 0;
  function toast(html) {
    toastBox.innerHTML = '<span class="min-w-0 flex-1">' + html + '</span><button type="button" class="-mr-1 -mt-1 grid size-8 shrink-0 place-items-center rounded-md text-paper/80 hover:bg-white/10 hover:text-paper" aria-label="Dismiss" data-toast-close><svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button>';
    toastBox.setAttribute('data-show', 'true');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 6000);
  }
  function hideToast() { toastBox.setAttribute('data-show', 'false'); }
  toastBox.addEventListener('click', (e) => { if (e.target.closest('[data-toast-close]')) hideToast(); });
  toastBox.addEventListener('mouseenter', () => clearTimeout(toastTimer));
  toastBox.addEventListener('mouseleave', () => { toastTimer = setTimeout(hideToast, 3000); });

  const buttonTimers = new WeakMap();
  function flashButton(btn, text) {
    const label = $('[data-btn-label]', btn) || btn;
    if (!btn.hasAttribute('data-idle')) btn.setAttribute('data-idle', label.textContent);
    label.textContent = text;
    clearTimeout(buttonTimers.get(btn));
    buttonTimers.set(btn, setTimeout(() => { label.textContent = btn.getAttribute('data-idle'); }, 1600));
  }
  function addedToast(b, format, res) {
    if (!res.added) {
      toast('You already have ' + MAX_QTY + ' copies of <strong>' + escapeHtml(b.title) + '</strong> in your bag, the most we take online. For more, call us at ' + SHOP.phone + '.');
      return;
    }
    popBadge();
    toast('<strong>' + escapeHtml(b.title) + '</strong> (' + FORMATS[format].label.toLowerCase() + (res.added > 1 ? ', ' + res.added + ' copies' : '') + ') is in your bag. <a href="bag.html" class="font-bold underline underline-offset-4">View bag</a>' +
      (res.capped ? '<br><span class="text-paper/80">That’s the most of one book we take online (' + MAX_QTY + ').</span>' : ''));
  }

  function renderStatus() {
    const st = statusFor(false);
    $$('[data-shop-status]').forEach((el) => { el.textContent = st.text; });
    $$('[data-shop-dot]').forEach((el) => {
      el.classList.toggle('text-[#7fd09a]', st.open && el.hasAttribute('data-on-dark'));
      el.classList.toggle('text-[#2f8a4e]', st.open && !el.hasAttribute('data-on-dark'));
      el.classList.toggle('text-ember', !st.open && el.hasAttribute('data-on-dark'));
      el.classList.toggle('text-vermilion', !st.open && !el.hasAttribute('data-on-dark'));
    });
    const cafe = statusFor(true);
    $$('[data-cafe-status]').forEach((el) => { el.textContent = cafe.text; });
    const h = hoursOn(today());
    $$('[data-hours-today]').forEach((el) => { el.textContent = h ? 'Today ' + timeRange(h[0], h[1]) : 'Closed today'; });
  }

  /* ------------------------------------------------------------------
   * 10. Book cards and lists
   * ------------------------------------------------------------------ */
  const bookUrl = (b, format) => 'book.html?book=' + encodeURIComponent(b.id) + (format ? '&format=' + format : '');
  function availTag(b) {
    const a = availability(b);
    if (a.kind === 'preorder') return '<span class="tag bg-vermilion text-white">Preorder · ' + escapeHtml(a.short) + '</span>';
    if (isNew(b)) return '<span class="tag bg-brass text-pine-deep">New</span>';
    return '';
  }
  // A cover standing on a shelf, with title, author and price. opts.headingTag, opts.compact.
  function bookCard(b, opts) {
    const o = opts || {};
    const tag = o.headingTag || 'h3';
    const fs = formatsOf(b);
    const first = fs[0];
    const a = availability(b);
    return '<article class="group relative flex h-full flex-col" data-book-card="' + b.id + '">' +
      '<div class="relative flex aspect-[4/5] items-end justify-center rounded-t-md bg-vellum/70 px-[14%] pt-5">' +
        '<div class="art tilt cover-shadow relative aspect-[2/3] w-full overflow-hidden rounded-r-sm">' + coverArt(b) + '</div>' +
        '<span class="absolute left-2 top-2 flex flex-col items-start gap-1">' + availTag(b) + '</span>' +
      '</div>' +
      '<div class="h-2.5 rounded-b-sm bg-pine shadow-[0_10px_12px_-10px_rgb(15_50_41/.7)]" aria-hidden="true"></div>' +
      '<div class="mt-3.5 flex flex-1 flex-col">' +
        '<' + tag + ' class="font-display text-[1.15rem] font-semibold leading-tight sm:text-[1.25rem]"><a href="' + bookUrl(b) + '" class="after:absolute after:inset-0 after:z-0 focus:outline-none group-focus-within:underline group-hover:underline decoration-1 underline-offset-4">' + escapeHtml(b.title) + '</a></' + tag + '>' +
        '<p class="mt-1 text-[15px] text-muted">' + escapeHtml(b.author) + '</p>' +
        (o.compact ? '' : '<p class="mt-1 text-[13.5px] text-muted"><span class="sr-only">Availability: </span>' + escapeHtml(a.short) + (fs.length > 1 ? ' · hardcover or paperback' : ' · ' + FORMATS[first].label.toLowerCase()) + '</p>') +
        '<div class="mt-auto flex items-center justify-between gap-3 pt-3">' +
          '<p class="text-[15px] font-bold tabular-nums">' + (fs.length > 1 ? '<span class="font-normal text-muted">from </span>' : '') + money(lowestPrice(b)) + '</p>' +
          '<button type="button" class="relative z-10 inline-flex min-h-10 items-center gap-1.5 rounded-md bg-pine px-3 text-[14px] font-bold text-white transition hover:bg-pine-deep" data-quick-add="' + b.id + '" data-format="' + first + '"><svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg><span data-btn-label>' + (isPreorder(b) ? 'Preorder' : 'Add') + '</span><span class="sr-only"> ' + escapeHtml(b.title) + ' (' + FORMATS[first].label.toLowerCase() + ')' + (isPreorder(b) ? '' : ' to your bag') + '</span></button>' +
        '</div>' +
      '</div>' +
    '</article>';
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-quick-add]');
    if (!btn) return;
    const b = findBook(btn.getAttribute('data-quick-add'));
    const f = btn.getAttribute('data-format');
    if (!b || !has(b.formats, f)) return;
    const res = addToBag(b.id, f, 1);
    if (res.added) flashButton(btn, 'Added');
    addedToast(b, f, res);
  });

  // A staff pick with its shelf-talker card.
  function pickCard(b) {
    const s = staffFor(b);
    return '<li class="reveal grid grid-cols-[7.5rem_1fr] items-start gap-5 sm:grid-cols-[9rem_1fr]">' +
      '<a href="' + bookUrl(b) + '" class="group block" tabindex="-1" aria-hidden="true"><span class="art tilt cover-shadow block aspect-[2/3] overflow-hidden rounded-r-sm">' + coverArt(b) + '</span></a>' +
      '<div class="min-w-0">' +
        '<h3 class="font-display text-[1.3rem] font-semibold leading-tight"><a href="' + bookUrl(b) + '" class="hover:underline underline-offset-4">' + escapeHtml(b.title) + '</a></h3>' +
        '<p class="mt-1 text-[15px] text-muted">' + escapeHtml(b.author) + ' · ' + money(lowestPrice(b)) + '</p>' +
        '<blockquote class="talker mt-5 -rotate-1">“' + escapeHtml(b.note) + '”' +
          '<footer class="mt-2 font-sans text-[13px] font-bold not-italic text-vermilion-ink">— ' + escapeHtml(s ? s.first : '') + (s ? ', ' + escapeHtml(s.role.toLowerCase()) : '') + '</footer></blockquote>' +
      '</div></li>';
  }

  /* ------------------------------------------------------------------
   * 11. Pages
   * ------------------------------------------------------------------ */
  function initHome() {
    const shelf = $('[data-shelf]');
    if (shelf) shelf.innerHTML = shelfArt();
    // One pick per bookseller, in STAFF order.
    const picks = Object.keys(STAFF).map((id) => BOOKS.filter((b) => b.pick === id)[0]).filter(Boolean);
    const pickList = $('#home-picks');
    if (pickList) pickList.innerHTML = picks.map(pickCard).join('');
    const fresh = BOOKS.filter((b) => isNew(b) || isPreorder(b)).sort((a, b) => (a.pub < b.pub ? 1 : -1)).slice(0, 5);
    const newList = $('#home-new');
    if (newList) newList.innerHTML = fresh.map((b) => '<li class="reveal">' + bookCard(b, { compact: true }) + '</li>').join('');
    const count = $('[data-new-count]');
    if (count) count.textContent = plural(BOOKS.filter((b) => isNew(b) || isPreorder(b)).length, 'new and upcoming book', 'new and upcoming books');
    const evList = $('#home-events');
    if (evList) {
      const evs = eventsList().filter((e) => e.kind === 'dated').slice(0, 3);
      evList.innerHTML = evs.map((e) => '<li class="reveal"><a href="events.html#' + e.key.replace(/[^a-z0-9]/gi, '-') + '" class="group flex h-full gap-4 rounded-md bg-pine/60 p-4 ring-1 ring-white/10 transition hover:bg-pine">' +
        dateBlock(e.date, true) +
        '<span class="min-w-0"><span class="text-[12.5px] font-bold uppercase tracking-[0.18em] text-brass">' + EVENT_TYPES[e.type].one + ' · ' + timeRange(e.start, e.end) + '</span>' +
        '<span class="mt-1.5 block font-display text-[1.2rem] font-semibold leading-snug text-white group-hover:underline underline-offset-4">' + escapeHtml(e.title) + '</span></span></a></li>').join('');
    }
    const club = CLUBS[0];
    if (club) {
      const next = clubMeetings(club, 1)[0];
      const pick = next ? clubPick(club, next) : null;
      $$('[data-club-name]').forEach((el) => { el.textContent = club.name; });
      $$('[data-club-next]').forEach((el) => { el.textContent = next ? fmtDate(next) + ', ' + timeRange(club.start, club.end) : ''; });
      $$('[data-club-pick]').forEach((el) => { el.innerHTML = pick ? '<a href="' + bookUrl(pick) + '" class="underline decoration-2 underline-offset-4 hover:decoration-vermilion">' + escapeHtml(pick.title) + '</a> by ' + escapeHtml(pick.author) : ''; });
      $$('[data-club-cover]').forEach((el) => { if (pick) el.innerHTML = coverArt(pick); });
    }
  }

  function initShop() {
    const grid = $('#shop-grid');
    if (!grid) return;
    const p = urlParams();
    const state = {
      genre: has(GENRES, p.get('genre')) ? p.get('genre') : '',
      format: has(FORMATS, p.get('format')) ? p.get('format') : '',
      price: has(PRICE_BANDS, p.get('price')) ? p.get('price') : '',
      sort: has(SORTS, p.get('sort')) ? p.get('sort') : 'featured',
      q: cleanText(p.get('q') || '', 60),
      picks: p.get('picks') === '1',
      fresh: p.get('new') === '1'
    };
    const chipHtml = (group, id, label) => '<button type="button" class="chip" data-filter="' + group + '" data-value="' + id + '" aria-pressed="false">' + escapeHtml(label) + '</button>';
    $('#genre-filters').innerHTML = chipHtml('genre', '', 'All books') + Object.keys(GENRES).map((g) => chipHtml('genre', g, GENRES[g].label)).join('');
    $('#format-filters').innerHTML = chipHtml('format', '', 'Any format') + Object.keys(FORMATS).map((f) => chipHtml('format', f, FORMATS[f].label)).join('');
    $('#price-filters').innerHTML = chipHtml('price', '', 'Any price') + Object.keys(PRICE_BANDS).map((k) => chipHtml('price', k, PRICE_BANDS[k].label)).join('');
    const sortSel = $('#shop-sort');
    sortSel.innerHTML = Object.keys(SORTS).map((k) => '<option value="' + k + '">' + SORTS[k] + '</option>').join('');
    const search = $('#shop-search');
    search.value = state.q;
    const picksBox = $('#shop-picks');
    const newBox = $('#shop-new');
    const order = BOOKS.map((b) => b.id);

    function matches(b) {
      if (state.genre && b.genre !== state.genre) return false;
      if (state.format && !has(b.formats, state.format)) return false;
      if (state.price) {
        const band = PRICE_BANDS[state.price];
        const prices = (state.format ? [b.formats[state.format]] : formatsOf(b).map((f) => b.formats[f]));
        if (!prices.some((v) => v >= band.min && v <= band.max)) return false;
      }
      if (state.picks && !b.pick) return false;
      if (state.fresh && !(isNew(b) || isPreorder(b))) return false;
      if (state.q) {
        const hay = (b.title + ' ' + b.author + ' ' + genreLabel(b) + ' ' + b.blurb).toLowerCase();
        if (!state.q.toLowerCase().split(/\s+/).every((w) => hay.indexOf(w) !== -1)) return false;
      }
      return true;
    }
    const priceIn = (b) => (state.format ? b.formats[state.format] : lowestPrice(b));
    const sorters = {
      featured: (a, b) => (b.pick ? 1 : 0) - (a.pick ? 1 : 0) || order.indexOf(a.id) - order.indexOf(b.id),
      newest: (a, b) => (a.pub < b.pub ? 1 : a.pub > b.pub ? -1 : 0),
      'price-asc': (a, b) => priceIn(a) - priceIn(b) || a.title.localeCompare(b.title),
      'price-desc': (a, b) => priceIn(b) - priceIn(a) || a.title.localeCompare(b.title),
      title: (a, b) => a.title.replace(/^(The|A) /, '').localeCompare(b.title.replace(/^(The|A) /, '')),
      author: (a, b) => a.author.split(' ').slice(-1)[0].localeCompare(b.author.split(' ').slice(-1)[0])
    };
    function syncUrl() {
      const q = new URLSearchParams();
      if (state.genre) q.set('genre', state.genre);
      if (state.format) q.set('format', state.format);
      if (state.price) q.set('price', state.price);
      if (state.picks) q.set('picks', '1');
      if (state.fresh) q.set('new', '1');
      if (state.q) q.set('q', state.q);
      if (state.sort !== 'featured') q.set('sort', state.sort);
      const s = q.toString();
      history.replaceState(null, '', location.pathname + (s ? '?' + s : ''));
    }
    function render() {
      $$('[data-filter]').forEach((b) => b.setAttribute('aria-pressed', String(state[b.getAttribute('data-filter')] === b.getAttribute('data-value'))));
      sortSel.value = state.sort;
      picksBox.checked = state.picks;
      newBox.checked = state.fresh;
      const list = BOOKS.filter(matches).sort(sorters[state.sort]);
      grid.innerHTML = list.map((b) => '<li>' + bookCard(b, { headingTag: 'h2' }) + '</li>').join('');
      $('#shop-empty').hidden = list.length > 0;
      const bits = [];
      if (state.genre) bits.push(GENRES[state.genre].label.toLowerCase());
      if (state.format) bits.push('in ' + FORMATS[state.format].label.toLowerCase());
      if (state.price) bits.push(PRICE_BANDS[state.price].label.replace(/^U/, 'u').replace(/^O/, 'o'));
      if (state.picks) bits.push('staff picks');
      if (state.fresh) bits.push('new and upcoming');
      $('#shop-count').textContent = plural(list.length, 'book', 'books') + (bits.length ? ': ' + bits.join(', ') : '') + (state.q ? ' matching “' + state.q + '”' : '');
      $('#shop-clear').hidden = !(state.genre || state.format || state.price || state.q || state.picks || state.fresh);
      syncUrl();
    }
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]');
      if (!b) return;
      state[b.getAttribute('data-filter')] = b.getAttribute('data-value');
      render();
    });
    sortSel.addEventListener('change', () => { state.sort = has(SORTS, sortSel.value) ? sortSel.value : 'featured'; render(); });
    let searchTimer = 0;
    search.addEventListener('input', () => { clearTimeout(searchTimer); searchTimer = setTimeout(() => { state.q = cleanText(search.value, 60); render(); }, 180); });
    $('#shop-search-form').addEventListener('submit', (e) => { e.preventDefault(); state.q = cleanText(search.value, 60); render(); });
    picksBox.addEventListener('change', () => { state.picks = picksBox.checked; render(); });
    newBox.addEventListener('change', () => { state.fresh = newBox.checked; render(); });
    $$('[data-shop-clear]').forEach((btn) => btn.addEventListener('click', () => {
      state.genre = ''; state.format = ''; state.price = ''; state.q = ''; state.picks = false; state.fresh = false; search.value = '';
      render();
      search.focus();
    }));
    render();
  }

  function initBook() {
    const root = $('#book-root');
    if (!root) return;
    const p = urlParams();
    const id = p.get('book');
    // No ?book= shows the first staff pick; an unknown id shows the "not found" panel.
    const b = id === null ? BOOKS.filter((x) => x.pick)[0] : findBook(id);
    if (!b) {
      root.hidden = true;
      $('#book-missing').hidden = false;
      document.title = 'Book not found — Larchmere Books';
      $('#book-missing-list').innerHTML = BOOKS.filter((x) => x.pick).slice(0, 4).map((x) => '<li>' + bookCard(x, { compact: true }) + '</li>').join('');
      return;
    }
    const fs = formatsOf(b);
    let format = has(b.formats, p.get('format')) ? p.get('format') : (fs.filter((f) => stockOf(b, f) > 0)[0] || fs[0]);
    let qty = 1;
    document.title = b.title + ' by ' + b.author + ' — Larchmere Books';
    const meta = $('meta[name="description"]');
    if (meta) meta.setAttribute('content', b.blurb);
    $('#crumb-genre').textContent = genreLabel(b);
    $('#crumb-genre').setAttribute('href', 'shop.html?genre=' + b.genre);
    $('#crumb-title').textContent = b.title;
    $('#book-cover').innerHTML = coverArt(b, { label: true });
    $('#book-title').textContent = b.title;
    $('#book-author').textContent = b.author;
    $('#book-blurb').textContent = b.blurb;
    $('#book-description').textContent = b.description;
    $('#book-tags').innerHTML = '<a href="shop.html?genre=' + b.genre + '" class="tag bg-pine-tint text-pine hover:underline">' + escapeHtml(genreLabel(b)) + '</a>' + availTag(b);
    const s = staffFor(b);
    const talker = $('#book-talker');
    if (s && b.note) {
      talker.hidden = false;
      talker.innerHTML = '“' + escapeHtml(b.note) + '”<footer class="mt-2 font-sans text-[13px] font-bold not-italic text-vermilion-ink">— ' + escapeHtml(s.name) + ', ' + escapeHtml(s.role.toLowerCase()) + '</footer>';
    }
    $('#book-details').innerHTML = [
      ['Author', escapeHtml(b.author)],
      ['Genre', escapeHtml(genreLabel(b))],
      ['Reader', audienceText[b.audience] || 'Adult'],
      ['Length', b.pages + ' pages'],
      [isPreorder(b) ? 'Publishes' : 'Published', fmtDate(b.pub, { weekday: undefined, year: 'numeric' })],
      ['Formats', fs.map((f) => FORMATS[f].label + ' ' + money(b.formats[f])).join(' · ')]
    ].map((r) => '<div class="flex justify-between gap-4 border-b border-line py-2.5"><dt class="text-muted">' + r[0] + '</dt><dd class="text-right font-bold">' + r[1] + '</dd></div>').join('');

    const group = $('#format-options');
    group.innerHTML = fs.map((f) => {
      const a = availability(b, f);
      return '<label class="option flex-col gap-1"><input type="radio" class="sr-only" name="format" value="' + f + '"' + (f === format ? ' checked' : '') + '>' +
        '<span class="flex items-baseline justify-between gap-3"><span class="font-bold">' + FORMATS[f].label + '</span><span class="font-bold tabular-nums">' + money(b.formats[f]) + '</span></span>' +
        '<span class="text-[13.5px] text-muted">' + escapeHtml(a.short) + '</span></label>';
    }).join('');
    if (fs.length === 1) $('#format-single').textContent = 'Only published in ' + FORMATS[fs[0]].label.toLowerCase() + (b.genre === 'poetry' ? ' (a paperback original)' : '') + ' so far.';

    const qtyOut = $('#q-value'), minus = $('#q-minus'), plus = $('#q-plus'), note = $('#q-note');
    function inBag() { const l = bag.lines.filter((x) => x.id === b.id && x.format === format)[0]; return l ? l.qty : 0; }
    function render() {
      const room = Math.max(0, MAX_QTY - inBag());
      if (qty > Math.max(1, room)) qty = Math.max(1, room);
      qtyOut.textContent = String(qty);
      minus.disabled = qty <= 1;
      plus.disabled = qty >= room;
      $('#book-price').textContent = money(b.formats[format] * qty);
      $('#book-price-each').textContent = qty > 1 ? money(b.formats[format]) + ' each' : FORMATS[format].note;
      const a = availability(b, format);
      $('#book-avail').textContent = a.text;
      $('#book-avail-dot').className = 'dot ' + (a.kind === 'shelf' ? 'text-[#2f8a4e]' : a.kind === 'preorder' ? 'text-vermilion' : 'text-brass-ink');
      const pickup = a.kind === 'preorder' ? 'Pick up from ' + fmtDate(b.pub) : a.kind === 'shelf' ? 'Pick up ' + pickupReadyText(shopNow()) : 'Pick up ' + rangeText([addBusinessDays(today(), ORDER_IN_DAYS[0]), addBusinessDays(today(), ORDER_IN_DAYS[1])]);
      $('#book-pickup').textContent = pickup.replace('Pick up ready', 'Pick up');
      $('#add-label').textContent = (isPreorder(b) ? 'Preorder' : 'Add to bag') + ' · ' + money(b.formats[format] * qty);
      $('#add-to-bag').disabled = room === 0;
      note.textContent = room === 0 ? 'You have ' + MAX_QTY + ' copies in your bag, the most we take online. Call ' + SHOP.phone + ' for more.' : qty >= room ? 'That’s the most we can take online for one book (' + MAX_QTY + ').' : '';
      const url = 'book.html?book=' + encodeURIComponent(b.id) + (format !== fs[0] ? '&format=' + format : '');
      history.replaceState(null, '', url);
    }
    group.addEventListener('change', (e) => {
      if (e.target.name === 'format' && has(b.formats, e.target.value)) { format = e.target.value; render(); }
    });
    minus.addEventListener('click', () => { qty = Math.max(1, qty - 1); render(); });
    plus.addEventListener('click', () => { qty = Math.min(MAX_QTY, qty + 1); render(); });
    $('#add-to-bag').addEventListener('click', () => {
      const res = addToBag(b.id, format, qty);
      addedToast(b, format, res);
      qty = 1;
      render();
    });
    bagListeners.push(render);
    render();

    // Events with this book, and related books (same genre first, then shared moods).
    const evs = eventsList().filter((e) => e.book === b && e.kind === 'dated');
    const evBox = $('#book-event');
    if (evs.length) {
      const e = evs[0];
      evBox.hidden = false;
      evBox.innerHTML = '<div class="flex gap-4">' + dateBlock(e.date) + '<div class="min-w-0"><p class="kicker">Meet the author</p><p class="mt-1 font-display text-[1.2rem] font-semibold leading-snug">' + escapeHtml(e.title) + '</p>' +
        '<p class="mt-1 text-[15px] text-muted">' + fmtDate(e.date) + ', ' + timeRange(e.start, e.end) + ' · free, RSVP for a seat</p><a href="events.html?type=' + e.type + '#rsvp" class="link mt-2 inline-block text-[15px]">RSVP</a></div></div>';
    }
    const related = BOOKS.filter((x) => x !== b).map((x) => ({ x: x, score: (x.genre === b.genre ? 3 : 0) + x.moods.filter((m) => b.moods.indexOf(m) !== -1).length + (x.audience === b.audience ? 1 : 0) }))
      .sort((a, c) => c.score - a.score || BOOKS.indexOf(a.x) - BOOKS.indexOf(c.x)).slice(0, 4).map((r) => r.x);
    $('#book-related').innerHTML = related.map((x) => '<li>' + bookCard(x, { compact: true }) + '</li>').join('');
  }

  function initBag() {
    const listEl = $('#bag-lines');
    if (!listEl) return;
    const empty = $('#bag-empty'), filled = $('#bag-filled'), done = $('#order-done');
    const form = $('#checkout-form');
    function lineHtml(l, i) {
      const b = lineBook(l);
      const a = availability(b, l.format);
      return '<li class="flex gap-4 py-5 sm:gap-6" data-line="' + i + '">' +
        '<a href="' + bookUrl(b, l.format) + '" class="art cover-shadow block w-20 shrink-0 self-start overflow-hidden rounded-r-sm sm:w-24" tabindex="-1" aria-hidden="true"><span class="block aspect-[2/3]">' + coverArt(b) + '</span></a>' +
        '<div class="flex min-w-0 flex-1 flex-col">' +
          '<div class="flex flex-col gap-1 sm:flex-row sm:justify-between sm:gap-4"><div class="min-w-0"><h3 class="font-display text-[1.2rem] font-semibold leading-tight"><a href="' + bookUrl(b, l.format) + '" class="hover:underline underline-offset-4">' + escapeHtml(b.title) + '</a></h3>' +
          '<p class="mt-0.5 text-[15px] text-muted">' + escapeHtml(b.author) + ' · ' + FORMATS[l.format].label + '</p>' +
          '<p class="mt-1 text-[13.5px] font-bold ' + (a.kind === 'shelf' ? 'text-[#2a7a45]' : a.kind === 'preorder' ? 'text-vermilion-ink' : 'text-brass-ink') + '">' + escapeHtml(a.kind === 'shelf' && stockOf(b, l.format) < l.qty ? 'Some copies ordered in: ' + ORDER_IN_DAYS[0] + '–' + ORDER_IN_DAYS[1] + ' business days' : a.text) + '</p></div>' +
          '<p class="shrink-0 font-bold tabular-nums">' + money(linePrice(l) * l.qty) + '</p></div>' +
          '<div class="mt-auto flex items-center gap-4 pt-3">' +
            '<div class="stepper" role="group" aria-label="Quantity of ' + escapeHtml(b.title) + '"><button type="button" data-qty="' + i + '" data-delta="-1" aria-label="One fewer"' + (l.qty <= 1 ? ' disabled' : '') + '>−</button><span class="w-8 text-center font-bold tabular-nums" aria-live="polite">' + l.qty + '</span><button type="button" data-qty="' + i + '" data-delta="1" aria-label="One more"' + (l.qty >= MAX_QTY ? ' disabled' : '') + '>+</button></div>' +
            '<button type="button" class="text-[15px] font-bold text-vermilion-ink underline decoration-vermilion/40 underline-offset-4 hover:decoration-vermilion" data-remove="' + i + '">Remove<span class="sr-only"> ' + escapeHtml(b.title) + '</span></button>' +
          '</div>' +
        '</div></li>';
    }
    function render(focusSel) {
      const n = bag.lines.length;
      empty.hidden = n > 0 || !done.hidden;
      filled.hidden = n === 0;
      if (!n) return;
      listEl.innerHTML = bag.lines.map(lineHtml).join('');
      $('#bag-heading-count').textContent = plural(bagCount(), 'book', 'books');
      const t = totals();
      $$('input[name="method"]').forEach((r) => { r.checked = r.value === bag.method; });
      $('#gift-wrap').checked = bag.gift;
      $('#sum-sub').textContent = money(t.sub);
      $('#sum-ship-label').textContent = bag.method === 'ship' ? 'Shipping' : 'Store pickup';
      $('#sum-ship').textContent = bag.method === 'ship' ? (t.ship ? money(t.ship) : 'Free') : 'Free';
      $('#sum-tax').textContent = money(t.tax);
      $('#sum-total').textContent = money(t.total);
      const freeLeft = SHIPPING.freeFrom - t.sub;
      const bar = $('#free-ship');
      bar.hidden = bag.method !== 'ship';
      $('#free-ship-text').textContent = freeLeft > 0 ? money(freeLeft) + ' more for free shipping' : 'Your order ships free';
      $('#free-ship-bar').style.width = Math.min(100, Math.round((t.sub / SHIPPING.freeFrom) * 100)) + '%';
      $('#sum-when').innerHTML = readiness(bag.method).map((s) => '<li class="flex gap-2"><span class="mt-2 dot text-pine" aria-hidden="true"></span><span>' + escapeHtml(s) + '</span></li>').join('');
      $$('[data-ship-only]').forEach((el) => { el.hidden = bag.method !== 'ship'; });
      $$('[data-pickup-only]').forEach((el) => { el.hidden = bag.method !== 'pickup'; });
      $('#place-label').textContent = 'Place order · ' + money(t.total);
      if (focusSel) { const el = $(focusSel) || $('#bag-heading'); if (el) el.focus(); }
    }
    listEl.addEventListener('click', (e) => {
      const q = e.target.closest('[data-qty]');
      const r = e.target.closest('[data-remove]');
      if (q) {
        const i = +q.getAttribute('data-qty');
        const delta = +q.getAttribute('data-delta');
        const lines = bag.lines.map((l, k) => (k === i ? { id: l.id, format: l.format, qty: Math.min(MAX_QTY, Math.max(1, l.qty + delta)) } : l));
        saveBag({ lines: lines, method: bag.method, gift: bag.gift });
        const same = $('[data-qty="' + i + '"][data-delta="' + delta + '"]');
        (same && !same.disabled ? same : $('[data-qty="' + i + '"][data-delta="' + -delta + '"]'))?.focus();
      } else if (r) {
        const i = +r.getAttribute('data-remove');
        const b = lineBook(bag.lines[i]);
        saveBag({ lines: bag.lines.filter((l, k) => k !== i), method: bag.method, gift: bag.gift });
        toast('Removed <strong>' + escapeHtml(b.title) + '</strong> from your bag.');
        const next = $('[data-remove="' + Math.min(i, bag.lines.length - 1) + '"]');
        if (next) next.focus(); else { const h = $('#bag-empty h2'); if (h) h.focus(); }
      }
    });
    $$('input[name="method"]').forEach((r) => r.addEventListener('change', () => { if (r.checked) saveBag({ lines: bag.lines, method: r.value === 'ship' ? 'ship' : 'pickup', gift: bag.gift }); }));
    $('#gift-wrap').addEventListener('change', (e) => saveBag({ lines: bag.lines, method: bag.method, gift: e.target.checked }));
    bagListeners.push(() => render());

    // Suggestions for an empty bag.
    $('#bag-suggest').innerHTML = BOOKS.filter((b) => b.pick).slice(0, 4).map((b) => '<li>' + bookCard(b, { compact: true }) + '</li>').join('');

    // To take payment: send the order to your shop system or payment provider here (for example a
    // fetch() to your server that creates a checkout session), and show the confirmation only
    // when it answers OK. As written, nothing is charged or sent.
    setupValidation(form, () => {
      const t = totals();
      const ref = reference('LB', 5);
      const first = cleanText($('#co-name').value, 80).split(/\s+/)[0];
      const items = bag.lines.map((l) => ({ title: lineBook(l).title, format: FORMATS[l.format].label, qty: l.qty }));
      const when = readiness(bag.method);
      write(KEYS.lastOrder, { ref: ref, total: t.total, method: bag.method, items: items });
      $('#done-ref').textContent = ref;
      $('#done-name').textContent = first;
      $('#done-total').textContent = money(t.total);
      $('#done-items').innerHTML = items.map((it) => '<li class="flex justify-between gap-4 border-b border-line py-2"><span>' + escapeHtml(it.title) + ' <span class="text-muted">· ' + it.format + (it.qty > 1 ? ' × ' + it.qty : '') + '</span></span></li>').join('');
      $('#done-when').innerHTML = when.map((s) => '<li>' + escapeHtml(s) + '</li>').join('');
      $('#done-next').textContent = bag.method === 'ship'
        ? 'We’ll pack your books and send a payment link to ' + cleanText($('#co-email').value, 120) + ' before anything ships. Questions? Call ' + SHOP.phone + '.'
        : 'Pay at the counter when you pick up, at ' + SHOP.address + '. We hold pickup orders for 14 days. Questions? Call ' + SHOP.phone + '.';
      saveBag({ lines: [], method: bag.method, gift: false });
      filled.hidden = true;
      empty.hidden = true;
      done.hidden = false;
      $('#done-heading').focus();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    render();
  }

  function initEvents() {
    const listEl = $('#events-list');
    if (!listEl) return;
    const p = urlParams();
    let type = has(EVENT_TYPES, p.get('type')) ? p.get('type') : '';
    const filterBox = $('#event-filters');
    filterBox.innerHTML = '<button type="button" class="chip" data-type="" aria-pressed="false">All events</button>' +
      Object.keys(EVENT_TYPES).map((t) => '<button type="button" class="chip" data-type="' + t + '" aria-pressed="false">' + EVENT_TYPES[t].label + '</button>').join('');
    const sel = $('#rsvp-event');
    const anchorId = (key) => key.replace(/[^a-z0-9]/gi, '-');
    function itemHtml(e) {
      const art = e.book ? '<a href="' + bookUrl(e.book) + '" class="art cover-shadow hidden w-20 shrink-0 self-start overflow-hidden rounded-r-sm sm:block" tabindex="-1" aria-hidden="true"><span class="block aspect-[2/3]">' + coverArt(e.book) + '</span></a>'
        : '<span class="art hidden w-20 shrink-0 self-start overflow-hidden rounded-md sm:block"><span class="block aspect-[3/4]">' + storyArt(e.theme || '') + '</span></span>';
      const left = seatsLeft(e);
      const mine = rsvps.filter((r) => r.key === e.key)[0];
      return '<li id="' + anchorId(e.key) + '" class="reveal flex scroll-mt-28 gap-4 border-b border-line py-6 sm:gap-6">' + dateBlock(e.date) +
        '<div class="min-w-0 flex-1"><p class="text-[12.5px] font-bold uppercase tracking-[0.18em] text-vermilion-ink">' + EVENT_TYPES[e.type].one + ' · ' + timeRange(e.start, e.end) + '</p>' +
        '<h3 class="mt-1.5 font-display text-[1.3rem] font-semibold leading-snug sm:text-[1.45rem]">' + escapeHtml(e.title) + '</h3>' +
        '<p class="mt-2 text-[15.5px] leading-relaxed text-muted">' + escapeHtml(e.blurb) + '</p>' +
        '<div class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">' +
          (mine ? '<span class="tag bg-pine-tint text-pine"><svg viewBox="0 0 24 24" class="size-3.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 5 5 9-10"/></svg>You’re going · ' + plural(mine.seats, 'seat', 'seats') + '</span>'
            : '<button type="button" class="inline-flex min-h-10 items-center rounded-md bg-pine px-4 text-[14.5px] font-bold text-white transition hover:bg-pine-deep" data-rsvp="' + escapeHtml(e.key) + '">RSVP<span class="sr-only">: ' + escapeHtml(e.title) + ', ' + fmtDate(e.date) + '</span></button>') +
          '<span class="text-[14px] text-muted">Free · ' + plural(left, 'seat', 'seats') + ' left</span>' +
          (e.book ? '<a href="' + bookUrl(e.book) + '" class="link text-[14.5px]">' + (e.kind === 'club' ? 'This month’s book' : 'About the book') + '<span class="sr-only">: ' + escapeHtml(e.book.title) + '</span></a>' : '') +
        '</div></div>' + art + '</li>';
    }
    function render() {
      $$('[data-type]', filterBox).forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-type') === type)));
      const list = eventsList().filter((e) => !type || e.type === type);
      let html = '', month = '';
      list.forEach((e) => {
        const m = e.date.slice(0, 7);
        if (m !== month) {
          if (month) html += '</ol></section>';
          month = m;
          html += '<section aria-labelledby="m-' + m + '"><h2 id="m-' + m + '" class="sticky top-[4.5rem] z-10 -mx-1 border-b-2 border-ink bg-paper/95 px-1 pt-6 pb-2 font-display text-[1.6rem] font-semibold backdrop-blur">' + fmtDate(e.date, { weekday: undefined, day: undefined, year: 'numeric' }) + '</h2><ol>';
        }
        html += itemHtml(e);
      });
      if (month) html += '</ol></section>';
      listEl.innerHTML = html;
      $('#events-count').textContent = plural(list.length, 'event', 'events') + ' in the next ' + Math.round(EVENT_HORIZON_DAYS / 7) + ' weeks' + (type ? ' · ' + EVENT_TYPES[type].label.toLowerCase() : '');
      const qs = type ? '?type=' + type : '';
      history.replaceState(null, '', location.pathname + qs + location.hash);
      reveal(listEl);
    }
    function renderSelect(selected) {
      const opts = eventsList().filter((e) => !rsvps.some((r) => r.key === e.key) && seatsLeft(e) > 0);
      sel.innerHTML = '<option value="">Choose an event</option>' + opts.map((e) => '<option value="' + escapeHtml(e.key) + '"' + (e.key === selected ? ' selected' : '') + '>' + escapeHtml(shortDate(e.date) + ', ' + clock(toMins(e.start)) + ': ' + e.title) + '</option>').join('');
    }
    function renderMine() {
      const box = $('#my-rsvps');
      $$('[data-rsvp-count]').forEach((el) => { el.textContent = plural(rsvps.length, 'event', 'events'); });
      $('#my-rsvps-empty').hidden = rsvps.length > 0;
      box.innerHTML = rsvps.map((r) => {
        const e = findEvent(r.key);
        return '<li class="flex items-start justify-between gap-3 border-b border-paper/15 py-3"><span class="min-w-0"><span class="block font-bold">' + escapeHtml(e.title) + '</span><span class="text-[14px] text-paper/80">' + fmtDate(e.date) + ', ' + timeRange(e.start, e.end) + ' · ' + plural(r.seats, 'seat', 'seats') + ' · ' + r.ref + '</span></span>' +
          '<button type="button" class="shrink-0 text-[14px] font-bold text-paper underline decoration-paper/40 underline-offset-4 hover:decoration-paper" data-cancel="' + escapeHtml(r.key) + '">Cancel<span class="sr-only"> RSVP for ' + escapeHtml(e.title) + '</span></button></li>';
      }).join('');
    }
    function seatsOptions() {
      const e = findEvent(sel.value);
      const max = e ? Math.min(RSVP_MAX, seatsLeft(e)) : RSVP_MAX;
      const seats = $('#rsvp-seats');
      const cur = +seats.value || 1;
      seats.innerHTML = Array.from({ length: max }, (_, i) => '<option value="' + (i + 1) + '"' + (i + 1 === Math.min(cur, max) ? ' selected' : '') + '>' + plural(i + 1, 'seat', 'seats') + '</option>').join('');
    }
    filterBox.addEventListener('click', (e) => {
      const b = e.target.closest('[data-type]');
      if (!b) return;
      type = has(EVENT_TYPES, b.getAttribute('data-type')) ? b.getAttribute('data-type') : '';
      render();
    });
    listEl.addEventListener('click', (e) => {
      const b = e.target.closest('[data-rsvp]');
      if (!b) return;
      renderSelect(b.getAttribute('data-rsvp'));
      sel.value = b.getAttribute('data-rsvp');
      seatsOptions();
      showError(sel, '');
      $('#rsvp').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      setTimeout(() => $('#rsvp-name').focus({ preventScroll: true }), reduceMotion ? 0 : 400);
    });
    sel.addEventListener('change', seatsOptions);
    $('#my-rsvps').addEventListener('click', (e) => {
      const b = e.target.closest('[data-cancel]');
      if (!b) return;
      const key = b.getAttribute('data-cancel');
      const ev = findEvent(key);
      rsvps = rsvps.filter((r) => r.key !== key);
      eventsCache = null;
      write(KEYS.rsvps, rsvps.length ? rsvps : null);
      render(); renderSelect(''); renderMine(); seatsOptions();
      toast('Your RSVP for <strong>' + escapeHtml(ev ? ev.title : 'that event') + '</strong> is canceled. Thanks for letting us know.');
      $('#my-rsvps-heading').focus();
    });
    const form = $('#rsvp-form');
    // To connect RSVPs to your booking system, send the form here and update the page when it answers OK.
    setupValidation(form, () => {
      const ev = findEvent(sel.value);
      const seats = Math.min(RSVP_MAX, Math.max(1, +$('#rsvp-seats').value || 1));
      if (!ev || seatsLeft(ev) < seats) { showError(sel, 'Sorry, that event no longer has enough seats. Please choose another.'); sel.focus(); return; }
      const name = cleanText($('#rsvp-name').value, 60);
      const ref = reference('EV', 4);
      rsvps.push({ key: ev.key, date: ev.date, seats: seats, name: name, ref: ref });
      eventsCache = null;
      write(KEYS.rsvps, rsvps);
      $('#rsvp-status').innerHTML = '<p class="font-display text-[1.25rem] font-semibold">You’re on the list, ' + escapeHtml(name.split(/\s+/)[0]) + '.</p><p class="mt-1">' + plural(seats, 'seat', 'seats') + ' for ' + escapeHtml(ev.title) + ', ' + fmtDate(ev.date) + ' at ' + clock(toMins(ev.start)) + '. Your reference is <strong>' + ref + '</strong>; just give your name at the door.</p>';
      $('#rsvp-status').hidden = false;
      form.reset();
      render(); renderSelect(''); renderMine(); seatsOptions();
      $('#rsvp-status').focus();
    });
    render();
    renderSelect('');
    seatsOptions();
    renderMine();
    if (location.hash) {
      const target = document.getElementById(location.hash.slice(1));
      if (target) setTimeout(() => target.scrollIntoView({ block: 'start' }), 60);
    }
  }

  function initClubs() {
    const grid = $('#club-grid');
    if (!grid) return;
    let joined = loadClubs();
    function render() {
      grid.innerHTML = CLUBS.map((c) => {
        const meetings = clubMeetings(c, 3);
        const pick = clubPick(c, meetings[0]);
        const isMember = joined.indexOf(c.id) !== -1;
        return '<article class="reveal flex flex-col overflow-hidden rounded-md bg-leaf ring-1 ring-line" id="club-' + c.id + '" aria-labelledby="club-' + c.id + '-name">' +
          '<div class="flex gap-5 bg-pine p-5 text-white on-dark sm:p-6">' +
            '<a href="' + bookUrl(pick) + '" class="art cover-shadow block w-24 shrink-0 self-start overflow-hidden rounded-r-sm sm:w-28" tabindex="-1" aria-hidden="true"><span class="block aspect-[2/3]">' + coverArt(pick) + '</span></a>' +
            '<div class="min-w-0"><p class="text-[12.5px] font-bold uppercase tracking-[0.18em] text-brass">' + escapeHtml(c.audience) + '</p>' +
            '<h2 id="club-' + c.id + '-name" class="mt-1 font-display text-[1.6rem] font-semibold leading-tight">' + escapeHtml(c.name) + '</h2>' +
            '<p class="mt-2 text-[15px] text-white/85">' + clubRuleText(c) + '</p>' +
            (isMember ? '<p class="mt-3"><span class="tag bg-paper text-pine">You’re a member</span></p>' : '') + '</div></div>' +
          '<div class="flex flex-1 flex-col p-5 sm:p-6">' +
            '<p class="text-[15.5px] leading-relaxed text-muted">' + escapeHtml(c.blurb) + '</p>' +
            '<p class="mt-4 text-[15px]"><span class="font-bold">Next meeting:</span> ' + fmtDate(meetings[0]) + '</p>' +
            '<p class="mt-1 text-[15px]"><span class="font-bold">Reading:</span> <a href="' + bookUrl(pick) + '" class="link">' + escapeHtml(pick.title) + '</a> by ' + escapeHtml(pick.author) + '</p>' +
            '<p class="mt-1 text-[15px]"><span class="font-bold">Host:</span> ' + escapeHtml(STAFF_NAME(c.host)) + '</p>' +
            '<h3 class="mt-5 text-[12.5px] font-bold uppercase tracking-[0.18em] text-muted">Coming up</h3>' +
            '<ul class="mt-2 divide-y divide-line">' + meetings.slice(1).map((d) => {
              const b = clubPick(c, d);
              return '<li class="flex items-center justify-between gap-3 py-2 text-[15px]"><span>' + fmtDate(d, { weekday: undefined, day: undefined }) + '</span><a href="' + bookUrl(b) + '" class="text-right font-bold hover:underline underline-offset-4">' + escapeHtml(b.title) + '</a></li>';
            }).join('') + '</ul>' +
            '<div class="mt-auto pt-5"><a href="#join" class="btn-ghost min-h-11 w-full" data-join="' + c.id + '">' + (isMember ? 'Change your clubs' : 'Join ' + escapeHtml(c.name)) + '</a></div>' +
          '</div></article>';
      }).join('');
      $('#join-clubs').innerHTML = CLUBS.map((c) => '<label class="option items-start gap-3"><input type="checkbox" name="clubs" value="' + c.id + '" class="mt-1 size-4 shrink-0 accent-[#17463a]"' + (joined.indexOf(c.id) !== -1 ? ' checked' : '') + '>' +
        '<span><span class="block font-bold">' + escapeHtml(c.name) + '</span><span class="text-[14px] text-muted">' + clubRuleText(c) + '</span></span></label>').join('');
      $$('[data-club-member-count]').forEach((el) => { el.textContent = joined.length ? 'You’re in ' + plural(joined.length, 'club', 'clubs') + ': ' + listText(joined.map((id) => CLUB_BY_ID[id].name)) + '.' : ''; el.hidden = !joined.length; });
      reveal(grid);
    }
    grid.addEventListener('click', (e) => {
      const a = e.target.closest('[data-join]');
      if (!a) return;
      const box = $('#join-clubs input[value="' + a.getAttribute('data-join') + '"]');
      if (box) box.checked = true;
    });
    // Each club's next three meetings and their books.
    const table = $('#picks-table');
    if (table) {
      table.innerHTML = CLUBS.map((c) => '<tr class="border-t border-line"><th scope="row" class="py-3 pr-4 text-left font-bold">' + escapeHtml(c.name) + '</th>' +
        clubMeetings(c, 3).map((d) => { const b = clubPick(c, d); return '<td class="py-3 pr-4 align-top"><a href="' + bookUrl(b) + '" class="font-display font-semibold hover:underline underline-offset-4">' + escapeHtml(b.title) + '</a><span class="block text-[13.5px] text-muted">' + fmtDate(d, { weekday: 'short', month: 'short' }) + '</span></td>'; }).join('') + '</tr>').join('');
    }
    const form = $('#join-form');
    setupValidation(form, () => {
      const chosen = $$('#join-clubs input:checked').map((i) => i.value).filter((id) => has(CLUB_BY_ID, id));
      const first = cleanText($('#join-name').value, 60).split(/\s+/)[0];
      joined = chosen;
      write(KEYS.clubs, joined);
      const ref = reference('BC', 4);
      const status = $('#join-status');
      status.innerHTML = '<p class="font-display text-[1.35rem] font-semibold">Welcome to the club' + (chosen.length > 1 ? 's' : '') + ', ' + escapeHtml(first) + '.</p><p class="mt-1">You’re signed up for ' + escapeHtml(listText(chosen.map((id) => CLUB_BY_ID[id].name))) + ' (reference ' + ref + '). Your 15% member discount on club books starts today: just mention it at the counter. ' +
        escapeHtml(CLUB_BY_ID[chosen[0]].name) + ' next meets ' + fmtDate(clubMeetings(CLUB_BY_ID[chosen[0]], 1)[0]) + '.</p>';
      status.hidden = false;
      render();
      status.focus();
    });
    // At least one club must be ticked.
    form.addEventListener('change', () => { const err = $('#join-clubs-set-error'); if (err && $$('#join-clubs input:checked').length) err.textContent = ''; });
    render();
  }

  function initFinder() {
    const form = $('#finder-form');
    if (!form) return;
    const steps = $$('[data-step]', form);
    const results = $('#finder-results');
    let step = 0;
    // Build the questions from QUIZ.
    QUIZ.forEach((q, i) => {
      const box = $('[data-step="' + i + '"] [data-options]', form);
      box.innerHTML = q.options.map((o) => '<label class="option items-center gap-3"><input type="radio" class="sr-only" name="' + q.id + '" value="' + o.id + '"><span class="grid size-5 shrink-0 place-items-center rounded-full ring-2 ring-ink/30" aria-hidden="true"><span class="size-2.5 rounded-full bg-pine opacity-0 transition [label:has(input:checked)_&]:opacity-100"></span></span><span class="font-bold">' + escapeHtml(o.label) + '</span></label>').join('');
    });
    function answerFor(q) { const r = $('input[name="' + q.id + '"]:checked', form); return r ? q.options.filter((o) => o.id === r.value)[0] : null; }
    function show(i) {
      step = i;
      steps.forEach((s, k) => { s.hidden = k !== i; });
      $('#finder-progress').textContent = 'Question ' + (i + 1) + ' of ' + QUIZ.length;
      $('#finder-bar').style.width = Math.round(((i + 1) / QUIZ.length) * 100) + '%';
      $('#finder-back').hidden = i === 0;
      $('#finder-next-label').textContent = i === QUIZ.length - 1 ? 'Show my books' : 'Next question';
      $('#finder-error').textContent = '';
    }
    const STRETCH_WHY = { adult: 'An adult book teens love too', teen: 'For confident readers, 12 and up', middle: 'A chapter book for ages 8 to 12', young: 'A read-aloud for ages 3 to 7' };
    const ADJACENT = { adult: ['teen'], teen: ['adult', 'middle'], middle: ['teen', 'young'], young: ['middle'] };
    function score(b, a) {
      let s = 0;
      const why = [];
      if (a.mood && b.moods.indexOf(a.mood.mood) !== -1) { s += 3 + (b.moods[0] === a.mood.mood ? 1 : 0); why.push(MOOD_WHY[a.mood.mood]); }
      if (a.time && (b.audience === 'adult' || b.audience === 'teen')) {
        if (b.pages >= a.time.min && b.pages <= a.time.max) { s += 2; why.push(b.pages + ' pages: ' + TIME_WHY[a.time.id]); }
      }
      if (a.format && a.format.format) {
        if (has(b.formats, a.format.format)) { s += 1; why.push('Comes in ' + FORMATS[a.format.format].label.toLowerCase() + ' (' + money(b.formats[a.format.format]) + ')'); } else s -= 2;
      }
      if (b.pick) { s += 0.6; why.push(STAFF[b.pick].first + '’s staff pick'); }
      if (isNew(b) || isPreorder(b)) s += 0.2;
      return { b: b, s: s, why: why };
    }
    const MOOD_WHY = { cozy: 'Warm and comforting', gripping: 'Hard to put down', thoughtful: 'Gives you plenty to think about', otherworldly: 'Takes you somewhere else entirely', true: 'A true story, well told', funny: 'Genuinely funny' };
    const TIME_WHY = { evening: 'one or two evenings', weekend: 'right for a long weekend', season: 'a proper long read' };
    function compute(ans) {
      const aud = ans.for ? ans.for.audience : 'adult';
      let pool = BOOKS.filter((b) => b.audience === aud).map((b) => score(b, ans)).sort((x, y) => y.s - x.s);
      if (pool.length < 3) {
        const extra = BOOKS.filter((b) => (ADJACENT[aud] || []).indexOf(b.audience) !== -1).map((b) => { const r = score(b, ans); r.s -= 2; r.why.unshift(STRETCH_WHY[b.audience]); return r; }).sort((x, y) => y.s - x.s);
        pool = pool.concat(extra.slice(0, 3 - pool.length));
      }
      return pool.slice(0, 3);
    }
    function showResults(ans) {
      const top = compute(ans);
      form.hidden = true;
      results.hidden = false;
      $('#finder-summary').textContent = [ans.for && ans.for.label, ans.mood && ans.mood.label.toLowerCase(), ans.time && ans.time.label.toLowerCase(), ans.format && ans.format.label.split(',')[0].toLowerCase()].filter(Boolean).join(' · ');
      $('#finder-list').innerHTML = top.map((r, i) => {
        const b = r.b;
        const f = ans.format && ans.format.format && has(b.formats, ans.format.format) ? ans.format.format : formatsOf(b)[0];
        return '<li class="reveal grid gap-5 rounded-md bg-leaf p-5 ring-1 ring-line sm:grid-cols-[8rem_1fr] sm:p-6">' +
          '<a href="' + bookUrl(b, f) + '" class="art cover-shadow block w-28 self-start overflow-hidden rounded-r-sm sm:w-32" tabindex="-1" aria-hidden="true"><span class="block aspect-[2/3]">' + coverArt(b) + '</span></a>' +
          '<div class="min-w-0"><p class="kicker">' + (i === 0 ? 'Our best match' : 'Also try') + '</p>' +
          '<h3 class="mt-1 font-display text-[1.45rem] font-semibold leading-tight"><a href="' + bookUrl(b, f) + '" class="hover:underline underline-offset-4">' + escapeHtml(b.title) + '</a></h3>' +
          '<p class="mt-1 text-[15px] text-muted">' + escapeHtml(b.author) + ' · ' + escapeHtml(genreLabel(b)) + '</p>' +
          '<p class="mt-3 text-[15.5px] leading-relaxed">' + escapeHtml(b.blurb) + '</p>' +
          '<ul class="mt-3 flex flex-wrap gap-2">' + r.why.slice(0, 3).map((w) => '<li class="tag bg-pine-tint text-pine">' + escapeHtml(w) + '</li>').join('') + '</ul>' +
          '<div class="mt-4 flex flex-wrap items-center gap-3"><button type="button" class="btn-primary min-h-11" data-quick-add="' + b.id + '" data-format="' + f + '"><span data-btn-label>' + (isPreorder(b) ? 'Preorder' : 'Add to bag') + ' · ' + money(b.formats[f]) + '</span></button>' +
          '<span class="text-[14px] text-muted">' + FORMATS[f].label + ' · ' + escapeHtml(availability(b, f).short) + '</span></div></div></li>';
      }).join('');
      reveal(results);
    }
    function collect() {
      const out = {};
      QUIZ.forEach((q) => { out[q.id] = answerFor(q); });
      return out;
    }
    $('#finder-back').addEventListener('click', () => show(Math.max(0, step - 1)));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const q = QUIZ[step];
      if (!answerFor(q)) { $('#finder-error').textContent = 'Please choose one answer.'; const first = $('input[name="' + q.id + '"]', form); if (first) first.focus(); return; }
      if (step < QUIZ.length - 1) { show(step + 1); const first = $('[data-step="' + step + '"] legend', form); if (first) first.focus(); return; }
      const ans = collect();
      write(KEYS.finder, QUIZ.reduce((m, q2) => { m[q2.id] = ans[q2.id] ? ans[q2.id].id : null; return m; }, {}));
      showResults(ans);
      $('#finder-results-heading').focus();
    });
    $('#finder-restart').addEventListener('click', () => {
      write(KEYS.finder, null);
      form.reset();
      results.hidden = true;
      form.hidden = false;
      show(0);
      $('[data-step="0"] legend', form).focus();
    });
    // Restore saved answers: check each saved option id against the question's own options.
    const saved = read(KEYS.finder);
    if (saved && typeof saved === 'object') {
      const ok = QUIZ.every((q) => has(saved, q.id) && q.options.some((o) => o.id === saved[q.id]));
      if (ok) {
        QUIZ.forEach((q) => { const r = $('input[name="' + q.id + '"][value="' + saved[q.id] + '"]', form); if (r) r.checked = true; });
        show(QUIZ.length - 1);
        showResults(collect());
        return;
      }
    }
    show(0);
  }

  function initVisit() {
    const week = $('#hours-week');
    if (week) {
      const t = today();
      week.innerHTML = Array.from({ length: 7 }, (_, i) => {
        const d = addDays(t, i);
        const h = hoursOn(d), c = hoursOn(d, true), hol = holidayOn(d);
        return '<tr class="border-t border-line' + (i === 0 ? ' bg-pine-tint/70' : '') + '"><th scope="row" class="py-3 pl-3 pr-4 text-left font-bold">' + (i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_NAMES[dayOf(d)]) + '<span class="block text-[13.5px] font-normal text-muted">' + monthDay(d) + (hol ? ' · ' + escapeHtml(hol.name) : '') + '</span></th>' +
          '<td class="py-3 pr-4">' + (h ? timeRange(h[0], h[1]) : '<span class="font-bold text-vermilion-ink">Closed</span>') + '</td>' +
          '<td class="py-3 pr-3">' + (c ? timeRange(c[0], c[1]) : '<span class="text-muted">Closed</span>') + '</td></tr>';
      }).join('');
    }
    const usual = $('#hours-usual');
    if (usual) {
      const groups = [[1, 4], [5, 6], [0, 0]];
      usual.innerHTML = groups.map((g) => {
        const h = HOURS[g[0]], c = CAFE_HOURS[g[0]];
        return '<div class="flex justify-between gap-4 border-b border-paper/15 py-2.5"><dt>' + (g[0] === g[1] ? DAY_NAMES[g[0]] : DAY_NAMES[g[0]] + ' to ' + DAY_NAMES[g[1]]) + '</dt><dd class="text-right">' + (h ? timeRange(h[0], h[1]) : 'Closed') + '<span class="block text-[13.5px] text-paper/75">Café ' + (c ? timeRange(c[0], c[1]) : 'closed') + '</span></dd></div>';
      }).join('');
    }
    const hol = $('#holidays');
    if (hol) {
      hol.innerHTML = upcomingHolidays(6).map((h) => '<li class="flex items-baseline justify-between gap-4 border-b border-line py-2.5"><span><span class="font-bold">' + escapeHtml(h.name) + '</span><span class="block text-[14px] text-muted">' + fmtDate(h.date, { year: 'numeric' }) + '</span></span><span class="shrink-0 text-right text-[15px] ' + (h.hours ? '' : 'font-bold text-vermilion-ink') + '">' + (h.hours ? timeRange(h.hours[0], h.hours[1]) : 'Closed') + '</span></li>').join('');
    }
    const form = $('#contact-form');
    if (form) {
      const topic = $('#ct-topic');
      const showFor = () => $$('[data-show-for]', form).forEach((el) => { el.hidden = el.getAttribute('data-show-for').split(' ').indexOf(topic.value) === -1; });
      topic.addEventListener('change', showFor);
      showFor();
      // To connect this form, replace successSwap(...) with a fetch() to your form service and show
      // the success panel only when it answers OK (see DOCS.md, "Forms").
      setupValidation(form, () => {
        const first = cleanText($('#ct-name').value, 80).split(/\s+/)[0];
        const special = topic.value === 'special';
        const ref = reference(special ? 'SO' : 'LM', 4);
        successSwap(form, '<p class="display text-[2rem]">Thanks, ' + escapeHtml(first) + '.</p>' +
          '<p class="mt-3 max-w-lg text-[17px] leading-relaxed">' + (special
            ? 'We’ve got your special order request (reference <strong>' + ref + '</strong>). We’ll check with our distributors and get back to you within one business day with a price and a date. Most books arrive in ' + ORDER_IN_DAYS[0] + ' to ' + ORDER_IN_DAYS[1] + ' business days.'
            : 'Your message is with us (reference <strong>' + ref + '</strong>). A bookseller will reply within one business day, usually sooner.') + '</p>');
      });
    }
  }

  /* ------------------------------------------------------------------
   * 12. Forms and start
   * ------------------------------------------------------------------ */
  const US_STATES = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');
  function fieldMessage(el) {
    const v = el.value.trim();
    const label = el.getAttribute('data-label') || 'This field';
    if (el.tagName === 'SELECT' && el.required && !v) return 'Please choose ' + (el.getAttribute('data-choose') || 'an option') + '.';
    if (el.required && !v) return label + ' is required.';
    if (!v) return '';
    if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Please enter an email address like name@example.com.';
    if (el.type === 'tel' && v.replace(/\D/g, '').length < 10) return 'Please enter a 10-digit phone number, or leave it blank.';
    if (el.hasAttribute('data-zip') && !/^\d{5}(-\d{4})?$/.test(v)) return 'Please enter a 5-digit ZIP code.';
    if (el.hasAttribute('data-state') && US_STATES.indexOf(v.toUpperCase()) === -1) return 'Please enter a two-letter state, like VT.';
    if (el.minLength > 0 && v.length < el.minLength) return label + ' needs at least ' + el.minLength + ' characters.';
    return '';
  }
  function showError(el, msg) {
    const errId = el.id + '-error';
    let err = document.getElementById(errId);
    if (!err) {
      err = document.createElement('p');
      err.id = errId;
      err.className = 'field-error';
      err.setAttribute('aria-live', 'polite');
      el.insertAdjacentElement('afterend', err);
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
  function isField(el) {
    return el.matches('input, select, textarea') && el.type !== 'radio' && el.type !== 'checkbox' && el.type !== 'hidden' && el.type !== 'submit' && !!el.id && !el.hasAttribute('data-no-validate');
  }
  function fieldsOf(root) {
    return $$('input, select, textarea', root).filter((el) => isField(el) && !el.closest('[hidden]'));
  }
  function validate(form) {
    let firstBad = null;
    fieldsOf(form).forEach((el) => {
      const msg = fieldMessage(el);
      showError(el, msg);
      if (msg && !firstBad) firstBad = el;
    });
    $$('[hidden] .field', form).forEach((el) => { if (el.id && el.hasAttribute('aria-invalid')) showError(el, ''); });
    // Checkbox groups that need at least one: <fieldset data-need-one id="x"> + <p id="x-error">.
    $$('[data-need-one]', form).forEach((fs) => {
      const err = document.getElementById(fs.id + '-error');
      const ok = $$('input:checked', fs).length > 0;
      if (err) err.textContent = ok ? '' : fs.getAttribute('data-need-one');
      if (!ok && !firstBad) firstBad = $('input', fs);
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
    if (!form) return;
    form.setAttribute('novalidate', '');
    form.addEventListener('focusout', (e) => {
      const el = e.target;
      if (isField(el) && (el.value.trim() || el.hasAttribute('aria-invalid'))) showError(el, fieldMessage(el));
    });
    form.addEventListener('input', (e) => {
      const el = e.target;
      if (isField(el) && el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el));
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validate(form)) onValid(form);
    });
  }
  function successSwap(form, html, dark) {
    const box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.className = dark ? 'rounded-md bg-paper/10 p-5 text-paper focus:outline-none' : 'rounded-md bg-pine-tint p-6 text-ink focus:outline-none sm:p-8';
    box.innerHTML = html;
    form.replaceWith(box);
    box.focus();
  }

  // To connect the newsletter form: replace successSwap(...) with a fetch() to your email service, e.g.
  // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  //   .then((r) => r.ok ? successSwap(form, '…', true) : alert('Sorry, that didn’t go through.'));
  function initForms() {
    $$('[data-form="newsletter"]').forEach((form) => setupValidation(form, () => {
      successSwap(form, '<p class="font-display text-xl font-semibold">You’re on the list.</p><p class="mt-1 text-sm text-paper/85">The Larchmere Letter comes out on the first Friday of the month: new books, staff picks and the events calendar.</p>', true);
    }));
    $$('[data-count-for]').forEach((out) => {
      const field = document.getElementById(out.getAttribute('data-count-for'));
      if (!field) return;
      const upd = () => { out.textContent = plural(field.maxLength - field.value.length, 'character', 'characters') + ' left'; };
      field.addEventListener('input', upd);
      upd();
    });
  }

  $$('[data-year]').forEach((el) => { el.textContent = today().slice(0, 4); });
  // <div data-cover="book-id"> → that book's cover, anywhere on a page.
  $$('[data-cover]').forEach((el) => {
    const b = findBook(el.getAttribute('data-cover'));
    if (b) el.innerHTML = coverArt(b);
  });
  loadRsvps();
  renderStatus();
  setInterval(renderStatus, 30000);
  renderBagLinks();
  bagListeners.push(renderBagLinks);
  initForms();
  const page = document.body.getAttribute('data-page');
  if (page === 'home') initHome();
  if (page === 'shop') initShop();
  if (page === 'book') initBook();
  if (page === 'bag') initBag();
  if (page === 'events') initEvents();
  if (page === 'clubs') initClubs();
  if (page === 'finder') initFinder();
  if (page === 'visit') initVisit();
  reveal(document);
})();



/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It lifts itself above toasts so they never overlap, and
   steps aside while an in-page "Back to top" link (e.g. in a footer) is on screen.
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
