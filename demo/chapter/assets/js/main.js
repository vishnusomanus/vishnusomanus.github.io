/* Chapter — site scripts for the novelist Clemency Thorne. Vanilla JavaScript, no dependencies.
 *
 *  1. Settings (time zone, storage keys, demo dates)
 *  2. Helpers (escaping, plurals, URL parameters, storage, downloads, toast)
 *  3. Time (every date and time is Eastern time, America/New_York)
 *  4. Data: RETAILERS, SERIES, BOOKS, EVENTS, CONTACT_TOPICS
 *  5. Keeping the demo current (KEEP_DEMO_CURRENT)
 *  6. Artwork: book jackets drawn as SVG
 *  7. Shared UI: header, menu, reveals, back to top, copy buttons
 *  8. Forms (nothing is sent until you connect them; see DOCS.md "Forms")
 *  9. Release countdown and buy links
 * 10. The first-chapter reader (remembers your place)
 * 11. Pages: home, books, book, events, book clubs, press, contact
 * 12. Start
 */
(function () {
  'use strict';

  /* ======================================================================
     1. Settings
     ====================================================================== */
  var SITE_NAME = 'Clemency Thorne';
  var SITE_URL = 'https://clemencythorne.example';
  // Every date and time (publication days, events) is wall-clock time here.
  var TIMEZONE = 'America/New_York';
  var LOCALE = 'en-US';
  var CURRENCY = 'USD';
  // localStorage keys. Both are validated on every read.
  //   reader: { last: '<book id>', pages: { '<book id>': <page number> } }
  //   size:   'sm' | 'md' | 'lg' (reader text size)
  var STORAGE_KEYS = { reader: 'chapter-reader', size: 'chapter-reader-size' };
  // The book the home page, the announcement bar and book.html (with no ?id=) are about.
  var NEW_RELEASE = 'the-glass-marsh';
  // Demo dates: the new book's publication day and the events below are written for the week of
  // DEMO_ANCHOR. While KEEP_DEMO_CURRENT is true they move forward in whole weeks, so the demo always
  // has a countdown to a Tuesday publication day, the usual day for new books in the US, and upcoming events (weekdays and times never
  // change). Set it to false once you enter your real dates: the countdown then switches to
  // "Out now" on publication day and past events disappear on their own.
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
  function param(name) {
    try { return new URLSearchParams(window.location.search).get(name); } catch (e) { return null; }
  }
  function setParams(values) {
    try {
      var url = new URL(window.location.href);
      Object.keys(values).forEach(function (k) {
        if (values[k]) url.searchParams.set(k, values[k]); else url.searchParams.delete(k);
      });
      history.replaceState(null, '', url.pathname + url.search + url.hash);
    } catch (e) { /* file:// in some browsers */ }
  }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Storage that degrades to memory when localStorage is blocked (sandboxed iframes, strict
     privacy settings), so the reader still remembers your place for the page view. */
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
  function writeJSON(key, value) { try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* quota */ } }

  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2600);
  }
  function download(filename, text, type) {
    try {
      var blob = new Blob([text], { type: type || 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
      toast('Downloading ' + filename);
    } catch (e) { toast('Your browser blocked the download'); }
  }
  function copyText(text, done) {
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
      ta.remove();
      done(ok);
    }
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(function () { done(true); }, fallback);
    } else fallback();
  }
  function slugFile(s) { return String(s).toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }

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
  // Milliseconds TIMEZONE is ahead of UTC at an instant (-5 h in winter, -4 h in summer for Eastern time).
  function offsetAt(ms) {
    var p = zoneParts(new Date(ms));
    return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi, p.s) - Math.floor(ms / 1000) * 1000;
  }
  // '2026-11-12T18:30' in TIMEZONE -> Date. Returns null for anything malformed.
  function zonedDate(iso) {
    var m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(String(iso));
    if (!m) return null;
    var guess = Date.UTC(+m[1], +m[2] - 1, +m[3], +m[4], +m[5]);
    var t = guess - offsetAt(guess);
    return new Date(guess - offsetAt(t));
  }
  // Whole days since 1970-01-01 for an ISO date, for today in TIMEZONE, and back again.
  function dayNum(iso) { var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso); return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5 : NaN; }
  function todayNum() { var p = zoneParts(now()); return Date.UTC(p.y, p.m - 1, p.d) / 864e5; }
  function isoFromDayNum(n) { return new Date(n * 864e5).toISOString().slice(0, 10); }
  // 'Tuesday, November 10' (the year is added when it isn't this year, or when withYear is true).
  function longDay(iso, withWeekday, withYear) {
    var d = new Date(dayNum(iso) * 864e5 + 12 * 36e5);
    var opts = { timeZone: 'UTC', day: 'numeric', month: 'long' };
    if (withWeekday !== false) opts.weekday = 'long';
    if (withYear || +iso.slice(0, 4) !== zoneParts(now()).y) opts.year = 'numeric';
    return new Intl.DateTimeFormat(LOCALE, opts).format(d);
  }
  function fmtIn(date, opts, zone) {
    // Some browsers put a narrow no-break space before AM/PM; a plain space keeps copied text and downloads clean.
    return new Intl.DateTimeFormat(LOCALE, Object.assign({ timeZone: zone || TIMEZONE }, opts)).format(date).replace(/\u202f/g, ' ');
  }
  // Short zone label: browsers differ ("EDT" or "GMT-4"), so Eastern time uses its own labels.
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
  function clock(date, zone) { return fmtIn(date, { hour: 'numeric', minute: '2-digit', hourCycle: 'h12' }, zone); }
  // '7:00–8:00 PM', or '11:00 AM–12:15 PM' when the two sides of noon differ.
  function clockRange(start, end) {
    var a = clock(start), b = clock(end);
    if (a.slice(-2) === b.slice(-2)) a = a.slice(0, -3);
    return a + '–' + b;
  }
  var visitorZone = (function () { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { return ''; } })();

  /* ======================================================================
     4. Data. Edit these to make the site yours (see DOCS.md, Content).
     ====================================================================== */
  // Where readers can buy the books. Links are built as url + book id.
  var RETAILERS = {
    'spine-and-story': { name: 'Spine & Story', note: 'from your local independent bookstore', url: 'https://spineandstory.example/books/' },
    bookhound: { name: 'Bookhound', note: 'free US shipping', url: 'https://bookhound.example/title/' },
    pagecraft: { name: 'Pagecraft', note: 'books, ebooks and audio', url: 'https://pagecraft.example/b/' },
    readwell: { name: 'Readwell', note: 'ebooks for every e-reader', url: 'https://readwell.example/ebook/' },
    'listen-lane': { name: 'Listen Lane', note: 'audiobooks', url: 'https://listenlane.example/listen/' }
  };
  var FORMAT_NAMES = { hardback: 'Hardcover', paperback: 'Paperback', ebook: 'Ebook', audio: 'Audiobook' };

  var SERIES = {
    lark: { name: 'The Esme Lark mysteries', label: 'An Esme Lark Mystery', short: 'Esme Lark' }
  };

  /* Every book. `series` is a key of SERIES or null for a standalone; `no` is its place in the
     series reading order. `pub` is the US publication day (YYYY-MM-DD): a book published after
     today shows "Pre-order" and a countdown. `lines` is how the title breaks on the jacket.
     `extract.pages` is the first chapter, one array of paragraphs per page ('* * *' is a
     section break). `questions` feed the book-club guide. */
  var BOOKS = [
    {
      id: 'the-glass-marsh', title: 'The Glass Marsh', lines: ['The Glass', 'Marsh'], series: 'lark', no: 4, pub: '2026-11-10',
      imprint: 'Finch & Holloway', genre: 'Crime', setting: 'The Great Marsh, in the hardest freeze in forty years',
      jacket: { motif: 'reeds', bg: '#1d3b2e', fg: '#f3ead7', accent: '#cfe3d4', line: '#c9a45a' },
      tagline: 'The marsh has frozen. Something has surfaced.',
      blurb: [
        'In the hardest winter anyone on the Great Marsh can remember, the creeks freeze solid and a dog walker sees a lamp burning in the reeds at Fennick Landing. Under the ice beneath it lies a woman in a wedding coat who went missing in 1987.',
        'Detective Sergeant Esme Lark knows the case. Everyone on the Marsh knows the case. What nobody can explain is why the lamp was lit last night, or who knew exactly where to find her.',
        'As the frost holds and the roads close, Esme is cut off with a village that has kept one secret for thirty-nine years and is quite prepared to keep it for thirty-nine more.'
      ],
      formats: [
        { type: 'hardback', isbn: '978-1-0000-1261-3', pages: 384, price: 28, retailers: ['spine-and-story', 'bookhound', 'pagecraft'] },
        { type: 'ebook', isbn: '978-1-0000-1264-4', price: 14.99, retailers: ['readwell', 'pagecraft'] },
        { type: 'audio', isbn: '978-1-0000-1267-5', length: '11 h 42 min', narrator: 'Philippa Strand', price: 24.99, retailers: ['listen-lane', 'pagecraft'] }
      ],
      reviews: [
        { quote: 'Thorne writes cold the way other people write fear. I finished it in one sitting with the heat turned all the way up.', source: 'Bryony Castell, author of The Quiet Year' },
        { quote: 'The best Esme Lark yet: a locked-room mystery the size of a county.', source: 'Dead Letter Quarterly' },
        { quote: 'Atmospheric, humane and fiendishly plotted. The ending made me gasp out loud on a train.', source: 'The Reading Room podcast' }
      ],
      extract: {
        chapter: 'Chapter One', heading: 'A Lamp in the Reeds',
        pages: [
          ['The marsh had frozen overnight, and in the first light it looked like a floor of broken windows.',
            'Detective Sergeant Esme Lark left the car on the causeway and walked the last half-mile, because the track to Fennick Landing had not been plowed in living memory and she did not trust it. Her breath went ahead of her. Somewhere out on the flats a heron complained about being awake.',
            'The call had come at ten past five. A man walking a dog (there was always a man walking a dog) had seen a light in the reeds where no light should be, and then, when he went closer, a shape under the ice. He had not touched it. He had been very clear about that, the dispatcher said, as if it were the thing he was most afraid of being accused of.'],
          ['Officer Tunde Oduya was waiting by the old tide gate with his hands jammed under his arms and the expression of a man who had been told to guard something and had nothing to guard it from.',
            '“Sarge.” He nodded at the reeds. “It’s still burning.”',
            'It was. A storm lantern, the old kerosene kind with a wire handle, stood on a hummock of frozen mud ten yards out into the creek. Its flame was low and very steady. The glass had been cleaned. Someone had trimmed the wick.',
            '“Who lit it?”',
            '“Dog walker says it was lit when he got here. Four-thirty, he figures. Couldn’t sleep.” Tunde’s jaw worked. “He says he thought it was a will-o’-the-wisp. He says his grandmother used to tell him about them.”',
            '“Everybody’s grandmother used to tell them about them,” Esme said. “It’s the Marsh.”'],
          ['She went down the bank on the seat of her pants, because dignity was a summer luxury, and stood at the edge of the ice.',
            'It was clear. That was the first strange thing. Creek water on the Marsh was brown as tea, thick with weed and centuries of silt, but the frost had come down so hard and so fast that the surface had set like poured glass, and through it, lit gold from above by the lantern, she could see the reeds going down into the dark.',
            'And among them, a sleeve.',
            'Pale wool, with a row of tiny covered buttons at the cuff. A hand inside it, the fingers curled as though they had been holding something and had only just let go.',
            'Esme crouched. She did not touch the ice. She looked for a long time at those buttons, and a feeling she had not had since she was eleven years old climbed up the back of her neck and sat there.'],
          ['* * *',
            'Everyone on the Great Marsh knew about Lydia Penhale.',
            'She had walked out of the Ship Tavern at Fennick on New Year’s Eve, 1987, in the cream wool coat she was meant to be married in the following spring, and she had never been seen again. No body. No note. A bicycle found three weeks later in the reeds at Rowley, which proved nothing except that the Marsh kept what it was given.',
            'Esme’s mother had been at the Ship that night. Half the town had. For years afterwards, every Christmas, somebody at somebody’s table would say, “Of course, I always thought…” and somebody else would put down a fork and change the subject.',
            'Esme had been eleven. She had lain awake for a month listening for footsteps on the causeway.'],
          ['“Sarge?” Tunde had come down the bank behind her, more carefully. “You all right?”',
            '“Call the medical examiner’s office,” she said. “And the crime lab. Tell them we’ll need to cut the ice, and tell them I want the lantern photographed exactly where it is before anyone so much as breathes on it.”',
            '“You think it’s her.” It wasn’t a question. Tunde had grown up in Newbury. He knew the story too.',
            'Esme stood. Her knees were wet through and she could not feel her feet.',
            '“I think,” she said, “that somebody knew exactly where she was. And I think that last night, for the first time in thirty-nine years, they wanted us to know too.”'],
          ['The sun came up over Plum Island like something being dragged.',
            'By eight the road behind the causeway was full of vans, and the ice had begun to sing the way ice does when it is stood on by too many people: long low notes that seemed to come from everywhere at once. The forensic team put up a white tent on the frozen creek, and through its walls the lantern glowed like a heart.',
            'Esme watched from the bank with a paper cup of coffee she had not drunk. Across the flats, the windows of Fennick were lighting one by one. She knew most of the people behind them. She had been to school with their children.',
            'One of them had trimmed that wick.',
            'She finished the coffee cold, crushed the cup, and went to start knocking on doors.']
        ]
      },
      themes: ['Memory and silence in a small community', 'What a landscape keeps and gives back', 'Loyalty, and who it protects'],
      questions: [
        'The frozen marsh is described as “a floor of broken windows”. How does the landscape shape the mood of the novel, and the way people behave?',
        'Esme grew up with the story of Lydia Penhale. Does knowing the community make her a better detective, or a worse one?',
        'Several characters say “of course, I always thought…”. Why do you think the village kept its suspicions to itself for so long?',
        'The lantern is lit before the body is found. What did you make of the lantern’s meaning when you first met it, and did that change?',
        'Tunde and Esme come from the same small corner of Essex County but see it very differently. Whose view did you share?',
        'Without giving the ending away to anyone who hasn’t finished: was justice done?'
      ]
    },
    {
      id: 'every-bell-in-salem', title: 'Every Bell in Salem', lines: ['Every Bell in', 'Salem'], series: null, pub: '2024-03-12',
      imprint: 'Finch & Holloway', genre: 'Psychological suspense', setting: 'Salem, over one week of Advent',
      jacket: { motif: 'bells', bg: '#4b1f3a', fg: '#f6e7dc', accent: '#e6a9a0', line: '#d2ad6a' },
      tagline: 'One week. Seven bells. One lie that rings through all of them.',
      blurb: [
        'Every December, the bell-ringers of St. Botolph’s ring for Advent. This year their tower captain is found dead at the foot of the ringing-chamber stairs, and the six ringers left all swear they were holding a rope at the time.',
        'Ruthless, funny and unbearably tense, Every Bell in Salem is a standalone novel about a band of strangers bound together by a rope, a rhythm and a secret.'
      ],
      formats: [
        { type: 'paperback', isbn: '978-1-0000-1251-4', pages: 352, price: 17.99, retailers: ['spine-and-story', 'bookhound', 'pagecraft'] },
        { type: 'ebook', isbn: '978-1-0000-1254-5', price: 9.99, retailers: ['readwell', 'pagecraft'] },
        { type: 'audio', isbn: '978-1-0000-1257-6', length: '10 h 5 min', narrator: 'Rhys Halloran', price: 19.99, retailers: ['listen-lane', 'pagecraft'] }
      ],
      reviews: [
        { quote: 'A whodunit with the precision of a peal. I could hear the bells for days.', source: 'The Literary Standard' },
        { quote: 'Clever, warm and genuinely chilling.', source: 'Tomasz Wilde, author of Under Glass' }
      ],
      extract: {
        chapter: 'Chapter One', heading: 'Rounds',
        pages: [
          ['There are six of us on the ropes on the night Gideon dies, and every one of us will tell you we never let go.',
            'That is the first thing you learn about ringing: you never let go. A bell weighing as much as a small car swings full circle above your head, mouth up, balanced on nothing, and the rope in your hands is the only thing that tells it where to go next. Let go, and the rope goes up through the ceiling like a snake through a hole, and the tail end can take your jaw off on the way.',
            'So we held on. All six of us. That is what we said, and we said it so many times, to so many people, that by the end of Advent I almost believed it myself.'],
          ['I took up ringing the fall after my divorce, because the tower at St. Botolph’s was the only place in Salem where nobody asked how I was.',
            'They asked other things. Whether I could count to six. Whether I minded heights. Whether I was free on Thursday nights and Sunday mornings, every Thursday night and every Sunday morning, for the foreseeable future.',
            '“It’s not a hobby,” Gideon said, on my first night, steadying my rope with one large hand. “It’s a marriage.”',
            'I laughed. He didn’t. I should have paid more attention to that.']
        ]
      },
      themes: ['Belonging and the price of it', 'Ritual, routine and control', 'Unreliable witnesses'],
      questions: [
        'The novel opens with “every one of us will tell you we never let go”. How did that first line shape your trust in the narrator?',
        'Bell-ringing is described as “a marriage”. What does the band give each of its members, and what does it take?',
        'Salem in Advent is a city catching its breath after the October crowds. How does it work as a setting for a crime among neighbors?',
        'Which of the six ringers did you suspect first, and why?',
        'How did the structure of the novel, one chapter per day of the week, change the way you read it?'
      ]
    },
    {
      id: 'low-tide-at-plum-island', title: 'Low Tide at Plum Island', lines: ['Low Tide at', 'Plum Island'], series: 'lark', no: 3, pub: '2023-04-11',
      imprint: 'Finch & Holloway', genre: 'Crime', setting: 'Plum Island and the beaches at the mouth of the Merrimack',
      jacket: { motif: 'lighthouse', bg: '#2b3138', fg: '#f1ece2', accent: '#e8833a', line: '#c7a061' },
      tagline: 'The tide goes out. A body stays behind.',
      blurb: [
        'A retired lighthouse keeper is found drowned in a tide pool at low tide, on a beach where the water never comes in deep enough to drown anyone. Detective Sergeant Esme Lark, back at work after the events of Salt and Shingle, is told to keep it simple.',
        'It isn’t simple. It’s Plum Island: a long strip of dunes and salt marsh, a nuclear plant humming on the horizon and a scatter of weathered cottages where everybody watches everybody else.'
      ],
      formats: [
        { type: 'paperback', isbn: '978-1-0000-1241-5', pages: 368, price: 17.99, retailers: ['spine-and-story', 'bookhound', 'pagecraft'] },
        { type: 'ebook', isbn: '978-1-0000-1244-6', price: 9.99, retailers: ['readwell', 'pagecraft'] },
        { type: 'audio', isbn: '978-1-0000-1247-7', length: '10 h 48 min', narrator: 'Philippa Strand', price: 19.99, retailers: ['listen-lane', 'pagecraft'] }
      ],
      reviews: [
        { quote: 'Esme Lark is the most human detective in American crime fiction.', source: 'Dead Letter Quarterly' },
        { quote: 'Strange, salt-bitten and gripping from the first page.', source: 'The Literary Standard' }
      ],
      extract: {
        chapter: 'Chapter One', heading: 'Slack Water',
        pages: [
          ['The tide at Plum Island goes out the way a guest leaves a party: slowly, and then all at once, and without saying goodbye.',
            'By the time Esme reached the point, it had gone so far that the sea was only a silver line at the edge of the world, and the beach was a long shelf of wet sand and stranded weed and the black ribs of the old jetty. The lighthouse stood behind her, without a keeper for seventy years, and blinked in the daylight as if it had forgotten what time it was.',
            'Edmund Kemp lay face down in a tide pool no deeper than a dishpan.'],
          ['“You can’t drown in that,” said the Coast Guard kid, who had found him.',
            '“You can drown in a teaspoon,” Esme said, “if somebody holds you down.”',
            'She regretted it at once. He was young and very pale and had been sick twice behind the station. But it was the first thing she had thought, kneeling on the cold sand beside the pool, and the thought would not go away.',
            'Edmund’s boots were dry.']
        ]
      },
      themes: ['Isolation and watching', 'Old crimes in new light', 'Coming back to work after trauma'],
      questions: [
        'Plum Island is half wildlife refuge, half summer cottages. How does the strangeness of the place feed the mystery?',
        'Esme returns to work carrying the weight of the previous book. How does the novel handle her recovery?',
        'Edmund Kemp’s dry boots are the first clue. Which small details did you notice that the police missed?',
        'The community on Plum Island watches everybody. Is being watched a kind of protection, or a kind of threat?',
        'If you have read the series in order, how has Esme changed since The Drowned Church?'
      ]
    },
    {
      id: 'the-cartographers-widow', title: 'The Cartographer’s Widow', lines: ['The', 'Cartographer’s', 'Widow'], series: null, pub: '2021-08-31',
      imprint: 'Finch & Holloway', genre: 'Historical fiction', setting: 'Newburyport and Plum Island Sound, 1851',
      jacket: { motif: 'compass', bg: '#262b55', fg: '#f0e7d2', accent: '#d9b25f', line: '#d9b25f' },
      tagline: 'Her husband mapped every creek in Essex County. He left one blank.',
      blurb: [
        'When the surveyor Thomas Aske dies in 1851, his young widow Hester inherits a house full of instruments, a debt she did not know about and a nearly finished map of Plum Island Sound. In its corner, one inlet has been carefully left white.',
        'Hester takes up her husband’s chain and theodolite to finish the map herself, and finds that the blank space on it hides a story some very powerful men would rather stayed unwritten. A standalone historical novel and a finalist for the Harrowell Prize.'
      ],
      formats: [
        { type: 'paperback', isbn: '978-1-0000-1231-6', pages: 416, price: 18.99, retailers: ['spine-and-story', 'bookhound', 'pagecraft'] },
        { type: 'ebook', isbn: '978-1-0000-1234-7', price: 7.99, retailers: ['readwell', 'pagecraft'] },
        { type: 'audio', isbn: '978-1-0000-1237-8', length: '13 h 20 min', narrator: 'Celia Ward', price: 21.99, retailers: ['listen-lane', 'pagecraft'] }
      ],
      reviews: [
        { quote: 'Quietly radical and utterly absorbing. Hester Aske is a heroine to cherish.', source: 'The Literary Standard' },
        { quote: 'A novel about who gets to draw the map, and who gets left off it.', source: 'Marlpit Review of Books' }
      ],
      extract: {
        chapter: 'Chapter One', heading: 'Terra Incognita',
        pages: [
          ['They buried Thomas Aske on a Tuesday, in rain so fine it seemed less to fall than to hang in the air, waiting to be told what to do.',
            'Hester stood at the graveside in a borrowed black dress that was too long in the sleeve, and thought, with a clarity that shamed her, about the map.',
            'It lay on the table in his study, held flat at the corners by a brass inkwell, two lead weights and a volume of Euclid. Fourteen months of work. Every creek and salt meadow of the Sound from Newburyport to Castle Neck, drawn in his small, upright hand. Every creek but one.'],
          ['She had noticed it a week before he died, bringing him tea he did not drink. A little inlet south of the Rowley River, no more than a thumb’s width on the paper, left white.',
            '“You’ve missed one,” she said.',
            'Thomas had looked up at her, and for a moment his face had been a stranger’s face.',
            '“No,” he said. “I haven’t.”',
            'He said nothing more about it. Eight days later he was dead, and the white space was still there, and Hester found she could not stop looking at it.']
        ]
      },
      themes: ['Who records history', 'Grief and independence', 'Land, money and power'],
      questions: [
        'What does the blank space on the map come to mean to Hester as the novel goes on?',
        'Hester learns surveying in secret. How does the novel show the limits placed on women in 1851, and the ways around them?',
        'Thomas is dead before the story starts. How did your view of him change as Hester uncovered his secrets?',
        'The estuary landscape is constantly shifting with the tides. How does that echo the novel’s themes?',
        'Was the ending hopeful, in your view?'
      ]
    },
    {
      id: 'salt-and-shingle', title: 'Salt and Shingle', lines: ['Salt and', 'Shingle'], series: 'lark', no: 2, pub: '2020-05-05',
      imprint: 'Finch & Holloway', genre: 'Crime', setting: 'Gloucester and the Blynman Canal',
      jacket: { motif: 'shingle', bg: '#8e3a24', fg: '#f7ecdc', accent: '#f0c9a1', line: '#e2b878' },
      tagline: 'Every stone on the beach has a story. One of them is a lie.',
      blurb: [
        'A summer festival on the waterfront in Gloucester, a missing teenager and a town that would very much like the police to go home. Detective Sergeant Esme Lark, newly promoted and not yet sure she wanted it, has three days before the tide turns and the story goes cold.',
        'The second Esme Lark mystery: warmer, sunnier and darker than the first.'
      ],
      formats: [
        { type: 'paperback', isbn: '978-1-0000-1221-7', pages: 352, price: 16.99, retailers: ['spine-and-story', 'bookhound', 'pagecraft'] },
        { type: 'ebook', isbn: '978-1-0000-1224-8', price: 6.99, retailers: ['readwell', 'pagecraft'] },
        { type: 'audio', isbn: '978-1-0000-1227-9', length: '9 h 56 min', narrator: 'Philippa Strand', price: 18.99, retailers: ['listen-lane', 'pagecraft'] }
      ],
      reviews: [
        { quote: 'Sun, sea and slow dread. A brilliant second outing.', source: 'Dead Letter Quarterly' },
        { quote: 'Thorne knows a seaside town in August better than anyone.', source: 'Hal Penrose, author of The Ferryman’s Boy' }
      ],
      extract: {
        chapter: 'Chapter One', heading: 'Bunting',
        pages: [
          ['Gloucester had put its bunting up a week early, and by the Friday of the festival it hung over Main Street in faded, flapping loops, like a town that had been holding its breath too long.',
            'Esme had been a detective sergeant for nine days. She had a new desk, a new lanyard and a new feeling in her stomach every time the phone rang, which was that she was about to be found out.',
            'At 11:52 that morning, the phone rang.'],
          ['“Girl’s gone missing,” said the duty lieutenant. “Sixteen. Last seen on the beach by the canal mouth around midnight. Parents are frantic, the city council is frantic about the parents being frantic, and the festival opens at two.”',
            '“And you want me to…”',
            '“Find her by two,” he said, “ideally.”',
            'He was joking. She thought he was joking. She took the car anyway, and drove down to the sea with the windows open and the radio off, and did not let herself think about the canal.']
        ]
      },
      themes: ['Family secrets', 'Vacation towns and the people who live in them', 'Ambition and doubt'],
      questions: [
        'How does the summer setting change the feel of the series compared with The Drowned Church?',
        'Esme doubts her promotion throughout. Did her self-doubt make her more or less effective?',
        'What did you make of the city council’s determination to keep the festival going?',
        'Which relationship in the book felt most real to you?',
        'The title pairs salt and shingle. What do you think each stands for?'
      ]
    },
    {
      id: 'the-drowned-church', title: 'The Drowned Church', lines: ['The', 'Drowned', 'Church'], series: 'lark', no: 1, pub: '2019-02-05',
      imprint: 'Finch & Holloway', genre: 'Crime', setting: 'The Great Marsh and its old churches',
      jacket: { motif: 'church', bg: '#1f4d58', fg: '#efe6d3', accent: '#9fc7c4', line: '#cfae6c' },
      tagline: 'When the floods go down, the past comes up.',
      blurb: [
        'After the wettest winter on record, the floodwater around the lonely church of St. Anne finally drains away, and the sexton finds a grave that is not on any plan. In it are the bones of a man who was supposed to have moved to Alaska in 1979.',
        'Detective Esme Lark, born and raised on the Marsh, is the only officer who knows which questions not to ask in front of whom. The first Esme Lark mystery and winner of the Sandpiper Award for best debut.'
      ],
      formats: [
        { type: 'paperback', isbn: '978-1-0000-1201-9', pages: 336, price: 16.99, retailers: ['spine-and-story', 'bookhound', 'pagecraft'] },
        { type: 'ebook', isbn: '978-1-0000-1204-0', price: 2.99, retailers: ['readwell', 'pagecraft'] },
        { type: 'audio', isbn: '978-1-0000-1207-1', length: '9 h 12 min', narrator: 'Philippa Strand', price: 17.99, retailers: ['listen-lane', 'pagecraft'] }
      ],
      reviews: [
        { quote: 'A debut of rare assurance. The Great Marsh has found its laureate of murder.', source: 'The Literary Standard' },
        { quote: 'I wanted to move to the Marsh and also never go there.', source: 'The Reading Room podcast' }
      ],
      extract: {
        chapter: 'Chapter One', heading: 'High Water',
        pages: [
          ['For eleven weeks the church of St. Anne stood in the middle of a lake, and the people of the Marsh rowed out to look at it on Sundays, the way you might visit someone in the hospital.',
            'Then, in the second week of March, the water began to go down. It went down slowly, leaving a tidemark on the granite walls like a ring in a bath. It went down past the porch, past the gravestones, past the old oak that had stood there since before the Revolution. And on the twentieth of March, the sexton, Silas Gage, went out in his waders to see what the flood had left behind.'],
          ['What it had left behind was a hole.',
            'The ground at the north side of the church, where nobody had been buried since the smallpox years because the old families called the north side the devil’s side, had slumped into a long, neat trench. And at the bottom of the trench, in the black silt, something pale.',
            'Silas Gage had been sexton for thirty-one years. He knew what bones looked like.',
            'He also knew, with the bone-deep certainty of a man who had dug every grave in the parish since 1988, that nobody had ever been buried there.']
        ]
      },
      themes: ['Buried history', 'Belonging and outsiders', 'The weather as a character'],
      questions: [
        'The book opens with the church standing in a flood “like someone in the hospital”. How did that image set up the novel for you?',
        'Esme is a local detective policing her own community. What are the advantages and the costs?',
        'The north side of the churchyard is “the devil’s side”. How do old beliefs and customs shape what happens?',
        'Which revelation surprised you most?',
        'If you went on to read the series, what made you want to spend more time with Esme?'
      ]
    }
  ];
  var BOOK_BY_ID = {};
  BOOKS.forEach(function (b) { BOOK_BY_ID[b.id] = b; });

  /* Events. Dates and times are wall-clock times in TIMEZONE. An event disappears once its end
     time has passed. `format` is 'in-person' or 'online' (used by events.html?format=). `price` is
     0 for free events. `book` is the book the event is about. */
  var EVENTS = [
    { id: 'reading-room-live', title: 'The Reading Room, live', format: 'online', kind: 'Online interview', venue: 'The Reading Room podcast', town: 'Online', date: '2026-10-19', start: '19:00', end: '20:00', price: 0, book: 'the-glass-marsh', url: 'https://readingroom.example/live',
      blurb: 'A live recording of the books podcast, with questions from listeners about writing the Marsh in winter.' },
    { id: 'newburyport-library', title: 'An afternoon with Clemency Thorne', format: 'in-person', kind: 'Library talk', venue: 'Newburyport Public Library', town: 'Newburyport', date: '2026-10-24', start: '14:00', end: '15:15', price: 0, book: 'low-tide-at-plum-island', url: 'https://merrimacklibraries.example/events/thorne',
      blurb: 'A talk about the real places behind the Esme Lark books, followed by questions and a signing.' },
    { id: 'glass-marsh-launch', title: 'Launch party: The Glass Marsh', format: 'in-person', kind: 'Book launch', venue: 'Turner Street Books', town: 'Salem', date: '2026-11-10', start: '18:30', end: '20:30', price: 10, book: 'the-glass-marsh', url: 'https://turnerstreetbooks.example/launch', launch: true,
      blurb: 'Publication night at Clemency’s local bookstore: a reading, a conversation with her editor and mulled cider. The ticket price comes off a copy of the book.' },
    { id: 'marblehead-lit-fest', title: 'Crime on the Coast', format: 'in-person', kind: 'Festival panel', venue: 'Abbot Hall, Marblehead Literary Festival', town: 'Marblehead', date: '2026-11-14', start: '11:00', end: '12:00', price: 15, book: 'the-glass-marsh', url: 'https://marbleheadlitfest.example/crime-on-the-coast',
      blurb: 'Clemency joins two fellow crime writers to talk about why so many murders happen at the beach.' },
    { id: 'dead-letter-club', title: 'Dead Letter book club', format: 'online', kind: 'Online book club', venue: 'Dead Letter Quarterly', town: 'Online', date: '2026-11-17', start: '19:30', end: '20:30', price: 0, book: 'the-glass-marsh', url: 'https://deadletter.example/club',
      blurb: 'The magazine’s online book club reads The Glass Marsh, and Clemency answers questions (spoilers welcome).' },
    { id: 'hatchmere-brookline', title: 'In conversation in Brookline', format: 'in-person', kind: 'Bookstore event', venue: 'Hatchmere Books, Coolidge Corner', town: 'Brookline', date: '2026-11-24', start: '19:00', end: '20:15', price: 15, book: 'the-glass-marsh', url: 'https://hatchmerebooks.example/events',
      blurb: 'An evening in conversation with the novelist Bryony Castell about landscape, winter and secrets.' },
    { id: 'concord-winter-words', title: 'Winter Words', format: 'in-person', kind: 'Festival talk', venue: 'Concord Town House', town: 'Concord', date: '2026-12-05', start: '15:00', end: '16:00', price: 15, book: 'the-glass-marsh', url: 'https://winterwordsconcord.example/',
      blurb: 'A winter book festival talk and reading, with a signing afterward.' },
    { id: 'newsletter-qa', title: 'Readers’ Q&A for newsletter subscribers', format: 'online', kind: 'Online Q&A', venue: 'Online, link sent by email', town: 'Online', date: '2027-01-21', start: '19:00', end: '20:00', price: 0, book: 'the-glass-marsh', url: 'newsletter.html',
      blurb: 'Ask anything about the series. Subscribers to the Marsh Letter get the link a week before.' },
    { id: 'cape-ann-festival', title: 'Cape Ann Book Festival', format: 'in-person', kind: 'Festival talk', venue: 'Gloucester City Hall', town: 'Gloucester', date: '2027-02-06', start: '17:00', end: '18:00', price: 12, book: 'the-cartographers-widow', url: 'https://capeannbookfest.example/',
      blurb: 'A talk on the history of the Massachusetts coast and the maps that made it, from The Cartographer’s Widow to Esme Lark.' }
  ];
  var EVENT_BY_ID = {};
  EVENTS.forEach(function (e) { EVENT_BY_ID[e.id] = e; });
  var EVENT_FORMATS = { all: 'All events', 'in-person': 'In person', online: 'Online' };

  // Values accepted by contact.html?topic= (must match the <option> values in contact.html).
  var CONTACT_TOPICS = {
    agent: { label: 'Representation and permissions', to: 'Sabine Corrigan', role: 'Literary agent, Winslow Greer Agency', email: 'sabine@winslowgreer.example', reply: 'Usually replies within a week.', thanks: 'Sabine usually replies within a week.' },
    publicity: { label: 'Publicity, interviews and review copies', to: 'Della Rafferty', role: 'Publicity director, Finch & Holloway', email: 'publicity@finchandholloway.example', reply: 'Usually replies within two business days.', thanks: 'Della usually replies within two business days.' },
    rights: { label: 'Translation, film and TV rights', to: 'Annika Lowther', role: 'Rights director, Winslow Greer Agency', email: 'rights@winslowgreer.example', reply: 'Usually replies within a week.', thanks: 'Annika usually replies within a week.' },
    events: { label: 'Festivals, libraries and schools', to: 'Della Rafferty', role: 'Publicity director, Finch & Holloway', email: 'events@finchandholloway.example', reply: 'Please write at least eight weeks before your event.', thanks: 'Della usually replies within two business days to talk through dates.' },
    readers: { label: 'A letter to Clemency', to: 'Clemency Thorne', role: 'Read by Clemency herself', email: 'letters@clemencythorne.example', reply: 'Clemency reads every letter, but may take a while to reply.', thanks: 'Clemency reads every letter herself, though she may take a while to reply.' }
  };

  /* ======================================================================
     5. Keeping the demo current (see KEEP_DEMO_CURRENT)
     ====================================================================== */
  // Whole weeks since DEMO_ANCHOR. Every event and every book published after DEMO_ANCHOR moves by it.
  var SHIFT_DAYS = KEEP_DEMO_CURRENT ? Math.max(0, Math.floor((todayNum() - dayNum(DEMO_ANCHOR)) / 7) * 7) : 0;
  if (SHIFT_DAYS) {
    EVENTS.forEach(function (e) { e.date = isoFromDayNum(dayNum(e.date) + SHIFT_DAYS); });
    BOOKS.forEach(function (b) { if (dayNum(b.pub) > dayNum(DEMO_ANCHOR)) b.pub = isoFromDayNum(dayNum(b.pub) + SHIFT_DAYS); });
  }

  function pubDate(book) { return zonedDate(book.pub + 'T00:00'); }
  function isOut(book) { return now() >= pubDate(book); }
  function pubYear(book) { return +book.pub.slice(0, 4); }
  function eventTimes(e) {
    var start = zonedDate(e.date + 'T' + e.start), end = zonedDate(e.date + 'T' + e.end);
    return { start: start, end: end, range: clockRange(start, end) + ' ' + zoneName(start) };
  }
  function upcomingEvents() {
    var t = now();
    return EVENTS.filter(function (e) { return eventTimes(e).end > t; })
      .sort(function (a, b) { return eventTimes(a).start - eventTimes(b).start; });
  }
  // Books in a series, in reading order.
  function seriesBooks(key) {
    return BOOKS.filter(function (b) { return b.series === key; }).sort(function (a, b) { return a.no - b.no; });
  }
  function seriesLine(book) {
    return book.series ? SERIES[book.series].short + ' · Book ' + book.no : 'A standalone novel';
  }

  /* ======================================================================
     6. Artwork: book jackets drawn as SVG from each book's `jacket` colors and motif
     ====================================================================== */
  var jacketCount = 0;
  var MOTIFS = {
    church: function (c) {
      var tower = '<path d="M98 336v-34l21-16 21 16v34Z"/><path d="M138 336v-76h26v76Z"/><path d="M135 262 151 214l16 48Z"/><path d="M164 336v-26h40v26Z"/>';
      return '<g transform="translate(0 14)"><g fill="' + c.accent + '">' + tower + '</g>' +
        '<g fill="' + c.bg + '"><path d="M147 300a4 4 0 0 1 8 0v14h-8Z"/><path d="M112 316a4 4 0 0 1 8 0v10h-8Z"/></g>' +
        '<g fill="' + c.accent + '" opacity=".28" transform="matrix(1 0 0 -.45 0 487.2)">' + tower + '</g>' +
        '<g stroke="' + c.fg + '" stroke-width="1.2" stroke-linecap="round" opacity=".55"><path d="M54 336h192"/><path d="M78 348h44M160 348h60" stroke-dasharray="10 6"/><path d="M96 362h108" stroke-dasharray="4 8"/><path d="M66 376h60M150 376h74" stroke-dasharray="14 8"/><path d="M120 392h64" stroke-dasharray="6 7"/></g></g>';
    },
    shingle: function (c) {
      var stones = [[70, 372, 16, 9], [104, 380, 13, 8], [136, 370, 19, 10], [172, 381, 15, 8], [206, 371, 17, 10], [236, 382, 12, 7], [86, 394, 14, 7], [122, 396, 18, 8], [160, 397, 13, 7], [196, 395, 17, 8], [230, 398, 11, 6], [64, 350, 10, 6], [152, 352, 11, 6], [222, 352, 13, 7]];
      return stones.map(function (s, i) {
        return '<ellipse cx="' + s[0] + '" cy="' + s[1] + '" rx="' + s[2] + '" ry="' + s[3] + '" fill="' + (i % 3 === 1 ? c.fg : c.accent) + '" opacity="' + (i % 3 === 2 ? '.5' : '.9') + '"/>';
      }).join('') +
        '<g fill="none" stroke="' + c.fg + '" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M112 282q16-14 30 0q14-14 30 0"/><path d="M188 258q9-8 17 0q8-8 17 0" stroke-width="1.8"/></g>';
    },
    compass: function (c) {
      return '<g fill="none" stroke="' + c.line + '" stroke-width="1"><circle cx="150" cy="322" r="64"/><circle cx="150" cy="322" r="56" stroke-dasharray="2 4"/></g>' +
        '<path d="M150 252 160 312 220 322 160 332 150 392 140 332 80 322 140 312Z" fill="' + c.accent + '"/>' +
        '<path d="M150 252 160 312 150 322ZM220 322 160 332 150 322ZM150 392 140 332 150 322ZM80 322 140 312 150 322Z" fill="' + c.bg + '" opacity=".35"/>' +
        '<path d="M150 284 156 316 188 322 156 328 150 360 144 328 112 322 144 316Z" fill="' + c.fg + '" transform="rotate(45 150 322)" opacity=".75"/>' +
        '<path d="M40 404c30-12 44 6 70-4s40-18 64-6 46 10 86-4" fill="none" stroke="' + c.fg + '" stroke-width="1.2" stroke-dasharray="3 4" opacity=".7"/>';
    },
    lighthouse: function (c) {
      return '<g fill="' + c.accent + '" opacity=".32"><path d="M150 268 40 236v62Z"/><path d="M150 268 260 236v62Z"/></g>' +
        '<path d="M139 390 145 276h10l6 114Z" fill="' + c.fg + '"/>' +
        '<g fill="' + c.accent + '"><path d="M143.4 306h13.2l1 18h-15.2Z"/><path d="M141.6 342h16.8l1 18h-18.8Z"/></g>' +
        '<rect x="142" y="258" width="16" height="16" fill="' + c.accent + '"/><path d="M139 258h22l-11-12Z" fill="' + c.fg + '"/>' +
        '<g stroke="' + c.fg + '" stroke-width="1.3" stroke-linecap="round" fill="none" opacity=".7"><path d="M46 392h208"/><path d="M60 404c14-6 22-6 36 0s22 6 36 0 22-6 36 0 22 6 36 0 22-6 36 0" stroke-dasharray="2 0"/></g>';
    },
    bells: function (c) {
      function bell(x, y, s) {
        return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><path d="M0-30c-11 0-16 9-16 22 0 12-3 18-9 22h50c-6-4-9-10-9-22 0-13-5-22-16-22Z" fill="' + c.accent + '"/><circle cy="18" r="4.5" fill="' + c.fg + '"/><path d="M-2-36h4v7h-4Z" fill="' + c.fg + '"/></g>';
      }
      return '<path d="M70 262h160" stroke="' + c.line + '" stroke-width="2.5"/>' +
        '<g stroke="' + c.line + '" stroke-width="1"><path d="M100 262v22M150 262v38M200 262v22"/></g>' +
        bell(100, 320, 1) + bell(150, 336, 1.15) + bell(200, 320, 1) +
        '<g fill="none" stroke="' + c.fg + '" stroke-width="1.4" stroke-linecap="round" opacity=".6"><path d="M62 300a24 24 0 0 0 0 36M52 292a36 36 0 0 0 0 52M238 300a24 24 0 0 1 0 36M248 292a36 36 0 0 1 0 52"/></g>' +
        '<g fill="' + c.fg + '" opacity=".55"><circle cx="90" cy="392" r="2"/><circle cx="150" cy="398" r="2"/><circle cx="210" cy="392" r="2"/></g>';
    },
    reeds: function (c) {
      var reeds = '';
      [[66, 300, -4], [82, 284, 3], [98, 312, -2], [116, 292, 5], [196, 296, -3], [212, 278, 4], [228, 306, -5], [244, 290, 2]].forEach(function (r) {
        reeds += '<path d="M' + r[0] + ' 372q' + r[2] + ' -' + ((372 - r[1]) / 2) + ' ' + r[2] * 2 + ' -' + (372 - r[1]) + '" fill="none" stroke="' + c.fg + '" stroke-width="1.6" stroke-linecap="round"/>' +
          '<ellipse cx="' + (r[0] + r[2] * 2) + '" cy="' + (r[1] + 2) + '" rx="3.2" ry="10" fill="' + c.line + '" transform="rotate(' + r[2] * 2 + ' ' + (r[0] + r[2] * 2) + ' ' + r[1] + ')"/>';
      });
      return '<circle cx="150" cy="282" r="30" fill="' + c.accent + '"/><circle cx="163" cy="274" r="27" fill="' + c.bg + '"/>' + reeds +
        '<rect x="44" y="372" width="212" height="34" fill="' + c.accent + '" opacity=".2"/>' +
        '<g stroke="' + c.accent + '" stroke-width="1" stroke-linecap="round" opacity=".8"><path d="M52 380l26 0M98 386l50 0M170 380l64 0M64 396l40 0M128 400l36 0M190 394l52 0"/><path d="M140 378l14 24M86 384l-8 16M214 382l10 18" stroke-width=".8"/></g>' +
        '<path d="M146 360h8l-1 12h-6Z" fill="' + c.line + '"/><circle cx="150" cy="356" r="6" fill="' + c.line + '" opacity=".45"/>';
    }
  };

  // The jacket as an SVG string. opts.label makes it an image with a text alternative (otherwise it
  // is decorative); opts.file adds the xmlns needed for a downloaded .svg file.
  function jacketSVG(book, opts) {
    opts = opts || {};
    var c = book.jacket;
    var id = 'jk' + (++jacketCount);
    var longest = book.lines.reduce(function (m, l) { return l === 'The' ? m : Math.max(m, l.length); }, 0);
    var size = Math.min(44, Math.floor(232 / (longest * 0.62)));
    var y = book.lines.length > 2 ? 108 : 124;
    var title = book.lines.map(function (line) {
      var small = line === 'The';
      var s = small ? Math.round(size * 0.62) : size;
      y += small ? s * 1.05 : s * 1.12;
      return '<text x="150" y="' + Math.round(y) + '" text-anchor="middle" font-family="Libre Baskerville, Baskerville, Georgia, serif" font-size="' + s + '"' + (small ? ' font-style="italic"' : '') + ' fill="' + c.fg + '">' + esc(line) + '</text>';
    }).join('');
    var label = book.series ? SERIES[book.series].label.toUpperCase() : 'A NOVEL';
    var a11y = opts.label ? ' role="img" aria-label="' + esc(opts.label) + '"' : ' aria-hidden="true" focusable="false"';
    return '<svg' + (opts.file ? ' xmlns="http://www.w3.org/2000/svg" width="600" height="920"' : '') + (opts.attrs || '') + ' viewBox="0 0 300 460"' + a11y + '>' +
      '<defs><filter id="' + id + '" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .16 0"/></filter></defs>' +
      '<rect width="300" height="460" fill="' + c.bg + '"/>' +
      '<rect x="14" y="14" width="272" height="432" fill="none" stroke="' + c.line + '" stroke-width="1"/>' +
      '<rect x="19" y="19" width="262" height="422" fill="none" stroke="' + c.line + '" stroke-width=".5"/>' +
      '<text x="150" y="52" text-anchor="middle" font-family="Josefin Sans, Gill Sans, sans-serif" font-size="9" font-weight="600" letter-spacing="2.6" fill="' + c.line + '">' + label + '</text>' +
      '<g fill="' + c.line + '"><path d="M150 62l4 4-4 4-4-4Z"/><rect x="104" y="65.5" width="36" height="1"/><rect x="160" y="65.5" width="36" height="1"/></g>' +
      title + (MOTIFS[c.motif] ? MOTIFS[c.motif](c) : '') +
      '<text x="150" y="428" text-anchor="middle" font-family="Josefin Sans, Gill Sans, sans-serif" font-size="14" font-weight="600" letter-spacing="4.2" fill="' + c.fg + '">CLEMENCY THORNE</text>' +
      '<rect width="300" height="460" filter="url(#' + id + ')"/></svg>';
  }
  function jacketLabel(book) {
    return 'Jacket of ' + book.title + ' by Clemency Thorne';
  }
  // Fills every [data-jacket="<book id>"] (data-jacket-label="" keeps it decorative).
  function paintJackets(ctx) {
    $$('[data-jacket]', ctx).forEach(function (el) {
      var id = el.getAttribute('data-jacket');
      if (id === 'new') id = NEW_RELEASE;
      if (!has(BOOK_BY_ID, id)) return;
      var book = BOOK_BY_ID[id];
      var decorative = el.hasAttribute('data-jacket-decorative');
      el.innerHTML = jacketSVG(book, { label: decorative ? '' : jacketLabel(book) });
    });
  }

  /* ======================================================================
     7. Shared UI: header, menu, reveals, back to top, copy buttons
     ====================================================================== */
  function initHeader() {
    var btn = $('#menu-button'), menu = $('#mobile-menu');
    if (!btn || !menu) return;
    function setOpen(open) {
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
      $('[data-icon-open]', btn).classList.toggle('hidden', open);
      $('[data-icon-close]', btn).classList.toggle('hidden', !open);
      document.documentElement.classList.toggle('overflow-hidden', open);
    }
    btn.addEventListener('click', function () { setOpen(btn.getAttribute('aria-expanded') !== 'true'); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
    });
    window.addEventListener('resize', function () { if (window.innerWidth >= 1024 && btn.getAttribute('aria-expanded') === 'true') setOpen(false); });
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
    }, { rootMargin: '0px 0px -6% 0px' });
    els.forEach(function (el) { io.observe(el); });
  }

  function initBackToTop() {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'back-to-top';
    btn.setAttribute('aria-label', 'Back to top');
    btn.innerHTML = '<svg class="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6"/></svg>';
    btn.tabIndex = -1;
    document.body.appendChild(btn);
    function onScroll() {
      var show = window.scrollY > 800;
      btn.classList.toggle('is-visible', show);
      btn.tabIndex = show ? 0 : -1;
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    btn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
      var main = $('#main');
      if (main) main.focus({ preventScroll: true });
    });
  }

  // <button data-copy="#element-id"> copies that element's text; data-copy-text="..." copies a literal.
  function initCopyButtons() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-copy],[data-copy-text]') : null;
      if (!btn) return;
      var text = btn.getAttribute('data-copy-text');
      if (text == null) {
        var src = document.querySelector(btn.getAttribute('data-copy'));
        if (!src) return;
        text = src.innerText.replace(/\n{3,}/g, '\n\n').trim();
      }
      var label = $('[data-copy-label]', btn) || btn;
      var before = label.textContent;
      copyText(text, function (ok) {
        toast(ok ? 'Copied to the clipboard' : 'Press Ctrl+C (or Cmd+C) to copy');
        if (!ok) return;
        label.textContent = 'Copied';
        setTimeout(function () { label.textContent = before; }, 1800);
      });
    });
  }

  function initYear() {
    var y = String(zoneParts(now()).y);
    $$('[data-year]').forEach(function (el) { el.textContent = y; });
  }

  /* ======================================================================
     8. Forms (nothing is sent until you connect them; see DOCS.md "Forms")
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
  function fieldMessage(input) {
    var v = (input.value || '').trim();
    var label = input.getAttribute('data-name') || 'This field';
    if (input.type === 'checkbox') return input.required && !input.checked ? (input.getAttribute('data-required-msg') || 'Please check this box.') : '';
    if (input.required && !v) return input.tagName === 'SELECT' ? 'Please choose an option.' : label + ' is required.';
    if (v && input.type === 'email' && !EMAIL_RE.test(v)) return 'Please enter a valid email address, like you@example.com.';
    var min = +input.getAttribute('data-minlength') || 0;
    if (v && min && v.length < min) return label + ' needs at least ' + plural(min, 'character') + '.';
    return '';
  }
  // Rules come from attributes: required, type="email", data-minlength. Hidden fields are disabled.
  function validate(form) {
    var first = null;
    $$('input, select, textarea', form).forEach(function (input) {
      if (input.type === 'hidden' || input.disabled) return;
      var msg = fieldMessage(input);
      setError(input, msg);
      if (msg && !first) first = input;
    });
    if (first) first.focus();
    return !first;
  }
  function liveRevalidate(form) {
    function recheck(e) {
      var input = e.target;
      if (!input.matches || !input.matches('input, select, textarea') || input.disabled) return;
      if (input.getAttribute('aria-invalid') === 'true' || e.type === 'focusout') {
        if (e.type === 'focusout' && !input.value) return;
        setError(input, fieldMessage(input));
      }
    }
    form.addEventListener('input', recheck);
    form.addEventListener('change', recheck);
    form.addEventListener('focusout', recheck);
  }
  // A short reference for the contact form, like CT-7K2Q (no 0/O or 1/I to misread).
  function makeRef() {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', ref = 'CT-';
    for (var i = 0; i < 4; i++) ref += chars.charAt(Math.floor(Math.random() * chars.length));
    return ref;
  }
  function showSuccess(form, name) {
    var done = form.parentNode.querySelector('[data-form-success]');
    var slot = done && $('[data-success-name]', done);
    if (slot) slot.textContent = name ? ', ' + name : '';
    form.hidden = true;
    if (done) { done.hidden = false; done.focus(); }
  }

  function initForms() {
    $$('[data-newsletter-form]').forEach(function (form) {
      liveRevalidate(form);
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!validate(form)) return;
        // Connect here: fetch(form.action, { method: 'POST', body: new FormData(form) }) to your mailing list.
        var first = form.querySelector('[name="first_name"]');
        showSuccess(form, first ? first.value.trim().split(/\s+/)[0] : '');
      });
    });
    $$('[data-form-again]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var box = btn.closest('[data-form-success]');
        var form = box.parentNode.querySelector('form');
        form.reset();
        box.hidden = true;
        form.hidden = false;
        if (form.getAttribute('data-contact-form') !== null) syncTopic();
        var first = $('input, select, textarea', form);
        if (first) first.focus();
      });
    });
    initContact();
  }

  /* Contact: ?topic= preselects the subject; each topic shows who it goes to and its own fields. */
  function syncTopic() {
    var form = $('[data-contact-form]');
    if (!form) return;
    var t = $('#contact-topic', form).value;
    var info = has(CONTACT_TOPICS, t) ? CONTACT_TOPICS[t] : null;
    $$('[data-topic-fields]', form).forEach(function (box) {
      var on = box.getAttribute('data-topic-fields') === t;
      box.hidden = !on;
      $$('input, select, textarea', box).forEach(function (i) { i.disabled = !on; if (!on) setError(i, ''); });
    });
    var route = $('[data-route]');
    if (!route) return;
    if (!info) { route.hidden = true; return; }
    route.hidden = false;
    $('[data-route-to]', route).textContent = info.to;
    $('[data-route-role]', route).textContent = info.role;
    $('[data-route-reply]', route).textContent = info.reply;
    var mail = $('[data-route-email]', route);
    mail.textContent = info.email;
    mail.href = 'mailto:' + info.email;
  }
  function initContact() {
    var form = $('[data-contact-form]');
    if (!form) return;
    var select = $('#contact-topic', form);
    var t = param('topic');
    if (has(CONTACT_TOPICS, t)) select.value = t;
    select.addEventListener('change', syncTopic);
    syncTopic();
    liveRevalidate(form);
    var msg = $('#contact-message', form), counter = $('[data-counter]', form);
    function count() {
      if (!counter) return;
      var n = msg.value.trim().length;
      counter.textContent = plural(n, 'character');
    }
    msg.addEventListener('input', count);
    count();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!validate(form)) return;
      // Connect here: fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      var info = CONTACT_TOPICS[select.value];
      var done = $('[data-form-success]');
      $('[data-success-to]', done).textContent = info.to;
      $('[data-success-next]', done).textContent = info.thanks;
      $('[data-success-ref]', done).textContent = makeRef();
      showSuccess(form, $('#contact-name', form).value.trim().split(/\s+/)[0]);
    });
  }

  /* ======================================================================
     9. Release countdown and buy links
     ====================================================================== */
  function pad(n) { return String(n).padStart(2, '0'); }
  function retailerLinks(book, cls) {
    var seen = {};
    var list = [];
    book.formats.forEach(function (f) { f.retailers.forEach(function (r) { if (!seen[r] && has(RETAILERS, r)) { seen[r] = 1; list.push(r); } }); });
    return list.map(function (r) {
      var shop = RETAILERS[r];
      return '<li><a class="' + (cls || 'link') + '" href="' + esc(shop.url + book.id) + '">' + esc(shop.name) + '</a><span class="muted"> · ' + esc(shop.note) + '</span></li>';
    }).join('');
  }
  function fillRelease() {
    var book = BOOK_BY_ID[NEW_RELEASE];
    var out = isOut(book);
    $$('[data-release-date]').forEach(function (el) { el.textContent = longDay(book.pub); });
    $$('[data-release-state]').forEach(function (el) { el.hidden = el.getAttribute('data-release-state') !== (out ? 'out' : 'soon'); });
    $$('[data-buy-verb]').forEach(function (el) { el.textContent = out ? 'Buy' : 'Pre-order'; });
    $$('[data-buy-links]').forEach(function (el) {
      var id = el.getAttribute('data-buy-links') || NEW_RELEASE;
      if (has(BOOK_BY_ID, id)) el.innerHTML = retailerLinks(BOOK_BY_ID[id], el.getAttribute('data-link-class'));
    });
    $$('[data-countdown]').forEach(function (box) {
      if (out) { box.hidden = true; return; }
      tick(box, pubDate(book));
    });
  }
  var timers = [];
  function tick(box, at) {
    function update() {
      var left = at.getTime() - now().getTime();
      if (left <= 0) { timers.forEach(clearInterval); fillRelease(); return; }
      var d = Math.floor(left / 864e5), h = Math.floor(left / 36e5) % 24, m = Math.floor(left / 6e4) % 60, s = Math.floor(left / 1e3) % 60;
      var units = { d: d, h: h, m: m, s: s };
      $$('[data-unit]', box).forEach(function (el) { var u = el.getAttribute('data-unit'); el.textContent = u === 'd' ? String(d) : pad(units[u]); });
      $$('[data-unit-label]', box).forEach(function (el) {
        var u = el.getAttribute('data-unit-label');
        var names = { d: 'day', h: 'hour', m: 'minute', s: 'second' };
        el.textContent = (units[u] === 1 ? names[u] : names[u] + 's');
      });
      var label = $('[data-countdown-label]', box);
      if (label) label.textContent = 'Published in ' + plural(d, 'day') + ', ' + plural(h, 'hour') + ' and ' + plural(m, 'minute') + '.';
    }
    update();
    timers.push(setInterval(update, 1000));
  }

  /* ======================================================================
     10. The first-chapter reader (remembers your place)
     ====================================================================== */
  var READER_SIZES = { sm: 'Smaller text', md: 'Medium text', lg: 'Larger text' };
  // { last: id, pages: { id: page } }, keeping only known books and page numbers in range.
  function readPlaces() {
    var raw = readJSON(STORAGE_KEYS.reader);
    var clean = { last: '', pages: {} };
    if (!raw || typeof raw !== 'object') return clean;
    var pages = raw.pages && typeof raw.pages === 'object' ? raw.pages : {};
    Object.keys(pages).forEach(function (id) {
      var n = pages[id];
      if (has(BOOK_BY_ID, id) && typeof n === 'number' && n % 1 === 0 && n >= 1 && n <= BOOK_BY_ID[id].extract.pages.length) clean.pages[id] = n;
    });
    if (has(clean.pages, raw.last)) clean.last = raw.last;
    return clean;
  }
  function savePlace(id, page) {
    var places = readPlaces();
    places.pages[id] = page;
    places.last = id;
    writeJSON(STORAGE_KEYS.reader, places);
  }
  function forgetPlace(id) {
    var places = readPlaces();
    delete places.pages[id];
    if (places.last === id) places.last = Object.keys(places.pages)[0] || '';
    writeJSON(STORAGE_KEYS.reader, places);
  }
  function savedPage(id) {
    var places = readPlaces();
    return has(places.pages, id) ? places.pages[id] : 0;
  }
  function readSize() {
    var s = '';
    try { s = safeStorage.getItem(STORAGE_KEYS.size); } catch (e) { s = ''; }
    return has(READER_SIZES, s) ? s : 'md';
  }

  function initReader(book) {
    var root = $('[data-reader]');
    if (!root) return;
    var panel = $('[data-reader-panel]', root), openBtn = $('[data-reader-open]', root), text = $('[data-reader-text]', root);
    var pages = book.extract.pages;
    var total = pages.length;
    var current = 1;
    $('[data-reader-heading]', root).textContent = book.extract.heading;
    $$('[data-reader-chapter]', root).forEach(function (el) { el.textContent = book.extract.chapter; });
    $$('[data-reader-book]', root).forEach(function (el) { el.textContent = book.title; });
    $('[data-reader-total]', root).textContent = plural(total, 'page');

    function setSize(size) {
      Object.keys(READER_SIZES).forEach(function (k) { root.classList.toggle('reader-size-' + k, k === size); });
      $$('[data-reader-size]', root).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-reader-size') === size)); });
    }
    function intro() {
      var saved = savedPage(book.id);
      var label = $('[data-label]', openBtn);
      var note = $('[data-reader-resume]', root);
      if (saved > 1) {
        label.textContent = 'Continue from page ' + saved;
        note.textContent = 'You stopped on page ' + saved + ' of ' + total + '. Your place is saved in this browser.';
        note.hidden = false;
      } else {
        label.textContent = 'Start reading';
        note.hidden = true;
      }
    }
    function render(animate) {
      var paras = pages[current - 1];
      var isFirst = current === 1;
      text.innerHTML = paras.map(function (p, i) {
        if (p === '* * *') return '<p class="break" aria-hidden="true">* * *</p>';
        return '<p' + (isFirst && i === 0 ? ' class="dropcap"' : '') + '>' + esc(p) + '</p>';
      }).join('');
      if (animate && !reduceMotion) { text.classList.remove('page-turn'); void text.offsetWidth; text.classList.add('page-turn'); }
      $('[data-reader-page]', root).textContent = 'Page ' + current + ' of ' + total;
      $('[data-reader-progress]', root).style.width = (current / total * 100) + '%';
      $('[data-reader-prev]', root).disabled = isFirst;
      var next = $('[data-reader-next]', root);
      $('[data-label]', next).textContent = current === total ? 'Finish the chapter' : 'Next page';
      $('[data-reader-end]', root).hidden = true;
      text.hidden = false;
    }
    function go(page, focus) {
      current = Math.max(1, Math.min(total, page));
      savePlace(book.id, current);
      render(true);
      $('[data-reader-saved]', root).textContent = 'Page ' + current + ' of ' + total + '. Your place is saved.';
      if (focus) text.focus({ preventScroll: false });
    }
    function open() {
      current = savedPage(book.id) || 1;
      panel.hidden = false;
      openBtn.setAttribute('aria-expanded', 'true');
      $('[data-reader-intro]', root).hidden = true;
      render(false);
      savePlace(book.id, current);
      text.focus({ preventScroll: true });
      panel.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
    }
    function close() {
      panel.hidden = true;
      openBtn.setAttribute('aria-expanded', 'false');
      $('[data-reader-intro]', root).hidden = false;
      intro();
      openBtn.focus();
    }
    openBtn.addEventListener('click', open);
    $('[data-reader-close]', root).addEventListener('click', close);
    $('[data-reader-prev]', root).addEventListener('click', function () { go(current - 1, false); });
    $('[data-reader-next]', root).addEventListener('click', function () {
      if (current < total) { go(current + 1, false); return; }
      text.hidden = true;
      var end = $('[data-reader-end]', root);
      end.hidden = false;
      end.focus();
    });
    $('[data-reader-restart]', root).addEventListener('click', function () {
      forgetPlace(book.id);
      current = 1;
      render(true);
      savePlace(book.id, 1);
      $('[data-reader-saved]', root).textContent = 'Back to page 1.';
      text.focus();
    });
    $$('[data-reader-size]', root).forEach(function (b) {
      b.addEventListener('click', function () {
        var size = b.getAttribute('data-reader-size');
        if (!has(READER_SIZES, size)) return;
        try { safeStorage.setItem(STORAGE_KEYS.size, size); } catch (e) { /* quota */ }
        setSize(size);
      });
    });
    panel.addEventListener('keydown', function (e) {
      if (e.target.closest && e.target.closest('input, textarea, select')) return;
      if (e.key === 'ArrowRight' && current < total) { e.preventDefault(); go(current + 1, false); }
      if (e.key === 'ArrowLeft' && current > 1) { e.preventDefault(); go(current - 1, false); }
    });
    setSize(readSize());
    intro();
    if (window.location.hash === '#read') open();
  }

  /* ======================================================================
     11. Pages
     ====================================================================== */
  var page = document.body.getAttribute('data-page') || '';

  function eventDateBlock(e) {
    var d = new Date(dayNum(e.date) * 864e5 + 12 * 36e5);
    function f(o) { return new Intl.DateTimeFormat(LOCALE, Object.assign({ timeZone: 'UTC' }, o)).format(d); }
    return '<div class="w-20 shrink-0 border-r border-rule pr-4 text-center sm:w-24" aria-hidden="true">' +
      '<span class="caps-sm block text-oxblood">' + f({ weekday: 'short' }) + '</span>' +
      '<span class="block font-display text-4xl leading-tight">' + f({ day: 'numeric' }) + '</span>' +
      '<span class="caps-sm block">' + f({ month: 'short' }) + (+e.date.slice(0, 4) !== zoneParts(now()).y ? ' ' + e.date.slice(0, 4) : '') + '</span></div>';
  }
  function eventPrice(e) {
    if (!e.price) return e.url === 'newsletter.html' ? 'Free for newsletter subscribers' : 'Free, registration required';
    return money(e.price) + (e.launch ? ', taken off the price of the book' : ' a ticket');
  }
  function eventItem(e, compact) {
    var t = eventTimes(e);
    var today = e.date === isoFromDayNum(todayNum());
    var yours = '';
    if (e.format === 'online' && visitorZone && visitorZone !== TIMEZONE && zoneName(t.start, visitorZone) !== zoneName(t.start)) {
      yours = '<span class="block text-base muted">Your time: ' + esc(fmtIn(t.start, { weekday: 'short', hour: 'numeric', minute: '2-digit', hourCycle: 'h12' }, visitorZone) + ' ' + zoneName(t.start, visitorZone)) + '</span>';
    }
    var book = BOOK_BY_ID[e.book];
    var badges = (e.launch ? '<span class="caps-sm border border-oxblood px-2 pt-1 pb-0.5 text-oxblood">Launch night</span>' : '') +
      (today ? '<span class="caps-sm bg-oxblood px-2 pt-1 pb-0.5 text-paper">Today</span>' : '');
    var heading = compact ? 'h3' : 'h2';
    return '<li class="flex gap-4 border-b border-rule py-6 sm:gap-6" data-event="' + esc(e.id) + '">' + eventDateBlock(e) +
      '<div class="min-w-0 flex-1">' +
      '<p class="flex flex-wrap items-center gap-2"><span class="caps-sm text-gilt-ink">' + esc(e.kind) + '</span>' + badges + '</p>' +
      '<' + heading + ' class="mt-1.5 font-display text-xl leading-snug sm:text-2xl">' + esc(e.title) + '</' + heading + '>' +
      '<p class="mt-1 text-lg"><span class="sr-only">' + esc(longDay(e.date)) + ', </span>' + esc(t.range) + ' · ' + esc(e.venue) + (e.town !== 'Online' && e.venue.indexOf(e.town) < 0 ? ', ' + esc(e.town) : '') + yours + '</p>' +
      (compact ? '' : '<p class="mt-2 max-w-2xl text-lg muted">' + esc(e.blurb) + '</p>' +
        '<p class="mt-2 text-base">' + esc(eventPrice(e)) + ' · About <a class="link" href="book.html?id=' + esc(book.id) + '"><em>' + esc(book.title) + '</em></a></p>' +
        '<div class="mt-4 flex flex-wrap gap-2.5"><a class="btn btn-line btn-sm" href="' + esc(e.url) + '">' + (e.url === 'newsletter.html' ? 'Join the newsletter' : 'Reserve a seat') + '<span class="sr-only">: ' + esc(e.title) + '</span></a>' +
        '<button type="button" class="btn btn-line btn-sm" data-ics="' + esc(e.id) + '">Add to calendar<span class="sr-only">: ' + esc(e.title) + '</span></button></div>') +
      '</div></li>';
  }
  function icsText(e) {
    var t = eventTimes(e);
    function utc(d) { return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }
    function clean(s) { return String(s).replace(/\\/g, '\\\\').replace(/[,;]/g, function (c) { return '\\' + c; }).replace(/\n/g, '\\n'); }
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Clemency Thorne//Events//EN', 'BEGIN:VEVENT',
      'UID:' + e.id + '-' + e.date + '@clemencythorne.example', 'DTSTAMP:' + utc(now()), 'DTSTART:' + utc(t.start), 'DTEND:' + utc(t.end),
      'SUMMARY:' + clean(e.title + ' with Clemency Thorne'), 'LOCATION:' + clean(e.town === 'Online' ? e.venue : e.venue + ', ' + e.town),
      'DESCRIPTION:' + clean(e.blurb), 'URL:' + (/^https?:/.test(e.url) ? e.url : SITE_URL + '/' + e.url), 'END:VEVENT', 'END:VCALENDAR'].join('\r\n') + '\r\n';
  }
  function initIcs() {
    document.addEventListener('click', function (ev) {
      var b = ev.target.closest ? ev.target.closest('[data-ics]') : null;
      if (!b) return;
      var id = b.getAttribute('data-ics');
      if (!has(EVENT_BY_ID, id)) return;
      download(id + '.ics', icsText(EVENT_BY_ID[id]), 'text/calendar;charset=utf-8');
    });
  }

  /* ----- Home ----- */
  function initHome() {
    var list = $('[data-next-events]');
    if (list) {
      var next = upcomingEvents().slice(0, 3);
      list.innerHTML = next.map(function (e) { return eventItem(e, true); }).join('');
      var empty = $('[data-next-events-empty]');
      if (empty) empty.hidden = next.length > 0;
    }
    var shelf = $('[data-series-shelf]');
    if (shelf) {
      shelf.innerHTML = seriesBooks('lark').map(function (b) {
        return '<li class="group reveal min-w-0"><a href="book.html?id=' + b.id + '" class="block">' +
          '<span class="jacket jacket-lift">' + jacketSVG(b, {}) + '</span>' +
          '<span class="caps-sm mt-5 block text-gilt-ink">Book ' + b.no + (b.no === 1 ? ' · Start here' : '') + '</span>' +
          '<span class="mt-1 block font-display text-lg leading-snug group-hover:text-oxblood">' + esc(b.title) + '</span>' +
          '<span class="block text-base muted">' + (isOut(b) ? pubYear(b) : 'Out ' + esc(longDay(b.pub, false))) + '</span></a></li>';
      }).join('');
    }
    var cont = $('[data-continue]');
    if (cont) {
      var places = readPlaces();
      if (places.last) {
        var b = BOOK_BY_ID[places.last], n = places.pages[places.last], total = b.extract.pages.length;
        $('[data-continue-title]', cont).textContent = b.title;
        $('[data-continue-page]', cont).textContent = 'Page ' + n + ' of ' + total;
        $('[data-continue-link]', cont).href = 'book.html?id=' + b.id + '#read';
        cont.hidden = false;
      }
    }
  }

  /* ----- Books (filter and reading order) ----- */
  var BOOK_FILTERS = { all: 'All books', lark: 'The Esme Lark mysteries', standalone: 'Standalone novels' };
  var BOOK_ORDERS = { reading: 'Reading order', published: 'Newest first' };
  function bookCard(b, numbered) {
    var places = readPlaces();
    var reading = has(places.pages, b.id) ? '<span class="caps-sm mt-2 inline-block border border-rule px-2 pt-1 pb-0.5">Reading: page ' + places.pages[b.id] + ' of ' + b.extract.pages.length + '</span>' : '';
    var status = isOut(b) ? String(pubYear(b)) : 'Out ' + longDay(b.pub, false);
    return '<li class="group reveal grid grid-cols-[6.5rem_minmax(0,1fr)] gap-5 border-b border-rule py-8 sm:grid-cols-[9rem_minmax(0,1fr)] sm:gap-8">' +
      '<a href="book.html?id=' + b.id + '" class="jacket jacket-lift" tabindex="-1" aria-hidden="true">' + jacketSVG(b, {}) + '</a>' +
      '<div class="min-w-0">' +
      (numbered && b.series ? '<p class="font-display text-3xl text-gilt-ink italic leading-none">' + b.no + '.</p>' : '') +
      '<p class="caps-sm mt-2 text-gilt-ink">' + esc(seriesLine(b)) + ' · ' + esc(status) + '</p>' +
      '<h2 class="mt-2 font-display text-2xl leading-snug sm:text-3xl"><a href="book.html?id=' + b.id + '" class="hover:text-oxblood">' + esc(b.title) + '</a></h2>' +
      '<p class="mt-2 text-lg italic muted">' + esc(b.tagline) + '</p>' +
      '<p class="mt-3 hidden max-w-2xl text-lg sm:block">' + esc(b.blurb[0]) + '</p>' + reading +
      '<p class="mt-4 flex flex-wrap gap-x-5 gap-y-2"><a class="link caps-sm" href="book.html?id=' + b.id + '">' + (isOut(b) ? 'About the book' : 'Pre-order') + '<span class="sr-only">: ' + esc(b.title) + '</span></a>' +
      '<a class="link caps-sm" href="book.html?id=' + b.id + '#read">Read the first chapter<span class="sr-only"> of ' + esc(b.title) + '</span></a></p>' +
      '</div></li>';
  }
  function initBooks() {
    var list = $('[data-book-list]');
    if (!list) return;
    var show = has(BOOK_FILTERS, param('show')) ? param('show') : 'all';
    var order = has(BOOK_ORDERS, param('order')) ? param('order') : 'reading';
    function matches(b, f) { return f === 'all' || (f === 'standalone' ? !b.series : b.series === f); }
    function render() {
      $$('[data-filter]').forEach(function (btn) {
        var f = btn.getAttribute('data-filter');
        btn.setAttribute('aria-pressed', String(f === show));
        var c = $('.count', btn);
        if (c) c.textContent = BOOKS.filter(function (b) { return matches(b, f); }).length;
      });
      $$('[data-order]').forEach(function (btn) { btn.setAttribute('aria-pressed', String(btn.getAttribute('data-order') === order)); });
      var books = BOOKS.filter(function (b) { return matches(b, show); });
      var html = '';
      if (order === 'reading') {
        var series = books.filter(function (b) { return b.series; }).sort(function (a, b) { return a.no - b.no; });
        var solo = books.filter(function (b) { return !b.series; }).sort(function (a, b) { return dayNum(b.pub) - dayNum(a.pub); });
        if (series.length) html += '<li class="pt-10 first:pt-2"><p class="caps text-oxblood">The Esme Lark mysteries, in reading order</p><p class="mt-1 text-lg muted">Each one solves its own case, but Esme’s story runs through all four.</p></li>' + series.map(function (b) { return bookCard(b, true); }).join('');
        if (solo.length) html += '<li class="pt-14 first:pt-2"><p class="caps text-oxblood">Standalone novels</p><p class="mt-1 text-lg muted">Read these in any order.</p></li>' + solo.map(function (b) { return bookCard(b, false); }).join('');
      } else {
        html = books.slice().sort(function (a, b) { return dayNum(b.pub) - dayNum(a.pub); }).map(function (b) { return bookCard(b, false); }).join('');
      }
      list.innerHTML = html;
      $('[data-book-count]').textContent = plural(books.length, 'book') + (show === 'all' ? '' : ' · ' + BOOK_FILTERS[show]) + ' · ' + BOOK_ORDERS[order].toLowerCase();
      $$('.reveal', list).forEach(function (el) { el.classList.add('is-visible'); });
    }
    $$('[data-filter]').forEach(function (btn) {
      btn.addEventListener('click', function () { show = btn.getAttribute('data-filter'); setParams({ show: show === 'all' ? '' : show }); render(); });
    });
    $$('[data-order]').forEach(function (btn) {
      btn.addEventListener('click', function () { order = btn.getAttribute('data-order'); setParams({ order: order === 'reading' ? '' : order }); render(); });
    });
    render();
  }

  /* ----- Single book ----- */
  function initBook() {
    var root = $('[data-book]');
    if (!root) return;
    var id = param('id');
    var book = has(BOOK_BY_ID, id) ? BOOK_BY_ID[id] : BOOK_BY_ID[NEW_RELEASE];
    var missing = $('[data-book-missing]');
    if (missing) missing.hidden = !id || has(BOOK_BY_ID, id);
    var out = isOut(book);
    document.title = book.title + ' by Clemency Thorne';
    function set(name, value) { $$('[data-b="' + name + '"]').forEach(function (el) { el.textContent = value; }); }
    set('title', book.title);
    set('series', seriesLine(book));
    set('tagline', book.tagline);
    set('genre', book.genre);
    set('setting', book.setting);
    set('imprint', book.imprint);
    set('pub', (out ? 'Published ' : 'Publication day: ') + longDay(book.pub));
    set('verb', out ? 'Buy the book' : 'Pre-order the book');
    var jacket = $('[data-b-jacket]');
    jacket.innerHTML = jacketSVG(book, { label: jacketLabel(book) });
    $('[data-b-blurb]').innerHTML = book.blurb.map(function (p, i) { return '<p class="' + (i ? 'mt-4' : 'lead') + '">' + esc(p) + '</p>'; }).join('');
    var cd = $('[data-countdown]', root);
    if (cd) { if (out) cd.hidden = true; else tick(cd, pubDate(book)); }
    var soon = $('[data-b-soon]');
    if (soon) soon.hidden = out;
    $('[data-b-links]').innerHTML = retailerLinks(book);
    $('[data-b-formats]').innerHTML = book.formats.map(function (f) {
      var details = f.pages ? plural(f.pages, 'page') : f.length ? f.length + ', read by ' + f.narrator : 'All e-readers';
      return '<tr class="border-b border-rule"><th scope="row" class="py-3 pr-4 text-left font-display text-lg font-normal">' + FORMAT_NAMES[f.type] + '</th>' +
        '<td class="py-3 pr-4 text-lg">' + esc(details) + '</td><td class="py-3 pr-4 text-base tabular-nums whitespace-nowrap">' + esc(f.isbn) + '</td>' +
        '<td class="py-3 text-right text-lg whitespace-nowrap">' + money(f.price) + '</td></tr>';
    }).join('');
    $('[data-b-reviews]').innerHTML = book.reviews.map(function (r) {
      return '<figure class="reveal border-t border-rule pt-6"><span class="quote-mark" aria-hidden="true">“</span><blockquote class="-mt-4 font-display text-xl leading-relaxed italic">' + esc(r.quote) + '</blockquote>' +
        '<figcaption class="caps-sm mt-4 text-gilt-ink">' + esc(r.source) + '</figcaption></figure>';
    }).join('');
    var club = $('[data-b-club]');
    if (club) club.href = 'book-clubs.html?book=' + book.id;
    // More in the series (reading order) or the other standalones.
    var more = book.series ? seriesBooks(book.series) : BOOKS.filter(function (b) { return !b.series; });
    $('[data-b-more-title]').textContent = book.series ? SERIES[book.series].name + ', in reading order' : 'More standalone novels';
    $('[data-b-more]').innerHTML = more.map(function (b) {
      var current = b.id === book.id;
      return '<li class="group min-w-0"><a href="book.html?id=' + b.id + '" class="block"' + (current ? ' aria-current="page"' : '') + '>' +
        '<span class="jacket jacket-lift' + (current ? ' outline-2 outline-offset-4 outline-oxblood' : '') + '">' + jacketSVG(b, {}) + '</span>' +
        '<span class="caps-sm mt-4 block text-gilt-ink">' + (b.series ? 'Book ' + b.no : pubYear(b)) + (current ? ' · This book' : '') + '</span>' +
        '<span class="mt-1 block font-display text-base leading-snug group-hover:text-oxblood">' + esc(b.title) + '</span></a></li>';
    }).join('');
    initReader(book);
  }

  /* ----- Events ----- */
  function initEvents() {
    var list = $('[data-event-list]');
    if (!list) return;
    var format = has(EVENT_FORMATS, param('format')) ? param('format') : 'all';
    function render() {
      var all = upcomingEvents();
      $$('[data-format]').forEach(function (btn) {
        var f = btn.getAttribute('data-format');
        btn.setAttribute('aria-pressed', String(f === format));
        $('.count', btn).textContent = all.filter(function (e) { return f === 'all' || e.format === f; }).length;
      });
      var shown = all.filter(function (e) { return format === 'all' || e.format === format; });
      list.innerHTML = shown.map(function (e) { return eventItem(e, false); }).join('');
      $('[data-event-count]').textContent = plural(shown.length, format === 'all' ? 'upcoming event' : (format === 'online' ? 'upcoming online event' : 'upcoming event in person'), format === 'in-person' ? 'upcoming events in person' : null);
      $('[data-event-empty]').hidden = shown.length > 0;
    }
    $$('[data-format]').forEach(function (btn) {
      btn.addEventListener('click', function () { format = btn.getAttribute('data-format'); setParams({ format: format === 'all' ? '' : format }); render(); });
    });
    render();
    var tz = $('[data-zone-note]');
    if (tz) tz.textContent = 'All times are Eastern time (' + zoneName(now()) + ' today).';
  }

  /* ----- Book clubs ----- */
  function wrapLines(text, max) {
    var words = String(text).split(/\s+/), lines = [], line = '';
    words.forEach(function (w) {
      if ((line + ' ' + w).trim().length > max) { lines.push(line); line = w; } else line = (line + ' ' + w).trim();
    });
    if (line) lines.push(line);
    return lines;
  }
  function guideText(b) {
    var out = [b.title.toUpperCase() + ' by Clemency Thorne', 'Reading group guide', '', seriesLine(b) + ' · ' + b.genre + ' · ' + b.imprint, ''];
    b.blurb.forEach(function (p) { out.push(wrapLines(p, 76).join('\n'), ''); });
    out.push('THEMES TO TALK ABOUT');
    b.themes.forEach(function (t) { out.push('- ' + t); });
    out.push('', 'QUESTIONS FOR DISCUSSION');
    b.questions.forEach(function (q, i) { out.push(wrapLines((i + 1) + '. ' + q, 76).join('\n    ')); });
    out.push('', 'Want Clemency to join your book club online? Ask at ' + SITE_URL + '/contact.html?topic=events', '');
    return out.join('\n');
  }
  function guideSVG(b) {
    var c = b.jacket, y = 0, body = '';
    b.questions.forEach(function (q, i) {
      wrapLines(q, 62).forEach(function (l, j) {
        y += j ? 22 : 36;
        if (!j) body += '<text x="60" y="' + y + '" font-size="17" fill="' + c.bg + '" font-family="Libre Baskerville, Georgia, serif">' + (i + 1) + '.</text>';
        body += '<text x="90" y="' + y + '" font-size="16">' + esc(l) + '</text>';
      });
    });
    var titleLines = wrapLines(b.title, 22);
    return '<svg xmlns="http://www.w3.org/2000/svg" width="816" height="1056" viewBox="0 0 816 1056" font-family="Crimson Pro, Georgia, serif" fill="#221c18">' +
      '<rect width="816" height="1056" fill="#f5efe3"/><rect width="816" height="18" fill="' + c.bg + '"/>' +
      jacketSVG(b, { attrs: ' x="570" y="52" width="165" height="253"' }) +
      '<text x="60" y="80" font-family="Josefin Sans, sans-serif" font-size="12" letter-spacing="3" fill="#7a5a1c">READING GROUP GUIDE</text>' +
      titleLines.map(function (l, i) { return '<text x="60" y="' + (124 + i * 40) + '" font-family="Libre Baskerville, Georgia, serif" font-size="34">' + esc(l) + '</text>'; }).join('') +
      '<text x="60" y="' + (124 + titleLines.length * 40) + '" font-size="18" font-style="italic" fill="#5b5047">by Clemency Thorne · ' + esc(seriesLine(b)) + '</text>' +
      '<text x="60" y="330" font-family="Josefin Sans, sans-serif" font-size="12" letter-spacing="3" fill="#7a5a1c">QUESTIONS FOR DISCUSSION</text>' +
      '<g transform="translate(0 340)">' + body + '</g>' +
      '<text x="60" y="1010" font-size="14" fill="#5b5047">clemencythorne.example · Some questions touch on the ending.</text></svg>';
  }
  function initClubs() {
    var select = $('#club-book');
    if (!select) return;
    select.innerHTML = BOOKS.map(function (b) { return '<option value="' + b.id + '">' + esc(b.title) + (b.series ? ' (Esme Lark ' + b.no + ')' : '') + '</option>'; }).join('');
    var id = has(BOOK_BY_ID, param('book')) ? param('book') : NEW_RELEASE;
    select.value = id;
    function render() {
      var b = BOOK_BY_ID[select.value];
      $('[data-club-jacket]').innerHTML = jacketSVG(b, { label: jacketLabel(b) });
      $('[data-club-title]').textContent = b.title;
      $('[data-club-series]').textContent = seriesLine(b) + ' · ' + b.genre;
      $('[data-club-blurb]').textContent = b.blurb[0];
      $('[data-club-themes]').innerHTML = b.themes.map(function (t) { return '<li>' + esc(t) + '</li>'; }).join('');
      $('[data-club-questions]').innerHTML = b.questions.map(function (q) { return '<li class="pl-2">' + esc(q) + '</li>'; }).join('');
      $('[data-club-count]').textContent = plural(b.questions.length, 'question');
      $('[data-club-book-link]').href = 'book.html?id=' + b.id;
    }
    select.addEventListener('change', function () { setParams({ book: select.value === NEW_RELEASE ? '' : select.value }); render(); });
    $$('[data-club-download]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var b = BOOK_BY_ID[select.value];
        if (btn.getAttribute('data-club-download') === 'svg') download(b.id + '-book-club-guide.svg', guideSVG(b), 'image/svg+xml');
        else download(b.id + '-book-club-guide.txt', guideText(b));
      });
    });
    render();
  }

  /* ----- Press ----- */
  function pressRelease() {
    var b = BOOK_BY_ID[NEW_RELEASE];
    var hb = b.formats[0];
    return [
      'PRESS RELEASE', 'For immediate release', '',
      b.title.toUpperCase(), 'The new Esme Lark mystery by Clemency Thorne', '',
      'Published by ' + b.imprint + ' on ' + longDay(b.pub, true, true) + '.',
      FORMAT_NAMES[hb.type] + ', ' + hb.pages + ' pages, ' + money(hb.price) + ', ISBN ' + hb.isbn, ''
    ].concat(b.blurb.map(function (p) { return wrapLines(p, 76).join('\n') + '\n'; }))
      .concat(['ABOUT THE AUTHOR', wrapLines(($('#bio-short') || { innerText: '' }).innerText.trim(), 76).join('\n'), '',
        'Publicity: ' + CONTACT_TOPICS.publicity.to + ', ' + CONTACT_TOPICS.publicity.email,
        'Rights: ' + CONTACT_TOPICS.rights.to + ', ' + CONTACT_TOPICS.rights.email, '']).join('\n');
  }
  function initPress() {
    var grid = $('[data-press-jackets]');
    if (!grid) return;
    grid.innerHTML = BOOKS.map(function (b) {
      return '<li class="min-w-0"><span class="jacket">' + jacketSVG(b, {}) + '</span>' +
        '<p class="mt-3 font-display text-base leading-snug">' + esc(b.title) + '</p>' +
        '<button type="button" class="link caps-sm mt-1" data-jacket-download="' + b.id + '">Download SVG<span class="sr-only"> jacket of ' + esc(b.title) + '</span></button></li>';
    }).join('');
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-jacket-download],[data-download]') : null;
      if (!btn) return;
      var id = btn.getAttribute('data-jacket-download');
      if (id && has(BOOK_BY_ID, id)) { download(id + '-jacket.svg', jacketSVG(BOOK_BY_ID[id], { file: true, label: jacketLabel(BOOK_BY_ID[id]) }), 'image/svg+xml'); return; }
      var what = btn.getAttribute('data-download');
      if (what === 'press-release') download(slugFile(BOOK_BY_ID[NEW_RELEASE].title) + '-press-release.txt', pressRelease());
      if (what === 'factsheet') {
        var rows = $$('[data-fact]').map(function (r) { return r.querySelector('dt').textContent.trim() + ': ' + r.querySelector('dd').textContent.trim(); });
        download('clemency-thorne-fact-sheet.txt', 'CLEMENCY THORNE: FACT SHEET\n\n' + rows.join('\n') + '\n');
      }
    });
    $$('[data-release-full]').forEach(function (el) { el.textContent = longDay(BOOK_BY_ID[NEW_RELEASE].pub, true, true); });
  }

  /* ======================================================================
     12. Start
     ====================================================================== */
  initHeader();
  initYear();
  paintJackets();
  fillRelease();
  initCopyButtons();
  initIcs();
  initForms();
  if (page === 'home') initHome();
  if (page === 'books') initBooks();
  if (page === 'book') initBook();
  if (page === 'events') initEvents();
  if (page === 'book-clubs') initClubs();
  if (page === 'press') initPress();
  initReveal();
  initBackToTop();
})();
