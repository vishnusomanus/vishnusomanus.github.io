/* Northbound Studio — site scripts. Vanilla JavaScript, no dependencies. */
(function () {
  'use strict';

  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Kick off the headline line-reveal once the page has painted.
  requestAnimationFrame(function () { document.body.classList.add('is-loaded'); });

  /* ---------- Header: solid background once the page scrolls ---------- */
  var header = $('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 12); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('[data-menu-button]');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('overflow-hidden', open);
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
  function countUp(el) {
    var target = parseFloat(el.dataset.countTo);
    var suffix = el.dataset.suffix || '';
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null;
    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / 1600, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = $$('[data-count-to]');
  if (counters.length && 'IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); }
      });
    }, { threshold: .4 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Rotating word in the hero ---------- */
  var rotator = $('[data-rotator]');
  if (rotator && !reduceMotion) {
    var words = $$('span', rotator);
    var idx = 0;
    setInterval(function () {
      var cur = words[idx];
      idx = (idx + 1) % words.length;
      cur.classList.remove('is-active');
      cur.classList.add('is-leaving');
      words[idx].classList.remove('is-leaving');
      words[idx].classList.add('is-active');
      setTimeout(function () { cur.classList.remove('is-leaving'); }, 600);
    }, 2600);
  }

  /* ---------- Testimonial carousel ---------- */
  $$('[data-carousel]').forEach(function (car) {
    var slides = $$('[data-slide]', car);
    var dots = $$('[data-dot]', car);
    var toggle = $('[data-carousel-toggle]', car);
    var status = $('[data-carousel-status]', car);
    var current = 0;
    var timer = null;
    var userPaused = reduceMotion;

    function show(n, announce) {
      current = (n + slides.length) % slides.length;
      slides.forEach(function (s, i) { s.setAttribute('aria-hidden', String(i !== current)); s.inert = i !== current; });
      dots.forEach(function (d, i) { d.setAttribute('aria-current', String(i === current)); });
      if (announce && status) status.textContent = 'Testimonial ' + (current + 1) + ' of ' + slides.length;
    }
    function play() {
      stop();
      if (!userPaused) timer = setInterval(function () { show(current + 1, false); }, 7000);
    }
    function stop() { clearInterval(timer); timer = null; }
    function setPaused(p) {
      userPaused = p;
      toggle.setAttribute('aria-label', p ? 'Play testimonials' : 'Pause testimonials');
      $('[data-icon-pause]', toggle).hidden = p;
      $('[data-icon-play]', toggle).hidden = !p;
      p ? stop() : play();
    }

    $('[data-prev]', car).addEventListener('click', function () { show(current - 1, true); play(); });
    $('[data-next]', car).addEventListener('click', function () { show(current + 1, true); play(); });
    dots.forEach(function (d, i) { d.addEventListener('click', function () { show(i, true); play(); }); });
    toggle.addEventListener('click', function () { setPaused(!userPaused); });
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { show(current - 1, true); play(); }
      if (e.key === 'ArrowRight') { show(current + 1, true); play(); }
    });
    // Pause while the visitor is reading or interacting.
    car.addEventListener('mouseenter', stop);
    car.addEventListener('mouseleave', play);
    car.addEventListener('focusin', stop);
    car.addEventListener('focusout', function (e) { if (!car.contains(e.relatedTarget)) play(); });

    show(0, false);
    setPaused(userPaused);
  });

  /* ---------- Filters (work page and careers page) ---------- */
  $$('[data-filter-group]').forEach(function (group) {
    var key = group.dataset.filterGroup;               // e.g. "industry" or "department"
    var items = $$('[data-' + key + ']', document).filter(function (el) { return !el.matches('[data-filter]'); });
    var buttons = $$('[data-filter]', group);
    var countEl = $('[data-filter-count="' + key + '"]');
    var emptyEl = $('[data-filter-empty="' + key + '"]');

    buttons.forEach(function (b) {
      var n = b.dataset.filter === 'all' ? items.length
        : items.filter(function (it) { return it.dataset[key] === b.dataset.filter; }).length;
      var c = $('.count', b);
      if (c) c.textContent = String(n).padStart(2, '0');
    });

    function apply(value, updateHash) {
      var shown = 0;
      items.forEach(function (it) {
        var match = value === 'all' || it.dataset[key] === value;
        it.hidden = !match;
        if (match) { shown++; it.classList.add('is-in'); }
      });
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === value)); });
      if (countEl) countEl.textContent = shown + (shown === 1 ? ' result' : ' results');
      if (emptyEl) emptyEl.hidden = shown > 0;
      if (updateHash) history.replaceState(null, '', value === 'all' ? location.pathname : '#' + value);
    }
    group.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filter]');
      if (b) apply(b.dataset.filter, true);
    });
    var fromHash = decodeURIComponent(location.hash.slice(1));
    var valid = buttons.some(function (b) { return b.dataset.filter === fromHash; });
    apply(valid ? fromHash : 'all', false);
  });

  /* ---------- Before / after comparison ---------- */
  $$('[data-compare]').forEach(function (cmp) {
    var input = $('input[type="range"]', cmp);
    function update() { cmp.style.setProperty('--pos', input.value + '%'); }
    input.addEventListener('input', update);
    update();
  });

  /* ---------- Careers: "Apply" buttons preselect the role ---------- */
  $$('[data-apply]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var select = $('#apply-role');
      if (select) select.value = btn.dataset.apply;
    });
  });

  /* ---------- Contact: budget slider label ---------- */
  var budget = $('#budget');
  if (budget) {
    var out = $('[data-budget-out]');
    var steps = ['Under $25k', '$25k – $50k', '$50k – $100k', '$100k – $250k', '$250k+'];
    var updateBudget = function () {
      out.textContent = steps[budget.value];
      budget.setAttribute('aria-valuetext', steps[budget.value]);
    };
    budget.addEventListener('input', updateBudget);
    updateBudget();
  }

  /* ---------- Office clocks ---------- */
  var clocks = $$('[data-tz]');
  function tick() {
    clocks.forEach(function (el) {
      try {
        el.textContent = new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: '2-digit', timeZone: el.dataset.tz }).format(new Date());
      } catch (e) { /* unknown time zone: keep the placeholder */ }
    });
  }
  if (clocks.length) { tick(); setInterval(tick, 30000); }

  /* ---------- Form validation ----------
     Forms check themselves in the browser and then show a success message.
     To receive submissions, add an action (e.g. https://formspree.io/f/your-id)
     and replace the "demo" block below with:
       fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
     then show the success message when the response is ok. */
  // A short reference for confirmations, like NS-7K2Q (no 0/O or 1/I to misread).
  function makeRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return 'NS-' + out;
  }
  function messageFor(field) {
    var v = field.validity;
    if (v.valueMissing) return field.type === 'checkbox' ? 'Please check this box to continue.' : 'Please fill in this field.';
    if (v.typeMismatch && field.type === 'email') return 'Please enter a valid email address, like name@company.example.';
    if (v.typeMismatch && field.type === 'url') return 'Please enter a full link, starting with https://';
    if (v.tooShort) return 'Please write at least ' + field.minLength + ' characters.';
    return '';
  }
  function setError(holder, field, msg) {
    var err = $('.field-error[data-for="' + field.name + '"]', holder.form || holder);
    if (msg) {
      if (!err) {
        err = document.createElement('p');
        err.className = 'field-error';
        err.dataset.for = field.name;
        err.id = 'err-' + field.name;
        holder.appendChild(err);
      }
      err.textContent = msg;
      field.setAttribute('aria-invalid', 'true');
      field.setAttribute('aria-describedby', err.id);
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
    var boxes = $$('input[type="checkbox"]', group);
    var ok = boxes.some(function (b) { return b.checked; });
    var err = $('.field-error', group);
    if (!ok) {
      if (!err) {
        err = document.createElement('p');
        err.className = 'field-error';
        err.id = group.id + '-error';
        group.appendChild(err);
      }
      err.textContent = group.dataset.requiredGroup;
      boxes[0].setAttribute('aria-describedby', err.id);
    } else if (err) {
      err.remove();
      boxes[0].removeAttribute('aria-describedby');
    }
    return ok;
  }

  $$('form[data-validate]').forEach(function (form) {
    var fields = $$('input, select, textarea', form).filter(function (f) {
      return f.type !== 'range' && !f.closest('[data-required-group]') && (f.required || f.type === 'email' || f.type === 'url');
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
        var bad = $('[aria-invalid="true"]', form) || $('[data-required-group] .field-error', form);
        if (bad) {
          var target = bad.matches('.field-error') ? $('input', bad.parentNode) : bad;
          target.focus();
        }
        return;
      }
      // Demo only: nothing is sent. See the comment above to connect a form service.
      var success = $('[data-success]', form.parentNode);
      var ref = $('[data-ref]', success);
      if (ref) ref.textContent = makeRef();
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
      if (budget) budget.dispatchEvent(new Event('input'));
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
