/* Vows — all interactive behavior. Vanilla JavaScript, no dependencies.
   Content (events, guest list, registry, gallery) lives in assets/js/data.js. */
(function () {
  'use strict';

  var V = window.VOWS || {};
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  // A short reference for confirmations, like AT-7K2Q (no 0/O or 1/I to misread).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

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

  /* Safe localStorage access: private mode and full storage just fall back to memory. */
  var store = {
    // Unreadable values (not JSON) are removed so the page heals itself.
    get: function (key) {
      var raw = null;
      try { raw = safeStorage.getItem(key); } catch (e) { return null; }
      if (raw == null) return null;
      try { return JSON.parse(raw); } catch (e) { this.remove(key); return null; }
    },
    set: function (key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ } },
    remove: function (key) { try { safeStorage.removeItem(key); } catch (e) { /* ignore */ } }
  };

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

  /* ---------- Header & mobile menu ---------- */
  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 12); }
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
    if (header) header.classList.toggle('is-scrolled', open || window.scrollY > 12);
  }
  if (menuBtn) {
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
  (function () {
    var items = $$('.reveal');
    if (!items.length) return;
    function show(el) { el.classList.add('is-in'); }
    if (reduceMotion.matches || !('IntersectionObserver' in window)) { items.forEach(show); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    items.forEach(function (el) { io.observe(el); });
    var frame = 0;
    window.addEventListener('scroll', function () {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(function () {
        var limit = window.innerHeight * 0.94;
        $$('.reveal:not(.is-in)').forEach(function (el) { if (el.getBoundingClientRect().top < limit) show(el); });
      });
    }, { passive: true });
  })();

  /* ---------- Demo dates ----------
     The wedding weekend is written for the dates in V.events. While V.keepDemoCurrent is true and the
     weekend is over (after the last event ends), every date moves on to the same weekend of a later year,
     by whole weeks so weekdays never change (Saturday, June 19, 2027 becomes Saturday, June 17, 2028): the
     countdown, schedule, calendar files, RSVP and room-block deadlines and the year. The page text is
     updated through data-date, data-edition and <time datetime> (see DOCS.md, "Demo dates"). */
  (function () {
    var events = V.events || [];
    if (!V.keepDemoCurrent || !events.length) return;
    var DAY = 86400000;
    var dayNum = function (iso) { return Math.round(Date.parse(iso.slice(0, 10) + 'T00:00:00Z') / DAY); };
    var isoOf = function (n) { return new Date(n * DAY).toISOString().slice(0, 10); };
    var first = events[0].start.slice(0, 10), base = +first.slice(0, 4);
    var end = Math.max.apply(null, events.map(function (ev) { return new Date(ev.end).getTime(); }));
    var shift = 0;
    for (var y = 1; end + shift * DAY < Date.now() && y < 100; y++) {
      shift = Math.round((dayNum((base + y) + first.slice(4)) - dayNum(first)) / 7) * 7;
    }
    if (!shift) return;
    var move = function (iso) { return isoOf(dayNum(iso) + shift) + iso.slice(10); };
    var fmt = function (iso, opts) { return new Date(iso.slice(0, 10) + 'T12:00:00Z').toLocaleDateString('en-US', Object.assign({ timeZone: 'UTC' }, opts)); };
    var ceremony = move((V.couple || {}).ceremony_iso || events[0].start);
    var year = +ceremony.slice(0, 4);
    events.forEach(function (ev) { ev.start = move(ev.start); ev.end = move(ev.end); });
    if (V.couple) {
      V.couple.ceremony_iso = ceremony;
      V.couple.date_long = fmt(ceremony, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      V.couple.date_short = ceremony.slice(5, 7) + '.' + ceremony.slice(8, 10) + '.' + ceremony.slice(2, 4);
    }
    $$('[data-countdown]').forEach(function (el) { el.setAttribute('data-countdown', move(el.getAttribute('data-countdown'))); });
    $$('time[datetime]').forEach(function (el) { el.setAttribute('datetime', move(el.getAttribute('datetime'))); });
    $$('[data-date]').forEach(function (el) {
      var opts = el.getAttribute('data-date-format') === 'dm' ? { day: 'numeric', month: 'long' } : { day: 'numeric', month: 'long', year: 'numeric' };
      el.textContent = fmt(move(el.getAttribute('data-date')), opts);
    });
    $$('[data-edition]').forEach(function (el) {
      var k = el.getAttribute('data-edition');
      if (k === 'year') el.textContent = String(year);
      else if (k === 'short') el.textContent = ceremony.slice(5, 7) + '.' + ceremony.slice(8, 10) + '.' + ceremony.slice(2, 4);
    });
    // The page title: "… · June 19, 2027" and the like.
    var MONTHS = 'January February March April May June July August September October November December'.split(' ');
    document.title = document.title.replace(new RegExp('\\b(' + MONTHS.join('|') + ') (\\d{1,2}), (' + base + ')\\b', 'g'), function (m, mo, d) {
      return fmt(move(base + '-' + String(MONTHS.indexOf(mo) + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0')), { day: 'numeric', month: 'long', year: 'numeric' });
    });
  })();

  /* ---------- Countdown ---------- */
  (function () {
    var box = $('[data-countdown]');
    if (!box) return;
    var target = new Date(box.getAttribute('data-countdown')).getTime();
    var units = {};
    $$('[data-unit]', box).forEach(function (el) { units[el.getAttribute('data-unit')] = el; });
    var timer;
    function pad(n, len) { var s = String(n); while (s.length < len) s = '0' + s; return s; }
    function tick() {
      var diff = Math.max(0, target - Date.now());
      var s = Math.floor(diff / 1000);
      units.days.textContent = pad(Math.floor(s / 86400), 2);
      units.hours.textContent = pad(Math.floor(s / 3600) % 24, 2);
      units.minutes.textContent = pad(Math.floor(s / 60) % 60, 2);
      units.seconds.textContent = pad(s % 60, 2);
      if (diff === 0) {
        clearInterval(timer);
        var done = $('[data-countdown-done]');
        if (done) done.classList.remove('hidden');
      }
    }
    tick();
    timer = setInterval(tick, 1000);
  })();

  /* ---------- Add to calendar (.ics files, generated in the browser) ---------- */
  function icsEscape(text) {
    return String(text).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
  }
  function icsDate(date) {
    return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  }
  // RFC 5545: lines longer than 75 octets are folded with CRLF + space.
  function fold(line) {
    var bytes = new TextEncoder().encode(line);
    if (bytes.length <= 75) return line;
    var out = [];
    var current = '';
    var size = 0;
    Array.from(line).forEach(function (ch) {
      var len = new TextEncoder().encode(ch).length;
      if (size + len > (out.length ? 74 : 75)) { out.push(current); current = ''; size = 0; }
      current += ch;
      size += len;
    });
    out.push(current);
    return out.join('\r\n ');
  }
  function buildIcs(events) {
    var couple = V.couple || {};
    var stamp = icsDate(new Date());
    var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Amara & Theo//Wedding website//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
    events.forEach(function (ev) {
      lines.push(
        'BEGIN:VEVENT',
        'UID:' + ev.id + '@amara-and-theo.example',
        'DTSTAMP:' + stamp,
        'DTSTART:' + icsDate(new Date(ev.start)),
        'DTEND:' + icsDate(new Date(ev.end)),
        'SUMMARY:' + icsEscape((couple.names || 'Wedding') + ': ' + ev.title),
        'LOCATION:' + icsEscape(ev.address),
        'DESCRIPTION:' + icsEscape(ev.body + '\nDress code: ' + ev.dress),
        'END:VEVENT'
      );
    });
    lines.push('END:VCALENDAR');
    return lines.map(fold).join('\r\n') + '\r\n';
  }
  function downloadIcs(which) {
    var events = (V.events || []).filter(function (ev) { return which === 'all' || ev.id === which; });
    if (!events.length) return;
    var blob = new Blob([buildIcs(events)], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = which === 'all' ? 'amara-and-theo-wedding-weekend.ics' : 'amara-and-theo-' + which + '.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    toast(which === 'all' ? 'Calendar file with the whole weekend downloaded' : 'Calendar file downloaded: ' + events[0].title);
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-ics]');
    if (btn) downloadIcs(btn.getAttribute('data-ics'));
  });
  window.VOWS_ICS = buildIcs; // exposed for testing and reuse

  /* ---------- Map legend ---------- */
  (function () {
    var buttons = $$('[data-pin-target]');
    if (!buttons.length) return;
    function select(id) {
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-pin-target') === id)); });
      $$('[data-pin]').forEach(function (g) { g.classList.toggle('is-active', g.getAttribute('data-pin') === id); });
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-pin-target');
        select(b.getAttribute('aria-pressed') === 'true' ? '' : id);
      });
    });
    $$('[data-pin]').forEach(function (g) {
      g.addEventListener('click', function () { select(g.getAttribute('data-pin')); });
    });
  })();

  /* ---------- Copy booking codes ---------- */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-copy]');
    if (!btn) return;
    var text = btn.getAttribute('data-copy');
    function done() { toast('Booking code ' + text + ' copied'); }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, function () { toast('Booking code: ' + text); });
    } else {
      toast('Booking code: ' + text);
    }
  });

  /* ---------- Form helpers ---------- */
  function setError(field, message, describedBy) {
    // Radio groups get their message below the group; inputs inside their field wrapper.
    var holder = field.getAttribute('role') === 'radiogroup' ? field.parentNode : (field.closest('[data-field]') || field.parentNode);
    var id = (field.id || field.getAttribute('data-error-id')) + '-error';
    var err = document.getElementById(id);
    if (message) {
      if (!err) {
        err = document.createElement('p');
        err.className = 'field-error';
        err.id = id;
        holder.appendChild(err);
      }
      err.textContent = message;
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', [describedBy, id].filter(Boolean).join(' '));
    } else {
      if (err) err.remove();
      field.removeAttribute('aria-invalid');
      if (describedBy) field.setAttribute('aria-describedby', describedBy); else field.removeAttribute('aria-describedby');
    }
  }
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  /* ---------- RSVP ---------- */
  (function () {
    var root = $('[data-rsvp]');
    if (!root) return;
    var findForm = $('[data-rsvp-find]', root);
    var detailsForm = $('[data-rsvp-details]', root);
    var reviewBox = $('[data-rsvp-review]', root);
    var doneBox = $('[data-rsvp-done]', root);
    var DRAFT_KEY = 'vows:rsvp-draft:v1';
    var LIMITS = { dietary: 300, name: 80, song: 120, note: 500, email: 254 };
    var invites = V.invites || [];
    var meals = V.meals || [];
    var kidsMeal = V.kidsMeal;
    var state = null;

    function normalize(s) {
      return String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/\s+/g, ' ').trim();
    }
    function compact(s) { return normalize(s).replace(/[^a-z0-9]/g, ''); }
    function findInvite(query) {
      var q = compact(query);
      if (!q) return null;
      return invites.find(function (inv) { return compact(inv.code) === q; }) ||
        invites.find(function (inv) { return inv.guests.some(function (g) { return compact(g.name) === q; }); }) || null;
    }
    function mealsFor(guest) { return guest && guest.child ? [kidsMeal].concat(meals) : meals; }
    function str(v, max) { return typeof v === 'string' ? v.slice(0, max) : ''; }

    function emptyState(invite) {
      var answers = {};
      invite.guests.forEach(function (g) { answers[g.id] = { attending: '', meal: '', dietary: '' }; });
      return { code: invite.code, answers: answers, plusOne: { bringing: false, name: '', meal: '', dietary: '' }, song: '', note: '', email: '' };
    }

    // Saved drafts are validated before use: anything malformed or unknown is dropped.
    function readDraft(invite) {
      var raw = store.get(DRAFT_KEY);
      if (!raw || typeof raw !== 'object' || Array.isArray(raw)) { if (raw !== null) store.remove(DRAFT_KEY); return null; }
      var known = invites.find(function (inv) { return inv.code === raw.code; });
      if (!known) { store.remove(DRAFT_KEY); return null; }
      if (known !== invite) return null;
      var clean = emptyState(invite);
      var answers = raw.answers && typeof raw.answers === 'object' && !Array.isArray(raw.answers) ? raw.answers : {};
      invite.guests.forEach(function (g) {
        var a = answers[g.id];
        if (!a || typeof a !== 'object') return;
        var allowed = mealsFor(g).map(function (m) { return m.id; });
        clean.answers[g.id] = {
          attending: a.attending === 'yes' || a.attending === 'no' ? a.attending : '',
          meal: allowed.indexOf(a.meal) !== -1 ? a.meal : '',
          dietary: str(a.dietary, LIMITS.dietary)
        };
      });
      if (invite.plusOne && raw.plusOne && typeof raw.plusOne === 'object') {
        var p = raw.plusOne;
        clean.plusOne = {
          bringing: p.bringing === true,
          name: str(p.name, LIMITS.name),
          meal: meals.some(function (m) { return m.id === p.meal; }) ? p.meal : '',
          dietary: str(p.dietary, LIMITS.dietary)
        };
      }
      clean.song = str(raw.song, LIMITS.song);
      clean.note = str(raw.note, LIMITS.note);
      clean.email = str(raw.email, LIMITS.email);
      store.set(DRAFT_KEY, clean); // self-heal anything we dropped
      return clean;
    }

    var STEPS = ['find', 'details', 'review'];
    // `initial` is true only for the first render on page load: focus then stays where the browser puts it
    // (so the skip link, header and menu come first), and the page doesn't scroll. Every later step change
    // is something the visitor did, so focus moves to the new step's heading.
    function showStep(step, initial) {
      findForm.hidden = step !== 'find';
      detailsForm.hidden = step !== 'details';
      reviewBox.hidden = step !== 'review';
      doneBox.hidden = step !== 'done';
      $$('[data-step-label]', root).forEach(function (li) {
        var s = li.getAttribute('data-step-label');
        var current = s === step;
        var past = STEPS.indexOf(s) < STEPS.indexOf(step) || step === 'done';
        if (current) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        li.className = 'rounded-full border px-3 py-1 ' + (current ? 'border-sage-deep bg-sage-deep text-white' : past ? 'border-sage text-sage-deep' : 'border-line');
      });
      $('[data-rsvp-steps]', root).hidden = step === 'done';
      if (initial) return;
      var heading = $('[data-step-heading]', step === 'find' ? findForm : step === 'details' ? detailsForm : step === 'review' ? reviewBox : doneBox);
      if (heading) heading.focus({ preventScroll: true });
      var top = root.getBoundingClientRect().top + window.scrollY - 100;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    }

    function radio(name, value, label, note, checked) {
      var id = name + '-' + value;
      return '<label class="choice" for="' + esc(id) + '"><input type="radio" id="' + esc(id) + '" name="' + esc(name) + '" value="' + esc(value) + '"' + (checked ? ' checked' : '') + '>' +
        '<span><span class="block font-medium">' + esc(label) + '</span>' + (note ? '<span class="block text-sm text-muted">' + esc(note) + '</span>' : '') + '</span></label>';
    }

    function guestBlock(invite, g, a) {
      var mealsHtml = mealsFor(g).map(function (m) { return radio('meal-' + g.id, m.id, m.label, m.note, a.meal === m.id); }).join('');
      return '<div class="border-t border-line pt-6"><fieldset data-guest="' + esc(g.id) + '">' +
        '<legend class="font-serif text-2xl">' + esc(g.name) + (g.child ? ' <span class="ml-1 align-middle text-sm font-sans text-muted">(child)</span>' : '') + '</legend>' +
        '<div class="choice-group mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Will ' + esc(g.name) + ' attend?" data-error-id="attending-' + esc(g.id) + '" data-field>' +
          radio('attending-' + g.id, 'yes', 'Joyfully accepts', 'See you in the garden', a.attending === 'yes') +
          radio('attending-' + g.id, 'no', 'Regretfully declines', 'We\'ll raise a glass to you', a.attending === 'no') +
        '</div>' +
        '<div class="mt-5" data-attending-only' + (a.attending === 'yes' ? '' : ' hidden') + '>' +
          '<fieldset><legend class="label">Dinner choice</legend>' +
            '<div class="choice-group grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Dinner choice for ' + esc(g.name) + '" data-error-id="meal-' + esc(g.id) + '" data-field>' + mealsHtml + '</div>' +
          '</fieldset>' +
          '<div class="mt-4" data-field><label class="label" for="dietary-' + esc(g.id) + '">Allergies or dietary needs <span class="font-normal text-muted">(optional)</span></label>' +
            '<textarea class="field min-h-20" id="dietary-' + esc(g.id) + '" name="dietary-' + esc(g.id) + '" maxlength="' + LIMITS.dietary + '">' + esc(a.dietary) + '</textarea></div>' +
        '</div>' +
      '</fieldset></div>';
    }

    function renderDetails(restored) {
      var invite = invites.find(function (inv) { return inv.code === state.code; });
      var p = state.plusOne;
      var html = '<h2 class="text-center font-serif text-3xl" tabindex="-1" data-step-heading>' + esc(invite.label) + '</h2>' +
        '<p class="mt-2 text-center text-muted">Invitation ' + esc(invite.code) + ' · <button type="button" class="link" data-rsvp-restart>Not you?</button></p>' +
        (restored ? '<p class="mx-auto mt-4 max-w-md rounded-xl bg-linen p-3 text-center text-sm text-muted" role="status">We restored the reply you started earlier on this device.</p>' : '') +
        '<div class="mt-6 hidden rounded-xl border border-[#b3261e] bg-[#fdf1ef] p-4 text-sm text-[#8c1d18]" role="alert" data-rsvp-errors tabindex="-1"></div>' +
        '<div class="mt-6 grid gap-8">' + invite.guests.map(function (g) { return guestBlock(invite, g, state.answers[g.id]); }).join('') + '</div>';
      if (invite.plusOne) {
        html += '<div class="mt-8 border-t border-line pt-6"><fieldset><legend class="font-serif text-2xl">Your guest</legend>' +
          '<label class="mt-3 flex items-center gap-3"><input type="checkbox" class="size-4 accent-sage-deep" name="plusone" data-plusone-toggle' + (p.bringing ? ' checked' : '') + '> I\'d like to bring a guest</label>' +
          '<div class="mt-5 grid gap-4" data-plusone-fields' + (p.bringing ? '' : ' hidden') + '>' +
            '<div data-field><label class="label" for="plusone-name">Guest\'s full name</label><input class="field" id="plusone-name" name="plusone-name" autocomplete="off" maxlength="' + LIMITS.name + '" value="' + esc(p.name) + '"></div>' +
            '<fieldset><legend class="label">Their dinner choice</legend><div class="choice-group grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Dinner choice for your guest" data-error-id="meal-plusone" data-field>' +
              meals.map(function (m) { return radio('meal-plusone', m.id, m.label, m.note, p.meal === m.id); }).join('') + '</div></fieldset>' +
            '<div data-field><label class="label" for="dietary-plusone">Their allergies or dietary needs <span class="font-normal text-muted">(optional)</span></label><textarea class="field min-h-20" id="dietary-plusone" name="dietary-plusone" maxlength="' + LIMITS.dietary + '">' + esc(p.dietary) + '</textarea></div>' +
          '</div></fieldset></div>';
      }
      html += '<div class="mt-8 grid gap-5 border-t border-line pt-6">' +
        '<div data-field><label class="label" for="rsvp-song">Song request <span class="font-normal text-muted">(optional)</span></label><input class="field" id="rsvp-song" name="song" maxlength="' + LIMITS.song + '" placeholder="The song that gets you on the dance floor" value="' + esc(state.song) + '"></div>' +
        '<div data-field><label class="label" for="rsvp-note">A note for us <span class="font-normal text-muted">(optional)</span></label><textarea class="field min-h-24" id="rsvp-note" name="note" maxlength="' + LIMITS.note + '">' + esc(state.note) + '</textarea></div>' +
        '<div data-field><label class="label" for="rsvp-email">Email for your confirmation</label><input class="field" id="rsvp-email" name="email" type="email" autocomplete="email" maxlength="' + LIMITS.email + '" required value="' + esc(state.email) + '"></div>' +
      '</div>' +
      '<div class="mt-8 flex flex-wrap justify-between gap-3"><button type="button" class="btn btn-ghost" data-rsvp-restart>Back</button><button type="submit" class="btn btn-primary btn-lg">Review reply</button></div>';
      detailsForm.innerHTML = html;
    }

    function collect() {
      var invite = invites.find(function (inv) { return inv.code === state.code; });
      invite.guests.forEach(function (g) {
        var att = $('input[name="attending-' + g.id + '"]:checked', detailsForm);
        var meal = $('input[name="meal-' + g.id + '"]:checked', detailsForm);
        state.answers[g.id] = {
          attending: att ? att.value : '',
          meal: meal ? meal.value : '',
          dietary: ($('#dietary-' + g.id, detailsForm) || {}).value || ''
        };
      });
      if (invite.plusOne) {
        var pm = $('input[name="meal-plusone"]:checked', detailsForm);
        state.plusOne = {
          bringing: !!$('[data-plusone-toggle]', detailsForm).checked,
          name: $('#plusone-name', detailsForm).value.trim().slice(0, LIMITS.name),
          meal: pm ? pm.value : '',
          dietary: $('#dietary-plusone', detailsForm).value.slice(0, LIMITS.dietary)
        };
      }
      state.song = $('#rsvp-song', detailsForm).value.slice(0, LIMITS.song);
      state.note = $('#rsvp-note', detailsForm).value.slice(0, LIMITS.note);
      state.email = $('#rsvp-email', detailsForm).value.trim().slice(0, LIMITS.email);
    }

    var saveTimer;
    function saveDraft() {
      clearTimeout(saveTimer);
      saveTimer = setTimeout(function () { collect(); store.set(DRAFT_KEY, state); }, 250);
    }

    function validate() {
      var invite = invites.find(function (inv) { return inv.code === state.code; });
      var problems = [];
      invite.guests.forEach(function (g) {
        var a = state.answers[g.id];
        var group = $('[data-guest="' + g.id + '"] [data-error-id="attending-' + g.id + '"]', detailsForm);
        var first = g.name.split(' ')[0];
        if (!a.attending) { problems.push({ el: group, msg: 'Let us know if ' + first + ' can come.' }); }
        setError(group, a.attending ? '' : 'Let us know if ' + first + ' can come.');
        var mealGroup = $('[data-error-id="meal-' + g.id + '"]', detailsForm);
        var needMeal = a.attending === 'yes' && !a.meal;
        if (needMeal) problems.push({ el: mealGroup, msg: 'Choose a dinner for ' + first + '.' });
        setError(mealGroup, needMeal ? 'Choose a dinner for ' + first + '.' : '');
      });
      if (invite.plusOne) {
        var nameEl = $('#plusone-name', detailsForm);
        var pmGroup = $('[data-error-id="meal-plusone"]', detailsForm);
        var p = state.plusOne;
        var needName = p.bringing && !p.name;
        var needMeal = p.bringing && !p.meal;
        setError(nameEl, needName ? 'Add your guest\'s name.' : '');
        setError(pmGroup, needMeal ? 'Choose a dinner for your guest.' : '');
        if (needName) problems.push({ el: nameEl, msg: 'Add your guest\'s name.' });
        if (needMeal) problems.push({ el: pmGroup, msg: 'Choose a dinner for your guest.' });
      }
      var emailEl = $('#rsvp-email', detailsForm);
      var emailMsg = !state.email ? 'Add an email so we can confirm your reply.' : EMAIL.test(state.email) ? '' : 'That email address doesn\'t look right.';
      setError(emailEl, emailMsg);
      if (emailMsg) problems.push({ el: emailEl, msg: emailMsg });

      var summary = $('[data-rsvp-errors]', detailsForm);
      if (problems.length) {
        summary.innerHTML = '<p class="font-medium">Please check ' + (problems.length === 1 ? 'one thing' : problems.length + ' things') + ':</p><ul class="mt-2 list-disc pl-5">' +
          problems.map(function (p) { return '<li>' + esc(p.msg) + '</li>'; }).join('') + '</ul>';
        summary.classList.remove('hidden');
        var target = problems[0].el;
        var focusable = target && (target.matches('input, textarea') ? target : $('input', target));
        if (focusable) focusable.focus(); else summary.focus();
      } else {
        summary.classList.add('hidden');
      }
      return !problems.length;
    }

    function mealLabel(id) {
      var m = meals.concat([kidsMeal]).find(function (x) { return x.id === id; });
      return m ? m.label : '';
    }

    function renderReview() {
      var invite = invites.find(function (inv) { return inv.code === state.code; });
      var rows = invite.guests.map(function (g) {
        var a = state.answers[g.id];
        var detail = a.attending === 'yes' ? mealLabel(a.meal) + (a.dietary ? ' · ' + a.dietary : '') : 'Can\'t make it';
        return '<li class="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-line py-4"><span class="font-serif text-2xl">' + esc(g.name) + '</span>' +
          '<span class="text-right"><span class="block font-medium ' + (a.attending === 'yes' ? 'text-sage-deep' : 'text-terra') + '">' + (a.attending === 'yes' ? 'Attending' : 'Not attending') + '</span><span class="block text-sm text-muted">' + esc(detail) + '</span></span></li>';
      });
      if (invite.plusOne && state.plusOne.bringing) {
        rows.push('<li class="flex flex-wrap justify-between gap-x-6 gap-y-1 border-b border-line py-4"><span class="font-serif text-2xl">' + esc(state.plusOne.name) + ' <span class="font-sans text-sm text-muted">(guest)</span></span>' +
          '<span class="text-right"><span class="block font-medium text-sage-deep">Attending</span><span class="block text-sm text-muted">' + esc(mealLabel(state.plusOne.meal) + (state.plusOne.dietary ? ' · ' + state.plusOne.dietary : '')) + '</span></span></li>');
      }
      var extra = [];
      if (state.song) extra.push('<div><dt class="text-sm text-muted">Song request</dt><dd class="font-medium">' + esc(state.song) + '</dd></div>');
      if (state.note) extra.push('<div><dt class="text-sm text-muted">Your note</dt><dd class="whitespace-pre-line">' + esc(state.note) + '</dd></div>');
      extra.push('<div><dt class="text-sm text-muted">Confirmation email</dt><dd class="font-medium break-all">' + esc(state.email) + '</dd></div>');
      reviewBox.innerHTML = '<h2 class="text-center font-serif text-3xl" tabindex="-1" data-step-heading>Check your reply</h2>' +
        '<ul class="mt-6 border-t border-line">' + rows.join('') + '</ul>' +
        '<dl class="mt-6 grid gap-4">' + extra.join('') + '</dl>' +
        '<div class="mt-8 flex flex-wrap justify-between gap-3"><button type="button" class="btn btn-ghost" data-rsvp-edit>Edit reply</button><button type="button" class="btn btn-primary btn-lg" data-rsvp-send>Send reply</button></div>';
    }

    function renderDone() {
      var invite = invites.find(function (inv) { return inv.code === state.code; });
      var coming = invite.guests.filter(function (g) { return state.answers[g.id].attending === 'yes'; });
      var names = invite.guests.map(function (g) { return g.name.split(' ')[0]; });
      var nameList = names.length > 1 ? names.slice(0, -1).join(', ') + ' & ' + names[names.length - 1] : names[0];
      doneBox.innerHTML = '<div class="text-center">' +
        '<div class="relative mx-auto grid size-36 place-items-center text-terra"><img src="assets/img/wreath.svg" alt="" class="absolute inset-0 size-full" width="144" height="144">' +
        '<svg class="relative size-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7-4.4-9-9a5 5 0 0 1 9-3 5 5 0 0 1 9 3c-2 4.6-9 9-9 9Z"/></svg></div>' +
        '<h2 class="mt-4 font-serif text-4xl" tabindex="-1" data-step-heading>Thank you, ' + esc(nameList) + '</h2>' +
        '<p class="lead mx-auto mt-4 max-w-md">' + (coming.length ? 'We can\'t wait to celebrate with you in the garden.' : 'We\'ll miss you, and we\'ll raise a glass in your honor.') + '</p>' +
        '<p class="mx-auto mt-6 max-w-md rounded-xl bg-linen p-4 text-sm text-muted" role="status">Your reply is in, and a confirmation is on its way to <span class="font-medium text-ink break-all">' + esc(state.email) + '</span>. Your reference is <span class="font-medium text-ink" data-ref>' + makeRef('AT') + '</span>. If anything changes, reply again with the code on your invitation.</p>' +
        '<div class="mt-8 flex flex-wrap justify-center gap-3">' + (coming.length ? '<button type="button" class="btn btn-sage" data-ics="all">Add the weekend to your calendar</button>' : '') +
        '<a href="schedule.html" class="btn btn-ghost">See the schedule</a></div>' +
        '<button type="button" class="link mt-6 text-sm text-muted" data-rsvp-restart>Reply for another invitation</button></div>';
    }

    function restart() {
      state = null;
      findForm.reset();
      setError($('#rsvp-query', findForm), '', 'rsvp-query-hint');
      showStep('find');
    }

    findForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = $('#rsvp-query', findForm);
      var invite = findInvite(input.value);
      if (!input.value.trim()) { setError(input, 'Enter the code from your invitation or your full name.', 'rsvp-query-hint'); input.focus(); return; }
      if (!invite) { setError(input, 'We couldn\'t find that invitation. Check the code on your card, or try your full name as it\'s written there.', 'rsvp-query-hint'); input.focus(); return; }
      setError(input, '', 'rsvp-query-hint');
      var draft = readDraft(invite);
      state = draft || emptyState(invite);
      renderDetails(!!draft);
      showStep('details');
    });

    detailsForm.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name && t.name.indexOf('attending-') === 0) {
        var block = t.closest('[data-guest]');
        $('[data-attending-only]', block).hidden = t.value !== 'yes';
      }
      if (t.matches('[data-plusone-toggle]')) $('[data-plusone-fields]', detailsForm).hidden = !t.checked;
      saveDraft();
    });
    detailsForm.addEventListener('input', saveDraft);
    detailsForm.addEventListener('submit', function (e) {
      e.preventDefault();
      collect();
      store.set(DRAFT_KEY, state);
      if (!validate()) return;
      renderReview();
      showStep('review');
    });

    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-rsvp-restart]')) { restart(); return; }
      if (e.target.closest('[data-rsvp-edit]')) { renderDetails(false); showStep('details'); return; }
      if (e.target.closest('[data-rsvp-send]')) {
        // To connect it: send `state` to your own endpoint here (see DOCS.md, Forms), e.g.
        // fetch('https://formspree.io/f/your-id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(state) })
        store.remove(DRAFT_KEY);
        renderDone();
        showStep('done');
      }
    });
    showStep('find', true);
  })();

  /* ---------- Registry ---------- */
  (function () {
    var grid = $('[data-gift-grid]');
    if (!grid) return;
    var KEY = 'vows:reserved:v1';
    var gifts = V.registry || [];
    var icons = V.giftIcons || {};
    var filter = 'all';
    var hideReserved = false;

    // Gifts this visitor reserved. Validated on read: unknown, duplicate or over-capacity entries are dropped.
    function readReserved() {
      var raw = store.get(KEY);
      var list = Array.isArray(raw) ? raw : [];
      var clean = [];
      list.forEach(function (id) {
        var g = gifts.find(function (x) { return x.id === id; });
        if (typeof id === 'string' && g && clean.indexOf(id) === -1 && g.needed - g.reserved >= 1) clean.push(id);
      });
      if (raw !== null && JSON.stringify(raw) !== JSON.stringify(clean)) store.set(KEY, clean);
      return clean;
    }
    var mine = readReserved();

    function money(n) { return '$' + n.toLocaleString('en-US'); }
    function card(g) {
      var taken = g.reserved + (mine.indexOf(g.id) !== -1 ? 1 : 0);
      var full = taken >= g.needed;
      var isMine = mine.indexOf(g.id) !== -1;
      var status = full ? (isMine ? 'Reserved by you' : 'Fully reserved') : (g.needed > 1 ? taken + ' of ' + g.needed + ' reserved' : 'Available');
      var button = isMine
        ? '<button type="button" class="btn btn-ghost !px-4 !py-2 text-sm" data-reserve="' + esc(g.id) + '" aria-pressed="true" aria-label="Undo reservation for ' + esc(g.name) + '">Undo</button>'
        : '<button type="button" class="btn btn-sage !px-4 !py-2 text-sm" data-reserve="' + esc(g.id) + '" aria-pressed="false"' + (full ? ' disabled' : '') + ' aria-label="' + (full ? 'Reserved: ' : 'Reserve ') + esc(g.name) + '">' + (full ? 'Reserved' : 'Reserve') + '</button>';
      return '<article class="gift card flex flex-col p-4' + (full ? ' is-reserved' : '') + '">' +
        '<div class="gift-art"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (icons[g.icon] || '') + '</svg></div>' +
        '<div class="flex flex-1 flex-col px-2 pt-4 pb-1">' +
          '<p class="eyebrow">' + esc(g.category) + '</p>' +
          '<h3 class="mt-2 font-serif text-2xl leading-tight">' + esc(g.name) + '</h3>' +
          '<p class="mt-2 flex-1 text-muted">' + esc(g.note) + '</p>' +
          '<div class="mt-5 flex items-center justify-between gap-3"><span><span class="block font-serif text-2xl">' + money(g.price) + '</span><span class="block text-sm ' + (isMine ? 'text-sage-deep font-medium' : 'text-muted') + '">' + status + '</span></span>' + button + '</div>' +
        '</div></article>';
    }
    function render() {
      var list = gifts.filter(function (g) {
        var taken = g.reserved + (mine.indexOf(g.id) !== -1 ? 1 : 0);
        return (filter === 'all' || g.category === filter) && (!hideReserved || taken < g.needed || mine.indexOf(g.id) !== -1);
      });
      grid.innerHTML = list.map(card).join('') || '<p class="col-span-full rounded-xl bg-linen p-8 text-center text-muted">Everything in this category has been reserved. Thank you!</p>';
      $('[data-gift-count]').textContent = 'Showing ' + list.length + (list.length === 1 ? ' gift' : ' gifts') + (filter === 'all' ? '' : ' in ' + filter);
    }
    $$('[data-gift-filter]').forEach(function (b) {
      b.addEventListener('click', function () {
        filter = b.getAttribute('data-gift-filter');
        $$('[data-gift-filter]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        render();
      });
    });
    var avail = $('[data-gift-available]');
    if (avail) avail.addEventListener('change', function () { hideReserved = avail.checked; render(); });
    grid.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-reserve]');
      if (!btn || btn.disabled) return;
      var id = btn.getAttribute('data-reserve');
      var g = gifts.find(function (x) { return x.id === id; });
      var i = mine.indexOf(id);
      if (i === -1) { mine.push(id); toast('Reserved: ' + g.name + '. Thank you!'); } else { mine.splice(i, 1); toast('Reservation removed'); }
      store.set(KEY, mine);
      render();
      var again = $('[data-reserve="' + id + '"]', grid);
      if (again) again.focus();
    });
    render();
  })();

  /* ---------- Honeymoon fund ---------- */
  (function () {
    var form = $('[data-fund-form]');
    if (!form) return;
    var fund = V.fund || { goal: 1, raised: 0, amounts: [] };
    var selected = 0;
    var raised = fund.raised;
    var amountBtns = $$('[data-amount]', form);
    var custom = $('#fund-custom', form);
    var error = $('[data-fund-error]', form);
    function select(value) {
      selected = value;
      amountBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-amount')) === value)); });
    }
    amountBtns.forEach(function (b) {
      b.addEventListener('click', function () { custom.value = ''; select(Number(b.getAttribute('data-amount'))); error.hidden = true; });
    });
    custom.addEventListener('input', function () { select(0); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#fund-name', form);
      var amount = selected;
      var msg = '';
      if (!amount) {
        var raw = custom.value.trim().replace(/^\$/, '');
        if (!raw) msg = 'Choose an amount or enter your own.';
        else if (!/^\d{1,4}$/.test(raw) || Number(raw) < 5 || Number(raw) > 5000) msg = 'Enter a whole amount between $5 and $5,000.';
        else amount = Number(raw);
      }
      error.textContent = msg;
      error.hidden = !msg;
      if (msg) { custom.setAttribute('aria-invalid', 'true'); custom.setAttribute('aria-describedby', 'fund-amount-error'); }
      else { custom.removeAttribute('aria-invalid'); custom.removeAttribute('aria-describedby'); }
      var nameMsg = name.value.trim() ? '' : 'Add your name so we can thank you.';
      setError(name, nameMsg);
      if (msg) { custom.focus(); return; } // no amount chosen: the error is on the custom field
      if (nameMsg) { name.focus(); return; }
      raised += amount;
      $('[data-fund-raised]').textContent = '$' + raised.toLocaleString('en-US');
      var bar = $('[data-fund-bar]');
      bar.setAttribute('aria-valuenow', String(raised));
      $('span', bar).style.width = Math.min(100, Math.round(raised / fund.goal * 100)) + '%';
      var match = fund.amounts.find(function (a) { return a.value === amount; });
      var success = $('[data-fund-success]', form);
      success.innerHTML = '<p class="font-serif text-2xl">Thank you, ' + esc(name.value.trim().split(' ')[0]) + '!</p>' +
        '<p class="mt-1 text-muted">$' + amount.toLocaleString('en-US') + (match ? ' for ' + esc(match.label.charAt(0).toLowerCase() + match.label.slice(1)) : ' toward our honeymoon') + '. ' +
        'Your gift is noted under reference <span class="font-medium text-ink" data-ref>' + makeRef('AT') + '</span>. Use it as the memo on your payment (our details are on the card inside your invitation), and look out for a postcard from the coast.</p>';
      success.classList.remove('hidden');
      success.focus();
      form.reset();
      select(0);
    });
  })();

  /* ---------- Gallery lightbox ---------- */
  (function () {
    var dialog = $('[data-lightbox]');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    var photos = V.gallery || [];
    var index = 0;
    var opener = null;
    var img = $('[data-lightbox-img]', dialog);
    function show(i) {
      index = (i + photos.length) % photos.length;
      var p = photos[index];
      img.src = 'assets/img/gallery-' + p.slug + '.svg';
      img.alt = p.caption;
      img.width = 1200;
      img.height = p.shape === 'tall' ? 1500 : 900;
      $('[data-lightbox-title]', dialog).textContent = p.title;
      $('[data-lightbox-caption]', dialog).textContent = p.caption;
      $('[data-lightbox-count]', dialog).textContent = (index + 1) + ' of ' + photos.length;
    }
    $$('[data-photo]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        show(Number(btn.getAttribute('data-photo')));
        dialog.showModal();
        $('[data-lightbox-close]', dialog).focus();
      });
    });
    $('[data-lightbox-prev]', dialog).addEventListener('click', function () { show(index - 1); });
    $('[data-lightbox-next]', dialog).addEventListener('click', function () { show(index + 1); });
    $('[data-lightbox-close]', dialog).addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
    });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () { if (opener) opener.focus(); });
  })();

  /* ---------- FAQ search ---------- */
  (function () {
    var input = $('[data-faq-search]');
    if (!input) return;
    var status = $('[data-faq-status]');
    var items = $$('[data-faq]');
    var wasOpen = new Map();
    input.addEventListener('input', function () {
      var q = input.value.trim().toLowerCase();
      var count = 0;
      items.forEach(function (d) {
        if (!wasOpen.has(d)) wasOpen.set(d, d.open);
        var hit = !q || d.textContent.toLowerCase().indexOf(q) !== -1;
        d.hidden = !hit;
        if (hit) count++;
        d.open = q ? hit : wasOpen.get(d);
      });
      if (!q) wasOpen = new Map();
      $$('[data-faq-group]').forEach(function (g) { g.hidden = !$$('[data-faq]:not([hidden])', g).length; });
      status.textContent = !q ? '' : count ? count + (count === 1 ? ' question matches' : ' questions match') + ' “' + input.value.trim() + '”' : 'No questions match “' + input.value.trim() + '”. Try another word, or email us.';
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
  // Hide or show the button as soon as the mobile menu opens or closes.
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
