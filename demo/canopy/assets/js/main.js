/* Tamarack Pines Campground & Cabins — Canopy template. Vanilla JavaScript, no dependencies.
 *
 * Sections
 *  1. Settings and data         7. Booking: calendar, add-ons, totals   13. Forms
 *  2. Helpers and storage       8. Activities: trails and profiles      14. Header, menu, reveal
 *  3. Marquette time            9. Guided programs (rolling dates)      15. Back to top
 *  4. Season rule and status   10. Rates: season strip and table
 *  5. Availability and prices  11. Camp store basket
 *  6. Sites map and filters    12. Contact: topic, office hours
 *
 * Every time-dependent feature uses the campground's clock (America/Detroit), not the visitor's.
 * Add ?now=YYYY-MM-DDTHH:MM to any page to preview another date (campground time).
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Settings and data. Edit these to make the template yours.
   * ------------------------------------------------------------------ */
  var TIME_ZONE = 'America/Detroit';

  // The season is a rule, not a list of dates, so it is right for any year.
  // open: the first night of the season (3rd Friday of May). close: the last check-out day (3rd Sunday of
  // October); the last night is the Saturday before. Peak rates run from June 15 to the night before Labor Day.
  var SEASON = {
    open: { month: 5, weekday: 5, nth: 3 },
    close: { month: 10, weekday: 0, nth: 3 },
    peakFrom: { month: 6, day: 15 },
    peakUntil: { month: 9, weekday: 1, nth: 1 }, // Labor Day (first Monday of September), not included
    checkIn: '15:00',
    checkOut: '11:00'
  };

  // Nightly rates in dollars for each kind of site. weekend is added on Friday and Saturday nights.
  var RATE_CLASSES = {
    tent: { label: 'Walk-in tent site', short: 'Tent', shoulder: 32, peak: 38, weekend: 6 },
    electric: { label: 'Water & electric site', short: 'Water & electric', shoulder: 46, peak: 54, weekend: 8 },
    full: { label: 'Full-hookup RV site', short: 'Full hookup', shoulder: 58, peak: 68, weekend: 10 }
  };
  var HOOKUPS = { none: 'No hookups', electric: 'Water & 30-amp electric', full: 'Water, sewer & 50-amp' };
  var SITE_TYPES = { tent: 'Tent', rv: 'RV or trailer', cabin: 'Cabin' };

  // Every site on the map. x/y place the pin on the SVG map in sites.html (viewBox 0 0 1000 640).
  // types: what can stay there. maxRv: longest RV or trailer in feet (0 = none). pets: dogs allowed.
  var SITES = [
    { id: 'T1', rate: 'tent', types: ['tent'], hookups: 'none', maxRv: 0, pets: true, sleeps: 6, x: 80, y: 178, note: 'End of the bluff path, with a clear view of the lake through the birches.' },
    { id: 'T2', rate: 'tent', types: ['tent'], hookups: 'none', maxRv: 0, pets: true, sleeps: 6, x: 150, y: 166, note: 'Flat pad under red pines, 60 yards from parking.' },
    { id: 'T3', rate: 'tent', types: ['tent'], hookups: 'none', maxRv: 0, pets: false, sleeps: 4, x: 220, y: 180, note: 'Small, sheltered site for two tents. Quiet end of the path.' },
    { id: 'T4', rate: 'tent', types: ['tent'], hookups: 'none', maxRv: 0, pets: false, sleeps: 6, x: 290, y: 166, note: 'Steps down to the beach right beside the site.' },
    { id: 'T5', rate: 'tent', types: ['tent'], hookups: 'none', maxRv: 0, pets: true, sleeps: 6, x: 360, y: 180, note: 'Big site with two tent pads and a hammock-friendly stand of birch.' },
    { id: 'T6', rate: 'tent', types: ['tent'], hookups: 'none', maxRv: 0, pets: false, sleeps: 4, x: 430, y: 166, note: 'Closest walk-in to the beach stairs and the water spigot.' },
    { id: 'E1', rate: 'electric', types: ['tent', 'rv'], hookups: 'electric', maxRv: 30, pets: true, sleeps: 6, x: 112, y: 322, note: 'Back-in gravel pad with a big tent area behind.' },
    { id: 'E2', rate: 'electric', types: ['tent', 'rv'], hookups: 'electric', maxRv: 32, pets: true, sleeps: 6, x: 112, y: 432, note: 'Shady corner site, good for a trailer and a dining tent.' },
    { id: 'E3', rate: 'electric', types: ['tent', 'rv'], hookups: 'electric', maxRv: 35, pets: true, sleeps: 6, x: 205, y: 508, note: 'Level back-in pad, next to the trail to the bog boardwalk.' },
    { id: 'E4', rate: 'electric', types: ['tent', 'rv'], hookups: 'electric', maxRv: 35, pets: false, sleeps: 6, x: 290, y: 516, note: 'Sunny site with room for two vehicles.' },
    { id: 'E5', rate: 'electric', types: ['tent', 'rv'], hookups: 'electric', maxRv: 40, pets: true, sleeps: 6, x: 378, y: 508, note: 'Pull-through: no backing up. The easiest site on Birch Loop.' },
    { id: 'E6', rate: 'electric', types: ['tent', 'rv'], hookups: 'electric', maxRv: 30, pets: false, sleeps: 6, x: 468, y: 432, note: 'Short walk to the bathhouse, and the office is just down the road.' },
    { id: 'E7', rate: 'electric', types: ['tent', 'rv'], hookups: 'electric', maxRv: 28, pets: true, sleeps: 6, x: 468, y: 322, note: 'Tucked into the hemlocks; best for vans and pop-ups.' },
    { id: 'E8', rate: 'electric', types: ['tent', 'rv'], hookups: 'electric', maxRv: 25, pets: false, sleeps: 4, x: 290, y: 250, note: 'Next to the playground. Tents, teardrops and small trailers.' },
    { id: 'F1', rate: 'full', types: ['rv'], hookups: 'full', maxRv: 40, pets: true, sleeps: 6, x: 576, y: 330, note: 'Back-in concrete pad with a picnic table on a gravel patio.' },
    { id: 'F2', rate: 'full', types: ['rv'], hookups: 'full', maxRv: 45, pets: false, sleeps: 6, x: 576, y: 440, note: 'Pull-through for big rigs, with a 50-amp pedestal.' },
    { id: 'F3', rate: 'full', types: ['rv'], hookups: 'full', maxRv: 45, pets: true, sleeps: 6, x: 682, y: 514, note: 'Pull-through on the outside of the loop, backing onto the woods.' },
    { id: 'F4', rate: 'full', types: ['rv'], hookups: 'full', maxRv: 42, pets: true, sleeps: 6, x: 792, y: 514, note: 'Wide site with a slide-out side facing the trees.' },
    { id: 'F5', rate: 'full', types: ['rv'], hookups: 'full', maxRv: 40, pets: false, sleeps: 6, x: 896, y: 440, note: 'Along Thimbleberry Creek: you hear the water all night.' },
    { id: 'F6', rate: 'full', types: ['rv'], hookups: 'full', maxRv: 38, pets: true, sleeps: 6, x: 896, y: 330, note: 'Closest RV site to the cabins and the creek trailhead.' },
    { id: 'C1', rate: 'cabin', types: ['cabin'], hookups: 'electric', maxRv: 0, pets: false, sleeps: 4, x: 604, y: 178, name: 'Agate Cabin', rates: { shoulder: 95, peak: 115, weekend: 20 }, note: 'One room, a queen bed and a bunk, and a deck facing the lake.' },
    { id: 'C2', rate: 'cabin', types: ['cabin'], hookups: 'electric', maxRv: 0, pets: true, sleeps: 4, x: 684, y: 164, name: 'Chickadee Cabin', rates: { shoulder: 89, peak: 109, weekend: 20 }, note: 'A dog-friendly cabin with a screened porch and a fenced yard.' },
    { id: 'C3', rate: 'cabin', types: ['cabin'], hookups: 'electric', maxRv: 0, pets: false, sleeps: 6, x: 764, y: 178, name: 'Osprey Cabin', rates: { shoulder: 125, peak: 149, weekend: 25 }, note: 'Two floors on cedar posts, with a sleeping loft above the treetops.' },
    { id: 'C4', rate: 'cabin', types: ['cabin'], hookups: 'electric', maxRv: 0, pets: true, sleeps: 5, x: 844, y: 164, name: 'Balsam Cabin', rates: { shoulder: 105, peak: 125, weekend: 20 }, note: 'Log cabin with a wood stove, for cool nights in May and October.' },
    { id: 'C5', rate: 'cabin', types: ['cabin'], hookups: 'electric', maxRv: 0, pets: false, sleeps: 4, x: 918, y: 194, name: 'Trillium Cabin', rates: { shoulder: 99, peak: 119, weekend: 20 }, note: 'Fully accessible: ramp, wide doors and its own roll-in shower.' }
  ];
  var SITE_BY_ID = {};
  SITES.forEach(function (s, i) { s.index = i; SITE_BY_ID[s.id] = s; });

  var STAY_RULES = {
    maxNights: 14,          // longer stays: ring the office
    maxDaysAhead: 540,      // how far ahead the calendar takes bookings
    saturdayMinNights: 2,   // a stay that includes a Saturday night needs at least this many nights
    maxGuests: 6,           // the most any site or cabin sleeps; each site's own limit is `sleeps`
    maxPets: 2,
    cabinPetFee: 15,        // dollars per pet per stay, cabins only
    taxRate: 0.06           // Michigan use tax on campsites and cabins
  };

  // Add-ons on the booking page. per: 'each' (a quantity), 'day' (a number of days), 'stay' (once),
  // 'night' (once per night).
  var ADDONS = {
    firewood: { label: 'Firewood bundles', price: 8, per: 'each', max: 20, hint: 'Seasoned hardwood, waiting at your site.' },
    kayak: { label: 'Single kayak', price: 35, per: 'day', max: 14, hint: 'Paddle, PFD and a dry bag. Per day.' },
    tandem: { label: 'Tandem kayak', price: 55, per: 'day', max: 14, hint: 'Two seats, two paddles, two PFDs. Per day.' },
    early: { label: 'Early check-in at noon', price: 15, per: 'stay', max: 1, hint: 'Instead of 3 pm, when the site is free the night before.' },
    vehicle: { label: 'Extra vehicle', price: 5, per: 'night', max: 1, hint: 'One car is included with every site.' }
  };

  // Trails from the campground. profile: elevation in feet at even steps along the trail.
  var TRAILS = {
    bunchberry: { name: 'Bunchberry Bog Boardwalk', miles: 0.8, level: 'easy', blaze: '#1b5c86', surface: 'Boardwalk, level and wheelchair-friendly', profile: [614, 614, 613, 612, 612, 613, 613, 614, 614] },
    thimbleberry: { name: 'Thimbleberry Creek Loop', miles: 1.6, level: 'easy', blaze: '#1f4b37', surface: 'Packed dirt and two footbridges', profile: [618, 622, 630, 641, 650, 648, 639, 628, 621, 616, 618] },
    loon: { name: 'Loon Point Trail', miles: 2.7, level: 'moderate', blaze: '#b23f0a', surface: 'Roots, sand and a rocky point', profile: [622, 640, 658, 664, 650, 632, 610, 603, 606, 618, 640, 655, 636, 622] },
    tote: { name: 'Old Tote Road', miles: 5.2, level: 'moderate', blaze: '#6b5a2e', surface: 'Old logging road, grassy and rolling', profile: [618, 640, 672, 700, 694, 712, 740, 728, 702, 716, 744, 731, 700, 676, 650, 630, 618] },
    juneberry: { name: 'Juneberry Ridge Climb', miles: 3.9, level: 'hard', blaze: '#7a2d5a', surface: 'Steep granite, with two hand-over-hand pitches', profile: [618, 650, 702, 770, 842, 905, 961, 1004, 1012, 980, 920, 850, 760, 690, 640, 618] }
  };
  var TRAIL_LEVELS = { easy: 'Easy', moderate: 'Moderate', hard: 'Hard' };

  // Guided programs: a rule each, so the schedule fills itself in for any season.
  // weekday: 0 = Sunday. months: only in these months (optional). Times are campground time.
  var PROGRAM_RULES = [
    { id: 'bog', type: 'nature', weekday: 3, time: '10:00', title: 'Bog walk with a naturalist', leader: 'Josie Pelto', place: 'Bunchberry Bog Boardwalk', price: 'Free', text: 'Pitcher plants, sundews and tamaracks: the strange little world on our back doorstep.' },
    { id: 'juniors', type: 'kids', weekday: 2, time: '14:00', title: 'Junior Rangers: tracks and signs', leader: 'Josie Pelto', place: 'Meet at the fire ring', price: 'Free, ages 5 to 12', text: 'Plaster casts of tracks, a scavenger hunt and a badge to take home.' },
    { id: 'agates', type: 'nature', weekday: 4, time: '17:00', title: 'Agate hunting on the beach', leader: 'Arvid Koskela', place: 'Beach stairs', price: 'Free', text: 'How to spot the banded stones Lake Superior is famous for. Bring a spray bottle.' },
    { id: 'stories', type: 'evening', weekday: 5, time: '20:00', title: 'Campfire stories', leader: 'Marjatta Koskela', place: 'Fire ring', price: 'Free', text: 'Shipwrecks, lumber camps and the odd ghost. S\u2019mores kits at the store.' },
    { id: 'stars', type: 'evening', weekday: 6, time: '21:30', months: [5, 6, 7, 8, 9, 10], title: 'Star party on the beach', leader: 'Teemu Saari', place: 'Beach parking lot', price: 'Free', text: 'Two telescopes, red flashlights and the darkest skies on this stretch of shore.' },
    { id: 'sunrise', type: 'paddle', weekday: 0, time: '06:30', months: [6, 7, 8, 9], title: 'Sunrise paddle', leader: 'Teemu Saari', place: 'Kayak rack', price: '$20, boat and gear included', text: 'A guided hour along the shore at first light, when the lake is usually glassy.' }
  ];
  // One-off programs (campground dates). While KEEP_DEMO_CURRENT is true, a date that has passed moves
  // forward by whole weeks to the same week a year later (so a Saturday stays a Saturday). Set it to false
  // once ONE_OFF_PROGRAMS holds your real dates; past programs then drop off.
  var KEEP_DEMO_CURRENT = true;
  var ONE_OFF_PROGRAMS = [
    { id: 'jam', type: 'kids', date: '2027-07-24', time: '10:00', title: 'Thimbleberry jam morning', leader: 'Helmi Koskela', place: 'Camp store porch', price: '$12 a jar to take home', text: 'Pick along the creek trail, then cook a batch of the Upper Peninsula\u2019s favorite jam.' },
    { id: 'perseids', type: 'evening', date: '2027-08-12', time: '22:00', title: 'Perseid meteor night', leader: 'Teemu Saari', place: 'Beach', price: 'Free', text: 'Blankets on the sand, cocoa from the store and the year\u2019s best meteor shower.' },
    { id: 'color', type: 'paddle', date: '2027-10-02', time: '10:00', title: 'Fall color paddle', leader: 'Teemu Saari', place: 'Kayak rack', price: '$35, boat included', text: 'Two hours under the maples and birches at the mouth of Thimbleberry Creek.' }
  ];
  var PROGRAM_TYPES = { nature: 'Nature', kids: 'Kids', evening: 'Evening', paddle: 'Paddling' };
  var PROGRAM_WINDOW_DAYS = 21;

  // Camp store. options: a choice the guest makes (stored with the item).
  var PRODUCTS = {
    firewood: { name: 'Firewood bundle', cat: 'fire', price: 8, text: 'Seasoned maple and oak, split on site. About an evening\u2019s fire.' },
    kindling: { name: 'Birch kindling bag', cat: 'fire', price: 5, text: 'Fallen birch bark and sticks, bone dry. Lights first time.' },
    smores: { name: 'S\u2019mores kit', cat: 'fire', price: 12, text: 'Marshmallows, graham crackers and chocolate for four, plus two roasting sticks.' },
    pastybeef: { name: 'Beef & rutabaga pasty', cat: 'food', price: 9, text: 'The Yooper classic, baked in Marquette the morning you arrive. Gravy or ketchup, your call.' },
    pastyveg: { name: 'Vegetable pasty', cat: 'food', price: 8, text: 'Potato, rutabaga, carrot and onion in the same flaky crust.' },
    pancakes: { name: 'Pancake breakfast kit', cat: 'food', price: 14, text: 'Buttermilk mix, Michigan maple syrup and a pint of wild blueberries. Feeds four.' },
    coffee: { name: 'Shoreline dark roast', cat: 'food', price: 13, text: 'Twelve ounces, ground for a percolator or pour-over. Roasted for us in town.' },
    ice: { name: 'Bag of ice', cat: 'food', price: 3, text: 'Ten pounds, from the store freezer. Picked up whenever you like.' },
    jam: { name: 'Thimbleberry jam', cat: 'gifts', price: 16, text: 'Nine ounces of the U.P.\u2019s rarest jam, made by Helmi from berries picked here.' },
    bugspray: { name: 'Bug spray', cat: 'gear', price: 9, text: 'For blackflies in June and mosquitoes after rain. Picaridin, no greasy feel.' },
    propane: { name: '1 lb propane cylinder', cat: 'gear', price: 7, text: 'For camp stoves and lanterns. Empties go in the cage by the store.' },
    headlamp: { name: 'Headlamp', cat: 'gear', price: 18, text: 'Red and white light for the walk to the bathhouse and the star party.' },
    map: { name: 'Trail & paddle map', cat: 'gear', price: 4, text: 'Waterproof, with all five trails, the paddling routes and the shoreline.' },
    mug: { name: 'Enamel camp mug', cat: 'gifts', price: 15, options: ['Pine green', 'Lake blue'], text: 'Twelve ounces with the tamarack logo. Survives the fire grate.' },
    tee: { name: 'Tamarack Pines T-shirt', cat: 'gifts', price: 24, options: ['S', 'M', 'L', 'XL'], text: 'Soft cotton in pine green with the trail-map logo on the back.' }
  };
  var PRODUCT_CATS = { fire: 'Campfire', food: 'Food & ice', gear: 'Gear', gifts: 'Gifts' };
  var STORE_RULES = { maxQty: 20 };

  // Office hours: in season (every day) and out of season (by weekday, 0 = Sunday; null = closed).
  var OFFICE_HOURS = {
    season: ['08:00', '21:00'],
    winter: { 0: null, 1: ['09:00', '16:00'], 2: ['09:00', '16:00'], 3: ['09:00', '16:00'], 4: ['09:00', '16:00'], 5: ['09:00', '16:00'], 6: null }
  };
  var CONTACT_TOPICS = { booking: 1, cabins: 1, groups: 1, store: 1, access: 1, other: 1 };

  var PHONE = '(906) 555-0182';
  var WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Saved data (localStorage keys).
  var BASKET_KEY = 'canopy:basket';
  var BOOKING_KEY = 'canopy:last-booking';

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
  function setParams(u) {
    if (!window.history.replaceState) return;
    var qs = u.toString();
    window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
  }

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
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  /* ------------------------------------------------------------------
   * 3. Marquette time. Calendar dates are 'YYYY-MM-DD' strings and day
   *    numbers (days since 1970-01-01), so daylight saving never shifts them.
   * ------------------------------------------------------------------ */
  var localParts = (function () {
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
  var nowCache = null;
  // Today in Marquette. ?now=YYYY-MM-DDTHH:MM (campground time) previews another moment.
  function nowLocal() {
    if (nowCache) return nowCache;
    var p = null, q = params().get('now');
    var m = q && /^(\d{4}-\d{2}-\d{2})(?:T(\d{2}):(\d{2}))?$/.exec(q);
    if (m && isIsoDate(m[1]) && (!m[2] || (+m[2] < 24 && +m[3] < 60))) {
      p = { y: +m[1].slice(0, 4), m: +m[1].slice(5, 7), d: +m[1].slice(8, 10), hh: m[2] ? +m[2] : 12, mm: m[3] ? +m[3] : 0 };
    }
    if (!p) p = localParts(new Date());
    var iso = p.y + '-' + pad(p.m) + '-' + pad(p.d);
    nowCache = { iso: iso, year: p.y, day: dayNumber(iso), weekday: weekdayOf(dayNumber(iso)), minutes: p.hh * 60 + p.mm };
    return nowCache;
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
  function yearOf(day) { return +isoOf(day).slice(0, 4); }
  function monthOf(day) { return +isoOf(day).slice(5, 7); }
  function dateOf(day) { return +isoOf(day).slice(8, 10); }
  function toMinutes(hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }
  function clock(hhmm) {
    var m = toMinutes(hhmm), h = Math.floor(m / 60), min = m % 60;
    if (h === 12 && min === 0) return 'noon';
    var suffix = h >= 12 ? 'pm' : 'am', h12 = h % 12 || 12;
    return h12 + (min ? ':' + pad(min) : '') + ' ' + suffix;
  }
  // "Fri, May 21"  /  "Friday, May 21, 2027"
  function shortDate(day) { return WEEKDAYS[weekdayOf(day)].slice(0, 3) + ', ' + MONTHS[monthOf(day) - 1].slice(0, 3) + ' ' + dateOf(day); }
  function longDate(day, withYear) { return WEEKDAYS[weekdayOf(day)] + ', ' + MONTHS[monthOf(day) - 1] + ' ' + dateOf(day) + (withYear ? ', ' + yearOf(day) : ''); }
  function monthDay(day) { return MONTHS[monthOf(day) - 1] + ' ' + dateOf(day); }

  /* ------------------------------------------------------------------
   * 4. Season rule and the open / closed status
   * ------------------------------------------------------------------ */
  function nthWeekday(year, month, weekday, nth) {
    var first = dayNumber(year + '-' + pad(month) + '-01');
    return first + ((weekday - weekdayOf(first) + 7) % 7) + (nth - 1) * 7;
  }
  // Season for a year: open = first night, close = last check-out day (no night),
  // peak nights are peakStart <= night < peakEnd.
  var seasonCache = {};
  function seasonOf(year) {
    if (seasonCache[year]) return seasonCache[year];
    var s = {
      year: year,
      open: nthWeekday(year, SEASON.open.month, SEASON.open.weekday, SEASON.open.nth),
      close: nthWeekday(year, SEASON.close.month, SEASON.close.weekday, SEASON.close.nth),
      peakStart: dayNumber(year + '-' + pad(SEASON.peakFrom.month) + '-' + pad(SEASON.peakFrom.day)),
      peakEnd: nthWeekday(year, SEASON.peakUntil.month, SEASON.peakUntil.weekday, SEASON.peakUntil.nth)
    };
    seasonCache[year] = s;
    return s;
  }
  function inSeason(day) { var s = seasonOf(yearOf(day)); return day >= s.open && day < s.close; }
  function isPeak(day) { var s = seasonOf(yearOf(day)); return day >= s.peakStart && day < s.peakEnd; }
  // state: 'open' (in season), 'pre' (before this year's opening) or 'closed' (after closing).
  // season: the season that is running, or the next one.
  function seasonState(now) {
    var s = seasonOf(now.year);
    if (now.day < s.open) return { state: 'pre', season: s };
    if (now.day < s.close) return { state: 'open', season: s };
    return { state: 'closed', season: seasonOf(now.year + 1) };
  }
  function getStatus(now) {
    var st = seasonState(now), s = st.season;
    if (st.state === 'open') {
      var free = SITES.filter(function (site) { return !isBooked(site.id, now.day); }).length;
      var lastNight = s.close - now.day === 1;
      return {
        state: 'open', year: s.year,
        title: 'Open for the ' + s.year + ' season',
        short: 'Open today · check-in from ' + clock(SEASON.checkIn),
        detail: (lastNight ? 'Tonight is the last night of the season.' : plural(free, 'site') + ' of ' + SITES.length + ' free tonight. Check-in from ' + clock(SEASON.checkIn) + '; the season runs to ' + shortDate(s.close) + '.'),
        countdown: lastNight ? 'Last night of the season' : plural(s.close - now.day, 'night') + ' left this season'
      };
    }
    var days = s.open - now.day;
    return {
      state: st.state === 'pre' ? 'pre' : 'closed', year: s.year,
      title: 'Now booking the ' + s.year + ' season',
      short: (st.state === 'pre' ? 'Opening ' : 'Closed for the winter · we open ') + shortDate(s.open) + ', ' + s.year,
      detail: 'We open ' + longDate(s.open, true) + '. Every site and cabin is open to book for the whole season.',
      countdown: days === 1 ? 'Opening tomorrow' : plural(days, 'day') + ' to opening day'
    };
  }
  function initStatus() {
    var now = nowLocal(), s = getStatus(now), st = seasonState(now);
    $$('[data-status]').forEach(function (el) { el.setAttribute('data-state', s.state); });
    $$('[data-status-title]').forEach(function (el) { el.textContent = s.title; });
    $$('[data-status-short]').forEach(function (el) { el.textContent = s.short; });
    $$('[data-status-detail]').forEach(function (el) { el.textContent = s.detail; });
    $$('[data-status-countdown]').forEach(function (el) { el.textContent = s.countdown; });
    // Season years and dates, filled in the browser so they never go stale.
    $$('[data-season-year]').forEach(function (el) { el.textContent = String(st.season.year); });
    $$('[data-season-open]').forEach(function (el) { el.textContent = longDate(st.season.open, el.hasAttribute('data-with-year')); });
    $$('[data-season-close]').forEach(function (el) { el.textContent = longDate(st.season.close, el.hasAttribute('data-with-year')); });
    $$('[data-season-lastnight]').forEach(function (el) { el.textContent = longDate(st.season.close - 1, false); });
    $$('[data-season-range]').forEach(function (el) { el.textContent = monthDay(st.season.open) + ' – ' + monthDay(st.season.close); });
    $$('[data-peak-range]').forEach(function (el) { el.textContent = monthDay(st.season.peakStart) + ' – ' + monthDay(st.season.peakEnd - 1); });
    $$('[data-show-when]').forEach(function (el) {
      var want = el.getAttribute('data-show-when');
      el.hidden = want === 'open' ? s.state !== 'open' : s.state === 'open';
    });
  }

  /* ------------------------------------------------------------------
   * 5. Availability and prices
   * ------------------------------------------------------------------ */
  function mix(a, b) {
    var h = Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35);
    h ^= h >>> 15; h = Math.imul(h, 0x27d4eb2f); h ^= h >>> 13;
    return (h >>> 0) % 100;
  }
  // Demo availability: a fixed pattern of three-night bookings, busier on peak weekends.
  // Replace with a call to your reservation system.
  function isBooked(siteId, day) {
    if (!has(SITE_BY_ID, siteId) || !inSeason(day)) return false;
    var i = SITE_BY_ID[siteId].index, block = Math.floor((day + i * 2) / 3);
    var wd = weekdayOf(day), busy = isPeak(day) ? (wd === 5 || wd === 6 ? 42 : 26) : (wd === 5 || wd === 6 ? 24 : 10);
    return mix(i + 1, block) < busy;
  }
  function ratesFor(site) { return site.rate === 'cabin' ? site.rates : RATE_CLASSES[site.rate]; }
  function nightRate(siteId, day) {
    var site = SITE_BY_ID[siteId], r = ratesFor(site), wd = weekdayOf(day);
    var peak = isPeak(day), weekend = wd === 5 || wd === 6;
    return { amount: (peak ? r.peak : r.shoulder) + (weekend ? r.weekend : 0), peak: peak, weekend: weekend };
  }
  function siteLabel(site) {
    if (site.rate === 'cabin') return site.name + ' (' + site.id + ')';
    return 'Site ' + site.id + ' · ' + RATE_CLASSES[site.rate].short;
  }
  function siteKind(site) { return site.rate === 'cabin' ? 'Cabin' : RATE_CLASSES[site.rate].label; }

  // Check a stay. Returns an error message (or '') for the dates.
  function stayError(siteId, inDay, outDay, today) {
    if (!has(SITE_BY_ID, siteId)) return 'Choose a site or cabin.';
    if (inDay == null || outDay == null) return 'Choose your arrival and departure dates.';
    if (inDay < today) return 'That arrival date has passed.';
    if (inDay > today + STAY_RULES.maxDaysAhead) return 'We take bookings up to ' + Math.round(STAY_RULES.maxDaysAhead / 30) + ' months ahead.';
    if (outDay <= inDay) return 'Departure must be after arrival.';
    if (outDay - inDay > STAY_RULES.maxNights) return 'For stays over ' + STAY_RULES.maxNights + ' nights, please call us at ' + PHONE + '.';
    var hasSaturday = false;
    for (var d = inDay; d < outDay; d++) {
      if (!inSeason(d)) return 'We\u2019re closed on ' + shortDate(d) + '. The season runs ' + monthDay(seasonOf(yearOf(d)).open) + ' to ' + monthDay(seasonOf(yearOf(d)).close) + '.';
      if (isBooked(siteId, d)) return SITE_BY_ID[siteId].id + ' is booked on the night of ' + shortDate(d) + '.';
      if (weekdayOf(d) === 6) hasSaturday = true;
    }
    if (hasSaturday && outDay - inDay < STAY_RULES.saturdayMinNights) return 'Stays that include a Saturday night are ' + STAY_RULES.saturdayMinNights + ' nights minimum.';
    return '';
  }
  // Price a stay: grouped night lines, add-ons, tax and total.
  function quote(siteId, inDay, outDay, addons, pets) {
    var site = SITE_BY_ID[siteId], groups = {}, order = [], nightsTotal = 0, nights = outDay - inDay;
    for (var d = inDay; d < outDay; d++) {
      var r = nightRate(siteId, d);
      var key = (r.peak ? 'Peak' : 'Shoulder') + (r.weekend ? ' weekend' : '') + '|' + r.amount;
      if (!has(groups, key)) { groups[key] = { n: 0, rate: r.amount, label: (r.peak ? 'peak' : 'shoulder') + (r.weekend ? ' weekend' : '') }; order.push(key); }
      groups[key].n += 1;
      nightsTotal += r.amount;
    }
    var lines = order.map(function (k) {
      var g = groups[k];
      return { label: plural(g.n, g.label + ' night') + ' × ' + money(g.rate), amount: g.n * g.rate };
    });
    var extras = [];
    Object.keys(ADDONS).forEach(function (id) {
      var a = ADDONS[id], q = addons && has(addons, id) ? addons[id] : 0;
      if (!q) return;
      var amount = a.per === 'night' ? a.price * nights : a.price * q;
      var label = a.per === 'each' ? plural(q, 'firewood bundle') + ' × ' + money(a.price)
        : a.per === 'day' ? a.label + ', ' + plural(q, 'day') + ' × ' + money(a.price)
        : a.per === 'night' ? a.label + ', ' + plural(nights, 'night') + ' × ' + money(a.price)
        : a.label;
      extras.push({ label: label, amount: amount });
    });
    if (site.rate === 'cabin' && pets > 0) extras.push({ label: 'Pet fee, ' + plural(pets, 'pet') + ' × ' + money(STAY_RULES.cabinPetFee), amount: pets * STAY_RULES.cabinPetFee });
    var subtotal = nightsTotal + extras.reduce(function (t, e) { return t + e.amount; }, 0);
    var tax = Math.round(subtotal * STAY_RULES.taxRate * 100) / 100;
    return { nights: nights, lines: lines, extras: extras, subtotal: subtotal, tax: tax, total: subtotal + tax };
  }
  // The next free stay of `nights` nights for a site, from a given day, arriving on `weekday` if given.
  function nextFreeStay(siteId, fromDay, nights, weekday) {
    for (var d = fromDay; d < fromDay + 400; d++) {
      if (weekday != null && weekdayOf(d) !== weekday) continue;
      if (!stayError(siteId, d, d + nights, fromDay)) return d;
    }
    return null;
  }
  function firstBookableDay(now) {
    var st = seasonState(now);
    if (st.state === 'open' && now.minutes < 22 * 60) return now.day;
    if (st.state === 'open') return now.day + 1 < st.season.close ? now.day + 1 : seasonOf(now.year + 1).open;
    return st.season.open;
  }

  /* ------------------------------------------------------------------
   * 6. Sites: the campground map, filters and the cabin rates
   * ------------------------------------------------------------------ */
  function siteMatches(site, f) {
    if (f.type !== 'any' && site.types.indexOf(f.type) === -1) return false;
    if (f.hookups !== 'any' && site.hookups !== f.hookups) return false;
    if (f.rv > 0 && site.maxRv < f.rv) return false;
    if (f.pets && !site.pets) return false;
    return true;
  }
  function pinShape(site) {
    // Tent sites are triangles, RV sites rounded squares, cabins little houses.
    if (site.rate === 'tent') return '<path d="M0 -19 L18 13 L-18 13 Z" fill="#1f4b37" stroke="#f6f4ec" stroke-width="2.5" stroke-linejoin="round"/>';
    if (site.rate === 'cabin') return '<path d="M-17 -3 L0 -19 L17 -3 L17 15 L-17 15 Z" fill="#f26a21" stroke="#1c2420" stroke-width="2.5" stroke-linejoin="round"/>';
    return '<rect x="-16" y="-15" width="32" height="30" rx="7" fill="' + (site.rate === 'full' ? '#0e3a57' : '#1b5c86') + '" stroke="#f6f4ec" stroke-width="2.5"/>';
  }
  function pinLabel(site) {
    var bits = [site.rate === 'cabin' ? site.id + ' ' + site.name : siteLabel(site), site.rate === 'cabin' ? 'sleeps ' + site.sleeps : HOOKUPS[site.hookups]];
    if (site.maxRv) bits.push('RVs up to ' + site.maxRv + ' feet');
    bits.push(site.pets ? 'pets welcome' : 'no pets');
    return bits.join(', ');
  }
  function initSitesMap() {
    var layer = $('[data-site-layer]');
    if (!layer) return;
    var list = $('[data-site-list]'), detail = $('[data-site-detail]'), count = $('[data-site-count]'), empty = $('[data-site-empty]');
    var q = params();
    var f = { type: 'any', hookups: 'any', rv: 0, pets: false };
    if (has(SITE_TYPES, q.get('type'))) f.type = q.get('type');
    if (has(HOOKUPS, q.get('hookups'))) f.hookups = q.get('hookups');
    if (/^(20|25|30|35|40|45)$/.test(q.get('rv') || '')) f.rv = +q.get('rv');
    if (q.get('pets') === '1') f.pets = true;
    var selected = has(SITE_BY_ID, q.get('site')) ? q.get('site') : null;

    // Pins
    layer.innerHTML = SITES.map(function (s) {
      var dark = s.rate === 'cabin';
      return '<g class="site-pin" role="button" tabindex="0" aria-pressed="false" data-site-pin="' + s.id + '" transform="translate(' + s.x + ' ' + s.y + ')" aria-label="' + escapeHtml(pinLabel(s)) + '">' +
        '<circle class="pin-ring" r="25"/>' + pinShape(s) +
        '<text y="' + (s.rate === 'tent' ? 8 : s.rate === 'cabin' ? 9 : 5) + '" text-anchor="middle" font-family="Overpass, sans-serif" font-size="12.5" font-weight="800" fill="' + (dark ? '#1c2420' : '#ffffff') + '">' + s.id + '</text></g>';
    }).join('');
    var pins = $$('[data-site-pin]', layer);

    function card(s) {
      var r = ratesFor(s);
      return '<li class="card flex flex-col p-4" data-site-card="' + s.id + '">' +
        '<div class="flex items-start justify-between gap-3"><h3 class="font-display text-lg font-bold">' + escapeHtml(s.rate === 'cabin' ? s.name : 'Site ' + s.id) + '</h3>' +
        '<p class="shrink-0 text-right text-sm text-lichen">from <span class="font-display text-lg font-bold text-bark">' + money(r.shoulder) + '</span><span class="sr-only"> a night</span></p></div>' +
        '<p class="text-sm font-bold text-pine">' + escapeHtml(siteKind(s)) + (s.rate === 'cabin' ? ' · ' + s.id : '') + '</p>' +
        '<p class="mt-2 text-[0.95rem] text-lichen">' + escapeHtml(s.note) + '</p>' +
        '<ul class="mt-3 flex flex-wrap gap-1.5 text-lake-deep" aria-label="Site details">' +
        '<li class="tag">' + escapeHtml(s.rate === 'cabin' ? 'Electricity & heat' : HOOKUPS[s.hookups]) + '</li>' +
        (s.maxRv ? '<li class="tag">RV to ' + s.maxRv + ' ft</li>' : '') +
        '<li class="tag">Sleeps ' + s.sleeps + '</li>' +
        (s.pets ? '<li class="tag text-blaze-dark">Pets OK</li>' : '') + '</ul>' +
        '<div class="mt-auto flex flex-wrap gap-2 pt-4"><button type="button" class="btn-birch btn-sm" data-show-site="' + s.id + '">On the map</button>' +
        '<a class="btn-pine btn-sm" href="book.html?site=' + s.id + '">Book ' + s.id + '</a></div></li>';
    }
    function showDetail(id) {
      if (!detail) return;
      if (!has(SITE_BY_ID, id)) {
        detail.innerHTML = '<p class="font-display text-xl font-bold">Pick a site on the map</p><p class="mt-2 text-lichen">Click or tab to a pin to see its hookups, size and price. Use the filters to narrow it down.</p>';
        return;
      }
      var s = SITE_BY_ID[id], r = ratesFor(s), now = nowLocal();
      var from = firstBookableDay(now), next = nextFreeStay(id, from, 2, null);
      detail.innerHTML = '<p class="eyebrow">' + escapeHtml(siteKind(s)) + '</p>' +
        '<h3 class="mt-2 font-display text-2xl font-bold">' + escapeHtml(s.rate === 'cabin' ? s.name : 'Site ' + s.id) + '</h3>' +
        '<p class="mt-2 text-lichen">' + escapeHtml(s.note) + '</p>' +
        '<dl class="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[0.95rem]">' +
        '<div><dt class="text-sm text-lichen">Hookups</dt><dd class="font-bold">' + escapeHtml(s.rate === 'cabin' ? 'Electricity & heat' : HOOKUPS[s.hookups]) + '</dd></div>' +
        '<div><dt class="text-sm text-lichen">Max RV</dt><dd class="font-bold">' + (s.maxRv ? s.maxRv + ' ft' : 'No RVs') + '</dd></div>' +
        '<div><dt class="text-sm text-lichen">Sleeps</dt><dd class="font-bold">' + s.sleeps + '</dd></div>' +
        '<div><dt class="text-sm text-lichen">Pets</dt><dd class="font-bold">' + (s.pets ? 'Welcome' : 'Not here') + '</dd></div>' +
        '<div><dt class="text-sm text-lichen">Shoulder night</dt><dd class="font-bold">' + money(r.shoulder) + '</dd></div>' +
        '<div><dt class="text-sm text-lichen">Peak night</dt><dd class="font-bold">' + money(r.peak) + '</dd></div></dl>' +
        '<p class="mt-3 text-sm text-lichen">Friday and Saturday nights add ' + money(r.weekend) + '.</p>' +
        (next != null ? '<p class="mt-4 rounded-lg bg-lake-light px-3 py-2 text-[0.95rem] text-lake-deep">Next free two nights: <strong>' + shortDate(next) + ' – ' + shortDate(next + 2) + (yearOf(next) !== now.year ? ', ' + yearOf(next) : '') + '</strong></p>' : '') +
        '<a class="btn-blaze mt-5 w-full" href="book.html?site=' + s.id + (next != null ? '&amp;arrive=' + isoOf(next) + '&amp;depart=' + isoOf(next + 2) : '') + '">Book ' + escapeHtml(s.rate === 'cabin' ? s.name : 'site ' + s.id) + '</a>';
    }
    // On narrow screens the map scrolls sideways: show a hint and an edge fade while there is more to the
    // right, and bring the chosen pin into view.
    var mapBox = $('[data-site-map]'), mapHint = $('[data-map-hint]'), mapFade = $('[data-map-fade]');
    function mapEdges() {
      if (!mapBox) return;
      var more = mapBox.scrollWidth - mapBox.clientWidth;
      if (mapHint) mapHint.hidden = more <= 1;
      if (mapFade) mapFade.hidden = more <= 1 || mapBox.scrollLeft >= more - 4;
    }
    function scrollMapTo(id, smooth) {
      if (!mapBox || !has(SITE_BY_ID, id)) return;
      var svg = mapBox.querySelector('svg'), more = mapBox.scrollWidth - mapBox.clientWidth;
      if (!svg || more <= 1) return;
      var x = SITE_BY_ID[id].x / 1000 * svg.getBoundingClientRect().width - mapBox.clientWidth / 2;
      var left = Math.max(0, Math.min(more, x));
      if (mapBox.scrollTo) mapBox.scrollTo({ left: left, behavior: smooth && !reduceMotion ? 'smooth' : 'auto' });
      else mapBox.scrollLeft = left;
    }
    if (mapBox) {
      mapBox.addEventListener('scroll', mapEdges, { passive: true });
      window.addEventListener('resize', mapEdges);
    }
    function select(id, focusPin) {
      selected = has(SITE_BY_ID, id) ? id : null;
      pins.forEach(function (p) {
        var on = p.getAttribute('data-site-pin') === selected;
        p.setAttribute('aria-pressed', String(on));
        if (on && focusPin) { try { p.focus({ preventScroll: true }); } catch (e) { p.focus(); } }
      });
      if (selected) scrollMapTo(selected, focusPin);
      showDetail(selected);
      sync();
    }
    function sync() {
      $$('[data-filter-type]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter-type') === f.type)); });
      $$('[data-filter-hookups]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter-hookups') === f.hookups)); });
      $$('[data-filter-pets]').forEach(function (b) { b.setAttribute('aria-pressed', String(f.pets)); });
      var rvSel = $('#rv-length');
      if (rvSel) rvSel.value = String(f.rv);
      var shown = SITES.filter(function (s) { return siteMatches(s, f); });
      pins.forEach(function (p) {
        var ok = siteMatches(SITE_BY_ID[p.getAttribute('data-site-pin')], f);
        p.toggleAttribute('data-dim', !ok);
        p.setAttribute('tabindex', ok ? '0' : '-1');
        if (ok) p.removeAttribute('aria-hidden'); else p.setAttribute('aria-hidden', 'true');
      });
      if (list) list.innerHTML = shown.map(card).join('');
      if (count) count.textContent = 'Showing ' + plural(shown.length, 'site') + ' of ' + SITES.length + '.';
      if (empty) empty.hidden = shown.length > 0;
      var u = new URLSearchParams();
      if (f.type !== 'any') u.set('type', f.type);
      if (f.hookups !== 'any') u.set('hookups', f.hookups);
      if (f.rv) u.set('rv', String(f.rv));
      if (f.pets) u.set('pets', '1');
      if (selected) u.set('site', selected);
      setParams(u);
    }
    $$('[data-filter-type]').forEach(function (b) { b.addEventListener('click', function () { var v = b.getAttribute('data-filter-type'); f.type = v === 'any' || has(SITE_TYPES, v) ? v : 'any'; sync(); }); });
    $$('[data-filter-hookups]').forEach(function (b) { b.addEventListener('click', function () { var v = b.getAttribute('data-filter-hookups'); f.hookups = v === 'any' || has(HOOKUPS, v) ? v : 'any'; sync(); }); });
    $$('[data-filter-pets]').forEach(function (b) { b.addEventListener('click', function () { f.pets = !f.pets; sync(); }); });
    var rvSel = $('#rv-length');
    if (rvSel) rvSel.addEventListener('change', function () { f.rv = /^(20|25|30|35|40|45)$/.test(rvSel.value) ? +rvSel.value : 0; sync(); });
    $$('[data-site-reset]').forEach(function (b) { b.addEventListener('click', function () { f = { type: 'any', hookups: 'any', rv: 0, pets: false }; sync(); }); });

    layer.addEventListener('click', function (e) {
      var p = e.target.closest('[data-site-pin]');
      if (p && !p.hasAttribute('data-dim')) select(p.getAttribute('data-site-pin'), false);
    });
    // Keyboard: Enter/Space selects; arrow keys jump to the nearest visible pin in that direction.
    layer.addEventListener('keydown', function (e) {
      var p = e.target.closest('[data-site-pin]');
      if (!p) return;
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(p.getAttribute('data-site-pin'), false); return; }
      var dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key];
      if (!dir) return;
      e.preventDefault();
      var from = SITE_BY_ID[p.getAttribute('data-site-pin')], best = null, bestScore = Infinity;
      pins.forEach(function (o) {
        if (o === p || o.hasAttribute('data-dim')) return;
        var s = SITE_BY_ID[o.getAttribute('data-site-pin')], dx = s.x - from.x, dy = s.y - from.y;
        var along = dx * dir[0] + dy * dir[1], across = Math.abs(dx * dir[1]) + Math.abs(dy * dir[0]);
        if (along <= 0) return;
        var score = along + across * 2;
        if (score < bestScore) { bestScore = score; best = o; }
      });
      if (best) best.focus();
    });
    if (list) list.addEventListener('click', function (e) {
      var b = e.target.closest('[data-show-site]');
      if (!b) return;
      var id = b.getAttribute('data-show-site');
      if (!has(SITE_BY_ID, id)) return;
      select(id, true);
      var map = $('[data-site-map]');
      if (map) map.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
    });
    select(selected, false);
    mapEdges();
  }
  // "from $95" on cabin cards and anywhere else: data-rate-from="C1" or data-rate-class="tent".
  function initRateFills() {
    $$('[data-rate-from]').forEach(function (el) {
      var id = el.getAttribute('data-rate-from');
      if (has(SITE_BY_ID, id)) el.textContent = money(ratesFor(SITE_BY_ID[id]).shoulder);
    });
    $$('[data-rate-class]').forEach(function (el) {
      var k = el.getAttribute('data-rate-class');
      if (has(RATE_CLASSES, k)) el.textContent = money(RATE_CLASSES[k].shoulder);
    });
    $$('[data-addon-price]').forEach(function (el) {
      var k = el.getAttribute('data-addon-price');
      if (has(ADDONS, k)) el.textContent = money(ADDONS[k].price);
    });
  }

  /* ------------------------------------------------------------------
   * 7. Booking: date range calendar, party, add-ons and totals
   * ------------------------------------------------------------------ */
  function cleanBooking(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    if (typeof raw.ref !== 'string' || !/^TP-[A-Z0-9]{4}$/.test(raw.ref)) return null;
    if (!has(SITE_BY_ID, raw.site) || !isIsoDate(raw.arrive) || !isIsoDate(raw.depart)) return null;
    if (dayNumber(raw.depart) <= dayNumber(raw.arrive)) return null;
    return { ref: raw.ref, site: raw.site, arrive: raw.arrive, depart: raw.depart, name: typeof raw.name === 'string' ? raw.name.slice(0, 80) : '' };
  }
  function initBooking() {
    var root = $('[data-booking]');
    if (!root) return;
    var now = nowLocal(), today = now.day;
    var siteSel = $('#book-site'), cal = $('[data-calendar]'), summary = $('[data-quote]');
    var err = $('#book-dates-error'), rangeText = $('[data-range-text]');
    var state = { site: null, arrive: null, depart: null, focus: null, view: null, addons: {} };

    // Site options, grouped by kind, built from SITES.
    var groups = [['tent', 'Walk-in tent sites'], ['electric', 'Water & electric sites'], ['full', 'Full-hookup RV sites'], ['cabin', 'Cabins']];
    siteSel.innerHTML = '<option value="">Choose a site or cabin</option>' + groups.map(function (g) {
      return '<optgroup label="' + g[1] + '">' + SITES.filter(function (s) { return s.rate === g[0]; }).map(function (s) {
        return '<option value="' + s.id + '">' + escapeHtml(s.rate === 'cabin' ? s.name + ' (sleeps ' + s.sleeps + ')' : 'Site ' + s.id + (s.maxRv ? ', RV to ' + s.maxRv + ' ft' : '') + (s.pets ? ', pets OK' : '')) + '</option>';
      }).join('') + '</optgroup>';
    }).join('');

    var q = params();
    if (has(SITE_BY_ID, q.get('site'))) state.site = q.get('site');
    var qa = q.get('arrive'), qd = q.get('depart');
    if (state.site && isIsoDate(qa) && isIsoDate(qd) && !stayError(state.site, dayNumber(qa), dayNumber(qd), today)) {
      state.arrive = dayNumber(qa); state.depart = dayNumber(qd);
    }
    siteSel.value = state.site || '';
    var first = state.arrive != null ? state.arrive : firstBookableDay(now);
    state.view = { y: yearOf(first), m: monthOf(first) };
    state.focus = first;

    function monthStart(y, m) { return dayNumber(y + '-' + pad(m) + '-01'); }
    function addMonths(v, n) { var t = v.y * 12 + (v.m - 1) + n; return { y: Math.floor(t / 12), m: (t % 12) + 1 }; }
    function monthsShown() { return [state.view, addMonths(state.view, 1)]; }
    function bookableNight(d) { return d >= today && d <= today + STAY_RULES.maxDaysAhead && inSeason(d); }
    // What a day means right now: free (can arrive), booked, closed, or checkout (can only leave).
    function rangeFree(from, to) {
      for (var n = from; n < to; n++) if (!bookableNight(n) || (state.site && isBooked(state.site, n))) return false;
      return true;
    }
    function dayKind(d) {
      var choosingDepart = state.arrive != null && state.depart == null;
      if (choosingDepart && d > state.arrive && d - state.arrive <= STAY_RULES.maxNights && rangeFree(state.arrive, d)) {
        return bookableNight(d) && !(state.site && isBooked(state.site, d)) ? 'free' : 'checkout';
      }
      if (!bookableNight(d)) return 'closed';
      if (state.site && isBooked(state.site, d)) return 'booked';
      return 'free';
    }
    function dayLabel(d, kind) {
      var bits = [longDate(d, true)];
      if (kind === 'closed') bits.push(inSeason(d) ? 'not bookable' : 'campground closed');
      else if (kind === 'booked') bits.push('booked');
      else if (state.site) {
        var r = nightRate(state.site, d);
        if (kind === 'checkout') bits.push('check-out only');
        else bits.push(money(r.amount) + ' night, ' + (r.peak ? 'peak' : 'shoulder') + (r.weekend ? ' weekend' : ''));
      }
      if (d === state.arrive) bits.push('arrival');
      if (d === state.depart) bits.push('departure');
      return bits.join(', ');
    }
    function renderMonth(v) {
      var start = monthStart(v.y, v.m), next = addMonths(v, 1), end = monthStart(next.y, next.m);
      var lead = weekdayOf(start), html = '';
      html += '<div class="min-w-0"><h3 class="mb-3 text-center font-display text-lg font-bold" id="cal-' + v.y + '-' + v.m + '">' + MONTHS[v.m - 1] + ' ' + v.y + '</h3>' +
        '<table class="w-full table-fixed border-separate border-spacing-1" aria-labelledby="cal-' + v.y + '-' + v.m + '"><thead><tr>' +
        WEEKDAYS.map(function (w) { return '<th scope="col" abbr="' + w + '" class="pb-1 text-xs font-extrabold uppercase tracking-wider text-lichen">' + w.slice(0, 2) + '</th>'; }).join('') + '</tr></thead><tbody><tr>';
      for (var i = 0; i < lead; i++) html += '<td></td>';
      for (var d = start; d < end; d++) {
        if (weekdayOf(d) === 0 && d !== start) html += '</tr><tr>';
        var kind = dayKind(d), price = '';
        if (state.site && (kind === 'free')) price = money(nightRate(state.site, d).amount);
        else if (kind === 'booked') price = 'Full';
        else if (kind === 'checkout') price = 'Out';
        var inRange = state.arrive != null && state.depart != null && d > state.arrive && d < state.depart;
        var isEnd = d === state.arrive || d === state.depart;
        html += '<td><button type="button" class="cal-day" data-day="' + d + '" data-kind="' + kind + '"' +
          (isPeak(d) && inSeason(d) ? ' data-peak' : '') + (inRange ? ' data-in-range' : '') + (isEnd ? ' data-end' : '') + (d === today ? ' data-today' : '') +
          ' tabindex="' + (d === state.focus ? '0' : '-1') + '"' + (kind === 'closed' || kind === 'booked' ? ' aria-disabled="true"' : '') +
          ' aria-pressed="' + String(isEnd || inRange) + '" aria-label="' + escapeHtml(dayLabel(d, kind)) + '"><span aria-hidden="true">' + dateOf(d) + '</span>' +
          (price ? '<span class="cal-price" aria-hidden="true">' + price + '</span>' : '') + '</button></td>';
      }
      var trail = (7 - ((lead + (end - start)) % 7)) % 7;
      for (var j = 0; j < trail; j++) html += '<td></td>';
      html += '</tr></tbody></table></div>';
      return html;
    }
    function renderCalendar(focusIt) {
      var months = monthsShown();
      var firstDay = monthStart(months[0].y, months[0].m), last = addMonths(months[1], 1), lastDay = monthStart(last.y, last.m) - 1;
      if (state.focus < firstDay || state.focus > lastDay) state.focus = firstDay;
      $('[data-cal-months]', cal).innerHTML = months.map(renderMonth).join('');
      var prev = $('[data-cal-prev]', cal), nowMonth = { y: yearOf(today), m: monthOf(today) };
      prev.disabled = months[0].y * 12 + months[0].m <= nowMonth.y * 12 + nowMonth.m;
      var lastAllowed = today + STAY_RULES.maxDaysAhead;
      $('[data-cal-next]', cal).disabled = lastDay >= lastAllowed;
      if (focusIt) { var b = $('[data-day="' + state.focus + '"]', cal); if (b) b.focus(); }
    }
    function moveFocus(day) {
      var months = monthsShown();
      var firstDay = monthStart(months[0].y, months[0].m), last = addMonths(months[1], 1), lastDay = monthStart(last.y, last.m) - 1;
      if (day < today - 40 || day > today + STAY_RULES.maxDaysAhead + 40) return;
      state.focus = day;
      if (day < firstDay) state.view = addMonths(state.view, -1);
      else if (day > lastDay) state.view = addMonths(state.view, 1);
      renderCalendar(true);
    }
    function pickDay(d) {
      var kind = dayKind(d);
      if (kind === 'closed' || kind === 'booked') {
        announce(kind === 'booked' ? 'That night is booked. Choose another date.' : 'That date can\u2019t be booked.');
        return;
      }
      var choosingDepart = state.arrive != null && state.depart == null;
      if (choosingDepart && d > state.arrive && d - state.arrive <= STAY_RULES.maxNights && (kind === 'checkout' || rangeFree(state.arrive, d))) {
        state.depart = d;
        announce('Departure ' + longDate(d) + '. ' + plural(d - state.arrive, 'night') + ' selected.');
      } else if (kind === 'free') {
        state.arrive = d; state.depart = null;
        announce('Arrival ' + longDate(d) + '. Now choose your departure date.');
      } else {
        announce('Choose a free night to arrive.');
        return;
      }
      state.focus = d;
      update(true);
    }
    cal.addEventListener('click', function (e) {
      var b = e.target.closest('[data-day]');
      if (b) { pickDay(+b.getAttribute('data-day')); return; }
      if (e.target.closest('[data-cal-prev]')) { state.view = addMonths(state.view, -1); renderCalendar(false); }
      if (e.target.closest('[data-cal-next]')) { state.view = addMonths(state.view, 1); renderCalendar(false); }
    });
    cal.addEventListener('keydown', function (e) {
      var b = e.target.closest('[data-day]');
      if (!b) return;
      var d = +b.getAttribute('data-day'), to = null;
      if (e.key === 'ArrowRight') to = d + 1;
      else if (e.key === 'ArrowLeft') to = d - 1;
      else if (e.key === 'ArrowDown') to = d + 7;
      else if (e.key === 'ArrowUp') to = d - 7;
      else if (e.key === 'Home') to = d - weekdayOf(d);
      else if (e.key === 'End') to = d + (6 - weekdayOf(d));
      else if (e.key === 'PageDown' || e.key === 'PageUp') {
        var v = addMonths({ y: yearOf(d), m: monthOf(d) }, e.key === 'PageDown' ? 1 : -1);
        var dim = monthStart(addMonths(v, 1).y, addMonths(v, 1).m) - monthStart(v.y, v.m);
        to = monthStart(v.y, v.m) + Math.min(dateOf(d), dim) - 1;
        state.view = e.key === 'PageDown' ? addMonths(state.view, 1) : addMonths(state.view, -1);
      }
      if (to !== null) { e.preventDefault(); moveFocus(to); }
    });

    // Party and add-ons
    var form = $('#book-party'), pf = form.elements;
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    function party() {
      return { guests: +pf.guests.value, pets: +pf.pets.value, rig: pf.rig.value, length: pf.rvlength.value.trim() };
    }
    // Guests: offer 1 to the chosen site's limit (STAY_RULES.maxGuests without a site). A count chosen
    // before switching to a smaller site stays selected, so the error below explains it.
    function syncGuestOptions() {
      var site = state.site ? SITE_BY_ID[state.site] : null;
      var cap = Math.min(STAY_RULES.maxGuests, site ? site.sleeps : STAY_RULES.maxGuests);
      var cur = Math.max(1, Math.min(STAY_RULES.maxGuests, Math.floor(+pf.guests.value) || 2));
      var top = Math.max(cap, cur), html = '';
      for (var n = 1; n <= top; n++) html += '<option value="' + n + '"' + (n > cap ? ' disabled' : '') + '>' + n + (n > cap ? ' (too many for this site)' : '') + '</option>';
      if (pf.guests.innerHTML !== html) { pf.guests.innerHTML = html; }
      pf.guests.value = String(cur);
    }
    function partyErrors() {
      var p = party(), errors = {}, site = state.site ? SITE_BY_ID[state.site] : null;
      if (site && p.guests > site.sleeps) errors.guests = (site.rate === 'cabin' ? site.name : 'Site ' + site.id) + ' sleeps ' + plural(site.sleeps, 'guest') + '.';
      if (site && p.pets > 0 && !site.pets) errors.pets = (site.rate === 'cabin' ? site.name : 'Site ' + site.id) + ' is pet-free. Filter for pet-friendly sites on the map.';
      if (site && site.rate !== 'cabin') {
        if (p.rig === 'rv' && site.types.indexOf('rv') === -1) errors.rig = 'Site ' + site.id + ' is a walk-in tent site. Choose a water & electric or full-hookup site for an RV.';
        else if (p.rig === 'tent' && site.types.indexOf('tent') === -1) errors.rig = 'Site ' + site.id + ' is for RVs and trailers only.';
        if (p.rig === 'rv' && !errors.rig) {
          if (!/^\d{1,2}$/.test(p.length) || +p.length < 8) errors.rvlength = 'Enter the length of your RV or trailer in feet, e.g. 28.';
          else if (+p.length > site.maxRv) errors.rvlength = 'Site ' + site.id + ' fits RVs up to ' + site.maxRv + ' feet.';
        }
      }
      return errors;
    }
    function showPartyErrors(errors) {
      ['guests', 'pets', 'rig', 'rvlength'].forEach(function (k) {
        var el = $('#book-' + k + '-error'), input = pf[k];
        if (el) el.textContent = errors[k] || '';
        if (errors[k]) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid');
      });
    }
    function addons() {
      var out = {};
      Object.keys(ADDONS).forEach(function (id) {
        var input = $('[data-addon="' + id + '"]');
        if (!input) return;
        var v = input.type === 'checkbox' ? (input.checked ? 1 : 0) : Math.max(0, Math.min(ADDONS[id].max, Math.floor(+input.value || 0)));
        if (v) out[id] = v;
      });
      return out;
    }

    function update(focusCal) {
      var site = state.site ? SITE_BY_ID[state.site] : null;
      var dateErr = '';
      if (state.arrive != null && state.depart != null && site) dateErr = stayError(state.site, state.arrive, state.depart, today);
      if (dateErr) { state.depart = null; }
      renderCalendar(focusCal);
      err.textContent = dateErr;
      // Range readout
      rangeText.textContent = state.arrive == null ? 'Choose an arrival date.'
        : state.depart == null ? 'Arriving ' + longDate(state.arrive, true) + '. Now choose a departure date.'
        : longDate(state.arrive) + ' to ' + longDate(state.depart, true) + ' · ' + plural(state.depart - state.arrive, 'night');
      // Show the RV length field only for RV rigs on non-cabin sites
      var isCabin = site && site.rate === 'cabin';
      $('[data-rig-wrap]').hidden = !!isCabin;
      $('[data-length-wrap]').hidden = isCabin || pf.rig.value !== 'rv';
      var kayakDays = $('[data-addon="kayak"]'), tandemDays = $('[data-addon="tandem"]');
      if (state.arrive != null && state.depart != null) {
        var span = state.depart - state.arrive + 1;
        kayakDays.max = String(Math.min(ADDONS.kayak.max, span)); tandemDays.max = String(Math.min(ADDONS.tandem.max, span));
      }
      syncGuestOptions();
      var pErr = partyErrors();
      showPartyErrors(pErr);
      // Quote
      if (!site || state.arrive == null || state.depart == null) {
        summary.innerHTML = '<p class="text-birch/85">' + (!site ? 'Choose a site or cabin, then your dates, and the price appears here night by night.' : 'Pick your dates on the calendar to see the price.') + '</p>';
        $('[data-request-open]').disabled = true;
        return;
      }
      var a = addons(), p = party(), qd = quote(state.site, state.arrive, state.depart, a, p.pets);
      var html = '<p class="font-display text-xl font-bold">' + escapeHtml(siteLabel(site)) + '</p>' +
        '<p class="mt-1 text-birch/85">' + shortDate(state.arrive) + ' – ' + shortDate(state.depart) + ', ' + yearOf(state.depart) + ' · ' + plural(qd.nights, 'night') + ' · ' + plural(p.guests, 'guest') + (p.pets ? ' · ' + plural(p.pets, 'pet') : '') + '</p>' +
        '<dl class="mt-4 grid gap-1.5 text-[0.98rem]">' +
        qd.lines.concat(qd.extras).map(function (l) {
          return '<div class="flex justify-between gap-4"><dt>' + escapeHtml(l.label) + '</dt><dd class="tabular-nums">' + money(l.amount) + '</dd></div>';
        }).join('') +
        '<div class="flex justify-between gap-4 border-t border-white/25 pt-1.5"><dt>Michigan use tax (' + Math.round(STAY_RULES.taxRate * 100) + '%)</dt><dd class="tabular-nums">' + money(qd.tax) + '</dd></div>' +
        '<div class="mt-1 flex justify-between gap-4 border-t-2 border-white/60 pt-2 font-display text-2xl font-bold"><dt>Total</dt><dd class="tabular-nums" data-total>' + money(qd.total) + '</dd></div></dl>' +
        '<p class="mt-3 text-sm text-birch/80">Check-in from ' + clock(SEASON.checkIn) + ', check-out by ' + clock(SEASON.checkOut) + '.</p>';
      summary.innerHTML = html;
      $('[data-request-open]').disabled = Object.keys(pErr).length > 0 || !!dateErr;
      var rs = $('[data-request-summary]');
      if (rs) rs.textContent = siteLabel(site) + ', ' + shortDate(state.arrive) + ' – ' + shortDate(state.depart) + ', ' + yearOf(state.depart) + ' (' + plural(qd.nights, 'night') + '), ' + money(qd.total) + ' including tax';
    }
    siteSel.addEventListener('change', function () {
      state.site = has(SITE_BY_ID, siteSel.value) ? siteSel.value : null;
      if (state.site && state.arrive != null && state.depart != null && stayError(state.site, state.arrive, state.depart, today)) {
        announce('Those dates aren\u2019t free at ' + state.site + '. Choose new dates.');
        state.arrive = null; state.depart = null;
      }
      var u = params(); if (state.site) u.set('site', state.site); else u.delete('site'); u.delete('arrive'); u.delete('depart'); setParams(u);
      update(false);
    });
    form.addEventListener('input', function () { update(false); });
    form.addEventListener('change', function () { update(false); });
    $$('[data-addon]').forEach(function (i) { i.addEventListener('input', function () { update(false); }); i.addEventListener('change', function () { update(false); }); });
    $$('[data-qty-step]').forEach(function (b) {
      b.addEventListener('click', function () {
        var input = $('[data-addon="' + b.getAttribute('data-qty-for') + '"]');
        if (!input) return;
        var v = Math.max(0, Math.min(+input.max || 99, (+input.value || 0) + +b.getAttribute('data-qty-step')));
        input.value = String(v);
        update(false);
      });
    });
    $('[data-clear-dates]').addEventListener('click', function () { state.arrive = null; state.depart = null; update(false); announce('Dates cleared.'); });
    $('[data-next-weekend]').addEventListener('click', function () {
      var id = state.site;
      if (!id) { announce('Choose a site first.'); siteSel.focus(); return; }
      var d = nextFreeStay(id, firstBookableDay(now), 2, 5);
      if (d == null) { announce('No free weekend found. Call us at ' + PHONE + '.'); return; }
      state.arrive = d; state.depart = d + 2; state.focus = d; state.view = { y: yearOf(d), m: monthOf(d) };
      update(false);
      announce('Next free weekend at ' + id + ': ' + longDate(d) + ' to ' + longDate(d + 2) + '.');
    });

    // Request form: opens below the quote, then shows a reference.
    var request = $('#book-request'), requestWrap = $('[data-request-wrap]');
    $('[data-request-open]').addEventListener('click', function () {
      requestWrap.hidden = false;
      request.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      request.elements.name.focus({ preventScroll: true });
    });
    request.addEventListener('form:valid', function (e) {
      var site = state.site ? SITE_BY_ID[state.site] : null;
      if (!site || state.arrive == null || state.depart == null || Object.keys(partyErrors()).length) { e.detail.cancel('Check your site, dates and party first.'); return; }
      var a = addons(), p = party(), qd = quote(state.site, state.arrive, state.depart, a, p.pets);
      var ref = makeRef('TP');
      e.detail.fill({ ref: ref, total: money(qd.total), site: siteLabel(site), dates: longDate(state.arrive) + ' to ' + longDate(state.depart, true) });
      writeJSON(BOOKING_KEY, { ref: ref, site: state.site, arrive: isoOf(state.arrive), depart: isoOf(state.depart), name: request.elements.name.value.trim().split(/\s+/)[0] });
    });
    update(false);
  }

  /* ------------------------------------------------------------------
   * 8. Activities: trails, difficulty filter and elevation profiles
   * ------------------------------------------------------------------ */
  function profileSvg(id) {
    var t = TRAILS[id], p = t.profile, W = 340, H = 130, L = 40, R = 10, T = 12, B = 26;
    var min = Math.min.apply(null, p), max = Math.max.apply(null, p);
    var lo = Math.floor((min - 10) / 50) * 50, hi = Math.max(lo + 100, Math.ceil((max + 10) / 50) * 50);
    var x = function (i) { return L + (W - L - R) * i / (p.length - 1); };
    var y = function (v) { return T + (H - T - B) * (1 - (v - lo) / (hi - lo)); };
    var line = p.map(function (v, i) { return (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(v).toFixed(1); }).join(' ');
    var area = line + ' L' + x(p.length - 1).toFixed(1) + ' ' + (H - B) + ' L' + L + ' ' + (H - B) + ' Z';
    var gain = 0;
    for (var i = 1; i < p.length; i++) if (p[i] > p[i - 1]) gain += p[i] - p[i - 1];
    var mid = Math.round((lo + hi) / 2 / 10) * 10;
    var ticks = [lo, mid, hi].map(function (v) {
      return '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v).toFixed(1) + '" y2="' + y(v).toFixed(1) + '" stroke="#1c2420" stroke-opacity=".12" stroke-dasharray="3 4"/>' +
        '<text x="' + (L - 6) + '" y="' + (y(v) + 4).toFixed(1) + '" text-anchor="end" font-size="10" fill="#4c5850">' + v + '</text>';
    }).join('');
    var miles = [0, t.miles / 2, t.miles].map(function (m, k) {
      var xx = L + (W - L - R) * k / 2;
      return '<text x="' + xx.toFixed(1) + '" y="' + (H - 8) + '" text-anchor="' + (k === 0 ? 'start' : k === 2 ? 'end' : 'middle') + '" font-size="10" fill="#4c5850">' + (Math.round(m * 10) / 10) + ' mi</text>';
    }).join('');
    var peakI = p.indexOf(max);
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="h-auto w-full" role="img" aria-labelledby="prof-' + id + '-t"><title id="prof-' + id + '-t">Elevation profile of ' + escapeHtml(t.name) + ': ' + t.miles + ' miles, from ' + min + ' to ' + max + ' feet, about ' + gain + ' feet of climbing</title>' +
      ticks + '<path d="' + area + '" fill="' + t.blaze + '" fill-opacity=".16"/>' +
      '<path d="' + line + '" fill="none" stroke="' + t.blaze + '" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + x(peakI).toFixed(1) + '" cy="' + y(max).toFixed(1) + '" r="4" fill="#f26a21" stroke="#1c2420" stroke-width="1.5"/>' + miles + '</svg>';
  }
  function trailGain(id) {
    var p = TRAILS[id].profile, g = 0;
    for (var i = 1; i < p.length; i++) if (p[i] > p[i - 1]) g += p[i] - p[i - 1];
    return g;
  }
  function initTrails() {
    var list = $('[data-trail-list]');
    if (!list) return;
    var cards = $$('[data-trail]', list), count = $('[data-trail-count]'), empty = $('[data-trail-empty]');
    cards.forEach(function (c) {
      var id = c.getAttribute('data-trail');
      if (!has(TRAILS, id)) return;
      var slot = $('[data-profile]', c);
      if (slot) slot.innerHTML = profileSvg(id);
      $$('[data-trail-gain]', c).forEach(function (el) { el.textContent = trailGain(id) + ' ft'; });
      $$('[data-trail-miles]', c).forEach(function (el) { el.textContent = TRAILS[id].miles + ' mi'; });
    });
    var level = has(TRAIL_LEVELS, params().get('level')) ? params().get('level') : 'any';
    function sync() {
      var shown = 0;
      $$('[data-trail-level]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-trail-level') === level)); });
      cards.forEach(function (c) {
        var id = c.getAttribute('data-trail'), ok = level === 'any' || (has(TRAILS, id) && TRAILS[id].level === level);
        c.hidden = !ok;
        if (ok) shown++;
      });
      count.textContent = 'Showing ' + plural(shown, 'trail') + ' of ' + cards.length + '.';
      empty.hidden = shown > 0;
      var u = params(); if (level === 'any') u.delete('level'); else u.set('level', level); setParams(u);
    }
    $$('[data-trail-level]').forEach(function (b) {
      b.addEventListener('click', function () { var v = b.getAttribute('data-trail-level'); level = has(TRAIL_LEVELS, v) ? v : 'any'; sync(); });
    });
    sync();
  }

  /* ------------------------------------------------------------------
   * 9. Guided programs: weekly rules plus one-offs, upcoming by date
   * ------------------------------------------------------------------ */
  // KEEP_DEMO_CURRENT: move a past date forward by whole weeks to the same week of a later year.
  function demoDay(iso, today) {
    var d = dayNumber(iso), md = iso.slice(4);
    for (var i = 0; d < today && i < 60; i++) {
      d += 364; // 52 weeks: same weekday, one or two days earlier in the calendar
      if (dayNumber(yearOf(d) + md) - d > 3) d += 7; // drifted too far: take the next week
    }
    return d;
  }
  function programsBetween(from, to) {
    var out = [];
    for (var d = from; d < to; d++) {
      if (!inSeason(d)) continue;
      var wd = weekdayOf(d), m = monthOf(d), s = seasonOf(yearOf(d));
      if (d === s.open + 1) out.push({ id: 'opening', type: 'kids', day: d, time: '08:30', title: 'Opening weekend pancake breakfast', leader: 'The Koskela family', place: 'Camp store porch', price: '$6, kids under 6 free', text: 'Pancakes, maple syrup and coffee to start the season. Meet your neighbors.' });
      PROGRAM_RULES.forEach(function (r) {
        if (r.weekday !== wd) return;
        if (r.months && r.months.indexOf(m) === -1) return;
        out.push({ id: r.id, type: r.type, day: d, time: r.time, title: r.title, leader: r.leader, place: r.place, price: r.price, text: r.text });
      });
    }
    ONE_OFF_PROGRAMS.forEach(function (e) {
      if (!isIsoDate(e.date)) return;
      var d = KEEP_DEMO_CURRENT ? demoDay(e.date, from) : dayNumber(e.date);
      if (d >= from && d < to && inSeason(d)) out.push({ id: e.id, type: e.type, day: d, time: e.time, title: e.title, leader: e.leader, place: e.place, price: e.price, text: e.text });
    });
    out.sort(function (a, b) { return a.day - b.day || toMinutes(a.time) - toMinutes(b.time); });
    return out;
  }
  // Upcoming programs: this season from today, and the start of next season if this one is nearly over.
  function upcomingPrograms(now) {
    var st = seasonState(now), groups = [];
    if (st.state === 'open') {
      var list = programsBetween(now.day, Math.min(now.day + PROGRAM_WINDOW_DAYS, st.season.close)).filter(function (p) {
        return p.day > now.day || toMinutes(p.time) + 90 > now.minutes;
      });
      if (list.length) groups.push({ label: 'This season', items: list });
      if (list.length < 6) {
        var next = seasonOf(st.season.year + 1);
        groups.push({ label: 'Opening weeks of ' + next.year, items: programsBetween(next.open, next.open + 14) });
      }
    } else {
      groups.push({ label: 'Opening weeks of ' + st.season.year, items: programsBetween(st.season.open, st.season.open + PROGRAM_WINDOW_DAYS) });
    }
    return groups;
  }
  var PROGRAM_ICONS = {
    nature: '<path d="M12 21V11M12 11c-4 0-7-3-7-8 4 0 7 3 7 8Zm0 2c3 0 6-2 6-6-3 0-6 2-6 6Z"/>',
    kids: '<circle cx="12" cy="6" r="2.5"/><path d="M12 9v6m-4-4 4 2 4-2m-6 10 2-6 2 6"/>',
    evening: '<path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z"/><path d="M17 3v3m-1.5-1.5h3"/>',
    paddle: '<path d="M3 15c3 2 15 2 18 0M5 19c2 1 12 1 14 0M18 3 8 13m-2 2-1.5 1.5"/><path d="m7 12 3 3"/>'
  };
  function programCard(p, now) {
    var badge = p.day === now.day ? (toMinutes(p.time) >= 17 * 60 ? 'Tonight' : 'Today') : p.day === now.day + 1 ? 'Tomorrow' : WEEKDAYS[weekdayOf(p.day)];
    return '<li class="card grid grid-cols-[4.25rem_1fr] gap-4 p-4 sm:grid-cols-[5rem_1fr] sm:p-5" data-program="' + p.id + '" data-type="' + p.type + '">' +
      '<div class="self-start overflow-hidden rounded-lg border-2 border-pine text-center"><span class="block bg-pine py-1 text-xs font-extrabold uppercase tracking-[0.16em] text-birch">' + MONTHS[monthOf(p.day) - 1].slice(0, 3) + '</span><span class="block bg-white py-1 font-display text-3xl font-bold text-bark">' + dateOf(p.day) + '</span></div>' +
      '<div class="min-w-0"><p class="flex flex-wrap items-center gap-x-2 text-sm font-extrabold uppercase tracking-[0.12em] text-blaze-dark"><svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0 text-pine" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + PROGRAM_ICONS[p.type] + '</svg>' + escapeHtml(badge) + ' · ' + clock(p.time) + ' · ' + escapeHtml(PROGRAM_TYPES[p.type]) + '</p>' +
      '<h3 class="mt-1 font-display text-xl font-bold">' + escapeHtml(p.title) + '</h3>' +
      '<p class="mt-1 text-[0.98rem] text-lichen">' + escapeHtml(p.text) + '</p>' +
      '<p class="mt-2 text-sm font-bold">' + escapeHtml(p.place) + ' · with ' + escapeHtml(p.leader) + ' · ' + escapeHtml(p.price) + '</p></div></li>';
  }
  function initPrograms() {
    var now = nowLocal();
    var mini = $('[data-next-programs]');
    if (mini) {
      var flat = [];
      upcomingPrograms(now).forEach(function (g) { flat = flat.concat(g.items); });
      mini.innerHTML = flat.slice(0, 3).map(function (p) {
        return '<li class="flex gap-4 border-b border-white/15 py-3 last:border-0"><span class="w-14 shrink-0 text-center font-display font-bold leading-tight text-blaze-light">' + MONTHS[monthOf(p.day) - 1].slice(0, 3) + '<span class="block text-2xl text-white">' + dateOf(p.day) + '</span></span><span class="min-w-0"><span class="block font-bold">' + escapeHtml(p.title) + '</span><span class="block text-sm text-birch/80">' + WEEKDAYS[weekdayOf(p.day)] + ' · ' + clock(p.time) + ' · ' + escapeHtml(p.place) + '</span></span></li>';
      }).join('');
    }
    var list = $('[data-program-list]');
    if (!list) return;
    var type = has(PROGRAM_TYPES, params().get('type')) ? params().get('type') : 'all';
    var groups = upcomingPrograms(now), count = $('[data-program-count]'), empty = $('[data-program-empty]');
    function render() {
      var total = 0, html = '';
      groups.forEach(function (g) {
        var items = g.items.filter(function (p) { return type === 'all' || p.type === type; });
        total += items.length;
        if (!items.length) return;
        html += '<li><h3 class="mb-3 mt-2 flex items-center gap-3 font-display text-lg font-bold text-pine"><span class="blaze-mark" aria-hidden="true"></span>' + escapeHtml(g.label) + '</h3><ol class="grid gap-4 lg:grid-cols-2">' + items.map(function (p) { return programCard(p, now); }).join('') + '</ol></li>';
      });
      list.innerHTML = html;
      count.textContent = plural(total, type === 'all' ? 'program' : PROGRAM_TYPES[type].toLowerCase() + ' program') + ' coming up.';
      empty.hidden = total > 0;
      $$('[data-program-type]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-program-type') === type)); });
    }
    $$('[data-program-type]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-program-type');
        type = has(PROGRAM_TYPES, v) ? v : 'all';
        var u = params(); if (type === 'all') u.delete('type'); else u.set('type', type); setParams(u);
        render();
      });
    });
    render();
  }

  /* ------------------------------------------------------------------
   * 10. Rates: season strip for the year and the rate table
   * ------------------------------------------------------------------ */
  function initRates() {
    var strip = $('[data-season-strip]');
    var now = nowLocal(), st = seasonState(now), s = st.season;
    if (strip) {
      var y = s.year, start = dayNumber(y + '-01-01'), end = dayNumber((y + 1) + '-01-01'), total = end - start;
      var W = 1000, xs = function (d) { return ((d - start) / total * W).toFixed(1); };
      var html = '<rect x="0" y="8" width="' + W + '" height="40" rx="8" fill="#dcd8c7"/>' +
        '<rect x="' + xs(s.open) + '" y="8" width="' + (xs(s.close) - xs(s.open)).toFixed(1) + '" height="40" fill="#7f9a5c"/>' +
        '<rect x="' + xs(s.peakStart) + '" y="8" width="' + (xs(s.peakEnd) - xs(s.peakStart)).toFixed(1) + '" height="40" fill="#1f4b37"/>';
      for (var m = 1; m <= 12; m++) {
        var md = dayNumber(y + '-' + pad(m) + '-01');
        html += '<line x1="' + xs(md) + '" x2="' + xs(md) + '" y1="4" y2="52" stroke="#1c2420" stroke-opacity=".25"/>' +
          '<text x="' + (+xs(md) + 41.5).toFixed(1) + '" y="78" text-anchor="middle" font-size="26" font-weight="700" fill="#4c5850" font-family="Overpass, sans-serif">' + MONTHS[m - 1].charAt(0) + '</text>';
      }
      if (now.year === y) html += '<line x1="' + xs(now.day) + '" x2="' + xs(now.day) + '" y1="4" y2="52" stroke="#f26a21" stroke-width="6"/>';
      strip.innerHTML = '<title id="season-strip-t">The ' + y + ' season: open ' + longDate(s.open) + ' to ' + longDate(s.close) + ', peak rates ' + monthDay(s.peakStart) + ' to ' + monthDay(s.peakEnd - 1) + '</title>' + html;
    }
    var body = $('[data-rate-table]');
    if (body) {
      var rows = Object.keys(RATE_CLASSES).map(function (k) {
        var r = RATE_CLASSES[k], n = SITES.filter(function (x) { return x.rate === k; }).length;
        return [r.label, plural(n, 'site'), r];
      }).concat(SITES.filter(function (x) { return x.rate === 'cabin'; }).map(function (c) { return [c.name, 'Sleeps ' + c.sleeps, c.rates]; }));
      body.innerHTML = rows.map(function (row) {
        var r = row[2];
        return '<tr class="border-b border-bark/10"><th scope="row" class="py-3 pr-4 text-left font-bold">' + escapeHtml(row[0]) + '<span class="block text-sm font-normal text-lichen">' + escapeHtml(row[1]) + '</span></th>' +
          '<td class="py-3 pr-4 tabular-nums">' + money(r.shoulder) + '</td><td class="py-3 pr-4 tabular-nums">' + money(r.peak) + '</td><td class="py-3 tabular-nums">+' + money(r.weekend) + '</td></tr>';
      }).join('');
    }
  }

  /* ------------------------------------------------------------------
   * 11. Camp store: pre-order basket, saved in the browser
   * ------------------------------------------------------------------ */
  // Basket shape: { "firewood": 2, "tee|M": 1 } (product id, plus "|option" for products with options).
  function lineParts(key) {
    var i = key.indexOf('|'), id = i === -1 ? key : key.slice(0, i), opt = i === -1 ? null : key.slice(i + 1);
    if (!has(PRODUCTS, id)) return null;
    var p = PRODUCTS[id];
    if (p.options ? (opt === null || p.options.indexOf(opt) === -1) : opt !== null) return null;
    return { id: id, option: opt, product: p };
  }
  function loadBasket() {
    var raw = readJSON(BASKET_KEY), out = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return out;
    Object.keys(raw).forEach(function (k) {
      var q = raw[k];
      if (lineParts(k) && typeof q === 'number' && Math.floor(q) === q && q > 0) out[k] = Math.min(q, STORE_RULES.maxQty);
    });
    return out;
  }
  function basketCount(b) { return Object.keys(b).reduce(function (t, k) { return t + b[k]; }, 0); }
  function syncBasketBadges(b) {
    var n = basketCount(b);
    $$('[data-basket-count]').forEach(function (el) { el.textContent = String(n); });
    $$('[data-basket-badge]').forEach(function (el) { el.hidden = n === 0; });
  }
  var PRODUCT_ART = {
    firewood: '<rect x="8" y="34" width="48" height="12" rx="6" fill="#8a5a2b"/><rect x="12" y="22" width="40" height="12" rx="6" fill="#a86f38"/><circle cx="14" cy="40" r="4" fill="#e7c48d"/><circle cx="18" cy="28" r="4" fill="#e7c48d"/><circle cx="50" cy="40" r="4" fill="#e7c48d"/><path d="M20 52h24" stroke="#1c2420" stroke-width="3" stroke-linecap="round"/>',
    kindling: '<path d="M18 14h28l4 38H14Z" fill="#eadfbf" stroke="#1c2420" stroke-width="2.5"/><path d="M24 30l16-8M22 40l20-6M26 46l12-12" stroke="#1c2420" stroke-width="2.5" stroke-linecap="round"/><path d="M26 22h4m6 8h4" stroke="#1c2420" stroke-width="2"/>',
    smores: '<rect x="12" y="38" width="40" height="10" rx="2" fill="#c9883f"/><rect x="14" y="30" width="36" height="8" rx="2" fill="#4a2a17"/><rect x="16" y="18" width="32" height="12" rx="6" fill="#ffffff" stroke="#1c2420" stroke-width="2"/><path d="M50 12 30 22" stroke="#6b5a2e" stroke-width="3" stroke-linecap="round"/>',
    pastybeef: '<path d="M8 42c0-14 11-24 24-24s24 10 24 24Z" fill="#d9a35b" stroke="#1c2420" stroke-width="2.5"/><path d="M12 30l4 4 4-5 4 4 4-5 4 4 4-5 4 4 4-5 4 4" fill="none" stroke="#1c2420" stroke-width="2" stroke-linejoin="round"/><path d="M8 46h48" stroke="#1c2420" stroke-width="3" stroke-linecap="round"/>',
    pastyveg: '<path d="M8 42c0-14 11-24 24-24s24 10 24 24Z" fill="#e6c27a" stroke="#1c2420" stroke-width="2.5"/><path d="M32 18v-6m0 0c4-4 8-2 10 0m-10 0c-4-4-8-2-10 0" fill="none" stroke="#1f4b37" stroke-width="2.5" stroke-linecap="round"/><path d="M8 46h48" stroke="#1c2420" stroke-width="3" stroke-linecap="round"/>',
    pancakes: '<ellipse cx="32" cy="44" rx="22" ry="6" fill="#c9883f" stroke="#1c2420" stroke-width="2"/><ellipse cx="32" cy="37" rx="20" ry="5.5" fill="#e0a55a" stroke="#1c2420" stroke-width="2"/><ellipse cx="32" cy="30" rx="18" ry="5" fill="#e9b96d" stroke="#1c2420" stroke-width="2"/><path d="M28 26c0 6 2 10 4 12" stroke="#8a4a14" stroke-width="3" stroke-linecap="round"/><circle cx="40" cy="26" r="3" fill="#2a3b7a"/><circle cx="45" cy="28" r="3" fill="#2a3b7a"/>',
    coffee: '<path d="M18 16h28l-3 36H21Z" fill="#1f4b37" stroke="#1c2420" stroke-width="2.5"/><rect x="22" y="26" width="20" height="14" rx="2" fill="#f6f4ec"/><path d="M26 33c4-4 8 4 12 0" stroke="#b23f0a" stroke-width="2" fill="none"/><path d="M18 16l4-6h20l4 6" fill="#12301f"/>',
    ice: '<path d="M16 20h32l-4 32H20Z" fill="#d5e6ef" stroke="#1b5c86" stroke-width="2.5"/><rect x="22" y="30" width="9" height="9" rx="2" fill="#ffffff" stroke="#1b5c86" stroke-width="1.5"/><rect x="33" y="36" width="9" height="9" rx="2" fill="#ffffff" stroke="#1b5c86" stroke-width="1.5"/><path d="M28 14h8" stroke="#1b5c86" stroke-width="3" stroke-linecap="round"/>',
    jam: '<rect x="18" y="22" width="28" height="30" rx="5" fill="#a3203f" stroke="#1c2420" stroke-width="2.5"/><rect x="16" y="14" width="32" height="9" rx="2" fill="#eadfbf" stroke="#1c2420" stroke-width="2"/><rect x="22" y="31" width="20" height="12" rx="2" fill="#f6f4ec"/><circle cx="32" cy="37" r="3.5" fill="#a3203f"/>',
    bugspray: '<rect x="22" y="22" width="20" height="32" rx="4" fill="#7f9a5c" stroke="#1c2420" stroke-width="2.5"/><rect x="26" y="12" width="12" height="10" fill="#1c2420"/><path d="M38 14h8m-2-4 6-2m-6 8 6 2" stroke="#1c2420" stroke-width="2" stroke-linecap="round"/><path d="M28 34l8 8m0-8-8 8" stroke="#f6f4ec" stroke-width="2.5"/>',
    propane: '<rect x="20" y="20" width="24" height="34" rx="10" fill="#1b5c86" stroke="#1c2420" stroke-width="2.5"/><rect x="27" y="10" width="10" height="10" fill="#9aa5a0" stroke="#1c2420" stroke-width="2"/><path d="M24 34h16" stroke="#f6f4ec" stroke-width="2.5"/>',
    headlamp: '<path d="M8 32c0-10 48-10 48 0" fill="none" stroke="#1c2420" stroke-width="4"/><rect x="24" y="28" width="16" height="14" rx="3" fill="#f26a21" stroke="#1c2420" stroke-width="2.5"/><circle cx="32" cy="35" r="4" fill="#fff7c2" stroke="#1c2420" stroke-width="1.5"/><path d="M32 46v8m-6-6-4 6m14-6 4 6" stroke="#e8b730" stroke-width="2.5" stroke-linecap="round"/>',
    map: '<path d="M8 16l16-6 16 6 16-6v38l-16 6-16-6-16 6Z" fill="#f6f4ec" stroke="#1c2420" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 10v38M40 16v38" stroke="#1c2420" stroke-width="1.5"/><path d="M12 36c6-6 10 2 16-6s10-2 14-8 8-2 10-4" fill="none" stroke="#f26a21" stroke-width="2.5" stroke-dasharray="3 3"/>',
    mug: '<path d="M14 18h30v28a6 6 0 0 1-6 6H20a6 6 0 0 1-6-6Z" fill="#1f4b37" stroke="#1c2420" stroke-width="2.5"/><path d="M44 24h4a6 6 0 0 1 0 12h-4" fill="none" stroke="#1c2420" stroke-width="3"/><path d="M14 18h30" stroke="#f6f4ec" stroke-width="2"/><path d="M29 26l-6 12h12Z" fill="#f6f4ec"/>',
    tee: '<path d="M22 10l-14 8 6 10 6-3v29h24V25l6 3 6-10-14-8c-2 4-6 6-10 6s-8-2-10-6Z" fill="#1f4b37" stroke="#1c2420" stroke-width="2.5" stroke-linejoin="round"/><path d="M32 28l-6 10h12Z" fill="#f26a21"/>'
  };
  function productArt(id) {
    return '<svg viewBox="0 0 64 64" class="h-16 w-16" aria-hidden="true">' + PRODUCT_ART[id] + '</svg>';
  }
  function initBasketBadges() { syncBasketBadges(loadBasket()); }
  function initStore() {
    var grid = $('[data-product-grid]');
    if (!grid) return;
    var basket = loadBasket();
    var cat = has(PRODUCT_CATS, params().get('cat')) ? params().get('cat') : 'all';
    var listEl = $('[data-basket-list]'), totals = $('[data-basket-totals]'), emptyEl = $('[data-basket-empty]'), form = $('#pickup-form');
    function renderGrid() {
      grid.innerHTML = Object.keys(PRODUCTS).filter(function (id) { return cat === 'all' || PRODUCTS[id].cat === cat; }).map(function (id) {
        var p = PRODUCTS[id];
        return '<li class="card flex flex-col p-5" data-product="' + id + '">' +
          '<div class="flex items-start gap-4"><div class="grid h-20 w-20 shrink-0 place-items-center rounded-lg bg-birch-2">' + productArt(id) + '</div>' +
          '<div class="min-w-0"><p class="text-xs font-extrabold uppercase tracking-[0.14em] text-blaze-dark">' + escapeHtml(PRODUCT_CATS[p.cat]) + '</p><h3 class="mt-1 font-display text-lg font-bold leading-snug">' + escapeHtml(p.name) + '</h3><p class="mt-1 font-display text-xl font-bold text-pine">' + money(p.price) + '</p></div></div>' +
          '<p class="mt-3 text-[0.95rem] text-lichen">' + escapeHtml(p.text) + '</p>' +
          '<div class="mt-auto flex flex-wrap items-end gap-3 pt-4">' +
          (p.options ? '<div class="min-w-0 flex-1"><label class="field-label" for="opt-' + id + '">' + (id === 'tee' ? 'Size' : 'Color') + '</label><select id="opt-' + id + '" class="field py-2" data-option-for="' + id + '">' + p.options.map(function (o) { return '<option>' + escapeHtml(o) + '</option>'; }).join('') + '</select></div>' : '') +
          '<button type="button" class="btn-blaze btn-sm" data-add="' + id + '"><span>Add<span class="sr-only"> ' + escapeHtml(p.name) + '</span> to basket</span></button></div></li>';
      }).join('');
      $$('[data-store-cat]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-store-cat') === cat)); });
    }
    function lineName(key) { var lp = lineParts(key); return lp.product.name + (lp.option ? ' (' + lp.option + ')' : ''); }
    function renderBasket() {
      var keys = Object.keys(basket), subtotal = 0;
      listEl.innerHTML = keys.map(function (k) {
        var lp = lineParts(k), line = lp.product.price * basket[k];
        subtotal += line;
        return '<li class="flex items-center gap-3 border-b border-bark/10 py-3" data-line="' + escapeHtml(k) + '">' +
          '<div class="min-w-0 flex-1"><p class="font-bold leading-snug">' + escapeHtml(lineName(k)) + '</p><p class="text-sm text-lichen">' + money(lp.product.price) + ' each</p></div>' +
          '<div class="flex items-center gap-1"><button type="button" class="grid h-9 w-9 place-items-center rounded-md border-2 border-bark/25 font-bold hover:border-bark" data-qty="-1" aria-label="One fewer ' + escapeHtml(lineName(k)) + '">&minus;</button>' +
          '<span class="w-7 text-center font-bold tabular-nums" aria-label="Quantity">' + basket[k] + '</span>' +
          '<button type="button" class="grid h-9 w-9 place-items-center rounded-md border-2 border-bark/25 font-bold hover:border-bark" data-qty="1" aria-label="One more ' + escapeHtml(lineName(k)) + '">+</button></div>' +
          '<p class="w-16 text-right font-bold tabular-nums">' + money(line) + '</p></li>';
      }).join('');
      emptyEl.hidden = keys.length > 0;
      form.hidden = keys.length === 0;
      var tax = Math.round(subtotal * STAY_RULES.taxRate * 100) / 100;
      totals.hidden = keys.length === 0;
      totals.innerHTML = '<div class="flex justify-between"><dt>Subtotal</dt><dd class="tabular-nums">' + money(subtotal) + '</dd></div>' +
        '<div class="flex justify-between text-lichen"><dt>Sales tax (6%)</dt><dd class="tabular-nums">' + money(tax) + '</dd></div>' +
        '<div class="mt-1 flex justify-between border-t-2 border-bark pt-2 font-display text-xl font-bold"><dt>Pay at pickup</dt><dd class="tabular-nums" data-basket-total>' + money(subtotal + tax) + '</dd></div>';
      $$('[data-basket-summary]').forEach(function (el) { el.textContent = plural(basketCount(basket), 'item') + ', ' + money(subtotal + tax); });
      syncBasketBadges(basket);
    }
    function save() { writeJSON(BASKET_KEY, Object.keys(basket).length ? basket : null); }
    grid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-add]');
      if (!b) return;
      var id = b.getAttribute('data-add');
      if (!has(PRODUCTS, id)) return;
      var sel = $('[data-option-for="' + id + '"]', grid), key = id + (PRODUCTS[id].options && sel ? '|' + sel.value : '');
      if (!lineParts(key)) return;
      basket[key] = Math.min(STORE_RULES.maxQty, (basket[key] || 0) + 1);
      var done = $('#pickup-success');
      if (done) done.hidden = true;
      save(); renderBasket();
      announce(lineName(key) + ' added. ' + plural(basketCount(basket), 'item') + ' in your basket.');
    });
    listEl.addEventListener('click', function (e) {
      var b = e.target.closest('[data-qty]');
      if (!b) return;
      var key = b.closest('[data-line]').getAttribute('data-line');
      if (!has(basket, key)) return;
      var name = lineName(key);
      basket[key] += +b.getAttribute('data-qty');
      if (basket[key] > STORE_RULES.maxQty) basket[key] = STORE_RULES.maxQty;
      if (basket[key] <= 0) { delete basket[key]; announce(name + ' removed.'); }
      save(); renderBasket();
    });
    $$('[data-store-cat]').forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-store-cat');
        cat = has(PRODUCT_CATS, v) ? v : 'all';
        var u = params(); if (cat === 'all') u.delete('cat'); else u.set('cat', cat); setParams(u);
        renderGrid();
      });
    });
    $$('[data-basket-clear]').forEach(function (b) { b.addEventListener('click', function () { basket = {}; save(); renderBasket(); announce('Basket emptied.'); }); });

    // Pickup details: the arrival date must be in season; a booking reference made on this device prefills.
    var f = form.elements, now = nowLocal(), first = firstBookableDay(now);
    f.pickup.min = isoOf(Math.max(now.day, first));
    f.pickup.max = isoOf(now.day + STAY_RULES.maxDaysAhead);
    var last = cleanBooking(readJSON(BOOKING_KEY));
    if (last && dayNumber(last.arrive) >= now.day) {
      f.pickup.value = last.arrive; f.ref.value = last.ref;
      if (last.name) f.name.value = last.name;
      var note = $('[data-booking-note]');
      if (note) { note.hidden = false; $('[data-booking-ref]', note).textContent = last.ref; }
    }
    form.addEventListener('form:valid', function (e) {
      var n = basketCount(basket);
      if (!n) { e.detail.cancel('Your basket is empty.'); return; }
      var d = dayNumber(f.pickup.value), subtotal = 0;
      Object.keys(basket).forEach(function (k) { subtotal += lineParts(k).product.price * basket[k]; });
      e.detail.fill({ ref: makeRef('ST'), total: money(subtotal + Math.round(subtotal * STAY_RULES.taxRate * 100) / 100), items: plural(n, 'item'), date: longDate(d, true) });
      basket = {}; save(); renderBasket();
    });
    renderGrid();
    renderBasket();
  }
  // Extra checks for the pickup date (called by the shared form validation).
  function pickupError(v) {
    if (!isIsoDate(v)) return 'Choose the day you arrive.';
    var d = dayNumber(v), now = nowLocal();
    if (d < now.day) return 'That date has passed.';
    if (!inSeason(d)) { var s = seasonState(now).season; return 'We\u2019re closed then. The ' + s.year + ' season runs ' + monthDay(s.open) + ' to ' + monthDay(s.close) + '.'; }
    if (d > now.day + STAY_RULES.maxDaysAhead) return 'Pre-orders open closer to the date.';
    return '';
  }

  /* ------------------------------------------------------------------
   * 12. Contact: topic from the URL, office hours and status
   * ------------------------------------------------------------------ */
  function officeHoursFor(day) {
    if (inSeason(day)) return OFFICE_HOURS.season;
    return OFFICE_HOURS.winter[weekdayOf(day)];
  }
  function initContact() {
    var select = $('#contact-topic');
    if (select) { var topic = params().get('topic'); if (has(CONTACT_TOPICS, topic)) select.value = topic; }
    var now = nowLocal(), h = officeHoursFor(now.day);
    var open = h && now.minutes >= toMinutes(h[0]) && now.minutes < toMinutes(h[1]);
    $$('[data-office-status]').forEach(function (el) {
      el.textContent = open ? 'The office is open until ' + clock(h[1]) + ' today.'
        : 'The office is closed right now. ' + (inSeason(now.day) ? 'We open at ' + clock(OFFICE_HOURS.season[0]) + '.' : 'Winter phone hours are Monday to Friday, 9 am to 4 pm.');
    });
    $$('[data-office-state]').forEach(function (el) { el.setAttribute('data-state', open ? 'open' : 'closed'); });
    $$('[data-hours-mode]').forEach(function (row) {
      var mode = row.getAttribute('data-hours-mode'), on = (mode === 'season') === inSeason(now.day);
      row.toggleAttribute('data-current', on);
      var badge = $('[data-current-badge]', row);
      if (badge) badge.hidden = !on;
    });
  }

  /* ------------------------------------------------------------------
   * 13. Forms: inline validation and the success state.
   *     To send for real, see "Forms" in DOCS.md (e.g. Formspree: replace the
   *     marked block below with a fetch() POST and show success when it answers OK).
   * ------------------------------------------------------------------ */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var live;
  function announce(msg) {
    if (!live) return;
    live.textContent = '';
    setTimeout(function () { live.textContent = msg; }, 30);
  }
  function fieldError(form, input) {
    var v = input.value.trim();
    if (input.disabled || input.closest('[hidden]')) return '';
    if (input.type === 'checkbox' && input.required && !input.checked) return input.getAttribute('data-required-msg') || 'Please check this box.';
    if (input.required && !v) return input.getAttribute('data-required-msg') || 'This field is required.';
    if (v && input.type === 'email' && !EMAIL_RE.test(v)) return 'Enter an email address like name@example.com.';
    if (v && input.type === 'tel' && !/^[+()\d\s.-]{7,20}$/.test(v)) return 'Enter a phone number using digits and spaces.';
    if (v && input.getAttribute('data-minlength') && v.length < +input.getAttribute('data-minlength')) return 'Please write at least ' + input.getAttribute('data-minlength') + ' characters.';
    if (input.getAttribute('data-maxlength') && input.value.length > +input.getAttribute('data-maxlength')) return 'Please keep it to ' + input.getAttribute('data-maxlength') + ' characters.';
    if (v && input.name === 'ref' && !/^TP-[A-Za-z0-9]{4}$/.test(v)) return 'Booking references look like TP-7K2Q.';
    if (input.name === 'pickup') return pickupError(v);
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
        // Pages can add their own checks and fill the success panel (booking, store).
        var cancelled = null, filled = {};
        form.dispatchEvent(new CustomEvent('form:valid', { detail: { cancel: function (m) { cancelled = m; }, fill: function (o) { filled = o; } } }));
        if (cancelled) { announce(cancelled); var fe = $('[data-form-error]', form); if (fe) fe.textContent = cancelled; return; }
        // ---- Replace this block with a fetch() to your form service, and show success when it answers OK. ----
        var success = $('#' + form.getAttribute('data-success'));
        var name = form.elements.name ? form.elements.name.value.trim().split(/\s+/)[0] : '';
        if (!filled.ref) filled.ref = makeRef(form.getAttribute('data-ref-prefix') || 'TP');
        if (success) {
          $$('[data-success-name]', success).forEach(function (el) { el.textContent = name ? ', ' + name : ''; });
          Object.keys(filled).forEach(function (k) {
            $$('[data-success-' + k + ']', success).forEach(function (el) { el.textContent = filled[k]; });
          });
          success.hidden = false;
          if (form.hasAttribute('data-hide-on-success')) form.hidden = true;
          success.focus();
        }
        var fe2 = $('[data-form-error]', form); if (fe2) fe2.textContent = '';
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
   * 14. Header, mobile menu, scroll reveal, year
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
    $$('[data-year]').forEach(function (el) { el.textContent = String(nowLocal().year); });

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
   * 15. Back to top
   * ------------------------------------------------------------------ */
  function initBackToTop() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
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
  initRateFills();
  initSitesMap();
  initBooking();
  initTrails();
  initPrograms();
  initRates();
  initBasketBadges();
  initStore();
  initContact();
  initForms();
  initBackToTop();

  // Exposed for tests and debugging.
  window.Canopy = { seasonOf: seasonOf, seasonState: seasonState, getStatus: getStatus, isBooked: isBooked, nightRate: nightRate, quote: quote, stayError: stayError, upcomingPrograms: upcomingPrograms, nowLocal: nowLocal, dayNumber: dayNumber, isoOf: isoOf };
})();
