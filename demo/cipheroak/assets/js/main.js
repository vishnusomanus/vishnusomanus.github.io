/* Cipheroak — site script for the Cipheroak template
 * Vanilla JavaScript, no dependencies. Sections:
 *  1. Studio settings: address, time zone, hours, holidays
 *  2. Booking: call slots and services
 *  3. Vault-readiness assessment: questions, levels, recommendations
 *  4. Security guides
 *  5. Signer planner: key locations and presets
 *  6. Pricing: plans, recovery plans, ceremony travel
 *  7. Field notes and advisories (rolling demo dates)
 *  8. People
 *  9. Helpers and saved data (safeStorage)
 * 10. Studio clock: Mountain Time, US holidays, open hours, call slots
 * 11. Artwork: guide illustrations, portraits, the key ring diagram
 * 12. Header, mobile menu, reveal, footer year, notices
 * 13. Home            17. Pricing
 * 14. Assessment      18. Field notes
 * 15. Guides          19. Company
 * 16. Teams           20. Contact and boot
 */
(function () {
  "use strict";

  /* ------------------------------------------------------------------
   * 1. Studio settings. Every time on the site is shown in TIMEZONE,
   *    so a visitor in another state still sees the studio's clock.
   * ------------------------------------------------------------------ */
  const STUDIO = {
    name: "Cipheroak",
    address: "Studio 3, 418 Galisteo Street, Santa Fe, NM 87501",
    phone: "(505) 555-0172",
    email: "hello@cipheroak.example",
  };
  const TIMEZONE = "America/Denver";
  const LOCALE = "en-US";
  const CURRENCY = "USD";

  // Studio hours, Sunday first: ['open', 'close'] in 24-hour time, or null when closed.
  const HOURS = [
    null, // Sunday
    ["09:00", "17:00"], // Monday
    ["09:00", "17:00"], // Tuesday
    ["09:00", "17:00"], // Wednesday
    ["09:00", "17:00"], // Thursday
    ["09:00", "15:00"], // Friday
    null, // Saturday: key ceremonies by arrangement only
  ];

  // Holidays the studio closes for, worked out for any year (see usHolidays()).
  // Remove an id to stay open that day.
  const HOLIDAYS = [
    "new-year",
    "mlk",
    "memorial",
    "juneteenth",
    "independence",
    "labor",
    "indigenous",
    "thanksgiving",
    "thanksgiving-friday",
    "christmas-eve",
    "christmas",
  ];
  // One-off closures, 'YYYY-MM-DD' with a reason, e.g. { date: '2027-03-12', label: 'Team training day' }.
  const CLOSURES = [];

  /* ------------------------------------------------------------------
   * 2. Booking. Every engagement starts with a 45-minute review call.
   *    Slots are studio times; some are already taken (see slotTaken()).
   * ------------------------------------------------------------------ */
  const BOOKING = { minutes: 45, businessDays: 10, leadHours: 18, messageMax: 800 };
  // Call start times by weekday, Sunday first.
  const SLOT_TIMES = [
    [],
    ["09:00", "10:30", "13:00", "14:30", "16:00"],
    ["09:00", "10:30", "13:00", "14:30", "16:00"],
    ["09:00", "10:30", "13:00", "14:30", "16:00"],
    ["09:00", "10:30", "13:00", "14:30", "16:00"],
    ["09:00", "10:30", "13:00"],
    [],
  ];
  const SERVICES = {
    review: "Security review of my current setup",
    household: "Household vault setup",
    team: "Team vault and signing policy",
    recovery: "Inheritance and recovery plan",
    ceremony: "On-site key ceremony",
    unsure: "Not sure yet",
  };
  const AUDIENCES = { individual: "Just me", family: "My family", team: "A small team or business" };

  /* ------------------------------------------------------------------
   * 3. Vault-readiness assessment. Each option scores points; options
   *    that leave a gap name a recommendation (RECOMMENDATIONS below).
   * ------------------------------------------------------------------ */
  const SECTIONS = {
    devices: "Devices",
    backups: "Backups",
    signers: "Signers",
    heirs: "Heirs",
  };
  const QUESTIONS = [
    {
      id: "custody",
      section: "devices",
      text: "Where are the keys for your long-term savings held today?",
      options: [
        { label: "In an account on an exchange or app", points: 0, rec: "own-keys" },
        { label: "In a wallet app on my phone or computer", points: 1, rec: "hardware" },
        { label: "On one hardware wallet", points: 2, rec: "single-device" },
        { label: "On several hardware devices in a multisig vault", points: 3 },
      ],
    },
    {
      id: "sourcing",
      section: "devices",
      text: "How did your devices reach you, and were they checked at setup?",
      options: [
        { label: "Bought new from the maker and verified during setup", points: 3 },
        { label: "Bought new from a store, not verified", points: 1, rec: "verify" },
        { label: "Second-hand, gifted or set up by someone else", points: 0, rec: "replace" },
        { label: "I don’t use a device yet", points: 0, rec: "hardware" },
      ],
    },
    {
      id: "pin",
      section: "devices",
      text: "Is each device protected with a PIN and kept apart from its backup?",
      options: [
        { label: "Yes, PIN set and stored apart from the backup", points: 2 },
        { label: "PIN set, but the backup sits in the same drawer", points: 1, rec: "separate" },
        { label: "No PIN, or I’m not sure", points: 0, rec: "pin" },
      ],
    },
    {
      id: "medium",
      section: "backups",
      text: "What is your recovery phrase written on?",
      options: [
        { label: "Stamped or engraved metal", points: 3 },
        { label: "Paper, written by hand", points: 2, rec: "metal" },
        { label: "A photo, a notes app, email or cloud storage", points: 0, rec: "digital-copy" },
        { label: "It isn’t backed up", points: 0, rec: "backup-now" },
      ],
    },
    {
      id: "places",
      section: "backups",
      text: "Where do your backups live?",
      options: [
        { label: "In two or more places, away from the devices", points: 3 },
        { label: "In one place, away from the devices", points: 2, rec: "geography" },
        { label: "In the same place as the devices", points: 0, rec: "separate" },
      ],
    },
    {
      id: "tested",
      section: "backups",
      text: "When did you last restore from a backup to prove it works?",
      options: [
        { label: "Within the last twelve months", points: 3 },
        { label: "More than a year ago", points: 1, rec: "drill" },
        { label: "Never", points: 0, rec: "drill" },
      ],
    },
    {
      id: "loss",
      section: "signers",
      text: "If one device or one backup were stolen tomorrow, what would happen?",
      options: [
        { label: "Nothing: one piece alone can’t move funds", points: 3 },
        { label: "The thief could move funds if they found the PIN or phrase", points: 1, rec: "multisig" },
        { label: "I honestly don’t know", points: 0, rec: "map" },
      ],
    },
    {
      id: "approval",
      section: "signers",
      text: "Who can approve moving funds?",
      options: [
        { label: "Two named people together, written down", points: 3 },
        { label: "Only me", points: 2 },
        { label: "Several of us, but nothing is written down", points: 1, rec: "policy" },
        { label: "Anyone in the household who finds the device", points: 0, rec: "policy" },
      ],
    },
    {
      id: "aware",
      section: "heirs",
      text: "Would your family know these funds exist, and where to begin?",
      options: [
        { label: "Yes, with a written letter of instruction", points: 3 },
        { label: "They know, but there are no instructions", points: 1, rec: "letter" },
        { label: "No", points: 0, rec: "letter" },
      ],
    },
    {
      id: "succession",
      section: "heirs",
      text: "Could the right person recover the funds without you, and only that person?",
      options: [
        { label: "Yes, planned with an executor or attorney and rehearsed", points: 3 },
        { label: "Someone has a copy of everything, just in case", points: 0, rec: "heir-copy" },
        { label: "There is no plan yet", points: 0, rec: "inheritance" },
      ],
    },
  ];
  // min: lowest score (percent) for the level.
  const LEVELS = [
    {
      id: "exposed",
      min: 0,
      label: "Exposed",
      summary: "One mistake, one theft or one bad day could cost you everything. Start with the first fix below this week.",
    },
    {
      id: "fragile",
      min: 40,
      label: "Fragile",
      summary: "The basics are in place, but there is at least one single point of failure. Close the gaps in order.",
    },
    {
      id: "steady",
      min: 65,
      label: "Steady",
      summary: "A sound setup with a few loose ends. Most of what remains is writing things down and rehearsing.",
    },
    {
      id: "ready",
      min: 85,
      label: "Vault-ready",
      summary: "You could lose a device, a backup or a signer and still recover. Keep it that way with a yearly review.",
    },
  ];
  // priority: 1 is the most urgent. guide: the guide id that explains the fix.
  const RECOMMENDATIONS = {
    "backup-now": {
      priority: 1,
      title: "Make a backup before anything else",
      body: "Without a backup, a broken or lost device is the end of the story. Write the phrase down by hand today and keep it away from the device.",
      guide: "metal-backup",
    },
    "digital-copy": {
      priority: 1,
      title: "Delete every digital copy of your phrase",
      body: "Photos, notes apps and cloud folders are read by more people and programs than you think. Move funds to a fresh wallet set up offline, then delete the old copies.",
      guide: "phrase-scams",
    },
    "own-keys": {
      priority: 2,
      title: "Hold your own keys for long-term savings",
      body: "An account is a promise from a company. Keep spending money there if you like, and move what you mean to keep onto keys only you control.",
      guide: "first-device",
    },
    replace: {
      priority: 2,
      title: "Replace second-hand or pre-set devices",
      body: "A device someone else set up may come with a phrase they also know. Buy new from the maker, set it up yourself and move funds across.",
      guide: "verify-device",
    },
    "heir-copy": {
      priority: 2,
      title: "Take back the spare copy",
      body: "A full copy held by one person is a second way to lose everything. Split recovery so no one person, including family, can move funds alone.",
      guide: "two-of-three",
    },
    hardware: {
      priority: 3,
      title: "Move savings onto a hardware device",
      body: "Phones and laptops are online all day. A small offline device keeps keys away from browsers, email and downloads.",
      guide: "first-device",
    },
    verify: {
      priority: 3,
      title: "Check your device is genuine",
      body: "Run the maker’s authenticity check and confirm the firmware before you trust it with more.",
      guide: "verify-device",
    },
    separate: {
      priority: 3,
      title: "Keep devices and backups apart",
      body: "A burglar who finds both in one drawer has everything. Move the backup somewhere a thief wouldn’t look on the same visit.",
      guide: "backup-geography",
    },
    multisig: {
      priority: 3,
      title: "Remove the single point of failure",
      body: "With a two-of-three vault, any one stolen device or backup is useless on its own, and any one lost piece is recoverable.",
      guide: "two-of-three",
    },
    map: {
      priority: 3,
      title: "Draw a map of your setup",
      body: "List every device, backup and person, and where each one lives. Most gaps show up the moment it is on one page.",
      guide: "backup-geography",
    },
    inheritance: {
      priority: 3,
      title: "Plan who recovers the funds, and how",
      body: "Decide who should be able to recover without you, then design it so they can and nobody else can.",
      guide: "executor-briefing",
    },
    pin: {
      priority: 4,
      title: "Set a PIN on every device",
      body: "A PIN turns a stolen device into a locked box. Choose one you can remember without writing it next to the device.",
      guide: "first-device",
    },
    metal: {
      priority: 4,
      title: "Move your backup to metal",
      body: "Paper burns, floods and fades. A stamped steel plate survives a house fire and costs less than a dinner out.",
      guide: "metal-backup",
    },
    geography: {
      priority: 4,
      title: "Add a second backup location",
      body: "One fire, flood or break-in shouldn’t take every copy. Keep a second backup in another building.",
      guide: "backup-geography",
    },
    drill: {
      priority: 4,
      title: "Run a restore drill",
      body: "A backup you haven’t restored from is a hope, not a plan. Prove it works on a spare device, without moving funds.",
      guide: "restore-drill",
    },
    policy: {
      priority: 4,
      title: "Write down who approves what",
      body: "Name the signers, the threshold and the steps for a large withdrawal, so pressure or a convincing message can’t skip them.",
      guide: "team-policy",
    },
    "single-device": {
      priority: 5,
      title: "Plan for losing your only device",
      body: "Make sure your backup alone can restore everything, and consider a multisig vault once your savings grow.",
      guide: "two-of-three",
    },
    letter: {
      priority: 5,
      title: "Write a letter of instruction",
      body: "Tell your family what exists, who to call and where to start, without writing down anything a thief could use.",
      guide: "letter-of-instruction",
    },
  };

  /* ------------------------------------------------------------------
   * 4. Security guides. art: which drawing to use (see GUIDE_ART).
   * ------------------------------------------------------------------ */
  const TOPICS = {
    devices: "Devices",
    backups: "Backups",
    multisig: "Multisig",
    inheritance: "Inheritance",
    everyday: "Everyday safety",
  };
  const GUIDE_LEVELS = { starter: "Starter", intermediate: "Intermediate", advanced: "Advanced" };
  const GUIDES = [
    {
      id: "first-device",
      title: "Setting up your first hardware wallet",
      topic: "devices",
      level: "starter",
      minutes: 25,
      art: "device",
      summary: "From the sealed box to your first small test deposit, in the order we do it with clients.",
      steps: [
        "Open the box at a clear table with no cameras pointing at it.",
        "Generate the phrase on the device itself, never on a computer or phone.",
        "Write it down by hand, then check every word against the screen.",
        "Send a small amount first and receive it back before moving more.",
      ],
    },
    {
      id: "verify-device",
      title: "Checking a new device before you trust it",
      topic: "devices",
      level: "starter",
      minutes: 15,
      art: "seal",
      summary: "Tamper seals, authenticity checks and firmware: what is worth checking and what is theater.",
      steps: [
        "Buy from the maker directly, never a marketplace seller.",
        "Refuse any device that arrives with a phrase already filled in.",
        "Run the maker’s authenticity check in their official app.",
        "Note the firmware version so you can spot an unexpected change later.",
      ],
    },
    {
      id: "passphrase",
      title: "Adding a passphrase without locking yourself out",
      topic: "devices",
      level: "advanced",
      minutes: 30,
      art: "layers",
      summary: "An extra word protects a stolen backup, and can also strand your family. Here is how to do it safely.",
      steps: [
        "Decide who else must be able to recover before you add one.",
        "Store the passphrase in a different place from the phrase it protects.",
        "Write down the first receiving address so you can confirm a correct restore.",
        "Restore with the passphrase on a spare device before funding.",
      ],
    },
    {
      id: "metal-backup",
      title: "Stamping a metal backup",
      topic: "backups",
      level: "starter",
      minutes: 40,
      art: "plate",
      summary: "A steel plate, a letter punch set and an hour. The backup that survives a house fire.",
      steps: [
        "Stamp the first four letters of each word; they are enough to identify it.",
        "Work at a table where nobody can see the plate.",
        "Check every word against your paper copy, then destroy the paper.",
        "Label the plate with nothing that says what it is.",
      ],
    },
    {
      id: "backup-geography",
      title: "Where backups should and shouldn’t live",
      topic: "backups",
      level: "intermediate",
      minutes: 20,
      art: "map",
      summary: "Spreading copies so that no single fire, flood or burglary reaches all of them.",
      steps: [
        "List every place a device or backup lives today.",
        "Never keep a device and its own backup in the same room.",
        "Put at least one location in another building, ideally another town.",
        "Think about who can open each place, and who could be made to.",
      ],
    },
    {
      id: "restore-drill",
      title: "A restore drill you can run in an afternoon",
      topic: "backups",
      level: "intermediate",
      minutes: 60,
      art: "loop",
      summary: "Prove your backup works on a spare device, without moving a cent, and then wipe it.",
      steps: [
        "Reset a spare device, or use a new one you will keep as a spare.",
        "Restore from the backup alone, exactly as an heir would.",
        "Compare the first receiving address with the one on record.",
        "Wipe the spare device and write the date of the drill down.",
      ],
    },
    {
      id: "two-of-three",
      title: "Planning a two-of-three household vault",
      topic: "multisig",
      level: "intermediate",
      minutes: 35,
      art: "keys",
      summary: "Three keys, any two to sign. Where to put them so one loss is fine and one theft is useless.",
      steps: [
        "Use three devices from at least two different makers.",
        "Keep each key, and its backup, in a different place.",
        "Back up the vault configuration as well as the three phrases.",
        "Rehearse signing with any two keys before funding the vault.",
      ],
    },
    {
      id: "team-policy",
      title: "Writing a signing policy for a small team",
      topic: "multisig",
      level: "advanced",
      minutes: 45,
      art: "policy",
      summary: "Who signs, how a withdrawal is requested, and the checks no urgent message can skip.",
      steps: [
        "Name every signer and a backup signer for each role.",
        "Set a threshold above which a second confirmation call is required.",
        "Confirm every destination address on a device screen, not an email.",
        "Review the policy every time someone joins or leaves.",
      ],
    },
    {
      id: "signer-departure",
      title: "When a signer leaves",
      topic: "multisig",
      level: "advanced",
      minutes: 30,
      art: "door",
      summary: "A calm, written sequence for rotating a key when someone moves on, on good terms or not.",
      steps: [
        "Agree a date and collect the departing signer’s device and backup.",
        "Create a new key with the replacement signer.",
        "Set up a new vault and move funds across in stages.",
        "Retire the old vault and record what changed and when.",
      ],
    },
    {
      id: "letter-of-instruction",
      title: "A letter of instruction your heirs can follow",
      topic: "inheritance",
      level: "starter",
      minutes: 30,
      art: "envelope",
      summary: "What to write down for your family, and the one thing that must never go in the letter.",
      steps: [
        "Say what exists and roughly where, in plain language.",
        "Name who to call first, including your attorney and us if you like.",
        "Point to the locations of keys without writing any phrase down.",
        "Keep it with your will and update it every year.",
      ],
    },
    {
      id: "executor-briefing",
      title: "Briefing an executor who isn’t technical",
      topic: "inheritance",
      level: "intermediate",
      minutes: 25,
      art: "people",
      summary: "How to prepare a trusted person to recover funds calmly, years from now, without holding them today.",
      steps: [
        "Meet with your executor and attorney together, once.",
        "Walk through the letter of instruction, not the keys themselves.",
        "Agree what proof unlocks the final key (a death certificate, a court order).",
        "Book a short refresher whenever the setup changes.",
      ],
    },
    {
      id: "travel",
      title: "Traveling with keys, or without them",
      topic: "everyday",
      level: "intermediate",
      minutes: 20,
      art: "suitcase",
      summary: "Most people should leave keys at home. For the few who can’t, here is how to carry less.",
      steps: [
        "Ask whether you need to sign anything while you are away.",
        "If you do, carry one key of a multisig vault, never a full backup.",
        "Keep the device and any notes in different bags.",
        "Have a plan for a lost bag that doesn’t need you at home.",
      ],
    },
    {
      id: "phrase-scams",
      title: "Spotting a recovery-phrase scam",
      topic: "everyday",
      level: "starter",
      minutes: 10,
      art: "hook",
      summary: "Support agents, giveaways and urgent warnings. Every one of them ends with “type in your phrase”.",
      steps: [
        "No real company, including us, will ever ask for your phrase.",
        "Treat urgency as a warning sign, not a reason to hurry.",
        "Find phone numbers yourself, never from the message.",
        "If you typed your phrase anywhere, move funds to a new wallet now.",
      ],
    },
    {
      id: "first-hour",
      title: "The first hour after a lost or stolen device",
      topic: "everyday",
      level: "starter",
      minutes: 15,
      art: "clock",
      summary: "What to do in order, what can wait until tomorrow, and when to call for help.",
      steps: [
        "Breathe: a PIN-protected device buys you time.",
        "Find your backup and check it is still where it should be.",
        "Restore on a new device and move funds to a fresh wallet.",
        "Write down what happened while it is fresh, for your records.",
      ],
    },
  ];

  /* ------------------------------------------------------------------
   * 5. Signer planner. Each key has a holder and a location.
   * ------------------------------------------------------------------ */
  const MAX_KEYS = 7;
  const LOCATIONS = {
    home: { label: "Home safe", color: "#1f5a52" },
    bank: { label: "Bank safe deposit box", color: "#c98d2e" },
    office: { label: "Office safe", color: "#9b3f1f" },
    relative: { label: "Relative in another town", color: "#4f9a90" },
    attorney: { label: "Attorney’s vault", color: "#5b4b3f" },
    carried: { label: "Carried day to day", color: "#b9806a" },
  };
  const PRESETS = {
    household: {
      label: "Household 2-of-3",
      threshold: 2,
      keys: [
        { holder: "You", location: "home" },
        { holder: "You", location: "bank" },
        { holder: "Your sister", location: "relative" },
      ],
    },
    team: {
      label: "Team 3-of-5",
      threshold: 3,
      keys: [
        { holder: "Founder", location: "home" },
        { holder: "Finance lead", location: "office" },
        { holder: "Operations lead", location: "bank" },
        { holder: "Board member", location: "relative" },
        { holder: "Company attorney", location: "attorney" },
      ],
    },
    "two-of-two": {
      label: "Couple 2-of-2",
      threshold: 2,
      keys: [
        { holder: "You", location: "home" },
        { holder: "Your partner", location: "home" },
      ],
    },
    single: {
      label: "Single key",
      threshold: 1,
      keys: [{ holder: "You", location: "carried" }],
    },
  };
  const HOLDER_MAX = 40;

  /* ------------------------------------------------------------------
   * 6. Pricing, in US dollars. Devices are bought by you, new, from the
   *    maker; we never sell hardware or take referral fees.
   * ------------------------------------------------------------------ */
  const PLANS = {
    review: {
      label: "Security review",
      price: 420,
      blurb: "Two remote sessions and a written report on the setup you already have.",
      includedDevices: 2,
      extraDevice: 60,
      includedSigners: 1,
      extraSigner: 90,
      care: 0,
    },
    household: {
      label: "Household vault",
      price: 1650,
      blurb: "A two-of-three vault set up with you, a restore drill and a year of check-ins.",
      includedDevices: 3,
      extraDevice: 95,
      includedSigners: 3,
      extraSigner: 180,
      care: 240,
    },
    team: {
      label: "Team vault",
      price: 3900,
      blurb: "A multisig vault for a business, a written signing policy and training for every signer.",
      includedDevices: 5,
      extraDevice: 95,
      includedSigners: 5,
      extraSigner: 150,
      care: 960,
    },
  };
  const RECOVERY_PLANS = {
    none: { label: "No recovery plan for now", price: 0 },
    letter: { label: "Letter of instruction, reviewed with you", price: 380 },
    estate: { label: "Full inheritance plan, with your attorney", price: 850 },
  };
  // Key ceremony at your home or office. travelAtCost: flights and lodging billed at cost on top.
  const TRAVEL_ZONES = {
    studio: { label: "At our Santa Fe studio, or remote", price: 0 },
    local: { label: "Your home or office in Santa Fe or Eldorado", price: 120 },
    north: { label: "Northern New Mexico: Taos, Los Alamos, Española", price: 290 },
    state: { label: "Elsewhere in New Mexico, including Albuquerque", price: 520 },
    away: { label: "Outside New Mexico", price: 950, travelAtCost: true },
  };
  const QUOTE_LIMITS = { devices: [1, 12], signers: [1, 9] };

  /* ------------------------------------------------------------------
   * 7. Field notes and advisories, newest first once sorted.
   *    KEEP_DEMO_CURRENT moves every date forward in whole weeks from
   *    DEMO_ANCHOR, so the newest note always reads as this week's
   *    (weekdays never change). On the anchor date the page shows the
   *    dates exactly as written. Set it to false for a real site.
   * ------------------------------------------------------------------ */
  const KEEP_DEMO_CURRENT = true;
  const DEMO_ANCHOR = "2026-10-24";
  const NOTE_TYPES = { advisory: "Advisory", field: "Field note", checklist: "Checklist update" };
  // severity (advisories only): act = do something now, watch = be ready, info = good to know.
  const SEVERITIES = { act: "Act now", watch: "Watch", info: "Good to know" };
  const NOTES = [
    {
      id: "support-calls",
      date: "2026-10-21",
      type: "advisory",
      severity: "act",
      title: "Calls claiming to be wallet support are back in Northern New Mexico",
      summary:
        "Three clients had calls this month from people who knew their name and device model. Every call ended with a request to “verify” the recovery phrase. Hang up, and call us or the maker on a number you found yourself.",
      author: "Ximena Archuleta",
    },
    {
      id: "drill-season",
      date: "2026-10-14",
      type: "checklist",
      title: "Restore drill checklist: now with a step for the vault configuration",
      summary:
        "Households with a multisig vault should restore the configuration file as well as a key. We added a step and a place to note its fingerprint.",
      author: "Ignacio Lucero",
    },
    {
      id: "safe-deposit",
      date: "2026-10-07",
      type: "field",
      title: "What we learned opening twelve safe deposit boxes with clients",
      summary:
        "Two branches had changed their access rules, one box needed a second signature nobody remembered, and one backup had been stored next to the device. Visit your box once a year.",
      author: "Yolanda Vigil",
    },
    {
      id: "firmware-prompts",
      date: "2026-09-30",
      type: "advisory",
      severity: "watch",
      title: "Fake firmware prompts in lookalike desktop apps",
      summary:
        "A lookalike app is showing a firmware “update” that asks for the phrase. Real updates never do. Only install the maker’s app from the address printed in the box.",
      author: "Ignacio Lucero",
    },
    {
      id: "executor-meeting",
      date: "2026-09-23",
      type: "field",
      title: "A good executor meeting takes forty minutes, not four hours",
      summary:
        "Our notes from twenty briefings with attorneys and executors: what to cover, what to leave for the letter, and the questions that come up every time.",
      author: "Yolanda Vigil",
    },
    {
      id: "roof-leaks",
      date: "2026-09-09",
      type: "field",
      title: "Roof leaks and the backup in the garage",
      summary:
        "Two paper backups were lost to roof leaks this year. Paper in a garage or a shed is a backup on borrowed time; metal in a dry room is not.",
      author: "Dov Kemper",
    },
    {
      id: "team-threshold",
      date: "2026-08-26",
      type: "checklist",
      title: "Signing policy template: a new section on confirmation calls",
      summary:
        "Any withdrawal above your agreed limit now needs a call to a second signer on a number already on file. The template explains why email is not enough.",
      author: "Dov Kemper",
    },
    {
      id: "giveaway",
      date: "2026-08-12",
      type: "advisory",
      severity: "watch",
      title: "“Double your coins” giveaways using a local news anchor’s face",
      summary:
        "Video ads with a cloned voice are circulating. Nobody gives money away for sending money first. Report the ad and don’t click through.",
      author: "Ximena Archuleta",
    },
    {
      id: "two-makers",
      date: "2026-07-29",
      type: "field",
      title: "Why we put devices from two makers in every vault",
      summary:
        "A fault or a bad update from one maker shouldn’t be able to lock a whole vault. Mixing makers costs nothing extra and removes a quiet single point of failure.",
      author: "Ignacio Lucero",
    },
    {
      id: "address-poisoning",
      date: "2026-07-15",
      type: "advisory",
      severity: "act",
      title: "Address poisoning: check every character, not the first and last four",
      summary:
        "Tiny transfers from lookalike addresses are landing in history lists so that the wrong one gets copied later. Confirm the whole address on the device screen.",
      author: "Dov Kemper",
    },
    {
      id: "letter-update",
      date: "2026-07-01",
      type: "checklist",
      title: "Letter of instruction: a clearer “who to call first” page",
      summary:
        "Families told us the first page matters most. The new version leads with three names and phone numbers and leaves the detail for later pages.",
      author: "Yolanda Vigil",
    },
    {
      id: "parked-cars",
      date: "2026-06-17",
      type: "advisory",
      severity: "info",
      title: "Devices left in parked cars",
      summary:
        "A day in a parked car, in July heat or a January freeze, can damage batteries and screens. Devices are cheap to replace when your backup is sound; check it before you need it.",
      author: "Ignacio Lucero",
    },
    {
      id: "couples",
      date: "2026-06-03",
      type: "field",
      title: "Two-of-two vaults for couples: lovely idea, hard Tuesday",
      summary:
        "If either of you is unavailable, nothing moves. We now suggest two-of-three for couples, with the third key at a relative’s home or an attorney’s vault.",
      author: "Ximena Archuleta",
    },
    {
      id: "sim-swap",
      date: "2026-05-20",
      type: "advisory",
      severity: "watch",
      title: "Phone number takeovers before account withdrawals",
      summary:
        "Ask your carrier for a port-out PIN, and remove text-message codes from any account that still holds funds while you move them to your own keys.",
      author: "Dov Kemper",
    },
  ];

  /* ------------------------------------------------------------------
   * 8. People. portrait: how the drawing is made (see portrait()).
   * ------------------------------------------------------------------ */
  const PEOPLE = [
    {
      name: "Ximena Archuleta",
      role: "Founder and lead reviewer",
      bio: "Spent eleven years in bank fraud investigations before opening Cipheroak in 2019. Leads every security review and reads every advisory before it goes out.",
      portrait: { skin: "#b07a55", hair: "#2b1c14", style: "long", top: "#1f5a52", ground: "#d3e6df" },
    },
    {
      name: "Ignacio Lucero",
      role: "Devices and key ceremonies",
      bio: "A former electronics repair technician who has run more than three hundred key ceremonies, from kitchen tables in Tesuque to boardrooms in Albuquerque.",
      portrait: { skin: "#8a5a3c", hair: "#1c1410", style: "short", top: "#c98d2e", ground: "#f1dcae", glasses: true },
    },
    {
      name: "Yolanda Vigil",
      role: "Inheritance and recovery planning",
      bio: "Worked as an estate paralegal for fifteen years. Writes our letters of instruction and sits with families and their attorneys so plans are understood, not just filed.",
      portrait: { skin: "#c99877", hair: "#6b5a52", style: "bun", top: "#9b3f1f", ground: "#f2d3c3" },
    },
    {
      name: "Dov Kemper",
      role: "Team vaults and signing policy",
      bio: "Built treasury controls for a regional credit union. Helps small teams write signing policies that hold up when someone is on vacation and a message says it’s urgent.",
      portrait: { skin: "#e3b896", hair: "#8a5a2e", style: "curly", top: "#5b4b3f", ground: "#e8d8c2" },
    },
  ];

  /* ------------------------------------------------------------------
   * 9. Helpers and saved data
   * ------------------------------------------------------------------ */
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const own = (obj, key) => typeof key === "string" && Object.prototype.hasOwnProperty.call(obj, key);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const money = new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 });
  const price = (n) => money.format(n);

  function escapeHtml(s) {
    return String(s).replace(
      /[&<>"']/g,
      (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c],
    );
  }
  function plural(n, one, many) {
    return n + " " + (n === 1 ? one : many || one + "s");
  }
  function listText(items) {
    if (items.length < 2) return items.join("");
    return items.slice(0, -1).join(", ") + " and " + items[items.length - 1];
  }
  // Plain text from storage or a form: no control characters, trimmed to max.
  function cleanText(value, max) {
    return typeof value === "string"
      ? value
          .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "")
          .trim()
          .slice(0, max)
      : "";
  }
  function urlParam(name) {
    return new URLSearchParams(location.search).get(name);
  }
  function clamp(n, lo, hi) {
    return Math.min(hi, Math.max(lo, n));
  }

  // localStorage, or an in-memory stand-in when the browser blocks it (a sandboxed iframe, strict
  // privacy settings): saved state then lasts for this page view instead of the feature doing nothing.
  const safeStorage = (function () {
    let local = null;
    try {
      local = window.localStorage;
      local.getItem("_");
    } catch (e) {
      local = null; /* blocked */
    }
    // A save that fails (storage full) stays in memory, and memory is read first, so the change isn't lost.
    const memory = Object.create(null);
    return {
      getItem: (key) => {
        if (key in memory) return memory[key];
        try {
          return local ? local.getItem(key) : null;
        } catch (e) {
          return null;
        }
      },
      setItem: (key, value) => {
        if (local) {
          try {
            local.setItem(key, String(value));
            delete memory[key];
            return;
          } catch (e) {
            /* full */
          }
        }
        memory[key] = String(value);
      },
      removeItem: (key) => {
        delete memory[key];
        if (local) {
          try {
            local.removeItem(key);
          } catch (e) {
            /* blocked */
          }
        }
      },
    };
  })();
  const KEYS = {
    readingList: "cipheroak-reading-list",
    assessment: "cipheroak-assessment",
    signerPlan: "cipheroak-signer-plan",
    quote: "cipheroak-quote",
  };
  function read(key) {
    try {
      return JSON.parse(safeStorage.getItem(key));
    } catch (e) {
      return null;
    }
  }
  function write(key, value) {
    try {
      if (value === null) safeStorage.removeItem(key);
      else safeStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* storage full: the page keeps working without it */
    }
  }

  /* ------------------------------------------------------------------
   * 10. Studio clock. Dates are 'YYYY-MM-DD' strings in TIMEZONE.
   *     Add ?now=2026-10-26T09:15 (studio time) to any page to preview
   *     another moment.
   * ------------------------------------------------------------------ */
  const pad = (n) => String(n).padStart(2, "0");
  const toMins = (t) => {
    const p = t.split(":");
    return +p[0] * 60 + +p[1];
  };
  const isIsoDate = (s) =>
    typeof s === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    !isNaN(Date.parse(s + "T12:00:00Z")) &&
    new Date(s + "T12:00:00Z").toISOString().slice(0, 10) === s;
  const dayOf = (iso) => new Date(iso + "T12:00:00Z").getUTCDay();
  const dayNum = (iso) => Math.round(Date.parse(iso + "T00:00:00Z") / 86400000);
  function addDays(iso, n) {
    const d = new Date(iso + "T12:00:00Z");
    d.setUTCDate(d.getUTCDate() + n);
    return d.toISOString().slice(0, 10);
  }
  // 780 → "1:00 PM"
  function clock(mins) {
    const h = Math.floor(mins / 60) % 24;
    return (h % 12 || 12) + ":" + pad(mins % 60) + " " + (h < 12 ? "AM" : "PM");
  }
  function fmtDate(iso, opts) {
    return new Intl.DateTimeFormat(LOCALE, Object.assign({ timeZone: "UTC" }, opts)).format(
      new Date(iso + "T12:00:00Z"),
    );
  }

  const PREVIEW = (function () {
    const v = urlParam("now");
    if (!v || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) || !isIsoDate(v.slice(0, 10))) return null;
    const h = +v.slice(11, 13);
    const m = +v.slice(14, 16);
    return h < 24 && m < 60 ? { date: v.slice(0, 10), mins: h * 60 + m } : null;
  })();
  // { date: 'YYYY-MM-DD', day: 0–6, mins: minutes since midnight } in studio time.
  function studioNow() {
    if (PREVIEW) return { date: PREVIEW.date, day: dayOf(PREVIEW.date), mins: PREVIEW.mins };
    const parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(new Date())
      .forEach((p) => {
        parts[p.type] = p.value;
      });
    const date = parts.year + "-" + parts.month + "-" + parts.day;
    return { date: date, day: dayOf(date), mins: (+parts.hour % 24) * 60 + +parts.minute };
  }

  // The nth weekday (0 = Sunday) of a month; n = -1 for the last one.
  function nthWeekday(year, month, weekday, n) {
    if (n > 0) {
      const first = year + "-" + pad(month) + "-01";
      return addDays(first, ((weekday - dayOf(first) + 7) % 7) + (n - 1) * 7);
    }
    const next = month === 12 ? year + 1 + "-01-01" : year + "-" + pad(month + 1) + "-01";
    const last = addDays(next, -1);
    return addDays(last, -((dayOf(last) - weekday + 7) % 7));
  }
  // Fixed-date holidays move to Friday or Monday when they fall on a weekend.
  function observed(iso) {
    const d = dayOf(iso);
    return d === 6 ? addDays(iso, -1) : d === 0 ? addDays(iso, 1) : iso;
  }
  const holidayCache = Object.create(null);
  // { 'YYYY-MM-DD': 'Holiday name' } for the HOLIDAYS the studio closes for.
  function usHolidays(year) {
    if (holidayCache[year]) return holidayCache[year];
    // When Christmas is observed on Friday the 24th, Christmas Eve closes on Thursday the 23rd.
    const christmas = observed(year + "-12-25");
    const rules = {
      "new-year": ["New Year’s Day", observed(year + "-01-01")],
      mlk: ["Martin Luther King Jr. Day", nthWeekday(year, 1, 1, 3)],
      memorial: ["Memorial Day", nthWeekday(year, 5, 1, -1)],
      juneteenth: ["Juneteenth", observed(year + "-06-19")],
      independence: ["Independence Day", observed(year + "-07-04")],
      labor: ["Labor Day", nthWeekday(year, 9, 1, 1)],
      indigenous: ["Indigenous Peoples’ Day", nthWeekday(year, 10, 1, 2)],
      thanksgiving: ["Thanksgiving", nthWeekday(year, 11, 4, 4)],
      "thanksgiving-friday": ["Day after Thanksgiving", addDays(nthWeekday(year, 11, 4, 4), 1)],
      "christmas-eve": ["Christmas Eve", christmas === year + "-12-24" ? year + "-12-23" : year + "-12-24"],
      christmas: ["Christmas Day", christmas],
    };
    const out = Object.create(null);
    HOLIDAYS.forEach((id) => {
      if (own(rules, id)) out[rules[id][1]] = rules[id][0];
    });
    CLOSURES.forEach((c) => {
      if (c && isIsoDate(c.date) && +c.date.slice(0, 4) === year) out[c.date] = cleanText(c.label, 60) || "Closed";
    });
    holidayCache[year] = out;
    return out;
  }
  function closedReason(iso) {
    // Next year's New Year's Day can be observed on December 31.
    const year = +iso.slice(0, 4);
    const h = Object.assign({}, usHolidays(year), usHolidays(year + 1));
    return iso in h ? h[iso] : null;
  }
  function isWorkday(iso) {
    return !!HOURS[dayOf(iso)] && !closedReason(iso);
  }
  // Holidays from today onward, for the company page.
  function upcomingClosures(from, count) {
    const year = +from.slice(0, 4);
    const all = Object.assign({}, usHolidays(year), usHolidays(year + 1));
    return Object.keys(all)
      .filter((d) => d >= from && HOURS[dayOf(d)])
      .sort()
      .slice(0, count)
      .map((d) => ({ date: d, label: all[d] }));
  }
  // "Open now until 5:00 PM" / "Closed, opens Monday at 9:00 AM".
  function studioStatus() {
    const now = studioNow();
    const hours = HOURS[now.day];
    if (hours && isWorkday(now.date) && now.mins >= toMins(hours[0]) && now.mins < toMins(hours[1])) {
      return { open: true, text: "Open now until " + clock(toMins(hours[1])) };
    }
    let d = now.date;
    if (hours && isWorkday(d) && now.mins < toMins(hours[0])) {
      return { open: false, text: "Closed, opens today at " + clock(toMins(hours[0])) };
    }
    for (let i = 1; i < 15; i++) {
      d = addDays(now.date, i);
      if (isWorkday(d)) {
        const when = i === 1 ? "tomorrow" : fmtDate(d, { weekday: "long" });
        return { open: false, text: "Closed, opens " + when + " at " + clock(toMins(HOURS[dayOf(d)][0])) };
      }
    }
    return { open: false, text: "Closed" };
  }

  // Call slots: the next BOOKING.businessDays business days, starting at least
  // BOOKING.leadHours from now. Some slots are taken, the same ones on every visit.
  function slotTaken(iso, time) {
    let h = 2166136261;
    const s = iso + "|" + time;
    for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
    return (h >>> 0) % 10 < 3;
  }
  function callDays() {
    const now = studioNow();
    const earliest = dayNum(now.date) * 1440 + now.mins + BOOKING.leadHours * 60;
    const days = [];
    for (let i = 0; days.length < BOOKING.businessDays && i < 40; i++) {
      const date = addDays(now.date, i);
      if (!isWorkday(date)) continue;
      const slots = SLOT_TIMES[dayOf(date)]
        .filter((t) => dayNum(date) * 1440 + toMins(t) >= earliest)
        .map((t) => ({ time: t, taken: slotTaken(date, t) }));
      if (slots.length) days.push({ date: date, slots: slots });
    }
    return days;
  }
  function firstOpenSlot() {
    const days = callDays();
    for (const d of days) {
      const s = d.slots.find((x) => !x.taken);
      if (s) return { date: d.date, time: s.time };
    }
    return null;
  }
  // The UTC instant of a studio wall time, for showing it in the visitor's own time zone.
  function studioInstant(iso, time) {
    const guess = Date.parse(iso + "T" + time + ":00Z");
    const parts = {};
    new Intl.DateTimeFormat("en-US", {
      timeZone: TIMEZONE,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      day: "2-digit",
    })
      .formatToParts(new Date(guess))
      .forEach((p) => {
        parts[p.type] = p.value;
      });
    let diff = (+parts.hour % 24) * 60 + +parts.minute - toMins(time);
    if (+parts.day !== +iso.slice(8, 10)) diff += +parts.day < +iso.slice(8, 10) ? -1440 : 1440;
    if (diff > 720) diff -= 1440;
    if (diff < -720) diff += 1440;
    return guess - diff * 60000;
  }
  function visitorZone() {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || TIMEZONE;
    } catch (e) {
      return TIMEZONE;
    }
  }
  function slotLabel(iso, time) {
    return fmtDate(iso, { weekday: "long", month: "long", day: "numeric" }) + " at " + clock(toMins(time));
  }

  /* ------------------------------------------------------------------
   * 11. Artwork
   * ------------------------------------------------------------------ */
  const INK = "#2b211b";
  const PAPER = "#fbf7f0";
  const TOPIC_GROUND = {
    devices: "#d3e6df",
    backups: "#f1dcae",
    multisig: "#e8d8c2",
    inheritance: "#f2d3c3",
    everyday: "#dfe3cf",
  };
  // Concentric tree rings, the Cipheroak motif, used behind several drawings.
  function rings(cx, cy, r, color) {
    let s = "";
    for (let i = r; i > 8; i -= 11) {
      s += `<circle cx="${cx}" cy="${cy}" r="${i}" fill="none" stroke="${color}" stroke-width="1.4" opacity=".55"/>`;
    }
    return s;
  }
  const GUIDE_ART = {
    device: () =>
      `${rings(240, 150, 70, "#4f9a90")}
      <path d="M40 150c40 0 40-40 80-40" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>
      <rect x="118" y="58" width="112" height="78" rx="16" fill="${INK}"/>
      <rect x="132" y="70" width="84" height="40" rx="5" fill="#d3e6df"/>
      <path d="M142 90h20m6 0h12m6 0h18" stroke="#1f5a52" stroke-width="3" stroke-linecap="round"/>
      <circle cx="150" cy="122" r="6" fill="#c98d2e"/><circle cx="198" cy="122" r="6" fill="#c98d2e"/>`,
    seal: () =>
      `<rect x="76" y="62" width="168" height="104" rx="8" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>
      <path d="M76 92h168" stroke="${INK}" stroke-width="3"/>
      <rect x="140" y="52" width="40" height="60" rx="4" fill="#c98d2e" stroke="${INK}" stroke-width="3"/>
      <path d="M146 64h28M146 74h28M146 84h28M146 94h28" stroke="${INK}" stroke-width="1.5" stroke-dasharray="3 3"/>
      <circle cx="226" cy="146" r="26" fill="#1f5a52"/><path d="m214 146 8 8 16-17" fill="none" stroke="${PAPER}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`,
    layers: () =>
      `<rect x="96" y="96" width="120" height="78" rx="12" fill="#4f9a90" transform="rotate(-6 156 135)"/>
      <rect x="104" y="88" width="120" height="78" rx="12" fill="#c98d2e" transform="rotate(3 164 127)"/>
      <rect x="110" y="80" width="120" height="80" rx="12" fill="${INK}"/>
      <path d="M140 80V62a30 30 0 0 1 60 0v18" fill="none" stroke="${INK}" stroke-width="10"/>
      <circle cx="170" cy="112" r="10" fill="#f1dcae"/><path d="M165 118h10l3 22h-16z" fill="#f1dcae"/>`,
    plate: () =>
      `<rect x="60" y="52" width="170" height="110" rx="10" fill="#b8b2a6" stroke="${INK}" stroke-width="3"/>
      ${Array.from({ length: 4 }, (_, r) =>
        Array.from(
          { length: 6 },
          (_, c) =>
            `<rect x="${76 + c * 24}" y="${68 + r * 22}" width="16" height="14" rx="2" fill="${(r * 6 + c) % 4 ? "#8b8478" : INK}"/>`,
        ).join(""),
      ).join("")}
      <path d="M244 40 268 64" stroke="${INK}" stroke-width="12" stroke-linecap="round"/>
      <path d="M262 58 236 132" stroke="#9b3f1f" stroke-width="8" stroke-linecap="round"/>`,
    map: () =>
      `<path d="M50 60l70-20 80 20 70-20v120l-70 20-80-20-70 20z" fill="${PAPER}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M120 40v120M200 60v120" stroke="${INK}" stroke-width="1.5" stroke-dasharray="4 4"/>
      <path d="M86 128c30-40 70 10 110-30s40-20 50-10" fill="none" stroke="#9b3f1f" stroke-width="2.5" stroke-dasharray="6 6"/>
      <g fill="#1f5a52"><circle cx="86" cy="122" r="9"/><circle cx="170" cy="104" r="9"/><circle cx="246" cy="86" r="9"/></g>`,
    loop: () =>
      `${rings(160, 104, 64, "#c98d2e")}
      <path d="M110 80a56 56 0 1 1-4 50" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="m96 66 14 16 18-12" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="146" cy="104" r="14" fill="none" stroke="#1f5a52" stroke-width="6"/><path d="M160 104h36m-12 0v12m-10-12v8" stroke="#1f5a52" stroke-width="6" stroke-linecap="round"/>`,
    keys: () => {
      const key = (x, y, c) =>
        `<circle cx="${x}" cy="${y}" r="16" fill="none" stroke="${c}" stroke-width="6"/><path d="M${x + 16} ${y}h34m-10 0v12m-10-12v8" stroke="${c}" stroke-width="6" stroke-linecap="round"/>`;
      return `<path d="M110 70 210 70 160 150z" fill="none" stroke="${INK}" stroke-width="2" stroke-dasharray="5 5"/>
      ${key(80, 70, "#1f5a52")}${key(190, 70, "#9b3f1f")}${key(136, 150, "#c98d2e")}`;
    },
    policy: () =>
      `<rect x="96" y="30" width="128" height="150" rx="6" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>
      <path d="M114 58h92M114 74h92M114 90h70M114 106h92M114 122h50" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M114 154c10-12 18 6 26-4s14 4 22-2" fill="none" stroke="#1f5a52" stroke-width="2.5" stroke-linecap="round"/>
      <circle cx="226" cy="150" r="24" fill="#9b3f1f"/><circle cx="226" cy="150" r="15" fill="none" stroke="#f2d3c3" stroke-width="2"/>`,
    door: () =>
      `<path d="M110 180V90a50 50 0 0 1 100 0v90z" fill="#9b3f1f" stroke="${INK}" stroke-width="3"/>
      <path d="M124 180V94a36 36 0 0 1 72 0v86z" fill="#e8d8c2"/>
      <path d="M40 180h240" stroke="${INK}" stroke-width="3"/>
      <circle cx="240" cy="120" r="12" fill="none" stroke="${INK}" stroke-width="5"/><path d="M252 120h24" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>
      <path d="M222 132c-10 14-24 18-36 14" fill="none" stroke="#1f5a52" stroke-width="2.5" stroke-dasharray="5 4"/>`,
    envelope: () =>
      `<rect x="70" y="60" width="180" height="110" rx="6" fill="${PAPER}" stroke="${INK}" stroke-width="3"/>
      <path d="m70 64 90 62 90-62" fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>
      <circle cx="160" cy="124" r="20" fill="#9b3f1f"/>
      <path d="M160 110c8 6 8 18 0 26-8-8-8-20 0-26z" fill="#f2d3c3"/>`,
    people: () => {
      const person = (x, c) =>
        `<circle cx="${x}" cy="76" r="20" fill="${INK}"/><path d="M${x - 34} 150a34 40 0 0 1 68 0z" fill="${c}"/>`;
      return `${person(108, "#1f5a52")}${person(212, "#c98d2e")}
      <rect x="60" y="148" width="200" height="12" rx="4" fill="${INK}"/>
      <rect x="136" y="122" width="48" height="30" rx="3" fill="${PAPER}" stroke="${INK}" stroke-width="2.5"/>`;
    },
    suitcase: () =>
      `<rect x="88" y="70" width="144" height="98" rx="12" fill="#1f5a52" stroke="${INK}" stroke-width="3"/>
      <path d="M134 70V54a8 8 0 0 1 8-8h36a8 8 0 0 1 8 8v16" fill="none" stroke="${INK}" stroke-width="5"/>
      <path d="M118 70v98M202 70v98" stroke="${PAPER}" stroke-width="3" opacity=".6"/>
      <path d="M232 92l26 30-14 12" fill="none" stroke="${INK}" stroke-width="2"/><rect x="236" y="128" width="26" height="36" rx="4" fill="#f1dcae" stroke="${INK}" stroke-width="2.5" transform="rotate(-12 249 146)"/>`,
    hook: () =>
      `<path d="M200 20v86a34 34 0 0 1-68 0v-12" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
      <path d="m124 102 8-14 10 12" fill="none" stroke="${INK}" stroke-width="6" stroke-linejoin="round"/>
      ${["#c98d2e", "#9b3f1f", "#c98d2e", "#9b3f1f", "#c98d2e"].map((c, i) => `<rect x="${44 + i * 36}" y="${160 - (i % 2) * 6}" width="30" height="18" rx="3" fill="${c}"/>`).join("")}
      <path d="M40 186h200" stroke="${INK}" stroke-width="2" stroke-dasharray="3 5"/>`,
    clock: () =>
      `<circle cx="160" cy="104" r="70" fill="${PAPER}" stroke="${INK}" stroke-width="4"/>
      <path d="M160 104V34a70 70 0 0 1 70 70z" fill="#f2d3c3"/>
      ${Array.from({ length: 12 }, (_, i) => {
        const a = (i * Math.PI) / 6;
        return `<path d="M${160 + Math.sin(a) * 58} ${104 - Math.cos(a) * 58}L${160 + Math.sin(a) * 66} ${104 - Math.cos(a) * 66}" stroke="${INK}" stroke-width="3"/>`;
      }).join("")}
      <path d="M160 104V58M160 104l30 18" stroke="${INK}" stroke-width="5" stroke-linecap="round"/><circle cx="160" cy="104" r="6" fill="#9b3f1f"/>`,
  };
  function guideArt(g) {
    const draw = own(GUIDE_ART, g.art) ? GUIDE_ART[g.art] : GUIDE_ART.device;
    return `<svg viewBox="0 0 320 200" class="block h-auto w-full" role="img" aria-label="Illustration for ${escapeHtml(g.title)}"><rect width="320" height="200" fill="${TOPIC_GROUND[g.topic] || "#e8d8c2"}"/>${draw()}</svg>`;
  }
  // A simple portrait inside an arch.
  function portrait(p) {
    const a = p.portrait;
    // [behind the face, in front of the face] for each hair style.
    const hair = {
      long: [
        `<path d="M62 96c0-38 18-56 38-56s38 18 38 56v58H62z" fill="${a.hair}"/>`,
        `<path d="M70 88c2-24 14-36 30-36s28 12 30 36c-10-12-22-18-30-18s-22 6-30 18z" fill="${a.hair}"/>`,
      ],
      short: ["", `<path d="M69 90c-2-28 12-42 31-42s33 14 31 42c-6-14-18-20-31-20s-25 6-31 20z" fill="${a.hair}"/>`],
      bun: [
        `<circle cx="100" cy="46" r="15" fill="${a.hair}"/>`,
        `<path d="M70 90c0-26 14-38 30-38s30 12 30 38c-6-14-18-20-30-20s-24 6-30 20z" fill="${a.hair}"/>`,
      ],
      curly: [
        "",
        `<g fill="${a.hair}">${[72, 84, 96, 108, 120, 130].map((x, i) => `<circle cx="${x}" cy="${68 - (i % 2) * 5}" r="11"/>`).join("")}<circle cx="70" cy="82" r="8"/><circle cx="130" cy="82" r="8"/></g>`,
      ],
    };
    const h = own(hair, a.style) ? hair[a.style] : ["", ""];
    const glasses = a.glasses
      ? `<g fill="none" stroke="${INK}" stroke-width="2.5"><circle cx="88" cy="96" r="8"/><circle cx="112" cy="96" r="8"/><path d="M96 96h8"/></g>`
      : "";
    return `<svg viewBox="0 0 200 220" class="block h-auto w-full" role="img" aria-label="Portrait of ${escapeHtml(p.name)}">
      <rect width="200" height="220" fill="${a.ground}"/>${rings(100, 236, 140, INK)}
      ${h[0]}
      <path d="M40 220c0-44 26-70 60-70s60 26 60 70z" fill="${a.top}"/>
      <path d="M86 150c4 8 24 8 28 0" fill="none" stroke="${INK}" stroke-width="2" opacity=".35"/>
      <rect x="90" y="122" width="20" height="30" fill="${a.skin}"/>
      <ellipse cx="100" cy="96" rx="29" ry="35" fill="${a.skin}"/>
      ${h[1]}
      <circle cx="89" cy="97" r="2.6" fill="${INK}"/><circle cx="111" cy="97" r="2.6" fill="${INK}"/>${glasses}
      <path d="M100 100v8h-4" fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" opacity=".5"/>
      <path d="M91 115c5 4 13 4 18 0" fill="none" stroke="${INK}" stroke-width="2.5" stroke-linecap="round"/></svg>`;
  }

  /* ------------------------------------------------------------------
   * 12. Header, mobile menu, reveal, footer year, notices
   * ------------------------------------------------------------------ */
  const menuBtn = $("#menu-toggle");
  const mobileMenu = $("#mobile-menu");
  function setMenu(open) {
    if (!menuBtn || !mobileMenu) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobileMenu.hidden = !open;
    $("[data-icon-open]", menuBtn).classList.toggle("hidden", open);
    $("[data-icon-close]", menuBtn).classList.toggle("hidden", !open);
  }
  function initChrome() {
    if (menuBtn) {
      menuBtn.addEventListener("click", () => setMenu(menuBtn.getAttribute("aria-expanded") !== "true"));
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && menuBtn.getAttribute("aria-expanded") === "true") {
          setMenu(false);
          menuBtn.focus();
        }
      });
      window.matchMedia("(min-width: 1280px)").addEventListener("change", (e) => {
        if (e.matches) setMenu(false);
      });
    }
    $$("[data-year]").forEach((el) => {
      el.textContent = studioNow().date.slice(0, 4);
    });
    const status = studioStatus();
    $$("[data-studio-status]").forEach((el) => {
      el.textContent = "Galisteo Street studio · " + status.text + " (Mountain Time)";
    });
  }

  const revealObserver =
    "IntersectionObserver" in window && !reduceMotion
      ? new IntersectionObserver(
          (entries) => {
            entries.forEach((en) => {
              if (!en.isIntersecting) return;
              // Reveal this element and everything above it, so fast jumps never leave gaps.
              const top = en.target.getBoundingClientRect().top;
              $$(".reveal:not(.is-visible)").forEach((el) => {
                if (el.getBoundingClientRect().top <= top) {
                  el.classList.add("is-visible");
                  revealObserver.unobserve(el);
                }
              });
            });
          },
          { rootMargin: "0px 0px -6% 0px", threshold: 0.04 },
        )
      : null;
  function reveal(root) {
    $$(".reveal:not(.is-visible)", root).forEach((el) => {
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add("is-visible");
    });
  }

  let noticeTimer = 0;
  function notice(text) {
    const el = $("#notice");
    if (!el) return;
    el.textContent = text;
    el.hidden = false;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => {
      el.hidden = true;
    }, 4000);
  }

  /* ------------------------------------------------------------------
   * 7b. Rolling note dates (see KEEP_DEMO_CURRENT above)
   * ------------------------------------------------------------------ */
  function noteShift() {
    if (!KEEP_DEMO_CURRENT) return 0;
    const days = dayNum(studioNow().date) - dayNum(DEMO_ANCHOR);
    return days > 0 ? Math.floor(days / 7) * 7 : 0;
  }
  function datedNotes() {
    const shift = noteShift();
    return NOTES.map((n) => Object.assign({}, n, { date: addDays(n.date, shift) })).sort((a, b) =>
      a.date < b.date ? 1 : a.date > b.date ? -1 : 0,
    );
  }
  function severityBadge(n) {
    if (n.type !== "advisory" || !own(SEVERITIES, n.severity)) return "";
    const cls = {
      act: "bg-chile text-parchment",
      watch: "bg-ochre-soft text-bark",
      info: "bg-sky text-juniper",
    }[n.severity];
    return `<span class="rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}">${SEVERITIES[n.severity]}</span>`;
  }

  /* ------------------------------------------------------------------
   * 13. Home
   * ------------------------------------------------------------------ */
  function initHome() {
    const latest = $("[data-latest-advisory]");
    if (latest) {
      const n = datedNotes().find((x) => x.type === "advisory");
      latest.innerHTML = `<div class="flex flex-wrap items-center gap-3">${severityBadge(n)}<time class="eyebrow text-bark-soft" datetime="${n.date}">${fmtDate(n.date, { month: "long", day: "numeric", year: "numeric" })}</time></div>
        <h3 class="mt-4 font-display text-2xl leading-snug font-semibold">${escapeHtml(n.title)}</h3>
        <p class="mt-3 leading-relaxed text-bark-soft">${escapeHtml(n.summary)}</p>
        <a class="text-link mt-5 inline-block" href="notes.html#note-${n.id}">Read the advisory</a>`;
    }
    const slot = $("[data-next-slot]");
    if (slot) {
      const s = firstOpenSlot();
      slot.textContent = s ? slotLabel(s.date, s.time) : "Call us to find a time";
    }
    const guides = $("[data-home-guides]");
    if (guides) {
      guides.innerHTML = ["first-device", "two-of-three", "letter-of-instruction"]
        .map((id) => GUIDES.find((g) => g.id === id))
        .map(
          (g) => `<a href="guides.html?topic=${g.topic}#guide-${g.id}" class="group reveal block overflow-hidden rounded-3xl border border-line bg-parchment">
            ${guideArt(g)}
            <div class="p-6"><p class="eyebrow text-juniper">${TOPICS[g.topic]} · ${g.minutes} min</p>
            <h3 class="mt-3 font-display text-xl leading-snug font-semibold group-hover:underline">${escapeHtml(g.title)}</h3></div></a>`,
        )
        .join("");
      reveal(guides);
    }
  }

  /* ------------------------------------------------------------------
   * 14. Assessment
   * ------------------------------------------------------------------ */
  const MAX_POINTS = QUESTIONS.reduce((sum, q) => sum + Math.max(...q.options.map((o) => o.points)), 0);
  function loadAnswers() {
    const raw = read(KEYS.assessment);
    const out = Object.create(null);
    if (!raw || typeof raw !== "object" || !raw.answers || typeof raw.answers !== "object") return out;
    QUESTIONS.forEach((q) => {
      const v = raw.answers[q.id];
      if (Number.isInteger(v) && v >= 0 && v < q.options.length) out[q.id] = v;
    });
    return out;
  }
  // { answered, points, percent, level, sections: { id: percent }, recs: [...] }
  function scoreAssessment(answers) {
    let points = 0;
    let answered = 0;
    const sections = {};
    const recIds = [];
    Object.keys(SECTIONS).forEach((s) => {
      sections[s] = { got: 0, max: 0 };
    });
    QUESTIONS.forEach((q) => {
      const best = Math.max(...q.options.map((o) => o.points));
      sections[q.section].max += best;
      if (!(q.id in answers)) return;
      const o = q.options[answers[q.id]];
      answered++;
      points += o.points;
      sections[q.section].got += o.points;
      if (o.rec && own(RECOMMENDATIONS, o.rec) && recIds.indexOf(o.rec) < 0) recIds.push(o.rec);
    });
    const percent = Math.round((points / MAX_POINTS) * 100);
    const level = LEVELS.slice().reverse().find((l) => percent >= l.min);
    const recs = recIds
      .map((id) => Object.assign({ id: id }, RECOMMENDATIONS[id]))
      .sort((a, b) => a.priority - b.priority);
    return { answered: answered, points: points, percent: percent, level: level, sections: sections, recs: recs };
  }
  function initAssessment() {
    const form = $("[data-assessment]");
    if (!form) return;
    let answers = loadAnswers();
    let current = "";
    form.innerHTML = Object.keys(SECTIONS)
      .map((s, si) => {
        const qs = QUESTIONS.filter((q) => q.section === s);
        return `<fieldset class="reveal rounded-3xl border border-line bg-parchment p-6 sm:p-8">
          <legend class="sr-only">${SECTIONS[s]}</legend>
          <p class="eyebrow text-juniper" aria-hidden="true">Part ${si + 1} of 4 · ${SECTIONS[s]}</p>
          <div class="mt-2 divide-y divide-line">
          ${qs
            .map((q) => {
              const n = QUESTIONS.indexOf(q) + 1;
              return `<div class="py-6" role="radiogroup" aria-labelledby="q-${q.id}">
                <h3 id="q-${q.id}" class="font-display text-xl leading-snug font-semibold"><span class="mr-2 font-mono text-sm text-bark-soft">${pad(n)}</span>${escapeHtml(q.text)}</h3>
                <div class="mt-4 grid gap-2">
                ${q.options
                  .map(
                    (o, oi) => `<button type="button" role="radio" class="chip w-full justify-start rounded-2xl px-4 py-3 text-left text-[0.95rem]" data-q="${q.id}" data-o="${oi}" aria-checked="false">${escapeHtml(o.label)}</button>`,
                  )
                  .join("")}
                </div></div>`;
            })
            .join("")}
          </div></fieldset>`;
      })
      .join("");
    reveal(form);

    const result = $("[data-assessment-result]");
    function render() {
      $$("[data-q]", form).forEach((b) => {
        const on = answers[b.dataset.q] === +b.dataset.o;
        b.setAttribute("aria-checked", String(on));
      });
      // Roving tabindex inside each radio group.
      QUESTIONS.forEach((q) => {
        const btns = $$(`[data-q="${q.id}"]`, form);
        const sel = q.id in answers ? answers[q.id] : 0;
        btns.forEach((b, i) => b.setAttribute("tabindex", i === sel ? "0" : "-1"));
      });
      const s = scoreAssessment(answers);
      $("[data-progress-text]").textContent = s.answered + " of " + QUESTIONS.length + " answered";
      $("[data-progress-bar]").style.width = (s.answered / QUESTIONS.length) * 100 + "%";
      const done = s.answered === QUESTIONS.length;
      $("[data-result-pending]").hidden = done;
      result.hidden = !done;
      const bars = $("[data-section-bars]");
      bars.innerHTML = Object.keys(SECTIONS)
        .map((id) => {
          const pct = Math.round((s.sections[id].got / s.sections[id].max) * 100);
          return `<div><div class="flex justify-between text-sm"><span>${SECTIONS[id]}</span><span class="font-mono">${pct}%</span></div>
            <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-adobe-deep"><div class="h-full rounded-full ${pct >= 85 ? "bg-juniper" : pct >= 50 ? "bg-ochre" : "bg-chile"}" style="width:${pct}%"></div></div></div>`;
        })
        .join("");
      if (!done) {
        $("[data-recs-title]").textContent = "Your most important fixes";
        $("[data-recs-more]").textContent = "";
        $("[data-recs]").innerHTML =
          '<li class="rounded-2xl border border-dashed border-line p-5 text-sm leading-relaxed text-bark-soft md:col-span-2">Your recommendations appear here once all ten questions are answered.</li>';
        return;
      }
      $("[data-level]").textContent = s.level.label;
      $("[data-score]").textContent = s.percent;
      $("[data-level-summary]").textContent = s.level.summary;
      const dial = $("[data-dial]");
      dial.style.strokeDashoffset = String(301.6 - (301.6 * s.percent) / 100);
      dial.setAttribute("class", s.percent >= 85 ? "text-juniper" : s.percent >= 65 ? "text-turquoise" : s.percent >= 40 ? "text-ochre" : "text-chile");
      const list = $("[data-recs]");
      const top = s.recs.slice(0, 5);
      $("[data-recs-title]").textContent = top.length
        ? "Your " + (top.length === 1 ? "next fix" : top.length + " most important fixes")
        : "Nothing urgent to fix";
      list.innerHTML = top.length
        ? top
            .map((r, i) => {
              const g = GUIDES.find((x) => x.id === r.guide);
              return `<li class="rounded-2xl border border-line bg-parchment p-5"><p class="eyebrow ${r.priority <= 2 ? "text-chile" : "text-juniper"}">${pad(i + 1)} · ${r.priority <= 2 ? "Do this first" : "Next"}</p>
                <h4 class="mt-2 font-display text-lg font-semibold">${escapeHtml(r.title)}</h4>
                <p class="mt-2 text-sm leading-relaxed text-bark-soft">${escapeHtml(r.body)}</p>
                ${g ? `<a class="text-link mt-3 inline-block text-sm" href="guides.html#guide-${g.id}">Guide: ${escapeHtml(g.title)}</a>` : ""}</li>`;
            })
            .join("")
        : `<li class="rounded-2xl border border-line bg-parchment p-5 text-sm leading-relaxed">Every answer is the safest one. Book a yearly review so it stays that way when life changes: a move, a new signer, a new heir.</li>`;
      const extra = s.recs.length - top.length;
      $("[data-recs-more]").textContent =
        extra > 0 ? "Plus " + plural(extra, "smaller fix", "smaller fixes") + " we would cover in a review." : "";
    }
    function choose(qid, oi, focus) {
      answers[qid] = oi;
      write(KEYS.assessment, { answers: answers, saved: studioNow().date });
      render();
      if (focus) $(`[data-q="${qid}"][data-o="${oi}"]`, form).focus();
      const s = scoreAssessment(answers);
      if (s.answered === QUESTIONS.length && current !== "done") {
        current = "done";
        notice("Assessment complete: " + s.level.label + ", " + s.percent + " out of 100.");
      }
    }
    form.addEventListener("click", (e) => {
      const b = e.target.closest("[data-q]");
      if (b) choose(b.dataset.q, +b.dataset.o, false);
    });
    form.addEventListener("keydown", (e) => {
      const b = e.target.closest("[data-q]");
      if (!b) return;
      const q = QUESTIONS.find((x) => x.id === b.dataset.q);
      let i = +b.dataset.o;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") i = (i + 1) % q.options.length;
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") i = (i - 1 + q.options.length) % q.options.length;
      else return;
      e.preventDefault();
      choose(q.id, i, true);
    });
    $("[data-assessment-reset]").addEventListener("click", () => {
      answers = Object.create(null);
      current = "";
      write(KEYS.assessment, null);
      render();
      notice("Answers cleared.");
      $("[data-q]", form).focus();
    });
    if (scoreAssessment(answers).answered === QUESTIONS.length) current = "done";
    render();
  }

  /* ------------------------------------------------------------------
   * 15. Guides
   * ------------------------------------------------------------------ */
  function loadReadingList() {
    const raw = read(KEYS.readingList);
    if (!Array.isArray(raw)) return [];
    const ids = GUIDES.map((g) => g.id);
    return raw.filter((id, i) => typeof id === "string" && ids.indexOf(id) >= 0 && raw.indexOf(id) === i);
  }
  function initGuides() {
    const grid = $("[data-guide-grid]");
    if (!grid) return;
    const state = { topic: "all", level: "all", q: "" };
    const t = urlParam("topic");
    const l = urlParam("level");
    if (own(TOPICS, t)) state.topic = t;
    if (own(GUIDE_LEVELS, l)) state.level = l;
    state.q = cleanText(urlParam("q") || "", 60);
    let saved = loadReadingList();

    const topicBar = $("[data-topic-filter]");
    const levelBar = $("[data-level-filter]");
    const search = $("#guide-search");
    search.value = state.q;
    function chips(bar, map, key) {
      bar.innerHTML = [["all", key === "topic" ? "All topics" : "All levels"]]
        .concat(Object.keys(map).map((k) => [k, map[k]]))
        .map(
          ([k, label]) =>
            `<button type="button" class="chip" data-${key}="${k}" aria-pressed="${state[key] === k}">${label} <span class="font-mono text-xs opacity-80" data-chip-count></span></button>`,
        )
        .join("");
    }
    chips(topicBar, TOPICS, "topic");
    chips(levelBar, GUIDE_LEVELS, "level");

    grid.innerHTML = GUIDES.map(
      (g) => `<article id="guide-${g.id}" data-guide="${g.id}" class="flex min-w-0 scroll-mt-28 flex-col overflow-hidden rounded-3xl border border-line bg-parchment">
        ${guideArt(g)}
        <div class="flex flex-1 flex-col p-6">
          <p class="eyebrow text-juniper">${TOPICS[g.topic]} · ${GUIDE_LEVELS[g.level]} · ${g.minutes} min</p>
          <h3 class="mt-3 font-display text-xl leading-snug font-semibold">${escapeHtml(g.title)}</h3>
          <p class="mt-3 text-sm leading-relaxed text-bark-soft">${escapeHtml(g.summary)}</p>
          <details class="group mt-4 rounded-2xl bg-caliche px-4 py-3">
            <summary class="text-sm font-semibold">The checklist <span class="text-bark-soft">(${g.steps.length} steps)</span></summary>
            <ol class="mt-3 list-decimal space-y-2 pl-5 text-sm leading-relaxed">${g.steps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>
          </details>
          <div class="mt-auto pt-5"><button type="button" class="btn btn-ghost btn-sm w-full" data-save="${g.id}" aria-pressed="false">Save to reading list</button></div>
        </div></article>`,
    ).join("");

    function matches(g, ignore) {
      if (ignore !== "topic" && state.topic !== "all" && g.topic !== state.topic) return false;
      if (ignore !== "level" && state.level !== "all" && g.level !== state.level) return false;
      if (state.q) {
        const hay = (g.title + " " + g.summary + " " + g.steps.join(" ") + " " + TOPICS[g.topic]).toLowerCase();
        if (!state.q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.indexOf(w) >= 0)) return false;
      }
      return true;
    }
    function renderList() {
      const panel = $("[data-reading-list]");
      const items = saved.map((id) => GUIDES.find((g) => g.id === id));
      const mins = items.reduce((s, g) => s + g.minutes, 0);
      $$("[data-reading-count]").forEach((el) => {
        el.textContent = String(items.length);
      });
      $("[data-reading-summary]").textContent = items.length
        ? plural(items.length, "guide") + ", about " + plural(mins, "minute") + " of reading"
        : "Nothing saved yet. Save a guide and it waits here for later.";
      panel.innerHTML = items
        .map(
          (g) => `<li class="flex items-start justify-between gap-3 border-t border-line py-3 first:border-t-0">
            <a class="text-sm leading-snug hover:underline" href="#guide-${g.id}">${escapeHtml(g.title)}</a>
            <button type="button" class="shrink-0 rounded-full border border-line px-2.5 py-1 text-xs hover:border-bark" data-remove="${g.id}" aria-label="Remove ${escapeHtml(g.title)} from your reading list">Remove</button></li>`,
        )
        .join("");
      $("[data-clear-list]").hidden = !items.length;
    }
    function render() {
      let shown = 0;
      GUIDES.forEach((g) => {
        const el = $(`[data-guide="${g.id}"]`, grid);
        const ok = matches(g);
        el.hidden = !ok;
        if (ok) shown++;
        const btn = $("[data-save]", el);
        const on = saved.indexOf(g.id) >= 0;
        btn.setAttribute("aria-pressed", String(on));
        btn.textContent = on ? "Saved to reading list" : "Save to reading list";
      });
      $$("[data-topic]", topicBar).forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.topic === state.topic));
        const n = GUIDES.filter((g) => (b.dataset.topic === "all" || g.topic === b.dataset.topic) && matches(g, "topic")).length;
        $("[data-chip-count]", b).textContent = n;
      });
      $$("[data-level]", levelBar).forEach((b) => {
        b.setAttribute("aria-pressed", String(b.dataset.level === state.level));
        const n = GUIDES.filter((g) => (b.dataset.level === "all" || g.level === b.dataset.level) && matches(g, "level")).length;
        $("[data-chip-count]", b).textContent = n;
      });
      $("[data-guide-count]").textContent = shown === GUIDES.length ? "Showing all " + plural(shown, "guide") : "Showing " + shown + " of " + plural(GUIDES.length, "guide");
      $("[data-guide-empty]").hidden = shown > 0;
      renderList();
      const params = new URLSearchParams();
      if (state.topic !== "all") params.set("topic", state.topic);
      if (state.level !== "all") params.set("level", state.level);
      if (state.q) params.set("q", state.q);
      const qs = params.toString();
      try {
        history.replaceState(null, "", location.pathname + (qs ? "?" + qs : "") + location.hash);
      } catch (e) {
        /* sandboxed: the URL just doesn't update */
      }
    }
    function toggle(id) {
      const i = saved.indexOf(id);
      if (i >= 0) saved.splice(i, 1);
      else saved.push(id);
      write(KEYS.readingList, saved);
      const g = GUIDES.find((x) => x.id === id);
      notice((i >= 0 ? "Removed from" : "Saved to") + " your reading list: " + g.title + ".");
      render();
    }
    topicBar.addEventListener("click", (e) => {
      const b = e.target.closest("[data-topic]");
      if (!b) return;
      state.topic = b.dataset.topic;
      render();
    });
    levelBar.addEventListener("click", (e) => {
      const b = e.target.closest("[data-level]");
      if (!b) return;
      state.level = b.dataset.level;
      render();
    });
    search.addEventListener("input", () => {
      state.q = cleanText(search.value, 60);
      render();
    });
    $("[data-reset-filters]").addEventListener("click", () => {
      state.topic = "all";
      state.level = "all";
      state.q = "";
      search.value = "";
      render();
      search.focus();
    });
    grid.addEventListener("click", (e) => {
      const b = e.target.closest("[data-save]");
      if (b) toggle(b.dataset.save);
    });
    $("[data-reading-list]").addEventListener("click", (e) => {
      const b = e.target.closest("[data-remove]");
      if (!b) return;
      const list = $("[data-reading-list]");
      const idx = $$("[data-remove]", list).indexOf(b);
      toggle(b.dataset.remove);
      // Keep focus in the list: the next item's Remove, the previous one, or the heading.
      const left = $$("[data-remove]", list);
      (left[idx] || left[idx - 1] || $("#reading-title")).focus();
    });
    $("[data-clear-list]").addEventListener("click", () => {
      saved = [];
      write(KEYS.readingList, saved);
      notice("Reading list cleared.");
      render();
      $("#reading-title").focus();
    });
    render();
    // Open the checklist for a guide linked with #guide-<id>.
    const hash = location.hash.replace("#guide-", "");
    if (hash && GUIDES.some((g) => g.id === hash)) {
      const el = $(`[data-guide="${hash}"]`, grid);
      if (el.hidden) {
        state.topic = "all";
        state.level = "all";
        state.q = "";
        search.value = "";
        render();
      }
      $("details", el).open = true;
      el.scrollIntoView({ block: "start" });
    }
  }

  /* ------------------------------------------------------------------
   * 16. Teams: signer planner
   * ------------------------------------------------------------------ */
  function clonePreset(id) {
    const p = PRESETS[id];
    return { preset: id, threshold: p.threshold, keys: p.keys.map((k) => ({ holder: k.holder, location: k.location })) };
  }
  function loadPlan() {
    const raw = read(KEYS.signerPlan);
    if (!raw || typeof raw !== "object" || !Array.isArray(raw.keys)) return null;
    const keys = raw.keys
      .slice(0, MAX_KEYS)
      .filter((k) => k && typeof k === "object" && own(LOCATIONS, k.location))
      .map((k) => ({ holder: cleanText(k.holder, HOLDER_MAX) || "Unnamed", location: k.location }));
    if (!keys.length) return null;
    const threshold = Number.isInteger(raw.threshold) ? clamp(raw.threshold, 1, keys.length) : 1;
    return { preset: own(PRESETS, raw.preset) ? raw.preset : "", threshold: threshold, keys: keys };
  }
  // The numbers behind the planner, all from the plan alone.
  function analysePlan(plan) {
    const n = plan.keys.length;
    const m = plan.threshold;
    const bySite = {};
    const byHolder = {};
    plan.keys.forEach((k) => {
      bySite[k.location] = (bySite[k.location] || 0) + 1;
      const h = k.holder.trim().toLowerCase() || "unnamed";
      byHolder[h] = (byHolder[h] || 0) + 1;
    });
    const maxSite = Math.max(...Object.values(bySite));
    const maxHolder = Math.max(...Object.values(byHolder));
    const carried = bySite.carried || 0;
    const checks = [
      {
        id: "lose-one",
        pass: n - m >= 1,
        title: "Lose any one key",
        yes: "Still fine. Any " + plural(m, "key") + " of the remaining " + (n - 1) + " can sign.",
        no: "Funds are stuck. Every key is needed, so one lost device or backup ends it.",
      },
      {
        id: "steal-one",
        pass: m >= 2,
        title: "A thief takes any one key",
        yes: "Useless to them. They would need " + plural(m - 1, "more key") + " as well.",
        no: "They can move funds. One key is enough to sign.",
      },
      {
        id: "lose-site",
        pass: n - maxSite >= m,
        title: "A fire or flood at one place",
        yes: "Recoverable. No single place holds more than " + plural(maxSite, "key") + ".",
        no: "Funds are stuck. One place holds " + plural(maxSite, "key") + ", leaving fewer than " + m + ".",
      },
      {
        id: "break-in",
        pass: maxSite < m && carried < m,
        title: "A break-in or mugging at one place",
        yes: "Not enough to sign. The most any one place holds is " + plural(maxSite, "key") + ".",
        no: "Enough to sign. " + (carried >= m ? "Carried keys" : "One place") + " holds " + m + " or more.",
      },
      {
        id: "person-away",
        pass: n - maxHolder >= m,
        title: "One person is unavailable for good",
        yes: "Others can still sign without them.",
        no: "Nobody else can sign. One person holds " + plural(maxHolder, "key") + ", so the rest can’t reach " + m + ". A recovery plan matters here.",
      },
    ];
    const passed = checks.filter((c) => c.pass).length;
    const verdict =
      passed === 5
        ? { label: "Resilient", tone: "juniper", text: "No single loss, theft or absence breaks this vault." }
        : passed >= 3
          ? { label: "Mostly resilient", tone: "ochre", text: "Sound, with one or two single points of failure to plan around." }
          : { label: "Fragile", tone: "chile", text: "Ordinary bad luck could lock funds or hand them to someone else." };
    return {
      n: n,
      m: m,
      loseTolerance: n - m,
      stealTolerance: m - 1,
      soloSigner: maxHolder >= m,
      maxSite: maxSite,
      checks: checks,
      passed: passed,
      verdict: verdict,
    };
  }
  function ringDiagram(plan) {
    const n = plan.keys.length;
    const cx = 180;
    const cy = 180;
    const r = 122;
    const circ = 2 * Math.PI * 150;
    const arc = (plan.threshold / n) * circ;
    let s = `<svg viewBox="0 0 360 360" class="block h-auto w-full max-w-sm" role="img" aria-label="${plan.threshold} of ${n} keys needed to sign">`;
    for (let i = 98; i > 74; i -= 8) s += `<circle cx="${cx}" cy="${cy}" r="${i}" fill="none" stroke="#cfbca1" stroke-width="1.5"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="70" fill="#f4ece0"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="150" fill="none" stroke="#d9c2a3" stroke-width="10"/>`;
    s += `<circle cx="${cx}" cy="${cy}" r="150" fill="none" stroke="#1f5a52" stroke-width="10" stroke-linecap="round" stroke-dasharray="${arc.toFixed(1)} ${circ.toFixed(1)}" transform="rotate(-90 ${cx} ${cy})"/>`;
    s += `<text x="${cx}" y="${cy - 4}" text-anchor="middle" font-family="Besley, Georgia, serif" font-size="44" font-weight="700" fill="${INK}">${plan.threshold} of ${n}</text>`;
    s += `<text x="${cx}" y="${cy + 26}" text-anchor="middle" font-family="Radio Canada, sans-serif" font-size="14" fill="#5b4b3f">keys to sign</text>`;
    plan.keys.forEach((k, i) => {
      const a = (i / n) * 2 * Math.PI - Math.PI / 2;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      s += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="20" fill="${LOCATIONS[k.location].color}" stroke="#fbf7f0" stroke-width="4"/>`;
      s += `<text x="${x.toFixed(1)}" y="${(y + 5).toFixed(1)}" text-anchor="middle" font-family="Sometype Mono, monospace" font-size="15" font-weight="500" fill="#fbf7f0">${i + 1}</text>`;
    });
    return s + "</svg>";
  }
  function initTeams() {
    const root = $("[data-planner]");
    if (!root) return;
    const fromUrl = urlParam("preset");
    let plan = own(PRESETS, fromUrl) ? clonePreset(fromUrl) : loadPlan() || clonePreset("household");
    const keysEl = $("[data-keys]", root);
    const presetBar = $("[data-presets]", root);
    presetBar.innerHTML = Object.keys(PRESETS)
      .map((id) => `<button type="button" class="chip" data-preset="${id}" aria-pressed="false">${PRESETS[id].label}</button>`)
      .join("");
    const locOptions = (sel) =>
      Object.keys(LOCATIONS)
        .map((id) => `<option value="${id}"${id === sel ? " selected" : ""}>${LOCATIONS[id].label}</option>`)
        .join("");
    function renderKeys() {
      keysEl.innerHTML = plan.keys
        .map(
          (k, i) => `<li class="grid gap-3 rounded-2xl border border-line bg-parchment p-4 sm:grid-cols-[auto_1fr_1fr_auto] sm:items-end" data-key="${i}">
            <span class="flex size-9 items-center justify-center rounded-full font-mono text-sm text-parchment" style="background:${LOCATIONS[k.location].color}" aria-hidden="true">${i + 1}</span>
            <label class="label" for="holder-${i}">Key ${i + 1} holder<input id="holder-${i}" class="field" data-holder maxlength="${HOLDER_MAX}" value="${escapeHtml(k.holder)}" autocomplete="off" /></label>
            <label class="label" for="location-${i}">Kept at<select id="location-${i}" class="field" data-location>${locOptions(k.location)}</select></label>
            <button type="button" class="btn btn-ghost btn-sm" data-remove-key aria-label="Remove key ${i + 1}"${plan.keys.length === 1 ? " disabled" : ""}>Remove</button></li>`,
        )
        .join("");
    }
    function renderResult() {
      const a = analysePlan(plan);
      $("[data-threshold]", root).textContent = plan.threshold;
      $("[data-threshold-down]", root).disabled = plan.threshold <= 1;
      $("[data-threshold-up]", root).disabled = plan.threshold >= plan.keys.length;
      $("[data-add-key]", root).disabled = plan.keys.length >= MAX_KEYS;
      $("[data-key-total]", root).textContent = plural(plan.keys.length, "key");
      $$("[data-preset]", presetBar).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.preset === plan.preset)));
      $("[data-ring]").innerHTML = ringDiagram(plan);
      $("[data-lose]").textContent = a.loseTolerance;
      $("[data-lose-label]").textContent = a.loseTolerance === 1 ? "key can be lost" : "keys can be lost";
      $("[data-steal]").textContent = a.stealTolerance;
      $("[data-steal-label]").textContent = a.stealTolerance === 1 ? "key can be stolen safely" : "keys can be stolen safely";
      const v = $("[data-verdict]");
      v.textContent = a.verdict.label + " · " + a.passed + " of 5 checks";
      v.className = "rounded-full px-3 py-1 text-sm font-semibold " + { juniper: "bg-juniper text-parchment", ochre: "bg-ochre-soft text-bark", chile: "bg-chile text-parchment" }[a.verdict.tone];
      $("[data-verdict-text]").textContent =
        a.verdict.text + (a.soloSigner ? " One person can sign alone, which suits a personal vault but not a team." : "");
      $("[data-checks]").innerHTML = a.checks
        .map(
          (c) => `<li class="flex gap-3 border-t border-line py-4 first:border-t-0">
            <span class="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full ${c.pass ? "bg-juniper" : "bg-chile"} text-parchment" aria-hidden="true">${c.pass ? "✓" : "!"}</span>
            <div><p class="font-semibold">${c.title}<span class="sr-only">: ${c.pass ? "passes" : "fails"}</span></p><p class="mt-1 text-sm leading-relaxed text-bark-soft">${escapeHtml(c.pass ? c.yes : c.no)}</p></div></li>`,
        )
        .join("");
      const sites = {};
      plan.keys.forEach((k, i) => {
        (sites[k.location] = sites[k.location] || []).push(i + 1);
      });
      $("[data-legend]").innerHTML = Object.keys(sites)
        .map(
          (id) => `<li class="flex items-center gap-2"><span class="size-3 rounded-full" style="background:${LOCATIONS[id].color}" aria-hidden="true"></span>${LOCATIONS[id].label}: ${sites[id].length === 1 ? "key" : "keys"} ${listText(sites[id].map(String))}</li>`,
        )
        .join("");
      write(KEYS.signerPlan, plan);
    }
    function full() {
      renderKeys();
      renderResult();
    }
    presetBar.addEventListener("click", (e) => {
      const b = e.target.closest("[data-preset]");
      if (!b) return;
      plan = clonePreset(b.dataset.preset);
      full();
      notice("Loaded the " + PRESETS[b.dataset.preset].label + " example.");
    });
    $("[data-threshold-down]", root).addEventListener("click", () => {
      plan.threshold = clamp(plan.threshold - 1, 1, plan.keys.length);
      plan.preset = "";
      renderResult();
    });
    $("[data-threshold-up]", root).addEventListener("click", () => {
      plan.threshold = clamp(plan.threshold + 1, 1, plan.keys.length);
      plan.preset = "";
      renderResult();
    });
    $("[data-add-key]", root).addEventListener("click", () => {
      if (plan.keys.length >= MAX_KEYS) return;
      const used = plan.keys.map((k) => k.location);
      const loc = Object.keys(LOCATIONS).find((id) => used.indexOf(id) < 0) || "home";
      plan.keys.push({ holder: "New signer", location: loc });
      plan.preset = "";
      full();
      $("#holder-" + (plan.keys.length - 1)).focus();
    });
    keysEl.addEventListener("input", (e) => {
      const li = e.target.closest("[data-key]");
      if (!li || !e.target.matches("[data-holder]")) return;
      plan.keys[+li.dataset.key].holder = cleanText(e.target.value, HOLDER_MAX) || "Unnamed";
      plan.preset = "";
      renderResult();
    });
    keysEl.addEventListener("change", (e) => {
      const li = e.target.closest("[data-key]");
      if (!li || !e.target.matches("[data-location]") || !own(LOCATIONS, e.target.value)) return;
      plan.keys[+li.dataset.key].location = e.target.value;
      plan.preset = "";
      const id = e.target.id;
      full();
      $("#" + id).focus();
    });
    keysEl.addEventListener("click", (e) => {
      const b = e.target.closest("[data-remove-key]");
      if (!b || plan.keys.length === 1) return;
      const i = +b.closest("[data-key]").dataset.key;
      plan.keys.splice(i, 1);
      plan.threshold = clamp(plan.threshold, 1, plan.keys.length);
      plan.preset = "";
      full();
      const next = $$("[data-remove-key]", keysEl)[Math.min(i, plan.keys.length - 1)];
      (next && !next.disabled ? next : $("[data-add-key]", root)).focus();
      notice("Key " + (i + 1) + " removed. The others were renumbered.");
    });
    full();
  }

  /* ------------------------------------------------------------------
   * 17. Pricing: quote builder
   * ------------------------------------------------------------------ */
  function defaultQuote(plan) {
    const p = PLANS[plan];
    return { plan: plan, devices: p.includedDevices, signers: p.includedSigners, recovery: "letter", travel: "local", care: p.care > 0 };
  }
  function loadQuote() {
    const raw = read(KEYS.quote);
    if (!raw || typeof raw !== "object" || !own(PLANS, raw.plan)) return null;
    const q = defaultQuote(raw.plan);
    if (Number.isInteger(raw.devices)) q.devices = clamp(raw.devices, QUOTE_LIMITS.devices[0], QUOTE_LIMITS.devices[1]);
    if (Number.isInteger(raw.signers)) q.signers = clamp(raw.signers, QUOTE_LIMITS.signers[0], QUOTE_LIMITS.signers[1]);
    if (own(RECOVERY_PLANS, raw.recovery)) q.recovery = raw.recovery;
    if (own(TRAVEL_ZONES, raw.travel)) q.travel = raw.travel;
    q.care = raw.care === true && PLANS[q.plan].care > 0;
    return q;
  }
  // { lines: [[label, amount]], once, yearly, atCost }
  function priceQuote(q) {
    const p = PLANS[q.plan];
    const lines = [[p.label + " (includes " + plural(p.includedDevices, "device") + ", " + plural(p.includedSigners, "signer") + ")", p.price]];
    const extraDevices = Math.max(0, q.devices - p.includedDevices);
    const extraSigners = Math.max(0, q.signers - p.includedSigners);
    if (extraDevices) lines.push([plural(extraDevices, "extra device") + " × " + price(p.extraDevice), extraDevices * p.extraDevice]);
    if (extraSigners) lines.push([plural(extraSigners, "extra signer") + " × " + price(p.extraSigner), extraSigners * p.extraSigner]);
    if (RECOVERY_PLANS[q.recovery].price) lines.push([RECOVERY_PLANS[q.recovery].label, RECOVERY_PLANS[q.recovery].price]);
    const zone = TRAVEL_ZONES[q.travel];
    if (zone.price) lines.push(["Key ceremony travel: " + zone.label, zone.price]);
    const once = lines.reduce((s, l) => s + l[1], 0);
    return { lines: lines, once: once, yearly: q.care ? p.care : 0, atCost: !!zone.travelAtCost };
  }
  function quoteSummary(q) {
    const t = priceQuote(q);
    return (
      PLANS[q.plan].label + ", " + plural(q.devices, "device") + ", " + plural(q.signers, "signer") + ": " + price(t.once) +
      (t.yearly ? " plus " + price(t.yearly) + " a year for care" : "")
    );
  }
  function initPricing() {
    const form = $("[data-quote]");
    if (!form) return;
    const fromUrl = urlParam("plan");
    let q = own(PLANS, fromUrl) ? Object.assign(loadQuote() || {}, defaultQuote(fromUrl)) : loadQuote() || defaultQuote("household");
    $("#quote-recovery").innerHTML = Object.keys(RECOVERY_PLANS)
      .map((id) => `<option value="${id}">${RECOVERY_PLANS[id].label}${RECOVERY_PLANS[id].price ? " (+" + price(RECOVERY_PLANS[id].price) + ")" : ""}</option>`)
      .join("");
    $("#quote-travel").innerHTML = Object.keys(TRAVEL_ZONES)
      .map((id) => `<option value="${id}">${TRAVEL_ZONES[id].label}${TRAVEL_ZONES[id].price ? " (+" + price(TRAVEL_ZONES[id].price) + ")" : ""}</option>`)
      .join("");
    $$("[data-plan-price]").forEach((el) => {
      if (own(PLANS, el.dataset.planPrice)) el.textContent = price(PLANS[el.dataset.planPrice].price);
    });
    function render() {
      const p = PLANS[q.plan];
      $$("[data-plan-choice]", form).forEach((b) => b.setAttribute("aria-checked", String(b.dataset.planChoice === q.plan)));
      $$("[data-plan-card]").forEach((c) => c.classList.toggle("ring-2", c.dataset.planCard === q.plan));
      $("[data-devices]").textContent = q.devices;
      $("[data-signers]").textContent = q.signers;
      $("[data-devices-note]").textContent = p.includedDevices + " included, then " + price(p.extraDevice) + " each";
      $("[data-signers-note]").textContent = p.includedSigners + " included, then " + price(p.extraSigner) + " each";
      $$("[data-step]", form).forEach((b) => {
        const [field, dir] = b.dataset.step.split(":");
        const lim = QUOTE_LIMITS[field];
        b.disabled = dir === "-" ? q[field] <= lim[0] : q[field] >= lim[1];
      });
      $("#quote-recovery").value = q.recovery;
      $("#quote-travel").value = q.travel;
      const care = $("#quote-care");
      care.checked = q.care;
      care.disabled = p.care === 0;
      $("[data-care-note]").textContent = p.care
        ? price(p.care) + " a year: an annual review, a restore drill reminder each quarter and priority calls."
        : "Care plans come with a vault setup.";
      const t = priceQuote(q);
      $("[data-quote-lines]").innerHTML = t.lines
        .map((l) => `<li class="flex justify-between gap-4 border-t border-caliche/20 py-2.5 first:border-t-0"><span>${escapeHtml(l[0])}</span><span class="shrink-0 font-mono">${price(l[1])}</span></li>`)
        .join("");
      $("[data-quote-once]").textContent = price(t.once);
      $("[data-quote-yearly]").textContent = t.yearly ? "Then " + price(t.yearly) + " a year for the care plan." : "No yearly fee.";
      $("[data-quote-atcost]").hidden = !t.atCost;
      write(KEYS.quote, q);
    }
    form.addEventListener("submit", (e) => e.preventDefault());
    form.addEventListener("click", (e) => {
      const plan = e.target.closest("[data-plan-choice]");
      if (plan && own(PLANS, plan.dataset.planChoice)) {
        const keep = { recovery: q.recovery, travel: q.travel };
        q = Object.assign(defaultQuote(plan.dataset.planChoice), keep);
        render();
        return;
      }
      const step = e.target.closest("[data-step]");
      if (step) {
        const [field, dir] = step.dataset.step.split(":");
        const lim = QUOTE_LIMITS[field];
        q[field] = clamp(q[field] + (dir === "-" ? -1 : 1), lim[0], lim[1]);
        render();
      }
    });
    form.addEventListener("keydown", (e) => {
      const b = e.target.closest("[data-plan-choice]");
      if (!b || ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].indexOf(e.key) < 0) return;
      e.preventDefault();
      const ids = Object.keys(PLANS);
      const i = (ids.indexOf(q.plan) + (e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1) + ids.length) % ids.length;
      q = Object.assign(defaultQuote(ids[i]), { recovery: q.recovery, travel: q.travel });
      render();
      $(`[data-plan-choice="${ids[i]}"]`, form).focus();
    });
    form.addEventListener("change", (e) => {
      if (e.target.id === "quote-recovery" && own(RECOVERY_PLANS, e.target.value)) q.recovery = e.target.value;
      if (e.target.id === "quote-travel" && own(TRAVEL_ZONES, e.target.value)) q.travel = e.target.value;
      if (e.target.id === "quote-care") q.care = e.target.checked && PLANS[q.plan].care > 0;
      render();
    });
    $$("[data-pick-plan]").forEach((a) =>
      a.addEventListener("click", (e) => {
        const id = a.dataset.pickPlan;
        if (!own(PLANS, id)) return;
        e.preventDefault();
        q = Object.assign(defaultQuote(id), { recovery: q.recovery, travel: q.travel });
        render();
        $("#quote").scrollIntoView({ block: "start" });
        $(`[data-plan-choice="${id}"]`, form).focus({ preventScroll: true });
      }),
    );
    render();
  }

  /* ------------------------------------------------------------------
   * 18. Field notes
   * ------------------------------------------------------------------ */
  function initNotes() {
    const list = $("[data-notes]");
    if (!list) return;
    const notes = datedNotes();
    const bar = $("[data-note-filter]");
    let type = own(NOTE_TYPES, urlParam("type")) ? urlParam("type") : "all";
    bar.innerHTML = [["all", "Everything"]]
      .concat(Object.keys(NOTE_TYPES).map((k) => [k, NOTE_TYPES[k] + "s"]))
      .map(([k, label]) => {
        const n = k === "all" ? notes.length : notes.filter((x) => x.type === k).length;
        return `<button type="button" class="chip" data-type="${k}" aria-pressed="false">${label} <span class="font-mono text-xs opacity-80">${n}</span></button>`;
      })
      .join("");
    list.innerHTML = notes
      .map(
        (n) => `<li id="note-${n.id}" data-note-type="${n.type}" class="reveal grid scroll-mt-28 gap-3 border-t border-line py-8 md:grid-cols-[11rem_1fr]">
          <div><time class="font-mono text-sm" datetime="${n.date}">${fmtDate(n.date, { month: "short", day: "numeric", year: "numeric" })}</time>
          <p class="mt-1 text-xs text-bark-soft">${NOTE_TYPES[n.type]}</p></div>
          <article><div class="flex flex-wrap items-center gap-2">${severityBadge(n)}</div>
          <h3 class="mt-2 font-display text-2xl leading-snug font-semibold">${escapeHtml(n.title)}</h3>
          <p class="mt-3 max-w-3xl leading-relaxed text-bark-soft">${escapeHtml(n.summary)}</p>
          <p class="mt-3 text-sm">${escapeHtml(n.author)}</p></article></li>`,
      )
      .join("");
    function render() {
      $$("[data-type]", bar).forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.type === type)));
      let shown = 0;
      $$("[data-note-type]", list).forEach((li) => {
        li.hidden = type !== "all" && li.dataset.noteType !== type;
        if (!li.hidden) shown++;
      });
      $("[data-note-count]").textContent = plural(shown, "note");
    }
    bar.addEventListener("click", (e) => {
      const b = e.target.closest("[data-type]");
      if (!b) return;
      type = b.dataset.type;
      render();
    });
    render();
    reveal(list);
    const newest = notes[0];
    $$("[data-newest-note]").forEach((el) => {
      el.textContent = fmtDate(newest.date, { month: "long", day: "numeric", year: "numeric" });
      el.setAttribute("datetime", newest.date);
    });
    // Office hours: the second Thursday of each month at 4 PM, skipping holidays.
    const oh = $("[data-office-hours]");
    if (oh) {
      const now = studioNow();
      let y = +now.date.slice(0, 4);
      let m = +now.date.slice(5, 7);
      let next = null;
      for (let i = 0; i < 14 && !next; i++) {
        const d = nthWeekday(y, m, 4, 2);
        if ((d > now.date || (d === now.date && now.mins < 16 * 60)) && isWorkday(d)) next = d;
        m++;
        if (m > 12) {
          m = 1;
          y++;
        }
      }
      oh.textContent = fmtDate(next, { weekday: "long", month: "long", day: "numeric" }) + " at 4:00 PM";
    }
    const sub = $("[data-subscribe]");
    if (sub) {
      sub.addEventListener("submit", (e) => {
        e.preventDefault();
        const input = $("#sub-email", sub);
        const err = $("#sub-email-error", sub);
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim());
        input.setAttribute("aria-invalid", String(!ok));
        err.textContent = ok ? "" : "Enter an email address like name@example.com.";
        if (!ok) {
          input.focus();
          return;
        }
        // Connect a real list provider here; show the success state only when it answers OK.
        sub.hidden = true;
        const done = $("[data-subscribe-done]");
        done.hidden = false;
        done.focus();
      });
    }
  }

  /* ------------------------------------------------------------------
   * 19. Company
   * ------------------------------------------------------------------ */
  function initCompany() {
    const people = $("[data-people]");
    if (people) {
      people.innerHTML = PEOPLE.map(
        (p) => `<article class="reveal min-w-0"><div class="arch border border-line">${portrait(p)}</div>
          <h3 class="mt-5 font-display text-xl font-semibold">${escapeHtml(p.name)}</h3>
          <p class="eyebrow mt-1 text-juniper">${escapeHtml(p.role)}</p>
          <p class="mt-3 text-sm leading-relaxed text-bark-soft">${escapeHtml(p.bio)}</p></article>`,
      ).join("");
      reveal(people);
    }
    const hours = $("[data-hours]");
    if (hours) {
      const now = studioNow();
      const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const order = [1, 2, 3, 4, 5, 6, 0];
      hours.innerHTML = order
        .map((d) => {
          const h = HOURS[d];
          const today = d === now.day;
          return `<tr class="border-t border-line${today ? " bg-sky/60 font-semibold" : ""}"><th scope="row" class="py-2.5 pl-3 text-left font-normal${today ? " font-semibold" : ""}">${names[d]}${today ? ' <span class="text-xs text-juniper">(today)</span>' : ""}</th>
            <td class="py-2.5 pr-3 text-right">${h ? clock(toMins(h[0])) + " – " + clock(toMins(h[1])) : d === 6 ? "Key ceremonies by arrangement" : "Closed"}</td></tr>`;
        })
        .join("");
      const st = studioStatus();
      const badge = $("[data-open-badge]");
      badge.textContent = st.text;
      badge.className = "inline-flex rounded-full px-3 py-1 text-sm font-semibold " + (st.open ? "bg-juniper text-parchment" : "bg-adobe text-bark");
      const closures = upcomingClosures(now.date, 4);
      $("[data-closures]").innerHTML = closures
        .map((c) => `<li class="flex justify-between gap-4 border-t border-line py-2 first:border-t-0"><span>${escapeHtml(c.label)}</span><time datetime="${c.date}" class="font-mono text-sm">${fmtDate(c.date, { weekday: "short", month: "short", day: "numeric" })}</time></li>`)
        .join("");
    }
  }

  /* ------------------------------------------------------------------
   * 20. Contact: booking request
   * ------------------------------------------------------------------ */
  // Looks for something that could be a secret: a run of 12 or more plain words with no
  // everyday English filler (how recovery phrases look), a 64-character hex key, or a long
  // extended key. Returns a reason, or '' when the text looks like ordinary prose.
  const FILLER = new Set(
    "a an and are as at be but by for from had has have he her his i if in is it its me my no not of on or our she so that the their them they this to us was we were what when where which who will with you your".split(
      " ",
    ),
  );
  function looksSecret(text) {
    if (/\b[0-9a-f]{64}\b/i.test(text)) return "a private key";
    if (/\b[xyzt](prv|pub)[1-9A-HJ-NP-Za-km-z]{60,}\b/.test(text)) return "an extended key";
    const words = text
      .toLowerCase()
      .replace(/\b\d{1,2}[.):]/g, " ")
      .split(/[\s,;]+/)
      .filter(Boolean);
    let run = 0;
    for (const w of words) {
      if (/^[a-z]{3,8}$/.test(w) && !FILLER.has(w)) {
        run++;
        if (run >= 12) return "a recovery phrase";
      } else run = 0;
    }
    return "";
  }
  function initContact() {
    const form = $("[data-booking]");
    if (!form) return;
    const days = callDays();
    let day = days.length ? days[0].date : "";
    let slot = "";
    const dayBar = $("[data-days]", form);
    const slotBar = $("[data-slots]", form);
    const zone = visitorZone();

    $("#booking-service").innerHTML =
      '<option value="">Choose one</option>' +
      Object.keys(SERVICES).map((id) => `<option value="${id}">${SERVICES[id]}</option>`).join("");
    const want = urlParam("service");
    if (own(SERVICES, want)) $("#booking-service").value = want;

    // Attach a saved assessment result or quote, if the visitor has one.
    const answers = loadAnswers();
    const sc = scoreAssessment(answers);
    const quote = loadQuote();
    const attach = [];
    if (sc.answered === QUESTIONS.length) attach.push(["assessment", "My readiness result: " + sc.level.label + ", " + sc.percent + " out of 100"]);
    if (quote) attach.push(["quote", "My quote: " + quoteSummary(quote)]);
    const attachBox = $("[data-attach]", form);
    attachBox.hidden = !attach.length;
    $("[data-attach-list]", form).innerHTML = attach
      .map(
        ([id, label]) => `<label class="flex items-start gap-3 text-sm leading-relaxed"><input type="checkbox" name="attach" value="${id}" checked class="mt-1 size-4 accent-[#1f5a52]" /><span>${escapeHtml(label)}</span></label>`,
      )
      .join("");

    function renderDays() {
      dayBar.innerHTML = days
        .map((d) => {
          const free = d.slots.filter((s) => !s.taken).length;
          return `<button type="button" class="chip flex-col items-start rounded-2xl px-3 py-2 text-left" data-day="${d.date}" aria-pressed="${d.date === day}"${free ? "" : " disabled"}>
            <span class="text-xs">${fmtDate(d.date, { weekday: "short" })}</span><span class="font-semibold">${fmtDate(d.date, { month: "short", day: "numeric" })}</span><span class="text-xs">${free ? plural(free, "time") : "Full"}</span></button>`;
        })
        .join("");
      const d = days.find((x) => x.date === day);
      slotBar.innerHTML = d
        ? d.slots
            .map(
              (s) => `<button type="button" class="chip justify-center" data-slot="${s.time}" aria-pressed="${s.time === slot}"${s.taken ? ' disabled aria-label="' + clock(toMins(s.time)) + ', taken"' : ""}>${clock(toMins(s.time))}</button>`,
            )
            .join("")
        : "";
      const chosen = $("[data-slot-chosen]", form);
      if (slot) {
        let local = "";
        if (zone !== TIMEZONE) {
          const at = new Date(studioInstant(day, slot));
          local =
            " That’s " +
            new Intl.DateTimeFormat(LOCALE, { timeZone: zone, weekday: "short", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(at) +
            " where you are.";
        }
        chosen.textContent = slotLabel(day, slot) + " Mountain Time, " + BOOKING.minutes + " minutes." + local;
      } else chosen.textContent = "No time chosen yet.";
    }
    dayBar.addEventListener("click", (e) => {
      const b = e.target.closest("[data-day]");
      if (!b || b.disabled) return;
      day = b.dataset.day;
      slot = "";
      renderDays();
      $(`[data-day="${day}"]`, dayBar).focus();
    });
    slotBar.addEventListener("click", (e) => {
      const b = e.target.closest("[data-slot]");
      if (!b || b.disabled) return;
      slot = b.dataset.slot;
      renderDays();
      showError("slot", "");
      $(`[data-slot="${slot}"]`, slotBar).focus();
    });
    renderDays();

    const message = $("#booking-message");
    const counter = $("[data-message-count]", form);
    message.addEventListener("input", () => {
      const left = BOOKING.messageMax - message.value.length;
      counter.textContent = plural(Math.max(0, left), "character") + " left";
    });

    function showError(name, text) {
      const el = $("#booking-" + name + "-error");
      const input = $("#booking-" + name);
      if (el) el.textContent = text;
      if (input) input.setAttribute("aria-invalid", String(!!text));
    }
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const data = {
        name: cleanText($("#booking-name").value, 80),
        email: cleanText($("#booking-email").value, 120),
        phone: cleanText($("#booking-phone").value, 30),
        audience: (form.querySelector('input[name="audience"]:checked') || {}).value || "",
        service: $("#booking-service").value,
        message: cleanText(message.value, BOOKING.messageMax),
      };
      const errors = {};
      if (data.name.length < 2) errors.name = "Tell us your name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(data.email)) errors.email = "Enter an email address like name@example.com.";
      if (data.phone && data.phone.replace(/\D/g, "").length < 10) errors.phone = "Enter a 10-digit phone number, or leave it blank.";
      if (!own(AUDIENCES, data.audience)) errors.audience = "Choose who the setup is for.";
      if (!own(SERVICES, data.service)) errors.service = "Choose what you would like help with.";
      if (!slot) errors.slot = "Choose a day and a time for the call.";
      const secret = looksSecret(data.message);
      if (secret)
        errors.message =
          "This looks like it could contain " + secret + ". Please delete it. We never need it, and nobody at Cipheroak will ever ask for it.";
      ["name", "email", "phone", "audience", "service", "slot", "message"].forEach((k) => showError(k, errors[k] || ""));
      const first = ["name", "email", "phone", "audience", "service", "slot", "message"].find((k) => errors[k]);
      const summary = $("[data-form-summary]", form);
      if (first) {
        const n = Object.keys(errors).length;
        summary.hidden = false;
        summary.textContent = "Please fix " + plural(n, "thing") + " below.";
        const target = first === "slot" ? $("[data-day]", dayBar) : first === "audience" ? $('input[name="audience"]', form) : $("#booking-" + first);
        if (target) target.focus();
        return;
      }
      summary.hidden = true;
      // To connect a real endpoint (for example Formspree), send the fields with fetch():
      //   fetch('https://formspree.io/f/your-id', { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
      // and show the success state below only when the response is OK.
      const now = studioNow();
      const ref = "CO-" + now.date.slice(2).replace(/-/g, "") + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      const done = $("[data-booking-done]");
      $("[data-done-name]", done).textContent = data.name.split(/\s+/)[0];
      $("[data-done-ref]", done).textContent = ref;
      $("[data-done-slot]", done).textContent = slotLabel(day, slot) + " Mountain Time";
      $("[data-done-email]", done).textContent = data.email;
      $("[data-done-service]", done).textContent = SERVICES[data.service];
      form.hidden = true;
      done.hidden = false;
      done.focus();
      window.scrollTo({ top: done.getBoundingClientRect().top + window.scrollY - 120 });
    });
  }

  /* Boot */
  initChrome();
  const page = document.body.dataset.page;
  if (page === "index") initHome();
  if (page === "assessment") initAssessment();
  if (page === "guides") initGuides();
  if (page === "teams") initTeams();
  if (page === "pricing") initPricing();
  if (page === "notes") initNotes();
  if (page === "company") initCompany();
  if (page === "contact") initContact();
  if (page === "404") initHome();
  reveal(document);
})();
