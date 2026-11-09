/* The Fallow Hart — Hearth template. Vanilla JavaScript, no dependencies.
 *
 * Sections
 *  1. Settings and data        6. Food: tabs, diet filter, specials   11. Forms
 *  2. Helpers and storage      7. Trails: filters, map, saved         12. Header, menu, reveal
 *  3. Inn time (Eastern)       8. Events: upcoming by date            13. Back to top
 *  4. Opening hours / status   9. Gift certificates
 *  5. Rooms: stay checker     10. Contact: topic, hours table
 *
 * Every time-dependent feature uses the inn's clock (America/New_York), not the visitor's.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Settings and data. Edit these to make the template yours.
   * ------------------------------------------------------------------ */
  var TIME_ZONE = 'America/New_York';

  // Opening hours by weekday (0 = Sunday). Times are 'HH:MM' in Eastern time.
  // bar: when the doors are open. kitchen: food service windows. breakfast: inn guests only.
  var HOURS = {
    0: { bar: ['12:00', '22:30'], kitchen: [['12:00', '16:00'], ['17:30', '20:00']], breakfast: ['08:00', '10:00'] },
    1: { bar: ['17:00', '23:00'], kitchen: [['18:00', '20:30']], breakfast: ['07:30', '09:30'] },
    2: { bar: ['12:00', '23:00'], kitchen: [['12:00', '14:30'], ['18:00', '21:00']], breakfast: ['07:30', '09:30'] },
    3: { bar: ['12:00', '23:00'], kitchen: [['12:00', '14:30'], ['18:00', '21:00']], breakfast: ['07:30', '09:30'] },
    4: { bar: ['12:00', '23:00'], kitchen: [['12:00', '14:30'], ['18:00', '21:00']], breakfast: ['07:30', '09:30'] },
    5: { bar: ['12:00', '23:30'], kitchen: [['12:00', '14:30'], ['18:00', '21:00']], breakfast: ['07:30', '09:30'] },
    6: { bar: ['12:00', '23:30'], kitchen: [['12:00', '14:30'], ['18:00', '21:00']], breakfast: ['08:00', '10:00'] }
  };

  // Seasons by month (1-12). Each room has one nightly rate per season, in dollars before tax, breakfast included.
  // Vermont's busy months are summer and foliage; mud season and stick season are the quiet ones.
  var SEASONS = {
    low: { label: 'Low season', months: [3, 4, 11] },
    mid: { label: 'Mid season', months: [12, 1, 2, 5, 6] },
    high: { label: 'High season', months: [7, 8, 9, 10] }
  };

  var ROOMS = {
    snug: { name: 'The Snug', sleeps: 2, dogs: true, rates: { low: 165, mid: 195, high: 235 } },
    hayloft: { name: 'The Hayloft', sleeps: 2, dogs: true, rates: { low: 215, mid: 255, high: 305 } },
    shepherd: { name: 'Shepherd\u2019s Room', sleeps: 2, dogs: true, rates: { low: 205, mid: 245, high: 295 } },
    beck: { name: 'Brook View', sleeps: 2, dogs: false, rates: { low: 245, mid: 285, high: 345 } },
    cove: { name: 'The Ledges Suite', sleeps: 4, dogs: false, rates: { low: 315, mid: 365, high: 435 } },
    dairy: { name: 'The Old Dairy', sleeps: 4, dogs: true, rates: { low: 295, mid: 345, high: 415 } }
  };
  var ROOM_ORDER = ['snug', 'hayloft', 'shepherd', 'beck', 'cove', 'dairy'];

  var STAY_RULES = {
    maxNights: 14,          // longer stays: call the inn
    maxDaysAhead: 365,      // bookings open a year ahead
    saturdayMinNights: 2,   // a stay that includes a Saturday night needs at least this many nights
    maxGuests: 4,
    maxDogs: 2,
    dogFee: 30              // dollars per dog per stay
  };

  // Today's specials by weekday (0 = Sunday), chalked up on the food page.
  var SPECIALS = {
    0: [['Rib of Vermont beef, popover, all the trimmings', 36], ['Nut roast, roasted roots, proper gravy (vg)', 26], ['Maple pecan tart, whipped cream', 10.5]],
    1: [['Shepherd’s pie, buttered greens', 24], ['Leek and Vermont cheddar tart (v)', 22], ['Gingerbread, whipped cream', 9.5]],
    2: [['Trivia-night pie: steak and Vermont ale', 26], ['Butternut and sage risotto (v, gf)', 23], ['Sticky toffee pudding', 11]],
    3: [['Ham, parsley sauce, mashed potatoes', 25], ['Mushroom and ale cobbler (vg)', 22], ['Vermont apple crisp', 10]],
    4: [['Haddock, hand-cut fries, coleslaw', 26], ['Cauliflower and cheddar gratin (v)', 21], ['Rhubarb fool (gf)', 9.5]],
    5: [['Venison sausages, red onion gravy', 27], ['Beet, lentil and walnut bake (vg, gf)', 23], ['Chocolate pot, shortbread', 10]],
    6: [['Slow-roasted lamb shoulder for two, rosemary potatoes', 62], ['Wild mushrooms on toast (v)', 19], ['Bread and butter pudding', 10]]
  };
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Recurring events. weekday: 0 = Sunday. nth: which weeks of the month (1-5, or -1 = last).
  var EVENT_RULES = [
    { id: 'quiz', type: 'quiz', title: 'Hart Trivia Night', weekday: 2, time: '20:30', price: '$5 a person',
      text: 'Teams of up to six, eight rounds and a picture round. Every dollar goes to local volunteer search and rescue.' },
    { id: 'folk', type: 'music', title: 'Folk session in the snug', weekday: 4, nth: [1, 3], time: '20:00', price: 'Free',
      text: 'Fiddles, banjos and the odd song. Bring an instrument or just a good ear.' },
    { id: 'supper', type: 'food', title: 'Supper club', weekday: 5, nth: [-1], time: '19:00', price: '$85, reserve ahead',
      text: 'Five courses from what the farms and the woods give us that week, at one long table.' }
  ];
  // One-off events (Eastern dates). While KEEP_DEMO_CURRENT is true, an event whose date has passed comes
  // back a year later, so the demo always has its seasonal specials: on the same date (Halloween,
  // New Year's Eve), or with sameWeekday: true on the same weekday nearest that date (a Saturday stays
  // a Saturday). Set it to false once EVENTS holds your real dates; past events then drop off.
  var KEEP_DEMO_CURRENT = true;
  var EVENTS = [
    { id: 'lantern', type: 'special', date: '2026-10-31', time: '18:00', title: 'Lantern walk and ghost stories', price: '$12, children free', text: 'A slow walk to the church by lantern light, then stories by the fire.' },
    { id: 'bonfire', type: 'special', date: '2026-11-07', time: '18:30', sameWeekday: true, title: 'Bonfire behind the barn', price: 'Free', text: 'Bonfire, cider doughnuts and mulled cider. Dogs best kept at home tonight.' },
    { id: 'wreath', type: 'special', date: '2026-11-28', time: '14:00', sameWeekday: true, title: 'Christmas wreath workshop', price: '$55, materials included', text: 'Balsam, spruce and winterberry from the hillside, a Christmas cookie and a glass of something.' },
    { id: 'carols', type: 'music', date: '2026-12-19', time: '19:30', sameWeekday: true, title: 'Carols around the fire', price: 'Free', text: 'The village choir, the town band and a lot of Christmas cookies.' },
    { id: 'ceilidh', type: 'music', date: '2026-12-31', time: '20:00', title: 'New Year’s Eve contra dance', price: '$45', text: 'A caller, a band and dancing until midnight. Ticket includes a bowl of stew.' },
    { id: 'wassail', type: 'special', date: '2027-01-16', time: '17:00', sameWeekday: true, title: 'Orchard wassail', price: 'Free', text: 'Toast and cider for the old apple trees behind the barn, with songs and noise.' },
    { id: 'burns', type: 'food', date: '2027-01-23', time: '19:00', sameWeekday: true, title: 'Winter game supper', price: '$75', text: 'Farm-raised venison and rabbit, a fiddler and a long table by the fire.' },
    { id: 'beerfest', type: 'food', date: '2027-03-20', time: '12:00', sameWeekday: true, title: 'Spring beer festival', price: 'Free entry', text: 'Twenty taps from Vermont breweries, a pig roast and music in the barn.' }
  ];
  var EVENT_TYPES = { quiz: 'Trivia', music: 'Music', food: 'Food & drink', special: 'Special' };
  var EVENT_WINDOW_DAYS = 60;

  // Trails from the door. Must match the cards on walks.html (data-walk).
  var WALKS = {
    village: { name: 'Village green and river loop', miles: 2, level: 'easy' },
    cove: { name: 'Mount Tom by the Faulkner Trail', miles: 3, level: 'moderate' },
    airton: { name: 'River Road along the Ottauquechee', miles: 4, level: 'easy' },
    gordale: { name: 'The Pogue by the carriage roads', miles: 4.5, level: 'moderate' },
    weets: { name: 'Mount Peg and Cox District Road', miles: 6, level: 'moderate' },
    tarn: { name: 'Mount Tom ridge and the Pogue', miles: 7.5, level: 'moderate' },
    three: { name: 'The Woodstock big three', miles: 9.5, level: 'strenuous' },
    fountains: { name: 'Cloudland and the Appalachian Trail', miles: 12, level: 'strenuous' }
  };
  var WALK_LENGTHS = { short: [0, 4], half: [4, 8], full: [8, 100] }; // miles: from (inclusive) to (exclusive)
  var WALK_LEVELS = { easy: 'Easy', moderate: 'Moderate', strenuous: 'Strenuous' };

  // Gift certificates. 'amount' is a certificate for any whole-dollar value in range.
  var VOUCHERS = {
    amount: { label: 'Dollar-amount certificate', price: null },
    roast: { label: 'Sunday roast for two', price: 88 },
    supper: { label: 'Three-course supper for two', price: 125 },
    night: { label: 'Dinner, bed and breakfast for two', price: 495 }
  };
  var VOUCHER_LIMITS = { min: 25, max: 1000, messageMax: 150, postage: 4 };

  var CONTACT_TOPICS = { general: 1, rooms: 1, table: 1, events: 1, vouchers: 1, dogs: 1 };

  // Saved data (localStorage keys).
  var ENQUIRY_KEY = 'hearth:enquiry';
  var WALKS_KEY = 'hearth:saved-walks';

  /* ------------------------------------------------------------------
   * 2. Helpers and storage
   * ------------------------------------------------------------------ */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var has = function (obj, key) { return typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function money(n) {
    var whole = Math.round(n * 100) % 100 === 0;
    return '$' + (whole ? String(Math.round(n)) : n.toFixed(2)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function params() { return new URLSearchParams(window.location.search); }

  // localStorage, or an in-memory stand-in when the browser blocks it (a sandboxed iframe, strict
  // privacy settings): saved state then lasts for this page view instead of the feature doing nothing.
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
  function readJSON(key) {
    try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; }
  }
  function writeJSON(key, value) {
    try {
      if (value === null) safeStorage.removeItem(key);
      else safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) { /* storage full: the page keeps working without it */ }
  }

  /* ------------------------------------------------------------------
   * 3. Inn time (Eastern). Calendar dates are handled as 'YYYY-MM-DD' strings
   *    and day numbers (days since 1970-01-01), so DST never shifts them.
   * ------------------------------------------------------------------ */
  var londonParts = (function () {
    var fmt;
    try {
      fmt = new Intl.DateTimeFormat('en-US', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
    } catch (e) { fmt = null; }
    return function (date) {
      if (!fmt) return { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate(), hh: date.getHours(), mm: date.getMinutes() };
      var out = {};
      fmt.formatToParts(date).forEach(function (p) { out[p.type] = p.value; });
      return { y: +out.year, m: +out.month, d: +out.day, hh: +out.hour % 24, mm: +out.minute };
    };
  })();
  function nowLondon() {
    var p = londonParts(new Date());
    var iso = p.y + '-' + pad(p.m) + '-' + pad(p.d);
    return { iso: iso, day: dayNumber(iso), weekday: weekdayOf(dayNumber(iso)), minutes: p.hh * 60 + p.mm };
  }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function isIsoDate(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    var d = new Date(s + 'T00:00:00Z');
    return !isNaN(d) && d.toISOString().slice(0, 10) === s;
  }
  function dayNumber(iso) { return Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000); }
  function isoOf(day) { return new Date(day * 86400000).toISOString().slice(0, 10); }
  function weekdayOf(day) { return ((day % 7) + 11) % 7; } // 1970-01-01 was a Thursday (4)
  function monthOf(day) { return +isoOf(day).slice(5, 7); }
  function toMinutes(hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }
  function clock(hhmm) {
    var m = toMinutes(hhmm), h = Math.floor(m / 60), min = m % 60;
    if (h === 12 && min === 0) return '12 noon';
    if (h === 0 && min === 0) return 'midnight';
    var suffix = h >= 12 ? 'pm' : 'am', h12 = h % 12 || 12;
    return h12 + (min ? ':' + pad(min) : '') + suffix;
  }
  function shortDate(day) { var iso = isoOf(day); return WEEKDAYS[weekdayOf(day)].slice(0, 3) + ', ' + MONTHS[+iso.slice(5, 7) - 1].slice(0, 3) + ' ' + +iso.slice(8, 10); }
  function longDate(day) { var iso = isoOf(day); return WEEKDAYS[weekdayOf(day)] + ', ' + MONTHS[+iso.slice(5, 7) - 1] + ' ' + +iso.slice(8, 10); }

  /* ------------------------------------------------------------------
   * 4. Opening hours and the "fire's lit" status
   * ------------------------------------------------------------------ */
  function within(mins, range) { return mins >= toMinutes(range[0]) && mins < toMinutes(range[1]); }
  function getStatus(now) {
    var today = HOURS[now.weekday], t = now.minutes;
    var tomorrow = HOURS[(now.weekday + 1) % 7];
    if (within(t, today.bar)) {
      var serving = today.kitchen.filter(function (k) { return within(t, k); })[0];
      var next = today.kitchen.filter(function (k) { return toMinutes(k[0]) > t; })[0];
      var food = serving ? 'Kitchen serving until ' + clock(serving[1])
        : next ? 'Kitchen opens at ' + clock(next[0])
        : 'Kitchen closed for the night, bar snacks till late';
      return { state: 'open', title: 'The fire’s lit', short: 'The fire’s lit · bar open until ' + clock(today.bar[1]),
        detail: 'Bar open until ' + clock(today.bar[1]) + '. ' + food + '.' };
    }
    if (t < toMinutes(today.bar[0])) {
      var morning = t >= 5 * 60;
      return { state: 'resting', title: morning ? 'Morning at the Hart' : 'The fire’s banked for the night',
        short: 'Bar opens at ' + clock(today.bar[0]) + ' today',
        detail: (morning && t < toMinutes(today.breakfast[1]) ? 'Breakfast for inn guests until ' + clock(today.breakfast[1]) + '. ' : '') +
          'The bar opens at ' + clock(today.bar[0]) + ' today.' };
    }
    return { state: 'resting', title: 'The fire’s banked for the night', short: 'Bar opens at ' + clock(tomorrow.bar[0]) + ' tomorrow',
      detail: 'Inn guests, the night manager has your key. The bar opens at ' + clock(tomorrow.bar[0]) + ' tomorrow.' };
  }
  function initStatus() {
    var now = nowLondon(), s = getStatus(now);
    $$('[data-status]').forEach(function (el) { el.setAttribute('data-state', s.state); });
    $$('[data-status-title]').forEach(function (el) { el.textContent = s.title; });
    $$('[data-status-short]').forEach(function (el) { el.textContent = s.short; });
    $$('[data-status-detail]').forEach(function (el) { el.textContent = s.detail; });
    // Today's hours in "Today at the Hart" panels and the hours table.
    var today = HOURS[now.weekday];
    $$('[data-today-bar]').forEach(function (el) { el.textContent = clock(today.bar[0]) + ' – ' + clock(today.bar[1]); });
    $$('[data-today-kitchen]').forEach(function (el) { el.textContent = today.kitchen.map(function (k) { return clock(k[0]) + ' – ' + clock(k[1]); }).join(', '); });
    $$('[data-today-breakfast]').forEach(function (el) { el.textContent = clock(today.breakfast[0]) + ' – ' + clock(today.breakfast[1]); });
    $$('[data-today-name]').forEach(function (el) { el.textContent = WEEKDAYS[now.weekday]; });
    $$('[data-hours-day]').forEach(function (row) {
      var isToday = row.getAttribute('data-hours-day') === String(now.weekday);
      row.toggleAttribute('data-today', isToday);
      var badge = $('[data-today-badge]', row);
      if (badge) badge.hidden = !isToday;
      if (isToday) row.setAttribute('aria-current', 'date'); else row.removeAttribute('aria-current');
    });
  }

  /* ------------------------------------------------------------------
   * 5. Rooms: stay checker with seasonal prices and the saved inquiry
   * ------------------------------------------------------------------ */
  function seasonOf(day) {
    var m = monthOf(day);
    for (var key in SEASONS) if (has(SEASONS, key) && SEASONS[key].months.indexOf(m) !== -1) return key;
    return 'mid';
  }
  // Demo availability: a fixed pattern of booked nights so the checker has something to say.
  // Replace with a call to your booking system.
  function isBooked(roomId, day) {
    var i = ROOM_ORDER.indexOf(roomId);
    return (day * 7 + i * 13) % 23 === 0;
  }
  // Price a stay: one line per season used, nights x rate, plus the dog fee.
  function quote(roomId, inDay, outDay, dogs) {
    var room = ROOMS[roomId], lines = [], bySeason = {}, order = [], total = 0, booked = [];
    for (var d = inDay; d < outDay; d++) {
      var s = seasonOf(d);
      if (!has(bySeason, s)) { bySeason[s] = 0; order.push(s); }
      bySeason[s] += 1;
      if (isBooked(roomId, d)) booked.push(d);
    }
    order.forEach(function (s) {
      var n = bySeason[s], rate = room.rates[s], sub = n * rate;
      total += sub;
      lines.push({ label: plural(n, 'night') + ' × ' + money(rate) + ' (' + SEASONS[s].label.toLowerCase() + ')', amount: sub });
    });
    if (dogs > 0) {
      var fee = dogs * STAY_RULES.dogFee;
      total += fee;
      lines.push({ label: plural(dogs, 'dog') + ' × ' + money(STAY_RULES.dogFee) + ' per stay', amount: fee });
    }
    return { lines: lines, total: total, booked: booked };
  }
  // Validate a stay. Returns { errors: {field: message}, stay }.
  function checkStay(v, today) {
    var errors = {};
    var inOk = isIsoDate(v.checkin), outOk = isIsoDate(v.checkout);
    var inDay = inOk ? dayNumber(v.checkin) : null, outDay = outOk ? dayNumber(v.checkout) : null;
    if (!v.checkin) errors.checkin = 'Choose your arrival date.';
    else if (!inOk) errors.checkin = 'Enter a real date.';
    else if (inDay < today) errors.checkin = 'That date has passed. Choose today or later.';
    else if (inDay > today + STAY_RULES.maxDaysAhead) errors.checkin = 'We take bookings up to a year ahead.';
    if (!v.checkout) errors.checkout = 'Choose your departure date.';
    else if (!outOk) errors.checkout = 'Enter a real date.';
    else if (inOk && outDay <= inDay) errors.checkout = 'Departure must be after arrival.';
    else if (inOk && outDay - inDay > STAY_RULES.maxNights) errors.checkout = 'For stays over ' + STAY_RULES.maxNights + ' nights, please call us.';
    if (!errors.checkin && !errors.checkout && inOk && outOk) {
      var nights = outDay - inDay, hasSaturday = false;
      for (var d = inDay; d < outDay; d++) if (weekdayOf(d) === 6) hasSaturday = true;
      if (hasSaturday && nights < STAY_RULES.saturdayMinNights) {
        errors.checkout = 'Stays that include a Saturday night are ' + STAY_RULES.saturdayMinNights + ' nights minimum. Try leaving on ' + longDate(inDay + STAY_RULES.saturdayMinNights) + '.';
      }
    }
    var room = v.room && has(ROOMS, v.room) ? ROOMS[v.room] : null;
    if (room && v.guests > room.sleeps) errors.guests = room.name + ' sleeps ' + plural(room.sleeps, 'guest') + '. Choose another room or fewer guests.';
    if (room && v.dogs > 0 && !room.dogs) errors.dogs = room.name + ' is dog-free. Our dog-friendly rooms are the Snug, the Hayloft, Shepherd’s Room and the Old Dairy.';
    return { errors: errors, inDay: inDay, outDay: outDay };
  }

  function cleanEnquiry(raw, today) {
    var out = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    if (isIsoDate(raw.checkin) && dayNumber(raw.checkin) >= today) out.checkin = raw.checkin;
    if (isIsoDate(raw.checkout) && out.checkin && dayNumber(raw.checkout) > dayNumber(out.checkin)) out.checkout = raw.checkout;
    var g = typeof raw.guests === 'number' ? raw.guests : NaN;
    if (g >= 1 && g <= STAY_RULES.maxGuests && Math.floor(g) === g) out.guests = g;
    var dg = typeof raw.dogs === 'number' ? raw.dogs : NaN;
    if (dg >= 0 && dg <= STAY_RULES.maxDogs && Math.floor(dg) === dg) out.dogs = dg;
    if (has(ROOMS, raw.room)) out.room = raw.room;
    ['name', 'email', 'phone', 'message'].forEach(function (k) {
      if (typeof raw[k] === 'string' && raw[k].length) out[k] = raw[k].slice(0, k === 'message' ? 1000 : 120);
    });
    return out;
  }

  function initStayChecker() {
    var form = $('#stay-check');
    if (!form) return;
    var results = $('#stay-results'), enquiry = $('#enquiry'), today = nowLondon().day;
    var f = form.elements, ef = enquiry ? enquiry.elements : null;
    var submitted = false;

    f.checkin.min = isoOf(today); f.checkout.min = isoOf(today + 1);
    f.checkin.max = isoOf(today + STAY_RULES.maxDaysAhead);

    // Restore the saved inquiry, then let URL parameters (from a room card or the home page) win.
    var saved = cleanEnquiry(readJSON(ENQUIRY_KEY), today);
    var q = params();
    var fromUrl = {};
    if (isIsoDate(q.get('checkin'))) fromUrl.checkin = q.get('checkin');
    if (isIsoDate(q.get('checkout'))) fromUrl.checkout = q.get('checkout');
    if (/^[1-4]$/.test(q.get('guests') || '')) fromUrl.guests = +q.get('guests');
    if (/^[0-2]$/.test(q.get('dogs') || '')) fromUrl.dogs = +q.get('dogs');
    if (has(ROOMS, q.get('room'))) fromUrl.room = q.get('room');
    var start = cleanEnquiry(Object.assign({}, saved, fromUrl), today);
    if (start.checkin) f.checkin.value = start.checkin;
    if (start.checkout) f.checkout.value = start.checkout;
    if (start.guests) f.guests.value = String(start.guests);
    if (typeof start.dogs === 'number') f.dogs.value = String(start.dogs);
    f.room.value = start.room || '';
    if (ef) ['name', 'email', 'phone', 'message'].forEach(function (k) { if (start[k] && ef[k]) ef[k].value = start[k]; });
    var restored = Object.keys(saved).length > 0;
    var note = $('[data-draft-note]');
    if (note) note.hidden = !restored;

    function values() {
      return { checkin: f.checkin.value, checkout: f.checkout.value, guests: +f.guests.value, dogs: +f.dogs.value, room: f.room.value };
    }
    function save() {
      var v = values(), data = { checkin: v.checkin, checkout: v.checkout, guests: v.guests, dogs: v.dogs, room: v.room };
      if (ef) ['name', 'email', 'phone', 'message'].forEach(function (k) { if (ef[k]) data[k] = ef[k].value; });
      var clean = cleanEnquiry(data, today);
      writeJSON(ENQUIRY_KEY, Object.keys(clean).length ? clean : null);
    }
    function showErrors(errors) {
      ['checkin', 'checkout', 'guests', 'dogs'].forEach(function (name) {
        var input = f[name], msg = errors[name] || '';
        $('#stay-' + name + '-error').textContent = msg;
        if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
      });
    }
    function render(focusResults) {
      var v = values(), r = checkStay(v, today);
      showErrors(r.errors);
      var bad = Object.keys(r.errors);
      if (bad.length) {
        results.innerHTML = '<p class="font-display font-semibold text-oxblood">Please fix ' + (bad.length === 1 ? 'the highlighted field' : 'the ' + bad.length + ' highlighted fields') + ' and check again.</p>';
        if (focusResults) f[bad[0]].focus();
        return;
      }
      var nights = r.outDay - r.inDay;
      var ids = v.room ? [v.room] : ROOM_ORDER;
      var html = '<p class="font-display text-lg font-semibold">' + plural(nights, 'night') + ', ' + shortDate(r.inDay) + ' to ' + shortDate(r.outDay) +
        ' · ' + plural(v.guests, 'guest') + (v.dogs ? ' · ' + plural(v.dogs, 'dog') : '') + '</p><ul class="mt-4 grid gap-4">';
      var available = 0;
      ids.forEach(function (id) {
        var room = ROOMS[id], qd = quote(id, r.inDay, r.outDay, v.dogs), reason = '';
        if (v.guests > room.sleeps) reason = 'Sleeps ' + plural(room.sleeps, 'guest');
        else if (v.dogs > 0 && !room.dogs) reason = 'No dogs in this room';
        else if (qd.booked.length) reason = 'Booked on ' + qd.booked.slice(0, 2).map(shortDate).join(' and ') + (qd.booked.length > 2 ? ' and ' + plural(qd.booked.length - 2, 'other night') : '');
        if (!reason) available++;
        html += '<li class="' + (reason ? 'panel opacity-90' : 'card') + ' p-4 sm:p-5" data-result="' + id + '">' +
          '<div class="flex flex-wrap items-baseline justify-between gap-2"><h3 class="font-display text-xl font-bold">' + escapeHtml(room.name) + '</h3>' +
          (reason ? '<span class="stamp text-muted">' + escapeHtml(reason) + '</span>' : '<span class="stamp text-forest">Available</span>') + '</div>';
        if (!reason) {
          html += '<dl class="mt-3 grid gap-1 text-[0.98rem]">' + qd.lines.map(function (l) {
            return '<div class="flex justify-between gap-4"><dt>' + l.label + '</dt><dd class="tabular-nums">' + money(l.amount) + '</dd></div>';
          }).join('') + '<div class="mt-1 flex justify-between gap-4 border-t-2 border-ink pt-2 font-display text-lg font-bold"><dt>Total before tax</dt><dd class="tabular-nums" data-total>' + money(qd.total) + '</dd></div></dl>' +
          '<button type="button" class="btn-green btn-sm mt-4" data-enquire="' + id + '">Inquire about ' + escapeHtml(room.name) + '</button>';
        }
        html += '</li>';
      });
      html += '</ul>';
      if (!available) html += '<p class="mt-4">Nothing free for those dates' + (v.room ? ' in that room. Try <button type="button" class="link font-semibold" data-any-room>any room</button>, or call' : '. Call') + ' us at (802) 555-0161: we sometimes have cancellations.</p>';
      results.innerHTML = html;
      if (focusResults) { results.focus(); }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitted = true;
      save();
      render(true);
    });
    form.addEventListener('change', function () {
      save();
      if (submitted) render(false);
    });
    results.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-enquire]');
      if (btn && enquiry) {
        var id = btn.getAttribute('data-enquire');
        if (!has(ROOMS, id)) return;
        f.room.value = id; save(); render(false);
        $('[data-enquiry-summary]').textContent = summaryText();
        enquiry.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
        ef.name.focus({ preventScroll: true });
      }
      if (e.target.closest('[data-any-room]')) { f.room.value = ''; save(); render(false); }
    });
    function summaryText() {
      var v = values(), r = checkStay(v, today);
      if (Object.keys(r.errors).length || !v.checkin || !v.checkout) return 'No dates chosen yet: check your dates above first, or just ask us below.';
      var room = has(ROOMS, v.room) ? ROOMS[v.room].name : 'Any room';
      var total = v.room ? ' · ' + money(quote(v.room, r.inDay, r.outDay, v.dogs).total) + ' before tax' : '';
      return room + ' · ' + shortDate(r.inDay) + ' to ' + shortDate(r.outDay) + ' (' + plural(r.outDay - r.inDay, 'night') + ') · ' + plural(v.guests, 'guest') + (v.dogs ? ', ' + plural(v.dogs, 'dog') : '') + total;
    }
    if (enquiry) {
      $('[data-enquiry-summary]').textContent = summaryText();
      form.addEventListener('change', function () { $('[data-enquiry-summary]').textContent = summaryText(); });
      enquiry.addEventListener('input', save);
      var clear = $('[data-clear-draft]');
      if (clear) clear.addEventListener('click', function () {
        writeJSON(ENQUIRY_KEY, null);
        form.reset(); enquiry.reset(); f.room.value = '';
        submitted = false; results.innerHTML = ''; showErrors({});
        $('[data-enquiry-summary]').textContent = summaryText();
        if (note) note.hidden = true;
        announce('Saved details cleared.');
      });
      enquiry.addEventListener('enquiry:sent', function () { writeJSON(ENQUIRY_KEY, null); if (note) note.hidden = true; });
    }
    // Arriving with dates in the URL: show prices straight away.
    if (fromUrl.checkin && fromUrl.checkout) { submitted = true; render(false); }
  }

  // Home page "check a stay" mini form: validates, then opens rooms.html with the dates.
  function initQuickCheck() {
    var form = $('#quick-check');
    if (!form) return;
    var today = nowLondon().day, f = form.elements;
    f.checkin.min = isoOf(today); f.checkout.min = isoOf(today + 1);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = { checkin: f.checkin.value, checkout: f.checkout.value, guests: +f.guests.value, dogs: 0, room: '' };
      var r = checkStay(v, today);
      ['checkin', 'checkout'].forEach(function (name) {
        var msg = r.errors[name] || '';
        $('#quick-' + name + '-error').textContent = msg;
        if (msg) f[name].setAttribute('aria-invalid', 'true'); else f[name].removeAttribute('aria-invalid');
      });
      if (r.errors.checkin) { f.checkin.focus(); return; }
      if (r.errors.checkout) { f.checkout.focus(); return; }
      window.location.href = 'rooms.html?checkin=' + v.checkin + '&checkout=' + v.checkout + '&guests=' + v.guests + '#check';
    });
  }

  /* ------------------------------------------------------------------
   * 6. Food: menu tabs, diet filter, specials board
   * ------------------------------------------------------------------ */
  function initMenu() {
    var tablist = $('[data-menu-tabs]');
    if (!tablist) return;
    var tabs = $$('[role="tab"]', tablist);
    var ids = tabs.map(function (t) { return t.getAttribute('data-tab'); });
    var lookup = {};
    ids.forEach(function (id) { lookup[id] = true; });
    var active = null;
    var toggles = $$('[data-diet-filter]');
    var status = $('[data-diet-status]');

    function select(id, focus, updateHash) {
      tabs.forEach(function (t) {
        var on = t.getAttribute('data-tab') === id;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        $('#' + t.getAttribute('aria-controls')).hidden = !on;
        if (on && focus) t.focus();
      });
      active = id;
      if (updateHash && window.history.replaceState) window.history.replaceState(null, '', '#' + id);
      applyDiet();
    }
    // Default tab: the hash if valid, otherwise whichever menu is being served now at the inn.
    function defaultTab() {
      var now = nowLondon(), t = now.minutes;
      if (t < 11 * 60) return 'breakfast';
      if (now.weekday === 0 && t < 16 * 60) return 'roast';
      if (t < 17 * 60) return now.weekday === 0 ? 'dinner' : 'lunch';
      return 'dinner';
    }
    var fromHash = window.location.hash.slice(1);
    select(has(lookup, fromHash) ? fromHash : defaultTab(), false, false);

    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t.getAttribute('data-tab'), false, true); });
      t.addEventListener('keydown', function (e) {
        var k = e.key, j = null;
        if (k === 'ArrowRight') j = (i + 1) % tabs.length;
        else if (k === 'ArrowLeft') j = (i - 1 + tabs.length) % tabs.length;
        else if (k === 'Home') j = 0;
        else if (k === 'End') j = tabs.length - 1;
        if (j !== null) { e.preventDefault(); select(ids[j], true, true); }
      });
    });
    window.addEventListener('hashchange', function () {
      var h = window.location.hash.slice(1);
      if (has(lookup, h) && h !== active) select(h, false, false);
    });

    // Diet filter: each pressed toggle must match (vegan dishes also carry "v").
    function applyDiet() {
      var need = toggles.filter(function (b) { return b.getAttribute('aria-pressed') === 'true'; }).map(function (b) { return b.getAttribute('data-diet-filter'); });
      var panel = $('#menu-' + active);
      if (!panel) return;
      var items = $$('[data-dish]', panel), shown = 0;
      items.forEach(function (it) {
        var diet = (it.getAttribute('data-diet') || '').split(/\s+/);
        var ok = need.every(function (d) { return diet.indexOf(d) !== -1; });
        it.hidden = !ok;
        if (ok) shown++;
      });
      $$('[data-menu-group]', panel).forEach(function (g) { g.hidden = !$$('[data-dish]:not([hidden])', g).length; });
      var empty = $('[data-menu-empty]', panel);
      if (empty) empty.hidden = shown > 0;
      if (status) {
        var tabName = $('[data-tab="' + active + '"]').textContent.trim();
        status.textContent = need.length ? 'Showing ' + shown + ' of ' + plural(items.length, 'dish', 'dishes') + ' on the ' + tabName + ' menu.' : plural(items.length, 'dish', 'dishes') + ' on the ' + tabName + ' menu.';
      }
    }
    toggles.forEach(function (b) {
      b.addEventListener('click', function () {
        b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
        applyDiet();
      });
    });
    $$('[data-diet-clear]').forEach(function (b) {
      b.addEventListener('click', function () { toggles.forEach(function (t) { t.setAttribute('aria-pressed', 'false'); }); applyDiet(); });
    });
    applyDiet();
  }

  function initSpecials() {
    var board = $('[data-specials]');
    if (!board) return;
    var now = nowLondon(), list = SPECIALS[now.weekday];
    $$('[data-specials-day]').forEach(function (el) { el.textContent = WEEKDAYS[now.weekday]; });
    board.innerHTML = list.map(function (s) {
      return '<li class="flex items-baseline gap-3"><span class="min-w-0 flex-1">' + escapeHtml(s[0]) + '</span><span class="shrink-0 border-b border-dotted border-chalk/40 flex-[0_1_3rem]" aria-hidden="true"></span><span class="shrink-0">' + money(s[1]) + '</span></li>';
    }).join('');
  }

  /* ------------------------------------------------------------------
   * 7. Trails: filters, route map and saved trails
   * ------------------------------------------------------------------ */
  function loadSavedWalks() {
    var raw = readJSON(WALKS_KEY), out = [];
    if (Array.isArray(raw)) raw.forEach(function (id) { if (has(WALKS, id) && out.indexOf(id) === -1) out.push(id); });
    return out;
  }
  function initWalks() {
    var list = $('[data-walk-list]');
    if (!list) return;
    var cards = $$('[data-walk]', list);
    var saved = loadSavedWalks();
    var state = { length: 'any', level: 'any', saved: false };
    var q = params();
    if (has(WALK_LENGTHS, q.get('length'))) state.length = q.get('length');
    if (has(WALK_LEVELS, q.get('level'))) state.level = q.get('level');
    var count = $('[data-walk-count]'), empty = $('[data-walk-empty]');

    function sync() {
      $$('[data-filter-length]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter-length') === state.length)); });
      $$('[data-filter-level]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter-level') === state.level)); });
      $$('[data-saved-only]').forEach(function (b) { b.setAttribute('aria-pressed', String(state.saved)); });
      $$('[data-saved-count]').forEach(function (el) { el.textContent = String(saved.length); });
      var shown = 0;
      cards.forEach(function (card) {
        var id = card.getAttribute('data-walk'), miles = +card.getAttribute('data-miles');
        var okLen = state.length === 'any' || (miles >= WALK_LENGTHS[state.length][0] && miles < WALK_LENGTHS[state.length][1]);
        var okLevel = state.level === 'any' || card.getAttribute('data-level') === state.level;
        var okSaved = !state.saved || saved.indexOf(id) !== -1;
        var show = okLen && okLevel && okSaved;
        card.hidden = !show;
        if (show) shown++;
        var heart = $('[data-walk-save]', card);
        if (heart) {
          var on = saved.indexOf(id) !== -1;
          heart.setAttribute('aria-pressed', String(on));
          $('[data-save-label]', heart).textContent = on ? 'Saved' : 'Save';
        }
      });
      count.textContent = 'Showing ' + plural(shown, 'trail') + ' of ' + cards.length + '.';
      empty.hidden = shown > 0;
      // Keep the map in step: dim routes that are filtered out.
      $$('[data-route]').forEach(function (r) {
        var card = $('[data-walk="' + r.getAttribute('data-route') + '"]', list);
        r.toggleAttribute('data-dim', !!(card && card.hidden));
      });
      var u = new URLSearchParams();
      if (state.length !== 'any') u.set('length', state.length);
      if (state.level !== 'any') u.set('level', state.level);
      if (window.history.replaceState) window.history.replaceState(null, '', window.location.pathname + (u.toString() ? '?' + u : '') + window.location.hash);
    }
    function showRoute(id) {
      $$('[data-route]').forEach(function (r) { r.toggleAttribute('data-active', r.getAttribute('data-route') === id); });
      $$('[data-show-route]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-show-route') === id)); });
      var label = $('[data-map-label]');
      if (label) label.textContent = has(WALKS, id) ? WALKS[id].name + ' · ' + WALKS[id].miles + ' miles' : 'Choose a trail to see its route';
    }
    $$('[data-filter-length]').forEach(function (b) { b.addEventListener('click', function () { state.length = b.getAttribute('data-filter-length'); sync(); }); });
    $$('[data-filter-level]').forEach(function (b) { b.addEventListener('click', function () { state.level = b.getAttribute('data-filter-level'); sync(); }); });
    $$('[data-saved-only]').forEach(function (b) { b.addEventListener('click', function () { state.saved = !state.saved; sync(); }); });
    $$('[data-walk-reset]').forEach(function (b) { b.addEventListener('click', function () { state = { length: 'any', level: 'any', saved: false }; sync(); }); });
    list.addEventListener('click', function (e) {
      var save = e.target.closest('[data-walk-save]');
      if (save) {
        var id = save.closest('[data-walk]').getAttribute('data-walk');
        if (!has(WALKS, id)) return;
        var i = saved.indexOf(id);
        if (i === -1) saved.push(id); else saved.splice(i, 1);
        writeJSON(WALKS_KEY, saved.length ? saved : null);
        announce(i === -1 ? WALKS[id].name + ' saved.' : WALKS[id].name + ' removed from saved trails.');
        sync();
      }
      var show = e.target.closest('[data-show-route]');
      if (show) showRoute(show.getAttribute('data-show-route'));
    });
    showRoute(cards[0].getAttribute('data-walk'));
    sync();
  }

  /* ------------------------------------------------------------------
   * 8. Events: recurring rules and one-offs, upcoming by date
   * ------------------------------------------------------------------ */
  function nthOfMonth(day) {
    var iso = isoOf(day), d = +iso.slice(8, 10);
    var n = Math.floor((d - 1) / 7) + 1;
    var last = monthOf(day + 7) !== monthOf(day);
    return { n: n, last: last };
  }
  // KEEP_DEMO_CURRENT: the event's day, moved on by whole years until it is today or later.
  function demoEventDay(e, today) {
    var d = dayNumber(e.date), wd = weekdayOf(d), year = +e.date.slice(0, 4);
    for (var i = 0; d < today && i < 100; i++) {
      year++;
      d = dayNumber(year + e.date.slice(4));
      if (e.sameWeekday) d += ((wd - weekdayOf(d) + 10) % 7) - 3; // nearest day with the same weekday
    }
    return d;
  }
  function upcomingEvents(now, days) {
    var out = [];
    for (var d = now.day; d < now.day + days; d++) {
      var wd = weekdayOf(d), nth = nthOfMonth(d);
      EVENT_RULES.forEach(function (r) {
        if (r.weekday !== wd) return;
        if (r.nth && !r.nth.some(function (n) { return n === -1 ? nth.last : n === nth.n; })) return;
        out.push({ id: r.id, type: r.type, day: d, time: r.time, title: r.title, price: r.price, text: r.text });
      });
    }
    EVENTS.forEach(function (e) {
      if (!isIsoDate(e.date)) return;
      var d = KEEP_DEMO_CURRENT ? demoEventDay(e, now.day) : dayNumber(e.date);
      if (d >= now.day && d < now.day + days) out.push({ id: e.id, type: e.type, day: d, time: e.time, title: e.title, price: e.price, text: e.text });
    });
    // Drop tonight's events that finished (three hours after the start).
    out = out.filter(function (e) { return e.day > now.day || toMinutes(e.time) + 180 > now.minutes; });
    out.sort(function (a, b) { return a.day - b.day || toMinutes(a.time) - toMinutes(b.time); });
    return out;
  }
  function whenLabel(e, now) {
    if (e.day === now.day) return toMinutes(e.time) >= 17 * 60 ? 'Tonight' : 'Today';
    if (e.day === now.day + 1) return 'Tomorrow';
    return WEEKDAYS[weekdayOf(e.day)];
  }
  function eventCard(e, now) {
    var iso = isoOf(e.day);
    return '<li class="reveal is-visible card grid grid-cols-[4.5rem_1fr] gap-4 p-4 sm:grid-cols-[5.5rem_1fr] sm:gap-6 sm:p-6" data-event="' + e.id + '" data-type="' + e.type + '">' +
      '<div class="self-start border-2 border-ink bg-forest text-center text-chalk"><span class="block bg-oxblood py-1 font-display text-xs font-semibold uppercase tracking-[0.18em]">' + MONTHS[+iso.slice(5, 7) - 1].slice(0, 3) + '</span><span class="block py-1 font-display text-3xl font-bold sm:text-4xl">' + +iso.slice(8, 10) + '</span></div>' +
      '<div class="min-w-0"><p class="eyebrow">' + escapeHtml(whenLabel(e, now)) + ' · ' + clock(e.time) + ' · ' + escapeHtml(EVENT_TYPES[e.type]) + '</p>' +
      '<h3 class="mt-1 font-display text-xl font-bold sm:text-2xl">' + escapeHtml(e.title) + '</h3>' +
      '<p class="mt-1.5 text-muted">' + escapeHtml(e.text) + '</p><p class="mt-2 font-display text-sm font-semibold">' + escapeHtml(e.price) + '</p></div></li>';
  }
  function initEvents() {
    var now = nowLondon();
    var next = $('[data-next-event]');
    if (next) {
      var first = upcomingEvents(now, EVENT_WINDOW_DAYS)[0];
      if (first) {
        next.innerHTML = '<span class="font-display font-bold">' + escapeHtml(first.title) + '</span><br><span class="text-chalk/80">' + escapeHtml(whenLabel(first, now)) + (first.day > now.day + 1 ? ' ' + shortDate(first.day).slice(5) : '') + ', ' + clock(first.time) + '</span>';
      }
    }
    var list = $('[data-event-list]');
    if (!list) return;
    var all = upcomingEvents(now, EVENT_WINDOW_DAYS);
    var type = params().get('type');
    var current = has(EVENT_TYPES, type) ? type : 'all';
    var count = $('[data-event-count]'), empty = $('[data-event-empty]');
    function render() {
      var shown = all.filter(function (e) { return current === 'all' || e.type === current; });
      list.innerHTML = shown.map(function (e) { return eventCard(e, now); }).join('');
      count.textContent = plural(shown.length, current === 'all' ? 'event' : EVENT_TYPES[current].toLowerCase() + ' event') + ' in the next ' + EVENT_WINDOW_DAYS + ' days.';
      empty.hidden = shown.length > 0;
      $$('[data-event-type]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-event-type') === current)); });
    }
    $$('[data-event-type]').forEach(function (b) {
      b.addEventListener('click', function () {
        current = b.getAttribute('data-event-type');
        if (current !== 'all' && !has(EVENT_TYPES, current)) current = 'all';
        var u = new URLSearchParams(); if (current !== 'all') u.set('type', current);
        if (window.history.replaceState) window.history.replaceState(null, '', window.location.pathname + (u.toString() ? '?' + u : ''));
        render();
      });
    });
    render();
  }

  /* ------------------------------------------------------------------
   * 9. Gift certificates: live preview and total
   * ------------------------------------------------------------------ */
  function voucherState(form) {
    var f = form.elements, kind = (form.querySelector('input[name="kind"]:checked') || {}).value;
    if (!has(VOUCHERS, kind)) kind = 'amount';
    var amountRaw = f.amount.value.trim(), amount = /^\d+$/.test(amountRaw) ? +amountRaw : NaN;
    var value = kind === 'amount' ? amount : VOUCHERS[kind].price;
    var delivery = (form.querySelector('input[name="delivery"]:checked') || {}).value === 'post' ? 'post' : 'email';
    var postage = delivery === 'post' ? VOUCHER_LIMITS.postage : 0;
    return { kind: kind, amount: amount, value: value, delivery: delivery, postage: postage, total: isFinite(value) ? value + postage : NaN };
  }
  function initVouchers() {
    var form = $('#voucher-form');
    if (!form) return;
    var f = form.elements;
    function update() {
      var s = voucherState(form);
      $('[data-amount-wrap]').hidden = s.kind !== 'amount';
      f.amount.disabled = s.kind !== 'amount';
      $('[data-email-wrap]').hidden = s.delivery !== 'email';
      $('[data-post-wrap]').hidden = s.delivery !== 'post';
      var left = VOUCHER_LIMITS.messageMax - f.message.value.length;
      var counter = $('[data-message-count]');
      counter.textContent = left >= 0 ? plural(left, 'character') + ' left' : plural(-left, 'character') + ' too many';
      counter.classList.toggle('text-oxblood', left < 0);
      $('[data-preview-title]').textContent = s.kind === 'amount' ? (isFinite(s.value) && s.value >= VOUCHER_LIMITS.min && s.value <= VOUCHER_LIMITS.max ? money(s.value) : '$—') : VOUCHERS[s.kind].label;
      $('[data-preview-sub]').textContent = s.kind === 'amount' ? 'to spend on rooms, food and drink' : 'worth ' + money(VOUCHERS[s.kind].price);
      $('[data-preview-to]').textContent = f.to.value.trim() || 'Someone special';
      $('[data-preview-from]').textContent = f.from.value.trim() || 'you';
      $('[data-preview-message]').textContent = f.message.value.trim() || 'A night by the fire in Vermont. Enjoy!';
      var okValue = isFinite(s.value) && s.value >= VOUCHER_LIMITS.min && s.value <= VOUCHER_LIMITS.max;
      $('[data-voucher-total]').textContent = okValue ? money(s.total) : '$—';
      $('[data-voucher-breakdown]').textContent = okValue ? (money(s.value) + ' certificate' + (s.postage ? ' + ' + money(s.postage) + ' printed card by mail' : ', sent by email')) : 'Enter an amount between ' + money(VOUCHER_LIMITS.min) + ' and ' + money(VOUCHER_LIMITS.max) + '.';
    }
    form.addEventListener('input', update);
    form.addEventListener('change', update);
    form.addEventListener('reset', function () { setTimeout(update, 0); });
    update();
  }

  /* ------------------------------------------------------------------
   * 10. Contact: topic from the URL
   * ------------------------------------------------------------------ */
  function initContactTopic() {
    var select = $('#contact-topic');
    if (!select) return;
    var topic = params().get('topic');
    if (has(CONTACT_TOPICS, topic)) select.value = topic;
  }

  /* ------------------------------------------------------------------
   * 11. Forms: inline validation and a success state with a reference.
   *     To send for real, see "Forms" in DOCS.md (e.g. Formspree: set the form's
   *     action and replace the marked block below with a fetch() POST).
   * ------------------------------------------------------------------ */
  // A short reference for confirmations, like FH-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var live;
  function announce(msg) {
    if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = msg; }, 30);
  }
  function fieldError(form, input) {
    var v = input.value.trim(), name = input.name;
    if (input.disabled || input.closest('[hidden]')) return '';
    if (input.type === 'checkbox' && input.required && !input.checked) return input.getAttribute('data-required-msg') || 'Please check this box.';
    if (input.required && !v) return input.getAttribute('data-required-msg') || 'This field is required.';
    if (v && input.type === 'email' && !EMAIL_RE.test(v)) return 'Enter an email address like name@example.com.';
    if (v && input.type === 'tel' && !/^[+()\d\s-]{7,20}$/.test(v)) return 'Enter a phone number using digits and spaces.';
    if (v && input.getAttribute('data-minlength') && v.length < +input.getAttribute('data-minlength')) return 'Please write at least ' + input.getAttribute('data-minlength') + ' characters.';
    if (input.getAttribute('data-maxlength') && input.value.length > +input.getAttribute('data-maxlength')) return 'Please keep it to ' + input.getAttribute('data-maxlength') + ' characters.';
    if (name === 'amount' && form.id === 'voucher-form') {
      if (!/^\d+$/.test(v)) return 'Enter a whole number of dollars, such as 50.';
      if (+v < VOUCHER_LIMITS.min || +v > VOUCHER_LIMITS.max) return 'Choose an amount from ' + money(VOUCHER_LIMITS.min) + ' to ' + money(VOUCHER_LIMITS.max) + '.';
    }
    return '';
  }
  function initForms() {
    $$('form[data-validate]').forEach(function (form) {
      var inputs = $$('input, select, textarea', form).filter(function (i) { return i.name && i.type !== 'radio' && i.type !== 'hidden'; });
      function check(input) {
        var msg = fieldError(form, input), err = $('#' + input.id + '-error');
        if (err) err.textContent = msg;
        if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
        return !msg;
      }
      inputs.forEach(function (input) {
        input.addEventListener('blur', function () { if (input.value || input.hasAttribute('aria-invalid')) check(input); });
        input.addEventListener('input', function () { if (input.hasAttribute('aria-invalid')) check(input); });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var firstBad = null;
        inputs.forEach(function (i) { if (!check(i) && !firstBad) firstBad = i; });
        if (firstBad) { firstBad.focus(); announce('Please fix the highlighted fields.'); return; }
        // ---- Demo only: nothing is sent. Replace this block with a fetch() to your form service. ----
        var success = $('#' + form.getAttribute('data-success'));
        var name = form.elements.name ? form.elements.name.value.trim().split(/\s+/)[0] : '';
        if (success) {
          $$('[data-success-name]', success).forEach(function (el) { el.textContent = name ? ', ' + name : ''; });
          // A short reference, like FH-7K2Q (use your form service's own reference if it returns one).
          var ref = makeRef('FH');
          $$('[data-success-ref]', success).forEach(function (el) { el.textContent = ref; });
          if (form.id === 'voucher-form') {
            var s = voucherState(form);
            $$('[data-success-total]', success).forEach(function (el) { el.textContent = money(s.total); });
            $$('[data-success-delivery]', success).forEach(function (el) {
              el.textContent = s.delivery === 'post'
                ? 'We\u2019ll mail the printed card first class within two business days and email your receipt to you shortly.'
                : 'We\u2019ll email the certificate to its recipient and your receipt to you shortly.';
            });
          }
          success.hidden = false;
          if (form.hasAttribute('data-hide-on-success')) form.hidden = true;
          success.focus();
        }
        form.dispatchEvent(new CustomEvent('enquiry:sent'));
        form.reset();
        inputs.forEach(function (i) { i.removeAttribute('aria-invalid'); });
      });
    });
    $$('[data-form-again]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var success = btn.closest('[data-success-panel]'), form = $('#' + btn.getAttribute('data-form-again'));
        success.hidden = true; form.hidden = false;
        var first = $('input:not([type=radio]), select, textarea', form);
        if (first) first.focus();
      });
    });
  }

  /* ------------------------------------------------------------------
   * 12. Header, mobile menu, scroll reveal, year
   * ------------------------------------------------------------------ */
  function initChrome() {
    live = $('#live-region');
    var menuBtn = $('#menu-toggle'), menu = $('#mobile-menu');
    function setMenu(open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      $('.sr-only', menuBtn).textContent = open ? 'Close menu' : 'Menu';
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
      window.matchMedia('(min-width: 1280px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
    }
    var header = $('#site-header');
    var onScroll = function () { header.toggleAttribute('data-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    $$('[data-year]').forEach(function (el) { el.textContent = String(londonParts(new Date()).y); });

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
    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------
   * 13. Back to top
   * ------------------------------------------------------------------ */
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="square" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    document.body.appendChild(btn);
    var onScroll = function () { btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var main = $('#main');
      if (main) { main.classList.add('back-to-top-target'); main.focus({ preventScroll: true }); }
    });
  }

  initChrome();
  initStatus();
  initQuickCheck();
  initStayChecker();
  initMenu();
  initSpecials();
  initWalks();
  initEvents();
  initVouchers();
  initContactTopic();
  initForms();
  initBackToTop();

  // Exposed for tests and debugging.
  window.Hearth = { getStatus: getStatus, quote: quote, checkStay: checkStay, upcomingEvents: upcomingEvents, seasonOf: seasonOf, isBooked: isBooked, dayNumber: dayNumber, nowLondon: nowLondon };
})();
