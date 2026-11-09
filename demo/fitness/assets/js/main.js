/* Keel Athletic Club — site data.
   Edit classes, coaches, opening hours and the weekly schedule here. */
var FORGE = {
  "classes": {
    "strength": {
      "name": "Strength Lab",
      "short": "Small-group barbell training with coached progressions every week.",
      "desc": "Strength Lab is where Keel members get genuinely strong. Each six-week block follows a written program built around the squat, hinge, press and pull, with a coach adjusting the load for every athlete on the platform. You'll log every set and watch the numbers climb.",
      "intensity": 2,
      "duration": 60,
      "kcal": "350–500",
      "expect": [
        "A 10-minute movement-prep warm-up tailored to the day's lift",
        "Main lift: work up to the target sets with a coach checking every rep",
        "Accessory supersets for the muscles that support the main lift",
        "Log your numbers on the board and leave a few minutes to stretch"
      ],
      "equipment": [
        "Olympic barbell & bumper plates",
        "Squat rack & platform",
        "Dumbbells",
        "Lifting belt (optional)"
      ],
      "who": "All levels. New lifters start on technique blocks with a lighter bar.",
      "tag": "Strength"
    },
    "ignite": {
      "name": "Ignite HIIT",
      "short": "Fast intervals on the turf, rower and bike. Leave everything on the floor.",
      "desc": "Ignite is 45 minutes of structured intervals that push your heart rate up and keep it there. Expect sled pushes, sprints on the air bike, burpee ladders and partner finishers, all scaled so beginners and athletes share the same floor.",
      "intensity": 3,
      "duration": 45,
      "kcal": "500–700",
      "expect": [
        "Dynamic warm-up with a coached movement primer",
        "Three interval blocks with timed work and rest",
        "A partner or team finisher to empty the tank",
        "Cool-down and breathing to bring your heart rate back"
      ],
      "equipment": [
        "Air bikes & rowers",
        "Weighted sleds",
        "Kettlebells",
        "Medicine balls"
      ],
      "who": "Anyone comfortable with moderate exercise. Every movement has a lower-impact option.",
      "tag": "HIIT"
    },
    "ride": {
      "name": "Keel Ride",
      "short": "Power-based indoor cycling with live leaderboards and a big sound system.",
      "desc": "Keel Ride uses smart bikes that measure your power in watts, so every session is personal. Climbs, sprints and tempo blocks are set to your own FTP, and the screen shows your effort in real time. Lights down, music up.",
      "intensity": 2,
      "duration": 45,
      "kcal": "400–600",
      "expect": [
        "Bike set-up help for your first ride",
        "Warm-up and a quick power test to set today's targets",
        "Climbs, sprints and tempo intervals synced to the music",
        "Leaderboard reveal and a stretch off the bike"
      ],
      "equipment": [
        "Smart bikes with power meters",
        "Clip-in shoes (free to borrow)",
        "Towel & water bottle"
      ],
      "who": "All levels. You control the resistance, so you choose how hard it gets.",
      "tag": "Cycling"
    },
    "box": {
      "name": "Box & Burn",
      "short": "Bag work, pad rounds and footwork drills. No sparring, all sweat.",
      "desc": "Box & Burn teaches proper boxing technique and wraps it in a serious conditioning session. You'll learn combinations, work rounds on the heavy bags and partner up for pad work with a coach calling the shots.",
      "intensity": 3,
      "duration": 50,
      "kcal": "550–750",
      "expect": [
        "Skipping and footwork warm-up",
        "Technique: one new combination broken down step by step",
        "Six three-minute rounds on the heavy bags",
        "Core finisher and a cool-down"
      ],
      "equipment": [
        "Gloves & hand wraps (free to borrow)",
        "Heavy bags",
        "Focus pads",
        "Skipping ropes"
      ],
      "who": "Complete beginners welcome. There's no contact or sparring.",
      "tag": "Boxing"
    },
    "flow": {
      "name": "Mobility Flow",
      "short": "Yoga-inspired mobility to undo long days at the desk and heavy days on the bar.",
      "desc": "Mobility Flow mixes yoga, controlled joint rotations and active stretching to help you move better and recover faster. It's the class our coaches recommend most, and the one members say they feel the next morning in all the right ways.",
      "intensity": 1,
      "duration": 45,
      "kcal": "150–250",
      "expect": [
        "Breathing and a slow joint-by-joint warm-up",
        "Flowing sequences that build hip, shoulder and spine mobility",
        "Longer holds for tight areas, with props to make them comfortable",
        "Five minutes of guided relaxation"
      ],
      "equipment": [
        "Yoga mats",
        "Blocks & straps",
        "Foam rollers"
      ],
      "who": "Everyone, especially if you lift, run or sit at a desk all day.",
      "tag": "Mobility"
    },
    "engine": {
      "name": "Engine Room",
      "short": "Kettlebells, ergs and carries to build an engine that doesn't quit.",
      "desc": "Engine Room is aerobic conditioning done properly: longer intervals on the rower and ski erg combined with kettlebell complexes and loaded carries. It builds the fitness that makes every other class (and the rest of life) feel easier.",
      "intensity": 2,
      "duration": 50,
      "kcal": "450–600",
      "expect": [
        "Kettlebell skill warm-up",
        "Two 15-minute conditioning blocks at a steady, hard pace",
        "Loaded carries and core work",
        "Cool-down with a short mobility sequence"
      ],
      "equipment": [
        "Kettlebells",
        "Rowers & ski ergs",
        "Farmer's carry handles"
      ],
      "who": "All levels. Pace is set by your breathing, not by the person next to you.",
      "tag": "Conditioning"
    }
  },
  "coaches": {
    "maya": {
      "name": "Maya Torres",
      "role": "Head Coach · Strength",
      "tags": [
        "Strength",
        "Nutrition"
      ],
      "classes": [
        "strength"
      ],
      "years": 11,
      "certs": [
        "CSCS (NSCA)",
        "USA Weightlifting L2",
        "Precision Nutrition L1"
      ],
      "quote": "Strength is a skill. Practice it like one and it never stops paying you back.",
      "bio": [
        "Maya founded the Strength Lab program after a decade coaching competitive lifters and complete beginners side by side. She's a national-level weightlifter and a firm believer that anyone can learn to lift well.",
        "Outside the gym she coaches a youth weightlifting club and is slowly losing a long-running deadlift bet with her dad."
      ],
      "handle": "maya.lifts"
    },
    "dev": {
      "name": "Dev Okonjo",
      "role": "Coach · HIIT & Conditioning",
      "tags": [
        "HIIT",
        "Conditioning"
      ],
      "classes": [
        "ignite",
        "engine"
      ],
      "years": 8,
      "certs": [
        "NASM CPT",
        "CrossFit L2",
        "Kettlebell Athletics Coach"
      ],
      "quote": "Every session should leave you tired, proud and wanting to come back.",
      "bio": [
        "Dev is a former 400m runner who swapped the track for coaching. His Ignite classes are famous for brutal finishers and the best playlists in the building.",
        "He programs our conditioning blocks and still races the occasional half marathon to keep himself honest."
      ],
      "handle": "dev.moves"
    },
    "jonah": {
      "name": "Jonah Reed",
      "role": "Coach · Boxing",
      "tags": [
        "Boxing",
        "HIIT"
      ],
      "classes": [
        "box"
      ],
      "years": 14,
      "certs": [
        "USA Boxing Level 2 Coach",
        "ACE CPT"
      ],
      "quote": "You don't need to fight to train like a fighter.",
      "bio": [
        "Jonah boxed as an amateur for twelve years before moving into coaching. He teaches real technique to people who have never thrown a punch and makes them look sharp within weeks.",
        "He runs our Saturday open bag sessions and a free boxing program for local teenagers."
      ],
      "handle": "jonah.boxing"
    },
    "lena": {
      "name": "Lena Brandt",
      "role": "Coach · Mobility & Yoga",
      "tags": [
        "Mobility"
      ],
      "classes": [
        "flow"
      ],
      "years": 9,
      "certs": [
        "RYT-500 Yoga Alliance",
        "FRC Mobility Specialist",
        "Breathwork Facilitator"
      ],
      "quote": "Mobility isn't stretching for the sake of it. It's buying back range you'll use every day.",
      "bio": [
        "Lena spent six years as a physical therapy assistant before teaching yoga full-time. Her Mobility Flow classes blend the two: calm, precise and quietly hard.",
        "She also runs our recovery workshops and the monthly Sunday sound bath."
      ],
      "handle": "lena.flows"
    },
    "sami": {
      "name": "Sami Haddad",
      "role": "Coach · Cycling & Endurance",
      "tags": [
        "Cycling",
        "Conditioning"
      ],
      "classes": [
        "ride"
      ],
      "years": 7,
      "certs": [
        "USA Cycling Indoor Instructor",
        "TrainingPeaks Certified Coach"
      ],
      "quote": "Watts don't lie. Show up, ride your numbers, and they will climb.",
      "bio": [
        "Sami raced road bikes across Europe before building our power-based Keel Ride program. He loves turning data into motivation and knows every member's FTP by heart.",
        "Weekends you'll find him leading the free Keel Sunday Social ride out of the Harbor club."
      ],
      "handle": "sami.rides"
    },
    "chloe": {
      "name": "Chloe Park",
      "role": "Coach · Strength & Nutrition",
      "tags": [
        "Strength",
        "Nutrition",
        "Conditioning"
      ],
      "classes": [
        "strength",
        "engine"
      ],
      "years": 6,
      "certs": [
        "Registered Dietitian (RD)",
        "NSCA CPT",
        "Pre/Postnatal Fitness Specialist"
      ],
      "quote": "Train hard, eat like you mean it, and give it more than six weeks.",
      "bio": [
        "Chloe is a registered dietitian and strength coach who helps members connect what they eat with how they train. She leads our 12-week Transform program.",
        "She's also our go-to coach for pre- and postnatal training."
      ],
      "handle": "chloe.fuel"
    }
  },
  "locations": {
    "harbor": {
      "name": "Keel Harbor",
      "hours": [
        [
          "05:30",
          "22:00"
        ],
        [
          "05:30",
          "22:00"
        ],
        [
          "05:30",
          "22:00"
        ],
        [
          "05:30",
          "22:00"
        ],
        [
          "05:30",
          "22:00"
        ],
        [
          "07:00",
          "20:00"
        ],
        [
          "08:00",
          "18:00"
        ]
      ]
    },
    "northgate": {
      "name": "Keel Northgate",
      "hours": [
        [
          "06:00",
          "21:00"
        ],
        [
          "06:00",
          "21:00"
        ],
        [
          "06:00",
          "21:00"
        ],
        [
          "06:00",
          "21:00"
        ],
        [
          "06:00",
          "21:00"
        ],
        [
          "08:00",
          "18:00"
        ],
        [
          "09:00",
          "16:00"
        ]
      ]
    }
  },
  "sessions": [
    {
      "id": "s00",
      "day": 0,
      "time": "06:00",
      "type": "ignite",
      "coach": "dev",
      "loc": "northgate",
      "cap": 20,
      "booked": 9
    },
    {
      "id": "s01",
      "day": 0,
      "time": "07:15",
      "type": "strength",
      "coach": "maya",
      "loc": "harbor",
      "cap": 12,
      "booked": 3
    },
    {
      "id": "s02",
      "day": 0,
      "time": "12:15",
      "type": "flow",
      "coach": "lena",
      "loc": "harbor",
      "cap": 18,
      "booked": 4
    },
    {
      "id": "s03",
      "day": 0,
      "time": "17:30",
      "type": "box",
      "coach": "jonah",
      "loc": "northgate",
      "cap": 16,
      "booked": 16
    },
    {
      "id": "s04",
      "day": 0,
      "time": "18:30",
      "type": "strength",
      "coach": "chloe",
      "loc": "harbor",
      "cap": 12,
      "booked": 11
    },
    {
      "id": "s05",
      "day": 0,
      "time": "19:30",
      "type": "ride",
      "coach": "sami",
      "loc": "harbor",
      "cap": 24,
      "booked": 19
    },
    {
      "id": "s06",
      "day": 1,
      "time": "06:00",
      "type": "ride",
      "coach": "sami",
      "loc": "northgate",
      "cap": 24,
      "booked": 3
    },
    {
      "id": "s07",
      "day": 1,
      "time": "07:15",
      "type": "engine",
      "coach": "dev",
      "loc": "harbor",
      "cap": 14,
      "booked": 9
    },
    {
      "id": "s08",
      "day": 1,
      "time": "12:15",
      "type": "strength",
      "coach": "maya",
      "loc": "harbor",
      "cap": 12,
      "booked": 9
    },
    {
      "id": "s09",
      "day": 1,
      "time": "17:30",
      "type": "ignite",
      "coach": "dev",
      "loc": "northgate",
      "cap": 20,
      "booked": 5
    },
    {
      "id": "s10",
      "day": 1,
      "time": "18:30",
      "type": "box",
      "coach": "jonah",
      "loc": "harbor",
      "cap": 16,
      "booked": 10
    },
    {
      "id": "s11",
      "day": 1,
      "time": "19:30",
      "type": "flow",
      "coach": "lena",
      "loc": "harbor",
      "cap": 18,
      "booked": 6
    },
    {
      "id": "s12",
      "day": 2,
      "time": "06:00",
      "type": "strength",
      "coach": "chloe",
      "loc": "northgate",
      "cap": 12,
      "booked": 12
    },
    {
      "id": "s13",
      "day": 2,
      "time": "07:15",
      "type": "ignite",
      "coach": "dev",
      "loc": "harbor",
      "cap": 20,
      "booked": 14
    },
    {
      "id": "s14",
      "day": 2,
      "time": "12:15",
      "type": "ride",
      "coach": "sami",
      "loc": "harbor",
      "cap": 24,
      "booked": 8
    },
    {
      "id": "s15",
      "day": 2,
      "time": "17:30",
      "type": "engine",
      "coach": "dev",
      "loc": "northgate",
      "cap": 14,
      "booked": 14
    },
    {
      "id": "s16",
      "day": 2,
      "time": "18:30",
      "type": "strength",
      "coach": "maya",
      "loc": "harbor",
      "cap": 12,
      "booked": 6
    },
    {
      "id": "s17",
      "day": 2,
      "time": "19:30",
      "type": "flow",
      "coach": "lena",
      "loc": "harbor",
      "cap": 18,
      "booked": 9
    },
    {
      "id": "s18",
      "day": 3,
      "time": "06:00",
      "type": "box",
      "coach": "jonah",
      "loc": "northgate",
      "cap": 16,
      "booked": 16
    },
    {
      "id": "s19",
      "day": 3,
      "time": "07:15",
      "type": "ride",
      "coach": "sami",
      "loc": "harbor",
      "cap": 24,
      "booked": 20
    },
    {
      "id": "s20",
      "day": 3,
      "time": "12:15",
      "type": "flow",
      "coach": "lena",
      "loc": "harbor",
      "cap": 18,
      "booked": 13
    },
    {
      "id": "s21",
      "day": 3,
      "time": "17:30",
      "type": "strength",
      "coach": "maya",
      "loc": "northgate",
      "cap": 12,
      "booked": 12
    },
    {
      "id": "s22",
      "day": 3,
      "time": "18:30",
      "type": "ignite",
      "coach": "dev",
      "loc": "harbor",
      "cap": 20,
      "booked": 10
    },
    {
      "id": "s23",
      "day": 3,
      "time": "19:30",
      "type": "box",
      "coach": "jonah",
      "loc": "harbor",
      "cap": 16,
      "booked": 11
    },
    {
      "id": "s24",
      "day": 4,
      "time": "06:00",
      "type": "ignite",
      "coach": "dev",
      "loc": "northgate",
      "cap": 20,
      "booked": 5
    },
    {
      "id": "s25",
      "day": 4,
      "time": "07:15",
      "type": "strength",
      "coach": "chloe",
      "loc": "harbor",
      "cap": 12,
      "booked": 2
    },
    {
      "id": "s26",
      "day": 4,
      "time": "12:15",
      "type": "engine",
      "coach": "dev",
      "loc": "harbor",
      "cap": 14,
      "booked": 13
    },
    {
      "id": "s27",
      "day": 4,
      "time": "17:30",
      "type": "ride",
      "coach": "sami",
      "loc": "northgate",
      "cap": 24,
      "booked": 24
    },
    {
      "id": "s28",
      "day": 4,
      "time": "18:30",
      "type": "box",
      "coach": "jonah",
      "loc": "harbor",
      "cap": 16,
      "booked": 11
    },
    {
      "id": "s29",
      "day": 5,
      "time": "08:00",
      "type": "strength",
      "coach": "maya",
      "loc": "harbor",
      "cap": 12,
      "booked": 0
    },
    {
      "id": "s30",
      "day": 5,
      "time": "09:00",
      "type": "ignite",
      "coach": "dev",
      "loc": "northgate",
      "cap": 20,
      "booked": 4
    },
    {
      "id": "s31",
      "day": 5,
      "time": "10:00",
      "type": "box",
      "coach": "jonah",
      "loc": "harbor",
      "cap": 16,
      "booked": 16
    },
    {
      "id": "s32",
      "day": 5,
      "time": "11:00",
      "type": "flow",
      "coach": "lena",
      "loc": "harbor",
      "cap": 18,
      "booked": 18
    },
    {
      "id": "s33",
      "day": 6,
      "time": "09:00",
      "type": "ride",
      "coach": "sami",
      "loc": "northgate",
      "cap": 24,
      "booked": 21
    },
    {
      "id": "s34",
      "day": 6,
      "time": "10:00",
      "type": "flow",
      "coach": "lena",
      "loc": "harbor",
      "cap": 18,
      "booked": 16
    },
    {
      "id": "s35",
      "day": 6,
      "time": "11:00",
      "type": "engine",
      "coach": "chloe",
      "loc": "harbor",
      "cap": 14,
      "booked": 2
    }
  ]
};

