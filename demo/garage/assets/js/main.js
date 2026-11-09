/* Bellcrank Motor Works (Garage template) — all template JavaScript. Vanilla, no dependencies.
 *
 *  1. Data            garage details, hours, drop-off slots, services, prices (edit here)
 *  2. Helpers         DOM, storage, money, Eastern time, dates, federal holidays, license plates
 *  3. Header          sticky header, accessible mobile menu
 *  4. Reveal          fade content in as it scrolls into view
 *  5. Open now        status badges, today's hours, the shop-day gauge, next free inspection, closures
 *  6. Plate inputs    live formatting for every [data-plate-input]
 *  7. Quick form      home page "got your plate" form
 *  8. Services        category filter
 *  9. Price checker   service type + fuel + engine size -> fixed guide price
 * 10. Booking         booking request: vehicle, jobs, drop-off day and slot, loaner car
 * 11. Inspection      next due date from the last inspection, saved reminders
 * 12. Reviews         rating breakdown, filter, sort, relative dates
 * 13. FAQ             live search
 * 14. Contact form
 * 15. Back to top     (separate block at the end of the file)
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Data — times are "HH:MM" in TIME_ZONE. Weekday indexes: 0 = Sunday … 6 = Saturday.
   * ------------------------------------------------------------------ */
  const TIME_ZONE = 'America/New_York';

  const GARAGE = {
    name: 'Bellcrank Motor Works',
    phone: '(603) 555-0164',
    phoneHref: '+16035550164'
  };

  // Shop hours per weekday; null = closed all day.
  const HOURS = [
    null,               // Sunday
    ['07:30', '18:00'], // Monday
    ['07:30', '18:00'],
    ['07:30', '18:00'],
    ['07:30', '18:00'],
    ['07:30', '18:00'], // Friday
    ['08:00', '13:00']  // Saturday
  ];

  // Drop-off times offered in the booking form, per weekday.
  const WEEKDAY_SLOTS = ['07:30', '08:00', '08:30', '09:00', '12:30'];
  const DROP_OFF_SLOTS = [null, WEEKDAY_SLOTS, WEEKDAY_SLOTS, WEEKDAY_SLOTS, WEEKDAY_SLOTS, WEEKDAY_SLOTS, ['08:00', '08:30', '09:00']];

  // Booking window: from tomorrow up to this many days ahead.
  const BOOK_AHEAD_DAYS = 28;
  // Loaner cars available (the demo marks some as already out on each day).
  const COURTESY_CARS = 2;
  // The longest job list (minutes) a customer can wait in the lounge for.
  const MAX_WAIT_MINUTES = 90;
  // Extra days the shop closes every year, on top of Sundays and federal holidays ("MM-DD").
  const EXTRA_CLOSED = [{ md: '12-24', label: 'Christmas Eve' }];
  // US federal holidays are worked out for any year in bankHolidays(); set to false to stay
  // open on them.
  const CLOSE_ON_BANK_HOLIDAYS = true;
  // Demo availability: the share (0–100) of drop-off slots that show as already taken.
  const DEMO_SLOTS_TAKEN = 35;

  // Jobs in the booking form. price: guide price in $ (0 = free check, quoted after);
  // from: true when the price depends on the car; mins: time in the shop.
  const JOBS = {
    mot: { name: 'Safety inspection', price: 45, from: false, mins: 60 },
    interim: { name: 'Basic service', price: 79, from: true, mins: 90, level: true },
    full: { name: 'Full service', price: 179, from: true, mins: 180, level: true },
    major: { name: 'Major service', price: 289, from: true, mins: 300, level: true },
    brakes: { name: 'Brake check', price: 0, from: false, mins: 30 },
    tyres: { name: 'Tires and wheel alignment', price: 129, from: true, mins: 60 },
    diagnostics: { name: 'Diagnostics', price: 149, from: false, mins: 60 },
    ev: { name: 'EV and hybrid health check', price: 99, from: false, mins: 60 },
    aircon: { name: 'A/C recharge', price: 169, from: false, mins: 45 },
    fault: { name: 'A fault or a noise', price: 0, from: false, mins: 120, needsNotes: true }
  };
  // An inspection booked with any service costs this instead of the usual inspection price.
  const MOT_WITH_SERVICE = 35;

  // Service filter categories on services.html (?cat=<id>).
  const CATEGORIES = {
    all: 'All work',
    servicing: 'Maintenance',
    mot: 'Inspection',
    'brakes-tyres': 'Brakes & tires',
    diagnostics: 'Diagnostics',
    ev: 'EV & hybrid',
    repairs: 'Repairs'
  };

  // Price checker. Prices in $ for engine bands [small, mid, large] (New Hampshire has no sales
  // tax); electric cars have one price. The inspection is the same for every car.
  const ENGINE_BANDS = { small: 'Up to 1.4 liters', mid: '1.4 to 2.0 liters', large: 'Over 2.0 liters' };
  const FUELS = { petrol: 'Gas', diesel: 'Diesel', hybrid: 'Hybrid', electric: 'Electric' };
  const SERVICE_TYPES = {
    mot: { name: 'Safety inspection', price: 45, mins: { engine: 60, electric: 60 } },
    interim: {
      name: 'Basic service',
      price: { petrol: [79, 89, 109], diesel: [129, 149, 169], hybrid: [89, 99, 119], electric: 79 },
      mins: { engine: 90, electric: 60 }
    },
    full: {
      name: 'Full service',
      price: { petrol: [229, 259, 299], diesel: [279, 319, 359], hybrid: [249, 279, 319], electric: 179 },
      mins: { engine: 180, electric: 120 }
    },
    major: {
      name: 'Major service',
      price: { petrol: [449, 499, 579], diesel: [529, 589, 659], hybrid: [479, 529, 609], electric: 289 },
      mins: { engine: 300, electric: 180 }
    }
  };
  // What each service includes. levels: the services it comes with; fuels: only for these fuels.
  const ALL_FUELS = ['petrol', 'diesel', 'hybrid', 'electric'];
  const ENGINES = ['petrol', 'diesel', 'hybrid'];
  const SERVICES_ALL = ['interim', 'full', 'major'];
  const INCLUDED = [
    { t: 'Full safety inspection, bumper to bumper', levels: ['mot'], fuels: ALL_FUELS },
    { t: 'Free reinspection within 10 business days', levels: ['mot'], fuels: ALL_FUELS },
    { t: 'Written report the same day', levels: ['mot'], fuels: ALL_FUELS },
    { t: 'Every concern explained, with photos', levels: ['mot'], fuels: ALL_FUELS },
    { t: 'Engine oil and filter change', levels: SERVICES_ALL, fuels: ENGINES },
    { t: 'Washer fluid, coolant and brake fluid topped off', levels: SERVICES_ALL, fuels: ALL_FUELS },
    { t: 'Brake pads, rotors and lines checked', levels: SERVICES_ALL, fuels: ALL_FUELS },
    { t: 'Tire tread, pressure and condition checked', levels: SERVICES_ALL, fuels: ALL_FUELS },
    { t: 'Lights, horn and wipers checked', levels: SERVICES_ALL, fuels: ALL_FUELS },
    { t: 'Steering and suspension checked', levels: SERVICES_ALL, fuels: ALL_FUELS },
    { t: 'Exhaust checked for leaks and security', levels: SERVICES_ALL, fuels: ENGINES },
    { t: '12-volt battery and charging test', levels: SERVICES_ALL, fuels: ALL_FUELS },
    { t: 'Fault codes read and warning lights checked', levels: SERVICES_ALL, fuels: ALL_FUELS },
    { t: 'High-voltage battery health report', levels: SERVICES_ALL, fuels: ['hybrid', 'electric'] },
    { t: 'Charging port and cable inspected', levels: SERVICES_ALL, fuels: ['electric'] },
    { t: 'Service record updated', levels: SERVICES_ALL, fuels: ALL_FUELS },
    { t: 'Air filter replaced', levels: ['full', 'major'], fuels: ENGINES },
    { t: 'Fuel filter replaced', levels: ['full', 'major'], fuels: ['diesel'] },
    { t: 'Cabin air filter replaced', levels: ['full', 'major'], fuels: ALL_FUELS },
    { t: 'Wheel bearings and CV boots checked', levels: ['full', 'major'], fuels: ALL_FUELS },
    { t: 'Coolant strength tested', levels: ['full', 'major'], fuels: ALL_FUELS },
    { t: 'Inverter and battery cooling circuit checked', levels: ['full', 'major'], fuels: ['hybrid', 'electric'] },
    { t: 'Road test by your technician', levels: ['full', 'major'], fuels: ALL_FUELS },
    { t: 'Spark plugs replaced', levels: ['major'], fuels: ['petrol', 'hybrid'] },
    { t: 'Brake fluid replaced', levels: ['major'], fuels: ALL_FUELS },
    { t: 'Auxiliary drive belt inspected', levels: ['major'], fuels: ENGINES },
    { t: 'Transmission fluid level checked', levels: ['major'], fuels: ENGINES },
    { t: 'Reduction gear oil checked', levels: ['major'], fuels: ['electric'] }
  ];

  // Inspection reminders: how many weeks before the due date a reminder can be sent.
  const REMINDER_LEADS = { 7: '1 week before', 14: '2 weeks before', 28: '4 weeks before' };
  const REMINDER_VIA = { email: 'email', text: 'text message' };
  const MAX_REMINDERS = 6;
  // A due date this many days away or fewer shows as "Due soon".
  const DUE_SOON_DAYS = 30;

  const STORE_QUOTE = 'garage:quote';
  const STORE_REMINDERS = 'garage:reminders';

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const params = new URLSearchParams(window.location.search);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // A US phone number with its punctuation stripped: 10 digits, with an optional leading 1 or +1.
  const US_PHONE = /^(\+?1)?[2-9]\d{2}[2-9]\d{6}$/;

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

  // Values from the URL or storage must be the data's own keys, so ?service=constructor matches nothing.
  const hasOwn = (obj, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : (many || one + 's'));

  function money(n) { return '$' + (Math.round(n) === n ? String(n) : n.toFixed(2)); }
  function duration(m) {
    const h = Math.floor(m / 60), mm = m % 60;
    if (h && mm) return plural(h, 'hr') + ' ' + mm + ' min';
    return h ? plural(h, 'hour') : mm + ' min';
  }
  function toMin(hhmm) { const p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }
  // Minutes after midnight to 12-hour clock times: "7:30am", "6pm", "12:30pm".
  function clock(min) {
    const h = Math.floor(min / 60) % 24, m = min % 60;
    return (h % 12 || 12) + (m ? ':' + String(m).padStart(2, '0') : '') + (h < 12 ? 'am' : 'pm');
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
  // A real calendar date in YYYY-MM-DD form (rejects 2026-02-30).
  function validKey(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const p = s.split('-');
    return +p[1] >= 1 && +p[1] <= 12 && keyOfDate(dateOfKey(s)) === s;
  }
  // Add whole months or years; the 29th–31st clamp to the end of a shorter month (Feb 29 + 1 year = Feb 28).
  function addMonths(key, n) {
    const p = key.split('-').map(Number);
    const total = p[0] * 12 + (p[1] - 1) + n;
    const y = Math.floor(total / 12), m = total % 12 + 1;
    const last = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return keyOf(y, m, Math.min(p[2], last));
  }
  const shortDate = (key) => { const d = dateOfKey(key); return DAY[d.getUTCDay()] + ', ' + MONTH[d.getUTCMonth()] + ' ' + d.getUTCDate(); };
  const longDate = (key) => { const d = dateOfKey(key); return DAY_LONG[d.getUTCDay()] + ', ' + MONTH_LONG[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(); };
  const dayMonth = (key) => { const d = dateOfKey(key); return MONTH_LONG[d.getUTCMonth()] + ' ' + d.getUTCDate(); };

  // Wall-clock time in Keene (TIME_ZONE), whatever the visitor's own time zone is.
  const tzParts = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  function partsAt(date) {
    const o = {};
    tzParts.formatToParts(date).forEach((p) => { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, min: +o.minute };
  }
  // ?at=2026-10-19T10:30 previews the site at an Eastern date and time (for testing hours and slots).
  const AT = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(params.get('at') || '');
  function nowLondon() {
    if (AT && validKey(AT[1]) && +AT[2] < 24 && +AT[3] < 60) {
      return { key: AT[1], day: weekday(AT[1]), mins: +AT[2] * 60 + +AT[3] };
    }
    const p = partsAt(new Date());
    const k = keyOf(p.y, p.m, p.d);
    return { key: k, day: weekday(k), mins: p.h * 60 + p.min };
  }

  // Deterministic pseudo-random numbers (FNV-1a + mix) so demo availability is stable for a given day.
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    h ^= h >>> 16; h = Math.imul(h, 2246822507) >>> 0;
    h ^= h >>> 13; h = Math.imul(h, 3266489909) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
  }

  // US federal holidays for a year, as { "YYYY-MM-DD": name }, plus the weekday they're observed on
  // when they fall at a weekend (Saturday: the Friday before; Sunday: the Monday after).
  const holidayCache = Object.create(null);
  function bankHolidays(y) {
    if (holidayCache[y]) return holidayCache[y];
    const out = Object.create(null);
    // The nth (1 = first) given weekday (0 = Sunday) of a month.
    const nthWeekday = (month, dow, n) => { let k = keyOf(y, month, 1); while (weekday(k) !== dow) k = addDays(k, 1); return addDays(k, (n - 1) * 7); };
    const lastMonday = (month) => { let k = addDays(keyOf(y, month + 1, 1), -1); while (weekday(k) !== 1) k = addDays(k, -1); return k; };
    const fixed = (month, day, name) => {
      const k = keyOf(y, month, day), d = weekday(k);
      out[k] = name;
      if (d === 6) out[addDays(k, -1)] = name + ' (observed)';
      if (d === 0) out[addDays(k, 1)] = name + ' (observed)';
    };
    fixed(1, 1, "New Year's Day");
    out[nthWeekday(1, 1, 3)] = 'Martin Luther King Jr. Day';
    out[nthWeekday(2, 1, 3)] = "Presidents' Day";
    out[lastMonday(5)] = 'Memorial Day';
    fixed(6, 19, 'Juneteenth');
    fixed(7, 4, 'Independence Day');
    out[nthWeekday(9, 1, 1)] = 'Labor Day';
    out[nthWeekday(10, 1, 2)] = 'Columbus Day';
    fixed(11, 11, 'Veterans Day');
    out[nthWeekday(11, 4, 4)] = 'Thanksgiving Day';
    fixed(12, 25, 'Christmas Day');
    // Next New Year's Day on a Saturday is observed on December 31 of this year.
    if (weekday(keyOf(y + 1, 1, 1)) === 6) out[keyOf(y, 12, 31)] = "New Year's Day (observed)";
    holidayCache[y] = out;
    return out;
  }
  // Why the shop is closed on a date (federal holiday or extra closed day), or null.
  function closedReason(key) {
    const hol = bankHolidays(+key.slice(0, 4));
    if (CLOSE_ON_BANK_HOLIDAYS && hasOwn(hol, key)) return hol[key];
    const extra = EXTRA_CLOSED.find((x) => x.md === key.slice(5));
    return extra ? extra.label : null;
  }
  // Opening hours for a date as [openMin, closeMin], or null when closed.
  function hoursOn(key) {
    const h = HOURS[weekday(key)];
    if (!h || closedReason(key)) return null;
    return [toMin(h[0]), toMin(h[1])];
  }

  // US license plates vary by state and vanity plates are common, so any 2 to 8 letters and digits
  // pass. Returns { ok, text, compact, kind }; the check is about format only, not a lookup.
  function parsePlate(raw) {
    const compact = String(raw || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (compact.length < 2 || compact.length > 8) return { ok: false, text: compact, compact: compact };
    let m;
    // New Hampshire's usual 3 + 4 digits, like 294 1086
    if ((m = /^([0-9]{3})([0-9]{4})$/.exec(compact))) return { ok: true, compact: compact, text: m[1] + ' ' + m[2], kind: 'numeric' };
    // Letters then digits, common in other states, like ABC 1234
    if ((m = /^([A-Z]{3})([0-9]{3,4})$/.exec(compact))) return { ok: true, compact: compact, text: m[1] + ' ' + m[2], kind: 'lettered' };
    return { ok: true, compact: compact, text: compact, kind: 'other' };
  }
  // Formats a typed plate while keeping the caret near where it was.
  function formatPlateInput(input) {
    const before = input.value;
    const p = parsePlate(before);
    let next = p.ok ? p.text : before.toUpperCase().replace(/[^A-Z0-9 ]/g, '').replace(/\s+/g, ' ').slice(0, 8);
    if (next !== before) {
      const atEnd = input.selectionStart === before.length;
      input.value = next;
      if (atEnd) input.setSelectionRange(next.length, next.length);
    }
    return p;
  }

  function setError(form, name, msg) {
    const el = $('[data-error="' + name + '"]', form);
    if (el) el.textContent = msg || '';
    $$('[name="' + name + '"]', form).forEach((input) => {
      if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
      const wrap = input.closest('.plate-field');
      if (wrap) wrap.classList.toggle('is-invalid', !!msg);
    });
    return !msg;
  }
  function focusFirstError(form) {
    const bad = $('[aria-invalid="true"]', form);
    if (bad) bad.focus();
  }

  /* ------------------------------------------------------------------
   * 3. Header
   * ------------------------------------------------------------------ */
  const header = $('#site-header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const menuBtn = $('#menu-toggle'), menu = $('#mobile-menu');
  function setMenu(open) {
    // The menu sits right under the header, whatever height the header has.
    if (open) menu.style.top = Math.max(0, header.getBoundingClientRect().bottom) + 'px';
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
    $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
    document.body.classList.toggle('menu-is-open', open);
  }
  menuBtn.addEventListener('click', () => setMenu(menu.hidden));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
  });
  $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  window.matchMedia('(min-width: 1280px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  /* ------------------------------------------------------------------
   * 4. Reveal — everything above the fold edge is revealed on scroll too,
   *    so fast jumps (End key, anchors) never leave content hidden.
   * ------------------------------------------------------------------ */
  const pending = $$('.reveal');
  const show = (el) => el.classList.add('is-visible');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    pending.forEach(show);
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    pending.forEach((el, i) => { el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms'; io.observe(el); });
    let queued = false;
    const revealAbove = () => {
      queued = false;
      const limit = window.innerHeight * 0.92;
      $$('.reveal:not(.is-visible)').forEach((el) => {
        if (el.getBoundingClientRect().top < limit) { show(el); io.unobserve(el); }
      });
    };
    window.addEventListener('scroll', () => {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(revealAbove);
    }, { passive: true });
    if (window.location.hash) window.addEventListener('load', revealAbove);
  }

  /* ------------------------------------------------------------------
   * 5. Open now
   * ------------------------------------------------------------------ */
  // When the shop next opens after now: { key, mins }.
  function nextOpening(now) {
    for (let i = 0; i < 21; i++) {
      const key = addDays(now.key, i), h = hoursOn(key);
      if (!h || (i === 0 && now.mins >= h[0])) continue;
      return { key: key, mins: h[0], offset: i };
    }
    return null;
  }
  function whenWord(n, key) {
    if (n.offset === 0) return 'today';
    if (n.offset === 1) return 'tomorrow';
    if (n.offset < 7) return DAY_LONG[weekday(key)];
    return shortDate(key);
  }
  // { open, text, short } for the status badges. Never a bare "Closed": always when we open next.
  function workshopStatus(now) {
    const h = hoursOn(now.key);
    if (h && now.mins >= h[0] && now.mins < h[1]) {
      const left = h[1] - now.mins;
      return { open: true, text: (left <= 30 ? 'Closing soon · ' : 'Open now · until ') + clock(h[1]), short: 'Open until ' + clock(h[1]) };
    }
    const n = nextOpening(now);
    if (!n) return { open: false, text: 'Call for opening times', short: 'Call us' };
    const prefix = closedReason(now.key) && n.offset > 0 ? closedReason(now.key) + ' · ' : '';
    return { open: false, text: prefix + 'Opens ' + whenWord(n, n.key) + ' at ' + clock(n.mins), short: 'Opens ' + whenWord(n, n.key) + ' ' + clock(n.mins) };
  }

  function paintStatus() {
    const now = nowLondon();
    const s = workshopStatus(now);
    $$('[data-status]').forEach((el) => {
      el.setAttribute('data-state', s.open ? 'open' : 'resting');
      const t = $('[data-status-text]', el);
      if (t) t.textContent = el.hasAttribute('data-status-short') ? s.short : s.text;
    });
    // Today's hours
    const h = hoursOn(now.key);
    const reason = closedReason(now.key);
    $$('[data-today-hours]').forEach((el) => {
      el.textContent = h ? DAY_LONG[now.day] + ' ' + clock(h[0]) + '–' + clock(h[1])
        : DAY_LONG[now.day] + ': ' + (reason || 'day off');
    });
    // Hours tables: highlight today's row
    $$('[data-hours-day]').forEach((tr) => {
      const isToday = +tr.getAttribute('data-hours-day') === now.day;
      tr.toggleAttribute('data-today', isToday);
      if (isToday) tr.setAttribute('aria-current', 'date'); else tr.removeAttribute('aria-current');
    });
    // Shop-day gauge: one segment per half hour of today's opening
    $$('[data-rev]').forEach((el) => {
      const bar = $('[data-rev-bar]', el), label = $('[data-rev-label]', el);
      if (!h) {
        const n = nextOpening(now);
        bar.innerHTML = '<span class="rev-seg"></span>'.repeat(12);
        label.textContent = n ? 'Day off today · back ' + whenWord(n, n.key) + ' ' + clock(n.mins) : 'Day off today';
        return;
      }
      const segs = Math.round((h[1] - h[0]) / 30);
      let html = '';
      for (let i = 0; i < segs; i++) {
        const start = h[0] + i * 30;
        const cls = now.mins >= start + 30 ? ' is-past' : now.mins >= start ? ' is-now' : '';
        html += '<span class="rev-seg' + cls + '"></span>';
      }
      bar.innerHTML = html;
      if (now.mins < h[0]) label.textContent = 'Doors open at ' + clock(h[0]) + ' · drop-offs from ' + clock(h[0]);
      else if (now.mins >= h[1]) label.textContent = 'Shop closed for today · keys in the drop box';
      else label.textContent = duration(Math.ceil((h[1] - now.mins) / 5) * 5) + ' of shop time left today';
    });
    // Next free inspection drop-off
    const next = firstFreeSlot(now);
    $$('[data-next-mot]').forEach((el) => {
      el.textContent = next ? shortDate(next.key) + ' · ' + clock(toMin(next.time)) : 'Call us';
    });
    // Upcoming closures (federal holidays and extra closed days)
    $$('[data-closures]').forEach((list) => {
      const items = [];
      for (let i = 0; i < 400 && items.length < (+list.getAttribute('data-closures') || 3); i++) {
        const key = addDays(now.key, i), why = closedReason(key);
        if (why && HOURS[weekday(key)]) items.push('<li class="flex justify-between gap-4 border-b border-dashed border-ink/25 py-2.5"><span class="font-semibold">' + esc(why) + '</span><span class="gauge text-steel">' + shortDate(key) + ', ' + key.slice(0, 4) + '</span></li>');
      }
      list.innerHTML = items.join('') || '<li class="py-2.5 text-steel">No closures in the next year.</li>';
    });
  }

  // Booking availability (shared with the home page "next free inspection").
  function slotTaken(key, time) { return hash('slot|' + key + '|' + time) % 100 < DEMO_SLOTS_TAKEN; }
  function slotsOn(key) {
    if (!hoursOn(key)) return [];
    return (DROP_OFF_SLOTS[weekday(key)] || []).map((t) => ({ time: t, taken: slotTaken(key, t) }));
  }
  function courtesyLeft(key) { return COURTESY_CARS - (hash('car|' + key) % (COURTESY_CARS + 1)); }
  const firstBookable = (now) => addDays(now.key, 1);
  const lastBookable = (now) => addDays(now.key, BOOK_AHEAD_DAYS);
  function firstFreeSlot(now) {
    for (let k = firstBookable(now); k <= lastBookable(now); k = addDays(k, 1)) {
      const free = slotsOn(k).find((s) => !s.taken);
      if (free) return { key: k, time: free.time };
    }
    return null;
  }

  paintStatus();
  window.setInterval(paintStatus, 60000);

  /* ------------------------------------------------------------------
   * 6. Plate inputs — format as you type: "2941086" -> "294 1086"
   * ------------------------------------------------------------------ */
  $$('[data-plate-input]').forEach((input) => {
    input.addEventListener('input', () => formatPlateInput(input));
    input.addEventListener('blur', () => formatPlateInput(input));
  });

  /* ------------------------------------------------------------------
   * 7. Quick inspection form (home page)
   * ------------------------------------------------------------------ */
  const quick = $('[data-quick-mot]');
  if (quick) {
    quick.addEventListener('submit', (e) => {
      e.preventDefault();
      const p = parsePlate($('[name="reg"]', quick).value);
      if (!setError(quick, 'reg', p.ok ? '' : 'Enter a license plate, like 294 1086.')) { focusFirstError(quick); return; }
      window.location.href = 'book.html?service=mot&reg=' + encodeURIComponent(p.compact);
    });
  }

  /* ------------------------------------------------------------------
   * 8. Services — category filter (?cat=<id>)
   * ------------------------------------------------------------------ */
  const svcRoot = $('[data-services]');
  if (svcRoot) {
    const cards = $$('[data-cat]', svcRoot);
    const chips = $$('[data-filter]');
    const count = $('[data-svc-count]');
    chips.forEach((chip) => {
      const id = chip.getAttribute('data-filter');
      const n = id === 'all' ? cards.length : cards.filter((c) => c.getAttribute('data-cat') === id).length;
      const badge = $('.chip-count', chip);
      if (badge) badge.textContent = n;
    });
    const apply = (cat, push) => {
      let shown = 0;
      cards.forEach((c) => {
        const on = cat === 'all' || c.getAttribute('data-cat') === cat;
        c.hidden = !on;
        if (on) shown++;
      });
      chips.forEach((c) => c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === cat)));
      if (count) count.textContent = 'Showing ' + plural(shown, 'job') + (cat === 'all' ? '' : ' in ' + CATEGORIES[cat]);
      if (push) {
        const url = new URL(window.location.href);
        if (cat === 'all') url.searchParams.delete('cat'); else url.searchParams.set('cat', cat);
        window.history.replaceState(null, '', url);
      }
    };
    chips.forEach((c) => c.addEventListener('click', () => apply(c.getAttribute('data-filter'), true)));
    const start = params.get('cat');
    apply(hasOwn(CATEGORIES, start) ? start : 'all', false);
  }

  /* ------------------------------------------------------------------
   * 9. Price checker
   * ------------------------------------------------------------------ */
  const checker = $('[data-price-checker]');
  if (checker) {
    const saved = store.get(STORE_QUOTE);
    const state = { service: 'full', fuel: 'petrol', engine: 'mid', mot: false };
    // Saved choices, then URL parameters (?service=full&fuel=diesel&engine=mid&mot=1) win.
    const take = (src) => {
      if (!src) return;
      if (hasOwn(SERVICE_TYPES, src.service)) state.service = src.service;
      if (hasOwn(FUELS, src.fuel)) state.fuel = src.fuel;
      if (hasOwn(ENGINE_BANDS, src.engine)) state.engine = src.engine;
      if (typeof src.mot === 'boolean') state.mot = src.mot;
    };
    if (saved && typeof saved === 'object' && !Array.isArray(saved)) take(saved);
    if (params.has('service') || params.has('fuel') || params.has('engine') || params.has('mot')) {
      take({ service: params.get('service'), fuel: params.get('fuel'), engine: params.get('engine'), mot: params.has('mot') ? params.get('mot') === '1' : undefined });
    }

    const out = {
      total: $('[data-quote-total]'), label: $('[data-quote-label]'), lines: $('[data-quote-lines]'),
      list: $('[data-quote-included]'), count: $('[data-quote-count]'), time: $('[data-quote-time]'),
      book: $('[data-quote-book]'), summary: $('[data-quote-summary]'), motWrap: $('[data-mot-addon]'),
      engineNote: $('[data-engine-note]')
    };

    function priceFor(s) {
      const t = SERVICE_TYPES[s.service];
      if (typeof t.price === 'number') return t.price;
      const row = t.price[s.fuel];
      return typeof row === 'number' ? row : row[['small', 'mid', 'large'].indexOf(s.engine)];
    }
    function render() {
      const engineless = state.fuel === 'electric' || state.service === 'mot';
      $$('input[name="engine"]', checker).forEach((r) => { r.disabled = engineless; r.checked = r.value === state.engine; });
      $$('input[name="service"]', checker).forEach((r) => { r.checked = r.value === state.service; });
      $$('input[name="fuel"]', checker).forEach((r) => { r.checked = r.value === state.fuel; });
      out.engineNote.textContent = state.service === 'mot' ? 'The inspection costs the same for every car.' : state.fuel === 'electric' ? 'Electric cars have one price: no engine size.' : '';
      const withMot = state.mot && state.service !== 'mot';
      out.motWrap.hidden = state.service === 'mot';
      $('input[name="mot"]', checker).checked = state.mot;

      const t = SERVICE_TYPES[state.service];
      const base = priceFor(state);
      const total = base + (withMot ? MOT_WITH_SERVICE : 0);
      out.total.textContent = money(total);
      const what = t.name + (state.service === 'mot' ? '' : ' · ' + FUELS[state.fuel] + (state.fuel === 'electric' ? '' : ' · ' + ENGINE_BANDS[state.engine].toLowerCase()));
      out.summary.textContent = what + (withMot ? ' + inspection' : '');
      out.label.textContent = 'Guide price for ' + t.name.toLowerCase() + (withMot ? ' and inspection' : '') + '. No NH sales tax.';
      let lines = '<div class="spec-row"><dt>' + esc(t.name) + '</dt><dd class="gauge">' + money(base) + '</dd></div>';
      if (withMot) lines += '<div class="spec-row"><dt>Inspection with a service (save ' + money(SERVICE_TYPES.mot.price - MOT_WITH_SERVICE) + ')</dt><dd class="gauge">' + money(MOT_WITH_SERVICE) + '</dd></div>';
      out.lines.innerHTML = lines;

      const items = INCLUDED.filter((x) => x.fuels.indexOf(state.fuel) !== -1 && (x.levels.indexOf(state.service) !== -1 || (withMot && x.levels.indexOf('mot') !== -1)));
      out.list.innerHTML = items.map((x) => '<li>' + esc(x.t) + '</li>').join('');
      out.count.textContent = plural(items.length, 'item') + ' included';
      const fuelKey = state.fuel === 'electric' ? 'electric' : 'engine';
      out.time.textContent = 'About ' + duration(t.mins[fuelKey] + (withMot ? SERVICE_TYPES.mot.mins[fuelKey] : 0)) + ' in the shop';
      out.book.href = 'book.html?service=' + state.service + (withMot ? ',mot' : '');
      store.set(STORE_QUOTE, state);
    }
    checker.addEventListener('change', (e) => {
      const el = e.target;
      if (el.name === 'service' && hasOwn(SERVICE_TYPES, el.value)) state.service = el.value;
      if (el.name === 'fuel' && hasOwn(FUELS, el.value)) state.fuel = el.value;
      if (el.name === 'engine' && hasOwn(ENGINE_BANDS, el.value)) state.engine = el.value;
      if (el.name === 'mot') state.mot = el.checked;
      render();
    });
    render();
  }

  /* ------------------------------------------------------------------
   * 10. Booking request
   * ------------------------------------------------------------------ */
  const booking = $('[data-booking]');
  if (booking) {
    const form = booking;
    const now = nowLondon();
    const first = firstBookable(now), last = lastBookable(now);
    const state = { date: null, slot: null, focus: null };
    const cal = $('[data-cal]', form), slotsBox = $('[data-slots]', form), slotNote = $('[data-slot-note]', form);
    const regInput = $('[name="reg"]', form), regNote = $('[data-reg-note]', form);

    // Prefill from ?service=mot,full and ?reg=2941086
    (params.get('service') || '').split(',').forEach((id) => {
      if (!hasOwn(JOBS, id)) return;
      const box = $('input[name="jobs"][value="' + id + '"]', form);
      if (box) box.checked = true;
    });
    const preReg = parsePlate(params.get('reg') || '');
    if (preReg.ok) regInput.value = preReg.text;

    const chosenJobs = () => $$('input[name="jobs"]:checked', form).map((i) => i.value).filter((id) => hasOwn(JOBS, id));
    const hasService = (ids) => ids.some((id) => JOBS[id].level);
    function jobPrice(id, ids) { return id === 'mot' && hasService(ids) ? MOT_WITH_SERVICE : JOBS[id].price; }
    const totalMins = (ids) => ids.reduce((s, id) => s + JOBS[id].mins, 0);

    function paintReg() {
      const p = parsePlate(regInput.value);
      regNote.textContent = p.ok && regInput.value.trim() ? 'Looks good: ' + p.text + '.' : 'Plate number, spaces optional.';
      return p;
    }
    regInput.addEventListener('input', paintReg);

    // Only one service level at a time (basic, full or major)
    $$('input[name="jobs"]', form).forEach((box) => {
      box.addEventListener('change', () => {
        if (box.checked && JOBS[box.value] && JOBS[box.value].level) {
          $$('input[name="jobs"]', form).forEach((o) => { if (o !== box && JOBS[o.value] && JOBS[o.value].level) o.checked = false; });
        }
        paintTransport();
        paintSummary();
      });
    });

    function paintSummary() {
      const ids = chosenJobs();
      const list = $('[data-summary-jobs]', form);
      list.innerHTML = ids.length ? ids.map((id) => {
        const price = jobPrice(id, ids);
        return '<li class="flex justify-between gap-3 border-b border-dashed border-white/20 py-2"><span>' + esc(JOBS[id].name) + '</span><span class="gauge shrink-0">' + (price ? (JOBS[id].from ? 'from ' : '') + money(price) : 'Free check') + '</span></li>';
      }).join('') : '<li class="py-2 text-chrome">No jobs picked yet.</li>';
      const total = ids.reduce((s, id) => s + jobPrice(id, ids), 0);
      const anyFrom = ids.some((id) => JOBS[id].from || JOBS[id].price === 0);
      $('[data-summary-total]', form).textContent = ids.length ? (anyFrom ? 'from ' : '') + money(total) : '$0';
      $('[data-summary-when]', form).textContent = state.date && state.slot ? shortDate(state.date) + ', drop off ' + clock(toMin(state.slot)) : 'Pick a day and drop-off time';
      const transport = $('input[name="transport"]:checked', form);
      $('[data-summary-transport]', form).textContent = transport ? $('[data-transport-name]', transport.parentNode).textContent : '';
      const p = parsePlate(regInput.value);
      const plate = $('[data-summary-plate]', form);
      plate.textContent = p.ok ? p.text : 'YOUR PLATE';
    }

    // Transport: leave the car, wait in the lounge (short jobs only) or a loaner car (if one is free that day)
    function paintTransport() {
      const ids = chosenJobs();
      const waitable = ids.length > 0 && totalMins(ids) <= MAX_WAIT_MINUTES;
      const wait = $('input[name="transport"][value="wait"]', form);
      wait.disabled = !waitable;
      $('[data-wait-note]', form).textContent = waitable ? 'About ' + duration(totalMins(ids)) + '. Wi-Fi, coffee and a couch.' : 'For jobs under ' + duration(MAX_WAIT_MINUTES) + ' in total, like an inspection on its own.';
      const car = $('input[name="transport"][value="courtesy"]', form);
      const left = state.date ? courtesyLeft(state.date) : null;
      car.disabled = left === 0;
      $('[data-courtesy-note]', form).textContent = left === null ? 'Free. Pick a day to see if one is free. Drivers 21+ with a valid license.'
        : left === 0 ? 'No loaner cars left on ' + shortDate(state.date) + '. Try another day, or we can give you a ride downtown.'
          : plural(left, 'loaner car') + ' left on ' + shortDate(state.date) + '. Free; drivers 21+ with a valid license.';
      if ((wait.disabled && wait.checked) || (car.disabled && car.checked)) $('input[name="transport"][value="leave"]', form).checked = true;
    }
    $$('input[name="transport"]', form).forEach((r) => r.addEventListener('change', paintSummary));

    // Calendar: from the Monday of this week to the Sunday after the last bookable day
    function dayInfo(key) {
      if (key < first) return { open: false, label: key === now.key ? 'Today' : 'Past', why: key === now.key ? 'today: call us for same-day work' : 'in the past' };
      const reason = closedReason(key);
      if (reason) return { open: false, closed: true, label: 'Closed', why: reason + ', closed' };
      if (!HOURS[weekday(key)]) return { open: false, closed: true, label: 'Closed', why: 'closed on Sundays' };
      if (key > last) return { open: false, label: '', why: 'not open for booking yet' };
      const free = slotsOn(key).filter((s) => !s.taken).length;
      if (!free) return { open: false, label: 'Full', why: 'fully booked' };
      return { open: true, label: plural(free, 'slot'), why: plural(free, 'drop-off slot') + ' free' };
    }
    let startKey = now.key;
    while (weekday(startKey) !== 1) startKey = addDays(startKey, -1);
    let endKey = last;
    while (weekday(endKey) !== 0) endKey = addDays(endKey, 1);

    function renderCal() {
      let html = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => '<div class="cal-head" aria-hidden="true">' + d + '</div>').join('');
      for (let k = startKey; k <= endKey; k = addDays(k, 1)) {
        const info = dayInfo(k);
        const d = dateOfKey(k).getUTCDate();
        const month = d === 1 || k === startKey ? MONTH[dateOfKey(k).getUTCMonth()] : '';
        // The name starts with what the day shows ("20, 5 slots"), then says it in full.
        const shown = (month ? month + ' ' : '') + d + (info.label ? ', ' + info.label : '');
        html += '<button type="button" class="cal-day" data-day="' + k + '"' +
          (info.open ? ' data-open' : ' aria-disabled="true"') + (info.closed ? ' data-closed' : '') + (k === now.key ? ' data-today' : '') +
          ' aria-pressed="' + (state.date === k) + '" aria-label="' + esc(shown + ' (' + longDate(k) + ', ' + info.why + ')') + '" tabindex="-1">' +
          (month ? '<span class="font-gauge text-[10px] font-semibold uppercase leading-none tracking-wider">' + month + '</span> ' : '') +
          d + ' <small>' + esc(info.label) + '</small></button>';
      }
      cal.innerHTML = html;
      // Roving tabindex: one day in the tab order
      const focusKey = state.focus || state.date || (firstFreeSlot(now) || { key: first }).key;
      const target = $('[data-day="' + focusKey + '"]', cal) || $('[data-open]', cal);
      if (target) target.tabIndex = 0;
    }
    function moveFocus(key) {
      if (key < startKey || key > endKey) return;
      state.focus = key;
      $$('.cal-day', cal).forEach((b) => { b.tabIndex = b.getAttribute('data-day') === key ? 0 : -1; });
      const b = $('[data-day="' + key + '"]', cal);
      if (b) b.focus();
    }
    cal.addEventListener('click', (e) => {
      const b = e.target.closest('.cal-day');
      if (!b) return;
      if (b.getAttribute('aria-disabled') === 'true') {
        slotNote.textContent = 'You can’t book ' + longDate(b.getAttribute('data-day')) + ': ' + dayInfo(b.getAttribute('data-day')).why + '.';
        return;
      }
      pickDate(b.getAttribute('data-day'));
    });
    cal.addEventListener('keydown', (e) => {
      const b = e.target.closest('.cal-day');
      if (!b) return;
      const key = b.getAttribute('data-day');
      const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[e.key];
      if (step) { e.preventDefault(); moveFocus(addDays(key, step)); }
      else if (e.key === 'Home') { e.preventDefault(); moveFocus(addDays(key, -((weekday(key) + 6) % 7))); }
      else if (e.key === 'End') { e.preventDefault(); moveFocus(addDays(key, 6 - ((weekday(key) + 6) % 7))); }
    });

    function pickDate(key) {
      state.date = key; state.focus = key;
      if (state.slot && !slotsOn(key).some((s) => s.time === state.slot && !s.taken)) state.slot = null;
      renderCal();
      renderSlots();
      setError(form, 'date', '');
      paintTransport();
      paintSummary();
      const b = $('[data-day="' + key + '"]', cal);
      if (b) b.focus();
    }
    function renderSlots() {
      if (!state.date) {
        slotsBox.innerHTML = '';
        slotNote.textContent = 'Pick a day to see drop-off times.';
        return;
      }
      const slots = slotsOn(state.date);
      const free = slots.filter((s) => !s.taken).length;
      slotNote.textContent = longDate(state.date) + ': ' + plural(free, 'drop-off time') + ' free. Pickup is usually the same afternoon.';
      slotsBox.innerHTML = slots.map((s) => '<button type="button" class="slot" data-slot="' + s.time + '" aria-pressed="' + (state.slot === s.time) + '"' + (s.taken ? ' disabled' : '') + '>' +
        clock(toMin(s.time)) + (s.taken ? '<span class="sr-only"> (taken)</span>' : '') + '</button>').join('');
    }
    slotsBox.addEventListener('click', (e) => {
      const b = e.target.closest('[data-slot]');
      if (!b || b.disabled) return;
      state.slot = b.getAttribute('data-slot');
      $$('[data-slot]', slotsBox).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      setError(form, 'date', '');
      paintSummary();
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ids = chosenJobs();
      const p = parsePlate(regInput.value);
      let ok = true;
      ok = setError(form, 'reg', !regInput.value.trim() ? 'Enter your license plate.' : p.ok ? '' : 'That doesn’t look like a license plate. Use 2 to 8 letters and numbers, like 294 1086.') && ok;
      ok = setError(form, 'jobs', ids.length ? '' : 'Pick at least one job.') && ok;
      const notes = $('[name="notes"]', form).value.trim();
      ok = setError(form, 'notes', ids.indexOf('fault') !== -1 && notes.length < 10 ? 'Tell us a little about the fault or noise (at least 10 characters).' : '') && ok;
      const dateMsg = !state.date ? 'Pick a drop-off day.' : !state.slot ? 'Pick a drop-off time on ' + shortDate(state.date) + '.' : '';
      const dateErr = $('[data-error="date"]', form);
      dateErr.textContent = dateMsg;
      if (dateMsg) ok = false;
      const name = $('[name="name"]', form).value.trim();
      ok = setError(form, 'name', name ? '' : 'Enter your name.') && ok;
      const phone = $('[name="phone"]', form).value.replace(/[\s().-]/g, '');
      ok = setError(form, 'phone', US_PHONE.test(phone) ? '' : 'Enter a US phone number, like (603) 555-0137.') && ok;
      const email = $('[name="email"]', form).value.trim();
      ok = setError(form, 'email', EMAIL.test(email) ? '' : 'Enter an email address, like you@example.com.') && ok;
      if (!ok) {
        const bad = $('[aria-invalid="true"]', form);
        if (bad) bad.focus();
        else if (dateMsg) { const target = $('.cal-day[tabindex="0"]', cal) || cal; target.focus(); }
        return;
      }
      // To send this for real, post the form to your endpoint (e.g. Formspree) here:
      // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      const done = $('[data-booking-done]');
      $('[data-done-ref]', done).textContent = 'BC-' + state.date.slice(5).replace('-', '') + '-' + p.compact.slice(-3);
      $('[data-done-when]', done).textContent = longDate(state.date) + ', drop off at ' + clock(toMin(state.slot));
      $('[data-done-plate]', done).textContent = p.text;
      $('[data-done-jobs]', done).textContent = ids.map((id) => JOBS[id].name).join(', ');
      $('[data-done-name]', done).textContent = name.split(/\s+/)[0];
      form.hidden = true;
      done.hidden = false;
      done.focus();
      window.scrollTo({ top: done.getBoundingClientRect().top + window.scrollY - 120, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
    $$('input, textarea', form).forEach((el) => el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') setError(form, el.name, ''); }));

    paintReg();
    renderCal();
    renderSlots();
    paintTransport();
    paintSummary();
  }

  /* ------------------------------------------------------------------
   * 11. Inspection reminder — the shop's suggested yearly schedule, from the last inspection
   *     (or from registering a vehicle that's new to the owner). Dates here are the shop's
   *     suggestion, not a statement of state law; see DOCS.md.
   * ------------------------------------------------------------------ */
  // An inspection is good for a year, through the end of the month: Nov 3, 2025 -> Nov 30, 2026.
  function motDueFromTest(key) { const d = addMonths(key, 12); return addDays(addMonths(d.slice(0, 8) + '01', 1), -1); }
  // A vehicle that's new to its owner: a first inspection within this many days of registering it.
  const FIRST_INSPECTION_DAYS = 10;
  function motDueFromRegistration(key) { return addDays(key, FIRST_INSPECTION_DAYS); }
  // Any day in the month it's due keeps the next one in that month.
  function earliestKeepDate(due) { return due.slice(0, 8) + '01'; }

  function readReminders() {
    const raw = store.get(STORE_REMINDERS);
    if (!Array.isArray(raw)) return [];
    const seen = Object.create(null);
    const list = [];
    raw.forEach((r) => {
      if (!r || typeof r !== 'object') return;
      const p = parsePlate(r.reg);
      if (!p.ok || seen[p.compact] || !validKey(r.due) || !hasOwn(REMINDER_LEADS, String(r.lead)) || !hasOwn(REMINDER_VIA, r.via)) return;
      seen[p.compact] = true;
      list.push({ reg: p.compact, due: r.due, lead: +r.lead, via: r.via });
    });
    return list.slice(0, MAX_REMINDERS);
  }

  const motForm = $('[data-mot-form]');
  if (motForm) {
    const now = nowLondon();
    const result = $('[data-mot-result]');
    const dateInput = $('[name="date"]', motForm);
    dateInput.max = now.key;
    let reminders = readReminders();
    store.set(STORE_REMINDERS, reminders);

    const preReg = parsePlate(params.get('reg') || '');
    if (preReg.ok) $('[name="reg"]', motForm).value = preReg.text;

    const basis = () => ($('input[name="basis"]:checked', motForm) || { value: 'test' }).value;
    function paintBasis() {
      const isTest = basis() === 'test';
      $('[data-date-label]', motForm).textContent = isTest ? 'Date of the last inspection' : 'Date registered';
      $('[data-date-hint]', motForm).textContent = isTest ? 'It’s on your last inspection report, or on the sticker if your vehicle has one.' : 'It’s on your registration certificate. We suggest a first inspection within ' + FIRST_INSPECTION_DAYS + ' days.';
    }
    function dateProblem(key) {
      if (!key) return 'Enter a date.';
      if (!validKey(key)) return 'Enter a real date.';
      if (key > now.key) return 'That date is in the future.';
      if (basis() === 'test' && key < addMonths(now.key, -36)) return 'That’s over three years ago. If it hasn’t been inspected since, it’s overdue: call us at ' + GARAGE.phone + '.';
      if (basis() === 'reg' && motDueFromRegistration(key) < addMonths(now.key, -12)) return 'That’s over a year ago, so go by the last inspection instead. Choose “Date of the last inspection”.';
      return '';
    }
    function compute() {
      const key = dateInput.value;
      if (dateProblem(key)) return null;
      const due = basis() === 'test' ? motDueFromTest(key) : motDueFromRegistration(key);
      const lead = +($('[name="lead"]', motForm).value);
      return { from: key, due: due, days: daysBetween(now.key, due), earliest: basis() === 'test' ? earliestKeepDate(due) : key, remind: addDays(due, -(hasOwn(REMINDER_LEADS, String(lead)) ? lead : 14)) };
    }
    function stateOf(days) { return days < 0 ? 'overdue' : days <= DUE_SOON_DAYS ? 'soon' : 'ok'; }
    function countdown(days) {
      if (days === 0) return 'Due today';
      if (days < 0) return 'Overdue by ' + plural(-days, 'day');
      return plural(days, 'day') + ' to go';
    }

    function paintResult() {
      const r = compute();
      result.hidden = !r;
      $('[data-mot-empty]').hidden = !!r;
      if (!r) return;
      const st = stateOf(r.days);
      const badge = $('[data-mot-state]', result);
      badge.setAttribute('data-state', st);
      badge.textContent = st === 'overdue' ? 'Overdue' : st === 'soon' ? 'Due soon' : 'In date';
      $('[data-mot-due]', result).textContent = longDate(r.due);
      $('[data-mot-countdown]', result).textContent = countdown(r.days);
      const earliestPast = r.earliest <= now.key;
      $('[data-mot-earliest]', result).textContent = r.days < 0 ? 'Book an inspection as soon as you can.'
        : basis() !== 'test' ? 'Book any day up to ' + dayMonth(r.due) + '.'
          : earliestPast ? 'You can book now and keep ' + dayMonth(r.due) + ' as your due date.'
            : 'Come in from ' + longDate(r.earliest) + ' to keep ' + dayMonth(r.due) + ' as your due date.';
      $('[data-mot-remind]', result).textContent = r.remind <= now.key ? 'The reminder date has passed: book now.' : 'Reminder on ' + longDate(r.remind) + '.';
      $('[data-mot-warning]', result).hidden = r.days >= 0;
      const p = parsePlate($('[name="reg"]', motForm).value);
      $('[data-mot-book]', result).href = 'book.html?service=mot' + (p.ok ? '&reg=' + encodeURIComponent(p.compact) : '');
      // Timeline: from the last inspection (or registration) to the due date, with today marked
      const span = Math.max(1, daysBetween(r.from, r.due));
      const pos = (k) => Math.max(0, Math.min(100, (daysBetween(r.from, k) / span) * 100));
      $('[data-tl-today]', result).style.left = pos(now.key) + '%';
      $('[data-tl-window]', result).style.left = pos(r.earliest) + '%';
      $('[data-tl-window]', result).style.right = '0%';
      $('[data-tl-from]', result).textContent = (basis() === 'test' ? 'Inspected ' : 'Registered ') + shortDate(r.from) + ', ' + r.from.slice(0, 4);
      $('[data-tl-to]', result).textContent = 'Due ' + shortDate(r.due) + ', ' + r.due.slice(0, 4);
    }

    function paintList() {
      const wrap = $('[data-reminders]');
      const n = reminders.length;
      $('[data-reminder-count]').textContent = plural(n, 'reminder');
      $('[data-reminders-empty]').hidden = n > 0;
      wrap.innerHTML = reminders.map((r) => {
        const days = daysBetween(now.key, r.due), st = stateOf(days), p = parsePlate(r.reg);
        return '<li class="card flex flex-wrap items-center gap-x-5 gap-y-3 p-4">' +
          '<span class="plate text-2xl"><span class="plate-text">' + esc(p.text) + '</span></span>' +
          '<div class="min-w-0 flex-1"><p class="font-semibold">Inspection due ' + esc(longDate(r.due)) + '</p>' +
          '<p class="text-sm text-steel">' + esc(countdown(days)) + ' · reminder by ' + esc(REMINDER_VIA[r.via]) + ', ' + esc(REMINDER_LEADS[r.lead]) + '</p></div>' +
          '<span class="mot-status" data-state="' + st + '">' + (st === 'overdue' ? 'Overdue' : st === 'soon' ? 'Due soon' : 'In date') + '</span>' +
          '<button type="button" class="btn-line btn-sm" data-remove="' + esc(r.reg) + '">Remove<span class="sr-only"> reminder for ' + esc(p.text) + '</span></button></li>';
      }).join('');
    }
    $('[data-reminders]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-remove]');
      if (!b) return;
      const reg = b.getAttribute('data-remove');
      reminders = reminders.filter((r) => r.reg !== reg);
      store.set(STORE_REMINDERS, reminders);
      paintList();
      $('[data-reminder-status]').textContent = 'Reminder for ' + parsePlate(reg).text + ' removed.';
    });

    function paintVia() {
      const via = ($('input[name="via"]:checked', motForm) || { value: 'email' }).value;
      $('[data-via-email]', motForm).hidden = via !== 'email';
      $('[data-via-text]', motForm).hidden = via !== 'text';
    }

    motForm.addEventListener('change', (e) => {
      if (e.target.name === 'basis') { paintBasis(); if (dateInput.value) setError(motForm, 'date', dateProblem(dateInput.value)); }
      if (e.target.name === 'via') paintVia();
      if (e.target.name === 'date') setError(motForm, 'date', dateProblem(dateInput.value));
      paintResult();
    });
    dateInput.addEventListener('input', paintResult);

    motForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const p = parsePlate($('[name="reg"]', motForm).value);
      let ok = setError(motForm, 'reg', !$('[name="reg"]', motForm).value.trim() ? 'Enter your license plate.' : p.ok ? '' : 'That doesn’t look like a license plate. Use 2 to 8 letters and numbers, like 294 1086.');
      ok = setError(motForm, 'date', dateProblem(dateInput.value)) && ok;
      const via = ($('input[name="via"]:checked', motForm) || { value: 'email' }).value;
      if (via === 'email') {
        ok = setError(motForm, 'email', EMAIL.test($('[name="email"]', motForm).value.trim()) ? '' : 'Enter an email address, like you@example.com.') && ok;
        setError(motForm, 'mobile', '');
      } else {
        const mob = $('[name="mobile"]', motForm).value.replace(/[\s().-]/g, '');
        ok = setError(motForm, 'mobile', US_PHONE.test(mob) ? '' : 'Enter a US cell number, like (603) 555-0137.') && ok;
        setError(motForm, 'email', '');
      }
      if (!ok) { focusFirstError(motForm); return; }
      const r = compute();
      const lead = +$('[name="lead"]', motForm).value;
      const entry = { reg: p.compact, due: r.due, lead: hasOwn(REMINDER_LEADS, String(lead)) ? lead : 14, via: via };
      reminders = [entry].concat(reminders.filter((x) => x.reg !== p.compact)).slice(0, MAX_REMINDERS);
      // To send real reminders, post the details to your endpoint here (e.g. Formspree or your CRM).
      // This demo only keeps them in this browser (localStorage).
      store.set(STORE_REMINDERS, reminders);
      paintList();
      $('[data-reminder-status]').textContent = 'Saved: ' + p.text + ', inspection due ' + longDate(r.due) + '. ' +
        (r.remind > now.key ? 'We’ll remind you by ' + REMINDER_VIA[via] + ' on ' + longDate(r.remind) + '.' : 'That’s soon, so book your inspection now.');
    });

    paintBasis();
    paintVia();
    paintResult();
    paintList();
  }

  /* ------------------------------------------------------------------
   * 12. Reviews — relative dates, rating breakdown, filter and sort
   * ------------------------------------------------------------------ */
  function ago(days) {
    if (days <= 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return days + ' days ago';
    if (days < 30) return plural(Math.floor(days / 7), 'week') + ' ago';
    if (days < 365) return plural(Math.floor(days / 30), 'month') + ' ago';
    return plural(Math.floor(days / 365), 'year') + ' ago';
  }
  const todayKey = nowLondon().key;
  $$('[data-days-ago]').forEach((el) => {
    const n = Math.max(0, parseInt(el.getAttribute('data-days-ago'), 10) || 0);
    el.textContent = ago(n);
    el.setAttribute('datetime', addDays(todayKey, -n));
  });

  const reviewsRoot = $('[data-reviews]');
  if (reviewsRoot) {
    const items = $$('[data-review]', reviewsRoot);
    const rating = (el) => +el.getAttribute('data-rating');
    // Breakdown bars
    $$('[data-breakdown]').forEach((row) => {
      const star = +row.getAttribute('data-breakdown');
      const n = items.filter((el) => rating(el) === star).length;
      $('[data-breakdown-fill]', row).style.width = (items.length ? (n / items.length) * 100 : 0) + '%';
      $('[data-breakdown-count]', row).textContent = n;
    });
    const avg = items.reduce((s, el) => s + rating(el), 0) / (items.length || 1);
    $$('[data-review-avg]').forEach((el) => { el.textContent = avg.toFixed(1); });

    const filterSel = $('[data-review-filter]'), sortSel = $('[data-review-sort]'), count = $('[data-review-count]');
    const original = items.slice();
    function apply() {
      const f = filterSel.value, s = sortSel.value;
      let list = original.slice();
      if (s === 'highest') list.sort((a, b) => rating(b) - rating(a) || +a.querySelector('[data-days-ago]').getAttribute('data-days-ago') - +b.querySelector('[data-days-ago]').getAttribute('data-days-ago'));
      if (s === 'lowest') list.sort((a, b) => rating(a) - rating(b));
      let shown = 0;
      list.forEach((el) => {
        const on = f === 'all' || el.getAttribute('data-service') === f;
        el.hidden = !on;
        if (on) shown++;
        reviewsRoot.appendChild(el);
      });
      count.textContent = 'Showing ' + plural(shown, 'review');
      $('[data-reviews-empty]').hidden = shown > 0;
    }
    filterSel.addEventListener('change', apply);
    sortSel.addEventListener('change', apply);
    apply();
  }

  /* ------------------------------------------------------------------
   * 13. FAQ — live search (?q= prefills it)
   * ------------------------------------------------------------------ */
  const faqSearch = $('[data-faq-search]');
  if (faqSearch) {
    const items = $$('[data-faq]');
    const groups = $$('[data-faq-group]');
    const count = $('[data-faq-count]');
    items.forEach((it) => {
      $$('[data-faq-text]', it).forEach((el) => { el.setAttribute('data-original', el.innerHTML); });
    });
    const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Restore the original markup, then wrap matches in <mark> inside text nodes only.
    function highlight(el, re) {
      el.innerHTML = el.getAttribute('data-original');
      if (!re) return;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach((node) => {
        const text = node.nodeValue;
        re.lastIndex = 0;
        if (!re.test(text)) return;
        re.lastIndex = 0;
        const frag = document.createDocumentFragment();
        let last = 0, m;
        while ((m = re.exec(text))) {
          if (m.index > last) frag.appendChild(document.createTextNode(text.slice(last, m.index)));
          const mark = document.createElement('mark');
          mark.textContent = m[0];
          frag.appendChild(mark);
          last = m.index + m[0].length;
          if (!m[0].length) re.lastIndex++;
        }
        if (last < text.length) frag.appendChild(document.createTextNode(text.slice(last)));
        node.parentNode.replaceChild(frag, node);
      });
    }
    function run() {
      const q = faqSearch.value.trim().toLowerCase();
      const words = q.split(/\s+/).filter(Boolean);
      const re = words.length ? new RegExp('(' + words.map(escapeRe).join('|') + ')', 'gi') : null;
      let shown = 0;
      items.forEach((it) => {
        const text = it.textContent.toLowerCase();
        const on = words.every((w) => text.indexOf(w) !== -1);
        it.hidden = !on;
        if (on) shown++;
        $$('[data-faq-text]', it).forEach((el) => highlight(el, on ? re : null));
        if (on && words.length && it.tagName === 'DETAILS') it.open = true;
      });
      groups.forEach((g) => { g.hidden = !$$('[data-faq]', g).some((it) => !it.hidden); });
      count.textContent = words.length ? plural(shown, 'question') + (shown === 1 ? ' matches “' : ' match “') + faqSearch.value.trim() + '”' : plural(items.length, 'question');
      $('[data-faq-empty]').hidden = shown > 0;
    }
    faqSearch.addEventListener('input', run);
    $('[data-faq-clear]').addEventListener('click', () => { faqSearch.value = ''; run(); faqSearch.focus(); });
    const q = params.get('q');
    if (q) faqSearch.value = q.slice(0, 80);
    run();
  }

  /* ------------------------------------------------------------------
   * 14. Contact form
   * ------------------------------------------------------------------ */
  const contact = $('[data-contact-form]');
  if (contact) {
    const TOPICS = { booking: true, quote: true, mot: true, collection: true, other: true };
    const topic = params.get('topic');
    if (hasOwn(TOPICS, topic)) $('[name="topic"]', contact).value = topic;
    contact.addEventListener('submit', (e) => {
      e.preventDefault();
      let ok = setError(contact, 'name', $('[name="name"]', contact).value.trim() ? '' : 'Enter your name.');
      ok = setError(contact, 'email', EMAIL.test($('[name="email"]', contact).value.trim()) ? '' : 'Enter an email address, like you@example.com.') && ok;
      const regVal = $('[name="reg"]', contact).value.trim();
      ok = setError(contact, 'reg', !regVal || parsePlate(regVal).ok ? '' : 'That doesn’t look like a license plate. Leave it blank if you’re not sure.') && ok;
      ok = setError(contact, 'message', $('[name="message"]', contact).value.trim().length >= 10 ? '' : 'Write a short message (at least 10 characters).') && ok;
      if (!ok) { focusFirstError(contact); return; }
      // Connect a real endpoint here, e.g. Formspree:
      // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(contact), headers: { Accept: 'application/json' } })
      contact.hidden = true;
      const done = $('[data-contact-done]');
      // A short reference, like BC-7K2Q (no 0/O or 1/I to misread).
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let ref = 'BC-';
      for (let i = 0; i < 4; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
      $$('[data-ref]', done).forEach((el) => { el.textContent = ref; });
      done.hidden = false;
      done.focus();
    });
    $$('input, textarea', contact).forEach((el) => el.addEventListener('input', () => { if (el.getAttribute('aria-invalid') === 'true') setError(contact, el.name, ''); }));
  }

  // Footer year
  $$('[data-year]').forEach((el) => { el.textContent = nowLondon().key.slice(0, 4); });
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
