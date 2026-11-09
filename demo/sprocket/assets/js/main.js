/* Bonfield Bikes (Sprocket template) — all template behavior. Vanilla, no dependencies.
 * Content and settings live in assets/js/data.js (window.SPROCKET); this file reads them.
 *
 *  1. Helpers         DOM, storage, money, plurals, hashing, form errors
 *  2. Dates           Central time "now" (with ?now= preview), date keys, US formats
 *  3. Batches         the open production batch, its ship month and spots left
 *  4. Header          sticky header, accessible mobile menu, reveal on scroll
 *  5. Batch panels    the top bar on every page and data-batch-* spans
 *  6. Builds          validating a build, URL params, prices, the bike drawing
 *  7. Home hero       color swatches that recolor the hero bike
 *  8. Configurator    bike.html: color, battery, accessories, price, save, share
 *  9. Range           range.html estimator
 * 10. Reserve         reserve.html: build summary, delivery zone, form, saved reservation
 * 11. Cost            specs.html car vs Portage calculator
 * 12. Journal         journal.html filter, article.html?a=<slug>, cover drawings
 * 13. About           team portraits and open roles filter
 * 14. Support         FAQ search, ZIP checker, contact form
 * 15. Footer year
 * 16. Back to top     (separate block at the end of the file)
 */