/* Keel Athletic Club — interactions. Vanilla JavaScript, no dependencies. */
(function () {
  'use strict';

  var $ = function (s, el) { return (el || document).querySelector(s); };
  var $$ = function (s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); };
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  var INTENSITY = { 1: 'Low', 2: 'Medium', 3: 'High' };
  var params = new URLSearchParams(location.search);
  // Ids from the URL must be the data's own keys, so ?type=constructor or ?id=__proto__ match nothing.
  var hasOwn = function (obj, k) { return k !== null && Object.prototype.hasOwnProperty.call(obj, k); };
  var isClass = function (k) { return hasOwn(FORGE.classes, k); };
  var isCoach = function (k) { return hasOwn(FORGE.coaches, k); };
  // ?topic= and ?plan= preselect one of the select's own options, case-insensitively
  // (?plan=Elite works like ?plan=elite); anything else is ignored.
  var optionFor = function (select, value) {
    var v = (value || '').toLowerCase();
    if (!select || !v) return null;
    return $$('option', select).filter(function (o) { return o.value !== '' && o.value.toLowerCase() === v; })[0] || null;
  };

  // The club's time zone (IANA name). "Open now", today's highlighted row and
  // today's bookable times use the time there, not on the visitor's device.
  var TIMEZONE = 'America/New_York';

  // Current date and time in TIMEZONE:
  // { iso: 'YYYY-MM-DD', day: 0-6 (0 = Sunday), mins: minutes after midnight }.
  function businessNow() {
    var parts = {};
    new Intl.DateTimeFormat('en-US', {
      timeZone: TIMEZONE, weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
    }).formatToParts(new Date()).forEach(function (p) { parts[p.type] = p.value; });
    return {
      iso: parts.year + '-' + parts.month + '-' + parts.day,
      day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday),
      mins: (+parts.hour % 24) * 60 + +parts.minute
    };
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  // Monday = 0 … Sunday = 6
  function todayIndex() { return (businessNow().day + 6) % 7; }
  function minutes(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }
  // "07:15" in the data shows as "7:15am", "22:00" as "10pm". The data stays 24-hour so times sort and compare.
  function clock(t) { var p = t.split(':'), h = +p[0]; return (h % 12 || 12) + (+p[1] ? ':' + p[1] : '') + (h < 12 ? 'am' : 'pm'); }
  function meter(level, withLabel) {
    return '<span class="inline-flex items-center gap-2"><span class="meter" data-level="' + level + '" role="img" aria-label="Intensity: ' +
      INTENSITY[level] + '"><i></i><i></i><i></i></span>' + (withLabel ? '<span class="text-xs font-semibold text-muted">' + INTENSITY[level] + '</span>' : '') + '</span>';
  }

  /* ---------- Toast ---------- */
  var toastEl = $('[data-toast]');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2800);
  }

  /* ---------- Header & mobile menu ---------- */
  var header = $('.site-header');
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var menuBtn = $('[data-menu-toggle]');
  var menu = $('#mobile-menu');
  function setMenu(open) {
    menu.hidden = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    $('[data-icon-open]', menuBtn).toggleAttribute('hidden', open);
    $('[data-icon-close]', menuBtn).toggleAttribute('hidden', !open);
    document.body.classList.toggle('overflow-hidden', open);
    header.classList.toggle('menu-open', open);
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', function () { setMenu(menu.hidden); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { setMenu(false); menuBtn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (mq) { if (mq.matches) setMenu(false); });
  }

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Scroll reveal ---------- */
  var reveals = $$('.reveal');
  function revealUpTo(target) {
    // Reveal the target and everything above it, so fast jumps never leave hidden content behind.
    var top = target.getBoundingClientRect().top;
    reveals.forEach(function (el) {
      if (!el.classList.contains('is-visible') && el.getBoundingClientRect().top <= top + 1) el.classList.add('is-visible');
    });
  }
  if (!reduceMotion && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { revealUpTo(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- Count-up numbers ---------- */
  var counters = $$('[data-count-to]');
  function countUp(el) {
    var end = +el.dataset.countTo;
    if (reduceMotion) { el.textContent = end.toLocaleString(); return; }
    var start = performance.now();
    (function step(now) {
      var p = Math.min(1, (now - start) / 1400);
      el.textContent = Math.round(end * (1 - Math.pow(1 - p, 3))).toLocaleString();
      if (p < 1) requestAnimationFrame(step);
    })(start);
  }
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); cio.unobserve(en.target); } });
    });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---------- Opening hours: open-now status ---------- */
  function openStatus(locKey) {
    var loc = FORGE.locations[locKey];
    var d = todayIndex();
    var h = loc.hours[d];
    var m = businessNow().mins;
    if (m >= minutes(h[0]) && m < minutes(h[1])) return { open: true, text: 'Open now · until ' + clock(h[1]) };
    if (m < minutes(h[0])) return { open: false, text: 'Closed · opens ' + clock(h[0]) };
    var next = loc.hours[(d + 1) % 7];
    return { open: false, text: 'Closed · opens ' + clock(next[0]) + ' tomorrow' };
  }
  $$('[data-open-status]').forEach(function (el) {
    var s = openStatus(el.dataset.openStatus);
    el.textContent = s.text;
    if (el.hasAttribute('data-open-badge')) {
      el.classList.add(s.open ? 'text-volt' : 'text-muted');
      el.classList.toggle('border-volt', s.open);
    }
  });
  $$('[data-hours]').forEach(function (dl) {
    var row = $('[data-hours-row="' + todayIndex() + '"]', dl);
    if (row) { row.classList.add('font-bold', 'text-volt'); row.setAttribute('aria-current', 'date'); }
  });

  /* ---------- Bookings (stored in localStorage) ---------- */
  var BOOK_KEY = 'forge-bookings';
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

  // Returns a clean list of known session ids, repairing corrupt or tampered storage.
  function getBookings() {
    var raw = null, stored = null;
    try { raw = safeStorage.getItem(BOOK_KEY); stored = JSON.parse(raw); } catch (e) {}
    var list = (Array.isArray(stored) ? stored : []).filter(function (id, i, all) {
      return typeof id === 'string' && FORGE.sessions.some(function (s) { return s.id === id; }) && all.indexOf(id) === i;
    });
    if (raw !== null && raw !== JSON.stringify(list)) setBookings(list);
    return list;
  }
  function setBookings(list) {
    try { safeStorage.setItem(BOOK_KEY, JSON.stringify(list)); } catch (e) {}
  }
  function isBooked(id) { return getBookings().indexOf(id) !== -1; }
  function spotsLeft(s) { return Math.max(0, s.cap - s.booked - (isBooked(s.id) ? 1 : 0)); }
  function sessionById(id) { return FORGE.sessions.filter(function (s) { return s.id === id; })[0]; }

  function spotsBadge(s) {
    if (isBooked(s.id)) return '<span class="badge bg-volt text-bg">Booked</span>';
    var left = spotsLeft(s);
    if (left === 0) return '<span class="badge border border-line text-muted">Full · waitlist</span>';
    if (left <= 3) return '<span class="badge bg-heat/15 text-heat">' + left + ' left</span>';
    return '<span class="badge border border-line text-muted">' + left + ' spots</span>';
  }

  /* ---------- Home: next up today ---------- */
  var nextUp = $('[data-next-up]');
  if (nextUp) {
    var nowMin = businessNow().mins;
    var day = todayIndex();
    var list = FORGE.sessions.filter(function (s) { return s.day === day && minutes(s.time) > nowMin; });
    var label = 'today';
    if (!list.length) {
      day = (day + 1) % 7;
      list = FORGE.sessions.filter(function (s) { return s.day === day; });
      label = 'tomorrow';
    }
    $('[data-today-label]').textContent = label;
    nextUp.innerHTML = list.slice(0, 4).map(function (s) {
      var c = FORGE.classes[s.type];
      return '<li><a href="classes.html?day=' + s.day + '" class="flex flex-wrap items-center gap-x-6 gap-y-2 px-6 py-4 transition-colors hover:bg-raised">' +
        '<span class="display w-20 text-3xl text-volt">' + clock(s.time) + '</span>' +
        '<span class="min-w-0 flex-1"><span class="block font-bold">' + esc(c.name) + '</span><span class="text-sm text-muted">' +
        esc(FORGE.coaches[s.coach].name) + ' · ' + esc(FORGE.locations[s.loc].name) + '</span></span>' +
        meter(c.intensity, true) + spotsBadge(s) + '</a></li>';
    }).join('');
  }

  /* ---------- Schedule ---------- */
  var tt = $('[data-timetable]');
  var modal = $('#booking-modal');
  var activeDay = params.has('day') ? Math.min(6, Math.max(0, +params.get('day') || 0)) : todayIndex();
  // Ids in links are matched case-insensitively (?coach=Dev works like ?coach=dev); unknown ids are ignored.
  var typeParam = (params.get('type') || '').toLowerCase();
  var coachParam = (params.get('coach') || '').toLowerCase();
  var filters = { type: isClass(typeParam) ? typeParam : '', intensity: '', coach: isCoach(coachParam) ? coachParam : '' };

  function matches(s) {
    var c = FORGE.classes[s.type];
    return (!filters.type || s.type === filters.type) &&
      (!filters.intensity || String(c.intensity) === filters.intensity) &&
      (!filters.coach || s.coach === filters.coach);
  }

  function renderTimetable() {
    if (!tt) return;
    var total = 0;
    var html = '';
    for (var d = 0; d < 7; d++) {
      var items = FORGE.sessions.filter(function (s) { return s.day === d && matches(s); });
      total += items.length;
      var isToday = d === todayIndex();
      html += '<div id="day-' + d + '" role="tabpanel" aria-labelledby="tab-' + d + '" class="' + (d === activeDay ? 'block' : 'hidden') + ' lg:block">' +
        '<h3 class="mb-3 flex items-baseline justify-between border-b border-line pb-2 text-xs font-bold tracking-[.18em] uppercase ' + (isToday ? 'text-volt' : 'text-muted') + '">' +
        DAY_NAMES[d] + (isToday ? '<span class="tracking-normal normal-case">Today</span>' : '') + '</h3>';
      if (!items.length) {
        html += '<p class="rounded-lg border border-dashed border-line p-4 text-sm text-muted">No matching classes.</p>';
      } else {
        html += '<ul class="grid gap-2">' + items.map(function (s) {
          var c = FORGE.classes[s.type];
          var booked = isBooked(s.id);
          return '<li><button type="button" data-session="' + s.id + '" class="w-full rounded-lg border p-3 text-left transition-colors hover:border-ink ' +
            (booked ? 'border-volt bg-volt/10' : 'border-line bg-surface') + '" aria-haspopup="dialog">' +
            '<span class="flex items-center justify-between gap-2"><span class="display text-xl">' + clock(s.time) + '</span>' + meter(c.intensity, false) + '</span>' +
            '<span class="mt-1 block text-sm font-bold">' + esc(c.name) + '</span>' +
            '<span class="block text-xs text-muted">' + esc(FORGE.coaches[s.coach].name.split(' ')[0]) + ' · ' + esc(FORGE.locations[s.loc].name.replace('Keel ', '')) + '</span>' +
            '<span class="mt-2 block">' + spotsBadge(s) + '</span></button></li>';
        }).join('') + '</ul>';
      }
      html += '</div>';
    }
    tt.innerHTML = html;
    $('[data-tt-count]').textContent = total + (total === 1 ? ' class' : ' classes') + ' this week';
    $$('[data-day-tab]').forEach(function (tab) {
      var sel = +tab.dataset.dayTab === activeDay;
      tab.setAttribute('aria-selected', String(sel));
      tab.tabIndex = sel ? 0 : -1;
    });
  }

  if (tt) {
    $$('[data-filter]').forEach(function (sel) {
      sel.value = filters[sel.dataset.filter] || '';
      sel.addEventListener('change', function () { filters[sel.dataset.filter] = sel.value; renderTimetable(); });
    });
    $('[data-filter-reset]').addEventListener('click', function () {
      filters = { type: '', intensity: '', coach: '' };
      $$('[data-filter]').forEach(function (sel) { sel.value = ''; });
      renderTimetable();
    });
    var tabs = $$('[data-day-tab]');
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { activeDay = i; renderTimetable(); });
      tab.addEventListener('keydown', function (e) {
        var n = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (e.key === 'Home') n = -i; else if (e.key === 'End') n = 6 - i;
        if (n === undefined) return;
        e.preventDefault();
        activeDay = (i + n + 7) % 7;
        renderTimetable();
        tabs[activeDay].focus();
      });
    });
    tt.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-session]');
      if (btn) openBooking(btn.dataset.session, btn);
    });
    $('[data-clear-bookings]').addEventListener('click', function () {
      setBookings([]);
      renderTimetable();
      toast('Your bookings have been cleared');
    });
    renderTimetable();
  }

  /* ---------- Booking modal ---------- */
  var currentSession = null;
  var returnFocus = null;
  function fillBooking() {
    var s = currentSession;
    var c = FORGE.classes[s.type];
    var booked = isBooked(s.id);
    var left = spotsLeft(s);
    var set = function (k, v) { $('[data-bm="' + k + '"]', modal).textContent = v; };
    set('when', DAY_NAMES[s.day] + ' · ' + clock(s.time));
    set('name', c.name);
    set('coach', FORGE.coaches[s.coach].name);
    set('loc', FORGE.locations[s.loc].name);
    set('duration', c.duration + ' minutes');
    set('spots', left + ' of ' + s.cap);
    set('short', c.short);
    $('[data-bm="link"]', modal).href = 'class.html?type=' + s.type;
    var action = $('[data-bm-action]', modal);
    var status = $('[data-bm="status"]', modal);
    if (booked) {
      status.textContent = "You're booked in. Arrive 10 minutes early so your coach can set you up.";
      action.textContent = 'Cancel booking';
    } else if (left === 0) {
      status.textContent = "This class is full. Join the waitlist and we'll book you in automatically if a spot opens.";
      action.textContent = 'Join waitlist';
    } else {
      status.textContent = 'Free cancellation up to 2 hours before the class starts.';
      action.textContent = 'Book my spot';
    }
  }
  function openBooking(id, from) {
    currentSession = sessionById(id);
    if (!currentSession || !modal) return;
    returnFocus = from;
    fillBooking();
    modal.showModal();
  }
  if (modal) {
    $('[data-bm-close]', modal).addEventListener('click', function () { modal.close(); });
    modal.addEventListener('click', function (e) { if (e.target === modal) modal.close(); });
    modal.addEventListener('close', function () {
      renderTimetable();
      if (returnFocus) {
        var again = $('[data-session="' + currentSession.id + '"]');
        (again || returnFocus).focus();
      }
    });
    $('[data-bm-action]', modal).addEventListener('click', function () {
      var s = currentSession;
      var list = getBookings();
      var name = FORGE.classes[s.type].name;
      if (isBooked(s.id)) {
        setBookings(list.filter(function (x) { return x !== s.id; }));
        toast('Booking canceled: ' + name);
      } else if (spotsLeft(s) === 0) {
        toast("You're on the waitlist for " + name);
        modal.close();
        return;
      } else {
        list.push(s.id);
        setBookings(list);
        toast('Booked: ' + name + ', ' + DAY_NAMES[s.day] + ' ' + clock(s.time));
      }
      fillBooking();
    });
  }

  /* ---------- Class detail page (class.html?type=…) ---------- */
  var classPage = $('[data-class-page]');
  if (classPage) {
    // Case-insensitive like the schedule (?type=BOX works like ?type=box); unknown ids show the default.
    var requested = (params.get('type') || '').toLowerCase();
    var type = isClass(requested) ? requested : classPage.dataset.default;
    var c = FORGE.classes[type];
    if (type !== classPage.dataset.default) {
      var put = function (k, html) { var el = $('[data-c="' + k + '"]', classPage); if (el) el.innerHTML = html; };
      document.title = c.name + ' — Keel Athletic Club';
      put('crumb', esc(c.name));
      put('name', esc(c.name));
      put('short', esc(c.short));
      put('duration', c.duration + ' min');
      put('kcal', esc(c.kcal));
      put('intensity', meter(c.intensity, true));
      put('book', 'Book ' + esc(c.name) + ' <svg class="size-4" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2.4" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg>');
      put('desc', esc(c.desc));
      put('who', esc(c.who));
      put('expect', c.expect.map(function (x, i) {
        return '<li class="flex gap-4"><span class="display text-2xl text-volt">0' + (i + 1) + '</span><span class="pt-1">' + esc(x) + '</span></li>';
      }).join(''));
      put('equipment', c.equipment.map(function (x) {
        return '<li class="flex gap-3"><svg class="mt-1 size-4 shrink-0 text-volt" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg><span>' + esc(x) + '</span></li>';
      }).join(''));
      put('coaches', Object.keys(FORGE.coaches).filter(function (k) { return FORGE.coaches[k].classes.indexOf(type) !== -1; }).map(function (k) {
        return '<li><a class="font-semibold text-volt hover:underline" href="trainer.html?id=' + k + '">' + esc(FORGE.coaches[k].name) + '</a></li>';
      }).join(''));
      $('[data-c="book"]', classPage).href = 'classes.html?type=' + type;
      $('[data-c="img"]', classPage).src = 'assets/img/class-' + type + '.svg';
      var meta = $('meta[name="description"]');
      if (meta) meta.content = c.short;
    }
    $$('[data-other-class]').forEach(function (a) {
      if (a.dataset.otherClass === type) a.setAttribute('aria-current', 'page');
    });
    var upcoming = FORGE.sessions.filter(function (s) { return s.type === type; });
    var t0 = todayIndex();
    upcoming.sort(function (a, b) { return ((a.day - t0 + 7) % 7) - ((b.day - t0 + 7) % 7) || minutes(a.time) - minutes(b.time); });
    $('[data-class-sessions]').innerHTML = upcoming.map(function (s) {
      return '<li><a href="classes.html?type=' + type + '&amp;day=' + s.day + '" class="card flex items-center justify-between gap-4 p-4 transition-colors hover:border-volt">' +
        '<span><span class="block text-xs font-bold tracking-widest text-muted uppercase">' + DAY_NAMES[s.day] + '</span>' +
        '<span class="display text-3xl">' + clock(s.time) + '</span><span class="block text-sm text-muted">' + esc(FORGE.coaches[s.coach].name) + ' · ' + esc(FORGE.locations[s.loc].name) + '</span></span>' +
        spotsBadge(s) + '</a></li>';
    }).join('');
  }

  /* ---------- Coaches filter ---------- */
  var coachGrid = $('[data-coach-grid]');
  if (coachGrid) {
    var cards = $$('[data-tags]', coachGrid);
    $$('[data-coach-filter]').forEach(function (btn, _, all) {
      btn.addEventListener('click', function () {
        var tag = btn.dataset.coachFilter;
        all.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        var shown = 0;
        cards.forEach(function (card) {
          var show = tag === 'All' || card.dataset.tags.toLowerCase().split(/\s+/).indexOf(tag.toLowerCase()) !== -1;
          card.hidden = !show;
          if (show) { shown++; card.classList.add('is-visible'); }
        });
        $('[data-coach-count]').textContent = shown + (shown === 1 ? ' coach' : ' coaches');
      });
    });
  }

  /* ---------- Coach profile page (trainer.html?id=…) ---------- */
  var trainerPage = $('[data-trainer-page]');
  if (trainerPage) {
    // Case-insensitive like the schedule's ?coach= (?id=DEV works like ?id=dev); unknown ids show the default.
    var requestedCoach = (params.get('id') || '').toLowerCase();
    var id = isCoach(requestedCoach) ? requestedCoach : trainerPage.dataset.default;
    if (id !== trainerPage.dataset.default) {
      var t = FORGE.coaches[id];
      var tput = function (k, html) { var el = $('[data-t="' + k + '"]', trainerPage); if (el) el.innerHTML = html; };
      document.title = t.name + ' — Coach at Keel Athletic Club';
      tput('crumb', esc(t.name));
      tput('role', esc(t.role));
      tput('name', esc(t.name));
      tput('quote', '“' + esc(t.quote) + '”');
      tput('bio', t.bio.map(function (p) { return '<p class="mt-4 text-lg leading-relaxed text-muted">' + esc(p) + '</p>'; }).join(''));
      tput('years', t.years);
      tput('weekly', FORGE.sessions.filter(function (s) { return s.coach === id; }).length);
      tput('handle', '@' + esc(t.handle));
      tput('tags', t.tags.map(function (x) { return '<span class="badge border border-line text-muted">' + esc(x) + '</span>'; }).join(''));
      tput('certs', t.certs.map(function (x) {
        return '<li class="flex gap-3"><svg class="mt-1 size-4 shrink-0 text-volt" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="3" aria-hidden="true"><path d="m4 10 4 4 8-8"/></svg><span>' + esc(x) + '</span></li>';
      }).join(''));
      tput('classes', t.classes.map(function (k) {
        return '<li><a class="chip inline-block" href="class.html?type=' + k + '">' + esc(FORGE.classes[k].name) + '</a></li>';
      }).join(''));
      tput('book', 'Book a class with ' + esc(t.name.split(' ')[0]));
      $('[data-t="book"]', trainerPage).href = 'classes.html?coach=' + id;
      var img = $('[data-t="img"]', trainerPage);
      img.src = 'assets/img/coach-' + id + '.svg';
      img.alt = 'Illustrated portrait of ' + t.name;
    }
  }

  /* ---------- Membership: monthly / yearly toggle ---------- */
  var billing = $('[data-billing-toggle]');
  if (billing) {
    billing.addEventListener('click', function () {
      var annual = billing.getAttribute('aria-checked') !== 'true';
      billing.setAttribute('aria-checked', String(annual));
      $$('[data-price]').forEach(function (el) { el.textContent = annual ? el.dataset.annual : el.dataset.monthly; });
      $$('[data-billing-note]').forEach(function (el) { el.textContent = annual ? el.dataset.annualNote : el.dataset.monthlyNote; });
    });
  }

  /* ---------- Contact: preselect topic from ?topic= ---------- */
  var topic = $('[data-topic-select]');
  var topicOpt = optionFor(topic, params.get('topic'));
  if (topicOpt) topic.value = topicOpt.value;

  /* ---------- Form validation helpers ---------- */
  function fieldMessage(f) {
    var v = f.validity;
    if (v.valueMissing) return f.type === 'checkbox' ? 'Please check this box to continue.' : 'Please fill in this field.';
    if (v.typeMismatch) return f.type === 'email' ? 'Please enter a valid email address, like name@example.com.' : 'Please check this value.';
    if (v.patternMismatch) return f.type === 'tel' ? 'Please enter a valid phone number.' : 'Please check the format.';
    if (v.tooShort) return 'Please write at least ' + f.minLength + ' characters.';
    if (v.rangeUnderflow) return f.type === 'date' ? 'Please choose today or a later date.' : 'Please enter at least ' + f.min + '.';
    if (v.rangeOverflow) return 'Please enter no more than ' + f.max + '.';
    if (v.badInput || v.stepMismatch) return 'Please enter a number.';
    return '';
  }
  function checkField(f) {
    var msg = fieldMessage(f);
    var holder = f.type === 'checkbox' ? f.closest('label').parentNode : f.parentNode;
    var err = holder.querySelector('.field-error[data-for="' + f.id + '"]');
    if (msg) {
      if (!err) {
        err = document.createElement('p');
        err.className = 'field-error';
        err.id = f.id + '-error';
        err.dataset.for = f.id;
        holder.appendChild(err);
      }
      err.textContent = msg;
      f.setAttribute('aria-invalid', 'true');
      f.setAttribute('aria-describedby', err.id);
    } else {
      if (err) err.remove();
      f.removeAttribute('aria-invalid');
      f.removeAttribute('aria-describedby');
    }
    return !msg;
  }
  function validate(fields) {
    var bad = fields.filter(function (f) { return !checkField(f); });
    if (bad.length) bad[0].focus();
    return !bad.length;
  }
  function liveValidate(form) {
    $$('input, select, textarea', form).forEach(function (f) {
      if (!f.id || f.type === 'radio') return;
      f.addEventListener('blur', function () { if (f.value || f.getAttribute('aria-invalid')) checkField(f); });
      f.addEventListener('input', function () { if (f.getAttribute('aria-invalid')) checkField(f); });
      f.addEventListener('change', function () { if (f.getAttribute('aria-invalid')) checkField(f); });
    });
  }

  // Dates can't be in the past.
  $$('[data-min-today]').forEach(function (input) {
    input.min = businessNow().iso;
  });

  /* Simple forms (contact, newsletter). To send for real, POST new FormData(form) in onValid. */
  // A short reference for the confirmation, like FA-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  function onValid(form) {
    form.reset();
    var ok = $('[data-success]', form);
    $$('[data-ref]', ok).forEach(function (el) { el.textContent = makeRef('FA'); });
    ok.classList.remove('hidden');
    ok.focus && ok.setAttribute('tabindex', '-1');
    ok.focus();
  }
  $$('form[data-validate]').forEach(function (form) {
    liveValidate(form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (validate($$('input, select, textarea', form).filter(function (f) { return f.id; }))) onValid(form);
    });
  });

  /* ---------- BMI & calorie calculator ---------- */
  var calc = $('[data-calc]');
  if (calc) {
    liveValidate(calc);
    var unitInputs = $$('input[name="units"]', calc);
    function units() { return $('input[name="units"]:checked', calc).value; }
    unitInputs.forEach(function (r) {
      r.addEventListener('change', function () {
        var imp = units() === 'imperial';
        $('[data-unit-label="height"]', calc).textContent = imp ? 'Height (in)' : 'Height (cm)';
        $('[data-unit-label="weight"]', calc).textContent = imp ? 'Weight (lb)' : 'Weight (kg)';
        var h = $('#c-height'), w = $('#c-weight');
        h.min = imp ? 20 : 50; h.max = imp ? 100 : 250; h.placeholder = imp ? '69' : '175';
        w.min = imp ? 44 : 20; w.max = imp ? 880 : 400; w.placeholder = imp ? '160' : '72';
      });
    });
    calc.addEventListener('submit', function (e) {
      e.preventDefault();
      var fields = ['#c-height', '#c-weight', '#c-age'].map(function (s) { return $(s, calc); });
      if (!validate(fields)) return;
      var imp = units() === 'imperial';
      var cm = +fields[0].value * (imp ? 2.54 : 1);
      var kg = +fields[1].value * (imp ? 0.453592 : 1);
      var age = +fields[2].value;
      var male = $('#c-sex').value === 'male';
      var bmi = kg / Math.pow(cm / 100, 2);
      var bmr = 10 * kg + 6.25 * cm - 5 * age + (male ? 5 : -161);
      var tdee = bmr * +$('#c-activity').value;
      var cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy range' : bmi < 30 ? 'Overweight' : 'Obese range';
      var out = function (k, v) { $('[data-out="' + k + '"]').textContent = v; };
      out('bmi', bmi.toFixed(1));
      out('category', cat);
      out('bmr', Math.round(bmr).toLocaleString());
      out('tdee', Math.round(tdee).toLocaleString());
      out('cut', Math.round(tdee - 450).toLocaleString());
      out('bulk', Math.round(tdee + 300).toLocaleString());
      var pos = Math.min(100, Math.max(0, (bmi - 15) / 25 * 100));
      $('[data-out="marker"]').style.left = pos + '%';
      $('[data-calc-empty]').hidden = true;
      $('[data-calc-output]').hidden = false;
    });
  }

  /* ---------- Free trial: multi-step form ---------- */
  var trial = $('[data-trial]');
  if (trial) {
    var steps = $$('[data-step]', trial);
    var indicators = $$('[data-step-indicator]');
    var back = $('[data-step-back]', trial);
    var next = $('[data-step-next]', trial);
    var submit = $('[data-step-submit]', trial);
    var step = 0;
    liveValidate(trial);
    var planOpt = optionFor($('#t-plan'), params.get('plan'));
    if (planOpt) $('#t-plan').value = planOpt.value;

    function show(n) {
      step = n;
      steps.forEach(function (s, i) { s.hidden = i !== n; });
      indicators.forEach(function (li, i) {
        var dot = li.firstElementChild;
        dot.classList.toggle('border-volt', i <= n);
        dot.classList.toggle('bg-volt', i < n);
        dot.classList.toggle('text-bg', i < n);
        dot.classList.toggle('text-volt', i === n);
        if (i === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
      });
      back.hidden = n === 0;
      next.hidden = n === steps.length - 1;
      submit.hidden = n !== steps.length - 1;
      if (n === 2) buildReview();
      var legend = $('legend', steps[n]);
      legend.setAttribute('tabindex', '-1');
      legend.focus({ preventScroll: true });
    }
    function stepValid(n) {
      if (n === 0) {
        var ok = !!$('input[name="goal"]:checked', trial);
        $('[data-goal-error]').hidden = ok;
        if (!ok) $('input[name="goal"]', trial).focus();
        return ok;
      }
      return validate($$('input, select', steps[n]).filter(function (f) { return f.id && f.required; }));
    }
    function buildReview() {
      var goal = $('input[name="goal"]:checked', trial);
      var rows = [
        ['Goal', goal ? goal.closest('label').querySelector('.font-bold').textContent : ''],
        ['Name', $('#t-first').value + ' ' + $('#t-last').value],
        ['Email', $('#t-email').value],
        ['Phone', $('#t-phone').value],
        ['Home club', $('#t-loc').selectedOptions[0].textContent.split(' · ')[0]],
        ['Start date', new Date($('#t-start').value + 'T00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })],
        ['Experience', $('input[name="level"]:checked', trial).value],
        ['Interested in', $('#t-plan').selectedOptions[0].textContent]
      ];
      $('[data-review]', trial).innerHTML = rows.map(function (r) {
        return '<div class="flex justify-between gap-4 px-4 py-3"><dt class="text-muted">' + r[0] + '</dt><dd class="text-right font-semibold">' + esc(r[1]) + '</dd></div>';
      }).join('');
    }
    $$('input[name="goal"]', trial).forEach(function (r) { r.addEventListener('change', function () { $('[data-goal-error]').hidden = true; }); });
    next.addEventListener('click', function () { if (stepValid(step)) show(step + 1); });
    back.addEventListener('click', function () { show(step - 1); });
    trial.addEventListener('submit', function (e) {
      e.preventDefault();
      if (step !== steps.length - 1) { if (stepValid(step)) show(step + 1); return; }
      if (!validate([$('#t-terms')])) return;
      // To send for real: fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(trial) })
      var done = $('[data-trial-done]');
      $('[data-done-name]', done).textContent = $('#t-first').value;
      $('[data-done-ref]', done).textContent = makeRef('FA');
      trial.hidden = true;
      $('ol[aria-label="Progress"]').hidden = true;
      done.hidden = false;
      done.focus();
    });
    show(0);
    // Don't steal focus on first load.
    if (document.activeElement && document.activeElement.tagName === 'LEGEND') document.activeElement.blur();
  }
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
