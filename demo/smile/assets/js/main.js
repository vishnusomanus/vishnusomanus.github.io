/* Smile (Grin Lane Dental) — site scripts. Vanilla JavaScript, no dependencies.
   All practice data (hours, clinicians, visit types, prices, triage rules) lives at the top
   of this file. Keep it in step with the HTML pages; see DOCS.md, "Content". */
(function () {
  'use strict';

  /* ---------- Practice: time zone, office hours, closures ----------
     Times are wall-clock times in Boise. Day 0 is Sunday; null means closed.
     Keep these in step with the hours lists in the HTML (data-hours). */
  var PRACTICE = {
    name: 'Grin Lane Dental',
    timeZone: 'America/Boise',
    zoneName: 'Boise time, MT',
    phone: '(208) 555-0147',
    address: '2150 W Juniper Lane, Suite 120, Boise, ID 83702'
  };
  var HOURS = {
    0: null,
    1: ['08:00', '17:00'],
    2: ['08:00', '19:00'],
    3: ['08:00', '17:00'],
    4: ['07:00', '16:00'],
    5: ['08:00', '14:00'],
    6: ['09:00', '13:00']
  };
  // Days the whole practice is closed (YYYY-MM-DD, Boise date).
  var CLOSED_DATES = ['2026-11-26', '2026-11-27', '2026-12-24', '2026-12-25', '2026-12-31', '2027-01-01', '2027-05-31', '2027-07-05'];
  // Clinicians take a lunch break on days longer than six hours.
  var LUNCH = ['12:00', '12:45'];

  /* ---------- Clinicians ----------
     days: weekdays they see patients (0 = Sunday). They work the practice hours on those days. */
  var CLINICIANS = {
    okafor: { name: 'Dr. Maya Okafor', short: 'Dr. Okafor', role: 'Dentist', img: 'assets/img/dr-okafor.svg', days: [1, 2, 4, 5] },
    reyes: { name: 'Dr. Daniel Reyes', short: 'Dr. Reyes', role: 'Dentist', img: 'assets/img/dr-reyes.svg', days: [1, 3, 4] },
    natarajan: { name: 'Dr. Priya Natarajan', short: 'Dr. Natarajan', role: 'Dentist', img: 'assets/img/dr-natarajan.svg', days: [2, 3, 5, 6] },
    lindqvist: { name: 'Dr. Ben Lindqvist', short: 'Dr. Lindqvist', role: 'Dentist', img: 'assets/img/dr-lindqvist.svg', days: [2, 3, 4, 6] },
    kowalski: { name: 'Jess Kowalski, RDH', short: 'Jess', role: 'Hygienist', img: 'assets/img/jess-kowalski.svg', days: [1, 2, 3, 4] },
    haddad: { name: 'Amir Haddad, RDH', short: 'Amir', role: 'Hygienist', img: 'assets/img/amir-haddad.svg', days: [2, 4, 5, 6] },
    brooks: { name: 'Lena Brooks, RDH', short: 'Lena', role: 'Hygienist', img: 'assets/img/lena-brooks.svg', days: [1, 3, 5] }
  };

  /* ---------- Visit types (book.html) ----------
     minutes: appointment length, used to fit slots inside each clinician's hours.
     who: clinicians who offer it, in the order "first available" tries them.
     notice: minimum minutes between now and the first bookable slot. */
  var REASONS = {
    checkup: { label: 'Checkup & cleaning', minutes: 60, price: '$165, or included in Grin Club', who: ['kowalski', 'haddad', 'brooks'], notice: 240 },
    'new': { label: 'New patient visit', minutes: 75, price: '$99 welcome offer without insurance', who: ['okafor', 'natarajan', 'lindqvist', 'reyes'], notice: 240 },
    emergency: { label: 'Toothache or emergency', minutes: 30, price: 'Emergency exam & x-ray $95', who: ['lindqvist', 'okafor', 'natarajan', 'reyes'], notice: 45 },
    kids: { label: 'Kids’ checkup', minutes: 45, price: '$95, first visit under 3 free', who: ['natarajan', 'haddad'], notice: 240 },
    cosmetic: { label: 'Whitening or cosmetic consult', minutes: 30, price: 'Free consultation', who: ['okafor'], notice: 240 },
    aligners: { label: 'Clear aligner consult', minutes: 45, price: 'Free consult with 3D scan', who: ['reyes'], notice: 240 },
    implants: { label: 'Implant consult', minutes: 45, price: '$75, credited to treatment', who: ['reyes', 'lindqvist'], notice: 240 }
  };
  var BOOKING = {
    slotStep: 15,          // minutes between start times
    daysAhead: 60,         // how far ahead people can book
    demoBusyShare: 0.55    // share of slots shown as taken so the demo looks real. Set to 0 when connected.
  };

  /* ---------- Cost estimator (pricing.html) ----------
     price: pay-as-you-go fee in USD. included: what Grin Club covers per member per year. */
  var ESTIMATE_ITEMS = [
    { id: 'checkup', name: 'Adult checkup & cleaning', price: 165, qty: 2, included: { per: 'adult', count: 2 } },
    { id: 'kidscheck', name: 'Kids’ checkup & cleaning', price: 95, qty: 0, included: { per: 'kid', count: 2 } },
    { id: 'emergency', name: 'Emergency exam & x-ray', price: 95, qty: 0, included: { per: 'adult', count: 1 } },
    { id: 'filling', name: 'White filling', price: 180, qty: 1 },
    { id: 'sealant', name: 'Sealant (per tooth)', price: 48, qty: 0 },
    { id: 'whitening', name: 'In-office whitening', price: 450, qty: 1 },
    { id: 'nightguard', name: 'Night guard', price: 425, qty: 0 },
    { id: 'crown', name: 'Porcelain crown', price: 1195, qty: 0 },
    { id: 'rootcanal', name: 'Root canal (molar)', price: 1250, qty: 0 },
    { id: 'aligners', name: 'Clear aligners (mild)', price: 2900, qty: 0 },
    { id: 'implant', name: 'Single implant with crown', price: 3900, qty: 0 }
  ];
  var MEMBERSHIP = { adultYear: 349, kidYear: 239, discount: 0.15 };
  // Illustrative financing terms only. Real terms come from your financing provider.
  var FINANCE = {
    terms: [{ months: 6, apr: 0 }, { months: 12, apr: 0 }, { months: 18, apr: 7.9 }, { months: 24, apr: 9.9 }],
    min: 300,
    max: 15000
  };

  /* ---------- Emergency triage (emergency.html) ----------
     Outcome levels: '911' (emergency services), 'call' (call us now), 'today' (book today),
     'self' (self-care and a routine visit). Red flags override the symptom's own outcome. */
  var TRIAGE = {
    symptoms: {
      toothache: { label: 'Toothache', ask: 'Is the pain severe, or keeping you awake even with over-the-counter pain relief?', yes: 'call', no: 'today',
        tip: 'Rinse with warm water and gently floss around the tooth to remove any trapped food.' },
      swelling: { label: 'Swelling in the gum or face', ask: null, outcome: 'call',
        tip: 'A cold compress on the outside of your cheek may ease the swelling. Don’t put heat on it.' },
      knocked: { label: 'Knocked-out adult tooth', ask: null, outcome: 'call',
        tip: 'Pick the tooth up by the crown (the white part), rinse it briefly without scrubbing and keep it in milk, or gently back in its socket. Time matters.' },
      broken: { label: 'Chipped or broken tooth', ask: 'Is there severe pain, or a sharp edge cutting your cheek or tongue?', yes: 'call', no: 'today',
        tip: 'Keep any pieces, rinse with warm water and cover a sharp edge with dental wax or sugar-free gum.' },
      lost: { label: 'Lost filling or crown', ask: 'Is it painful?', yes: 'today', no: 'self',
        tip: 'Keep the crown or any pieces safe and bring them with you. Don’t glue a crown back yourself.' },
      bleeding: { label: 'Bleeding after a tooth was removed', ask: 'Has it kept bleeding through 30 minutes of firm pressure on gauze?', yes: 'call', no: 'self',
        tip: 'Bite firmly on clean, damp gauze for 30 minutes. Avoid rinsing hard, smoking or using a straw for a day.' },
      braces: { label: 'Braces, wire or aligner problem', ask: 'Is it causing pain or an injury that you can’t ease yourself?', yes: 'today', no: 'self',
        tip: 'Cover a poking wire with orthodontic wax. Lost or cracked aligner? Wear your previous set until we can see you.' },
      sensitive: { label: 'Sensitivity to hot or cold', ask: 'Does the pain linger for more than a few seconds afterward?', yes: 'today', no: 'self',
        tip: 'A toothpaste for sensitive teeth may help over a few weeks. Avoid very hot, cold or acidic drinks for now.' }
    },
    // Red flags: any 911 flag sends people to emergency services; 'call' flags to the phone.
    flags: { breathing: '911', spreading: '911', injury: '911', fever: 'call' },
    // Each outcome's steps are shown first, then the symptom's tip (except for '911').
    outcomes: {
      '911': {
        title: 'Call 911 or go to the nearest emergency room now',
        lead: 'Trouble breathing or swallowing, swelling spreading to your eye or neck, or an injury to your head or face needs emergency medical care first, before a dentist.',
        steps: ['Call 911 or have someone take you to the nearest emergency room.', 'Don’t drive yourself if you feel unwell or faint.', 'Once you’re safe, call us and we’ll arrange dental follow-up.']
      },
      call: {
        title: 'Call us now',
        lead: 'This sounds like it needs a dentist soon. Call and we’ll find you the next emergency slot today, or put you through to the on-call dentist after hours.',
        steps: ['Call (208) 555-0147. After hours, press 1 for the on-call dentist.', 'For pain, over-the-counter pain relief may help if it’s safe for you. Follow the label or ask a pharmacist.']
      },
      today: {
        title: 'Book a same-day or next-day visit',
        lead: 'This isn’t usually an emergency, but it’s worth having a dentist look soon so a small problem stays small.',
        steps: ['Book an emergency exam online, or call if you can’t find a time that works.', 'Avoid chewing on that side until you’re seen.']
      },
      self: {
        title: 'Self-care for now, then a routine visit',
        lead: 'From what you’ve told us, this can usually wait for a regular appointment. Call us if anything changes or gets worse.',
        steps: ['Book a routine visit at a time that works for you.', 'Call us if it gets worse, or if you notice swelling or a fever.']
      }
    }
  };

  /* ---------- Small helpers ---------- */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function money(n, cents) { return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: cents ? 2 : 0, maximumFractionDigits: cents ? 2 : 0 }); }
  var ICON = {
    check: '<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
    alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16v.01"/></svg>',
    minus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>'
  };
  var toastTimer;
  function toast(msg) {
    var t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 3200);
  }

  /* ---------- Time helpers (everything is in the practice's time zone) ---------- */
  function toMin(hhmm) { var p = hhmm.split(':'); return Number(p[0]) * 60 + Number(p[1]); }
  function time12(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    return (h % 12 || 12) + ':' + String(m).padStart(2, '0') + ' ' + (h < 12 ? 'am' : 'pm');
  }
  function partsIn(date, zone) {
    var out = {};
    new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
      .formatToParts(date).forEach(function (p) { if (p.type !== 'literal') out[p.type] = parseInt(p.value, 10); });
    if (out.hour === 24) out.hour = 0;
    return out;
  }
  function keyOf(y, m, d) { return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); }
  function addDays(key, n) {
    var d = key.split('-').map(Number), x = new Date(Date.UTC(d[0], d[1] - 1, d[2] + n));
    return keyOf(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate());
  }
  function weekday(key) { var d = key.split('-').map(Number); return new Date(Date.UTC(d[0], d[1] - 1, d[2])).getUTCDay(); }
  function dateLabel(key, opts) {
    var d = key.split('-').map(Number);
    return new Date(Date.UTC(d[0], d[1] - 1, d[2], 12)).toLocaleDateString('en-US', Object.assign({ timeZone: 'UTC' }, opts));
  }
  function longDate(key) { return dateLabel(key, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }); }
  function practiceNow() {
    var p = partsIn(new Date(), PRACTICE.timeZone);
    var key = keyOf(p.year, p.month, p.day);
    return { key: key, day: weekday(key), mins: p.hour * 60 + p.minute };
  }
  // Practice wall time -> real instant (for .ics files).
  function wallToInstant(key, mins) {
    var d = key.split('-').map(Number);
    var guess = Date.UTC(d[0], d[1] - 1, d[2], Math.floor(mins / 60), mins % 60);
    var offset = function (t) { var p = partsIn(new Date(t), PRACTICE.timeZone); return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(t / 60000) * 60000; };
    var off = offset(guess), res = guess - off, off2 = offset(res);
    return new Date(off2 === off ? res : guess - off2);
  }
  function relativeDay(key, today) {
    if (key === today) return 'Today';
    if (key === addDays(today, 1)) return 'Tomorrow';
    return dateLabel(key, { weekday: 'short', month: 'short', day: 'numeric' });
  }
  // A stable pseudo-random number per string, so demo "taken" slots don't change between renders.
  // A short reference for confirmations, like GL-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }

  /* ---------- Header: shadow on scroll + mobile menu ---------- */
  var header = $('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    var menuBtn = $('[data-menu-button]', header), menu = $('[data-mobile-menu]', header);
    if (menuBtn && menu) {
      var setMenu = function (open, returnFocus) {
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        menu.hidden = !open;
        $('[data-icon-open]', menuBtn).hidden = open;
        $('[data-icon-close]', menuBtn).hidden = !open;
        if (!open && returnFocus) menuBtn.focus();
      };
      menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') setMenu(false, true);
      });
      document.addEventListener('click', function (e) {
        if (menuBtn.getAttribute('aria-expanded') === 'true' && !header.contains(e.target)) setMenu(false);
      });
      $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
      window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
    }
  }

  /* ---------- Scroll reveal ----------
     Revealing an element also reveals everything before it, so fast jumps never leave gaps. */
  var reveals = $$('.reveal');
  if (!('IntersectionObserver' in window) || reduceMotion.matches) {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = reveals.indexOf(entry.target);
        reveals.slice(0, index + 1).forEach(function (el) { el.classList.add('is-visible'); io.unobserve(el); });
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });

  /* ---------- Office hours: today's row + live open-now badge ---------- */
  function openStatus() {
    var now = practiceNow();
    var closedToday = CLOSED_DATES.indexOf(now.key) !== -1;
    var h = HOURS[now.day];
    if (h && !closedToday && now.mins >= toMin(h[0]) && now.mins < toMin(h[1])) {
      return { open: true, text: 'Open now · until ' + time12(toMin(h[1])) };
    }
    for (var i = 0; i < 14; i++) {
      var key = addDays(now.key, i), wd = weekday(key), hh = HOURS[wd];
      if (!hh || CLOSED_DATES.indexOf(key) !== -1) continue;
      if (i === 0 && now.mins >= toMin(hh[0])) continue;
      var when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : dateLabel(key, { weekday: 'long' });
      return { open: false, text: 'Closed · opens ' + when + ' ' + time12(toMin(hh[0])) };
    }
    return { open: false, text: 'Closed' };
  }
  function renderHours() {
    var now = practiceNow(), status = openStatus();
    $$('[data-hours] [data-day]').forEach(function (row) {
      var today = Number(row.getAttribute('data-day')) === now.day;
      row.setAttribute('data-today', String(today));
      var dt = $('dt', row);
      if (today && dt && !$('.sr-only', dt)) dt.insertAdjacentHTML('beforeend', '<span class="sr-only"> (today)</span>');
    });
    $$('[data-open-status]').forEach(function (el) {
      el.hidden = false;
      el.setAttribute('data-open', String(status.open));
      $('[data-open-text]', el).textContent = status.text;
    });
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- Booking engine: slots from clinician schedules and visit length ---------- */
  function windowsFor(id, key) {
    var wd = weekday(key), h = HOURS[wd], c = CLINICIANS[id];
    if (!h || !c || CLOSED_DATES.indexOf(key) !== -1 || c.days.indexOf(wd) === -1) return [];
    var open = toMin(h[0]), close = toMin(h[1]);
    if (close - open > 360) return [[open, toMin(LUNCH[0])], [toMin(LUNCH[1]), close]];
    return [[open, close]];
  }
  function slotsFor(reasonId, clinician, key) {
    var r = REASONS[reasonId], now = practiceNow();
    if (!r || key < now.key || key > addDays(now.key, BOOKING.daysAhead)) return [];
    var ids = clinician && clinician !== 'any' ? [clinician] : r.who;
    var earliest = key === now.key ? now.mins + r.notice : 0;
    var byTime = {};
    ids.forEach(function (id) {
      windowsFor(id, key).forEach(function (w) {
        for (var m = w[0]; m + r.minutes <= w[1]; m += BOOKING.slotStep) {
          if (m < earliest || byTime[m]) continue;
          if (hash(id + key + m) < BOOKING.demoBusyShare) continue;
          byTime[m] = { mins: m, who: id };
        }
      });
    });
    return Object.keys(byTime).map(Number).sort(function (a, b) { return a - b; }).map(function (m) { return byTime[m]; });
  }
  function firstAvailable(reasonId, clinician, from) {
    var now = practiceNow();
    for (var k = from || now.key, i = 0; i <= BOOKING.daysAhead; i++, k = addDays(k, 1)) {
      var s = slotsFor(reasonId, clinician, k);
      if (s.length) return { key: k, slot: s[0] };
    }
    return null;
  }

  // Home page: "Next checkup" card.
  var nextSlot = $('[data-next-slot]');
  if (nextSlot) {
    var nx = firstAvailable('checkup', 'any');
    if (nx) {
      nextSlot.textContent = relativeDay(nx.key, practiceNow().key) + ', ' + time12(nx.slot.mins);
      var who = $('[data-next-slot-who]');
      if (who) who.textContent = 'with ' + CLINICIANS[nx.slot.who].short + ', hygienist';
    }
  }

  /* ---------- Testimonial carousel ---------- */
  $$('[data-carousel]').forEach(function (root) {
    var track = $('[data-carousel-track]', root), prev = $('[data-prev]', root), next = $('[data-next]', root);
    if (!track) return;
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = track.scrollLeft >= max;
    }
    function step() { var first = track.children[0]; return first ? first.getBoundingClientRect().width + 20 : track.clientWidth; }
    if (prev) prev.addEventListener('click', function () { track.scrollBy({ left: -step(), behavior: reduceMotion.matches ? 'auto' : 'smooth' }); });
    if (next) next.addEventListener('click', function () { track.scrollBy({ left: step(), behavior: reduceMotion.matches ? 'auto' : 'smooth' }); });
    track.addEventListener('scroll', function () { window.requestAnimationFrame(update); }, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Filters (treatments by category, team by role and language) ----------
     Markup: [data-filter-root] with chips [data-filter="value"], optional select [data-filter-select],
     items [data-filter-item data-tags="a b" data-langs="en es"], a live [data-filter-status],
     an empty state [data-filter-empty] and reset buttons [data-filter-reset].
     The chip value is kept in the URL (?category= or whatever data-filter-param says). */
  $$('[data-filter-root]').forEach(function (root) {
    var chips = $$('[data-filter]', root), select = $('[data-filter-select]', root), items = $$('[data-filter-item]', root);
    var status = $('[data-filter-status]', root), empty = $('[data-filter-empty]', root);
    var param = root.getAttribute('data-filter-param') || 'filter', noun = root.getAttribute('data-filter-noun') || 'item';
    var state = { tag: 'all', lang: 'all' };
    function matches(it, tag, lang) {
      var tags = (it.getAttribute('data-tags') || '').split(' '), langs = (it.getAttribute('data-langs') || '').split(' ');
      return (tag === 'all' || tags.indexOf(tag) !== -1) && (lang === 'all' || langs.indexOf(lang) !== -1);
    }
    function apply(push) {
      if (!chips.some(function (c) { return c.getAttribute('data-filter') === state.tag; })) state.tag = 'all';
      chips.forEach(function (c) {
        var v = c.getAttribute('data-filter');
        c.setAttribute('aria-pressed', String(v === state.tag));
        var count = $('.chip-count', c);
        if (count) count.textContent = items.filter(function (it) { return matches(it, v, state.lang); }).length;
      });
      var shown = 0;
      items.forEach(function (it) { var ok = matches(it, state.tag, state.lang); it.hidden = !ok; if (ok) shown++; });
      if (empty) empty.hidden = shown !== 0;
      if (status) status.textContent = 'Showing ' + shown + ' ' + noun + (shown === 1 ? '' : 's') + '.';
      if (push) {
        var url = new URL(window.location.href);
        if (state.tag === 'all') url.searchParams.delete(param); else url.searchParams.set(param, state.tag);
        try { history.replaceState(null, '', url.pathname + url.search + url.hash); } catch (e) {}
      }
    }
    chips.forEach(function (chip) { chip.addEventListener('click', function () { state.tag = chip.getAttribute('data-filter'); apply(true); }); });
    if (select) select.addEventListener('change', function () { state.lang = select.value; apply(false); });
    $$('[data-filter-reset]', root).forEach(function (b) {
      b.addEventListener('click', function () { state.tag = 'all'; state.lang = 'all'; if (select) select.value = 'all'; apply(true); if (chips[0]) chips[0].focus(); });
    });
    state.tag = new URLSearchParams(window.location.search).get(param) || 'all';
    apply(false);
  });

  /* ---------- Tabs (nervous-patient guide) ---------- */
  $$('[role="tablist"]').forEach(function (list) {
    var tabs = $$('[role="tab"]', list);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab, false); });
      tab.addEventListener('keydown', function (e) {
        var to = null;
        if (e.key === 'ArrowRight') to = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') to = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') to = tabs[0];
        if (e.key === 'End') to = tabs[tabs.length - 1];
        if (to) { e.preventDefault(); select(to, true); }
      });
    });
  });

  /* ---------- Form validation ----------
     Fields with data-validate are checked on submit (and live once they have an error).
     Rules come from the HTML: required, type="email", minlength, pattern, data-match,
     data-phone, data-past-date. Errors are shown inline and linked with aria-describedby. */
  function fieldMessage(field) {
    var v = (field.value || '').trim(), label = field.getAttribute('data-label') || 'This field';
    if (field.type === 'checkbox') return field.required && !field.checked ? (field.getAttribute('data-required-msg') || 'Please check this box to continue.') : '';
    if (field.type === 'radio') {
      var group = $$('input[name="' + field.name + '"]', field.form);
      return field.required && !group.some(function (r) { return r.checked; }) ? (field.getAttribute('data-required-msg') || 'Please choose an option.') : '';
    }
    if (field.required && !v) return field.getAttribute('data-required-msg') || label + ' is required.';
    if (!v) return '';
    if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Please enter an email address like name@example.com.';
    if (field.hasAttribute('data-phone') && v.replace(/\D/g, '').length < 10) return 'Please enter a phone number with area code, like (208) 555-0123.';
    if (field.minLength > 0 && v.length < field.minLength) return label + ' needs at least ' + field.minLength + ' characters.';
    if (field.hasAttribute('data-past-date')) {
      var today = practiceNow().key;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || v >= today || v < '1900-01-01') return 'Please enter a valid date of birth.';
    }
    if (field.hasAttribute('data-match')) {
      var want = field.getAttribute('data-match-value') || '';
      if (want && v.toLowerCase().replace(/\s+/g, ' ') !== want.toLowerCase().replace(/\s+/g, ' ')) return field.getAttribute('data-match-msg') || 'This does not match.';
    }
    return '';
  }
  function errorHost(field) {
    if (field.type === 'radio' || field.hasAttribute('data-error-in')) {
      var host = field.closest('[data-error-host]');
      if (host) return host;
    }
    return field.closest('[data-field]') || field.parentNode;
  }
  function showError(field, msg) {
    var host = errorHost(field);
    var id = (field.id || field.name) + '-error';
    var el = document.getElementById(id);
    var targets = field.type === 'radio' ? $$('input[name="' + field.name + '"]', field.form) : [field];
    if (msg) {
      if (!el) {
        el = document.createElement('p');
        el.id = id;
        el.className = 'field-error';
        host.appendChild(el);
      }
      el.innerHTML = ICON.alert + '<span>' + esc(msg) + '</span>';
      targets.forEach(function (t) {
        t.setAttribute('aria-invalid', 'true');
        var d = (t.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
        if (d.indexOf(id) === -1) d.push(id);
        t.setAttribute('aria-describedby', d.join(' '));
      });
    } else {
      if (el) el.remove();
      targets.forEach(function (t) {
        t.removeAttribute('aria-invalid');
        var rest = (t.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== id; });
        if (rest.length) t.setAttribute('aria-describedby', rest.join(' ')); else t.removeAttribute('aria-describedby');
      });
    }
  }
  function validateFields(fields) {
    var first = null, seen = {};
    fields.forEach(function (field) {
      if (field.type === 'radio') { if (seen[field.name]) return; seen[field.name] = true; }
      var msg = fieldMessage(field);
      showError(field, msg);
      if (msg && !first) first = field;
    });
    if (first) first.focus();
    return !first;
  }
  function liveValidate(root) {
    var seen = {};
    $$('[data-validate]', root).forEach(function (field) {
      if (field.type === 'radio') { if (seen[field.name]) return; seen[field.name] = true; }
      var evt = field.type === 'checkbox' || field.type === 'radio' || field.tagName === 'SELECT' ? 'change' : 'input';
      var recheck = function () { if (field.getAttribute('aria-invalid') === 'true') showError(field, fieldMessage(field)); };
      // A radio group's error clears when any option in it is picked, not just the one carrying data-validate.
      var targets = field.type === 'radio' ? $$('input[name="' + field.name + '"]', field.form) : [field];
      targets.forEach(function (t) {
        t.addEventListener(evt, recheck);
        t.addEventListener('blur', recheck);
      });
    });
  }

  /* Contact form (contact.html). Demo only: nothing is sent.
     To connect it, set the form's action to your endpoint (e.g. https://formspree.io/f/yourid)
     and replace the success block below with a fetch() POST. See DOCS.md, "Forms". */
  $$('[data-contact-form]').forEach(function (form) {
    liveValidate(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateFields($$('[data-validate]', form))) return;
      var done = $('[data-form-success]', form.parentNode);
      $('[data-success-name]', done).textContent = form.elements.name.value.trim().split(' ')[0];
      $('[data-success-ref]', done).textContent = makeRef('GL');
      form.hidden = true;
      done.hidden = false;
      done.focus();
    });
    var again = $('[data-form-again]', form.parentNode);
    if (again) again.addEventListener('click', function () {
      form.reset();
      form.hidden = false;
      $('[data-form-success]', form.parentNode).hidden = true;
      form.elements[0].focus();
    });
  });

  /* ---------- Cost estimator and payment plan (pricing.html) ---------- */
  var estimator = $('[data-estimator]');
  if (estimator) initEstimator(estimator);

  function initEstimator(root) {
    var list = $('[data-est-list]', root);
    var qty = {}, members = { adult: 1, kid: 0 };
    ESTIMATE_ITEMS.forEach(function (it) { qty[it.id] = it.qty; });

    function stepper(id, label, value, max) {
      return '<div class="stepper shrink-0" role="group" aria-label="' + esc(label) + '">' +
        '<button type="button" data-dec="' + id + '" aria-label="Fewer: ' + esc(label) + '">' + ICON.minus + '</button>' +
        '<input type="number" inputmode="numeric" min="0" max="' + max + '" value="' + value + '" data-qty="' + id + '" aria-label="' + esc(label) + ', quantity">' +
        '<button type="button" data-inc="' + id + '" aria-label="More: ' + esc(label) + '">' + ICON.plus + '</button></div>';
    }
    list.innerHTML = ESTIMATE_ITEMS.map(function (it) {
      var inc = it.included ? '<span class="tag tag-mint mt-1">Included in Grin Club</span>' : '';
      return '<li class="flex items-center justify-between gap-4 py-3.5">' +
        '<div class="min-w-0"><p class="font-extrabold text-ink">' + esc(it.name) + '</p><p class="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted">' + money(it.price) + ' each ' + inc + '</p></div>' +
        stepper(it.id, it.name, it.qty, 32) + '</li>';
    }).join('');
    $('[data-est-members]', root).innerHTML =
      '<div class="flex items-center justify-between gap-4"><span class="font-bold text-ink">Adults</span>' + stepper('m-adult', 'Adults in the plan', members.adult, 8) + '</div>' +
      '<div class="flex items-center justify-between gap-4"><span class="font-bold text-ink">Kids under 14</span>' + stepper('m-kid', 'Kids in the plan', members.kid, 8) + '</div>';

    function setQty(id, v) {
      var max = id.indexOf('m-') === 0 ? 8 : 32;
      v = Math.max(0, Math.min(max, Math.round(Number(v) || 0)));
      if (id === 'm-adult') members.adult = v; else if (id === 'm-kid') members.kid = v; else qty[id] = v;
      var input = $('[data-qty="' + id + '"]', root);
      if (input && Number(input.value) !== v) input.value = v;
      $('[data-dec="' + id + '"]', root).disabled = v <= 0;
      $('[data-inc="' + id + '"]', root).disabled = v >= max;
      calc();
    }
    root.addEventListener('click', function (e) {
      var dec = e.target.closest('[data-dec]'), inc = e.target.closest('[data-inc]');
      if (dec) setQty(dec.getAttribute('data-dec'), Number($('[data-qty="' + dec.getAttribute('data-dec') + '"]', root).value) - 1);
      if (inc) setQty(inc.getAttribute('data-inc'), Number($('[data-qty="' + inc.getAttribute('data-inc') + '"]', root).value) + 1);
    });
    root.addEventListener('change', function (e) { var q = e.target.closest('[data-qty]'); if (q) setQty(q.getAttribute('data-qty'), q.value); });

    var result = { payg: 0, club: 0 };
    function calc() {
      var payg = 0, clubTreat = 0, covered = 0;
      ESTIMATE_ITEMS.forEach(function (it) {
        var n = qty[it.id] || 0;
        payg += n * it.price;
        var free = it.included ? Math.min(n, it.included.count * (it.included.per === 'kid' ? members.kid : members.adult)) : 0;
        covered += free * it.price;
        clubTreat += (n - free) * it.price * (1 - MEMBERSHIP.discount);
      });
      var fee = members.adult * MEMBERSHIP.adultYear + members.kid * MEMBERSHIP.kidYear;
      var hasClub = members.adult + members.kid > 0;
      var club = Math.round(fee + clubTreat);
      result = { payg: payg, club: hasClub ? club : payg };
      $('[data-est-payg]', root).textContent = money(payg);
      $('[data-est-club]', root).textContent = hasClub ? money(club) : '—';
      $('[data-est-fee]', root).textContent = hasClub ? money(fee) + ' membership + ' + money(Math.round(clubTreat)) + ' treatment' : 'Add at least one member';
      var save = payg - club, msg = $('[data-est-verdict]', root);
      var bestClub = hasClub && save > 0, bestPayg = !hasClub || save < 0;
      $('[data-est-best="club"]', root).hidden = !bestClub;
      $('[data-est-best="payg"]', root).hidden = !(bestPayg && payg > 0);
      if (!payg) msg.textContent = 'Add a treatment to see an estimate.';
      else if (!hasClub) msg.textContent = 'Add a member to compare with Grin Club.';
      else if (save > 0) msg.textContent = 'Grin Club would save you about ' + money(save) + ' this year.';
      else if (save < 0) msg.textContent = 'Paying as you go is about ' + money(-save) + ' cheaper for this plan.';
      else msg.textContent = 'Both options cost about the same.';
      $('[data-est-covered]', root).textContent = hasClub && covered ? money(covered) + ' of this is fully covered by the membership.' : '';
    }
    Object.keys(qty).forEach(function (id) { setQty(id, qty[id]); });
    setQty('m-adult', members.adult);
    setQty('m-kid', members.kid);

    /* Payment plan calculator: standard amortised monthly payment. Illustrative only. */
    var plan = $('[data-plan]');
    if (!plan) return;
    var amount = $('[data-plan-amount]', plan), range = $('[data-plan-range]', plan);
    function months() { var r = $('input[name="plan-term"]:checked', plan); return r ? Number(r.value) : 12; }
    function planCalc(source) {
      var a = Number(source === 'range' ? range.value : amount.value);
      var err = $('[data-plan-error]', plan);
      if (!isFinite(a) || a < FINANCE.min || a > FINANCE.max) {
        err.hidden = false;
        amount.setAttribute('aria-invalid', 'true');
        return;
      }
      err.hidden = true;
      amount.removeAttribute('aria-invalid');
      if (source === 'range') amount.value = a; else range.value = a;
      var n = months(), term = FINANCE.terms.filter(function (t) { return t.months === n; })[0] || FINANCE.terms[0];
      var r = term.apr / 100 / 12;
      var monthly = r ? a * r / (1 - Math.pow(1 + r, -n)) : a / n;
      var total = monthly * n;
      $('[data-plan-monthly]', plan).textContent = money(monthly, true);
      $('[data-plan-summary]', plan).textContent = n + ' payments · ' + (term.apr ? term.apr + '% APR (example)' : '0% APR (example)');
      $('[data-plan-total]', plan).textContent = money(total, true);
      $('[data-plan-interest]', plan).textContent = money(total - a, true);
    }
    amount.addEventListener('input', function () { planCalc('amount'); });
    range.addEventListener('input', function () { planCalc('range'); });
    $$('input[name="plan-term"]', plan).forEach(function (r) { r.addEventListener('change', function () { planCalc('amount'); }); });
    $('[data-plan-use]', plan).addEventListener('click', function () {
      var best = Math.round(Math.min(result.payg, result.club));
      if (best < FINANCE.min) { toast('Your estimate is under ' + money(FINANCE.min) + ', so no plan is needed.'); return; }
      amount.value = Math.min(best, FINANCE.max);
      planCalc('amount');
      toast('Payment plan updated with your estimate of ' + money(best) + '.');
    });
    planCalc('amount');
  }

  /* ---------- Booking flow (book.html) ----------
     Demo only: nothing is booked or sent. To take real bookings, send the request from
     step 4 to your practice-management system's booking API (or an online-booking
     widget it provides) and only show the confirmation once it replies. See DOCS.md. */
  var booking = $('[data-booking]');
  if (booking) initBooking(booking);

  function initBooking(root) {
    var params = new URLSearchParams(window.location.search);
    var state = { step: 1, reason: null, clinician: 'any', date: null, slot: null, month: null, focus: null };
    if (REASONS.hasOwnProperty(params.get('reason'))) state.reason = params.get('reason');
    var wantClinician = params.get('clinician');
    var steps = $$('[data-step]', root), indicators = $$('[data-step-indicator]', root);
    var today = practiceNow().key, lastDay = addDays(today, BOOKING.daysAhead);

    function goTo(n, focus) {
      state.step = n;
      steps.forEach(function (s) { s.hidden = Number(s.getAttribute('data-step')) !== n; });
      indicators.forEach(function (ind) {
        var i = Number(ind.getAttribute('data-step-indicator'));
        ind.setAttribute('data-state', i < n ? 'done' : i === n ? 'current' : 'todo');
        if (i === n) ind.setAttribute('aria-current', 'step'); else ind.removeAttribute('aria-current');
      });
      $('[data-booking-summary]', root).hidden = n === 5;
      $('[data-booking-next]', root).hidden = n !== 5;
      if (focus !== false) {
        var h = $('[data-step="' + n + '"] h2', root);
        if (h) h.focus({ preventScroll: true });
        var top = root.getBoundingClientRect().top + window.scrollY - 110;
        if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'auto' });
      }
    }
    function stepError(n, msg) {
      var el = $('[data-step-error="' + n + '"]', root);
      if (!el) return;
      el.hidden = !msg;
      if (msg) $('span', el).textContent = msg;
    }

    /* Summary */
    function renderSummary() {
      var r = REASONS[state.reason];
      $('[data-sum-reason]', root).textContent = r ? r.label : 'Not chosen yet';
      $('[data-sum-meta]', root).textContent = r ? r.minutes + ' minutes · ' + r.price : '';
      var who = state.slot ? state.slot.who : state.clinician;
      $('[data-sum-who]', root).textContent = who && who !== 'any' ? CLINICIANS[who].name : 'First available';
      var img = $('[data-sum-img]', root);
      if (who && who !== 'any') { img.src = CLINICIANS[who].img; img.hidden = false; } else img.hidden = true;
      $('[data-sum-when]', root).textContent = state.slot ? longDate(state.date) + ' at ' + time12(state.slot.mins) : state.date ? longDate(state.date) + ', pick a time' : 'Not chosen yet';
    }

    /* Step 1: reason */
    $$('input[name="reason"]', root).forEach(function (r) {
      r.checked = r.value === state.reason;
      r.addEventListener('change', function () {
        state.reason = r.value;
        state.slot = null;
        stepError(1, '');
        renderSummary();
      });
    });
    $('[data-next="2"]', root).addEventListener('click', function () {
      if (!state.reason) { stepError(1, 'Please choose what the visit is for.'); $('input[name="reason"]', root).focus(); return; }
      renderClinicians();
      goTo(2);
    });

    /* Step 2: clinician or first available */
    var whoList = $('[data-clinicians]', root);
    function renderClinicians() {
      var r = REASONS[state.reason];
      if (state.clinician !== 'any' && r.who.indexOf(state.clinician) === -1) state.clinician = 'any';
      var any = firstAvailable(state.reason, 'any');
      var html = option('any', 'First available', 'Any of ' + r.who.length + ' clinician' + (r.who.length === 1 ? '' : 's'), null, any ? 'Next: ' + relativeDay(any.key, today) + ', ' + time12(any.slot.mins) : 'No times in the next ' + BOOKING.daysAhead + ' days');
      r.who.forEach(function (id) {
        var c = CLINICIANS[id], f = firstAvailable(state.reason, id);
        var days = c.days.map(function (d) { return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]; }).join(', ');
        html += option(id, c.name, c.role + ' · ' + days, c.img, f ? 'Next: ' + relativeDay(f.key, today) + ', ' + time12(f.slot.mins) : 'No times in the next ' + BOOKING.daysAhead + ' days');
      });
      whoList.innerHTML = html;
      renderSummary(); // the chosen clinician may have fallen back to "First available"
      $$('input[name="clinician"]', whoList).forEach(function (input) {
        input.addEventListener('change', function () { state.clinician = input.value; state.slot = null; state.date = null; state.month = null; state.focus = null; renderSummary(); });
      });
      function option(id, title, sub, img, next) {
        var pic = img ? '<img src="' + img + '" alt="" width="56" height="56" class="size-14 shrink-0 rounded-2xl">'
          : '<span class="icon-blob size-14 bg-lemon-200 text-ink"><svg class="size-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M13 3 5.5 13.5H12L11 21l7.5-10.5H12Z"/></svg></span>';
        return '<label class="option"><input type="radio" name="clinician" value="' + id + '"' + (state.clinician === id ? ' checked' : '') + '>' +
          '<span class="option-box items-center">' + pic + '<span class="min-w-0"><span class="block font-display text-lg font-medium text-ink">' + esc(title) + '</span><span class="block text-sm text-muted">' + esc(sub) + '</span>' +
          '<span class="mt-1 block text-sm font-extrabold text-mint-700" data-next-opening>' + esc(next) + '</span></span>' +
          '<span class="option-tick" aria-hidden="true">' + ICON.check + '</span></span></label>';
      }
    }
    if (wantClinician && CLINICIANS.hasOwnProperty(wantClinician)) state.clinician = wantClinician;
    $('[data-back="1"]', root).addEventListener('click', function () { goTo(1); });
    $('[data-next="3"]', root).addEventListener('click', function () {
      if (state.date && !slotsFor(state.reason, state.clinician, state.date).length) state.date = null;
      if (!state.date) {
        var f = firstAvailable(state.reason, state.clinician);
        state.focus = f ? f.key : today;
        state.month = state.focus.slice(0, 7);
      }
      renderCalendar(false);
      renderSlots();
      goTo(3);
    });

    /* Step 3: accessible calendar (roving tabindex, arrow keys, Home/End, PageUp/PageDown) */
    var grid = $('[data-cal-grid]', root), monthLabel = $('[data-cal-month]', root);
    var prevBtn = $('[data-cal-prev]', root), nextBtn = $('[data-cal-next]', root);
    function renderCalendar(focus) {
      if (!state.focus) state.focus = state.date || today;
      if (!state.month) state.month = state.focus.slice(0, 7);
      var ym = state.month.split('-').map(Number);
      var first = keyOf(ym[0], ym[1], 1), days = new Date(Date.UTC(ym[0], ym[1], 0)).getUTCDate();
      monthLabel.textContent = dateLabel(first, { month: 'long', year: 'numeric' });
      prevBtn.disabled = state.month <= today.slice(0, 7);
      nextBtn.disabled = state.month >= lastDay.slice(0, 7);
      if (state.focus.slice(0, 7) !== state.month) {
        var pick = null;
        for (var d = 1; d <= days; d++) { var k = keyOf(ym[0], ym[1], d); if (k >= today && k <= lastDay && slotsFor(state.reason, state.clinician, k).length) { pick = k; break; } }
        state.focus = pick || (first < today ? today : first);
      }
      var html = '<tr>', cell = 0, lead = weekday(first);
      for (var i = 0; i < lead; i++, cell++) html += '<td></td>';
      for (var day = 1; day <= days; day++, cell++) {
        if (cell && cell % 7 === 0) html += '</tr><tr>';
        var key = keyOf(ym[0], ym[1], day), n = slotsFor(state.reason, state.clinician, key).length;
        var label = longDate(key) + (key === today ? ', today' : '') + (n ? ', ' + n + ' time' + (n === 1 ? '' : 's') + ' available' : ', no times available');
        html += '<td class="p-0.5"><button type="button" class="cal-day" data-date="' + key + '"' + (n ? ' data-available' : ' aria-disabled="true"') +
          (key === today ? ' data-today' : '') + ' aria-pressed="' + (key === state.date) + '" tabindex="' + (key === state.focus ? 0 : -1) + '" aria-label="' + esc(label) + '">' + day + '</button></td>';
      }
      while (cell % 7 !== 0) { html += '<td></td>'; cell++; }
      grid.innerHTML = html + '</tr>';
      if (focus) { var b = $('[data-date="' + state.focus + '"]', grid); if (b) b.focus(); }
    }
    function shiftMonth(delta) {
      var ym = state.month.split('-').map(Number), d = new Date(Date.UTC(ym[0], ym[1] - 1 + delta, 1));
      state.month = keyOf(d.getUTCFullYear(), d.getUTCMonth() + 1, 1).slice(0, 7);
      renderCalendar(false);
    }
    prevBtn.addEventListener('click', function () { shiftMonth(-1); });
    nextBtn.addEventListener('click', function () { shiftMonth(1); });
    function chooseDate(key) {
      state.date = key; state.focus = key; state.slot = null;
      stepError(3, '');
      renderCalendar(true);
      renderSlots();
      renderSummary();
    }
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-date]');
      if (b && b.getAttribute('aria-disabled') !== 'true') chooseDate(b.getAttribute('data-date'));
    });
    grid.addEventListener('keydown', function (e) {
      var b = e.target.closest('[data-date]');
      if (!b) return;
      var key = b.getAttribute('data-date'), wd = weekday(key), to = null;
      switch (e.key) {
        case 'ArrowLeft': to = addDays(key, -1); break;
        case 'ArrowRight': to = addDays(key, 1); break;
        case 'ArrowUp': to = addDays(key, -7); break;
        case 'ArrowDown': to = addDays(key, 7); break;
        case 'Home': to = addDays(key, -wd); break;
        case 'End': to = addDays(key, 6 - wd); break;
        case 'PageUp': to = addDays(key, -28); break;
        case 'PageDown': to = addDays(key, 28); break;
      }
      if (!to) return;
      e.preventDefault();
      if (to < today) to = today;
      if (to > lastDay) to = lastDay;
      state.focus = to; state.month = to.slice(0, 7);
      renderCalendar(true);
    });
    $('[data-jump-first]', root).addEventListener('click', function () {
      var f = firstAvailable(state.reason, state.clinician);
      if (!f) return;
      state.month = f.key.slice(0, 7);
      chooseDate(f.key);
      var r = $('input[name="slot"]', root);
      if (r) { r.checked = true; r.dispatchEvent(new Event('change')); r.focus(); }
    });

    function renderSlots() {
      var wrap = $('[data-slots]', root), heading = $('[data-slots-heading]', root), empty = $('[data-slots-empty]', root);
      if (!state.date) { heading.textContent = 'Choose a date to see times'; wrap.innerHTML = ''; empty.hidden = false; return; }
      var slots = slotsFor(state.reason, state.clinician, state.date);
      heading.textContent = longDate(state.date);
      empty.hidden = slots.length !== 0;
      var groups = [['Morning', 0, 720], ['Afternoon', 720, 1020], ['Evening', 1020, 1440]];
      wrap.innerHTML = groups.map(function (g) {
        var inG = slots.filter(function (s) { return s.mins >= g[1] && s.mins < g[2]; });
        if (!inG.length) return '';
        return '<fieldset class="mt-5 first:mt-0"><legend class="mb-2.5 text-sm font-extrabold tracking-wide text-muted uppercase">' + g[0] + '</legend><div class="grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-3">' +
          inG.map(function (s) {
            var sub = state.clinician === 'any' ? '<span class="slot-sub">' + esc(CLINICIANS[s.who].short) + '</span>' : '';
            var checked = state.slot && state.slot.mins === s.mins && state.slot.who === s.who;
            return '<label class="slot"><input type="radio" class="sr-only" name="slot" value="' + s.mins + '|' + s.who + '"' + (checked ? ' checked' : '') + '><span class="slot-time">' + time12(s.mins) + '</span>' + sub + '</label>';
          }).join('') + '</div></fieldset>';
      }).join('');
      $$('input[name="slot"]', wrap).forEach(function (r) {
        r.addEventListener('change', function () {
          var p = r.value.split('|');
          state.slot = { mins: Number(p[0]), who: p[1] };
          stepError(3, '');
          renderSummary();
        });
      });
    }
    $('[data-back="2"]', root).addEventListener('click', function () { goTo(2); });
    $('[data-next="4"]', root).addEventListener('click', function () {
      if (!state.slot) {
        stepError(3, state.date ? 'Please choose a time to continue.' : 'Please choose a date and a time to continue.');
        var t = state.date ? $('input[name="slot"]', root) : $('[data-date][tabindex="0"]', root);
        if (t) t.focus();
        return;
      }
      goTo(4);
    });

    /* Step 4: details */
    var form = $('[data-booking-form]', root);
    liveValidate(form);
    $('[data-back="3"]', root).addEventListener('click', function () { goTo(3); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateFields($$('[data-validate]', form))) return;
      var r = REASONS[state.reason], c = CLINICIANS[state.slot.who];
      $('[data-confirm-name]', root).textContent = form.elements.firstName.value.trim();
      $('[data-confirm-reason]', root).textContent = r.label + ' · ' + r.minutes + ' minutes';
      $('[data-confirm-when]', root).textContent = longDate(state.date) + ' at ' + time12(state.slot.mins) + ' (' + PRACTICE.zoneName + ')';
      $('[data-confirm-who]', root).textContent = c.name;
      $('[data-confirm-contact]', root).textContent = form.elements.email.value.trim() + ' · ' + form.elements.phone.value.trim();
      $('[data-confirm-img]', root).src = c.img;
      state.ref = makeRef('GL');
      $('[data-confirm-ref]', root).textContent = state.ref;
      goTo(5);
    });

    /* Step 5: confirmation with a tentative calendar file (.ics) */
    $('[data-ics]', root).addEventListener('click', function () {
      var r = REASONS[state.reason], c = CLINICIANS[state.slot.who];
      var start = wallToInstant(state.date, state.slot.mins), end = new Date(start.getTime() + r.minutes * 60000);
      var fmt = function (d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Grin Lane Dental//Booking//EN', 'CALSCALE:GREGORIAN', 'BEGIN:VEVENT',
        'UID:' + Date.now() + '@grinlanedental.example', 'DTSTAMP:' + fmt(new Date()), 'DTSTART:' + fmt(start), 'DTEND:' + fmt(end),
        'SUMMARY:' + r.label + ' at Grin Lane Dental (requested)', 'LOCATION:' + PRACTICE.address.replace(/,/g, '\\,'),
        'DESCRIPTION:With ' + c.name + '. Reference ' + state.ref + '. Requested online - the practice will confirm. Call ' + PRACTICE.phone + ' to change it.', 'STATUS:TENTATIVE', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      a.download = 'grin-lane-' + state.reason + '-' + state.date + '.ics';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
      toast('Calendar file downloaded.');
    });
    $('[data-restart]', root).addEventListener('click', function () {
      form.reset();
      $$('[aria-invalid]', form).forEach(function (f) { showError(f, ''); });
      state = { step: 1, reason: null, clinician: 'any', date: null, slot: null, month: null, focus: null };
      $$('input[name="reason"]', root).forEach(function (r) { r.checked = false; });
      renderSummary();
      goTo(1);
    });

    renderSummary();
    goTo(1, false);
  }

  /* ---------- New patient form (new-patients.html) ----------
     A multi-step form with a review screen. Demo only: nothing is sent or stored, and
     health answers are deliberately never saved to localStorage. To use it for real,
     post it to a HIPAA-eligible form service under a signed BAA (US) or a GDPR-compliant
     processor (EU/UK), or use your practice-management system's own intake forms. */
  var intake = $('[data-intake]');
  if (intake) initIntake(intake);

  function initIntake(form) {
    var panels = $$('[data-intake-step]', form), indicators = $$('[data-step-indicator]', form.parentNode);
    var total = panels.length, current = 1;
    liveValidate(form);
    function show(n, focus) {
      current = n;
      panels.forEach(function (p) { p.hidden = Number(p.getAttribute('data-intake-step')) !== n; });
      indicators.forEach(function (ind) {
        var i = Number(ind.getAttribute('data-step-indicator'));
        ind.setAttribute('data-state', i < n ? 'done' : i === n ? 'current' : 'todo');
        if (i === n) ind.setAttribute('aria-current', 'step'); else ind.removeAttribute('aria-current');
      });
      $('[data-intake-count]', form.parentNode).textContent = 'Step ' + n + ' of ' + total;
      if (n === total) renderReview();
      if (focus) {
        var h = $('[data-intake-step="' + n + '"] h3', form);
        if (h) h.focus({ preventScroll: true });
        var top = form.parentNode.getBoundingClientRect().top + window.scrollY - 110;
        if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'auto' });
      }
    }
    function stepValid(n) {
      var panel = $('[data-intake-step="' + n + '"]', form);
      var sig = $('[name="signature"]', panel);
      if (sig) sig.setAttribute('data-match-value', (form.elements.firstName.value.trim() + ' ' + form.elements.lastName.value.trim()));
      var ok = validateFields($$('[data-validate]', panel));
      var group = $('[data-check-group]', panel);
      if (ok && group) {
        var any = $$('input[type="checkbox"]', group).some(function (c) { return c.checked; });
        var err = $('[data-check-group-error]', panel);
        err.hidden = any;
        if (!any) { $('input', group).focus(); ok = false; }
      }
      return ok;
    }
    // "None of these" is exclusive with the other medical history boxes.
    $$('[data-check-group]', form).forEach(function (group) {
      var none = $('[data-none]', group), boxes = $$('input[type="checkbox"]', group);
      boxes.forEach(function (b) {
        b.addEventListener('change', function () {
          if (b === none && b.checked) boxes.forEach(function (o) { if (o !== none) o.checked = false; });
          if (b !== none && b.checked && none) none.checked = false;
          if (boxes.some(function (c) { return c.checked; })) $('[data-check-group-error]', group.closest('[data-intake-step]')).hidden = true;
        });
      });
    });
    $$('[data-intake-next]', form).forEach(function (b) { b.addEventListener('click', function () { if (stepValid(current)) show(current + 1, true); }); });
    $$('[data-intake-back]', form).forEach(function (b) { b.addEventListener('click', function () { show(current - 1, true); }); });

    function val(name) {
      var els = form.elements[name];
      if (!els) return '';
      if (els.length !== undefined && els.tagName !== 'SELECT') {
        var picked = Array.prototype.filter.call(els, function (e) { return e.checked; }).map(function (e) {
          var label = e.closest('label');
          return e.getAttribute('data-text') || (label ? label.textContent.trim() : e.value);
        });
        return picked.join(', ');
      }
      if (els.type === 'checkbox') return els.checked ? (els.getAttribute('data-text') || 'Yes') : '';
      if (els.tagName === 'SELECT') return els.value ? els.options[els.selectedIndex].text : '';
      return els.value.trim();
    }
    function renderReview() {
      var dob = val('dob');
      var rows = [
        ['About you', 1, [['Name', val('firstName') + ' ' + val('lastName')], ['Date of birth', dob ? dateLabel(dob, { month: 'long', day: 'numeric', year: 'numeric' }) : ''], ['Email', val('email')], ['Phone', val('phone')], ['Contact me by', val('contactBy')]]],
        ['Your teeth', 2, [['Main reason', val('visitReason')], ['Last dental visit', val('lastVisit')], ['Concerns', val('concerns') || 'None'], ['How nervous', val('nerves')], ['Comfort options', val('comfort') || 'None']]],
        ['Health', 3, [['Medical history', val('medical')], ['Medications', val('medicines') || 'None listed'], ['Allergies', val('allergies') || 'None listed']]],
        ['Consent', 4, [['Signed as', val('signature')], ['Text reminders', form.elements.reminders.checked ? 'Yes' : 'No']]]
      ];
      $('[data-review]', form).innerHTML = rows.map(function (sec) {
        return '<div class="rounded-3xl bg-cloud p-5"><div class="flex items-center justify-between gap-3"><h4 class="font-display text-lg font-medium text-ink">' + esc(sec[0]) + '</h4>' +
          '<button type="button" class="btn btn-ghost btn-sm" data-edit="' + sec[1] + '">Edit<span class="sr-only"> ' + esc(sec[0]) + '</span></button></div>' +
          '<dl class="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-[11rem_1fr]">' + sec[2].map(function (r) { return '<dt class="font-bold text-muted">' + esc(r[0]) + '</dt><dd class="min-w-0 text-ink [overflow-wrap:anywhere]">' + esc(r[1] || '—') + '</dd>'; }).join('') + '</dl></div>';
      }).join('');
      $$('[data-edit]', form).forEach(function (b) { b.addEventListener('click', function () { show(Number(b.getAttribute('data-edit')), true); }); });
    }
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (current !== total) { if (stepValid(current)) show(current + 1, true); return; }
      var done = $('[data-intake-done]', form.parentNode);
      $('[data-intake-name]', done).textContent = val('firstName');
      $('[data-intake-ref]', done).textContent = makeRef('GL');
      form.hidden = true;
      $('[data-intake-progress]', form.parentNode).hidden = true;
      done.hidden = false;
      done.focus();
    });
    $('[data-intake-restart]', form.parentNode).addEventListener('click', function () {
      form.reset();
      $$('[aria-invalid]', form).forEach(function (f) { showError(f, ''); });
      form.hidden = false;
      $('[data-intake-progress]', form.parentNode).hidden = false;
      $('[data-intake-done]', form.parentNode).hidden = true;
      show(1, true);
    });
    show(1, false);
  }

  /* ---------- Emergency triage (emergency.html) ---------- */
  var triage = $('[data-triage]');
  if (triage) initTriage(triage);

  function initTriage(root) {
    var stage = function (n) { $$('[data-triage-stage]', root).forEach(function (s) { s.hidden = Number(s.getAttribute('data-triage-stage')) !== n; }); };
    var symptom = null;
    function err(n, show) { $('[data-triage-error="' + n + '"]', root).hidden = !show; }
    function focusHeading(n) { var h = $('[data-triage-stage="' + n + '"] h3', root); if (h) h.focus(); }
    $$('input[name="symptom"]', root).forEach(function (r) { r.addEventListener('change', function () { err(1, false); }); });
    // "None of these" red flag is exclusive.
    var flagBoxes = $$('input[name="flag"]', root);
    flagBoxes.forEach(function (b) {
      b.addEventListener('change', function () {
        err(2, false);
        if (b.value === 'none' && b.checked) flagBoxes.forEach(function (o) { if (o !== b) o.checked = false; });
        if (b.value !== 'none' && b.checked) flagBoxes.forEach(function (o) { if (o.value === 'none') o.checked = false; });
      });
    });
    $('[data-triage-next="2"]', root).addEventListener('click', function () {
      var picked = $('input[name="symptom"]:checked', root);
      if (!picked) { err(1, true); $('input[name="symptom"]', root).focus(); return; }
      symptom = picked.value;
      stage(2); focusHeading(2);
    });
    $('[data-triage-next="3"]', root).addEventListener('click', function () {
      var flags = flagBoxes.filter(function (b) { return b.checked; }).map(function (b) { return b.value; });
      if (!flags.length) { err(2, true); flagBoxes[0].focus(); return; }
      var level = null;
      flags.forEach(function (f) { var l = TRIAGE.flags[f]; if (l === '911') level = '911'; else if (l === 'call' && level !== '911') level = 'call'; });
      var s = TRIAGE.symptoms[symptom];
      if (level || !s.ask) { result(level || s.outcome); return; }
      $('[data-triage-question]', root).textContent = s.ask;
      $$('input[name="severity"]', root).forEach(function (r) { r.checked = false; });
      stage(3); focusHeading(3);
    });
    $('[data-triage-next="4"]', root).addEventListener('click', function () {
      var a = $('input[name="severity"]:checked', root);
      if (!a) { err(3, true); $('input[name="severity"]', root).focus(); return; }
      var s = TRIAGE.symptoms[symptom];
      result(a.value === 'yes' ? s.yes : s.no);
    });
    $$('input[name="severity"]', root).forEach(function (r) { r.addEventListener('change', function () { err(3, false); }); });
    $$('[data-triage-back]', root).forEach(function (b) {
      b.addEventListener('click', function () { var n = Number(b.getAttribute('data-triage-back')); stage(n); focusHeading(n); });
    });
    function result(level) {
      var o = TRIAGE.outcomes[level], box = $('[data-triage-result]', root);
      box.setAttribute('data-level', level);
      $('[data-outcome-title]', box).textContent = o.title;
      $('[data-outcome-lead]', box).textContent = o.lead;
      $('[data-outcome-symptom]', box).textContent = 'You told us: ' + TRIAGE.symptoms[symptom].label.toLowerCase() + '.';
      var steps = level === '911' ? o.steps : o.steps.concat(TRIAGE.symptoms[symptom].tip);
      $('[data-outcome-steps]', box).innerHTML = steps.map(function (s) { return '<li class="flex gap-3"><span class="mt-1 grid size-5 shrink-0 place-items-center rounded-full bg-white text-ink">' + ICON.check + '</span><span>' + esc(s) + '</span></li>'; }).join('');
      $$('[data-outcome-cta]', box).forEach(function (c) { c.hidden = c.getAttribute('data-outcome-cta').split(' ').indexOf(level) === -1; });
      stage(4); focusHeading(4);
    }
    $('[data-triage-restart]', root).addEventListener('click', function () {
      $$('input', root).forEach(function (i) { i.checked = false; });
      symptom = null;
      stage(1); focusHeading(1);
    });
  }
})();

