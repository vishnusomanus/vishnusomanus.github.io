/* Larchmere Books: the data behind the shop, events, book clubs and reading finder.
 * main.js reads everything from window.LARCHMERE. Prices are whole cents ($28.00 = 2800).
 *
 * Books
 *   id        goes in the URL (book.html?book=lantern-ferry); short, lowercase, unique
 *   lines     the title split into lines for the drawn cover (keep each line under ~14 characters)
 *   genre     a key of GENRES
 *   audience  "adult" | "teen" | "middle" (ages 8–12) | "young" (ages 3–7)
 *   pub       publication date (YYYY-MM-DD). Recent and upcoming dates move with KEEP_DEMO_CURRENT.
 *   formats   price per format in cents; leave a format out when the book isn't published in it
 *   stock     copies on our shelves per format; 0 means we order it in (3–5 days)
 *   pick      a STAFF id when it's a staff pick, with the shelf-talker in `note`
 *   moods     used by the reading finder: cozy, gripping, thoughtful, otherworldly, true, funny
 *   cover     colors (bg, fg = title, ac = accent, dk = shade), a motif drawn by main.js, and
 *             where the title sits ("top" or "bottom")
 */
window.LARCHMERE = {
  GENRES: {
    fiction: { label: "Fiction", short: "Fiction" },
    mystery: { label: "Mystery & crime", short: "Mystery" },
    speculative: { label: "Sci-fi & fantasy", short: "Sci-fi & fantasy" },
    poetry: { label: "Poetry", short: "Poetry" },
    nonfiction: { label: "Nonfiction", short: "Nonfiction" },
    teen: { label: "Teen", short: "Teen" },
    kids: { label: "Kids", short: "Kids" }
  },

  FORMATS: {
    hardcover: { label: "Hardcover", note: "Cloth-bound with a jacket" },
    paperback: { label: "Paperback", note: "Lighter, and kinder to a tote bag" }
  },

  STAFF: {
    odessa: { name: "Odessa Merriweather", first: "Odessa", role: "Owner and buyer", reads: "Literary fiction and nature writing" },
    tobiah: { name: "Tobiah Renwick", first: "Tobiah", role: "Café and events", reads: "Poetry, cookbooks and anything about bread" },
    mireille: { name: "Mireille Duchaine", first: "Mireille", role: "Children’s and teen buyer", reads: "Picture books, middle grade and teen fantasy" },
    augie: { name: "Augie Sorensen", first: "Augie", role: "Bookseller", reads: "Mysteries, sci-fi and long books about small islands" }
  },

  BOOKS: [
    {
      id: "lantern-ferry", title: "The Lantern Ferry", lines: ["The Lantern", "Ferry"], author: "Henrietta Rookwood",
      genre: "fiction", audience: "adult", pages: 344, pub: "2026-10-06",
      formats: { hardcover: 2800 }, stock: { hardcover: 9 },
      pick: "odessa", note: "A ferry captain, one last crossing, forty years of passengers. I read it in a single night and then started it again.",
      moods: ["thoughtful", "cozy"],
      blurb: "On the last night of a lake ferry’s service, its captain remembers everyone she carried across.",
      description: "For forty-one years Edda Lusk has piloted the Merrow Bell between two small towns that never quite liked each other. On the final crossing before the new bridge opens, she lights the old lanterns one by one and lets the passengers she remembers come back aboard: a runaway, a bride, a man with a piano, a boy who grew up to build the bridge. Tender, funny and wise about the places we leave.",
      cover: { bg: "#1f3b57", fg: "#f6e7c4", ac: "#f2a541", dk: "#132638", motif: "ferry", title: "top" }
    },
    {
      id: "teller-hill", title: "Nine Winters on Teller Hill", lines: ["Nine Winters", "on Teller Hill"], author: "Joaquin Aldridge",
      genre: "fiction", audience: "adult", pages: 412, pub: "2025-02-11",
      formats: { hardcover: 2799, paperback: 1799 }, stock: { hardcover: 2, paperback: 7 },
      moods: ["thoughtful", "cozy"],
      blurb: "A family farm, a long feud and nine winters that change everything.",
      description: "Each chapter is one winter on a hill farm in the Northeast Kingdom, told by a different member of the Teller family. Snowed-in kitchens, a barn fire, a wedding nobody approved of and a will read aloud at the worst possible moment. A big, warm, slow-burning family novel for long evenings.",
      cover: { bg: "#e9e4d8", fg: "#22313b", ac: "#b23a2a", dk: "#7d8a92", motif: "hill", title: "bottom" }
    },
    {
      id: "quiet-arithmetic", title: "The Quiet Arithmetic", lines: ["The Quiet", "Arithmetic"], author: "Lucian Aldaine",
      genre: "fiction", audience: "adult", pages: 268, pub: "2026-09-22",
      formats: { hardcover: 2700 }, stock: { hardcover: 4 },
      moods: ["thoughtful"],
      blurb: "A retired math teacher keeps a ledger of small kindnesses in a town that is coming apart.",
      description: "After his wife dies, Elias Brandolini starts counting: the number of times a neighbor waves, the minutes a stranger waits to hold a door. What starts as grief becomes a quiet project that ties a fractured mill town back together, one sum at a time. Spare, precise and unexpectedly moving.",
      cover: { bg: "#d9c9a3", fg: "#1c2a33", ac: "#c8401f", dk: "#8a7650", motif: "abacus", title: "top" }
    },
    {
      id: "corbin-falls", title: "Every Light in Corbin Falls", lines: ["Every Light", "in Corbin", "Falls"], author: "Emmett Delmonico",
      genre: "fiction", audience: "adult", pages: 376, pub: "2024-05-14",
      formats: { hardcover: 2699, paperback: 1800 }, stock: { hardcover: 1, paperback: 6 },
      moods: ["cozy", "funny"],
      blurb: "One street, one power cut, twelve households and the longest night of the year.",
      description: "When an ice storm knocks out power on Quillon Street, twelve households have to get through the longest night of the year with candles, a shared generator and each other. A warm ensemble novel full of misunderstandings, borrowed blankets and one unlikely romance at number nine.",
      cover: { bg: "#21243d", fg: "#fbe8b0", ac: "#f5c35b", dk: "#3c3f63", motif: "windows", title: "bottom" }
    },
    {
      id: "ice-house", title: "Letters from the Ice House", lines: ["Letters", "from the", "Ice House"], author: "Greta Fallowfield",
      genre: "fiction", audience: "adult", pages: 304, pub: "2026-10-27",
      formats: { hardcover: 2900 }, stock: { hardcover: 0 },
      moods: ["thoughtful", "gripping"],
      blurb: "A bundle of letters found under the sawdust of an old ice house reopens a century-old disappearance.",
      description: "Restoring her grandmother’s lakeside ice house, a conservator finds forty letters wrapped in oilcloth, written in 1911 by a woman who vanished the winter they were sent. Told in letters and in the present day, it is a story about what we preserve, and what preserves us.",
      cover: { bg: "#cfe0e3", fg: "#123447", ac: "#c8401f", dk: "#7ea5b0", motif: "letter", title: "top" }
    },
    {
      id: "two-editions", title: "A Death in Two Editions", lines: ["A Death in", "Two Editions"], author: "Cosima Pennywhistle",
      genre: "mystery", audience: "adult", pages: 318, pub: "2026-10-13",
      formats: { hardcover: 2799 }, stock: { hardcover: 6 },
      pick: "augie", note: "A rare-book dealer, a forged first edition and a body in the stacks. Clever, bookish and very funny. Guessed wrong twice.",
      moods: ["gripping", "funny"],
      blurb: "A rare-book dealer finds a forged first edition and, behind it, a body.",
      description: "Philomena Ricci deals in rare books from a shop too small for her opinions. When a collector brings in a first edition that cannot exist, she follows its trail through auction houses, a disgraced bookbinder and a library basement, where the second copy is waiting next to a man who knew too much. The first in a new series.",
      cover: { bg: "#7a1f1f", fg: "#f4e6cf", ac: "#e8b04b", dk: "#4d1212", motif: "books", title: "top" }
    },
    {
      id: "gullhaven", title: "Low Tide at Gullhaven", lines: ["Low Tide", "at Gullhaven"], author: "Osric Sallis",
      genre: "mystery", audience: "adult", pages: 290, pub: "2023-09-05",
      formats: { paperback: 1699 }, stock: { paperback: 8 },
      moods: ["gripping", "cozy"],
      blurb: "A harbormaster, a missing lobster boat and a town that knows more than it says.",
      description: "Harbormaster Noreen Tackaberry has one rule: nothing leaves Gullhaven on a falling tide without her knowing. So when the Persistence is found drifting and empty at dawn, she starts asking the questions nobody in a fishing town wants asked. A salty, satisfying village mystery.",
      cover: { bg: "#8fb3b0", fg: "#10302f", ac: "#f4efe1", dk: "#527c79", motif: "gull", title: "top" }
    },
    {
      id: "reservoir-kept", title: "What the Reservoir Kept", lines: ["What the", "Reservoir", "Kept"], author: "Cordelia Haskett",
      genre: "mystery", audience: "adult", pages: 352, pub: "2025-06-03",
      formats: { hardcover: 2699, paperback: 1799 }, stock: { hardcover: 3, paperback: 5 },
      moods: ["gripping"],
      blurb: "When the reservoir runs low, the church of a flooded village rises, and so does an old crime.",
      description: "In a drought summer the water behind the Wyckoff Dam drops far enough to show the steeple of the village it drowned in 1952. Detective Wrenna Coyle grew up hearing that the bell still rings underwater. She did not expect to find someone who made sure it would. Atmospheric and genuinely chilling.",
      cover: { bg: "#123a3a", fg: "#e7efe4", ac: "#c9a24a", dk: "#0b2626", motif: "bell", title: "bottom" }
    },
    {
      id: "towers-of-vell", title: "The Towers of Vell", lines: ["The Towers", "of Vell"], author: "Anneliese Varro",
      genre: "speculative", audience: "adult", pages: 512, pub: "2024-11-12",
      formats: { hardcover: 2999, paperback: 1999 }, stock: { hardcover: 2, paperback: 4 },
      moods: ["otherworldly", "gripping"],
      blurb: "In a city of living glass, the apprentice who can hear it crack is the only one who can save it.",
      description: "The towers of Vell are grown, not built, from glass that remembers every hand that shaped it. Apprentice glass-grower Tamsen can hear the hairline cracks no one else can, and she is hearing far too many. A sweeping fantasy of guilds, secrets and one impossible key.",
      cover: { bg: "#2c1e4a", fg: "#f2e9ff", ac: "#5fd0c4", dk: "#1b1230", motif: "key", title: "top" }
    },
    {
      id: "salt-moon", title: "Salt Moon Signal", lines: ["Salt Moon", "Signal"], author: "Kavya Vantongeren",
      genre: "speculative", audience: "adult", pages: 398, pub: "2026-11-03",
      formats: { hardcover: 2899 }, stock: { hardcover: 0 },
      moods: ["otherworldly", "gripping"],
      blurb: "A lonely radio operator on a salt-mining moon picks up a voice that knows her name.",
      description: "Night-shift radio operator Oona Halvard has spent three years listening to static on Halite IV, a moon that is mostly salt and silence. Then a signal answers back, from a ship that disappeared before she was born. Tense, warm and full of ideas: the space novel our sci-fi club has been waiting for.",
      cover: { bg: "#0f1b2d", fg: "#f5f1e8", ac: "#ff7a59", dk: "#22344f", motif: "moon", title: "bottom" }
    },
    {
      id: "slow-stars", title: "A Map of Slow Stars", lines: ["A Map of", "Slow Stars"], author: "Teodor Iwasaki",
      genre: "speculative", audience: "adult", pages: 448, pub: "2025-09-16",
      formats: { hardcover: 2899, paperback: 1899 }, stock: { hardcover: 1, paperback: 6 },
      pick: "augie", note: "A generation ship navigated by poets, because the math stopped working. I think about this book about once a week.",
      moods: ["otherworldly", "thoughtful"],
      blurb: "Three hundred years into its voyage, a generation ship is steered by the stars its poets remember.",
      description: "When the navigation archive of the Long Patience is lost, the ship’s only map is an epic poem its crew have recited for ten generations. Young recitant Ilka Varnum begins to suspect that the poem is wrong, and that someone made it wrong on purpose.",
      cover: { bg: "#e4dccb", fg: "#1b2433", ac: "#d14b2a", dk: "#2e4a6b", motif: "stars", title: "top" }
    },
    {
      id: "tidewater-kings", title: "Tidewater Kings", lines: ["Tidewater", "Kings"], author: "Valeria Ferreiro",
      genre: "teen", audience: "teen", pages: 420, pub: "2026-09-29",
      formats: { hardcover: 2099 }, stock: { hardcover: 7 },
      moods: ["otherworldly", "gripping"],
      blurb: "Twin heirs to a drowned kingdom race to raise its crown before the tide comes back.",
      description: "Every hundred years the sea draws back from the kingdom of Mardova for a single day. Twins Rafa and Lis have until the tide turns to find the crown their ancestors drowned with, and only one of them can wear it. Fast, romantic and full of salt. Ages 14 and up.",
      cover: { bg: "#0e5a63", fg: "#fff3d6", ac: "#f2b134", dk: "#083a40", motif: "crown", title: "top" }
    },
    {
      id: "lit-lighthouse", title: "The Year We Lit the Lighthouse", lines: ["The Year", "We Lit the", "Lighthouse"], author: "Soren Abernethy",
      genre: "teen", audience: "teen", pages: 296, pub: "2025-04-08",
      formats: { hardcover: 1999, paperback: 1299 }, stock: { hardcover: 2, paperback: 9 },
      pick: "mireille", note: "Four teens, one decommissioned lighthouse, a summer that matters. Funny and big-hearted. My most-handsold teen book this year.",
      moods: ["funny", "cozy"],
      blurb: "Four friends spend one summer restoring a lighthouse, and finding out who they are.",
      description: "Mae, Otis, Dalia and Fenn have one summer left before everything changes, and a town council that has given up on the old Harrow Point light. With a borrowed boat, a lot of paint and very little permission, they decide to light it one more time. Ages 12 and up.",
      cover: { bg: "#f2d3a5", fg: "#1f2d3d", ac: "#c8401f", dk: "#3a5a78", motif: "lighthouse", title: "bottom" }
    },
    {
      id: "small-atlas", title: "A Small Atlas of Rain", lines: ["A Small", "Atlas", "of Rain"], author: "Wilhelmina Ostberg",
      genre: "poetry", audience: "adult", pages: 96, pub: "2024-03-19",
      formats: { paperback: 1700 }, stock: { paperback: 5 },
      moods: ["thoughtful"],
      blurb: "Poems about weather, distance and the people we only see when it rains.",
      description: "Sixty short poems mapped like an atlas: each named for a place and a kind of rain. Quiet, exact and surprising, from a poet who spent ten years as a weather observer on a mountain summit.",
      cover: { bg: "#dfe7ea", fg: "#1d3a4a", ac: "#3f7ea6", dk: "#93aebb", motif: "rain", title: "top" }
    },
    {
      id: "field-guide", title: "Field Guide to Leaving", lines: ["Field", "Guide to", "Leaving"], author: "Efua Quaye",
      genre: "poetry", audience: "adult", pages: 112, pub: "2026-10-20",
      formats: { paperback: 1800 }, stock: { paperback: 12 },
      pick: "tobiah", note: "Poems shaped like bird-guide entries for every way we say goodbye. I read one aloud in the café most mornings this month.",
      moods: ["thoughtful"],
      blurb: "Poems shaped like a birder’s field guide, one for every way of saying goodbye.",
      description: "Each poem is an entry: markings, call, range, habits. The species are departures: the slow drift, the slammed door, the migration that comes back every spring. A playful, aching debut collection.",
      cover: { bg: "#f1e6cf", fg: "#3b2a1a", ac: "#c8401f", dk: "#8a6a3e", motif: "feather", title: "bottom" }
    },
    {
      id: "long-field", title: "The Long Field Almanac", lines: ["The Long", "Field", "Almanac"], author: "Rowan Thale",
      genre: "nonfiction", audience: "adult", pages: 288, pub: "2025-10-07",
      formats: { hardcover: 3000, paperback: 2000 }, stock: { hardcover: 3, paperback: 6 },
      pick: "odessa", note: "One hayfield, one year, watched every single day. Slow in the best way. Keep it on the kitchen table and read a week at a time.",
      moods: ["true", "cozy"],
      blurb: "A year in the life of one Vermont hayfield, observed day by day.",
      description: "Naturalist Rowan Thale walked the same twelve-acre field every morning for a year and wrote down what he saw: bobolinks, frost heaves, a fox, the first cut and the last. Part almanac, part diary, with hand-drawn charts of what blooms when.",
      cover: { bg: "#e7d77a", fg: "#28331c", ac: "#5b7a2e", dk: "#a6913a", motif: "field", title: "top" }
    },
    {
      id: "hard-winters", title: "Bread for Hard Winters", lines: ["Bread", "for Hard", "Winters"], author: "Ingeborg Olin",
      genre: "nonfiction", audience: "adult", pages: 256, pub: "2026-11-10",
      formats: { hardcover: 3500 }, stock: { hardcover: 0 },
      pick: "tobiah", note: "Eighty loaves for cold kitchens. We baked the rye with caraway for the café and it sold out by ten. Preorder now.",
      moods: ["true", "cozy"],
      blurb: "Eighty breads for cold kitchens, from quick oat loaves to a three-day rye.",
      description: "A baker from northern Vermont collects the breads that got her family through long winters: seeded ryes, potato rolls, maple oat loaves, crackers that keep for weeks. Clear methods, real timings and a chapter on baking in a cold house.",
      cover: { bg: "#c7562f", fg: "#fff3e1", ac: "#f4c27a", dk: "#8e3a1f", motif: "bread", title: "top" }
    },
    {
      id: "ice-roads", title: "Ice Roads of the Inland Sea", lines: ["Ice Roads", "of the", "Inland Sea"], author: "Imelda Bexley",
      genre: "nonfiction", audience: "adult", pages: 368, pub: "2024-10-01",
      formats: { hardcover: 3200, paperback: 2099 }, stock: { hardcover: 1, paperback: 4 },
      moods: ["true", "thoughtful"],
      blurb: "The forgotten winter roads across Lake Champlain, and the people who drove them.",
      description: "For two centuries, when the lake froze, it became a highway: sleighs, mail coaches, ice-cutters and, later, Model Ts crossed the ice between New York and Vermont. Historian Imelda Bexley follows the old routes and the families who remember them.",
      cover: { bg: "#eef3f4", fg: "#1a3346", ac: "#c8401f", dk: "#8fb0c2", motif: "iceroad", title: "top" }
    },
    {
      id: "stone-wall", title: "How to Mend a Stone Wall", lines: ["How to", "Mend a", "Stone Wall"], author: "Ansel Penrick",
      genre: "nonfiction", audience: "adult", pages: 224, pub: "2023-04-18",
      formats: { paperback: 1999 }, stock: { paperback: 3 },
      moods: ["true", "cozy"],
      blurb: "A waller’s guide to dry stone, and a quiet book about patience.",
      description: "Part manual, part memoir: how to read a fallen wall, sort the stones, set the footings and lift a hearting, from a man who has mended New England walls for thirty years. Practical enough to follow, calm enough to read in bed.",
      cover: { bg: "#b9b3a4", fg: "#1f2422", ac: "#4d6a3a", dk: "#6f6a5e", motif: "stones", title: "top" }
    },
    {
      id: "forty-bulbs", title: "Forty Bulbs Before Frost", lines: ["Forty Bulbs", "Before Frost"], author: "Agathe Brennagh",
      genre: "nonfiction", audience: "adult", pages: 192, pub: "2025-08-19",
      formats: { hardcover: 2600 }, stock: { hardcover: 5 },
      moods: ["true", "cozy"],
      blurb: "Plant in October, be glad in April: forty bulbs that thrive in a cold garden.",
      description: "A friendly, illustrated guide to forty bulbs that come back after a zone 4 winter, from snowdrops to alliums, with planting depths, pairings and what to do about squirrels.",
      cover: { bg: "#3e2b3f", fg: "#f7e9f0", ac: "#e98cb0", dk: "#6d4a5e", motif: "bulbs", title: "bottom" }
    },
    {
      id: "sugarhouse", title: "The Sugarhouse Year", lines: ["The", "Sugarhouse", "Year"], author: "Leland Quimby",
      genre: "nonfiction", audience: "adult", pages: 240, pub: "2026-09-15",
      formats: { hardcover: 2799 }, stock: { hardcover: 8 },
      moods: ["true", "cozy", "funny"],
      blurb: "A retired lawyer learns to make maple syrup, badly at first.",
      description: "At sixty-two, Leland Quimby bought a sugarbush with six hundred taps and no idea what to do with them. His memoir of one season of mud, sap lines, burnt pans and generous neighbors is the funniest book we have read about Vermont in years.",
      cover: { bg: "#8a4b22", fg: "#fbefdc", ac: "#e9a23b", dk: "#5c2f13", motif: "maple", title: "top" }
    },
    {
      id: "moss-moth", title: "Moss the Moth Goes to School", lines: ["Moss the", "Moth Goes", "to School"], author: "Tansy Brambleworth",
      genre: "kids", audience: "young", pages: 32, pub: "2026-09-08",
      formats: { hardcover: 1899 }, stock: { hardcover: 10 },
      moods: ["funny", "cozy"],
      blurb: "A shy moth would much rather stay in the lamp. Ages 3 to 6.",
      description: "Moss is a moth who likes one thing: the warm glow of the porch lamp. But today is the first day of school, and the classroom has a window full of moonlight. A gentle, funny picture book about first days and finding your light. Ages 3 to 6.",
      cover: { bg: "#ffd36b", fg: "#2d2a4a", ac: "#7a68c9", dk: "#e3a83b", motif: "moth", title: "bottom" }
    },
    {
      id: "borrowed-books", title: "The Bear Who Borrowed Books", lines: ["The Bear", "Who Borrowed", "Books"], author: "Crispin Fairlie",
      genre: "kids", audience: "young", pages: 40, pub: "2025-03-04",
      formats: { hardcover: 1899, paperback: 899 }, stock: { hardcover: 4, paperback: 11 },
      moods: ["funny", "cozy"],
      blurb: "A bear joins the library and returns everything a little late. Ages 4 to 7.",
      description: "Mortimer Bear loves the library so much that he borrows every book in it, then cannot quite bring himself to give them back. A very funny story about sharing, with a hibernation twist. Ages 4 to 7.",
      cover: { bg: "#9fd1c2", fg: "#2a1d14", ac: "#8a5a35", dk: "#5f9e8b", motif: "bear", title: "top" }
    },
    {
      id: "badger-door", title: "Pippa Dunmore and the Badger Door", lines: ["Pippa Dunmore", "and the", "Badger Door"], author: "Briony Sallow",
      genre: "kids", audience: "middle", pages: 248, pub: "2024-06-11",
      formats: { hardcover: 1799, paperback: 899 }, stock: { hardcover: 3, paperback: 10 },
      pick: "mireille", note: "There is a door in the old oak, and Pippa is not supposed to open it. Perfect read-aloud for 8 to 11, with chapters that end exactly right.",
      moods: ["otherworldly", "funny"],
      blurb: "There’s a door in the old oak behind the school. Ages 8 to 12.",
      description: "Pippa Dunmore is new in town, bored and banned from the woods. So naturally she finds the door in the hollow oak, and the badger council on the other side that has been waiting for someone exactly like her. A warm, funny adventure. Ages 8 to 12.",
      cover: { bg: "#2f5d3a", fg: "#fbf0d2", ac: "#f2a74b", dk: "#1d3d25", motif: "oak", title: "top" }
    },
    {
      id: "looking-for-champ", title: "The Summer We Looked for Champ", lines: ["The Summer", "We Looked", "for Champ"], author: "Perrin Tennick",
      genre: "kids", audience: "middle", pages: 232, pub: "2025-05-13",
      formats: { hardcover: 1799, paperback: 999 }, stock: { hardcover: 2, paperback: 8 },
      moods: ["funny", "gripping"],
      blurb: "Two cousins, one leaky canoe and a lake monster nobody believes in. Ages 8 to 12.",
      description: "Thisbe is sure the thing she saw off her grandmother’s camp on Lake Champlain was not a log. Her cousin Abner is sure of nothing, but he can build a sonar out of a bucket. One summer, one notebook of sightings and a canoe that needs bailing every ten minutes. Funny, sunburnt and secretly about family. Ages 8 to 12.",
      cover: { bg: "#3d7f8f", fg: "#fff4dc", ac: "#f2a541", dk: "#245361", motif: "champ", title: "top" }
    }
  ],

  /* Author events and one-off kids' events. Dates are real and move forward in whole weeks while
   * KEEP_DEMO_CURRENT is on (see main.js). type: a key of EVENT_TYPES. book: the book it's about.
   * title and blurb can be a string or { winter, spring, summer, fall } for wording that has to match the
   * season of the date shown (the demo moves these dates forward, so a December event may be shown in July). */
  EVENT_TYPES: {
    author: { label: "Author events", one: "Author event" },
    club: { label: "Book clubs", one: "Book club" },
    kids: { label: "Kids & teens", one: "Kids & teens" }
  },

  EVENTS: [
    { id: "rookwood-reading", type: "author", date: "2026-10-23", start: "19:00", end: "20:00", book: "lantern-ferry", capacity: 60,
      title: "Henrietta Rookwood reads from The Lantern Ferry",
      blurb: {
        fall: "A reading and conversation with Odessa, followed by a signing. Hot cider from the café.",
        winter: "A reading and conversation with Odessa, followed by a signing. Hot cider from the café.",
        spring: "A reading and conversation with Odessa, followed by a signing. Tea and maple cookies from the café.",
        summer: "A reading and conversation with Odessa, followed by a signing. Iced tea and lemonade from the café."
      } },
    { id: "pennywhistle-conversation", type: "author", date: "2026-10-29", start: "19:00", end: "20:00", book: "two-editions", capacity: 50,
      title: "Cosima Pennywhistle in conversation with Augie Sorensen",
      blurb: "Forgeries, first editions and how to hide a body in a bookstore, from the author of A Death in Two Editions." },
    { id: "salt-moon-launch", type: "author", date: "2026-11-05", start: "19:00", end: "20:30", book: "salt-moon", capacity: 70,
      title: "Launch night: Salt Moon Signal with Kavya Vantongeren",
      blurb: "Celebrate publication week with a reading, a Q&A and star-shaped cookies. Preordered copies are signed on the night." },
    { id: "bear-drawing", type: "kids", date: "2026-11-07", start: "14:00", end: "15:00", book: "borrowed-books", capacity: 30,
      title: "Draw a bear with Crispin Fairlie",
      blurb: "The author of The Bear Who Borrowed Books reads the story and teaches everyone to draw Mortimer. Ages 4 to 8, grown-ups welcome." },
    { id: "thale-almanac", type: "author", date: "2026-11-12", start: "19:00", end: "20:00", book: "long-field", capacity: 50,
      title: "Rowan Thale: a year in one field",
      blurb: "A slideshow of a year’s worth of mornings, birdsong recordings and plenty of time for questions." },
    { id: "poetry-night", type: "author", date: "2026-11-19", start: "19:00", end: "20:15", book: "field-guide", capacity: 45,
      title: "Poetry night: Wilhelmina Ostberg and Efua Quaye",
      blurb: "Two poets, two books about weather and leaving, and an open mic for three brave audience readers." },
    { id: "olin-bread", type: "author", date: "2026-12-03", start: "18:30", end: "20:00", book: "hard-winters", capacity: 40,
      title: "Baking night with Ingeborg Olin",
      blurb: {
        fall: "Bread for Hard Winters, just in time: a demonstration and tasting in the café, with the maple oat loaf, the seeded rye and butter worth the trip.",
        winter: "Bread for Hard Winters, in the middle of one: a demonstration and tasting in the café, with the maple oat loaf, the seeded rye and butter worth the trip.",
        spring: "Her book is written for the cold months, but the maple oat loaf and the seeded rye are good all year: a demonstration and tasting in the café.",
        summer: "Her book is written for the cold months, but the maple oat loaf and the seeded rye are good all year: a demonstration and tasting in the café."
      } },
    { id: "abernethy-workshop", type: "kids", date: "2026-12-05", start: "15:00", end: "16:30", book: "lit-lighthouse", capacity: 20,
      title: "Teen writing workshop with Soren Abernethy",
      blurb: "Start a story that matters to you. For writers aged 13 to 17; notebooks provided." },
    { id: "quimby-sugarhouse", type: "author", date: "2026-12-10", start: "19:00", end: "20:00", book: "sugarhouse", capacity: 60,
      title: "Leland Quimby: The Sugarhouse Year",
      blurb: "Burnt pans and good neighbors: a very funny evening, with a maple tasting from three local sugarhouses." },
    { id: "moss-storytime", type: "kids", date: "2026-12-12", start: "10:30", end: "11:15", book: "moss-moth", capacity: 35,
      title: "Story time with Tansy Brambleworth",
      blurb: "The author reads Moss the Moth Goes to School, then we make paper lanterns. Ages 3 to 6." },
    { id: "bexley-ice-roads", type: "author", date: "2027-01-14", start: "19:00", end: "20:00", book: "ice-roads", capacity: 60,
      title: "Imelda Bexley: Ice Roads of the Inland Sea",
      blurb: "Maps, photographs and stories of the winter roads across Lake Champlain." },
    { id: "aldridge-teller", type: "author", date: "2027-01-21", start: "19:00", end: "20:00", book: "teller-hill", capacity: 50,
      title: "Joaquin Aldridge: Nine Winters on Teller Hill",
      blurb: {
        winter: "A winter reading from a winter novel, with soup from the café.",
        spring: "Mud season, sugaring and nine hard winters on a hill farm: a reading and conversation, with soup from the café.",
        summer: "A winter novel for a summer evening: a reading and conversation, with iced tea from the café.",
        fall: "Nine winters on a Vermont hill farm, read aloud as the nights draw in, with soup from the café."
      } }
  ],

  /* Saturday story time: every Saturday (unless a kids' event is already booked that morning).
   * The theme rotates week by week through STORY_THEMES. */
  STORY_TIME: { day: 6, start: "10:30", end: "11:15", capacity: 30, title: "Saturday story time",
    blurb: "Picture books on the rug in the kids’ corner, with Mireille. Ages 2 to 6, free, no need to stay quiet." },
  STORY_THEMES: ["Bears and burrows", "Things that fly", { winter: "Snow days", spring: "Puddles and rain", summer: "Beach days", fall: "Falling leaves" }, "Night and the moon", "Trucks and diggers", "Big feelings", "Under the sea", "Grandparents"],

  /* Book clubs. They meet on the nth weekday of each month (nth: 1–4, day: 0 = Sunday … 6 = Saturday);
   * a meeting that falls on a holiday moves a week later. The month's book is
   * picks[(year * 12 + month) % picks.length], so the list never runs out. */
  CLUBS: [
    { id: "fiction", name: "Second Tuesday Fiction", nth: 2, day: 2, start: "19:00", end: "20:30", host: "odessa", audience: "Adults",
      blurb: "Big, generous novels and the occasional quiet one. Wine, tea and strong opinions in the back room.",
      picks: ["teller-hill", "corbin-falls", "quiet-arithmetic", "lantern-ferry", "ice-house"] },
    { id: "mystery", name: "Mystery Night", nth: 3, day: 3, start: "19:00", end: "20:30", host: "augie", audience: "Adults",
      blurb: "Whodunits, police procedurals and the odd cozy. Spoilers allowed after the first half hour.",
      picks: ["gullhaven", "reservoir-kept", "two-editions"] },
    { id: "long-read", name: "Nonfiction Night", nth: 1, day: 1, start: "18:30", end: "20:00", host: "tobiah", audience: "Adults",
      blurb: "Nonfiction about places, food, history and how things work. We read slowly and eat well.",
      picks: ["long-field", "ice-roads", "sugarhouse", "stone-wall", "forty-bulbs"] },
    { id: "starfarers", name: "Starfarers", nth: 4, day: 1, start: "19:00", end: "20:30", host: "augie", audience: "Adults",
      blurb: "Science fiction and fantasy, from space operas to quiet strange novels. New readers always welcome.",
      picks: ["slow-stars", "towers-of-vell", "salt-moon"] },
    { id: "bookworms", name: "Bookworms", nth: 4, day: 0, start: "14:00", end: "15:00", host: "mireille", audience: "Ages 8 to 12",
      blurb: "A club for young readers with snacks, games and one chapter read aloud. Grown-ups drop off and browse.",
      picks: ["badger-door", "looking-for-champ"] }
  ],

  /* The reading finder. Each answer adds points to books: moods (by mood), audience (exact match),
   * length (pages range) and format (has that format). */
  QUIZ: [
    { id: "for", q: "Who is it for?", options: [
      { id: "me", label: "Me, a grown-up", audience: "adult" },
      { id: "teen", label: "A teenager", audience: "teen" },
      { id: "middle", label: "A reader aged 8 to 12", audience: "middle" },
      { id: "young", label: "A little one, 3 to 7", audience: "young" }
    ] },
    { id: "mood", q: "What are you in the mood for?", options: [
      { id: "cozy", label: "Something warm and comforting", mood: "cozy" },
      { id: "gripping", label: "A page-turner I can’t put down", mood: "gripping" },
      { id: "thoughtful", label: "Something to think about", mood: "thoughtful" },
      { id: "otherworldly", label: "Another world entirely", mood: "otherworldly" },
      { id: "true", label: "A true story", mood: "true" },
      { id: "funny", label: "Something that makes me laugh", mood: "funny" }
    ] },
    { id: "time", q: "How much reading time do you have?", options: [
      { id: "evening", label: "An evening or two", min: 0, max: 300 },
      { id: "weekend", label: "A long weekend", min: 250, max: 420 },
      { id: "season", label: "A whole season, bring it on", min: 380, max: 9999 }
    ] },
    { id: "format", q: "Hardcover or paperback?", options: [
      { id: "hardcover", label: "Hardcover, it’s a keeper", format: "hardcover" },
      { id: "paperback", label: "Paperback, it’s coming everywhere with me", format: "paperback" },
      { id: "either", label: "Either is fine", format: null }
    ] }
  ]
};
