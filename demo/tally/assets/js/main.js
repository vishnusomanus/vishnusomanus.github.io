/* Tally — site script
 * Vanilla JavaScript, no dependencies. Sections:
 *  1. Content and settings (plans, sales tax, reminder copy, calculator rules, office hours)
 *  2. Helpers (formatting, safe storage, URL parameters, announcements)
 *  3. Header, mobile menu, scroll reveal, count-up numbers
 *  4. Hero invoice demo (home page)
 *  5. Tabs (features product tour)
 *  6. Reminder writer (features page)
 *  7. Pricing: billing switch and sales tax toggle
 *  8. Calculators: late-payment interest and time saved
 *  9. Filters and search (integrations, customers, changelog)
 * 10. Forms (validation, demo request, office hours)
 * 11. Boot
 * Back to top button (separate block at the end)
 */
document.documentElement.classList.add('js');

(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Content and settings
   * ------------------------------------------------------------------ */
  // Money is shown in US dollars, e.g. "$2,400.00".
  const LOCALE = 'en-US';
  const CURRENCY = 'USD';
  // Sample sales tax rate (Michigan's 6%), used by the hero invoice and the pricing tax toggle.
  // What is taxable depends on the state and the item: see DOCS.md.
  const VAT_RATE = 0.06;

  // Plan prices in US dollars, excluding sales tax. `annual` is the price for a whole year (ten months for twelve).
  const PLANS = {
    solo: { name: 'Solo', monthly: 12, annual: 120 },
    studio: { name: 'Studio', monthly: 30, annual: 300 },
    practice: { name: 'Practice', monthly: 60, annual: 600 }
  };
  // Billing periods accepted from pricing.html?billing=... and from saved state.
  const BILLING_PERIODS = { monthly: 'monthly', annual: 'annual' };
  const DEFAULT_BILLING = 'annual';

  // localStorage keys. Values are JSON and validated when read (see DOCS.md, "Saved data").
  const STORAGE_KEYS = {
    pricing: 'tally:pricing',         // { billing: 'monthly' | 'annual', vat: boolean }
    calculator: 'tally:calculator'    // { amount, days, rate, invoices, minutes, late, chase, hourly }
  };

  // Hero invoice demo: quantity limits and the text under the progress track for each stage.
  const INVOICE_DEMO = {
    minQty: 1,
    maxQty: 9,
    stages: ['Draft', 'Sent', 'Viewed', 'Paid'],
    viewedNote: 'Opened by Platte Outdoor Co. this morning. Reminder set for 3 days after the due date.',
    paidNote: 'Paid by card just now and matched to your bank feed. No reminder needed.'
  };

  // Due date of the sample invoice INV-0142 (hero invoice and reminder writer), as 'YYYY-MM-DD'.
  // null = a rolling demo date: the Friday 7 to 13 days from today, so the demo invoice is never overdue.
  // Set a real date (e.g. '2026-10-30') to show a fixed one.
  const INVOICE_DUE = null;

  // Reminder writer on features.html: subject and paragraphs per tone and stage.
  // {amount}, {invoice}, {client}, {due} ('Friday, October 30') and {dueDay} ('Friday') are filled in from
  // REMINDER_SAMPLE; the two dates come from INVOICE_DUE.
  const REMINDER_SAMPLE = { invoice: 'INV-0142', amount: '$5,766.40', due: 'Friday, October 30', dueDay: 'Friday', client: 'Gwen' };
  const REMINDER_TONES = {
    friendly: {
      before: { subject: 'Invoice {invoice} is due on {dueDay}', body: ['Hi {client},', 'A quick heads-up that invoice {invoice} for {amount} is due on {due}. You can pay by card or bank transfer from the link below.', 'Thanks again for the work, it was a pleasure.'] },
      due: { subject: 'Invoice {invoice} is due today', body: ['Hi {client},', 'Just a friendly reminder that invoice {invoice} for {amount} is due today. The payment link is below if that’s easier.', 'Have a lovely weekend.'] },
      late: { subject: 'Invoice {invoice} is now a week overdue', body: ['Hi {client},', 'I think invoice {invoice} for {amount} may have slipped through the cracks: it was due on {due}. Could you take a look when you get a moment?', 'If it’s already on its way, thank you and please ignore this.'] }
    },
    neutral: {
      before: { subject: 'Upcoming payment: invoice {invoice}', body: ['Hello {client},', 'This is a reminder that invoice {invoice} for {amount} is due on {due}.', 'You can pay online using the link below.'] },
      due: { subject: 'Payment due today: invoice {invoice}', body: ['Hello {client},', 'Invoice {invoice} for {amount} is due for payment today.', 'Please use the link below to pay by card or bank transfer.'] },
      late: { subject: 'Overdue: invoice {invoice}', body: ['Hello {client},', 'Our records show that invoice {invoice} for {amount}, due on {due}, has not yet been paid.', 'Please arrange payment or let us know if there is a problem with the invoice.'] }
    },
    firm: {
      before: { subject: 'Invoice {invoice}: payment due {due}', body: ['Dear {client},', 'Invoice {invoice} for {amount} is due on {due}. Please make sure payment is made by that date.', 'Payment details and a card link are below.'] },
      due: { subject: 'Invoice {invoice}: payment due today', body: ['Dear {client},', 'Payment of {amount} for invoice {invoice} is due today. Please pay using the link below.', 'Late payments may incur the late charges in our terms.'] },
      late: { subject: 'Overdue invoice {invoice}: please pay now', body: ['Dear {client},', 'Invoice {invoice} for {amount} was due on {due} and is now overdue.', 'Please pay in full within seven days. After that we may add the interest and late fee set out in our terms.'] }
    }
  };

  // Late-payment calculator. Annual rate = the rate from your terms + margin. Flat late fee by invoice amount (an example, set yours).
  const LATE_PAYMENT = {
    margin: 0,                      // percentage points added to the rate entered; 0 uses it as written
    daysInYear: 365,
    compensation: [                 // first tier whose `below` is above the amount applies
      { below: 1000, amount: 25 },
      { below: 10000, amount: 50 },
      { below: Infinity, amount: 100 }
    ]
  };
  // Time-saved estimate: how long the same work takes with Tally (medians from the fictional survey).
  const TIME_ASSUMPTIONS = { minutesPerInvoice: 4, chaseReduction: 0.8 };

  // Calculator fields: default value and allowed range. Saved and URL values outside these are ignored.
  const CALC_FIELDS = {
    amount: { def: 2400, min: 1, max: 1000000 },
    days: { def: 45, min: 1, max: 365 },
    rate: { def: 12, min: 0, max: 36 },
    invoices: { def: 12, min: 1, max: 100 },
    minutes: { def: 20, min: 5, max: 60 },
    late: { def: 30, min: 0, max: 100 },
    chase: { def: 45, min: 0, max: 180 },
    hourly: { def: 60, min: 0, max: 1000 }
  };
  // Calculator fields that are also read from and written to the URL (calculator.html?amount=5000&days=60).
  const CALC_URL_PARAMS = ['amount', 'days'];

  // Integration categories accepted from integrations.html?category=...
  const INTEGRATION_CATEGORIES = {
    banking: 'Banking',
    payments: 'Payments',
    time: 'Time and projects',
    documents: 'Documents',
    accountants: 'For accountants',
    automation: 'Automation'
  };

  // Office hours on contact.html, in Eastern time. Days: 1 = Monday ... 5 = Friday.
  const OFFICE = { timeZone: 'America/Detroit', city: 'Grand Rapids', days: [1, 2, 3, 4, 5], open: 9 * 60, close: 17 * 60 + 30 };

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key);

  // "$2,400.00"; with whole = true, whole dollar amounts drop the cents ("$10", but "$12.30").
  function money(n, whole) {
    const cents = Math.round(n * 100);
    const isWhole = cents % 100 === 0;
    const digits = whole && isWhole ? 0 : 2;
    return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, minimumFractionDigits: digits, maximumFractionDigits: digits }).format(cents / 100);
  }
  const num = (n, digits) => new Intl.NumberFormat(LOCALE, { minimumFractionDigits: digits || 0, maximumFractionDigits: digits || 0 }).format(n);
  // "1 day", "45 days".
  const plural = (n, one, many, text) => (text || String(n)) + ' ' + (n === 1 ? one : many);
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // localStorage, or an in-memory stand-in when the browser blocks it (a sandboxed iframe, strict
  // privacy settings): saved state then lasts for this page view instead of the feature doing nothing.
  const safeStorage = (function () {
    let local = null;
    try { local = window.localStorage; local.getItem('_'); } catch (e) { local = null; /* blocked */ }
    // A save that fails (storage full) stays in memory, and memory is read first, so the change isn't lost.
    const memory = Object.create(null);
    return {
      getItem: (key) => {
        if (key in memory) return memory[key];
        try { return local ? local.getItem(key) : null; } catch (e) { return null; }
      },
      setItem: (key, value) => {
        if (local) {
          try { local.setItem(key, String(value)); delete memory[key]; return; } catch (e) { /* full */ }
        }
        memory[key] = String(value);
      },
      removeItem: (key) => {
        delete memory[key];
        if (local) { try { local.removeItem(key); } catch (e) { /* blocked */ } }
      }
    };
  })();
  const store = {
    get(key) { try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; } },
    set(key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* quota or private mode */ } },
    remove(key) { try { safeStorage.removeItem(key); } catch (e) { /* private mode */ } }
  };

  function params() {
    try { return new URLSearchParams(window.location.search); } catch (e) { return new URLSearchParams(); }
  }
  function setParams(values) {
    try {
      const url = new URL(window.location.href);
      Object.keys(values).forEach((k) => {
        if (values[k] === null || values[k] === '') url.searchParams.delete(k); else url.searchParams.set(k, values[k]);
      });
      history.replaceState(null, '', url);
    } catch (e) { /* some browsers block this on file:// pages */ }
  }

  // The sample invoice's due date (see INVOICE_DUE): a fixed date, or the Friday 7 to 13 days from today.
  // Shown in the hero invoice (time[data-invoice-due]) and the reminder writer ({due}, {dueDay}).
  function invoiceDue() {
    let d = null;
    if (typeof INVOICE_DUE === 'string' && /^\d{4}-\d\d-\d\d$/.test(INVOICE_DUE)) d = new Date(INVOICE_DUE + 'T12:00:00');
    if (!d || isNaN(d)) {
      d = new Date();
      d.setHours(12, 0, 0, 0);
      d.setDate(d.getDate() + ((5 - d.getDay() + 7) % 7) + 7);
    }
    return d;
  }
  function initDueDates() {
    const due = invoiceDue();
    const iso = due.getFullYear() + '-' + String(due.getMonth() + 1).padStart(2, '0') + '-' + String(due.getDate()).padStart(2, '0');
    const fmt = (opts) => due.toLocaleDateString(LOCALE, opts);
    REMINDER_SAMPLE.dueDay = fmt({ weekday: 'long' });
    REMINDER_SAMPLE.due = REMINDER_SAMPLE.dueDay + ', ' + fmt({ day: 'numeric', month: 'long' });
    $$('time[data-invoice-due]').forEach((el) => {
      el.setAttribute('datetime', iso);
      el.textContent = fmt({ day: 'numeric', month: 'short', year: 'numeric' });
    });
  }

  // One polite live region for short announcements.
  const announcer = document.createElement('p');
  announcer.className = 'sr-only';
  announcer.setAttribute('aria-live', 'polite');
  document.body.appendChild(announcer);
  function announce(msg) {
    announcer.textContent = '';
    window.setTimeout(() => { announcer.textContent = msg; }, 50);
  }

  const CHECK_SVG = '<svg viewBox="0 0 20 20" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3.2L15 7"/></svg>';

  /* ------------------------------------------------------------------
   * 3. Header, mobile menu, scroll reveal, count-up numbers
   * ------------------------------------------------------------------ */
  const header = $('#site-header');
  const menuBtn = $('#menu-toggle');
  const menu = $('#mobile-menu');
  function setMenu(open) {
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.hidden = !open;
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
  function reveal() {
    $$('.reveal:not(.is-visible)').forEach((el) => {
      if (revealObserver) revealObserver.observe(el); else el.classList.add('is-visible');
    });
  }

  $$('[data-year]').forEach((el) => { el.textContent = new Date().getFullYear(); });

  // Numbers with data-count count up once when they scroll into view.
  function initCountUp() {
    const els = $$('[data-count]');
    if (!els.length || reduceMotion || !('IntersectionObserver' in window)) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        const el = en.target;
        const end = +el.getAttribute('data-count');
        const start = performance.now();
        const step = (t) => {
          const p = Math.min(1, (t - start) / 1200);
          el.textContent = num(Math.round(end * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------
   * 4. Hero invoice demo: change quantities, then simulate the payment.
   * ------------------------------------------------------------------ */
  function initInvoiceDemo() {
    const root = $('#invoice-demo');
    if (!root) return;
    const lines = $$('[data-line]', root);
    const chip = $('[data-status-chip]', root);
    const chipText = $('[data-status-text]', root);
    const note = $('[data-stage-note]', root);
    const payBtn = $('[data-pay-button]', root);
    const paidCard = $('[data-paid-toast]');
    let stage = 2; // 0 Draft, 1 Sent, 2 Viewed, 3 Paid
    let total = 0;

    function recalc(flash) {
      let subtotal = 0;
      lines.forEach((line) => {
        const qty = +$('[data-qty]', line).textContent;
        const amount = qty * +line.getAttribute('data-price');
        subtotal += amount;
        $('[data-line-total]', line).textContent = money(amount);
        $('[data-qty-dec]', line).disabled = stage === 3 || qty <= INVOICE_DEMO.minQty;
        $('[data-qty-inc]', line).disabled = stage === 3 || qty >= INVOICE_DEMO.maxQty;
      });
      const vat = Math.round(subtotal * VAT_RATE * 100) / 100;
      total = subtotal + vat;
      $('[data-subtotal]', root).textContent = money(subtotal);
      $('[data-vat]', root).textContent = money(vat);
      const totalEl = $('[data-total]', root);
      totalEl.textContent = money(total);
      if (paidCard) $('[data-paid-amount]', paidCard).textContent = money(total);
      if (flash && !reduceMotion) {
        totalEl.classList.remove('flash');
        void totalEl.offsetWidth;
        totalEl.classList.add('flash');
      }
    }

    function setStage(n) {
      stage = n;
      root.setAttribute('data-stage', String(n));
      $$('[data-stage-step]', root).forEach((el) => {
        const i = +el.getAttribute('data-stage-step');
        el.setAttribute('data-state', i < n ? 'done' : i === n ? (n === 3 ? 'done' : 'current') : 'upcoming');
        if (i === n) el.setAttribute('aria-current', 'step'); else el.removeAttribute('aria-current');
      });
      $$('[data-stage-line]', root).forEach((el) => {
        if (+el.getAttribute('data-stage-line') <= n) el.setAttribute('data-state', 'done'); else el.removeAttribute('data-state');
      });
      const paid = n === 3;
      chip.classList.toggle('chip-paid', paid);
      chip.classList.toggle('chip-sent', !paid);
      chipText.textContent = INVOICE_DEMO.stages[n];
      note.textContent = paid ? INVOICE_DEMO.paidNote : INVOICE_DEMO.viewedNote;
      payBtn.textContent = paid ? 'Reset demo' : 'Simulate payment';
      if (paidCard) {
        paidCard.hidden = !paid;
        if (paid) { paidCard.classList.remove('slide-in'); void paidCard.offsetWidth; paidCard.classList.add('slide-in'); }
      }
      recalc(false);
    }

    lines.forEach((line) => {
      const out = $('[data-qty]', line);
      const name = $('[data-line-name]', line).textContent;
      const change = (d) => {
        const q = Math.min(INVOICE_DEMO.maxQty, Math.max(INVOICE_DEMO.minQty, +out.textContent + d));
        out.textContent = String(q);
        recalc(true);
        announce(name + ': ' + q + '. Total due ' + money(total) + '.');
      };
      $('[data-qty-dec]', line).addEventListener('click', () => change(-1));
      $('[data-qty-inc]', line).addEventListener('click', () => change(1));
    });
    payBtn.addEventListener('click', () => {
      if (stage === 3) { setStage(2); announce('Demo reset. Invoice INV-0142 is viewed and waiting for payment.'); }
      else { setStage(3); announce('Payment of ' + money(total) + ' received. Invoice INV-0142 is paid.'); }
    });
    setStage(2);
  }

  /* ------------------------------------------------------------------
   * 5. Tabs (features page). Arrow keys, Home and End move between tabs.
   * ------------------------------------------------------------------ */
  function initTabs() {
    $$('[data-tabs]').forEach((root) => {
      const tabs = $$('[role="tab"]', root);
      const panels = tabs.map((t) => document.getElementById(t.getAttribute('aria-controls')));
      function select(i, focus) {
        tabs.forEach((t, j) => {
          const on = i === j;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          panels[j].hidden = !on;
        });
        if (focus) tabs[i].focus();
      }
      tabs.forEach((t, i) => {
        t.addEventListener('click', () => { select(i); setHash(panels[i].id); });
        t.addEventListener('keydown', (e) => {
          const keys = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 };
          if (!hasOwn(keys, e.key)) return;
          e.preventDefault();
          const n = (keys[e.key] + tabs.length) % tabs.length;
          select(n, true);
          setHash(panels[n].id);
        });
      });
      function setHash(id) {
        try { history.replaceState(null, '', '#' + id); } catch (e) { /* file:// */ }
      }
      // features.html#expenses opens that tab. Only ids of this tablist's panels are accepted.
      function fromHash(scroll) {
        const id = decodeURIComponent((window.location.hash || '').slice(1));
        const i = panels.findIndex((p) => p.id === id);
        if (i < 0) return false;
        select(i);
        if (scroll) root.scrollIntoView({ block: 'start' });
        return true;
      }
      if (!fromHash(true)) select(0);
      window.addEventListener('hashchange', () => fromHash(true));
      $$('[data-tab-link]').forEach((a) => {
        a.addEventListener('click', (e) => {
          const i = panels.findIndex((p) => p.id === a.getAttribute('data-tab-link'));
          if (i < 0) return;
          e.preventDefault();
          select(i);
          setHash(panels[i].id);
          root.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
          tabs[i].focus({ preventScroll: true });
        });
      });
    });
  }

  /* ------------------------------------------------------------------
   * 6. Reminder writer (features page)
   * ------------------------------------------------------------------ */
  function initReminders() {
    const subject = $('[data-reminder-subject]');
    const body = $('[data-reminder-body]');
    if (!subject || !body) return;
    const toneBtns = $$('[data-tone]');
    let tone = 'friendly';
    const fill = (s) => s.replace(/\{(\w+)\}/g, (m, k) => (hasOwn(REMINDER_SAMPLE, k) ? REMINDER_SAMPLE[k] : m));
    function render() {
      const checked = $('input[name="reminder-stage"]:checked');
      const stage = checked && hasOwn(REMINDER_TONES[tone], checked.value) ? checked.value : 'before';
      const msg = REMINDER_TONES[tone][stage];
      subject.textContent = fill(msg.subject);
      body.innerHTML = msg.body.map((p) => '<p>' + escapeHtml(fill(p)) + '</p>').join('');
      toneBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-tone') === tone)));
    }
    toneBtns.forEach((b) => b.addEventListener('click', () => {
      const t = b.getAttribute('data-tone');
      if (hasOwn(REMINDER_TONES, t)) { tone = t; render(); }
    }));
    $$('input[name="reminder-stage"]').forEach((r) => r.addEventListener('change', render));
    render();
  }

  /* ------------------------------------------------------------------
   * 7. Pricing: billing switch and sales tax toggle. Remembered in STORAGE_KEYS.pricing;
   *    pricing.html?billing=monthly|annual overrides the saved choice.
   * ------------------------------------------------------------------ */
  function initPricing() {
    const cards = $$('[data-plan]');
    const billingBtns = $$('[data-billing]');
    if (!cards.length || !billingBtns.length) return;
    const vatToggle = $('[data-vat-toggle]');
    const vatNote = $('[data-vat-note]');
    const status = $('[data-pricing-status]');
    const saved = store.get(STORAGE_KEYS.pricing);
    const state = { billing: DEFAULT_BILLING, vat: false };
    if (saved && typeof saved === 'object') {
      if (typeof saved.billing === 'string' && hasOwn(BILLING_PERIODS, saved.billing)) state.billing = saved.billing;
      if (typeof saved.vat === 'boolean') state.vat = saved.vat;
    }
    const fromUrl = (params().get('billing') || '').toLowerCase();
    if (hasOwn(BILLING_PERIODS, fromUrl)) state.billing = fromUrl;

    function render(announceIt) {
      const factor = state.vat ? 1 + VAT_RATE : 1;
      const vatWords = state.vat ? 'incl. sales tax' : 'excl. sales tax';
      cards.forEach((card) => {
        const key = card.getAttribute('data-plan');
        if (!hasOwn(PLANS, key)) return;
        const plan = PLANS[key];
        const annual = state.billing === 'annual';
        const perMonth = (annual ? plan.annual / 12 : plan.monthly) * factor;
        const saving = (plan.monthly * 12 - plan.annual) * factor;
        $('[data-price]', card).textContent = money(perMonth, true);
        $('[data-billed]', card).textContent = annual
          ? 'Billed ' + money(plan.annual * factor, true) + ' yearly, ' + vatWords
          : 'Billed monthly, ' + vatWords;
        $('[data-saving]', card).textContent = annual
          ? 'Save ' + money(saving, true) + ' a year'
          : 'Annual billing saves ' + money(saving, true);
      });
      billingBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-billing') === state.billing)));
      if (vatToggle) vatToggle.checked = state.vat;
      if (vatNote) {
        vatNote.textContent = state.vat
          ? 'Prices include a sample 6% sales tax. Whether tax applies depends on your state, and the exact amount is shown before you pay.'
          : 'Prices exclude sales tax. Whether tax applies depends on your state, and any tax is shown before you pay.';
      }
      if (announceIt && status) {
        status.textContent = 'Showing ' + state.billing + ' prices, ' + (state.vat ? 'including' : 'excluding') + ' sales tax.';
      }
    }
    function save() { store.set(STORAGE_KEYS.pricing, { billing: state.billing, vat: state.vat }); }

    billingBtns.forEach((b) => b.addEventListener('click', () => {
      const v = b.getAttribute('data-billing');
      if (!hasOwn(BILLING_PERIODS, v)) return;
      state.billing = v;
      save();
      setParams({ billing: v });
      render(true);
    }));
    if (vatToggle) vatToggle.addEventListener('change', () => { state.vat = vatToggle.checked; save(); render(true); });
    render(false);
  }

  /* ------------------------------------------------------------------
   * 8. Calculators (calculator.html). Inputs are remembered in STORAGE_KEYS.calculator;
   *    ?amount= and ?days= in the URL override the saved values.
   * ------------------------------------------------------------------ */
  // A number within CALC_FIELDS[name]'s range, or null.
  function validNumber(name, value) {
    if (!hasOwn(CALC_FIELDS, name)) return null;
    const n = typeof value === 'number' ? value : parseFloat(String(value).replace(/,/g, ''));
    if (!isFinite(n)) return null;
    const f = CALC_FIELDS[name];
    return n >= f.min && n <= f.max ? n : null;
  }
  function compensationFor(amount) {
    return LATE_PAYMENT.compensation.find((t) => amount < t.below).amount;
  }
  // Exposed for the docs and ports: the charges for an amount, days late and annual rate.
  function lateClaim(amount, days, rate) {
    const statutory = rate + LATE_PAYMENT.margin;
    const daily = amount * statutory / 100 / LATE_PAYMENT.daysInYear;
    const interest = Math.round(daily * days * 100) / 100;
    const comp = compensationFor(amount);
    return { statutory, daily, interest, comp, total: interest + comp };
  }

  function initCalculators() {
    const lateForm = $('[data-late-form]');
    const timeForm = $('[data-time-form]');
    if (!lateForm && !timeForm) return;
    const inputs = {};
    Object.keys(CALC_FIELDS).forEach((k) => { inputs[k] = $('[name="' + k + '"]', document.body); });
    const values = {};
    Object.keys(CALC_FIELDS).forEach((k) => { values[k] = CALC_FIELDS[k].def; });

    // Saved values first, then the URL.
    const saved = store.get(STORAGE_KEYS.calculator);
    if (saved && typeof saved === 'object') {
      Object.keys(CALC_FIELDS).forEach((k) => {
        if (!hasOwn(saved, k)) return;
        const v = validNumber(k, saved[k]);
        if (v !== null) values[k] = v;
      });
    }
    const p = params();
    CALC_URL_PARAMS.forEach((k) => {
      if (!p.has(k)) return;
      const v = validNumber(k, p.get(k));
      if (v !== null) values[k] = k === 'days' ? Math.round(v) : v;
    });
    Object.keys(values).forEach((k) => { if (inputs[k]) inputs[k].value = String(values[k]); });

    function setFill(input) {
      if (input.type !== 'range') return;
      const pct = (input.value - input.min) / (input.max - input.min) * 100;
      input.style.setProperty('--fill', pct + '%');
    }
    function setError(name, bad) {
      const input = inputs[name];
      if (!input || input.type === 'range') return;
      input.setAttribute('aria-invalid', String(bad));
      const hint = document.getElementById(input.getAttribute('aria-describedby'));
      if (hint) hint.classList.toggle('text-rose-ink', bad);
    }
    function read(name) {
      const input = inputs[name];
      if (!input) return values[name];
      const v = validNumber(name, input.value);
      setError(name, v === null);
      if (v !== null) values[name] = v;
      return v;
    }
    function save() {
      store.set(STORAGE_KEYS.calculator, Object.assign({}, values));
    }

    // Late-payment chart: the flat late fee as a band, interest growing on top, a marker at today.
    function drawChart(amount, days, rate) {
      const svg = $('[data-late-chart]');
      if (!svg) return;
      const maxDays = Math.max(90, Math.ceil(days / 30) * 30);
      const end = lateClaim(amount, maxDays, rate);
      const now = lateClaim(amount, days, rate);
      const W = 600, H = 200, L = 8, R = 8, T = 22, B = 26;
      const x = (d) => L + (W - L - R) * d / maxDays;
      const y = (v) => T + (H - T - B) * (1 - v / end.total);
      const comp = end.comp;
      const parts = [];
      [0.5, 1].forEach((f) => parts.push('<path d="M' + L + ' ' + y(end.total * f).toFixed(1) + 'H' + (W - R) + '" stroke="#ffffff" stroke-opacity=".1"/>'));
      parts.push('<path d="M' + L + ' ' + y(0) + 'H' + (W - R) + '" stroke="#ffffff" stroke-opacity=".3"/>');
      parts.push('<path d="M' + x(0) + ' ' + y(0) + 'V' + y(comp).toFixed(1) + 'H' + x(maxDays) + 'V' + y(0) + 'Z" fill="#a9bab3" fill-opacity=".25"/>');
      parts.push('<path d="M' + x(0) + ' ' + y(comp).toFixed(1) + 'L' + x(maxDays) + ' ' + y(end.total).toFixed(1) + 'V' + y(comp).toFixed(1) + 'Z" fill="#45d99b" fill-opacity=".35"/>');
      parts.push('<path d="M' + x(0) + ' ' + y(comp).toFixed(1) + 'L' + x(maxDays) + ' ' + y(end.total).toFixed(1) + '" stroke="#45d99b" stroke-width="2.5" fill="none"/>');
      const mx = x(days), my = y(now.total);
      parts.push('<path d="M' + mx.toFixed(1) + ' ' + y(0) + 'V' + my.toFixed(1) + '" stroke="#ffffff" stroke-dasharray="3 4" stroke-opacity=".6"/>');
      parts.push('<circle cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="6" fill="#0d1f1b" stroke="#45d99b" stroke-width="3"/>');
      // The line rises to the right, so the label sits to the left of the marker where there is room.
      const anchor = mx > 220 ? 'end' : 'start';
      const tx = anchor === 'end' ? mx - 12 : mx + 12;
      const ty = anchor === 'end' ? my - 12 : my - 26;
      parts.push('<text x="' + tx.toFixed(1) + '" y="' + Math.max(14, ty).toFixed(1) + '" fill="#ffffff" font-size="13" font-weight="600" text-anchor="' + anchor + '">' + escapeHtml(money(now.total)) + ' at ' + plural(days, 'day', 'days') + '</text>');
      parts.push('<g fill="#a9bab3" font-size="11" font-family="Azeret Mono, monospace"><text x="' + L + '" y="' + (H - 6) + '">Due date</text><text x="' + (W - R) + '" y="' + (H - 6) + '" text-anchor="end">Day ' + maxDays + '</text></g>');
      $$(':scope > :not(desc)', svg).forEach((n) => n.remove());
      svg.insertAdjacentHTML('beforeend', parts.join(''));
      const cap = $('[data-chart-caption]');
      if (cap) cap.textContent = 'Interest plus late fee over the first ' + maxDays + ' days';
      const desc = $('[data-chart-desc]');
      if (desc) desc.textContent = 'Your charges grow from ' + money(comp) + ' on the due date to ' + money(end.total) + ' by day ' + maxDays + '. At ' + plural(days, 'day', 'days') + ' they are ' + money(now.total) + '.';
    }

    function renderLate() {
      if (!lateForm) return;
      const amount = read('amount');
      const days = Math.round(read('days'));
      const rate = read('rate');
      setFill(inputs.days);
      $('[data-days-out]').textContent = plural(days, 'day', 'days');
      if (amount === null || rate === null) return;
      const c = lateClaim(amount, days, rate);
      $('[data-out-total]').textContent = money(c.total);
      $('[data-out-rate]').textContent = num(c.statutory, 2) + '%';
      $('[data-out-interest]').textContent = money(c.interest);
      $('[data-out-daily]').textContent = money(c.daily);
      $('[data-out-comp]').textContent = money(c.comp, true);
      drawChart(amount, days, rate);
    }

    function hours(min) { return Math.round(min / 6) / 10; } // minutes to hours, one decimal
    function hoursText(h) { return plural(h, 'hour', 'hours', num(h, h % 1 ? 1 : 0)); }
    function renderTime() {
      if (!timeForm) return;
      ['invoices', 'minutes', 'late', 'chase'].forEach((k) => { read(k); setFill(inputs[k]); });
      const hourly = read('hourly');
      const v = values;
      $('[data-out-invoices]').textContent = String(v.invoices);
      $('[data-out-minutes]').textContent = v.minutes + ' min';
      $('[data-out-late]').textContent = v.late + '%';
      $('[data-out-chase]').textContent = v.chase + ' min';
      const lateCount = v.invoices * v.late / 100;
      const now = v.invoices * v.minutes + lateCount * v.chase;
      const withTally = v.invoices * TIME_ASSUMPTIONS.minutesPerInvoice + lateCount * v.chase * (1 - TIME_ASSUMPTIONS.chaseReduction);
      const savedMin = Math.max(0, now - withTally);
      $('[data-out-saved]').textContent = hoursText(hours(savedMin));
      $('[data-out-now]').textContent = hoursText(hours(now));
      $('[data-out-with]').textContent = hoursText(hours(withTally));
      $('[data-bar-now]').style.width = '100%';
      $('[data-bar-with]').style.width = (now > 0 ? Math.min(100, withTally / now * 100) : 0).toFixed(1) + '%';
      if (hourly !== null) $('[data-out-value]').textContent = money(Math.round(savedMin / 60 * hourly), true);
    }

    Object.keys(inputs).forEach((k) => {
      const input = inputs[k];
      if (!input) return;
      input.addEventListener('input', () => {
        if (k === 'amount' || k === 'days' || k === 'rate') renderLate(); else renderTime();
        save();
      });
      // Shareable link: amount and days go into the URL when they change.
      if (CALC_URL_PARAMS.indexOf(k) !== -1) {
        input.addEventListener('change', () => {
          const v = validNumber(k, input.value);
          if (v !== null) setParams({ [k]: String(k === 'days' ? Math.round(v) : v) });
        });
      }
    });
    lateForm && lateForm.addEventListener('submit', (e) => e.preventDefault());
    timeForm && timeForm.addEventListener('submit', (e) => e.preventDefault());
    const reset = $('[data-calc-reset]');
    if (reset) reset.addEventListener('click', () => {
      Object.keys(CALC_FIELDS).forEach((k) => { values[k] = CALC_FIELDS[k].def; if (inputs[k]) inputs[k].value = String(values[k]); });
      store.remove(STORAGE_KEYS.calculator);
      setParams({ amount: null, days: null });
      renderLate();
      renderTime();
      announce('Calculator reset to the example values.');
    });
    renderLate();
    renderTime();
  }

  /* ------------------------------------------------------------------
   * 9. Filters and search. A [data-directory] holds pills ([data-filter]), items
   *    ([data-integration][data-category]), an optional search box, a count and an empty state.
   *    integrations.html reads and writes ?category=.
   * ------------------------------------------------------------------ */
  function initFilters() {
    $$('[data-directory]').forEach((root) => {
      const pills = $$('[data-filter]', root);
      const items = $$('[data-integration]', root);
      const search = $('[data-search]', root);
      const count = $('[data-result-count]', root);
      const empty = $('[data-empty]', root);
      const results = $('[data-results]', root);
      const noun = (count && count.getAttribute('data-noun')) || 'integration';
      const nouns = (count && count.getAttribute('data-nouns')) || 'integrations';
      const urlParam = root.getAttribute('data-url-param');
      let filter = 'all';

      if (urlParam) {
        const fromUrl = (params().get(urlParam) || '').toLowerCase();
        if (hasOwn(INTEGRATION_CATEGORIES, fromUrl)) filter = fromUrl;
      }

      function apply(user) {
        const q = search ? search.value.trim().toLowerCase() : '';
        let shown = 0;
        items.forEach((it) => {
          const okCat = filter === 'all' || it.getAttribute('data-category') === filter;
          const okText = !q || it.textContent.toLowerCase().indexOf(q) !== -1;
          it.hidden = !(okCat && okText);
          if (!it.hidden) shown++;
        });
        pills.forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === filter)));
        if (count) count.textContent = plural(shown, noun, nouns);
        if (empty) empty.classList.toggle('hidden', shown > 0);
        if (results) results.classList.toggle('hidden', shown === 0);
        if (user && urlParam) setParams({ [urlParam]: filter === 'all' ? null : filter });
      }
      pills.forEach((b) => b.addEventListener('click', () => { filter = b.getAttribute('data-filter'); apply(true); }));
      if (search) search.addEventListener('input', () => apply(false));
      $$('[data-clear-filters]', root).forEach((b) => b.addEventListener('click', () => {
        filter = 'all';
        if (search) search.value = '';
        apply(true);
        if (pills[0]) pills[0].focus();
      }));
      apply(false);
    });
  }

  /* ------------------------------------------------------------------
   * 10. Forms
   * ------------------------------------------------------------------ */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function fieldMessage(field) {
    if (field.type === 'checkbox') return field.checked ? '' : 'Please check this box so we can reply.';
    const v = field.value.trim();
    const label = field.getAttribute('data-label') || 'This field';
    if (field.required && !v) return label + ' is required.';
    if (v && field.type === 'email' && !EMAIL_RE.test(v)) return 'Enter an email address like name@studio.example.';
    return '';
  }
  // Show or clear an inline error under a field (or a fieldset for radio groups).
  function setFieldError(target, msg) {
    const id = (target.id || target.getAttribute('data-error-id')) + '-error';
    let el = document.getElementById(id);
    const describedBy = (target.getAttribute('aria-describedby') || '').split(/\s+/).filter((x) => x && x !== id);
    if (msg) {
      if (!el) {
        el = document.createElement('p');
        el.id = id;
        el.className = 'field-error';
        const anchor = target.tagName === 'FIELDSET' ? target.lastElementChild : (target.closest('.input-affix') || (target.type === 'checkbox' ? target.closest('label') : target));
        anchor.insertAdjacentElement('afterend', el);
      }
      el.textContent = msg;
      describedBy.push(id);
      target.setAttribute('aria-invalid', 'true');
    } else {
      if (el) el.remove();
      target.removeAttribute('aria-invalid');
    }
    if (describedBy.length) target.setAttribute('aria-describedby', describedBy.join(' ')); else target.removeAttribute('aria-describedby');
  }
  function groupMessage(group) {
    return $('input:checked', group) ? '' : 'Please choose ' + (group.getAttribute('data-label') || 'an option').toLowerCase() + '.';
  }
  function validate(form) {
    let first = null;
    $$('input[required], textarea[required], select[required]', form).forEach((f) => {
      const msg = fieldMessage(f);
      setFieldError(f, msg);
      if (msg && !first) first = f;
    });
    $$('[data-required-group]', form).forEach((g) => {
      const msg = groupMessage(g);
      setFieldError(g, msg);
      if (msg && !first) first = $('input', g);
    });
    if (first) first.focus();
    return !first;
  }
  // After the first submit, re-check fields as the visitor fixes them.
  function liveValidation(form) {
    form.addEventListener('input', (e) => {
      if (!form.hasAttribute('data-tried')) return;
      const f = e.target;
      if (f.matches('[required]')) setFieldError(f, fieldMessage(f));
    });
    form.addEventListener('change', (e) => {
      if (!form.hasAttribute('data-tried')) return;
      const g = e.target.closest('[data-required-group]');
      if (g) setFieldError(g, groupMessage(g));
      else if (e.target.matches('[required]')) setFieldError(e.target, fieldMessage(e.target));
    });
  }
  function onValidSubmit(form, done) {
    liveValidation(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      form.setAttribute('data-tried', '');
      if (validate(form)) done();
    });
  }
  // A short reference for a confirmation, like TA-7K2Q (no 0/O or 1/I to misread).
  function makeRef(prefix) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  // Replace a form with a success message and move focus to it.
  function successSwap(form, html) {
    const box = document.createElement('div');
    box.className = form.className;
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.innerHTML = html;
    form.replaceWith(box);
    box.focus({ preventScroll: false });
    return box;
  }

  function initForms() {
    // To connect a form: replace the successSwap(...) calls below with a fetch() to your form service, e.g.
    // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    //   .then((r) => { if (r.ok) successSwap(form, '...'); else showError(); });
    $$('[data-form="newsletter"]').forEach((form) => onValidSubmit(form, () => {
      successSwap(form, '<p class="font-semibold text-white">You’re on the list.</p>' +
        '<p class="mt-1 text-sm text-fog">Look out for a confirmation email from us; once you click the link, getting-paid notes arrive once a month.</p>');
    }));

    $$('[data-form="demo"]').forEach((form) => {
      // contact.html?plan=studio preselects the plan. Only keys of PLANS are accepted.
      const plan = (params().get('plan') || '').toLowerCase();
      const select = $('#d-plan', form);
      if (select && hasOwn(PLANS, plan)) select.value = plan;

      // Character counter for the message.
      const msg = $('#d-message', form);
      const counter = $('[data-char-count]', form);
      const hint = $('[data-char-hint]', form);
      if (msg && counter) {
        const max = +msg.getAttribute('maxlength');
        const update = () => {
          const n = msg.value.length;
          counter.textContent = n + ' / ' + max;
          const left = max - n;
          if (hint) hint.textContent = left <= 50 ? plural(left, 'character', 'characters') + ' left.' : 'Optional, up to ' + max + ' characters.';
        };
        msg.addEventListener('input', update);
        update();
      }

      onValidSubmit(form, () => {
        const data = new FormData(form);
        const first = String(data.get('name') || '').trim().split(/\s+/)[0];
        const planKey = String(data.get('plan') || '');
        const topics = data.getAll('topics').length;
        const planText = hasOwn(PLANS, planKey) ? ' about the ' + PLANS[planKey].name + ' plan' : '';
        successSwap(form, '<div class="flex items-start gap-4"><span class="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-mint-400 text-ink">' + CHECK_SVG + '</span><div>' +
          '<h2 class="text-2xl font-semibold tracking-[-0.02em]">Thanks, ' + escapeHtml(first) + '. Your demo request is in.</h2>' +
          '<p class="mt-2 text-ink-soft">Noelle in Grand Rapids will email you a few times for a call' + escapeHtml(planText) + (topics ? ' covering the ' + plural(topics, 'topic', 'topics') + ' you picked' : '') + ', within two business hours if we’re in the office or first thing the next business day if not. Your reference is <span class="font-semibold text-ink">' + makeRef('TA') + '</span>.</p>' +
          '<p class="mt-4"><a href="calculator.html" class="link">Try the late-payment calculator while you wait</a></p></div></div>');
      });
    });
  }

  // Office hours on contact.html, worked out in Eastern time whatever the visitor's own time zone.
  function officeState(date) {
    const parts = {};
    new Intl.DateTimeFormat('en-US', { timeZone: OFFICE.timeZone, weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
      .formatToParts(date).forEach((p) => { parts[p.type] = p.value; });
    const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
    const minutes = +parts.hour * 60 + +parts.minute;
    const workday = OFFICE.days.indexOf(day) !== -1;
    const open = workday && minutes >= OFFICE.open && minutes < OFFICE.close;
    let next = '';
    if (!open) {
      if (workday && minutes < OFFICE.open) next = 'after 9 a.m. this morning';
      else if (day >= 1 && day <= 4) next = 'after 9 a.m. tomorrow';
      else next = 'after 9 a.m. on Monday';
    }
    const hour = +parts.hour;
    return { open, time: (hour % 12 || 12) + ':' + parts.minute + (hour < 12 ? ' a.m.' : ' p.m.'), next };
  }
  function initOfficeHours() {
    const text = $('[data-office-text]');
    if (!text) return;
    const dot = $('[data-office-dot]');
    const render = () => {
      const s = officeState(new Date());
      text.textContent = s.open
        ? 'It’s ' + s.time + ' in ' + OFFICE.city + ' and we’re in the office. Expect a reply within two business hours.'
        : 'It’s ' + s.time + ' in ' + OFFICE.city + ', outside office hours (Monday to Friday, 9 a.m. to 5:30 p.m.). We’ll reply ' + s.next + '.';
      if (dot) { dot.classList.toggle('bg-mint-500', s.open); dot.classList.toggle('bg-line-strong', !s.open); }
    };
    render();
    window.setInterval(render, 60000);
  }

  /* ------------------------------------------------------------------
   * 11. Boot
   * ------------------------------------------------------------------ */
  initDueDates();
  initInvoiceDemo();
  initTabs();
  initReminders();
  initPricing();
  initCalculators();
  initFilters();
  initForms();
  initOfficeHours();
  initCountUp();
  reveal();
})();

/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It lifts itself above toasts so they never overlap, and
   steps aside while an in-page "Back to top" link (e.g. in a footer) is on screen.
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
