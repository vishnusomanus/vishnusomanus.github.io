/* Soiree — content and settings used by assets/js/main.js.
   Edit prices, celebrations and venues here; the pages render them for you.
   All prices are US dollars. Estimates are illustrations, not quotes. */
window.SOIREE = {
  timeZone: 'America/New_York', // Charleston, South Carolina

  /* ---------- Budget estimator ---------- */
  // Planning fee = base + perGuest x (guests above 50), times the season's feeFactor, plus add-ons.
  packages: {
    full: { name: 'Full planning', base: 14500, perGuest: 40, blurb: 'From the first call to the last sparkler: venue search, design, every vendor and the whole weekend.' },
    partial: { name: 'Partial planning', base: 7800, perGuest: 22, blurb: 'You have the venue and a few vendors; we fill the gaps, design the day and run it.' },
    dayof: { name: 'Day-of coordination', base: 3200, perGuest: 8, blurb: 'We step in eight weeks out, confirm every detail and run the day so you can be a guest.' }
  },
  // Vendor spend per guest (venue, food, flowers, music...) before the season factor.
  eventTypes: {
    wedding: { name: 'Wedding', perGuest: 285 },
    corporate: { name: 'Corporate event', perGuest: 210 },
    private: { name: 'Private celebration', perGuest: 175 }
  },
  seasons: {
    peak: { name: 'Spring or fall', months: 'March to May, September to November', feeFactor: 1.1, spendFactor: 1.12 },
    summer: { name: 'Summer', months: 'June to August', feeFactor: 1, spendFactor: 1 },
    winter: { name: 'Winter', months: 'December to February', feeFactor: 0.9, spendFactor: 0.9 }
  },
  addons: {
    welcome: { name: 'Welcome party', price: 1200 },
    rehearsal: { name: 'Rehearsal dinner', price: 900 },
    brunch: { name: 'Farewell brunch', price: 700 },
    transport: { name: 'Guest transportation', price: 500 },
    design: { name: 'Full design and styling', price: 2400 }
  },
  // How the vendor spend usually splits. Shares add up to 1.
  breakdown: [
    { name: 'Venue and rentals', share: 0.28 },
    { name: 'Catering and bar', share: 0.36 },
    { name: 'Florals and decor', share: 0.12 },
    { name: 'Photo and film', share: 0.1 },
    { name: 'Music and entertainment', share: 0.07 },
    { name: 'Attire, paper and extras', share: 0.07 }
  ],
  guestLimits: { min: 20, max: 400, step: 10, initial: 120 },
  // Low and high ends of each range, as factors of the midpoint.
  spread: { fee: [0.95, 1.1], spend: [0.85, 1.2] },

  /* ---------- Venue guide ---------- */
  areas: {
    downtown: 'Downtown Charleston',
    'mount-pleasant': 'Mount Pleasant',
    islands: 'Beach islands',
    rural: 'Johns & Wadmalaw',
    north: 'North Charleston'
  },
  settings: { indoor: 'Indoor', outdoor: 'Outdoor', both: 'Indoor and outdoor' },
  venues: [
    { id: 'lamplighter-loft', name: 'The Lamplighter Loft', area: 'downtown', setting: 'indoor', min: 30, max: 160, priceFrom: 6500, art: 'loft',
      note: 'A third-floor former cotton broker’s office with heart pine floors, twelve-foot windows and a freight elevator for the band.' },
    { id: 'bellweather-house', name: 'Bellweather House & Garden', area: 'downtown', setting: 'both', min: 40, max: 150, priceFrom: 9000, art: 'garden',
      note: 'An 1840s single house with a double piazza and a walled garden. Tent rights for a rain plan; amplified music ends at 10pm.' },
    { id: 'courtyard-no-9', name: 'The Courtyard at No. 9', area: 'downtown', setting: 'outdoor', min: 20, max: 80, priceFrom: 4200, art: 'courtyard',
      note: 'A brick courtyard behind an iron gate, made for intimate dinners under café lights. Rain plan in the carriage house next door.' },
    { id: 'shem-creek-boathouse', name: 'Shem Creek Boathouse', area: 'mount-pleasant', setting: 'both', min: 50, max: 200, priceFrom: 7800, art: 'boathouse',
      note: 'A working dock turned event space: sunset over the creek, shrimp boats coming home and a glassed-in hall for the dancing.' },
    { id: 'cooper-river-pavilion', name: 'Cooper River Pavilion', area: 'mount-pleasant', setting: 'outdoor', min: 60, max: 250, priceFrom: 6900, art: 'champagne',
      note: 'An open-sided pavilion on the water with the bridge lit up behind you. Bring your own caterer; sidewalls for cooler nights.' },
    { id: 'kiawah-dunes-club', name: 'Kiawah Dunes Club', area: 'islands', setting: 'both', min: 80, max: 300, priceFrom: 14000, art: 'dunes',
      note: 'An oceanfront lawn, a ballroom with a wall of glass and rooms for every guest. In-house catering only.' },
    { id: 'seabrook-marsh-house', name: 'Seabrook Marsh House', area: 'islands', setting: 'outdoor', min: 20, max: 90, priceFrom: 5200, art: 'marsh',
      note: 'A cedar-shingled cottage on a tidal creek with a long dock for the ceremony. Small, quiet and lovely at low tide.' },
    { id: 'folly-pier-terrace', name: 'Folly Pier Terrace', area: 'islands', setting: 'outdoor', min: 30, max: 120, priceFrom: 4800, art: 'dunes',
      note: 'Barefoot ceremonies on the sand and a terrace reception above the surf. Beach permits from the city are part of our job.' },
    { id: 'wadmalaw-oak-farm', name: 'Wadmalaw Oak Farm', area: 'rural', setting: 'both', min: 100, max: 350, priceFrom: 11500, art: 'oaks',
      note: 'Forty acres, an avenue of live oaks and a restored tobacco barn. Room for a full weekend, from oyster roast to brunch.' },
    { id: 'the-saltworks', name: 'The Saltworks', area: 'north', setting: 'indoor', min: 100, max: 400, priceFrom: 8500, art: 'loft',
      note: 'A brick warehouse in Park Circle with steel trusses, a loading-dock bar and space for a stage, a lounge and dinner for four hundred.' }
  ],

  /* ---------- Portfolio ---------- */
  eventTypeLabels: { wedding: 'Wedding', corporate: 'Corporate', private: 'Private' },
  celebrations: [
    { id: 'hannah-and-wes', title: 'Hannah & Wes', type: 'wedding', date: 'April 2026', venue: 'Bellweather House & Garden', guests: 140, pkg: 'Full planning', art: 'garden',
      headline: 'A garden wedding that outran a nor’easter',
      summary: 'Peonies, a twelve-piece brass band and a forecast that turned on the Thursday before.',
      story: 'Hannah wanted the walled garden and nothing else. When the forecast turned on Thursday, we had the sailcloth tent up by Friday noon, re-plotted the seating for the piazza and moved the ceremony forty minutes earlier to catch the last dry window. The brass band led everyone from the garden to dinner under the tent at 6:10pm; the rain started at 6:25pm.',
      details: ['Tent and rain plan triggered 30 hours out', 'Twelve-piece second-line band', 'Peonies flown in from Alaska in April', 'Late-night shrimp and grits on the piazza'],
      quote: 'Josephine called us on Thursday with a plan B that turned out better than plan A.', by: 'Hannah, the bride' },
    { id: 'anjali-and-daniel', title: 'Anjali & Daniel', type: 'wedding', date: 'October 2025', venue: 'Kiawah Dunes Club', guests: 260, pkg: 'Full planning', art: 'dunes',
      headline: 'Three days, two ceremonies, one ocean',
      summary: 'A mehndi night, a sangeet on the lawn and a sunrise ceremony on the beach.',
      story: 'Two families, two traditions and guests flying in from Pune, Toronto and Ohio. We built a three-day schedule with shuttles timed to the tides, worked with a priest and a pastor on a ceremony order that honored both, and turned the ballroom from sangeet stage to reception in ninety minutes.',
      details: ['Three events across three days', '260 guests, 180 of them traveling', 'Custom shuttle schedule printed in two languages', 'Ballroom turned over in 90 minutes'],
      quote: 'Our parents still talk about how calm everything felt.', by: 'Anjali, the bride' },
    { id: 'corliss-summit', title: 'Corliss Analytics', type: 'corporate', date: 'February 2026', venue: 'The Saltworks', guests: 220, pkg: 'Partial planning', art: 'loft',
      headline: 'A leadership summit that felt like a dinner party',
      summary: 'Two days of talks, then a long-table supper for 220 in a Park Circle warehouse.',
      story: 'Corliss’s team had booked the venue and the speakers. We designed everything around them: breakout rooms built from rented drapery, a coffee bar that doubled as the evening’s cocktail bar, and a seating plan that put every new hire next to a vice president.',
      details: ['Two-day agenda with five breakout rooms', 'Long-table supper for 220', 'Badge pickup to first session in 22 minutes', 'Zero single-use plastic'],
      quote: 'Our people left talking about each other, not the logistics.', by: 'Head of People, Corliss Analytics' },
    { id: 'elena-at-sixty', title: 'Elena at Sixty', type: 'private', date: 'June 2026', venue: 'The Courtyard at No. 9', guests: 60, pkg: 'Full planning', art: 'courtyard',
      headline: 'A surprise birthday behind an iron gate',
      summary: 'Sixty guests, sixty candles and a guest of honor who had no idea.',
      story: 'Elena’s children wanted a surprise, which meant the invitations, the RSVPs and even the florist’s van all had to stay out of sight. We ran the guest list through a private page, parked the band two streets away and timed the gate to open as the cellist began.',
      details: ['Invitations and RSVPs kept fully private', 'Cellist and a jazz trio', 'Menu of dishes from Elena’s childhood in Oaxaca', 'One surprised guest of honor'],
      quote: 'She cried, then she danced until midnight. Perfect.', by: 'Marco, Elena’s son' },
    { id: 'wynn-and-june', title: 'Wynn & June', type: 'wedding', date: 'May 2026', venue: 'Shem Creek Boathouse', guests: 110, pkg: 'Partial planning', art: 'boathouse',
      headline: 'Sunset vows on a working dock',
      summary: 'A creekside ceremony timed to the minute the sun touched the marsh.',
      story: 'They had the venue and their dream photographer; they needed someone to make it all fit. We timed the ceremony to the sunset tables, arranged a shrimp boat to pass at the recessional (with the captain’s blessing) and kept the dance floor going under the boathouse beams.',
      details: ['Ceremony timed to sunset, 8:02pm', 'A shrimp boat “flyby” at the recessional', 'Raw bar and a Lowcountry boil', 'Sparkler send-off from the dock'],
      quote: 'We didn’t think about a single detail on the day. That was the whole point.', by: 'June' },
    { id: 'winter-oyster-roast', title: 'The Avery Family Oyster Roast', type: 'private', date: 'January 2026', venue: 'Wadmalaw Oak Farm', guests: 180, pkg: 'Partial planning', art: 'oaks',
      headline: 'An oyster roast under the oaks',
      summary: 'Fire pits, bushels of oysters and a bluegrass band for a family’s fortieth winter reunion.',
      story: 'The Averys have hosted an oyster roast every January for forty years. For the anniversary they wanted it bigger, warmer and easier on everyone. We brought in a fire-safe roasting rig, heaters, a kids’ tent with s’mores and a shuttle from the hotel, so no one had to drive the island roads after dark.',
      details: ['Forty bushels of oysters', 'Six fire pits and a heated tent', 'Kids’ tent with a sitter team', 'Hotel shuttles every 30 minutes'],
      quote: 'It felt like our party, only nobody had to work it.', by: 'Ruth Avery' },
    { id: 'marlin-and-pine-launch', title: 'Marlin & Pine', type: 'corporate', date: 'March 2026', venue: 'The Lamplighter Loft', guests: 90, pkg: 'Full planning', art: 'champagne',
      headline: 'A product launch dinner for ninety',
      summary: 'Press, partners and a reveal at dessert for an outdoor clothing brand.',
      story: 'Marlin & Pine wanted their spring line to feel like a weekend on the water. We built a dinner that told the story in courses, hid the new collection behind a linen curtain until dessert, and worked with their press team so every guest left with something worth posting.',
      details: ['Dinner in five courses, one per product story', 'Collection reveal at dessert', 'Press check-in and embargo handled', 'Gift bags made by Charleston makers'],
      quote: 'They made our launch feel like an invitation, not a pitch.', by: 'Brand Director, Marlin & Pine' },
    { id: 'grace-and-tom', title: 'Grace & Tom', type: 'wedding', date: 'November 2025', venue: 'Seabrook Marsh House', guests: 34, pkg: 'Day-of coordination', art: 'marsh',
      headline: 'Thirty-four guests at the end of a dock',
      summary: 'A small wedding planned by the couple and run, start to finish, by us.',
      story: 'Grace and Tom planned everything themselves and asked us to take over eight weeks out. We confirmed every vendor, wrote a timeline down to the oyster shucker’s arrival and handled the one surprise: a king tide that put the end of the dock under an inch of water. The ceremony moved twenty feet; nobody noticed.',
      details: ['Brought in eight weeks out', 'King-tide plan for the dock', 'Dinner for 34 at one long table', 'Timeline shared with every vendor'],
      quote: 'Worth every penny for the peace of mind alone.', by: 'Grace' }
  ]
};
