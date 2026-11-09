/* Sonata Music Rooms. Vanilla JavaScript; no runtime dependencies.
 * All catalog, teacher, weekly session and practice data is kept here, with the term-date rules.
 * The enrollment and contact forms show a confirmation on the page; see DOCS.md, Forms, to connect a form service.
 */
(function () {
  "use strict";
  const TIMEZONE = "America/Indiana/Indianapolis";
  // Term dates. null = work them out from TERM_RULES for any year, so the site never shows a past term as
  // current. For a real school, list your terms instead (a Monday for start and halfTerm), for example:
  // [{ name: "Spring", start: "2027-01-11", halfTerm: "2027-02-15" }, …]
  const TERM_DATES = null;
  const TERM_WEEKS = 10;
  const INTRO_PRICE = 15;
  const STORAGE_KEYS = { saved: "sonata-saved-v1", practice: "sonata-practice-v1" };
  const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const FAMILY_LABELS = {
    piano: "Piano",
    guitar: "Guitar",
    voice: "Singing",
    violin: "Strings",
    drums: "Drums",
    ensemble: "Playing together",
  };
  const AGE_LABELS = { child: "Children", teen: "Teenagers", adult: "Adults" };
  const LEVEL_LABELS = { beginner: "Beginner", developing: "Developing", confident: "Confident" };
  const EXPERIENCE = {
    new: "Starting from the beginning",
    returning: "Returning to playing",
    playing: "Playing and developing",
  };
  const CONTACT_TOPICS = {
    lessons: "Lessons and courses",
    bursary: "Scholarships",
    access: "Access and quiet visits",
    instruments: "Instruments and practice",
    other: "Something else",
  };
  const LESSON_FORMATS = {
    group: { title: "Course group", minutes: null, price: null },
    individual30: { title: "Individual · 30 minutes", minutes: 30, price: 38 },
    individual45: { title: "Individual · 45 minutes", minutes: 45, price: 55 },
  };
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const has = (map, key) => typeof key === "string" && Object.prototype.hasOwnProperty.call(map, key);
  const esc = (value) =>
    String(value).replace(
      /[&<>"']/g,
      (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character],
    );
  const money = (amount) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
    }).format(amount);
  const plural = (count, noun) => `${count} ${noun}${count === 1 ? "" : "s"}`;
  const icon =
    '<svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
  const params = new URLSearchParams(location.search);
  const checkedParam = (name, map, fallback) => (has(map, params.get(name)) ? params.get(name) : fallback);
  const safeStorage = (() => {
    const memory = Object.create(null);
    let storage;
    try {
      storage = window.localStorage;
      storage.getItem("__sonata_probe");
    } catch (_) {
      storage = null;
    }
    return {
      getItem(key) {
        if (has(memory, key)) return memory[key];
        try {
          return storage ? storage.getItem(key) : null;
        } catch (_) {
          storage = null;
          return null;
        }
      },
      setItem(key, value) {
        memory[key] = String(value);
        try {
          if (storage) storage.setItem(key, String(value));
        } catch (_) {
          storage = null;
        }
      },
      removeItem(key) {
        delete memory[key];
        try {
          if (storage) storage.removeItem(key);
        } catch (_) {
          storage = null;
        }
      },
    };
  })();
  function readJSON(key) {
    try {
      return JSON.parse(safeStorage.getItem(key));
    } catch (_) {
      return null;
    }
  }
  function writeJSON(key, value) {
    safeStorage.setItem(key, JSON.stringify(value));
  }
  function setParams(values) {
    try {
      const url = new URL(location.href);
      Object.entries(values).forEach(([key, value]) => {
        if (value && value !== "all") url.searchParams.set(key, value);
        else url.searchParams.delete(key);
      });
      history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (_) {
      /* file URLs may reject history changes. */
    }
  }
  let toastTimer;
  function toast(message) {
    const target = $("#toast");
    target.textContent = message;
    target.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      target.hidden = true;
    }, 3500);
  }
  // A short reference for a request, e.g. SM-4821. Real references would come from your form service or database.
  function reference(seed) {
    let hash = 0;
    for (const character of `${seed}${Date.now()}`) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
    return `SM-${1000 + (hash % 9000)}`;
  }
  // A calendar date in the school's time zone. Pure UTC arithmetic below avoids DST shifts.
  function today() {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date());
    const get = (key) => parts.find((part) => part.type === key).value;
    return new Date(`${get("year")}-${get("month")}-${get("day")}T12:00:00Z`);
  }
  function addDays(date, count) {
    const next = new Date(date);
    next.setUTCDate(next.getUTCDate() + count);
    return next;
  }
  function iso(date) {
    return date.toISOString().slice(0, 10);
  }
  function dateLabel(date, long = false) {
    return new Intl.DateTimeFormat("en-US", {
      timeZone: "UTC",
      month: long ? "long" : "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }
  // Sessions keep 24-hour times in the data so they sort; visitors see a 12-hour clock ("4:15pm").
  function clock(time) {
    const [hour, minute] = time.split(":").map(Number);
    return `${hour % 12 || 12}${minute ? `:${String(minute).padStart(2, "0")}` : ""}${hour < 12 ? "am" : "pm"}`;
  }
  function mondayOf(date) {
    return addDays(date, -((date.getUTCDay() + 6) % 7));
  }
  function firstMondayOnOrAfter(year, month, day) {
    const date = new Date(Date.UTC(year, month, day, 12));
    return addDays(date, (8 - date.getUTCDay()) % 7);
  }
  function lastMonday(year, month) {
    return mondayOf(new Date(Date.UTC(year, month + 1, 0, 12)));
  }
  // US federal holidays, worked out by rule (the school is closed on all of them). When a fixed date falls on a
  // weekend the school closes on the date itself, if it's a Saturday, and on the weekday it's observed.
  function bankHolidays(year) {
    const holidays = {};
    const fixed = (y, month, day, name) => {
      const date = new Date(Date.UTC(y, month, day, 12));
      holidays[iso(date)] = name;
      if (date.getUTCDay() === 6) holidays[iso(addDays(date, -1))] = `${name} (observed)`;
      if (date.getUTCDay() === 0) holidays[iso(addDays(date, 1))] = `${name} (observed)`;
    };
    const november22 = new Date(Date.UTC(year, 10, 22, 12));
    fixed(year, 0, 1, "New Year’s Day");
    holidays[iso(firstMondayOnOrAfter(year, 0, 15))] = "Martin Luther King Jr. Day";
    holidays[iso(firstMondayOnOrAfter(year, 1, 15))] = "Presidents’ Day";
    holidays[iso(lastMonday(year, 4))] = "Memorial Day";
    fixed(year, 5, 19, "Juneteenth");
    fixed(year, 6, 4, "Independence Day");
    holidays[iso(firstMondayOnOrAfter(year, 8, 1))] = "Labor Day";
    holidays[iso(firstMondayOnOrAfter(year, 9, 8))] = "Columbus Day";
    fixed(year, 10, 11, "Veterans Day");
    holidays[iso(addDays(november22, (11 - november22.getUTCDay()) % 7))] = "Thanksgiving Day";
    fixed(year, 11, 25, "Christmas Day");
    fixed(year + 1, 0, 1, "New Year’s Day");
    return holidays;
  }
  function isBankHoliday(date) {
    return has(bankHolidays(date.getUTCFullYear()), iso(date));
  }
  // Each term is eleven weeks: five teaching weeks, a break week with no lessons, then five more. The break week
  // starts on a federal holiday Monday: Presidents' Day, Memorial Day and Columbus Day. That keeps fall term
  // finished before Thanksgiving. halfTerm is the Monday of the break week.
  const TERM_RULES = [
    { name: "Spring", halfTerm: (year) => firstMondayOnOrAfter(year, 1, 15) },
    { name: "Summer", halfTerm: (year) => lastMonday(year, 4) },
    { name: "Fall", halfTerm: (year) => firstMondayOnOrAfter(year, 9, 8) },
  ];
  function makeTerm(name, start, halfTerm) {
    return { name, start, halfTerm, end: addDays(start, 7 * (TERM_WEEKS + 1) - 2), year: start.getUTCFullYear() };
  }
  function buildTerms() {
    const year = today().getUTCFullYear();
    if (Array.isArray(TERM_DATES)) {
      return TERM_DATES.map((term) =>
        makeTerm(term.name, new Date(`${term.start}T12:00:00Z`), new Date(`${term.halfTerm}T12:00:00Z`)),
      ).sort((a, b) => a.start - b.start);
    }
    const terms = [];
    for (let y = year - 1; y <= year + 2; y++) {
      TERM_RULES.forEach((rule) => {
        const halfTerm = rule.halfTerm(y);
        terms.push(makeTerm(rule.name, addDays(halfTerm, -35), halfTerm));
      });
    }
    return terms;
  }
  const TERMS = buildTerms();
  const TODAY = today();
  function termOf(date) {
    return TERMS.find((term) => date >= term.start && date <= addDays(term.end, 1)) || null;
  }
  // A week with lessons: inside a term and not the break week.
  function isTeachingWeek(monday) {
    const term = termOf(monday);
    return Boolean(term) && iso(monday) !== iso(term.halfTerm);
  }
  function nextTeachingMonday(from) {
    let monday = mondayOf(from) < from ? addDays(mondayOf(from), 7) : mondayOf(from);
    for (let i = 0; i < 120 && !isTeachingWeek(monday); i++) monday = addDays(monday, 7);
    return monday;
  }
  // CURRENT_TERM: the term running today (null between terms). NEXT_TERM: the next term to start.
  const CURRENT_TERM = termOf(TODAY);
  const NEXT_TERM = TERMS.find((term) => term.start > TODAY) || null;
  // WEEK_START: this week while lessons are running (Monday to Saturday), otherwise the next teaching week.
  const WEEK_START =
    TODAY.getUTCDay() !== 0 && isTeachingWeek(mondayOf(TODAY)) ? mondayOf(TODAY) : nextTeachingMonday(addDays(TODAY, 1));
  const WEEK_IS_CURRENT = iso(WEEK_START) === iso(mondayOf(TODAY));
  const WEEK_TERM = termOf(WEEK_START);
  // New students join from the next teaching Monday, or the next term when fewer than three teaching weeks are left.
  function teachingWeeksLeft(monday, term) {
    let count = 0;
    for (let week = monday; week <= term.end; week = addDays(week, 7)) if (isTeachingWeek(week)) count++;
    return count;
  }
  const JOIN_DATE = (() => {
    const monday = nextTeachingMonday(addDays(TODAY, 1));
    const term = termOf(monday);
    if (term && teachingWeeksLeft(monday, term) >= 3) return monday;
    const later = TERMS.find((candidate) => candidate.start > monday);
    return later ? later.start : monday;
  })();
  const JOIN_TERM = termOf(JOIN_DATE);
  // The lessons a new starter on a weekday (1 = Monday) has left in their joining term.
  function lessonsFrom(day) {
    const dates = [];
    if (!JOIN_TERM) return dates;
    for (let week = JOIN_DATE; week <= JOIN_TERM.end; week = addDays(week, 7)) {
      const date = addDays(week, day - 1);
      if (isTeachingWeek(week) && !isBankHoliday(date)) dates.push(date);
    }
    return dates;
  }
  function termLabel(term) {
    return term ? `${term.name} term ${term.year}` : "Next term";
  }
  function rangeLabel(from, to) {
    const sameMonth = from.getUTCMonth() === to.getUTCMonth() && from.getUTCFullYear() === to.getUTCFullYear();
    const start = dateLabel(from).replace(/, \d{4}$/, "");
    return sameMonth ? `${start}–${to.getUTCDate()}, ${to.getUTCFullYear()}` : `${start} – ${dateLabel(to)}`;
  }
  function termSummary(term) {
    if (!term) return "Times are Eastern, local to Bloomington.";
    return `${termLabel(term)}: ${rangeLabel(term.start, term.end)}, with a break week ${rangeLabel(term.halfTerm, addDays(term.halfTerm, 4))}. Times are Eastern, local to Bloomington.`;
  }
  const PRACTICE_WEEK_START = mondayOf(TODAY);

  const TUTORS = {
    rhoswen: {
      name: "Rhoswen Trevelyan",
      family: "piano",
      role: "Piano · listening and first principles",
      experience: "Teaching since 2008 · piano performance and community music",
      introduction:
        "Rhoswen makes the keyboard feel like familiar territory. She starts with patterns, favorite tunes and a relaxed pair of hands, then brings reading and technique into the picture.",
      approach:
        "A short demonstration, time to try, and one useful observation. Expect pencil marks, gentle humor and a tune you can recognize by the end of the first lesson.",
      interests: "Folk melodies, film music and the small details that make a phrase sing.",
      quote: "The next note is easier when you know why you want to play it.",
      access: "Happy to use large-print scores, color-coded plans and a slower-paced introduction.",
    },
    bevis: {
      name: "Bevis Merrifield",
      family: "guitar",
      role: "Guitar · songs, strings and steady progress",
      experience: "Teaching since 2012 · acoustic guitar and songwriting",
      introduction:
        "Bevis learned his first three chords to play along with a record. He still thinks a good song is the best reason to pick up a guitar, whether you are eight or eighty.",
      approach:
        "Comfortable hand position first, a small chord vocabulary next, then rhythm that holds a song together. He writes simple practice recordings to match each student’s pace.",
      interests: "Fingerstyle arrangements, folk sessions and making two chords sound like a whole band.",
      quote: "A clean change between two chords is a perfectly good day’s work.",
      access: "Works with left-handed players and can explore alternative chord shapes for reach or comfort.",
    },
    huw: {
      name: "Huw Vennell",
      family: "voice",
      role: "Voice · breath, confidence and expression",
      experience: "Teaching since 2010 · group singing and contemporary voice",
      introduction:
        "Huw leads with the idea that a voice should feel like yours. His lessons are practical, friendly and rooted in comfortable breathing rather than chasing a particular sound.",
      approach:
        "Easy warm-ups, a song in a comfortable key and clear choices about phrasing. Group singers learn to hear their part and enjoy being part of a wider sound.",
      interests: "Close harmony, storytelling through song and finding a key that lets a voice settle.",
      quote: "You do not need to be louder to have something worth hearing.",
      access: "Welcomes anxious beginners; a quiet first visit and seated singing are available.",
    },
    celyn: {
      name: "Celyn Kerslake",
      family: "violin",
      role: "Strings · patient hands and a singing tone",
      experience: "Teaching since 2014 · violin, viola and youth ensembles",
      introduction:
        "Celyn turns the tricky first steps of string playing into small, understandable tasks. She likes a good dance tune and the moment a student finds a sound they want to repeat.",
      approach:
        "Balanced posture, bow games, listening and just enough notation. More experienced players work on tone, musical shape and playing comfortably with others.",
      interests: "Traditional dance music, string quartets and simple duets that sound bigger than their parts.",
      quote: "A beautiful sound often starts with doing a little less.",
      access: "Can adapt music stands, lesson pacing and seated playing positions; ask before buying an instrument.",
    },
    iseult: {
      name: "Iseult Tregowan",
      family: "drums",
      role: "Drums · groove, coordination and good habits",
      experience: "Teaching since 2006 · drum set and rhythm workshops",
      introduction:
        "Iseult brings a calm, methodical approach to the noisiest room in the building. Counting, listening and coordination arrive through grooves that make sense in a song.",
      approach:
        "Learn the pulse with your whole body, then build the parts one at a time. Lessons use an acoustic drum set with hearing protection and a quiet practice pad for close work.",
      interests: "Soul records, brushes, percussion circles and a backbeat that makes people move.",
      quote: "The groove matters more than how many notes you fit inside it.",
      access: "Hearing protection is supplied. Quiet pad-based introductions and movement adaptations can be arranged.",
    },
    oswin: {
      name: "Oswin Petherick",
      family: "ensemble",
      role: "Ensembles · learning to play between the notes",
      experience: "Teaching since 2011 · arranging and mixed-instrument groups",
      introduction:
        "Oswin finds a musical job for everyone in the room. A beginner holding a simple bass line is as important to him as an experienced player taking a solo.",
      approach:
        "Listen, leave space and understand what your part does. Arrangements are adapted to the people in the room, with clear charts and room for ideas.",
      interests: "Community bands, rhythm-section arranging and unlikely songs that bring a group together.",
      quote: "Playing together begins with noticing what somebody else is doing.",
      access: "Parts can be supplied as notation, chord charts, large print or audio in advance.",
    },
  };
  const COURSES = {
    "little-keys": {
      title: "Little Keys",
      family: "piano",
      keywords: ["piano", "keyboard", "keys", "children", "kids", "preschool", "nursery rhymes"],
      tutor: "rhoswen",
      age: "child",
      ageText: "Ages 4–7",
      level: "beginner",
      minutes: 40,
      price: 24,
      subtitle: "A playful first friendship with the piano.",
      description:
        "Listen, clap, sing and find patterns on the keys. A small-group introduction for young children who are curious about sound, with short activities and plenty of room to try.",
      outcomes: [
        "Find high and low sounds and keep a steady pulse",
        "Play short patterns with both hands",
        "Recognize a first set of musical symbols",
        "Share a simple duet with a teacher",
      ],
      weeks: [
        "Weeks 1–2: finding the keyboard through sound games",
        "Weeks 3–5: pulse, patterns and a first two-hand tune",
        "Week 6: a break week for practice at home",
        "Weeks 7–11: little duets and a tune to share",
      ],
      bring:
        "Nothing for the introduction. A keyboard at home becomes helpful after the first few weeks; we can advise on a sensible starter instrument.",
      practice: [
        "Clap the pulse of a favorite song",
        "Find two sets of black keys",
        "Play your little pattern slowly",
      ],
      featured: true,
    },
    "piano-first": {
      title: "Piano, from the Beginning",
      family: "piano",
      keywords: ["piano", "keyboard", "keys", "adult beginner", "reading music"],
      tutor: "rhoswen",
      age: "adult",
      ageText: "Adults 18+",
      level: "beginner",
      minutes: 50,
      price: 30,
      subtitle: "It is a very good time to begin.",
      description:
        "Learn the keyboard with other adults who are starting too. We connect listening, reading and comfortable technique through simple pieces that sound like music from the very first week.",
      outcomes: [
        "Read a simple melody and find its notes",
        "Play basic chords with a steady left hand",
        "Understand a short practice routine",
        "Choose a piece to work toward independently",
      ],
      weeks: [
        "Weeks 1–2: keyboard geography and relaxed hands",
        "Weeks 3–5: melody, chords and making a phrase",
        "Week 6: a break week for practice at home",
        "Weeks 7–11: bringing both hands into one song",
      ],
      bring:
        "Use our pianos in the lesson. A touch-sensitive keyboard or piano at home is recommended, but speak to us before buying.",
      practice: [
        "Warm up with five relaxed notes",
        "Play the left-hand chords slowly",
        "Listen once before playing your piece",
      ],
      featured: true,
    },
    "piano-next": {
      title: "Piano: The Next Phrase",
      family: "piano",
      keywords: ["piano", "keyboard", "keys", "pedal", "chords", "audition", "exam"],
      tutor: "rhoswen",
      age: "teen",
      ageText: "Ages 12–17",
      level: "developing",
      minutes: 50,
      price: 30,
      subtitle: "Move from playing notes to shaping music.",
      description:
        "For young pianists who can already read a simple piece. Explore chords, touch and phrasing through a mix of contemporary and classical music, with space for your own choices.",
      outcomes: [
        "Shape a melody with clear phrasing",
        "Use simple pedal techniques",
        "Build a useful chord vocabulary",
        "Play a short piece from memory with confidence",
      ],
      weeks: [
        "Weeks 1–2: listening and choosing a personal goal",
        "Weeks 3–5: chords, voicing and a new piece",
        "Week 6: a break week for practice at home",
        "Weeks 7–11: shaping a performance without pressure",
      ],
      bring:
        "Your current music book and a piece you enjoy. Home access to a piano or touch-sensitive keyboard is needed.",
      practice: [
        "Mark the main phrase in your score",
        "Practice one chord change without stopping",
        "Record and listen to eight measures",
      ],
    },
    "guitar-first": {
      title: "First Chords Club",
      family: "guitar",
      keywords: ["guitar", "acoustic guitar", "chords", "strumming", "kids", "children"],
      tutor: "bevis",
      age: "child",
      ageText: "Ages 8–11",
      level: "beginner",
      minutes: 45,
      price: 26,
      subtitle: "Small hands, big songs, one chord at a time.",
      description:
        "A friendly acoustic guitar group for children. Learn to tune, strum and change chords through well-loved songs and rhythm games. No reading experience needed.",
      outcomes: [
        "Hold and tune a guitar safely",
        "Play four useful open chords",
        "Keep a steady down-and-up strum",
        "Play a whole song with the group",
      ],
      weeks: [
        "Weeks 1–2: getting comfortable and finding the beat",
        "Weeks 3–5: two chords become a song",
        "Week 6: a break week for practice at home",
        "Weeks 7–11: four chords and playing together",
      ],
      bring: "A correctly sized acoustic guitar. Borrow one for your introduction; ask us about sizing before buying.",
      practice: [
        "Tune each string with your tuner",
        "Change between two chords ten times slowly",
        "Strum one verse with the recording",
      ],
    },
    "guitar-return": {
      title: "Guitar, Picked Up Again",
      family: "guitar",
      keywords: ["guitar", "acoustic guitar", "fingerpicking", "fingerstyle", "barre chords", "returning"],
      tutor: "bevis",
      age: "adult",
      ageText: "Adults 18+",
      level: "developing",
      minutes: 60,
      price: 32,
      subtitle: "The guitar in the corner still has songs in it.",
      description:
        "An encouraging return for adults with a few chords and a slightly dusty guitar. Build rhythm, reconnect your hands and leave with songs you actually want to play.",
      outcomes: [
        "Refresh open chords and a useful barre shape",
        "Keep a song moving through chord changes",
        "Try a simple fingerpicking pattern",
        "Build a personal set of three playable songs",
      ],
      weeks: [
        "Weeks 1–2: comfortable hands and a familiar song",
        "Weeks 3–5: rhythm patterns and fingerpicking",
        "Week 6: a break week for practice at home",
        "Weeks 7–11: arranging a song in your own way",
      ],
      bring:
        "Your acoustic guitar, a tuner and a song suggestion. We can help check strings and setup at the introduction.",
      practice: [
        "Warm up with two familiar chord changes",
        "Loop a gentle fingerpicking pattern",
        "Play a favorite song for enjoyment",
      ],
    },
    "voice-first": {
      title: "Find Your Singing Voice",
      family: "voice",
      keywords: ["singing", "voice", "vocals", "choir", "harmony"],
      tutor: "huw",
      age: "adult",
      ageText: "Adults 18+",
      level: "beginner",
      minutes: 50,
      price: 28,
      subtitle: "You are allowed to sing before you feel ready.",
      description:
        "A small, welcoming singing group for adults who are unsure where to start. Discover comfortable breathing, pitch and expression through songs chosen for the people in the room.",
      outcomes: [
        "Find a comfortable vocal warm-up",
        "Match a melody at an easy pitch",
        "Use breath to support a phrase",
        "Sing a simple harmony as part of a group",
      ],
      weeks: [
        "Weeks 1–2: relaxed breathing and finding your range",
        "Weeks 3–5: melody, words and simple harmony",
        "Week 6: a break week for practice at home",
        "Weeks 7–11: making a song feel like your own",
      ],
      bring: "Water and a song you love listening to. No equipment or previous choir experience is needed.",
      practice: [
        "Try a gentle humming warm-up",
        "Speak the song words with a steady breath",
        "Sing one phrase in a comfortable key",
      ],
      featured: true,
    },
    "young-voices": {
      title: "Young Voices Workshop",
      family: "voice",
      keywords: ["singing", "voice", "vocals", "choir", "harmony", "teenagers"],
      tutor: "huw",
      age: "teen",
      ageText: "Ages 12–17",
      level: "developing",
      minutes: 60,
      price: 30,
      subtitle: "Your voice, with a little more confidence.",
      description:
        "Explore melody, harmony and telling a story through song. This workshop supports changing voices and builds confidence through listening, small ensembles and practical technique.",
      outcomes: [
        "Warm up with care and recognize vocal fatigue",
        "Hold a harmony with another singer",
        "Choose a comfortable key",
        "Communicate the words of a song clearly",
      ],
      weeks: [
        "Weeks 1–2: voice care and musical interests",
        "Weeks 3–5: harmonies and interpreting a lyric",
        "Week 6: a break week for practice at home",
        "Weeks 7–11: a small-group song arrangement",
      ],
      bring: "Water, a pencil and a song idea. Wear something comfortable to stand or sit in.",
      practice: [
        "Hum gently before singing",
        "Speak and then sing one lyric phrase",
        "Listen for your harmony in a recording",
      ],
    },
    "violin-first": {
      title: "First Bow",
      family: "violin",
      keywords: ["violin", "fiddle", "strings", "bow", "children"],
      tutor: "celyn",
      age: "child",
      ageText: "Ages 7–11",
      level: "beginner",
      minutes: 40,
      price: 26,
      subtitle: "A sound worth taking your time over.",
      description:
        "Start violin with balanced posture, bow games and short tunes by ear. Groups stay small so every child gets practical help with those important first habits.",
      outcomes: [
        "Hold violin and bow with a comfortable balance",
        "Make a clear open-string sound",
        "Play a short tune using two fingers",
        "Follow a steady pulse in a duet",
      ],
      weeks: [
        "Weeks 1–2: instrument care, balance and bow games",
        "Weeks 3–5: open strings and first fingers",
        "Week 6: a break week for practice at home",
        "Weeks 7–11: a first tune with accompaniment",
      ],
      bring:
        "A correctly sized violin, shoulder rest and bow. We measure for size before recommending rental or purchase.",
      practice: ["Check a relaxed bow hold", "Play four slow open-string bows", "Sing your tune before playing it"],
    },
    "strings-together": {
      title: "Strings in Conversation",
      family: "violin",
      keywords: ["violin", "viola", "fiddle", "strings", "chamber music", "string quartet"],
      tutor: "celyn",
      age: "adult",
      ageText: "Adults 18+",
      level: "confident",
      minutes: 60,
      price: 32,
      subtitle: "Your part makes more sense beside another.",
      description:
        "An adult violin and viola group for players comfortable with first position and simple notation. Explore tone, intonation and ensemble listening through dance tunes and short chamber arrangements.",
      outcomes: [
        "Tune intervals against another part",
        "Match bowing and articulation",
        "Keep a pulse through changing textures",
        "Understand how your line supports the group",
      ],
      weeks: [
        "Weeks 1–2: listening and shared pulse",
        "Weeks 3–5: articulation, intonation and part exchange",
        "Week 6: a break week for practice at home",
        "Weeks 7–11: putting a short set together",
      ],
      bring:
        "Your violin or viola, pencil and a music stand if you prefer your own. Parts are provided a week before the term.",
      practice: [
        "Tune slowly against an open string",
        "Mark matching bow directions",
        "Play your entry after eight silent beats",
      ],
    },
    "drums-first": {
      title: "The First Backbeat",
      family: "drums",
      keywords: ["drums", "drum set", "drum kit", "kit", "percussion", "sticks", "rock"],
      tutor: "iseult",
      age: "teen",
      ageText: "Ages 12–17",
      level: "beginner",
      minutes: 45,
      price: 30,
      subtitle: "Build a beat you can feel good inside.",
      description:
        "Learn drum set through coordination, pulse and the job of a rhythm section. Start with one useful groove, then add fills without losing the song.",
      outcomes: [
        "Set up sticks and seat comfortably",
        "Play a steady basic rock groove",
        "Count and play a one-measure fill",
        "Follow the shape of a simple song",
      ],
      weeks: [
        "Weeks 1–2: pulse, posture and stick control",
        "Weeks 3–5: the first groove and a simple fill",
        "Week 6: a break week for practice at home",
        "Weeks 7–11: playing with a full-song recording",
      ],
      bring:
        "Hearing protection is supplied. A practice pad and sticks are useful at home; a drum set is not needed to begin.",
      practice: [
        "Count a steady four-beat pulse aloud",
        "Play single strokes evenly on a pad",
        "Practice the groove slowly before adding a fill",
      ],
    },
    "rhythm-room": {
      title: "The Rhythm Room",
      family: "drums",
      keywords: ["drums", "drum set", "drum kit", "kit", "percussion", "hand drums", "djembe", "tambourine"],
      tutor: "iseult",
      age: "adult",
      ageText: "Adults 18+",
      level: "beginner",
      minutes: 50,
      price: 28,
      subtitle: "A shared pulse is a very good place to start.",
      description:
        "A sociable adult rhythm group using hand percussion, practice pads and short turns at the drum set. Build coordination and listening without needing equipment or notation.",
      outcomes: [
        "Keep a shared pulse and simple subdivisions",
        "Play two complementary percussion patterns",
        "Start and stop together on a clear cue",
        "Create a short group rhythm arrangement",
      ],
      weeks: [
        "Weeks 1–2: pulse, patterns and listening games",
        "Weeks 3–5: layered rhythms and drum-set turns",
        "Week 6: a break week for practice at home",
        "Weeks 7–11: arranging a groove as a group",
      ],
      bring: "Comfortable clothes and water. All percussion is provided in the lesson.",
      practice: [
        "Tap a pulse while counting aloud",
        "Clap the offbeat against a recording",
        "Try your rhythm softly on your knees",
      ],
    },
    "courtyard-band": {
      title: "The Courtyard Band",
      family: "ensemble",
      keywords: ["band", "ensemble", "rock band", "bass", "keyboard", "guitar", "drums", "playing together"],
      tutor: "oswin",
      age: "teen",
      ageText: "Ages 12–17",
      level: "confident",
      minutes: 60,
      price: 32,
      subtitle: "Find your place in a bigger sound.",
      description:
        "A mixed-instrument group for young musicians who can play a tune or hold a chord progression. Arrange songs together, listen across the room and learn the practical habits of a good bandmate.",
      outcomes: [
        "Follow a chord chart and a clear count-in",
        "Balance your sound with other instruments",
        "Keep playing through a small mistake",
        "Help shape a shared arrangement",
      ],
      weeks: [
        "Weeks 1–2: finding parts and a shared pulse",
        "Weeks 3–5: song form, dynamics and arrangement",
        "Week 6: a break week for practice at home",
        "Weeks 7–11: a short set to share with friends",
      ],
      bring: "Your instrument where portable, plus a pencil. Keyboards, amps, percussion and music stands are here.",
      practice: [
        "Listen for the bass line in your song",
        "Practice your part with a steady pulse",
        "Mark the places where you leave space",
      ],
    },
  };
  // Session IDs are stable. Never infer a valid session from an unchecked URL or storage key.
  const SESSIONS = [
    { id: "lk-mon", course: "little-keys", day: 1, time: "16:00", room: "Piano Room", places: 2 },
    { id: "fp-mon", course: "piano-first", day: 1, time: "18:15", room: "Piano Room", places: 3 },
    { id: "fc-mon", course: "guitar-first", day: 1, time: "16:15", room: "Courtyard Room", places: 2 },
    { id: "gr-mon", course: "guitar-return", day: 1, time: "19:00", room: "Courtyard Room", places: 1 },
    { id: "fb-tue", course: "violin-first", day: 2, time: "16:00", room: "Courtyard Room", places: 2 },
    { id: "st-tue", course: "strings-together", day: 2, time: "18:30", room: "Courtyard Room", places: 2 },
    { id: "df-tue", course: "drums-first", day: 2, time: "16:30", room: "Rhythm Room", places: 1 },
    { id: "rr-tue", course: "rhythm-room", day: 2, time: "19:00", room: "Rhythm Room", places: 3 },
    { id: "pn-wed", course: "piano-next", day: 3, time: "16:15", room: "Piano Room", places: 2 },
    { id: "vf-wed", course: "voice-first", day: 3, time: "18:00", room: "Courtyard Room", places: 3 },
    { id: "yv-wed", course: "young-voices", day: 3, time: "17:00", room: "Courtyard Room", places: 2 },
    { id: "cb-wed", course: "courtyard-band", day: 3, time: "18:30", room: "Rhythm Room", places: 2 },
    { id: "lk-thu", course: "little-keys", day: 4, time: "16:00", room: "Piano Room", places: 1 },
    { id: "fp-thu", course: "piano-first", day: 4, time: "19:00", room: "Piano Room", places: 2 },
    { id: "fc-thu", course: "guitar-first", day: 4, time: "16:15", room: "Courtyard Room", places: 3 },
    { id: "gr-thu", course: "guitar-return", day: 4, time: "18:00", room: "Courtyard Room", places: 2 },
    { id: "fb-fri", course: "violin-first", day: 5, time: "16:00", room: "Courtyard Room", places: 2 },
    { id: "df-fri", course: "drums-first", day: 5, time: "17:00", room: "Rhythm Room", places: 2 },
    { id: "lk-sat", course: "little-keys", day: 6, time: "09:30", room: "Piano Room", places: 2 },
    { id: "pn-sat", course: "piano-next", day: 6, time: "11:00", room: "Piano Room", places: 2 },
    { id: "yv-sat", course: "young-voices", day: 6, time: "10:00", room: "Courtyard Room", places: 3 },
    { id: "vf-sat", course: "voice-first", day: 6, time: "11:30", room: "Courtyard Room", places: 2 },
    { id: "st-sat", course: "strings-together", day: 6, time: "13:00", room: "Courtyard Room", places: 1 },
    { id: "cb-sat", course: "courtyard-band", day: 6, time: "13:30", room: "Rhythm Room", places: 2 },
  ];
  const SESSION_MAP = Object.fromEntries(SESSIONS.map((session) => [session.id, session]));
  const MINUTE_OPTIONS = { 10: 10, 15: 15, 20: 20, 30: 30 };
  // Teaching days for the schedule filter (Monday to Saturday) and practice days (any day, Sunday is 0).
  const DAY_OPTIONS = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6 };
  const PRACTICE_DAYS = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 0: 0 };

  function courseOptions(target, selected) {
    if (!target) return;
    target.innerHTML = Object.entries(COURSES)
      .map(([id, course]) => `<option value="${id}">${esc(course.title)} · ${esc(course.ageText)}</option>`)
      .join("");
    target.value = has(COURSES, selected) ? selected : "piano-first";
  }
  function readSaved() {
    const raw = readJSON(STORAGE_KEYS.saved);
    return Array.isArray(raw) ? [...new Set(raw.filter((id) => has(COURSES, id)))].slice(0, 12) : [];
  }
  function courseCard(id) {
    const course = COURSES[id];
    const saved = readSaved().includes(id);
    return `<article class="card flex h-full flex-col" data-course="${id}">
      <a href="course.html?id=${id}" class="block"><img class="course-art" src="assets/img/${id}.svg" width="370" height="280" alt="${esc(FAMILY_LABELS[course.family])} illustration"></a>
      <div class="flex flex-1 flex-col p-6"><div class="flex flex-wrap gap-2"><span class="pill">${esc(course.ageText)}</span><span class="pill">${esc(LEVEL_LABELS[course.level])}</span></div>
      <h3 class="font-display mt-5 text-2xl"><a href="course.html?id=${id}" class="hover:underline underline-offset-4">${esc(course.title)}</a></h3>
      <p class="mt-3 flex-1 leading-relaxed text-muted">${esc(course.subtitle)}</p>
      <p class="mt-5 border-t border-line pt-4 text-sm">${course.minutes} minutes · ${money(course.price)} per lesson</p>
      <div class="mt-5 flex items-center justify-between gap-3"><a href="course.html?id=${id}" class="link">Meet your course</a><button type="button" data-save="${id}" aria-pressed="${saved}" aria-label="${saved ? "Remove" : "Save"} ${esc(course.title)}" class="flex size-11 shrink-0 items-center justify-center rounded-full border border-ink/30 hover:bg-celadon"><svg aria-hidden="true" class="size-5" viewBox="0 0 24 24" fill="${saved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6"><path d="M6 3h12v18l-6-4-6 4z"/></svg></button></div></div></article>`;
  }
  function updateSaved() {
    const saved = readSaved();
    $$("[data-saved-count]").forEach((node) => {
      node.textContent = saved.length;
    });
    $$("[data-save]").forEach((button) => {
      const active = saved.includes(button.dataset.save);
      button.setAttribute("aria-pressed", String(active));
      // A button with visible text ("Save course") is named by it first; bookmark icons say Save or Remove.
      const text = button.textContent.trim();
      const title = COURSES[button.dataset.save].title;
      button.setAttribute("aria-label", text ? `${text}: ${title}` : `${active ? "Remove" : "Save"} ${title}`);
      $("svg", button).setAttribute("fill", active ? "currentColor" : "none");
    });
    const target = $("#shortlist");
    if (!target) return;
    target.innerHTML = saved.length
      ? saved
          .map(
            (id) =>
              `<div class="flex items-center justify-between gap-4 rounded-xl bg-paper p-4"><div><a href="course.html?id=${id}" class="font-semibold underline underline-offset-4">${esc(COURSES[id].title)}</a><p class="mt-1 text-sm">${esc(COURSES[id].ageText)} · ${money(COURSES[id].price * TERM_WEEKS)} per term</p></div><button type="button" data-remove-saved="${id}" class="link text-sm" aria-label="Remove ${esc(COURSES[id].title)} from shortlist">Remove</button></div>`,
          )
          .join("")
      : '<p class="text-muted">Save a course using its bookmark button. Your choices will appear here for an easy comparison.</p>';
  }
  function toggleSaved(id, remove = false) {
    if (!has(COURSES, id)) return;
    const saved = readSaved();
    const exists = saved.includes(id);
    const next = exists || remove ? saved.filter((value) => value !== id) : [...saved, id];
    writeJSON(STORAGE_KEYS.saved, next);
    updateSaved();
    toast(`${COURSES[id].title} ${exists || remove ? "removed from" : "added to"} your shortlist.`);
    if (remove) {
      const focus = $("[data-remove-saved]") || $("[data-save]") || $("#shortlist-title");
      if (focus) {
        if (focus.tagName === "H2") focus.tabIndex = -1;
        focus.focus();
      }
    }
  }
  function shared() {
    $$("[data-year]").forEach((node) => {
      node.textContent = today().getUTCFullYear();
    });
    $$("[data-term-pill]").forEach((node) => {
      node.textContent = `${termLabel(JOIN_TERM)} · new students from ${dateLabel(JOIN_DATE)}`;
    });
    $$("[data-week-heading]").forEach((node) => {
      const halfTermNow = CURRENT_TERM && iso(mondayOf(TODAY)) === iso(CURRENT_TERM.halfTerm);
      node.textContent = WEEK_IS_CURRENT
        ? "This teaching week"
        : halfTermNow
          ? "Lessons resume after the break"
          : "Next teaching week";
    });
    $$("[data-week-label]").forEach((node) => {
      node.textContent = rangeLabel(WEEK_START, addDays(WEEK_START, 5));
    });
    $$("[data-term-summary]").forEach((node) => {
      node.textContent = termSummary(WEEK_TERM);
    });
    $$("[data-join-date]").forEach((node) => {
      node.textContent = `New students join from ${dateLabel(JOIN_DATE, true)}.`;
    });
    const menu = $("#mobile-menu");
    const toggle = $("#menu-toggle");
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      toggle.setAttribute("aria-expanded", String(open));
      menu.hidden = !open;
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && !menu.hidden) {
        menu.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
    window.matchMedia("(min-width: 1280px)").addEventListener("change", (event) => {
      if (event.matches) {
        menu.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
      }
    });
    document.addEventListener("click", (event) => {
      const save = event.target.closest("[data-save]");
      const remove = event.target.closest("[data-remove-saved]");
      if (save) toggleSaved(save.dataset.save);
      if (remove) toggleSaved(remove.dataset.removeSaved, true);
    });
    const motion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (motion && "IntersectionObserver" in window) {
      document.documentElement.classList.add("motion");
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              $$(".reveal").forEach((node) => {
                if (node.getBoundingClientRect().top <= entry.boundingClientRect.bottom) {
                  node.classList.add("is-visible");
                  observer.unobserve(node);
                }
              });
            }
          });
        },
        { threshold: 0.05 },
      );
      $$(".reveal").forEach((node) => observer.observe(node));
    }
    updateSaved();
  }
  function home() {
    const target = $("[data-featured-courses]");
    if (target)
      target.innerHTML = Object.keys(COURSES)
        .filter((id) => COURSES[id].featured)
        .map(courseCard)
        .join("");
  }
  function courses() {
    if (!$("#course-grid")) return;
    const filters = {
      family: checkedParam("instrument", FAMILY_LABELS, "all"),
      age: checkedParam("age", AGE_LABELS, "all"),
      level: checkedParam("level", LEVEL_LABELS, "all"),
      search: (params.get("q") || "").slice(0, 100),
    };
    $("#course-family").value = filters.family;
    $("#course-age").value = filters.age;
    $("#course-level").value = filters.level;
    $("#course-search").value = filters.search;
    function render() {
      filters.family = $("#course-family").value;
      filters.age = $("#course-age").value;
      filters.level = $("#course-level").value;
      filters.search = $("#course-search").value.trim().slice(0, 100);
      const query = filters.search.toLocaleLowerCase("en-US");
      const ids = Object.keys(COURSES).filter((id) => {
        const course = COURSES[id];
        return (
          (filters.family === "all" || course.family === filters.family) &&
          (filters.age === "all" || course.age === filters.age) &&
          (filters.level === "all" || course.level === filters.level) &&
          (!query ||
            [
              course.title,
              course.subtitle,
              course.description,
              FAMILY_LABELS[course.family],
              TUTORS[course.tutor].name,
              ...course.keywords,
            ]
              .join(" ")
              .toLocaleLowerCase("en-US")
              .includes(query))
        );
      });
      $("#course-grid").innerHTML = ids.map(courseCard).join("");
      $("#course-empty").hidden = ids.length > 0;
      $("#course-count").textContent = `${plural(ids.length, "course")} to explore`;
      setParams({ instrument: filters.family, age: filters.age, level: filters.level, q: filters.search });
    }
    $("#course-filters").addEventListener("submit", (event) => {
      event.preventDefault();
      render();
    });
    $("#course-filters").addEventListener("input", render);
    $("#course-reset").addEventListener("click", () => {
      $("#course-filters").reset();
      render();
    });
    render();
    updateSaved();
  }
  function courseDetail() {
    const target = $("#course-detail");
    if (!target) return;
    const id = checkedParam("id", COURSES, "piano-first");
    const course = COURSES[id];
    const tutor = TUTORS[course.tutor];
    const sessions = SESSIONS.filter((session) => session.course === id);
    document.title = `${course.title} | Sonata Music Rooms`;
    const description = $('meta[name="description"]');
    description.content = course.description;
    $('meta[property="og:title"]').content = document.title;
    $('meta[property="og:description"]').content = course.description;
    target.innerHTML = `<section class="bg-celadon border-b border-line"><div class="wrap grid gap-9 py-12 sm:py-16 lg:grid-cols-[1.3fr_1fr] lg:items-center"><div><a class="link text-sm" href="courses.html">All courses</a><p class="eyebrow mt-6">${esc(FAMILY_LABELS[course.family])} · ${esc(course.ageText)} · ${esc(LEVEL_LABELS[course.level])}</p><h1 class="display mt-5 text-5xl sm:text-6xl">${esc(course.title)}</h1><p class="font-display mt-5 text-2xl">${esc(course.subtitle)}</p><div class="mt-7 flex flex-wrap gap-3"><a href="enrol.html?course=${id}" class="btn">Find your lesson ${icon}</a><button type="button" data-save="${id}" aria-pressed="${readSaved().includes(id)}" class="btn-line"><svg aria-hidden="true" viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 3h12v18l-6-4-6 4z"/></svg>Save course</button></div></div><img class="w-full rounded-3xl border border-ink/15" src="assets/img/${id}.svg" width="370" height="280" alt="${esc(FAMILY_LABELS[course.family])} course illustration"></div></section>
    <section class="section"><div class="wrap grid gap-12 lg:grid-cols-[1.5fr_1fr]"><div><h2 class="display text-4xl">A little more about your course.</h2><p class="mt-6 text-lg leading-relaxed">${esc(course.description)}</p><h3 class="font-display mt-9 text-2xl">By the end of the term</h3><ul class="mt-5 space-y-3">${course.outcomes.map((outcome) => `<li class="flex gap-3"><span aria-hidden="true" class="text-vermillion">—</span>${esc(outcome)}</li>`).join("")}</ul><h3 class="font-display mt-9 text-2xl">The shape of your term</h3><ol class="mt-5 space-y-4">${course.weeks.map((week) => `<li class="border-l-2 border-vermillion pl-4 leading-relaxed">${esc(week)}</li>`).join("")}</ol><h3 class="font-display mt-9 text-2xl">What to bring</h3><p class="mt-4 leading-relaxed text-muted">${esc(course.bring)}</p></div><aside><div class="rounded-2xl border border-ink/30 p-7"><p class="eyebrow">The practical bits</p><p class="font-display mt-5 text-4xl">${money(course.price * TERM_WEEKS)} <span class="font-sans text-base">per term</span></p><p class="mt-3">${TERM_WEEKS} lessons · ${course.minutes} minutes each</p><p class="mt-2 text-sm text-muted">${money(course.price)} per lesson · 4–6 in a group</p><p class="mt-6 border-t border-line pt-5 text-sm">${esc(termLabel(JOIN_TERM))} · new students join from ${dateLabel(JOIN_DATE, true)}. Joining part-way through a term, you pay only for the lessons left. An introduction costs ${money(INTRO_PRICE)}, credited against your first term.</p><a href="fees.html?course=${id}" class="link mt-5 inline-flex">Compare lesson prices</a></div><div class="mt-6 rounded-2xl bg-lilac p-6"><div class="flex items-center gap-4"><img src="assets/img/${course.tutor}.svg" width="80" height="80" alt="${esc(tutor.name)}" class="size-20 rounded-full object-cover"><div><p class="eyebrow">Your teacher</p><h3 class="font-display mt-2 text-2xl">${esc(tutor.name)}</h3></div></div><p class="mt-4 leading-relaxed">${esc(tutor.introduction)}</p><a href="tutors.html?instrument=${course.family}" class="link mt-4 inline-flex">Meet your teacher</a></div></aside></div></section>
    <section class="section bg-butter"><div class="wrap"><p class="eyebrow">Choose a regular session</p><h2 class="display mt-4 text-4xl">A time that fits your week.</h2><div class="mt-8 grid gap-5 md:grid-cols-2">${sessions.map((session) => `<article class="rounded-2xl bg-paper p-6"><h3 class="font-display text-2xl">${DAYS[session.day]} · ${clock(session.time)}</h3><p class="mt-3">${esc(session.room)} · ${course.minutes} minutes</p><p class="mt-2 text-sm text-muted">${plural(session.places, "spot")} left · new students’ first lesson ${dateLabel(lessonsFrom(session.day)[0] || JOIN_DATE)}</p><a href="enrol.html?course=${id}&session=${session.id}" class="link mt-5 inline-flex">Choose this session</a></article>`).join("")}</div></div></section>`;
    updateSaved();
  }
  function tutors() {
    if (!$("#tutor-grid")) return;
    $("#tutor-family").value = checkedParam("instrument", FAMILY_LABELS, "all");
    function render() {
      const family = $("#tutor-family").value;
      const ids = Object.keys(TUTORS).filter((id) => family === "all" || TUTORS[id].family === family);
      $("#tutor-count").textContent = `${plural(ids.length, "teacher")} to meet`;
      $("#tutor-grid").innerHTML = ids
        .map((id) => {
          const tutor = TUTORS[id];
          return `<article class="card"><div class="grid sm:grid-cols-[.8fr_1fr]"><img src="assets/img/${id}.svg" width="250" height="240" class="h-full min-h-48 w-full object-cover" alt="Portrait of ${esc(tutor.name)}"><div class="p-6"><p class="eyebrow text-vermillion">${esc(FAMILY_LABELS[tutor.family])}</p><h2 class="font-display mt-3 text-3xl">${esc(tutor.name)}</h2><p class="mt-3 text-sm leading-relaxed">${esc(tutor.experience)}</p><p class="font-display mt-5 text-lg italic">“${esc(tutor.quote)}”</p></div></div><div class="space-y-4 p-6"><p class="leading-relaxed">${esc(tutor.introduction)}</p><details class="faq"><summary>Inside a lesson with ${esc(tutor.name.split(" ")[0])}</summary><p>${esc(tutor.approach)}</p><p>${esc(tutor.interests)}</p><p>${esc(tutor.access)}</p></details><a href="courses.html?instrument=${tutor.family}" class="link inline-flex">Explore ${esc(FAMILY_LABELS[tutor.family].toLowerCase())} courses</a></div></article>`;
        })
        .join("");
      setParams({ instrument: family });
    }
    $("#tutor-family").addEventListener("change", render);
    render();
  }
  function timetable() {
    if (!$("#schedule-list")) return;
    $("#schedule-tutor").innerHTML += Object.entries(TUTORS)
      .map(([id, tutor]) => `<option value="${id}">${esc(tutor.name)}</option>`)
      .join("");
    const config = [
      ["day", DAY_OPTIONS, "day"],
      ["family", FAMILY_LABELS, "instrument"],
      ["age", AGE_LABELS, "age"],
      ["level", LEVEL_LABELS, "level"],
      ["tutor", TUTORS, "tutor"],
    ];
    config.forEach(([field, map, query]) => {
      $(`#schedule-${field}`).value = checkedParam(query, map, "all");
    });
    function render() {
      const selected = Object.fromEntries(config.map(([field]) => [field, $(`#schedule-${field}`).value]));
      const sessions = SESSIONS.filter((session) => {
        const course = COURSES[session.course];
        return (
          (selected.day === "all" || Number(selected.day) === session.day) &&
          (selected.family === "all" || selected.family === course.family) &&
          (selected.age === "all" || selected.age === course.age) &&
          (selected.level === "all" || selected.level === course.level) &&
          (selected.tutor === "all" || selected.tutor === course.tutor)
        );
      }).sort((a, b) => a.day - b.day || a.time.localeCompare(b.time));
      $("#schedule-count").textContent = `${plural(sessions.length, "session")} in the weekly schedule`;
      if (!sessions.length) {
        $("#schedule-list").innerHTML =
          '<div class="rounded-2xl bg-celadon p-8"><h2 class="font-display text-3xl">A different day might do it.</h2><p class="mt-3">Clear a filter to see more sessions, or ask us about an individual lesson.</p><a href="contact.html" class="link mt-4 inline-flex">Talk about your schedule</a></div>';
      } else {
        $("#schedule-list").innerHTML = [1, 2, 3, 4, 5, 6]
          .filter((day) => sessions.some((session) => session.day === day))
          .map(
            (day) =>
              `<section><div class="flex flex-wrap items-baseline gap-4 border-b border-ink pb-4"><h2 class="font-display text-3xl">${DAYS[day]}</h2><p class="text-sm text-muted">${dateLabel(addDays(WEEK_START, day - 1))}</p>${isBankHoliday(addDays(WEEK_START, day - 1)) ? `<p class="pill bg-butter">${esc(bankHolidays(addDays(WEEK_START, day - 1).getUTCFullYear())[iso(addDays(WEEK_START, day - 1))])} · no lessons</p>` : ""}</div><div class="mt-4 grid gap-4 lg:grid-cols-2">${sessions
                .filter((session) => session.day === day)
                .map((session) => {
                  const course = COURSES[session.course];
                  return `<article class="grid gap-4 rounded-xl border border-line bg-white p-5 sm:grid-cols-[6rem_1fr]"><p class="font-display text-2xl">${clock(session.time)}<span class="font-sans mt-1 block text-xs text-muted">${course.minutes} min</span></p><div><h3 class="font-display text-xl"><a href="course.html?id=${session.course}" class="hover:underline">${esc(course.title)}</a></h3><p class="mt-2 text-sm">${esc(TUTORS[course.tutor].name)} · ${esc(session.room)}</p><div class="mt-3 flex flex-wrap gap-2"><span class="pill">${esc(course.ageText)}</span><span class="pill">${esc(LEVEL_LABELS[course.level])}</span></div><div class="mt-4 flex flex-wrap items-center justify-between gap-3"><p class="text-sm text-muted">${plural(session.places, "spot")} left</p><a href="enrol.html?course=${session.course}&session=${session.id}" class="link text-sm">Choose this time</a></div></div></article>`;
                })
                .join("")}</div></section>`,
          )
          .join("");
      }
      setParams(Object.fromEntries(config.map(([field, , query]) => [query, selected[field]])));
      const active = Object.values(selected).filter((value) => value !== "all").length;
      $("#filters-active").textContent = active ? `${plural(active, "filter")} on` : "All sessions";
    }
    $("#filters-toggle").addEventListener("click", () => {
      const open = $("#filters-toggle").getAttribute("aria-expanded") !== "true";
      $("#filters-toggle").setAttribute("aria-expanded", String(open));
      $("#timetable-filters").classList.toggle("max-lg:hidden", !open);
    });
    $("#timetable-filters").addEventListener("change", render);
    $("#timetable-filters").addEventListener("submit", (event) => event.preventDefault());
    $("#schedule-reset").addEventListener("click", () => {
      $("#timetable-filters").reset();
      render();
    });
    render();
  }
  function calculateFee(courseId, format, plan, credit) {
    const course = COURSES[courseId];
    const individual = format !== "group";
    const validPlan = individual && plan === "pass" ? "pass" : "term";
    const lessons = validPlan === "pass" ? 6 : TERM_WEEKS;
    const price = individual ? LESSON_FORMATS[format].price : course.price;
    const gross = price * lessons;
    return {
      lessons,
      price,
      gross,
      credit: credit ? INTRO_PRICE : 0,
      total: gross - (credit ? INTRO_PRICE : 0),
      plan: validPlan,
      minutes: individual ? LESSON_FORMATS[format].minutes : course.minutes,
    };
  }
  function fees() {
    if (!$("#fee-form")) return;
    courseOptions($("#fee-course"), checkedParam("course", COURSES, "piano-first"));
    $("#fee-format").value = checkedParam("format", LESSON_FORMATS, "group");
    $("#fee-plan").value = ["term", "pass"].includes(params.get("plan")) ? params.get("plan") : "term";
    $("#fee-credit").checked = params.get("credit") === "yes";
    function render() {
      const course = $("#fee-course").value;
      const format = $("#fee-format").value;
      const pass = $('#fee-plan option[value="pass"]');
      pass.disabled = format === "group";
      if (format === "group") $("#fee-plan").value = "term";
      const plan = $("#fee-plan").value;
      const credit = $("#fee-credit").checked;
      const fee = calculateFee(course, format, plan, credit);
      const chosen = COURSES[course];
      const individual = format !== "group";
      const heading = individual
        ? `Individual ${FAMILY_LABELS[chosen.family].toLowerCase()} lessons`
        : chosen.title;
      const detail = individual
        ? `With ${TUTORS[chosen.tutor].name} · ${fee.minutes} minutes each`
        : `Course group · ${fee.minutes} minutes each · ${chosen.ageText}`;
      const creditRow = fee.credit
        ? `<div class="flex justify-between gap-4"><dt>Introduction credit</dt><dd>−${money(fee.credit)}</dd></div>`
        : "";
      const note =
        fee.plan === "pass"
          ? "Use within twelve weeks of your first lesson; arrange dates with your teacher."
          : `${NEXT_TERM ? `${termLabel(NEXT_TERM)} starts ${dateLabel(NEXT_TERM.start, true)}. ` : ""}Joining part-way through a term, you pay only for the lessons left. Two equal installments of ${money(fee.total / 2)} can be arranged.`;
      $("#fee-result").innerHTML =
        `<p class="eyebrow">Your ${fee.plan === "pass" ? "flexible pass" : "ten-week term"}</p><h3 class="font-display mt-5 text-3xl">${esc(heading)}</h3><p class="mt-3 text-muted">${esc(detail)}</p><dl class="mt-7 space-y-4"><div class="flex justify-between gap-4"><dt>${plural(fee.lessons, "lesson")} × ${money(fee.price)}</dt><dd>${money(fee.gross)}</dd></div>${creditRow}<div class="flex justify-between gap-4 border-t border-line pt-5"><dt class="font-semibold">Total tuition</dt><dd id="fee-total" class="font-display text-4xl">${money(fee.total)}</dd></div></dl><p class="mt-6 text-sm">${esc(note)}</p>`;
      $("#fee-enrol-link").href = format === "group" ? `enrol.html?course=${course}` : "contact.html?topic=lessons";
      $("#fee-enrol-link").textContent = format === "group" ? "Choose this course" : "Ask about individual lessons";
      setParams({ course, format, plan, credit: credit ? "yes" : "" });
    }
    $("#fee-form").addEventListener("change", render);
    $("#fee-form").addEventListener("submit", (event) => event.preventDefault());
    render();
  }
  function setError(id, message) {
    const field = $(`#${id}`);
    const error = $(`#${id}-error`);
    if (field) field.setAttribute("aria-invalid", String(Boolean(message)));
    if (error) error.textContent = message;
    return !message;
  }
  function validEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 180;
  }
  function enrolment() {
    if (!$("#enrol-form")) return;
    let step = 0;
    const initialCourse = checkedParam("course", COURSES, "piano-first");
    courseOptions($("#enrol-course"), initialCourse);
    function currentCourse() {
      return COURSES[$("#enrol-course").value];
    }
    function currentSession() {
      const session = has(SESSION_MAP, $("#enrol-session").value) ? SESSION_MAP[$("#enrol-session").value] : null;
      return session && session.course === $("#enrol-course").value ? session : null;
    }
    // Tuition for a new starter: the lessons left in the joining term, less the $15 introduction when it applies.
    function quote() {
      const course = currentCourse();
      const session = currentSession();
      const dates = session ? lessonsFrom(session.day) : [];
      const lessons = dates.length || TERM_WEEKS;
      const intro = $("#enrol-first").value === "intro";
      const credit = intro || $("#enrol-credit").value === "yes" ? INTRO_PRICE : 0;
      return { course, session, dates, lessons, intro, credit, gross: course.price * lessons, total: course.price * lessons - credit };
    }
    function tuitionText(q) {
      const sum = `${plural(q.lessons, "lesson")} × ${money(q.course.price)}${q.credit ? ` − ${money(q.credit)} introduction credit` : ""} = ${money(q.total)}`;
      return q.intro ? `Introduction ${money(INTRO_PRICE)} first, then ${sum}` : sum;
    }
    function updateCourse() {
      const course = currentCourse();
      const tutor = TUTORS[course.tutor];
      $("#enrol-course-info").innerHTML =
        `<p class="font-display text-2xl">${esc(course.subtitle)}</p><p class="mt-3">${esc(course.ageText)} · ${esc(LEVEL_LABELS[course.level])} · ${course.minutes} minutes</p><p class="mt-3 text-sm">${esc(course.description)}</p>`;
      $("#enrol-tutor").textContent = `${tutor.name} · ${FAMILY_LABELS[course.family]}`;
      const sessions = SESSIONS.filter((session) => session.course === $("#enrol-course").value);
      $("#enrol-session").innerHTML = sessions
        .map(
          (session) =>
            `<option value="${session.id}">${DAYS[session.day]} ${clock(session.time)} · ${plural(session.places, "spot")} left</option>`,
        )
        .join("");
      updateCost();
    }
    function updateCost() {
      const intro = $("#enrol-first").value === "intro";
      // Someone booking an introduction hasn't paid for one yet, so the credit question only applies to a full term.
      $("#enrol-credit-field").hidden = intro;
      if (intro) $("#enrol-credit").value = "no";
      const q = quote();
      const first = q.dates[0] ? `First lesson ${DAYS[q.session.day]}, ${dateLabel(q.dates[0], true)}. ` : "";
      $("#enrol-cost").textContent = `${first}${tuitionText(q)}. Nothing is paid until we confirm your spot.`;
    }
    function validateDetails() {
      const checks = [
        setError("enrol-name", $("#enrol-name").value.trim().length >= 2 ? "" : "Please enter your full name."),
        setError(
          "enrol-email",
          validEmail($("#enrol-email").value.trim()) ? "" : "Please enter an email address we can reply to.",
        ),
        setError(
          "enrol-learner",
          $("#enrol-learner").value.trim().length >= 2 ? "" : "Please enter the student’s first name.",
        ),
        setError("enrol-age", has(AGE_LABELS, $("#enrol-age").value) ? "" : "Please choose the student’s age group."),
      ];
      if (has(AGE_LABELS, $("#enrol-age").value) && $("#enrol-age").value !== currentCourse().age) {
        setError(
          "enrol-age",
          `This course is for ${AGE_LABELS[currentCourse().age].toLowerCase()}. Choose a suitable course in step one, or contact us for help.`,
        );
        return false;
      }
      return checks.every(Boolean);
    }
    function reviewRows() {
      const q = quote();
      return [
        ["Course", q.course.title],
        ["Student", `${$("#enrol-learner").value.trim()} · ${AGE_LABELS[$("#enrol-age").value]}`],
        ["Starting point", EXPERIENCE[$("#enrol-experience").value]],
        ["Teacher", TUTORS[q.course.tutor].name],
        ["Weekly session", `${DAYS[q.session.day]} ${clock(q.session.time)} · ${q.session.room}`],
        ["First lesson", q.dates[0] ? `${dateLabel(q.dates[0], true)} · ${termLabel(JOIN_TERM)}` : termLabel(JOIN_TERM)],
        ["First visit", q.intro ? `${money(INTRO_PRICE)} introduction first` : "Start with the term"],
        ["Tuition", tuitionText(q)],
        ["Contact", `${$("#enrol-name").value.trim()} · ${$("#enrol-email").value.trim()}`],
      ];
    }
    function buildReview() {
      const notes = $("#enrol-notes").value.trim();
      $("#enrol-review").innerHTML =
        `<dl class="space-y-4">${reviewRows()
          .map(
            ([label, value]) =>
              `<div class="grid gap-1 border-b border-line pb-4 sm:grid-cols-[10rem_1fr]"><dt class="text-sm font-semibold text-muted">${esc(label)}</dt><dd class="break-words">${esc(value)}</dd></div>`,
          )
          .join(
            "",
          )}</dl>${notes ? `<h3 class="font-semibold mt-5">Your note</h3><p class="mt-2 whitespace-pre-wrap break-words">${esc(notes)}</p>` : ""}`;
    }
    function showStep(next) {
      step = next;
      $$("[data-wizard-step]").forEach((section) => {
        section.hidden = Number(section.dataset.wizardStep) !== step;
      });
      $$("[data-step-indicator]").forEach((indicator) => {
        if (Number(indicator.dataset.stepIndicator) === step) indicator.setAttribute("aria-current", "step");
        else indicator.removeAttribute("aria-current");
      });
      $("#wizard-back").hidden = step === 0;
      $("#wizard-next").hidden = step === 3;
      $("#enrol-submit").hidden = step !== 3;
      $("#wizard-next").textContent = step === 2 ? "Review your inquiry" : "Continue";
      $("#wizard-status").textContent = `Step ${step + 1} of 4`;
      $(`[data-wizard-step="${step}"] h2`).focus();
      if (step === 3) buildReview();
    }
    function validateStep(current) {
      if (current === 0)
        return setError("enrol-course", has(COURSES, $("#enrol-course").value) ? "" : "Please choose a course.");
      if (current === 1)
        return setError("enrol-session", currentSession() ? "" : "Please choose a session for this course.");
      if (current === 2) return validateDetails();
      return true;
    }
    function next() {
      if (!validateStep(step)) {
        $("#wizard-status").textContent = "Please check the highlighted details.";
        const first = $('[aria-invalid="true"]', $(`[data-wizard-step="${step}"]`));
        if (first) first.focus();
        return;
      }
      showStep(Math.min(3, step + 1));
    }
    $("#wizard-next").addEventListener("click", next);
    $("#wizard-back").addEventListener("click", () => showStep(Math.max(0, step - 1)));
    $("#enrol-course").addEventListener("change", updateCourse);
    $("#enrol-session").addEventListener("change", updateCost);
    $("#enrol-first").addEventListener("change", updateCost);
    $("#enrol-credit").addEventListener("change", updateCost);
    $("#enrol-form").addEventListener("submit", (event) => {
      event.preventDefault();
      // Enter in a field of an earlier step moves on rather than sending.
      if (step < 3) {
        next();
        return;
      }
      for (const check of [0, 1, 2]) {
        if (!validateStep(check)) {
          showStep(check);
          next();
          return;
        }
      }
      // Connect a form service here (for example Formspree): send new FormData(form) plus the course and
      // session IDs with fetch(), and only show the confirmation once response.ok is true. Check the course,
      // session, age group and price again on the server; see DOCS.md, Forms.
      const q = quote();
      const ref = reference(`${q.course.title}${q.session.id}`);
      $("#enrol-form").hidden = true;
      $("#enrol-steps").hidden = true;
      $("[data-done-ref]").textContent = ref;
      $("[data-done-name]").textContent = $("#enrol-name").value.trim().split(/\s+/)[0];
      $("[data-done-email]").textContent = $("#enrol-email").value.trim();
      $("[data-done-detail]").textContent =
        `${$("#enrol-learner").value.trim()} would like a spot in ${q.course.title}, ${DAYS[q.session.day]}s at ${clock(q.session.time)} with ${TUTORS[q.course.tutor].name}${q.dates[0] ? `, starting ${dateLabel(q.dates[0], true)}` : ""}. ${tuitionText(q)}.`;
      const done = $("#enrol-done");
      done.hidden = false;
      done.focus();
    });
    updateCourse();
    const sessionId = params.get("session");
    if (has(SESSION_MAP, sessionId) && SESSION_MAP[sessionId].course === initialCourse) {
      $("#enrol-session").value = sessionId;
      updateCost();
    }
  }
  function readPractice() {
    const raw = readJSON(STORAGE_KEYS.practice);
    if (
      !raw ||
      typeof raw !== "object" ||
      Array.isArray(raw) ||
      !has(COURSES, raw.course) ||
      !Number.isInteger(raw.minutes) ||
      !has(MINUTE_OPTIONS, String(raw.minutes)) ||
      !Array.isArray(raw.days)
    )
      return null;
    const days = [...new Set(raw.days.filter((day) => Number.isInteger(day) && has(PRACTICE_DAYS, String(day))))].slice(
      0,
      7,
    );
    if (!days.length) return null;
    const complete = Array.isArray(raw.complete)
      ? [...new Set(raw.complete.filter((day) => days.includes(day) && Number.isInteger(day)))]
      : [];
    return {
      course: raw.course,
      minutes: MINUTE_OPTIONS[String(raw.minutes)],
      days,
      complete: raw.week === iso(PRACTICE_WEEK_START) ? complete : [],
      week: iso(PRACTICE_WEEK_START),
    };
  }
  function practice() {
    if (!$("#practice-form")) return;
    const existing = readPractice();
    courseOptions($("#practice-course"), existing ? existing.course : "piano-first");
    $("#practice-minutes").value = existing ? existing.minutes : 10;
    $("#practice-days").innerHTML = [1, 2, 3, 4, 5, 6, 0]
      .map(
        (day) =>
          `<label class="flex items-center gap-2 rounded-lg border border-line px-3 py-3"><input type="checkbox" value="${day}" name="practice-day" class="size-4 accent-ink" ${existing ? (existing.days.includes(day) ? "checked" : "") : [1, 3, 5].includes(day) ? "checked" : ""}>${DAYS[day].slice(0, 3)}</label>`,
      )
      .join("");
    function render() {
      const plan = readPractice();
      if (!plan) {
        $("#practice-output").innerHTML =
          '<h3 class="font-display text-2xl">A little plan goes a long way.</h3><p class="mt-3 text-muted">Choose your days above, then save a manageable routine. Your teacher can help choose what to practice.</p>';
        return;
      }
      const course = COURSES[plan.course];
      const done = plan.complete.length;
      $("#practice-output").innerHTML =
        `<div class="flex flex-wrap items-start justify-between gap-5"><div><p class="eyebrow">Week of ${dateLabel(PRACTICE_WEEK_START)}</p><h3 class="font-display mt-3 text-3xl">${esc(course.title)}</h3><p class="mt-3">${plan.minutes} minutes × ${plural(plan.days.length, "day")} = ${plan.minutes * plan.days.length} minutes for you.</p></div><button type="button" id="practice-clear" class="link text-sm">Clear plan</button></div><p id="practice-progress" role="status" aria-live="polite" class="mt-6 font-semibold">${done ? `${done} of ${plural(plan.days.length, "practice day")} done this week${done === plan.days.length ? " · well played" : ""}` : `${plural(plan.days.length, "practice day")} planned this week · none checked off yet`}</p><div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">${plan.days.map((day) => `<button type="button" data-practice-done="${day}" aria-pressed="${plan.complete.includes(day)}" class="rounded-xl border border-ink/30 p-4 text-left hover:bg-celadon ${plan.complete.includes(day) ? "bg-celadon" : "bg-white"}"><span class="font-semibold">${DAYS[day]}</span><span class="mt-1 block text-sm">${plan.complete.includes(day) ? "Done — well played" : `${plan.minutes} minutes · mark done`}</span></button>`).join("")}</div><div class="mt-7 border-t border-line pt-6"><h4 class="font-semibold">Three small things to try</h4><ol class="mt-3 list-inside list-decimal space-y-2 text-muted">${course.practice.map((item) => `<li>${esc(item)}</li>`).join("")}</ol></div>`;
    }
    $("#practice-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const days = $$('input[name="practice-day"]:checked').map((input) => Number(input.value));
      if (!days.length) {
        $("#practice-error").textContent = "Choose at least one practice day.";
        return;
      }
      const id = $("#practice-course").value;
      const minutes = $("#practice-minutes").value;
      if (!has(COURSES, id) || !has(MINUTE_OPTIONS, minutes)) return;
      writeJSON(STORAGE_KEYS.practice, {
        course: id,
        minutes: MINUTE_OPTIONS[minutes],
        days,
        complete: [],
        week: iso(PRACTICE_WEEK_START),
      });
      $("#practice-error").textContent = "";
      render();
      toast("Your practice plan is saved. Start with something small.");
    });
    $("#practice-output").addEventListener("click", (event) => {
      const toggle = event.target.closest("[data-practice-done]");
      const clear = event.target.closest("#practice-clear");
      if (toggle) {
        const plan = readPractice();
        const day = Number(toggle.dataset.practiceDone);
        if (!plan || !plan.days.includes(day)) return;
        plan.complete = plan.complete.includes(day)
          ? plan.complete.filter((value) => value !== day)
          : [...plan.complete, day];
        writeJSON(STORAGE_KEYS.practice, plan);
        render();
        $(`[data-practice-done="${day}"]`).focus();
      }
      if (clear) {
        safeStorage.removeItem(STORAGE_KEYS.practice);
        render();
        $("#practice-course").focus();
        toast("Your practice plan has been cleared.");
      }
    });
    render();
  }
  function contact() {
    if (!$("#contact-form")) return;
    $("#contact-topic").value = checkedParam("topic", CONTACT_TOPICS, "lessons");
    $("#contact-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const name = $("#contact-name").value.trim();
      const email = $("#contact-email").value.trim();
      const message = $("#contact-message").value.trim();
      const valid = [
        setError("contact-name", name.length >= 2 ? "" : "Please enter your name."),
        setError("contact-email", validEmail(email) ? "" : "Please enter a valid email address."),
        setError(
          "contact-message",
          message.length >= 15 ? "" : "Please include a little more detail (at least 15 characters).",
        ),
      ].every(Boolean);
      if (!valid) {
        $('[aria-invalid="true"]', $("#contact-form")).focus();
        return;
      }
      // Connect a form service here (for example Formspree): fetch(form.action, { method: "POST",
      // body: new FormData(form), headers: { Accept: "application/json" } }), then show the thanks
      // only when response.ok is true. See DOCS.md, Forms.
      const topic = CONTACT_TOPICS[$("#contact-topic").value];
      $("#contact-form").hidden = true;
      $("[data-contact-ref]").textContent = reference(`${topic}${email}`);
      $("[data-contact-name]").textContent = name.split(/\s+/)[0];
      $("[data-contact-email]").textContent = email;
      $("[data-contact-topic]").textContent = topic.toLowerCase();
      const done = $("#contact-done");
      done.hidden = false;
      done.focus();
    });
    $("#contact-again").addEventListener("click", () => {
      $("#contact-form").reset();
      $("#contact-topic").value = checkedParam("topic", CONTACT_TOPICS, "lessons");
      $("#contact-form").hidden = false;
      $("#contact-done").hidden = true;
      $("#contact-name").focus();
    });
  }
  shared();
  home();
  courses();
  courseDetail();
  tutors();
  timetable();
  fees();
  enrolment();
  practice();
  contact();
})();
