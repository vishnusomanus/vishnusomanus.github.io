/*
 * Loftwing: every piece of content the interactive features read. main.js does the work; this file is
 * the one to edit when you make the template yours (see DOCS.md).
 */
window.LOFTWING = {
  /* ---------- Launch date and rolling demo dates ---------- */
  DEMO: {
    /*
     * While on, the launch date is worked out from today, so the demo never reaches its own launch:
     * the second Tuesday of the first month that falls at least MIN_WEEKS away. Turn it off for a real
     * launch and the site uses FIXED_LAUNCH; the countdown then ends in a "we're live" state.
     */
    KEEP_DEMO_CURRENT: true,
    MIN_WEEKS: 16,
    FIXED_LAUNCH: "2027-03-09",
    LAUNCH_HOUR: 9, // 9:00 AM Pacific
    TIME_ZONE: "America/Los_Angeles",
    // Dates worked out from the launch date, in whole weeks before it (so weekdays stay right).
    COHORT_WEEKS: { cohort5: 12, cohort6: 8, cohort7: 4 },
    // Founding pricing closes the day before public launch.
    FOUNDING_DAYS_BEFORE: 1,
  },

  /* ---------- Waitlist ---------- */
  WAITLIST: {
    BASE: 18412, // people already in line; the next new spot is number BASE + 1
    PER_REFERRAL: 25, // places gained for each accepted invite
    TIERS: [
      {
        id: "perch",
        at: 3,
        name: "Perch",
        jump: 500,
        extraDiscount: 0,
        perk: "Move up 500 places and get into a beta cohort before public launch.",
      },
      {
        id: "loft",
        at: 10,
        name: "Loft",
        jump: 1000,
        extraDiscount: 5,
        perk: "Move up another 1,000 places, 5% more off your founding price, and we run your import for you.",
      },
      {
        id: "lead",
        at: 25,
        name: "Lead bird",
        jump: 5000,
        extraDiscount: 10,
        perk: "Move up another 5,000 places, 10% more off in place of the Loft 5%, and a working session with the founders.",
      },
    ],
    // Which invite wave a place in line falls into. Anything later joins on public launch day.
    WAVES: [
      { upTo: 12000, date: "cohort5", name: "Cohort 5" },
      { upTo: 17000, date: "cohort6", name: "Cohort 6" },
      { upTo: 18000, date: "cohort7", name: "Cohort 7" },
    ],
    LIST_SIZES: {
      s1: "Under 1,000",
      s2: "1,000 to 5,000",
      s3: "5,000 to 25,000",
      s4: "25,000 to 100,000",
      s5: "More than 100,000",
    },
  },

  // The tools people move from. Shared by the waitlist form and the migration estimator; never real products.
  TOOLS: {
    hosted: "A hosted newsletter platform",
    store: "An all-in-one store app",
    general: "A general-purpose mailing tool",
    selfhosted: "A self-hosted list",
    spreadsheet: "A spreadsheet and a lot of BCC",
    none: "Nothing yet, I'm starting fresh",
  },

  /* ---------- Subject-line tester ---------- */
  SUBJECT: {
    BASE_SCORE: 90,
    MOBILE_LIMIT: 38, // characters a phone inbox shows before cutting the line
    DESKTOP_LIMIT: 60,
    // [shortest, longest, points, verdict]; ranges in characters, longest null means no upper limit.
    LENGTH_RULES: [
      [1, 14, -25, "Very short. There's not much here to earn the open."],
      [15, 27, -8, "A little short, but it can work."],
      [28, 50, 6, "A good length for phones and desktops."],
      [51, 60, -6, "Slightly long. The end is cut off on phones."],
      [61, 78, -16, "Long. Most inboxes cut this off."],
      [79, null, -28, "Too long. Every inbox cuts this off."],
    ],
    SPAM_PENALTY: 12,
    SPAM_PENALTY_MAX: 36,
    SPAM_WORDS: [
      "100%",
      "act now",
      "buy now",
      "cash",
      "cheap",
      "click here",
      "congratulations",
      "double your",
      "earn money",
      "free",
      "guarantee",
      "guaranteed",
      "limited time",
      "make money",
      "miracle",
      "no obligation",
      "order now",
      "risk-free",
      "urgent",
      "winner",
    ],
    CAPS_PENALTY: 8, // each shouted word of 4+ letters
    CAPS_PENALTY_MAX: 16,
    ALL_CAPS_PENALTY: 20, // the whole line is capitals (replaces the word penalty)
    ONE_BANG_PENALTY: 3,
    MANY_BANGS_PENALTY: 10,
    SYMBOL_RUN_PENALTY: 8, // $$ or ??
    FAKE_REPLY_PENALTY: 15, // starts with Re: or Fwd:
    MANY_EMOJI_PENALTY: 6, // two or more
    DIGIT_BONUS: 2,
    TOKEN_BONUS: 2, // a merge tag such as {{first_name}}
    GRADES: [
      { min: 85, label: "Ready to send" },
      { min: 65, label: "Worth a tweak" },
      { min: 40, label: "Needs work" },
      { min: 0, label: "Likely to hit the filters" },
    ],
  },

  /* ---------- Pricing ---------- */
  PRICING: {
    // Monthly list price for the Solo plan by list size. Boundaries are inclusive: 1,000 is $12, 1,001 is $24.
    BANDS: [
      { upTo: 1000, base: 12 },
      { upTo: 2500, base: 24 },
      { upTo: 5000, base: 39 },
      { upTo: 10000, base: 69 },
      { upTo: 25000, base: 129 },
      { upTo: 50000, base: 219 },
      { upTo: 100000, base: 369 },
    ],
    CUSTOM_ABOVE: 100000, // larger lists get a quote
    MAX_INPUT: 1000000,
    ANNUAL_DISCOUNT: 15, // percent
    FOUNDING_DISCOUNT: 25, // percent, for waitlist members, for life
    OVERAGE_PER_THOUSAND_CENTS: 40, // extra emails beyond the plan, per 1,000 or part of it; never discounted
    PLANS: [
      {
        id: "solo",
        name: "Solo",
        factor: 1, // list price = band base x factor, rounded to the whole dollar
        includedSends: 4, // emails per subscriber, per month
        pitch: "For one person and one list.",
      },
      {
        id: "shop",
        name: "Shop",
        factor: 1.5,
        includedSends: 10,
        pitch: "For stores that sell from the inbox.",
      },
      {
        id: "press",
        name: "Press",
        factor: 2.2,
        includedSends: 20,
        pitch: "For publications with a small staff.",
      },
    ],
    // Comparison table rows: true, false or a short string per plan.
    COMPARE: [
      { group: "Sending" },
      { label: "Emails per subscriber, per month", solo: "4", shop: "10", press: "20" },
      { label: "Loft Editor and saved blocks", solo: true, shop: true, press: true },
      { label: "Your own sending domain", solo: true, shop: true, press: true },
      { label: "Dedicated sending address", solo: false, shop: false, press: true },
      { group: "Growing" },
      { label: "Signup forms and referral links", solo: true, shop: true, press: true },
      { label: "Flocks (segments)", solo: "3", shop: "Unlimited", press: "Unlimited" },
      { label: "Flightpaths (automations)", solo: "1", shop: "Unlimited", press: "Unlimited" },
      { label: "Store sync and cart recovery", solo: false, shop: true, press: true },
      { label: "Paid subscriptions", solo: false, shop: false, press: true },
      { group: "Team and help" },
      { label: "Seats", solo: "1", shop: "3", press: "10" },
      { label: "Logbook history", solo: "6 months", shop: "2 years", press: "All time" },
      { label: "Homing Check before every send", solo: true, shop: true, press: true },
      { label: "A person who helps you move", solo: "By email", shop: "By email", press: "On a call" },
    ],
    DEFAULTS: { subscribers: 5000, sends: 4, billing: "monthly", founding: true },
  },

  /* ---------- Migration estimator ---------- */
  MIGRATION: {
    DEFAULTS: { source: "hosted", size: 12000, automations: true },
    MAX_SIZE: 2000000,
    // Warm-up calendar days for a new sending domain, by list size (inclusive). Null means any larger list.
    WARMUP: [
      { upTo: 5000, days: 3 },
      { upTo: 25000, days: 7 },
      { upTo: 100000, days: 14 },
      { upTo: null, days: 21 },
    ],
    // Every step a move can use. minutes is hands-on time; scale adds `add` minutes per `per` subscribers or part of it.
    STEPS: {
      archive: {
        title: "Export your past issues",
        body: "Download your back catalog as HTML or a zip so old links keep working on your new archive page.",
        minutes: 15,
      },
      exportList: {
        title: "Export your subscribers",
        body: "Download a full CSV, including unsubscribes and bounces, so nobody who left comes back by accident.",
        minutes: 10,
      },
      exportStore: {
        title: "Export customers with their consent flags",
        body: "Your store app keeps marketing consent apart from customer records. Bring the flag across with each address.",
        minutes: 20,
      },
      dumpTable: {
        title: "Dump your list table to CSV",
        body: "One row per address with signup date and status. Import keeps any extra columns as custom fields.",
        minutes: 25,
      },
      gather: {
        title: "Gather every address into one sheet",
        body: "Merge your tabs and old threads, and note where each address came from. Consent is the thing to check here.",
        minutes: 30,
      },
      clean: {
        title: "Clean the list",
        body: "Drop duplicates and role addresses, and set aside anyone who hasn't opened in a year for a re-permission send.",
        minutes: 10,
        scale: { per: 5000, add: 5 },
      },
      domain: {
        title: "Connect your sending domain",
        body: "Add three DNS records. Homing Check confirms SPF, DKIM and DMARC as soon as they resolve.",
        minutes: 20,
      },
      import: {
        title: "Run the import",
        body: "Map your columns once, check the preview, then let it run. You can close the tab while it works.",
        minutes: 10,
        scale: { per: 10000, add: 5 },
      },
      connectStore: {
        title: "Connect your store",
        body: "Link your storefront so orders, carts and products flow in. Past orders arrive overnight.",
        minutes: 25,
      },
      rebuild: {
        title: "Rebuild your automations as Flightpaths",
        body: "Start from the welcome, cart and win-back templates, then paste in your own words.",
        minutes: 45,
      },
      forms: {
        title: "Swap your signup forms",
        body: "Replace the old embed with a Loftwing form, or point your old form's address at your new list.",
        minutes: 15,
      },
      firstList: {
        title: "Write your welcome email",
        body: "A short note that says who you are and what's coming. It goes to every new subscriber from day one.",
        minutes: 30,
      },
      warmup: {
        title: "Start the warm-up schedule",
        body: "Loftwing sends to your most engaged readers first and widens the circle each day. There's nothing to do but send as usual.",
        minutes: 5,
      },
    },
    SOURCES: {
      hosted: ["archive", "exportList", "clean", "domain", "import", "rebuild", "forms", "warmup"],
      store: ["exportStore", "clean", "domain", "import", "connectStore", "rebuild", "forms", "warmup"],
      general: ["exportList", "clean", "domain", "import", "rebuild", "forms", "warmup"],
      selfhosted: ["dumpTable", "clean", "domain", "import", "rebuild", "forms", "warmup"],
      spreadsheet: ["gather", "clean", "domain", "import", "rebuild", "forms", "warmup"],
      none: ["domain", "forms", "firstList", "warmup"],
    },
    SOURCE_NOTES: {
      hosted: "Hosted platforms hand over clean exports. Your archive is the part people forget, so it's first.",
      store: "Store apps mix customers and subscribers. The main job is carrying consent across correctly.",
      general: "General mailing tools export cleanly. Expect a tidy move with a little automation rebuilding.",
      selfhosted: "You already own the data, so most of the work is the domain and a fresh start on reputation.",
      spreadsheet: "It's a big step up, and it's mostly one careful afternoon. Your readers won't notice a thing.",
      none: "No list to move yet. Here's how to go from nothing to a working signup and welcome email.",
    },
  },

  /* ---------- Roadmap ---------- */
  ROADMAP: {
    STATUSES: { shipped: "Shipped", beta: "In beta", next: "Next" },
    ITEMS: [
      {
        id: "editor-blocks",
        status: "shipped",
        votes: 412,
        area: "Editor",
        title: "Block editor with saved sections",
        body: "Write in plain paragraphs, drop in blocks, and reuse your header and sign-off everywhere.",
      },
      {
        id: "importer",
        status: "shipped",
        votes: 388,
        area: "Migration",
        title: "CSV importer with column mapping",
        body: "Preview the first rows, map once, and keep any extra columns as custom fields.",
      },
      {
        id: "homing-check",
        status: "shipped",
        votes: 351,
        area: "Deliverability",
        title: "Homing Check before every send",
        body: "SPF, DKIM, DMARC and broken links are checked before the send button unlocks.",
      },
      {
        id: "flightpath-welcome",
        status: "shipped",
        votes: 297,
        area: "Automations",
        title: "Welcome Flightpaths",
        body: "A three-step welcome series with waits and a stop when someone replies.",
      },
      {
        id: "plain-text",
        status: "shipped",
        votes: 164,
        area: "Editor",
        title: "Honest plain-text versions",
        body: "Hand-editable plain text beside every campaign, so it never reads like a stripped web page.",
      },
      {
        id: "archive-page",
        status: "shipped",
        votes: 143,
        area: "Publishing",
        title: "Public archive page",
        body: "Every issue gets a clean web page on your own domain, with a signup form on top.",
      },
      {
        id: "flocks",
        status: "beta",
        votes: 476,
        area: "Segments",
        title: "Flocks: saved segments",
        body: "Group people by opens, clicks and purchases. Flocks update themselves as readers change.",
      },
      {
        id: "cart-recovery",
        status: "beta",
        votes: 439,
        area: "Automations",
        title: "Cart recovery for small shops",
        body: "A single friendly reminder, with the item in the email, and no discount unless you add one.",
      },
      {
        id: "warmup-planner",
        status: "beta",
        votes: 318,
        area: "Deliverability",
        title: "Warm-up planner",
        body: "A day-by-day sending plan for a new domain, sized to your list and your most engaged readers.",
      },
      {
        id: "logbook-cohorts",
        status: "beta",
        votes: 226,
        area: "Analytics",
        title: "Logbook reader cohorts",
        body: "See how each signup month keeps reading over time, not just how one campaign did.",
      },
      {
        id: "referrals",
        status: "beta",
        votes: 205,
        area: "Growth",
        title: "Reader referral rewards",
        body: "Give readers a link, set your own milestones, and let the list help itself grow.",
      },
      {
        id: "paid-subs",
        status: "next",
        votes: 534,
        area: "Publishing",
        title: "Paid subscriptions",
        body: "Monthly and yearly tiers, paywalled issues and gift subscriptions, with low flat fees.",
      },
      {
        id: "ab-subject",
        status: "next",
        votes: 367,
        area: "Editor",
        title: "Subject-line split tests",
        body: "Send two subjects to a slice of the list, then send the winner to everyone else automatically.",
      },
      {
        id: "dedicated-address",
        status: "next",
        votes: 248,
        area: "Deliverability",
        title: "Dedicated sending addresses",
        body: "A reputation that's yours alone for lists above 25,000, with warm-up handled for you.",
      },
      {
        id: "seats",
        status: "next",
        votes: 191,
        area: "Team",
        title: "Seats with roles and review",
        body: "Writers draft, editors approve, and only the people you choose can press send.",
      },
      {
        id: "podcast-feed",
        status: "next",
        votes: 122,
        area: "Publishing",
        title: "RSS to issue digests",
        body: "Turn a blog or audio feed into a weekly digest you can edit before it goes out.",
      },
      {
        id: "storefront-blocks",
        status: "next",
        votes: 276,
        area: "Editor",
        title: "Live product blocks",
        body: "Product cards that pull price and stock from your store when the email is sent.",
      },
      {
        id: "api",
        status: "next",
        votes: 158,
        area: "Developers",
        title: "Public API and webhooks",
        body: "Add subscribers and trigger Flightpaths from your own site, with simple signed webhooks.",
      },
    ],
  },

  /* ---------- Journal (past entries keep their real dates) ---------- */
  JOURNAL: {
    TOPICS: {
      story: "Story",
      deliverability: "Deliverability",
      product: "Product",
      business: "Business",
      migration: "Migration",
    },
    ENTRIES: [
      {
        id: "pricing-draft-three",
        date: "2026-10-27",
        topic: "business",
        author: "Tova Halvor",
        title: "Pricing, third draft",
        stat: "3 drafts, 41 reader calls",
        summary: "We threw out per-send pricing after our forty-first call with a beta publisher.",
        body: [
          "The first draft charged by the send, which sounded fair and turned out to punish the people who write most often. A weekly writer on our list would have paid more than a shop that mails four times a year and sells far more.",
          "The third draft charges by list size with a generous send allowance per plan. It's less clever and it's much easier to explain. Waitlist members get the founding price for as long as they stay.",
        ],
      },
      {
        id: "bounce-sorter",
        date: "2026-09-22",
        topic: "deliverability",
        author: "Imre Delacroix",
        title: "Teaching the bounce sorter some manners",
        stat: "Hard bounces down to 0.3%",
        summary: "A full mailbox isn't a dead address. Treating it like one was costing writers real readers.",
        body: [
          "Our first bounce handler removed anyone who bounced twice. In cohort two that quietly unsubscribed around 140 people across the beta who only had full mailboxes during summer vacation.",
          "Now each bounce is sorted by its reply code and retried on its own schedule. A permanent failure stops at once, and a soft one gets three tries over nine days. Hard bounces across the beta sit at 0.3%.",
        ],
      },
      {
        id: "import-day",
        date: "2026-08-18",
        topic: "migration",
        author: "Tilda Baptiste",
        title: "The week I moved eleven lists by hand",
        stat: "11 lists, 214,000 addresses",
        summary: "Before writing the importer's next version, I did every move myself to see where people get stuck.",
        body: [
          "Nobody got stuck on the file itself. They got stuck on consent columns with names like status_2, and on what to do with people who had unsubscribed from somewhere else.",
          "So the new importer asks one question per unclear column, in plain words, and it always keeps unsubscribes as unsubscribes. The longest move that week took a little over three hours, most of it waiting for DNS.",
        ],
      },
      {
        id: "no-investors",
        date: "2026-06-30",
        topic: "business",
        author: "Tova Halvor",
        title: "Why we said no to the second term sheet",
        stat: "$0 raised, 14 months of runway",
        summary: "Email tools get worse when they need to grow faster than their customers do.",
        body: [
          "We got a very polite offer, and we spent a weekend on it. Then we looked at what the money would ask of us: more seats, more features, a larger pricing page, and pressure to push writers into plans they don't need.",
          "We're paying our way through founders' savings and beta subscriptions instead. It means a smaller team and a slower roadmap. It also means the only people we answer to are the ones sending the email.",
        ],
      },
      {
        id: "cohort-one",
        date: "2026-05-12",
        topic: "product",
        author: "Yusra Sandoval",
        title: "Cohort one, and what it broke",
        stat: "38 publications, 96 bugs",
        summary: "Thirty-eight publications moved in. Ninety-six bug reports moved in with them.",
        body: [
          "The most common report wasn't a crash. People couldn't find the plain-text version, because we had hidden it behind a menu we thought was tidy. It now sits beside the HTML, the same size.",
          "The best report came from a yarn shop that had pasted a 40-row table from a spreadsheet into the editor. It broke everything, and it should have worked. Now it does.",
        ],
      },
      {
        id: "editor-rewrite",
        date: "2026-03-24",
        topic: "product",
        author: "Yusra Sandoval",
        title: "We rewrote the editor (again)",
        stat: "Second rewrite, 9 weeks",
        summary: "Version one was a page builder. Writers wanted a page, and to be left alone with it.",
        body: [
          "We had columns, nested sections and a sidebar with 22 controls. Watching writers use it was painful: they'd type in a text box, then spend ten minutes getting the spacing to behave.",
          "The rewrite starts as a blank page with a blinking cursor. Blocks show up when you type a slash, and the layout rules are ours to worry about. Writers in the test group finished issues 30% faster.",
        ],
      },
      {
        id: "warmup-lesson",
        date: "2026-02-03",
        topic: "deliverability",
        author: "Imre Delacroix",
        title: "How we got ourselves blocked on purpose",
        stat: "1 test domain, 6 days in the penalty box",
        summary: "We set up a brand new domain, sent too much too soon, and wrote down what happened.",
        body: [
          "Going from nothing to 20,000 emails in one morning took us about four hours to get throttled and six days to climb back. Now I can show people the graph instead of asking them to trust me.",
          "It's why every Loftwing account gets a warm-up plan sized to the list, and why the first sends go to your most engaged readers. Those readers build your reputation for everyone else.",
        ],
      },
      {
        id: "first-send",
        date: "2025-12-09",
        topic: "product",
        author: "Imre Delacroix",
        title: "First real send",
        stat: "1 list, 212 readers",
        summary: "The first campaign out of Loftwing went to Tova's grandfather's pigeon club.",
        body: [
          "It was 212 people and one newsletter about race results. It had no editor to speak of, just a text box, a send button and a lot of watching logs from the kitchen table.",
          "Two hundred and nine arrived in the inbox. The other three were old addresses, one of which, we were told, belonged to a man who had retired from pigeons and email in the same year.",
        ],
      },
      {
        id: "why-loftwing",
        date: "2025-10-14",
        topic: "story",
        author: "Tova Halvor",
        title: "Why it's called Loftwing",
        stat: "Day one",
        summary: "A homing pigeon doesn't need a map, a funnel or a growth hack. It just needs a home to come back to.",
        body: [
          "My grandfather kept racing pigeons in a loft behind his house on the South Hill. I spent summers cleaning that loft, and I learned that the birds come home because the loft is a good place to be.",
          "Email works the same way. Readers open what they trust. I'd spent eight years running lists for small publishers on tools that treated my readers as leads, so Imre and I started writing the tool we wanted.",
        ],
      },
    ],
  },

  /* ---------- Product tour ---------- */
  AUTOMATIONS: {
    welcome: {
      name: "Welcome",
      summary: "Three emails over a week, stopping as soon as someone replies.",
      nodes: [
        { kind: "Trigger", title: "Someone joins your list", meta: "From any form or import" },
        { kind: "Email", title: "Hello, here's who we are", meta: "71% opened" },
        { kind: "Wait", title: "Wait 3 days", meta: "Skips weekends" },
        { kind: "Branch", title: "Did they reply?", meta: "Yes: stop, a person has it" },
        { kind: "Email", title: "Our three best issues", meta: "58% opened" },
        { kind: "Wait", title: "Wait 4 days", meta: "Skips weekends" },
        { kind: "Email", title: "What should we write about?", meta: "22% replied" },
      ],
    },
    cart: {
      name: "Cart reminder",
      summary: "One friendly nudge with the item in the email, and no discount unless you add one.",
      nodes: [
        { kind: "Trigger", title: "A cart sits for 4 hours", meta: "From your connected store" },
        { kind: "Branch", title: "Did they buy already?", meta: "Yes: stop" },
        { kind: "Email", title: "Still thinking about it?", meta: "64% opened" },
        { kind: "Wait", title: "Wait 2 days", meta: "Any day" },
        { kind: "Branch", title: "Still in the cart?", meta: "No: stop and tag as buyer" },
        { kind: "Email", title: "A note from the workshop", meta: "11% recovered" },
      ],
    },
    winback: {
      name: "Win-back",
      summary: "Ask quiet readers if they still want this, then let them go kindly.",
      nodes: [
        { kind: "Trigger", title: "No opens in 120 days", meta: "Checked weekly" },
        { kind: "Email", title: "Still want these?", meta: "One-click answer" },
        { kind: "Wait", title: "Wait 7 days", meta: "Any day" },
        { kind: "Branch", title: "Did they answer?", meta: "Yes: back in the flock" },
        { kind: "Email", title: "We'll stop writing for now", meta: "Last email" },
        { kind: "Stop", title: "Move to Resting", meta: "Doesn't count against your plan" },
      ],
    },
  },
  SEGMENTS: {
    LIST_SIZE: 12480,
    RULES: {
      opened: { label: "Opened in the last 90 days", share: 0.62 },
      clicked: { label: "Clicked in the last 30 days", share: 0.27 },
      bought: { label: "Bought in the last year", share: 0.18 },
      shop: { label: "Signed up at your shop", share: 0.34 },
      nearby: { label: "Lives within 50 miles", share: 0.09 },
    },
  },
  ANALYTICS: {
    CAMPAIGNS: ["No. 41", "No. 42", "No. 43", "No. 44", "No. 45", "No. 46", "No. 47", "No. 48", "No. 49", "No. 50"],
    METRICS: {
      opens: { label: "Opens", suffix: "%", values: [48.2, 51.4, 49.8, 53.1, 54.6, 52.9, 55.8, 57.2, 56.4, 58.7] },
      clicks: { label: "Clicks", suffix: "%", values: [6.1, 7.4, 6.8, 7.9, 9.2, 8.1, 8.8, 10.4, 9.6, 11.3] },
      revenue: {
        label: "Revenue",
        prefix: "$",
        values: [412, 388, 540, 610, 575, 702, 684, 830, 795, 960],
      },
    },
  },
};