(function () {
  'use strict';

  const D = window.SPROCKET;
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
  // privacy settings): a saved build or reservation then lasts for this page view instead of failing.
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
  const STORE_BUILD = 'sprocket:build';
  const STORE_RESERVATION = 'sprocket:reservation';

  // Values from the URL or storage must be the data's own keys, so ?color=constructor matches nothing.
  const hasOwn = (obj, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, one, many) => n.toLocaleString('en-US') + ' ' + (n === 1 ? one : (many || one + 's'));
  const money = (n) => (n < 0 ? '−' : '') + '$' + Math.round(Math.abs(n)).toLocaleString('en-US');
  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

  // Deterministic pseudo-random numbers (FNV-1a + mix) for references.
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    h ^= h >>> 16; h = Math.imul(h, 2246822507) >>> 0;
    h ^= h >>> 13; h = Math.imul(h, 3266489909) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
  }
  const CODE = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const code4 = (h) => [0, 1, 2, 3].map((i) => CODE[(h >>> (i * 5)) & 31]).join('');

  function setError(form, name, msg) {
    const el = $('[data-error="' + name + '"]', form);
    if (el) el.textContent = msg || '';
    $$('[name="' + name + '"]', form).forEach((input) => {
      if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
    });
    return !msg;
  }
  const setText = (sel, text, root) => $$(sel, root).forEach((el) => { el.textContent = text; });

  /* ------------------------------------------------------------------
   * 2. Dates — calendar dates are "YYYY-MM-DD" keys, worked out in UTC so clock changes never shift
   *    a day. "Now" is the wall clock in Duluth (America/Chicago).
   * ------------------------------------------------------------------ */
  const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const keyOf = (y, m, d) => y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0');
  function dateOfKey(key) { const p = key.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12)); }
  const keyOfDate = (d) => keyOf(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  function addDays(key, n) { const d = dateOfKey(key); d.setUTCDate(d.getUTCDate() + n); return keyOfDate(d); }
  const daysBetween = (a, b) => Math.round((dateOfKey(b) - dateOfKey(a)) / 86400000);
  function validKey(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const p = s.split('-');
    return +p[1] >= 1 && +p[1] <= 12 && keyOfDate(dateOfKey(s)) === s;
  }
  // "Oct 27, 2026" · "Saturday, October 31" · "October 31, 2026"
  const pubDate = (key) => { const d = dateOfKey(key); return MONTH[d.getUTCMonth()] + ' ' + d.getUTCDate() + ', ' + d.getUTCFullYear(); };
  const dayMonth = (key) => { const d = dateOfKey(key); return DAY_LONG[d.getUTCDay()] + ', ' + MONTH_LONG[d.getUTCMonth()] + ' ' + d.getUTCDate(); };
  const monthDay = (key) => { const d = dateOfKey(key); return MONTH_LONG[d.getUTCMonth()] + ' ' + d.getUTCDate(); };
  const fullDate = (key) => monthDay(key) + ', ' + key.slice(0, 4);
  // Month numbers: year × 12 + month index, so months can be added and compared.
  const monthNo = (key) => +key.slice(0, 4) * 12 + (+key.slice(5, 7) - 1);
  const monthKey = (no) => Math.floor(no / 12) + '-' + String((no % 12) + 1).padStart(2, '0');
  const monthLabel = (no) => MONTH_LONG[no % 12] + ' ' + Math.floor(no / 12);

  const tzParts = new Intl.DateTimeFormat('en-US', { timeZone: D.COMPANY.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  // ?now=2027-04-14T16:30 previews the whole site at that Central date and time.
  const NOW_PARAM = /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2})$/.exec(params.get('now') || '');
  const previewing = !!(NOW_PARAM && validKey(NOW_PARAM[1]) && +NOW_PARAM[2] < 24 && +NOW_PARAM[3] < 60);
  function nowCT() {
    if (previewing) return { key: NOW_PARAM[1], mins: +NOW_PARAM[2] * 60 + +NOW_PARAM[3] };
    const o = {};
    tzParts.formatToParts(new Date()).forEach((p) => { o[p.type] = p.value; });
    return { key: keyOf(+o.year, +o.month, +o.day), mins: (+o.hour % 24) * 60 + +o.minute };
  }
  const today = nowCT().key;

  /* ------------------------------------------------------------------
   * 3. Batches — see BATCHES in data.js. Batch n ships in month firstShip + every × (n − 1). The open
   *    batch is the first shipping at least `lead` months after this month; it takes reservations from
   *    the first day of month (ship − lead − every + 1) to the last day of month (ship − lead).
   * ------------------------------------------------------------------ */
  function batchFor(key) {
    const B = D.BATCHES;
    const first = monthNo(B.firstShip + '-01');
    const k = Math.max(0, Math.ceil((monthNo(key) + B.lead - first) / B.every));
    const ship = first + B.every * k;
    const openNo = ship - B.lead - B.every + 1;
    const start = monthKey(openNo) + '-01';
    const end = addDays(monthKey(ship - B.lead + 1) + '-01', -1);
    const f = clamp(daysBetween(start, key) / (daysBetween(start, end) + 1), 0, 1);
    const left = Math.max(B.minLeft, Math.round(B.size - (B.size - B.minLeft) * f));
    return {
      n: k + 1,
      shipNo: ship,
      ship: monthLabel(ship),
      shipKey: monthKey(ship),
      size: B.size,
      left: left,
      taken: B.size - left,
      close: end,
      next: { n: k + 2, ship: monthLabel(ship + B.every), opens: addDays(end, 1) }
    };
  }
  const batch = batchFor(today);
  const batchName = (n) => 'Batch ' + n;

  /* ------------------------------------------------------------------
   * 4. Header and reveal
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
   * 5. Batch panels — every element with a data-batch-* attribute shows the open batch.
   * ------------------------------------------------------------------ */
  $$('[data-batch-line]').forEach((el) => {
    el.innerHTML = '<a href="reserve.html" class="hover:text-snow"><span class="font-semibold text-ember">' + batchName(batch.n) + ' is open</span> · ships ' + batch.ship + ' · ' + batch.left + ' of ' + batch.size + ' spots left</a>';
  });
  setText('[data-batch-name]', batchName(batch.n));
  setText('[data-batch-ship]', batch.ship);
  setText('[data-batch-left]', String(batch.left));
  setText('[data-batch-size]', String(batch.size));
  setText('[data-batch-taken]', String(batch.taken));
  setText('[data-batch-close]', dayMonth(batch.close));
  setText('[data-batch-next]', batchName(batch.next.n) + ' opens ' + monthDay(batch.next.opens) + ' and ships ' + batch.next.ship + '.');
  $$('[data-batch-meter]').forEach((el) => { el.style.width = Math.round((batch.taken / batch.size) * 100) + '%'; });

  /* ------------------------------------------------------------------
   * 6. Builds — { color, battery, acc: [] }, always validated against BUILD in data.js.
   * ------------------------------------------------------------------ */
  const BUILD = D.BUILD;
  const ACC_ORDER = Object.keys(BUILD.accessories);

  // Unknown values fall back to the defaults; accessories that need another one bring it along.
  function normalizeBuild(raw) {
    const r = raw && typeof raw === 'object' ? raw : {};
    const color = hasOwn(BUILD.colors, r.color) ? r.color : BUILD.defaults.color;
    const battery = hasOwn(BUILD.batteries, r.battery) ? r.battery : BUILD.defaults.battery;
    const want = Array.isArray(r.acc) ? r.acc.filter((k) => hasOwn(BUILD.accessories, k)) : [];
    want.slice().forEach((k) => (BUILD.accessories[k].requires || []).forEach((need) => { if (want.indexOf(need) === -1) want.push(need); }));
    return { color: color, battery: battery, acc: ACC_ORDER.filter((k) => want.indexOf(k) !== -1) };
  }
  // A build from ?color=&battery=&acc=, or null when the URL has none of them.
  function buildFromParams() {
    if (!params.has('color') && !params.has('battery') && !params.has('acc')) return null;
    return normalizeBuild({ color: params.get('color'), battery: params.get('battery'), acc: (params.get('acc') || '').split(',') });
  }
  function savedBuild() {
    const raw = store.get(STORE_BUILD);
    return raw && typeof raw === 'object' && hasOwn(BUILD.colors, raw.color) ? normalizeBuild(raw) : null;
  }
  const buildQuery = (b) => 'color=' + b.color + '&battery=' + b.battery + (b.acc.length ? '&acc=' + b.acc.join(',') : '');
  const sameBuild = (a, b) => !!a && !!b && buildQuery(a) === buildQuery(b);

  function priceLines(b) {
    const color = BUILD.colors[b.color], bat = BUILD.batteries[b.battery];
    const lines = [
      { label: 'Portage · ' + color.name, amount: BUILD.basePrice },
      { label: bat.name + ' · ' + bat.wh + ' Wh', amount: bat.price }
    ];
    b.acc.forEach((k) => lines.push({ label: BUILD.accessories[k].name, amount: BUILD.accessories[k].price }));
    return lines;
  }
  const buildTotal = (b) => priceLines(b).reduce((sum, l) => sum + l.amount, 0);
  // light: the lighter dashed rule used on the reservation card.
  function linesHTML(lines, light) {
    return lines.map((l, i) => '<li class="' + (light ? 'line-item border-line-strong' : 'line-item') + '"><span>' + esc(l.label) + '</span><span class="shrink-0 font-semibold num">' +
      (i > 0 && l.amount === 0 ? 'Included' : (i > 0 ? '+' : '') + money(l.amount)) + '</span></li>').join('');
  }
  function accList(b) {
    const names = b.acc.map((k) => BUILD.accessories[k].name.replace(/ \(pair\)$/, '').toLowerCase());
    if (!names.length) return '';
    return names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1];
  }
  const buildSummary = (b) => BUILD.colors[b.color].name + ' · ' + BUILD.batteries[b.battery].name + ' · ' + (b.acc.length ? plural(b.acc.length, 'accessory', 'accessories') : 'no accessories');

  // Recolor the drawing and show the parts in the build. Parts are <g data-part="..."> in the SVG.
  function paintBike(svg, b) {
    if (!svg) return;
    svg.style.setProperty('--frame', BUILD.colors[b.color].hex);
    const on = b.acc.slice();
    if (b.battery === 'dual') on.push('battery-dual');
    $$('[data-part]', svg).forEach((g) => {
      if (on.indexOf(g.getAttribute('data-part')) !== -1) g.removeAttribute('hidden'); else g.setAttribute('hidden', '');
    });
    const extras = accList(b);
    svg.setAttribute('aria-label', 'Portage cargo e-bike in ' + BUILD.colors[b.color].name + ' with the ' + BUILD.batteries[b.battery].name.toLowerCase() + (extras ? ', ' + extras : ''));
  }

  // Color swatches as an ARIA radio group (arrow keys move and select, like native radios).
  function renderSwatches(group, current, onPick, small) {
    const keys = Object.keys(BUILD.colors);
    const label = group.querySelector('span');
    group.innerHTML = '';
    if (label) group.appendChild(label);
    keys.forEach((k) => {
      const c = BUILD.colors[k];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'swatch' + (small ? ' size-10' : '');
      btn.setAttribute('role', 'radio');
      btn.setAttribute('data-color', k);
      btn.setAttribute('aria-label', c.name);
      btn.title = c.name;
      btn.style.background = c.hex;
      group.appendChild(btn);
    });
    const buttons = $$('[data-color]', group);
    function sync(key) {
      buttons.forEach((b) => {
        const on = b.getAttribute('data-color') === key;
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
      });
    }
    buttons.forEach((b, i) => {
      b.addEventListener('click', () => { sync(b.getAttribute('data-color')); onPick(b.getAttribute('data-color')); });
      b.addEventListener('keydown', (e) => {
        const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        const next = buttons[(i + step + buttons.length) % buttons.length];
        next.focus();
        next.click();
      });
    });
    sync(current);
    return sync;
  }

  /* ------------------------------------------------------------------
   * 7. Home hero — the bike shows your saved build; swatches try other colors.
   * ------------------------------------------------------------------ */
  const heroSwatches = $('[data-hero-swatches]');
  if (heroSwatches) {
    const heroBike = $('[data-hero-bike] svg');
    let hb = savedBuild() || normalizeBuild(BUILD.defaults);
    const paintHero = () => {
      paintBike(heroBike, hb);
      setText('[data-hero-color]', BUILD.colors[hb.color].name);
      $$('[data-hero-build]').forEach((a) => { a.href = 'bike.html?' + buildQuery(hb); });
      $$('[data-hero-reserve]').forEach((a) => { a.href = 'reserve.html?' + buildQuery(hb); });
    };
    renderSwatches(heroSwatches, hb.color, (k) => { hb = normalizeBuild({ color: k, battery: hb.battery, acc: hb.acc }); paintHero(); }, true);
    paintHero();
  }

  /* ------------------------------------------------------------------
   * 8. Configurator (bike.html)
   * ------------------------------------------------------------------ */
  const colorGroup = $('[data-colors]');
  if (colorGroup && page === 'bike') {
    const svg = $('[data-config-bike] svg');
    const fromUrl = buildFromParams();
    const saved = savedBuild();
    let build = fromUrl || saved || normalizeBuild(BUILD.defaults);
    const status = $('[data-build-status]');
    const note = $('[data-acc-note]');
    const say = (msg) => { status.textContent = msg; };

    $('[data-batteries]').innerHTML = Object.keys(BUILD.batteries).map((k) => {
      const b = BUILD.batteries[k];
      return '<label class="option"><input type="radio" name="battery" value="' + k + '" class="sr-only"><span class="option-dot" aria-hidden="true"></span>' +
        '<span class="min-w-0 flex-1"><span class="flex flex-wrap items-baseline justify-between gap-x-4"><span class="font-semibold">' + esc(b.name) + ' · <span class="num">' + b.wh + ' Wh</span></span><span class="font-display font-bold num">' + (b.price ? '+' + money(b.price) : 'Included') + '</span></span>' +
        '<span class="mt-0.5 block text-sm text-muted">' + esc(b.detail) + '. Estimated range ' + esc(b.range) + '.</span></span></label>';
    }).join('');
    $('[data-accessories]').innerHTML = ACC_ORDER.map((k) => {
      const a = BUILD.accessories[k];
      return '<label class="option"><input type="checkbox" name="acc" value="' + k + '" class="sr-only"><span class="option-box" aria-hidden="true"><svg viewBox="0 0 16 16" class="size-4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m3.5 8.5 3 3 6-7"/></svg></span>' +
        '<span class="min-w-0 flex-1"><span class="flex flex-wrap items-baseline justify-between gap-x-4"><span class="font-semibold">' + esc(a.name) + '</span><span class="font-display font-bold num">+' + money(a.price) + '</span></span>' +
        '<span class="mt-0.5 block text-sm text-muted">' + esc(a.detail) + (a.requires ? ' Mounts on the rear rack.' : '') + '</span></span></label>';
    }).join('');

    const syncColor = renderSwatches(colorGroup, build.color, (k) => { build.color = k; render(); });

    function render(fromUser) {
      syncColor(build.color);
      $$('input[name="battery"]').forEach((i) => { i.checked = i.value === build.battery; });
      $$('input[name="acc"]').forEach((i) => { i.checked = build.acc.indexOf(i.value) !== -1; });
      paintBike(svg, build);
      setText('[data-build-caption]', BUILD.colors[build.color].name + ' · ' + BUILD.batteries[build.battery].name);
      setText('[data-build-acc-count]', build.acc.length ? plural(build.acc.length, 'accessory', 'accessories') : 'No accessories');
      setText('[data-color-note]', BUILD.colors[build.color].note);
      $('[data-lines]').innerHTML = linesHTML(priceLines(build));
      setText('[data-total]', money(buildTotal(build)));
      const q = buildQuery(build);
      $('[data-reserve-link]').href = 'reserve.html?' + q;
      try { window.history.replaceState(null, '', '?' + q + (previewing ? '&now=' + params.get('now') : '')); } catch (e) { /* file:// in some browsers */ }
      if (fromUser) { say(''); $('[data-share-wrap]').hidden = true; }
      renderSaved();
    }

    function renderSaved() {
      const s = savedBuild();
      const panel = $('[data-saved-panel]');
      panel.hidden = !s;
      if (!s) return;
      setText('[data-saved-summary]', buildSummary(s) + ' · ' + money(buildTotal(s)));
      $('[data-load-saved]').hidden = sameBuild(s, build);
    }

    $('[data-batteries]').addEventListener('change', (e) => {
      if (e.target.name !== 'battery' || !hasOwn(BUILD.batteries, e.target.value)) return;
      build.battery = e.target.value;
      note.textContent = '';
      render(true);
    });
    $('[data-accessories]').addEventListener('change', (e) => {
      const k = e.target.value;
      if (e.target.name !== 'acc' || !hasOwn(BUILD.accessories, k)) return;
      let msg = '';
      if (e.target.checked) {
        const add = (BUILD.accessories[k].requires || []).filter((need) => build.acc.indexOf(need) === -1);
        build = normalizeBuild({ color: build.color, battery: build.battery, acc: build.acc.concat([k]) });
        if (add.length) msg = BUILD.accessories[add[0]].name + ' added: the ' + BUILD.accessories[k].name.replace(/ \(pair\)$/, '').toLowerCase() + ' mounts on it.';
      } else {
        const gone = build.acc.filter((a) => a === k || (BUILD.accessories[a].requires || []).indexOf(k) !== -1);
        build.acc = build.acc.filter((a) => gone.indexOf(a) === -1);
        const dependents = gone.filter((a) => a !== k).map((a) => BUILD.accessories[a].name.replace(/ \(pair\)$/, ''));
        if (dependents.length) msg = dependents.join(' and ') + ' removed too: ' + (dependents.length === 1 ? 'it mounts' : 'they mount') + ' on the rear rack.';
      }
      note.textContent = msg;
      render(true);
    });

    $('[data-save]').addEventListener('click', () => {
      store.set(STORE_BUILD, build);
      renderSaved();
      say(savedBuild() ? 'Build saved on this device. It will be here when you come back.' : 'Your browser didn’t let us save it. Copy the link instead.');
    });
    $('[data-load-saved]').addEventListener('click', () => {
      const s = savedBuild();
      if (!s) return;
      build = s;
      note.textContent = '';
      render(true);
      say('Loaded your saved build.');
    });
    $('[data-clear-saved]').addEventListener('click', () => {
      store.remove(STORE_BUILD);
      renderSaved();
      say('Saved build removed from this device.');
    });
    $('[data-share]').addEventListener('click', () => {
      const url = window.location.href;
      const fallback = () => {
        const wrap = $('[data-share-wrap]'), input = $('[data-share-url]');
        input.value = url;
        wrap.hidden = false;
        input.focus();
        input.select();
        say('Copy the link below to share this build.');
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(() => say('Link copied. Anyone who opens it sees this build.'), fallback);
      } else fallback();
    });

    render();
    if (!fromUrl && saved) say('Loaded your saved build.');
  }

  /* ------------------------------------------------------------------
   * 9. Range estimator (range.html) — formula in RANGE in data.js.
   * ------------------------------------------------------------------ */
  const R = D.RANGE;
  // Estimated miles for a battery key and a state { weight, terrain, temp, assist, studs }.
  function rangeMiles(batteryKey, s) {
    const energy = BUILD.batteries[batteryKey].wh * R.usable * tempFactor(s.temp);
    return energy / whPerMile(s);
  }
  const tempFactor = (t) => (t >= R.warm ? 1 : Math.max(R.floor, 1 - (R.warm - t) * R.perDegree));
  const weightFactor = (w) => 1 + (w - R.weightRef) / R.weightPerFactor;
  const whPerMile = (s) => R.assist[s.assist].whPerMile * R.terrain[s.terrain].factor * weightFactor(s.weight) * (s.studs ? R.studs : 1);
  const pct = (f) => (f >= 1 ? '+' : '−') + Math.round(Math.abs(f - 1) * 100) + '%';

  const rangeForm = $('[data-range-form]');
  if (rangeForm) {
    const state = Object.assign({}, R.defaults);
    if (hasOwn(BUILD.batteries, params.get('battery'))) state.battery = params.get('battery');
    const radios = (box, name, map) => {
      $(box).innerHTML = Object.keys(map).map((k) => '<label class="option py-3"><input type="radio" name="' + name + '" value="' + k + '" class="sr-only"><span class="option-dot" aria-hidden="true"></span><span><span class="block font-semibold">' + esc(map[k].name) + '</span>' +
        (map[k].note ? '<span class="block text-sm text-muted">' + esc(map[k].note) + '</span>' : '') + '</span></label>').join('');
    };
    radios('[data-range-batteries]', 'battery', Object.keys(BUILD.batteries).reduce((o, k) => { o[k] = { name: BUILD.batteries[k].name + ' · ' + BUILD.batteries[k].wh + ' Wh' }; return o; }, {}));
    radios('[data-terrain]', 'terrain', R.terrain);
    $('[data-assist]').innerHTML = Object.keys(R.assist).map((k) => '<label class="option justify-center py-3"><input type="radio" name="assist" value="' + k + '" class="sr-only"><span class="font-display font-bold uppercase tracking-[0.04em]">' + esc(R.assist[k].name) + '</span></label>').join('');
    $('[data-presets]').innerHTML = Object.keys(R.presets).map((k) => '<button type="button" class="chip" aria-pressed="false" data-preset="' + k + '">' + esc(R.presets[k].name) + '</button>').join('');

    const f = rangeForm.elements;
    function syncForm() {
      $$('input[name="battery"]', rangeForm).forEach((i) => { i.checked = i.value === state.battery; });
      $$('input[name="terrain"]', rangeForm).forEach((i) => { i.checked = i.value === state.terrain; });
      $$('input[name="assist"]', rangeForm).forEach((i) => { i.checked = i.value === state.assist; });
      f.weight.value = state.weight;
      f.temp.value = state.temp;
      f.studs.checked = state.studs;
      f.trip.value = state.trip;
      setError(rangeForm, 'trip', '');
    }
    function renderRange() {
      $$('[data-preset]').forEach((b) => {
        const p = R.presets[b.getAttribute('data-preset')];
        const match = ['weight', 'terrain', 'temp', 'assist', 'studs', 'trip'].every((k) => p[k] === state[k]);
        b.setAttribute('aria-pressed', String(match));
      });
      setText('[data-out="weight"]', state.weight + ' lb');
      setText('[data-out="temp"]', (state.temp < 0 ? '−' + Math.abs(state.temp) : state.temp) + '°F');
      const miles = rangeMiles(state.battery, state);
      const std = rangeMiles('standard', state), dual = rangeMiles('dual', state);
      setText('[data-range-miles]', String(Math.round(miles)));
      setText('[data-range-band]', Math.round(miles * (1 - R.band)) + ' and ' + Math.round(miles * (1 + R.band)) + ' miles');
      setText('[data-range-battery]', 'the ' + BUILD.batteries[state.battery].name.toLowerCase());

      const need = state.trip * R.reserve;
      const max = Math.max(dual, need) * 1.08;
      const bar = (label, val, on) => '<div><div class="flex items-baseline justify-between gap-3 text-sm"><span class="' + (on ? 'font-semibold text-snow' : 'text-frost') + '">' + label + '</span><span class="font-semibold text-snow num">' + Math.round(val) + ' mi</span></div>' +
        '<div class="meter relative mt-1.5"><div class="h-full ' + (on ? 'bg-ember' : 'bg-frost/60') + '" style="width:' + clamp((val / max) * 100, 2, 100).toFixed(1) + '%"></div></div></div>';
      $('[data-range-chart]').innerHTML = '<div class="relative grid gap-4">' +
        bar('Standard · 625 Wh', std, state.battery === 'standard') + bar('Dual · 900 Wh', dual, state.battery === 'dual') +
        '<div class="pointer-events-none absolute -bottom-1 -top-1 border-l-2 border-dashed border-ice" style="left:' + clamp((need / max) * 100, 0, 100).toFixed(1) + '%" aria-hidden="true"></div></div>' +
        '<p class="mt-3 flex items-center gap-2 text-sm text-frost"><span class="inline-block h-4 border-l-2 border-dashed border-ice" aria-hidden="true"></span>Your round trip with 25% to spare: <span class="font-semibold text-snow num">' + (Math.round(need * 10) / 10) + ' mi</span></p>';

      const bat = BUILD.batteries[state.battery];
      const tf = tempFactor(state.temp), wf = weightFactor(state.weight);
      const why = [
        bat.wh + ' Wh battery, about ' + Math.round(R.usable * 100) + '% usable: ' + Math.round(bat.wh * R.usable) + ' Wh',
        state.temp + '°F: the cells give ' + Math.round(tf * 100) + '% of their energy' + (tf < 1 ? ' (the heater helps, but cold still costs range)' : ''),
        R.assist[state.assist].name + ' assist: ' + R.assist[state.assist].whPerMile + ' Wh a mile on flat ground with ' + R.weightRef + ' lb aboard',
        R.terrain[state.terrain].name + ': ' + (R.terrain[state.terrain].factor === 1 ? 'no extra energy' : pct(R.terrain[state.terrain].factor) + ' energy a mile'),
        state.weight + ' lb rider and cargo: ' + (wf === 1 ? 'no change' : pct(wf) + ' energy a mile')
      ];
      if (state.studs) why.push('Studded tires: ' + pct(R.studs) + ' energy a mile');
      why.push('Together: ' + whPerMile(state).toFixed(1) + ' Wh a mile, so about ' + Math.round(miles) + ' miles');
      $('[data-range-why]').innerHTML = why.map((w) => '<li class="flex gap-2.5"><span class="mt-[0.45em] size-2 shrink-0 skew-x-[-20deg] bg-ember" aria-hidden="true"></span><span>' + esc(w) + '</span></li>').join('');

      let pick, title, text;
      const useOf = (val) => Math.round((state.trip / val) * 100);
      if (std >= need) {
        pick = 'standard';
        title = 'The standard battery covers it';
        text = 'Your ' + state.trip + '-mile round trip uses about ' + useOf(std) + '% of a charge on the standard battery, with plenty to spare.';
      } else if (dual >= need) {
        pick = 'dual';
        title = 'Go for the dual battery';
        text = 'Your ' + state.trip + '-mile round trip would use about ' + useOf(std) + '% of the standard battery in these conditions, which leaves too little for detours. On the dual battery it uses about ' + useOf(dual) + '%.';
      } else {
        pick = 'dual';
        title = 'Dual battery, and a charge at work';
        text = 'Your ' + state.trip + '-mile round trip is more than one charge covers in these conditions: about ' + Math.round(dual) + ' miles on the dual battery. Owners with rides like this top up at work; the charger weighs 2 lb.';
      }
      setText('[data-suggest-title]', title);
      setText('[data-suggest-text]', text);
      const link = $('[data-suggest-link]');
      link.href = 'bike.html?battery=' + pick;
      link.textContent = 'Build with the ' + (pick === 'dual' ? 'dual' : 'standard') + ' battery';
    }

    rangeForm.addEventListener('input', (e) => {
      const t = e.target;
      if (t.name === 'weight') state.weight = clamp(+t.value, 120, 400);
      else if (t.name === 'temp') state.temp = clamp(+t.value, -20, 90);
      else if (t.name === 'studs') state.studs = t.checked;
      else if (t.name === 'battery' && hasOwn(BUILD.batteries, t.value)) state.battery = t.value;
      else if (t.name === 'terrain' && hasOwn(R.terrain, t.value)) state.terrain = t.value;
      else if (t.name === 'assist' && hasOwn(R.assist, t.value)) state.assist = t.value;
      else if (t.name === 'trip') {
        const v = Number(t.value);
        if (!t.value || !Number.isFinite(v) || v < 1 || v > 80) { setError(rangeForm, 'trip', 'Enter a round trip between 1 and 80 miles.'); return; }
        setError(rangeForm, 'trip', '');
        state.trip = Math.round(v * 10) / 10;
      }
      renderRange();
    });
    rangeForm.addEventListener('submit', (e) => e.preventDefault());
    $('[data-presets]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-preset]');
      if (!b || !hasOwn(R.presets, b.getAttribute('data-preset'))) return;
      const p = R.presets[b.getAttribute('data-preset')];
      ['weight', 'terrain', 'temp', 'assist', 'studs', 'trip'].forEach((k) => { state[k] = p[k]; });
      syncForm();
      renderRange();
    });
    syncForm();
    renderRange();
  }

  /* ------------------------------------------------------------------
   * 10. Reserve (reserve.html)
   * ------------------------------------------------------------------ */
  // The delivery zone for a 5-digit ZIP, matched on its first three digits (ZONES in data.js), or null.
  function zoneFor(zip) {
    if (!/^\d{5}$/.test(zip)) return null;
    const p = +zip.slice(0, 3);
    return D.ZONES.find((z) => z.prefixes.some((r) => {
      const ab = r.split('-');
      return p >= +ab[0] && p <= +(ab[1] || ab[0]);
    })) || null;
  }
  const zoneFee = (z) => (z.fee === 0 ? 'free' : money(z.fee));
  const DELIVERY_NEXT = {
    local: 'Aune brings your Portage to your door, fits it to you and rides the first mile with you.',
    region: 'Your Portage arrives by freight, fully built and tuned, and we fit it to you on a video call.',
    national: 'Your Portage arrives in a reusable crate, 90% assembled, with a ten-minute setup guide and a video fitting call.'
  };
  // A saved reservation, checked field by field.
  function savedReservation() {
    const r = store.get(STORE_RESERVATION);
    if (!r || typeof r !== 'object') return null;
    if (typeof r.ref !== 'string' || !/^[A-Z]{2}-\d{2,3}-[A-Z2-9]{4}$/.test(r.ref)) return null;
    if (typeof r.first !== 'string' || typeof r.email !== 'string' || !Number.isInteger(r.batch) || !Number.isInteger(r.shipNo) || !validKey(r.created)) return null;
    return Object.assign({}, r, { build: normalizeBuild(r.build) });
  }

  const reserveForm = $('[data-reserve-form]');
  if (reserveForm) {
    const svg = $('[data-reserve-bike] svg');
    const fromUrl = buildFromParams();
    const saved = savedBuild();
    let build = fromUrl || saved || normalizeBuild(BUILD.defaults);
    let zone = null;
    const status = $('[data-reserve-status]');

    function renderSummary(b, z, sourceText) {
      paintBike(svg, b);
      const lines = priceLines(b);
      if (z && z.fee !== null) lines.push({ label: 'Delivery · ' + z.name, amount: z.fee });
      let html = linesHTML(lines, true);
      if (z && z.fee === 0) html = html.replace(/(Delivery[^<]*<\/span><span[^>]*>)Included/, '$1Free');
      $('[data-reserve-lines]').innerHTML = html;
      setText('[data-reserve-total]', money(lines.reduce((s, l) => s + l.amount, 0)));
      if (sourceText) setText('[data-build-source]', sourceText);
      $$('[data-edit-build], [data-saved-edit]').forEach((a) => { a.href = 'bike.html?' + buildQuery(b); });
    }
    const sourceText = fromUrl ? 'Your build from the configurator.' : saved ? 'Your saved build.' : 'The standard Portage. Build your own to change it.';

    function showForm() {
      $('[data-saved-reservation]').hidden = true;
      $('[data-reserve-success]').hidden = true;
      reserveForm.hidden = false;
      renderSummary(build, zone, sourceText);
    }
    function showSaved(r) {
      reserveForm.hidden = true;
      $('[data-reserve-success]').hidden = true;
      const panel = $('[data-saved-reservation]');
      panel.hidden = false;
      $('[data-cancel-confirm]').hidden = true;
      $('[data-cancel-start]').hidden = false;
      setText('[data-saved-name]', r.first);
      setText('[data-saved-batch]', batchName(r.batch));
      setText('[data-saved-ship]', monthLabel(r.shipNo));
      setText('[data-saved-ref]', r.ref);
      setText('[data-cancel-ref]', r.ref);
      setText('[data-saved-date]', fullDate(r.created));
      renderSummary(r.build, zoneFor(r.zip), 'Your reserved build.');
    }
    function showSuccess(r) {
      reserveForm.hidden = true;
      $('[data-saved-reservation]').hidden = true;
      const done = $('[data-reserve-success]');
      done.hidden = false;
      setText('[data-res-greeting]', 'You’re in ' + batchName(r.batch) + ', ' + r.first + '.');
      setText('[data-res-ref]', r.ref);
      setText('[data-res-ship]', monthLabel(r.shipNo));
      setText('[data-res-email]', r.email);
      const z = zoneFor(r.zip);
      setText('[data-res-delivery]', z && hasOwn(DELIVERY_NEXT, z.id) ? DELIVERY_NEXT[z.id] : DELIVERY_NEXT.national);
      renderSummary(r.build, z, 'Your reserved build.');
      done.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      done.focus({ preventScroll: true });
    }

    const zip = reserveForm.elements.zip;
    zip.addEventListener('input', () => {
      zip.value = zip.value.replace(/\D/g, '').slice(0, 5);
      zone = zoneFor(zip.value);
      const out = $('[data-zone-result]');
      if (!zone) out.textContent = 'We deliver across the contiguous US.';
      else if (zone.fee === null) out.textContent = zone.detail;
      else out.textContent = zone.name + ' (' + zoneFee(zone) + '). ' + zone.detail;
      if (zone) setError(reserveForm, 'zip', '');
      renderSummary(build, zone && zone.fee !== null ? zone : null);
    });

    reserveForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = reserveForm.elements;
      const first = f.first.value.trim(), last = f.last.value.trim(), email = f.email.value.trim(), phone = f.phone.value.trim();
      const digits = phone.replace(/\D/g, '');
      const z = zoneFor(f.zip.value.trim());
      const ok = [
        setError(reserveForm, 'first', first ? (first.length > 60 ? 'Please shorten your first name.' : '') : 'Please enter your first name.'),
        setError(reserveForm, 'last', last ? (last.length > 60 ? 'Please shorten your last name.' : '') : 'Please enter your last name.'),
        setError(reserveForm, 'email', !email ? 'Please enter your email address.' : EMAIL.test(email) ? '' : 'That email address doesn’t look right.'),
        setError(reserveForm, 'phone', !phone || digits.length === 10 || (digits.length === 11 && digits[0] === '1') ? '' : 'Please enter a 10-digit US phone number, or leave it empty.'),
        setError(reserveForm, 'zip', !/^\d{5}$/.test(f.zip.value.trim()) ? 'Please enter a 5-digit ZIP code.' : z && z.fee === null ? 'We can’t deliver to Alaska, Hawaii or US territories yet.' : '')
      ].every(Boolean);
      const formError = $('[data-form-error]');
      if (!ok) {
        formError.textContent = 'Please check the highlighted fields.';
        const bad = $('[aria-invalid="true"]', reserveForm);
        if (bad) bad.focus();
        return;
      }
      formError.textContent = '';
      // To take real reservations, send these fields to your backend or payment provider here, and
      // show the success state only when it answers OK. See DOCS.md, "Forms".
      const ref = D.COMPANY.reservePrefix + '-' + String(batch.n).padStart(2, '0') + '-' + code4(hash(email.toLowerCase() + '|' + today));
      const reservation = {
        ref: ref, first: first, last: last, email: email, phone: phone, zip: f.zip.value.trim(),
        updates: f.updates.checked, build: build, total: buildTotal(build) + (z.fee || 0),
        batch: batch.n, shipNo: batch.shipNo, created: today
      };
      store.set(STORE_RESERVATION, reservation);
      showSuccess(savedReservation() || Object.assign({}, reservation));
      status.textContent = '';
    });

    $('[data-cancel]').addEventListener('click', () => {
      $('[data-cancel-start]').hidden = true;
      $('[data-cancel-confirm]').hidden = false;
      $('[data-cancel-yes]').focus();
    });
    $('[data-cancel-no]').addEventListener('click', () => {
      $('[data-cancel-confirm]').hidden = true;
      $('[data-cancel-start]').hidden = false;
      $('[data-cancel]').focus();
    });
    $('[data-cancel-yes]').addEventListener('click', () => {
      const r = savedReservation();
      store.remove(STORE_RESERVATION);
      $('[data-cancel-confirm]').hidden = true;
      $('[data-cancel-start]').hidden = false;
      showForm();
      status.textContent = 'Reservation ' + (r ? r.ref : '') + ' canceled. Your $150 deposit will be refunded in full.';
      reserveForm.elements.first.focus();
    });

    const existing = savedReservation();
    if (existing) showSaved(existing); else showForm();
  }

  /* ------------------------------------------------------------------
   * 11. Cost calculator (specs.html) — formula in COST in data.js.
   * ------------------------------------------------------------------ */
  const costForm = $('[data-cost-form]');
  if (costForm) {
    const C = D.COST;
    function renderCost() {
      const f = costForm.elements;
      const miles = clamp(+f.miles.value || C.defaults.miles, 5, 200);
      const perMile = clamp(+f.perMile.value || C.defaults.perMile, 0.4, 1.2);
      const parking = clamp(+f.parking.value || 0, 0, 300);
      const yearMiles = miles * 52;
      const car = yearMiles * perMile + parking * 12;
      const running = (yearMiles * C.whPerMile / 1000) * C.kwhPrice + C.upkeep;
      const bike = running + BUILD.basePrice / C.years;
      const monthly = (car - running) / 12;
      setText('[data-cost-out="miles"]', miles + ' mi');
      setText('[data-cost-out="perMile"]', '$' + perMile.toFixed(2));
      setText('[data-cost-out="parking"]', money(parking));
      setText('[data-cost-car]', money(car));
      setText('[data-cost-bike]', money(bike));
      setText('[data-cost-running]', money(running));
      const max = Math.max(car, bike);
      $('[data-cost-car-bar]').style.width = Math.round((car / max) * 100) + '%';
      $('[data-cost-bike-bar]').style.width = Math.round((bike / max) * 100) + '%';
      setText('[data-cost-save]', money(Math.max(0, car - bike)));
      const months = monthly > 0 ? Math.round(BUILD.basePrice / monthly) : Infinity;
      setText('[data-cost-payback]', months > 120 ? 'Over 10 years' : plural(months, 'month'));
    }
    costForm.addEventListener('input', renderCost);
    costForm.addEventListener('submit', (e) => e.preventDefault());
    renderCost();
  }

  /* ------------------------------------------------------------------
   * 12. Journal — dates move forward by whole weeks (DEMO in data.js); covers are drawn below.
   * ------------------------------------------------------------------ */
  const demoShift = D.DEMO.KEEP_DEMO_CURRENT && validKey(D.DEMO.DEMO_ANCHOR) ? Math.max(0, Math.floor(daysBetween(D.DEMO.DEMO_ANCHOR, today) / 7) * 7) : 0;
  const POSTS = D.POSTS.map((p) => Object.assign({}, p, { date: addDays(p.date, demoShift) }));
  const postBySlug = (slug) => POSTS.find((p) => p.slug === slug) || null;

  // Cover drawings, 640×400, one per post (POSTS[].art).
  const ART = {
    hill: () => '<rect width="640" height="400" fill="#d4e8ea"/><circle cx="500" cy="96" r="54" fill="#f7dbd2"/><path d="M0 330L640 120V400H0Z" fill="#f3f2ed"/><path d="M0 330L640 120" stroke="#14171a" stroke-width="5"/><path d="M60 330L620 146M60 344L620 160" stroke="#0f6672" stroke-width="3" stroke-dasharray="14 10" opacity=".6"/><g fill="#ffffff" stroke="#0f6672" stroke-width="2"><circle cx="90" cy="70" r="6"/><circle cx="200" cy="130" r="4"/><circle cx="320" cy="60" r="5"/><circle cx="160" cy="220" r="5"/><circle cx="410" cy="200" r="4"/></g><g transform="translate(380 150) rotate(-18)"><circle cx="0" cy="40" r="26" fill="none" stroke="#14171a" stroke-width="9"/><circle cx="110" cy="40" r="26" fill="none" stroke="#14171a" stroke-width="9"/><path d="M0 40L48 38L40 -6M48 38L92 0L110 40M-30 10H45" fill="none" stroke="#c63d1f" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/></g><text x="40" y="380" font-family="Kanit, sans-serif" font-size="30" font-weight="800" font-style="italic" fill="#14171a">+400 FT</text>',
    jig: () => '<rect width="640" height="400" fill="#1e2327"/><path d="M0 330H640" stroke="#30373c" stroke-width="40"/><g stroke="#30373c" stroke-width="4"><path d="M80 0V400M560 0V400"/></g><path d="M170 270L330 262L300 120M330 262L470 120L300 120M130 210H300" fill="none" stroke="#c9d3d6" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><g fill="#c63d1f" stroke="#14171a" stroke-width="3"><rect x="150" y="248" width="40" height="44" rx="4"/><rect x="310" y="240" width="40" height="44" rx="4"/><rect x="452" y="98" width="40" height="44" rx="4"/><rect x="280" y="98" width="40" height="44" rx="4"/><rect x="110" y="188" width="40" height="44" rx="4"/></g><g fill="#ff8a66"><circle cx="400" cy="190" r="6"/><circle cx="414" cy="176" r="3"/><circle cx="388" cy="178" r="3"/></g><text x="40" y="60" font-family="Kanit, sans-serif" font-size="28" font-weight="800" font-style="italic" fill="#ff8a66">JIG NO. 2</text>',
    battery: () => '<rect width="640" height="400" fill="#0f6672"/><g fill="none" stroke="#ff8a66" stroke-width="6" stroke-linecap="round" opacity=".8"><path d="M140 90q20 -20 0 -40M190 90q20 -20 0 -40M240 90q20 -20 0 -40"/></g><rect x="110" y="110" width="320" height="200" rx="22" fill="#14171a"/><rect x="130" y="130" width="280" height="160" rx="12" fill="#ff8a66" opacity=".25"/><g fill="#9fd9e3"><rect x="150" y="150" width="48" height="120" rx="8"/><rect x="214" y="150" width="48" height="120" rx="8"/><rect x="278" y="150" width="48" height="120" rx="8"/><rect x="342" y="150" width="48" height="120" rx="8" opacity=".4"/></g><g transform="translate(500 80)"><rect x="-18" y="0" width="36" height="200" rx="18" fill="#f3f2ed" stroke="#14171a" stroke-width="4"/><circle cx="0" cy="226" r="34" fill="#c63d1f" stroke="#14171a" stroke-width="4"/><rect x="-7" y="90" width="14" height="130" fill="#c63d1f"/><path d="M18 40h14M18 80h14M18 120h14M18 160h14" stroke="#f3f2ed" stroke-width="4"/></g><text x="110" y="370" font-family="Kanit, sans-serif" font-size="30" font-weight="800" font-style="italic" fill="#f3f2ed">20°F → 40°F</text>',
    chart: () => '<rect width="640" height="400" fill="#f3f2ed"/><path d="M60 340H590" stroke="#14171a" stroke-width="4"/><g stroke="#14171a" stroke-width="3"><rect x="90" y="140" width="80" height="200" fill="#c63d1f"/><rect x="210" y="200" width="80" height="140" fill="#0f6672"/><rect x="330" y="250" width="80" height="90" fill="#e7e2d3"/><rect x="450" y="290" width="80" height="50" fill="#6a4c9c"/></g><g font-family="Kanit, sans-serif" font-weight="800" font-style="italic" fill="#14171a" font-size="28"><text x="98" y="128">62%</text><text x="218" y="188">38%</text><text x="342" y="238">14</text><text x="456" y="278">7.4</text></g><text x="60" y="70" font-family="Kanit, sans-serif" font-size="34" font-weight="800" font-style="italic" fill="#14171a">THE FIRST 100</text>',
    tire: () => '<rect width="640" height="400" fill="#e8e6de"/><circle cx="330" cy="420" r="300" fill="#191c1f"/><circle cx="330" cy="420" r="228" fill="#e8e6de"/><circle cx="330" cy="420" r="210" fill="none" stroke="#7d858a" stroke-width="14"/>' + (function () { let s = ''; for (let i = 0; i < 26; i++) { const a = Math.PI + (i + 0.5) * Math.PI / 26; s += '<circle cx="' + (330 + 300 * Math.cos(a)).toFixed(1) + '" cy="' + (420 + 300 * Math.sin(a)).toFixed(1) + '" r="7" fill="#d5dbde" stroke="#14171a" stroke-width="2"/>'; } return s; })() + '<g fill="#ffffff" stroke="#0f6672" stroke-width="2"><circle cx="80" cy="60" r="6"/><circle cx="560" cy="80" r="5"/><circle cx="600" cy="200" r="4"/></g><text x="230" y="350" font-family="Kanit, sans-serif" font-size="42" font-weight="800" font-style="italic" fill="#14171a">180 STUDS</text>',
    paint: () => '<rect width="640" height="400" fill="#14171a"/><path d="M0 40H640" stroke="#30373c" stroke-width="10"/><g stroke="#c9d3d6" stroke-width="3"><path d="M180 40V90M460 40V90"/></g><g fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="18"><path d="M120 250L260 244L234 110M260 244L380 110L234 110M90 196H234" stroke="#c63d1f"/><path d="M380 300L520 294L494 160M520 294L640 160L494 160" stroke="#0f6672"/></g><g><rect x="40" y="320" width="60" height="40" fill="#c63d1f"/><rect x="110" y="320" width="60" height="40" fill="#0f6672"/><rect x="180" y="320" width="60" height="40" fill="#e7e2d3"/><rect x="250" y="320" width="60" height="40" fill="#2a2f33" stroke="#30373c" stroke-width="2"/><rect x="320" y="320" width="60" height="40" fill="#6a4c9c"/></g>',
    kidseat: () => '<rect width="640" height="400" fill="#f7dbd2"/><circle cx="120" cy="100" r="50" fill="#ff8a66"/><path d="M0 320H640V400H0Z" fill="#e8e6de"/><path d="M0 320H640" stroke="#14171a" stroke-width="4"/><g transform="translate(200 40)"><path d="M40 260L20 70Q16 40 46 38L80 38Q104 38 104 66L112 196L210 200Q232 202 226 226L218 260Z" fill="#eef0f1" stroke="#14171a" stroke-width="6" stroke-linejoin="round"/><path d="M52 76L76 196M86 76L66 196" stroke="#0f6672" stroke-width="10" stroke-linecap="round"/><path d="M200 200Q228 130 280 142" fill="none" stroke="#2a2f33" stroke-width="12" stroke-linecap="round"/><path d="M0 260H260" stroke="#c63d1f" stroke-width="18" stroke-linecap="round"/></g><path d="M470 120q50-40 100 0v20H470Z" fill="#c63d1f" stroke="#14171a" stroke-width="5" stroke-linejoin="round"/><path d="M490 110q30-20 60 0" fill="none" stroke="#f3f2ed" stroke-width="5" stroke-linecap="round"/>',
    seed: () => '<rect width="640" height="400" fill="#d4e8ea"/><path d="M0 300H640V400H0Z" fill="#14171a"/><g transform="translate(240 170) scale(4)"><path d="' + SPROCKET_PATH + '" fill="#c63d1f"/><circle cx="20" cy="20" r="9" fill="#d4e8ea"/></g><path d="M320 250V130" stroke="#2d6a3e" stroke-width="10" stroke-linecap="round"/><path d="M320 170q-60 -10 -70 -70q60 0 70 70Z" fill="#2d6a3e"/><path d="M320 150q50 -10 64 -60q-56 4 -64 60Z" fill="#3f8a54"/><text x="40" y="70" font-family="Kanit, sans-serif" font-size="34" font-weight="800" font-style="italic" fill="#0b4e57">SEED ROUND</text>'
  };
  const SPROCKET_PATH = 'M33.18 17.6L36.94 18.53L36.94 21.47L33.18 22.4L32.62 24.51L35.4 27.2L33.93 29.74L30.22 28.67L28.67 30.22L29.74 33.93L27.2 35.4L24.51 32.62L22.4 33.18L21.47 36.94L18.53 36.94L17.6 33.18L15.49 32.62L12.8 35.4L10.26 33.93L11.33 30.22L9.78 28.67L6.07 29.74L4.6 27.2L7.38 24.51L6.82 22.4L3.06 21.47L3.06 18.53L6.82 17.6L7.38 15.49L4.6 12.8L6.07 10.26L9.78 11.33L11.33 9.78L10.26 6.07L12.8 4.6L15.49 7.38L17.6 6.82L18.53 3.06L21.47 3.06L22.4 6.82L24.51 7.38L27.2 4.6L29.74 6.07L28.67 9.78L30.22 11.33L33.93 10.26L35.4 12.8L32.62 15.49Z';
  const cover = (p) => '<svg viewBox="0 0 640 400" class="block h-auto w-full" aria-hidden="true" focusable="false">' + (hasOwn(ART, p.art) ? ART[p.art]() : ART.hill()) + '</svg>';

  // Illustrated portrait, 200×200, from a PEOPLE entry.
  function portrait(p) {
    const hair = p.hair, skin = p.skin;
    let back = '', top = '';
    if (p.style === 'long') back = '<path d="M58 96q-4-58 42-60q46 2 42 60v70H58Z" fill="' + hair + '"/>';
    if (p.style === 'bun') top = '<circle cx="100" cy="38" r="17" fill="' + hair + '"/>';
    if (p.style === 'curly') top = [[68, 70], [80, 54], [100, 48], [120, 54], [132, 70], [62, 88], [138, 88]].map((c) => '<circle cx="' + c[0] + '" cy="' + c[1] + '" r="15" fill="' + hair + '"/>').join('');
    const cap = p.style === 'bald' ? '<path d="M64 98q0-8 4-14M136 98q0-8-4-14" stroke="' + hair + '" stroke-width="8" stroke-linecap="round"/>'
      : p.style === 'curly' ? '' : '<path d="M62 96q-2-46 38-46q40 0 38 46q-10-22-38-24q-28 2-38 24Z" fill="' + hair + '"/>';
    const beard = p.beard ? '<path d="M70 108q4 40 30 42q26-2 30-42q-8 18-30 18q-22 0-30-18Z" fill="' + hair + '"/>' : '';
    const glasses = p.glasses ? '<g fill="none" stroke="#14171a" stroke-width="3"><circle cx="86" cy="100" r="10"/><circle cx="114" cy="100" r="10"/><path d="M96 100h8"/></g>' : '';
    return '<svg viewBox="0 0 200 200" class="block h-auto w-full" aria-hidden="true" focusable="false"><rect width="200" height="200" fill="#e8e6de"/><circle cx="100" cy="100" r="74" fill="' + (p.shirt === '#c63d1f' ? '#f7dbd2' : '#d4e8ea') + '"/>' + back +
      '<path d="M40 200q4-48 60-50q56 2 60 50Z" fill="' + p.shirt + '" stroke="#14171a" stroke-width="3"/><path d="M88 128h24v24q-12 8-24 0Z" fill="' + skin + '"/>' + top +
      '<ellipse cx="100" cy="100" rx="36" ry="42" fill="' + skin + '"/>' + cap + beard +
      '<circle cx="86" cy="100" r="3.5" fill="#14171a"/><circle cx="114" cy="100" r="3.5" fill="#14171a"/><path d="M90 122q10 8 20 0" fill="none" stroke="#14171a" stroke-width="3" stroke-linecap="round"/>' + glasses + '</svg>';
  }

  function postCard(p, big) {
    const person = hasOwn(D.PEOPLE, p.author) ? D.PEOPLE[p.author] : null;
    const href = 'article.html?a=' + encodeURIComponent(p.slug);
    if (big) {
      return '<a href="' + href + '" class="group card lift grid overflow-hidden lg:grid-cols-[1.2fr_1fr]">' +
        '<div class="overflow-hidden border-b-2 border-ink lg:border-b-0 lg:border-r-2">' + cover(p) + '</div>' +
        '<div class="flex flex-col p-6 sm:p-8"><p class="flex flex-wrap items-center gap-3 text-sm text-muted"><span class="tag">Latest · ' + esc(D.CATEGORIES[p.cat]) + '</span><time datetime="' + p.date + '">' + pubDate(p.date) + '</time></p>' +
        '<h2 class="mt-4 headline text-4xl group-hover:text-ore">' + esc(p.title) + '</h2><p class="mt-4 leading-relaxed text-muted">' + esc(p.dek) + '</p>' +
        '<p class="mt-auto pt-6 text-sm">' + (person ? esc(person.name) + ' · ' : '') + p.minutes + ' min read</p></div></a>';
    }
    return '<li class="reveal"><a href="' + href + '" class="group flex h-full flex-col"><div class="overflow-hidden rounded-lg border-2 border-ink">' + cover(p) + '</div>' +
      '<p class="mt-4 flex flex-wrap items-center gap-3 text-sm text-muted"><span class="tag">' + esc(D.CATEGORIES[p.cat]) + '</span><time datetime="' + p.date + '">' + pubDate(p.date) + '</time></p>' +
      '<h3 class="mt-3 font-display text-2xl font-bold uppercase leading-tight group-hover:text-ore">' + esc(p.title) + '</h3>' +
      '<p class="mt-2 leading-relaxed text-muted">' + esc(p.dek) + '</p></a></li>';
  }

  const journalList = $('[data-journal-list]');
  if (journalList) {
    let cat = hasOwn(D.CATEGORIES, params.get('cat')) ? params.get('cat') : 'all';
    const filters = $('[data-journal-filters]');
    filters.innerHTML = '<button type="button" class="chip" data-cat="all">All posts</button>' +
      Object.keys(D.CATEGORIES).map((k) => '<button type="button" class="chip" data-cat="' + k + '">' + esc(D.CATEGORIES[k]) + '</button>').join('');
    function renderJournal() {
      $$('[data-cat]', filters).forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-cat') === cat)));
      const list = POSTS.filter((p) => cat === 'all' || p.cat === cat);
      setText('[data-journal-count]', plural(list.length, 'post') + (cat === 'all' ? '' : ' in ' + D.CATEGORIES[cat]));
      $('[data-journal-featured]').innerHTML = list.length ? postCard(list[0], true) : '';
      journalList.innerHTML = list.slice(1).map((p) => postCard(p)).join('');
      watchReveal(journalList);
    }
    filters.addEventListener('click', (e) => {
      const b = e.target.closest('[data-cat]');
      if (!b) return;
      const k = b.getAttribute('data-cat');
      cat = k === 'all' || hasOwn(D.CATEGORIES, k) ? k : 'all';
      try { window.history.replaceState(null, '', cat === 'all' ? window.location.pathname : '?cat=' + cat); } catch (err) { /* file:// */ }
      renderJournal();
    });
    renderJournal();
  }

  const articleEl = $('[data-article]');
  if (articleEl) {
    const slug = params.get('a');
    const found = slug ? postBySlug(slug) : null;
    const p = found || POSTS[0];
    $('[data-article-notice]').hidden = !(slug && !found);
    const person = hasOwn(D.PEOPLE, p.author) ? D.PEOPLE[p.author] : null;
    document.title = p.title + ' | Bonfield Bikes';
    const meta = $('meta[name="description"]');
    if (meta) meta.setAttribute('content', p.dek);
    setText('[data-article-cat]', D.CATEGORIES[p.cat]);
    const time = $('[data-article-date]');
    time.textContent = pubDate(p.date);
    time.setAttribute('datetime', p.date);
    setText('[data-article-minutes]', p.minutes + ' min read');
    setText('[data-article-title]', p.title);
    setText('[data-article-dek]', p.dek);
    $('[data-article-art]').innerHTML = cover(p);
    $('[data-article-body]').innerHTML = p.body.map((b) => {
      if (b[0] === 'h2') return '<h2>' + esc(b[1]) + '</h2>';
      if (b[0] === 'ul') return '<ul>' + b[1].map((li) => '<li>' + esc(li) + '</li>').join('') + '</ul>';
      if (b[0] === 'quote') return '<blockquote><p class="!mt-0 !text-[inherit] !leading-snug">“' + esc(b[1]) + '”</p><footer class="mt-2 font-sans text-sm font-normal not-italic text-muted">' + esc(b[2] || '') + '</footer></blockquote>';
      return '<p>' + esc(b[1]) + '</p>';
    }).join('');
    $('[data-article-author]').innerHTML = person ? '<div class="size-16 shrink-0 overflow-hidden rounded-full border-2 border-ink">' + portrait(person) + '</div><div><p class="font-semibold">' + esc(person.name) + '</p><p class="text-sm text-muted">' + esc(person.role) + '</p></div>' : '';
    const others = POSTS.filter((o) => o.slug !== p.slug);
    const start = POSTS.indexOf(p) % others.length;
    const more = others.slice(start).concat(others.slice(0, start)).slice(0, 3);
    $('[data-article-more]').innerHTML = more.map((o) => postCard(o)).join('');
    watchReveal($('[data-article-more]'));
  }

  /* ------------------------------------------------------------------
   * 13. About — team portraits and the open roles filter (?team=)
   * ------------------------------------------------------------------ */
  const teamList = $('[data-team]');
  if (teamList) {
    teamList.innerHTML = Object.keys(D.PEOPLE).map((k) => {
      const p = D.PEOPLE[k];
      return '<li class="reveal card overflow-hidden"><div class="border-b-2 border-ink">' + portrait(p) + '</div><div class="p-5"><h3 class="card-title">' + esc(p.name) + '</h3><p class="mt-1 text-sm font-semibold text-ore">' + esc(p.role) + '</p><p class="mt-3 text-sm leading-relaxed text-muted">' + esc(p.bio) + '</p></div></li>';
    }).join('') + '<li class="reveal on-dark flex flex-col justify-between rounded-lg bg-ink p-6"><p class="headline text-4xl text-white">And you?</p><p class="mt-3 text-frost">We’re hiring welders, engineers and people who like delivering bikes.</p><a href="#careers" class="link-arrow mt-6">Open roles</a></li>';
    watchReveal(teamList);
  }

  const rolesList = $('[data-roles]');
  if (rolesList) {
    let team = hasOwn(D.TEAMS, params.get('team')) ? params.get('team') : 'all';
    const filters = $('[data-role-filters]');
    filters.innerHTML = '<button type="button" class="chip" data-team="all">All teams</button>' +
      Object.keys(D.TEAMS).map((k) => '<button type="button" class="chip" data-team="' + k + '">' + esc(D.TEAMS[k]) + '</button>').join('');
    function renderRoles() {
      $$('[data-team]', filters).forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-team') === team)));
      const list = D.ROLES.filter((r) => team === 'all' || r.team === team);
      setText('[data-role-count]', plural(list.length, 'open role') + (team === 'all' ? '' : ' in ' + D.TEAMS[team]));
      rolesList.innerHTML = list.map((r) => '<li class="grid gap-3 border-b border-line py-6 md:grid-cols-[1.4fr_1fr_auto] md:items-center md:gap-8">' +
        '<div><p class="flex flex-wrap items-center gap-2"><span class="tag tag-lake">' + esc(D.TEAMS[r.team]) + '</span><span class="text-sm text-muted">' + esc(r.type) + '</span></p><h3 class="mt-2 font-display text-2xl font-bold uppercase leading-tight">' + esc(r.title) + '</h3><p class="mt-2 max-w-2xl leading-relaxed text-muted">' + esc(r.summary) + '</p></div>' +
        '<dl class="grid gap-1 text-sm"><div class="flex gap-2"><dt class="font-semibold">Where</dt><dd class="text-muted">' + esc(r.place) + '</dd></div><div class="flex gap-2"><dt class="font-semibold">Pay</dt><dd class="text-muted num">' + esc(r.pay) + '</dd></div></dl>' +
        '<a href="support.html?topic=careers#contact" class="btn-line btn-sm" aria-label="Apply: ' + esc(r.title) + '">Apply</a></li>').join('');
    }
    filters.addEventListener('click', (e) => {
      const b = e.target.closest('[data-team]');
      if (!b) return;
      const k = b.getAttribute('data-team');
      team = k === 'all' || hasOwn(D.TEAMS, k) ? k : 'all';
      try { window.history.replaceState(null, '', (team === 'all' ? window.location.pathname : '?team=' + team) + '#careers'); } catch (err) { /* file:// */ }
      renderRoles();
    });
    renderRoles();
  }

  /* ------------------------------------------------------------------
   * 14. Support — FAQ search, ZIP checker, contact form
   * ------------------------------------------------------------------ */
  const faqSearch = $('[data-faq-search]');
  if (faqSearch) {
    const items = $$('[data-faq-list] details');
    const run = () => {
      const q = faqSearch.value.trim().toLowerCase();
      let shown = 0;
      items.forEach((d) => {
        const hit = !q || d.textContent.toLowerCase().indexOf(q) !== -1;
        d.hidden = !hit;
        if (hit) shown++;
      });
      $('[data-faq-empty]').hidden = shown > 0;
      setText('[data-faq-count]', q ? plural(shown, 'question') + ' match' + (shown === 1 ? 'es' : '') : plural(items.length, 'question'));
    };
    faqSearch.addEventListener('input', run);
    run();
  }

  const zoneList = $('[data-zone-list]');
  if (zoneList) {
    zoneList.innerHTML = D.ZONES.filter((z) => z.fee !== null).map((z, i) => '<li class="card-soft flex gap-4 p-4"><span class="mt-1 size-4 shrink-0 rounded-full border-2 border-ink" style="background:' + ['#f7dbd2', '#d4e8ea', '#e8e6de'][i % 3] + '" aria-hidden="true"></span><div><p class="font-semibold">' + esc(z.name) + ' · <span class="num">' + (z.fee === 0 ? 'free' : money(z.fee)) + '</span></p><p class="mt-1 text-sm text-muted">' + esc(z.detail) + '</p></div></li>').join('');
    const form = $('[data-zip-check]');
    const out = $('[data-zip-result]');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const zip = form.elements.zip.value.trim();
      const z = zoneFor(zip);
      if (!/^\d{5}$/.test(zip)) { out.textContent = 'Please enter a 5-digit ZIP code.'; out.className = 'mt-4 min-h-6 font-semibold text-bad'; return; }
      out.className = 'mt-4 min-h-6 font-semibold ' + (z && z.fee !== null ? 'text-ok' : 'text-bad');
      out.textContent = z && z.fee !== null ? zip + ' is in our ' + z.name + ' zone: delivery ' + zoneFee(z) + '.' : zip + ': ' + (z ? z.detail : 'we don’t recognize that ZIP code.');
    });
  }

  const contactForm = $('[data-contact-form]');
  if (contactForm) {
    const select = $('[data-topic-select]');
    const topic = params.get('topic');
    if (topic && $$('option', select).some((o) => o.value === topic)) select.value = topic;
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = contactForm.elements;
      const name = f.name.value.trim(), email = f.email.value.trim(), ref = f.ref.value.trim().toUpperCase(), message = f.message.value.trim();
      const ok = [
        setError(contactForm, 'name', name ? '' : 'Please enter your name.'),
        setError(contactForm, 'email', !email ? 'Please enter your email address.' : EMAIL.test(email) ? '' : 'That email address doesn’t look right.'),
        setError(contactForm, 'ref', !ref || /^BB-\d{2,3}-[A-Z2-9]{4}$/.test(ref) ? '' : 'References look like BB-06-K7QD. Leave it empty if you don’t have one.'),
        setError(contactForm, 'message', message.length >= 10 ? '' : 'Please write a little more, at least 10 characters.')
      ].every(Boolean);
      if (!ok) { const bad = $('[aria-invalid="true"]', contactForm); if (bad) bad.focus(); return; }
      // To receive messages, post the form to a form service (e.g. Formspree) here and show the
      // success state only when it answers OK. See DOCS.md, "Forms".
      const done = $('[data-contact-success]');
      setText('[data-contact-greeting]', 'Thanks, ' + name.split(/\s+/)[0] + '.');
      setText('[data-contact-ref]', D.COMPANY.supportPrefix + '-' + (1000 + (hash(email.toLowerCase() + '|' + message + '|' + today) % 9000)));
      setText('[data-contact-email]', email);
      contactForm.hidden = true;
      done.hidden = false;
      done.focus();
    });
    $('[data-contact-again]').addEventListener('click', () => {
      contactForm.reset();
      if (topic && $$('option', select).some((o) => o.value === topic)) select.value = topic;
      $('[data-contact-success]').hidden = true;
      contactForm.hidden = false;
      contactForm.elements.name.focus();
    });
  }

  /* ------------------------------------------------------------------
   * 15. Footer year
   * ------------------------------------------------------------------ */
  $$('[data-year]').forEach((el) => { el.textContent = today.slice(0, 4); });

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
