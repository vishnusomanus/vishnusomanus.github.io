/*
  Relay docs template: all interactive behavior, vanilla JavaScript.

  Contents
    1. Helpers & toast          6. Copy buttons
    2. Theme toggle             7. Package-manager / code tabs
    3. Version switcher         8. "On this page" scroll-spy
    4. Mobile sidebar           9. "Was this helpful?" feedback
    5. Syntax highlighting     10. Search (Ctrl/Cmd+K or /)
                               11. Scroll reveal

  SEARCH_INDEX below lists every page and heading. When you add a page or
  section, add an entry: { t: title, p: page name, u: url, x: snippet, k: 'page' | 'h2' | 'h3' }.
*/
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

  var SEARCH_INDEX = [{"t": "Introduction","p": "Introduction","u": "index.html","x": "Relay is a tiny HTTP client for JavaScript with timeouts, retries, interceptors and typed responses. Read the docs and get started.","k": "page"},{"t": "Why Relay?","p": "Introduction","u": "index.html#why-relay","x": "The built-in fetch is great, but every project ends up writing the same helpers around it: a timeout, a retry loop, JSON parsing, error handling for non-2xx responses and a place t","k": "h2"},{"t": "A first look","p": "Introduction","u": "index.html#a-first-look","x": "Requests return a promise for the parsed body. Errors, including timeouts and non-2xx responses, reject with a RelayError you can inspect.","k": "h2"},{"t": "Where to next","p": "Introduction","u": "index.html#where-to-next","x": "","k": "h2"},{"t": "Quick start","p": "Quick start","u": "getting-started.html","x": "Install Relay, make your first request, handle errors and create a shared instance in five minutes.","k": "page"},{"t": "Install the package","p": "Quick start","u": "getting-started.html#install-the-package","x": "Relay is published to npm as @relayhttp/relay. Use whichever package manager your project already uses:","k": "h3"},{"t": "Make your first request","p": "Quick start","u": "getting-started.html#make-your-first-request","x": "Import the default export and call one of the method helpers. Chain .json(), .text() or .blob() to read the body.","k": "h3"},{"t": "Handle errors","p": "Quick start","u": "getting-started.html#handle-errors","x": "Unlike fetch, Relay rejects when the server answers with a 4xx or 5xx status, so you can't accidentally treat an error page as data.","k": "h3"},{"t": "Share defaults with an instance","p": "Quick start","u": "getting-started.html#share-defaults-with-an-instance","x": "Most apps talk to one API. Create an instance with a base URL, headers and timeout once, then import it everywhere.","k": "h3"},{"t": "Next steps","p": "Quick start","u": "getting-started.html#next-steps","x": "","k": "h2"},{"t": "Installation","p": "Installation","u": "installation.html","x": "Install Relay with npm, pnpm, Yarn or Bun, or load it from a CDN. Runtime requirements, TypeScript and Deno setup.","k": "page"},{"t": "Package managers","p": "Installation","u": "installation.html#package-managers","x": "Pick your package manager. Your choice is remembered across every page of these docs.","k": "h2"},{"t": "Requirements","p": "Installation","u": "installation.html#requirements","x": "","k": "h2"},{"t": "Without a bundler","p": "Installation","u": "installation.html#without-a-bundler","x": "Load the module build straight from a CDN with a module script. This is handy for prototypes and plain HTML pages.","k": "h2"},{"t": "TypeScript","p": "Installation","u": "installation.html#typescript","x": "Types are bundled, so there's nothing extra to install. Pass a type parameter to .json() to type the response body:","k": "h2"},{"t": "Deno","p": "Installation","u": "installation.html#deno","x": "","k": "h2"},{"t": "Verify the install","p": "Installation","u": "installation.html#verify-the-install","x": "Run this one-liner to check that Relay loads and can reach the network:","k": "h2"},{"t": "Core concepts","p": "Core concepts","u": "guides.html","x": "How Relay handles requests, options, timeouts, cancellation, retries, interceptors and errors.","k": "page"},{"t": "Requests and responses","p": "Core concepts","u": "guides.html#requests-and-responses","x": "Every call returns a RelayRequest: a promise for the Response that also has body helpers. Calling a helper sets the matching Accept header and parses the body for you.","k": "h2"},{"t": "Request options","p": "Core concepts","u": "guides.html#request-options","x": "Options are plain objects. Anything Relay doesn't recognize is passed straight to fetch, so credentials, cache and signal all work as usual.","k": "h2"},{"t": "Sending data","p": "Core concepts","u": "guides.html#sending-data","x": "Use json for JSON bodies and body for anything else, such as FormData or a Blob. Relay sets Content-Type for you when it can.","k": "h3"},{"t": "Query strings","p": "Core concepts","u": "guides.html#query-strings","x": "searchParams accepts an object, a string or a URLSearchParams. Undefined values are skipped, which keeps optional filters tidy.","k": "h3"},{"t": "Timeouts and cancellation","p": "Core concepts","u": "guides.html#timeouts-and-cancellation","x": "Requests time out after 10 seconds by default. Set timeout per request or on an instance, or pass false to disable it.","k": "h2"},{"t": "Retries","p": "Core concepts","u": "guides.html#retries","x": "Relay retries failed requests that are safe to repeat. By default that's GET, HEAD, PUT, DELETE and OPTIONS requests that fail with a network error or one of these statuses: 408, 4","k": "h2"},{"t": "Interceptors","p": "Core concepts","u": "guides.html#interceptors","x": "Interceptors run code before a request is sent or after a response arrives. They're how you add auth headers, log timings or refresh expired tokens in one place.","k": "h2"},{"t": "Error handling","p": "Core concepts","u": "guides.html#error-handling","x": "All failures reject with a RelayError. Check error.code to tell them apart:","k": "h2"},{"t": "Testing","p": "Core concepts","u": "guides.html#testing","x": "Pass your own fetch to an instance to test code that uses Relay without touching the network:","k": "h2"},{"t": "Examples","p": "Examples","u": "examples.html","x": "Copy-paste Relay recipes: forms, token refresh, uploads, polling, parallel requests and a React hook.","k": "page"},{"t": "Fetch and render a list","p": "Examples","u": "examples.html#fetch-and-render-a-list","x": "","k": "h2"},{"t": "Submit a form","p": "Examples","u": "examples.html#submit-a-form","x": "","k": "h2"},{"t": "Refresh an expired token","p": "Examples","u": "examples.html#refresh-an-expired-token","x": "Refresh the session once when the API returns 401, then replay the original request.","k": "h2"},{"t": "Upload a file","p": "Examples","u": "examples.html#upload-a-file","x": "","k": "h2"},{"t": "Poll until a job finishes","p": "Examples","u": "examples.html#poll-until-a-job-finishes","x": "","k": "h2"},{"t": "Run requests in parallel","p": "Examples","u": "examples.html#run-requests-in-parallel","x": "","k": "h2"},{"t": "Use it in a React hook","p": "Examples","u": "examples.html#use-it-in-a-react-hook","x": "","k": "h2"},{"t": "API reference","p": "API reference","u": "api.html","x": "Complete API reference for Relay: relay(), method helpers, instances, interceptors, RelayError and every option.","k": "page"},{"t": "relay()","p": "API reference","u": "api.html#relay","x": "Sends a request. The method defaults to GET unless you pass options.method. The method helpers below are usually more readable.","k": "h2"},{"t": "Method helpers","p": "API reference","u": "api.html#method-helpers","x": "Shorthands that set options.method for you. They accept the same arguments as relay().","k": "h2"},{"t": "RelayRequest","p": "API reference","u": "api.html#relayrequest","x": "The value returned by every request. Await it for the raw Response, or call a body helper:","k": "h2"},{"t": "relay.create()","p": "API reference","u": "api.html#relay-create","x": "Creates a new instance with its own defaults and interceptors. Instances have every method the default export has.","k": "h2"},{"t": "instance.extend()","p": "API reference","u": "api.html#instance-extend","x": "Creates a child instance that inherits the parent's defaults and interceptors, then layers new defaults on top. Headers are merged; other options are replaced.","k": "h2"},{"t": "Interceptors","p": "API reference","u": "api.html#interceptors","x": "Registers a function that runs before each request or after each response. Return a new Request or Response to replace the original.","k": "h2"},{"t": "RelayError","p": "API reference","u": "api.html#relayerror","x": "Thrown (as a rejected promise) for every failure. It extends Error.","k": "h2"},{"t": "Options","p": "API reference","u": "api.html#options","x": "Any option not listed here is passed through to fetch unchanged.","k": "h2"},{"t": "Changelog","p": "Changelog","u": "changelog.html","x": "Release notes for every version of Relay, with upgrade notes for breaking changes.","k": "page"},{"t": "3.2.0","p": "Changelog","u": "changelog.html#v3-2-0","x": "Request deduplication and a smaller bundle.","k": "h2"},{"t": "3.1.2","p": "Changelog","u": "changelog.html#v3-1-2","x": "A patch release with two fixes.","k": "h2"},{"t": "3.1.0","p": "Changelog","u": "changelog.html#v3-1-0","x": "Better tools for testing and debugging.","k": "h2"},{"t": "3.0.0","p": "Changelog","u": "changelog.html#v3-0-0","x": "A major release that simplifies errors and drops old runtimes. See the upgrade notes below.","k": "h2"},{"t": "Upgrading from 2.x","p": "Changelog","u": "changelog.html#upgrading-from-2-x","x": "Search your code for HTTPError and TimeoutError and check error.code instead:","k": "h3"},{"t": "2.9.4","p": "Changelog","u": "changelog.html#v2-9-4","x": "The final 2.x release.","k": "h2"},{"t": "FAQ","p": "FAQ","u": "faq.html","x": "Answers to common questions about Relay: how it compares to Axios and fetch, SSR, cookies and licensing.","k": "page"},{"t": "General","p": "FAQ","u": "faq.html#general","x": "","k": "h2"},{"t": "How is Relay different from Axios?","p": "FAQ","u": "faq.html#how-is-relay-different-from-axios","x": "Relay is built on the standard fetch API instead of XMLHttpRequest, so it works in edge runtimes and service workers and is about a fifth of the size. It also retries and times out","k": "h3"},{"t": "Why not just use fetch?","p": "FAQ","u": "faq.html#why-not-just-use-fetch","x": "You can! Relay is fetch plus the helpers most apps write anyway: timeouts, retries, JSON handling, errors for non-2xx statuses and interceptors.","k": "h3"},{"t": "Is Relay production ready?","p": "FAQ","u": "faq.html#is-relay-production-ready","x": "Yes. Relay has been stable since 2023, is tested on six runtimes in CI and follows semantic versioning.","k": "h3"},{"t": "Usage","p": "FAQ","u": "faq.html#usage","x": "","k": "h2"},{"t": "Does Relay work with server-side rendering?","p": "FAQ","u": "faq.html#does-relay-work-with-server-side-rendering","x": "Yes. It uses the global fetch, which exists in Node.js 18+, Deno, Bun and every major SSR framework. Pass a custom fetch if your framework provides one.","k": "h3"},{"t": "How do I send cookies with cross-origin requests?","p": "FAQ","u": "faq.html#how-do-i-send-cookies-with-cross-origin-requests","x": "Set credentials: 'include' on the request or instance. The server must also allow credentials in its CORS headers.","k": "h3"},{"t": "Can I track upload progress?","p": "FAQ","u": "faq.html#can-i-track-upload-progress","x": "Not yet. The fetch API doesn't expose upload progress in all browsers. It's on the roadmap for when support lands everywhere.","k": "h3"},{"t": "Project","p": "FAQ","u": "faq.html#project","x": "","k": "h2"},{"t": "What license is Relay under?","p": "FAQ","u": "faq.html#what-license-is-relay-under","x": "MIT. You can use it in commercial and open-source projects.","k": "h3"},{"t": "How can I contribute?","p": "FAQ","u": "faq.html#how-can-i-contribute","x": "Read the contributing guide in the GitHub repository, then open an issue to discuss bigger changes before sending a pull request.","k": "h3"}];

  /* 1. Helpers & toast ------------------------------------------------- */
  var $ = function (sel, el) { return (el || document).querySelector(sel); };
  var $$ = function (sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); };
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function store(key, value) {
    try {
      if (value === undefined) return safeStorage.getItem(key);
      safeStorage.setItem(key, value);
    } catch (e) { return null; }
  }

  var toastEl = $('[data-toast]');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2800);
  }

  var isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform || navigator.userAgent);
  $$('[data-shortcut]').forEach(function (el) {
    el.textContent = isMac ? '⌘ K' : 'Ctrl K';
    // The search button's name repeats the visible hint, so it contains the visible text.
    var btn = el.closest('[data-search-open][aria-label]');
    if (btn) btn.setAttribute('aria-label', 'Search docs, ' + el.textContent);
  });

  /* 2. Theme toggle ------------------------------------------------------ */
  var themeBtn = $('[data-theme-toggle]');
  function syncThemeLabel() {
    if (themeBtn) themeBtn.setAttribute('aria-label', root.classList.contains('dark') ? 'Switch to light theme' : 'Switch to dark theme');
  }
  if (themeBtn) {
    themeBtn.addEventListener('click', function () {
      var dark = root.classList.toggle('dark');
      store('relay-docs-theme', dark ? 'dark' : 'light');
      syncThemeLabel();
    });
    syncThemeLabel();
  }

  /* 3. Version switcher (demo: only the latest docs are included) -------- */
  var versionSelects = $$('[data-version]');
  versionSelects.forEach(function (sel) {
    sel.addEventListener('change', function () {
      var v = sel.value;
      versionSelects.forEach(function (s) { s.value = '3.2'; });
      if (v !== '3.2') toast('Docs for v' + v + ' would load here. This switcher is a demo.');
    });
  });

  /* 4. Mobile sidebar ---------------------------------------------------- */
  var sidebar = $('#sidebar');
  var openBtn = $('[data-sidebar-open]');
  var closeBtn = $('[data-sidebar-close]');
  var backdrop = $('[data-sidebar-backdrop]');
  var desktop = window.matchMedia('(min-width: 1024px)');

  function setSidebar(open, restoreFocus) {
    root.classList.toggle('sidebar-open', open);
    openBtn.setAttribute('aria-expanded', String(open));
    backdrop.hidden = !open;
    requestAnimationFrame(function () { backdrop.style.opacity = open ? '1' : '0'; });
    document.body.style.overflow = open ? 'hidden' : '';
    if (desktop.matches) sidebar.removeAttribute('inert');
    else if (open) sidebar.removeAttribute('inert');
    else sidebar.setAttribute('inert', '');
    if (open) closeBtn.focus();
    else if (restoreFocus) openBtn.focus();
  }
  if (sidebar && openBtn) {
    if (!desktop.matches) sidebar.setAttribute('inert', '');
    openBtn.addEventListener('click', function () { setSidebar(true); });
    closeBtn.addEventListener('click', function () { setSidebar(false, true); });
    backdrop.addEventListener('click', function () { setSidebar(false, true); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && root.classList.contains('sidebar-open')) setSidebar(false, true);
    });
    desktop.addEventListener('change', function () {
      if (root.classList.contains('sidebar-open')) setSidebar(false);
      if (desktop.matches) sidebar.removeAttribute('inert'); else sidebar.setAttribute('inert', '');
    });
    // Keep the current page in view inside a long sidebar.
    var current = $('[aria-current="page"]', sidebar);
    if (current && current.offsetTop > sidebar.clientHeight - 80) sidebar.scrollTop = current.offsetTop - 120;
  }

  /* 5. Syntax highlighting (tiny tokenizer, no library) ------------------ */
  var JS = [
    ['com', /\/\/[^\n]*|\/\*[\s\S]*?\*\//y],
    ['str', /`(?:\\[\s\S]|[^`\\])*`|'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"/y],
    ['kw', /\b(?:import|from|export|default|const|let|var|function|return|await|async|if|else|for|of|in|new|try|catch|finally|throw|typeof|instanceof|class|extends|interface|type|while|break|continue)\b/y],
    ['bool', /\b(?:true|false|null|undefined|this)\b/y],
    ['num', /\b\d[\d_]*(?:\.\d+)?\b/y],
    ['fn', /[A-Za-z_$][\w$]*(?=\s*(?:<[^>()]*>)?\()/y],
    ['prop', /[A-Za-z_$][\w$]*(?=\??:\s)/y]
  ];
  var RULES = {
    js: JS,
    ts: JS,
    bash: [
      ['com', /#[^\n]*/y],
      ['str', /'[^'\n]*'|"(?:\\.|[^"\\\n])*"/y],
      ['cmd', /(?<=^|\n|&&\s|\|\s)[\w.-]+/y],
      ['flag', /(?<=\s)--?[\w-]+/y]
    ],
    json: [
      ['prop', /"(?:\\.|[^"\\])*"(?=\s*:)/y],
      ['str', /"(?:\\.|[^"\\])*"/y],
      ['num', /-?\b\d+(?:\.\d+)?\b/y],
      ['bool', /\b(?:true|false|null)\b/y]
    ],
    html: [
      ['com', /<!--[\s\S]*?-->/y],
      ['kw', /<\/?[\w-]+|\/?>/y],
      ['prop', /[\w-]+(?==)/y],
      ['str', /"[^"]*"|'[^']*'/y],
      ['fn', /[A-Za-z_$][\w$]*(?=\()/y]
    ]
  };

  function highlight(code) {
    var rules = RULES[code.dataset.lang];
    if (!rules) return;
    var src = code.textContent;
    var out = '';
    var i = 0;
    while (i < src.length) {
      var hit = null;
      for (var r = 0; r < rules.length; r++) {
        rules[r][1].lastIndex = i;
        var m = rules[r][1].exec(src);
        if (m && m[0].length) { hit = [rules[r][0], m[0]]; break; }
      }
      if (hit) {
        out += '<span class="tok-' + hit[0] + '">' + esc(hit[1]) + '</span>';
        i += hit[1].length;
      } else {
        // Consume a whole word at once so keywords never match mid-identifier.
        var w = /[\w$]+/y;
        w.lastIndex = i;
        var word = w.exec(src);
        var chunk = word ? word[0] : src[i];
        out += esc(chunk);
        i += chunk.length;
      }
    }
    code.innerHTML = out;
  }
  $$('code[data-lang]').forEach(highlight);

  /* 6. Copy buttons ------------------------------------------------------ */
  function copyText(text) {
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
      ta.remove();
    });
  }
  $$('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var block = btn.closest('.code-block');
      var code = $('[role="tabpanel"]:not([hidden]) code', block) || $('code', block);
      var label = $('span', btn);
      copyText(code.textContent).then(function () {
        label.textContent = 'Copied!';
        setTimeout(function () { label.textContent = 'Copy'; }, 1600);
      }, function () { toast('Copy failed: select the code and copy it manually.'); });
    });
  });

  /* 7. Code tabs: tabs in the same group stay in sync and are remembered -- */
  function selectTab(group, label, focus) {
    $$('[data-tabs]').forEach(function (block) {
      // Compare values directly: `label` can come from storage, so never build a selector from it.
      if (block.dataset.tabs !== group || !$$('[data-tab]', block).some(function (t) { return t.dataset.tab === label; })) return;
      $$('[role="tab"]', block).forEach(function (tab) {
        var on = tab.dataset.tab === label;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        if (on && focus === tab) tab.focus();
      });
      $$('[role="tabpanel"]', block).forEach(function (panel) { panel.hidden = panel.dataset.panel !== label; });
    });
    store('relay-docs-tab:' + group, label);
  }
  $$('[data-tabs]').forEach(function (block) {
    var group = block.dataset.tabs;
    var tabs = $$('[role="tab"]', block);
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { selectTab(group, tab.dataset.tab); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') next = tabs[0];
        if (e.key === 'End') next = tabs[tabs.length - 1];
        if (next) { e.preventDefault(); selectTab(group, next.dataset.tab, next); }
      });
    });
  });
  (function restoreTabs() {
    var groups = {};
    $$('[data-tabs]').forEach(function (b) { groups[b.dataset.tabs] = true; });
    Object.keys(groups).forEach(function (g) {
      var saved = store('relay-docs-tab:' + g);
      if (saved) selectTab(g, saved);
    });
  })();

  /* 8. "On this page" scroll-spy ---------------------------------------- */
  var tocLinks = $$('.toc-link');
  if (tocLinks.length) {
    var headings = [];
    $$('[data-toc] .toc-link').forEach(function (a) {
      var h = document.getElementById(a.getAttribute('href').slice(1));
      if (h) headings.push(h);
    });
    var ticking = false;
    var spy = function () {
      ticking = false;
      var active = headings[0];
      var nearBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      if (nearBottom) active = headings[headings.length - 1];
      else headings.forEach(function (h) { if (h.getBoundingClientRect().top < 130) active = h; });
      var href = active ? '#' + active.id : '';
      tocLinks.forEach(function (a) {
        var on = a.getAttribute('href') === href;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
      });
    };
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(spy); }
    }, { passive: true });
    spy();
  }

  /* 9. Feedback widget ---------------------------------------------------- */
  var feedback = $('[data-feedback]');
  if (feedback) {
    $$('[data-feedback-answer]', feedback).forEach(function (btn) {
      btn.addEventListener('click', function () {
        // Send the answer to your analytics here, e.g. fetch('/api/feedback', { method: 'POST', body: ... }).
        $('[data-feedback-buttons]', feedback).hidden = true;
        $('[data-feedback-question]', feedback).hidden = true;
        $('[data-feedback-thanks]', feedback).textContent = btn.dataset.feedbackAnswer === 'yes'
          ? 'Thanks! Glad it helped.'
          : 'Thanks for telling us. Suggest an edit with the link on the right.';
      });
    });
  }

  /* 10. Search -------------------------------------------------------------- */
  var overlay = $('[data-search]');
  var input = $('[data-search-input]');
  var list = $('[data-search-results]');
  var results = [];
  var activeIndex = 0;
  var lastFocus = null;

  // Light stemming so "retry" finds "retries" and "timeouts" finds "timeout".
  function stem(text) {
    return text.toLowerCase().replace(/ies\b/g, 'y').replace(/(\w{3,}?)(?:es|s|ing|ed)\b/g, '$1');
  }
  function terms(q) { return stem(q).split(/\s+/).filter(Boolean); }
  function reEscape(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function mark(text, ts) {
    var safe = esc(text);
    if (!ts.length) return safe;
    // Highlight the word stem plus any ending, e.g. "retr" in "retries".
    var re = new RegExp('(' + ts.map(function (t) { return reEscape(esc(t.replace(/y$/, ''))) + '[a-z]*'; }).join('|') + ')', 'gi');
    return safe.replace(re, '<mark>$1</mark>');
  }
  function snippet(text, ts) {
    if (!text) return '';
    var lower = text.toLowerCase();
    var at = ts.length ? lower.indexOf(ts[0].replace(/y$/, '')) : -1;
    if (at > 70) return '…' + text.slice(at - 50, at + 110) + (text.length > at + 110 ? '…' : '');
    return text.slice(0, 160) + (text.length > 160 ? '…' : '');
  }

  function runSearch(q) {
    var ts = terms(q);
    if (!ts.length) {
      results = SEARCH_INDEX.filter(function (e) { return e.k === 'page'; });
    } else {
      results = SEARCH_INDEX.map(function (e) {
        var title = stem(e.t);
        var hay = stem(e.t + ' ' + e.p + ' ' + e.x);
        if (!ts.every(function (t) { return hay.indexOf(t) !== -1; })) return null;
        var score = 0;
        var phrase = ts.join(' ');
        if (title.indexOf(phrase) === 0) score += 100;
        else if (title.indexOf(phrase) !== -1) score += 60;
        ts.forEach(function (t) {
          if (title.indexOf(t) !== -1) score += 12;
          if (stem(e.x).indexOf(t) !== -1) score += 3;
        });
        score += e.k === 'page' ? 6 : e.k === 'h2' ? 3 : 0;
        return { e: e, score: score };
      }).filter(Boolean).sort(function (a, b) { return b.score - a.score; }).slice(0, 12).map(function (r) { return r.e; });
    }
    activeIndex = 0;
    render(ts, q);
  }

  function render(ts, q) {
    if (!results.length) {
      list.innerHTML = '<li class="px-4 py-10 text-center text-sm text-muted">No results for “<span class="font-semibold text-ink">' + esc(q.trim()) + '</span>”. Try a different word.</li>';
      input.removeAttribute('aria-activedescendant');
      return;
    }
    var header = ts.length ? '' : '<li class="px-3 pt-2 pb-1 text-xs font-semibold tracking-wider text-muted uppercase" role="presentation">Pages</li>';
    list.innerHTML = header + results.map(function (e, i) {
      var icon = e.k === 'page'
        ? '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4"/>'
        : '<path d="M5 9h14M5 15h14M10 4 8 20M16 4l-2 16"/>';
      return '<li role="option" id="sr-' + i + '" aria-selected="' + (i === activeIndex) + '" class="search-result rounded-xl" data-index="' + i + '">' +
        '<a href="' + esc(e.u) + '" tabindex="-1" class="flex gap-3 px-3 py-2.5">' +
          '<svg class="mt-0.5 shrink-0 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">' + icon + '</svg>' +
          '<span class="min-w-0">' +
            '<span class="result-title block text-sm font-semibold text-ink">' + mark(e.t, ts) + '</span>' +
            (e.k !== 'page' ? '<span class="block text-xs text-muted">' + esc(e.p) + '</span>' : '') +
            (e.x ? '<span class="mt-0.5 line-clamp-2 block text-xs leading-relaxed text-muted">' + mark(snippet(e.x, ts), ts) + '</span>' : '') +
          '</span>' +
        '</a></li>';
    }).join('');
    setActive(activeIndex);
  }

  function setActive(i) {
    var items = $$('[role="option"]', list);
    if (!items.length) return;
    activeIndex = (i + items.length) % items.length;
    items.forEach(function (li, n) { li.setAttribute('aria-selected', String(n === activeIndex)); });
    input.setAttribute('aria-activedescendant', 'sr-' + activeIndex);
    items[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  function openSearch() {
    if (!overlay.hidden) return;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    input.value = '';
    runSearch('');
    input.focus();
  }
  function closeSearch() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    if (!root.classList.contains('sidebar-open')) document.body.style.overflow = '';
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function go(i) {
    var e = results[i];
    if (!e) return;
    closeSearch();
    window.location.href = e.u;
  }

  if (overlay) {
    $$('[data-search-open]').forEach(function (b) { b.addEventListener('click', openSearch); });
    $('[data-search-close]').addEventListener('click', closeSearch);
    overlay.addEventListener('mousedown', function (e) { if (e.target === overlay) closeSearch(); });
    input.addEventListener('input', function () { runSearch(input.value); });
    list.addEventListener('mousemove', function (e) {
      var li = e.target.closest('[role="option"]');
      if (li && Number(li.dataset.index) !== activeIndex) setActive(Number(li.dataset.index));
    });
    list.addEventListener('click', function (e) {
      var li = e.target.closest('[role="option"]');
      if (!li) return;
      e.preventDefault();
      go(Number(li.dataset.index));
    });
    overlay.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
      else if (e.key === 'Enter' && document.activeElement === input) { e.preventDefault(); go(activeIndex); }
      else if (e.key === 'Escape') { e.preventDefault(); closeSearch(); }
      else if (e.key === 'Tab') {
        // Keep focus inside the dialog: the input and the Esc button.
        var close = $('[data-search-close]');
        e.preventDefault();
        (document.activeElement === input ? close : input).focus();
      }
    });
    document.addEventListener('keydown', function (e) {
      var typing = /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.isContentEditable;
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (overlay.hidden) openSearch(); else closeSearch();
      } else if (e.key === '/' && !typing && overlay.hidden) {
        e.preventDefault();
        openSearch();
      }
    });
  }

  /* 11. Scroll reveal ------------------------------------------------------- */
  var revealEls = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion) {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  } else if (revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Reveal this element and everything before it, so fast jumps never leave gaps.
        var idx = revealEls.indexOf(entry.target);
        revealEls.slice(0, idx + 1).forEach(function (el, n) {
          if (el.classList.contains('is-in')) return;
          el.style.transitionDelay = Math.min(n % 3, 2) * 70 + 'ms';
          el.classList.add('is-in');
          io.unobserve(el);
        });
      });
    }, { rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
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

/* ---------- Footer year ----------
   The copyright year in the footer (<span data-year>) is this year, so it never goes stale. */
(function () {
  'use strict';
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
