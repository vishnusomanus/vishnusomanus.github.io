/* Solstice — site behavior. Vanilla JavaScript, no dependencies.
   Content (artists, stages, food vendors, ticket prices) lives in assets/js/data.js. */
(function () {
  'use strict';

  /* localStorage, or memory when it's blocked or a save fails (storage full). Memory is read first, so a change
     that couldn't be saved still shows for this page view. */
  var safeStorage = (function () {
    var local = null;
    try { local = window.localStorage; local.getItem('_'); } catch (e) { local = null; /* blocked */ }
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

  var D = window.SOLSTICE || { days: [], stages: [], genres: {}, artists: [], diets: {}, vendors: [], tickets: [], addons: [] };
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var params = new URLSearchParams(location.search);

  // A short reference for orders and messages, like SO-7K2Q (no 0/O or 1/I to misread).
  function makeRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return 'SO-' + out;
  }

  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Read (one argument) or write (two arguments) JSON in localStorage. Never throws.
  function store(key, value) {
    try {
      if (arguments.length < 2) return JSON.parse(safeStorage.getItem(key));
      if (value === null) safeStorage.removeItem(key);
      else safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) { return null; }
  }
  function byId(list) {
    var map = new Map();
    list.forEach(function (x) { map.set(x.id, x); });
    return map;
  }
  var artists = byId(D.artists);
  var stages = byId(D.stages);
  var days = byId(D.days);
  var tickets = byId(D.tickets);
  var addons = byId(D.addons);

  // Festival times are local (Eastern time). Add ?now=2027-06-26T21:40 to any page to preview a moment.
  function festivalTime(local) { return new Date(local + (local.length === 16 ? ':00' : '') + D.utcOffset); }
  function now() {
    var p = params.get('now');
    var d = p && /^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(p) ? festivalTime(p) : null;
    return d && !isNaN(d) ? d : new Date();
  }

  /* ---------------------------------------------------------- demo dates
     The festival is written for the days in D.days. While D.keepDemoCurrent is true and that edition is over
     (after the last day's curfew), every date moves on to the same week of a later year, by whole weeks so
     weekdays never change (Friday, June 25, 2027 becomes Friday, June 23, 2028), and the edition year follows.
     The page text is updated through data-edition, data-date and data-day-label (see DOCS.md, "Demo dates"). */
  var DAY_MS = 86400000;
  function dayNum(iso) { return Math.round(Date.parse(iso.slice(0, 10) + 'T00:00:00Z') / DAY_MS); }
  function isoOf(day) { return new Date(day * DAY_MS).toISOString().slice(0, 10); }
  function fmtDate(iso, opts) { return new Date(iso.slice(0, 10) + 'T12:00:00Z').toLocaleDateString('en-US', Object.assign({ timeZone: 'UTC' }, opts)); }
  var BASE_YEAR = D.days.length ? +D.days[0].date.slice(0, 4) : 0;
  var SHIFT = (function () {
    if (!D.keepDemoCurrent || !D.days.length) return 0;
    var first = D.days[0].date, last = D.days[D.days.length - 1];
    var end = festivalTime(last.date + 'T' + last.curfew).getTime(), t = now().getTime(), shift = 0;
    for (var y = 1; end + shift * DAY_MS < t && y < 100; y++) {
      shift = Math.round((dayNum((BASE_YEAR + y) + first.slice(4)) - dayNum(first)) / 7) * 7;
    }
    return shift;
  })();
  // "2027-06-25T14:00:00-04:00" (or any ISO string) moved on by SHIFT days; the time part is kept.
  function shiftIso(iso) { return SHIFT ? isoOf(dayNum(iso) + SHIFT) + iso.slice(10) : iso; }
  var EDITION_YEAR = SHIFT ? +shiftIso(D.days[0].date).slice(0, 4) : BASE_YEAR;
  var MONTH_NAMES = 'January February March April May June July August September October November December'.split(' ');
  // Moves dates written for the 2027 edition on inside free text ("June 25, 2027", "June 25–27") and swaps the
  // edition years (2026, 2027, 2028) for the current ones. Used for titles, attributes, bios and the calendar file.
  function shiftText(str) {
    if (!SHIFT) return str;
    return String(str).replace(new RegExp('\\b(' + MONTH_NAMES.join('|') + ') (\\d{1,2})(?:–(\\d{1,2}))?(?:, (\\d{4}))?\\b|\\b(' + (BASE_YEAR - 1) + '|' + BASE_YEAR + '|' + (BASE_YEAR + 1) + ')\\b', 'g'), function (m, month, d1, d2, year, bare) {
      if (bare) return String(+bare - BASE_YEAR + EDITION_YEAR);
      var mm = String(MONTH_NAMES.indexOf(month) + 1).padStart(2, '0');
      var iso = function (d) { return shiftIso((year || BASE_YEAR) + '-' + mm + '-' + String(d).padStart(2, '0')); };
      var a = iso(d1), b = d2 ? iso(d2) : null;
      var opts = { day: 'numeric', month: 'long' };
      var text = b
        ? (a.slice(0, 7) === b.slice(0, 7) ? fmtDate(a, opts) + '–' + fmtDate(b, { day: 'numeric' }) : fmtDate(a, opts) + ' – ' + fmtDate(b, opts))
        : fmtDate(a, opts);
      return text + (year ? ', ' + (b || a).slice(0, 4) : '');
    });
  }
  if (SHIFT) {
    D.days.forEach(function (d) { d.date = shiftIso(d.date); });
    D.gatesOpen = shiftIso(D.gatesOpen);
    D.earlyBirdEnds = shiftIso(D.earlyBirdEnds);
    D.artists.forEach(function (a) { a.bio = shiftText(a.bio); });
    $$('[data-countdown]').forEach(function (el) { el.setAttribute('data-countdown', shiftIso(el.getAttribute('data-countdown'))); });
    var first = D.days[0], last = D.days[D.days.length - 1];
    var dm = function (iso) { return fmtDate(iso, { day: 'numeric', month: 'long' }); };
    var wd = function (iso) { return fmtDate(iso, { weekday: 'long' }); };
    var sameMonth = first.date.slice(0, 7) === last.date.slice(0, 7);
    var range = sameMonth ? dm(first.date) + '–' + fmtDate(last.date, { day: 'numeric' }) : dm(first.date) + ' – ' + dm(last.date);
    var rangeLong = wd(first.date) + ' – ' + wd(last.date) + ', ' + range;
    var EDITION = {
      dates: range + ', ' + EDITION_YEAR,
      'dates-noyear': range,
      'dates-long': rangeLong + ', ' + EDITION_YEAR,
      'dates-long-noyear': rangeLong,
      year: String(EDITION_YEAR),
      'year+1': String(EDITION_YEAR + 1)
    };
    $$('[data-edition]').forEach(function (el) {
      var k = el.getAttribute('data-edition');
      if (Object.prototype.hasOwnProperty.call(EDITION, k)) el.textContent = EDITION[k];
    });
    $$('[data-date]').forEach(function (el) {
      var a = shiftIso(el.getAttribute('data-date')), end = el.getAttribute('data-date-end');
      var opts = el.getAttribute('data-date-format') === 'dm' ? { day: 'numeric', month: 'long' } : { day: 'numeric', month: 'long', year: 'numeric' };
      if (!end) { el.textContent = fmtDate(a, opts); return; }
      var b = shiftIso(end);
      var endYear = el.getAttribute('data-date-format') === 'dm' ? '' : ', ' + b.slice(0, 4);
      el.textContent = (a.slice(0, 7) === b.slice(0, 7) ? fmtDate(a, { day: 'numeric', month: 'long' }) + '–' + fmtDate(b, { day: 'numeric' }) : fmtDate(a, { day: 'numeric', month: 'long' }) + ' – ' + fmtDate(b, { day: 'numeric', month: 'long' })) + endYear;
    });
    $$('[data-day-label]').forEach(function (el) { el.textContent = dayLabel(el.getAttribute('data-day-label')); });
    ['aria-label', 'data-error'].forEach(function (attr) {
      $$('[' + attr + ']').forEach(function (el) { el.setAttribute(attr, shiftText(el.getAttribute(attr))); });
    });
    document.title = shiftText(document.title);
  }
  function minutes(hhmm) { var p = hhmm.split(':'); return Number(p[0]) * 60 + Number(p[1]); }
  function gbp(n) {
    var whole = Math.abs(n % 1) < 0.005;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: D.currency || 'USD', minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(n);
  }
  function dayLabel(id) { var d = days.get(id); if (!d) return ''; return d.label + ', ' + fmtDate(d.date, { day: 'numeric', month: 'long' }); }
  // Times are stored as 24-hour "HH:MM" and shown on the 12-hour clock: "9:15 PM", "9:15–10:45 PM", "11:30 AM–12:30 PM".
  function clockParts(hhmm) {
    var p = hhmm.split(':'), h = Number(p[0]) % 24;
    return { time: (h % 12 || 12) + (p[1] === '00' ? '' : ':' + p[1]), half: h < 12 ? 'AM' : 'PM' };
  }
  function setTime(a) {
    var s = clockParts(a.start), e = clockParts(a.end);
    return s.time + (s.half === e.half ? '' : ' ' + s.half) + '–' + e.time + ' ' + e.half;
  }

  /* ---------------------------------------------------------- toast */
  var toast = $('[data-toast]');
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    // An open <dialog> sits in the top layer: move the toast into it so it stays visible.
    var dlg = document.querySelector('dialog[open]');
    (dlg || document.body).appendChild(toast);
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2600);
  }

  /* ---------------------------------------------------------- header & mobile menu */
  var header = $('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 10 || !menu.hidden); }
  var menuBtn = $('[data-menu-toggle]');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('[data-icon-open]', menuBtn).hidden = open;
    $('[data-icon-close]', menuBtn).hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    header.style.backgroundColor = open ? 'var(--color-cream)' : '';
    onScroll();
    if (open) { var first = $('a', menu); if (first) first.focus(); }
  }
  if (header && menuBtn && menu) {
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) { if (mq.matches && !menu.hidden) setMenu(false); });
  }

  /* ---------------------------------------------------------- scroll reveal */
  var revealIO = null;
  function initReveal(scope) {
    var items = $$('.reveal:not(.is-in)', scope);
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    if (!revealIO) {
      revealIO = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          // Reveal this element and everything above it, so fast jumps never leave gaps.
          var top = entry.target.getBoundingClientRect().top;
          $$('.reveal:not(.is-in)').forEach(function (el) {
            if (el.getBoundingClientRect().top <= top + 1) { el.classList.add('is-in'); revealIO.unobserve(el); }
          });
        });
      }, { rootMargin: '0px 0px -6% 0px' });
    }
    items.forEach(function (el) { revealIO.observe(el); });
  }
  initReveal(document);

  /* ---------------------------------------------------------- countdown */
  var countdown = $('[data-countdown]');
  if (countdown) {
    var target = new Date(countdown.dataset.countdown).getTime();
    var units = {};
    $$('[data-unit]', countdown).forEach(function (el) { units[el.dataset.unit] = el; });
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var timer;
    var tick = function () {
      var diff = Math.max(0, target - now().getTime());
      var s = Math.floor(diff / 1000);
      units.days.textContent = pad(Math.floor(s / 86400));
      units.hours.textContent = pad(Math.floor(s / 3600) % 24);
      units.minutes.textContent = pad(Math.floor(s / 60) % 60);
      units.seconds.textContent = pad(s % 60);
      if (diff === 0) {
        clearInterval(timer);
        var done = $('[data-countdown-done]');
        if (done) { done.classList.remove('hidden'); countdown.hidden = true; }
      }
    };
    timer = setInterval(tick, 1000);
    tick();
  }

  /* ---------------------------------------------------------- count-up numbers */
  var counters = $$('[data-count-to]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        cio.unobserve(entry.target);
        var el = entry.target;
        var end = Number(el.dataset.countTo);
        var start = performance.now();
        var step = function (t) {
          var p = Math.min(1, (t - start) / 1200);
          el.textContent = String(Math.round(end * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------------------------------------------------------- early-bird prices */
  var isEarly = now() < new Date(D.earlyBirdEnds);
  function ticketPrice(t) { return isEarly ? t.early : t.price; }
  $$('[data-price-of]').forEach(function (el) { var t = tickets.get(el.dataset.priceOf); if (t) el.textContent = gbp(ticketPrice(t)); });
  $$('[data-full-of]').forEach(function (el) { var t = tickets.get(el.dataset.fullOf); if (t) { el.textContent = gbp(t.price); el.hidden = !isEarly; } });
  $$('[data-early-only]').forEach(function (el) { if (!isEarly) el.hidden = true; });
  $$('[data-early-hide]').forEach(function (el) { el.hidden = isEarly; });

  /* ---------------------------------------------------------- artwork */
  // Every artist gets generated poster art from art: [motif, background, foreground] in data.js.
  var INK = '#24122e';
  function artSvg(a, cls) {
    var m = a.art || ['sun', '#ffc53d', '#c73a1e'];
    var bg = m[1], fg = m[2], body = '';
    var line = ' stroke="' + INK + '" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"';
    if (m[0] === 'sun') {
      var rays = '';
      for (var i = 0; i < 12; i++) {
        var ang = (i * 30) * Math.PI / 180;
        rays += 'M' + (50 + Math.cos(ang) * 31).toFixed(1) + ' ' + (58 + Math.sin(ang) * 31).toFixed(1) + 'L' + (50 + Math.cos(ang) * 41).toFixed(1) + ' ' + (58 + Math.sin(ang) * 41).toFixed(1);
      }
      body = '<path d="' + rays + '" fill="none" stroke="' + fg + '" stroke-width="4" stroke-linecap="round"/>' +
        '<circle cx="50" cy="58" r="24" fill="' + fg + '"' + line + '/>' +
        '<path d="M0 74h100v26H0Z" fill="' + bg + '"/><path d="M0 74h100M14 82h72M26 90h48"' + line + ' fill="none"/>';
    } else if (m[0] === 'waves') {
      for (var w = 0; w < 5; w++) {
        var y = 30 + w * 14;
        body += '<path d="M-5 ' + y + 'q13-10 26 0t26 0 26 0 26 0 26 0" fill="none" stroke="' + (w % 2 ? INK : fg) + '" stroke-width="' + (w % 2 ? 2.5 : 6) + '" stroke-linecap="round"/>';
      }
      body += '<circle cx="74" cy="18" r="9" fill="' + fg + '"' + line + '/>';
    } else if (m[0] === 'rings') {
      body = '<circle cx="50" cy="50" r="38" fill="' + fg + '"' + line + '/><circle cx="50" cy="50" r="27" fill="' + bg + '"' + line + '/>' +
        '<circle cx="50" cy="50" r="16" fill="' + fg + '"' + line + '/><circle cx="50" cy="50" r="5" fill="' + INK + '"/>';
    } else if (m[0] === 'stripes') {
      for (var s = -100; s < 200; s += 18) body += '<path d="M' + s + ' 110 ' + (s + 110) + ' 0" stroke="' + fg + '" stroke-width="7"/>';
      body += '<circle cx="50" cy="50" r="22" fill="' + bg + '"' + line + '/><circle cx="50" cy="50" r="10" fill="' + fg + '"' + line + '/>';
    } else if (m[0] === 'burst') {
      var pts = [];
      for (var b = 0; b < 24; b++) {
        var r = b % 2 ? 22 : 42, ang2 = (b * 15 - 90) * Math.PI / 180;
        pts.push((50 + Math.cos(ang2) * r).toFixed(1) + ',' + (50 + Math.sin(ang2) * r).toFixed(1));
      }
      body = '<polygon points="' + pts.join(' ') + '" fill="' + fg + '"' + line + '/><circle cx="50" cy="50" r="10" fill="' + bg + '"' + line + '/>';
    } else {
      body = '<circle cx="70" cy="34" r="14" fill="' + fg + '"' + line + '/>' +
        '<path d="M-5 70q25-26 55-4t60-6v45H-5Z" fill="' + fg + '"' + line + '/>' +
        '<path d="M-5 84q30-18 60 0t55-2v25H-5Z" fill="' + INK + '"/>';
    }
    return '<svg class="' + (cls || '') + '" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false"><rect width="100" height="100" fill="' + bg + '"/>' + body + '</svg>';
  }

  var SUN_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true" focusable="false"><circle class="sun-core" cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>';
  var WARN_ICON = '<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3 2 20h20Z"/><path d="M12 10v4M12 17v.5"/></svg>';
  var CLOSE_ICON = '<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg>';

  /* ---------------------------------------------------------- my plan (shared) */
  // The plan is a list of artist ids saved under "solstice-plan". Unknown ids are dropped.
  var PLAN_KEY = 'solstice-plan';
  function readPlan() {
    var raw = store(PLAN_KEY);
    var list = Array.isArray(raw) ? raw : [];
    var clean = list.filter(function (id, i) { return typeof id === 'string' && artists.has(id) && list.indexOf(id) === i; });
    if (raw !== null && (!Array.isArray(raw) || clean.length !== list.length)) store(PLAN_KEY, clean);
    return clean;
  }
  var plan = readPlan();
  function inPlan(id) { return plan.indexOf(id) !== -1; }
  function savePlan() {
    store(PLAN_KEY, plan);
    refreshPlan();
  }
  function togglePlan(id) {
    var a = artists.get(id);
    if (!a) return;
    if (inPlan(id)) { plan = plan.filter(function (x) { return x !== id; }); showToast('Removed ' + a.name + ' from your plan'); }
    else { plan.push(id); showToast('Added ' + a.name + ' to your plan'); }
    savePlan();
  }
  // Pairs of planned sets on the same day whose times overlap: { id: [other ids] }.
  function clashes() {
    var out = {};
    plan.forEach(function (id) { out[id] = []; });
    for (var i = 0; i < plan.length; i++) {
      for (var j = i + 1; j < plan.length; j++) {
        var a = artists.get(plan[i]), b = artists.get(plan[j]);
        if (a.day === b.day && minutes(a.start) < minutes(b.end) && minutes(b.start) < minutes(a.end)) {
          out[a.id].push(b.id); out[b.id].push(a.id);
        }
      }
    }
    return out;
  }
  function syncPlanButtons(scope) {
    $$('[data-plan-toggle]', scope).forEach(function (btn) {
      var a = artists.get(btn.dataset.planToggle);
      if (!a) return;
      var on = inPlan(a.id);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + a.name + (on ? ' from my plan' : ' to my plan'));
      var label = $('[data-plan-label]', btn);
      if (label) label.textContent = on ? 'In my plan' : 'Add to my plan';
    });
  }
  var planListeners = [];
  function refreshPlan() {
    $$('[data-plan-count]').forEach(function (el) { el.textContent = String(plan.length); });
    syncPlanButtons(document);
    planListeners.forEach(function (fn) { fn(); });
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-plan-toggle]');
    if (!btn) return;
    e.preventDefault();
    togglePlan(btn.dataset.planToggle);
  });
  // Keep tabs in sync when the plan changes in another window.
  window.addEventListener('storage', function (e) { if (e.key === PLAN_KEY) { plan = readPlan(); refreshPlan(); } });
  refreshPlan();

  function planButton(a, small) {
    return '<button type="button" class="plan-btn' + (small ? ' plan-btn-sm' : '') + '" data-plan-toggle="' + a.id + '" aria-pressed="false" aria-label="Add ' + esc(a.name) + ' to my plan">' + SUN_ICON + '</button>';
  }
  function stageTag(id) { var s = stages.get(id); return '<span class="tag stage-' + id + '">' + esc(s ? s.name : id) + '</span>'; }
  function genreTag(g) { return '<span class="tag">' + esc(D.genres[g] || g) + '</span>'; }
  function validDay(v) { return days.has(v) ? v : null; }

  /* ---------------------------------------------------------- artist modal (lineup page) */
  var modal = $('[data-artist-modal]');
  var modalOpener = null;
  function openArtist(id, opener) {
    var a = artists.get(id);
    if (!modal || !a) return;
    modalOpener = opener || null;
    var c = clashes()[a.id] || [];
    $('[data-modal-body]', modal).innerHTML =
      '<button type="button" class="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full border-2 border-ink bg-paper hover:bg-sun-soft" data-modal-close aria-label="Close">' + CLOSE_ICON + '</button>' +
      '<div class="grid sm:grid-cols-[minmax(0,15rem)_1fr]">' +
        '<div class="aspect-[16/9] overflow-hidden border-b-[2.5px] border-ink sm:aspect-auto sm:border-r-[2.5px] sm:border-b-0">' + artSvg(a, 'block size-full') + '</div>' +
        '<div class="p-6 sm:p-8">' +
          '<div class="flex flex-wrap gap-2 pr-12">' + stageTag(a.stage) + genreTag(a.genre) + (a.tier === 1 ? '<span class="tag bg-tomato! text-white">Headliner</span>' : '') + '</div>' +
          '<h2 id="artist-modal-name" class="display mt-4 text-[2.6rem]">' + esc(a.name) + '</h2>' +
          '<p class="mt-1 font-semibold text-muted">From ' + esc(a.from) + '</p>' +
          '<p class="mt-5 flex flex-wrap items-center gap-x-2 rounded-xl border-2 border-ink bg-cream px-4 py-3 font-bold"><span>' + esc(dayLabel(a.day)) + '</span><span aria-hidden="true">·</span><span class="tabular-nums">' + setTime(a) + '</span><span aria-hidden="true">·</span><span>' + esc(stages.get(a.stage).name) + '</span></p>' +
          '<p class="mt-5 leading-relaxed">' + esc(a.bio) + '</p>' +
          (c.length ? '<p class="mt-4 flex items-start gap-2 rounded-xl border-2 border-tomato px-3 py-2 text-sm font-bold text-tomato">' + WARN_ICON.replace('size-3.5', 'size-4 mt-0.5 shrink-0') + '<span>Clashes with ' + c.map(function (x) { return esc(artists.get(x).name); }).join(', ') + ' in your plan</span></p>' : '') +
          '<div class="mt-6 flex flex-wrap gap-3">' +
            '<button type="button" class="btn btn-sun" data-plan-toggle="' + a.id + '" aria-pressed="false">' + SUN_ICON.replace('<svg ', '<svg class="size-5" ') + '<span data-plan-label>Add to my plan</span></button>' +
            '<a href="schedule.html?day=' + a.day + '#set-' + a.id + '" class="btn btn-ghost">See in schedule</a>' +
          '</div>' +
        '</div>' +
      '</div>';
    syncPlanButtons(modal);
    if (!modal.open) modal.showModal();
    $('[data-modal-close]', modal).focus();
  }
  if (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target.closest('[data-modal-close]') || e.target === modal) modal.close();
    });
    modal.addEventListener('close', function () { if (modalOpener && document.contains(modalOpener)) modalOpener.focus(); });
    planListeners.push(function () {
      // Refresh the clash note when the plan changes while the modal is open.
      if (modal.open) { var id = $('[data-plan-toggle]', modal).dataset.planToggle; var keep = modalOpener; openArtist(id, keep); $('[data-plan-toggle]', modal).focus(); }
    });
  }

  /* ---------------------------------------------------------- lineup page */
  var lineup = $('[data-lineup]');
  if (lineup) {
    var state = {
      day: validDay(params.get('day')) || 'all',
      stage: stages.has(params.get('stage')) ? params.get('stage') : 'all',
      genre: Object.prototype.hasOwnProperty.call(D.genres, params.get('genre')) ? params.get('genre') : 'all',
      mine: false
    };
    var out = $('[data-lineup-grid]', lineup);
    var count = $('[data-lineup-count]', lineup);
    var empty = $('[data-lineup-empty]', lineup);
    var stageSel = $('#filter-stage', lineup);
    var genreSel = $('#filter-genre', lineup);
    var mineBtn = $('[data-plan-only]', lineup);

    function card(a, i) {
      return '<li class="reveal" style="--d:' + (i % 4) * 50 + 'ms">' +
        '<article class="artist-card poster poster-sm poster-hover relative flex h-full flex-col overflow-hidden" id="artist-' + a.id + '">' +
          '<div class="artist-art">' + artSvg(a) +
            (a.tier === 1 ? '<span class="absolute top-3 left-3 rounded-full border-2 border-ink bg-tomato px-2.5 py-0.5 text-xs font-extrabold tracking-wider text-white uppercase">Headliner</span>' : '') +
          '</div>' +
          '<div class="flex flex-1 flex-col p-4">' +
            '<h3 class="display text-[1.65rem]"><button type="button" class="text-left after:absolute after:inset-0 after:content-[\'\'] hover:text-tomato focus-visible:outline-none" data-artist="' + a.id + '">' + esc(a.name) + '</button></h3>' +
            '<p class="mt-1 text-sm font-bold text-muted">' + esc(days.get(a.day).short) + ' · <span class="tabular-nums">' + a.start + '</span> · ' + esc(stages.get(a.stage).name) + '</p>' +
            '<div class="mt-auto flex items-end justify-between gap-2 pt-4">' + genreTag(a.genre) +
              '<span class="relative z-10">' + planButton(a, true) + '</span></div>' +
          '</div>' +
        '</article></li>';
    }
    function render() {
      var list = D.artists.filter(function (a) {
        return (state.day === 'all' || a.day === state.day) && (state.stage === 'all' || a.stage === state.stage) &&
          (state.genre === 'all' || a.genre === state.genre) && (!state.mine || inPlan(a.id));
      });
      var html = '';
      D.days.forEach(function (d) {
        var group = list.filter(function (a) { return a.day === d.id; })
          .sort(function (x, y) { return x.tier - y.tier || minutes(y.start) - minutes(x.start); });
        if (!group.length) return;
        html += '<section class="mt-12 first:mt-0" aria-labelledby="day-' + d.id + '">' +
          '<div class="flex items-baseline justify-between gap-4 border-b-[2.5px] border-ink pb-3">' +
            '<h2 id="day-' + d.id + '" class="display text-4xl sm:text-5xl">' + esc(dayLabel(d.id)) + '</h2>' +
            '<p class="text-sm font-bold text-muted">' + group.length + (group.length === 1 ? ' act' : ' acts') + '</p></div>' +
          '<ul class="mt-6 grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">' + group.map(card).join('') + '</ul></section>';
      });
      out.innerHTML = html;
      empty.hidden = list.length > 0;
      count.textContent = list.length === 1 ? '1 act' : list.length + ' acts';
      syncPlanButtons(out);
      initReveal(out);
      $$('[data-day-filter]', lineup).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.dayFilter === state.day)); });
      stageSel.value = state.stage;
      genreSel.value = state.genre;
      mineBtn.setAttribute('aria-pressed', String(state.mine));
      // Keep the filters in the URL so a filtered lineup can be shared or bookmarked.
      var q = new URLSearchParams();
      if (state.day !== 'all') q.set('day', state.day);
      if (state.stage !== 'all') q.set('stage', state.stage);
      if (state.genre !== 'all') q.set('genre', state.genre);
      var qs = q.toString();
      history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash);
    }
    $$('[data-day-filter]', lineup).forEach(function (b) {
      b.addEventListener('click', function () { state.day = b.dataset.dayFilter; render(); });
    });
    stageSel.addEventListener('change', function () { state.stage = stageSel.value; render(); });
    genreSel.addEventListener('change', function () { state.genre = genreSel.value; render(); });
    mineBtn.addEventListener('click', function () { state.mine = !state.mine; render(); });
    $$('[data-clear-filters]', lineup).forEach(function (b) {
      b.addEventListener('click', function () { state = { day: 'all', stage: 'all', genre: 'all', mine: false }; render(); });
    });
    out.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-artist]');
      if (btn) openArtist(btn.dataset.artist, btn);
    });
    planListeners.push(function () { if (state.mine) render(); });
    render();
    // ?artist=<id> opens that artist straight away (links from the schedule use it).
    var deep = params.get('artist');
    if (deep && artists.has(deep)) {
      var opener = $('[data-artist="' + deep + '"]', out);
      openArtist(deep, opener);
    }
  }

  /* ---------------------------------------------------------- schedule page */
  var tt = $('[data-schedule]');
  if (tt) {
    var tabs = $$('[role="tab"]', tt);
    var panel = $('#tt-panel', tt);
    var viewBtns = $$('[data-view]', tt);
    var onlyMine = $('[data-plan-only]', tt);
    var sState = {
      day: validDay(params.get('day')) || null,
      view: window.matchMedia('(min-width: 768px)').matches ? 'grid' : 'list',
      mine: false
    };
    if (!sState.day) {
      // During the festival, open today's tab; otherwise Friday.
      var today = now().toLocaleDateString('en-CA', { timeZone: 'America/Detroit' });
      sState.day = (D.days.filter(function (d) { return d.date === today; })[0] || D.days[0]).id;
    }

    var STAGE_COLORS = { sunhouse: 'var(--color-sun)', meadow: 'var(--color-leaf)', orchard: 'var(--color-tangerine)', firefly: 'var(--color-sky)' };
    function setsFor(day) { return D.artists.filter(function (a) { return a.day === day; }); }
    function clashNote(id, c) {
      var others = c[id] || [];
      if (!others.length) return '';
      return '<span class="clash-badge" title="Clashes with ' + esc(others.map(function (x) { return artists.get(x).name; }).join(', ')) + '">' + WARN_ICON + ' Clash</span>';
    }
    function renderGrid(day, c) {
      var sets = setsFor(day);
      var from = Math.floor(Math.min.apply(null, sets.map(function (a) { return minutes(a.start); })) / 60);
      var to = Math.ceil(Math.max.apply(null, sets.map(function (a) { return minutes(a.end); })) / 60);
      var hours = to - from;
      var hourLabels = '';
      for (var h = from; h <= to; h++) hourLabels += '<span class="tt-hour" style="top:calc(var(--hour) * ' + (h - from) + ')">' + (h % 12 || 12) + (h % 24 < 12 ? ' AM' : ' PM') + '</span>';
      var head = '<div class="grid grid-cols-[4rem_repeat(4,minmax(10.5rem,1fr))] border-b-[2.5px] border-ink bg-cream pb-3" aria-hidden="true"><span></span>' +
        D.stages.map(function (s) { return '<span class="mx-1.5 rounded-full border-2 border-ink px-3 py-1.5 text-center text-sm font-extrabold stage-' + s.id + '">' + esc(s.name) + '</span>'; }).join('') + '</div>';
      var cols = D.stages.map(function (s) {
        var items = sets.filter(function (a) { return a.stage === s.id; }).sort(function (x, y) { return minutes(x.start) - minutes(y.start); }).map(function (a) {
          var top = (minutes(a.start) - from * 60) / 60, len = (minutes(a.end) - minutes(a.start)) / 60;
          var cls = 'tt-set' + (inPlan(a.id) ? ' is-planned' : '') + ((c[a.id] || []).length ? ' is-clash' : '') + (sState.mine && !inPlan(a.id) ? ' is-dim' : '');
          return '<li class="' + cls + '" id="set-' + a.id + '" style="--stage:' + STAGE_COLORS[a.stage] + ';top:calc(var(--hour) * ' + top + ' + 3px);height:calc(var(--hour) * ' + len + ' - 6px)">' +
            '<p class="pr-9 text-xs font-extrabold tabular-nums">' + setTime(a) + '</p>' +
            '<a href="lineup.html?artist=' + a.id + '" class="pr-9 font-display text-[1.05rem] leading-tight font-extrabold [font-stretch:85%] hover:underline">' + esc(a.name) + '</a>' +
            '<p class="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted">' + esc(D.genres[a.genre]) + ' ' + clashNote(a.id, c) + '</p>' +
            '<span class="absolute top-1.5 right-1.5">' + planButton(a, true) + '</span></li>';
        }).join('');
        return '<section class="tt-col" style="height:calc(var(--hour) * ' + hours + ')" aria-label="' + esc(s.name) + '"><h3 class="sr-only">' + esc(s.name) + '</h3><ul>' + items + '</ul></section>';
      }).join('');
      return '<div class="relative -mx-5 overflow-x-auto px-5 pb-4 sm:mx-0 sm:px-0"><div class="min-w-[50rem]">' + head +
        '<div class="tt mt-4"><div class="tt-hours" aria-hidden="true">' + hourLabels + '</div>' + cols + '</div></div></div>';
    }
    function renderList(day, c) {
      var sets = setsFor(day).filter(function (a) { return !sState.mine || inPlan(a.id); })
        .sort(function (x, y) { return minutes(x.start) - minutes(y.start) || D.stages.indexOf(stages.get(x.stage)) - D.stages.indexOf(stages.get(y.stage)); });
      if (!sets.length) return '<p class="poster poster-sm p-6 font-semibold">Nothing in your plan for ' + esc(days.get(day).label) + ' yet. Turn off “My plan only” to see every set.</p>';
      return '<ol class="grid gap-3">' + sets.map(function (a) {
        var cls = 'poster poster-sm flex items-center gap-4 p-4 sm:p-5' + (inPlan(a.id) ? ' bg-sun!' : '') + ((c[a.id] || []).length ? ' border-tomato! shadow-[4px_4px_0_#c73a1e]!' : '');
        return '<li class="' + cls + '" id="set-' + a.id + '">' +
          '<p class="w-[4.6rem] shrink-0 font-display text-lg leading-tight font-extrabold tabular-nums [font-stretch:80%]">' + a.start + '<span class="block text-sm font-bold text-muted">to ' + a.end + '</span></p>' +
          '<div class="min-w-0 flex-1"><a href="lineup.html?artist=' + a.id + '" class="font-display text-xl leading-tight font-extrabold [font-stretch:85%] hover:underline">' + esc(a.name) + '</a>' +
          '<p class="mt-1.5 flex flex-wrap items-center gap-1.5">' + stageTag(a.stage) + '<span class="text-xs font-semibold text-muted">' + esc(D.genres[a.genre]) + '</span>' + clashNote(a.id, c) + '</p></div>' +
          planButton(a) + '</li>';
      }).join('') + '</ol>';
    }
    function renderPanel() {
      var c = clashes();
      panel.innerHTML = sState.view === 'grid' ? renderGrid(sState.day, c) : renderList(sState.day, c);
      panel.setAttribute('aria-labelledby', 'tab-' + sState.day);
      syncPlanButtons(panel);
    }
    function render() {
      tabs.forEach(function (t) {
        var on = t.dataset.day === sState.day;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
      });
      viewBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === sState.view)); });
      onlyMine.setAttribute('aria-pressed', String(sState.mine));
      renderPanel();
      var q = new URLSearchParams(location.search);
      q.set('day', sState.day);
      q.delete('now');
      var keepNow = params.get('now') ? '&now=' + encodeURIComponent(params.get('now')) : '';
      history.replaceState(null, '', location.pathname + '?' + q.toString() + keepNow + location.hash);
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { sState.day = t.dataset.day; render(); });
      t.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') next = tabs[0];
        else if (e.key === 'End') next = tabs[tabs.length - 1];
        if (!next) return;
        e.preventDefault();
        sState.day = next.dataset.day;
        render();
        next.focus();
      });
    });
    viewBtns.forEach(function (b) { b.addEventListener('click', function () { sState.view = b.dataset.view; render(); }); });
    onlyMine.addEventListener('click', function () { sState.mine = !sState.mine; render(); });

    /* My plan panel */
    var planBox = $('[data-my-plan]');
    var exportBtn = $('[data-export-ics]');
    var clearBtn = $('[data-clear-plan]');
    var clearTimer;
    function renderMyPlan() {
      var c = clashes();
      var total = 0;
      Object.keys(c).forEach(function (k) { total += c[k].length; });
      total = total / 2;
      $('[data-plan-summary]').textContent = plan.length
        ? plan.length + (plan.length === 1 ? ' set' : ' sets') + ' saved' + (total ? ', ' + total + (total === 1 ? ' clash' : ' clashes') : ', no clashes')
        : 'No sets saved yet';
      var html = '';
      D.days.forEach(function (d) {
        var mine = plan.map(function (id) { return artists.get(id); }).filter(function (a) { return a.day === d.id; })
          .sort(function (x, y) { return minutes(x.start) - minutes(y.start); });
        if (!mine.length) return;
        html += '<div><h3 class="display text-2xl">' + esc(dayLabel(d.id)) + '</h3><ul class="mt-3 grid gap-2.5">' + mine.map(function (a) {
          var others = c[a.id];
          return '<li class="relative rounded-2xl border-2 bg-paper p-3 pr-14 ' + (others.length ? 'border-tomato' : 'border-ink') + '">' +
            '<div class="min-w-0"><p class="text-sm font-extrabold tabular-nums">' + setTime(a) + ' · <span class="font-semibold text-muted">' + esc(stages.get(a.stage).name) + '</span></p><p class="mt-0.5 font-bold leading-snug">' + esc(a.name) + '</p>' +
            (others.length ? '<p class="mt-1 flex items-start gap-1.5 text-sm font-bold text-tomato">' + WARN_ICON.replace('size-3.5', 'size-4 mt-0.5 shrink-0') + '<span>Clashes with ' + others.map(function (x) { var o = artists.get(x); return esc(o.name) + ' (' + setTime(o) + ')'; }).join(', ') + '</span></p>' : '') +
            '</div><span class="absolute top-2.5 right-2.5">' + planButton(a, true) + '</span></li>';
        }).join('') + '</ul></div>';
      });
      planBox.innerHTML = html || '<p class="rounded-2xl border-2 border-dashed border-ink/40 p-6 text-center font-semibold text-muted">Tap the sun on any set to add it here. Your plan is saved on this device.</p>';
      syncPlanButtons(planBox);
      exportBtn.disabled = !plan.length;
      clearBtn.disabled = !plan.length;
    }
    function icsText() {
      var stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
      var utc = function (date, time) { return festivalTime(date + 'T' + time).toISOString().replace(/[-:]/g, '').replace(/\.\d+/, ''); };
      var escText = function (s) { return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n'); };
      // Lines longer than 75 characters are folded (RFC 5545).
      var fold = function (line) { var out = []; while (line.length > 74) { out.push(line.slice(0, 74)); line = ' ' + line.slice(74); } out.push(line); return out.join('\r\n'); };
      var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Solstice Festival//My plan//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', 'X-WR-CALNAME:Solstice ' + EDITION_YEAR + ' – my plan'];
      plan.map(function (id) { return artists.get(id); })
        .sort(function (x, y) { return (x.day + x.start).localeCompare(y.day + y.start); })
        .forEach(function (a) {
          var d = days.get(a.day).date;
          lines.push('BEGIN:VEVENT', 'UID:' + a.id + '-' + EDITION_YEAR + '@solstice.example', 'DTSTAMP:' + stamp,
            'DTSTART:' + utc(d, a.start), 'DTEND:' + utc(d, a.end),
            'SUMMARY:' + escText(a.name + ' at Solstice'),
            'LOCATION:' + escText(stages.get(a.stage).name + ', Birch Bluff Farm, Traverse City'),
            'DESCRIPTION:' + escText(D.genres[a.genre] + '. ' + a.bio), 'END:VEVENT');
        });
      lines.push('END:VCALENDAR');
      return lines.map(fold).join('\r\n') + '\r\n';
    }
    exportBtn.addEventListener('click', function () {
      if (!plan.length) return;
      var url = URL.createObjectURL(new Blob([icsText()], { type: 'text/calendar;charset=utf-8' }));
      var link = document.createElement('a');
      link.href = url;
      link.download = 'solstice-' + EDITION_YEAR + '-my-plan.ics';
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      showToast('Calendar file downloaded');
    });
    // Clearing takes two clicks so a stray tap can't wipe the plan.
    clearBtn.addEventListener('click', function () {
      if (clearBtn.dataset.armed) {
        plan = [];
        savePlan();
        delete clearBtn.dataset.armed;
        clearBtn.textContent = 'Clear plan';
        showToast('Your plan is empty');
        return;
      }
      clearBtn.dataset.armed = '1';
      clearBtn.textContent = 'Tap again to clear';
      clearTimeout(clearTimer);
      clearTimer = setTimeout(function () { delete clearBtn.dataset.armed; clearBtn.textContent = 'Clear plan'; }, 3000);
    });
    planListeners.push(function () { renderPanel(); renderMyPlan(); });
    render();
    renderMyPlan();
    // Links like schedule.html?day=sat#set-marlowe-grey: scroll to (and flash) that set.
    if (location.hash.indexOf('#set-') === 0) {
      var hit = document.getElementById(location.hash.slice(1));
      if (hit) {
        hit.scrollIntoView({ block: 'center', inline: 'center' });
        hit.classList.add('ring-4', 'ring-tomato');
        setTimeout(function () { hit.classList.remove('ring-4', 'ring-tomato'); }, 2400);
      }
    }
  }

  /* ---------------------------------------------------------- tickets page */
  var shop = $('[data-tickets]');
  if (shop) {
    var CART_KEY = 'solstice-cart';
    var cart = { tickets: {}, addons: {} };
    var saved = store(CART_KEY);
    var max = D.maxPerType || 10;
    var clampQty = function (n) { n = Math.floor(Number(n)); return isFinite(n) ? Math.max(0, Math.min(max, n)) : 0; };
    if (saved && typeof saved === 'object') {
      ['tickets', 'addons'].forEach(function (kind) {
        var src = saved[kind] && typeof saved[kind] === 'object' ? saved[kind] : {};
        var known = kind === 'tickets' ? tickets : addons;
        Object.keys(src).forEach(function (id) { if (known.has(id)) { var q = clampQty(src[id]); if (q) cart[kind][id] = q; } });
      });
    }
    var summaryList = $('[data-summary-lines]', shop);
    var totalEl = $('[data-summary-total]', shop);
    var groupHint = $('[data-group-hint]', shop);
    var warnEl = $('[data-cart-warning]', shop);
    var startBtn = $('[data-checkout-start]', shop);
    var lastTotal = 0;

    function totals() {
      var count = 0, ticketSum = 0, fullSum = 0, addonSum = 0, lines = [];
      D.tickets.forEach(function (t) {
        var q = cart.tickets[t.id] || 0;
        if (!q) return;
        count += q; ticketSum += q * ticketPrice(t); fullSum += q * t.price;
        lines.push([q + ' × ' + t.name, q * ticketPrice(t)]);
      });
      D.addons.forEach(function (a) {
        var q = cart.addons[a.id] || 0;
        if (!q) return;
        addonSum += q * a.price;
        lines.push([q + ' × ' + a.name, q * a.price]);
      });
      var discount = count >= D.groupSize ? Math.round(ticketSum * D.groupDiscount * 100) / 100 : 0;
      var fees = Math.round(count * D.fee * 100) / 100;
      return { count: count, lines: lines, ticketSum: ticketSum, saving: fullSum - ticketSum, addonSum: addonSum, discount: discount, fees: fees,
        total: Math.round((ticketSum - discount + addonSum + fees) * 100) / 100 };
    }
    function problem() {
      var camping = (cart.tickets.camping || 0) + (cart.tickets.family || 0);
      if ((cart.addons.campervan || 0) > camping) return 'Each RV site needs a Weekend + camping or Family weekend ticket.';
      if ((cart.addons.belltent || 0) && !camping) return 'Bell tents are in the campsite: add a Weekend + camping or Family weekend ticket.';
      return '';
    }
    function renderCart() {
      $$('[data-qty]', shop).forEach(function (row) {
        var kind = row.dataset.kind, id = row.dataset.qty;
        var item = (kind === 'tickets' ? tickets : addons).get(id);
        var q = cart[kind][id] || 0;
        $('output', row).textContent = String(q);
        $('[data-step="-1"]', row).disabled = q <= 0;
        $('[data-step="1"]', row).disabled = q >= max;
        row.closest('[data-row]').classList.toggle('bg-sun-soft', q > 0);
        $('output', row).setAttribute('aria-label', q + ' × ' + item.name);
      });
      var t = totals();
      var rows = t.lines.map(function (l) { return '<div class="flex justify-between gap-4"><dt>' + esc(l[0]) + '</dt><dd class="font-bold tabular-nums">' + gbp(l[1]) + '</dd></div>'; });
      if (t.count && t.discount) rows.push('<div class="flex justify-between gap-4 text-sea"><dt class="font-bold">Group discount (' + Math.round(D.groupDiscount * 100) + '%)</dt><dd class="font-bold whitespace-nowrap tabular-nums">−' + gbp(t.discount) + '</dd></div>');
      if (t.count) rows.push('<div class="flex justify-between gap-4 text-muted"><dt>Service fee (' + gbp(D.fee) + ' × ' + t.count + ')</dt><dd class="font-bold tabular-nums">' + gbp(t.fees) + '</dd></div>');
      summaryList.innerHTML = rows.length ? rows.join('') : '<div class="text-muted"><dt class="font-semibold">Your cart is empty</dt><dd>Choose some tickets to get started.</dd></div>';
      totalEl.textContent = gbp(t.total);
      lastTotal = t.total;
      var need = D.groupSize - t.count;
      groupHint.innerHTML = !t.count ? 'Buy ' + D.groupSize + ' or more tickets in one order and save ' + Math.round(D.groupDiscount * 100) + '% on tickets.'
        : need > 0 ? 'Add <strong>' + need + ' more ' + (need === 1 ? 'ticket' : 'tickets') + '</strong> to unlock ' + Math.round(D.groupDiscount * 100) + '% off for your group.'
        : '<strong>Group discount unlocked.</strong> You’re saving ' + gbp(t.discount) + ' on tickets.';
      var early = $('[data-early-saving]', shop);
      if (early) { early.hidden = !(isEarly && t.saving > 0); early.textContent = 'Early-bird prices save you ' + gbp(t.saving); }
      var msg = problem();
      warnEl.hidden = !msg;
      warnEl.textContent = msg;
      startBtn.disabled = !t.count || !!msg;
      store(CART_KEY, t.count || t.addonSum ? cart : null);
    }
    shop.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-step]');
      if (!btn) return;
      var row = btn.closest('[data-qty]');
      var kind = row.dataset.kind, id = row.dataset.qty;
      var q = clampQty((cart[kind][id] || 0) + Number(btn.dataset.step));
      if (q) cart[kind][id] = q; else delete cart[kind][id];
      renderCart();
    });

    /* Checkout: step 1 basket, step 2 details, step 3 confirmation. Nothing is charged or sent until you
       connect a ticketing provider (see the comment in tickets.html). */
    var steps = $$('[data-step-indicator]', shop);
    var stepBasket = $('[data-step-basket]', shop);
    var stepDetails = $('[data-checkout]', shop);
    var stepDone = $('[data-confirmation]', shop);
    function goStep(n) {
      steps.forEach(function (s) {
        var i = Number(s.dataset.stepIndicator);
        s.classList.toggle('is-done', i < n);
        if (i === n) s.setAttribute('aria-current', 'step'); else s.removeAttribute('aria-current');
      });
      stepBasket.hidden = n !== 1;
      stepDetails.hidden = n !== 2;
      stepDone.hidden = n !== 3;
      $$('[data-basket-only]', shop).forEach(function (el) { el.hidden = n !== 1; });
      $$('[data-hide-when-done]', shop).forEach(function (el) { el.hidden = n === 3; });
      // With the summary hidden, the confirmation takes the full width (see data-[step=done] in tickets.html).
      var layout = $('[data-checkout-layout]', shop);
      if (layout) { if (n === 3) layout.dataset.step = 'done'; else delete layout.dataset.step; }
      var focusEl = n === 1 ? $('h2', stepBasket) : n === 2 ? $('h2', stepDetails) : stepDone;
      focusEl.setAttribute('tabindex', '-1');
      focusEl.focus({ preventScroll: true });
      ($('[data-steps]', shop) || focusEl).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
    startBtn.addEventListener('click', function () { if (!startBtn.disabled) goStep(2); });
    $('[data-checkout-back]', shop).addEventListener('click', function () { goStep(1); });
    stepDetails.addEventListener('solstice:valid', function () {
      $('[data-order-ref]', stepDone).textContent = makeRef();
      $('[data-order-total]', stepDone).textContent = gbp(lastTotal);
      cart = { tickets: {}, addons: {} };
      renderCart();
      goStep(3);
    });
    $('[data-checkout-restart]', shop).addEventListener('click', function () { goStep(1); });
    renderCart();
  }

  /* ---------------------------------------------------------- food village page */
  var food = $('[data-food]');
  if (food) {
    var fState = { diets: [], kind: 'all', q: '' };
    var vGrid = $('[data-vendor-grid]', food);
    var vCount = $('[data-vendor-count]', food);
    var vEmpty = $('[data-vendor-empty]', food);
    var pinLayer = $('[data-pins]', food);
    var search = $('[data-food-search]', food);

    // Draw one numbered pin per vendor on the village map.
    pinLayer.innerHTML = D.vendors.map(function (v, i) {
      var x = v.pin[0] * 10, y = v.pin[1] * 6.2;
      var fill = v.kind === 'drink' ? '#8fd0ee' : v.kind === 'sweet' ? '#ffb3a1' : '#ffc53d';
      return '<g class="map-pin" data-pin="' + v.id + '" role="button" tabindex="0" aria-label="' + (i + 1) + ': ' + esc(v.name) + '" transform="translate(' + x + ' ' + y + ')">' +
        '<rect x="-30" y="2" width="60" height="30" rx="4" fill="#fffbf2" stroke="#24122e" stroke-width="3"/>' +
        '<path d="M-34 2h68v9c-6 7-11 7-14 0-3 7-11 7-14 0-3 7-10 7-13 0-3 7-11 7-14 0-3 7-10 7-13 0Z" fill="#c73a1e" stroke="#24122e" stroke-width="2.5" stroke-linejoin="round"/>' +
        '<circle class="pin-ring" cy="-14" r="27" fill="none" stroke="transparent"/><circle class="pin-bg" cy="-14" r="21" fill="' + fill + '" stroke="#24122e" stroke-width="3"/>' +
        '<text y="-6.5" text-anchor="middle" font-family="DM Sans, Arial, sans-serif" font-size="21" font-weight="800" fill="#24122e">' + (i + 1) + '</text></g>';
    }).join('');

    vGrid.innerHTML = D.vendors.map(function (v, i) {
      return '<li class="reveal" data-vendor-item="' + v.id + '" style="--d:' + (i % 3) * 50 + 'ms">' +
        '<article class="vendor poster poster-sm flex h-full flex-col p-5" id="vendor-' + v.id + '">' +
          '<div class="flex items-start gap-3">' +
            '<span class="grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink font-extrabold ' + (v.kind === 'drink' ? 'bg-sky' : v.kind === 'sweet' ? 'bg-peach' : 'bg-sun') + '" aria-hidden="true">' + (i + 1) + '</span>' +
            '<div class="min-w-0"><h3 class="display text-[1.6rem]">' + esc(v.name) + '</h3><p class="text-sm font-bold text-muted">' + esc(v.cuisine) + ' · ' + esc(v.price) + '</p></div>' +
          '</div>' +
          '<p class="mt-3 font-medium">' + esc(v.dish) + '</p>' +
          '<ul class="mt-4 flex flex-wrap gap-1.5" aria-label="Dietary options">' + v.diets.map(function (d) {
            return '<li class="tag diet-' + d + '">' + esc(D.diets[d]) + '</li>';
          }).join('') + '</ul>' +
          '<button type="button" class="mt-auto inline-flex items-center gap-1.5 self-start pt-4 text-sm font-extrabold underline decoration-2 underline-offset-4 hover:text-tomato" data-show-pin="' + v.id + '">Show on map</button>' +
        '</article></li>';
    }).join('');
    initReveal(vGrid);

    function matches(v) {
      if (fState.kind !== 'all' && v.kind !== fState.kind) return false;
      for (var i = 0; i < fState.diets.length; i++) if (v.diets.indexOf(fState.diets[i]) === -1) return false;
      if (fState.q) {
        var hay = (v.name + ' ' + v.cuisine + ' ' + v.dish).toLowerCase();
        return fState.q.split(/\s+/).every(function (w) { return hay.indexOf(w) !== -1; });
      }
      return true;
    }
    function renderFood() {
      var shown = 0;
      D.vendors.forEach(function (v) {
        var ok = matches(v);
        if (ok) shown++;
        var li = $('[data-vendor-item="' + v.id + '"]', vGrid);
        li.hidden = !ok;
        if (ok) li.classList.add('is-in');
        var pin = $('[data-pin="' + v.id + '"]', pinLayer);
        pin.classList.toggle('is-dim', !ok);
        pin.setAttribute('tabindex', ok ? '0' : '-1');
        pin.setAttribute('aria-hidden', String(!ok));
      });
      vCount.textContent = shown === D.vendors.length ? 'All ' + shown + ' vendors' : shown + ' of ' + D.vendors.length + ' vendors';
      vEmpty.hidden = shown > 0;
      $$('[data-diet]', food).forEach(function (b) { b.setAttribute('aria-pressed', String(fState.diets.indexOf(b.dataset.diet) !== -1)); });
      $$('[data-kind]', food).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.kind === fState.kind)); });
    }
    function activate(id, fromMap) {
      $$('.vendor.is-active', vGrid).forEach(function (el) { el.classList.remove('is-active'); });
      $$('.map-pin.is-active', pinLayer).forEach(function (el) { el.classList.remove('is-active'); });
      var card = $('#vendor-' + id);
      var pin = $('[data-pin="' + id + '"]', pinLayer);
      if (!card || !pin) return;
      card.classList.add('is-active');
      pin.classList.add('is-active');
      pinLayer.appendChild(pin); // draw the active pin on top
      var v = D.vendors.filter(function (x) { return x.id === id; })[0];
      $('[data-map-caption]', food).textContent = (D.vendors.indexOf(v) + 1) + '. ' + v.name + ': ' + v.cuisine;
      if (fromMap) {
        card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        var b = $('[data-show-pin]', card); if (b) b.focus({ preventScroll: true });
      } else {
        $('[data-food-map]', food).scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      }
    }
    $$('[data-diet]', food).forEach(function (b) {
      b.addEventListener('click', function () {
        var d = b.dataset.diet, i = fState.diets.indexOf(d);
        if (i === -1) fState.diets.push(d); else fState.diets.splice(i, 1);
        renderFood();
      });
    });
    $$('[data-kind]', food).forEach(function (b) { b.addEventListener('click', function () { fState.kind = b.dataset.kind; renderFood(); }); });
    search.addEventListener('input', function () { fState.q = search.value.trim().toLowerCase(); renderFood(); });
    $$('[data-food-reset]', food).forEach(function (b) {
      b.addEventListener('click', function () { fState = { diets: [], kind: 'all', q: '' }; search.value = ''; renderFood(); });
    });
    vGrid.addEventListener('click', function (e) { var b = e.target.closest('[data-show-pin]'); if (b) activate(b.dataset.showPin, false); });
    pinLayer.addEventListener('click', function (e) { var p = e.target.closest('[data-pin]'); if (p) activate(p.dataset.pin, true); });
    pinLayer.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var p = e.target.closest('[data-pin]');
      if (p) { e.preventDefault(); activate(p.dataset.pin, true); }
    });
    // ?diet=vegan (or several: ?diet=vegan,gluten-free) preselects dietary filters.
    (params.get('diet') || '').split(',').forEach(function (d) { if (D.diets[d] && fState.diets.indexOf(d) === -1) fState.diets.push(d); });
    renderFood();
  }

  /* ---------------------------------------------------------- visitor info: map layers + FAQ search */
  var layerBtns = $$('[data-layer]');
  if (layerBtns.length) {
    var setLayer = function (name, on) {
      $$('[data-layer-group="' + name + '"]').forEach(function (g) { g.classList.toggle('is-off', !on); g.setAttribute('aria-hidden', String(!on)); });
      $$('[data-layer="' + name + '"]').forEach(function (b) { b.setAttribute('aria-pressed', String(on)); });
    };
    layerBtns.forEach(function (b) {
      b.addEventListener('click', function () { setLayer(b.dataset.layer, b.getAttribute('aria-pressed') !== 'true'); });
    });
    var allBtn = $('[data-layers-all]');
    if (allBtn) allBtn.addEventListener('click', function () { layerBtns.forEach(function (b) { setLayer(b.dataset.layer, true); }); });
  }

  var faqSearch = $('[data-faq-search]');
  if (faqSearch) {
    var faqs = $$('[data-faq]');
    var faqCount = $('[data-faq-count]');
    var faqEmpty = $('[data-faq-empty]');
    var original = new Map();
    faqs.forEach(function (f) { original.set(f, { q: $('[data-faq-q]', f).innerHTML, a: $('[data-faq-a]', f).innerHTML }); });
    // Wrap search words in <mark>, touching text nodes only.
    function highlight(el, words) {
      if (!words.length) return;
      var re = new RegExp('(' + words.map(function (w) { return w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }).join('|') + ')', 'gi');
      var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      var nodes = [];
      while (walker.nextNode()) nodes.push(walker.currentNode);
      nodes.forEach(function (n) {
        if (!re.test(n.nodeValue)) return;
        re.lastIndex = 0;
        var span = document.createElement('span');
        span.innerHTML = esc(n.nodeValue).replace(re, '<mark>$1</mark>');
        n.parentNode.replaceChild(span, n);
      });
    }
    var runFaq = function () {
      var q = faqSearch.value.trim().toLowerCase();
      var words = q ? q.split(/\s+/) : [];
      var shown = 0;
      faqs.forEach(function (f) {
        var o = original.get(f);
        var qEl = $('[data-faq-q]', f), aEl = $('[data-faq-a]', f);
        qEl.innerHTML = o.q; aEl.innerHTML = o.a;
        var text = (qEl.textContent + ' ' + aEl.textContent).toLowerCase();
        var ok = words.every(function (w) { return text.indexOf(w) !== -1; });
        f.hidden = !ok;
        if (ok) { shown++; highlight(qEl, words); highlight(aEl, words); }
        if (words.length) f.open = ok; else if (f.dataset.wasSearched) f.open = false;
        if (words.length) f.dataset.wasSearched = '1'; else delete f.dataset.wasSearched;
      });
      $$('[data-faq-group]').forEach(function (g) { g.hidden = !$$('[data-faq]:not([hidden])', g).length; });
      faqCount.textContent = words.length ? shown + (shown === 1 ? ' question matches' : ' questions match') + ' “' + faqSearch.value.trim() + '”' : faqs.length + ' questions';
      faqEmpty.hidden = shown > 0;
    };
    faqSearch.addEventListener('input', runFaq);
    $$('[data-faq-clear]').forEach(function (b) { b.addEventListener('click', function () { faqSearch.value = ''; runFaq(); faqSearch.focus(); }); });
    runFaq();
  }

  /* ---------------------------------------------------------- contact: topic routing */
  var contact = $('[data-contact]');
  if (contact) {
    var ROUTES = {
      volunteer: { team: 'the volunteer team', email: 'volunteers@solstice.example', time: 'within 5 business days' },
      trader: { team: 'the vendor team', email: 'vendors@solstice.example', time: 'within 10 business days' },
      press: { team: 'the press office', email: 'press@solstice.example', time: 'within 2 business days' },
      general: { team: 'the visitor help team', email: 'hello@solstice.example', time: 'within 2 business days' }
    };
    var radios = $$('input[name="topic"]', contact);
    var route = $('[data-route]', contact);
    function setTopic(topic) {
      $$('[data-topic-panel]', contact).forEach(function (p) {
        var on = p.dataset.topicPanel === topic;
        p.hidden = !on;
        // Hidden fields are disabled so they are neither validated nor submitted.
        $$('input, select, textarea', p).forEach(function (f) { f.disabled = !on; });
      });
      var r = ROUTES[topic];
      route.hidden = !r;
      if (r) route.innerHTML = 'Your message goes to <strong>' + r.team + '</strong> (' + r.email + '). We usually reply ' + r.time + '.';
    }
    radios.forEach(function (r) { r.addEventListener('change', function () { if (r.checked) setTopic(r.value); }); });
    var pre = params.get('topic');
    if (pre && ROUTES[pre]) { radios.forEach(function (r) { r.checked = r.value === pre; }); }
    var checked = radios.filter(function (r) { return r.checked; })[0];
    setTopic(checked ? checked.value : null);
    var cForm = $('form', contact);
    cForm.addEventListener('solstice:valid', function (e) {
      var data = e.detail.data;
      var r = ROUTES[data.get('topic')] || ROUTES.general;
      var first = String(data.get('name') || '').trim().split(/\s+/)[0];
      $('[data-success-detail]', contact).innerHTML = 'Thanks' + (first ? ' ' + esc(first) : '') + '! Your message has reached ' + r.team + ', and we usually reply ' + r.time + '. Your reference is <strong data-ref>' + makeRef() + '</strong>.';
    });
    cForm.addEventListener('solstice:reset', function () { setTopic(null); });
  }

  /* ---------------------------------------------------------- forms */
  // Any <form data-validate> gets inline validation. On success it fires "solstice:valid"
  // with the FormData, then shows its [data-success] element (if it has one).
  $$('form[data-validate]').forEach(function (form) {
    var name = form.dataset.form || 'form';
    function fields() {
      return $$('input, select, textarea', form).filter(function (f) {
        return !f.disabled && f.type !== 'hidden' && !f.closest('[data-group-required]') && (f.required || f.type === 'email' || f.type === 'url' || f.minLength > 0 || f.pattern);
      });
    }
    function groups() { return $$('[data-group-required]', form).filter(function (g) { return !g.closest('[hidden]') && $$('input:not(:disabled)', g).length; }); }
    function message(f) {
      if (f.type === 'checkbox' && f.required && !f.checked) return f.dataset.error || 'Please check this box to continue.';
      if (f.validity.valueMissing) return f.tagName === 'SELECT' ? 'Please choose an option.' : 'Please fill in this field.';
      if (f.validity.typeMismatch) return f.type === 'url' ? 'Please enter a full web address, starting with https://' : 'Please enter a valid email address, like name@example.com.';
      if (f.validity.tooShort) return 'Please write at least ' + f.minLength + ' characters (you have ' + f.value.length + ').';
      if (f.validity.patternMismatch) return f.dataset.error || 'Please check the format.';
      return '';
    }
    function showError(host, key, msg, describe) {
      var id = name + '-' + key + '-error';
      var err = document.getElementById(id);
      var base = (describe.dataset.describedby || describe.getAttribute('aria-describedby') || '').replace(id, '').trim();
      if (!describe.dataset.describedby && base) describe.dataset.describedby = base;
      if (msg) {
        if (!err) {
          err = document.createElement('p');
          err.className = 'field-error';
          err.id = id;
          host.insertAdjacentElement('afterend', err);
        }
        err.textContent = msg;
        describe.setAttribute('aria-describedby', (base ? base + ' ' : '') + id);
      } else {
        if (err) err.remove();
        if (base) describe.setAttribute('aria-describedby', base); else describe.removeAttribute('aria-describedby');
      }
    }
    function check(f) {
      var msg = message(f);
      var host = f.type === 'checkbox' ? f.closest('label') || f : f;
      showError(host, f.name || f.id, msg, f);
      if (msg) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid');
      return !msg;
    }
    function checkGroup(g) {
      var ok = $$('input:not(:disabled)', g).some(function (i) { return i.checked; });
      var last = g.lastElementChild;
      if (last && last.classList.contains('field-error')) last = last.previousElementSibling;
      showError(last, 'group-' + ($('input', g).name), ok ? '' : g.dataset.groupRequired, g);
      if (ok) g.removeAttribute('aria-invalid'); else g.setAttribute('aria-invalid', 'true');
      return ok;
    }
    // Clears the error of every field or group that is no longer validated (hidden or disabled).
    function clearHidden() {
      $$('[aria-invalid="true"]', form).forEach(function (el) {
        if (el.matches('[data-group-required]')) {
          if (groups().indexOf(el) !== -1) return;
          showError(el, 'group-' + $('input', el).name, '', el);
        } else {
          if (fields().indexOf(el) !== -1) return;
          showError(el, el.name || el.id, '', el);
        }
        el.removeAttribute('aria-invalid');
      });
    }
    form.addEventListener('focusout', function (e) {
      var f = e.target;
      if (fields().indexOf(f) !== -1 && (f.value || f.getAttribute('aria-invalid'))) check(f);
    });
    form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid')) check(e.target); });
    form.addEventListener('change', function (e) {
      var f = e.target;
      var g = f.closest('[data-group-required]');
      if (g && g.getAttribute('aria-invalid')) checkGroup(g);
      else if (fields().indexOf(f) !== -1 && f.getAttribute('aria-invalid')) check(f);
      // A change can hide and disable other fields (the contact form's topic does): drop their
      // errors, so none are left behind. They come back if those fields are shown and submitted again.
      clearHidden();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = fields().map(check).concat(groups().map(checkGroup)).every(Boolean);
      if (!ok) {
        var bad = $('[aria-invalid="true"]', form);
        if (bad) (bad.matches('fieldset') ? $('input', bad) : bad).focus();
        return;
      }
      // To send for real, POST the data to your form service here, for example:
      // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      form.dispatchEvent(new CustomEvent('solstice:valid', { detail: { data: new FormData(form) } }));
      var success = $('[data-success]', form);
      if (success) {
        var wrap = $('[data-form-fields]', form);
        if (wrap) wrap.hidden = true;
        success.hidden = false;
        success.focus();
      }
      form.reset();
    });
    $$('[data-form-reset]', form).forEach(function (b) {
      b.addEventListener('click', function () {
        var wrap = $('[data-form-fields]', form);
        if (wrap) wrap.hidden = false;
        $('[data-success]', form).hidden = true;
        form.dispatchEvent(new CustomEvent('solstice:reset'));
        var first = $('input:not([type="hidden"]), select, textarea', form);
        if (first) first.focus();
      });
    });
  });
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

  // Elements marked data-back-to-top-hide (e.g. a sticky order summary) hide the
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
