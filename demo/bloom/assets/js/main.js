/* Bloom Hair & Spa — all template JavaScript. Vanilla, no dependencies.
 *
 *  1. Data            services, team, hours and looks (edit here)
 *  2. Helpers         DOM, storage, dates and the booking time-slot logic
 *  3. Header          sticky shadow and accessible mobile menu
 *  4. Reveal          fade content in as it scrolls into view
 *  5. Hours          "Open now" badges and today's row in hours tables
 *  6. Before/after    comparison slider
 *  7. Services        category filter
 *  8. Team            specialty filter
 *  9. Gallery         filter, saved looks and lightbox
 * 10. Booking         five-step booking wizard
 * 11. Gift cards      amount, design, live preview and demo purchase
 * 12. Forms           contact and newsletter forms
 * 13. Back to top
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Data — generated from one source shared with the Next.js version.
   * ------------------------------------------------------------------ */
  var BLOOM = {
    "salon": {
      "name": "Bloom Hair & Spa",
      "short": "Bloom",
      "street": "48 Burns Court",
      "city": "Sarasota, FL 34236",
      "phone": "(941) 555-0173",
      "phoneHref": "+19415550173",
      "email": "hello@bloomhairspa.example",
      "currency": "USD",
      "locale": "en-US"
    },
    "hours": [
      {
        "day": 0,
        "label": "Sunday",
        "open": "10:00",
        "close": "16:00"
      },
      {
        "day": 1,
        "label": "Monday",
        "open": null,
        "close": null
      },
      {
        "day": 2,
        "label": "Tuesday",
        "open": "09:00",
        "close": "19:00"
      },
      {
        "day": 3,
        "label": "Wednesday",
        "open": "09:00",
        "close": "19:00"
      },
      {
        "day": 4,
        "label": "Thursday",
        "open": "09:00",
        "close": "20:00"
      },
      {
        "day": 5,
        "label": "Friday",
        "open": "09:00",
        "close": "19:00"
      },
      {
        "day": 6,
        "label": "Saturday",
        "open": "08:30",
        "close": "17:00"
      }
    ],
    "categories": [
      {
        "id": "hair",
        "label": "Hair",
        "blurb": "Precision cuts and soft, lived-in shapes, finished with a blowout."
      },
      {
        "id": "colour",
        "label": "Color",
        "blurb": "Hand-painted balayage, glossing and gray blending with low-ammonia color."
      },
      {
        "id": "nails",
        "label": "Nails",
        "blurb": "Unhurried manicures and pedicures with vegan, 10-free polishes."
      },
      {
        "id": "skin",
        "label": "Skin",
        "blurb": "Facials, brows and lashes using plant-based actives."
      },
      {
        "id": "massage",
        "label": "Massage",
        "blurb": "Deep, restorative bodywork in our candlelit treatment rooms."
      }
    ],
    "services": [
      {
        "id": "signature-cut",
        "cat": "hair",
        "name": "Signature cut & finish",
        "mins": 60,
        "price": 85,
        "desc": "Consultation, wash with scalp massage, precision cut and a lasting blowout.",
        "signature": true
      },
      {
        "id": "restyle",
        "cat": "hair",
        "name": "Restyle consultation & cut",
        "mins": 75,
        "price": 110,
        "desc": "For a big change: a longer consultation, a new shape and styling lesson."
      },
      {
        "id": "blow-dry",
        "cat": "hair",
        "name": "Blowout & style",
        "mins": 45,
        "price": 55,
        "desc": "Smooth, bouncy or undone waves that hold for days."
      },
      {
        "id": "short-cut",
        "cat": "hair",
        "name": "Short cut & clipper work",
        "mins": 30,
        "price": 45,
        "desc": "Crops, fades and cleanups, finished with a styling product."
      },
      {
        "id": "event-styling",
        "cat": "hair",
        "name": "Bridal & event styling",
        "mins": 90,
        "price": 175,
        "desc": "Updos and soft waves for weddings and occasions, with a trial on request."
      },
      {
        "id": "balayage",
        "cat": "colour",
        "name": "Balayage",
        "mins": 180,
        "price": 260,
        "desc": "Hand-painted, sun-kissed brightness that grows out softly. Includes gloss and blowout.",
        "signature": true
      },
      {
        "id": "full-colour",
        "cat": "colour",
        "name": "Full color",
        "mins": 105,
        "price": 145,
        "desc": "All-over tint from root to tip, with a bond-building treatment."
      },
      {
        "id": "root-touch-up",
        "cat": "colour",
        "name": "Root touch-up",
        "mins": 75,
        "price": 95,
        "desc": "Regrowth and gray coverage up to 1 inch."
      },
      {
        "id": "half-highlights",
        "cat": "colour",
        "name": "Partial highlights",
        "mins": 120,
        "price": 165,
        "desc": "Foil highlights through the top and sides for brightness around the face."
      },
      {
        "id": "gloss",
        "cat": "colour",
        "name": "Gloss & tone",
        "mins": 45,
        "price": 65,
        "desc": "Refreshes faded color and adds mirror shine between appointments."
      },
      {
        "id": "gel-manicure",
        "cat": "nails",
        "name": "Gel manicure",
        "mins": 50,
        "price": 50,
        "desc": "Shape, cuticle care and a chip-free gel finish that lasts two weeks.",
        "signature": true
      },
      {
        "id": "classic-manicure",
        "cat": "nails",
        "name": "Classic manicure",
        "mins": 40,
        "price": 35,
        "desc": "Shape, buff, hand massage and your choice of polish."
      },
      {
        "id": "spa-pedicure",
        "cat": "nails",
        "name": "Spa pedicure",
        "mins": 55,
        "price": 65,
        "desc": "Warm soak, exfoliation, callus care, massage and polish."
      },
      {
        "id": "nail-art",
        "cat": "nails",
        "name": "Nail art (add-on)",
        "mins": 15,
        "price": 15,
        "desc": "Minimal lines, dots or chrome accents on up to four nails."
      },
      {
        "id": "signature-facial",
        "cat": "skin",
        "name": "Bloom signature facial",
        "mins": 60,
        "price": 130,
        "desc": "Double cleanse, enzyme peel, extractions, sculpting massage and mask.",
        "signature": true
      },
      {
        "id": "hydrating-facial",
        "cat": "skin",
        "name": "Hydrating facial",
        "mins": 45,
        "price": 100,
        "desc": "A plumping hyaluronic treatment for tired or dehydrated skin."
      },
      {
        "id": "brow-tint",
        "cat": "skin",
        "name": "Brow shape & tint",
        "mins": 30,
        "price": 40,
        "desc": "Mapping, wax and tint for full, natural-looking brows."
      },
      {
        "id": "lash-lift",
        "cat": "skin",
        "name": "Lash lift & tint",
        "mins": 50,
        "price": 85,
        "desc": "Lifted, darker lashes for six to eight weeks, no extensions needed."
      },
      {
        "id": "swedish-60",
        "cat": "massage",
        "name": "Swedish massage, 60 min",
        "mins": 60,
        "price": 110,
        "desc": "Flowing full-body massage with warm oils to release tension."
      },
      {
        "id": "swedish-90",
        "cat": "massage",
        "name": "Swedish massage, 90 min",
        "mins": 90,
        "price": 155,
        "desc": "The full-body ritual with extra time for back, neck and scalp."
      },
      {
        "id": "hot-stone",
        "cat": "massage",
        "name": "Hot stone massage",
        "mins": 75,
        "price": 140,
        "desc": "Heated basalt stones melt deep muscle tension.",
        "signature": false
      },
      {
        "id": "scalp-shoulder",
        "cat": "massage",
        "name": "Scalp, neck & shoulder",
        "mins": 30,
        "price": 55,
        "desc": "A quick reset for desk-bound shoulders. Easy to add to any visit."
      }
    ],
    "levels": [
      {
        "id": "stylist",
        "label": "Stylist",
        "multiplier": 1.0,
        "blurb": "Fully licensed, at least two years on the floor."
      },
      {
        "id": "senior",
        "label": "Senior",
        "multiplier": 1.2,
        "blurb": "Five years or more, with advanced color or cutting training."
      },
      {
        "id": "director",
        "label": "Director",
        "multiplier": 1.4,
        "blurb": "Our most experienced artists, who also train the team."
      }
    ],
    "team": [
      {
        "id": "ines",
        "name": "Inès Moreau",
        "role": "Creative Director",
        "level": "director",
        "cats": [
          "hair",
          "colour"
        ],
        "days": [
          2,
          3,
          4,
          5,
          6
        ],
        "bio": "Founded Bloom in 2016 after a decade in Paris salons. Known for soft, swingy bobs and color that looks like you were born with it.",
        "specialties": [
          "Precision bobs",
          "Lived-in color",
          "Bridal hair"
        ]
      },
      {
        "id": "theo",
        "name": "Theo Park",
        "role": "Senior Stylist",
        "level": "senior",
        "cats": [
          "hair",
          "colour"
        ],
        "days": [
          0,
          3,
          4,
          5,
          6
        ],
        "bio": "Theo loves texture: shags, curtain bangs and cuts that dry naturally with almost no styling.",
        "specialties": [
          "Shags & layers",
          "Curly cuts",
          "Men's grooming"
        ]
      },
      {
        "id": "amara",
        "name": "Amara Okoye",
        "role": "Color Specialist",
        "level": "senior",
        "cats": [
          "colour",
          "hair"
        ],
        "days": [
          0,
          2,
          4,
          5,
          6
        ],
        "bio": "A balayage obsessive who paints every head by hand. Amara also leads our color-correction clinic.",
        "specialties": [
          "Balayage",
          "Color correction",
          "Gray blending"
        ]
      },
      {
        "id": "lucia",
        "name": "Lucia Ferrante",
        "role": "Stylist",
        "level": "stylist",
        "cats": [
          "hair"
        ],
        "days": [
          2,
          3,
          5,
          6
        ],
        "bio": "Lucia joined from our apprentice academy and has a gift for long, glossy blowouts and event hair.",
        "specialties": [
          "Blowouts",
          "Event styling",
          "Long layers"
        ]
      },
      {
        "id": "hana",
        "name": "Hana Kim",
        "role": "Nail Artist",
        "level": "senior",
        "cats": [
          "nails"
        ],
        "days": [
          0,
          2,
          3,
          4,
          5,
          6
        ],
        "bio": "Hana's minimal nail art has a waiting list. Expect immaculate cuticles and the cleanest lines in town.",
        "specialties": [
          "Gel manicures",
          "Minimal nail art",
          "Spa pedicures"
        ]
      },
      {
        "id": "saoirse",
        "name": "Saoirse Byrne",
        "role": "Skin & Massage Therapist",
        "level": "senior",
        "cats": [
          "skin",
          "massage"
        ],
        "days": [
          2,
          3,
          4,
          5,
          6
        ],
        "bio": "A licensed esthetician and sports massage therapist. Saoirse's signature facial is our most rebooked treatment.",
        "specialties": [
          "Facials",
          "Lash lifts",
          "Deep tissue massage"
        ]
      }
    ],
    "looks": [
      {
        "id": "honey-balayage",
        "cat": "colour",
        "title": "Honey balayage",
        "by": "amara",
        "palette": [
          "#3b2418",
          "#c98a4b",
          "#f0c98a"
        ],
        "kind": "long"
      },
      {
        "id": "copper-gloss",
        "cat": "colour",
        "title": "Copper gloss",
        "by": "amara",
        "palette": [
          "#5a2414",
          "#b8562a",
          "#e3925a"
        ],
        "kind": "wave"
      },
      {
        "id": "ash-blonde",
        "cat": "colour",
        "title": "Soft ash blonde",
        "by": "ines",
        "palette": [
          "#6d6152",
          "#cbbba0",
          "#efe5cf"
        ],
        "kind": "bob"
      },
      {
        "id": "french-bob",
        "cat": "cuts",
        "title": "French bob with bangs",
        "by": "ines",
        "palette": [
          "#1c1411",
          "#3b2a24",
          "#5a4035"
        ],
        "kind": "bob"
      },
      {
        "id": "curly-shag",
        "cat": "cuts",
        "title": "Curly shag",
        "by": "theo",
        "palette": [
          "#1e1410",
          "#3d2a20",
          "#6a4a36"
        ],
        "kind": "curls"
      },
      {
        "id": "textured-crop",
        "cat": "cuts",
        "title": "Textured crop",
        "by": "theo",
        "palette": [
          "#141012",
          "#2c2222",
          "#4a3a36"
        ],
        "kind": "crop"
      },
      {
        "id": "garden-updo",
        "cat": "bridal",
        "title": "Garden party updo",
        "by": "lucia",
        "palette": [
          "#4a2c1c",
          "#8a5a3c",
          "#c79a6c"
        ],
        "kind": "updo"
      },
      {
        "id": "bridal-waves",
        "cat": "bridal",
        "title": "Hollywood bridal waves",
        "by": "lucia",
        "palette": [
          "#5a3a22",
          "#a87444",
          "#e4b67c"
        ],
        "kind": "wave"
      },
      {
        "id": "milky-nude",
        "cat": "nails",
        "title": "Milky nude gel",
        "by": "hana",
        "palette": [
          "#f3ddd5",
          "#e8c4b8",
          "#fff4ef"
        ],
        "kind": "nails"
      },
      {
        "id": "chrome-tips",
        "cat": "nails",
        "title": "Chrome French tips",
        "by": "hana",
        "palette": [
          "#f4e9e4",
          "#b9a7c4",
          "#ffffff"
        ],
        "kind": "nails"
      },
      {
        "id": "glass-skin",
        "cat": "skin",
        "title": "Glass-skin facial glow",
        "by": "saoirse",
        "palette": [
          "#f4d3bd",
          "#f9e2d2",
          "#ffffff"
        ],
        "kind": "skin"
      },
      {
        "id": "lash-lift-look",
        "cat": "skin",
        "title": "Lifted lashes & laminated brows",
        "by": "saoirse",
        "palette": [
          "#efcaa6",
          "#2a1c16",
          "#7a3e5b"
        ],
        "kind": "lashes"
      }
    ],
    "lookCategories": [
      {
        "id": "colour",
        "label": "Color"
      },
      {
        "id": "cuts",
        "label": "Cuts"
      },
      {
        "id": "bridal",
        "label": "Bridal"
      },
      {
        "id": "nails",
        "label": "Nails"
      },
      {
        "id": "skin",
        "label": "Skin"
      }
    ],
    "giftAmounts": [
      50,
      75,
      100,
      150,
      250
    ],
    "giftDesigns": [
      {
        "id": "petal",
        "label": "Petal"
      },
      {
        "id": "sage",
        "label": "Sage"
      },
      {
        "id": "noir",
        "label": "Noir"
      }
    ]
  };

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var params = new URLSearchParams(window.location.search);
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // A short reference for confirmations, like BL-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return 'BL-' + out;
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

  var store = {
    get: function (key) {
      try { return JSON.parse(safeStorage.getItem(key)); } catch (e) { return null; }
    },
    set: function (key, value) {
      try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
    },
    remove: function (key) {
      try { safeStorage.removeItem(key); } catch (e) { /* private mode */ }
    }
  };

  // Ids from the URL must be the data's own keys, so ?service=constructor or ?stylist=__proto__ match nothing.
  var hasOwn = function (obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); };
  // Text from the data goes into HTML strings escaped.
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var serviceById = {}; BLOOM.services.forEach(function (s) { serviceById[s.id] = s; });
  var memberById = {}; BLOOM.team.forEach(function (t) { memberById[t.id] = t; });
  var levelById = {}; BLOOM.levels.forEach(function (l) { levelById[l.id] = l; });

  // Prices in the salon's currency and locale (BLOOM.salon), e.g. "$55" or "$55.50".
  function money(n) {
    var whole = Math.round(n * 100) % 100 === 0;
    return new Intl.NumberFormat(BLOOM.salon.locale, { style: 'currency', currency: BLOOM.salon.currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(n);
  }
  // "No amount yet" in the same currency and locale, e.g. "$—": money(0) with the number replaced by a dash.
  function noAmount() {
    var dashed = false;
    return new Intl.NumberFormat(BLOOM.salon.locale, { style: 'currency', currency: BLOOM.salon.currency, maximumFractionDigits: 0 }).formatToParts(0).map(function (p) {
      if (p.type !== 'integer' && p.type !== 'group' && p.type !== 'decimal' && p.type !== 'fraction') return p.value;
      if (dashed) return '';
      dashed = true;
      return '—';
    }).join('');
  }
  function duration(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    if (h && mm) return h + ' hr ' + mm + ' min';
    return h ? h + ' hr' : mm + ' min';
  }
  function toMin(hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }
  function hhmm(min) { var h = Math.floor(min / 60); return (h % 12 || 12) + ':' + String(min % 60).padStart(2, '0') + (h < 12 ? ' AM' : ' PM'); }
  function dateKey(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  var DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function longDate(d) { return DAY[d.getDay()] + ', ' + MONTH[d.getMonth()] + ' ' + d.getDate(); }

  // Price of a service with a team member of a given level (hair and color scale by level).
  function priceFor(service, levelId) {
    var mult = (service.cat === 'hair' || service.cat === 'colour') ? levelById[levelId || 'stylist'].multiplier : 1;
    return Math.round(service.price * mult);
  }

  // Deterministic "already booked" blocks so the schedule looks realistic. Replace with your
  // booking system's availability. FNV-1a hash of member + date + 30-minute block, with a
  // final mix so neighboring blocks don't fall into a repeating pattern.
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    h ^= h >>> 16; h = Math.imul(h, 2246822507) >>> 0;
    h ^= h >>> 13; h = Math.imul(h, 3266489909) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
  }
  function isBusy(memberId, key, block) { return hash(memberId + '|' + key + '|' + block) % 5 === 0; }
  function memberFree(member, key, start, mins) {
    for (var b = Math.floor(start / 30); b <= Math.floor((start + mins - 1) / 30); b++) {
      if (isBusy(member.id, key, b)) return false;
    }
    return true;
  }
  function hoursFor(date) { return BLOOM.hours[date.getDay()]; }

  // Team members who can do every chosen treatment.
  function eligibleMembers(serviceIds) {
    var cats = {};
    serviceIds.forEach(function (id) { cats[serviceById[id].cat] = true; });
    return BLOOM.team.filter(function (t) {
      return Object.keys(cats).every(function (c) { return t.cats.indexOf(c) !== -1; });
    });
  }

  /**
   * A back-to-back team booking starting at `start`: treatments in menu order, each with the
   * first team member (in BLOOM.team order) who does that category, works that day and is free
   * for the whole treatment. Returns the member ids per treatment, or null if any can't be covered.
   */
  function teamPlan(date, key, serviceIds, start) {
    var ordered = BLOOM.services.filter(function (s) { return serviceIds.indexOf(s.id) !== -1; });
    var cursor = start, plan = [];
    for (var i = 0; i < ordered.length; i++) {
      var s = ordered[i];
      var who = BLOOM.team.filter(function (m) {
        return m.cats.indexOf(s.cat) !== -1 && m.days.indexOf(date.getDay()) !== -1 && memberFree(m, key, cursor, s.mins);
      })[0];
      if (!who) return null;
      plan.push(who.id);
      cursor += s.mins;
    }
    return plan;
  }

  /**
   * Bookable start times for a date. `stylist` is a member id or 'any'.
   * Returns [{ start, member }] where member is who would do it; for a mixed team member is
   * null and `team` lists who does each treatment (see teamPlan).
   */
  function slotsFor(date, serviceIds, stylist, now) {
    var h = hoursFor(date);
    if (!h.open || !serviceIds.length) return [];
    var mins = serviceIds.reduce(function (sum, id) { return sum + serviceById[id].mins; }, 0);
    var open = toMin(h.open), close = toMin(h.close);
    var key = dateKey(date);
    var earliest = open;
    if (dateKey(now) === key) earliest = Math.max(open, Math.ceil((now.getHours() * 60 + now.getMinutes() + 60) / 15) * 15);
    var pool = stylist === 'any' ? eligibleMembers(serviceIds) : [memberById[stylist]];
    pool = pool.filter(function (m) { return m && m.days.indexOf(date.getDay()) !== -1; });
    var team = stylist === 'any' && !eligibleMembers(serviceIds).length;
    if (!team && !pool.length) return [];
    var out = [];
    for (var t = earliest; t + mins <= close; t += 15) {
      if (team) {
        // Treatments span specialists: book a small team back to back, checking each person's schedule.
        var plan = teamPlan(date, key, serviceIds, t);
        if (plan) out.push({ start: t, member: null, team: plan });
        continue;
      }
      for (var i = 0; i < pool.length; i++) {
        if (memberFree(pool[i], key, t, mins)) { out.push({ start: t, member: pool[i].id }); break; }
      }
    }
    return out;
  }

  /* ------------------------------------------------------------------
   * 3. Header
   * ------------------------------------------------------------------ */
  var header = $('#site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = $('#menu-toggle'), menu = $('#mobile-menu');
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
    $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
    header.classList.toggle('menu-open', open);
    document.body.classList.toggle('menu-is-open', open);
  }
  menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
  });
  $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });

  /* ------------------------------------------------------------------
   * 4. Reveal — everything at or above the fold edge is revealed on scroll,
   *    so fast jumps (End key, anchors) never leave content hidden.
   * ------------------------------------------------------------------ */
  var pending = $$('.reveal');
  function show(el) { el.classList.add('is-visible'); }
  if (reduceMotion || !('IntersectionObserver' in window)) {
    pending.forEach(show);
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    pending.forEach(function (el, i) { el.style.transitionDelay = Math.min(i % 4, 3) * 80 + 'ms'; io.observe(el); });
    var revealQueued = false;
    window.addEventListener('scroll', function () {
      if (revealQueued) return;
      revealQueued = true;
      window.requestAnimationFrame(function () {
        revealQueued = false;
        var limit = window.innerHeight * 0.92;
        $$('.reveal:not(.is-visible)').forEach(function (el) {
          if (el.getBoundingClientRect().top < limit) { show(el); io.unobserve(el); }
        });
      });
    }, { passive: true });
  }

  /* ------------------------------------------------------------------
   * 5. Hours
   * ------------------------------------------------------------------ */
  function openStatus(now) {
    var today = BLOOM.hours[now.getDay()];
    var mins = now.getHours() * 60 + now.getMinutes();
    if (today.open && mins >= toMin(today.open) && mins < toMin(today.close)) {
      return { open: true, text: 'Open now · until ' + hhmm(toMin(today.close)) };
    }
    for (var i = 0; i < 8; i++) {
      var d = new Date(now); d.setDate(now.getDate() + i);
      var h = BLOOM.hours[d.getDay()];
      if (!h.open || (i === 0 && mins >= toMin(h.open))) continue;
      var when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAY[d.getDay()];
      return { open: false, text: 'Closed · opens ' + when + ' at ' + hhmm(toMin(h.open)) };
    }
    return { open: false, text: 'Closed' };
  }
  function paintOpen() {
    var status = openStatus(new Date());
    $$('[data-open-now]').forEach(function (el) {
      el.classList.toggle('is-closed', !status.open);
      $('[data-open-text]', el).textContent = status.text;
    });
    var today = new Date().getDay();
    $$('.hours-table tr').forEach(function (tr) {
      var isToday = +tr.getAttribute('data-day') === today;
      tr.classList.toggle('is-today', isToday);
      if (isToday) tr.setAttribute('aria-current', 'date'); else tr.removeAttribute('aria-current');
    });
  }
  paintOpen();
  window.setInterval(paintOpen, 60000);

  /* ------------------------------------------------------------------
   * 6. Before/after slider (a native range input underneath, so it works
   *    with keyboard, touch and screen readers).
   * ------------------------------------------------------------------ */
  $$('[data-ba]').forEach(function (ba) {
    var range = $('[data-ba-range]', ba);
    function update() {
      ba.style.setProperty('--pos', range.value + '%');
      range.setAttribute('aria-valuetext', 'Showing ' + range.value + '% before');
    }
    range.addEventListener('input', update);
    update();
  });

  /* ------------------------------------------------------------------
   * 7. Services filter (?category=hair preselects)
   * ------------------------------------------------------------------ */
  var services = $('[data-services]');
  if (services) {
    var chips = $$('[data-filter]', services);
    var setServiceFilter = function (cat) {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-filter') === cat)); });
      var count = 0;
      $$('[data-service-group]', services).forEach(function (g) {
        var match = cat === 'all' || g.getAttribute('data-service-group') === cat;
        g.hidden = !match;
        if (match) { count += $$('li', g).length; show(g); }
      });
      var label = cat === 'all' ? '' : ' in ' + BLOOM.categories.filter(function (c) { return c.id === cat; })[0].label;
      $('[data-services-count]', services).textContent = count + ' treatment' + (count === 1 ? '' : 's') + label;
    };
    chips.forEach(function (c) { c.addEventListener('click', function () { setServiceFilter(c.getAttribute('data-filter')); }); });
    var wanted = params.get('category');
    if (wanted && BLOOM.categories.some(function (c) { return c.id === wanted; })) setServiceFilter(wanted);
  }

  /* ------------------------------------------------------------------
   * 8. Team filter
   * ------------------------------------------------------------------ */
  var teamWrap = $('[data-team]');
  if (teamWrap) {
    var teamChips = $$('[data-team-filter]', teamWrap);
    teamChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var cat = chip.getAttribute('data-team-filter');
        teamChips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        var n = 0;
        $$('[data-team-member]', teamWrap).forEach(function (card) {
          var match = cat === 'all' || card.getAttribute('data-cats').split(' ').indexOf(cat) !== -1;
          card.hidden = !match;
          if (match) { n++; show(card); }
        });
        $('[data-team-count]', teamWrap).textContent = n + (n === 1 ? ' person' : ' people');
      });
    });
  }

  /* ------------------------------------------------------------------
   * 9. Gallery — filter, saved looks (validated from localStorage) and lightbox
   * ------------------------------------------------------------------ */
  var SAVED_KEY = 'bloom-saved-looks';
  var lookIds = BLOOM.looks.map(function (l) { return l.id; });
  function readSaved() {
    var raw = store.get(SAVED_KEY);
    var list = Array.isArray(raw) ? raw : [];
    var clean = list.filter(function (id, i) { return typeof id === 'string' && lookIds.indexOf(id) !== -1 && list.indexOf(id) === i; });
    if (raw !== null && JSON.stringify(clean) !== JSON.stringify(raw)) store.set(SAVED_KEY, clean);
    return clean;
  }

  var gallery = $('[data-gallery]');
  if (gallery) {
    var saved = readSaved();
    var galleryFilter = 'all', onlySaved = false;
    var items = $$('[data-look]', gallery);
    var dialog = $('[data-lightbox]', gallery);
    var current = 0, opener = null;

    var visibleItems = function () { return items.filter(function (li) { return !li.hidden; }); };
    var paintSaved = function () {
      $$('[data-save]', gallery).forEach(function (b) {
        var on = saved.indexOf(b.getAttribute('data-save')) !== -1;
        b.setAttribute('aria-pressed', String(on));
      });
      $('[data-saved-count]', gallery).textContent = saved.length;
    };
    var applyGallery = function () {
      items.forEach(function (li) {
        var match = (galleryFilter === 'all' || li.getAttribute('data-cat') === galleryFilter) &&
          (!onlySaved || saved.indexOf(li.getAttribute('data-look')) !== -1);
        li.hidden = !match;
        if (match) show(li);
      });
      var n = visibleItems().length;
      $('[data-gallery-count]', gallery).textContent = n + (n === 1 ? ' look' : ' looks');
      $('[data-gallery-empty]', gallery).classList.toggle('hidden', !(onlySaved && n === 0));
    };
    $$('[data-look-filter]', gallery).forEach(function (chip, i, all) {
      chip.addEventListener('click', function () {
        galleryFilter = chip.getAttribute('data-look-filter');
        all.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        applyGallery();
      });
    });
    $('[data-saved-toggle]', gallery).addEventListener('click', function (e) {
      onlySaved = !onlySaved;
      e.currentTarget.setAttribute('aria-pressed', String(onlySaved));
      applyGallery();
    });
    $$('[data-save]', gallery).forEach(function (b) {
      b.addEventListener('click', function () {
        var id = b.getAttribute('data-save');
        saved = saved.indexOf(id) === -1 ? saved.concat(id) : saved.filter(function (x) { return x !== id; });
        store.set(SAVED_KEY, saved);
        paintSaved();
        if (onlySaved) applyGallery();
      });
    });
    window.addEventListener('storage', function (e) { if (e.key === SAVED_KEY) { saved = readSaved(); paintSaved(); applyGallery(); } });

    var showLook = function (i) {
      var list = visibleItems();
      current = (i + list.length) % list.length;
      var look = BLOOM.looks[+$('[data-look-open]', list[current]).getAttribute('data-look-open')];
      var member = memberById[look.by];
      var img = $('[data-lightbox-img]', dialog);
      img.src = 'assets/img/looks/' + look.id + '.svg';
      img.alt = look.title + ' by ' + member.name;
      $('[data-lightbox-title]', dialog).textContent = look.title;
      $('[data-lightbox-by]', dialog).textContent = 'by ' + member.name;
      $('[data-lightbox-cat]', dialog).textContent = BLOOM.lookCategories.filter(function (c) { return c.id === look.cat; })[0].label;
      $('[data-lightbox-index]', dialog).textContent = current + 1;
      $('[data-lightbox-total]', dialog).textContent = list.length;
      var book = $('[data-lightbox-book]', dialog);
      book.href = 'book.html?stylist=' + member.id;
      book.textContent = 'Book with ' + member.name.split(' ')[0];
    };
    $$('[data-look-open]', gallery).forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        showLook(visibleItems().indexOf(btn.closest('[data-look]')));
        dialog.showModal();
      });
    });
    $('[data-lightbox-prev]', dialog).addEventListener('click', function () { showLook(current - 1); });
    $('[data-lightbox-next]', dialog).addEventListener('click', function () { showLook(current + 1); });
    $('[data-lightbox-close]', dialog).addEventListener('click', function () { dialog.close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); showLook(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); showLook(current + 1); }
    });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    dialog.addEventListener('close', function () { if (opener) opener.focus(); });

    paintSaved();
    applyGallery();
  }

  /* ------------------------------------------------------------------
   * 10. Booking wizard. Connect the final step to your booking system
   *     (see the comment in confirm()).
   * ------------------------------------------------------------------ */
  var DETAILS_KEY = 'bloom-details';
  function readDetails() {
    var raw = store.get(DETAILS_KEY);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) { if (raw !== null) store.remove(DETAILS_KEY); return null; }
    var ok = function (v, max) { return typeof v === 'string' && v.length <= max ? v : ''; };
    var details = { name: ok(raw.name, 80), email: ok(raw.email, 120), phone: ok(raw.phone, 30) };
    if (details.email && !EMAIL.test(details.email)) details.email = '';
    if (!details.name && !details.email && !details.phone) { store.remove(DETAILS_KEY); return null; }
    return details;
  }

  var booking = $('[data-booking]');
  if (booking) {
    var form = $('#booking-form', booking);
    var state = { step: 1, stylist: 'any', date: null, slot: null, member: null };
    var stepEls = $$('[data-step]', form);
    var back = $('[data-back]', form), next = $('[data-next]', form);
    var selected = function () { return $$('input[name="services"]:checked', form).map(function (i) { return i.value; }); };
    var totalMins = function () { return selected().reduce(function (s, id) { return s + serviceById[id].mins; }, 0); };
    var setError = function (name, msg) {
      var el = $('[data-error="' + name + '"]', form);
      if (el) el.textContent = msg || '';
      var input = form.elements[name];
      if (input && input.setAttribute) { if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
    };

    var preService = params.get('service');
    if (preService && hasOwn(serviceById, preService)) form.querySelector('input[value="' + CSS.escape(preService) + '"]').checked = true;
    var preStylist = params.get('stylist');
    if (preStylist && hasOwn(memberById, preStylist)) state.stylist = preStylist;

    var remembered = readDetails();
    if (remembered) {
      form.elements.name.value = remembered.name;
      form.elements.email.value = remembered.email;
      form.elements.phone.value = remembered.phone;
      form.elements.remember.checked = true;
    }

    var levelForSummary = function () {
      if (state.member) return memberById[state.member].level;
      if (state.stylist !== 'any') return memberById[state.stylist].level;
      return null;
    };

    var paintSummary = function () {
      var ids = selected();
      var level = levelForSummary();
      var list = $('[data-summary-items]', booking);
      list.innerHTML = ids.length ? ids.map(function (id) {
        var s = serviceById[id];
        var scaled = s.cat === 'hair' || s.cat === 'colour';
        return '<li class="flex justify-between gap-4"><span>' + esc(s.name) + '</span><span>' + (scaled && !level ? 'from ' : '') + money(priceFor(s, level)) + '</span></li>';
      }).join('') : '<li class="text-mute">No treatments chosen yet.</li>';
      var who = state.member ? memberById[state.member].name : state.stylist === 'any' ? 'Anyone available' : memberById[state.stylist].name;
      $('[data-summary-stylist]', booking).textContent = who;
      $('[data-summary-when]', booking).textContent = state.date && state.slot !== null ? longDate(state.date) + ', ' + hhmm(state.slot) : 'Not chosen';
      $('[data-summary-duration]', booking).textContent = duration(totalMins());
      var total = ids.reduce(function (sum, id) { return sum + priceFor(serviceById[id], level); }, 0);
      var approx = !level && ids.some(function (id) { var c = serviceById[id].cat; return c === 'hair' || c === 'colour'; });
      $('[data-summary-total]', booking).textContent = (approx ? 'from ' : '') + money(total);
    };

    var renderStylists = function () {
      var ids = selected();
      var eligible = eligibleMembers(ids);
      if (state.stylist !== 'any' && !eligible.some(function (m) { return m.id === state.stylist; })) state.stylist = 'any';
      var help = $('[data-stylist-help]', form);
      help.textContent = eligible.length
        ? 'Everyone below can do all of your treatments. Hair and color prices depend on level.'
        : 'Your treatments need more than one specialist, so we\'ll book a small team back to back.';
      var options = [{ id: 'any', name: eligible.length ? 'Anyone available' : 'Best available team', meta: eligible.length ? 'Fastest way to get a time' : 'Specialists for each treatment' }]
        .concat(eligible.map(function (m) { return { id: m.id, name: m.name, meta: m.role + ' · ' + levelById[m.level].label }; }));
      $('[data-stylist-list]', form).innerHTML = options.map(function (o) {
        var avatar = o.id === 'any'
          ? '<span class="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-blush font-display text-xl text-plum" aria-hidden="true">✿</span>'
          : '<img src="assets/img/team/' + o.id + '.svg" alt="" width="48" height="48" class="h-12 w-12 shrink-0 rounded-full object-cover">';
        return '<li><label class="option"><input type="radio" name="stylist" value="' + o.id + '" class="option-input"' + (state.stylist === o.id ? ' checked' : '') +
          '><span class="option-body flex-row items-center gap-4">' + avatar + '<span><span class="block font-medium">' + esc(o.name) + '</span><span class="block text-sm text-mute">' + esc(o.meta) + '</span></span></span></label></li>';
      }).join('');
      $$('input[name="stylist"]', form).forEach(function (r) {
        r.addEventListener('change', function () { state.stylist = r.value; state.slot = null; state.member = null; paintSummary(); });
      });
    };

    var renderDates = function () {
      var ids = selected(), now = new Date();
      var list = $('[data-date-list]', form);
      var html = '', firstOpen = null;
      for (var i = 0; i < 21; i++) {
        var d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
        var available = slotsFor(d, ids, state.stylist, now).length > 0;
        if (available && !firstOpen) firstOpen = d;
        var selectedDay = state.date && dateKey(state.date) === dateKey(d);
        html += '<button type="button" class="date-btn" data-date="' + dateKey(d) + '" aria-pressed="' + Boolean(selectedDay) + '"' + (available ? '' : ' disabled') +
          ' aria-label="' + longDate(d) + (available ? '' : ', unavailable') + '"><span class="text-xs uppercase tracking-[0.14em]">' + DAY[d.getDay()] +
          '</span><span class="font-display text-xl">' + d.getDate() + '</span><span class="text-xs">' + MONTH[d.getMonth()] + '</span></button>';
      }
      list.innerHTML = html;
      if (!state.date || $('[data-date="' + dateKey(state.date) + '"]', list).disabled) { state.date = firstOpen; state.slot = null; state.member = null; }
      $$('[data-date]', list).forEach(function (b) {
        b.setAttribute('aria-pressed', String(Boolean(state.date) && b.getAttribute('data-date') === dateKey(state.date)));
        b.addEventListener('click', function () {
          var p = b.getAttribute('data-date').split('-');
          state.date = new Date(+p[0], +p[1] - 1, +p[2]); state.slot = null; state.member = null;
          renderDates(); paintSummary();
        });
      });
      renderSlots();
    };

    var renderSlots = function () {
      var box = $('[data-slot-list]', form);
      var empty = $('[data-slot-empty]', form);
      if (!state.date) { box.innerHTML = ''; empty.hidden = false; return; }
      var slots = slotsFor(state.date, selected(), state.stylist, new Date());
      $('[data-slot-heading]', form).textContent = 'Available times on ' + longDate(state.date);
      empty.hidden = slots.length > 0;
      box.innerHTML = slots.map(function (s) {
        return '<button type="button" class="slot" data-slot="' + s.start + '" data-member="' + (s.member || '') + '" aria-pressed="' + (state.slot === s.start) + '">' + hhmm(s.start) + '</button>';
      }).join('');
      $$('[data-slot]', box).forEach(function (b) {
        b.addEventListener('click', function () {
          state.slot = +b.getAttribute('data-slot');
          state.member = b.getAttribute('data-member') || null;
          $$('[data-slot]', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          setError('slot', '');
          paintSummary();
        });
      });
    };

    var renderReview = function () {
      var ids = selected();
      var who = state.member ? memberById[state.member].name : (state.stylist === 'any' ? 'Best available team' : memberById[state.stylist].name);
      var rows = [
        ['Treatments', ids.map(function (id) { return serviceById[id].name; }).join(', '), 1],
        ['With', who, 2],
        ['When', longDate(state.date) + ' at ' + hhmm(state.slot) + ' (' + duration(totalMins()) + ')', 3],
        ['Your details', form.elements.name.value.trim() + ', ' + form.elements.email.value.trim() + ', ' + form.elements.phone.value.trim(), 4]
      ];
      $('[data-review]', form).innerHTML = rows.map(function (r) {
        return '<div class="grid gap-1 py-4 sm:grid-cols-[9rem_1fr_auto] sm:items-baseline sm:gap-4"><dt class="text-sm text-mute">' + r[0] + '</dt><dd class="min-w-0 break-words">' +
          esc(r[1]) +
          '</dd><dd><button type="button" class="text-link text-sm" data-goto="' + r[2] + '">Change<span class="sr-only"> ' + r[0].toLowerCase() + '</span></button></dd></div>';
      }).join('');
      $$('[data-goto]', form).forEach(function (b) { b.addEventListener('click', function () { go(+b.getAttribute('data-goto')); }); });
    };

    var go = function (n) {
      state.step = n;
      stepEls.forEach(function (s) { s.hidden = +s.getAttribute('data-step') !== n; });
      $$('[data-step-indicator]', booking).forEach(function (li) {
        var i = +li.getAttribute('data-step-indicator');
        if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        li.classList.toggle('is-done', i < n);
      });
      back.hidden = n === 1;
      next.textContent = n === 5 ? 'Confirm booking' : 'Continue';
      if (n === 2) renderStylists();
      if (n === 3) renderDates();
      if (n === 5) renderReview();
      var title = $('#step-' + n + '-title', form);
      var top = booking.getBoundingClientRect().top + window.scrollY - 100;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      title.focus({ preventScroll: true });
    };

    var validate = function (n) {
      if (n === 1) {
        var none = selected().length === 0;
        setError('services', none ? 'Choose at least one treatment to continue.' : '');
        return !none;
      }
      if (n === 3) {
        if (state.slot === null) { setError('slot', 'Choose a time to continue.'); return false; }
        return true;
      }
      if (n === 4) {
        var f = form.elements, ok = true, first = null;
        var check = function (name, msg) { setError(name, msg); if (msg) { ok = false; first = first || f[name]; } };
        var name = f.name.value.trim(), email = f.email.value.trim(), phone = f.phone.value.replace(/[\s()+-]/g, '');
        check('name', name.length < 2 ? 'Please enter your full name.' : '');
        check('email', !email ? 'Please enter your email address.' : !EMAIL.test(email) ? 'Enter an email like name@example.com.' : '');
        check('phone', !phone ? 'Please enter a cell phone number.' : !/^\d{10,15}$/.test(phone) ? 'Enter a valid cell phone number (10 to 15 digits).' : '');
        check('policy', f.policy.checked ? '' : 'Please agree to the cancellation policy.');
        if (first) first.focus();
        return ok;
      }
      return true;
    };

    var confirm = function () {
      // Demo only. Send { services, stylist, date, time, details } to your booking system here.
      var f = form.elements;
      if (f.remember.checked) store.set(DETAILS_KEY, { name: f.name.value.trim(), email: f.email.value.trim(), phone: f.phone.value.trim() });
      else store.remove(DETAILS_KEY);
      var done = $('[data-booking-done]', booking);
      var who = state.member ? ' with ' + memberById[state.member].name.split(' ')[0] : '';
      $('[data-done-name]', done).textContent = f.name.value.trim().split(' ')[0];
      $('[data-done-summary]', done).textContent = selected().map(function (id) { return serviceById[id].name; }).join(', ') + who + ' on ' + longDate(state.date) + ' at ' + hhmm(state.slot) + '.';
      $('[data-done-ref]', done).textContent = makeRef();
      $('[data-done-email]', done).textContent = f.email.value.trim();
      $('.steps', booking).hidden = true;
      $('[data-booking-main]', booking).hidden = true;
      done.hidden = false;
      done.focus();
    };

    form.addEventListener('change', function (e) {
      if (e.target.name === 'services') { setError('services', ''); state.slot = null; state.member = null; state.date = null; paintSummary(); }
    });
    form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid')) setError(e.target.name, ''); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(state.step)) {
        if (state.step === 1) $('input[name="services"]', form).focus();
        return;
      }
      if (state.step === 5) confirm(); else go(state.step + 1);
    });
    back.addEventListener('click', function () { go(state.step - 1); });
    $('[data-restart]', booking).addEventListener('click', function () {
      form.reset();
      if (remembered || store.get(DETAILS_KEY)) {
        var d = readDetails();
        if (d) { form.elements.name.value = d.name; form.elements.email.value = d.email; form.elements.phone.value = d.phone; form.elements.remember.checked = true; }
      }
      state = { step: 1, stylist: 'any', date: null, slot: null, member: null };
      $('.steps', booking).hidden = false;
      $('[data-booking-main]', booking).hidden = false;
      $('[data-booking-done]', booking).hidden = true;
      paintSummary();
      go(1);
    });
    paintSummary();
  }

  /* ------------------------------------------------------------------
   * 11. Gift cards
   * ------------------------------------------------------------------ */
  var giftWrap = $('[data-gift]');
  if (giftWrap) {
    var gForm = $('#gift-form', giftWrap);
    var preview = $('[data-gift-preview]', giftWrap);
    var gf = gForm.elements;
    var designLabel = {}; BLOOM.giftDesigns.forEach(function (d) { designLabel[d.id] = d.label; });
    var todayKey = dateKey(new Date());
    var maxDate = new Date(); maxDate.setFullYear(maxDate.getFullYear() + 1);
    gf.date.min = todayKey; gf.date.max = dateKey(maxDate);

    var GIFT_MIN = 25, GIFT_MAX = 500; // custom amount limits (also the custom field's min and max)
    var amount = function () {
      var v = gForm.querySelector('input[name="amount"]:checked').value;
      if (v !== 'custom') return +v;
      var n = Number(gf.custom.value);
      return Number.isInteger(n) && n >= GIFT_MIN && n <= GIFT_MAX ? n : null;
    };
    var setGErr = function (name, msg) {
      var el = $('[data-error="' + name + '"]', gForm);
      el.textContent = msg || '';
      if (msg) gf[name].setAttribute('aria-invalid', 'true'); else gf[name].removeAttribute('aria-invalid');
    };
    var paintGift = function () {
      var custom = gForm.querySelector('input[name="amount"]:checked').value === 'custom';
      $('[data-custom-wrap]', gForm).hidden = !custom;
      $('[data-date-wrap]', gForm).hidden = gForm.querySelector('input[name="delivery"]:checked').value !== 'later';
      var a = amount();
      var design = gForm.querySelector('input[name="design"]:checked').value;
      preview.className = 'gift-card gift-card-lg gift-' + design;
      $('[data-preview-amount]', preview).textContent = a ? money(a) : noAmount();
      var to = gf.to.value.trim(), from = gf.from.value.trim(), msg = gf.message.value.trim();
      $('[data-preview-to]', preview).textContent = 'For ' + (to || 'someone special');
      $('[data-preview-message]', preview).textContent = msg || 'Your message will appear here.';
      $('[data-preview-from]', preview).textContent = 'From ' + (from || 'you');
      $('[data-preview-desc]', giftWrap).textContent = designLabel[design] + ' design, ' + (a ? money(a) : 'no amount yet') + ' gift card for ' + (to || 'someone special') + '.';
      $('[data-gift-total]', gForm).textContent = a ? money(a) : noAmount();
      var left = 160 - gf.message.value.length;
      $('[data-message-count]', gForm).textContent = left + ' character' + (left === 1 ? '' : 's') + ' left';
    };
    gForm.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid')) setGErr(e.target.name, '');
      paintGift();
    });
    gForm.addEventListener('change', paintGift);
    gForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var first = null;
      var check = function (name, msg) { setGErr(name, msg); if (msg && !first) first = gf[name]; };
      var custom = gForm.querySelector('input[name="amount"]:checked').value === 'custom';
      check('custom', custom && amount() === null ? 'Enter a whole amount from ' + money(GIFT_MIN) + ' to ' + money(GIFT_MAX) + '.' : '');
      check('to', gf.to.value.trim() ? '' : "Enter the recipient's name.");
      var te = gf.toEmail.value.trim();
      check('toEmail', !te ? "Enter the recipient's email." : !EMAIL.test(te) ? 'Enter an email like name@example.com.' : '');
      check('from', gf.from.value.trim() ? '' : 'Enter your name.');
      var me = gf.email.value.trim();
      check('email', !me ? 'Enter your email for the receipt.' : !EMAIL.test(me) ? 'Enter an email like name@example.com.' : '');
      var later = gForm.querySelector('input[name="delivery"]:checked').value === 'later';
      var d = gf.date.value;
      check('date', later && (!d || d < todayKey || d > gf.date.max) ? 'Choose a date within the next year.' : '');
      if (first) { first.focus(); return; }
      // Demo only: create a payment session with your provider (e.g. Stripe Checkout) here.
      var code = 'BLOOM-' + Math.random().toString(36).slice(2, 6).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      var doneBox = $('[data-gift-done]', giftWrap);
      $('[data-gift-code]', doneBox).textContent = code;
      $('[data-gift-done-text]', doneBox).textContent = 'We\'ll email your ' + money(amount()) + ' ' + designLabel[gForm.querySelector('input[name="design"]:checked').value] +
        ' card to ' + gf.to.value.trim() + ' (' + te + ')' + (later ? ' on ' + longDate(new Date(d + 'T12:00:00')) : ' right away') + ', and a receipt to you.';
      $('[data-gift-ref]', doneBox).textContent = makeRef();
      doneBox.hidden = false;
      doneBox.focus();
    });
    paintGift();
  }

  /* ------------------------------------------------------------------
   * 12. Forms — contact (?topic=careers preselects) and newsletter. Demo only:
   *     post the data to your inbox or form service (e.g. Formspree) where noted.
   * ------------------------------------------------------------------ */
  var contact = $('#contact-form');
  if (contact) {
    var topic = params.get('topic');
    // Compare values instead of building a selector from the URL (a " in ?topic= would break it).
    if (topic && $$('option', contact.elements.topic).some(function (o) { return o.value === topic; })) contact.elements.topic.value = topic;
    var cErr = function (name, msg) {
      $('[data-error="' + name + '"]', contact).textContent = msg || '';
      if (msg) contact.elements[name].setAttribute('aria-invalid', 'true'); else contact.elements[name].removeAttribute('aria-invalid');
    };
    contact.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid')) cErr(e.target.name, ''); });
    contact.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = contact.elements, first = null;
      var check = function (name, msg) { cErr(name, msg); if (msg && !first) first = f[name]; };
      check('name', f.name.value.trim().length < 2 ? 'Please enter your name.' : '');
      var email = f.email.value.trim();
      check('email', !email ? 'Please enter your email.' : !EMAIL.test(email) ? 'Enter an email like name@example.com.' : '');
      check('message', f.message.value.trim().length < 20 ? 'Please write at least 20 characters.' : '');
      if (first) { first.focus(); return; }
      // Send new FormData(contact) to your endpoint here.
      contact.reset();
      var ok = $('[data-form-success]', contact);
      $('[data-form-ref]', ok).textContent = makeRef();
      ok.hidden = false;
      ok.focus();
    });
  }

  $$('[data-newsletter]').forEach(function (nf) {
    nf.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = nf.elements.email, err = $('[data-error="email"]', nf), v = input.value.trim();
      var msg = !v ? 'Please enter your email.' : !EMAIL.test(v) ? 'Enter an email like name@example.com.' : '';
      err.textContent = msg;
      if (msg) { input.setAttribute('aria-invalid', 'true'); input.focus(); return; }
      input.removeAttribute('aria-invalid');
      nf.reset();
      $('[data-newsletter-success]', nf).hidden = false;
    });
  });
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

/* ---------- Footer year ----------
   The copyright year in the footer (<span data-year>) is this year, so it never goes stale. */
(function () {
  'use strict';
  Array.prototype.forEach.call(document.querySelectorAll('[data-year]'), function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
