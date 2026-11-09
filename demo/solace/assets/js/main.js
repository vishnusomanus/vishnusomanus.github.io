/* Solace (Budd Bay Counseling) — site scripts. Vanilla JavaScript, no dependencies.
   The practice data (hours, holidays, clinicians, fees, sliding scale, plans, groups) is in
   assets/js/data.js as window.SOLACE. This file turns it into the interactive parts of each page.
   See DOCS.md, "Features". */
(function () {
  'use strict';

  var D = window.SOLACE;
  if (!D) return;
  var P = D.PRACTICE, CL = D.CLINICIANS, IDS = Object.keys(CL);

  /* ======================================================================
     1. Helpers
     ====================================================================== */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  // Own-key lookups, so URL or stored values like "constructor" never match built-in properties.
  function has(obj, key) { return typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }
  function listText(items) {
    if (items.length < 2) return items.join('');
    return items.slice(0, -1).join(', ') + ' and ' + items[items.length - 1];
  }
  function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
  var NUMBER_WORDS = ['No', 'One', 'Two', 'Three', 'Four', 'Five', 'Six'];
  function param(name) { try { return new URLSearchParams(window.location.search).get(name); } catch (e) { return null; } }
  function setParams(values) {
    try {
      var url = new URL(window.location.href);
      Object.keys(values).forEach(function (k) {
        if (values[k]) url.searchParams.set(k, values[k]); else url.searchParams.delete(k);
      });
      window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) { /* file:// in some browsers: the page still works without the URL update */ }
  }

  /* localStorage, or an in-memory stand-in when it's blocked (sandboxed iframes, strict privacy
     settings). Saved answers then last for the page view instead of breaking the page. */
  var safeStorage = (function () {
    var local = null;
    try { local = window.localStorage; local.getItem('_'); } catch (e) { local = null; /* blocked */ }
    // A save that fails (storage full) stays in memory, and memory is read first, so the change isn't lost.
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
  function readJSON(key) { try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; } }
  function writeJSON(key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* full or blocked */ } }
  function removeKey(key) { try { safeStorage.removeItem(key); } catch (e) { /* blocked */ } }
  var KEYS = { shortlist: 'solace-shortlist', match: 'solace-match', intake: 'solace-intake' };

  var toastTimer;
  function toast(msg) {
    var t = $('[data-toast]');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('is-visible'); }, 3200);
  }

  // A short reference for confirmations, like BBC-7K2QH (no 0/O or 1/I to misread over the phone).
  function makeRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 5; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return P.refPrefix + '-' + out;
  }

  var ICON = {
    check: '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7"/></svg>',
    arrow: '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
    heart: '<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z"/></svg>',
    calendar: '<svg class="size-[1.1rem]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
    video: '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="6" width="13" height="12" rx="2.5"/><path d="m16 10.5 5-3v9l-5-3"/></svg>',
    pin: '<svg class="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/></svg>'
  };

  /* ======================================================================
     2. Dates and times (everything in the practice's time zone, Pacific)
     ====================================================================== */
  function toMin(hhmm) { var p = hhmm.split(':'); return Number(p[0]) * 60 + Number(p[1]); }
  function fmtTime(mins) {
    var h = Math.floor(mins / 60), m = mins % 60, ap = h < 12 ? 'am' : 'pm';
    var h12 = h % 12 === 0 ? 12 : h % 12;
    return h12 + ':' + String(m).padStart(2, '0') + ' ' + ap;
  }
  function fmtRange(a, b) { return fmtTime(toMin(a)) + ' – ' + fmtTime(toMin(b)); }
  function partsIn(date, zone) {
    var out = {};
    new Intl.DateTimeFormat('en-US', { timeZone: zone, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
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
  /* "Now" in Olympia. A preview time can be passed as ?now=2027-01-04T10:00 (Pacific wall-clock
     time), which is handy for checking holidays, groups and opening hours on any date. */
  var PREVIEW = (function () {
    var v = param('now');
    var m = v && /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(v);
    if (!m) return null;
    var y = +m[1], mo = +m[2], d = +m[3], h = m[4] ? +m[4] : 9, mi = m[5] ? +m[5] : 0;
    if (mo < 1 || mo > 12 || d < 1 || d > 31 || h > 23 || mi > 59) return null;
    return { year: y, month: mo, day: d, hour: h, minute: mi };
  })();
  function practiceNow() {
    var p = PREVIEW || partsIn(new Date(), P.timeZone);
    var key = keyOf(p.year, p.month, p.day);
    return { key: key, year: p.year, month: p.month, day: weekday(key), mins: p.hour * 60 + p.minute };
  }
  function shortDate(key, today) {
    var opts = { weekday: 'short', month: 'short', day: 'numeric' };
    if (key.slice(0, 4) !== today.slice(0, 4)) opts.year = 'numeric';
    return dateLabel(key, opts);
  }
  function longDate(key, today) {
    var opts = { weekday: 'long', month: 'long', day: 'numeric' };
    if (today && key.slice(0, 4) !== today.slice(0, 4)) opts.year = 'numeric';
    return dateLabel(key, opts);
  }

  /* ---------- Federal holidays (observed) ---------- */
  function ruleDate(rule, year) {
    if (rule.day) {
      var key = keyOf(year, rule.month, rule.day), wd = weekday(key);
      if (wd === 6) return addDays(key, -1);   // Saturday: observed on the Friday before
      if (wd === 0) return addDays(key, 1);    // Sunday: observed on the Monday after
      return key;
    }
    if (rule.nth > 0) {
      var first = weekday(keyOf(year, rule.month, 1));
      return keyOf(year, rule.month, 1 + ((rule.weekday - first + 7) % 7) + (rule.nth - 1) * 7);
    }
    var lastDay = new Date(Date.UTC(year, rule.month, 0)).getUTCDate();
    var last = weekday(keyOf(year, rule.month, lastDay));
    return keyOf(year, rule.month, lastDay - ((last - rule.weekday + 7) % 7));
  }
  var holidayCache = {};
  function holidaysFor(year) {
    if (!holidayCache[year]) {
      var map = {};
      // Include next year's rules too: New Year's Day on a Saturday is observed on Dec 31.
      [year, year + 1].forEach(function (y) {
        D.HOLIDAYS.forEach(function (rule) { var k = ruleDate(rule, y); if (k.slice(0, 4) === String(year)) map[k] = rule.name; });
      });
      holidayCache[year] = map;
    }
    return holidayCache[year];
  }
  function holidayOn(key) {
    var map = holidaysFor(Number(key.slice(0, 4)));
    if (has(map, key)) return map[key];
    if (D.EXTRA_CLOSED.indexOf(key) !== -1) return 'a team day';
    return null;
  }
  function hoursOn(key) { return holidayOn(key) ? null : (D.HOURS[weekday(key)] || null); }
  function isBusinessDay(key) { return !!D.PHONE_HOURS[weekday(key)] && !holidayOn(key); }
  function nextBusinessDay(key, n) {
    var k = key, left = n || 1;
    for (var i = 0; i < 30 && left > 0; i++) { k = addDays(k, 1); if (isBusinessDay(k)) left--; }
    return k;
  }

  /* ======================================================================
     3. Header, crisis panel, reveal, footer year, back to top
     ====================================================================== */
  var header = $('[data-header]');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 30); };
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
      window.matchMedia('(min-width: 1280px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
    }
  }

  // "More ways to get help now": the crisis panel under the top bar, on every page.
  var crisisBtn = $('[data-crisis-toggle]'), crisisPanel = $('[data-crisis-panel]');
  if (crisisBtn && crisisPanel) {
    var setCrisis = function (open) {
      crisisBtn.setAttribute('aria-expanded', String(open));
      crisisPanel.hidden = !open;
      $('[data-crisis-label]', crisisBtn).textContent = open ? 'Hide crisis options' : 'More ways to get help now';
      $('[data-crisis-chevron]', crisisBtn).style.transform = open ? 'rotate(180deg)' : '';
    };
    crisisBtn.addEventListener('click', function () { setCrisis(crisisBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && crisisBtn.getAttribute('aria-expanded') === 'true' && crisisPanel.contains(document.activeElement)) { setCrisis(false); crisisBtn.focus(); }
    });
  }

  // Scroll reveal. Revealing an element also reveals everything before it, so fast jumps never leave gaps.
  var reveals = [];
  function initReveal() {
    reveals = $$('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window) || reduceMotion.matches) {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var index = reveals.indexOf(entry.target);
        reveals.slice(0, index + 1).forEach(function (el) { el.classList.add('is-visible'); io.unobserve(el); });
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  }

  $$('[data-year]').forEach(function (el) { el.textContent = String(practiceNow().year); });

  (function backToTop() {
    var main = $('#main');
    if (!main) return;
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
    document.body.appendChild(btn);
    var update = function () { btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 1.2); };
    window.addEventListener('scroll', update, { passive: true });
    update();
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      main.classList.add('back-to-top-target');
      main.focus({ preventScroll: true });
    });
  })();

  /* ======================================================================
     4. Office hours: today's row, open-now pill, holiday note, reply time
     ====================================================================== */
  function openStatus() {
    var now = practiceNow(), h = hoursOn(now.key);
    if (h && now.mins >= toMin(h[0]) && now.mins < toMin(h[1])) {
      return { open: true, text: 'Open now · until ' + fmtTime(toMin(h[1])) };
    }
    for (var i = 0; i < 14; i++) {
      var key = addDays(now.key, i), hh = hoursOn(key);
      if (!hh || (i === 0 && now.mins >= toMin(hh[0]))) continue;
      var when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : dateLabel(key, { weekday: 'long' });
      return { open: false, text: 'Closed now · opens ' + when + ' at ' + fmtTime(toMin(hh[0])) };
    }
    return { open: false, text: 'Call for our hours' };
  }
  function replyByText() {
    var now = practiceNow(), day = nextBusinessDay(now.key, P.replyBusinessDays);
    return 'Requests sent now get a reply by 5 pm on ' + longDate(day, now.key) + '.';
  }
  function renderHours() {
    var now = practiceNow(), s = openStatus();
    $$('[data-hours] [data-day]').forEach(function (row) {
      row.setAttribute('data-today', String(Number(row.getAttribute('data-day')) === now.day && !holidayOn(now.key)));
    });
    $$('[data-open-status]').forEach(function (el) {
      el.hidden = false;
      el.setAttribute('data-open', String(s.open));
      $('[data-open-text]', el).textContent = s.text;
    });
    $$('[data-holiday-note]').forEach(function (el) {
      for (var i = 0; i < 14; i++) {
        var key = addDays(now.key, i), name = holidayOn(key);
        if (name) {
          el.textContent = 'Closed ' + (i === 0 ? 'today' : longDate(key, now.key)) + ' for ' + name + '.';
          el.hidden = false;
          return;
        }
      }
      el.hidden = true;
    });
    $$('[data-reply-by]').forEach(function (el) { el.textContent = replyByText(); });
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ======================================================================
     5. Clinicians: times, availability, status, shortlist
     ====================================================================== */
  function clinTimes(c) {
    var out = {};
    Object.keys(c.days).forEach(function (d) {
      var s = c.days[d];
      if (Number(d) === 6) { out.saturday = true; return; }
      if (toMin(s[0]) < toMin(D.DAYTIME_UNTIL)) out.daytime = true;
      if (toMin(s[1]) > toMin(D.EVENING_FROM)) out.evening = true;
    });
    return Object.keys(D.TIMES).filter(function (t) { return out[t]; });
  }
  // First day a free consultation can be held with this clinician (accepting clinicians only).
  function nextConsult(id) {
    var c = CL[id];
    if (c.accepting !== 'yes') return null;
    var today = practiceNow().key;
    for (var i = P.consultLeadDays; i < P.consultLeadDays + 21; i++) {
      var key = addDays(today, i);
      if (has(c.days, String(weekday(key))) && !holidayOn(key)) return key;
    }
    return null;
  }
  function earliestConsult() {
    var best = null;
    IDS.forEach(function (id) { var k = nextConsult(id); if (k && (!best || k < best.key)) best = { key: k, id: id }; });
    return best;
  }
  function statusPill(c) {
    return c.accepting === 'yes'
      ? '<span class="pill pill-yes"><span class="pill-dot" aria-hidden="true"></span>Accepting new clients</span>'
      : '<span class="pill pill-wait"><span class="pill-dot" aria-hidden="true"></span>Waitlist · ' + esc(c.wait) + '</span>';
  }
  function fullName(c) { return c.name + ', ' + c.credential; }
  function formatsText(c) {
    if (c.formats.length === 2) return 'In person and video';
    return c.formats[0] === 'video' ? 'Video only' : 'In person only';
  }
  function concernsText(ids) { return listText(ids.map(function (k) { return D.CONCERNS[k].short; })); }
  function fee(c, row) { return D.FEES.tiers[c.tier][row]; }
  function profileUrl(id) { return 'clinician.html?id=' + id; }
  function portrait(c, cls) {
    return '<img src="assets/img/' + esc(c.art) + '" alt="" width="320" height="400" class="' + cls + '" loading="lazy">';
  }

  function loadShortlist() {
    var raw = readJSON(KEYS.shortlist), out = [];
    if (Array.isArray(raw)) raw.forEach(function (id) { if (has(CL, id) && out.indexOf(id) === -1) out.push(id); });
    return out;
  }
  var shortlist = loadShortlist();
  function saveShortlist() { writeJSON(KEYS.shortlist, shortlist); }
  function toggleShortlist(id) {
    var i = shortlist.indexOf(id);
    if (i === -1) shortlist.push(id); else shortlist.splice(i, 1);
    saveShortlist();
    var added = i === -1;
    toast(added ? CL[id].first + ' saved to your shortlist' : CL[id].first + ' removed from your shortlist');
    renderShortlist();
    $$('[data-save-id="' + id + '"]').forEach(function (b) { setSaveButton(b, id); });
    return added;
  }
  function setSaveButton(btn, id) {
    var on = shortlist.indexOf(id) !== -1;
    btn.setAttribute('aria-pressed', String(on));
    var label = $('[data-save-label]', btn);
    if (label) label.textContent = on ? 'Saved' : 'Save';
    btn.setAttribute('aria-label', (on ? 'Remove ' : 'Save ') + CL[id].name + (on ? ' from your shortlist' : ' to your shortlist'));
  }
  function renderShortlist() {
    var box = $('[data-shortlist]');
    if (!box) return;
    box.hidden = !shortlist.length;
    if (!shortlist.length) return;
    $('[data-shortlist-count]', box).textContent = plural(shortlist.length, 'saved clinician');
    $('[data-shortlist-names]', box).textContent = listText(shortlist.map(function (id) { return CL[id].name; }));
    var req = $('[data-shortlist-request]', box);
    req.setAttribute('href', 'contact.html?clinician=' + shortlist[0]);
    req.textContent = shortlist.length === 1 ? 'Request a consultation with ' + CL[shortlist[0]].first : 'Request a consultation';
  }

  /* ---------- Home: team teaser and next consultation ---------- */
  var teaser = $('[data-team-teaser]');
  if (teaser) {
    teaser.innerHTML = IDS.map(function (id, i) {
      var c = CL[id];
      return '<li class="reveal" style="--d:' + (i * 50) + 'ms"><a href="' + profileUrl(id) + '" class="group block text-center">' +
        '<span class="arch block overflow-hidden border border-line bg-white transition group-hover:border-sage-400">' + portrait(c, 'block h-auto w-full transition duration-500 group-hover:scale-[1.03]') + '</span>' +
        '<span class="mt-4 block font-display text-xl leading-tight text-ink">' + esc(c.name) + '</span>' +
        '<span class="mt-1 block text-sm font-bold tracking-[.08em] text-clay-700">' + esc(c.credential) + '</span>' +
        '<span class="mt-2 block text-[.93rem] leading-snug">' + esc(c.focus) + '</span>' +
        '<span class="mt-3 inline-block">' + (c.accepting === 'yes' ? '<span class="pill pill-yes">Accepting</span>' : '<span class="pill pill-wait">Waitlist</span>') + '</span></a></li>';
    }).join('');
  }
  var accepting = IDS.filter(function (id) { return CL[id].accepting === 'yes'; }).length;
  $$('[data-accepting-count]').forEach(function (el) { el.textContent = accepting + ' of ' + plural(IDS.length, 'clinician'); });
  var nc = $('[data-next-consult]');
  if (nc) {
    var e = earliestConsult();
    if (e) {
      $('[data-next-consult-text]', nc).textContent = shortDate(e.key, practiceNow().key) + ' with ' + CL[e.id].short;
      nc.hidden = false;
    }
  }

  /* ---------- Services: who sees whom ---------- */
  $$('[data-service-team]').forEach(function (ul) {
    var keys = ul.getAttribute('data-service-team').split(' ');
    var ids = IDS.filter(function (id) {
      var c = CL[id];
      return keys.some(function (k) { return c.clients.indexOf(k) !== -1 || c.formats.indexOf(k) !== -1; });
    });
    ul.innerHTML = ids.map(function (id) {
      var c = CL[id];
      return '<li><a href="' + profileUrl(id) + '" class="chip gap-2.5 py-1 pl-1">' + '<span class="arch-sm block size-8 overflow-hidden bg-sage-100">' + portrait(c, 'block h-full w-full object-cover object-top') + '</span>' + esc(c.name) + '</a></li>';
    }).join('');
  });

  /* ---------- Approach: who offers each method, and the tabs ---------- */
  $$('[data-modality-team]').forEach(function (ul) {
    var m = ul.getAttribute('data-modality-team');
    var ids = IDS.filter(function (id) { return CL[id].modalities.indexOf(m) !== -1; });
    ul.innerHTML = ids.map(function (id) {
      var c = CL[id];
      return '<li><a href="' + profileUrl(id) + '" class="group flex items-center gap-3"><span class="arch-sm block size-11 shrink-0 overflow-hidden bg-sage-100">' + portrait(c, 'block h-full w-full object-cover object-top') + '</span><span><span class="block font-bold text-ink group-hover:text-clay-700">' + esc(fullName(c)) + '</span><span class="block text-sm text-muted">' + esc(formatsText(c)) + '</span></span></a></li>';
    }).join('') || '<li class="text-muted">Ask us on your consultation call.</li>';
  });

  var tablist = $('[data-tabs]');
  if (tablist) (function () {
    var tabs = $$('[role="tab"]', tablist);
    // Keep the selected tab in view in the phone's scrolling row, without scrolling the page.
    function showTab(t) {
      if (tablist.scrollWidth <= tablist.clientWidth) return;
      var left = t.offsetLeft - tablist.offsetLeft;
      if (left < tablist.scrollLeft) tablist.scrollLeft = left;
      else if (left + t.offsetWidth > tablist.scrollLeft + tablist.clientWidth) tablist.scrollLeft = left + t.offsetWidth - tablist.clientWidth;
    }
    function select(id, focus, updateHash) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === id;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        $('#' + t.getAttribute('aria-controls')).hidden = !on;
        if (on && focus) t.focus({ preventScroll: true });
        if (on) showTab(t);
      });
      if (updateHash) { try { window.history.replaceState(null, '', '#' + id); } catch (e) { /* file:// */ } }
    }
    var ids = tabs.map(function (t) { return t.getAttribute('data-tab'); });
    var start = (window.location.hash || '').slice(1);
    select(ids.indexOf(start) !== -1 ? start : ids[0], false, false);
    tablist.addEventListener('click', function (e) {
      var t = e.target.closest('[role="tab"]');
      if (t) select(t.getAttribute('data-tab'), false, true);
    });
    tablist.addEventListener('keydown', function (e) {
      var i = tabs.indexOf(document.activeElement);
      if (i === -1) return;
      var next = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') next = (i + 1) % tabs.length;
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = tabs.length - 1;
      if (next === null) return;
      e.preventDefault();
      select(ids[next], true, true);
    });
  })();

  /* ======================================================================
     6. Team directory (team.html): filters with shareable URLs, shortlist
     ====================================================================== */
  function teamCard(id) {
    var c = CL[id];
    var tags = c.concerns.slice(0, 3).map(function (k) { return '<li class="pill pill-plain">' + esc(D.CONCERNS[k].label) + '</li>'; }).join('') +
      (c.concerns.length > 3 ? '<li class="pill pill-plain">+' + (c.concerns.length - 3) + ' more</li>' : '');
    return '<li class="card card-hover flex flex-col overflow-hidden" data-clinician="' + id + '">' +
      '<div class="flex gap-5 p-6 pb-0"><a href="' + profileUrl(id) + '" class="arch block w-24 shrink-0 overflow-hidden border border-line bg-sage-50 sm:w-28" tabindex="-1" aria-hidden="true">' + portrait(c, 'block h-auto w-full') + '</a>' +
      '<div class="min-w-0"><h3 class="font-display text-[1.45rem] leading-tight"><a href="' + profileUrl(id) + '" class="hover:text-clay-700">' + esc(c.name) + '</a></h3>' +
      '<p class="mt-1 text-sm font-bold tracking-[.06em] text-clay-700">' + esc(c.credential) + ' · ' + esc(c.pronouns) + '</p>' +
      '<p class="mt-2 text-sm leading-snug text-muted">' + esc(c.role) + '</p></div></div>' +
      '<div class="flex flex-1 flex-col p-6"><p>' + esc(c.summary) + '</p>' +
      '<ul class="mt-4 flex flex-wrap gap-1.5" aria-label="Helps with">' + tags + '</ul>' +
      '<dl class="mt-5 grid grid-cols-2 gap-3 border-t border-line pt-4 text-sm"><div><dt class="font-bold text-ink">Format</dt><dd>' + esc(formatsText(c)) + '</dd></div><div><dt class="font-bold text-ink">From</dt><dd>' + money(fee(c, 'individual')) + ' a session' + (c.sliding ? ', sliding scale' : '') + '</dd></div></dl>' +
      '<div class="mt-5 flex flex-wrap items-center gap-2">' + statusPill(c) + '</div>' +
      '<div class="mt-auto flex flex-wrap gap-2 pt-6"><a href="' + profileUrl(id) + '" class="btn btn-fir btn-sm">View profile</a>' +
      '<button type="button" class="btn btn-outline btn-sm" aria-pressed="false" data-save-id="' + id + '">' + ICON.heart + '<span data-save-label>Save</span></button></div></div></li>';
  }

  var teamGrid = $('[data-team-grid]');
  if (teamGrid) (function () {
    var form = $('[data-team-filters]');
    var sel = { concern: $('[data-filter="concern"]', form), client: $('[data-filter="client"]', form), plan: $('[data-filter="plan"]', form) };
    var checks = { accepting: $('[data-filter="accepting"]', form), sliding: $('[data-filter="sliding"]', form) };
    Object.keys(D.CONCERNS).forEach(function (k) { sel.concern.insertAdjacentHTML('beforeend', '<option value="' + k + '">' + esc(D.CONCERNS[k].label) + '</option>'); });
    Object.keys(D.CLIENTS).forEach(function (k) { sel.client.insertAdjacentHTML('beforeend', '<option value="' + k + '">' + esc(D.CLIENTS[k]) + '</option>'); });
    var planKeys = Object.keys(D.PLANS).filter(function (k) { return D.PLANS[k].type !== 'oon'; });
    planKeys.forEach(function (k) { sel.plan.insertAdjacentHTML('beforeend', '<option value="' + k + '">' + esc(D.PLANS[k].name) + '</option>'); });
    var format = '';

    // Read the starting filters from the URL (?concern=trauma&format=video&accepting=1), validated.
    var q = { concern: param('concern'), client: param('client'), plan: param('plan'), format: param('format') };
    if (has(D.CONCERNS, q.concern)) sel.concern.value = q.concern;
    if (has(D.CLIENTS, q.client)) sel.client.value = q.client;
    if (planKeys.indexOf(q.plan) !== -1) sel.plan.value = q.plan;
    if (has(D.FORMATS, q.format)) format = q.format;
    checks.accepting.checked = param('accepting') === '1';
    checks.sliding.checked = param('sliding') === '1';

    function matches(c) {
      if (sel.concern.value && c.concerns.indexOf(sel.concern.value) === -1) return false;
      if (sel.client.value && c.clients.indexOf(sel.client.value) === -1) return false;
      if (sel.plan.value && c.insurance.indexOf(sel.plan.value) === -1) return false;
      if (format && c.formats.indexOf(format) === -1) return false;
      if (checks.accepting.checked && c.accepting !== 'yes') return false;
      if (checks.sliding.checked && !c.sliding) return false;
      return true;
    }
    function render() {
      var ids = IDS.filter(function (id) { return matches(CL[id]); });
      teamGrid.innerHTML = ids.map(teamCard).join('');
      $$('[data-save-id]', teamGrid).forEach(function (b) { setSaveButton(b, b.getAttribute('data-save-id')); });
      $('[data-team-empty]').hidden = ids.length > 0;
      var active = !!(sel.concern.value || sel.client.value || sel.plan.value || format || checks.accepting.checked || checks.sliding.checked);
      $('[data-team-count]').textContent = active ? 'Showing ' + ids.length + ' of ' + plural(IDS.length, 'clinician') : 'Showing all ' + plural(IDS.length, 'clinician');
      $$('[data-team-reset]').forEach(function (b, i) { if (i === 0) b.hidden = !active; });
      $$('[data-format]', form).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-format') === format)); });
      setParams({ concern: sel.concern.value, client: sel.client.value, plan: sel.plan.value, format: format, accepting: checks.accepting.checked ? '1' : '', sliding: checks.sliding.checked ? '1' : '' });
      $$('.reveal', teamGrid).forEach(function (el) { el.classList.add('is-visible'); });
    }
    form.addEventListener('change', render);
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    $$('[data-format]', form).forEach(function (b) { b.addEventListener('click', function () { format = b.getAttribute('data-format'); render(); }); });
    $$('[data-team-reset]').forEach(function (b) {
      b.addEventListener('click', function () {
        sel.concern.value = sel.client.value = sel.plan.value = ''; format = '';
        checks.accepting.checked = checks.sliding.checked = false;
        render();
        sel.concern.focus();
      });
    });
    teamGrid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-save-id]');
      if (b) toggleShortlist(b.getAttribute('data-save-id'));
    });
    var clear = $('[data-shortlist-clear]');
    if (clear) clear.addEventListener('click', function () {
      shortlist = []; saveShortlist(); renderShortlist();
      $$('[data-save-id]').forEach(function (b) { setSaveButton(b, b.getAttribute('data-save-id')); });
      toast('Shortlist cleared');
    });
    render();
    renderShortlist();
  })();

  /* ======================================================================
     7. Clinician profile (clinician.html?id=delacorte)
     ====================================================================== */
  var profile = $('[data-profile]');
  if (profile) (function () {
    var id = param('id');
    if (!has(CL, id)) {
      if (id) {
        profile.hidden = true;
        $('[data-profile-body]').hidden = true;
        $('[data-profile-related]').hidden = true;
        $('[data-profile-missing]').hidden = false;
        // Move the page's one h1 into the "not found" message.
        var h = $('[data-p-name]'), h2 = $('#missing-title');
        h.className = 'section-title';
        h.id = 'missing-title';
        h.textContent = h2.textContent;
        h2.replaceWith(h);
        document.title = 'Clinician not found — ' + P.name;
        return;
      }
      id = IDS[0];
    }
    var c = CL[id], today = practiceNow().key, pron = c.pronouns.split('/')[0];
    var their = { she: 'her', he: 'his', they: 'their' }[pron] || 'their';
    document.title = c.name + ', ' + c.credential + ' — ' + P.name;
    $('[data-p-crumb]').textContent = c.name;
    var art = $('[data-p-art]');
    art.src = 'assets/img/' + c.art;
    art.alt = 'Illustrated portrait of ' + c.name;
    $('[data-p-role]').textContent = c.role;
    $('[data-p-name]').textContent = fullName(c);
    $('[data-p-pronouns]').textContent = 'Pronouns: ' + c.pronouns;
    $('[data-p-summary]').textContent = c.summary;
    $('[data-p-pills]').innerHTML = statusPill(c) +
      c.formats.map(function (f) { return '<span class="pill pill-plain">' + (f === 'video' ? ICON.video : ICON.pin) + esc(f === 'video' ? 'Video across Washington' : 'In person in Olympia') + '</span>'; }).join('') +
      (c.sliding ? '<span class="pill pill-plain">Sliding scale</span>' : '');
    var req = $('[data-p-request]');
    req.href = 'contact.html?clinician=' + id;
    $('[data-p-request-text]').textContent = c.accepting === 'yes' ? 'Request a free consultation with ' + c.first : 'Join ' + c.first + '’s waitlist';
    var save = $('[data-p-save]');
    save.setAttribute('data-save-id', id);
    var syncSave = function () {
      var on = shortlist.indexOf(id) !== -1;
      save.setAttribute('aria-pressed', String(on));
      $('[data-p-save-text]').textContent = on ? 'Saved to your shortlist' : 'Save to my shortlist';
    };
    syncSave();
    save.addEventListener('click', function () { toggleShortlist(id); syncSave(); });

    $('[data-p-about-title]').textContent = 'About ' + c.first;
    $('[data-p-bio]').innerHTML = c.bio.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('');
    $('[data-p-words]').textContent = c.words;
    $('[data-p-words-by]').textContent = c.first + ', in ' + their + ' own words';
    $('[data-p-first]').textContent = c.first;
    $('[data-p-format-note]').textContent = c.formats.length === 2 ? 'In person or by video.' : (c.formats[0] === 'video' ? 'All sessions are by video.' : 'All sessions are in person.');
    var names = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    $('[data-p-week]').innerHTML = [1, 2, 3, 4, 5, 6].map(function (d) {
      var s = c.days[d];
      return '<li class="rounded-2xl border p-3.5 ' + (s ? 'border-sage-200 bg-sage-50' : 'border-line bg-white text-muted') + '"><span class="block text-xs font-bold tracking-[.14em] uppercase ' + (s ? 'text-sage-700' : '') + '">' + names[d] + '</span><span class="mt-1 block text-[.93rem] leading-snug ' + (s ? 'font-semibold text-ink' : '') + '">' + (s ? esc(fmtRange(s[0], s[1])) : 'Not in') + '</span></li>';
    }).join('');
    var next = nextConsult(id);
    $('[data-p-next-text]').textContent = next
      ? 'Next free consultation: ' + longDate(next, today)
      : c.first + ' has a waitlist of ' + c.wait + '. We can suggest someone sooner if you’d like.';

    var fees = '<ul class="grid gap-1">' + ['intake', 'individual', 'couples'].filter(function (row) { return row !== 'couples' || c.clients.indexOf('couples') !== -1 || c.clients.indexOf('families') !== -1; }).map(function (row) {
      var label = { intake: 'First session (60 min)', individual: 'Individual (53 min)', couples: 'Couples or family (50 min)' }[row];
      return '<li class="flex justify-between gap-3"><span>' + label + '</span><span class="font-semibold text-ink">' + money(fee(c, row)) + '</span></li>';
    }).join('') + '</ul>' + (c.sliding ? '<p class="mt-2 text-sm">Sliding-scale spots from ' + money(D.SLIDING.bands[0].fee) + '. <a href="fees.html#sliding" class="text-link">Check your fee</a></p>' : '');
    var plans = c.insurance.map(function (k) { return D.PLANS[k].name; });
    var rows = [
      ['Works with', esc(cap(listText(c.clients.map(function (k) { return D.CLIENTS[k].toLowerCase(); }))))],
      ['Helps with', esc(cap(concernsText(c.concerns)))],
      ['Approaches', c.modalities.map(function (m) { return '<a href="approach.html#' + m + '" class="text-link font-semibold">' + esc(D.MODALITIES[m]) + '</a>'; }).join('<br>')],
      ['Sessions', esc(formatsText(c)) + ' · ' + esc(listText(clinTimes(c).map(function (t) { return D.TIMES[t].toLowerCase(); }))).replace(/^./, function (s) { return s.toUpperCase(); })],
      ['Languages', esc(listText(c.languages))],
      ['Insurance', plans.length ? esc(listText(plans)) + '. Superbills for other plans.' : 'Self-pay; superbills on request.'],
      ['Fees', fees],
      ['Training', '<ul class="grid gap-1">' + c.training.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('') + '</ul>'],
      ['In practice since', String(c.since)]
    ];
    $('[data-p-facts]').innerHTML = rows.map(function (r) { return '<div class="grid gap-1 border-b border-line pb-4 last:border-0 last:pb-0"><dt class="text-xs font-bold tracking-[.14em] text-muted uppercase">' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('');

    // Related: share a client group, ranked by shared concerns.
    var related = IDS.filter(function (o) { return o !== id; }).map(function (o) {
      var oc = CL[o], score = 0;
      oc.concerns.forEach(function (k) { if (c.concerns.indexOf(k) !== -1) score += 2; });
      oc.clients.forEach(function (k) { if (c.clients.indexOf(k) !== -1) score += 1; });
      return { id: o, score: score };
    }).sort(function (a, b) { return b.score - a.score || IDS.indexOf(a.id) - IDS.indexOf(b.id); }).slice(0, 3);
    $('[data-p-related]').innerHTML = related.map(function (r) {
      var o = CL[r.id];
      return '<li><a href="' + profileUrl(r.id) + '" class="card card-hover group flex h-full items-center gap-4 p-4"><span class="arch block w-20 shrink-0 overflow-hidden border border-line bg-sage-50">' + portrait(o, 'block h-auto w-full') + '</span><span><span class="block font-display text-xl leading-tight text-ink group-hover:text-clay-700">' + esc(o.name) + '</span><span class="mt-1 block text-sm font-bold text-clay-700">' + esc(o.credential) + '</span><span class="mt-1 block text-[.93rem] leading-snug">' + esc(o.focus) + '</span></span></a></li>';
    }).join('');
  })();

  /* ======================================================================
     8. Groups (services.html, index.html): start dates from rules
     ====================================================================== */
  function nthWeekday(year, month, wd, nth) {
    var first = weekday(keyOf(year, month, 1));
    var day = 1 + ((wd - first + 7) % 7) + (nth - 1) * 7;
    var last = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return day <= last ? keyOf(year, month, day) : null;
  }
  function nextGroupStart(g) {
    var now = practiceNow(), earliest = addDays(now.key, D.GROUP_RULES.minLeadDays);
    for (var i = 0; i < D.GROUP_RULES.lookAheadMonths; i++) {
      var m = ((now.month - 1 + i) % 12) + 1, y = now.year + Math.floor((now.month - 1 + i) / 12);
      if (g.months.indexOf(m) === -1) continue;
      var key = nthWeekday(y, m, g.weekday, g.nth);
      // Skip a start that falls on a holiday (observed or on the calendar): the cohort begins in the next listed month instead.
      if (key && key >= earliest && !holidayOn(key) && !onFixedHoliday(key)) return key;
    }
    return null;
  }
  // The calendar date of a fixed holiday (New Year's Day on a Saturday) also stays free of group starts.
  function onFixedHoliday(key) {
    var m = Number(key.slice(5, 7)), d = Number(key.slice(8, 10));
    return D.HOLIDAYS.some(function (r) { return r.day === d && r.month === m; });
  }
  var DAY_PLURAL = ['Sundays', 'Mondays', 'Tuesdays', 'Wednesdays', 'Thursdays', 'Fridays', 'Saturdays'];
  function groupWhen(g, key, today) {
    if (!g.weeks) return longDate(key, today) + ', ' + fmtRange(g.start, g.end);
    return plural(g.weeks, DAY_PLURAL[g.weekday].slice(0, -1), DAY_PLURAL[g.weekday]) + ' from ' + shortDate(key, today).replace(/^\w+, /, '') + ', ' + fmtRange(g.start, g.end);
  }
  function groupFee(g) { return g.fee === 'workshop' ? money(D.FEES.workshopPerCouple) + ' per couple' : money(D.FEES.groupSession) + ' a session'; }
  var GROUP_DATES = D.GROUPS.map(function (g) { return { g: g, key: nextGroupStart(g) }; }).filter(function (x) { return x.key; });
  var groupsByDate = GROUP_DATES.slice().sort(function (a, b) { return a.key < b.key ? -1 : a.key > b.key ? 1 : 0; });

  var groupList = $('[data-groups]');
  if (groupList) {
    var today = practiceNow().key;
    groupList.innerHTML = groupsByDate.map(function (x, i) {
      var g = x.g;
      return '<li class="reveal flex flex-col rounded-[1.6rem] border border-white/10 bg-fir-800 p-6" style="--d:' + (i * 60) + 'ms">' +
        '<div class="flex items-start justify-between gap-3"><p class="text-xs font-bold tracking-[.14em] text-clay-200 uppercase">' + esc(g.who) + '</p><span class="pill shrink-0 bg-white/10 text-white">' + (g.format === 'video' ? ICON.video + 'Video' : ICON.pin + 'In person') + '</span></div>' +
        '<h3 class="mt-3 font-display text-[1.7rem] leading-tight text-white">' + esc(g.name) + '</h3><p class="text-white/80">' + esc(g.topic) + '</p>' +
        '<p class="mt-5 flex items-start gap-2.5 font-semibold text-white">' + ICON.calendar + '<span>' + esc(groupWhen(g, x.key, today)) + '</span></p>' +
        '<dl class="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-sm"><div><dt class="text-white/60">Led by</dt><dd class="text-white">' + g.leaders.map(function (l) { return '<a href="' + profileUrl(l) + '" class="underline decoration-white/30 underline-offset-4 hover:decoration-white">' + esc(CL[l].short) + '</a>'; }).join(' &amp; ') + '</dd></div><div><dt class="text-white/60">Fee</dt><dd class="text-white">' + esc(groupFee(g)) + '</dd></div><div><dt class="text-white/60">Group size</dt><dd class="text-white">Up to ' + g.size + ' ' + (g.fee === 'workshop' ? 'couples' : 'people') + '</dd></div><div><dt class="text-white/60">Length</dt><dd class="text-white">' + (g.weeks ? plural(g.weeks, 'week') : 'One day') + '</dd></div></dl>' +
        '<button type="button" class="btn btn-light btn-sm mt-6 self-start" data-group-pick="' + g.id + '">Join the interest list</button></li>';
    }).join('');
    groupList.addEventListener('click', function (e) {
      var b = e.target.closest('[data-group-pick]');
      if (!b) return;
      var s = $('[data-group-select]');
      s.value = b.getAttribute('data-group-pick');
      s.dispatchEvent(new Event('change'));
      $('[data-group-form]').scrollIntoView({ behavior: reduceMotion.matches ? 'auto' : 'smooth', block: 'center' });
      s.focus({ preventScroll: true });
    });
  }
  var nextGroups = $('[data-groups-next]');
  if (nextGroups) {
    var t0 = practiceNow().key;
    nextGroups.innerHTML = groupsByDate.slice(0, 3).map(function (x) {
      var g = x.g, d = x.key.split('-');
      return '<li class="flex gap-4"><span class="grid w-14 shrink-0 place-items-center rounded-2xl bg-sage-100 py-2 text-center leading-none text-sage-700"><span class="text-xs font-bold tracking-[.12em] uppercase">' + dateLabel(x.key, { month: 'short' }) + '</span><span class="mt-1 font-display text-2xl text-ink">' + Number(d[2]) + '</span></span><span><span class="block font-display text-xl leading-tight text-ink">' + esc(g.name) + '</span><span class="block text-[.95rem]">' + esc(g.topic) + '</span><span class="mt-0.5 block text-sm text-muted">' + esc(groupWhen(g, x.key, t0)) + '</span></span></li>';
    }).join('');
  }
  var soonest = $('[data-group-soonest]');
  if (soonest && groupsByDate.length) soonest.textContent = 'Next: ' + groupsByDate[0].g.name + ', from ' + shortDate(groupsByDate[0].key, practiceNow().key);

  /* ---------- Forms: shared validation helpers ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setError(input, errEl, msg) {
    if (input) { if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
    if (errEl) { errEl.textContent = msg || ''; errEl.hidden = !msg; }
    return !msg;
  }
  function phoneDigits(v) { var d = String(v || '').replace(/\D/g, ''); return d.length === 11 && d.charAt(0) === '1' ? d.slice(1) : d; }

  /* How to connect a real endpoint (Formspree, Basin, your own server):
       fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
         .then(function (r) { if (r.ok) showSuccess(); else showError(); });
     Show the success panel only when the service answers OK. See "Forms" in DOCS.md. */

  var groupForm = $('[data-group-form]');
  if (groupForm) (function () {
    var select = $('[data-group-select]', groupForm), t = practiceNow().key;
    groupsByDate.forEach(function (x) { select.insertAdjacentHTML('beforeend', '<option value="' + x.g.id + '">' + esc(x.g.name + ' · ' + (x.g.weeks ? 'starts ' : '') + shortDate(x.key, t)) + '</option>'); });
    var name = $('#g-name'), email = $('#g-email');
    function validate() {
      var ok = setError(select, $('#g-group-error'), select.value ? '' : 'Choose a group.');
      ok = setError(name, $('#g-name-error'), name.value.trim() ? '' : 'Enter your first name.') && ok;
      ok = setError(email, $('#g-email-error'), !email.value.trim() ? 'Enter your email address.' : EMAIL_RE.test(email.value.trim()) ? '' : 'Enter an email address like name@example.com.') && ok;
      return ok;
    }
    groupForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate()) { var bad = $('[aria-invalid="true"]', groupForm); if (bad) bad.focus(); return; }
      var x = GROUP_DATES.filter(function (gd) { return gd.g.id === select.value; })[0];
      var leader = CL[x.g.leaders[0]];
      var box = $('[data-group-success]');
      $('[data-group-success-title]', box).textContent = 'Thanks, ' + name.value.trim().split(/\s+/)[0] + '. You’re on the list for ' + x.g.name + '.';
      $('[data-group-success-text]', box).textContent = 'It ' + (x.g.weeks ? 'starts ' : 'runs ') + longDate(x.key, t) + '. ' + P.coordinatorFirst + ' will email you by 5 pm ' + longDate(nextBusinessDay(t, 1), t) + ' to set up a short pre-group call with ' + leader.short + '.';
      $('[data-group-ref]', box).textContent = makeRef();
      groupForm.hidden = true;
      box.hidden = false;
      box.focus();
    });
    groupForm.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid')) validate(); });
  })();

  /* ======================================================================
     9. Fees: fee table, sliding scale, insurance checker
     ====================================================================== */
  var feeBody = $('[data-fee-body]');
  if (feeBody) {
    var tierOrder = ['associate', 'licensed', 'psychologist'];
    $('[data-fee-head]').innerHTML = '<tr><th scope="col" class="px-5 py-4 font-bold">Session</th><th scope="col" class="px-5 py-4 font-bold">Length</th>' +
      tierOrder.map(function (t) { var tier = D.FEES.tiers[t]; return '<th scope="col" class="px-5 py-4 font-bold">' + esc(tier.label) + '<span class="block text-xs font-semibold text-muted">' + esc(tier.who) + '</span></th>'; }).join('') + '</tr>';
    feeBody.innerHTML = D.FEES.rows.map(function (r) {
      return '<tr><th scope="row" class="px-5 py-4 font-semibold text-ink">' + esc(r.label) + (r.code ? '<span class="block text-xs font-normal text-muted">CPT ' + esc(r.code) + '</span>' : '') + '</th><td class="px-5 py-4">' + esc(r.length) + '</td>' +
        tierOrder.map(function (t) { var v = D.FEES.tiers[t][r.id]; return '<td class="px-5 py-4 font-display text-xl text-ink">' + (v ? money(v) : 'Free') + '</td>'; }).join('') + '</tr>';
    }).join('');
  }

  /* Sliding scale: returns { pct, band, fee } for a household size and yearly income. */
  function slidingFee(size, income) {
    var S = D.SLIDING, guideline = S.base + S.perPerson * (size - 1);
    var pct = income / guideline * 100;
    for (var i = 0; i < S.bands.length; i++) if (pct <= S.bands[i].upTo) return { guideline: guideline, pct: pct, band: i, fee: S.bands[i].fee };
    return { guideline: guideline, pct: pct, band: -1, fee: null };
  }
  var slideForm = $('[data-sliding-form]');
  if (slideForm) (function () {
    var S = D.SLIDING, sizeSel = $('[data-sliding-size]'), income = $('[data-sliding-income]');
    for (var n = 1; n <= S.maxHousehold; n++) sizeSel.insertAdjacentHTML('beforeend', '<option value="' + n + '">' + (n === S.maxHousehold ? n + ' or more' : n) + '</option>');
    var bandsBody = $('[data-sliding-bands]');
    function bandRows(size) {
      var g = S.base + S.perPerson * (size - 1), prev = 0;
      return S.bands.map(function (b, i) {
        var top = Math.round(g * b.upTo / 100);
        var label = (i === 0 ? 'Up to ' : money(prev + 1) + ' – ') + money(top);
        prev = top;
        return '<tr data-band="' + i + '"><td class="px-4 py-2.5">' + label + '</td><td class="px-4 py-2.5 text-right font-display text-lg text-ink">' + money(b.fee) + '</td></tr>';
      }).join('') + '<tr data-band="-1"><td class="px-4 py-2.5">Over ' + money(prev) + '</td><td class="px-4 py-2.5 text-right text-ink">Standard fee</td></tr>';
    }
    var sliders = IDS.filter(function (id) { return CL[id].sliding; });
    function update() {
      var size = Number(sizeSel.value) || 1;
      bandsBody.innerHTML = bandRows(size);
      var raw = income.value.replace(/[$,\s]/g, '');
      var err = $('#s-income-error'), feeEl = $('[data-sliding-fee]'), text = $('[data-sliding-text]');
      if (!raw) {
        setError(income, err, '');
        feeEl.textContent = '—';
        text.textContent = 'Enter your household size and income to see your fee per individual session.';
        return;
      }
      if (!/^\d+(\.\d{1,2})?$/.test(raw) || Number(raw) > 10000000) {
        setError(income, err, 'Enter your yearly income as a number, like 45000.');
        feeEl.textContent = '—';
        text.textContent = 'We couldn’t read that amount.';
        return;
      }
      setError(income, err, '');
      var r = slidingFee(size, Number(raw)), pct = Math.round(r.pct);
      $$('tr', bandsBody).forEach(function (tr) {
        var on = Number(tr.getAttribute('data-band')) === r.band;
        tr.className = on ? 'bg-sage-100 font-bold text-ink' : '';
      });
      var who = listText(sliders.map(function (id) { return CL[id].first; }));
      if (r.fee === null) {
        feeEl.textContent = 'Standard fee';
        text.textContent = 'Your income is ' + pct + '% of the guideline for ' + plural(size, 'person', 'people') + ', above our sliding-scale range. Standard fees start at ' + money(D.FEES.tiers.associate.individual) + ' a session with our associate, Iver.';
      } else {
        feeEl.textContent = money(r.fee) + ' a session';
        text.textContent = 'Your income is ' + pct + '% of the federal poverty guideline for ' + plural(size, 'person', 'people') + '. That’s ' + money(r.fee) + ' per individual session with ' + who + ', instead of ' + money(D.FEES.tiers.associate.individual) + '–' + money(D.FEES.tiers.licensed.individual) + '.';
      }
    }
    sizeSel.addEventListener('change', update);
    income.addEventListener('input', update);
    slideForm.addEventListener('submit', function (e) { e.preventDefault(); update(); });
    var qs = Number(param('household')), qi = param('income');
    if (qs >= 1 && qs <= S.maxHousehold && Math.floor(qs) === qs) sizeSel.value = String(qs);
    if (qi && /^\d{1,8}$/.test(qi)) income.value = Number(qi).toLocaleString('en-US');
    update();
  })();

  function inNetwork(plan) { return IDS.filter(function (id) { return CL[id].insurance.indexOf(plan) !== -1; }); }
  function nameLinks(ids) { return listText(ids.map(function (id) { return '<a href="' + profileUrl(id) + '" class="text-link">' + esc(CL[id].name) + '</a>'; })); }
  var planCheck = $('[data-plan-check]');
  if (planCheck) (function () {
    Object.keys(D.PLANS).forEach(function (k) { planCheck.insertAdjacentHTML('beforeend', '<option value="' + k + '">' + esc(D.PLANS[k].name) + '</option>'); });
    planCheck.insertAdjacentHTML('beforeend', '<option value="other">Another plan</option>');
    var out = $('[data-plan-result]'), oon = $('[data-oon]'), share = $('[data-oon-share]');
    D.OON.shares.forEach(function (s) { share.insertAdjacentHTML('beforeend', '<option value="' + s + '">' + s + '% of the allowed amount</option>'); });
    share.value = String(D.OON.defaultShare);
    function oonText() {
      var pct = Number(share.value), back = Math.round(D.OON.allowed * pct / 100), std = D.FEES.tiers.licensed.individual;
      $('[data-oon-text]').textContent = 'You’d get back about ' + money(back) + ' per session, so a ' + money(std) + ' session with a licensed therapist would cost you about ' + money(std - back) + ' once your deductible is met.';
    }
    function render() {
      var k = planCheck.value;
      oon.hidden = true;
      if (!k) { out.innerHTML = '<p class="text-muted">Choose a plan to see how it works with us.</p>'; setParams({ plan: '' }); return; }
      var html;
      if (has(D.PLANS, k) && D.PLANS[k].type === 'in') {
        var ids = inNetwork(k);
        html = '<p class="pill pill-yes">In network</p><p class="mt-3 font-display text-2xl text-ink">' + esc(D.PLANS[k].name) + ' works with ' + String(NUMBER_WORDS[ids.length] || ids.length).toLowerCase() + ' of our clinicians.</p>' +
          '<p class="mt-2">' + nameLinks(ids) + '. You pay your plan’s copay or coinsurance, and nothing more for covered sessions. We confirm your benefits before your first session.</p>' +
          '<a href="team.html?plan=' + k + '" class="btn btn-fir btn-sm mt-4">See these clinicians</a>';
      } else if (has(D.PLANS, k) && D.PLANS[k].type === 'eap') {
        var e = inNetwork(k);
        html = '<p class="pill pill-yes">Employee assistance program</p><p class="mt-3 font-display text-2xl text-ink">Up to ' + plural(D.PLANS[k].sessions, 'session') + ' at no cost.</p>' +
          '<p class="mt-2">' + esc(D.PLANS[k].name) + ' sessions are available with ' + nameLinks(e) + '. Call your EAP first for an authorization number. After the free sessions, you can continue self-pay, on the sliding scale or with your health plan.</p>';
      } else {
        var name = has(D.PLANS, k) ? D.PLANS[k].name : 'Your plan';
        html = '<p class="pill pill-wait">Out of network</p><p class="mt-3 font-display text-2xl text-ink">' + esc(name) + ': we’ll give you a superbill.</p>' +
          '<p class="mt-2">You pay us at each session, and each month we give you a superbill with the codes and dates your plan needs. If your plan has out-of-network benefits, it pays you back part of the fee.</p>';
        oon.hidden = false;
        oonText();
      }
      out.innerHTML = html;
      setParams({ plan: k });
    }
    planCheck.addEventListener('change', render);
    share.addEventListener('change', oonText);
    var qp = param('plan');
    if (has(D.PLANS, qp) || qp === 'other') planCheck.value = qp;
    render();
  })();

  /* ======================================================================
     10. Choice inputs used by the quiz and the intake form
     ====================================================================== */
  function choices(name, type, items, cls) {
    return items.map(function (it) {
      return '<label class="choice ' + (cls || '') + '"><input type="' + type + '" name="' + name + '" value="' + esc(it[0]) + '"><span class="choice-box"><span class="choice-tick">' + ICON.check + '</span><span><span class="block font-bold text-ink">' + esc(it[1]) + '</span>' + (it[2] ? '<span class="mt-0.5 block text-sm text-muted">' + esc(it[2]) + '</span>' : '') + '</span></span></label>';
    }).join('');
  }
  function checkedValues(form, name) { return $$('input[name="' + name + '"]:checked', form).map(function (i) { return i.value; }); }
  function setChecked(form, name, values) {
    $$('input[name="' + name + '"]', form).forEach(function (i) { i.checked = values.indexOf(i.value) !== -1; });
  }
  var FORMAT_CHOICES = [['inperson', 'In person', 'At our Olympia office'], ['video', 'Video', 'Anywhere in Washington'], ['either', 'Either is fine', '']];
  var PAY_CHOICES = [['insurance', 'Health insurance', 'We’ll check your plan'], ['self', 'Paying myself', 'Card, HSA or FSA'], ['sliding', 'Sliding scale', 'Reduced fees from $40'], ['eap', 'Employee assistance (EAP)', 'Free sessions through work']];
  function stepNav(form, step) {
    $$('[data-step-dot]', form).forEach(function (li) {
      var n = Number(li.getAttribute('data-step-dot'));
      li.setAttribute('data-state', n < step ? 'done' : n === step ? 'current' : 'todo');
      if (n === step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
  }

  /* ======================================================================
     11. Match quiz (match.html)
     ====================================================================== */
  /* Ranks clinicians for a set of answers. Exposed as window.SOLACE.match for testing. */
  function matchClinicians(a) {
    var who = has(D.WHO, a.who) ? D.WHO[a.who].client : 'adults', pts = D.MATCH.points;
    var pool = IDS.filter(function (id) { return CL[id].clients.indexOf(who) !== -1; });
    var formatRelaxed = false;
    if (a.format === 'inperson' || a.format === 'video') {
      var f = pool.filter(function (id) { return CL[id].formats.indexOf(a.format) !== -1; });
      if (f.length) pool = f; else formatRelaxed = true;
    }
    var ranked = pool.map(function (id, order) {
      var c = CL[id], score = 0, reasons = [];
      var hit = (a.concerns || []).filter(function (k) { return c.concerns.indexOf(k) !== -1; });
      score += hit.length * pts.concern;
      if (hit.length) reasons.push('Works with ' + concernsText(hit));
      if (a.format === 'video' && c.formats.indexOf('video') !== -1) reasons.push('Offers video sessions anywhere in Washington');
      if (a.format === 'inperson' && c.formats.indexOf('inperson') !== -1) reasons.push('Sees clients in person in Olympia');
      var times = clinTimes(c).filter(function (t) { return (a.times || []).indexOf(t) !== -1; });
      score += times.length * pts.time;
      if (times.length) reasons.push('Has ' + listText(times.map(function (t) { return { daytime: 'daytime', evening: 'evening', saturday: 'Saturday' }[t]; })) + ' times');
      if (a.pay === 'insurance' && has(D.PLANS, a.plan) && c.insurance.indexOf(a.plan) !== -1) { score += pts.payment; reasons.push('In network with ' + D.PLANS[a.plan].name); }
      if (a.pay === 'sliding' && c.sliding) { score += pts.payment; reasons.push('Holds sliding-scale spots, from ' + money(D.SLIDING.bands[0].fee)); }
      if (a.pay === 'eap' && c.insurance.indexOf('harborlight') !== -1) { score += pts.payment; reasons.push('Sees ' + D.PLANS.harborlight.name + ' clients'); }
      if (c.accepting === 'yes') { score += pts.accepting; reasons.push('Accepting new clients'); } else reasons.push('Waitlist: ' + c.wait);
      return { id: id, score: score, reasons: reasons, order: order };
    }).sort(function (x, y) { return y.score - x.score || x.order - y.order; });
    return { results: ranked.slice(0, D.MATCH.results), formatRelaxed: formatRelaxed, client: who };
  }
  D.match = matchClinicians;

  function cleanMatch(raw) {
    if (!raw || typeof raw !== 'object') return null;
    var a = {
      who: has(D.WHO, raw.who) ? raw.who : '',
      concerns: Array.isArray(raw.concerns) ? raw.concerns.filter(function (k) { return has(D.CONCERNS, k); }).slice(0, D.MATCH.maxConcerns) : [],
      format: ['inperson', 'video', 'either'].indexOf(raw.format) !== -1 ? raw.format : '',
      times: Array.isArray(raw.times) ? raw.times.filter(function (k) { return has(D.TIMES, k); }) : [],
      pay: ['insurance', 'self', 'sliding', 'eap'].indexOf(raw.pay) !== -1 ? raw.pay : '',
      plan: has(D.PLANS, raw.plan) || raw.plan === 'other' ? raw.plan : '',
      done: raw.done === true
    };
    return a;
  }

  var matchForm = $('[data-match-form]');
  if (matchForm) (function () {
    $('[data-q-who]').innerHTML = choices('who', 'radio', Object.keys(D.WHO).map(function (k) { return [k, D.WHO[k].label]; }));
    $('[data-q-concerns]').innerHTML = choices('concerns', 'checkbox', Object.keys(D.CONCERNS).map(function (k) { return [k, D.CONCERNS[k].label]; }));
    $('[data-q-format]').innerHTML = choices('format', 'radio', FORMAT_CHOICES);
    $('[data-q-times]').innerHTML = choices('times', 'checkbox', [['daytime', 'Daytime', 'Weekdays, 8 am – 5 pm'], ['evening', 'Evenings', 'Weekdays after 5 pm'], ['saturday', 'Saturdays', 'Mornings, 9 am – 1 pm']]);
    $('[data-q-pay]').innerHTML = choices('pay', 'radio', PAY_CHOICES);
    var planSel = $('[data-q-plan]');
    Object.keys(D.PLANS).filter(function (k) { return D.PLANS[k].type !== 'eap'; }).forEach(function (k) { planSel.insertAdjacentHTML('beforeend', '<option value="' + k + '">' + esc(D.PLANS[k].name) + '</option>'); });
    planSel.insertAdjacentHTML('beforeend', '<option value="other">Another plan</option>');

    var step = 1, LAST = 5;
    var results = $('[data-match-results]');
    function answers() {
      var r = $('input[name="who"]:checked', matchForm), f = $('input[name="format"]:checked', matchForm), p = $('input[name="pay"]:checked', matchForm);
      return { who: r ? r.value : '', concerns: checkedValues(matchForm, 'concerns'), format: f ? f.value : '', times: checkedValues(matchForm, 'times'), pay: p ? p.value : '', plan: planSel.value };
    }
    function save(done) { var a = answers(); a.done = !!done; writeJSON(KEYS.match, a); }
    function restore(a) {
      setChecked(matchForm, 'who', [a.who]);
      setChecked(matchForm, 'concerns', a.concerns);
      setChecked(matchForm, 'format', [a.format]);
      setChecked(matchForm, 'times', a.times);
      setChecked(matchForm, 'pay', [a.pay]);
      planSel.value = a.plan;
      syncConcernLimit();
      syncPlan();
    }
    function syncConcernLimit() {
      var n = checkedValues(matchForm, 'concerns').length;
      $$('input[name="concerns"]', matchForm).forEach(function (i) { i.disabled = !i.checked && n >= D.MATCH.maxConcerns; });
    }
    function syncPlan() { $('[data-q-plan-wrap]').hidden = !(($('input[name="pay"]:checked', matchForm) || {}).value === 'insurance'); }
    function show(n, focus) {
      step = n;
      $$('[data-q]', matchForm).forEach(function (fs) { fs.hidden = Number(fs.getAttribute('data-q')) !== n; });
      stepNav(matchForm, n);
      $('[data-q-back]').hidden = n === 1;
      $('[data-q-spacer]').hidden = n !== 1;
      $('[data-q-next]').textContent = n === LAST ? 'See my suggestions' : 'Next';
      if (focus) $('[data-q="' + n + '"] [data-q-legend]').focus();
    }
    function stepError(msg) {
      var el = $('[data-q="' + step + '"] [data-q-error]');
      el.textContent = msg || ''; el.hidden = !msg;
      return !msg;
    }
    function validStep() {
      var a = answers();
      if (step === 1) return stepError(a.who ? '' : 'Choose who therapy is for.');
      if (step === 2) return stepError(a.concerns.length ? '' : 'Choose at least one thing you’d like help with.');
      if (step === 3) return stepError(a.format ? '' : 'Choose how you’d like to meet.');
      if (step === 4) return stepError(a.times.length ? '' : 'Choose at least one time that could work.');
      if (step === 5) {
        if (!a.pay) return stepError('Choose how you’re planning to pay.');
        if (a.pay === 'insurance' && !a.plan) return stepError('Choose your insurance plan, or “Another plan”.');
        return stepError('');
      }
      return true;
    }
    function renderResults(a, focus) {
      var r = matchClinicians(a), t = practiceNow().key;
      var n = r.results.length;
      $('[data-match-title]').textContent = (NUMBER_WORDS[n] || n) + ' ' + (n === 1 ? 'clinician who may fit' : 'clinicians who may fit');
      var bits = [D.WHO[a.who].label, a.concerns.map(function (k) { return D.CONCERNS[k].label; }).join(', '), a.format === 'either' ? 'In person or video' : D.FORMATS[a.format], a.times.map(function (k) { return D.TIMES[k]; }).join(', ')];
      var summary = 'Based on: ' + bits.join(' · ') + '.';
      if (r.formatRelaxed) summary += ' None of our clinicians who see ' + D.CLIENTS[r.client].toLowerCase().replace(/ \(.*\)/, '') + ' offer ' + D.FORMATS[a.format].toLowerCase() + ' sessions, so these suggestions are for ' + (a.format === 'video' ? 'in-person' : 'video') + ' sessions.';
      $('[data-match-summary]').textContent = summary;
      $('[data-match-list]').innerHTML = r.results.map(function (x, i) {
        var c = CL[x.id], next = nextConsult(x.id);
        var q = 'contact.html?clinician=' + x.id + '&from=match';
        return '<li class="card flex flex-col gap-6 p-5 sm:flex-row sm:p-7"><div class="flex shrink-0 gap-4 sm:block"><span class="arch block w-24 overflow-hidden border border-line bg-sage-50 sm:w-32">' + portrait(c, 'block h-auto w-full') + '</span></div>' +
          '<div class="min-w-0 flex-1"><p class="numeral">Suggestion ' + (i + 1) + '</p><h3 class="mt-1 font-display text-[1.7rem] leading-tight"><a href="' + profileUrl(x.id) + '" class="hover:text-clay-700">' + esc(fullName(c)) + '</a></h3><p class="text-sm text-muted">' + esc(c.role) + '</p>' +
          '<ul class="tick-list mt-4 grid gap-1.5 text-ink">' + x.reasons.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ul>' +
          '<p class="mt-4 text-sm">' + money(fee(c, a.who === 'couple' || a.who === 'family' ? 'couples' : 'individual')) + ' a session' + (next ? ' · Next free consultation ' + esc(shortDate(next, t)) : '') + '</p>' +
          '<div class="mt-5 flex flex-wrap gap-2"><a href="' + q + '" class="btn btn-primary btn-sm">' + ICON.calendar + (c.accepting === 'yes' ? 'Request a consultation with ' + esc(c.first) : 'Join ' + esc(c.first) + '’s waitlist') + '</a><a href="' + profileUrl(x.id) + '" class="btn btn-outline btn-sm">View profile</a></div></div></li>';
      }).join('');
      results.hidden = false;
      matchForm.hidden = true;
      if (focus) { results.focus(); results.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' }); }
    }
    matchForm.addEventListener('change', function (e) {
      if (e.target.name === 'concerns') syncConcernLimit();
      if (e.target.name === 'pay') syncPlan();
      stepError('');
      save(false);
    });
    matchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validStep()) { var first = $('[data-q="' + step + '"] input:not(:disabled), [data-q="' + step + '"] select', matchForm); if (step === 5 && answers().pay === 'insurance') first = planSel; if (first) first.focus(); return; }
      if (step < LAST) { show(step + 1, true); return; }
      save(true);
      renderResults(answers(), true);
    });
    $('[data-q-back]').addEventListener('click', function () { if (step > 1) show(step - 1, true); });
    $('[data-match-edit]').addEventListener('click', function () { results.hidden = true; matchForm.hidden = false; show(1, true); });
    $('[data-match-reset]').addEventListener('click', function () {
      removeKey(KEYS.match);
      matchForm.reset(); syncConcernLimit(); syncPlan();
      results.hidden = true; matchForm.hidden = false; show(1, true);
    });

    var saved = cleanMatch(readJSON(KEYS.match));
    if (saved) restore(saved);
    show(1, false);
    if (saved && saved.done && saved.who && saved.concerns.length && saved.format && saved.times.length && saved.pay) renderResults(saved, false);
  })();

  /* ======================================================================
     12. Consultation request (contact.html): three steps, prefilled from the URL
     ====================================================================== */
  var intake = $('[data-intake-form]');
  if (intake) (function () {
    var TIME_SLOTS = [['mornings', 'Weekday mornings', '8 am – noon'], ['afternoons', 'Weekday afternoons', 'Noon – 5 pm'], ['evenings', 'Weekday evenings', '5 – 8 pm'], ['saturday', 'Saturday mornings', '9 am – 1 pm']];
    var CONTACT = [['phone', 'Phone call'], ['text', 'Text message'], ['email', 'Email']];
    var PAY = PAY_CHOICES.concat([['unsure', 'Not sure yet', 'We can talk it through']]);
    $('[data-i-who]').innerHTML = choices('who', 'radio', Object.keys(D.WHO).map(function (k) { return [k, D.WHO[k].label]; }));
    $('[data-i-format]').innerHTML = choices('format', 'radio', FORMAT_CHOICES);
    $('[data-i-pay]').innerHTML = choices('pay', 'radio', PAY);
    $('[data-i-times]').innerHTML = choices('times', 'checkbox', TIME_SLOTS);
    $('[data-i-contact]').innerHTML = choices('contact', 'radio', CONTACT);
    $('[data-i-voicemail]').innerHTML = choices('voicemail', 'radio', [['yes', 'Yes, that’s fine'], ['no', 'No, please be discreet']]);
    var clinSel = $('[data-i-clinician]'), planSel = $('[data-i-plan]');
    IDS.forEach(function (id) { var c = CL[id]; clinSel.insertAdjacentHTML('beforeend', '<option value="' + id + '">' + esc(fullName(c)) + (c.accepting === 'yes' ? '' : ' (waitlist)') + '</option>'); });
    Object.keys(D.PLANS).filter(function (k) { return D.PLANS[k].type !== 'eap'; }).forEach(function (k) { planSel.insertAdjacentHTML('beforeend', '<option value="' + k + '">' + esc(D.PLANS[k].name) + '</option>'); });
    planSel.insertAdjacentHTML('beforeend', '<option value="other">Another plan</option>');

    var step = 1, LAST = 3;
    function radio(name) { var r = $('input[name="' + name + '"]:checked', intake); return r ? r.value : ''; }
    function draft() {
      return { who: radio('who'), format: radio('format'), clinician: clinSel.value, pay: radio('pay'), plan: planSel.value, times: checkedValues(intake, 'times'), contact: radio('contact'), voicemail: radio('voicemail') };
    }
    function cleanDraft(raw) {
      if (!raw || typeof raw !== 'object') return {};
      var pick = function (v, list) { return list.indexOf(v) !== -1 ? v : ''; };
      return {
        who: has(D.WHO, raw.who) ? raw.who : '',
        format: pick(raw.format, ['inperson', 'video', 'either']),
        clinician: has(CL, raw.clinician) ? raw.clinician : '',
        pay: pick(raw.pay, PAY.map(function (p) { return p[0]; })),
        plan: has(D.PLANS, raw.plan) && D.PLANS[raw.plan].type !== 'eap' || raw.plan === 'other' ? raw.plan : '',
        times: Array.isArray(raw.times) ? raw.times.filter(function (t) { return TIME_SLOTS.some(function (s) { return s[0] === t; }); }) : [],
        contact: pick(raw.contact, ['phone', 'text', 'email']),
        voicemail: pick(raw.voicemail, ['yes', 'no'])
      };
    }
    function apply(d) {
      if (d.who) setChecked(intake, 'who', [d.who]);
      if (d.format) setChecked(intake, 'format', [d.format]);
      if (d.clinician) clinSel.value = d.clinician;
      if (d.pay) setChecked(intake, 'pay', [d.pay]);
      if (d.plan) planSel.value = d.plan;
      if (d.times && d.times.length) setChecked(intake, 'times', d.times);
      if (d.contact) setChecked(intake, 'contact', [d.contact]);
      if (d.voicemail) setChecked(intake, 'voicemail', [d.voicemail]);
    }
    // Start from the saved draft, then the quiz answers (from=match), then the URL, each overriding the last.
    apply(cleanDraft(readJSON(KEYS.intake)));
    if (param('from') === 'match') {
      var m = cleanMatch(readJSON(KEYS.match));
      if (m) {
        var times = [];
        if (m.times.indexOf('daytime') !== -1) times.push('mornings', 'afternoons');
        if (m.times.indexOf('evening') !== -1) times.push('evenings');
        if (m.times.indexOf('saturday') !== -1) times.push('saturday');
        apply({ who: m.who, format: m.format, pay: m.pay, plan: m.plan, times: times });
      }
    }
    apply(cleanDraft({ who: param('who'), format: param('format'), clinician: param('clinician'), pay: param('pay'), plan: param('plan') }));

    function summary() {
      var d = draft(), rows = [];
      var label = function (list, v) { var f = list.filter(function (x) { return x[0] === v; })[0]; return f ? f[1] : ''; };
      rows.push(['For', d.who ? D.WHO[d.who].label : '']);
      rows.push(['Meeting', label(FORMAT_CHOICES, d.format)]);
      rows.push(['Clinician', d.clinician ? CL[d.clinician].name : 'Suggest someone']);
      rows.push(['Paying', label(PAY, d.pay) + (d.pay === 'insurance' && d.plan ? ' · ' + (d.plan === 'other' ? 'another plan' : D.PLANS[d.plan].name) : '')]);
      rows.push(['Times', listText(d.times.map(function (t) { return label(TIME_SLOTS, t).replace('Weekday ', '').replace('Saturday mornings', 'Saturdays'); })).replace(/^./, function (s) { return s.toUpperCase(); })]);
      rows.push(['Contact by', label(CONTACT, d.contact)]);
      $('[data-intake-summary]').innerHTML = rows.map(function (r) { return '<div class="flex justify-between gap-4"><dt class="text-muted">' + r[0] + '</dt><dd class="text-right font-semibold text-ink">' + (r[1] ? esc(r[1]) : '<span class="font-normal text-muted">Not chosen yet</span>') + '</dd></div>'; }).join('');
    }
    function clinicianHint() {
      var id = clinSel.value, hint = $('[data-i-clinician-hint]'), d = draft();
      if (!id) { hint.textContent = 'We’ll suggest a good fit if you’re not sure.'; return; }
      var c = CL[id], next = nextConsult(id), notes = [];
      notes.push(next ? c.first + ' is accepting new clients. Next free consultation: ' + longDate(next, practiceNow().key) + '.' : c.first + ' has a waitlist of ' + c.wait + '. We’ll add you and can suggest someone sooner.');
      if ((d.format === 'video' || d.format === 'inperson') && c.formats.indexOf(d.format) === -1) notes.push(c.first + ' works ' + (c.formats[0] === 'video' ? 'by video only.' : 'in person only.'));
      if (d.who && c.clients.indexOf(D.WHO[d.who].client) === -1) notes.push(c.first + ' doesn’t usually see ' + D.CLIENTS[D.WHO[d.who].client].toLowerCase().replace(/ \(.*\)/, '') + '; we’ll suggest someone who does.');
      hint.textContent = notes.join(' ');
    }
    function syncPlan() { $('[data-i-plan-wrap]').hidden = radio('pay') !== 'insurance'; }
    function syncPhone() {
      var c = radio('contact');
      $('[data-phone-optional]').textContent = c === 'phone' || c === 'text' ? '(needed to call or text you)' : '(optional)';
    }
    function persist() { writeJSON(KEYS.intake, draft()); }
    function show(n, focus) {
      step = n;
      $$('[data-step]', intake).forEach(function (el) { el.hidden = Number(el.getAttribute('data-step')) !== n; });
      stepNav(intake, n);
      $('[data-i-back]').hidden = n === 1;
      $('[data-i-spacer]').hidden = n !== 1;
      $('[data-i-next]').textContent = n === LAST ? 'Send my request' : 'Next';
      if (focus) $('[data-step="' + n + '"] [data-step-title]').focus();
    }
    function groupError(name, msg) { var el = $('[data-error-for="' + name + '"]', intake); el.textContent = msg || ''; el.hidden = !msg; return !msg; }
    function validate(n) {
      var d = draft(), ok = true;
      if (n === 1) {
        ok = groupError('who', d.who ? '' : 'Choose who the consultation is for.') && ok;
        ok = groupError('format', d.format ? '' : 'Choose how you’d like to meet.') && ok;
        ok = groupError('pay', d.pay ? '' : 'Choose how you’re planning to pay, or “Not sure yet”.') && ok;
        if (d.pay === 'insurance') ok = setError(planSel, $('#i-plan-error'), d.plan ? '' : 'Choose your plan, or “Another plan”.') && ok;
        else setError(planSel, $('#i-plan-error'), '');
      }
      if (n === 2) {
        ok = groupError('times', d.times.length ? '' : 'Choose at least one time that could work.') && ok;
        ok = groupError('contact', d.contact ? '' : 'Choose how we should contact you.') && ok;
      }
      if (n === 3) {
        var first = $('#i-first'), last = $('#i-last'), email = $('#i-email'), phone = $('#i-phone'), adult = $('[data-i-adult]');
        ok = setError(first, $('#i-first-error'), first.value.trim() ? '' : 'Enter your first name, or the name you go by.') && ok;
        ok = setError(last, $('#i-last-error'), last.value.trim() ? '' : 'Enter your last name.') && ok;
        var ev = email.value.trim();
        ok = setError(email, $('#i-email-error'), !ev ? 'Enter your email address.' : EMAIL_RE.test(ev) ? '' : 'Enter an email address like name@example.com.') && ok;
        var digits = phoneDigits(phone.value), needPhone = d.contact === 'phone' || d.contact === 'text';
        var pmsg = '';
        if (needPhone && !digits) pmsg = 'Enter a phone number so we can ' + (d.contact === 'text' ? 'text' : 'call') + ' you.';
        else if (digits && digits.length !== 10) pmsg = 'Enter a 10-digit US phone number, like (360) 555-0100.';
        ok = setError(phone, $('#i-phone-error'), pmsg) && ok;
        ok = setError(adult, $('#i-adult-error'), adult.checked ? '' : 'Please confirm. If you’re asking for a younger child, a parent or guardian should fill in this form.') && ok;
      }
      return ok;
    }
    function focusFirstError() {
      var bad = $('[data-step="' + step + '"] [aria-invalid="true"]', intake);
      if (!bad) { var g = $$('[data-step="' + step + '"] [data-error-for]:not([hidden])', intake)[0]; if (g) bad = $('input', g.parentNode); }
      if (bad) bad.focus();
    }
    intake.addEventListener('change', function (e) {
      if (e.target.name === 'pay') syncPlan();
      if (e.target.name === 'contact') syncPhone();
      if (e.target.name && (e.target.type === 'radio' || e.target.type === 'checkbox')) { var g = $('[data-error-for="' + e.target.name + '"]', intake); if (g) { g.hidden = true; } }
      if (e.target === planSel && planSel.value) setError(planSel, $('#i-plan-error'), '');
      if (step < 3) persist();
      summary(); clinicianHint();
    });
    intake.addEventListener('input', function (e) {
      if (e.target.id === 'i-note') $('[data-note-count]').textContent = plural(300 - e.target.value.length, 'character') + ' left';
      if (e.target.getAttribute('aria-invalid')) validate(3);
    });
    $('[data-i-back]').addEventListener('click', function () { if (step > 1) show(step - 1, true); });
    intake.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(step)) { focusFirstError(); return; }
      if (step < LAST) { persist(); show(step + 1, true); return; }
      // Connect your form service here (see the comment above section 9 and "Forms" in DOCS.md).
      var d = draft(), first = $('#i-first').value.trim().split(/\s+/)[0], t = practiceNow().key;
      var replyDay = nextBusinessDay(t, P.replyBusinessDays);
      var how = { phone: 'call you', text: 'text you', email: 'email you' }[d.contact];
      var box = $('[data-intake-success]');
      $('[data-s-title]', box).textContent = 'Thank you, ' + first + '. Your request is in.';
      $('[data-s-text]', box).textContent = 'We’ve received your request for a free 15-minute consultation' + (d.clinician ? ' with ' + CL[d.clinician].name : '') + '.' + (d.clinician && CL[d.clinician].accepting !== 'yes' ? ' ' + CL[d.clinician].first + ' has a waitlist of ' + CL[d.clinician].wait + ', so we’ll also mention who could see you sooner.' : '');
      $('[data-s-ref]', box).textContent = makeRef();
      $('[data-s-step1]', box).textContent = P.coordinatorFirst + ', our intake coordinator, will ' + how + ' by 5 pm on ' + longDate(replyDay, t) + ' (within one business day) to find a time for your call.' + (d.voicemail === 'no' ? ' Any message will just say it’s ' + P.coordinatorFirst + ' calling back.' : '');
      removeKey(KEYS.intake);
      intake.hidden = true;
      $('[data-intake-summary-box]').hidden = true;
      box.hidden = false;
      box.focus();
      box.scrollIntoView({ block: 'start', behavior: reduceMotion.matches ? 'auto' : 'smooth' });
    });
    $('[data-s-another]').addEventListener('click', function () {
      intake.reset();
      $$('[aria-invalid]', intake).forEach(function (el) { el.removeAttribute('aria-invalid'); });
      $$('.field-error', intake).forEach(function (el) { el.hidden = true; });
      $('[data-note-count]').textContent = '300 characters left';
      $('[data-intake-success]').hidden = true;
      $('[data-intake-summary-box]').hidden = false;
      intake.hidden = false;
      syncPlan(); syncPhone(); summary(); clinicianHint();
      show(1, true);
    });
    syncPlan(); syncPhone(); summary(); clinicianHint();
    show(1, false);
  })();

  /* ======================================================================
     13. FAQ: search and open all
     ====================================================================== */
  var faqSearch = $('[data-faq-search]');
  if (faqSearch) (function () {
    var items = $$('[data-faq-item]'), groups = $$('[data-faq-group]');
    function run() {
      var q = faqSearch.value.trim().toLowerCase(), shown = 0;
      items.forEach(function (d) {
        var hit = !q || d.textContent.toLowerCase().indexOf(q) !== -1;
        d.hidden = !hit;
        if (hit) shown++;
        if (q && hit) d.open = true;
      });
      groups.forEach(function (g) { g.hidden = !$$('[data-faq-item]', g).some(function (d) { return !d.hidden; }); });
      $('[data-faq-empty]').hidden = shown > 0;
      $('[data-faq-count]').textContent = q ? plural(shown, 'answer') + ' found' : plural(items.length, 'question');
    }
    faqSearch.addEventListener('input', run);
    var q0 = param('q');
    if (q0 && q0.length < 60) { faqSearch.value = q0; run(); }
    var expand = $('[data-faq-expand]');
    if (expand) expand.addEventListener('click', function () {
      var open = expand.getAttribute('data-open') !== 'true';
      items.forEach(function (d) { d.open = open; });
      expand.setAttribute('data-open', String(open));
      expand.textContent = open ? 'Close all answers' : 'Open all answers';
    });
    // Open the answer a link points at (faq.html#money opens that topic's first answer).
    var h = (window.location.hash || '').slice(1);
    var target = h && document.getElementById(h);
    if (target && target.matches('[data-faq-group]')) { var first = $('[data-faq-item]', target); if (first) first.open = true; }
  })();

  initReveal();
})();
