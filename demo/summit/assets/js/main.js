/* Summit — site behavior. Vanilla JavaScript, no dependencies.
   Content (speakers, sessions, ticket prices) lives in assets/js/data.js. */
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

  var DATA = window.SUMMIT || { speakers: [], sessions: [], days: [], tracks: {}, tickets: [] };
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Look speakers up by their own id only, so ?id=constructor or __proto__ finds nothing.
  var speakerMap = new Map();
  DATA.speakers.forEach(function (s) { speakerMap.set(s.id, s); });
  function speakerById(id) { return speakerMap.get(id); }

  // A short reference for confirmations, like SU-7K2Q (no 0/O or 1/I to misread).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  function esc(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function store(key, value) {
    try {
      if (value === undefined) return JSON.parse(safeStorage.getItem(key));
      safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) { return null; }
  }
  // Event times are written in Bellevue local time (Pacific daylight time, UTC-7).
  function eventTime(local) { return new Date(local + ':00-07:00'); }
  // Add ?now=2027-04-15T10:45 to any page to preview the "live" schedule state.
  function now() {
    var p = new URLSearchParams(location.search).get('now');
    return p ? eventTime(p) : new Date();
  }

  /* ---------------------------------------------------------- demo dates
     The conference is written for the days in DATA.days. While DATA.keepDemoCurrent is true and that
     edition is over, every date moves on to the same week of a later year, by whole weeks so weekdays never
     change (Wed, April 14, 2027 becomes Wed, April 12, 2028), and the edition year follows. The page text is
     updated through data-edition, data-date and data-day-label (see DOCS.md, "Demo dates"). */
  function dayNum(iso) { return Math.round(Date.parse(iso.slice(0, 10) + 'T00:00:00Z') / 86400000); }
  function isoOf(day) { return new Date(day * 86400000).toISOString().slice(0, 10); }
  var BASE_YEAR = DATA.days.length ? +DATA.days[0].date.slice(0, 4) : 0;
  var SHIFT = (function () {
    if (!DATA.keepDemoCurrent || !DATA.days.length) return 0;
    var first = DATA.days[0].date, last = DATA.days[DATA.days.length - 1].date;
    var today = dayNum(new Date(now().getTime() - 7 * 3600 * 1000).toISOString());
    var shift = 0;
    for (var y = 1; dayNum(last) + shift < today && y < 100; y++) {
      shift = Math.round((dayNum((BASE_YEAR + y) + first.slice(4)) - dayNum(first)) / 7) * 7;
    }
    return shift;
  })();
  // "2027-04-14T09:30" (or any ISO string) moved on by SHIFT days; the time part is kept.
  function shiftIso(iso) { return SHIFT ? isoOf(dayNum(iso) + SHIFT) + iso.slice(10) : iso; }
  function utcDate(iso) { return new Date(iso.slice(0, 10) + 'T12:00:00Z'); }
  function fmtDate(iso, opts) { return utcDate(iso).toLocaleDateString('en-US', Object.assign({ timeZone: 'UTC' }, opts)); }
  // Session times are 24-hour in the data and shown on a 12-hour clock: "9:30 – 10:15 AM", "11:40 AM – 12:20 PM".
  function clockOf(hm) { var h = +hm.slice(0, 2); return (h % 12 || 12) + ':' + hm.slice(3); }
  function periodOf(hm) { return +hm.slice(0, 2) < 12 ? 'AM' : 'PM'; }
  function timeStart(x) { return clockOf(x.start) + (periodOf(x.start) === periodOf(x.end) ? '' : '\u00a0' + periodOf(x.start)); }
  function timeEnd(x) { return clockOf(x.end) + '\u00a0' + periodOf(x.end); }
  var EDITION_YEAR = BASE_YEAR + (SHIFT ? +shiftIso(DATA.days[0].date).slice(0, 4) - BASE_YEAR : 0);
  if (SHIFT) {
    var yearRe = new RegExp('\\b' + BASE_YEAR + '\\b', 'g');
    DATA.days.forEach(function (d) { d.date = shiftIso(d.date); d.label = fmtDate(d.date, { weekday: 'short', day: 'numeric', month: 'short' }); });
    DATA.earlyBirdEnds = shiftIso(DATA.earlyBirdEnds);
    DATA.sessions.forEach(function (s) { s.title = s.title.replace(yearRe, String(EDITION_YEAR)); });
    $$('[data-countdown]').forEach(function (el) { el.setAttribute('data-countdown', shiftIso(el.getAttribute('data-countdown'))); });
    $$('[data-start]').forEach(function (el) { el.setAttribute('data-start', shiftIso(el.getAttribute('data-start'))); });
    $$('[data-end]').forEach(function (el) { el.setAttribute('data-end', shiftIso(el.getAttribute('data-end'))); });
    $$('[data-day-label]').forEach(function (el) {
      DATA.days.forEach(function (d) { if (d.id === el.getAttribute('data-day-label')) el.textContent = d.label; });
    });
    var FORMATS = { dmy: { day: 'numeric', month: 'long', year: 'numeric' }, dm: { day: 'numeric', month: 'long' }, dmon: { day: 'numeric', month: 'short' } };
    $$('[data-date]').forEach(function (el) {
      var f = el.getAttribute('data-date-format');
      el.textContent = fmtDate(shiftIso(el.getAttribute('data-date')), FORMATS[f === 'dm' || f === 'dmon' ? f : 'dmy']);
    });
    var first = DATA.days[0].date, last = DATA.days[DATA.days.length - 1].date;
    var dates = first.slice(0, 7) === last.slice(0, 7)
      ? fmtDate(first, { month: 'long', day: 'numeric' }) + '–' + fmtDate(last, { day: 'numeric' }) + ', ' + fmtDate(last, { year: 'numeric' })
      : fmtDate(first, { day: 'numeric', month: 'long' }) + ' – ' + fmtDate(last, { day: 'numeric', month: 'long', year: 'numeric' });
    var EDITION = {
      dates: dates,
      year: String(EDITION_YEAR),
      'year-1': String(EDITION_YEAR - 1),
      'year+1': String(EDITION_YEAR + 1),
      yy: '’' + String(EDITION_YEAR).slice(2),
      'yy-plain': String(EDITION_YEAR).slice(2)
    };
    $$('[data-edition]').forEach(function (el) {
      var k = el.getAttribute('data-edition');
      if (Object.prototype.hasOwnProperty.call(EDITION, k)) el.textContent = EDITION[k];
    });
    $$('[aria-label]').forEach(function (el) { el.setAttribute('aria-label', el.getAttribute('aria-label').replace(yearRe, String(EDITION_YEAR))); });
    document.title = document.title.replace(yearRe, String(EDITION_YEAR));
  }
  // Early-bird-only text (the home page pill, the tickets intro) disappears once early-bird pricing ends.
  if (now() >= new Date(DATA.earlyBirdEnds)) $$('[data-early-only]').forEach(function (el) { el.remove(); });

  /* ---------------------------------------------------------- toast */
  var toast = $('[data-toast]');
  var toastTimer;
  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2400);
  }

  /* ---------------------------------------------------------- header & menu */
  var header = $('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = $('[data-menu-toggle]');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('[data-icon-open]', menuBtn).hidden = open;
    $('[data-icon-close]', menuBtn).hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
    header.classList.toggle('is-scrolled', open || window.scrollY > 10);
    header.style.backgroundColor = open ? 'var(--color-night)' : '';
    if (open) { var first = $('a', menu); if (first) first.focus(); }
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });
  }

  /* ---------------------------------------------------------- scroll reveal */
  function initReveal(scope) {
    var items = $$('.reveal:not(.is-in)', scope);
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Reveal this element and everything above it, so fast jumps never leave gaps.
        var top = entry.target.getBoundingClientRect().top;
        $$('.reveal:not(.is-in)').forEach(function (el) {
          if (el.getBoundingClientRect().top <= top + 1) { el.classList.add('is-in'); io.unobserve(el); }
        });
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }
  initReveal(document);

  /* ---------------------------------------------------------- countdown */
  var countdown = $('[data-countdown]');
  if (countdown) {
    var target = new Date(countdown.dataset.countdown).getTime();
    var units = {};
    $$('[data-unit]', countdown).forEach(function (el) { units[el.dataset.unit] = el; });
    var pad = function (n, len) { return String(n).padStart(len || 2, '0'); };
    var tick = function () {
      var diff = Math.max(0, target - now().getTime());
      var s = Math.floor(diff / 1000);
      units.days.textContent = pad(Math.floor(s / 86400), 2);
      units.hours.textContent = pad(Math.floor(s / 3600) % 24);
      units.minutes.textContent = pad(Math.floor(s / 60) % 60);
      units.seconds.textContent = pad(s % 60);
      if (diff === 0) clearInterval(timer);
    };
    var timer = setInterval(tick, 1000);
    tick();
  }

  /* ---------------------------------------------------------- count-up stats */
  var counters = $$('[data-count-to]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        cio.unobserve(entry.target);
        var el = entry.target;
        var end = Number(el.dataset.countTo);
        var suffix = el.dataset.suffix || '';
        var start = performance.now();
        var step = function (t) {
          var p = Math.min(1, (t - start) / 1400);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(end * eased).toLocaleString('en-US') + suffix;
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------------------------------------------------------- shared markup */
  function trackTag(track) {
    return '<span class="track-tag tag-' + track + '">' + esc(DATA.tracks[track] || track) + '</span>';
  }
  function dayOf(session) {
    for (var i = 0; i < DATA.days.length; i++) if (DATA.days[i].id === session.day) return DATA.days[i];
  }
  function talksFor(id) {
    return DATA.sessions.filter(function (x) { return x.speakers.indexOf(id) !== -1; });
  }
  function talkList(id) {
    return talksFor(id).map(function (x) {
      return '<li class="rounded-2xl border border-edge p-4">' +
        '<div class="flex flex-wrap items-center gap-2 text-sm text-haze">' + trackTag(x.track) +
        '<span>' + esc(dayOf(x).label) + ' · ' + timeStart(x) + '–' + timeEnd(x) + ' · ' + esc(x.room) + '</span></div>' +
        '<p class="mt-2 font-display text-lg font-bold tracking-tight">' + esc(x.title) + '</p></li>';
    }).join('');
  }

  // A session as a card, as on the schedule and the first speaker's page (without the star).
  var PIN_ICON = '<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12Z"/><circle cx="12" cy="9" r="2.5"/></svg>';
  var GLOBE_ICON = '<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>';
  var KIND_TAGS = {
    keynote: '<span class="track-tag bg-lime text-night">Keynote</span>',
    workshop: '<span class="track-tag border border-edge text-haze">Workshop</span>',
    panel: '<span class="track-tag border border-edge text-haze">Panel</span>'
  };
  function sessionCard(x) {
    var isBreak = x.kind === 'break';
    var date = dayOf(x).date;
    var tags = isBreak ? '' : x.kind === 'social' ? '<span class="track-tag bg-flame/20 text-flame">Social</span>' :
      trackTag(x.track) + (KIND_TAGS[x.kind] || '') + (x.level ? '<span class="text-xs text-haze">' + esc(x.level) + '</span>' : '');
    var people = x.speakers.map(speakerById).filter(Boolean).map(function (p) {
      return '<a href="speaker.html?id=' + p.id + '" class="inline-flex items-center gap-2 rounded-full border border-edge py-1 pr-3 pl-1 text-sm hover:border-haze">' +
        '<img src="assets/img/speakers/' + p.id + '.svg" alt="" width="28" height="28" class="size-7 rounded-full">' + esc(p.name) + '</a>';
    }).join('');
    return '<li class="session ' + (isBreak ? 'session-break ' : '') + 'grid gap-4 p-5 sm:grid-cols-[10rem_1fr_auto] sm:p-6" data-session="' + x.id + '" data-track="' + x.track +
        '" data-day="' + x.day + '" data-start="' + date + 'T' + x.start + '" data-end="' + date + 'T' + x.end + '">' +
      '<div class="flex items-center gap-3 sm:block">' +
        '<p class="font-display text-lg font-bold tabular-nums">' + timeStart(x) + '<span class="text-haze"> – ' + timeEnd(x) + '</span></p>' +
        '<p class="flex items-center gap-1.5 text-sm text-haze sm:mt-1">' + PIN_ICON + ' ' + esc(x.room) + '</p>' +
        '<p class="live-badge mt-2 hidden text-xs font-bold tracking-wider uppercase"></p>' +
      '</div>' +
      '<div class="min-w-0">' +
        '<div class="flex flex-wrap items-center gap-2">' + tags + '</div>' +
        '<h3 class="mt-2 font-display text-xl font-bold tracking-tight' + (isBreak ? ' text-haze' : '') + '">' + esc(x.title) + '</h3>' +
        (people ? '<div class="mt-3 flex flex-wrap gap-2">' + people + '</div>' : '') +
      '</div>' +
    '</li>';
  }

  /* ---------------------------------------------------------- speakers page: filter + modal */
  var grid = $('[data-speaker-grid]');
  if (grid) {
    var filterBtns = $$('[data-filter]');
    var countLabel = $('[data-count-label]');
    filterBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.dataset.filter;
        filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var shown = 0;
        $$('li[data-track]', grid).forEach(function (li) {
          var match = f === 'all' || li.dataset.track === f;
          li.hidden = !match;
          if (match) { shown++; li.classList.add('is-in'); }
        });
        countLabel.textContent = shown + (shown === 1 ? ' speaker' : ' speakers');
      });
    });

    var modal = $('[data-speaker-modal]');
    var modalBody = $('[data-modal-body]', modal);
    var opener = null;
    function openSpeaker(id) {
      var s = speakerById(id);
      if (!s) return;
      modalBody.innerHTML =
        '<div class="relative">' +
          '<button type="button" class="absolute top-4 right-4 z-10 grid size-11 place-items-center rounded-full bg-night/70 backdrop-blur hover:bg-night" data-modal-close aria-label="Close">' +
            '<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18"/></svg></button>' +
          '<div class="grid sm:grid-cols-[240px_1fr]">' +
            '<img src="assets/img/speakers/' + s.id + '.svg" alt="" width="400" height="400" class="aspect-square w-full sm:h-full sm:object-cover">' +
            '<div class="p-7 sm:p-8">' + trackTag(s.track) +
              '<h2 id="modal-name" class="mt-4 font-display text-3xl font-bold tracking-tight">' + esc(s.name) + '</h2>' +
              '<p class="mt-1 text-haze">' + esc(s.role) + ', ' + esc(s.company) + ' · ' + esc(s.city) + '</p>' +
              '<p class="mt-5 leading-relaxed">' + esc(s.bio) + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="border-t border-edge p-7 sm:p-8">' +
            '<h3 class="font-display text-sm font-bold tracking-widest text-haze uppercase">Sessions</h3>' +
            '<ul class="mt-4 grid gap-3">' + talkList(s.id) + '</ul>' +
            '<a href="speaker.html?id=' + s.id + '" class="btn btn-ghost mt-6">Full profile</a>' +
          '</div>' +
        '</div>';
      modal.showModal();
      $('[data-modal-close]', modal).focus();
    }
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-speaker]');
      if (!btn) return;
      opener = btn;
      openSpeaker(btn.dataset.speaker);
    });
    modal.addEventListener('click', function (e) {
      // Close on the close button or a click on the backdrop (outside the dialog box).
      if (e.target.closest('[data-modal-close]') || e.target === modal) modal.close();
    });
    modal.addEventListener('close', function () { if (opener) opener.focus(); });
  }

  /* ---------------------------------------------------------- single speaker page */
  var profile = $('[data-profile]');
  if (profile) {
    // Ids are matched case-insensitively (?id=Mei-Tanaka works like ?id=mei-tanaka).
    var id = (new URLSearchParams(location.search).get('id') || '').toLowerCase();
    var s = speakerById(id);
    // The page is written with the first speaker; other speakers are filled in the same way.
    if (s && s.id !== DATA.speakers[0].id) {
      profile.innerHTML =
        '<div class="grid gap-12 lg:grid-cols-[minmax(0,420px)_1fr]">' +
          '<div class="reveal"><img src="assets/img/speakers/' + s.id + '.svg" alt="" width="400" height="400" class="aspect-square w-full rounded-[2rem] border border-edge" data-profile-img></div>' +
          '<div class="min-w-0">' +
            '<div class="reveal">' + trackTag(s.track) + '</div>' +
            '<h1 class="display reveal mt-5 text-[clamp(3rem,7vw,5.5rem)]" data-profile-name>' + esc(s.name) + '</h1>' +
            '<p class="reveal mt-4 text-xl text-haze">' + esc(s.role) + ' at <span class="text-ink">' + esc(s.company) + '</span> · ' + esc(s.city) + '</p>' +
            '<p class="reveal mt-8 max-w-2xl text-lg leading-relaxed">' + esc(s.bio) + '</p>' +
            '<ul class="reveal mt-8 flex flex-wrap gap-3"><li><a href="#" class="pill hover:text-ink">@' + esc(s.twitter) + '</a></li>' +
            '<li><a href="#" class="pill hover:text-ink">' + GLOBE_ICON + ' ' + esc(s.site) + '</a></li></ul>' +
            '<h2 class="reveal mt-14 font-display text-2xl font-bold tracking-tight">Sessions at Summit</h2>' +
            '<ol class="mt-5 grid gap-3">' + talksFor(s.id).map(sessionCard).join('') + '</ol>' +
          '</div>' +
        '</div>';
      document.title = s.name + ' — Speaker at Summit ' + EDITION_YEAR;
      initReveal(profile);
    }
    // "More speakers": show four others, never the current one.
    var more = $('[data-more-speakers]');
    var current = s ? s.id : DATA.speakers[0].id;
    if (more) {
      more.innerHTML = DATA.speakers.filter(function (x) { return x.id !== current; }).slice(0, 4).map(function (x) {
        return '<li><a href="speaker.html?id=' + x.id + '" class="group card card-hover block p-3">' +
          '<div class="relative aspect-square overflow-hidden rounded-[1.1rem]"><img src="assets/img/speakers/' + x.id + '.svg" alt="" width="400" height="400" loading="lazy" class="size-full object-cover transition-transform duration-700 group-hover:scale-105">' +
          '<span class="on-image absolute top-3 left-3">' + trackTag(x.track) + '</span></div>' +
          '<div class="px-1 pt-4 pb-1"><h3 class="font-display text-xl font-bold tracking-tight">' + esc(x.name) + '</h3>' +
          '<p class="mt-0.5 text-sm text-haze">' + esc(x.role) + ', ' + esc(x.company) + '</p></div></a></li>';
      }).join('');
    }
  }

  /* ---------------------------------------------------------- schedule */
  var tabs = $$('[data-day-tab]');
  if (tabs.length) {
    var STAR_KEY = 'summit-2027-stars';
    // Keep only known session ids, repairing corrupt or tampered storage.
    var rawStars = null;
    try { rawStars = safeStorage.getItem(STAR_KEY); } catch (e) {}
    var storedStars = store(STAR_KEY);
    var stars = (Array.isArray(storedStars) ? storedStars : []).filter(function (id, i, all) {
      return typeof id === 'string' && DATA.sessions.some(function (x) { return x.id === id; }) && all.indexOf(id) === i;
    });
    if (rawStars !== null && rawStars !== JSON.stringify(stars)) store(STAR_KEY, stars);
    var activeTrack = 'all';
    var activeDay = tabs[0].dataset.dayTab;
    var mineList = $('[data-mine-list]');
    var mineEmpty = $('[data-mine-empty]');
    var starCount = $('[data-star-count]');
    var filterEmpty = $('[data-filter-empty]');

    // Open the day the event is currently on (or the day in the URL hash).
    // "Today" is the event-local (UTC-7) date, so late-evening visits open the right day.
    var hashDay = location.hash.replace('#', '');
    var today = new Date(now().getTime() - 7 * 3600 * 1000).toISOString().slice(0, 10);
    DATA.days.forEach(function (d) { if (d.date === today) activeDay = d.id; });
    if (tabs.some(function (t) { return t.dataset.dayTab === hashDay; })) activeDay = hashDay;

    function selectTab(id, focus) {
      activeDay = id;
      tabs.forEach(function (t) {
        var on = t.dataset.dayTab === id;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      $$('[data-day-panel]').forEach(function (p) { p.hidden = p.dataset.dayPanel !== id; });
      if (id === 'mine') renderMine();
      applyTrack();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () {
        selectTab(t.dataset.dayTab);
        history.replaceState(null, '', '#' + t.dataset.dayTab);
      });
      t.addEventListener('keydown', function (e) {
        var next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
        if (next === undefined) return;
        e.preventDefault();
        var day = tabs[(next + tabs.length) % tabs.length].dataset.dayTab;
        selectTab(day, true);
        // The URL keeps the chosen day, as with a click (so a reload or shared link opens it).
        history.replaceState(null, '', '#' + day);
      });
    });

    $$('[data-track-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        activeTrack = btn.dataset.trackFilter;
        $$('[data-track-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        applyTrack();
      });
    });
    function applyTrack() {
      var panel = $('[data-day-panel="' + activeDay + '"]');
      var visible = 0;
      $$('[data-session]', panel).forEach(function (li) {
        // Breaks and socials stay visible so the day still reads as a timeline.
        var show = activeTrack === 'all' || li.dataset.track === activeTrack || li.dataset.track === 'general';
        li.hidden = !show;
        if (show && li.dataset.track !== 'general') visible++;
      });
      filterEmpty.hidden = activeDay === 'mine' || visible > 0;
    }

    function syncStars() {
      $$('[data-star]').forEach(function (btn) {
        var on = stars.indexOf(btn.dataset.star) !== -1;
        btn.setAttribute('aria-pressed', String(on));
        // The label says what a press will do: add the session, or remove it once it's starred.
        var title = $('h3', btn.closest('[data-session]')).textContent.trim();
        btn.setAttribute('aria-label', (on ? 'Remove “' + title + '” from my schedule' : 'Add “' + title + '” to my schedule'));
      });
      starCount.textContent = stars.length;
    }
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-star]');
      if (!btn) return;
      var id = btn.dataset.star;
      var i = stars.indexOf(id);
      if (i === -1) { stars.push(id); showToast('Added to my schedule'); }
      else { stars.splice(i, 1); showToast('Removed from my schedule'); }
      store(STAR_KEY, stars);
      syncStars();
      if (activeDay === 'mine') renderMine();
    });

    function renderMine() {
      var picked = DATA.sessions.filter(function (x) { return stars.indexOf(x.id) !== -1; });
      mineEmpty.hidden = picked.length > 0;
      mineList.innerHTML = DATA.days.map(function (d) {
        var items = picked.filter(function (x) { return x.day === d.id; });
        if (!items.length) return '';
        return '<h3 class="mt-8 mb-3 font-display text-sm font-bold tracking-widest text-haze uppercase first:mt-0">' + esc(d.label) + ' · ' + esc(d.title) + '</h3>' +
          '<ol class="grid gap-3">' + items.map(function (x) {
            return document.querySelector('[data-day-panel="' + d.id + '"] [data-session="' + x.id + '"]').outerHTML;
          }).join('') + '</ol>';
      }).join('');
      $$('[data-session]', mineList).forEach(function (li) { li.hidden = false; });
      syncStars();
      markLive();
    }

    // Highlight the session that is on now, and the next one, during the event.
    function markLive() {
      var t = now().getTime();
      var nextStart = Infinity;
      var anyLive = false;
      var all = $$('[data-session]');
      all.forEach(function (li) {
        var start = eventTime(li.dataset.start).getTime();
        if (start > t && start < nextStart) nextStart = start;
      });
      all.forEach(function (li) {
        var start = eventTime(li.dataset.start).getTime();
        var end = eventTime(li.dataset.end).getTime();
        var live = t >= start && t < end;
        var next = start === nextStart && nextStart - t < 3 * 3600 * 1000;
        li.classList.toggle('is-now', live);
        li.classList.toggle('is-next', next && !live);
        var badge = $('.live-badge', li);
        badge.classList.toggle('hidden', !live && !next);
        badge.className = badge.className.replace(/ ?text-(lime|sky)/g, '') + (live ? ' text-lime' : ' text-sky');
        badge.textContent = live ? '● On now' : next ? 'Up next' : '';
        if (live) anyLive = true;
      });
      $('[data-live-note]').classList.toggle('hidden', !anyLive);
      $('[data-live-note]').classList.toggle('flex', anyLive);
    }

    syncStars();
    selectTab(activeDay);
    markLive();
    setInterval(markLive, 60 * 1000);
  }

  /* ---------------------------------------------------------- tickets */
  var ticketCards = $$('[data-ticket]');
  if (ticketCards.length) {
    var early = now() < new Date(DATA.earlyBirdEnds);
    var team = DATA.teamDiscount;
    var qty = {};
    var euro = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
    // Prices come from DATA.tickets (assets/js/data.js), matched by each card's data-ticket id.
    var TICKETS = new Map();
    (DATA.tickets || []).forEach(function (t) { TICKETS.set(t.id, t); });

    ticketCards = ticketCards.filter(function (card) {
      if (TICKETS.has(card.dataset.ticket)) return true;
      card.hidden = true; // no price for this id in DATA.tickets
      return false;
    });
    ticketCards.forEach(function (card) {
      var id = card.dataset.ticket;
      var ticket = TICKETS.get(id);
      qty[id] = 0;
      var unit = early ? ticket.early : ticket.price;
      card.dataset.unit = unit;
      $('[data-price-now]', card).textContent = euro(unit);
      var wasEl = $('[data-price-was]', card);
      if (wasEl) wasEl.textContent = euro(ticket.price);
      if (early && ticket.early >= ticket.price) {
        if (wasEl) wasEl.remove();
        var sameBadge = $('[data-early-badge]', card); if (sameBadge) sameBadge.remove();
      }
      if (!early) {
        var was = $('[data-price-was]', card); if (was) was.remove();
        var badge = $('[data-early-badge]', card); if (badge) badge.remove();
      }
      $$('[data-step]', card).forEach(function (btn) {
        btn.addEventListener('click', function () {
          qty[id] = Math.min(20, Math.max(0, qty[id] + Number(btn.dataset.step)));
          updateOrder();
        });
      });
    });

    var lines = $('[data-summary-lines]');
    var checkoutBtn = $('[data-checkout-btn]');
    var checkout = $('[data-checkout]');
    var lastTotal = 0;

    function updateOrder() {
      var count = 0;
      var subtotal = 0;
      var html = '';
      ticketCards.forEach(function (card) {
        var id = card.dataset.ticket;
        var n = qty[id];
        $('[data-qty]', card).textContent = n;
        $('[data-step="-1"]', card).disabled = n === 0;
        card.classList.toggle('ring-2', n > 0);
        card.classList.toggle('ring-lime', n > 0);
        if (!n) return;
        var line = n * Number(card.dataset.unit);
        count += n;
        subtotal += line;
        var name = $('h3', card).textContent;
        html += '<li class="flex justify-between gap-4"><span>' + n + ' × ' + esc(name) + '</span><span class="tabular-nums">' + euro(line) + '</span></li>';
      });
      var discount = count >= team.minTickets ? subtotal * team.percent / 100 : 0;
      lastTotal = subtotal - discount;
      lines.innerHTML = html;
      $('[data-summary-empty]').hidden = count > 0;
      $('[data-subtotal]').textContent = euro(subtotal);
      $('[data-discount]').textContent = '−' + euro(discount);
      $('[data-discount-row]').hidden = !discount;
      $('[data-total]').textContent = euro(lastTotal);
      var left = team.minTickets - count;
      $('[data-team-hint]').hidden = left <= 0 || count === 0;
      $('[data-team-left]').textContent = String(left);
      checkoutBtn.setAttribute('aria-disabled', String(count === 0));
      checkoutBtn.classList.toggle('opacity-50', count === 0);
      checkoutBtn.classList.toggle('pointer-events-none', count === 0);
    }
    checkoutBtn.addEventListener('click', function (e) {
      e.preventDefault();
      if (checkoutBtn.getAttribute('aria-disabled') === 'true') return;
      checkout.hidden = false;
      initReveal(checkout);
      checkout.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      $('#co-first').focus({ preventScroll: true });
    });
    updateOrder();

    document.addEventListener('summit:submitted', function (e) {
      if (e.detail.form !== 'checkout') return;
      checkout.hidden = true;
      var conf = $('[data-confirmation]');
      conf.hidden = false;
      $('[data-confirm-ref]', conf).textContent = makeRef('SU');
      $('[data-confirm-total]', conf).textContent = 'Order total: ' + euro(lastTotal);
      conf.focus();
      conf.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
  }

  /* ---------------------------------------------------------- forms */
  $$('form[data-validate]').forEach(function (form) {
    var fields = $$('input, select, textarea', form).filter(function (f) {
      return f.required || f.type === 'email' || f.minLength > 0;
    });
    function message(f) {
      if (f.type === 'checkbox' && f.required && !f.checked) return 'Please accept to continue.';
      if (f.validity.valueMissing) return f.tagName === 'SELECT' ? 'Please choose an option.' : 'Please fill in this field.';
      if (f.validity.typeMismatch) return 'Please enter a valid email address.';
      if (f.validity.tooShort) return 'Please write at least ' + f.minLength + ' characters.';
      return '';
    }
    function check(f) {
      var msg = message(f);
      var host = f.type === 'checkbox' ? f.closest('label') : f;
      var err = form.querySelector('[data-error-for="' + f.name + '"]');
      if (msg) {
        if (!err) {
          err = document.createElement('p');
          err.className = 'field-error';
          err.id = form.dataset.form + '-' + f.name + '-error';
          err.dataset.errorFor = f.name;
          host.insertAdjacentElement('afterend', err);
        }
        err.textContent = msg;
        f.setAttribute('aria-invalid', 'true');
        f.setAttribute('aria-describedby', err.id);
      } else {
        if (err) err.remove();
        f.removeAttribute('aria-invalid');
        f.removeAttribute('aria-describedby');
      }
      return !msg;
    }
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value || f.getAttribute('aria-invalid')) check(f); });
      f.addEventListener(f.type === 'checkbox' || f.tagName === 'SELECT' ? 'change' : 'input', function () {
        if (f.getAttribute('aria-invalid')) check(f);
      });
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = fields.map(check).every(Boolean);
      if (!ok) {
        var bad = $('[aria-invalid="true"]', form);
        if (bad) bad.focus();
        return;
      }
      // To send for real, POST new FormData(form) to your form or ticketing provider here, e.g.
      // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      var success = $('[data-success]', form);
      if (success) {
        $$('[data-ref]', success).forEach(function (el) { el.textContent = makeRef('SU'); });
        success.classList.remove('hidden');
      }
      form.reset();
      document.dispatchEvent(new CustomEvent('summit:submitted', { detail: { form: form.dataset.form } }));
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
