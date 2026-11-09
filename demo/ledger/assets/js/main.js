/* The Ledger — site scripts. Vanilla JavaScript, no dependencies. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- Theme toggle (initial theme is set inline in <head> to avoid a flash) ---------- */
  $all('[data-theme-toggle]').forEach(function (btn) {
    function sync() {
      var dark = root.classList.contains('dark');
      btn.setAttribute('aria-pressed', String(dark));
      btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    }
    sync();
    btn.addEventListener('click', function () {
      var dark = root.classList.toggle('dark');
      try { localStorage.setItem('ledger-theme', dark ? 'dark' : 'light'); } catch (e) {}
      $all('[data-theme-toggle]').forEach(function (b) {
        b.setAttribute('aria-pressed', String(dark));
        b.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
      });
    });
  });

  /* ---------- Mobile menu ---------- */
  var menuBtn = $('[data-menu-toggle]');
  var menu = menuBtn && document.getElementById(menuBtn.getAttribute('aria-controls'));
  if (menuBtn && menu) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
      $all('[data-menu-icon]', menuBtn).forEach(function (icon) {
        // SVG elements have no .hidden property, so toggle the attribute.
        icon.toggleAttribute('hidden', icon.getAttribute('data-menu-icon') !== (open ? 'close' : 'open'));
      });
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
    $all('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) setMenu(false); });
  }

  /* ---------- Scroll reveal ---------- */
  function observeReveals(scope) {
    var items = $all('.reveal:not(.is-visible)', scope);
    if (reduceMotion || !('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 });
    items.forEach(function (el) { io.observe(el); });
  }
  observeReveals();

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(message) {
    var el = $('[data-toast]');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
  }

  /* ---------- Article: reading time, progress bar, table of contents, sharing ---------- */
  // Words a reader reads: the essay's visible text, one text node at a time (so words in
  // neighboring tags never run together), leaving out the chart's SVG (its title, description
  // and labels), scripts, styles, anything hidden and the notes. Captions and code count.
  var SKIP_WORDS = 'svg, script, style, template, [hidden], [aria-hidden="true"], [aria-labelledby="notes-label"]';
  function countWords(root) {
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.parentElement.closest(SKIP_WORDS) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    var words = 0;
    while (walker.nextNode()) {
      var text = walker.currentNode.nodeValue.trim();
      if (text) words += text.split(/\s+/).length;
    }
    return words;
  }

  var article = $('[data-article]');
  if (article) {
    var minutes = Math.max(1, Math.round(countWords(article) / 230));
    $all('[data-reading-time]').forEach(function (el) { el.textContent = minutes + ' min read'; });

    var bar = $('[data-progress]');
    if (bar) {
      var updateProgress = function () {
        var rect = article.getBoundingClientRect();
        var total = article.offsetHeight - window.innerHeight;
        var done = Math.min(1, Math.max(0, -rect.top / (total > 0 ? total : 1)));
        bar.style.transform = 'scaleX(' + done + ')';
      };
      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress);
      updateProgress();
    }

    // Build the table of contents from the article's <h2> headings.
    var headings = $all('h2:not([data-toc-skip])', article);
    headings.forEach(function (h) {
      if (!h.id) {
        h.id = h.textContent.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      }
    });
    $all('[data-toc]').forEach(function (list) {
      list.innerHTML = headings.map(function (h) {
        return '<li><a class="toc-link" href="#' + h.id + '">' + escapeHtml(h.textContent) + '</a></li>';
      }).join('');
    });
    if ('IntersectionObserver' in window && headings.length) {
      var setActive = function (id) {
        $all('.toc-link').forEach(function (a) {
          var on = a.getAttribute('href') === '#' + id;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
        });
      };
      var tocIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      }, { rootMargin: '0px 0px -70% 0px', threshold: 0 });
      headings.forEach(function (h) { tocIo.observe(h); });
    }
    $all('[data-toc] a').forEach(function (a) {
      a.addEventListener('click', function () {
        var details = a.closest('details');
        if (details) details.open = false;
      });
    });
  }

  // Share links use the current page URL and title.
  var pageUrl = encodeURIComponent(window.location.href);
  var pageTitle = encodeURIComponent(document.title);
  $all('[data-share]').forEach(function (a) {
    var type = a.getAttribute('data-share');
    if (type === 'x') a.href = 'https://twitter.com/intent/tweet?url=' + pageUrl + '&text=' + pageTitle;
    if (type === 'linkedin') a.href = 'https://www.linkedin.com/sharing/share-offsite/?url=' + pageUrl;
    if (type === 'email') a.href = 'mailto:?subject=' + pageTitle + '&body=' + pageUrl;
  });

  $all('[data-copy-link]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var url = window.location.href.split('#')[0];
      var done = function () { toast('Link copied to clipboard'); };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(url).then(done, function () { fallbackCopy(url); done(); });
      } else {
        fallbackCopy(url);
        done();
      }
    });
  });
  function fallbackCopy(text) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(ta);
  }

  /* ---------- Archive: live search and topic filter ---------- */
  var archive = $('[data-archive]');
  if (archive) {
    var posts = JSON.parse(document.getElementById('posts-data').textContent);
    var search = $('[data-archive-search]');
    var chipsWrap = $('[data-archive-topics]');
    var countEl = $('[data-archive-count]');
    var emptyEl = $('[data-archive-empty]');
    var params = new URLSearchParams(window.location.search);
    var state = { topic: params.get('topic') || 'All', q: params.get('q') || '' };
    search.value = state.q;

    var topics = ['All'].concat(posts.map(function (p) { return p.topic; })
      .filter(function (t, i, all) { return all.indexOf(t) === i; }).sort());
    // Match ?topic= regardless of case (?topic=design selects "Design").
    var wanted = state.topic.toLowerCase();
    state.topic = topics.filter(function (t) { return t.toLowerCase() === wanted; })[0] || 'All';
    chipsWrap.innerHTML = topics.map(function (t) {
      return '<button type="button" class="chip" data-topic="' + escapeHtml(t) + '" aria-pressed="' + (t === state.topic) + '">' + escapeHtml(t) + '</button>';
    }).join('');
    $all('[data-topic]', chipsWrap).forEach(function (chip) {
      chip.addEventListener('click', function () {
        state.topic = chip.getAttribute('data-topic');
        $all('[data-topic]', chipsWrap).forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        render();
      });
    });

    var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    var render = function () {
      var q = state.q.trim().toLowerCase();
      var matches = posts.filter(function (p) {
        var text = (p.title + ' ' + p.dek + ' ' + p.author + ' ' + p.topic).toLowerCase();
        return (state.topic === 'All' || p.topic === state.topic) && (!q || text.indexOf(q) !== -1);
      });
      var byYear = {};
      matches.forEach(function (p) {
        var y = p.date.slice(0, 4);
        (byYear[y] = byYear[y] || []).push(p);
      });
      archive.innerHTML = Object.keys(byYear).sort().reverse().map(function (year) {
        return '<section aria-labelledby="y' + year + '" class="mt-10 first:mt-0">' +
          '<h2 id="y' + year + '" class="font-serif text-3xl font-semibold border-b border-ink pb-3">' + year + '</h2>' +
          '<ul>' + byYear[year].map(function (p) {
            var d = new Date(p.date + 'T12:00:00');
            return '<li><a href="article.html" class="group grid items-baseline gap-x-8 gap-y-1 border-b border-line py-5 sm:grid-cols-[6rem_1fr_auto]">' +
              '<time datetime="' + p.date + '" class="text-sm text-muted tabular-nums">' + months[d.getMonth()] + ' ' + d.getDate() + '</time>' +
              '<span><span class="block font-serif text-xl font-semibold leading-snug transition-colors group-hover:text-accent sm:text-2xl">' + escapeHtml(p.title) + '</span>' +
              '<span class="mt-1 block font-serif text-lg leading-relaxed text-muted">' + escapeHtml(p.dek) + '</span>' +
              '<span class="mt-2 block text-xs text-muted">By ' + escapeHtml(p.author) + '</span></span>' +
              '<span class="whitespace-nowrap text-xs text-muted"><span class="kicker">' + escapeHtml(p.topic) + '</span> · ' + p.minutes + ' min</span>' +
              '</a></li>';
          }).join('') + '</ul></section>';
      }).join('');
      countEl.textContent = matches.length === 1 ? '1 essay' : matches.length + ' essays';
      emptyEl.hidden = matches.length > 0;

      var url = new URL(window.location.href);
      if (state.topic !== 'All') url.searchParams.set('topic', state.topic); else url.searchParams.delete('topic');
      if (state.q) url.searchParams.set('q', state.q); else url.searchParams.delete('q');
      history.replaceState(null, '', url);
    };

    search.addEventListener('input', function () { state.q = search.value; render(); });
    $all('[data-archive-reset]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        state.q = ''; state.topic = 'All'; search.value = '';
        $all('[data-topic]', chipsWrap).forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-topic') === 'All')); });
        render();
        search.focus();
      });
    });
    // Press "/" to jump to the search box.
    document.addEventListener('keydown', function (e) {
      if (e.key === '/' && document.activeElement !== search && !/input|textarea|select/i.test(document.activeElement.tagName)) {
        e.preventDefault();
        search.focus();
      }
    });
    render();
  }

  /* ---------- Form validation ----------
     Forms with [data-validate] are checked in the browser. To receive submissions,
     set the form's action to your endpoint (for example https://formspree.io/f/yourid)
     and submit it with fetch() where marked below. */
  // A short reference for the confirmation, like LE-7K2Q (no 0/O or 1/I to misread).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  $all('form[data-validate]').forEach(function (form) {
    var fields = $all('input, select, textarea', form).filter(function (f) { return f.name; });

    function messageFor(field) {
      var v = field.validity;
      var label = field.getAttribute('data-label') || 'this field';
      if (v.valueMissing) {
        if (field.type === 'checkbox') return 'Please check this box to continue.';
        return (field.tagName === 'SELECT' ? 'Please choose ' : 'Please enter ') + label + '.';
      }
      if (v.typeMismatch && field.type === 'email') return 'Please enter a valid email address, like name@example.com.';
      if (v.tooShort) return 'Please write at least ' + field.minLength + ' characters (you have ' + field.value.length + ').';
      if (v.typeMismatch || v.patternMismatch) return 'Please check the format of ' + label + '.';
      return '';
    }
    function check(field) {
      var msg = messageFor(field);
      var err = document.getElementById(field.id + '-error');
      field.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (err) { err.textContent = msg; err.hidden = !msg; }
      return !msg;
    }
    fields.forEach(function (field) {
      field.addEventListener('blur', function () { if (field.value) check(field); });
      field.addEventListener('input', function () { if (field.getAttribute('aria-invalid') === 'true') check(field); });
      field.addEventListener('change', function () { if (field.getAttribute('aria-invalid') === 'true') check(field); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      fields.forEach(function (field) { if (!check(field) && !firstInvalid) firstInvalid = field; });
      if (firstInvalid) { firstInvalid.focus(); return; }
      // Valid. Send the data to your form endpoint here, e.g.:
      // fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      var success = $('[data-form-success]', form);
      if (success) {
        var refEl = $('[data-ref]', success);
        if (refEl) refEl.textContent = makeRef('LE');
        success.hidden = false;
        success.focus();
      }
      form.reset();
      fields.forEach(function (field) { field.removeAttribute('aria-invalid'); });
    });
  });

  /* ---------- Footer year ---------- */
  $all('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
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
