/* Fade Bros. Barber Co. — all template JavaScript. Vanilla, no dependencies.
 *
 *  1. Data            shops, hours, services, barbers, traffic model, products (edit here)
 *  2. Helpers         DOM, storage, money, shop-local time (America/Chicago) and dates
 *  3. Header          sticky shadow, accessible mobile menu and the bag count
 *  4. Reveal          fade content in as it scrolls into view
 *  5. Open now        per-shop "Open / Closed" badges, today's hours and hours tables
 *  6. Wait estimate   illustrative walk-in wait per shop (demo traffic model)
 *  7. Services        category filter
 *  8. Barbers         shop + specialty filters and "next free" times
 *  9. Booking         five-step booking flow with calendar, time slots and .ics
 * 10. Bag             products, gift cards, delivery and demo checkout (localStorage)
 * 11. Gift cards      builder with live preview that adds to the bag
 * 12. Forms           contact and newsletter forms
 * 13. Back to top     (separate block at the end of the file)
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Data — edit shops, hours, services, barbers and products here.
   *    Times are "HH:MM" in the shop's time zone (FADE.shop.timeZone).
   *    Weekday indexes: 0 = Sunday … 6 = Saturday.
   * ------------------------------------------------------------------ */
  var FADE = {
    "shop": {
      "name": "Fade Bros. Barber Co.",
      "short": "Fade Bros.",
      "email": "chairs@fadebros.example",
      "founded": 2012,
      "city": "Chicago",
      "timeZone": "America/Chicago",
      "zoneLabel": "Chicago time (CT)",
      "currency": "USD",
      "locale": "en-US"
    },
    "locations": [
      {
        "id": "logan",
        "name": "Logan Square",
        "street": "2741 N Milwaukee Ave",
        "city": "Chicago, IL 60647",
        "phone": "(773) 555-0142",
        "phoneHref": "+17735550142",
        "chairs": 6,
        "opened": 2012,
        "hours": [
          [
            "10:00",
            "16:00"
          ],
          [
            "10:00",
            "19:00"
          ],
          [
            "09:00",
            "20:00"
          ],
          [
            "09:00",
            "20:00"
          ],
          [
            "09:00",
            "20:00"
          ],
          [
            "09:00",
            "20:00"
          ],
          [
            "08:00",
            "17:00"
          ]
        ],
        "transit": "Blue Line to Logan Square, then a two-minute walk south on Milwaukee. Buses 56 and 76 stop at the corner.",
        "parking": "Metered parking on Milwaukee Ave and free side-street parking on Albany Ave. Bike racks right outside.",
        "note": "The original shop: six chairs, a 1950s Koken chair in the window and the record player that never stops.",
        "directions": "https://www.google.com/maps/search/?api=1&query=2741+N+Milwaukee+Ave+Chicago+IL"
      },
      {
        "id": "pilsen",
        "name": "Pilsen",
        "street": "1532 W 18th St",
        "city": "Chicago, IL 60608",
        "phone": "(312) 555-0187",
        "phoneHref": "+13125550187",
        "chairs": 4,
        "opened": 2019,
        "hours": [
          [
            "10:00",
            "15:00"
          ],
          null,
          [
            "10:00",
            "20:00"
          ],
          [
            "10:00",
            "20:00"
          ],
          [
            "10:00",
            "20:00"
          ],
          [
            "10:00",
            "20:00"
          ],
          [
            "09:00",
            "18:00"
          ]
        ],
        "transit": "Pink Line to 18th, then three minutes east on 18th St. Buses 9 and 18 stop half a block away.",
        "parking": "Free two-hour parking on Laflin St and four spaces in the lot behind the shop (enter from the alley).",
        "note": "Our second home: four chairs under a hand-painted mural by local artist Mariela Ruiz.",
        "directions": "https://www.google.com/maps/search/?api=1&query=1532+W+18th+St+Chicago+IL"
      }
    ],
    "categories": [
      {
        "id": "cuts",
        "label": "Cuts",
        "blurb": "Every cut includes a consultation, a hot towel and a neck shave with a straight razor."
      },
      {
        "id": "beard",
        "label": "Beard",
        "blurb": "Shaped by hand with clippers, scissors and a straight-razor edge. Finished with oil or balm."
      },
      {
        "id": "shaves",
        "label": "Shaves",
        "blurb": "The full ritual: hot towels, pre-shave oil, warm lather and two passes with a fresh blade."
      },
      {
        "id": "kids",
        "label": "Kids",
        "blurb": "For 12 and under. Patient barbers, a booster seat and a lollipop for the brave."
      },
      {
        "id": "packages",
        "label": "Packages",
        "blurb": "Our most-booked combinations, priced a little lower than booking them one by one."
      }
    ],
    "services": [
      {
        "id": "fade",
        "cat": "cuts",
        "name": "The Fade",
        "mins": 45,
        "price": 45,
        "desc": "Skin, low, mid or high. Blended by hand, finished with a razor line-up.",
        "popular": true
      },
      {
        "id": "classic",
        "cat": "cuts",
        "name": "Classic cut",
        "mins": 40,
        "price": 40,
        "desc": "Clipper and scissor cut, taper at the neck. Tidy at work, easy at home."
      },
      {
        "id": "scissor",
        "cat": "cuts",
        "name": "Scissor cut",
        "mins": 60,
        "price": 52,
        "desc": "All-scissor work for longer hair, pompadours and textured crops."
      },
      {
        "id": "curly",
        "cat": "cuts",
        "name": "Curly & textured cut",
        "mins": 60,
        "price": 52,
        "desc": "Cut dry, curl by curl, so your shape works the way your hair actually grows."
      },
      {
        "id": "buzz",
        "cat": "cuts",
        "name": "Buzz cut",
        "mins": 20,
        "price": 25,
        "desc": "One guard all over, cleaned-up edges and a hot towel."
      },
      {
        "id": "lineup",
        "cat": "cuts",
        "name": "Line-up",
        "mins": 15,
        "price": 20,
        "desc": "Sharp hairline, temples and neck between cuts. No full cut."
      },
      {
        "id": "design",
        "cat": "cuts",
        "name": "Hair design add-on",
        "mins": 15,
        "price": 15,
        "desc": "Hard part, stripes or freehand art. Add it to any cut."
      },
      {
        "id": "beard-trim",
        "cat": "beard",
        "name": "Beard trim",
        "mins": 20,
        "price": 22,
        "desc": "Length, shape and a clean neckline. Finished with beard oil."
      },
      {
        "id": "beard-sculpt",
        "cat": "beard",
        "name": "Hot towel beard sculpt",
        "mins": 30,
        "price": 34,
        "desc": "A full reshape with hot towels and straight-razor cheek and neck lines.",
        "popular": true
      },
      {
        "id": "beard-gray",
        "cat": "beard",
        "name": "Gray blending",
        "mins": 30,
        "price": 35,
        "desc": "Softens gray in the beard without looking dyed. Lasts four to six weeks."
      },
      {
        "id": "hot-shave",
        "cat": "shaves",
        "name": "Hot towel shave",
        "mins": 45,
        "price": 48,
        "desc": "Three hot towels, warm lather, two passes with a straight razor, cold towel and tonic.",
        "popular": true
      },
      {
        "id": "head-shave",
        "cat": "shaves",
        "name": "Head shave",
        "mins": 30,
        "price": 38,
        "desc": "Smooth straight-razor head shave with hot towels and a soothing balm."
      },
      {
        "id": "kids",
        "cat": "kids",
        "name": "Kids cut",
        "mins": 30,
        "price": 28,
        "desc": "Any style for 12 and under. Cartoons on request."
      },
      {
        "id": "first-cut",
        "cat": "kids",
        "name": "First haircut",
        "mins": 30,
        "price": 32,
        "desc": "A gentle first cut, a certificate and a lock of hair to keep."
      },
      {
        "id": "cut-beard",
        "cat": "packages",
        "needs": [
          "cuts",
          "beard"
        ],
        "name": "Cut & beard",
        "mins": 60,
        "price": 60,
        "desc": "Any cut plus a full beard trim. Our most-booked pair.",
        "popular": true
      },
      {
        "id": "full-service",
        "cat": "packages",
        "needs": [
          "cuts",
          "shaves"
        ],
        "name": "The Full Service",
        "mins": 90,
        "price": 92,
        "desc": "Any cut, a hot towel shave, a face massage and a cold beer or coffee."
      },
      {
        "id": "dad-kid",
        "cat": "packages",
        "needs": [
          "cuts",
          "kids"
        ],
        "name": "Father & kid",
        "mins": 60,
        "price": 64,
        "desc": "Two cuts back to back in the same chair. Any grown-up counts."
      }
    ],
    "specialties": [
      {
        "id": "fades",
        "label": "Fades & tapers"
      },
      {
        "id": "scissor",
        "label": "Scissor work"
      },
      {
        "id": "curly",
        "label": "Curly & textured"
      },
      {
        "id": "beards",
        "label": "Beards & shaves"
      },
      {
        "id": "kids",
        "label": "Kids"
      }
    ],
    "barbers": [
      {
        "id": "marcus",
        "short": "Marcus",
        "name": "Marcus Okafor",
        "role": "Co-founder · Master barber",
        "years": 16,
        "skills": [
          "cuts",
          "beard",
          "shaves",
          "kids"
        ],
        "specialties": [
          "fades",
          "beards"
        ],
        "bio": "Opened the Logan Square shop in 2012 with his brother Danny after ten years in his uncle’s chair on 79th Street. Known for skin fades so smooth they look airbrushed.",
        "signature": "Skin fade with a razor line-up",
        "schedule": {
          "logan": {
            "2": [
              "09:00",
              "17:00"
            ],
            "3": [
              "09:00",
              "17:00"
            ],
            "4": [
              "11:00",
              "20:00"
            ],
            "5": [
              "09:00",
              "17:00"
            ],
            "6": [
              "08:00",
              "15:00"
            ]
          }
        }
      },
      {
        "id": "danny",
        "short": "Danny",
        "name": "Danny Okafor",
        "role": "Co-founder · Master barber",
        "years": 14,
        "skills": [
          "cuts",
          "beard",
          "shaves"
        ],
        "specialties": [
          "beards",
          "scissor"
        ],
        "bio": "Runs the Pilsen shop and the straight-razor training for every new barber. If you have never had a proper hot towel shave, book Danny.",
        "signature": "The Full Service",
        "schedule": {
          "pilsen": {
            "2": [
              "10:00",
              "18:00"
            ],
            "3": [
              "10:00",
              "18:00"
            ],
            "4": [
              "10:00",
              "18:00"
            ],
            "5": [
              "12:00",
              "20:00"
            ],
            "6": [
              "09:00",
              "17:00"
            ]
          }
        }
      },
      {
        "id": "rosa",
        "short": "Rosa",
        "name": "Rosa Delgado",
        "role": "Senior barber",
        "years": 9,
        "skills": [
          "cuts",
          "beard",
          "kids"
        ],
        "specialties": [
          "curly",
          "fades"
        ],
        "bio": "Trained in Monterrey and Chicago. Cuts curls dry so they sit right, and does freehand designs that people stop her on the street to ask about.",
        "signature": "Curly cut with a burst fade",
        "schedule": {
          "pilsen": {
            "0": [
              "10:00",
              "15:00"
            ],
            "3": [
              "12:00",
              "20:00"
            ],
            "4": [
              "12:00",
              "20:00"
            ],
            "5": [
              "10:00",
              "18:00"
            ],
            "6": [
              "09:00",
              "18:00"
            ]
          }
        }
      },
      {
        "id": "jae",
        "short": "Jae",
        "name": "Jae-won Park",
        "role": "Barber",
        "years": 6,
        "skills": [
          "cuts",
          "beard"
        ],
        "specialties": [
          "scissor",
          "fades"
        ],
        "bio": "The person to see for longer hair, two-block cuts and textured crops. Explains exactly how to style it so it looks the same at home.",
        "signature": "Scissor-cut textured crop",
        "schedule": {
          "logan": {
            "0": [
              "10:00",
              "16:00"
            ],
            "2": [
              "12:00",
              "20:00"
            ],
            "3": [
              "12:00",
              "20:00"
            ],
            "4": [
              "12:00",
              "20:00"
            ],
            "5": [
              "12:00",
              "20:00"
            ]
          }
        }
      },
      {
        "id": "tariq",
        "short": "Tariq",
        "name": "Tariq Bell",
        "role": "Barber",
        "years": 7,
        "skills": [
          "cuts",
          "beard",
          "kids"
        ],
        "specialties": [
          "fades",
          "kids"
        ],
        "bio": "Splits his week between both shops. Fast, precise fades and the calmest hands in the building for nervous first-timers and little ones.",
        "signature": "Low taper with a hard part",
        "schedule": {
          "logan": {
            "1": [
              "10:00",
              "19:00"
            ],
            "3": [
              "09:00",
              "17:00"
            ],
            "6": [
              "08:00",
              "17:00"
            ]
          },
          "pilsen": {
            "0": [
              "10:00",
              "15:00"
            ],
            "2": [
              "12:00",
              "20:00"
            ],
            "4": [
              "10:00",
              "18:00"
            ]
          }
        }
      },
      {
        "id": "hal",
        "short": "Hal",
        "name": "Hollis “Hal” Brennan",
        "role": "Master barber",
        "years": 34,
        "skills": [
          "cuts",
          "beard",
          "shaves",
          "kids"
        ],
        "specialties": [
          "scissor",
          "beards"
        ],
        "bio": "Has been cutting hair on the Northwest Side since 1992. Flat tops, side parts, hot shaves and stories about every Cubs season since.",
        "signature": "Side part and hot towel shave",
        "schedule": {
          "logan": {
            "2": [
              "09:00",
              "15:00"
            ],
            "4": [
              "09:00",
              "15:00"
            ],
            "5": [
              "09:00",
              "17:00"
            ],
            "6": [
              "08:00",
              "14:00"
            ]
          }
        }
      }
    ],
    "traffic": {
      "weekday": {
        "9": 0.25,
        "10": 0.3,
        "11": 0.45,
        "12": 0.75,
        "13": 0.65,
        "14": 0.4,
        "15": 0.45,
        "16": 0.6,
        "17": 0.9,
        "18": 1,
        "19": 0.7
      },
      "saturday": {
        "8": 0.55,
        "9": 0.85,
        "10": 1,
        "11": 1,
        "12": 0.9,
        "13": 0.8,
        "14": 0.65,
        "15": 0.55,
        "16": 0.4,
        "17": 0.3
      },
      "sunday": {
        "10": 0.5,
        "11": 0.65,
        "12": 0.7,
        "13": 0.6,
        "14": 0.45,
        "15": 0.35
      }
    },
    "products": [
      {
        "id": "matte-clay",
        "name": "Matte Clay",
        "size": "2 oz",
        "price": 22,
        "kind": "tin",
        "cat": "hair",
        "color": "#1d3557",
        "label": "#f2ead9",
        "desc": "Strong hold, zero shine. Works into dry hair and restyles with a splash of water."
      },
      {
        "id": "pomade",
        "name": "Shop Pomade",
        "size": "3.4 oz",
        "price": 20,
        "kind": "tin",
        "cat": "hair",
        "color": "#c42b1f",
        "label": "#f2ead9",
        "desc": "Water-based, medium shine. The one we use for side parts and pompadours."
      },
      {
        "id": "sea-salt",
        "name": "Sea Salt Spray",
        "size": "6.8 fl oz",
        "price": 18,
        "kind": "spray",
        "cat": "hair",
        "color": "#2f6b6b",
        "label": "#f2ead9",
        "desc": "Light texture and volume for curls and longer crops. Spray into damp hair."
      },
      {
        "id": "beard-oil",
        "name": "Beard Oil",
        "size": "1 fl oz",
        "price": 19,
        "kind": "dropper",
        "cat": "beard",
        "color": "#7a4a1e",
        "label": "#f2ead9",
        "desc": "Cedar and clove. Softens the beard and stops the itch. Three drops a day."
      },
      {
        "id": "beard-balm",
        "name": "Beard Balm",
        "size": "2 oz",
        "price": 18,
        "kind": "tin",
        "cat": "beard",
        "color": "#e0a83a",
        "label": "#151515",
        "desc": "Shea butter and beeswax for shape and a little hold on longer beards."
      },
      {
        "id": "shave-cream",
        "name": "Shave Cream",
        "size": "5 oz",
        "price": 24,
        "kind": "jar",
        "cat": "shave",
        "color": "#f2ead9",
        "label": "#151515",
        "desc": "The lather we use in the chair. Rich, slick and kind to sensitive skin."
      },
      {
        "id": "aftershave",
        "name": "Bay Rum Tonic",
        "size": "3.4 fl oz",
        "price": 26,
        "kind": "bottle",
        "cat": "shave",
        "color": "#9e1f15",
        "label": "#f2ead9",
        "desc": "Old-school bay rum aftershave. Cools, closes pores and smells like a barbershop."
      },
      {
        "id": "comb",
        "name": "Pocket Comb",
        "size": "5 in",
        "price": 12,
        "kind": "comb",
        "cat": "tools",
        "color": "#151515",
        "label": "#e0a83a",
        "desc": "Hand-cut cellulose acetate with fine and wide teeth. Lives in your back pocket."
      }
    ],
    "productCategories": [
      {
        "id": "hair",
        "label": "Hair"
      },
      {
        "id": "beard",
        "label": "Beard"
      },
      {
        "id": "shave",
        "label": "Shave"
      },
      {
        "id": "tools",
        "label": "Tools"
      }
    ],
    "giftDesigns": [
      {
        "id": "pole",
        "label": "Barber pole"
      },
      {
        "id": "stamp",
        "label": "Red stamp"
      },
      {
        "id": "blackout",
        "label": "Blackout"
      }
    ],
    "gift": {
      "min": 20,
      "max": 300,
      "presets": [
        25,
        50,
        75,
        100
      ]
    },
    "shipping": {
      "flat": 6,
      "freeOver": 50
    }
  };

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var params = new URLSearchParams(window.location.search);
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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
      try { var raw = safeStorage.getItem(key); return raw === null ? null : JSON.parse(raw); } catch (e) { return null; }
    },
    set: function (key, value) {
      try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ }
    },
    remove: function (key) {
      try { safeStorage.removeItem(key); } catch (e) { /* private mode */ }
    }
  };

  // Ids from the URL must be the data's own keys, so ?service=constructor or ?barber=__proto__ match nothing.
  var hasOwn = function (obj, key) { return Object.prototype.hasOwnProperty.call(obj, key); };
  // Text from data or visitors goes into HTML strings escaped.
  // A short reference, like FB-7K2Q (no 0/O or 1/I to misread over the phone).
  var makeRef = function () {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', ref = 'FB-';
    for (var i = 0; i < 4; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
    return ref;
  };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var index = function (list) { var o = Object.create(null); list.forEach(function (x) { o[x.id] = x; }); return o; };
  var locById = index(FADE.locations), serviceById = index(FADE.services), barberById = index(FADE.barbers);
  var productById = index(FADE.products), catById = index(FADE.categories), specById = index(FADE.specialties);
  var designById = index(FADE.giftDesigns);

  // Prices in the shop's currency and locale, e.g. "$45" or "$45.50".
  function money(n) {
    var whole = Math.round(n * 100) % 100 === 0;
    return new Intl.NumberFormat(FADE.shop.locale, { style: 'currency', currency: FADE.shop.currency, minimumFractionDigits: whole ? 0 : 2, maximumFractionDigits: 2 }).format(n);
  }
  function duration(m) {
    var h = Math.floor(m / 60), mm = m % 60;
    if (h && mm) return h + ' hr ' + mm + ' min';
    return h ? h + ' hr' : mm + ' min';
  }
  function toMin(hhmm) { var p = hhmm.split(':'); return +p[0] * 60 + +p[1]; }
  // Minutes after midnight to "9 am" / "2:15 pm".
  function time12(min) {
    var h = Math.floor(min / 60) % 24, m = min % 60;
    return (h % 12 || 12) + (m ? ':' + String(m).padStart(2, '0') : '') + ' ' + (h < 12 ? 'am' : 'pm');
  }
  var DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  var DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  var MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  var MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  // Calendar dates are "YYYY-MM-DD" keys, calculated in UTC so DST never shifts a day.
  function keyOf(y, m, d) { return y + '-' + String(m).padStart(2, '0') + '-' + String(d).padStart(2, '0'); }
  function dateOfKey(key) { var p = key.split('-'); return new Date(Date.UTC(+p[0], +p[1] - 1, +p[2], 12)); }
  function addDays(key, n) { var d = dateOfKey(key); d.setUTCDate(d.getUTCDate() + n); return keyOf(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate()); }
  function weekday(key) { return dateOfKey(key).getUTCDay(); }
  function shortDate(key) { var d = dateOfKey(key); return DAY[d.getUTCDay()] + ', ' + MONTH[d.getUTCMonth()] + ' ' + d.getUTCDate(); }
  function longDate(key) { var d = dateOfKey(key); return DAY_LONG[d.getUTCDay()] + ', ' + MONTH_LONG[d.getUTCMonth()] + ' ' + d.getUTCDate(); }

  // Wall-clock time in the shop's time zone, whatever the visitor's own zone is.
  var tzParts = new Intl.DateTimeFormat('en-US', { timeZone: FADE.shop.timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' });
  function partsAt(date) {
    var o = {};
    tzParts.formatToParts(date).forEach(function (p) { o[p.type] = p.value; });
    return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour % 24, min: +o.minute };
  }
  // ?at=2026-10-17T10:30 previews the site at a shop-local time (handy for testing the wait widget).
  var AT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(params.get('at') || '');
  function shopNow() {
    if (AT && +AT[4] < 24 && +AT[5] < 60) {
      var key = keyOf(+AT[1], +AT[2], +AT[3]);
      if (key === addDays(key, 0)) return { key: key, day: weekday(key), mins: +AT[4] * 60 + +AT[5] };
    }
    var p = partsAt(new Date());
    var k = keyOf(p.y, p.m, p.d);
    return { key: k, day: weekday(k), mins: p.h * 60 + p.min };
  }
  // The real instant for a shop-local date and time (used for .ics files).
  function shopTimeToDate(key, mins) {
    var a = key.split('-');
    var guess = Date.UTC(+a[0], +a[1] - 1, +a[2], 0, mins);
    var offset = function (ms) { var p = partsAt(new Date(ms)); return Date.UTC(p.y, p.m - 1, p.d, p.h, p.min) - Math.floor(ms / 60000) * 60000; };
    var t = guess - offset(guess);
    var second = guess - offset(t);
    return new Date(second);
  }

  // Deterministic pseudo-random numbers (FNV-1a + mix) so demo data is stable for a given day.
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    h ^= h >>> 16; h = Math.imul(h, 2246822507) >>> 0;
    h ^= h >>> 13; h = Math.imul(h, 3266489909) >>> 0;
    h ^= h >>> 16;
    return h >>> 0;
  }

  // A barber's hours at a shop on a weekday, as [startMin, endMin], or null.
  function barberHours(b, locId, day) {
    var s = b.schedule[locId] && b.schedule[locId][day];
    return s ? [toMin(s[0]), toMin(s[1])] : null;
  }
  function workingAt(locId, day, mins) {
    return FADE.barbers.filter(function (b) {
      var h = barberHours(b, locId, day);
      return h && mins >= h[0] && mins < h[1];
    });
  }
  function needs(s) { return s.needs || [s.cat]; }
  function canDo(b, ids) {
    return ids.every(function (id) { return needs(serviceById[id]).every(function (n) { return b.skills.indexOf(n) !== -1; }); });
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
    pending.forEach(function (el, i) { el.style.transitionDelay = Math.min(i % 4, 3) * 70 + 'ms'; io.observe(el); });
    var revealQueued = false;
    var revealAbove = function () {
      revealQueued = false;
      var limit = window.innerHeight * 0.92;
      $$('.reveal:not(.is-visible)').forEach(function (el) {
        if (el.getBoundingClientRect().top < limit) { show(el); io.unobserve(el); }
      });
    };
    window.addEventListener('scroll', function () {
      if (revealQueued) return;
      revealQueued = true;
      window.requestAnimationFrame(revealAbove);
    }, { passive: true });
    if (window.location.hash) window.addEventListener('load', revealAbove);
  }

  /* ------------------------------------------------------------------
   * 5. Open now — [data-open-now="<shop id>"] badges, [data-today-hours]
   *    and today's row in [data-hours] tables. Refreshes every minute.
   * ------------------------------------------------------------------ */
  function openStatus(loc, now) {
    var h = loc.hours[now.day];
    if (h && now.mins >= toMin(h[0]) && now.mins < toMin(h[1])) {
      var left = toMin(h[1]) - now.mins;
      return { open: true, text: (left <= 45 ? 'Closing soon · ' : 'Open now · until ') + time12(toMin(h[1])) };
    }
    for (var i = 0; i < 8; i++) {
      var key = addDays(now.key, i), day = weekday(key), next = loc.hours[day];
      if (!next || (i === 0 && now.mins >= toMin(next[0]))) continue;
      var when = i === 0 ? 'today' : i === 1 ? 'tomorrow' : DAY_LONG[day];
      return { open: false, text: 'Closed · opens ' + when + ' ' + time12(toMin(next[0])) };
    }
    return { open: false, text: 'Closed' };
  }
  function paintOpen() {
    var now = shopNow();
    $$('[data-open-now]').forEach(function (el) {
      var loc = locById[el.getAttribute('data-open-now')];
      if (!loc) return;
      var s = openStatus(loc, now);
      el.classList.toggle('is-open', s.open);
      el.classList.toggle('is-closed', !s.open);
      $('[data-open-text]', el).textContent = s.text;
    });
    $$('[data-today-hours]').forEach(function (el) {
      var loc = locById[el.getAttribute('data-today-hours')];
      if (!loc) return;
      var h = loc.hours[now.day];
      el.textContent = h ? time12(toMin(h[0])) + ' – ' + time12(toMin(h[1])) : 'Closed';
    });
    $$('[data-hours] tr').forEach(function (tr) {
      var isToday = +tr.getAttribute('data-day') === now.day;
      tr.classList.toggle('is-today', isToday);
      if (isToday) tr.setAttribute('aria-current', 'date'); else tr.removeAttribute('aria-current');
    });
  }

  /* ------------------------------------------------------------------
   * 6. Wait estimate — ILLUSTRATIVE. Combines opening hours, how many
   *    barbers are scheduled and FADE.traffic (0–1 per hour). Replace
   *    estimateWait() with a call to your queue system for real numbers.
   * ------------------------------------------------------------------ */
  function trafficAt(day, mins) {
    var curve = day === 6 ? FADE.traffic.saturday : day === 0 ? FADE.traffic.sunday : FADE.traffic.weekday;
    var h = Math.floor(mins / 60), f = (mins % 60) / 60;
    var a = curve[h] !== undefined ? curve[h] : 0.2, b = curve[h + 1] !== undefined ? curve[h + 1] : a;
    return a + (b - a) * f;
  }
  // Estimated walk-in wait in minutes (multiple of 5) at a shop-local minute, or null if no one is working.
  function estimateWait(loc, key, day, mins) {
    var chairs = workingAt(loc.id, day, mins).length;
    if (!chairs) return null;
    var jitter = hash(loc.id + '|' + key + '|' + Math.floor(mins / 20)) % 11 - 5;
    var raw = trafficAt(day, mins) * 70 / chairs + jitter;
    return Math.min(90, Math.max(0, Math.round(raw / 5) * 5));
  }
  function names(list) {
    var n = list.map(function (b) { return b.short; });
    return n.length < 2 ? n.join('') : n.slice(0, -1).join(', ') + ' and ' + n[n.length - 1];
  }
  function paintWait() {
    var now = shopNow();
    $$('[data-wait-time]').forEach(function (el) { el.textContent = time12(now.mins); });
    $$('[data-wait]').forEach(function (box) {
      var loc = locById[box.getAttribute('data-wait')];
      if (!loc) return;
      var num = $('[data-wait-num]', box), detail = $('[data-wait-detail]', box), unit = $('[data-wait-unit]', box);
      var h = loc.hours[now.day];
      var open = h && now.mins >= toMin(h[0]) && now.mins < toMin(h[1]);
      var wait = open ? estimateWait(loc, now.key, now.day, now.mins) : null;
      var crew = open ? workingAt(loc.id, now.day, now.mins) : [];
      if (!open || wait === null) {
        num.textContent = 'Closed';
        if (unit) unit.textContent = 'No walk-ins';
        detail.textContent = openStatus(loc, now).text.replace('Closed · opens', 'Opens') + '. Book ahead to skip the line.';
      } else {
        num.textContent = wait === 0 ? 'None' : wait + ' min';
        if (unit) unit.textContent = wait === 0 ? 'Walk right in' : 'Est. wait';
        var mood = trafficAt(now.day, now.mins);
        detail.textContent = (mood < 0.4 ? 'Quiet right now. ' : mood < 0.75 ? 'Steady. ' : 'Busy right now. ') + 'In the chair: ' + names(crew) + '.';
      }
      // Today's typical wait by hour, as a tiny bar chart.
      var chart = $('[data-wait-chart]', box), label = $('[data-wait-chart-label]', box);
      if (!chart) return;
      if (!h) { chart.innerHTML = ''; if (label) label.textContent = 'Closed all day today.'; return; }
      var start = toMin(h[0]), end = toMin(h[1]), bars = [];
      for (var t = start; t < end; t += 60) {
        var w = estimateWait(loc, now.key, now.day, t + 30);
        bars.push({ t: t, w: w === null ? 0 : w });
      }
      var max = Math.max(45, Math.max.apply(null, bars.map(function (b) { return b.w; })));
      chart.innerHTML = bars.map(function (b) {
        var state = now.mins >= b.t && now.mins < b.t + 60 ? ' is-now' : now.mins >= b.t + 60 ? ' is-past' : '';
        return '<span class="wait-bar' + state + '" style="height:' + Math.max(8, Math.round(b.w / max * 100)) + '%"></span>';
      }).join('');
      if (label) label.textContent = 'Typical wait today, ' + time12(start) + ' – ' + time12(end);
    });
  }
  function tick() { paintOpen(); paintWait(); }
  tick();
  window.setInterval(tick, 60000);

  /* ------------------------------------------------------------------
   * 7. Services filter (?category=beard preselects)
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
      $('[data-services-count]', services).textContent = count + ' service' + (count === 1 ? '' : 's') + (cat === 'all' ? '' : ' in ' + catById[cat].label);
    };
    chips.forEach(function (c) { c.addEventListener('click', function () { setServiceFilter(c.getAttribute('data-filter')); }); });
    var wanted = params.get('category');
    if (wanted && hasOwn(catById, wanted)) setServiceFilter(wanted);
  }

  /* ------------------------------------------------------------------
   * Time slots (shared by the barbers page and the booking flow).
   * Booked blocks are made up but stable: replace isBooked() with your
   * booking system's availability.
   * ------------------------------------------------------------------ */
  var SLOT_STEP = 15;      // minutes between start times
  var LEAD_TIME = 30;      // earliest booking is this many minutes from now
  var BOOK_AHEAD = 42;     // days visitors can book ahead (6 weeks)
  function isBooked(barberId, key, mins) { return hash(barberId + '|' + key + '|' + Math.floor(mins / 30)) % 100 < 32; }
  function barberFree(b, key, start, mins) {
    for (var t = Math.floor(start / 30) * 30; t < start + mins; t += 30) if (isBooked(b.id, key, t)) return false;
    return true;
  }
  function eligible(locId, ids) {
    return FADE.barbers.filter(function (b) { return b.schedule[locId] && canDo(b, ids); });
  }
  /**
   * Start times for a shop, date key, list of service ids and barber ('any' or an id).
   * Returns [{ start, barber }] where barber is who would do it.
   */
  function slotsFor(locId, key, ids, barberId, now) {
    var loc = locById[locId], day = weekday(key), h = loc.hours[day];
    if (!h || !ids.length) return [];
    var mins = ids.reduce(function (s, id) { return s + serviceById[id].mins; }, 0);
    var earliest = toMin(h[0]);
    if (key < now.key) return [];
    if (key === now.key) earliest = Math.max(earliest, Math.ceil((now.mins + LEAD_TIME) / SLOT_STEP) * SLOT_STEP);
    var pool = barberId === 'any' ? eligible(locId, ids) : [barberById[barberId]];
    var out = [];
    for (var t = earliest; t + mins <= toMin(h[1]); t += SLOT_STEP) {
      for (var i = 0; i < pool.length; i++) {
        var bh = barberHours(pool[i], locId, day);
        if (bh && t >= bh[0] && t + mins <= bh[1] && barberFree(pool[i], key, t, mins)) { out.push({ start: t, barber: pool[i].id }); break; }
      }
    }
    return out;
  }
  // The soonest slot for a barber within two weeks, at one shop or any of theirs.
  function nextFree(b, ids, onlyLoc) {
    var now = shopNow();
    for (var i = 0; i < 14; i++) {
      var key = addDays(now.key, i);
      for (var locId in b.schedule) {
        if (!hasOwn(b.schedule, locId) || (onlyLoc && locId !== onlyLoc)) continue;
        var s = slotsFor(locId, key, ids, b.id, now);
        if (s.length) return { key: key, start: s[0].start, loc: locId, today: i === 0, tomorrow: i === 1 };
      }
    }
    return null;
  }
  function whenText(n) {
    return (n.today ? 'Today' : n.tomorrow ? 'Tomorrow' : shortDate(n.key)) + ' ' + time12(n.start);
  }

  /* ------------------------------------------------------------------
   * 8. Barbers — shop and specialty filters, next free time
   * ------------------------------------------------------------------ */
  var barbersWrap = $('[data-barbers]');
  if (barbersWrap) {
    var fLoc = 'all', fSpec = 'all';
    var cards = $$('[data-barber]', barbersWrap);
    var applyBarbers = function () {
      var n = 0;
      cards.forEach(function (card) {
        var match = (fLoc === 'all' || card.getAttribute('data-locs').split(' ').indexOf(fLoc) !== -1) &&
          (fSpec === 'all' || card.getAttribute('data-specs').split(' ').indexOf(fSpec) !== -1);
        card.hidden = !match;
        if (match) { n++; show(card); }
      });
      var bits = [];
      if (fLoc !== 'all') bits.push('at ' + locById[fLoc].name);
      if (fSpec !== 'all') bits.push('for ' + specById[fSpec].label.toLowerCase());
      $('[data-barber-count]', barbersWrap).textContent = n + (n === 1 ? ' barber' : ' barbers') + (bits.length ? ' ' + bits.join(' ') : '');
      $('[data-barber-empty]', barbersWrap).classList.toggle('hidden', n > 0);
      $$('[data-barber-loc]', barbersWrap).forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-barber-loc') === fLoc)); });
      $$('[data-barber-spec]', barbersWrap).forEach(function (c) { c.setAttribute('aria-pressed', String(c.getAttribute('data-barber-spec') === fSpec)); });
    };
    $$('[data-barber-loc]', barbersWrap).forEach(function (c) { c.addEventListener('click', function () { fLoc = c.getAttribute('data-barber-loc'); applyBarbers(); }); });
    $$('[data-barber-spec]', barbersWrap).forEach(function (c) { c.addEventListener('click', function () { fSpec = c.getAttribute('data-barber-spec'); applyBarbers(); }); });
    $('[data-barber-reset]', barbersWrap).addEventListener('click', function () { fLoc = 'all'; fSpec = 'all'; applyBarbers(); $('[data-barber-loc="all"]', barbersWrap).focus(); });
    var preLoc = params.get('location');
    if (preLoc && hasOwn(locById, preLoc)) fLoc = preLoc;
    var preSpec = params.get('speciality');
    if (preSpec && hasOwn(specById, preSpec)) fSpec = preSpec;
    applyBarbers();
    $$('[data-next-free]', barbersWrap).forEach(function (el) {
      var b = barberById[el.getAttribute('data-next-free')];
      var n = b && nextFree(b, ['classic']);
      el.textContent = n ? 'Next free: ' + whenText(n) + (Object.keys(b.schedule).length > 1 ? ', ' + locById[n.loc].name : '') : '';
    });
  }

  /* ------------------------------------------------------------------
   * 9. Booking flow. Demo only: confirm() shows a summary and an .ics file.
   *    To take real bookings, send the request to Square Appointments,
   *    Fresha, Booksy or Cal.com (or your own backend) in confirm().
   * ------------------------------------------------------------------ */
  var booking = $('[data-booking]');
  if (booking) {
    var form = $('#booking-form', booking);
    var stepEls = $$('[data-step]', form);
    var back = $('[data-back]', form), next = $('[data-next]', form);
    var state = { step: 1, location: FADE.locations[0].id, barber: 'any', date: null, slot: null, slotBarber: null, focusDate: null, month: null };
    var selected = function () { return $$('input[name="services"]:checked', form).map(function (i) { return i.value; }); };
    var totalMins = function () { return selected().reduce(function (s, id) { return s + serviceById[id].mins; }, 0); };
    var totalPrice = function () { return selected().reduce(function (s, id) { return s + serviceById[id].price; }, 0); };
    var setError = function (name, msg) {
      var el = $('[data-error="' + name + '"]', form);
      if (el) el.textContent = msg || '';
      var input = form.elements[name];
      if (input && input.setAttribute) { if (msg) input.setAttribute('aria-invalid', 'true'); else input.removeAttribute('aria-invalid'); }
    };
    var resetTime = function () { state.date = null; state.slot = null; state.slotBarber = null; state.focusDate = null; state.month = null; };

    // Prefill from the URL: ?location=pilsen, ?service=fade, ?barber=rosa
    var preLocation = params.get('location');
    if (preLocation && hasOwn(locById, preLocation)) state.location = preLocation;
    var preService = params.get('service');
    if (preService && hasOwn(serviceById, preService)) $$('input[name="services"]', form).forEach(function (i) { if (i.value === preService) i.checked = true; });
    var preBarber = params.get('barber');
    if (preBarber && hasOwn(barberById, preBarber)) {
      var pb = barberById[preBarber];
      if (!(preLocation && hasOwn(locById, preLocation))) state.location = Object.keys(pb.schedule)[0];
      if (pb.schedule[state.location]) state.barber = preBarber;
    }
    $$('input[name="location"]', form).forEach(function (r) { r.checked = r.value === state.location; });

    // Who's in today at each shop (step 1).
    var today = shopNow();
    $$('[data-loc-barbers]', form).forEach(function (el) {
      var id = el.getAttribute('data-loc-barbers');
      var crew = FADE.barbers.filter(function (b) { return barberHours(b, id, today.day); });
      el.textContent = crew.length ? 'Today: ' + names(crew) : 'No barbers in today';
    });

    var paintSummary = function () {
      var ids = selected();
      $('[data-summary-location]', booking).textContent = locById[state.location].name;
      $('[data-summary-items]', booking).innerHTML = ids.length ? ids.map(function (id) {
        var s = serviceById[id];
        return '<li class="flex justify-between gap-4"><span>' + esc(s.name) + '</span><span class="font-bold tabular-nums">' + money(s.price) + '</span></li>';
      }).join('') : '<li class="text-mute">Nothing chosen yet</li>';
      var who = state.slotBarber ? barberById[state.slotBarber].name + (state.barber === 'any' ? ' (first available)' : '') : state.barber === 'any' ? 'First available' : barberById[state.barber].name;
      $('[data-summary-barber]', booking).textContent = who;
      $('[data-summary-when]', booking).textContent = state.date && state.slot !== null ? shortDate(state.date) + ', ' + time12(state.slot) : 'Not chosen';
      $('[data-summary-duration]', booking).textContent = duration(totalMins());
      $('[data-summary-total]', booking).textContent = money(totalPrice());
      var run = $('[data-running-total]', form);
      run.textContent = ids.length ? ids.length + (ids.length === 1 ? ' service · ' : ' services · ') + duration(totalMins()) + ' · ' + money(totalPrice()) : '';
    };

    /* Step 3: barbers who work at this shop and can do every chosen service. */
    var SKILL = { cuts: 'haircuts', beard: 'beard work', shaves: 'straight-razor shaves', kids: 'kids cuts' };
    var renderBarbers = function () {
      var ids = selected(), list = eligible(state.location, ids);
      if (state.barber !== 'any' && !list.some(function (b) { return b.id === state.barber; })) state.barber = 'any';
      $('[data-barber-help]', form).textContent = list.length === 1
        ? 'One barber at ' + locById[state.location].name + ' does everything you chose.'
        : list.length + ' barbers at ' + locById[state.location].name + ' do everything you chose. Same price with all of them.';
      var options = [{ id: 'any', name: 'First available', meta: 'Soonest opening with anyone below' }].concat(list.map(function (b) {
        var n = nextFree(b, ids, state.location);
        return { id: b.id, name: b.name, meta: b.role + (n ? ' · Next: ' + whenText(n) : '') };
      }));
      $('[data-barber-list]', form).innerHTML = options.map(function (o) {
        var avatar = o.id === 'any'
          ? '<span class="grid h-14 w-14 shrink-0 place-items-center rounded-md border-2 border-ink bg-red font-display text-xl text-white" aria-hidden="true">ANY</span>'
          : '<img src="assets/img/barbers/' + o.id + '.svg" alt="" width="56" height="56" class="h-14 w-14 shrink-0 rounded-md border-2 border-ink object-cover object-top">';
        return '<li><label class="option"><input type="radio" name="barber" value="' + o.id + '" class="option-input"' + (state.barber === o.id ? ' checked' : '') +
          '><span class="option-body flex-row items-center gap-4">' + avatar + '<span class="min-w-0"><span class="block font-bold">' + esc(o.name) + '</span><span class="block text-sm text-mute">' + esc(o.meta) + '</span></span></span></label></li>';
      }).join('');
      var excluded = FADE.barbers.filter(function (b) { return b.schedule[state.location] && list.indexOf(b) === -1; }).map(function (b) {
        var missing = [];
        ids.forEach(function (id) { needs(serviceById[id]).forEach(function (n) { if (b.skills.indexOf(n) === -1 && missing.indexOf(SKILL[n]) === -1) missing.push(SKILL[n]); }); });
        return b.short + ' (no ' + missing.join(' or ') + ')';
      });
      $('[data-barber-excluded]', form).textContent = excluded.length ? 'Not shown: ' + excluded.join(', ') + '.' : '';
      $$('input[name="barber"]', form).forEach(function (r) {
        r.addEventListener('change', function () { state.barber = r.value; resetTime(); paintSummary(); });
      });
    };

    /* Step 4: accessible month calendar (roving tabindex) and time slots. */
    var calGrid = $('[data-cal-grid]', form), calMonth = $('[data-cal-month]', form);
    var lastDay = function () { return addDays(shopNow().key, BOOK_AHEAD - 1); };
    var hasSlots = function (key) { return slotsFor(state.location, key, selected(), state.barber, shopNow()).length > 0; };
    var firstAvailable = function () {
      var now = shopNow();
      for (var k = now.key; k <= lastDay(); k = addDays(k, 1)) if (hasSlots(k)) return k;
      return now.key;
    };
    var renderCalendar = function (focus) {
      var now = shopNow(), end = lastDay();
      if (!state.focusDate) state.focusDate = state.date || firstAvailable();
      if (!state.month) state.month = state.focusDate.slice(0, 7);
      var ym = state.month.split('-').map(Number);
      var first = keyOf(ym[0], ym[1], 1);
      var days = new Date(Date.UTC(ym[0], ym[1], 0)).getUTCDate();
      var lead = (weekday(first) + 6) % 7; // Monday first
      calMonth.textContent = MONTH_LONG[ym[1] - 1] + ' ' + ym[0];
      $('[data-cal-prev]', form).disabled = state.month <= now.key.slice(0, 7);
      $('[data-cal-next]', form).disabled = state.month >= end.slice(0, 7);
      if (state.focusDate.slice(0, 7) !== state.month) {
        // Keep the roving focus inside the visible month.
        var pick = null;
        for (var d = 1; d <= days; d++) {
          var k = keyOf(ym[0], ym[1], d);
          if (k >= now.key && k <= end) { if (!pick) pick = k; if (hasSlots(k)) { pick = k; break; } }
        }
        state.focusDate = pick || first;
      }
      var html = '<tr>', cell = 0;
      for (var i = 0; i < lead; i++, cell++) html += '<td></td>';
      for (var day = 1; day <= days; day++, cell++) {
        if (cell && cell % 7 === 0) html += '</tr><tr>';
        var key = keyOf(ym[0], ym[1], day);
        var n = key >= now.key && key <= end ? slotsFor(state.location, key, selected(), state.barber, now).length : 0;
        var label = longDate(key) + (n ? ', ' + n + ' time' + (n === 1 ? '' : 's') + ' open' : ', unavailable');
        html += '<td><button type="button" class="cal-day" data-date="' + key + '"' + (n ? ' data-available' : ' aria-disabled="true"') +
          (key === now.key ? ' data-today aria-current="date"' : '') + ' aria-pressed="' + (key === state.date) + '" tabindex="' + (key === state.focusDate ? 0 : -1) +
          '" aria-label="' + esc(label) + '">' + day + '</button></td>';
      }
      while (cell % 7 !== 0) { html += '<td></td>'; cell++; }
      calGrid.innerHTML = html + '</tr>';
      if (focus) { var b = $('[data-date="' + state.focusDate + '"]', calGrid); if (b) b.focus(); }
    };
    var moveFocus = function (key) {
      var now = shopNow();
      if (key < now.key) key = now.key;
      if (key > lastDay()) key = lastDay();
      state.focusDate = key;
      state.month = key.slice(0, 7);
      renderCalendar(true);
    };
    var shiftMonth = function (delta) {
      var ym = state.month.split('-').map(Number);
      var d = new Date(Date.UTC(ym[0], ym[1] - 1 + delta, 1));
      state.month = keyOf(d.getUTCFullYear(), d.getUTCMonth() + 1, 1).slice(0, 7);
      renderCalendar(false);
    };
    $('[data-cal-prev]', form).addEventListener('click', function () { shiftMonth(-1); });
    $('[data-cal-next]', form).addEventListener('click', function () { shiftMonth(1); });
    calGrid.addEventListener('click', function (e) {
      var b = e.target.closest('[data-date]');
      if (!b || b.getAttribute('aria-disabled') === 'true') return;
      state.date = b.getAttribute('data-date');
      state.focusDate = state.date;
      state.slot = null; state.slotBarber = null;
      renderCalendar(true);
      renderSlots();
      paintSummary();
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

    var renderSlots = function () {
      var box = $('[data-slot-list]', form), empty = $('[data-slot-empty]', form), heading = $('[data-slot-heading]', form);
      setError('slot', '');
      if (!state.date) { box.innerHTML = ''; empty.hidden = true; heading.textContent = 'Choose a day'; return; }
      var slots = slotsFor(state.location, state.date, selected(), state.barber, shopNow());
      heading.textContent = 'Open times on ' + longDate(state.date);
      empty.hidden = slots.length > 0;
      var parts = [['Morning', 0, 720], ['Afternoon', 720, 1020], ['Evening', 1020, 1440]];
      box.innerHTML = parts.map(function (p) {
        var group = slots.filter(function (s) { return s.start >= p[1] && s.start < p[2]; });
        if (!group.length) return '';
        return '<div><p class="text-sm font-bold text-mute">' + p[0] + '</p><div class="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 xl:grid-cols-5">' + group.map(function (s) {
          var label = time12(s.start) + (state.barber === 'any' ? ' with ' + barberById[s.barber].short : '');
          return '<button type="button" class="slot" data-slot="' + s.start + '" data-slot-barber="' + s.barber + '" aria-pressed="' + (state.slot === s.start) + '" aria-label="' + esc(label) + '">' + time12(s.start) + '</button>';
        }).join('') + '</div></div>';
      }).join('');
      $$('[data-slot]', box).forEach(function (b) {
        b.addEventListener('click', function () {
          state.slot = +b.getAttribute('data-slot');
          state.slotBarber = b.getAttribute('data-slot-barber');
          $$('[data-slot]', box).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          setError('slot', '');
          paintSummary();
        });
      });
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
      if (n === 3) renderBarbers();
      if (n === 4) {
        if (state.date && !hasSlots(state.date)) resetTime();
        if (!state.date) { state.date = firstAvailable(); state.focusDate = state.date; state.month = null; if (!hasSlots(state.date)) state.date = null; }
        renderCalendar(false);
        renderSlots();
      }
      paintSummary();
      var top = booking.getBoundingClientRect().top + window.scrollY - 100;
      if (window.scrollY > top) window.scrollTo({ top: top, behavior: reduceMotion ? 'auto' : 'smooth' });
      $('#step-' + n + '-title', form).focus({ preventScroll: true });
    };

    var validate = function (n) {
      if (n === 2) {
        var ids = selected();
        if (!ids.length) { setError('services', 'Choose at least one service to continue.'); return false; }
        if (!eligible(state.location, ids).length) {
          setError('services', 'No one at ' + locById[state.location].name + ' does all of these in one visit. Remove a service or go back and switch shop.');
          return false;
        }
        setError('services', '');
        return true;
      }
      if (n === 4) {
        if (state.slot === null) {
          setError('slot', state.date ? 'Choose a time to continue.' : 'Choose a day and a time to continue.');
          var target = $('[data-slot]', form) || $('[data-date][tabindex="0"]', form);
          if (target) target.focus();
          return false;
        }
        return true;
      }
      if (n === 5) {
        var f = form.elements, ok = true, first = null;
        var check = function (name, msg) { setError(name, msg); if (msg) { ok = false; first = first || f[name]; } };
        var name = f.name.value.trim(), email = f.email.value.trim(), phone = f.phone.value.replace(/[\s().+-]/g, '');
        check('name', name.length < 2 ? 'Please enter your name.' : '');
        check('phone', !phone ? 'Please enter a mobile number for your reminder.' : !/^1?\d{10}$/.test(phone) ? 'Enter a 10-digit US number, like (312) 555-0123.' : '');
        check('email', !email ? 'Please enter your email.' : !EMAIL.test(email) ? 'Enter an email like name@example.com.' : '');
        check('policy', f.policy.checked ? '' : 'Please accept the cancellation policy.');
        if (first) first.focus();
        return ok;
      }
      return true;
    };

    var lastBooking = null;
    var confirm = function () {
      // Demo only: nothing is sent. Post { location, services, barber, date, time, details } to
      // your booking provider here (Square Appointments, Fresha, Booksy or Cal.com APIs/embeds).
      var f = form.elements, ids = selected();
      var b = barberById[state.slotBarber];
      lastBooking = { loc: locById[state.location], ids: ids, barber: b, date: state.date, start: state.slot, mins: totalMins() };
      var done = $('[data-booking-done]', booking);
      $('[data-done-name]', done).textContent = f.name.value.trim().split(/\s+/)[0];
      lastBooking.ref = makeRef();
      $('[data-done-ref]', done).textContent = lastBooking.ref;
      var rows = [
        ['Shop', lastBooking.loc.name + ', ' + lastBooking.loc.street],
        ['Barber', b.name],
        ['When', longDate(state.date) + ' at ' + time12(state.slot)],
        ['Services', ids.map(function (id) { return serviceById[id].name; }).join(', ')],
        ['Time in the chair', duration(totalMins())],
        ['Pay in the shop', money(totalPrice())]
      ];
      $('[data-done-list]', done).innerHTML = rows.map(function (r) {
        return '<div><dt class="condensed text-xs font-extrabold uppercase tracking-[0.18em] text-mute">' + r[0] + '</dt><dd class="mt-1 font-bold">' + esc(r[1]) + '</dd></div>';
      }).join('');
      $('.steps', booking).hidden = true;
      $('[data-booking-main]', booking).hidden = true;
      done.hidden = false;
      window.scrollTo({ top: booking.getBoundingClientRect().top + window.scrollY - 100, behavior: 'auto' });
      done.focus({ preventScroll: true });
    };

    // A calendar file for the requested time (works offline, nothing is sent anywhere).
    $('[data-ics]', booking).addEventListener('click', function () {
      if (!lastBooking) return;
      var fmt = function (d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); };
      var start = shopTimeToDate(lastBooking.date, lastBooking.start);
      var end = new Date(start.getTime() + lastBooking.mins * 60000);
      var what = lastBooking.ids.map(function (id) { return serviceById[id].name; }).join(' + ');
      var icsText = function (s) { return String(s).replace(/[\\;,]/g, function (c) { return '\\' + c; }); };
      var ics = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Fade Bros. Barber Co.//Booking//EN', 'BEGIN:VEVENT',
        'UID:' + Date.now() + '@fadebros.example', 'DTSTAMP:' + fmt(new Date()), 'DTSTART:' + fmt(start), 'DTEND:' + fmt(end),
        'SUMMARY:' + icsText(what + ' with ' + lastBooking.barber.short + ' (requested)'),
        'LOCATION:' + icsText('Fade Bros. ' + lastBooking.loc.name + ', ' + lastBooking.loc.street + ', ' + lastBooking.loc.city),
        'DESCRIPTION:' + icsText('Booking reference ' + lastBooking.ref + '. We’ll text to confirm. Free to move or cancel up to 4 hours before.'), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      a.download = 'fade-bros-' + lastBooking.date + '.ics';
      document.body.appendChild(a);
      a.click();
      window.setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
    });

    form.addEventListener('change', function (e) {
      if (e.target.name === 'location') { state.location = e.target.value; if (state.barber !== 'any' && !barberById[state.barber].schedule[state.location]) state.barber = 'any'; resetTime(); paintSummary(); }
      if (e.target.name === 'services') { setError('services', ''); resetTime(); paintSummary(); }
    });
    form.addEventListener('input', function (e) { if (e.target.getAttribute('aria-invalid')) setError(e.target.name, ''); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(state.step)) {
        if (state.step === 2) $('input[name="services"]', form).focus();
        return;
      }
      if (state.step === 5) confirm(); else go(state.step + 1);
    });
    back.addEventListener('click', function () { go(state.step - 1); });
    $('[data-restart]', booking).addEventListener('click', function () {
      form.reset();
      state = { step: 1, location: FADE.locations[0].id, barber: 'any', date: null, slot: null, slotBarber: null, focusDate: null, month: null };
      $$('input[name="location"]', form).forEach(function (r) { r.checked = r.value === state.location; });
      $('.steps', booking).hidden = false;
      $('[data-booking-main]', booking).hidden = false;
      $('[data-booking-done]', booking).hidden = true;
      go(1);
    });
    paintSummary();
  }

  /* ------------------------------------------------------------------
   * 10. Bag — products and gift cards, saved in localStorage ("fade-bag")
   *     and validated on every read. The header count shows on every page.
   * ------------------------------------------------------------------ */
  var BAG_KEY = 'fade-bag';
  var MAX_QTY = 10;
  var cleanText = function (v, max) { return typeof v === 'string' ? v.slice(0, max) : ''; };
  function readBag() {
    var raw = store.get(BAG_KEY);
    var bag = { items: [], delivery: FADE.locations[0].id };
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) { if (raw !== null) store.remove(BAG_KEY); return bag; }
    if (raw.delivery === 'ship' || (typeof raw.delivery === 'string' && hasOwn(locById, raw.delivery))) bag.delivery = raw.delivery;
    var seen = Object.create(null);
    (Array.isArray(raw.items) ? raw.items : []).forEach(function (it) {
      if (!it || typeof it !== 'object') return;
      if (it.type === 'product' && typeof it.id === 'string' && hasOwn(productById, it.id) && !seen[it.id]) {
        var q = Number(it.qty);
        if (Number.isInteger(q) && q >= 1) { seen[it.id] = true; bag.items.push({ type: 'product', id: it.id, qty: Math.min(q, MAX_QTY) }); }
      } else if (it.type === 'gift' && typeof it.key === 'string' && /^g-[a-z0-9]{4,12}$/.test(it.key) && !seen[it.key]) {
        var a = Number(it.amount);
        if (!Number.isInteger(a) || a < FADE.gift.min || a > FADE.gift.max) return;
        if (typeof it.design !== 'string' || !hasOwn(designById, it.design)) return;
        var to = cleanText(it.to, 40).trim(), email = cleanText(it.toEmail, 120).trim();
        if (!to || !EMAIL.test(email)) return;
        var date = typeof it.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(it.date) ? it.date : '';
        seen[it.key] = true;
        bag.items.push({ type: 'gift', key: it.key, amount: a, design: it.design, to: to, toEmail: email, from: cleanText(it.from, 40).trim(), message: cleanText(it.message, 140), date: date });
      }
    });
    if (JSON.stringify(bag) !== JSON.stringify(raw)) store.set(BAG_KEY, bag);
    return bag;
  }
  function writeBag(bag) { store.set(BAG_KEY, bag); paintBagCount(bag); }
  function bagCount(bag) { return bag.items.reduce(function (n, it) { return n + (it.type === 'product' ? it.qty : 1); }, 0); }
  function paintBagCount(bag) {
    var n = bagCount(bag || readBag());
    $$('[data-bag-count]').forEach(function (el) { el.textContent = n; el.hidden = n === 0; });
    $$('[data-bag-link]').forEach(function (a) { a.setAttribute('aria-label', 'Your bag, ' + n + (n === 1 ? ' item' : ' items')); });
  }
  paintBagCount();
  window.addEventListener('storage', function (e) { if (e.key === BAG_KEY) { paintBagCount(); if (renderBag) renderBag(); } });

  var renderBag = null;
  var shop = $('[data-shop]');
  if (shop) {
    var bagEl = $('[data-bag]', shop);
    var announce = function (msg) { var a = $('[data-bag-announce]', bagEl); a.textContent = ''; window.setTimeout(function () { a.textContent = msg; }, 50); };

    // Product filter
    var pChips = $$('[data-product-filter]', shop);
    pChips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var cat = chip.getAttribute('data-product-filter'), n = 0;
        pChips.forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
        $$('[data-product]', shop).forEach(function (li) {
          var match = cat === 'all' || li.getAttribute('data-cat') === cat;
          li.hidden = !match;
          if (match) { n++; show(li); }
        });
        $('[data-product-count]', shop).textContent = n + (n === 1 ? ' product' : ' products');
      });
    });

    var totals = function (bag) {
      var products = 0, gifts = 0;
      bag.items.forEach(function (it) { if (it.type === 'product') products += productById[it.id].price * it.qty; else gifts += it.amount; });
      var hasProducts = bag.items.some(function (it) { return it.type === 'product'; });
      var shipping = hasProducts && bag.delivery === 'ship' && products < FADE.shipping.freeOver ? FADE.shipping.flat : 0;
      return { products: products, gifts: gifts, subtotal: products + gifts, shipping: shipping, total: products + gifts + shipping, hasProducts: hasProducts };
    };

    renderBag = function () {
      var bag = readBag(), t = totals(bag), n = bagCount(bag);
      var list = $('[data-bag-items]', bagEl);
      list.innerHTML = bag.items.map(function (it) {
        if (it.type === 'product') {
          var p = productById[it.id];
          return '<li class="flex gap-3 py-4" data-line="' + it.id + '"><div class="min-w-0 flex-1"><p class="font-bold">' + esc(p.name) + '</p><p class="text-xs text-mute">' + esc(p.size) + ' · ' + money(p.price) + ' each</p>' +
            '<div class="mt-2 flex items-center gap-3"><span class="qty"><button type="button" data-qty="-1" aria-label="Remove one ' + esc(p.name) + '"' + (it.qty <= 1 ? ' disabled' : '') + '>−</button><output aria-label="Quantity">' + it.qty + '</output><button type="button" data-qty="1" aria-label="Add one ' + esc(p.name) + '"' + (it.qty >= MAX_QTY ? ' disabled' : '') + '>+</button></span>' +
            '<button type="button" class="text-link text-xs" data-remove>Remove<span class="sr-only"> ' + esc(p.name) + '</span></button></div></div><p class="font-bold tabular-nums">' + money(p.price * it.qty) + '</p></li>';
        }
        var when = it.date ? 'Emailed ' + shortDate(it.date) : 'Emailed right away';
        return '<li class="flex gap-3 py-4" data-line="' + it.key + '"><span class="gift-card gift-card-mini gift-' + it.design + ' w-16 shrink-0 self-start" aria-hidden="true"><span class="gift-card-brand">FB</span></span><div class="min-w-0 flex-1"><p class="font-bold">Gift card for ' + esc(it.to) + '</p><p class="break-words text-xs text-mute">' + esc(designById[it.design].label) + ' · ' + esc(when) + ' to ' + esc(it.toEmail) + '</p>' +
          '<button type="button" class="text-link mt-2 text-xs" data-remove>Remove<span class="sr-only"> gift card for ' + esc(it.to) + '</span></button></div><p class="font-bold tabular-nums">' + money(it.amount) + '</p></li>';
      }).join('');
      list.hidden = !bag.items.length;
      $('[data-bag-empty]', bagEl).hidden = bag.items.length > 0;
      $('[data-bag-body]', bagEl).hidden = !bag.items.length;
      $('[data-bag-summary]', bagEl).textContent = n ? n + (n === 1 ? ' item' : ' items') : 'Empty';
      $('[data-bag-delivery]', bagEl).hidden = !t.hasProducts;
      $$('input[name="delivery"]', bagEl).forEach(function (r) { r.checked = r.value === bag.delivery; });
      var prog = $('[data-ship-progress]', bagEl);
      prog.hidden = !(t.hasProducts && bag.delivery === 'ship');
      var left = FADE.shipping.freeOver - t.products;
      $('[data-ship-text]', bagEl).textContent = left > 0 ? 'Add ' + money(left) + ' more in products for free shipping.' : 'Free shipping unlocked.';
      $('[data-ship-bar]', bagEl).style.width = Math.min(100, Math.round(t.products / FADE.shipping.freeOver * 100)) + '%';
      $('[data-bag-subtotal]', bagEl).textContent = money(t.subtotal);
      $('[data-bag-shipping]', bagEl).textContent = !t.hasProducts ? '—' : bag.delivery === 'ship' ? (t.shipping ? money(t.shipping) : 'Free') : 'Pickup, free';
      $('[data-bag-total]', bagEl).textContent = money(t.total);
      $('[data-checkout-done]', bagEl).hidden = true;
      paintBagCount(bag);
    };

    var updateLine = function (id, fn) {
      var bag = readBag();
      bag.items = bag.items.map(function (it) { return (it.id || it.key) === id ? fn(it) : it; }).filter(Boolean);
      writeBag(bag);
      renderBag();
    };
    $('[data-bag-items]', bagEl).addEventListener('click', function (e) {
      var line = e.target.closest('[data-line]');
      if (!line) return;
      var id = line.getAttribute('data-line');
      var qtyBtn = e.target.closest('[data-qty]');
      if (qtyBtn) {
        var delta = +qtyBtn.getAttribute('data-qty');
        updateLine(id, function (it) { it.qty = Math.max(1, Math.min(MAX_QTY, it.qty + delta)); return it; });
        var again = $('[data-line="' + id + '"] [data-qty="' + delta + '"]', bagEl);
        if (again && !again.disabled) again.focus(); else { var other = $('[data-line="' + id + '"] [data-qty="' + -delta + '"]', bagEl); if (other) other.focus(); }
        var it = readBag().items.filter(function (x) { return x.id === id; })[0];
        if (it) announce(productById[id].name + ': quantity ' + it.qty);
        return;
      }
      if (e.target.closest('[data-remove]')) {
        updateLine(id, function () { return null; });
        announce('Removed from your bag.');
        $('#bag-title').setAttribute('tabindex', '-1');
        $('#bag-title').focus();
      }
    });
    $$('input[name="delivery"]', bagEl).forEach(function (r) {
      r.addEventListener('change', function () { var bag = readBag(); bag.delivery = r.value; writeBag(bag); renderBag(); });
    });

    $$('[data-add]', shop).forEach(function (btn) {
      var label = btn.innerHTML, timer = null;
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-add'), bag = readBag();
        var line = bag.items.filter(function (it) { return it.type === 'product' && it.id === id; })[0];
        if (line && line.qty >= MAX_QTY) { announce('You can add up to ' + MAX_QTY + ' of each product.'); return; }
        if (line) line.qty++; else bag.items.push({ type: 'product', id: id, qty: 1 });
        writeBag(bag);
        renderBag();
        announce(productById[id].name + ' added to your bag.');
        btn.innerHTML = 'Added ✓<span class="sr-only">: ' + esc(productById[id].name) + '</span>';
        window.clearTimeout(timer);
        timer = window.setTimeout(function () { btn.innerHTML = label; }, 1600);
      });
    });

    $('[data-checkout]', bagEl).addEventListener('click', function () {
      // Demo only. Send readBag().items to Shopify, Square Online or Stripe Checkout here.
      var bag = readBag(), t = totals(bag);
      if (!bag.items.length) return;
      var how = !t.hasProducts ? 'Gift cards are emailed.' : bag.delivery === 'ship' ? 'Products ship in 1–2 business days.' : 'Products ready for pickup at ' + locById[bag.delivery].name + ' within 2 hours.';
      $('[data-checkout-text]', bagEl).textContent = bagCount(bag) + (bagCount(bag) === 1 ? ' item' : ' items') + ', total ' + money(t.total) + '. ' + how;
      var done = $('[data-checkout-done]', bagEl);
      $('[data-checkout-ref]', done).textContent = makeRef();
      done.hidden = false;
      done.focus();
    });
    renderBag();
  }

  /* ------------------------------------------------------------------
   * 11. Gift card builder — live preview, validation, adds a gift line to the bag
   * ------------------------------------------------------------------ */
  var giftWrap = $('[data-gift]');
  if (giftWrap) {
    var gForm = $('#gift-form', giftWrap), gf = gForm.elements;
    var preview = $('[data-gift-preview]', giftWrap);
    var now0 = shopNow();
    var maxKey = addDays(now0.key, 365);
    gf.date.min = now0.key; gf.date.max = maxKey;
    var MSG_MAX = 140;
    var checkedValue = function (name) { var el = gForm.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ''; };
    var amount = function () {
      var v = checkedValue('amount');
      if (v !== 'custom') return +v;
      var n = Number(gf.custom.value);
      return gf.custom.value !== '' && Number.isInteger(n) && n >= FADE.gift.min && n <= FADE.gift.max ? n : null;
    };
    var setGErr = function (name, msg) {
      $('[data-error="' + name + '"]', gForm).textContent = msg || '';
      if (msg) gf[name].setAttribute('aria-invalid', 'true'); else gf[name].removeAttribute('aria-invalid');
    };
    var paintGift = function () {
      $('[data-custom-wrap]', gForm).hidden = checkedValue('amount') !== 'custom';
      $('[data-date-wrap]', gForm).hidden = checkedValue('send') !== 'later';
      var a = amount(), design = checkedValue('design');
      preview.className = 'gift-card gift-card-lg gift-' + design;
      $('[data-preview-amount]', preview).textContent = a ? money(a) : '$—';
      var to = gf.to.value.trim(), from = gf.from.value.trim(), msg = gf.message.value.trim();
      $('[data-preview-to]', preview).textContent = 'For ' + (to || 'someone sharp');
      $('[data-preview-message]', preview).textContent = msg || 'Your message will appear here.';
      $('[data-preview-from]', preview).textContent = 'From ' + (from || 'you');
      $('[data-preview-desc]', giftWrap).textContent = designById[design].label + ' gift card, ' + (a ? money(a) : 'no amount yet') + ', for ' + (to || 'someone sharp') + '.';
      var left = MSG_MAX - gf.message.value.length;
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
      check('custom', checkedValue('amount') === 'custom' && amount() === null ? 'Enter a whole amount from ' + money(FADE.gift.min) + ' to ' + money(FADE.gift.max) + '.' : '');
      check('to', gf.to.value.trim() ? '' : 'Enter the recipient’s name.');
      var te = gf.toEmail.value.trim();
      check('toEmail', !te ? 'Enter the recipient’s email.' : !EMAIL.test(te) ? 'Enter an email like name@example.com.' : '');
      check('from', gf.from.value.trim() ? '' : 'Enter your name so they know who it’s from.');
      var later = checkedValue('send') === 'later', d = gf.date.value;
      check('date', later && (!d || d < now0.key || d > maxKey) ? 'Choose a date between today and a year from now.' : '');
      if (first) { first.focus(); return; }
      var bag = readBag();
      var item = { type: 'gift', key: 'g-' + Math.random().toString(36).slice(2, 10), amount: amount(), design: checkedValue('design'), to: gf.to.value.trim(), toEmail: te, from: gf.from.value.trim(), message: gf.message.value.trim().slice(0, MSG_MAX), date: later ? d : '' };
      bag.items.push(item);
      writeBag(bag);
      if (renderBag) renderBag();
      $('[data-gift-added]', gForm).innerHTML = 'Added a ' + money(item.amount) + ' gift card for ' + esc(item.to) + '. <a href="#bag" class="text-link">View bag</a>';
      gForm.reset();
      paintGift();
    });
    paintGift();
  }

  /* ------------------------------------------------------------------
   * 12. Forms — contact (?topic=careers preselects) and newsletter.
   *     Demo only: post the data to your form service where noted.
   * ------------------------------------------------------------------ */
  var contact = $('#contact-form');
  if (contact) {
    var topic = params.get('topic');
    // Compare values instead of building a selector from the URL.
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
      var phone = f.phone.value.replace(/[\s().+-]/g, '');
      check('phone', phone && !/^1?\d{10}$/.test(phone) ? 'Enter a 10-digit US number, or leave it blank.' : '');
      check('message', f.message.value.trim().length < 20 ? 'Please write at least 20 characters.' : '');
      if (first) { first.focus(); return; }
      // Send new FormData(contact) to your endpoint here, e.g.
      // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(contact), headers: { Accept: 'application/json' } })
      contact.reset();
      var ok = $('[data-form-success]', contact);
      $('[data-ref]', ok).textContent = makeRef();
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
      // Send the email address to your newsletter tool (Mailchimp, Buttondown…) here.
      nf.reset();
      $('[data-newsletter-success]', nf).hidden = false;
    });
  });
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
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
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
