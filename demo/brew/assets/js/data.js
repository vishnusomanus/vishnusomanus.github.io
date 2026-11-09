/* Cinderjack Brewing Co. (Brew template) — the data every page reads. Edit this file to make the
 * template yours; assets/js/main.js turns it into tap boards, cans, charts, calendars and forms.
 *
 *  Times are "HH:MM" (24-hour) in BREW.timeZone. Weekday indexes: 0 = Sunday … 6 = Saturday.
 *  Dates are "YYYY-MM-DD". Prices are US dollars.
 */
window.BREW_DATA = (function () {
  'use strict';

  // The brewery. Phone numbers come from the 555-01xx range reserved for fiction.
  const BREW = {
    name: 'Cinderjack Brewing Co.',
    short: 'Cinderjack',
    timeZone: 'America/Los_Angeles',
    locale: 'en-US',
    currency: 'USD',
    phone: '(541) 555-0142',
    phoneHref: '+15415550142',
    eventsPhone: '(541) 555-0147',
    eventsPhoneHref: '+15415550147',
    email: 'taproom@cinderjack.example',
    address: '715 NE Hawthorne Avenue, Bend, OR 97701'
  };

  // Keep the demo's dated events current: while true, events written for the weeks after DEMO_ANCHOR
  // move forward by whole weeks (so weekdays never change) once that week has passed. Set it to false
  // when you enter your real dates: past events then simply drop off the list.
  const KEEP_DEMO_CURRENT = true;
  const DEMO_ANCHOR = '2026-10-21';

  // Regular taproom hours per weekday; null = closed all day.
  const HOURS = [
    ['11:00', '20:00'], // Sunday
    ['15:00', '21:00'], // Monday
    ['15:00', '21:00'], // Tuesday
    ['12:00', '21:00'], // Wednesday
    ['12:00', '21:00'], // Thursday
    ['12:00', '22:00'], // Friday
    ['11:00', '22:00'] // Saturday
  ];
  // Last call is this many minutes before closing.
  const LAST_CALL_MINUTES = 30;

  // US federal holidays are worked out for any year in main.js (federalHolidays). This says what the
  // taproom does on each: null = closed, ['HH:MM', 'HH:MM'] = holiday hours, 'regular' = normal hours.
  // note: an optional line shown in the holiday list.
  const HOLIDAY_HOURS = {
    newyear: { hours: null, note: 'Closed so the crew can sleep in.' },
    mlk: { hours: ['11:00', '21:00'], note: 'Opening early at 11am.' },
    presidents: { hours: ['11:00', '21:00'], note: 'Opening early at 11am.' },
    memorial: { hours: ['11:00', '21:00'], note: 'Beer garden open from 11am.' },
    juneteenth: { hours: 'regular', note: 'Regular hours.' },
    independence: { hours: ['11:00', '18:00'], note: 'Closing at 6pm for the fireworks.' },
    labor: { hours: ['11:00', '21:00'], note: 'Beer garden open from 11am.' },
    columbus: { hours: 'regular', note: 'Regular hours.' },
    veterans: { hours: 'regular', note: 'First pint is on us for veterans and service members.' },
    thanksgiving: { hours: null, note: 'Closed. Pick up cans by Wednesday.' },
    christmas: { hours: null, note: 'Merry Christmas from the crew.' }
  };
  // Other days with special hours every year, as "MM-DD" (null = closed).
  const EXTRA_HOURS = {
    '12-24': { name: 'Christmas Eve', hours: ['11:00', '16:00'], note: 'Closing at 4pm.' },
    '12-31': { name: "New Year's Eve", hours: ['12:00', '23:00'], note: 'Open late for the countdown.' }
  };

  // Beer styles shown as filters on beers.html (?style=<id>).
  const STYLE_GROUPS = {
    hoppy: 'Hoppy',
    crisp: 'Crisp & light',
    dark: 'Malty & dark',
    wild: 'Sour & farmhouse'
  };
  // Strength bands (?strength=<id>), by ABV.
  const STRENGTHS = {
    session: { label: 'Session', note: 'under 5%', min: 0, max: 4.99 },
    standard: { label: 'Standard', note: '5–7%', min: 5, max: 7 },
    strong: { label: 'Strong', note: 'over 7%', min: 7.01, max: 99 }
  };
  // Flavor chart axes (each beer scores 0–5 on every axis).
  const FLAVOR_AXES = [
    { id: 'bitter', label: 'Bitter' },
    { id: 'malt', label: 'Malty' },
    { id: 'roast', label: 'Roasty' },
    { id: 'body', label: 'Body' },
    { id: 'tart', label: 'Tart' },
    { id: 'fruit', label: 'Fruity' }
  ];

  // The beers. tap: tap number on the board (null = not pouring now). cans: sold to go in shop.html.
  // motif: the label drawing (see MOTIFS in main.js); colors: [label, band, ink on the label].
  // tapped: days ago the current keg went on. The beers in SEASONAL_TAP get their tap and tapped
  // values from their release events instead (see below).
  const BEERS = [
    {
      id: 'cinder-trail', name: 'Cinder Trail', style: 'West Coast IPA', group: 'hoppy', abv: 6.8, ibu: 72,
      tap: 1, cans: true, tapped: 4, motif: 'cone', colors: ['#e0a133', '#a63f1c', '#241a13'],
      tagline: 'Our flagship. Pine, grapefruit pith and a dry, snappy finish.',
      notes: 'Simcoe, Centennial and Chinook, with a bone-dry malt bill so the hops do the talking. Resinous on the nose, grapefruit and orange pith in the middle, and a clean bitterness that keeps you going back.',
      hops: 'Simcoe, Centennial, Chinook', pairing: 'Smoked brisket, spicy wings',
      flavor: { bitter: 5, malt: 2, roast: 0, body: 3, tart: 0, fruit: 3 }
    },
    {
      id: 'dust-devil', name: 'Dust Devil', style: 'Hazy IPA', group: 'hoppy', abv: 6.6, ibu: 38,
      tap: 2, cans: true, tapped: 2, motif: 'whirl', colors: ['#f3d692', '#d9623a', '#241a13'],
      tagline: 'Soft, juicy and spinning with mango and stone fruit.',
      notes: 'Oats and wheat for a pillowy body, then Citra, Mosaic and Strata added late and dry-hopped twice. Mango, ripe peach and a little dank, with a gentle, rounded bitterness.',
      hops: 'Citra, Mosaic, Strata', pairing: 'Fish tacos, aged gouda',
      flavor: { bitter: 2, malt: 2, roast: 0, body: 4, tart: 0, fruit: 5 }
    },
    {
      id: 'little-hare', name: 'Little Hare', style: 'Session Hazy IPA', group: 'hoppy', abv: 4.3, ibu: 30,
      tap: 3, cans: true, tapped: 6, motif: 'hare', colors: ['#cfe0c3', '#24493f', '#241a13'],
      tagline: 'All the tropical hop flavor, light enough for a long afternoon.',
      notes: 'Brewed for river days and long trail rides. Passion fruit and tangerine from Idaho 7 and El Dorado, a soft oat body and a finish that stays light.',
      hops: 'Idaho 7, El Dorado', pairing: 'Arepas, green salads',
      flavor: { bitter: 2, malt: 1, roast: 0, body: 2, tart: 0, fruit: 4 }
    },
    {
      id: 'rimfire', name: 'Rimfire', style: 'Double IPA', group: 'hoppy', abv: 8.6, ibu: 88,
      tap: null, cans: false, tapped: null, motif: 'rim', colors: ['#d9623a', '#241a13', '#fbf5e8'],
      tagline: 'Big, bright and bitter. Sunset over the canyon rim.',
      notes: 'A double helping of Cascade-grown hops over a sturdy malt backbone. Tangerine, pine sap and a warming finish. Poured in 10 oz glasses only.',
      hops: 'Strata, Simcoe, Columbus', pairing: 'Blue cheese burgers, carrot cake',
      flavor: { bitter: 5, malt: 3, roast: 0, body: 4, tart: 0, fruit: 4 }
    },
    {
      id: 'pine-drop', name: 'Pine Drop', style: 'Pale Ale', group: 'hoppy', abv: 5.4, ibu: 40,
      tap: 5, cans: false, tapped: 9, motif: 'pine', colors: ['#24493f', '#e0a133', '#fbf5e8'],
      tagline: 'A golden, easygoing pale with a resinous snap.',
      notes: 'Crystal and Cascade hops, a touch of honey malt and plenty of fresh-cut pine. The one we drink after a shift.',
      hops: 'Cascade, Crystal', pairing: 'Pierogi, roast chicken',
      flavor: { bitter: 3, malt: 2, roast: 0, body: 2, tart: 0, fruit: 2 }
    },
    {
      id: 'high-desert-pils', name: 'High Desert Pils', style: 'Pilsner', group: 'crisp', abv: 4.9, ibu: 34,
      tap: 6, cans: true, tapped: 12, motif: 'mesa', colors: ['#fbf5e8', '#e0a133', '#24493f'],
      tagline: 'Crisp, floral and lagered for six weeks.',
      notes: 'Floor-malted pilsner malt, Saaz and Tettnang, and patience. Bread crust, lemon blossom and a hard, dry finish that tastes like a cold drink of water after a dusty hike.',
      hops: 'Saaz, Tettnang', pairing: 'Pretzels, oysters, anything fried',
      flavor: { bitter: 3, malt: 2, roast: 0, body: 1, tart: 0, fruit: 1 }
    },
    {
      id: 'snowmelt', name: 'Snowmelt', style: 'Kölsch', group: 'crisp', abv: 4.7, ibu: 22,
      tap: 7, cans: false, tapped: 5, motif: 'flake', colors: ['#dfe9ea', '#24493f', '#241a13'],
      tagline: 'Clean, pale and gently fruity. Our gateway beer.',
      notes: 'Fermented cool with a traditional Kölsch yeast, then lagered cold. A whisper of white grape and pear, soft bread and a quick, clean finish.',
      hops: 'Hallertau Mittelfrüh', pairing: 'Grilled sausages, soft cheese',
      flavor: { bitter: 2, malt: 2, roast: 0, body: 1, tart: 0, fruit: 2 }
    },
    {
      id: 'tumbleweed', name: 'Tumbleweed', style: 'Witbier', group: 'crisp', abv: 5.0, ibu: 15,
      tap: null, cans: false, tapped: null, motif: 'tumble', colors: ['#f3d692', '#a63f1c', '#241a13'],
      tagline: 'Hazy Belgian-style wheat with orange peel and coriander.',
      notes: 'Raw wheat and oats, fresh orange zest and crushed coriander seed. Back on tap every spring when the beer garden opens, until Rimfire takes over its tap in the fall.',
      hops: 'Hallertau Blanc', pairing: 'Mussels, salads',
      flavor: { bitter: 1, malt: 2, roast: 0, body: 2, tart: 1, fruit: 3 }
    },
    {
      id: 'fire-lookout', name: 'Fire Lookout', style: 'Smoked Lager', group: 'crisp', abv: 5.6, ibu: 24,
      tap: 8, cans: false, tapped: 3, motif: 'tower', colors: ['#a63f1c', '#e0a133', '#fbf5e8'],
      tagline: 'Amber lager with a campfire whisper of beechwood smoke.',
      notes: 'A fifth of the grist is beechwood-smoked malt. Toasty, a little sweet, and smoky like a sweater the morning after a campfire.',
      hops: 'Hallertau, Perle', pairing: 'Smoked ribs, grilled mushrooms',
      flavor: { bitter: 2, malt: 3, roast: 2, body: 3, tart: 0, fruit: 0 }
    },
    {
      id: 'rimrock-red', name: 'Rimrock Red', style: 'Red Ale', group: 'dark', abv: 5.9, ibu: 32,
      tap: 9, cans: false, tapped: 7, motif: 'ridges', colors: ['#b4451f', '#f3d692', '#fbf5e8'],
      tagline: 'Toffee, toasted bread and a clean hop bite.',
      notes: 'Caramel and a little roasted barley for the ruby color, balanced with Northwest hops. Toffee, toast and a finish that stays dry.',
      hops: 'Willamette, Cascade', pairing: 'Burgers, sharp cheddar',
      flavor: { bitter: 2, malt: 4, roast: 2, body: 3, tart: 0, fruit: 1 }
    },
    {
      id: 'pumice-porter', name: 'Pumice Porter', style: 'Robust Porter', group: 'dark', abv: 6.1, ibu: 38,
      tap: 10, cans: true, tapped: 8, motif: 'stones', colors: ['#3a2b20', '#e0a133', '#fbf5e8'],
      tagline: 'Dark chocolate, cold brew and a light, porous body.',
      notes: 'Brown malt, chocolate malt and a little oats. Bitter chocolate, cold-brew coffee and a surprisingly light finish, like the stone it is named after.',
      hops: 'East Kent Goldings, Fuggle', pairing: 'Chili, brownies',
      flavor: { bitter: 2, malt: 4, roast: 4, body: 3, tart: 0, fruit: 1 }
    },
    {
      id: 'lava-tube', name: 'Lava Tube', style: 'Barrel-aged Imperial Stout', group: 'dark', abv: 11.2, ibu: 62,
      tap: 11, cans: false, tapped: 10, motif: 'cave', colors: ['#16302a', '#d9623a', '#f3d692'],
      tagline: 'Fourteen months in bourbon barrels. Sip it slow.',
      notes: 'An imperial stout rested fourteen months in Kentucky bourbon barrels. Fudge, vanilla, dried cherry and toasted oak. Poured in 10 oz snifters; 500 ml bottles in the shop.',
      hops: 'Magnum', pairing: 'Dark chocolate, blue cheese',
      flavor: { bitter: 3, malt: 5, roast: 4, body: 5, tart: 0, fruit: 2 }
    },
    {
      id: 'sagebrush-saison', name: 'Sagebrush Saison', style: 'Saison', group: 'wild', abv: 6.4, ibu: 26,
      tap: 12, cans: false, tapped: 11, motif: 'sprig', colors: ['#b7c7a3', '#24493f', '#241a13'],
      tagline: 'Dry, peppery farmhouse ale with a pinch of wild sage.',
      notes: 'A French farmhouse yeast and a handful of high-desert sage at the end of the boil. Lemon, white pepper and herbs, with a dry, prickly finish.',
      hops: 'Saaz, Sorachi Ace', pairing: 'Goat cheese, roast pork',
      flavor: { bitter: 2, malt: 1, roast: 0, body: 2, tart: 2, fruit: 2 }
    },
    {
      id: 'prickly-daybreak', name: 'Prickly Daybreak', style: 'Prickly Pear Gose', group: 'wild', abv: 4.6, ibu: 8,
      tap: null, cans: true, tapped: null, motif: 'cactus', colors: ['#e8a3a0', '#24493f', '#241a13'],
      tagline: 'Salty, tart and pink as a desert sunrise.',
      notes: 'A kettle-soured gose with prickly pear, sea salt and coriander. Bright watermelon-and-berry fruit and a refreshing salty finish. In cans while they last.',
      hops: 'None to speak of', pairing: 'Ceviche, tortilla chips',
      flavor: { bitter: 0, malt: 1, roast: 0, body: 1, tart: 4, fruit: 4 }
    },
    {
      id: 'marionberry-mirage', name: 'Marionberry Mirage', style: 'Fruited Sour', group: 'wild', abv: 5.8, ibu: 10,
      tap: null, cans: true, tapped: null, motif: 'berry', colors: ['#5b2a4a', '#f3d692', '#fbf5e8'],
      tagline: 'Jammy Oregon marionberries on a tart wheat base.',
      notes: 'Two pounds of Willamette Valley marionberries in every gallon. Deep purple, jammy and tart, with a dry finish that stops it tipping into sweet.',
      hops: 'None to speak of', pairing: 'Cheesecake, duck',
      flavor: { bitter: 0, malt: 1, roast: 0, body: 2, tart: 5, fruit: 5 }
    }
  ];

  // The color of each beer in the glass (flight paddle and tap board).
  const LIQUID = {
    'cinder-trail': '#e4a43a', 'dust-devil': '#f2c25a', 'little-hare': '#f4d37a', rimfire: '#d98a2b',
    'pine-drop': '#e9b23f', 'high-desert-pils': '#f6d86b', snowmelt: '#f7e08a', tumbleweed: '#f3dc9c',
    'fire-lookout': '#b8611f', 'rimrock-red': '#8f2f16', 'pumice-porter': '#3a2116', 'lava-tube': '#1f130d',
    'sagebrush-saison': '#eebf55', 'prickly-daybreak': '#e47c8c', 'marionberry-mirage': '#6e1f4a'
  };

  // The seasonal tap: these beers take turns on one tap. Each goes on at the start of its release event in
  // EVENTS and pours until the next one's release, so the board always agrees with the events calendar.
  const SEASONAL_TAP = { tap: 4, beers: { rimfire: 'rimfire-release', tumbleweed: 'tumbleweed-release' } };

  // Prices at the bar (per pour). Strong beers (over 8%) are served in the smaller glass only.
  const POURS = {
    pint: { label: '16 oz', price: 7 },
    half: { label: '10 oz', price: 5.5 },
    taster: { label: '4 oz taster', price: 2.5 },
    flight: { label: 'Flight of four', price: 10 }
  };
  const STRONG_ABV = 8;

  // Food trucks parked in the beer garden. The rotation is a rule, not a list of dates:
  // TRUCK_ROTA[weekday] lists the trucks that take turns on that weekday, one per week (by the ISO week number).
  const TRUCKS = {
    arepas: { name: "Lupe's Arepas", food: 'Venezuelan arepas, plantains and fresh juices', veg: true },
    pierogi: { name: 'Pinecone Pierogi', food: 'Hand-pinched pierogi, kielbasa and dill pickles', veg: true },
    burgers: { name: 'Bunchgrass Burgers', food: 'Smash burgers, crinkle fries and shakes', veg: true },
    smokehouse: { name: 'Sagebrush Smokehouse', food: 'Juniper-smoked brisket, ribs and slaw', veg: false },
    pizza: { name: 'Firebrick Pizza', food: 'Wood-fired pizza from a 1974 trailer', veg: true }
  };
  const TRUCK_ROTA = [
    ['pizza', 'arepas'], // Sunday
    ['arepas'], // Monday
    ['pierogi'], // Tuesday (trivia night)
    ['burgers'], // Wednesday
    ['arepas', 'pierogi'], // Thursday
    ['smokehouse', 'pizza'], // Friday
    ['pizza', 'smokehouse'] // Saturday
  ];

  // The taproom's own counter (always on, whichever truck is outside).
  const SNACKS = [
    { name: 'Bavarian pretzel', desc: 'Baked daily, with Pils beer cheese and stone-ground mustard', price: 10 },
    { name: 'Pickle plate', desc: 'Dilly beans, carrots and bread-and-butter chips we jar ourselves', price: 8 },
    { name: 'Smoked almonds', desc: 'Tossed in Lava Tube salt', price: 5 },
    { name: 'Kids’ grilled cheese', desc: 'With apple slices', price: 7 },
    { name: 'House root beer', desc: 'Brewed here with sassafras and vanilla; free refills', price: 4 },
    { name: 'Hop water', desc: 'Sparkling, zero alcohol, dry-hopped with Citra', price: 4 }
  ];

  // Events, written for the weeks after DEMO_ANCHOR (see KEEP_DEMO_CURRENT). type: a key of EVENT_TYPES.
  // beer: links a release to a beer. price: null = free; seats: capacity for ticketed events.
  // yearly: true marks a seasonal event that comes back at the same time every year (on the same weekday,
  // in the week ending on the date's anniversary); the others are the regular program.
  const EVENT_TYPES = {
    music: 'Live music',
    trivia: 'Trivia',
    release: 'Release',
    food: 'Beer dinner',
    community: 'Community'
  };
  const EVENTS = [
    { id: 'rabbitbrush-oct', date: '2026-10-23', start: '18:30', end: '21:00', type: 'music', title: 'The Rabbitbrush Ramblers', blurb: 'Four-piece bluegrass in the barrel room. No cover.', price: null },
    { id: 'rimfire-release', yearly: true, date: '2026-10-24', start: '12:00', end: '20:00', type: 'release', beer: 'rimfire', title: 'Rimfire release day', blurb: 'This year’s double IPA goes on tap at noon. First 50 pints come with a screen-printed Rimfire glass.', price: null },
    { id: 'trivia-oct-27', date: '2026-10-27', start: '19:00', end: '21:00', type: 'trivia', title: 'Tuesday trivia: Volcanoes & lava', blurb: 'Teams of up to six. Winners take home a $50 gift card. Pinecone Pierogi outside.', price: null },
    { id: 'costume-night', yearly: true, date: '2026-10-30', start: '17:00', end: '22:00', type: 'community', title: 'Costume night in the barrel room', blurb: 'Dress up, vote for the best costume and get your second pint for $3.', price: null },
    { id: 'cutbank-nov', date: '2026-11-06', start: '19:00', end: '21:30', type: 'music', title: 'Cutbank Choir', blurb: 'Dusty, harmony-heavy Americana from Redmond. No cover.', price: null },
    { id: 'lava-tube-release', yearly: true, date: '2026-11-07', start: '11:00', end: '18:00', type: 'release', beer: 'lava-tube', title: 'Lava Tube bottle release', blurb: 'Fourteen months in bourbon barrels. Bottles at the counter from 11am, limit two per person, plus a vertical flight of the last three vintages.', price: null },
    { id: 'trivia-nov-10', date: '2026-11-10', start: '19:00', end: '21:00', type: 'trivia', title: 'Tuesday trivia: Pacific Northwest', blurb: 'Rivers, rain and road trips. Teams of up to six.', price: null },
    { id: 'smoke-stout-dinner', date: '2026-11-12', start: '18:30', end: '21:00', type: 'food', title: 'Smoke & stout beer dinner', blurb: 'Five courses from Sagebrush Smokehouse, each paired with a pour chosen by Dacey. Tickets include gratuity.', price: 68, seats: 36 },
    { id: 'trail-day', yearly: true, date: '2026-11-14', start: '09:00', end: '13:00', type: 'community', title: 'Volunteer trail day', blurb: 'Help clear and re-mark a stretch of singletrack west of town, then a pint and lunch on us back at the taproom.', price: null },
    { id: 'swallowtail-nov', date: '2026-11-20', start: '19:00', end: '21:30', type: 'music', title: 'The Swallowtail Soul Revue', blurb: 'Soul and slow-burning R&B in the barrel room. No cover.', price: null },
    { id: 'trivia-nov-24', date: '2026-11-24', start: '19:00', end: '21:00', type: 'trivia', title: 'Tuesday trivia: Movie night', blurb: 'Quotes, scores and stills. Teams of up to six.', price: null },
    { id: 'nitro-porter', yearly: true, date: '2026-11-28', start: '12:00', end: '20:00', type: 'release', beer: 'pumice-porter', title: 'Pumice Porter on nitro', blurb: 'Our porter goes on the nitro tap for the winter. $1 off 4-packs all day.', price: null },
    { id: 'makers-market', yearly: true, date: '2026-12-05', start: '11:00', end: '17:00', type: 'community', title: 'Winter makers market', blurb: 'Twenty local makers in the barrel room: ceramics, prints, wool and hot sauce. Mulled cider for the kids.', price: null },
    { id: 'trivia-dec-08', date: '2026-12-08', start: '19:00', end: '21:00', type: 'trivia', title: 'Tuesday trivia: Music rounds', blurb: 'Name that tune, finish the lyric. Teams of up to six.', price: null },
    { id: 'sagehen-dec', date: '2026-12-11', start: '19:00', end: '21:30', type: 'music', title: 'The Sagehen String Band', blurb: 'Fiddles, banjo and stomping old-time tunes. No cover.', price: null },
    { id: 'marionberry-release', yearly: true, date: '2026-12-19', start: '12:00', end: '20:00', type: 'release', beer: 'marionberry-mirage', title: 'Marionberry Mirage release', blurb: 'Fresh cans of our jammy berry sour, and a sour flight with last year’s barrel blend.', price: null },
    { id: 'trivia-dec-22', date: '2026-12-22', start: '19:00', end: '21:00', type: 'trivia', title: 'Tuesday trivia: The great outdoors', blurb: 'Peaks, parks and wildlife. Teams of up to six.', price: null },
    { id: 'blending-dinner', date: '2027-01-14', start: '18:30', end: '21:00', type: 'food', title: 'Barrel blending night', blurb: 'Blend your own sour from three barrels with Ruthanne, with snacks from Firebrick Pizza. Take home a 750 ml bottle of your blend.', price: 55, seats: 20 },
    { id: 'snowshoe-stout', yearly: true, date: '2027-01-30', start: '09:30', end: '14:00', type: 'community', title: 'Snowshoe & stout morning', blurb: 'A guided snowshoe loop up at the sno-park with Paloma, then chili and a pint of Pumice Porter back at the taproom. Bring your own snowshoes or borrow a pair from us.', price: 25, seats: 24 },
    { id: 'chocolate-stout', yearly: true, date: '2027-02-12', start: '18:30', end: '20:30', type: 'food', title: 'Chocolate & stout pairing', blurb: 'Five chocolates from a Bend chocolatier, each matched with a dark beer from the cellar. Bring a date, or don’t.', price: 32, seats: 30 },
    { id: 'sour-cheese', yearly: true, date: '2027-02-25', start: '18:30', end: '20:30', type: 'food', title: 'Sour flight & cheese night', blurb: 'Ruthanne pours four sours from the barrel room, each with a cheese from a Willamette Valley creamery. Tickets include gratuity.', price: 30, seats: 24 },
    { id: 'tumbleweed-release', yearly: true, date: '2027-03-13', start: '11:00', end: '20:00', type: 'release', beer: 'tumbleweed', title: 'Tumbleweed is back', blurb: 'The beer garden opens for the season and our orange-peel witbier goes on tap at 11am. Bring a picnic blanket.', price: null },
    { id: 'river-pints', yearly: true, date: '2027-03-25', start: '15:00', end: '21:00', type: 'community', title: 'Pints for the river', blurb: 'A dollar from every pint poured tonight goes to a local river conservancy. Their volunteers will be at the long table with maps and sign-up sheets.', price: null },
    { id: 'river-cleanup', yearly: true, date: '2027-04-17', start: '09:00', end: '13:00', type: 'community', title: 'Spring river cleanup', blurb: 'Gloves, grabbers and bags on us. Pick up litter along the Deschutes, then lunch from the truck back at the taproom.', price: null },
    { id: 'seed-swap', yearly: true, date: '2027-05-01', start: '10:00', end: '14:00', type: 'community', title: 'Spring seed & plant swap', blurb: 'Bring seeds, starts and cuttings to trade at the picnic tables. Our brewers bring spent-grain compost for anyone who wants it.', price: null },
    { id: 'bike-swap', yearly: true, date: '2027-05-15', start: '10:00', end: '15:00', type: 'community', title: 'Mountain bike swap', blurb: 'Buy, sell and trade bikes, wheels and gear in the beer garden. Free to sell; bring a price tag.', price: null },
    { id: 'prickly-release', yearly: true, date: '2027-06-05', start: '12:00', end: '20:00', type: 'release', beer: 'prickly-daybreak', title: 'Prickly Daybreak can release', blurb: 'This summer’s batch of our pink prickly pear gose, in cans at the counter from noon. Limit two 4-packs per person.', price: null },
    { id: 'solstice-night', yearly: true, date: '2027-06-19', start: '18:00', end: '22:00', type: 'music', title: 'Solstice night in the garden', blurb: 'The longest evening of the year, with two string bands on the garden stage until the sun goes down behind the Cascades. No cover.', price: null },
    { id: 'block-party', yearly: true, date: '2027-07-17', start: '14:00', end: '21:00', type: 'music', title: 'Beer garden block party', blurb: 'Three bands, two trucks and lawn games from mid-afternoon. No cover, and kids are welcome until 8pm.', price: null },
    { id: 'smokehouse-dinner', yearly: true, date: '2027-08-12', start: '18:30', end: '21:00', type: 'food', title: 'Summer smokehouse supper', blurb: 'Long tables in the beer garden and four courses off the Sagebrush Smokehouse grill, each with a pour from the cellar. Tickets include gratuity.', price: 62, seats: 40 },
    { id: 'cornhole', yearly: true, date: '2027-08-28', start: '13:00', end: '18:00', type: 'community', title: 'Cornhole tournament', blurb: 'Teams of two, double elimination, on the lawn. Sign up at the bar by 12:30; the winning pair takes home a $100 gift card.', price: null },
    { id: 'harvest-fest', yearly: true, date: '2027-09-25', start: '12:00', end: '20:00', type: 'music', title: 'Harvest fest in the garden', blurb: 'A brass band all afternoon, giant pretzels from the counter and lawn games for all ages. No cover.', price: null }
  ];

  // Shop: cans and merch to go, for pickup at the taproom. kind 'beer' needs the 21+ confirmation.
  // beer: the beer whose can art is drawn. art: merch drawing (see MERCH_ART in main.js).
  // options: a choice the customer makes (shown as a select). limit: most per order.
  const PRODUCTS = [
    { id: 'cinder-trail-4', kind: 'beer', beer: 'cinder-trail', name: 'Cinder Trail', pack: '4-pack · 16 oz cans', units: 4, price: 16, limit: 6 },
    { id: 'dust-devil-4', kind: 'beer', beer: 'dust-devil', name: 'Dust Devil', pack: '4-pack · 16 oz cans', units: 4, price: 17, limit: 6 },
    { id: 'little-hare-4', kind: 'beer', beer: 'little-hare', name: 'Little Hare', pack: '4-pack · 16 oz cans', units: 4, price: 14, limit: 6 },
    { id: 'high-desert-pils-6', kind: 'beer', beer: 'high-desert-pils', name: 'High Desert Pils', pack: '6-pack · 12 oz cans', units: 6, price: 13, limit: 6 },
    { id: 'pumice-porter-4', kind: 'beer', beer: 'pumice-porter', name: 'Pumice Porter', pack: '4-pack · 16 oz cans', units: 4, price: 15, limit: 6 },
    { id: 'prickly-daybreak-4', kind: 'beer', beer: 'prickly-daybreak', name: 'Prickly Daybreak', pack: '4-pack · 16 oz cans', units: 4, price: 16, limit: 6 },
    { id: 'marionberry-mirage-4', kind: 'beer', beer: 'marionberry-mirage', name: 'Marionberry Mirage', pack: '4-pack · 16 oz cans', units: 4, price: 18, limit: 4 },
    { id: 'lava-tube-bottle', kind: 'beer', beer: 'lava-tube', name: 'Lava Tube', pack: '500 ml bottle', units: 1, price: 22, limit: 2 },
    { id: 'crowler', kind: 'beer', art: 'crowler', name: 'Crowler fill', pack: '32 oz can, filled to order', units: 1, price: 13, limit: 4, option: { label: 'Beer', from: 'tap' } },
    { id: 'tee', kind: 'merch', art: 'tee', name: 'Cinder cone tee', pack: 'Ring-spun cotton, screen-printed in Bend', price: 28, limit: 4, option: { label: 'Size', values: ['S', 'M', 'L', 'XL', 'XXL'] } },
    { id: 'cap', kind: 'merch', art: 'cap', name: 'Jackrabbit trucker cap', pack: 'Embroidered patch, snapback', price: 30, limit: 4 },
    { id: 'glass', kind: 'merch', art: 'glass', name: 'Taproom pint glass', pack: '16 oz shaker, two-color print', price: 10, limit: 8 },
    { id: 'growler', kind: 'merch', art: 'growler', name: 'Stainless growler', pack: '64 oz, insulated, empty', price: 42, limit: 2 },
    { id: 'pin', kind: 'merch', art: 'pin', name: 'Fire lookout enamel pin', pack: 'Hard enamel, 1.25 in', price: 9, limit: 6 },
    { id: 'stickers', kind: 'merch', art: 'stickers', name: 'Label sticker pack', pack: 'Six vinyl stickers', price: 6, limit: 6 }
  ];
  // Oregon's container deposit, per can or bottle (added at checkout, refunded at any return point).
  const DEPOSIT = 0.1;
  // Pickup slots: every SLOT_MINUTES from opening until 30 minutes before close, over PICKUP_DAYS days.
  // A same-day slot needs PICKUP_LEAD_MINUTES' notice. SLOTS_FULL: the demo's share (0–100) of full slots.
  const PICKUP = { days: 7, slotMinutes: 30, leadMinutes: 45, slotsFull: 22 };

  // Tours of the brewhouse. schedule: start times per weekday. capacity: guests per tour.
  // minors: under-21 guests may join (they skip the tasting and pay nothing).
  const TOURS = {
    brewhouse: {
      name: 'Brewhouse tour', minutes: 45, price: 18, capacity: 14, minors: true,
      blurb: 'From the grain room to the bright tanks, with four 4 oz tasters along the way.',
      schedule: { 5: ['16:00'], 6: ['12:00', '14:00'], 0: ['12:00', '14:00'] }
    },
    barrel: {
      name: 'Barrel room & blending', minutes: 75, price: 38, capacity: 8, minors: false,
      blurb: 'Sample straight from the barrels with Ruthanne and learn how a blend comes together. 21+ only.',
      schedule: { 6: ['16:00'], 0: ['15:30'] }
    }
  };
  const TOUR_BOOK_AHEAD_DAYS = 28;
  const TOUR_MAX_GROUP = 8;

  // Private events spaces (contact.html). minSpend: [Sunday–Thursday, Friday–Saturday] food and drink minimum.
  const SPACES = {
    loft: { name: 'The Lookout Loft', guests: 24, minSpend: [450, 750], note: 'Mezzanine over the brewhouse, with its own bar rail.' },
    barrel: { name: 'Barrel room', guests: 60, minSpend: [900, 1500], note: 'Long tables between the foeders. Seats 40, stands 60.' },
    garden: { name: 'The whole beer garden', guests: 150, minSpend: [2400, 3800], note: 'Fire pits, the stage and a food truck of your choice.' }
  };
  const HIRE_EVENT_TYPES = ['Birthday or celebration', 'Team event or offsite', 'Rehearsal dinner', 'Wedding reception', 'Fundraiser', 'Something else'];
  const HIRE_MIN_DAYS_AHEAD = 14;

  return {
    BREW, KEEP_DEMO_CURRENT, DEMO_ANCHOR, HOURS, LAST_CALL_MINUTES, HOLIDAY_HOURS, EXTRA_HOURS,
    STYLE_GROUPS, STRENGTHS, FLAVOR_AXES, BEERS, SEASONAL_TAP, LIQUID, POURS, STRONG_ABV, TRUCKS, TRUCK_ROTA, SNACKS,
    EVENT_TYPES, EVENTS, PRODUCTS, DEPOSIT, PICKUP, TOURS, TOUR_BOOK_AHEAD_DAYS, TOUR_MAX_GROUP,
    SPACES, HIRE_EVENT_TYPES, HIRE_MIN_DAYS_AHEAD
  };
})();