/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. Mark your own UI with data-back-to-top-avoid (lift
   above it) or data-back-to-top-hide (hide while covering it). To remove the
   button: delete this block and the .back-to-top styles in src/input.css. */
(function () {
  'use strict';
  if (document.querySelector('.back-to-top')) return;

  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.title = 'Back to top';
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var AVOID = '[data-toast], .toast, [data-back-to-top-avoid]';
  var queued = false;

  function isShown(el) {
    var cs = window.getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05;
  }
  function lift() {
    var offset = 0, vw = window.innerWidth, vh = window.innerHeight;
    Array.prototype.forEach.call(document.querySelectorAll(AVOID), function (el) {
      if (!isShown(el)) return;
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.bottom > vh - 140 && r.right > vw - 96 && r.top < vh) offset = Math.max(offset, vh - r.top + 4);
    });
    btn.style.setProperty('--btt-lift', offset + 'px');
  }
  function coversHideZone() {
    var b = btn.getBoundingClientRect();
    return Array.prototype.some.call(document.querySelectorAll('[data-back-to-top-hide]'), function (el) {
      var pos = window.getComputedStyle(el).position;
      if (pos !== 'sticky' && pos !== 'fixed') return false;
      var r = el.getBoundingClientRect();
      return r.width > 0 && r.left < b.right && r.right > b.left && r.top < b.bottom && r.bottom > b.top;
    });
  }
  function update() {
    queued = false;
    lift();
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !coversHideZone());
  }
  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();

  function focusTop() {
    var target = document.getElementById('main') || document.querySelector('main');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus({ preventScroll: true });
  }
  btn.addEventListener('click', function () {
    if (reduceMotion.matches) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      focusTop();
      return;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
