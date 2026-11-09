/* Prism — site script
 * Vanilla JavaScript, no dependencies. Sections:
 *  1. Content and settings (playground answers, benchmarks, pricing)
 *  2. Helpers
 *  3. Header, mobile menu, scroll reveal, logo marquee
 *  4. Playground (streaming demo on the home page)
 *  5. Benchmark chart (inline SVG)
 *  6. Pricing: billing toggle and cost calculator
 *  7. Accordion (FAQ)
 *  8. Code tabs and copy buttons
 *  9. Filters (changelog topics, open roles)
 * 10. Forms
 * 11. Boot
 * Back to top button (separate block at the end)
 */
document.documentElement.classList.add('js');

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

  /* ------------------------------------------------------------------
   * 1. Content and settings
   * ------------------------------------------------------------------ */

  // Playground examples. In answer text, **bold** marks emphasis and [n] cites source n.
  // `seconds` and `tokens` are what the meta line shows for the prism-2 model.
  const PLAYGROUND = [
    {
      id: 'onboarding',
      label: 'Summarize Q3 onboarding tickets',
      prompt: 'What did customers say about onboarding in our Q3 support tickets?',
      seconds: 2.1, tokens: 168,
      sources: [
        { kind: 'Help desk', title: 'Q3 tickets tagged “onboarding” (212)' },
        { kind: 'Call notes', title: 'Customer calls, August 2026' },
        { kind: 'Wiki', title: 'Onboarding checklist v3' },
        { kind: 'Analytics', title: 'Activation funnel, Q3' }
      ],
      answer: [
        { p: 'Across 212 onboarding tickets in Q3, three themes account for most of the volume [1]:' },
        { ul: [
          '**Data import is the main blocker.** 38% of tickets mention CSV imports failing on date formats, mostly from teams moving off spreadsheets [1].',
          '**SSO setup stalls larger teams.** Admins at companies over 200 people wait six days on average for IT to configure SAML [2].',
          '**The checklist skips integrations.** Step 4 links to a page retired in July, which explains the spike in “where do I connect my calendar” questions [3].'
        ] },
        { p: 'Teams that finished their import in the first session were 2.3× more likely to be active after 30 days [4], so fixing date parsing is likely the highest-leverage change.' }
      ]
    },
    {
      id: 'launch',
      label: 'Draft a launch email for v4.2',
      prompt: 'Draft a launch email for v4.2 from the release notes, in our brand voice.',
      seconds: 2.6, tokens: 151,
      sources: [
        { kind: 'Docs', title: 'Release notes — v4.2' },
        { kind: 'Wiki', title: 'Brand voice guide' },
        { kind: 'Help desk', title: 'Top feature requests, H1 2026' }
      ],
      answer: [
        { p: '**Subject:** Shared dashboards are here, and they update themselves' },
        { p: 'Hi {first_name}, v4.2 is live. The headline: dashboards can now be shared with anyone in your workspace and refresh every 15 minutes, so the numbers in Monday’s meeting are Monday’s numbers [1].' },
        { ul: [
          '**Shared dashboards** with view-only links and per-chart permissions [1].',
          '**Scheduled exports** to email or a shared drive, the most requested feature this year [3].',
          '**30% faster loading** for workspaces with more than 10,000 records [1].'
        ] },
        { p: 'I kept it under 120 words and led with the outcome, as the voice guide asks [2]. Want a shorter version for the in-app banner?' }
      ]
    },
    {
      id: 'sso',
      label: 'Find deals blocked on SSO',
      prompt: 'Which enterprise deals list SSO as a blocker this quarter?',
      seconds: 1.9, tokens: 142,
      sources: [
        { kind: 'CRM', title: 'Open opportunities, Q4' },
        { kind: 'Call notes', title: 'Security review calls' },
        { kind: 'Wiki', title: 'Identity roadmap 2027' }
      ],
      answer: [
        { p: 'Four open enterprise deals mention SSO as a blocker, worth **$1.18M** in combined annual value [1]:' },
        { ul: [
          '**Ardent Logistics** ($420k) needs SCIM provisioning, not only SAML. Procurement review on November 14 [1][2].',
          '**Kestrel Bank** ($360k) requires SSO enforced for every user, contractors included [2].',
          '**Otter Creek Schools** ($240k) wants SSO through their existing identity provider before a pilot [1].',
          '**Vantage Freight** ($160k): blocker resolved last week, now waiting on legal [1].'
        ] },
        { p: 'SCIM is planned for January [3]. Sharing that date with Ardent before November 14 could keep the deal on track.' }
      ]
    }
  ];

  // Answer for anything that isn't an example. {prompt} is replaced with the visitor's text.
  const PLAYGROUND_FALLBACK = {
    seconds: 1.2, tokens: 74,
    sources: [{ kind: 'Docs', title: 'How the Prism playground works' }],
    answer: [
      { p: 'This demo streams pre-written answers to the three examples, so it can’t answer “{prompt}” yet [1].' },
      { p: 'Connected to your workspace, Prism would search your sources for that question and write an answer where **every claim links to the passage it came from**. Try an example, or read the API docs to run real queries.' }
    ]
  };

  // Models in the playground: milliseconds per streamed token and a multiplier for the meta line.
  const MODELS = {
    'prism-2': { msPerToken: 28, timeFactor: 1 },
    'prism-2-flash': { msPerToken: 11, timeFactor: 0.42 }
  };

  // Benchmark chart. scores are percentages, in the same order as `models`.
  const BENCHMARKS = {
    models: [
      { name: 'Prism 2', color: 'spectrum' },
      { name: 'Prism 2 Flash', color: '#6fb6ff' },
      { name: 'Model A', color: '#6b7286' },
      { name: 'Model B', color: '#40475a' }
    ],
    tests: [
      { name: 'SourceQA-Hard', scores: [78.4, 71.2, 64.9, 58.3] },
      { name: 'CiteCheck 2', scores: [86.1, 80.5, 69.7, 66.2] },
      { name: 'Needle-1M recall', scores: [91.3, 84.0, 72.8, 61.5] }
    ]
  };

  // Pricing. Seat prices are per seat per month. API prices are dollars per million tokens.
  const PRICING = {
    seat: { monthly: 24, annual: 20 },
    includedTokensM: 1,          // API tokens included each month on the Team plan (millions)
    inputShare: 0.75,            // the calculator assumes 75% input and 25% output tokens
    models: {
      'prism-2': { name: 'prism-2', input: 3, output: 12 },
      'prism-2-flash': { name: 'prism-2-flash', input: 0.4, output: 1.6 }
    },
    tokenSteps: [0, 1, 2, 5, 10, 25, 50, 100, 250, 500, 1000], // slider positions, millions of tokens
    enterpriseSeats: 150         // from this many seats the calculator suggests talking to sales
  };

  const LANG_KEY = 'prism-code-lang'; // remembered language for code samples (developers page)

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const money2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const num = new Intl.NumberFormat('en-US');

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }
  function store(key, value) {
    try {
      if (value === undefined) return safeStorage.getItem(key);
      safeStorage.setItem(key, value);
    } catch (e) { /* storage blocked: the feature still works for this visit */ }
    return null;
  }
  function params() {
    try { return new URLSearchParams(window.location.search); } catch (e) { return new URLSearchParams(); }
  }
  function setParam(name, value) {
    try {
      const url = new URL(window.location.href);
      if (value) url.searchParams.set(name, value); else url.searchParams.delete(name);
      history.replaceState(null, '', url);
    } catch (e) { /* some browsers block this on file:// pages */ }
  }

  // One polite live region for short announcements ("Copied", "Showing 4 releases").
  const announcer = document.createElement('p');
  announcer.className = 'sr-only';
  announcer.setAttribute('aria-live', 'polite');
  document.body.appendChild(announcer);
  function announce(msg) {
    announcer.textContent = '';
    window.setTimeout(() => { announcer.textContent = msg; }, 50);
  }

  /* ------------------------------------------------------------------
   * 3. Header, mobile menu, scroll reveal, logo marquee
   * ------------------------------------------------------------------ */
  const header = $('#site-header');
  const menuBtn = $('#menu-toggle');
  const menu = $('#mobile-menu');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
    header.classList.toggle('menu-open', open);
    $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
    $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });
  }
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  const revealObserver = ('IntersectionObserver' in window && !reduceMotion)
    ? new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          // Reveal this element and everything above it, so fast jumps never leave gaps.
          const top = en.target.getBoundingClientRect().top;
          $$('.reveal:not(.is-visible)').forEach((el) => {
            if (el.getBoundingClientRect().top <= top) { el.classList.add('is-visible'); revealObserver.unobserve(el); }
          });
        });
      }, { rootMargin: '0px 0px -8% 0px', threshold: 0.05 })
    : null;
  function reveal(root) {
    $$('.reveal:not(.is-visible)', root).forEach((el) => {
      if (revealObserver) revealObserver.observe(el); else el.classList.add('is-visible');
    });
  }

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // The logo strip scrolls in a loop: fill the hidden second copy with the first list's logos.
  $$('[data-marquee-copy]').forEach((copy) => {
    const original = copy.previousElementSibling;
    if (original) copy.innerHTML = original.innerHTML;
  });

  /* ------------------------------------------------------------------
   * 4. Playground — streams a pre-written answer token by token.
   *    Reduced motion: the whole answer appears at once.
   * ------------------------------------------------------------------ */
  function initPlayground() {
    const form = $('#pg-form');
    if (!form) return;
    const prompt = $('#pg-prompt');
    const model = $('#pg-model');
    const runBtn = $('#pg-run');
    const out = $('#pg-output');
    const srcList = $('#pg-sources');
    const state = $('#pg-state');
    const meta = $('#pg-meta');
    const examples = $('#pg-examples');
    let job = 0;        // increments on every run, so a stopped run can't keep writing
    let running = false;

    examples.innerHTML = PLAYGROUND.map((ex) =>
      '<li><button type="button" data-example="' + ex.id + '" class="group flex w-full items-center justify-between gap-3 rounded-xl border border-white/[.07] bg-white/[.02] px-3.5 py-2.5 text-left text-sm text-muted transition hover:border-white/15 hover:bg-white/[.05] hover:text-fg aria-pressed:border-brand-400/40 aria-pressed:bg-brand-400/[.07] aria-pressed:text-fg" aria-pressed="false">' +
      '<span>' + escapeHtml(ex.label) + '</span>' +
      '<svg viewBox="0 0 20 20" class="h-4 w-4 shrink-0 text-subtle transition group-hover:translate-x-0.5 group-hover:text-fg" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg>' +
      '</button></li>').join('');

    function setState(text, tone) {
      const dot = { idle: 'bg-subtle', busy: 'bg-ray-amber', done: 'bg-brand-400' }[tone || 'idle'];
      state.innerHTML = '<span class="h-1.5 w-1.5 rounded-full ' + dot + '" aria-hidden="true"></span>' +
        '<span class="' + (tone === 'busy' ? 'shimmer' : '') + '">' + escapeHtml(text) + '</span>';
    }
    function setRunning(on) {
      running = on;
      $('[data-run-label]', runBtn).textContent = on ? 'Stop' : 'Run';
      $('[data-run-icon]', runBtn).classList.toggle('hidden', on);
      $('[data-stop-icon]', runBtn).classList.toggle('hidden', !on);
      out.setAttribute('aria-busy', String(on));
    }
    function markExample(id) {
      $$('[data-example]', examples).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.example === id)));
    }
    function pick(text) {
      const t = text.trim().toLowerCase();
      return PLAYGROUND.find((ex) => ex.prompt.toLowerCase() === t) || null;
    }
    function sourceItem(s, i) {
      return '<li id="pg-src-' + (i + 1) + '" class="flex min-w-0 items-center gap-3 rounded-xl border border-white/[.07] bg-ink-950/60 px-3 py-2.5 text-sm">' +
        '<span class="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-white/[.07] font-mono text-[11px] text-fg">' + (i + 1) + '</span>' +
        '<span class="min-w-0"><span class="block truncate text-fg">' + escapeHtml(s.title) + '</span>' +
        '<span class="block truncate font-mono text-[11px] text-subtle">' + escapeHtml(s.kind) + '</span></span></li>';
    }

    // Split text into tokens: **, [n] citations, words with their leading space.
    function tokens(text) { return text.match(/\*\*|\[\d+\]|\s*[^\s*[]+|\s+|[*[]/g) || []; }

    // Build a writer that appends tokens into block elements (p / ul > li) inside `out`.
    function writer(blocks) {
      const queue = [];
      blocks.forEach((b) => {
        if (b.p) queue.push({ tag: 'p', parent: null, toks: tokens(b.p) });
        if (b.ul) b.ul.forEach((item, i) => queue.push({ tag: 'li', list: i === 0, toks: tokens(item) }));
      });
      let qi = 0, ti = 0, el = null, strong = null, list = null;
      const caret = document.createElement('span');
      caret.className = 'caret';
      caret.setAttribute('aria-hidden', 'true');
      return {
        total: queue.reduce((n, q) => n + q.toks.length, 0),
        // Write one token; returns false when everything is written.
        step() {
          if (qi >= queue.length) { caret.remove(); return false; }
          const q = queue[qi];
          if (ti === 0) {
            if (q.tag === 'li') {
              if (q.list || !list) { list = document.createElement('ul'); out.appendChild(list); }
              el = document.createElement('li'); list.appendChild(el);
            } else {
              list = null; el = document.createElement('p'); out.appendChild(el);
            }
            strong = null;
          }
          const tok = q.toks[ti];
          if (tok === '**') {
            if (strong) strong = null; else { strong = document.createElement('strong'); el.appendChild(strong); }
          } else if (/^\[\d+\]$/.test(tok)) {
            const n = tok.slice(1, -1);
            const a = document.createElement('a');
            a.className = 'cite';
            a.href = '#pg-src-' + n;
            a.textContent = n;
            a.setAttribute('aria-label', 'Source ' + n);
            el.appendChild(a);
          } else {
            const target = strong || el;
            const last = target.lastChild;
            if (last && last.nodeType === 3) last.appendData(tok); else target.appendChild(document.createTextNode(tok));
          }
          (strong || el).appendChild(caret);
          ti++;
          if (ti >= q.toks.length) { qi++; ti = 0; }
          return true;
        }
      };
    }

    function stop(message) {
      job++;
      setRunning(false);
      $$('.caret', out).forEach((c) => c.remove());
      if (message) setState(message, 'idle');
    }

    function run() {
      const text = prompt.value.trim();
      if (!text) { setState('Type a question first', 'idle'); prompt.focus(); return; }
      const ex = pick(text);
      const data = ex || {
        seconds: PLAYGROUND_FALLBACK.seconds, tokens: PLAYGROUND_FALLBACK.tokens, sources: PLAYGROUND_FALLBACK.sources,
        answer: PLAYGROUND_FALLBACK.answer.map((b) => (b.p ? { p: b.p.replace('{prompt}', text.length > 80 ? text.slice(0, 77) + '…' : text) } : b))
      };
      markExample(ex ? ex.id : null);
      const m = MODELS[model.value] || MODELS['prism-2'];
      const id = ++job;
      out.innerHTML = '';
      srcList.innerHTML = '';
      meta.textContent = '';
      const w = writer(data.answer);
      const finish = () => {
        setRunning(false);
        setState('Done', 'done');
        meta.textContent = model.value + ' · ' + (data.seconds * m.timeFactor).toFixed(1) + ' s · ' + data.tokens + ' tokens';
      };

      if (reduceMotion) {
        srcList.innerHTML = data.sources.map(sourceItem).join('');
        while (w.step()) { /* write everything at once */ }
        finish();
        return;
      }

      setRunning(true);
      setState('Searching ' + data.sources.length + ' sources…', 'busy');
      let si = 0;
      const addSource = () => {
        if (id !== job) return;
        if (si < data.sources.length) {
          srcList.insertAdjacentHTML('beforeend', sourceItem(data.sources[si], si));
          const li = srcList.lastElementChild;
          li.animate([{ opacity: 0, transform: 'translateY(6px)' }, { opacity: 1, transform: 'none' }], { duration: 300, easing: 'ease-out' });
          si++;
          window.setTimeout(addSource, 170);
          return;
        }
        setState('Writing…', 'busy');
        const tick = () => {
          if (id !== job) return;
          // A little jitter makes the stream feel natural.
          if (w.step()) window.setTimeout(tick, m.msPerToken * (0.5 + Math.random()));
          else finish();
        };
        window.setTimeout(tick, 250);
      };
      window.setTimeout(addSource, 300);
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (running) stop('Stopped'); else run();
    });
    prompt.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); if (!running) run(); }
    });
    examples.addEventListener('click', (e) => {
      const b = e.target.closest('[data-example]');
      if (!b) return;
      const ex = PLAYGROUND.find((x) => x.id === b.dataset.example);
      prompt.value = ex.prompt;
      stop();
      run();
    });

    // Run the first example once, when the playground comes into view.
    const auto = () => { if (!running && !out.querySelector('.cite')) run(); };
    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) { io.disconnect(); window.setTimeout(auto, 600); }
      }, { threshold: 0.35 });
      io.observe($('#playground'));
    } else {
      auto();
    }
  }

  /* ------------------------------------------------------------------
   * 5. Benchmark chart — horizontal grouped bars drawn as inline SVG.
   *    Redrawn on resize so text stays the same size on every screen.
   * ------------------------------------------------------------------ */
  function initBenchmarks() {
    const box = $('#bench-chart');
    if (!box) return;
    const fill = (m) => (m.color === 'spectrum' ? 'url(#bench-spectrum)' : m.color);

    $('#bench-legend').innerHTML = BENCHMARKS.models.map((m) =>
      '<span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-sm" style="background:' +
      (m.color === 'spectrum' ? 'var(--spectrum)' : m.color) + '" aria-hidden="true"></span>' + escapeHtml(m.name) + '</span>').join('');

    $('#bench-table').innerHTML = '<table class="w-full min-w-[28rem] text-left text-sm"><thead><tr class="text-subtle">' +
      '<th scope="col" class="py-2 pr-4 font-normal">Benchmark</th>' +
      BENCHMARKS.models.map((m) => '<th scope="col" class="py-2 pr-4 font-normal">' + escapeHtml(m.name) + '</th>').join('') +
      '</tr></thead><tbody>' +
      BENCHMARKS.tests.map((t) => '<tr class="border-t border-white/[.07]"><th scope="row" class="py-2 pr-4 font-normal text-fg">' + escapeHtml(t.name) + '</th>' +
        t.scores.map((s) => '<td class="py-2 pr-4 font-mono text-muted">' + s.toFixed(1) + '</td>').join('') + '</tr>').join('') +
      '</tbody></table>';

    function draw() {
      const W = Math.max(260, Math.round(box.clientWidth));
      const n = BENCHMARKS.models.length;
      const barH = 12, gap = 7, labelH = 26, groupGap = 26, valueW = 44;
      const groupH = labelH + n * (barH + gap) - gap;
      const H = BENCHMARKS.tests.length * (groupH + groupGap) - groupGap + 28;
      const plotW = W - valueW;
      let s = '<svg viewBox="0 0 ' + W + ' ' + H + '" width="100%" height="' + H + '" role="img" aria-label="Supported-answer rate by benchmark. ' +
        BENCHMARKS.tests.map((t) => t.name + ': ' + BENCHMARKS.models.map((m, i) => m.name + ' ' + t.scores[i] + '%').join(', ')).join('. ') + '.">' +
        '<defs><linearGradient id="bench-spectrum" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="#ff7eb3"/><stop offset=".3" stop-color="#ffb86b"/><stop offset=".55" stop-color="#7cf2c8"/><stop offset=".8" stop-color="#6fb6ff"/><stop offset="1" stop-color="#b18cff"/></linearGradient></defs>';
      // Gridlines at 25 / 50 / 75 / 100 %
      [0, 25, 50, 75, 100].forEach((v) => {
        const x = Math.round((v / 100) * plotW) + 0.5;
        s += '<line x1="' + x + '" x2="' + x + '" y1="0" y2="' + (H - 22) + '" stroke="rgba(255,255,255,' + (v ? '.06' : '.14') + ')"' + (v ? ' stroke-dasharray="2 4"' : '') + '/>';
        s += '<text x="' + x + '" y="' + (H - 6) + '" fill="#8b92a7" font-size="11" font-family="Geist Mono, monospace" text-anchor="' + (v === 0 ? 'start' : v === 100 ? 'end' : 'middle') + '">' + v + '</text>';
      });
      BENCHMARKS.tests.forEach((t, gi) => {
        const y0 = gi * (groupH + groupGap);
        s += '<text x="0" y="' + (y0 + 14) + '" fill="#eef0f6" font-size="13" font-weight="500" font-family="Geist, sans-serif">' + escapeHtml(t.name) + '</text>';
        t.scores.forEach((v, i) => {
          const y = y0 + labelH + i * (barH + gap);
          const w = Math.max(2, (v / 100) * plotW);
          s += '<rect class="bar" x="0" y="' + y + '" width="' + w.toFixed(1) + '" height="' + barH + '" rx="3" fill="' + fill(BENCHMARKS.models[i]) + '" style="transition-delay:' + (gi * 120 + i * 60) + 'ms"/>';
          s += '<text x="' + (w + 8).toFixed(1) + '" y="' + (y + barH - 2) + '" fill="' + (i === 0 ? '#eef0f6' : '#a6acbe') + '" font-size="11.5" font-family="Geist Mono, monospace"' + (i === 0 ? ' font-weight="600"' : '') + '>' + v.toFixed(1) + '</text>';
        });
      });
      box.innerHTML = s + '</svg>';
    }
    draw();
    let t = 0, lastW = box.clientWidth;
    window.addEventListener('resize', () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => { if (box.clientWidth !== lastW) { lastW = box.clientWidth; draw(); } }, 120);
    });
  }

  /* ------------------------------------------------------------------
   * 6. Pricing — billing toggle and usage cost calculator
   * ------------------------------------------------------------------ */
  function initPricing() {
    const toggle = $('#billing-toggle');
    if (!toggle) return;
    let annual = toggle.getAttribute('aria-checked') === 'true';

    function applyBilling() {
      toggle.setAttribute('aria-checked', String(annual));
      $$('[data-price-monthly]').forEach((el) => { el.textContent = annual ? el.dataset.priceAnnual : el.dataset.priceMonthly; });
      $$('[data-billing-note]').forEach((el) => { el.textContent = annual ? el.dataset.annual : el.dataset.monthly; });
      calc();
    }
    toggle.addEventListener('click', () => { annual = !annual; applyBilling(); });

    const seats = $('#calc-seats');
    const tokens = $('#calc-tokens');
    tokens.max = String(PRICING.tokenSteps.length - 1);
    const out = {
      seats: $('#calc-seats-value'), tokens: $('#calc-tokens-value'), total: $('#calc-total'), year: $('#calc-year'),
      seatLine: $('#calc-seat-line'), seatCost: $('#calc-seat-cost'), apiLine: $('#calc-api-line'), apiCost: $('#calc-api-cost'),
      note: $('#calc-note'), live: $('#calc-live')
    };
    let liveTimer = 0;

    function fillTrack(r) {
      const pct = ((r.value - r.min) / (r.max - r.min)) * 100;
      r.style.setProperty('--fill', pct + '%');
    }
    function tokenLabel(m) { return m === 0 ? 'None' : m >= 1000 ? (m / 1000) + 'B tokens' : m + 'M tokens'; }

    function calc() {
      const n = Math.min(500, Math.max(1, parseInt(seats.value, 10) || 1));
      const millions = PRICING.tokenSteps[parseInt(tokens.value, 10)] || 0;
      const modelId = ($('input[name="calc-model"]:checked') || {}).value || 'prism-2';
      const model = PRICING.models[modelId];
      const seatPrice = annual ? PRICING.seat.annual : PRICING.seat.monthly;
      const blended = model.input * PRICING.inputShare + model.output * (1 - PRICING.inputShare);
      const billable = Math.max(0, millions - PRICING.includedTokensM);
      const seatCost = n * seatPrice;
      const apiCost = billable * blended;
      const total = seatCost + apiCost;

      fillTrack(seats); fillTrack(tokens);
      out.seats.textContent = n + (n === 1 ? ' seat' : ' seats');
      out.tokens.textContent = tokenLabel(millions);
      tokens.setAttribute('aria-valuetext', tokenLabel(millions) + ' per month');
      seats.setAttribute('aria-valuetext', n + (n === 1 ? ' seat' : ' seats'));
      out.seatLine.textContent = n + ' × ' + money.format(seatPrice) + (annual ? ' (billed annually)' : ' (billed monthly)');
      out.seatCost.textContent = money.format(seatCost);
      out.apiLine.textContent = billable
        ? num.format(billable) + 'M × ' + money2.format(blended) + ' (' + model.name + ', ' + PRICING.includedTokensM + 'M included)'
        : (millions ? 'Within the ' + PRICING.includedTokensM + 'M tokens included' : 'No API usage');
      out.apiCost.textContent = money2.format(apiCost);
      out.total.textContent = money.format(Math.round(total));
      out.year.textContent = money.format(Math.round(total * 12)) + ' per year';
      out.note.hidden = n < PRICING.enterpriseSeats;
      window.clearTimeout(liveTimer);
      liveTimer = window.setTimeout(() => { out.live.textContent = 'Estimated ' + money.format(Math.round(total)) + ' per month.'; }, 700);
    }

    [seats, tokens].forEach((r) => r.addEventListener('input', calc));
    $$('input[name="calc-model"]').forEach((r) => r.addEventListener('change', calc));
    applyBilling();
  }

  /* ------------------------------------------------------------------
   * 7. Accordion — buttons with aria-expanded; one item open at a time.
   * ------------------------------------------------------------------ */
  function initAccordions() {
    $$('[data-accordion]').forEach((acc) => {
      const items = $$('.acc-item', acc);
      items.forEach((item) => {
        const btn = $('button[aria-controls]', item);
        btn.addEventListener('click', () => {
          const open = btn.getAttribute('aria-expanded') !== 'true';
          items.forEach((other) => {
            if (other !== item && other.classList.contains('is-open')) {
              other.classList.remove('is-open');
              $('button[aria-controls]', other).setAttribute('aria-expanded', 'false');
            }
          });
          item.classList.toggle('is-open', open);
          btn.setAttribute('aria-expanded', String(open));
        });
      });
    });
  }

  /* ------------------------------------------------------------------
   * 8. Code tabs and copy buttons
   *    All tab groups switch together and remember the language.
   * ------------------------------------------------------------------ */
  function selectLang(lang, save) {
    $$('[data-tabs]').forEach((group) => {
      const tabs = $$('[role="tab"]', group);
      if (!tabs.some((t) => t.dataset.lang === lang)) return;
      tabs.forEach((t) => {
        const on = t.dataset.lang === lang;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
    });
    if (save) store(LANG_KEY, lang);
  }
  function initTabs() {
    const groups = $$('[data-tabs]');
    if (!groups.length) return;
    groups.forEach((group) => {
      const tabs = $$('[role="tab"]', group);
      tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => selectLang(tab.dataset.lang, true));
        tab.addEventListener('keydown', (e) => {
          const keys = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
          if (!(e.key in keys)) return;
          e.preventDefault();
          const next = tabs[(keys[e.key] + tabs.length) % tabs.length];
          selectLang(next.dataset.lang, true);
          next.focus();
        });
      });
    });
    const saved = store(LANG_KEY);
    if (saved && /^(curl|js|python)$/.test(saved)) selectLang(saved, false);
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise((resolve, reject) => {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      if (ok) resolve(); else reject(new Error('copy failed'));
    });
  }
  function initCopy() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-copy]');
      if (!btn) return;
      let text = btn.getAttribute('data-copy');
      if (!text) {
        // No literal text: copy the visible code block in the same group.
        const scope = btn.closest('[data-tabs], [data-copy-scope]');
        const panel = scope && ($$('[role="tabpanel"]', scope).find((p) => !p.hidden) || scope);
        const code = panel && $('pre code, code', panel);
        text = code ? code.textContent : '';
      }
      const label = $('[data-copy-label]', btn);
      copyText(text).then(() => {
        if (label) label.textContent = 'Copied';
        btn.classList.add('text-brand-300');
        announce('Copied to clipboard');
      }).catch(() => {
        if (label) label.textContent = 'Press Ctrl+C';
        announce('Copy failed. Select the text and press Ctrl+C.');
      }).finally(() => {
        window.setTimeout(() => { if (label) label.textContent = 'Copy'; btn.classList.remove('text-brand-300'); }, 1800);
      });
    });
  }

  /* ------------------------------------------------------------------
   * 9. Filters — toggle buttons that show items whose data-tags match.
   *    <div data-filter="name" data-filter-param="tag"> buttons [data-filter-value]
   *    items [data-filter-item="name"][data-tags="a b"], optional [data-filter-empty="name"]
   * ------------------------------------------------------------------ */
  function initFilters() {
    $$('[data-filter]').forEach((bar) => {
      const name = bar.dataset.filter;
      const param = bar.dataset.filterParam;
      const buttons = $$('[data-filter-value]', bar);
      const items = $$('[data-filter-item="' + name + '"]');
      const empty = $('[data-filter-empty="' + name + '"]');
      const noun = bar.dataset.filterNoun || 'items';
      const tagsOf = (el) => (el.dataset.tags || '').split(/\s+/).filter(Boolean);

      buttons.forEach((b) => {
        const v = b.dataset.filterValue;
        const count = v === 'all' ? items.length : items.filter((it) => tagsOf(it).includes(v)).length;
        const c = $('.seg-count', b);
        if (c) c.textContent = count;
      });

      function apply(value, user) {
        if (!buttons.some((b) => b.dataset.filterValue === value)) value = 'all';
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filterValue === value)));
        let shown = 0;
        items.forEach((it) => {
          const on = value === 'all' || tagsOf(it).includes(value);
          it.hidden = !on;
          if (on) shown++;
        });
        if (empty) empty.hidden = shown > 0;
        if (user) {
          if (param) setParam(param, value === 'all' ? '' : value);
          announce('Showing ' + shown + ' ' + noun);
        }
        // Newly shown items may still be waiting for their reveal.
        reveal(document);
      }
      buttons.forEach((b) => b.addEventListener('click', () => apply(b.dataset.filterValue, true)));
      apply(param ? (params().get(param) || 'all').toLowerCase() : 'all', false);
    });
  }

  /* ------------------------------------------------------------------
   * 10. Forms — inline validation and a success state. Demo forms send nothing.
   * ------------------------------------------------------------------ */
  // Free email providers the sales form rejects (it asks for a work address).
  const FREE_EMAIL = ['gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'aol.com', 'proton.me', 'protonmail.com', 'gmx.com'];

  function fieldMessage(el) {
    const v = el.value.trim();
    const label = el.getAttribute('data-label') || 'This field';
    if (el.type === 'checkbox') return el.required && !el.checked ? (el.getAttribute('data-msg') || 'Please check this box.') : '';
    if (el.required && !v) return label + ' is required.';
    if (!v) return '';
    const rule = el.getAttribute('data-validate') || el.type;
    if ((rule === 'email' || rule === 'work-email') && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter an email address like name@company.example.';
    if (rule === 'work-email' && FREE_EMAIL.includes(v.split('@').pop().toLowerCase())) return 'Please use your work email so we can find your workspace.';
    const min = +el.getAttribute('minlength');
    if (min && v.length < min) return label + ' needs at least ' + min + ' characters.';
    return '';
  }
  function groupMessage(group) {
    const min = +group.getAttribute('data-min-checked') || 1;
    return $$('input:checked', group).length >= min ? '' : group.getAttribute('data-msg') || 'Choose at least one option.';
  }
  function showError(el, msg) {
    const errId = el.id + '-error';
    let err = document.getElementById(errId);
    if (!err) {
      err = document.createElement('p');
      err.id = errId;
      err.className = 'field-error';
      (el.closest('[data-error-after]') || el).insertAdjacentElement('afterend', err);
    }
    err.textContent = msg;
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      const desc = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      if (desc.indexOf(errId) === -1) desc.push(errId);
      el.setAttribute('aria-describedby', desc.join(' '));
    } else {
      el.removeAttribute('aria-invalid');
    }
  }
  function fieldsOf(root) {
    return $$('input, select, textarea', root).filter((el) =>
      el.id && !['radio', 'hidden', 'submit', 'range'].includes(el.type) && !el.closest('[data-group]'));
  }
  function validate(form) {
    let firstBad = null;
    fieldsOf(form).forEach((el) => {
      const msg = fieldMessage(el);
      showError(el, msg);
      if (msg && !firstBad) firstBad = el;
    });
    $$('[data-group]', form).forEach((g) => {
      const msg = groupMessage(g);
      showError(g, msg);
      if (msg && !firstBad) firstBad = $('input', g);
    });
    const status = $('[data-form-status]', form);
    if (status) status.textContent = firstBad ? 'Please fix the highlighted fields.' : '';
    if (firstBad) firstBad.focus();
    return !firstBad;
  }
  function setupValidation(form, onValid) {
    form.setAttribute('novalidate', '');
    fieldsOf(form).forEach((el) => {
      el.addEventListener('blur', () => { if (el.value.trim() || el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
      el.addEventListener('input', () => { if (el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
      el.addEventListener('change', () => { if (el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
    });
    $$('[data-group]', form).forEach((g) => g.addEventListener('change', () => { if (g.hasAttribute('aria-invalid')) showError(g, groupMessage(g)); }));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validate(form)) onValid(form);
    });
  }
  function successSwap(form, html) {
    const box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.className = 'rounded-2xl border border-brand-400/25 bg-brand-400/[.06] p-5 text-fg focus:outline-none';
    box.innerHTML = html;
    form.replaceWith(box);
    box.focus();
  }

  // A short reference for the sales form's confirmation, like PL-7K2Q (no 0/O or 1/I to misread).
  function makeRef(prefix) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  function initForms() {
    // To connect a form: replace successSwap(...) below with a fetch() to your form service, e.g.
    // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    //   .then((r) => { if (r.ok) successSwap(form, '...'); else showFormError(); });
    $$('[data-form="newsletter"]').forEach((form) => setupValidation(form, () => {
      successSwap(form, '<p class="font-medium">You’re on the list.</p>' +
        '<p class="mt-1 text-sm text-muted">Look out for a confirmation email from us; once you confirm, next month’s release notes are yours.</p>');
    }));

    $$('[data-form="contact"]').forEach((form) => {
      // Preselect the topic from the URL: contact.html?topic=careers
      const topic = params().get('topic');
      const select = $('#c-topic', form);
      if (topic && select && $$('option', select).some((o) => o.value === topic.toLowerCase())) select.value = topic.toLowerCase();
      setupValidation(form, () => {
        const first = ($('#c-first', form) || {}).value || '';
        successSwap(form, '<div class="flex items-start gap-4"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-400/15 text-brand-300">' +
          '<svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3.2L15 7"/></svg></span>' +
          '<div><p class="text-xl font-medium">Thanks, ' + escapeHtml(first.trim()) + '. Your request is in.</p>' +
          '<p class="mt-2 text-muted">Our sales team has it, and a real person will reply within one business day.</p>' +
          '<p class="mt-2 text-sm text-muted">Your reference is <strong class="font-mono font-medium text-fg">' + makeRef('PL') + '</strong>. Quote it if you email us before then.</p>' +
          '<p class="mt-4"><a href="developers.html" class="link">Explore the API while you wait</a></p></div></div>');
      });
    });
  }

  /* ------------------------------------------------------------------
   * 11. Boot
   * ------------------------------------------------------------------ */
  initPlayground();
  initBenchmarks();
  initPricing();
  initAccordions();
  initTabs();
  initCopy();
  initFilters();
  initForms();
  reveal(document);
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
