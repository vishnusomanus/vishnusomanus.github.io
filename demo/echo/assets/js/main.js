/* Echo — Overtone podcast template. All JavaScript for the site, vanilla, no dependencies.
 *
 *  1. Show data: SHOW, TOPICS, SEASONS, EPISODES, DETAILS, AUDIENCE
 *  2. Helpers (formatting, storage, toast)
 *  3. Artwork: cover art, waveforms and guest avatars drawn as SVG
 *  4. The player engine (real <audio> or a simulated clock) and saved progress
 *  5. Player interfaces: hero, episode page and mini player, keyboard shortcuts
 *  6. Episode cards, play buttons and the home page
 *  7. Episodes archive: search, filters, sort, URL state, load more
 *  8. Episode page: chapters, show notes, transcript, guest, share, related
 *  9. Advertise page charts
 * 10. Forms (validation and success states)
 * 11. Subscribe page, header, mobile menu, scroll reveal
 * 12. Back to top button
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
   * 1. Show data. Edit these to make the site yours (see DOCS.md, Content).
   * ------------------------------------------------------------------ */
  var SHOW = {
    name: 'Overtone',
    feed: 'https://overtone.example/feed.xml',  // your RSS feed URL (shown and copied on subscribe.html)
    credits: 'Overtone is produced by Rosa Lindgren and edited by Kit Harlow. Music by Kit Harlow. Recorded at the Piano Shop, Frankford Avenue, Philadelphia.'
  };

  // id is used in URLs (episodes.html?topic=sound). dot is the Tailwind class for the color dot.
  var TOPICS = [
    { id: 'design', label: 'Design', dot: 'bg-lilac', blurb: 'Type, objects, interfaces, cities' },
    { id: 'science', label: 'Science', dot: 'bg-sky', blurb: 'Labs, fieldwork and the people in them' },
    { id: 'engineering', label: 'Engineering', dot: 'bg-sun', blurb: 'Bridges, batteries, elevators, satellites' },
    { id: 'craft', label: 'Craft', dot: 'bg-tomato', blurb: 'Bells, knives, glass, stone and thread' },
    { id: 'sound', label: 'Sound', dot: 'bg-mint', blurb: 'Instruments, rooms and the noise between' }
  ];

  // Cover colors per season: bg is the cover background, ink the artwork on top.
  var SEASONS = [
    { id: 1, label: 'Season 1', years: '2023', bg: '#ff6b4a', ink: '#0e0c13' },
    { id: 2, label: 'Season 2', years: '2023–24', bg: '#b9a4ff', ink: '#0e0c13' },
    { id: 3, label: 'Season 3', years: '2024–25', bg: '#f6d45a', ink: '#0e0c13' },
    { id: 4, label: 'Season 4', years: '2026', bg: '#86d2ff', ink: '#0e0c13' }
  ];

  // Every episode. duration is in seconds. Add `src: 'audio/episode-63.mp3'` to play a real file;
  // episodes without a src are played by a simulated clock (see DOCS.md, The player).
  var EPISODES = [
    { id: 1, season: 1, title: "The Chair That Took Nine Years", guest: "Hollis Wren", role: "Furniture designer", topic: 'design', date: '2023-03-01', duration: 4669,
      summary: "Hollis drew the first sketch of the Arc chair in 2013 and shipped it in 2022. We talk about the ninety prototypes in between, and why the final change was two millimeters.",
      quote: "The last two millimeters took longer than the first nine hundred." },
    { id: 2, season: 1, title: "Why Bridges Hum", guest: "Dr. Amara Celik", role: "Structural acoustics engineer", topic: 'engineering', date: '2023-03-15', duration: 3213,
      summary: "Some bridges sing in the wind and a few of them shake themselves apart. Amara listens to them for a living and explains what the hum is telling her.",
      quote: "A bridge is an instrument nobody meant to tune." },
    { id: 3, season: 1, title: "Teaching Bread to Rise on Mars", guest: "Priya Ramaswamy", role: "Food scientist", topic: 'science', date: '2023-03-29', duration: 3328,
      summary: "Low pressure, strange flour and no second chances. Priya on baking for a crew that can’t run out for groceries.",
      quote: "Yeast is the most patient member of any mission." },
    { id: 4, season: 1, title: "A Typeface for Highway Signs", guest: "Joaquín Sola", role: "Type designer", topic: 'design', date: '2023-04-12', duration: 4739,
      summary: "You read it at 70 miles an hour, at night, in the rain. Joaquín on drawing letters that work when nobody is really looking.",
      quote: "Good signage type is the one you never remember reading." },
    { id: 5, season: 1, title: "The Last Bell Foundry in Ohio", guest: "Ruth Kessler", role: "Bell founder", topic: 'craft', date: '2023-04-26', duration: 3322,
      summary: "Ruth’s family has cast bells since 1871. She explains tuning a bell by shaving metal off the inside, and why she still does it by ear.",
      quote: "You don’t tune a bell. You negotiate with it." },
    { id: 6, season: 1, title: "Mapping the Ocean Floor by Ear", guest: "Dr. Tomasz Nowak", role: "Marine geophysicist", topic: 'science', date: '2023-05-10', duration: 3467,
      summary: "Most of the sea floor is mapped worse than the surface of Mars. Tomasz on sonar, patience and the mountain range nobody has seen.",
      quote: "Every ping is a question we ask the dark." },
    { id: 7, season: 1, title: "Designing a Hospital You Can Get Lost In (Less)", guest: "Femi Adeyemi", role: "Wayfinding designer", topic: 'design', date: '2023-05-24', duration: 3180,
      summary: "Color-coded lines on the floor, landmarks instead of room numbers and the art of the perfect arrow. Femi on helping frightened people find their way.",
      quote: "Nobody walks into a hospital in a good mood. The signs have to make up for it." },
    { id: 8, season: 1, title: "How a Synthesizer Learns to Sing", guest: "Lena Hart", role: "Instrument designer", topic: 'sound', date: '2023-06-07', duration: 4047,
      summary: "Lena builds synthesizers in a former laundromat. We get into oscillators, formants and the strange joy of a machine that sounds like breath.",
      quote: "The circuit doesn’t know it’s singing. That’s the beautiful part." },
    { id: 9, season: 1, title: "The Physics of a Perfect Knot", guest: "Dr. Ines Duarte", role: "Applied mathematician", topic: 'science', date: '2023-06-21', duration: 3910,
      summary: "Why some knots hold and others slip, and what sailors knew centuries before the equations. Ines brings rope to the studio.",
      quote: "Sailors solved this with their hands three hundred years before we wrote it down." },
    { id: 10, season: 1, title: "Re-tooling a Shoe Factory", guest: "Marco Bellini", role: "Shoe manufacturer", topic: 'craft', date: '2023-07-05', duration: 3573,
      summary: "Marco took over a Lowell shoe factory with 40-year-old machines and a dwindling order book. Five years later it’s booked out.",
      quote: "The machines were fine. We had forgotten how to listen to them." },
    { id: 11, season: 1, title: "Interfaces for Air Traffic Control", guest: "Dana Whitfield", role: "Interaction designer", topic: 'design', date: '2023-07-19', duration: 4206,
      summary: "When a pixel in the wrong place can cost lives, how do you change anything at all? Dana on designing very slowly, on purpose.",
      quote: "In my field, boring is the highest compliment." },
    { id: 12, season: 1, title: "Growing Bricks from Fungus", guest: "Dr. Kofi Mensah", role: "Materials scientist", topic: 'engineering', date: '2023-08-02', duration: 3298,
      summary: "Mycelium, sawdust and a week in the dark. Kofi on building materials you grow instead of fire, and the walls that smell faintly of mushrooms.",
      quote: "We don’t manufacture these bricks. We farm them." },
    { id: 13, season: 1, title: "The Sound of an Empty Stadium", guest: "Yuki Tanaka", role: "Broadcast sound engineer", topic: 'sound', date: '2023-08-16', duration: 2817,
      summary: "In 2020 Yuki had to make empty stadiums sound full on live TV. A story about crowd noise libraries and very nervous producers.",
      quote: "We were conducting forty thousand people who weren’t there." },
    { id: 14, season: 1, title: "What We Got Wrong This Season", guest: "Nadia Ferreira & Eli Brandt", role: "Season finale", topic: 'craft', date: '2023-08-30', duration: 3219,
      summary: "The hosts go back through season one: corrections, listener letters, the guest who changed both their minds and the episode they almost never released.",
      quote: "We got a lot of email about knots." },
    { id: 15, season: 2, title: "Clocks That Run for 10,000 Years", guest: "Gabriel Osei", role: "Horologist", topic: 'engineering', date: '2023-10-04', duration: 3688,
      summary: "Gabriel builds clocks meant to outlive the language they’re labeled in. On mechanisms, deep time and designing for people you will never meet.",
      quote: "The hardest user to design for is the one born in the year 9000." },
    { id: 16, season: 2, title: "The Color of Money", guest: "Sofia Marchetti", role: "Banknote designer", topic: 'design', date: '2023-10-18', duration: 3000,
      summary: "Security threads, micro-lettering and a portrait that has to look trustworthy. Sofia on the most counterfeited canvas in the world.",
      quote: "A banknote is a promise you can fold." },
    { id: 17, season: 2, title: "Listening to Glaciers", guest: "Dr. Freya Lund", role: "Glaciologist", topic: 'science', date: '2023-11-01', duration: 2831,
      summary: "Freya drops hydrophones into Greenland’s meltwater. The crackle you hear is ice that’s 40,000 years old letting go of its air.",
      quote: "Every pop is a bubble of air from before agriculture." },
    { id: 18, season: 2, title: "Building a Violin from a Fallen Tree", guest: "Adaeze Nwosu", role: "Luthier", topic: 'craft', date: '2023-11-15', duration: 4596,
      summary: "A storm brought down a 200-year-old maple in Adaeze’s town. Eighteen months later, it became a violin. We follow the wood from trunk to first note.",
      quote: "The tree had two hundred years of weather in it. My job was not to ruin that." },
    { id: 19, season: 2, title: "Packaging Without the Plastic", guest: "Rachel Stein", role: "Packaging engineer", topic: 'engineering', date: '2023-11-29', duration: 3095,
      summary: "Replacing a plastic clamshell sounds easy until it has to survive a truck, a warehouse and a toddler. Rachel on drop tests and folded paper.",
      quote: "Cardboard is a structural material that people insist on treating like paper." },
    { id: 20, season: 2, title: "Fonts for People Who Can’t See Well", guest: "Dr. Ahmed Rahimi", role: "Legibility researcher", topic: 'design', date: '2023-12-13', duration: 3347,
      summary: "Ahmed tests letterforms with readers who have low vision. What he’s learned about open shapes, spacing and the trouble with a lowercase l.",
      quote: "Legibility isn’t a style. It’s a measurement." },
    { id: 21, season: 2, title: "The Smell of Rain, Bottled", guest: "Camille Duret", role: "Perfumer", topic: 'craft', date: '2023-12-27', duration: 3706,
      summary: "Petrichor, ozone and wet stone. Camille on building a scent from molecules, and why the smell of rain is mostly the smell of soil bacteria.",
      quote: "Rain doesn’t smell. The ground does, when it’s been waiting." },
    { id: 22, season: 2, title: "How Elevators Think", guest: "Victor Huang", role: "Elevator control engineer", topic: 'engineering', date: '2024-01-10', duration: 3226,
      summary: "Why the elevator never comes when you’re late. Victor on dispatch algorithms, rush hours and the placebo of the close-door button.",
      quote: "The button works. Whether it does anything is a different question." },
    { id: 23, season: 2, title: "A Museum for Sounds That Are Disappearing", guest: "Ama Owusu", role: "Sound archivist", topic: 'sound', date: '2024-01-24', duration: 3775,
      summary: "Dial-up modems, typewriter bells, a particular Cincinnati market at dawn. Ama records sounds before they vanish and plays us a few.",
      quote: "Nobody thinks to record a sound until it’s gone." },
    { id: 24, season: 2, title: "The Map That Fits in Your Pocket", guest: "Henrik Dahl", role: "Cartographer", topic: 'design', date: '2024-02-07', duration: 3615,
      summary: "Henrik designs folding maps for national parks. On generalization, what to leave out, and the art of a fold that never tears.",
      quote: "A map is a list of everything I chose to ignore." },
    { id: 25, season: 2, title: "Fermentation as a Design Tool", guest: "Dr. Lucia Ortega", role: "Microbiologist", topic: 'science', date: '2024-02-21', duration: 3958,
      summary: "Lucia works with chefs and textile dyers, using microbes to make color and flavor. On cultures, patience and controlled rot.",
      quote: "Every jar in my lab is a tiny city with its own politics." },
    { id: 26, season: 2, title: "Quiet Cars", guest: "Beatrice Moll", role: "Automotive NVH engineer", topic: 'sound', date: '2024-03-06', duration: 3558,
      summary: "Electric cars removed the engine noise and revealed every rattle behind it. Beatrice spends her days hunting squeaks.",
      quote: "Silence is the loudest thing we ever shipped." },
    { id: 27, season: 2, title: "Making Ceramics That Survive Space", guest: "Dr. Raj Patel", role: "Aerospace materials engineer", topic: 'engineering', date: '2024-03-20', duration: 3046,
      summary: "Heat shields, re-entry and tiles that glow at 2,900°F. Raj on the oldest material we know doing the newest job.",
      quote: "Pottery is the original high-temperature technology." },
    { id: 28, season: 2, title: "The Unwritten Rules of a Kitchen Knife", guest: "Hiro Matsuda", role: "Bladesmith", topic: 'craft', date: '2024-04-03', duration: 4756,
      summary: "Hiro forges knives in a converted garage in Portland. On steel, grind angles, and why the handle matters more than anyone thinks.",
      quote: "The blade gets the attention. The handle does the work." },
    { id: 29, season: 2, title: "Designing for Disasters", guest: "Leila Haddad", role: "Emergency shelter designer", topic: 'design', date: '2024-04-17', duration: 4074,
      summary: "A shelter that ships flat, goes up in an hour and lasts a winter. Leila on designing for the worst week of someone’s life.",
      quote: "Dignity is a design requirement, not a feature." },
    { id: 30, season: 2, title: "Live from the Piano Shop", guest: "Nadia Ferreira & Eli Brandt", role: "Live show", topic: 'sound', date: '2024-05-01', duration: 4337,
      summary: "Our first live show, recorded in front of 90 people in the studio. With a piano tuner, a lot of folding chairs and a question from a nine-year-old.",
      quote: "We should do this more often. We should also buy more chairs." },
    { id: 31, season: 3, title: "The Lab That Grows Leather", guest: "Dr. Nora Bishop", role: "Biomaterials scientist", topic: 'science', date: '2024-09-11', duration: 2941,
      summary: "Nora grows leather-like sheets from bacterial cellulose. On texture, durability and convincing a shoemaker to take it seriously.",
      quote: "The material is easy. Changing people’s minds about it is the long part." },
    { id: 32, season: 3, title: "A Better Doorknob", guest: "Felix Grant", role: "Hardware designer", topic: 'design', date: '2024-09-25', duration: 2914,
      summary: "You touch it a dozen times a day and never think about it. Felix spent three years on one doorknob. It was worth it, he says.",
      quote: "A door handle is a handshake with a building." },
    { id: 33, season: 3, title: "The Weight of a Kilogram", guest: "Dr. Mei Lin", role: "Metrologist", topic: 'science', date: '2024-10-09', duration: 4424,
      summary: "For 130 years the kilogram was a lump of metal in a vault near Paris. Mei explains how it became a constant of nature instead.",
      quote: "We retired the most important object nobody had seen." },
    { id: 34, season: 3, title: "Restoring a 1920s Theater Organ", guest: "Walter Pryce", role: "Organ builder", topic: 'sound', date: '2024-10-23', duration: 3124,
      summary: "Twelve hundred pipes, a leaking wind chest and a theater that hadn’t heard it since 1962. Walter on bringing a giant back to life.",
      quote: "An organ is a building that breathes." },
    { id: 35, season: 3, title: "Trains on Time", guest: "Chiara Rossi", role: "Railroad timetable planner", topic: 'engineering', date: '2024-11-06', duration: 2720,
      summary: "Chiara builds timetables for a network of 900 trains a day. On buffers, cascades and why a two-minute delay in the morning ruins the evening.",
      quote: "A timetable is a promise made a year in advance." },
    { id: 36, season: 3, title: "Stitching a Spacesuit", guest: "Delphine Moreau", role: "Spacesuit seamstress", topic: 'craft', date: '2024-11-20', duration: 3808,
      summary: "Twenty-one layers, hand stitched, with no room for a wrong stitch. Delphine on sewing for a vacuum.",
      quote: "My sewing machine is older than me and better at its job than I am." },
    { id: 37, season: 3, title: "Seeing Like a Bee", guest: "Dr. Samuel Kiprop", role: "Vision scientist", topic: 'science', date: '2024-12-04', duration: 3636,
      summary: "Bees see ultraviolet, and flowers have patterns we can’t. Samuel builds cameras that see like insects and shows us a hidden world.",
      quote: "Every flower is a billboard we can’t read." },
    { id: 38, season: 3, title: "The Design of a Ballot", guest: "Grace Albright", role: "Civic designer", topic: 'design', date: '2024-12-18', duration: 4250,
      summary: "A confusing ballot can change an election. Grace on plain language, column layouts and testing with real voters.",
      quote: "If one voter in a hundred gets it wrong, that can be the whole margin." },
    { id: 39, season: 3, title: "Concrete That Heals Itself", guest: "Dr. Paulo Mendes", role: "Civil engineer", topic: 'engineering', date: '2025-01-01', duration: 4443,
      summary: "Paulo adds dormant bacteria to concrete. When a crack lets water in, they wake up and fill it with limestone.",
      quote: "The building fixes itself while everyone is asleep." },
    { id: 40, season: 3, title: "The Glassblower’s Breath", guest: "Ingrid Solberg", role: "Glassblower", topic: 'craft', date: '2025-01-15', duration: 2967,
      summary: "Heat, gravity and timing. Ingrid on reading molten glass and the hundredth of a second between a vase and a mess.",
      quote: "The glass tells you what it wants. You have about four seconds to listen." },
    { id: 41, season: 3, title: "Why Microphones Sound Different", guest: "Oskar Lindahl", role: "Microphone designer", topic: 'sound', date: '2025-01-29', duration: 3386,
      summary: "Oskar designs microphones in Knoxville. We put four of his on the table and record the same sentence through each. You’ll hear it.",
      quote: "Every microphone has an opinion about your voice." },
    { id: 42, season: 3, title: "Inventing a New Apple", guest: "Dr. Hannah Weiss", role: "Fruit breeder", topic: 'science', date: '2025-02-12', duration: 4678,
      summary: "It takes twenty years and about 10,000 seedlings to release one new apple. Hannah on taste panels, patience and the one that got away.",
      quote: "I’ll retire before the trees I planted this year are judged." },
    { id: 43, season: 3, title: "Signs for a City Without Words", guest: "Kenji Mori", role: "Pictogram designer", topic: 'design', date: '2025-02-26', duration: 4373,
      summary: "Kenji designs pictograms for international events. On drawing a toilet that everyone on Earth understands.",
      quote: "A pictogram has to work for a tired person in a foreign country." },
    { id: 44, season: 3, title: "The Stone Wall Without Mortar", guest: "Callum Fraser", role: "Dry stone mason", topic: 'craft', date: '2025-03-12', duration: 2824,
      summary: "Callum builds walls with nothing but stone and gravity. Some on his hillside have stood for three hundred years.",
      quote: "Every stone has one place where it wants to be." },
    { id: 45, season: 3, title: "Turning Wind into Light", guest: "Dr. Ayesha Karim", role: "Turbine aerodynamicist", topic: 'engineering', date: '2025-03-26', duration: 4290,
      summary: "Blades the length of a football field, built to flex in a storm. Ayesha on why turbines keep getting bigger and where it stops.",
      quote: "We design blades to bend so they never break." },
    { id: 46, season: 3, title: "Season Three Mailbag", guest: "Nadia Ferreira & Eli Brandt", role: "Listener questions", topic: 'craft', date: '2025-04-09', duration: 2759,
      summary: "Your questions, our answers, and a few corrections from listeners who know far more about organs than we do.",
      quote: "The organ people found us. We are grateful and slightly afraid." },
    { id: 47, season: 4, title: "The Keyboard Nobody Asked For", guest: "Theo Lambert", role: "Keyboard designer", topic: 'design', date: '2026-03-11', duration: 2707,
      summary: "Theo crowdfunded a split keyboard and sold 11,000 of them. On niche products, obsessive users and the sound of a good switch.",
      quote: "My customers know more about my product than I do. That’s terrifying and great." },
    { id: 48, season: 4, title: "Measuring Earthquakes in Your Pocket", guest: "Dr. Carmen Vidal", role: "Seismologist", topic: 'science', date: '2026-03-25', duration: 4130,
      summary: "Your phone has an accelerometer, and so does everyone else’s. Carmen on turning millions of phones into an early-warning network.",
      quote: "Seconds of warning are enough to stop a train." },
    { id: 49, season: 4, title: "The Pencil Factory", guest: "Arthur Bloom", role: "Pencil manufacturer", topic: 'craft', date: '2026-04-08', duration: 4271,
      summary: "Graphite, clay, cedar and a machine from 1938. Arthur gives us a tour of one of the last pencil factories in America.",
      quote: "People think the pencil is simple. Try making one." },
    { id: 50, season: 4, title: "Soundtracks for Electric Cars", guest: "Mira Kovač", role: "Sound designer", topic: 'sound', date: '2026-04-22', duration: 3509,
      summary: "Electric cars have to make noise at low speed, by law. Mira designs those sounds and explains why most of them sound like spaceships.",
      quote: "We’re designing the sound of the street for the next fifty years." },
    { id: 51, season: 4, title: "Robots That Fold Laundry (Badly)", guest: "Dr. Jun Park", role: "Roboticist", topic: 'engineering', date: '2026-05-06', duration: 4162,
      summary: "Folding a T-shirt is one of the hardest problems in robotics. Jun shows us why, with video he says we may not share.",
      quote: "A towel has infinite ways to be a towel." },
    { id: 52, season: 4, title: "A Font in Every Language", guest: "Noor Haddad", role: "Multi-script type designer", topic: 'design', date: '2026-05-20', duration: 4287,
      summary: "Noor designs type families that cover Arabic, Latin, Devanagari and more. On harmony without sameness.",
      quote: "Making scripts look related without making them look the same is the whole job." },
    { id: 53, season: 4, title: "Clouds on Demand", guest: "Dr. Elise Fontaine", role: "Atmospheric physicist", topic: 'science', date: '2026-06-03', duration: 2899,
      summary: "Elise studies how clouds form in a chamber the size of a room. On seeding, rain and the ethics of changing the weather.",
      quote: "A cloud is a very slow decision made by billions of droplets." },
    { id: 54, season: 4, title: "Weaving with Recycled Fishing Nets", guest: "Thandiwe Dube", role: "Textile designer", topic: 'craft', date: '2026-06-17', duration: 4769,
      summary: "Thandiwe turns abandoned fishing nets into rugs. On sorting, cleaning, spinning and the colors you can only get from the sea.",
      quote: "Every rug starts on a beach." },
    { id: 55, season: 4, title: "The Acoustics of a Library", guest: "Pablo Herrera", role: "Architectural acoustician", topic: 'sound', date: '2026-07-01', duration: 3161,
      summary: "How quiet is quiet enough? Pablo on designing reading rooms where you can hear a page turn but not a phone call.",
      quote: "Silence is something we build, one surface at a time." },
    { id: 56, season: 4, title: "Batteries Made of Salt", guest: "Dr. Imani Brooks", role: "Chemical engineer", topic: 'engineering', date: '2026-07-15', duration: 2664,
      summary: "Imani stores solar power in tanks of molten salt. On heat, grid storage and the very unglamorous work of making energy last overnight.",
      quote: "The sun sets every day. Storage is how we stop caring." },
    { id: 57, season: 4, title: "Small Satellites, Big Pictures", guest: "Dr. Lina Abboud", role: "Satellite engineer", topic: 'engineering', date: '2026-07-29', duration: 2955,
      summary: "Satellites the size of a shoebox now photograph the whole planet every day. Lina on building them in a clean room in Tucson.",
      quote: "We launch them in batches of forty. Some of them are named after my nieces." },
    { id: 58, season: 4, title: "How to Design a Medicine Bottle", guest: "Owen Pritchard", role: "Pharmaceutical packaging designer", topic: 'design', date: '2026-08-12', duration: 3903,
      summary: "Child-proof but not grandparent-proof. Owen on labels, caps and the tiny details that keep people from taking the wrong pill.",
      quote: "If the label needs explaining, the label is wrong." },
    { id: 59, season: 4, title: "Counting Every Tree in a City", guest: "Dr. Aditi Rao", role: "Urban ecologist", topic: 'science', date: '2026-08-26', duration: 3498,
      summary: "Aditi and two hundred volunteers counted all 2.3 million trees in a city. On data, shade and the street that runs five degrees hotter.",
      quote: "You can see inequality from space. It looks like missing trees." },
    { id: 60, season: 4, title: "The Restorer’s Rule", guest: "Giulia Conti", role: "Furniture conservator", topic: 'craft', date: '2026-09-09', duration: 4410,
      summary: "Every repair must be reversible. Giulia on fixing 18th-century chairs so that the next restorer can undo her work.",
      quote: "My best work is invisible, and my second-best work can be removed." },
    { id: 61, season: 4, title: "A Better Bike Lane", guest: "Marisol Vega", role: "Street designer", topic: 'design', date: '2026-09-23', duration: 2999,
      summary: "Paint is not protection. Marisol on curbs, planters, signal timing and the bike lane that a ten-year-old would actually use.",
      quote: "Design the street for an eight-year-old and an eighty-year-old and everyone else fits." },
    { id: 62, season: 4, title: "The Quietest Room on Earth", guest: "Sven Aaltonen", role: "Anechoic chamber engineer", topic: 'sound', date: '2026-10-07', duration: 3476,
      summary: "Sven builds rooms that swallow 99.99% of sound. We spend twenty minutes inside one, then ask him what silence actually does to a person.",
      quote: "After ten minutes you hear your own blood. After twenty, you hear your joints." }
  ];

  // Optional extra content per episode id: chapters, show notes, transcript and guest details.
  // Episodes without an entry get chapters, notes and a short transcript generated from their data.
  // t values are seconds from the start.
  var DETAILS = {
    62: {
      bio: 'Sven Aaltonen designs and tunes anechoic chambers for universities and audio companies across the country. He trained as a mechanical engineer in Houghton, Michigan and has built eleven chambers, the quietest measuring below minus 20 decibels.',
      links: [['Aaltonen Acoustics (website)', 'https://example.com/aaltonen-acoustics'], ['Sven’s paper on wedge geometry', 'https://example.com/wedge-geometry']],
      chapters: [
        { t: 0, title: 'Cold open: twenty minutes of nothing' },
        { t: 118, title: 'Meet Sven' },
        { t: 540, title: 'What an anechoic chamber is for' },
        { t: 1180, title: 'Inside the chamber' },
        { t: 1820, title: 'What silence does to a person' },
        { t: 2490, title: 'Building quiet: wedges, springs and patience' },
        { t: 3010, title: 'Lightning round' },
        { t: 3330, title: 'Thanks and credits' }
      ],
      notes: [
        'In the basement of a lab in northern Michigan, Sven Aaltonen has built a room that absorbs 99.99% of the sound that reaches its walls. We spent twenty minutes inside it with a recorder running, and then sat down with Sven to ask what he has learned from a career spent building nothing.',
        { h: 'In this episode' },
        { ul: ['Why the chamber floor is a trampoline of steel cable', 'The fiberglass wedges, and why their length sets the lowest note the room can swallow', 'What happens to your balance in the dark when nothing echoes', 'How car makers, hearing aid designers and choirs use the room', 'Sven’s favorite sound in the world (it is not silence)'] },
        { h: 'Mentioned' },
        { links: [['Episode 41: Why Microphones Sound Different', 'episode.html?id=41'], ['Episode 55: The Acoustics of a Library', 'episode.html?id=55'], ['Episode 26: Quiet Cars', 'episode.html?id=26'], ['Aaltonen Acoustics', 'https://example.com/aaltonen-acoustics']] }
      ],
      transcript: [
        [0, 'Eli', 'I’m going to stop talking now. This is the chamber. Nadia’s in here with me. We’re going to sit for a minute.'],
        [42, 'Nadia', 'That was the longest minute of my life. I could hear my eyelids.'],
        [96, 'Eli', 'From a former piano workshop in Philadelphia, this is Overtone. I’m Eli Brandt.'],
        [104, 'Nadia', 'And I’m Nadia Ferreira. Today, the quietest room on Earth, and the man who builds them.'],
        [118, 'Eli', 'Sven Aaltonen, welcome to the show.'],
        [124, 'Sven', 'Thank you. It is very loud in here, by the way. I mean that kindly.'],
        [301, 'Nadia', 'How does somebody end up building silence for a living?'],
        [309, 'Sven', 'I was a mechanical engineer working on ventilation. Fans, ducts. My whole job was making things quieter. One day someone asked if I could make a room where there was nothing at all, and I said yes before I knew how.'],
        [540, 'Eli', 'So what is a chamber like that actually for? Nobody builds it just to sit in.'],
        [548, 'Sven', 'No. It is a measuring instrument. If you want to know exactly what sound a microphone or a hearing aid or a car door makes, you need a room that adds nothing of its own.'],
        [1180, 'Nadia', 'We went in. Describe what we were sitting on, because it moved.'],
        [1188, 'Sven', 'A net of steel cable, stretched over a pit full of wedges. The wedges are below you, above you, on every wall. You are floating in the middle of a very large, very soft hedgehog.'],
        [1820, 'Eli', 'People talk about going a little crazy in there. Is that real?'],
        [1828, 'Sven', 'It is mostly real, but it is not the silence. It is that your brain never stops listening. When the world gives it nothing, it turns to you. After ten minutes you hear your own blood. After twenty, you hear your joints.'],
        [2135, 'Nadia', 'I heard my stomach and decided not to mention it.'],
        [2490, 'Eli', 'Let’s talk about the wedges. Why are they that shape?'],
        [2498, 'Sven', 'A sound wave arriving at a wedge gets trapped between the faces and loses a little energy each time it bounces. The longer the wedge, the lower the frequency it can catch. Ours are about four feet long.'],
        [3010, 'Nadia', 'Lightning round. Favorite sound?'],
        [3014, 'Sven', 'Rain on a tin roof at my summer cabin. It is very loud and I love it.'],
        [3330, 'Eli', 'That’s our show. Thanks to Sven Aaltonen. Overtone is produced by Rosa Lindgren and edited by Kit Harlow. See you in two weeks.']
      ]
    },
    41: {
      bio: 'Oskar Lindahl designs studio microphones in Knoxville, Tennessee. Before starting his own workshop he spent nine years repairing vintage ribbon and condenser microphones for broadcasters.',
      links: [['Lindahl Audio (website)', 'https://example.com/lindahl-audio']],
      chapters: [
        { t: 0, title: 'Cold open: one sentence, four microphones' },
        { t: 140, title: 'Meet Oskar' },
        { t: 620, title: 'Dynamic, condenser, ribbon' },
        { t: 1390, title: 'The blind test' },
        { t: 2120, title: 'Why vintage mics sound vintage' },
        { t: 2760, title: 'Which mic should you buy?' },
        { t: 3160, title: 'Lightning round' }
      ],
      notes: [
        'We put four of Oskar Lindahl’s microphones on the studio table and recorded the same sentence through each one. Then we asked him why they sound so different, and which one he would use to record his own mother.',
        { h: 'In this episode' },
        { ul: ['How a microphone turns air pressure into voltage, three different ways', 'The blind test (Nadia got three out of four)', 'Proximity effect, and why radio voices sound warm', 'What to buy if you are starting a podcast'] },
        { h: 'Mentioned' },
        { links: [['Episode 62: The Quietest Room on Earth', 'episode.html?id=62'], ['Episode 8: How a Synthesizer Learns to Sing', 'episode.html?id=8'], ['Lindahl Audio', 'https://example.com/lindahl-audio']] }
      ],
      transcript: [
        [0, 'Nadia', 'The quick brown fox is tired of jumping over the lazy dog.'],
        [12, 'Nadia', 'The quick brown fox is tired of jumping over the lazy dog.'],
        [26, 'Eli', 'Same sentence, four microphones. If you heard a difference, this episode is for you.'],
        [140, 'Eli', 'Oskar Lindahl, welcome to Overtone.'],
        [146, 'Oskar', 'Thank you. I see you are using one of my competitors. It is fine. I forgive you.'],
        [620, 'Nadia', 'Start us at the beginning. What is a microphone actually doing?'],
        [628, 'Oskar', 'Something very thin is moved by the air, and that movement becomes electricity. Every design is just a different answer to what the thin thing is.'],
        [1390, 'Eli', 'Okay, the blind test. Nadia, you have headphones on.'],
        [1402, 'Nadia', 'Number two is the ribbon. It sounds like it’s wearing a cardigan.'],
        [1410, 'Oskar', 'That is the best description of a ribbon microphone I have ever heard.'],
        [2120, 'Eli', 'Why do old microphones sound old?'],
        [2128, 'Oskar', 'Partly the parts, partly our memory. We heard those voices on the radio as children. Every microphone has an opinion about your voice, and we grew up agreeing with that one.'],
        [2760, 'Nadia', 'Someone is starting a podcast tomorrow. What do they buy?'],
        [2766, 'Oskar', 'A good dynamic microphone and a rug. The rug is more important.'],
        [3160, 'Eli', 'That’s our show. Thanks to Oskar Lindahl.']
      ]
    },
    18: {
      bio: 'Adaeze Nwosu is a violin maker and restorer in Ithaca, New York. She trained at a violin-making school in Indiana and has made 64 instruments, including one from a 200-year-old maple that fell on her street.',
      links: [['Nwosu Violins (website)', 'https://example.com/nwosu-violins']],
      chapters: [
        { t: 0, title: 'Cold open: the storm' },
        { t: 160, title: 'Meet Adaeze' },
        { t: 840, title: 'Drying wood for a year' },
        { t: 1720, title: 'Carving the top plate' },
        { t: 2650, title: 'Varnish and patience' },
        { t: 3480, title: 'The first note' },
        { t: 4200, title: 'Lightning round' }
      ],
      notes: [
        'In the spring of 2022 a storm brought down a 200-year-old sugar maple on Adaeze Nwosu’s street. She asked the city if she could keep a piece. Eighteen months later it became a violin, and she brought it to the studio.',
        { h: 'In this episode' },
        { ul: ['Splitting a log so the grain runs straight', 'Why violin makers tap wood and listen', 'Carving a top plate to within a tenth of a millimeter', 'The varnish recipe Adaeze will not share', 'The first note, played live in the studio'] },
        { h: 'Mentioned' },
        { links: [['Episode 34: Restoring a 1920s Theater Organ', 'episode.html?id=34'], ['Episode 5: The Last Bell Foundry in Ohio', 'episode.html?id=5'], ['Nwosu Violins', 'https://example.com/nwosu-violins']] }
      ],
      transcript: [
        [0, 'Adaeze', 'It came down at about two in the morning. I heard it from bed. A sound like a building sighing.'],
        [160, 'Eli', 'Adaeze Nwosu, welcome to Overtone.'],
        [166, 'Adaeze', 'Thank you for having me. And her. The violin is the guest, really.'],
        [840, 'Nadia', 'You can’t carve a tree the week it falls. What happens first?'],
        [848, 'Adaeze', 'You wait. The wood needs at least a year to dry. I split it, sealed the ends and stacked it in my attic with a note that said do not touch.'],
        [1720, 'Eli', 'Talk me through the top plate.'],
        [1728, 'Adaeze', 'I carve, I tap, I listen, I carve again. The tree had two hundred years of weather in it. My job was not to ruin that.'],
        [2650, 'Nadia', 'And then varnish, which I’m told you won’t talk about.'],
        [2656, 'Adaeze', 'I will talk about it. I will not tell you what is in it.'],
        [3480, 'Eli', 'Will you play it for us?'],
        [3490, 'Adaeze', 'Just a scale. Then something my grandmother used to sing.'],
        [4200, 'Nadia', 'Lightning round. Favorite tool?'],
        [4204, 'Adaeze', 'A small brass thumb plane my teacher gave me. It is older than both of you combined.']
      ]
    }
  };

  // Audience figures for the advertise page charts.
  var AUDIENCE = {
    // Average downloads per episode within 30 days, by quarter.
    growth: [['Q1 ’24', 14200], ['Q2 ’24', 17800], ['Q3 ’24', 21500], ['Q4 ’24', 24900], ['Q1 ’25', 27600], ['Q2 ’25', 31200], ['Q3 ’25', 33800], ['Q4 ’25', 37100], ['Q1 ’26', 41300], ['Q2 ’26', 44800], ['Q3 ’26', 48200]],
    age: [['18–24', 9], ['25–34', 38], ['35–44', 29], ['45–54', 15], ['55+', 9]],
    work: [['Design & architecture', 31, '#b9a4ff'], ['Engineering & tech', 27, '#86d2ff'], ['Science & research', 14, '#7fe0b6'], ['Education', 11, '#f6d45a'], ['Other', 17, '#ff6b4a']],
    countries: [['United States', 58], ['United Kingdom', 11], ['Canada', 8], ['Germany', 5], ['Australia', 4], ['Elsewhere', 14]]
  };

  /* ------------------------------------------------------------------
   * 2. Helpers
   * ------------------------------------------------------------------ */
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var STORE_PLAYER = 'overtone-player';     // { id, rate, volume, muted, playing }
  var STORE_PROGRESS = 'overtone-progress'; // { "<episode id>": seconds listened }

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function clamp(n, a, b) { return Math.min(b, Math.max(a, n)); }
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  // 3476 -> "57:56", 4596 -> "1:16:36"
  function clock(s) {
    s = Math.max(0, Math.floor(s || 0));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return h ? h + ':' + pad(m) + ':' + pad(sec) : m + ':' + pad(sec);
  }
  // 3476 -> "57 minutes 56 seconds" (for screen readers)
  function spoken(s) {
    s = Math.max(0, Math.floor(s || 0));
    var h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60, out = [];
    if (h) out.push(h + (h === 1 ? ' hour' : ' hours'));
    if (m) out.push(m + (m === 1 ? ' minute' : ' minutes'));
    if (sec || !out.length) out.push(sec + (sec === 1 ? ' second' : ' seconds'));
    return out.join(' ');
  }
  // 4596 -> "1 hr 17 min"
  function length(s) {
    var m = Math.round(s / 60);
    return m >= 60 ? Math.floor(m / 60) + ' hr ' + (m % 60) + ' min' : m + ' min';
  }
  function date(iso) {
    return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  }
  // Parses "754", "12:34" or "1:02:03" into seconds.
  function parseTime(v) {
    if (!v) return null;
    var parts = String(v).split(':').map(Number);
    if (parts.some(isNaN)) return null;
    return parts.reduce(function (acc, n) { return acc * 60 + n; }, 0);
  }
  // A small, stable hash and seeded random so artwork is the same on every visit.
  function hash(str) {
    var h = 2166136261;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function seeded(seed) {
    var s = seed || 1;
    return function () { s = Math.imul(s ^ (s >>> 15), 2246822507) ^ Math.imul(s ^ (s >>> 13), 3266489909); s ^= s >>> 16; return (s >>> 0) / 4294967296; };
  }
  function readJSON(key, fallback) {
    try { var v = JSON.parse(safeStorage.getItem(key)); return v && typeof v === 'object' ? v : fallback; } catch (e) { return fallback; }
  }
  function writeJSON(key, value) {
    try { safeStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* storage full or blocked: playback still works */ }
  }
  var toastTimer = null;
  function toast(msg) {
    var el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-visible'); }, 2800);
  }

  function getEp(id) {
    var n = Number(id);
    for (var i = 0; i < EPISODES.length; i++) if (EPISODES[i].id === n) return EPISODES[i];
    return null;
  }
  function latest() {
    return EPISODES.reduce(function (a, b) { return b.date > a.date || (b.date === a.date && b.id > a.id) ? b : a; });
  }
  function topicOf(ep) { return TOPICS.filter(function (t) { return t.id === ep.topic; })[0] || TOPICS[0]; }
  function seasonOf(ep) { return SEASONS.filter(function (s) { return s.id === ep.season; })[0] || SEASONS[0]; }
  function firstName(name) { return name.replace(/^Dr\.\s+/, '').split(' ')[0]; }
  function isHostEpisode(ep) { return / & /.test(ep.guest); }
  function kicker(ep) { return 'S' + ep.season + ' · E' + ep.id; }
  function guestLine(ep) { return isHostEpisode(ep) ? 'with ' + ep.guest : 'with ' + ep.guest + ', ' + ep.role.toLowerCase(); }
  function epUrl(ep, t) { return 'episode.html?id=' + ep.id + (t ? '&t=' + Math.floor(t) : ''); }

  /* ------------------------------------------------------------------
   * 3. Artwork: covers, waveforms and avatars
   * ------------------------------------------------------------------ */
  // Square cover art: season color, a motif for the topic and the episode number.
  function cover(ep) {
    var s = seasonOf(ep), ink = s.ink, r = seeded(hash('cover' + ep.id)), m = '';
    if (ep.topic === 'sound') {
      for (var i = 0; i < 31; i++) {
        var env = Math.sin((i + 1) / 32 * Math.PI);
        var h = 18 + env * (60 + r() * 120);
        m += '<rect x="' + (30 + i * 11) + '" y="' + (165 - h / 2).toFixed(1) + '" width="6" height="' + h.toFixed(1) + '" rx="3"/>';
      }
      m = '<g fill="' + ink + '">' + m + '</g>';
    } else if (ep.topic === 'science') {
      var cx = 215 + r() * 30, rot = -15 - r() * 30;
      m = '<g fill="none" stroke="' + ink + '" stroke-width="4" transform="rotate(' + rot.toFixed(0) + ' ' + cx.toFixed(0) + ' 165)">' +
        '<ellipse cx="' + cx.toFixed(0) + '" cy="165" rx="128" ry="52"/><ellipse cx="' + cx.toFixed(0) + '" cy="165" rx="90" ry="34"/><ellipse cx="' + cx.toFixed(0) + '" cy="165" rx="60" ry="22"/></g>' +
        '<circle cx="' + cx.toFixed(0) + '" cy="165" r="22" fill="' + ink + '"/>' +
        '<circle cx="' + (cx - 104).toFixed(0) + '" cy="' + (150 + r() * 60).toFixed(0) + '" r="9" fill="' + ink + '"/>' +
        '<circle cx="' + (cx + 70).toFixed(0) + '" cy="' + (110 + r() * 30).toFixed(0) + '" r="6" fill="' + ink + '"/>';
    } else if (ep.topic === 'design') {
      for (var row = 0; row < 3; row++) for (var col = 0; col < 4; col++) {
        var x = 30 + col * 86, y = 76 + row * 68, k = Math.floor(r() * 5), c = '';
        if (k === 0) c = '<circle cx="' + (x + 30) + '" cy="' + (y + 30) + '" r="28" fill="' + ink + '"/>';
        else if (k === 1) c = '<rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="56" height="56" rx="4" fill="none" stroke="' + ink + '" stroke-width="4"/>';
        else if (k === 2) c = '<path d="M' + x + ' ' + (y + 60) + 'V' + y + 'a60 60 0 0 1 60 60z" fill="' + ink + '"/>';
        else if (k === 3) c = '<circle cx="' + (x + 30) + '" cy="' + (y + 30) + '" r="26" fill="none" stroke="' + ink + '" stroke-width="4"/>';
        else c = '<path d="M' + x + ' ' + (y + 58) + 'h58V' + y + 'z" fill="' + ink + '"/>';
        m += c;
      }
    } else if (ep.topic === 'engineering') {
      var p = '', n = 6, w = 340 / n, top = 84, bot = 236;
      for (var j = 0; j < n; j++) {
        var x0 = 30 + j * w;
        p += 'M' + x0.toFixed(1) + ' ' + bot + 'L' + (x0 + w / 2).toFixed(1) + ' ' + top + 'L' + (x0 + w).toFixed(1) + ' ' + bot;
      }
      var fillAt = Math.floor(r() * n), fx = 30 + fillAt * w;
      m = '<path d="M' + fx.toFixed(1) + ' ' + bot + 'L' + (fx + w / 2).toFixed(1) + ' ' + top + 'L' + (fx + w).toFixed(1) + ' ' + bot + 'z" fill="' + ink + '"/>' +
        '<g fill="none" stroke="' + ink + '" stroke-width="5" stroke-linejoin="round"><path d="M30 ' + top + 'H370M30 ' + bot + 'H370' + p + '"/></g>';
    } else {
      // craft: woven scales
      for (var rr = 0; rr < 4; rr++) for (var cc = 0; cc < 5; cc++) {
        var sx = 30 + cc * 68 + (rr % 2 ? 34 : 0), sy = 96 + rr * 44;
        if (sx > 330) continue;
        var solid = r() < 0.35;
        m += '<path d="M' + sx + ' ' + sy + 'a34 34 0 0 1 68 0" fill="' + (solid ? ink : 'none') + '" stroke="' + ink + '" stroke-width="4"/>';
      }
    }
    return '<svg viewBox="0 0 400 400" role="img" aria-label="Cover art for episode ' + ep.id + '" xmlns="http://www.w3.org/2000/svg">' +
      '<rect width="400" height="400" fill="' + s.bg + '"/>' + m +
      '<text x="30" y="52" fill="' + ink + '" font-family="Syne, sans-serif" font-weight="800" font-size="22" letter-spacing="-0.8">overtone</text>' +
      '<text x="370" y="52" fill="' + ink + '" font-family="DM Mono, monospace" font-size="15" text-anchor="end">S' + ep.season + ' · E' + pad(ep.id) + '</text>' +
      '<text x="22" y="378" fill="' + ink + '" font-family="Syne, sans-serif" font-weight="800" font-size="122" letter-spacing="-6">' + pad(ep.id) + '</text>' +
      '<text x="370" y="372" fill="' + ink + '" font-family="DM Mono, monospace" font-size="15" text-anchor="end">' + topicOf(ep).label.toUpperCase() + '</text>' +
      '</svg>';
  }
  function paintCovers(root) {
    $$('[data-cover]', root).forEach(function (el) {
      var ep = getEp(el.getAttribute('data-cover'));
      if (ep) el.innerHTML = cover(ep);
    });
  }

  // Bar heights (0–1) for an episode's waveform. Stable per episode.
  function bars(ep, count) {
    var r = seeded(hash('wave' + ep.id)), out = [], a = r() * 6, b = r() * 6;
    for (var i = 0; i < count; i++) {
      var x = i / count;
      var v = 0.45 + 0.25 * Math.sin(x * 9 + a) + 0.15 * Math.sin(x * 23 + b) + (r() - 0.5) * 0.45;
      out.push(clamp(v, 0.12, 1));
    }
    return out;
  }
  function waveSVG(ep, count, cls) {
    var b = bars(ep, count), rects = '';
    for (var i = 0; i < b.length; i++) {
      var h = (b[i] * 100).toFixed(1);
      rects += '<rect x="' + (i * 4 + 0.6) + '" y="' + ((100 - h) / 2).toFixed(1) + '" width="2.8" height="' + h + '"/>';
    }
    return '<svg class="wave-layer ' + cls + '" viewBox="0 0 ' + count * 4 + ' 100" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">' + rects + '</svg>';
  }

  // Guest avatar: initials on the season color with a ring of sound arcs.
  function avatar(ep) {
    var s = seasonOf(ep);
    var initials = ep.guest.replace(/^Dr\.\s+/, '').split(/\s+&\s+|\s+/).filter(Boolean).map(function (w) { return w[0]; }).join('').slice(0, 2);
    return '<svg viewBox="0 0 120 120" aria-hidden="true"><rect width="120" height="120" rx="60" fill="' + s.bg + '"/>' +
      '<path d="M88 34a36 36 0 0 1 0 52M97 26a48 48 0 0 1 0 68" fill="none" stroke="' + s.ink + '" stroke-opacity=".35" stroke-width="3.5" stroke-linecap="round"/>' +
      '<text x="54" y="73" text-anchor="middle" fill="' + s.ink + '" font-family="Syne, sans-serif" font-weight="800" font-size="40" letter-spacing="-2">' + esc(initials) + '</text></svg>';
  }

  /* ------------------------------------------------------------------
   * 4. The player engine
   *    One shared player per page. Episodes with a `src` play through a real
   *    <audio> element; the others run on a clock so the demo works without
   *    audio files. Position, speed and volume are saved to localStorage.
   * ------------------------------------------------------------------ */
  var RATES = [1, 1.25, 1.5, 1.75, 2, 0.75];
  var progress = readJSON(STORE_PROGRESS, {});

  function savedPosition(ep) {
    var t = Number(progress[ep.id]);
    if (!isFinite(t) || t < 0) return 0;
    return t >= ep.duration - 2 ? 0 : t; // finished episodes start again from the top
  }
  function listened(ep) {
    var t = Number(progress[ep.id]);
    return isFinite(t) && t > 0 ? Math.min(t, ep.duration) : 0;
  }

  var Player = (function () {
    var state = { ep: null, t: 0, playing: false, rate: 1, volume: 0.9, muted: false };
    var audio = null, timer = null, last = 0, ticks = 0, subs = [];

    function emit(type) { subs.forEach(function (fn) { fn(type); }); }
    function duration() {
      if (!state.ep) return 0;
      return audio && isFinite(audio.duration) && audio.duration > 0 ? audio.duration : state.ep.duration;
    }
    function persist() {
      if (state.ep) progress[state.ep.id] = Math.round(state.t * 10) / 10;
      writeJSON(STORE_PROGRESS, progress);
      writeJSON(STORE_PLAYER, state.ep ? { id: state.ep.id, rate: state.rate, volume: state.volume, muted: state.muted, playing: state.playing } : { rate: state.rate, volume: state.volume, muted: state.muted });
    }
    function applyAudio() {
      if (!audio) return;
      audio.playbackRate = state.rate;
      audio.volume = state.volume;
      audio.muted = state.muted;
    }
    function stopClock() { clearInterval(timer); timer = null; }
    function tick() {
      var now = performance.now();
      state.t = Math.min(duration(), state.t + (now - last) / 1000 * state.rate);
      last = now;
      if (state.t >= duration()) { ended(); return; }
      emit('time');
      if (++ticks % 20 === 0) persist(); // about every 5 seconds
    }
    function ended() {
      stopClock();
      state.t = duration();
      state.playing = false;
      persist();
      emit('state');
    }
    function release() {
      stopClock();
      if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); audio = null; }
    }

    function load(ep, at) {
      if (!ep) return;
      if (state.ep && state.ep.id === ep.id) { if (at != null) seek(at); return; }
      if (state.ep) { pause(true); persist(); }
      release();
      state.ep = ep;
      state.t = at != null ? clamp(at, 0, ep.duration) : savedPosition(ep);
      state.playing = false;
      if (ep.src) {
        audio = new Audio();
        audio.preload = 'metadata';
        audio.src = ep.src;
        applyAudio();
        audio.addEventListener('loadedmetadata', function () { if (Math.abs(audio.currentTime - state.t) > 0.5) audio.currentTime = state.t; emit('time'); });
        audio.addEventListener('timeupdate', function () { state.t = audio.currentTime; emit('time'); if (++ticks % 20 === 0) persist(); });
        audio.addEventListener('ended', ended);
        audio.addEventListener('pause', function () { if (state.playing) { state.playing = false; persist(); emit('state'); } });
        audio.addEventListener('error', function () { state.playing = false; emit('state'); toast('This episode’s audio file could not be loaded.'); });
      }
      persist();
      emit('load');
    }
    // quiet: when resuming after a page change, a blocked autoplay just leaves the player paused.
    function play(quiet) {
      if (!state.ep) return;
      if (state.t >= duration() - 0.5) state.t = 0;
      state.playing = true;
      if (audio) {
        applyAudio();
        if (Math.abs(audio.currentTime - state.t) > 0.5) audio.currentTime = state.t;
        var p = audio.play();
        if (p && p.catch) p.catch(function () {
          state.playing = false;
          emit('state');
          if (!quiet) toast('Playback was blocked by the browser. Press play again.');
        });
      } else {
        stopClock();
        last = performance.now();
        timer = setInterval(tick, 250);
      }
      persist();
      emit('state');
    }
    function pause(silent) {
      if (!state.playing) return;
      state.playing = false;
      stopClock();
      if (audio) audio.pause();
      persist();
      if (!silent) emit('state');
    }
    function seek(t) {
      if (!state.ep) return;
      state.t = clamp(t, 0, duration());
      if (audio && audio.readyState > 0) audio.currentTime = state.t;
      last = performance.now();
      persist();
      emit('time');
    }
    function setRate(r) { state.rate = r; applyAudio(); persist(); emit('settings'); }
    function setVolume(v) { state.volume = clamp(v, 0, 1); state.muted = state.volume === 0; applyAudio(); persist(); emit('settings'); }
    function toggleMute() {
      state.muted = !state.muted;
      if (!state.muted && state.volume === 0) state.volume = 0.5;
      applyAudio(); persist(); emit('settings');
    }
    function unload() {
      pause(true);
      persist();
      release();
      state.ep = null;
      persist();
      emit('load');
    }

    // Restore what the visitor was listening to on the previous page.
    var saved = readJSON(STORE_PLAYER, {});
    if (RATES.indexOf(saved.rate) > -1) state.rate = saved.rate;
    if (typeof saved.volume === 'number') state.volume = clamp(saved.volume, 0, 1);
    state.muted = saved.muted === true;
    var resume = getEp(saved.id);

    window.addEventListener('pagehide', function () { if (state.ep) persist(); });

    return {
      state: state,
      duration: duration,
      on: function (fn) { subs.push(fn); },
      load: load, play: play, pause: pause, seek: seek,
      toggle: function () { if (state.playing) pause(); else play(); },
      skip: function (d) { seek(state.t + d); },
      setRate: setRate,
      cycleRate: function () { setRate(RATES[(RATES.indexOf(state.rate) + 1) % RATES.length]); },
      setVolume: setVolume, toggleMute: toggleMute, unload: unload,
      restore: function () { if (resume) { load(resume); if (saved.playing) play(true); } }
    };
  })();

  /* ------------------------------------------------------------------
   * 5. Player interfaces
   *    Any element with data-player-ui is a player:
   *      data-player-ui="mini"    follows whatever is loaded (the bar at the bottom)
   *      data-player-ui="latest"  always controls the newest episode (home hero)
   *      data-player-ui="62"      always controls that episode (episode page)
   *    Inside it, these hooks are wired up when present: [data-act="toggle|back|fwd|rate|mute|close"],
   *    [data-wave], [data-vol], [data-cur], [data-dur], [data-bar], [data-ui-title], [data-ui-kicker],
   *    [data-ui-guest], [data-ui-summary], [data-ui-cover], [data-ui-link].
   * ------------------------------------------------------------------ */
  var SKIP = 15;
  var uis = [];

  function bindPlayer(root) {
    var mode = root.getAttribute('data-player-ui');
    var fixed = mode === 'mini' ? null : mode === 'latest' ? latest() : getEp(mode);
    if (mode !== 'mini' && !fixed) return;
    var wave = $('[data-wave]', root), scrub = null, waveFor = null, chapters = [];
    var barCount = wave ? (wave.classList.contains('wave-sm') ? 90 : wave.classList.contains('wave-lg') ? 160 : 110) : 0;

    function ep() { return fixed || Player.state.ep; }
    function mine() { return !!(Player.state.ep && ep() && Player.state.ep.id === ep().id); }
    function ensure() { if (!mine()) Player.load(ep()); }

    function buildWave(e) {
      if (!wave || waveFor === e) return;
      waveFor = e;
      chapters = chaptersFor(e);
      var marks = root.hasAttribute('data-chapter-marks') ? '<div class="wave-marks" aria-hidden="true">' + chapters.slice(1).map(function (c) {
        return '<span class="wave-mark" style="left:' + (c.t / e.duration * 100).toFixed(2) + '%"></span>';
      }).join('') + '</div>' : '';
      wave.innerHTML = waveSVG(e, barCount, 'wave-base') + waveSVG(e, barCount, 'wave-fill') + '<span class="wave-head" aria-hidden="true"></span>' + marks +
        '<input type="range" class="wave-range" min="0" max="' + Math.floor(e.duration) + '" step="1" value="0" data-scrub aria-label="Seek" aria-keyshortcuts="ArrowLeft ArrowRight">';
      scrub = $('[data-scrub]', wave);
      scrub.addEventListener('input', function () { ensure(); Player.seek(Number(scrub.value)); });
    }

    function fill(e) {
      $$('[data-ui-title]', root).forEach(function (el) { el.textContent = e.title; });
      $$('[data-ui-kicker]', root).forEach(function (el) { el.textContent = kicker(e) + (mode === 'mini' ? '' : ' · ' + topicOf(e).label); });
      $$('[data-ui-guest]', root).forEach(function (el) { el.textContent = guestLine(e); });
      $$('[data-ui-summary]', root).forEach(function (el) { el.textContent = e.summary; });
      $$('[data-ui-link]', root).forEach(function (el) { el.setAttribute('href', epUrl(e)); });
      $$('[data-ui-cover]', root).forEach(function (el) { el.innerHTML = cover(e); });
    }

    function render(type) {
      var e = ep();
      if (!e) return;
      if (type === 'init' || (type === 'load' && mode === 'mini')) { buildWave(e); fill(e); }
      var on = mine(), t = on ? Player.state.t : savedPosition(e), d = on ? Player.duration() : e.duration;
      var playing = on && Player.state.playing, pct = d ? t / d * 100 : 0;
      root.classList.toggle('is-playing', playing);
      $$('[data-act="toggle"]', root).forEach(function (b) {
        b.setAttribute('aria-label', (playing ? 'Pause' : 'Play') + (mode === 'mini' ? '' : ' episode ' + e.id + ': ' + e.title));
        $('[data-icon-play]', b).classList.toggle('hidden', playing);
        $('[data-icon-pause]', b).classList.toggle('hidden', !playing);
      });
      if (wave) wave.style.setProperty('--p', pct.toFixed(3) + '%');
      if (scrub) { scrub.max = Math.floor(d); scrub.value = Math.round(t); scrub.setAttribute('aria-valuetext', spoken(t) + ' of ' + spoken(d)); }
      $$('[data-cur]', root).forEach(function (el) { el.textContent = clock(t); });
      $$('[data-dur]', root).forEach(function (el) { el.textContent = clock(d); });
      $$('[data-left]', root).forEach(function (el) { el.textContent = '-' + clock(d - t); });
      $$('[data-bar]', root).forEach(function (el) { el.style.width = pct.toFixed(2) + '%'; });
      $$('[data-act="rate"]', root).forEach(function (b) {
        var r = Player.state.rate + '×';
        b.textContent = r;
        b.setAttribute('aria-label', 'Playback speed: ' + r + '. Change speed');
      });
      var muted = Player.state.muted || Player.state.volume === 0;
      $$('[data-act="mute"]', root).forEach(function (b) {
        b.setAttribute('aria-pressed', String(muted));
        b.setAttribute('aria-label', 'Mute');
        $('[data-icon-vol]', b).classList.toggle('hidden', muted);
        $('[data-icon-muted]', b).classList.toggle('hidden', !muted);
      });
      $$('[data-vol]', root).forEach(function (v) {
        var val = Math.round((muted ? 0 : Player.state.volume) * 100);
        if (document.activeElement !== v) v.value = val;
        v.style.setProperty('--v', val + '%');
        v.setAttribute('aria-valuetext', val + '%');
      });
      if (root.__onRender) root.__onRender(t, on, playing);
    }

    root.addEventListener('click', function (ev) {
      var b = ev.target.closest('[data-act]');
      if (!b || !root.contains(b)) return;
      var act = b.getAttribute('data-act');
      if (act === 'toggle') { if (mine()) Player.toggle(); else { Player.load(ep()); Player.play(); } }
      else if (act === 'back') { ensure(); Player.skip(-SKIP); }
      else if (act === 'fwd') { ensure(); Player.skip(SKIP); }
      else if (act === 'rate') Player.cycleRate();
      else if (act === 'mute') Player.toggleMute();
      else if (act === 'close') { Player.unload(); var main = $('#main'); if (main) main.focus({ preventScroll: true }); }
    });
    $$('[data-vol]', root).forEach(function (v) {
      v.addEventListener('input', function () { Player.setVolume(Number(v.value) / 100); });
    });

    // Keyboard: Space or K play/pause, Left/Right or J/L skip 15 s, Up/Down volume, M mute.
    root.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      var t = e.target, isRange = t.type === 'range', isButton = t.tagName === 'BUTTON' || t.tagName === 'A';
      var k = e.key, handled = true;
      // On the seek bar itself: arrows move 5 s, Page Up/Down a minute, Home/End the ends.
      if (t.hasAttribute('data-scrub') && /^(ArrowLeft|ArrowRight|ArrowUp|ArrowDown|PageUp|PageDown|Home|End)$/.test(k)) {
        ensure();
        var step = { ArrowLeft: -5, ArrowDown: -5, ArrowRight: 5, ArrowUp: 5, PageDown: -60, PageUp: 60 }[k];
        if (k === 'Home') Player.seek(0); else if (k === 'End') Player.seek(Player.duration() - 1); else Player.skip(step);
        e.preventDefault();
        return;
      }
      if ((k === ' ' || k === 'Spacebar') && !isButton) $('[data-act="toggle"]', root).click();
      else if (k === 'k' || k === 'K') $('[data-act="toggle"]', root).click();
      else if ((k === 'ArrowLeft' && !isRange) || k === 'j' || k === 'J') { ensure(); Player.skip(-SKIP); }
      else if ((k === 'ArrowRight' && !isRange) || k === 'l' || k === 'L') { ensure(); Player.skip(SKIP); }
      else if (k === 'ArrowUp' && !isRange) Player.setVolume(Player.state.volume + 0.1);
      else if (k === 'ArrowDown' && !isRange) Player.setVolume(Player.state.volume - 0.1);
      else if (k === 'm' || k === 'M') Player.toggleMute();
      else handled = false;
      if (handled) e.preventDefault();
    });

    var ui = { root: root, render: render, ep: ep, mine: mine, ensure: ensure, fixed: fixed };
    uis.push(ui);
    Player.on(render);
    render('init');
    return ui;
  }

  // The mini player shows once an episode is loaded, except while the episode page's own
  // player for that same episode is on screen.
  var pagePlayerVisible = false, pagePlayerEp = null, miniShown = false;
  function updateMini() {
    var mini = $('#mini-player');
    if (!mini) return;
    var ep = Player.state.ep;
    var show = !!ep && !(pagePlayerVisible && pagePlayerEp && pagePlayerEp.id === ep.id);
    miniShown = show;
    document.documentElement.classList.toggle('has-mini', show);
    if (show) {
      mini.hidden = false;
      mini.inert = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { if (miniShown) mini.classList.remove('is-tucked'); }); });
    } else if (!mini.hidden) {
      if (mini.contains(document.activeElement)) { var main = $('#main'); if (main) main.focus({ preventScroll: true }); }
      mini.classList.add('is-tucked');
      mini.inert = true;
      setTimeout(function () { if (mini.classList.contains('is-tucked')) mini.hidden = true; }, reduceMotion ? 0 : 360);
    }
  }

  /* ------------------------------------------------------------------
   * 6. Episode cards, play buttons and the home page
   * ------------------------------------------------------------------ */
  var PLAY_ICON = '<svg data-icon-play viewBox="0 0 24 24" class="h-4 w-4 translate-x-px" fill="currentColor" aria-hidden="true"><path d="M7 4.8v14.4a1 1 0 0 0 1.5.86l12-7.2a1 1 0 0 0 0-1.72l-12-7.2A1 1 0 0 0 7 4.8z"/></svg>';
  var PAUSE_ICON = '<svg data-icon-pause viewBox="0 0 24 24" class="hidden h-4 w-4" fill="currentColor" aria-hidden="true"><rect x="5.5" y="4" width="4.5" height="16" rx="1.4"/><rect x="14" y="4" width="4.5" height="16" rx="1.4"/></svg>';

  function playButton(ep, extra) {
    return '<button type="button" class="btn-play-sm ' + (extra || '') + '" data-play="' + ep.id + '" aria-label="Play episode ' + ep.id + ': ' + esc(ep.title) + '">' + PLAY_ICON + PAUSE_ICON + '</button>';
  }
  function progressLine(ep) {
    var l = listened(ep);
    if (!l) return '<p class="meta mt-3" data-progress="' + ep.id + '">' + date(ep.date) + ' · ' + length(ep.duration) + '</p>';
    var done = l >= ep.duration - 2;
    return '<div class="mt-3" data-progress="' + ep.id + '"><p class="meta">' + date(ep.date) + ' · ' + (done ? 'Played' : length(ep.duration - l) + ' left') + '</p>' +
      '<div class="bar mt-2" aria-hidden="true"><span style="width:' + (l / ep.duration * 100).toFixed(1) + '%"></span></div></div>';
  }
  function topicTag(ep) {
    var t = topicOf(ep);
    return '<span class="inline-flex items-center gap-1.5"><span class="topic-dot ' + t.dot + '" aria-hidden="true"></span>' + t.label + '</span>';
  }

  // A card with cover art (home "start here" and related episodes).
  function epCard(ep) {
    return '<li class="ep-card reveal flex min-w-0 flex-col" data-ep="' + ep.id + '">' +
      '<a href="' + epUrl(ep) + '" class="cover rounded-3xl" tabindex="-1" aria-hidden="true">' + cover(ep) + '</a>' +
      '<div class="mt-5 flex items-start justify-between gap-3"><div class="min-w-0">' +
      '<p class="meta flex flex-wrap items-center gap-x-3 gap-y-1"><span>' + kicker(ep) + '</span>' + topicTag(ep) + '<span class="eq text-lilac" aria-hidden="true"><i></i><i></i><i></i><i></i></span></p>' +
      '<h3 class="mt-2 font-display text-[1.35rem] leading-[1.1] font-bold tracking-[-0.015em]"><a href="' + epUrl(ep) + '" class="ep-link">' + esc(ep.title) + '</a></h3>' +
      '<p class="mt-1.5 text-sm text-muted">' + esc(ep.guest) + '</p></div>' + playButton(ep, 'mt-1') + '</div>' +
      progressLine(ep) + '</li>';
  }
  // A list row (episodes archive).
  function epRow(ep, q) {
    return '<li class="ep-row" data-ep="' + ep.id + '">' +
      '<a href="' + epUrl(ep) + '" class="cover" tabindex="-1" aria-hidden="true">' + cover(ep) + '</a>' +
      '<div class="min-w-0">' +
      '<p class="meta flex flex-wrap items-center gap-x-3 gap-y-1"><span class="text-lilac">' + kicker(ep) + '</span>' + topicTag(ep) + '<span class="hidden sm:inline">' + date(ep.date) + '</span><span class="eq text-lilac" aria-hidden="true"><i></i><i></i><i></i><i></i></span></p>' +
      '<h3 class="mt-1.5 font-display text-lg leading-tight font-bold tracking-[-0.015em] sm:text-[1.6rem]"><a href="' + epUrl(ep) + '" class="ep-link">' + mark(ep.title, q) + '</a></h3>' +
      '<p class="mt-1 text-sm text-muted">' + mark(ep.guest, q) + '<span class="hidden sm:inline"> · ' + mark(ep.role, q) + '</span></p>' +
      '<p class="mt-2 hidden max-w-2xl text-[0.95rem] text-subtle md:line-clamp-2">' + mark(ep.summary, q) + '</p>' +
      listenedBar(ep) +
      '</div>' +
      '<div class="flex flex-col items-end gap-2.5">' + playButton(ep) + '<span class="meta whitespace-nowrap">' + length(ep.duration) + '</span></div>' +
      '</li>';
  }
  function listenedBar(ep) {
    var l = listened(ep);
    if (!l) return '';
    var done = l >= ep.duration - 2;
    return '<div class="mt-3 flex max-w-xs items-center gap-3" data-progress="' + ep.id + '"><div class="bar" aria-hidden="true"><span style="width:' + (l / ep.duration * 100).toFixed(1) + '%"></span></div>' +
      '<span class="meta shrink-0 text-lilac">' + (done ? 'Played' : length(ep.duration - l) + ' left') + '</span></div>';
  }
  function mark(text, q) {
    var safe = esc(text);
    if (!q) return safe;
    var re = new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/&/g, '&amp;') + ')', 'ig');
    return safe.replace(re, '<mark>$1</mark>');
  }

  // Play buttons anywhere on the page: data-play="<episode id>".
  function syncPlayButtons() {
    var cur = Player.state.ep, playing = Player.state.playing;
    $$('[data-play]').forEach(function (b) {
      var ep = getEp(b.getAttribute('data-play'));
      if (!ep) return;
      var on = !!cur && cur.id === ep.id && playing;
      b.setAttribute('aria-label', (on ? 'Pause' : 'Play') + ' episode ' + ep.id + ': ' + ep.title);
      b.setAttribute('aria-pressed', String(on));
      $('[data-icon-play]', b).classList.toggle('hidden', on);
      $('[data-icon-pause]', b).classList.toggle('hidden', !on);
      var host = b.closest('[data-ep]');
      if (host) host.classList.toggle('is-playing', on);
    });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-play]');
    if (!b) return;
    var ep = getEp(b.getAttribute('data-play'));
    if (!ep) return;
    if (Player.state.ep && Player.state.ep.id === ep.id) Player.toggle();
    else { Player.load(ep); Player.play(); }
  });

  function initHome() {
    $$('[data-ep-cards]').forEach(function (list) {
      list.innerHTML = list.getAttribute('data-ep-cards').split(',').map(getEp).filter(Boolean).map(epCard).join('');
    });
    $$('[data-episode-count]').forEach(function (el) { el.textContent = EPISODES.length; });
    $$('[data-total-hours]').forEach(function (el) {
      el.textContent = Math.round(EPISODES.reduce(function (sum, e) { return sum + e.duration; }, 0) / 3600);
    });
    var topics = $('[data-topic-list]');
    if (topics) {
      topics.innerHTML = TOPICS.map(function (t) {
        var n = EPISODES.filter(function (e) { return e.topic === t.id; }).length;
        return '<li><a href="episodes.html?topic=' + t.id + '" class="group flex items-center gap-5 border-b border-line py-6 transition hover:pl-3">' +
          '<span class="topic-dot h-3 w-3 ' + t.dot + '" aria-hidden="true"></span>' +
          '<span class="min-w-0 flex-1"><span class="block font-display text-3xl font-bold tracking-[-0.03em] sm:text-[2.6rem]">' + t.label + '</span>' +
          '<span class="mt-1 block text-sm text-subtle">' + t.blurb + '</span></span>' +
          '<span class="meta whitespace-nowrap">' + n + ' episodes</span>' +
          '<svg viewBox="0 0 20 20" class="h-5 w-5 shrink-0 text-subtle transition group-hover:translate-x-1 group-hover:text-paper" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 10h12m-5-5 5 5-5 5"/></svg></a></li>';
      }).join('');
    }
    // Decorative waveform in the newsletter panel.
    $$('[data-deco-wave]').forEach(function (svg) {
      var b = bars(latest(), 60), out = '';
      for (var i = 0; i < b.length; i++) { var h = b[i] * 260; out += '<rect x="' + (i * 10) + '" y="' + (150 - h / 2).toFixed(1) + '" width="5" height="' + h.toFixed(1) + '" rx="2.5"/>'; }
      svg.innerHTML = out;
    });
  }

  // Episode links that should always point at the newest episode.
  function initLatestLinks() {
    var ep = latest();
    $$('[data-latest-link]').forEach(function (a) { a.setAttribute('href', epUrl(ep)); });
  }

  /* ------------------------------------------------------------------
   * 7. Episodes archive (episodes.html)
   *    URL state: ?q=bells&season=2&topic=craft&sort=oldest
   * ------------------------------------------------------------------ */
  var PAGE_SIZE = 12;
  var SORTS = {
    newest: function (a, b) { return b.date < a.date ? -1 : b.date > a.date ? 1 : b.id - a.id; },
    oldest: function (a, b) { return a.date < b.date ? -1 : a.date > b.date ? 1 : a.id - b.id; },
    longest: function (a, b) { return b.duration - a.duration; },
    shortest: function (a, b) { return a.duration - b.duration; }
  };
  function readFilters(search) {
    var p = new URLSearchParams(search);
    var season = Number(p.get('season'));
    var topic = p.get('topic');
    var sort = p.get('sort');
    return {
      q: (p.get('q') || '').trim().slice(0, 80),
      season: SEASONS.some(function (s) { return s.id === season; }) ? season : 0,
      topic: TOPICS.some(function (t) { return t.id === topic; }) ? topic : '',
      sort: SORTS[sort] ? sort : 'newest'
    };
  }
  function filterEpisodes(f) {
    var q = f.q.toLowerCase();
    return EPISODES.filter(function (e) {
      if (f.season && e.season !== f.season) return false;
      if (f.topic && e.topic !== f.topic) return false;
      if (q && (e.title + ' ' + e.guest + ' ' + e.role + ' ' + e.summary + ' ' + topicOf(e).label).toLowerCase().indexOf(q) === -1) return false;
      return true;
    }).sort(SORTS[f.sort]);
  }

  function initArchive() {
    var list = $('#episode-list');
    if (!list) return;
    var form = $('#archive-filters'), search = $('#ep-search'), sort = $('#ep-sort');
    var seasonBox = $('#season-filter'), topicBox = $('#topic-filter');
    var count = $('#ep-count'), more = $('#ep-more'), empty = $('#ep-empty'), chips = $('#ep-active');
    var f = readFilters(window.location.search), shown = PAGE_SIZE, timer = null;

    seasonBox.innerHTML = '<button type="button" class="seg-btn" data-season="0">All</button>' + SEASONS.map(function (s) {
      return '<button type="button" class="seg-btn" data-season="' + s.id + '" aria-label="S' + s.id + ': ' + s.label + ' (' + s.years + ')">S' + s.id + '</button>';
    }).join('');
    topicBox.innerHTML = TOPICS.map(function (t) {
      return '<button type="button" class="topic-btn" data-topic="' + t.id + '"><span class="topic-dot ' + t.dot + '" aria-hidden="true"></span>' + t.label + ' <span class="count" data-topic-count="' + t.id + '"></span></button>';
    }).join('');

    function writeUrl() {
      var p = new URLSearchParams();
      if (f.q) p.set('q', f.q);
      if (f.season) p.set('season', f.season);
      if (f.topic) p.set('topic', f.topic);
      if (f.sort !== 'newest') p.set('sort', f.sort);
      var qs = p.toString();
      try { history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '')); } catch (e) { /* file:// in some browsers */ }
    }
    function render() {
      var res = filterEpisodes(f);
      var page = res.slice(0, shown);
      list.innerHTML = page.map(function (e) { return epRow(e, f.q); }).join('');
      empty.hidden = res.length > 0;
      list.hidden = res.length === 0;
      count.textContent = res.length === EPISODES.length ? 'All ' + res.length + ' episodes' : res.length + (res.length === 1 ? ' episode' : ' episodes') + ' found';
      var left = res.length - page.length;
      more.hidden = left <= 0;
      more.textContent = 'Show ' + Math.min(PAGE_SIZE, left) + ' more (' + left + ' left)';
      // Counts per topic within the current season and search.
      TOPICS.forEach(function (t) {
        var n = filterEpisodes({ q: f.q, season: f.season, topic: t.id, sort: 'newest' }).length;
        var el = $('[data-topic-count="' + t.id + '"]');
        if (el) el.textContent = n;
      });
      $$('[data-season]', seasonBox).forEach(function (b) { b.setAttribute('aria-pressed', String(Number(b.getAttribute('data-season')) === f.season)); });
      $$('[data-topic]', topicBox).forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-topic') === f.topic)); });
      var active = [];
      if (f.q) active.push(['q', '“' + esc(f.q) + '”']);
      if (f.season) active.push(['season', 'Season ' + f.season]);
      if (f.topic) active.push(['topic', esc(topicOf({ topic: f.topic }).label)]);
      chips.innerHTML = active.map(function (a) {
        return '<button type="button" class="inline-flex items-center gap-2 rounded-full bg-paper px-3 py-1 text-sm font-semibold text-night transition hover:bg-lilac" data-clear="' + a[0] + '">' + a[1] +
          '<svg viewBox="0 0 20 20" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><path d="m5 5 10 10M15 5 5 15"/></svg><span class="sr-only">Remove filter</span></button>';
      }).join('') + (active.length > 1 ? '<button type="button" class="text-link text-sm" data-clear="all">Clear all</button>' : '');
      writeUrl();
      syncPlayButtons();
      revealNow(list);
    }
    function reset() { f = { q: '', season: 0, topic: '', sort: 'newest' }; search.value = ''; sort.value = 'newest'; shown = PAGE_SIZE; render(); }

    search.value = f.q;
    sort.value = f.sort;
    form.addEventListener('submit', function (e) { e.preventDefault(); clearTimeout(timer); f.q = search.value.trim(); shown = PAGE_SIZE; render(); });
    search.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () { f.q = search.value.trim(); shown = PAGE_SIZE; render(); }, 180);
    });
    sort.addEventListener('change', function () { f.sort = sort.value; render(); });
    seasonBox.addEventListener('click', function (e) {
      var b = e.target.closest('[data-season]'); if (!b) return;
      f.season = Number(b.getAttribute('data-season')); shown = PAGE_SIZE; render();
    });
    topicBox.addEventListener('click', function (e) {
      var b = e.target.closest('[data-topic]'); if (!b) return;
      var id = b.getAttribute('data-topic');
      f.topic = f.topic === id ? '' : id; shown = PAGE_SIZE; render();
    });
    chips.addEventListener('click', function (e) {
      var b = e.target.closest('[data-clear]'); if (!b) return;
      var k = b.getAttribute('data-clear');
      if (k === 'all') { reset(); search.focus(); return; }
      if (k === 'q') search.value = '';
      f[k] = k === 'season' ? 0 : '';
      shown = PAGE_SIZE;
      render();
      search.focus();
    });
    $$('[data-reset-filters]').forEach(function (b) { b.addEventListener('click', function () { reset(); search.focus(); }); });
    more.addEventListener('click', function () {
      var before = shown;
      shown += PAGE_SIZE;
      render();
      // Move focus to the first newly shown episode so keyboard users keep their place.
      var first = $$('.ep-row', list)[before];
      var link = first && $('h3 a', first);
      if (link) link.focus();
    });
    render();
  }

  /* ------------------------------------------------------------------
   * 8. Episode page (episode.html?id=62&t=754)
   * ------------------------------------------------------------------ */
  // Chapters from DETAILS, or a standard running order spread across the episode.
  function chaptersFor(ep) {
    var d = DETAILS[ep.id];
    if (d && d.chapters) return d.chapters;
    var D = ep.duration, first = firstName(ep.guest);
    var at = function (share) { return Math.round(D * share / 10) * 10; };
    if (isHostEpisode(ep)) {
      return [{ t: 0, title: 'Cold open' }, { t: 70, title: 'Welcome back' }, { t: at(0.18), title: 'Your letters' }, { t: at(0.45), title: ep.title },
        { t: at(0.72), title: 'Corrections and confessions' }, { t: at(0.9), title: 'What’s next for the show' }];
    }
    return [{ t: 0, title: 'Cold open' }, { t: 95, title: 'Meet ' + first }, { t: at(0.14), title: 'How ' + first + ' got here' }, { t: at(0.36), title: ep.title },
      { t: at(0.62), title: 'The hardest part' }, { t: at(0.8), title: 'Listener questions' }, { t: at(0.93), title: 'Lightning round' }];
  }
  function relatedTo(ep, n) {
    return EPISODES.filter(function (e) { return e.id !== ep.id && e.topic === ep.topic; })
      .sort(function (a, b) { return Math.abs(a.id - ep.id) - Math.abs(b.id - ep.id); }).slice(0, n || 3);
  }
  // Show notes as blocks: a string is a paragraph, {h} a heading, {ul} a list, {links} a list of links.
  function notesFor(ep) {
    var d = DETAILS[ep.id];
    if (d && d.notes) return d.notes;
    return [
      ep.summary,
      { h: 'In this episode' },
      { ul: chaptersFor(ep).slice(1).map(function (c) { return c.title; }) },
      { h: 'Mentioned' },
      { links: relatedTo(ep, 2).map(function (e) { return ['Episode ' + e.id + ': ' + e.title, epUrl(e)]; }) }
    ];
  }
  function notesHTML(blocks) {
    return blocks.map(function (b) {
      if (typeof b === 'string') return '<p>' + esc(b) + '</p>';
      if (b.h) return '<h3>' + esc(b.h) + '</h3>';
      if (b.ul) return '<ul>' + b.ul.map(function (li) { return '<li>' + esc(li) + '</li>'; }).join('') + '</ul>';
      if (b.links) return '<ul>' + b.links.map(function (l) {
        var ext = /^https?:/.test(l[1]);
        return '<li><a href="' + esc(l[1]) + '"' + (ext ? ' rel="noopener" target="_blank"' : '') + '>' + esc(l[0]) + (ext ? '<span class="sr-only"> (opens in a new tab)</span>' : '') + '</a></li>';
      }).join('') + '</ul>';
      return '';
    }).join('');
  }
  // Transcript lines as [seconds, speaker, text]. Generated episodes get a short excerpt.
  function transcriptFor(ep) {
    var d = DETAILS[ep.id];
    if (d && d.transcript) return { lines: d.transcript, full: true };
    var ch = chaptersFor(ep), g = firstName(ep.guest);
    if (isHostEpisode(ep)) {
      return { full: false, lines: [
        [0, 'Eli', 'From a former piano workshop in Philadelphia, this is Overtone. I’m Eli Brandt.'],
        [7, 'Nadia', 'And I’m Nadia Ferreira. No guest today. Just the two of us and a very large pile of your emails.'],
        [70, 'Eli', ep.summary],
        [ch[2].t, 'Nadia', 'First letter. It’s about knots. Of course it’s about knots.'],
        [ch[3].t + 40, 'Eli', ep.quote],
        [ch[ch.length - 1].t, 'Nadia', 'That’s it from us. Thank you for listening, and for writing in. See you in two weeks.']
      ] };
    }
    return { full: false, lines: [
      [0, 'Eli', 'From a former piano workshop in Philadelphia, this is Overtone. I’m Eli Brandt.'],
      [8, 'Nadia', 'And I’m Nadia Ferreira. Today: ' + ep.title.replace(/\.$/, '') + '.'],
      [30, 'Nadia', ep.summary],
      [ch[1].t, 'Eli', ep.guest + ', welcome to the show.'],
      [ch[1].t + 6, g, 'Thanks for having me. I’ve been listening for a while, so this is a little surreal.'],
      [ch[2].t, 'Nadia', 'Let’s start at the beginning. How does someone become a ' + ep.role.toLowerCase() + '?'],
      [ch[2].t + 9, g, 'I don’t think anyone plans it. I followed a problem that wouldn’t leave me alone, and one day it was my job.'],
      [ch[4].t, 'Eli', 'What’s the part of the work people never see?'],
      [ch[4].t + 7, g, 'The waiting. Most of it is testing, waiting and starting again. The exciting part is maybe five percent of the time.'],
      [ch[ch.length - 1].t - 40, 'Nadia', 'If listeners remember one thing from today, what should it be?'],
      [ch[ch.length - 1].t - 32, g, ep.quote],
      [ch[ch.length - 1].t, 'Eli', 'Lightning round. Favorite tool?']
    ] };
  }

  function initEpisodePage() {
    var root = $('[data-episode-page]');
    if (!root) return;
    var params = new URLSearchParams(window.location.search);
    var ep = params.has('id') ? getEp(params.get('id')) : latest();
    if (!ep) {
      var tpl = $('#episode-missing');
      root.replaceWith(tpl.content.cloneNode(true));
      document.title = 'Episode not found — Overtone';
      return;
    }
    var topic = topicOf(ep), season = seasonOf(ep), d = DETAILS[ep.id] || {};
    document.title = ep.title + ' (S' + ep.season + ' E' + ep.id + ') — Overtone';
    var desc = $('meta[name="description"]');
    if (desc) desc.setAttribute('content', ep.summary);

    // Header
    $('[data-ep-crumb]').textContent = kicker(ep);
    $('[data-ep-cover]').innerHTML = cover(ep);
    $('[data-ep-kicker]').innerHTML = '<span>Season ' + ep.season + ' · Episode ' + ep.id + '</span>' + topicTag(ep);
    $('[data-ep-title]').textContent = ep.title;
    $('[data-ep-guestline]').textContent = guestLine(ep);
    $('[data-ep-meta]').textContent = date(ep.date) + ' · ' + length(ep.duration);
    $('[data-ep-summary]').textContent = ep.summary;
    $('[data-ep-quote]').textContent = '“' + ep.quote + '”';
    $('[data-ep-quote-by]').textContent = '— ' + ep.guest;
    var glow = $('[data-ep-glow]');
    if (glow) glow.style.background = 'radial-gradient(60% 80% at 15% 0%, ' + season.bg + '33, transparent 70%)';
    $$('[data-topic-link]').forEach(function (a) { a.setAttribute('href', 'episodes.html?topic=' + topic.id); a.textContent = 'More ' + topic.label.toLowerCase() + ' episodes'; });

    // Player
    var playerEl = $('#episode-player');
    playerEl.setAttribute('data-player-ui', ep.id);
    var chapters = chaptersFor(ep);
    var chapterList = $('#chapter-list');
    chapterList.innerHTML = chapters.map(function (c, i) {
      var end = i < chapters.length - 1 ? chapters[i + 1].t : ep.duration;
      return '<li><button type="button" class="chapter" data-seek="' + c.t + '"><span class="chapter-time">' + clock(c.t) + '</span><span class="min-w-0 font-semibold">' + esc(c.title) + '</span><span class="meta">' + length(end - c.t) + '</span></button></li>';
    }).join('');

    // Transcript
    var tr = transcriptFor(ep);
    var tList = $('#transcript-list'), tBox = $('#transcript-box'), tSearch = $('#transcript-search'), tCount = $('#transcript-count'), follow = $('#transcript-follow');
    $('#transcript-note').textContent = tr.full ? 'Lightly edited for clarity. Select a line to play from there.' : 'Excerpt. The full transcript is added within a week of release. Select a line to play from there.';
    function drawTranscript(q) {
      var n = 0;
      tList.innerHTML = tr.lines.map(function (l) {
        var hit = !q || (l[1] + ' ' + l[2]).toLowerCase().indexOf(q.toLowerCase()) > -1;
        if (hit) n++;
        return '<li' + (hit ? '' : ' hidden') + '><button type="button" class="t-line" data-seek="' + l[0] + '"><span class="t-time">' + clock(l[0]) + '</span><span><span class="t-who">' + esc(l[1]) + '</span> ' + mark(l[2], q) + '</span></button></li>';
      }).join('');
      tCount.textContent = q ? (n === 1 ? '1 line matches' : n + ' lines match') + ' “' + q + '”' : tr.lines.length + ' lines';
      $('#transcript-empty').hidden = n > 0;
      lastLine = -1;
      highlight(true);
    }
    var tTimer = null;
    tSearch.addEventListener('input', function () { clearTimeout(tTimer); tTimer = setTimeout(function () { drawTranscript(tSearch.value.trim()); }, 150); });
    $('#transcript-form').addEventListener('submit', function (e) { e.preventDefault(); drawTranscript(tSearch.value.trim()); });

    // Seek from chapters and transcript lines, then play.
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-seek]');
      if (!b) return;
      ui.ensure();
      Player.seek(Number(b.getAttribute('data-seek')));
      if (!Player.state.playing) Player.play();
    });

    var lastChapter = -1, lastLine = -1, userScrolled = 0;
    tBox.addEventListener('wheel', function () { userScrolled = Date.now(); }, { passive: true });
    tBox.addEventListener('touchmove', function () { userScrolled = Date.now(); }, { passive: true });
    function indexAt(list, t, key) {
      var idx = -1;
      for (var i = 0; i < list.length; i++) if ((key ? list[i][key] : list[i][0]) <= t + 0.25) idx = i;
      return idx;
    }
    var currentT = 0, isOn = false, isPlaying = false;
    function highlight(force) {
      var ci = indexAt(chapters, currentT, 't');
      if (ci !== lastChapter || force) {
        lastChapter = ci;
        $$('.chapter', chapterList).forEach(function (b, i) {
          if (i === ci) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current');
        });
        var now = $('[data-now-chapter]');
        if (now) now.textContent = ci > -1 ? chapters[ci].title : '';
      }
      var li = indexAt(tr.lines, currentT);
      if (li !== lastLine || force) {
        lastLine = li;
        var btns = $$('.t-line', tList);
        btns.forEach(function (b, i) { if (i === li) b.setAttribute('aria-current', 'true'); else b.removeAttribute('aria-current'); });
        // Follow along: keep the current line in view inside the transcript box only.
        var cur = btns[li];
        if (cur && follow.checked && isPlaying && !cur.parentNode.hidden && Date.now() - userScrolled > 4000 && !tBox.contains(document.activeElement)) {
          var top = cur.offsetTop - tBox.clientHeight / 3;
          tBox.scrollTo({ top: Math.max(0, top), behavior: reduceMotion ? 'auto' : 'smooth' });
        }
      }
    }
    playerEl.__onRender = function (t, on, playing) { currentT = t; isOn = on; isPlaying = playing; highlight(false); updateShare(); };

    // Guest card
    $('[data-guest-avatar]').innerHTML = avatar(ep);
    $('[data-guest-name]').textContent = ep.guest;
    $('[data-guest-role]').textContent = ep.role;
    $('[data-guest-bio]').textContent = d.bio || (isHostEpisode(ep) ? 'Your hosts, with no guest to hide behind. Episodes like this one close every season.' : ep.guest + ' joined us in season ' + ep.season + '. ' + ep.summary);
    var gl = $('[data-guest-links]');
    gl.innerHTML = (d.links || []).map(function (l) {
      return '<li><a class="text-link text-sm" href="' + esc(l[1]) + '" rel="noopener" target="_blank">' + esc(l[0]) + '<span class="sr-only"> (opens in a new tab)</span></a></li>';
    }).join('');
    gl.hidden = !(d.links && d.links.length);

    // Notes and related
    $('#show-notes').innerHTML = notesHTML(notesFor(ep)) + '<p class="text-sm text-subtle">' + esc(SHOW.credits) + '</p>';
    $('#related-list').innerHTML = relatedTo(ep, 3).map(epCard).join('');
    $('[data-related-title]').textContent = 'More on ' + topic.label.toLowerCase();

    // Share: copy a link, optionally starting at the current position (?t=seconds).
    var shareUrl = $('#share-url'), shareAt = $('#share-at'), shareAtLabel = $('[data-share-at]');
    function base() { return window.location.href.split('?')[0].split('#')[0]; }
    function updateShare() {
      shareAtLabel.textContent = clock(currentT);
      shareUrl.value = base() + '?id=' + ep.id + (shareAt.checked && currentT >= 1 ? '&t=' + Math.floor(currentT) : '');
    }
    shareAt.addEventListener('change', updateShare);
    $('#share-copy').addEventListener('click', function () {
      updateShare();
      var text = shareUrl.value;
      function done() { toast(shareAt.checked && currentT >= 1 ? 'Link copied. It starts at ' + clock(currentT) + '.' : 'Link copied.'); }
      if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(text).then(done, fallback);
      else fallback();
      function fallback() {
        shareUrl.focus();
        shareUrl.select();
        try { document.execCommand('copy'); done(); } catch (err) { toast('Select the link and copy it.'); }
      }
    });
    $$('[data-share-native]').forEach(function (b) {
      if (!navigator.share) { b.hidden = true; return; }
      b.hidden = false;
      b.addEventListener('click', function () { updateShare(); navigator.share({ title: ep.title, url: shareUrl.value }).catch(function () {}); });
    });

    var ui = bindPlayer(playerEl);
    pagePlayerEp = ep;
    drawTranscript('');

    // ?t= starts the episode at that point (paused: browsers don't allow autoplay).
    var t = parseTime(params.get('t'));
    if (t != null && t > 0 && t < ep.duration) {
      Player.load(ep, t);
      var note = $('#start-note');
      note.textContent = 'Shared from ' + clock(t) + '. Press play to start there.';
      note.hidden = false;
    }

    // Hide the mini player while this player is on screen.
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (entries) {
        pagePlayerVisible = entries[0].isIntersecting;
        updateMini();
      }, { threshold: 0.15 }).observe(playerEl);
    } else { pagePlayerVisible = true; }

    // Shortcuts anywhere on this page (not while typing): K play/pause, J/L skip, M mute.
    document.addEventListener('keydown', function (e) {
      if (e.altKey || e.ctrlKey || e.metaKey || e.defaultPrevented) return;
      var tag = (e.target.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select' || e.target.isContentEditable) return;
      var mini = $('#mini-player');
      if (playerEl.contains(e.target) || (mini && mini.contains(e.target))) return;
      var k = e.key.toLowerCase();
      if (k === 'k') { $('[data-act="toggle"]', playerEl).click(); e.preventDefault(); }
      else if (k === 'j') { ui.ensure(); Player.skip(-SKIP); e.preventDefault(); }
      else if (k === 'l') { ui.ensure(); Player.skip(SKIP); e.preventDefault(); }
      else if (k === 'm') { Player.toggleMute(); e.preventDefault(); }
    });
  }

  /* ------------------------------------------------------------------
   * 9. Advertise page charts (inline SVG and CSS bars, each with a data table)
   * ------------------------------------------------------------------ */
  function initCharts() {
    var line = $('#chart-growth');
    if (line) {
      var data = AUDIENCE.growth, W = 640, H = 260, L = 44, R = 12, T = 16, B = 30;
      var max = 50000, x = function (i) { return L + i * (W - L - R) / (data.length - 1); }, y = function (v) { return T + (1 - v / max) * (H - T - B); };
      var grid = '', pts = data.map(function (d, i) { return x(i).toFixed(1) + ',' + y(d[1]).toFixed(1); });
      for (var v = 0; v <= max; v += 10000) {
        grid += '<line x1="' + L + '" x2="' + (W - R) + '" y1="' + y(v) + '" y2="' + y(v) + '" stroke="#342c42" stroke-dasharray="' + (v ? '3 5' : '0') + '"/>' +
          '<text class="chart-axis" x="' + (L - 8) + '" y="' + (y(v) + 4) + '" text-anchor="end">' + (v / 1000) + 'k</text>';
      }
      var labels = data.map(function (d, i) {
        if (i % 2) return '';
        var anchor = i === 0 ? 'start' : i === data.length - 1 ? 'end' : 'middle';
        return '<text class="chart-axis" x="' + x(i) + '" y="' + (H - 8) + '" text-anchor="' + anchor + '">' + d[0] + '</text>';
      }).join('');
      var lastP = pts[pts.length - 1].split(',');
      line.innerHTML = '<defs><linearGradient id="growth-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#b9a4ff" stop-opacity=".45"/><stop offset="1" stop-color="#b9a4ff" stop-opacity="0"/></linearGradient></defs>' + grid +
        '<path d="M' + pts[0] + 'L' + pts.join('L') + 'L' + x(data.length - 1) + ',' + y(0) + 'L' + x(0) + ',' + y(0) + 'z" fill="url(#growth-fill)"/>' +
        '<polyline points="' + pts.join(' ') + '" fill="none" stroke="#b9a4ff" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>' +
        '<circle cx="' + lastP[0] + '" cy="' + lastP[1] + '" r="6" fill="#0e0c13" stroke="#ff6b4a" stroke-width="3"/>' + labels;
    }
    var donut = $('#chart-work');
    if (donut) {
      var total = 0, R2 = 70, C = 2 * Math.PI * R2, arcs = '';
      AUDIENCE.work.forEach(function (w) {
        var len = w[1] / 100 * C;
        arcs += '<circle cx="100" cy="100" r="' + R2 + '" fill="none" stroke="' + w[2] + '" stroke-width="26" stroke-dasharray="' + (len - 3).toFixed(2) + ' ' + (C - len + 3).toFixed(2) + '" stroke-dashoffset="' + (-total).toFixed(2) + '" transform="rotate(-90 100 100)"/>';
        total += len;
      });
      donut.innerHTML = arcs + '<text x="100" y="96" text-anchor="middle" fill="#f4efe6" font-family="Syne, sans-serif" font-weight="800" font-size="30">58%</text><text x="100" y="118" text-anchor="middle" fill="#b6adc2" font-family="DM Mono, monospace" font-size="11">DESIGN + TECH</text>';
      $('#legend-work').innerHTML = AUDIENCE.work.map(function (w) {
        return '<li class="flex items-center justify-between gap-4"><span class="flex items-center gap-2.5"><span class="h-3 w-3 rounded-full" style="background:' + w[2] + '" aria-hidden="true"></span>' + w[0] + '</span><span class="font-mono text-muted">' + w[1] + '%</span></li>';
      }).join('');
    }
    function barList(el, rows, color) {
      if (!el) return;
      var max = Math.max.apply(null, rows.map(function (r) { return r[1]; }));
      el.innerHTML = rows.map(function (r) {
        return '<li class="bar-row"><span class="truncate text-muted">' + r[0] + '</span><span class="bar-track" aria-hidden="true"><span class="bar-fill ' + color + '" style="--w:' + (r[1] / max * 100).toFixed(1) + '%"></span></span><span class="text-right font-mono">' + r[1] + '%</span></li>';
      }).join('');
    }
    barList($('#chart-age'), AUDIENCE.age, 'bg-sky');
    barList($('#chart-countries'), AUDIENCE.countries, 'bg-mint');
    // Data tables for screen readers and anyone who prefers numbers.
    $$('[data-chart-table]').forEach(function (tb) {
      var rows = AUDIENCE[tb.getAttribute('data-chart-table')];
      tb.innerHTML = rows.map(function (r) {
        var v = typeof r[1] === 'number' && r[1] > 100 ? r[1].toLocaleString('en-US') : r[1] + '%';
        return '<tr class="border-t border-line"><th scope="row" class="py-2 pr-4 text-left font-normal text-muted">' + r[0] + '</th><td class="py-2 text-right font-mono">' + v + '</td></tr>';
      }).join('');
    });
  }

  /* ------------------------------------------------------------------
   * 10. Forms: newsletter, advertise inquiry and guest pitch
   *     Every form[data-validate] is checked on submit, with inline errors.
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
    if (f.type === 'url' && !/^(https?:\/\/)?[^\s.]+\.[^\s]{2,}$/i.test(v)) return 'Enter a web address, like example.com/work.';
    if (f.minLength > 0 && v.length < f.minLength) return 'Please write at least ' + f.minLength + ' characters (' + (f.minLength - v.length) + ' to go).';
    return '';
  }
  // A group of checkboxes where at least one must be checked: <fieldset data-required-group id="x">.
  function groupMessage(g) {
    return $$('input:checked', g).length ? '' : (g.getAttribute('data-msg') || 'Choose at least one option.');
  }
  function setGroupError(g, msg) {
    var err = document.getElementById(g.id + '-error');
    if (msg) g.setAttribute('aria-invalid', 'true'); else g.removeAttribute('aria-invalid');
    if (err) err.textContent = msg;
  }

  // Called when a form passes validation. Demo only: shows the success state and sends nothing.
  // To send for real, post the form first, for example:
  //   fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
  //     .then(function (res) { if (res.ok) showSuccess(form); else toast('Something went wrong. Please email us.'); });
  function onValid(form) {
    showSuccess(form);
  }
  // A short reference for the confirmation, like OT-7K2Q (no 0/O or 1/I to misread).
  function makeRef(prefix) {
    var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '';
    for (var i = 0; i < 4; i++) out += chars.charAt(Math.floor(Math.random() * chars.length));
    return prefix + '-' + out;
  }
  function showSuccess(form) {
    var box = document.getElementById(form.getAttribute('data-success'));
    var nameField = form.elements.name;
    var first = (nameField && nameField.value.trim().split(/\s+/)[0]) || '';
    var email = form.elements.email ? form.elements.email.value.trim() : '';
    if (box) {
      $$('[data-first-name]', box).forEach(function (el) { el.textContent = first ? ', ' + first : ''; });
      $$('[data-email]', box).forEach(function (el) { el.textContent = email; });
      var ref = makeRef('OT');
      $$('[data-ref]', box).forEach(function (el) { el.textContent = ref; });
      box.hidden = false;
      form.hidden = true;
      box.setAttribute('tabindex', '-1');
      box.focus();
    }
    form.reset();
    $$('[data-counter]', form).forEach(function (c) { c.dispatchEvent(new Event('input')); });
    $$('[data-toggle-when]', form).forEach(function (el) { el.hidden = true; });
  }
  function initForms() {
    $$('form[data-validate]').forEach(function (form) {
      function fields() {
        return $$('input:not([type="hidden"]):not([type="radio"]), textarea, select', form).filter(function (f) {
          if (f.closest('[hidden]')) return false;
          if (f.closest('[data-required-group]')) return false;
          return f.required || f.type === 'email' || f.type === 'url' || f.minLength > 0;
        });
      }
      fields().concat($$('[data-toggle-when] input', form)).forEach(function (f) {
        f.addEventListener('blur', function () { if (f.value || f.getAttribute('aria-invalid')) setFieldError(f, fieldMessage(f)); });
        f.addEventListener(f.type === 'checkbox' || f.tagName === 'SELECT' ? 'change' : 'input', function () {
          if (f.getAttribute('aria-invalid') === 'true') setFieldError(f, fieldMessage(f));
        });
      });
      $$('[data-required-group]', form).forEach(function (g) {
        g.addEventListener('change', function () { if (g.getAttribute('aria-invalid')) setGroupError(g, groupMessage(g)); });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var bad = fields().filter(function (f) { var m = fieldMessage(f); setFieldError(f, m); return !!m; });
        $$('[data-required-group]', form).forEach(function (g) {
          var m = groupMessage(g);
          setGroupError(g, m);
          if (m) bad.push($('input', g));
        });
        if (bad.length) {
          bad.sort(function (a, b) { return a.compareDocumentPosition(b) & 4 ? -1 : 1; });
          bad[0].focus();
          return;
        }
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
      });
    });
    // Character counters: <textarea data-counter="pitch-count" minlength="120">
    $$('[data-counter]').forEach(function (f) {
      var out = document.getElementById(f.getAttribute('data-counter'));
      function upd() {
        var n = f.value.trim().length, min = f.minLength;
        out.textContent = n < min ? n + ' / ' + min + ' characters minimum' : n + ' characters';
        out.classList.toggle('text-mint', n >= min);
      }
      f.addEventListener('input', upd);
      upd();
    });
    // Show extra fields for a radio choice: <div data-toggle-when="pitch-for=other">
    $$('[data-toggle-when]').forEach(function (box) {
      var parts = box.getAttribute('data-toggle-when').split('='), form = box.closest('form');
      function upd() {
        var on = form.elements[parts[0]] && form.elements[parts[0]].value === parts[1];
        box.hidden = !on;
        $$('input, textarea, select', box).forEach(function (f) { f.required = on; if (!on) setFieldError(f, ''); });
      }
      $$('input[name="' + parts[0] + '"]', form).forEach(function (r) { r.addEventListener('change', upd); });
      upd();
    });
    // sponsor.html?format=season preselects an ad format in the inquiry form.
    var fmt = new URLSearchParams(window.location.search).get('format');
    var box = fmt && $('input[name="formats"][value="' + fmt.replace(/[^a-z-]/g, '') + '"]');
    if (box) box.checked = true;
  }

  /* ------------------------------------------------------------------
   * 11. Subscribe page, header, mobile menu, scroll reveal
   * ------------------------------------------------------------------ */
  function initSubscribe() {
    $$('[data-feed-url]').forEach(function (el) { if (el.tagName === 'INPUT') el.value = SHOW.feed; else el.textContent = SHOW.feed; });
    $$('[data-copy-feed]').forEach(function (b) {
      b.addEventListener('click', function () {
        var input = $('#feed-url');
        function done() { toast('Feed address copied. Paste it into your podcast app.'); }
        if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(SHOW.feed).then(done, fallback);
        else fallback();
        function fallback() {
          if (!input) return;
          input.focus();
          input.select();
          try { document.execCommand('copy'); done(); } catch (e) { toast('Select the address and copy it.'); }
        }
      });
    });
    var nextEl = $('[data-next-release]');
    if (nextEl) {
      // New episodes come out every other Wednesday after the latest one.
      var d = new Date(latest().date + 'T12:00:00Z'), now = new Date();
      while (d <= now) d.setUTCDate(d.getUTCDate() + 14);
      nextEl.textContent = date(d.toISOString().slice(0, 10));
    }
  }

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
    function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
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

  // Progress lines on cards follow the player without re-rendering the cards.
  function syncProgress() {
    $$('[data-progress]').forEach(function (el) {
      var ep = getEp(el.getAttribute('data-progress'));
      var l = ep && listened(ep);
      var bar = $('.bar > span', el);
      if (bar && l) bar.style.width = (l / ep.duration * 100).toFixed(1) + '%';
    });
  }

  /* Start everything */
  initLatestLinks();
  initHome();
  paintCovers(document);
  initEpisodePage();
  $$('[data-player-ui]').forEach(function (el) { if (el.id !== 'episode-player') bindPlayer(el); });
  Player.on(function (type) {
    if (type !== 'time') { syncPlayButtons(); updateMini(); }
    else syncProgress();
  });
  Player.restore();
  syncPlayButtons();
  updateMini();
  initArchive();
  initCharts();
  initForms();
  initSubscribe();
  initChrome();

  // Exposed for tests and debugging.
  window.Overtone = { EPISODES: EPISODES, Player: Player, filterEpisodes: filterEpisodes, readFilters: readFilters, chaptersFor: chaptersFor, transcriptFor: transcriptFor };
})();

/* ------------------------------------------------------------------
 * 12. Back to top
 * ------------------------------------------------------------------ */
/* ---------- Back to top ----------
   A button that fades in after you scroll about one screen down. It returns to
   the top (instantly if the visitor prefers reduced motion) and moves keyboard
   focus to the main content. It lifts itself above toasts and the mini player
   so they never overlap. Mark your own UI with data-back-to-top-avoid.
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
