/* Clearwater Trust — site scripts. Vanilla JS, no dependencies. */
(function () {
  'use strict';
  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var money = function (n, dp) {
    return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: dp ? 2 : 0, maximumFractionDigits: dp ? 2 : 0 });
  };
  // A short reference for a confirmation, like CT-7K2Q (no 0/O or 1/I to misread over the phone).
  var makeRef = function () {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return 'CT-' + out;
  };

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Mobile menu ---------- */
  var toggle = $('[data-menu-toggle]');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    menu.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('[data-open]', toggle).classList.toggle('hidden', open);
    $('[data-close]', toggle).classList.toggle('hidden', !open);
  }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { setMenu(menu.hidden); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); toggle.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- Header shadow on scroll ---------- */
  var header = $('.site-header');
  function onScroll() { if (header) header.classList.toggle('is-scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Count-up numbers ---------- */
  function countUp(el) {
    var target = Number(el.dataset.count);
    if (reduceMotion) { el.textContent = target.toLocaleString('en-US'); return; }
    var start = null;
    var dur = 1600;
    function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-US');
      if (p < 1) requestAnimationFrame(step);
    }
    el.textContent = '0';
    requestAnimationFrame(step);
  }

  /* ---------- Campaign progress ---------- */
  // Amounts come from data-raised and data-goal on the [data-campaign] box; the
  // printed figures and the progress bar are filled in from them.
  function fillProgress(box) {
    var raised = Number(box.dataset.raised), goal = Number(box.dataset.goal);
    var pct = Math.min(100, Math.round(raised / goal * 100));
    var money = function (n) { return n.toLocaleString('en-US'); };
    var raisedText = $('[data-raised-text]', box); if (raisedText) raisedText.textContent = money(raised);
    var goalText = $('[data-goal-text]', box); if (goalText) goalText.textContent = money(goal);
    var bar = $('[role="progressbar"]', box); if (bar) bar.setAttribute('aria-valuenow', String(pct));
    $('[data-progress]', box).style.width = pct + '%';
  }

  /* ---------- Scroll reveal ---------- */
  // When something reveals, everything before it in the page reveals too, so fast
  // jumps (End key, anchor links) never leave hidden content behind.
  var reveals = $$('.reveal');
  function revealUpTo(el) {
    var idx = reveals.indexOf(el);
    for (var i = 0; i <= idx; i++) reveals[i].classList.add('is-in');
  }
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting || en.boundingClientRect.top < 0) { revealUpTo(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Counters and progress bars start when they come into view.
  var once = function (els, fn) {
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(fn); return; }
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { fn(en.target); obs.unobserve(en.target); } });
    }, { threshold: 0.4 });
    els.forEach(function (el) { obs.observe(el); });
  };
  once($$('[data-count]'), countUp);
  once($$('[data-campaign]'), fillProgress);

  /* ---------- Programs: region filter + map ---------- */
  var REGIONS = {
    all: ['All regions', '1.24 million people across 9 countries'],
    'east-africa': ['East Africa', 'Kenya, Uganda and Ethiopia · 612,000 people'],
    'southern-africa': ['Southern Africa', 'Malawi, Mozambique and Zambia · 341,000 people'],
    'south-asia': ['South Asia', 'Nepal and Bangladesh · 198,000 people'],
    'latin-america': ['Latin America', 'Bolivia · 89,000 people']
  };
  var programs = $('[data-programs]');
  if (programs) {
    var map = $('[data-map]');
    var setRegion = function (region) {
      if (!REGIONS[region]) region = 'all';
      $$('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.filter === region)); });
      var shown = 0;
      $$('[data-region]', programs).forEach(function (card) {
        var match = region === 'all' || card.dataset.region === region;
        card.hidden = !match;
        if (match) { shown++; card.classList.add('is-in'); }
      });
      if (region === 'all') map.removeAttribute('data-active'); else map.setAttribute('data-active', region);
      $$('[data-region]', map).forEach(function (el) { el.classList.toggle('is-active', el.dataset.region === region); });
      $('[data-region-title]').textContent = REGIONS[region][0];
      $('[data-region-text]').textContent = REGIONS[region][1];
      $('[data-program-count]').textContent = 'Showing ' + shown + (shown === 1 ? ' program' : ' programs');
      if (region === 'all') history.replaceState(null, '', location.pathname + location.search);
      else history.replaceState(null, '', '#' + region);
    };
    $$('[data-filter]').forEach(function (b) {
      b.addEventListener('click', function () { setRegion(b.dataset.filter); });
    });
    // Clicking a highlighted pin on the map filters too.
    $$('.pin', map).forEach(function (pin) {
      pin.style.cursor = 'pointer';
      pin.addEventListener('click', function () { setRegion(pin.dataset.region); });
    });
    setRegion(location.hash.slice(1) || 'all');
    window.addEventListener('hashchange', function () { setRegion(location.hash.slice(1) || 'all'); });
  }

  /* ---------- Generic form validation ---------- */
  function fieldMessage(f) {
    var v = f.validity;
    if (v.valueMissing) return f.type === 'checkbox' ? 'Please check this box to continue.' : (f.tagName === 'SELECT' ? 'Please choose an option.' : 'Please fill in this field.');
    if (v.typeMismatch) return 'Please enter a valid email address.';
    if (v.tooShort) return 'Please write at least ' + f.minLength + ' characters.';
    if (v.rangeUnderflow) return 'Please enter at least ' + f.min + '.';
    if (v.rangeOverflow) return 'Please enter no more than ' + f.max + '.';
    if (v.patternMismatch || v.customError) return f.validationMessage || 'Please check this value.';
    return '';
  }
  function showError(f, msg) {
    var wrap = f.closest('label') && f.type === 'checkbox' ? f.closest('label') : f.parentNode;
    var id = (f.id || f.name) + '-error';
    var err = document.getElementById(id);
    if (msg) {
      if (!err) {
        err = document.createElement('p');
        err.className = 'field-error';
        err.id = id;
        wrap.insertAdjacentElement(f.type === 'checkbox' ? 'afterend' : 'beforeend', err);
      }
      err.textContent = msg;
      f.setAttribute('aria-invalid', 'true');
      f.setAttribute('aria-describedby', id);
    } else {
      if (err) err.remove();
      f.removeAttribute('aria-invalid');
      f.removeAttribute('aria-describedby');
    }
    return !msg;
  }
  function validateField(f) { return showError(f, fieldMessage(f)); }
  function validateForm(form) {
    var fields = $$('input, select, textarea', form).filter(function (f) { return f.willValidate && !f.closest('[hidden]'); });
    var ok = true;
    fields.forEach(function (f) { if (!validateField(f)) ok = false; });
    if (!ok) { var first = $('[aria-invalid="true"]', form); if (first) first.focus(); }
    return ok;
  }
  function wireLiveValidation(form) {
    $$('input, select, textarea', form).forEach(function (f) {
      f.addEventListener('blur', function () { if (f.value || f.getAttribute('aria-invalid')) validateField(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid')) validateField(f); });
      f.addEventListener('change', function () { if (f.getAttribute('aria-invalid')) validateField(f); });
    });
  }

  $$('form[data-validate]').forEach(function (form) {
    wireLiveValidation(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      // To send for real, post the form to your form service before showing the message, e.g.
      //   fetch('https://formspree.io/f/your-form-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      // (or add action="https://formspree.io/f/your-form-id" to the <form> and use fetch(form.action, ...)).
      var ok = $('[data-success]', form);
      // {ref} in the message becomes a short reference, like CT-7K2Q.
      ok.textContent = (form.dataset.successText || 'Thank you! We’ve received your message.').replace('{ref}', makeRef());
      ok.classList.remove('hidden');
      form.reset();
      $$('[data-stepper] input', form).forEach(function (i) { i.value = i.defaultValue; });
    });
  });

  /* ---------- Volunteer: "Apply for this role" preselects the role ---------- */
  $$('[data-apply]').forEach(function (b) {
    b.addEventListener('click', function () {
      var sel = $('#v-role');
      sel.value = b.dataset.apply;
      $('#apply').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      sel.focus({ preventScroll: true });
    });
  });

  /* ---------- Events: RSVP buttons + guest stepper ---------- */
  $$('[data-rsvp]').forEach(function (b) {
    b.addEventListener('click', function () {
      var sel = $('#r-event');
      sel.value = b.dataset.rsvp;
      if (sel.getAttribute('aria-invalid')) validateField(sel);
      $('#rsvp').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      $('#r-name').focus({ preventScroll: true });
    });
  });
  $$('[data-stepper]').forEach(function (s) {
    var input = $('input', s);
    $$('[data-step]', s).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = (parseInt(input.value, 10) || 1) + Number(b.dataset.step);
        input.value = Math.max(Number(input.min), Math.min(Number(input.max), v));
      });
    });
  });

  /* ---------- Copy link on stories ---------- */
  $$('[data-copy-link]').forEach(function (b) {
    b.addEventListener('click', function () {
      var status = $('[data-copy-status]');
      var done = function (msg) { status.textContent = msg; setTimeout(function () { status.textContent = ''; }, 2500); };
      if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { done('Link copied'); }, function () { done('Copy failed. Copy the address bar instead.'); });
      else done('Copy the address bar to share');
    });
  });

  /* ---------- Donate form ---------- */
  var donate = $('[data-donate]');
  if (donate) {
    var AMOUNTS = { once: [25, 50, 100, 250, 500], monthly: [10, 25, 50, 100, 200] };
    // Edit these to match your own costs. Checked from the largest amount down.
    var IMPACT = [
      [500, 'repairs a broken well serving 300 people.', 'Parts, a trained mechanic and a water test, so a whole village drinks safely again.'],
      [250, 'protects a mountain spring for 40 people.', 'A concrete spring box and pipe keep the water free from animals and runoff.'],
      [100, 'trains a local pump mechanic for a month.', 'Skills and tools that keep dozens of water points running for years.'],
      [50, 'gives a family clean water for a year.', "That's water for drinking, cooking and washing, close to home."],
      [25, 'puts a hand-washing station in a classroom.', 'Clean hands cut diarrhoeal illness, the second biggest killer of young children.'],
      [10, 'keeps a family\'s water safe for 3 months.', 'Chlorine tablets and a hygiene kit for when water has to be stored.'],
      [0, 'helps bring water closer to home.', 'Every gift, of any size, is pooled to fund projects where they are needed most.']
    ];
    var state = { freq: 'once', amount: 50 };
    var custom = $('#d-custom');
    var fees = $('#d-fees');
    var amountsBox = $('[data-amounts]');

    // Appeals with matched giving; donate.html?appeal=<id> shows the "doubled" note only for these.
    var MATCHED_APPEALS = ['dry-season'];
    if (MATCHED_APPEALS.indexOf(new URLSearchParams(location.search).get('appeal')) !== -1) $('[data-appeal-note]').hidden = false;

    var renderAmounts = function () {
      amountsBox.innerHTML = AMOUNTS[state.freq].map(function (a) {
        return '<button type="button" class="amount" data-amount="' + a + '" aria-pressed="' + (a === state.amount && !custom.value) + '">$' + a + '</button>';
      }).join('');
    };
    var update = function () {
      var amt = state.amount;
      var fee = fees.checked ? Math.round(amt * 0.03 * 100) / 100 : 0;
      var total = amt + fee;
      var row = IMPACT.find(function (r) { return amt >= r[0]; });
      var monthly = state.freq === 'monthly';
      $('[data-impact-title]').textContent = (monthly ? money(amt) + ' a month ' : money(amt) + ' ') + row[1];
      $('[data-impact-text]').textContent = monthly ? row[2] + ' That\'s ' + money(amt * 12) + ' of impact every year.' : row[2];
      $('[data-fee]').textContent = money(Math.round(amt * 0.03 * 100) / 100, true);
      $('[data-sum-gift]').textContent = money(amt, true);
      $('[data-sum-fee]').textContent = money(fee, true);
      $('[data-sum-total]').textContent = money(total, true);
      $('[data-sum-freq]').textContent = monthly ? 'per month' : 'today';
      $('[data-submit-label]').textContent = 'Donate ' + money(total, true) + (monthly ? ' a month' : '');
    };

    $$('[data-frequency]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.freq = b.dataset.frequency;
        $$('[data-frequency]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        if (!custom.value) state.amount = state.freq === 'monthly' ? 25 : 50;
        renderAmounts();
        update();
      });
    });
    // The $5 minimum: checked on submit, and again as the amount changes so a fixed amount clears it.
    var checkMinimum = function () {
      var tooLow = custom.value && !(parseFloat(custom.value) >= 5);
      custom.setCustomValidity(tooLow ? 'The minimum gift is $5.' : '');
    };
    amountsBox.addEventListener('click', function (e) {
      var b = e.target.closest('[data-amount]');
      if (!b) return;
      state.amount = Number(b.dataset.amount);
      custom.value = '';
      checkMinimum();
      showError(custom, '');
      $$('[data-amount]', amountsBox).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
      update();
    });
    custom.addEventListener('input', function () {
      checkMinimum();
      var v = parseFloat(custom.value);
      if (v > 0) {
        state.amount = Math.round(v * 100) / 100;
        $$('[data-amount]', amountsBox).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
      }
      if (custom.getAttribute('aria-invalid')) validateField(custom);
      update();
    });
    fees.addEventListener('change', update);

    // Dedication toggle
    var ded = $('#d-dedicate');
    var dedBox = $('#dedication');
    var dedName = $('#d-ded-name');
    ded.addEventListener('change', function () {
      dedBox.hidden = !ded.checked;
      ded.setAttribute('aria-expanded', String(ded.checked));
      dedName.required = ded.checked;
      if (ded.checked) dedName.focus();
    });

    // Light formatting for the demo card fields
    var card = $('[data-card]');
    card.addEventListener('input', function () {
      var d = card.value.replace(/\D/g, '').slice(0, 19);
      card.value = d.replace(/(.{4})/g, '$1 ').trim();
      card.setCustomValidity('');
    });
    var exp = $('[data-expiry]');
    exp.addEventListener('input', function () {
      var d = exp.value.replace(/\D/g, '').slice(0, 4);
      exp.value = d.length > 2 ? d.slice(0, 2) + ' / ' + d.slice(2) : d;
      exp.setCustomValidity('');
    });
    $('#d-cvc').addEventListener('input', function () { this.setCustomValidity(''); });

    function luhn(num) {
      var sum = 0;
      var dbl = false;
      for (var i = num.length - 1; i >= 0; i--) {
        var n = Number(num[i]);
        if (dbl) { n *= 2; if (n > 9) n -= 9; }
        sum += n;
        dbl = !dbl;
      }
      return sum % 10 === 0;
    }

    wireLiveValidation(donate);
    donate.addEventListener('submit', function (e) {
      e.preventDefault();
      var digits = card.value.replace(/\D/g, '');
      card.setCustomValidity(digits && (digits.length < 13 || !luhn(digits)) ? 'Please enter a valid card number (try 4242 4242 4242 4242).' : '');
      var m = exp.value.match(/^(\d{2}) \/ (\d{2})$/);
      var now = new Date();
      var expired = m && (2000 + Number(m[2]) < now.getFullYear() || (2000 + Number(m[2]) === now.getFullYear() && Number(m[1]) < now.getMonth() + 1));
      exp.setCustomValidity(exp.value && (!m || Number(m[1]) < 1 || Number(m[1]) > 12 || expired) ? 'Please enter a valid future date as MM / YY.' : '');
      var cvc = $('#d-cvc');
      cvc.setCustomValidity(cvc.value && !/^\d{3,4}$/.test(cvc.value) ? 'Please enter the 3 or 4 digit code.' : '');
      checkMinimum();
      if (!validateForm(donate)) return;

      // Demo only: replace this with a call to your payment provider (e.g. redirect to Stripe Checkout).
      var name = $('#d-first').value.trim();
      var total = $('[data-sum-total]').textContent;
      var msg = $('[data-success]', donate);
      msg.innerHTML = '';
      var h = document.createElement('p');
      h.className = 'font-display text-2xl font-semibold';
      h.textContent = 'Thank you, ' + name + '.';
      var p = document.createElement('p');
      p.className = 'mt-2';
      p.textContent = 'Your ' + (state.freq === 'monthly' ? 'monthly ' : '') + 'gift of ' + total + ' ' + IMPACT.find(function (r) { return state.amount >= r[0]; })[1];
      var note = document.createElement('p');
      note.className = 'mt-3 text-sm font-semibold text-sea-800';
      note.textContent = 'Your gift reference is ' + makeRef() + '. No payment is taken on this site.';
      msg.append(h, p, note);
      msg.classList.remove('hidden');
      msg.focus();
    });

    renderAmounts();
    update();
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
