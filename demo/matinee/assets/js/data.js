/* The Garnet Theater — program data
 * Everything the pages list (films, showtimes, series, events, prices, concessions and
 * membership tiers) lives here. assets/js/main.js reads window.GARNET and draws the pages.
 * Times are wall-clock times in THEATER.timeZone (America/Denver), whatever the visitor's
 * own time zone is.
 */
window.GARNET = (function () {
  'use strict';

  var THEATER = {
    name: 'The Garnet Theater',
    timeZone: 'America/Denver',
    timeZoneLabel: 'Mountain Time',
    address: '318 North Higgins Avenue, Missoula, MT 59802',
    trailerMinutes: 10, // showtimes include about this many minutes of trailers
    uidDomain: 'garnettheater.example'
  };

  // Demo dates: PROGRAM and EVENTS are written for the three weeks starting DEMO_ANCHOR (a
  // Friday, when the program changes). While KEEP_DEMO_CURRENT is true, every date moves
  // forward by the whole weeks elapsed since DEMO_ANCHOR, so the demo always shows this week
  // and next (weekdays and times never change). Set it to false once you enter real dates.
  var KEEP_DEMO_CURRENT = true;
  var DEMO_ANCHOR = '2026-10-16';

  var GENRES = {
    drama: 'Drama',
    comedy: 'Comedy',
    documentary: 'Documentary',
    thriller: 'Thriller',
    family: 'Family',
    classic: 'Classic',
    horror: 'Horror',
    romance: 'Romance'
  };

  // Screening tags. kind: access (accessibility filter), format, event.
  var TAGS = {
    cc: { label: 'Open captions', short: 'CC', kind: 'access', note: 'English captions on screen for everyone.' },
    ad: { label: 'Audio description', short: 'AD', kind: 'access', note: 'Audio-description headsets from the box office.' },
    sf: { label: 'Sensory-friendly', short: 'Sensory', kind: 'access', note: 'Lights up low, sound down, move and talk as you like.' },
    pb: { label: 'Parent & baby', short: 'Baby', kind: 'access', note: 'Grown-ups with babies under one. Lights dimmed, not dark.' },
    mm: { label: '35mm print', short: '35mm', kind: 'format', note: 'Projected on film from the booth’s 1958 projectors.' },
    qa: { label: 'Intro or Q&A', short: 'Q&A', kind: 'event', note: 'With a guest on stage before or after the film.' }
  };

  /* Films. palette: [background, middle, accent, light] for the SVG poster (see posterArt()
     in main.js, one motif per film id). rating: MPA rating or NR (not rated).
     opens: 'YYYY-MM-DD' for a film that opens during the program; it is listed as "Coming soon"
     until that date (which moves with the program while KEEP_DEMO_CURRENT is on). Films without
     `opens` are already playing. */
  var FILMS = {
    'sweetwater-static': {
      title: 'Sweetwater Static', year: 2026, genre: 'drama', runtime: 112, rating: 'PG-13', country: 'USA', language: 'English',
      director: 'Sidonie Marchal', cast: ['Augustin Ruskell', 'Florrie Brannick', 'Benny Ostrowski'],
      tagline: 'The last night-shift DJ in Sweetwater County is still on the air.',
      synopsis: 'When the AM station she has run alone for eleven years is sold to a satellite network, Wyoming DJ Rae Kessick has one week of broadcasts left and a town that has never once called in. Then the phones start ringing.',
      note: 'Shot on 16mm in the high desert and scored almost entirely with late-night radio static. Our favorite film of the year so far, and the reason the booth crew stayed up past midnight.',
      palette: ['#1b1238', '#3c2a6b', '#e8c874', '#f7eedb']
    },
    'grammar-of-rivers': {
      title: 'A Grammar of Rivers', year: 2026, genre: 'documentary', runtime: 94, rating: 'NR', country: 'USA', language: 'English',
      director: 'Benedikt Danforth', cast: ['Narrated by Colette Lachaise'],
      tagline: 'Three rivers, one valley, a hundred years of listening.',
      synopsis: 'A patient, gorgeous portrait of the Clark Fork, the Bitterroot and the Blackfoot, told through the fishing guides, ranchers, tribal water scientists and kids who know each bend by name.',
      note: 'Filmed within an hour of the theater. Stay for the closing shot over the confluence: the projector booth gave it a round of applause.',
      palette: ['#0f3b44', '#2c6e6a', '#e8c874', '#d9efe8']
    },
    'glass-orchard': {
      title: 'The Glass Orchard', year: 2026, genre: 'drama', runtime: 124, rating: 'PG-13', country: 'Norway / USA', language: 'English, Norwegian',
      director: 'Inga Tremblay', cast: ['Signe Rasmusen', 'Ruben Ashgrove', 'Dulcie Fairley'],
      tagline: 'Every apple remembers the frost.',
      synopsis: 'Two estranged sisters inherit a failing apple orchard on a Norwegian fjord, and the glassblower who has been renting the barn. Over one harvest they argue, bargain and slowly work out what their father was building.',
      note: 'A quiet film that sneaks up on you. Bring tissues and someone you have not called in a while.',
      palette: ['#203a2c', '#4b7a4d', '#f0b04c', '#e9f2e2']
    },
    'hallelujah-switchback': {
      title: 'Hallelujah Switchback', year: 2026, genre: 'comedy', runtime: 101, rating: 'PG-13', country: 'USA', language: 'English',
      director: 'Lyle Mayhew', cast: ['Benny Ostrowski', 'Marisela Quintana', 'Gus Tamberlane'],
      tagline: 'Forty-one hairpins. One church choir. No brakes to speak of.',
      synopsis: 'A gospel choir from Spokane rents the wrong bus for a competition in Bozeman, then takes a mountain shortcut its driver insists is a road. A warm, rowdy comedy with the best harmonies of the year.',
      note: 'The audience at our preview sang along to the end credits. We are not stopping you.',
      palette: ['#7a2a12', '#d0612a', '#f7d27a', '#fff3dc']
    },
    'ferris-hotel': {
      title: 'Midnight at the Ferris Hotel', year: 2026, genre: 'thriller', runtime: 109, rating: 'R', country: 'USA', language: 'English',
      director: 'Dragan Vukovic', cast: ['Liesl Strandberg', 'Cyrus Mattingly', 'Zsofia Varga'],
      tagline: 'Check-in is at nine. Nobody checks out.',
      synopsis: 'A night auditor in a grand old railroad hotel notices that one room keeps appearing on the guest list, though the hotel has no room with that number. A tightly wound puzzle thriller that plays fair to the last frame.',
      note: 'Best seen with a full house. The hotel is a set, but you will swear it is three blocks from here.',
      palette: ['#120c1f', '#2f2447', '#c22a45', '#f4d79a']
    },
    'juniper-weather': {
      title: 'Juniper and the Weather Machine', year: 2026, genre: 'family', runtime: 88, rating: 'PG', country: 'USA / Canada', language: 'English',
      director: 'Pia Ravensworth', cast: ['Voices of Dulcie Fairley', 'Oscar Takamine', 'Marisela Quintana'],
      tagline: 'Forecast: one hundred percent chance of Juniper.',
      synopsis: 'Ten-year-old Juniper builds a machine from her grandmother’s old barometers and accidentally becomes in charge of the weather for a whole prairie town. A hand-drawn animated adventure for anyone over five.',
      note: 'Our Saturday morning crowd has seen it three times. Ages five and up; there is one loud thunderstorm.',
      palette: ['#2f6fa3', '#7fb6d9', '#f2c14e', '#fdf6e3']
    },
    'quiet-cartographer': {
      title: 'The Quiet Cartographer', year: 2026, genre: 'drama', runtime: 117, rating: 'PG', country: 'United Kingdom', language: 'English',
      director: 'Matthias Adebanjo', cast: ['Solveig Halberg', 'Emeric Lavalle', 'Thaddeus Kittredge'],
      tagline: 'Some places are only on one map.',
      synopsis: 'A retired mapmaker losing her memory sets out to redraw the coastline of the island where she grew up, with the help of a grandson who has never been there. Tender, funny and beautifully restrained.',
      note: 'Solveig Halberg gives the performance of the year. This is the film our Cinema Club members picked this month.',
      palette: ['#23324a', '#5b7493', '#d9b25a', '#f1ead8']
    },
    'small-hours-tangier': {
      title: 'Small Hours in Tangier', year: 2025, genre: 'romance', runtime: 106, rating: 'PG-13', country: 'Morocco / France', language: 'French and Arabic with English subtitles',
      director: 'Soraya Benslimane', cast: ['Yasmine Kettani', 'Laurent Vaillancourt'],
      tagline: 'One night. One missed ferry. One very long conversation.',
      synopsis: 'A translator and a stranded architect miss the last ferry to Spain and spend the night walking the old medina, talking about everything except the reasons they were leaving.',
      note: 'Shot in three real nights with almost no artificial light. Subtitled in English at every showing.',
      palette: ['#16324f', '#2d5d8a', '#e9a23b', '#fbe9c8']
    },
    'copper-line': {
      title: 'Ride the Copper Line', year: 1953, genre: 'classic', runtime: 92, rating: 'NR', country: 'USA', language: 'English',
      director: 'Garland Pruitt', cast: ['Roy Delacourt', 'Rhoda Selwyn'],
      tagline: 'From Butte to the Coast, with a fortune in the mail car.',
      synopsis: 'A railroad detective rides the overnight train from Butte with a payroll shipment, a suspicious widow and a conductor who knows too much. A brisk Technicolor western, shown from our own 35mm print.',
      note: 'This print lives in our vault and comes out twice a year. Abel threads it by hand; the reel change at minute 46 is part of the show.',
      palette: ['#5b1a0e', '#b4552a', '#f3c06a', '#fde9c4']
    },
    'starlight-dispatch': {
      title: 'Dispatch from Starlight', year: 1947, genre: 'classic', runtime: 98, rating: 'NR', country: 'USA', language: 'English',
      director: 'Rupert Marchbanks', cast: ['Bettina Carraway', 'Desmond Hatherley'],
      tagline: 'She had the scoop. He had the typewriter.',
      synopsis: 'Rival reporters are stranded at a Hollywood premiere in a blackout and race to file the story of the night before the lights come back on. A screwball comedy restored from the camera negative.',
      note: 'The restoration premiered last year and it sparkles. The 4:00 pm Thursday show is our classic matinee, introduced from the stage.',
      palette: ['#121212', '#3a3a3a', '#e8c874', '#f5f1e6']
    },
    'ninth-floor-nocturne': {
      title: 'Ninth Floor Nocturne', year: 2026, genre: 'thriller', runtime: 103, rating: 'R', country: 'USA', language: 'English',
      director: 'Mariko Brandvold', cast: ['Solomon Treadwell', 'Zsofia Varga', 'Cyrus Mattingly'],
      tagline: 'The elevator only goes to nine at night.',
      synopsis: 'A jazz pianist takes a late gig in an empty office tower and starts receiving requests from a floor that was sealed in 1972. A rain-soaked neo-noir with a score you will hum on the way home.',
      note: 'Our late-show regulars voted this one back for a second week.',
      palette: ['#0d1a24', '#24485a', '#e2b64f', '#e6eef1']
    },
    'snowbound-choir': {
      title: 'The Snowbound Choir', year: 2026, genre: 'documentary', runtime: 82, rating: 'PG', country: 'Iceland / USA', language: 'English and Icelandic with English subtitles',
      director: 'Ragna Thorvaldsen', cast: ['The singers of Hólar'],
      opens: '2026-10-24',
      tagline: 'Forty voices, one road out, and it is closed until spring.',
      synopsis: 'In a fishing village cut off every winter, the community choir rehearses for a concert that may never happen. A small, joyful documentary about singing your way through the dark.',
      note: 'A perfect early-evening film. The Wednesday 1:00 pm show is our Parent & Baby screening.',
      palette: ['#1d2e44', '#5d7fa6', '#f0d68a', '#f3f7fb']
    },
    'hollow-larch': {
      title: 'The Hollow Larch', year: 2026, genre: 'horror', runtime: 97, rating: 'R', country: 'USA', language: 'English',
      director: 'Lucan Castellane', cast: ['Hattie Mallory', 'Thaddeus Kittredge', 'Gus Tamberlane'],
      tagline: 'When the needles turn gold, stay out of the woods.',
      synopsis: 'Every autumn the larches on Mallory Ridge turn gold and drop their needles. This year one of them does not, and the forestry crew sent to cut it down hears something knocking from inside.',
      note: 'Shot in the Lolo National Forest. Our Late Show Society screens it on Saturday nights.',
      palette: ['#180d0a', '#3a1f14', '#e6a63a', '#f6e2b0']
    },
    'bonfire-logic': {
      title: 'Bonfire Logic', year: 2026, genre: 'comedy', runtime: 99, rating: 'R', country: 'USA', language: 'English',
      director: 'Jessamy Dewhurst', cast: ['Gus Tamberlane', 'Ione Halliday', 'Benny Ostrowski'],
      opens: '2026-10-23',
      tagline: 'Five old friends. One campsite. No cell signal.',
      synopsis: 'A twentieth-reunion camping trip goes sideways when the friends discover that the one who organized it has not told them she is selling the land. Sharp, generous and very funny about getting older.',
      note: 'Rated R for language, most of it from Ione Halliday, all of it earned.',
      palette: ['#1e1410', '#4a2a17', '#f07a2a', '#ffe0a8']
    },
    'owls-lolo': {
      title: 'Night Owls of Lolo Pass', year: 2026, genre: 'family', runtime: 71, rating: 'G', country: 'USA', language: 'English',
      director: 'Barnaby Fenmore', cast: ['Narrated by Clement Arkwright'],
      tagline: 'Seven owls. One mountain pass. A whole winter of night shifts.',
      synopsis: 'Infrared cameras follow seven species of owl through one winter on the Montana–Idaho line. Short enough for small kids, astonishing enough for everyone else.',
      note: 'Made by a Missoula wildlife crew. Our own education lead narrates; he is very proud and slightly embarrassed.',
      palette: ['#14243a', '#2f4a6b', '#e8c874', '#eef1f6']
    },
    'seven-lakes': {
      title: 'Seven Lakes, One Summer', year: 2026, genre: 'drama', runtime: 111, rating: 'PG-13', country: 'USA', language: 'English',
      director: 'Britt Sorensby', cast: ['Dashiell Kettlewell', 'Odalys Wilbanks', 'Florrie Brannick'],
      opens: '2026-10-30',
      tagline: 'Swim all seven before Labor Day. That was the deal.',
      synopsis: 'Two brothers keep a childhood promise to swim seven alpine lakes in one summer, carrying their mother’s ashes and a forty-year-old trail guide that is wrong about almost everything.',
      note: 'Opening night includes a conversation with director Britt Sorensby, who grew up in the Bitterroot.',
      palette: ['#0f3550', '#3f86a8', '#f4c95d', '#eaf5f7']
    },
    'harvest-small': {
      title: 'Harvest of Small Things', year: 2025, genre: 'drama', runtime: 128, rating: 'NR', country: 'Portugal', language: 'Portuguese with English subtitles',
      director: 'Graça Valadares', cast: ['Joaquim Serrano Lobo', 'Leonor Faria Antunes'],
      opens: '2026-10-31',
      tagline: 'A fig tree, a widower and a very stubborn neighbor.',
      synopsis: 'In a hill village in the Alentejo, a retired postman tends his late wife’s fig tree and refuses to sell his house to the family next door. A slow, sunlit film about what we keep and why.',
      note: 'Winner of the audience award at every festival it has played. We had to fight for this print.',
      palette: ['#3b1d3a', '#7a3f6e', '#e9b04f', '#f8eadf']
    }
  };

  /* The program: one line per day, keyed by date. Each line lists that day's screenings as
     'HH:MM film-id tag tag', separated by |. Tags are keys of TAGS. The Garnet has one screen,
     so screenings on a day never overlap (main.js warns in the console if they do). */
  var PROGRAM = {
    '2026-10-16': '13:30 quiet-cartographer | 16:15 juniper-weather | 18:45 sweetwater-static qa | 21:15 ferris-hotel',
    '2026-10-17': '11:00 owls-lolo | 13:30 juniper-weather | 16:15 glass-orchard | 18:45 sweetwater-static | 21:15 hollow-larch | 23:30 ninth-floor-nocturne',
    '2026-10-18': '11:00 juniper-weather sf | 13:30 copper-line mm | 16:15 small-hours-tangier cc | 18:45 glass-orchard | 21:15 ferris-hotel',
    '2026-10-19': '16:00 grammar-of-rivers | 18:45 quiet-cartographer | 21:15 ninth-floor-nocturne',
    '2026-10-20': '16:00 hallelujah-switchback | 18:45 sweetwater-static cc | 21:15 hollow-larch',
    '2026-10-21': '13:00 glass-orchard pb | 16:00 owls-lolo ad | 18:45 small-hours-tangier | 21:15 hallelujah-switchback',
    '2026-10-22': '16:00 starlight-dispatch | 18:45 ferris-hotel ad | 21:15 sweetwater-static',

    '2026-10-23': '13:30 small-hours-tangier | 16:15 quiet-cartographer | 18:45 bonfire-logic | 21:15 ninth-floor-nocturne',
    '2026-10-24': '11:00 juniper-weather | 13:30 snowbound-choir | 16:15 sweetwater-static | 18:45 bonfire-logic | 21:15 ferris-hotel | 23:30 hollow-larch',
    '2026-10-25': '11:00 owls-lolo sf | 13:30 starlight-dispatch mm | 16:15 snowbound-choir cc | 18:45 glass-orchard | 21:15 bonfire-logic',
    '2026-10-26': '16:00 juniper-weather | 18:45 sweetwater-static | 21:15 hollow-larch',
    '2026-10-27': '16:00 grammar-of-rivers cc | 18:45 quiet-cartographer qa | 21:15 ninth-floor-nocturne',
    '2026-10-28': '13:00 snowbound-choir pb | 16:00 hallelujah-switchback | 18:45 bonfire-logic cc | 21:15 small-hours-tangier',
    '2026-10-29': '16:00 glass-orchard | 18:45 hallelujah-switchback ad | 21:15 ferris-hotel',

    '2026-10-30': '13:30 glass-orchard | 16:15 juniper-weather | 18:45 seven-lakes qa | 21:15 bonfire-logic',
    '2026-10-31': '11:00 juniper-weather sf | 13:30 owls-lolo | 16:00 harvest-small | 18:45 seven-lakes | 21:15 hollow-larch mm | 23:30 ferris-hotel',
    '2026-11-01': '11:00 owls-lolo | 13:30 copper-line mm | 16:15 snowbound-choir | 18:45 harvest-small | 21:30 ninth-floor-nocturne',
    '2026-11-02': '16:00 quiet-cartographer | 18:45 sweetwater-static cc | 21:15 ninth-floor-nocturne',
    '2026-11-03': '16:00 small-hours-tangier | 18:45 harvest-small cc | 21:30 bonfire-logic',
    '2026-11-04': '13:00 seven-lakes pb | 16:00 grammar-of-rivers | 18:45 sweetwater-static | 21:15 glass-orchard',
    '2026-11-05': '16:00 snowbound-choir | 18:45 seven-lakes ad | 21:15 bonfire-logic'
  };

  /* Seat map: one entry per row, front (A) to back. Each block is a run of seats; the gaps
     between blocks are aisles. offset: empty seat widths before the first block (to line rows
     up). wheel: seat numbers that are wheelchair spaces. */
  var SEAT_ROWS = [
    { row: 'A', blocks: [10], offset: 4 },
    { row: 'B', blocks: [3, 10, 3] },
    { row: 'C', blocks: [4, 10, 4] },
    { row: 'D', blocks: [4, 10, 4] },
    { row: 'E', blocks: [4, 10, 4] },
    { row: 'F', blocks: [4, 10, 4] },
    { row: 'G', blocks: [4, 10, 4] },
    { row: 'H', blocks: [4, 10, 4] },
    { row: 'J', blocks: [4, 10, 4] },
    { row: 'K', blocks: [4, 10, 4] },
    { row: 'L', blocks: [4, 10, 4] },
    { row: 'M', blocks: [2, 10, 2], offset: 2, wheel: [1, 2, 13, 14] }
  ];

  // Ticket prices in dollars. matinee: price for screenings starting before 5:00 pm.
  var TICKET_TYPES = {
    adult: { label: 'Adult', price: 13, matinee: 10 },
    senior: { label: 'Senior (65+)', price: 10, matinee: 9 },
    student: { label: 'Student (with ID)', price: 10, matinee: 9 },
    child: { label: 'Child (under 13)', price: 8, matinee: 8 },
    member: { label: 'Member', price: 8, matinee: 7 }
  };
  var MAX_SEATS = 10;

  /* Concessions. diet: v = vegetarian, vg = vegan, gf = gluten-free. addon: offered on the
     tickets page for pickup at the stand. */
  var CONCESSIONS = [
    { id: 'popcorn-small', group: 'Popcorn', name: 'Popcorn, small', price: 5, desc: 'Popped every hour in coconut oil, with real butter on request.', diet: ['v', 'gf'], addon: true },
    { id: 'popcorn-large', group: 'Popcorn', name: 'Popcorn, large', price: 8, desc: 'Free refill of a large during the same show.', diet: ['v', 'gf'], addon: true },
    { id: 'popcorn-huckleberry', group: 'Popcorn', name: 'Huckleberry kettle corn', price: 7, desc: 'Sweet, salty and purple. Weekends only.', diet: ['vg', 'gf'], addon: true },
    { id: 'popcorn-yeast', group: 'Popcorn', name: 'Nutritional-yeast topping', price: 1, desc: 'Our vegan stand-in for butter. Ask at the stand.', diet: ['vg', 'gf'] },
    { id: 'soda-huckleberry', group: 'Drinks', name: 'Huckleberry soda', price: 4, desc: 'Bottled for us in Montana from wild berries.', diet: ['vg', 'gf'], addon: true },
    { id: 'root-beer', group: 'Drinks', name: 'Sarsaparilla root beer', price: 4, desc: 'On tap, in a glass bottle you can keep.', diet: ['vg', 'gf'] },
    { id: 'cocoa', group: 'Drinks', name: 'Hot cocoa', price: 4, desc: 'With oat milk or whole milk, and a marshmallow.', diet: ['v', 'gf'], addon: true },
    { id: 'beer-local', group: 'Drinks', name: 'Montana draft beer', price: 7, desc: 'Two rotating taps from breweries within 50 miles. 21+ with ID.', diet: ['vg'], addon: true },
    { id: 'chocolate-bar', group: 'Sweets', name: 'Dark chocolate bar', price: 4, desc: '70% cocoa with sea salt, made in Bozeman.', diet: ['vg', 'gf'], addon: true },
    { id: 'licorice', group: 'Sweets', name: 'Red licorice ropes', price: 3, desc: 'The long kind. Not for sharing.', diet: ['vg'] },
    { id: 'cookie', group: 'Sweets', name: 'Brown-butter cookie', price: 3, desc: 'Baked across the street every morning.', diet: ['v'] },
    { id: 'pretzel', group: 'Savory', name: 'Soft pretzel', price: 6, desc: 'With beer cheese or mustard.', diet: ['v'] },
    { id: 'hot-dog', group: 'Savory', name: 'Bison hot dog', price: 7, desc: 'Montana bison, steamed bun, the works.', diet: [] },
    { id: 'combo', group: 'Combos', name: 'Matinee combo', price: 10, desc: 'Small popcorn, a soda and a cookie.', diet: ['v'], addon: true }
  ];
  var DIETS = { v: 'Vegetarian', vg: 'Vegan', gf: 'Gluten-free' };

  /* Series: the regular strands of the program. art: key for seriesArt() in main.js. */
  var SERIES = {
    'cinema-club': { name: 'Cinema Club', when: 'Monthly, Tuesdays at 6:45 pm', art: 'club', blurb: 'One film a month, chosen by members, with a guided conversation in the Mezzanine Lounge afterward. Coffee and pie included.' },
    'organ-silents': { name: 'Organ Loft Silents', when: 'Monthly, Monday 1:00 pm', art: 'organ', blurb: 'Silent classics accompanied live on our 1929 theater organ by house organist Marjorie Feltz. Bring a cushion; the music is loud.' },
    'saturday-kids': { name: 'Saturday Kids’ Matinee', when: 'Saturdays, 11:00 am', art: 'kids', blurb: 'A family film every Saturday morning at matinee prices, with a ten-minute craft or quiz in the lobby beforehand.' },
    'late-show': { name: 'Late Show Society', when: 'Saturday nights', art: 'late', blurb: 'Cult, horror and the deeply strange, after dark. Members of the Society vote on the next season’s titles.' },
    'montana-made': { name: 'Montana Made', when: 'Quarterly', art: 'mountain', blurb: 'Short and feature films from Montana filmmakers, with the makers in the room. Submissions open year-round.' },
    'booth-35': { name: 'Projectionist’s Choice', when: 'Sunday 35mm shows and classic Thursdays', art: 'reel', blurb: 'Chief projectionist Abel Tremaine picks a title from our vault of 35mm prints and introduces it from the stage.' }
  };

  /* One-off events, written for the demo weeks (they move with KEEP_DEMO_CURRENT).
     show: optional 'YYYY-MM-DD HH:MM' of a screening in PROGRAM that the event belongs to; those
     events are booked on the tickets page at the usual prices. price: shown for other events. */
  var EVENTS = [
    { id: 'starlight-classic-matinee', series: 'booth-35', date: '2026-10-22', start: '16:00', end: '17:45', place: 'Auditorium', show: '2026-10-22 16:00', title: 'Classic Thursday: Dispatch from Starlight', summary: 'Our classic matinee, introduced by Abel Tremaine with a few words on how a 1947 camera negative was brought back.' },
    { id: 'kids-craft-juniper', series: 'saturday-kids', date: '2026-10-24', start: '10:30', end: '10:55', place: 'Lobby', show: '2026-10-24 11:00', title: 'Make-a-Cloud Craft Table', summary: 'Before Juniper and the Weather Machine: cotton-ball clouds, paper lightning and a weather quiz with prizes.' },
    { id: 'starlight-35', series: 'booth-35', date: '2026-10-25', start: '13:30', end: '15:20', place: 'Auditorium', show: '2026-10-25 13:30', title: 'Dispatch from Starlight in 35mm', summary: 'The new restoration, struck to film. Abel explains the reel changes, and the projection booth is open for ten minutes afterward.' },
    { id: 'cinema-club-cartographer', series: 'cinema-club', date: '2026-10-27', start: '18:45', end: '21:30', place: 'Auditorium, then the Mezzanine Lounge', show: '2026-10-27 18:45', title: 'Cinema Club: The Quiet Cartographer', summary: 'This month’s Cinema Club pick, followed by a conversation led by Hedda Okonski. Coffee and marionberry pie in the lounge.' },
    { id: 'seven-lakes-opening', series: 'montana-made', date: '2026-10-30', start: '18:45', end: '21:15', place: 'Auditorium', show: '2026-10-30 18:45', title: 'Opening Night: Seven Lakes, One Summer', summary: 'Director Britt Sorensby joins us for a conversation after the film. Members get first pick of seats until the Tuesday before.' },
    { id: 'larch-35', series: 'late-show', date: '2026-10-31', start: '21:15', end: '23:00', place: 'Auditorium', show: '2026-10-31 21:15', title: 'Late Show Society: The Hollow Larch in 35mm', summary: 'The only 35mm print in the state, on loan for one night. Flashlights stay in the lobby.' },
    { id: 'organ-gull-rock', series: 'organ-silents', date: '2026-11-09', start: '13:00', end: '14:30', place: 'Auditorium', price: '$12', title: 'Organ Loft Silents: The Lighthouse at Gull Rock (1926)', summary: 'A storm, a lighthouse keeper and a shipwreck, with Marjorie Feltz at the organ. Her score is new and she will not tell us how it ends.' },
    { id: 'montana-made-shorts', series: 'montana-made', date: '2026-11-12', start: '19:00', end: '21:30', place: 'Auditorium', price: '$10', title: 'Montana Made: Shorts Night', summary: 'Nine short films from Montana directors, from a two-minute animation to a 24-minute western. Filmmakers on stage afterward.' },
    { id: 'booth-tour', series: 'booth-35', date: '2026-11-14', start: '10:00', end: '10:45', place: 'Projection booth (stairs only)', price: 'Free, booking needed', title: 'Projection Booth Tour', summary: 'Climb to the booth, meet the 1958 projectors and splice a strip of film you can take home. Twelve people per tour; ages 8 and up.' },
    { id: 'cinema-club-november', series: 'cinema-club', date: '2026-11-24', start: '18:45', end: '21:30', place: 'Auditorium, then the Mezzanine Lounge', price: '$13, members $8', title: 'Cinema Club: Next Month’s Members’ Pick', summary: 'Members vote on three titles at the start of the month. The winner is announced in the newsletter and on the marquee.' },
    { id: 'organ-december', series: 'organ-silents', date: '2026-12-07', start: '13:00', end: '14:30', place: 'Auditorium', price: '$12', title: 'Organ Loft Silents: Two-Reel Comedy Afternoon', summary: 'Four short silent comedies, a lot of pratfalls and Marjorie Feltz at the organ. Perfect for kids who think they hate old movies.' },
    { id: 'montana-made-call', series: 'montana-made', date: '2026-12-10', start: '18:00', end: '20:00', place: 'Mezzanine Lounge', price: 'Free', title: 'Montana Made: Filmmakers’ Mixer', summary: 'Meet the programming team, pitch your short and find a crew. Cash bar and popcorn on the house.' }
  ];

  /* Membership. Annual price = 10 × monthly (two months free). */
  var MEMBERSHIP = {
    'usher': {
      name: 'Usher', monthly: 9, annual: 90, tickets: '$8 tickets', color: 'sand',
      perks: ['$8 tickets to every regular screening', '10% off at the concession stand', 'Members’ newsletter and first look at the program', 'Vote in Cinema Club and Late Show Society picks']
    },
    'projectionist': {
      name: 'Projectionist', monthly: 16, annual: 160, tickets: '$8 tickets + 2 free a month', color: 'garnet', featured: true,
      perks: ['Everything in Usher', 'Two free tickets every month (bring a friend)', 'Free popcorn at every visit', 'Early booking for opening nights and Q&As', 'Projection booth tour for two']
    },
    'marquee-circle': {
      name: 'Marquee Circle', monthly: 35, annual: 350, tickets: 'Unlimited regular screenings', color: 'velvet',
      perks: ['Everything in Projectionist', 'Unlimited regular screenings for one', 'Your name on the Marquee Circle board in the lobby', 'Two private-hire hours a year at member rates', 'A line on the marquee for one night a year']
    }
  };

  /* Private hire: base rate per hour and add-ons, used by the quote estimator on events.html. */
  var HIRE = {
    types: {
      birthday: { label: 'Birthday or party', rate: 260 },
      company: { label: 'Company screening', rate: 340 },
      premiere: { label: 'Premiere or film festival', rate: 380 },
      proposal: { label: 'Proposal or wedding screening', rate: 300 },
      school: { label: 'School or nonprofit', rate: 160 }
    },
    minHours: 2,
    maxHours: 6,
    addons: {
      marquee: { label: 'Your message on the marquee', price: 75 },
      organ: { label: 'Live organ prelude (20 minutes)', price: 180 },
      popcorn: { label: 'Unlimited popcorn bar', perGuest: 4 },
      lounge: { label: 'Mezzanine Lounge reception', price: 150 }
    }
  };

  // Box office hours by weekday (0 = Sunday). The box office opens 30 minutes before the
  // first screening; these are the hours for phone and walk-up sales.
  var HOURS = [
    { day: 0, open: '10:30', close: '21:30' },
    { day: 1, open: '15:30', close: '21:30' },
    { day: 2, open: '15:30', close: '21:30' },
    { day: 3, open: '12:30', close: '21:30' },
    { day: 4, open: '15:30', close: '21:30' },
    { day: 5, open: '13:00', close: '21:30' },
    { day: 6, open: '10:30', close: '23:45' }
  ];

  return {
    THEATER: THEATER, KEEP_DEMO_CURRENT: KEEP_DEMO_CURRENT, DEMO_ANCHOR: DEMO_ANCHOR, GENRES: GENRES, TAGS: TAGS,
    FILMS: FILMS, PROGRAM: PROGRAM, SEAT_ROWS: SEAT_ROWS, TICKET_TYPES: TICKET_TYPES, MAX_SEATS: MAX_SEATS,
    CONCESSIONS: CONCESSIONS, DIETS: DIETS, SERIES: SERIES, EVENTS: EVENTS, MEMBERSHIP: MEMBERSHIP, HIRE: HIRE, HOURS: HOURS
  };
})();
