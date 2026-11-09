/* Profile template — all interactivity. Vanilla JS, no dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var isMac = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function store(key, value) { try { localStorage.setItem(key, value); } catch (e) { /* storage blocked */ } }
  function read(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }

  /* ---------- Keyboard hint (⌘K on Mac, Ctrl K elsewhere) ---------- */
  $$('[data-kbd]').forEach(function (el) { el.textContent = isMac ? '⌘K' : 'Ctrl K'; });
  $$('[data-palette-open]').forEach(function (el) {
    el.setAttribute('aria-label', 'Search pages, ' + (isMac ? '⌘K' : 'Ctrl K'));
  });

  /* ---------- Dark mode ---------- */
  function syncThemeButtons() {
    var dark = root.classList.contains('dark');
    $$('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }
  function setTheme(dark, persist) {
    root.classList.toggle('dark', dark);
    if (persist) store('theme', dark ? 'dark' : 'light');
    syncThemeButtons();
  }
  function toggleTheme() { setTheme(!root.classList.contains('dark'), true); }
  $$('[data-theme-toggle]').forEach(function (btn) { btn.addEventListener('click', toggleTheme); });
  syncThemeButtons();
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      // Only follow the system setting when the visitor hasn't picked a theme ("dark" or "light").
      var saved = read('theme');
      if (saved !== 'dark' && saved !== 'light') setTheme(e.matches, false);
    });
  }

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('[data-menu-toggle]');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    if (!menuBtn || !menu) return;
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 768) setMenu(false); });
  }

  /* ---------- Command palette (Ctrl/⌘ + K) ---------- */
  var PAGES = [
    { label: 'About', hint: 'Home page', href: 'index.html' },
    { label: 'Résumé', hint: 'Experience, skills, education', href: 'resume.html' },
    { label: 'Projects', hint: 'Open source and client work', href: 'projects.html' },
    { label: 'tinytable case study', hint: 'Project deep-dive', href: 'project.html' },
    { label: 'Writing', hint: 'All posts', href: 'writing.html' },
    { label: 'The quiet power of <dialog>', hint: 'Latest post', href: 'post.html' },
    { label: 'Uses', hint: 'Hardware and software', href: 'uses.html' },
    { label: 'Contact', hint: 'Send a message', href: 'contact.html' },
    { label: 'Toggle dark mode', hint: 'Action', action: toggleTheme },
    { label: 'Print résumé', hint: 'Action', action: function () {
      // On the résumé page, print straight away (a hash-only change wouldn't reload it).
      if (document.querySelector('[data-print]')) window.print();
      else window.location.href = 'resume.html#print';
    } }
  ];

  var palette, paletteInput, paletteList, active = 0, results = PAGES;

  function buildPalette() {
    palette = document.createElement('dialog');
    palette.className = 'palette m-auto mt-[12vh] w-[min(560px,calc(100%-2rem))] overflow-hidden rounded-2xl border border-zinc-200 bg-white p-0 text-zinc-800 shadow-2xl dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200';
    palette.setAttribute('aria-label', 'Quick navigation');
    palette.innerHTML =
      '<div class="flex items-center gap-3 border-b border-zinc-200 px-4 dark:border-zinc-800">' +
        '<svg class="size-4 shrink-0 text-zinc-500 dark:text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>' +
        '<input type="text" class="h-14 w-full bg-transparent text-base outline-none placeholder:text-zinc-400" placeholder="Jump to a page or action…" role="combobox" aria-expanded="true" aria-controls="palette-list" aria-autocomplete="list" aria-label="Search pages and actions" autocomplete="off" spellcheck="false">' +
        '<span class="kbd">Esc</span>' +
      '</div>' +
      '<ul id="palette-list" role="listbox" aria-label="Results" class="max-h-80 overflow-y-auto p-2"></ul>' +
      '<p class="border-t border-zinc-200 px-4 py-2.5 text-xs text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">' +
        '<span class="kbd">↑</span> <span class="kbd">↓</span> to move · <span class="kbd">Enter</span> to open</p>';
    document.body.appendChild(palette);
    paletteInput = $('input', palette);
    paletteList = $('ul', palette);

    paletteInput.addEventListener('input', function () { filterPalette(paletteInput.value); });
    paletteInput.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(active + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(active - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); runItem(results[active]); }
    });
    // Close when clicking the backdrop.
    palette.addEventListener('click', function (e) { if (e.target === palette) palette.close(); });
  }

  function filterPalette(q) {
    q = q.trim().toLowerCase();
    results = PAGES.filter(function (p) { return !q || (p.label + ' ' + p.hint).toLowerCase().indexOf(q) !== -1; });
    paletteList.innerHTML = '';
    if (!results.length) {
      paletteList.innerHTML = '<li class="px-3 py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">No matches</li>';
      paletteInput.removeAttribute('aria-activedescendant');
      return;
    }
    results.forEach(function (item, i) {
      var li = document.createElement('li');
      li.id = 'palette-opt-' + i;
      li.setAttribute('role', 'option');
      li.className = 'palette-item flex cursor-pointer items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm';
      var label = document.createElement('span');
      label.className = 'font-medium';
      label.textContent = item.label;
      var hint = document.createElement('span');
      hint.className = 'text-xs text-zinc-500';
      hint.textContent = item.hint;
      li.appendChild(label);
      li.appendChild(hint);
      li.addEventListener('mousemove', function () { setActive(i); });
      li.addEventListener('click', function () { runItem(item); });
      paletteList.appendChild(li);
    });
    setActive(0);
  }

  function setActive(i) {
    if (!results.length) return;
    active = (i + results.length) % results.length;
    $$('[role="option"]', paletteList).forEach(function (li, n) {
      li.setAttribute('aria-selected', String(n === active));
    });
    var current = $('#palette-opt-' + active);
    paletteInput.setAttribute('aria-activedescendant', current.id);
    current.scrollIntoView({ block: 'nearest' });
  }

  function runItem(item) {
    if (!item) return;
    palette.close();
    if (item.action) item.action();
    else window.location.href = item.href;
  }

  function openPalette() {
    if (!palette) buildPalette();
    if (palette.open) return;
    setMenu(false);
    paletteInput.value = '';
    filterPalette('');
    palette.showModal();
    paletteInput.focus();
  }

  $$('[data-palette-open]').forEach(function (btn) { btn.addEventListener('click', openPalette); });
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (palette && palette.open) palette.close(); else openPalette();
    }
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = $$('.reveal');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if ('IntersectionObserver' in window && !reduceMotion) {
    // When an element reveals, also reveal everything above it, so content
    // skipped by a fast jump (End key, anchor link) is never left hidden.
    var reveal = function (el) { el.classList.add('is-visible'); io.unobserve(el); };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting && entry.boundingClientRect.top > 0) return;
        var idx = revealEls.indexOf(entry.target);
        for (var i = 0; i <= idx; i++) if (!revealEls[i].classList.contains('is-visible')) reveal(revealEls[i]);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Project filter ---------- */
  var grid = $('[data-project-grid]');
  if (grid) {
    var cards = $$('[data-tags]', grid);
    var status = $('[data-filter-status]');
    $$('[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var tag = btn.getAttribute('data-filter');
        $$('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var shown = 0;
        cards.forEach(function (card) {
          var match = tag === 'All' || card.getAttribute('data-tags').split(',').indexOf(tag) !== -1;
          card.hidden = !match;
          if (match) { shown++; card.classList.add('is-visible'); }
        });
        status.textContent = tag === 'All'
          ? 'Showing all ' + shown + ' projects'
          : 'Showing ' + shown + ' project' + (shown === 1 ? '' : 's') + ' tagged ' + tag;
      });
    });
  }

  /* ---------- Contribution graph (decorative sample data) ---------- */
  var contrib = $('[data-contrib]');
  if (contrib) {
    var seed = 7;
    var rand = function () { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    var cells = '';
    for (var d = 0; d < 52 * 7; d++) {
      var weekday = d % 7;
      var r = rand() * (weekday === 0 || weekday === 6 ? 0.55 : 1);
      var level = r < 0.25 ? 0 : r < 0.5 ? 1 : r < 0.72 ? 2 : r < 0.9 ? 3 : 4;
      cells += '<span class="cg-' + level + ' size-2.5 rounded-sm sm:size-3"></span>';
    }
    contrib.innerHTML = cells;
  }

  /* ---------- Writing search ---------- */
  var postSearch = $('[data-post-search]');
  if (postSearch) {
    var posts = $$('[data-post]');
    var groups = $$('[data-year-group]');
    var empty = $('[data-post-empty]');
    postSearch.addEventListener('input', function () {
      var q = postSearch.value.trim().toLowerCase();
      var total = 0;
      posts.forEach(function (li) {
        var match = !q || li.getAttribute('data-search').indexOf(q) !== -1;
        li.hidden = !match;
        if (match) { total++; li.classList.add('is-visible'); }
      });
      groups.forEach(function (g) { g.hidden = !$$('[data-post]:not([hidden])', g).length; });
      empty.classList.toggle('hidden', total > 0);
    });
  }

  /* ---------- Print résumé ---------- */
  $$('[data-print]').forEach(function (btn) { btn.addEventListener('click', function () { window.print(); }); });
  if (location.hash === '#print' && $('[data-print]')) {
    window.addEventListener('load', function () { setTimeout(function () { window.print(); }, 300); });
  }

  /* ---------- Copy email ---------- */
  var copyBtn = $('[data-copy-email]');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var email = $('[data-email]').textContent.trim();
      var statusEl = $('[data-copy-status]');
      var done = function (ok) {
        statusEl.textContent = ok ? 'Copied to clipboard.' : 'Press ' + (isMac ? '⌘C' : 'Ctrl+C') + ' to copy.';
        setTimeout(function () { statusEl.textContent = ''; }, 2500);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email).then(function () { done(true); }, function () { selectEmail(); done(false); });
      } else { selectEmail(); done(false); }
    });
  }
  function selectEmail() {
    var range = document.createRange();
    range.selectNodeContents($('[data-email]'));
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
  }

  /* ---------- Contact form validation ----------
     Demo only: shows a success state without sending.
     To send for real, give the <form> an action + method="POST" and
     replace the success block below with form.submit() or a fetch() call. */
  var form = $('[data-contact-form]');
  if (form) {
    var success = $('[data-form-success]');
    var message = form.elements.message;
    var count = $('[data-count]');
    message.addEventListener('input', function () { count.textContent = message.value.length; });

    var rules = {
      name: function (v) { return v.trim() ? '' : 'Please tell me your name.'; },
      email: function (v) {
        if (!v.trim()) return 'Please enter your email address.';
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'That email address doesn’t look right.';
      },
      topic: function (v) { return v ? '' : 'Please choose a topic.'; },
      message: function (v) {
        if (!v.trim()) return 'Please write a message.';
        return v.trim().length < 20 ? 'A little more detail, please (at least 20 characters).' : '';
      }
    };

    function validate(field) {
      var error = rules[field.name](field.value);
      var errEl = $('#' + field.name + '-error');
      field.setAttribute('aria-invalid', error ? 'true' : 'false');
      errEl.textContent = error;
      errEl.classList.toggle('hidden', !error);
      return !error;
    }

    Object.keys(rules).forEach(function (name) {
      var field = form.elements[name];
      field.addEventListener('blur', function () { if (field.value) validate(field); });
      field.addEventListener('input', function () { if (field.getAttribute('aria-invalid') === 'true') validate(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      Object.keys(rules).forEach(function (name) {
        var field = form.elements[name];
        if (!validate(field) && !firstInvalid) firstInvalid = field;
      });
      if (firstInvalid) { firstInvalid.focus(); return; }
      // A short reference, like SL-7K2Q (no 0/O or 1/I to misread).
      var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', ref = 'SL-';
      for (var i = 0; i < 4; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
      var refEl = success.querySelector('[data-ref]');
      if (refEl) refEl.textContent = ref;
      form.hidden = true;
      success.hidden = false;
      success.focus();
    });

    $('[data-form-reset]').addEventListener('click', function () {
      form.reset();
      count.textContent = '0';
      success.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
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
    el.textContent = month + (day >= 1 && day <= 28 ? ' ' + day + ',' : '') + ' ' + d.getFullYear();
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
