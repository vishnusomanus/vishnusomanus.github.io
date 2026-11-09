/* Keystone (Corbel Design-Build) — site scripts. Vanilla JavaScript, no dependencies. */
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

  /* ---------- Estimator price model ----------
     All prices are per square foot of gross floor area. Edit these to match your market. */
  var TYPES = {
    commercial: { label: 'Commercial build', desc: 'Offices, retail, civic or light industrial.', rate: [215, 340], min: 2000, max: 80000, step: 500, size: 12000, weeks: [26, 1], help: 'Most of our commercial buildings are between 5,000 and 60,000 ft².' },
    residential: { label: 'New home', desc: 'A custom house or a small group of townhomes.', rate: [285, 450], min: 1200, max: 8000, step: 100, size: 3200, weeks: [24, 3.5], help: 'Count every heated floor, including a finished basement.' },
    renovation: { label: 'Renovation', desc: 'Restore, convert or refit an existing building.', rate: [130, 260], min: 300, max: 40000, step: 100, size: 2500, weeks: [10, 1.6], help: 'Only count the floor area we will work on.' },
    addition: { label: 'Addition', desc: 'Extend a home or building outward or upward.', rate: [240, 380], min: 200, max: 3000, step: 50, size: 600, weeks: [12, 9], help: 'Count the new floor area only, not the existing building.' }
  };
  var FINISH = {
    standard: { label: 'Standard', desc: 'Durable, well-detailed, quality-grade materials.', meta: 'Base rate', mult: [1, 1] },
    premium: { label: 'Premium', desc: 'Upgraded glazing, timber, stone and fixtures.', meta: '+18–28%', mult: [1.18, 1.28] },
    signature: { label: 'Signature', desc: 'Custom millwork, specialist trades, every detail drawn.', meta: '+45–65%', mult: [1.45, 1.65] }
  };
  var TIMELINE = {
    flexible: { label: 'Flexible', desc: 'Start when trades are free; 12+ months away.', meta: '−3–4%', mult: [0.96, 0.97], pace: 1.15 },
    standard: { label: 'Standard', desc: 'A normal schedule with one main crew.', meta: 'Base rate', mult: [1, 1], pace: 1 },
    fast: { label: 'Fast-track', desc: 'Overlapping trades and extended shifts.', meta: '+8–14%', mult: [1.08, 1.14], pace: 0.82 }
  };
  var DESIGN = { label: 'Architecture & permits', mult: [1.07, 1.1], weeks: [12, 20] };
  var DEFAULT_ESTIMATE = { type: 'commercial', size: 12000, finish: 'standard', timeline: 'standard', design: true };

  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  // $640k or $3.08M
  function compact(n) {
    if (n >= 1000000) return '$' + (n / 1000000).toFixed(2).replace(/\.?0+$/, '') + 'M';
    return '$' + Math.round(n / 1000) + 'k';
  }
  function pct(mult) {
    var a = Math.round(Math.abs(mult[0] - 1) * 100), b = Math.round(Math.abs(mult[1] - 1) * 100);
    var sign = mult[0] < 1 ? '−' : '+';
    return sign + Math.min(a, b) + (a !== b ? '–' + Math.max(a, b) : '') + '%';
  }
  function clampSize(type, size) {
    var t = TYPES[type];
    size = Math.round(Number(size));
    if (!isFinite(size)) return t.size;
    return Math.min(t.max, Math.max(t.min, size));
  }

  /* The estimate: size x rate, then finish, timeline and design multipliers, in that order.
     Low is rounded down and high rounded up to the nearest $5,000. */
  function estimate(s) {
    var t = TYPES[s.type], f = FINISH[s.finish], tl = TIMELINE[s.timeline];
    var low = s.size * t.rate[0] * f.mult[0] * tl.mult[0];
    var high = s.size * t.rate[1] * f.mult[1] * tl.mult[1];
    var lines = [t.label + ', ' + s.size.toLocaleString('en-US') + ' ft² at ' + money(t.rate[0]) + '–' + money(t.rate[1]) + ' / ft²'];
    lines.push(f.label + ' finish: ' + (f.mult[1] === 1 ? 'base rate' : pct(f.mult)));
    lines.push(tl.label + ' timeline: ' + (tl.mult[1] === 1 ? 'base rate' : pct(tl.mult)));
    if (s.design) {
      low *= DESIGN.mult[0]; high *= DESIGN.mult[1];
      lines.push(DESIGN.label + ' by Corbel Studio: ' + pct(DESIGN.mult));
    } else {
      lines.push('Your own drawings and permits: not included');
    }
    low = Math.floor(low / 5000) * 5000;
    high = Math.ceil(high / 5000) * 5000;
    var w = (t.weeks[0] + t.weeks[1] * s.size / 1000) * tl.pace;
    return {
      low: low, high: high,
      rateLow: low / s.size, rateHigh: high / s.size,
      weeks: [Math.round(w * 0.92), Math.round(w * 1.1)],
      design: s.design ? DESIGN.weeks[0] + '–' + DESIGN.weeks[1] + ' weeks' : 'Not included',
      lines: lines
    };
  }

  /* ---------- Office hours (contact page) ----------
     Day 0 is Sunday. Each open day is [opens, closes] in 24-hour decimal hours (17.5 = 5:30 pm).
     Keep these in step with the hours tables in contact.html. */
  var OFFICE_HOURS = {
    milwaukee: { tz: 'America/Chicago', days: [null, [7, 17.5], [7, 17.5], [7, 17.5], [7, 17.5], [7, 16], null] },
    madison: { tz: 'America/Chicago', days: [null, [8, 17], [8, 17], [8, 17], [8, 17], [8, 17], null] }
  };

  /* ---------- Saved estimate (localStorage) ----------
     Stored values are validated on read: anything unknown falls back to the defaults. */
  var ESTIMATE_KEY = 'keystone-estimate-v1';
  function readEstimate() {
    var raw = null;
    try { raw = JSON.parse(safeStorage.getItem(ESTIMATE_KEY)); } catch (e) { raw = null; }
    var s = { type: DEFAULT_ESTIMATE.type, size: DEFAULT_ESTIMATE.size, finish: DEFAULT_ESTIMATE.finish, timeline: DEFAULT_ESTIMATE.timeline, design: DEFAULT_ESTIMATE.design };
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      if (typeof raw.type === 'string' && TYPES.hasOwnProperty(raw.type)) { s.type = raw.type; s.size = TYPES[raw.type].size; }
      var t = TYPES[s.type];
      if (typeof raw.size === 'number' && raw.size >= t.min && raw.size <= t.max) s.size = Math.round(raw.size);
      if (typeof raw.finish === 'string' && FINISH.hasOwnProperty(raw.finish)) s.finish = raw.finish;
      if (typeof raw.timeline === 'string' && TIMELINE.hasOwnProperty(raw.timeline)) s.timeline = raw.timeline;
      if (typeof raw.design === 'boolean') s.design = raw.design;
    }
    return s;
  }
  function saveEstimate(s) { try { safeStorage.setItem(ESTIMATE_KEY, JSON.stringify(s)); } catch (e) {} }

  /* ---------- Header: shadow on scroll + mobile menu ---------- */
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
      menuBtn.querySelector('[data-icon-open]').classList.toggle('hidden', open);
      menuBtn.querySelector('[data-icon-close]').classList.toggle('hidden', !open);
    };
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- Scroll reveal + line drawings ----------
     .reveal fades in; .draw (SVG) draws its lines. Everything above an element that
     becomes visible is revealed too, so fast jumps never leave gaps. */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal, .draw'));
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = reveals.indexOf(entry.target);
        reveals.slice(0, index + 1).forEach(function (el) { el.classList.add('is-visible'); io.unobserve(el); });
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Count-up numbers ----------
     <span data-count="620" data-decimals="0">620</span>. The HTML holds the final value,
     so without JavaScript (or with reduced motion) the real number shows. */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && !reduceMotion.matches && 'IntersectionObserver' in window) {
    var fmt = function (n, d) { return n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }); };
    var countIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        countIo.unobserve(el);
        var end = parseFloat(el.getAttribute('data-count'));
        var d = Number(el.getAttribute('data-decimals')) || 0;
        var start = null;
        var tick = function (now) {
          if (start === null) start = now;
          var p = Math.min(1, (now - start) / 1400);
          var eased = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(end * eased, d);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) {
      el.textContent = fmt(0, Number(el.getAttribute('data-decimals')) || 0);
      countIo.observe(el);
    });
  }

  /* ---------- Form validation helpers ---------- */
  function fieldWrap(field) { return field.closest('fieldset[data-group]') || field.closest('div') || field.parentElement; }
  function setError(field, message) {
    var wrap = fieldWrap(field);
    var id = (field.id || field.name) + '-error';
    var err = wrap.querySelector('.field-error');
    var describedBy = function (keep) {
      var ids = (field.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== id; });
      if (keep) ids.push(id);
      if (ids.length) field.setAttribute('aria-describedby', ids.join(' ')); else field.removeAttribute('aria-describedby');
    };
    if (message) {
      if (!err) { err = document.createElement('p'); err.className = 'field-error'; err.id = id; wrap.appendChild(err); }
      err.textContent = message;
      field.setAttribute('aria-invalid', 'true');
      describedBy(true);
    } else {
      if (err) err.remove();
      field.removeAttribute('aria-invalid');
      describedBy(false);
    }
  }
  function check(field) {
    var v = (field.value || '').trim();
    var type = field.getAttribute('data-validate');
    var msg = '';
    if (field.type === 'checkbox') { if (field.required && !field.checked) msg = 'Please check this box to continue.'; }
    else if (field.required && !v) msg = field.tagName === 'SELECT' ? 'Please choose an option.' : 'Please fill in this field.';
    else if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter a valid email address, like name@example.com.';
    else if ((type === 'phone' || (type === 'phone-optional' && v)) && v.replace(/\D/g, '').length < 10) msg = 'Enter a phone number with at least 10 digits.';
    else if (field.minLength > 0 && v && v.length < field.minLength) msg = 'Please write at least ' + field.minLength + ' characters.';
    setError(field, msg);
    return !msg;
  }
  function checkGroups(form) {
    var ok = true;
    form.querySelectorAll('fieldset[data-group]').forEach(function (fs) {
      var first = fs.querySelector('input');
      var id = fs.getAttribute('data-group') + '-error';
      var err = fs.querySelector('.field-error');
      if (!fs.querySelector('input:checked')) {
        ok = false;
        if (!err) { err = document.createElement('p'); err.className = 'field-error'; err.id = id; fs.appendChild(err); }
        err.textContent = 'Choose an option.';
        fs.setAttribute('aria-invalid', 'true');
        first.setAttribute('aria-describedby', id);
      } else {
        if (err) err.remove();
        fs.removeAttribute('aria-invalid');
        first.removeAttribute('aria-describedby');
      }
    });
    return ok;
  }
  // Validates on submit (and again as fields are corrected), then calls onValid(form).
  function wireForm(form, onValid) {
    var fields = Array.prototype.slice.call(form.querySelectorAll('input:not([type=radio]), select, textarea'));
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value && f.type !== 'checkbox') check(f); });
      f.addEventListener(f.type === 'checkbox' || f.tagName === 'SELECT' ? 'change' : 'input', function () { if (f.getAttribute('aria-invalid')) check(f); });
    });
    form.addEventListener('change', function (e) {
      if (e.target.type === 'radio' && e.target.closest('fieldset[data-group][aria-invalid]')) checkGroups(form);
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = fields.map(check).every(Boolean);
      ok = checkGroups(form) && ok;
      if (!ok) {
        var first = form.querySelector('[aria-invalid="true"]');
        if (first && first.matches('fieldset')) first = first.querySelector('input');
        if (first) first.focus();
        return;
      }
      // To send for real, POST new FormData(form) to your form service here (see DOCS.md, "Forms").
      onValid(form);
    });
  }

  /* ---------- Projects: type filter + search ---------- */
  var projectsRoot = document.querySelector('[data-projects]');
  if (projectsRoot) {
    var items = Array.prototype.slice.call(projectsRoot.querySelectorAll('[data-project]'));
    var chips = Array.prototype.slice.call(projectsRoot.querySelectorAll('[data-filter]'));
    var search = projectsRoot.querySelector('[data-project-search]');
    var countEl = projectsRoot.querySelector('[data-project-count]');
    var emptyEl = projectsRoot.querySelector('[data-project-empty]');
    var params = new URLSearchParams(location.search);
    var filter = params.get('type');
    if (!chips.some(function (c) { return c.getAttribute('data-filter') === filter; })) filter = 'all';
    search.value = params.get('q') || '';

    var applyFilter = function () {
      var words = search.value.toLowerCase().replace(/[’']/g, "'").split(/\s+/).filter(Boolean);
      var shown = 0;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === filter)); });
      items.forEach(function (li) {
        var text = li.getAttribute('data-text');
        var match = (filter === 'all' || li.getAttribute('data-type') === filter) &&
          words.every(function (w) { return text.indexOf(w) !== -1; });
        li.hidden = !match;
        if (match) { shown++; li.classList.add('is-visible'); }
      });
      countEl.textContent = shown === items.length ? 'Showing all ' + shown + ' projects' : 'Showing ' + shown + ' of ' + items.length + ' projects';
      emptyEl.classList.toggle('hidden', shown > 0);
      var q = new URLSearchParams();
      if (filter !== 'all') q.set('type', filter);
      if (search.value.trim()) q.set('q', search.value.trim());
      var qs = q.toString();
      try { history.replaceState(null, '', location.pathname + (qs ? '?' + qs : '') + location.hash); } catch (e) {}
    };
    chips.forEach(function (c) {
      c.addEventListener('click', function () { filter = c.getAttribute('data-filter'); applyFilter(); });
    });
    search.addEventListener('input', applyFilter);
    projectsRoot.querySelector('[data-project-clear]').addEventListener('click', function () {
      filter = 'all'; search.value = ''; applyFilter(); chips[0].focus();
    });
    applyFilter();
  }

  /* ---------- Before / after slider ---------- */
  document.querySelectorAll('[data-before-after]').forEach(function (box) {
    var range = box.querySelector('input[type=range]');
    var update = function () {
      box.style.setProperty('--pos', range.value + '%');
      range.setAttribute('aria-valuetext', range.value + '% before, ' + (100 - range.value) + '% after');
    };
    range.addEventListener('input', update);
    update();
  });

  /* ---------- Gallery lightbox ---------- */
  var gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    var shots = JSON.parse(gallery.querySelector('[data-lightbox-data]').textContent);
    var dialog = gallery.querySelector('[data-lightbox]');
    var opener = null;
    var current = 0;
    var show = function (i) {
      current = (i + shots.length) % shots.length;
      var s = shots[current];
      var img = dialog.querySelector('[data-lightbox-img]');
      img.src = s.src;
      img.alt = s.title + ': ' + s.caption;
      dialog.querySelector('[data-lightbox-title]').textContent = s.title;
      dialog.querySelector('[data-lightbox-caption]').textContent = s.caption;
      dialog.querySelector('[data-lightbox-index]').textContent = current + 1;
    };
    gallery.querySelectorAll('[data-lightbox-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        show(Number(btn.getAttribute('data-lightbox-open')));
        dialog.showModal();
        dialog.querySelector('[data-lightbox-close]').focus();
      });
    });
    dialog.querySelector('[data-lightbox-prev]').addEventListener('click', function () { show(current - 1); });
    dialog.querySelector('[data-lightbox-next]').addEventListener('click', function () { show(current + 1); });
    dialog.querySelector('[data-lightbox-close]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
    });
    dialog.addEventListener('close', function () { if (opener) opener.focus(); });
  }

  /* ---------- Accordion (FAQ) ---------- */
  document.querySelectorAll('[data-accordion] [aria-controls]').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      panel.hidden = open;
    });
  });

  /* ---------- Estimator: 4 steps + request form ---------- */
  var est = document.querySelector('[data-estimator]');
  if (est) {
    var calc = est.querySelector('[data-estimate-form]');
    var panels = Array.prototype.slice.call(est.querySelectorAll('[data-step]'));
    var tabs = Array.prototype.slice.call(est.querySelectorAll('.step-tab'));
    var nav = est.querySelector('[data-step-nav]');
    var prevBtn = est.querySelector('[data-step-prev]');
    var nextBtn = est.querySelector('[data-step-next]');
    var stepLabel = est.querySelector('[data-step-label]');
    var sizeInput = calc.querySelector('input[name=size]');
    var sizeRange = calc.querySelector('[data-size-range]');
    var state = readEstimate();
    var step = 0;
    var fromUrl = new URLSearchParams(location.search).get('type');
    if (fromUrl && TYPES.hasOwnProperty(fromUrl) && fromUrl !== state.type) { state.type = fromUrl; state.size = TYPES[fromUrl].size; }

    var setBounds = function () {
      var t = TYPES[state.type];
      [sizeInput, sizeRange].forEach(function (el) { el.min = t.min; el.max = t.max; el.step = t.step; });
      est.querySelector('[data-size-min]').textContent = t.min.toLocaleString('en-US') + ' ft²';
      est.querySelector('[data-size-max]').textContent = t.max.toLocaleString('en-US') + ' ft²';
      est.querySelector('[data-size-help]').textContent = t.help;
    };
    var applyState = function () {
      calc.querySelector('input[name=type][value="' + state.type + '"]').checked = true;
      calc.querySelector('input[name=finish][value="' + state.finish + '"]').checked = true;
      calc.querySelector('input[name=timeline][value="' + state.timeline + '"]').checked = true;
      calc.querySelector('input[name=design]').checked = state.design;
      setBounds();
      sizeInput.value = state.size;
      sizeRange.value = state.size;
    };
    var render = function () {
      var r = estimate(state);
      est.querySelector('[data-est-range]').textContent = compact(r.low) + ' – ' + compact(r.high);
      var mini = document.querySelector('[data-est-range-mini]');
      if (mini) mini.textContent = compact(r.low) + ' – ' + compact(r.high);
      est.querySelector('[data-est-rate]').textContent = money(r.rateLow) + ' – ' + money(r.rateHigh) + ' per ft² all-in';
      est.querySelector('[data-est-weeks]').textContent = r.weeks[0] + '–' + r.weeks[1] + ' weeks';
      est.querySelector('[data-est-design]').textContent = r.design;
      est.querySelector('[data-est-m2]').textContent = '≈ ' + Math.round(state.size * 0.092903).toLocaleString('en-US') + ' m²';
      var list = est.querySelector('[data-est-lines]');
      list.innerHTML = '';
      r.lines.forEach(function (line) {
        var li = document.createElement('li');
        li.className = 'flex gap-2';
        li.innerHTML = '<span aria-hidden="true" class="mt-1.5 size-1.5 shrink-0 bg-signal-500"></span>';
        li.appendChild(document.createTextNode(line));
        list.appendChild(li);
      });
      return r;
    };
    var commit = function () { saveEstimate(state); render(); };

    calc.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'type') { state.type = t.value; state.size = TYPES[t.value].size; setBounds(); sizeInput.value = state.size; sizeRange.value = state.size; }
      else if (t.name === 'finish') state.finish = t.value;
      else if (t.name === 'timeline') state.timeline = t.value;
      else if (t.name === 'design') state.design = t.checked;
      else if (t === sizeInput) { state.size = clampSize(state.type, sizeInput.value); sizeInput.value = state.size; sizeRange.value = state.size; }
      commit();
    });
    sizeRange.addEventListener('input', function () { state.size = Number(sizeRange.value); sizeInput.value = state.size; commit(); });
    sizeInput.addEventListener('input', function () {
      var v = Number(sizeInput.value);
      var t = TYPES[state.type];
      if (sizeInput.value !== '' && v >= t.min && v <= t.max) { state.size = Math.round(v); sizeRange.value = state.size; commit(); }
    });
    calc.addEventListener('submit', function (e) { e.preventDefault(); });

    var goTo = function (i, focus) {
      step = Math.max(0, Math.min(panels.length - 1, i));
      panels.forEach(function (p, n) { p.hidden = n !== step; });
      tabs.forEach(function (t, n) {
        if (n === step) t.setAttribute('aria-current', 'step'); else t.removeAttribute('aria-current');
        if (n < step) t.setAttribute('data-done', ''); else t.removeAttribute('data-done');
      });
      prevBtn.classList.toggle('invisible', step === 0);
      nextBtn.classList.toggle('hidden', step === panels.length - 1);
      nextBtn.firstChild.textContent = step === panels.length - 2 ? 'Add your details' : 'Continue';
      stepLabel.textContent = 'Step ' + (step + 1) + ' of ' + panels.length;
      if (focus) {
        var top = est.getBoundingClientRect().top;
        if (top < 0) window.scrollBy(0, top - 120);
        panels[step].querySelector('[tabindex="-1"]').focus({ preventScroll: true });
      }
    };
    est.querySelectorAll('[data-step-go]').forEach(function (b) {
      b.addEventListener('click', function (e) { e.preventDefault(); goTo(Number(b.getAttribute('data-step-go')), true); });
    });
    prevBtn.addEventListener('click', function () { goTo(step - 1, true); });
    nextBtn.addEventListener('click', function () { goTo(step + 1, true); });
    nav.classList.remove('hidden');
    nav.classList.add('flex');

    applyState();
    render();
    goTo(location.hash === '#request' ? panels.length - 1 : 0, false);

    var quoteForm = est.querySelector('[data-quote-form]');
    var quoteOk = est.querySelector('[data-quote-success]');
    wireForm(quoteForm, function (form) {
      var r = estimate(state);
      quoteOk.querySelector('[data-quote-ref]').textContent = 'CDB-' + String(new Date().getFullYear()).slice(2) + '-' + String(Math.floor(1000 + Math.random() * 9000));
      quoteOk.querySelector('[data-quote-summary]').textContent =
        TYPES[state.type].label + ', ' + state.size.toLocaleString('en-US') + ' ft² (' + Math.round(state.size * 0.092903).toLocaleString('en-US') + ' m²), ' +
        FINISH[state.finish].label.toLowerCase() + ' finish, ' + TIMELINE[state.timeline].label.toLowerCase() + ' timeline' +
        (state.design ? ', with architecture and permits' : '') + '. Estimate ' + compact(r.low) + ' – ' + compact(r.high) +
        '. A project director will reply to ' + form.email.value.trim() + ' within one business day to book a site walk.';
      form.classList.add('hidden');
      quoteOk.classList.remove('hidden');
      quoteOk.focus();
    });
    quoteOk.querySelector('[data-quote-reset]').addEventListener('click', function () {
      quoteForm.reset();
      quoteForm.classList.remove('hidden');
      quoteOk.classList.add('hidden');
      goTo(0, true);
    });
  }

  /* ---------- Contact form ---------- */
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  document.querySelectorAll('[data-contact-form]').forEach(function (form) {
    var ok = form.parentElement.querySelector('[data-success]');
    wireForm(form, function () {
      var name = form.querySelector('[name=name]').value.trim().split(/\s+/)[0];
      var office = form.querySelector('input[name=office]:checked');
      ok.querySelector('[data-success-text]').textContent = 'Thanks, ' + name + '. Your message about “' + form.topic.value.toLowerCase() + '” has reached our ' +
        (office && office.value === 'madison' ? 'Madison studio' : 'Milwaukee office') + '. We will reply to ' + form.email.value.trim() + ' within one business day.';
      // A short reference, like CB-7K2Q (no 0/O or 1/I to misread over the phone).
      ok.querySelector('[data-success-ref]').textContent = makeRef('CB');
      form.reset();
      form.classList.add('hidden');
      ok.classList.remove('hidden');
      ok.focus();
    });
    ok.querySelector('[data-success-reset]').addEventListener('click', function () {
      ok.classList.add('hidden');
      form.classList.remove('hidden');
      form.querySelector('input').focus();
    });
  });

  /* ---------- Office open / closed status ---------- */
  var DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  function clock(h) {
    var hh = Math.floor(h), mm = Math.round((h - hh) * 60);
    return (hh % 12 || 12) + ':' + String(mm).padStart(2, '0') + (hh < 12 ? ' am' : ' pm');
  }
  function nowIn(tz) {
    try {
      var parts = new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'short', hour: 'numeric', minute: 'numeric', hourCycle: 'h23' }).formatToParts(new Date());
      var get = function (type) { for (var i = 0; i < parts.length; i++) if (parts[i].type === type) return parts[i].value; return ''; };
      return { day: DAY_NAMES.indexOf(get('weekday')), hour: Number(get('hour')) + Number(get('minute')) / 60 };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), hour: d.getHours() + d.getMinutes() / 60 };
    }
  }
  document.querySelectorAll('[data-office]').forEach(function (card) {
    var office = OFFICE_HOURS[card.getAttribute('data-office')];
    if (!office) return;
    var now = nowIn(office.tz);
    var today = office.days[now.day];
    var open = today && now.hour >= today[0] && now.hour < today[1];
    var text;
    if (open) text = 'Open now · until ' + clock(today[1]);
    else {
      for (var i = 0; i < 8; i++) {
        var d = (now.day + i) % 7, hrs = office.days[d];
        if (hrs && (i > 0 || now.hour < hrs[0])) { text = 'Closed · opens ' + (i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAY_NAMES[d]) + ' ' + clock(hrs[0]); break; }
      }
    }
    card.querySelector('[data-office-text]').textContent = text || 'Closed';
    var dot = card.querySelector('[data-office-dot]');
    dot.classList.toggle('bg-emerald-600', !!open);
    dot.classList.toggle('bg-concrete-400', !open);
  });

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
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
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="square" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
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
