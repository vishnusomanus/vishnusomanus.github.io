/* Saltwind Journeys — Wander template. Vanilla JavaScript, no dependencies.
 *
 * Sections
 *  1. Data: regions, styles, tours      8. Tour page: itinerary, map, dates, booking
 *  2. Helpers                           9. Destinations: seasonality
 *  3. Art: landscapes, maps, avatars   10. Journal topic filter
 *  4. Departures and prices            11. Forms: validation and success states
 *  5. Tour cards                       12. Header, menu, reveal, reading progress
 *  6. Trip finder (home page)          13. Back to top
 *  7. Tours: filters, sort and URL
 */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
   * 1. Data. Edit trips here. Prices are per person, in US dollars.
   * ------------------------------------------------------------------ */

  // season: one value per month, January to December. 0 = avoid, 1 = possible, 2 = good, 3 = best.
  var REGIONS = [
    { id: 'morocco', name: 'Morocco', label: 'Morocco & the Sahara', scene: 'dunes', time: 'dusk',
      season: [1, 2, 3, 3, 2, 1, 0, 0, 2, 3, 3, 1] },
    { id: 'andes', name: 'Peru', label: 'Peru & the Andes', scene: 'mountains', time: 'dawn',
      season: [0, 0, 1, 2, 3, 3, 3, 3, 3, 2, 1, 1] },
    { id: 'nordics', name: 'Norway', label: 'Norway & the Arctic', scene: 'fjord', time: 'night',
      season: [2, 3, 2, 1, 1, 3, 3, 3, 2, 1, 1, 2] },
    { id: 'aegean', name: 'Greece & Turkey', label: 'The Aegean', scene: 'coast', time: 'day',
      season: [0, 0, 1, 2, 3, 3, 2, 1, 3, 3, 1, 0] },
    { id: 'japan', name: 'Japan', label: 'Japan', scene: 'fuji', time: 'dawn',
      season: [1, 1, 3, 3, 3, 1, 1, 1, 2, 3, 3, 1] },
    { id: 'africa', name: 'Tanzania', label: 'Tanzania & Zanzibar', scene: 'savannah', time: 'dusk',
      season: [2, 3, 1, 0, 0, 2, 3, 3, 3, 3, 1, 2] }
  ];

  var STYLES = [
    { id: 'hiking', label: 'Hiking & trekking' },
    { id: 'culture', label: 'Culture & food' },
    { id: 'wildlife', label: 'Wildlife & nature' },
    { id: 'coast', label: 'Coast & sailing' }
  ];

  var DURATIONS = [
    { id: 'short', label: 'Up to 7 days', min: 1, max: 7 },
    { id: 'medium', label: '8 to 11 days', min: 8, max: 11 },
    { id: 'long', label: '12 days or more', min: 12, max: 99 }
  ];

  var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var SEASON_LABEL = ['Avoid', 'Possible', 'Good', 'Best'];

  var PRICE_MIN = 2000;          // budget slider range on tours.html
  var PRICE_MAX = 6500;
  var PEAK_SUPPLEMENT = 200;     // added per person to departures in a region's best months
  var DEPOSIT = 400;             // per person, shown in the booking summary
  var MAX_TRAVELLERS = 8;        // most travelers in one inquiry
  var BOOKING_CUTOFF = 21;       // departures closer than this many days are not offered
  var DEPARTURE_DAYS = [4, 18];  // tours leave on the first Saturday on or after these dates

  var INCLUDED = [
    'A Saltwind guide from the region, start to finish',
    'All accommodation, chosen and visited by us',
    'Breakfast every day and the meals listed in the itinerary',
    'Private transport and transfers on day 1 and the last day',
    'Carbon removal for your share of the trip, flights included'
  ];
  var EXCLUDED = [
    'International flights (we can recommend routes)',
    'Travel insurance, which is required',
    'Tips for local crews (about $10 a day is plenty)'
  ];

  var TOURS = [
    {
      id: 'atlas-sahara', name: 'Atlas to the Sahara', region: 'morocco', country: 'Morocco', style: 'culture',
      days: 10, price: 2990, single: 390, rating: 4.9, reviews: 212, group: 12, level: 'Moderate', badge: 'Most loved',
      months: [3, 4, 5, 9, 10, 11], scene: 'dunes', time: 'dusk', featured: 1,
      summary: 'From the souks of Marrakech over the High Atlas to a desert camp in the dunes of Erg Chebbi.',
      highlights: ['A night in a desert camp under the stars', 'Cooking class in a Berber family home', 'Walks through the Dades and Todra gorges'],
      includes: ['Camel trek into the dunes', 'Riad stays in Marrakech and Fes'],
      excludes: ['Lunches in Marrakech and Fes'],
      stops: [[18, 70, 'Marrakech'], [34, 52, 'Aït Ben Haddou'], [52, 58, 'Dades Gorge'], [74, 66, 'Merzouga'], [70, 24, 'Fes']],
      itinerary: [
        { d: '1', t: 'Marrakech: the red city', x: 'Meet the group at our riad off Rue Riad Zitoun, then an evening walk into Jemaa el-Fnaa as the food stalls light up.', stay: 'Riad Dar Zellij, Marrakech' },
        { d: '2', t: 'Gardens, souks and a rooftop dinner', x: 'Morning in the Majorelle garden, afternoon with a spice merchant who has worked the same stall for forty years.', stay: 'Riad Dar Zellij, Marrakech' },
        { d: '3', t: 'Over the Tizi n’Tichka pass', x: 'Climb into the High Atlas by road, stopping at Berber villages, then on to the earthen ksar of Aït Ben Haddou.', stay: 'Kasbah Tebi, Aït Ben Haddou' },
        { d: '4–5', t: 'Gorges and palm valleys', x: 'Two days of easy walks in the Dades and Todra gorges, with lunch and a cooking class in a family home.', stay: 'Auberge Tissadrine, Dades' },
        { d: '6–7', t: 'Into the Sahara', x: 'Camels carry the bags into Erg Chebbi. Sandboarding, drumming by the fire and a sky full of stars.', stay: 'Desert camp, Erg Chebbi' },
        { d: '8–9', t: 'Fes, the old medina', x: 'A long drive north through cedar forests to Fes, then a day lost (on purpose) in its 9,000 lanes.', stay: 'Riad Laaroussa, Fes' },
        { d: '10', t: 'Farewell breakfast', x: 'Mint tea on the roof terrace and transfers to Fes airport.', stay: '' }
      ]
    },
    {
      id: 'toubkal-trek', name: 'High Atlas & Toubkal', region: 'morocco', country: 'Morocco', style: 'hiking',
      days: 8, price: 1990, single: 250, rating: 4.8, reviews: 96, group: 12, level: 'Challenging',
      months: [4, 5, 6, 9, 10], scene: 'mountains', time: 'day',
      summary: 'Mule trails, walnut-shaded villages and a dawn summit of North Africa’s highest peak, 13,671 feet.',
      highlights: ['Summit of Jebel Toubkal at sunrise', 'Nights in village guesthouses', 'Mules carry your bags'],
      includes: ['Mountain guide and mule team', 'All meals on the trek'],
      excludes: [],
      stops: [[20, 30, 'Marrakech'], [42, 52, 'Imlil'], [56, 66, 'Toubkal refuge'], [66, 78, 'Toubkal summit'], [80, 50, 'Tacheddirt']],
      itinerary: [
        { d: '1', t: 'Arrive in Marrakech', x: 'Welcome dinner and a gear check with your guide, Youssef.', stay: 'Riad Kniza, Marrakech' },
        { d: '2', t: 'Up to Imlil', x: 'A ninety-minute drive into the mountains and an afternoon warm-up walk to the shrine of Sidi Chamharouch.', stay: 'Dar Imlil guesthouse' },
        { d: '3–4', t: 'Villages of the Azzaden valley', x: 'Two days on mule trails between terraced fields, sleeping in family homes.', stay: 'Village gîtes' },
        { d: '5', t: 'To the Toubkal refuge', x: 'A steady climb to 10,522 feet and an early night.', stay: 'Toubkal refuge' },
        { d: '6', t: 'Summit day', x: 'Leave by headlamp, reach the top for sunrise, and descend all the way to Imlil for a hot shower.', stay: 'Dar Imlil guesthouse' },
        { d: '7', t: 'Back to Marrakech', x: 'A free afternoon in the medina and a farewell dinner.', stay: 'Riad Kniza, Marrakech' },
        { d: '8', t: 'Departure', x: 'Transfers to Marrakech airport.', stay: '' }
      ]
    },
    {
      id: 'inca-trail', name: 'Sacred Valley & the Inca Trail', region: 'andes', country: 'Peru', style: 'hiking',
      days: 12, price: 4490, single: 530, rating: 4.9, reviews: 184, group: 10, level: 'Challenging', badge: 'Groups of 10',
      months: [4, 5, 6, 7, 8, 9, 10], scene: 'mountains', time: 'dawn', featured: 2,
      summary: 'Acclimatize in the villages of the Sacred Valley, then walk the classic four-day trail to the Sun Gate at Machu Picchu.',
      highlights: ['Four days on the classic Inca Trail', 'Sunrise through the Sun Gate', 'Weaving cooperative in Chinchero'],
      includes: ['Inca Trail permits (we book them early)', 'Porters, cooks and camping gear'],
      excludes: ['Sleeping bag rental ($35)'],
      stops: [[16, 62, 'Lima'], [56, 70, 'Cusco'], [50, 50, 'Pisac'], [40, 40, 'Ollantaytambo'], [30, 26, 'Machu Picchu']],
      itinerary: [
        { d: '1', t: 'Lima', x: 'Arrive in Lima and meet the group for ceviche in Barranco.', stay: 'Casa Republica, Lima' },
        { d: '2–3', t: 'Cusco, slowly', x: 'Fly to Cusco at 11,150 feet. Gentle days in San Blas and the market to let your body adjust.', stay: 'Hotel Arqueólogo, Cusco' },
        { d: '4–5', t: 'The Sacred Valley', x: 'Pisac ruins, the Chinchero weavers and a farm lunch with a pachamanca earth oven.', stay: 'Las Qolqas, Urubamba' },
        { d: '6–9', t: 'The Inca Trail', x: 'Four days and 26 miles over Dead Woman’s Pass to the cloud-forest ruins of Wiñay Wayna and the Sun Gate.', stay: 'Trail camps' },
        { d: '10', t: 'Machu Picchu', x: 'A guided morning in the citadel, then the train back through the valley.', stay: 'Hotel Arqueólogo, Cusco' },
        { d: '11', t: 'Free day in Cusco', x: 'Rest, shop for alpaca, or ride out to the Rainbow Mountain.', stay: 'Hotel Arqueólogo, Cusco' },
        { d: '12', t: 'Departure', x: 'Transfers to Cusco airport for flights home via Lima.', stay: '' }
      ]
    },
    {
      id: 'peru-taste', name: 'Peru by Taste', region: 'andes', country: 'Peru', style: 'culture',
      days: 9, price: 3590, single: 430, rating: 4.7, reviews: 58, group: 12, level: 'Easy',
      months: [3, 4, 5, 6, 9, 10, 11], scene: 'mountains', time: 'day',
      summary: 'Markets, potato farms, Amazonian cacao and Lima’s great kitchens, with Machu Picchu by train.',
      highlights: ['Market tour and lunch with a Lima chef', 'Potato park in the Andes', 'Machu Picchu by train'],
      includes: ['Six cooking classes and tastings', 'Machu Picchu entry and train'],
      excludes: ['Two dinners in Lima'],
      stops: [[18, 60, 'Lima'], [60, 70, 'Cusco'], [46, 46, 'Urubamba'], [32, 30, 'Machu Picchu']],
      itinerary: [
        { d: '1–2', t: 'Lima’s kitchens', x: 'Surquillo market with a chef, a pisco tasting and a dinner counter seat in Miraflores.', stay: 'Hotel B, Lima' },
        { d: '3–4', t: 'Cusco and the potato park', x: 'Meet the Quechua farmers who grow 1,300 kinds of potato, and cook with them.', stay: 'Casa Cartagena, Cusco' },
        { d: '5–6', t: 'Valley farms', x: 'Salt pans of Maras, a corn beer brewery and an evening of Andean music.', stay: 'Sol y Luna, Urubamba' },
        { d: '7', t: 'Machu Picchu', x: 'The Vistadome train along the Urubamba river and a guided visit.', stay: 'Inkaterra, Aguas Calientes' },
        { d: '8', t: 'Back to Cusco', x: 'Cacao workshop and a farewell dinner.', stay: 'Casa Cartagena, Cusco' },
        { d: '9', t: 'Departure', x: 'Transfers to Cusco airport.', stay: '' }
      ]
    },
    {
      id: 'lofoten-peaks', name: 'Lofoten Peaks & Fjords', region: 'nordics', country: 'Norway', style: 'hiking',
      days: 7, price: 3290, single: 460, rating: 4.8, reviews: 77, group: 12, level: 'Moderate',
      months: [6, 7, 8, 9], scene: 'fjord', time: 'day', featured: 3,
      summary: 'Ridge walks above white beaches under the midnight sun, with nights in red fishermen’s cabins.',
      highlights: ['Reinebringen and Ryten ridge walks', 'Sea kayaking in the fjords', 'Rorbu cabin stays'],
      includes: ['Sea kayak half day', 'Ferry crossings'],
      excludes: [],
      stops: [[20, 70, 'Bodø'], [38, 50, 'Reine'], [52, 40, 'Kvalvika'], [68, 30, 'Henningsvær'], [82, 22, 'Svolvær']],
      itinerary: [
        { d: '1', t: 'Ferry to the islands', x: 'Meet in Bodø and take the evening ferry across the Vestfjord to Moskenes.', stay: 'Reine Rorbuer' },
        { d: '2', t: 'Reinebringen', x: 'The steep stone staircase to the most famous view in the Lofoten.', stay: 'Reine Rorbuer' },
        { d: '3', t: 'Kayaks in the fjord', x: 'A half day paddling under the peaks, then free time in Hamnøy.', stay: 'Reine Rorbuer' },
        { d: '4', t: 'Kvalvika and Ryten', x: 'Over the hills to a hidden surf beach and up the Ryten ridge.', stay: 'Nusfjord Arctic Resort' },
        { d: '5–6', t: 'Henningsvær', x: 'A fishing village on skerries, a ridge walk to Festvågtind and a farewell dinner of fresh cod.', stay: 'Henningsvær Bryggehotell' },
        { d: '7', t: 'Departure', x: 'Transfers to Svolvær airport.', stay: '' }
      ]
    },
    {
      id: 'arctic-lights', name: 'Arctic Lights of Tromsø', region: 'nordics', country: 'Norway', style: 'wildlife',
      days: 6, price: 2950, single: 400, rating: 4.9, reviews: 131, group: 12, level: 'Easy', badge: 'Winter trip',
      months: [1, 2, 3, 11, 12], scene: 'fjord', time: 'night',
      summary: 'Chase the northern lights away from the city glow, watch whales in the fjords and mush your own husky team.',
      highlights: ['Three nights of aurora hunting', 'Husky sledding in the Lyngen Alps', 'Whale safari by small boat'],
      includes: ['Thermal suits and boots', 'Husky and whale safaris'],
      excludes: ['Snowmobile option ($240)'],
      stops: [[30, 60, 'Tromsø'], [48, 40, 'Kvaløya'], [70, 50, 'Lyngen Alps'], [58, 74, 'Ersfjord']],
      itinerary: [
        { d: '1', t: 'Tromsø', x: 'Arrive, collect thermal gear, and take the cable car up Fjellheisen at dusk.', stay: 'Clarion The Edge, Tromsø' },
        { d: '2', t: 'Whales in the fjords', x: 'A small-boat safari looking for orca and humpbacks following the herring.', stay: 'Clarion The Edge, Tromsø' },
        { d: '3–4', t: 'Lyngen Alps', x: 'Drive to a wilderness lodge with glass-roofed cabins, mush huskies by day and watch the sky by night.', stay: 'Lyngen Lodge' },
        { d: '5', t: 'Sami reindeer camp', x: 'Feed the herd, eat bidos stew in a lavvu tent and hear joik songs by the fire.', stay: 'Clarion The Edge, Tromsø' },
        { d: '6', t: 'Departure', x: 'Transfers to Tromsø airport.', stay: '' }
      ]
    },
    {
      id: 'cyclades-sail', name: 'Cyclades Island Sail', region: 'aegean', country: 'Greece', style: 'coast',
      days: 8, price: 2590, single: 490, rating: 4.8, reviews: 143, group: 10, level: 'Easy',
      months: [5, 6, 7, 8, 9, 10], scene: 'coast', time: 'day', featured: 4,
      summary: 'A week on a wooden caïque between quiet Cycladic islands, swimming off the boat in coves no ferry reaches.',
      highlights: ['Sleep aboard a traditional caïque', 'Swim stops twice a day', 'Village tavernas on Sifnos and Milos'],
      includes: ['Skipper, cook and boat fuel', 'Snorkel gear'],
      excludes: ['Harbor dinners ashore'],
      stops: [[20, 30, 'Athens'], [44, 52, 'Kythnos'], [56, 64, 'Sifnos'], [42, 78, 'Milos'], [70, 72, 'Folegandros']],
      itinerary: [
        { d: '1', t: 'Lavrio harbor', x: 'Board the caïque Agia Eleni, meet captain Nikos and sail at sunset to Kea.', stay: 'On board' },
        { d: '2', t: 'Kythnos', x: 'The sandbar beach of Kolona and hot springs at Loutra.', stay: 'On board' },
        { d: '3–4', t: 'Sifnos', x: 'Pottery villages, a walk to the cliff chapel of Chrysopigi and the best chickpea stew in Greece.', stay: 'On board' },
        { d: '5–6', t: 'Milos', x: 'The white rocks of Sarakiniko, sea caves of Kleftiko and a sunset in Plaka.', stay: 'On board' },
        { d: '7', t: 'Folegandros', x: 'Cliff-top Chora, a last swim and a farewell dinner ashore.', stay: 'On board' },
        { d: '8', t: 'Ferry back', x: 'Morning ferry to Piraeus and transfers to Athens airport.', stay: '' }
      ]
    },
    {
      id: 'lycian-way', name: 'The Lycian Way', region: 'aegean', country: 'Turkey', style: 'hiking',
      days: 9, price: 2290, single: 300, rating: 4.7, reviews: 64, group: 12, level: 'Moderate',
      months: [3, 4, 5, 10, 11], scene: 'coast', time: 'dusk',
      summary: 'The best stretches of Turkey’s coastal path: pine forest, Lycian tombs and turquoise coves, with your bags sent ahead.',
      highlights: ['Six days on the coastal path', 'Swims in Butterfly Valley', 'Sunken city of Kekova by boat'],
      includes: ['Luggage transfers every day', 'Kekova boat trip'],
      excludes: [],
      stops: [[18, 40, 'Fethiye'], [30, 58, 'Faralya'], [48, 72, 'Kalkan'], [64, 62, 'Kaş'], [82, 70, 'Kekova']],
      itinerary: [
        { d: '1', t: 'Fethiye', x: 'Arrive and meet the group by the harbor.', stay: 'Yacht Classic, Fethiye' },
        { d: '2–3', t: 'Ölüdeniz to Faralya', x: 'Climb above the lagoon and walk the cliffs to the village above Butterfly Valley.', stay: 'George House, Faralya' },
        { d: '4–5', t: 'Kabak and Patara', x: 'Pine forest, a ruined Lycian city and seven miles of empty beach.', stay: 'Patara Viewpoint' },
        { d: '6–7', t: 'Kalkan to Kaş', x: 'Coastal path past rock tombs to the old town of Kaş.', stay: 'Hideaway Hotel, Kaş' },
        { d: '8', t: 'Kekova by boat', x: 'Swim over the sunken city and walk up to Simena castle.', stay: 'Hideaway Hotel, Kaş' },
        { d: '9', t: 'Departure', x: 'Transfers to Dalaman airport.', stay: '' }
      ]
    },
    {
      id: 'kumano-kodo', name: 'Kyoto & the Kumano Kodo', region: 'japan', country: 'Japan', style: 'hiking',
      days: 11, price: 5190, single: 650, rating: 4.9, reviews: 88, group: 12, level: 'Moderate',
      months: [3, 4, 5, 10, 11], scene: 'fuji', time: 'dawn',
      summary: 'Temples and tea houses in Kyoto, then four days on the ancient pilgrim trail through cedar forests to Hongū.',
      highlights: ['Four days on the Kumano Kodo', 'Onsen ryokan every night on the trail', 'Dawn at Fushimi Inari'],
      includes: ['Rail passes between cities', 'Luggage forwarding on the trail'],
      excludes: ['Two dinners in Kyoto'],
      stops: [[70, 22, 'Kyoto'], [62, 40, 'Nara'], [46, 70, 'Takijiri'], [34, 58, 'Chikatsuyu'], [24, 48, 'Hongū']],
      itinerary: [
        { d: '1–3', t: 'Kyoto', x: 'Fushimi Inari before the crowds, a tea ceremony in Uji and an evening in Gion.', stay: 'Hotel Kanra, Kyoto' },
        { d: '4', t: 'Nara', x: 'The great Buddha of Todai-ji and the deer park, then on to Tanabe.', stay: 'Tanabe Ryokan' },
        { d: '5–8', t: 'The Kumano Kodo', x: 'Four days on the Nakahechi route through cedar forest, tea houses and mountain villages.', stay: 'Minshuku and onsen ryokan' },
        { d: '9', t: 'Kumano Hongū Taisha', x: 'The great shrine, the river bath at Kawayu and a farewell kaiseki dinner.', stay: 'Adumaya Ryokan' },
        { d: '10', t: 'Osaka', x: 'Train to Osaka for a last night of street food in Dotonbori.', stay: 'Hotel Noum, Osaka' },
        { d: '11', t: 'Departure', x: 'Transfers to Kansai airport.', stay: '' }
      ]
    },
    {
      id: 'japan-table', name: 'Japan, Street to Ryokan', region: 'japan', country: 'Japan', style: 'culture',
      days: 13, price: 5790, single: 760, rating: 4.8, reviews: 102, group: 12, level: 'Easy', badge: 'New',
      months: [3, 4, 5, 9, 10, 11], scene: 'fuji', time: 'dusk',
      summary: 'Tokyo’s alleys, Hakone’s hot springs, Kanazawa’s markets and Kyoto’s kitchens, by bullet train.',
      highlights: ['Izakaya night with a Tokyo local', 'Ryokan with a view of Mount Fuji', 'Omicho market breakfast in Kanazawa'],
      includes: ['Seven-day Japan Rail Pass', 'Sushi and soba classes'],
      excludes: ['Lunches in the cities'],
      stops: [[82, 46, 'Tokyo'], [70, 62, 'Hakone'], [46, 22, 'Kanazawa'], [38, 50, 'Kyoto'], [28, 60, 'Osaka']],
      itinerary: [
        { d: '1–3', t: 'Tokyo', x: 'Tsukiji outer market, Yanaka’s old streets and a night of yakitori under the train tracks.', stay: 'Hotel Ryumeikan, Tokyo' },
        { d: '4–5', t: 'Hakone', x: 'Lake Ashi by boat and a ryokan with an outdoor bath facing Fuji.', stay: 'Gora Kadan, Hakone' },
        { d: '6–8', t: 'Kanazawa', x: 'The Kenroku-en garden, geisha district and a gold-leaf workshop.', stay: 'Hotel Sanraku, Kanazawa' },
        { d: '9–12', t: 'Kyoto and Osaka', x: 'Nishiki market, a soba class, Arashiyama at dawn and Osaka’s street food.', stay: 'Hotel Kanra, Kyoto' },
        { d: '13', t: 'Departure', x: 'Transfers to Kansai airport.', stay: '' }
      ]
    },
    {
      id: 'serengeti-migration', name: 'Serengeti Migration Safari', region: 'africa', country: 'Tanzania', style: 'wildlife',
      days: 10, price: 6190, single: 730, rating: 4.9, reviews: 69, group: 8, level: 'Easy', badge: 'Groups of 8',
      months: [1, 2, 6, 7, 8, 9, 10], scene: 'savannah', time: 'dusk',
      summary: 'Follow the great migration across the Serengeti in open-roof vehicles, with nights in small tented camps.',
      highlights: ['Five game drives in the Serengeti', 'A day in the Ngorongoro Crater', 'Walking safari with Maasai guides'],
      includes: ['Park fees and game drives', 'All meals on safari'],
      excludes: ['Balloon flight ($700)'],
      stops: [[22, 70, 'Arusha'], [40, 54, 'Tarangire'], [52, 46, 'Ngorongoro'], [70, 28, 'Serengeti']],
      itinerary: [
        { d: '1', t: 'Arusha', x: 'Arrive at Kilimanjaro airport and settle in at a coffee farm lodge.', stay: 'Arusha Coffee Lodge' },
        { d: '2–3', t: 'Tarangire', x: 'Baobab trees and the biggest elephant herds in Tanzania.', stay: 'Tarangire tented camp' },
        { d: '4', t: 'Ngorongoro Crater', x: 'Down into the crater at dawn to look for black rhino and lions.', stay: 'Crater rim lodge' },
        { d: '5–8', t: 'The Serengeti', x: 'Four days following the herds, with the camp moved to where the migration is.', stay: 'Mobile tented camp' },
        { d: '9', t: 'Walking with the Maasai', x: 'A morning on foot with Maasai guides and a fly-back to Arusha.', stay: 'Arusha Coffee Lodge' },
        { d: '10', t: 'Departure', x: 'Transfers to Kilimanjaro airport.', stay: '' }
      ]
    },
    {
      id: 'zanzibar-spice', name: 'Kilimanjaro Views & Zanzibar', region: 'africa', country: 'Tanzania', style: 'coast',
      days: 14, price: 5390, single: 610, rating: 4.7, reviews: 41, group: 12, level: 'Easy',
      months: [1, 2, 6, 7, 8, 9, 10, 12], scene: 'savannah', time: 'day',
      summary: 'Village walks under Kilimanjaro, a short safari, then a slow week on Zanzibar’s spice farms and white beaches.',
      highlights: ['Coffee and banana farm walk on Kilimanjaro’s slopes', 'Spice tour and Stone Town food market', 'Dhow sail at sunset'],
      includes: ['Flight to Zanzibar', 'Two game drives'],
      excludes: ['Diving (from $80 a dive)'],
      stops: [[24, 30, 'Moshi'], [34, 50, 'Arusha'], [48, 62, 'Tarangire'], [76, 74, 'Stone Town'], [86, 60, 'Matemwe']],
      itinerary: [
        { d: '1–3', t: 'Under Kilimanjaro', x: 'Coffee farm walks, a waterfall swim and a Chagga family lunch near Moshi.', stay: 'Kaliwa Lodge, Moshi' },
        { d: '4–5', t: 'Tarangire safari', x: 'Two game drives among baobabs and elephants.', stay: 'Tarangire tented camp' },
        { d: '6–8', t: 'Stone Town', x: 'Fly to Zanzibar. Carved doors, the spice farms and the Forodhani night market.', stay: 'Emerson Spice, Stone Town' },
        { d: '9–13', t: 'Matemwe beach', x: 'Slow days on the east coast: snorkeling, a dhow sail and the seaweed farms at low tide.', stay: 'Matemwe Lodge' },
        { d: '14', t: 'Departure', x: 'Transfers to Zanzibar airport.', stay: '' }
      ]
    }
  ];

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function byId(list, id) { return list.filter(function (x) { return x.id === id; })[0] || null; }
  function findTour(id) { return byId(TOURS, String(id || '').toLowerCase()); }
  function findRegion(id) { return byId(REGIONS, String(id || '').toLowerCase()); }
  function plural(n, one, many) { return n + ' ' + (n === 1 ? one : many); }
  function durationOf(days) { return DURATIONS.filter(function (d) { return days >= d.min && days <= d.max; })[0]; }
  function styleLabel(id) { var s = byId(STYLES, id); return s ? s.label : ''; }
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Dates are ISO strings (YYYY-MM-DD) handled in UTC, so they never drift with time zones.
  function toISO(d) { return d.toISOString().slice(0, 10); }
  function parseISO(s) {
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
    var p = s.split('-').map(Number);
    var d = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    return d.getUTCMonth() === p[1] - 1 ? d : null;
  }
  function todayUTC() { var n = new Date(); return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate())); }
  function addDays(d, n) { var c = new Date(d.getTime()); c.setUTCDate(c.getUTCDate() + n); return c; }
  var fmtShort = new Intl.DateTimeFormat('en-US', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' });
  var fmtLong = new Intl.DateTimeFormat('en-US', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

  // A small, stable hash so demo availability is the same on every visit.
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  var toastEl = $('#toast');
  var toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-visible'); }, 2800);
  }

  var STAR = '<svg viewBox="0 0 20 20" class="h-4 w-4 fill-current" aria-hidden="true"><path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L10 14.8l-5.2 2.8 1-5.8L1.5 7.7l5.9-.8z"/></svg>';
  function stars(rating) {
    var out = '';
    for (var i = 1; i <= 5; i++) out += i <= Math.round(rating) ? STAR : STAR.replace('fill-current', 'fill-current opacity-25');
    return '<span class="inline-flex text-sun-deep" role="img" aria-label="Rated ' + rating + ' out of 5">' + out + '</span>';
  }

  /* ------------------------------------------------------------------
   * 3. Art: illustrated landscapes stand in for photos.
   *    art(scene, time) returns an SVG string. Scenes: dunes, mountains,
   *    fjord, coast, fuji, savannah. Times: dawn, day, dusk, night.
   *    Any element with data-art="<scene>" data-time="<time>" is filled.
   * ------------------------------------------------------------------ */
  var SKIES = {
    dawn:  { top: '#f7b9a0', bottom: '#fde6c4', sun: '#fff1d6', glow: '#ffd2a8' },
    day:   { top: '#8ccfd0', bottom: '#eaf4e6', sun: '#ffd36b', glow: '#fff3c4' },
    dusk:  { top: '#e2603f', bottom: '#f9b867', sun: '#fff0c8', glow: '#ffc98a' },
    night: { top: '#0c2236', bottom: '#1c4b5c', sun: '#f4efd8', glow: '#2c6a72' }
  };
  // Layer colors per scene and time, from the farthest to the nearest.
  var LAYERS = {
    dunes:     { dawn: ['#f1b48d', '#e2925f', '#c8703f', '#a3532d'], day: ['#f4ce8f', '#eab067', '#d98f46', '#bd7031'],
                 dusk: ['#ee9a5e', '#d8733d', '#b5532a', '#7f3519'], night: ['#3b5a6b', '#2e4a5a', '#223a48', '#172b37'] },
    mountains: { dawn: ['#d9a3a3', '#b4727c', '#7f4b5e', '#4d2f40'], day: ['#a9c9c4', '#6d9f97', '#3f7369', '#244c45'],
                 dusk: ['#e6936a', '#b9583a', '#7d3424', '#4a1d15'], night: ['#365a6c', '#27485a', '#1a3646', '#102633'] },
    fjord:     { dawn: ['#c99aa0', '#946873', '#5f4352', '#3a2a36'], day: ['#8fb3b5', '#58868a', '#2f5d62', '#1c3f44'],
                 dusk: ['#dd8d6a', '#a9563f', '#6e3428', '#401d17'], night: ['#2f5566', '#21424f', '#163240', '#0d222d'] },
    coast:     { dawn: ['#e7b4a2', '#f6eee2', '#d9a487', '#5f8f8b'], day: ['#9cc8bd', '#fbf6ec', '#e8c9a0', '#2f8c92'],
                 dusk: ['#e79a73', '#fbe7d1', '#d48a5f', '#2f6f78'], night: ['#36596a', '#cfd8d4', '#4c6670', '#173947'] },
    fuji:      { dawn: ['#b7a3c4', '#8f7ea6', '#5d5677', '#3a3550'], day: ['#9bbad0', '#6f93ad', '#3f6680', '#26455a'],
                 dusk: ['#b07a8f', '#7e5571', '#553a55', '#33233a'], night: ['#30506a', '#223f56', '#172f43', '#0e2131'] },
    savannah:  { dawn: ['#e8b98f', '#d7a16a', '#b98446', '#7c5528'], day: ['#e9d08e', '#d9b664', '#b99242', '#7f6328'],
                 dusk: ['#eb9b5e', '#cf7b3f', '#a65a2a', '#5e3214'], night: ['#3d5866', '#2f4855', '#223845', '#162833'] }
  };
  var artCount = 0;

  function skyDefs(id, sky) {
    return '<defs><linearGradient id="' + id + 's" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + sky.top + '"/><stop offset="1" stop-color="' + sky.bottom + '"/></linearGradient>' +
      '<radialGradient id="' + id + 'g"><stop offset="0" stop-color="' + sky.glow + '" stop-opacity=".9"/><stop offset="1" stop-color="' + sky.glow + '" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="1200" height="800" fill="url(#' + id + 's)"/>';
  }
  function sunAt(id, sky, x, y, r, time) {
    var out = '<circle cx="' + x + '" cy="' + y + '" r="' + (r * 2.6) + '" fill="url(#' + id + 'g)"/>';
    out += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="' + sky.sun + '"/>';
    if (time === 'night') {
      out += '<circle cx="' + (x + r * 0.42) + '" cy="' + (y - r * 0.2) + '" r="' + (r * 0.9) + '" fill="' + sky.top + '" opacity=".92"/>';
      var stars = [[120, 90], [260, 160], [380, 70], [520, 140], [660, 60], [940, 110], [1060, 70], [1120, 190], [210, 260], [820, 210], [470, 230], [1000, 260]];
      stars.forEach(function (s, i) { out += '<circle cx="' + s[0] + '" cy="' + s[1] + '" r="' + (i % 3 ? 2 : 3) + '" fill="#fff9ef" opacity="' + (i % 2 ? '.6' : '.9') + '"/>'; });
    }
    return out;
  }
  function birds(x, y, c) {
    return '<g fill="none" stroke="' + c + '" stroke-width="4" stroke-linecap="round" opacity=".7">' +
      '<path d="M' + x + ' ' + y + 'q14-14 28 0q14-14 28 0"/><path d="M' + (x + 80) + ' ' + (y - 34) + 'q10-10 20 0q10-10 20 0"/><path d="M' + (x + 46) + ' ' + (y + 30) + 'q8-8 16 0q8-8 16 0"/></g>';
  }

  var SCENES = {
    dunes: function (id, sky, c, time) {
      return sunAt(id, sky, 780, 340, 120, time) + birds(300, 230, c[3]) +
        '<path d="M0 470C190 400 380 420 560 468S900 410 1200 448V800H0Z" fill="' + c[0] + '"/>' +
        '<path d="M0 560C170 498 350 512 520 576C690 640 900 512 1200 552V800H0Z" fill="' + c[1] + '"/>' +
        '<path d="M520 576C690 640 900 512 1200 552V800H760C700 700 610 620 520 576Z" fill="' + c[2] + '" opacity=".55"/>' +
        '<g fill="' + c[3] + '"><path d="M770 541c4-14 14-20 22-12 5-9 15-9 18 0l8-7 6 2-6 10v20h-4v-16h-22v16h-4v-20c-8 3-17 2-24 7z"/><path d="M842 532c4-14 14-20 22-12 5-9 15-9 18 0l8-7 6 2-6 10v20h-4v-16h-22v16h-4v-20c-8 3-17 2-24 7z"/><path d="M914 528c4-14 14-20 22-12 5-9 15-9 18 0l8-7 6 2-6 10v20h-4v-16h-22v16h-4v-20c-8 3-17 2-24 7z"/></g>' +
        '<path d="M0 660C240 600 430 700 700 680C900 666 1040 616 1200 640V800H0Z" fill="' + c[3] + '"/>' +
        '<path d="M0 660C240 600 430 700 700 680" fill="none" stroke="#fff3dc" stroke-opacity=".35" stroke-width="5"/>';
    },
    mountains: function (id, sky, c, time) {
      return sunAt(id, sky, 860, 250, 90, time) + birds(220, 200, c[3]) +
        '<path d="M0 470L130 350L210 410L360 230L470 360L560 300L700 170L840 340L930 280L1080 380L1200 320V800H0Z" fill="' + c[0] + '"/>' +
        '<path d="M330 262L360 230L392 270L372 262L352 284ZM664 214L700 170L740 222L716 214L698 238L682 216Z" fill="#fff9ef" opacity=".9"/>' +
        '<path d="M0 560L170 430L300 520L450 400L620 540L760 430L920 540L1060 450L1200 520V800H0Z" fill="' + c[1] + '"/>' +
        '<path d="M0 650C200 580 360 600 520 640S860 580 1200 620V800H0Z" fill="' + c[2] + '"/>' +
        '<g fill="none" stroke="' + c[1] + '" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"><path d="M80 682C260 640 400 660 560 688"/><path d="M60 720C260 680 420 700 620 728"/><path d="M700 690C860 660 1000 650 1160 664"/></g>' +
        '<path d="M0 760C260 720 520 740 760 750S1060 730 1200 740V800H0Z" fill="' + c[3] + '"/>';
    },
    fjord: function (id, sky, c, time) {
      var aurora = time === 'night'
        ? '<g opacity=".7" fill="none" stroke-linecap="round"><path d="M80 260C300 120 520 300 760 160S1080 120 1180 60" stroke="#62d6a8" stroke-width="34" opacity=".45"/><path d="M60 320C320 200 520 340 800 230S1060 200 1180 140" stroke="#8ee6c4" stroke-width="16" opacity=".5"/></g>'
        : '';
      return aurora + sunAt(id, sky, 620, time === 'night' ? 140 : 300, time === 'night' ? 46 : 80, time) +
        '<path d="M0 230L120 260L230 380L330 470L420 520L470 560H0Z" fill="' + c[1] + '"/>' +
        '<path d="M1200 210L1080 250L960 360L860 460L770 520L720 560H1200Z" fill="' + c[1] + '"/>' +
        '<path d="M380 560L520 470L600 500L660 460L780 560Z" fill="' + c[0] + '"/>' +
        '<rect y="560" width="1200" height="240" fill="' + c[2] + '"/>' +
        '<g stroke="' + sky.sun + '" stroke-opacity=".45" stroke-width="5" stroke-linecap="round"><path d="M560 600H680"/><path d="M520 640H720"/><path d="M580 690H660"/></g>' +
        '<path d="M0 520L160 540L260 600L330 660L360 800H0Z" fill="' + c[3] + '"/>' +
        '<path d="M1200 500L1050 540L960 620L920 700L900 800H1200Z" fill="' + c[3] + '"/>' +
        '<g><path d="M140 560l34-26 34 26v34h-68z" fill="#b8402a"/><path d="M134 562l40-32 40 32" fill="none" stroke="#fff9ef" stroke-width="4"/><rect x="164" y="572" width="16" height="22" fill="#fff3dc"/>' +
        '<path d="M222 586l26-20 26 20v26h-52z" fill="#c9553a"/><rect x="242" y="594" width="12" height="18" fill="#fff3dc"/></g>' +
        '<path d="M120 594h170v10H120z" fill="' + c[3] + '"/><path d="M118 604v40M160 604v40M200 604v40M240 604v40M282 604v40" stroke="' + c[3] + '" stroke-width="6"/>';
    },
    coast: function (id, sky, c, time) {
      var houses = '';
      var hx = [[700, 470, 54, 40], [764, 452, 48, 46], [826, 480, 60, 34], [650, 506, 50, 36], [892, 500, 46, 40], [716, 520, 58, 34], [790, 506, 44, 38], [600, 540, 54, 30], [850, 540, 50, 30]];
      hx.forEach(function (h) {
        houses += '<rect x="' + h[0] + '" y="' + h[1] + '" width="' + h[2] + '" height="' + h[3] + '" fill="' + c[1] + '"/>' +
          '<rect x="' + (h[0] + h[2] * 0.36) + '" y="' + (h[1] + h[3] * 0.4) + '" width="' + Math.max(8, h[2] * 0.2) + '" height="' + (h[3] * 0.45) + '" fill="' + c[3] + '" opacity=".8"/>';
      });
      return sunAt(id, sky, 300, 250, 86, time) + birds(520, 180, c[3]) +
        '<path d="M0 520C120 500 240 510 360 524V560H0Z" fill="' + c[0] + '"/>' +
        '<rect y="540" width="1200" height="260" fill="' + c[3] + '"/>' +
        '<path d="M520 570C600 470 680 420 800 410C920 404 1020 470 1200 470V620H520Z" fill="' + c[2] + '"/>' +
        houses +
        '<path d="M774 418a26 26 0 0 1 52 0z" fill="#2f6fa3"/><rect x="774" y="418" width="52" height="34" fill="' + c[1] + '"/><path d="M800 380v14" stroke="' + c[1] + '" stroke-width="5"/>' +
        '<path d="M520 618C640 604 760 626 880 612S1100 600 1200 606" fill="none" stroke="#fff9ef" stroke-opacity=".6" stroke-width="6" stroke-linecap="round"/>' +
        '<path d="M760 800C820 730 960 700 1200 690V800Z" fill="' + c[2] + '"/>' +
        '<path d="M760 800C820 730 960 700 1200 690" fill="none" stroke="#fff9ef" stroke-opacity=".7" stroke-width="7" stroke-linecap="round"/>' +
        '<g fill="none" stroke="#fff9ef" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"><path d="M60 620q30-14 60 0t60 0"/><path d="M240 680q30-14 60 0t60 0"/><path d="M90 740q30-14 60 0t60 0"/></g>' +
        '<g><path d="M300 600h120l-16 22h-90z" fill="#7a3a22"/><path d="M356 596V470l56 120z" fill="#fff9ef"/><path d="M350 596V492l-44 100z" fill="#f4a62a"/></g>';
    },
    fuji: function (id, sky, c, time) {
      var blossoms = '';
      [[130, 520], [170, 490], [210, 530], [90, 556], [150, 560], [240, 500], [196, 470]].forEach(function (b, i) {
        blossoms += '<circle cx="' + b[0] + '" cy="' + b[1] + '" r="' + (30 + (i % 3) * 8) + '" fill="' + (i % 2 ? '#f6b7c0' : '#f29cab') + '"/>';
      });
      return sunAt(id, sky, 900, 220, 70, time) + birds(380, 170, c[3]) +
        '<path d="M250 600L540 260C566 232 594 232 620 260L920 600Z" fill="' + c[0] + '"/>' +
        '<path d="M500 307L540 260C566 232 594 232 620 260L660 307L626 296L604 322L580 298L556 324L532 298Z" fill="#fff9ef"/>' +
        '<path d="M0 600C160 520 300 560 440 600S760 540 940 580 1140 560 1200 570V800H0Z" fill="' + c[1] + '"/>' +
        '<path d="M0 680C200 640 420 660 640 690S1000 650 1200 670V800H0Z" fill="' + c[2] + '"/>' +
        '<g fill="' + c[3] + '"><rect x="960" y="470" width="12" height="190"/><path d="M930 470h170l-14 16H944z"/><path d="M944 500h142l-10 12H954z"/><path d="M916 520h198l-18 18H934z"/><path d="M932 560h166l-14 14H946z"/><path d="M944 600h142l-12 12H956z"/><rect x="1006" y="610" width="18" height="60"/><path d="M1013 430l2 40" stroke="' + c[3] + '" stroke-width="6"/></g>' +
        '<path d="M140 800V560" stroke="' + c[3] + '" stroke-width="18"/><path d="M140 620l-40-40M140 590l50-50" stroke="' + c[3] + '" stroke-width="9" stroke-linecap="round"/>' + blossoms +
        '<path d="M0 760C300 730 600 750 900 740S1200 750 1200 750V800H0Z" fill="' + c[3] + '"/>';
    },
    savannah: function (id, sky, c, time) {
      function acacia(x, y, s) {
        return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="' + c[3] + '"><path d="M-6 0l4-110h4l4 110z"/><path d="M-2-100l-60-50M2-104l50-56" stroke="' + c[3] + '" stroke-width="8" stroke-linecap="round"/><ellipse cx="0" cy="-158" rx="150" ry="28"/><ellipse cx="-70" cy="-140" rx="60" ry="18"/><ellipse cx="80" cy="-150" rx="70" ry="20"/></g>';
      }
      function giraffe(x, y, s) {
        return '<g transform="translate(' + x + ' ' + y + ') scale(' + s + ')" fill="' + c[3] + '"><path d="M0 0v-60l6-4 50-6 6 6v64h-6v-48h-46v48z"/><path d="M50-70l20-90 6-4 18 6-2 8-14-2-16 86z"/></g>';
      }
      return sunAt(id, sky, 640, 440, 150, time) + birds(260, 200, c[3]) +
        '<path d="M0 560C240 540 480 550 720 548S1080 540 1200 546V800H0Z" fill="' + c[0] + '"/>' +
        '<path d="M0 600C300 584 600 600 900 590S1140 594 1200 596V800H0Z" fill="' + c[1] + '"/>' +
        acacia(900, 600, 1.1) + acacia(240, 594, 0.7) + giraffe(430, 600, 0.9) + giraffe(520, 604, 0.75) +
        '<path d="M0 670C260 650 520 680 780 672S1100 650 1200 660V800H0Z" fill="' + c[2] + '"/>' +
        '<g stroke="' + c[3] + '" stroke-width="4" stroke-linecap="round" opacity=".6"><path d="M80 700v-24M96 702v-30M112 700v-20M960 708v-26M976 706v-34M992 708v-20M600 712v-22M614 712v-30"/></g>' +
        '<path d="M0 750C300 730 600 760 900 744S1200 740 1200 740V800H0Z" fill="' + c[3] + '"/>';
    }
  };

  function art(scene, time, label) {
    scene = SCENES[scene] ? scene : 'coast';
    time = SKIES[time] ? time : 'day';
    var id = 'w' + (++artCount) + scene.charAt(0);
    var sky = SKIES[time];
    var c = LAYERS[scene][time];
    var a11y = label ? 'role="img" aria-label="' + esc(label) + '"' : 'aria-hidden="true"';
    return '<svg viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice" class="h-full w-full" ' + a11y + ' focusable="false">' +
      skyDefs(id, sky) + SCENES[scene](id, sky, c, time) + '</svg>';
  }

  // Route map: a stylised land mass with numbered stops joined by a dashed route.
  function routeMap(tour) {
    var W = 800, H = 500;
    var pts = tour.stops.map(function (s) { return [s[0] / 100 * W, s[1] / 100 * H, s[2]]; });
    var d = 'M' + pts[0][0] + ' ' + pts[0][1];
    for (var i = 1; i < pts.length; i++) {
      var p = pts[i - 1], q = pts[i];
      var mx = (p[0] + q[0]) / 2, my = (p[1] + q[1]) / 2 - 26;
      d += ' Q' + mx + ' ' + my + ' ' + q[0] + ' ' + q[1];
    }
    var pins = pts.map(function (p, n) {
      var right = p[0] < W * 0.72;
      var tx = right ? p[0] + 26 : p[0] - 26;
      return '<g><circle cx="' + p[0] + '" cy="' + p[1] + '" r="17" fill="#b0431d" stroke="#fff9ef" stroke-width="4"/>' +
        '<text x="' + p[0] + '" y="' + (p[1] + 6) + '" text-anchor="middle" font-size="17" font-weight="700" fill="#fff9ef" font-family="Outfit, sans-serif">' + (n + 1) + '</text>' +
        '<text x="' + tx + '" y="' + (p[1] + 6) + '" text-anchor="' + (right ? 'start' : 'end') + '" font-size="24" font-weight="600" fill="#23180f" font-family="Outfit, sans-serif" paint-order="stroke" stroke="#f4e6cc" stroke-width="6" stroke-linejoin="round">' + esc(p[2]) + '</text></g>';
    }).join('');
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" class="h-full w-full" role="img" aria-label="Route map: ' + esc(tour.stops.map(function (s) { return s[2]; }).join(', ')) + '">' +
      '<defs><pattern id="map-waves" width="40" height="20" patternUnits="userSpaceOnUse"><path d="M0 10q10-8 20 0t20 0" fill="none" stroke="#5fb3a8" stroke-opacity=".35" stroke-width="2"/></pattern></defs>' +
      '<rect width="' + W + '" height="' + H + '" fill="#cfe7e0"/><rect width="' + W + '" height="' + H + '" fill="url(#map-waves)"/>' +
      '<path d="M40 70C140 20 300 40 420 30S660 10 760 70C800 140 770 220 790 300S770 450 680 480C560 500 420 470 300 486S90 480 50 400C20 320 60 260 30 190S10 100 40 70Z" fill="#f4e6cc" stroke="#e2cfae" stroke-width="3"/>' +
      '<g fill="none" stroke="#d9bf92" stroke-width="2" stroke-dasharray="2 8" stroke-linecap="round"><path d="M120 140C220 110 330 150 430 120S640 110 700 160"/><path d="M100 260C220 230 330 280 460 250S650 240 740 290"/><path d="M110 380C230 350 360 400 480 370S640 380 720 410"/></g>' +
      '<path d="' + d + '" fill="none" stroke="#0e5a5f" stroke-width="5" stroke-dasharray="2 12" stroke-linecap="round"/>' + pins +
      '<g transform="translate(726 92)"><circle r="34" fill="#fff9ef" stroke="#23180f" stroke-width="2"/><path d="M0-28L8 0 0 28-8 0Z" fill="#23180f"/><path d="M0-28L8 0H-8Z" fill="#b8461f"/><text y="-38" text-anchor="middle" font-size="15" font-weight="700" fill="#23180f" font-family="Outfit, sans-serif">N</text></g>' +
      '<text x="40" y="476" font-size="17" fill="#66523f" font-family="Outfit, sans-serif">Illustrative map, not to scale</text></svg>';
  }

  // Avatars for guides and travelers: data-avatar="skin,hair,style,background" (style: short, long, bun, curly, bald).
  function avatar(spec, label) {
    var p = String(spec || '').split(',');
    var skin = p[0] || '#c68a5e', hair = p[1] || '#2b1d14', style = p[2] || 'short', bg = p[3] || '#f4a62a';
    var hairShape = {
      short: '<path d="M30 46c0-22 14-32 30-32s30 10 30 32c-6-10-16-14-30-14s-24 4-30 14z" fill="' + hair + '"/>',
      long: '<path d="M26 92V48c0-24 16-34 34-34s34 10 34 34v44H82V52c-6-10-12-14-22-14s-16 4-22 14v40z" fill="' + hair + '"/>',
      bun: '<circle cx="60" cy="14" r="11" fill="' + hair + '"/><path d="M30 48c0-22 14-32 30-32s30 10 30 32c-8-12-18-16-30-16s-22 4-30 16z" fill="' + hair + '"/>',
      curly: '<g fill="' + hair + '"><circle cx="36" cy="38" r="12"/><circle cx="50" cy="26" r="13"/><circle cx="68" cy="25" r="13"/><circle cx="84" cy="37" r="12"/><circle cx="60" cy="34" r="12"/></g>',
      bald: ''
    }[style] || '';
    var a11y = label ? 'role="img" aria-label="' + esc(label) + '"' : 'aria-hidden="true"';
    return '<svg viewBox="0 0 120 120" class="h-full w-full" ' + a11y + ' focusable="false"><rect width="120" height="120" fill="' + bg + '"/>' +
      '<path d="M18 120c4-24 22-36 42-36s38 12 42 36z" fill="#0e5a5f"/><path d="M50 82h20v12a10 10 0 0 1-20 0z" fill="' + skin + '"/>' +
      '<ellipse cx="60" cy="54" rx="26" ry="30" fill="' + skin + '"/>' + hairShape +
      '<circle cx="50" cy="56" r="3" fill="#23180f"/><circle cx="70" cy="56" r="3" fill="#23180f"/><path d="M52 70q8 6 16 0" fill="none" stroke="#23180f" stroke-width="3" stroke-linecap="round"/></svg>';
  }

  function paintArt(root) {
    $$('[data-art]', root).forEach(function (el) {
      if (el.firstElementChild) return;
      el.innerHTML = art(el.getAttribute('data-art'), el.getAttribute('data-time'), el.getAttribute('data-label'));
    });
    $$('[data-avatar]', root).forEach(function (el) {
      if (el.firstElementChild) return;
      el.innerHTML = avatar(el.getAttribute('data-avatar'), el.getAttribute('data-label'));
    });
  }

  /* ------------------------------------------------------------------
   * 4. Departures and prices (demo data, worked out from each tour)
   * ------------------------------------------------------------------ */
  function departures(tour, limit) {
    var region = findRegion(tour.region);
    var cutoff = addDays(todayUTC(), BOOKING_CUTOFF);
    var out = [];
    var y = cutoff.getUTCFullYear(), m0 = cutoff.getUTCMonth();
    for (var i = 0; i < 15 && out.length < (limit || 8); i++) {
      var m = (m0 + i) % 12, yy = y + Math.floor((m0 + i) / 12);
      if (tour.months.indexOf(m + 1) < 0) continue;
      for (var k = 0; k < DEPARTURE_DAYS.length && out.length < (limit || 8); k++) {
        var d = new Date(Date.UTC(yy, m, DEPARTURE_DAYS[k]));
        d = addDays(d, (6 - d.getUTCDay() + 7) % 7);            // the next Saturday
        if (d < cutoff) continue;
        var iso = toISO(d);
        var h = hash(tour.id + iso) % 10;
        var left = h === 0 ? 0 : h <= 2 ? h + 1 : Math.min(tour.group, 3 + (hash(iso + tour.id) % (tour.group - 2)));
        var peak = region && region.season[m] === 3;
        out.push({
          start: iso, end: toISO(addDays(d, tour.days - 1)), month: m + 1,
          price: tour.price + (peak ? PEAK_SUPPLEMENT : 0), peak: peak,
          left: left, guaranteed: tour.group - left >= 4
        });
      }
    }
    return out;
  }
  function departureLabel(dep) {
    var s = parseISO(dep.start), e = parseISO(dep.end);
    return fmtShort.format(s) + ' – ' + fmtLong.format(e);
  }
  function availability(dep) {
    if (dep.left === 0) return { text: 'Full', cls: 'badge-full' };
    if (dep.left <= 3) return { text: 'Only ' + dep.left + ' left', cls: 'badge-low' };
    if (dep.guaranteed) return { text: 'Guaranteed', cls: 'badge-ok' };
    return { text: dep.left + ' places', cls: 'badge-open' };
  }
  // The live price for an inquiry. room: 'share' or 'own'.
  function quote(tour, dep, travellers, room) {
    var n = Math.max(1, Math.min(MAX_TRAVELLERS, travellers | 0));
    var base = dep.price * n;
    var supplement = room === 'own' ? tour.single * n : 0;
    return { travellers: n, perPerson: dep.price, base: base, supplement: supplement, total: base + supplement, deposit: DEPOSIT * n };
  }

  /* ------------------------------------------------------------------
   * 5. Tour cards
   * ------------------------------------------------------------------ */
  function tourCard(t, opts) {
    opts = opts || {};
    var region = findRegion(t.region);
    var href = 'tour.html?id=' + t.id + (opts.month ? '&month=' + opts.month : '');
    var heading = opts.heading || 'h3';
    return '<article class="tour-card group reveal">' +
      '<div class="relative">' +
        '<a href="' + href + '" class="art-frame block aspect-[4/3] rounded-[1.75rem]" tabindex="-1" aria-hidden="true">' + art(t.scene, t.time) + '</a>' +
        (t.badge ? '<span class="absolute left-4 top-4 rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink shadow-sm">' + esc(t.badge) + '</span>' : '') +
        '<span class="stamp absolute -bottom-5 right-5 rotate-3"><span class="stamp-inner"><span class="block font-display text-2xl leading-none">' + t.days + '</span><span class="mt-0.5 block text-[0.6rem] font-semibold uppercase tracking-[0.18em]">days</span></span></span>' +
      '</div>' +
      '<div class="flex flex-1 flex-col px-1 pt-6">' +
        '<p class="text-xs font-semibold uppercase tracking-[0.2em] text-clay">' + esc(t.country) + ' · ' + esc(styleLabel(t.style)) + '</p>' +
        '<' + heading + ' class="mt-2 font-display text-2xl leading-tight text-ink"><a href="' + href + '" class="tour-link">' + esc(t.name) + '</a></' + heading + '>' +
        '<p class="mt-2 text-[0.95rem] leading-relaxed text-muted">' + esc(t.summary) + '</p>' +
        '<div class="mt-auto flex items-end justify-between gap-4 pt-5">' +
          '<div class="text-sm text-muted"><span class="flex items-center gap-2">' + stars(t.rating) + '<span><span class="font-semibold text-ink">' + t.rating.toFixed(1) + '</span> (' + t.reviews + ')</span></span>' +
          '<span class="mt-1 block">Activity: ' + esc(t.level) + '</span></div>' +
          '<p class="shrink-0 text-right text-sm text-muted">from<span class="block font-display text-2xl leading-none text-ink">' + money(t.price) + '</span><span class="sr-only"> per person, ' + (region ? esc(region.label) : '') + '</span></p>' +
        '</div>' +
      '</div>' +
    '</article>';
  }

  function initFeatured() {
    var host = $('[data-featured-tours]');
    if (!host) return;
    var list = TOURS.filter(function (t) { return t.featured; }).sort(function (a, b) { return a.featured - b.featured; });
    host.innerHTML = list.map(function (t) { return tourCard(t); }).join('');
  }

  // data-tour-list="id,id" renders those tours (article and journal pages).
  function initTourLists() {
    $$('[data-tour-list]').forEach(function (host) {
      var ids = host.getAttribute('data-tour-list').split(',');
      host.innerHTML = ids.map(findTour).filter(Boolean).map(function (t) { return tourCard(t, { heading: host.getAttribute('data-heading') || 'h3' }); }).join('');
    });
  }

  // data-region-count="morocco" shows how many trips a region has.
  function initRegionCounts() {
    $$('[data-region-count]').forEach(function (el) {
      var n = TOURS.filter(function (t) { return t.region === el.getAttribute('data-region-count'); }).length;
      el.textContent = plural(n, 'trip', 'trips');
    });
  }

  /* ------------------------------------------------------------------
   * 6. Trip finder (home page): sends its choices to tours.html as URL params
   * ------------------------------------------------------------------ */
  function initFinder() {
    var form = $('#trip-finder');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var params = new URLSearchParams();
      ['region', 'month', 'style', 'duration'].forEach(function (name) {
        var v = form.elements[name] && form.elements[name].value;
        if (v) params.set(name, v);
      });
      var q = params.toString();
      window.location.href = 'tours.html' + (q ? '?' + q : '');
    });
  }

  /* ------------------------------------------------------------------
   * 7. Tours page: filters, sort, result count and URL
   *    tours.html?region=morocco,japan&style=hiking&duration=medium&month=5&max=4000&sort=price-asc
   * ------------------------------------------------------------------ */
  var SORTS = {
    recommended: function (a, b) { return (a.featured || 99) - (b.featured || 99) || b.rating - a.rating; },
    'price-asc': function (a, b) { return a.price - b.price; },
    'price-desc': function (a, b) { return b.price - a.price; },
    'days-asc': function (a, b) { return a.days - b.days || a.price - b.price; },
    rating: function (a, b) { return b.rating - a.rating || b.reviews - a.reviews; }
  };

  function readList(params, name, allowed) {
    var out = [];
    params.getAll(name).join(',').toLowerCase().split(',').forEach(function (v) {
      v = v.trim();
      if (allowed.indexOf(v) > -1 && out.indexOf(v) < 0) out.push(v);
    });
    return out;
  }
  function ids(list) { return list.map(function (x) { return x.id; }); }

  function readState(search) {
    var params = new URLSearchParams(search);
    var month = parseInt(params.get('month'), 10);
    var max = parseInt(params.get('max'), 10);
    var sort = (params.get('sort') || '').toLowerCase();
    return {
      region: readList(params, 'region', ids(REGIONS)),
      style: readList(params, 'style', ids(STYLES)),
      duration: readList(params, 'duration', ids(DURATIONS)),
      month: month >= 1 && month <= 12 ? month : 0,
      max: max >= PRICE_MIN && max < PRICE_MAX ? max : PRICE_MAX,
      sort: SORTS[sort] ? sort : 'recommended'
    };
  }
  function matches(t, s) {
    if (s.region.length && s.region.indexOf(t.region) < 0) return false;
    if (s.style.length && s.style.indexOf(t.style) < 0) return false;
    if (s.duration.length && s.duration.indexOf(durationOf(t.days).id) < 0) return false;
    if (s.month && t.months.indexOf(s.month) < 0) return false;
    if (t.price > s.max) return false;
    return true;
  }
  function filterTours(s) { return TOURS.filter(function (t) { return matches(t, s); }).sort(SORTS[s.sort]); }

  function initTours() {
    var form = $('#tour-filters');
    var grid = $('#tour-grid');
    if (!form || !grid) return;
    var count = $('#result-count');
    var empty = $('#tour-empty');
    var chips = $('#active-filters');
    var sortSel = $('#sort');
    var range = form.elements.max;
    var rangeOut = $('#max-output');
    var state = readState(window.location.search);

    function toForm() {
      $$('input[type="checkbox"]', form).forEach(function (cb) { cb.checked = (state[cb.name] || []).indexOf(cb.value) > -1; });
      form.elements.month.value = state.month ? String(state.month) : '';
      range.value = state.max;
      sortSel.value = state.sort;
    }
    function fromForm() {
      ['region', 'style', 'duration'].forEach(function (name) {
        state[name] = $$('input[name="' + name + '"]:checked', form).map(function (cb) { return cb.value; });
      });
      state.month = parseInt(form.elements.month.value, 10) || 0;
      state.max = parseInt(range.value, 10) || PRICE_MAX;
      state.sort = SORTS[sortSel.value] ? sortSel.value : 'recommended';
    }
    function writeURL() {
      var p = new URLSearchParams();
      ['region', 'style', 'duration'].forEach(function (n) { if (state[n].length) p.set(n, state[n].join(',')); });
      if (state.month) p.set('month', state.month);
      if (state.max < PRICE_MAX) p.set('max', state.max);
      if (state.sort !== 'recommended') p.set('sort', state.sort);
      var q = p.toString().replace(/%2C/g, ',');
      history.replaceState(null, '', window.location.pathname + (q ? '?' + q : '') + window.location.hash);
    }
    function label(group, id) {
      if (group === 'region') return findRegion(id).label;
      if (group === 'style') return styleLabel(id);
      return byId(DURATIONS, id).label;
    }
    function render() {
      var list = filterTours(state);
      grid.innerHTML = list.map(function (t) { return tourCard(t, { month: state.month, heading: 'h2' }); }).join('');
      paintArt(grid);
      revealNow(grid);
      count.textContent = list.length === TOURS.length && !hasFilters()
        ? 'Showing all ' + TOURS.length + ' trips'
        : plural(list.length, 'trip matches', 'trips match') + ' your filters';
      empty.hidden = list.length > 0;
      grid.hidden = list.length === 0;
      rangeOut.textContent = state.max >= PRICE_MAX ? 'Any price' : 'Up to ' + money(state.max);
      // Counts next to each option: how many trips you'd see if you checked it, given the other filters.
      $$('[data-count-for]', form).forEach(function (el) {
        var parts = el.getAttribute('data-count-for').split(':');
        var probe = JSON.parse(JSON.stringify(state));
        probe[parts[0]] = [parts[1]];
        el.textContent = TOURS.filter(function (t) { return matches(t, probe); }).length;
      });
      var html = '';
      ['region', 'style', 'duration'].forEach(function (g) {
        state[g].forEach(function (id) {
          html += '<li><button type="button" class="filter-chip" data-remove="' + g + ':' + id + '">' + esc(label(g, id)) + '<span class="sr-only">, remove filter</span><svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></li>';
        });
      });
      if (state.month) html += '<li><button type="button" class="filter-chip" data-remove="month">' + MONTHS[state.month - 1] + '<span class="sr-only">, remove filter</span><svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></li>';
      if (state.max < PRICE_MAX) html += '<li><button type="button" class="filter-chip" data-remove="max">Up to ' + money(state.max) + '<span class="sr-only">, remove filter</span><svg viewBox="0 0 24 24" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg></button></li>';
      chips.innerHTML = html;
      chips.parentElement.hidden = !html;
      var badge = $('#filter-count');
      var n = state.region.length + state.style.length + state.duration.length + (state.month ? 1 : 0) + (state.max < PRICE_MAX ? 1 : 0);
      if (badge) { badge.textContent = n; badge.hidden = !n; }
    }
    function hasFilters() { return state.region.length || state.style.length || state.duration.length || state.month || state.max < PRICE_MAX; }
    function reset() {
      state = readState('?sort=' + state.sort);
      toForm(); writeURL(); render();
    }

    form.addEventListener('change', function () { fromForm(); writeURL(); render(); });
    range.addEventListener('input', function () { fromForm(); render(); });
    form.addEventListener('submit', function (e) { e.preventDefault(); });
    sortSel.addEventListener('change', function () { fromForm(); writeURL(); render(); });
    chips.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-remove]');
      if (!btn) return;
      var parts = btn.getAttribute('data-remove').split(':');
      if (parts[0] === 'month') state.month = 0;
      else if (parts[0] === 'max') state.max = PRICE_MAX;
      else state[parts[0]] = state[parts[0]].filter(function (v) { return v !== parts[1]; });
      toForm(); writeURL(); render();
      var next = $('[data-remove]', chips);
      (next || $('#result-count')).focus();
    });
    $$('[data-reset-filters]').forEach(function (b) { b.addEventListener('click', function () { reset(); count.focus(); }); });

    var toggle = $('#filters-toggle');
    var panel = $('#filters-panel');
    if (toggle && panel) {
      toggle.addEventListener('click', function () {
        var open = toggle.getAttribute('aria-expanded') !== 'true';
        toggle.setAttribute('aria-expanded', String(open));
        panel.classList.toggle('max-lg:hidden', !open);
      });
    }

    toForm();
    writeURL();
    render();
  }

  /* ------------------------------------------------------------------
   * 8. Tour page: tour.html?id=atlas-sahara (&month=5 picks the first departure that month)
   * ------------------------------------------------------------------ */
  function initTourPage() {
    var root = $('[data-tour-page]');
    if (!root) return;
    var params = new URLSearchParams(window.location.search);
    var tour = findTour(params.get('id')) || TOURS[0];
    var region = findRegion(tour.region);
    var deps = departures(tour, 8);

    document.title = tour.name + ' — ' + plural(tour.days, 'day', 'days') + ' in ' + tour.country + ' | Saltwind Journeys';
    var meta = $('meta[name="description"]');
    if (meta) meta.setAttribute('content', tour.summary);

    function set(name, value) { $$('[data-tour="' + name + '"]').forEach(function (el) { el.textContent = value; }); }
    set('name', tour.name);
    set('summary', tour.summary);
    set('region', region.label);
    set('country', tour.country);
    set('days', plural(tour.days, 'day', 'days'));
    set('style', styleLabel(tour.style));
    set('level', tour.level);
    set('group', 'Max ' + tour.group);
    set('price', money(tour.price));
    set('rating', tour.rating.toFixed(1));
    set('reviews', tour.reviews + ' reviews');
    set('single', money(tour.single));
    set('deposit', money(DEPOSIT));
    $$('[data-tour-link="region"]').forEach(function (a) { a.href = 'tours.html?region=' + region.id; });
    $$('[data-tour-link="contact"]').forEach(function (a) { a.href = 'contact.html?tour=' + tour.id; });
    $$('[data-tour-stars]').forEach(function (el) { el.innerHTML = stars(tour.rating); });

    var hero = $('[data-tour-art]');
    if (hero) hero.innerHTML = art(tour.scene, tour.time, tour.name + ': illustrated landscape');
    var map = $('[data-tour-map]');
    if (map) map.innerHTML = routeMap(tour);
    var hl = $('[data-tour-highlights]');
    if (hl) hl.innerHTML = tour.highlights.map(function (h) {
      return '<li class="flex gap-3"><svg viewBox="0 0 24 24" class="mt-0.5 h-5 w-5 shrink-0 text-sun-deep" fill="currentColor" aria-hidden="true"><path d="M12 2l2.4 6.6L21 9l-5.2 4.3L17.6 21 12 17.2 6.4 21l1.8-7.7L3 9l6.6-.4z"/></svg><span>' + esc(h) + '</span></li>';
    }).join('');
    var tick = '<svg viewBox="0 0 24 24" class="mt-0.5 h-5 w-5 shrink-0 text-sea" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg>';
    var cross = '<svg viewBox="0 0 24 24" class="mt-0.5 h-5 w-5 shrink-0 text-clay" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="m7 7 10 10M17 7 7 17"/></svg>';
    var inc = $('[data-tour-included]');
    if (inc) inc.innerHTML = tour.includes.concat(INCLUDED).map(function (x) { return '<li class="flex gap-3">' + tick + '<span>' + esc(x) + '</span></li>'; }).join('');
    var exc = $('[data-tour-excluded]');
    if (exc) exc.innerHTML = EXCLUDED.concat(tour.excludes).map(function (x) { return '<li class="flex gap-3">' + cross + '<span>' + esc(x) + '</span></li>'; }).join('');

    // Related trips: same region first, then same style.
    var rel = $('[data-related]');
    if (rel) {
      var score = function (t) { return (t.region === tour.region ? 2 : 0) + (t.style === tour.style ? 1 : 0); };
      rel.innerHTML = TOURS.filter(function (t) { return t.id !== tour.id; })
        .sort(function (a, b) { return score(b) - score(a) || b.rating - a.rating; })
        .slice(0, 3).map(function (t) { return tourCard(t); }).join('');
    }

    // Itinerary accordion
    var it = $('[data-itinerary]');
    if (it) {
      it.innerHTML = tour.itinerary.map(function (day, i) {
        var id = 'day-' + i;
        return '<li class="itinerary-item">' +
          '<h3><button type="button" class="itinerary-btn" aria-expanded="' + (i === 0) + '" aria-controls="' + id + '">' +
          '<span class="flex flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:gap-4"><span class="itinerary-day">Day ' + esc(day.d) + '</span><span class="text-left font-display text-xl leading-snug sm:text-2xl">' + esc(day.t) + '</span></span>' +
          '<svg viewBox="0 0 24 24" class="itinerary-icon h-5 w-5 shrink-0" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></button></h3>' +
          '<div id="' + id + '" class="itinerary-panel"' + (i === 0 ? '' : ' hidden') + '><p>' + esc(day.x) + '</p>' +
          (day.stay ? '<p class="mt-3 flex items-center gap-2 text-sm text-muted"><svg viewBox="0 0 24 24" class="h-4 w-4 text-sea" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 20V9l9-5 9 5v11M9 20v-6h6v6"/></svg>Overnight: ' + esc(day.stay) + '</p>' : '') +
          '</div></li>';
      }).join('');
      var all = $('[data-itinerary-all]');
      function sync() {
        var btns = $$('.itinerary-btn', it);
        var allOpen = btns.every(function (b) { return b.getAttribute('aria-expanded') === 'true'; });
        if (all) { all.textContent = allOpen ? 'Collapse all days' : 'Expand all days'; all.setAttribute('aria-expanded', String(allOpen)); }
      }
      function setOpen(btn, open) {
        btn.setAttribute('aria-expanded', String(open));
        document.getElementById(btn.getAttribute('aria-controls')).hidden = !open;
      }
      it.addEventListener('click', function (e) {
        var btn = e.target.closest('.itinerary-btn');
        if (!btn) return;
        setOpen(btn, btn.getAttribute('aria-expanded') !== 'true');
        sync();
      });
      if (all) all.addEventListener('click', function () {
        var open = all.getAttribute('aria-expanded') !== 'true';
        $$('.itinerary-btn', it).forEach(function (b) { setOpen(b, open); });
        sync();
      });
      sync();
    }

    // Departures table
    var tbody = $('[data-departures]');
    if (tbody) {
      tbody.innerHTML = deps.map(function (dep) {
        var a = availability(dep);
        return '<tr data-dep="' + dep.start + '">' +
          '<th scope="row" class="py-4 pr-4 text-left font-medium">' + departureLabel(dep) + (dep.peak ? '<span class="ml-2 rounded-full bg-sun/30 px-2 py-0.5 text-xs font-semibold text-ink">Peak</span>' : '') + '</th>' +
          '<td class="py-4 pr-4"><span class="badge ' + a.cls + '">' + a.text + '</span></td>' +
          '<td class="py-4 pr-4 text-right font-display text-xl">' + money(dep.price) + '<span class="sr-only"> per person</span></td>' +
          '<td class="py-4 text-right">' + (dep.left ? '<button type="button" class="btn-small" data-pick="' + dep.start + '">Choose<span class="sr-only"> ' + departureLabel(dep) + '</span></button>' : '<span class="text-sm text-muted">Waitlist</span>') + '</td></tr>';
      }).join('');
    }

    // Booking widget: departure + travelers + room → live total
    var widget = $('#booking-widget');
    if (!widget) return;
    var sel = $('#dep-select', widget);
    var out = $('#trav-count', widget);
    var minus = $('[data-step="-1"]', widget);
    var plus = $('[data-step="1"]', widget);
    sel.innerHTML = deps.map(function (dep) {
      return '<option value="' + dep.start + '"' + (dep.left ? '' : ' disabled') + '>' + esc(departureLabel(dep)) + ' · ' + (dep.left ? money(dep.price) : 'Full') + '</option>';
    }).join('');
    var open = deps.filter(function (d) { return d.left; });
    var wanted = params.get('date');
    var month = parseInt(params.get('month'), 10);
    var first = open.filter(function (d) { return d.start === wanted; })[0] ||
      open.filter(function (d) { return d.month === month; })[0] || open[0];
    var travellers = Math.max(1, Math.min(MAX_TRAVELLERS, parseInt(params.get('travellers'), 10) || 2));
    if (first) sel.value = first.start;

    function current() { return deps.filter(function (d) { return d.start === sel.value; })[0] || first; }
    function update() {
      var dep = current();
      if (!dep) return;
      var max = Math.min(MAX_TRAVELLERS, dep.left);
      travellers = Math.max(1, Math.min(max, travellers));
      var room = (widget.querySelector('input[name="room"]:checked') || {}).value || 'share';
      var q = quote(tour, dep, travellers, room);
      out.textContent = travellers;
      minus.disabled = travellers <= 1;
      plus.disabled = travellers >= max;
      $('[data-q="pp"]', widget).textContent = money(q.perPerson) + ' × ' + q.travellers;
      $('[data-q="base"]', widget).textContent = money(q.base);
      $('[data-q="supp-row"]', widget).hidden = !q.supplement;
      $('[data-q="supp"]', widget).textContent = money(q.supplement);
      $('[data-q="total"]', widget).textContent = money(q.total);
      $('[data-q="deposit"]', widget).textContent = money(q.deposit);
      $('[data-q="note"]', widget).textContent = dep.left <= 3
        ? 'Only ' + plural(dep.left, 'place', 'places') + ' left on this departure.'
        : (dep.guaranteed ? 'This departure is guaranteed to run.' : 'Runs with 4 or more travelers. We confirm 8 weeks before.');
      $$('[data-dep]', tbody).forEach(function (r) { r.classList.toggle('is-selected', r.getAttribute('data-dep') === dep.start); });
      var sum = $('[data-enquiry-summary]');
      if (sum) sum.textContent = tour.name + ' · ' + departureLabel(dep) + ' · ' + plural(q.travellers, 'traveler', 'travelers') + (room === 'own' ? ', own rooms' : ', sharing') + ' · ' + money(q.total);
      var form = $('#enquiry-form');
      if (form) {
        form.elements.tour.value = tour.name;
        form.elements.departure.value = dep.start;
        form.elements.travellers.value = q.travellers;
        form.elements.room.value = room;
        form.elements.total.value = q.total;
      }
      var mbar = $('[data-mobile-price]');
      if (mbar) mbar.textContent = money(q.total);
    }
    sel.addEventListener('change', update);
    widget.addEventListener('change', function (e) { if (e.target.name === 'room') update(); });
    minus.addEventListener('click', function () { travellers--; update(); });
    plus.addEventListener('click', function () { travellers++; update(); });
    if (tbody) tbody.addEventListener('click', function (e) {
      var b = e.target.closest('[data-pick]');
      if (!b) return;
      sel.value = b.getAttribute('data-pick');
      update();
      widget.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      sel.focus({ preventScroll: true });
      toast('Departure ' + departureLabel(current()) + ' selected');
    });
    update();
  }

  /* ------------------------------------------------------------------
   * 9. Destinations: month-by-month seasonality
   * ------------------------------------------------------------------ */
  function initSeasons() {
    var table = $('#season-table');
    if (table) {
      var head = '<thead><tr><th scope="col" class="season-corner">Region</th>' + MONTHS.map(function (m) {
        return '<th scope="col" class="season-month"><abbr title="' + m + '">' + m.slice(0, 3) + '</abbr></th>';
      }).join('') + '</tr></thead>';
      var body = '<tbody>' + REGIONS.map(function (r) {
        return '<tr><th scope="row" class="season-region"><a href="#' + r.id + '" class="tour-link">' + esc(r.label) + '</a></th>' + r.season.map(function (v, i) {
          return '<td class="season-cell" data-level="' + v + '"><span class="season-dot" aria-hidden="true"></span><span class="sr-only">' + MONTHS[i] + ': ' + SEASON_LABEL[v] + '</span></td>';
        }).join('') + '</tr>';
      }).join('') + '</tbody>';
      var cap = $('caption', table);
      table.innerHTML = (cap ? cap.outerHTML : '') + head + body;
    }
    $$('[data-season]').forEach(function (el) {
      var r = findRegion(el.getAttribute('data-season'));
      if (!r) return;
      var best = r.season.map(function (v, i) { return v === 3 ? MONTHS[i] : null; }).filter(Boolean);
      el.innerHTML = '<ol class="season-bar" aria-label="Best time to visit ' + esc(r.label) + ', by month">' + r.season.map(function (v, i) {
        return '<li class="season-step" data-level="' + v + '"><span class="season-fill" style="--h:' + ((v + 1) * 25) + '%"></span><span class="season-label" aria-hidden="true">' + MONTHS[i].charAt(0) + '</span><span class="sr-only">' + MONTHS[i] + ': ' + SEASON_LABEL[v] + '</span></li>';
      }).join('') + '</ol><p class="mt-3 text-sm text-muted"><span class="font-semibold text-ink">Best:</span> ' + esc(best.join(', ')) + '</p>';
    });
  }

  /* ------------------------------------------------------------------
   * 10. Journal topic filter: journal.html?topic=guides
   * ------------------------------------------------------------------ */
  function initJournal() {
    var bar = $('[data-topic-filter]');
    if (!bar) return;
    var posts = $$('[data-topic]');
    var status = $('#journal-status');
    var buttons = $$('button[data-topic-btn]', bar);
    var allowed = buttons.map(function (b) { return b.getAttribute('data-topic-btn'); });
    function apply(topic, push) {
      if (allowed.indexOf(topic) < 0) topic = 'all';
      buttons.forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-topic-btn') === topic)); });
      var shown = 0;
      posts.forEach(function (p) {
        var on = topic === 'all' || p.getAttribute('data-topic') === topic;
        p.hidden = !on;
        if (on) shown++;
      });
      if (status) status.textContent = topic === 'all' ? 'Showing all ' + shown + ' stories' : 'Showing ' + plural(shown, 'story', 'stories') + ' in ' + $('[data-topic-btn="' + topic + '"]', bar).textContent.trim();
      if (push) history.replaceState(null, '', window.location.pathname + (topic === 'all' ? '' : '?topic=' + topic));
      revealNow(document);
    }
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-topic-btn]');
      if (b) apply(b.getAttribute('data-topic-btn'), true);
    });
    apply((new URLSearchParams(window.location.search).get('topic') || 'all').toLowerCase(), false);
  }

  /* ------------------------------------------------------------------
   * 11. Forms: inline validation and a success state. Nothing is sent until you connect them.
   *     To connect a form, see onValid() below and DOCS.md (Forms).
   * ------------------------------------------------------------------ */
  function setFieldError(field, msg) {
    var err = document.getElementById(field.id + '-error');
    if (msg) field.setAttribute('aria-invalid', 'true'); else field.removeAttribute('aria-invalid');
    if (err) err.textContent = msg;
  }
  function fieldMessage(f) {
    var name = f.getAttribute('data-label') || 'this field';
    if (f.type === 'checkbox') return f.required && !f.checked ? (f.getAttribute('data-msg') || 'Please check this box.') : '';
    var v = f.value.trim();
    if (f.required && !v) {
      if (f.type === 'email') return 'Enter your email address.';
      if (f.tagName === 'SELECT') return 'Choose ' + name + '.';
      return 'Enter ' + name + '.';
    }
    if (!v) return '';
    if (f.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return 'Enter a valid email address, like name@example.com.';
    if (f.type === 'tel' && !/^[+()\d\s-]{7,20}$/.test(v)) return 'Enter a phone number using digits, spaces, + or -.';
    if (f.minLength > 0 && v.length < f.minLength) return 'Please write at least ' + f.minLength + ' characters.';
    return '';
  }

  // Called when a form passes validation. Until you connect it, it only shows the success state.
  // To send for real, post the form first, for example:
  //   fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  //     .then(function (res) { if (res.ok) showSuccess(form); else toast('Something went wrong. Please email us.'); });
  function onValid(form) {
    showSuccess(form);
  }
  // A short reference for the confirmation, like SJ-7K2Q (no 0/O or 1/I to misread).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  function showSuccess(form) {
    var box = document.getElementById(form.getAttribute('data-success'));
    var first = (form.elements.name && form.elements.name.value.trim().split(/\s+/)[0]) || '';
    if (box) {
      $$('[data-first-name]', box).forEach(function (el) { el.textContent = first ? ', ' + first : ''; });
      var sum = $('[data-enquiry-summary]');
      $$('[data-success-summary]', box).forEach(function (el) { el.textContent = sum ? sum.textContent : ''; });
      var ref = makeRef('SJ');
      $$('[data-ref]', box).forEach(function (el) { el.textContent = ref; });
      box.hidden = false;
      form.hidden = true;
      box.setAttribute('tabindex', '-1');
      box.focus();
    }
    form.reset();
  }
  function initForms() {
    $$('form[data-validate]').forEach(function (form) {
      var fields = $$('input:not([type="hidden"]), textarea, select', form).filter(function (f) {
        return f.required || f.type === 'email' || f.type === 'tel' || f.minLength > 0;
      });
      fields.forEach(function (f) {
        f.addEventListener('blur', function () { if (f.value || f.getAttribute('aria-invalid')) setFieldError(f, fieldMessage(f)); });
        f.addEventListener(f.type === 'checkbox' || f.tagName === 'SELECT' ? 'change' : 'input', function () {
          if (f.getAttribute('aria-invalid') === 'true') setFieldError(f, fieldMessage(f));
        });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var bad = fields.filter(function (f) { var m = fieldMessage(f); setFieldError(f, m); return !!m; });
        if (bad.length) { bad[0].focus(); return; }
        onValid(form);
      });
    });
    $$('[data-form-again]').forEach(function (b) {
      b.addEventListener('click', function () {
        var box = b.closest('[data-success-box]');
        var form = $('form[data-success="' + box.id + '"]');
        box.hidden = true;
        form.hidden = false;
        var first = $('input:not([type="hidden"]), textarea, select', form);
        if (first) first.focus();
        // The tour page's inquiry form carries the booking summary in hidden fields: refill them.
        var sel = $('#dep-select');
        if (sel) sel.dispatchEvent(new Event('change'));
      });
    });

    // contact.html?tour=<id> preselects the trip in the contact form.
    var trip = $('#contact-trip');
    if (trip) {
      trip.innerHTML = '<option value="">Not sure yet</option>' + REGIONS.map(function (r) {
        return '<optgroup label="' + esc(r.label) + '">' + TOURS.filter(function (t) { return t.region === r.id; }).map(function (t) {
          return '<option value="' + t.id + '">' + esc(t.name) + '</option>';
        }).join('') + '</optgroup>';
      }).join('');
      var wanted = findTour(new URLSearchParams(window.location.search).get('tour'));
      if (wanted) { trip.value = wanted.id; var topic = $('#contact-topic'); if (topic) topic.value = 'trip'; }
    }
  }

  /* ------------------------------------------------------------------
   * 12. Header, mobile menu, scroll reveal, reading progress, year
   * ------------------------------------------------------------------ */
  var io = null;
  function revealNow(root) {
    $$('.reveal:not(.is-visible)', root).forEach(function (el) {
      if (!io) { el.classList.add('is-visible'); return; }
      io.observe(el);
    });
  }
  function initChrome() {
    var menuBtn = $('#menu-toggle');
    var menu = $('#mobile-menu');
    function setMenu(open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      $('.sr-only', menuBtn).textContent = open ? 'Close menu' : 'Menu';
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
    var progress = $('[data-read-progress]');
    var article = $('[data-article]');
    function onScroll() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      if (progress && article) {
        var r = article.getBoundingClientRect();
        var total = r.height - window.innerHeight;
        var p = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
        progress.style.transform = 'scaleX(' + p + ')';
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });

    // Reveal on scroll. Revealing an element also reveals everything above it,
    // so fast jumps (End key, anchors) never leave content hidden.
    if (!('IntersectionObserver' in window) || reduceMotion) { $$('.reveal').forEach(function (el) { el.classList.add('is-visible'); }); return; }
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var bottom = en.target.getBoundingClientRect().bottom;
        $$('.reveal:not(.is-visible)').forEach(function (el) { if (el.getBoundingClientRect().top <= bottom) { el.classList.add('is-visible'); io.unobserve(el); } });
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.05 });
    $$('.reveal').forEach(function (el, i) { el.style.transitionDelay = (i % 3) * 70 + 'ms'; io.observe(el); });
  }

  initFeatured();
  initTourLists();
  initRegionCounts();
  initTourPage();
  initTours();
  initSeasons();
  paintArt(document);
  initChrome();
  initFinder();
  initJournal();
  initForms();

  // Exposed for tests and debugging.
  window.Saltwind = { TOURS: TOURS, REGIONS: REGIONS, departures: departures, quote: quote, readState: readState, filterTours: filterTours };
})();

/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It lifts itself above toasts and the mobile booking
   bar so they never overlap. Mark your own UI with data-back-to-top-avoid.
   To remove the button: delete this block and the .back-to-top styles in src/input.css. */
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
  var AVOID = '#toast.is-visible, [data-back-to-top-avoid]';
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
  function update() {
    queued = false;
    var menuOpen = document.documentElement.classList.contains('menu-open');
    btn.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.9 && !menuOpen);
    lift();
  }
  function schedule() {
    if (queued) return;
    queued = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule);
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
