/* Bonfield Bikes (Sprocket template) — content and settings. Edit here; assets/js/main.js reads
 * window.SPROCKET. Keys used in URLs (?color=, ?battery=, ?acc=, ?a=, ?cat=, ?team=, ?topic=) must stay
 * lowercase words with hyphens.
 *
 *  COMPANY      name, contact details, time zone, reference prefixes
 *  BUILD        the Portage configurator: base price, deposit, colors, batteries, accessories
 *  BATCHES      production batches: when each ships and how many spots are left (worked out from today)
 *  ZONES        delivery zones by ZIP code prefix (reserve.html and support.html)
 *  RANGE        the range estimator on range.html
 *  COST         the car vs Portage cost calculator on specs.html
 *  DEMO         keeps journal dates current (see DOCS.md, "Demo dates")
 *  CATEGORIES, POSTS   journal.html and article.html?a=<slug>
 *  TEAMS, ROLES        open roles on about.html
 *  PEOPLE              the team on about.html (illustrated portraits are drawn from these values)
 */
window.SPROCKET = (function () {
  'use strict';

  const COMPANY = {
    name: 'Bonfield Bikes',
    product: 'Portage',
    phone: '(218) 555-0147',
    phoneHref: '+12185550147',
    email: 'hello@bonfield.example',
    address: '5124 Raleigh Street, Duluth, MN 55807',
    // Every date on the site (batches, journal, "today") is worked out in this time zone.
    timeZone: 'America/Chicago',
    // Reservation references look like BB-06-K7QD; support requests like BS-4821.
    reservePrefix: 'BB',
    supportPrefix: 'BS'
  };

  /* ---------------------------------------------------------------- Configurator
   * Prices are whole US dollars. The key of each color, battery and accessory is what goes in the URL:
   *   bike.html?color=harbor&battery=dual&acc=rack,kidseat,studs
   * requires: accessories that mount on another one; choosing it adds the other, removing the other
   * removes it.
   */
  const BUILD = {
    basePrice: 3895,
    deposit: 150,
    defaults: { color: 'taconite', battery: 'standard', acc: [] },
    colors: {
      taconite: { name: 'Taconite Red', hex: '#c63d1f', note: 'The red of iron ore pellets, loaded onto lake freighters a mile from our shop.' },
      harbor: { name: 'Harbor Teal', hex: '#0f6672', note: 'Lake water in the ship canal on a calm October morning.' },
      birch: { name: 'Birch White', hex: '#e7e2d3', note: 'Paper birch bark, and the easiest color to spot at dusk.' },
      iron: { name: 'Iron Black', hex: '#2a2f33', note: 'Satin black with a fine metallic flake. Hides road salt best.' },
      lupine: { name: 'Lupine Violet', hex: '#6a4c9c', note: 'The flowers that cover the North Shore every June.' }
    },
    batteries: {
      standard: { name: 'Standard battery', wh: 625, price: 0, detail: '625 Wh, inside the frame', range: '30–55 mi' },
      dual: { name: 'Dual battery', wh: 900, price: 520, detail: '625 Wh + a 275 Wh range extender on the seat tube', range: '45–80 mi' }
    },
    accessories: {
      rack: { name: 'Rear rack & running boards', price: 180, detail: 'A grab rail around the cargo deck and footboards for a passenger.' },
      kidseat: { name: 'Kid seat', price: 240, detail: 'High-back seat with a five-point harness, for kids about 2 to 6.', requires: ['rack'] },
      panniers: { name: 'Waterproof panniers (pair)', price: 160, detail: 'Two 32-liter roll-top bags that clip to the rack in seconds.', requires: ['rack'] },
      basket: { name: 'Front basket', price: 135, detail: 'Frame-mounted, so it holds 45 lb and doesn’t turn with the bars.' },
      studs: { name: 'Studded winter tires', price: 170, detail: 'A second set of 20 × 3.0" tires with 180 carbide studs each.' },
      pogies: { name: 'Handlebar pogies', price: 65, detail: 'Insulated mitts that stay on the bars. Warm hands at 0°F.' }
    }
  };

  /* ---------------------------------------------------------------- Batches
   * Batch 1 shipped in firstShip; one batch ships every `every` months. The open batch is the first one
   * shipping at least `lead` months after the current month, so each batch takes reservations for two
   * calendar months. Spots left fall in a straight line from `size` on the first day of that window to
   * about `minLeft` on the last day, so the demo always shows a believable, stable number.
   */
  const BATCHES = { firstShip: '2026-03', every: 2, lead: 3, size: 120, minLeft: 9 };

  /* ---------------------------------------------------------------- Delivery zones
   * Matched on the first three digits of a US ZIP code, in this order. fee: added to the build total.
   */
  const ZONES = [
    { id: 'local', name: 'Duluth–Superior hand delivery', fee: 0, prefixes: ['556-558', '548'],
      detail: 'We bring your Portage to your door, fit it to you and ride the first mile with you.' },
    { id: 'none', name: 'Not yet', fee: null, prefixes: ['000-009', '967-968', '995-999'],
      detail: 'We can’t deliver outside the contiguous US yet: Alaska, Hawaii and the territories are on our list.' },
    { id: 'region', name: 'Upper Midwest freight', fee: 149, prefixes: ['550-555', '559-567', '530-547', '549', '498-499', '500-528', '570-577', '580-588'],
      detail: 'Freight to your door, fully built and tuned, plus a video fitting call with our shop.' },
    { id: 'national', name: 'Crated freight', fee: 249, prefixes: ['010-994'],
      detail: 'Shipped 90% assembled in a reusable crate: bars, pedals and front wheel take about ten minutes.' }
  ];

  /* ---------------------------------------------------------------- Range estimator
   * miles = battery Wh × usable × temperature factor ÷ (assist Wh/mi × terrain × weight factor × studs)
   *   weight factor = 1 + (rider and cargo lb − weightRef) ÷ weightPerFactor
   *   temperature factor = 1 below `warm` °F loses `perDegree` per degree, never below `floor`
   */
  const RANGE = {
    usable: 0.9,
    weightRef: 200,
    weightPerFactor: 500,
    warm: 60,
    perDegree: 0.0065,
    floor: 0.55,
    studs: 1.08,
    band: 0.12,
    reserve: 1.25,
    defaults: { battery: 'standard', weight: 220, terrain: 'rolling', temp: 50, assist: 'tour', studs: false, trip: 12 },
    assist: {
      eco: { name: 'Eco', whPerMile: 9, note: 'a gentle push; you do most of the work' },
      tour: { name: 'Tour', whPerMile: 13, note: 'the setting most owners leave it on' },
      sport: { name: 'Sport', whPerMile: 18, note: 'hills feel flat, headwinds disappear' },
      turbo: { name: 'Turbo', whPerMile: 24, note: 'full power from the first pedal stroke' }
    },
    terrain: {
      flat: { name: 'Mostly flat', factor: 1, note: 'lakeside paths and river towns' },
      rolling: { name: 'Rolling', factor: 1.18, note: 'a few real climbs on most rides' },
      hills: { name: 'Steep hills', factor: 1.42, note: 'Duluth: 600 feet from the lake to the ridge' }
    },
    presets: {
      january: { name: 'January commute', weight: 230, terrain: 'hills', temp: 5, assist: 'sport', studs: true, trip: 14 },
      school: { name: 'School run with a kid', weight: 290, terrain: 'rolling', temp: 45, assist: 'tour', studs: false, trip: 6 },
      groceries: { name: 'Summer grocery run', weight: 260, terrain: 'flat', temp: 75, assist: 'eco', studs: false, trip: 8 }
    }
  };

  /* ---------------------------------------------------------------- Cost calculator (specs.html)
   * Car: miles × 52 × car cost per mile + parking × 12.
   * Portage: miles × 52 × whPerMile ÷ 1000 × kwhPrice + upkeep, plus the base price spread over `years`.
   */
  const COST = { whPerMile: 15, kwhPrice: 0.16, upkeep: 240, years: 6, defaults: { miles: 40, perMile: 0.7, parking: 0 } };

  /* ---------------------------------------------------------------- Demo dates
   * KEEP_DEMO_CURRENT moves every journal date forward by the whole weeks elapsed since DEMO_ANCHOR, so the
   * newest post always looks recent and weekdays stay right. On DEMO_ANCHOR itself nothing moves. Set it to
   * false on a real site.
   */
  const DEMO = { KEEP_DEMO_CURRENT: true, DEMO_ANCHOR: '2026-10-31' };

  /* ---------------------------------------------------------------- Journal */
  const CATEGORIES = {
    production: 'Production',
    engineering: 'Engineering',
    testing: 'Testing',
    company: 'Company'
  };

  // Newest first. date: YYYY-MM-DD as written (before DEMO moves it). art: cover drawing in main.js.
  // body: ['p', text] · ['h2', text] · ['ul', [items]] · ['quote', text, who]
  const POSTS = [
    {
      slug: 'winter-testing-mesaba',
      title: 'Forty days of winter testing on the Mesaba Avenue climb',
      cat: 'testing', date: '2026-10-27', author: 'eino', minutes: 6, art: 'hill',
      dek: 'Last winter four prototypes did the same 1.3-mile climb every morning. Here is what broke, what froze and what we changed for every Portage since.',
      body: [
        ['p', 'Mesaba Avenue rises about 400 feet in a little over a mile, and in January it is packed snow over ice for weeks at a time. If a cargo bike can climb it at 7 AM with a full load and come back down under control, it can handle almost any street in the country.'],
        ['p', 'From the first hard freeze until the thaw, four prototypes did the climb every morning, loaded to between 220 and 330 pounds. We logged battery temperature, motor current and brake rotor temperature on every run.'],
        ['h2', 'What froze'],
        ['ul', ['The original charge port cover: it iced shut twice. The new one has a silicone hinge and a drain channel.', 'Grease in the internal hub thickened below −10°F, so shifts got slow. We switched to a low-temperature grease rated to −40°F.', 'One rider’s phone, in a handlebar mount. That one is not our fault.']],
        ['h2', 'What held'],
        ['p', 'The frame, the belt and the brakes. The 203 mm rotors never faded on the descent, even with a kid seat and groceries on the back. The belt drive shrugged off slush that would have packed a chain solid.'],
        ['quote', 'By February I stopped thinking about the hill. That is the whole point.', 'Pilar, test rider on prototype three'],
        ['p', 'The biggest change came from the battery data: below about 20°F the cells gave noticeably less range. That led to the heated battery sleeve, which we wrote about in October.']
      ]
    },
    {
      slug: 'second-frame-jig',
      title: 'A second frame jig, and what it does to lead times',
      cat: 'production', date: '2026-10-16', author: 'elof', minutes: 4, art: 'jig',
      dek: 'We now weld two frames at once. That means bigger batches, and reservations shipping about three months after you place them.',
      body: [
        ['p', 'Every Portage frame is welded in Duluth, in a steel fixture we call the jig. It holds the tubes in exactly the right place while they are tacked, then welded, then left to cool without warping.'],
        ['p', 'Until this month we had one. A frame takes about 70 minutes in the jig, which capped us at roughly six frames a day. The second jig arrived on a flatbed from a machine shop in Hermantown and was trued and certified in a week.'],
        ['h2', 'What changes for you'],
        ['ul', ['Each batch is now 120 bikes, up from 80.', 'A new batch ships every two months.', 'Reservations ship about three months after you place them, give or take two weeks.']],
        ['p', 'We would rather tell you an honest ship month and beat it than promise a date we can’t keep. Your reservation shows the estimated month from the day you place it, and we update every owner by email if it moves.']
      ]
    },
    {
      slug: 'heated-battery-sleeve',
      title: 'Why the battery lives in a heated sleeve below 20°F',
      cat: 'engineering', date: '2026-10-06', author: 'jory', minutes: 7, art: 'battery',
      dek: 'Lithium cells hate the cold. Instead of asking owners to carry batteries indoors, we keep them warm with a little of their own energy.',
      body: [
        ['p', 'A lithium-ion cell at 0°F can deliver maybe 60 to 70 percent of the energy it holds at room temperature, and charging it below freezing can damage it for good. For a bike built for Minnesota winters, that is the problem to solve first.'],
        ['h2', 'How the sleeve works'],
        ['p', 'The Portage battery sits inside the down tube in a thin insulated sleeve with a heating film. When the battery management system reads a cell temperature below 20°F, it spends a small amount of power to bring the pack up to about 40°F, then holds it there while you ride.'],
        ['ul', ['Costs about 3 to 5 percent of a full charge on a cold ride.', 'Gives back far more than that in usable range.', 'Will not let the pack charge until the cells are above 32°F, even if you plug in straight away.']],
        ['p', 'The range estimator on this site includes the cold: set the temperature to 5°F and you can see exactly what the lake wind costs you.']
      ]
    },
    {
      slug: 'first-hundred-owners',
      title: 'The first hundred owners, by the numbers',
      cat: 'company', date: '2026-09-22', author: 'tove', minutes: 5, art: 'chart',
      dek: 'We asked the first hundred people who took delivery what they carry and how far they ride. The answers changed our accessory list.',
      body: [
        ['p', 'Most of our first owners live within 30 miles of Duluth, so we know a lot of them by name. In August we sent everyone a short survey and 91 of them answered.'],
        ['ul', ['Median ride: 7.4 miles a day.', '62 percent replaced at least one car trip a day; 14 households sold a car.', '38 percent carry a child at least twice a week.', 'The most carried item, by a distance: groceries. Second: a dog.']],
        ['h2', 'What we changed'],
        ['p', 'Owners asked for a bag that could take a full grocery run without a backpack, so the waterproof panniers grew from 25 to 32 liters each. And so many people asked about winter riding that studded tires are now an option at checkout instead of an aftermarket hunt.'],
        ['quote', 'I thought it would be a summer toy. I rode it to work in a blizzard in March.', 'An owner in Superior, Wisconsin']
      ]
    },
    {
      slug: 'choosing-studded-tires',
      title: 'Choosing a studded tire for 20-inch wheels',
      cat: 'engineering', date: '2026-09-08', author: 'eino', minutes: 5, art: 'tire',
      dek: 'There are very few studded tires for small, wide wheels. We tested six, and had one made.',
      body: [
        ['p', 'Small wheels are a big part of why the Portage is easy to ride: a low deck, a low center of gravity and a bike that fits in an elevator. The trade-off is tires. Most studded tires are made for 26 and 29-inch wheels.'],
        ['p', 'We tested six 20-inch studded tires over a winter on ice, packed snow and bare wet pavement, and measured stopping distance on each.'],
        ['h2', 'What we picked'],
        ['ul', ['180 carbide studs per tire, in two rows on each shoulder.', 'A softer winter rubber that stays grippy at −20°F.', 'A 3.0-inch width that floats on fresh snow instead of cutting through it.']],
        ['p', 'Studs come pre-seated. Give them about 30 miles on bare pavement before your first icy hill so they settle in.']
      ]
    },
    {
      slug: 'powder-coat-in-house',
      title: 'Bringing powder coat in-house',
      cat: 'production', date: '2026-08-25', author: 'pilar', minutes: 4, art: 'paint',
      dek: 'Frames used to travel three hours south to be painted, and back again. Now they cross the room.',
      body: [
        ['p', 'Until this summer every raw frame went on a truck to a coating shop down Interstate 35 and came back a week later. That week was the longest single step in building a Portage.'],
        ['p', 'Our new booth and curing oven sit at the back of the shop. Frames are blasted, coated with a zinc-rich primer for road salt, then given the color coat and a clear coat.'],
        ['ul', ['Five colors, all with the same salt-resistant primer.', 'Lead time down by about six business days.', 'One less truck on Interstate 35 every week.']],
        ['p', 'It also means we can repair chips and scratches for owners. Bring your bike in and we will touch it up while you have a coffee.']
      ]
    },
    {
      slug: 'kid-seat-families',
      title: 'Testing the kid seat with eleven Duluth families',
      cat: 'testing', date: '2026-08-11', author: 'yer', minutes: 6, art: 'kidseat',
      dek: 'Kids are honest testers. Eleven of them rode for a month and told us exactly what was wrong.',
      body: [
        ['p', 'Before the kid seat went on sale, eleven families rode with prototypes for four weeks: school runs, daycare drop-offs and a lot of trips to the beach.'],
        ['h2', 'What the kids told us'],
        ['ul', ['The footrests were too far forward for a three-year-old. They now slide in four steps.', 'The harness buckle was hard for parents with cold fingers. The new one opens with a mitten on.', '“The seat should be red.” It now comes in black only. Sorry.']],
        ['p', 'Parents asked for a grab rail their kids could hold, and a way to carry the seat inside. The rail is part of the rear rack, and the seat comes off with two levers.'],
        ['quote', 'My son calls it the bus. He asks to take the bus every morning.', 'A parent in Lakeside']
      ]
    },
    {
      slug: 'seed-round',
      title: 'We raised a seed round. Here is what it pays for.',
      cat: 'company', date: '2026-07-28', author: 'tove', minutes: 3, art: 'seed',
      dek: 'Tenpenny Ventures led a $4.2 million seed round, with Ninebark Capital and the Frostline Angels. Most of it goes into the shop.',
      body: [
        ['p', 'We started Bonfield in a rented garage with one welder and a borrowed lathe. Reservations from early owners paid for the first jig and the first batch of parts. To grow, we needed more than that.'],
        ['p', 'This summer Tenpenny Ventures led a $4.2 million seed round, with Ninebark Capital and the Frostline Angels, a group of founders from around Minnesota.'],
        ['h2', 'Where it goes'],
        ['ul', ['A second frame jig and an in-house powder coat line.', 'A larger parts inventory, so batches don’t wait on one late shipment.', 'Six new jobs in Duluth, and a few more coming.']],
        ['p', 'Your deposit is still yours: it is held separately and refunded in full if you cancel before your bike ships.']
      ]
    }
  ];

  /* ---------------------------------------------------------------- Team */
  // Portrait values: skin, hair (color), style (short | long | bun | bald | curly), shirt, glasses, beard.
  const PEOPLE = {
    tove: { name: 'Tove Kettunen', role: 'Co-founder & CEO', bio: 'Spent nine years designing snowmobile chassis before deciding the future of winter was quieter. Rides a Birch White Portage with two dogs on the back.', skin: '#f1c7a5', hair: '#d9b36c', style: 'bun', shirt: '#c63d1f', glasses: false, beard: false },
    eino: { name: 'Eino Wennberg', role: 'Co-founder & head of engineering', bio: 'Mechanical engineer, former mining equipment designer on the Iron Range. Wrote the first frame calculations on a diner napkin, which is framed in the shop.', skin: '#e9b58f', hair: '#5b4636', style: 'short', shirt: '#0f6672', glasses: true, beard: true },
    pilar: { name: 'Pilar Rask', role: 'Head of production', bio: 'Ran assembly lines for an outdoor gear maker for a decade. Owns the batch schedule and the shop playlist, and will defend both.', skin: '#c98e63', hair: '#2a1d17', style: 'long', shirt: '#2a2f33', glasses: false, beard: false },
    yer: { name: 'Yer Xiong', role: 'Industrial designer', bio: 'Designed the kid seat, the basket and the battery sleeve. Grew up in Hibbing and commutes year-round across the bridge from Superior.', skin: '#d9a77c', hair: '#1c1a1a', style: 'short', shirt: '#6a4c9c', glasses: true, beard: false },
    elof: { name: 'Elof Maki', role: 'Frame shop lead', bio: 'Certified welder who has built everything from ore dock railings to race car cages. Welds the first frame of every batch himself.', skin: '#f0c09c', hair: '#9a9a96', style: 'bald', shirt: '#e7e2d3', glasses: false, beard: true },
    aune: { name: 'Aune Lahti', role: 'Owner care & delivery', bio: 'Hand-delivers bikes around Duluth and Superior and answers the phone when you call. Has ridden every street in town that has a name.', skin: '#8d5a3b', hair: '#1f1612', style: 'curly', shirt: '#c63d1f', glasses: false, beard: false },
    jory: { name: 'Jory Solheim', role: 'Battery & firmware engineer', bio: 'Writes the motor and battery firmware and owns the cold chamber, a converted chest freezer that reaches −40°F.', skin: '#f3d2b8', hair: '#a4532a', style: 'curly', shirt: '#0f6672', glasses: false, beard: false }
  };

  /* ---------------------------------------------------------------- Careers */
  const TEAMS = { engineering: 'Engineering', production: 'Production', customer: 'Owner care' };
  const ROLES = [
    { slug: 'frame-welder', title: 'Frame welder (TIG)', team: 'production', place: 'Duluth shop', type: 'Full-time', pay: '$27–$34 an hour',
      summary: 'Tack and weld aluminum frames in our jigs, inspect welds and train the next welder we hire. Two years of TIG on aluminum required.' },
    { slug: 'assembly-tech', title: 'Assembly technician', team: 'production', place: 'Duluth shop', type: 'Full-time', pay: '$22–$27 an hour',
      summary: 'Build bikes from frame to final ride test, following our checklists. Bike shop experience is a plus; we train the rest.' },
    { slug: 'firmware-engineer', title: 'Firmware engineer, motor & battery', team: 'engineering', place: 'Duluth or remote (Central time)', type: 'Full-time', pay: '$128,000–$152,000',
      summary: 'Own the battery management and motor control firmware with Jory, from cold-weather charging to ride logging.' },
    { slug: 'mechanical-engineer', title: 'Mechanical design engineer', team: 'engineering', place: 'Duluth shop', type: 'Full-time', pay: '$105,000–$126,000',
      summary: 'Design accessories and the next frame revision in CAD, then take them through prototype, fatigue testing and production.' },
    { slug: 'winter-test-rider', title: 'Winter test rider', team: 'engineering', place: 'Duluth', type: 'Seasonal, December–March', pay: '$24 an hour',
      summary: 'Ride prototypes on a fixed route every morning, log what you feel and keep the data loggers charged. You must enjoy hills.' },
    { slug: 'delivery-lead', title: 'Delivery & fitting lead', team: 'customer', place: 'Duluth–Superior', type: 'Full-time', pay: '$58,000–$66,000',
      summary: 'Deliver bikes around Duluth and Superior, fit them to their owners and run the first ride. Needs a driver’s license and patience.' },
    { slug: 'owner-support', title: 'Owner support specialist', team: 'customer', place: 'Remote (US)', type: 'Part-time, 24 hours', pay: '$25 an hour',
      summary: 'Answer owners by phone and email, troubleshoot with photos and video, and turn what you hear into fixes with the shop.' }
  ];

  return { COMPANY, BUILD, BATCHES, ZONES, RANGE, COST, DEMO, CATEGORIES, POSTS, PEOPLE, TEAMS, ROLES };
})();
