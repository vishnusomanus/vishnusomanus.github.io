/* Orbit — site script
 * Vanilla JavaScript, no dependencies. Sections:
 *  1. Content and settings (schedule demo rules, prices, sales routing)
 *  2. Helpers
 *  3. Header, mobile menu, scroll reveal, count-up numbers
 *  4. Schedule demo (home page hero)
 *  5. Tabs (product tour)
 *  6. Pricing: billing switch and price calculator
 *  7. Accordion (FAQ)
 *  8. Filters and search (integrations, customers, changelog)
 *  9. Integration drawer
 * 10. Forms (validation, contact routing, sign-up steps)
 * 11. Boot
 * Back to top button (separate block at the end)
 */
document.documentElement.classList.add('js');

(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Content and settings
   * ------------------------------------------------------------------ */
  // Hero schedule demo. Index 0 is Monday. `needs` is how many people each shift needs per day.
  const DEMO = {
    shiftHours: 8,
    maxHours: 40,           // more than this shows an overtime warning; auto-fill never goes over it
    needs: { am: [2, 2, 2, 2, 2, 2, 2], pm: [1, 1, 1, 1, 2, 2, 1] },
    days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    short: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    labels: { am: 'AM', pm: 'PM', off: 'Off', '': '' },
    times: { am: '7–3', pm: '2–10', off: 'PTO', '': '' },
    spoken: { am: 'morning shift, 7 am to 3 pm', pm: 'evening shift, 2 pm to 10 pm', off: 'approved time off', '': 'no shift' }
  };

  // Paid plan prices in US dollars per month: a fee per location plus a fee per employee.
  const PRICING = {
    team: { name: 'Team', location: { monthly: 29, annual: 23 }, employee: { monthly: 3, annual: 2.4 } },
    business: { name: 'Business', location: { monthly: 59, annual: 47 }, employee: { monthly: 5, annual: 4 } },
    freeLocations: 1,       // Starter is free up to these limits
    freeEmployees: 15,
    enterpriseEmployees: 500
  };

  // Sales routing on contact.html, keyed by the team-size radio values.
  const CONTACT_ROUTES = {
    small: { avatar: 'fergus', name: 'Fergus, Customer success', role: 'Sets up small teams every day', text: 'Teams your size are usually up and running the same day. Fergus will send a short walkthrough and help you import your current schedule.', time: 'Replies within 4 business hours', trial: true },
    mid: { avatar: 'amara', name: 'Amara, Sales', role: 'Twelve years running hotel and restaurant floors', text: 'A 20-minute demo built around a schedule like yours, and help moving your team over from spreadsheets.', time: 'Replies within 1 business day', trial: false },
    large: { avatar: 'amara', name: 'Amara, Sales', role: 'Multi-site rollouts across hospitality', text: 'A demo with your locations already set up, an integration check for your POS and payroll, and a rollout plan.', time: 'Replies within 1 business day', trial: false },
    enterprise: { avatar: 'siobhan', name: 'Siobhan, Co-founder', role: 'Joins every enterprise call', text: 'Volume pricing, single sign-on, a security review pack and a named success manager. We’ll bring an engineer to the first call.', time: 'Replies within 2 business hours', trial: false }
  };

  // Plan names shown on signup.html?plan=...
  const PLAN_LABELS = { starter: 'Starter, free forever', team: 'Team trial', business: 'Business trial' };
  const TRIAL_DAYS = 14;

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const num = new Intl.NumberFormat('en-US');
  function money(n) {
    const whole = Math.abs(n - Math.round(n)) < 0.005;
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 });
  }
  // A short reference for confirmations, like OR-7K2Q (no 0/O or 1/I to misread).
  function makeRef() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let ref = 'OR-';
    for (let i = 0; i < 4; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
    return ref;
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
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
  const CHECK_SVG = '<svg viewBox="0 0 20 20" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3.2L15 7"/></svg>';

  // One polite live region for short announcements.
  const announcer = document.createElement('p');
  announcer.className = 'sr-only';
  announcer.setAttribute('aria-live', 'polite');
  document.body.appendChild(announcer);
  function announce(msg) {
    announcer.textContent = '';
    window.setTimeout(() => { announcer.textContent = msg; }, 50);
  }

  // Toast: a short visual confirmation (also announced, it has role="status").
  let toastEl = null;
  let toastTimer = 0;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('data-toast', '');
      document.body.appendChild(toastEl);
    }
    toastEl.innerHTML = '<span class="grid h-6 w-6 place-items-center rounded-full bg-mint text-mint-ink">' + CHECK_SVG + '</span><span></span>';
    toastEl.lastChild.textContent = msg;
    toastEl.classList.add('is-shown');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toastEl.classList.remove('is-shown'), 3600);
  }

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
          el.textContent = num.format(Math.round(end * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    els.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------
   * 4. Schedule demo — click, keyboard or drag shifts; coverage updates live.
   * ------------------------------------------------------------------ */
  function initScheduleDemo() {
    const root = $('#schedule-demo');
    if (!root) return;
    const rows = $$('tr[data-person]', root);
    const grid = rows.map((r) => $$('.sched-cell', r));      // grid[person][day]
    const names = rows.map((r) => $('[data-name]', r).textContent.trim());
    const initial = grid.map((cells) => cells.map((c) => c.getAttribute('data-shift') || ''));
    const note = $('#cov-note');
    let focusR = 0;
    let focusC = 0;

    function shiftOf(cell) { return cell.getAttribute('data-shift') || ''; }
    function paint(cell, value, pop) {
      const r = +cell.closest('tr').rowIndex - 1;
      const d = +cell.getAttribute('data-day');
      cell.setAttribute('data-shift', value);
      $('[data-l]', cell).textContent = DEMO.labels[value];
      $('[data-t]', cell).textContent = DEMO.times[value];
      // The name includes what the cell shows ("AM 7–3") before saying it in full.
      const shown = DEMO.labels[value] ? DEMO.labels[value] + ' ' + DEMO.times[value] + ', ' : '';
      cell.setAttribute('aria-label', names[r] + ', ' + DEMO.days[d] + ': ' + shown + DEMO.spoken[value]);
      if (pop && !reduceMotion) {
        cell.classList.remove('pop');
        void cell.offsetWidth;
        cell.classList.add('pop');
      }
    }

    function stats() {
      const gaps = [];
      let need = 0;
      let have = 0;
      const perDay = DEMO.short.map((_, d) => {
        let short = 0;
        ['am', 'pm'].forEach((s) => {
          const n = grid.filter((cells) => shiftOf(cells[d]) === s).length;
          const want = DEMO.needs[s][d];
          need += want;
          have += Math.min(n, want);
          for (let i = n; i < want; i++) gaps.push({ day: d, shift: s });
          short += Math.max(0, want - n);
        });
        return short;
      });
      const hours = grid.map((cells) => cells.filter((c) => /^(am|pm)$/.test(shiftOf(c))).length * DEMO.shiftHours);
      return { gaps, perDay, hours, pct: Math.round((have / need) * 100) };
    }

    function update() {
      const s = stats();
      $('#cov-pct').textContent = s.pct;
      const ring = $('#cov-ring');
      ring.setAttribute('stroke-dasharray', s.pct + ' 100');
      ring.setAttribute('stroke', s.pct === 100 ? '#1fa16a' : '#ff6b4a');
      s.perDay.forEach((short, d) => {
        const badge = $('[data-cov="' + d + '"]', root);
        badge.className = 'inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-[11px] font-bold ' +
          (short ? 'bg-coral-100 text-coral-700' : 'bg-mint text-mint-ink');
        badge.innerHTML = short ? '−' + short + '<span class="sr-only"> ' + DEMO.days[d] + ' needs ' + short + ' more</span>'
          : CHECK_SVG + '<span class="sr-only">' + DEMO.days[d] + ' covered</span>';
      });
      rows.forEach((r, i) => {
        const el = $('[data-hours]', r);
        const over = s.hours[i] > DEMO.maxHours;
        el.textContent = s.hours[i] + 'h' + (over ? ' · over' : '');
        el.classList.toggle('text-coral-700', over);
        el.classList.toggle('font-bold', over);
        el.classList.toggle('text-ink-faint', !over);
      });
      const list = s.gaps.map((g) => DEMO.short[g.day] + ' ' + g.shift.toUpperCase());
      note.textContent = s.gaps.length
        ? s.gaps.length + ' open shift' + (s.gaps.length === 1 ? '' : 's') + ': ' + list.slice(0, 3).join(', ') + (list.length > 3 ? ' and ' + (list.length - 3) + ' more' : '')
        : 'Every shift covered. Ready to publish.';
      return s;
    }

    function setFocus(r, c, move) {
      grid[focusR][focusC].tabIndex = -1;
      focusR = r; focusC = c;
      grid[r][c].tabIndex = 0;
      if (move) grid[r][c].focus();
    }

    function cycle(cell) {
      const now = shiftOf(cell);
      if (now === 'off') {
        const r = cell.closest('tr').rowIndex - 1;
        announce(names[r] + ' has approved time off on ' + DEMO.days[+cell.getAttribute('data-day')] + '.');
        cell.animate && !reduceMotion && cell.animate([{ transform: 'translateX(0)' }, { transform: 'translateX(-3px)' }, { transform: 'translateX(3px)' }, { transform: 'translateX(0)' }], { duration: 260 });
        return;
      }
      paint(cell, now === '' ? 'am' : now === 'am' ? 'pm' : '', true);
      update();
    }

    grid.forEach((cells, r) => cells.forEach((cell, c) => {
      paint(cell, shiftOf(cell), false);
      cell.addEventListener('click', () => {
        if (suppressClick) { suppressClick = false; return; }
        setFocus(r, c, false);
        cycle(cell);
      });
      cell.addEventListener('focus', () => setFocus(r, c, false));
      cell.addEventListener('keydown', (e) => {
        const maxR = grid.length - 1;
        const maxC = cells.length - 1;
        let nr = r;
        let nc = c;
        if (e.key === 'ArrowRight') nc = Math.min(maxC, c + 1);
        else if (e.key === 'ArrowLeft') nc = Math.max(0, c - 1);
        else if (e.key === 'ArrowDown') nr = Math.min(maxR, r + 1);
        else if (e.key === 'ArrowUp') nr = Math.max(0, r - 1);
        else if (e.key === 'Home') nc = 0;
        else if (e.key === 'End') nc = maxC;
        else if ((e.key === 'Delete' || e.key === 'Backspace') && shiftOf(cell) !== 'off') { e.preventDefault(); paint(cell, '', true); update(); return; }
        else if ((e.key === 'a' || e.key === 'p') && shiftOf(cell) !== 'off') { paint(cell, e.key === 'a' ? 'am' : 'pm', true); update(); return; }
        else return;
        e.preventDefault();
        setFocus(nr, nc, true);
      });
    }));
    grid[0][0].tabIndex = 0;

    // Drag a shift onto another cell to move it (or swap with what's there).
    let drag = null;
    let suppressClick = false;
    function cellAt(x, y) {
      const el = document.elementFromPoint(x, y);
      const cell = el && el.closest('.sched-cell');
      return cell && root.contains(cell) ? cell : null;
    }
    function endDrag(commit) {
      if (!drag) return;
      const { source, ghost, target } = drag;
      if (ghost) ghost.remove();
      source.classList.remove('is-dragging');
      if (target) target.classList.remove('is-drop');
      if (commit && target) {
        const a = shiftOf(source);
        const b = shiftOf(target);
        paint(target, a, true);
        paint(source, b, true);
        const s = update();
        const r = target.closest('tr').rowIndex - 1;
        announce('Moved to ' + names[r] + ', ' + DEMO.days[+target.getAttribute('data-day')] + '. ' + s.pct + '% covered.');
      }
      if (drag.started) suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 0);
      drag = null;
    }
    root.addEventListener('pointerdown', (e) => {
      const cell = e.target.closest('.sched-cell');
      if (!cell || e.button !== 0 || !/^(am|pm)$/.test(shiftOf(cell))) return;
      drag = { source: cell, x: e.clientX, y: e.clientY, started: false, ghost: null, target: null, id: e.pointerId };
    });
    window.addEventListener('pointermove', (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      if (!drag.started) {
        if (Math.hypot(e.clientX - drag.x, e.clientY - drag.y) < 6) return;
        drag.started = true;
        const s = shiftOf(drag.source);
        const ghost = document.createElement('div');
        ghost.className = 'sched-ghost ' + (s === 'am' ? 'bg-mint text-mint-ink' : 'bg-lilac text-lilac-ink');
        const rect = drag.source.getBoundingClientRect();
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        ghost.textContent = DEMO.labels[s];
        document.body.appendChild(ghost);
        drag.ghost = ghost;
        drag.source.classList.add('is-dragging');
      }
      drag.ghost.style.left = e.clientX + 'px';
      drag.ghost.style.top = e.clientY + 'px';
      const over = cellAt(e.clientX, e.clientY);
      const valid = over && over !== drag.source && shiftOf(over) !== 'off' ? over : null;
      if (valid !== drag.target) {
        if (drag.target) drag.target.classList.remove('is-drop');
        if (valid) valid.classList.add('is-drop');
        drag.target = valid;
      }
    });
    window.addEventListener('pointerup', (e) => { if (drag && e.pointerId === drag.id) endDrag(drag.started); });
    window.addEventListener('pointercancel', () => endDrag(false));
    // While dragging on a touch screen, stop the page from scrolling.
    root.addEventListener('touchmove', (e) => { if (drag && drag.started) e.preventDefault(); }, { passive: false });

    // Auto-fill: give each open shift to the free person with the fewest hours, never over maxHours.
    $('#demo-fill').addEventListener('click', () => {
      const s = stats();
      let added = 0;
      s.gaps.forEach((g) => {
        const hours = grid.map((cells) => cells.filter((c) => /^(am|pm)$/.test(shiftOf(c))).length * DEMO.shiftHours);
        const pick = grid
          .map((cells, i) => ({ i, cell: cells[g.day], h: hours[i] }))
          .filter((p) => shiftOf(p.cell) === '' && p.h + DEMO.shiftHours <= DEMO.maxHours)
          .sort((a, b) => a.h - b.h)[0];
        if (pick) { paint(pick.cell, g.shift, true); added++; }
      });
      const after = update();
      announce(added ? 'Auto-fill added ' + added + ' shift' + (added === 1 ? '' : 's') + '. ' + after.pct + '% covered.'
        : after.gaps.length ? 'Nobody is free without going over ' + DEMO.maxHours + ' hours.' : 'Every shift is already covered.');
    });
    $('#demo-reset').addEventListener('click', () => {
      grid.forEach((cells, r) => cells.forEach((c, d) => paint(c, initial[r][d], false)));
      const s = update();
      announce('Schedule reset. ' + s.pct + '% covered.');
    });
    $('#demo-publish').addEventListener('click', () => {
      const s = stats();
      toast(s.gaps.length
        ? 'Published. ' + s.gaps.length + ' open shift' + (s.gaps.length === 1 ? '' : 's') + ' offered to the team (demo).'
        : 'Published. ' + grid.length + ' people notified (demo).');
    });
    update();
  }

  /* ------------------------------------------------------------------
   * 5. Tabs (product tour) — arrow keys, Home and End move between tabs.
   * ------------------------------------------------------------------ */
  function initTabs() {
    $$('[role="tablist"]').forEach((list) => {
      const tabs = $$('[role="tab"]', list);
      function select(tab, focus) {
        tabs.forEach((t) => {
          const on = t === tab;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          const panel = document.getElementById(t.getAttribute('aria-controls'));
          if (panel) panel.hidden = !on;
        });
        if (focus) tab.focus();
      }
      tabs.forEach((tab, i) => {
        tab.addEventListener('click', () => select(tab, false));
        tab.addEventListener('keydown', (e) => {
          let n = null;
          if (e.key === 'ArrowDown' || e.key === 'ArrowRight') n = (i + 1) % tabs.length;
          else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') n = (i - 1 + tabs.length) % tabs.length;
          else if (e.key === 'Home') n = 0;
          else if (e.key === 'End') n = tabs.length - 1;
          if (n === null) return;
          e.preventDefault();
          select(tabs[n], true);
        });
      });
    });
  }

  /* ------------------------------------------------------------------
   * 6. Pricing — billing switch (annual by default) and price calculator.
   * ------------------------------------------------------------------ */
  let billing = 'annual';
  function initPricing() {
    const group = $('#billing');
    if (!group) return;
    const buttons = $$('[data-billing]', group);
    function setBilling(value, focus) {
      billing = value;
      buttons.forEach((b) => {
        const on = b.getAttribute('data-billing') === value;
        b.setAttribute('aria-checked', String(on));
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      $$('[data-price-monthly]').forEach((el) => { el.textContent = el.getAttribute('data-price-' + value); });
      $$('[data-billing-note]').forEach((el) => { el.textContent = el.getAttribute('data-' + value); });
      calc(false);
    }
    buttons.forEach((b, i) => {
      b.addEventListener('click', () => setBilling(b.getAttribute('data-billing'), false));
      b.addEventListener('keydown', (e) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
        e.preventDefault();
        setBilling(buttons[(i + 1) % buttons.length].getAttribute('data-billing'), true);
      });
    });

    const form = $('#calc');
    const loc = $('#calc-locations');
    const emp = $('#calc-employees');
    let liveTimer = 0;
    function fill(input) {
      const p = ((input.value - input.min) / (input.max - input.min)) * 100;
      input.style.setProperty('--fill', p + '%');
    }
    function calc(speak) {
      if (!form) return;
      const L = +loc.value;
      const E = +emp.value;
      const planKey = (form.querySelector('input[name="plan"]:checked') || {}).value || 'team';
      const plan = PRICING[planKey];
      const locSum = L * plan.location[billing];
      const empSum = E * plan.employee[billing];
      const total = locSum + empSum;
      const monthlyTotal = L * plan.location.monthly + E * plan.employee.monthly;
      const yearlySaving = (monthlyTotal - (L * plan.location.annual + E * plan.employee.annual)) * 12;

      $('#calc-locations-out').textContent = L;
      $('#calc-employees-out').textContent = E;
      loc.setAttribute('aria-valuetext', L + (L === 1 ? ' location' : ' locations'));
      emp.setAttribute('aria-valuetext', E + ' employees');
      fill(loc); fill(emp);
      $('#calc-total').textContent = money(total);
      $('#calc-loc-label').textContent = L + (L === 1 ? ' location' : ' locations') + ' × ' + money(plan.location[billing]);
      $('#calc-loc-sum').textContent = money(locSum);
      $('#calc-emp-label').textContent = E + ' employees × ' + money(plan.employee[billing]);
      $('#calc-emp-sum').textContent = money(empSum);
      $('#calc-per').textContent = money(Math.round((total / E) * 100) / 100);
      $('#calc-billing').textContent = billing === 'annual' ? 'Billed annually: ' + money(total * 12) + ' a year' : 'Billed monthly, cancel any time';

      const note = $('#calc-note');
      const cta = $('#calc-cta');
      if (L <= PRICING.freeLocations && E <= PRICING.freeEmployees) {
        note.textContent = 'Good news: Starter is free for one location with up to 15 people.';
        cta.setAttribute('href', 'signup.html?plan=starter');
        cta.firstChild.textContent = 'Start for free ';
      } else {
        note.textContent = E >= PRICING.enterpriseEmployees
          ? 'With 500 or more people, Enterprise volume pricing is usually lower. Talk to sales.'
          : billing === 'annual' ? 'You save ' + money(yearlySaving) + ' a year with annual billing.'
            : 'Switch to annual billing and save ' + money(yearlySaving) + ' a year.';
        cta.setAttribute('href', E >= PRICING.enterpriseEmployees ? 'contact.html?size=500' : 'signup.html?plan=' + planKey);
        cta.firstChild.textContent = E >= PRICING.enterpriseEmployees ? 'Talk to sales ' : 'Start a free trial ';
      }
      if (speak) {
        window.clearTimeout(liveTimer);
        liveTimer = window.setTimeout(() => { $('#calc-live').textContent = 'Estimated ' + money(total) + ' a month on ' + plan.name + '.'; }, 600);
      }
    }
    if (form) {
      form.addEventListener('input', () => calc(true));
      form.addEventListener('change', () => calc(true));
      form.addEventListener('submit', (e) => e.preventDefault());
    }
    setBilling(billing, false);
  }

  /* ------------------------------------------------------------------
   * 7. Accordion (FAQ) — one answer open at a time.
   * ------------------------------------------------------------------ */
  function initAccordions() {
    $$('[data-accordion]').forEach((acc) => {
      const items = $$('.acc-item', acc);
      items.forEach((item) => {
        const btn = $('button[aria-expanded]', item);
        btn.addEventListener('click', () => {
          const open = btn.getAttribute('aria-expanded') !== 'true';
          items.forEach((other) => {
            if (other === item) return;
            other.classList.remove('is-open');
            $('button[aria-expanded]', other).setAttribute('aria-expanded', 'false');
          });
          item.classList.toggle('is-open', open);
          btn.setAttribute('aria-expanded', String(open));
        });
      });
    });
  }

  /* ------------------------------------------------------------------
   * 8. Filters and search — [data-filter="name"] buttons, [data-filter-item="name"]
   *    items with data-tags, optional [data-search-input="name"]. Kept in the URL.
   * ------------------------------------------------------------------ */
  function initFilters() {
    $$('[data-filter]').forEach((group) => {
      const name = group.getAttribute('data-filter');
      const param = group.getAttribute('data-filter-param');
      const noun = group.getAttribute('data-filter-noun') || 'item';
      const plural = group.getAttribute('data-filter-plural') || noun + 's';
      const buttons = $$('[data-filter-value]', group);
      const items = $$('[data-filter-item="' + name + '"]');
      const search = $('[data-search-input="' + name + '"]');
      const searchParam = search && search.getAttribute('data-search-param');
      const status = $('[data-filter-status="' + name + '"]');
      const empty = $('[data-filter-empty="' + name + '"]');
      let current = 'all';
      let searchTimer = 0;

      function matchesSearch(item) {
        const q = search ? search.value.trim().toLowerCase() : '';
        if (!q) return true;
        const hay = item.getAttribute('data-search') || item.textContent.toLowerCase();
        return q.split(/\s+/).every((w) => hay.indexOf(w) !== -1);
      }
      function apply(value, user) {
        if (!buttons.some((b) => b.getAttribute('data-filter-value') === value)) value = 'all';
        current = value;
        let shown = 0;
        items.forEach((item) => {
          const tags = (item.getAttribute('data-tags') || '').split(/\s+/);
          const show = (value === 'all' || tags.includes(value)) && matchesSearch(item);
          item.hidden = !show;
          if (show) shown++;
        });
        buttons.forEach((b) => {
          const v = b.getAttribute('data-filter-value');
          b.setAttribute('aria-pressed', String(v === value));
          const count = $('.pill-count', b);
          if (count) count.textContent = items.filter((it) => (v === 'all' || (it.getAttribute('data-tags') || '').split(/\s+/).includes(v)) && matchesSearch(it)).length;
        });
        const msg = 'Showing ' + shown + ' ' + (shown === 1 ? noun : plural);
        if (status) status.textContent = msg;
        if (empty) empty.hidden = shown !== 0;
        if (user) {
          if (param) setParam(param, value === 'all' ? '' : value);
          if (!status) announce(msg);
        }
      }
      buttons.forEach((b) => b.addEventListener('click', () => apply(b.getAttribute('data-filter-value'), true)));
      if (search) {
        if (searchParam && params().get(searchParam)) search.value = params().get(searchParam);
        search.addEventListener('input', () => {
          window.clearTimeout(searchTimer);
          searchTimer = window.setTimeout(() => {
            apply(current, false);
            if (searchParam) setParam(searchParam, search.value.trim());
          }, 150);
        });
      }
      $$('[data-filter-reset="' + name + '"]').forEach((btn) => btn.addEventListener('click', () => {
        if (search) { search.value = ''; if (searchParam) setParam(searchParam, ''); }
        apply('all', true);
        (search || buttons[0]).focus();
      }));
      apply(param ? (params().get(param) || 'all').toLowerCase() : 'all', false);
    });
  }

  /* ------------------------------------------------------------------
   * 9. Integration drawer — a native <dialog> filled from each card's <template data-detail>.
   *    integrations.html?integration=paywell opens it on load.
   * ------------------------------------------------------------------ */
  function initDrawer() {
    const dialog = $('#int-drawer');
    if (!dialog || typeof dialog.showModal !== 'function') return;
    const body = $('[data-drawer-body]', dialog);
    let opener = null;
    function open(btn) {
      const tpl = $('template[data-detail]', btn.closest('article'));
      if (!tpl) return;
      opener = btn;
      body.replaceChildren(tpl.content.cloneNode(true));
      body.scrollTop = 0;
      dialog.showModal();
      setParam('integration', btn.getAttribute('data-drawer-open'));
    }
    $$('[data-drawer-open]').forEach((btn) => btn.addEventListener('click', () => open(btn)));
    $('[data-drawer-close]', dialog).addEventListener('click', () => dialog.close());
    // Clicking the dimmed backdrop (the dialog element itself) closes it.
    dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', () => {
      setParam('integration', '');
      if (opener) opener.focus();
    });
    const start = params().get('integration');
    const btn = start && $('[data-drawer-open="' + CSS.escape(start) + '"]');
    if (btn) open(btn);
  }

  /* ------------------------------------------------------------------
   * 10. Forms — inline validation and a success state. Demo forms send nothing.
   * ------------------------------------------------------------------ */
  // Free email providers the sales form rejects (it asks for a work address).
  const FREE_EMAIL = ['gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'live.com', 'icloud.com', 'aol.com', 'proton.me', 'protonmail.com', 'gmx.com'];
  const EMAIL_RE = /^[^\s@,;]+@[^\s@,;]+\.[^\s@,;]{2,}$/;

  function fieldMessage(el) {
    const v = el.value.trim();
    const label = el.getAttribute('data-label') || 'This field';
    if (el.type === 'checkbox') return el.required && !el.checked ? (el.getAttribute('data-msg') || 'Please check this box.') : '';
    if (el.required && !v) return el.tagName === 'SELECT' ? 'Please choose ' + label.toLowerCase() + '.' : label + ' is required.';
    if (!v) return '';
    const rule = el.getAttribute('data-validate') || el.type;
    if ((rule === 'email' || rule === 'work-email') && !EMAIL_RE.test(v)) return 'Enter an email address like name@business.example.';
    if (rule === 'work-email' && FREE_EMAIL.includes(v.split('@').pop().toLowerCase())) return 'Please use your work email so we can find your business.';
    if (rule === 'phone' && !/^\+?[\d\s()-]{7,20}$/.test(v)) return 'Enter a phone number with at least 7 digits.';
    if (rule === 'count') {
      const n = Number(v);
      const max = +el.getAttribute('max') || Infinity;
      if (!Number.isInteger(n) || n < 1 || n > max) return 'Enter a whole number from 1 to ' + max + '.';
    }
    if (rule === 'password' && (v.length < 8 || !/[\d\W_]/.test(v))) return 'Use at least 8 characters, including a number or symbol.';
    if (rule === 'email-list') {
      const bad = v.split(/[\s,;]+/).filter(Boolean).filter((a) => !EMAIL_RE.test(a));
      if (bad.length) return 'Check ' + (bad.length === 1 ? 'this address: ' : 'these addresses: ') + bad.slice(0, 3).join(', ') + '.';
    }
    const min = +el.getAttribute('minlength');
    if (min && v.length < min) return label + ' needs at least ' + min + ' characters.';
    return '';
  }
  function groupMessage(group) {
    const min = +group.getAttribute('data-min-checked') || 1;
    return $$('input:checked', group).length >= min ? '' : group.getAttribute('data-msg') || 'Choose an option.';
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
    err.hidden = !msg;
    if (msg) {
      el.setAttribute('aria-invalid', 'true');
      const desc = (el.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      if (desc.indexOf(errId) === -1) desc.push(errId);
      el.setAttribute('aria-describedby', desc.join(' '));
    } else {
      el.removeAttribute('aria-invalid');
    }
  }
  function isActive(el) { return !el.closest('[hidden]'); }
  function fieldsOf(root) {
    return $$('input, select, textarea', root).filter((el) =>
      el.id && !['radio', 'hidden', 'submit', 'range'].includes(el.type) && !el.closest('[data-group]') && isActive(el) && !(el.type === 'checkbox' && !el.required));
  }
  function validate(root, form) {
    let firstBad = null;
    fieldsOf(root).forEach((el) => {
      const msg = fieldMessage(el);
      showError(el, msg);
      if (msg && !firstBad) firstBad = el;
    });
    $$('[data-group]', root).filter(isActive).forEach((g) => {
      const msg = groupMessage(g);
      showError(g, msg);
      if (msg && !firstBad) firstBad = $('input', g);
    });
    const status = $('[data-form-status]', form || root);
    if (status) status.textContent = firstBad ? 'Please fix the highlighted fields.' : '';
    if (firstBad) firstBad.focus();
    return !firstBad;
  }
  function liveValidation(form) {
    form.setAttribute('novalidate', '');
    fieldsOf(form).concat($$('[hidden] input, [hidden] select, [hidden] textarea', form).filter((el) => el.id && el.type !== 'radio' && !el.closest('[data-group]'))).forEach((el) => {
      el.addEventListener('blur', () => { if (el.value.trim() || el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
      el.addEventListener('input', () => { if (el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
      el.addEventListener('change', () => { if (el.hasAttribute('aria-invalid')) showError(el, fieldMessage(el)); });
    });
    $$('[data-group]', form).forEach((g) => g.addEventListener('change', () => { if (g.hasAttribute('aria-invalid')) showError(g, groupMessage(g)); }));
  }
  function setupValidation(form, onValid) {
    liveValidation(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (validate(form)) onValid(form);
    });
  }
  function successSwap(target, html) {
    const box = document.createElement('div');
    box.setAttribute('role', 'status');
    box.setAttribute('tabindex', '-1');
    box.className = 'rounded-3xl bg-mint p-6 text-ink focus:outline-none';
    box.innerHTML = html;
    target.replaceWith(box);
    box.focus();
    return box;
  }
  const tick = '<span class="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white text-mint-ink"><svg viewBox="0 0 20 20" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 10.5 3.2 3.2L15 7"/></svg></span>';

  function initContactRouting(form) {
    const route = $('#route');
    const extra = $('[data-route-extra]', form);
    function setRoute(key) {
      const r = CONTACT_ROUTES[key];
      if (!r || !route) return;
      $$('[data-route-avatar]', route).forEach((a) => { a.hidden = a.getAttribute('data-route-avatar') !== r.avatar; });
      $('[data-route-name]', route).textContent = r.name;
      $('[data-route-role]', route).textContent = r.role;
      $('[data-route-text]', route).textContent = r.text;
      $('[data-route-time] span', route).textContent = r.time;
      $('[data-route-trial]', route).classList.toggle('hidden', !r.trial);
      if (extra) extra.hidden = !(key === 'large' || key === 'enterprise');
    }
    $$('input[name="size"]', form).forEach((radio) => radio.addEventListener('change', () => setRoute(radio.value)));
    // contact.html?size=500 (a number or small/mid/large/enterprise) preselects the team size.
    const p = params().get('size');
    if (p) {
      const n = parseInt(p, 10);
      const key = isNaN(n) ? p.toLowerCase() : n >= 500 ? 'enterprise' : n >= 100 ? 'large' : n >= 25 ? 'mid' : 'small';
      const radio = $('input[name="size"][value="' + CSS.escape(key) + '"]', form);
      if (radio) { radio.checked = true; setRoute(key); }
    }
    // contact.html?topic=careers preselects the topic.
    const topic = (params().get('topic') || '').toLowerCase();
    const select = $('#c-topic', form);
    if (topic && select && $$('option', select).some((o) => o.value === topic)) select.value = topic;
  }

  function initSignup(form) {
    const card = $('#signup');
    const sections = $$('[data-step]', form);
    const indicators = $$('[data-step-indicator]', card);
    const back = $('[data-step-back]', form);
    const nextLabel = $('[data-next-label]', form);
    let step = 1;

    const plan = (params().get('plan') || '').toLowerCase();
    if (PLAN_LABELS[plan]) {
      $$('[data-plan-label]').forEach((el) => { el.textContent = PLAN_LABELS[plan]; });
      $('#s-plan', form).value = plan;
    }

    function go(n) {
      step = n;
      sections.forEach((s) => { s.hidden = +s.getAttribute('data-step') !== n; });
      indicators.forEach((li) => {
        const i = +li.getAttribute('data-step-indicator');
        const state = i < n ? 'done' : i === n ? 'current' : 'upcoming';
        li.setAttribute('data-step-state', state);
        if (state === 'current') li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        $('[data-step-num]', li).hidden = state === 'done';
        $('[data-step-check]', li).hidden = state !== 'done';
      });
      back.classList.toggle('invisible', n === 1);
      nextLabel.textContent = n === sections.length ? 'Start my free trial' : 'Continue';
      $('[data-form-status]', form).textContent = '';
      const heading = $('[data-step="' + n + '"] h2', form);
      if (card.getBoundingClientRect().top < 0) card.scrollIntoView({ block: 'start' });
      heading.focus({ preventScroll: true });
    }
    back.addEventListener('click', () => { if (step > 1) go(step - 1); });

    // Password: show/hide and a strength meter.
    const pw = $('#s-password', form);
    const toggle = $('[data-toggle-password]', form);
    toggle.addEventListener('click', () => {
      const show = pw.type === 'password';
      pw.type = show ? 'text' : 'password';
      toggle.textContent = show ? 'Hide' : 'Show';
      toggle.setAttribute('aria-pressed', String(show));
      toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
    toggle.setAttribute('aria-label', 'Show password');
    const segs = $$('[data-meter]', form);
    const meterLabel = $('[data-meter-label]', form);
    const COLORS = ['bg-[#e5484d]', 'bg-[#f2a33a]', 'bg-[#5ccf9a]', 'bg-[#1fa16a]'];
    const WORDS = ['Too short', 'Weak: add a number or symbol', 'Okay', 'Strong', 'Very strong'];
    pw.addEventListener('input', () => {
      const v = pw.value;
      let score = 0;
      if (v.length >= 8) {
        score = 1;
        if (/[\d\W_]/.test(v)) score++;
        if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score++;
        if (v.length >= 12) score++;
      }
      segs.forEach((s, i) => {
        s.classList.remove(...COLORS);
        if (i < score) s.classList.add(COLORS[Math.max(0, score - 1)]);
      });
      meterLabel.textContent = v ? 'Password strength: ' + WORDS[score] + '.' : 'At least 8 characters, with a number or symbol.';
    });

    liveValidation(form);
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const current = $('[data-step="' + step + '"]', form);
      if (!validate(current, form)) return;
      if (step < sections.length) { go(step + 1); return; }
      // Last step: to create real accounts, send new FormData(form) to your backend here.
      const data = new FormData(form);
      const first = String(data.get('name') || '').trim().split(/\s+/)[0];
      const business = String(data.get('business') || '').trim();
      const planKey = String(data.get('plan'));
      const ends = new Date(Date.now() + TRIAL_DAYS * 864e5).toLocaleDateString('en-US', { day: 'numeric', month: 'long' });
      const invites = String(data.get('invites') || '').split(/[\s,;]+/).filter(Boolean).length;
      const email = String(data.get('email') || '').trim();
      const box = successSwap(card, '<div class="flex items-start gap-4">' + tick + '<div>' +
        '<h2 class="font-display text-2xl font-bold tracking-[-0.02em]">Welcome to Orbit, ' + escapeHtml(first) + '!</h2>' +
        '<p class="mt-2 text-ink-soft">' + (planKey === 'starter' ? escapeHtml(business) + ' is set up on Starter, free forever for up to 15 people.'
          : 'Your ' + escapeHtml(PLAN_LABELS[planKey] || 'trial').toLowerCase() + ' for ' + escapeHtml(business) + ' runs until ' + ends + '.') + '</p>' +
        '<ol class="mt-5 grid gap-2.5 text-[15px]"><li class="rounded-2xl bg-white/70 px-4 py-3"><strong>1.</strong> Import your team from a spreadsheet</li>' +
        '<li class="rounded-2xl bg-white/70 px-4 py-3"><strong>2.</strong> ' + (invites ? 'We’ll invite ' + invites + ' teammate' + (invites === 1 ? '' : 's') + ' when you publish' : 'Invite your team by email or text') + '</li>' +
        '<li class="rounded-2xl bg-white/70 px-4 py-3"><strong>3.</strong> Build and publish your first week</li></ol>' +
        '<p class="mt-5 text-sm text-ink-soft">We’ve sent a link to <strong>' + escapeHtml(email) + '</strong> to confirm your email address. Check your spam folder if it hasn’t arrived in a few minutes.</p>' +
        '<p class="mt-4"><a href="index.html#schedule-demo" class="link">Try the schedule demo</a></p></div></div>');
      box.classList.add('sm:p-9');
    });
  }

  function initForms() {
    // To connect a form: replace successSwap(...) below with a fetch() to your form service, e.g.
    // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
    //   .then((r) => { if (r.ok) successSwap(form, '...'); else showFormError(); });
    $$('[data-form="newsletter"]').forEach((form) => setupValidation(form, () => {
      successSwap(form, '<p class="font-semibold">You’re on the list.</p>' +
        '<p class="mt-1 text-sm text-ink-soft">Look out for a confirmation email from us. Click the link inside and the next update is yours.</p>');
    }));

    $$('[data-form="updates"]').forEach((form) => setupValidation(form, () => {
      const freq = (form.querySelector('input[name="frequency"]:checked') || {}).value;
      successSwap(form, '<p class="font-display text-lg font-bold">Almost done.</p>' +
        '<p class="mt-1 text-sm text-ink-soft">Click the link in the confirmation email we’ve just sent. ' +
        (freq === 'monthly' ? 'After that, you’ll get one digest at the start of each month.' : 'After that, you’ll get an email whenever we ship.') + '</p>');
    }));

    $$('[data-form="contact"]').forEach((form) => {
      initContactRouting(form);
      setupValidation(form, () => {
        const first = ($('#c-first', form) || {}).value || '';
        const size = (form.querySelector('input[name="size"]:checked') || {}).value;
        const r = CONTACT_ROUTES[size] || CONTACT_ROUTES.mid;
        successSwap(form, '<div class="flex items-start gap-4">' + tick +
          '<div><p class="font-display text-2xl font-bold tracking-[-0.02em]">Thanks, ' + escapeHtml(first.trim()) + '. Your request is in.</p>' +
          '<p class="mt-2 text-ink-soft">It’s with ' + escapeHtml(r.name.split(',')[0]) + ', who ' + escapeHtml(r.time.toLowerCase()) + '. Your reference is <strong>' + makeRef() + '</strong>.</p>' +
          '<p class="mt-4"><a href="customers.html" class="link">Read customer stories while you wait</a></p></div></div>');
      });
    });

    $$('[data-form="signup"]').forEach(initSignup);
  }

  /* ------------------------------------------------------------------
   * 11. Boot
   * ------------------------------------------------------------------ */
  initScheduleDemo();
  initTabs();
  initPricing();
  initAccordions();
  initFilters();
  initDrawer();
  initForms();
  initCountUp();
  reveal(document);
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
