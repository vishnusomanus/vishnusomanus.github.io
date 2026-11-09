/* Academy — site scripts. Vanilla JavaScript, no dependencies.
   Course, instructor and path data live in DATA below: edit it to make the
   catalog your own. Every page reads from the same data. */
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

  // The school's name, used in every page title this script sets (course, instructor and lesson
  // pages). Change it together with the name in the HTML pages' <title> and header/footer.
  var SITE_NAME = 'Northfield Academy';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var page = document.body.getAttribute('data-page') || '';

  /* ======================================================================
     Helpers
     ====================================================================== */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(n) { return Number(n).toLocaleString('en-US'); }
  function param(name) { return new URLSearchParams(window.location.search).get(name); }
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  // Small deterministic random generator, so generated art and durations never change.
  function rng(seed) {
    var s = seed || 1;
    return function () { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
  }
  function readJSON(key) {
    try { var raw = safeStorage.getItem(key); return raw ? JSON.parse(raw) : null; } catch (e) { return null; }
  }
  function writeJSON(key, value) {
    try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
  }
  var uid = 0;
  function nextId(prefix) { uid += 1; return prefix + '-' + uid; }

  /* ======================================================================
     Data: topics, instructors, courses and learning paths
     ====================================================================== */
  var TOPICS = {
    design:   { name: 'Design',   bg: '#ffe1d6', fg: '#e8553b', deep: '#7a2414', alt: '#ffc6b0' },
    frontend: { name: 'Frontend', bg: '#dbe8ff', fg: '#3567e8', deep: '#16306f', alt: '#b9d0ff' },
    backend:  { name: 'Backend',  bg: '#ebe2ff', fg: '#7a4ff0', deep: '#341a7a', alt: '#d4c4ff' },
    data:     { name: 'Data',     bg: '#fff0c2', fg: '#e09400', deep: '#6b4400', alt: '#ffe08a' },
    product:  { name: 'Product',  bg: '#d4f5ec', fg: '#16a085', deep: '#0b4d40', alt: '#a7ead8' }
  };

  // Topic label colors (AA contrast in light and dark).
  var TOPIC_TEXT = {
    design: 'text-[#9a3412] dark:text-[#ffb59c]',
    frontend: 'text-[#1d4ed8] dark:text-[#a8c4ff]',
    backend: 'text-[#6d28d9] dark:text-[#cdb8ff]',
    data: 'text-[#7c5100] dark:text-[#ffd76a]',
    product: 'text-[#0f6b63] dark:text-[#8fe5cf]'
  };

  var INSTRUCTORS = [
    { id: 'amara', name: 'Amara Okoye', role: 'Design lead, ex-Lumen Studio', topic: 'design', skin: '#8d5a3c', hair: '#1e1410', style: 0, rating: 4.9, students: 70500,
      bio: 'Amara has spent twelve years designing products used by millions, and the last five building design systems for teams of every size. She teaches the way she works: small steps, real files and plenty of critique.',
      tags: ['Design systems', 'Figma', 'UI craft'] },
    { id: 'leo', name: 'Leo Brandt', role: 'Frontend engineer and CSS nerd', topic: 'frontend', skin: '#f0c9a8', hair: '#c9862e', style: 1, rating: 4.8, students: 31100,
      bio: 'Leo builds fast, accessible interfaces and writes about CSS that does more with less. He has reviewed thousands of pull requests and still gets excited about a well-placed grid.',
      tags: ['CSS', 'Accessibility', 'Performance'] },
    { id: 'priya', name: 'Priya Raman', role: 'Staff engineer, React core contributor', topic: 'frontend', skin: '#b07650', hair: '#2a1712', style: 2, rating: 4.9, students: 30400,
      bio: 'Priya leads a platform team and has shipped React apps since the early days. Her courses skip the trivia and focus on the mental models that make hard bugs easy.',
      tags: ['React', 'TypeScript', 'Architecture'] },
    { id: 'marcus', name: 'Marcus Hale', role: 'Backend architect', topic: 'backend', skin: '#5e3a26', hair: '#141010', style: 3, rating: 4.8, students: 24600,
      bio: 'Marcus designs APIs and distributed systems for payments and logistics companies. He explains trade-offs with diagrams, war stories and very few buzzwords.',
      tags: ['APIs', 'Node.js', 'System design'] },
    { id: 'hana', name: 'Hana Sato', role: 'Data scientist and educator', topic: 'data', skin: '#f1d0b5', hair: '#16120f', style: 4, rating: 4.8, students: 101300,
      bio: 'Hana turns messy spreadsheets into decisions. She has taught data skills to analysts, nurses and newsrooms, and believes everyone deserves a good chart.',
      tags: ['SQL', 'Python', 'Data viz'] },
    { id: 'sofia', name: 'Sofia Lindgren', role: 'Director of product', topic: 'product', skin: '#f3d2bd', hair: '#d8b06a', style: 5, rating: 4.7, students: 16200,
      bio: 'Sofia has led product teams from first prototype to IPO. She teaches discovery as a habit, not a phase, with templates you can use on Monday.',
      tags: ['Discovery', 'Research', 'Strategy'] }
  ];

  var COURSES = [
    { id: 'design-systems', title: 'Design Systems from Figma to Code', topic: 'design', level: 'Intermediate', hours: 9, price: 89, rating: 4.9, reviews: 2140, students: 18400, instructor: 'amara', badge: 'Bestseller', updated: 'Sep 2026',
      summary: 'Build a design system your team will actually use: tokens, components and documentation, from Figma all the way to production code.',
      outcomes: ['Define color, type and spacing tokens that scale', 'Design flexible components with variants and states', 'Hand off to code with tokens in CSS and React', 'Document, version and govern a living system'],
      modules: ['Foundations and audit', 'Design tokens', 'Components that flex', 'From Figma to code', 'Documentation and adoption'],
      lessons: [['Why design systems fail', 'Running a UI audit', 'Choosing your scope', 'Setting up the Figma file'], ['Color tokens', 'Type scales', 'Spacing and sizing', 'Naming that lasts', 'Theming and dark mode'], ['Anatomy of a button', 'Variants and properties', 'Forms and inputs', 'Layout components', 'States and edge cases'], ['Exporting tokens', 'Tokens in CSS', 'Building components in React', 'Visual regression tests'], ['Writing usage guidelines', 'Versioning and releases', 'Measuring adoption', 'Your capstone system']] },
    { id: 'ui-foundations', title: 'UI Design Foundations', topic: 'design', level: 'Beginner', hours: 6, price: 0, rating: 4.8, reviews: 3810, students: 52100, instructor: 'amara', badge: 'Free', updated: 'Aug 2026',
      summary: 'Learn the fundamentals of layout, typography, color and hierarchy by redesigning three real screens.',
      outcomes: ['Use grids and spacing with confidence', 'Pick and pair typefaces', 'Build accessible color palettes', 'Critique and iterate on your own work'],
      modules: ['Seeing like a designer', 'Layout and spacing', 'Typography', 'Color', 'Your first redesign'] },
    { id: 'modern-css', title: 'Modern CSS Layout', topic: 'frontend', level: 'Beginner', hours: 5, price: 49, rating: 4.8, reviews: 1920, students: 21300, instructor: 'leo', updated: 'Sep 2026',
      summary: 'Flexbox, grid, container queries and fluid type, taught through ten small layouts you will reuse forever.',
      outcomes: ['Choose between flexbox and grid', 'Build intrinsic, responsive layouts', 'Use container queries and clamp()', 'Debug layout with browser tools'],
      modules: ['The box model, revisited', 'Flexbox in practice', 'Grid in practice', 'Responsive without breakpoints', 'Layout recipes'] },
    { id: 'react-from-scratch', title: 'React from Scratch', topic: 'frontend', level: 'Intermediate', hours: 12, price: 99, rating: 4.9, reviews: 2860, students: 30400, instructor: 'priya', badge: 'Bestseller', updated: 'Sep 2026',
      summary: 'Understand React deeply by rebuilding its core ideas, then ship a real app with modern patterns and TypeScript.',
      outcomes: ['Think in components and state', 'Master effects, refs and data fetching', 'Structure apps that stay maintainable', 'Test components with confidence'],
      modules: ['Components and JSX', 'State and events', 'Effects and data', 'Patterns that scale', 'Shipping the app'] },
    { id: 'accessible-web', title: 'Accessible Web Apps', topic: 'frontend', level: 'Intermediate', hours: 4, price: 59, rating: 4.9, reviews: 870, students: 9800, instructor: 'leo', badge: 'New', updated: 'Oct 2026',
      summary: 'Make interfaces that work for everyone: semantics, keyboard support, screen readers and accessible components.',
      outcomes: ['Write semantic, accessible markup', 'Support keyboard and screen readers', 'Build accessible dialogs, tabs and menus', 'Test with real assistive tech'],
      modules: ['Why accessibility', 'Semantics first', 'Keyboard and focus', 'Accessible components', 'Testing and auditing'] },
    { id: 'node-apis', title: 'Building APIs with Node.js', topic: 'backend', level: 'Intermediate', hours: 10, price: 89, rating: 4.7, reviews: 1210, students: 14200, instructor: 'marcus', updated: 'Jul 2026',
      summary: 'Design, build and deploy a production-ready REST API with validation, auth, testing and observability.',
      outcomes: ['Design clear, versioned REST APIs', 'Validate input and handle errors well', 'Add authentication and rate limits', 'Test, deploy and monitor your API'],
      modules: ['API design', 'Routing and validation', 'Data and persistence', 'Auth and security', 'Testing and deployment'] },
    { id: 'sql-essentials', title: 'SQL Essentials', topic: 'data', level: 'Beginner', hours: 3, price: 0, rating: 4.8, reviews: 4020, students: 61800, instructor: 'hana', badge: 'Free', updated: 'Sep 2026',
      summary: 'Go from zero to confident queries: filtering, joins, grouping and window functions on real datasets.',
      outcomes: ['Query and filter tables', 'Join data from many tables', 'Summarize with GROUP BY', 'Use window functions'],
      modules: ['Your first query', 'Filtering and sorting', 'Joins', 'Aggregation', 'Window functions'] },
    { id: 'data-viz', title: 'Data Visualization that Tells a Story', topic: 'data', level: 'Intermediate', hours: 7, price: 79, rating: 4.8, reviews: 990, students: 11900, instructor: 'hana', updated: 'Aug 2026',
      summary: 'Choose the right chart, remove the clutter and write the headline: visual storytelling for analysts and designers.',
      outcomes: ['Pick the right chart for the question', 'Design clear, accessible charts', 'Write headlines that land', 'Build a dashboard people use'],
      modules: ['Seeing data', 'Choosing charts', 'Design and color', 'Narrative and headlines', 'Dashboards'] },
    { id: 'python-data', title: 'Python for Data Analysis', topic: 'data', level: 'Beginner', hours: 14, price: 109, rating: 4.7, reviews: 2450, students: 27600, instructor: 'hana', updated: 'Jun 2026',
      summary: 'Learn Python the analyst’s way: notebooks, pandas, cleaning messy data and answering real business questions.',
      outcomes: ['Write Python with confidence', 'Clean and reshape data with pandas', 'Analyze and visualize datasets', 'Share reproducible notebooks'],
      modules: ['Python basics', 'Working with pandas', 'Cleaning data', 'Analysis', 'Communicating results'] },
    { id: 'product-discovery', title: 'Product Discovery in Practice', topic: 'product', level: 'Intermediate', hours: 5, price: 69, rating: 4.6, reviews: 640, students: 7300, instructor: 'sofia', updated: 'Aug 2026',
      summary: 'Find problems worth solving with continuous discovery: interviews, opportunity trees and quick experiments.',
      outcomes: ['Run weekly customer interviews', 'Map opportunities and assumptions', 'Design fast, cheap experiments', 'Bring stakeholders along'],
      modules: ['Discovery as a habit', 'Interviewing', 'Opportunity mapping', 'Experiments', 'Deciding and sharing'] },
    { id: 'ux-research', title: 'UX Research Methods', topic: 'product', level: 'Beginner', hours: 4, price: 59, rating: 4.7, reviews: 760, students: 8900, instructor: 'sofia', updated: 'May 2026',
      summary: 'Plan and run usability tests, surveys and interviews, then turn findings into decisions your team acts on.',
      outcomes: ['Choose the right research method', 'Plan and run usability tests', 'Synthesize findings quickly', 'Present research that drives action'],
      modules: ['Research questions', 'Usability testing', 'Interviews and surveys', 'Synthesis', 'Sharing insights'] },
    { id: 'system-design', title: 'System Design for Web Engineers', topic: 'backend', level: 'Advanced', hours: 16, price: 129, rating: 4.8, reviews: 980, students: 10400, instructor: 'marcus', badge: 'New', updated: 'Oct 2026',
      summary: 'Design systems that survive real traffic: caching, queues, databases, consistency and the trade-offs between them.',
      outcomes: ['Estimate load and capacity', 'Choose databases and caches', 'Design for failure and scale', 'Communicate designs clearly'],
      modules: ['Thinking in systems', 'Storage and caching', 'Queues and events', 'Scaling and reliability', 'Design reviews'] }
  ];

  var PATHS = [
    { id: 'product-designer', name: 'Product Designer', topic: 'design', weeks: 12, blurb: 'From design fundamentals to shipping a design system, with research and accessibility along the way.', courses: ['ui-foundations', 'ux-research', 'accessible-web', 'design-systems'] },
    { id: 'frontend-developer', name: 'Frontend Developer', topic: 'frontend', weeks: 14, blurb: 'Modern CSS, accessible components and React, finished with a design system you build yourself.', courses: ['modern-css', 'accessible-web', 'react-from-scratch', 'design-systems'] },
    { id: 'data-analyst', name: 'Data Analyst', topic: 'data', weeks: 10, blurb: 'Query, analyze and visualize data with SQL and Python, then tell the story behind the numbers.', courses: ['sql-essentials', 'python-data', 'data-viz'] },
    { id: 'fullstack-engineer', name: 'Full-stack Engineer', topic: 'backend', weeks: 18, blurb: 'Build the whole thing: layouts, React apps, APIs and the system design to keep them running.', courses: ['modern-css', 'react-from-scratch', 'node-apis', 'system-design'] }
  ];

  var LESSON_PATTERN = ['Why it matters', 'Core ideas', 'Guided walkthrough', 'Hands-on exercise', 'Recap and quiz'];

  function findCourse(id) { return COURSES.filter(function (c) { return c.id === id; })[0] || null; }
  function findInstructor(id) { return INSTRUCTORS.filter(function (i) { return i.id === id; })[0] || null; }

  // Modules and lessons for a course. Lesson durations add up to the course length.
  var curriculumCache = {};
  function curriculum(course) {
    if (curriculumCache[course.id]) return curriculumCache[course.id];
    var r = rng(hash(course.id));
    var modules = course.modules.map(function (title, mi) {
      var names = course.lessons ? course.lessons[mi] : LESSON_PATTERN.map(function (p) { return p; });
      return { id: 'm' + (mi + 1), title: title, lessons: names.map(function (name, li) {
        return { id: 'm' + (mi + 1) + '-l' + (li + 1), title: course.lessons ? name : name + ': ' + title, weight: 0.6 + r() };
      }) };
    });
    var total = 0;
    modules.forEach(function (m) { m.lessons.forEach(function (l) { total += l.weight; }); });
    modules.forEach(function (m, mi) {
      m.lessons.forEach(function (l, li) {
        l.min = Math.max(4, Math.round(l.weight / total * course.hours * 60));
        l.preview = mi === 0 && li < 2;
        delete l.weight;
      });
      m.min = m.lessons.reduce(function (s, l) { return s + l.min; }, 0);
    });
    curriculumCache[course.id] = modules;
    return modules;
  }
  function allLessons(course) {
    var out = [];
    curriculum(course).forEach(function (m) { m.lessons.forEach(function (l) { out.push(l); }); });
    return out;
  }
  function lessonCount(course) { return allLessons(course).length; }
  function minutes(min) { var h = Math.floor(min / 60), m = min % 60; return h ? h + ' h ' + (m ? m + ' min' : '') : m + ' min'; }
  function priceLabel(course) { return course.price ? '$' + course.price : 'Free'; }

  /* ======================================================================
     Generated art: course covers, instructor portraits, stars, certificates
     ====================================================================== */
  function cover(course, opts) {
    opts = opts || {};
    var t = TOPICS[course.topic];
    var r = rng(hash(course.id + 'art'));
    var id = nextId('cv');
    var shapes = '';
    var x = function (a, b) { return Math.round(a + r() * (b - a)); };
    // A few soft background blobs.
    for (var i = 0; i < 3; i++) shapes += '<circle cx="' + x(20, 300) + '" cy="' + x(10, 190) + '" r="' + x(26, 60) + '" fill="' + t.alt + '" opacity=".7"/>';
    var motif = '';
    // Alternate the two illustrations within each topic.
    var alt = COURSES.filter(function (c) { return c.topic === course.topic; }).indexOf(course) % 2 === 1;
    if (alt) motif = altMotif(course.topic, t, x);
    else if (course.topic === 'design') {
      motif = '<rect x="92" y="46" width="136" height="104" rx="14" fill="#fff"/><rect x="106" y="60" width="52" height="52" rx="26" fill="' + t.fg + '"/><rect x="166" y="60" width="48" height="22" rx="6" fill="' + t.alt + '"/><rect x="166" y="90" width="48" height="22" rx="6" fill="' + t.deep + '" opacity=".85"/><rect x="106" y="122" width="108" height="14" rx="7" fill="' + t.bg + '"/>' +
        '<path d="M232 136 l18 -40 l10 4 l-18 40 z" fill="' + t.deep + '"/><path d="M232 136 l-3 12 l9 -8 z" fill="' + t.fg + '"/>';
    } else if (course.topic === 'frontend') {
      motif = '<rect x="70" y="40" width="180" height="120" rx="14" fill="#fff"/><rect x="70" y="40" width="180" height="24" rx="12" fill="' + t.deep + '"/><circle cx="86" cy="52" r="4" fill="#ff8a7a"/><circle cx="99" cy="52" r="4" fill="#ffd166"/><circle cx="112" cy="52" r="4" fill="#7fd89d"/>' +
        '<rect x="88" y="78" width="' + x(60, 110) + '" height="9" rx="4.5" fill="' + t.fg + '"/><rect x="104" y="96" width="' + x(70, 120) + '" height="9" rx="4.5" fill="' + t.alt + '"/><rect x="104" y="114" width="' + x(40, 90) + '" height="9" rx="4.5" fill="' + t.fg + '" opacity=".6"/><rect x="88" y="132" width="' + x(50, 100) + '" height="9" rx="4.5" fill="' + t.alt + '"/>';
    } else if (course.topic === 'backend') {
      motif = [0, 1, 2].map(function (k) {
        var y = 52 + k * 34;
        return '<rect x="96" y="' + y + '" width="128" height="26" rx="8" fill="' + (k === 1 ? t.fg : '#fff') + '"/><circle cx="110" cy="' + (y + 13) + '" r="4" fill="' + (k === 1 ? '#fff' : t.fg) + '"/><rect x="122" y="' + (y + 10) + '" width="' + x(40, 80) + '" height="6" rx="3" fill="' + (k === 1 ? '#fff' : t.alt) + '" opacity=".9"/>';
      }).join('') + '<path d="M224 65 h26 v68 h-26" fill="none" stroke="' + t.deep + '" stroke-width="3" stroke-dasharray="5 5"/><circle cx="250" cy="99" r="9" fill="' + t.deep + '"/>';
    } else if (course.topic === 'data') {
      var bars = '';
      for (var b = 0; b < 6; b++) { var h = x(26, 96); bars += '<rect x="' + (92 + b * 24) + '" y="' + (150 - h) + '" width="16" height="' + h + '" rx="5" fill="' + (b % 2 ? t.fg : t.deep) + '"/>'; }
      motif = '<rect x="76" y="34" width="168" height="132" rx="14" fill="#fff"/>' + bars + '<path d="M92 ' + x(70, 90) + ' C 140 ' + x(40, 80) + ', 180 ' + x(80, 110) + ', 228 ' + x(40, 60) + '" fill="none" stroke="' + t.fg + '" stroke-width="3" stroke-linecap="round"/>';
    } else {
      var notes = '';
      var cols = ['#fff', t.alt, '#fff', t.fg];
      for (var n = 0; n < 4; n++) notes += '<rect x="' + (84 + (n % 2) * 80) + '" y="' + (40 + Math.floor(n / 2) * 62) + '" width="66" height="52" rx="8" fill="' + cols[n] + '" transform="rotate(' + (x(-6, 6)) + ' ' + (117 + (n % 2) * 80) + ' ' + (66 + Math.floor(n / 2) * 62) + ')"/>';
      motif = notes + '<path d="M150 66 h14 M150 128 h14" stroke="' + t.deep + '" stroke-width="3" stroke-linecap="round"/>';
    }
    return '<svg viewBox="0 0 320 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="' + esc(opts.label || course.title + ' course artwork') + '">' +
      '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + t.bg + '"/><stop offset="1" stop-color="' + t.alt + '"/></linearGradient></defs>' +
      '<rect width="320" height="200" fill="url(#' + id + ')"/>' + shapes + motif + '</svg>';
  }

  // A second illustration per topic, so courses in the same topic look different.
  function altMotif(topic, t, x) {
    if (topic === 'design') {
      return '<rect x="70" y="52" width="180" height="96" rx="16" fill="#fff"/>' +
        [0, 1, 2, 3, 4].map(function (k) { return '<circle cx="' + (102 + k * 29) + '" cy="88" r="12" fill="' + [t.deep, t.fg, t.alt, '#ffd166', '#10241b'][k] + '"/>'; }).join('') +
        '<rect x="90" y="114" width="' + x(80, 120) + '" height="10" rx="5" fill="' + t.bg + '"/><rect x="90" y="130" width="' + x(40, 70) + '" height="6" rx="3" fill="' + t.alt + '"/>';
    }
    if (topic === 'frontend') {
      return '<rect x="96" y="40" width="128" height="120" rx="18" fill="#fff"/><rect x="112" y="58" width="96" height="44" rx="10" fill="' + t.alt + '"/>' +
        '<rect x="112" y="112" width="' + x(50, 80) + '" height="8" rx="4" fill="' + t.deep + '"/><rect x="112" y="128" width="40" height="18" rx="9" fill="' + t.fg + '"/>' +
        '<rect x="174" y="128" width="34" height="18" rx="9" fill="' + t.bg + '"/><circle cx="183" cy="137" r="6" fill="' + t.fg + '"/>';
    }
    if (topic === 'backend') {
      var nodes = [[110, 60], [210, 60], [160, 100], [110, 140], [210, 140]];
      return '<path d="M110 60 L160 100 L210 60 M110 140 L160 100 L210 140" stroke="' + t.deep + '" stroke-width="3" fill="none"/>' +
        nodes.map(function (n, k) { return '<circle cx="' + n[0] + '" cy="' + n[1] + '" r="' + (k === 2 ? 22 : 15) + '" fill="' + (k === 2 ? t.fg : '#fff') + '" stroke="' + t.deep + '" stroke-width="3"/>'; }).join('') +
        '<path d="M152 100 h16 M160 92 v16" stroke="#fff" stroke-width="3" stroke-linecap="round"/>';
    }
    if (topic === 'data') {
      var a = x(110, 160);
      return '<rect x="76" y="34" width="168" height="132" rx="14" fill="#fff"/><circle cx="130" cy="100" r="38" fill="' + t.alt + '"/>' +
        '<path d="M130 100 L130 62 A38 38 0 0 1 ' + (130 + 38 * Math.sin(a * Math.PI / 180)).toFixed(1) + ' ' + (100 - 38 * Math.cos(a * Math.PI / 180)).toFixed(1) + ' Z" fill="' + t.deep + '"/><circle cx="130" cy="100" r="16" fill="#fff"/>' +
        '<rect x="184" y="70" width="44" height="8" rx="4" fill="' + t.deep + '"/><rect x="184" y="90" width="34" height="8" rx="4" fill="' + t.fg + '"/><rect x="184" y="110" width="40" height="8" rx="4" fill="' + t.alt + '"/>';
    }
    return '<rect x="56" y="96" width="208" height="8" rx="4" fill="#fff"/>' +
      [0, 1, 2].map(function (k) {
        var cx = 90 + k * 70;
        return '<circle cx="' + cx + '" cy="100" r="13" fill="' + (k < 2 ? t.deep : '#fff') + '"/><rect x="' + (cx - 30) + '" y="' + (k % 2 ? 122 : 40) + '" width="60" height="38" rx="9" fill="#fff"/><rect x="' + (cx - 20) + '" y="' + ((k % 2 ? 122 : 40) + 12) + '" width="' + x(24, 40) + '" height="6" rx="3" fill="' + t.fg + '"/>';
      }).join('');
  }

  function avatar(person, size) {
    var id = nextId('av');
    var bg = TOPICS[person.topic] ? TOPICS[person.topic].bg : '#dff3e6';
    var hair = person.hair, skin = person.skin;
    var styles = [
      '<path d="M30 46c0-20 12-30 30-30s30 10 30 30c0 6-2 12-4 16-2-14-10-22-26-22s-24 8-26 22c-2-4-4-10-4-16Z" fill="' + hair + '"/><circle cx="60" cy="18" r="11" fill="' + hair + '"/>',
      '<path d="M34 44c0-16 10-26 26-26s26 10 26 26c-6-8-14-12-26-12s-20 4-26 12Z" fill="' + hair + '"/>',
      '<path d="M28 50c0-22 14-34 32-34s32 12 32 34v34c-4 0-8-2-10-6V50c-4-8-12-12-22-12s-18 4-22 12v28c-2 4-6 6-10 6Z" fill="' + hair + '"/>',
      '<path d="M36 40c4-12 12-18 24-18s20 6 24 18c-8-4-16-6-24-6s-16 2-24 6Z" fill="' + hair + '"/>',
      '<path d="M30 52c0-22 12-36 30-36s30 14 30 36c-2-10-8-16-14-18-6 6-18 8-34 6-6 2-10 6-12 12Z" fill="' + hair + '"/>',
      '<path d="M30 50c0-22 14-34 30-34s30 12 30 34c0 14-4 26-8 30V54c-4-10-12-16-22-16s-18 6-22 16v26c-4-4-8-16-8-30Z" fill="' + hair + '"/>'
    ];
    return '<svg viewBox="0 0 120 120" width="' + (size || 64) + '" height="' + (size || 64) + '" role="img" aria-label="Portrait of ' + esc(person.name) + '">' +
      '<defs><clipPath id="' + id + '"><circle cx="60" cy="60" r="60"/></clipPath></defs><g clip-path="url(#' + id + ')">' +
      '<rect width="120" height="120" fill="' + bg + '"/>' +
      '<path d="M18 120c4-22 20-34 42-34s38 12 42 34Z" fill="' + (TOPICS[person.topic] ? TOPICS[person.topic].fg : '#2aa257') + '"/>' +
      '<rect x="52" y="70" width="16" height="18" rx="6" fill="' + skin + '"/>' +
      '<ellipse cx="60" cy="54" rx="22" ry="25" fill="' + skin + '"/>' +
      styles[person.style % styles.length] +
      '<circle cx="52" cy="56" r="2.4" fill="#1b1410"/><circle cx="68" cy="56" r="2.4" fill="#1b1410"/>' +
      '<path d="M53 66c4 4 10 4 14 0" fill="none" stroke="#1b1410" stroke-width="2" stroke-linecap="round"/>' +
      '</g></svg>';
  }

  function stars(rating, size) {
    var id = nextId('st');
    var s = size || 14;
    var star = function (i) { return '<path transform="translate(' + (i * 20) + ' 0)" d="M10 1.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L10 14.9l-5.3 2.7 1-5.8L1.5 7.7l5.9-.9Z"/>'; };
    var row = [0, 1, 2, 3, 4].map(star).join('');
    return '<span class="stars" role="img" aria-label="Rated ' + rating.toFixed(1) + ' out of 5"><svg viewBox="0 0 100 20" width="' + (s * 5) + '" height="' + s + '" aria-hidden="true">' +
      '<defs><clipPath id="' + id + '"><rect width="' + (rating / 5 * 100) + '" height="20"/></clipPath></defs>' +
      '<g fill="currentColor" opacity=".25">' + row + '</g><g fill="currentColor" clip-path="url(#' + id + ')">' + row + '</g></svg></span>';
  }

  function certificate(course, name) {
    var t = TOPICS[course.topic];
    return '<svg viewBox="0 0 560 380" role="img" aria-label="Certificate of completion for ' + esc(course.title) + '">' +
      '<rect width="560" height="380" rx="18" fill="#fbfaf4"/><rect x="14" y="14" width="532" height="352" rx="12" fill="none" stroke="#19693a" stroke-width="2"/>' +
      '<rect x="22" y="22" width="516" height="336" rx="8" fill="none" stroke="#ffc727" stroke-width="1.5" stroke-dasharray="4 6"/>' +
      '<text x="280" y="78" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" font-weight="800" letter-spacing="4" fill="#19693a">NORTHFIELD ACADEMY</text>' +
      '<text x="280" y="122" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="26" font-weight="800" fill="#10241b">Certificate of completion</text>' +
      '<text x="280" y="160" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" fill="#3d5247">This certifies that</text>' +
      '<text x="280" y="200" text-anchor="middle" font-family="Caveat, cursive" font-size="40" font-weight="700" fill="#10241b">' + esc(name) + '</text>' +
      '<text x="280" y="236" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="13" fill="#3d5247">completed ' + esc(course.hours) + ' hours of</text>' +
      '<text x="280" y="262" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="17" font-weight="800" fill="' + t.deep + '">' + esc(course.title) + '</text>' +
      '<circle cx="470" cy="312" r="30" fill="#ffc727"/><circle cx="470" cy="312" r="22" fill="none" stroke="#10241b" stroke-width="1.5" stroke-dasharray="3 4"/><path d="M460 312l7 7 13-14" fill="none" stroke="#10241b" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' +
      '<path d="M70 318h140" stroke="#10241b" stroke-width="1"/><text x="140" y="336" text-anchor="middle" font-family="Plus Jakarta Sans, sans-serif" font-size="10" fill="#3d5247">' + esc(findInstructor(course.instructor).name) + ', instructor</text>' +
      '</svg>';
  }

  /* ======================================================================
     Shared renderers
     ====================================================================== */
  function courseCard(course, opts) {
    opts = opts || {};
    var inst = findInstructor(course.instructor);
    var t = TOPICS[course.topic];
    var badge = course.badge && course.badge !== 'Free' ? '<span class="tag tag-sun absolute top-3 left-3 shadow-sm">' + esc(course.badge) + '</span>' : '';
    return '<article class="course-card group' + (opts.list ? ' is-list' : '') + '">' +
      '<div class="cover">' + cover(course, { label: '' }).replace('role="img" aria-label=""', 'aria-hidden="true"') + badge + '</div>' +
      '<div class="flex flex-1 flex-col p-5">' +
        '<div class="flex flex-wrap items-center gap-1.5"><span class="tag tag-level">' + esc(course.level) + '</span><span class="text-xs font-bold ' + TOPIC_TEXT[course.topic] + '">' + esc(t.name) + '</span></div>' +
        '<h3 class="mt-2.5 text-lg leading-snug font-extrabold tracking-tight text-ink dark:text-white"><a class="stretched focus-visible:outline-none" href="course.html?id=' + encodeURIComponent(course.id) + '">' + esc(course.title) + '</a></h3>' +
        '<p class="mt-1 text-sm muted">' + esc(inst.name) + '</p>' +
        (opts.list ? '<p class="mt-2 hidden text-sm muted sm:block">' + esc(course.summary) + '</p>' : '') +
        '<div class="mt-2.5 flex items-center gap-1.5 text-sm"><span class="font-extrabold">' + course.rating.toFixed(1) + '</span>' + stars(course.rating) + '<span class="muted">(' + fmt(course.reviews) + ')</span></div>' +
        '<div class="mt-auto flex items-center justify-between gap-3 border-t border-ink/10 pt-4 text-sm dark:border-white/10" style="margin-top:auto;padding-top:1rem">' +
          '<span class="muted">' + course.hours + ' h · ' + lessonCount(course) + ' lessons</span>' +
          '<span class="' + (course.price ? 'font-extrabold text-ink dark:text-white' : 'tag tag-free') + '">' + priceLabel(course) + '</span>' +
        '</div>' +
      '</div></article>';
  }

  function instructorCard(inst) {
    var count = COURSES.filter(function (c) { return c.instructor === inst.id; }).length;
    return '<article class="card group relative flex flex-col items-center p-6 text-center transition hover:-translate-y-1 hover:shadow-[0_24px_48px_-28px_rgba(16,36,27,0.45)]">' +
      '<div class="rounded-full ring-4 ring-white dark:ring-night-3">' + avatar(inst, 96) + '</div>' +
      '<h3 class="mt-4 text-lg font-extrabold"><a class="stretched" href="instructor.html?id=' + inst.id + '">' + esc(inst.name) + '</a></h3>' +
      '<p class="mt-1 text-sm muted">' + esc(inst.role) + '</p>' +
      '<p class="mt-3 flex items-center gap-3 text-sm muted"><span><strong class="text-ink dark:text-white">' + inst.rating.toFixed(1) + '</strong> rating</span><span aria-hidden="true">·</span><span>' + count + ' course' + (count === 1 ? '' : 's') + '</span></p>' +
      '</article>';
  }

  function render(target, html) {
    var el = typeof target === 'string' ? $(target) : target;
    if (!el) return null;
    el.innerHTML = html;
    observeReveals(el);
    return el;
  }

  /* ======================================================================
     Progress (localStorage) — validated on every read
     ====================================================================== */
  var PROGRESS_KEY = 'academy-progress';
  var NOTES_KEY = 'academy-notes';
  var DEMO = {
    enrolled: {
      'design-systems': { done: ['m1-l1', 'm1-l2', 'm1-l3', 'm1-l4', 'm2-l1', 'm2-l2', 'm2-l3'], last: 'm2-l4' },
      'react-from-scratch': { done: ['m1-l1', 'm1-l2', 'm1-l3'], last: 'm1-l4' },
      'sql-essentials': { done: allLessons(findCourse('sql-essentials')).map(function (l) { return l.id; }), last: 'm5-l5' }
    },
    streak: { count: 6, last: '' },
    demo: true
  };

  function today() { var d = new Date(); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }

  // Keep only well-formed data: known courses, known lesson ids, sane numbers.
  function cleanProgress(raw) {
    var out = { enrolled: {}, streak: { count: 0, last: '' } };
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
    var enrolled = raw.enrolled && typeof raw.enrolled === 'object' && !Array.isArray(raw.enrolled) ? raw.enrolled : {};
    Object.keys(enrolled).forEach(function (id) {
      var course = findCourse(id);
      var entry = enrolled[id];
      if (!course || !entry || typeof entry !== 'object') return;
      var valid = {};
      allLessons(course).forEach(function (l) { valid[l.id] = true; });
      var done = Array.isArray(entry.done) ? entry.done.filter(function (x, i, arr) { return typeof x === 'string' && valid[x] && arr.indexOf(x) === i; }) : [];
      out.enrolled[id] = { done: done, last: typeof entry.last === 'string' && valid[entry.last] ? entry.last : '' };
    });
    var s = raw.streak;
    if (s && typeof s === 'object') {
      // A count that isn't a whole number from 0 to 3,650 is tampered: the streak starts over.
      var n = s.count;
      if (typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 3650) {
        out.streak.count = n;
        out.streak.last = typeof s.last === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s.last) ? s.last : '';
      }
    }
    if (raw.demo === true) out.demo = true;
    return out;
  }
  function loadProgress() {
    var stored = readJSON(PROGRESS_KEY);
    var clean = cleanProgress(stored);
    if (!clean) {
      if (stored !== null) clearStored(PROGRESS_KEY); // unreadable: start over
      return cleanProgress(DEMO);
    }
    if (JSON.stringify(clean) !== JSON.stringify(stored)) writeJSON(PROGRESS_KEY, clean); // self-heal
    return clean;
  }
  function clearStored(key) { try { safeStorage.removeItem(key); } catch (e) {} }
  function saveProgress(p) { delete p.demo; writeJSON(PROGRESS_KEY, p); }
  // The first real action replaces the sample (demo) progress with the visitor's own.
  function makeOwn(p) {
    if (!p.demo) return;
    p.enrolled = {};
    p.streak = { count: 0, last: '' };
    delete p.demo;
  }
  function courseProgress(p, course) {
    var e = p.enrolled[course.id];
    if (!e) return null;
    var total = lessonCount(course);
    return { done: e.done.length, total: total, pct: Math.round(e.done.length / total * 100), last: e.last };
  }
  function bumpStreak(p) {
    var t = today();
    if (p.streak.last === t) return;
    var y = new Date(); y.setDate(y.getDate() - 1);
    var yesterday = y.getFullYear() + '-' + String(y.getMonth() + 1).padStart(2, '0') + '-' + String(y.getDate()).padStart(2, '0');
    p.streak.count = p.streak.last === yesterday ? p.streak.count + 1 : 1;
    p.streak.last = t;
  }
  function loadNotes() {
    var raw = readJSON(NOTES_KEY);
    var out = {};
    if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
      Object.keys(raw).forEach(function (k) {
        if (/^[a-z0-9-]+\/m\d+-l\d+$/.test(k) && typeof raw[k] === 'string') out[k] = raw[k].slice(0, 5000);
      });
    }
    if (raw !== null && JSON.stringify(out) !== JSON.stringify(raw)) writeJSON(NOTES_KEY, out);
    return out;
  }

  /* ======================================================================
     Global UI
     ====================================================================== */
  // Dark mode: the initial theme is applied by an inline script in <head>.
  function updateThemeLabels() {
    var dark = root.classList.contains('dark');
    $$('[data-theme-toggle]').forEach(function (btn) {
      btn.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      btn.setAttribute('aria-pressed', String(dark));
    });
  }
  $$('[data-theme-toggle]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var dark = root.classList.toggle('dark');
      try { safeStorage.setItem('theme', dark ? 'dark' : 'light'); } catch (e) {}
      updateThemeLabels();
    });
  });
  updateThemeLabels();

  var header = $('#site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  var menuBtn = $('#menu-button');
  var menu = $('#mobile-menu');
  if (menuBtn && menu) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
      $('[data-icon-open]', menuBtn).classList.toggle('hidden', open);
      $('[data-icon-close]', menuBtn).classList.toggle('hidden', !open);
    };
    menuBtn.addEventListener('click', function () { setMenu(menuBtn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') { setMenu(false); menuBtn.focus(); }
    });
    $$('a', menu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', function (e) { if (e.matches) setMenu(false); });
  }

  // Scroll reveal. Revealing an element also reveals everything above it, so a fast
  // jump (End key, anchor link) never leaves content hidden.
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var top = entry.target.getBoundingClientRect().top;
      $$('.reveal:not(.is-visible)').forEach(function (el) {
        if (el === entry.target || el.getBoundingClientRect().top <= top) { el.classList.add('is-visible'); io.unobserve(el); }
      });
      if (entry.target.hasAttribute('data-count')) countUp(entry.target);
      io.unobserve(entry.target);
    });
  }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 }) : null;
  function observeReveals(ctx) {
    $$('.reveal:not(.is-visible), [data-count]', ctx).forEach(function (el) {
      if (io) io.observe(el);
      else { el.classList.add('is-visible'); if (el.hasAttribute('data-count')) countUp(el); }
    });
  }
  function countUp(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    var target = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    var suffix = el.dataset.suffix || '';
    var format = function (n) { return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix; };
    if (reduceMotion) { el.textContent = format(target); return; }
    var start = null;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / 1400, 1);
      el.textContent = format(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Toast messages.
  var toastEl;
  var toastTimer;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      toastEl.setAttribute('role', 'status');
      toastEl.setAttribute('data-toast', '');
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 3200);
  }

  // Accessible tabs: [role=tablist] with [role=tab][aria-controls].
  function setupTabs(list, onChange) {
    var tabs = $$('[role="tab"]', list);
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
      });
      if (focus) tab.focus();
      if (onChange) onChange(tab);
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(tab); });
      tab.addEventListener('keydown', function (e) {
        var n = { ArrowRight: 1, ArrowLeft: -1, Home: -i, End: tabs.length - 1 - i }[e.key];
        if (n === undefined) return;
        e.preventDefault();
        select(tabs[(i + n + tabs.length) % tabs.length], true);
      });
    });
    return select;
  }

  // Forms: inline validation helpers. To send for real, POST new FormData(form) to
  // your endpoint (e.g. Formspree) where the success state is shown.
  function fieldError(input, msg) {
    var id = input.id + '-error';
    var err = document.getElementById(id);
    if (msg) {
      if (!err) {
        err = document.createElement('p');
        err.id = id;
        err.className = 'field-error';
        input.insertAdjacentElement('afterend', err);
      }
      err.textContent = msg;
      input.setAttribute('aria-invalid', 'true');
      input.setAttribute('aria-describedby', id);
    } else {
      if (err) err.remove();
      input.removeAttribute('aria-invalid');
      input.removeAttribute('aria-describedby');
    }
    return !msg;
  }
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  // A short reference for confirmations, like NA-7K2Q (no 0/O or 1/I to misread).
  function makeRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return 'NA-' + out;
  }

  // Newsletter (footer).
  $$('[data-newsletter]').forEach(function (form) {
    var input = $('input[type="email"]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = input.value.trim();
      if (!fieldError(input, !v ? 'Enter your email address.' : !EMAIL.test(v) ? 'Enter a valid email address, like you@example.com.' : '')) { input.focus(); return; }
      // Demo only: connect this form to your email provider to collect sign-ups.
      form.innerHTML = '<p class="rounded-2xl bg-leaf-400/15 px-4 py-3 text-sm font-semibold text-leaf-100" role="status">Thanks! Look out for a confirmation email from us; once you click the link, your first Thursday lesson is on its way.</p>';
    });
  });

  // Search forms send you to the catalog.
  $$('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      var q = $('input', form).value.trim();
      if (!q) { e.preventDefault(); window.location.href = 'courses.html'; }
    });
  });

  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ======================================================================
     Pages
     ====================================================================== */
  var pages = {};

  pages.home = function () {
    var featured = ['design-systems', 'react-from-scratch', 'sql-essentials', 'data-viz', 'accessible-web', 'product-discovery'].map(findCourse);
    render('[data-featured-courses]', featured.map(function (c) { return '<div class="reveal">' + courseCard(c) + '</div>'; }).join(''));
    $$('[data-topic-count]').forEach(function (el) {
      var n = COURSES.filter(function (c) { return c.topic === el.dataset.topicCount; }).length;
      el.textContent = n + ' course' + (n === 1 ? '' : 's');
    });
    render('[data-home-instructors]', INSTRUCTORS.slice(0, 4).map(function (i) { return '<div class="reveal">' + instructorCard(i) + '</div>'; }).join(''));
    render('[data-home-paths]', PATHS.map(pathCard).join(''));
  };

  function pathCard(path) {
    var t = TOPICS[path.topic];
    var courses = path.courses.map(findCourse);
    var hours = courses.reduce(function (s, c) { return s + c.hours; }, 0);
    return '<article class="card reveal relative flex flex-col overflow-hidden p-6">' +
      '<div class="absolute -top-10 -right-10 size-32 rounded-full opacity-60" style="background:' + t.alt + '" aria-hidden="true"></div>' +
      '<p class="relative text-xs font-extrabold tracking-[0.14em] uppercase muted">' + courses.length + ' courses · ' + hours + ' hours</p>' +
      '<h3 class="relative mt-2 text-xl font-extrabold tracking-tight"><a class="stretched" href="paths.html#' + path.id + '">' + esc(path.name) + '</a></h3>' +
      '<p class="relative mt-2 text-sm muted">' + esc(path.blurb) + '</p>' +
      '<ol class="relative mt-4 space-y-1.5 text-sm">' + courses.map(function (c, i) {
        return '<li class="flex items-center gap-2.5"><span class="grid size-6 shrink-0 place-items-center rounded-full text-[11px] font-extrabold text-ink" style="background:' + t.alt + '">' + (i + 1) + '</span><span class="truncate">' + esc(c.title) + '</span></li>';
      }).join('') + '</ol></article>';
  }

  pages.courses = function () {
    var grid = $('[data-catalogue]');
    var form = $('[data-filters]');
    var count = $('[data-result-count]');
    var empty = $('[data-empty]');
    var sort = $('#sort');
    var search = $('#catalogue-search');
    var viewBtns = $$('[data-view]');
    var view = 'grid';
    try { view = safeStorage.getItem('academy-view') === 'list' ? 'list' : 'grid'; } catch (e) {}

    // Read filters from the URL.
    var params = new URLSearchParams(window.location.search);
    search.value = params.get('q') || '';
    (params.get('topic') || '').split(',').forEach(function (v) { var cb = $('input[name="topic"][value="' + CSS.escape(v) + '"]', form); if (cb) cb.checked = true; });
    (params.get('level') || '').split(',').forEach(function (v) { var cb = $('input[name="level"][value="' + CSS.escape(v) + '"]', form); if (cb) cb.checked = true; });
    ['length', 'price', 'rating'].forEach(function (k) {
      var v = params.get(k);
      var r = v && $('input[name="' + k + '"][value="' + CSS.escape(v) + '"]', form);
      if (r) r.checked = true;
    });
    if (params.get('sort') && $('option[value="' + CSS.escape(params.get('sort')) + '"]', sort)) sort.value = params.get('sort');

    function values(name) { return $$('input[name="' + name + '"]:checked', form).map(function (i) { return i.value; }); }
    function apply() {
      var q = search.value.trim().toLowerCase();
      var topics = values('topic'), levels = values('level');
      var length = values('length')[0] || 'any', price = values('price')[0] || 'any', rating = values('rating')[0] || 'any';
      var list = COURSES.filter(function (c) {
        var inst = findInstructor(c.instructor);
        var hay = (c.title + ' ' + c.summary + ' ' + TOPICS[c.topic].name + ' ' + inst.name).toLowerCase();
        if (q && hay.indexOf(q) === -1) return false;
        if (topics.length && topics.indexOf(c.topic) === -1) return false;
        if (levels.length && levels.indexOf(c.level) === -1) return false;
        if (length === 'short' && c.hours >= 5) return false;
        if (length === 'medium' && (c.hours < 5 || c.hours > 10)) return false;
        if (length === 'long' && c.hours <= 10) return false;
        if (price === 'free' && c.price) return false;
        if (price === 'paid' && !c.price) return false;
        if (rating !== 'any' && c.rating < parseFloat(rating)) return false;
        return true;
      });
      var s = sort.value;
      list.sort(function (a, b) {
        if (s === 'rating') return b.rating - a.rating || b.reviews - a.reviews;
        if (s === 'newest') return COURSES.indexOf(b) - COURSES.indexOf(a);
        if (s === 'price-asc') return a.price - b.price;
        if (s === 'price-desc') return b.price - a.price;
        if (s === 'length') return a.hours - b.hours;
        return b.students - a.students;
      });
      grid.className = view === 'list' ? 'grid gap-5' : 'grid gap-6 sm:grid-cols-2 xl:grid-cols-3';
      render(grid, list.map(function (c) { return courseCard(c, { list: view === 'list' }); }).join(''));
      count.textContent = list.length + ' course' + (list.length === 1 ? '' : 's');
      empty.hidden = list.length > 0;
      var activeCount = topics.length + levels.length + (length !== 'any') + (price !== 'any') + (rating !== 'any');
      $$('[data-active-filters]').forEach(function (el) { el.textContent = activeCount ? '(' + activeCount + ')' : ''; });

      var next = new URLSearchParams();
      if (q) next.set('q', search.value.trim());
      if (topics.length) next.set('topic', topics.join(','));
      if (levels.length) next.set('level', levels.join(','));
      if (length !== 'any') next.set('length', length);
      if (price !== 'any') next.set('price', price);
      if (rating !== 'any') next.set('rating', rating);
      if (s !== 'popular') next.set('sort', s);
      var qs = next.toString();
      history.replaceState(null, '', qs ? '?' + qs : window.location.pathname.split('/').pop());
    }
    form.addEventListener('change', apply);
    sort.addEventListener('change', apply);
    search.addEventListener('input', apply);
    $('[data-search-catalogue]').addEventListener('submit', function (e) { e.preventDefault(); apply(); });
    $$('[data-clear-filters]').forEach(function (b) {
      b.addEventListener('click', function () { form.reset(); search.value = ''; sort.value = 'popular'; apply(); });
    });
    function setView(v) {
      view = v;
      viewBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === v)); });
      try { safeStorage.setItem('academy-view', v); } catch (e) {}
      apply();
    }
    viewBtns.forEach(function (b) { b.addEventListener('click', function () { setView(b.dataset.view); }); });
    viewBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.view === view)); });

    // Filters panel on small screens.
    var toggle = $('[data-filters-toggle]');
    var panel = $('#filters-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        panel.classList.toggle('hidden', !open);
      });
    }
    apply();
  };

  pages.course = function () {
    var course = findCourse(param('id')) || COURSES[0];
    var inst = findInstructor(course.instructor);
    var t = TOPICS[course.topic];
    var mods = curriculum(course);
    var total = lessonCount(course);
    document.title = course.title + ' — ' + SITE_NAME;
    var metaDesc = $('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', course.summary);

    $$('[data-bind]').forEach(function (el) {
      var k = el.dataset.bind;
      var v = { title: course.title, summary: course.summary, topic: t.name, level: course.level, rating: course.rating.toFixed(1), reviews: fmt(course.reviews), students: fmt(course.students),
        hours: course.hours + ' hours', lessons: total + ' lessons', modules: mods.length + ' modules', updated: course.updated, instructor: inst.name, 'instructor-role': inst.role,
        'instructor-bio': inst.bio, price: priceLabel(course), cta: course.price ? 'Enroll for $' + course.price : 'Enroll for free' }[k];
      if (v !== undefined) el.textContent = v;
    });
    $$('[data-bind-href="instructor"]').forEach(function (a) { a.href = 'instructor.html?id=' + inst.id; });
    $$('[data-bind-href="topic"]').forEach(function (a) { a.href = 'courses.html?topic=' + course.topic; });
    render('[data-course-cover]', cover(course));
    render('[data-course-stars]', stars(course.rating, 16));
    render('[data-instructor-avatar]', avatar(inst, 72));
    render('[data-outcomes]', course.outcomes.map(function (o) {
      return '<li class="flex gap-3"><svg class="mt-0.5 size-5 shrink-0 text-leaf-600 dark:text-leaf-300" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clip-rule="evenodd"/></svg><span>' + esc(o) + '</span></li>';
    }).join(''));
    $('[data-curriculum-summary]').textContent = mods.length + ' modules · ' + total + ' lessons · ' + course.hours + ' hours total';
    render('[data-curriculum]', mods.map(function (m, mi) {
      return '<details class="acc"' + (mi === 0 ? ' open' : '') + '><summary><span class="grid size-8 shrink-0 place-items-center rounded-xl bg-leaf-100 text-sm font-extrabold text-leaf-800 dark:bg-leaf-400/15 dark:text-leaf-200">' + (mi + 1) + '</span>' +
        '<span class="min-w-0"><span class="block">' + esc(m.title) + '</span><span class="block text-xs font-semibold muted">' + m.lessons.length + ' lessons · ' + minutes(m.min) + '</span></span>' +
        '<svg class="chev" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z"/></svg></summary>' +
        '<ul class="mb-4 ml-11 space-y-1">' + m.lessons.map(function (l) {
          return '<li class="flex items-center gap-3 rounded-xl px-3 py-2 text-sm hover:bg-ink/[0.04] dark:hover:bg-white/5">' +
            '<svg class="size-4 shrink-0 text-ink/50 dark:text-white/50" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6.3 3.8A1.5 1.5 0 0 0 4 5.1v9.8a1.5 1.5 0 0 0 2.3 1.3l7.8-4.9a1.5 1.5 0 0 0 0-2.6Z"/></svg>' +
            (l.preview ? '<a class="font-semibold text-leaf-800 underline decoration-leaf-300 underline-offset-2 hover:text-leaf-900 dark:text-leaf-200" href="lesson.html?course=' + course.id + '&amp;lesson=' + l.id + '">' + esc(l.title) + '</a><span class="tag tag-free">Preview</span>' : '<span>' + esc(l.title) + '</span>') +
            '<span class="ml-auto shrink-0 text-xs font-semibold muted">' + l.min + ' min</span></li>';
        }).join('') + '</ul></details>';
    }).join(''));
    $$('[data-expand-all]').forEach(function (b) {
      b.addEventListener('click', function () {
        var all = $$('[data-curriculum] details');
        var open = all.some(function (d) { return !d.open; });
        all.forEach(function (d) { d.open = open; });
        b.textContent = open ? 'Collapse all' : 'Expand all';
      });
    });

    // Reviews: a histogram that matches the course rating.
    var dist = course.rating >= 4.85 ? [84, 12, 3, 1, 0] : course.rating >= 4.75 ? [76, 17, 5, 1, 1] : [68, 22, 7, 2, 1];
    render('[data-histogram]', dist.map(function (pct, i) {
      return '<div class="flex items-center gap-3 text-sm"><span class="w-12 shrink-0 font-semibold">' + (5 - i) + ' star</span><span class="bar flex-1" role="img" aria-label="' + pct + '% of reviews"><span style="width:' + pct + '%"></span></span><span class="w-9 shrink-0 text-right muted">' + pct + '%</span></div>';
    }).join(''));

    // Preview dialog.
    var dialog = $('#preview-dialog');
    if (dialog) {
      var previews = allLessons(course).filter(function (l) { return l.preview; });
      render('[data-preview-list]', previews.map(function (l) {
        return '<li><a class="flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold hover:bg-ink/5 dark:hover:bg-white/10" href="lesson.html?course=' + course.id + '&amp;lesson=' + l.id + '"><span class="grid size-8 place-items-center rounded-full bg-leaf-700 text-white dark:bg-leaf-300 dark:text-night"><svg class="size-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path d="M6.3 3.8A1.5 1.5 0 0 0 4 5.1v9.8a1.5 1.5 0 0 0 2.3 1.3l7.8-4.9a1.5 1.5 0 0 0 0-2.6Z"/></svg></span>' + esc(l.title) + '<span class="ml-auto text-xs muted">' + l.min + ' min</span></a></li>';
      }).join(''));
      $$('[data-open-preview]').forEach(function (b) { b.addEventListener('click', function () { dialog.showModal(); }); });
      $$('[data-close-dialog]', dialog).forEach(function (b) { b.addEventListener('click', function () { dialog.close(); }); });
      dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
    }

    // Enroll: saved in this browser (demo — no payment is taken).
    var progress = loadProgress();
    function syncEnrol() {
      var p = courseProgress(progress, course);
      $$('[data-enrol]').forEach(function (btn) {
        if (p) {
          btn.textContent = p.done ? 'Continue learning (' + p.pct + '%)' : 'Start the first lesson';
          btn.dataset.enrolled = '1';
        }
      });
      $$('[data-enrol-note]').forEach(function (el) {
        el.textContent = p ? 'You’re enrolled. Your progress is saved in this browser.' : course.price ? '30-day money-back guarantee · Lifetime access' : 'Free forever · Certificate included';
      });
    }
    $$('[data-enrol]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!progress.enrolled[course.id] || progress.demo) {
          makeOwn(progress);
          progress.enrolled[course.id] = { done: [], last: '' };
          saveProgress(progress);
          syncEnrol();
          toast(course.price ? 'Enrolled! Your order reference is ' + makeRef() + ' and your first lesson is ready.' : 'Enrolled! Your first lesson is ready.');
          return;
        }
        var e = progress.enrolled[course.id];
        var next = e.last || (allLessons(course).filter(function (l) { return e.done.indexOf(l.id) === -1; })[0] || allLessons(course)[0]).id;
        window.location.href = 'lesson.html?course=' + course.id + '&lesson=' + next;
      });
    });
    syncEnrol();

    // More by the instructor.
    var more = COURSES.filter(function (c) { return c.id !== course.id && (c.instructor === course.instructor || c.topic === course.topic); }).slice(0, 3);
    render('[data-related]', more.map(function (c) { return '<div class="reveal">' + courseCard(c) + '</div>'; }).join(''));
  };

  pages.paths = function () {
    render('[data-paths]', PATHS.map(function (path, pi) {
      var t = TOPICS[path.topic];
      var courses = path.courses.map(findCourse);
      var hours = courses.reduce(function (s, c) { return s + c.hours; }, 0);
      var price = courses.reduce(function (s, c) { return s + c.price; }, 0);
      return '<section id="' + path.id + '" class="card reveal overflow-hidden" aria-labelledby="' + path.id + '-title">' +
        '<div class="grid gap-0 lg:grid-cols-[22rem_1fr]">' +
          '<div class="relative p-7 sm:p-8" style="background:' + t.bg + '">' +
            '<p class="text-xs font-extrabold tracking-[0.14em] text-ink uppercase">Path ' + (pi + 1) + ' of ' + PATHS.length + '</p>' +
            '<h2 id="' + path.id + '-title" class="mt-2 text-3xl font-extrabold tracking-tight text-ink">' + esc(path.name) + '</h2>' +
            '<p class="mt-3 text-sm text-ink/80">' + esc(path.blurb) + '</p>' +
            '<dl class="mt-6 grid grid-cols-3 gap-3 text-ink">' +
              '<div><dt class="text-xs font-bold text-ink/70">Courses</dt><dd class="text-2xl font-extrabold">' + courses.length + '</dd></div>' +
              '<div><dt class="text-xs font-bold text-ink/70">Hours</dt><dd class="text-2xl font-extrabold">' + hours + '</dd></div>' +
              '<div><dt class="text-xs font-bold text-ink/70">Weeks</dt><dd class="text-2xl font-extrabold">' + path.weeks + '</dd></div></dl>' +
            '<p class="mt-5 text-sm text-ink/80">Included with <strong>Plus</strong>, or $' + price + ' for the courses on their own.</p>' +
            '<a class="btn btn-primary mt-6 dark:bg-leaf-700 dark:text-white dark:hover:bg-leaf-800" href="course.html?id=' + courses[0].id + '">Start with course 1</a>' +
          '</div>' +
          '<ol class="divide-y divide-ink/10 p-4 sm:p-6 dark:divide-white/10">' + courses.map(function (c, i) {
            var inst = findInstructor(c.instructor);
            return '<li class="relative flex items-center gap-4 rounded-2xl p-3 hover:bg-ink/[0.03] dark:hover:bg-white/5">' +
              '<span class="grid size-10 shrink-0 place-items-center rounded-2xl text-sm font-extrabold text-ink" style="background:' + t.alt + '">' + (i + 1) + '</span>' +
              '<div class="hidden w-28 shrink-0 overflow-hidden rounded-xl sm:block">' + cover(c).replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true"') + '</div>' +
              '<div class="min-w-0"><h3 class="font-extrabold"><a class="stretched" href="course.html?id=' + c.id + '">' + esc(c.title) + '</a></h3><p class="text-sm muted">' + esc(inst.name) + ' · ' + c.level + ' · ' + c.hours + ' h</p></div>' +
              '<span class="ml-auto shrink-0 text-sm font-bold">' + priceLabel(c) + '</span></li>';
          }).join('') + '</ol></div></section>';
    }).join(''));
  };

  pages.instructors = function () {
    render('[data-instructors]', INSTRUCTORS.map(function (i) { return '<div class="reveal">' + instructorCard(i) + '</div>'; }).join(''));
    // Teach-with-us application (demo: POST new FormData(form) to your form service).
    var form = $('[data-teach-form]');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = $('#teach-name'), email = $('#teach-email'), topic = $('#teach-topic'), idea = $('#teach-idea');
      var checks = [
        [name, name.value.trim() ? '' : 'Enter your name.'],
        [email, !email.value.trim() ? 'Enter your email address.' : !EMAIL.test(email.value.trim()) ? 'Enter a valid email address.' : ''],
        [topic, topic.value ? '' : 'Choose a topic.'],
        [idea, idea.value.trim().length >= 20 ? '' : 'Tell us a little more (at least 20 characters).']
      ];
      var firstBad = null;
      checks.forEach(function (c) { if (!fieldError(c[0], c[1]) && !firstBad) firstBad = c[0]; });
      if (firstBad) { firstBad.focus(); return; }
      form.hidden = true;
      var done = $('[data-teach-success]');
      $('[data-ref]', done).textContent = makeRef();
      done.classList.remove('hidden');
      done.focus();
    });
  };

  pages.instructor = function () {
    var inst = findInstructor(param('id')) || INSTRUCTORS[0];
    var courses = COURSES.filter(function (c) { return c.instructor === inst.id; });
    var reviews = courses.reduce(function (s, c) { return s + c.reviews; }, 0);
    document.title = inst.name + ' — ' + SITE_NAME;
    $$('[data-bind]').forEach(function (el) {
      var v = { name: inst.name, role: inst.role, bio: inst.bio, rating: inst.rating.toFixed(1), students: fmt(inst.students), reviews: fmt(reviews), courses: String(courses.length), first: inst.name.split(' ')[0] }[el.dataset.bind];
      if (v !== undefined) el.textContent = v;
    });
    render('[data-instructor-avatar]', avatar(inst, 160));
    render('[data-instructor-tags]', inst.tags.map(function (tg) { return '<li class="tag tag-level px-3 py-1 text-sm">' + esc(tg) + '</li>'; }).join(''));
    render('[data-instructor-courses]', courses.map(function (c) { return '<div class="reveal">' + courseCard(c) + '</div>'; }).join(''));
    render('[data-other-instructors]', INSTRUCTORS.filter(function (i) { return i.id !== inst.id; }).slice(0, 3).map(function (i) { return '<div class="reveal">' + instructorCard(i) + '</div>'; }).join(''));
  };

  pages.pricing = function () {
    var annual = true;
    var toggle = $('[data-billing-toggle]');
    var seats = $('#seats');
    var seatsNum = $('#seats-number');
    function money(n) { return '$' + n.toLocaleString('en-US', { maximumFractionDigits: n % 1 ? 2 : 0, minimumFractionDigits: n % 1 ? 2 : 0 }); }
    function update() {
      toggle.setAttribute('aria-checked', String(annual));
      $$('[data-price]').forEach(function (el) { el.textContent = annual ? el.dataset.annual : el.dataset.monthly; });
      $$('[data-billing-note]').forEach(function (el) { el.textContent = annual ? el.dataset.annualNote : el.dataset.monthlyNote; });
      $$('[data-billing-label]').forEach(function (el) {
        var on = (el.dataset.billingLabel === 'annual') === annual;
        el.classList.toggle('muted', !on);
      });
      var n = Math.max(2, Math.min(500, parseInt(seatsNum.value, 10) || 2));
      var base = annual ? 24 : 29;
      var discount = n >= 200 ? 0.15 : n >= 50 ? 0.1 : n >= 10 ? 0.05 : 0;
      var perSeat = Math.round(base * (1 - discount) * 100) / 100;
      var monthly = perSeat * n;
      $('[data-per-seat]').textContent = money(perSeat);
      $('[data-discount]').textContent = discount ? 'Volume discount: ' + discount * 100 + '% off' : 'Volume discounts start at 10 seats';
      $('[data-team-total]').textContent = money(Math.round(monthly * 100) / 100);
      $('[data-team-annual]').textContent = annual ? 'Billed ' + money(Math.round(monthly * 12)) + ' per year' : 'Billed monthly, cancel any time';
      seats.setAttribute('aria-valuetext', n + ' seats');
    }
    toggle.addEventListener('click', function () { annual = !annual; update(); });
    seats.addEventListener('input', function () { seatsNum.value = seats.value; fieldError(seatsNum, ''); update(); });
    seatsNum.addEventListener('input', function () {
      var n = parseInt(seatsNum.value, 10);
      if (!seatsNum.value || isNaN(n) || n < 2 || n > 500) { fieldError(seatsNum, 'Choose between 2 and 500 seats.'); return; }
      fieldError(seatsNum, '');
      seats.value = String(Math.min(n, 200));
      update();
    });
    seatsNum.addEventListener('blur', function () {
      var n = Math.max(2, Math.min(500, parseInt(seatsNum.value, 10) || 2));
      seatsNum.value = String(n);
      seats.value = String(Math.min(n, 200));
      fieldError(seatsNum, '');
      update();
    });
    update();

    // Team inquiry form.
    var form = $('[data-team-form]');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var name = $('#team-name'), email = $('#team-email'), company = $('#team-company');
        var ok = [
          fieldError(name, name.value.trim() ? '' : 'Enter your name.'),
          fieldError(email, !email.value.trim() ? 'Enter your work email.' : !EMAIL.test(email.value.trim()) ? 'Enter a valid email address.' : ''),
          fieldError(company, company.value.trim() ? '' : 'Enter your company or school.')
        ];
        var firstBad = [name, email, company][ok.indexOf(false)];
        if (firstBad) { firstBad.focus(); return; }
        // Demo only: POST new FormData(form) to your CRM or form service here.
        form.hidden = true;
        var done = $('[data-team-success]');
        $('[data-ref]', done).textContent = makeRef();
        done.hidden = false;
        done.focus();
      });
    }
  };

  pages.learn = function () {
    var progress = loadProgress();
    var ids = Object.keys(progress.enrolled);
    var rows = ids.map(function (id) { var c = findCourse(id); return { course: c, p: courseProgress(progress, c) }; });
    var inProgress = rows.filter(function (r) { return r.p.pct < 100; });
    var done = rows.filter(function (r) { return r.p.pct === 100; });
    var totalDone = rows.reduce(function (s, r) { return s + r.p.done; }, 0);
    var minutesDone = rows.reduce(function (s, r) {
      var set = progress.enrolled[r.course.id].done;
      return s + allLessons(r.course).filter(function (l) { return set.indexOf(l.id) !== -1; }).reduce(function (m, l) { return m + l.min; }, 0);
    }, 0);

    $('[data-demo-note]').hidden = !progress.demo;
    $('[data-stat="lessons"]').textContent = String(totalDone);
    $('[data-stat="hours"]').textContent = (minutesDone / 60).toFixed(1);
    $('[data-stat="certificates"]').textContent = String(done.length);
    $('[data-streak]').textContent = String(progress.streak.count);
    var week = $('[data-week]');
    var dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    var todayIdx = (new Date().getDay() + 6) % 7;
    var active = Math.min(progress.streak.count, todayIdx + 1);
    week.innerHTML = dayNames.map(function (d, i) {
      var on = i <= todayIdx && i > todayIdx - active;
      return '<li class="flex flex-col items-center gap-1.5"><span class="grid size-8 place-items-center rounded-full text-xs font-extrabold ' + (on ? 'bg-sun-400 text-ink' : 'bg-white/10 text-white/70') + '" aria-hidden="true">' + (on ? '✓' : '') + '</span><span class="text-[11px] font-bold text-white/80">' + d + '<span class="sr-only">' + (on ? ': studied' : ': no study yet') + '</span></span></li>';
    }).join('');

    // Continue where you left off: the most recently opened course still in progress.
    var cont = inProgress[0];
    var contEl = $('[data-continue]');
    if (cont) {
      var lessons = allLessons(cont.course);
      var set = progress.enrolled[cont.course.id].done;
      var next = lessons.filter(function (l) { return l.id === progress.enrolled[cont.course.id].last; })[0] || lessons.filter(function (l) { return set.indexOf(l.id) === -1; })[0] || lessons[0];
      render(contEl, '<div class="grid items-center gap-6 sm:grid-cols-[14rem_1fr]">' +
        '<div class="overflow-hidden rounded-2xl">' + cover(cont.course).replace(/role="img" aria-label="[^"]*"/, 'aria-hidden="true"') + '</div>' +
        '<div><p class="eyebrow">Continue learning</p><h2 class="mt-2 text-2xl font-extrabold tracking-tight">' + esc(cont.course.title) + '</h2>' +
        '<p class="mt-1 text-sm muted">Next: ' + esc(next.title) + ' · ' + next.min + ' min</p>' +
        '<div class="mt-4 flex items-center gap-3"><div class="bar flex-1" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + cont.p.pct + '"><span style="width:' + cont.p.pct + '%"></span></div><span class="text-sm font-extrabold">' + cont.p.pct + '%</span></div>' +
        '<a class="btn btn-primary mt-5" href="lesson.html?course=' + cont.course.id + '&amp;lesson=' + next.id + '">Resume lesson</a></div></div>');
    } else {
      render(contEl, '<div class="text-center"><p class="text-lg font-extrabold">Nothing in progress</p><p class="mt-1 text-sm muted">Pick a course and your progress will show up here.</p><a class="btn btn-primary mt-4" href="courses.html">Browse courses</a></div>');
    }

    render('[data-enrolled]', rows.length ? rows.map(function (r) {
      return '<article class="card reveal relative flex items-center gap-4 p-4">' +
        '<div class="ring-progress size-16 shrink-0" style="--p:' + r.p.pct + '" role="img" aria-label="' + r.p.pct + '% complete"><span class="size-12">' + r.p.pct + '%</span></div>' +
        '<div class="min-w-0"><h3 class="font-extrabold leading-snug"><a class="stretched" href="course.html?id=' + r.course.id + '">' + esc(r.course.title) + '</a></h3>' +
        '<p class="mt-0.5 text-sm muted">' + r.p.done + ' of ' + r.p.total + ' lessons' + (r.p.pct === 100 ? ' · Completed' : '') + '</p></div></article>';
    }).join('') : '<p class="card p-6 text-sm muted sm:col-span-2">You haven’t enrolled in anything yet. <a class="font-bold text-leaf-800 underline dark:text-leaf-200" href="courses.html">Find a course</a>.</p>');

    render('[data-certificates]', done.length ? done.map(function (r) {
      return '<article class="card reveal flex flex-col gap-4 p-4 sm:flex-row sm:items-center">' +
        '<div class="w-full shrink-0 overflow-hidden rounded-2xl ring-1 ring-ink/10 sm:w-48">' + certificate(r.course, 'Alex Morgan') + '</div>' +
        '<div><h3 class="font-extrabold">' + esc(r.course.title) + '</h3><p class="mt-1 text-sm muted">' + r.course.hours + ' hours · Issued by Northfield Academy</p>' +
        '<button type="button" class="btn btn-secondary mt-3" data-view-cert="' + r.course.id + '">View certificate</button></div></article>';
    }).join('') : '<p class="card p-6 text-sm muted">Finish a course to earn your first certificate.</p>');

    var dialog = $('#cert-dialog');
    $$('[data-view-cert]').forEach(function (b) {
      b.addEventListener('click', function () {
        var c = findCourse(b.dataset.viewCert);
        $('[data-cert-body]', dialog).innerHTML = certificate(c, 'Alex Morgan');
        $('[data-cert-title]', dialog).textContent = c.title;
        dialog.showModal();
      });
    });
    $$('[data-close-dialog]', dialog).forEach(function (b) { b.addEventListener('click', function () { dialog.close(); }); });
    dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });

    var enrolledIds = Object.keys(progress.enrolled);
    render('[data-recommended]', COURSES.filter(function (c) { return enrolledIds.indexOf(c.id) === -1; }).sort(function (a, b) { return b.rating - a.rating; }).slice(0, 3).map(function (c) { return '<div class="reveal">' + courseCard(c) + '</div>'; }).join(''));

    $('[data-reset]').addEventListener('click', function () {
      clearStored(PROGRESS_KEY);
      clearStored(NOTES_KEY);
      window.location.reload();
    });
  };

  pages.lesson = function () {
    var course = findCourse(param('course')) || COURSES[0];
    var mods = curriculum(course);
    var lessons = allLessons(course);
    var lesson = lessons.filter(function (l) { return l.id === param('lesson'); })[0] || lessons[0];
    var idx = lessons.indexOf(lesson);
    var mod = mods.filter(function (m) { return m.lessons.indexOf(lesson) !== -1; })[0];
    var progress = loadProgress();
    var enrolled = !!progress.enrolled[course.id];
    var notes = loadNotes();
    var noteKey = course.id + '/' + lesson.id;
    document.title = lesson.title + ' · ' + course.title + ' — ' + SITE_NAME;

    $$('[data-bind]').forEach(function (el) {
      var v = { title: lesson.title, course: course.title, module: 'Module ' + (mods.indexOf(mod) + 1) + ': ' + mod.title, duration: lesson.min + ' min', position: 'Lesson ' + (idx + 1) + ' of ' + lessons.length, instructor: findInstructor(course.instructor).name }[el.dataset.bind];
      if (v !== undefined) el.textContent = v;
    });
    $$('[data-course-link]').forEach(function (a) { a.href = 'course.html?id=' + course.id; });
    render('[data-video-art]', cover(course, { label: 'Video placeholder for ' + lesson.title }));

    function isDone(id) { return enrolled && progress.enrolled[course.id].done.indexOf(id) !== -1; }
    function sidebar() {
      var doneCount = enrolled ? progress.enrolled[course.id].done.length : 0;
      var pct = Math.round(doneCount / lessons.length * 100);
      $('[data-side-progress]').textContent = doneCount + ' of ' + lessons.length + ' complete';
      var bar = $('[data-side-bar]');
      bar.setAttribute('aria-valuenow', String(pct));
      $('span', bar).style.width = pct + '%';
      render('[data-side-curriculum]', mods.map(function (m, mi) {
        return '<li><p class="px-3 pt-4 pb-1 text-xs font-extrabold tracking-[0.12em] uppercase muted">Module ' + (mi + 1) + ' · ' + esc(m.title) + '</p><ul>' + m.lessons.map(function (l) {
          var cur = l === lesson, ok = isDone(l.id);
          var locked = !enrolled && !l.preview;
          return '<li><a href="lesson.html?course=' + course.id + '&amp;lesson=' + l.id + '"' + (cur ? ' aria-current="page"' : '') +
            ' class="flex items-start gap-3 rounded-xl px-3 py-2 text-sm hover:bg-ink/5 aria-[current=page]:bg-leaf-100 aria-[current=page]:font-bold dark:hover:bg-white/5 dark:aria-[current=page]:bg-leaf-400/15">' +
            '<span class="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full ' + (ok ? 'bg-leaf-700 text-white dark:bg-leaf-300 dark:text-night' : 'ring-2 ring-ink/20 dark:ring-white/25') + '" aria-hidden="true">' + (ok ? '<svg class="size-3" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" clip-rule="evenodd"/></svg>' : '') + '</span>' +
            '<span class="min-w-0 flex-1">' + esc(l.title) + (ok ? '<span class="sr-only"> (completed)</span>' : '') + (locked ? '<span class="sr-only"> (enroll to unlock)</span>' : '') + '</span>' +
            '<span class="shrink-0 text-xs muted">' + (locked ? '<svg class="inline size-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M10 2a4 4 0 0 0-4 4v2H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-1V6a4 4 0 0 0-4-4Zm2 6V6a2 2 0 1 0-4 0v2h4Z" clip-rule="evenodd"/></svg> ' : '') + l.min + 'm</span></a></li>';
        }).join('') + '</ul></li>';
      }).join(''));
    }

    var completeBtn = $('[data-complete]');
    var locked = !enrolled && !lesson.preview;
    $('[data-locked]').hidden = !locked;
    $('[data-player]').classList.toggle('opacity-40', locked);
    function syncComplete() {
      var ok = isDone(lesson.id);
      completeBtn.setAttribute('aria-pressed', String(ok));
      completeBtn.textContent = ok ? 'Completed ✓' : 'Mark as complete';
      completeBtn.classList.toggle('btn-primary', !ok);
      completeBtn.classList.toggle('btn-secondary', ok);
    }
    completeBtn.addEventListener('click', function () {
      makeOwn(progress);
      if (!progress.enrolled[course.id]) progress.enrolled[course.id] = { done: [], last: '' };
      enrolled = true;
      var e = progress.enrolled[course.id];
      var at = e.done.indexOf(lesson.id);
      if (at === -1) {
        e.done.push(lesson.id);
        bumpStreak(progress);
        var nextOpen = lessons.filter(function (l) { return e.done.indexOf(l.id) === -1; })[0];
        e.last = nextOpen ? nextOpen.id : lesson.id;
        toast(e.done.length === lessons.length ? 'Course complete! Your certificate is waiting in My learning.' : 'Nice work! Lesson marked complete.');
      } else {
        e.done.splice(at, 1);
        e.last = lesson.id;
      }
      saveProgress(progress);
      syncComplete();
      sidebar();
      $('[data-locked]').hidden = true;
      $('[data-player]').classList.remove('opacity-40');
    });
    // Remember where you are.
    if (enrolled) { progress.enrolled[course.id].last = lesson.id; if (!progress.demo) saveProgress(progress); }

    var prev = lessons[idx - 1], next = lessons[idx + 1];
    var prevA = $('[data-prev]'), nextA = $('[data-next]');
    if (prev) { prevA.href = 'lesson.html?course=' + course.id + '&lesson=' + prev.id; $('[data-label]', prevA).textContent = prev.title; } else prevA.hidden = true;
    if (next) { nextA.href = 'lesson.html?course=' + course.id + '&lesson=' + next.id; $('[data-label]', nextA).textContent = next.title; } else { nextA.href = 'learn.html'; $('[data-label]', nextA).textContent = 'Back to My learning'; }

    // Notes, saved per lesson in this browser.
    var area = $('#lesson-notes');
    var status = $('[data-notes-status]');
    area.value = notes[noteKey] || '';
    var saveTimer;
    area.addEventListener('input', function () {
      clearTimeout(saveTimer);
      status.textContent = 'Saving…';
      saveTimer = setTimeout(function () {
        var all = loadNotes();
        if (area.value.trim()) all[noteKey] = area.value.slice(0, 5000); else delete all[noteKey];
        writeJSON(NOTES_KEY, all);
        status.textContent = 'Saved in this browser';
      }, 400);
    });

    setupTabs($('[data-lesson-tabs]'));

    // Curriculum drawer on small screens.
    var drawerBtn = $('[data-curriculum-toggle]');
    var side = $('#lesson-sidebar');
    drawerBtn.addEventListener('click', function () {
      var open = drawerBtn.getAttribute('aria-expanded') !== 'true';
      drawerBtn.setAttribute('aria-expanded', String(open));
      side.classList.toggle('hidden', !open);
    });

    syncComplete();
    sidebar();
  };

  pages.notfound = function () {
    render('[data-suggested]', COURSES.slice(0, 3).map(function (c) { return '<div class="reveal">' + courseCard(c) + '</div>'; }).join(''));
  };

  if (pages[page]) pages[page]();
  observeReveals(document);
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
  btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  document.body.appendChild(btn);

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var AVOID = '[data-toast], .toast, [data-back-to-top-avoid]';
  var queued = false;

  function isShown(el) {
    var cs = window.getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && parseFloat(cs.opacity) > 0.05;
  }
  function lift() {
    var offset = 0;
    var vw = window.innerWidth, vh = window.innerHeight;
    Array.prototype.forEach.call(document.querySelectorAll(AVOID), function (el) {
      if (!isShown(el)) return;
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.bottom > vh - 140 && r.right > vw - 96 && r.top < vh) offset = Math.max(offset, vh - r.top + 4);
    });
    btn.style.setProperty('--btt-lift', offset + 'px');
  }
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
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !coversHideZone());
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
    if (reduceMotion.matches) {
      window.scrollTo({ top: 0, behavior: 'auto' });
      focusTop();
      return;
    }
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
