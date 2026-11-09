/* Handy (Brightline Home Services) — site scripts. Vanilla JavaScript, no dependencies. */
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

  /* ---------- Data ----------
     Service areas (shared by the ZIP checkers and the map) and the quote price model.
     Edit these to match your business. */
  var AREAS = [{"name": "Denver", "zips": ["80202", "80203", "80204", "80205", "80206", "80207", "80209", "80210", "80211", "80218", "80220"], "tier": "core", "eta": "Same day"}, {"name": "Aurora", "zips": ["80010", "80011", "80012", "80013", "80014", "80015", "80016", "80017"], "tier": "core", "eta": "Same day"}, {"name": "Lakewood", "zips": ["80214", "80215", "80226", "80227", "80228", "80232"], "tier": "core", "eta": "Same day"}, {"name": "Arvada", "zips": ["80002", "80003", "80004", "80005"], "tier": "core", "eta": "Same day"}, {"name": "Wheat Ridge", "zips": ["80033", "80034"], "tier": "core", "eta": "Same day"}, {"name": "Westminster", "zips": ["80030", "80031", "80234", "80021"], "tier": "core", "eta": "Same day"}, {"name": "Englewood", "zips": ["80110", "80111", "80112", "80113"], "tier": "core", "eta": "Same day"}, {"name": "Littleton", "zips": ["80120", "80121", "80122", "80123", "80127", "80128"], "tier": "core", "eta": "Same day"}, {"name": "Golden", "zips": ["80401", "80403"], "tier": "extended", "eta": "Next day"}, {"name": "Boulder", "zips": ["80301", "80302", "80303", "80304", "80305"], "tier": "extended", "eta": "Next day"}];

  // [low, high] starting ranges per service, before size, options and urgency.
  var PRICES = { plumbing: [129, 420], electrical: [119, 380], hvac: [99, 650], carpentry: [180, 900], painting: [450, 2400], remodel: [9800, 32000] };
  var SERVICE_NAMES = { plumbing: 'Plumbing', electrical: 'Electrical', hvac: 'Heating & cooling', carpentry: 'Carpentry & repairs', painting: 'Painting', remodel: 'Remodel' };
  // Home size changes the price fully for whole-home work and only a little for repairs.
  var SIZE = { small: 0.85, medium: 1, large: 1.25, xl: 1.5 };
  var SIZE_NAMES = { small: 'Under 1,000 sq ft', medium: '1,000–2,000 sq ft', large: '2,000–3,000 sq ft', xl: 'Over 3,000 sq ft' };
  var SIZE_SCALED = { painting: true, remodel: true, hvac: true };
  var OPTIONS = {
    permit: { label: 'Permit & inspection', add: [150, 250] },
    haul: { label: 'Haul-away', add: [90, 140] },
    materials: { label: 'Premium materials', mult: [1.15, 1.35] },
    access: { label: 'Hard-to-reach work', add: [80, 180] }
  };
  var URGENCY = { standard: { label: 'Standard (within 3 days)' }, nextday: { label: 'Next-day visit', add: [75, 75] }, emergency: { label: 'Emergency, within 2 hours', mult: [1.5, 1.5] } };
  var WINDOW_NAMES = { morning: 'morning (8–12)', afternoon: 'afternoon (12–4)', evening: 'evening (4–7)', weekend: 'Saturday' };

  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }

  // "+$75" for a fixed amount, "+$90–140" for a range.
  function addText(add) { return '+' + money(add[0]) + (add[1] !== add[0] ? '–' + money(add[1]).slice(1) : ''); }
  // "+50%" for a fixed multiplier, "+15–35%" for a range.
  function pctText(mult) {
    var a = Math.round((mult[0] - 1) * 100), b = Math.round((mult[1] - 1) * 100);
    return '+' + a + (b !== a ? '–' + b : '') + '%';
  }

  /* The estimate is the same whatever order options were picked in:
     1. base price for the service, scaled by home size;
     2. every fixed add-on, in OPTIONS order, then the urgency add-on;
     3. every percentage multiplier, in OPTIONS order, then the urgency multiplier,
        applied to the whole running total (add-ons included).
     Low and high are rounded outward to the nearest $10. */
  function estimate(state) {
    var base = PRICES[state.service];
    var f = SIZE[state.size];
    var factor = SIZE_SCALED[state.service] ? f : 1 + (f - 1) * 0.3;
    var low = base[0] * factor;
    var high = base[1] * factor;
    var lines = [SERVICE_NAMES[state.service] + ' · ' + SIZE_NAMES[state.size] + ': ' + money(low) + ' – ' + money(high)];
    var picked = Object.keys(OPTIONS).filter(function (key) { return state.options.indexOf(key) !== -1; }).map(function (key) { return OPTIONS[key]; });
    var u = URGENCY[state.urgency];
    picked.concat([u]).forEach(function (o) {
      if (!o.add) return;
      low += o.add[0]; high += o.add[1];
      lines.push(o.label + ': ' + addText(o.add));
    });
    picked.concat([u]).forEach(function (o) {
      if (!o.mult) return;
      low *= o.mult[0]; high *= o.mult[1];
      lines.push(o.label + ': ' + pctText(o.mult));
    });
    return { low: Math.floor(low / 10) * 10, high: Math.ceil(high / 10) * 10, lines: lines };
  }

  /* ---------- Saved quote (localStorage) ----------
     Stored values are validated on read: anything unknown falls back to defaults. */
  var QUOTE_KEY = 'handy-quote-v1';
  var DEFAULT_QUOTE = { service: 'plumbing', size: 'medium', options: [], urgency: 'standard' };
  function readQuote() {
    var raw = null;
    try { raw = JSON.parse(safeStorage.getItem(QUOTE_KEY)); } catch (e) { raw = null; }
    var q = { service: DEFAULT_QUOTE.service, size: DEFAULT_QUOTE.size, options: [], urgency: DEFAULT_QUOTE.urgency };
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      if (typeof raw.service === 'string' && PRICES.hasOwnProperty(raw.service)) q.service = raw.service;
      if (typeof raw.size === 'string' && SIZE.hasOwnProperty(raw.size)) q.size = raw.size;
      if (typeof raw.urgency === 'string' && URGENCY.hasOwnProperty(raw.urgency)) q.urgency = raw.urgency;
      if (Array.isArray(raw.options)) {
        q.options = raw.options.filter(function (o, i, all) { return typeof o === 'string' && OPTIONS.hasOwnProperty(o) && all.indexOf(o) === i; });
      }
    }
    return q;
  }
  function saveQuote(q) { try { safeStorage.setItem(QUOTE_KEY, JSON.stringify(q)); } catch (e) {} }

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

  /* ---------- Scroll reveal ----------
     Elements above one that becomes visible are revealed too, so fast jumps never leave gaps. */
  var reveals = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
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

  /* ---------- Form validation helpers ---------- */
  function fieldWrap(field) { return field.closest('fieldset[data-group]') || field.parentElement; }
  function setError(field, message) {
    var wrap = fieldWrap(field);
    var id = (field.id || field.name) + '-error';
    var err = wrap.querySelector('.field-error');
    if (message) {
      if (!err) { err = document.createElement('p'); err.className = 'field-error'; err.id = id; wrap.appendChild(err); }
      err.textContent = message;
      field.setAttribute('aria-invalid', 'true');
      var ids = (field.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== id; });
      ids.push(id);
      field.setAttribute('aria-describedby', ids.join(' '));
    } else {
      if (err) err.remove();
      field.removeAttribute('aria-invalid');
      var rest = (field.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== id; });
      if (rest.length) field.setAttribute('aria-describedby', rest.join(' ')); else field.removeAttribute('aria-describedby');
    }
  }
  function today() { var d = new Date(); d.setHours(0, 0, 0, 0); return d; }
  function check(field) {
    var v = (field.value || '').trim();
    var type = field.getAttribute('data-validate');
    var msg = '';
    if (field.required && !v) msg = 'Please fill in this field.';
    else if (field.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) msg = 'Enter a valid email address, like name@example.com.';
    else if ((type === 'phone' || (type === 'phone-optional' && v)) && v.replace(/\D/g, '').length < 10) msg = 'Enter a 10-digit phone number.';
    else if (type === 'zip' && !/^\d{5}$/.test(v)) msg = 'Enter a 5-digit ZIP code.';
    else if (type === 'future-date' && v && new Date(v + 'T00:00:00') < today()) msg = 'Choose today or a later date.';
    else if (field.minLength > 0 && v && v.length < field.minLength) msg = 'Please write at least ' + field.minLength + ' characters.';
    setError(field, msg);
    return !msg;
  }
  function checkGroups(form) {
    var ok = true;
    form.querySelectorAll('fieldset[data-group]').forEach(function (fs) {
      var any = fs.querySelector('input:checked');
      var first = fs.querySelector('input');
      var id = fs.getAttribute('data-group') + '-error';
      var err = fs.querySelector('.field-error');
      if (!any) {
        ok = false;
        if (!err) { err = document.createElement('p'); err.className = 'field-error'; err.id = id; fs.appendChild(err); }
        err.textContent = 'Choose at least one option.';
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
  // A short reference for confirmations, like BL-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  function wireForm(form, onValid) {
    var fields = Array.prototype.slice.call(form.querySelectorAll('input:not([type=checkbox]):not([type=radio]), select, textarea'));
    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value) check(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid')) check(f); });
    });
    form.addEventListener('change', function (e) {
      if (e.target.type === 'checkbox' && e.target.closest('fieldset[data-group][aria-invalid]')) checkGroups(form);
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
      // To send for real, POST new FormData(form) to your form service here.
      onValid(form);
    });
  }
  // Dates can't be in the past.
  document.querySelectorAll('input[type=date][data-validate="future-date"]').forEach(function (d) {
    var t = new Date();
    d.min = t.getFullYear() + '-' + String(t.getMonth() + 1).padStart(2, '0') + '-' + String(t.getDate()).padStart(2, '0');
  });

  /* ---------- ZIP code checker (home + service areas) ---------- */
  function findArea(zip) {
    for (var i = 0; i < AREAS.length; i++) if (AREAS[i].zips.indexOf(zip) !== -1) return AREAS[i];
    return null;
  }
  var map = document.querySelector('.area-map');
  document.querySelectorAll('[data-zip-checker]').forEach(function (form) {
    var input = form.querySelector('input');
    var out = form.querySelector('.zip-result');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var zip = input.value.trim();
      out.classList.remove('text-emerald-700', 'text-navy-900', 'text-red-700');
      if (map) {
        map.classList.remove('has-match');
        map.querySelectorAll('.is-match').forEach(function (el) { el.classList.remove('is-match'); });
      }
      if (!/^\d{5}$/.test(zip)) {
        out.textContent = 'Please enter a 5-digit ZIP code.';
        out.classList.add('text-red-700');
        input.setAttribute('aria-invalid', 'true');
        input.focus();
        return;
      }
      input.removeAttribute('aria-invalid');
      var area = findArea(zip);
      if (!area) {
        out.textContent = 'Sorry, ' + zip + ' is outside our regular area. Call us: for bigger projects we often travel further.';
        out.classList.add('text-navy-900');
        return;
      }
      out.textContent = area.tier === 'core'
        ? 'Yes! We serve ' + area.name + ' (' + zip + ') with same-day service.'
        : 'Yes, we serve ' + area.name + ' (' + zip + ') with next-day service.';
      out.classList.add(area.tier === 'core' ? 'text-emerald-700' : 'text-navy-900');
      if (map) {
        var shape = map.querySelector('[data-area="' + area.name + '"]');
        if (shape) { shape.classList.add('is-match'); map.classList.add('has-match'); }
      }
    });
  });

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

  /* ---------- Quote calculator + request form ---------- */
  var quoteRoot = document.querySelector('[data-quote]');
  if (quoteRoot) {
    var calc = quoteRoot.querySelector('[data-quote-calculator]');
    var out = quoteRoot.querySelector('[data-estimate]');
    var note = quoteRoot.querySelector('[data-estimate-note]');
    var list = quoteRoot.querySelector('[data-breakdown]');
    var state = readQuote();
    var fromUrl = new URLSearchParams(location.search).get('service');
    if (fromUrl && PRICES.hasOwnProperty(fromUrl)) state.service = fromUrl;

    var applyState = function () {
      calc.querySelector('input[name=service][value="' + state.service + '"]').checked = true;
      calc.querySelector('select[name=size]').value = state.size;
      calc.querySelectorAll('input[name=options]').forEach(function (cb) { cb.checked = state.options.indexOf(cb.value) !== -1; });
      calc.querySelector('input[name=urgency][value="' + state.urgency + '"]').checked = true;
    };
    var render = function () {
      var r = estimate(state);
      out.textContent = money(r.low) + ' – ' + money(r.high);
      note.textContent = state.urgency === 'emergency'
        ? 'Includes the emergency call-out. A technician can usually be with you within 2 hours.'
        : 'Typical range for this job in the Denver metro.';
      list.innerHTML = '';
      r.lines.forEach(function (line) {
        var li = document.createElement('li');
        li.className = 'flex gap-2';
        li.innerHTML = '<span aria-hidden="true" class="text-sun-400">&#9656;</span>';
        li.appendChild(document.createTextNode(line));
        list.appendChild(li);
      });
      return r;
    };
    var readForm = function () {
      state = {
        service: calc.querySelector('input[name=service]:checked').value,
        size: calc.querySelector('select[name=size]').value,
        options: Array.prototype.map.call(calc.querySelectorAll('input[name=options]:checked'), function (c) { return c.value; }),
        urgency: calc.querySelector('input[name=urgency]:checked').value
      };
      saveQuote(state);
      render();
    };
    applyState();
    render();
    calc.addEventListener('change', readForm);

    var reqForm = quoteRoot.querySelector('[data-request-form]');
    var success = quoteRoot.querySelector('[data-request-success]');
    wireForm(reqForm, function (form) {
      var r = estimate(state);
      var windows = Array.prototype.map.call(form.querySelectorAll('input[name=windows]:checked'), function (c) { return WINDOW_NAMES[c.value]; });
      var date = new Date(form.date.value + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
      var area = findArea(form.zip.value.trim());
      success.querySelector('[data-request-ref]').textContent = makeRef('BL');
      success.querySelector('[data-request-summary]').textContent =
        SERVICE_NAMES[state.service] + ' visit on ' + date + ', ' + windows.join(' or ') + '. Estimate ' + money(r.low) + ' – ' + money(r.high) +
        '. ' + (area ? 'You’re in our ' + area.name + ' area.' : 'Your ZIP code is outside our usual area; we’ll confirm when we call.') +
        ' We’ll call ' + form.phone.value.trim() + ' to confirm.';
      form.classList.add('hidden');
      success.classList.remove('hidden');
      success.focus();
    });
    success.querySelector('[data-request-reset]').addEventListener('click', function () {
      reqForm.reset();
      reqForm.classList.remove('hidden');
      success.classList.add('hidden');
      reqForm.querySelector('input').focus();
    });
  }

  /* ---------- Contact form ---------- */
  document.querySelectorAll('[data-contact-form]').forEach(function (form) {
    wireForm(form, function () {
      var ok = form.querySelector('[data-success]');
      ok.querySelector('[data-contact-ref]').textContent = makeRef('BL');
      form.querySelectorAll('input, select, textarea').forEach(function (f) { f.value = f.tagName === 'SELECT' ? f.options[0].value : ''; });
      ok.classList.remove('hidden');
      ok.focus();
    });
  });

  /* ---------- Project gallery: filters + lightbox ---------- */
  var gallery = document.querySelector('[data-gallery]');
  if (gallery) {
    var items = Array.prototype.slice.call(gallery.querySelectorAll('[data-project]'));
    var countEl = gallery.querySelector('[data-gallery-count]');
    var data = JSON.parse(gallery.querySelector('[data-lightbox-data]').textContent);
    var dialog = gallery.querySelector('[data-lightbox]');
    var opener = null;
    var current = 0;
    gallery.querySelectorAll('[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter');
        gallery.querySelectorAll('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var shown = 0;
        items.forEach(function (li) {
          var match = f === 'all' || li.getAttribute('data-category') === f;
          li.hidden = !match;
          if (match) { shown++; li.classList.add('is-visible'); }
        });
        countEl.textContent = 'Showing ' + shown + ' project' + (shown === 1 ? '' : 's');
      });
    });
    var visible = function () { return items.filter(function (li) { return !li.hidden; }).map(function (li) { return Number(li.querySelector('[data-lightbox-open]').getAttribute('data-lightbox-open')); }); };
    var show = function (i) {
      current = i;
      var d = data[i];
      var img = dialog.querySelector('[data-lightbox-img]');
      img.src = d.src;
      img.alt = d.title;
      dialog.querySelector('[data-lightbox-title]').textContent = d.title;
      dialog.querySelector('[data-lightbox-meta]').textContent = d.meta;
    };
    var step = function (dir) {
      var v = visible();
      var pos = v.indexOf(current);
      show(v[(pos + dir + v.length) % v.length]);
    };
    gallery.querySelectorAll('[data-lightbox-open]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        show(Number(btn.getAttribute('data-lightbox-open')));
        dialog.showModal();
        dialog.querySelector('[data-lightbox-close]').focus();
      });
    });
    dialog.querySelector('[data-lightbox-prev]').addEventListener('click', function () { step(-1); });
    dialog.querySelector('[data-lightbox-next]').addEventListener('click', function () { step(1); });
    dialog.querySelector('[data-lightbox-close]').addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
    });
    dialog.addEventListener('close', function () { if (opener) opener.focus(); });
  }

  /* ---------- Reviews: filter + sort ---------- */
  var reviewsRoot = document.querySelector('[data-reviews]');
  if (reviewsRoot) {
    var listEl = reviewsRoot.querySelector('[data-review-list]');
    var cards = Array.prototype.slice.call(listEl.querySelectorAll('[data-review]'));
    var svcSel = reviewsRoot.querySelector('[data-review-service]');
    var sortSel = reviewsRoot.querySelector('[data-review-sort]');
    var countR = reviewsRoot.querySelector('[data-review-count]');
    var empty = reviewsRoot.querySelector('[data-review-empty]');
    var stars = 'all';
    var apply = function () {
      var sorted = cards.slice().sort(function (a, b) {
        var sa = Number(a.getAttribute('data-stars')), sb = Number(b.getAttribute('data-stars'));
        var da = a.getAttribute('data-date'), db = b.getAttribute('data-date');
        if (sortSel.value === 'highest' && sa !== sb) return sb - sa;
        if (sortSel.value === 'lowest' && sa !== sb) return sa - sb;
        return db < da ? -1 : db > da ? 1 : 0;
      });
      var shown = 0;
      sorted.forEach(function (card) {
        var s = Number(card.getAttribute('data-stars'));
        var match = (svcSel.value === 'all' || card.getAttribute('data-service') === svcSel.value) &&
          (stars === 'all' || (stars === '3' ? s <= 3 : String(s) === stars));
        card.hidden = !match;
        if (match) { shown++; card.classList.add('is-visible'); }
        listEl.appendChild(card);
      });
      countR.textContent = 'Showing ' + shown + ' review' + (shown === 1 ? '' : 's');
      empty.classList.toggle('hidden', shown > 0);
    };
    reviewsRoot.querySelectorAll('[data-stars-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        stars = btn.getAttribute('data-stars-filter');
        reviewsRoot.querySelectorAll('[data-stars-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        apply();
      });
    });
    svcSel.addEventListener('change', apply);
    sortSel.addEventListener('change', apply);
    reviewsRoot.querySelector('[data-review-clear]').addEventListener('click', function () {
      svcSel.value = 'all'; sortSel.value = 'newest'; stars = 'all';
      reviewsRoot.querySelectorAll('[data-stars-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-stars-filter') === 'all')); });
      apply();
    });
  }

  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();


/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It lifts itself above the mobile call bar and toasts,
   and steps aside while the footer's "Back to top" link is on screen.
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
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
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
