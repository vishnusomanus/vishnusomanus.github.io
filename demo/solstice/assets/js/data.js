/* Solstice — festival content. Edit this file to change the lineup, stages,
   food village and ticket prices; every page reads from window.SOLSTICE.
   Times are local festival time (EDT, UTC-4) in 24-hour "HH:MM". */
window.SOLSTICE = {
  // Demo only: once this edition is over (after the last day's curfew), every date on the site moves on to the
  // same week of the next year (by whole weeks, so weekdays stay the same) and the edition year follows, so the
  // demo never shows a festival that has passed. Set it to false when you enter your real dates.
  keepDemoCurrent: true,

  // Gates open: drives the home page countdown (also set on [data-countdown] in index.html).
  gatesOpen: '2027-06-25T14:00:00-04:00',
  utcOffset: '-04:00',

  days: [
    { id: 'fri', label: 'Friday', short: 'Fri', date: '2027-06-25', gates: '14:00', curfew: '23:45' },
    { id: 'sat', label: 'Saturday', short: 'Sat', date: '2027-06-26', gates: '11:00', curfew: '23:30' },
    { id: 'sun', label: 'Sunday', short: 'Sun', date: '2027-06-27', gates: '11:00', curfew: '21:30' }
  ],

  stages: [
    { id: 'sunhouse', name: 'Sunhouse Stage', blurb: 'The main stage, facing the sunset over the Farmhouse lawn.' },
    { id: 'meadow', name: 'Meadow Stage', blurb: 'Our second stage at the bottom of the long meadow.' },
    { id: 'orchard', name: 'The Orchard', blurb: 'Acoustic sets under the old cherry trees, bring a blanket.' },
    { id: 'firefly', name: 'Firefly Tent', blurb: 'The late-night dance tent, open until curfew.' }
  ],

  genres: {
    indie: 'Indie',
    soul: 'Soul & funk',
    folk: 'Folk',
    electronic: 'Electronic',
    global: 'Global grooves',
    jazz: 'Jazz',
    pop: 'Pop'
  },

  // tier: 1 = headliner, 2 = special guest, 3 = everyone else (sizes on the poster lineup).
  // art: [motif, background, foreground] for the generated artwork. Motifs: sun, waves, rings, stripes, burst, hills.
  artists: [
    // ---------------------------------------------------------------- Friday
    { id: 'halcyon-bloom', name: 'Halcyon Bloom', day: 'fri', stage: 'sunhouse', start: '21:15', end: '22:45', genre: 'indie', tier: 1, from: 'Traverse City',
      bio: 'Six-piece indie pop with two drummers, a horn section and choruses built for a field full of people. Their second album, Long Light, spent the summer on every festival playlist.', art: ['sun', '#ff8a2b', '#ffe08a'] },
    { id: 'low-tides-orchestra', name: 'The Low Tides Orchestra', day: 'fri', stage: 'sunhouse', start: '19:15', end: '20:30', genre: 'global', tier: 2, from: 'Cleveland',
      bio: 'A twelve-piece band mixing Ethio-jazz, surf guitar and gospel choir harmonies. Expect a brass section that walks into the crowd at least once.', art: ['waves', '#0b6e66', '#8fd0ee'] },
    { id: 'mabel-okafor', name: 'Mabel Okafor', day: 'fri', stage: 'sunhouse', start: '17:30', end: '18:30', genre: 'soul', tier: 2, from: 'Detroit',
      bio: 'Warm, gospel-trained vocals over seventies soul arrangements. Mabel recorded her debut live to tape in a Detroit church basement.', art: ['rings', '#c73a1e', '#ffc53d'] },
    { id: 'tin-lantern', name: 'Tin Lantern', day: 'fri', stage: 'sunhouse', start: '16:00', end: '16:45', genre: 'indie', tier: 3, from: 'Petoskey',
      bio: 'Jangly guitars, three-part harmonies and songs about beach towns out of season. The first band on the Sunhouse Stage this year.', art: ['stripes', '#ffc53d', '#24122e'] },
    { id: 'static-peaches', name: 'Static Peaches', day: 'fri', stage: 'meadow', start: '19:00', end: '20:15', genre: 'indie', tier: 2, from: 'Columbus',
      bio: 'Fuzzy, loud and joyful garage pop. Their live shows are famous for the inflatable peach that ends up on the crowd.', art: ['burst', '#ffb3a1', '#c73a1e'] },
    { id: 'wren-and-wild', name: 'Wren & Wild', day: 'fri', stage: 'meadow', start: '17:00', end: '18:00', genre: 'folk', tier: 3, from: 'Empire',
      bio: 'Fiddle and banjo duo playing fast, foot-stomping folk with new words to very old tunes.', art: ['hills', '#9fd88a', '#0b6e66'] },
    { id: 'cardamom-collective', name: 'Cardamom Collective', day: 'fri', stage: 'meadow', start: '15:30', end: '16:15', genre: 'jazz', tier: 3, from: 'Traverse City',
      bio: 'Spiritual jazz with tabla, harmonium and a saxophone that sounds like a sunrise. Perfect for the first drink of the weekend.', art: ['rings', '#24122e', '#ff8a2b'] },
    { id: 'harbour-lights-choir', name: 'Harbor Lights Choir', day: 'fri', stage: 'orchard', start: '18:30', end: '19:30', genre: 'soul', tier: 3, from: 'Traverse City',
      bio: 'Sixty voices from Traverse City’s waterfront singing soul and Motown classics. Join in on the last song, everyone does.', art: ['waves', '#8fd0ee', '#24122e'] },
    { id: 'sol-navarro-trio', name: 'Sol Navarro Trio', day: 'fri', stage: 'orchard', start: '16:30', end: '17:30', genre: 'jazz', tier: 3, from: 'Seville via Ann Arbor',
      bio: 'Flamenco guitar meets upright bass and brushes. Sol Navarro writes instrumentals that feel like late afternoons in the shade.', art: ['sun', '#ffc53d', '#c73a1e'] },
    { id: 'ottilie-marsh', name: 'Ottilie Marsh', day: 'fri', stage: 'orchard', start: '15:00', end: '15:45', genre: 'folk', tier: 3, from: 'Glen Arbor',
      bio: 'Songs about rivers, kitchens and old friends, sung with one guitar and a voice that quiets a tent.', art: ['hills', '#fff4de', '#ff8a2b'] },
    { id: 'kemi-sunday', name: 'Kemi Sunday', day: 'fri', stage: 'firefly', start: '22:30', end: '23:45', genre: 'electronic', tier: 2, from: 'Lagos & Detroit',
      bio: 'Afro-house DJ and producer whose Friday-night closing sets have become a Solstice tradition. Bring your dancing shoes.', art: ['burst', '#24122e', '#ffc53d'] },
    { id: 'neon-allotment', name: 'Neon Victory Garden', day: 'fri', stage: 'firefly', start: '21:00', end: '22:15', genre: 'electronic', tier: 3, from: 'Ypsilanti',
      bio: 'Analogue synths, field recordings from actual community gardens and a kick drum you can feel in your chest.', art: ['stripes', '#9fd88a', '#24122e'] },

    // ---------------------------------------------------------------- Saturday
    { id: 'kofi-brightwater', name: 'Kofi Brightwater & The Tidelines', day: 'sat', stage: 'sunhouse', start: '21:30', end: '23:00', genre: 'global', tier: 1, from: 'Accra & Detroit',
      bio: 'Highlife guitars, Afrobeat horns and a rhythm section that never stops. Kofi’s band has played on four continents and this is their only Midwest show this summer.', art: ['sun', '#c73a1e', '#ffc53d'] },
    { id: 'marlowe-grey', name: 'Marlowe Grey', day: 'sat', stage: 'sunhouse', start: '19:15', end: '20:30', genre: 'indie', tier: 2, from: 'Minneapolis',
      bio: 'Big-hearted guitar anthems with a string quartet. Marlowe’s sunset set is the one people still talk about from 2025.', art: ['hills', '#ff8a2b', '#24122e'] },
    { id: 'golden-hour-social', name: 'Golden Hour Social', day: 'sat', stage: 'sunhouse', start: '17:00', end: '18:15', genre: 'soul', tier: 2, from: 'Flint',
      bio: 'A disco-soul collective with a rotating cast of singers, a glitter budget and a bassline in every song.', art: ['rings', '#ffc53d', '#c73a1e'] },
    { id: 'ines-calloway', name: 'Ines Calloway', day: 'sat', stage: 'sunhouse', start: '15:00', end: '16:00', genre: 'soul', tier: 3, from: 'Kalamazoo',
      bio: 'Smoky neo-soul with a jazz trio. Ines writes about love, rent and the bus home, often in the same song.', art: ['waves', '#24122e', '#ffb3a1'] },
    { id: 'dandelion-clocks', name: 'The Dandelion Clocks', day: 'sat', stage: 'sunhouse', start: '13:00', end: '13:45', genre: 'pop', tier: 3, from: 'Ludington',
      bio: 'Sunny, singalong pop that grown-ups and five-year-olds love equally. Bubble machine included.', art: ['burst', '#fff4de', '#ff8a2b'] },
    { id: 'saffron-riot', name: 'Saffron Riot', day: 'sat', stage: 'meadow', start: '18:45', end: '20:00', genre: 'indie', tier: 2, from: 'Buffalo',
      bio: 'Four-piece punk-pop with sitar, sharp lyrics and a drummer who plays standing up. Loud in the best way.', art: ['stripes', '#ff8a2b', '#24122e'] },
    { id: 'juno-achebe', name: 'Juno Achebe', day: 'sat', stage: 'meadow', start: '16:30', end: '17:30', genre: 'pop', tier: 2, from: 'Brooklyn',
      bio: 'Glossy, bright pop with Afro-fusion rhythms. Juno’s single Paper Sun was the sound of last summer.', art: ['sun', '#8fd0ee', '#c73a1e'] },
    { id: 'moth-parade', name: 'Moth Parade', day: 'sat', stage: 'meadow', start: '14:15', end: '15:15', genre: 'indie', tier: 3, from: 'Madison',
      bio: 'Dreamy shoegaze with a pop heart. Best heard lying on the grass with your eyes closed.', art: ['rings', '#9fd88a', '#24122e'] },
    { id: 'fennel-and-fig', name: 'Fennel & Fig', day: 'sat', stage: 'meadow', start: '12:30', end: '13:15', genre: 'folk', tier: 3, from: 'Suttons Bay',
      bio: 'Accordion, cello and close harmony from two sisters who grew up on a cider farm.', art: ['hills', '#ffc53d', '#0b6e66'] },
    { id: 'amara-quist', name: 'Amara Quist', day: 'sat', stage: 'orchard', start: '18:00', end: '19:00', genre: 'soul', tier: 3, from: 'Traverse City',
      bio: 'Stripped-back soul with just a Rhodes piano and her voice. Possibly the most goosebumps per minute of the weekend.', art: ['sun', '#24122e', '#ff8a2b'] },
    { id: 'blue-lido-quartet', name: 'Blue Cabana Quartet', day: 'sat', stage: 'orchard', start: '16:00', end: '17:00', genre: 'jazz', tier: 3, from: 'Traverse City',
      bio: 'Cool, swinging jazz named after the swim club where they rehearse. Bossa nova covers on request.', art: ['waves', '#8fd0ee', '#0b6e66'] },
    { id: 'rosa-penhallow', name: 'Rosa Penhallow', day: 'sat', stage: 'orchard', start: '14:00', end: '15:00', genre: 'folk', tier: 3, from: 'Frankfort',
      bio: 'Great Lakes songs of the water and the people who work on it, with harp and a loop pedal.', art: ['waves', '#0b6e66', '#fff4de'] },
    { id: 'hedgerow-band', name: 'The Fencerow Band', day: 'sat', stage: 'orchard', start: '12:00', end: '12:45', genre: 'folk', tier: 3, from: 'Kingsley',
      bio: 'A family-friendly barn-dance band. They call the steps, you do the dancing, nobody needs to know them already.', art: ['stripes', '#9fd88a', '#c73a1e'] },
    { id: 'marisol-vega', name: 'DJ Marisol Vega', day: 'sat', stage: 'firefly', start: '22:00', end: '23:30', genre: 'electronic', tier: 2, from: 'Bogotá & Traverse City',
      bio: 'Cumbia, house and tropical bass blended into a set that turns the Firefly Tent into a street party.', art: ['burst', '#c73a1e', '#ffc53d'] },
    { id: 'pollen-count', name: 'Pollen Count', day: 'sat', stage: 'firefly', start: '20:30', end: '21:45', genre: 'electronic', tier: 3, from: 'Traverse City',
      bio: 'Live electronica duo with drum machines, modular synths and a cello. Melodic, warm and made for dusk.', art: ['rings', '#ffc53d', '#0b6e66'] },

    // ---------------------------------------------------------------- Sunday
    { id: 'juniper-vale', name: 'Juniper Vale', day: 'sun', stage: 'sunhouse', start: '20:00', end: '21:30', genre: 'pop', tier: 1, from: 'Copper Harbor',
      bio: 'Folk-pop songwriter with a voice made for summer evenings and a full band with strings. Closing Solstice 2027 with a career-spanning set.', art: ['sun', '#ffc53d', '#c73a1e'] },
    { id: 'lior-long-grass', name: 'Lior & the Long Grass', day: 'sun', stage: 'sunhouse', start: '17:00', end: '18:15', genre: 'folk', tier: 2, from: 'St. Paul',
      bio: 'Cinematic folk-rock with banjo, pedal steel and huge singalong choruses.', art: ['hills', '#0b6e66', '#ffc53d'] },
    { id: 'brass-foxes', name: 'The Brass Foxes', day: 'sun', stage: 'sunhouse', start: '15:00', end: '16:00', genre: 'jazz', tier: 2, from: 'New Orleans via Detroit',
      bio: 'A ten-piece street brass band playing New Orleans second-line, pop covers and their own very danceable tunes.', art: ['burst', '#ff8a2b', '#24122e'] },
    { id: 'clementine-ash', name: 'Clementine Ash', day: 'sun', stage: 'sunhouse', start: '13:00', end: '14:00', genre: 'pop', tier: 3, from: 'Lansing',
      bio: 'Bedroom pop gone big: shimmering synths, honest lyrics and a fan club that brings matching sunhats.', art: ['rings', '#ffb3a1', '#24122e'] },
    { id: 'honeyfield', name: 'Honeyfield', day: 'sun', stage: 'meadow', start: '18:30', end: '19:45', genre: 'soul', tier: 2, from: 'Traverse City',
      bio: 'Funk and soul with a nine-piece band, two backing singers and the tightest horn stabs in the Midwest.', art: ['sun', '#ff8a2b', '#fff4de'] },
    { id: 'tamsin-rook', name: 'Tamsin Rook', day: 'sun', stage: 'meadow', start: '16:30', end: '17:30', genre: 'indie', tier: 3, from: 'Toledo',
      bio: 'Sharp, witty indie songs with a fuzz guitar and an occasional trumpet solo.', art: ['stripes', '#24122e', '#ffb3a1'] },
    { id: 'ade-kalu-highlife', name: 'Ade Kalu Highlife Band', day: 'sun', stage: 'meadow', start: '14:30', end: '15:30', genre: 'global', tier: 3, from: 'Detroit',
      bio: 'Golden-era Nigerian highlife played by a band whose combined age is over 400. Pure joy.', art: ['waves', '#ffc53d', '#c73a1e'] },
    { id: 'sunday-paper-club', name: 'Sunday Paper Club', day: 'sun', stage: 'meadow', start: '12:30', end: '13:30', genre: 'indie', tier: 3, from: 'Charlevoix',
      bio: 'Easy, sunny guitar pop for a slow Sunday start. Their drummer also runs the coffee stand next door.', art: ['burst', '#9fd88a', '#0b6e66'] },
    { id: 'cider-press-ceilidh', name: 'The Cider Press Contra Dance', day: 'sun', stage: 'orchard', start: '16:00', end: '17:00', genre: 'folk', tier: 3, from: 'Kingsley',
      bio: 'A full-tilt contra dance with a caller, so the whole Orchard can dance. Absolutely no experience needed.', art: ['stripes', '#ffc53d', '#0b6e66'] },
    { id: 'kasia-morrow', name: 'Kasia Morrow', day: 'sun', stage: 'orchard', start: '14:00', end: '15:00', genre: 'jazz', tier: 3, from: 'Kraków & Traverse City',
      bio: 'Jazz pianist and singer with a gift for turning Polish lullabies into swinging standards.', art: ['rings', '#8fd0ee', '#24122e'] },
    { id: 'nell-ashby', name: 'Nell Ashby', day: 'sun', stage: 'orchard', start: '12:00', end: '13:00', genre: 'folk', tier: 3, from: 'Beulah',
      bio: 'Gentle finger-picked songs for the morning after. Nell plays a guitar her grandfather built.', art: ['hills', '#ffb3a1', '#0b6e66'] },
    { id: 'midsummer-soundsystem', name: 'Midsummer Soundsystem', day: 'sun', stage: 'firefly', start: '19:30', end: '21:00', genre: 'electronic', tier: 2, from: 'Traverse City',
      bio: 'Traverse City’s favorite soundsystem crew with reggae, dub and jungle to close the tent.', art: ['burst', '#0b6e66', '#ffc53d'] },
    { id: 'lumen-garden', name: 'Lumen Garden', day: 'sun', stage: 'firefly', start: '18:00', end: '19:15', genre: 'electronic', tier: 3, from: 'Muskegon',
      bio: 'Balearic house and ambient grooves timed for the golden hour.', art: ['sun', '#ffb3a1', '#24122e'] }
  ],

  // Food & drink village. diets: vegan, vegetarian, gluten-free, halal, dairy-free.
  // kind: food | sweet | drink. pin: position on the food village map (0–100 %).
  diets: {
    vegan: 'Vegan',
    vegetarian: 'Vegetarian',
    'gluten-free': 'Gluten-free',
    halal: 'Halal',
    'dairy-free': 'Dairy-free'
  },
  vendors: [
    { id: 'smoke-sunshine', name: 'Smoke & Sunshine', kind: 'food', cuisine: 'Caribbean grill', dish: 'Jerk chicken, rice and peas, grilled plantain', price: '$13–$18', diets: ['halal', 'gluten-free', 'dairy-free'], pin: [14, 30] },
    { id: 'masala-meadow', name: 'Masala Meadow', kind: 'food', cuisine: 'Indian thali', dish: 'Chana masala and dal thali with pickles and roti', price: '$12–$16', diets: ['vegan', 'vegetarian', 'halal', 'dairy-free'], pin: [26, 22] },
    { id: 'wood-fire', name: 'Wood & Fire', kind: 'food', cuisine: 'Sourdough pizza', dish: 'Wood-fired margherita, vegan ’nduja option', price: '$14–$19', diets: ['vegetarian', 'vegan'], pin: [38, 18] },
    { id: 'taco-sol', name: 'Taco Sol', kind: 'food', cuisine: 'Mexican street food', dish: 'Corn tortilla tacos: pork pibil or mushroom al pastor', price: '$12–$16', diets: ['gluten-free', 'vegan', 'dairy-free'], pin: [50, 16] },
    { id: 'golden-dumpling', name: 'Golden Dumpling Co.', kind: 'food', cuisine: 'Dumplings', dish: 'Pan-fried pork or kimchi-tofu dumplings with chili oil', price: '$11–$15', diets: ['vegan', 'dairy-free'], pin: [62, 18] },
    { id: 'mezze-garden', name: 'Mezze Garden', kind: 'food', cuisine: 'Lebanese', dish: 'Falafel wraps, hummus and fattoush boxes', price: '$11–$15', diets: ['vegan', 'vegetarian', 'halal', 'dairy-free'], pin: [74, 22] },
    { id: 'halloumi-haus', name: 'Halloumi Haus', kind: 'food', cuisine: 'Cypriot', dish: 'Grilled halloumi fries with pomegranate and mint', price: '$9–$13', diets: ['vegetarian', 'gluten-free'], pin: [86, 30] },
    { id: 'bao-down', name: 'Bao Down', kind: 'food', cuisine: 'Taiwanese', dish: 'Fluffy bao with fried chicken or crispy tofu', price: '$12–$16', diets: ['halal', 'vegan'], pin: [86, 56] },
    { id: 'sticky-fingers', name: 'Sticky Fingers BBQ', kind: 'food', cuisine: 'Low-and-slow BBQ', dish: '12-hour brisket, slaw and pit beans', price: '$14–$20', diets: ['gluten-free', 'dairy-free'], pin: [74, 66] },
    { id: 'green-bowl', name: 'The Green Bowl', kind: 'food', cuisine: 'Salads & grain bowls', dish: 'Roasted squash, freekeh, herbs and tahini', price: '$12–$15', diets: ['vegan', 'vegetarian', 'gluten-free', 'dairy-free'], pin: [14, 56] },
    { id: 'little-lisbon', name: 'Little Lisbon', kind: 'food', cuisine: 'Portuguese', dish: 'Bifana pork sandwiches and piri-piri halloumi', price: '$11–$15', diets: ['vegetarian'], pin: [26, 66] },
    { id: 'crepe-escape', name: 'Crêpe Escape', kind: 'sweet', cuisine: 'Crêpes & galettes', dish: 'Buckwheat galettes and salted caramel crêpes', price: '$8–$12', diets: ['vegetarian', 'gluten-free'], pin: [38, 72] },
    { id: 'scoop-dreams', name: 'Scoop Dreams', kind: 'sweet', cuisine: 'Ice cream', dish: 'Michigan dairy ice cream and mango sorbet', price: '$5–$8', diets: ['vegetarian', 'vegan', 'gluten-free'], pin: [62, 72] },
    { id: 'leicester-bean', name: 'Boardman Bean Co.', kind: 'drink', cuisine: 'Coffee & cake', dish: 'Flat whites, oat milk iced lattes, lemon loaf', price: '$4–$7', diets: ['vegetarian', 'vegan', 'dairy-free'], pin: [50, 78] },
    { id: 'long-table-bar', name: 'The Long Table Bar', kind: 'drink', cuisine: 'Beer & cider', dish: 'Local pale ales and Leelanau cider on draft', price: '$7–$10', diets: ['vegan', 'gluten-free', 'dairy-free'], pin: [50, 44] },
    { id: 'fizz-feather', name: 'Fizz & Feather', kind: 'drink', cuisine: 'Cocktails & alcohol-free', dish: 'Elderflower spritz and alcohol-free mojitos', price: '$6–$12', diets: ['vegan', 'gluten-free', 'dairy-free'], pin: [32, 44] }
  ],

  // Tickets. Prices in USD. earlyBird applies until earlyBirdEnds; groupSize+ tickets in one
  // order get groupDiscount off the ticket subtotal (add-ons excluded). fee is per ticket.
  currency: 'USD',
  earlyBirdEnds: '2027-01-31T23:59:00-05:00',
  groupSize: 6,
  groupDiscount: 0.10,
  fee: 4.5,
  maxPerType: 10,
  tickets: [
    { id: 'day-fri', name: 'Friday day ticket', group: 'day', price: 79, early: 69, note: 'Gates 2 PM, music until 11:45 PM' },
    { id: 'day-sat', name: 'Saturday day ticket', group: 'day', price: 95, early: 85, note: 'Gates 11 AM, music until 11:30 PM' },
    { id: 'day-sun', name: 'Sunday day ticket', group: 'day', price: 85, early: 75, note: 'Gates 11 AM, music until 9:30 PM' },
    { id: 'weekend', name: 'Weekend', group: 'weekend', price: 209, early: 179, note: 'All three days, no camping' },
    { id: 'camping', name: 'Weekend + camping', group: 'weekend', price: 279, early: 239, note: 'Three days and two nights in the Oak Field campsite' },
    { id: 'family', name: 'Family weekend', group: 'weekend', price: 499, early: 439, note: 'Two adults and up to three children aged 5–15, camping included' },
    { id: 'vip', name: 'VIP weekend', group: 'weekend', price: 449, early: 399, note: 'Viewing deck, Orchard lounge, real restrooms, fast-lane entry' }
  ],
  addons: [
    { id: 'parking', name: 'Parking pass', price: 30, note: 'Per vehicle, whole weekend' },
    { id: 'campervan', name: 'RV site', price: 85, note: 'Needs a camping ticket' },
    { id: 'belltent', name: 'Pre-set bell tent', price: 390, note: 'Sleeps four, beds made' },
    { id: 'shuttle', name: 'Airport shuttle', price: 15, note: 'Round trip, per person' },
    { id: 'cup', name: 'Cup & bottle bundle', price: 12, note: 'Steel cup and refill bottle' }
  ]
};
