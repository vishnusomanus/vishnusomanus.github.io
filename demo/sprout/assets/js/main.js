/* Sprout — Loamstead field school template. Vanilla JavaScript, no dependencies.
 *
 *  1. Settings and data: school, levels, topics, instructors, courses, student quotes, crops, seasonal notes
 *  2. Helpers: URL parameters, dates in Pacific time, storage, formatting
 *  3. Artwork: one drawing per course, instructor portraits, planner plant marks
 *  4. Sessions: rolling dates worked out from each course's rule
 *  5. Shortlist and enrollment requests (saved on this device)
 *  6. Shared markup: course cards, session rows
 *  7. Home page
 *  8. Course list with filters (courses.html)
 *  9. Course page (course.html?course=…)
 * 10. Schedule (timetable.html)
 * 11. Enrollment (enrol.html)
 * 12. Bed planner (planner.html)
 * 13. Shortlist page (saved.html)
 * 14. Inquiry form (visit.html)
 * 15. Header, mobile menu, scroll reveal, year
 *
 * URL parameters and saved data are only accepted when they name one of the template's own values
 * (own-key checks), so ?course=constructor or a damaged localStorage entry can't break a page.
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Settings and data
   * ------------------------------------------------------------------ */
  // Dates and times are worked out in this time zone, whatever the visitor's own clock says.
  const TIME_ZONE = 'America/Los_Angeles';

  // Rolling demo dates. Sessions are never written as dates: each course has a rule (weekday, how
  // often, which months), and the next sessions are worked out from today.
  // The first bookable session is at least this many days away (time to send arrival notes).
  const MIN_LEAD_DAYS = 7;
  // The schedule page lists sessions starting within this many days of the first bookable day.
  const TIMETABLE_DAYS = 84;
  // How many dates each course page and enrollment list offers.
  const SESSIONS_PER_COURSE = 4;
  // The plot closes over Christmas and New Year ("MM-DD", inclusive). No sessions start or run then.
  const CLOSED = { from: '12-20', to: '01-04', label: 'Christmas and New Year’s' };
  // Demo availability: share of places already taken on sessions within 3 weeks (fewer further out).
  // Always leaves at least 2 places, so the demo never shows a full session until a visitor fills one.
  const DEMO_TAKEN = 0.75;
  // Most people one enrollment request can cover.
  const MAX_PEOPLE = 4;

  const LEVELS = {
    beginner: { name: 'Beginner', about: 'No experience needed.' },
    improver: { name: 'Intermediate', about: 'You have grown a season or two.' },
    experienced: { name: 'Experienced', about: 'Confident with tools and keen to go further.' }
  };
  const TOPICS = {
    veg: 'Vegetables',
    containers: 'Small spaces',
    soil: 'Soil and compost',
    fruit: 'Fruit trees',
    propagation: 'Propagation',
    hedges: 'Hedges and wildlife'
  };
  // Season filter on courses.html: months (1–12) in each season.
  const SEASONS = {
    spring: { name: 'Spring', months: [3, 4, 5] },
    summer: { name: 'Summer', months: [6, 7, 8] },
    autumn: { name: 'Fall', months: [9, 10, 11] },
    winter: { name: 'Winter', months: [12, 1, 2] }
  };

  const TUTORS = {
    eudora: {
      name: 'Eudora Wickmere', role: 'Founder, soil and vegetables',
      bio: 'Eudora grew vegetables in a narrow rented yard for ten years before starting Loamstead around a neighbor’s raised bed. She teaches the soil and vegetable courses and still keeps the compost bays in order.',
      quote: 'A failed crop is a useful note, not a verdict.'
    },
    idris: {
      name: 'Idris Pennock', role: 'Fruit trees and hedges',
      bio: 'Idris spent twenty years in the pear orchards of the Hood River Valley and has taught hedge-laying at farm workshops across Oregon. He teaches pruning, trained fruit and the hedge-laying weekends.',
      quote: 'Cut less than you want to. The tree will tell you next year.'
    },
    halima: {
      name: 'Halima Fennimore', role: 'Containers and propagation',
      bio: 'Halima ran a balcony nursery from a third-floor apartment in Salem before joining Loamstead. She teaches small-space growing, sowing and cuttings, and runs the Wednesday evening classes.',
      quote: 'If it has light and a drainage hole, it can grow food.'
    }
  };

  // Courses. rule: day = weekday (0 Sunday … 6 Saturday); every = 'week', 'fortnight' (parity 0 or 1
  // picks which weeks) or 'month' (nth = 1st, 2nd or 3rd of that weekday in the month); months = when
  // it runs; parts = day offsets of each meeting (two-day courses). Times are Pacific local time.
  const COURSES = [
    {
      id: 'first-bed', name: 'Your first growing bed', level: 'beginner', topic: 'veg', tutor: 'eudora', price: 85, capacity: 8,
      rule: { day: 6, every: 'fortnight', parity: 0, months: [3, 4, 5, 6, 7, 8, 9, 10], parts: [0] }, start: '10:00', end: '14:00',
      tone: '#e4e9cf',
      summary: 'Turn one small patch into somewhere you can grow supper, and go home with a tray of seedlings.',
      about: 'Our gentlest start. You will read your soil, mark out a 4-foot bed you never need to stand on, and sow the crops that reliably reward a beginner. Lunch is in the barn, and everything you sow goes home with you.',
      plan: ['Meet your soil: a squeeze test and a jar test', 'Mark out a bed you can reach from both sides', 'Sow and plant five reliable crops', 'Watering, thinning and the first month at home'],
      takeaway: ['A seed tray of salad and beet seedlings', 'A printed sowing calendar for a Willamette Valley garden'],
      bring: 'Shoes you don’t mind getting muddy and a bag lunch. We provide tools, gloves, seeds and compost.'
    },
    {
      id: 'small-space', name: 'A harvest in small spaces', level: 'beginner', topic: 'containers', tutor: 'halima', price: 65, capacity: 8,
      rule: { day: 0, every: 'fortnight', parity: 1, months: [4, 5, 6, 7, 8, 9], parts: [0] }, start: '10:00', end: '13:00',
      tone: '#f3dcc4',
      summary: 'A stoop, balcony or bright patio is enough. Match pots, compost and plants to the light you have.',
      about: 'Bring a photo of your space and we will plan it together. You will learn which containers really work, how to keep them watered through a July heatwave, and plant a cut-and-come-again salad pot to carry home.',
      plan: ['Map sun and shelter across a day', 'Pots, drainage and the right compost', 'Plant a salad pot and a herb trough', 'Feeding and watering without a garden spigot'],
      takeaway: ['A planted salad pot', 'A watering plan for your own space'],
      bring: 'A photo of your space and rough measurements. Pots and compost are included.'
    },
    {
      id: 'living-soil', name: 'Make living soil', level: 'beginner', topic: 'soil', tutor: 'eudora', price: 55, capacity: 10,
      rule: { day: 6, every: 'month', nth: 1, months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], parts: [0] }, start: '14:30', end: '17:00',
      tone: '#eadbc8',
      summary: 'Compost, mulch and leaf mold without the mystery or the smell. Runs all year, in every weather.',
      about: 'An afternoon at our compost bays. We will turn a pile together, look at what is living in it and work out why some piles go slimy. You will leave knowing how to make good compost from what your own garden and kitchen produce.',
      plan: ['Greens, browns and the balance between them', 'Turn a pile and read its temperature', 'Leaf mold, worm bins and cover crops', 'How deep to mulch, and when'],
      takeaway: ['A bag of our finished compost', 'A one-page guide to fixing a sad pile'],
      bring: 'Old clothes and a sealed sample of your own soil, if you would like us to look at it.'
    },
    {
      id: 'seed-to-supper', name: 'Seed to supper', level: 'beginner', topic: 'veg', tutor: 'halima', price: 145, capacity: 8,
      rule: { day: 6, every: 'month', nth: 2, months: [2, 3, 4, 5], parts: [0, 21] }, start: '10:00', end: '13:00',
      tone: '#dae7de',
      summary: 'Two spring Saturdays, three weeks apart: sow on the first, prick out and plant on the second.',
      about: 'Follow a seed from packet to plate. On the first Saturday you will sow tomatoes, zucchini and beans; you take them home to look after, then bring them back three weeks later to prick out, pot up and plan a summer of steady harvests.',
      plan: ['Reading a seed packet properly', 'Sowing depth, warmth and light', 'Pricking out and potting up (second Saturday)', 'Hardening off and succession sowing'],
      takeaway: ['About 30 young plants of your own', 'A seed-starting tray to keep'],
      bring: 'A sturdy box to carry seedlings home, both times. Seeds, compost and trays are included.'
    },
    {
      id: 'winter-pruning', name: 'Winter fruit-tree pruning', level: 'improver', topic: 'fruit', tutor: 'idris', price: 95, capacity: 6,
      rule: { day: 6, every: 'fortnight', parity: 1, months: [11, 12, 1, 2], parts: [0] }, start: '10:00', end: '15:00',
      tone: '#dfe5e6',
      summary: 'Apples and pears pruned in the dormant season, on our own old orchard trees, with a sharp pair of pruners each.',
      about: 'Most fruit trees are pruned too hard or not at all. In the orchard behind the plot, Idris will show you how to read a tree, open up its center and leave it fruiting well. You will prune a tree yourself before lunch.',
      plan: ['Fruit buds, growth buds and spurs', 'The three Ds: dead, diseased and damaged', 'Open-center pruning on a young tree', 'Renovating an old, neglected tree'],
      takeaway: ['A sharpened pair of our pruners to borrow at home for a month', 'A pruning calendar for apples, pears and plums'],
      bring: 'Warm layers, waterproofs and boots. Pruners, loppers and gloves are provided.'
    },
    {
      id: 'trained-fruit', name: 'Cordons and espaliers', level: 'improver', topic: 'fruit', tutor: 'idris', price: 90, capacity: 6,
      rule: { day: 6, every: 'fortnight', parity: 0, months: [7, 8, 9], parts: [0] }, start: '10:00', end: '14:00',
      tone: '#f0e2c6',
      summary: 'Grow apples and pears flat against a wall or fence, and keep them fruiting with a summer prune.',
      about: 'Trained fruit packs a small orchard into a narrow border. Working on the espaliered pears along our south wall, you will learn how to set up wires, choose a rootstock and summer-prune so the fruit stays and the shoots don’t.',
      plan: ['Rootstocks and spacing for small gardens', 'Putting up wires on a wall or fence', 'Summer pruning to fruit buds', 'Tying in and forming new tiers'],
      takeaway: ['A one-year-old cordon apple to plant at home', 'A diagram of your first three years'],
      bring: 'A photo of the wall or fence you have in mind, if you have one.'
    },
    {
      id: 'cuttings', name: 'Cuttings and propagation', level: 'improver', topic: 'propagation', tutor: 'halima', price: 60, capacity: 10,
      rule: { day: 3, every: 'week', months: [5, 6, 7, 8, 9], parts: [0] }, start: '18:00', end: '20:30',
      tone: '#dce8dd',
      summary: 'A Wednesday evening of softwood and semi-ripe cuttings. More plants for nothing, from plants you already love.',
      about: 'An evening in the potting shed with the doors open. You will take softwood and semi-ripe cuttings from lavender, rosemary, fuchsia and currants, learn why some root in water and others sulk, and set up a cuttings pot that works on any windowsill.',
      plan: ['Which plants root easily, and when', 'Softwood, semi-ripe and hardwood cuttings', 'Compost, grit and the plastic-bag trick', 'Potting up and overwintering young plants'],
      takeaway: ['Two pots of cuttings', 'A cuttings calendar for the year'],
      bring: 'Nothing at all. If you would like to swap cuttings, bring a few in a damp plastic bag.'
    },
    {
      id: 'hedge-laying', name: 'Hedge-laying weekend', level: 'experienced', topic: 'hedges', tutor: 'idris', price: 245, capacity: 6,
      rule: { day: 6, every: 'month', nth: 3, months: [11, 12, 1, 2], parts: [0, 1] }, start: '09:00', end: '15:30',
      tone: '#e6e1cf',
      summary: 'Two days with a billhook on our boundary hawthorn, laid in the traditional style with stakes and hazel binders.',
      about: 'A traditional skill that turns a gappy, overgrown hedge into a thick, living barrier for birds and insects. Over a Saturday and Sunday you will lay your own length of our boundary hedge, and learn to keep a billhook safe and sharp.',
      plan: ['Reading a hedge and planning the lay', 'Safe billhook and saw technique', 'Cutting and laying pleachers', 'Staking and binding the top'],
      takeaway: ['Your own laid length of hedge, with your name on the map', 'A certificate of attendance'],
      bring: 'Sturdy boots, warm layers and a bag lunch for both days. Tools, gloves and eye protection are provided.'
    },
    {
      id: 'no-dig', name: 'Setting up no-dig beds', level: 'improver', topic: 'soil', tutor: 'eudora', price: 110, capacity: 8,
      rule: { day: 0, every: 'fortnight', parity: 0, months: [2, 3, 9, 10, 11], parts: [0] }, start: '10:00', end: '15:00',
      tone: '#e9e0cf',
      summary: 'Cardboard, compost and patience: start a weed-free bed without turning a single spadeful.',
      about: 'Fall and late winter are the best times to start no-dig. On a working Sunday you will build a bed from sod, mulch an existing flower bed and plan a year of planting that keeps the soil covered and the weeds down.',
      plan: ['Why we stopped digging', 'Building a bed on grass, step by step', 'How much compost, and where to find it', 'Planting through mulch and the first year'],
      takeaway: ['A planting plan for one no-dig bed', 'Our compost-quantity calculator on a card'],
      bring: 'Boots and a bag lunch. If you have flattened cardboard boxes with the tape removed, bring them along.'
    },
    {
      id: 'seed-saving', name: 'Saving your own seed', level: 'improver', topic: 'propagation', tutor: 'eudora', price: 60, capacity: 10,
      rule: { day: 0, every: 'month', nth: 2, months: [8, 9, 10], parts: [0] }, start: '14:00', end: '16:30',
      tone: '#f2e6c9',
      summary: 'Beans, tomatoes, lettuces and flowers: collect, clean and store seed that grows true next year.',
      about: 'A late-summer afternoon among our seed crops. You will learn which plants come true from seed, how to collect and dry it, the wet method for tomatoes and how to store seed so it is still lively in spring.',
      plan: ['Open-pollinated, F1 and what comes true', 'Collecting dry seed: beans, lettuce, calendula', 'Fermenting tomato seed', 'Drying, labeling and storing'],
      takeaway: ['Six packets of seed from our plot', 'A seed-saving record card'],
      bring: 'Paper envelopes if you have them. Everything else is provided.'
    }
  ];

  // Student quotes: past course attendees (first name and town).
  const QUOTES = [
    { course: 'first-bed', name: 'Corinne', place: 'Philomath', text: 'I had killed every houseplant I ever owned. Six weeks later we were eating our own salad, and I knew why it worked.' },
    { course: 'small-space', name: 'Ambrose', place: 'Corvallis', text: 'My balcony faces north-east. Halima didn’t tell me it was hopeless; she told me to grow chard. She was right.' },
    { course: 'living-soil', name: 'Elspeth', place: 'Lebanon', text: 'Our compost has gone from a slimy pile to real crumbly black stuff. The jar test alone was worth the afternoon.' },
    { course: 'seed-to-supper', name: 'Lionel', place: 'Monroe', text: 'Coming back three weeks later to see everyone’s seedlings side by side taught me more than any book.' },
    { course: 'winter-pruning', name: 'Petra', place: 'Alsea', text: 'Idris made me cut a branch on a tree I was terrified of. It cropped better the next summer than it had in years.' },
    { course: 'trained-fruit', name: 'Graham', place: 'Adair Village', text: 'We now have four espalier pears along a fence I used to hate looking at.' },
    { course: 'cuttings', name: 'Joan', place: 'Tangent', text: 'A lovely evening. I went home with lavender cuttings and every one of them took.' },
    { course: 'hedge-laying', name: 'Bashir', place: 'Brownsville', text: 'Hard, happy work. Two days later I could see my own stretch of hedge from the road.' },
    { course: 'no-dig', name: 'Ayodele', place: 'Monmouth', text: 'I built a bed on my lawn in March and haven’t pulled more than a handful of weeds since.' },
    { course: 'seed-saving', name: 'Winifred', place: 'Dallas', text: 'I didn’t buy a single bean seed this spring. That felt like a small revolution.' }
  ];

  // Planner crops: spacing in inches between plants (in the row and between rows), the mark drawn
  // in the plan, and the course that teaches it.
  const CROPS = {
    lettuce: { name: 'Loose-leaf lettuce', spacing: 12, mark: 'rosette', course: 'first-bed' },
    beetroot: { name: 'Beets', spacing: 6, mark: 'root', course: 'first-bed' },
    kale: { name: 'Kale', spacing: 18, mark: 'kale', course: 'no-dig' },
    beans: { name: 'Bush beans', spacing: 6, mark: 'bean', course: 'seed-to-supper' },
    garlic: { name: 'Garlic', spacing: 6, mark: 'bulb', course: 'no-dig' },
    chard: { name: 'Swiss chard', spacing: 12, mark: 'chard', course: 'small-space' },
    courgette: { name: 'Zucchini', spacing: 36, mark: 'courgette', course: 'seed-to-supper' },
    radish: { name: 'Radish', spacing: 2, mark: 'root', course: 'small-space' }
  };
  const PLANNER_LIMITS = { min: 0.5, max: 30 }; // feet
  // The plan drawing shows at most this many plants across and along; bigger plans show one corner.
  const DRAW_MAX = { across: 24, along: 30 };

  // One note per month for "In the garden this month" on the home page.
  const MONTH_NOTES = [
    ['Plan on paper, not in the soil.', 'Order only the seed you will sow, clean your pots and prune apple and pear trees on a dry day.', 'winter-pruning'],
    ['Warm the soil before you sow.', 'Cover a bed with cardboard or row cover now and it will be ready weeks earlier. Sprout early potatoes on a cool windowsill.', 'no-dig'],
    ['Start with one tray of seeds.', 'Sow tomatoes and peppers indoors, label every row and resist the urge to sow the whole packet.', 'seed-to-supper'],
    ['Little and often.', 'Sow salads every three weeks for a steady supply, and keep row cover handy for frosty nights.', 'first-bed'],
    ['Harden off before you plant out.', 'Give seedlings a week of days outdoors and nights in before they go into the bed.', 'small-space'],
    ['Water the roots, not the leaves.', 'Water deeply in the evening, twice a week, rather than a sprinkle every day.', 'cuttings'],
    ['Pick before it gets away from you.', 'Zucchini and beans crop harder the more you pick. Summer-prune trained apples and pears.', 'trained-fruit'],
    ['Let a few plants go to seed.', 'Leave your best lettuce and calendula to flower, and collect the seed on a dry afternoon.', 'seed-saving'],
    ['Sow a cover crop on bare soil.', 'Crimson clover or cereal rye keeps the soil covered and the worms busy until spring.', 'no-dig'],
    ['Feed the soil for next year.', 'Collect fallen leaves for leaf mold and spread compost on empty beds before the rain sets in.', 'living-soil'],
    ['Plant garlic and bare-root fruit.', 'Garlic likes a cold snap. It is also the start of the bare-root season for fruit trees and hedging.', 'hedge-laying'],
    ['A quiet month is still a growing month.', 'Sharpen your tools, check stored apples and squash, and plan next year with a pot of tea.', 'living-soil']
  ];

  const STORAGE = {
    shortlist: 'sprout:shortlist:v1',
    enrolments: 'sprout:enrolments:v1',
    planner: 'sprout:planner:v1'
  };

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.prototype.slice.call((root || document).querySelectorAll(sel));
  const hasOwn = (obj, key) => typeof key === 'string' && Object.prototype.hasOwnProperty.call(obj, key);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const plural = (n, one, many) => n + ' ' + (n === 1 ? one : (many || one + 's'));
  const money = (n) => '$' + n;
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const COURSE_MAP = Object.create(null);
  COURSES.forEach((c) => { COURSE_MAP[c.id] = c; });
  const courseById = (id) => (hasOwn(COURSE_MAP, id) ? COURSE_MAP[id] : null);
  const params = new URLSearchParams(window.location.search);
  // A URL parameter, trimmed and lower-cased ('' when missing).
  const param = (name) => String(params.get(name) || '').trim().toLowerCase();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let observer = null; // scroll reveal (section 15)

  // localStorage, or an in-memory stand-in when the browser blocks it (a sandboxed iframe, strict
  // privacy settings): saved state then lasts for this page view instead of the feature doing nothing.
  const safeStorage = (function () {
    let local = null;
    try { local = window.localStorage; local.getItem('_'); } catch (e) { local = null; /* blocked */ }
    // A save that fails (storage full) stays in memory, and memory is read first, so the change isn't lost.
    const memory = Object.create(null);
    return {
      getItem: (key) => {
        if (key in memory) return memory[key];
        try { return local ? local.getItem(key) : null; } catch (e) { return null; }
      },
      setItem: (key, value) => {
        if (local) {
          try { local.setItem(key, String(value)); delete memory[key]; return; } catch (e) { /* full */ }
        }
        memory[key] = String(value);
      },
      removeItem: (key) => {
        delete memory[key];
        if (local) { try { local.removeItem(key); } catch (e) { /* blocked */ } }
      }
    };
  })();
  const store = {
    get(key) { try { const raw = safeStorage.getItem(key); return raw === null ? null : JSON.parse(raw); } catch (e) { return null; } },
    set(key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* full or blocked */ } },
    remove(key) { try { safeStorage.removeItem(key); } catch (e) { /* blocked */ } }
  };

  // Calendar dates are "YYYY-MM-DD" keys counted as whole days, so clock changes never shift a date.
  const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const DAY_LONG = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const pad = (n) => String(n).padStart(2, '0');
  const dayNum = (key) => Math.round(Date.parse(key + 'T00:00:00Z') / 86400000);
  const keyOf = (num) => new Date(num * 86400000).toISOString().slice(0, 10);
  const weekday = (key) => new Date(key + 'T12:00:00Z').getUTCDay();
  const monthOf = (key) => +key.slice(5, 7);
  function validKey(s) {
    return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s) && keyOf(dayNum(s)) === s;
  }
  const shortDate = (key) => DAY[weekday(key)] + ', ' + MONTH[monthOf(key) - 1] + ' ' + +key.slice(8);
  // Long dates add the year when it isn't this year ("Saturday, March 6, 2027").
  const longDate = (key) => DAY_LONG[weekday(key)] + ', ' + MONTH_LONG[monthOf(key) - 1] + ' ' + +key.slice(8) + (key.slice(0, 4) !== TODAY.slice(0, 4) ? ', ' + key.slice(0, 4) : '');
  const fullDate = (key) => DAY_LONG[weekday(key)] + ', ' + MONTH_LONG[monthOf(key) - 1] + ' ' + +key.slice(8) + ', ' + key.slice(0, 4);
  // "10:00" → "10am", "14:30" → "2:30pm".
  function clock(hhmm) {
    const h = +hhmm.slice(0, 2), m = +hhmm.slice(3);
    return (h % 12 || 12) + (m ? ':' + pad(m) : '') + (h < 12 ? 'am' : 'pm');
  }
  const timeRange = (c) => clock(c.start) + '–' + clock(c.end);
  function hoursOf(c) {
    const mins = (+c.end.slice(0, 2) * 60 + +c.end.slice(3)) - (+c.start.slice(0, 2) * 60 + +c.start.slice(3));
    const h = mins * c.rule.parts.length / 60;
    return (h % 1 ? h.toFixed(1) : h) + ' hours';
  }
  function lengthLabel(c) {
    const n = c.rule.parts.length;
    if (n === 1) return (c.rule.day === 3 ? 'One evening' : 'One ' + DAY_LONG[c.rule.day]) + ' · ' + hoursOf(c);
    if (c.rule.parts[1] === 1) return 'A weekend · ' + hoursOf(c);
    return 'Two ' + DAY_LONG[c.rule.day] + 's · ' + hoursOf(c);
  }
  function monthsLabel(c) {
    const m = c.rule.months;
    if (m.length === 12) return 'All year';
    // Find the start of the run (a month whose previous month isn't in the list).
    const runs = [];
    m.forEach((x) => { if (m.indexOf(x === 1 ? 12 : x - 1) === -1) runs.push(x); });
    return runs.map((first) => {
      let last = first;
      while (m.indexOf(last === 12 ? 1 : last + 1) !== -1 && (last === 12 ? 1 : last + 1) !== first) last = last === 12 ? 1 : last + 1;
      return first === last ? MONTH_LONG[first - 1] : MONTH_LONG[first - 1] + ' to ' + MONTH_LONG[last - 1];
    }).join(' and ');
  }

  // Today in Pacific time, as a key. ?now=YYYY-MM-DD previews the site on another date (for review).
  function todayKey() {
    const forced = params.get('now');
    if (forced && validKey(forced.slice(0, 10))) return forced.slice(0, 10);
    try {
      return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());
    } catch (e) {
      return new Date().toISOString().slice(0, 10);
    }
  }
  const TODAY = todayKey();
  const FIRST_DAY = dayNum(TODAY) + MIN_LEAD_DAYS;

  // Deterministic pseudo-random numbers (FNV-1a) so demo availability is stable for a session.
  function hash(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    h ^= h >>> 13; h = Math.imul(h, 2246822507) >>> 0; h ^= h >>> 16;
    return h >>> 0;
  }

  // A short reference for the inquiry confirmation, like LS-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let out = '';
    for (let i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  const ICONS = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    people: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.7-3.6 3.3-5.5 6.5-5.5s5.8 1.9 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M21.5 20c-.4-2.4-1.7-4-3.5-4.8"/>',
    leaf: '<path d="M5 19C5 10 10 5 20 4c0 10-5 15-15 15Z"/><path d="M5 19 13 11"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    mark: '<path d="M7 4h10v16l-5-4-5 4Z"/>',
    pin: '<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>'
  };
  const icon = (name, cls) => '<svg viewBox="0 0 24 24" class="' + (cls || 'size-4') + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">' + ICONS[name] + '</svg>';

  /* ------------------------------------------------------------------
   * 3. Artwork. Each course has its own drawing (320 × 220), built from a few shared strokes.
   * ------------------------------------------------------------------ */
  const INK = '#1f3a2e', MOSS = '#6b8550', LEAF = '#9fb26f', PALE = '#dbe3b8', RUST = '#a84325', SOIL = '#6e5240', STRAW = '#f1dfb2', CREAM = '#fffdf6';
  // A seedling: stem and two leaves, scaled by s.
  function sprig(x, y, s, fill) {
    const f = fill || LEAF;
    return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M0 0V-14" stroke="' + INK + '" stroke-width="2" fill="none"/><path d="M0-12c-9 0-13-6-13-11 8 0 13 5 13 11Z" fill="' + f + '" stroke="' + INK + '" stroke-width="1.5"/><path d="M0-14c1-8 6-12 13-12 0 7-5 12-13 12Z" fill="' + f + '" stroke="' + INK + '" stroke-width="1.5"/></g>';
  }
  function dots(n, x0, y0, w, h, r, fill, seed) {
    let out = '';
    for (let i = 0; i < n; i++) {
      const a = hash(seed + i);
      out += '<circle cx="' + (x0 + a % w) + '" cy="' + (y0 + (a >>> 8) % h) + '" r="' + (r + (a >>> 16) % 2) + '" fill="' + fill + '"/>';
    }
    return out;
  }
  const svgOpen = (tone) => '<svg viewBox="0 0 320 220" class="block h-full w-full" aria-hidden="true" focusable="false"><rect width="320" height="220" fill="' + tone + '"/>';
  const ART = {
    'first-bed': (t) => {
      let rows = '';
      [138, 158, 178].forEach((y, r) => { for (let i = 0; i < 7; i++) rows += sprig(88 + i * 26 + r * 4 - 4, y, 0.7 + r * 0.12); });
      return svgOpen(t) + '<path d="M0 120h320" stroke="' + INK + '" stroke-opacity=".15"/>' +
        '<path d="M70 120h180l40 76H30Z" fill="' + SOIL + '"/>' + dots(40, 50, 128, 220, 64, 1, '#9b7b5c', 'bed') +
        '<path d="M70 120h180l40 76H30Z" fill="none" stroke="' + INK + '" stroke-width="2.5"/><path d="M30 196h260v10H30Z" fill="#b48a5e" stroke="' + INK + '" stroke-width="2.5"/>' + rows +
        '<g transform="rotate(-18 262 110)"><rect x="257" y="58" width="10" height="44" rx="3" fill="' + RUST + '" stroke="' + INK + '" stroke-width="2"/><path d="M262 102v8M252 110h20l-6 30h-8Z" fill="#c9cdb5" stroke="' + INK + '" stroke-width="2"/></g>' +
        '<path d="M40 112V56" stroke="' + INK + '" stroke-width="3"/><rect x="22" y="40" width="40" height="22" fill="' + CREAM + '" stroke="' + INK + '" stroke-width="2"/><path d="M30 51h24" stroke="' + RUST + '" stroke-width="2"/></svg>';
    },
    'small-space': (t) => {
      const pot = (x, y, w, h) => '<path d="M' + x + ' ' + y + 'h' + w + 'l-' + w * 0.12 + ' ' + h + 'h-' + w * 0.76 + 'Z" fill="#c26a45" stroke="' + INK + '" stroke-width="2.5"/><path d="M' + (x - 4) + ' ' + y + 'h' + (w + 8) + 'v10h-' + (w + 8) + 'Z" fill="#b05a37" stroke="' + INK + '" stroke-width="2.5"/>';
      return svgOpen(t) + '<path d="M0 168h120v-30h100v-30h100v112H0Z" fill="#e8e1d1" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<g fill="' + LEAF + '" stroke="' + INK + '" stroke-width="1.8"><ellipse cx="44" cy="128" rx="16" ry="10"/><ellipse cx="68" cy="122" rx="16" ry="11"/><ellipse cx="88" cy="130" rx="14" ry="9"/><ellipse cx="58" cy="114" rx="13" ry="10" fill="' + MOSS + '"/></g>' + pot(34, 134, 64, 34) +
        '<g stroke="' + INK + '" stroke-width="1.8" fill="' + MOSS + '"><path d="M158 104c-6-20 2-36 2-36M170 104c2-22 12-30 12-30M146 104c-8-14-6-26-6-26" fill="none"/><ellipse cx="160" cy="70" rx="5" ry="9"/><ellipse cx="182" cy="75" rx="5" ry="9" transform="rotate(30 182 75)"/><ellipse cx="140" cy="80" rx="5" ry="9" transform="rotate(-25 140 80)"/></g>' + pot(134, 104, 56, 30) +
        '<path d="M262 74V20" stroke="' + INK + '" stroke-width="3"/><path d="M262 30c-30 6-38 30-30 44" fill="none" stroke="' + INK + '" stroke-width="2"/>' +
        '<g fill="' + RUST + '" stroke="' + INK + '" stroke-width="1.8"><circle cx="236" cy="66" r="7"/><circle cx="248" cy="58" r="6"/><circle cx="276" cy="50" r="7"/></g>' +
        '<g fill="' + LEAF + '" stroke="' + INK + '" stroke-width="1.6"><ellipse cx="272" cy="34" rx="12" ry="6" transform="rotate(-20 272 34)"/><ellipse cx="252" cy="44" rx="11" ry="6" transform="rotate(25 252 44)"/></g>' + pot(232, 74, 60, 34) + '</svg>';
    },
    'living-soil': (t) => {
      const bands = ['#7d9a55', '#8a6a50', '#a4c070', '#6e5240', '#b48a5e', '#5a4334'];
      let layers = '';
      bands.forEach((c, i) => { layers += '<path d="M60 ' + (78 + i * 20) + 'q100 -10 200 0v20q-100 -8 -200 0Z" fill="' + c + '"/>'; });
      return svgOpen(t) + '<path d="M60 78q100-60 200 0v120H60Z" fill="#8a6a50"/>' + layers + dots(36, 66, 86, 188, 106, 1, '#e8d4b0', 'soil') +
        '<path d="M60 78q100-60 200 0v120H60Z" fill="none" stroke="' + INK + '" stroke-width="2.5"/><path d="M40 198h240" stroke="' + INK + '" stroke-width="2.5"/>' +
        '<path d="M104 150c10-10 22 8 34-2s20 8 30 0" fill="none" stroke="#e59a86" stroke-width="7" stroke-linecap="round"/><path d="M104 150c10-10 22 8 34-2s20 8 30 0" fill="none" stroke="' + INK + '" stroke-width="1" stroke-linecap="round"/>' +
        '<g fill="none" stroke="' + INK + '" stroke-width="2" stroke-linecap="round" opacity=".55"><path d="M130 40c-6-8 6-12 0-20"/><path d="M160 34c-6-8 6-12 0-20"/><path d="M190 40c-6-8 6-12 0-20"/></g>' +
        '<g transform="rotate(14 286 120)"><path d="M286 70v86" stroke="' + INK + '" stroke-width="4"/><path d="M276 156h20v26c0 6-20 6-20 0Z" fill="#c9cdb5" stroke="' + INK + '" stroke-width="2"/><path d="M278 64h16v8h-16Z" fill="' + RUST + '" stroke="' + INK + '" stroke-width="2"/></g></svg>';
    },
    'seed-to-supper': (t) => {
      let tray = '';
      for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) tray += sprig(150 + i * 36, 120 + r * 26, 0.55 + (r + i) % 2 * 0.15);
      return svgOpen(t) + '<g transform="rotate(-8 70 110)"><rect x="30" y="50" width="80" height="110" fill="' + CREAM + '" stroke="' + INK + '" stroke-width="2.5"/><path d="M30 64h80" stroke="' + INK + '" stroke-width="2"/>' +
        '<circle cx="70" cy="104" r="22" fill="' + RUST + '" stroke="' + INK + '" stroke-width="2"/><path d="M70 82c-4-14 2-22 10-26M70 82c4-12-4-20-14-22" fill="none" stroke="' + MOSS + '" stroke-width="3"/><path d="M44 142h52M52 150h36" stroke="' + INK + '" stroke-width="2"/></g>' +
        '<path d="M132 104h170l-8 70H140Z" fill="' + SOIL + '" stroke="' + INK + '" stroke-width="2.5"/><path d="M168 104v70M204 104v70M240 104v70M274 104v70M136 128h162M138 152h158" stroke="' + INK + '" stroke-opacity=".5"/>' + tray +
        dots(8, 40, 180, 80, 20, 2, '#b48a5e', 'seeds') + '</svg>';
    },
    'winter-pruning': (t) => {
      return svgOpen(t) + '<path d="M0 186h320v34H0Z" fill="#cfd8c6"/><path d="M0 186h320" stroke="' + INK + '" stroke-width="2"/>' +
        '<g fill="none" stroke="' + INK + '" stroke-linecap="round"><path d="M150 186c2-30-2-50 0-70" stroke-width="9"/><path d="M150 120c-20-14-40-30-52-58M150 118c22-16 40-34 50-62M150 116c0-24 4-46 2-70" stroke-width="5"/>' +
        '<path d="M110 80c-14-6-22-14-28-26M98 64c8-10 10-20 8-30M190 70c12-4 22-12 30-24M200 58c-4-12-2-22 4-32M152 70c-12-8-16-18-16-28M152 56c10-6 16-14 18-24" stroke-width="2.5"/></g>' +
        '<g fill="' + RUST + '"><circle cx="82" cy="54" r="3"/><circle cx="106" cy="34" r="3"/><circle cx="220" cy="46" r="3"/><circle cx="204" cy="26" r="3"/><circle cx="136" cy="42" r="3"/></g>' +
        '<g stroke="' + RUST + '" stroke-width="2.5"><path d="M118 86l10-6M180 82l10 4"/></g>' +
        '<g transform="translate(236 130) rotate(-30)"><path d="M0 0l40-6-38 14Z" fill="#c9cdb5" stroke="' + INK + '" stroke-width="2"/><path d="M2 6c-14 4-26 14-34 24M0 0c-12-8-28-10-40-8" fill="none" stroke="' + RUST + '" stroke-width="7" stroke-linecap="round"/><circle cx="2" cy="4" r="3" fill="' + INK + '"/></g>' +
        dots(14, 10, 10, 300, 90, 1, CREAM, 'frost') + '</svg>';
    },
    'trained-fruit': (t) => {
      let bricks = '';
      for (let r = 0; r < 9; r++) for (let i = 0; i < 9; i++) bricks += '<rect x="' + (i * 40 - (r % 2) * 20) + '" y="' + r * 20 + '" width="40" height="20" fill="none" stroke="#b48a5e" stroke-opacity=".5"/>';
      const pear = (x, y) => '<path d="M' + x + ' ' + y + 'c-4 0-5 6-8 10-4 6-2 14 8 14s12-8 8-14c-3-4-4-10-8-10Z" fill="#c2b45a" stroke="' + INK + '" stroke-width="1.6"/>';
      return svgOpen(t) + bricks + '<path d="M0 186h320v34H0Z" fill="#cfd8c6" stroke="' + INK + '" stroke-width="2"/>' +
        '<g stroke="' + INK + '" stroke-opacity=".35"><path d="M20 60h280M20 104h280M20 148h280"/></g>' +
        '<g fill="none" stroke="' + SOIL + '" stroke-linecap="round" stroke-width="6"><path d="M160 186V40"/><path d="M160 148H60M160 148h100M160 104H70M160 104h90M160 60H84M160 60h76"/></g>' +
        '<g fill="none" stroke="' + INK + '" stroke-width="1.5"><path d="M160 186V40M160 148H60M160 148h100M160 104H70M160 104h90M160 60H84M160 60h76"/></g>' +
        pear(96, 150) + pear(212, 150) + pear(120, 106) + pear(228, 106) + pear(108, 62) + pear(196, 62) +
        '<g fill="' + LEAF + '" stroke="' + INK + '" stroke-width="1.4"><ellipse cx="78" cy="142" rx="8" ry="4"/><ellipse cx="244" cy="142" rx="8" ry="4"/><ellipse cx="88" cy="98" rx="8" ry="4"/><ellipse cx="238" cy="98" rx="8" ry="4"/><ellipse cx="166" cy="34" rx="8" ry="4" transform="rotate(-40 166 34)"/></g></svg>';
    },
    cuttings: (t) => {
      return svgOpen(t) + '<path d="M0 176h320v44H0Z" fill="#e8e1d1" stroke="' + INK + '" stroke-width="2"/>' +
        '<path d="M70 80h70v86c0 8-6 12-14 12H84c-8 0-14-4-14-12Z" fill="' + CREAM + '" fill-opacity=".7" stroke="' + INK + '" stroke-width="2.5"/><path d="M72 110h66v56c0 7-6 10-12 10H84c-7 0-12-3-12-10Z" fill="#b9d3d6" fill-opacity=".8"/>' +
        '<path d="M105 40v120" stroke="' + INK + '" stroke-width="3"/><g fill="none" stroke="' + CREAM + '" stroke-width="2"><path d="M105 158c-8 6-14 10-20 10M105 156c6 8 14 10 22 10M105 160c0 6-2 10-6 12"/></g>' +
        '<g fill="none" stroke="' + INK + '" stroke-width="1"><path d="M105 158c-8 6-14 10-20 10M105 156c6 8 14 10 22 10M105 160c0 6-2 10-6 12"/></g>' +
        '<g fill="' + MOSS + '" stroke="' + INK + '" stroke-width="1.6"><ellipse cx="92" cy="48" rx="14" ry="6" transform="rotate(30 92 48)"/><ellipse cx="118" cy="56" rx="14" ry="6" transform="rotate(-30 118 56)"/><ellipse cx="94" cy="70" rx="12" ry="5" transform="rotate(20 94 70)"/></g>' +
        '<path d="M190 126h90l-10 52h-70Z" fill="#c26a45" stroke="' + INK + '" stroke-width="2.5"/><path d="M186 118h98v10h-98Z" fill="#b05a37" stroke="' + INK + '" stroke-width="2.5"/>' +
        sprig(204, 118, 1.1, '#8aa36a') + sprig(226, 118, 1.25, '#8aa36a') + sprig(250, 118, 1.05, '#8aa36a') + sprig(270, 118, 1.15, '#8aa36a') +
        '<g transform="translate(150 186) rotate(-8)"><path d="M0 0h50" stroke="' + INK + '" stroke-width="2"/><path d="M0 0l8-4v8Z" fill="#c9cdb5" stroke="' + INK + '" stroke-width="1.5"/><rect x="18" y="-4" width="34" height="8" fill="' + RUST + '" stroke="' + INK + '" stroke-width="1.5"/></g></svg>';
    },
    'hedge-laying': (t) => {
      let pleachers = '', stakes = '', bind = '';
      for (let i = 0; i < 9; i++) pleachers += '<path d="M' + (20 + i * 34) + ' 178L' + (80 + i * 34) + ' 96" stroke="' + SOIL + '" stroke-width="7" stroke-linecap="round"/>';
      for (let i = 0; i < 7; i++) stakes += '<path d="M' + (36 + i * 44) + ' 186V84" stroke="#8a6a50" stroke-width="5" stroke-linecap="round"/><path d="M' + (36 + i * 44) + ' 186V84" stroke="' + INK + '" stroke-width="1"/>';
      bind = '<path d="M20 92c22-10 44 10 66 0s44 10 66 0 44 10 66 0 44 10 66 0 44 10 66 0" fill="none" stroke="#b48a5e" stroke-width="4"/><path d="M20 98c22 10 44-10 66 0s44-10 66 0 44-10 66 0 44-10 66 0 44-10 66 0" fill="none" stroke="#8a6a50" stroke-width="4"/>';
      let leaves = '';
      for (let i = 0; i < 18; i++) { const a = hash('hedge' + i); leaves += '<ellipse cx="' + (14 + i * 17) + '" cy="' + (76 + a % 14) + '" rx="10" ry="6" fill="' + (i % 3 ? LEAF : MOSS) + '" stroke="' + INK + '" stroke-width="1.2"/>'; }
      return svgOpen(t) + '<path d="M0 186h320v34H0Z" fill="#cfd8c6"/><path d="M0 186h320" stroke="' + INK + '" stroke-width="2"/>' + leaves + pleachers +
        '<g stroke="' + INK + '" stroke-width="1" fill="none">' + pleachers.replace(/stroke="#6e5240" stroke-width="7"/g, 'stroke="' + INK + '" stroke-width="1"') + '</g>' + stakes + bind +
        '<g transform="translate(250 150) rotate(-20)"><rect x="-4" y="0" width="8" height="40" rx="3" fill="#b48a5e" stroke="' + INK + '" stroke-width="1.6"/><path d="M-6 0h12v-26c0-8 14-10 14 0l-8 4v-6c-4-2-6 2-6 6v22Z" fill="#c9cdb5" stroke="' + INK + '" stroke-width="1.6"/></g></svg>';
    },
    'no-dig': (t) => {
      let plants = '';
      for (let i = 0; i < 6; i++) plants += sprig(70 + i * 38, 92, 1 + (i % 2) * 0.2, i % 2 ? LEAF : '#8aa36a');
      return svgOpen(t) + '<path d="M30 92h260v26H30Z" fill="#5a4334"/>' + dots(20, 34, 94, 252, 22, 1, '#9b7b5c', 'mulch') +
        '<path d="M30 118h260v12H30Z" fill="#c9a77a"/><path d="M30 130h260v22H30Z" fill="#7d9a55"/>' +
        '<g stroke="' + INK + '" stroke-opacity=".5"><path d="M40 136l6 10M70 134l-4 12M110 136l8 10M150 134l-4 12M190 136l6 10M230 134l-6 12M266 136l4 10"/></g>' +
        '<path d="M30 152h260v40H30Z" fill="' + SOIL + '"/>' + dots(26, 34, 156, 252, 32, 1, '#9b7b5c', 'deep') +
        '<path d="M30 92h260v100H30Z" fill="none" stroke="' + INK + '" stroke-width="2.5"/><path d="M30 118h260M30 130h260M30 152h260" stroke="' + INK + '" stroke-width="1.5"/>' + plants +
        '<g stroke="' + CREAM + '" stroke-width="1.6" fill="none"><path d="M108 152c-2 10 4 18 0 30M184 152c4 10-2 20 2 30"/></g>' +
        '<g transform="translate(250 40) rotate(10)"><path d="M0 0h40v26H0Z" fill="#c9a77a" stroke="' + INK + '" stroke-width="2"/><path d="M0 8h40M14 0v26" stroke="' + INK + '" stroke-opacity=".4"/></g>' +
        '<g transform="translate(36 30) rotate(-6)"><path d="M0 8c0-6 6-8 14-8h34c8 0 12 4 12 8l-6 34H6Z" fill="' + MOSS + '" stroke="' + INK + '" stroke-width="2"/><path d="M10 20h40" stroke="' + INK + '" stroke-opacity=".4"/></g></svg>';
    },
    'seed-saving': (t) => {
      const head = (x, y, r) => {
        let spokes = '';
        for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; spokes += '<path d="M' + x + ' ' + y + 'L' + (x + Math.cos(a) * r).toFixed(1) + ' ' + (y + Math.sin(a) * r).toFixed(1) + '"/><circle cx="' + (x + Math.cos(a) * r).toFixed(1) + '" cy="' + (y + Math.sin(a) * r).toFixed(1) + '" r="3" fill="#b48a5e"/>'; }
        return '<g stroke="' + INK + '" stroke-width="1.4">' + spokes + '</g>';
      };
      return svgOpen(t) + '<path d="M0 190h320v30H0Z" fill="#e8e1d1" stroke="' + INK + '" stroke-width="2"/>' +
        '<g fill="none" stroke="' + INK + '" stroke-width="2.5"><path d="M80 190c0-50 4-90 0-120M120 190c2-40-2-70 6-96"/></g>' + head(80, 62, 26) + head(126, 88, 20) +
        '<path d="M178 190V110c0-6 4-8 8-8h6" fill="none" stroke="' + INK + '" stroke-width="2.5"/><path d="M188 96c-10 0-14 8-14 14s6 12 14 12 14-4 14-12-4-14-14-14Z" fill="#c2b45a" stroke="' + INK + '" stroke-width="2"/><path d="M182 96h12v-4h-12Z" fill="' + INK + '"/>' +
        '<g transform="translate(214 128) rotate(6)"><path d="M0 0h80v56H0Z" fill="' + CREAM + '" stroke="' + INK + '" stroke-width="2.5"/><path d="M0 0l40 26L80 0" fill="none" stroke="' + INK + '" stroke-width="2"/><path d="M12 42h40" stroke="' + RUST + '" stroke-width="2"/></g>' +
        dots(14, 204, 180, 100, 8, 1, SOIL, 'spill') + '</svg>';
    }
  };
  function courseArt(c) { return (hasOwn(ART, c.id) ? ART[c.id] : ART['first-bed'])(c.tone); }

  // Instructor portraits: simple ink drawings on a colored disc.
  const PORTRAIT = {
    eudora: { bg: '#dbe3b8', skin: '#e9c4a4', top: '#6b8550', back: '<path d="M31 46c-3-18 6-30 19-30s22 12 19 30c-2 8-5 12-8 14H39c-3-2-6-6-8-14Z" fill="#9a9d9e"/>', front: '<path d="M34 34c4-8 10-11 16-11s13 4 16 12c-6-3-12-4-17-2-5 2-10 2-15 1Z" fill="#9a9d9e"/><circle cx="50" cy="17" r="7" fill="#9a9d9e" stroke="#1f3a2e" stroke-width="1.4"/><g fill="none" stroke="#1f3a2e" stroke-width="1.4"><circle cx="44" cy="43" r="4"/><circle cx="56" cy="43" r="4"/><path d="M48 43h4"/></g>' },
    idris: { bg: '#f1dfb2', skin: '#c99872', top: '#2d5141', back: '', front: '<path d="M31 35c0-12 8-20 19-20s19 8 19 20Z" fill="#a84325" stroke="#1f3a2e" stroke-width="1.6"/><path d="M27 35h46v5H27Z" fill="#8a3519" stroke="#1f3a2e" stroke-width="1.4"/><path d="M37 52c3 9 23 9 26 0-1 10-7 14-13 14s-12-4-13-14Z" fill="#7a6252"/>' },
    halima: { bg: '#dde7e2', skin: '#8d5d42', top: '#c26a45', back: '<path d="M28 48c-3-22 7-35 22-35s25 13 22 35c-1 10-4 18-6 22H34c-2-4-5-12-6-22Z" fill="#a84325" stroke="#1f3a2e" stroke-width="1.6"/>', front: '<path d="M34 36c3-9 9-13 16-13s13 4 16 13c-5-4-10-6-16-6s-11 2-16 6Z" fill="#a84325"/>' }
  };
  function portrait(id, cls) {
    const p = hasOwn(PORTRAIT, id) ? PORTRAIT[id] : PORTRAIT.eudora;
    return '<svg viewBox="0 0 100 100" class="' + (cls || 'size-20') + '" aria-hidden="true" focusable="false"><circle cx="50" cy="50" r="48" fill="' + p.bg + '" stroke="' + INK + '" stroke-width="2"/>' + p.back +
      '<path d="M18 92c4-18 16-26 32-26s28 8 32 26a48 48 0 0 1-64 0Z" fill="' + p.top + '" stroke="' + INK + '" stroke-width="2"/>' +
      '<path d="M44 58h12v10c-4 3-8 3-12 0Z" fill="' + p.skin + '" stroke="' + INK + '" stroke-width="1.6"/>' +
      '<ellipse cx="50" cy="42" rx="15" ry="18" fill="' + p.skin + '" stroke="' + INK + '" stroke-width="2"/>' + p.front +
      '<g fill="' + INK + '"><circle cx="44" cy="43" r="1.6"/><circle cx="56" cy="43" r="1.6"/></g><path d="M45 52c3 2 7 2 10 0" fill="none" stroke="' + INK + '" stroke-width="1.6" stroke-linecap="round"/></svg>';
  }

  /* ------------------------------------------------------------------
   * 4. Sessions: rolling dates from each course's rule.
   * ------------------------------------------------------------------ */
  function isClosed(key) {
    const md = key.slice(5);
    return CLOSED.from <= CLOSED.to ? md >= CLOSED.from && md <= CLOSED.to : md >= CLOSED.from || md <= CLOSED.to;
  }
  // Week number counted from Monday, January 5, 1970, for every-other-week courses.
  const weekIndex = (num) => Math.floor((num - 4) / 7);
  function matchesRule(c, num) {
    const key = keyOf(num), r = c.rule;
    if (weekday(key) !== r.day || r.months.indexOf(monthOf(key)) === -1) return false;
    if (r.every === 'fortnight' && weekIndex(num) % 2 !== r.parity) return false;
    if (r.every === 'month' && Math.ceil(+key.slice(8) / 7) !== r.nth) return false;
    return r.parts.every((offset) => !isClosed(keyOf(num + offset)));
  }
  const sessionCache = Object.create(null);
  // The next `count` sessions of a course, starting at least MIN_LEAD_DAYS from today.
  function sessionsFor(c, count) {
    const n = count || SESSIONS_PER_COURSE;
    const cacheKey = c.id + '|' + n;
    if (sessionCache[cacheKey]) return sessionCache[cacheKey];
    const out = [];
    for (let num = FIRST_DAY; out.length < n && num < FIRST_DAY + 800; num++) {
      if (matchesRule(c, num)) out.push(makeSession(c, keyOf(num)));
    }
    sessionCache[cacheKey] = out;
    return out;
  }
  function makeSession(c, key) {
    const num = dayNum(key);
    const days = num - FIRST_DAY;
    // Demo: closer sessions are fuller. Never more than capacity - 2 taken.
    const share = days < 21 ? DEMO_TAKEN : days < 49 ? DEMO_TAKEN * 0.55 : DEMO_TAKEN * 0.25;
    const taken = Math.min(c.capacity - 2, Math.floor((hash(c.id + key) % 100) / 100 * share * c.capacity + share * 2));
    return {
      course: c, key: key, dates: c.rule.parts.map((o) => keyOf(num + o)),
      taken: taken, get left() { return Math.max(0, c.capacity - this.taken - placesRequested(c.id, key)); }
    };
  }
  function sessionByKey(c, key) {
    if (!validKey(key) || dayNum(key) < FIRST_DAY || !matchesRule(c, dayNum(key))) return null;
    return makeSession(c, key);
  }
  function sessionDates(s, short) {
    const fmt = short ? shortDate : longDate;
    if (s.dates.length === 1) return fmt(s.key);
    if (s.dates[1] === keyOf(dayNum(s.key) + 1)) {
      if (!short) return longDate(s.dates[0]) + ' and ' + longDate(s.dates[1]);
      return monthOf(s.dates[0]) === monthOf(s.dates[1])
        ? DAY[weekday(s.dates[0])] + '–' + DAY[weekday(s.dates[1])] + ', ' + MONTH[monthOf(s.dates[1]) - 1] + ' ' + +s.key.slice(8) + '–' + +s.dates[1].slice(8)
        : shortDate(s.dates[0]) + ' – ' + shortDate(s.dates[1]);
    }
    return fmt(s.dates[0]) + ' and ' + fmt(s.dates[1]);
  }
  function placesText(n) {
    if (n <= 0) return 'Full';
    if (n === 1) return 'Last place';
    return n <= 3 ? 'Only ' + n + ' places left' : n + ' places left';
  }
  function placesClass(n) { return n <= 0 ? 'bg-muted/15 text-muted' : n <= 3 ? 'bg-straw text-rust-dark' : 'bg-leaf text-ink'; }

  /* ------------------------------------------------------------------
   * 5. Shortlist and enrollment requests
   * ------------------------------------------------------------------ */
  function readShortlist() {
    const raw = store.get(STORAGE.shortlist);
    if (!Array.isArray(raw)) return [];
    const seen = Object.create(null);
    return raw.filter((id) => courseById(id) && !seen[id] && (seen[id] = true));
  }
  let shortlist = readShortlist();
  function saveShortlist() { store.set(STORAGE.shortlist, shortlist); }
  const isSaved = (id) => shortlist.indexOf(id) !== -1;

  // Enrollment requests made on this device. Damaged or past entries are dropped when read.
  function readEnrolments() {
    const raw = store.get(STORAGE.enrolments);
    if (!Array.isArray(raw)) return [];
    return raw.filter((e) => e && typeof e === 'object' &&
      typeof e.ref === 'string' && /^LS-\d{4}$/.test(e.ref) &&
      courseById(e.course) && validKey(e.date) && dayNum(e.date) >= dayNum(TODAY) &&
      Number.isInteger(e.people) && e.people >= 1 && e.people <= MAX_PEOPLE &&
      typeof e.name === 'string' && e.name.length <= 80).slice(0, 20);
  }
  let enrolments = readEnrolments();
  function saveEnrolments() { store.set(STORAGE.enrolments, enrolments); }
  function placesRequested(courseId, key) {
    return enrolments.reduce((sum, e) => sum + (e.course === courseId && e.date === key ? e.people : 0), 0);
  }

  function paintShortlist() {
    const n = shortlist.length;
    $$('[data-nav-count]').forEach((el) => { el.textContent = String(n); el.hidden = n === 0; });
    $$('[data-shortlist-link]').forEach((a) => {
      a.setAttribute('aria-label', 'Shortlist, ' + (n ? plural(n, 'course') + ' saved' : 'no courses saved'));
    });
    $$('[data-save]').forEach((btn) => {
      const c = courseById(btn.getAttribute('data-save'));
      if (!c) return;
      const on = isSaved(c.id);
      btn.setAttribute('aria-pressed', String(on));
      const label = btn.querySelector('[data-save-label]');
      if (label) label.textContent = on ? 'Saved' : 'Save';
      btn.setAttribute('aria-label', 'Save ' + c.name + ' to your shortlist');
    });
  }
  function toggleSaved(id) {
    if (!courseById(id)) return;
    shortlist = isSaved(id) ? shortlist.filter((x) => x !== id) : shortlist.concat(id);
    saveShortlist();
    paintShortlist();
    announce(isSaved(id) ? courseById(id).name + ' saved to your shortlist.' : courseById(id).name + ' removed from your shortlist.');
    renderSavedPage();
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest && e.target.closest('[data-save]');
    if (btn) toggleSaved(btn.getAttribute('data-save'));
  });

  // One polite live region for short confirmations.
  function announce(msg) {
    const live = $('#announcer');
    if (!live) return;
    live.textContent = '';
    window.setTimeout(() => { live.textContent = msg; }, 50);
  }

  /* ------------------------------------------------------------------
   * 6. Shared markup
   * ------------------------------------------------------------------ */
  const saveButton = (c, extra) => '<button type="button" class="btn btn-ghost btn-sm aria-pressed:bg-leaf ' + (extra || '') + '" data-save="' + c.id + '" aria-pressed="' + isSaved(c.id) + '" aria-label="Save ' + esc(c.name) + ' to your shortlist">' + icon('mark') + '<span data-save-label>' + (isSaved(c.id) ? 'Saved' : 'Save') + '</span></button>';
  function courseCard(c, headingLevel) {
    const h = headingLevel || 'h3';
    const next = sessionsFor(c, 1)[0];
    return '<article class="sheet reveal flex flex-col">' +
      '<a href="course.html?course=' + c.id + '" class="block aspect-[16/11] overflow-hidden border-b border-line" tabindex="-1" aria-hidden="true">' + courseArt(c) + '</a>' +
      '<div class="flex flex-1 flex-col p-5">' +
      '<p class="flex flex-wrap gap-1.5"><span class="tag">' + LEVELS[c.level].name + '</span><span class="tag">' + TOPICS[c.topic] + '</span></p>' +
      '<' + h + ' class="mt-3 font-display text-2xl leading-tight font-medium"><a href="course.html?course=' + c.id + '" class="hover:text-rust hover:underline hover:decoration-rust hover:underline-offset-4">' + esc(c.name) + '</a></' + h + '>' +
      '<p class="mt-2 text-[0.95rem] text-muted">' + esc(c.summary) + '</p>' +
      '<dl class="mt-4 grid gap-1 border-t border-dashed border-line pt-3 text-sm">' +
      '<div class="flex gap-2"><dt class="sr-only">Length</dt><dd class="flex items-center gap-2">' + icon('clock', 'size-4 text-moss') + lengthLabel(c) + '</dd></div>' +
      '<div class="flex gap-2"><dt class="sr-only">Next date</dt><dd class="flex items-center gap-2">' + icon('calendar', 'size-4 text-moss') + 'Next: ' + sessionDates(next, true) + ' · <span class="font-semibold">' + placesText(next.left) + '</span></dd></div>' +
      '</dl>' +
      '<div class="mt-auto flex items-center justify-between gap-3 pt-5"><p><span class="font-display text-2xl font-semibold">' + money(c.price) + '</span> <span class="text-sm text-muted">per person</span></p>' + saveButton(c) + '</div>' +
      '</div></article>';
  }
  function sessionRow(s, opts) {
    const c = s.course, o = opts || {};
    const left = s.left;
    const tutor = TUTORS[c.tutor];
    return '<li class="grid grid-cols-[4.5rem_1fr] items-start gap-x-4 gap-y-3 border-b border-line py-4 sm:grid-cols-[4.5rem_1fr_auto] sm:items-center">' +
      '<p class="border border-ink/30 bg-card text-center leading-tight"><span class="block bg-ink py-0.5 text-[0.7rem] font-semibold tracking-wider text-paper uppercase">' + DAY[weekday(s.key)] + '</span><span class="block py-1 font-display text-2xl font-semibold">' + +s.key.slice(8) + '</span><span class="block pb-1 text-xs">' + MONTH[monthOf(s.key) - 1] + '</span></p>' +
      '<div class="min-w-0">' +
      (o.showCourse === false ? '<p class="font-semibold">' + sessionDates(s) + '</p>' : '<p class="font-display text-xl leading-tight font-medium"><a class="hover:text-rust hover:underline" href="course.html?course=' + c.id + '">' + esc(c.name) + '</a></p>') +
      '<p class="mt-1 text-sm text-muted">' + (o.showCourse === false ? '' : (s.dates.length > 1 ? sessionDates(s, true) + ' · ' : '')) + timeRange(c) + (s.dates.length > 1 && o.showCourse === false ? ' both days' : '') + ' · with ' + tutor.name.split(' ')[0] + ' · ' + money(c.price) + '</p>' +
      '<p class="mt-2 flex flex-wrap gap-1.5">' + (o.showCourse === false ? '' : '<span class="tag">' + LEVELS[c.level].name + '</span>') + '<span class="inline-flex items-center px-2 py-0.5 text-xs font-semibold ' + placesClass(left) + '">' + placesText(left) + '</span></p>' +
      '</div>' +
      '<div class="col-start-2 sm:col-start-3">' + (left > 0
        ? '<a class="btn btn-primary btn-sm" href="enrol.html?course=' + c.id + '&amp;session=' + s.key + '" aria-label="Enroll in ' + esc(c.name) + ', ' + longDate(s.key) + '">Enroll</a>'
        : '<a class="btn btn-ghost btn-sm" href="visit.html?topic=' + c.id + '#enquiry" aria-label="Ask about a waitlist for ' + esc(c.name) + ', ' + longDate(s.key) + '">Waitlist</a>') + '</div>' +
      '</li>';
  }
  function quoteBlock(q, cls) {
    const c = courseById(q.course);
    return '<figure class="sheet tape reveal p-6 ' + (cls || '') + '"><blockquote class="font-display text-xl leading-snug italic">“' + esc(q.text) + '”</blockquote>' +
      '<figcaption class="mt-4 text-sm"><span class="font-semibold">' + esc(q.name) + ', ' + esc(q.place) + '</span><br><span class="text-muted">' + esc(c.name) + '</span></figcaption></figure>';
  }

  /* ------------------------------------------------------------------
   * 7. Home page
   * ------------------------------------------------------------------ */
  (function home() {
    const featured = $('[data-featured]');
    if (featured) {
      // The three courses with the soonest dates, so the home page always leads with what's coming up.
      const soonest = COURSES.map((c) => ({ c: c, s: sessionsFor(c, 1)[0] }))
        .sort((a, b) => a.s.key < b.s.key ? -1 : a.s.key > b.s.key ? 1 : 0).slice(0, 3);
      featured.innerHTML = soonest.map((x) => courseCard(x.c)).join('');
    }
    const upcoming = $('[data-upcoming]');
    if (upcoming) {
      const all = [];
      COURSES.forEach((c) => sessionsFor(c, 3).forEach((s) => all.push(s)));
      all.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : a.course.start < b.course.start ? -1 : 1);
      upcoming.innerHTML = all.slice(0, 5).map((s) => sessionRow(s)).join('');
    }
    const note = $('[data-month-note]');
    if (note) {
      const m = monthOf(TODAY);
      const n = MONTH_NOTES[m - 1];
      const c = courseById(n[2]);
      $('[data-month-name]').textContent = MONTH_LONG[m - 1];
      $('[data-month-title]').textContent = n[0];
      $('[data-month-copy]').textContent = n[1];
      const link = $('[data-month-course]');
      link.href = 'course.html?course=' + c.id;
      $('[data-month-course-name]', link).textContent = c.name;
    }
    const quotes = $('[data-quotes]');
    if (quotes) quotes.innerHTML = [QUOTES[0], QUOTES[4], QUOTES[8]].map((q) => quoteBlock(q)).join('');
    const tutors = $('[data-tutor-strip]');
    if (tutors) {
      tutors.innerHTML = Object.keys(TUTORS).map((id) => '<li class="flex items-center gap-4">' + portrait(id, 'size-16 shrink-0') + '<p><span class="block font-display text-lg font-medium">' + TUTORS[id].name + '</span><span class="text-sm text-muted">' + TUTORS[id].role + '</span></p></li>').join('');
    }
  })();

  // Instructor cards on about.html, with the courses each one teaches.
  (function tutorCards() {
    const box = $('[data-tutor-cards]');
    if (!box) return;
    box.innerHTML = Object.keys(TUTORS).map((id) => {
      const t = TUTORS[id];
      const teaches = COURSES.filter((c) => c.tutor === id);
      return '<article class="sheet reveal flex flex-col p-6">' + portrait(id, 'size-24') +
        '<h3 class="mt-4 font-display text-2xl font-medium">' + t.name + '</h3><p class="text-sm font-semibold text-rust">' + t.role + '</p>' +
        '<p class="mt-3 leading-relaxed">' + esc(t.bio) + '</p>' +
        '<p class="mt-4 font-display text-lg italic text-muted">“' + esc(t.quote) + '”</p>' +
        '<h4 class="mt-5 border-t border-dashed border-line pt-4 text-xs font-semibold tracking-[0.15em] uppercase">Teaches</h4><ul class="mt-2 grid gap-1.5 text-sm">' +
        teaches.map((c) => '<li><a class="underline decoration-rust underline-offset-4 hover:text-rust" href="course.html?course=' + c.id + '">' + esc(c.name) + '</a></li>').join('') + '</ul></article>';
    }).join('');
  })();

  /* ------------------------------------------------------------------
   * 8. Course list with filters (courses.html?level=&topic=&season=)
   * ------------------------------------------------------------------ */
  (function courseList() {
    const grid = $('[data-course-grid]');
    if (!grid) return;
    const state = {
      level: hasOwn(LEVELS, param('level')) ? param('level') : 'all',
      topic: hasOwn(TOPICS, param('topic')) ? param('topic') : 'all',
      season: hasOwn(SEASONS, param('season')) ? param('season') : 'all'
    };
    const topicSel = $('#filter-topic'), seasonSel = $('#filter-season');
    topicSel.value = state.topic;
    seasonSel.value = state.season;
    function render() {
      const found = COURSES.filter((c) => (state.level === 'all' || c.level === state.level) &&
        (state.topic === 'all' || c.topic === state.topic) &&
        (state.season === 'all' || SEASONS[state.season].months.some((m) => c.rule.months.indexOf(m) !== -1)));
      grid.innerHTML = found.map((c) => courseCard(c, 'h2')).join('');
      $('[data-course-count]').textContent = found.length === COURSES.length ? 'Showing all ' + plural(COURSES.length, 'course') : 'Showing ' + found.length + ' of ' + plural(COURSES.length, 'course');
      $('[data-course-empty]').hidden = found.length > 0;
      $$('[data-level]').forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-level') === state.level)));
      const q = new URLSearchParams();
      Object.keys(state).forEach((k) => { if (state[k] !== 'all') q.set(k, state[k]); });
      const qs = q.toString();
      window.history.replaceState(null, '', (qs ? '?' + qs : window.location.pathname) + window.location.hash);
      revealNew();
      paintShortlist();
    }
    $$('[data-level]').forEach((b) => b.addEventListener('click', () => { state.level = b.getAttribute('data-level'); render(); }));
    topicSel.addEventListener('change', () => { state.topic = hasOwn(TOPICS, topicSel.value) ? topicSel.value : 'all'; render(); });
    seasonSel.addEventListener('change', () => { state.season = hasOwn(SEASONS, seasonSel.value) ? seasonSel.value : 'all'; render(); });
    $$('[data-clear-filters]').forEach((b) => b.addEventListener('click', () => {
      state.level = state.topic = state.season = 'all';
      topicSel.value = seasonSel.value = 'all';
      render();
      $('[data-level="all"]').focus();
    }));
    render();
  })();

  /* ------------------------------------------------------------------
   * 9. Course page (course.html?course=<id>). Without a parameter it shows the first course.
   * ------------------------------------------------------------------ */
  (function coursePage() {
    const root = $('[data-course-page]');
    if (!root) return;
    const raw = params.get('course');
    const c = raw === null ? COURSES[0] : courseById(param('course'));
    const set = (sel, html) => { const el = $(sel); if (el) el.innerHTML = html; };
    if (!c) {
      document.title = 'Course not found — Loamstead field school';
      $('[data-c-title]').textContent = 'We couldn’t find that course';
      $('[data-c-crumb]').textContent = 'Not found';
      $$('[data-c-detail]').forEach((el) => { el.hidden = true; });
      $('[data-c-missing]').hidden = false;
      set('[data-c-missing-list]', COURSES.map((x) => '<li><a class="link" href="course.html?course=' + x.id + '">' + esc(x.name) + '</a> <span class="text-sm text-muted">· ' + LEVELS[x.level].name + '</span></li>').join(''));
      return;
    }
    const tutor = TUTORS[c.tutor];
    const sessions = sessionsFor(c);
    document.title = c.name + ' — Loamstead field school';
    const desc = $('meta[name="description"]');
    if (desc) desc.setAttribute('content', c.summary);
    $$('meta[property="og:title"]').forEach((m) => m.setAttribute('content', c.name + ' — Loamstead field school'));
    $$('meta[property="og:description"]').forEach((m) => m.setAttribute('content', c.summary));
    $('[data-c-title]').textContent = c.name;
    $('[data-c-crumb]').textContent = c.name;
    $('[data-c-summary]').textContent = c.summary;
    $('[data-c-about]').textContent = c.about;
    set('[data-c-tags]', '<span class="tag">' + LEVELS[c.level].name + '</span><span class="tag">' + TOPICS[c.topic] + '</span><span class="tag">' + monthsLabel(c) + '</span>');
    set('[data-c-art]', courseArt(c));
    $('[data-c-fig]').textContent = 'Fig. ' + pad(COURSES.indexOf(c) + 1) + ' · ' + c.name;
    set('[data-c-facts]', [
      ['clock', lengthLabel(c) + ', ' + timeRange(c)],
      ['people', 'Up to ' + c.capacity + ' students'],
      ['leaf', LEVELS[c.level].name + ': ' + LEVELS[c.level].about.toLowerCase().replace(/\.$/, '')],
      ['calendar', 'Runs ' + (monthsLabel(c) === 'All year' ? 'all year' : monthsLabel(c))]
    ].map((f) => '<li class="flex items-start gap-2.5">' + icon(f[0], 'mt-0.5 size-5 shrink-0 text-moss') + '<span>' + f[1] + '</span></li>').join(''));
    set('[data-c-plan]', c.plan.map((p, i) => '<li class="flex gap-4 border-b border-dashed border-line py-3"><span class="font-display text-xl text-rust italic">' + pad(i + 1) + '</span><span class="pt-0.5">' + esc(p) + '</span></li>').join(''));
    set('[data-c-takeaway]', c.takeaway.map((t) => '<li class="flex gap-2.5">' + icon('check', 'mt-1 size-4 shrink-0 text-rust') + '<span>' + esc(t) + '</span></li>').join(''));
    $('[data-c-bring]').textContent = c.bring;
    $('[data-c-price]').textContent = money(c.price);
    const next = sessions[0];
    $('[data-c-next]').textContent = sessionDates(next) + ', ' + timeRange(c);
    $('[data-c-next-places]').textContent = placesText(next.left);
    const enrolLink = $('[data-c-enrol]');
    enrolLink.href = 'enrol.html?course=' + c.id;
    $$('[data-save]', root).forEach((b) => b.setAttribute('data-save', c.id));
    set('[data-c-sessions]', sessions.map((s) => sessionRow(s, { showCourse: false })).join(''));
    $('[data-c-dates-note]').textContent = c.rule.parts.length > 1
      ? (c.rule.parts[1] === 1 ? 'Both days of the weekend, ' + timeRange(c) + ' each day.' : 'Each date is a pair of Saturdays three weeks apart; book once for both.')
      : 'Every session is the full course; choose the one that suits you.';
    set('[data-c-tutor-art]', portrait(c.tutor, 'size-24 shrink-0'));
    $('[data-c-tutor-name]').textContent = tutor.name;
    $('[data-c-tutor-role]').textContent = tutor.role;
    $('[data-c-tutor-bio]').textContent = tutor.bio;
    const q = QUOTES.filter((x) => x.course === c.id)[0];
    set('[data-c-quote]', q ? '<blockquote class="font-display text-2xl leading-snug italic sm:text-3xl">“' + esc(q.text) + '”</blockquote><p class="mt-4 text-sm font-semibold">' + esc(q.name) + ', ' + esc(q.place) + '</p>' : '');
    const related = COURSES.filter((x) => x.id !== c.id && (x.topic === c.topic || x.tutor === c.tutor)).slice(0, 3);
    set('[data-c-related]', related.map((x) => courseCard(x)).join(''));
    // Visit form link with the course preselected.
    const ask = $('[data-c-ask]');
    if (ask) ask.href = 'visit.html?topic=' + c.id + '#enquiry';
    paintShortlist();
    revealNew();
  })();

  /* ------------------------------------------------------------------
   * 10. Schedule (timetable.html?course=&level=)
   * ------------------------------------------------------------------ */
  (function timetable() {
    const list = $('[data-timetable]');
    if (!list) return;
    const courseSel = $('#tt-course'), levelSel = $('#tt-level');
    courseSel.innerHTML = '<option value="all">All courses</option>' + COURSES.map((c) => '<option value="' + c.id + '">' + esc(c.name) + '</option>').join('');
    courseSel.value = courseById(param('course')) ? param('course') : 'all';
    levelSel.value = hasOwn(LEVELS, param('level')) ? param('level') : 'all';
    const last = FIRST_DAY + TIMETABLE_DAYS;
    $('[data-tt-range]').textContent = longDate(keyOf(FIRST_DAY)) + ' to ' + fullDate(keyOf(last));
    function render() {
      const course = courseSel.value, level = levelSel.value;
      const rows = [];
      COURSES.forEach((c) => {
        if ((course !== 'all' && c.id !== course) || (level !== 'all' && c.level !== level)) return;
        sessionsFor(c, 40).forEach((s) => { if (dayNum(s.key) <= last) rows.push(s); });
      });
      rows.sort((a, b) => a.key < b.key ? -1 : a.key > b.key ? 1 : a.course.start < b.course.start ? -1 : 1);
      let html = '', month = '';
      rows.forEach((s) => {
        const m = s.key.slice(0, 7);
        if (m !== month) {
          if (month) html += '</ul></section>';
          month = m;
          html += '<section class="mt-10 first:mt-0" aria-labelledby="m-' + m + '"><h2 id="m-' + m + '" class="border-b-2 border-ink pb-2 font-display text-3xl font-medium">' + MONTH_LONG[monthOf(s.key) - 1] + ' <span class="text-rust italic">' + s.key.slice(0, 4) + '</span></h2><ul>';
        }
        html += sessionRow(s);
      });
      if (month) html += '</ul></section>';
      list.innerHTML = html;
      const empty = $('[data-tt-empty]');
      empty.hidden = rows.length > 0;
      if (!rows.length) {
        // A seasonal course outside the window: say when it runs next instead of an empty page.
        const c = courseById(course);
        const s = c ? sessionsFor(c, 1)[0] : null;
        $('[data-tt-empty-text]').textContent = s
          ? c.name + ' runs ' + monthsLabel(c) + '. The next date is ' + fullDate(s.key) + ', after the dates shown here.'
          : 'No sessions match those filters in the next twelve weeks.';
        const link = $('[data-tt-empty-link]');
        link.hidden = !s;
        if (s) link.href = 'enrol.html?course=' + c.id + '&session=' + s.key;
      }
      $('[data-tt-count]').textContent = plural(rows.length, 'session');
      const q = new URLSearchParams();
      if (course !== 'all') q.set('course', course);
      if (level !== 'all') q.set('level', level);
      const qs = q.toString();
      window.history.replaceState(null, '', (qs ? '?' + qs : window.location.pathname) + window.location.hash);
    }
    courseSel.addEventListener('change', render);
    levelSel.addEventListener('change', render);
    render();
  })();

  /* ------------------------------------------------------------------
   * 11. Enrollment (enrol.html?course=<id>&session=<YYYY-MM-DD>)
   * ------------------------------------------------------------------ */
  function setError(form, name, msg) {
    const field = form.elements.namedItem(name);
    const err = $('#' + form.getAttribute('data-prefix') + name + '-error');
    const targets = field && field.length !== undefined && !field.tagName ? Array.prototype.slice.call(field) : [field];
    targets.forEach((f) => { if (f) { if (msg) f.setAttribute('aria-invalid', 'true'); else f.removeAttribute('aria-invalid'); } });
    if (err) { err.textContent = msg || ''; err.hidden = !msg; }
    return !msg;
  }
  function focusFirstError(form) {
    const bad = $('[aria-invalid="true"]', form);
    if (bad) bad.focus();
  }

  (function enrol() {
    const form = $('[data-enrol-form]');
    if (!form) return;
    const courseSel = form.elements.course;
    const list = $('[data-session-list]');
    const people = form.elements.people;
    const steps = $$('[data-step]', form);
    let step = 1;
    courseSel.innerHTML = '<option value="">Choose a course</option>' + COURSES.map((c) => '<option value="' + c.id + '">' + esc(c.name) + ' · ' + money(c.price) + '</option>').join('');
    const startCourse = courseById(param('course'));
    if (startCourse) courseSel.value = startCourse.id;

    function chosen() {
      const c = courseById(courseSel.value);
      const radio = $('input[name="session"]:checked', form);
      const s = c && radio ? sessionByKey(c, radio.value) : null;
      return { c: c, s: s };
    }
    function renderSessions(preselect) {
      const c = courseById(courseSel.value);
      if (!c) {
        list.innerHTML = '<p class="border border-dashed border-ink/40 p-4 text-muted">Choose a course to see its next dates.</p>';
        return;
      }
      const sessions = sessionsFor(c);
      list.innerHTML = sessions.map((s, i) => {
        const left = s.left;
        return '<label class="choice"><input type="radio" class="check mt-0.5" name="session" value="' + s.key + '"' + (left <= 0 ? ' disabled' : '') + (preselect === s.key && left > 0 ? ' checked' : '') + ' aria-describedby="e-session-error">' +
          '<span class="min-w-0 flex-1"><span class="block font-semibold">' + sessionDates(s) + '</span><span class="block text-sm text-muted">' + timeRange(c) + (s.dates.length > 1 && s.dates[1] === keyOf(dayNum(s.key) + 1) ? ' both days' : '') + ' · with ' + TUTORS[c.tutor].name + '</span></span>' +
          '<span class="shrink-0 px-2 py-0.5 text-xs font-semibold ' + placesClass(left) + '">' + placesText(left) + '</span></label>';
      }).join('');
      $('[data-enrol-season]').textContent = c.name + ' runs ' + (monthsLabel(c) === 'All year' ? 'all year' : monthsLabel(c)) + '. ' + (c.rule.parts.length > 1 ? (c.rule.parts[1] === 1 ? 'Each date is a Saturday and Sunday.' : 'Each date is two Saturdays, three weeks apart.') : '');
    }
    function maxPeople() {
      const x = chosen();
      return x.s ? Math.max(1, Math.min(MAX_PEOPLE, x.s.left)) : MAX_PEOPLE;
    }
    function clampPeople() {
      const max = maxPeople();
      let n = parseInt(people.value, 10);
      if (!Number.isInteger(n) || n < 1) n = 1;
      if (n > max) n = max;
      people.value = String(n);
      $('[data-people-max]').textContent = max === 1 ? 'One place left on this date.' : 'Up to ' + max + ' people on one request for this date.';
      $('[data-people-minus]').disabled = n <= 1;
      $('[data-people-plus]').disabled = n >= max;
    }
    function paintSummary() {
      const x = chosen();
      const n = parseInt(people.value, 10) || 1;
      $('[data-sum-course]').textContent = x.c ? x.c.name : 'No course chosen yet';
      $('[data-sum-date]').textContent = x.s ? sessionDates(x.s) : x.c ? 'Choose a date' : '—';
      $('[data-sum-time]').textContent = x.c ? timeRange(x.c) : '—';
      $('[data-sum-people]').textContent = plural(n, 'person', 'people');
      $('[data-sum-total]').textContent = x.c ? money(x.c.price * n) : '$0';
      $('[data-sum-each]').textContent = x.c ? money(x.c.price) + ' per person, all materials included' : '';
      set$('[data-sum-art]', x.c ? courseArt(x.c) : svgOpen('#ecedda') + '<path d="M110 170h100" stroke="' + INK + '" stroke-width="2"/>' + sprig(160, 170, 3.2) + '</svg>');
    }
    function set$(sel, html) { const el = $(sel); if (el) el.innerHTML = html; }
    function showStep(n, focus) {
      step = n;
      steps.forEach((fs) => { fs.hidden = +fs.getAttribute('data-step') !== n; });
      $$('[data-step-marker]').forEach((li) => {
        const k = +li.getAttribute('data-step-marker');
        if (k === n) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
        li.classList.toggle('is-done', k < n);
      });
      if (focus) {
        const legend = $('[data-step="' + n + '"] [data-step-title]', form);
        if (legend) legend.focus();
      }
    }
    function validateStep(n) {
      let ok = true;
      if (n === 1) {
        if (!courseById(courseSel.value)) ok = setError(form, 'course', 'Choose a course.') && ok;
        else setError(form, 'course', '');
        const x = chosen();
        if (courseById(courseSel.value)) {
          if (!x.s) ok = setError(form, 'session', 'Choose a date for this course.') && ok;
          else if (x.s.left <= 0) ok = setError(form, 'session', 'That date is now full. Please choose another.') && ok;
          else setError(form, 'session', '');
        } else setError(form, 'session', '');
      }
      if (n === 2) {
        const v = people.value.trim();
        const num = Number(v);
        const max = maxPeople();
        if (!/^\d+$/.test(v) || num < 1) ok = setError(form, 'people', 'Enter how many people are coming (at least 1).') && ok;
        else if (num > max) ok = setError(form, 'people', max === 1 ? 'There is only one place left on this date.' : 'There are only ' + max + ' places you can request on this date.') && ok;
        else setError(form, 'people', '');
        if (!$('input[name="experience"]:checked', form)) ok = setError(form, 'experience', 'Tell us roughly how much growing you have done.') && ok;
        else setError(form, 'experience', '');
        if (form.elements.needs.value.length > 500) ok = setError(form, 'needs', 'Please keep this under 500 characters; we can talk about the rest by phone.') && ok;
        else setError(form, 'needs', '');
      }
      if (n === 3) {
        const name = form.elements.name.value.trim();
        ok = setError(form, 'name', name.length < 2 ? 'Enter your full name.' : '') && ok;
        const email = form.elements.email.value.trim();
        ok = setError(form, 'email', !email ? 'Enter your email address.' : !EMAIL.test(email) ? 'Enter an email address like name@example.com.' : '') && ok;
        const phone = form.elements.phone.value.replace(/[\s().-]/g, '');
        ok = setError(form, 'phone', phone && !/^(\+?1)?[2-9]\d{9}$/.test(phone) ? 'Enter a US phone number, like (541) 555-0179, or leave it blank.' : '') && ok;
        ok = setError(form, 'terms', form.elements.terms.checked ? '' : 'Please confirm you have read the booking terms.') && ok;
      }
      return ok;
    }
    courseSel.addEventListener('change', () => { renderSessions(); setError(form, 'course', ''); setError(form, 'session', ''); clampPeople(); paintSummary(); });
    list.addEventListener('change', () => { setError(form, 'session', ''); clampPeople(); paintSummary(); });
    people.addEventListener('input', paintSummary);
    people.addEventListener('change', () => { clampPeople(); paintSummary(); });
    $('[data-people-minus]').addEventListener('click', () => { people.value = String((parseInt(people.value, 10) || 1) - 1); clampPeople(); paintSummary(); setError(form, 'people', ''); });
    $('[data-people-plus]').addEventListener('click', () => { people.value = String((parseInt(people.value, 10) || 0) + 1); clampPeople(); paintSummary(); setError(form, 'people', ''); });
    // Clear a field's error as soon as it's fixed.
    form.addEventListener('input', (e) => {
      const t = e.target;
      if (t.getAttribute && t.getAttribute('aria-invalid') === 'true' && t.name && t.name !== 'people') setError(form, t.name, '');
    });
    $$('[data-next]', form).forEach((b) => b.addEventListener('click', () => {
      if (!validateStep(step)) { focusFirstError(form); return; }
      showStep(step + 1, true);
    }));
    $$('[data-back]', form).forEach((b) => b.addEventListener('click', () => showStep(step - 1, true)));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      // Enter in a field of an earlier step moves on rather than submitting.
      if (step < 3) {
        if (!validateStep(step)) { focusFirstError(form); return; }
        showStep(step + 1, true);
        return;
      }
      if (!validateStep(3)) { focusFirstError(form); return; }
      const x = chosen();
      if (!x.s || x.s.left <= 0) { showStep(1, true); validateStep(1); focusFirstError(form); return; }
      const n = Math.min(parseInt(people.value, 10) || 1, x.s.left);
      // Connect a real booking system here: send new FormData(form) with fetch() to your form service
      // or booking tool, and only show the confirmation once response.ok is true (see DOCS.md, Forms).
      const ref = 'LS-' + String(1000 + hash(x.c.id + x.s.key + Date.now()) % 9000);
      const name = form.elements.name.value.trim().slice(0, 80);
      enrolments.push({ ref: ref, course: x.c.id, date: x.s.key, people: n, name: name, made: TODAY });
      saveEnrolments();
      form.hidden = true;
      $('[data-enrol-steps]').hidden = true;
      const done = $('[data-enrol-done]');
      $('[data-done-name]').textContent = name.split(/\s+/)[0];
      $('[data-done-ref]').textContent = ref;
      $('[data-done-detail]').textContent = plural(n, 'place') + ' on ' + x.c.name + ', ' + sessionDates(x.s) + ', ' + timeRange(x.c) + '. Total ' + money(x.c.price * n) + '.';
      $('[data-done-email]').textContent = form.elements.email.value.trim();
      $('[data-done-left]').textContent = placesText(sessionByKey(x.c, x.s.key).left) + ' on this date now.';
      done.hidden = false;
      done.focus();
      paintSummary();
    });
    renderSessions(validKey(param('session')) ? param('session') : '');
    // A link with an unknown course or a date that has gone: say so, and let them choose again.
    const note = $('[data-enrol-note]');
    if (param('course') && !startCourse) {
      note.textContent = 'We couldn’t match the course in your link. Please choose one below.';
      note.hidden = false;
    } else if (startCourse && param('session') && !sessionByKey(startCourse, param('session'))) {
      note.textContent = 'The date in your link isn’t available any more. Please choose one of the next dates below.';
      note.hidden = false;
    }
    clampPeople();
    paintSummary();
    showStep(1, false);
  })();

  /* ------------------------------------------------------------------
   * 12. Bed planner (planner.html?crop=<id>)
   * ------------------------------------------------------------------ */
  // Plant marks for the plan drawing, centered on 0,0 in a 20 × 20 cell.
  const MARKS = {
    rosette: '<circle r="7" fill="#9fb26f" stroke="#1f3a2e" stroke-width="1.2"/><path d="M0-6C-3-2-3 2 0 6M-6 0C-2-3 2-3 6 0" fill="none" stroke="#1f3a2e" stroke-width="1"/>',
    root: '<path d="M0-1c-5 0-6 4-4 7 2 3 2 4 4 4s2-1 4-4c2-3 1-7-4-7Z" fill="#a84325" stroke="#1f3a2e" stroke-width="1.1"/><path d="M0-1V-8M0-3l-4-4M0-3l4-4" stroke="#6b8550" stroke-width="1.6" fill="none"/>',
    kale: '<path d="M0 8V-6M0 2c-6 0-8-4-8-9 5 0 8 3 8 9ZM0 0c6 0 8-5 8-9-5 0-8 3-8 9Z" fill="#6b8550" stroke="#1f3a2e" stroke-width="1.1"/>',
    bean: '<path d="M-5 6c-3-4 0-12 5-12s8 8 5 12" fill="none" stroke="#1f3a2e" stroke-width="1.2"/><ellipse cx="-2" cy="-1" rx="2.2" ry="5" fill="#9fb26f" stroke="#1f3a2e"/><ellipse cx="3" cy="1" rx="2.2" ry="5" fill="#9fb26f" stroke="#1f3a2e"/>',
    bulb: '<path d="M0-8C-1-4-6-1-6 3c0 3 3 5 6 5s6-2 6-5c0-4-5-7-6-11Z" fill="#fffdf6" stroke="#1f3a2e" stroke-width="1.1"/><path d="M0-8V4" stroke="#c9cdb5"/>',
    chard: '<path d="M-2 8 -4-5M2 8 4-5" stroke="#a84325" stroke-width="2"/><ellipse cx="-4" cy="-4" rx="3.5" ry="5" fill="#6b8550" stroke="#1f3a2e"/><ellipse cx="4" cy="-4" rx="3.5" ry="5" fill="#6b8550" stroke="#1f3a2e"/>',
    courgette: '<circle r="8.5" fill="#9fb26f" stroke="#1f3a2e" stroke-width="1.2"/><path d="M-8 0H8M0-8V8M-6-6 6 6M-6 6 6-6" stroke="#1f3a2e" stroke-width=".7"/><circle r="2.6" fill="#f1dfb2" stroke="#a84325"/>'
  };
  (function planner() {
    const form = $('[data-planner]');
    if (!form) return;
    const wIn = form.elements.namedItem('width'), lIn = form.elements.namedItem('length'), cropSel = form.elements.namedItem('crop');
    const saved = store.get(STORAGE.planner);
    if (saved && typeof saved === 'object' && hasOwn(CROPS, saved.crop) &&
      typeof saved.w === 'number' && typeof saved.l === 'number' &&
      saved.w >= PLANNER_LIMITS.min && saved.w <= PLANNER_LIMITS.max && saved.l >= PLANNER_LIMITS.min && saved.l <= PLANNER_LIMITS.max) {
      wIn.value = String(saved.w); lIn.value = String(saved.l); cropSel.value = saved.crop;
    }
    if (hasOwn(CROPS, param('crop'))) cropSel.value = param('crop');

    function readMetres(input, label) {
      const raw = input.value.trim().replace(',', '.');
      const v = Number(raw);
      if (!raw) return { error: 'Enter the ' + label + ' in feet.' };
      if (!Number.isFinite(v)) return { error: 'Enter the ' + label + ' as a number of feet, like 4.' };
      if (v < PLANNER_LIMITS.min || v > PLANNER_LIMITS.max) return { error: 'Enter a ' + label + ' between ' + PLANNER_LIMITS.min + ' and ' + PLANNER_LIMITS.max + ' feet.' };
      return { value: Math.round(v * 100) / 100 };
    }
    function calculate(focusError) {
      const w = readMetres(wIn, 'width'), l = readMetres(lIn, 'length');
      let ok = setError(form, 'width', w.error || '');
      ok = setError(form, 'length', l.error || '') && ok;
      const cropOk = hasOwn(CROPS, cropSel.value);
      ok = setError(form, 'crop', cropOk ? '' : 'Choose a crop.') && ok;
      if (!ok) { if (focusError) focusFirstError(form); return; }
      const crop = CROPS[cropSel.value];
      const cm = crop.spacing;
      // Plants sit in the middle of equal square cells, so a 4 ft bed at 12 in holds 4 across. Beds are in feet, spacing in inches.
      const across = Math.floor((w.value * 12 + 1e-6) / cm), along = Math.floor((l.value * 12 + 1e-6) / cm);
      const count = across * along;
      store.set(STORAGE.planner, { w: w.value, l: l.value, crop: cropSel.value });
      const result = $('[data-plan-result]');
      const zero = $('[data-plan-zero]');
      if (!count) {
        result.hidden = true;
        zero.hidden = false;
        const narrow = across === 0 && along === 0 ? 'too small' : across === 0 ? 'too narrow' : 'too short';
        $('[data-plan-zero-text]').textContent = 'A ' + fmtM(w.value) + ' × ' + fmtM(l.value) + ' bed is ' + narrow + ' for ' + crop.name.toLowerCase() + ' at ' + cm + ' in spacing. Make it at least ' + fmtM(cm / 12) + ' each way, or choose a crop that sits closer together.';
        drawPlan(0, 0, crop, w.value, l.value);
        paintSuggestion(crop);
        return;
      }
      result.hidden = false;
      zero.hidden = true;
      $('[data-plant-count]').textContent = plural(count, 'plant');
      $('[data-plant-detail]').textContent = plural(across, 'plant') + ' across × ' + along + ' along, ' + cm + ' in apart, in a ' + fmtM(w.value) + ' × ' + fmtM(l.value) + ' bed (' + (w.value * l.value).toFixed(2).replace(/\.?0+$/, '') + ' sq ft).';
      const truncated = across > DRAW_MAX.across || along > DRAW_MAX.along;
      const note = $('[data-plan-truncated]');
      note.hidden = !truncated;
      if (truncated) {
        const a = Math.min(across, DRAW_MAX.across), b = Math.min(along, DRAW_MAX.along);
        note.textContent = 'The drawing shows one corner of the bed (' + a + ' × ' + b + ' = ' + (a * b) + ' plants). The full bed holds ' + count + '.';
      }
      drawPlan(across, along, crop, w.value, l.value);
      paintSuggestion(crop);
    }
    function fmtM(m) { return (Math.round(m * 100) / 100) + ' ft'; }
    function drawPlan(across, along, crop, w, l) {
      const box = $('[data-plant-grid]');
      const a = Math.min(across, DRAW_MAX.across), b = Math.min(along, DRAW_MAX.along);
      const cell = 20;
      // Draw the bed to scale (width across, length down), or the shown corner of it.
      const shownW = across > DRAW_MAX.across ? a * crop.spacing / 12 : w;
      const shownL = along > DRAW_MAX.along ? b * crop.spacing / 12 : l;
      const scale = Math.min(320 / shownW, 420 / shownL);
      const W = Math.max(40, shownW * scale), H = Math.max(40, shownL * scale);
      const cw = a ? (crop.spacing / 12) * scale : 0;
      let marks = '';
      const s = Math.min(1.4, Math.max(0.35, cw / cell));
      for (let r = 0; r < b; r++) for (let i = 0; i < a; i++) {
        marks += '<g transform="translate(' + (12 + cw * (i + 0.5)).toFixed(1) + ' ' + (12 + cw * (r + 0.5)).toFixed(1) + ') scale(' + s.toFixed(2) + ')">' + MARKS[crop.mark] + '</g>';
      }
      let grid = '';
      for (let i = 1; i < a; i++) grid += '<path d="M' + (12 + cw * i).toFixed(1) + ' 12V' + (12 + H).toFixed(1) + '"/>';
      for (let r = 1; r < b; r++) grid += '<path d="M12 ' + (12 + cw * r).toFixed(1) + 'H' + (12 + W).toFixed(1) + '"/>';
      box.innerHTML = '<svg viewBox="0 0 ' + (W + 24).toFixed(0) + ' ' + (H + 24).toFixed(0) + '" class="mx-auto block h-auto max-h-[28rem] w-full max-w-[22rem]" aria-hidden="true" focusable="false">' +
        '<rect x="12" y="12" width="' + W.toFixed(1) + '" height="' + H.toFixed(1) + '" fill="#8a6a50" stroke="#1f3a2e" stroke-width="2"/>' +
        '<g stroke="#f1dfb2" stroke-opacity=".35" stroke-dasharray="3 3">' + grid + '</g>' + marks +
        ((across > DRAW_MAX.across || along > DRAW_MAX.along) ? '<path d="M' + (12 + W) + ' 12v' + H + 'M12 ' + (12 + H) + 'h' + W + '" stroke="#f6f4e9" stroke-width="4" stroke-dasharray="6 5"/>' : '') + '</svg>';
      $('[data-plan-caption]').textContent = a && b ? 'Plan view: ' + crop.name.toLowerCase() + ', one mark per plant.' : 'Plan view: the bed is smaller than one ' + crop.spacing + ' in planting square.';
    }
    function paintSuggestion(crop) {
      const c = courseById(crop.course);
      $('[data-suggest-name]').textContent = c.name;
      $('[data-suggest-name]').href = 'course.html?course=' + c.id;
      $('[data-suggest-why]').textContent = 'Learn to grow ' + crop.name.toLowerCase() + ' with ' + TUTORS[c.tutor].name.split(' ')[0] + '. Next date: ' + sessionDates(sessionsFor(c, 1)[0], true) + '.';
      const btn = $('[data-suggest-save]');
      btn.setAttribute('data-save', c.id);
      paintShortlist();
    }
    form.addEventListener('submit', (e) => { e.preventDefault(); calculate(true); });
    cropSel.addEventListener('change', () => calculate(false));
    calculate(false);
  })();

  /* ------------------------------------------------------------------
   * 13. Shortlist page (saved.html)
   * ------------------------------------------------------------------ */
  function renderSavedPage() {
    const grid = $('[data-saved-grid]');
    if (!grid) return;
    const active = document.activeElement;
    const hadFocus = grid.contains(active);
    grid.innerHTML = shortlist.map((id) => courseCard(courseById(id), 'h3')).join('');
    $('[data-saved-count]').textContent = shortlist.length ? plural(shortlist.length, 'course') + ' on your shortlist' : 'Your shortlist is empty';
    $('[data-saved-empty]').hidden = shortlist.length > 0;
    $('[data-clear-saved]').hidden = shortlist.length === 0;
    if (hadFocus) {
      const target = $('[data-save]', grid) || $('[data-saved-empty] a');
      if (target) target.focus();
    }
    const req = $('[data-requests]');
    const reqs = enrolments.slice().sort((a, b) => a.date < b.date ? -1 : 1);
    req.innerHTML = reqs.map((e) => {
      const c = courseById(e.course);
      const s = sessionByKey(c, e.date) || { dates: [e.date], key: e.date };
      return '<li class="flex flex-wrap items-center justify-between gap-3 border-b border-line py-4"><div><p class="font-display text-xl font-medium">' + esc(c.name) + '</p><p class="text-sm text-muted">' + sessionDates(s) + ', ' + timeRange(c) + ' · ' + plural(e.people, 'place') + ' · ' + money(c.price * e.people) + ' · Ref. ' + e.ref + '</p></div>' +
        '<button type="button" class="btn btn-ghost btn-sm" data-remove-request="' + e.ref + '" aria-label="Remove request ' + e.ref + ' for ' + esc(c.name) + '">Remove</button></li>';
    }).join('');
    $('[data-requests-section]').hidden = reqs.length === 0;
    $('[data-requests-count]').textContent = plural(reqs.length, 'request');
    revealNew();
  }
  (function savedPage() {
    if (!$('[data-saved-grid]')) return;
    $('[data-clear-saved]').addEventListener('click', () => {
      shortlist = [];
      saveShortlist();
      paintShortlist();
      renderSavedPage();
      announce('Your shortlist has been cleared.');
      const a = $('[data-saved-empty] a');
      if (a) a.focus();
    });
    $('[data-requests]').addEventListener('click', (e) => {
      const b = e.target.closest('[data-remove-request]');
      if (!b) return;
      const ref = b.getAttribute('data-remove-request');
      enrolments = enrolments.filter((x) => x.ref !== ref);
      saveEnrolments();
      renderSavedPage();
      announce('Request ' + ref + ' removed from this device.');
      const next = $('[data-remove-request]') || $('[data-saved-heading]');
      if (next) next.focus();
    });
    renderSavedPage();
  })();

  /* ------------------------------------------------------------------
   * 14. Inquiry form (visit.html?topic=<course id|visit|access|group>)
   * ------------------------------------------------------------------ */
  (function enquiry() {
    const form = $('[data-enquiry-form]');
    if (!form) return;
    const topic = form.elements.topic;
    const group = $('[data-topic-courses]', form);
    if (group) group.innerHTML = COURSES.map((c) => '<option value="' + c.id + '">' + esc(c.name) + '</option>').join('');
    const t = param('topic');
    if (t && $$('option', topic).some((o) => o.value === t)) topic.value = t;
    form.addEventListener('input', (e) => {
      const el = e.target;
      if (el.getAttribute && el.getAttribute('aria-invalid') === 'true' && el.name) setError(form, el.name, '');
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.elements.name.value.trim(), email = form.elements.email.value.trim(), msg = form.elements.message.value.trim();
      let ok = setError(form, 'name', name.length < 2 ? 'Enter your name.' : '');
      ok = setError(form, 'email', !email ? 'Enter your email address.' : !EMAIL.test(email) ? 'Enter an email address like name@example.com.' : '') && ok;
      ok = setError(form, 'message', msg.length < 10 ? 'Tell us a little more (at least 10 characters).' : msg.length > 1500 ? 'Please keep your message under 1,500 characters.' : '') && ok;
      if (!ok) { focusFirstError(form); return; }
      // Connect a form service here (for example Formspree): fetch(form.action, { method: 'POST',
      // body: new FormData(form), headers: { Accept: 'application/json' } }), then show the thanks
      // only when response.ok is true. See DOCS.md, Forms.
      form.hidden = true;
      const done = $('[data-enquiry-done]');
      $('[data-enquiry-name]').textContent = name.split(/\s+/)[0];
      $('[data-enquiry-ref]').textContent = makeRef('LS');
      done.hidden = false;
      done.focus();
    });
    $('[data-enquiry-again]').addEventListener('click', () => {
      form.reset();
      form.hidden = false;
      $('[data-enquiry-done]').hidden = true;
      form.elements.name.focus();
    });
  })();

  /* ------------------------------------------------------------------
   * 15. Header, mobile menu, scroll reveal, year
   * ------------------------------------------------------------------ */
  (function menu() {
    const btn = $('#menu-button'), panel = $('#mobile-menu');
    if (!btn || !panel) return;
    function setMenu(open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      panel.hidden = !open;
      $('[data-icon-open]', btn).classList.toggle('hidden', open);
      $('[data-icon-close]', btn).classList.toggle('hidden', !open);
    }
    btn.addEventListener('click', () => setMenu(btn.getAttribute('aria-expanded') !== 'true'));
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setMenu(false); btn.focus(); }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (m) => { if (m.matches) setMenu(false); });
  })();

  const header = $('#site-header');
  if (header) {
    const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  $$('[data-year]').forEach((el) => { el.textContent = TODAY.slice(0, 4); });

  // Scroll reveal. Anything above the fold (or above a revealed item) is shown at once.
  function revealAbove(el) {
    $$('.reveal:not(.is-visible)').forEach((x) => {
      if (x === el || x.getBoundingClientRect().top <= el.getBoundingClientRect().top) { x.classList.add('is-visible'); if (observer) observer.unobserve(x); }
    });
  }
  function revealNew() {
    const items = $$('.reveal:not(.is-visible)');
    if (reduceMotion || !('IntersectionObserver' in window)) { items.forEach((x) => x.classList.add('is-visible')); return; }
    if (!observer) {
      observer = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) revealAbove(en.target); }), { rootMargin: '0px 0px -40px 0px' });
    }
    items.forEach((x) => {
      if (x.getBoundingClientRect().top < window.innerHeight) x.classList.add('is-visible');
      else observer.observe(x);
    });
  }
  paintShortlist();
  revealNew();
})();
