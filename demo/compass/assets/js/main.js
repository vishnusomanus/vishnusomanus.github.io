/* Compass (Bearing Leadership Coaching) — site scripts. Vanilla JavaScript, no dependencies. */
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

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Programs ----------
     Used by the self-check result and the "Recommended for you" badge on programs.html.
     Keep names and prices in step with programs.html. */
  var PROGRAMS = {
    foundations: { name: 'Foundations 1:1', price: '$2,400 for 3 months', url: 'programs.html#one-to-one', summary: 'Six private sessions over three months, built around one or two skills that will change your week.' },
    executive: { name: 'Executive 1:1', price: '$7,800 for 6 months', url: 'programs.html#one-to-one', summary: 'Twelve private sessions, 360° interviews with your team and peers, and support between sessions.' },
    cohort: { name: 'First 90 Days cohort', price: '$1,450 per person', url: 'programs.html#cohort', summary: 'Eight weeks with seven other new managers: live group sessions, peer practice and two private calls.' },
    teams: { name: 'Team workshops', price: 'From $2,900 per half day', url: 'programs.html#teams', summary: 'A half-day or full-day workshop for your team, designed around the real decisions and conversations you face.' }
  };

  /* ---------- First 90 Days cohort dates ([data-cohort]) ----------
     Cohorts start on the second Wednesday of January, April, July and October. With COHORT_DATES = null
     the demo shows rolling dates: the first start at least COHORT_MIN_WEEKS weeks away (time to fill the
     seats) and the one after it, so it never advertises a cohort that has started. For your real dates,
     set them as 'YYYY-MM-DD': { next: '2027-01-13', after: '2027-04-14' }. */
  var COHORT_DATES = null;
  var COHORT_MIN_WEEKS = 6;

  /* ---------- Leadership self-check (resources.html) ----------
     Each answer points to one result type. The type with the most answers wins;
     ties go to the type listed first in QUIZ_RESULTS. */
  var QUIZ_QUESTIONS = [
    { q: 'It is 6pm on a Thursday. What are you most likely doing?', a: [
      ['Fixing a piece of work someone on my team got nearly right.', 'doer'],
      ['Rehearsing a conversation I have been putting off for weeks.', 'pleaser'],
      ['Still in back-to-back calls; my real work starts after dinner.', 'firefighter'],
      ['Re-explaining a decision the team seemed to agree on last week.', 'island']] },
    { q: 'Which sentence would your team most likely use about you?', a: [
      ['“Brilliant, but it is quicker to let them do it.”', 'doer'],
      ['“Really kind. I am never quite sure where I stand.”', 'pleaser'],
      ['“Always available, always busy.”', 'firefighter'],
      ['“Has a plan, but I am not sure it is our plan.”', 'island']] },
    { q: 'A project is slipping. Your first instinct is to…', a: [
      ['Roll up my sleeves and do the hard part myself.', 'doer'],
      ['Wait a little longer before raising it with the owner.', 'pleaser'],
      ['Jump straight in, alongside the four other fires.', 'firefighter'],
      ['Wonder why nobody flagged it earlier.', 'island']] },
    { q: 'What would most improve your next quarter?', a: [
      ['Handing off two things I still own from my old role.', 'doer'],
      ['Having the feedback conversations I keep softening.', 'pleaser'],
      ['Protected time each week to think beyond this sprint.', 'firefighter'],
      ['A team that pulls in the same direction without me.', 'island']] },
    { q: 'How do your one-to-ones usually go?', a: [
      ['Mostly status updates and me answering questions.', 'doer'],
      ['Friendly. We rarely get to the difficult topics.', 'pleaser'],
      ['Often moved or canceled when something urgent lands.', 'firefighter'],
      ['Useful, but what we agree rarely spreads to the wider team.', 'island']] },
    { q: 'Be honest: what keeps you up at night?', a: [
      ['If I stop checking everything, quality will drop.', 'doer'],
      ['Someone on my team is struggling and I have not said so.', 'pleaser'],
      ['I am busy all day and still behind on what matters.', 'firefighter'],
      ['I am the only one who sees the whole picture.', 'island']] }
  ];
  var QUIZ_RESULTS = {
    doer: { name: 'The Expert Doer', lead: 'You were promoted for being excellent at the work, and you are still doing a lot of it.', body: 'Your standards are your strength, but holding on to the work caps how far your team can grow, and how much of you is left at the end of the week. The shift is from doing the work to designing how it gets done.', steps: ['List everything you did last week that someone else could own.', 'Pick one task and hand it over with the outcome, not the method.', 'Agree a check-in point instead of checking the work as it happens.'], program: 'foundations', article: 'article.html' },
    pleaser: { name: 'The Peacekeeper', lead: 'People love working for you. The hard conversations are another story.', body: 'Warmth is a leadership superpower, but feedback that never arrives is not kind: it leaves people guessing and lets small problems grow. The shift is learning to be clear and kind at the same time.', steps: ['Write down the one conversation you have been postponing.', 'Use the observation, impact, request structure to plan it in five lines.', 'Have it this week, ideally in your next one-to-one.'], program: 'cohort', article: 'article.html' },
    firefighter: { name: 'The Firefighter', lead: 'You are the person everything routes through, and your calendar shows it.', body: 'Being needed feels productive, but a leader with no time to think ends up reacting to the quarter instead of shaping it. The shift is from being available to being deliberate with your attention.', steps: ['Audit last week’s calendar: mark each meeting decide, inform or habit.', 'Cancel or delegate two of the habit meetings.', 'Block two 90-minute thinking sessions and treat them like client calls.'], program: 'executive', article: 'article.html' },
    island: { name: 'The Lone Navigator', lead: 'You can see where things need to go. The team is not always coming with you.', body: 'Clarity in your own head is not the same as alignment in the room. Decisions that are not shared, written down and revisited quietly unravel. The shift is from having the plan to building it together.', steps: ['Write your team’s top three priorities in one sentence each.', 'Ask each person to rank them; compare the answers.', 'Run one meeting where the only goal is a decision everyone can repeat.'], program: 'teams', article: 'article.html' }
  };
  var QUIZ_KEY = 'compass-quiz-v1';

  /* ---------- Booking (book.html) ----------
     Call types and availability rules. Slots are generated in the studio's time zone and
     shown in the visitor's own zone. Nothing is booked: see DOCS.md, "Booking flow", to
     connect Cal.com, Calendly or a form service. */
  var CALL_TYPES = {
    intro: { label: 'Free intro call', minutes: 20, price: 'Free', where: 'Video call' },
    strategy: { label: 'Strategy session', minutes: 60, price: '$180', where: 'Video call or the Pittsburgh studio' },
    team: { label: 'Team workshop discovery', minutes: 30, price: 'Free', where: 'Video call' }
  };
  var AVAILABILITY = {
    timeZone: 'America/New_York',
    zoneName: 'Eastern Time',
    // Day 0 is Sunday. Each window is [start, end] in 24-hour "HH:MM" studio time.
    hours: {
      1: [['09:00', '12:00'], ['13:30', '17:00']],
      2: [['09:00', '12:00'], ['13:30', '17:00']],
      3: [['11:00', '13:00'], ['14:00', '19:00']],
      4: [['09:00', '12:00'], ['13:30', '17:00']],
      5: [['09:00', '12:30']]
    },
    slotStep: 30,          // minutes between start times
    minNoticeHours: 24,    // earliest bookable slot from now
    daysAhead: 45,         // how far ahead people can book
    closed: ['2026-11-26', '2026-11-27', '2026-12-24', '2026-12-25', '2026-12-31', '2027-01-01'],
    demoBusyShare: 0.35    // share of slots shown as already taken, so the demo looks realistic. Set to 0 when connected.
  };

  /* ---------- Small helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function readJSON(key) { try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; } }
  function writeJSON(key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
  function removeKey(key) { try { safeStorage.removeItem(key); } catch (e) {} }
  // A short reference for confirmations, like BL-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  var ICON = {
    check: '<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
    alert: '<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16v.01"/></svg>',
    arrow: '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  /* ---------- Header: border on scroll + mobile menu ---------- */
  var header = document.getElementById('site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  var menuBtn = document.getElementById('menu-button');
  var menu = document.getElementById('mobile-menu');
  if (menuBtn && menu) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('hidden', !open);
      $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
      $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
    };
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- Scroll reveal ----------
     .reveal fades in. Everything above an element that becomes visible is revealed too,
     so fast jumps (End key, anchors) never leave hidden content behind. */
  var reveals = $$('.reveal, .spin-in');
  function revealAll() { reveals.forEach(function (el) { el.classList.add('is-visible'); }); }
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = reveals.indexOf(entry.target);
        reveals.slice(0, index + 1).forEach(function (el) { el.classList.add('is-visible'); io.unobserve(el); });
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up numbers ([data-count], optional data-decimals) ---------- */
  var counters = $$('[data-count]');
  if (counters.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
    var countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target, end = parseFloat(el.getAttribute('data-count')), dec = parseInt(el.getAttribute('data-decimals') || '0', 10);
        countIo.unobserve(el);
        var start = null, dur = 1400;
        var step = function (t) {
          if (start === null) start = t;
          var p = Math.min(1, (t - start) / dur), eased = 1 - Math.pow(1 - p, 3);
          el.textContent = (end * eased).toFixed(dec);
          if (p < 1) window.requestAnimationFrame(step);
        };
        window.requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { countIo.observe(el); });
  }

  /* ---------- Testimonial carousel ([data-carousel]) ----------
     A native scroll-snap track (swipe, trackpad and arrow keys work) with prev/next buttons. */
  $$('[data-carousel]').forEach(function (root) {
    var track = $('ul', root);
    var section = root.closest('section') || document;
    var prev = $('[data-carousel-prev]', section), next = $('[data-carousel-next]', section), status = $('[data-carousel-status]', section);
    var slides = $$(':scope > li', track);
    function step() { return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth; }
    function update() {
      var i = Math.round(track.scrollLeft / step());
      var max = track.scrollWidth - track.clientWidth - 2;
      var perView = Math.max(1, Math.round(track.clientWidth / step()));
      if (track.scrollLeft >= max) i = slides.length - perView;
      if (status) status.textContent = (i + 1) + ' / ' + slides.length;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    function go(dir) { track.scrollBy({ left: dir * step(), behavior: reduceMotion.matches ? 'auto' : 'smooth' }); }
    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Accordion (.acc-btn controls the panel named in aria-controls) ---------- */
  $$('.acc-btn').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    });
  });

  /* ---------- Tabs ([role=tablist]) with arrow-key navigation ---------- */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      list.dispatchEvent(new CustomEvent('tabchange', { detail: { tab: tab } }));
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
        else if (e.key === 'Home') n = tabs[0];
        else if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    list._select = select;
  });

  /* ---------- Compass diagram (method.html) ----------
     The needle turns to the selected point; clicking a point in the drawing selects its tab. */
  var compass = $('[data-compass]');
  if (compass) {
    var needle = $('.needle', compass);
    var tablist = $('[data-compass-tabs]');
    var ANGLES = { north: 0, east: 90, south: 180, west: 270 };
    var turn = 0;
    var setPoint = function (point) {
      // Always turn the shortest way round.
      var target = ANGLES[point], current = ((turn % 360) + 360) % 360, delta = target - current;
      if (delta > 180) delta -= 360;
      if (delta < -180) delta += 360;
      turn += delta;
      if (needle) needle.style.transform = 'rotate(' + turn + 'deg)';
      $$('[data-point]', compass).forEach(function (g) { g.classList.toggle('is-active', g.getAttribute('data-point') === point); });
    };
    if (tablist) {
      tablist.addEventListener('tabchange', function (e) { setPoint(e.detail.tab.getAttribute('data-point-tab')); });
      $$('[data-point]', compass).forEach(function (g) {
        g.addEventListener('click', function () {
          var tab = $('[data-point-tab="' + g.getAttribute('data-point') + '"]', tablist);
          if (tab && tablist._select) tablist._select(tab, true);
        });
      });
    }
    setPoint('north');
  }

  /* ---------- Filters ([data-filter-root]) ----------
     Chips with data-filter="value" show items whose data-tags contain the value ("all" shows everything).
     The choice is kept in the URL (?type= or the root's data-filter-param) so it can be shared. */
  $$('[data-filter-root]').forEach(function (root) {
    var param = root.getAttribute('data-filter-param') || 'type';
    var chips = $$('[data-filter]', root);
    var items = $$('[data-tags]', root);
    var count = $('[data-filter-count]', root);
    var empty = $('[data-filter-empty]', root);
    var noun = root.getAttribute('data-filter-noun') || 'item';
    var plural = root.getAttribute('data-filter-plural') || noun + 's';
    chips.forEach(function (chip) {
      var v = chip.getAttribute('data-filter');
      var n = v === 'all' ? items.length : items.filter(function (it) { return it.getAttribute('data-tags').split(' ').indexOf(v) !== -1; }).length;
      var c = $('.chip-count', chip);
      if (c) c.textContent = n;
    });
    function apply(value, push) {
      if (!chips.some(function (c) { return c.getAttribute('data-filter') === value; })) value = 'all';
      var shown = 0;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === value)); });
      items.forEach(function (it) {
        var ok = value === 'all' || it.getAttribute('data-tags').split(' ').indexOf(value) !== -1;
        it.hidden = !ok;
        if (ok) shown++;
      });
      if (count) count.textContent = shown + ' ' + (shown === 1 ? noun : plural);
      if (empty) empty.hidden = shown !== 0;
      if (push && window.history && history.replaceState) {
        var url = new URL(window.location.href);
        if (value === 'all') url.searchParams.delete(param); else url.searchParams.set(param, value);
        history.replaceState(null, '', url.pathname + url.search + url.hash);
      }
    }
    chips.forEach(function (chip) { chip.addEventListener('click', function () { apply(chip.getAttribute('data-filter'), true); }); });
    $$('[data-filter-reset]', root).forEach(function (b) { b.addEventListener('click', function () { apply('all', true); chips[0].focus(); }); });
    apply(new URLSearchParams(window.location.search).get(param) || 'all', false);
  });

  /* ---------- Form validation ----------
     Fields with data-validate are checked on submit and again as the visitor fixes them.
     Values: required, email, phone-optional, message (20+ characters), consent (checkbox). */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function fieldMessage(field) {
    var type = field.getAttribute('data-validate');
    var v = (field.value || '').trim();
    if (field.type === 'checkbox') return field.required && !field.checked ? 'Please check this box to continue.' : '';
    if (field.required && !v) return field.tagName === 'SELECT' ? 'Please choose an option.' : 'Please fill in this field.';
    if (type === 'email' && v && !EMAIL.test(v)) return 'Please enter an email address like name@company.example.';
    if (type === 'phone-optional' && v && v.replace(/\D/g, '').length < 7) return 'Please enter a phone number we can call, or leave it blank.';
    if (type === 'message' && v.length < 20) return 'A sentence or two (20+ characters) helps me prepare.';
    return '';
  }
  function showError(field, msg) {
    var id = field.id + '-error';
    var err = document.getElementById(id);
    var wrap = field.closest('[data-field]') || field.parentNode;
    if (msg) {
      if (!err) {
        err = document.createElement('p');
        err.id = id;
        err.className = 'field-error';
        wrap.appendChild(err);
      }
      err.innerHTML = ICON.alert + '<span>' + esc(msg) + '</span>';
      field.setAttribute('aria-invalid', 'true');
      var described = (field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      if (described.indexOf(id) === -1) described.push(id);
      field.setAttribute('aria-describedby', described.join(' '));
    } else {
      if (err) err.remove();
      field.removeAttribute('aria-invalid');
      var rest = (field.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== id; });
      if (rest.length) field.setAttribute('aria-describedby', rest.join(' ')); else field.removeAttribute('aria-describedby');
    }
  }
  function validateForm(form) {
    var first = null;
    $$('[data-validate]', form).forEach(function (field) {
      var msg = fieldMessage(field);
      showError(field, msg);
      if (msg && !first) first = field;
    });
    if (first) first.focus();
    return !first;
  }
  function liveValidate(form) {
    $$('[data-validate]', form).forEach(function (field) {
      var evt = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'input';
      field.addEventListener(evt, function () { if (field.getAttribute('aria-invalid') === 'true') showError(field, fieldMessage(field)); });
      field.addEventListener('blur', function () { if (field.getAttribute('aria-invalid') === 'true') showError(field, fieldMessage(field)); });
    });
  }

  /* Guide sign-up and contact forms: validate, then swap the form for its success panel.
     Demo only: nothing is sent. To send for real, replace the marked block with a fetch()
     to your form service (see DOCS.md, "Forms"). */
  $$('[data-guide-form], [data-contact-form]').forEach(function (form) {
    var success = form.parentNode.querySelector('[data-success]');
    liveValidate(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      /* --- Connect a real endpoint here, e.g.:
         fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      --- */
      var name = (form.elements.name && form.elements.name.value.trim().split(' ')[0]) || '';
      var text = success && $('[data-success-text]', success);
      if (text) text.textContent = form.hasAttribute('data-guide-form')
        ? 'Thanks' + (name ? ', ' + name : '') + '. You’re on the list.'
        : 'Thanks' + (name ? ', ' + name : '') + '. Your message has reached me.';
      var ref = success && $('[data-success-ref]', success);
      if (ref) ref.textContent = makeRef('BL');
      form.hidden = true;
      if (success) { success.classList.remove('hidden'); success.focus(); }
    });
    if (success) {
      var reset = $('[data-success-reset]', success);
      if (reset) reset.addEventListener('click', function () {
        form.reset();
        form.hidden = false;
        success.classList.add('hidden');
        var f = $('input, select, textarea', form);
        if (f) f.focus();
      });
    }
  });

  /* ---------- Saved self-check result ----------
     Stored as { answers: [index, ...], date: "YYYY-MM-DD" }. The result is always recomputed
     from the answers, and anything malformed is ignored. */
  function scoreQuiz(answers) {
    var tally = {};
    Object.keys(QUIZ_RESULTS).forEach(function (k) { tally[k] = 0; });
    answers.forEach(function (a, i) { tally[QUIZ_QUESTIONS[i].a[a][1]]++; });
    var best = null;
    Object.keys(QUIZ_RESULTS).forEach(function (k) { if (best === null || tally[k] > tally[best]) best = k; });
    return { type: best, tally: tally };
  }
  function readQuiz() {
    var raw = readJSON(QUIZ_KEY);
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.answers) || raw.answers.length !== QUIZ_QUESTIONS.length) return null;
    var ok = raw.answers.every(function (a, i) { return typeof a === 'number' && a % 1 === 0 && a >= 0 && a < QUIZ_QUESTIONS[i].a.length; });
    if (!ok) return null;
    return { answers: raw.answers.slice(), date: typeof raw.date === 'string' ? raw.date : '' };
  }

  /* "Recommended for you" badge on programs.html */
  var saved = readQuiz();
  if (saved) {
    var rec = QUIZ_RESULTS[scoreQuiz(saved.answers).type].program;
    $$('[data-program="' + rec + '"] [data-recommended]').forEach(function (b) { b.hidden = false; });
  }

  /* ---------- Self-check quiz ([data-quiz]) ---------- */
  var quiz = $('[data-quiz]');
  if (quiz) {
    var qIntro = $('[data-quiz-intro]', quiz), qRun = $('[data-quiz-run]', quiz), qResult = $('[data-quiz-result]', quiz);
    var answers = [];
    var current = 0;

    var showView = function (view) {
      [qIntro, qRun, qResult].forEach(function (v) { v.hidden = v !== view; });
    };
    var renderQuestion = function (focusLegend) {
      var item = QUIZ_QUESTIONS[current];
      var letters = 'ABCD';
      $('[data-quiz-progress]', quiz).style.width = ((current) / QUIZ_QUESTIONS.length * 100) + '%';
      $('[data-quiz-count]', quiz).textContent = 'Question ' + (current + 1) + ' of ' + QUIZ_QUESTIONS.length;
      var html = '<legend class="font-serif text-2xl leading-snug text-dusk-950 sm:text-[1.7rem]" tabindex="-1" data-quiz-legend>' + esc(item.q) + '</legend><div class="mt-6 grid gap-3">';
      item.a.forEach(function (ans, i) {
        html += '<label class="quiz-option"><input type="radio" class="sr-only" name="quiz-q" value="' + i + '"' + (answers[current] === i ? ' checked' : '') + '><span class="quiz-letter" aria-hidden="true">' + letters[i] + '</span><span class="pt-1 leading-snug">' + esc(ans[0]) + '</span></label>';
      });
      html += '</div>';
      $('[data-quiz-fieldset]', quiz).innerHTML = html;
      $('[data-quiz-back]', quiz).disabled = current === 0;
      $('[data-quiz-next]', quiz).innerHTML = (current === QUIZ_QUESTIONS.length - 1 ? 'See my result' : 'Next question') + ICON.arrow;
      $('[data-quiz-error]', quiz).hidden = true;
      if (focusLegend) $('[data-quiz-legend]', quiz).focus();
    };
    var renderResult = function (data, focus) {
      var scored = scoreQuiz(data.answers);
      var r = QUIZ_RESULTS[scored.type], p = PROGRAMS[r.program];
      $('[data-quiz-name]', quiz).textContent = r.name;
      $('[data-quiz-lead]', quiz).textContent = r.lead;
      $('[data-quiz-body]', quiz).textContent = r.body;
      $('[data-quiz-steps]', quiz).innerHTML = r.steps.map(function (s) { return '<li class="flex gap-3"><span class="mt-0.5 grid size-6 shrink-0 place-items-center rounded-full bg-marigold-300 text-dusk-950">' + ICON.check + '</span><span>' + esc(s) + '</span></li>'; }).join('');
      $('[data-quiz-bars]', quiz).innerHTML = Object.keys(QUIZ_RESULTS).map(function (k) {
        var n = scored.tally[k], pct = Math.round(n / QUIZ_QUESTIONS.length * 100);
        return '<div><div class="flex justify-between text-sm"><span class="' + (k === scored.type ? 'font-semibold text-dusk-950' : 'text-stone-700') + '">' + esc(QUIZ_RESULTS[k].name) + '</span><span class="text-stone-600 tabular-nums">' + n + ' of ' + QUIZ_QUESTIONS.length + '</span></div><div class="mt-1.5 h-2 overflow-hidden rounded-full bg-linen-100"><div class="h-full rounded-full ' + (k === scored.type ? 'bg-dusk-700' : 'bg-linen-300') + '" style="width:' + pct + '%"></div></div></div>';
      }).join('');
      $('[data-quiz-program]', quiz).textContent = p.name;
      $('[data-quiz-program-summary]', quiz).textContent = p.summary;
      $('[data-quiz-program-price]', quiz).textContent = p.price;
      $('[data-quiz-program-link]', quiz).setAttribute('href', p.url);
      $('[data-quiz-date]', quiz).textContent = data.date ? 'Saved on this device on ' + new Date(data.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) + '.' : '';
      showView(qResult);
      if (focus) $('[data-quiz-result-heading]', quiz).focus();
    };
    var start = function () {
      answers = [];
      current = 0;
      showView(qRun);
      renderQuestion(true);
    };

    $('[data-quiz-start]', quiz).addEventListener('click', start);
    $('[data-quiz-retake]', quiz).addEventListener('click', function () { removeKey(QUIZ_KEY); start(); });
    $('[data-quiz-back]', quiz).addEventListener('click', function () { if (current > 0) { current--; renderQuestion(true); } });
    $('[data-quiz-form]', quiz).addEventListener('change', function (e) {
      if (e.target.name === 'quiz-q') { answers[current] = parseInt(e.target.value, 10); $('[data-quiz-error]', quiz).hidden = true; }
    });
    $('[data-quiz-form]', quiz).addEventListener('submit', function (e) {
      e.preventDefault();
      if (typeof answers[current] !== 'number') {
        $('[data-quiz-error]', quiz).hidden = false;
        var first = $('input[name="quiz-q"]', quiz);
        if (first) first.focus();
        return;
      }
      if (current < QUIZ_QUESTIONS.length - 1) { current++; renderQuestion(true); return; }
      var d = new Date();
      var data = { answers: answers.slice(), date: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0') };
      writeJSON(QUIZ_KEY, data);
      renderResult(data, true);
    });

    var stored = readQuiz();
    if (stored) renderResult(stored, false); else showView(qIntro);
  }

  /* ---------- Booking flow ([data-booking]) ---------- */
  var booking = $('[data-booking]');
  if (booking) initBooking(booking);

  function initBooking(root) {
    var visitorZone = (Intl.DateTimeFormat().resolvedOptions().timeZone) || AVAILABILITY.timeZone;
    var state = { type: 'intro', date: null, slot: null, zone: visitorZone, step: 1, month: null, focusDate: null };
    var steps = $$('[data-step]', root);
    var indicators = $$('[data-step-indicator]', root);

    /* Time-zone math: the offset of a zone at an instant, and studio wall time -> instant. */
    function partsIn(date, zone) {
      var out = {};
      new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
        .formatToParts(date).forEach(function (p) { if (p.type !== 'literal') out[p.type] = parseInt(p.value, 10); });
      if (out.hour === 24) out.hour = 0;
      return out;
    }
    function offsetMs(date, zone) {
      var p = partsIn(date, zone);
      return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(date.getTime() / 1000) * 1000;
    }
    function studioToInstant(key, hhmm) {
      var d = key.split('-').map(Number), t = hhmm.split(':').map(Number);
      var guess = Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1]);
      var off = offsetMs(new Date(guess), AVAILABILITY.timeZone);
      var res = guess - off;
      var off2 = offsetMs(new Date(res), AVAILABILITY.timeZone);
      return new Date(off2 === off ? res : guess - off2);
    }
    function keyOf(y, m, d) { return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); }
    function addDays(key, n) {
      var d = key.split('-').map(Number), x = new Date(Date.UTC(d[0], d[1] - 1, d[2] + n));
      return keyOf(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate());
    }
    function weekday(key) { var d = key.split('-').map(Number); return new Date(Date.UTC(d[0], d[1] - 1, d[2])).getUTCDay(); }
    function longDate(key) {
      var d = key.split('-').map(Number);
      return new Date(Date.UTC(d[0], d[1] - 1, d[2], 12)).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    }
    function timeIn(date, zone) { return date.toLocaleTimeString('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit' }); }
    function dateIn(date, zone) { var p = partsIn(date, zone); return keyOf(p.year, p.month, p.day); }
    function zoneLabel(zone) {
      if (zone === AVAILABILITY.timeZone) return AVAILABILITY.zoneName + ' (studio)';
      var short = '';
      try { short = new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' }).formatToParts(new Date()).filter(function (p) { return p.type === 'timeZoneName'; })[0].value; } catch (e) {}
      return zone.replace(/_/g, ' ') + (short ? ' (' + short + ')' : '');
    }

    var now = new Date();
    var todayParts = partsIn(now, AVAILABILITY.timeZone);
    var today = keyOf(todayParts.year, todayParts.month, todayParts.day);
    var lastDay = addDays(today, AVAILABILITY.daysAhead);

    // A stable pseudo-random number per slot, so "taken" slots don't change between renders.
    function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }

    function slotsFor(key) {
      if (key < today || key > lastDay || AVAILABILITY.closed.indexOf(key) !== -1) return [];
      var windows = AVAILABILITY.hours[weekday(key)] || [];
      var len = CALL_TYPES[state.type].minutes, out = [];
      var earliest = now.getTime() + AVAILABILITY.minNoticeHours * 3600000;
      windows.forEach(function (w) {
        var s = w[0].split(':').map(Number), e = w[1].split(':').map(Number);
        for (var m = s[0] * 60 + s[1]; m + len <= e[0] * 60 + e[1]; m += AVAILABILITY.slotStep) {
          var hhmm = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
          var at = studioToInstant(key, hhmm);
          if (at.getTime() < earliest) continue;
          if (hash(key + hhmm) < AVAILABILITY.demoBusyShare) continue;
          out.push({ time: hhmm, at: at });
        }
      });
      return out;
    }

    /* Summary sidebar */
    function renderSummary() {
      var t = CALL_TYPES[state.type];
      $('[data-sum-type]', root).textContent = t.label;
      $('[data-sum-meta]', root).textContent = t.minutes + ' minutes · ' + t.price + ' · ' + t.where;
      var when = $('[data-sum-when]', root), zone = $('[data-sum-zone]', root);
      if (state.slot) {
        when.textContent = longDate(state.date) + ', ' + timeIn(state.slot.at, state.zone);
        zone.textContent = state.zone === AVAILABILITY.timeZone ? AVAILABILITY.zoneName : zoneLabel(state.zone) + ' · ' + timeIn(state.slot.at, AVAILABILITY.timeZone) + ' in Pittsburgh';
      } else if (state.date) {
        when.textContent = longDate(state.date) + ', pick a time';
        zone.textContent = '';
      } else {
        when.textContent = 'Not chosen yet';
        zone.textContent = '';
      }
    }

    /* Steps */
    function goTo(n) {
      state.step = n;
      steps.forEach(function (s) { s.hidden = Number(s.getAttribute('data-step')) !== n; });
      indicators.forEach(function (ind) {
        var i = Number(ind.getAttribute('data-step-indicator'));
        if (i === n) ind.setAttribute('aria-current', 'step'); else ind.removeAttribute('aria-current');
        if (i < n) ind.setAttribute('data-done', ''); else ind.removeAttribute('data-done');
      });
      var h = $('[data-step="' + n + '"] h2', root);
      if (h) h.focus({ preventScroll: true });
      var top = root.getBoundingClientRect().top + window.scrollY - 110;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'auto' });
    }

    /* Step 1: call type */
    var typeFromUrl = new URLSearchParams(window.location.search).get('type');
    if (typeFromUrl && CALL_TYPES.hasOwnProperty(typeFromUrl)) state.type = typeFromUrl;
    $$('input[name="call-type"]', root).forEach(function (r) {
      r.checked = r.value === state.type;
      r.addEventListener('change', function () {
        state.type = r.value;
        state.slot = null;
        renderSummary();
      });
    });
    $('[data-next="2"]', root).addEventListener('click', function () {
      if (state.date && !slotsFor(state.date).length) state.date = null;
      renderCalendar(false);
      renderSlots();
      goTo(2);
    });

    /* Step 2: calendar + slots */
    var calGrid = $('[data-cal-grid]', root), calLabel = $('[data-cal-month]', root);
    var prevBtn = $('[data-cal-prev]', root), nextBtn = $('[data-cal-next]', root);
    function monthOf(key) { return key.slice(0, 7); }
    function firstAvailable() {
      for (var k = today; k <= lastDay; k = addDays(k, 1)) if (slotsFor(k).length) return k;
      return today;
    }
    function renderCalendar(focus) {
      if (!state.focusDate) state.focusDate = state.date || firstAvailable();
      if (!state.month) state.month = monthOf(state.focusDate);
      var ym = state.month.split('-').map(Number);
      var first = keyOf(ym[0], ym[1], 1);
      var daysInMonth = new Date(Date.UTC(ym[0], ym[1], 0)).getUTCDate();
      var lead = (weekday(first) + 6) % 7; // Monday first
      calLabel.textContent = new Date(Date.UTC(ym[0], ym[1] - 1, 1, 12)).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' });
      prevBtn.disabled = state.month <= monthOf(today);
      nextBtn.disabled = state.month >= monthOf(lastDay);
      if (monthOf(state.focusDate) !== state.month) {
        // Keep the roving focus inside the visible month.
        var k = first, pick = null;
        for (var d = 1; d <= daysInMonth; d++) { k = keyOf(ym[0], ym[1], d); if (k >= today && k <= lastDay) { if (!pick) pick = k; if (slotsFor(k).length) { pick = k; break; } } }
        state.focusDate = pick || first;
      }
      var html = '<tr>', cell = 0;
      for (var i = 0; i < lead; i++, cell++) html += '<td></td>';
      for (var day = 1; day <= daysInMonth; day++, cell++) {
        if (cell && cell % 7 === 0) html += '</tr><tr>';
        var key = keyOf(ym[0], ym[1], day);
        var n = slotsFor(key).length;
        var inRange = key >= today && key <= lastDay;
        var label = longDate(key) + (n ? ', ' + n + ' time' + (n === 1 ? '' : 's') + ' available' : ', unavailable');
        html += '<td class="p-0.5"><button type="button" class="cal-day" data-date="' + key + '"' +
          (n ? ' data-available' : ' aria-disabled="true"') +
          (key === today ? ' data-today aria-current="date"' : '') +
          ' aria-pressed="' + (key === state.date) + '"' +
          ' tabindex="' + (key === state.focusDate ? 0 : -1) + '"' +
          (inRange ? '' : ' data-out') +
          ' aria-label="' + esc(label) + '">' + day + '</button></td>';
      }
      while (cell % 7 !== 0) { html += '<td></td>'; cell++; }
      calGrid.innerHTML = html + '</tr>';
      if (focus) { var b = $('[data-date="' + state.focusDate + '"]', calGrid); if (b) b.focus(); }
    }
    function moveFocus(key) {
      if (key < today) key = today;
      if (key > lastDay) key = lastDay;
      state.focusDate = key;
      state.month = monthOf(key);
      renderCalendar(true);
    }
    prevBtn.addEventListener('click', function () {
      var ym = state.month.split('-').map(Number); var d = new Date(Date.UTC(ym[0], ym[1] - 2, 1));
      state.month = keyOf(d.getUTCFullYear(), d.getUTCMonth() + 1, 1).slice(0, 7); renderCalendar(false);
    });
    nextBtn.addEventListener('click', function () {
      var ym = state.month.split('-').map(Number); var d = new Date(Date.UTC(ym[0], ym[1], 1));
      state.month = keyOf(d.getUTCFullYear(), d.getUTCMonth() + 1, 1).slice(0, 7); renderCalendar(false);
    });
    calGrid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-date]');
      if (!b || b.getAttribute('aria-disabled') === 'true') return;
      state.date = b.getAttribute('data-date');
      state.focusDate = state.date;
      state.slot = null;
      renderCalendar(true);
      renderSlots();
      renderSummary();
    });
    calGrid.addEventListener('keydown', function (e) {
      var b = e.target.closest('[data-date]');
      if (!b) return;
      var key = b.getAttribute('data-date'), wd = (weekday(key) + 6) % 7, to = null;
      switch (e.key) {
        case 'ArrowLeft': to = addDays(key, -1); break;
        case 'ArrowRight': to = addDays(key, 1); break;
        case 'ArrowUp': to = addDays(key, -7); break;
        case 'ArrowDown': to = addDays(key, 7); break;
        case 'Home': to = addDays(key, -wd); break;
        case 'End': to = addDays(key, 6 - wd); break;
        case 'PageUp': to = addDays(key, -28); break;
        case 'PageDown': to = addDays(key, 28); break;
      }
      if (to) { e.preventDefault(); moveFocus(to); }
    });

    var zoneSelect = $('[data-zone]', root);
    var zones = [visitorZone];
    if (visitorZone !== AVAILABILITY.timeZone) zones.push(AVAILABILITY.timeZone);
    zoneSelect.innerHTML = zones.map(function (z) { return '<option value="' + esc(z) + '">' + esc(zoneLabel(z) + (z === visitorZone && z !== AVAILABILITY.timeZone ? ', your time' : '')) + '</option>'; }).join('');
    zoneSelect.addEventListener('change', function () { state.zone = zoneSelect.value; renderSlots(); renderSummary(); });

    function renderSlots() {
      var list = $('[data-slots]', root), heading = $('[data-slots-heading]', root), empty = $('[data-slots-empty]', root);
      $('[data-slot-error]', root).hidden = true;
      if (!state.date) {
        heading.textContent = 'Choose a date to see times';
        list.innerHTML = '';
        empty.hidden = false;
        return;
      }
      var slots = slotsFor(state.date);
      heading.textContent = longDate(state.date);
      empty.hidden = slots.length !== 0;
      list.innerHTML = slots.map(function (s) {
        var shift = dateIn(s.at, state.zone) !== state.date ? (dateIn(s.at, state.zone) > state.date ? ' (+1 day)' : ' (−1 day)') : '';
        var studio = state.zone !== AVAILABILITY.timeZone ? '<span class="slot-sub">' + esc(timeIn(s.at, AVAILABILITY.timeZone)) + ' in Pittsburgh</span>' : '';
        return '<label class="slot"><input type="radio" class="sr-only" name="slot" value="' + s.time + '"' + (state.slot && state.slot.time === s.time ? ' checked' : '') + '><span>' + esc(timeIn(s.at, state.zone)) + esc(shift) + '</span>' + studio + '</label>';
      }).join('');
      $$('input[name="slot"]', list).forEach(function (r) {
        r.addEventListener('change', function () {
          state.slot = slots.filter(function (s) { return s.time === r.value; })[0];
          $('[data-slot-error]', root).hidden = true;
          renderSummary();
        });
      });
    }
    $('[data-back="1"]', root).addEventListener('click', function () { goTo(1); });
    $('[data-next="3"]', root).addEventListener('click', function () {
      if (!state.slot) {
        var err = $('[data-slot-error]', root);
        err.hidden = false;
        $('[data-slot-error-text]', root).textContent = state.date ? 'Please choose a time to continue.' : 'Please choose a date and a time to continue.';
        var target = state.date ? $('input[name="slot"]', root) : $('[data-date][tabindex="0"]', root);
        if (target) target.focus();
        return;
      }
      goTo(3);
    });

    /* Step 3: details. Demo only: nothing is sent and nothing is booked.
       To take real bookings, hand off to Cal.com or Calendly at this point, or post the
       details to a form service (see DOCS.md, "Booking flow"). */
    var form = $('[data-booking-form]', root);
    liveValidate(form);
    $('[data-back="2"]', root).addEventListener('click', function () { goTo(2); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      var t = CALL_TYPES[state.type];
      var name = form.elements.name.value.trim();
      $('[data-confirm-name]', root).textContent = name.split(' ')[0];
      $('[data-confirm-type]', root).textContent = t.label + ' · ' + t.minutes + ' minutes';
      $('[data-confirm-when]', root).textContent = longDate(dateIn(state.slot.at, state.zone)) + ' at ' + timeIn(state.slot.at, state.zone);
      $('[data-confirm-zone]', root).textContent = state.zone === AVAILABILITY.timeZone ? AVAILABILITY.zoneName : zoneLabel(state.zone) + ' (' + timeIn(state.slot.at, AVAILABILITY.timeZone) + ' in Pittsburgh)';
      $('[data-confirm-email]', root).textContent = form.elements.email.value.trim();
      $('[data-confirm-where]', root).textContent = t.where;
      $('[data-confirm-ref]', root).textContent = makeRef('BL');
      goTo(4);
    });

    /* Step 4: a calendar hold the visitor can save (.ics). */
    $('[data-ics]', root).addEventListener('click', function () {
      var t = CALL_TYPES[state.type];
      var fmt = function (d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
      var end = new Date(state.slot.at.getTime() + t.minutes * 60000);
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Bearing//Booking//EN', 'BEGIN:VEVENT',
        'UID:' + Date.now() + '@bearing.example', 'DTSTAMP:' + fmt(new Date()), 'DTSTART:' + fmt(state.slot.at), 'DTEND:' + fmt(end),
        'SUMMARY:' + t.label + ' with Nadia Whitcombe (requested)', 'DESCRIPTION:Requested on the Bearing website. Awaiting confirmation.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      a.download = 'bearing-' + state.type + '-call.ics';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });
    $('[data-restart]', root).addEventListener('click', function () {
      form.reset();
      state.date = null; state.slot = null; state.focusDate = null; state.month = null;
      renderSummary();
      goTo(1);
    });

    renderSummary();
    $('[data-zone-note]', root).textContent = visitorZone === AVAILABILITY.timeZone
      ? 'Times are shown in ' + AVAILABILITY.zoneName + ', the same as the studio.'
      : 'Times are shown in your time zone. Nadia works from Pittsburgh (' + AVAILABILITY.zoneName + ').';
  }

  /* ---------- Cohort dates ----------
     data-cohort="next" or "after" picks the date; data-cohort-format is "full" (Wednesday, January 13, 2027),
     "long" (January 13, 2027), "month" (April 2027) or "season" (Winter 2027). */
  function cohortStarts() {
    var iso = /^\d{4}-\d{2}-\d{2}$/;
    var fixed = COHORT_DATES && iso.test(COHORT_DATES.next) && iso.test(COHORT_DATES.after);
    if (fixed) return [new Date(COHORT_DATES.next + 'T12:00:00Z'), new Date(COHORT_DATES.after + 'T12:00:00Z')];
    var p = new Intl.DateTimeFormat('en-CA', { timeZone: AVAILABILITY.timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()).split('-');
    var today = Date.UTC(+p[0], +p[1] - 1, +p[2]);
    var out = [];
    for (var i = 0; out.length < 2 && i < 12; i++) {
      var y = +p[0] + Math.floor(i / 4), m = (i % 4) * 3;
      var firstDay = new Date(Date.UTC(y, m, 1)).getUTCDay();
      var start = new Date(Date.UTC(y, m, 1 + ((3 - firstDay + 7) % 7) + 7, 12)); // the second Wednesday
      if (out.length || start.getTime() - today >= COHORT_MIN_WEEKS * 7 * 86400000) out.push(start);
    }
    return out;
  }
  var cohortEls = $$('[data-cohort]');
  if (cohortEls.length) {
    var starts = cohortStarts();
    var SEASONS = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Fall', 'Fall', 'Fall', 'Winter'];
    var FORMATS = {
      full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
      long: { month: 'long', day: 'numeric', year: 'numeric' },
      month: { month: 'long', year: 'numeric' }
    };
    cohortEls.forEach(function (el) {
      var d = starts[el.getAttribute('data-cohort') === 'after' ? 1 : 0];
      var format = el.getAttribute('data-cohort-format');
      if (!d) return;
      el.textContent = format === 'season'
        ? SEASONS[d.getUTCMonth()] + ' ' + d.getUTCFullYear()
        : d.toLocaleDateString('en-US', Object.assign({ timeZone: 'UTC' }, Object.prototype.hasOwnProperty.call(FORMATS, format) ? FORMATS[format] : FORMATS.long));
    });
  }

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();

/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It steps aside while the footer's "Back to top" link
   is on screen. Mark your own UI with data-back-to-top-avoid (lift above it) or
   data-back-to-top-hide (hide while covering it). To remove the button: delete this
   block and the .back-to-top styles in src/input.css. */
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
  var inlineLinks = Array.prototype.filter.call(document.querySelectorAll('a'), function (a) { return /back to top/i.test(a.textContent); });
  function inlineLinkInView() {
    return inlineLinks.some(function (a) {
      var r = a.getBoundingClientRect();
      return r.width > 0 && r.top < window.innerHeight && r.bottom > 0;
    });
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
    lift();
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !inlineLinkInView() && !coversHideZone());
  }
  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();

  function focusTop() {
    var target = document.getElementById('main') || document.querySelector('main');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
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
