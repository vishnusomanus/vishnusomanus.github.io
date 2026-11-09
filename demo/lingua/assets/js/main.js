/* Lingua — language school template. Vanilla JavaScript, no dependencies.
 *
 *  1. Data: languages, levels, courses, teachers, syllabus, placement scoring
 *  2. Helpers (URL parameters, storage, formatting, shared markup)
 *  3. Course list filters (courses.html)
 *  4. Course page (course.html?id=…)
 *  5. Tabs (course page, fees)
 *  6. Teacher filter (teachers.html)
 *  7. Schedule filters (timetable.html)
 *  8. Placement test (placement.html)
 *  9. Enrollment form (enrol.html)
 * 10. Contact and newsletter forms, ?topic= prefill
 * 11. Header, mobile menu, scroll reveal, year
 *
 * Every URL parameter is read case-insensitively and only accepted when it names one of the
 * template's own values. Saved data (localStorage) is validated whenever it is read.
 */
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

  /* ------------------------------------------------------------------
   * 1. Data. Edit these to change the school's courses and teachers; the
   *    HTML pages show the same content (update both).
   * ------------------------------------------------------------------ */
  var LANGS = [
    {"id":"spanish","code":"ES","name":"Spanish","tone":"es"},
    {"id":"french","code":"FR","name":"French","tone":"fr"},
    {"id":"italian","code":"IT","name":"Italian","tone":"it"},
    {"id":"german","code":"DE","name":"German","tone":"de"},
    {"id":"japanese","code":"JA","name":"Japanese","tone":"ja"},
    {"id":"portuguese","code":"PT","name":"Portuguese","tone":"pt"}
  ];
  var LEVELS = [
    {"id":"a1","code":"A1","name":"Beginner","about":"You're starting from scratch or remember only a few words."},
    {"id":"a2","code":"A2","name":"Elementary","about":"You can handle simple, familiar situations and want more confidence."},
    {"id":"b1","code":"B1","name":"Intermediate","about":"You can get by on a trip and want to say more of what you really think."},
    {"id":"b2","code":"B2","name":"Upper intermediate","about":"You speak with some ease and want to sound natural on any topic."},
    {"id":"c1","code":"C1","name":"Advanced","about":"You're fluent and want nuance, idiom and confidence in fast conversation."}
  ];
  // Demo dates: COURSES are written for the winter term in TERM (US dates). While KEEP_DEMO_CURRENT is true
  // and that term has started, the term and every course start move on to the same term the next year, in
  // whole weeks so weekdays never change (January 11, 2027 becomes January 10, 2028), so the demo always
  // offers an upcoming term. Set it to false once COURSES and TERM hold your real dates.
  var KEEP_DEMO_CURRENT = true;
  var TERM = { starts: '2027-01-11', ends: '2027-03-26' };
  var DAYS = ["Mon","Tue","Wed","Thu","Fri","Sat"];
  // days: 0 = Monday … 5 = Saturday. starts: the first class (YYYY-MM-DD). fee: dollars per term.
  var COURSES = [
    {"id":"es-a1-evening","lang":"spanish","level":"a1","format":"in-person","title":"Spanish for Beginners","days":[0,2],"start":"18:30","end":"20:00","weeks":10,"starts":"2027-01-11","fee":395,"teacher":"lucia-ferrer","seats":4,"room":"Room 2","summary":"Your first ten weeks of Spanish: real conversations from the very first evening.","description":"A friendly evening class for complete beginners. You'll learn to introduce yourself, order, ask for directions and talk about your week, with grammar introduced as you need it and plenty of speaking in pairs."},
    {"id":"es-a2-online","lang":"spanish","level":"a2","format":"online","title":"Spanish Elementary","days":[1,3],"start":"19:00","end":"20:30","weeks":10,"starts":"2027-01-12","fee":355,"teacher":"tomas-ibarra","seats":6,"room":"Online","summary":"Build on the basics with stories, travel Spanish and a lot more confidence.","description":"For learners who know the present tense and want to tell stories, travel with ease and understand more of what they hear. Classes are live on video with breakout rooms for pair work."},
    {"id":"es-b1-evening","lang":"spanish","level":"b1","format":"in-person","title":"Intermediate Spanish","days":[1,3],"start":"18:30","end":"20:00","weeks":10,"starts":"2027-01-12","fee":395,"teacher":"lucia-ferrer","seats":2,"room":"Room 1","summary":"Say what you really think: opinions, plans and the news, in Spanish.","description":"You can get by; now you want to explain, argue and plan. Expect short news items, role plays and a talk of your own by the end of term."},
    {"id":"es-b2-conversation","lang":"spanish","level":"b2","format":"in-person","title":"Spanish Conversation Club","days":[5],"start":"10:00","end":"12:00","weeks":8,"starts":"2027-01-16","fee":280,"teacher":"beatriz-lima","seats":7,"room":"The Library","summary":"Two hours of lively discussion every Saturday morning, with coffee.","description":"A conversation class for confident speakers. Each week has a theme, a short text or clip and a lot of talking, with feedback on the mistakes that matter."},
    {"id":"fr-a1-evening","lang":"french","level":"a1","format":"in-person","title":"French for Beginners","days":[0,2],"start":"18:30","end":"20:00","weeks":10,"starts":"2027-01-11","fee":395,"teacher":"julien-mbaye","seats":5,"room":"Room 3","summary":"Start speaking French with confidence, two evenings a week.","description":"Our most popular course. From bonjour to booking a table, you'll learn the French you need for a first trip, with music, short clips and a lot of practice."},
    {"id":"fr-a2-lunchtime","lang":"french","level":"a2","format":"online","title":"Lunchtime French","days":[1,3],"start":"12:30","end":"13:30","weeks":10,"starts":"2027-01-12","fee":295,"teacher":"camille-roussel","seats":8,"room":"Online","summary":"An hour of French in your lunch break, live online.","description":"Short, focused classes for people with a little French and not much time. Each hour has one goal, from describing your weekend to sorting out a problem on vacation."},
    {"id":"fr-c1-culture","lang":"french","level":"c1","format":"in-person","title":"Advanced French: Culture and Debate","days":[3],"start":"19:00","end":"21:00","weeks":10,"starts":"2027-01-14","fee":345,"teacher":"camille-roussel","seats":3,"room":"The Library","summary":"Films, essays and debate for fluent speakers who want more.","description":"A seminar-style class built around a film or essay each week. You'll work on nuance, idiom and register, and finish the term with a full-length debate."},
    {"id":"it-a1-online","lang":"italian","level":"a1","format":"online","title":"Italian for Beginners","days":[0],"start":"19:00","end":"21:00","weeks":10,"starts":"2027-01-11","fee":310,"teacher":"giulia-conti","seats":6,"room":"Online","summary":"One relaxed evening a week of Italian, live from your couch.","description":"A two-hour weekly class for complete beginners. Pronunciation, everyday phrases and the grammar behind them, taught by a Bolognese translator with a lot of patience."},
    {"id":"it-b1-saturday","lang":"italian","level":"b1","format":"in-person","title":"Italian Intermediate","days":[5],"start":"10:00","end":"12:30","weeks":10,"starts":"2027-01-16","fee":360,"teacher":"giulia-conti","seats":5,"room":"Room 2","summary":"Saturday mornings of conversation, reading and real Italian.","description":"For learners who can manage a conversation and want to go further. Each session mixes speaking, a short reading and one grammar point, and the term ends with lunch in Italian."},
    {"id":"de-a1-intensive","lang":"german","level":"a1","format":"in-person","title":"German Intensive Beginners","days":[0,1,2,3,4],"start":"09:30","end":"12:30","weeks":2,"starts":"2027-02-01","fee":525,"teacher":"anke-weber","seats":6,"room":"Room 1","summary":"A whole beginner level in two weeks of weekday mornings.","description":"Thirty hours of German over ten mornings: ideal before a move, a new job or a long trip. Small group, daily homework and a lot of speaking."},
    {"id":"de-b2-online","lang":"german","level":"b2","format":"online","title":"Upper-intermediate German","days":[1,3],"start":"07:30","end":"08:30","weeks":10,"starts":"2027-01-12","fee":295,"teacher":"anke-weber","seats":4,"room":"Online","summary":"Early-morning German for professionals, before the business day.","description":"Two focused hours a week for confident speakers. Business vocabulary, meetings, emails and the news, with individual feedback on your writing."},
    {"id":"ja-a1-evening","lang":"japanese","level":"a1","format":"in-person","title":"Japanese for Beginners","days":[2],"start":"18:30","end":"20:30","weeks":12,"starts":"2027-01-13","fee":425,"teacher":"haruka-sato","seats":3,"room":"Room 3","summary":"Speak, listen and read your first hiragana and katakana.","description":"A weekly evening class for complete beginners. You'll learn everyday Japanese for greetings, shopping and travel, and read both kana scripts by the end of term."},
    {"id":"pt-a2-online","lang":"portuguese","level":"a2","format":"online","title":"Portuguese Elementary","days":[2],"start":"19:00","end":"20:30","weeks":10,"starts":"2027-01-13","fee":265,"teacher":"beatriz-lima","seats":6,"room":"Online","summary":"Brazilian and European Portuguese, side by side, live online.","description":"For learners with the basics who want to talk about their lives, travel and plans. You'll hear and practice both Brazilian and European Portuguese."}
  ];
  var TEACHERS = [
    {"id":"lucia-ferrer","name":"Lucía Ferrer","role":"Head of Spanish","from":"Valencia","years":14,"bio":"Lucía taught in Valencia and Houston before helping to found Lingua. She believes in talking from the first minute, and in learning the grammar once you need it.","quote":"Mistakes are the sound of someone learning."},
    {"id":"tomas-ibarra","name":"Tomás Ibarra","role":"Spanish teacher","from":"Bilbao","years":8,"bio":"Tomás grew up between Bilbao and São Paulo. He teaches our online Spanish groups and loves a good debate about soccer, food or film.","quote":"Every class should have at least one good laugh."},
    {"id":"beatriz-lima","name":"Beatriz Lima","role":"Portuguese and Spanish teacher","from":"Porto","years":11,"bio":"Beatriz runs the Saturday conversation club and our Portuguese course. Before teaching she was a radio presenter in Porto.","quote":"Listen first. The words will follow."},
    {"id":"camille-roussel","name":"Camille Roussel","role":"Academic director, French","from":"Lyon","years":19,"bio":"Camille co-founded Lingua in 2009. She trains our teachers, writes our level descriptors and still teaches the advanced French class every Thursday.","quote":"A language is a way of seeing, not a list of rules."},
    {"id":"julien-mbaye","name":"Julien Mbaye","role":"French teacher","from":"Dakar and Marseille","years":6,"bio":"Julien teaches beginners and brings French from Dakar, Montréal and Marseille into class through music, podcasts and news.","quote":"French has many accents. You'll hear all of them."},
    {"id":"giulia-conti","name":"Giulia Conti","role":"Head of Italian","from":"Bologna","years":12,"bio":"Giulia is a translator as well as a teacher. Her Saturday group ends each term with a long lunch, ordered entirely in Italian.","quote":"Gesture counts. So does pronunciation."},
    {"id":"anke-weber","name":"Anke Weber","role":"German teacher","from":"Hamburg","years":10,"bio":"Anke designed our two-week German intensive. She also teaches early-morning online classes for people who learn best before work.","quote":"Small steps, every day, add up fast."},
    {"id":"haruka-sato","name":"Haruka Sato","role":"Japanese teacher","from":"Sendai","years":9,"bio":"Haruka teaches speaking and the two kana scripts side by side, with plenty of practice from manga, menus and train schedules.","quote":"Read a little every day. Kana become friends."}
  ];
  // Five modules per level (shared by every language), and what learners can do at the end.
  var SYLLABUS = {
    a1: [["First conversations","Greetings, introducing yourself, numbers and spelling your name."],["Everyday life","Days, times and routines; talking about home, family and work."],["Out and about","Ordering food and drink, shopping and asking about prices."],["Getting around","Directions, transport and places in town."],["Plans and memories","Making plans and saying what you did last weekend."]],
    a2: [["People and places","Describing people, homes and the places you know."],["Telling stories","Past tenses for vacations, anecdotes and life events."],["Travel with confidence","Booking, checking in and solving small problems on a trip."],["Health and services","The doctor, the pharmacy, the bank and the post office."],["Making arrangements","Invitations, phone calls and messages."]],
    b1: [["Opinions and reasons","Agreeing, disagreeing and explaining why."],["Work and study","Talking about your job, your plans and your experience."],["In the news","Following short news items and discussing them."],["What if…","Hypotheticals, wishes and advice."],["Your topic","Preparing and giving a short talk to the group."]],
    b2: [["Debate","Persuading, conceding and keeping a discussion going."],["Film, books and media","Reviews, recommendations and talking about stories."],["Society and change","Longer discussions on the issues people care about."],["Formal and informal","Changing register for emails, meetings and friends."],["Fluency workshop","Speed, rhythm and sounding natural."]],
    c1: [["Nuance and idiom","The expressions native speakers use without thinking."],["Long reads","Essays, columns and fiction, read and discussed in depth."],["Culture and history","The ideas behind the language, from cinema to politics."],["Speaking at work","Presentations, negotiations and difficult conversations."],["The final debate","A full-length debate on a topic the group chooses."]]
  };
  var OUTCOMES = {
    a1: ["Introduce yourself and others","Order in a café or restaurant","Ask for directions and understand the answer","Talk about your day and your plans"],
    a2: ["Tell a short story in the past","Handle most travel situations","Describe people and places in detail","Make and change arrangements by phone"],
    b1: ["Give and defend an opinion","Follow the main points of the news","Talk about your work in some depth","Give a short presentation"],
    b2: ["Hold your own in a debate","Watch films and series with little help","Write clear formal emails","Switch between formal and informal registers"],
    c1: ["Understand humor, irony and idiom","Read long articles and fiction with ease","Speak spontaneously in fast conversation","Present and negotiate at work"]
  };
  var PLACEMENT_QUESTIONS = 10;
  var BOOK_PRICE = 28; // dollars
  var CONCESSION = 0.15; // 15% off the course fee

  var DRAFT_KEY = 'lingua:enrol:v1';
  var PLACEMENT_KEY = 'lingua:placement:v1';
  // Placement score (0–20) needed for each level after A1: A2, B1, B2, C1.
  var PLACEMENT_BANDS = [5, 9, 13, 17];
  var EXPERIENCE = { none: 'Never', some: 'A little', lots: 'For a year or more' };
  var PLANS = { full: 'Pay in full', instalments: 'Three monthly installments' };
  var HEARD = ['friend', 'search', 'social', 'poster', 'work'];

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function find(list, id) { return list.filter(function (x) { return x.id === id; })[0] || null; }
  function findCourse(id) { return find(COURSES, id); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }

  // A URL parameter, by case-insensitive name, lower-cased and trimmed ('' when missing).
  function param(name) {
    var value = null;
    new URLSearchParams(window.location.search).forEach(function (v, k) {
      if (value === null && k.toLowerCase() === name) value = v;
    });
    return value === null ? '' : String(value).trim().toLowerCase();
  }
  // Replace the query string without reloading (keeps the #hash).
  function setQuery(values) {
    var q = new URLSearchParams();
    Object.keys(values).forEach(function (k) { if (values[k] && values[k] !== 'all') q.set(k, values[k]); });
    var qs = q.toString();
    window.history.replaceState(null, '', (qs ? '?' + qs : window.location.pathname) + window.location.hash);
  }
  function optionValues(select) { return $$('option', select).map(function (o) { return o.value; }); }

  function storageGet(key) {
    try { return safeStorage.getItem(key); } catch (e) { return null; }
  }
  function storageSet(key, value) {
    try { safeStorage.setItem(key, value); } catch (e) { /* storage full or blocked */ }
  }
  function storageRemove(key) {
    try { safeStorage.removeItem(key); } catch (e) { /* ignore */ }
  }
  function readJSON(key) {
    var raw = storageGet(key);
    if (raw === null) return null;
    try { return JSON.parse(raw); } catch (e) { storageRemove(key); return null; }
  }

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  // Dates are plain strings ("2027-01-11"), formatted without Date objects so time zones never matter.
  function shortDate(iso) { var p = iso.split('-'); return MONTHS[+p[1] - 1].slice(0, 3) + ' ' + +p[2]; }
  function longDate(iso) { var p = iso.split('-'); return MONTHS[+p[1] - 1] + ' ' + +p[2] + ', ' + p[0]; }

  // KEEP_DEMO_CURRENT: once TERM has started, move it and every course start on to the same term in a later
  // year, by whole weeks (the nearest date with the same weekday), so the demo never offers a past term.
  function dayNum(iso) { return Math.round(Date.parse(iso + 'T00:00:00Z') / 86400000); }
  function isoOf(day) { return new Date(day * 86400000).toISOString().slice(0, 10); }
  var TERM_SHIFT = (function () {
    if (!KEEP_DEMO_CURRENT) return 0;
    var today;
    try {
      today = dayNum(new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()));
    } catch (e) { today = dayNum(new Date().toISOString().slice(0, 10)); }
    var start = dayNum(TERM.starts), shift = 0;
    for (var y = 1; start + shift <= today && y < 100; y++) {
      shift = Math.round((dayNum((+TERM.starts.slice(0, 4) + y) + TERM.starts.slice(4)) - start) / 7) * 7;
    }
    return shift;
  })();
  if (TERM_SHIFT) {
    TERM.starts = isoOf(dayNum(TERM.starts) + TERM_SHIFT);
    TERM.ends = isoOf(dayNum(TERM.ends) + TERM_SHIFT);
    COURSES.forEach(function (c) { c.starts = isoOf(dayNum(c.starts) + TERM_SHIFT); });
  }
  function daysLabel(days) {
    if (days.length === 5 && days[0] === 0 && days[4] === 4) return 'Mon to Fri';
    return days.map(function (d) { return DAYS[d]; }).join(' & ');
  }
  // "18:30" → "6:30"; a range shows AM or PM once when both ends share it.
  function clock12(t) { var p = t.split(':'); return (+p[0] % 12 || 12) + ':' + p[1]; }
  function timeLabel(c) {
    var a = +c.start.slice(0, 2) < 12 ? 'AM' : 'PM', b = +c.end.slice(0, 2) < 12 ? 'AM' : 'PM';
    return clock12(c.start) + (a === b ? '' : ' ' + a) + '–' + clock12(c.end) + ' ' + b;
  }
  function scheduleLabel(c) { return daysLabel(c.days) + ', ' + timeLabel(c); }
  function minutes(t) { var p = t.split(':'); return +p[0] * 60 + +p[1]; }
  function totalHours(c) { return (minutes(c.end) - minutes(c.start)) * c.days.length * c.weeks / 60; }
  function placesLabel(c) { return c.seats === 1 ? 'Last seat left' : c.seats <= 3 ? 'Only ' + c.seats + ' seats left' : c.seats + ' seats left'; }
  function formatLine(c) { return c.format === 'online' ? 'Live online' : 'In person · ' + c.room; }
  function levelLabel(c) { var l = find(LEVELS, c.level); return l.code + ' · ' + l.name; }
  // Money in cents → "$274.75".
  function pounds(pence) { return '$' + (pence / 100).toFixed(2); }

  var ICONS = {
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    pin: '<path d="M12 21s-6.5-6.2-6.5-11.2a6.5 6.5 0 0 1 13 0C18.5 14.8 12 21 12 21z"/><circle cx="12" cy="9.8" r="2.4"/>',
    video: '<rect x="3" y="6" width="12.5" height="12" rx="2.5"/><path d="m15.5 10.5 5-3v9l-5-3"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.7-3.6 3.3-5.5 6.5-5.5s5.8 1.9 6.5 5.5M16 4.8a3.5 3.5 0 0 1 0 6.4M21.5 20c-.4-2.4-1.7-4-3.5-4.8"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6"/>'
  };
  function icon(name, cls) {
    return '<svg viewBox="0 0 24 24" class="' + cls + '" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICONS[name] + '</svg>';
  }

  // The course card used on the home, courses, course and placement pages.
  function courseCardHTML(c, h) {
    var l = find(LANGS, c.lang);
    var lv = find(LEVELS, c.level);
    return '<article class="reveal is-visible card flex flex-col p-6" data-course-card data-lang="' + c.lang + '" data-level="' + c.level + '" data-format="' + c.format + '">' +
      '<div class="flex items-center justify-between gap-3"><span class="chip tone-' + l.tone + '">' + l.name + '</span><span class="level-badge"><span class="sr-only">Level </span>' + lv.code + '</span></div>' +
      '<' + h + ' class="mt-4 font-display text-2xl leading-tight"><a href="course.html?id=' + c.id + '" class="hover:text-brand">' + esc(c.title) + '</a></' + h + '>' +
      '<p class="mt-2 text-muted">' + esc(c.summary) + '</p>' +
      '<ul class="mt-5 space-y-2 text-sm" aria-label="Course details">' +
      '<li class="flex items-center gap-2.5">' + icon('clock', 'size-4 shrink-0 text-brand') + '<span>' + scheduleLabel(c) + '</span></li>' +
      '<li class="flex items-center gap-2.5">' + icon(c.format === 'online' ? 'video' : 'pin', 'size-4 shrink-0 text-brand') + '<span>' + esc(formatLine(c)) + '</span></li>' +
      '<li class="flex items-center gap-2.5">' + icon('calendar', 'size-4 shrink-0 text-brand') + '<span>' + c.weeks + ' weeks from ' + shortDate(c.starts) + '</span></li>' +
      '</ul>' +
      '<div class="mt-auto pt-6"><div class="flex items-end justify-between gap-4 border-t-2 border-dashed border-ink/15 pt-5">' +
      '<p><span class="font-display text-2xl">$' + c.fee + '</span> <span class="text-sm text-muted">a term</span></p>' +
      '<p class="text-sm font-medium ' + (c.seats <= 3 ? 'text-tomato-ink' : 'text-muted') + '">' + placesLabel(c) + '</p>' +
      '</div></div></article>';
  }

  function setFieldError(input, message) {
    var err = document.getElementById(input.getAttribute('aria-describedby'));
    if (message) input.setAttribute('aria-invalid', 'true');
    else input.removeAttribute('aria-invalid');
    if (err) err.textContent = message || '';
  }
  // Show every card at once (filtered cards may never have scrolled into view).
  function revealAll(cards) { cards.forEach(function (c) { c.classList.add('is-visible'); }); }

  /* ------------------------------------------------------------------
   * 3. Course list filters: language, level and format, kept in the URL
   * ------------------------------------------------------------------ */
  function initCourseFilters() {
    var form = $('[data-course-filters]');
    if (!form) return;
    var selects = $$('[data-filter]', form);
    var cards = $$('[data-course-card]');
    var count = $('[data-course-count]');
    var empty = $('[data-course-empty]');

    function values() {
      var v = {};
      selects.forEach(function (s) { v[s.dataset.filter] = s.value; });
      return v;
    }
    function apply(fromUser) {
      var v = values();
      var shown = 0;
      cards.forEach(function (card) {
        var ok = ['lang', 'level', 'format'].every(function (k) { return v[k] === 'all' || card.dataset[k] === v[k]; });
        card.hidden = !ok;
        if (ok) shown++;
      });
      count.textContent = shown === cards.length ? 'Showing all ' + cards.length + ' courses' : 'Showing ' + shown + ' of ' + cards.length + ' courses';
      empty.classList.toggle('hidden', shown > 0);
      if (fromUser) { revealAll(cards); setQuery(v); }
    }
    // Start from ?lang=&level=&format= (any case); unknown values are ignored.
    selects.forEach(function (s) {
      var v = param(s.dataset.filter);
      if (v && optionValues(s).indexOf(v) !== -1) s.value = v;
      s.addEventListener('change', function () { apply(true); });
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.addEventListener('reset', function (e) {
      e.preventDefault();
      selects.forEach(function (s) { s.value = 'all'; });
      apply(true);
    });
    apply(false);
  }

  /* ------------------------------------------------------------------
   * 4. Course page: course.html?id=<course id> (any case). Unknown ids
   *    show the course in the markup (the first one).
   * ------------------------------------------------------------------ */
  function relatedCourses(c) {
    var same = COURSES.filter(function (x) { return x.lang === c.lang && x.id !== c.id; });
    var more = COURSES.filter(function (x) { return x.lang !== c.lang && x.level === c.level; });
    var rest = COURSES.filter(function (x) { return x.id !== c.id && same.indexOf(x) === -1 && more.indexOf(x) === -1; });
    return same.concat(more, rest).slice(0, 3);
  }
  function syllabusHTML(c) {
    var mods = SYLLABUS[c.level];
    var per = c.weeks / mods.length;
    return mods.map(function (m, i) {
      var a = Math.floor(i * per) + 1;
      var b = Math.floor((i + 1) * per);
      var weeks = c.weeks < mods.length ? 'Part ' + (i + 1) : a === b ? 'Week ' + a : 'Weeks ' + a + '–' + b;
      return '<li class="flex gap-4"><span class="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-white text-sm font-semibold">' + (i + 1) + '</span><span><span class="block text-sm text-muted">' + weeks + '</span><span class="block font-medium">' + esc(m[0]) + '</span><span class="block text-muted">' + esc(m[1]) + '</span></span></li>';
    }).join('');
  }
  function teacherHTML(t) {
    return '<span class="art aspect-[6/5] rounded-2xl border-2 border-ink"><img src="assets/img/teachers/' + t.id + '.svg" alt="Portrait of ' + esc(t.name) + '" width="600" height="500" loading="lazy" decoding="async"></span>' +
      '<div><h2 class="font-display text-2xl">' + esc(t.name) + '</h2><p class="text-sm text-muted">' + esc(t.role) + ' · from ' + esc(t.from) + ' · ' + t.years + ' years teaching</p>' +
      '<p class="mt-4 leading-relaxed">' + esc(t.bio) + '</p><p class="mt-4 font-display text-lg text-brand">“' + esc(t.quote) + '”</p>' +
      '<a href="teachers.html" class="link mt-5 inline-block">All teachers</a></div>';
  }

  function initCoursePage() {
    var root = $('[data-course-page]');
    if (!root) return;
    var c = findCourse(param('id')) || findCourse(root.dataset.courseId) || COURSES[0];
    var l = find(LANGS, c.lang);
    var t = find(TEACHERS, c.teacher);
    var text = {
      title: c.title, lang: l.name, level: levelLabel(c), format: c.format === 'online' ? 'Live online' : 'In person',
      summary: c.summary, schedule: scheduleLabel(c), starts: longDate(c.starts),
      length: c.weeks + ' weeks, ' + totalHours(c) + ' hours', where: formatLine(c), teacher: t.name,
      description: c.description, fee: '$' + c.fee, per: 'for ' + c.weeks + ' weeks'
    };
    Object.keys(text).forEach(function (k) {
      $$('[data-course-field="' + k + '"]').forEach(function (el) { el.textContent = text[k]; });
    });
    var chip = $('[data-course-field="lang"]');
    chip.className = chip.className.replace(/\btone-\w+/, 'tone-' + l.tone);
    $('[data-course-field="outcomes"]').innerHTML = OUTCOMES[c.level].map(function (o) {
      return '<li class="flex gap-3">' + icon('check', 'size-5 shrink-0 text-brand') + '<span>' + esc(o) + '</span></li>';
    }).join('');
    $('[data-course-field="syllabus"]').innerHTML = syllabusHTML(c);
    $('[data-course-field="teacher-card"]').innerHTML = teacherHTML(t);
    $('[data-course-field="places"]').innerHTML = icon('users', 'size-4 shrink-0 text-brand') + '<span>' + placesLabel(c) + '</span>';
    $('[data-course-enrol]').href = 'enrol.html?course=' + c.id + '#enrol';
    $('[data-course-placement]').href = 'placement.html?lang=' + c.lang;
    root.dataset.courseId = c.id;
    $('[data-related-title]').textContent = 'More ' + l.name + ' courses';
    $('[data-related]').innerHTML = relatedCourses(c).map(function (x) { return courseCardHTML(x, 'h3'); }).join('');
    document.title = c.title + ' — Lingua';
  }

  /* ------------------------------------------------------------------
   * 5. Tabs: arrow keys, Home and End move between tabs; #<panel name> in
   *    the URL opens a tab (enrol.html#private).
   * ------------------------------------------------------------------ */
  function initTabs() {
    $$('[role="tablist"]').forEach(function (list) {
      var tabs = $$('[role="tab"]', list);
      function select(tab, focus) {
        tabs.forEach(function (t) {
          var on = t === tab;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
        });
        if (focus) tab.focus();
      }
      tabs.forEach(function (tab, i) {
        tab.addEventListener('click', function () { select(tab, false); });
        tab.addEventListener('keydown', function (e) {
          var next = null;
          if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
          else if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
          else if (e.key === 'Home') next = tabs[0];
          else if (e.key === 'End') next = tabs[tabs.length - 1];
          if (next) { e.preventDefault(); select(next, true); }
        });
      });
      function fromHash() {
        var name = window.location.hash.slice(1).toLowerCase();
        var tab = name && tabs.filter(function (t) { return t.getAttribute('aria-controls') === 'panel-' + name; })[0];
        if (!tab) return;
        select(tab, false);
        list.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
      }
      fromHash();
      window.addEventListener('hashchange', fromHash);
    });
  }

  /* ------------------------------------------------------------------
   * 6. Teacher filter: one language at a time (?lang=)
   * ------------------------------------------------------------------ */
  function initTeacherFilter() {
    var buttons = $$('[data-teacher-filter]');
    if (!buttons.length) return;
    var cards = $$('[data-teacher-card]');
    var count = $('[data-teacher-count]');
    function apply(value, fromUser) {
      var shown = 0;
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.teacherFilter === value)); });
      cards.forEach(function (card) {
        var ok = value === 'all' || card.dataset.langs.split(' ').indexOf(value) !== -1;
        card.hidden = !ok;
        if (ok) shown++;
      });
      count.textContent = shown === cards.length ? 'Showing all ' + cards.length + ' teachers' : 'Showing ' + shown + ' of ' + cards.length + ' teachers';
      if (fromUser) { revealAll(cards); setQuery({ lang: value }); }
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { apply(b.dataset.teacherFilter, true); }); });
    var start = param('lang');
    apply(find(LANGS, start) ? start : 'all', false);
  }

  /* ------------------------------------------------------------------
   * 7. Schedule filters: language, format and time of day (?lang=&format=&time=)
   * ------------------------------------------------------------------ */
  function initTimetable() {
    var form = $('[data-timetable-filters]');
    if (!form) return;
    var selects = $$('[data-tt-filter]', form);
    var sessions = $$('[data-session]');
    var count = $('[data-tt-count]');
    function values() {
      var v = {};
      selects.forEach(function (s) { v[s.dataset.ttFilter] = s.value; });
      return v;
    }
    function apply(fromUser) {
      var v = values();
      var shown = 0;
      sessions.forEach(function (li) {
        var day = li.closest('[data-day]').dataset.day;
        var timeOk = v.time === 'all' || (v.time === 'saturday' ? day === '5' : li.dataset.time === v.time);
        var ok = timeOk && (v.lang === 'all' || li.dataset.lang === v.lang) && (v.format === 'all' || li.dataset.format === v.format);
        li.hidden = !ok;
        if (ok) shown++;
      });
      $$('[data-day]').forEach(function (day) {
        var any = $$('[data-session]', day).some(function (li) { return !li.hidden; });
        $('[data-day-empty]', day).classList.toggle('hidden', any);
      });
      $('[data-tt-empty]').classList.toggle('hidden', shown > 0);
      count.textContent = shown === sessions.length ? 'Showing all ' + sessions.length + ' classes a week' : 'Showing ' + shown + ' of ' + sessions.length + ' classes a week';
      if (fromUser) setQuery(v);
    }
    selects.forEach(function (s) {
      var v = param(s.dataset.ttFilter);
      if (v && optionValues(s).indexOf(v) !== -1) s.value = v;
      s.addEventListener('change', function () { apply(true); });
    });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    form.addEventListener('reset', function (e) {
      e.preventDefault();
      selects.forEach(function (s) { s.value = 'all'; });
      apply(true);
    });
    apply(false);
  }

  /* ------------------------------------------------------------------
   * 8. Placement test: a language, then ten can-do statements scored
   *    0 (not yet), 1 (with some effort) or 2 (easily). The result is
   *    saved on this device and shown again on the next visit.
   * ------------------------------------------------------------------ */
  function placementLevel(answers) {
    var score = answers.reduce(function (n, a) { return n + a; }, 0);
    var i = 0;
    while (i < PLACEMENT_BANDS.length && score >= PLACEMENT_BANDS[i]) i++;
    return LEVELS[i];
  }
  // Courses at the level, or else the nearest level (the lower one first when two are as close).
  function recommend(langId, levelId) {
    var target = LEVELS.map(function (l) { return l.id; }).indexOf(levelId);
    var own = COURSES.filter(function (c) { return c.lang === langId; });
    var dist = function (c) {
      var d = LEVELS.map(function (l) { return l.id; }).indexOf(c.level) - target;
      return Math.abs(d) * 2 + (d > 0 ? 1 : 0);
    };
    var best = Math.min.apply(null, own.map(dist));
    return own.filter(function (c) { return dist(c) === best; }).slice(0, 2);
  }
  function sanitizePlacement(raw) {
    if (!raw || typeof raw !== 'object' || !find(LANGS, raw.lang) || !Array.isArray(raw.answers)) return null;
    if (raw.answers.length !== PLACEMENT_QUESTIONS) return null;
    var ok = raw.answers.every(function (a) { return a === 0 || a === 1 || a === 2; });
    return ok ? { lang: raw.lang, answers: raw.answers.slice() } : null;
  }

  function initPlacement() {
    var root = $('[data-placement]');
    if (!root) return;
    var form = $('[data-placement-form]', root);
    var steps = $$('[data-q]', form);
    var result = $('[data-placement-result]', root);
    var back = $('[data-q-back]', form);
    var next = $('[data-q-next]', form);
    var step = 0;

    function checked(name) {
      var input = $('input[name="' + name + '"]:checked', form);
      return input ? input.value : '';
    }
    function nameOf(i) { return i === 0 ? 'lang' : 'q' + i; }
    function answers() {
      return steps.slice(1).map(function (s, i) { var v = checked(nameOf(i + 1)); return v === '' ? null : +v; });
    }
    function show(i, focus) {
      step = i;
      steps.forEach(function (s, k) { s.hidden = k !== i; });
      $('[data-placement-step]', root).textContent = 'Step ' + (i + 1) + ' of ' + steps.length;
      $('[data-placement-bar]', root).style.width = ((100 * (i + 1)) / steps.length).toFixed(2) + '%';
      var l = find(LANGS, checked('lang'));
      $('[data-placement-lang]', root).textContent = i > 0 && l ? l.name : '';
      back.disabled = i === 0;
      next.innerHTML = (i === steps.length - 1 ? 'See my result ' : 'Next ') + icon('arrow-right', 'size-4');
      if (focus) $('[data-q-title]', steps[i]).focus();
    }
    function showResult(saved, focus) {
      var lang = find(LANGS, saved.lang);
      var lv = placementLevel(saved.answers);
      var recs = recommend(lang.id, lv.id);
      var exact = recs.length && recs[0].level === lv.id;
      $('[data-result-code]', result).textContent = lv.code;
      $('[data-result-title]', result).textContent = lang.name + ': ' + lv.code + ' ' + lv.name;
      $('[data-result-about]', result).textContent = lv.about;
      $('[data-result-note]', result).textContent = exact
        ? 'We recommend ' + (recs.length > 1 ? 'one of these courses:' : 'this course:')
        : 'We don\'t run a ' + lang.name + ' ' + lv.code + ' course this term. The closest is:';
      $('[data-result-courses]', result).innerHTML = recs.map(function (c) { return courseCardHTML(c, 'h3'); }).join('');
      var enrol = $('[data-result-enrol]', result);
      enrol.href = 'enrol.html?course=' + recs[0].id + '#enrol';
      enrol.textContent = 'Enroll in ' + recs[0].title;
      var all = $('[data-result-all]', result);
      all.href = 'courses.html?lang=' + lang.id;
      all.textContent = 'See all ' + lang.name + ' courses';
      form.hidden = true;
      result.classList.remove('hidden');
      if (focus) $('[data-result-title]', result).focus();
    }
    function restore(saved) {
      var lang = $('input[name="lang"][value="' + saved.lang + '"]', form);
      if (lang) lang.checked = true;
      saved.answers.forEach(function (a, i) {
        var input = $('input[name="q' + (i + 1) + '"][value="' + a + '"]', form);
        if (input) input.checked = true;
      });
    }

    form.addEventListener('change', function (e) {
      var err = document.getElementById(e.target.getAttribute('aria-describedby'));
      if (err) err.textContent = '';
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var name = nameOf(step);
      if (!checked(name)) {
        document.getElementById('q' + step + '-error').textContent = step === 0 ? 'Choose a language to continue.' : 'Choose an answer to continue.';
        $('input[name="' + name + '"]', form).focus();
        return;
      }
      if (step < steps.length - 1) { show(step + 1, true); return; }
      var saved = { lang: checked('lang'), answers: answers() };
      storageSet(PLACEMENT_KEY, JSON.stringify(saved));
      showResult(saved, true);
    });
    back.addEventListener('click', function () { if (step > 0) show(step - 1, true); });
    $('[data-placement-restart]', result).addEventListener('click', function () {
      storageRemove(PLACEMENT_KEY);
      form.reset();
      $$('.field-error', form).forEach(function (p) { p.textContent = ''; });
      form.hidden = false;
      result.classList.add('hidden');
      show(0, true);
    });

    // ?lang=<language> starts a new test with that language chosen; otherwise a saved result is shown.
    var fromURL = find(LANGS, param('lang'));
    var saved = sanitizePlacement(readJSON(PLACEMENT_KEY));
    if (!saved) storageRemove(PLACEMENT_KEY);
    if (fromURL) {
      $('input[name="lang"][value="' + fromURL.id + '"]', form).checked = true;
      show(0, false);
    } else if (saved) {
      restore(saved);
      show(steps.length - 1, false);
      showResult(saved, false);
    } else show(0, false);
  }

  /* ------------------------------------------------------------------
   * 9. Enrollment: four steps (course, details, options, review) with a
   *    live fee summary. The draft is saved on every change and checked
   *    on every read: unknown courses, bad values and junk are dropped.
   * ------------------------------------------------------------------ */
  function cleanText(v, max) {
    return typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f]/g, '').slice(0, max) : '';
  }
  function sanitizeDraft(raw) {
    var d = { course: '', first: '', last: '', email: '', phone: '', experience: '', plan: 'full', concession: false, book: false, heard: '' };
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return d;
    if (typeof raw.course === 'string' && findCourse(raw.course)) d.course = raw.course;
    d.first = cleanText(raw.first, 60);
    d.last = cleanText(raw.last, 60);
    d.email = cleanText(raw.email, 120);
    d.phone = cleanText(raw.phone, 30);
    if (typeof raw.experience === 'string' && EXPERIENCE.hasOwnProperty(raw.experience)) d.experience = raw.experience;
    if (typeof raw.plan === 'string' && PLANS.hasOwnProperty(raw.plan)) d.plan = raw.plan;
    d.concession = raw.concession === true;
    d.book = raw.book === true;
    if (HEARD.indexOf(raw.heard) !== -1) d.heard = raw.heard;
    return d;
  }
  function readDraft() {
    var raw = readJSON(DRAFT_KEY);
    var d = sanitizeDraft(raw);
    // Write back the repaired draft, so storage never keeps values the page ignores.
    if (raw !== null && JSON.stringify(raw) !== JSON.stringify(d)) storageSet(DRAFT_KEY, JSON.stringify(d));
    return d;
  }

  // Fees in cents: course fee, discount, book, total and the three installments.
  function enrolQuote(d) {
    var c = findCourse(d.course);
    if (!c) return null;
    var fee = c.fee * 100;
    var discount = d.concession ? Math.round(fee * CONCESSION) : 0;
    var book = d.book ? BOOK_PRICE * 100 : 0;
    var total = fee - discount + book;
    var part = Math.floor(total / 3);
    return { course: c, fee: fee, discount: discount, book: book, total: total, instalments: [part, part, total - 2 * part] };
  }

  function initEnrol() {
    var root = $('[data-enrol]');
    if (!root) return;
    var form = $('[data-enrol-form]', root);
    var done = $('[data-enrol-done]', root);
    var back = $('[data-step-back]', root);
    var next = $('[data-step-next]', root);
    var panels = $$('[data-step]', form);
    var step = 1;
    var draft = readDraft();
    var fromURL = findCourse(param('course'));
    if (fromURL) { draft.course = fromURL.id; storageSet(DRAFT_KEY, JSON.stringify(draft)); }

    function fill() {
      form.course.value = draft.course;
      ['first', 'last', 'email', 'phone'].forEach(function (k) { form[k].value = draft[k]; });
      $$('input[name="experience"]', form).forEach(function (r) { r.checked = r.value === draft.experience; });
      $$('input[name="plan"]', form).forEach(function (r) { r.checked = r.value === draft.plan; });
      form.concession.checked = draft.concession;
      form.book.checked = draft.book;
      form.heard.value = draft.heard;
    }
    function read() {
      var radio = function (name) { var r = $('input[name="' + name + '"]:checked', form); return r ? r.value : ''; };
      draft = sanitizeDraft({
        course: form.course.value, first: form.first.value, last: form.last.value, email: form.email.value,
        phone: form.phone.value, experience: radio('experience'), plan: radio('plan'),
        concession: form.concession.checked, book: form.book.checked, heard: form.heard.value
      });
      storageSet(DRAFT_KEY, JSON.stringify(draft));
    }

    function renderInfo() {
      var c = findCourse(draft.course);
      $('[data-course-info]', root).innerHTML = c
        ? '<p class="font-medium">' + scheduleLabel(c) + '</p><p class="mt-1 text-muted">' + esc(formatLine(c)) + ' · ' + c.weeks + ' weeks from ' + longDate(c.starts) + ' · with ' + esc(find(TEACHERS, c.teacher).name) + '</p><p class="mt-1 font-medium ' + (c.seats <= 3 ? 'text-tomato-ink' : 'text-muted') + '">' + placesLabel(c) + '</p>'
        : '<p class="text-muted">Choose a course to see when and where it runs.</p>';
    }
    function row(label, value, extra) {
      return '<div class="flex justify-between gap-4' + (extra || '') + '"><dt>' + label + '</dt><dd class="text-right">' + value + '</dd></div>';
    }
    function renderSummary() {
      var q = enrolQuote(draft);
      var body = $('[data-summary-body]', root);
      if (!q) { body.innerHTML = '<p class="text-muted">Choose a course to see the fees.</p>'; return; }
      var c = q.course;
      body.innerHTML = '<p class="font-semibold">' + esc(c.title) + '</p>' +
        '<p class="mt-1 text-sm text-muted">' + levelLabel(c) + ' · ' + scheduleLabel(c) + '</p>' +
        '<p class="text-sm text-muted">' + esc(formatLine(c)) + ', from ' + longDate(c.starts) + '</p>' +
        '<dl class="mt-5 space-y-2 border-t-2 border-dashed border-ink/15 pt-4 text-sm">' +
        row('Course fee', pounds(q.fee)) +
        (q.discount ? row('Discount (15%)', '−' + pounds(q.discount)) : '') +
        (q.book ? row('Course book', pounds(q.book)) : '') +
        row('Total', pounds(q.total), ' border-t-2 border-ink pt-3 text-base font-semibold') +
        '</dl>' +
        (draft.plan === 'instalments' ? '<p class="mt-3 text-sm text-muted">Three monthly payments: ' + pounds(q.instalments[0]) + ', ' + pounds(q.instalments[1]) + ' and ' + pounds(q.instalments[2]) + '</p>' : '') +
        '<p class="mt-4 text-sm font-medium ' + (c.seats <= 3 ? 'text-tomato-ink' : 'text-muted') + '">' + placesLabel(c) + '</p>';
    }
    function renderReview() {
      var q = enrolQuote(draft);
      var rows = [
        ['Course', esc(q.course.title) + ' (' + levelLabel(q.course) + ')'],
        ['When', scheduleLabel(q.course) + ', from ' + longDate(q.course.starts)],
        ['Name', esc(draft.first + ' ' + draft.last)],
        ['Email', esc(draft.email)],
        ['Phone', draft.phone ? esc(draft.phone) : 'Not given'],
        ['Studied before', EXPERIENCE[draft.experience]],
        ['Payment', PLANS[draft.plan]],
        ['Discount rate', draft.concession ? 'Yes' : 'No'],
        ['Course book', draft.book ? 'Yes' : 'No'],
        ['Total', pounds(q.total)]
      ];
      $('[data-review]', root).innerHTML = rows.map(function (r) {
        return '<div class="flex flex-wrap justify-between gap-x-6 gap-y-1 py-3"><dt class="text-muted">' + r[0] + '</dt><dd class="text-right font-medium break-all">' + r[1] + '</dd></div>';
      }).join('');
    }

    // Validation for one step; returns the first invalid field (or null).
    function validate(n) {
      var bad = [];
      function need(field, ok, message) { setFieldError(field, ok ? '' : message); if (!ok) bad.push(field); }
      if (n === 1) need(form.course, !!findCourse(form.course.value), 'Choose a course.');
      if (n === 2) {
        need(form.first, form.first.value.trim() !== '', 'Enter your first name.');
        need(form.last, form.last.value.trim() !== '', 'Enter your last name.');
        var email = form.email.value.trim();
        need(form.email, email !== '' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), email ? 'Enter a valid email address, like name@example.com.' : 'Enter your email address.');
        var phone = form.phone.value.trim();
        need(form.phone, phone === '' || (/^[+()\d\s-]+$/.test(phone) && phone.replace(/\D/g, '').length >= 7), 'Enter a valid phone number, or leave it blank.');
        var exp = $$('input[name="experience"]', form);
        var expOk = exp.some(function (r) { return r.checked; });
        exp.forEach(function (r) { if (expOk) r.removeAttribute('aria-invalid'); else r.setAttribute('aria-invalid', 'true'); });
        document.getElementById('e-experience-error').textContent = expOk ? '' : 'Tell us whether you have studied this language before.';
        if (!expOk) bad.push(exp[0]);
      }
      if (n === 4) need(form.terms, form.terms.checked, 'Please accept the terms to continue.');
      return bad[0] || null;
    }

    function show(n, focus) {
      step = n;
      panels.forEach(function (p) { p.hidden = +p.dataset.step !== n; });
      $$('[data-step-indicator]', root).forEach(function (li) {
        var k = +li.dataset.stepIndicator;
        li.dataset.stepState = k < n ? 'done' : k === n ? 'current' : 'todo';
        if (k === n) li.setAttribute('aria-current', 'step');
        else li.removeAttribute('aria-current');
      });
      back.hidden = n === 1;
      next.innerHTML = n === 4 ? 'Confirm enrollment' : 'Continue ' + icon('arrow-right', 'size-4');
      if (n === 4) renderReview();
      if (focus) $('[data-step-title]', panels[n - 1]).focus();
    }

    form.addEventListener('input', function (e) {
      read();
      if (e.target.getAttribute('aria-invalid') === 'true' && e.target.type !== 'radio') validate(step);
      renderInfo();
      renderSummary();
    });
    form.addEventListener('change', function (e) {
      read();
      if (e.target.name === 'experience' || e.target.name === 'terms' || e.target.name === 'course') {
        if ($('[aria-invalid="true"]', form)) validate(step);
      }
      renderInfo();
      renderSummary();
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = validate(step);
      if (bad) { bad.focus(); return; }
      if (step < 4) { show(step + 1, true); return; }
      // To send for real, post the enrollment to your booking system here, e.g.
      // fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form) })
      var c = findCourse(draft.course);
      $('[data-done-title]', done).textContent = 'Thank you, ' + draft.first.trim() + '!';
      $('[data-done-text]', done).textContent = 'Your enrollment in ' + c.title + ', starting ' + longDate(c.starts) + ', has reached us. We\'ll email ' + draft.email.trim() + ' within one business day to confirm your spot and explain how to pay.';
      $('[data-ref]', done).textContent = makeRef('LI');
      storageRemove(DRAFT_KEY);
      form.hidden = true;
      $('ol[aria-label="Enrollment steps"]', root).hidden = true;
      done.classList.remove('hidden');
      done.focus();
    });
    back.addEventListener('click', function () { if (step > 1) show(step - 1, true); });
    $('[data-enrol-restart]', done).addEventListener('click', function () {
      draft = sanitizeDraft(null);
      form.reset();
      fill();
      $$('[aria-invalid]', form).forEach(function (f) { f.removeAttribute('aria-invalid'); });
      $$('.field-error', form).forEach(function (p) { p.textContent = ''; });
      form.hidden = false;
      $('ol[aria-label="Enrollment steps"]', root).hidden = false;
      done.classList.add('hidden');
      renderInfo();
      renderSummary();
      show(1, true);
    });

    fill();
    renderInfo();
    renderSummary();
    show(1, false);
  }

  /* ------------------------------------------------------------------
   * 10. Contact and newsletter forms (data-form): inline errors, then a
   *     success message. They don't send anything until you connect them.
   * ------------------------------------------------------------------ */
  // A short reference for confirmations, like LI-7K2Q (no 0/O or 1/I to misread over the phone).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }

  function initForms() {
    $$('form[data-form]').forEach(function (form) {
      var fields = $$('input, textarea, select', form).filter(function (f) { return f.hasAttribute('required') || f.type === 'email'; });
      function message(f) {
        if (f.validity.valueMissing) {
          if (f.type === 'email') return 'Enter your email address.';
          if (f.name === 'name') return 'Enter your name.';
          if (f.tagName === 'TEXTAREA') return 'Write a message.';
          return 'Please fill in this field.';
        }
        if (f.validity.typeMismatch) return 'Enter a valid email address, like name@example.com.';
        if (f.validity.tooShort) return 'Please write at least ' + f.minLength + ' characters.';
        return '';
      }
      function check(f) { var m = message(f); setFieldError(f, m); return !m; }
      fields.forEach(function (f) {
        f.addEventListener('blur', function () { if (f.value) check(f); });
        f.addEventListener('input', function () { if (f.getAttribute('aria-invalid') === 'true') check(f); });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var bad = fields.filter(function (f) { return !check(f); });
        var success = $('[data-form-success]', form) || $('[data-form-success]', form.parentNode);
        if (bad.length) { bad[0].focus(); return; }
        // To send for real: fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form) })
        form.reset();
        fields.forEach(function (f) { f.removeAttribute('aria-invalid'); });
        var ref = success && $('[data-ref]', success);
        if (ref) ref.textContent = makeRef('LI');
        if (success) { success.classList.remove('hidden'); success.setAttribute('tabindex', '-1'); success.focus(); }
      });
    });
  }

  // contact.html?topic=private chooses the topic (any case; only the form's own topics).
  function initContactPrefill() {
    var topic = $('#topic');
    if (!topic) return;
    var v = param('topic');
    if (v && optionValues(topic).indexOf(v) !== -1) topic.value = v;
  }

  /* ------------------------------------------------------------------
   * 11. Header, mobile menu, scroll reveal, year
   * ------------------------------------------------------------------ */
  function initChrome() {
    var menuBtn = $('#menu-toggle');
    var menu = $('#mobile-menu');
    function setMenu(open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.querySelector('.sr-only').textContent = open ? 'Close menu' : 'Menu';
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
      window.matchMedia('(min-width: 1024px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
    }

    var header = $('#site-header');
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    // Term and course dates written in the pages (see KEEP_DEMO_CURRENT): data-term="year", "starts"
    // ("January 11") or "ends" ("March 26, 2027"), and data-course-from="<course id>" ("10 weeks from Jan 11").
    $$('[data-term]').forEach(function (el) {
      var k = el.getAttribute('data-term');
      if (k === 'year') el.textContent = TERM.starts.slice(0, 4);
      else if (k === 'starts') el.textContent = longDate(TERM.starts).replace(/, \d{4}$/, TERM.starts.slice(0, 4) === TERM.ends.slice(0, 4) ? '' : ', ' + TERM.starts.slice(0, 4));
      else if (k === 'ends') el.textContent = longDate(TERM.ends);
    });
    $$('[data-course-from]').forEach(function (el) {
      var c = findCourse(el.getAttribute('data-course-from'));
      if (c) el.textContent = c.weeks + ' weeks from ' + shortDate(c.starts);
    });

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
    items.forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });
  }

  initChrome();
  initCourseFilters();
  initCoursePage();
  initTabs();
  initTeacherFilter();
  initTimetable();
  initPlacement();
  initEnrol();
  initForms();
  initContactPrefill();

  // Exposed for tests and debugging.
  window.Lingua = { enrolQuote: enrolQuote, sanitizeDraft: sanitizeDraft, placementLevel: placementLevel, recommend: recommend };
})();

/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. Mark your own UI with data-back-to-top-avoid (lift
   above it) or data-back-to-top-hide (hide while covering it). To remove the
   button: delete this block and the .back-to-top styles in src/input.css. */
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
  var AVOID = '[data-back-to-top-avoid]';
  var queued = false;

  function lift() {
    var offset = 0;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    Array.prototype.forEach.call(document.querySelectorAll(AVOID), function (el) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      if (r.bottom > vh - 140 && r.right > vw - 96 && r.top < vh) offset = Math.max(offset, vh - r.top + 8);
    });
    btn.style.setProperty('--btt-lift', offset + 'px');
  }

  // Elements marked data-back-to-top-hide (sticky summaries) hide the button while it would cover them.
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
    var menuOpen = document.documentElement.classList.contains('menu-open');
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !coversHideZone() && !menuOpen);
    lift();
  }
  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
  update();

  function focusTop() {
    var target = document.getElementById('main') || document.querySelector('main');
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.classList.add('back-to-top-target');
    target.focus({ preventScroll: true });
  }

  btn.addEventListener('click', function () {
    if (reduceMotion.matches) { window.scrollTo({ top: 0, behavior: 'auto' }); focusTop(); return; }
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
