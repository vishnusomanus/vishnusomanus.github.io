/* Hartwell & Sloane — site scripts. Vanilla JavaScript, no dependencies. */
(function () {
  'use strict';
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header shadow on scroll ---------- */
  var header = $('[data-header]');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('[data-menu-button]');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    if (!menu) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    if (open) { var first = $('a', menu); if (first) first.focus(); }
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- Scroll reveal ----------
     When an element reveals, everything before it in the page reveals too,
     so jumping straight to an anchor never leaves hidden content above. */
  var reveals = $$('.reveal');
  function revealUpTo(el) {
    var i = reveals.indexOf(el);
    for (var j = 0; j <= i; j++) reveals[j].classList.add('is-in');
  }
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { revealUpTo(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Count-up numbers ---------- */
  function format(n) { return n.toLocaleString('en-US'); }
  function countUp(el) {
    var to = parseInt(el.dataset.to, 10);
    var suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = format(to) + suffix; return; }
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var t = Math.min((ts - start) / 1400, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = format(Math.round(to * eased)) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count]');
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Filterable lists ----------
     A [data-filter-list] holds [data-item] elements with data attributes, and any of:
     chips ([data-chip], filtering on the list's data-key), selects ([data-filter-select]
     with their own data-key) and a search box ([data-filter-search], matching data-search).
     Space-separated attribute values (data-practices="ip corporate") match any token. */
  $$('[data-filter-list]').forEach(function (list) {
    var items = $$('[data-item]', list);
    var chips = $$('[data-chip]', list);
    var selects = $$('[data-filter-select]', list);
    var search = $('[data-filter-search]', list);
    var count = $('[data-filter-count]', list);
    var empty = $('[data-filter-empty]', list);
    var chipKey = list.dataset.key;
    var chipValue = 'all';

    function matches(item, key, value) {
      if (!value || value === 'all') return true;
      return (item.dataset[key] || '').split(' ').indexOf(value) !== -1;
    }
    function apply() {
      var q = search ? search.value.trim().toLowerCase() : '';
      var shown = 0;
      items.forEach(function (item) {
        var ok = matches(item, chipKey, chipValue);
        selects.forEach(function (s) { ok = ok && matches(item, s.dataset.key, s.value); });
        if (q) ok = ok && (item.dataset.search || '').indexOf(q) !== -1;
        item.hidden = !ok;
        if (ok) { shown++; item.classList.add('is-in'); }
      });
      if (count) count.textContent = shown;
      if (empty) empty.hidden = shown > 0;
    }
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chipValue = chip.dataset.value;
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        apply();
      });
    });
    selects.forEach(function (s) { s.addEventListener('change', apply); });
    if (search) search.addEventListener('input', apply);
    $$('[data-filter-reset]', list).forEach(function (btn) {
      btn.addEventListener('click', function () {
        chipValue = 'all';
        chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.value === 'all')); });
        selects.forEach(function (s) { s.value = 'all'; });
        if (search) { search.value = ''; search.focus(); }
        apply();
      });
    });
  });

  /* ---------- Article: reading progress and table of contents ---------- */
  var body = $('[data-article-body]');
  var bar = $('[data-reading-progress]');
  var tocLinks = $$('[data-toc-link]');
  if (body) {
    var sections = tocLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); });
    var queued = false;
    var update = function () {
      queued = false;
      var rect = body.getBoundingClientRect();
      var total = rect.height - window.innerHeight * 0.6;
      var progress = Math.min(Math.max(-rect.top / Math.max(total, 1), 0), 1);
      if (bar) bar.style.setProperty('--progress', progress.toFixed(3));
      var current = 0;
      sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < window.innerHeight * 0.3) current = i; });
      tocLinks.forEach(function (a, i) { if (i === current) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    };
    window.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Forms ----------
     Demo only: forms are checked in the browser and then show a success message,
     but nothing is sent. To receive submissions, add an action
     (e.g. https://formspree.io/f/your-id) and replace the "demo" block below with:
       fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
     then show the success message when the response is ok. */
  // A short reference for the confirmation, like HS-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  function messageFor(field) {
    var v = field.validity;
    if (v.valueMissing) {
      if (field.type === 'checkbox') return 'Please check this box to continue.';
      if (field.tagName === 'SELECT') return 'Please choose an option.';
      return 'Please fill in this field.';
    }
    if (v.typeMismatch && field.type === 'email') return 'Please enter a valid email address, like name@company.example.';
    if (v.tooShort) return 'Please write at least ' + field.minLength + ' characters.';
    return '';
  }
  function setError(holder, field, msg) {
    var id = 'err-' + (field.form && field.form.id ? field.form.id + '-' : '') + field.name;
    var err = document.getElementById(id);
    if (msg) {
      if (!err) {
        err = document.createElement('p');
        err.className = 'field-error';
        err.id = id;
        holder.appendChild(err);
      }
      err.textContent = msg;
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', id);
    } else {
      if (err) err.remove();
      field.removeAttribute('aria-invalid');
      field.removeAttribute('aria-describedby');
    }
  }
  function checkField(field) {
    var msg = messageFor(field);
    setError(field.closest('[data-field]') || field.parentNode, field, msg);
    return !msg;
  }
  function checkGroup(group) {
    var inputs = $$('input', group);
    var ok = inputs.some(function (i) { return i.checked; });
    var err = $('.field-error', group);
    if (!ok) {
      if (!err) {
        err = document.createElement('p');
        err.className = 'field-error';
        err.id = group.id + '-error';
        group.appendChild(err);
      }
      err.textContent = group.dataset.requiredGroup;
      inputs.forEach(function (i) { i.setAttribute('aria-describedby', err.id); });
    } else if (err) {
      err.remove();
      inputs.forEach(function (i) { i.removeAttribute('aria-describedby'); });
    }
    return ok;
  }

  $$('form[data-validate]').forEach(function (form) {
    var fields = $$('input, select, textarea', form).filter(function (f) {
      return !f.closest('[data-required-group]') && (f.required || f.type === 'email');
    });
    var groups = $$('[data-required-group]', form);

    fields.forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value || f.type === 'checkbox') checkField(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid')) checkField(f); });
      f.addEventListener('change', function () { if (f.getAttribute('aria-invalid')) checkField(f); });
    });
    groups.forEach(function (g) { g.addEventListener('change', function () { if ($('.field-error', g)) checkGroup(g); }); });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = fields.map(checkField).concat(groups.map(checkGroup)).every(Boolean);
      if (!ok) {
        var bad = $('[aria-invalid="true"], [data-required-group] .field-error', form);
        if (bad) (bad.matches('.field-error') ? $('input', bad.parentNode) : bad).focus();
        return;
      }
      // Demo only: nothing is sent. See the comment above to connect a form service.
      var success = $('[data-success]', form.parentNode);
      $$('[data-ref]', success).forEach(function (el) { el.textContent = makeRef('HS'); });
      form.hidden = true;
      success.hidden = false;
      success.focus();
    });
  });

  $$('[data-reset-form]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var wrap = btn.closest('[data-form-wrap]');
      var form = $('form', wrap);
      form.reset();
      form.hidden = false;
      $('[data-success]', wrap).hidden = true;
      $('input, select, textarea', form).focus();
    });
  });

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
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
