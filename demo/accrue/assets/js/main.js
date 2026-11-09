/* Fernley Whitcomb CPAs (Accrue template) — all template behavior. Vanilla, no dependencies.
 * Content and settings live in assets/js/data.js (window.ACCRUE); this file reads them.
 *
 *  1. Helpers         DOM, storage, money, plurals, hashing
 *  2. Dates           Eastern time "now" (with ?now= preview), date keys, US formats
 *  3. Holidays        federal holidays, DC Emancipation Day, Good Friday, office closures — by rule
 *  4. Deadlines       the tax calendar for any year, moved to the next business day
 *  5. Header          sticky header, accessible mobile menu, reveal on scroll
 *  6. Next deadline   the top bar on every page and the home page teaser
 *  7. Deadlines page  filters, year switch, countdown, holiday list
 *  8. Checklist       tax-season document checklist (saved)
 *  9. Services        services grid and service.html?s=<slug>
 * 10. Estimator       fee estimator on pricing.html
 * 11. Insights        article list with category filter, article.html?a=<slug>
 * 12. Booking         consultation slots and request form on contact.html
 * 13. Footer year
 * 14. Back to top     (separate block at the end of the file)
 */
(function () {
  'use strict';

  const D = window.ACCRUE;
  if (!D) return;

  /* ------------------------------------------------------------------
   * 1. Helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const params = new URLSearchParams(window.location.search);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const page = document.body.getAttribute('data-page') || '';

  // localStorage, or an in-memory stand-in when the browser blocks it (a sandboxed iframe, strict
  // privacy settings): saved checks then last for this page view instead of the feature doing nothing.
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
  const STORE_CHECKLIST = 'accrue:checklist';

  // Values from the URL or storage must be the data's own keys, so ?s=constructor matches nothing.
  const hasOwn = (obj, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, one, many) => n.toLocaleString('en-US') + ' ' + (n === 1 ? one : (many || one + 's'));
  const money = (n) => '$' + Math.round(n).toLocaleString('en-US');
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));
  function intParam(name, lo, hi, fallback) {
    const raw = params.get(name);
    if (raw === null || !/^\d{1,5}$/.test(raw)) return fallback;
    return clamp(parseInt(raw, 10), lo, hi);
  }

  // Deterministic pseudo-random numbers (FNV-1a + mix): demo availability stays the same for a given day.
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    h ^= h >>> 16; h = Math.imul(h, 2246822507) >>> 0;
    h ^= h >>> 13; h = Math.imul(h, 3266489909) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
  }

  function setError(form, name, msg) {
    const el = $('[data-error="' + name + '"]', form);
    if (el) el.textContent = msg || '';
    $$('[name="' + name + '"]', form).forEach((input) => {
      if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    });
    return !msg;
  }

  /* ------------------------------------------------------------------
   * 2. Dates — calendar dates are "YYYY-MM-DD" keys, worked out in UTC so clock changes never
   *    shift a day. "Now" is the wall clock in Chattanooga (America/New_York).
   * ------------------------------------------------------------------ */
  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const keyOf = (y, m, d) => y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  function dateOfKey(key) { const p = key.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12)); }
  const keyOfDate = (d) => keyOf(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  function addDays(key, n) { const d = dateOfKey(key); d.setUTCDate(d.getUTCDate() + n); return keyOfDate(d); }
  const weekday = (key) => dateOfKey(key).getUTCDay();
  const yearOf = (key) => +key.slice(0, 4);
  const daysBetween = (a, b) => Math.round((dateOfKey(b) - dateOfKey(a)) / 86400000);
  function validKey(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const p = s.split('-');
    return +p[1] >= 1 && +p[1] <= 12 && keyOfDate(dateOfKey(s)) === s;
  }
  // "Mon, Nov 2" · "Monday, November 2, 2026" · "November 2"
  const shortDate = (key) => { const d = dateOfKey(key); return DAY[d.getUTCDay()] + ', ' + MONTH[d.getUTCMonth()] + ' ' + d.getUTCDate(); };
  const longDate = (key) => { const d = dateOfKey(key); return DAY_LONG[d.getUTCDay()] + ', ' + MONTH_LONG[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(); };
  const pubDate = (key) => { const d = dateOfKey(key); return MONTH[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(); };
  // Minutes after midnight to US clock times: "9:00 AM", "1:00 PM".
  function clock(min) {
    const h = Math.floor(min / 60) % 24, m = min % 60;
    return (h % 12 || 12) + ':' + String(m).padStart(2, '0') + ' ' + (h < 12 ? 'AM' : 'PM');
  }
  const toMin = (hhmm) => { const p = hhmm.split(':'); return +p[0] * 60 + +p[1]; };

  const tzParts = new Intl.DateTimeFormat('en-US', { timeZone: D.FIRM.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  // ?now=2027-04-14T16:30 previews the whole site at that Eastern date and time.
  const NOW_PARAM = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(params.get('now') || '');
  const previewing = !!(NOW_PARAM && validKey(NOW_PARAM[1]) && +NOW_PARAM[2] < 24 && +NOW_PARAM[3] < 60);
  function nowET() {
    if (previewing) return { key: NOW_PARAM[1], mins: +NOW_PARAM[2] * 60 + +NOW_PARAM[3] };
    const o = {};
    tzParts.formatToParts(new Date()).forEach((p) => { o[p.type] = p.value; });
    return { key: keyOf(+o.year, +o.month, +o.day), mins: (+o.hour % 24) * 60 + +o.minute };
  }

  /* ------------------------------------------------------------------
   * 3. Holidays — worked out for any year, never a list of dates.
   *    Fixed-date holidays on a Saturday are observed the Friday before, on a Sunday the Monday after.
   * ------------------------------------------------------------------ */
  function observed(key) {
    const w = weekday(key);
    return w === 6 ? addDays(key, -1) : w === 0 ? addDays(key, 1) : key;
  }
  function nthWeekday(y, m, dow, n) {
    let k = keyOf(y, m, 1);
    while (weekday(k) !== dow) k = addDays(k, 1);
    return addDays(k, 7 * (n - 1));
  }
  function lastWeekday(y, m, dow) {
    let k = addDays(m === 12 ? keyOf(y + 1, 1, 1) : keyOf(y, m + 1, 1), -1);
    while (weekday(k) !== dow) k = addDays(k, -1);
    return k;
  }
  function easter(y) {
    const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
    const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
    return keyOf(y, Math.floor((h + l - 7 * m + 114) / 31), ((h + l - 7 * m + 114) % 31) + 1);
  }
  const holidayCache = Object.create(null);
  // Every holiday the site knows for a year: [{ id, name, key }] in date order.
  function holidays(y) {
    if (holidayCache[y]) return holidayCache[y];
    const thanksgiving = nthWeekday(y, 11, 4, 4);
    const list = [
      { id: 'newYear', name: 'New Year’s Day', key: observed(keyOf(y, 1, 1)) },
      { id: 'mlk', name: 'Martin Luther King Jr. Day', key: nthWeekday(y, 1, 1, 3) },
      { id: 'washington', name: 'Washington’s Birthday', key: nthWeekday(y, 2, 1, 3) },
      { id: 'goodFriday', name: 'Good Friday', key: addDays(easter(y), -2) },
      { id: 'emancipation', name: 'DC Emancipation Day', key: observed(keyOf(y, 4, 16)) },
      { id: 'memorial', name: 'Memorial Day', key: lastWeekday(y, 5, 1) },
      { id: 'juneteenth', name: 'Juneteenth', key: observed(keyOf(y, 6, 19)) },
      { id: 'independence', name: 'Independence Day', key: observed(keyOf(y, 7, 4)) },
      { id: 'labor', name: 'Labor Day', key: nthWeekday(y, 9, 1, 1) },
      { id: 'columbus', name: 'Columbus Day', key: nthWeekday(y, 10, 1, 2) },
      { id: 'veterans', name: 'Veterans Day', key: observed(keyOf(y, 11, 11)) },
      { id: 'thanksgiving', name: 'Thanksgiving Day', key: thanksgiving },
      { id: 'dayAfterThanksgiving', name: 'Day after Thanksgiving', key: addDays(thanksgiving, 1) },
      { id: 'christmasEve', name: 'Christmas Eve', key: keyOf(y, 12, 24) },
      { id: 'christmas', name: 'Christmas Day', key: observed(keyOf(y, 12, 25)) }
    ];
    list.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
    holidayCache[y] = list;
    return list;
  }
  // Which holidays move a deadline under each rule (see DEADLINE_RULES in data.js).
  const FEDERAL = ['newYear', 'mlk', 'washington', 'memorial', 'juneteenth', 'independence', 'labor', 'columbus', 'veterans', 'thanksgiving', 'christmas'];
  const HOLIDAY_SETS = {
    federal: FEDERAL.concat(['emancipation']),
    tn: FEDERAL.filter((id) => id !== 'columbus').concat(['goodFriday'])
  };
  // The holiday falling on a date under a set of ids, or null. Looks at next year too, because New
  // Year's Day on a Saturday is observed on December 31.
  function holidayOn(key, ids) {
    const y = yearOf(key);
    const hit = holidays(y).concat(holidays(y + 1)).find((h) => h.key === key && ids.indexOf(h.id) !== -1);
    return hit || null;
  }
  // The office is closed on weekends (except tax-season Saturdays) and on BOOKING.closures.
  function officeClosure(key) {
    const h = holidayOn(key, D.BOOKING.closures);
    return h ? h.name : null;
  }

  /* ------------------------------------------------------------------
   * 4. Deadlines
   * ------------------------------------------------------------------ */
  // The next business day on or after a date: { key, moved, why } where why explains a move.
  function businessDay(key, rule) {
    const ids = HOLIDAY_SETS[rule] || HOLIDAY_SETS.federal;
    let k = key;
    const reasons = [];
    for (let guard = 0; guard < 10; guard++) {
      const w = weekday(k);
      const hol = holidayOn(k, ids);
      if (w !== 0 && w !== 6 && !hol) break;
      if (hol) reasons.push(hol.name + ' on ' + shortDate(k));
      k = addDays(k, 1);
    }
    if (k === key) return { key: k, moved: false, why: '' };
    const w0 = weekday(key);
    const weekend = w0 === 0 || w0 === 6;
    const because = weekend ? 'weekend' + (reasons.length ? ', then ' + reasons.join(', then ') : '') : reasons.join(', then ');
    return { key: k, moved: true, why: 'Moved from ' + shortDate(key) + ': ' + because };
  }
  const deadlineCache = Object.create(null);
  // Every deadline in a calendar year, in date order: { id, key, base, title, short, forms, who, rule, moved, why }.
  function deadlines(y) {
    if (deadlineCache[y]) return deadlineCache[y];
    const list = D.DEADLINE_RULES.map((r, i) => {
      const base = keyOf(y, r.month, r.day);
      const bd = businessDay(base, r.rule);
      const fill = (s) => s.replace(/\{prev\}/g, String(y - 1)).replace(/\{year\}/g, String(y));
      return { id: r.id, order: i, key: bd.key, base, moved: bd.moved, why: bd.why, rule: r.rule, who: r.who, title: fill(r.title), short: r.short, forms: r.forms };
    });
    list.sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : a.order - b.order));
    deadlineCache[y] = list;
    return list;
  }
  const appliesTo = (dl, type) => type === 'all' || dl.who.indexOf(type) !== -1;
  // Deadlines still ahead (today counts until midnight), across this year and next.
  function upcoming(now, type) {
    const y = yearOf(now.key);
    return deadlines(y).concat(deadlines(y + 1)).filter((dl) => dl.key >= now.key && appliesTo(dl, type || 'all'));
  }
  function untilWords(now, key) {
    const n = daysBetween(now.key, key);
    if (n <= 0) return 'today';
    if (n === 1) return 'tomorrow';
    return 'in ' + plural(n, 'day');
  }
  // Time left until 11:59 PM Eastern on the due date, as { days, hours, mins }.
  function timeLeft(now, key) {
    const total = Math.max(0, daysBetween(now.key, key) * 1440 + 1440 - now.mins);
    return { days: Math.floor(total / 1440), hours: Math.floor((total % 1440) / 60), mins: total % 60 };
  }
  const JURISDICTION = { federal: 'IRS', tn: 'Tennessee' };

  /* ------------------------------------------------------------------
   * 5. Header and reveal
   * ------------------------------------------------------------------ */
  const header = $('#site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  const menuBtn = $('#menu-toggle'), menu = $('#mobile-menu');
  function setMenu(open) {
    if (open) menu.style.top = Math.max(0, header.getBoundingClientRect().bottom) + 'px';
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
    $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
    document.body.classList.toggle('menu-is-open', open);
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenu(menu.hidden));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    $$('a', menu).forEach((a) => a.addEventListener('click', () => setMenu(false)));
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => { if (e.matches) setMenu(false); });
  }

  // Reveal on scroll; everything above the fold edge is revealed too, so fast jumps never leave
  // content hidden. Call watchReveal() again after rendering new .reveal elements.
  let io = null;
  const show = (el) => el.classList.add('is-visible');
  function watchReveal(root) {
    const els = $$('.reveal:not(.is-visible)', root);
    if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(show); return; }
    if (!io) {
      io = new IntersectionObserver((entries) => {
        entries.forEach((en) => { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    }
    els.forEach((el, i) => { el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms'; io.observe(el); });
  }
  let revealQueued = false;
  function revealAbove() {
    revealQueued = false;
    const limit = window.innerHeight * 0.92;
    $$('.reveal:not(.is-visible)').forEach((el) => {
      if (el.getBoundingClientRect().top < limit) { show(el); if (io) io.unobserve(el); }
    });
  }
  window.addEventListener('scroll', () => {
    if (revealQueued) return;
    revealQueued = true;
    window.requestAnimationFrame(revealAbove);
  }, { passive: true });
  if (window.location.hash) window.addEventListener('load', revealAbove);

  /* ------------------------------------------------------------------
   * 6. Next deadline: the top bar on every page, and the home page teaser
   * ------------------------------------------------------------------ */
  function paintDateline() {
    const now = nowET();
    const next = upcoming(now, 'all')[0];
    $$('[data-next-deadline]').forEach((el) => {
      el.innerHTML = '<span class="text-sage">Next deadline</span> <strong class="font-semibold text-paper">' + esc(shortDate(next.key)) + '</strong> <span aria-hidden="true">·</span> ' + esc(next.short) + ' <span class="text-marigold">' + esc(untilWords(now, next.key)) + '</span>';
    });
  }
  paintDateline();

  const teaser = $('[data-deadline-teaser]');
  function paintTeaser() {
    if (!teaser) return;
    const now = nowET();
    const list = upcoming(now, 'all').slice(0, 4);
    const first = list[0];
    const left = timeLeft(now, first.key);
    $('[data-teaser-date]', teaser).textContent = longDate(first.key);
    $('[data-teaser-title]', teaser).textContent = first.short;
    $('[data-teaser-detail]', teaser).textContent = first.title + ' (' + first.forms + ')';
    $('[data-teaser-days]', teaser).textContent = String(left.days);
    $('[data-teaser-days-label]', teaser).textContent = left.days === 1 ? 'day' : 'days';
    $('[data-teaser-hours]', teaser).textContent = String(left.hours);
    $('[data-teaser-hours-label]', teaser).textContent = left.hours === 1 ? 'hour' : 'hours';
    const ul = $('[data-teaser-list]', teaser);
    if (ul) {
      ul.innerHTML = list.slice(1).map((dl) =>
        '<li class="flex items-baseline justify-between gap-4 border-t border-ink-3 py-3"><span class="min-w-0"><span class="block font-medium text-paper">' + esc(dl.short) + '</span><span class="block text-sm text-sage">' + esc(dl.forms) + '</span></span><span class="shrink-0 text-right text-sm num text-sage"><span class="block font-semibold text-paper">' + esc(shortDate(dl.key)) + '</span>' + esc(untilWords(now, dl.key)) + '</span></li>'
      ).join('');
    }
  }
  paintTeaser();
  if (!previewing) {
    window.setInterval(() => { paintDateline(); paintTeaser(); paintNextCard(); }, 30000);
  }

  /* ------------------------------------------------------------------
   * 7. Deadlines page
   * ------------------------------------------------------------------ */
  const dlRoot = $('[data-deadlines]');
  // The calendar opens on the year of the next deadline: this year, or next year once this year's
  // last deadline (December 15) has passed.
  const defaultYear = () => yearOf(upcoming(nowET(), 'all')[0].key);
  const dlState = {
    type: hasOwn(D.TAXPAYER_TYPES, params.get('type')) ? params.get('type') : 'all',
    year: defaultYear()
  };
  {
    const y0 = yearOf(nowET().key);
    const py = intParam('year', 0, 99999, dlState.year);
    if (py === y0 || py === y0 + 1) dlState.year = py;
  }
  function paintNextCard() {
    const card = $('[data-dl-next]');
    if (!card) return;
    const now = nowET();
    const list = upcoming(now, dlState.type);
    const next = list[0];
    const sameDay = list.filter((dl) => dl.key === next.key);
    const left = timeLeft(now, next.key);
    $('[data-next-type]', card).textContent = dlState.type === 'all' ? 'for everyone' : 'for ' + D.TAXPAYER_TYPES[dlState.type].toLowerCase();
    $('[data-next-date]', card).textContent = longDate(next.key);
    $('[data-next-title]', card).textContent = next.title;
    $('[data-next-forms]', card).textContent = next.forms + ' · ' + JURISDICTION[next.rule];
    $('[data-next-more]', card).textContent = sameDay.length > 1 ? 'Also due that day: ' + sameDay.slice(1).map((dl) => dl.short).join(', ') + '.' : '';
    $('[data-next-why]', card).textContent = next.moved ? next.why + '.' : '';
    $('[data-cd-days]', card).textContent = String(left.days);
    $('[data-cd-days-label]', card).textContent = left.days === 1 ? 'day' : 'days';
    $('[data-cd-hours]', card).textContent = String(left.hours);
    $('[data-cd-hours-label]', card).textContent = left.hours === 1 ? 'hour' : 'hours';
    $('[data-cd-mins]', card).textContent = String(left.mins);
    $('[data-cd-mins-label]', card).textContent = left.mins === 1 ? 'minute' : 'minutes';
    $('[data-cd-sr]', card).textContent = 'Due ' + longDate(next.key) + ', ' + untilWords(now, next.key) + '.';
  }
  function paintDeadlines() {
    if (!dlRoot) return;
    const now = nowET();
    const y0 = yearOf(now.key);
    const list = deadlines(dlState.year).filter((dl) => appliesTo(dl, dlState.type));
    const nextKey = (upcoming(now, dlState.type)[0] || {}).key;
    const ahead = list.filter((dl) => dl.key >= now.key).length;

    $$('[data-type-filter]').forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-type-filter') === dlState.type)));
    $$('[data-year-offset]').forEach((b) => {
      const y = y0 + +b.getAttribute('data-year-offset');
      b.textContent = String(y);
      b.setAttribute('aria-pressed', String(y === dlState.year));
    });
    $$('[data-dl-year]').forEach((el) => { el.textContent = String(dlState.year); });
    $('[data-dl-count]').textContent = plural(list.length, 'deadline') + ' in ' + dlState.year + (dlState.year === y0 ? ' · ' + ahead + ' still ahead' : '');

    const months = [];
    list.forEach((dl) => {
      const m = +dl.key.slice(5, 7);
      if (!months.length || months[months.length - 1].m !== m) months.push({ m, items: [] });
      months[months.length - 1].items.push(dl);
    });
    $('[data-dl-list]', dlRoot).innerHTML = months.map((grp) =>
      '<li class="grid gap-3 border-t border-ink pt-4 md:grid-cols-[10rem_1fr] md:gap-8"><h3 class="font-serif text-2xl font-semibold">' + MONTH_LONG[grp.m - 1] + '</h3><ul class="divide-y divide-line">' +
      grp.items.map((dl) => {
        const past = dl.key < now.key;
        const isNext = dl.key === nextKey;
        const status = past ? '<span class="tag bg-paper-2 text-muted">Passed</span>'
          : isNext ? '<span class="tag tag-gold">Next · ' + esc(untilWords(now, dl.key)) + '</span>'
            : daysBetween(now.key, dl.key) <= 30 ? '<span class="tag tag-due">' + esc(untilWords(now, dl.key)) + '</span>'
              : '<span class="tag">' + esc(untilWords(now, dl.key)) + '</span>';
        const d = dateOfKey(dl.key);
        return '<li class="flex gap-4 py-4" data-deadline="' + esc(dl.id) + '" data-status="' + (past ? 'past' : isNext ? 'next' : 'upcoming') + '">' +
          '<div class="flex w-16 shrink-0 flex-col items-center rounded-xl border ' + (isNext ? 'border-marigold-deep bg-marigold-soft' : past ? 'border-line bg-paper-2' : 'border-line bg-card') + ' py-2"><span class="text-[11px] font-semibold uppercase tracking-wider text-muted">' + DAY[d.getUTCDay()] + '</span><span class="font-serif text-2xl font-semibold leading-none num">' + d.getUTCDate() + '</span></div>' +
          '<div class="min-w-0 flex-1"><div class="flex flex-wrap items-center gap-2">' + status + '<span class="text-xs font-semibold uppercase tracking-wider text-muted">' + JURISDICTION[dl.rule] + '</span></div>' +
          '<p class="mt-1.5 font-medium leading-snug' + (past ? ' text-muted' : '') + '">' + esc(dl.title) + '</p>' +
          '<p class="mt-1 text-sm text-muted">' + esc(dl.forms) + ' · ' + dl.who.map((w) => esc(D.TAXPAYER_TYPES[w])).join(', ') + '</p>' +
          (dl.moved ? '<p class="mt-1 text-sm text-due">' + esc(dl.why) + '.</p>' : '') +
          '</div></li>';
      }).join('') + '</ul></li>'
    ).join('');

    const hol = $('[data-holidays]');
    if (hol) {
      hol.innerHTML = holidays(dlState.year).filter((h) => HOLIDAY_SETS.federal.indexOf(h.id) !== -1 || h.id === 'goodFriday').map((h) => {
        const note = h.id === 'emancipation' ? 'Washington, DC holiday: moves IRS deadlines' : h.id === 'goodFriday' ? 'Tennessee state holiday: moves state deadlines' : 'Federal holiday';
        return '<li class="flex items-baseline justify-between gap-4 py-2.5"><span><span class="font-medium">' + esc(h.name) + '</span><span class="block text-sm text-muted">' + note + '</span></span><span class="shrink-0 text-sm font-semibold num">' + esc(shortDate(h.key)) + '</span></li>';
      }).join('');
    }
    paintNextCard();
  }
  function syncDeadlineUrl() {
    const p = new URLSearchParams(window.location.search);
    if (dlState.type === 'all') p.delete('type'); else p.set('type', dlState.type);
    if (dlState.year === defaultYear()) p.delete('year'); else p.set('year', String(dlState.year));
    const qs = p.toString();
    try { window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash); } catch (e) { /* file:// in some browsers */ }
  }
  if (dlRoot) {
    $$('[data-type-filter]').forEach((b) => b.addEventListener('click', () => {
      const t = b.getAttribute('data-type-filter');
      if (!hasOwn(D.TAXPAYER_TYPES, t)) return;
      dlState.type = t;
      paintDeadlines();
      syncDeadlineUrl();
    }));
    $$('[data-year-offset]').forEach((b) => b.addEventListener('click', () => {
      dlState.year = yearOf(nowET().key) + +b.getAttribute('data-year-offset');
      paintDeadlines();
      syncDeadlineUrl();
    }));
    paintDeadlines();
  }

  /* ------------------------------------------------------------------
   * 8. Checklist — ticks saved in safeStorage under STORE_CHECKLIST:
   *    { list: "individual", ticks: { individual: ["i-w2"], business: [] } }
   * ------------------------------------------------------------------ */
  const ck = $('[data-checklist]');
  function readChecklist() {
    const raw = store.get(STORE_CHECKLIST);
    const out = { list: D.CHECKLIST_ORDER[0], ticks: {} };
    if (raw && typeof raw === 'object') {
      if (hasOwn(D.CHECKLISTS, raw.list)) out.list = raw.list;
      D.CHECKLIST_ORDER.forEach((id) => {
        const valid = D.CHECKLISTS[id].items.map((it) => it.id);
        const saved = raw.ticks && hasOwn(raw.ticks, id) && Array.isArray(raw.ticks[id]) ? raw.ticks[id] : [];
        out.ticks[id] = valid.filter((v) => saved.indexOf(v) !== -1);
      });
    } else {
      D.CHECKLIST_ORDER.forEach((id) => { out.ticks[id] = []; });
    }
    return out;
  }
  if (ck) {
    let state = readChecklist();
    const pList = params.get('list');
    if (hasOwn(D.CHECKLISTS, pList)) state.list = pList;
    const tabs = $$('[data-checklist-tab]', ck);
    function paintChecklist(focusTab) {
      const list = D.CHECKLISTS[state.list];
      const ticks = state.ticks[state.list] || [];
      tabs.forEach((t) => t.setAttribute('aria-pressed', String(t.getAttribute('data-checklist-tab') === state.list)));
      $('[data-checklist-title]', ck).textContent = list.label;
      $('[data-checklist-items]', ck).innerHTML = list.items.map((it) =>
        '<li><label class="check-row"><input type="checkbox" class="sr-only" value="' + esc(it.id) + '"' + (ticks.indexOf(it.id) !== -1 ? ' checked' : '') + '>' +
        '<span class="check-box" aria-hidden="true"><svg viewBox="0 0 16 16" class="size-3.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m3 8.5 3.2 3L13 4.5"/></svg></span>' +
        '<span class="check-text leading-snug">' + esc(it.t) + '</span></label></li>'
      ).join('');
      paintProgress();
      if (focusTab) focusTab.focus();
    }
    function paintProgress() {
      const total = D.CHECKLISTS[state.list].items.length;
      const done = (state.ticks[state.list] || []).length;
      $('[data-check-progress]', ck).textContent = done + ' of ' + total + ' ready';
      $('[data-check-bar]', ck).style.width = Math.round((done / total) * 100) + '%';
      $('[data-check-done]', ck).hidden = done !== total;
    }
    function save() { store.set(STORE_CHECKLIST, state); }
    tabs.forEach((t) => t.addEventListener('click', () => {
      const id = t.getAttribute('data-checklist-tab');
      if (!hasOwn(D.CHECKLISTS, id)) return;
      state.list = id;
      save();
      paintChecklist();
    }));
    $('[data-checklist-items]', ck).addEventListener('change', (e) => {
      const box = e.target;
      if (!box || box.type !== 'checkbox') return;
      // Re-read so another tab's ticks are never overwritten with stale ones.
      state = Object.assign(readChecklist(), { list: state.list });
      const cur = state.ticks[state.list];
      const i = cur.indexOf(box.value);
      if (box.checked && i === -1) cur.push(box.value);
      if (!box.checked && i !== -1) cur.splice(i, 1);
      save();
      paintProgress();
    });
    $('[data-check-reset]', ck).addEventListener('click', () => {
      state.ticks[state.list] = [];
      save();
      paintChecklist();
    });
    paintChecklist();
  }

  /* ------------------------------------------------------------------
   * 9. Services
   * ------------------------------------------------------------------ */
  const svcGrid = $('[data-services-grid]');
  if (svcGrid) {
    svcGrid.innerHTML = D.SERVICE_ORDER.map((slug, i) => {
      const s = D.SERVICES[slug];
      return '<li class="reveal folder mt-4 flex flex-col"><a href="service.html?s=' + esc(slug) + '" class="group flex h-full flex-col">' +
        '<span class="block overflow-hidden rounded-tr-2xl border-b border-line bg-paper-2"><img src="' + esc(s.art) + '" alt="" width="480" height="300" class="block aspect-[8/5] w-full object-cover transition duration-500 group-hover:scale-[1.02]"></span>' +
        '<span class="flex flex-1 flex-col p-6"><span class="kicker">' + String(i + 1).padStart(2, '0') + '</span>' +
        '<span class="mt-1 font-serif text-2xl font-semibold leading-tight group-hover:text-olive">' + esc(s.name) + '</span>' +
        '<span class="mt-3 flex-1 text-muted">' + esc(s.short) + '</span>' +
        '<span class="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4 text-sm"><span class="font-semibold num">' + esc(s.from) + '</span><span class="link-arrow">Details</span></span></span></a></li>';
    }).join('') +
      '<li class="reveal on-dark mt-4 flex flex-col justify-between gap-8 rounded-2xl bg-ink p-7 lg:col-span-2 lg:justify-center"><div><p class="eyebrow">Not sure which?</p><p class="mt-4 max-w-md font-serif text-3xl font-semibold leading-tight text-white">Most clients use two or three of these. Tell us what\u2019s going on and we\u2019ll put the right people on it.</p></div>' +
      '<div class="flex flex-col gap-3 sm:flex-row"><a href="contact.html?service=not-sure" class="btn-marigold">Book a free consultation</a><a href="pricing.html#estimator" class="btn-line-light">Estimate your fees</a></div></li>';
    watchReveal(svcGrid);
  }

  const svc = $('[data-service]');
  if (svc) {
    const asked = params.get('s');
    const found = hasOwn(D.SERVICES, asked);
    const slug = found ? asked : D.DEFAULT_SERVICE;
    const s = D.SERVICES[slug];
    const notice = $('[data-svc-notice]', svc);
    if (asked !== null && !found) {
      notice.hidden = false;
      $('[data-svc-asked]', notice).textContent = asked.slice(0, 60);
    }
    document.title = s.name + ' — ' + D.FIRM.name;
    $('[data-svc-crumb]', svc).textContent = s.name;
    $('[data-svc-name]', svc).textContent = s.name;
    $('[data-svc-intro]', svc).textContent = s.intro;
    $('[data-svc-from]', svc).textContent = s.from;
    const art = $('[data-svc-art]', svc);
    art.src = s.art;
    $$('[data-svc-book]', svc).forEach((a) => { a.href = 'contact.html?service=' + encodeURIComponent(slug); });
    $('[data-svc-included]', svc).innerHTML = s.included.map((t) =>
      '<li class="flex gap-3"><svg viewBox="0 0 20 20" class="mt-0.5 size-5 shrink-0 text-olive" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4 10.5 4 3.5 8-8"/></svg><span>' + esc(t) + '</span></li>').join('');
    $('[data-svc-for]', svc).innerHTML = s.forWho.map((t) => '<li class="border-b border-ink-3 py-3 last:border-b-0">' + esc(t) + '</li>').join('');
    $('[data-svc-timeline]', svc).innerHTML = s.timeline.map((t, i) =>
      '<li class="relative pb-8 pl-12 last:pb-0"><span class="absolute left-0 top-0 grid size-8 place-items-center rounded-full bg-olive font-serif text-sm font-semibold text-white num">' + (i + 1) + '</span>' +
      (i < s.timeline.length - 1 ? '<span class="absolute bottom-0 left-4 top-9 w-px bg-line-strong" aria-hidden="true"></span>' : '') +
      '<p class="text-sm font-semibold uppercase tracking-wider text-muted">' + esc(t.when) + '</p><p class="mt-1 text-lg leading-snug">' + esc(t.step) + '</p></li>').join('');
    $('[data-svc-faq]', svc).innerHTML = s.faq.map((f) =>
      '<details class="faq-item"><summary>' + esc(f.q) + '<span class="faq-icon" aria-hidden="true"></span></summary><p class="pb-5 leading-relaxed text-muted">' + esc(f.a) + '</p></details>').join('');
    $('[data-svc-related]', svc).innerHTML = s.related.filter((r) => hasOwn(D.SERVICES, r)).map((r) => {
      const o = D.SERVICES[r];
      return '<li><a href="service.html?s=' + esc(r) + '" class="group flex h-full flex-col card p-5 transition hover:border-olive"><img src="' + esc(o.art) + '" alt="" width="480" height="300" class="aspect-[8/5] w-full rounded-lg bg-paper-2 object-cover"><span class="mt-4 font-serif text-xl font-semibold group-hover:text-olive">' + esc(o.name) + '</span><span class="mt-1 text-sm text-muted">' + esc(o.from) + '</span></a></li>';
    }).join('');
  }

  /* ------------------------------------------------------------------
   * 10. Fee estimator (pricing.html). URL: ?entity=&tx=&emp=&states=&cleanup=
   * ------------------------------------------------------------------ */
  const E = D.ESTIMATOR;
  // The estimate for a set of inputs: { tier, lines: [{ label, amount }], monthly, annual, cleanup }.
  function estimate(inp) {
    const ent = E.entities[inp.entity];
    let tier = E.tiers.find((t) => inp.tx <= t.max);
    let book;
    if (tier) {
      book = tier.fee;
    } else {
      tier = E.tiers[E.tiers.length - 1];
      const last = tier.max;
      book = tier.fee + Math.ceil((inp.tx - last) / E.overBlock) * E.overBlockFee;
    }
    const lines = [{ label: 'Bookkeeping: ' + tier.name + ' (' + (inp.tx > E.tiers[E.tiers.length - 1].max ? 'over ' + E.tiers[E.tiers.length - 1].max.toLocaleString('en-US') : 'up to ' + tier.max.toLocaleString('en-US')) + ' transactions)', amount: book }];
    if (inp.emp > 0) lines.push({ label: 'Payroll for ' + plural(inp.emp, 'employee'), amount: E.payrollBase + E.payrollPerEmployee * inp.emp });
    if (inp.states > 1) lines.push({ label: plural(inp.states - 1, 'additional state'), amount: (inp.states - 1) * E.extraStateFee });
    if (ent.extra) lines.push({ label: ent.extraLabel, amount: ent.extra });
    if (ent.returnFee) lines.push({ label: 'Annual returns (' + money(ent.returnFee) + ' a year, spread monthly)', amount: ent.returnFee / 12 });
    const monthly = Math.round(lines.reduce((sum, l) => sum + l.amount, 0));
    return { tier, lines, monthly, annual: monthly * 12, cleanup: inp.cleanup * E.cleanupPerMonth };
  }
  const est = $('[data-estimator]');
  if (est) {
    const L = E.limits;
    const snap = (n) => Math.round(n / L.tx[2]) * L.tx[2];
    const inp = {
      entity: hasOwn(E.entities, params.get('entity')) ? params.get('entity') : E.defaults.entity,
      tx: snap(intParam('tx', L.tx[0], L.tx[1], E.defaults.tx)),
      emp: intParam('emp', L.emp[0], L.emp[1], E.defaults.emp),
      states: intParam('states', L.states[0], L.states[1], E.defaults.states),
      cleanup: intParam('cleanup', L.cleanup[0], L.cleanup[1], E.defaults.cleanup)
    };
    const f = est.elements;
    const entSel = f.namedItem('entity');
    entSel.innerHTML = E.entityOrder.map((id) => '<option value="' + id + '">' + esc(E.entities[id].label) + '</option>').join('');
    const statesSel = f.namedItem('states');
    statesSel.innerHTML = Array.from({ length: L.states[1] - L.states[0] + 1 }, (_, i) => {
      const n = L.states[0] + i;
      return '<option value="' + n + '">' + (n === 1 ? 'Tennessee only' : 'Tennessee + ' + plural(n - 1, 'other state')) + '</option>';
    }).join('');
    function fill() {
      entSel.value = inp.entity;
      f.namedItem('tx').value = String(inp.tx);
      f.namedItem('emp').value = String(inp.emp);
      statesSel.value = String(inp.states);
      f.namedItem('cleanup').value = String(inp.cleanup);
    }
    function paint() {
      const r = estimate(inp);
      $('[data-est-tx]', est).textContent = inp.tx >= L.tx[1] ? L.tx[1].toLocaleString('en-US') + '+' : inp.tx.toLocaleString('en-US');
      $('[data-est-cleanup-out]', est).textContent = inp.cleanup === 0 ? 'Up to date' : plural(inp.cleanup, 'month') + ' behind';
      $('[data-est-total]').textContent = money(r.monthly);
      $('[data-est-tier]').textContent = r.tier.name;
      $('[data-est-annual]').textContent = money(r.annual) + ' a year';
      $('[data-est-lines]').innerHTML = r.lines.map((l) =>
        '<li class="flex items-baseline justify-between gap-4 py-2.5"><span class="min-w-0">' + esc(l.label) + '</span><span class="shrink-0 font-semibold num">' + money(l.amount) + '</span></li>').join('');
      $('[data-est-onetime]').textContent = r.cleanup ? money(r.cleanup) + ' once, for ' + plural(inp.cleanup, 'month') + ' of catch-up' : 'None: your books are current';
      $('[data-est-note]').textContent = E.entities[inp.entity].note;
      const p = new URLSearchParams();
      p.set('entity', inp.entity); p.set('tx', String(inp.tx)); p.set('emp', String(inp.emp)); p.set('states', String(inp.states)); p.set('cleanup', String(inp.cleanup));
      try { window.history.replaceState(null, '', window.location.pathname + '?' + p.toString() + window.location.hash); } catch (e) { /* file:// */ }
    }
    est.addEventListener('input', (e) => {
      const n = e.target.name;
      if (n === 'entity' && hasOwn(E.entities, e.target.value)) inp.entity = e.target.value;
      if (n === 'tx') inp.tx = clamp(snap(+e.target.value || 0), L.tx[0], L.tx[1]);
      if (n === 'emp') inp.emp = clamp(Math.floor(+e.target.value || 0), L.emp[0], L.emp[1]);
      if (n === 'states') inp.states = clamp(+e.target.value || 1, L.states[0], L.states[1]);
      if (n === 'cleanup') inp.cleanup = clamp(Math.floor(+e.target.value || 0), L.cleanup[0], L.cleanup[1]);
      paint();
    });
    f.namedItem('emp').addEventListener('change', () => { f.namedItem('emp').value = String(inp.emp); });
    $$('[data-emp-step]', est).forEach((b) => b.addEventListener('click', () => {
      inp.emp = clamp(inp.emp + +b.getAttribute('data-emp-step'), L.emp[0], L.emp[1]);
      f.namedItem('emp').value = String(inp.emp);
      paint();
    }));
    $('[data-est-reset]', est).addEventListener('click', () => {
      Object.assign(inp, E.defaults);
      fill();
      paint();
    });
    est.addEventListener('submit', (e) => e.preventDefault());
    fill();
    paint();
  }

  /* ------------------------------------------------------------------
   * 11. Insights and articles
   * ------------------------------------------------------------------ */
  const authorOf = (a) => a.author;
  const insights = $('[data-insights]');
  if (insights) {
    let cat = hasOwn(D.CATEGORIES, params.get('cat')) ? params.get('cat') : 'all';
    const list = $('[data-insights-list]', insights);
    const featured = $('[data-insights-featured]', insights);
    function card(a) {
      return '<li class="reveal"><a href="article.html?a=' + esc(a.slug) + '" class="group flex h-full flex-col">' +
        '<span class="block overflow-hidden rounded-2xl border border-line bg-paper-2"><img src="' + esc(a.art) + '" alt="" width="640" height="400" class="block aspect-[8/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]"></span>' +
        '<span class="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted"><span class="tag">' + esc(D.CATEGORIES[a.cat]) + '</span><time datetime="' + a.date + '" class="num">' + pubDate(a.date) + '</time><span>' + a.mins + ' min read</span></span>' +
        '<span class="mt-2 font-serif text-2xl font-semibold leading-tight group-hover:text-olive">' + esc(a.title) + '</span>' +
        '<span class="mt-2 text-muted">' + esc(a.dek) + '</span></a></li>';
    }
    function paint() {
      const items = D.ARTICLES.filter((a) => cat === 'all' || a.cat === cat);
      $$('[data-cat-filter]', insights).forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-cat-filter') === cat)));
      $('[data-insights-count]', insights).textContent = plural(items.length, 'article') + (cat === 'all' ? '' : ' in ' + D.CATEGORIES[cat]);
      const lead = cat === 'all' ? items[0] : null;
      featured.hidden = !lead;
      if (lead) {
        $('[data-feat-link]', featured).href = 'article.html?a=' + lead.slug;
        $('[data-feat-art]', featured).src = lead.art;
        $('[data-feat-cat]', featured).textContent = D.CATEGORIES[lead.cat];
        $('[data-feat-date]', featured).textContent = pubDate(lead.date);
        $('[data-feat-date]', featured).setAttribute('datetime', lead.date);
        $('[data-feat-title]', featured).textContent = lead.title;
        $('[data-feat-dek]', featured).textContent = lead.dek;
        $('[data-feat-author]', featured).textContent = authorOf(lead) + ' · ' + lead.mins + ' min read';
      }
      list.innerHTML = (lead ? items.slice(1) : items).map(card).join('');
      watchReveal(list);
    }
    $$('[data-cat-filter]', insights).forEach((b) => b.addEventListener('click', () => {
      const c = b.getAttribute('data-cat-filter');
      if (!hasOwn(D.CATEGORIES, c)) return;
      cat = c;
      paint();
      const p = new URLSearchParams(window.location.search);
      if (cat === 'all') p.delete('cat'); else p.set('cat', cat);
      const qs = p.toString();
      try { window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '')); } catch (e) { /* file:// */ }
    }));
    paint();
  }

  const art = $('[data-article]');
  if (art) {
    const asked = params.get('a');
    const found = D.ARTICLES.find((a) => a.slug === asked);
    const a = found || D.ARTICLES[0];
    if (asked !== null && !found) {
      const n = $('[data-art-notice]', art);
      n.hidden = false;
      $('[data-art-asked]', n).textContent = asked.slice(0, 80);
    }
    document.title = a.title + ' — ' + D.FIRM.name;
    $('[data-art-crumb]', art).textContent = D.CATEGORIES[a.cat];
    $('[data-art-crumb]', art).href = 'insights.html?cat=' + a.cat;
    $('[data-art-title]', art).textContent = a.title;
    $('[data-art-dek]', art).textContent = a.dek;
    $('[data-art-author]', art).textContent = a.author;
    const t = $('[data-art-date]', art);
    t.textContent = pubDate(a.date);
    t.setAttribute('datetime', a.date);
    $('[data-art-mins]', art).textContent = a.mins + ' min read';
    $('[data-art-art]', art).src = a.art;
    $('[data-art-body]', art).innerHTML = a.body.map((b) => {
      if (b.h2) return '<h2>' + esc(b.h2) + '</h2>';
      if (b.ul) return '<ul>' + b.ul.map((li) => '<li>' + esc(li) + '</li>').join('') + '</ul>';
      if (b.quote) return '<blockquote><p class="!mt-0 !font-serif !text-xl !leading-snug">' + esc(b.quote) + '</p></blockquote>';
      return '<p>' + esc(b.p) + '</p>';
    }).join('');
    const more = D.ARTICLES.filter((o) => o !== a && o.cat === a.cat).concat(D.ARTICLES.filter((o) => o !== a && o.cat !== a.cat)).slice(0, 3);
    $('[data-art-more]', art).innerHTML = more.map((o) =>
      '<li><a href="article.html?a=' + esc(o.slug) + '" class="group flex gap-4"><img src="' + esc(o.art) + '" alt="" width="640" height="400" class="aspect-[8/5] w-28 shrink-0 rounded-lg border border-line bg-paper-2 object-cover"><span class="min-w-0"><span class="block text-xs font-semibold uppercase tracking-wider text-muted">' + esc(D.CATEGORIES[o.cat]) + '</span><span class="mt-1 block font-serif text-lg font-semibold leading-snug group-hover:text-olive">' + esc(o.title) + '</span></span></a></li>').join('');
  }

  /* ------------------------------------------------------------------
   * 12. Booking — consultation request on contact.html (?service=<slug> preselects a service)
   * ------------------------------------------------------------------ */
  const B = D.BOOKING;
  function inTaxSeason(key) {
    const md = key.slice(5);
    return md >= B.taxSeason.from && md <= B.taxSeason.to;
  }
  // Consultation times offered on a date (before any are taken), or [] when the office is closed.
  function slotsFor(key) {
    const w = weekday(key);
    if (!hasOwn(B.slots, String(w))) return [];
    if (w === 6 && !inTaxSeason(key)) return [];
    if (officeClosure(key)) return [];
    return B.slots[w];
  }
  const slotTaken = (key, time) => hash('slot|' + key + '|' + time) % 100 < B.demoTaken;
  const freeSlots = (key) => slotsFor(key).filter((t) => !slotTaken(key, t));
  // The bookable days shown in the picker: the next B.days open days from tomorrow.
  function bookingDays(now) {
    const out = [];
    let k = addDays(now.key, 1);
    for (let i = 0; i < 90 && out.length < B.days; i++, k = addDays(k, 1)) {
      if (slotsFor(k).length) out.push(k);
    }
    return out;
  }

  // "First open time" on the home and contact pages: the earliest free slot from tomorrow.
  $$('[data-first-slot]').forEach((el) => {
    const ds = bookingDays(nowET());
    const first = ds.find((k) => freeSlots(k).length);
    if (first) el.textContent = shortDate(first) + ' at ' + clock(toMin(freeSlots(first)[0]));
  });

  const bookForm = $('[data-booking]');
  if (bookForm) {
    const now = nowET();
    const days = bookingDays(now);
    const sel = { day: null, time: null };
    const svcSel = bookForm.elements.namedItem('service');
    svcSel.innerHTML = '<option value="">Choose a service</option>' + D.SERVICE_ORDER.map((s) => '<option value="' + s + '">' + esc(D.SERVICES[s].name) + '</option>').join('') + '<option value="not-sure">Not sure yet</option>';
    const asked = params.get('service');
    if (hasOwn(D.SERVICES, asked) || asked === 'not-sure') svcSel.value = asked;

    const dayWrap = $('[data-days]', bookForm), slotWrap = $('[data-slots]', bookForm);
    const firstOpen = days.find((k) => freeSlots(k).length) || days[0];
    sel.day = firstOpen;

    function paintDays() {
      dayWrap.innerHTML = days.map((k) => {
        const free = freeSlots(k).length;
        const d = dateOfKey(k);
        return '<button type="button" class="day-btn" data-day="' + k + '" aria-pressed="' + (k === sel.day) + '"' + (free ? '' : ' disabled') + '>' +
          '<span class="text-[11px] font-semibold uppercase tracking-wider">' + DAY[d.getUTCDay()] + ' </span><span class="font-serif text-xl font-semibold leading-tight num">' + d.getUTCDate() + ' </span><span class="text-[11px]">' + MONTH[d.getUTCMonth()] + '</span><span class="sr-only">, ' + (free ? plural(free, 'time') + ' open' : 'fully booked') + '</span></button>';
      }).join('');
    }
    function paintSlots() {
      const all = slotsFor(sel.day);
      $('[data-slots-day]', bookForm).textContent = longDate(sel.day);
      const lunchAfter = all.findIndex((t) => toMin(t) >= 13 * 60);
      slotWrap.innerHTML = all.map((t, i) => {
        const taken = slotTaken(sel.day, t);
        const gap = i === lunchAfter && i > 0 ? '<li class="col-span-full flex items-center gap-3 text-xs font-semibold uppercase tracking-wider text-muted"><span class="h-px flex-1 bg-line"></span>Lunch, 12–1<span class="h-px flex-1 bg-line"></span></li>' : '';
        return gap + '<li><button type="button" class="slot-btn w-full" data-time="' + t + '" aria-pressed="' + (sel.time === t) + '"' + (taken ? ' disabled aria-label="' + clock(toMin(t)) + ', booked"' : '') + '>' + clock(toMin(t)) + '</button></li>';
      }).join('');
      paintSummary();
    }
    function paintSummary() {
      const out = $('[data-slot-summary]', bookForm);
      out.textContent = sel.time ? longDate(sel.day) + ' at ' + clock(toMin(sel.time)) + ' Eastern, ' + B.minutes + ' minutes' : 'No time chosen yet';
      bookForm.elements.namedItem('slot_date').value = sel.time ? sel.day : '';
      bookForm.elements.namedItem('slot_time').value = sel.time || '';
    }
    dayWrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-day]');
      if (!b || b.disabled) return;
      sel.day = b.getAttribute('data-day');
      sel.time = null;
      $$('[data-day]', dayWrap).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      paintSlots();
    });
    slotWrap.addEventListener('click', (e) => {
      const b = e.target.closest('[data-time]');
      if (!b || b.disabled) return;
      sel.time = b.getAttribute('data-time');
      $$('[data-time]', slotWrap).forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      setError(bookForm, 'time', '');
      paintSummary();
    });
    paintDays();
    paintSlots();

    $$('input, select, textarea', bookForm).forEach((el) => el.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true') setError(bookForm, el.name, '');
    }));

    // To connect a real backend (Formspree, your practice management system, a CRM), POST
    // new FormData(bookForm) with fetch() here, and show the success panel only when it answers OK.
    bookForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = bookForm.elements;
      const name = f.namedItem('name').value.trim();
      const email = f.namedItem('email').value.trim();
      const phone = f.namedItem('phone').value.trim();
      const digits = phone.replace(/\D/g, '');
      let ok = true;
      ok = setError(bookForm, 'service', f.namedItem('service').value ? '' : 'Choose a service, or “Not sure yet”.') && ok;
      ok = setError(bookForm, 'time', sel.time ? '' : 'Choose a day and a time.') && ok;
      ok = setError(bookForm, 'name', name.length >= 2 ? '' : 'Enter your name.') && ok;
      ok = setError(bookForm, 'email', EMAIL.test(email) ? '' : 'Enter an email address like name@example.com.') && ok;
      ok = setError(bookForm, 'phone', !phone || digits.length === 10 || (digits.length === 11 && digits[0] === '1') ? '' : 'Enter a 10-digit US phone number, or leave it blank.') && ok;
      if (!ok) {
        const bad = $('[aria-invalid="true"]', bookForm) || (!sel.time ? $('[data-time]:not([disabled])', bookForm) : null);
        if (!sel.time) { const err = $('[data-error="time"]', bookForm); if (err) err.scrollIntoView({ block: 'center' }); }
        if (bad) bad.focus();
        return;
      }
      const svcVal = f.namedItem('service').value;
      const meeting = (f.namedItem('meeting') && bookForm.querySelector('input[name="meeting"]:checked')) ? bookForm.querySelector('input[name="meeting"]:checked').value : 'office';
      const ref = D.FIRM.refPrefix + '-' + hash([name.toLowerCase(), email.toLowerCase(), sel.day, sel.time].join('|')).toString(36).toUpperCase().padStart(5, '0').slice(-5);
      const done = $('[data-booking-success]');
      $('[data-success-greeting]', done).textContent = 'Thank you, ' + name.split(/\s+/)[0] + '. Your consultation request is in.';
      $('[data-ref]', done).textContent = ref;
      $('[data-success-when]', done).textContent = longDate(sel.day) + ' at ' + clock(toMin(sel.time)) + ' Eastern';
      $('[data-success-service]', done).textContent = svcVal === 'not-sure' ? 'Not sure yet: we’ll point you to the right person' : D.SERVICES[svcVal].name;
      $('[data-success-meeting]', done).textContent = hasOwn(B.meetings, meeting) ? B.meetings[meeting].label : B.meetings.office.label;
      $('[data-success-email]', done).textContent = email;
      bookForm.hidden = true;
      done.hidden = false;
      done.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      $('h2', done).focus();
    });
  }

  /* ------------------------------------------------------------------
   * 13. Footer year and other "this year" spans
   * ------------------------------------------------------------------ */
  $$('[data-year]').forEach((el) => { el.textContent = String(yearOf(nowET().key) + (+el.getAttribute('data-year') || 0)); });
  $$('[data-years-since]').forEach((el) => { el.textContent = String(yearOf(nowET().key) - (+el.getAttribute('data-years-since') || 0)); });
  $$('[data-office-status]').forEach((el) => {
    const now = nowET();
    const w = weekday(now.key);
    const closed = officeClosure(now.key);
    const open = !closed && (w >= 1 && w <= 4 ? now.mins >= 510 && now.mins < 1050 : w === 5 ? now.mins >= 510 && now.mins < 900 : w === 6 && inTaxSeason(now.key) ? now.mins >= 540 && now.mins < 780 : false);
    el.textContent = open ? 'Open now' : closed ? 'Closed today for ' + closed : 'Closed now';
  });

  watchReveal(document);
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
