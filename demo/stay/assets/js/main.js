/* Casa Marea — Stay template. Vanilla JavaScript, no dependencies.
 *
 * Sections
 *  1. Data and helpers          6. Rooms filter         11. Contact topic prefill
 *  2. Dates                     7. Room page            12. Booking flow
 *  3. Prices and offers         8. Dining menu tabs     13. Forms
 *  4. Availability              9. Experiences filter   14. Header, menu, reveal
 *  5. Saved booking draft      10. Offer codes          15. Back to top
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

  /* ------------------------------------------------------------------
   * 1. Data and helpers
   * ------------------------------------------------------------------ */
  // Rooms, extras and offers. Edit them here (prices are per night, in US dollars).
  var DATA = {
  "rooms": [
    {
      "id": "sea",
      "name": "Sea View Room",
      "view": "sea",
      "bed": "king",
      "capacity": 2,
      "size": 300,
      "rate": 360,
      "short": "Arched doors open onto a balcony and the whole bay.",
      "description": "Our most-loved room: lime-washed walls, a rattan king bed and tall arched doors that open onto a balcony above the bay. Mornings bring fishing boats leaving the harbor; evenings, the lights of Newport.",
      "highlights": [
        "Balcony with sea view",
        "King bed with linen sheets",
        "Rain shower"
      ]
    },
    {
      "id": "suite",
      "name": "Marea Suite",
      "view": "sea",
      "bed": "king",
      "capacity": 3,
      "size": 690,
      "rate": 780,
      "short": "Corner suite with a private terrace and plunge pool.",
      "description": "The top-floor corner of the house, with a living room, a freestanding bath and a private terrace with a heated plunge pool facing the sunset. A sofa bed sleeps a third guest.",
      "highlights": [
        "Private terrace with plunge pool",
        "Separate living room",
        "Freestanding bath"
      ]
    },
    {
      "id": "pool",
      "name": "Pool Terrace Room",
      "view": "pool",
      "bed": "king",
      "capacity": 2,
      "size": 320,
      "rate": 310,
      "short": "Steps from the infinity pool, with its own terrace.",
      "description": "On the pool level, with a shaded terrace and a gate that opens straight onto the loungers. Ideal for long, slow afternoons between swims.",
      "highlights": [
        "Private terrace onto the pool",
        "King bed",
        "Outdoor shower"
      ]
    },
    {
      "id": "twin",
      "name": "Sea View Twin",
      "view": "sea",
      "bed": "twin",
      "capacity": 3,
      "size": 345,
      "rate": 380,
      "short": "Two beds, a daybed and the same view of the bay.",
      "description": "Two generous twin beds that can be pushed together, a daybed for a third guest and a balcony over the water. Good for friends traveling together or a parent with a child.",
      "highlights": [
        "Two twin beds",
        "Daybed for a third guest",
        "Balcony with sea view"
      ]
    },
    {
      "id": "garden",
      "name": "Garden Room",
      "view": "garden",
      "bed": "king",
      "capacity": 2,
      "size": 260,
      "rate": 240,
      "short": "Quiet room among the hydrangeas and lavender.",
      "description": "Our quietest rooms open onto the terraced garden of hydrangeas, lavender and beach roses. Cool in summer, with a small patio for breakfast in the shade.",
      "highlights": [
        "Garden patio",
        "King bed",
        "Quietest side of the house"
      ]
    },
    {
      "id": "family",
      "name": "Family Suite",
      "view": "garden",
      "bed": "king",
      "capacity": 4,
      "size": 560,
      "rate": 520,
      "short": "Two rooms for four, opening onto the garden.",
      "description": "A king bedroom and a second room with two twin beds, connected by a small hall, plus a garden terrace big enough for breakfast together. Cribs and children's robes are ready on request.",
      "highlights": [
        "Two bedrooms",
        "Sleeps four",
        "Garden terrace"
      ]
    }
  ],
  "extras": [
    {
      "id": "breakfast",
      "name": "Breakfast on the terrace",
      "price": 28,
      "unit": "per guest per night",
      "text": "Pastries from a bakery on Thames Street, fruit, eggs any way and real espresso."
    },
    {
      "id": "transfer",
      "name": "Round-trip airport transfer",
      "price": 220,
      "unit": "per stay",
      "text": "A driver meets you at T.F. Green Airport and brings you back at the end of your stay."
    },
    {
      "id": "late",
      "name": "Late check-out (3 pm)",
      "price": 60,
      "unit": "per stay",
      "text": "One more swim before you go. Subject to availability; we'll confirm the day before."
    },
    {
      "id": "spa",
      "name": "Hot stone ritual",
      "price": 195,
      "unit": "per stay",
      "text": "A 90-minute treatment in the spa for one guest, booked for a time that works for you."
    },
    {
      "id": "prosecco",
      "name": "Welcome prosecco",
      "price": 45,
      "unit": "per stay",
      "text": "A chilled bottle and local olives waiting in the room when you arrive."
    }
  ],
  "promos": [
    {
      "code": "LONGSTAY",
      "name": "Stay longer",
      "percent": 15,
      "minNights": 4,
      "advanceDays": 0,
      "rooms": [],
      "summary": "15% off the room rate when you stay four nights or more.",
      "terms": "Minimum stay four nights. Applies to the room rate, not extras. Not combinable with other offers."
    },
    {
      "code": "EARLYSUN",
      "name": "Early summer",
      "percent": 10,
      "minNights": 2,
      "advanceDays": 60,
      "rooms": [],
      "summary": "10% off when you book at least 60 days ahead.",
      "terms": "Arrival at least 60 days after booking. Minimum stay two nights. Non-refundable after 30 days before arrival."
    },
    {
      "code": "HONEYMOON",
      "name": "Honeymoon",
      "percent": 12,
      "minNights": 3,
      "advanceDays": 0,
      "rooms": [
        "suite",
        "sea"
      ],
      "summary": "12% off a Sea View Room or the Marea Suite, plus prosecco on arrival.",
      "terms": "Sea View Room or Marea Suite only. Minimum stay three nights. Proof of marriage not required."
    }
  ],
  "amenities": [
    "Linen sheets and down pillows",
    "Air conditioning and ceiling fan",
    "Fast Wi-Fi",
    "Espresso machine",
    "Minibar with Rhode Island wines",
    "Natural bath products",
    "Bathrobes and beach bag",
    "Daily housekeeping"
  ]
};
  var ROOMS = DATA.rooms;
  var EXTRAS = DATA.extras;
  var PROMOS = DATA.promos;

  var WEEKEND_UPLIFT = 0.15;       // Friday and Saturday nights cost 15% more
  var EXTRA_ADULT = 45;            // per night, for each adult beyond two
  var EXTRA_CHILD = 25;            // per night, for each child beyond two guests
  var VAT_RATE = 0.14;             // Rhode Island sales tax (7%), state hotel tax (5%) and local hotel tax (2%), added to the total
  var MAX_NIGHTS = 21;

  var VIEW_LABEL = { sea: 'Sea view', garden: 'Garden view', pool: 'Pool view' };
  var BED_LABEL = { king: 'King bed', twin: 'Twin beds' };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function findRoom(id) { return ROOMS.filter(function (r) { return r.id === id; })[0] || null; }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function money(n) {
    var whole = Math.round(n * 100) % 100 === 0;
    return '$' + n.toLocaleString('en-US', { minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 });
  }
  function clampInt(v, min, max, fallback) {
    var n = typeof v === 'number' ? v : parseInt(v, 10);
    if (!isFinite(n) || Math.floor(n) !== n) return fallback;
    return Math.min(max, Math.max(min, n));
  }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2600);
  }

  /* ------------------------------------------------------------------
   * 2. Dates — ISO strings (YYYY-MM-DD) handled in UTC to avoid time-zone drift
   * ------------------------------------------------------------------ */
  var ISO = /^\d{4}-\d{2}-\d{2}$/;
  function parseISO(s) {
    if (typeof s !== 'string' || !ISO.test(s)) return null;
    var p = s.split('-').map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    return d.getUTCMonth() === p[1] - 1 && d.getUTCDate() === p[2] ? d : null;
  }
  // A short reference for a confirmation, like CM-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  function toISO(d) { return d.toISOString().slice(0, 10); }
  function todayISO() {
    var n = new Date();
    return toISO(new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())));
  }
  function addDays(iso, days) { var d = parseISO(iso); d.setUTCDate(d.getUTCDate() + days); return toISO(d); }
  function nightsBetween(a, b) {
    var da = parseISO(a), db = parseISO(b);
    return da && db ? Math.round((db - da) / 86400000) : 0;
  }
  var dayFmt = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  var monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
  function fmtDay(iso) { var d = parseISO(iso); return d ? dayFmt.format(d) : ''; }

  // Validate a check-in/check-out pair; returns { ok, field, message }.
  function checkDates(checkin, checkout) {
    var today = todayISO();
    if (!parseISO(checkin)) return { ok: false, field: 'checkin', message: 'Choose your arrival date.' };
    if (checkin < today) return { ok: false, field: 'checkin', message: 'Arrival can’t be in the past.' };
    if (!parseISO(checkout)) return { ok: false, field: 'checkout', message: 'Choose your departure date.' };
    var n = nightsBetween(checkin, checkout);
    if (n < 1) return { ok: false, field: 'checkout', message: 'Departure must be after arrival.' };
    if (n > MAX_NIGHTS) return { ok: false, field: 'checkout', message: 'Stays of up to ' + MAX_NIGHTS + ' nights can be booked online.' };
    return { ok: true };
  }

  /* ------------------------------------------------------------------
   * 3. Prices and offers
   * ------------------------------------------------------------------ */
  function promoFor(code) {
    code = String(code || '').trim().toUpperCase();
    return PROMOS.filter(function (p) { return p.code === code; })[0] || null;
  }
  // Is the code valid for this stay? Returns { ok, promo, message }.
  function checkPromo(code, stay) {
    if (!code) return { ok: false, message: '' };
    var p = promoFor(code);
    if (!p) return { ok: false, message: 'That code isn’t valid.' };
    var nights = nightsBetween(stay.checkin, stay.checkout);
    if (nights < p.minNights) return { ok: false, promo: p, message: p.name + ' needs a stay of at least ' + p.minNights + ' nights.' };
    if (p.advanceDays && nightsBetween(todayISO(), stay.checkin) < p.advanceDays) return { ok: false, promo: p, message: p.name + ' needs arrival at least ' + p.advanceDays + ' days from today.' };
    if (p.rooms.length && p.rooms.indexOf(stay.room) === -1) return { ok: false, promo: p, message: p.name + ' applies to ' + p.rooms.map(function (id) { return findRoom(id).name; }).join(' or ') + ' only.' };
    return { ok: true, promo: p, message: p.name + ': ' + p.percent + '% off the room rate.' };
  }

  // Full price for a stay. Rates and extras exclude tax; the total includes it (VAT_RATE).
  function quote(stay) {
    var room = findRoom(stay.room);
    var nights = nightsBetween(stay.checkin, stay.checkout);
    if (!room || nights < 1) return null;
    var roomTotal = 0, weekendNights = 0;
    for (var i = 0; i < nights; i++) {
      var day = parseISO(addDays(stay.checkin, i)).getUTCDay();
      var weekend = day === 5 || day === 6;
      if (weekend) weekendNights++;
      roomTotal += Math.round(room.rate * (weekend ? 1 + WEEKEND_UPLIFT : 1));
    }
    var adults = stay.adults, children = stay.children;
    var extraAdults = Math.max(0, adults - 2);
    var extraChildren = Math.max(0, adults + children - 2 - extraAdults);
    var extraGuests = (extraAdults * EXTRA_ADULT + extraChildren * EXTRA_CHILD) * nights;
    var extras = (stay.extras || []).map(function (id) {
      var x = EXTRAS.filter(function (e) { return e.id === id; })[0];
      if (!x) return null;
      var amount = id === 'breakfast' ? x.price * (adults + children) * nights : x.price;
      return { id: id, name: x.name, amount: amount };
    }).filter(Boolean);
    var extrasTotal = extras.reduce(function (s, x) { return s + x.amount; }, 0);
    var promo = checkPromo(stay.promo, stay);
    var discount = promo.ok ? Math.round(roomTotal * promo.promo.percent / 100) : 0;
    var subtotal = roomTotal + extraGuests + extrasTotal - discount;
    var tax = Math.round(subtotal * VAT_RATE * 100) / 100;
    return {
      room: room, nights: nights, weekendNights: weekendNights, roomTotal: roomTotal,
      extraGuests: extraGuests, extras: extras, discount: discount, promo: promo,
      total: Math.round((subtotal + tax) * 100) / 100, vat: tax,
    };
  }

  function breakdownHTML(q) {
    var rows = [
      [q.nights + (q.nights === 1 ? ' night' : ' nights') + (q.weekendNights ? ' (incl. ' + q.weekendNights + ' weekend)' : ''), money(q.roomTotal)],
    ];
    if (q.extraGuests) rows.push(['Extra guests', money(q.extraGuests)]);
    q.extras.forEach(function (x) { rows.push([x.name, money(x.amount)]); });
    if (q.discount) rows.push([q.promo.promo.name + ' (' + q.promo.promo.code + ')', '−' + money(q.discount)]);
    rows.push(['Estimated sales and hotel tax (14%)', money(q.vat)]);
    return '<dl class="space-y-2.5">' + rows.map(function (r) {
      return '<div class="flex justify-between gap-4"><dt class="text-mist">' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd></div>';
    }).join('') +
      '<div class="flex justify-between gap-4 border-t border-line pt-3 text-base"><dt class="font-medium">Total</dt><dd class="font-display text-2xl">' + money(q.total) + '</dd></div>' +
      '<div class="flex justify-between gap-4 text-xs text-mist"><dt>Rates and extras are shown before tax.</dt></div>' +
      '</dl>';
  }

  /* ------------------------------------------------------------------
   * 4. Availability (demo data: a deterministic pattern of booked nights)
   *    Replace isBlocked() with a call to your reservations system.
   * ------------------------------------------------------------------ */
  function isBlocked(roomId, iso) {
    var idx = ROOMS.map(function (r) { return r.id; }).indexOf(roomId);
    var day = Math.floor(parseISO(iso).getTime() / 86400000);
    return ((day * 37 + (idx + 1) * 101) % 19) < 3;
  }
  // First booked night in [checkin, checkout), or null if the room is free.
  function firstBlocked(roomId, checkin, checkout) {
    var n = nightsBetween(checkin, checkout);
    for (var i = 0; i < n; i++) { var d = addDays(checkin, i); if (isBlocked(roomId, d)) return d; }
    return null;
  }

  /* ------------------------------------------------------------------
   * 5. Saved booking draft (localStorage). Everything read back is validated:
   *    corrupt or tampered values are dropped and storage is repaired.
   * ------------------------------------------------------------------ */
  var DRAFT_KEY = 'casa-marea:booking:v1';
  var EXTRA_IDS = EXTRAS.map(function (x) { return x.id; });

  function sanitizeDraft(raw) {
    var out = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    if (parseISO(raw.checkin)) out.checkin = raw.checkin;
    if (parseISO(raw.checkout)) out.checkout = raw.checkout;
    if (raw.adults !== undefined) { var a = clampInt(raw.adults, 1, 4, null); if (a !== null) out.adults = a; }
    if (raw.children !== undefined) { var c = clampInt(raw.children, 0, 2, null); if (c !== null) out.children = c; }
    if (typeof raw.room === 'string' && findRoom(raw.room)) out.room = raw.room;
    if (Array.isArray(raw.extras)) {
      out.extras = raw.extras.filter(function (id, i, arr) { return typeof id === 'string' && EXTRA_IDS.indexOf(id) !== -1 && arr.indexOf(id) === i; });
    }
    if (typeof raw.promo === 'string' && /^[A-Za-z0-9]{3,20}$/.test(raw.promo)) out.promo = raw.promo.toUpperCase();
    return out;
  }
  function readDraft() {
    var stored;
    try { stored = safeStorage.getItem(DRAFT_KEY); } catch (e) { return {}; }
    if (stored === null) return {};
    var parsed;
    try { parsed = JSON.parse(stored); } catch (e) { parsed = null; }
    var clean = sanitizeDraft(parsed);
    try {
      if (!Object.keys(clean).length) safeStorage.removeItem(DRAFT_KEY);
      else if (JSON.stringify(clean) !== stored) safeStorage.setItem(DRAFT_KEY, JSON.stringify(clean));
    } catch (e) { /* storage unavailable: ignore */ }
    return clean;
  }
  function saveDraft(patch) {
    var next = sanitizeDraft(Object.assign({}, readDraft(), patch));
    try { safeStorage.setItem(DRAFT_KEY, JSON.stringify(next)); } catch (e) { /* ignore */ }
    return next;
  }
  function clearDraft() { try { safeStorage.removeItem(DRAFT_KEY); } catch (e) { /* ignore */ } }

  // Values from the URL (e.g. booking.html?checkin=…&room=sea&promo=LONGSTAY) override the draft.
  function stayFromURL() {
    var q = new URLSearchParams(window.location.search);
    var raw = {};
    ['checkin', 'checkout', 'room', 'promo'].forEach(function (k) { if (q.get(k)) raw[k] = q.get(k); });
    if (q.get('adults')) raw.adults = parseInt(q.get('adults'), 10);
    if (q.get('children')) raw.children = parseInt(q.get('children'), 10);
    return sanitizeDraft(raw);
  }

  // Shared defaults: two weeks from today, three nights, two adults.
  function defaultStay() {
    var checkin = addDays(todayISO(), 14);
    return { checkin: checkin, checkout: addDays(checkin, 3), adults: 2, children: 0, room: ROOMS[0].id, extras: [], promo: '' };
  }

  // A restored stay can name a room that doesn't sleep its guests (a draft saved before the guests
  // changed, or edited by hand), which the summary would price with extra-guest charges. Guests from
  // the URL (the home booking bar) win over a saved room: switch to the first room that sleeps them.
  // Otherwise the guests are clamped to the room, adults first.
  function fitGuestsToRoom(stay, fromURL) {
    var room = findRoom(stay.room);
    var guests = stay.adults + stay.children;
    if (!room || guests <= room.capacity) return stay;
    if (!fromURL.room && (fromURL.adults !== undefined || fromURL.children !== undefined)) {
      var fits = ROOMS.filter(function (r) { return r.capacity >= guests; })[0];
      if (fits) { stay.room = fits.id; return stay; }
    }
    stay.adults = Math.min(stay.adults, room.capacity);
    stay.children = Math.min(stay.children, room.capacity - stay.adults);
    return stay;
  }

  // Booking step 1: when the guests change and no longer fit the chosen room, switch to the first
  // room that sleeps them (as fitGuestsToRoom() does for guests from the URL) and return a note
  // for the summary. If no room sleeps that many, the room stays and the summary shows no price.
  function fitRoomToGuests(stay) {
    var room = findRoom(stay.room);
    var guests = stay.adults + stay.children;
    if (!room || guests <= room.capacity) return '';
    var fits = ROOMS.filter(function (r) { return r.capacity >= guests; })[0];
    if (!fits) return '';
    stay.room = fits.id;
    return 'The ' + room.name + ' sleeps up to ' + room.capacity + ' guests, so we\'ve switched you to the ' + fits.name + '. You can choose another room on the next step.';
  }

  function setFieldError(input, message) {
    var err = input && document.getElementById(input.getAttribute('aria-describedby') || '');
    if (input) input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (err) err.textContent = message || '';
  }

  /* ------------------------------------------------------------------
   * Booking bar (home): validates dates and opens booking.html with them
   * ------------------------------------------------------------------ */
  function initBookingBar() {
    $$('[data-booking-bar]').forEach(function (form) {
      var ci = form.elements.checkin, co = form.elements.checkout;
      var saved = Object.assign(defaultStay(), readDraft());
      if (saved.checkin < todayISO()) { saved.checkin = defaultStay().checkin; saved.checkout = defaultStay().checkout; }
      ci.min = todayISO(); ci.value = saved.checkin;
      co.min = addDays(ci.value, 1); co.value = saved.checkout > saved.checkin ? saved.checkout : addDays(saved.checkin, 3);
      form.elements.adults.value = String(saved.adults);
      form.elements.children.value = String(saved.children);
      ci.addEventListener('change', function () {
        if (parseISO(ci.value)) {
          co.min = addDays(ci.value, 1);
          if (!parseISO(co.value) || co.value <= ci.value) co.value = addDays(ci.value, 3);
        }
        setFieldError(ci, ''); setFieldError(co, '');
      });
      co.addEventListener('change', function () { setFieldError(co, ''); });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var check = checkDates(ci.value, co.value);
        setFieldError(ci, check.field === 'checkin' ? check.message : '');
        setFieldError(co, check.field === 'checkout' ? check.message : '');
        if (!check.ok) { (check.field === 'checkin' ? ci : co).focus(); return; }
        var stay = { checkin: ci.value, checkout: co.value, adults: +form.elements.adults.value, children: +form.elements.children.value };
        saveDraft(stay);
        window.location.href = 'booking.html?' + new URLSearchParams({ checkin: stay.checkin, checkout: stay.checkout, adults: stay.adults, children: stay.children }).toString();
      });
    });
  }

  /* ------------------------------------------------------------------
   * 6. Rooms filter
   * ------------------------------------------------------------------ */
  function initRoomsFilter() {
    var form = $('[data-room-filters]');
    if (!form) return;
    var cards = $$('[data-room-card]', $('[data-room-grid]'));
    var count = $('[data-room-count]');
    var empty = $('[data-room-empty]');
    var q = new URLSearchParams(window.location.search);
    ['view', 'bed', 'guests'].forEach(function (k) {
      var sel = $('[data-filter="' + k + '"]', form);
      if (q.get(k) && $$('option', sel).some(function (o) { return o.value === q.get(k); })) sel.value = q.get(k);
    });
    function apply() {
      var view = $('[data-filter="view"]', form).value;
      var bed = $('[data-filter="bed"]', form).value;
      var guests = $('[data-filter="guests"]', form).value;
      var shown = 0;
      cards.forEach(function (card) {
        var ok = (view === 'all' || card.dataset.view === view) &&
          (bed === 'all' || card.dataset.bed === bed) &&
          (guests === 'all' || +card.dataset.capacity >= +guests);
        card.hidden = !ok;
        if (ok) { shown++; card.classList.add('is-visible'); }
      });
      count.textContent = shown === cards.length ? 'Showing all ' + cards.length + ' rooms' : 'Showing ' + shown + ' of ' + cards.length + ' rooms';
      empty.classList.toggle('hidden', shown > 0);
      var params = new URLSearchParams();
      if (view !== 'all') params.set('view', view);
      if (bed !== 'all') params.set('bed', bed);
      if (guests !== 'all') params.set('guests', guests);
      var qs = params.toString();
      history.replaceState(null, '', qs ? '?' + qs : window.location.pathname);
    }
    form.addEventListener('change', apply);
    form.addEventListener('reset', function () { setTimeout(apply, 0); });
    apply();
  }

  /* ------------------------------------------------------------------
   * 7. Room page: details, gallery, live price, availability calendar
   * ------------------------------------------------------------------ */
  function roomCardHTML(r) {
    return '<article class="flex flex-col is-visible reveal">' +
      '<a href="room.html?room=' + r.id + '" class="block overflow-hidden rounded-2xl" aria-label="' + esc(r.name) + ': view room">' +
      '<div class="art aspect-[4/3]"><img src="assets/img/room-' + r.id + '.svg" alt="' + esc(r.name) + ': bedroom with ' + VIEW_LABEL[r.view].toLowerCase() + '" width="1600" height="1000" loading="lazy"></div></a>' +
      '<div class="mt-5 flex items-start justify-between gap-4"><h3 class="font-display text-2xl"><a href="room.html?room=' + r.id + '" class="link-underline">' + esc(r.name) + '</a></h3>' +
      '<p class="shrink-0 text-right text-sm text-mist">from <span class="block font-display text-xl text-ink">$' + r.rate + '</span><span class="sr-only"> per night</span></p></div>' +
      '<p class="mt-2 text-mist">' + esc(r.short) + '</p></article>';
  }

  function initRoomPage() {
    var pageEl = $('[data-room-page]');
    if (!pageEl) return;
    var id = new URLSearchParams(window.location.search).get('room');
    var room = findRoom(id) || ROOMS[0];
    var photos = [
      { src: 'assets/img/room-' + room.id + '.svg', alt: room.name + ': bedroom' },
      { src: 'assets/img/room-' + room.id + '-terrace.svg', alt: room.name + ': private terrace' },
      { src: 'assets/img/room-' + room.id + '-bath.svg', alt: room.name + ': bathroom' },
    ];

    // Fill in the room's details (the HTML ships with the first room as a fallback).
    if (room.id !== pageEl.dataset.roomId) {
      pageEl.dataset.roomId = room.id;
      var set = function (key, text) { $$('[data-room-field="' + key + '"]').forEach(function (el) { el.textContent = text; }); };
      set('name', room.name); set('short', room.short); set('description', room.description);
      set('rate', '$' + room.rate); set('size', room.size + ' sq ft'); set('bed', BED_LABEL[room.bed]);
      set('capacity', 'Up to ' + room.capacity + ' guests'); set('view', VIEW_LABEL[room.view]); set('view-label', VIEW_LABEL[room.view]);
      var list = $('[data-room-field="amenities"]');
      var tick = list.querySelector('svg').outerHTML;
      list.innerHTML = room.highlights.concat(DATA.amenities).map(function (a) {
        return '<li class="flex items-center gap-3 text-mist">' + tick + '<span>' + esc(a) + '</span></li>';
      }).join('');
      document.title = room.name + ' — Casa Marea';
      var main = $('[data-gallery-main]'); main.src = photos[0].src; main.alt = photos[0].alt;
      $$('[data-gallery-img]').forEach(function (im, i) { im.src = photos[i].src; });
    }
    $('[data-other-rooms]').innerHTML = ROOMS.filter(function (r) { return r.id !== room.id; }).slice(0, 3).map(roomCardHTML).join('');
    var adultsSel = $('#room-adults');
    $$('option', adultsSel).forEach(function (o) { o.disabled = +o.value > room.capacity; });

    // --- Gallery lightbox (native <dialog>: focus trap and Esc built in)
    var dlg = $('[data-lightbox]');
    var lbImg = $('[data-lightbox-img]');
    var caption = $('[data-lightbox-caption]');
    var current = 0;
    function show(i) {
      current = (i + photos.length) % photos.length;
      lbImg.src = photos[current].src; lbImg.alt = photos[current].alt;
      caption.textContent = 'Photo ' + (current + 1) + ' of ' + photos.length + ': ' + photos[current].alt.split(': ')[1];
    }
    $$('[data-gallery-open]').forEach(function (btn) {
      btn.addEventListener('click', function () { show(+btn.dataset.galleryOpen); dlg.showModal(); $('[data-lightbox-next]').focus(); });
    });
    $('[data-lightbox-prev]').addEventListener('click', function () { show(current - 1); });
    $('[data-lightbox-next]').addEventListener('click', function () { show(current + 1); });
    $('[data-lightbox-close]').addEventListener('click', function () { dlg.close(); });
    dlg.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });

    // --- Stay form and live price
    var form = $('[data-room-price]');
    var ci = form.elements.checkin, co = form.elements.checkout;
    var errEl = $('#room-dates-error');
    var out = $('[data-price-breakdown]');
    var draft = Object.assign(defaultStay(), readDraft());
    if (draft.checkin < todayISO()) { draft.checkin = defaultStay().checkin; draft.checkout = defaultStay().checkout; }
    ci.min = todayISO(); ci.value = draft.checkin; co.value = draft.checkout > draft.checkin ? draft.checkout : addDays(draft.checkin, 3);
    form.elements.adults.value = String(Math.min(draft.adults, room.capacity));
    form.elements.children.value = String(draft.children);

    function stay() {
      return { room: room.id, checkin: ci.value, checkout: co.value, adults: +form.elements.adults.value, children: +form.elements.children.value, extras: [], promo: '' };
    }
    function validate() {
      var s = stay();
      var check = checkDates(s.checkin, s.checkout);
      if (!check.ok) return check;
      if (s.adults + s.children > room.capacity) return { ok: false, field: 'guests', message: 'The ' + room.name + ' sleeps up to ' + room.capacity + ' guests.' };
      var blocked = firstBlocked(room.id, s.checkin, s.checkout);
      if (blocked) return { ok: false, field: 'checkin', message: 'Sorry, the night of ' + fmtDay(blocked) + ' is already booked. Try other dates.' };
      return { ok: true };
    }
    function update() {
      var check = validate();
      ci.setAttribute('aria-invalid', String(!check.ok && check.field === 'checkin'));
      co.setAttribute('aria-invalid', String(!check.ok && check.field === 'checkout'));
      errEl.textContent = check.ok ? '' : check.message;
      var q = check.ok ? quote(stay()) : null;
      out.innerHTML = q ? breakdownHTML(q) : '<p class="text-sm text-mist">Choose available dates to see the total.</p>';
      renderCalendar();
    }
    ci.addEventListener('change', function () {
      if (parseISO(ci.value) && (!parseISO(co.value) || co.value <= ci.value)) co.value = addDays(ci.value, 3);
      if (parseISO(ci.value)) monthStart = ci.value.slice(0, 8) + '01';
      update();
    });
    [co, form.elements.adults, form.elements.children].forEach(function (el) { el.addEventListener('change', update); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var check = validate();
      update();
      if (!check.ok) { (check.field === 'checkout' ? co : ci).focus(); return; }
      var s = stay();
      saveDraft({ room: s.room, checkin: s.checkin, checkout: s.checkout, adults: s.adults, children: s.children });
      window.location.href = 'booking.html?' + new URLSearchParams({ room: s.room, checkin: s.checkin, checkout: s.checkout, adults: s.adults, children: s.children }).toString();
    });

    // --- Availability calendar: click arrival, then departure
    var cal = $('[data-calendar]');
    var status = $('[data-cal-status]');
    var monthStart = (parseISO(ci.value) ? ci.value : todayISO()).slice(0, 8) + '01';
    var picking = 'checkin';
    function monthHTML(startISO) {
      var start = parseISO(startISO);
      var offset = (start.getUTCDay() + 6) % 7; // Monday first
      var days = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + 1, 0)).getUTCDate();
      var today = todayISO();
      var cells = '';
      for (var i = 0; i < offset; i++) cells += '<span aria-hidden="true"></span>';
      for (var d = 1; d <= days; d++) {
        var iso = startISO.slice(0, 8) + String(d).padStart(2, '0');
        var past = iso < today;
        var blocked = !past && isBlocked(room.id, iso);
        var inRange = ci.value && co.value && iso > ci.value && iso < co.value;
        var edge = iso === ci.value || iso === co.value;
        var label = fmtDay(iso) + (blocked ? ', booked' : past ? ', unavailable' : '') + (iso === ci.value ? ', arrival' : iso === co.value ? ', departure' : '');
        cells += '<button type="button" class="cal-day" data-date="' + iso + '"' + (past ? ' disabled' : '') + (blocked ? ' data-blocked' : '') +
          (inRange ? ' data-in-range' : '') + (edge ? ' data-edge' : '') + (iso === today ? ' data-today' : '') +
          ' aria-label="' + label + '"' + (edge ? ' aria-pressed="true"' : '') + '>' + d + '</button>';
      }
      return '<div><h3 class="mb-3 font-display text-xl">' + monthFmt.format(start) + '</h3>' +
        '<div class="grid grid-cols-7 gap-1 text-center text-xs text-mist" aria-hidden="true"><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span></div>' +
        '<div class="mt-1 grid grid-cols-7 gap-1">' + cells + '</div></div>';
    }
    function renderCalendar() {
      var second = parseISO(monthStart); second.setUTCMonth(second.getUTCMonth() + 1);
      cal.innerHTML = monthHTML(monthStart) + monthHTML(toISO(second));
      $('[data-cal-prev]').disabled = monthStart <= todayISO().slice(0, 8) + '01';
    }
    cal.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-date]');
      if (!btn || btn.disabled) return;
      var iso = btn.dataset.date;
      if (picking === 'checkin' || iso <= ci.value) {
        if (btn.hasAttribute('data-blocked')) { status.textContent = fmtDay(iso) + ' is already booked. Choose another arrival date.'; return; }
        ci.value = iso; co.value = addDays(iso, 1); picking = 'checkout';
        status.textContent = 'Arrival ' + fmtDay(iso) + '. Now choose your departure date.';
      } else {
        var blocked = firstBlocked(room.id, ci.value, iso);
        if (blocked) { status.textContent = 'The night of ' + fmtDay(blocked) + ' is booked, so this stay isn’t available.'; return; }
        co.value = iso; picking = 'checkin';
        status.textContent = 'Selected ' + fmtDay(ci.value) + ' to ' + fmtDay(iso) + ', ' + nightsBetween(ci.value, iso) + ' nights.';
      }
      update();
      var again = cal.querySelector('[data-date="' + iso + '"]');
      if (again) again.focus();
    });
    $('[data-cal-prev]').addEventListener('click', function () {
      var d = parseISO(monthStart); d.setUTCMonth(d.getUTCMonth() - 1); monthStart = toISO(d); renderCalendar();
    });
    $('[data-cal-next]').addEventListener('click', function () {
      var d = parseISO(monthStart); d.setUTCMonth(d.getUTCMonth() + 1); monthStart = toISO(d); renderCalendar();
    });
    update();
  }

  /* ------------------------------------------------------------------
   * 8. Dining menu tabs (arrow keys, Home/End)
   * ------------------------------------------------------------------ */
  function initTabs() {
    $$('[data-tabs]').forEach(function (list) {
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
        tab.addEventListener('click', function () { select(tab); });
        tab.addEventListener('keydown', function (e) {
          var next = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 }[e.key];
          if (next === undefined) return;
          e.preventDefault();
          select(tabs[(next + tabs.length) % tabs.length], true);
        });
      });
    });
  }

  /* ------------------------------------------------------------------
   * 9. Experiences filter
   * ------------------------------------------------------------------ */
  function initExperiences() {
    var buttons = $$('[data-exp-filter]');
    if (!buttons.length) return;
    var cards = $$('[data-exp-card]');
    var count = $('[data-exp-count]');
    function apply(type) {
      var shown = 0;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.expFilter === type)); });
      cards.forEach(function (c) {
        var ok = type === 'All' || c.dataset.type === type;
        c.hidden = !ok;
        if (ok) { shown++; c.classList.add('is-visible'); }
      });
      count.textContent = type === 'All' ? 'Showing all ' + cards.length + ' experiences' : 'Showing ' + shown + ' ' + type.toLowerCase() + ' experiences';
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { apply(b.dataset.expFilter); }); });
    var hash = decodeURIComponent(window.location.hash.slice(1));
    if (buttons.some(function (b) { return b.dataset.expFilter.toLowerCase() === hash.toLowerCase(); })) {
      apply(hash.charAt(0).toUpperCase() + hash.slice(1).toLowerCase());
    }
  }

  /* ------------------------------------------------------------------
   * 10. Offer codes: copy to clipboard
   * ------------------------------------------------------------------ */
  function initCopyCodes() {
    $$('[data-copy-code]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var code = btn.dataset.copyCode;
        var done = function () { toast('Code ' + code + ' copied. Paste it on the last step of booking.'); };
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(code).then(done, function () { toast('Your code is ' + code); });
        else toast('Your code is ' + code);
      });
    });
  }

  /* ------------------------------------------------------------------
   * 11. Contact topic prefill (contact.html?topic=events&about=boat)
   * ------------------------------------------------------------------ */
  function initContactPrefill() {
    var form = $('[data-form="contact"]');
    if (!form) return;
    var q = new URLSearchParams(window.location.search);
    var topic = q.get('topic');
    if (topic && $$('option', form.elements.topic).some(function (o) { return o.value === topic; })) form.elements.topic.value = topic;
    var about = q.get('about');
    var names = { stone: 'the hot stone ritual', scrub: 'the sea salt scrub', boat: 'a private boat to Jamestown', kayak: 'the sea kayak trip',
      walk: 'the Cliff Walk past the mansions', pesto: 'the pesto class', dinner: 'a private dinner on the terrace', weddings: 'weddings and celebrations' };
    if (about && names[about] && !form.elements.message.value) form.elements.message.value = 'Hello, I’d like to ask about ' + names[about] + '. ';
  }

  /* ------------------------------------------------------------------
   * 12. Booking flow: dates → room → extras → details → review
   * ------------------------------------------------------------------ */
  function initBooking() {
    var form = $('[data-booking-form]');
    if (!form) return;
    var steps = $$('fieldset[data-step]', form);
    var back = $('[data-step-back]');
    var next = $('[data-step-next]');
    var summary = $('[data-summary]');
    var summaryImg = $('[data-summary-img]');
    var promoMsg = $('#b-promo-msg');
    var current = 1;
    var roomNote = ''; // set when step 1's guests switched the room (fitRoomToGuests)

    var fromURL = stayFromURL();
    var state = fitGuestsToRoom(Object.assign(defaultStay(), readDraft(), fromURL), fromURL);
    if (state.checkin < todayISO()) { state.checkin = defaultStay().checkin; state.checkout = defaultStay().checkout; }
    var el = form.elements;
    el.checkin.min = todayISO();
    el.checkin.value = state.checkin; el.checkout.value = state.checkout;
    el.adults.value = String(state.adults); el.children.value = String(state.children);
    el.promo.value = state.promo || '';
    $$('input[name="extra"]', form).forEach(function (cb) { cb.checked = state.extras.indexOf(cb.value) !== -1; });

    function read() {
      state.checkin = el.checkin.value; state.checkout = el.checkout.value;
      state.adults = +el.adults.value; state.children = +el.children.value;
      var picked = $('input[name="room"]:checked', form);
      if (picked) state.room = picked.value;
      state.extras = $$('input[name="extra"]:checked', form).map(function (cb) { return cb.value; });
      state.promo = el.promo.value.trim().toUpperCase();
      saveDraft(state);
    }

    function renderRooms() {
      var guests = state.adults + state.children;
      var dates = checkDates(state.checkin, state.checkout);
      $('[data-room-step-note]').textContent = dates.ok
        ? fmtDay(state.checkin) + ' – ' + fmtDay(state.checkout) + ' · ' + guests + (guests === 1 ? ' guest' : ' guests')
        : '';
      var firstFree = null;
      var html = ROOMS.map(function (r) {
        var tooSmall = guests > r.capacity;
        var blocked = dates.ok && firstBlocked(r.id, state.checkin, state.checkout);
        var available = !tooSmall && !blocked;
        if (available && !firstFree) firstFree = r.id;
        var q = available && dates.ok ? quote({ room: r.id, checkin: state.checkin, checkout: state.checkout, adults: state.adults, children: state.children, extras: [], promo: '' }) : null;
        var note = tooSmall ? 'Sleeps up to ' + r.capacity : blocked ? 'Not available for your dates' : money(q.roomTotal + q.extraGuests) + ' for ' + q.nights + (q.nights === 1 ? ' night' : ' nights');
        return '<label class="flex cursor-pointer items-center gap-4 rounded-2xl border border-line bg-foam p-3 pr-5 transition has-[:checked]:border-sea has-[:checked]:ring-2 has-[:checked]:ring-sea/15' + (available ? '' : ' cursor-not-allowed opacity-60') + '">' +
          '<input type="radio" name="room" value="' + r.id + '" class="sr-only"' + (available ? '' : ' disabled') + (state.room === r.id && available ? ' checked' : '') + ' aria-describedby="room-note-' + r.id + '">' +
          '<span class="art aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl sm:w-36"><img src="assets/img/room-' + r.id + '.svg" alt="" width="1600" height="1000" loading="lazy"></span>' +
          '<span class="min-w-0 flex-1"><span class="block font-display text-xl">' + esc(r.name) + '</span>' +
          '<span class="mt-1 block text-sm text-mist">' + VIEW_LABEL[r.view] + ' · ' + BED_LABEL[r.bed] + ' · ' + r.size + '&nbsp;sq&nbsp;ft</span>' +
          '<span id="room-note-' + r.id + '" class="mt-2 block text-sm ' + (available ? 'font-medium text-sea' : 'text-coral') + '">' + note + '</span></span>' +
          '<span class="hidden h-6 w-6 shrink-0 place-items-center rounded-full border border-line sm:grid" aria-hidden="true"><span class="h-3 w-3 rounded-full bg-sea opacity-0 transition [label:has(:checked)_&]:opacity-100"></span></span></label>';
      }).join('');
      $('[data-room-options]').innerHTML = html;
      if (!$('input[name="room"]:checked', form) && firstFree) {
        var auto = $('input[name="room"][value="' + firstFree + '"]', form);
        if (auto && (!findRoom(state.room) || state.room === firstFree)) auto.checked = true;
      }
    }

    // "1 adult", "2 adults, 1 child": used by the summary and the review step.
    function guestsText() {
      return state.adults + ' adult' + (state.adults > 1 ? 's' : '') + (state.children ? ', ' + state.children + (state.children > 1 ? ' children' : ' child') : '');
    }

    function renderSummary() {
      var q = checkDates(state.checkin, state.checkout).ok ? quote(state) : null;
      var room = findRoom(state.room);
      summaryImg.src = 'assets/img/room-' + (room ? room.id : ROOMS[0].id) + '.svg';
      if (!q) { summary.innerHTML = '<p class="text-mist">Choose your dates to start.</p>'; return; }
      var guests = guestsText();
      var count = state.adults + state.children;
      if (count > q.room.capacity) {
        // No room sleeps this many guests: no price for an impossible stay.
        var most = Math.max.apply(null, ROOMS.map(function (r) { return r.capacity; }));
        summary.innerHTML = '<p class="font-medium">No room sleeps ' + count + ' guests</p><p class="mt-1 text-mist">' + fmtDay(state.checkin) + ' – ' + fmtDay(state.checkout) + ' · ' + guests + '</p>' +
          '<p class="mt-4 text-coral">Our rooms sleep up to ' + most + ' guests. Choose fewer guests, or contact us to book more than one room.</p>';
        return;
      }
      summary.innerHTML = '<p class="font-medium">' + esc(q.room.name) + '</p><p class="mt-1 text-mist">' + fmtDay(state.checkin) + ' – ' + fmtDay(state.checkout) + ' · ' + guests + '</p>' +
        (roomNote ? '<p class="mt-3 text-sea">' + esc(roomNote) + '</p>' : '') +
        '<div class="mt-5">' + breakdownHTML(q) + '</div>';
    }

    function renderReview() {
      var room = findRoom(state.room);
      var extras = state.extras.map(function (id) { return EXTRAS.filter(function (x) { return x.id === id; })[0].name; });
      var rows = [
        ['Dates', fmtDay(state.checkin) + ' – ' + fmtDay(state.checkout)],
        ['Room', room ? room.name : ''],
        ['Guests', guestsText()],
        ['Extras', extras.length ? extras.join(', ') : 'None'],
        ['Name', el.first.value + ' ' + el.last.value],
        ['Email', el.email.value],
      ];
      $('[data-review]').innerHTML = rows.map(function (r) { return '<div><dt class="text-sm text-mist">' + r[0] + '</dt><dd class="mt-1 font-medium">' + esc(r[1]) + '</dd></div>'; }).join('');
    }

    function validateStep(n) {
      var firstBad = null;
      function fail(input, msg) { setFieldError(input, msg); if (!firstBad) firstBad = input; }
      if (n === 1) {
        setFieldError(el.checkin, ''); setFieldError(el.checkout, '');
        var check = checkDates(el.checkin.value, el.checkout.value);
        if (!check.ok) fail(check.field === 'checkin' ? el.checkin : el.checkout, check.message);
      }
      if (n === 2) {
        var picked = $('input[name="room"]:checked', form);
        $('#b-room-error').textContent = picked ? '' : 'Choose a room to continue.';
        if (!picked) firstBad = $('input[name="room"]:not(:disabled)', form) || $('[data-room-options]');
      }
      if (n === 4) {
        [['first', 'Enter your first name.'], ['last', 'Enter your last name.']].forEach(function (f) {
          var input = el[f[0]];
          setFieldError(input, input.value.trim() ? '' : f[1]);
          if (!input.value.trim() && !firstBad) firstBad = input;
        });
        if (!el.email.value.trim()) fail(el.email, 'Enter your email address.');
        else if (!el.email.validity.valid) fail(el.email, 'Enter a valid email address, like name@example.com.');
        else setFieldError(el.email, '');
        if (!el.phone.value.trim()) fail(el.phone, 'Enter a phone number so we can reach you on the day.');
        else if (!el.phone.validity.valid) fail(el.phone, 'Use digits, spaces, + or brackets (at least 7).');
        else setFieldError(el.phone, '');
      }
      if (n === 5) {
        var promo = checkPromo(el.promo.value.trim(), state);
        if (el.promo.value.trim() && !promo.ok) { promoMsg.textContent = promo.message; promoMsg.className = 'mt-1.5 text-sm text-coral'; firstBad = el.promo; }
        setFieldError(el.terms, el.terms.checked ? '' : 'Please accept the cancellation policy to confirm.');
        if (!el.terms.checked && !firstBad) firstBad = el.terms;
      }
      if (firstBad) firstBad.focus();
      return !firstBad;
    }

    function go(n) {
      current = n;
      roomNote = '';
      steps.forEach(function (s) { s.hidden = +s.dataset.step !== n; });
      $$('[data-step-indicator]').forEach(function (li) {
        var i = +li.dataset.stepIndicator;
        li.dataset.stepState = i < n ? 'done' : i === n ? 'current' : 'todo';
        if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      back.hidden = n === 1;
      next.textContent = n === 5 ? 'Confirm booking' : 'Continue';
      if (n === 2) renderRooms();
      if (n === 5) renderReview();
      renderSummary();
      var legend = $('fieldset[data-step="' + n + '"] legend', form);
      legend.setAttribute('tabindex', '-1');
      legend.focus({ preventScroll: true });
      var top = form.getBoundingClientRect().top + window.scrollY - 120;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
    }

    form.addEventListener('change', function (e) {
      if (e.target === el.checkin && parseISO(el.checkin.value) && (!parseISO(el.checkout.value) || el.checkout.value <= el.checkin.value)) {
        el.checkout.value = addDays(el.checkin.value, 3);
      }
      read();
      if (e.target.name === 'room') $('#b-room-error').textContent = '';
      roomNote = '';
      if (e.target === el.adults || e.target === el.children) {
        roomNote = fitRoomToGuests(state);
        if (roomNote) {
          // The room step's radio for the old room would win on the next read().
          var stale = $('input[name="room"]:checked', form);
          if (stale) stale.checked = false;
          saveDraft(state);
        }
      }
      renderSummary();
    });
    $('[data-apply-promo]').addEventListener('click', function () {
      read();
      var res = checkPromo(state.promo, state);
      promoMsg.textContent = state.promo ? res.message : 'Enter a code first.';
      promoMsg.className = 'mt-1.5 text-sm ' + (res.ok ? 'text-sea' : 'text-coral');
      renderSummary();
    });
    back.addEventListener('click', function () { read(); go(current - 1); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      read();
      if (!validateStep(current)) return;
      if (current < 5) { go(current + 1); return; }
      // Demo only: send `state` and the guest details to your reservations system here.
      var ref = makeRef('CM');
      $('[data-done-name]').textContent = el.first.value.trim();
      $('[data-done-email]').textContent = el.email.value.trim();
      $('[data-done-ref]').textContent = ref;
      form.hidden = true;
      $('[data-booking-summary]').hidden = true;
      $$('[data-step-indicator]').forEach(function (li) { li.dataset.stepState = 'done'; li.removeAttribute('aria-current'); });
      var done = $('[data-booking-done]');
      done.classList.remove('hidden');
      done.focus();
      clearDraft();
    });

    if (state.promo) {
      var res = checkPromo(state.promo, state);
      promoMsg.textContent = 'Code ' + state.promo + ' will be checked on the last step.';
      promoMsg.className = 'mt-1.5 text-sm ' + (res.ok ? 'text-sea' : 'text-mist');
    }
    // Arriving from a room page with dates and a room chosen: start on the room step.
    if (fromURL.room && checkDates(state.checkin, state.checkout).ok) { renderRooms(); go(2); }
    else { renderSummary(); }
  }

  /* ------------------------------------------------------------------
   * 13. Forms: inline validation and a success message (nothing is sent)
   * ------------------------------------------------------------------ */
  function initForms() {
    $$('input[data-min-today]').forEach(function (i) { i.min = todayISO(); });
    $$('form[data-form]').forEach(function (form) {
      var fields = $$('input, textarea, select', form).filter(function (f) { return f.hasAttribute('required') || f.type === 'email'; });
      function message(f) {
        if (f.validity.valueMissing) {
          if (f.type === 'email') return 'Enter your email address.';
          if (f.type === 'date') return 'Choose a date.';
          return 'Please fill in this field.';
        }
        if (f.validity.typeMismatch) return 'Enter a valid email address, like name@example.com.';
        if (f.validity.tooShort) return 'Please write at least ' + f.minLength + ' characters.';
        if (f.validity.rangeUnderflow) return 'Choose a date from today onwards.';
        return '';
      }
      function check(f) { var m = message(f); setFieldError(f, m); return !m; }
      fields.forEach(function (f) {
        f.addEventListener('blur', function () { if (f.value) check(f); });
        f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') check(f); });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var bad = fields.filter(function (f) { return !check(f); });
        var success = $('[data-form-success]', form) || $('[data-form-success]', form.parentNode);
        if (bad.length) { bad[0].focus(); return; }
        // To send for real: fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form) })
        form.reset();
        fields.forEach(function (f) { f.removeAttribute('aria-invalid'); });
        var refEl = success && $('[data-form-ref]', success);
        if (refEl) refEl.textContent = makeRef('CM');
        if (success) { success.classList.remove('hidden'); success.setAttribute('tabindex', '-1'); success.focus(); }
      });
    });
  }

  /* ------------------------------------------------------------------
   * 14. Header, mobile menu, scroll reveal, year
   * ------------------------------------------------------------------ */
  function initChrome() {
    var menuBtn = $('#menu-toggle');
    var menu = $('#mobile-menu');
    function setMenu(open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Menu';
      menu.hidden = !open;
      $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
      $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
      document.documentElement.classList.toggle('menu-open', open);
    }
    if (menuBtn && menu) {
      menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
      });
      window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
    }

    var header = $('#site-header');
    var onScroll = function () {
      var scrolled = window.scrollY > 8;
      header.classList.toggle('border-line', scrolled);
      header.classList.toggle('shadow-[0_10px_30px_-24px_rgb(19_35_43/.5)]', scrolled);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    // Reveal on scroll. Revealing an element also reveals everything above it,
    // so fast jumps (End key, anchors) never leave content hidden.
    var items = $$('.reveal');
    function revealUpTo(target) {
      var bottom = target.getBoundingClientRect().bottom;
      items.forEach(function (el) { if (el.getBoundingClientRect().top <= bottom) el.classList.add('is-visible'); });
    }
    if (!('IntersectionObserver' in window) || reduceMotion) { items.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { revealUpTo(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });
  }

  initChrome();
  initBookingBar();
  initRoomsFilter();
  initRoomPage();
  initTabs();
  initExperiences();
  initCopyCodes();
  initContactPrefill();
  initBooking();
  initForms();

  // Exposed for tests and debugging.
  window.CasaMarea = { quote: quote, sanitizeDraft: sanitizeDraft, readDraft: readDraft, checkPromo: checkPromo };
})();

/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It lifts itself above toasts so they never overlap.
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
  var AVOID = '#toast.is-visible, [data-back-to-top-avoid]';
  var queued = false;

  function lift() {
    var offset = 0;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    Array.prototype.forEach.call(document.querySelectorAll(AVOID), function (el) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.bottom > vh - 140 && r.right > vw - 96 && r.top < vh) offset = Math.max(offset, vh - r.top + 8);
    });
    btn.style.setProperty('--btt-lift', offset + 'px');
  }

  // Elements marked data-back-to-top-hide (sticky booking cards) hide the button while it would cover them.
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
    var menuOpen = document.documentElement.classList.contains('menu-open');
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !coversHideZone() && !menuOpen);
    lift();
  }
  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  document.addEventListener('transitionrun', function (e) { if (e.target !== btn) schedule(); }, true);
  document.addEventListener('transitionend', function (e) { if (e.target !== btn) schedule(); }, true);
  update();

  function focusTop() {
    var target = document.getElementById('main') || document.querySelector('main');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.classList.add('back-to-top-target');
    target.focus({ preventScroll: true });
  }

  btn.addEventListener('click', function () {
    if (reduceMotion.matches) { window.scrollTo({ top: 0, behavior: 'auto' }); focusTop(); return; }
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
