/* Cinderjack Brewing Co. (Brew template) — all template behavior. Vanilla, no dependencies.
 * The data (beers, hours, events, products, tours, spaces) lives in assets/js/data.js.
 *
 *  1. Setup            data, storage keys, demo-date shift
 *  2. Helpers          DOM, storage, money, plurals, Pacific time, dates
 *  3. Hours            federal holidays (by rule), special hours, open-now status
 *  4. Artwork          can labels, merch drawings, flavor radar, ABV/IBU map, event icons
 *  5. Header           sticky header, mobile menu, scroll reveals, footer year
 *  6. Status           open-now badges, today's hours, hours tables, holiday list
 *  7. Tap board        live "on tap now" board, food truck of the day and week
 *  8. Taproom          pour menu, snacks, flight builder
 *  9. Beers            filters, cards, ABV/IBU map, tasting-notes dialog
 * 10. Events           program list with filters, next-up card, home teaser
 * 11. Cart             saved cart, shop grid, cart panel, toast
 * 12. Checkout         pickup day and slot, 21+ confirmation, order reference
 * 13. Tours            tour, date, time and party size with live capacity, saved bookings
 * 14. Private events     inquiry form with space capacity and minimum spend
 * 15. Back to top      (separate block at the end of the file)
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Setup
   * ------------------------------------------------------------------ */
  const D = window.BREW_DATA;
  if (!D) return;
  const BREW = D.BREW;
  const TZ = BREW.timeZone;

  // localStorage keys (both validated on every read):
  //   cinderjack-cart   { lines: [{ id, opt, qty }] }
  //   cinderjack-tours  [{ ref, tour, date, time, adults, minors, name }]
  const STORE_CART = 'cinderjack-cart';
  const STORE_TOURS = 'cinderjack-tours';
  const MAX_SAVED_TOURS = 6;

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const params = new URLSearchParams(window.location.search);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
  const store = {
    get(key) { try { const raw = safeStorage.getItem(key); return raw === null ? null : JSON.parse(raw); } catch (e) { return null; } },
    set(key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* full or blocked */ } },
    remove(key) { try { safeStorage.removeItem(key); } catch (e) { /* blocked */ } }
  };

  // Values from the URL or storage must be the data's own keys, so ?style=constructor matches nothing.
  const hasOwn = (obj, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : (many || one + 's'));
  const moneyFmt = new Intl.NumberFormat(BREW.locale, { style: 'currency', currency: BREW.currency, minimumFractionDigits: 2 });
  const money = (n) => { const s = moneyFmt.format(n); return s.endsWith('.00') ? s.slice(0, -3) : s; };
  const byId = (list) => list.reduce((m, x) => { m[x.id] = x; return m; }, Object.create(null));
  const BEERS = byId(D.BEERS);
  const PRODUCTS = byId(D.PRODUCTS);

  function toMin(hhmm) { const p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }
  // Minutes after midnight to US clock times: "3pm", "6:30pm", "12pm".
  function clock(min) {
    const h = Math.floor(min / 60) % 24, m = min % 60;
    return (h % 12 || 12) + (m ? ':' + String(m).padStart(2, '0') : '') + (h < 12 ? 'am' : 'pm');
  }
  function range(a, b) {
    const sameHalf = (a < 720) === (b < 720);
    const left = clock(a);
    return (sameHalf ? left.replace(/am|pm/, '') : left) + '–' + clock(b);
  }

  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Calendar dates are "YYYY-MM-DD" keys, worked out in UTC so clock changes never shift a day.
  const keyOf = (y, m, d) => y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  function dateOfKey(key) { const p = key.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12)); }
  const keyOfDate = (d) => keyOf(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  function addDays(key, n) { const d = dateOfKey(key); d.setUTCDate(d.getUTCDate() + n); return keyOfDate(d); }
  const weekday = (key) => dateOfKey(key).getUTCDay();
  const daysBetween = (a, b) => Math.round((dateOfKey(b) - dateOfKey(a)) / 86400000);
  function validKey(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const p = s.split('-');
    return +p[1] >= 1 && +p[1] <= 12 && keyOfDate(dateOfKey(s)) === s;
  }
  const shortDate = (key) => { const d = dateOfKey(key); return DAY[d.getUTCDay()] + ', ' + MONTH[d.getUTCMonth()] + ' ' + d.getUTCDate(); };
  const longDate = (key) => { const d = dateOfKey(key); return DAY_LONG[d.getUTCDay()] + ', ' + MONTH_LONG[d.getUTCMonth()] + ' ' + d.getUTCDate(); };
  // ISO 8601 week number (weeks start on Monday) — drives the food truck rotation.
  function isoWeek(key) {
    const d = dateOfKey(key);
    const day = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - day);
    const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1, 12);
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  // Wall-clock time in Bend, whatever the visitor's own time zone is.
  const tzParts = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  // ?now=2026-10-23T13:00 previews the site at a Pacific date and time (hours, taps, slots, events).
  const NOW_PARAM = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(params.get('now') || '');
  function nowPacific() {
    if (NOW_PARAM && validKey(NOW_PARAM[1]) && +NOW_PARAM[2] < 24 && +NOW_PARAM[3] < 60) {
      return { key: NOW_PARAM[1], day: weekday(NOW_PARAM[1]), mins: +NOW_PARAM[2] * 60 + +NOW_PARAM[3] };
    }
    const o = {};
    tzParts.formatToParts(new Date()).forEach((p) => { o[p.type] = p.value; });
    const k = keyOf(+o.year, +o.month, +o.day);
    return { key: k, day: weekday(k), mins: (+o.hour % 24) * 60 + +o.minute };
  }
  const stamp = (key, mins) => daysBetween('2000-01-01', key) * 1440 + mins;
  const NOW = nowPacific();
  const TODAY = NOW.key;

  // Deterministic pseudo-random numbers (FNV-1a + mix), so demo keg levels, seats and slots are
  // stable for a given day instead of changing on every reload.
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    h ^= h >>> 16; h = Math.imul(h, 2246822507) >>> 0;
    h ^= h >>> 13; h = Math.imul(h, 3266489909) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
  }
  function makeRef(prefix) { return prefix + '-' + String(1000 + (hash(prefix + Date.now() + Math.random()) % 9000)); }

  // Demo dates, while KEEP_DEMO_CURRENT is on:
  //  - the regular program (events without yearly: true) moves forward by the whole weeks elapsed since
  //    DEMO_ANCHOR, so it is always ahead of today and every event keeps its weekday;
  //  - seasonal events (yearly: true) come back once a year at the same time of year: on the same weekday,
  //    in the week ending on the date's anniversary (yearlyOn), so they never drift into the wrong season;
  //  - the calendar shows events up to the last date of the regular program (EVENTS_UNTIL), so seasonal
  //    events appear when their season comes round and the list is never empty.
  // Turn it off and every event keeps its written date; past events drop off the list.
  function yearlyOn(key, y) {
    let k = keyOfDate(dateOfKey(keyOf(y, +key.slice(5, 7), +key.slice(8, 10))));
    const wd = weekday(key);
    while (weekday(k) !== wd) k = addDays(k, -1);
    return k;
  }
  const SHIFT_DAYS = D.KEEP_DEMO_CURRENT ? Math.max(0, Math.floor(daysBetween(D.DEMO_ANCHOR, TODAY) / 7) * 7) : 0;
  let EVENTS_UNTIL = null;
  D.EVENTS.forEach((e) => {
    e.written = e.date;
    if (!D.KEEP_DEMO_CURRENT) return;
    if (e.yearly) {
      for (let y = +e.written.slice(0, 4); e.date < TODAY; y++) e.date = yearlyOn(e.written, y + 1);
    } else {
      e.date = addDays(e.date, SHIFT_DAYS);
      if (!EVENTS_UNTIL || e.date > EVENTS_UNTIL) EVENTS_UNTIL = e.date;
    }
  });

  // The seasonal tap (SEASONAL_TAP): each beer goes on at the start of its release event and pours until
  // the next beer's release starts, so the board never contradicts the calendar.
  const SEASONAL = D.SEASONAL_TAP && D.SEASONAL_TAP.beers ? D.SEASONAL_TAP.beers : {};
  // Start stamps of an event's releases: every year's while KEEP_DEMO_CURRENT is on, else the written date.
  function releaseStarts(eventId) {
    const e = D.EVENTS.find((x) => x.id === eventId);
    if (!e) return [];
    const mins = toMin(e.start), y0 = +e.written.slice(0, 4), y1 = +TODAY.slice(0, 4);
    if (!D.KEEP_DEMO_CURRENT || !e.yearly) return [{ key: e.date, stamp: stamp(e.date, mins), mins: mins }];
    const out = [];
    for (let y = Math.min(y0, y1) - 1; y <= Math.max(y0, y1) + 1; y++) {
      const k = yearlyOn(e.written, y);
      out.push({ key: k, stamp: stamp(k, mins), mins: mins });
    }
    return out;
  }
  // Sets tap and tapped on the seasonal beers for a moment in time ({ key, mins }).
  function assignSeasonalTap(now) {
    const t = stamp(now.key, now.mins);
    let best = null;
    Object.keys(SEASONAL).forEach((id) => {
      if (!hasOwn(BEERS, id)) return;
      BEERS[id].tap = null;
      BEERS[id].tapped = null;
      releaseStarts(SEASONAL[id]).forEach((r) => {
        if (r.stamp <= t && (!best || r.stamp > best.stamp)) best = { id: id, key: r.key, stamp: r.stamp };
      });
    });
    if (best) {
      BEERS[best.id].tap = D.SEASONAL_TAP.tap;
      BEERS[best.id].tapped = daysBetween(best.key, now.key);
    }
  }
  // When a seasonal beer that isn't pouring goes on next, or null.
  function nextOnTap(id) {
    if (!hasOwn(SEASONAL, id)) return null;
    const t = stamp(NOW.key, NOW.mins);
    const next = releaseStarts(SEASONAL[id]).filter((r) => r.stamp > t).sort((a, b) => a.stamp - b.stamp)[0];
    return next || null;
  }
  assignSeasonalTap(NOW);

  function setError(form, name, msg) {
    const el = $('[data-error="' + name + '"]', form);
    if (el) el.textContent = msg || '';
    $$('[name="' + name + '"]', form).forEach((input) => {
      if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    });
    return !msg;
  }
  function focusFirstError(form) {
    const bad = $('[aria-invalid="true"]', form);
    if (bad) bad.focus();
  }
  function clearOnInput(form) {
    $$('input, textarea, select', form).forEach((el) => {
      const evt = el.type === 'checkbox' || el.type === 'radio' || el.tagName === 'SELECT' ? 'change' : 'input';
      el.addEventListener(evt, () => { if (el.getAttribute('aria-invalid') === 'true') setError(form, el.name, ''); });
    });
  }
  const digits = (s) => String(s || '').replace(/\D/g, '');
  function validPhone(s) { const d = digits(s); return d.length === 10 || (d.length === 11 && d[0] === '1'); }
  function firstName(s) { return String(s).trim().split(/\s+/)[0]; }

  /* ------------------------------------------------------------------
   * 3. Hours — US federal holidays worked out for any year, by rule
   * ------------------------------------------------------------------ */
  const holidayCache = Object.create(null);
  function nthWeekday(y, month, wd, n) {
    let k = keyOf(y, month, 1);
    while (weekday(k) !== wd) k = addDays(k, 1);
    return addDays(k, (n - 1) * 7);
  }
  function lastWeekday(y, month, wd) {
    let k = addDays(month === 12 ? keyOf(y + 1, 1, 1) : keyOf(y, month + 1, 1), -1);
    while (weekday(k) !== wd) k = addDays(k, -1);
    return k;
  }
  // { "YYYY-MM-DD": { id, name } } on the day itself (the taproom keeps holiday hours on the actual
  // date, not the federal "observed" weekday).
  function federalHolidays(y) {
    if (holidayCache[y]) return holidayCache[y];
    const out = Object.create(null);
    const put = (k, id, name) => { out[k] = { id: id, name: name }; };
    put(keyOf(y, 1, 1), 'newyear', "New Year's Day");
    put(nthWeekday(y, 1, 1, 3), 'mlk', 'Martin Luther King Jr. Day');
    put(nthWeekday(y, 2, 1, 3), 'presidents', "Presidents' Day");
    put(lastWeekday(y, 5, 1), 'memorial', 'Memorial Day');
    put(keyOf(y, 6, 19), 'juneteenth', 'Juneteenth');
    put(keyOf(y, 7, 4), 'independence', 'Independence Day');
    put(nthWeekday(y, 9, 1, 1), 'labor', 'Labor Day');
    put(nthWeekday(y, 10, 1, 2), 'columbus', "Indigenous Peoples' Day");
    put(keyOf(y, 11, 11), 'veterans', 'Veterans Day');
    put(nthWeekday(y, 11, 4, 4), 'thanksgiving', 'Thanksgiving');
    put(keyOf(y, 12, 25), 'christmas', 'Christmas Day');
    holidayCache[y] = out;
    return out;
  }
  // Everything about one date: { open: [openMin, closeMin] | null, special: { name, note, changed } | null }.
  function dayInfo(key) {
    const regular = D.HOURS[weekday(key)];
    const base = regular ? [toMin(regular[0]), toMin(regular[1])] : null;
    const hol = federalHolidays(+key.slice(0, 4))[key];
    if (hol && hasOwn(D.HOLIDAY_HOURS, hol.id)) {
      const rule = D.HOLIDAY_HOURS[hol.id];
      if (rule.hours === 'regular') return { open: base, special: { name: hol.name, note: rule.note, changed: false } };
      return { open: rule.hours ? [toMin(rule.hours[0]), toMin(rule.hours[1])] : null, special: { name: hol.name, note: rule.note, changed: true } };
    }
    const md = key.slice(5);
    if (hasOwn(D.EXTRA_HOURS, md)) {
      const x = D.EXTRA_HOURS[md];
      return { open: x.hours ? [toMin(x.hours[0]), toMin(x.hours[1])] : null, special: { name: x.name, note: x.note, changed: true } };
    }
    return { open: base, special: null };
  }
  const isOpenDay = (key) => !!dayInfo(key).open;
  function nextOpening(now) {
    for (let i = 0; i < 14; i++) {
      const key = addDays(now.key, i), h = dayInfo(key).open;
      if (!h || (i === 0 && now.mins >= h[0])) continue;
      return { key: key, mins: h[0], offset: i };
    }
    return null;
  }
  function whenWord(offset, key) {
    if (offset === 0) return 'today';
    if (offset === 1) return 'tomorrow';
    if (offset < 7) return DAY_LONG[weekday(key)];
    return shortDate(key);
  }
  // { state: 'open' | 'lastcall' | 'closed', text, short } — never a bare "Closed".
  function taproomStatus(now) {
    const info = dayInfo(now.key), h = info.open;
    if (h && now.mins >= h[0] && now.mins < h[1]) {
      if (h[1] - now.mins <= D.LAST_CALL_MINUTES) return { state: 'lastcall', text: 'Last call · closing at ' + clock(h[1]), short: 'Last call' };
      return { state: 'open', text: 'Open now · until ' + clock(h[1]), short: 'Open until ' + clock(h[1]) };
    }
    const n = nextOpening(now);
    if (!n) return { state: 'closed', text: 'Call for opening times', short: 'Call us' };
    const prefix = info.special && !h ? info.special.name + ' · ' : '';
    return { state: 'closed', text: prefix + 'Opens ' + whenWord(n.offset, n.key) + ' at ' + clock(n.mins), short: 'Opens ' + whenWord(n.offset, n.key) + ' ' + clock(n.mins) };
  }

  /* ------------------------------------------------------------------
   * 4. Artwork — drawn from the data, so every beer gets its own label
   * ------------------------------------------------------------------ */
  // Label drawings in a 100 × 100 box. k = ink, a = accent band color, b = label color.
  const MOTIFS = {
    cone: (k, a, b) => '<circle cx="70" cy="28" r="13" fill="' + a + '"/><path d="M6 88 38 34q12-12 24 0l32 54Z" fill="' + k + '"/><path d="M38 34q12 8 24 0" fill="none" stroke="' + a + '" stroke-width="4"/><path d="M50 40 44 52l10 8-12 10 14 10-8 8" fill="none" stroke="' + b + '" stroke-width="3" stroke-dasharray="4 4" stroke-linecap="round"/><path d="M42 22q4-8 0-14M54 20q-4-8 2-14" fill="none" stroke="' + k + '" stroke-width="3" stroke-linecap="round"/>',
    whirl: (k, a) => '<path d="M50 14c22 0 34 14 30 26-3 10-18 12-30 10s-24 2-22 12 18 12 26 8M30 50c-4 10 6 18 16 16M50 66c8 6 4 16-4 18" fill="none" stroke="' + k + '" stroke-width="5" stroke-linecap="round"/><circle cx="22" cy="28" r="3" fill="' + a + '"/><circle cx="80" cy="64" r="4" fill="' + a + '"/><circle cx="70" cy="84" r="2.5" fill="' + k + '"/><circle cx="18" cy="74" r="2.5" fill="' + k + '"/><path d="M14 92h72" stroke="' + k + '" stroke-width="3" stroke-linecap="round"/>',
    hare: (k, a) => '<circle cx="74" cy="26" r="11" fill="' + a + '"/><path d="M20 84q-6-26 18-34 14-5 26 2l8-30q3-6 6 0l-4 28 10-24q4-4 5 2l-8 30q8 8 4 18l-8 4-4 8h-8l3-8q-14 4-26 2l-4 8h-8l3-6q-12 6-13 0Z" fill="' + k + '"/><circle cx="76" cy="58" r="2" fill="' + a + '"/><path d="M8 92h84" stroke="' + k + '" stroke-width="3" stroke-linecap="round"/>',
    rim: (k, a, b) => '<path d="M14 56a36 36 0 0 1 72 0Z" fill="' + a + '"/><path d="M50 10v8M22 22l6 6M78 22l-6 6M8 44h8M84 44h8" stroke="' + a + '" stroke-width="4" stroke-linecap="round"/><path d="M4 56h40l6 10h18l6-10h22v38H4Z" fill="' + b + '" stroke="' + a + '" stroke-width="3"/><path d="M4 70h34l8 8h30l6-8h14M4 84h92" fill="none" stroke="' + a + '" stroke-width="3"/>',
    pine: (k, a) => '<path d="M50 6 28 38h12L22 62h14L16 86h68L64 62h14L60 38h12Z" fill="' + a + '"/><path d="M46 86h8v8h-8Z" fill="' + a + '"/><path d="M78 16q8 12 0 18-8-6 0-18Z" fill="' + a + '" stroke="' + a + '" stroke-width="2"/>',
    mesa: (k, a) => '<circle cx="64" cy="32" r="16" fill="' + a + '"/><path d="M6 76h88M20 76l10-26h40l10 26" fill="' + k + '" stroke="' + k + '" stroke-width="3" stroke-linejoin="round"/><path d="M30 50h40" stroke="' + a + '" stroke-width="3"/><path d="M10 86h30M50 86h40M24 94h52" stroke="' + k + '" stroke-width="3" stroke-linecap="round"/>',
    flake: (k, a) => '<path d="M4 92 34 50l10 10 16-24 36 56Z" fill="' + a + '"/><path d="M34 50 28 60l8-2 6 6M60 36l-6 10 8-2 8 6" fill="none" stroke="#fff" stroke-width="3" stroke-linejoin="round"/><g stroke="' + k + '" stroke-width="3.5" stroke-linecap="round"><path d="M70 6v28M58 13l24 14M58 27l24-14M66 8l4 4 4-4M66 32l4-4 4 4"/></g>',
    tumble: (k, a) => '<g fill="none" stroke="' + k + '" stroke-width="3" stroke-linecap="round"><ellipse cx="50" cy="50" rx="34" ry="30"/><ellipse cx="50" cy="50" rx="24" ry="32" transform="rotate(30 50 50)"/><ellipse cx="50" cy="50" rx="30" ry="18" transform="rotate(-24 50 50)"/><path d="M24 38q26 6 52 22M30 70q14-30 44-40"/></g><path d="M6 92h88" stroke="' + a + '" stroke-width="5" stroke-linecap="round"/><path d="M84 80q8-4 12 2" stroke="' + a + '" stroke-width="3" fill="none"/>',
    tower: (k, a) => '<path d="M4 94q46-24 92 0Z" fill="' + a + '"/><path d="M30 18h40l6 10H24Z" fill="' + k + '"/><path d="M30 28h40v20H30Z" fill="none" stroke="' + k + '" stroke-width="4"/><path d="M38 34h24v8H38Z" fill="' + a + '"/><g stroke="' + k + '" stroke-width="3.5" stroke-linecap="round"><path d="M32 48 24 86M68 48l8 38M30 60h40M27 74h46M30 60l43 14M70 60l-43 14"/></g><path d="M50 4v14" stroke="' + k + '" stroke-width="3"/>',
    ridges: (k, a, b) => '<circle cx="74" cy="22" r="10" fill="' + a + '"/><path d="M2 60 22 36l14 14 18-24 20 24 10-10 14 20v34H2Z" fill="' + a + '"/><path d="M2 72 18 58l16 10 18-16 22 18 22-12v36H2Z" fill="' + b + '" stroke="' + a + '" stroke-width="3"/><path d="M2 86l20-10 22 8 24-10 30 10" fill="none" stroke="' + a + '" stroke-width="3"/>',
    stones: (k, a, b) => '<path d="M10 74q-4-22 18-28 18-4 26 10 6 16-10 26-24 8-34-8Z" fill="' + a + '"/><path d="M52 58q0-24 24-26 20 0 20 22 0 18-20 22-22 2-24-18Z" fill="' + a + '"/><path d="M34 30q2-16 18-16 14 2 12 16-4 12-16 10-14-2-14-10Z" fill="' + a + '"/><g fill="' + b + '"><circle cx="24" cy="62" r="3"/><circle cx="34" cy="72" r="2"/><circle cx="40" cy="58" r="2.5"/><circle cx="70" cy="46" r="3"/><circle cx="82" cy="58" r="2"/><circle cx="66" cy="62" r="2.5"/><circle cx="46" cy="22" r="2"/><circle cx="54" cy="28" r="1.8"/></g><path d="M6 92h88" stroke="' + a + '" stroke-width="3" stroke-linecap="round"/>',
    cave: (k, a) => '<path d="M4 94V54Q4 10 50 10t46 44v40Z" fill="' + a + '"/><path d="M20 94V60q0-30 30-30t30 30v34Z" fill="' + k + '"/><path d="M62 42a10 10 0 1 1-8-10 8 8 0 0 0 8 10Z" fill="' + a + '"/><circle cx="36" cy="52" r="1.6" fill="' + a + '"/><circle cx="44" cy="64" r="1.2" fill="' + a + '"/><circle cx="66" cy="66" r="1.4" fill="' + a + '"/><path d="M28 94q22-10 44 0" stroke="' + a + '" stroke-width="3" fill="none"/>',
    sprig: (k, a) => '<path d="M50 94Q48 52 56 8" fill="none" stroke="' + k + '" stroke-width="3.5" stroke-linecap="round"/><g fill="' + a + '"><ellipse cx="38" cy="30" rx="12" ry="5" transform="rotate(30 38 30)"/><ellipse cx="66" cy="34" rx="12" ry="5" transform="rotate(-30 66 34)"/><ellipse cx="36" cy="52" rx="14" ry="6" transform="rotate(24 36 52)"/><ellipse cx="66" cy="56" rx="14" ry="6" transform="rotate(-24 66 56)"/><ellipse cx="36" cy="74" rx="14" ry="6" transform="rotate(18 36 74)"/><ellipse cx="64" cy="78" rx="13" ry="6" transform="rotate(-18 64 78)"/><ellipse cx="57" cy="12" rx="5" ry="9"/></g>',
    cactus: (k, a) => '<circle cx="74" cy="22" r="14" fill="#f6c453"/><g fill="' + a + '"><ellipse cx="44" cy="70" rx="18" ry="22"/><ellipse cx="24" cy="40" rx="12" ry="15" transform="rotate(-24 24 40)"/><ellipse cx="62" cy="38" rx="12" ry="16" transform="rotate(20 62 38)"/></g><g fill="' + k + '"><ellipse cx="18" cy="24" rx="4" ry="5"/><ellipse cx="30" cy="24" rx="4" ry="5"/><ellipse cx="68" cy="20" rx="4" ry="5"/></g><g stroke="#fff" stroke-width="1.6" stroke-linecap="round"><path d="M38 62l-3-2M50 72l3-2M42 82l-2 3M24 40l-3-2M62 36l3-2"/></g><path d="M8 94h84" stroke="' + k + '" stroke-width="3" stroke-linecap="round"/>',
    berry: (k, a) => '<path d="M50 30q-4-14 12-22 4 14-12 22Z" fill="' + a + '"/><path d="M50 30q-16-10-30-2 14 12 30 2Z" fill="' + a + '"/><g fill="' + a + '" stroke="' + k + '" stroke-width="2"><circle cx="40" cy="44" r="9"/><circle cx="58" cy="44" r="9"/><circle cx="32" cy="60" r="9"/><circle cx="50" cy="60" r="9"/><circle cx="68" cy="60" r="9"/><circle cx="40" cy="76" r="9"/><circle cx="58" cy="76" r="9"/><circle cx="49" cy="90" r="7"/></g><g fill="' + k + '"><circle cx="38" cy="41" r="2"/><circle cx="56" cy="41" r="2"/><circle cx="48" cy="57" r="2"/><circle cx="30" cy="57" r="2"/><circle cx="66" cy="57" r="2"/></g>'
  };

  // A can (or bottle) with the beer's label. size: CSS classes for the <svg>.
  function canSvg(beer, cls, decorative) {
    const c = beer.colors, k = c[2], a = c[1], b = c[0];
    const motif = hasOwn(MOTIFS, beer.motif) ? MOTIFS[beer.motif](k, a, b) : '';
    // Long names go on two lines, split at the space nearest the middle.
    const name = beer.name.toUpperCase();
    let lines = [name];
    if (name.length > 11 && name.indexOf(' ') !== -1) {
      const mid = name.length / 2;
      let best = -1;
      name.replace(/ /g, (m, i) => { if (best === -1 || Math.abs(i - mid) < Math.abs(best - mid)) best = i; return m; });
      lines = [name.slice(0, best), name.slice(best + 1)];
    }
    const fit = (t) => (t.length > 9 ? ' textLength="82" lengthAdjust="spacingAndGlyphs"' : '');
    const nameSvg = lines.length === 1
      ? '<text x="60" y="146" text-anchor="middle" font-family="Alfa Slab One, Rockwell, serif" font-size="14" fill="' + b + '"' + (name.length > 8 ? ' textLength="82" lengthAdjust="spacingAndGlyphs"' : '') + '>' + esc(name) + '</text>'
      : lines.map((t, i) => '<text x="60" y="' + (138 + i * 14) + '" text-anchor="middle" font-family="Alfa Slab One, Rockwell, serif" font-size="12.5" fill="' + b + '"' + fit(t) + '>' + esc(t) + '</text>').join('');
    const label = decorative ? ' aria-hidden="true" focusable="false"' : ' role="img" aria-label="' + esc(beer.name + ' can, ' + beer.style) + '"';
    return '<svg viewBox="0 0 120 200" class="' + (cls || '') + '"' + label + '>' +
      '<rect x="18" y="8" width="84" height="16" rx="6" fill="#d8d2c4" stroke="#241a13" stroke-width="3"/>' +
      '<rect x="12" y="20" width="96" height="166" rx="12" fill="' + b + '" stroke="#241a13" stroke-width="3.5"/>' +
      '<g transform="translate(20 36) scale(.8)">' + motif + '</g>' +
      '<rect x="13.75" y="122" width="92.5" height="36" fill="' + a + '"/>' +
      nameSvg +
      '<text x="60" y="175" text-anchor="middle" font-family="Golos Text, sans-serif" font-size="10" font-weight="800" letter-spacing="2" fill="' + k + '">' + esc(beer.abv.toFixed(1)) + '% ABV</text>' +
      '<rect x="22" y="28" width="7" height="150" rx="3.5" fill="#fff" opacity=".28"/>' +
      '<rect x="18" y="182" width="84" height="12" rx="5" fill="#d8d2c4" stroke="#241a13" stroke-width="3"/>' +
      '</svg>';
  }

  // Merch drawings, viewBox 0 0 160 200.
  const MERCH_ART = {
    tee: '<path d="M52 30 30 40 10 72l22 12 10-14v108h76V70l10 14 22-12-20-32-22-10q-8 14-28 14T52 30Z" fill="#24493f" stroke="#241a13" stroke-width="4" stroke-linejoin="round"/><path d="M60 32q20 14 40 0" fill="none" stroke="#241a13" stroke-width="4"/><path d="M58 128 80 86l22 42Z" fill="#e0a133"/><path d="M74 96q6-4 12 0" stroke="#d9623a" stroke-width="4" fill="none"/><text x="80" y="146" text-anchor="middle" font-family="Alfa Slab One, serif" font-size="9" textLength="56" lengthAdjust="spacingAndGlyphs" fill="#f3d692">CINDERJACK</text>',
    cap: '<path d="M24 120q0-66 56-66t56 66Z" fill="#fbf5e8" stroke="#241a13" stroke-width="4"/><path d="M80 54q-26 0-40 66h80q-14-66-40-66Z" fill="#a63f1c" stroke="#241a13" stroke-width="4"/><path d="M14 122q66-14 132 0l4 12q-70-10-140 0Z" fill="#241a13"/><g stroke="#fbf5e8" stroke-width="1.5" opacity=".7"><path d="M30 84h20M28 96h22M30 108h20M110 84h20M110 96h22M110 108h20"/></g><rect x="58" y="76" width="44" height="32" rx="8" fill="#e0a133" stroke="#241a13" stroke-width="3"/><path d="M66 102q-2-10 8-12l4-12q2-2 3 0l-2 12 6-10q2-1 2 1l-4 10q6 4 3 9Z" fill="#241a13"/><circle cx="80" cy="52" r="5" fill="#241a13"/>',
    glass: '<path d="M44 26h72l-10 150H54Z" fill="#f6d86b" stroke="#241a13" stroke-width="4" stroke-linejoin="round"/><path d="M44 26h72l-2 24H46Z" fill="#fbf5e8" stroke="#241a13" stroke-width="4" stroke-linejoin="round"/><circle cx="58" cy="42" r="5" fill="#fff"/><circle cx="74" cy="38" r="6" fill="#fff"/><circle cx="96" cy="42" r="5" fill="#fff"/><path d="M64 110 80 80l16 30Z" fill="#a63f1c"/><text x="80" y="128" text-anchor="middle" font-family="Alfa Slab One, serif" font-size="9" textLength="40" lengthAdjust="spacingAndGlyphs" fill="#241a13">BEND, OR</text><path d="M56 60v100" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".4"/>',
    growler: '<rect x="62" y="14" width="36" height="22" rx="4" fill="#241a13"/><path d="M98 50q30 4 30 34t-30 34" fill="none" stroke="#241a13" stroke-width="8"/><path d="M66 36h28v14q24 12 24 40v86q0 10-10 10H52q-10 0-10-10V90q0-28 24-40Z" fill="#c9c3b6" stroke="#241a13" stroke-width="4"/><rect x="50" y="104" width="60" height="44" rx="4" fill="#24493f"/><path d="M58 140 80 112l22 28Z" fill="#e0a133"/><path d="M56 60v110" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5"/>',
    pin: '<circle cx="80" cy="100" r="58" fill="#e0a133" stroke="#241a13" stroke-width="5"/><circle cx="80" cy="100" r="48" fill="#24493f"/><path d="M40 136q40-26 80 0" fill="#a63f1c"/><path d="M64 64h32l5 8H59Z" fill="#f3d692"/><path d="M66 72h28v16H66Z" fill="none" stroke="#f3d692" stroke-width="4"/><g stroke="#f3d692" stroke-width="3.5" stroke-linecap="round"><path d="M68 88l-6 30M92 88l6 30M66 100h28M66 100l30 14M94 100l-30 14"/></g><circle cx="118" cy="58" r="6" fill="#fff" opacity=".6"/>',
    stickers: '<g transform="rotate(-10 60 80)"><rect x="18" y="40" width="70" height="70" rx="10" fill="#e0a133" stroke="#241a13" stroke-width="4"/><path d="M28 98 53 56l25 42Z" fill="#241a13"/></g><g transform="rotate(8 110 90)"><circle cx="108" cy="84" r="34" fill="#a63f1c" stroke="#241a13" stroke-width="4"/><path d="M90 96q18-24 36 0" fill="none" stroke="#f3d692" stroke-width="5"/></g><g transform="rotate(-4 80 150)"><rect x="34" y="128" width="96" height="40" rx="20" fill="#24493f" stroke="#241a13" stroke-width="4"/><text x="82" y="154" text-anchor="middle" font-family="Alfa Slab One, serif" font-size="13" fill="#f3d692">BEND, OR</text></g>',
    crowler: '<rect x="40" y="10" width="80" height="14" rx="5" fill="#9b958a" stroke="#241a13" stroke-width="3"/><rect x="32" y="20" width="96" height="168" rx="10" fill="#d8d2c4" stroke="#241a13" stroke-width="4"/><rect x="42" y="62" width="76" height="80" rx="3" fill="#fbf5e8" stroke="#241a13" stroke-width="3" transform="rotate(-3 80 102)"/><text x="80" y="92" text-anchor="middle" font-family="Alfa Slab One, serif" font-size="13" fill="#a63f1c" transform="rotate(-3 80 102)">CROWLER</text><text x="80" y="112" text-anchor="middle" font-family="Golos Text, sans-serif" font-size="10" font-weight="700" fill="#241a13" transform="rotate(-3 80 102)">32 OZ · FILLED</text><text x="80" y="126" text-anchor="middle" font-family="Golos Text, sans-serif" font-size="10" font-weight="700" fill="#241a13" transform="rotate(-3 80 102)">TO ORDER</text><path d="M42 30v150" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity=".5"/>'
  };
  function productArt(p, cls) {
    if (p.beer && hasOwn(BEERS, p.beer)) return canSvg(BEERS[p.beer], cls, true);
    const art = hasOwn(MERCH_ART, p.art) ? MERCH_ART[p.art] : '';
    return '<svg viewBox="0 0 160 200" class="' + (cls || '') + '" aria-hidden="true" focusable="false">' + art + '</svg>';
  }

  // Flavor radar (0–5 on each axis of FLAVOR_AXES).
  function radarSvg(beer) {
    const axes = D.FLAVOR_AXES, cx = 160, cy = 130, r = 88, n = axes.length;
    const pt = (i, v) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / n;
      return [cx + Math.cos(ang) * r * v / 5, cy + Math.sin(ang) * r * v / 5];
    };
    let rings = '';
    for (let lv = 1; lv <= 5; lv++) {
      rings += '<polygon points="' + axes.map((_, i) => pt(i, lv).map((x) => x.toFixed(1)).join(',')).join(' ') + '" fill="none" stroke="#241a13" stroke-opacity="' + (lv === 5 ? '.5' : '.15') + '" stroke-width="' + (lv === 5 ? 2 : 1) + '"/>';
    }
    const spokes = axes.map((_, i) => { const p = pt(i, 5); return '<path d="M' + cx + ' ' + cy + 'L' + p[0].toFixed(1) + ' ' + p[1].toFixed(1) + '" stroke="#241a13" stroke-opacity=".2"/>'; }).join('');
    const shape = axes.map((ax, i) => pt(i, Math.max(0.25, beer.flavor[ax.id] || 0)).map((x) => x.toFixed(1)).join(',')).join(' ');
    const dots = axes.map((ax, i) => { const p = pt(i, Math.max(0.25, beer.flavor[ax.id] || 0)); return '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="4.5" fill="#241a13"/>'; }).join('');
    const labels = axes.map((ax, i) => {
      const p = pt(i, 6.3);
      const anchor = Math.abs(p[0] - cx) < 4 ? 'middle' : p[0] > cx ? 'start' : 'end';
      return '<text x="' + p[0].toFixed(1) + '" y="' + (p[1] + 5).toFixed(1) + '" text-anchor="' + anchor + '" font-family="Golos Text, sans-serif" font-size="14" font-weight="700" fill="#241a13">' + ax.label + ' <tspan fill="#8a3418">' + (beer.flavor[ax.id] || 0) + '</tspan></text>';
    }).join('');
    const desc = axes.map((ax) => ax.label + ' ' + (beer.flavor[ax.id] || 0) + ' of 5').join(', ');
    return '<svg viewBox="0 0 320 270" class="h-auto w-full" role="img" aria-label="' + esc('Flavor profile of ' + beer.name + ': ' + desc) + '">' + rings + spokes +
      '<polygon points="' + shape + '" fill="' + beer.colors[1] + '" fill-opacity=".55" stroke="#241a13" stroke-width="3" stroke-linejoin="round"/>' + dots + labels + '</svg>';
  }

  // Icons per event type, viewBox 0 0 48 48.
  const EVENT_ICONS = {
    music: '<path d="M18 34V10l20-4v24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><circle cx="13" cy="34" r="6" fill="currentColor"/><circle cx="33" cy="30" r="6" fill="currentColor"/><path d="M18 16l20-4" stroke="currentColor" stroke-width="3.5"/>',
    trivia: '<path d="M8 8h32v24H22l-9 8v-8H8Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M19 16q0-5 5-5t5 4q0 3-5 5v2" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><circle cx="24" cy="27" r="2.2" fill="currentColor"/>',
    release: '<path d="M16 8h16v32H16Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M16 22h16v8H16Z" fill="currentColor"/><path d="M6 10l4 3M42 10l-4 3M4 24h5M44 24h-5M6 38l4-3M42 38l-4-3" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>',
    food: '<path d="M10 6v14q0 6 5 6v16M15 6v12M20 6v14q0 6-5 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/><path d="M28 10h12l-2 24h-8Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M29 18h10" stroke="currentColor" stroke-width="3"/><path d="M34 34v8M29 42h10" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/>',
    community: '<path d="M24 6 10 28h8L8 42h32L30 28h8Z" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linejoin="round"/><path d="M24 42v4" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/><circle cx="24" cy="24" r="3" fill="currentColor"/>'
  };
  const eventIcon = (type, cls) => '<svg viewBox="0 0 48 48" class="' + (cls || 'size-7') + '" aria-hidden="true" focusable="false">' + (hasOwn(EVENT_ICONS, type) ? EVENT_ICONS[type] : '') + '</svg>';

  // Static pages mark where a can goes with data-can="<beer id>" and prices with data-product-price.
  $$('[data-can]').forEach((el) => {
    const id = el.getAttribute('data-can');
    if (hasOwn(BEERS, id)) el.innerHTML = canSvg(BEERS[id], 'h-auto w-full', true);
  });
  $$('[data-product-price]').forEach((el) => {
    const id = el.getAttribute('data-product-price');
    if (hasOwn(PRODUCTS, id)) el.textContent = money(PRODUCTS[id].price);
  });

  /* ------------------------------------------------------------------
   * 5. Header, mobile menu, reveals, footer year
   * ------------------------------------------------------------------ */
  const header = $('#site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  const menuBtn = $('#menu-toggle'), menu = $('#mobile-menu');
  if (menuBtn && menu) {
    const setMenu = (open) => {
      if (open && header) menu.style.top = Math.max(0, header.getBoundingClientRect().bottom) + 'px';
      menu.hidden = !open;
      menuBtn.setAttribute('aria-expanded', String(open));
      $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
      $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
      document.body.classList.toggle('menu-is-open', open);
    };
    menuBtn.addEventListener('click', () => setMenu(menu.hidden));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); } });
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    window.matchMedia('(min-width: 1280px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  function initReveal() {
    const pending = $$('.reveal:not(.is-visible)');
    const show = (el) => el.classList.add('is-visible');
    if (reduceMotion || !('IntersectionObserver' in window)) { pending.forEach(show); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    pending.forEach((el, i) => { el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms'; io.observe(el); });
    // Reveal everything above the fold edge too, so fast jumps (End key, anchors) never leave content hidden.
    let queued = false;
    const revealAbove = () => {
      queued = false;
      const limit = window.innerHeight * 0.92;
      $$('.reveal:not(.is-visible)').forEach((el) => { if (el.getBoundingClientRect().top < limit) { show(el); io.unobserve(el); } });
    };
    window.addEventListener('scroll', () => { if (!queued) { queued = true; window.requestAnimationFrame(revealAbove); } }, { passive: true });
    if (window.location.hash) window.addEventListener('load', revealAbove);
  }

  $$('[data-year]').forEach((el) => { el.textContent = TODAY.slice(0, 4); });

  /* ------------------------------------------------------------------
   * 6. Status — open-now badges, today's hours, hours tables, holidays
   * ------------------------------------------------------------------ */
  function paintStatus() {
    const now = nowPacific();
    const s = taproomStatus(now);
    $$('[data-status]').forEach((el) => {
      el.setAttribute('data-state', s.state);
      const t = $('[data-status-text]', el);
      if (t) t.textContent = el.hasAttribute('data-status-short') ? s.short : s.text;
    });
    const info = dayInfo(now.key);
    $$('[data-today-hours]').forEach((el) => {
      const label = info.special ? info.special.name : DAY_LONG[now.day];
      el.textContent = info.open ? label + ' ' + range(info.open[0], info.open[1]) : label + ': closed';
    });
    $$('[data-hours-day]').forEach((tr) => {
      const isToday = +tr.getAttribute('data-hours-day') === now.day;
      tr.toggleAttribute('data-today', isToday);
      if (isToday) tr.setAttribute('aria-current', 'date'); else tr.removeAttribute('aria-current');
    });
  }
  // Fill hours tables from HOURS (so changing data.js changes every page).
  $$('[data-hours-table]').forEach((tbody) => {
    const order = [1, 2, 3, 4, 5, 6, 0];
    tbody.innerHTML = order.map((d) => {
      const h = D.HOURS[d];
      return '<tr data-hours-day="' + d + '"><th scope="row" class="py-2 pr-4 text-left font-semibold">' + DAY_LONG[d] + '</th><td class="py-2 text-right tabular-nums">' + (h ? range(toMin(h[0]), toMin(h[1])) : 'Closed') + '</td></tr>';
    }).join('');
  });
  // Upcoming holiday and special hours (taproom.html, visit.html).
  $$('[data-holidays]').forEach((list) => {
    const max = +list.getAttribute('data-holidays') || 5;
    const items = [];
    for (let i = 0; i < 400 && items.length < max; i++) {
      const key = addDays(TODAY, i), info = dayInfo(key);
      if (!info.special || !info.special.changed) continue;
      const hrs = info.open ? range(info.open[0], info.open[1]) : 'Closed';
      items.push('<li class="grid grid-cols-[1fr_auto] items-baseline gap-x-4 border-b-2 border-dashed border-ink/20 py-3"><span><span class="block font-bold">' + esc(info.special.name) + '</span><span class="text-sm text-muted">' + esc(info.special.note) + '</span></span><span class="text-right"><span class="block font-bold tabular-nums">' + hrs + '</span><span class="text-sm text-muted">' + shortDate(key) + ', ' + key.slice(0, 4) + '</span></span></li>');
    }
    list.innerHTML = items.join('');
  });
  paintStatus();

  /* ------------------------------------------------------------------
   * 7. Tap board and food trucks
   * ------------------------------------------------------------------ */
  const onTap = () => D.BEERS.filter((b) => b.tap).sort((a, b) => a.tap - b.tap);
  function pourFor(beer) { return beer.abv > D.STRONG_ABV ? D.POURS.half : D.POURS.pint; }
  // Demo keg level (percent) for a beer today: a stable start level that drains through opening hours.
  function kegLevel(beer, now) {
    const start = 30 + (hash('keg|' + beer.id + '|' + now.key) % 66);
    const h = dayInfo(now.key).open;
    const progress = h ? Math.min(1, Math.max(0, (now.mins - h[0]) / (h[1] - h[0]))) : 0;
    return Math.max(12, Math.round(start - progress * 18));
  }
  function boardHeading(now) {
    const s = taproomStatus(now);
    if (s.state !== 'closed') return 'On tap now';
    const n = nextOpening(now);
    return n ? 'Pouring ' + whenWord(n.offset, n.key) + ' from ' + clock(n.mins) : 'On the board';
  }
  function paintTapBoards() {
    const now = nowPacific();
    assignSeasonalTap(now);
    $$('[data-tapboard]').forEach((board) => {
      const limit = +board.getAttribute('data-tapboard') || 99;
      const list = $('[data-tap-list]', board), head = $('[data-tap-heading]', board), more = $('[data-tap-more]', board), time = $('[data-tap-time]', board);
      const taps = onTap();
      if (head) head.textContent = boardHeading(now);
      if (time) time.textContent = 'Updated ' + clock(now.mins) + ' PT';
      if (more) {
        const rest = taps.length - Math.min(limit, taps.length);
        more.hidden = rest <= 0;
        more.textContent = '+ ' + plural(rest, 'more tap') + ' on the full board';
      }
      list.innerHTML = taps.slice(0, limit).map((b) => {
        const lvl = kegLevel(b, now), pour = pourFor(b);
        const fresh = b.tapped !== null && b.tapped <= 3;
        return '<li class="tap-row">' +
          '<span class="tap-no" aria-hidden="true">' + String(b.tap).padStart(2, '0') + '</span>' +
          '<span class="min-w-0"><a href="beers.html?beer=' + b.id + '" class="tap-name">' + esc(b.name) + '</a>' +
          (fresh ? ' <span class="tap-fresh">Just tapped</span>' : '') +
          '<span class="block truncate text-sm text-cream/75"><span class="sr-only">Tap ' + b.tap + ', </span>' + esc(b.style) + ' · ' + b.abv.toFixed(1) + '% · ' + b.ibu + ' IBU</span>' +
          '<span class="keg" aria-hidden="true"><span class="keg-fill" style="width:' + lvl + '%;background:' + D.LIQUID[b.id] + '"></span></span></span>' +
          '<span class="text-right"><span class="block font-display text-xl text-ochre tabular-nums">' + money(pour.price) + '</span><span class="text-xs text-cream/75">' + pour.label + '</span></span>' +
          '</li>';
      }).join('');
    });
  }
  paintTapBoards();

  function truckOn(key) {
    if (!isOpenDay(key)) return null;
    const rota = D.TRUCK_ROTA[weekday(key)] || [];
    if (!rota.length) return null;
    const id = rota[isoWeek(key) % rota.length];
    return hasOwn(D.TRUCKS, id) ? Object.assign({ id: id }, D.TRUCKS[id]) : null;
  }
  function paintTrucks() {
    const now = nowPacific();
    $$('[data-truck-today]').forEach((el) => {
      let key = now.key, t = truckOn(key);
      const h = dayInfo(key).open;
      let when = 'Today';
      if (!t || (h && now.mins >= h[1])) {
        const n = nextOpening(now);
        if (n) { key = n.key; t = truckOn(key); when = n.offset === 1 ? 'Tomorrow' : DAY_LONG[weekday(key)]; }
      }
      const name = $('[data-truck-name]', el), food = $('[data-truck-food]', el), whenEl = $('[data-truck-when]', el);
      if (name) name.textContent = t ? t.name : 'Taproom snacks';
      if (food) food.textContent = t ? t.food : 'Pretzels, pickles and smoked almonds at the bar';
      if (whenEl) whenEl.textContent = el.hasAttribute('data-truck-lower') ? when.toLowerCase() : when;
    });
    $$('[data-truck-week]').forEach((list) => {
      const rows = [];
      for (let i = 0; i < 7; i++) {
        const key = addDays(now.key, i), t = truckOn(key), info = dayInfo(key);
        const day = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : DAY_LONG[weekday(key)];
        rows.push('<li class="truck-row' + (i === 0 ? ' is-today' : '') + '"><span class="w-28 shrink-0"><span class="block font-bold">' + day + '</span><span class="text-sm text-muted">' + shortDate(key) + '</span></span>' +
          (t ? '<span class="min-w-0 flex-1"><span class="block font-bold">' + esc(t.name) + '</span><span class="text-sm text-muted">' + esc(t.food) + (t.veg ? ' · vegetarian options' : '') + '</span></span><span class="hidden text-right text-sm tabular-nums sm:block">' + range(info.open[0], Math.max(info.open[0] + 60, info.open[1] - 60)) + '</span>'
            : '<span class="flex-1 text-muted">' + (info.special ? esc(info.special.name) + ': taproom closed' : 'Taproom closed') + '</span>') +
          '</li>');
      }
      list.innerHTML = rows.join('');
    });
  }
  paintTrucks();
  window.setInterval(() => { paintStatus(); paintTapBoards(); paintTrucks(); }, 60000);

  /* ------------------------------------------------------------------
   * 8. Taproom — pour menu, snacks, flight builder
   * ------------------------------------------------------------------ */
  $$('[data-pour-menu]').forEach((list) => {
    list.innerHTML = onTap().map((b) => {
      const strong = b.abv > D.STRONG_ABV;
      return '<li class="menu-row"><span class="min-w-0"><span class="font-bold">' + esc(b.name) + '</span> <span class="text-sm text-muted">' + esc(b.style) + ', ' + b.abv.toFixed(1) + '%</span></span><span class="menu-dots" aria-hidden="true"></span><span class="shrink-0 tabular-nums">' +
        (strong ? '<span class="sr-only">' + D.POURS.half.label + ' only, </span>' + money(D.POURS.half.price) + '<span aria-hidden="true"> (10 oz)</span>' : '<span class="sr-only">' + D.POURS.pint.label + ' </span>' + money(D.POURS.pint.price) + ' / <span class="sr-only">' + D.POURS.half.label + ' </span>' + money(D.POURS.half.price)) + '</span></li>';
    }).join('');
  });
  $$('[data-snacks]').forEach((list) => {
    list.innerHTML = D.SNACKS.map((s) => '<li class="menu-row"><span class="min-w-0"><span class="font-bold">' + esc(s.name) + '</span><span class="block text-sm text-muted">' + esc(s.desc) + '</span></span><span class="menu-dots" aria-hidden="true"></span><span class="shrink-0 tabular-nums">' + money(s.price) + '</span></li>').join('');
  });
  $$('[data-pour-price]').forEach((el) => {
    const k = el.getAttribute('data-pour-price');
    if (hasOwn(D.POURS, k)) el.textContent = money(D.POURS[k].price);
  });

  const flight = $('[data-flight]');
  if (flight) {
    const taps = onTap();
    const picks = [taps[5] || taps[0], taps[0], taps[8] || taps[1], taps[9] || taps[2]].map((b) => b.id);
    const selects = $$('[data-flight-slot]', flight);
    const paddle = $('[data-flight-paddle]', flight), summary = $('[data-flight-summary]', flight);
    selects.forEach((sel, i) => {
      sel.innerHTML = taps.map((b) => '<option value="' + b.id + '">' + esc(b.name) + ' (' + b.abv.toFixed(1) + '%)</option>').join('');
      sel.value = picks[i];
    });
    const draw = () => {
      const chosen = selects.map((s) => (hasOwn(BEERS, s.value) ? BEERS[s.value] : taps[0]));
      let glasses = '';
      chosen.forEach((b, i) => {
        const x = 30 + i * 70;
        glasses += '<path d="M' + (x + 4) + ' 30h40l-5 62h-30Z" fill="' + D.LIQUID[b.id] + '" stroke="#241a13" stroke-width="3" stroke-linejoin="round"/>' +
          '<path d="M' + (x + 4) + ' 30h40l-1 10h-38Z" fill="#fbf5e8" stroke="#241a13" stroke-width="3" stroke-linejoin="round"/>' +
          '<text x="' + (x + 24) + '" y="118" text-anchor="middle" font-family="Golos Text, sans-serif" font-size="12" font-weight="700" fill="#241a13">' + (i + 1) + '</text>';
      });
      paddle.innerHTML = '<rect x="10" y="88" width="300" height="16" rx="8" fill="#b4451f" stroke="#241a13" stroke-width="3"/><rect x="300" y="91" width="24" height="10" rx="4" fill="#b4451f" stroke="#241a13" stroke-width="3"/>' + glasses;
      const abv = chosen.reduce((s, b) => s + b.abv, 0) / chosen.length;
      const ibu = Math.round(chosen.reduce((s, b) => s + b.ibu, 0) / chosen.length);
      const order = chosen.slice().sort((a, b) => a.flavor.bitter + a.flavor.roast + a.abv / 3 - (b.flavor.bitter + b.flavor.roast + b.abv / 3));
      summary.innerHTML = '<p><span class="font-bold">' + money(D.POURS.flight.price) + '</span> for four 4 oz pours · average ' + abv.toFixed(1) + '% ABV, ' + ibu + ' IBU</p>' +
        '<p class="mt-1 text-muted">Drink them light to bold: ' + order.map((b) => esc(b.name)).join(' → ') + '.</p>' +
        (new Set(chosen.map((b) => b.id)).size < 4 ? '<p class="mt-1 font-semibold text-rust">You have picked the same beer twice. That’s allowed; we won’t judge.</p>' : '');
    };
    selects.forEach((s) => s.addEventListener('change', draw));
    draw();
  }

  /* ------------------------------------------------------------------
   * 9. Beers — filters (?style= ?strength= ?tap=1), cards, map, dialog (?beer=)
   * ------------------------------------------------------------------ */
  function strengthOf(b) {
    return Object.keys(D.STRENGTHS).find((k) => b.abv >= D.STRENGTHS[k].min && b.abv <= D.STRENGTHS[k].max) || 'standard';
  }
  const beersRoot = $('[data-beers]');
  const dialog = $('#beer-dialog');
  function openBeer(id, push) {
    if (!dialog || !hasOwn(BEERS, id)) return;
    const b = BEERS[id];
    const product = D.PRODUCTS.find((p) => p.beer === b.id);
    $('[data-dialog-body]', dialog).innerHTML =
      '<div class="grid gap-6 sm:grid-cols-[9rem_1fr]">' +
        '<div class="mx-auto w-28 sm:w-36">' + canSvg(b, 'h-auto w-full', true) + '</div>' +
        '<div class="min-w-0">' +
          '<p class="eyebrow">' + esc(b.style) + '</p>' +
          '<h2 id="beer-dialog-title" class="mt-2 font-display text-4xl leading-none">' + esc(b.name) + '</h2>' +
          '<dl class="mt-4 grid grid-cols-3 gap-2 text-center">' +
            '<div class="stat"><dt>ABV</dt><dd>' + b.abv.toFixed(1) + '%</dd></div>' +
            '<div class="stat"><dt>IBU</dt><dd>' + b.ibu + '</dd></div>' +
            '<div class="stat"><dt>Tap</dt><dd>' + (b.tap ? '#' + b.tap : '—') + '</dd></div>' +
          '</dl>' +
          '<p class="mt-4 leading-relaxed">' + esc(b.notes) + '</p>' +
        '</div>' +
      '</div>' +
      '<div class="mt-6 grid items-center gap-6 md:grid-cols-[1fr_1.1fr]">' +
        '<div class="rounded-md border-2 border-ink bg-cream p-2">' + radarSvg(b) + '</div>' +
        '<dl class="space-y-3 text-sm">' +
          '<div><dt class="font-bold uppercase tracking-wider text-muted">Hops</dt><dd class="mt-0.5 text-base">' + esc(b.hops) + '</dd></div>' +
          '<div><dt class="font-bold uppercase tracking-wider text-muted">Try it with</dt><dd class="mt-0.5 text-base">' + esc(b.pairing) + '</dd></div>' +
          '<div><dt class="font-bold uppercase tracking-wider text-muted">Where to find it</dt><dd class="mt-0.5 text-base">' +
            (b.tap ? 'On tap ' + b.tap + ' at the taproom, ' + money(pourFor(b).price) + ' a ' + pourFor(b).label + ' pour.' : nextOnTap(b.id) ? 'Back on tap ' + longDate(nextOnTap(b.id).key) + ' at ' + clock(nextOnTap(b.id).mins) + '.' : 'Not pouring right now.') +
            (product ? ' ' + esc(product.pack) + ' to go, ' + money(product.price) + '.' : '') + '</dd></div>' +
          (product ? '<div><a class="btn-ochre btn-sm" href="shop.html?add=' + product.id + '">Add a ' + esc(product.pack.split(' · ')[0]) + ' to your order</a></div>' : '') +
        '</dl>' +
      '</div>';
    if (!dialog.open) dialog.showModal();
    if (push) { const url = new URL(window.location.href); url.searchParams.set('beer', id); window.history.replaceState(null, '', url); }
  }
  if (dialog) {
    const closeDialog = () => {
      dialog.close();
    };
    $('[data-dialog-close]', dialog).addEventListener('click', closeDialog);
    dialog.addEventListener('click', (e) => { if (e.target === dialog) closeDialog(); });
    dialog.addEventListener('close', () => {
      const url = new URL(window.location.href);
      if (url.searchParams.has('beer')) { url.searchParams.delete('beer'); window.history.replaceState(null, '', url); }
    });
  }

  if (beersRoot) {
    const grid = $('[data-beer-grid]', beersRoot), count = $('[data-beer-count]', beersRoot), empty = $('[data-beer-empty]', beersRoot), map = $('[data-beer-map]');
    const state = { style: 'all', strength: 'all', tap: false };
    if (hasOwn(D.STYLE_GROUPS, params.get('style'))) state.style = params.get('style');
    if (hasOwn(D.STRENGTHS, params.get('strength'))) state.strength = params.get('strength');
    state.tap = params.get('tap') === '1';

    grid.innerHTML = D.BEERS.map((b, i) => {
      const product = D.PRODUCTS.find((p) => p.beer === b.id);
      return '<li class="beer-card reveal" data-beer-id="' + b.id + '">' +
        '<span class="beer-num" aria-hidden="true">' + (i + 1) + '</span>' +
        '<div class="flex items-end gap-4">' +
          '<div class="w-20 shrink-0 sm:w-24">' + canSvg(b, 'h-auto w-full', true) + '</div>' +
          '<div class="min-w-0 pb-1">' +
            '<p class="text-xs font-bold uppercase tracking-[0.14em] text-rust">' + esc(D.STYLE_GROUPS[b.group]) + '</p>' +
            '<h3 class="mt-1 font-display text-2xl leading-tight">' + esc(b.name) + '</h3>' +
            '<p class="text-sm font-semibold text-muted">' + esc(b.style) + '</p>' +
          '</div>' +
        '</div>' +
        '<p class="mt-4 flex-1 leading-relaxed">' + esc(b.tagline) + '</p>' +
        '<dl class="mt-4 flex flex-wrap gap-2 text-sm"><div class="pill"><dt class="sr-only">Strength</dt><dd>' + b.abv.toFixed(1) + '% ABV</dd></div><div class="pill"><dt class="sr-only">Bitterness</dt><dd>' + b.ibu + ' IBU</dd></div>' +
          (b.tap ? '<div class="pill pill-pine"><dt class="sr-only">Availability</dt><dd>On tap ' + b.tap + '</dd></div>' : '') +
          (product ? '<div class="pill pill-ochre"><dt class="sr-only">To go</dt><dd>' + (product.units === 1 ? 'Bottles' : 'Cans') + ' to go</dd></div>' : '') + '</dl>' +
        '<button type="button" class="btn-line btn-sm mt-5 self-start" data-open-beer="' + b.id + '">Tasting notes &amp; flavor chart</button>' +
      '</li>';
    }).join('');

    const chips = $$('[data-filter-style]'), schips = $$('[data-filter-strength]'), tapToggle = $('[data-filter-tap]');
    const matches = (b, st) => (st.style === 'all' || b.group === st.style) && (st.strength === 'all' || strengthOf(b) === st.strength) && (!st.tap || !!b.tap);
    chips.forEach((c) => {
      const id = c.getAttribute('data-filter-style');
      const n = D.BEERS.filter((b) => id === 'all' || b.group === id).length;
      const badge = $('.chip-count', c); if (badge) badge.textContent = n;
    });
    schips.forEach((c) => {
      const id = c.getAttribute('data-filter-strength');
      const n = D.BEERS.filter((b) => id === 'all' || strengthOf(b) === id).length;
      const badge = $('.chip-count', c); if (badge) badge.textContent = n;
    });

    const drawMap = (shown) => {
      if (!map) return;
      const W = 640, H = 340, L = 54, R = 20, T = 20, B = 50;
      const x = (abv) => L + ((abv - 4) / 8) * (W - L - R);
      const y = (ibu) => T + (1 - ibu / 100) * (H - T - B);
      let g = '';
      for (let a = 4; a <= 12; a += 2) g += '<path d="M' + x(a) + ' ' + T + 'V' + (H - B) + '" stroke="#241a13" stroke-opacity=".12"/><text x="' + x(a) + '" y="' + (H - B + 22) + '" text-anchor="middle" font-size="13" fill="#5f4c3a">' + a + '%</text>';
      for (let i = 0; i <= 100; i += 25) g += '<path d="M' + L + ' ' + y(i) + 'H' + (W - R) + '" stroke="#241a13" stroke-opacity=".12"/><text x="' + (L - 10) + '" y="' + (y(i) + 4) + '" text-anchor="end" font-size="13" fill="#5f4c3a">' + i + '</text>';
      g += '<text x="' + ((W + L) / 2) + '" y="' + (H - 8) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#241a13">Alcohol by volume (ABV)</text>';
      g += '<text transform="translate(16 ' + ((H - B + T) / 2) + ') rotate(-90)" text-anchor="middle" font-size="13" font-weight="700" fill="#241a13">Bitterness (IBU)</text>';
      const COLORS = { hoppy: '#e0a133', crisp: '#f6efe0', dark: '#3a2b20', wild: '#b4451f' };
      const TEXT = { hoppy: '#241a13', crisp: '#241a13', dark: '#fbf5e8', wild: '#fbf5e8' };
      const dots = D.BEERS.map((b, i) => {
        const on = shown.indexOf(b.id) !== -1;
        return '<g opacity="' + (on ? 1 : 0.18) + '"><circle cx="' + x(b.abv).toFixed(1) + '" cy="' + y(b.ibu).toFixed(1) + '" r="13" fill="' + COLORS[b.group] + '" stroke="#241a13" stroke-width="2.5"/><text x="' + x(b.abv).toFixed(1) + '" y="' + (y(b.ibu) + 4.5).toFixed(1) + '" text-anchor="middle" font-size="12.5" font-weight="800" fill="' + TEXT[b.group] + '">' + (i + 1) + '</text></g>';
      }).join('');
      map.innerHTML = '<g font-family="Golos Text, sans-serif">' + g + dots + '</g>';
    };

    const apply = (push) => {
      const shown = [];
      $$('[data-beer-id]', grid).forEach((li) => {
        const b = BEERS[li.getAttribute('data-beer-id')];
        const on = matches(b, state);
        li.hidden = !on;
        if (on) shown.push(b.id);
      });
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.getAttribute('data-filter-style') === state.style)));
      schips.forEach((c) => c.setAttribute('aria-pressed', String(c.getAttribute('data-filter-strength') === state.strength)));
      if (tapToggle) tapToggle.setAttribute('aria-pressed', String(state.tap));
      count.textContent = 'Showing ' + plural(shown.length, 'beer') + ' of ' + D.BEERS.length;
      empty.hidden = shown.length > 0;
      drawMap(shown);
      if (push) {
        const url = new URL(window.location.href);
        ['style', 'strength'].forEach((k) => { if (state[k] === 'all') url.searchParams.delete(k); else url.searchParams.set(k, state[k]); });
        if (state.tap) url.searchParams.set('tap', '1'); else url.searchParams.delete('tap');
        window.history.replaceState(null, '', url);
      }
    };
    chips.forEach((c) => c.addEventListener('click', () => { state.style = c.getAttribute('data-filter-style'); apply(true); }));
    schips.forEach((c) => c.addEventListener('click', () => { state.strength = c.getAttribute('data-filter-strength'); apply(true); }));
    if (tapToggle) tapToggle.addEventListener('click', () => { state.tap = !state.tap; apply(true); });
    $$('[data-filter-reset]').forEach((btn) => btn.addEventListener('click', () => { state.style = 'all'; state.strength = 'all'; state.tap = false; apply(true); }));
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-open-beer]');
      if (btn) openBeer(btn.getAttribute('data-open-beer'), true);
    });
    apply(false);
    if (hasOwn(BEERS, params.get('beer'))) openBeer(params.get('beer'), false);
  }

  /* ------------------------------------------------------------------
   * 10. Events — program in date order, filter (?type=), next-up card
   * ------------------------------------------------------------------ */
  function eventInfo(e) {
    const start = toMin(e.start), end = toMin(e.end);
    return { start: start, end: end, startStamp: stamp(e.date, start), endStamp: stamp(e.date, end), time: range(start, end) };
  }
  // Seats still free at a ticketed event (stable per event; never fewer than a quarter).
  function seatsLeft(e) {
    if (!e.seats) return null;
    const taken = hash('seats|' + e.id + '|' + e.date) % Math.ceil(e.seats * 0.7);
    return e.seats - taken;
  }
  function upcomingEvents() {
    const now = nowPacific(), t = stamp(now.key, now.mins);
    return D.EVENTS
      .filter((e) => {
        // Hide events that have ended, fall on a closed day or would start after closing (holiday hours).
        const h = dayInfo(e.date).open;
        return eventInfo(e).endStamp > t && !!h && toMin(e.start) < h[1] && (!EVENTS_UNTIL || e.date <= EVENTS_UNTIL);
      })
      .sort((a, b) => eventInfo(a).startStamp - eventInfo(b).startStamp);
  }
  function relDay(key) {
    const n = daysBetween(TODAY, key);
    if (n === 0) return 'Today';
    if (n === 1) return 'Tomorrow';
    if (n < 7) return 'This ' + DAY_LONG[weekday(key)];
    return 'In ' + plural(Math.round(n / 7) || 1, 'week');
  }
  function eventPrice(e) {
    if (!e.price) return 'Free';
    const left = seatsLeft(e);
    return money(e.price) + ' · ' + plural(left, 'seat') + ' left';
  }
  function eventCard(e, compact) {
    const d = dateOfKey(e.date), info = eventInfo(e);
    const beer = e.beer && hasOwn(BEERS, e.beer) ? BEERS[e.beer] : null;
    return '<li class="event-card reveal" data-event-type="' + e.type + '">' +
      '<div class="date-block" aria-hidden="true"><span class="text-xs font-bold uppercase tracking-widest">' + DAY[d.getUTCDay()] + '</span><span class="font-display text-4xl leading-none">' + d.getUTCDate() + '</span><span class="text-xs font-bold uppercase tracking-widest">' + MONTH[d.getUTCMonth()] + '</span></div>' +
      '<div class="min-w-0 flex-1">' +
        '<p class="flex flex-wrap items-center gap-2 text-sm"><span class="type-tag type-' + e.type + '">' + eventIcon(e.type, 'size-4') + esc(D.EVENT_TYPES[e.type]) + '</span><span class="font-semibold text-muted">' + relDay(e.date) + '</span></p>' +
        '<h3 class="mt-2 font-display text-2xl leading-tight">' + esc(e.title) + '</h3>' +
        '<p class="mt-1 text-sm font-semibold"><span class="sr-only">When: </span>' + longDate(e.date) + ' · ' + info.time + '</p>' +
        (compact ? '' : '<p class="mt-2 leading-relaxed text-muted">' + esc(e.blurb) + '</p>') +
        '<p class="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm"><span class="font-bold">' + eventPrice(e) + '</span>' +
          (beer && !compact ? '<a class="text-link" href="beers.html?beer=' + beer.id + '">About ' + esc(beer.name) + '</a>' : '') +
          (e.price && !compact ? '<a class="text-link" href="tel:' + esc(BREW.eventsPhoneHref) + '">Reserve: ' + esc(BREW.eventsPhone) + '</a>' : '') +
        '</p>' +
      '</div>' +
      (beer && !compact ? '<div class="hidden w-16 shrink-0 sm:block">' + canSvg(beer, 'h-auto w-full', true) + '</div>' : '') +
    '</li>';
  }

  const eventsRoot = $('[data-events]');
  if (eventsRoot) {
    const list = $('[data-event-list]', eventsRoot), count = $('[data-event-count]', eventsRoot), chips = $$('[data-filter-type]', eventsRoot);
    const all = upcomingEvents();
    let type = hasOwn(D.EVENT_TYPES, params.get('type')) ? params.get('type') : 'all';
    chips.forEach((c) => {
      const id = c.getAttribute('data-filter-type');
      const badge = $('.chip-count', c);
      if (badge) badge.textContent = all.filter((e) => id === 'all' || e.type === id).length;
    });
    const render = (push) => {
      const shown = all.filter((e) => type === 'all' || e.type === type);
      let html = '', month = '';
      shown.forEach((e) => {
        const d = dateOfKey(e.date), m = MONTH_LONG[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
        if (m !== month) { month = m; html += '<li class="month-head"><h2 class="font-display text-3xl">' + m + '</h2></li>'; }
        html += eventCard(e, false);
      });
      list.innerHTML = html || '<li class="rounded-md border-2 border-dashed border-ink/40 p-8 text-center">Nothing of this kind on the calendar yet. <button type="button" class="text-link" data-type-reset>See every event</button></li>';
      count.textContent = plural(shown.length, 'event') + ' coming up';
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.getAttribute('data-filter-type') === type)));
      if (push) { const url = new URL(window.location.href); if (type === 'all') url.searchParams.delete('type'); else url.searchParams.set('type', type); window.history.replaceState(null, '', url); }
      initReveal();
    };
    chips.forEach((c) => c.addEventListener('click', () => { type = c.getAttribute('data-filter-type'); render(true); }));
    list.addEventListener('click', (e) => { if (e.target.closest('[data-type-reset]')) { type = 'all'; render(true); } });
    render(false);

    // Next-up card
    const next = $('[data-event-next]');
    if (next && all[0]) {
      const e = all[0], info = eventInfo(e), now = nowPacific();
      const mins = info.startStamp - stamp(now.key, now.mins);
      const when = mins <= 0 ? 'Happening now' : mins < 60 ? 'Starts in ' + plural(mins, 'minute') : mins < 1440 ? 'Starts in ' + plural(Math.round(mins / 60), 'hour') : 'Starts in ' + plural(Math.ceil(mins / 1440), 'day');
      $('[data-next-when]', next).textContent = when;
      $('[data-next-title]', next).textContent = e.title;
      $('[data-next-date]', next).textContent = longDate(e.date) + ' · ' + info.time;
      $('[data-next-blurb]', next).textContent = e.blurb;
      $('[data-next-icon]', next).innerHTML = eventIcon(e.type, 'size-10');
    }
  }
  $$('[data-events-next]').forEach((list) => {
    const n = +list.getAttribute('data-events-next') || 3;
    list.innerHTML = upcomingEvents().slice(0, n).map((e) => eventCard(e, true)).join('');
  });
  // Weekly trivia day and the next release, for copy on other pages.
  $$('[data-next-release]').forEach((el) => {
    const e = upcomingEvents().find((x) => x.type === 'release');
    if (e) el.textContent = e.title + ', ' + shortDate(e.date);
  });

  /* ------------------------------------------------------------------
   * 11. Cart — saved in cinderjack-cart, validated on every read
   * ------------------------------------------------------------------ */
  function optionValues(p) {
    if (!p.option) return null;
    if (p.option.from === 'tap') return onTap().map((b) => b.id);
    return p.option.values;
  }
  function optionLabel(p, opt) {
    if (!p.option || !opt) return '';
    if (p.option.from === 'tap') return hasOwn(BEERS, opt) ? BEERS[opt].name : '';
    return opt;
  }
  const Cart = {
    get() {
      const raw = store.get(STORE_CART);
      const lines = [];
      if (raw && typeof raw === 'object' && Array.isArray(raw.lines)) {
        raw.lines.forEach((l) => {
          if (!l || !hasOwn(PRODUCTS, l.id)) return;
          const p = PRODUCTS[l.id], opts = optionValues(p);
          const opt = opts ? (opts.indexOf(l.opt) !== -1 ? l.opt : null) : null;
          if (opts && !opt) return;
          const qty = Math.min(p.limit, Math.max(1, Math.floor(+l.qty) || 1));
          const same = lines.find((x) => x.id === l.id && x.opt === opt);
          if (same) same.qty = Math.min(p.limit, same.qty + qty); else lines.push({ id: l.id, opt: opt, qty: qty });
        });
      }
      return { lines: lines.slice(0, 30) };
    },
    save(cart) { store.set(STORE_CART, { lines: cart.lines }); paintCart(); },
    add(id, opt, qty) {
      if (!hasOwn(PRODUCTS, id)) return false;
      const p = PRODUCTS[id], cart = this.get();
      const line = cart.lines.find((x) => x.id === id && x.opt === (opt || null));
      if (line) {
        if (line.qty >= p.limit) return false;
        line.qty = Math.min(p.limit, line.qty + (qty || 1));
      } else cart.lines.push({ id: id, opt: opt || null, qty: Math.min(p.limit, qty || 1) });
      this.save(cart);
      return true;
    },
    setQty(index, qty) {
      const cart = this.get();
      if (!cart.lines[index]) return;
      if (qty <= 0) cart.lines.splice(index, 1); else cart.lines[index].qty = Math.min(PRODUCTS[cart.lines[index].id].limit, qty);
      this.save(cart);
    },
    clear() { store.remove(STORE_CART); paintCart(); }
  };
  function totals(cart) {
    let subtotal = 0, units = 0, count = 0, hasBeer = false;
    cart.lines.forEach((l) => {
      const p = PRODUCTS[l.id];
      subtotal += p.price * l.qty;
      units += (p.units || 0) * l.qty;
      count += l.qty;
      if (p.kind === 'beer') hasBeer = true;
    });
    const deposit = Math.round(units * D.DEPOSIT * 100) / 100;
    return { subtotal: subtotal, deposit: deposit, total: subtotal + deposit, count: count, units: units, hasBeer: hasBeer };
  }

  let toastTimer = null;
  function toast(html) {
    const el = $('#toast');
    if (!el) return;
    $('[data-toast-text]', el).innerHTML = html;
    el.hidden = false;
    window.requestAnimationFrame(() => el.classList.add('is-shown'));
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => { el.classList.remove('is-shown'); window.setTimeout(() => { el.hidden = true; }, 250); }, 4200);
  }

  function lineHtml(l, i, editable) {
    const p = PRODUCTS[l.id];
    const opt = optionLabel(p, l.opt);
    return '<li class="flex gap-3 py-3">' +
      '<div class="h-16 w-12 shrink-0">' + productArt(p, 'h-full w-full') + '</div>' +
      '<div class="min-w-0 flex-1"><p class="font-bold leading-tight">' + esc(p.name) + '</p><p class="text-sm text-muted">' + esc(p.pack) + (opt ? ' · ' + esc(p.option.label) + ': ' + esc(opt) : '') + '</p>' +
        (editable ? '<div class="mt-2 flex items-center gap-2"><button type="button" class="qty-btn" data-qty="' + i + '" data-step="-1" aria-label="One fewer ' + esc(p.name) + '">−</button><span class="w-6 text-center font-bold tabular-nums" aria-live="polite">' + l.qty + '</span><button type="button" class="qty-btn" data-qty="' + i + '" data-step="1" aria-label="One more ' + esc(p.name) + '"' + (l.qty >= p.limit ? ' disabled' : '') + '>+</button><button type="button" class="ml-2 text-sm font-semibold text-rust underline underline-offset-4" data-remove="' + i + '">Remove<span class="sr-only"> ' + esc(p.name) + '</span></button></div>'
          : '<p class="text-sm">Qty ' + l.qty + '</p>') +
      '</div>' +
      '<p class="font-bold tabular-nums">' + money(p.price * l.qty) + '</p>' +
    '</li>';
  }
  function totalsHtml(t) {
    return '<dl class="space-y-1.5 text-sm">' +
      '<div class="flex justify-between"><dt>Subtotal</dt><dd class="tabular-nums">' + money(t.subtotal) + '</dd></div>' +
      (t.units ? '<div class="flex justify-between"><dt>Oregon bottle deposit (' + plural(t.units, 'container') + ')</dt><dd class="tabular-nums">' + money(t.deposit) + '</dd></div>' : '') +
      '<div class="flex justify-between"><dt>Sales tax</dt><dd>None in Oregon</dd></div>' +
      '<div class="flex justify-between border-t-2 border-ink pt-2 text-lg font-bold"><dt>Pay at pickup</dt><dd class="tabular-nums">' + money(t.total) + '</dd></div>' +
    '</dl>';
  }
  function paintCart() {
    const cart = Cart.get(), t = totals(cart);
    $$('[data-cart-count]').forEach((el) => { el.textContent = t.count; el.hidden = t.count === 0; });
    $$('[data-cart-link]').forEach((a) => a.setAttribute('aria-label', 'Your order, ' + plural(t.count, 'item')));
    $$('[data-cart-panel]').forEach((panel) => {
      const body = $('[data-cart-body]', panel), foot = $('[data-cart-foot]', panel);
      if (!cart.lines.length) {
        body.innerHTML = '<p class="py-6 text-center text-muted">Your order is empty. Pick a 4-pack or two and we’ll have them cold and bagged for pickup.</p>';
        foot.hidden = true;
        return;
      }
      body.innerHTML = '<ul class="divide-y-2 divide-dashed divide-ink/15">' + cart.lines.map((l, i) => lineHtml(l, i, true)).join('') + '</ul>';
      foot.hidden = false;
      $('[data-cart-totals]', foot).innerHTML = totalsHtml(t);
    });
  }
  document.addEventListener('click', (e) => {
    const q = e.target.closest('[data-qty]');
    if (q) {
      const i = +q.getAttribute('data-qty'), line = Cart.get().lines[i];
      if (line) Cart.setQty(i, line.qty + +q.getAttribute('data-step'));
      return;
    }
    const r = e.target.closest('[data-remove]');
    if (r) { Cart.setQty(+r.getAttribute('data-remove'), 0); return; }
  });

  const shop = $('[data-shop]');
  if (shop) {
    const grid = $('[data-product-grid]', shop), tabs = $$('[data-shop-tab]', shop);
    grid.innerHTML = D.PRODUCTS.map((p) => {
      const beer = p.beer && hasOwn(BEERS, p.beer) ? BEERS[p.beer] : null;
      const opts = optionValues(p);
      const optHtml = opts ? '<label class="mt-3 block"><span class="label">' + esc(p.option.label) + '</span><select class="field field-sm" data-opt-for="' + p.id + '">' + opts.map((v) => '<option value="' + esc(v) + '">' + esc(optionLabel(p, v)) + (p.option.from === 'tap' ? ' (' + BEERS[v].abv.toFixed(1) + '%)' : '') + '</option>').join('') + '</select></label>' : '';
      return '<li class="product-card reveal" data-kind="' + p.kind + '" id="p-' + p.id + '">' +
        '<div class="product-art">' + productArt(p, 'h-full w-auto') + '</div>' +
        '<div class="flex flex-1 flex-col p-5">' +
          '<div class="flex items-start justify-between gap-3"><h3 class="font-display text-xl leading-tight">' + esc(p.name) + '</h3><p class="font-display text-xl text-rust tabular-nums">' + money(p.price) + '</p></div>' +
          '<p class="mt-1 text-sm font-semibold text-muted">' + esc(p.pack) + '</p>' +
          (beer ? '<p class="mt-2 text-sm">' + esc(beer.style) + ' · ' + beer.abv.toFixed(1) + '% · <a class="text-link" href="beers.html?beer=' + beer.id + '">Tasting notes</a></p>' : '') +
          optHtml +
          '<p class="mt-2 text-xs text-muted">Limit ' + p.limit + ' per order' + (p.kind === 'beer' ? ' · 21+ with ID at pickup' : '') + '</p>' +
          '<div class="mt-auto pt-4"><button type="button" class="btn-ink btn-sm w-full" data-add="' + p.id + '">Add to order<span class="sr-only">: ' + esc(p.name) + '</span></button></div>' +
        '</div>' +
      '</li>';
    }).join('');
    let tab = 'all';
    const applyTab = () => {
      $$('[data-kind]', grid).forEach((li) => { li.hidden = tab !== 'all' && li.getAttribute('data-kind') !== tab; });
      tabs.forEach((t) => t.setAttribute('aria-pressed', String(t.getAttribute('data-shop-tab') === tab)));
    };
    tabs.forEach((t) => t.addEventListener('click', () => { tab = t.getAttribute('data-shop-tab'); applyTab(); }));
    applyTab();
    grid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-add]');
      if (!btn) return;
      const id = btn.getAttribute('data-add'), p = PRODUCTS[id];
      const sel = $('[data-opt-for="' + id + '"]', grid);
      const ok = Cart.add(id, sel ? sel.value : null, 1);
      if (ok) toast('<strong>' + esc(p.name) + (sel ? ' (' + esc(optionLabel(p, sel.value)) + ')' : '') + '</strong> added to your order. <a href="checkout.html" class="font-bold underline underline-offset-4">Choose a pickup time</a>');
      else toast('That’s the limit of ' + p.limit + ' for <strong>' + esc(p.name) + '</strong> per order.');
    });
    // ?add=<product id> (from the beer dialog) adds one and scrolls to it.
    const add = params.get('add');
    if (hasOwn(PRODUCTS, add) && !PRODUCTS[add].option) {
      Cart.add(add, null, 1);
      toast('<strong>' + esc(PRODUCTS[add].name) + '</strong> added to your order.');
      const url = new URL(window.location.href); url.searchParams.delete('add'); window.history.replaceState(null, '', url);
      const card = document.getElementById('p-' + add);
      if (card) card.scrollIntoView({ block: 'center' });
    }
  }
  paintCart();

  /* ------------------------------------------------------------------
   * 12. Checkout — pickup day and slot, 21+ confirmation
   * ------------------------------------------------------------------ */
  // Pickup slots for a date: [{ time (minutes), full }], empty when closed.
  function pickupSlots(key, now) {
    const h = dayInfo(key).open;
    if (!h) return [];
    const out = [];
    for (let m = h[0] + D.PICKUP.slotMinutes; m <= h[1] - 30; m += D.PICKUP.slotMinutes) {
      const tooSoon = key === now.key && m < now.mins + D.PICKUP.leadMinutes;
      if (tooSoon) continue;
      out.push({ time: m, full: hash('pickup|' + key + '|' + m) % 100 < D.PICKUP.slotsFull });
    }
    return out;
  }
  function pickupDays(now) {
    const days = [];
    for (let i = 0; i < D.PICKUP.days + 7 && days.length < D.PICKUP.days; i++) {
      const key = addDays(now.key, i);
      const slots = pickupSlots(key, now);
      if (slots.some((s) => !s.full)) days.push({ key: key, slots: slots, offset: i });
    }
    return days;
  }

  const checkout = $('[data-checkout]');
  if (checkout) {
    const form = $('form', checkout), empty = $('[data-checkout-empty]'), done = $('[data-checkout-done]'), summary = $('[data-checkout-summary]');
    const dayList = $('[data-pickup-days]', form), slotList = $('[data-pickup-slots]', form), ageBox = $('[data-age-box]', form);
    const now = nowPacific();
    const days = pickupDays(now);
    const pick = { day: days.length ? days[0].key : null, time: null };

    const drawSummary = () => {
      const cart = Cart.get(), t = totals(cart);
      summary.innerHTML = '<ul class="divide-y-2 divide-dashed divide-ink/15">' + cart.lines.map((l, i) => lineHtml(l, i, true)).join('') + '</ul><div class="mt-4">' + totalsHtml(t) + '</div>';
      ageBox.hidden = !t.hasBeer;
      if (!cart.lines.length && done.hidden) { form.hidden = true; empty.hidden = false; summary.closest('aside').hidden = true; }
    };
    const drawDays = () => {
      dayList.innerHTML = days.map((d) => {
        const free = d.slots.filter((s) => !s.full).length;
        const dt = dateOfKey(d.key);
        return '<button type="button" class="day-btn" data-day="' + d.key + '" aria-pressed="' + (d.key === pick.day) + '"><span class="text-xs font-bold uppercase tracking-widest">' + (d.offset === 0 ? 'Today' : d.offset === 1 ? 'Tmrw' : DAY[dt.getUTCDay()]) + '</span><span class="font-display text-2xl leading-none">' + dt.getUTCDate() + '</span><span class="text-xs">' + MONTH[dt.getUTCMonth()] + '</span><span class="sr-only">, ' + plural(free, 'time') + ' free</span></button>';
      }).join('');
    };
    const drawSlots = () => {
      const d = days.find((x) => x.key === pick.day);
      if (!d) { slotList.innerHTML = ''; return; }
      slotList.innerHTML = d.slots.map((s) => '<button type="button" class="slot" data-slot="' + s.time + '" aria-pressed="' + (pick.time === s.time) + '"' + (s.full ? ' disabled' : '') + '>' + clock(s.time) + (s.full ? '<span class="sr-only"> (full)</span>' : '') + '</button>').join('');
      $('[data-pickup-label]', form).textContent = 'Pickup times on ' + longDate(d.key);
    };
    dayList.addEventListener('click', (e) => {
      const b = e.target.closest('[data-day]');
      if (!b) return;
      pick.day = b.getAttribute('data-day'); pick.time = null;
      drawDays(); drawSlots();
      setError(form, 'slot', '');
    });
    slotList.addEventListener('click', (e) => {
      const b = e.target.closest('[data-slot]');
      if (!b || b.disabled) return;
      pick.time = +b.getAttribute('data-slot');
      drawSlots();
      setError(form, 'slot', '');
      const s = $('[data-slot="' + pick.time + '"]', slotList); if (s) s.focus();
    });

    if (!Cart.get().lines.length) {
      form.hidden = true; empty.hidden = false; summary.closest('aside').hidden = true;
    } else {
      drawDays(); drawSlots(); drawSummary();
    }
    document.addEventListener('click', (e) => { if (e.target.closest('[data-qty], [data-remove]')) window.setTimeout(drawSummary, 0); });

    clearOnInput(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = form.elements, cart = Cart.get(), t = totals(cart);
      let ok = true;
      ok = setError(form, 'slot', pick.time === null ? 'Choose a pickup time.' : '') && ok;
      ok = setError(form, 'name', f.name.value.trim().length < 2 ? 'Enter the name the order is under.' : '') && ok;
      ok = setError(form, 'email', !EMAIL.test(f.email.value.trim()) ? 'Enter an email address, like sam@mail.example.' : '') && ok;
      ok = setError(form, 'phone', !validPhone(f.phone.value) ? 'Enter a 10-digit phone number so we can text you when it’s ready.' : '') && ok;
      if (t.hasBeer) ok = setError(form, 'age', !f.age.checked ? 'We can only sell beer to guests 21 and over. Please confirm to continue.' : '') && ok;
      if (!ok) {
        if (pick.time === null && !$('[aria-invalid="true"]', form)) { const first = $('[data-slot]:not([disabled])', slotList) || $('[data-day]', dayList); if (first) first.focus(); } else focusFirstError(form);
        return;
      }
      // To take real orders, send the order to your backend or a form service here, e.g.
      //   fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      // and show the confirmation below only when the response is OK.
      const ref = makeRef('CJ');
      $('[data-done-name]', done).textContent = firstName(f.name.value);
      $('[data-done-ref]', done).textContent = ref;
      $('[data-done-when]', done).textContent = longDate(pick.day) + ' at ' + clock(pick.time);
      $('[data-done-total]', done).textContent = money(t.total);
      $('[data-done-lines]', done).innerHTML = cart.lines.map((l, i) => lineHtml(l, i, false)).join('');
      $('[data-done-id]', done).hidden = !t.hasBeer;
      Cart.clear();
      form.hidden = true; summary.closest('aside').hidden = true; done.hidden = false;
      done.focus();
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
   * 13. Tours — capacity per tour, saved bookings (cinderjack-tours)
   * ------------------------------------------------------------------ */
  function savedTours() {
    const raw = store.get(STORE_TOURS);
    if (!Array.isArray(raw)) return [];
    return raw.filter((b) => b && typeof b.ref === 'string' && /^CJT-\d{4}$/.test(b.ref) && hasOwn(D.TOURS, b.tour) && validKey(b.date) &&
      typeof b.time === 'string' && /^\d{2}:\d{2}$/.test(b.time) && Number.isInteger(b.adults) && b.adults >= 0 && b.adults <= D.TOUR_MAX_GROUP &&
      Number.isInteger(b.minors) && b.minors >= 0 && b.minors <= D.TOUR_MAX_GROUP && typeof b.name === 'string')
      .map((b) => ({ ref: b.ref, tour: b.tour, date: b.date, time: b.time, adults: b.adults, minors: b.minors, name: b.name.slice(0, 80) }))
      .slice(0, MAX_SAVED_TOURS);
  }
  function tourSeatsLeft(tourId, key, time) {
    const t = D.TOURS[tourId];
    const h = hash('tour|' + tourId + '|' + key + '|' + time);
    let taken = h % 13 === 0 ? t.capacity : Math.floor((t.capacity * (h % 100)) / 115);
    savedTours().forEach((b) => { if (b.tour === tourId && b.date === key && b.time === time) taken += b.adults + b.minors; });
    return Math.max(0, t.capacity - taken);
  }
  function tourDates(tourId) {
    const t = D.TOURS[tourId], out = [];
    for (let i = 1; i <= D.TOUR_BOOK_AHEAD_DAYS; i++) {
      const key = addDays(TODAY, i);
      const times = t.schedule[weekday(key)];
      if (!times || !isOpenDay(key)) continue;
      out.push({ key: key, times: times.map((tm) => ({ time: tm, left: tourSeatsLeft(tourId, key, tm) })) });
    }
    return out;
  }

  const tours = $('[data-tours]');
  if (tours) {
    const form = $('form', tours), done = $('[data-tour-done]', tours);
    const dateList = $('[data-tour-dates]', form), timeList = $('[data-tour-times]', form);
    const adultsEl = $('[data-count="adults"]', form), minorsEl = $('[data-count="minors"]', form), minorsRow = $('[data-minors-row]', form);
    const state = { tour: hasOwn(D.TOURS, params.get('tour')) ? params.get('tour') : 'brewhouse', date: null, time: null, adults: 2, minors: 0 };
    $$('input[name="tour"]', form).forEach((r) => { r.checked = r.value === state.tour; });

    const left = () => (state.date && state.time ? tourSeatsLeft(state.tour, state.date, state.time) : null);
    const draw = () => {
      const t = D.TOURS[state.tour], dates = tourDates(state.tour);
      if (!dates.some((d) => d.key === state.date)) {
        const first = dates.find((d) => d.times.some((x) => x.left > 0));
        state.date = first ? first.key : null; state.time = null;
      }
      dateList.innerHTML = dates.slice(0, 10).map((d) => {
        const dt = dateOfKey(d.key), free = d.times.reduce((s, x) => s + x.left, 0);
        return '<button type="button" class="day-btn" data-tour-date="' + d.key + '" aria-pressed="' + (d.key === state.date) + '"' + (free ? '' : ' disabled') + '><span class="text-xs font-bold uppercase tracking-widest">' + DAY[dt.getUTCDay()] + '</span><span class="font-display text-2xl leading-none">' + dt.getUTCDate() + '</span><span class="text-xs">' + MONTH[dt.getUTCMonth()] + '</span><span class="sr-only">, ' + (free ? plural(free, 'place') + ' left' : 'full') + '</span></button>';
      }).join('');
      const day = dates.find((d) => d.key === state.date);
      if (day && (!state.time || !day.times.some((x) => x.time === state.time && x.left > 0))) {
        const firstFree = day.times.find((x) => x.left > 0);
        state.time = firstFree ? firstFree.time : null;
      }
      timeList.innerHTML = day ? day.times.map((x) => '<button type="button" class="slot slot-wide" data-tour-time="' + x.time + '" aria-pressed="' + (x.time === state.time) + '"' + (x.left ? '' : ' disabled') + '><span class="block">' + clock(toMin(x.time)) + '</span><span class="block text-xs font-semibold">' + (x.left ? x.left + ' of ' + t.capacity + ' left' : 'Full') + '</span></button>').join('') : '';
      minorsRow.hidden = !t.minors;
      if (!t.minors) state.minors = 0;
      const max = Math.min(D.TOUR_MAX_GROUP, left() === null ? D.TOUR_MAX_GROUP : left());
      if (state.adults + state.minors > max) { state.minors = Math.max(0, max - state.adults); state.adults = Math.max(1, Math.min(state.adults, max - state.minors)); }
      adultsEl.textContent = state.adults; minorsEl.textContent = state.minors;
      $$('[data-step-count]', form).forEach((b) => {
        const which = b.getAttribute('data-step-count'), step = +b.getAttribute('data-step');
        const v = state[which] + step, total = state.adults + state.minors + step;
        b.disabled = v < (which === 'adults' ? 1 : 0) || (step > 0 && total > max);
      });
      $('[data-tour-summary]', tours).innerHTML = state.date && state.time
        ? '<p class="font-display text-2xl leading-tight">' + esc(t.name) + '</p><p class="mt-1">' + longDate(state.date) + ' at ' + clock(toMin(state.time)) + ' · ' + t.minutes + ' minutes</p>' +
          '<p class="mt-1">' + plural(state.adults, 'guest') + ' 21+' + (state.minors ? ', ' + plural(state.minors, 'guest') + ' under 21 (free, no tasting)' : '') + '</p>' +
          '<p class="mt-3 font-display text-4xl text-ochre">' + money(t.price * state.adults) + '</p><p class="text-sm text-cream/80">Paid at the taproom when you check in. ' + plural(left(), 'place') + ' left on this tour.</p>'
        : '<p>Choose a date and time to see the total.</p>';
    };
    form.addEventListener('change', (e) => { if (e.target.name === 'tour' && hasOwn(D.TOURS, e.target.value)) { state.tour = e.target.value; state.time = null; draw(); } });
    form.addEventListener('click', (e) => {
      const d = e.target.closest('[data-tour-date]'), tm = e.target.closest('[data-tour-time]'), st = e.target.closest('[data-step-count]');
      if (d && !d.disabled) { state.date = d.getAttribute('data-tour-date'); state.time = null; draw(); setError(form, 'when', ''); const again = $('[data-tour-date="' + state.date + '"]', form); if (again) again.focus(); }
      if (tm && !tm.disabled) { state.time = tm.getAttribute('data-tour-time'); draw(); setError(form, 'when', ''); const again = $('[data-tour-time="' + state.time + '"]', form); if (again) again.focus(); }
      if (st && !st.disabled) { const w = st.getAttribute('data-step-count'); state[w] += +st.getAttribute('data-step'); draw(); const again = $('[data-step-count="' + w + '"][data-step="' + st.getAttribute('data-step') + '"]', form); if (again && !again.disabled) again.focus(); }
    });

    const drawSaved = () => {
      const wrap = $('[data-my-tours]'), list = $('[data-my-tour-list]');
      if (!wrap) return;
      const mine = savedTours().filter((b) => b.date >= TODAY);
      wrap.hidden = !mine.length;
      list.innerHTML = mine.map((b) => '<li class="flex flex-wrap items-center justify-between gap-3 border-b-2 border-dashed border-ink/20 py-3"><span><span class="block font-bold">' + esc(D.TOURS[b.tour].name) + ' · ' + esc(b.ref) + '</span><span class="text-sm text-muted">' + longDate(b.date) + ' at ' + clock(toMin(b.time)) + ' · ' + plural(b.adults + b.minors, 'guest') + '</span></span><button type="button" class="btn-line btn-sm" data-cancel-tour="' + esc(b.ref) + '">Cancel<span class="sr-only"> booking ' + esc(b.ref) + '</span></button></li>').join('');
    };
    document.addEventListener('click', (e) => {
      const c = e.target.closest('[data-cancel-tour]');
      if (!c) return;
      const ref = c.getAttribute('data-cancel-tour');
      store.set(STORE_TOURS, savedTours().filter((b) => b.ref !== ref));
      drawSaved(); draw();
      toast('Booking <strong>' + esc(ref) + '</strong> canceled. The places are free again.');
    });

    clearOnInput(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = form.elements;
      let ok = true;
      const l = left();
      ok = setError(form, 'when', !state.date || !state.time ? 'Choose a date and a start time.' : l < state.adults + state.minors ? 'Only ' + plural(l, 'place') + ' left on this tour. Try another time.' : '') && ok;
      ok = setError(form, 'name', f.name.value.trim().length < 2 ? 'Enter the name for the booking.' : '') && ok;
      ok = setError(form, 'email', !EMAIL.test(f.email.value.trim()) ? 'Enter an email address, like sam@mail.example.' : '') && ok;
      ok = setError(form, 'phone', f.phone.value.trim() && !validPhone(f.phone.value) ? 'Enter a 10-digit phone number, or leave it blank.' : '') && ok;
      if (!ok) { focusFirstError(form); return; }
      // To take real bookings, post the form to your booking system here and show the
      // confirmation only when it answers OK (see DOCS.md, "Forms").
      const ref = makeRef('CJT');
      const booking = { ref: ref, tour: state.tour, date: state.date, time: state.time, adults: state.adults, minors: state.minors, name: f.name.value.trim().slice(0, 80) };
      store.set(STORE_TOURS, [booking].concat(savedTours()).slice(0, MAX_SAVED_TOURS));
      $('[data-done-name]', done).textContent = firstName(booking.name);
      $('[data-done-ref]', done).textContent = ref;
      $('[data-done-what]', done).textContent = D.TOURS[state.tour].name + ', ' + longDate(state.date) + ' at ' + clock(toMin(state.time)) + ', ' + plural(state.adults + state.minors, 'guest');
      done.hidden = false;
      form.reset();
      $$('input[name="tour"]', form).forEach((r) => { r.checked = r.value === state.tour; });
      state.time = null;
      draw(); drawSaved();
      done.focus();
    });
    draw(); drawSaved();
  }

  /* ------------------------------------------------------------------
   * 14. Private events inquiry (contact.html) — ?space=loft|barrel|garden
   * ------------------------------------------------------------------ */
  const hire = $('[data-hire]');
  if (hire) {
    const form = hire, out = $('[data-hire-estimate]'), done = $('[data-hire-done]');
    const typeSel = form.elements.type;
    typeSel.innerHTML = '<option value="">Choose one</option>' + D.HIRE_EVENT_TYPES.map((t) => '<option>' + esc(t) + '</option>').join('');
    const minKey = addDays(TODAY, D.HIRE_MIN_DAYS_AHEAD);
    const MIN_GUESTS = 8, MAX_GUESTS = 400;
    form.elements.date.min = minKey;
    form.elements.date.max = addDays(TODAY, 540);
    $$('[data-hire-min]').forEach((el) => { el.textContent = longDate(minKey); });
    $$('[data-space-card]', form).forEach((card) => {
      const id = card.getAttribute('data-space-card');
      if (!hasOwn(D.SPACES, id)) return;
      const s = D.SPACES[id];
      $('[data-space-cap]', card).textContent = 'Up to ' + s.guests + ' guests';
      $('[data-space-spend]', card).textContent = 'From ' + money(s.minSpend[0]) + ' minimum spend';
    });
    const startSpace = params.get('space');
    if (hasOwn(D.SPACES, startSpace)) $$('input[name="space"]', form).forEach((r) => { r.checked = r.value === startSpace; });
    const estimate = () => {
      const f = form.elements, space = f.space.value, key = f.date.value, guests = Math.floor(+f.guests.value);
      if (!hasOwn(D.SPACES, space)) { out.innerHTML = '<p>Choose a space to see its capacity and minimum spend.</p>'; return; }
      const s = D.SPACES[space];
      let weekend = null;
      let html = '<p class="font-display text-2xl leading-tight">' + esc(s.name) + '</p><p class="mt-1 text-sm text-cream/80">' + esc(s.note) + '</p>';
      if (validKey(key)) {
        const wd = weekday(key), info = dayInfo(key);
        weekend = wd === 5 || wd === 6;
        html += '<p class="mt-4 text-sm font-semibold uppercase tracking-wider text-cream/80">' + longDate(key) + '</p>';
        if (!info.open) html += '<p class="mt-1 font-semibold text-ochre">' + esc(info.special ? info.special.name : 'That day') + ': the taproom is closed, so we can only host a private buyout. Tell us about it below.</p>';
        html += '<p class="mt-1 font-display text-4xl text-ochre">' + money(s.minSpend[weekend ? 1 : 0]) + '</p><p class="text-sm text-cream/80">' + (weekend ? 'Friday and Saturday' : 'Sunday to Thursday') + ' food and drink minimum</p>';
      } else {
        html += '<p class="mt-4 font-display text-4xl text-ochre">' + money(s.minSpend[0]) + '–' + money(s.minSpend[1]) + '</p><p class="text-sm text-cream/80">Food and drink minimum, depending on the day</p>';
      }
      if (guests > s.guests) {
        html += '<p class="mt-3 rounded-md bg-rust-bright/20 px-3 py-2 text-sm font-semibold">' + plural(guests, 'guest') + ' is more than this space holds (' + s.guests + '). ' + (space === 'garden' ? 'Call us about a full buyout.' : 'Choose a bigger space.') + '</p>';
      } else if (guests >= MIN_GUESTS) {
        // Per head only for a valid count, using the minimum for the chosen day (or Sunday to Thursday until a date is picked).
        const spend = s.minSpend[weekend ? 1 : 0];
        html += '<p class="mt-3 text-sm">Fits ' + plural(guests, 'guest') + ' comfortably. About ' + money(Math.ceil(spend / guests)) + ' a head' + (weekend === null ? ' on a Sunday to Thursday' : weekend ? ' on a Friday or Saturday' : '') + '.</p>';
      } else if (guests > 0) {
        html += '<p class="mt-3 text-sm">Private events start at ' + MIN_GUESTS + ' guests.</p>';
      }
      out.innerHTML = html;
    };
    form.addEventListener('input', estimate);
    form.addEventListener('change', estimate);
    estimate();
    clearOnInput(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = form.elements, key = f.date.value, guests = Math.floor(+f.guests.value);
      let ok = true;
      ok = setError(form, 'name', f.name.value.trim().length < 2 ? 'Enter your name.' : '') && ok;
      ok = setError(form, 'email', !EMAIL.test(f.email.value.trim()) ? 'Enter an email address, like sam@mail.example.' : '') && ok;
      ok = setError(form, 'phone', f.phone.value.trim() && !validPhone(f.phone.value) ? 'Enter a 10-digit phone number, or leave it blank.' : '') && ok;
      ok = setError(form, 'type', !f.type.value ? 'Choose the kind of event.' : '') && ok;
      ok = setError(form, 'date', !validKey(key) ? 'Choose a date.' : key < minKey ? 'We need at least ' + D.HIRE_MIN_DAYS_AHEAD + ' days to plan. Choose ' + longDate(minKey) + ' or later.' : '') && ok;
      const room = hasOwn(D.SPACES, f.space.value) ? D.SPACES[f.space.value] : null;
      ok = setError(form, 'guests', !(guests >= MIN_GUESTS && guests <= MAX_GUESTS) ? 'Enter a guest count between ' + MIN_GUESTS + ' and ' + MAX_GUESTS + '.'
        : room && guests > room.guests ? room.name + ' holds up to ' + room.guests + ' guests. ' + (f.space.value === 'garden' ? 'For a bigger party, call us about a full buyout.' : 'Choose a bigger space or fewer guests.') : '') && ok;
      ok = setError(form, 'space', !hasOwn(D.SPACES, f.space.value) ? 'Choose a space.' : '') && ok;
      if (!ok) { focusFirstError(form); return; }
      // To receive inquiries, send the form to a service such as Formspree here, e.g.
      //   fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      // and only show the thank-you below when the response is OK.
      $('[data-done-name]', done).textContent = firstName(f.name.value);
      $('[data-done-ref]', done).textContent = makeRef('CJE');
      $('[data-done-what]', done).textContent = D.SPACES[f.space.value].name + ' on ' + longDate(key) + ' for ' + plural(guests, 'guest');
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
  }

  initReveal();
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
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
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
