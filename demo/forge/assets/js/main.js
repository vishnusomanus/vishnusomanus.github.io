/* Forge — site script
 * Vanilla JavaScript, no dependencies. Sections:
 *  1. Content and settings (code samples, API explorer, latency, pricing, status)
 *  2. Helpers (DOM, storage, announcements, syntax highlighting)
 *  3. Header, mobile menu, scroll reveal
 *  4. Code language tabs (synced across the page and remembered)
 *  5. Hero: typed code sample with an animated response
 *  6. API explorer (request inspector)
 *  7. Latency chart (inline SVG)
 *  8. Pricing: billing switch and volume calculator
 *  9. Accordion (FAQ)
 * 10. Copy buttons
 * 11. Filters and search (changelog, SDKs)
 * 12. Status page: 90-day uptime bars with tooltips
 * 13. Quickstart: "On this page" highlighting
 * 14. Forms (newsletter, sales, sign-up with API key demo)
 * 15. Boot
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

  // Languages offered by every code tab group, in tab order.
  const LANGS = ['curl', 'node', 'python', 'go'];
  const LANG_KEY = 'forge-code-lang'; // remembered language (all pages)

  // Hero code sample, one per language. `file` is the name shown in the window bar.
  const HERO_SAMPLES = {
    curl: {
      file: 'send-event.sh',
      code: `curl https://api.forge.example/v1/events \\
  -H "Authorization: Bearer $FORGE_KEY" \\
  -H "Idempotency-Key: ord_8812-paid" \\
  -d '{
    "type": "invoice.paid",
    "tenant": "acme-co",
    "data": { "invoice_id": "in_8812", "amount": 4900, "currency": "usd" }
  }'`
    },
    node: {
      file: 'send-event.mjs',
      code: `import { Forge } from "@forgehq/node";

const forge = new Forge(process.env.FORGE_KEY);

const event = await forge.events.send({
  type: "invoice.paid",
  tenant: "acme-co",
  data: { invoice_id: "in_8812", amount: 4900, currency: "usd" },
}, { idempotencyKey: "ord_8812-paid" });

console.log(event.status); // "queued"`
    },
    python: {
      file: 'send_event.py',
      code: `import os
from forge import Forge

forge = Forge(os.environ["FORGE_KEY"])

event = forge.events.send(
    type="invoice.paid",
    tenant="acme-co",
    data={"invoice_id": "in_8812", "amount": 4900, "currency": "usd"},
    idempotency_key="ord_8812-paid",
)
print(event.status)  # "queued"`
    },
    go: {
      file: 'main.go',
      code: `client := forge.NewClient(os.Getenv("FORGE_KEY"))

event, err := client.Events.Send(ctx, &forge.EventParams{
	Type:   "invoice.paid",
	Tenant: "acme-co",
	Data: map[string]any{
		"invoice_id": "in_8812", "amount": 4900, "currency": "usd",
	},
	IdempotencyKey: "ord_8812-paid",
})
if err != nil {
	log.Fatal(err)
}`
    }
  };

  // What the hero "receives": the JSON body, then one line per delivery attempt.
  const HERO_RESPONSE = {
    status: '202 Accepted',
    latency: [31, 48], // random milliseconds in this range
    body: {
      id: 'evt_2Lq8vX4mN7kR',
      type: 'invoice.paid',
      status: 'queued',
      endpoints: 3
    },
    deliveries: [
      { code: 200, host: 'hooks.acme.example/forge', note: '84 ms' },
      { code: 200, host: 'erp.acme.example/inbound', note: '131 ms' },
      { code: 503, host: 'legacy.acme.example/hook', note: 'retry in 5s' }
    ]
  };

  // API explorer endpoints. `in` says where a parameter goes: path, query or body.
  // Validation failures and unknown ids return realistic 422 / 404 errors.
  const API_BASE = 'https://api.forge.example';
  const INSPECTOR = [
    {
      id: 'send', method: 'POST', path: '/v1/events', status: 202, latency: [28, 54],
      desc: 'Send an event to every subscribed endpoint.',
      params: [
        { name: 'type', in: 'body', kind: 'select', value: 'invoice.paid', options: ['invoice.paid', 'customer.created', 'subscription.canceled'] },
        { name: 'tenant', in: 'body', kind: 'text', value: 'acme-co', pattern: '^[a-z0-9-]{2,40}$', error: 'tenant must be 2–40 lowercase letters, digits or dashes.' },
        { name: 'amount', in: 'body', kind: 'number', value: '4900', min: 0, max: 1000000, hint: 'data.amount, in cents' }
      ]
    },
    {
      id: 'get', method: 'GET', path: '/v1/events/{id}', status: 200, latency: [18, 34],
      desc: 'Retrieve an event with its delivery summary.',
      params: [{ name: 'id', in: 'path', kind: 'text', value: 'evt_2Lq8vX4mN7kR', hint: 'try an id that doesn’t start with evt_' }]
    },
    {
      id: 'list', method: 'GET', path: '/v1/deliveries', status: 200, latency: [22, 46],
      desc: 'List recent delivery attempts, newest first.',
      params: [
        { name: 'status', in: 'query', kind: 'select', value: 'any', options: ['any', 'succeeded', 'failed', 'pending'] },
        { name: 'limit', in: 'query', kind: 'number', value: '3', min: 1, max: 100, hint: '1–100' }
      ]
    },
    {
      id: 'replay', method: 'POST', path: '/v1/events/{id}/replay', status: 202, latency: [30, 60],
      desc: 'Queue an event for redelivery.',
      params: [
        { name: 'id', in: 'path', kind: 'text', value: 'evt_2Lq8vX4mN7kR' },
        { name: 'endpoint', in: 'body', kind: 'select', value: 'all', options: ['all', 'ep_7Hc2Qm', 'ep_9Kd4Lx', 'ep_3Fw8Rt'] }
      ]
    },
    {
      id: 'stats', method: 'GET', path: '/v1/endpoints/{id}/stats', status: 200, latency: [40, 90],
      desc: 'Success rate and latency for one endpoint.',
      params: [
        { name: 'id', in: 'path', kind: 'text', value: 'ep_7Hc2Qm' },
        { name: 'window', in: 'query', kind: 'select', value: '24h', options: ['1h', '24h', '7d'] }
      ]
    }
  ];
  // Sample delivery log used by GET /v1/deliveries (newest first).
  const DELIVERIES = [
    { id: 'dlv_8Rk2Wq', event: 'evt_2Lq8vX4mN7kR', endpoint: 'ep_7Hc2Qm', status: 'succeeded', http_status: 200, duration_ms: 84, attempt: 1 },
    { id: 'dlv_8Rk2Wr', event: 'evt_2Lq8vX4mN7kR', endpoint: 'ep_9Kd4Lx', status: 'succeeded', http_status: 200, duration_ms: 131, attempt: 1 },
    { id: 'dlv_8Rk2Ws', event: 'evt_2Lq8vX4mN7kR', endpoint: 'ep_3Fw8Rt', status: 'failed', http_status: 503, duration_ms: 2004, attempt: 1 },
    { id: 'dlv_8Rj9Pa', event: 'evt_2Lq7Tb1cQ0aZ', endpoint: 'ep_7Hc2Qm', status: 'succeeded', http_status: 200, duration_ms: 77, attempt: 1 },
    { id: 'dlv_8Rj9Pb', event: 'evt_2Lq7Tb1cQ0aZ', endpoint: 'ep_3Fw8Rt', status: 'pending', http_status: null, duration_ms: null, attempt: 3 },
    { id: 'dlv_8Rj4Mx', event: 'evt_2Lq6Hn8sV3pE', endpoint: 'ep_9Kd4Lx', status: 'succeeded', http_status: 204, duration_ms: 96, attempt: 2 },
    { id: 'dlv_8Rj4My', event: 'evt_2Lq6Hn8sV3pE', endpoint: 'ep_3Fw8Rt', status: 'failed', http_status: 410, duration_ms: 58, attempt: 1 },
    { id: 'dlv_8Rh1Ce', event: 'evt_2Lq5Ad4kM9wB', endpoint: 'ep_7Hc2Qm', status: 'succeeded', http_status: 200, duration_ms: 69, attempt: 1 }
  ];

  // Latency chart on the home page: 24 hourly points in milliseconds, oldest first (UTC hours).
  const LATENCY = {
    p50: [37, 36, 35, 35, 34, 36, 38, 40, 41, 39, 38, 37, 38, 40, 42, 43, 41, 39, 38, 37, 36, 37, 38, 38],
    p99: [168, 160, 152, 149, 151, 170, 196, 214, 228, 205, 188, 180, 192, 210, 236, 248, 226, 204, 190, 182, 176, 174, 180, 184],
    max: 300 // top of the y axis
  };

  // Pricing. Prices in USD. `included` is events per month in the base fee.
  // Overage tiers are by total monthly volume: `upTo` events at `perMillion` dollars per million.
  const PRICING = {
    annualDiscount: 0.2, // 20% off the base fee when billed annually
    enterpriseFrom: 250000000, // from this volume the calculator suggests Enterprise
    plans: [
      { id: 'free', name: 'Free', base: 0, included: 100000, tiers: null },
      { id: 'build', name: 'Build', base: 29, included: 1000000, tiers: [{ upTo: Infinity, perMillion: 20 }] },
      { id: 'scale', name: 'Scale', base: 249, included: 15000000, tiers: [{ upTo: 100000000, perMillion: 12 }, { upTo: Infinity, perMillion: 8 }] }
    ],
    // Slider stops (events per month).
    steps: [10000, 25000, 50000, 100000, 250000, 500000, 1000000, 2000000, 3500000, 5000000, 7500000, 10000000, 15000000, 25000000, 50000000, 75000000, 100000000, 150000000, 250000000, 500000000],
    defaultStep: 9 // 5,000,000
  };

  // Status page. Dates are UTC days. The 90-day window ends on `end`.
  // Each incident marks one day for one component, in some or all regions.
  const STATUS = {
    end: '2026-10-15',
    days: 90,
    // The next scheduled maintenance ('YYYY-MM-DD', 02:00–02:30 UTC). null = a rolling demo date: the next
    // Thursday at least three days away.
    maintenance: null,
    components: [
      { id: 'api', name: 'REST API' },
      { id: 'ingest', name: 'Event ingestion' },
      { id: 'delivery', name: 'Delivery workers' },
      { id: 'dashboard', name: 'Dashboard' },
      { id: 'portal', name: 'Customer portal' }
    ],
    regions: [
      { id: 'us-east', name: 'us-east', city: 'Virginia' },
      { id: 'eu-central', name: 'eu-central', city: 'Frankfurt' },
      { id: 'ap-southeast', name: 'ap-southeast', city: 'Singapore' }
    ],
    // level: 'warn' (degraded), 'down' (outage) or 'info' (maintenance). minutes: how long it lasted.
    incidents: [
      { date: '2026-10-02', component: 'dashboard', regions: ['us-east', 'eu-central', 'ap-southeast'], level: 'warn', minutes: 25, title: 'Delivery logs slow to load' },
      { date: '2026-09-23', component: 'delivery', regions: ['ap-southeast'], level: 'warn', minutes: 47, title: 'Elevated delivery latency in ap-southeast' },
      { date: '2026-09-23', component: 'ingest', regions: ['ap-southeast'], level: 'warn', minutes: 12, title: 'Elevated delivery latency in ap-southeast' },
      { date: '2026-08-29', component: 'api', regions: ['us-east'], level: 'down', minutes: 11, title: 'API errors in us-east' },
      { date: '2026-08-29', component: 'ingest', regions: ['us-east'], level: 'down', minutes: 11, title: 'API errors in us-east' },
      { date: '2026-08-04', component: 'ingest', regions: ['eu-central'], level: 'info', minutes: 30, title: 'Scheduled database maintenance' },
      { date: '2026-07-24', component: 'portal', regions: ['us-east', 'eu-central', 'ap-southeast'], level: 'warn', minutes: 38, title: 'Portal sign-in failures' }
    ]
  };

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const num = new Intl.NumberFormat('en-US');
  const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
  const money2 = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 4 });
  const sleep = (ms) => new Promise((r) => window.setTimeout(r, ms));
  const rand = (min, max) => Math.round(min + Math.random() * (max - min));

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
  // Random base62 string from the browser's secure generator (ids and the demo API key).
  function randomId(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const bytes = new Uint8Array(length);
    if (window.crypto && window.crypto.getRandomValues) window.crypto.getRandomValues(bytes);
    else for (let i = 0; i < length; i++) bytes[i] = Math.floor(Math.random() * 256);
    return Array.from(bytes, (b) => chars[b % 62]).join('');
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

  // A small syntax highlighter for the code samples: returns HTML with t-* spans.
  // Languages: curl (shell), node, python, go, json.
  const KEYWORDS = {
    node: ['import', 'from', 'const', 'let', 'await', 'async', 'new', 'return', 'export', 'function', 'if', 'else', 'throw', 'try', 'catch', 'default'],
    python: ['import', 'from', 'def', 'return', 'if', 'else', 'raise', 'with', 'as', 'for', 'in', 'not', 'and', 'or', 'try', 'except'],
    go: ['package', 'import', 'func', 'return', 'if', 'else', 'var', 'defer', 'map', 'any', 'range', 'for', 'err'],
    curl: [],
    json: []
  };
  const LITERALS = ['true', 'false', 'null', 'True', 'False', 'None', 'nil', 'undefined'];
  const SHELL_COMMANDS = ['curl', 'npm', 'pnpm', 'yarn', 'pip', 'go', 'forge', 'brew', 'export', 'gem', 'composer', 'cargo', 'dotnet', 'mvn', 'terraform', 'mix'];
  function highlight(code, lang) {
    const kw = KEYWORDS[lang] || [];
    const comment = lang === 'python' || lang === 'curl' ? /#[^\n]*/y : (lang === 'json' ? null : /\/\/[^\n]*/y);
    const str = lang === 'curl' ? /"(?:[^"\\]|\\.)*"?|'[^']*'?/y : /"(?:[^"\\\n]|\\.)*"?|'(?:[^'\\\n]|\\.)*'?|`[^`]*`?/y;
    const ident = /[A-Za-z_$][\w$]*/y;
    const number = /\d+(?:\.\d+)?/y;
    const flag = /--?[A-Za-z][\w-]*/y;
    let out = '';
    let plain = '';
    let lineStart = true;
    const flush = () => { if (plain) { out += escapeHtml(plain); plain = ''; } };
    const emit = (cls, text) => { flush(); out += '<span class="t-' + cls + '">' + escapeHtml(text) + '</span>'; };
    const at = (re, i) => { re.lastIndex = i; const m = re.exec(code); return m ? m[0] : null; };
    let i = 0;
    while (i < code.length) {
      const ch = code[i];
      let m;
      if (comment && (lang !== 'curl' || lineStart || /\s/.test(code[i - 1] || ' ')) && (m = at(comment, i))) { emit('c', m); i += m.length; continue; }
      if ((ch === '"' || ch === "'" || (ch === '`' && lang !== 'curl')) && (m = at(str, i))) {
        // JSON keys are strings followed by a colon.
        const isKey = lang === 'json' && /^\s*:/.test(code.slice(i + m.length, i + m.length + 4));
        emit(isKey ? 'p' : 's', m); i += m.length; lineStart = false; continue;
      }
      if (lang === 'curl' && ch === '-' && /\s/.test(code[i - 1] || ' ') && (m = at(flag, i))) { emit('f', m); i += m.length; continue; }
      if (/\d/.test(ch) && (m = at(number, i))) { emit('n', m); i += m.length; lineStart = false; continue; }
      if (/[A-Za-z_$]/.test(ch) && (m = at(ident, i))) {
        if (LITERALS.indexOf(m) !== -1) emit('n', m);
        else if (kw.indexOf(m) !== -1) emit('k', m);
        else if (lang === 'curl' && lineStart && SHELL_COMMANDS.indexOf(m) !== -1) emit('f', m);
        else if (code[i + m.length] === '(') emit('f', m);
        else plain += m;
        i += m.length; lineStart = false; continue;
      }
      if (lang === 'json' && /[{}[\],:]/.test(ch)) { emit('d', ch); i++; continue; }
      if (ch === '\n') lineStart = true;
      else if (!/\s/.test(ch) && !(lang === 'curl' && ch === '$' && lineStart)) lineStart = false;
      if (lang === 'curl' && ch === '$' && lineStart) { emit('d', ch); i++; continue; }
      plain += ch; i++;
    }
    flush();
    return out;
  }
  function json(value) { return JSON.stringify(value, null, 2); }

  /* ------------------------------------------------------------------
   * 3. Header, mobile menu, scroll reveal
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
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 4);
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
      }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 })
    : null;
  function reveal(root) {
    $$('.reveal:not(.is-visible)', root).forEach((el) => {
      if (revealObserver) revealObserver.observe(el); else el.classList.add('is-visible');
    });
  }

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // 404 page: show the path the visitor asked for (as text, never HTML).
  $$('[data-404-path]').forEach((el) => {
    const path = window.location.pathname;
    if (/^https?:$/.test(window.location.protocol) && path && !/404\.html$/.test(path)) el.textContent = path.slice(0, 80);
  });

  /* ------------------------------------------------------------------
   * 4. Code language tabs
   *    Every [data-lang-tabs] tablist on the page shows the same language.
   *    Panels are [data-lang-panel="node"] inside a [data-code-group].
   *    The choice is saved under LANG_KEY and restored on every page.
   * ------------------------------------------------------------------ */
  const langListeners = [];
  let currentLang = LANGS.indexOf(store(LANG_KEY)) !== -1 ? store(LANG_KEY) : 'curl';

  function selectLang(lang, save) {
    if (LANGS.indexOf(lang) === -1) return;
    currentLang = lang;
    $$('[data-lang-tabs]').forEach((list) => {
      $$('[role="tab"][data-lang]', list).forEach((tab) => {
        const on = tab.dataset.lang === lang;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
      });
    });
    $$('[data-code-group]').forEach((group) => {
      const panels = $$('[data-lang-panel]', group);
      if (!panels.some((p) => p.dataset.langPanel === lang)) return;
      panels.forEach((p) => { p.hidden = p.dataset.langPanel !== lang; });
    });
    if (save) store(LANG_KEY, lang);
    langListeners.forEach((fn) => fn(lang));
  }

  // Arrow keys, Home and End move between tabs in any tablist (roving tabindex).
  function tablistKeys(list, onPick) {
    list.addEventListener('keydown', (e) => {
      const tabs = $$('[role="tab"]', list);
      const i = tabs.indexOf(document.activeElement);
      if (i === -1) return;
      let next = null;
      if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
      else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === 'Home') next = tabs[0];
      else if (e.key === 'End') next = tabs[tabs.length - 1];
      if (!next) return;
      e.preventDefault();
      next.focus();
      onPick(next);
    });
  }

  function initLangTabs() {
    const lists = $$('[data-lang-tabs]');
    if (!lists.length) return;
    lists.forEach((list) => {
      list.addEventListener('click', (e) => {
        const tab = e.target.closest('[role="tab"][data-lang]');
        if (tab) selectLang(tab.dataset.lang, true);
      });
      tablistKeys(list, (tab) => selectLang(tab.dataset.lang, true));
    });
    selectLang(currentLang, false);
  }

  // Static code blocks: <code data-highlight="node"> is colored on load (text stays plain for copying).
  function initHighlight() {
    $$('code[data-highlight]').forEach((el) => { el.innerHTML = highlight(el.textContent, el.dataset.highlight); });
  }

  /* ------------------------------------------------------------------
   * 5. Hero: types the sample for the chosen language, then "receives"
   *    the response line by line. Reduced motion: everything shows at once.
   * ------------------------------------------------------------------ */
  function initHero() {
    const codeEl = $('#hero-code-text');
    if (!codeEl) return;
    const respEl = $('#hero-response');
    const statusEl = $('#hero-status');
    const fileEl = $('#hero-file');
    const panel = $('#hero-panel');
    let run = 0;
    let started = false;

    function responseLines() {
      const lines = highlight(json(HERO_RESPONSE.body), 'json').split('\n');
      HERO_RESPONSE.deliveries.forEach((d) => {
        const ok = d.code < 400;
        lines.push('<span class="t-d">→</span> <span class="' + (ok ? 'text-ok' : 'text-down') + '">' + d.code + '</span> ' +
          escapeHtml(d.host.padEnd(29)) + ' <span class="' + (ok ? 't-d' : 't-k') + '">' + escapeHtml(d.note) + '</span>');
      });
      return lines;
    }
    function setStatus(state, ms) {
      if (state === 'typing') statusEl.innerHTML = '<span class="text-subtle">writing request…</span>';
      else if (state === 'sending') statusEl.innerHTML = '<span class="inline-flex items-center gap-1.5"><span class="dot s-warn" aria-hidden="true"></span><span class="text-muted">sending…</span></span>';
      else statusEl.innerHTML = '<span class="inline-flex items-center gap-1.5"><span class="dot s-ok" aria-hidden="true"></span><span class="text-ok">' +
        escapeHtml(HERO_RESPONSE.status) + '</span></span><span>' + ms + ' ms</span>';
    }

    async function play(lang) {
      const id = ++run;
      const sample = HERO_SAMPLES[lang] || HERO_SAMPLES.curl;
      if (fileEl) fileEl.textContent = sample.file;
      const tab = $('#hero-tab-' + lang);
      if (tab && panel) panel.setAttribute('aria-labelledby', tab.id);
      const ms = rand(HERO_RESPONSE.latency[0], HERO_RESPONSE.latency[1]);
      if (reduceMotion) {
        codeEl.innerHTML = highlight(sample.code, lang);
        respEl.innerHTML = responseLines().join('\n');
        setStatus('done', ms);
        return;
      }
      respEl.innerHTML = '';
      setStatus('typing');
      const text = sample.code;
      const start = performance.now();
      const msPerChar = Math.max(4, 1500 / text.length);
      await new Promise((resolve) => {
        function frame(now) {
          if (id !== run) return resolve();
          const n = Math.min(text.length, Math.floor((now - start) / msPerChar));
          codeEl.innerHTML = highlight(text.slice(0, n), lang) + (n < text.length ? '<span class="caret" aria-hidden="true"></span>' : '');
          if (n < text.length) requestAnimationFrame(frame); else resolve();
        }
        requestAnimationFrame(frame);
      });
      if (id !== run) return;
      setStatus('sending');
      await sleep(380);
      if (id !== run) return;
      setStatus('done', ms);
      const lines = responseLines();
      const body = lines.length - HERO_RESPONSE.deliveries.length;
      for (let i = 0; i < lines.length; i++) {
        if (id !== run) return;
        respEl.insertAdjacentHTML('beforeend', (i ? '\n' : '') + '<span class="line-in inline-block">' + (lines[i] || ' ') + '</span>');
        await sleep(i < body ? 45 : 420);
      }
    }

    langListeners.push((lang) => { if (started) play(lang); });
    $('#hero-replay').addEventListener('click', () => play(currentLang));
    // Start once the sample is on screen (it usually is on load).
    const begin = () => { if (!started) { started = true; play(currentLang); } };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        if (entries.some((en) => en.isIntersecting)) { io.disconnect(); begin(); }
      });
      io.observe($('#hero-code'));
    } else begin();
  }

  /* ------------------------------------------------------------------
   * 6. API explorer — builds a realistic response for the chosen endpoint
   *    and parameters, entirely in the browser.
   * ------------------------------------------------------------------ */
  function initInspector() {
    const form = $('#insp-form');
    if (!form) return;
    const list = $('#insp-endpoints');
    const paramsBox = $('#insp-params');
    const sendBtn = $('#insp-send');
    let remaining = 5000; // ratelimit-remaining header
    let current = INSPECTOR[0];

    // Endpoint radio list.
    list.innerHTML = INSPECTOR.map((ep, i) =>
      '<label class="flex cursor-pointer items-center gap-2 px-3 py-2.5 font-mono text-[13px] text-muted transition hover:bg-ink-850 hover:text-fg has-[:checked]:bg-ink-800 has-[:checked]:text-fg has-[:checked]:shadow-[inset_2px_0_0_var(--color-brand-400)] has-[:focus-visible]:outline-2 has-[:focus-visible]:-outline-offset-2 has-[:focus-visible]:outline-brand-400">' +
      '<input type="radio" name="endpoint" value="' + ep.id + '" class="sr-only"' + (i === 0 ? ' checked' : '') + '>' +
      '<span class="method ' + (ep.method === 'GET' ? 'm-get' : 'm-post') + '">' + ep.method + '</span>' +
      '<span class="min-w-0 truncate">' + escapeHtml(ep.path) + '</span></label>').join('');

    function renderParams() {
      paramsBox.innerHTML = current.params.map((p) => {
        const id = 'insp-p-' + p.name;
        const label = '<label for="' + id + '" class="mb-1 flex items-baseline justify-between gap-2 font-mono text-xs text-muted"><span><span class="text-fg">' + p.name + '</span> <span class="text-subtle">' + p.in + '</span></span>' +
          (p.hint ? '<span class="truncate text-subtle">' + escapeHtml(p.hint) + '</span>' : '') + '</label>';
        let control;
        if (p.kind === 'select') {
          control = '<select id="' + id + '" name="' + p.name + '" class="input input-mono py-2">' +
            p.options.map((o) => '<option' + (o === p.value ? ' selected' : '') + '>' + escapeHtml(o) + '</option>').join('') + '</select>';
        } else {
          control = '<input id="' + id + '" name="' + p.name + '" type="text"' + (p.kind === 'number' ? ' inputmode="numeric"' : '') +
            ' value="' + escapeHtml(p.value) + '" class="input input-mono py-2" autocomplete="off" spellcheck="false">';
        }
        return '<div>' + label + control + '</div>';
      }).join('');
      $('#insp-desc').textContent = current.desc;
      updatePreview();
    }

    function values() {
      const v = {};
      current.params.forEach((p) => { v[p.name] = ($('#insp-p-' + p.name).value || '').trim(); });
      return v;
    }
    function buildUrl(v) {
      let path = current.path.replace(/\{(\w+)\}/g, (m, k) => encodeURIComponent(v[k] || ''));
      const q = current.params.filter((p) => p.in === 'query').map((p) => p.name + '=' + encodeURIComponent(v[p.name]));
      return API_BASE + path + (q.length ? '?' + q.join('&') : '');
    }
    function bodyOf(v) {
      const body = {};
      current.params.filter((p) => p.in === 'body').forEach((p) => {
        if (p.name === 'amount') body.data = { amount: Number(v.amount) || 0 };
        else body[p.name] = v[p.name];
      });
      return Object.keys(body).length ? body : null;
    }
    function updatePreview() {
      const v = values();
      const url = buildUrl(v);
      $('#insp-method').textContent = current.method;
      $('#insp-method').className = 'method ' + (current.method === 'GET' ? 'm-get' : 'm-post');
      $('#insp-url').textContent = url;
      let curl = 'curl ' + (current.method === 'GET' ? '' : '-X ' + current.method + ' ') + url + ' \\\n  -H "Authorization: Bearer $FORGE_KEY"';
      const body = bodyOf(v);
      if (body) curl += " \\\n  -d '" + JSON.stringify(body) + "'";
      $('#insp-curl').innerHTML = highlight(curl, 'curl');
    }

    // Returns { status, text, body } for the current endpoint and values.
    function respond(v) {
      const err = (status, text, type, message, param) => ({ status, text, body: { error: Object.assign({ type, message }, param ? { param } : {}) } });
      for (const p of current.params) {
        const val = v[p.name];
        if (val === '') return err(422, 'Unprocessable Entity', 'invalid_request_error', p.name + ' is required.', p.name);
        if (p.kind === 'number') {
          const n = Number(val);
          if (!/^-?\d+$/.test(val) || n < p.min || n > p.max) return err(422, 'Unprocessable Entity', 'invalid_request_error', p.name + ' must be a whole number between ' + num.format(p.min) + ' and ' + num.format(p.max) + '.', p.name);
        }
        if (p.pattern && !new RegExp(p.pattern).test(val)) return err(422, 'Unprocessable Entity', 'invalid_request_error', p.error, p.name);
      }
      const now = new Date().toISOString();
      if (current.id === 'send') {
        const data = v.type === 'customer.created' ? { customer_id: 'cus_' + randomId(8), amount: Number(v.amount) } : { invoice_id: 'in_' + rand(1000, 9999), amount: Number(v.amount), currency: 'usd' };
        return { status: 202, text: 'Accepted', body: { id: 'evt_' + randomId(12), object: 'event', type: v.type, tenant: v.tenant, data, status: 'queued', endpoints: v.type === 'subscription.canceled' ? 2 : 3, created_at: now } };
      }
      if (current.id === 'get' || current.id === 'replay') {
        if (!/^evt_[A-Za-z0-9]{6,}$/.test(v.id)) return err(404, 'Not Found', 'not_found', "No event with id '" + v.id + "'.");
      }
      if (current.id === 'get') {
        return { status: 200, text: 'OK', body: { id: v.id, object: 'event', type: 'invoice.paid', tenant: 'acme-co', status: 'partially_delivered', created_at: '2026-10-15T09:41:07.218Z', deliveries: { succeeded: 2, failed: 0, pending: 1 }, next_attempt_at: '2026-10-15T09:41:12.218Z' } };
      }
      if (current.id === 'replay') {
        const eps = v.endpoint === 'all' ? ['ep_7Hc2Qm', 'ep_9Kd4Lx', 'ep_3Fw8Rt'] : [v.endpoint];
        return { status: 202, text: 'Accepted', body: { id: 'rpl_' + randomId(10), object: 'replay', event: v.id, endpoints: eps, status: 'queued', created_at: now } };
      }
      if (current.id === 'list') {
        const matches = DELIVERIES.filter((d) => v.status === 'any' || d.status === v.status);
        const limit = Number(v.limit);
        return { status: 200, text: 'OK', body: { object: 'list', data: matches.slice(0, limit), has_more: matches.length > limit } };
      }
      // stats
      if (!/^ep_[A-Za-z0-9]{4,}$/.test(v.id)) return err(404, 'Not Found', 'not_found', "No endpoint with id '" + v.id + "'.");
      const scale = { '1h': 1, '24h': 24, '7d': 168 }[v.window] || 24;
      const attempts = 4210 * scale + rand(0, 400);
      return { status: 200, text: 'OK', body: { endpoint: v.id, window: v.window, attempts, success_rate: Number((99.2 + Math.random() * 0.7).toFixed(2)), latency_ms: { p50: rand(70, 95), p95: rand(180, 260), p99: rand(380, 620) }, failures: { '5xx': Math.round(attempts * 0.004), timeout: Math.round(attempts * 0.001), '4xx': Math.round(attempts * 0.0005) } } };
    }

    let busy = false;
    async function send(instant) {
      if (busy) return;
      busy = true;
      const v = values();
      const res = respond(v);
      const ok = res.status < 400;
      const ms = ok ? rand(current.latency[0], current.latency[1]) : rand(8, 16);
      sendBtn.disabled = true;
      $('#insp-meta').innerHTML = '<span>Sending…</span>';
      if (!reduceMotion && !instant) await sleep(ms * 6);
      const bodyText = json(res.body);
      remaining = Math.max(0, remaining - 1);
      const headers = {
        'content-type': 'application/json',
        'content-length': String(new Blob([bodyText]).size),
        'forge-request-id': 'req_' + randomId(14),
        'forge-version': '2026-09-01',
        'ratelimit-limit': '5000',
        'ratelimit-remaining': String(remaining),
        'ratelimit-reset': '60'
      };
      $('#insp-body').innerHTML = highlight(bodyText, 'json');
      $('#insp-headers').innerHTML = '<span class="t-d">HTTP/2</span> <span class="' + (ok ? 'text-ok' : 'text-down') + '">' + res.status + ' ' + res.text + '</span>\n' +
        Object.keys(headers).map((k) => '<span class="t-p">' + k + '</span><span class="t-d">:</span> ' + escapeHtml(headers[k])).join('\n');
      $('#insp-meta').innerHTML = '<span class="inline-flex items-center gap-1.5"><span class="dot ' + (ok ? 's-ok' : 's-down') + '" aria-hidden="true"></span><span class="' + (ok ? 'text-ok' : 'text-down') + '">' + res.status + ' ' + res.text + '</span></span>' +
        '<span>' + ms + ' ms</span><span class="hidden sm:inline">' + headers['content-length'] + ' B</span>';
      sendBtn.disabled = false;
      busy = false;
    }

    list.addEventListener('change', (e) => {
      const ep = INSPECTOR.find((x) => x.id === e.target.value);
      if (ep) { current = ep; renderParams(); }
    });
    paramsBox.addEventListener('input', updatePreview);
    paramsBox.addEventListener('change', updatePreview);
    form.addEventListener('submit', (e) => { e.preventDefault(); send(); });
    form.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); send(); }
    });

    // Body / Headers tabs.
    const tabs = [$('#insp-tab-body'), $('#insp-tab-headers')];
    function pick(tab) {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        $('#' + t.getAttribute('aria-controls')).hidden = !on;
      });
    }
    tabs.forEach((t) => t.addEventListener('click', () => pick(t)));
    tablistKeys(tabs[0].parentElement, pick);

    renderParams();
    // Show a first response right away so the panel is never empty.
    send(true);
  }

  /* ------------------------------------------------------------------
   * 7. Latency chart — two polylines (p50, p99) drawn into #lat-chart.
   *    Redrawn on resize so text stays the same size on every screen.
   * ------------------------------------------------------------------ */
  function initLatency() {
    const box = $('#lat-chart');
    if (!box) return;
    function draw() {
      const w = Math.max(280, box.clientWidth - 8);
      const h = Math.max(180, box.clientHeight - 16);
      const pad = { l: 44, r: 10, t: 8, b: 26 };
      const iw = w - pad.l - pad.r;
      const ih = h - pad.t - pad.b;
      const x = (i) => pad.l + (i / (LATENCY.p50.length - 1)) * iw;
      const y = (v) => pad.t + ih - (v / LATENCY.max) * ih;
      const pts = (arr) => arr.map((v, i) => x(i).toFixed(1) + ',' + y(v).toFixed(1)).join(' ');
      let svg = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '" role="img" aria-label="Ingest latency over the last 24 hours. p50 between ' +
        Math.min.apply(null, LATENCY.p50) + ' and ' + Math.max.apply(null, LATENCY.p50) + ' ms, p99 between ' +
        Math.min.apply(null, LATENCY.p99) + ' and ' + Math.max.apply(null, LATENCY.p99) + ' ms." font-family="IBM Plex Mono, monospace" font-size="11">';
      [0, 100, 200, 300].forEach((v) => {
        svg += '<line x1="' + pad.l + '" x2="' + (w - pad.r) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="#222224"/>' +
          '<text x="' + (pad.l - 8) + '" y="' + (y(v) + 4) + '" fill="#8c8b85" text-anchor="end">' + v + '</text>';
      });
      ['−24h', '−18h', '−12h', '−6h', 'now'].forEach((label, k) => {
        const xi = x(k * (LATENCY.p50.length - 1) / 4);
        svg += '<text x="' + xi + '" y="' + (h - 6) + '" fill="#8c8b85" text-anchor="' + (k === 0 ? 'start' : k === 4 ? 'end' : 'middle') + '">' + label + '</text>';
      });
      const area = pts(LATENCY.p50) + ' ' + x(LATENCY.p50.length - 1) + ',' + y(0) + ' ' + x(0) + ',' + y(0);
      svg += '<defs><linearGradient id="lat-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffbe3d" stop-opacity=".22"/><stop offset="1" stop-color="#ffbe3d" stop-opacity="0"/></linearGradient></defs>';
      svg += '<polygon points="' + area + '" fill="url(#lat-fill)"/>';
      svg += '<polyline points="' + pts(LATENCY.p99) + '" fill="none" stroke="#a8a7a1" stroke-width="1.5" stroke-dasharray="4 4"/>';
      svg += '<polyline points="' + pts(LATENCY.p50) + '" fill="none" stroke="#ffbe3d" stroke-width="2"/>';
      const last = LATENCY.p50.length - 1;
      svg += '<circle cx="' + x(last) + '" cy="' + y(LATENCY.p50[last]) + '" r="3.5" fill="#ffbe3d"/>';
      svg += '</svg>';
      box.innerHTML = svg;
    }
    draw();
    let t;
    window.addEventListener('resize', () => { window.clearTimeout(t); t = window.setTimeout(draw, 120); });
  }

  /* ------------------------------------------------------------------
   * 8. Pricing — billing switch and volume calculator
   * ------------------------------------------------------------------ */
  // Monthly cost of a plan at a volume, or null if the plan can't carry it.
  function planCost(plan, volume, annual) {
    const base = plan.base * (annual ? 1 - PRICING.annualDiscount : 1);
    if (volume <= plan.included) return { base, overage: 0, total: base, lines: [] };
    if (!plan.tiers) return null;
    let overage = 0;
    let from = plan.included;
    const lines = [];
    for (const tier of plan.tiers) {
      if (volume <= from) break;
      const upTo = Math.min(volume, tier.upTo);
      const events = upTo - from;
      if (events > 0) {
        const cost = (events / 1e6) * tier.perMillion;
        overage += cost;
        lines.push({ events, perMillion: tier.perMillion, cost });
      }
      from = upTo;
    }
    return { base, overage, total: base + overage, lines };
  }
  function fmtEvents(n) {
    if (n >= 1e6) return num.format(n / 1e6) + 'M';
    if (n >= 1e3) return num.format(n / 1e3) + 'k';
    return num.format(n);
  }

  function initPricing() {
    const toggle = $('#billing-toggle');
    const slider = $('#calc-volume');
    let annual = toggle ? toggle.getAttribute('aria-checked') === 'true' : false;

    function applyBilling() {
      $$('[data-price-monthly]').forEach((el) => { el.textContent = annual ? el.dataset.priceAnnual : el.dataset.priceMonthly; });
      $$('[data-billing-note]').forEach((el) => { el.textContent = annual ? el.dataset.annual : el.dataset.monthly; });
    }
    if (toggle) {
      toggle.addEventListener('click', () => {
        annual = !annual;
        toggle.setAttribute('aria-checked', String(annual));
        applyBilling();
        calc();
        announce(annual ? 'Showing annual billing, 20% off base fees' : 'Showing monthly billing');
      });
      applyBilling();
    }

    let announceTimer;
    function calc() {
      if (!slider) return;
      const step = Number(slider.value);
      const volume = PRICING.steps[step];
      slider.style.setProperty('--fill', (step / (PRICING.steps.length - 1)) * 100 + '%');
      slider.setAttribute('aria-valuetext', num.format(volume) + ' events per month');
      $('#calc-volume-out').textContent = num.format(volume);
      const out = $('#calc-result');
      $$('[data-plan]').forEach((el) => el.classList.remove('is-recommended'));
      if (volume >= PRICING.enterpriseFrom) {
        $('#calc-plan').textContent = 'Enterprise';
        $('#calc-total').textContent = 'Custom';
        $('#calc-per').textContent = 'Volume pricing from $6 per million';
        $('#calc-breakdown').innerHTML = '<li class="flex justify-between gap-4"><span>At ' + fmtEvents(PRICING.enterpriseFrom) + '+ events a month</span><span class="text-fg">talk to us</span></li>';
        $('#calc-cta').textContent = 'Talk to sales';
        $('#calc-cta').setAttribute('href', 'contact.html?volume=250m');
        const ent = $('[data-plan="enterprise"]');
        if (ent) ent.classList.add('is-recommended');
      } else {
        // Cheapest plan that can carry the volume.
        let best = null;
        PRICING.plans.forEach((plan) => {
          const c = planCost(plan, volume, annual);
          if (c && (!best || c.total < best.cost.total)) best = { plan, cost: c };
        });
        const c = best.cost;
        $('#calc-plan').textContent = best.plan.name;
        $('#calc-total').textContent = money.format(Math.round(c.total));
        $('#calc-per').textContent = c.total > 0 ? money2.format(c.total / (volume / 1000)) + ' per 1,000 events' : 'Free, up to ' + num.format(best.plan.included) + ' events';
        let rows = '<li class="flex justify-between gap-4"><span>' + best.plan.name + ' base fee' + (annual && c.base ? ' (annual)' : '') + '</span><span class="text-fg">' + money.format(c.base) + '</span></li>' +
          '<li class="flex justify-between gap-4"><span>Included events</span><span class="text-fg">' + num.format(Math.min(volume, best.plan.included)) + '</span></li>';
        c.lines.forEach((l) => {
          rows += '<li class="flex justify-between gap-4"><span>' + fmtEvents(l.events) + ' × $' + l.perMillion + '/M</span><span class="text-fg">' + money.format(Math.round(l.cost)) + '</span></li>';
        });
        $('#calc-breakdown').innerHTML = rows;
        $('#calc-cta').textContent = best.plan.id === 'free' ? 'Start free' : 'Start with ' + best.plan.name;
        $('#calc-cta').setAttribute('href', 'signup.html?plan=' + best.plan.id);
        const card = $('[data-plan="' + best.plan.id + '"]');
        if (card) card.classList.add('is-recommended');
      }
      window.clearTimeout(announceTimer);
      announceTimer = window.setTimeout(() => announce($('#calc-plan').textContent + ': ' + $('#calc-total').textContent + ' a month'), 700);
      if (out) out.dataset.volume = String(volume);
    }
    if (slider) {
      slider.max = String(PRICING.steps.length - 1);
      if (!slider.dataset.touched) slider.value = String(PRICING.defaultStep);
      slider.addEventListener('input', calc);
      calc();
    }
  }

  /* ------------------------------------------------------------------
   * 9. Accordion (FAQ) — one answer open at a time.
   * ------------------------------------------------------------------ */
  function initAccordions() {
    $$('[data-accordion]').forEach((acc) => {
      const items = $$('.acc-item', acc);
      items.forEach((item) => {
        const btn = $('button[aria-controls]', item);
        btn.addEventListener('click', () => {
          const open = !item.classList.contains('is-open');
          items.forEach((other) => {
            other.classList.remove('is-open');
            $('button[aria-controls]', other).setAttribute('aria-expanded', 'false');
          });
          item.classList.toggle('is-open', open);
          btn.setAttribute('aria-expanded', String(open));
        });
      });
    });
  }

  /* ------------------------------------------------------------------
   * 10. Copy buttons — [data-copy="text"] copies that text; an empty
   *     data-copy copies the visible code in its [data-code-group] or
   *     [data-copy-scope] container.
   * ------------------------------------------------------------------ */
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
      let ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      if (ok) resolve(); else reject(new Error('copy failed'));
    });
  }
  function flashCopied(btn, ok) {
    if (!btn.dataset.label) btn.dataset.label = btn.innerHTML;
    btn.innerHTML = ok ? '<span aria-hidden="true">✓</span> Copied' : 'Press Ctrl+C';
    btn.classList.toggle('text-ok', ok);
    announce(ok ? 'Copied to clipboard' : 'Copy failed. Select the text and press Ctrl+C.');
    window.clearTimeout(btn._t);
    btn._t = window.setTimeout(() => { btn.innerHTML = btn.dataset.label; btn.classList.remove('text-ok'); }, 1800);
  }
  function initCopy() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-copy]');
      if (!btn) return;
      let text = btn.dataset.copy;
      if (!text) {
        const scope = btn.closest('[data-code-group], [data-copy-scope]');
        const visible = scope && $$('[data-lang-panel], [data-copy-source]', scope).find((p) => !p.hidden) || (scope && $('pre', scope));
        text = visible ? (visible.querySelector('pre') || visible).textContent : '';
      }
      copyText(text.replace(/ /g, ' ').trimEnd()).then(() => flashCopied(btn, true), () => flashCopied(btn, false));
    });
  }

  /* ------------------------------------------------------------------
   * 11. Filters and search
   *     [data-filter="name"] holds buttons with data-filter-value; items are
   *     [data-filter-item="name"] with space-separated data-tags. An optional
   *     [data-filter-search="name"] input matches the item's text.
   *     data-filter-param keeps the choice in the URL (?type=fix).
   * ------------------------------------------------------------------ */
  function initFilters() {
    $$('[data-filter]').forEach((bar) => {
      const name = bar.dataset.filter;
      const buttons = $$('[data-filter-value]', bar);
      const items = $$('[data-filter-item="' + name + '"]');
      const search = $('[data-filter-search="' + name + '"]');
      const empty = $('[data-filter-empty="' + name + '"]');
      const param = bar.dataset.filterParam;
      const noun = bar.dataset.filterNoun || 'items';
      let value = 'all';

      buttons.forEach((b) => {
        const v = b.dataset.filterValue;
        const count = v === 'all' ? items.length : items.filter((it) => (it.dataset.tags || '').split(' ').indexOf(v) !== -1).length;
        const c = $('.seg-count', b);
        if (c) c.textContent = count;
      });

      function apply(silent) {
        const q = search ? search.value.trim().toLowerCase() : '';
        let shown = 0;
        items.forEach((it) => {
          const tagOk = value === 'all' || (it.dataset.tags || '').split(' ').indexOf(value) !== -1;
          const textOk = !q || it.textContent.toLowerCase().indexOf(q) !== -1;
          it.hidden = !(tagOk && textOk);
          if (!it.hidden) shown++;
        });
        buttons.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.filterValue === value)));
        if (empty) empty.hidden = shown > 0;
        // Hide group headings (e.g. months) whose items are all hidden.
        $$('[data-filter-group="' + name + '"]').forEach((g) => {
          g.hidden = !$$('[data-filter-item="' + name + '"]', g).some((it) => !it.hidden);
        });
        if (!silent) announce('Showing ' + shown + ' ' + (shown === 1 ? ({ entries: 'entry', libraries: 'library' }[noun] || noun.replace(/s$/, '')) : noun));
      }
      buttons.forEach((b) => b.addEventListener('click', () => {
        value = b.dataset.filterValue;
        if (param) setParam(param, value === 'all' ? '' : value);
        apply();
      }));
      if (search) {
        let t;
        search.addEventListener('input', () => { window.clearTimeout(t); t = window.setTimeout(() => apply(), 150); });
      }
      const fromUrl = param && params().get(param);
      if (fromUrl && buttons.some((b) => b.dataset.filterValue === fromUrl)) value = fromUrl;
      apply(true);
    });
  }

  /* ------------------------------------------------------------------
   * 12. Status page — current status grid and 90-day uptime bars.
   *     Bars use a roving tabindex (arrow keys move between days) and show
   *     a tooltip on hover and focus.
   * ------------------------------------------------------------------ */
  const LEVEL = {
    ok: { label: 'Operational', cls: 's-ok' },
    warn: { label: 'Degraded performance', cls: 's-warn' },
    down: { label: 'Outage', cls: 's-down' },
    info: { label: 'Maintenance', cls: 's-info' },
    none: { label: 'No data', cls: 's-none' }
  };
  const RANK = { ok: 0, info: 1, warn: 2, down: 3 };
  const dayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

  // Day-by-day data for one component (and optionally one region).
  function uptimeDays(componentId, regionId) {
    const end = Date.parse(STATUS.end + 'T00:00:00Z');
    const regions = regionId === 'all' ? STATUS.regions.map((r) => r.id) : [regionId];
    const days = [];
    for (let i = STATUS.days - 1; i >= 0; i--) {
      const t = end - i * 86400000;
      const iso = new Date(t).toISOString().slice(0, 10);
      const hits = STATUS.incidents.filter((inc) => inc.date === iso && inc.component === componentId && inc.regions.some((r) => regions.indexOf(r) !== -1));
      let level = 'ok';
      let lost = 0;
      hits.forEach((inc) => {
        if (RANK[inc.level] > RANK[level]) level = inc.level;
        // Maintenance doesn't count as downtime; degraded counts half.
        const share = inc.regions.filter((r) => regions.indexOf(r) !== -1).length / regions.length;
        if (inc.level === 'down') lost += inc.minutes * share;
        if (inc.level === 'warn') lost += inc.minutes * share * 0.5;
      });
      days.push({ date: t, level, uptime: 100 - (lost / 1440) * 100, incidents: hits });
    }
    return days;
  }

  // The scheduled maintenance on the status page (time[data-maintenance]): STATUS.maintenance, or with null the
  // next Thursday at least three days away (02:00–02:30 UTC), so the demo never announces maintenance that has
  // already happened.
  function initMaintenance() {
    const el = $('time[data-maintenance]');
    if (!el) return;
    let day = typeof STATUS.maintenance === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(STATUS.maintenance) ? STATUS.maintenance : '';
    if (!day) {
      const now = new Date();
      const t = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 3));
      t.setUTCDate(t.getUTCDate() + ((4 - t.getUTCDay() + 7) % 7));
      day = t.toISOString().slice(0, 10);
    }
    el.setAttribute('datetime', day + 'T02:00Z');
    el.textContent = new Date(day + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) + ', 02:00–02:30 UTC';
  }

  function initStatus() {
    const root = $('#uptime');
    if (!root) return;
    const tip = $('#uptime-tip');
    let region = 'all';

    function render() {
      root.innerHTML = STATUS.components.map((c) => {
        const days = uptimeDays(c.id, region);
        const avg = days.reduce((s, d) => s + d.uptime, 0) / days.length;
        const bars = days.map((d, i) => {
          const label = dayFmt.format(d.date) + ': ' + d.uptime.toFixed(2) + '% uptime' + (d.incidents.length ? ', ' + d.incidents[0].title : ', no incidents');
          // The first 60 days are hidden on phones (30 days shown there).
          return '<button type="button" class="ubar ' + LEVEL[d.level].cls + (i < STATUS.days - 30 ? ' max-sm:hidden' : '') + '" data-day="' + i + '" tabindex="' + (i === days.length - 1 ? 0 : -1) + '" aria-label="' + escapeHtml(label) + '"></button>';
        }).join('');
        return '<div class="py-5" data-component="' + c.id + '">' +
          '<div class="flex items-baseline justify-between gap-4"><h3 class="text-[15px] font-medium">' + escapeHtml(c.name) + '</h3>' +
          '<p class="font-mono text-xs text-muted">' + avg.toFixed(3) + '% uptime</p></div>' +
          '<div class="relative mt-3 flex gap-[2px]" role="group" aria-label="' + escapeHtml(c.name) + ', daily uptime">' + bars + '</div>' +
          '<div class="mt-2 flex justify-between font-mono text-[11px] text-subtle"><span><span class="sm:hidden">30 days ago</span><span class="max-sm:hidden">90 days ago</span></span><span>Today</span></div></div>';
      }).join('');
      // Keep the data for tooltips.
      root._data = {};
      STATUS.components.forEach((c) => { root._data[c.id] = uptimeDays(c.id, region); });
    }

    function showTip(bar) {
      const comp = bar.closest('[data-component]').dataset.component;
      const d = root._data[comp][Number(bar.dataset.day)];
      tip.innerHTML = '<p class="font-mono text-[11px] text-subtle">' + dayFmt.format(d.date) + ' · UTC</p>' +
        '<p class="mt-1.5 flex items-center gap-2 text-fg"><span class="dot ' + LEVEL[d.level].cls + '" aria-hidden="true"></span>' + LEVEL[d.level].label + '</p>' +
        '<p class="mt-1 font-mono text-muted">' + d.uptime.toFixed(2) + '% uptime</p>' +
        (d.incidents.length ? '<p class="mt-2 border-t border-line pt-2 text-muted">' + escapeHtml(d.incidents[0].title) + ' · ' + d.incidents[0].minutes + ' min</p>' : '');
      tip.hidden = false;
      const wrap = tip.offsetParent.getBoundingClientRect();
      const r = bar.getBoundingClientRect();
      const left = Math.min(Math.max(r.left + r.width / 2 - wrap.left - tip.offsetWidth / 2, 0), wrap.width - tip.offsetWidth);
      tip.style.left = left + 'px';
      tip.style.top = (r.top - wrap.top - tip.offsetHeight - 8) + 'px';
    }
    function hideTip() { tip.hidden = true; }

    root.addEventListener('mouseover', (e) => { const b = e.target.closest('.ubar'); if (b) showTip(b); });
    root.addEventListener('mouseleave', hideTip);
    root.addEventListener('focusin', (e) => { const b = e.target.closest('.ubar'); if (b) showTip(b); });
    root.addEventListener('focusout', hideTip);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTip(); });
    root.addEventListener('keydown', (e) => {
      const b = e.target.closest('.ubar');
      if (!b) return;
      const bars = $$('.ubar', b.parentElement).filter((x) => x.offsetParent !== null);
      const i = bars.indexOf(b);
      let next = null;
      if (e.key === 'ArrowRight') next = bars[Math.min(bars.length - 1, i + 1)];
      else if (e.key === 'ArrowLeft') next = bars[Math.max(0, i - 1)];
      else if (e.key === 'Home') next = bars[0];
      else if (e.key === 'End') next = bars[bars.length - 1];
      if (!next) return;
      e.preventDefault();
      b.tabIndex = -1;
      next.tabIndex = 0;
      next.focus();
    });

    // Region switcher above the bars.
    $$('[data-region]').forEach((btn) => btn.addEventListener('click', () => {
      region = btn.dataset.region;
      $$('[data-region]').forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
      hideTip();
      render();
      announce('Showing uptime for ' + (region === 'all' ? 'all regions' : region));
    }));

    // Current status grid (components × regions). Everything is operational in the demo data.
    const grid = $('#status-grid');
    if (grid) {
      $$('[data-cell]', grid).forEach((cell) => {
        const level = cell.dataset.cell in LEVEL ? cell.dataset.cell : 'ok';
        cell.innerHTML = '<span class="dot ' + LEVEL[level].cls + '" aria-hidden="true"></span><span>' + LEVEL[level].label + '</span>';
      });
    }
    render();
  }

  /* ------------------------------------------------------------------
   * 13. Quickstart — highlight the current step in "On this page".
   * ------------------------------------------------------------------ */
  function initToc() {
    const links = $$('[data-toc] a[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    const sections = links.map((a) => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
    const setCurrent = (id) => links.forEach((a) => {
      if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
    const io = new IntersectionObserver(() => {
      // The current step is the last one whose top has passed 30% of the viewport.
      let current = sections[0];
      sections.forEach((s) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.3) current = s; });
      setCurrent(current.id);
    }, { rootMargin: '0px 0px -60% 0px', threshold: [0, 1] });
    sections.forEach((s) => io.observe(s));
    window.addEventListener('scroll', () => {
      let current = sections[0];
      sections.forEach((s) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.3) current = s; });
      setCurrent(current.id);
    }, { passive: true });
    setCurrent(sections[0].id);
  }

  /* ------------------------------------------------------------------
   * 14. Forms — inline validation, then a success state.
   *     The demo forms send nothing: see DOCS.md to connect a service.
   * ------------------------------------------------------------------ */
  // Free email providers the sales form rejects (it asks for a work address).
  const FREE_EMAIL = ['gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'aol.com', 'proton.me', 'protonmail.com', 'gmx.com', 'mail.com'];
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function fieldMessage(el) {
    const label = el.dataset.label || el.name;
    const v = (el.value || '').trim();
    if (el.type === 'checkbox') return el.required && !el.checked ? (el.dataset.required || 'Please confirm to continue.') : '';
    if (el.type === 'radio') {
      const group = $$('input[name="' + el.name + '"]', el.form);
      return el.required && !group.some((r) => r.checked) ? (el.dataset.required || 'Please choose one.') : '';
    }
    if (el.required && !v) return label + ' is required.';
    if (!v) return '';
    if (el.type === 'email' && !EMAIL_RE.test(v)) return 'Enter an email address like name@company.example.';
    if (el.dataset.validate === 'work-email' && FREE_EMAIL.indexOf(v.split('@')[1].toLowerCase()) !== -1) return 'Please use your work email so we can find your account.';
    if (el.minLength > 0 && v.length < el.minLength) return label + ' needs at least ' + el.minLength + ' characters.';
    if (el.pattern && !new RegExp('^(?:' + el.pattern + ')$').test(v)) return el.dataset.patternMessage || label + ' isn’t in the right format.';
    return '';
  }
  function showError(el, msg) {
    const key = el.type === 'radio' ? el.name : el.id;
    let err = document.getElementById(key + '-error');
    const target = el.type === 'radio' ? el.closest('fieldset') : el;
    if (!err) {
      err = document.createElement('p');
      err.id = key + '-error';
      err.className = 'field-error';
      const anchor = el.type === 'radio' ? target : (el.closest('[data-field]') || el.parentElement);
      anchor.appendChild(err);
    }
    err.textContent = msg;
    err.hidden = !msg;
    const els = el.type === 'radio' ? $$('input[name="' + el.name + '"]', el.form) : [el];
    els.forEach((x) => {
      if (msg) x.setAttribute('aria-invalid', 'true'); else x.removeAttribute('aria-invalid');
      const ids = (x.getAttribute('aria-describedby') || '').split(' ').filter((id) => id && id !== err.id);
      if (msg) ids.push(err.id);
      if (ids.length) x.setAttribute('aria-describedby', ids.join(' ')); else x.removeAttribute('aria-describedby');
    });
  }
  function fieldsOf(form) {
    const seen = {};
    return $$('input, select, textarea', form).filter((el) => {
      if (el.type === 'hidden' || el.disabled || !el.name || el.closest('[hidden]')) return false;
      if (el.type === 'radio') { if (seen[el.name]) return false; seen[el.name] = true; }
      return true;
    });
  }
  function validate(form) {
    let first = null;
    fieldsOf(form).forEach((el) => {
      const msg = fieldMessage(el);
      showError(el, msg);
      if (msg && !first) first = el;
    });
    if (first) first.focus();
    return !first;
  }
  function setupValidation(form, onValid) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validate(form)) onValid();
    });
    // After a field has shown an error, re-check it as the visitor types.
    form.addEventListener('input', (e) => {
      const el = e.target;
      if (el.getAttribute('aria-invalid') === 'true' || (el.type === 'radio' && el.form && $('[aria-invalid="true"][name="' + el.name + '"]', form))) showError(el, fieldMessage(el));
    });
    form.addEventListener('focusout', (e) => {
      const el = e.target;
      if (el.name && el.value && el.type !== 'radio' && el.type !== 'checkbox') showError(el, fieldMessage(el));
    });
  }
  function successSwap(form, html) {
    const box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.tabIndex = -1;
    box.className = 'focus:outline-none';
    box.innerHTML = html;
    form.replaceWith(box);
    box.focus();
  }

  // A short reference for the sales request, like FG-7K2Q (no 0/O or 1/I to misread).
  function makeRef(prefix) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  // Demo API key: "fk_test_" + 32 random characters. It's generated locally and works nowhere.
  const KEY_PREFIX = 'fk_test_';
  function maskKey(key) { return KEY_PREFIX + '•'.repeat(20) + key.slice(-4); }

  function initForms() {
    $$('form[data-form="newsletter"]').forEach((form) => setupValidation(form, () => {
      successSwap(form, '<p class="font-mono text-sm text-ok">✓ Subscribed</p><p class="mt-1 text-sm text-muted">Look out for a confirmation email. Click the link inside and you’re on the list: about one email a month.</p>');
    }));

    const contact = $('form[data-form="contact"]');
    if (contact) {
      // ?volume=250m (from the pricing calculator) preselects the volume.
      const vol = params().get('volume');
      const volSelect = $('#c-volume');
      if (vol && volSelect && $$('option', volSelect).some((o) => o.value === vol)) volSelect.value = vol;
      const msg = $('#c-message');
      const counter = $('#c-message-count');
      if (msg && counter) msg.addEventListener('input', () => { counter.textContent = msg.value.length + ' / ' + msg.maxLength; });
      setupValidation(contact, () => {
        const name = escapeHtml($('#c-first').value.trim());
        successSwap(contact,
          '<div class="term"><div class="term-bar h-9 font-mono text-xs text-subtle">sales-request</div><div class="p-6 sm:p-8">' +
          '<p class="font-mono text-sm text-ok">✓ Request received</p>' +
          '<h2 class="mt-3 text-2xl font-semibold tracking-tight">Thanks, ' + name + '.</h2>' +
          '<p class="mt-3 leading-relaxed text-muted">A solutions engineer will reply within one business day with a first estimate for your volume. Your reference is <span class="font-mono text-fg">' + makeRef('FG') + '</span>.</p>' +
          '<a href="docs.html" class="btn-ghost mt-6">Read the quickstart meanwhile</a></div></div>');
      });
    }

    const signup = $('form[data-form="signup"]');
    if (signup) {
      const plan = params().get('plan');
      const planNote = $('#su-plan');
      if (planNote && plan && /^(free|build|scale)$/.test(plan)) planNote.textContent = plan.charAt(0).toUpperCase() + plan.slice(1);
      setupValidation(signup, () => {
        const key = KEY_PREFIX + randomId(32);
        const project = $('#su-project').value.trim();
        const region = (signup.querySelector('input[name="region"]:checked') || {}).value || 'eu-central';
        signup.hidden = true;
        const panel = $('#key-panel');
        $('#key-project').textContent = project;
        $('#key-region').textContent = region;
        const keyEl = $('#key-value');
        const reveal = $('#key-reveal');
        const snippet = $('#key-snippet');
        let shown = false;
        function paint() {
          keyEl.textContent = shown ? key : maskKey(key);
          reveal.setAttribute('aria-pressed', String(shown));
          reveal.textContent = shown ? 'Hide' : 'Reveal';
          snippet.innerHTML = highlight('curl https://api.forge.example/v1/events \\\n  -H "Authorization: Bearer ' + (shown ? key : maskKey(key)) + '" \\\n  -d \'{"type": "test.ping", "tenant": "' + project + '"}\'', 'curl');
        }
        reveal.onclick = () => { shown = !shown; paint(); };
        $('#key-copy').dataset.copy = key;
        $('#key-snippet-copy').onclick = null;
        $('#key-snippet-copy').dataset.copy = 'curl https://api.forge.example/v1/events \\\n  -H "Authorization: Bearer ' + key + '" \\\n  -d \'{"type": "test.ping", "tenant": "' + project + '"}\'';
        paint();
        panel.hidden = false;
        $('#key-title').focus();
        $('#key-reset').onclick = () => {
          panel.hidden = true;
          signup.reset();
          signup.hidden = false;
          $('#su-email').focus();
        };
      });
    }
  }

  /* ------------------------------------------------------------------
   * 15. Boot
   * ------------------------------------------------------------------ */
  initHighlight();
  initLangTabs();
  initHero();
  initInspector();
  initLatency();
  initPricing();
  initAccordions();
  initCopy();
  initFilters();
  initStatus();
  initMaintenance();
  initToc();
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
