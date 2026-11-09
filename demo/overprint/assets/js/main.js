/* Pomelo Press — site script for the Overprint template.
 * Vanilla JavaScript, no dependencies. The content lives in assets/js/data.js.
 * Sections:
 *  1. Helpers and saved data (safeStorage)
 *  2. Studio clock: Louisville time, holidays, business days, ?now= preview
 *  3. Theme (light and dark paper)
 *  4. Artwork: riso plates drawn in SVG from a motif
 *  5. Header, mobile menu, reveal, toast, footer year
 *  6. Cart (localStorage) and the cart drawer
 *  7. Home            11. Checkout
 *  8. Work            12. Commissions (multi-step inquiry and estimate)
 *  9. Case study      13. About and contact
 * 10. Shop            14. Forms and boot
 */
(function () {
  'use strict';

  const D = window.OVERPRINT;
  if (!D) return;
  const { STUDIO, TYPES, USAGES, BUDGETS, RUSH, CATEGORIES, PROJECTS, SHOP_FILTERS, PRODUCTS, SHIPPING, TAX, MAX_QTY } = D;

  /* ------------------------------------------------------------------
   * 1. Helpers and saved data
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const has = (obj, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LOCALE = 'en-US';
  const money = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'USD' });
  // $28, but $28.50 when there are cents.
  function price(n) {
    const r = Math.round(n * 100) / 100;
    return Number.isInteger(r) ? money.format(r).replace(/\.00$/, '') : money.format(r);
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function urlParam(name) {
    const v = new URLSearchParams(location.search).get(name);
    return v === null ? null : v.trim().toLowerCase();
  }
  function setUrlParam(name, value) {
    const url = new URL(location.href);
    if (value) url.searchParams.set(name, value); else url.searchParams.delete(name);
    try { history.replaceState(null, '', url.pathname.split('/').pop() + url.search + url.hash); } catch (e) { /* file:// in some browsers */ }
  }
  function cleanText(value, max) {
    return typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, '').trim().slice(0, max) : '';
  }

  // localStorage, or an in-memory stand-in when the browser blocks it (a sandboxed iframe, strict
  // privacy settings): saved state then lasts for this page view instead of the feature breaking.
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
  const KEYS = { cart: 'overprint-cart', theme: 'overprint-theme' };
  function readJson(key) {
    try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; }
  }
  function writeJson(key, value) {
    try {
      if (value === null) safeStorage.removeItem(key);
      else safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage full: the page keeps working */ }
  }

  /* ------------------------------------------------------------------
   * 2. Studio clock. Dates are 'YYYY-MM-DD' strings in STUDIO.timeZone.
   *    Add ?now=2026-10-27T10:15 to any page to preview another time.
   * ------------------------------------------------------------------ */
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const pad = (n) => String(n).padStart(2, '0');
  const isIsoDate = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && !isNaN(Date.parse(s + 'T12:00:00Z')) && new Date(s + 'T12:00:00Z').toISOString().slice(0, 10) === s;
  const dayOf = (iso) => new Date(iso + 'T12:00:00Z').getUTCDay();
  const dayNum = (iso) => Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000);
  function addDays(iso, n) {
    const d = new Date(iso + 'T12:00:00Z');
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  const toMins = (t) => +t.slice(0, 2) * 60 + +t.slice(3, 5);
  // 660 → "11am", 990 → "4:30pm"
  function clock(mins) {
    const h = Math.floor(mins / 60) % 24, m = mins % 60;
    if (h === 12 && m === 0) return 'noon';
    return (h % 12 || 12) + (m ? ':' + pad(m) : '') + (h < 12 ? 'am' : 'pm');
  }
  const LOADED_AT = Date.now();
  const PREVIEW = (function () {
    const v = new URLSearchParams(location.search).get('now');
    if (!v || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) || !isIsoDate(v.slice(0, 10))) return null;
    const h = +v.slice(11, 13), m = +v.slice(14, 16);
    return h < 24 && m < 60 ? Date.parse(v + ':00Z') : null;
  })();
  // { date: 'YYYY-MM-DD', day: 0-6, mins: minutes since midnight } in the studio's time zone.
  function studioNow() {
    let y, mo, d, h, mi;
    if (PREVIEW !== null) {
      const t = new Date(PREVIEW + (Date.now() - LOADED_AT));
      y = t.getUTCFullYear(); mo = t.getUTCMonth() + 1; d = t.getUTCDate(); h = t.getUTCHours(); mi = t.getUTCMinutes();
    } else {
      const parts = {};
      new Intl.DateTimeFormat('en-US', { timeZone: STUDIO.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(new Date()).forEach((p) => { parts[p.type] = p.value; });
      y = +parts.year; mo = +parts.month; d = +parts.day; h = +parts.hour % 24; mi = +parts.minute;
    }
    const date = y + '-' + pad(mo) + '-' + pad(d);
    return { date: date, day: dayOf(date), mins: h * 60 + mi };
  }
  function fmtDate(iso, opts) {
    return new Date(iso + 'T12:00:00Z').toLocaleDateString(LOCALE, Object.assign({ timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric' }, opts || {}));
  }
  const shortDate = (iso) => fmtDate(iso, { weekday: 'short', month: 'short' });

  // The nth weekday of a month (nth = -1 for the last one).
  function nthWeekday(year, month, weekday, nth) {
    if (nth > 0) {
      const first = year + '-' + pad(month) + '-01';
      return addDays(first, ((weekday - dayOf(first) + 7) % 7) + (nth - 1) * 7);
    }
    const next = month === 12 ? (year + 1) + '-01-01' : year + '-' + pad(month + 1) + '-01';
    const last = addDays(next, -1);
    return addDays(last, -((dayOf(last) - weekday + 7) % 7));
  }
  // Days the studio is closed in a year, worked out by rule so it never needs updating.
  const holidayCache = Object.create(null);
  function holidays(year) {
    if (holidayCache[year]) return holidayCache[year];
    const set = Object.create(null);
    const add = (iso, name) => { set[iso] = name; };
    add(year + '-01-01', 'New Year’s Day');
    add(nthWeekday(year, 5, 1, -1), 'Memorial Day');
    add(year + '-06-19', 'Juneteenth');
    add(year + '-07-04', 'Independence Day');
    add(nthWeekday(year, 9, 1, 1), 'Labor Day');
    const thanks = nthWeekday(year, 11, 4, 4);
    add(thanks, 'Thanksgiving');
    add(addDays(thanks, 1), 'Thanksgiving');
    for (let d = year + '-' + STUDIO.winterBreakFrom; d.slice(0, 4) === String(year); d = addDays(d, 1)) add(d, 'Winter break');
    holidayCache[year] = set;
    return set;
  }
  const closedFor = (iso) => holidays(+iso.slice(0, 4))[iso] || null;
  const isWorkingDay = (iso) => dayOf(iso) !== 0 && dayOf(iso) !== 6 && !closedFor(iso);
  function nextWorkingDay(iso, inclusive) {
    let d = inclusive ? iso : addDays(iso, 1);
    while (!isWorkingDay(d)) d = addDays(d, 1);
    return d;
  }
  // The business day `n` business days after `iso` (n = 0 returns iso itself when it's a business day).
  function addWorkingDays(iso, n) {
    let d = nextWorkingDay(iso, true);
    for (let i = 0; i < n; i++) d = nextWorkingDay(d, false);
    return d;
  }
  // New commissions start on the first working Monday at least startLeadDays away.
  function earliestStart() {
    let d = addDays(studioNow().date, STUDIO.startLeadDays);
    d = addDays(d, (8 - dayOf(d)) % 7);
    return nextWorkingDay(d, true);
  }
  const replyBy = () => addWorkingDays(studioNow().date, STUDIO.replyWorkingDays);
  // Open studio: the nth given weekday of the month, from today on.
  function nextOpenStudio() {
    const now = studioNow();
    const o = STUDIO.openStudio;
    let y = +now.date.slice(0, 4), m = +now.date.slice(5, 7);
    for (let i = 0; i < 14; i++) {
      const d = nthWeekday(y, m, o.weekday, o.nth);
      if ((d > now.date || (d === now.date && now.mins < toMins(o.to))) && !closedFor(d)) return d;
      m++; if (m > 12) { m = 1; y++; }
    }
    return null;
  }
  // Shop orders go out on the next mail day after today that the studio is open.
  function nextMailDay() {
    let d = addDays(studioNow().date, 1);
    while (STUDIO.mailDays.indexOf(dayOf(d)) === -1 || closedFor(d)) d = addDays(d, 1);
    return d;
  }
  // Events, moved forward by whole 52-week years once they're over (KEEP_DEMO_CURRENT).
  function upcomingEvents() {
    const today = studioNow().date;
    return D.EVENTS.map((e) => {
      let date = e.date, end = e.end || e.date;
      if (D.KEEP_DEMO_CURRENT) {
        while (end < today) { date = addDays(date, 364); end = addDays(end, 364); }
      }
      return Object.assign({}, e, { date: date, end: end });
    }).filter((e) => e.end >= today).sort((a, b) => (a.date < b.date ? -1 : 1));
  }

  /* ------------------------------------------------------------------
   * 3. Theme. The inline script in <head> applies the saved choice (or the
   *    system setting) before paint; this keeps the toggle in step.
   * ------------------------------------------------------------------ */
  const root = document.documentElement;
  const themeMeta = $('meta[name="theme-color"]');
  function applyTheme(dark) {
    root.classList.toggle('dark', dark);
    if (themeMeta) themeMeta.setAttribute('content', dark ? '#1c1a23' : '#f7f0e1');
    $$('[data-theme-toggle]').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', 'Dark paper');
      const sun = $('[data-icon-sun]', btn), moon = $('[data-icon-moon]', btn);
      if (sun) sun.classList.toggle('hidden', !dark);
      if (moon) moon.classList.toggle('hidden', dark);
    });
  }
  (function initTheme() {
    const saved = safeStorage.getItem(KEYS.theme);
    const dark = saved === 'dark' || (saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    applyTheme(dark);
    $$('[data-theme-toggle]').forEach((btn) => btn.addEventListener('click', () => {
      const next = !root.classList.contains('dark');
      applyTheme(next);
      try { safeStorage.setItem(KEYS.theme, next ? 'dark' : 'light'); } catch (e) { /* ignore */ }
    }));
  })();

  /* ------------------------------------------------------------------
   * 4. Artwork. Every picture is drawn as separate ink plates (pink, blue,
   *    yellow) in a 400 × 500 box. Plates print with multiply on cream
   *    paper (screen on dark paper), slightly off register, with a rough
   *    edge and ink speckle from an SVG filter. Classes used in strings:
   *    text-pink text-blue text-yellow fill-card fill-paper-2 fill-ink
   * ------------------------------------------------------------------ */
  const INKS = ['pink', 'blue', 'yellow'];
  const INK_CLASS = { pink: 'text-pink', blue: 'text-blue', yellow: 'text-yellow' };
  const INK_NAMES = { pink: 'Fluorescent pink', blue: 'Federal blue', yellow: 'Yellow' };
  const SCREEN_ANGLE = { pink: 15, blue: 45, yellow: 75 };
  let artSeq = 0;

  function artDefs(uid) {
    return '<defs>' + INKS.map((ink) =>
      '<pattern id="ht-' + ink + '-' + uid + '" class="' + INK_CLASS[ink] + '" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(' + SCREEN_ANGLE[ink] + ')"><circle cx="4" cy="4" r="2.1" fill="currentColor"/></pattern>' +
      '<pattern id="hd-' + ink + '-' + uid + '" class="' + INK_CLASS[ink] + '" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(' + SCREEN_ANGLE[ink] + ')"><circle cx="3.5" cy="3.5" r="2.9" fill="currentColor"/></pattern>').join('') +
      '<filter id="ink-' + uid + '" x="-4%" y="-4%" width="108%" height="108%">' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="' + (artSeq % 9) + '" result="warp"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="warp" scale="4" xChannelSelector="R" yChannelSelector="G" result="rough"/>' +
        '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="4" result="grain"/>' +
        '<feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -0.8 1.22" result="mask"/>' +
        '<feComposite in="rough" in2="mask" operator="in"/>' +
      '</filter></defs>';
  }
  // One ink plate. @ht / @hd in the shapes become this ink's light / dense halftone.
  function plate(ink, shapes, reg, uid) {
    if (!shapes) return '';
    const off = reg || [0, 0];
    return '<g class="plate ' + INK_CLASS[ink] + '" data-ink="' + ink + '" fill="currentColor" transform="translate(' + off[0] + ' ' + off[1] + ')" filter="url(#ink-' + uid + ')">' +
      shapes.replace(/@ht/g, 'url(#ht-' + ink + '-' + uid + ')').replace(/@hd/g, 'url(#hd-' + ink + '-' + uid + ')') + '</g>';
  }

  // Small drawing helpers.
  const leaf = (x, y, w, h, rot) => '<path transform="translate(' + x + ' ' + y + ') rotate(' + rot + ')" d="M0 0Q' + (w / 2) + ' ' + (-h / 2) + ' 0 ' + (-h) + 'Q' + (-w / 2) + ' ' + (-h / 2) + ' 0 0z"/>';
  const circ = (x, y, r, extra) => '<circle cx="' + x + '" cy="' + y + '" r="' + r + '"' + (extra || '') + '/>';
  const rect = (x, y, w, h, extra) => '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '"' + (extra || '') + '/>';
  const line = (d, w) => '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="' + (w || 6) + '" stroke-linecap="round" stroke-linejoin="round"/>';
  function grid(x0, y0, cols, rows, dx, dy, w, h) {
    let out = '';
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) out += rect(x0 + c * dx, y0 + r * dy, w, h);
    return out;
  }
  function wedges(cx, cy, r, n, gap) {
    let out = '';
    for (let i = 0; i < n; i++) {
      const a0 = (i * 360 / n + gap) * Math.PI / 180, a1 = ((i + 1) * 360 / n - gap) * Math.PI / 180;
      const p = (a) => (cx + r * Math.cos(a)).toFixed(1) + ' ' + (cy + r * Math.sin(a)).toFixed(1);
      out += '<path d="M' + cx + ' ' + cy + 'L' + p(a0) + 'A' + r + ' ' + r + ' 0 0 1 ' + p(a1) + 'z"/>';
    }
    return out;
  }
  const text = (x, y, size, s, extra) => '<text x="' + x + '" y="' + y + '" font-size="' + size + '" text-anchor="middle" font-family="Rammetto One, Cooper Black, sans-serif"' + (extra || '') + '>' + s + '</text>';

  // Each motif returns the shapes for each ink plate (and optional `paper` shapes printed first).
  const MOTIFS = {
    moon: () => ({
      blue: rect(0, 0, 400, 330, ' fill="@ht"') + '<path d="M0 500V368l55-40 55 40v-18l65-52 65 52v12l55-42 55 42 50-34v172z"/>' + rect(196, 282, 16, 30) +
        rect(0, 470, 400, 30),
      yellow: '<path d="M95 112a85 85 0 0 0 170 0a85 56 0 0 1-170 0z"/>' + circ(52, 58, 5) + circ(330, 70, 7) + circ(300, 190, 4) + circ(40, 250, 4) + circ(372, 150, 5) + circ(150, 40, 3) +
        rect(140, 385, 24, 30) + rect(200, 376, 24, 30) + rect(58, 404, 22, 28) + rect(318, 398, 22, 28),
      pink: '<ellipse cx="118" cy="182" rx="78" ry="20"/>' + circ(342, 296, 14) + '<path d="M328 312h28l7 40h-42z"/>' +
        line('M292 344 236 182M312 344 256 182', 5) + line('M285.5 325h20M278.5 305h20M271.5 285h20M264.5 265h20M257.5 245h20M250.5 225h20M243.5 205h20', 4) + line('M332 322 303 302', 6)
    }),
    bus: () => ({
      blue: '<path d="M0 300Q90 210 190 280T400 250V420H0z" fill="@ht"/>' + rect(0, 410, 400, 90) + circ(115, 396, 32) + circ(290, 396, 32) + circ(96, 268, 13) + rect(84, 282, 24, 14, ' rx="6"'),
      yellow: circ(320, 100, 58) + rect(70, 248, 52, 46, ' rx="8"') + rect(135, 248, 52, 46, ' rx="8"') + rect(200, 248, 52, 46, ' rx="8"') + rect(265, 248, 52, 46, ' rx="8"') +
        rect(20, 452, 50, 10) + rect(120, 452, 50, 10) + rect(220, 452, 50, 10) + rect(320, 452, 50, 10) + circ(115, 396, 10) + circ(290, 396, 10),
      pink: rect(40, 220, 320, 160, ' rx="30"') + rect(120, 194, 160, 28, ' rx="6"') + rect(330, 300, 30, 24, ' rx="6"')
    }),
    mouse: () => ({
      blue: rect(0, 0, 400, 160, ' fill="@ht"') + line('M0 70Q200 140 400 70', 3) +
        '<path d="M20 170h360v40q-22 26-45 0q-22 26-45 0q-22 26-45 0q-22 26-45 0q-22 26-45 0q-22 26-45 0q-22 26-45 0q-22 26-45 0z"/>' +
        rect(40, 340, 320, 28) + rect(52, 368, 14, 60) + rect(334, 368, 14, 60) + rect(0, 428, 400, 72, ' fill="@ht"'),
      yellow: circ(50, 86, 15) + circ(122, 104, 15) + circ(200, 111, 15) + circ(278, 104, 15) + circ(350, 86, 15) + circ(258, 300, 70, ' fill="@hd"') + circ(258, 300, 24) +
        rect(80, 318, 26, 22) + rect(300, 318, 26, 22),
      pink: '<ellipse cx="178" cy="380" rx="44" ry="54"/>' + circ(178, 306, 30) + circ(156, 278, 14) + circ(200, 278, 14) +
        line('M218 412q60 18 42 70', 5) + line('M206 352 240 318', 8) + line('M240 318V292', 3)
    }),
    gardeners: () => ({
      yellow: '<path d="M318 40 150 500H400V120z"/>' + circ(318, 40, 16),
      blue: rect(0, 0, 400, 500, ' fill="@ht"') + circ(165, 196, 28) + '<path d="M120 246q45-20 90 0l20 140h-130z"/>' + rect(240, 300, 52, 42, ' rx="6"') + line('M292 312l38-26', 8) +
        rect(0, 430, 400, 70) + rect(312, 50, 10, 380),
      pink: '<path d="M132 182h66l-10-22h-46z"/>' + leaf(60, 500, 64, 190, -22) + leaf(112, 500, 52, 150, 12) + leaf(300, 500, 74, 210, 26) + leaf(360, 500, 52, 170, -12) + leaf(222, 500, 40, 120, 4) + leaf(20, 470, 40, 110, -40)
    }),
    economy: () => ({
      yellow: circ(200, 250, 165, ' fill="@ht"') + circ(206, 118, 18) + circ(192, 168, 18) + circ(212, 296, 18) + circ(196, 342, 18) + '<ellipse cx="200" cy="436" rx="96" ry="26"/>' + circ(232, 392, 18),
      pink: '<path d="M0 196h150q28 0 28 22t-28 22H0z"/>' + rect(160, 200, 42, 13, ' rx="6.5"') + rect(164, 220, 34, 13, ' rx="6.5"') + rect(30, 190, 14, 56),
      blue: '<path d="M400 236H252q-28 0-28 22t28 22h148z"/>' + rect(186, 226, 50, 13, ' rx="6.5"') + rect(196, 246, 38, 13, ' rx="6.5"') + rect(356, 230, 14, 56)
    }),
    heat: () => ({
      yellow: circ(200, 190, 145, ' fill="@hd"') + circ(200, 190, 80) + line('M20 430q20-12 40 0t40 0M220 470q20-12 40 0t40 0M260 400q20-12 40 0', 5),
      pink: '<g fill="none" stroke="currentColor"><circle cx="200" cy="190" r="104" stroke-width="9"/><circle cx="200" cy="190" r="140" stroke-width="9" stroke-dasharray="18 12"/><circle cx="200" cy="190" r="176" stroke-width="5"/></g>' +
        circ(150, 420, 16) + line('M170 414q20-32 46-12', 8),
      blue: '<path d="M0 360q50-18 100 0t100 0 100 0 100 0V500H0z"/>' + rect(0, 0, 400, 30, ' fill="@ht"')
    }),
    tea: () => ({
      blue: rect(40, 200, 100, 240, ' rx="8"') + rect(34, 174, 112, 32, ' rx="8" fill="@hd"') + rect(144, 174, 112, 32, ' rx="8" fill="@hd"') + rect(254, 174, 112, 32, ' rx="8" fill="@hd"') +
        rect(0, 440, 400, 14) + leaf(315, 400, 30, 74, -14) + leaf(326, 400, 26, 60, 24),
      pink: rect(150, 200, 100, 240, ' rx="8"') + leaf(86, 400, 30, 74, -14) + leaf(98, 400, 26, 60, 24) + line('M90 160q-16-24 0-46t0-46M200 150q-16-24 0-46M310 160q-16-24 0-46t0-46', 5),
      yellow: rect(260, 200, 100, 240, ' rx="8"') + rect(40, 280, 320, 64, ' fill="@ht"') + leaf(200, 400, 30, 74, -14) + leaf(212, 400, 26, 60, 24)
    }),
    cider: () => ({
      blue: '<path d="M172 54h56v94q52 30 52 92v222q0 20-20 20H140q-20 0-20-20V240q0-62 52-92z"/>' + rect(0, 470, 400, 30, ' fill="@ht"') + line('M60 382v-14M352 400v-14M332 98v-14', 5),
      pink: circ(0, 0, 170, ' fill="@ht"') + rect(110, 262, 180, 134, ' rx="10"') + circ(60, 420, 36) + circ(340, 432, 32) + circ(330, 120, 30),
      yellow: circ(74, 412, 36) + circ(354, 424, 32) + circ(344, 112, 30) + circ(200, 330, 36) + rect(186, 54, 28, 24)
    }),
    chocolate: () => ({
      pink: '<g transform="translate(86 92) rotate(-12)">' + rect(0, 0, 232, 112, ' rx="6"') + '</g>' +
        '<g transform="translate(110 360) rotate(-4)">' + line('M14 70l20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30 20 30', 7) + '</g>' + '<g transform="translate(70 230) rotate(6)">' + rect(192, 0, 40, 112, ' fill="@hd"') + '</g>',
      blue: '<g transform="translate(70 230) rotate(6)">' + rect(0, 0, 232, 112, ' rx="6"') + '</g>' +
        '<g transform="translate(86 92) rotate(-12)">' + line('M24 8v96M54 8v96M84 8v96M114 8v96M144 8v96M174 8v96', 9) + '</g>' + '<g transform="translate(110 360) rotate(-4)">' + rect(192, 0, 40, 112, ' fill="@hd"') + '</g>',
      yellow: '<g transform="translate(110 360) rotate(-4)">' + rect(0, 0, 232, 112, ' rx="6"') + '</g>' +
        '<g transform="translate(70 230) rotate(6)">' + circ(26, 28, 8) + circ(66, 28, 8) + circ(106, 28, 8) + circ(146, 28, 8) + circ(46, 58, 8) + circ(86, 58, 8) + circ(126, 58, 8) + circ(166, 58, 8) + circ(26, 88, 8) + circ(66, 88, 8) + circ(106, 88, 8) + circ(146, 88, 8) + '</g>' +
        '<g transform="translate(86 92) rotate(-12)">' + rect(192, 0, 40, 112, ' fill="@hd"') + '</g>'
    }),
    zinefest: () => ({
      yellow: circ(200, 200, 172) + rect(0, 412, 400, 88),
      blue: '<ellipse cx="200" cy="230" rx="72" ry="96"/>' + circ(200, 118, 34) +
        line('M136 196l-52-30M130 246H68M136 296l-50 36M264 196l52-30M270 246h62M264 296l50 36M186 90l-20-36M214 90l20-36', 8) +
        text(200, 470, 30, 'SMALL PRESS'),
      pink: text(200, 256, 62, 'JUNEBUG') + line('M200 150v168', 4) + text(200, 494, 16, 'FAIR · LOUISVILLE')
    }),
    monsters: () => ({
      blue: rect(0, 0, 400, 500, ' fill="@ht"') + circ(214, 248, 34) + '<path d="M120 352l20 30 20-30 20 30 20-30 20 30 20-30 20 30 20-30z"/>' +
        '<g transform="rotate(-14 200 430)">' + grid(-20, 404, 12, 1, 40, 0, 16, 12) + grid(-20, 446, 12, 1, 40, 0, 16, 12) + '</g>',
      pink: '<path d="M60 500V262q0-150 140-150t140 150V500z"/><path d="M110 142l-22-70 52 46zM290 142l22-70-52 46z"/>',
      yellow: circ(200, 240, 76) + '<g transform="rotate(-14 200 430)">' + rect(-40, 396, 480, 68) + '</g>'
    }),
    moth: () => ({
      yellow: circ(200, 210, 160, ' fill="@hd"') + circ(200, 210, 62),
      pink: '<path d="M194 222Q90 88 38 150Q18 252 194 254z"/><path d="M206 222Q310 88 362 150Q382 252 206 254z"/>' + circ(128, 332, 14) + circ(272, 332, 14),
      blue: '<path d="M194 246Q78 262 110 372Q160 402 194 292z"/><path d="M206 246Q322 262 290 372Q240 402 206 292z"/>' + '<ellipse cx="200" cy="258" rx="13" ry="72"/>' +
        line('M195 190q-20-50-52-60M205 190q20-50 52-60', 4) + text(200, 466, 40, 'MOTH CHOIR')
    }),
    street: () => ({
      pink: rect(0, 0, 400, 300, ' fill="@hd"') + rect(60, 404, 124, 40, ' rx="16"') + '<path d="M86 404l16-28h52l16 28z"/>',
      yellow: circ(292, 214, 72) + grid(14, 270, 2, 6, 26, 26, 14, 14) + grid(176, 196, 3, 8, 24, 26, 12, 14) + grid(292, 236, 2, 6, 26, 26, 14, 14) + circ(334, 300, 14) +
        rect(10, 466, 40, 8) + rect(110, 466, 40, 8) + rect(210, 466, 40, 8) + rect(310, 466, 40, 8),
      blue: '<path d="M0 500V250h70v-40h50v40h40V180h90v70h30v-30h60v40h60V500z"/>' + rect(0, 446, 400, 54) + circ(86, 446, 13) + circ(158, 446, 13)
    }),
    swimmers: () => ({
      blue: rect(0, 232, 400, 268) + rect(0, 0, 400, 232, ' fill="@ht"'),
      yellow: line('M-10 204Q200 44 410 204', 14) + rect(0, 196, 400, 16) + line('M60 196V150M120 196V112M180 196V96M240 196V98M300 196V116M350 196V150', 6) +
        line('M20 300q20-12 40 0t40 0M150 450q20-12 40 0t40 0M260 340q20-12 40 0t40 0M40 420q20-12 40 0', 5),
      pink: circ(112, 324, 15) + circ(224, 378, 15) + circ(318, 298, 15) + line('M126 316q20-30 44-10M238 370q20-30 44-10M332 290q16-26 40-8', 7) +
        '<g fill="none" stroke="currentColor" stroke-width="3"><ellipse cx="112" cy="336" rx="34" ry="8"/><ellipse cx="224" cy="390" rx="34" ry="8"/><ellipse cx="318" cy="310" rx="34" ry="8"/></g>'
    }),
    cat: () => ({
      blue: '<g fill="none" stroke="currentColor" stroke-width="12"><rect x="40" y="40" width="320" height="230"/><path d="M200 40v230M40 155h320"/></g>' + rect(0, 380, 400, 120, ' fill="@ht"') +
        line('M210 292q10 30 0 60M256 294q12 30 0 62M302 306q10 28-2 56', 10) + line('M88 362q8 6 16 0M120 362q8 6 16 0', 4),
      yellow: circ(272, 112, 46) + circ(96, 96, 4) + circ(140, 210, 3) + circ(330, 220, 4),
      pink: '<path d="M40 424Q40 280 200 280Q360 280 360 402Q360 462 280 462H100Q40 462 40 424z"/>' + circ(112, 360, 56) + '<path d="M70 322l-6-46 36 26zM154 322l6-46-36 26z"/>' + line('M342 444q52-10 40-74', 22)
    }),
    pomelo: () => ({
      yellow: circ(200, 270, 132),
      pink: wedges(200, 270, 112, 8, 3) + circ(330, 80, 10) + circ(64, 440, 8),
      blue: leaf(204, 140, 54, 112, 34) + leaf(196, 140, 42, 92, -40) + line('M200 140v-26', 6) + '<g transform="rotate(-30 300 440)">' + rect(196, 428, 190, 22) + '<path d="M386 428l30 11-30 11z"/></g>'
    }),
    swatches: () => {
      const xs = [100, 200, 300], ys = [170, 290, 410];
      const out = { pink: text(200, 92, 52, '2 INKS'), blue: '', yellow: '' };
      ys.forEach((y, r) => xs.forEach((x, c) => {
        out[INKS[r]] += circ(x - 16, y, 44);
        out[INKS[c]] += circ(x + 16, y, 44, r === c ? ' fill="@hd"' : '');
      }));
      out.blue += rect(60, 108, 280, 6);
      return out;
    },
    stickers: () => ({
      paper: [[110, 140], [290, 140], [110, 270], [290, 270], [110, 400], [290, 400]].map((p) => circ(p[0], p[1], 60, ' class="fill-card paper-fill"')).join(''),
      blue: rect(20, 30, 360, 440, ' rx="20" fill="none" stroke="currentColor" stroke-width="3"') +
        [[110, 140], [290, 140], [110, 270], [290, 270], [110, 400], [290, 400]].map((p) => circ(p[0], p[1], 60, ' fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="5 6"')).join('') +
        leaf(110, 104, 20, 30, 30) + '<ellipse cx="290" cy="146" rx="36" ry="28"/>' + line('M326 140l22-16', 7) + circ(94, 266, 5) + circ(126, 266, 5) +
        circ(304, 262, 30) + rect(76, 380, 68, 32, ' rx="8"') + circ(90, 420, 9) + circ(130, 420, 9),
      pink: wedges(110, 140, 32, 6, 4) + circ(110, 276, 36) + '<path d="M80 254l-4-30 24 18zM140 254l4-30-24 18z"/>' + rect(262, 116, 56, 8, ' rx="4"') +
        '<path transform="translate(294 404)" d="M0-34 8-11 33-11 13 4 21 28 0 13-21 28-13 4-33-11-8-11z"/>',
      yellow: circ(110, 140, 40) + circ(290, 270, 34) + rect(84, 372, 52, 28, ' rx="8"') + '<path transform="translate(288 398)" d="M0-34 8-11 33-11 13 4 21 28 0 13-21 28-13 4-33-11-8-11z"/>'
    })
  };

  // Plates for one motif inside a box: [x, y, scale]. Returns the plate groups as one string.
  function motifPlates(name, uid, inks, reg, box) {
    const m = has(MOTIFS, name) ? MOTIFS[name]() : {};
    const order = inks || ['yellow', 'pink', 'blue'];
    const inner = (m.paper || '') + order.map((ink, i) => plate(ink, m[ink], (reg && reg[i]) || [0, 0], uid)).join('');
    return box ? '<g transform="translate(' + box[0] + ' ' + box[1] + ') scale(' + box[2] + ')">' + inner + '</g>' : inner;
  }
  // A full 400 × 500 piece of artwork for a project.
  function projectArt(p, opts) {
    const o = opts || {};
    const uid = 'a' + (++artSeq);
    const label = o.label ? ' role="img" aria-label="' + escapeHtml(o.label) + '"' : ' aria-hidden="true" focusable="false"';
    const inks = o.only ? p.inks.filter((ink) => ink === o.only) : p.inks;
    const reg = o.only ? [[0, 0]] : p.reg;
    return '<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice"' + label + '>' + artDefs(uid) +
      '<rect width="400" height="500" class="fill-card paper-fill"/>' + motifPlates(p.motif, uid, inks, reg) + '</svg>';
  }
  // Product drawings: the motif printed on a sheet, a zine, a sticker sheet or postcards.
  function seeded(key) {
    let h = 2166136261;
    for (let i = 0; i < key.length; i++) h = Math.imul(h ^ key.charCodeAt(i), 16777619);
    return () => { h = Math.imul(h ^ (h >>> 15), 2246822507); h = Math.imul(h ^ (h >>> 13), 3266489909); return ((h ^= h >>> 16) >>> 0) / 4294967296; };
  }
  function randomReg(key) {
    const r = seeded(key);
    return [[0, 0], [Math.round(r() * 6 - 3), Math.round(r() * 6 - 3)], [Math.round(r() * 6 - 3), Math.round(r() * 6 - 3)]];
  }
  function sheet(uid, x, y, w, h, inner, rot) {
    const id = 'clip-' + uid + '-' + x + '-' + y;
    const t = rot ? ' transform="rotate(' + rot + ' ' + (x + w / 2) + ' ' + (y + h / 2) + ')"' : '';
    return '<g' + t + '>' + rect(x + 6, y + 7, w, h, ' class="fill-ink" opacity=".16"') +
      '<clipPath id="' + id + '">' + rect(x, y, w, h) + '</clipPath><g clip-path="url(#' + id + ')">' + rect(x, y, w, h, ' class="fill-card paper-fill"') + inner + '</g>' +
      rect(x, y, w, h, ' fill="none" class="stroke-ink" stroke-opacity=".35" stroke-width="1.5"') + '</g>';
  }
  function productArt(p) {
    const uid = 'a' + (++artSeq);
    const reg = randomReg(p.id);
    let body = '';
    if (p.kind === 'print') {
      body = sheet(uid, 60, 44, 280, 360, motifPlates(p.motif, uid, null, reg, [80, 64, 0.6]) +
        '<path d="M232 386q10-12 18 0t18-2 16 2" fill="none" class="stroke-ink" stroke-width="2"/>', -1.5) +
        rect(186, 34, 28, 22, ' rx="3" class="fill-ink"');
    } else if (p.kind === 'poster') {
      body = sheet(uid, 50, 28, 300, 400, motifPlates(p.motif, uid, null, reg, [50, 28, 0.75]), 1) + rect(70, 20, 22, 18, ' rx="2" class="fill-ink" opacity=".8"') + rect(308, 20, 22, 18, ' rx="2" class="fill-ink" opacity=".8"');
    } else if (p.kind === 'zine') {
      body = sheet(uid, 112, 74, 220, 330, '', 5) +
        sheet(uid, 86, 64, 220, 330, motifPlates(p.motif, uid, null, reg, [101, 84, 0.475]) +
          rect(86, 340, 220, 54, ' class="fill-ink"') + '<text x="196" y="376" font-size="22" text-anchor="middle" class="fill-card" font-family="Rammetto One, Cooper Black, sans-serif">' + escapeHtml(p.cover || '') + '</text>', -3) +
        rect(80, 140, 14, 5, ' class="fill-ink" transform="rotate(-3 196 229)"') + rect(80, 300, 14, 5, ' class="fill-ink" transform="rotate(-3 196 229)"');
    } else if (p.kind === 'postcards') {
      const cards = [['moon', 34, 140, -9], ['street', 124, 104, 3], ['swimmers', 214, 150, 10]];
      body = cards.map((c, i) => sheet(uid, c[1], c[2], 152, 190, motifPlates(c[0], uid, null, randomReg(p.id + i), [c[1], c[2], 0.38]), c[3])).join('') +
        '<g class="plate text-pink" fill="currentColor" filter="url(#ink-' + uid + ')">' + rect(20, 300, 360, 42, ' fill="url(#hd-pink-' + uid + ')"') + '</g>' +
        '<text x="200" y="330" font-size="20" text-anchor="middle" class="fill-ink" font-family="Rammetto One, Cooper Black, sans-serif">TWELVE SPOTS</text>';
    } else {
      body = sheet(uid, 30, 30, 340, 440, motifPlates(p.motif, uid, null, reg, [30, 30, 0.85]), -2);
    }
    return '<svg viewBox="0 0 400 500" aria-hidden="true" focusable="false">' + artDefs(uid) + '<rect width="400" height="500" class="fill-paper-2 paper-fill"/>' + body + '</svg>';
  }
  const PROJECT_BY_ID = PROJECTS.reduce((m, p) => { m[p.id] = p; return m; }, Object.create(null));
  const PRODUCT_BY_ID = PRODUCTS.reduce((m, p) => { m[p.id] = p; return m; }, Object.create(null));
  const findProject = (id) => (typeof id === 'string' && PROJECT_BY_ID[id]) || null;
  const findProduct = (id) => (typeof id === 'string' && PRODUCT_BY_ID[id]) || null;

  // <div data-art="project-id"> or <div data-product-art="product-id"> → its drawing.
  function paintArt(rootEl) {
    $$('[data-art]', rootEl).forEach((el) => {
      const p = findProject(el.getAttribute('data-art'));
      if (p) el.innerHTML = projectArt(p, { label: el.getAttribute('data-art-label') || '' });
    });
    $$('[data-product-art]', rootEl).forEach((el) => {
      const p = findProduct(el.getAttribute('data-product-art'));
      if (p) el.innerHTML = productArt(p);
    });
  }

  /* ------------------------------------------------------------------
   * 5. Header, mobile menu, reveal, toast, footer year
   * ------------------------------------------------------------------ */
  const header = $('#site-header');
  const menuBtn = $('#menu-button');
  const mobileMenu = $('#mobile-menu');
  function setMenu(open) {
    if (!menuBtn || !mobileMenu) return;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.hidden = !open;
    $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
    $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
    document.body.classList.toggle('overflow-hidden', open);
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }
  const onScroll = () => header && header.classList.toggle('shadow-[0_6px_0_-2px_var(--color-pink)]', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const revealObserver = ('IntersectionObserver' in window && !reduceMotion)
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          // Reveal this element and everything above it, so fast jumps never leave gaps.
          const top = en.target.getBoundingClientRect().top;
          $$('.reveal:not(.is-visible)').forEach((el) => {
            if (el.getBoundingClientRect().top <= top + 1) { el.classList.add('is-visible'); revealObserver.unobserve(el); }
          });
        });
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.04 })
    : null;
  function reveal(rootEl) {
    $$('.reveal:not(.is-visible)', rootEl).forEach((el) => {
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add('is-visible');
    });
  }

  const toastEl = $('#toast');
  let toastTimer = null;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 3800);
  }

  // Everything dated that is filled in from the clock.
  function renderDates() {
    const now = studioNow();
    $$('[data-year]').forEach((el) => { el.textContent = now.date.slice(0, 4); });
    const start = earliestStart();
    $$('[data-booking-from]').forEach((el) => { el.textContent = fmtDate(start, { weekday: undefined, day: undefined, month: 'long' }); });
    $$('[data-start-date]').forEach((el) => { el.textContent = fmtDate(start); });
    const open = nextOpenStudio();
    $$('[data-open-studio]').forEach((el) => {
      el.textContent = open ? fmtDate(open) + ', ' + clock(toMins(STUDIO.openStudio.from)) + ' to ' + clock(toMins(STUDIO.openStudio.to)) : 'The first Saturday of the month';
    });
    $$('[data-reply-by]').forEach((el) => { el.textContent = fmtDate(replyBy()); });
    $$('[data-mail-day]').forEach((el) => { el.textContent = fmtDate(nextMailDay()); });
    const next = upcomingEvents()[0];
    $$('[data-next-event]').forEach((el) => {
      if (!next) { el.hidden = true; return; }
      el.innerHTML = '<span class="font-bold">' + escapeHtml(next.title) + '</span> · ' + escapeHtml(eventDates(next)) + ' · ' + escapeHtml(next.place);
    });
  }
  function eventDates(e) {
    if (!e.end || e.end === e.date) return fmtDate(e.date);
    return fmtDate(e.date, { weekday: 'short', month: 'short' }) + ' to ' + fmtDate(e.end, { weekday: 'short', month: 'short' });
  }

  // Studio clock and open/closed line (contact page and footer).
  function renderClock() {
    const now = studioNow();
    const t = clock(now.mins);
    $$('[data-studio-clock]').forEach((el) => { el.textContent = t; });
    const openNow = isWorkingDay(now.date) && now.mins >= 600 && now.mins < 1020;
    let msg;
    if (openNow) msg = 'The studio is open until 5pm today.';
    else {
      let d = now.mins < 600 && isWorkingDay(now.date) ? now.date : nextWorkingDay(now.date, false);
      msg = 'Back at the desk ' + (d === addDays(now.date, 1) ? 'tomorrow' : d === now.date ? 'today' : DAY_NAMES[dayOf(d)]) + ' at 10am.';
    }
    $$('[data-studio-status]').forEach((el) => {
      el.innerHTML = '<span class="inline-block size-2.5 rounded-full ' + (openNow ? 'bg-blue' : 'bg-pink') + '" aria-hidden="true"></span> ' + escapeHtml(msg);
    });
  }

  /* ------------------------------------------------------------------
   * 6. Cart. Lines are { id, option, qty }, saved under KEYS.cart and
   *    checked against PRODUCTS every time they're read.
   * ------------------------------------------------------------------ */
  const cartListeners = [];
  function optionOf(p, optId) {
    return p.options.filter((o) => o.id === optId)[0] || null;
  }
  function normalizeCart(raw) {
    const out = [];
    if (!Array.isArray(raw)) return out;
    raw.forEach((l) => {
      if (!l || typeof l !== 'object') return;
      const p = findProduct(l.id);
      const o = p && optionOf(p, l.option);
      const qty = Math.floor(Number(l.qty));
      if (!o || o.left < 1 || !(qty >= 1)) return;
      const same = out.filter((x) => x.id === p.id && x.option === o.id)[0];
      const cap = Math.min(MAX_QTY, o.left);
      if (same) same.qty = Math.min(cap, same.qty + qty);
      else out.push({ id: p.id, option: o.id, qty: Math.min(cap, qty) });
    });
    return out;
  }
  let cart = normalizeCart(readJson(KEYS.cart));
  function saveCart(next) {
    cart = normalizeCart(next);
    writeJson(KEYS.cart, cart.length ? cart : null);
    cartListeners.forEach((fn) => fn());
  }
  const cartCount = () => cart.reduce((n, l) => n + l.qty, 0);
  function lineInfo(l) {
    const p = findProduct(l.id), o = optionOf(p, l.option);
    return { p: p, o: o, total: o.price * l.qty, max: Math.min(MAX_QTY, o.left) };
  }
  const subtotal = () => cart.reduce((s, l) => s + lineInfo(l).total, 0);
  function addToCart(id, option, qty) {
    const next = cart.map((l) => Object.assign({}, l));
    const same = next.filter((l) => l.id === id && l.option === option)[0];
    if (same) same.qty += qty; else next.push({ id: id, option: option, qty: qty });
    saveCart(next);
  }
  function setQty(index, qty) {
    const next = cart.map((l) => Object.assign({}, l));
    if (!next[index]) return;
    if (qty < 1) next.splice(index, 1); else next[index].qty = Math.min(lineInfo(next[index]).max, qty);
    saveCart(next);
  }
  function shippingCost(method, sub) {
    const s = has(SHIPPING, method) ? SHIPPING[method] : SHIPPING.standard;
    return s.freeOver !== null && sub >= s.freeOver ? 0 : s.price;
  }
  function freeShippingNote(sub) {
    const left = SHIPPING.standard.freeOver - sub;
    return left > 0 ? 'Add ' + price(left) + ' more for free US shipping.' : 'Your order ships free in the US.';
  }

  function renderCartBadges() {
    const n = cartCount();
    $$('[data-cart-count]').forEach((el) => { el.textContent = n; el.hidden = n === 0; });
    $$('[data-cart-open]').forEach((a) => a.setAttribute('aria-label', 'Cart, ' + plural(n, 'item', 'items')));
  }
  function popBadge() {
    $$('[data-cart-count]').forEach((el) => { el.classList.remove('badge-pop'); void el.offsetWidth; el.classList.add('badge-pop'); });
  }

  // Cart lines with quantity steppers. Used in the drawer and on the checkout page.
  function cartLinesHtml(compact) {
    return '<ul class="divide-y-2 divide-dashed divide-line">' + cart.map((l, i) => {
      const info = lineInfo(l);
      return '<li class="flex gap-4 py-4">' +
        '<div class="art aspect-[4/5] w-20 shrink-0 border-ink/60">' + productArt(info.p) + '</div>' +
        '<div class="min-w-0 flex-1">' +
          '<div class="flex items-start justify-between gap-3"><p class="font-bold leading-snug">' + escapeHtml(info.p.name) + '</p><p class="font-mono font-bold">' + price(info.total) + '</p></div>' +
          '<p class="text-sm text-muted">' + escapeHtml(info.o.label) + ' · ' + price(info.o.price) + ' each</p>' +
          '<div class="mt-2 flex flex-wrap items-center gap-3">' +
            '<div class="qty" role="group" aria-label="Quantity of ' + escapeHtml(info.p.name) + ', ' + escapeHtml(info.o.label) + '">' +
              '<button type="button" data-qty-dec="' + i + '" aria-label="One fewer">−</button>' +
              '<output aria-live="polite">' + l.qty + '</output>' +
              '<button type="button" data-qty-inc="' + i + '" aria-label="One more"' + (l.qty >= info.max ? ' disabled' : '') + '>+</button>' +
            '</div>' +
            '<button type="button" class="text-sm font-bold text-blue-text underline decoration-pink decoration-2 underline-offset-4" data-remove="' + i + '">Remove<span class="sr-only"> ' + escapeHtml(info.p.name) + '</span></button>' +
            (l.qty >= info.max && !compact ? '<span class="text-sm text-muted">Limit ' + info.max + '</span>' : '') +
          '</div>' +
        '</div></li>';
    }).join('') + '</ul>';
  }
  // Steppers re-render the list; keep keyboard focus on the same control.
  function bindCartLines(container, rerender) {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-qty-dec], [data-qty-inc], [data-remove]');
      if (!btn) return;
      const attr = btn.hasAttribute('data-qty-dec') ? 'data-qty-dec' : btn.hasAttribute('data-qty-inc') ? 'data-qty-inc' : 'data-remove';
      const i = +btn.getAttribute(attr);
      if (!cart[i]) return;
      const name = findProduct(cart[i].id).name;
      if (attr === 'data-remove') setQty(i, 0);
      else setQty(i, cart[i].qty + (attr === 'data-qty-inc' ? 1 : -1));
      rerender();
      const again = $('[' + attr + '="' + i + '"]', container);
      if (again && !again.disabled) again.focus();
      else {
        const any = $('[data-qty-inc], [data-cart-shop]', container) || $('[data-cart-close]');
        if (any) any.focus();
        if (attr === 'data-remove' || !cart[i]) toast(name + ' removed from your cart.');
      }
    });
  }

  const drawer = (function () {
    if (!$('[data-cart-open]')) return null;
    const dlg = document.createElement('dialog');
    dlg.id = 'cart-drawer';
    dlg.className = 'drawer';
    dlg.setAttribute('aria-labelledby', 'cart-title');
    dlg.innerHTML = '<div class="flex h-full flex-col">' +
      '<div class="flex items-center justify-between gap-4 border-b-2 border-ink px-5 py-4"><h2 id="cart-title" class="h-card">Your cart</h2>' +
      '<button type="button" class="icon-btn" data-cart-close aria-label="Close cart"><svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button></div>' +
      '<div class="flex-1 overflow-y-auto px-5" data-drawer-lines></div>' +
      '<div class="border-t-2 border-ink px-5 py-5" data-drawer-foot></div></div>';
    document.body.appendChild(dlg);
    const lines = $('[data-drawer-lines]', dlg), foot = $('[data-drawer-foot]', dlg);
    function render() {
      if (!cart.length) {
        lines.innerHTML = '<div class="py-10 text-center"><p class="h-card">Nothing in here yet.</p><p class="mt-2 text-muted">Prints, zines and stickers are in the shop.</p><a href="shop.html" class="btn btn-pink mt-6" data-cart-shop>Visit the shop</a></div>';
        foot.innerHTML = '<p class="text-sm text-muted">' + escapeHtml(freeShippingNote(0)) + '</p>';
        return;
      }
      lines.innerHTML = cartLinesHtml(true);
      const sub = subtotal();
      foot.innerHTML = '<div class="flex items-baseline justify-between"><span class="font-bold">Subtotal</span><span class="font-mono text-xl font-bold" data-drawer-subtotal>' + price(sub) + '</span></div>' +
        '<p class="mt-1 text-sm text-muted">' + escapeHtml(freeShippingNote(sub)) + ' Shipping and tax are worked out at checkout.</p>' +
        '<a href="checkout.html" class="btn btn-blue mt-4 w-full">Check out</a>';
    }
    bindCartLines(lines, render);
    $('[data-cart-close]', dlg).addEventListener('click', () => dlg.close());
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
    cartListeners.push(() => { if (dlg.open) render(); });
    $$('[data-cart-open]').forEach((a) => {
      a.setAttribute('aria-haspopup', 'dialog');
      a.addEventListener('click', (e) => {
        if (document.body.getAttribute('data-page') === 'checkout') return;
        e.preventDefault();
        setMenu(false);
        render();
        dlg.showModal();
      });
    });
    return { render: render, el: dlg };
  })();

  /* ------------------------------------------------------------------
   * 7. Home
   * ------------------------------------------------------------------ */
  function projectCard(p, headingTag) {
    const tag = headingTag || 'h3';
    return '<article class="reveal group relative">' +
      '<a href="project.html?project=' + encodeURIComponent(p.id) + '" class="block rounded-xl">' +
        '<div class="art wobble aspect-[4/5] shadow-[5px_5px_0_var(--color-ink)]">' + projectArt(p) + '</div>' +
        '<div class="mt-4 flex items-start justify-between gap-3"><' + tag + ' class="h-card">' + escapeHtml(p.title) + '</' + tag + '><span class="tag mt-1 shrink-0">' + p.year + '</span></div>' +
        '<p class="mt-1 text-muted">' + escapeHtml(p.client) + ' · ' + escapeHtml(CATEGORIES[p.type]) + '</p>' +
      '</a></article>';
  }
  function categoryCounts() {
    const counts = Object.create(null);
    PROJECTS.forEach((p) => { counts[p.type] = (counts[p.type] || 0) + 1; });
    return counts;
  }
  function initHome() {
    const grid = $('[data-featured-work]');
    if (grid) {
      grid.innerHTML = PROJECTS.filter((p) => p.featured).sort((a, b) => a.featured - b.featured).map((p) => projectCard(p)).join('');
    }
    const counts = categoryCounts();
    $$('[data-cat-count]').forEach((el) => {
      const k = el.getAttribute('data-cat-count');
      el.textContent = plural(has(counts, k) ? counts[k] : 0, 'project', 'projects');
    });
    $$('[data-clients]').forEach((el) => {
      el.innerHTML = D.CLIENTS.map((c, i) => '<li class="' + ['rotate-[-2deg]', 'rotate-[1.5deg]', 'rotate-[-1deg]', 'rotate-[2deg]'][i % 4] + ' rounded-full border-2 border-ink bg-card px-4 py-2 font-display text-[0.95rem] sm:text-base ' + ['shadow-[3px_3px_0_var(--color-pink)]', 'shadow-[3px_3px_0_var(--color-blue)]', 'shadow-[3px_3px_0_var(--color-yellow)]'][i % 3] + '">' + escapeHtml(c) + '</li>').join('');
    });
    $$('[data-shop-teaser]').forEach((el) => {
      el.innerHTML = ['upside-down-moon-print', 'two-inks', 'pantry-friends', 'frankfort-dusk'].map(findProduct).filter(Boolean).map((p) =>
        '<a href="shop.html#' + p.id + '" class="reveal group block"><div class="art wobble aspect-[4/5]">' + productArt(p) + '</div>' +
        '<p class="mt-3 font-bold leading-snug">' + escapeHtml(p.name) + '</p><p class="font-mono text-sm text-muted">from ' + price(Math.min.apply(null, p.options.map((o) => o.price))) + '</p></a>').join('');
    });
  }

  /* ------------------------------------------------------------------
   * 8. Work: filter chips (aria-pressed) and ?type=
   * ------------------------------------------------------------------ */
  function initWork() {
    const grid = $('[data-work-grid]'), chips = $('[data-work-filters]'), count = $('[data-work-count]');
    if (!grid || !chips) return;
    const counts = categoryCounts();
    let current = urlParam('type');
    if (!has(CATEGORIES, current)) current = 'all';
    const keys = ['all'].concat(Object.keys(CATEGORIES));
    chips.innerHTML = keys.map((k) => '<button type="button" class="chip" data-filter="' + k + '" aria-pressed="' + (k === current) + '">' +
      escapeHtml(k === 'all' ? 'All work' : CATEGORIES[k]) + ' <span class="count">' + (k === 'all' ? PROJECTS.length : counts[k] || 0) + '</span></button>').join('');
    function render() {
      const list = PROJECTS.filter((p) => current === 'all' || p.type === current);
      grid.innerHTML = list.map((p) => projectCard(p, 'h2')).join('');
      paintArt(grid);
      reveal(grid);
      $$('[data-filter]', chips).forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === current)));
      if (count) count.textContent = 'Showing ' + plural(list.length, 'project', 'projects') + (current === 'all' ? '' : ' in ' + CATEGORIES[current].toLowerCase());
      $$('[data-commission-type]').forEach((a) => { a.href = 'commissions.html' + (current === 'all' ? '' : '?type=' + current); });
    }
    chips.addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]');
      if (!b) return;
      current = b.getAttribute('data-filter');
      setUrlParam('type', current === 'all' ? null : current);
      render();
    });
    render();
  }

  /* ------------------------------------------------------------------
   * 9. Case study (project.html?project=)
   * ------------------------------------------------------------------ */
  function initProject() {
    const id = urlParam('project');
    let p = findProject(id);
    const missing = $('[data-project-missing]');
    if (missing) missing.hidden = !(id && !p);
    if (!p) p = PROJECTS[0];
    const i = PROJECTS.indexOf(p);
    document.title = p.title + ' — Pipa Valdespino, Pomelo Press';
    const set = (sel, html) => $$(sel).forEach((el) => { el.innerHTML = html; });
    set('[data-project-title]', escapeHtml(p.title));
    $$('[data-project-title-ink]').forEach((el) => el.setAttribute('data-ink', p.title));
    set('[data-project-client]', escapeHtml(p.client));
    set('[data-project-type]', escapeHtml(CATEGORIES[p.type]));
    set('[data-project-year]', String(p.year));
    set('[data-project-summary]', escapeHtml(p.summary));
    set('[data-project-brief]', escapeHtml(p.brief));
    set('[data-project-result]', escapeHtml(p.result));
    set('[data-project-inks]', p.inks.map((ink) => '<li class="flex items-center gap-2"><span class="size-4 rounded-full border-2 border-ink ' + { pink: 'bg-pink', blue: 'bg-blue', yellow: 'bg-yellow' }[ink] + '" aria-hidden="true"></span>' + INK_NAMES[ink] + '</li>').join(''));
    set('[data-project-deliverables]', p.deliverables.map((d) => '<li class="flex gap-2"><span class="text-pink-text" aria-hidden="true">✶</span>' + escapeHtml(d) + '</li>').join(''));
    set('[data-process-notes]', p.process.map((s, n) => '<li class="reveal card p-6 ' + ['shadow-[5px_5px_0_var(--color-pink)]', 'shadow-[5px_5px_0_var(--color-blue)]', 'shadow-[5px_5px_0_var(--color-yellow)]'][n % 3] + '">' +
      '<p class="stamp text-pink-text">Step ' + (n + 1) + '</p><h3 class="h-card mt-2">' + escapeHtml(s[0]) + '</h3><p class="mt-2">' + escapeHtml(s[1]) + '</p></li>').join(''));
    $$('[data-commission-type]').forEach((a) => { a.href = 'commissions.html?type=' + p.type; });
    const q = p.quote && has(D.QUOTES, p.quote) ? D.QUOTES[p.quote] : null;
    $$('[data-project-quote]').forEach((el) => {
      el.hidden = !q;
      if (q) el.innerHTML = '<p class="font-display text-[clamp(1.35rem,2.6vw,2rem)] leading-snug">“' + escapeHtml(q.text) + '”</p><footer class="mt-4"><span class="font-bold">' + escapeHtml(q.name) + '</span><span class="text-muted">, ' + escapeHtml(q.role) + '</span></footer>';
    });
    const prev = PROJECTS[(i - 1 + PROJECTS.length) % PROJECTS.length], next = PROJECTS[(i + 1) % PROJECTS.length];
    set('[data-project-nav]', '<a href="project.html?project=' + prev.id + '" class="card group block p-5 hover:bg-yellow hover:text-on-ink"><span class="stamp">← Previous</span><span class="h-card mt-1 block">' + escapeHtml(prev.title) + '</span></a>' +
      '<a href="project.html?project=' + next.id + '" class="card group block p-5 text-right hover:bg-yellow hover:text-on-ink"><span class="stamp">Next →</span><span class="h-card mt-1 block">' + escapeHtml(next.title) + '</span></a>');
    set('[data-more-work]', PROJECTS.filter((x) => x.type === p.type && x.id !== p.id).map((x) => projectCard(x)).join(''));
    set('[data-more-type]', escapeHtml(CATEGORIES[p.type].toLowerCase()));
    $$('[data-more-link]').forEach((a) => { a.href = 'work.html?type=' + p.type; });

    // Process stages: Sketch, Plates, Final (an ARIA tablist).
    const label = p.title + ', ' + CATEGORIES[p.type].toLowerCase() + ' illustration for ' + p.client;
    const sketch = $('[data-stage-art="sketch"]'), final = $('[data-stage-art="final"]'), plates = $('[data-stage-plates]');
    if (sketch) sketch.innerHTML = projectArt(p, { label: 'Pencil sketch of ' + label });
    if (final) final.innerHTML = projectArt(p, { label: label });
    if (plates) plates.innerHTML = p.inks.map((ink, n) => '<figure class="min-w-0"><div class="art aspect-[4/5]">' + projectArt(p, { only: ink, label: INK_NAMES[ink] + ' plate of ' + p.title }) + '</div>' +
      '<figcaption class="mt-2 flex items-center gap-2 text-sm font-bold"><span class="size-3.5 rounded-full border-2 border-ink ' + { pink: 'bg-pink', blue: 'bg-blue', yellow: 'bg-yellow' }[ink] + '" aria-hidden="true"></span>Pass ' + (n + 1) + ': ' + INK_NAMES[ink] + '</figcaption></figure>').join('');
    // Ink toggles on the final artwork.
    const toggles = $('[data-plate-toggles]');
    if (toggles && final) {
      toggles.innerHTML = p.inks.map((ink) => '<button type="button" class="chip" data-plate="' + ink + '" aria-pressed="true"><span class="size-3.5 rounded-full border-2 border-ink ' + { pink: 'bg-pink', blue: 'bg-blue', yellow: 'bg-yellow' }[ink] + '" aria-hidden="true"></span>' + INK_NAMES[ink] + '</button>').join('');
      toggles.addEventListener('click', (e) => {
        const b = e.target.closest('[data-plate]');
        if (!b) return;
        const on = b.getAttribute('aria-pressed') !== 'true';
        const ink = b.getAttribute('data-plate');
        if (!on && $$('[aria-pressed="true"]', toggles).length === 1) { toast('Leave at least one ink on the press.'); return; }
        b.setAttribute('aria-pressed', String(on));
        $$('.plate[data-ink="' + ink + '"]', final).forEach((g) => g.toggleAttribute('data-off', !on));
        const shown = $$('[aria-pressed="true"]', toggles).map((x) => INK_NAMES[x.getAttribute('data-plate')].toLowerCase());
        const status = $('[data-plate-status]');
        if (status) status.textContent = shown.length === p.inks.length ? 'All ' + p.inks.length + ' inks printed.' : 'Showing ' + shown.join(' and ') + ' only.';
      });
    }
    initTabs($('[data-stages]'));
  }
  // Tabs: arrow keys move between tabs, Home/End jump, panels follow.
  function initTabs(list) {
    if (!list) return;
    const tabs = $$('[role="tab"]', list);
    function select(tab, focus) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        let n = null;
        if (e.key === 'ArrowRight') n = (i + 1) % tabs.length;
        if (e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
        if (e.key === 'Home') n = 0;
        if (e.key === 'End') n = tabs.length - 1;
        if (n !== null) { e.preventDefault(); select(tabs[n], true); }
      });
    });
    select(tabs.filter((t) => t.getAttribute('aria-selected') === 'true')[0] || tabs[0]);
  }

  /* ------------------------------------------------------------------
   * 10. Shop: ?filter=, size options, add to cart
   * ------------------------------------------------------------------ */
  const FILTER_KINDS = { all: null, prints: ['print', 'poster'], zines: ['zine'], paper: ['stickers', 'postcards'] };
  function productCard(p) {
    const firstOpen = p.options.filter((o) => o.left > 0)[0];
    const name = 'opt-' + p.id;
    const opts = p.options.length > 1
      ? '<fieldset class="mt-4"><legend class="text-sm font-bold">Size</legend><div class="mt-2 flex flex-wrap gap-2">' + p.options.map((o) =>
          '<label class="pill"><input type="radio" name="' + name + '" value="' + o.id + '"' + (o === firstOpen ? ' checked' : '') + (o.left < 1 ? ' disabled' : '') + '>' +
          escapeHtml(o.label) + (o.left < 1 ? ' <span class="font-medium text-muted">sold out</span>' : ' <span class="font-mono">' + price(o.price) + '</span>') + '</label>').join('') + '</div></fieldset>'
      : '<input type="hidden" name="' + name + '" value="' + p.options[0].id + '"><p class="mt-4 text-sm font-bold">' + escapeHtml(p.options[0].label) + '</p>';
    return '<article id="' + p.id + '" class="reveal card flex flex-col p-4 sm:p-5" data-product="' + p.id + '">' +
      '<div class="art aspect-[4/5] border-ink/60">' + productArt(p) + '</div>' +
      '<div class="mt-4 flex items-start justify-between gap-3"><h2 class="h-card">' + escapeHtml(p.name) + '</h2><p class="font-mono text-lg font-bold" data-price>' + price(firstOpen.price) + '</p></div>' +
      '<p class="mt-1 text-muted">' + escapeHtml(p.blurb) + '</p>' +
      '<p class="mt-2 font-mono text-sm">' + escapeHtml(p.paper) + '</p>' +
      opts +
      '<p class="mt-3 text-sm text-muted" data-stock></p>' +
      '<div class="mt-auto flex flex-wrap items-center gap-3 pt-4">' +
        '<button type="button" class="btn btn-blue btn-sm" data-add="' + p.id + '">Add to cart<span class="sr-only">: ' + escapeHtml(p.name) + '</span></button>' +
        (p.project && findProject(p.project) ? '<a class="link text-sm" href="project.html?project=' + p.project + '">The story<span class="sr-only"> behind ' + escapeHtml(p.name) + '</span></a>' : '') +
      '</div></article>';
  }
  function selectedOption(card) {
    const p = findProduct(card.getAttribute('data-product'));
    const input = $('input[name="opt-' + p.id + '"]:checked', card) || $('input[type="hidden"][name="opt-' + p.id + '"]', card);
    return { p: p, o: input ? optionOf(p, input.value) : null };
  }
  function renderStock(card) {
    const s = selectedOption(card);
    if (!s.o) return;
    $('[data-price]', card).textContent = price(s.o.price);
    const inCart = cart.filter((l) => l.id === s.p.id && l.option === s.o.id).reduce((n, l) => n + l.qty, 0);
    $('[data-stock]', card).textContent = 'Edition of ' + s.o.edition + ' · ' + (s.o.left <= 15 ? 'only ' + s.o.left + ' left' : s.o.left + ' left') + (inCart ? ' · ' + inCart + ' in your cart' : '');
  }
  function initShop() {
    const grid = $('[data-shop-grid]'), chips = $('[data-shop-filters]'), count = $('[data-shop-count]');
    if (!grid || !chips) return;
    let current = urlParam('filter');
    if (!has(SHOP_FILTERS, current)) current = 'all';
    const counts = Object.keys(SHOP_FILTERS).reduce((m, k) => { m[k] = PRODUCTS.filter((p) => !FILTER_KINDS[k] || FILTER_KINDS[k].indexOf(p.kind) !== -1).length; return m; }, {});
    chips.innerHTML = Object.keys(SHOP_FILTERS).map((k) => '<button type="button" class="chip" data-filter="' + k + '" aria-pressed="' + (k === current) + '">' + escapeHtml(SHOP_FILTERS[k]) + ' <span class="count">' + counts[k] + '</span></button>').join('');
    function render() {
      const list = PRODUCTS.filter((p) => !FILTER_KINDS[current] || FILTER_KINDS[current].indexOf(p.kind) !== -1);
      grid.innerHTML = list.map(productCard).join('');
      $$('[data-product]', grid).forEach(renderStock);
      reveal(grid);
      $$('[data-filter]', chips).forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === current)));
      if (count) count.textContent = 'Showing ' + plural(list.length, 'item', 'items');
    }
    chips.addEventListener('click', (e) => {
      const b = e.target.closest('[data-filter]');
      if (!b) return;
      current = b.getAttribute('data-filter');
      setUrlParam('filter', current === 'all' ? null : current);
      render();
    });
    grid.addEventListener('change', (e) => { const card = e.target.closest('[data-product]'); if (card) renderStock(card); });
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('[data-add]');
      if (!b) return;
      const card = b.closest('[data-product]');
      const s = selectedOption(card);
      if (!s.o || s.o.left < 1) return;
      const before = cartCount();
      addToCart(s.p.id, s.o.id, 1);
      renderStock(card);
      if (cartCount() === before) { toast('That’s the most of ' + s.p.name + ' we can sell in one order.'); return; }
      popBadge();
      toast('Added ' + s.p.name + (s.p.options.length > 1 ? ' (' + s.o.label + ')' : '') + ' to your cart.');
    });
    cartListeners.push(() => $$('[data-product]', grid).forEach(renderStock));
    render();
    if (location.hash) {
      const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
      if (target && target.hasAttribute('data-product')) { target.classList.add('is-visible'); target.scrollIntoView(); }
    }
  }

  /* ------------------------------------------------------------------
   * 11. Checkout (a front-end checkout: no payment is taken)
   * ------------------------------------------------------------------ */
  const STATES = ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'DC', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'];
  function totals(method, state) {
    const sub = subtotal();
    const ship = shippingCost(method, sub);
    const taxable = method === 'pickup' || state === TAX.state;
    const tax = taxable ? Math.round(sub * TAX.rate * 100) / 100 : 0;
    return { sub: sub, ship: ship, tax: tax, taxable: taxable, total: sub + ship + tax };
  }
  function initCheckout() {
    const main = $('[data-checkout-main]'), empty = $('[data-checkout-empty]'), form = $('#checkout-form');
    if (!main || !form) return;
    const stateSel = $('#co-state');
    if (stateSel) stateSel.insertAdjacentHTML('beforeend', STATES.map((s) => '<option value="' + s + '">' + s + '</option>').join(''));
    const shipBox = $('[data-ship-options]');
    shipBox.innerHTML = Object.keys(SHIPPING).map((k, i) => '<label class="option"><input type="radio" name="ship" value="' + k + '"' + (i === 0 ? ' checked' : '') + '>' +
      '<span class="flex items-baseline justify-between gap-3 font-bold"><span>' + escapeHtml(SHIPPING[k].label) + '</span><span class="font-mono" data-ship-price="' + k + '"></span></span>' +
      '<span class="text-sm text-muted">' + escapeHtml(SHIPPING[k].note) + '</span></label>').join('');
    const method = () => { const r = $('input[name="ship"]:checked', form); return r ? r.value : 'standard'; };
    const lines = $('[data-summary-lines]'), totalsEl = $('[data-totals]');
    function render() {
      const isEmpty = !cart.length;
      main.hidden = isEmpty;
      if (empty) empty.hidden = !isEmpty;
      if (isEmpty) return;
      const m = method();
      const address = $('[data-address-fields]');
      if (address) address.hidden = m === 'pickup';
      lines.innerHTML = cartLinesHtml(false);
      const t = totals(m, stateSel ? stateSel.value : '');
      Object.keys(SHIPPING).forEach((k) => { const el = $('[data-ship-price="' + k + '"]', form); if (el) { const c = shippingCost(k, t.sub); el.textContent = c ? price(c) : 'Free'; } });
      totalsEl.innerHTML = '<div class="flex justify-between"><dt>Subtotal, ' + plural(cartCount(), 'item', 'items') + '</dt><dd class="font-mono">' + price(t.sub) + '</dd></div>' +
        '<div class="flex justify-between"><dt>' + escapeHtml(SHIPPING[m].label) + '</dt><dd class="font-mono">' + (t.ship ? price(t.ship) : 'Free') + '</dd></div>' +
        '<div class="flex justify-between"><dt>' + (t.taxable ? escapeHtml(TAX.label) : 'Sales tax') + '</dt><dd class="font-mono">' + (t.taxable ? price(t.tax) : '$0') + '</dd></div>' +
        '<div class="flex justify-between border-t-2 border-ink pt-3 text-lg font-bold"><dt>Total</dt><dd class="font-mono" data-order-total>' + price(t.total) + '</dd></div>' +
        (m === 'standard' ? '<p class="text-sm text-muted">' + escapeHtml(freeShippingNote(t.sub)) + '</p>' : '');
      $$('[data-pay-total]').forEach((el) => { el.textContent = price(t.total); });
    }
    bindCartLines(lines, render);
    form.addEventListener('change', (e) => { if (e.target.name === 'ship' || e.target === stateSel) render(); });
    cartListeners.push(render);
    render();
    setupValidation(form, () => {
      const m = method();
      const t = totals(m, stateSel.value);
      const first = cleanText($('#co-name').value, 80).split(/\s+/)[0];
      const ref = makeRef('PP');
      const items = cart.map((l) => { const info = lineInfo(l); return '<li class="flex justify-between gap-4"><span>' + l.qty + ' × ' + escapeHtml(info.p.name) + ' <span class="text-muted">(' + escapeHtml(info.o.label) + ')</span></span><span class="font-mono">' + price(info.total) + '</span></li>'; }).join('');
      const when = nextMailDay();
      const next = m === 'pickup'
        ? 'Your order will be packed by ' + fmtDate(when) + '. We’ll email you when it’s ready to pick up at ' + escapeHtml(STUDIO.street) + ', any weekday from 10am to 5pm.'
        : 'We pack and mail orders on Tuesdays and Fridays, so yours goes out on ' + fmtDate(when) + ' by ' + escapeHtml(SHIPPING[m].label) + '. We’ll email the tracking details when it ships.';
      saveCart([]);
      const box = successSwap(main, '<p class="sticker">Order confirmed</p>' +
        '<h2 class="h-section mt-4">Thank you, ' + escapeHtml(first) + '.</h2>' +
        '<p class="mt-3 text-lg">Your order number is <strong class="font-mono">' + ref + '</strong>.</p>' +
        '<p class="mt-3 max-w-2xl">' + next + '</p>' +
        '<ul class="mt-6 max-w-xl space-y-2 border-y-2 border-dashed border-line py-4">' + items + '</ul>' +
        '<p class="mt-3 max-w-xl flex justify-between font-bold"><span>Total paid</span><span class="font-mono">' + price(t.total) + '</span></p>' +
        '<p class="mt-2 text-sm text-muted">This is a test checkout, so no card was charged.</p>' +
        '<div class="mt-8 flex flex-wrap gap-3"><a href="shop.html" class="btn btn-pink">Back to the shop</a><a href="work.html" class="btn btn-line">See the work</a></div>');
      if (empty) empty.remove();
      box.scrollIntoView({ block: 'start' });
    });
  }

  /* ------------------------------------------------------------------
   * 12. Commissions: four steps, a live estimate and timeline (?type=)
   * ------------------------------------------------------------------ */
  const TERRITORY = { 'north-america': { label: 'North America', factor: 1 }, worldwide: { label: 'Worldwide', factor: 1.2 } };
  const round50 = (n) => Math.round(n / 50) * 50;
  function schedule(typeId, squeeze) {
    const t = TYPES[typeId];
    const days = (n) => Math.max(1, Math.ceil(n * (squeeze || 1)));
    const start = earliestStart();
    const sketches = addWorkingDays(start, days(t.phases.sketches));
    const revisions = addWorkingDays(sketches, days(t.phases.revisions));
    const finals = addWorkingDays(revisions, days(t.phases.finals));
    const files = addWorkingDays(finals, 1);
    return { start: start, sketches: sketches, revisions: revisions, finals: finals, files: files };
  }
  function commissionEstimate(s) {
    if (!has(TYPES, s.type)) return null;
    const t = TYPES[s.type];
    const usage = has(USAGES, s.usage) ? USAGES[s.usage] : USAGES['print-once'];
    const terr = has(TERRITORY, s.territory) ? TERRITORY[s.territory] : TERRITORY['north-america'];
    const std = schedule(s.type), rush = schedule(s.type, RUSH.squeeze);
    let pace = 'standard';
    if (isIsoDate(s.deadline)) {
      if (s.deadline < rush.files) pace = 'too-soon';
      else if (s.deadline < std.files) pace = 'rush';
    }
    const factor = usage.factor * terr.factor * (pace === 'rush' ? 1 + RUSH.fee : 1);
    const low = round50(t.from * factor), high = round50(t.from * factor * 1.6);
    let fit = null;
    if (has(BUDGETS, s.budget)) {
      const b = BUDGETS[s.budget];
      fit = b.max < low ? 'under' : b.min > high ? 'over' : 'in';
    }
    return { type: t, usage: usage, terr: terr, std: std, rush: rush, plan: pace === 'rush' ? rush : std, pace: pace, low: low, high: high, fit: fit };
  }
  function initCommissions() {
    const form = $('#commission-form');
    if (!form) return;
    const steps = $$('[data-step]', form);
    const out = $('[data-estimate]');
    const deadline = $('#cm-deadline');
    let stepIndex = 0;
    const today = studioNow().date;
    deadline.min = addDays(today, 1);
    deadline.max = addDays(today, 730);

    $('[data-type-options]').innerHTML = Object.keys(TYPES).map((k) => '<label class="option"><input type="radio" name="type" value="' + k + '">' +
      '<span class="flex items-baseline justify-between gap-3"><span class="h-card text-lg">' + escapeHtml(TYPES[k].label) + '</span><span class="shrink-0 font-mono text-sm font-bold whitespace-nowrap">from ' + price(TYPES[k].from) + '</span></span>' +
      '<span class="text-[0.95rem] text-muted">' + escapeHtml(TYPES[k].blurb) + '</span></label>').join('');
    $('[data-usage-options]').innerHTML = Object.keys(USAGES).map((k, i) => '<label class="option"><input type="radio" name="usage" value="' + k + '"' + (i === 0 ? ' checked' : '') + '>' +
      '<span class="font-bold">' + escapeHtml(USAGES[k].label) + '</span><span class="text-[0.95rem] text-muted">' + escapeHtml(USAGES[k].note) + '</span></label>').join('');
    $('[data-budget-options]').innerHTML = Object.keys(BUDGETS).map((k) => '<label class="option py-3"><input type="radio" name="budget" value="' + k + '"><span class="font-bold">' + escapeHtml(BUDGETS[k].label) + '</span></label>').join('');

    const preset = urlParam('type');
    if (has(TYPES, preset)) $('input[name="type"][value="' + preset + '"]', form).checked = true;

    const val = (name) => { const r = $('input[name="' + name + '"]:checked', form); return r ? r.value : ''; };
    const state = () => ({ type: val('type'), usage: val('usage'), budget: val('budget'), territory: $('#cm-territory').value, deadline: deadline.value });

    // Suggest a deadline a week after the usual delivery, until the visitor picks their own.
    function suggestDeadline() {
      const s = state();
      if (!has(TYPES, s.type) || deadline.hasAttribute('data-touched')) return;
      deadline.value = addWorkingDays(schedule(s.type).files, 5);
    }
    deadline.addEventListener('input', () => deadline.setAttribute('data-touched', ''));

    function render() {
      const s = state();
      const e = commissionEstimate(s);
      if (!e) {
        out.innerHTML = '<p class="stamp text-pink-text">Your estimate</p><p class="h-card mt-3">Choose a project type to see a fee range and a timeline.</p>' +
          '<p class="mt-3 text-muted">New projects start from <strong class="text-ink">' + escapeHtml(fmtDate(earliestStart())) + '</strong>.</p>';
        return;
      }
      const rows = [['Kickoff call', e.plan.start], ['Sketches to you', e.plan.sketches], ['Revisions done', e.plan.revisions], ['Final art', e.plan.finals], ['Print-ready files', e.plan.files]];
      let paceNote = '';
      if (e.pace === 'too-soon') paceNote = '<p class="mt-4 rounded-xl border-2 border-danger p-3 text-[0.95rem]"><strong>That date is too soon</strong> for ' + (s.type === 'other' ? 'this' : (/^[aeiou]/i.test(e.type.label) ? 'an ' : 'a ') + escapeHtml(e.type.label.toLowerCase())) + ' project. The earliest I could deliver, as a rush job, is <strong>' + escapeHtml(fmtDate(e.rush.files)) + '</strong>.</p>';
      else if (e.pace === 'rush') paceNote = '<p class="mt-4 rounded-xl border-2 border-ink bg-yellow p-3 text-[0.95rem] text-on-ink"><strong>Rush schedule.</strong> Every phase is squeezed to make your date, with ' + Math.round(RUSH.fee * 100) + '% added to the fee.</p>';
      else if (isIsoDate(s.deadline)) {
        const spare = dayNum(s.deadline) - dayNum(e.std.files);
        paceNote = '<p class="mt-4 text-[0.95rem]"><strong>Comfortable.</strong> Files arrive ' + (spare === 0 ? 'on your date' : plural(spare, 'day', 'days') + ' before your date') + '.</p>';
      }
      const fitText = { under: 'Your budget is under the usual range for this. We can still talk: a smaller scope or a one-time license often fits.', in: 'Your budget is in the usual range for this kind of project.', over: 'Your budget is comfortably above the usual range.' };
      out.innerHTML = '<p class="stamp text-pink-text">Your estimate</p>' +
        '<p class="mt-2 font-display text-[clamp(1.6rem,3vw,2.2rem)] leading-tight" data-estimate-fee>' + price(e.low) + ' to ' + price(e.high) + '</p>' +
        '<p class="mt-1 text-[0.95rem] text-muted">' + escapeHtml(e.type.label) + ' · ' + escapeHtml(e.usage.label) + ' · ' + escapeHtml(e.terr.label) + (s.type === 'picture-books' ? ' · usually an advance against royalties' : '') + '</p>' +
        (e.fit ? '<p class="mt-3 text-[0.95rem]" data-estimate-fit>' + fitText[e.fit] + '</p>' : '') +
        paceNote +
        '<ol class="mt-5 space-y-0 border-l-4 border-dotted border-pink pl-5" data-estimate-timeline>' + rows.map((r) => '<li class="relative pb-3"><span class="absolute -left-[1.85rem] top-1.5 size-3.5 rounded-full border-2 border-ink bg-yellow" aria-hidden="true"></span><span class="block text-sm text-muted">' + r[0] + '</span><span class="font-bold">' + escapeHtml(fmtDate(r[1])) + '</span></li>').join('') + '</ol>' +
        '<p class="mt-1 text-sm text-muted">Business days only, around US holidays and the studio’s winter break. A guide, not a quote.</p>';
    }

    function showStep(n, focus) {
      stepIndex = n;
      steps.forEach((s, i) => { s.hidden = i !== n; });
      $$('[data-step-dot]').forEach((li, i) => {
        if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        li.setAttribute('data-state', i < n ? 'done' : i === n ? 'current' : 'todo');
      });
      $('[data-step-prev]', form).hidden = n === 0;
      $('[data-step-next]', form).hidden = n === steps.length - 1;
      $('[data-step-submit]', form).hidden = n !== steps.length - 1;
      $$('[data-step-label]').forEach((el) => { el.textContent = 'Step ' + (n + 1) + ' of ' + steps.length; });
      if (focus) { const h = $('h2', steps[n]); h.focus(); }
    }
    $('[data-step-next]', form).addEventListener('click', () => {
      if (!validate(steps[stepIndex])) return;
      if (stepIndex === 0) suggestDeadline();
      showStep(Math.min(stepIndex + 1, steps.length - 1), true);
      render();
    });
    $('[data-step-prev]', form).addEventListener('click', () => showStep(Math.max(stepIndex - 1, 0), true));
    form.addEventListener('change', (e) => { if (e.target.name === 'type') suggestDeadline(); render(); });
    form.addEventListener('input', render);

    // A deadline before the earliest rush delivery can't be met: say so on submit.
    deadline.setAttribute('data-validate', 'deadline');
    customRules.deadline = (el) => {
      const e = commissionEstimate(state());
      return e && e.pace === 'too-soon' ? 'The earliest I could deliver is ' + fmtDate(e.rush.files) + '. Choose that date or later.' : '';
    };

    setupValidation(form, () => {
      const s = state(), e = commissionEstimate(s);
      const first = cleanText($('#cm-name').value, 80).split(/\s+/)[0];
      const ref = makeRef('PP');
      successSwap(form, '<p class="sticker">Inquiry received</p>' +
        '<h2 class="h-section mt-4">Thanks, ' + escapeHtml(first) + '. It’s on my desk.</h2>' +
        '<p class="mt-3 text-lg">Your reference is <strong class="font-mono">' + ref + '</strong>.</p>' +
        '<p class="mt-3">I’ll reply by <strong>' + escapeHtml(fmtDate(replyBy())) + '</strong> with a few questions and a proper quote. If we go ahead, the kickoff call could be as soon as <strong>' + escapeHtml(fmtDate(e.plan.start)) + '</strong>.</p>' +
        '<dl class="mt-6 grid gap-3 border-y-2 border-dashed border-line py-4 sm:grid-cols-2">' +
          '<div><dt class="text-sm text-muted">Project</dt><dd class="font-bold">' + escapeHtml(e.type.label) + '</dd></div>' +
          '<div><dt class="text-sm text-muted">License</dt><dd class="font-bold">' + escapeHtml(e.usage.label) + ', ' + escapeHtml(e.terr.label) + '</dd></div>' +
          '<div><dt class="text-sm text-muted">Budget</dt><dd class="font-bold">' + escapeHtml(BUDGETS[s.budget].label) + '</dd></div>' +
          '<div><dt class="text-sm text-muted">Needed by</dt><dd class="font-bold">' + escapeHtml(fmtDate(s.deadline)) + (e.pace === 'rush' ? ' (rush)' : '') + '</dd></div>' +
        '</dl>' +
        '<p class="mt-4 text-muted">While you wait, the <a class="link" href="work.html?type=' + (has(CATEGORIES, s.type) ? s.type : '') + '">work page</a> has more like this.</p>');
      $$('[data-steps-nav]').forEach((el) => { el.hidden = true; });
    });

    showStep(0, false);
    render();
  }

  /* ------------------------------------------------------------------
   * 13. About and contact
   * ------------------------------------------------------------------ */
  function initEvents() {
    $$('[data-events]').forEach((el) => {
      const list = upcomingEvents().slice(0, +el.getAttribute('data-events') || 6);
      el.innerHTML = list.map((e, i) => '<li class="reveal card flex gap-4 p-4 sm:gap-6 sm:p-5">' +
        '<div class="grid w-20 shrink-0 place-content-center rounded-2xl border-2 border-ink py-2 text-center ' + ['bg-pink text-on-ink', 'bg-yellow text-on-ink', 'bg-blue text-on-blue'][i % 3] + '">' +
          '<span class="font-mono text-sm font-bold uppercase">' + fmtDate(e.date, { weekday: undefined, month: 'short', day: undefined }) + '</span>' +
          '<span class="font-display text-3xl leading-none">' + +e.date.slice(8, 10) + '</span></div>' +
        '<div class="min-w-0"><p class="stamp text-pink-text">' + escapeHtml(e.kind) + '</p><h3 class="h-card mt-1">' + escapeHtml(e.title) + '</h3>' +
          '<p class="mt-1 font-bold">' + escapeHtml(eventDates(e)) + ' · ' + escapeHtml(e.time) + '</p>' +
          '<p class="text-muted">' + escapeHtml(e.place) + '</p><p class="mt-1">' + escapeHtml(e.note) + '</p></div></li>').join('');
    });
  }
  function initContact() {
    const topic = $('#ct-topic'), orderWrap = $('[data-order-field]');
    if (!topic || !orderWrap) return;
    const sync = () => { orderWrap.hidden = topic.value !== 'order'; };
    topic.addEventListener('change', sync);
    const preset = urlParam('topic');
    if (preset && $('option[value="' + preset.replace(/[^a-z-]/g, '') + '"]', topic)) topic.value = preset;
    sync();
  }

  /* ------------------------------------------------------------------
   * 14. Forms and boot
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
  // Extra rules by data-validate name, added by the pages that need them.
  const customRules = Object.create(null);
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
      if (!/^[+()\d\s.-]+$/.test(v) || !(digits.length === 10 || (digits.length === 11 && digits[0] === '1'))) return 'Enter a 10-digit US phone number.';
    }
    if (rule === 'zip' && !/^\d{5}(-\d{4})?$/.test(v)) return 'Enter a 5-digit ZIP code.';
    if (rule === 'order' && !/^PP-?[A-Z2-9]{4}$/i.test(v)) return 'Order numbers look like PP-7K2Q.';
    if (rule === 'card') {
      const d = v.replace(/[\s-]/g, '');
      if (!/^\d{16}$/.test(d)) return 'Enter the 16-digit card number.';
      if (!luhn(d)) return 'That card number doesn’t look right. For this test checkout, use 4242 4242 4242 4242.';
    }
    if (rule === 'expiry') {
      const m = v.match(/^(\d{2})\s*\/\s*(\d{2})$/);
      if (!m || +m[1] < 1 || +m[1] > 12) return 'Use the format MM / YY.';
      const today = studioNow().date, y = +today.slice(0, 4), mo = +today.slice(5, 7);
      if (2000 + +m[2] < y || (2000 + +m[2] === y && +m[1] < mo)) return 'This card has expired.';
    }
    if (rule === 'cvc' && !/^\d{3,4}$/.test(v)) return 'Enter the 3 or 4 digit code on the back.';
    if (el.type === 'date') {
      if (!isIsoDate(v)) return 'Choose a date.';
      if (el.min && v < el.min) return 'Choose a date from ' + fmtDate(el.min, { year: 'numeric' }) + ' on.';
      if (el.max && v > el.max) return 'Choose a date before ' + fmtDate(el.max, { year: 'numeric' }) + '.';
    }
    const min = +el.getAttribute('minlength');
    if (min && v.length < min) return label + ' needs at least ' + plural(min, 'character', 'characters') + '.';
    if (has(customRules, rule)) return customRules[rule](el);
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
    const desc = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      if (desc.indexOf(errId) === -1) desc.push(errId);
      el.setAttribute('aria-describedby', desc.join(' '));
    } else {
      el.removeAttribute('aria-invalid');
    }
  }
  function isField(el) {
    return el.matches('input, select, textarea') && el.type !== 'radio' && el.type !== 'hidden' && !!el.id && !el.closest('[data-group]');
  }
  function fieldsOf(rootEl) {
    return $$('input, select, textarea', rootEl).filter((el) => isField(el) && !el.closest('[hidden]'));
  }
  function groupMessage(group) {
    return $$('input:checked', group).length ? '' : group.getAttribute('data-msg') || 'Choose an option.';
  }
  function validate(rootEl) {
    let firstBad = null;
    fieldsOf(rootEl).forEach((el) => {
      const msg = fieldMessage(el);
      showError(el, msg);
      if (msg && !firstBad) firstBad = el;
    });
    $$('[data-group]', rootEl).forEach((g) => {
      if (g.closest('[hidden]')) return;
      const msg = groupMessage(g);
      showError(g, msg);
      if (msg && !firstBad) firstBad = $('input:not(:disabled)', g);
    });
    const form = rootEl.closest('form') || rootEl;
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
    form.addEventListener('change', (e) => {
      const g = e.target.closest('[data-group]');
      if (g && g.hasAttribute('aria-invalid')) showError(g, groupMessage(g));
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validate(form)) onValid(form);
    });
  }
  // A short reference like PP-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  function successSwap(el, html) {
    const box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.className = 'card p-6 shadow-[6px_6px_0_var(--color-pink)] focus:outline-none sm:p-8';
    box.innerHTML = html;
    el.replaceWith(box);
    box.focus({ preventScroll: true });
    return box;
  }

  // To connect a form to a real service, replace successSwap(...) in the handlers below with a
  // fetch() and show the success state only when the service answers OK, for example:
  //   fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  //     .then((r) => { if (r.ok) successSwap(form, '…'); else toast('Sorry, that didn’t go through. Please try again.'); });
  function initForms() {
    $$('[data-form="stickers"]').forEach((form) => setupValidation(form, () => {
      const first = cleanText($('#st-name', form).value, 60).split(/\s+/)[0];
      const now = studioNow().date;
      const month = new Date(Date.UTC(+now.slice(0, 4), +now.slice(5, 7), 1)).toLocaleDateString(LOCALE, { month: 'long', timeZone: 'UTC' });
      successSwap(form, '<p class="h-card">You’re on the list, ' + escapeHtml(first) + '.</p>' +
        '<p class="mt-2">Confirm your address from the email we’re sending, and your sticker sheet goes in the mail with the ' + month + ' newsletter.</p>');
    }));
    $$('[data-form="contact"]').forEach((form) => setupValidation(form, () => {
      const first = cleanText($('#ct-name').value, 80).split(/\s+/)[0];
      const topicLabel = $('#ct-topic').selectedOptions[0].textContent;
      successSwap(form, '<p class="sticker">Message received</p><h2 class="h-section mt-4">Thanks, ' + escapeHtml(first) + '.</h2>' +
        '<p class="mt-3">Your message about <strong>' + escapeHtml(topicLabel.toLowerCase()) + '</strong> is in, with reference <strong class="font-mono">' + makeRef('PP') + '</strong>. You’ll hear back by <strong>' + escapeHtml(fmtDate(replyBy())) + '</strong>.</p>' +
        '<p class="mt-2 text-muted">Shop questions are answered by Dez, who packs the orders. Everything else comes to me.</p>');
    }));
    $$('[data-count-for]').forEach((outEl) => {
      const field = document.getElementById(outEl.getAttribute('data-count-for'));
      if (!field) return;
      const upd = () => { outEl.textContent = plural(field.maxLength - field.value.length, 'character', 'characters') + ' left'; };
      field.addEventListener('input', upd);
      upd();
    });
    // Card number: group digits in fours as they're typed.
    $$('[data-validate="card"]').forEach((el) => el.addEventListener('input', () => {
      const d = el.value.replace(/\D/g, '').slice(0, 16);
      const next = d.replace(/(\d{4})(?=\d)/g, '$1 ');
      if (next !== el.value) el.value = next;
    }));
    $$('[data-validate="expiry"]').forEach((el) => el.addEventListener('input', (e) => {
      if (e.inputType && e.inputType.indexOf('delete') === 0) return;
      const d = el.value.replace(/\D/g, '').slice(0, 4);
      el.value = d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d;
    }));
  }

  renderDates();
  renderClock();
  setInterval(renderClock, 30000);
  renderCartBadges();
  cartListeners.push(renderCartBadges);
  paintArt(document);
  initForms();
  const page = document.body.getAttribute('data-page');
  if (page === 'home') initHome();
  if (page === 'work') initWork();
  if (page === 'project') initProject();
  if (page === 'shop') initShop();
  if (page === 'checkout') initCheckout();
  if (page === 'commissions') initCommissions();
  if (page === 'contact') initContact();
  initEvents();
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
