/* Drift (Nightjar) — site scripts. Vanilla JavaScript, no dependencies.
 *
 *  1. Content and settings (data you can edit)
 *  2. Helpers: safe storage, own-key checks, time math, toast, clipboard
 *  3. Theme toggle
 *  4. Header, mobile menu, footer year
 *  5. Scroll reveal
 *  6. Feature tour tabs (home)
 *  7. Wind-down routine builder (features)
 *  8. Bedtime calculator (calculator)
 *  9. Sound library: filters, search, favorites and previews (sounds)
 * 10. Pricing billing switch (pricing)
 * 11. Reviews filter and sort (reviews)
 * 12. Guides topic filter (guides)
 * 13. Help center search (support)
 * 14. Forms
 * 15. Copy buttons (press kit)
 * Back to top button (separate block at the end)
 *
 * Times are local clock times on the visitor's device (no time zone conversion),
 * kept as 24-hour "HH:MM" and shown on a 12-hour clock by clock12().
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Content and settings
   * ------------------------------------------------------------------ */

  // Keys used in localStorage (see DOCS.md, "Saved data").
  var STORAGE = {
    theme: 'drift-theme',             // 'light' or 'dark'
    favourites: 'drift-favourites',   // array of sound ids
    calculator: 'drift-calculator',   // { mode, time, latency }
    routine: 'drift-routine'          // { steps: [step ids], lightsOut: 'HH:MM' }
  };

  // Bedtime calculator.
  var CYCLE_MINUTES = 90;              // length of one sleep cycle used for the math
  var CYCLE_COUNTS = [6, 5, 4, 3];     // options shown, most sleep first
  var SUGGESTED_CYCLES = { 5: true, 6: true };   // highlighted as "Suggested"
  var CALC_MODES = {
    wake: { label: 'I need to wake up at', heading: 'Try to be in bed by one of these times', verb: 'In bed by' },
    bed: { label: 'I’m going to bed at', heading: 'Try to wake up at one of these times', verb: 'Wake up at' }
  };
  var LATENCY_OPTIONS = { 5: true, 10: true, 15: true, 20: true, 30: true };
  var CALC_DEFAULTS = { mode: 'wake', time: '07:00', latency: 15 };

  // Wind-down routine builder. Steps run in this order.
  var ROUTINE_STEPS = {
    dim: { label: 'Dim the lights', minutes: 5 },
    screens: { label: 'Phone on the charger, out of reach', minutes: 2 },
    shower: { label: 'Warm shower or bath', minutes: 15 },
    stretch: { label: 'Gentle stretches', minutes: 8 },
    journal: { label: 'Write tomorrow’s to-do list', minutes: 5 },
    breathe: { label: '4-7-8 breathing', minutes: 4 },
    read: { label: 'Read a few pages', minutes: 15 },
    story: { label: 'Listen to a sleep story', minutes: 20 }
  };
  var ROUTINE_DEFAULTS = { steps: ['dim', 'screens', 'breathe', 'read'], lightsOut: '22:45' };

  // Sound previews, generated with the Web Audio API (no audio files).
  //   noise: 'white' | 'pink' | 'brown'   filter: low-pass cut-off in Hz
  //   swell: slow volume wave in Hz (waves, wind)   tones: sine drones in Hz
  //   pulse: fast on/off rhythm in Hz (crickets, rails)   gain: loudness 0–1
  var SOUND_RECIPES = {
    'rain-tent': { noise: 'pink', filter: 5200, gain: 0.5 },
    drizzle: { noise: 'white', filter: 2600, gain: 0.25 },
    thunder: { noise: 'brown', filter: 380, swell: 0.07, gain: 0.9 },
    downpour: { noise: 'pink', filter: 8000, gain: 0.6 },
    tide: { noise: 'brown', filter: 900, swell: 0.11, gain: 0.85 },
    burn: { noise: 'pink', filter: 2400, swell: 0.6, gain: 0.45 },
    pines: { noise: 'pink', filter: 900, swell: 0.08, gain: 0.6 },
    crickets: { tones: [4300], pulse: 7, gain: 0.05 },
    white: { noise: 'white', filter: 16000, gain: 0.2 },
    pink: { noise: 'pink', filter: 16000, gain: 0.4 },
    brown: { noise: 'brown', filter: 16000, gain: 0.8 },
    fan: { noise: 'brown', filter: 1400, tones: [118], gain: 0.6 },
    train: { noise: 'brown', filter: 420, pulse: 1.4, gain: 0.8 },
    fire: { noise: 'brown', filter: 700, swell: 0.9, gain: 0.7 },
    space: { tones: [55, 82.5, 110.2], swell: 0.05, gain: 0.25 },
    bowl: { tones: [220, 331, 528.5], swell: 0.25, gain: 0.12 }
  };
  var PREVIEW_SECONDS = 30;
  var SOUND_CATEGORIES = { all: true, rain: true, nature: true, noise: true, ambient: true, favourites: true };

  // Pricing (US dollars, before any sales tax). Annual prices are what's charged once a year.
  var PLANS = {
    free: { monthly: 0, annual: 0 },
    premium: { monthly: 6.99, annual: 55.99 },
    family: { monthly: 11.99, annual: 95.99 }
  };
  var BILLING = { monthly: true, annual: true };

  // Reviews and guides filters (values must match the data-* attributes in the HTML).
  var REVIEW_STARS = { all: true, 5: true, 4: true, low: true };
  var REVIEW_TOPICS = { all: true, sounds: true, alarm: true, routine: true, diary: true, price: true };
  var REVIEW_SORTS = { newest: true, highest: true, lowest: true };
  var GUIDE_TOPICS = { all: true, routines: true, bedroom: true, sounds: true, mornings: true };
  var CONTACT_TOPICS = { help: true, billing: true, bug: true, feedback: true, press: true };

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var own = function (obj, key) { return key != null && Object.prototype.hasOwnProperty.call(obj, key); };

  // localStorage, or an in-memory stand-in when storage is blocked (sandboxed iframes,
  // strict privacy settings). Saved state then lasts for the page view instead of failing.
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
  function readJSON(key, fallback) {
    try { var v = JSON.parse(safeStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function writeJSON(key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* quota */ } }

  var params = new URLSearchParams(window.location.search);
  var plural = function (n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); };

  // "HH:MM" <-> minutes after midnight.
  var TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;
  function toMinutes(t) { var m = TIME_RE.exec(t || ''); return m ? (+m[1]) * 60 + (+m[2]) : null; }
  function toTime(mins) {
    var m = ((Math.round(mins) % 1440) + 1440) % 1440;
    var h = Math.floor(m / 60), mm = m % 60;
    return (h < 10 ? '0' : '') + h + ':' + (mm < 10 ? '0' : '') + mm;
  }
  // "HH:MM" -> "10:45 PM", for anything a visitor reads.
  function clock12(t) {
    var mins = toMinutes(t);
    if (mins === null) return t;
    var h = Math.floor(mins / 60), mm = mins % 60;
    return (h % 12 || 12) + ':' + (mm < 10 ? '0' : '') + mm + (h < 12 ? ' AM' : ' PM');
  }
  function nowTime() {
    var d = new Date();
    return toTime(d.getHours() * 60 + d.getMinutes());
  }
  function durationText(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    if (!h) return plural(m, 'minute');
    return plural(h, 'hour') + (m ? ' ' + plural(m, 'minute') : '');
  }

  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 3000);
  }
  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else {
      fallback();
    }
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  /* ------------------------------------------------------------------
   * 3. Theme toggle. Dark ("night") is the default; the `light` class on <html>
   *    switches to the dawn theme. An inline script in <head> applies a saved
   *    choice before the page paints.
   * ------------------------------------------------------------------ */
  var themeMeta = $('meta[name="theme-color"]');
  function applyThemeUi() {
    var light = root.classList.contains('light');
    $$('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    });
    if (themeMeta) themeMeta.setAttribute('content', light ? '#f6f4fc' : '#060818');
  }
  // The head script reads localStorage directly; when it's blocked, restore a choice made earlier in this page view.
  if (safeStorage.getItem(STORAGE.theme) === 'light') root.classList.add('light');
  $$('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var light = root.classList.toggle('light');
      safeStorage.setItem(STORAGE.theme, light ? 'light' : 'dark');
      applyThemeUi();
    });
  });
  applyThemeUi();

  /* ------------------------------------------------------------------
   * 4. Header, mobile menu, footer year
   * ------------------------------------------------------------------ */
  var header = $('#site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  var menuBtn = $('#menu-button');
  var menu = $('#mobile-menu');
  if (menuBtn && menu) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
      $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
      $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
    };
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.matchMedia('(min-width: 1280px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ------------------------------------------------------------------
   * 5. Scroll reveal. Revealing an element also reveals everything above it,
   *    so fast jumps (End key, anchor links) never leave content hidden.
   * ------------------------------------------------------------------ */
  var revealEls = $$('.reveal');
  if (reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var pending = revealEls.slice();
    var queued = false;
    var checkReveals = function () {
      queued = false;
      var limit = window.innerHeight * 0.92;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < limit) { el.classList.add('is-visible'); return false; }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener('scroll', queueReveal);
        window.removeEventListener('resize', queueReveal);
      }
    };
    var queueReveal = function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(checkReveals);
    };
    window.addEventListener('scroll', queueReveal, { passive: true });
    window.addEventListener('resize', queueReveal);
    checkReveals();
  }

  /* ------------------------------------------------------------------
   * 6. Feature tour tabs: each tab shows its panel and swaps the phone screen.
   *    Arrow keys, Home and End move between tabs (automatic activation).
   * ------------------------------------------------------------------ */
  function initTour() {
    var tour = $('[data-tour]');
    if (!tour) return;
    var tabs = $$('[role="tab"]', tour);
    var phone = $('[data-tour-phone]', tour);
    function select(tab, focus) {
      var id = tab.getAttribute('data-tour-tab');
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      $$('[data-tour-panel]', tour).forEach(function (p) { p.hidden = p.getAttribute('data-tour-panel') !== id; });
      $$('[data-tour-screen]', phone).forEach(function (s) { s.classList.toggle('is-active', s.getAttribute('data-tour-screen') === id); });
      var title = $('.font-serif', tab);
      phone.setAttribute('aria-label', 'Nightjar app screen for the selected feature: ' + (title ? title.textContent : id));
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
  }

  /* ------------------------------------------------------------------
   * 7. Wind-down routine builder: check steps and a lights-out time; the plan
   *    counts back to the start time. Saved under STORAGE.routine.
   * ------------------------------------------------------------------ */
  function initRoutine() {
    var box = $('[data-routine]');
    if (!box) return;
    var stepsEl = $('[data-routine-steps]', box);
    var lights = $('#routine-lights', box);

    function load() {
      var saved = readJSON(STORAGE.routine, null);
      var state = { steps: ROUTINE_DEFAULTS.steps.slice(), lightsOut: ROUTINE_DEFAULTS.lightsOut };
      if (saved && typeof saved === 'object') {
        if (Array.isArray(saved.steps)) state.steps = saved.steps.filter(function (id) { return typeof id === 'string' && own(ROUTINE_STEPS, id); });
        if (toMinutes(saved.lightsOut) !== null) state.lightsOut = saved.lightsOut;
      }
      return state;
    }
    var state = load();

    stepsEl.innerHTML = Object.keys(ROUTINE_STEPS).map(function (id) {
      var s = ROUTINE_STEPS[id];
      return '<label class="flex cursor-pointer items-center gap-3 rounded-2xl border border-line bg-raised/60 px-4 py-3 text-[15px] transition hover:border-accent/60 has-checked:border-accent has-checked:bg-raised">' +
        '<input type="checkbox" name="step" value="' + id + '" class="h-4 w-4 shrink-0 accent-[#9b8cff]">' +
        '<span class="flex-1 font-bold">' + escapeHtml(s.label) + '</span><span class="text-sm text-subtle">' + s.minutes + ' min</span></label>';
    }).join('');

    function render() {
      $$('input[name="step"]', stepsEl).forEach(function (cb) { cb.checked = state.steps.indexOf(cb.value) !== -1; });
      lights.value = state.lightsOut;
      // Keep the order of ROUTINE_STEPS, not the order the boxes were checked.
      var chosen = Object.keys(ROUTINE_STEPS).filter(function (id) { return state.steps.indexOf(id) !== -1; });
      var total = chosen.reduce(function (n, id) { return n + ROUTINE_STEPS[id].minutes; }, 0);
      var end = toMinutes(state.lightsOut);
      var start = end - total;
      $('[data-routine-start]', box).textContent = chosen.length ? 'Start winding down at ' + clock12(toTime(start)) : 'Pick a step or two to begin';
      $('[data-routine-summary]', box).textContent = plural(chosen.length, 'step') + ' · ' + durationText(total) + ' before lights out at ' + clock12(state.lightsOut);
      var t = start;
      var rows = chosen.map(function (id) {
        var row = '<li class="flex items-center gap-4 rounded-2xl border border-line bg-card/60 px-4 py-3"><span class="w-20 shrink-0 whitespace-nowrap font-serif text-xl tabular-nums text-accent">' + clock12(toTime(t)) + '</span><span class="flex-1 font-bold">' + escapeHtml(ROUTINE_STEPS[id].label) + '</span><span class="text-sm text-subtle">' + ROUTINE_STEPS[id].minutes + ' min</span></li>';
        t += ROUTINE_STEPS[id].minutes;
        return row;
      });
      rows.push('<li class="flex items-center gap-4 rounded-2xl bg-cta px-4 py-3 text-cta-fg"><span class="w-20 shrink-0 whitespace-nowrap font-serif text-xl tabular-nums">' + clock12(state.lightsOut) + '</span><span class="flex-1 font-extrabold">Lights out</span></li>');
      $('[data-routine-list]', box).innerHTML = rows.join('');
    }
    function save() { writeJSON(STORAGE.routine, state); }

    stepsEl.addEventListener('change', function () {
      state.steps = $$('input[name="step"]:checked', stepsEl).map(function (cb) { return cb.value; });
      save();
      render();
    });
    lights.addEventListener('change', function () {
      if (toMinutes(lights.value) === null) return;
      state.lightsOut = lights.value;
      save();
      render();
    });
    $('[data-routine-reset]', box).addEventListener('click', function () {
      state = { steps: ROUTINE_DEFAULTS.steps.slice(), lightsOut: ROUTINE_DEFAULTS.lightsOut };
      safeStorage.removeItem(STORAGE.routine);
      render();
      toast('Routine reset to the suggested steps');
    });
    render();
  }

  /* ------------------------------------------------------------------
   * 8. Bedtime calculator. wake mode: bedtime = wake − cycles × 90 − latency.
   *    bed mode: wake time = bedtime + latency + cycles × 90.
   *    Reads ?mode=wake|bed&time=HH:MM&latency=15, then saved settings.
   * ------------------------------------------------------------------ */
  function calcTimes(mode, time, latency) {
    var base = toMinutes(time);
    var list = CYCLE_COUNTS.map(function (n) {
      var t = mode === 'wake' ? base - n * CYCLE_MINUTES - latency : base + latency + n * CYCLE_MINUTES;
      return { cycles: n, time: toTime(t), sleepMinutes: n * CYCLE_MINUTES };
    });
    // Chronological: earliest bedtime first, or earliest wake time first.
    return mode === 'wake' ? list : list.slice().reverse();
  }

  function initCalculator() {
    var box = $('[data-calc]');
    if (!box) return;
    var form = $('[data-calc-form]', box);
    var timeEl = $('#calc-time', box);
    var latencyEl = $('#calc-latency', box);
    var nowBtn = $('[data-calc-now]', box);

    var state = { mode: CALC_DEFAULTS.mode, time: CALC_DEFAULTS.time, latency: CALC_DEFAULTS.latency };
    var saved = readJSON(STORAGE.calculator, null);
    if (saved && typeof saved === 'object') {
      if (own(CALC_MODES, saved.mode)) state.mode = saved.mode;
      if (toMinutes(saved.time) !== null) state.time = saved.time;
      if (own(LATENCY_OPTIONS, String(saved.latency))) state.latency = +saved.latency;
    }
    // A shared link wins over saved settings.
    if (own(CALC_MODES, params.get('mode'))) state.mode = params.get('mode');
    if (toMinutes(params.get('time')) !== null) state.time = params.get('time');
    if (own(LATENCY_OPTIONS, params.get('latency'))) state.latency = +params.get('latency');

    function shareUrl() {
      var url = new URL(window.location.href);
      url.search = '?mode=' + state.mode + '&time=' + state.time + '&latency=' + state.latency;
      url.hash = '';
      return url;
    }

    function render(persist) {
      $$('input[name="mode"]', form).forEach(function (r) { r.checked = r.value === state.mode; });
      timeEl.value = state.time;
      latencyEl.value = String(state.latency);
      var mode = CALC_MODES[state.mode];
      $('[data-calc-time-label]', box).textContent = mode.label;
      $('[data-calc-heading]', box).textContent = mode.heading;
      nowBtn.hidden = state.mode !== 'bed';
      $('[data-calc-intro]', box).textContent = state.mode === 'wake'
        ? 'To wake up at ' + clock12(state.time) + ', aim to be in bed by one of these times. We’ve allowed about ' + plural(state.latency, 'minute') + ' to fall asleep.'
        : 'If you’re in bed at ' + clock12(state.time) + ' and fall asleep in about ' + plural(state.latency, 'minute') + ', try waking at one of these times.';
      $('[data-calc-results]', box).innerHTML = calcTimes(state.mode, state.time, state.latency).map(function (r) {
        var best = own(SUGGESTED_CYCLES, r.cycles);
        return '<li class="relative rounded-2xl border p-5 ' + (best ? 'border-moon/60 bg-raised' : 'border-line bg-card/60') + '" data-calc-result>' +
          (best ? '<span class="absolute top-4 right-4 rounded-full bg-cta px-2.5 py-0.5 text-xs font-extrabold text-cta-fg">Suggested</span>' : '') +
          '<span class="block text-sm font-bold text-muted">' + mode.verb + '</span>' +
          '<span class="mt-1 block font-serif text-4xl tabular-nums" data-calc-time>' + clock12(r.time) + '</span>' +
          '<span class="mt-2 block text-sm text-muted">' + plural(r.cycles, 'cycle') + ' · ' + durationText(r.sleepMinutes) + ' of sleep</span></li>';
      }).join('');
      if (persist) {
        writeJSON(STORAGE.calculator, state);
        try { history.replaceState(null, '', shareUrl().toString()); } catch (e) { /* file:// or sandbox */ }
      }
    }

    form.addEventListener('change', function (e) {
      if (e.target.name === 'mode' && own(CALC_MODES, e.target.value)) state.mode = e.target.value;
      if (e.target === timeEl && toMinutes(timeEl.value) !== null) state.time = timeEl.value;
      if (e.target === latencyEl && own(LATENCY_OPTIONS, latencyEl.value)) state.latency = +latencyEl.value;
      render(true);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (toMinutes(timeEl.value) === null) {
        timeEl.setAttribute('aria-invalid', 'true');
        timeEl.focus();
        toast('Enter a time like 7:00 AM');
        return;
      }
      timeEl.removeAttribute('aria-invalid');
      state.time = timeEl.value;
      render(true);
      var first = $('[data-calc-result]', box);
      if (first && window.innerWidth < 1024) first.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
    nowBtn.addEventListener('click', function () {
      state.time = nowTime();
      render(true);
    });
    $('[data-calc-copy]', box).addEventListener('click', function () {
      copyText(shareUrl().toString(), function (ok) { toast(ok ? 'Link copied' : 'Couldn’t copy the link'); });
    });
    render(false);
  }

  /* ------------------------------------------------------------------
   * 9. Sound library. Filters (?cat=rain), search, favorites saved under
   *    STORAGE.favourites, and one preview at a time that stops after
   *    PREVIEW_SECONDS. Without Web Audio, the buttons still show their state.
   * ------------------------------------------------------------------ */
  var audio = { ctx: null, master: null, sources: [], timer: null, tick: null, id: null };

  function noiseBuffer(ctx, colour) {
    var length = ctx.sampleRate * 2;
    var buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    var data = buffer.getChannelData(0);
    var b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
    for (var i = 0; i < length; i++) {
      var white = Math.random() * 2 - 1;
      if (colour === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179; b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520; b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522; b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      } else if (colour === 'brown') {
        last = (last + 0.02 * white) / 1.02;
        data[i] = last * 3.5;
      } else {
        data[i] = white;
      }
    }
    // Cross-fade the loop point so the 2-second buffer repeats without a click.
    var fade = Math.floor(ctx.sampleRate * 0.05);
    for (var j = 0; j < fade; j++) {
      var k = j / fade;
      data[length - fade + j] = data[length - fade + j] * (1 - k) + data[j] * k;
    }
    return buffer;
  }

  function stopAudio(fast) {
    clearTimeout(audio.timer);
    clearInterval(audio.tick);
    var ctx = audio.ctx, master = audio.master, sources = audio.sources;
    audio.master = null;
    audio.sources = [];
    audio.id = null;
    if (!ctx || !master) return;
    try {
      var t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + (fast ? 0.05 : 0.4));
      sources.forEach(function (s) { try { s.stop(t + (fast ? 0.1 : 0.5)); } catch (e) { /* already stopped */ } });
    } catch (e) { /* ignore */ }
  }

  // Returns true when sound actually started.
  function startAudio(id) {
    stopAudio(true);
    var recipe = own(SOUND_RECIPES, id) ? SOUND_RECIPES[id] : null;
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!recipe || !AC) return false;
    try {
      var ctx = audio.ctx || (audio.ctx = new AC());
      if (ctx.state === 'suspended') ctx.resume();
      var t = ctx.currentTime;
      var master = ctx.createGain();
      master.gain.setValueAtTime(0, t);
      master.gain.linearRampToValueAtTime(0.35 * recipe.gain, t + 1.5);
      var out = master;
      if (recipe.swell || recipe.pulse) {
        // A slow (swell) or quick (pulse) wobble in volume.
        var shaper = ctx.createGain();
        shaper.gain.value = recipe.pulse ? 0.5 : 0.65;
        var lfo = ctx.createOscillator();
        lfo.type = recipe.pulse ? 'square' : 'sine';
        lfo.frequency.value = recipe.pulse || recipe.swell;
        var depth = ctx.createGain();
        depth.gain.value = recipe.pulse ? 0.5 : 0.35;
        lfo.connect(depth);
        depth.connect(shaper.gain);
        lfo.start(t);
        audio.sources.push(lfo);
        shaper.connect(master);
        out = shaper;
      }
      master.connect(ctx.destination);
      if (recipe.noise) {
        var src = ctx.createBufferSource();
        src.buffer = noiseBuffer(ctx, recipe.noise);
        src.loop = true;
        var filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = recipe.filter || 16000;
        src.connect(filter);
        filter.connect(out);
        src.start(t);
        audio.sources.push(src);
      }
      (recipe.tones || []).forEach(function (f) {
        var osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = f;
        var g = ctx.createGain();
        g.gain.value = 1 / recipe.tones.length;
        osc.connect(g);
        g.connect(out);
        osc.start(t);
        audio.sources.push(osc);
      });
      audio.master = master;
      return true;
    } catch (e) {
      stopAudio(true);
      return false;
    }
  }

  function initSounds() {
    var list = $('[data-sound-list]');
    if (!list) return;
    var cards = $$('[data-sound]', list);
    var search = $('[data-sound-search]');
    var bar = $('[data-now-playing]');
    var known = {};
    cards.forEach(function (c) { known[c.getAttribute('data-sound')] = c; });

    var favs = readJSON(STORAGE.favourites, []);
    favs = Array.isArray(favs) ? favs.filter(function (id, i, a) { return typeof id === 'string' && own(known, id) && a.indexOf(id) === i; }) : [];
    var filter = own(SOUND_CATEGORIES, params.get('cat')) ? params.get('cat') : 'all';
    var playing = null;
    var warned = false;

    function apply() {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      cards.forEach(function (c) {
        var id = c.getAttribute('data-sound');
        var okCat = filter === 'all' || (filter === 'favourites' ? favs.indexOf(id) !== -1 : c.getAttribute('data-category') === filter);
        var okText = !q || c.textContent.toLowerCase().indexOf(q) !== -1;
        c.hidden = !(okCat && okText);
        if (!c.hidden) shown++;
      });
      $$('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === filter)); });
      $('[data-sound-count]').textContent = 'Showing ' + plural(shown, 'sound');
      var empty = $('[data-sound-empty]');
      empty.hidden = shown > 0;
      $('[data-sound-empty-text]').textContent = filter === 'favourites' && !favs.length
        ? 'Tap the heart on any sound to save it here.'
        : 'No sounds match your search.';
    }
    function renderFavs() {
      cards.forEach(function (c) {
        $('[data-fav]', c).setAttribute('aria-pressed', String(favs.indexOf(c.getAttribute('data-sound')) !== -1));
      });
      $$('[data-fav-count]').forEach(function (el) { el.textContent = String(favs.length); });
    }
    function setPlaying(id, started) {
      cards.forEach(function (c) {
        var on = c.getAttribute('data-sound') === id;
        c.classList.toggle('is-playing', on);
        var btn = $('[data-play]', c);
        btn.setAttribute('aria-pressed', String(on));
        $('[data-play-label]', c).textContent = on ? 'Playing' : 'Preview';
      });
      playing = id;
      if (!bar) return;
      bar.hidden = !id;
      if (!id) return;
      $('[data-now-name]', bar).textContent = known[id].getAttribute('data-name');
      var left = PREVIEW_SECONDS;
      var timeEl = $('[data-now-time]', bar);
      timeEl.textContent = started ? '0:' + (left < 10 ? '0' : '') + left : '(sound unavailable)';
      clearInterval(audio.tick);
      clearTimeout(audio.timer);
      audio.tick = setInterval(function () {
        left = Math.max(0, left - 1);
        if (started) timeEl.textContent = '0:' + (left < 10 ? '0' : '') + left;
      }, 1000);
      audio.timer = setTimeout(stop, PREVIEW_SECONDS * 1000);
    }
    function stop() {
      stopAudio(false);
      setPlaying(null, false);
    }

    list.addEventListener('click', function (e) {
      var fav = e.target.closest('[data-fav]');
      var play = e.target.closest('[data-play]');
      var card = e.target.closest('[data-sound]');
      if (!card) return;
      var id = card.getAttribute('data-sound');
      var name = card.getAttribute('data-name');
      if (fav) {
        var at = favs.indexOf(id);
        if (at === -1) favs.push(id); else favs.splice(at, 1);
        writeJSON(STORAGE.favourites, favs);
        renderFavs();
        toast(at === -1 ? name + ' saved to favorites' : name + ' removed from favorites');
        if (filter === 'favourites') apply();
      } else if (play) {
        if (playing === id) { stop(); return; }
        var started = startAudio(id);
        setPlaying(id, started);
        if (!started && !warned) { warned = true; toast('Your browser can’t play previews, but you can still save favorites'); }
      }
    });
    $$('[data-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        filter = b.getAttribute('data-filter');
        apply();
        try {
          var url = new URL(window.location.href);
          if (filter === 'all') url.searchParams.delete('cat'); else url.searchParams.set('cat', filter);
          history.replaceState(null, '', url.toString());
        } catch (e) { /* file:// or sandbox */ }
      });
    });
    search.addEventListener('input', apply);
    $('[data-sound-clear]').addEventListener('click', function () {
      search.value = '';
      filter = 'all';
      apply();
    });
    if (bar) $('[data-now-stop]', bar).addEventListener('click', stop);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && playing) stop(); });
    document.addEventListener('visibilitychange', function () { if (document.hidden && playing) stop(); });
    renderFavs();
    apply();
  }

  /* ------------------------------------------------------------------
   * 10. Pricing: monthly / annual switch (?billing=annual).
   * ------------------------------------------------------------------ */
  var gbp = function (n) { return '$' + n.toFixed(2); };
  function initPricing() {
    var sw = $('[data-billing-switch]');
    if (!sw) return;
    var billing = own(BILLING, params.get('billing')) ? params.get('billing') : 'monthly';
    function render() {
      var annual = billing === 'annual';
      sw.setAttribute('aria-checked', String(annual));
      Object.keys(PLANS).forEach(function (id) {
        var p = PLANS[id];
        var priceEl = $('[data-price="' + id + '"]');
        if (!priceEl) return;
        var periodEl = $('[data-period="' + id + '"]');
        var billedEl = $('[data-billed="' + id + '"]');
        if (!p.monthly) {
          priceEl.textContent = '$0';
          periodEl.textContent = 'forever';
          billedEl.textContent = 'No card, no account needed.';
          return;
        }
        if (annual) {
          var full = p.monthly * 12;
          var saving = full - p.annual;
          priceEl.textContent = gbp(p.annual / 12);
          periodEl.textContent = '/month';
          billedEl.textContent = gbp(p.annual) + ' billed once a year. You save ' + gbp(saving) + ' (' + Math.round((saving / full) * 100) + '%).';
        } else {
          priceEl.textContent = gbp(p.monthly);
          periodEl.textContent = '/month';
          billedEl.textContent = 'Billed monthly. Cancel anytime.';
        }
      });
    }
    sw.addEventListener('click', function () {
      billing = billing === 'annual' ? 'monthly' : 'annual';
      render();
      try {
        var url = new URL(window.location.href);
        url.searchParams.set('billing', billing);
        history.replaceState(null, '', url.toString());
      } catch (e) { /* file:// or sandbox */ }
    });
    render();
  }

  /* ------------------------------------------------------------------
   * 11. Reviews: filter by rating (?stars=5) and topic (?topic=alarm), sort.
   * ------------------------------------------------------------------ */
  function initReviews() {
    var list = $('[data-review-list]');
    if (!list) return;
    var items = $$('[data-review]', list);
    var topicEl = $('[data-review-topic]');
    var sortEl = $('[data-review-sort]');
    var stars = own(REVIEW_STARS, params.get('stars')) ? params.get('stars') : 'all';
    if (own(REVIEW_TOPICS, params.get('topic'))) topicEl.value = params.get('topic');

    function apply() {
      var topic = own(REVIEW_TOPICS, topicEl.value) ? topicEl.value : 'all';
      var sort = own(REVIEW_SORTS, sortEl.value) ? sortEl.value : 'newest';
      var shown = 0;
      items.slice().sort(function (a, b) {
        var sa = +a.getAttribute('data-stars'), sb = +b.getAttribute('data-stars');
        var da = a.getAttribute('data-date'), db = b.getAttribute('data-date');
        if (sort === 'highest' && sa !== sb) return sb - sa;
        if (sort === 'lowest' && sa !== sb) return sa - sb;
        return da < db ? 1 : da > db ? -1 : 0;
      }).forEach(function (el) {
        var s = +el.getAttribute('data-stars');
        var okStars = stars === 'all' || (stars === 'low' ? s <= 3 : s === +stars);
        var okTopic = topic === 'all' || el.getAttribute('data-topic') === topic;
        el.hidden = !(okStars && okTopic);
        if (!el.hidden) shown++;
        list.appendChild(el);
      });
      $$('[data-stars]').forEach(function (b) {
        if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', String(b.getAttribute('data-stars') === stars));
      });
      $('[data-review-count]').textContent = 'Showing ' + plural(shown, 'review');
      $('[data-review-empty]').hidden = shown > 0;
    }
    $$('button[data-stars]').forEach(function (b) {
      b.addEventListener('click', function () { stars = b.getAttribute('data-stars'); apply(); });
    });
    topicEl.addEventListener('change', apply);
    sortEl.addEventListener('change', apply);
    $('[data-review-clear]').addEventListener('click', function () {
      stars = 'all';
      topicEl.value = 'all';
      apply();
    });
    apply();
  }

  /* ------------------------------------------------------------------
   * 12. Guides: topic filter (?topic=mornings).
   * ------------------------------------------------------------------ */
  function initGuides() {
    var guides = $$('[data-guide]');
    if (!guides.length) return;
    var topic = own(GUIDE_TOPICS, params.get('topic')) ? params.get('topic') : 'all';
    function apply() {
      var shown = 0;
      guides.forEach(function (g) {
        g.hidden = topic !== 'all' && g.getAttribute('data-topic') !== topic;
        if (!g.hidden) shown++;
      });
      var featured = $('[data-guide-featured]');
      if (featured) featured.hidden = !$('[data-guide]:not([hidden])', featured);
      $$('[data-topic-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-topic-filter') === topic)); });
      $('[data-guide-count]').textContent = plural(shown, 'guide');
    }
    $$('[data-topic-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        topic = b.getAttribute('data-topic-filter');
        apply();
        try {
          var url = new URL(window.location.href);
          if (topic === 'all') url.searchParams.delete('topic'); else url.searchParams.set('topic', topic);
          history.replaceState(null, '', url.toString());
        } catch (e) { /* file:// or sandbox */ }
      });
    });
    apply();
  }

  /* ------------------------------------------------------------------
   * 13. Help center search: filters questions and answers as you type.
   * ------------------------------------------------------------------ */
  function initFaqSearch() {
    var input = $('[data-faq-search]');
    if (!input) return;
    var items = $$('[data-faq-item]');
    function apply() {
      var words = input.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
      var shown = 0;
      items.forEach(function (d) {
        var text = d.textContent.toLowerCase();
        var ok = words.every(function (w) { return text.indexOf(w) !== -1; });
        d.hidden = !ok;
        if (ok) shown++;
      });
      $$('[data-faq-group]').forEach(function (g) { g.hidden = !$('[data-faq-item]:not([hidden])', g); });
      $('[data-faq-count]').textContent = words.length ? plural(shown, 'answer') + ' found' : plural(shown, 'answer');
      $('[data-faq-empty]').hidden = shown > 0;
    }
    input.addEventListener('input', apply);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        var faq = $('#faq');
        if (faq) faq.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    });
  }

  /* ------------------------------------------------------------------
   * 14. Forms: inline validation and a success state. Demo forms send nothing.
   *
   * To connect the contact form to a real service (e.g. Formspree), replace the
   * success block in the submit handler with:
   *
   *   fetch('https://formspree.io/f/YOUR_ID', {
   *     method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' }
   *   }).then(function (r) { if (r.ok) showSuccess(); else showError(); });
   * ------------------------------------------------------------------ */
  // A short reference, like NJ-7K2Q (no 0/O or 1/I to misread).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  function fieldMessage(el) {
    var v = el.value.trim();
    var label = el.getAttribute('data-label') || 'This field';
    if (el.required && !v) return label + ' is required.';
    if (!v) return '';
    if (el.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter an email address like name@example.com.';
    var min = +el.getAttribute('minlength');
    if (min && v.length < min) return label + ' needs at least ' + min + ' characters (' + plural(min - v.length, 'more character') + ' to go).';
    return '';
  }
  function showError(el, msg) {
    var errId = el.id + '-error';
    var err = document.getElementById(errId);
    if (!msg) {
      el.removeAttribute('aria-invalid');
      if (err) err.remove();
      var desc = (el.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== errId; }).join(' ');
      if (desc) el.setAttribute('aria-describedby', desc); else el.removeAttribute('aria-describedby');
      return;
    }
    if (!err) {
      err = document.createElement('p');
      err.id = errId;
      err.className = 'field-error';
      el.insertAdjacentElement('afterend', err);
    }
    err.textContent = msg;
    el.setAttribute('aria-invalid', 'true');
    var ids = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    if (ids.indexOf(errId) === -1) ids.push(errId);
    el.setAttribute('aria-describedby', ids.join(' '));
  }
  function initForms() {
    var topicEl = $('[data-contact-topic]');
    if (topicEl && own(CONTACT_TOPICS, params.get('topic'))) topicEl.value = params.get('topic');

    $$('form[data-form]').forEach(function (form) {
      var fields = $$('input, select, textarea', form).filter(function (el) { return el.required || el.hasAttribute('minlength') || el.type === 'email'; });
      fields.forEach(function (el) {
        el.addEventListener('blur', function () { if (el.value.trim()) showError(el, fieldMessage(el)); });
        el.addEventListener('input', function () { if (el.getAttribute('aria-invalid') === 'true') showError(el, fieldMessage(el)); });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var firstBad = null;
        fields.forEach(function (el) {
          var msg = fieldMessage(el);
          showError(el, msg);
          if (msg && !firstBad) firstBad = el;
        });
        if (firstBad) { firstBad.focus(); return; }
        var success = document.getElementById(form.id.replace('-form', '-success'));
        var name = (form.elements.name && form.elements.name.value.trim().split(' ')[0]) || '';
        if (success) {
          $('[data-success-title]', success).textContent = name ? 'Thanks, ' + name + '.' : 'Thanks.';
          var refEl = $('[data-success-ref]', success);
          if (refEl) refEl.textContent = makeRef('NJ');
          form.hidden = true;
          success.hidden = false;
          success.focus();
        }
      });
    });
    $$('[data-form-reset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var form = document.getElementById(btn.getAttribute('data-form-reset'));
        if (!form) return;
        form.reset();
        form.hidden = false;
        btn.closest('[id]').hidden = true;
        var first = $('input, select, textarea', form);
        if (first) first.focus();
      });
    });
  }

  /* ------------------------------------------------------------------
   * 15. Copy buttons: data-copy-target="id" copies an element's text,
   *     data-copy-text="..." copies the attribute value.
   * ------------------------------------------------------------------ */
  function initCopy() {
    $$('[data-copy-target], [data-copy-text]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var target = btn.getAttribute('data-copy-target');
        var text = target ? (document.getElementById(target) || {}).textContent : btn.getAttribute('data-copy-text');
        if (!text) return;
        copyText(text.trim(), function (ok) { toast(ok ? 'Copied: ' + (text.length > 30 ? 'text copied to your clipboard' : text.trim()) : 'Couldn’t copy. Select the text instead.'); });
      });
    });
  }

  initTour();
  initRoutine();
  initCalculator();
  initSounds();
  initPricing();
  initReviews();
  initGuides();
  initFaqSearch();
  initForms();
  initCopy();
})();

/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It lifts itself above toasts and the sound preview
   bar so they never overlap. Mark your own UI with data-back-to-top-avoid (lift
   above it) or data-back-to-top-hide (hide while covering it). To remove the
   button: delete this block and the .back-to-top styles in src/input.css. */
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
  var AVOID = '[data-toast], #toast, .toast, [data-back-to-top-avoid]';
  var queued = false;

  function isShown(el) {
    if (el.hidden) return false;
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
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !coversHideZone());
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
  document.addEventListener('click', function () { window.setTimeout(schedule, 50); });
  update();

  function focusTop() {
    var target = document.getElementById('main') || document.querySelector('main');
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
