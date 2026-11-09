/* Notebook — site scripts. Vanilla JavaScript, no dependencies.
   The post index (titles, dates, tags, series) is in assets/js/posts.js. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var THEME_KEY = 'notebook-theme';

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }

  // The post index from assets/js/posts.js. Anything malformed is skipped rather than breaking the page.
  var POSTS = (Array.isArray(window.NOTEBOOK_POSTS) ? window.NOTEBOOK_POSTS : []).filter(function (p) {
    return p && typeof p.slug === 'string' && typeof p.title === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(p.date) && Array.isArray(p.tags);
  });
  var SERIES = Array.isArray(window.NOTEBOOK_SERIES) ? window.NOTEBOOK_SERIES : [];
  // Where the tag and series pages are (a WordPress site sets its own addresses).
  var LINKS = window.NOTEBOOK_LINKS || { tags: 'tags.html', series: 'series.html' };
  function seriesName(slug) {
    for (var i = 0; i < SERIES.length; i++) if (SERIES[i].slug === slug) return SERIES[i].name;
    return '';
  }
  function tagUrl(tag) { return LINKS.tags + '?tag=' + encodeURIComponent(tag); }

  /* ---------- Theme toggle (the initial theme is set inline in <head> to avoid a flash) ---------- */
  function syncThemeButtons() {
    var dark = root.classList.contains('dark');
    $all('[data-theme-toggle]').forEach(function (b) {
      b.setAttribute('aria-pressed', String(dark));
      b.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    });
  }
  syncThemeButtons();
  $all('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dark = root.classList.toggle('dark');
      try { localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light'); } catch (e) {}
      syncThemeButtons();
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
        if (!entry.isIntersecting) return;
        // Reveal this item and everything above it, so a fast jump never leaves hidden content behind.
        var top = entry.target.getBoundingClientRect().top;
        items.forEach(function (el) {
          if (!el.classList.contains('is-visible') && el.getBoundingClientRect().top <= top) {
            el.classList.add('is-visible');
            io.unobserve(el);
          }
        });
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

  /* ---------- Clipboard ---------- */
  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch (e) {}
      document.body.removeChild(ta);
      done();
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done, fallback);
    } else {
      fallback();
    }
  }
  function pageUrl(hash) { return window.location.href.split('#')[0] + (hash || ''); }

  $all('[data-copy-link]').forEach(function (btn) {
    btn.addEventListener('click', function () { copyText(pageUrl(), function () { toast('Link copied to clipboard'); }); });
  });
  // A button that copies the value of an input (the RSS feed address).
  $all('[data-copy-target]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var field = document.getElementById(btn.getAttribute('data-copy-target'));
      if (field) copyText(field.value, function () { toast('Feed address copied'); });
    });
  });

  /* ---------- "/" jumps to search ---------- */
  document.addEventListener('keydown', function (e) {
    if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    var active = document.activeElement;
    if (active && (/^(input|textarea|select)$/i.test(active.tagName) || active.isContentEditable)) return;
    var input = $('[data-search-input]');
    if (input) {
      e.preventDefault();
      input.focus();
      input.select();
      return;
    }
    var link = $('[data-search-link]');
    if (link) {
      e.preventDefault();
      window.location.href = link.href;
    }
  });

  /* ---------- Post lists (archive, tags, search) ---------- */
  // One post as a list row. `terms` (search) are highlighted in the title and summary.
  function highlight(text, terms) {
    if (!terms || !terms.length) return escapeHtml(text);
    var lower = text.toLowerCase();
    var marks = [];
    terms.forEach(function (term) {
      var from = 0;
      var at;
      while ((at = lower.indexOf(term, from)) !== -1) {
        marks.push([at, at + term.length]);
        from = at + term.length;
      }
    });
    if (!marks.length) return escapeHtml(text);
    marks.sort(function (a, b) { return a[0] - b[0] || b[1] - a[1]; });
    var out = '';
    var pos = 0;
    marks.forEach(function (m) {
      if (m[1] <= pos) return;
      var start = Math.max(m[0], pos);
      out += escapeHtml(text.slice(pos, start)) + '<mark>' + escapeHtml(text.slice(start, m[1])) + '</mark>';
      pos = m[1];
    });
    return out + escapeHtml(text.slice(pos));
  }
  function postRow(p, terms) {
    var series = p.series ? '<span class="series-badge">' + escapeHtml(seriesName(p.series)) + ' · part ' + p.part + '</span>' : '';
    var tags = p.tags.map(function (t) {
      return '<a class="tag" href="' + escapeHtml(tagUrl(t)) + '">' + escapeHtml(t) + '</a>';
    }).join('');
    return '<li class="post-row">' +
      '<time datetime="' + p.date + '">' + p.date + '</time>' +
      '<div class="min-w-0">' +
        '<h3 class="post-title"><a href="' + escapeHtml(p.url) + '">' + highlight(p.title, terms) + '</a></h3>' +
        '<p class="mt-1 text-muted">' + highlight(p.excerpt, terms) + '</p>' +
        '<p class="mt-2.5 flex flex-wrap items-center gap-1.5">' + series + tags + '</p>' +
      '</div>' +
      '<span class="post-meta">' + p.minutes + ' min</span>' +
    '</li>';
  }

  $all('[data-post-count]').forEach(function (el) { el.textContent = plural(POSTS.length, 'post', 'posts'); });

  /* Archive: every post grouped by year, with links to each year. */
  var archive = $('[data-archive]');
  if (archive) {
    var years = [];
    var byYear = {};
    POSTS.forEach(function (p) {
      var y = p.date.slice(0, 4);
      if (!byYear[y]) { byYear[y] = []; years.push(y); }
      byYear[y].push(p);
    });
    years.sort().reverse();
    archive.innerHTML = years.map(function (y) {
      return '<section class="mt-12 first:mt-0" aria-labelledby="y' + y + '" id="year-' + y + '">' +
        '<h2 id="y' + y + '" class="display flex items-baseline justify-between gap-3 border-b-2 border-ink pb-3 text-3xl font-bold">' + y +
        ' <span class="font-mono text-sm font-normal text-muted">' + plural(byYear[y].length, 'post', 'posts') + '</span></h2>' +
        '<ol>' + byYear[y].map(function (p) { return postRow(p); }).join('') + '</ol></section>';
    }).join('');
    var yearNav = $('[data-archive-years]');
    if (yearNav) {
      yearNav.innerHTML = '<span class="mr-1 text-muted">Jump to</span>' + years.map(function (y) {
        return '<a class="tag no-hash" href="#year-' + y + '">' + y + '</a>';
      }).join('');
    }
  }

  /* Tags: one tag at a time, from ?tag= (any case; tags that don't exist are ignored). */
  var tagFilter = $('[data-tag-filter]');
  if (tagFilter) {
    var tagResults = $('[data-tag-results]');
    var tagHeading = $('[data-tag-heading]');
    var tagCount = $('[data-tag-count]');
    var tagNotice = $('[data-tag-notice]');
    var counts = {};
    POSTS.forEach(function (p) { p.tags.forEach(function (t) { counts[t] = (counts[t] || 0) + 1; }); });
    var allTags = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a] || (a < b ? -1 : 1); });

    var requested = new URLSearchParams(window.location.search).get('tag');
    var current = '';
    if (requested !== null && requested.trim() !== '') {
      var wanted = requested.trim().toLowerCase();
      current = allTags.filter(function (t) { return t.toLowerCase() === wanted; })[0] || '';
      if (!current) {
        tagNotice.textContent = 'There is no tag called “' + requested.trim().slice(0, 40) + '”, so here is every post.';
        tagNotice.hidden = false;
      }
    }

    tagFilter.innerHTML = '<button type="button" class="tag no-hash" data-tag="" aria-pressed="false">All<span class="count">' + POSTS.length + '</span></button>' +
      allTags.map(function (t) {
        return '<button type="button" class="tag" data-tag="' + escapeHtml(t) + '" aria-pressed="false">' + escapeHtml(t) + '<span class="count">' + counts[t] + '</span></button>';
      }).join('');

    var renderTags = function (updateUrl) {
      $all('[data-tag]', tagFilter).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-tag') === current)); });
      var list = POSTS.filter(function (p) { return !current || p.tags.indexOf(current) !== -1; });
      tagHeading.textContent = current ? 'Posts tagged #' + current : 'All posts';
      tagCount.textContent = plural(list.length, 'post', 'posts');
      tagResults.innerHTML = list.map(function (p) { return postRow(p); }).join('');
      if (updateUrl) {
        var url = new URL(window.location.href);
        if (current) url.searchParams.set('tag', current); else url.searchParams.delete('tag');
        history.replaceState(null, '', url);
      }
    };
    $all('[data-tag]', tagFilter).forEach(function (btn) {
      btn.addEventListener('click', function () {
        current = btn.getAttribute('data-tag');
        tagNotice.hidden = true;
        renderTags(true);
      });
    });
    renderTags(false);
  }

  /* Search: every word must appear in the title, summary, tags or series name. */
  var searchInput = $('[data-search-input]');
  var searchResults = $('[data-search-results]');
  if (searchInput && searchResults) {
    var searchStatus = $('[data-search-status]');
    var searchEmpty = $('[data-search-empty]');
    var haystacks = POSTS.map(function (p) {
      return [p.title, p.excerpt, p.tags.join(' '), seriesName(p.series)].join(' ').toLowerCase();
    });
    var renderSearch = function (updateUrl) {
      var query = searchInput.value.trim();
      var terms = query.toLowerCase().split(/\s+/).filter(Boolean).slice(0, 8);
      var list = POSTS.filter(function (p, i) {
        return terms.every(function (t) { return haystacks[i].indexOf(t) !== -1; });
      });
      searchResults.innerHTML = list.map(function (p) { return postRow(p, terms); }).join('');
      searchStatus.textContent = terms.length
        ? plural(list.length, 'post matches', 'posts match') + ' “' + query + '”'
        : plural(list.length, 'post', 'posts');
      searchEmpty.hidden = list.length > 0;
      if (updateUrl) {
        var url = new URL(window.location.href);
        if (query) url.searchParams.set('q', query); else url.searchParams.delete('q');
        history.replaceState(null, '', url);
      }
    };
    searchInput.value = (new URLSearchParams(window.location.search).get('q') || '').slice(0, 100);
    searchInput.addEventListener('input', function () { renderSearch(true); });
    var searchForm = $('[data-search-form]');
    if (searchForm) searchForm.addEventListener('submit', function (e) { e.preventDefault(); renderSearch(true); });
    $all('[data-search-clear]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        searchInput.value = '';
        renderSearch(true);
        searchInput.focus();
      });
    });
    renderSearch(false);
  }

  /* ---------- Post page ---------- */
  var body = $('[data-post-body]');
  if (body) {
    // Reading time: the visible words of the post, one text node at a time (code counts).
    var words = 0;
    var walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.parentElement.closest('svg, script, style, template, [hidden], [aria-hidden="true"]') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    while (walker.nextNode()) {
      var text = walker.currentNode.nodeValue.trim();
      if (text) words += text.split(/\s+/).length;
    }
    var minutes = Math.max(1, Math.round(words / 230));
    $all('[data-reading-time]').forEach(function (el) { el.textContent = minutes + ' min read'; });

    // Reading progress.
    var bar = $('[data-progress]');
    if (bar) {
      var updateProgress = function () {
        var rect = body.getBoundingClientRect();
        var total = body.offsetHeight - window.innerHeight;
        var done = Math.min(1, Math.max(0, -rect.top / (total > 0 ? total : 1)));
        bar.style.transform = 'scaleX(' + done + ')';
      };
      window.addEventListener('scroll', updateProgress, { passive: true });
      window.addEventListener('resize', updateProgress);
      updateProgress();
    }

    // Headings: ids, a "#" link to each section (it also copies the section's address) and the outline.
    var used = {};
    var headings = $all('h2, h3', body);
    headings.forEach(function (h) {
      var id = h.id || h.textContent.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'section';
      var unique = id;
      for (var n = 2; used[unique] || (document.getElementById(unique) && document.getElementById(unique) !== h); n++) unique = id + '-' + n;
      used[unique] = true;
      h.id = unique;
      if (!$('.anchor', h)) {
        var a = document.createElement('a');
        a.className = 'anchor';
        a.href = '#' + unique;
        a.textContent = '#';
        a.setAttribute('aria-label', 'Link to the section “' + h.textContent.trim() + '”');
        a.addEventListener('click', function () {
          copyText(pageUrl('#' + unique), function () { toast('Link to this section copied'); });
        });
        h.appendChild(a);
      }
    });
    var tocText = function (h) {
      var clone = h.cloneNode(true);
      $all('.anchor', clone).forEach(function (a) { a.remove(); });
      return clone.textContent.trim();
    };
    $all('[data-toc]').forEach(function (list) {
      list.innerHTML = headings.map(function (h) {
        return '<li><a class="toc-link' + (h.tagName === 'H3' ? ' is-sub' : '') + '" href="#' + h.id + '">' + escapeHtml(tocText(h)) + '</a></li>';
      }).join('');
    });
    $all('[data-toc] a').forEach(function (a) {
      a.addEventListener('click', function () {
        var details = a.closest('details');
        if (details) details.open = false;
      });
    });
    // Scroll spy: the last heading above the top quarter of the screen is the current section.
    if (headings.length) {
      var spyQueued = false;
      var spy = function () {
        spyQueued = false;
        var line = window.innerHeight * 0.25;
        var activeId = '';
        headings.forEach(function (h) { if (h.getBoundingClientRect().top <= line) activeId = h.id; });
        $all('.toc-link').forEach(function (a) {
          var on = activeId !== '' && a.getAttribute('href') === '#' + activeId;
          a.classList.toggle('is-active', on);
          if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        });
      };
      window.addEventListener('scroll', function () {
        if (spyQueued) return;
        spyQueued = true;
        window.requestAnimationFrame(spy);
      }, { passive: true });
      window.addEventListener('resize', spy);
      spy();
    }

    // Code blocks: a header with the language and a copy button. Code is focusable so it can be scrolled.
    var LANGS = { sql: 'SQL', bash: 'Shell', sh: 'Shell', text: 'Output', js: 'JavaScript', ts: 'TypeScript', rust: 'Rust', css: 'CSS', html: 'HTML', json: 'JSON' };
    $all('pre', body).forEach(function (pre) {
      if (pre.closest('.code-block')) return;
      var m = /(?:^|\s)(?:lang|language)-([\w-]+)/.exec(pre.className + ' ' + ((pre.querySelector('code') || {}).className || ''));
      var lang = m ? m[1].toLowerCase() : 'text';
      var label = LANGS[lang] || lang;
      var frame = document.createElement('div');
      frame.className = 'code-block';
      var head = document.createElement('div');
      head.className = 'code-head';
      head.innerHTML = '<span>' + escapeHtml(label) + '</span>' +
        '<button type="button" class="code-copy" aria-label="Copy ' + escapeHtml(label) + ' code"><svg aria-hidden="true" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg><span data-copy-label>Copy</span></button>';
      pre.parentNode.insertBefore(frame, pre);
      frame.appendChild(head);
      frame.appendChild(pre);
      if (!pre.hasAttribute('tabindex')) pre.setAttribute('tabindex', '0');
      pre.setAttribute('aria-label', label + ' code');
      var btn = $('.code-copy', head);
      var timer;
      btn.addEventListener('click', function () {
        copyText(pre.textContent.replace(/\n$/, ''), function () {
          btn.setAttribute('data-copied', '');
          $('[data-copy-label]', btn).textContent = 'Copied';
          toast('Code copied to clipboard');
          clearTimeout(timer);
          timer = setTimeout(function () {
            btn.removeAttribute('data-copied');
            $('[data-copy-label]', btn).textContent = 'Copy';
          }, 2000);
        });
      });
    });
  }

  /* Series box and older/newer links of a post (data-post="<slug>"). */
  function findPost(slug) {
    for (var i = 0; i < POSTS.length; i++) if (POSTS[i].slug === slug) return i;
    return -1;
  }
  $all('[data-series-nav]').forEach(function (box) {
    var i = findPost(box.getAttribute('data-post'));
    if (i === -1 || !POSTS[i].series) return;
    var p = POSTS[i];
    var parts = POSTS.filter(function (x) { return x.series === p.series; }).sort(function (a, b) { return a.part - b.part; });
    var name = seriesName(p.series);
    box.innerHTML = '<nav class="sheet p-5 sm:p-6" aria-label="' + escapeHtml('Series: ' + name) + '">' +
      '<p class="kicker">series</p>' +
      '<p class="display mt-2 text-lg font-bold"><a href="' + escapeHtml(LINKS.series + '#' + p.series) + '" class="hover:text-pen">' + escapeHtml(name) + '</a></p>' +
      '<p class="mt-1 font-mono text-sm text-muted">This is part ' + p.part + ' of ' + parts.length + '.</p>' +
      '<ol class="mt-4 space-y-2 border-t border-dashed border-line pt-4">' + parts.map(function (x) {
        var label = '<span class="font-mono text-pen">' + (x.part < 10 ? '0' : '') + x.part + '</span> ';
        return x.slug === p.slug
          ? '<li><a href="' + escapeHtml(x.url) + '" aria-current="page" class="font-bold">' + label + '<span class="marker">' + escapeHtml(x.title) + '</span></a></li>'
          : '<li><a href="' + escapeHtml(x.url) + '" class="hover:text-pen">' + label + escapeHtml(x.title) + '</a></li>';
      }).join('') + '</ol></nav>';
  });
  $all('[data-post-nav]').forEach(function (box) {
    var i = findPost(box.getAttribute('data-post'));
    if (i === -1) return;
    var older = POSTS[i + 1];
    var newer = POSTS[i - 1];
    var card = function (p, dir) {
      if (!p) return '<div class="hidden sm:block"></div>';
      var arrow = dir === 'older'
        ? '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>'
        : '<svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
      return '<a href="' + escapeHtml(p.url) + '" rel="' + (dir === 'older' ? 'prev' : 'next') + '" class="sheet group block p-5 transition-transform hover:-translate-y-0.5' + (dir === 'newer' ? ' sm:text-right' : '') + '">' +
        '<span class="flex items-center gap-1.5 font-mono text-xs text-muted' + (dir === 'newer' ? ' sm:justify-end' : '') + '">' +
        (dir === 'older' ? arrow + 'Older post' : 'Newer post' + arrow) + '</span>' +
        '<span class="post-title mt-2 block">' + escapeHtml(p.title) + '</span></a>';
    };
    box.innerHTML = '<nav class="grid gap-4 sm:grid-cols-2" aria-label="More posts">' + card(older, 'older') + card(newer, 'newer') + '</nav>';
  });

  /* ---------- Form validation ----------
     Forms with [data-validate] are checked in the browser. To receive submissions,
     set the form's action to your endpoint (for example https://formspree.io/f/yourid)
     and submit it with fetch() where marked below. */
  $all('form[data-validate]').forEach(function (form) {
    var fields = $all('input, select, textarea', form).filter(function (f) { return f.name && f.type !== 'radio' && f.type !== 'checkbox'; });

    function messageFor(field) {
      var v = field.validity;
      var label = field.getAttribute('data-label') || 'this field';
      if (v.valueMissing) return (field.tagName === 'SELECT' ? 'Please choose ' : 'Please enter ') + label + '.';
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
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var firstInvalid = null;
      fields.forEach(function (field) { if (!check(field) && !firstInvalid) firstInvalid = field; });
      var success = $('[data-form-success]', form);
      if (firstInvalid) {
        if (success) success.hidden = true;
        firstInvalid.focus();
        return;
      }
      // Valid. Send the data to your form endpoint here, e.g.:
      // fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      form.reset();
      fields.forEach(function (field) { field.removeAttribute('aria-invalid'); });
      if (success) {
        success.hidden = false;
        success.focus();
      }
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
