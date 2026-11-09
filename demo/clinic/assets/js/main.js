/* Brightside Dental — site scripts. Vanilla JavaScript, no dependencies.
 *
 * Contents
 *   1. Settings: opening hours, treatments and clinicians (edit these first)
 *   2. Helpers
 *   3. Header, mobile menu and scroll reveal
 *   4. Opening hours: open-now badge, today's row, next free slot
 *   5. Form validation (contact, newsletter, booking details)
 *   6. Team filter and insurance search
 *   7. Booking wizard (appointments.html)
 */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- 1. Settings */

  // Opening hours per weekday (0 = Sunday). Times are 24h decimals: 8.5 = 8:30 am,
  // in the practice's own time zone (TIMEZONE below).
  var HOURS = {
    0: null,
    1: [8, 19], 2: [8, 19], 3: [8, 19], 4: [8, 19],
    5: [8, 16],
    6: [9, 14]
  };
  var LUNCH = [12.5, 13.5];        // no appointments during lunch (weekdays)
  var SLOT_STEP = 30;              // minutes between appointment start times
  var MIN_NOTICE_MINUTES = 90;     // earliest bookable time from now
  var WEEKS_AHEAD = 4;             // how far ahead people can book

  // The practice's time zone (IANA name). The open-now badge, today's highlighted
  // row and bookable times use the time there, not on the visitor's device.
  var TIMEZONE = 'America/Los_Angeles';

  var CLINICIANS = {
    'dr-okoye': { name: 'Dr. Amara Okoye', role: 'General & family dentist', days: [1, 2, 3, 4, 5] },
    'dr-hartmann': { name: 'Dr. Lucas Hartmann', role: 'Orthodontist', days: [2, 4, 6] },
    'dr-raman': { name: 'Dr. Priya Raman', role: "Children's dentist", days: [1, 3, 5, 6] },
    'dr-alvarez': { name: 'Dr. Mateo Alvarez', role: 'Oral surgeon', days: [1, 2, 4] },
    'dr-kim': { name: 'Dr. Hannah Kim', role: 'Cosmetic dentist', days: [3, 4, 5, 6] },
    'jordan-ellis': { name: 'Jordan Ellis', role: 'Dental hygienist', days: [1, 2, 3, 4, 5] },
    'sofia-marchetti': { name: 'Sofia Marchetti', role: 'Dental hygienist', days: [2, 3, 4, 5, 6] }
  };

  var SERVICES = [
    { id: 'checkup', name: 'Check-up & cleaning', minutes: 60, note: 'Exam, clean and polish', who: ['dr-okoye', 'jordan-ellis', 'sofia-marchetti'] },
    { id: 'kids', name: "Children's check-up", minutes: 30, note: 'Ages 0–16, free under 3', who: ['dr-raman', 'dr-okoye'] },
    { id: 'filling', name: 'Toothache or filling', minutes: 45, note: 'Assessment and repair', who: ['dr-okoye', 'dr-kim', 'dr-raman'] },
    { id: 'gum', name: 'Gum care', minutes: 60, note: 'Deep clean or maintenance', who: ['sofia-marchetti', 'jordan-ellis'] },
    { id: 'whitening', name: 'Whitening consultation', minutes: 30, note: 'Shade check and options', who: ['dr-kim'] },
    { id: 'aligners', name: 'Clear aligner consultation', minutes: 45, note: 'Includes a 3D scan', who: ['dr-hartmann'] },
    { id: 'implant', name: 'Implant consultation', minutes: 45, note: 'Free, includes a 3D scan', who: ['dr-alvarez'] },
    { id: 'emergency', name: 'Emergency appointment', minutes: 30, note: 'Same-day pain relief', who: ['dr-okoye', 'dr-alvarez', 'dr-kim'] }
  ];

  /* ---------------------------------------------------------------- 2. Helpers */

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmtTime(h) {
    var hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    var suffix = hh >= 12 ? 'pm' : 'am';
    var h12 = hh % 12 || 12;
    return h12 + ':' + (mm < 10 ? '0' : '') + mm + ' ' + suffix;
  }
  function fmtDate(d) { return DAY_NAMES[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]; }
  // A short reference for confirmations, like BD-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  function startOfDay(d) { var x = new Date(d); x.setHours(0, 0, 0, 0); return x; }
  function addDays(d, n) { var x = new Date(d); x.setDate(x.getDate() + n); return x; }
  function hoursNow(d) { return d.getHours() + d.getMinutes() / 60; }

  // "Now" as the practice's wall-clock time. The returned Date's local fields
  // (getDay, getHours, ...) are the date and time in TIMEZONE, so it can be
  // compared with the calendar days and slot times built below.
  function nowInZone() {
    var p = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date()).forEach(function (x) { p[x.type] = x.value; });
    return new Date(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  }

  var toastEl = $('[data-toast]');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 3200);
  }

  /* ------------------------------------------- 3. Header, mobile menu, reveal */

  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 4); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = $('[data-menu-toggle]');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('[data-icon-open]', menuBtn).hidden = open;
    $('[data-icon-close]', menuBtn).hidden = !open;
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  // Scroll reveal. When one element comes into view, everything above it is revealed too,
  // so fast jumps (End key, anchor links) never leave hidden content behind.
  var reveals = $$('.reveal');
  function revealUpTo(el) {
    var bottom = el.getBoundingClientRect().top;
    reveals.forEach(function (r) {
      if (!r.classList.contains('is-in') && r.getBoundingClientRect().top <= bottom) r.classList.add('is-in');
    });
  }
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(function (r) { r.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { revealUpTo(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    reveals.forEach(function (r) { io.observe(r); });
  }

  /* ------------------------------------------------------- 4. Opening hours */

  function nextOpening(from) {
    for (var i = 0; i < 8; i++) {
      var day = addDays(startOfDay(from), i);
      var h = HOURS[day.getDay()];
      if (!h) continue;
      if (i === 0 && hoursNow(from) >= h[0]) continue;
      return { date: day, time: h[0], offset: i };
    }
    return null;
  }

  function updateOpenStatus() {
    var now = nowInZone();
    var today = HOURS[now.getDay()];
    var t = hoursNow(now);
    var open = !!today && t >= today[0] && t < today[1];
    var text;
    if (open) {
      text = 'Open now · closes at ' + fmtTime(today[1]);
    } else {
      var n = nextOpening(now);
      var when = n.offset === 0 ? 'today' : n.offset === 1 ? 'tomorrow' : DAY_NAMES[n.date.getDay()];
      text = 'Closed now · opens ' + when + ' at ' + fmtTime(n.time);
    }
    $$('[data-open-status]').forEach(function (el) {
      el.dataset.open = String(open);
      $('[data-open-text]', el).textContent = text;
    });
    var row = now.getDay(); // data-day uses the same numbers as HOURS (0 = Sunday)
    $$('[data-hours]').forEach(function (list) {
      $$('.hours-row', list).forEach(function (r) {
        var isToday = Number(r.dataset.day) === row;
        r.dataset.today = String(isToday);
        if (isToday) r.setAttribute('aria-current', 'date'); else r.removeAttribute('aria-current');
      });
    });
  }
  updateOpenStatus();
  setInterval(updateOpenStatus, 60 * 1000);

  /* --------------------------------------------- Appointment slot generation */

  // Deterministic "already booked" pattern so the demo calendar looks realistic.
  function isTaken(date, time, who) {
    var seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    var s = String(seed) + who + time;
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973;
    return h % 10 < 4;
  }

  function slotsFor(date, minutes, clinicianIds) {
    var hours = HOURS[date.getDay()];
    if (!hours) return [];
    var now = nowInZone();
    var earliest = new Date(now.getTime() + MIN_NOTICE_MINUTES * 60000);
    var out = [];
    for (var t = hours[0]; t + minutes / 60 <= hours[1] + 1e-9; t += SLOT_STEP / 60) {
      var end = t + minutes / 60;
      if (date.getDay() !== 6 && t < LUNCH[1] && end > LUNCH[0]) continue;
      var start = new Date(date); start.setHours(Math.floor(t), Math.round((t % 1) * 60), 0, 0);
      if (start < earliest) continue;
      var free = clinicianIds.filter(function (id) {
        return CLINICIANS[id].days.indexOf(date.getDay()) !== -1 && !isTaken(date, t, id);
      });
      out.push({ time: t, free: free });
    }
    return out;
  }

  // Home page: "next free slot" card.
  var nextSlotEl = $('[data-next-slot]');
  if (nextSlotEl) {
    var all = Object.keys(CLINICIANS);
    for (var d = 0; d < 14; d++) {
      var day = addDays(startOfDay(nowInZone()), d);
      var free = slotsFor(day, 60, all).filter(function (s) { return s.free.length; });
      if (free.length) {
        var label = d === 0 ? 'Today' : d === 1 ? 'Tomorrow' : DAY_NAMES[day.getDay()];
        nextSlotEl.textContent = label + ', ' + fmtTime(free[0].time);
        break;
      }
    }
  }

  /* ------------------------------------------------------ 5. Form validation */

  function errorFor(field) {
    var holder = field.type === 'checkbox' ? field.closest('label') : field;
    // A field sharing a row with its button (the newsletter's email + "Join"): the message goes
    // below the row, not between the field and the button.
    var row = field.parentElement;
    if (holder === field && row && row !== field.form && row.querySelector('button')) holder = row;
    var id = (field.id || field.name) + '-error';
    var err = document.getElementById(id);
    if (!err) {
      err = document.createElement('p');
      err.className = 'field-error';
      err.id = id;
      holder.insertAdjacentElement('afterend', err);
    }
    return err;
  }

  // Today's date (YYYY-MM-DD) on the visitor's device, for the date-of-birth check.
  // (new Date('YYYY-MM-DD') is UTC midnight, which is the wrong day near midnight.)
  function localISODate() {
    var d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }

  function validateField(field) {
    var v = field.type === 'checkbox' ? field.checked : field.value.trim();
    var msg = '';
    if (field.required && !v) {
      msg = field.type === 'checkbox' ? 'Please check this box to continue.' : 'Please fill in this field.';
    } else if (v && field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) {
      msg = 'Please enter an email address like name@example.com.';
    } else if (v && field.hasAttribute('data-phone') && v.replace(/\D/g, '').length < 7) {
      msg = 'Please enter a phone number we can call or text.';
    } else if (v && field.minLength > 0 && v.length < field.minLength) {
      msg = 'Please write at least ' + field.minLength + ' characters.';
    } else if (v && field.type === 'date' && field.name === 'dob' && v > localISODate()) {
      msg = 'Date of birth can’t be in the future.';
    }
    var describedBy = (field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
    var errId = (field.id || field.name) + '-error';
    if (msg) {
      var err = errorFor(field);
      err.textContent = msg;
      field.setAttribute('aria-invalid', 'true');
      if (describedBy.indexOf(errId) === -1) describedBy.push(errId);
    } else {
      var old = document.getElementById(errId);
      if (old) old.remove();
      field.removeAttribute('aria-invalid');
      describedBy = describedBy.filter(function (x) { return x !== errId; });
    }
    if (describedBy.length) field.setAttribute('aria-describedby', describedBy.join(' '));
    else field.removeAttribute('aria-describedby');
    return !msg;
  }

  function validateAll(scope) {
    var fields = $$('input, select, textarea', scope).filter(function (f) {
      return f.required || f.type === 'email' || f.hasAttribute('data-phone') || f.minLength > 0;
    });
    var ok = fields.map(validateField).every(Boolean);
    if (!ok) {
      var first = $('[aria-invalid="true"]', scope);
      if (first) first.focus();
    }
    return ok;
  }

  function liveValidate(scope) {
    $$('input, select, textarea', scope).forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value || f.getAttribute('aria-invalid')) validateField(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid')) validateField(f); });
      f.addEventListener('change', function () { if (f.getAttribute('aria-invalid')) validateField(f); });
    });
  }

  $$('form[data-validate]').forEach(function (form) {
    liveValidate(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateAll(form)) return;
      // To send for real: fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      // and show the success message when the response is ok.
      var success = $('[data-success]', form);
      success.textContent = (form.dataset.successText || 'Thank you!').replace('{ref}', makeRef('BD'));
      success.classList.remove('hidden');
      form.reset();
    });
  });

  $$('[data-demo-download]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      toast('We’re updating this form. Please complete it in the waiting room when you arrive.');
    });
  });

  /* ------------------------------------------ 6. Team filter, insurance search */

  var grid = $('[data-filter-grid]');
  if (grid) {
    var cards = $$('[data-specialty]', grid);
    var countEl = $('[data-filter-count]');
    $$('[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var key = btn.dataset.filter;
        $$('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var shown = 0;
        cards.forEach(function (c) {
          var match = key === 'all' || c.dataset.specialty === key;
          c.hidden = !match;
          if (match) { shown++; c.classList.add('is-in'); }
        });
        countEl.textContent = key === 'all'
          ? 'Showing all ' + cards.length + ' team members'
          : 'Showing ' + shown + ' of ' + cards.length + ' team members: ' + btn.textContent;
      });
    });
  }

  var planSearch = $('[data-plan-search]');
  if (planSearch) {
    var plans = $$('[data-plan]');
    var planCount = $('[data-plan-count]');
    var planEmpty = $('[data-plan-empty]');
    planSearch.addEventListener('input', function () {
      var q = planSearch.value.trim().toLowerCase();
      var shown = 0;
      plans.forEach(function (p) {
        var match = !q || p.textContent.toLowerCase().indexOf(q) !== -1;
        p.hidden = !match;
        if (match) shown++;
      });
      planCount.textContent = shown === plans.length ? plans.length + ' plans' : shown + ' of ' + plans.length + ' plans match';
      planEmpty.classList.toggle('hidden', shown > 0);
    });
  }

  /* --------------------------------------------------------- 7. Booking wizard */

  var booking = $('[data-booking]');
  if (!booking) return;

  var steps = $$('fieldset[data-step]', booking);
  var navItems = $$('[data-steps-nav] li');
  var progress = $('[data-progress]');
  var prevBtn = $('[data-prev]', booking);
  var nextBtn = $('[data-next]', booking);
  var submitBtn = $('[data-submit]', booking);
  var state = { step: 1, service: null, clinician: null, week: 0, date: null, time: null, who: null };

  function svc() { return SERVICES.filter(function (s) { return s.id === state.service; })[0]; }
  function team() {
    var s = svc();
    if (!s) return [];
    return state.clinician && state.clinician !== 'any' ? [state.clinician] : s.who;
  }

  function showError(key, msg) {
    var el = $('[data-error-for="' + key + '"]', booking);
    el.textContent = msg;
    el.classList.toggle('hidden', !msg);
  }

  // Step 1: treatments
  var serviceList = $('[data-service-list]', booking);
  serviceList.innerHTML = SERVICES.map(function (s) {
    return '<label class="choice"><input type="radio" name="service" value="' + s.id + '">' +
      '<span class="choice-box"><span class="flex items-start justify-between gap-3"><span class="font-bold text-ink">' + esc(s.name) + '</span>' +
      '<span class="badge shrink-0">' + s.minutes + ' min</span></span>' +
      '<span class="mt-1 block text-[.95rem] text-muted">' + esc(s.note) + '</span></span></label>';
  }).join('');

  // Step 2: clinicians for the chosen treatment
  var clinicianList = $('[data-clinician-list]', booking);
  function renderClinicians() {
    var s = svc();
    $('[data-chosen-service]', booking).textContent = s.name.toLowerCase();
    var opts = [{ id: 'any', name: 'First available', role: 'Any clinician who offers this', img: '' }].concat(s.who.map(function (id) {
      return { id: id, name: CLINICIANS[id].name, role: CLINICIANS[id].role, img: 'assets/img/' + id + '.svg' };
    }));
    if (state.clinician && opts.every(function (o) { return o.id !== state.clinician; })) state.clinician = null;
    clinicianList.innerHTML = opts.map(function (o) {
      var days = o.id === 'any' ? 'Most days' : CLINICIANS[o.id].days.map(function (d) { return DAY_SHORT[d]; }).join(', ');
      var pic = o.img
        ? '<img src="' + o.img + '" alt="" width="56" height="65" class="size-14 shrink-0 rounded-xl bg-brand-50 object-cover object-top">'
        : '<span class="icon-tile size-14 shrink-0 rounded-xl"><svg class="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/></svg></span>';
      return '<label class="choice"><input type="radio" name="clinician" value="' + o.id + '"' + (state.clinician === o.id ? ' checked' : '') + '>' +
        '<span class="choice-box flex items-center gap-4">' + pic +
        '<span><span class="block font-bold text-ink">' + esc(o.name) + '</span><span class="block text-[.95rem] text-muted">' + esc(o.role) + '</span>' +
        '<span class="block text-sm font-semibold text-brand-700">' + days + '</span></span></span></label>';
    }).join('');
  }

  // Step 3: calendar
  var daysEl = $('[data-days]', booking);
  var slotsWrap = $('[data-slots-wrap]', booking);
  var slotsEl = $('[data-slots]', booking);
  function weekStart(offset) {
    var today = startOfDay(nowInZone());
    var monday = addDays(today, -((today.getDay() + 6) % 7));
    return addDays(monday, offset * 7);
  }
  function renderDays() {
    var start = weekStart(state.week);
    var today = startOfDay(nowInZone());
    var s = svc();
    var end = addDays(start, 6);
    $('[data-week-label]', booking).textContent = state.week === 0 ? 'This week' :
      start.getDate() + ' ' + MONTHS[start.getMonth()] + ' – ' + end.getDate() + ' ' + MONTHS[end.getMonth()];
    $('[data-week="-1"]', booking).disabled = state.week === 0;
    $('[data-week="1"]', booking).disabled = state.week >= WEEKS_AHEAD - 1;
    var html = '';
    for (var i = 0; i < 7; i++) {
      var day = addDays(start, i);
      var free = day >= today ? slotsFor(day, s.minutes, team()).filter(function (x) { return x.free.length; }) : [];
      var disabled = !free.length;
      var reason = day < today ? 'past' : !HOURS[day.getDay()] ? 'closed' : 'no free times';
      var pressed = state.date && +state.date === +day;
      html += '<button type="button" class="day" data-date="' + day.toISOString() + '" aria-pressed="' + !!pressed + '"' + (disabled ? ' disabled' : '') +
        ' aria-label="' + fmtDate(day) + (disabled ? ', ' + reason : ', ' + free.length + ' times available') + '">' +
        '<small>' + DAY_SHORT[day.getDay()] + '</small><span class="text-lg">' + day.getDate() + '</span></button>';
    }
    daysEl.innerHTML = html;
  }
  function renderSlots() {
    if (!state.date) { slotsWrap.hidden = true; return; }
    var s = svc();
    var slots = slotsFor(state.date, s.minutes, team());
    slotsWrap.hidden = false;
    $('[data-slots-label]', booking).textContent = 'Available times on ' + fmtDate(state.date);
    slotsEl.innerHTML = slots.map(function (x) {
      var taken = !x.free.length;
      return '<button type="button" class="slot" data-time="' + x.time + '" aria-pressed="' + (state.time === x.time) + '"' + (taken ? ' disabled aria-label="' + fmtTime(x.time) + ', booked"' : '') + '>' + fmtTime(x.time) + '</button>';
    }).join('');
  }
  daysEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-date]');
    if (!b || b.disabled) return;
    state.date = new Date(b.dataset.date);
    state.time = null;
    state.who = null;
    renderDays();
    renderSlots();
    showError('slot', '');
    updateSummary();
    var first = $('.slot:not(:disabled)', slotsEl);
    if (first) first.focus();
  });
  slotsEl.addEventListener('click', function (e) {
    var b = e.target.closest('[data-time]');
    if (!b || b.disabled) return;
    state.time = Number(b.dataset.time);
    var slot = slotsFor(state.date, svc().minutes, team()).filter(function (x) { return x.time === state.time; })[0];
    state.who = slot && slot.free.length ? slot.free[0] : null;
    $$('.slot', slotsEl).forEach(function (s) { s.setAttribute('aria-pressed', String(s === b)); });
    showError('slot', '');
    updateSummary();
  });
  $$('[data-week]', booking).forEach(function (b) {
    b.addEventListener('click', function () {
      state.week = Math.max(0, Math.min(WEEKS_AHEAD - 1, state.week + Number(b.dataset.week)));
      renderDays();
    });
  });

  booking.addEventListener('change', function (e) {
    if (e.target.name === 'service') {
      if (state.service !== e.target.value) { state.date = null; state.time = null; state.who = null; }
      state.service = e.target.value;
      // A clinician who doesn't offer the new treatment is cleared now, so the summary is right.
      if (state.clinician && state.clinician !== 'any' && svc().who.indexOf(state.clinician) === -1) state.clinician = null;
      showError('service', '');
    }
    if (e.target.name === 'clinician') {
      if (state.clinician !== e.target.value) { state.date = null; state.time = null; state.who = null; }
      state.clinician = e.target.value;
      showError('clinician', '');
    }
    updateSummary();
  });

  // Live summary card
  function whenText() {
    if (!state.date) return '–';
    return fmtDate(state.date) + (state.time != null ? ', ' + fmtTime(state.time) : '');
  }
  function clinicianText() {
    if (!state.clinician) return '–';
    if (state.clinician === 'any') return state.who ? CLINICIANS[state.who].name + ' (first available)' : 'First available';
    return CLINICIANS[state.clinician].name;
  }
  function updateSummary() {
    var s = svc();
    $('[data-sum="service"]').textContent = s ? s.name : 'Not chosen yet';
    $('[data-sum="clinician"]').textContent = clinicianText();
    $('[data-sum="when"]').textContent = whenText();
    $('[data-sum="length"]').textContent = s ? s.minutes + ' minutes' : '–';
  }

  function renderReview() {
    var f = booking.elements;
    var rows = [
      ['Treatment', svc().name + ' (' + svc().minutes + ' min)', 1],
      ['Clinician', clinicianText(), 2],
      ['Date & time', whenText(), 3],
      ['Name', f.first.value + ' ' + f.last.value, 4],
      ['Contact', f.email.value + ' · ' + f.phone.value, 4],
      ['Insurance', f.insurance.value, 4],
      ['Visit type', booking.querySelector('[name="returning"]:checked').value, 4]
    ];
    if (f.notes.value.trim()) rows.push(['Notes', f.notes.value.trim(), 4]);
    $('[data-review]', booking).innerHTML = rows.map(function (r) {
      return '<div class="grid gap-1 p-4 sm:grid-cols-[9rem_1fr_auto] sm:items-center sm:gap-4"><dt class="text-sm font-bold text-muted">' + esc(r[0]) + '</dt>' +
        '<dd class="min-w-0 font-semibold break-words text-ink">' + esc(r[1]) + '</dd>' +
        '<dd><button type="button" class="text-sm font-bold text-brand-700 underline underline-offset-2" data-goto="' + r[2] + '">Change<span class="sr-only"> ' + esc(r[0].toLowerCase()) + '</span></button></dd></div>';
    }).join('');
  }
  $('[data-review]', booking).addEventListener('click', function (e) {
    var b = e.target.closest('[data-goto]');
    if (b) go(Number(b.dataset.goto));
  });

  function validateStep(n) {
    if (n === 1 && !state.service) { showError('service', 'Please choose a treatment to continue.'); serviceList.querySelector('input').focus(); return false; }
    if (n === 2 && !state.clinician) { showError('clinician', 'Please choose a clinician, or “First available”.'); clinicianList.querySelector('input').focus(); return false; }
    if (n === 3 && (!state.date || state.time == null)) {
      showError('slot', state.date ? 'Please choose a time.' : 'Please choose a day, then a time.');
      var target = state.date ? $('.slot:not(:disabled)', slotsEl) : $('.day:not(:disabled)', daysEl);
      if (target) target.focus();
      return false;
    }
    if (n === 4) return validateAll(steps[3]);
    return true;
  }

  function go(n, fromNav) {
    state.step = n;
    steps.forEach(function (fs) { fs.hidden = Number(fs.dataset.step) !== n; });
    navItems.forEach(function (li, i) {
      var st = i + 1 < n ? 'done' : i + 1 === n ? 'current' : 'todo';
      li.dataset.state = st;
      if (st === 'current') li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    progress.style.width = (n / steps.length) * 100 + '%';
    prevBtn.hidden = n === 1;
    nextBtn.hidden = n === steps.length;
    submitBtn.hidden = n !== steps.length;
    if (n === 2) renderClinicians();
    if (n === 3) {
      if (!state.date) {
        // Jump to the first week with free days so people don't land on an empty week.
        for (var w = 0; w < WEEKS_AHEAD; w++) {
          state.week = w; renderDays();
          if ($('.day:not(:disabled)', daysEl)) break;
        }
      } else renderDays();
      renderSlots();
    }
    if (n === 5) renderReview();
    if (fromNav !== false) {
      var legend = $('legend', steps[n - 1]);
      legend.setAttribute('tabindex', '-1');
      legend.focus({ preventScroll: true });
      var top = booking.getBoundingClientRect().top + window.scrollY - 110;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }
  }

  nextBtn.addEventListener('click', function () { if (validateStep(state.step)) go(state.step + 1); });
  prevBtn.addEventListener('click', function () { go(state.step - 1); });
  liveValidate(steps[3]);

  booking.addEventListener('submit', function (e) {
    e.preventDefault();
    if (state.step !== steps.length) { if (validateStep(state.step)) go(state.step + 1); return; }
    // To take real bookings, send new FormData(booking) plus `state` to your scheduling system here.
    steps.forEach(function (fs) { fs.hidden = true; });
    $('[data-wizard-nav]', booking).hidden = true;
    var done = $('[data-done]', booking);
    $('[data-done-summary]', booking).textContent = 'Thanks, ' + booking.elements.first.value + '. You asked for ' + svc().name.toLowerCase() +
      ' with ' + clinicianText() + ' on ' + whenText() + '. We’ll confirm by email within one business day.';
    $('[data-done-ref]', booking).textContent = makeRef('BD');
    done.hidden = false;
    navItems.forEach(function (li) { li.dataset.state = 'done'; li.removeAttribute('aria-current'); });
    progress.style.width = '100%';
    done.focus();
  });

  $('[data-restart]', booking).addEventListener('click', function () {
    booking.reset();
    state = { step: 1, service: null, clinician: null, week: 0, date: null, time: null, who: null };
    $('[data-done]', booking).hidden = true;
    $('[data-wizard-nav]', booking).hidden = false;
    updateSummary();
    go(1);
  });

  // Pre-select a treatment from the URL, e.g. appointments.html?service=implant
  var pre = new URLSearchParams(location.search).get('service');
  if (pre && SERVICES.some(function (s) { return s.id === pre; })) {
    booking.querySelector('[name="service"][value="' + pre + '"]').checked = true;
    state.service = pre;
  }
  updateSummary();
  go(1, false);
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

/* ---------- Footer year ----------
   The copyright year in the footer (<span data-year>) is this year, so it never goes stale. */
(function () {
  'use strict';
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
