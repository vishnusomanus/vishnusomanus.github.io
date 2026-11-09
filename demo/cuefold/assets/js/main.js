/* Cuefold — catalog, rolling program, visit planner and box-office forms.
   Dates: performances carry real dates in SHOWS; with KEEP_PROGRAMME_CURRENT on, each one moves forward by
   whole program cycles (PROGRAMME_WEEKS) once it has happened, so the demo always has an upcoming program.
   Forms: initTickets and initInterest validate in the browser and show the box office's reply. See "Connecting
   the forms" further down to send them to a real endpoint. */
(function () {
  "use strict";
  const LOCALE = "en-US";
  const TIMEZONE = "America/New_York";
  // Keep the demo program current: once a performance has started, it moves forward by whole program cycles
  // (PROGRAMME_WEEKS weeks, so weekdays and times stay right). Set to false for a real program with fixed dates;
  // performances that have happened then simply drop out of the listings.
  const KEEP_PROGRAMME_CURRENT = true;
  const PROGRAMME_WEEKS = 6;
  const BOX_OFFICE = "hello@cuefold.example";
  const HANDLING_PENCE = 200; // In cents.
  const CONCESSION_OFF = 5;
  const MAX_TICKETS = 8;
  const STORAGE = { plan: "cuefold-plan-v1", access: "cuefold-access-v1" };
  const SHOWS = [
    {
      id: "staircase",
      title: "The Borrowed Staircase",
      genre: "Drama",
      duration: 105,
      price: 30,
      age: "12+",
      summary:
        "An unexpected flight of stairs arrives in a shared hallway. Three neighbors must decide where it leads.",
      story:
        "A gently surreal story about belonging, with a revolving set and an argument over a very ordinary doormat.",
      warning: "Contains brief strong language and a sudden bell.",
      captioned: true,
      audio: true,
      room: "Studio",
      company: "Cuefold",
      kind: "A Cuefold production",
      credits: [
        ["Written by", "Leontine Grayburn"],
        ["Directed by", "Catriona Henshaw"],
      ],
      interval: true,
      relaxed: false,
      dates: ["2026-10-21 19:45", "2026-10-22 19:45"],
    },
    {
      id: "kettle",
      title: "When the Kettle Sings",
      genre: "Comedy",
      duration: 80,
      price: 26,
      age: "10+",
      summary: "One kitchen, four very different cups of tea and a kettle with an opinion on everything.",
      story: "A fast, warm-hearted comedy built around a family kitchen and the things nobody quite manages to say.",
      warning: "Gentle comic arguments and a whistling kettle.",
      captioned: false,
      audio: false,
      room: "Main room",
      company: "Pennyroyal Theater",
      kind: "Visiting company",
      credits: [
        ["Written by", "Rhett Kittow"],
        ["Directed by", "Beatrix Varley"],
      ],
      interval: false,
      relaxed: false,
      dates: ["2026-10-20 19:30", "2026-10-21 19:30"],
    },
    {
      id: "cartographer",
      title: "The Cartographer’s Pocket",
      genre: "Spoken word",
      duration: 70,
      price: 20,
      age: "14+",
      summary: "A spoken-word expedition through the places we carry without a map.",
      story:
        "Poems, found recordings and a desk full of folded paper make a journey through memory and unfamiliar streets.",
      warning: "References to bereavement.",
      captioned: false,
      audio: false,
      room: "Main room",
      company: "Foldline Poets with Cuefold",
      kind: "Co-production",
      credits: [
        ["Written and performed by", "Ezra Okonedo"],
        ["Sound by", "Maren Holt"],
      ],
      interval: false,
      relaxed: false,
      dates: ["2026-10-23 19:30", "2026-10-24 19:30"],
    },
    {
      id: "platform",
      title: "Small Hours at Platform Nine",
      genre: "Drama",
      duration: 110,
      price: 32,
      age: "14+",
      summary:
        "The last train has gone. A station janitor and a stranded traveler have one night to put the world right.",
      story: "An intimate two-hander about work, friendship and a very unreliable station clock.",
      warning: "Strong language; themes of loneliness.",
      captioned: true,
      audio: false,
      room: "Studio",
      company: "Cuefold",
      kind: "A Cuefold production",
      credits: [
        ["Written by", "Davis Strachan"],
        ["Directed by", "Maddox Callow"],
      ],
      interval: true,
      relaxed: false,
      dates: ["2026-10-27 19:45", "2026-10-28 19:45"],
    },
    {
      id: "astronaut",
      title: "The Paper Astronaut",
      genre: "Family",
      duration: 55,
      price: 15,
      age: "5+",
      summary: "A cardboard rocket takes a young explorer much further than the backyard.",
      story:
        "Handmade puppets, big shadows and a pocket-sized planetarium invite families on a generous little adventure.",
      warning: "A few moments of darkness; the 11am performance is relaxed.",
      captioned: false,
      audio: true,
      room: "Main room",
      company: "Tumbledown Puppets",
      kind: "Visiting company",
      credits: [
        ["Devised by", "Wilfred Pinnock"],
        ["Puppets by", "Amari Lowe"],
      ],
      interval: false,
      relaxed: true,
      dates: ["2026-10-24 11:00", "2026-10-24 14:00"],
    },
    {
      id: "attic",
      title: "A River in the Attic",
      genre: "Movement",
      duration: 65,
      price: 24,
      age: "10+",
      summary: "Two dancers discover that the water above their heads remembers everything.",
      story: "A playful movement piece using rope, reflected light and a set that changes from rafters to riverbank.",
      warning: "Moving light patterns; no strobe.",
      captioned: false,
      audio: false,
      room: "Main room",
      company: "Rafterlight Dance with Cuefold",
      kind: "Co-production",
      credits: [
        ["Choreography by", "Lachlan Brannock"],
        ["Set by", "Corwin Ardern"],
      ],
      interval: false,
      relaxed: false,
      dates: ["2026-10-30 19:30", "2026-10-31 19:30"],
    },
    {
      id: "clockmaker",
      title: "The Clockmaker’s Guests",
      genre: "Drama",
      duration: 100,
      price: 30,
      age: "12+",
      summary: "At closing time, every clock in the shop stops for a different reason.",
      story: "A chamber mystery about a forgotten appointment and the quiet art of beginning again.",
      warning: "A loud mechanical chime before intermission.",
      captioned: true,
      audio: false,
      room: "Studio",
      company: "Cuefold",
      kind: "A Cuefold production",
      credits: [
        ["Written by", "Bartholomew Venn"],
        ["Directed by", "Catriona Henshaw"],
      ],
      interval: true,
      relaxed: false,
      dates: ["2026-11-04 19:45", "2026-11-05 19:45"],
    },
    {
      id: "salt",
      title: "Salt on the Windowsill",
      genre: "Music",
      duration: 75,
      price: 26,
      age: "8+",
      summary: "An acoustic evening of songs collected at the edge of the sea.",
      story: "Three voices, strings and small percussion tell stories of departures, kitchen windows and coming home.",
      warning: "Unamplified acoustic music.",
      captioned: false,
      audio: false,
      room: "Main room",
      company: "Lowtide Trio",
      kind: "Visiting company",
      credits: [["With", "Nan Moberly, Peri Pugh and Cassius Meeke"]],
      interval: true,
      relaxed: false,
      dates: ["2026-11-03 19:30", "2026-11-04 19:30"],
    },
    {
      id: "bell",
      title: "After the Last Bell",
      genre: "Comedy",
      duration: 85,
      price: 26,
      age: "12+",
      summary: "A school custodian starts a club for everyone who never liked clubs.",
      story:
        "Dry humor meets an unexpectedly elaborate raffle in a story about finding your people later than planned.",
      warning: "Occasional mild language.",
      captioned: false,
      audio: true,
      room: "Main room",
      company: "Dovecote Players with Cuefold",
      kind: "Co-production",
      credits: [
        ["Written by", "Winnie Ashcombe"],
        ["Directed by", "Lou Partridge"],
      ],
      interval: false,
      relaxed: false,
      dates: ["2026-11-06 19:30", "2026-11-07 19:30"],
    },
    {
      id: "acrobat",
      title: "The Quiet Acrobat",
      genre: "Movement",
      duration: 60,
      price: 24,
      age: "7+",
      summary: "A balancing act for one performer, a wooden chair and a remarkable amount of string.",
      story:
        "Physical theater and object play turn small acts of courage into something worth holding your breath for.",
      warning: "Quiet participatory moments; no audience member is brought on stage.",
      captioned: true,
      audio: false,
      room: "Studio",
      company: "Cuefold",
      kind: "A Cuefold production",
      credits: [
        ["Performed by", "Isadora Brisk"],
        ["Directed by", "Anselm Trevaskis"],
      ],
      interval: false,
      relaxed: false,
      dates: ["2026-11-10 19:45", "2026-11-11 19:45"],
    },
    {
      id: "moon",
      title: "Under a Borrowed Moon",
      genre: "Drama",
      duration: 95,
      price: 30,
      age: "12+",
      summary: "A rooftop gardener and a night doorman share the same view, twenty years apart.",
      story: "A tender play about the care we leave behind, told under a moon that is never quite where it should be.",
      warning: "Discussion of family illness.",
      captioned: false,
      audio: false,
      room: "Main room",
      company: "Wooden Nickel Theater",
      kind: "Visiting company",
      credits: [
        ["Written by", "Perpetua Gale"],
        ["Directed by", "Hugo Larch"],
      ],
      interval: true,
      relaxed: false,
      dates: ["2026-11-13 19:30", "2026-11-14 19:30"],
    },
    {
      id: "umbrellas",
      title: "The Orchard of Umbrellas",
      genre: "Family",
      duration: 60,
      price: 16,
      age: "4+",
      summary: "In a town where it always rains, one gardener plants something unexpected.",
      story: "Colorful object puppetry, gentle music and a forest of opening umbrellas celebrate patient curiosity.",
      warning: "Suitable for a first theater visit; the 11am performance is relaxed.",
      captioned: false,
      audio: false,
      room: "Main room",
      company: "Puddlejump Puppetry with Cuefold",
      kind: "Co-production",
      credits: [["Devised by", "Saffi Drummond"]],
      interval: false,
      relaxed: true,
      dates: ["2026-11-07 11:00", "2026-11-07 14:00"],
    },
    {
      id: "unsaid",
      title: "A Map of Unsaid Things",
      genre: "Spoken word",
      duration: 75,
      price: 20,
      age: "14+",
      summary: "Letters never mailed become the streets of an imaginary city.",
      story: "A writer and a live sound artist build an evening from the words that usually stay in a drawer.",
      warning: "Themes of separation and grief.",
      captioned: true,
      audio: true,
      room: "Studio",
      company: "Cuefold",
      kind: "A Cuefold production",
      credits: [
        ["Words by", "Odile Hollins"],
        ["Live sound by", "Maren Holt"],
      ],
      interval: false,
      relaxed: false,
      dates: ["2026-11-18 19:45", "2026-11-19 19:45"],
    },
    {
      id: "cabinet",
      title: "The Waiting Cabinet",
      genre: "Comedy",
      duration: 90,
      price: 28,
      age: "12+",
      summary: "An office waiting room acquires a filing cabinet that refuses to be ignored.",
      story: "A beautifully awkward comedy about waiting in line, forms and the small rebellion of taking a real lunch break.",
      warning: "Brief strong language.",
      captioned: false,
      audio: false,
      room: "Main room",
      company: "Quillfeather Theater",
      kind: "Visiting company",
      credits: [
        ["Written by", "Alton Tusk"],
        ["Directed by", "Rosalie Pellow"],
      ],
      interval: true,
      relaxed: false,
      dates: ["2026-11-17 19:30", "2026-11-18 19:30"],
    },
    {
      id: "giant",
      title: "Footnotes for a Giant",
      genre: "Family",
      duration: 55,
      price: 15,
      age: "6+",
      summary: "A very small librarian must return a very large overdue book.",
      story: "Shadow puppets and enormous paper feet bring a bookish quest to life, with room for everyone to help.",
      warning: "A playful giant’s voice; the 11am performance is relaxed.",
      captioned: false,
      audio: false,
      room: "Main room",
      company: "Inkwell Shadow Theater with Cuefold",
      kind: "Co-production",
      credits: [["Devised by", "Rosamund Kestle"]],
      interval: false,
      relaxed: true,
      dates: ["2026-11-21 11:00", "2026-11-21 14:00"],
    },
    {
      id: "ocean",
      title: "The Threadbare Ocean",
      genre: "Movement",
      duration: 70,
      price: 26,
      age: "10+",
      summary: "A sailmaker stitches together a sea made from all the journeys she has missed.",
      story: "Fabric, dance and recorded coastal voices make a tactile, quietly absorbing voyage.",
      warning: "Low atmospheric sound.",
      captioned: true,
      audio: false,
      room: "Studio",
      company: "Cuefold",
      kind: "A Cuefold production",
      credits: [
        ["Directed by", "Catriona Henshaw"],
        ["Fabric design by", "Ivo Teague"],
      ],
      interval: false,
      relaxed: false,
      dates: ["2026-11-24 19:45", "2026-11-25 19:45"],
    },
    {
      id: "bus",
      title: "The Night Bus Orchestra",
      genre: "Music",
      duration: 85,
      price: 28,
      age: "8+",
      summary: "Every stop adds a new instrument. Nobody is quite sure who is driving.",
      story:
        "An inventive acoustic ensemble takes a late-night route through folk tunes, original songs and street rhythms.",
      warning: "Amplified acoustic music; ear protection available.",
      captioned: false,
      audio: true,
      room: "Main room",
      company: "The Lamplit Ensemble",
      kind: "Visiting company",
      credits: [["Musical direction by", "Lorcan Rowntree"]],
      interval: true,
      relaxed: false,
      dates: ["2026-11-20 19:30", "2026-11-21 19:30"],
    },
    {
      id: "island",
      title: "Almost an Island",
      genre: "Drama",
      duration: 100,
      price: 32,
      age: "12+",
      summary: "A tiny ferry service is about to close. Its two passengers have other ideas.",
      story: "A funny, clear-eyed story about a place on the edge and the people determined to keep it connected.",
      warning: "Occasional strong language and discussion of loss.",
      captioned: false,
      audio: false,
      room: "Main room",
      company: "Ferrylight Theater",
      kind: "Visiting company",
      credits: [["Written by", "Rosalie Pellow"]],
      interval: true,
      relaxed: false,
      dates: ["2026-11-27 19:30", "2026-11-28 19:30"],
    },
  ];
  const GENRES = {
    all: "Every genre",
    Drama: "Drama",
    Comedy: "Comedy",
    Family: "Family",
    Movement: "Movement",
    Music: "Music",
    "Spoken word": "Spoken word",
  };
  const ACCESS_FILTERS = {
    all: "Every performance",
    relaxed: "Relaxed",
    captioned: "Captioned",
    audio: "Audio described",
  };
  // Date windows on the program page, in days from today. The program always runs about six weeks ahead.
  const PERIODS = { all: 0, 7: 7, 14: 14, 28: 28 };
  const SEATING = {
    any: "Any comfortable seat",
    front: "Front three rows",
    aisle: "An aisle seat",
    wheelchair: "A wheelchair space",
  };
  const ACCESS_NOTES = {
    stepfree: "Step-free seat or wheelchair space",
    hearing: "Assistive listening device",
    quiet: "Directions to the quiet room",
    companion: "Companion seat information",
  };
  // Workshops follow a rule rather than dates: Saturday mornings in the Studio, starting with the first Saturday at
  // least WORKSHOP_NOTICE_DAYS away, then one a week in this order.
  const WORKSHOP_NOTICE_DAYS = 3;
  const WORKSHOPS = [
    {
      id: "story",
      title: "Story into scene",
      week: 0,
      time: "10:30am",
      minutes: 120,
      price: 35,
      lead: "Catriona Henshaw",
      art: "workshop-story",
      text: "Turn a memory, a found sentence or a small observation into a scene. Bring a notebook; we’ll bring the possibilities.",
    },
    {
      id: "movement",
      title: "Moving without words",
      week: 1,
      time: "10:30am",
      minutes: 90,
      price: 30,
      lead: "Melisande Alderton",
      art: "workshop-movement",
      text: "Explore how a gesture can tell a story. Work seated or standing, at your own pace. No dance experience needed.",
    },
    {
      id: "objects",
      title: "Small objects, big stories",
      week: 2,
      time: "10:30am",
      minutes: 120,
      price: 35,
      lead: "Anselm Trevaskis",
      art: "workshop-objects",
      text: "An ordinary object becomes a character through play, rhythm and attention. A practical introduction to object theater.",
    },
  ];
  const own = (map, key) => Object.prototype.hasOwnProperty.call(map, key);
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  const money = (pence) =>
    new Intl.NumberFormat(LOCALE, {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: pence % 100 ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(pence / 100);
  const count = (n, singular, plural = singular + "s") => `${n} ${n === 1 ? singular : plural}`;
  const clampInt = (raw, min, max, fallback = min) => {
    const n = Number(raw);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, Math.floor(n))) : fallback;
  };
  const isRecord = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
  const parameters = new URLSearchParams(location.search);
  function param(key, map, fallback) {
    const val = parameters.get(key);
    return val !== null && own(map, val) ? val : fallback;
  }
  function announce(message) {
    const region = $("[data-announcement]");
    if (region) region.textContent = message;
  }

  // Keep every saved feature useful in opaque-origin iframes and private browsers.
  const safeStorage = (() => {
    const memory = new Map();
    let available = true;
    try {
      const key = "cuefold-check";
      window.localStorage.setItem(key, "1");
      window.localStorage.removeItem(key);
    } catch (_) {
      available = false;
    }
    return {
      getItem(key) {
        if (available) {
          try {
            const v = window.localStorage.getItem(key);
            if (v !== null) memory.set(key, v);
            return v;
          } catch (_) {
            available = false;
          }
        }
        return memory.has(key) ? memory.get(key) : null;
      },
      setItem(key, value) {
        memory.set(key, String(value));
        if (available) {
          try {
            window.localStorage.setItem(key, String(value));
          } catch (_) {
            available = false;
          }
        }
      },
      removeItem(key) {
        memory.delete(key);
        if (available) {
          try {
            window.localStorage.removeItem(key);
          } catch (_) {
            available = false;
          }
        }
      },
    };
  })();
  function readJSON(key) {
    const raw = safeStorage.getItem(key);
    if (raw === null) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed === null) safeStorage.removeItem(key);
      return parsed;
    } catch (_) {
      safeStorage.removeItem(key);
      return null;
    }
  }
  function writeJSON(key, value) {
    safeStorage.setItem(key, JSON.stringify(value));
  }
  // The venue's wall clock: today's date and minutes past midnight in Staunton, whatever the visitor's time zone.
  function londonNow() {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    }).formatToParts(new Date());
    const get = (t) => parts.find((p) => p.type === t).value;
    return {
      day: `${get("year")}-${get("month")}-${get("day")}`,
      minutes: Number(get("hour")) * 60 + Number(get("minute")),
    };
  }
  const NOW = londonNow();
  // Calendar arithmetic uses midday UTC, so daylight-saving changes never move a date.
  function londonToday() {
    return new Date(NOW.day + "T12:00:00Z");
  }
  function dateKey(date) {
    return date.toISOString().slice(0, 10);
  }
  function addDays(date, days) {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  }
  const dayNumber = (key) => Math.round(Date.parse(key + "T12:00:00Z") / 864e5);
  // Minutes on the venue's clock, comparable across days.
  const venueMinutes = (key, hour, minute) => dayNumber(key) * 1440 + hour * 60 + minute;
  const NOW_MINUTES = venueMinutes(NOW.day, 0, NOW.minutes);
  // A performance that has started moves forward by whole program cycles until it is upcoming again.
  function currentDate(key, hour, minute) {
    const start = venueMinutes(key, hour, minute);
    if (!KEEP_PROGRAMME_CURRENT || start > NOW_MINUTES) return key;
    const cycle = PROGRAMME_WEEKS * 7;
    const cycles = Math.floor((NOW_MINUTES - start) / (cycle * 1440)) + 1;
    return dateKey(addDays(new Date(key + "T12:00:00Z"), cycles * cycle));
  }
  const showById = Object.fromEntries(SHOWS.map((show) => [show.id, show]));
  // Two performances per production: the first is captioned (and relaxed, for family shows) where the show offers
  // it; the second is audio described where offered. IDs stay the same as dates roll, so saved plans survive.
  const PERFORMANCES = SHOWS.flatMap((show) =>
    show.dates.map((when, index) => {
      const [written, time] = when.split(" ");
      const [hour, minute] = time.split(":").map(Number);
      return {
        id: show.id + "-" + "ab"[index],
        show: show.id,
        date: currentDate(written, hour, minute),
        hour,
        minute,
        duration: show.duration,
        relaxed: show.relaxed && index === 0,
        captioned: show.captioned && index === 0,
        audio: show.audio && index === 1,
      };
    }),
  )
    .filter((p) => venueMinutes(p.date, p.hour, p.minute) > NOW_MINUTES)
    .sort((a, b) => a.date.localeCompare(b.date) || a.hour - b.hour || a.minute - b.minute || a.id.localeCompare(b.id));
  const performanceById = Object.fromEntries(PERFORMANCES.map((p) => [p.id, p]));
  function dayLabel(key, options = { weekday: "short", day: "numeric", month: "short" }) {
    return new Intl.DateTimeFormat(LOCALE, { ...options, timeZone: "UTC" }).format(new Date(key + "T12:00:00Z"));
  }
  // Venue times on a 12-hour clock, in the same style as the opening hours: 11am, 7:45pm.
  function clockTime(minutes) {
    const hour = Math.floor(minutes / 60),
      minute = minutes % 60;
    return `${hour % 12 || 12}${minute ? ":" + String(minute).padStart(2, "0") : ""}${hour < 12 ? "am" : "pm"}`;
  }
  function timeLabel(p) {
    return clockTime(p.hour * 60 + p.minute);
  }
  function performanceLabel(p) {
    return `${dayLabel(p.date)} · ${timeLabel(p)}`;
  }
  function stamp(p) {
    return venueMinutes(p.date, p.hour, p.minute) * 60000;
  }
  function showPerformances(show) {
    return PERFORMANCES.filter((p) => p.show === show.id);
  }
  // Productions in the order of their next performance, optionally leaving some out.
  function upcomingShows(limit, exclude = []) {
    const seen = [];
    PERFORMANCES.forEach((p) => {
      if (!seen.includes(p.show) && !exclude.includes(p.show)) seen.push(p.show);
    });
    return seen.slice(0, limit).map((id) => showById[id]);
  }
  function concession(show) {
    return show.price - CONCESSION_OFF;
  }
  function runningTime(show) {
    return `${show.duration} minutes, ${show.interval ? "including an intermission" : "no intermission"}`;
  }
  function performanceAccess(p) {
    return [p.relaxed ? "Relaxed" : null, p.captioned ? "Captioned" : null, p.audio ? "Audio described" : null].filter(
      Boolean,
    );
  }
  // Workshop dates by rule: the first Saturday at least WORKSHOP_NOTICE_DAYS ahead, plus `week` weeks.
  function workshopDate(w) {
    const first = addDays(londonToday(), WORKSHOP_NOTICE_DAYS);
    return dateKey(addDays(first, ((6 - first.getUTCDay() + 7) % 7) + w.week * 7));
  }

  // The visit plan is stored as { items: [{ id, date }], passed: [{ id, date }] }. The date records which
  // performance was saved: while it matches, the entry stays (dates roll only once a performance has happened).
  // When a saved performance has taken place it moves to `passed`, and the planner says so once.
  const PLAN_LIMIT = 36;
  const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;
  const validEntry = (item) =>
    isRecord(item) &&
    typeof item.id === "string" &&
    /^[a-z]+-[ab]$/.test(item.id) &&
    own(showById, item.id.slice(0, -2)) &&
    typeof item.date === "string" &&
    DATE_KEY.test(item.date);
  function readPlanRecord() {
    const data = readJSON(STORAGE.plan);
    if (data === null) return { ids: [], passed: [] };
    if (!isRecord(data) || !Array.isArray(data.items)) {
      safeStorage.removeItem(STORAGE.plan);
      return { ids: [], passed: [] };
    }
    const ids = [];
    const passed = (Array.isArray(data.passed) ? data.passed : []).filter(validEntry).slice(-PLAN_LIMIT);
    data.items.forEach((item) => {
      if (!validEntry(item) || ids.includes(item.id) || ids.length >= PLAN_LIMIT) return;
      const p = own(performanceById, item.id) ? performanceById[item.id] : null;
      if (p && p.date === item.date) ids.push(item.id);
      else if (item.date <= NOW.day) passed.push({ id: item.id, date: item.date });
    });
    const record = { items: ids.map((id) => ({ id, date: performanceById[id].date })), passed };
    if (JSON.stringify(data) !== JSON.stringify(record)) writeJSON(STORAGE.plan, record);
    return { ids, passed };
  }
  function readPlan() {
    return readPlanRecord().ids;
  }
  function savePlan(ids, passed = readPlanRecord().passed) {
    writeJSON(STORAGE.plan, { items: ids.map((id) => ({ id, date: performanceById[id].date })), passed });
  }
  function readAccess() {
    const data = readJSON(STORAGE.access);
    const clean = Object.fromEntries(
      Object.keys(ACCESS_NOTES).map((key) => [key, isRecord(data) && own(data, key) && data[key] === true]),
    );
    if (data !== null && JSON.stringify(data) !== JSON.stringify(clean)) writeJSON(STORAGE.access, clean);
    return clean;
  }
  function accessText() {
    const access = readAccess();
    return Object.keys(ACCESS_NOTES)
      .filter((key) => access[key])
      .map((key) => ACCESS_NOTES[key]);
  }
  function saveButton(p, extra = "") {
    const saved = readPlan().includes(p.id);
    const show = showById[p.show];
    return `<button type="button" class="save-button ${extra}" data-save="${p.id}" aria-pressed="${saved}" aria-label="${saved ? "Remove" : "Save"} ${esc(show.title)}, ${esc(performanceLabel(p))}"><span aria-hidden="true">${saved ? "−" : "+"}</span><span data-save-label>${saved ? "Remove" : "Save"}</span></button>`;
  }
  const ARROW =
    '<svg class="inline-block size-4 shrink-0 align-middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg>';
  // A production card. The footer sits at the bottom (mt-auto) so rules and Save buttons line up across a row.
  function card(show, p, compact = false) {
    const tags = performanceAccess(p)
      .map((label) => `<span class="tag">${label}</span>`)
      .join("");
    return `<article class="flex min-w-0 flex-col" data-show-card="${show.id}"><a href="show.html?show=${show.id}" class="group block overflow-hidden"><img src="assets/img/${show.id}.svg" alt="Stage illustration for ${esc(show.title)}" width="600" height="600" class="poster-image transition-transform duration-500 motion-reduce:transition-none group-hover:scale-[1.025]" loading="lazy"></a><div class="mt-5 flex items-start justify-between gap-3"><p class="eyebrow">${esc(show.genre)} · ${show.age}</p><span class="shrink-0 text-sm">From ${money(concession(show) * 100)}</span></div><h3 class="mt-3 font-display ${compact ? "text-xl" : "text-2xl"} leading-tight tracking-[-.035em]"><a href="show.html?show=${show.id}" class="hover:underline underline-offset-4">${esc(show.title)}</a></h3><p class="mt-3 text-sm">${esc(performanceLabel(p))} · ${esc(show.room)}</p><p class="mt-3 text-muted">${esc(show.summary)}</p>${tags ? `<div class="mt-4 flex flex-wrap gap-2">${tags}</div>` : ""}<div class="mt-auto pt-5"><div class="flex flex-wrap items-center justify-between gap-3 border-t border-rule pt-4"><a class="text-sm underline underline-offset-4" href="show.html?show=${show.id}">Explore the show ${ARROW}</a>${saveButton(p)}</div></div></article>`;
  }
  function fillCards(selector, shows) {
    const target = $(selector);
    if (target)
      target.innerHTML = shows
        .filter((s) => showPerformances(s).length)
        .map((s) => card(s, showPerformances(s)[0], true))
        .join("");
  }
  function updateSavedUI() {
    const ids = readPlan();
    $$("[data-plan-count]").forEach((el) => {
      el.textContent = String(ids.length);
    });
    $$("[data-save]").forEach((btn) => {
      const id = btn.dataset.save;
      if (!own(performanceById, id)) return;
      const p = performanceById[id],
        show = showById[p.show],
        saved = ids.includes(id);
      btn.setAttribute("aria-pressed", String(saved));
      btn.setAttribute("aria-label", `${saved ? "Remove" : "Save"} ${show.title}, ${performanceLabel(p)}`);
      const label = $("[data-save-label]", btn);
      if (label) label.textContent = saved ? "Remove" : "Save";
      const icon = $("[aria-hidden]", btn);
      if (icon) icon.textContent = saved ? "−" : "+";
    });
    if ($("[data-plan-items]")) renderPlan();
  }
  document.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-save]");
    if (!btn) return;
    const id = btn.dataset.save;
    if (!own(performanceById, id)) return;
    const ids = readPlan();
    const index = ids.indexOf(id);
    if (index >= 0) ids.splice(index, 1);
    else ids.push(id);
    savePlan(ids);
    updateSavedUI();
    announce(
      `${showById[performanceById[id].show].title} ${index >= 0 ? "removed from" : "added to"} your program. ${count(ids.length, "performance")} saved.`,
    );
  });
  function initMenu() {
    const button = $("[data-menu-toggle]"),
      menu = $("#mobile-menu");
    if (!button || !menu) return;
    function setOpen(open, returnFocus = false) {
      menu.hidden = !open;
      button.setAttribute("aria-expanded", String(open));
      button.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (returnFocus) button.focus();
    }
    button.addEventListener("click", () => setOpen(button.getAttribute("aria-expanded") !== "true"));
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) setOpen(false, true);
    });
    document.addEventListener("click", (event) => {
      if (!menu.hidden && !menu.contains(event.target) && !button.contains(event.target)) setOpen(false);
    });
    matchMedia("(min-width:1280px)").addEventListener("change", (event) => {
      if (event.matches) setOpen(false);
    });
  }
  function initReveal() {
    const items = $$(".reveal");
    if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion:reduce)").matches) {
      items.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            items
              .filter((el) => el.getBoundingClientRect().top <= entry.boundingClientRect.bottom)
              .forEach((el) => {
                el.classList.add("is-visible");
                observer.unobserve(el);
              });
          }
        });
      },
      { threshold: 0.08 },
    );
    items.forEach((el) => observer.observe(el));
  }
  function initProgramme() {
    const form = $("[data-programme-filters]");
    if (!form) return;
    const fields = {
      search: form.elements.search,
      genre: form.elements.genre,
      period: form.elements.period,
      access: form.elements.access,
    };
    fields.genre.value = param("genre", GENRES, "all");
    fields.access.value = param("access", ACCESS_FILTERS, "all");
    fields.period.value = param("period", PERIODS, "all");
    const initialSearch = parameters.get("search");
    if (initialSearch) fields.search.value = initialSearch.slice(0, 100);
    function render() {
      const query = fields.search.value.trim().toLocaleLowerCase(LOCALE).slice(0, 100);
      const genre = own(GENRES, fields.genre.value) ? fields.genre.value : "all";
      const period = own(PERIODS, fields.period.value) ? PERIODS[fields.period.value] : 0;
      const access = own(ACCESS_FILTERS, fields.access.value) ? fields.access.value : "all";
      const end = period ? dateKey(addDays(londonToday(), period)) : null;
      const matches = SHOWS.map((show) => ({
        show,
        performances: showPerformances(show).filter(
          (p) => (!end || p.date < end) && (access === "all" || p[access] === true),
        ),
      }))
        .filter(
          ({ show, performances }) =>
            performances.length &&
            (genre === "all" || show.genre === genre) &&
            `${show.title} ${show.summary} ${show.genre}`.toLocaleLowerCase(LOCALE).includes(query),
        )
        .sort((a, b) => stamp(a.performances[0]) - stamp(b.performances[0]));
      $("[data-programme]").innerHTML = matches.map(({ show, performances }) => card(show, performances[0])).join("");
      $("[data-result-count]").textContent = `${count(matches.length, "production")} · ${count(
        matches.reduce((n, m) => n + m.performances.length, 0),
        "performance",
      )} ahead`;
      $("[data-programme-empty]").hidden = matches.length > 0;
      updateSavedUI();
    }
    function reset() {
      form.reset();
      render();
      fields.search.focus();
    }
    form.addEventListener("input", render);
    form.addEventListener("change", render);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      render();
    });
    $("[data-reset-filters]").addEventListener("click", reset);
    $("[data-empty-reset]").addEventListener("click", reset);
    render();
  }
  function initShow() {
    const detail = $("[data-show-detail]");
    if (!detail) return;
    const id = param("show", showById, SHOWS[0].id),
      show = showById[id],
      performances = showPerformances(show);
    document.title = show.title + " — Cuefold";
    $('meta[name="description"]').content = show.summary;
    $('meta[property="og:title"]').content = show.title + " — Cuefold";
    $('meta[property="og:description"]').content = show.summary;
    const art = $("[data-show-art]");
    art.src = `assets/img/${show.id}.svg`;
    art.alt = `Stage illustration for ${show.title}`;
    $("[data-show-company]").textContent =
      `${show.kind === "Visiting company" ? `Visiting company: ${show.company}` : show.kind === "Co-production" ? show.company : show.kind} · ${show.room}`;
    $("[data-show-genre]").textContent = `${show.genre} / ${show.age}`;
    $("[data-show-title]").textContent = show.title;
    $("[data-show-summary]").textContent = show.summary;
    $("[data-show-story]").textContent = show.story;
    $("[data-show-warning]").textContent = show.warning;
    const facts = [
      ["Running time", runningTime(show)],
      ["Tickets", `${money(show.price * 100)} standard / ${money(concession(show) * 100)} discount`],
      ...show.credits,
    ];
    $("[data-show-facts]").innerHTML = facts
      .map(([term, value]) => `<div><dt class="eyebrow">${esc(term)}</dt><dd class="mt-2">${esc(value)}</dd></div>`)
      .join("");
    $("[data-show-performances]").innerHTML = performances.length
      ? performances
          .map(
            (p) =>
              `<article class="flex flex-wrap items-center justify-between gap-5 border border-ink bg-panel p-5"><div><h3 class="font-display text-xl">${esc(performanceLabel(p))}</h3><div class="mt-2 flex flex-wrap gap-2">${
                performanceAccess(p)
                  .map((label) => `<span class="tag">${label}</span>`)
                  .join("") || '<span class="text-sm text-muted">Standard performance · assistive listening available</span>'
              }</div></div><div class="flex flex-wrap gap-3">${saveButton(p)}<a class="btn" href="tickets.html?show=${show.id}&amp;performance=${p.id}">Request tickets ${ARROW}</a></div></article>`,
          )
          .join("")
      : '<p class="border border-ink bg-panel p-5">No performances are on sale at the moment. Call the box office at (540) 555-0147 to hear about return dates.</p>';
    const related = SHOWS.filter((s) => s.id !== show.id && showPerformances(s).length).sort(
      (a, b) =>
        (b.genre === show.genre) - (a.genre === show.genre) ||
        stamp(showPerformances(a)[0]) - stamp(showPerformances(b)[0]),
    );
    fillCards("[data-related-shows]", related.slice(0, 3));
    updateSavedUI();
  }
  function planConflicts(items) {
    const conflicts = [];
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const a = items[i],
          b = items[j];
        if (stamp(a) < stamp(b) + b.duration * 60000 && stamp(b) < stamp(a) + a.duration * 60000)
          conflicts.push([a, b]);
      }
    }
    return conflicts;
  }
  function renderPlan() {
    const target = $("[data-plan-items]");
    if (!target) return;
    const items = readPlan()
      .map((id) => performanceById[id])
      .sort((a, b) => stamp(a) - stamp(b));
    target.innerHTML = items.length
      ? items
          .map((p) => {
            const show = showById[p.show];
            return `<article class="grid gap-5 border border-ink p-5 sm:grid-cols-[7rem_1fr]" data-plan-item="${p.id}"><a href="show.html?show=${show.id}"><img src="assets/img/${show.id}.svg" width="120" height="120" alt="" class="w-28"></a><div class="min-w-0"><p class="eyebrow">${esc(show.genre)}</p><h3 class="mt-2 font-display text-xl"><a href="show.html?show=${show.id}">${esc(show.title)}</a></h3><p class="mt-2">${esc(performanceLabel(p))} · ${show.duration} minutes</p><div class="mt-4 flex flex-wrap items-center justify-between gap-3"><a href="tickets.html?show=${show.id}&amp;performance=${p.id}" class="underline underline-offset-4">Request tickets <svg class="inline-block size-4 shrink-0 align-middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></a><button type="button" class="save-button" data-plan-remove="${p.id}" aria-label="Remove ${esc(show.title)} from your program">Remove</button></div></div></article>`;
          })
          .join("")
      : '<div class="border border-rule bg-panel p-8"><h3 class="font-display text-2xl">The evening is yours to fill.</h3><p class="mt-4 text-muted">Use Save on any performance to keep a few possibilities together. Start with the suggestions below or explore the full program.</p><a href="programme.html" class="btn mt-6">Find a performance <svg class="inline-block size-4 shrink-0 align-middle" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 19 19 5M5 5h14v14"/></svg></a></div>';
    const conflicts = planConflicts(items),
      notice = $("[data-conflicts]");
    notice.hidden = !conflicts.length;
    notice.textContent = conflicts.length
      ? `${count(conflicts.length, "timing overlap")}: ${conflicts.map(([a, b]) => `${showById[a.show].title} and ${showById[b.show].title}`).join("; ")}. These performances run at the same time. Choose one before requesting tickets.`
      : "";
    $("[data-plan-summary]").innerHTML =
      `<div class="flex justify-between gap-4"><dt>Saved</dt><dd>${count(items.length, "performance")}</dd></div><div class="flex justify-between gap-4"><dt>Standard ticket total</dt><dd>${money(items.reduce((sum, p) => sum + showById[p.show].price * 100, 0))}</dd></div><div class="flex justify-between gap-4"><dt>Days out</dt><dd class="text-right">${count(new Set(items.map((p) => p.date)).size, "day")}</dd></div>`;
    $("[data-access-summary]").textContent =
      accessText().join(". ") || "No preferences saved. You can add what would help before your visit.";
    $("[data-clear-plan]").disabled = !items.length;
    $("[data-download-plan]").disabled = !items.length;
  }
  function downloadText(filename, content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" }),
      url = URL.createObjectURL(blob),
      a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  function initPlanner() {
    const root = $("[data-plan-items]");
    if (!root) return;
    root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-plan-remove]");
      if (!button) return;
      const previous = [...root.querySelectorAll("[data-plan-remove]")].indexOf(button);
      savePlan(readPlan().filter((id) => id !== button.dataset.planRemove));
      updateSavedUI();
      const buttons = $$("[data-plan-remove]", root);
      (
        buttons[Math.min(previous, buttons.length - 1)] ||
        $("[data-planner-suggestions] a") ||
        $("[data-download-plan]")
      ).focus();
      announce("Performance removed from your program.");
    });
    $("[data-clear-plan]").addEventListener("click", () => {
      savePlan([]);
      updateSavedUI();
      $("[data-planner-suggestions] a").focus();
      announce("Your program has been cleared.");
    });
    $("[data-download-plan]").addEventListener("click", () => {
      const items = readPlan()
        .map((id) => performanceById[id])
        .sort((a, b) => stamp(a) - stamp(b));
      const lines = [
        "CUEFOLD / YOUR VISIT PLAN",
        "All times Eastern time",
        "",
        ...items.map((p) => `${performanceLabel(p)} — ${showById[p.show].title} (${p.duration} minutes)`),
        "",
        `Access preferences: ${accessText().join("; ") || "None saved"}`,
        "",
        "This is a visit plan, not a ticket or reservation.",
        "Box office: (540) 555-0147 / " + BOX_OFFICE,
        "East Johnson Street, Staunton, VA 24401",
      ];
      if (planConflicts(items).length) lines.push("Please check timing overlaps before requesting tickets.");
      downloadText("cuefold-visit-plan.txt", lines.join("\n"));
      announce("Your visit plan has been downloaded.");
    });
    fillCards("[data-planner-suggestions]", upcomingShows(3));
    // Saved performances that have taken place since the last visit: say so once, then forget them.
    const passed = readPlanRecord().passed.filter(
      (item, index, all) => all.findIndex((other) => other.id === item.id && other.date === item.date) === index,
    );
    const passedNotice = $("[data-plan-notice]");
    if (passed.length && passedNotice) {
      const names = passed.map((item) => `${showById[item.id.slice(0, -2)].title} (${dayLabel(item.date)})`);
      passedNotice.textContent =
        passed.length === 1
          ? `${names[0]} has now taken place, so we’ve taken it off your plan.`
          : `${count(passed.length, "saved performance")} have now taken place, so we’ve taken them off your plan: ${names.join("; ")}.`;
      passedNotice.hidden = false;
      savePlan(readPlan(), []);
    }
    renderPlan();
  }
  function initAccess() {
    const form = $("[data-access-form]");
    if (!form) return;
    function sync() {
      const saved = readAccess();
      Object.keys(ACCESS_NOTES).forEach((key) => {
        form.elements[key].checked = saved[key];
      });
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      writeJSON(
        STORAGE.access,
        Object.fromEntries(Object.keys(ACCESS_NOTES).map((key) => [key, form.elements[key].checked])),
      );
      $("[data-access-status]").textContent =
        `Preferences saved. ${count(accessText().length, "preference")} ready for your visit plan and ticket request.`;
    });
    $("[data-reset-access]").addEventListener("click", () => {
      safeStorage.removeItem(STORAGE.access);
      sync();
      $("[data-access-status]").textContent = "Your preferences have been cleared.";
      form.elements.stepfree.focus();
    });
    sync();
  }
  function clearErrors(form, attribute = "data-error") {
    $$(`[${attribute}]`, form).forEach((el) => {
      el.hidden = true;
      el.textContent = "";
    });
    $$("[aria-invalid]", form).forEach((el) => el.removeAttribute("aria-invalid"));
  }
  function setError(form, name, message, attribute = "data-error") {
    const el = $(`[${attribute}="${name}"]`, form);
    if (el) {
      el.textContent = message;
      el.hidden = false;
    }
    const input = form.elements[name];
    if (input && input.setAttribute) input.setAttribute("aria-invalid", "true");
  }
  function validName(value) {
    return value.trim().length >= 2 && value.trim().length <= 100;
  }
  function validEmail(value) {
    return value.length <= 160 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }
  /* Connecting the forms
     Both forms (initTickets, initInterest) validate here and then call `submitForm`, which shows the box office's
     reply. To receive requests for real, post the form to your form service and show the reply only when it
     answers OK, for example with Formspree:

       fetch("https://formspree.io/f/your-form-id", {
         method: "POST",
         body: new FormData(form),
         headers: { Accept: "application/json" },
       }).then((response) => {
         if (response.ok) done();
         else showProblem(); // keep the form filled in and ask the visitor to try again or call (540) 555-0147
       });

     The reference (CF-1234) is made up in the browser; your service or box-office system may give you its own. */
  function submitForm(form, done) {
    done();
  }
  function reference() {
    return "CF-" + String(1000 + Math.floor(Math.random() * 9000));
  }
  function firstName(name) {
    return name.split(/\s+/)[0];
  }
  function initTickets() {
    const form = $("[data-ticket-form]");
    if (!form) return;
    const showSelect = form.elements.show,
      performanceSelect = form.elements.performance,
      quantityFields = [form.elements.standard, form.elements.concession];
    const firstSaved = readPlan()[0];
    const bookable = SHOWS.filter((show) => showPerformances(show).length);
    const firstShow = firstSaved ? performanceById[firstSaved].show : bookable[0].id;
    showSelect.innerHTML = bookable.map((show) => `<option value="${show.id}">${esc(show.title)}</option>`).join("");
    const bookableById = Object.fromEntries(bookable.map((show) => [show.id, show]));
    showSelect.value = param("show", bookableById, firstShow);
    function selectedShow() {
      return bookableById[own(bookableById, showSelect.value) ? showSelect.value : bookable[0].id];
    }
    function selectedPerformance() {
      const show = selectedShow(),
        id = performanceSelect.value;
      return own(performanceById, id) && performanceById[id].show === show.id
        ? performanceById[id]
        : showPerformances(show)[0];
    }
    function updatePerformance(initial = false) {
      const show = selectedShow(),
        items = showPerformances(show);
      performanceSelect.innerHTML = items
        .map(
          (p) =>
            `<option value="${p.id}">${esc(performanceLabel(p))}${performanceAccess(p).length ? " — " + esc(performanceAccess(p).join(", ")) : ""}</option>`,
        )
        .join("");
      if (initial) {
        const proposed = parameters.get("performance") || firstSaved;
        if (proposed && own(performanceById, proposed) && performanceById[proposed].show === show.id)
          performanceSelect.value = proposed;
      }
      updateCost();
    }
    // Ticket numbers as typed. A field that isn't a whole number from 0 to MAX_TICKETS is reported, never
    // silently clamped, so the estimate always matches what the visitor sees.
    function quantities() {
      const read = (field) => {
        const raw = field.value.trim();
        const n = raw === "" ? 0 : Number(raw);
        return { n, ok: Number.isInteger(n) && n >= 0 && n <= MAX_TICKETS };
      };
      const standard = read(form.elements.standard),
        concessions = read(form.elements.concession);
      const total = standard.n + concessions.n;
      const bothOk = standard.ok && concessions.ok;
      let problem = "";
      if (!bothOk) problem = `Please enter a whole number from 0 to ${MAX_TICKETS} in each box.`;
      else if (total > MAX_TICKETS)
        problem = `That’s ${total} tickets. Please choose up to ${MAX_TICKETS} in total, or call us about a group booking.`;
      else if (total < 1) problem = "Please choose at least one ticket.";
      return {
        standard: standard.ok ? standard.n : 0,
        concession: concessions.ok ? concessions.n : 0,
        problem,
        none: bothOk && total < 1,
        // Which boxes to mark invalid: a box that isn't a whole number in range, or both when the total is wrong.
        bad: [!standard.ok || (bothOk && !!problem), !concessions.ok || (bothOk && !!problem)],
      };
    }
    function showCountError(q) {
      const error = $('[data-error="tickets"]', form);
      error.textContent = q.problem;
      error.hidden = !q.problem;
      quantityFields.forEach((field, index) => {
        if (q.bad[index]) field.setAttribute("aria-invalid", "true");
        else field.removeAttribute("aria-invalid");
      });
    }
    function calculation() {
      const show = selectedShow(),
        q = quantities(),
        standard = q.standard * show.price * 100,
        concessions = q.concession * concession(show) * 100;
      return {
        show,
        q,
        standard,
        concessions,
        total: standard + concessions + (q.standard + q.concession > 0 ? HANDLING_PENCE : 0),
      };
    }
    function updateCost() {
      const { show, q, standard, concessions, total } = calculation(),
        p = selectedPerformance();
      // Report a bad ticket count as soon as it's typed. "No tickets" waits for submit: it's often mid-edit.
      showCountError(q.none ? { problem: "", bad: [false, false] } : q);
      $("[data-ticket-title]").textContent = show.title;
      $("[data-ticket-art]").innerHTML =
        `<img src="assets/img/${show.id}.svg" width="96" height="96" class="aspect-square w-24 border border-ink" alt="">`;
      $("[data-ticket-cost]").innerHTML =
        q.problem && !q.none
          ? `<div class="flex justify-between gap-4 border-t border-ink pt-4 text-xl"><dt>Estimated total</dt><dd data-ticket-total>—</dd></div><p class="text-sm">${esc(q.problem)}</p>`
          : `<div class="flex justify-between gap-4"><dt>${count(q.standard, "standard ticket")}</dt><dd>${money(standard)}</dd></div><div class="flex justify-between gap-4"><dt>${count(q.concession, "discount ticket")}</dt><dd>${money(concessions)}</dd></div><div class="flex justify-between gap-4"><dt>Handling fee</dt><dd>${money(q.none ? 0 : HANDLING_PENCE)}</dd></div><div class="flex justify-between gap-4 border-t border-ink pt-4 text-xl"><dt>Estimated total</dt><dd data-ticket-total>${money(total)}</dd></div>`;
      $("[data-performance-note]").textContent =
        `${runningTime(show)} · ${show.age} · ${show.room}. ${performanceAccess(p).join(", ") || "Standard performance; assistive listening available."}`;
      $("[data-ticket-access]").textContent =
        `Your saved preferences: ${accessText().join("; ") || "None saved. You can tell us what would help in the notes."}`;
    }
    const access = readAccess();
    if (access.stepfree) form.elements.seating.value = "wheelchair";
    showSelect.addEventListener("change", () => updatePerformance());
    form.addEventListener("input", (event) => {
      if (event.target !== showSelect) updateCost();
    });
    const section = $("[data-ticket-section]"),
      done = $("[data-request-done]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors(form);
      const summary = $("[data-form-summary]");
      summary.hidden = true;
      const name = form.elements.name.value.trim(),
        email = form.elements.email.value.trim(),
        q = quantities();
      let errors = 0;
      if (q.problem) {
        showCountError(q);
        errors++;
      }
      if (!validName(name)) {
        setError(form, "name", "Please enter your name, using 2–100 characters.");
        errors++;
      }
      if (!validEmail(email)) {
        setError(form, "email", "Please enter a complete email address, like name@example.com.");
        errors++;
      }
      if (!form.elements.contact.checked) {
        setError(form, "contact", "Please let us know we may reply about this request.");
        errors++;
      }
      if (errors) {
        summary.textContent = `Please check ${count(errors, "highlighted field")}.`;
        summary.hidden = false;
        const first = $('[aria-invalid="true"]', form);
        if (first) first.focus();
        return;
      }
      const { show, total } = calculation(),
        p = selectedPerformance(),
        seatKey = own(SEATING, form.elements.seating.value) ? form.elements.seating.value : "any",
        seats = q.standard + q.concession;
      submitForm(form, () => {
        $("[data-request-ref]").textContent = reference();
        $("[data-request-heading]").textContent = `Thanks, ${firstName(name)}. Your seats are on hold.`;
        $("[data-request-lead]").textContent =
          `We’ll be in touch at ${email} about ${show.title} on ${dayLabel(p.date, { weekday: "long", day: "numeric", month: "long" })} at ${timeLabel(p)}.`;
        $("[data-request-hold]").textContent =
          `We’re holding ${count(seats, "seat")} (${SEATING[seatKey].toLowerCase()}) for you now. If we can’t reach you, we keep them until 30 minutes before curtain.`;
        $("[data-request-summary]").innerHTML = [
          ["Performance", `${show.title}, ${performanceLabel(p)}`],
          [
            "Tickets",
            [q.standard ? `${q.standard} standard` : "", q.concession ? `${q.concession} discount` : ""]
              .filter(Boolean)
              .join(", "),
          ],
          ["Estimated total", money(total)],
          ["Access", accessText().join("; ") || "Nothing saved; tell us any time"],
        ]
          .map(([term, value]) => `<div><dt class="eyebrow">${term}</dt><dd class="mt-1">${esc(value)}</dd></div>`)
          .join("");
        section.hidden = true;
        done.hidden = false;
        done.focus();
        done.scrollIntoView({ block: "start", behavior: "instant" });
        announce(`Request received for ${show.title}.`);
      });
    });
    $("[data-request-another]").addEventListener("click", () => {
      done.hidden = true;
      section.hidden = false;
      form.elements.notes.value = "";
      showSelect.focus();
    });
    updatePerformance(true);
  }
  function initWorkshops() {
    const grid = $("[data-workshops]");
    if (!grid) return;
    grid.innerHTML = WORKSHOPS.map(
      (w) =>
        `<article class="flex flex-col border border-ink"><img src="assets/img/${w.art}.svg" width="600" height="430" class="aspect-[600/430] w-full border-b border-ink" alt=""><div class="flex flex-1 flex-col p-6"><p class="eyebrow">${esc(dayLabel(workshopDate(w)))} · ${w.time} · Studio</p><h3 class="mt-4 font-display text-2xl">${esc(w.title)}</h3><p class="mt-4 text-muted">${esc(w.text)}</p><p class="mt-4 text-sm">${w.minutes} minutes · ${money(w.price * 100)} · up to 12 people</p><p class="mt-2 text-sm">With ${esc(w.lead)}</p><div class="mt-auto pt-6"><a href="#interest" data-workshop-choice="${w.id}" class="btn btn-light">Request a spot ${ARROW}</a></div></div></article>`,
    ).join("");
    const choice = $("#interest");
    const map = Object.fromEntries(WORKSHOPS.map((w) => [w.id, w]));
    if (choice) choice.value = param("interest", { ...map, volunteer: true }, "story");
    grid.addEventListener("click", (event) => {
      const link = event.target.closest("[data-workshop-choice]");
      if (link && own(map, link.dataset.workshopChoice)) {
        choice.value = link.dataset.workshopChoice;
        choice.focus();
      }
    });
  }
  function initInterest() {
    const form = $("[data-interest-form]");
    if (!form) return;
    const choices = {
      story: "Story into scene workshop",
      movement: "Moving without words workshop",
      objects: "Small objects, big stories workshop",
      volunteer: "Volunteering as an usher",
    };
    const done = $("[data-interest-done]");
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      clearErrors(form, "data-interest-error");
      let errors = 0;
      const name = form.elements.name.value.trim(),
        email = form.elements.email.value.trim();
      if (!validName(name)) {
        setError(form, "name", "Please enter your name, using 2–100 characters.", "data-interest-error");
        errors++;
      }
      if (!validEmail(email)) {
        setError(form, "email", "Please enter a complete email address, like name@example.com.", "data-interest-error");
        errors++;
      }
      if (errors) {
        $('[aria-invalid="true"]', form).focus();
        return;
      }
      const choice = own(choices, form.elements.interest.value) ? form.elements.interest.value : "story";
      const workshop = WORKSHOPS.find((w) => w.id === choice);
      submitForm(form, () => {
        $("[data-interest-ref]").textContent = reference();
        $("[data-interest-heading]").textContent = `Thanks, ${firstName(name)}.`;
        $("[data-interest-next]").textContent = workshop
          ? `We’ve penciled you in for ${workshop.title} on ${dayLabel(workshopDate(workshop), { weekday: "long", day: "numeric", month: "long" })} at ${workshop.time}. ${firstName(workshop.lead)} will confirm your spot by email within two business days. Pay ${money(workshop.price * 100)} on the day, by card or cash.`
          : "Melisande will email you within a week to arrange a short welcome chat and a first shift alongside an experienced usher.";
        form.hidden = true;
        done.hidden = false;
        done.focus();
        announce("Inquiry received.");
      });
    });
    $("[data-interest-another]").addEventListener("click", () => {
      done.hidden = true;
      form.hidden = false;
      form.elements.message.value = "";
      form.elements.interest.focus();
    });
  }
  function initArrival() {
    const form = $("[data-arrival-form]");
    if (!form) return;
    function clock(minutes) {
      const rolled = ((minutes % 1440) + 1440) % 1440;
      return `${clockTime(rolled)}${minutes < 0 ? " (previous day)" : ""}`;
    }
    function render() {
      const value = form.elements.curtain.value;
      if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return;
      const [h, m] = value.split(":").map(Number),
        curtain = h * 60 + m,
        journey = clampInt(form.elements.journey.value, 0, 360);
      $("[data-arrival-result]").innerHTML =
        `<dl class="space-y-3"><div class="flex justify-between gap-4"><dt>Leave by</dt><dd>${clock(curtain - 30 - journey)}</dd></div><div class="flex justify-between gap-4"><dt>Arrive at Cuefold</dt><dd>${clock(curtain - 30)}</dd></div><div class="flex justify-between gap-4"><dt>Take your seat</dt><dd>${clock(curtain - 10)}</dd></div><div class="flex justify-between gap-4"><dt>Curtain</dt><dd>${clock(curtain)}</dd></div></dl><p class="mt-4 text-sm text-muted">All times are local to Staunton. Allow extra time for parking, travel delays or a touch tour.</p>`;
    }
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (form.reportValidity()) render();
    });
    render();
  }
  $$("[data-year]").forEach((el) => {
    el.textContent = String(londonToday().getUTCFullYear());
  });
  // Home page: the featured production's next date, the next three other productions, and figures from the data.
  const feature = $("[data-feature-date]");
  const featured = showPerformances(SHOWS[0])[0];
  if (feature && featured) feature.textContent = performanceLabel(featured);
  fillCards("[data-home-shows]", upcomingShows(3, [SHOWS[0].id]));
  $$("[data-performance-count]").forEach((el) => {
    el.textContent = String(PERFORMANCES.length);
  });
  $$("[data-lowest-price]").forEach((el) => {
    el.textContent = money(Math.min(...SHOWS.map(concession)) * 100);
  });
  initMenu();
  initProgramme();
  initShow();
  initPlanner();
  initAccess();
  initTickets();
  initWorkshops();
  initInterest();
  initArrival();
  updateSavedUI();
  $$("main>section").forEach((section) => section.classList.add("reveal"));
  initReveal();
})();
