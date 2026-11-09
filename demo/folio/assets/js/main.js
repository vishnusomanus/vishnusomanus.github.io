/* Folio — site interactions. Vanilla JavaScript, no dependencies. */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  /* Header: add a background once the page scrolls */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var toggle = document.querySelector('.menu-toggle');
  var menu = document.getElementById('mobile-menu');
  if (toggle && menu) {
    var setMenu = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        menu.hidden = false;
        requestAnimationFrame(function () { menu.classList.add('is-open'); });
        var first = menu.querySelector('a');
        if (first) first.focus();
      } else {
        menu.classList.remove('is-open');
        setTimeout(function () { if (toggle.getAttribute('aria-expanded') === 'false') menu.hidden = true; }, 350);
      }
    };
    toggle.addEventListener('click', function () {
      setMenu(toggle.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        toggle.focus();
      }
    });
    window.matchMedia('(min-width: 768px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* Scroll reveal */
  var revealEls = document.querySelectorAll('.reveal, .reveal-line');
  if ('IntersectionObserver' in window && !reduceMotion) {
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

  /* Local time in the studio's city (footer + hero) */
  var clocks = document.querySelectorAll('[data-local-time]');
  if (clocks.length) {
    var fmt = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/New_York' });
    var tick = function () {
      var t = fmt.format(new Date());
      clocks.forEach(function (c) { c.textContent = t; });
    };
    tick();
    setInterval(tick, 30000);
  }

  /* Rolling dates: [data-months-ahead="n"] shows the month n months from now ("November 2026"; "Feb 2027"
     with data-month-format="short"; "December 15, 2026" with data-day="15"), so availability, start dates and
     deadlines never go stale. Replace the span with plain text to show a fixed date. */
  document.querySelectorAll('[data-months-ahead]').forEach(function (el) {
    var n = parseInt(el.getAttribute('data-months-ahead'), 10);
    if (!(n >= 0 && n <= 36)) return;
    var now = new Date(), d = new Date(now.getFullYear(), now.getMonth() + n, 1);
    var day = parseInt(el.getAttribute('data-day'), 10);
    var month = d.toLocaleDateString('en-US', { month: el.getAttribute('data-month-format') === 'short' ? 'short' : 'long' });
    el.textContent = month + ' ' + (day >= 1 && day <= 28 ? day + ', ' : '') + d.getFullYear();
  });

  /* Current year */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* Cursor follower over project cards (mouse/trackpad only) */
  if (finePointer && !reduceMotion) {
    var cursor = document.createElement('div');
    cursor.className = 'cursor';
    cursor.setAttribute('aria-hidden', 'true');
    cursor.textContent = 'View';
    document.body.appendChild(cursor);
    var x = 0, y = 0, cx = 0, cy = 0, raf = null;
    var loop = function () {
      cx += (x - cx) * 0.2;
      cy += (y - cy) * 0.2;
      cursor.style.setProperty('--x', cx + 'px');
      cursor.style.setProperty('--y', cy + 'px');
      raf = Math.abs(x - cx) + Math.abs(y - cy) > 0.5 ? requestAnimationFrame(loop) : null;
    };
    window.addEventListener('mousemove', function (e) {
      x = e.clientX; y = e.clientY;
      if (!raf) raf = requestAnimationFrame(loop);
    }, { passive: true });
    document.querySelectorAll('[data-cursor]').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursor.textContent = el.getAttribute('data-cursor') || 'View';
        cursor.classList.add('is-active');
      });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('is-active'); });
    });
  }

  /* Work filter */
  var filterGroup = document.querySelector('[data-filter-group]');
  if (filterGroup) {
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-category]'));
    var countEl = document.querySelector('[data-filter-count]');
    var buttons = filterGroup.querySelectorAll('button[data-filter]');
    var hideTimers = new Map(); // card -> pending hide after its fade-out

    var applyFilter = function (value) {
      var shown = 0;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === value)); });
      cards.forEach(function (card) {
        var match = value === 'all' || card.dataset.category.split(' ').indexOf(value) !== -1;
        if (match) shown++;
        if (reduceMotion) { card.hidden = !match; return; }
        if (match) {
          // Still fading out from a previous click: cancel the pending hide.
          clearTimeout(hideTimers.get(card));
          hideTimers.delete(card);
          if (card.hidden) {
            card.hidden = false;
            card.classList.add('is-hiding');
            requestAnimationFrame(function () {
              requestAnimationFrame(function () { card.classList.remove('is-hiding'); });
            });
          } else {
            card.classList.remove('is-hiding');
          }
        } else if (!card.hidden && !hideTimers.has(card)) {
          card.classList.add('is-hiding');
          hideTimers.set(card, setTimeout(function () {
            hideTimers.delete(card);
            card.hidden = true;
          }, 380));
        }
      });
      if (countEl) countEl.textContent = String(shown).padStart(2, '0');
      if (history.replaceState) {
        history.replaceState(null, '', value === 'all' ? location.pathname : '#' + value);
      }
    };

    buttons.forEach(function (b) {
      b.addEventListener('click', function () { applyFilter(b.dataset.filter); });
    });
    var initial = location.hash.slice(1);
    if (initial && filterGroup.querySelector('[data-filter="' + initial + '"]')) applyFilter(initial);
  }

  /* Copy email to clipboard */
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    // The label to go back to, read once: a second click within 1.8 s would otherwise read "Copied".
    var label = btn.querySelector('[data-copy-label]') || btn;
    var original = label.textContent;
    var timer;
    btn.addEventListener('click', function () {
      var value = btn.getAttribute('data-copy');
      var done = function (msg) {
        label.textContent = msg;
        clearTimeout(timer);
        timer = setTimeout(function () { label.textContent = original; }, 1800);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(value).then(function () { done('Copied'); }, function () { done('Press Ctrl+C'); });
      } else {
        done('Press Ctrl+C');
      }
    });
  });

  /* Project inquiry form validation.
     To receive submissions, set the form's action to your endpoint (for example
     https://formspree.io/f/your-id) and replace the success block below with a
     fetch() POST of new FormData(form). */
  var form = document.querySelector('[data-validate]');
  if (form) {
    var rules = {
      name: function (v) { return v.trim().length >= 2 || 'Please tell me your name.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'That email address doesn’t look right.'; },
      budget: function (v) { return !!v || 'Pick a budget range so I can plan.'; },
      timeline: function (v) { return !!v || 'When would you like to start?'; },
      message: function (v) { return v.trim().length >= 20 || 'A couple of sentences about the project, please (20+ characters).'; }
    };

    var validateField = function (field) {
      var rule = rules[field.name];
      if (!rule) return true;
      var result = rule(field.value);
      var error = document.getElementById(field.name + '-error');
      var ok = result === true;
      field.setAttribute('aria-invalid', String(!ok));
      if (error) error.textContent = ok ? '' : result;
      return ok;
    };

    Object.keys(rules).forEach(function (name) {
      var field = form.elements[name];
      if (!field) return;
      field.addEventListener('blur', function () { if (field.value) validateField(field); });
      field.addEventListener('input', function () {
        if (field.getAttribute('aria-invalid') === 'true') validateField(field);
      });
      field.addEventListener('change', function () { validateField(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        var field = form.elements[name];
        if (field && !validateField(field) && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) {
        firstInvalid.focus();
        return;
      }
      // Demo only: nothing is sent. Connect an endpoint as described above.
      var success = document.getElementById('form-success');
      form.hidden = true;
      if (success) {
        var nameEl = success.querySelector('[data-name]');
        if (nameEl) nameEl.textContent = form.elements.name.value.trim().split(' ')[0];
        // A short reference, like MO-7K2Q (no 0/O or 1/I to misread).
        var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', ref = 'MO-';
        for (var i = 0; i < 4; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
        var refEl = success.querySelector('[data-ref]');
        if (refEl) refEl.textContent = ref;
        success.hidden = false;
        success.focus();
      }
    });
  }
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
