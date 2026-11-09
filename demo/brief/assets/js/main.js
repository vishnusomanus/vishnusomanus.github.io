/* Brief (Pennington Employment Law) — site scripts. Vanilla JavaScript, no dependencies. */
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

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ---------- Matters and fees ----------
     Used by the fee estimator (fees.html), the options check results (check.html) and the
     booking topics (book.html). Prices are in US dollars. Each matter has three
     levels: [min, max]. When min and max are equal the fee is fixed.
     Keep these in step with the fee table in fees.html and the cards in services.html. */
  var MATTERS = {
    settlement: { name: 'Severance agreement review', area: 'Leaving a job', timeline: '2–5 business days', contribution: true, levels: [[750, 750], [950, 950], [1250, 1950]],
      hints: ['Standard terms, no changes needed', 'One round of changes to the wording', 'Negotiating the payment, or equity and bonus terms'] },
    redundancy: { name: 'Layoff check', area: 'Leaving a job', timeline: '1–2 weeks', contribution: false, levels: [[495, 495], [695, 695], [1000, 1400]],
      hints: ['Checking the letters and the pay', 'Plus your selection criteria and a response', 'Mass layoff, or enhanced severance terms'] },
    exit: { name: 'Exit negotiation', area: 'Leaving a job', timeline: '2–6 weeks', contribution: true, levels: [[1500, 1500], [2500, 3000], [4000, 6500]],
      hints: ['One proposal and one response', 'A few rounds of negotiation', 'Senior role, attorneys on both sides'] },
    grievance: { name: 'HR complaint or disciplinary support', area: 'Problems at work', timeline: '1–3 weeks', contribution: false, levels: [[595, 595], [995, 995], [1500, 2500]],
      hints: ['Help with one letter or one meeting', 'The full process, up to the outcome', 'Several allegations, plus an appeal'] },
    discrimination: { name: 'Discrimination or harassment advice', area: 'Problems at work', timeline: 'Initial advice within a week', contribution: false, levels: [[750, 750], [1250, 1250], [1950, 3500]],
      hints: ['Initial advice on what happened', 'Advice plus a written complaint', 'A long history, several people involved'] },
    dismissal: { name: 'Wrongful termination or constructive discharge advice', area: 'Claims and disputes', timeline: 'Advice within 5 business days', contribution: false, levels: [[595, 595], [950, 950], [1500, 2500]],
      hints: ['Initial advice on your position', 'Advice plus an appeal letter', 'Complex facts, or several possible claims'] },
    tribunal: { name: 'Employment lawsuit', area: 'Claims and disputes', timeline: 'Often 18–30 months to trial', contribution: false, levels: [[7500, 12500], [15000, 25000], [30000, 50000]],
      hints: ['One claim, settles before the hearing', 'Several claims, or a short hearing', 'A multi-day hearing with witnesses'] },
    contract: { name: 'Contract or restrictive covenant review', area: 'Starting a new job', timeline: '2–3 business days', contribution: false, levels: [[395, 395], [595, 595], [950, 1400]],
      hints: ['A standard employment contract', 'Plus bonus, equity or a non-compete', 'Senior contract with negotiation'] }
  };
  var LEVELS = ['straightforward', 'standard', 'complex'];
  var PLAN = { minFee: 1000, months: 3 }; // Payment plans: fees from $1,000, split into equal monthly payments.

  /* ---------- Options check (check.html) ----------
     A branching questionnaire. Each step has a question and options; an option either leads
     to another step (next) or to a result (result). Results are general information only. */
  var CHECK_STEPS = {
    start: { q: 'What’s happening at work?', hint: 'Choose the one that fits best. You can go back at any point.', options: [
      { label: 'I’ve been offered a severance agreement', next: 'settle-when' },
      { label: 'I’ve been fired, or told I will be', next: 'dismiss-service' },
      { label: 'I’m thinking of resigning because of how I’ve been treated', next: 'resign-grievance' },
      { label: 'I’m being treated unfairly, bullied or harassed', next: 'treat-why' },
      { label: 'I’m at risk of a layoff', next: 'redundancy-stage' },
      { label: 'I have a disciplinary or HR meeting coming up', next: 'meeting-when' },
      { label: 'Something else, or I’m not sure', result: 'general' }] },
    'settle-when': { q: 'When have you been asked to sign by?', hint: 'Look for a date in the cover letter or email.', options: [
      { label: 'Within the next 7 days', result: 'settle-urgent' },
      { label: 'More than a week away', result: 'settle' },
      { label: 'No date has been given', result: 'settle' }] },
    'dismiss-service': { q: 'Do you have a written employment contract or a union agreement?', hint: 'Most Ohio jobs are “at will,” which means they can end for almost any reason that isn’t illegal. A contract or union agreement can change that.', options: [
      { label: 'No, I think my job is at will', next: 'dismiss-reason-short' },
      { label: 'Yes, I have one or the other', next: 'dismiss-reason-long' },
      { label: 'I’m not sure', next: 'dismiss-reason-long' }] },
    'dismiss-reason-short': { q: 'Do you think the reason was linked to any of these?', hint: 'Pregnancy or parental leave, a disability, your race, color, sex, age, religion, national origin or sexual orientation, reporting wrongdoing (whistleblowing), or asking for a legal right such as overtime or medical leave.', options: [
      { label: 'Yes', result: 'dismiss-protected' },
      { label: 'Possibly, I’m not sure', result: 'dismiss-protected' },
      { label: 'No', result: 'dismiss-short' }] },
    'dismiss-reason-long': { q: 'Do you think the reason was linked to any of these?', hint: 'Pregnancy or parental leave, a disability, your race, color, sex, age, religion, national origin or sexual orientation, reporting wrongdoing (whistleblowing), or asking for a legal right such as overtime or medical leave.', options: [
      { label: 'Yes', result: 'dismiss-protected' },
      { label: 'Possibly, I’m not sure', result: 'dismiss-protected' },
      { label: 'No', result: 'dismiss-unfair' }] },
    'resign-grievance': { q: 'Have you made a formal complaint about it?', hint: 'A formal complaint is one you put in writing to HR, or under your employer’s complaint policy.', options: [
      { label: 'Not yet', result: 'resign-before' },
      { label: 'Yes, and it hasn’t resolved things', result: 'resign-after' },
      { label: 'I’ve already resigned', result: 'resigned' }] },
    'treat-why': { q: 'Do you think it’s linked to who you are, or to something you reported?', hint: 'For example a disability, pregnancy, race, sex, age, religion, national origin or sexual orientation, or because you reported wrongdoing.', options: [
      { label: 'Yes, I think so', result: 'discrimination' },
      { label: 'I’m not sure', result: 'discrimination' },
      { label: 'No, it’s more general bullying or poor management', result: 'bullying' }] },
    'redundancy-stage': { q: 'Where are you in the process?', hint: '', options: [
      { label: 'I’ve been told I’m at risk, or layoffs have been announced', result: 'redundancy-consult' },
      { label: 'I’ve been given a layoff notice', result: 'redundancy-notice' },
      { label: 'I’ve been offered a severance agreement', result: 'settle' }] },
    'meeting-when': { q: 'When is the meeting?', hint: '', options: [
      { label: 'In the next three business days', result: 'meeting-urgent' },
      { label: 'Later than that', result: 'meeting' },
      { label: 'No date yet', result: 'meeting' }] }
  };
  var CHECK_RESULTS = {
    'settle-urgent': { tag: 'Severance agreement', title: 'Get advice before you sign, and ask for more time if you need it', urgent: 'You’re on a short deadline. It’s normal, and usually fine, to ask your employer for a few more days so you can get advice. If you’re 40 or older, federal law generally gives you at least 21 days to consider a release of age claims.',
      summary: 'A severance agreement usually means giving up the right to bring claims in exchange for a payment. No law requires you to have an attorney, but once you sign it’s hard to undo, so independent advice is worth having first.',
      steps: ['Don’t sign anything yet, and don’t resign.', 'Ask whether your employer will contribute to legal fees.', 'Gather your contract, recent pay stubs and any letters about why you’re leaving.', 'Book a call: most reviews are finished within two to five business days.'], service: 'settlement', deadline: null },
    settle: { tag: 'Severance agreement', title: 'Get independent advice before you sign', urgent: null,
      summary: 'A severance agreement usually means giving up the right to bring claims in exchange for a payment. No law requires you to have an attorney, but once you sign it’s hard to undo, so independent advice is worth having first.',
      steps: ['Don’t sign anything yet, and don’t resign.', 'Ask whether your employer will contribute to legal fees.', 'Gather your contract, recent pay stubs and any letters about why you’re leaving.', 'Think about what matters to you: the money, the reference, the leaving date.'], service: 'settlement', deadline: null },
    'dismiss-short': { tag: 'Termination', title: 'You may still have options, even in an at-will job', urgent: null,
      summary: 'Most Ohio jobs are at will, so an employer can usually end them without giving a reason, but not for an illegal one. You may also have claims for unpaid wages, earned commissions or vacation pay your employer’s policy promises.',
      steps: ['Check you’ve been paid your final wages, plus any vacation pay your employer’s policy promises.', 'If you’re offered an appeal, consider using it, and note its deadline.', 'Write down the dates and what was said while it’s fresh.', 'Use the deadline calculator: claims have time limits.'], service: 'dismissal', deadline: 'dismissal' },
    'dismiss-unfair': { tag: 'Termination', title: 'You may be able to challenge your firing', urgent: null,
      summary: 'If you have a contract or union agreement, your employer may need a good reason or a set process to let you go. Whether that was followed depends on the details, so it’s worth having someone look at the letters and the timeline.',
      steps: ['Appeal internally if you’re offered an appeal, and keep to its deadline.', 'Keep copies of your contract, termination letter, meeting notes and pay stubs.', 'Note the date you were told and your last day: time limits can run from either.', 'If you’re in a union, ask your representative about the grievance deadline right away.'], service: 'dismissal', deadline: 'dismissal' },
    'dismiss-protected': { tag: 'Termination', title: 'This could be more than an ordinary firing', urgent: null,
      summary: 'If a firing is linked to discrimination, pregnancy, whistleblowing or asking for a legal right, it may be illegal even in an at-will job, and there’s usually no minimum length of service. These claims depend on evidence, so early advice helps.',
      steps: ['Write a timeline: what happened, when, and who was involved.', 'Keep emails, messages and documents you’re entitled to keep.', 'Check the time limit, and don’t wait for an appeal to finish before getting advice.', 'Book a call to talk through what you have.'], service: 'discrimination', deadline: 'dismissal' },
    'resign-before': { tag: 'Thinking of resigning', title: 'Pause before you resign', urgent: null,
      summary: 'Quitting because your employer made working conditions intolerable can sometimes count as being fired, called constructive discharge. These claims are hard to win and timing matters, so get advice before you give notice.',
      steps: ['If you can, don’t resign until you’ve had advice.', 'Consider making a formal complaint in writing: it puts the problem on record.', 'Keep a record of incidents and copies of relevant messages.', 'Think about the outcome you want: to stay, or to leave on fair terms.'], service: 'dismissal', deadline: null },
    'resign-after': { tag: 'Thinking of resigning', title: 'You have options other than simply resigning', urgent: null,
      summary: 'If a complaint hasn’t resolved things, you might escalate it, negotiate an exit or, in some cases, resign and claim constructive discharge. Each has different risks, and the order you do things in matters.',
      steps: ['Check whether you can still appeal or escalate the outcome.', 'Don’t resign before getting advice on timing and wording.', 'Gather the complaint, the outcome letter and your notes.', 'Ask about an exit negotiation: it can lead to a settlement without a claim.'], service: 'exit', deadline: null },
    resigned: { tag: 'Already resigned', title: 'Act quickly: a time limit may already be running', urgent: 'Time limits for constructive discharge can start when you give notice, not just on your last day.',
      summary: 'If you resigned because of how you were treated, you may have a constructive discharge claim. Whether you do depends on what happened and how you resigned.',
      steps: ['Note the exact date you gave notice, and your last day.', 'Keep your resignation letter and anything explaining why you left.', 'Use the deadline calculator for a rough date.', 'Get advice soon, especially if the date is close.'], service: 'dismissal', deadline: 'dismissal' },
    discrimination: { tag: 'Discrimination or harassment', title: 'You may be protected by civil rights laws', urgent: null,
      summary: 'Federal and Ohio civil rights laws protect people at work from discrimination, harassment and retaliation linked to traits such as race, sex, age and disability. There’s no minimum length of service, but coverage can depend on your employer’s size, and an EEOC charge usually has to be filed within 300 days of the last incident.',
      steps: ['Write down what happened, when, who was there and how it affected you.', 'Keep copies of emails, messages and documents you’re entitled to keep.', 'Consider making a written complaint to HR.', 'Check the time limit, counting from the most recent incident.'], service: 'discrimination', deadline: 'discrimination' },
    bullying: { tag: 'Treatment at work', title: 'Start by putting it in writing', urgent: null,
      summary: 'There’s generally no standalone legal claim for bullying, but it can still break your employer’s own policies, and it can overlap with discrimination or safety rules. A written complaint to HR is usually the first step.',
      steps: ['Read your employer’s complaint and anti-harassment policies.', 'Keep a record of incidents with dates and witnesses.', 'Make a written complaint: stick to the facts and say what outcome you want.', 'If it’s affecting your health, speak to your doctor and keep the records.'], service: 'grievance', deadline: null },
    'redundancy-consult': { tag: 'Layoffs', title: 'Use the time before a layoff to ask questions', urgent: null,
      summary: 'Most employers don’t have to consult you, but you can still ask how people were selected, suggest alternatives and ask about other roles. What you say now can change the outcome, and builds a record if things go wrong later.',
      steps: ['Ask for the selection criteria and your own scores in writing.', 'Ask about other open jobs at the company.', 'Ask whether there’s a severance plan, and how it counts your service and pay.', 'Keep notes of every meeting about the layoff.'], service: 'redundancy', deadline: null },
    'redundancy-notice': { tag: 'Layoffs', title: 'Check the process and the money before it’s final', urgent: null,
      summary: 'Once you’ve been given notice, it’s worth checking your severance, notice and vacation pay. Larger employers can owe 60 days’ written notice of a mass layoff, and if the selection was discriminatory, you may have a claim.',
      steps: ['Check any signing or response deadline in your letter.', 'Check any severance your employer’s plan or your contract promises.', 'Note the date you were told and your last day: time limits can run from either.', 'Ask for any severance offer in writing before agreeing to anything.'], service: 'redundancy', deadline: 'dismissal' },
    'meeting-urgent': { tag: 'Upcoming meeting', title: 'Prepare now, and ask to bring someone with you', urgent: 'Your meeting is close. It’s reasonable to ask for a short delay so you can prepare, though your employer doesn’t have to agree.',
      summary: 'If you’re in a union, you can usually ask for a representative at a meeting that could lead to discipline. If not, you can still ask to bring someone, though your employer can say no. Going in with a short written statement and your key documents makes a real difference.',
      steps: ['Read the invitation letter and any evidence you’ve been sent.', 'Ask for your union representative, or ask whether a colleague can come.', 'Write a one-page summary of your points and the outcome you want.', 'Ask for a copy of the meeting notes afterward.'], service: 'grievance', deadline: null },
    meeting: { tag: 'Upcoming meeting', title: 'Prepare well, and ask to bring someone with you', urgent: null,
      summary: 'If you’re in a union, you can usually ask for a representative at a meeting that could lead to discipline. If not, you can still ask to bring someone, though your employer can say no. Going in with a short written statement and your key documents makes a real difference.',
      steps: ['Read the invitation letter and any evidence you’ve been sent.', 'Ask for your union representative, or ask whether a colleague can come.', 'Write a one-page summary of your points and the outcome you want.', 'Ask for a copy of the meeting notes afterward.'], service: 'grievance', deadline: null },
    general: { tag: 'Something else', title: 'Let’s talk it through', urgent: null,
      summary: 'Employment problems don’t always fit a box. A free 15-minute call is the quickest way to find out where you stand and whether there’s a deadline to watch.',
      steps: ['Jot down the key dates and what has happened so far.', 'Have your contract and any recent letters handy.', 'Book a free call at a time that works for you.'], service: null, deadline: null }
  };
  var CHECK_KEY = 'brief-check-v1';

  /* ---------- Deadline calculator (check.html) ----------
     In Ohio, an EEOC charge generally has to be filed within 300 days of the event (days), and a
     charge with the Ohio Civil Rights Commission within two years (months). Federal unpaid wage
     claims have two years, or three if the violation was willful. This is an estimate only. */
  var DEADLINE_RULES = {
    dismissal: { label: 'Firing linked to discrimination or retaliation', from: 'the date you were told your job was ending', days: 300 },
    discrimination: { label: 'Discrimination or harassment', from: 'the date of the most recent incident', days: 300 },
    wages: { label: 'Unpaid wages or overtime', from: 'the date of the last underpayment', months: 24 },
    'redundancy-pay': { label: 'Ohio Civil Rights Commission charge', from: 'the date of the most recent incident', months: 24 }
  };

  /* ---------- Booking (book.html) ----------
     Call types and availability. Slots are generated in Eastern time (America/New_York). Nothing is
     booked: see DOCS.md, "Booking flow", to connect Cal.com, Calendly or a form service. */
  var CALL_TYPES = {
    intro: { label: 'Free 15-minute call', minutes: 15, price: 'Free', where: 'Phone or video' },
    advice: { label: 'Fixed-fee advice session', minutes: 60, price: '$400', where: 'Video or the Dayton office' },
    settlement: { label: 'Severance agreement appointment', minutes: 45, price: '$750, some employers contribute', where: 'Video or the Dayton office' }
  };
  var AVAILABILITY = {
    timeZone: 'America/New_York',
    zoneName: 'Eastern time',
    // Day 0 is Sunday. Each window is [start, end] in 24-hour "HH:MM" Eastern time.
    hours: {
      1: [['09:00', '12:30'], ['13:30', '17:30']],
      2: [['09:00', '12:30'], ['13:30', '17:30']],
      3: [['09:00', '12:30'], ['13:30', '17:30']],
      4: [['09:00', '12:30'], ['13:30', '17:30'], ['18:00', '19:30']],
      5: [['09:00', '12:30'], ['13:30', '16:00']]
    },
    slotStep: 30,          // minutes between start times
    minNoticeHours: 3,     // earliest bookable slot from now
    daysAhead: 30,         // how far ahead people can book
    closed: [],            // one-off closures ("YYYY-MM-DD"); US federal holidays are closed by rule, see federalHolidays()
    demoBusyShare: 0.4     // share of slots shown as already taken, so the demo looks realistic. Set to 0 when connected.
  };

  /* ---------- Small helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function readJSON(key) { try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; } }
  function writeJSON(key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }
  function removeKey(key) { try { safeStorage.removeItem(key); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // A short reference for confirmations, like PE-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', ref = 'PE-';
    for (var i = 0; i < 4; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
    return ref;
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function money(n) {
    var whole = Math.abs(n - Math.round(n)) < 0.005;
    return '$' + (whole ? Math.round(n) : n).toLocaleString('en-US', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: whole ? 0 : 2 });
  }
  function moneyRange(min, max) { return Math.abs(min - max) < 0.005 ? money(min) : money(min) + '–' + money(max); }
  function setParams(params) {
    if (!window.history || !history.replaceState) return;
    var url = new URL(window.location.href);
    Object.keys(params).forEach(function (k) { if (params[k] === null || params[k] === '') url.searchParams.delete(k); else url.searchParams.set(k, params[k]); });
    history.replaceState(null, '', url.pathname + url.search + url.hash);
  }
  /* Calendar dates are handled as "YYYY-MM-DD" keys, with UTC math so time zones never shift a day. */
  function keyOf(y, m, d) { return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); }
  function parseKey(key) { var d = key.split('-').map(Number); return new Date(Date.UTC(d[0], d[1] - 1, d[2])); }
  function keyFromDate(x) { return keyOf(x.getUTCFullYear(), x.getUTCMonth() + 1, x.getUTCDate()); }
  function addDays(key, n) { var x = parseKey(key); x.setUTCDate(x.getUTCDate() + n); return keyFromDate(x); }
  function daysBetween(a, b) { return Math.round((parseKey(b) - parseKey(a)) / 86400000); }
  function weekday(key) { return parseKey(key).getUTCDay(); }
  function longDate(key) { return new Date(parseKey(key).getTime() + 43200000).toLocaleDateString('en-US', { timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }); }
  function localToday() { var n = new Date(); return keyOf(n.getFullYear(), n.getMonth() + 1, n.getDate()); }
  /* US federal holidays for any year, by rule. A holiday on a Saturday is observed on the Friday before,
     one on a Sunday on the Monday after, so New Year's Day can fall in the year before. */
  function federalHolidays(year) {
    var nth = function (month, wd, n) { var first = new Date(Date.UTC(year, month, 1)).getUTCDay(); return keyOf(year, month + 1, 1 + ((wd - first + 7) % 7) + (n - 1) * 7); };
    var last = function (month, wd) { var d = new Date(Date.UTC(year, month + 1, 0)); return keyOf(year, month + 1, d.getUTCDate() - ((d.getUTCDay() - wd + 7) % 7)); };
    var fixed = function (month, day) { var d = new Date(Date.UTC(year, month, day)), w = d.getUTCDay(); if (w === 6) d.setUTCDate(day - 1); else if (w === 0) d.setUTCDate(day + 1); return keyFromDate(d); };
    return [fixed(0, 1), nth(0, 1, 3), nth(1, 1, 3), last(4, 1), fixed(5, 19), fixed(6, 4), nth(8, 1, 1), nth(9, 1, 2), fixed(10, 11), nth(10, 4, 4), fixed(11, 25)];
  }
  function isClosedDay(key) {
    var y = Number(key.slice(0, 4));
    return AVAILABILITY.closed.indexOf(key) !== -1 || federalHolidays(y).indexOf(key) !== -1 || federalHolidays(y + 1).indexOf(key) !== -1;
  }
  var ICON = {
    check: '<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
    alert: '<svg class="size-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5.5M12 16v.01"/></svg>',
    arrow: '<svg class="arrow size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>'
  };

  /* ---------- Header: border on scroll + mobile menu ---------- */
  var header = document.getElementById('site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  var menuBtn = document.getElementById('menu-button');
  var menu = document.getElementById('mobile-menu');
  if (menuBtn && menu) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('hidden', !open);
      $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
      $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
    };
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  /* ---------- Scroll reveal ----------
     .reveal fades in. Everything above an element that becomes visible is revealed too,
     so fast jumps (End key, anchors) never leave hidden content behind. */
  var reveals = $$('.reveal');
  function revealAll() { reveals.forEach(function (el) { el.classList.add('is-visible'); }); }
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealAll();
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = reveals.indexOf(entry.target);
        reveals.slice(0, index + 1).forEach(function (el) { el.classList.add('is-visible'); io.unobserve(el); });
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  }

  /* ---------- Accordion (.acc-btn controls the panel named in aria-controls) ---------- */
  $$('.acc-btn').forEach(function (btn) {
    var panel = document.getElementById(btn.getAttribute('aria-controls'));
    if (!panel) return;
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
    });
  });

  /* ---------- Filters ([data-filter-root], services.html) ----------
     Chips with data-filter="value" show items whose data-tags contain the value ("all" shows everything).
     The choice is kept in the URL (?area= on the services page) so it can be shared. */
  $$('[data-filter-root]').forEach(function (root) {
    var param = root.getAttribute('data-filter-param') || 'type';
    var chips = $$('[data-filter]', root);
    var items = $$('[data-tags]', root);
    var count = $('[data-filter-count]', root);
    var empty = $('[data-filter-empty]', root);
    var noun = root.getAttribute('data-filter-noun') || 'item';
    var many = root.getAttribute('data-filter-plural') || noun + 's';
    function matches(it, v) { return v === 'all' || it.getAttribute('data-tags').split(' ').indexOf(v) !== -1; }
    chips.forEach(function (chip) {
      var c = $('.chip-count', chip);
      if (c) c.textContent = items.filter(function (it) { return matches(it, chip.getAttribute('data-filter')); }).length;
    });
    function apply(value, push) {
      if (!chips.some(function (c) { return c.getAttribute('data-filter') === value; })) value = 'all';
      var shown = 0;
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === value)); });
      items.forEach(function (it) { var ok = matches(it, value); it.hidden = !ok; if (ok) shown++; });
      if (count) count.textContent = plural(shown, noun, many);
      if (empty) empty.hidden = shown !== 0;
      if (push) { var p = {}; p[param] = value === 'all' ? null : value; setParams(p); }
    }
    chips.forEach(function (chip) { chip.addEventListener('click', function () { apply(chip.getAttribute('data-filter'), true); }); });
    $$('[data-filter-reset]', root).forEach(function (b) { b.addEventListener('click', function () { apply('all', true); chips[0].focus(); }); });
    apply(new URLSearchParams(window.location.search).get(param) || 'all', false);
  });

  /* ---------- Guides: search + topic filter (resources.html) ----------
     Each guide has data-guide, data-tags (space separated) and data-text (extra search words).
     The search box and the topic chips combine; both are kept in the URL as ?q= and ?tag=. */
  var guides = $('[data-guides]');
  if (guides) {
    var gItems = $$('[data-guide]', guides);
    var gChips = $$('[data-tag]', guides);
    var gSearch = $('[data-guide-search]', guides);
    var gCount = $('[data-guide-count]', guides);
    var gEmpty = $('[data-guide-empty]', guides);
    var gState = { tag: 'all', q: '' };
    var textOf = function (it) { return (it.textContent + ' ' + (it.getAttribute('data-text') || '')).toLowerCase().replace(/\s+/g, ' '); };
    gChips.forEach(function (chip) {
      var t = chip.getAttribute('data-tag'), c = $('.chip-count', chip);
      if (c) c.textContent = t === 'all' ? gItems.length : gItems.filter(function (it) { return it.getAttribute('data-tags').split(' ').indexOf(t) !== -1; }).length;
    });
    var applyGuides = function (push) {
      var words = gState.q.toLowerCase().split(/\s+/).filter(Boolean), shown = 0;
      if (!gChips.some(function (c) { return c.getAttribute('data-tag') === gState.tag; })) gState.tag = 'all';
      gChips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-tag') === gState.tag)); });
      gItems.forEach(function (it) {
        var text = textOf(it);
        var ok = (gState.tag === 'all' || it.getAttribute('data-tags').split(' ').indexOf(gState.tag) !== -1) &&
          words.every(function (w) { return text.indexOf(w) !== -1; });
        it.hidden = !ok;
        if (ok) shown++;
      });
      gCount.textContent = plural(shown, 'guide');
      gEmpty.hidden = shown !== 0;
      if (push) setParams({ tag: gState.tag === 'all' ? null : gState.tag, q: gState.q.trim() || null });
    };
    gChips.forEach(function (chip) { chip.addEventListener('click', function () { gState.tag = chip.getAttribute('data-tag'); applyGuides(true); }); });
    gSearch.addEventListener('input', function () { gState.q = gSearch.value; applyGuides(true); });
    $('[data-guide-form]', guides).addEventListener('submit', function (e) { e.preventDefault(); });
    $('[data-guide-reset]', guides).addEventListener('click', function () { gState = { tag: 'all', q: '' }; gSearch.value = ''; applyGuides(true); gSearch.focus(); });
    var gp = new URLSearchParams(window.location.search);
    gState.tag = gp.get('tag') || 'all';
    gState.q = gp.get('q') || '';
    gSearch.value = gState.q;
    applyGuides(false);
  }

  /* ---------- Form validation ----------
     Fields with data-validate are checked on submit and again as the visitor fixes them.
     Values: required, email, phone-optional, message (20+ characters), consent (checkbox), date-past. */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function fieldMessage(field) {
    var type = field.getAttribute('data-validate');
    var v = (field.value || '').trim();
    if (field.type === 'checkbox') return field.required && !field.checked ? 'Please check this box to continue.' : '';
    if (field.required && !v) return field.tagName === 'SELECT' ? 'Please choose an option.' : field.type === 'date' ? 'Please enter a date.' : 'Please fill in this field.';
    if (type === 'email' && v && !EMAIL.test(v)) return 'Please enter an email address like name@example.com.';
    if (type === 'phone-optional' && v && v.replace(/\D/g, '').length < 10) return 'Please enter a US phone number, or leave this blank.';
    if (type === 'message' && v.length < 20) return 'A sentence or two (20+ characters) helps me prepare.';
    if (type === 'date-event' && v) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || isNaN(parseKey(v).getTime())) return 'Please enter a valid date.';
      if (daysBetween(v, localToday()) > 730) return 'Please enter a date within the last two years.';
      if (daysBetween(localToday(), v) > 180) return 'Please enter a date within the next six months.';
    }
    return '';
  }
  function showError(field, msg) {
    var id = field.id + '-error';
    var err = document.getElementById(id);
    var wrap = field.closest('[data-field]') || field.parentNode;
    if (msg) {
      if (!err) {
        err = document.createElement('p');
        err.id = id;
        err.className = 'field-error';
        wrap.appendChild(err);
      }
      err.innerHTML = ICON.alert + '<span>' + esc(msg) + '</span>';
      field.setAttribute('aria-invalid', 'true');
      var described = (field.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
      if (described.indexOf(id) === -1) described.push(id);
      field.setAttribute('aria-describedby', described.join(' '));
    } else {
      if (err) err.remove();
      field.removeAttribute('aria-invalid');
      var rest = (field.getAttribute('aria-describedby') || '').split(' ').filter(function (x) { return x && x !== id; });
      if (rest.length) field.setAttribute('aria-describedby', rest.join(' ')); else field.removeAttribute('aria-describedby');
    }
  }
  function validateForm(form) {
    var first = null;
    $$('[data-validate]', form).forEach(function (field) {
      var msg = fieldMessage(field);
      showError(field, msg);
      if (msg && !first) first = field;
    });
    if (first) first.focus();
    return !first;
  }
  function liveValidate(form) {
    $$('[data-validate]', form).forEach(function (field) {
      var evt = field.type === 'checkbox' || field.tagName === 'SELECT' ? 'change' : 'input';
      field.addEventListener(evt, function () { if (field.getAttribute('aria-invalid') === 'true') showError(field, fieldMessage(field)); });
      field.addEventListener('blur', function () { if (field.getAttribute('aria-invalid') === 'true') showError(field, fieldMessage(field)); });
    });
  }

  /* ---------- Fee estimator ([data-estimator], fees.html) ----------
     Reads MATTERS. The matter and level are kept in the URL (?matter=settlement&level=standard). */
  var est = $('[data-estimator]');
  if (est) initEstimator(est);

  function initEstimator(root) {
    var matterSel = $('[data-est-matter]', root);
    $('[data-est-form]', root).addEventListener('submit', function (e) { e.preventDefault(); });
    var planBox = $('[data-est-plan]', root);
    var contribWrap = $('[data-est-contrib-wrap]', root);
    var contribBox = $('[data-est-contrib]', root);
    var contribAmount = $('[data-est-contrib-amount]', root);
    var contribField = $('[data-est-contrib-field]', root);
    matterSel.innerHTML = Object.keys(MATTERS).map(function (k) { return '<option value="' + k + '">' + esc(MATTERS[k].name) + '</option>'; }).join('');
    var params = new URLSearchParams(window.location.search);
    var state = {
      matter: MATTERS.hasOwnProperty(params.get('matter')) ? params.get('matter') : 'settlement',
      level: Math.max(0, LEVELS.indexOf(params.get('level') || 'straightforward')),
      plan: false, contrib: true, contribAmount: 500
    };
    matterSel.value = state.matter;

    function render(animate) {
      var m = MATTERS[state.matter];
      var range = m.levels[state.level];
      var fixed = range[0] === range[1];
      // Level labels and hints
      $$('[data-est-hint]', root).forEach(function (el) { el.textContent = m.hints[Number(el.getAttribute('data-est-hint'))]; });
      $$('input[name="est-level"]', root).forEach(function (r) { r.checked = Number(r.value) === state.level; });
      // Employer contribution (severance agreements and exit negotiations only)
      contribWrap.hidden = !m.contribution;
      contribField.hidden = !(m.contribution && state.contrib);
      var contribution = m.contribution && state.contrib ? Math.max(0, state.contribAmount || 0) : 0;
      var payMin = Math.max(0, range[0] - contribution), payMax = Math.max(0, range[1] - contribution);

      $('[data-est-name]', root).textContent = m.name;
      $('[data-est-total]', root).textContent = moneyRange(payMin, payMax);
      $('[data-est-total-note]', root).textContent = contribution ? 'you pay' : 'your fee';
      $('[data-est-kind]', root).textContent = fixed ? 'Fixed fee' : 'Range: fixed in writing before work starts';
      $('[data-est-kind]', root).className = 'tag ' + (fixed ? 'tag-lime' : 'tag-amber');

      var rows = [['Fee', moneyRange(range[0], range[1])]];
      if (contribution) rows.push(['Employer contribution', '−' + money(contribution)]);
      rows.push(['You pay', moneyRange(payMin, payMax)]);
      $('[data-est-rows]', root).innerHTML = rows.map(function (r, i) {
        var last = i === rows.length - 1;
        return '<div class="flex items-baseline justify-between gap-4 py-2.5' + (last ? ' border-t border-line pt-3.5 font-semibold text-ink' : ' text-slate') + '"><dt>' + esc(r[0]) + '</dt><dd class="text-right tabular-nums' + (last ? '' : ' text-ink') + '">' + esc(r[1]) + '</dd></div>';
      }).join('');

      var planEl = $('[data-est-plan-text]', root);
      if (!state.plan) planEl.textContent = 'Fees from ' + money(PLAN.minFee) + ' can be spread over ' + PLAN.months + ' months, interest-free.';
      else if (payMax < PLAN.minFee) planEl.textContent = 'This fee is under ' + money(PLAN.minFee) + ', so it’s paid in one go when the work is done.';
      else planEl.textContent = PLAN.months + ' monthly payments of ' + moneyRange(payMin / PLAN.months, payMax / PLAN.months) + ', interest-free.';
      $('[data-est-timeline]', root).textContent = m.timeline;
      $('[data-est-book]', root).setAttribute('href', 'book.html?topic=' + state.matter);
      $('[data-est-service]', root).setAttribute('href', 'services.html#' + state.matter);
      var out = $('[data-est-total]', root);
      if (animate && !reduceMotion.matches) { out.classList.remove('pop'); void out.offsetWidth; out.classList.add('pop'); }
    }
    matterSel.addEventListener('change', function () { state.matter = matterSel.value; setParams({ matter: state.matter, level: LEVELS[state.level] }); render(true); });
    $$('input[name="est-level"]', root).forEach(function (r) {
      r.addEventListener('change', function () { state.level = Number(r.value); setParams({ matter: state.matter, level: LEVELS[state.level] }); render(true); });
    });
    planBox.addEventListener('change', function () { state.plan = planBox.checked; render(false); });
    contribBox.addEventListener('change', function () { state.contrib = contribBox.checked; render(true); });
    contribAmount.addEventListener('input', function () {
      var v = parseFloat(contribAmount.value);
      state.contribAmount = isNaN(v) ? 0 : Math.min(Math.max(v, 0), 100000);
      render(false);
    });
    planBox.checked = state.plan; contribBox.checked = state.contrib; contribAmount.value = state.contribAmount;
    render(false);
  }

  /* ---------- Options check ([data-check], check.html) ----------
     Saved as { answers: [optionIndex, ...], date: "YYYY-MM-DD" } under CHECK_KEY. On load the
     answers are replayed through CHECK_STEPS; anything that doesn't lead to a result is ignored. */
  function replayCheck(answers) {
    var step = 'start', path = [];
    for (var i = 0; i < answers.length; i++) {
      var s = CHECK_STEPS[step], a = answers[i];
      if (!s || typeof a !== 'number' || a % 1 !== 0 || a < 0 || a >= s.options.length) return null;
      var opt = s.options[a];
      path.push({ step: step, answer: a });
      if (opt.result) return i === answers.length - 1 && CHECK_RESULTS[opt.result] ? { result: opt.result, path: path } : null;
      step = opt.next;
    }
    return null;
  }
  function readCheck() {
    var raw = readJSON(CHECK_KEY);
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.answers)) return null;
    var replay = replayCheck(raw.answers);
    if (!replay) return null;
    return { answers: raw.answers.slice(), result: replay.result, path: replay.path, date: typeof raw.date === 'string' ? raw.date : '' };
  }

  var check = $('[data-check]');
  if (check) initCheck(check);

  function initCheck(root) {
    var vIntro = $('[data-check-intro]', root), vRun = $('[data-check-run]', root), vResult = $('[data-check-result]', root);
    var form = $('[data-check-form]', root);
    var answers = [], steps = ['start'];

    function showView(view) { [vIntro, vRun, vResult].forEach(function (v) { v.hidden = v !== view; }); }
    function renderStep(focus) {
      var id = steps[steps.length - 1], s = CHECK_STEPS[id], n = steps.length;
      $('[data-check-count]', root).textContent = 'Question ' + n;
      $('[data-check-progress]', root).style.width = Math.min(90, n * 30) + '%';
      var letters = 'ABCDEFG';
      var html = '<legend class="font-serif text-2xl leading-snug text-ink sm:text-[1.75rem]" tabindex="-1" data-check-legend>' + esc(s.q) + '</legend>';
      if (s.hint) html += '<p class="mt-2 leading-relaxed text-slate" id="check-hint">' + esc(s.hint) + '</p>';
      html += '<div class="mt-6 grid gap-3">';
      s.options.forEach(function (o, i) {
        html += '<label class="check-option"><input type="radio" class="sr-only" name="check-q" value="' + i + '"' + (answers[n - 1] === i ? ' checked' : '') + '><span class="check-letter" aria-hidden="true">' + letters[i] + '</span><span class="pt-1 leading-snug">' + esc(o.label) + '</span></label>';
      });
      $('[data-check-fieldset]', root).innerHTML = html + '</div>';
      $('[data-check-fieldset]', root).setAttribute('aria-describedby', s.hint ? 'check-hint' : '');
      if (!s.hint) $('[data-check-fieldset]', root).removeAttribute('aria-describedby');
      $('[data-check-back]', root).disabled = n === 1;
      $('[data-check-error]', root).hidden = true;
      if (focus) $('[data-check-legend]', root).focus();
    }
    function renderResult(data, focus) {
      var r = CHECK_RESULTS[data.result];
      $('[data-check-tag]', root).textContent = r.tag;
      $('[data-check-title]', root).textContent = r.title;
      $('[data-check-summary]', root).textContent = r.summary;
      var urgent = $('[data-check-urgent]', root);
      urgent.hidden = !r.urgent;
      $('[data-check-urgent-text]', root).textContent = r.urgent || '';
      $('[data-check-steps]', root).innerHTML = r.steps.map(function (s, i) {
        return '<li class="flex gap-4"><span class="grid size-7 shrink-0 place-items-center rounded-md bg-lime font-serif text-sm text-ink">' + (i + 1) + '</span><span class="pt-0.5 leading-relaxed">' + esc(s) + '</span></li>';
      }).join('');
      // Your answers, as a short recap
      $('[data-check-recap]', root).innerHTML = data.path.map(function (p) {
        var s = CHECK_STEPS[p.step];
        return '<li><span class="block text-slate">' + esc(s.q) + '</span><span class="font-semibold text-ink">' + esc(s.options[p.answer].label) + '</span></li>';
      }).join('');
      // Recommended service and fee
      var svc = $('[data-check-service]', root);
      var book = $('[data-check-book]', root);
      if (r.service && MATTERS[r.service]) {
        var m = MATTERS[r.service], lv = m.levels[0];
        svc.hidden = false;
        $('[data-check-service-name]', root).textContent = m.name;
        $('[data-check-service-fee]', root).textContent = (lv[0] === lv[1] ? 'Fixed fee from ' : 'From ') + money(lv[0]);
        $('[data-check-service-link]', root).setAttribute('href', 'services.html#' + r.service);
        $('[data-check-fee-link]', root).setAttribute('href', 'fees.html?matter=' + r.service + '#estimator');
        book.setAttribute('href', 'book.html?topic=' + r.service);
      } else {
        svc.hidden = true;
        book.setAttribute('href', 'book.html');
      }
      // Deadline prompt
      var dl = $('[data-check-deadline]', root);
      dl.hidden = !r.deadline;
      if (r.deadline) {
        $('[data-check-deadline-from]', root).textContent = DEADLINE_RULES[r.deadline].from;
        $('[data-check-deadline-link]', root).setAttribute('data-deadline-type', r.deadline);
      }
      $('[data-check-date]', root).textContent = data.date ? 'Saved on this device on ' + longDate(data.date) + '. Nothing is sent anywhere.' : '';
      showView(vResult);
      if (focus) $('[data-check-result-heading]', root).focus();
    }
    function start() {
      answers = []; steps = ['start'];
      showView(vRun);
      renderStep(true);
    }
    $('[data-check-start]', root).addEventListener('click', start);
    $('[data-check-restart]', root).addEventListener('click', function () { removeKey(CHECK_KEY); start(); });
    $('[data-check-back]', root).addEventListener('click', function () {
      if (steps.length > 1) { steps.pop(); answers.length = steps.length; renderStep(true); }
    });
    form.addEventListener('change', function (e) {
      if (e.target.name === 'check-q') { answers[steps.length - 1] = Number(e.target.value); $('[data-check-error]', root).hidden = true; }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var i = steps.length - 1;
      if (typeof answers[i] !== 'number') {
        $('[data-check-error]', root).hidden = false;
        var first = $('input[name="check-q"]', root);
        if (first) first.focus();
        return;
      }
      answers.length = i + 1;
      var opt = CHECK_STEPS[steps[i]].options[answers[i]];
      if (opt.next) { steps.push(opt.next); renderStep(true); return; }
      var data = { answers: answers.slice(), date: localToday() };
      writeJSON(CHECK_KEY, data);
      var replay = replayCheck(data.answers);
      renderResult({ result: replay.result, path: replay.path, date: data.date }, true);
    });
    $('[data-check-deadline-link]', root).addEventListener('click', function () {
      var type = this.getAttribute('data-deadline-type');
      var sel = $('select[data-deadline-type]');
      if (sel && type) { sel.value = type; sel.dispatchEvent(new Event('change')); }
    });
    var saved = readCheck();
    if (saved) renderResult(saved, false); else showView(vIntro);
  }

  /* ---------- Deadline calculator ([data-deadline], check.html) ----------
     A rule in days counts that many days from the date (300 days from March 15 is January 9). A
     rule in months ends the day before the same date that many months later, to be safe (March 15,
     2026 -> March 14, 2028). If that month has no such date (February 29), the last day is the
     final day of that month. */
  function deadlineFrom(key, months) {
    var d = key.split('-').map(Number);
    var y = d[0], m = d[1] - 1 + months;
    y += Math.floor(m / 12); m = m % 12;
    var last = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
    if (d[2] > last) return keyOf(y, m + 1, last);
    return addDays(keyOf(y, m + 1, d[2]), -1);
  }
  var dlForm = $('[data-deadline]');
  if (dlForm) {
    var dlType = $('[data-deadline-type]', dlForm), dlDate = $('[data-deadline-date]', dlForm), dlOut = $('[data-deadline-result]');
    dlType.innerHTML = Object.keys(DEADLINE_RULES).map(function (k) { return '<option value="' + k + '">' + esc(DEADLINE_RULES[k].label) + '</option>'; }).join('');
    var dlLabel = function () { $('[data-deadline-from]', dlForm).textContent = DEADLINE_RULES[dlType.value].from.charAt(0).toUpperCase() + DEADLINE_RULES[dlType.value].from.slice(1); };
    dlType.addEventListener('change', function () { dlLabel(); dlOut.hidden = true; });
    dlDate.setAttribute('max', addDays(localToday(), 180));
    dlDate.setAttribute('min', addDays(localToday(), -730));
    liveValidate(dlForm);
    dlForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(dlForm)) { dlOut.hidden = true; return; }
      var rule = DEADLINE_RULES[dlType.value];
      var due = rule.days ? addDays(dlDate.value, rule.days) : deadlineFrom(dlDate.value, rule.months);
      var left = daysBetween(localToday(), due);
      $('[data-deadline-date-out]', dlOut).textContent = longDate(due);
      $('[data-deadline-rule]', dlOut).textContent = (rule.days ? rule.days + ' days from ' : 'Two years less one day from ') + longDate(dlDate.value) + '.';
      var status = $('[data-deadline-status]', dlOut), card = $('[data-deadline-card]', dlOut);
      if (left < 0) {
        status.textContent = 'This date passed ' + plural(-left, 'day') + ' ago. Late claims are only accepted in limited circumstances, so speak to an attorney right away.';
        card.setAttribute('data-state', 'late');
      } else if (left === 0) {
        status.textContent = 'That’s today. Contact the agency today, and get advice immediately.';
        card.setAttribute('data-state', 'urgent');
      } else {
        status.textContent = 'That’s ' + plural(left, 'day') + ' from today.' + (left <= 21 ? ' This is close: contact the agency and get advice now.' : '');
        card.setAttribute('data-state', left <= 21 ? 'urgent' : 'ok');
      }
      dlOut.hidden = false;
      $('[data-deadline-heading]', dlOut).focus();
    });
    dlLabel();
  }

  /* ---------- Booking flow ([data-booking], book.html) ---------- */
  var booking = $('[data-booking]');
  if (booking) initBooking(booking);

  function initBooking(root) {
    var visitorZone = (Intl.DateTimeFormat().resolvedOptions().timeZone) || AVAILABILITY.timeZone;
    var state = { type: 'intro', date: null, slot: null, month: null, focusDate: null };
    var steps = $$('[data-step]', root);
    var indicators = $$('[data-step-indicator]', root);

    /* Time-zone math: the offset of a zone at an instant, and local wall time -> instant. */
    function partsIn(date, zone) {
      var out = {};
      new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
        .formatToParts(date).forEach(function (p) { if (p.type !== 'literal') out[p.type] = parseInt(p.value, 10); });
      if (out.hour === 24) out.hour = 0;
      return out;
    }
    function offsetMs(date, zone) {
      var p = partsIn(date, zone);
      return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - Math.floor(date.getTime() / 1000) * 1000;
    }
    function ukToInstant(key, hhmm) {
      var d = key.split('-').map(Number), t = hhmm.split(':').map(Number);
      var guess = Date.UTC(d[0], d[1] - 1, d[2], t[0], t[1]);
      var off = offsetMs(new Date(guess), AVAILABILITY.timeZone);
      var res = guess - off;
      var off2 = offsetMs(new Date(res), AVAILABILITY.timeZone);
      return new Date(off2 === off ? res : guess - off2);
    }
    function timeIn(date, zone) { return date.toLocaleTimeString('en-US', { timeZone: zone, hour: 'numeric', minute: '2-digit', hour12: true }).replace(/\s/g, '').toLowerCase(); }
    function zoneShort(zone) {
      try { return new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' }).formatToParts(new Date()).filter(function (p) { return p.type === 'timeZoneName'; })[0].value; } catch (e) { return zone; }
    }

    var now = new Date();
    var tp = partsIn(now, AVAILABILITY.timeZone);
    var today = keyOf(tp.year, tp.month, tp.day);
    var lastDay = addDays(today, AVAILABILITY.daysAhead);

    // A stable pseudo-random number per slot, so "taken" slots don't change between renders.
    function hash(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967295; }
    function slotsFor(key) {
      if (key < today || key > lastDay || isClosedDay(key)) return [];
      var windows = AVAILABILITY.hours[weekday(key)] || [];
      var len = CALL_TYPES[state.type].minutes, out = [];
      var earliest = now.getTime() + AVAILABILITY.minNoticeHours * 3600000;
      windows.forEach(function (w) {
        var s = w[0].split(':').map(Number), e = w[1].split(':').map(Number);
        for (var m = s[0] * 60 + s[1]; m + len <= e[0] * 60 + e[1]; m += AVAILABILITY.slotStep) {
          var hhmm = String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0');
          var at = ukToInstant(key, hhmm);
          if (at.getTime() < earliest) continue;
          if (hash(key + hhmm) < AVAILABILITY.demoBusyShare) continue;
          out.push({ time: hhmm, at: at });
        }
      });
      return out;
    }
    function localNote(at) {
      if (visitorZone === AVAILABILITY.timeZone) return '';
      return timeIn(at, visitorZone) + ' your time (' + zoneShort(visitorZone) + ')';
    }

    /* Summary sidebar */
    function renderSummary() {
      var t = CALL_TYPES[state.type];
      $('[data-sum-type]', root).textContent = t.label;
      $('[data-sum-meta]', root).textContent = t.minutes + ' minutes · ' + t.price;
      $('[data-sum-where]', root).textContent = t.where;
      var when = $('[data-sum-when]', root), zone = $('[data-sum-zone]', root);
      if (state.slot) {
        when.textContent = longDate(state.date) + ', ' + timeIn(state.slot.at, AVAILABILITY.timeZone);
        zone.textContent = AVAILABILITY.zoneName + (localNote(state.slot.at) ? ' · ' + localNote(state.slot.at) : '');
      } else {
        when.textContent = state.date ? longDate(state.date) + ', pick a time' : 'Not chosen yet';
        zone.textContent = '';
      }
    }

    /* Steps */
    function goTo(n) {
      steps.forEach(function (s) { s.hidden = Number(s.getAttribute('data-step')) !== n; });
      indicators.forEach(function (ind) {
        var i = Number(ind.getAttribute('data-step-indicator'));
        if (i === n) ind.setAttribute('aria-current', 'step'); else ind.removeAttribute('aria-current');
        if (i < n) ind.setAttribute('data-done', ''); else ind.removeAttribute('data-done');
      });
      var h = $('[data-step="' + n + '"] h2', root);
      if (h) h.focus({ preventScroll: true });
      var top = root.getBoundingClientRect().top + window.scrollY - 100;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'auto' });
    }

    /* Step 1: call type (?type=intro|advice|settlement preselects one) */
    var params = new URLSearchParams(window.location.search);
    if (CALL_TYPES.hasOwnProperty(params.get('type'))) state.type = params.get('type');
    $$('input[name="call-type"]', root).forEach(function (r) {
      r.checked = r.value === state.type;
      r.addEventListener('change', function () { state.type = r.value; state.slot = null; renderSummary(); });
    });
    $('[data-next="2"]', root).addEventListener('click', function () {
      if (state.date && !slotsFor(state.date).length) state.date = null;
      renderCalendar(false);
      renderSlots();
      goTo(2);
    });

    /* Step 2: calendar + slots */
    var calGrid = $('[data-cal-grid]', root), calLabel = $('[data-cal-month]', root);
    var prevBtn = $('[data-cal-prev]', root), nextBtn = $('[data-cal-next]', root);
    function monthOf(key) { return key.slice(0, 7); }
    function firstAvailable() {
      for (var k = today; k <= lastDay; k = addDays(k, 1)) if (slotsFor(k).length) return k;
      return today;
    }
    function renderCalendar(focus) {
      if (!state.focusDate) state.focusDate = state.date || firstAvailable();
      if (!state.month) state.month = monthOf(state.focusDate);
      var ym = state.month.split('-').map(Number);
      var first = keyOf(ym[0], ym[1], 1);
      var daysInMonth = new Date(Date.UTC(ym[0], ym[1], 0)).getUTCDate();
      var lead = (weekday(first) + 6) % 7; // Monday first
      calLabel.textContent = new Date(Date.UTC(ym[0], ym[1] - 1, 1, 12)).toLocaleDateString('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' });
      prevBtn.disabled = state.month <= monthOf(today);
      nextBtn.disabled = state.month >= monthOf(lastDay);
      if (monthOf(state.focusDate) !== state.month) {
        var pick = null;
        for (var d = 1; d <= daysInMonth; d++) { var k = keyOf(ym[0], ym[1], d); if (k >= today && k <= lastDay) { if (!pick) pick = k; if (slotsFor(k).length) { pick = k; break; } } }
        state.focusDate = pick || first;
      }
      var html = '<tr>', cell = 0;
      for (var i = 0; i < lead; i++, cell++) html += '<td></td>';
      for (var day = 1; day <= daysInMonth; day++, cell++) {
        if (cell && cell % 7 === 0) html += '</tr><tr>';
        var key = keyOf(ym[0], ym[1], day);
        var n = slotsFor(key).length;
        var inRange = key >= today && key <= lastDay;
        var label = longDate(key) + (n ? ', ' + plural(n, 'time') + ' available' : ', unavailable');
        html += '<td class="p-0.5"><button type="button" class="cal-day" data-date="' + key + '"' +
          (n ? ' data-available' : ' aria-disabled="true"') +
          (key === today ? ' data-today aria-current="date"' : '') +
          ' aria-pressed="' + (key === state.date) + '"' +
          ' tabindex="' + (key === state.focusDate ? 0 : -1) + '"' +
          (inRange ? '' : ' data-out') +
          ' aria-label="' + esc(label) + '">' + day + '</button></td>';
      }
      while (cell % 7 !== 0) { html += '<td></td>'; cell++; }
      calGrid.innerHTML = html + '</tr>';
      if (focus) { var b = $('[data-date="' + state.focusDate + '"]', calGrid); if (b) b.focus(); }
    }
    function moveFocus(key) {
      if (key < today) key = today;
      if (key > lastDay) key = lastDay;
      state.focusDate = key;
      state.month = monthOf(key);
      renderCalendar(true);
    }
    function shiftMonth(delta) {
      var ym = state.month.split('-').map(Number), d = new Date(Date.UTC(ym[0], ym[1] - 1 + delta, 1));
      state.month = keyOf(d.getUTCFullYear(), d.getUTCMonth() + 1, 1).slice(0, 7);
      renderCalendar(false);
    }
    prevBtn.addEventListener('click', function () { shiftMonth(-1); });
    nextBtn.addEventListener('click', function () { shiftMonth(1); });
    calGrid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-date]');
      if (!b || b.getAttribute('aria-disabled') === 'true') return;
      state.date = b.getAttribute('data-date');
      state.focusDate = state.date;
      state.slot = null;
      renderCalendar(true);
      renderSlots();
      renderSummary();
    });
    calGrid.addEventListener('keydown', function (e) {
      var b = e.target.closest('[data-date]');
      if (!b) return;
      var key = b.getAttribute('data-date'), wd = (weekday(key) + 6) % 7, to = null;
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
      if (to) { e.preventDefault(); moveFocus(to); }
    });

    function renderSlots() {
      var list = $('[data-slots]', root), heading = $('[data-slots-heading]', root), empty = $('[data-slots-empty]', root);
      $('[data-slot-error]', root).hidden = true;
      if (!state.date) {
        heading.textContent = 'Choose a date to see times';
        list.innerHTML = '';
        empty.hidden = true;
        return;
      }
      var slots = slotsFor(state.date);
      heading.textContent = longDate(state.date);
      empty.hidden = slots.length !== 0;
      list.innerHTML = slots.map(function (s) {
        var note = localNote(s.at);
        return '<label class="slot"><input type="radio" class="sr-only" name="slot" value="' + s.time + '"' + (state.slot && state.slot.time === s.time ? ' checked' : '') + '><span>' + esc(timeIn(s.at, AVAILABILITY.timeZone)) + '</span>' + (note ? '<span class="text-xs font-medium opacity-75">' + esc(timeIn(s.at, visitorZone)) + ' yours</span>' : '') + '</label>';
      }).join('');
      $$('input[name="slot"]', list).forEach(function (r) {
        r.addEventListener('change', function () {
          state.slot = slots.filter(function (s) { return s.time === r.value; })[0];
          $('[data-slot-error]', root).hidden = true;
          renderSummary();
        });
      });
    }
    $('[data-back="1"]', root).addEventListener('click', function () { goTo(1); });
    $('[data-next="3"]', root).addEventListener('click', function () {
      if (!state.slot) {
        $('[data-slot-error]', root).hidden = false;
        $('[data-slot-error-text]', root).textContent = state.date ? 'Please choose a time to continue.' : 'Please choose a date and a time to continue.';
        var target = state.date ? $('input[name="slot"]', root) : $('[data-date][tabindex="0"]', root);
        if (target) target.focus();
        return;
      }
      goTo(3);
    });

    /* Step 3: details and conflict check. Demo only: nothing is sent and nothing is booked.
       To take real bookings, hand off to Cal.com or Calendly here, or post the details to a
       form service (see DOCS.md, "Booking flow"). */
    var form = $('[data-booking-form]', root);
    var topic = form.elements.topic;
    topic.innerHTML = '<option value="">Choose a topic</option>' + Object.keys(MATTERS).map(function (k) { return '<option value="' + k + '">' + esc(MATTERS[k].name) + '</option>'; }).join('') + '<option value="other">Something else, or not sure</option>';
    var topicParam = params.get('topic');
    if (topicParam && (MATTERS.hasOwnProperty(topicParam) || topicParam === 'other')) topic.value = topicParam;
    liveValidate(form);
    $('[data-back="2"]', root).addEventListener('click', function () { goTo(2); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(form)) return;
      /* --- Connect a real endpoint here, e.g.:
         fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      --- */
      var t = CALL_TYPES[state.type];
      $('[data-confirm-name]', root).textContent = form.elements.name.value.trim().split(/\s+/)[0];
      $('[data-confirm-type]', root).textContent = t.label + ' · ' + t.minutes + ' minutes';
      $('[data-confirm-when]', root).textContent = longDate(state.date) + ' at ' + timeIn(state.slot.at, AVAILABILITY.timeZone) + ' ' + AVAILABILITY.zoneName;
      $('[data-confirm-local]', root).textContent = localNote(state.slot.at);
      $('[data-confirm-local]', root).hidden = !localNote(state.slot.at);
      $('[data-confirm-topic]', root).textContent = topic.options[topic.selectedIndex].text;
      $('[data-confirm-email]', root).textContent = form.elements.email.value.trim();
      $('[data-confirm-ref]', root).textContent = makeRef();
      goTo(4);
    });

    /* Step 4: a calendar hold the visitor can save (.ics). */
    $('[data-ics]', root).addEventListener('click', function () {
      var t = CALL_TYPES[state.type];
      var fmt = function (d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
      var end = new Date(state.slot.at.getTime() + t.minutes * 60000);
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Pennington Employment Law//Booking//EN', 'BEGIN:VEVENT',
        'UID:' + Date.now() + '@pennington-law.example', 'DTSTAMP:' + fmt(new Date()), 'DTSTART:' + fmt(state.slot.at), 'DTEND:' + fmt(end),
        'SUMMARY:' + t.label + ' with Tessa Pennington (requested)', 'DESCRIPTION:Requested on the Pennington Employment Law website. Awaiting confirmation.', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      a.download = 'pennington-' + state.type + '-call.ics';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });
    $('[data-restart]', root).addEventListener('click', function () {
      form.reset();
      if (topicParam && (MATTERS.hasOwnProperty(topicParam) || topicParam === 'other')) topic.value = topicParam;
      state.date = null; state.slot = null; state.focusDate = null; state.month = null;
      renderSummary();
      goTo(1);
    });

    renderSummary();
    $('[data-zone-note]', root).textContent = visitorZone === AVAILABILITY.timeZone
      ? 'Times are in Eastern time.'
      : 'Times are in Eastern time, with your local time (' + zoneShort(visitorZone) + ') underneath.';
  }

  /* ---------- Article: table of contents + reading progress (article.html) ---------- */
  var progress = $('[data-progress]');
  var article = $('[data-article]');
  if (progress && article) {
    var setProgress = function () {
      var r = article.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      progress.style.setProperty('--progress', p.toFixed(4));
    };
    window.addEventListener('scroll', setProgress, { passive: true });
    window.addEventListener('resize', setProgress);
    setProgress();
  }
  var tocLinks = $$('[data-toc] a');
  if (tocLinks.length && 'IntersectionObserver' in window) {
    var heads = tocLinks.map(function (a) { return document.getElementById(a.getAttribute('href').slice(1)); }).filter(Boolean);
    var setCurrent = function (id) { tocLinks.forEach(function (a) { if (a.getAttribute('href') === '#' + id) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); }); };
    var tocIo = new IntersectionObserver(function () {
      var current = heads[0];
      heads.forEach(function (h) { if (h.getBoundingClientRect().top < window.innerHeight * 0.35) current = h; });
      if (current) setCurrent(current.id);
    }, { rootMargin: '0px 0px -60% 0px', threshold: [0, 1] });
    heads.forEach(function (h) { tocIo.observe(h); });
    window.addEventListener('scroll', function () {
      var current = heads[0];
      heads.forEach(function (h) { if (h.getBoundingClientRect().top < window.innerHeight * 0.35) current = h; });
      if (current) setCurrent(current.id);
    }, { passive: true });
    setCurrent(heads[0] && heads[0].id);
  }

  /* ---------- Contact form ([data-contact-form]) ----------
     Demo only: nothing is sent. Replace the marked block with a fetch() to your form service. */
  $$('[data-contact-form]').forEach(function (cf) {
    var success = cf.parentNode.querySelector('[data-success]');
    liveValidate(cf);
    cf.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validateForm(cf)) return;
      /* --- Connect a real endpoint here, e.g.:
         fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(cf), headers: { Accept: 'application/json' } })
      --- */
      var name = (cf.elements.name && cf.elements.name.value.trim().split(/\s+/)[0]) || '';
      $('[data-success-text]', success).textContent = 'Thanks' + (name ? ', ' + name : '') + '. Your message has reached me.';
      $('[data-success-ref]', success).textContent = makeRef();
      cf.hidden = true;
      success.hidden = false;
      success.focus();
    });
    var reset = success && $('[data-success-reset]', success);
    if (reset) reset.addEventListener('click', function () {
      cf.reset();
      cf.hidden = false;
      success.hidden = true;
      var f = $('input, select, textarea', cf);
      if (f) f.focus();
    });
  });

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
})();

/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It steps aside while the footer's "Back to top" link
   is on screen. Mark your own UI with data-back-to-top-avoid (lift above it) or
   data-back-to-top-hide (hide while covering it). To remove the button: delete this
   block and the .back-to-top styles in src/input.css. */
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
  var AVOID = '[data-toast], .toast, [data-back-to-top-avoid]';
  var queued = false;

  function isShown(el) {
    var cs = window.getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05;
  }
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
  var inlineLinks = Array.prototype.filter.call(document.querySelectorAll('a'), function (a) { return /back to top/i.test(a.textContent); });
  function inlineLinkInView() {
    return inlineLinks.some(function (a) {
      var r = a.getBoundingClientRect();
      return r.width > 0 && r.top < window.innerHeight && r.bottom > 0;
    });
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
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !inlineLinkInView() && !coversHideZone());
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
