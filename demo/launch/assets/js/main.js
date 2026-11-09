/* Launch — site scripts. Vanilla JavaScript, no dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Dark mode ----------
     The initial theme is applied by a tiny inline script in <head> to avoid a flash.
     Here we only wire up the toggle buttons and remember the choice. */
  document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dark = root.classList.toggle('dark');
      try { localStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
      updateThemeLabels();
    });
  });
  function updateThemeLabels() {
    var dark = root.classList.contains('dark');
    document.querySelectorAll('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-pressed', String(dark));
    });
  }
  updateThemeLabels();

  /* ---------- Sticky header shadow ---------- */
  var header = document.getElementById('site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Mobile menu ---------- */
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
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });
    menu.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    window.matchMedia('(min-width: 768px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- Scroll reveal + count-up numbers ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  var countEls = document.querySelectorAll('[data-count]');

  function countUp(el) {
    var target = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var suffix = el.dataset.suffix || '';
    var format = function (n) {
      return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    };
    if (reduceMotion) { el.textContent = format(target); return; }
    var start = null;
    var duration = 1400;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = format(target * eased);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        if (el.hasAttribute('data-count')) countUp(el);
        else el.classList.add('is-visible');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    revealEls.forEach(function (el) { io.observe(el); });
    countEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    countEls.forEach(countUp);
  }

  /* ---------- Pricing: monthly / annual toggle ---------- */
  var billing = document.querySelector('[data-billing-toggle]');
  if (billing) {
    var setBilling = function (annual) {
      billing.setAttribute('aria-checked', String(annual));
      document.querySelectorAll('[data-price-monthly]').forEach(function (el) {
        el.textContent = annual ? el.dataset.priceAnnual : el.dataset.priceMonthly;
      });
      document.querySelectorAll('[data-billing-note]').forEach(function (el) {
        el.textContent = annual ? el.dataset.annualNote : el.dataset.monthlyNote;
      });
      document.querySelectorAll('[data-billing-label]').forEach(function (el) {
        var active = (el.dataset.billingLabel === 'annual') === annual;
        el.classList.toggle('text-zinc-900', active);
        el.classList.toggle('dark:text-white', active);
        el.classList.toggle('text-zinc-500', !active);
      });
    };
    billing.addEventListener('click', function () {
      setBilling(billing.getAttribute('aria-checked') !== 'true');
    });
    document.querySelectorAll('[data-billing-label]').forEach(function (el) {
      el.addEventListener('click', function () { setBilling(el.dataset.billingLabel === 'annual'); });
    });
    setBilling(false);
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('[data-accordion-button]').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    panel.inert = true;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.classList.toggle('grid-rows-[1fr]', open);
      panel.classList.toggle('grid-rows-[0fr]', !open);
      panel.classList.toggle('opacity-100', open);
      panel.classList.toggle('opacity-0', !open);
      panel.inert = !open;
    });
  });

  /* ---------- Tabs (sign in / create account) ---------- */
  document.querySelectorAll('[role="tablist"]').forEach(function (list) {
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var selected = t === tab;
        t.setAttribute('aria-selected', String(selected));
        t.tabIndex = selected ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (next) { e.preventDefault(); select(next, true); }
      });
    });
    // Open the tab named in the URL hash, e.g. login.html#signup
    var fromHash = tabs.filter(function (t) { return '#' + t.dataset.tab === location.hash; })[0];
    select(fromHash || tabs[0], false);
  });

  /* ---------- Show / hide password ---------- */
  document.querySelectorAll('[data-password-toggle]').forEach(function (btn) {
    var input = document.getElementById(btn.getAttribute('aria-controls'));
    btn.addEventListener('click', function () {
      var show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      btn.setAttribute('aria-pressed', String(show));
      btn.textContent = show ? 'Hide' : 'Show';
    });
  });

  /* ---------- Prefill contact topic from ?topic= ---------- */
  var topic = new URLSearchParams(location.search).get('topic');
  var topicSelect = document.getElementById('topic');
  if (topic && topicSelect) {
    Array.prototype.forEach.call(topicSelect.options, function (o) {
      if (o.value === topic) topicSelect.value = topic;
    });
  }

  /* ---------- Form validation ----------
     Forms marked data-validate are checked in the browser. To actually deliver
     messages, point the form's action at a service such as Formspree
     (https://formspree.io) and submit with fetch() inside onValid below. */
  var messages = {
    valueMissing: 'This field is required.',
    typeMismatch: 'Please enter a valid email address.',
    tooShort: function (el) { return 'Please use at least ' + el.minLength + ' characters.'; },
    patternMismatch: 'Please match the requested format.'
  };

  function errorFor(field) {
    var v = field.validity;
    if (v.valid) {
      if (field.dataset.match) {
        var other = document.getElementById(field.dataset.match);
        if (other && other.value !== field.value) return field.dataset.matchMessage || 'Values do not match.';
      }
      return '';
    }
    if (field.dataset.message) return field.dataset.message;
    if (v.valueMissing) return field.type === 'checkbox' ? 'Please check this box to continue.' : messages.valueMissing;
    if (v.typeMismatch) return messages.typeMismatch;
    if (v.tooShort) return messages.tooShort(field);
    if (v.patternMismatch) return messages.patternMismatch;
    return 'Please check this field.';
  }

  function showError(field, msg) {
    var el = document.getElementById(field.id + '-error');
    field.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (!el) return;
    el.textContent = msg;
    el.hidden = !msg;
  }

  document.querySelectorAll('form[data-validate]').forEach(function (form) {
    var fields = Array.prototype.slice.call(form.querySelectorAll('input, select, textarea'))
      .filter(function (f) { return f.id && f.type !== 'submit'; });
    var submitted = false;

    fields.forEach(function (f) {
      f.addEventListener(f.type === 'checkbox' || f.tagName === 'SELECT' ? 'change' : 'input', function () {
        if (submitted) showError(f, errorFor(f));
      });
      f.addEventListener('blur', function () {
        if (f.value && f.type !== 'checkbox') showError(f, errorFor(f));
      });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitted = true;
      var firstInvalid = null;
      fields.forEach(function (f) {
        var msg = errorFor(f);
        showError(f, msg);
        if (msg && !firstInvalid) firstInvalid = f;
      });
      if (firstInvalid) { firstInvalid.focus(); return; }
      onValid(form);
    });
  });

  // A short reference for confirmations, like LA-7K2Q (no 0/O or 1/I to misread).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  function onValid(form) {
    // Demo only: nothing is sent. Replace with a fetch() to your form endpoint.
    var success = document.getElementById(form.dataset.success);
    var refEl = success && success.querySelector('[data-ref]');
    if (refEl) refEl.textContent = makeRef('LA');
    var button = form.querySelector('[type="submit"]');
    button.disabled = true;
    button.classList.add('opacity-70');
    setTimeout(function () {
      form.hidden = true;
      if (success) { success.hidden = false; success.focus(); }
    }, 500);
  }

  document.querySelectorAll('[data-form-reset]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var form = document.getElementById(btn.dataset.formReset);
      var success = btn.closest('[tabindex]');
      form.reset();
      form.querySelectorAll('[aria-invalid]').forEach(function (f) { showError(f, ''); });
      var button = form.querySelector('[type="submit"]');
      button.disabled = false;
      button.classList.remove('opacity-70');
      if (success) success.hidden = true;
      form.hidden = false;
      var first = form.querySelector('input, select, textarea');
      if (first) first.focus();
    });
  });

  /* ---------- Current year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
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
