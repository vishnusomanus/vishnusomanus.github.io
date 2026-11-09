/* Pocket — site scripts. Vanilla JavaScript, no dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };

  /* ---------- Dark mode ----------
     The initial theme is applied by an inline script in <head> to avoid a flash. */
  function updateThemeLabels() {
    var dark = root.classList.contains('dark');
    $$('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-pressed', String(dark));
    });
  }
  $$('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dark = root.classList.toggle('dark');
      try { localStorage.setItem('pocket-theme', dark ? 'dark' : 'light'); } catch (e) {}
      updateThemeLabels();
    });
  });
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

  /* ---------- Scroll reveal + count-up numbers ----------
     Revealing an element also reveals everything above it, so fast jumps (End key,
     anchor links) never leave content hidden. */
  var revealEls = $$('.reveal');
  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    var target = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var suffix = el.dataset.suffix || '';
    var format = function (n) {
      return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    };
    if (reduceMotion) { el.textContent = format(target); return; }
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 1300, 1);
      el.textContent = format(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function show(el) {
    el.classList.add('is-visible');
    $$('[data-count]', el).forEach(countUp);
  }
  if (reduceMotion) {
    revealEls.forEach(show);
  } else {
    // Reveal everything whose top has scrolled above 92% of the viewport height. Checking
    // on scroll (not only when an element intersects) means jumps to the end, anchor links
    // and restored scroll positions never leave content hidden.
    var pending = revealEls.slice();
    var revealQueued = false;
    var checkReveals = function () {
      revealQueued = false;
      var limit = window.innerHeight * 0.92;
      pending = pending.filter(function (el) {
        if (el.getBoundingClientRect().top < limit) { show(el); return false; }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener('scroll', queueReveal);
        window.removeEventListener('resize', queueReveal);
      }
    };
    var queueReveal = function () {
      if (revealQueued) return;
      revealQueued = true;
      requestAnimationFrame(checkReveals);
    };
    window.addEventListener('scroll', queueReveal, { passive: true });
    window.addEventListener('resize', queueReveal);
    checkReveals();
  }

  /* ---------- Feature tour: the sticky phone shows the step in view ---------- */
  var tourPhone = $('[data-tour-phone]');
  var tourSteps = $$('[data-tour-step]');
  if (tourPhone && tourSteps.length && 'IntersectionObserver' in window) {
    var setScreen = function (name) {
      $$('[data-tour-screen]', tourPhone).forEach(function (s) { s.classList.toggle('is-active', s.dataset.tourScreen === name); });
      var step = tourSteps.filter(function (s) { return s.dataset.tourStep === name; })[0];
      if (step) tourPhone.setAttribute('aria-label', 'Pocket app: ' + $('h3', step).textContent);
    };
    var tio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) setScreen(entry.target.dataset.tourStep); });
    }, { rootMargin: '-45% 0px -45% 0px' });
    tourSteps.forEach(function (s) { tio.observe(s); });
  }

  /* ---------- Screenshot carousel ---------- */
  var carousel = $('[data-carousel]');
  if (carousel) {
    var track = $('[data-carousel-track]', carousel);
    var slides = $$('[data-slide]', track);
    var prev = $('[data-carousel-prev]', carousel);
    var next = $('[data-carousel-next]', carousel);
    var status = $('[data-carousel-status]', carousel);
    // Index of the first slide whose left edge is inside the track (the one at the left edge).
    var first = function () {
      var left = track.getBoundingClientRect().left;
      for (var i = 0; i < slides.length; i++) {
        if (slides[i].getBoundingClientRect().right > left + slides[i].offsetWidth * 0.5) return i;
      }
      return slides.length - 1;
    };
    var visible = function () {
      var r = track.getBoundingClientRect();
      return slides.filter(function (s) {
        var b = s.getBoundingClientRect();
        return b.left >= r.left - b.width * 0.4 && b.right <= r.right + b.width * 0.4;
      });
    };
    var go = function (i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      var pad = parseFloat(window.getComputedStyle(track).paddingLeft) || 0;
      track.scrollTo({ left: slides[i].offsetLeft - pad, behavior: reduceMotion ? 'auto' : 'smooth' });
    };
    var sync = function () {
      var v = visible();
      var a = slides.indexOf(v[0]) + 1, b = slides.indexOf(v[v.length - 1]) + 1;
      status.textContent = v.length > 1 ? 'Showing screens ' + a + '\u2013' + b + ' of ' + slides.length
        : 'Showing screen ' + (a || first() + 1) + ' of ' + slides.length;
      prev.disabled = track.scrollLeft < 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    prev.addEventListener('click', function () { go(first() - 1); });
    next.addEventListener('click', function () { go(first() + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.target !== track) return;
      if (e.key === 'ArrowRight') { e.preventDefault(); go(first() + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(first() - 1); }
    });
    var queued = false;
    track.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () { queued = false; sync(); });
    }, { passive: true });
    window.addEventListener('resize', sync);
    sync();
  }

  /* ---------- Lightbox ---------- */
  var lightbox = $('[data-lightbox]');
  if (lightbox) {
    var items = $$('[data-lightbox-item]');
    var phoneSlot = $('[data-lightbox-phone]', lightbox);
    var index = 0;
    var opener = null;
    var render = function () {
      var t = items[index];
      phoneSlot.innerHTML = '';
      phoneSlot.appendChild(t.content.cloneNode(true));
      $('[data-lightbox-title]', lightbox).textContent = t.dataset.title;
      $('[data-lightbox-caption]', lightbox).textContent = t.dataset.caption;
      $('[data-lightbox-count]', lightbox).textContent = 'Screen ' + (index + 1) + ' of ' + items.length;
    };
    var open = function (i, from) {
      index = i;
      opener = from;
      render();
      lightbox.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      $('[data-lightbox-close]', lightbox).focus();
    };
    var close = function () {
      lightbox.classList.remove('is-open');
      document.body.style.overflow = '';
      if (opener) opener.focus();
    };
    var step = function (d) { index = (index + d + items.length) % items.length; render(); };
    $$('[data-lightbox-open]').forEach(function (btn) {
      btn.addEventListener('click', function () { open(parseInt(btn.dataset.lightboxOpen, 10), btn); });
    });
    $('[data-lightbox-close]', lightbox).addEventListener('click', close);
    $('[data-lightbox-prev]', lightbox).addEventListener('click', function () { step(-1); });
    $('[data-lightbox-next]', lightbox).addEventListener('click', function () { step(1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); }
      if (e.key === 'ArrowRight') step(1);
      if (e.key === 'ArrowLeft') step(-1);
      if (e.key === 'Tab') {
        var f = $$('button', lightbox);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Pricing: monthly / yearly ---------- */
  var billingBtns = $$('[data-billing]');
  if (billingBtns.length) {
    var setBilling = function (annual) {
      billingBtns.forEach(function (b) { b.setAttribute('aria-pressed', String((b.dataset.billing === 'annual') === annual)); });
      $$('[data-price-monthly]').forEach(function (el) { el.textContent = annual ? el.dataset.priceAnnual : el.dataset.priceMonthly; });
      $$('[data-billing-note]').forEach(function (el) { el.textContent = annual ? el.dataset.annualNote : el.dataset.monthlyNote; });
      var s = $('[data-billing-status]');
      if (s) s.textContent = annual ? 'Showing yearly prices' : 'Showing monthly prices';
    };
    billingBtns.forEach(function (b) { b.addEventListener('click', function () { setBilling(b.dataset.billing === 'annual'); }); });
  }

  /* ---------- Accordions (FAQ, help center) ---------- */
  function setPanel(btn, open) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    btn.setAttribute('aria-expanded', String(open));
    panel.classList.toggle('grid-rows-[1fr]', open);
    panel.classList.toggle('grid-rows-[0fr]', !open);
    panel.classList.toggle('opacity-100', open);
    panel.classList.toggle('opacity-0', !open);
    panel.inert = !open;
  }
  $$('[data-accordion-button]').forEach(function (btn) {
    setPanel(btn, false);
    btn.addEventListener('click', function () { setPanel(btn, btn.getAttribute('aria-expanded') !== 'true'); });
  });

  /* ---------- Release notes filters ---------- */
  var releases = $$('[data-release]');
  if (releases.length) {
    var typeBtns = $$('[data-change-filter]');
    var platformSelect = $('[data-platform-filter]');
    var type = 'all';
    var applyFilters = function () {
      var platform = platformSelect.value;
      var changes = 0, shown = 0;
      releases.forEach(function (r) {
        var platformOk = platform === 'all' || r.dataset.platform === 'both' || r.dataset.platform === platform;
        var visible = 0;
        $$('[data-change]', r).forEach(function (li) {
          var ok = platformOk && (type === 'all' || li.dataset.change === type);
          li.hidden = !ok;
          if (ok) visible++;
        });
        r.hidden = visible === 0;
        if (visible) { shown++; changes += visible; }
      });
      $('[data-change-count]').textContent = changes + (changes === 1 ? ' change' : ' changes') + ' in ' + shown + (shown === 1 ? ' release' : ' releases');
      $('[data-change-empty]').classList.toggle('hidden', shown > 0);
    };
    typeBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        type = b.dataset.changeFilter;
        typeBtns.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        applyFilters();
      });
    });
    platformSelect.addEventListener('change', applyFilters);
    applyFilters();
  }

  /* ---------- Help center search ---------- */
  var helpSearch = $('[data-help-search]');
  if (helpSearch) {
    var groups = $$('[data-help-group]');
    var helpCount = $('[data-help-count]');
    var filterHelp = function () {
      var q = helpSearch.value.trim().toLowerCase();
      var total = 0;
      groups.forEach(function (g) {
        var n = 0;
        $$('[data-faq-item]', g).forEach(function (item) {
          var match = !q || item.textContent.toLowerCase().indexOf(q) !== -1;
          item.hidden = !match;
          if (match) n++;
        });
        g.hidden = n === 0;
        total += n;
      });
      helpCount.textContent = q ? total + (total === 1 ? ' article matches' : ' articles match') + ' “' + helpSearch.value.trim() + '”' : '';
      $('[data-help-empty]').classList.toggle('hidden', total > 0);
    };
    helpSearch.addEventListener('input', filterHelp);
  }

  /* ---------- Copy to clipboard (press kit) ---------- */
  var toast = $('[data-toast]');
  var toastTimer;
  function notify(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('is-visible'); }, 2200);
  }
  function copy(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (resolve, reject) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy') ? resolve() : reject(); } catch (e) { reject(e); }
      document.body.removeChild(ta);
    });
  }
  $$('[data-copy], [data-copy-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.dataset.copy || (document.getElementById(btn.dataset.copyTarget) || {}).textContent || '';
      copy(text.trim()).then(function () {
        notify(btn.dataset.copyTarget ? 'Copied the boilerplate text' : 'Copied “' + text.trim() + '”');
      }, function () { notify('Copy failed: select the text and copy it manually'); });
    });
  });

  /* ---------- Privacy policy: highlight the section in view ---------- */
  var tocLinks = $$('[data-toc-link]');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var mark = function (id) {
      tocLinks.forEach(function (a) {
        if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true');
        else a.removeAttribute('aria-current');
      });
    };
    var sio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) mark(entry.target.id); });
    }, { rootMargin: '-25% 0px -65% 0px' });
    $$('[data-toc-section]').forEach(function (s) { sio.observe(s); });
    mark(tocLinks[0].getAttribute('href').slice(1));
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

  // A short reference, like PO-7K2Q (no 0/O or 1/I to misread).
  function makeRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', ref = 'PO-';
    for (var i = 0; i < 4; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
    return ref;
  }

  function onValid(form) {
    // Demo only: nothing is sent. Replace with a fetch() to your form endpoint.
    var success = document.getElementById(form.dataset.success);
    var refEl = success && success.querySelector('[data-ref]');
    if (refEl) refEl.textContent = makeRef();
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
