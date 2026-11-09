/* Soiree — all interactive behavior. Vanilla JavaScript, no dependencies.
   Content and prices (packages, seasons, venues, celebrations) live in assets/js/data.js. */
(function () {
  'use strict';

  var S = window.SOIREE || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var TIME_ZONE = S.timeZone || 'America/New_York';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Own-key lookup, so values like "constructor" or "__proto__" from the URL or storage never match.
  function own(obj, key) { return !!obj && typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function roundTo(n, step) { return Math.round(n / step) * step; }
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';

  // localStorage, or an in-memory stand-in when the browser blocks it (a sandboxed iframe, strict
  // privacy settings): saved state then lasts for this page view instead of the feature doing nothing.
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

  // A short reference for the inquiry confirmation, like IA-7K2Q (no 0/O or 1/I to misread).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  // JSON helpers on top of safeStorage. Unreadable values are removed so the page heals itself.
  var store = {
    get: function (key) {
      var raw = null;
      try { raw = safeStorage.getItem(key); } catch (e) { return null; }
      if (raw == null) return null;
      try { return JSON.parse(raw); } catch (e) { this.remove(key); return null; }
    },
    set: function (key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* full: ignore */ } },
    remove: function (key) { try { safeStorage.removeItem(key); } catch (e) { /* ignore */ } }
  };
  var ESTIMATE_KEY = 'soiree-estimate';
  var SHORTLIST_KEY = 'soiree-shortlist';

  function params() {
    try { return new URLSearchParams(window.location.search); } catch (e) { return { get: function () { return null; } }; }
  }
  function setParam(name, value) {
    try {
      var url = new URL(window.location.href);
      if (value == null || value === '') url.searchParams.delete(name);
      else url.searchParams.set(name, value);
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) { /* file:// or sandboxed: the URL just doesn't update */ }
  }

  /* ---------- Dates in Charleston (America/New_York) ---------- */
  // Today's date in Charleston as YYYY-MM-DD, whatever the visitor's own time zone.
  function todayISO() {
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }
  // Parse YYYY-MM-DD into a UTC midnight Date (null if it isn't a real calendar date).
  function parseISO(value) {
    var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ''));
    if (!m) return null;
    var d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
    if (d.getUTCFullYear() !== +m[1] || d.getUTCMonth() !== +m[2] - 1 || d.getUTCDate() !== +m[3]) return null;
    return d;
  }
  function toISO(d) { return d.toISOString().slice(0, 10); }
  function addYears(d, n) { var c = new Date(d.getTime()); c.setUTCFullYear(c.getUTCFullYear() + n); return c; }
  function daysBetween(a, b) { return Math.round((b - a) / 86400000); }
  // Whole calendar months from a to b (a May 20 to b Jun 19 = 0, to Jun 20 = 1).
  function monthsBetween(a, b) {
    var months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + (b.getUTCMonth() - a.getUTCMonth());
    if (b.getUTCDate() < a.getUTCDate()) months -= 1;
    return Math.max(0, months);
  }
  function longDate(d) {
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  }
  // An example date for error messages: 15 May next year, so it is always in the future.
  function exampleDate() { return '05/15/' + (+todayISO().slice(0, 4) + 1); }
  // Checks an event date: '' when fine, otherwise the message to show.
  function dateProblem(value) {
    var d = parseISO(value);
    if (!d) return 'Enter a real date, like ' + exampleDate() + '.';
    var today = parseISO(todayISO());
    if (d <= today) return 'Choose a date after today.';
    if (d > addYears(today, 3)) return 'Choose a date within the next three years.';
    return '';
  }

  /* ---------- Years in the header and footer ----------
     [data-year] shows this year (the footer copyright); [data-year-ahead="1"] shows next year, "2" the year
     after (the "Now booking" line in the top bar), so the demo never advertises a year that has passed. */
  (function setYears() {
    var year = +todayISO().slice(0, 4);
    $$('[data-year]').forEach(function (el) { el.textContent = String(year); });
    $$('[data-year-ahead]').forEach(function (el) {
      var n = parseInt(el.getAttribute('data-year-ahead'), 10);
      if (n >= 0 && n <= 9) el.textContent = String(year + n);
    });
  })();

  /* ---------- Toast ---------- */
  var toastEl = $('[data-toast]');
  var toastTimer;
  function toast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2800);
  }

  /* ---------- Header and mobile menu ---------- */
  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 40); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = $('[data-menu-toggle]');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('[data-icon-open]', menuBtn).hidden = open;
    $('[data-icon-close]', menuBtn).hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  /* ---------- Scroll reveal ----------
     Fades sections in as they enter the viewport. On scroll, everything above the
     bottom of the screen is revealed too, so fast jumps never leave content hidden. */
  function initReveal(root) {
    var items = $$('.reveal:not(.is-in)', root);
    if (!items.length) return;
    function show(el) { el.classList.add('is-in'); }
    if (reduceMotion.matches || !('IntersectionObserver' in window)) { items.forEach(show); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
  }
  initReveal(document);
  (function () {
    var frame = 0;
    window.addEventListener('scroll', function () {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        var limit = window.innerHeight * 0.94;
        $$('.reveal:not(.is-in)').forEach(function (el) { if (el.getBoundingClientRect().top < limit) el.classList.add('is-in'); });
      });
    }, { passive: true });
  })();

  /* ---------- Budget estimator ---------- */
  var LIMITS = S.guestLimits || { min: 20, max: 400, step: 10, initial: 120 };
  var DEFAULT_ESTIMATE = { type: 'wedding', guests: LIMITS.initial, season: 'peak', pkg: 'full', addons: [] };

  function clampGuests(n, min, max) {
    n = Math.round(Number(n));
    if (!isFinite(n)) return null;
    return Math.min(max, Math.max(min, n));
  }
  // Rebuilds a valid estimate from anything (storage, URL): unknown values fall back to the defaults.
  function cleanEstimate(raw) {
    var src = raw && typeof raw === 'object' && !Array.isArray(raw) ? raw : {};
    var out = {
      type: own(S.eventTypes, src.type) ? src.type : DEFAULT_ESTIMATE.type,
      guests: typeof src.guests === 'number' ? clampGuests(src.guests, LIMITS.min, LIMITS.max) : null,
      season: own(S.seasons, src.season) ? src.season : DEFAULT_ESTIMATE.season,
      pkg: own(S.packages, src.pkg) ? src.pkg : DEFAULT_ESTIMATE.pkg,
      addons: []
    };
    if (out.guests == null) out.guests = DEFAULT_ESTIMATE.guests;
    if (Array.isArray(src.addons)) {
      src.addons.forEach(function (a) { if (own(S.addons, a) && out.addons.indexOf(a) === -1) out.addons.push(a); });
    }
    if (out.pkg === 'full') out.addons = out.addons.filter(function (a) { return a !== 'design'; });
    return out;
  }
  function computeEstimate(st) {
    var pkg = S.packages[st.pkg];
    var type = S.eventTypes[st.type];
    var season = S.seasons[st.season];
    var spread = S.spread || { fee: [0.95, 1.1], spend: [0.85, 1.2] };
    var addonTotal = st.addons.reduce(function (sum, a) { return sum + S.addons[a].price; }, 0);
    var fee = (pkg.base + pkg.perGuest * Math.max(0, st.guests - 50)) * season.feeFactor + addonTotal;
    var spend = st.guests * type.perGuest * season.spendFactor;
    var feeLow = roundTo(fee * spread.fee[0], 100);
    var feeHigh = roundTo(fee * spread.fee[1], 100);
    var totalLow = roundTo(spend * spread.spend[0] + feeLow, 500);
    var totalHigh = roundTo(spend * spread.spend[1] + feeHigh, 500);
    return {
      feeLow: feeLow, feeHigh: feeHigh, totalLow: totalLow, totalHigh: totalHigh,
      perGuest: roundTo((totalLow + totalHigh) / 2 / st.guests, 10),
      breakdown: (S.breakdown || []).map(function (b) {
        return { name: b.name, share: b.share, low: roundTo(spend * spread.spend[0] * b.share, 100), high: roundTo(spend * spread.spend[1] * b.share, 100) };
      })
    };
  }
  var SEASON_PHRASE = { peak: 'spring or fall', summer: 'summer', winter: 'winter' };
  var TYPE_PHRASE = { wedding: 'wedding', corporate: 'corporate event', private: 'private celebration' };
  function estimateSummary(st) {
    var text = S.packages[st.pkg].name + ' for a ' + (own(SEASON_PHRASE, st.season) ? SEASON_PHRASE[st.season] : S.seasons[st.season].name.toLowerCase()) +
      ' ' + (own(TYPE_PHRASE, st.type) ? TYPE_PHRASE[st.type] : S.eventTypes[st.type].name.toLowerCase()) + ' with ' + plural(st.guests, 'guest', 'guests');
    if (st.addons.length) text += ', plus ' + plural(st.addons.length, 'add-on', 'add-ons');
    return text + '.';
  }
  window.SOIREE_ESTIMATE = function (raw) { return computeEstimate(cleanEstimate(raw)); }; // exposed for testing and reuse

  (function () {
    var form = $('[data-estimator]');
    if (!form || !S.packages) return;
    var range = $('[data-guests-range]', form);
    var number = $('[data-guests-input]', form);
    var live = $('[data-est-live]');
    var liveTimer;
    var state = cleanEstimate(store.get(ESTIMATE_KEY) || DEFAULT_ESTIMATE);
    var fromUrl = params().get('package');
    if (own(S.packages, fromUrl)) state = cleanEstimate(Object.assign({}, state, { pkg: fromUrl }));

    function sync() {
      $$('input[name="type"]', form).forEach(function (r) { r.checked = r.value === state.type; });
      $$('input[name="season"]', form).forEach(function (r) { r.checked = r.value === state.season; });
      $$('input[name="package"]', form).forEach(function (r) { r.checked = r.value === state.pkg; });
      $$('input[name="addon"]', form).forEach(function (c) {
        var included = c.value === 'design' && state.pkg === 'full';
        c.disabled = included;
        c.checked = included || state.addons.indexOf(c.value) !== -1;
      });
      range.value = String(Math.min(LIMITS.max, Math.max(LIMITS.min, roundTo(state.guests, LIMITS.step))));
      if (document.activeElement !== number) number.value = String(state.guests);
    }
    function render(announce) {
      var r = computeEstimate(state);
      $('[data-est-summary]').textContent = estimateSummary(state);
      $('[data-est-fee]').textContent = money(r.feeLow) + ' – ' + money(r.feeHigh);
      $('[data-est-total]').textContent = money(r.totalLow) + ' – ' + money(r.totalHigh);
      $('[data-est-per-guest]').textContent = 'About ' + money(r.perGuest) + ' per guest';
      var max = Math.max.apply(null, r.breakdown.map(function (b) { return b.share; }));
      $('[data-est-breakdown]').innerHTML = r.breakdown.map(function (b) {
        return '<li><div class="flex justify-between gap-4"><span>' + esc(b.name) + '</span><span class="text-[#d8cfc1]">' + money(b.low) + ' – ' + money(b.high) + '</span></div>' +
          '<div class="bar mt-1.5 !bg-white/15" aria-hidden="true"><span style="width:' + Math.round(b.share / max * 100) + '%"></span></div></li>';
      }).join('');
      var link = $('[data-est-inquire]');
      if (link) link.href = 'inquire.html?package=' + encodeURIComponent(state.pkg) + '&guests=' + state.guests + '&type=' + encodeURIComponent(state.type);
      if (announce && live) {
        clearTimeout(liveTimer);
        liveTimer = setTimeout(function () {
          live.textContent = 'Planning fee ' + money(r.feeLow) + ' to ' + money(r.feeHigh) + '. Whole celebration ' + money(r.totalLow) + ' to ' + money(r.totalHigh) + '.';
        }, 500);
      }
    }
    function update(changes) {
      state = cleanEstimate(Object.assign({}, state, changes));
      store.set(ESTIMATE_KEY, state);
      sync();
      render(true);
    }

    form.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'type') update({ type: t.value });
      else if (t.name === 'season') update({ season: t.value });
      else if (t.name === 'package') update({ pkg: t.value });
      else if (t.name === 'addon') {
        update({ addons: $$('input[name="addon"]:checked:not(:disabled)', form).map(function (c) { return c.value; }) });
      } else if (t === number) {
        var n = clampGuests(number.value, LIMITS.min, LIMITS.max);
        update({ guests: n == null ? state.guests : n });
        number.value = String(state.guests);
      }
    });
    range.addEventListener('input', function () { update({ guests: Number(range.value) }); number.value = String(state.guests); });
    number.addEventListener('input', function () {
      var n = Number(number.value);
      if (number.value !== '' && Math.round(n) === n && n >= LIMITS.min && n <= LIMITS.max) update({ guests: n });
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    $('[data-est-reset]').addEventListener('click', function () {
      state = cleanEstimate(DEFAULT_ESTIMATE);
      store.remove(ESTIMATE_KEY);
      sync();
      render(true);
      toast('Estimate reset to the starting example');
    });
    sync();
    render(false);
  })();

  /* ---------- Portfolio: filter and case-study dialog ---------- */
  (function () {
    var grid = $('[data-portfolio-grid]');
    if (!grid || !S.celebrations) return;
    var LABELS = S.eventTypeLabels || {};
    var items = S.celebrations;
    var filter = 'all';
    var status = $('[data-portfolio-status]');
    var dialog = $('[data-case-dialog]');
    var current = -1;
    var opener = null;

    function visible() { return items.filter(function (c) { return filter === 'all' || c.type === filter; }); }
    function cardClass(i) {
      var row = Math.floor(i / 2);
      var first = i % 2 === 0;
      var wide = row % 2 === 0 ? first : !first;
      return wide ? 'lg:col-span-7' : 'lg:col-span-5';
    }
    function render() {
      var list = visible();
      grid.innerHTML = list.map(function (c, i) {
        var cls = cardClass(i);
        var aspect = cls === 'lg:col-span-7' ? 'aspect-[4/5] sm:aspect-[4/3]' : 'aspect-[4/5] lg:aspect-square';
        return '<article class="group relative reveal ' + cls + '" data-type="' + esc(c.type) + '">' +
          '<div class="art border border-ink ' + aspect + '"><img src="assets/img/art-' + esc(c.art) + '.svg" alt="" width="400" height="500" loading="lazy"></div>' +
          '<p class="smallcaps mt-5 text-rose">' + esc(own(LABELS, c.type) ? LABELS[c.type] : c.type) + ' · ' + esc(c.date) + '</p>' +
          '<h3 class="mt-2 font-display text-4xl"><button type="button" class="text-left after:absolute after:inset-0 group-hover:text-rose" data-case="' + esc(c.id) + '" aria-haspopup="dialog">' + esc(c.title) + '</button></h3>' +
          '<p class="mt-2 font-display text-xl italic">' + esc(c.headline) + '</p>' +
          '<p class="mt-2 max-w-xl text-muted">' + esc(c.summary) + '</p>' +
          '<p class="smallcaps mt-4 text-muted">' + esc(c.venue) + ' · ' + plural(c.guests, 'guest', 'guests') + '</p>' +
          '</article>';
      }).join('');
      if (status) status.textContent = 'Showing ' + plural(list.length, 'celebration', 'celebrations');
      $$('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === filter)); });
      initReveal(grid);
    }
    function setFilter(value, updateUrl) {
      filter = value === 'all' || own(LABELS, value) ? value : 'all';
      render();
      if (updateUrl) setParam('type', filter === 'all' ? null : filter);
    }
    $$('[data-count]').forEach(function (el) {
      var key = el.getAttribute('data-count');
      el.textContent = String(key === 'all' ? items.length : items.filter(function (c) { return c.type === key; }).length);
    });
    $$('[data-filter]').forEach(function (b) {
      b.addEventListener('click', function () { setFilter(b.getAttribute('data-filter'), true); });
    });

    function fill(index) {
      var list = visible();
      var c = list[index];
      if (!c) return;
      current = index;
      $('[data-case-position]', dialog).textContent = 'Story ' + (index + 1) + ' of ' + list.length;
      var art = $('[data-case-art]', dialog);
      art.src = 'assets/img/art-' + c.art + '.svg';
      $('[data-case-date]', dialog).textContent = c.date;
      $('[data-case-venue]', dialog).textContent = c.venue;
      $('[data-case-guests]', dialog).textContent = String(c.guests);
      $('[data-case-package]', dialog).textContent = c.pkg;
      $('[data-case-type]', dialog).textContent = (own(LABELS, c.type) ? LABELS[c.type] : c.type) + ' · ' + c.date;
      $('[data-case-title]', dialog).textContent = c.title;
      $('[data-case-headline]', dialog).textContent = c.headline;
      $('[data-case-story]', dialog).textContent = c.story;
      $('[data-case-details]', dialog).innerHTML = (c.details || []).map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('');
      $('[data-case-quote]', dialog).textContent = '“' + c.quote + '”';
      $('[data-case-by]', dialog).textContent = c.by;
      $('[data-case-inquire]', dialog).href = 'inquire.html?type=' + encodeURIComponent(c.type);
      var single = list.length < 2;
      $('[data-case-prev]', dialog).disabled = single;
      $('[data-case-next]', dialog).disabled = single;
      dialog.scrollTop = 0;
      setParam('case', c.id);
    }
    function openCase(id, from) {
      var list = visible();
      var index = -1;
      list.forEach(function (c, i) { if (c.id === id) index = i; });
      if (index === -1 || !dialog) return;
      opener = from || null;
      fill(index);
      if (!dialog.open) dialog.showModal();
      $('[data-case-close]', dialog).focus();
    }
    function step(delta) {
      var n = visible().length;
      if (n) fill((current + delta + n) % n);
    }
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-case]');
      if (btn) openCase(btn.getAttribute('data-case'), btn);
    });
    if (dialog) {
      $('[data-case-close]', dialog).addEventListener('click', function () { dialog.close(); });
      $('[data-case-prev]', dialog).addEventListener('click', function () { step(-1); });
      $('[data-case-next]', dialog).addEventListener('click', function () { step(1); });
      dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
        if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      });
      dialog.addEventListener('close', function () {
        setParam('case', null);
        var id = visible()[current] && visible()[current].id;
        var target = (id && $('[data-case="' + id + '"]', grid)) || opener;
        if (target) target.focus();
      });
    }

    var p = params();
    setFilter(p.get('type') || 'all', false);
    var deepLink = p.get('case');
    if (deepLink && items.some(function (c) { return c.id === deepLink; })) {
      if (!visible().some(function (c) { return c.id === deepLink; })) setFilter('all', true);
      openCase(deepLink, null);
    }
  })();

  /* ---------- Process: where would you start? ---------- */
  (function () {
    var form = $('[data-when-form]');
    if (!form) return;
    var input = $('[data-when-date]', form);
    var error = $('[data-when-error]', form);
    var result = $('[data-when-result]');
    var steps = $$('[data-step]');
    var today = parseISO(todayISO());
    input.min = toISO(new Date(today.getTime() + 86400000));
    input.max = toISO(addYears(today, 3));

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var problem = input.value ? dateProblem(input.value) : 'Choose your event date.';
      error.hidden = !problem;
      error.textContent = problem;
      input.setAttribute('aria-invalid', String(!!problem));
      if (problem) { input.focus(); return; }
      var date = parseISO(input.value);
      var months = monthsBetween(today, date);
      var start = steps[steps.length - 1];
      for (var i = 0; i < steps.length; i++) {
        if (months >= Number(steps[i].getAttribute('data-from'))) { start = steps[i]; break; }
      }
      var startNum = Number(start.getAttribute('data-step'));
      steps.forEach(function (s) {
        var n = Number(s.getAttribute('data-step'));
        s.classList.toggle('is-current', n === startNum);
        s.classList.toggle('is-past', n < startNum);
      });
      var away = months >= 1 ? plural(months, 'month', 'months') : plural(daysBetween(today, date), 'day', 'days');
      var text;
      if (startNum === 1) text = 'Your date is ' + away + ' away: perfect timing. We’d start at step 1.';
      else if (startNum >= 6) text = 'Your date is ' + away + ' away. Day-of coordination fits best: we’d start at step ' + startNum + '.';
      else text = 'Your date is ' + away + ' away. We’d start at step ' + startNum + ' and catch up on the earlier steps together.';
      result.textContent = text;
    });
  })();

  /* ---------- Venue shortlist (shared by the venue guide and the inquiry form) ---------- */
  var VENUE_INDEX = {};
  (S.venues || []).forEach(function (v) { VENUE_INDEX[v.id] = v; });
  function readShortlist() {
    var raw = store.get(SHORTLIST_KEY);
    if (!Array.isArray(raw)) { if (raw != null) store.remove(SHORTLIST_KEY); return []; }
    var clean = [];
    raw.forEach(function (id) { if (own(VENUE_INDEX, id) && clean.indexOf(id) === -1) clean.push(id); });
    if (clean.length !== raw.length) store.set(SHORTLIST_KEY, clean);
    return clean;
  }

  /* ---------- Venue guide ---------- */
  (function () {
    var list = $('[data-venue-list]');
    if (!list || !S.venues) return;
    var areaSel = $('[data-venue-area]');
    var settingSel = $('[data-venue-setting]');
    var guestsSel = $('[data-venue-guests]');
    var sortSel = $('[data-venue-sort]');
    var savedOnlyBtn = $('[data-venue-saved-only]');
    var status = $('[data-venue-status]');
    var empty = $('[data-venue-empty]');
    var countEl = $('[data-shortlist-count]');
    var shortlist = readShortlist();
    var savedOnly = false;
    var SAVE_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4.5L6 21Z"/></svg>';

    function matches(v) {
      var area = areaSel.value, setting = settingSel.value, guests = Number(guestsSel.value) || 0;
      if (area !== 'all' && v.area !== area) return false;
      if (setting !== 'all' && v.setting !== setting) return false;
      if (guests && (guests < v.min || guests > v.max)) return false;
      if (savedOnly && shortlist.indexOf(v.id) === -1) return false;
      return true;
    }
    function sorted(arr) {
      var by = sortSel.value;
      return arr.slice().sort(function (a, b) {
        if (by === 'price') return a.priceFrom - b.priceFrom;
        if (by === 'capacity') return b.max - a.max;
        return a.name.replace(/^The /, '').localeCompare(b.name.replace(/^The /, ''));
      });
    }
    function renderCount() {
      if (countEl) countEl.textContent = shortlist.length ? plural(shortlist.length, 'venue', 'venues') : 'No venues';
      if (savedOnlyBtn) $('span', savedOnlyBtn).textContent = 'Shortlist only (' + shortlist.length + ')';
    }
    function render() {
      var rows = sorted(S.venues.filter(matches));
      list.innerHTML = rows.map(function (v, i) {
        var saved = shortlist.indexOf(v.id) !== -1;
        var area = own(S.areas, v.area) ? S.areas[v.area] : v.area;
        var setting = own(S.settings, v.setting) ? S.settings[v.setting] : v.setting;
        return '<li class="grid gap-5 py-8 sm:grid-cols-[9rem_1fr] lg:grid-cols-[3rem_10rem_1fr_15rem]" data-venue="' + esc(v.id) + '">' +
          '<span class="folio hidden text-2xl lg:block">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<div class="art aspect-[4/5] w-36 border border-ink sm:w-full"><img src="assets/img/art-' + esc(v.art) + '.svg" alt="" width="400" height="500" loading="lazy"></div>' +
          '<div class="min-w-0"><p class="smallcaps text-rose">' + esc(area) + ' · ' + esc(setting) + '</p>' +
          '<h3 class="mt-2 font-display text-3xl">' + esc(v.name) + '</h3>' +
          '<p class="mt-3 max-w-xl leading-relaxed text-ink-soft">' + esc(v.note) + '</p></div>' +
          '<div class="flex flex-col gap-4 sm:col-start-2 lg:col-start-auto lg:items-end lg:text-right">' +
          '<dl class="grid grid-cols-2 gap-4 lg:grid-cols-1 lg:gap-2"><div><dt class="smallcaps text-muted">Guests</dt><dd class="font-display text-2xl">' + v.min + '–' + v.max + '</dd></div>' +
          '<div><dt class="smallcaps text-muted">Site fee from</dt><dd class="font-display text-2xl">' + money(v.priceFrom) + '</dd></div></dl>' +
          '<button type="button" class="save-btn self-start lg:self-end" data-save="' + esc(v.id) + '" aria-pressed="' + saved + '" aria-label="Save ' + esc(v.name) + ' to your shortlist">' + SAVE_ICON + '<span>' + (saved ? 'Saved' : 'Save') + '</span></button>' +
          '</div></li>';
      }).join('');
      if (status) status.textContent = 'Showing ' + plural(rows.length, 'venue', 'venues');
      if (empty) empty.hidden = rows.length > 0;
      list.hidden = rows.length === 0;
      renderCount();
    }
    list.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-save]');
      if (!btn) return;
      var id = btn.getAttribute('data-save');
      if (!own(VENUE_INDEX, id)) return;
      var at = shortlist.indexOf(id);
      if (at === -1) shortlist.push(id); else shortlist.splice(at, 1);
      store.set(SHORTLIST_KEY, shortlist);
      toast((at === -1 ? 'Added ' : 'Removed ') + VENUE_INDEX[id].name + (at === -1 ? ' to' : ' from') + ' your shortlist');
      if (savedOnly && at !== -1) {
        render();
        savedOnlyBtn.focus();
      } else {
        btn.setAttribute('aria-pressed', String(at === -1));
        $('span', btn).textContent = at === -1 ? 'Saved' : 'Save';
        renderCount();
      }
    });
    [areaSel, settingSel, guestsSel, sortSel].forEach(function (sel) { sel.addEventListener('change', render); });
    areaSel.addEventListener('change', function () { setParam('area', areaSel.value === 'all' ? null : areaSel.value); });
    savedOnlyBtn.addEventListener('click', function () {
      savedOnly = !savedOnly;
      savedOnlyBtn.setAttribute('aria-pressed', String(savedOnly));
      render();
    });
    $('[data-venue-reset]').addEventListener('click', function () {
      areaSel.value = 'all'; settingSel.value = 'all'; guestsSel.value = '0';
      savedOnly = false; savedOnlyBtn.setAttribute('aria-pressed', 'false');
      setParam('area', null);
      render();
      areaSel.focus();
    });
    var area = params().get('area');
    if (own(S.areas, area)) areaSel.value = area;
    render();
  })();

  /* ---------- Inquiry form ---------- */
  (function () {
    var form = $('[data-inquiry-form]');
    if (!form) return;
    var success = $('[data-inquiry-success]');
    var summary = $('[data-error-summary]');
    var dateInput = $('[data-inq-date]', form);
    var flexible = $('[data-inq-flexible]', form);
    var message = form.elements.message;
    var counter = $('[data-message-count]');
    var MIN_MESSAGE = 20;
    var MAX_MESSAGE = 2000;
    var BUDGETS = {};
    $$('option', form.elements.budget).forEach(function (o) { if (o.value) BUDGETS[o.value] = o.textContent; });
    var PACKAGE_NAMES = { unsure: 'Not sure yet', full: 'Full planning', partial: 'Partial planning', dayof: 'Day-of coordination' };

    var today = parseISO(todayISO());
    dateInput.min = toISO(new Date(today.getTime() + 86400000));
    dateInput.max = toISO(addYears(today, 3));

    // Prefill from the estimator or a portfolio story: ?package=full&guests=120&type=wedding
    var p = params();
    var filled = [];
    var pkg = p.get('package');
    if (own(S.packages, pkg)) { form.elements.package.value = pkg; filled.push(S.packages[pkg].name); }
    var type = p.get('type');
    if (own(S.eventTypes, type)) {
      $$('input[name="type"]', form).forEach(function (r) { r.checked = r.value === type; });
      filled.push(S.eventTypes[type].name.toLowerCase());
    }
    var guests = p.get('guests');
    if (guests && /^\d{1,3}$/.test(guests) && +guests >= 10 && +guests <= 500) { form.elements.guests.value = String(+guests); filled.push(plural(+guests, 'guest', 'guests')); }
    if (filled.length && pkg) {
      $('[data-prefill-note]').hidden = false;
      $('[data-prefill-text]').textContent = 'We’ve filled in your choices: ' + filled.join(', ') + '. Change anything you like.';
    }

    // Venues saved in the venue guide appear as checkboxes, checked by default.
    var shortlist = readShortlist();
    var shortlistBox = $('[data-inq-shortlist-list]', form);
    $('[data-inq-shortlist-empty]', form).hidden = shortlist.length > 0;
    shortlistBox.hidden = shortlist.length === 0;
    shortlistBox.innerHTML = shortlist.map(function (id) {
      return '<label class="option"><input type="checkbox" name="venues" value="' + esc(id) + '" checked><span class="font-semibold">' + esc(VENUE_INDEX[id].name) + '</span></label>';
    }).join('');

    function updateCounter() {
      var left = MAX_MESSAGE - message.value.length;
      counter.textContent = 'At least ' + MIN_MESSAGE + ' characters. ' + left.toLocaleString('en-US') + (left === 1 ? ' character' : ' characters') + ' left.';
    }
    message.addEventListener('input', updateCounter);
    updateCounter();

    function setError(name, text) {
      var err = $('#inq-' + name + '-error');
      var target = name === 'type' ? $('[data-group="type"]', form) : form.elements[name];
      if (err) { err.textContent = text || ''; err.hidden = !text; }
      if (target) target.setAttribute('aria-invalid', String(!!text));
    }
    function validate() {
      var errors = [];
      var el = form.elements;
      function check(name, text, focusId) { setError(name, text); if (text) errors.push({ id: focusId || 'inq-' + name, text: text }); }
      var email = el.email.value.trim();
      var phoneDigits = el.phone.value.replace(/\D/g, '');
      var typeChosen = $('input[name="type"]:checked', form);
      var guestsVal = el.guests.value.trim();
      var guestsNum = Number(guestsVal);

      check('name', el.name.value.trim() ? '' : 'Enter your name.');
      check('email', !email ? 'Enter your email address.' : (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? '' : 'Enter an email address like name@example.com.'));
      check('phone', el.phone.value.trim() && phoneDigits.length < 10 ? 'Enter a phone number with at least 10 digits, or leave it blank.' : '');
      check('type', typeChosen ? '' : 'Choose the type of event.', 'inq-type-wedding');
      var dateText = '';
      if (dateInput.value) dateText = dateProblem(dateInput.value);
      else if (dateInput.validity && dateInput.validity.badInput) dateText = 'Enter a real date, like ' + exampleDate() + '.';
      else if (!flexible.checked) dateText = 'Choose your event date, or check “Our date is flexible”.';
      check('date', dateText);
      check('guests', !guestsVal ? 'Enter a rough guest count.' : (Math.round(guestsNum) === guestsNum && guestsNum >= 10 && guestsNum <= 500 ? '' : 'Enter a number from 10 to 500.'));
      check('budget', own(BUDGETS, el.budget.value) ? '' : 'Choose a budget range.');
      check('message', el.message.value.trim().length >= MIN_MESSAGE ? '' : 'Tell us a little more: at least ' + MIN_MESSAGE + ' characters.');
      return errors;
    }
    // Errors update live once the visitor has tried to send.
    var tried = false;
    form.addEventListener('input', function () { if (tried) validate(); });
    form.addEventListener('change', function () { if (tried) validate(); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      tried = true;
      var errors = validate();
      if (errors.length) {
        $('[data-error-count]', summary).textContent = errors.length === 1 ? 'this detail' : 'these ' + errors.length + ' details';
        $('[data-error-list]', summary).innerHTML = errors.map(function (er) {
          return '<li><a class="link" href="#' + er.id + '">' + esc(er.text) + '</a></li>';
        }).join('');
        summary.hidden = false;
        summary.focus();
        return;
      }
      summary.hidden = true;

      // Connect your form here: this demo only shows the confirmation. With a service such as
      // Formspree, send it first: fetch(form.action, { method: 'POST', body: new FormData(form),
      // headers: { Accept: 'application/json' } }) and show the success block when it resolves.
      var el = form.elements;
      var d = parseISO(dateInput.value);
      var venues = $$('input[name="venues"]:checked', form).map(function (c) { return VENUE_INDEX[c.value].name; });
      if (el.venue.value.trim()) venues.push(el.venue.value.trim());
      var typeChosen = $('input[name="type"]:checked', form).value;
      var rows = [
        ['Name', el.name.value.trim() + (el.partner.value.trim() ? ' & ' + el.partner.value.trim() : '')],
        ['Email', el.email.value.trim()],
        ['Event', S.eventTypes[typeChosen].name],
        ['Date', d ? longDate(d) + (flexible.checked ? ' (flexible)' : '') : 'Flexible'],
        ['Guests', String(Number(el.guests.value))],
        ['Budget', BUDGETS[el.budget.value]],
        ['Planning help', own(PACKAGE_NAMES, el.package.value) ? PACKAGE_NAMES[el.package.value] : 'Not sure yet'],
        ['Venues', venues.length ? venues.join(', ') : 'Not chosen yet']
      ];
      $('[data-success-name]', success).textContent = el.name.value.trim().split(/\s+/)[0];
      $('[data-success-ref]', success).textContent = makeRef('IA');
      $('[data-success-summary]', success).innerHTML = rows.map(function (r) {
        return '<div class="grid grid-cols-[8rem_1fr] gap-4 py-2.5"><dt class="smallcaps text-muted">' + esc(r[0]) + '</dt><dd>' + esc(r[1]) + '</dd></div>';
      }).join('');
      form.hidden = true;
      success.hidden = false;
      success.focus();
      window.scrollTo({ top: success.getBoundingClientRect().top + window.scrollY - 120, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });

    $('[data-error-list]', summary).addEventListener('click', function (e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) { e.preventDefault(); target.focus(); }
    });

    $('[data-inquiry-again]', success).addEventListener('click', function () {
      form.reset();
      tried = false;
      ['name', 'email', 'phone', 'type', 'date', 'guests', 'budget', 'message'].forEach(function (n) { setError(n, ''); });
      $$('input[name="venues"]', form).forEach(function (c) { c.checked = true; });
      updateCounter();
      success.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  })();
})();

/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It lifts itself above toasts so they never overlap.
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
  var AVOID = '[data-toast], .toast, [data-back-to-top-avoid]';
  var queued = false;

  function isShown(el) {
    var cs = window.getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05;
  }
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
    // Stay out of the way while the full-screen mobile menu is open.
    var menu = document.getElementById('mobile-menu');
    var menuOpen = !!menu && !menu.hidden;
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !coversHideZone() && !menuOpen);
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
  var mobileMenu = document.getElementById('mobile-menu');
  if (mobileMenu) new MutationObserver(schedule).observe(mobileMenu, { attributes: true, attributeFilter: ['hidden'] });
  update();

  function focusTop() {
    var target = document.getElementById('main') || document.querySelector('main');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.classList.add('back-to-top-target');
    target.focus({ preventScroll: true });
  }
  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    focusTop();
  });
})();
