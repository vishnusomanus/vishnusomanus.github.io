/*
 * Olive & Ember — site scripts (vanilla JS, no dependencies).
 *
 * Contents
 *   1. Opening hours  (edit HOURS and TIMEZONE to change times everywhere: open/closed
 *                      badge, highlighted day, reservation time slots)
 *   2. Header + mobile menu
 *   3. Scroll reveal
 *   4. Tabs + dietary filter (menu page)
 *   5. Forms: validation, reservation time slots, success states
 */
(function () {
  'use strict';

  /* ---------------------------------------------------------------- 1 --- */
  // Opening hours per weekday (0 = Sunday). Times are minutes after midnight.
  // null = closed all day.
  var HOURS = {
    0: { open: 12 * 60, close: 16 * 60 },
    1: null,
    2: { open: 17 * 60, close: 22 * 60 },
    3: { open: 17 * 60, close: 22 * 60 },
    4: { open: 17 * 60, close: 22 * 60 },
    5: { open: 12 * 60, close: 23 * 60 },
    6: { open: 12 * 60, close: 23 * 60 }
  };
  var LAST_SEATING_BEFORE_CLOSE = 90; // minutes
  var SLOT_STEP = 30;                 // minutes between reservation slots
  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // The business's time zone (IANA name). "Open now", today's highlighted row and
  // today's bookable times use the time there, not on the visitor's device.
  var TIMEZONE = 'America/New_York';

  // Current date and time in TIMEZONE:
  // { iso: 'YYYY-MM-DD', day: 0-6 (0 = Sunday), mins: minutes after midnight }.
  function businessNow() {
    var parts = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return {
      iso: parts.year + '-' + parts.month + '-' + parts.day,
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday),
      mins: (+parts.hour % 24) * 60 + +parts.minute
    };
  }

  function formatTime(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    var suffix = h >= 12 ? 'pm' : 'am';
    var h12 = h % 12 || 12;
    return h12 + (m ? ':' + String(m).padStart(2, '0') : '') + suffix;
  }

  function openStatus(now) {
    var day = now.day;
    var mins = now.mins;
    var today = HOURS[day];
    if (today && mins >= today.open && mins < today.close) {
      return { open: true, text: 'Open now · until ' + formatTime(today.close) };
    }
    if (today && mins < today.open) {
      return { open: false, text: 'Closed · opens today at ' + formatTime(today.open) };
    }
    for (var i = 1; i <= 7; i++) {
      var d = (day + i) % 7;
      if (HOURS[d]) {
        var when = i === 1 ? 'tomorrow' : DAY_NAMES[d];
        return { open: false, text: 'Closed · opens ' + when + ' at ' + formatTime(HOURS[d].open) };
      }
    }
    return { open: false, text: 'Closed' };
  }

  function updateOpenStatus() {
    var now = businessNow();
    var status = openStatus(now);
    document.querySelectorAll('[data-open-status]').forEach(function (el) {
      el.dataset.state = status.open ? 'open' : 'closed';
      var text = el.querySelector('[data-open-text]');
      if (text) text.textContent = status.text;
    });
    var today = now.day;
    document.querySelectorAll('[data-day]').forEach(function (row) {
      row.classList.toggle('is-today', row.dataset.day.split(',').indexOf(String(today)) !== -1);
    });
  }
  updateOpenStatus();
  setInterval(updateOpenStatus, 60 * 1000);

  /* ---------------------------------------------------------------- 2 --- */
  var header = document.querySelector('[data-header]');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  var toggle = document.querySelector('[data-nav-toggle]');
  var panel = document.getElementById('mobile-nav');
  function setMenu(open, returnFocus) {
    if (!toggle || !panel) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    panel.hidden = !open;
    document.body.classList.toggle('overflow-hidden', open);
    if (header) header.classList.toggle('is-scrolled', open || window.scrollY > 24);
    if (open) {
      var first = panel.querySelector('a');
      if (first) first.focus();
    } else if (returnFocus) {
      toggle.focus();
    }
  }
  if (toggle && panel) {
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    panel.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') setMenu(false, true);
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------------------------------------------------------------- 3 --- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------------------------------------------------------------- 4 --- */
  document.querySelectorAll('[data-tabs]').forEach(function (root) {
    var tabs = Array.prototype.slice.call(root.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () {
        select(tab);
        history.replaceState(null, '', '#' + tab.getAttribute('aria-controls'));
      });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
    // Open a tab from the URL, e.g. menu.html#drinks
    var fromHash = tabs.filter(function (t) { return '#' + t.getAttribute('aria-controls') === location.hash; })[0];
    select(fromHash || tabs[0]);
  });

  var filterButtons = document.querySelectorAll('[data-diet-filter]');
  var filterStatus = document.querySelector('[data-filter-status]');
  function applyDietFilter(value) {
    var shown = 0;
    document.querySelectorAll('[data-dish]').forEach(function (dish) {
      var diets = (dish.dataset.diet || '').split(' ');
      // Vegan dishes are also vegetarian.
      var match = value === 'all' || diets.indexOf(value) !== -1 || (value === 'v' && diets.indexOf('vg') !== -1);
      dish.hidden = !match;
      if (match) shown++;
    });
    document.querySelectorAll('[data-menu-group]').forEach(function (group) {
      var visible = group.querySelectorAll('[data-dish]:not([hidden])').length;
      group.hidden = visible === 0;
    });
    document.querySelectorAll('[role="tabpanel"]').forEach(function (panelEl) {
      var empty = panelEl.querySelector('[data-empty]');
      if (empty) empty.hidden = panelEl.querySelectorAll('[data-dish]:not([hidden])').length > 0;
    });
    if (filterStatus) {
      filterStatus.textContent = value === 'all' ? 'Showing the full menu.' : 'Showing ' + shown + ' matching dishes and drinks.';
    }
  }
  filterButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      filterButtons.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
      applyDietFilter(btn.dataset.dietFilter);
    });
  });

  /* ---------------------------------------------------------------- 5 --- */
  function todayISO() {
    return businessNow().iso;
  }
  function parseISODate(value) {
    var p = value.split('-');
    return new Date(+p[0], +p[1] - 1, +p[2]);
  }
  // A short reference for the confirmation, like OE-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  function prettyDate(value) {
    return parseISODate(value).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  }

  document.querySelectorAll('input[type="date"][data-min-today]').forEach(function (input) {
    input.min = todayISO();
  });

  // Latest bookable date for fields with data-max-months: today in the restaurant's time zone
  // (like the minimum) plus that many months, as a local YYYY-MM-DD date (31 March + 1 month = 30 April).
  function addMonthsISO(iso, months) {
    var d = parseISODate(iso);
    var target = new Date(d.getFullYear(), d.getMonth() + months, 1);
    var lastDay = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
    target.setDate(Math.min(d.getDate(), lastDay));
    return target.getFullYear() + '-' + String(target.getMonth() + 1).padStart(2, '0') + '-' + String(target.getDate()).padStart(2, '0');
  }
  document.querySelectorAll('input[type="date"][data-max-months]').forEach(function (input) {
    input.max = addMonthsISO(todayISO(), +input.dataset.maxMonths);
  });

  function errorFor(input) {
    if (input.validity.valid) return '';
    if (input.validity.valueMissing) return input.dataset.msgRequired || 'Please fill in this field.';
    if (input.validity.typeMismatch && input.type === 'email') return 'Please enter a valid email address, like name@example.com.';
    if (input.validity.patternMismatch) return input.dataset.msgPattern || 'Please check the format.';
    if (input.validity.rangeUnderflow) return input.dataset.msgMin || 'That value is too low.';
    if (input.validity.rangeOverflow) return input.dataset.msgMax || 'That value is too high.';
    if (input.validity.tooShort) return 'Please enter at least ' + input.minLength + ' characters.';
    if (input.validity.customError) return input.validationMessage;
    return 'Please check this field.';
  }

  function showError(input) {
    var msg = errorFor(input);
    var box = document.getElementById(input.id + '-error');
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (box) {
      box.textContent = msg;
      box.hidden = !msg;
    }
    return !msg;
  }

  // Reservation: the time options depend on the chosen day.
  function setupReservation(form) {
    var date = form.querySelector('[name="date"]');
    var time = form.querySelector('[name="time"]');
    var note = form.querySelector('[data-slot-note]');
    var party = form.querySelector('[name="guests"]');
    var partyNote = form.querySelector('[data-party-note]');
    if (!date || !time) return;

    function fillSlots() {
      time.innerHTML = '';
      date.setCustomValidity('');
      if (!date.value) {
        time.disabled = true;
        time.add(new Option('Choose a date first', ''));
        if (note) note.textContent = 'Times appear once you pick a date.';
        return;
      }
      var chosen = parseISODate(date.value);
      var hours = HOURS[chosen.getDay()];
      if (!hours) {
        date.setCustomValidity('We are closed on ' + DAY_NAMES[chosen.getDay()] + 's. Please choose another day.');
        time.disabled = true;
        time.add(new Option('Closed that day', ''));
        if (note) note.textContent = '';
        return;
      }
      var earliest = hours.open;
      if (date.value === todayISO()) {
        var soon = businessNow().mins + 60;
        earliest = Math.max(earliest, Math.ceil(soon / SLOT_STEP) * SLOT_STEP);
      }
      var last = hours.close - LAST_SEATING_BEFORE_CLOSE;
      time.add(new Option('Select a time', ''));
      for (var m = earliest; m <= last; m += SLOT_STEP) {
        time.add(new Option(formatTime(m), formatTime(m)));
      }
      if (time.options.length === 1) {
        date.setCustomValidity('There are no more tables today. Please choose another day.');
        time.disabled = true;
        time.options[0].text = 'No times left';
        if (note) note.textContent = '';
        return;
      }
      time.disabled = false;
      if (note) {
        note.textContent = DAY_NAMES[chosen.getDay()] + ': kitchen open ' + formatTime(hours.open) + '–' + formatTime(hours.close) +
          '. Last seating ' + formatTime(last) + '.';
      }
    }
    date.addEventListener('change', function () {
      fillSlots();
      if (date.dataset.touched || date.value) showError(date);
    });
    fillSlots();

    if (party && partyNote) {
      party.addEventListener('change', function () { partyNote.hidden = party.value !== '9+'; });
      // "Make another booking" resets the form, and the party size with it.
      form.addEventListener('reset', function () { partyNote.hidden = true; });
    }
  }

  // Character counters for textareas with data-count.
  document.querySelectorAll('textarea[data-count]').forEach(function (area) {
    var out = document.getElementById(area.id + '-count');
    function update() { if (out) out.textContent = area.value.length + ' / ' + area.maxLength; }
    area.addEventListener('input', update);
    // Back to 0 when the form is reset ("Make another booking"); the reset event comes before the values change.
    if (area.form) area.form.addEventListener('reset', function () { setTimeout(update); });
    update();
  });

  // "Inquire about this package" links preselect the package in the events form.
  document.querySelectorAll('[data-package]').forEach(function (link) {
    link.addEventListener('click', function () {
      var select = document.querySelector('[name="package"]');
      if (select) select.value = link.dataset.package;
    });
  });

  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    var fields = form.querySelectorAll('input, select, textarea');
    var success = document.getElementById(form.dataset.success);
    if (form.dataset.validate === 'reservation') setupReservation(form);

    fields.forEach(function (input) {
      input.addEventListener('blur', function () {
        if (input.dataset.touched || input.value) { input.dataset.touched = '1'; showError(input); }
      });
      input.addEventListener('input', function () {
        if (input.getAttribute('aria-invalid') === 'true') showError(input);
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      fields.forEach(function (input) {
        if (input.type === 'submit' || input.type === 'button') return;
        input.dataset.touched = '1';
        if (!showError(input) && !firstInvalid) firstInvalid = input;
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      /*
       * Demo only: nothing is sent anywhere. To receive submissions, post the
       * form to your own endpoint or a service such as Formspree, e.g.
       *   fetch('https://formspree.io/f/YOUR_ID', { method: 'POST', body: new FormData(form),
       *     headers: { Accept: 'application/json' } }).then(showSuccess);
       */
      var data = new FormData(form);
      if (success) {
        data.set('ref', makeRef('OE'));
        success.querySelectorAll('[data-fill]').forEach(function (el) {
          var key = el.dataset.fill;
          var value = data.get(key) || '';
          if (key === 'date' && value) value = prettyDate(value);
          if (key === 'name') value = String(value).split(' ')[0];
          el.textContent = value;
        });
        // "1 guest", "2 guests": a word marked data-count-of agrees with the number it counts.
        success.querySelectorAll('[data-count-of]').forEach(function (el) {
          el.textContent = data.get(el.dataset.countOf) === '1' ? el.dataset.one : el.dataset.other;
        });
        form.hidden = true;
        success.hidden = false;
        var heading = success.querySelector('[tabindex="-1"]');
        if (heading) heading.focus();
      }
    });

    if (success) {
      var again = success.querySelector('[data-reset]');
      if (again) {
        again.addEventListener('click', function () {
          form.reset();
          fields.forEach(function (input) {
            delete input.dataset.touched;
            input.removeAttribute('aria-invalid');
            var box = document.getElementById(input.id + '-error');
            if (box) box.hidden = true;
          });
          if (form.dataset.validate === 'reservation') form.querySelector('[name="date"]').dispatchEvent(new Event('change'));
          success.hidden = true;
          form.hidden = false;
          var first = form.querySelector('input, select, textarea');
          if (first) first.focus();
        });
      }
    }
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
