/* Sketch — site scripts for Marnie Draws. Vanilla JavaScript, no dependencies.
   Courses, workshops, free resources and the student gallery all live in the
   data constants below: edit them and every page updates. */
(function () {
  'use strict';

  /* ======================================================================
     1. Settings
     ====================================================================== */
  // Used in the page titles this script sets (course pages).
  var SITE_NAME = 'Marnie Draws';
  // Every date and time (workshops, the early-bird deadline) is wall-clock time here.
  var TIMEZONE = 'America/New_York';
  var LOCALE = 'en-US';
  var CURRENCY = 'USD';
  // localStorage keys. Both hold arrays of ids and are validated on every read.
  var STORAGE_KEYS = { saved: 'sketch-saved', waitlist: 'sketch-waitlist' };
  // A workshop with this many seats or fewer left shows a "few seats left" warning.
  var FEW_SEATS = 5;
  var INK = '#1d1626';

  // Early-bird deadline for the flagship course, as Eastern wall-clock time ('2026-11-15T23:59').
  // null = the rolling demo deadline: the end of the current month at 11:59 PM, or of next month when
  // fewer than 7 days are left, so the demo offer is always running. Set a real date for your launch.
  var EARLY_BIRD_ENDS = null;
  // Demo dates: the workshops below are written for the week of DEMO_ANCHOR. While KEEP_DEMO_CURRENT
  // is true they move forward in whole weeks so the demo always has upcoming dates (weekdays and
  // times never change). Set it to false once you enter your real workshop dates.
  var KEEP_DEMO_CURRENT = true;
  var DEMO_ANCHOR = '2026-10-17';

  /* ======================================================================
     2. Helpers
     ====================================================================== */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function has(obj, key) { return typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); }
  function money(n) {
    return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY, minimumFractionDigits: n % 1 ? 2 : 0 }).format(n);
  }
  function fmtNumber(n) { return Number(n).toLocaleString(LOCALE); }
  // "4 h 13 min", "45 min", "2 h".
  function runtime(mins) {
    var h = Math.floor(mins / 60), m = mins % 60;
    if (!h) return m + ' min';
    return h + ' h' + (m ? ' ' + m + ' min' : '');
  }
  function param(name) {
    try { return new URLSearchParams(window.location.search).get(name); } catch (e) { return null; }
  }
  function setParams(values) {
    var url = new URL(window.location.href);
    Object.keys(values).forEach(function (k) {
      if (values[k]) url.searchParams.set(k, values[k]); else url.searchParams.delete(k);
    });
    try { history.replaceState(null, '', url.pathname + url.search + url.hash); } catch (e) { /* file:// in some browsers */ }
  }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Storage that degrades to memory when localStorage is blocked (sandboxed iframes,
     strict privacy settings), so saving still works for the page view. */
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
  function readJSON(key, fallback) {
    try { var v = JSON.parse(safeStorage.getItem(key)); return v == null ? fallback : v; } catch (e) { return fallback; }
  }
  function writeJSON(key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* quota */ } }

  /* ======================================================================
     3. Time (always in TIMEZONE)
     ====================================================================== */
  function now() { return new Date(); }
  var partsFmt = new Intl.DateTimeFormat('en-US', { timeZone: TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23' });
  function zoneParts(date) {
    var p = {};
    partsFmt.formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
    return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, mi: +p.minute, s: +p.second };
  }
  // Milliseconds TIMEZONE is ahead of UTC at a given instant (-5 h in winter, -4 h in summer for New York).
  function offsetAt(ms) {
    var p = zoneParts(new Date(ms));
    return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000;
  }
  // "2026-11-15T23:59" in TIMEZONE -> Date. Returns null for anything malformed.
  function zonedDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(iso));
    if (!m) return null;
    var guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
    var t = guess - offsetAt(guess);
    var t2 = guess - offsetAt(t);
    return new Date(t2);
  }
  // Whole days since 1970-01-01 for an ISO date, today's date in TIMEZONE, and back again.
  function dayNum(isoDate) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5 : NaN; }
  function londonDayNum(date) { var p = zoneParts(date); return Date.UTC(p.y, p.m - 1, p.d) / 864e5; }
  function isoFromDayNum(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  // The rolling demo deadline (EARLY_BIRD_ENDS = null): end of this month at 11:59 PM Eastern time, or of
  // next month when fewer than 7 days are left.
  function rollingDeadline(at) {
    var p = zoneParts(at), y = p.y, m = p.m;
    function endOf(yy, mm) {
      var last = new Date(Date.UTC(yy, mm, 0)).getUTCDate();
      return zonedDate(yy + '-' + String(mm).padStart(2, '0') + '-' + String(last).padStart(2, '0') + 'T23:59');
    }
    var end = endOf(y, m);
    if (end.getTime() - at.getTime() < 7 * 864e5) { m += 1; if (m > 12) { m = 1; y += 1; } end = endOf(y, m); }
    return end;
  }
  function fmtIn(date, opts, zone) {
    return new Intl.DateTimeFormat(LOCALE, Object.assign({ timeZone: zone || TIMEZONE }, opts)).format(date);
  }
  // Short zone label. TIMEZONE uses ZONE_LABELS by offset (browsers differ: "EDT" vs "GMT-4");
  // other zones use whatever the browser gives.
  var ZONE_LABELS = { '-300': 'EST', '-240': 'EDT' };
  function zoneName(date, zone) {
    if (!zone || zone === TIMEZONE) {
      var mins = String(Math.round(offsetAt(date.getTime()) / 60000));
      if (has(ZONE_LABELS, mins)) return ZONE_LABELS[mins];
    }
    var part = new Intl.DateTimeFormat(LOCALE, { timeZone: zone || TIMEZONE, timeZoneName: 'short' }).formatToParts(date)
      .filter(function (p) { return p.type === 'timeZoneName'; })[0];
    return part ? part.value : '';
  }
  function clock(date, zone) { return fmtIn(date, { hour: 'numeric', minute: '2-digit', hour12: true }, zone); }
  function longDate(date) { return fmtIn(date, { weekday: 'long', day: 'numeric', month: 'long' }); }
  var visitorZone = (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } })();

  /* ======================================================================
     4. Data
     ====================================================================== */
  var LEVELS = {
    beginner: { name: 'Beginner', bg: 'bg-green-soft' },
    improver: { name: 'Intermediate', bg: 'bg-yellow-soft' },
    confident: { name: 'Confident', bg: 'bg-lilac-soft' }
  };
  var TOPICS = {
    basics: 'Drawing basics',
    characters: 'Characters',
    lettering: 'Lettering',
    colour: 'Color',
    places: 'Places and scenes',
    animation: 'Animation'
  };
  // Marker colors used by course covers and stickers (hex for SVG art).
  var COLOURS = {
    pink: { fill: '#ff6fae', soft: '#ffd9ea' },
    blue: { fill: '#6d93ff', soft: '#dce6ff' },
    yellow: { fill: '#ffd84a', soft: '#fff1b0' },
    green: { fill: '#3fd19a', soft: '#cff5e4' },
    orange: { fill: '#ff9446', soft: '#ffe2cc' },
    lilac: { fill: '#b9a2ff', soft: '#ebe3ff' }
  };
  // Color sets for generated artwork: background + three fills.
  var PALETTES = {
    sunny: { bg: '#fff1b0', a: '#ff9446', b: '#ff6fae', c: '#3fd19a' },
    candy: { bg: '#ffd9ea', a: '#ff6fae', b: '#ffd84a', c: '#6d93ff' },
    sky: { bg: '#dce6ff', a: '#6d93ff', b: '#ffd84a', c: '#ff6fae' },
    mint: { bg: '#cff5e4', a: '#3fd19a', b: '#ff9446', c: '#b9a2ff' },
    peach: { bg: '#ffe2cc', a: '#ff9446', b: '#3fd19a', c: '#ff6fae' },
    lilac: { bg: '#ebe3ff', a: '#b9a2ff', b: '#ff6fae', c: '#ffd84a' },
    night: { bg: '#2a2340', a: '#ffd84a', b: '#fffefa', c: '#ff6fae' }
  };

  /* Courses. Each module is [title, lessons]; each lesson is [title, minutes] or
     [title, minutes, 'project']. Lesson counts and runtimes are computed from this. */
  var COURSES = [
    { id: 'draw-anything', title: 'Draw Anything on iPad', tagline: 'From blank canvas to finished drawings you are proud of, in five friendly modules.',
      level: 'beginner', topic: 'basics', price: 149, earlyBird: { price: 99, ends: EARLY_BIRD_ENDS },
      colour: 'yellow', motif: 'mug', palette: 'sunny', badge: 'Flagship', rating: 4.9, reviews: 1480, students: 9120, app: 'Procreate or Fresco',
      summary: 'My signature course for complete beginners. We start with the iPad itself, then build every drawing from simple shapes, add color that works and finish with a scene that is all yours. No talent required, just a bit of practice.',
      makes: [['A cozy mug still life', 'mug'], ['Your pet as a character', 'cat'], ['A little storefront', 'house'], ['A sketchbook spread of 30 objects', 'plant']],
      modules: [
        ['Getting comfy with your iPad', [['Setting up your canvas', 8], ['The five brushes I actually use', 12], ['Layers without the fear', 14], ['Undo is your best friend', 6]]],
        ['Shapes first, details later', [['Seeing in simple shapes', 11], ['A mug from three shapes', 16, 'project'], ['Line weight and wobble', 9], ['Your first still life', 22, 'project']]],
        ['Color that works', [['Picking a small palette', 12], ['Flat color, fast', 10], ['Shading with multiply layers', 15], ['Highlights and texture', 13]]],
        ['Characters and pets', [['Faces from circles', 14], ['An expressions cheat sheet', 9], ['Turning your pet into a character', 24, 'project']]],
        ['Putting it all together', [['Composing a scene', 13], ['Drawing a storefront', 28, 'project'], ['Exporting and sharing', 7], ['Your 30-object sketchbook', 10, 'project']]]
      ] },
    { id: 'characters', title: 'Characters with Charm', tagline: 'Design lovable characters with personality, poses and a look that is unmistakably yours.',
      level: 'improver', topic: 'characters', price: 119, earlyBird: null,
      colour: 'pink', motif: 'cat', palette: 'candy', badge: 'Bestseller', rating: 4.9, reviews: 620, students: 4310, app: 'Procreate or Fresco',
      summary: 'Take your doodles further. You will learn shape language, expressions and poses, then design a small cast of characters and a sticker sheet to show them off.',
      makes: [['A cast of three characters', 'cat'], ['An expressions sheet', 'whale'], ['A printable sticker sheet', 'mushroom']],
      modules: [
        ['Shape language', [['Round, square, spiky', 12], ['Silhouettes that read', 10], ['Proportion play', 14]]],
        ['Faces and feelings', [['The expression toolkit', 16], ['Eyes do the talking', 11], ['Twelve moods, one face', 20, 'project']]],
        ['Poses and movement', [['The line of action', 13], ['Hands, simplified', 15], ['Poses that tell a story', 18]]],
        ['Your cast', [['Designing a hero', 22, 'project'], ['Sidekicks and contrast', 17], ['A turnaround sheet', 19], ['Making a sticker sheet', 21, 'project']]]
      ] },
    { id: 'loose-lettering', title: 'Loose Hand Lettering', tagline: 'Bouncy, brushy lettering for cards, quotes and sketchbook headers.',
      level: 'beginner', topic: 'lettering', price: 79, earlyBird: null,
      colour: 'green', motif: 'lettering', palette: 'mint', badge: '', rating: 4.8, reviews: 540, students: 3870, app: 'Procreate',
      summary: 'Lettering that looks relaxed but is built on a few simple rules. Learn pressure, spacing and bounce, then letter a set of greeting cards you can actually send.',
      makes: [['A bouncy alphabet', 'lettering'], ['Three greeting cards', 'rainbow'], ['A quote poster', 'moon']],
      modules: [
        ['Pressure and rhythm', [['Thick down, thin up', 9], ['Drills that do not feel like drills', 12], ['Setting up a pressure curve', 7]]],
        ['Letters with bounce', [['Lowercase, loosened', 16], ['Capitals with swagger', 14], ['Spacing by eye', 10]]],
        ['Making it pretty', [['Shadows and highlights', 11], ['Flourishes, sparingly', 9], ['Lettering a greeting card', 18, 'project'], ['A quote poster', 20, 'project']]]
      ] },
    { id: 'colour-confidence', title: 'Color Confidence', tagline: 'Stop guessing. Build palettes that glow and light that feels real.',
      level: 'improver', topic: 'colour', price: 89, earlyBird: null,
      colour: 'orange', motif: 'rainbow', palette: 'peach', badge: '', rating: 4.8, reviews: 410, students: 2950, app: 'Procreate or Fresco',
      summary: 'A practical course on color for illustrators. Value first, then hue, temperature and light, with palette exercises you can reuse for every drawing after.',
      makes: [['Five reusable palettes', 'rainbow'], ['One scene, four moods', 'house'], ['A glowing night drawing', 'moon']],
      modules: [
        ['Value before hue', [['Squint at it', 8], ['Grayscale first, color later', 14], ['Clipping masks and gradient maps', 16]]],
        ['Building palettes', [['Three-color palettes', 12], ['Warm, cool and neutral', 11], ['Stealing from photos, nicely', 10], ['Your palette library', 15, 'project']]],
        ['Light and mood', [['Morning, noon and night', 18], ['Glow and rim light', 13], ['One scene, four moods', 24, 'project']]]
      ] },
    { id: 'cosy-places', title: 'Cozy Places', tagline: 'Draw warm little interiors and streets with simple perspective and lots of detail.',
      level: 'confident', topic: 'places', price: 129, earlyBird: null,
      colour: 'blue', motif: 'house', palette: 'sky', badge: '', rating: 4.9, reviews: 350, students: 2140, app: 'Procreate',
      summary: 'For when you are ready to draw whole scenes. Friendly perspective, clever shortcuts for clutter and a big final illustration of a café, bookstore or bedroom.',
      makes: [['A corner café', 'mug'], ['A beach-town street', 'house'], ['Your own room, cozier', 'plant']],
      modules: [
        ['Perspective, gently', [['One-point, no math', 15], ['Two-point in practice', 18], ['Perspective guides that help', 9]]],
        ['Clutter is the charm', [['Shelves, plants and books', 17], ['Repeating with variety', 12], ['Textures that read small', 14]]],
        ['Light inside', [['Window light', 13], ['Lamps and evening glow', 15]]],
        ['The big scene', [['Planning with thumbnails', 11], ['Line art in layers', 26, 'project'], ['Color and lighting pass', 28, 'project'], ['Finishing touches', 12]]]
      ] },
    { id: 'sketchbook-habit', title: 'The 30-Day Sketchbook Habit', tagline: 'Ten minutes a day, thirty prompts, and a full sketchbook by the end of the month.',
      level: 'beginner', topic: 'basics', price: 0, earlyBird: null,
      colour: 'lilac', motif: 'plant', palette: 'lilac', badge: 'Free', rating: 4.8, reviews: 2210, students: 18600, app: 'Any drawing app',
      summary: 'My free starter course. A short video and a prompt for every day of the month, so drawing becomes a habit instead of a someday.',
      makes: [['Thirty little drawings', 'plant'], ['A daily drawing habit', 'moon']],
      modules: [
        ['Week one: things on your desk', [['Welcome and kit', 5], ['Days 1 to 7 prompts', 14, 'project']]],
        ['Week two: things that grow', [['Drawing leaves quickly', 6], ['Days 8 to 14 prompts', 14, 'project']]],
        ['Week three: things you love', [['Drawing from memory', 7], ['Days 15 to 21 prompts', 14, 'project']]],
        ['Week four: out and about', [['Sketching on the go', 6], ['Days 22 to 30 prompts', 18, 'project']]]
      ] },
    { id: 'wiggle', title: 'Make Your Doodles Wiggle', tagline: 'Simple frame-by-frame animation for looping stickers, GIFs and social posts.',
      level: 'confident', topic: 'animation', price: 99, earlyBird: null,
      colour: 'pink', motif: 'whale', palette: 'candy', badge: 'New', rating: 4.7, reviews: 96, students: 760, app: 'Procreate',
      summary: 'Bring your drawings to life with short, satisfying loops. Boiling lines, bounces and blinks, exported as GIFs and videos ready to share.',
      makes: [['A boiling-line sticker', 'whale'], ['A bouncing character loop', 'cat'], ['An animated greeting', 'lettering']],
      modules: [
        ['Animation basics', [['Frames, onion skins and timing', 14], ['The boiling line', 10, 'project']]],
        ['Movement that feels good', [['Squash and stretch', 16], ['A bouncing ball, then a bouncing bean', 18], ['Blinks and breathing', 12]]],
        ['Loops to share', [['Planning a perfect loop', 11], ['Animated lettering', 17, 'project'], ['Exporting GIFs and videos', 8]]]
      ] }
  ];
  var COURSE_BY_ID = {};
  COURSES.forEach(function (c) { COURSE_BY_ID[c.id] = c; });
  var FLAGSHIP = 'draw-anything';

  var REVIEWS = [
    { course: 'draw-anything', name: 'Hettie M.', where: 'Bellingham', text: 'I bought an iPad for drawing and then never drew. Three weeks into this course I had a sketchbook full of mugs, plants and my very judgmental cat.' },
    { course: 'draw-anything', name: 'Faisal K.', where: 'Decatur', text: 'Marnie explains layers better than any video I have watched. Short lessons, no fluff, and the projects actually look good.' },
    { course: 'draw-anything', name: 'Orla D.', where: 'Dubuque', text: 'The shapes-first approach clicked right away. I finally stopped erasing everything.' },
    { course: 'characters', name: 'Cosmo R.', where: 'Petaluma', text: 'My characters used to all look the same. Now they have silhouettes, moods and actual personalities.' },
    { course: 'characters', name: 'Lottie P.', where: 'Durham', text: 'The sticker sheet project paid for the course. I sold out at my first craft fair.' },
    { course: 'loose-lettering', name: 'Imogen T.', where: 'Tulsa', text: 'Every birthday card in my family is now hand lettered. They have noticed.' },
    { course: 'colour-confidence', name: 'Rufus A.', where: 'Kalamazoo', text: 'The value-first exercise changed how I color everything. My drawings finally glow.' },
    { course: 'cosy-places', name: 'Zara N.', where: 'Lancaster', text: 'Perspective without the math, as promised. My café drawing is now on the actual café wall.' },
    { course: 'sketchbook-habit', name: 'Wendell O.', where: 'Tacoma', text: 'Thirty days, thirty drawings, zero excuses. I have kept going for four months.' },
    { course: 'wiggle', name: 'Tilly B.', where: 'Sitka', text: 'Boiling lines are my new favorite thing. Everything I post wiggles now.' }
  ];

  /* Live workshops. Dates and times are wall-clock times in TIMEZONE. Workshops whose end
     time has passed disappear from the page on their own. */
  var WORKSHOPS = [
    { id: 'leafy-houseplants', title: 'Leafy Houseplants Draw Along', date: '2026-10-24', start: '10:00', end: '11:30', price: 25, capacity: 40, booked: 33, level: 'beginner', palette: 'peach', motif: 'plant',
      blurb: 'A windowsill of monsteras, cacti and trailing ivy, drawn together in real time. Bring a cup of coffee.' },
    { id: 'sleepy-moon', title: 'Sleepy Moon Characters', date: '2026-10-31', start: '16:00', end: '17:30', price: 25, capacity: 40, booked: 40, level: 'beginner', palette: 'night', motif: 'moon',
      blurb: 'A drowsy moon, a yawning star and a cloud that refuses to get up. Cute characters with lots of glow.' },
    { id: 'lettering-cards', title: 'Lettering Greeting Cards', date: '2026-11-08', start: '14:00', end: '16:00', price: 30, capacity: 30, booked: 29, level: 'improver', palette: 'mint', motif: 'lettering',
      blurb: 'Letter three cards for birthdays, thank-yous and just-because, from loose brush script to a print-ready file.' },
    { id: 'cafe-corner', title: 'Cozy Café Corner', date: '2026-11-21', start: '10:00', end: '12:30', price: 35, capacity: 30, booked: 12, level: 'confident', palette: 'sky', motif: 'mug',
      blurb: 'A whole café interior in one morning: simple perspective, lots of mugs and a warm lamp-lit glow.' },
    { id: 'sketchbook-kickoff', title: 'Sketchbook Kick-off', date: '2026-12-05', start: '10:00', end: '11:30', price: 0, capacity: 60, booked: 21, level: 'beginner', palette: 'lilac', motif: 'rainbow',
      blurb: 'A free session to set up a fresh sketchbook, pick a theme and draw the first page together.' },
    { id: 'brush-lab', title: 'Brush Lab: Make Your Own Brushes', date: '2026-12-19', start: '10:00', end: '12:00', price: 30, capacity: 30, booked: 6, level: 'improver', palette: 'candy', motif: 'mushroom',
      blurb: 'Build a texture brush, a stamp brush and a gouache brush from scratch, and leave with a set you made yourself.' }
  ];
  // Keep the demo current (see KEEP_DEMO_CURRENT): shift every workshop by whole weeks.
  (function keepDemoCurrent() {
    if (!KEEP_DEMO_CURRENT) return;
    var shift = Math.max(0, Math.floor((londonDayNum(now()) - dayNum(DEMO_ANCHOR)) / 7) * 7);
    if (!shift) return;
    WORKSHOPS.forEach(function (w) { w.date = isoFromDayNum(dayNum(w.date) + shift); });
  })();
  var WORKSHOP_BY_ID = {};
  WORKSHOPS.forEach(function (w) { WORKSHOP_BY_ID[w.id] = w; });

  /* Free resources. Worksheets, palettes and cheat sheets are generated as SVG files in the
     browser (see resourceFile()); brush packs come with the newsletter. */
  var RESOURCE_TYPES = {
    worksheet: 'Worksheets',
    palette: 'Color palettes',
    cheatsheet: 'Cheat sheets',
    brushes: 'Brush packs'
  };
  var RESOURCES = [
    { id: 'shape-warmups', type: 'worksheet', title: 'Shape warm-ups', blurb: 'Circles, ovals and wobbly boxes to trace and repeat. Five minutes before every drawing.', drill: 'circles' },
    { id: 'line-confidence', type: 'worksheet', title: 'Line confidence drills', blurb: 'Long straight lines, waves and loops. Do one row a day and watch your lines settle.', drill: 'lines' },
    { id: 'face-guides', type: 'worksheet', title: 'Face guide circles', blurb: 'Twelve heads with guide lines, ready for expressions, hair and hats.', drill: 'faces' },
    { id: 'box-it-up', type: 'worksheet', title: 'Box it up', blurb: 'Simple boxes in perspective to turn into packages, houses and cafés.', drill: 'boxes' },
    { id: 'seaside-palette', type: 'palette', title: 'Jersey Shore palette', blurb: 'Six colors from a windy day on the boardwalk: sky, ocean, sand and a bright beach umbrella.', colours: ['#2f5d8a', '#6fb7d6', '#f4e3c1', '#e86f5a', '#ffd166', '#1d1626'] },
    { id: 'cosy-palette', type: 'palette', title: 'Cozy evening palette', blurb: 'Warm lamps, plum shadows and a cup of cocoa. Great for interiors.', colours: ['#3b2a4a', '#7c4a6b', '#d9805f', '#f2b766', '#fde7c4', '#5b8a72'] },
    { id: 'garden-palette', type: 'palette', title: 'Garden party palette', blurb: 'Fresh greens with pops of pink and yellow for plants and flowers.', colours: ['#2f6b4f', '#7cc48a', '#d6efc7', '#ff8fb8', '#ffd84a', '#f7f1e3'] },
    { id: 'expressions', type: 'cheatsheet', title: 'Expressions cheat sheet', blurb: 'Nine moods drawn with just eyes, brows and mouth. Pin it next to your desk.', drill: 'expressions' },
    { id: 'shading-shapes', type: 'cheatsheet', title: 'Shading simple shapes', blurb: 'Where light and shadow fall on a ball, a box and a cylinder, in one page.', drill: 'shading' },
    { id: 'everyday-brushes', type: 'brushes', title: 'Everyday brush set', blurb: 'The nine Procreate brushes I use for nearly everything: pencil, ink, gouache and grain.', app: 'Procreate' },
    { id: 'texture-brushes', type: 'brushes', title: 'Texture stamps', blurb: 'Speckles, paper grain and risograph dots to make flat color feel printed.', app: 'Procreate and Fresco' }
  ];

  /* Student gallery. Artwork is drawn in SVG from `motif` and `palette` (see art()). */
  var GALLERY = [
    { id: 'judgy-cat', title: 'Mister Biscuits, unimpressed', student: 'Hettie M.', course: 'draw-anything', motif: 'cat', palette: 'sunny', note: 'My cat, drawn from three circles. He has not forgiven me.' },
    { id: 'first-mug', title: 'First mug, week two', student: 'Faisal K.', course: 'draw-anything', motif: 'mug', palette: 'candy', note: 'The mug project from module two. I drew it nine times.' },
    { id: 'monstera', title: 'Kitchen windowsill', student: 'Orla D.', course: 'sketchbook-habit', motif: 'plant', palette: 'mint', note: 'Day 9: something that grows.' },
    { id: 'harbour-house', title: 'The house at the end of the harbor', student: 'Zara N.', course: 'cosy-places', motif: 'house', palette: 'sky', note: 'Based on a real cottage. The real one is less pink.' },
    { id: 'yay-letters', title: 'Yay!', student: 'Imogen T.', course: 'loose-lettering', motif: 'lettering', palette: 'peach', word: 'yay!', note: 'Lettered for my sister passing her driver’s test.' },
    { id: 'toadstool', title: 'Toadstool sticker', student: 'Lottie P.', course: 'characters', motif: 'mushroom', palette: 'candy', note: 'One of twelve on my sticker sheet.' },
    { id: 'night-sky', title: 'Can’t sleep, drawing', student: 'Rufus A.', course: 'colour-confidence', motif: 'moon', palette: 'night', note: 'Glow and rim light from module three.' },
    { id: 'wiggle-whale', title: 'Wiggle the whale', student: 'Tilly B.', course: 'wiggle', motif: 'whale', palette: 'sky', note: 'He boils on Instagram. Here he holds still.' },
    { id: 'after-rain', title: 'After the rain', student: 'Wendell O.', course: 'sketchbook-habit', motif: 'rainbow', palette: 'lilac', note: 'Day 22: draw the view from your window.' },
    { id: 'desk-cactus', title: 'Desk cactus named Gary', student: 'Ayo B.', course: 'draw-anything', motif: 'cactus', palette: 'peach', note: 'Shapes first, spikes last.' },
    { id: 'hello-card', title: 'Hello card', student: 'Rosalind F.', course: 'loose-lettering', motif: 'lettering', palette: 'candy', word: 'hello', note: 'Bouncy capitals were the hardest part.' },
    { id: 'mood-cat', title: 'Twelve moods, one cat', student: 'Cosmo R.', course: 'characters', motif: 'cat', palette: 'lilac', note: 'The expressions project, starring my neighbor’s cat.' },
    { id: 'cocoa', title: 'Cocoa o’clock', student: 'Agnes W.', course: 'colour-confidence', motif: 'mug', palette: 'peach', note: 'Warm palette from the color course.' },
    { id: 'dream-cottage', title: 'Dream cottage', student: 'Bertie L.', course: 'cosy-places', motif: 'house', palette: 'sunny', note: 'One day. For now, I draw it.' }
  ];
  var GALLERY_BY_ID = {};
  GALLERY.forEach(function (g) { GALLERY_BY_ID[g.id] = g; });

  // Contact form topics (?topic= on contact.html preselects one).
  var CONTACT_TOPICS = {
    course: 'A question about a course',
    workshop: 'A private workshop for my team or school',
    collab: 'A collaboration or press request',
    other: 'Something else'
  };

  /* ======================================================================
     5. Saved state: saved courses and workshop waitlist requests
     ====================================================================== */
  // Read an array of ids and keep only ids that exist in `lookup` (own keys only), without duplicates.
  function readIds(key, lookup) {
    var raw = readJSON(key, []);
    if (!Array.isArray(raw)) raw = [];
    var out = [];
    raw.forEach(function (id) { if (has(lookup, id) && out.indexOf(id) === -1) out.push(id); });
    return out;
  }
  function savedCourses() { return readIds(STORAGE_KEYS.saved, COURSE_BY_ID); }
  function isSaved(id) { return savedCourses().indexOf(id) !== -1; }
  function toggleSaved(id) {
    var list = savedCourses();
    var i = list.indexOf(id);
    if (i === -1) list.push(id); else list.splice(i, 1);
    writeJSON(STORAGE_KEYS.saved, list);
    return i === -1;
  }
  function waitlisted() { return readIds(STORAGE_KEYS.waitlist, WORKSHOP_BY_ID); }
  function setWaitlisted(id, on) {
    var list = waitlisted().filter(function (x) { return x !== id; });
    if (on) list.push(id);
    writeJSON(STORAGE_KEYS.waitlist, list);
  }

  var toastTimer;
  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 3200);
  }

  // Header heart: number of saved courses.
  function updateSavedCount() {
    var n = savedCourses().length;
    $$('[data-saved-count]').forEach(function (el) { el.textContent = String(n); el.hidden = n === 0; });
    $$('[data-saved-link]').forEach(function (el) {
      el.setAttribute('aria-label', n ? 'Saved courses (' + n + ')' : 'Saved courses (none yet)');
    });
  }

  /* ======================================================================
     6. Artwork: every illustration is drawn from a motif and a palette
     ====================================================================== */
  var S = 'stroke="' + INK + '" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"';
  function sparkle(x, y, s, fill) {
    return '<path d="M' + x + ' ' + (y - s) + 'Q' + x + ' ' + y + ' ' + (x + s) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y + s) + 'Q' + x + ' ' + y + ' ' + (x - s) + ' ' + y + 'Q' + x + ' ' + y + ' ' + x + ' ' + (y - s) + 'Z" fill="' + fill + '" stroke="' + INK + '" stroke-width="2.5" stroke-linejoin="round"/>';
  }
  var MOTIFS = {
    cat: function (p) {
      return '<path d="M142 166c22 2 32-24 16-36" fill="none" ' + S + ' stroke-width="9"/><path d="M142 166c22 2 32-24 16-36" fill="none" stroke="' + p.a + '" stroke-width="3" stroke-linecap="round"/>' +
        '<path d="M58 176c-6-42 12-76 42-76s48 34 42 76Z" fill="' + p.a + '" ' + S + '/>' +
        '<ellipse cx="100" cy="152" rx="18" ry="18" fill="' + p.bg + '" ' + S + ' stroke-width="3"/>' +
        '<path d="M64 96 70 50l24 22h12l24-22 6 46c2 24-16 40-36 40s-38-16-36-40Z" fill="' + p.a + '" ' + S + '/>' +
        '<path d="M74 62l4 14 10-6Z M126 62l-4 14-10-6Z" fill="' + p.c + '"/>' +
        '<path d="M82 96q6-6 12 0M106 96q6-6 12 0" fill="none" ' + S + ' stroke-width="3.5"/>' +
        '<path d="M95 106h10l-5 6Z" fill="' + p.b + '" ' + S + ' stroke-width="2.5"/>' +
        '<path d="M100 112q-4 6-10 4M100 112q4 6 10 4M66 104l-18-4M66 112l-18 4M134 104l18-4M134 112l18 4" fill="none" ' + S + ' stroke-width="2.5"/>';
    },
    plant: function (p) {
      return '<path d="M100 122C96 84 76 66 52 64c4 28 22 48 48 58Z" fill="' + p.c + '" ' + S + '/>' +
        '<path d="M100 122c4-42 28-60 52-60-4 30-26 50-52 60Z" fill="' + p.c + '" ' + S + '/>' +
        '<path d="M100 122c-8-34-2-64 2-90 12 24 12 62-2 90Z" fill="' + p.c + '" ' + S + '/>' +
        '<path d="M100 120C88 100 74 86 62 74M100 120c10-20 24-36 40-46M100 118c0-24 1-50 2-74" fill="none" ' + S + ' stroke-width="2.5"/>' +
        '<path d="M66 132h68l-9 46H75Z" fill="' + p.a + '" ' + S + '/>' +
        '<rect x="58" y="118" width="84" height="18" rx="5" fill="' + p.b + '" ' + S + '/>' +
        '<path d="M86 156h28" ' + S + ' stroke-width="3"/>';
    },
    house: function (p) {
      return '<path d="M134 46c-8-6 4-12-2-20s6-10 4-16" fill="none" ' + S + ' stroke-width="3"/>' +
        '<path d="M124 84V54h16v44" fill="' + p.b + '" ' + S + '/>' +
        '<path d="M54 102h92v74H54Z" fill="' + p.a + '" ' + S + '/>' +
        '<path d="M42 106 100 52l58 54Z" fill="' + p.b + '" ' + S + '/>' +
        '<path d="M88 176v-34a12 12 0 0 1 24 0v34" fill="' + p.c + '" ' + S + '/>' +
        '<rect x="62" y="118" width="20" height="20" rx="3" fill="#fffefa" ' + S + ' stroke-width="3.5"/>' +
        '<rect x="118" y="118" width="20" height="20" rx="3" fill="#fffefa" ' + S + ' stroke-width="3.5"/>' +
        '<path d="M72 118v20M62 128h20M128 118v20M118 128h20" ' + S + ' stroke-width="2"/>' +
        '<path d="M30 178h140" ' + S + '/>';
    },
    mug: function (p) {
      return '<path d="M76 72c-6-8 6-12 0-22M96 68c-6-8 6-12 0-22M116 72c-6-8 6-12 0-22" fill="none" ' + S + ' stroke-width="3.5"/>' +
        '<ellipse cx="96" cy="176" rx="56" ry="9" fill="' + p.b + '" ' + S + '/>' +
        '<path d="M130 102c26-6 30 36 0 38" fill="none" ' + S + ' stroke-width="11"/><path d="M130 102c26-6 30 36 0 38" fill="none" stroke="' + p.a + '" stroke-width="4" stroke-linecap="round"/>' +
        '<path d="M58 86h74v62c0 18-15 28-37 28s-37-10-37-28Z" fill="' + p.a + '" ' + S + '/>' +
        '<ellipse cx="95" cy="86" rx="37" ry="7" fill="#7a4a2e" ' + S + ' stroke-width="3.5"/>' +
        '<path d="M95 142c-12-9-18-17-9-24 5-4 9-1 9 3 0-4 4-7 9-3 9 7 3 15-9 24Z" fill="' + p.c + '" ' + S + ' stroke-width="3"/>';
    },
    mushroom: function (p) {
      return '<path d="M30 178c30-8 110-8 140 0" fill="none" ' + S + '/>' +
        '<path d="M84 122c-4 24-6 38-2 56h36c4-18 2-32-2-56Z" fill="#fffefa" ' + S + '/>' +
        '<path d="M38 126c0-42 28-70 62-70s62 28 62 70c-22 7-102 7-124 0Z" fill="' + p.a + '" ' + S + '/>' +
        '<circle cx="74" cy="94" r="10" fill="#fffefa" ' + S + ' stroke-width="3"/><circle cx="112" cy="80" r="7" fill="#fffefa" ' + S + ' stroke-width="3"/>' +
        '<circle cx="134" cy="106" r="8" fill="#fffefa" ' + S + ' stroke-width="3"/><circle cx="96" cy="112" r="6" fill="#fffefa" ' + S + ' stroke-width="3"/>' +
        '<path d="M92 146q4 4 8 0M106 146q4 4 8 0" fill="none" ' + S + ' stroke-width="3"/>' +
        '<circle cx="88" cy="156" r="4" fill="' + p.b + '"/><circle cx="118" cy="156" r="4" fill="' + p.b + '"/>';
    },
    whale: function (p) {
      return '<path d="M88 58c0-14-10-20-18-22M88 58c0-14 10-20 18-22M88 58V38" fill="none" ' + S + ' stroke-width="3.5"/>' +
        '<path d="M150 118c12-4 20-18 22-32 6 16 2 26-6 32 10 2 16 10 18 18-14-2-24-6-30-12Z" fill="' + p.a + '" ' + S + '/>' +
        '<path d="M28 124c0-36 32-56 66-56 40 0 64 24 64 52 0 30-26 48-66 48-38 0-64-14-64-44Z" fill="' + p.a + '" ' + S + '/>' +
        '<path d="M36 142c22 18 84 22 116 0" fill="none" ' + S + ' stroke-width="3"/>' +
        '<path d="M56 152l4-8M72 158l2-9M90 160v-9M108 159l-1-9M126 156l-3-8" ' + S + ' stroke-width="2.5"/>' +
        '<circle cx="64" cy="112" r="4.5" fill="' + INK + '"/><circle cx="58" cy="126" r="7" fill="' + p.c + '" opacity=".8"/>' +
        '<path d="M2 186c16-8 30-8 46 0s30 8 46 0 30-8 46 0 30 8 58-2" fill="none" ' + S + ' stroke-width="3"/>';
    },
    lettering: function (p, art) {
      var word = (art && art.word) || 'draw';
      return '<path d="M38 140c40 12 84 12 126-4" fill="none" ' + S + ' stroke-width="5"/><path d="M38 140c40 12 84 12 126-4" fill="none" stroke="' + p.b + '" stroke-width="2" stroke-linecap="round"/>' +
        '<text x="100" y="118" text-anchor="middle" font-family="Lilita One, Arial Rounded MT Bold, sans-serif" font-size="' + (word.length > 4 ? 50 : 58) + '" fill="' + p.a + '" stroke="' + INK + '" stroke-width="4" paint-order="stroke" stroke-linejoin="round" transform="rotate(-6 100 100)">' + esc(word) + '</text>' +
        sparkle(44, 58, 12, p.c) + sparkle(160, 164, 9, p.b);
    },
    rainbow: function (p) {
      return '<path d="M38 150a62 62 0 0 1 124 0" fill="none" stroke="' + INK + '" stroke-width="20"/><path d="M38 150a62 62 0 0 1 124 0" fill="none" stroke="' + p.a + '" stroke-width="13"/>' +
        '<path d="M54 150a46 46 0 0 1 92 0" fill="none" stroke="' + INK + '" stroke-width="20"/><path d="M54 150a46 46 0 0 1 92 0" fill="none" stroke="' + p.b + '" stroke-width="13"/>' +
        '<path d="M70 150a30 30 0 0 1 60 0" fill="none" stroke="' + INK + '" stroke-width="20"/><path d="M70 150a30 30 0 0 1 60 0" fill="none" stroke="' + p.c + '" stroke-width="13"/>' +
        '<path d="M18 160c0-12 12-18 20-12 4-12 24-12 28 2 12-2 18 8 14 16H22c-3 0-4-2-4-6Z" fill="#fffefa" ' + S + '/>' +
        '<path d="M120 160c0-12 12-18 20-12 4-12 24-12 28 2 12-2 18 8 14 16h-58c-3 0-4-2-4-6Z" fill="#fffefa" ' + S + '/>';
    },
    moon: function (p) {
      return '<path d="M114 44a58 58 0 1 0 44 96 48 48 0 1 1-44-96Z" fill="' + p.a + '" ' + S + '/>' +
        '<path d="M82 112q5-5 10 0M70 128q8 8 16 0" fill="none" ' + S + ' stroke-width="3"/><circle cx="66" cy="114" r="6" fill="' + p.c + '" opacity=".7"/>' +
        sparkle(150, 52, 11, p.b) + sparkle(168, 104, 7, p.b) + sparkle(38, 46, 8, p.b) + sparkle(140, 164, 6, p.b);
    },
    cactus: function (p) {
      return '<path d="M86 102H72a8 8 0 0 1-8-8V80M114 92h12a8 8 0 0 0 8-8V70" fill="none" stroke="' + INK + '" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M86 102H72a8 8 0 0 1-8-8V80M114 92h12a8 8 0 0 0 8-8V70" fill="none" stroke="' + p.c + '" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>' +
        '<path d="M86 132V66c0-10 6-16 14-16s14 6 14 16v66" fill="' + p.c + '" ' + S + '/>' +
        '<path d="M100 64v58M93 76l-6-2M107 92l6-2M93 104l-6-2" ' + S + ' stroke-width="2.5"/>' +
        '<circle cx="100" cy="46" r="8" fill="' + p.b + '" ' + S + ' stroke-width="3"/>' +
        '<path d="M66 132h68l-9 46H75Z" fill="' + p.a + '" ' + S + '/><rect x="60" y="122" width="80" height="16" rx="5" fill="' + p.a + '" ' + S + '/>';
    }
  };
  // A whole artwork as an SVG string. `opts.label` makes it an image with that accessible name.
  function art(motif, paletteKey, opts) {
    opts = opts || {};
    var p = has(PALETTES, paletteKey) ? PALETTES[paletteKey] : PALETTES.sunny;
    var draw = has(MOTIFS, motif) ? MOTIFS[motif] : MOTIFS.mug;
    var seed = 0; String(motif + paletteKey).split('').forEach(function (ch) { seed = (seed * 31 + ch.charCodeAt(0)) % 997; });
    var sx = 26 + seed % 20, sy = 30 + seed % 24;
    var a11y = opts.label ? 'role="img" aria-label="' + esc(opts.label) + '"' : 'aria-hidden="true" focusable="false"';
    return '<svg viewBox="0 0 200 200" class="' + (opts.cls || 'block h-full w-full') + '" ' + a11y + '>' +
      '<rect width="200" height="200" fill="' + p.bg + '"/>' +
      '<g fill="' + (paletteKey === 'night' ? '#fffefa' : INK) + '" opacity=".12">' + [0, 1, 2, 3, 4, 5, 6, 7, 8].map(function (i) { return '<circle cx="' + (12 + i * 22) + '" cy="' + (14 + (i % 3) * 7) + '" r="1.6"/>'; }).join('') + '</g>' +
      (motif === 'moon' || motif === 'lettering' ? '' : sparkle(200 - sx, sy, 7, '#fffefa')) +
      draw(p, opts.art) + '</svg>';
  }

  /* ======================================================================
     7. Course math and pricing
     ====================================================================== */
  function courseStats(c) {
    var lessons = 0, mins = 0, projects = 0;
    c.modules.forEach(function (m) {
      m[1].forEach(function (l) { lessons += 1; mins += l[1]; if (l[2] === 'project') projects += 1; });
    });
    return { modules: c.modules.length, lessons: lessons, mins: mins, projects: projects };
  }
  // Early-bird state for a course right now: null when the course has none.
  function earlyBird(c, at) {
    if (!c.earlyBird) return null;
    at = at || now();
    var ends = c.earlyBird.ends ? zonedDate(c.earlyBird.ends) : rollingDeadline(at);
    if (!ends) return null;
    var left = ends.getTime() - at.getTime();
    return { active: left > 0, ends: ends, left: Math.max(0, left), price: c.earlyBird.price, saving: c.price - c.earlyBird.price };
  }
  function currentPrice(c) {
    var eb = earlyBird(c);
    return eb && eb.active ? eb.price : c.price;
  }
  function priceLabel(n) { return n === 0 ? 'Free' : money(n); }
  function splitTime(ms) {
    var s = Math.floor(ms / 1000);
    return { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
  }
  function leftLabel(ms) {
    var t = splitTime(ms);
    if (t.d >= 1) return plural(t.d, 'day');
    if (t.h >= 1) return plural(t.h, 'hour');
    return plural(Math.max(1, t.m), 'minute');
  }

  function saveButton(c, extra) {
    var on = isSaved(c.id);
    return '<button type="button" class="relative z-10 grid size-11 shrink-0 place-items-center rounded-full border-2 border-ink bg-white text-ink transition hover:bg-pink-soft aria-pressed:bg-pink ' + (extra || '') + '" data-save="' + esc(c.id) + '" aria-pressed="' + on + '" aria-label="Save ' + esc(c.title) + '">' +
      '<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" aria-hidden="true"><path class="heart" d="M12 20s-7.5-4.6-9.2-9.4C1.6 7.2 3.9 4 7.2 4c2 0 3.6 1.1 4.8 2.8C13.2 5.1 14.8 4 16.8 4c3.3 0 5.6 3.2 4.4 6.6C19.5 15.4 12 20 12 20Z"/></svg></button>';
  }
  function syncSaveButtons() {
    var list = savedCourses();
    $$('[data-save]').forEach(function (b) {
      var on = list.indexOf(b.getAttribute('data-save')) !== -1;
      b.setAttribute('aria-pressed', String(on));
      var heart = $('.heart', b);
      if (heart) heart.setAttribute('fill', on ? 'currentColor' : 'none');
      var label = $('[data-save-label]', b);
      if (label) label.textContent = on ? 'Saved' : 'Save for later';
      // The name starts with the visible text, then says which course.
      var name = b.getAttribute('data-save-name');
      if (label && name) b.setAttribute('aria-label', label.textContent + ': ' + name);
    });
    updateSavedCount();
  }
  document.addEventListener('click', function (e) {
    var btn = e.target.closest ? e.target.closest('[data-save]') : null;
    if (!btn) return;
    var id = btn.getAttribute('data-save');
    if (!has(COURSE_BY_ID, id)) return;
    var on = toggleSaved(id);
    syncSaveButtons();
    toast(on ? 'Saved “' + COURSE_BY_ID[id].title + '” for later' : 'Removed “' + COURSE_BY_ID[id].title + '” from your saved courses');
    document.dispatchEvent(new CustomEvent('sketch:saved'));
  });
  window.addEventListener('storage', function (e) {
    if (e.key === STORAGE_KEYS.saved) { syncSaveButtons(); document.dispatchEvent(new CustomEvent('sketch:saved')); }
  });

  var TILTS = ['tilt-l', 'tilt-r', 'tilt-r2', 'tilt-l2'];
  function courseCard(c, i) {
    var st = courseStats(c);
    var eb = earlyBird(c);
    var price = currentPrice(c);
    var lvl = LEVELS[c.level];
    return '<article class="card lift ' + TILTS[i % TILTS.length] + ' flex flex-col overflow-hidden" data-course-card="' + esc(c.id) + '">' +
      '<div class="relative aspect-[16/10] overflow-hidden border-b-[2.5px] border-ink" style="background:' + COLOURS[c.colour].soft + '">' + art(c.motif, c.palette, { cls: 'absolute inset-0 m-auto h-full w-auto' }) +
      (c.badge ? '<span class="sticker absolute top-3 left-3 -rotate-6 ' + (c.badge === 'Free' ? 'bg-green' : c.badge === 'New' ? 'bg-blue' : 'bg-yellow') + '">' + esc(c.badge) + '</span>' : '') +
      (eb && eb.active ? '<span class="sticker absolute right-3 bottom-3 rotate-3 bg-pink">Early bird: ' + leftLabel(eb.left) + ' left</span>' : '') + '</div>' +
      '<div class="flex flex-1 flex-col p-5">' +
      '<p class="flex flex-wrap gap-2"><span class="tag ' + lvl.bg + '">' + lvl.name + '</span><span class="tag bg-white">' + esc(TOPICS[c.topic]) + '</span></p>' +
      '<h3 class="mt-3 font-display text-2xl leading-tight"><a href="course.html?id=' + encodeURIComponent(c.id) + '" class="after:absolute after:inset-0 after:content-[\'\'] hover:underline focus-visible:outline-none">' + esc(c.title) + '</a></h3>' +
      '<p class="mt-2 text-[0.95rem] muted">' + esc(c.tagline) + '</p>' +
      '<p class="mt-3 text-sm font-semibold">' + plural(st.lessons, 'lesson') + ' · ' + runtime(st.mins) + ' · ' + plural(st.projects, 'project') + '</p>' +
      '<div class="mt-auto flex items-end justify-between gap-3 pt-5">' +
      '<p class="leading-none"><span class="font-display text-3xl">' + priceLabel(price) + '</span>' + (price !== c.price ? ' <s class="ml-1 text-base font-semibold muted">' + money(c.price) + '</s>' : '') + '</p>' +
      saveButton(c) + '</div></div></article>';
  }

  /* ======================================================================
     8. Shared UI: header, menu, reveals, back to top, toast
     ====================================================================== */
  function initHeader() {
    var header = $('#site-header');
    if (header) {
      var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
    }
    var btn = $('#menu-button'), menu = $('#mobile-menu');
    if (!btn || !menu) return;
    function setOpen(open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
      $('[data-icon-open]', btn).classList.toggle('hidden', open);
      $('[data-icon-close]', btn).classList.toggle('hidden', !open);
    }
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024) setOpen(false); });
  }

  function initReveal() {
    var els = $$('.reveal');
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('is-visible'); }); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        // Reveal this element and everything above it, so fast jumps never leave gaps.
        var top = entry.target.getBoundingClientRect().top;
        els.forEach(function (el) {
          if (!el.classList.contains('is-visible') && el.getBoundingClientRect().top <= top + 1) { el.classList.add('is-visible'); io.unobserve(el); }
        });
      });
    }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  function initBackToTop() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    btn.tabIndex = -1;
    document.body.appendChild(btn);
    function onScroll() {
      var show = window.scrollY > 700;
      btn.classList.toggle('is-visible', show);
      btn.tabIndex = show ? 0 : -1;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var skip = $('#main');
      if (skip) { skip.setAttribute('tabindex', '-1'); skip.focus({ preventScroll: true }); }
    });
  }

  /* ======================================================================
     9. Forms (demo: nothing is sent; see DOCS.md "Forms")
     ====================================================================== */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function setError(input, msg) {
    var id = input.id + '-error';
    var el = document.getElementById(id);
    if (msg) {
      if (!el) {
        el = document.createElement('p');
        el.id = id;
        el.className = 'field-error';
        (input.closest('[data-field]') || input.parentNode).appendChild(el);
      }
      el.textContent = msg;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', id);
    } else {
      if (el) el.remove();
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
  }
  // Rules are read from attributes: required, type="email", data-minlength.
  function validate(form) {
    var first = null;
    $$('input, select, textarea', form).forEach(function (input) {
      if (input.type === 'hidden' || input.type === 'checkbox' || input.disabled) return;
      var v = (input.value || '').trim();
      var label = input.getAttribute('data-name') || 'This field';
      var msg = '';
      if (input.required && !v) msg = input.tagName === 'SELECT' ? 'Please choose an option.' : label + ' is required.';
      else if (v && input.type === 'email' && !EMAIL_RE.test(v)) msg = 'Please enter a valid email address, like you@example.com.';
      else if (v && input.getAttribute('data-minlength') && v.length < +input.getAttribute('data-minlength')) msg = label + ' needs at least ' + input.getAttribute('data-minlength') + ' characters.';
      setError(input, msg);
      if (msg && !first) first = input;
    });
    if (first) first.focus();
    return !first;
  }
  function liveRevalidate(form) {
    form.addEventListener('input', function (e) {
      if (e.target.getAttribute('aria-invalid') === 'true') {
        var v = e.target.value.trim();
        if (v && (e.target.type !== 'email' || EMAIL_RE.test(v))) setError(e.target, '');
      }
    });
  }

  // A short reference, like MD-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  function initForms() {
    // Newsletter sign-ups (home, newsletter page, footer).
    $$('[data-newsletter-form]').forEach(function (form) {
      liveRevalidate(form);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(form)) return;
        // Connect here: fetch(form.action, { method: 'POST', body: new FormData(form) }) to your email provider.
        var done = form.parentNode.querySelector('[data-form-success]');
        form.hidden = true;
        if (done) { done.hidden = false; done.focus(); }
      });
    });

    // Contact form, with ?topic= preselecting the subject.
    var contact = $('[data-contact-form]');
    if (contact) {
      var select = $('#contact-topic', contact);
      var t = param('topic');
      if (select && has(CONTACT_TOPICS, t)) select.value = t;
      liveRevalidate(contact);
      contact.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(contact)) return;
        // Connect here: fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(contact), headers: { Accept: 'application/json' } })
        var name = ($('#contact-name', contact).value || '').trim().split(/\s+/)[0];
        var done = $('[data-form-success]');
        $('[data-success-name]', done).textContent = name ? ', ' + name : '';
        $('[data-success-ref]', done).textContent = makeRef('MD');
        contact.hidden = true;
        done.hidden = false;
        done.focus();
      });
    }
  }

  /* Signup dialog: enrolling in a course, booking a workshop seat, joining a waitlist. */
  var signup = { dialog: null, opener: null, mode: '', id: '' };
  function openSignup(mode, id, opener) {
    var d = $('#signup-dialog');
    if (!d) return;
    signup = { dialog: d, opener: opener, mode: mode, id: id };
    var title = '', detail = '', button = '';
    if (mode === 'enrol') {
      var c = COURSE_BY_ID[id];
      var price = currentPrice(c);
      title = c.price === 0 ? 'Start ' + c.title : 'Enroll in ' + c.title;
      detail = c.price === 0 ? 'Free, forever. Lessons open as soon as you sign up.' : priceLabel(price) + (price !== c.price ? ' early-bird price (usually ' + money(c.price) + ')' : '') + ', lifetime access.';
      button = c.price === 0 ? 'Start for free' : 'Continue to payment';
    } else {
      var w = WORKSHOP_BY_ID[id];
      var info = workshopTimes(w);
      title = (mode === 'waitlist' ? 'Join the waitlist: ' : 'Book a seat: ') + w.title;
      detail = info.day + ', ' + info.range + (mode === 'waitlist' ? '. We will email you if a seat opens up.' : '. ' + (w.price ? money(w.price) + ' per seat, replay included.' : 'Free, replay included.'));
      button = mode === 'waitlist' ? 'Join the waitlist' : (w.price ? 'Book my seat' : 'Save my free seat');
    }
    $('#signup-title').textContent = title;
    $('#signup-detail').textContent = detail;
    $('[data-signup-submit]').textContent = button;
    var form = $('[data-signup-form]', d);
    form.hidden = false;
    form.reset();
    $$('input', form).forEach(function (i) { setError(i, ''); });
    $('[data-signup-done]', d).hidden = true;
    if (typeof d.showModal === 'function') d.showModal(); else d.setAttribute('open', '');
    var first = $('input', form);
    if (first) first.focus();
  }
  function closeSignup() {
    var d = signup.dialog;
    if (!d) return;
    if (typeof d.close === 'function') d.close(); else d.removeAttribute('open');
  }
  function initSignupDialog() {
    var d = $('#signup-dialog');
    if (!d) return;
    var form = $('[data-signup-form]', d);
    liveRevalidate(form);
    $$('[data-signup-close]', d).forEach(function (b) { b.addEventListener('click', closeSignup); });
    d.addEventListener('click', function (e) { if (e.target === d) closeSignup(); });
    d.addEventListener('close', function () { if (signup.opener && document.contains(signup.opener)) signup.opener.focus(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      // Connect here: send new FormData(form) to your course platform, booking tool or email list.
      var msg = '';
      var ref = makeRef('MD');
      if (signup.mode === 'waitlist') {
        setWaitlisted(signup.id, true);
        msg = 'You’re on the waitlist, reference ' + ref + '. I’ll email you if a seat opens up.';
        renderWorkshops();
      } else if (signup.mode === 'book') {
        msg = WORKSHOP_BY_ID[signup.id].price
          ? 'Your seat is booked, reference ' + ref + '. Look out for a confirmation email with your invoice and the joining link; the replay follows after the session.'
          : 'Your free seat is saved, reference ' + ref + '. Look out for a confirmation email with the joining link; the replay follows after the session.';
      } else {
        msg = COURSE_BY_ID[signup.id].price === 0
          ? 'You’re in, reference ' + ref + '. Look out for your welcome email with your course login; the lessons open right away.'
          : 'Your spot is saved, reference ' + ref + '. Look out for an email with a secure link to pay; your lessons open as soon as that’s done.';
      }
      form.hidden = true;
      var done = $('[data-signup-done]', d);
      $('[data-signup-message]', done).textContent = msg;
      done.hidden = false;
      done.focus();
    });
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-enrol],[data-book],[data-waitlist]') : null;
      if (!b) return;
      if (b.hasAttribute('data-enrol') && has(COURSE_BY_ID, b.getAttribute('data-enrol'))) openSignup('enrol', b.getAttribute('data-enrol'), b);
      if (b.hasAttribute('data-book') && has(WORKSHOP_BY_ID, b.getAttribute('data-book'))) openSignup('book', b.getAttribute('data-book'), b);
      if (b.hasAttribute('data-waitlist') && has(WORKSHOP_BY_ID, b.getAttribute('data-waitlist'))) openSignup('waitlist', b.getAttribute('data-waitlist'), b);
    });
  }

  /* ======================================================================
     10. Countdown (early-bird deadline)
     ====================================================================== */
  var countdowns = [];
  function tickCountdowns() {
    countdowns = countdowns.filter(function (cd) { return cd(); });
    if (!countdowns.length) clearInterval(tickTimer);
  }
  var tickTimer = null;
  function addCountdown(fn) {
    if (!fn()) return;
    countdowns.push(fn);
    if (!tickTimer) tickTimer = setInterval(tickCountdowns, 1000);
  }
  function pad(n) { return String(n).padStart(2, '0'); }

  // Fills [data-unit] boxes inside `box`; calls onExpire once the deadline passes.
  function startCountdown(box, c, onExpire) {
    addCountdown(function () {
      var eb = earlyBird(c);
      if (!eb || !eb.active) { onExpire(); return false; }
      var t = splitTime(eb.left);
      $$('[data-unit]', box).forEach(function (el) { el.textContent = pad(t[el.getAttribute('data-unit')]); });
      var label = $('[data-countdown-label]', box);
      if (label) label.textContent = 'Early-bird price ends in ' + plural(t.d, 'day') + ', ' + plural(t.h, 'hour') + ' and ' + plural(t.m, 'minute') + '.';
      return true;
    });
  }

  function renderPriceBox(box, c) {
    var eb = earlyBird(c);
    var price = currentPrice(c);
    var parts = [];
    parts.push('<p class="flex flex-wrap items-end gap-x-3 gap-y-1"><span class="font-display text-6xl leading-none">' + priceLabel(price) + '</span>' +
      (price !== c.price ? '<s class="pb-1 text-xl font-semibold muted">' + money(c.price) + '</s><span class="sticker mb-1 -rotate-3 bg-pink">Save ' + money(eb.saving) + '</span>' : '') + '</p>');
    if (eb && eb.active) {
      parts.push('<p class="mt-3 text-sm font-semibold">Early-bird price until ' + esc(longDate(eb.ends)) + ' at ' + clock(eb.ends) + ' (Eastern time).</p>' +
        '<div class="mt-4" data-countdown role="timer"><p class="sr-only" data-countdown-label></p><ol class="grid grid-cols-4 gap-2 text-center" aria-hidden="true">' +
        [['d', 'days'], ['h', 'hrs'], ['m', 'mins'], ['s', 'secs']].map(function (u, i) {
          return '<li class="rounded-xl border-2 border-ink ' + ['bg-yellow', 'bg-pink-soft', 'bg-blue-soft', 'bg-green-soft'][i] + ' py-2"><span class="block font-display text-2xl leading-none tabular-nums" data-unit="' + u[0] + '">00</span><span class="text-xs font-bold">' + u[1] + '</span></li>';
        }).join('') + '</ol></div>');
    } else if (eb) {
      parts.push('<p class="mt-3 rounded-xl border-2 border-dashed border-ink bg-paper-2 px-3 py-2 text-sm font-semibold" data-early-ended>The early-bird price ended on ' + esc(longDate(eb.ends)) + '. Join the newsletter to hear about the next one.</p>');
    } else if (c.price === 0) {
      parts.push('<p class="mt-3 text-sm font-semibold">Free forever. No card needed.</p>');
    } else {
      parts.push('<p class="mt-3 text-sm font-semibold">One payment, lifetime access, every future update.</p>');
    }
    box.innerHTML = parts.join('');
    var cd = $('[data-countdown]', box);
    if (cd) startCountdown(cd, c, function () { renderPriceBox(box, c); });
  }

  /* ======================================================================
     11. Pages
     ====================================================================== */
  var page = document.body.getAttribute('data-page') || '';

  /* ----- Home ----- */
  function initHome() {
    var flag = COURSE_BY_ID[FLAGSHIP];
    $$('[data-flagship-stats]').forEach(function (el) {
      var st = courseStats(flag);
      el.textContent = plural(st.modules, 'module') + ' · ' + plural(st.lessons, 'lesson') + ' · ' + runtime(st.mins) + ' of video';
    });
    $$('[data-flagship-price]').forEach(function (box) { renderPriceBox(box, flag); });
    // Early-bird ribbon in the hero: hidden once the offer has ended.
    var ribbon = $('[data-early-ribbon]');
    if (ribbon) {
      var update = function () {
        var eb = earlyBird(flag);
        if (!eb || !eb.active) { ribbon.hidden = true; return false; }
        ribbon.hidden = false;
        $('[data-early-left]', ribbon).textContent = leftLabel(eb.left);
        $('[data-early-price]', ribbon).textContent = money(eb.price);
        return true;
      };
      addCountdown(update);
    }
    var wall = $('[data-work-wall]');
    if (wall) wall.innerHTML = GALLERY.slice(0, 6).map(function (g, i) { return wallItem(g, i); }).join('');
    var strip = $('[data-course-strip]');
    if (strip) {
      strip.innerHTML = COURSES.filter(function (c) { return c.id !== FLAGSHIP; }).slice(0, 3).map(courseCard).join('');
    }
    renderNextWorkshop();
  }
  function wallItem(g, i) {
    return '<li class="' + TILTS[(i + 1) % TILTS.length] + '"><a href="gallery.html?art=' + encodeURIComponent(g.id) + '" class="card lift block overflow-hidden p-2.5 pb-3">' +
      '<span class="block aspect-square overflow-hidden rounded-xl border-2 border-ink">' + art(g.motif, g.palette, { art: g }) + '</span>' +
      '<span class="mt-2 block px-1 text-sm font-bold leading-tight">' + esc(g.title) + '</span><span class="block px-1 hand text-lg leading-tight text-pink-ink">by ' + esc(g.student) + '</span></a></li>';
  }

  /* ----- Courses catalog ----- */
  function initCourses() {
    var grid = $('[data-course-grid]');
    if (!grid) return;
    var state = { level: '', topic: '', saved: false };
    var lv = param('level'), tp = param('topic');
    if (has(LEVELS, lv)) state.level = lv;
    if (has(TOPICS, tp)) state.topic = tp;
    if (param('saved') === '1') state.saved = true;

    function chip(group, value, label, count) {
      var on = state[group] === value;
      return '<button type="button" class="chip" data-filter="' + group + '" data-value="' + value + '" aria-pressed="' + on + '">' + esc(label) + (count != null ? ' <span class="count">' + count + '</span>' : '') + '</button>';
    }
    function renderFilters() {
      $('[data-level-filters]').innerHTML = chip('level', '', 'All levels') + Object.keys(LEVELS).map(function (k) {
        return chip('level', k, LEVELS[k].name, COURSES.filter(function (c) { return c.level === k; }).length);
      }).join('');
      $('[data-topic-filters]').innerHTML = chip('topic', '', 'All topics') + Object.keys(TOPICS).map(function (k) {
        return chip('topic', k, TOPICS[k], COURSES.filter(function (c) { return c.topic === k; }).length);
      }).join('');
      var savedBtn = $('[data-saved-toggle]');
      var n = savedCourses().length;
      savedBtn.setAttribute('aria-pressed', String(state.saved));
      $('[data-saved-toggle-count]').textContent = String(n);
    }
    function render() {
      var saved = savedCourses();
      var list = COURSES.filter(function (c) {
        return (!state.level || c.level === state.level) && (!state.topic || c.topic === state.topic) && (!state.saved || saved.indexOf(c.id) !== -1);
      });
      grid.innerHTML = list.map(courseCard).join('');
      syncSaveButtons();
      $('[data-course-count]').textContent = 'Showing ' + plural(list.length, 'course') + (state.saved ? ' you saved' : '');
      var empty = $('[data-course-empty]');
      empty.hidden = list.length > 0;
      $('[data-empty-text]').textContent = state.saved && !saved.length
        ? 'You have not saved any courses yet. Tap the heart on a course to keep it here.'
        : 'No course matches those filters yet. Try another level or topic.';
      renderFilters();
      setParams({ level: state.level, topic: state.topic, saved: state.saved ? '1' : '' });
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-filter]') : null;
      if (b) {
        var g = b.getAttribute('data-filter'), v = b.getAttribute('data-value');
        if (g === 'level' && (v === '' || has(LEVELS, v))) state.level = v;
        if (g === 'topic' && (v === '' || has(TOPICS, v))) state.topic = v;
        render();
        var again = $('[data-filter="' + g + '"][data-value="' + v + '"]');
        if (again) again.focus();
        return;
      }
      if (e.target.closest && e.target.closest('[data-saved-toggle]')) { state.saved = !state.saved; render(); $('[data-saved-toggle]').focus(); }
      if (e.target.closest && e.target.closest('[data-reset-filters]')) { state = { level: '', topic: '', saved: false }; render(); }
    });
    document.addEventListener('sketch:saved', function () { if (state.saved) render(); else renderFilters(); });
    render();
  }

  /* ----- Course sales page ----- */
  function initCourse() {
    var main = $('[data-course-main]');
    if (!main) return;
    var id = param('id');
    if (id === null || id === '') id = FLAGSHIP;
    if (!has(COURSE_BY_ID, id)) {
      main.innerHTML = '<section class="wrap py-24 text-center"><p class="eyebrow">whoops</p><h1 class="mt-3 font-display text-5xl">That course has wandered off</h1>' +
        '<p class="mx-auto mt-4 max-w-md text-lg muted">The link might be old or mistyped. Every course I teach is on the courses page.</p>' +
        '<p class="mt-8"><a href="courses.html" class="btn btn-yellow btn-lg">See all courses</a></p></section>';
      document.title = 'Course not found — ' + SITE_NAME;
      return;
    }
    var c = COURSE_BY_ID[id];
    var st = courseStats(c);
    var lvl = LEVELS[c.level];
    document.title = c.title + ' — ' + SITE_NAME;
    var meta = $('meta[name="description"]');
    if (meta) meta.setAttribute('content', c.tagline);

    $('[data-c-title]').textContent = c.title;
    $('[data-c-tagline]').textContent = c.tagline;
    $('[data-c-summary]').textContent = c.summary;
    $('[data-c-tags]').innerHTML = '<span class="tag ' + lvl.bg + '">' + lvl.name + '</span><span class="tag bg-white">' + esc(TOPICS[c.topic]) + '</span>' + (c.badge ? '<span class="tag bg-yellow">' + esc(c.badge) + '</span>' : '');
    $('[data-c-rating]').textContent = c.rating.toFixed(1) + ' from ' + fmtNumber(c.reviews) + ' reviews · ' + fmtNumber(c.students) + ' students';
    $('[data-c-art]').innerHTML = art(c.motif, c.palette, { label: 'Illustration for ' + c.title });
    $('[data-c-stats]').innerHTML = [
      [plural(st.modules, 'module'), 'bg-yellow'], [plural(st.lessons, 'lesson'), 'bg-pink-soft'], [runtime(st.mins) + ' of video', 'bg-blue-soft'], [plural(st.projects, 'project'), 'bg-green-soft'], [c.app, 'bg-white']
    ].map(function (s, i) { return '<li class="sticker ' + s[1] + ' ' + (i % 2 ? 'rotate-2' : '-rotate-2') + '">' + esc(s[0]) + '</li>'; }).join('');

    // What you'll make.
    $('[data-c-makes]').innerHTML = c.makes.map(function (m, i) {
      return '<li class="card lift ' + TILTS[i % TILTS.length] + ' overflow-hidden p-3"><span class="block aspect-square overflow-hidden rounded-xl border-2 border-ink">' + art(m[1], c.palette, { art: { word: 'hi!' } }) + '</span>' +
        '<span class="mt-3 flex items-start gap-2 px-1 pb-1 font-bold leading-snug"><span class="grid size-7 shrink-0 place-items-center rounded-full border-2 border-ink bg-yellow font-display text-sm">' + (i + 1) + '</span>' + esc(m[0]) + '</span></li>';
    }).join('');

    // Curriculum accordion.
    $('[data-c-curriculum-summary]').textContent = plural(st.modules, 'module') + ' · ' + plural(st.lessons, 'lesson') + ' · ' + runtime(st.mins) + ' total runtime';
    var n = 0;
    $('[data-c-curriculum]').innerHTML = c.modules.map(function (m, i) {
      var mins = m[1].reduce(function (s, l) { return s + l[1]; }, 0);
      return '<details class="acc card overflow-hidden"' + (i === 0 ? ' open' : '') + '><summary>' +
        '<span class="grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink font-display text-lg ' + ['bg-yellow', 'bg-pink', 'bg-blue', 'bg-green', 'bg-orange'][i % 5] + '">' + (i + 1) + '</span>' +
        '<span class="min-w-0 flex-1"><span class="block font-display text-xl leading-tight sm:text-2xl">' + esc(m[0]) + '</span><span class="block text-sm font-semibold muted">' + plural(m[1].length, 'lesson') + ' · ' + runtime(mins) + '</span></span>' +
        '<svg class="acc-icon size-6 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></summary>' +
        '<ol class="border-t-2 border-dashed border-ink/40 px-5 py-3 sm:px-6">' + m[1].map(function (l) {
          n += 1;
          return '<li class="flex items-center gap-3 py-2.5"><span class="w-7 shrink-0 text-sm font-bold muted tabular-nums">' + pad(n) + '</span><span class="min-w-0 flex-1 font-semibold">' + esc(l[0]) +
            (l[2] === 'project' ? ' <span class="tag ml-1 bg-green-soft">Project</span>' : '') + '</span><span class="shrink-0 text-sm font-semibold tabular-nums muted">' + l[1] + ' min</span></li>';
        }).join('') + '</ol></details>';
    }).join('');
    var expand = $('[data-expand-all]');
    if (expand) {
      expand.addEventListener('click', function () {
        var all = $$('[data-c-curriculum] details');
        var open = all.some(function (d) { return !d.open; });
        all.forEach(function (d) { d.open = open; });
        expand.textContent = open ? 'Collapse all' : 'Expand all';
      });
    }

    // Reviews.
    var reviews = REVIEWS.filter(function (r) { return r.course === c.id; });
    $('[data-c-reviews]').innerHTML = reviews.map(function (r, i) {
      return '<figure class="note ' + ['bg-yellow-soft', 'bg-pink-soft', 'bg-blue-soft'][i % 3] + ' ' + TILTS[i % TILTS.length] + '"><blockquote class="text-[1.05rem] leading-relaxed">“' + esc(r.text) + '”</blockquote>' +
        '<figcaption class="mt-3 hand text-xl">' + esc(r.name) + ', ' + esc(r.where) + '</figcaption></figure>';
    }).join('');

    // Pricing card.
    $$('[data-c-price]').forEach(function (box) { renderPriceBox(box, c); });
    $$('[data-c-enrol]').forEach(function (b) {
      b.setAttribute('data-enrol', c.id);
      b.textContent = c.price === 0 ? 'Start for free' : 'Enroll now';
    });
    var save = $('[data-c-save]');
    if (save) {
      save.setAttribute('data-save', c.id);
      save.setAttribute('data-save-name', c.title);
      var saveLabel = $('[data-save-label]', save);
      save.setAttribute('aria-label', (saveLabel ? saveLabel.textContent : 'Save for later') + ': ' + c.title);
    }
    $$('[data-c-name]').forEach(function (el) { el.textContent = c.title; });

    // More courses.
    var more = $('[data-c-more]');
    if (more) more.innerHTML = COURSES.filter(function (x) { return x.id !== c.id; }).slice(0, 3).map(courseCard).join('');
    syncSaveButtons();
  }

  /* ----- Workshops ----- */
  function workshopTimes(w) {
    var start = zonedDate(w.date + 'T' + w.start), end = zonedDate(w.date + 'T' + w.end);
    var day = fmtIn(start, { weekday: 'long', day: 'numeric', month: 'long' });
    var range = clock(start) + '–' + clock(end) + ' ' + zoneName(start);
    var local = '';
    if (visitorZone && visitorZone !== TIMEZONE && offsetFor(start, visitorZone) !== offsetAt(start.getTime())) {
      local = 'That is ' + fmtIn(start, { weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true }, visitorZone) + ' ' + zoneName(start, visitorZone) + ' where you are.';
    }
    return { start: start, end: end, day: day, range: range, local: local, mins: Math.round((end - start) / 60000) };
  }
  function offsetFor(date, zone) {
    try {
      var p = {};
      new Intl.DateTimeFormat('en-US', { timeZone: zone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
        .formatToParts(date).forEach(function (x) { p[x.type] = x.value; });
      return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute) - Math.floor(date.getTime() / 60000) * 60000;
    } catch (e) { return offsetAt(date.getTime()); }
  }
  function upcomingWorkshops() {
    var t = now().getTime();
    return WORKSHOPS.filter(function (w) {
      var end = zonedDate(w.date + 'T' + w.end);
      return end && end.getTime() > t;
    }).sort(function (a, b) { return zonedDate(a.date + 'T' + a.start) - zonedDate(b.date + 'T' + b.start); });
  }
  function seatsText(w) {
    var left = Math.max(0, w.capacity - w.booked);
    if (left === 0) return 'Fully booked';
    return (left <= FEW_SEATS ? 'Only ' : '') + plural(left, 'seat') + ' left';
  }
  function renderWorkshops() {
    var list = $('[data-workshop-list]');
    if (!list) return;
    var items = upcomingWorkshops();
    var wl = waitlisted();
    var t = now().getTime();
    $('[data-workshop-empty]').hidden = items.length > 0;
    $('[data-workshop-count]').textContent = plural(items.length, 'upcoming workshop');
    list.innerHTML = items.map(function (w, i) {
      var info = workshopTimes(w);
      var left = Math.max(0, w.capacity - w.booked);
      var full = left === 0;
      var live = info.start.getTime() <= t;
      var pct = Math.round(Math.min(1, w.booked / w.capacity) * 100);
      var onList = wl.indexOf(w.id) !== -1;
      var lvl = LEVELS[w.level];
      var action;
      if (live) action = '<span class="sticker bg-pink">Live now</span>';
      else if (full && onList) action = '<p class="flex flex-wrap items-center gap-2"><span class="sticker bg-green-soft">Waitlist requested</span><button type="button" class="text-sm font-bold underline underline-offset-4 hover:text-pink-ink" data-leave-waitlist="' + esc(w.id) + '">Undo<span class="sr-only"> waitlist request for ' + esc(w.title) + '</span></button></p>';
      else if (full) action = '<button type="button" class="btn btn-white" data-waitlist="' + esc(w.id) + '">Join the waitlist<span class="sr-only"> for ' + esc(w.title) + '</span></button>';
      else action = '<button type="button" class="btn btn-yellow" data-book="' + esc(w.id) + '">' + (w.price ? 'Book a seat' : 'Save a free seat') + '<span class="sr-only"> for ' + esc(w.title) + '</span></button>';
      return '<li class="card ' + (i % 2 ? 'tilt-r' : 'tilt-l') + ' grid gap-5 p-4 sm:grid-cols-[9rem_1fr] sm:p-5 lg:grid-cols-[9rem_1fr_15rem]" data-workshop="' + esc(w.id) + '">' +
        '<div class="relative mx-auto w-36 sm:w-full"><span class="block aspect-square overflow-hidden rounded-xl border-2 border-ink">' + art(w.motif, w.palette, { art: { word: 'hi!' } }) + '</span>' +
        '<span class="sticker absolute -top-3 -left-2 -rotate-6 bg-yellow"><span>' + esc(fmtIn(info.start, { day: 'numeric', month: 'short' })) + '</span></span></div>' +
        '<div class="min-w-0"><p class="flex flex-wrap gap-2"><span class="tag ' + lvl.bg + '">' + lvl.name + '</span><span class="tag bg-white">' + plural(info.mins, 'minute') + ' live</span><span class="tag bg-white">' + (w.price ? money(w.price) : 'Free') + '</span></p>' +
        '<h3 class="mt-2 font-display text-2xl leading-tight sm:text-[1.7rem]">' + esc(w.title) + '</h3>' +
        '<p class="mt-1 font-bold"><time datetime="' + info.start.toISOString() + '">' + esc(info.day) + ' · ' + esc(info.range) + '</time></p>' +
        (info.local ? '<p class="text-sm font-semibold text-blue-ink">' + esc(info.local) + '</p>' : '') +
        '<p class="mt-2 muted">' + esc(w.blurb) + '</p></div>' +
        '<div class="flex flex-col justify-center gap-3 sm:col-span-2 lg:col-span-1">' +
        '<p class="text-sm font-bold">' + seatsText(w) + ' <span class="font-semibold muted">of ' + w.capacity + '</span></p>' +
        '<div class="bar' + (full ? ' is-full' : left <= FEW_SEATS ? ' is-low' : '') + '" role="img" aria-label="' + w.booked + ' of ' + w.capacity + ' seats booked"><span style="width:' + pct + '%"></span></div>' +
        '<div>' + action + '</div></div></li>';
    }).join('');
  }
  function initWorkshops() {
    renderWorkshops();
    var zoneNote = $('[data-zone-note]');
    if (zoneNote) {
      var d = now();
      zoneNote.textContent = 'All times are Eastern time (' + zoneName(d) + ' right now, ' + clock(d) + ' in Asbury Park).';
    }
    document.addEventListener('click', function (e) {
      var b = e.target.closest ? e.target.closest('[data-leave-waitlist]') : null;
      if (!b) return;
      var id = b.getAttribute('data-leave-waitlist');
      if (!has(WORKSHOP_BY_ID, id)) return;
      setWaitlisted(id, false);
      renderWorkshops();
      toast('Waitlist request removed');
      var again = $('[data-waitlist="' + id + '"]');
      if (again) again.focus();
    });
    window.addEventListener('storage', function (e) { if (e.key === STORAGE_KEYS.waitlist) renderWorkshops(); });
  }
  function renderNextWorkshop() {
    var box = $('[data-next-workshop]');
    if (!box) return;
    var w = upcomingWorkshops().filter(function (x) { return x.capacity > x.booked; })[0];
    if (!w) { box.hidden = true; return; }
    var info = workshopTimes(w);
    $('[data-nw-title]', box).textContent = w.title;
    $('[data-nw-when]', box).textContent = info.day + ' · ' + info.range;
    $('[data-nw-seats]', box).textContent = seatsText(w);
    $('[data-nw-art]', box).innerHTML = art(w.motif, w.palette);
  }

  /* ----- Free resources ----- */
  function svgDoc(w, h, body) {
    return '<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h + '">' + body + '</svg>\n';
  }
  // The printable page for a resource (US Letter portrait at 72 dpi), as an SVG string.
  function resourceSheet(r) {
    var W = 612, H = 792;
    var out = '<rect width="' + W + '" height="' + H + '" fill="#ffffff"/>' +
      '<text x="48" y="78" font-family="Lilita One, Arial Rounded MT Bold, sans-serif" font-size="34" fill="' + INK + '">' + esc(r.title) + '</text>' +
      '<text x="48" y="104" font-family="Be Vietnam Pro, Arial, sans-serif" font-size="13" fill="#554c60">' + esc(r.blurb) + '</text>';
    var g = '';
    var line = 'fill="none" stroke="#9a93a3" stroke-width="1.5" stroke-dasharray="5 5"';
    var x, y, i;
    if (r.drill === 'circles') {
      for (y = 0; y < 6; y++) for (x = 0; x < 5; x++) {
        var cx = 96 + x * 100, cy = 180 + y * 104;
        g += y % 2 ? '<ellipse cx="' + cx + '" cy="' + cy + '" rx="40" ry="26" ' + line + '/>' : '<circle cx="' + cx + '" cy="' + cy + '" r="36" ' + line + '/>';
      }
    } else if (r.drill === 'lines') {
      for (i = 0; i < 10; i++) {
        y = 170 + i * 62;
        g += i % 3 === 0 ? '<path d="M60 ' + y + 'H535" ' + line + '/>' : i % 3 === 1 ? '<path d="M60 ' + y + 'q30-26 60 0t60 0 60 0 60 0 60 0 60 0 60 0 60 0" ' + line + '/>' : '<path d="M60 ' + y + 'c20-40 40 30 60-6s40 30 60-6 40 30 60-6 40 30 60-6 40 30 60-6 40 30 60-6 40 30 60-6" ' + line + '/>';
      }
    } else if (r.drill === 'faces') {
      for (y = 0; y < 4; y++) for (x = 0; x < 3; x++) {
        var fx = 130 + x * 168, fy = 200 + y * 158;
        g += '<circle cx="' + fx + '" cy="' + fy + '" r="56" ' + line + '/><path d="M' + (fx - 56) + ' ' + fy + 'q56 22 112 0M' + fx + ' ' + (fy - 56) + 'q-14 56 0 112" ' + line + '/>';
      }
    } else if (r.drill === 'boxes') {
      for (y = 0; y < 4; y++) for (x = 0; x < 3; x++) {
        var bx = 82 + x * 168, by = 160 + y * 158;
        g += '<path d="M' + bx + ' ' + (by + 30) + 'l50-24 60 18v70l-60 26-50-24Z M' + bx + ' ' + (by + 30) + 'l60 18 50-24 M' + (bx + 60) + ' ' + (by + 48) + 'v72" ' + line + '/>';
      }
    } else if (r.drill === 'expressions') {
      var moods = [['happy', 'M-14 12q14 14 28 0'], ['sad', 'M-14 18q14-12 28 0'], ['surprised', 'M-6 14a6 7 0 1 0 12 0a6 7 0 1 0-12 0'], ['grumpy', 'M-12 16h24'], ['smug', 'M-12 14q16 8 24-6'], ['sleepy', 'M-8 16q8 4 16 0'], ['excited', 'M-16 10q16 22 32 0Z'], ['worried', 'M-14 16q7-6 14 0t14 0'], ['in love', 'M-12 12q12 12 24 0']];
      moods.forEach(function (m, k) {
        var mx = 130 + (k % 3) * 168, my = 210 + Math.floor(k / 3) * 200;
        g += '<g transform="translate(' + mx + ' ' + my + ')"><circle r="58" fill="#fff1b0" stroke="' + INK + '" stroke-width="3"/>' +
          (m[0] === 'sleepy' ? '<path d="M-28-6q8 6 16 0M12-6q8 6 16 0" fill="none" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' : '<circle cx="-20" cy="-8" r="5" fill="' + INK + '"/><circle cx="20" cy="-8" r="5" fill="' + INK + '"/>') +
          (m[0] === 'grumpy' ? '<path d="M-30-24l16 8M30-24l-16 8" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' : '') +
          (m[0] === 'worried' ? '<path d="M-30-20l16-6M30-20l-16-6" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' : '') +
          '<path d="' + m[1] + '" fill="' + (m[0] === 'excited' ? '#ff6fae' : 'none') + '" stroke="' + INK + '" stroke-width="3" stroke-linecap="round"/>' +
          '<text y="86" text-anchor="middle" font-family="Be Vietnam Pro, Arial, sans-serif" font-size="15" font-weight="700" fill="' + INK + '">' + m[0] + '</text></g>';
      });
    } else if (r.drill === 'shading') {
      g += '<defs><radialGradient id="ball" cx="35%" cy="35%" r="70%"><stop offset="0" stop-color="#ffffff"/><stop offset=".55" stop-color="#ffb3cf"/><stop offset="1" stop-color="#b8135f"/></radialGradient>' +
        '<linearGradient id="cyl" x1="0" x2="1"><stop offset="0" stop-color="#2443c4"/><stop offset=".35" stop-color="#dce6ff"/><stop offset="1" stop-color="#6d93ff"/></linearGradient></defs>' +
        '<circle cx="160" cy="260" r="90" fill="url(#ball)" stroke="' + INK + '" stroke-width="3"/><ellipse cx="190" cy="372" rx="90" ry="14" fill="#1d1626" opacity=".2"/>' +
        '<path d="M330 220l80-40 100 30v120l-100 44-80-40Z" fill="#ffd84a" stroke="' + INK + '" stroke-width="3"/><path d="M330 220l100 30 80-40" fill="none" stroke="' + INK + '" stroke-width="3"/><path d="M430 250v134l-100-50V220Z" fill="#ff9446" stroke="' + INK + '" stroke-width="3"/>' +
        '<rect x="200" y="470" width="190" height="220" fill="url(#cyl)" stroke="' + INK + '" stroke-width="3"/><ellipse cx="295" cy="470" rx="95" ry="26" fill="#ffffff" stroke="' + INK + '" stroke-width="3"/><path d="M200 690a95 26 0 0 0 190 0" fill="none" stroke="' + INK + '" stroke-width="3"/>' +
        '<text x="160" y="400" text-anchor="middle" font-family="Be Vietnam Pro, Arial, sans-serif" font-size="14" font-weight="700" fill="' + INK + '">light top left, shadow bottom right</text>';
    } else if (r.colours) {
      r.colours.forEach(function (hex, k) {
        var px = 48 + (k % 2) * 256, py = 140 + Math.floor(k / 2) * 200;
        g += '<rect x="' + px + '" y="' + py + '" width="236" height="160" rx="18" fill="' + hex + '" stroke="' + INK + '" stroke-width="3"/>' +
          '<text x="' + px + '" y="' + (py + 188) + '" font-family="Be Vietnam Pro, Arial, sans-serif" font-size="18" font-weight="700" fill="' + INK + '">' + hex.toUpperCase() + '</text>';
      });
    }
    out += g + '<text x="48" y="774" font-family="Be Vietnam Pro, Arial, sans-serif" font-size="12" fill="#554c60">Marnie Draws · free resources · print on US Letter, or import into your drawing app as a reference layer</text>';
    return svgDoc(W, H, out);
  }
  function brushPreview() {
    return '<svg viewBox="0 0 595 842" class="block h-full w-full" aria-hidden="true" focusable="false"><rect width="595" height="842" fill="#fff1b0"/>' +
      ['#1d1626', '#ff6fae', '#6d93ff', '#3fd19a', '#ff9446'].map(function (c, i) {
        var y = 160 + i * 130;
        return '<path d="M80 ' + y + 'c80-60 160 60 240 0s120-50 200 10" fill="none" stroke="' + c + '" stroke-width="' + (36 - i * 5) + '" stroke-linecap="round" opacity=".9"/>';
      }).join('') + '</svg>';
  }
  function initResources() {
    var list = $('[data-resource-list]');
    if (!list) return;
    var type = param('type');
    if (!has(RESOURCE_TYPES, type)) type = '';
    function chips() {
      var html = '<button type="button" class="chip" data-type="" aria-pressed="' + (type === '') + '">Everything <span class="count">' + RESOURCES.length + '</span></button>';
      Object.keys(RESOURCE_TYPES).forEach(function (k) {
        var n = RESOURCES.filter(function (r) { return r.type === k; }).length;
        html += '<button type="button" class="chip" data-type="' + k + '" aria-pressed="' + (type === k) + '">' + RESOURCE_TYPES[k] + ' <span class="count">' + n + '</span></button>';
      });
      $('[data-resource-filters]').innerHTML = html;
    }
    function render() {
      chips();
      var items = RESOURCES.filter(function (r) { return !type || r.type === type; });
      $('[data-resource-count]').textContent = 'Showing ' + plural(items.length, 'freebie');
      list.innerHTML = items.map(function (r, i) {
        var thumb = r.type === 'brushes' ? brushPreview() : resourceSheet(r).replace(/^<\?xml[^>]*>\n/, '').replace('<svg ', '<svg class="block h-full w-full" aria-hidden="true" focusable="false" ');
        var action = r.type === 'brushes'
          ? '<a href="newsletter.html" class="btn btn-pink btn-sm">Get it with the newsletter<span class="sr-only">: ' + esc(r.title) + '</span></a>'
          : '<button type="button" class="btn btn-yellow btn-sm" data-download="' + esc(r.id) + '">Download SVG<span class="sr-only">: ' + esc(r.title) + '</span></button>';
        return '<li class="card lift ' + TILTS[i % TILTS.length] + ' flex gap-4 p-4">' +
          '<span class="block aspect-[595/842] w-24 shrink-0 overflow-hidden rounded-lg border-2 border-ink bg-white sm:w-28">' + thumb + '</span>' +
          '<div class="flex min-w-0 flex-1 flex-col"><p><span class="tag bg-paper-2">' + esc(RESOURCE_TYPES[r.type]) + '</span></p>' +
          '<h3 class="mt-2 font-display text-xl leading-tight">' + esc(r.title) + '</h3>' +
          '<p class="mt-1 text-sm muted">' + esc(r.blurb) + '</p>' +
          '<p class="mt-1 text-xs font-bold muted">' + (r.type === 'brushes' ? esc(r.app) + ' · sent to subscribers' : 'SVG · US Letter · 1 page') + '</p>' +
          '<div class="mt-auto pt-3">' + action + '</div></div></li>';
      }).join('');
      setParams({ type: type });
    }
    document.addEventListener('click', function (e) {
      var chip = e.target.closest ? e.target.closest('[data-type]') : null;
      if (chip) {
        var v = chip.getAttribute('data-type');
        type = has(RESOURCE_TYPES, v) ? v : '';
        render();
        var again = $('[data-type="' + type + '"]');
        if (again) again.focus();
        return;
      }
      var dl = e.target.closest ? e.target.closest('[data-download]') : null;
      if (dl) {
        var r = RESOURCES.filter(function (x) { return x.id === dl.getAttribute('data-download'); })[0];
        if (!r) return;
        var url = URL.createObjectURL(new Blob([resourceSheet(r)], { type: 'image/svg+xml' }));
        var a = document.createElement('a');
        a.href = url;
        a.download = 'marnie-draws-' + r.id + '.svg';
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
        toast('Downloading “' + r.title + '”');
      }
    });
    render();
  }

  /* ----- Student gallery and lightbox ----- */
  function initGallery() {
    var grid = $('[data-gallery-grid]');
    if (!grid) return;
    var course = param('course');
    if (!has(COURSE_BY_ID, course)) course = '';
    var shown = [];
    function chips() {
      var used = COURSES.filter(function (c) { return GALLERY.some(function (g) { return g.course === c.id; }); });
      $('[data-gallery-filters]').innerHTML = '<button type="button" class="chip" data-course="" aria-pressed="' + (course === '') + '">All work <span class="count">' + GALLERY.length + '</span></button>' +
        used.map(function (c) {
          var n = GALLERY.filter(function (g) { return g.course === c.id; }).length;
          return '<button type="button" class="chip" data-course="' + c.id + '" aria-pressed="' + (course === c.id) + '">' + esc(c.title) + ' <span class="count">' + n + '</span></button>';
        }).join('');
    }
    function render() {
      chips();
      shown = GALLERY.filter(function (g) { return !course || g.course === course; });
      $('[data-gallery-count]').textContent = 'Showing ' + plural(shown.length, 'piece') + ' of student work';
      grid.innerHTML = shown.map(function (g, i) {
        return '<li class="' + TILTS[i % TILTS.length] + '"><button type="button" class="card lift block w-full overflow-hidden p-2.5 pb-3 text-left" data-open-art="' + esc(g.id) + '" aria-haspopup="dialog">' +
          '<span class="block aspect-square overflow-hidden rounded-xl border-2 border-ink">' + art(g.motif, g.palette, { art: g }) + '</span>' +
          '<span class="mt-2 block px-1 font-bold leading-tight">' + esc(g.title) + '</span><span class="block px-1 hand text-lg leading-tight text-pink-ink">by ' + esc(g.student) + '</span></button></li>';
      }).join('');
      setParams({ course: course });
    }
    var dialog = $('#lightbox'), index = 0, opener = null;
    function show(i) {
      index = (i + shown.length) % shown.length;
      var g = shown[index];
      var c = COURSE_BY_ID[g.course];
      $('[data-lb-art]').innerHTML = art(g.motif, g.palette, { art: g, label: g.title + ', drawn by ' + g.student });
      $('#lightbox-title').textContent = g.title;
      $('[data-lb-by]').textContent = 'by ' + g.student;
      $('[data-lb-note]').textContent = '“' + g.note + '”';
      var link = $('[data-lb-course]');
      link.textContent = c.title;
      link.href = 'course.html?id=' + encodeURIComponent(c.id);
      $('[data-lb-count]').textContent = (index + 1) + ' of ' + shown.length;
      var single = shown.length < 2;
      $$('[data-lb-prev],[data-lb-next]').forEach(function (b) { b.hidden = single; });
    }
    function open(id, from) {
      var i = -1;
      shown.forEach(function (g, k) { if (g.id === id) i = k; });
      if (i === -1) return;
      opener = from || null;
      show(i);
      if (typeof dialog.showModal === 'function') dialog.showModal(); else dialog.setAttribute('open', '');
      $('[data-lb-close]').focus();
    }
    function close() { if (typeof dialog.close === 'function') dialog.close(); else dialog.removeAttribute('open'); }
    dialog.addEventListener('close', function () {
      var back = opener && document.contains(opener) ? opener : $('[data-open-art="' + shown[index].id + '"]');
      if (back) back.focus();
    });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });
    dialog.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); show(index + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(index - 1); }
    });
    $('[data-lb-prev]').addEventListener('click', function () { show(index - 1); });
    $('[data-lb-next]').addEventListener('click', function () { show(index + 1); });
    $('[data-lb-close]').addEventListener('click', close);
    document.addEventListener('click', function (e) {
      var chip = e.target.closest ? e.target.closest('[data-course]') : null;
      if (chip && chip.classList.contains('chip')) {
        var v = chip.getAttribute('data-course');
        course = has(COURSE_BY_ID, v) ? v : '';
        render();
        var again = $('.chip[data-course="' + course + '"]');
        if (again) again.focus();
        return;
      }
      var b = e.target.closest ? e.target.closest('[data-open-art]') : null;
      if (b) open(b.getAttribute('data-open-art'), b);
    });
    render();
    // gallery.html?art=<id> opens that piece (links from the home page wall).
    var start = param('art');
    if (has(GALLERY_BY_ID, start)) open(start, null);
  }

  /* ======================================================================
     12. Start
     ====================================================================== */
  initHeader();
  initForms();
  initSignupDialog();
  updateSavedCount();
  if (page === 'home') initHome();
  if (page === 'courses') initCourses();
  if (page === 'course') initCourse();
  if (page === 'workshops') initWorkshops();
  if (page === 'resources') initResources();
  if (page === 'gallery') initGallery();
  syncSaveButtons();
  initReveal();
  initBackToTop();
  var year = $('[data-year]');
  if (year) year.textContent = String(zoneParts(now()).y);
})();
